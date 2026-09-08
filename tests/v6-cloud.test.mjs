import test from 'node:test';
import assert from 'node:assert/strict';
import {V6CloudRuntime, SerialWorkQueue} from '../server/v6-cloud.mjs';
import {V6CloudStorage} from '../server/v6-cloud-storage.mjs';

class TestStorage {
  constructor() { this.records = {}; this.hydrateCalls = 0; }
  async hydrate() { this.hydrateCalls += 1; return this.records; }
  async get(key) { return structuredClone(this.records[key]); }
  async put(values) { Object.assign(this.records, structuredClone(values)); }
  snapshot() { return {loaded: true, revision: 0, poisoned: false}; }
}

function rpcFixture() {
  let calls = 0;
  return {
    get calls() { return calls; },
    async connect() { calls += 1; },
    async getServerInfo() { calls += 1; return {networkId: 'testnet-10', isSynced: true, hasUtxoIndex: true}; },
    async getUtxosByAddresses() { calls += 1; return {entries: []}; },
  };
}

function runtimeFixture(overrides = {}) {
  const storage = overrides.storage || new TestStorage();
  const rpc = overrides.rpc || rpcFixture();
  const key = overrides.key || {toAddress: () => ({toString: () => 'kaspatest:fixture'})};
  const runtime = new V6CloudRuntime({
    storage,
    rpc,
    key,
    address: 'kaspatest:fixture',
    authToken: 'proxy-secret',
    publicOrigin: 'https://kaspaexplained.com',
    artifacts: {argentTemplates: {}, advancedTemplates: {}, launchTemplate: {}, proofTemplates: {}},
    sdk: {},
    host: '127.0.0.1',
    port: 0,
    rpcTimeoutMs: 1000,
    installSignals: false,
    ...overrides,
  });
  return {runtime, storage, rpc};
}

async function request(runtime, path, {method = 'POST', body = {id: 'request'}, auth = 'proxy-secret', origin = 'https://kaspaexplained.com', headers = {}} = {}) {
  const requestHeaders = {};
  for (const [key, value] of Object.entries(headers)) requestHeaders[key.toLowerCase()] = value;
  if (auth !== null) requestHeaders['x-v6-bridge-token'] = auth;
  if (origin !== null) requestHeaders.origin = origin;
  const payload = method === 'POST' ? JSON.stringify(body) : '';
  if (method === 'POST') requestHeaders['content-type'] = requestHeaders['content-type'] || 'application/json';
  requestHeaders['content-length'] = String(Buffer.byteLength(payload));
  let closeHandler;
  const req = {
    url: path,
    method,
    headers: requestHeaders,
    on(event, fn) { if (event === 'close') closeHandler = fn; },
    async *[Symbol.asyncIterator]() { if (payload) yield Buffer.from(payload); },
  };
  const chunks = [];
  const res = {
    statusCode: 200,
    headers: {},
    destroyed: false,
    headersSent: false,
    writeHead(status, headers) { this.statusCode = status; this.headers = headers; this.headersSent = true; },
    write(chunk) { chunks.push(Buffer.from(chunk)); return true; },
    end(chunk) { if (chunk) chunks.push(Buffer.from(chunk)); this.ended = true; closeHandler?.(); },
  };
  await runtime.handleHttp(req, res);
  return {status: res.statusCode, headers: res.headers, text: () => Promise.resolve(Buffer.concat(chunks).toString('utf8')), json: async () => JSON.parse(Buffer.concat(chunks).toString('utf8'))};
}

test('health is a cheap container check and never opens RPC', async () => {
  const {runtime, rpc} = runtimeFixture();
  try {
    const result = await request(runtime, '/health', {method: 'GET', auth: null, origin: null});
    assert.equal(result.status, 200);
    assert.equal((await result.json()).ok, true);
    assert.equal(rpc.calls, 0);
  } finally { await runtime.shutdown(); }
});

test('the container accepts only authenticated, same-origin V6 POSTs and never exposes faucet or V5 routes', async () => {
  const {runtime, rpc} = runtimeFixture({serviceFactory: async () => ({handle: async () => Response.json({ok: true})})});
  try {
    assert.equal((await request(runtime, '/api/v6/status', {auth: 'wrong'})).status, 401);
    assert.equal((await request(runtime, '/api/v6/status', {origin: 'https://other.example'})).status, 403);
    assert.equal((await request(runtime, '/api/v6/status', {method: 'GET'})).status, 405);
    assert.equal((await request(runtime, '/api/faucet')).status, 404);
    assert.equal((await request(runtime, '/api/v5/start')).status, 404);
    assert.equal((await request(runtime, '/api/v6/status')).status, 200);
    assert.ok(rpc.calls > 0);
  } finally { await runtime.shutdown(); }
});

