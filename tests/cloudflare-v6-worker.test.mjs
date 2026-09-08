import test from 'node:test';
import assert from 'node:assert/strict';
import worker, {createV6ContainerClass, __v6} from '../cloudflare/worker.mjs';

class MemorySql {
  constructor() { this.meta = {revision: 0, chunk_count: 0}; this.chunks = []; this.lease = null; this.logs = []; this.budgets = new Map(); }
  exec(query, ...args) {
    const sql = query.replace(/\s+/g, ' ').trim();
    let rows = [];
    if (sql.startsWith('SELECT * FROM v6_lease')) rows = this.lease ? [this.lease] : [];
    else if (sql.startsWith('UPDATE v6_lease SET status = ?')) { if (this.lease) this.lease.status = args[0]; }
    else if (sql.startsWith("UPDATE v6_lease SET status = 'stopped'")) {
      if (this.lease && this.lease.status === 'active' && (!args[0] || this.lease.lease_id === args[0])) this.lease.status = 'stopped';
    }
    else if (sql.startsWith('DELETE FROM v6_lease_log')) this.logs = this.logs.filter(row => row.started_at > args[0]);
    else if (sql.startsWith('SELECT COUNT(*) AS count FROM v6_lease_log')) rows = [{count: this.logs.filter(row => row.started_at > args[0]).length}];
    else if (sql.startsWith('INSERT INTO v6_lease_log')) this.logs.push({lease_id: args[0], started_at: args[1], expires_at: args[2], status: args[3]});
    else if (sql.startsWith('INSERT OR REPLACE INTO v6_lease')) this.lease = {id: 1, lease_id: args[0], started_at: args[1], expires_at: args[2], status: args[3]};
    else if (sql.startsWith('SELECT revision, chunk_count FROM v6_state_meta')) rows = [this.meta];
    else if (sql.startsWith('SELECT revision FROM v6_state_meta')) rows = [{revision: this.meta.revision}];
    else if (sql.startsWith('SELECT chunk_index, data FROM v6_state_chunks')) rows = this.chunks.map((data, chunk_index) => ({chunk_index, data}));
    else if (sql.startsWith('DELETE FROM v6_state_chunks')) this.chunks = [];
    else if (sql.startsWith('INSERT INTO v6_state_chunks')) this.chunks[args[0]] = args[1];
    else if (sql.startsWith('UPDATE v6_state_meta SET revision')) this.meta = {revision: args[0], chunk_count: args[1]};
    else if (sql.startsWith('SELECT count FROM v6_request_budget')) { const value = this.budgets.get(`${args[0]}|${args[1]}`); rows = value ? [{count: value}] : []; }
    else if (sql.startsWith('INSERT INTO v6_request_budget')) { const key = `${args[0]}|${args[1]}`; this.budgets.set(key, (this.budgets.get(key) || 0) + 1); }
    return {toArray: () => rows};
  }
}

class FakeContainerBase {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; this.scheduled = []; this.destroyed = 0; this.forwarded = []; this.events = []; this.container = {running: false}; }
  async schedule(when, callback, payload) { this.scheduled.push({when, callback, payload}); }
  async destroy() { this.events.push('destroy'); this.destroyed += 1; this.container.running = false; }
  async startAndWaitForPorts() {
    this.events.push('pending-stop');
    this.onStop({reason: 'exit', exitCode: 0});
    this.events.push('start');
    this.container.running = true;
    this.onStart();
  }
  async containerFetch(request) { this.forwarded.push(request); return Response.json({ok: true}); }
}

const ID = '10000000-0000-4000-8000-000000000006';
const CAP = 'ab'.repeat(32);
const sha256 = async value => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(byte => byte.toString(16).padStart(2, '0')).join('');
const apiRequest = (path, body, origin = 'https://public.example') => new Request(`https://public.example/api/v6/${path}`, {method: 'POST', headers: {Origin: origin, 'Content-Type': 'application/json'}, body: JSON.stringify(body)});

