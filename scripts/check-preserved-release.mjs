#!/usr/bin/env node
// Exercise the exact staged Worker bundle before a preserved-assets upload.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { register } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const stage = resolve(process.argv[2] || '');
if (!process.argv[2]) throw new Error('Pass the prepared stage directory');
const report = JSON.parse(await readFile(resolve(stage, 'report.json'), 'utf8'));
const instrument = report.changed.find((item) => item.path === 'the-instrument.html');
assert(instrument, 'The withdrawn explainer must be overwritten with its redirect stub');
assert(report.retained_sample.length > 0, 'At least one unchanged asset should remain in ASSETS');
register(new URL('./preserved-binary-loader.mjs', import.meta.url), import.meta.url);
const worker = (await import(pathToFileURL(resolve(stage, 'entry.mjs')).href)).default;
const fallbackBody = new TextEncoder().encode('retained production asset');
const retainedPaths = new Set(report.retained_sample.map((path) => '/' + path));
retainedPaths.add('/__release_probe');
const paths = [];
const env = {
  ASSETS: {
    async fetch(request) {
      const path = new URL(request.url).pathname;
      paths.push(path);
      if (!retainedPaths.has(path)) return new Response('Missing asset', { status: 404 });
      return new Response(fallbackBody, {
        status: 200,
        headers: { 'Content-Type': 'text/plain', 'X-Asset-Source': 'retained' },
      });
    },
  },
};

for (const [number, item] of report.changed.entries()) {
  if (item.path === 'the-instrument.html') continue;
  const route = '/' + item.path.replace(/\.html$/, '');
  const response = await worker.fetch(new Request('https://kaspaexplained.com' + route), env);
  assert.equal(response.status, 200, item.path);
  assert.equal(response.headers.get('content-type'), item.content_type, item.path);
  const expected = await readFile(resolve(stage, report.modules[number]));
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), expected, item.path);

  const head = await worker.fetch(new Request('https://kaspaexplained.com' + route, { method: 'HEAD' }), env);
  assert.equal(head.status, 200, item.path);
  assert.equal(head.headers.get('content-length'), String(expected.length), item.path);
  assert.equal((await head.arrayBuffer()).byteLength, 0, item.path);
  if (item.path === 'satoshis-engine.epub') {
    assert.equal(response.headers.get('content-type'), 'application/epub+zip');
    assert.equal(response.headers.get('content-disposition'), 'attachment; filename="Satoshis_Engine.epub"');
    assert.equal(response.headers.get('cache-control'), 'public, max-age=3600');
    const post = await worker.fetch(new Request('https://kaspaexplained.com' + route, { method: 'POST' }), env);
    assert.equal(post.status, 405);
  }
}

for (const path of ['/the-instrument', '/the-instrument/', '/the-instrument.html', '/the-instrument/index.html']) {
  const response = await worker.fetch(new Request('https://kaspaexplained.com' + path), env);
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), 'https://kaspaexplained.com/moose');
}

const retained = await worker.fetch(new Request('https://kaspaexplained.com/__release_probe'), env);
assert.equal(retained.headers.get('x-asset-source'), 'retained');
assert.equal(await retained.text(), 'retained production asset');
assert(paths.includes('/__release_probe'));
for (const path of report.retained_sample) {
  const response = await worker.fetch(new Request('https://kaspaexplained.com/' + path), env);
  assert.equal(response.headers.get('x-asset-source'), 'retained', path);
  assert.equal(await response.text(), 'retained production asset', path);
}
const redirect = await worker.fetch(new Request('https://kaspaexplained.com/carnot-local-brownian-global.pdf'), env);
assert.equal(redirect.status, 301);
assert.equal(redirect.headers.get('location'), 'https://kaspaexplained.com/satoshis-engine.pdf');

console.log(`Staged Worker passed: ${report.changed.length} overrides, HEAD/download headers, retained-asset fallback, legacy redirect.`);
