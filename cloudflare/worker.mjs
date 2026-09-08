const NETWORK = 'testnet-10';
const CONTAINER_NAME = 'v6-shared';
const BRIDGE_PATH = '/internal/v6/state';
const V6_PATH = /^\/api\/v6\/(start|status|action)$/;
const EVENTS_PATH = '/api/v6/events';
const MAX_REQUEST_BYTES = 64 * 1024;
const MAX_STATE_BYTES = 16 * 1024 * 1024;
const MAX_BRIDGE_BODY_BYTES = MAX_STATE_BYTES + 1024 * 1024;
const MAX_LEASES_PER_MONTH = 40;
const ROLLING_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const LEASE_MS = 30 * 60 * 1000;
const LEASE_GRACE_MS = 30 * 1000;
const STATE_CHUNK_BYTES = 96 * 1024;
const LIMITS = Object.freeze({ipMinute: 180, globalMinute: 600, globalDay: 6000, sessionDay: 1000});
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CAPABILITY = /^[0-9a-f]{64}$/i;

const json = (body, status = 200, headers = {}) => Response.json(body, {
  status,
  headers: {'Cache-Control': 'no-store', ...headers},
});

function textBytes(value) {
  return new TextEncoder().encode(value).byteLength;
}

function constantTimeEqual(expected, actual) {
  if (typeof expected !== 'string' || typeof actual !== 'string') return false;
  const left = new TextEncoder().encode(expected);
  const right = new TextEncoder().encode(actual);
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;
  for (let index = 0; index < length; index++) difference |= (left[index] || 0) ^ (right[index] || 0);
  return difference === 0;
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function bearer(header) {
  if (typeof header !== 'string') return null;
  const match = /^Bearer\s+([^\s]+)$/i.exec(header.trim());
  return match?.[1] || null;
}

function bridgeAuthorized(request, environment) {
  const token = bearer(request.headers.get('Authorization'));
  return Boolean(environment.V6_STATE_BRIDGE_TOKEN)
    && constantTimeEqual(environment.V6_STATE_BRIDGE_TOKEN, token || '')
    // A browser request cannot use the private state bridge. The container's
    // outbound fetch has no Origin header; the bearer remains the authority.
    && !request.headers.has('Origin');
}

function configuredOrigins(environment) {
  const canonical = String(environment.V6_PUBLIC_ORIGIN || '').trim();
  return new Set(canonical ? [canonical] : []);
}

function allowedOrigin(request, environment) {
  const origin = request.headers.get('Origin');
  const origins = configuredOrigins(environment);
  if (origin) return origins.has(origin) ? origin : null;
  const url = new URL(request.url);
  // Browsers omit Origin on same-origin EventSource GETs. Fetch Metadata and
  // the exact destination origin admit that request without allowing a
  // cross-site stream or weakening POST origin checks.
  return request.method === 'GET' && url.pathname === EVENTS_PATH
    && request.headers.get('Sec-Fetch-Site') === 'same-origin'
    && origins.has(url.origin) ? url.origin : null;
}

function corsHeaders(origin) {
  return origin ? {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  } : {};
}

async function boundedBytes(request, limit) {
  const announced = Number(request.headers.get('Content-Length') || 0);
  if (Number.isFinite(announced) && announced > limit) return null;
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    for (;;) {
      const {done, value} = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  return result;
}

async function requestWithBody(request, bytes) {
  const headers = new Headers(request.headers);
  headers.delete('Content-Length');
  return new Request(request, {body: bytes, headers});
}

async function readJsonRequest(request, limit) {
  const bytes = await boundedBytes(request, limit);
  if (!bytes) throw Object.assign(new Error('Request body is too large.'), {status: 413});
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw Object.assign(new Error('Request body must be valid JSON.'), {status: 400}); }
}

function recordsText(records) {
  if (!records || typeof records !== 'object' || Array.isArray(records)) {
    throw Object.assign(new Error('State records must be a JSON object.'), {status: 400});
  }
  let text;
  try { text = JSON.stringify(records); } catch { throw Object.assign(new Error('State records must be JSON serializable.'), {status: 400}); }
  if (typeof text !== 'string' || textBytes(text) > MAX_STATE_BYTES) {
    throw Object.assign(new Error('The shared V6 state is too large.'), {status: 413});
  }
  // Parse once more so the DO never keeps a caller-owned prototype or value.
  try { JSON.parse(text); } catch { throw Object.assign(new Error('State records must be valid JSON.'), {status: 400}); }
  return text;
}

function splitUtf8(text) {
  const chunks = [];
  let start = 0;
  let size = 0;
  for (let index = 0; index < text.length;) {
    const codePoint = text.codePointAt(index);
    const character = String.fromCodePoint(codePoint);
    const bytes = textBytes(character);
    if (size && size + bytes > STATE_CHUNK_BYTES) {
      chunks.push(text.slice(start, index));
      start = index;
      size = 0;
    }
    size += bytes;
    index += character.length;
  }
  chunks.push(text.slice(start));
  return chunks;
}

function invalidRevision(value) {
  return !Number.isSafeInteger(value) || value < 0;
}

function leaseResponse(code = 'lease_expired', message = 'The V6 container lease has ended. Start a new session to continue.') {
  return json({error: message, code}, 503);
}

export function createV6ContainerClass(Container) {
return class V6Container extends Container {
  defaultPort = 8080;
  sleepAfter = '60s';
  pingEndpoint = 'container/health';
  enableInternet = true;

  constructor(ctx, environment) {
    super(ctx, environment);
    this.environment = environment;
    this.lifecycleTail = Promise.resolve();
    this.liveLeaseId = null;
    this.startingLeaseId = null;
    this.stoppingLeaseId = null;
    // Keep the signer and bridge credentials in the container environment only
    // at start time. They are never part of an image layer or a client request.
    this.envVars = {
      V6_TREASURY_KEY: String(environment.V6_TREASURY_KEY || ''),
      V6_STATE_BRIDGE_URL: String(environment.V6_STATE_BRIDGE_URL || ''),
      V6_STATE_BRIDGE_TOKEN: String(environment.V6_STATE_BRIDGE_TOKEN || ''),
      V6_PROXY_TOKEN: String(environment.V6_PROXY_TOKEN || ''),
      V6_PUBLIC_ORIGIN: String(environment.V6_PUBLIC_ORIGIN || ''),
      V6_PORT: '8080',
      PORT: '8080',
      V6_LEASE_MS: String(LEASE_MS),
    };
    // Do not put this behind blockConcurrencyWhile: the running Node process
    // calls BRIDGE_PATH back through the Worker while a container request is
    // awaiting its response.
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS v6_state_meta (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        revision INTEGER NOT NULL,
        chunk_count INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS v6_state_chunks (
        chunk_index INTEGER PRIMARY KEY,
        data TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS v6_lease_log (
        lease_id TEXT PRIMARY KEY,
        started_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        status TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS v6_lease (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        lease_id TEXT NOT NULL,
        started_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        status TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS v6_request_budget (
        bucket TEXT NOT NULL,
        subject TEXT NOT NULL,
        count INTEGER NOT NULL,
        PRIMARY KEY (bucket, subject)
      );
      INSERT OR IGNORE INTO v6_state_meta (id, revision, chunk_count, updated_at) VALUES (1, 0, 0, 0);
    `);
  }

  leaseRow() {
    return this.ctx.storage.sql.exec('SELECT * FROM v6_lease WHERE id = 1').toArray()[0] || null;
  }

  activeLease(now = Date.now()) {
    const row = this.leaseRow();
    if (!row || row.status !== 'active' || Number(row.expires_at) <= now) return null;
    return {
      id: row.lease_id,
      startedAt: Number(row.started_at),
      expiresAt: Number(row.expires_at),
    };
  }

  async stopExpiredLease(now = Date.now()) {
    let expired = false;
    this.ctx.storage.transactionSync(() => {
      const row = this.leaseRow();
      if (row?.status === 'active' && Number(row.expires_at) <= now) {
        this.ctx.storage.sql.exec('UPDATE v6_lease SET status = ? WHERE id = 1', 'expired');
        expired = true;
      }
    });
    if (expired) {
      // This is deliberately best effort. The durable row is already expired,
      // so a late request cannot cause the process to start again.
      try { await this.destroy(); } catch { /* already destroyed */ }
    }
    return expired;
  }

  async reserveLease({allowRestart = false, now = Date.now()} = {}) {
    let decision;
    this.ctx.storage.transactionSync(() => {
      const current = this.leaseRow();
      if (current?.status === 'active' && Number(current.expires_at) > now) {
        decision = {ok: true, lease: {
          id: current.lease_id,
          startedAt: Number(current.started_at),
          expiresAt: Number(current.expires_at),
        }, existing: true};
        return;
      }
      if (current?.status === 'active' && Number(current.expires_at) <= now) {
        this.ctx.storage.sql.exec('UPDATE v6_lease SET status = ? WHERE id = 1', 'expired');
      }
      if (!allowRestart) {
        decision = {ok: false, code: 'lease_expired'};
        return;
      }
      const cutoff = now - ROLLING_WINDOW_MS;
      this.ctx.storage.sql.exec('DELETE FROM v6_lease_log WHERE started_at <= ?', cutoff);
      const used = Number(this.ctx.storage.sql.exec('SELECT COUNT(*) AS count FROM v6_lease_log WHERE started_at > ?', cutoff).toArray()[0]?.count || 0);
      if (!Number.isSafeInteger(used) || used >= MAX_LEASES_PER_MONTH) {
        decision = {ok: false, code: 'monthly_budget_exhausted'};
        return;
      }
      const lease = {
        id: `${now}:${crypto.randomUUID()}`,
        startedAt: now,
        expiresAt: now + LEASE_MS,
      };
      this.ctx.storage.sql.exec(
        'INSERT INTO v6_lease_log (lease_id, started_at, expires_at, status) VALUES (?, ?, ?, ?)',
        lease.id,
        lease.startedAt,
        lease.expiresAt,
        'reserved',
      );
      this.ctx.storage.sql.exec(
        'INSERT OR REPLACE INTO v6_lease (id, lease_id, started_at, expires_at, status) VALUES (1, ?, ?, ?, ?)',
        lease.id,
        lease.startedAt,
        lease.expiresAt,
        'active',
      );
      decision = {ok: true, lease, existing: false};
    });
    if (!decision?.ok) return decision || {ok: false, code: 'lease_unavailable'};
    await this.schedule(new Date(decision.lease.expiresAt), 'expireLeaseAlarm', decision.lease.id);
    return decision;
  }

  withLifecycle(task) {
    const result = this.lifecycleTail.then(task, task);
    this.lifecycleTail = result.catch(() => {});
    return result;
  }

  markLeaseStopped(leaseId) {
    if (!leaseId) return;
    this.ctx.storage.sql.exec(
      "UPDATE v6_lease SET status = 'stopped' WHERE id = 1 AND lease_id = ? AND status = 'active'",
      leaseId,
    );
  }

  async savedSessionAuthorization(request) {
    let body;
    try { body = await request.clone().json(); } catch { return {valid: false, exists: false, eligible: false}; }
    if (!body || typeof body !== 'object' || Array.isArray(body) || !UUID.test(body.id || '') || !CAPABILITY.test(body.capability || '')) {
      return {valid: false, exists: false, eligible: false};
    }
    let session;
    try { session = this.stateSnapshot().records[`v6:session:${body.id}`]; }
    catch { return {valid: false, exists: true, eligible: true}; }
    if (!session) return {valid: false, exists: false, eligible: true};
    const supplied = await sha256Hex(body.capability);
    return {valid: constantTimeEqual(String(session.capHash || '').toLowerCase(), supplied), exists: true, eligible: true};
  }

  async ensureLease(request, path, now = Date.now()) {
    const isStart = path === '/api/v6/start';
    const mayRestore = path === '/api/v6/status' || path === '/api/v6/action';
    const authorization = (isStart || mayRestore) ? await this.savedSessionAuthorization(request) : {valid: false, exists: false};
    const mayCreate = isStart && authorization.eligible && (!authorization.exists || authorization.valid);
    const mayRestart = authorization.valid || mayCreate;
    return this.withLifecycle(async () => {
      let current = this.leaseRow();
      const active = current?.status === 'active' && Number(current.expires_at) > now;
      if (active && this.container?.running) return {ok: true, lease: {id: current.lease_id, startedAt: Number(current.started_at), expiresAt: Number(current.expires_at)}, existing: true};

      // A stale active row cannot authorize an implicit library restart. It
      // represents a process which slept, crashed, or outlived its deadline.
      if (active && !this.container?.running) {
        this.markLeaseStopped(current.lease_id);
        current = this.leaseRow();
      }
      if (!mayRestart) return {ok: false, code: authorization.exists ? 'session_auth_failed' : 'lease_expired'};

      const oldLeaseId = current?.lease_id || this.liveLeaseId;
      this.stoppingLeaseId = oldLeaseId || null;
      if (this.container?.running) {
        try { await this.destroy(); } catch { /* the old instance is already gone */ }
      }
      this.markLeaseStopped(oldLeaseId);
      const decision = await this.reserveLease({allowRestart: true, now});
      if (!decision.ok) return decision;
      this.envVars = {...this.envVars, V6_LEASE_DEADLINE_MS: String(decision.lease.expiresAt)};
      this.startingLeaseId = decision.lease.id;
      try {
        await this.startAndWaitForPorts({ports: this.defaultPort, startOptions: {envVars: this.envVars, enableInternet: this.enableInternet}});
      } catch (error) {
        this.markLeaseStopped(decision.lease.id);
        this.startingLeaseId = null;
        throw error;
      }
      this.liveLeaseId = decision.lease.id;
      this.startingLeaseId = null;
      this.stoppingLeaseId = null;
      return decision;
    });
  }

  consumeBudgets({ip, sessionId = null, now = Date.now()}) {
    if (typeof ip !== 'string' || !ip || ip.length > 128) return {ok: false, code: 'budget_identity_unavailable'};
    const minute = Math.floor(now / 60000);
    const day = Math.floor(now / 86400000);
    const entries = [
      [`minute:${minute}`, `ip:${ip}`, LIMITS.ipMinute],
      [`minute:${minute}`, 'global', LIMITS.globalMinute],
      [`day:${day}`, 'global', LIMITS.globalDay],
      ...(sessionId ? [[`day:${day}`, `session:${sessionId}`, LIMITS.sessionDay]] : []),
    ];
    let result = {ok: true};
    try {
      this.ctx.storage.transactionSync(() => {
        this.ctx.storage.sql.exec("DELETE FROM v6_request_budget WHERE bucket LIKE 'minute:%' AND CAST(substr(bucket, 8) AS INTEGER) < ?", minute - 2);
        this.ctx.storage.sql.exec("DELETE FROM v6_request_budget WHERE bucket LIKE 'day:%' AND CAST(substr(bucket, 5) AS INTEGER) < ?", day - 2);
        for (const [bucket, subject, limit] of entries) {
          const row = this.ctx.storage.sql.exec('SELECT count FROM v6_request_budget WHERE bucket = ? AND subject = ?', bucket, subject).toArray()[0];
          if (Number(row?.count || 0) >= limit) { result = {ok: false, code: 'request_budget_exhausted'}; return; }
        }
        for (const [bucket, subject] of entries) this.ctx.storage.sql.exec(
          'INSERT INTO v6_request_budget (bucket, subject, count) VALUES (?, ?, 1) ON CONFLICT(bucket, subject) DO UPDATE SET count = count + 1',
          bucket, subject,
        );
      });
    } catch { return {ok: false, code: 'budget_unavailable'}; }
    return result;
  }

  stateSnapshot() {
    return this.ctx.storage.transactionSync(() => {
      const meta = this.ctx.storage.sql.exec('SELECT revision, chunk_count FROM v6_state_meta WHERE id = 1').toArray()[0] || {revision: 0, chunk_count: 0};
      const rows = this.ctx.storage.sql.exec('SELECT chunk_index, data FROM v6_state_chunks ORDER BY chunk_index ASC').toArray();
      if (rows.length !== Number(meta.chunk_count)) throw Error('State chunks are incomplete.');
      const text = rows.map(row => row.data).join('') || '{}';
      const records = JSON.parse(text);
      if (!records || typeof records !== 'object' || Array.isArray(records)) throw Error('State records are invalid.');
      if (textBytes(text) > MAX_STATE_BYTES) throw Error('State is too large.');
      return {revision: Number(meta.revision), records};
    });
  }

  stateCompareAndSwap({revision, records}) {
    if (invalidRevision(revision)) throw Object.assign(new Error('State revision is invalid.'), {status: 400});
    const text = recordsText(records);
    const chunks = splitUtf8(text);
    let result;
    this.ctx.storage.transactionSync(() => {
      const meta = this.ctx.storage.sql.exec('SELECT revision FROM v6_state_meta WHERE id = 1').toArray()[0] || {revision: 0};
      const current = Number(meta.revision);
      if (current !== revision) { result = {ok: false, revision: current}; return; }
      this.ctx.storage.sql.exec('DELETE FROM v6_state_chunks');
      chunks.forEach((chunk, index) => this.ctx.storage.sql.exec(
        'INSERT INTO v6_state_chunks (chunk_index, data) VALUES (?, ?)', index, chunk,
      ));
      this.ctx.storage.sql.exec(
        'UPDATE v6_state_meta SET revision = ?, chunk_count = ?, updated_at = ? WHERE id = 1',
        revision + 1,
        chunks.length,
        Date.now(),
      );
      result = {ok: true, revision: revision + 1};
    });
    return result;
  }

  async bridgeGetState() {
    return this.stateSnapshot();
  }

  async bridgePutState(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw Object.assign(new Error('State update is invalid.'), {status: 400});
    return this.stateCompareAndSwap(payload);
  }

  async expireLeaseAlarm(leaseId) {
    const row = this.leaseRow();
    if (row?.lease_id !== leaseId) return;
    await this.stopExpiredLease(Date.now());
  }

  onStart() {
    if (this.startingLeaseId) this.liveLeaseId = this.startingLeaseId;
  }

  onStop() {
    // A stopped process never refunds its reserved half-hour. The monthly
    // budget counts leases, including idle, failed, and alarm-stopped ones.
    const stoppedLeaseId = this.stoppingLeaseId || this.liveLeaseId;
    this.markLeaseStopped(stoppedLeaseId);
    if (this.liveLeaseId === stoppedLeaseId) this.liveLeaseId = null;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path !== EVENTS_PATH && !V6_PATH.test(path)) return json({error: 'Not found.'}, 404);

    const now = Date.now();
    let lease;
    try { lease = await this.ensureLease(request, path, now); }
    catch { return json({error: 'The V6 container is temporarily unavailable.'}, 503); }
    if (!lease.ok) return lease.code === 'monthly_budget_exhausted'
      ? leaseResponse('rolling_budget_exhausted', 'The V6 30-day container budget is exhausted. Try again later.')
      : lease.code === 'session_auth_failed'
        ? json({error: 'Reconnect the saved local V6 session.'}, 401)
      : leaseResponse();
    const headers = new Headers(request.headers);
    const proxyToken = String(this.environment.V6_PROXY_TOKEN || '');
    if (!proxyToken) return json({error: 'The V6 proxy token is not configured.'}, 503);
    headers.set('X-V6-Bridge-Token', proxyToken);
    const proxied = new Request(request, {headers});
    try { return await this.containerFetch(proxied); }
    catch { return json({error: 'The V6 container is temporarily unavailable.'}, 503); }
  }
};
}

async function bridge(request, environment) {
  if (!bridgeAuthorized(request, environment)) return json({error: 'Not found.'}, 404);
  if (request.method === 'GET') {
    try { return json(await environment.V6_CONTAINER.getByName(CONTAINER_NAME).bridgeGetState()); }
    catch { return json({error: 'The shared V6 state is unavailable.'}, 503); }
  }
  if (request.method !== 'PUT' || request.headers.get('Content-Type')?.split(';')[0].toLowerCase() !== 'application/json') return json({error: 'Not found.'}, 404);
  try {
    const payload = await readJsonRequest(request, MAX_BRIDGE_BODY_BYTES);
    const result = await environment.V6_CONTAINER.getByName(CONTAINER_NAME).bridgePutState(payload);
    if (result?.ok === false) return json({error: 'State revision changed.', revision: result.revision}, 409);
    return json({revision: result.revision});
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 503;
    return json({error: status < 500 ? error.message : 'The shared V6 state is unavailable.'}, status);
  }
}

async function api(request, environment) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') {
    const origin = allowedOrigin(request, environment);
    return origin ? new Response(null, {status: 204, headers: corsHeaders(origin)}) : json({error: 'The request origin is not allowed.'}, 403);
  }
  if ((request.method !== 'POST' && url.pathname !== EVENTS_PATH) || (request.method === 'POST' && !V6_PATH.test(url.pathname))) return json({error: 'Not found.'}, 404);
  const origin = allowedOrigin(request, environment);
  if (!origin) return json({error: 'The request origin is not allowed.'}, 403);
  if (!request.headers.has('Origin')) {
    const headers = new Headers(request.headers);
    headers.set('Origin', origin);
    request = new Request(request, {headers});
  }
  if (url.pathname !== EVENTS_PATH && request.headers.get('Content-Type')?.split(';')[0].toLowerCase() !== 'application/json') return json({error: 'JSON required.'}, 415, corsHeaders(origin));
  let sessionId = null;
  if (url.pathname !== EVENTS_PATH) {
    const bytes = await boundedBytes(request, MAX_REQUEST_BYTES);
    if (!bytes) return json({error: 'Request body is too large.'}, 413, corsHeaders(origin));
    try {
      const body = JSON.parse(new TextDecoder().decode(bytes));
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
      if (typeof body.id === 'string' && body.id.length <= 128) sessionId = body.id;
    } catch { return json({error: 'Request body must be a JSON object.'}, 400, corsHeaders(origin)); }
    request = await requestWithBody(request, bytes);
  }
  const ip = request.headers.get('CF-Connecting-IP');
  const container = environment.V6_CONTAINER.getByName(CONTAINER_NAME);
  let budget;
  try { budget = await container.consumeBudgets({ip, sessionId}); }
  catch { budget = {ok: false, code: 'budget_unavailable'}; }
  if (!budget?.ok) return budget?.code === 'request_budget_exhausted'
    ? json({error: 'The V6 request budget is exhausted. Try again later.'}, 429, {...corsHeaders(origin), 'Retry-After': '60'})
    : json({error: 'The V6 request budget is temporarily unavailable.'}, 503, corsHeaders(origin));
  try {
    const result = await container.fetch(request);
    const headers = new Headers(result.headers);
    for (const [name, value] of Object.entries(corsHeaders(origin))) headers.set(name, value);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(result.body, {status: result.status, statusText: result.statusText, headers});
  } catch { return json({error: 'The V6 container is temporarily unavailable.'}, 503, corsHeaders(origin)); }
}

async function staticAsset(request, environment) {
  const result = await environment.ASSETS.fetch(request);
  const path = new URL(request.url).pathname;
  if (!/^\/covenants\/v[56](?:\.html)?\/?$/.test(path) && path !== '/covenants-v5' && path !== '/covenants-v6' && path !== '/covenants-v5.html' && path !== '/covenants-v6.html') return result;
  const headers = new Headers(result.headers);
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(result.body, {status: result.status, statusText: result.statusText, headers});
}

export default {
  async fetch(request, environment) {
    const url = new URL(request.url);
    if (url.pathname === BRIDGE_PATH) return bridge(request, environment);
    if (url.pathname === EVENTS_PATH || V6_PATH.test(url.pathname)) return api(request, environment);
    return staticAsset(request, environment);
  },
};

export const __v6 = Object.freeze({
  NETWORK,
  CONTAINER_NAME,
  MAX_REQUEST_BYTES,
  MAX_STATE_BYTES,
  MAX_LEASES_PER_MONTH,
  ROLLING_WINDOW_MS,
  LEASE_MS,
  LEASE_GRACE_MS,
  LIMITS,
});
