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
const file = process.argv[2];

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
const url = pathToFileURL(path.join(ROOT, file)).href;
await page.goto(url, { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(200);

const result = await page.evaluate(() => {
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
  const byId = {};
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
    let ancestor = el, ariaHidden = false, container = null;
    while (ancestor) {
      if (ancestor.getAttribute && ancestor.getAttribute('aria-hidden') === 'true') { ariaHidden = true; break; }
      if (!container && ancestor.id) container = ancestor.id;
      ancestor = ancestor.parentElement;
    }
    if (ariaHidden) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 1 && rect.height <= 1) continue;
    const count = text.split(/\s+/).filter(Boolean).length;
    const key = container || '(no id ancestor)';
    byId[key] = (byId[key] || 0) + count;
  }
  return byId;
});

const sorted = Object.entries(result).sort((a, b) => b[1] - a[1]);
for (const [k, v] of sorted) console.log(v, k);
await browser.close();
