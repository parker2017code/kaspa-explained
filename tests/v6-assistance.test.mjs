import test from 'node:test';
import assert from 'node:assert/strict';
import {V6Service} from '../server/v6-service.mjs';

const auth = {id: '20000000-0000-4000-8000-000000000006', capability: 'ab'.repeat(32)};
const input = {owner: '12'.repeat(32), taskNonce: '34'.repeat(16), allocation: 6, rate: 7};
const request = (path, body) => new Request('https://example.test/api/v6/' + path, {method: 'POST', body: JSON.stringify(body)});
function fixture() {
  const records = {};
  const storage = {async get(key) {return structuredClone(records[key]);}, async put(values) {Object.assign(records, structuredClone(values));}};
  const service = new V6Service({storage});
  let calls = 0;
  service.proofModule = async () => ({generateProof: async value => {calls++; return {...value, verified: true, proof: 'fixture'};}});
  for (const method of ['startOperation', 'reconcile', 'signFor', 'funding', 'allRoles', 'persistPending']) service[method] = () => {throw Error('Unexpected treasury operation: ' + method);};
  return {service, records, storage, get calls() {return calls;}, call: (path, extra = {}) => service.handle(request(path, {...auth, ...extra}))};
}

test('assistance registration and status are durable, idempotent and never enter treasury work', async () => {
  const f = fixture();
  for (let i = 0; i < 2; i++) {
    const result = await f.call('start', {mode: 'browser-assistance'});
    assert.equal(result.status, 200);
    assert.deepEqual((await result.json()).session, {id: auth.id, mode: 'browser-assistance', proofCalls: 0, maxProofCalls: 12});
  }
  assert.equal(Object.keys(f.records).length, 1);
  assert.equal(f.records[`v6:session:${auth.id}`].revision, 1);
  assert.equal((await f.call('status')).status, 200);
  assert.equal((await f.call('start')).status, 409);
  assert.equal((await f.call('action', {requestId: 'first', action: 'purchase'})).status, 409);
  assert.equal((await f.call('start', {mode: 'browser-assistance', capability: 'cd'.repeat(32)})).status, 401);
  assert.equal((await f.call('start', {mode: 'browser-assistance', key: 'not accepted'})).status, 400);
  assert.equal(f.calls, 0);
});

test('proof authorization and strict validation prevent native generation', async () => {
  const f = fixture();
  assert.equal((await f.call('proof', input)).status, 401);
  await f.call('start', {mode: 'browser-assistance'});
  assert.equal((await f.call('proof', {...input, capability: 'cd'.repeat(32)})).status, 401);
  for (const patch of [{owner: 'bad'}, {owner: 12}, {taskNonce: 'ff'.repeat(32)}, {allocation: '6'}, {rate: 0}, {allocation: 16}, {allocation: 5}, {rate: 6}, {executable: '/bad'}]) {
    assert.equal((await f.call('proof', {...input, ...patch})).status, 400, JSON.stringify(patch));
  }
  assert.equal(f.calls, 0);
});

test('concurrent identical proofs share a durable cache, including canonical nonce encodings', async () => {
  const f = fixture();
  await f.call('start', {mode: 'browser-assistance'});
  const responses = await Promise.all(Array.from({length: 10}, () => f.call('proof', input)));
  assert.equal(responses.every(response => response.status === 200), true);
  assert.equal(f.calls, 1);
  const cached = await f.call('proof', {...input, taskNonce: input.taskNonce.padEnd(64, '0')});
  assert.equal((await cached.json()).cached, true);
  const freshService = new V6Service({storage: f.storage});
  freshService.proofModule = () => {throw Error('Cache must survive service recreation');};
  assert.equal((await freshService.handle(request('proof', {...auth, ...input}))).status, 200);
  assert.equal(f.calls, 1);
});

test('twelve charged attempts cap proof generation while already cached requests remain available', async () => {
  const f = fixture();
  await f.call('start', {mode: 'browser-assistance'});
  for (let n = 0; n < 12; n++) assert.equal((await f.call('proof', {...input, taskNonce: n.toString(16).padStart(32, '0')})).status, 200);
  assert.equal((await f.call('proof', input)).status, 429);
  assert.equal((await f.call('proof', {...input, taskNonce: '0'.repeat(32)})).status, 200);
  assert.equal(f.calls, 12);
});

test('failed generation is durably charged and does not expose native error details', async () => {
  const f = fixture();
  await f.call('start', {mode: 'browser-assistance'});
  f.service.proofModule = async () => ({generateProof() {throw Error('private executable path');}});
  for (let n = 0; n < 12; n++) {
    const response = await f.call('proof', input);
    assert.equal(response.status, 503);
    assert.equal((await response.text()).includes('private'), false);
  }
  assert.equal((await f.call('proof', input)).status, 429);
  assert.equal(f.records[`v6:session:${auth.id}`].proofCalls, 12);
});

test('legacy identities cannot be converted to assistance or used for proof generation', async () => {
  const f = fixture();
  await f.call('start', {mode: 'browser-assistance'});
  delete f.records[`v6:session:${auth.id}`].mode;
  assert.equal((await f.call('start', {mode: 'browser-assistance'})).status, 409);
  assert.equal((await f.call('proof', input)).status, 409);
  assert.equal(f.calls, 0);
});

test('a failed attempt reservation prevents generation', async () => {
  const f = fixture();
  await f.call('start', {mode: 'browser-assistance'});
  f.storage.put = async () => {throw Error('Storage unavailable');};
  assert.equal((await f.call('proof', input)).status, 503);
  assert.equal(f.calls, 0);
  assert.equal(f.records[`v6:session:${auth.id}`].proofCalls, 0);
});
