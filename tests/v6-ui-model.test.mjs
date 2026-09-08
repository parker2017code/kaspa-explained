import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {
  V6_CAUSAL_STAGES,
  V6_CHAPTERS,
  V6_STEPS,
  getV6Lesson,
  getV6StepCopy,
  normalizeV6View,
  v6CompletedCount,
  v6RemainingMinutes,
} from '../src/v6-lessons.mjs';

test('V6 is a finite six chapter tour with an honest time estimate', () => {
  assert.equal(V6_CHAPTERS.length, 6);
  assert.deepEqual(V6_STEPS, ['intro', 'risk', 'review', 'pending', 'outcome', 'complete']);
  assert.deepEqual(V6_CAUSAL_STAGES.map(stage => stage.id), ['problem', 'rule', 'authorize', 'submit', 'observe', 'consequence']);
  const ids = new Set(V6_CHAPTERS.map(lesson => lesson.id));
  assert.equal(ids.size, 6);
  const minutes = V6_CHAPTERS.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0);
  assert.ok(minutes >= 12 && minutes <= 15);
  assert.equal(v6CompletedCount({completed: []}), 0);
  assert.equal(v6RemainingMinutes({completed: []}), minutes);
  assert.equal(v6CompletedCount({completed: ['atomic-exchange', '3']}), 2);
});

test('the first chapter states the trust problem in the required concrete language', () => {
  const lesson = getV6Lesson(0);
  assert.equal(lesson.problem, 'Seller wants your coins before giving the tool');
  assert.match(getV6StepCopy(0, 'risk').body, /unsafe proposal/i);
  assert.ok(lesson.technology.some(item => item.name === 'Argent' && /buyer and seller/i.test(item.context)));
  assert.ok(lesson.technology.some(item => item.name === 'SilverScript'));
  assert.ok(lesson.technology.some(item => item.name === 'Kaspa'));
  assert.ok(lesson.technology.some(item => item.name === 'KIP-20' && /lineage/i.test(item.context)));
});

test('proof chapter describes the bounded implemented task without a privacy claim', () => {
  const lesson = getV6Lesson(5);
  assert.ok(lesson.technology.some(item => item.name === 'R1CS'));
  assert.match(lesson.boundary, /1–15/);
  assert.match(lesson.boundary, /score is 42 and sum is 13/);
  assert.match(lesson.boundary, /recipient x-only key and nonce/);
  assert.match(lesson.boundary, /no privacy guarantee/i);
  assert.ok(!lesson.technology.some(item => item.name === 'Argent'));
});

test('Pip and coordination copy match their actual constrained transitions', () => {
  assert.match(getV6Lesson(1).rule, /at most 2 crops.*at least 1 resource/);
  assert.doesNotMatch(getV6StepCopy(1, 'outcome').body, /over-cap request left/);
  assert.match(getV6Lesson(3).rule, /3 distinct ready pledges/);
  assert.ok(!getV6Lesson(3).technology.some(item => item.name === 'Argent'));
  assert.match(getV6Lesson(0).boundary, /not a full KCC20/);
});

test('view normalization keeps demo funds separate from a personal wallet and preserves evidence boundaries', () => {
  const initial = normalizeV6View({});
  assert.equal(initial.chapter, 0);
  assert.equal(initial.step, 'intro');
  assert.equal(initial.wallet.connected, false);
  assert.equal(initial.wallet.label, 'Demo funds');
  assert.equal(initial.progress.total, 6);
  assert.equal(initial.evidence.boundary, V6_CHAPTERS[0].boundary);

  const accepted = normalizeV6View({
    chapter: 4,
    step: 'pending',
    wallet: {connected: true, label: 'Testnet demo'},
    operation: {phase: 'accepted', transactionId: 'a'.repeat(64), acceptingBlock: 'b'.repeat(64)},
    network: {status: 'Accepted by Testnet-10', blocks: [{hash: 'b'.repeat(64), parents: ['c'.repeat(64)]}]},
  });
  assert.equal(accepted.wallet.label, 'Testnet demo');
  assert.equal(accepted.operation.acceptingBlock, 'b'.repeat(64));
  assert.equal(accepted.network.blocks.length, 1);
  assert.equal(accepted.scene.kind, 'delivery');
});

test('the UI owns a stable scene callback and the responsive splitter contract', async () => {
  const source = await readFile(new URL('../src/v6-ui.mjs', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/v6.css', import.meta.url), 'utf8');
  assert.match(source, /onSceneReady\(scene\)/);
  assert.equal((source.match(/onDagReady\(dagHost\)/g) || []).length, 1);
  assert.equal((source.match(/sceneEvidence.innerHTML =/g) || []).length, 1);
  assert.match(source, /data-v6-scene/);
  assert.match(source, /data-v6-resizer/);
  assert.match(source, /kaspa-v6-info-width/);
  assert.match(source, /kaspa-v6-scene-height/);
  assert.match(css, /grid-template-columns:\s*minmax\(0, 1fr\)\s+44px\s+minmax\(300px, var\(--v6-info-width\)\)/);
  assert.match(css, /@media \(max-width: 999px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /min-height:\s*44px/);
  assert.doesNotMatch(css, /position:\s*absolute[^;]*;[^}]*v6-info-pane/);
});
