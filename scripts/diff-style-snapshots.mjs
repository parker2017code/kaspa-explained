/**
 * Diff two computed-style-snapshot.mjs outputs. Exits 0 and prints "EMPTY
 * DIFF" only if every (page, width, theme) combo has the same element
 * count and every element's hash (own computed style + ::before +
 * ::after) is byte-identical between the two snapshots. Any mismatch is
 * reported with the combo key and element index and exits 1.
 *
 * Usage: node scripts/diff-style-snapshots.mjs <before.json> <after.json>
 */
import { readFileSync } from 'node:fs';

const [, , beforePath, afterPath] = process.argv;
const before = JSON.parse(readFileSync(beforePath, 'utf8'));
const after = JSON.parse(readFileSync(afterPath, 'utf8'));

console.error(`Before: ${before.combos} combos, ${before.totalElements} total elements.`);
console.error(`After:  ${after.combos} combos, ${after.totalElements} total elements.`);

const beforeKeys = Object.keys(before.snapshot).sort();
const afterKeys = Object.keys(after.snapshot).sort();

let problems = 0;

if (JSON.stringify(beforeKeys) !== JSON.stringify(afterKeys)) {
  console.error('COMBO SET MISMATCH');
  const onlyBefore = beforeKeys.filter((k) => !afterKeys.includes(k));
  const onlyAfter = afterKeys.filter((k) => !beforeKeys.includes(k));
  if (onlyBefore.length) console.error('  only in before: ' + onlyBefore.join(', '));
  if (onlyAfter.length) console.error('  only in after: ' + onlyAfter.join(', '));
  problems++;
}

for (const key of beforeKeys) {
  if (!after.snapshot[key]) continue;
  const b = before.snapshot[key];
  const a = after.snapshot[key];
  if (b.error || a.error) {
    if (b.error !== a.error) {
      console.error(`${key}: ERROR STATE CHANGED before="${b.error}" after="${a.error}"`);
      problems++;
    }
    continue;
  }
  if (b.count !== a.count) {
    console.error(`${key}: ELEMENT COUNT MISMATCH before=${b.count} after=${a.count}`);
    problems++;
    continue;
  }
  for (let i = 0; i < b.count; i++) {
    if (b.hashes[i] !== a.hashes[i]) {
      console.error(`${key}: element[${i}] hash mismatch before=${b.hashes[i]} after=${a.hashes[i]}`);
      problems++;
    }
  }
}

if (problems === 0) {
  console.error('EMPTY DIFF: every element, every page, every theme, every width, identical computed style.');
  process.exit(0);
} else {
  console.error(`NOT EMPTY: ${problems} mismatches.`);
  process.exit(1);
}
