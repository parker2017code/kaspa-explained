import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {Miniflare, convertV4MiniflareOptions} from 'miniflare';
import {__v6} from '../cloudflare/worker.mjs';

// Use real workerd RPC, SQLite transactions and the installed Container base.
// Only the process handle is inert: these checks must never start a signer.
async function runtime(t) {
  const bundle = await build({
    stdin: {resolveDir: fileURLToPath(new URL('..', import.meta.url)), contents: `
      import {Container} from '@cloudflare/containers';
      import worker, {createV6ContainerClass} from './cloudflare/worker.mjs';
      class LocalContainer extends Container {
        constructor(ctx, env) {
          Object.defineProperty(ctx, 'container', {value: {running: false}});
          super(ctx, env);
        }
        async alarm() {}
      }
      export class V6Container extends createV6ContainerClass(LocalContainer) {
        budgetRows() { return this.ctx.storage.sql.exec('SELECT * FROM v6_request_budget ORDER BY bucket, subject').toArray(); }
        failWrites() {
          this.ctx.storage.sql.exec(\"CREATE TRIGGER fail_budget BEFORE INSERT ON v6_request_budget WHEN NEW.subject LIKE 'session:%' BEGIN SELECT RAISE(ABORT, 'private storage detail'); END\");
        }
      }
      export default {async fetch(request, env) {
        const path = new URL(request.url).pathname;
        const instance = env.V6_CONTAINER.getByName('v6-shared');
        if (path === '/consume') return Response.json(await instance.consumeBudgets(await request.json()));
        if (path === '/rows') return Response.json(await instance.budgetRows());
        if (path === '/fail') { await instance.failWrites(); return new Response('ok'); }
        return worker.fetch(request, env);
      }};
    `},
    bundle: true, write: false, format: 'esm', external: ['cloudflare:workers'],
  });
  const mf = new Miniflare(convertV4MiniflareOptions({
    modules: true, compatibilityDate: '2026-09-08',
    bindings: {V6_PUBLIC_ORIGIN: 'https://public.example'},
    durableObjects: {V6_CONTAINER: {className: 'V6Container', useSQLite: true}},
    script: bundle.outputFiles[0].text,
  }));
  t.after(() => mf.dispose());
  return {
    consume: async body => (await mf.dispatchFetch('https://public.example/consume', {method: 'POST', body: JSON.stringify(body)})).json(),
    rows: async () => (await mf.dispatchFetch('https://public.example/rows')).json(),
    fail: () => mf.dispatchFetch('https://public.example/fail'),
    publicRequest: () => mf.dispatchFetch('https://public.example/api/v6/status', {method: 'POST', headers: {Origin: 'https://public.example', 'Content-Type': 'application/json'}, body: JSON.stringify({id: 'session'})}),
  };
}

test('cold Container RPC initializes SQLite and concurrent requests enforce the exact IP cap atomically', async t => {
  const fixture = await runtime(t);
  const now = 1_800_000_000_000;
  const attempts = await Promise.all(Array.from({length: __v6.LIMITS.ipMinute + 20}, () => fixture.consume({ip: '192.0.2.1', sessionId: 'session', now})));
  assert.equal(attempts.filter(result => result.ok).length, __v6.LIMITS.ipMinute);
  assert.equal(attempts.filter(result => result.code === 'request_budget_exhausted').length, 20);
  assert.deepEqual((await fixture.rows()).map(row => row.count), Array(4).fill(__v6.LIMITS.ipMinute));
  assert.equal((await fixture.consume({ip: '192.0.2.1', sessionId: 'session', now: now + 180000})).ok, true);
  const rows = await fixture.rows();
  assert.equal(rows.some(row => row.bucket === `minute:${Math.floor(now / 60000)}`), false);
  assert.equal(rows.find(row => row.subject === 'session:session').count, __v6.LIMITS.ipMinute + 1);
});

test('SQLite failure rolls back every counter and public API fails closed with a safe storage code', async t => {
  const fixture = await runtime(t);
  await fixture.fail();
  assert.deepEqual(await fixture.consume({ip: '192.0.2.1', sessionId: 'session'}), {ok: false, code: 'budget_unavailable'});
  assert.deepEqual(await fixture.rows(), []);
  const response = await fixture.publicRequest();
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('Retry-After'), '60');
  const body = await response.json();
  assert.equal(body.code, 'budget_unavailable');
  assert.equal(JSON.stringify(body).includes('private storage detail'), false);
  assert.deepEqual(await fixture.rows(), []);
});