function fixture() {
  const sql = new MemorySql();
  const storage = {sql, transactionSync: fn => fn()};
  const ctx = {storage};
  const env = {V6_PROXY_TOKEN: 'proxy', V6_PUBLIC_ORIGIN: 'https://public.example', V6_STATE_BRIDGE_URL: 'https://worker.example/internal/v6/state', V6_STATE_BRIDGE_TOKEN: 'bridge', V6_TREASURY_KEY: '11'.repeat(32)};
  const Class = createV6ContainerClass(FakeContainerBase);
  return {instance: new Class(ctx, env), sql, env};
}

test('only start reserves a prepaid lease and expiry destroys the process', async () => {
  const {instance, sql} = fixture();
  assert.equal((await instance.fetch(apiRequest('status', {id: ID, capability: CAP}))).status, 503);
  assert.equal(sql.logs.length, 0);
  const start = await instance.fetch(apiRequest('start', {id: ID, capability: CAP}));
  assert.equal(start.status, 200);
  assert.equal(sql.logs.length, 1);
  assert.equal(instance.scheduled[0].callback, 'expireLeaseAlarm');
  assert.equal(instance.envVars.V6_LEASE_DEADLINE_MS, String(sql.lease.expires_at));
  sql.lease.expires_at = Date.now() - 1;
  await instance.expireLeaseAlarm(sql.lease.lease_id);
  assert.equal(sql.lease.status, 'expired');
  assert.equal(instance.destroyed, 1);
});

test('a stopped process needs a newly charged start lease', async () => {
  const {instance, sql} = fixture();
  await instance.fetch(apiRequest('start', {id: ID, capability: CAP}));
  instance.onStop();
  assert.equal(sql.lease.status, 'stopped');
  assert.equal((await instance.fetch(apiRequest('status', {id: ID, capability: CAP}))).status, 503);
  const restarted = await instance.fetch(apiRequest('start', {id: ID, capability: CAP}));
  assert.equal(restarted.status, 200);
  assert.equal(sql.logs.length, 2);
});

test('a valid saved status restarts the container but a wrong capability cannot buy a lease', async () => {
  const {instance, sql} = fixture();
  const capHash = await sha256(CAP);
  instance.stateCompareAndSwap({revision: 0, records: {[`v6:session:${ID}`]: {id: ID, capHash}}});
  const wrong = await instance.fetch(apiRequest('status', {id: ID, capability: 'cd'.repeat(32)}));
  assert.equal(wrong.status, 401);
  assert.equal(sql.logs.length, 0);
  const restored = await instance.fetch(apiRequest('status', {id: ID, capability: CAP}));
  assert.equal(restored.status, 200);
  assert.equal(sql.logs.length, 1);
  assert.equal(instance.forwarded.at(-1).url.endsWith('/api/v6/status'), true);
});

test('forty stopped leases consume the rolling budget without refunds and the exact cutoff releases one slot', async () => {
  const {instance, sql} = fixture();
  const start = 1_800_000_000_000;
  for (let index = 0; index < __v6.MAX_LEASES_PER_MONTH; index++) {
    const lease = await instance.reserveLease({allowRestart: true, now: start + index});
    assert.equal(lease.ok, true);
    instance.markLeaseStopped(lease.lease.id);
  }
  assert.equal(sql.logs.length, 40);
  assert.equal((await instance.reserveLease({allowRestart: true, now: start + 40})).code, 'monthly_budget_exhausted');
  assert.equal(sql.logs.length, 40);
  assert.equal((await instance.reserveLease({allowRestart: true, now: start + __v6.ROLLING_WINDOW_MS})).ok, true);
  assert.equal(sql.logs.length, 40);
});

