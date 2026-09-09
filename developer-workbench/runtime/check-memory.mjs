// Run the complete sequential compiler workload inside a 1 GiB, no-swap container.
// cgroup peak includes Node, native children and charged filesystem cache.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {catalog, validate, exportProject} from '../engine.mjs';
import {argentCatalog, inspectArgent} from '../ecosystem-tools.mjs';
for (const example of catalog().examples) {
  const result = await validate(example.id, example.defaults);
  assert.equal(result.ok, true, result.error);
  assert.equal(result.stage, 'vm');
  console.log(`Validated ${example.id}`);
}
for (const example of argentCatalog()) {
  assert.equal((await inspectArgent(example.id)).ok, true);
  console.log(`Compiled Argent ${example.id}`);
}
assert.ok((await exportProject('proof', {})).bytes.length > 0);
const peak = await readFile('/sys/fs/cgroup/memory.peak', 'utf8');
const limit = await readFile('/sys/fs/cgroup/memory.max', 'utf8');
assert.equal(Number(limit.trim()), 1073741824, 'Run with --memory=1g --memory-swap=1g');
assert.ok(Number(peak.trim()) < 1073741824, 'Workload exceeded its memory budget');
console.log(JSON.stringify({memoryPeakBytes: Number(peak.trim()), memoryLimitBytes: Number(limit.trim()), scope: 'Linux cgroup, five examples, five Argent compiles and proof ZIP export'}));
