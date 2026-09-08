import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {chromium, firefox, webkit} from 'playwright';
import * as core from '../src/v6-proof-core.mjs';
import * as protocol from '../src/v6-proof-protocol.mjs';

test('the server adapter preserves the core protocol exports', () => {
  for (const [name, value] of Object.entries(protocol)) {
    if (['generateProof', 'verifyProof'].includes(name)) continue;
    assert.equal(value, core[name], name);
  }
  assert.equal(core.generateProof, undefined);
  assert.equal(core.verifyProof, undefined);
});

for (const [name, engine] of Object.entries({chromium, firefox, webkit})) {
  test(`the V6 proof core imports directly in ${name}`, async () => {
    const sources = new Map(await Promise.all(['v6-proof-core.mjs', 'public-contracts.mjs'].map(async file => [
      `/${file}`, await readFile(new URL(`../src/${file}`, import.meta.url), 'utf8'),
    ])));
    const server = createServer((request, response) => {
      if (request.url === '/') {
        response.writeHead(200, {'content-type': 'text/html'});
        response.end('<!doctype html><title>V6 proof core import check</title>');
        return;
      }
      const source = sources.get(request.url);
      response.writeHead(source ? 200 : 404, {'content-type': 'text/javascript'});
      response.end(source || '');
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    let browser;
    try {
      browser = await engine.launch({headless: true});
      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:${server.address().port}/`);
      const result = await page.evaluate(async () => {
        const module = await import('/v6-proof-core.mjs');
        const state = module.initialV6ProofState({owner: '01'.repeat(32), feeSponsor: '02'.repeat(32), taskNonce: '03'.repeat(16)});
        return {
          state,
          functions: ['instantiate', 'buildOpen', 'buildRedeem', 'signV6ProofPlan', 'journal', 'derive', 'validateV6ProofPlan'].every(key => typeof module[key] === 'function'),
          nodeGlobals: [typeof process, typeof Buffer, typeof require],
          serverFunctions: ['generateProof', 'verifyProof'].some(key => key in module),
        };
      });
      assert.equal(result.functions, true);
      assert.deepEqual(result.nodeGlobals, ['undefined', 'undefined', 'undefined']);
      assert.equal(result.serverFunctions, false);
      assert.deepEqual(result.state, core.initialV6ProofState({owner: '01'.repeat(32), feeSponsor: '02'.repeat(32), taskNonce: '03'.repeat(16)}));
    } finally {
      await browser?.close();
      await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
  });
}