test('an expired running process is destroyed before a new lease starts and its delayed stop cannot cancel the new lease', async () => {
  const {instance, sql} = fixture();
  const old = await instance.reserveLease({allowRestart: true, now: Date.now() - __v6.LEASE_MS - 1000});
  instance.liveLeaseId = old.lease.id;
  instance.container.running = true;
  const response = await instance.fetch(apiRequest('start', {id: ID, capability: CAP}));
  assert.equal(response.status, 200);
  assert.deepEqual(instance.events.slice(0, 3), ['destroy', 'pending-stop', 'start']);
  assert.equal(sql.lease.status, 'active');
  assert.notEqual(sql.lease.lease_id, old.lease.id);
});

test('state bridge CAS is revisioned, chunked, and rejects stale writes', () => {
  const {instance} = fixture();
  const records = {large: '🙂'.repeat(70000)};
  assert.deepEqual(instance.stateCompareAndSwap({revision: 0, records}), {ok: true, revision: 1});
  assert.deepEqual(instance.stateSnapshot(), {revision: 1, records});
  assert.deepEqual(instance.stateCompareAndSwap({revision: 0, records: {}}), {ok: false, revision: 1});
});

test('request budgets allow a normal journey and fail closed at the cap', () => {
  const {instance} = fixture();
  const now = 1_800_000_000_000;
  for (let i = 0; i < 26; i++) assert.equal(instance.consumeBudgets({ip: '192.0.2.1', sessionId: 'session', now}).ok, true);
  for (let i = 26; i < __v6.LIMITS.sessionDay; i++) instance.consumeBudgets({ip: `192.0.2.${i % 250}`, sessionId: 'session', now});
  assert.equal(instance.consumeBudgets({ip: '192.0.2.250', sessionId: 'session', now}).code, 'request_budget_exhausted');
  assert.equal(instance.consumeBudgets({ip: '', sessionId: 'other', now}).code, 'budget_identity_unavailable');
});

test('public routing protects API and bridge while V4 remains indexable', async () => {
  const forwarded = [];
  const stub = {
    async consumeBudgets() { return {ok: true}; },
    async fetch(request) { forwarded.push(request); return Response.json({ok: true}); },
    async bridgeGetState() { return {revision: 0, records: {}}; },
  };
  const assets = {async fetch(request) { return new Response(new URL(request.url).pathname); }};
  const env = {V6_CONTAINER: {getByName: name => (assert.equal(name, 'v6-shared'), stub)}, ASSETS: assets, V6_PUBLIC_ORIGIN: 'https://public.example', V6_STATE_BRIDGE_TOKEN: 'bridge'};
  const publicRequest = new Request('https://public.example/api/v6/start', {method: 'POST', headers: {'Origin': 'https://public.example', 'CF-Connecting-IP': '192.0.2.1', 'Content-Type': 'application/json'}, body: JSON.stringify({id: ID, capability: CAP})});
  const response = await worker.fetch(publicRequest, env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://public.example');
  assert.equal(forwarded.length, 1);
  assert.equal((await worker.fetch(new Request('https://public.example/api/v6/start', {method: 'POST', headers: {'Origin': 'https://evil.example', 'CF-Connecting-IP': '192.0.2.1', 'Content-Type': 'application/json'}, body: '{}'}), env)).status, 403);
  assert.equal((await worker.fetch(new Request('https://public.example/internal/v6/state'), env)).status, 404);
  const bridgeRead = await worker.fetch(new Request('https://public.example/internal/v6/state', {headers: {Authorization: 'Bearer bridge'}}), env);
  assert.deepEqual(await bridgeRead.json(), {revision: 0, records: {}});
  assert.equal((await worker.fetch(new Request('https://public.example/internal/v6/state', {headers: {Authorization: 'Bearer bridge', Origin: 'https://public.example'}}), env)).status, 404);
  assert.equal((await worker.fetch(new Request('https://public.example/covenants'), env)).headers.get('X-Robots-Tag'), null);
  assert.equal((await worker.fetch(new Request('https://public.example/covenants/v6'), env)).headers.get('X-Robots-Tag'), 'noindex, nofollow');
});
