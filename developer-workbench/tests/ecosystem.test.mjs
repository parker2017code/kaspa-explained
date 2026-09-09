import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {argentCatalog, inspectArgent, inspectKrc, krc20SchemaCatalog} from '../ecosystem-tools.mjs';

const require = createRequire(import.meta.url);
const sdk = require('../../.cache/upstream/kaspa-wasm32-sdk/nodejs/kaspa');
const address = new sdk.PrivateKey('01'.repeat(32)).toAddress('testnet-10').toString();

test('Argent catalog exposes only reviewed examples and rejects arbitrary paths', async () => {
  assert.deepEqual(argentCatalog().map(example => example.id), ['habitat', 'business', 'observer', 'ring', 'delivery']);
  await assert.rejects(inspectArgent('../../private.ag'), /Unknown Argent example/);
});

test('Argent inspector runs the pinned compiler and returns source, SilverScript, and artifacts', async () => {
  const result = await inspectArgent('ring');
  assert.equal(result.compiler.revision, 'd08e52dd1e18c9f7e9a2dc482048c2db31d25611');
  assert.match(result.source[0].code, /actor Ring/);
  assert.ok(result.generatedSilverScript.some(file => file.path.endsWith('Ring.sil') && file.code.includes('contract Ring')));
  assert.ok(result.artifacts.some(file => file.path.endsWith('artifact.json') && file.value.app === 'FixedRing'));
  assert.match(result.boundary, /No VM result/);
});

test('KRC inspector validates the supported structural subset offline', () => {
  assert.equal(krc20SchemaCatalog.operations.transfer.required.includes('amt'), true);
  const deployed = inspectKrc({p: 'krc-20', op: 'deploy', tick: 'tool', max: '21000000', lim: '1000', pre: '0', dec: '8'});
  assert.equal(deployed.valid, true);
  assert.equal(deployed.normalized.tick, 'TOOL');
  const minted = inspectKrc({p: 'krc-20', op: 'mint', tick: 'TOOL', to: address});
  assert.equal(minted.valid, true);
  const transferred = inspectKrc({p: 'krc-20', op: 'transfer', tick: 'TOOL', amt: '25', to: address});
  assert.equal(transferred.valid, true);
  assert.match(transferred.boundary, /indexer/);
});

test('KRC inspector rejects malformed data, impossible deploy bounds, and bad checksums', () => {
  assert.throws(() => inspectKrc('{'), /valid JSON/);
  const missing = inspectKrc({p: 'krc-20', op: 'transfer', tick: 'ABC', amt: '01', extra: true});
  assert.equal(missing.valid, false);
  assert.ok(missing.errors.some(error => error.includes('Missing fields: to')));
  assert.ok(missing.errors.some(error => error.includes('Unknown fields: extra')));
  assert.ok(missing.errors.some(error => error.includes('tick')));
  assert.ok(missing.errors.some(error => error.includes('amt')));
  const bounds = inspectKrc({p: 'krc-20', op: 'deploy', tick: 'TOOL', max: '100', lim: '101', pre: '102'});
  assert.ok(bounds.errors.includes('lim cannot exceed max.'));
  assert.ok(bounds.errors.includes('pre cannot exceed max.'));
  const negativePre = inspectKrc({p: 'krc-20', op: 'deploy', tick: 'TOOL', max: '100', lim: '10', pre: '-1'});
  assert.ok(negativePre.errors.some(error => error.startsWith('pre must')));
  const badAddress = inspectKrc({p: 'krc-20', op: 'transfer', tick: 'TOOL', amt: '1', to: `kaspatest:${'q'.repeat(61)}`});
  assert.ok(badAddress.errors.some(error => error.includes('checksum-valid')));
  assert.equal(missing.normalized, null);
});

test('static discovery catalogs contain only public metadata and bounded configuration', async () => {
  const {catalog} = await import('../engine.mjs');
  const discovery = catalog();
  assert.equal(discovery.synthetic, true);
  assert.deepEqual(discovery.examples.map(example => example.id), ['allowance', 'escrow', 'treasury', 'receipt', 'proof']);
  for (const example of discovery.examples) {
    assert.equal(Object.keys(example.defaults).length, example.fields.length);
    assert.ok(example.file.startsWith('contracts/public/'));
  }
  const bytes = JSON.stringify([discovery, argentCatalog()]);
  assert.doesNotMatch(bytes, /privateKey|mnemonic|signatureScript|\.local\//i);
});
