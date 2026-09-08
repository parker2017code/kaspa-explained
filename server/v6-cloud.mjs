// Cloudflare Container host for the V6 Testnet-10 demonstration.
//
// This process is intentionally a narrow internal service.  The public
// Worker authenticates callers and owns the Durable Object state bridge; the
// container holds the fresh treasury key only in memory, performs the native
// VM/RPC work, and is allowed to serve V6 routes for one bounded lease.

import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {timingSafeEqual} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';
import {V5Service} from '../faucet/v5-service.mjs';
import {V6Service} from './v6-service.mjs';
import {V6NetworkFeed} from './v6-network.mjs';
import {checkV6Script} from './v6-vm.mjs';
import {observePublicAcceptance} from '../src/public-acceptance.mjs';
import {V6CloudStorage, CloudStateError, CloudStatePoisonedError} from './v6-cloud-storage.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const DEFAULT_RPC_URL = 'wss://muon-10.kaspa.blue/kaspa/testnet-10/wrpc/borsh';
const NETWORK = 'testnet-10';
const MAX_REQUEST_BYTES = 64 * 1024;
const MAX_SSE_CLIENTS = 10;
const SSE_LIFETIME_MS = 60 * 1000;
const DEFAULT_LEASE_MS = 30 * 60 * 1000;
const DEFAULT_DRAIN_MS = 30 * 1000;
const DEFAULT_RPC_TIMEOUT_MS = 15000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const V6_CLOUD_LIMITS = Object.freeze({
  maxRequestBytes: MAX_REQUEST_BYTES,
  maxQueueDepth: 20,
  maxSseClients: MAX_SSE_CLIENTS,
  sseLifetimeMs: SSE_LIFETIME_MS,
  maxRuntimeMs: DEFAULT_LEASE_MS,
  drainMs: DEFAULT_DRAIN_MS,
});

const json = (value, status = 200, headers = {}) => Response.json(value, {
  status,
  headers: {'Cache-Control': 'no-store', ...headers},
});

class CloudRuntimeError extends Error {
  constructor(message, status = 503, code = 'cloud_runtime_error') {
    super(message);
    this.name = 'CloudRuntimeError';
    this.status = status;
    this.code = code;
  }
}

const fail = (message, status = 503, code = 'cloud_runtime_error') => {
  throw new CloudRuntimeError(message, status, code);
};

function constantTimeToken(expected, actual) {
  if (typeof expected !== 'string' || !expected || typeof actual !== 'string') return false;
  const left = Buffer.from(expected), right = Buffer.from(actual);
  return left.length === right.length && timingSafeEqual(left, right);
}

function bearerValue(header) {
  if (typeof header !== 'string') return null;
  const match = /^Bearer\s+([^\s]+)$/i.exec(header.trim());
  return match?.[1] || null;
}

function safeNumber(value, fallback, {min = 0, max = Number.MAX_SAFE_INTEGER} = {}) {
  const n = Number(value);
  return Number.isFinite(n) && Number.isSafeInteger(n) && n >= min && n <= max ? n : fallback;
}

