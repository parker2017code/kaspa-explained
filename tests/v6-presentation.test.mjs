import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {V6_CHAPTERS, normalizeV6View} from '../src/v6-lessons.mjs';

test('every chapter presents a grounded sender, enforced rule, outcome, and remaining trust boundary', () => {
  for (const chapter of V6_CHAPTERS) {
    assert.equal(typeof chapter.flow.sender, 'string', chapter.id);
    assert.equal(typeof chapter.flow.value, 'string', chapter.id);
    assert.equal(typeof chapter.flow.recipient, 'string', chapter.id);
    assert.match(chapter.flow.enforced, /Kaspa/i, chapter.id);
    assert.ok(chapter.flow.remaining.length > 40, chapter.id);
    assert.equal(normalizeV6View({chapter: chapter.index}).flow, chapter.flow);
  }
  assert.match(V6_CHAPTERS[1].flow.enforced, /native spending/i);
  assert.match(V6_CHAPTERS[1].flow.remaining, /does not require timber|no timber/i);
  assert.match(V6_CHAPTERS[4].flow.remaining, /cannot observe the parcel/i);
  assert.match(V6_CHAPTERS[5].flow.remaining, /no privacy claim/i);
});

test('the primary presentation keeps evidence in an accessible disclosure and preserves stable scene hooks', async () => {
  const source = await readFile(new URL('../src/v6-ui.mjs', import.meta.url), 'utf8');
  assert.match(source, /class="v6-trust-problem"/);
  assert.match(source, /class="v6-enforced-rule"/);
  assert.match(source, /<details class="v6-detail-panel"/);
  assert.match(source, /Contract and receipts/);
  assert.match(source, /What remains trusted/);
  assert.match(source, /renderOperation\(view\.operation/);
  assert.match(source, /renderHistory\(view\.history\)/);
  assert.equal((source.match(/onSceneReady\(scene\)/g) || []).length, 1);
  assert.equal((source.match(/onDagReady\(dagHost\)/g) || []).length, 1);
});
