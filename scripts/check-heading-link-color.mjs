/**
 * Heading-as-link color gate (2026-08-22).
 *
 * A card title, section title, search-result heading, or "Keep reading"
 * entry that happens to be a link must render in normal text color, never
 * in the inline-prose-link color. The bug this guards against shipped
 * twice: headings colored inline-link blue read as inline text links
 * instead of titles. A grep for a color token cannot catch this reliably,
 * because the failure mode is a *specificity* fight in styles.css -- a
 * rule as ordinary as `.prose-section a:not(.button) { color:
 * var(--link-color) }` outranks a plain `h2 a` override and wins the
 * cascade even though the intent is obviously body prose, not a title.
 * The only reliable test is what the cascade actually resolves to, so
 * this loads every real page in a headless browser and reads
 * getComputedStyle on the actual heading/anchor pairing, in both themes.
 *
 * Opt-out: if a heading is deliberately meant to read as an inline link
 * (rare), mark the element with data-heading-link-ok="true" in the page's
 * own markup and this check skips it.
 *
 * Usage: node scripts/check-heading-link-color.mjs
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const runtimeModules =
  process.env.NODE_PATH ||
  process.env.HOME + '/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  try {
    ({ chromium } = require(runtimeModules + '/playwright'));
  } catch {
    console.log('SKIPPED heading-link-color check: playwright not installed');
    process.exit(0);
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const manifest = JSON.parse(readFileSync(path.join(ROOT, 'site-manifest.json')));
const pages = [...manifest.pages, 'demos/index.html'];

const probe = () => {
  const results = [];
  const probeEl = document.createElement('div');
  probeEl.style.position = 'absolute';
  probeEl.style.opacity = '0';
  probeEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--link-color');
  document.body.appendChild(probeEl);
  const linkColorRGB = getComputedStyle(probeEl).color;
  probeEl.remove();

  const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  for (const h of headings) {
    if (h.closest('[data-heading-link-ok="true"]')) continue;

    // Direction: <h3><a>Title</a></h3> -- the anchor carries the text.
    for (const a of h.querySelectorAll('a')) {
      if (a.closest('[data-heading-link-ok="true"]')) continue;
      const color = getComputedStyle(a).color;
      if (color === linkColorRGB) {
        results.push({
          tag: h.tagName,
          text: (h.textContent || '').trim().slice(0, 60),
          pattern: 'heading wraps anchor',
        });
      }
    }

    // Direction: <a><h3>Title</h3></a> -- the heading itself sits inside a link.
    if (h.closest('a') && !h.closest('[data-heading-link-ok="true"]')) {
      const color = getComputedStyle(h).color;
      if (color === linkColorRGB) {
        results.push({
          tag: h.tagName,
          text: (h.textContent || '').trim().slice(0, 60),
          pattern: 'anchor wraps heading',
        });
      }
    }
  }
  return results;
};

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
const failures = [];
let checked = 0;

for (const rel of pages) {
  const url = pathToFileURL(path.join(ROOT, rel)).href;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  } catch (err) {
    failures.push(`${rel}: could not load (${err.message})`);
    continue;
  }

  for (const theme of ['dark', 'light']) {
    await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
    await page.waitForTimeout(30);
    const bad = await page.evaluate(probe);
    checked++;
    for (const b of bad) {
      failures.push(`${rel} [${theme}]: <${b.tag}> "${b.text}" renders in inline-link color (${b.pattern})`);
    }
  }
}

await browser.close();

if (failures.length) {
  console.error(`Heading-link-color check failed. ${failures.length} problem(s):`);
  failures.slice(0, 40).forEach((f) => console.error('  ' + f));
  if (failures.length > 40) console.error(`  ...and ${failures.length - 40} more`);
  console.error(
    '\nA heading must render in normal text color; carry the link affordance ' +
    'on hover/focus instead of resting color (see the "Heading-as-link" rule ' +
    'block at the end of styles.css). If a heading is deliberately meant to ' +
    'read as an inline link, opt it out with data-heading-link-ok="true".'
  );
  process.exit(1);
}

console.log(`Heading-link-color check passed. ${pages.length} pages x 2 themes = ${checked} renders checked.`);