async function readJsonFile(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function readRequestBody(req, maxBytes = MAX_REQUEST_BYTES) {
  const announced = Number(req.headers['content-length'] || 0);
  if (Number.isFinite(announced) && announced > maxBytes) fail('Request body is too large.', 413, 'request_too_large');
  const chunks = [];
  let length = 0;
  try {
    for await (const chunk of req) {
      length += chunk.length;
      if (length > maxBytes) fail('Request body is too large.', 413, 'request_too_large');
      chunks.push(chunk);
    }
  } catch (error) {
    if (error?.status) throw error;
    fail('The request body could not be read.', 400, 'request_invalid');
  }
  if (!length) fail('A JSON request body is required.', 400, 'request_invalid');
  const text = Buffer.concat(chunks).toString('utf8');
  let body;
  try { body = JSON.parse(text); } catch { fail('The request body must be valid JSON.', 400, 'request_invalid'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) fail('The request body must be a JSON object.', 400, 'request_invalid');
  return body;
}

function responseHeaders(response) {
  const headers = {};
  response.headers?.forEach?.((value, key) => { headers[key] = value; });
  return headers;
}

async function sendResponse(res, response, corsOrigin = null) {
  const headers = responseHeaders(response);
  if (corsOrigin) {
    headers['Access-Control-Allow-Origin'] = corsOrigin;
    headers.Vary = headers.Vary ? `${headers.Vary}, Origin` : 'Origin';
  }
  const body = response.status === 204 ? null : Buffer.from(await response.arrayBuffer());
  res.writeHead(response.status, headers);
  res.end(body);
}

function publicError(error) {
  if (error instanceof CloudStatePoisonedError || error?.poison) return 'The shared V6 state is unavailable. No new transaction was sent.';
  if (error instanceof CloudStateError) return error.publicMessage || 'The shared V6 state is unavailable.';
  return error?.message || 'The V6 service is temporarily unavailable.';
}

/** A FIFO queue with one active API task and a bounded admission depth. */
export class SerialWorkQueue {
  constructor({maxDepth = 20, now = () => Date.now()} = {}) {
    this.maxDepth = maxDepth;
    this.now = now;
    this.tail = Promise.resolve();
    this.active = 0;
    this.waiting = 0;
    this.accepting = true;
    this.startedAt = null;
    this.finishedAt = null;
  }

  get depth() { return this.active + this.waiting; }

  size() { return this.depth; }

  stop() { this.accepting = false; }

  enqueue(task) {
    if (!this.accepting) throw new CloudRuntimeError('The V6 container lease has ended. Try again shortly.', 503, 'lease_expired');
    if (this.depth >= this.maxDepth) throw new CloudRuntimeError('The V6 demonstration is busy. Try again shortly.', 429, 'queue_full');
    this.waiting += 1;
    let resolveStarted;
    const started = new Promise(resolve => { resolveStarted = resolve; });
    const run = this.tail.then(async () => {
      this.waiting -= 1;
      this.active += 1;
      this.startedAt = this.now();
      resolveStarted();
      try { return await task(); }
      finally {
        this.active -= 1;
        this.finishedAt = this.now();
      }
    });
    this.tail = run.catch(() => {});
    // Ensure an eager rejection is not mistaken for a queue-admission error;
    // the actual result remains the task promise returned to the caller.
    void started;
    return run;
  }

  async drain(timeoutMs = DEFAULT_DRAIN_MS) {
    this.stop();
    let timer;
    try {
      await Promise.race([
        this.tail,
        new Promise(resolve => { timer = setTimeout(resolve, Math.max(0, timeoutMs)); }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
    return this.depth === 0;
  }
}

function defaultSdk() {
  try {
    const require = createRequire(import.meta.url);
    return require('../.cache/upstream/kaspa-wasm32-sdk/nodejs/kaspa');
  } catch (error) {
    throw new CloudRuntimeError('The native Testnet-10 SDK is unavailable.', 503, 'sdk_unavailable');
  }
}

function strictPrivateKey(raw, sdk) {
  if (typeof raw !== 'string' || !/^[0-9a-f]{64}$/i.test(raw.trim())) {
    throw new CloudRuntimeError('V6_TREASURY_KEY must be a fresh 32-byte Testnet-10 signer secret.', 503, 'treasury_key_missing');
  }
  if (!sdk?.PrivateKey) throw new CloudRuntimeError('The native Testnet-10 signer is unavailable.', 503, 'sdk_unavailable');
  try { return new sdk.PrivateKey(raw.trim()); } catch (error) { throw new CloudRuntimeError('The V6 treasury signer is invalid.', 503, 'treasury_key_invalid'); }
}

function rpcOptions(env) {
  return {url: env.V6_RPC_URL || DEFAULT_RPC_URL, networkId: NETWORK};
}

/**
 * Runtime implementation shared by the HTTP adapter and focused unit tests.
 * No socket, RPC connection, or state bridge request is opened by the
 * constructor.  `initialize()` is called only after a protected API request
 * has passed its method, origin, body and queue admission checks.
 */
export class V6CloudRuntime {
  constructor(options = {}) {
    this.env = options.env || process.env;
    this.port = safeNumber(options.port ?? this.env.PORT, 8080, {min: 0, max: 65535});
    this.host = options.host || '0.0.0.0';
    this.publicOrigin = options.publicOrigin ?? this.env.V6_PUBLIC_ORIGIN ?? '';
    this.authToken = options.authToken
      ?? this.env.V6_PROXY_TOKEN
      ?? this.env.V6_CONTAINER_TOKEN
      ?? this.env.V6_INTERNAL_TOKEN
      ?? this.env.V6_BRIDGE_AUTH_TOKEN
      ?? '';
    this.maxRuntimeMs = safeNumber(options.maxRuntimeMs ?? options.leaseMs ?? this.env.V6_MAX_RUNTIME_MS ?? this.env.V6_LEASE_MS, DEFAULT_LEASE_MS, {min: 1, max: DEFAULT_LEASE_MS});
    this.leaseMs = this.maxRuntimeMs;
    this.leaseDeadlineMs = safeNumber(options.leaseDeadlineMs ?? this.env.V6_LEASE_DEADLINE_MS, 0, {min: 0, max: Number.MAX_SAFE_INTEGER});
    this.drainMs = safeNumber(options.drainMs ?? this.env.V6_DRAIN_MS, DEFAULT_DRAIN_MS, {min: 0, max: DEFAULT_DRAIN_MS});
    this.rpcTimeoutMs = safeNumber(options.rpcTimeoutMs ?? this.env.V6_RPC_TIMEOUT_MS, DEFAULT_RPC_TIMEOUT_MS, {min: 100, max: 60000});
    this.maxSseClients = safeNumber(options.maxSseClients ?? MAX_SSE_CLIENTS, MAX_SSE_CLIENTS, {min: 1, max: MAX_SSE_CLIENTS});
    this.sseLifetimeMs = safeNumber(options.sseLifetimeMs ?? SSE_LIFETIME_MS, SSE_LIFETIME_MS, {min: 1, max: SSE_LIFETIME_MS});
    this.now = options.now || (() => Date.now());
    this.fetchImpl = options.fetchImpl || globalThis.fetch;
    this.storage = options.storage || new V6CloudStorage({
      bridgeUrl: options.bridgeUrl ?? this.env.V6_STATE_BRIDGE_URL,
      bridgeToken: options.bridgeToken ?? this.env.V6_STATE_BRIDGE_TOKEN,
      fetchImpl: options.stateFetchImpl || this.fetchImpl,
      timeoutMs: options.stateTimeoutMs,
      now: this.now,
    });
    this.sdk = options.sdk || null;
    this.rpc = options.rpc || null;
    this.rpcPromise = null;
    this.key = options.key || null;
    this.keyHex = options.treasuryKey || this.env.V6_TREASURY_KEY || '';
    this.address = options.address || null;
    this.entries = options.entries || [];
    this.artifacts = options.artifacts || {};
    this.serviceFactory = options.serviceFactory || null;
    this.vmCheck = options.vmCheck || checkV6Script;
    this.observeAcceptance = options.observeAcceptance || observePublicAcceptance;
    this.prepareV6Operation = options.prepareV6Operation || null;
    this.rpcFactory = options.rpcFactory || null;
    this.queue = options.queue || new SerialWorkQueue({maxDepth: 20, now: this.now});
    this.networkFeed = options.networkFeed || new V6NetworkFeed();
    this.clients = new Set();
    this.initialized = false;
    this.initializing = null;
    this.accepting = true;
    this.stopping = false;
    this.leaseExpired = false;
    this.startedAt = null;
    this.leaseTimer = null;
    this.server = null;
    this.shutdownPromise = null;
  }

  status() {
    return {
      service: 'v6-cloud',
      network: NETWORK,
      accepting: this.accepting && !this.stopping && !this.leaseExpired,
      leaseExpired: this.leaseExpired,
      startedAt: this.startedAt,
      leaseEndsAt: this.startedAt === null ? null : this.effectiveLeaseDeadline ?? this.startedAt + this.leaseMs,
      queueDepth: this.queue.size(),
      storage: this.storage?.snapshot?.() || null,
    };
  }

  async loadArtifacts() {
    if (!this.sdk) this.sdk = defaultSdk();
    const get = async (name, path) => this.artifacts[name] || await readJsonFile(path);
    this.artifacts.argentTemplates ||= await get('argentTemplates', resolve(ROOT, 'src/v5-argent-templates.json'));
    this.artifacts.advancedTemplates ||= await get('advancedTemplates', resolve(ROOT, 'src/v5-advanced-templates.json'));
    if (!this.artifacts.launchTemplate) {
      const publicTemplates = await get('publicTemplates', resolve(ROOT, '.cache/public-templates/templates.json'));
      this.artifacts.launchTemplate = publicTemplates?.templates?.launch || publicTemplates?.launch;
    }
    this.artifacts.proofTemplates ||= await get('proofTemplates', resolve(ROOT, 'src/v6-proof-templates.json'));
    if (!this.artifacts.launchTemplate) throw new CloudRuntimeError('The pinned greenhouse artifact is unavailable.', 503, 'artifact_unavailable');
  }

  ensureTreasury() {
    if (!this.key) this.key = strictPrivateKey(this.keyHex, this.sdk);
    if (!this.address) {
      try { this.address = this.key.toAddress(NETWORK).toString(); } catch { throw new CloudRuntimeError('The V6 treasury signer could not derive a Testnet-10 address.', 503, 'treasury_key_invalid'); }
    }
    return this.key;
  }

  async initialize() {
    if (this.initialized) return this;
    if (this.initializing) return this.initializing;
    this.initializing = (async () => {
      // This is the single state hydration barrier.  It completes before a
      // queued API task can call V6Service or touch RPC.
      await this.storage.hydrate();
      await this.loadArtifacts();
      this.ensureTreasury();
      this.initialized = true;
      return this;
    })();
    try { return await this.initializing; } finally { this.initializing = null; }
  }

  async rpcCall(promise) {
    let timer;
    try {
      if (this.rpcTimeoutMs > 0) {
        return await Promise.race([
          promise,
          new Promise((_, reject) => { timer = setTimeout(() => reject(new CloudRuntimeError('The Testnet-10 node did not respond.', 503, 'rpc_timeout')), this.rpcTimeoutMs); }),
        ]);
      }
      return await promise;
    } catch (error) {
      if (error?.status) throw error;
      throw new CloudRuntimeError('The Testnet-10 node did not respond.', 503, 'rpc_unavailable');
    } finally { if (timer) clearTimeout(timer); }
  }

  async disconnectRpc(client = this.rpc) {
    try { if (client?.disconnect) await Promise.race([client.disconnect(), new Promise(resolve => setTimeout(resolve, 2000))]); } catch { /* close is best effort */ }
  }

  async ensureRpc() {
    if (this.rpc && this.entries !== undefined && this.rpcReady) return {info: this.rpcInfo, entries: this.entries};
    if (this.rpcPromise) return this.rpcPromise;
    this.rpcPromise = (async () => {
      let client = this.rpc;
      try {
        if (!client) {
          if (this.rpcFactory) client = await this.rpcFactory(rpcOptions(this.env));
          else {
            if (!this.sdk) this.sdk = defaultSdk();
            if (!this.sdk.RpcClient) throw new CloudRuntimeError('The Testnet-10 RPC client is unavailable.', 503, 'rpc_unavailable');
            client = new this.sdk.RpcClient(rpcOptions(this.env));
          }
          this.rpc = client;
        }
        if (client.connect && !client.__v6CloudConnected) {
          await this.rpcCall(client.connect({blockAsyncConnect: true, timeoutDuration: 6000}));
          client.__v6CloudConnected = true;
        }
        if (typeof client.getServerInfo !== 'function' || typeof client.getUtxosByAddresses !== 'function') throw new CloudRuntimeError('The Testnet-10 RPC client is incomplete.', 503, 'rpc_unavailable');
        const info = await this.rpcCall(client.getServerInfo());
        if (info?.networkId !== NETWORK || info?.isSynced !== true || info?.hasUtxoIndex !== true) throw new CloudRuntimeError('The Testnet-10 node is not synchronized for UTXO queries.', 503, 'rpc_not_ready');
        const result = await this.rpcCall(client.getUtxosByAddresses([this.address]));
        if (!result || !Array.isArray(result.entries)) throw new CloudRuntimeError('The Testnet-10 node returned no UTXO snapshot.', 503, 'rpc_invalid_response');
        this.entries = result.entries;
        this.rpcInfo = info;
        this.rpcReady = true;
        if (typeof client.addEventListener === 'function' && typeof client.subscribeBlockAdded === 'function') {
          await this.networkFeed.attach(client);
        }
        return {info, entries: this.entries};
      } catch (error) {
        this.rpcReady = false;
        if (client && client !== this.rpc) await this.disconnectRpc(client);
        if (this.rpc === client) { await this.disconnectRpc(client); this.rpc = null; }
        throw error?.status ? error : new CloudRuntimeError('The Testnet-10 node is unavailable.', 503, 'rpc_unavailable');
      } finally { this.rpcPromise = null; }
    })();
    return this.rpcPromise;
  }

  async v6FeeRate() {
    const estimate = await this.rpcCall(this.rpc.getFeeEstimate());
    return Math.max(100, Math.ceil(Number(estimate?.estimate?.priorityBucket?.feerate || 100)));
  }

  async v6Checkpoint() {
    const result = await this.rpcCall(this.rpc.getSink());
    const sink = String(result?.sink || '');
    if (!/^[a-f0-9]{64}$/i.test(sink)) throw new CloudRuntimeError('The Testnet-10 node returned no acceptance checkpoint.', 503, 'rpc_invalid_response');
    return sink;
  }

  async v6Observe(pending, {allowBroadcast = false} = {}) {
    if (!pending?.transactionId) return {};
    try {
      return await this.observeAcceptance(this.rpc, {
        id: pending.transactionId,
        checkpoint: pending.checkpoint,
        scanCursor: pending.scanCursor,
        acceptingBlock: pending.acceptingBlock,
      }, {call: value => this.rpcCall(value), pages: 3, allowBroadcast});
    } catch (error) {
      pending.lastObservationError = String(error?.message || error).slice(0, 240);
      return {};
    }
  }

  makeV5Host() {
    const env = {
      // V5 is a helper for V6's pinned protocol builders.  Its own public
      // routes are never mounted by this process.
      FAUCET_KEY: this.keyHex,
      V5_ENABLED: 'false',
      V5_PLAYER_DAILY_REWARD_SOMPI: '0',
      V5_TOTAL_REWARD_SOMPI: '0',
    };
    const host = new V5Service({
      storage: this.storage,
      env,
      sdk: this.sdk,
      rpc: this.rpc,
      key: this.key,
      address: this.address,
      entries: this.entries,
      argentTemplates: this.artifacts.argentTemplates,
      advancedTemplates: this.artifacts.advancedTemplates,
      call: value => this.rpcCall(value),
      now: this.now,
    });
    host.v6FeeRate = this.v6FeeRate.bind(this);
    host.v6Checkpoint = this.v6Checkpoint.bind(this);
    host.v6Observe = this.v6Observe.bind(this);
    host.observePublicAcceptance = this.observeAcceptance;
    host.checkV6Script = this.vmCheck;
    if (this.prepareV6Operation) host.prepareV6Operation = this.prepareV6Operation;
    return host;
  }

  async makeService(body, path) {
    if (this.serviceFactory) return this.serviceFactory({runtime: this, body, path});
    const host = this.makeV5Host();
    return new V6Service({
      host,
      storage: this.storage,
      sdk: this.sdk,
      rpc: this.rpc,
      key: this.key,
      address: this.address,
      entries: this.entries,
      call: value => this.rpcCall(value),
      argentTemplates: this.artifacts.argentTemplates,
      advancedTemplates: this.artifacts.advancedTemplates,
      launchTemplate: this.artifacts.launchTemplate,
      proofTemplates: this.artifacts.proofTemplates,
      now: this.now,
    });
  }

  async processApi(path, body) {
    if (this.stopping || this.leaseExpired) fail('The V6 container lease has ended. Try again shortly.', 503, 'lease_expired');
    await this.ensureRpc();
    const service = await this.makeService(body, path);
    if (!service || typeof service.handle !== 'function') fail('The V6 service is unavailable.', 503, 'service_unavailable');
    // A visitor may leave while their transaction is settling. Reconcile the
    // shared journal before another visitor needs the same treasury, using
    // observation only so that an abandoned tab cannot strand the service.
    const shared = await this.storage.get('state');
    if (shared?.pending?.purpose === 'v6' && shared.pending.sessionId !== body.id) {
      const saved = await this.storage.get(`v6:session:${shared.pending.sessionId}`);
      if (!saved || typeof service.reconcile !== 'function') fail('The shared transaction needs recovery before another session can continue.', 503, 'shared_recovery_required');
      await service.reconcile(saved, {allowBroadcast: false});
    }
    const request = new Request(`http://v6-cloud.internal${path}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    });
    return service.handle(request);
  }

  checkOrigin(req) {
    const origin = req.headers.origin || '';
    if (this.publicOrigin && origin !== this.publicOrigin) fail('The request origin is not allowed.', 403, 'origin_forbidden');
    return origin || null;
  }

  authorize(req) {
    if (!this.authToken) fail('The Cloudflare proxy token is not configured.', 503, 'proxy_auth_not_configured');
    // The Worker uses a dedicated header so the public Authorization header
    // can remain an application concern.  Accepting Authorization here keeps
    // direct container smoke tests and older proxy revisions compatible.
    const bridgeHeader = req.headers['x-v6-bridge-token'];
    const token = bridgeHeader
      ? (bearerValue(bridgeHeader) || String(bridgeHeader).trim())
      : bearerValue(req.headers.authorization);
    if (!constantTimeToken(this.authToken, token)) fail('The Cloudflare proxy token is invalid.', 401, 'proxy_auth_invalid');
    return this.checkOrigin(req);
  }

  async handleApiRequest(req) {
    const pathname = new URL(req.url || '/', 'http://v6-cloud.internal').pathname;
    if (!['/api/v6/start', '/api/v6/status', '/api/v6/action'].includes(pathname)) fail('Not found.', 404, 'not_found');
    if (req.method !== 'POST') fail('V6 API actions require POST.', 405, 'method_not_allowed');
    const corsOrigin = this.authorize(req);
    if (req.headers['content-type']?.split(';')[0].toLowerCase() !== 'application/json') fail('The request body must use JSON.', 415, 'content_type_required');
    const body = await readRequestBody(req);
    await this.initialize();
    const response = await this.queue.enqueue(() => this.processApi(pathname, body));
    return {response, corsOrigin};
  }

  async handleEvents(req, res) {
    if (req.method !== 'GET') fail('V6 events require GET.', 405, 'method_not_allowed');
    const corsOrigin = this.authorize(req);
    if (this.clients.size >= this.maxSseClients) fail('The V6 event stream is busy. Try again shortly.', 429, 'events_full');
    await this.initialize();
    await this.ensureRpc();
    if (this.clients.size >= this.maxSseClients) fail('The V6 event stream is busy. Try again shortly.', 429, 'events_full');
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    };
    if (corsOrigin) { headers['Access-Control-Allow-Origin'] = corsOrigin; headers.Vary = 'Origin'; }
    res.writeHead(200, headers);
    res.write('retry: 2000\n\n');
    const client = {res, req};
    this.clients.add(client);
    this.networkFeed.clients.add(res);
    res.write(`data: ${JSON.stringify(this.networkFeed.snapshot())}\n\n`);
    const keepalive = setInterval(() => { if (!res.destroyed) res.write(': keepalive\n\n'); }, 10000);
    const close = () => {
      if (!this.clients.has(client)) return;
      clearInterval(keepalive);
      this.clients.delete(client);
      this.networkFeed.clients.delete(res);
      if (!res.destroyed) res.end();
    };
    const lifetime = setTimeout(close, this.sseLifetimeMs);
    req.on('close', () => { clearTimeout(lifetime); close(); });
  }

  startLease() {
    if (this.startedAt !== null) return;
    this.startedAt = this.now();
    const maximumDeadline = this.startedAt + DEFAULT_LEASE_MS;
    const requestedDeadline = this.leaseDeadlineMs > 0 ? this.leaseDeadlineMs : this.startedAt + this.maxRuntimeMs;
    if (this.leaseDeadlineMs > 0 && requestedDeadline > maximumDeadline) throw new CloudRuntimeError('The V6 lease deadline must be within 30 minutes of container start.', 503, 'lease_deadline_invalid');
    this.effectiveLeaseDeadline = Math.max(this.startedAt, requestedDeadline);
    // Reserve the bounded drain window inside the prepaid lease.  Existing
    // work gets at most this window to finish; no graceful shutdown can keep
    // the container alive past the DO-provided absolute deadline.
    const stopAt = Math.max(this.startedAt, this.effectiveLeaseDeadline - this.drainMs);
    this.leaseMs = stopAt - this.startedAt;
    const remaining = this.leaseMs;
    if (remaining <= 0) void this.expireLease();
    else this.leaseTimer = setTimeout(() => { void this.expireLease(); }, remaining);
    this.leaseTimer?.unref?.();
  }

  async expireLease() {
    if (this.leaseExpired || this.stopping) return;
    this.leaseExpired = true;
    this.accepting = false;
    this.queue.stop();
    await this.shutdown({reason: 'lease-expired'});
  }

  async shutdown({reason = 'shutdown'} = {}) {
    if (this.shutdownPromise) return this.shutdownPromise;
    this.shutdownPromise = (async () => {
      this.stopping = true;
      this.accepting = false;
      if (this.leaseTimer) clearTimeout(this.leaseTimer);
      this.queue.stop();
      // Every accepted V6 transaction writes its journal to the bridge before
      // this queue task can submit.  Drain that bounded queue before closing
      // sockets so SIGTERM cannot cut off a journal write silently.
      const untilDeadline = this.effectiveLeaseDeadline ? Math.max(0, this.effectiveLeaseDeadline - this.now()) : this.drainMs;
      await this.queue.drain(Math.min(this.drainMs, untilDeadline));
      for (const client of [...this.clients]) {
        this.networkFeed.clients.delete(client.res);
        if (!client.res.destroyed) client.res.end();
      }
      this.clients.clear();
      this.networkFeed.close();
      await this.disconnectRpc();
      this.rpcReady = false;
      if (this.server?.listening) await new Promise(resolve => this.server.close(() => resolve()));
      this.shutdownReason = reason;
      return this.status();
    })();
    return this.shutdownPromise;
  }

  async handleHttp(req, res) {
    const pathname = new URL(req.url || '/', 'http://v6-cloud.internal').pathname;
    try {
      // Container health checks must remain cheap and must never wake RPC.
      if (pathname === '/health') {
        if (req.method !== 'GET') throw new CloudRuntimeError('Health checks require GET.', 405, 'method_not_allowed');
        await sendResponse(res, json({ok: true, ...this.status()}));
        return;
      }
      if (pathname === '/api/v6/events') { await this.handleEvents(req, res); return; }
      if (pathname.startsWith('/api/v6/')) {
        const {response, corsOrigin} = await this.handleApiRequest(req);
        await sendResponse(res, response, corsOrigin);
        return;
      }
      throw new CloudRuntimeError('Not found.', 404, 'not_found');
    } catch (error) {
      const status = Number.isInteger(error?.status) ? error.status : 503;
      const headers = {'Cache-Control': 'no-store'};
      const origin = this.publicOrigin && req.headers.origin === this.publicOrigin ? this.publicOrigin : null;
      if (origin) { headers['Access-Control-Allow-Origin'] = origin; headers.Vary = 'Origin'; }
      try { await sendResponse(res, json({error: publicError(error)}, status, headers), null); } catch { if (!res.headersSent) { res.writeHead(status, headers); res.end(JSON.stringify({error: publicError(error)})); } }
    }
  }

  createServer() {
    const server = createServer((req, res) => { void this.handleHttp(req, res); });
    server.requestTimeout = 30000;
    server.headersTimeout = 35000;
    server.keepAliveTimeout = 5000;
    this.server = server;
    return server;
  }

  async listen() {
    if (!this.server) this.createServer();
    this.startLease();
    await new Promise((resolvePromise, reject) => {
      const onError = error => { this.server.off('listening', onListening); reject(error); };
      const onListening = () => { this.server.off('error', onError); resolvePromise(); };
      this.server.once('error', onError);
      this.server.once('listening', onListening);
      this.server.listen(this.port, this.host);
    });
    const boundPort = this.server.address()?.port;
    if (Number.isInteger(boundPort)) this.port = boundPort;
    return this.server;
  }
}

export async function startCloudServer(options = {}) {
  const runtime = options.runtime || new V6CloudRuntime(options);
  await runtime.listen();
  const signals = options.installSignals === false ? [] : ['SIGTERM', 'SIGINT'];
  for (const signal of signals) process.once(signal, () => { void runtime.shutdown({reason: signal}); });
  console.log(JSON.stringify({cloud: `http://${runtime.host}:${runtime.port}`, network: NETWORK, leaseMs: runtime.leaseMs}));
  return {runtime, server: runtime.server};
}

export function createCloudServer(options = {}) {
  const runtime = options instanceof V6CloudRuntime ? options : options.runtime || new V6CloudRuntime(options);
  return {runtime, server: runtime.createServer()};
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  startCloudServer().catch(error => {
    console.error(publicError(error));
    process.exitCode = 1;
  });
}
