// Visible words and characters across every live page, counted the way a reader
// meets them. Walks main's text nodes and rejects script, style, template and
// display:none subtrees, plus the live block feeds whose contents change between
// runs. Counting innerText or every element's childNodes instead inflates a
// demo-heavy page by 6x, because inline <script> is a text node too.
// Usage: node scripts/count-site-words.mjs [baseUrl]
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const base = process.argv[2] || 'https://kaspaexplained.com';
const pages = JSON.parse(readFileSync('site-manifest.json', 'utf8')).pages;
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
let chars = 0, words = 0; const rows = [];
for (const n of pages) {
  const slug = n.replace('.html', '');
  await p.goto(`${base}/${base.includes('127.0.0.1') ? n : slug}?cb=${Date.now()}`, { waitUntil: 'load' });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const drop = /block-card|ln-feed|block-time|block-sub|empty-word|content-word/;
    const main = document.querySelector('main'); if (!main) return { chars: 0, words: 0 };
    let t = '';
    const w = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode(nd) {
        for (let e = nd.parentElement; e && e !== main.parentElement; e = e.parentElement) {
          const tag = e.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEMPLATE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
          if (e.hidden || getComputedStyle(e).display === 'none') return NodeFilter.FILTER_REJECT;
          if (typeof e.className === 'string' && drop.test(e.className)) return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    while (w.nextNode()) t += ' ' + w.currentNode.textContent;
    const norm = t.replace(/\s+/g, ' ').trim();
    return { chars: norm.length, words: norm.split(' ').filter(Boolean).length };
  });
  chars += r.chars; words += r.words; rows.push([slug, r.chars, r.words]);
}
rows.sort((a, b) => b[2] - a[2]);
for (const [n, c, w] of rows) console.log(`${String(w).padStart(5)} words  ${String(c).padStart(6)} chars  ${n}`);
console.log(`\nTOTAL ${words} words, ${chars} characters including spaces.`);
await b.close();
