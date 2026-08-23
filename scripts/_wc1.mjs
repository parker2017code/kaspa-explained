import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const runtimeModules =
  process.env.NODE_PATH ||
  process.env.HOME + '/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require(runtimeModules + '/playwright'));
}

const ROOT = '/Users/parkerschmidt/Documents/repos/kaspa-explained';
const files = process.argv.slice(2);

function countVisibleWords() {
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'SVG', 'NAV', 'HEADER', 'FOOTER', 'TEMPLATE', 'NOSCRIPT']);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      let el = node.parentElement;
      while (el) {
        if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT;
        el = el.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let words = 0;
  let node;
  while ((node = walker.nextNode())) {
    const text = node.textContent.trim();
    if (!text) continue;
    const el = node.parentElement;
    if (!el) continue;
    if (typeof el.checkVisibility === 'function') {
      if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
    } else {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
    }
    let ancestor = el, ariaHidden = false;
    while (ancestor) {
      if (ancestor.getAttribute && ancestor.getAttribute('aria-hidden') === 'true') { ariaHidden = true; break; }
      ancestor = ancestor.parentElement;
    }
    if (ariaHidden) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 1 && rect.height <= 1) continue;
    words += text.split(/\s+/).filter(Boolean).length;
  }
  return words;
}

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
for (const rel of files) {
  const url = pathToFileURL(path.join(ROOT, rel)).href;
  await page.goto(url, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(60);
  const words = await page.evaluate(countVisibleWords);
  console.log(rel, words);
}
await browser.close();
