// Measure typography and density from RENDERED pages, ours and references.
//
// Reads computed styles, not the stylesheet source and not a screenshot.
// Measuring where a page landed is the only way to compare across sites that
// share no code; the technique behind the numbers still has to be read out of
// the CSS by a person.
//
// Usage: node scripts/measure-typography.mjs out.json url [url...]
import { chromium } from 'playwright';

const EXTRACT = () => {
  const vis = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const words = (t) => (t || '').trim().split(/\s+/).filter(Boolean).length;

  const paras = [...document.querySelectorAll('p')].filter(vis);
  const bodyEl = paras.sort((a, b) => words(b.textContent) - words(a.textContent))[0]
    || document.body;
  const bs = getComputedStyle(bodyEl);
  const fs = parseFloat(bs.fontSize);
  const lh = parseFloat(bs.lineHeight) || fs * 1.2;

  // Measure in characters: width divided by the width of one "0".
  const probe = document.createElement('span');
  probe.textContent = '0'.repeat(100);
  probe.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font:${bs.font}`;
  document.body.appendChild(probe);
  const ch = probe.getBoundingClientRect().width / 100;
  probe.remove();

  const sizes = {};
  let interactiveWordsBefore = null, seen = 0;
  const all = [...document.querySelectorAll('body *')].filter(vis);
  for (const el of all) {
    const s = getComputedStyle(el);
    const direct = [...el.childNodes]
      .filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ');
    if (words(direct)) {
      const k = Math.round(parseFloat(s.fontSize));
      sizes[k] = (sizes[k] || 0) + words(direct);
      seen += words(direct);
    }
    if (interactiveWordsBefore === null &&
        el.matches('a[href],button,input,select,textarea,[role=button],[tabindex]')) {
      interactiveWordsBefore = seen;
    }
  }
  const pw = paras.map((p) => words(p.textContent)).filter((n) => n > 3).sort((a, b) => a - b);
  const pick = (a, q) => (a.length ? a[Math.min(a.length - 1, Math.floor(a.length * q))] : null);

  const totalWords = Object.values(sizes).reduce((a, b) => a + b, 0);
  const scrollH = document.documentElement.scrollHeight;

  return {
    body_px: +fs.toFixed(1),
    line_height_ratio: +(lh / fs).toFixed(3),
    measure_ch: +(paras.length ? paras[0].getBoundingClientRect().width / ch : 0).toFixed(1),
    content_px: Math.round(paras.length ? paras[0].getBoundingClientRect().width : 0),
    distinct_sizes: Object.keys(sizes).length,
    size_ladder: Object.entries(sizes).map(([k, v]) => [+k, v])
      .sort((a, b) => b[0] - a[0]).slice(0, 8),
    para_words_median: pick(pw, 0.5),
    para_words_p90: pick(pw, 0.9),
    para_count: pw.length,
    words_total: totalWords,
    scroll_px: scrollH,
    words_per_1000px: +((totalWords / scrollH) * 1000).toFixed(1),
    words_before_first_interactive: interactiveWordsBefore,
  };
};

const [out, ...urls] = process.argv.slice(2);
// Run with no arguments this fell through to writeFileSync(undefined, ...) and
// died on an ERR_INVALID_ARG_TYPE stack trace 90 lines later, which reads like
// a broken tool rather than a missing argument.
if (!out || urls.length === 0) {
  console.error('Usage: node scripts/measure-typography.mjs out.json url [url...]');
  console.error('Writes measured type metrics for each url to out.json.');
  process.exit(2);
}
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const results = {};
for (const url of urls) {
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(1200);
    results[url] = await page.evaluate(EXTRACT);
    console.error('ok   ' + url);
  } catch (e) {
    results[url] = { error: String(e).slice(0, 120) };
    console.error('FAIL ' + url + '  ' + String(e).slice(0, 80));
  }
}
await browser.close();
const fs = await import('node:fs');
fs.writeFileSync(out, JSON.stringify(results, null, 2) + '\n');
console.error('wrote ' + out);
