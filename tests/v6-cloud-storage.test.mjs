import test from 'node:test';
import assert from 'node:assert/strict';
import {V6CloudStorage, CloudStatePoisonedError} from '../server/v6-cloud-storage.mjs';

const response = (body, status = 200, headers = {}) => new Response(body === undefined ? '' : JSON.stringify(body), {
  status,
  headers: {'Content-Type': 'application/json', ...headers},
});

function bridge(initial = {}, {onPut = null} = {}) {
  const state = {revision: 0, records: structuredClone(initial)}, calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({url, options, body: options.body ? JSON.parse(options.body) : null});
    if (options.method === 'PUT') {
      if (onPut) return onPut({state, options});
      const payload = JSON.parse(options.body);
      if (payload.revision !== state.revision) return response({error: 'conflict'}, 409);
      state.revision += 1;
      state.records = structuredClone(payload.records);
      return response({revision: state.revision});
    }
    return response({revision: state.revision, records: state.records});
  };
  return {state, calls, fetchImpl};
}

test('cloud state hydrates once and returns isolated JSON-safe clones', async () => {
  const b = bridge({session: {nested: {count: 1}}});
  const store = new V6CloudStorage({bridgeUrl: 'https://worker.test/internal/v6/state', bridgeToken: 'state-secret', fetchImpl: b.fetchImpl});
  const [first, second] = await Promise.all([store.get('session'), store.get('session')]);
  assert.deepEqual(first, {nested: {count: 1}});
  first.nested.count = 99;
  assert.equal(second.nested.count, 1);
  assert.equal((await store.get('session')).nested.count, 1);
  assert.equal(b.calls.filter(call => !call.options.method || call.options.method === 'GET').length, 1);
});

test('cloud state PUT is a revisioned CAS and updates the local snapshot only after confirmation', async () => {
  const b = bridge({state: {version: 1}});
  const store = new V6CloudStorage({bridgeUrl: 'https://worker.test/internal/v6/state', bridgeToken: 'state-secret', fetchImpl: b.fetchImpl});
  await store.hydrate();
  const result = await store.put({'v6:session:one': {value: 3}});
  assert.equal(store.revision, 1);
  assert.deepEqual(result['v6:session:one'], {value: 3});
  const put = b.calls.find(call => call.options.method === 'PUT');
  assert.equal(put.body.revision, 0);
  assert.deepEqual(put.body.records['v6:session:one'], {value: 3});
  const read = await store.get('v6:session:one');
  read.value = 8;
  assert.equal((await store.get('v6:session:one')).value, 3);
});

test('CAS conflict poisons the process and prevents later reads or writes', async () => {
  const b = bridge({state: {version: 1}}, {onPut: () => response({error: 'conflict'}, 409)});
  const store = new V6CloudStorage({bridgeUrl: 'https://worker.test/internal/v6/state', bridgeToken: 'state-secret', fetchImpl: b.fetchImpl});
  await assert.rejects(store.put({state: {version: 2}}), CloudStatePoisonedError);
  assert.equal(store.isPoisoned, true);
  const calls = b.calls.length;
  await assert.rejects(store.get('state'), CloudStatePoisonedError);
  await assert.rejects(store.put({other: true}), CloudStatePoisonedError);
  assert.equal(b.calls.length, calls);
});

test('an uncertain PUT result poisons the process and leaves the prior snapshot intact', async () => {
  const b = bridge({state: {version: 1}}, {onPut: async () => { throw new Error('connection reset after write'); }});
  const store = new V6CloudStorage({bridgeUrl: 'https://worker.test/internal/v6/state', bridgeToken: 'state-secret', fetchImpl: b.fetchImpl});
  await assert.rejects(store.put({state: {version: 2}}), CloudStatePoisonedError);
  assert.equal(store.isPoisoned, true);
  assert.deepEqual(store.records.state, {version: 1});
  await assert.rejects(store.get('state'), CloudStatePoisonedError);
});

test('state size is bounded before any remote PUT', async () => {
  const b = bridge({});
  const store = new V6CloudStorage({bridgeUrl: 'https://worker.test/internal/v6/state', bridgeToken: 'state-secret', fetchImpl: b.fetchImpl, maxBytes: 128});
  await assert.rejects(store.put({large: 'x'.repeat(200)}), error => error.status === 413);
  assert.equal(b.calls.filter(call => call.options.method === 'PUT').length, 0);
  assert.equal(store.isPoisoned, false);
});

test('missing bridge configuration does not fabricate local state', async () => {
  const store = new V6CloudStorage({bridgeUrl: '', bridgeToken: '', fetchImpl: async () => response({revision: 0, records: {}})});
  await assert.rejects(store.hydrate(), error => error.status === 503 && !store.isPoisoned);
  assert.equal(store.loaded, false);
});