test('incoming bodies are capped before they reach the V6 service', async () => {
  const {runtime} = runtimeFixture({serviceFactory: async () => ({handle: async () => Response.json({ok: true})})});
  try {
    const result = await request(runtime, '/api/v6/status', {body: {oversized: 'x'.repeat(70 * 1024)}});
    assert.equal(result.status, 413);
  } finally { await runtime.shutdown(); }
});

test('a new visitor observes an abandoned shared transaction before using the treasury', async () => {
  const storage = new TestStorage();
  storage.records = {state: {pending: {purpose: 'v6', sessionId: 'previous'}}, 'v6:session:previous': {id: 'previous', pending: {transactionId: 'saved'}}};
  const order = [];
  const {runtime} = runtimeFixture({storage, serviceFactory: async () => ({
    reconcile: async (session, options) => { assert.equal(session.id, 'previous'); assert.deepEqual(options, {allowBroadcast: false}); order.push('observe'); },
    handle: async () => { order.push('request'); return Response.json({ok: true}); },
  })});
  try {
    assert.equal((await request(runtime, '/api/v6/start', {body: {id: 'next'}})).status, 200);
    assert.deepEqual(order, ['observe', 'request']);
    delete storage.records['v6:session:previous'];
    assert.equal((await request(runtime, '/api/v6/start', {body: {id: 'third'}})).status, 503);
    assert.deepEqual(order, ['observe', 'request']);
  } finally { await runtime.shutdown(); }
});

test('event streams are bounded and expire for reconnecting clients', async () => {
  const {runtime} = runtimeFixture({maxSseClients: 1, sseLifetimeMs: 20});
  try {
    const first = await request(runtime, '/api/v6/events', {method: 'GET'});
    assert.equal(first.status, 200);
    assert.equal((await request(runtime, '/api/v6/events', {method: 'GET'})).status, 429);
    await new Promise(resolve => setTimeout(resolve, 35));
    assert.equal(runtime.clients.size, 0);
    assert.equal((await request(runtime, '/api/v6/events', {method: 'GET'})).status, 200);
  } finally { await runtime.shutdown(); }
});

test('the API work queue is serial and rejects its 20th occupied slot plus later work', async () => {
  const queue = new SerialWorkQueue({maxDepth: 2});
  let release;
  const blocker = new Promise(resolve => { release = resolve; });
  const first = queue.enqueue(async () => blocker);
  const second = queue.enqueue(async () => 'second');
  assert.throws(() => queue.enqueue(async () => 'third'), error => error.status === 429);
  release();
  assert.equal(await first, undefined);
  assert.equal(await second, 'second');
  assert.equal(queue.size(), 0);
});

test('a short absolute lease stops new work before its deadline and accepts a test runtime limit', async () => {
  const now = 1_800_000_000_000;
  const {runtime} = runtimeFixture({now: () => Date.now(), maxRuntimeMs: 100, drainMs: 20});
  runtime.startLease();
  assert.equal(runtime.startedAt !== null, true);
  await new Promise(resolve => setTimeout(resolve, 130));
  assert.equal(runtime.leaseExpired, true);
  assert.equal(runtime.accepting, false);
  await runtime.shutdown();
  const invalid = runtimeFixture({now: () => now, leaseDeadlineMs: now + 30 * 60 * 1000 + 1});
  assert.throws(() => invalid.runtime.startLease(), error => error.code === 'lease_deadline_invalid');
});

test('missing treasury key blocks initialization instead of creating one', async () => {
  const {runtime} = runtimeFixture({key: null, env: {V6_TREASURY_KEY: ''}});
  runtime.key = null;
  runtime.keyHex = '';
  await assert.rejects(runtime.initialize(), error => error.code === 'treasury_key_missing');
});

test('a state CAS failure reaches the API as a fail-closed error before broadcast', async () => {
  let broadcasts = 0;
  const fetchImpl = async (_url, options = {}) => {
    if (options.method === 'PUT') return new Response(JSON.stringify({error: 'conflict'}), {status: 409, headers: {'Content-Type': 'application/json'}});
    return new Response(JSON.stringify({revision: 0, records: {}}), {headers: {'Content-Type': 'application/json'}});
  };
  const storage = new V6CloudStorage({bridgeUrl: 'https://worker.test/internal/v6/state', bridgeToken: 'state-secret', fetchImpl});
  const {runtime} = runtimeFixture({storage, serviceFactory: async ({runtime: host}) => ({handle: async () => {
    await host.storage.put({state: {pending: {transactionId: 'fixture'}}});
    await host.rpc.submitTransaction?.({transaction: {id: 'fixture'}});
    broadcasts += 1;
    return Response.json({ok: true});
  }})});
  const result = await request(runtime, '/api/v6/status');
  assert.equal(result.status, 503);
  assert.equal(broadcasts, 0);
  assert.equal(storage.isPoisoned, true);
});
