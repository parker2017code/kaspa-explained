/**
 * Apply a dead-css-scan.mjs classification report to a stylesheet: delete
 * every rule classified "dead" (matches no element anywhere) or
 * "overridden" (matches elements but its declarations never win the
 * cascade anywhere), leaving every "live" rule untouched, including every
 * live rule in the legacy region (those are load-bearing and are reported,
 * never silently removed).
 *
 * Deletion is by exact source byte span (ruleStart..ruleEnd from the
 * report, which came from the same tokenizer that was alignment-validated
 * against the live CSSOM), so the edit cannot drift from what was actually
 * classified. A cosmetic cleanup pass afterward collapses runs of blank
 * lines left behind and strips @media blocks emptied by the removal.
 *
 * Usage:
 *   node scripts/apply-dead-css-removal.mjs <cssPath> <reportJson> <outCssPath>
 *
 * Prints a summary of what was removed and every live-legacy rule found
 * (load-bearing, left in place) to stderr.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [, , cssPath, reportPath, outPath] = process.argv;
if (!cssPath || !reportPath || !outPath) {
  console.error('Usage: node scripts/apply-dead-css-removal.mjs <cssPath> <reportJson> <outCssPath>');
  process.exit(1);
}

const cssText = readFileSync(cssPath, 'utf8');
const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const rules = report.rules;

const toRemove = rules.filter((r) => r.classification === 'dead' || r.classification === 'overridden');
const liveLegacy = rules.filter((r) => r.classification === 'live' && r.region === 'legacy');

// Sanity: spans must not overlap and must be within file bounds.
toRemove.sort((a, b) => a.ruleStart - b.ruleStart);
for (let i = 1; i < toRemove.length; i++) {
  if (toRemove[i].ruleStart < toRemove[i - 1].ruleEnd) {
    throw new Error(`Overlapping removal spans at rule index ${toRemove[i - 1].index} and ${toRemove[i].index}`);
  }
}

let out = '';
let cursor = 0;
for (const r of toRemove) {
  if (r.ruleStart < cursor || r.ruleEnd > cssText.length) {
    throw new Error(`Bad span for rule index ${r.index}: [${r.ruleStart},${r.ruleEnd})`);
  }
  out += cssText.slice(cursor, r.ruleStart);
  cursor = r.ruleEnd;
}
out += cssText.slice(cursor);

// Cosmetic cleanup: collapse 3+ blank lines to 1, strip now-empty @media
// blocks (whitespace/comments only inside the braces).
out = out.replace(/\n{4,}/g, '\n\n\n');
out = out.replace(/@media[^{]*\{\s*\}/g, '');
out = out.replace(/\n{4,}/g, '\n\n\n');

writeFileSync(outPath, out);

console.error(`Input rules: ${rules.length}`);
console.error(`Removed: ${toRemove.length} (dead=${toRemove.filter((r) => r.classification === 'dead').length}, overridden=${toRemove.filter((r) => r.classification === 'overridden').length})`);
console.error(`Kept live: ${rules.filter((r) => r.classification === 'live').length}`);
console.error(`Bytes: ${cssText.length} -> ${out.length} (removed ${cssText.length - out.length})`);
console.error(`Lines: ${cssText.split('\n').length} -> ${out.split('\n').length}`);
console.error('');
console.error(`Load-bearing legacy rules (live, region=legacy, left in place): ${liveLegacy.length}`);
for (const r of liveLegacy) {
  const oneLine = r.selectorText.replace(/\s+/g, ' ').trim();
  console.error(`  [${r.index}] ${oneLine.length > 120 ? oneLine.slice(0, 117) + '...' : oneLine}`);
}
