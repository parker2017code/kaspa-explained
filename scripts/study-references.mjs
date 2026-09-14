// Deep-read reference sites: tokens, scales, motion, contrast, fonts, breakpoints.
//
// Technique, not appearance. A screenshot shows where a site landed; the
// cascade shows how it got there. This reads the CSSOM, the computed styles,
// and the document head, and reports numbers that can be compared to ours.
//
// LIMITATION, measured not assumed. The CSSOM half of this (rules_readable,
// token_count, breakpoints, uses_clamp, focus_visible_rules,
// reduced_motion_blocks) UNDERREPORTS badly on third-party sites and must not
// be quoted as a finding. Cross-origin sheets throw on .cssRules, and
// re-fetching and re-injecting them did not recover the counts: Apple still
// reads 212 rules and 0 design tokens, which is obviously false for a site
// that ships thousands of both. Treat those fields as a floor, never a value,
// and never as evidence that a site lacks something.
//
// The computed-style half IS valid on every site, because it reads what the
// browser actually resolved rather than what a stylesheet declared:
// contrast_body, contrast_link, link_underlined, spacing_mult_of_4/8,
// font_families, inline_svg, img_missing_alt, landmarks, heading order, head
// completeness. Findings should come from those.
//
// Usage: node scripts/study-references.mjs out.json url [url...]
import { chromium } from 'playwright';

const STUDY = () => {
  const out = {};
  // Cross-origin stylesheets throw on .cssRules. Silently skipping them made
  // every external site report ~0 rules and 0 tokens, which looks exactly like
  // a real measurement of a site that uses neither. The sheets are re-fetched
  // and re-parsed in the page context instead; anything still unreadable is
  // counted so the caller knows the number is partial rather than zero.
  const rules = [];
  let unreadable = 0;
  for (const sheet of document.styleSheets) {
    try { rules.push(...sheet.cssRules); }
    catch { unreadable++; if (sheet.href) out.__refetch = (out.__refetch || []).concat(sheet.href); }
  }
  out.sheets_unreadable_inline = unreadable;
  const flat = [];
  const walk = (rs, media) => {
    for (const r of rs) {
      if (r.cssRules) walk(r.cssRules, r.conditionText || media);
      else if (r.style) flat.push({ sel: r.selectorText || '', style: r.style, media });
    }
  };
  walk(rules, null);
  out.rules_readable = flat.length;

  // Design tokens: custom properties defined anywhere.
  const tokens = {};
  for (const { style } of flat) {
    for (const p of style) if (p.startsWith('--')) tokens[p] = style.getPropertyValue(p).trim();
  }
  out.token_count = Object.keys(tokens).length;
  out.tokens_sample = Object.fromEntries(Object.entries(tokens).slice(0, 40));

  // Breakpoints actually used.
  const bp = new Set();
  for (const { media } of flat) {
    if (!media) continue;
    for (const m of media.matchAll(/(\d+(?:\.\d+)?)px/g)) bp.add(+m[1]);
  }
  out.breakpoints = [...bp].sort((a, b) => a - b);

  // Motion: durations and easings in use.
  const dur = {}, ease = {};
  for (const { style } of flat) {
    const d = style.transitionDuration || style.animationDuration;
    const e = style.transitionTimingFunction || style.animationTimingFunction;
    if (d && d !== '0s') dur[d] = (dur[d] || 0) + 1;
    if (e && e !== 'ease') ease[e] = (ease[e] || 0) + 1;
  }
  const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
  out.durations = top(dur, 6);
  out.easings = top(ease, 6);
  out.uses_clamp = flat.filter((r) => (r.style.fontSize || '').includes('clamp')).length;
  out.focus_visible_rules = flat.filter((r) => r.sel.includes(':focus-visible')).length;
  out.reduced_motion_blocks = flat.filter((r) => (r.media || '').includes('reduced-motion')).length;
  out.container_queries = flat.filter((r) => (r.media || '').includes('width') && /inline-size|container/.test(r.media || '')).length;

  // Fonts.
  const fams = {};
  for (const el of document.querySelectorAll('body *')) {
    const f = getComputedStyle(el).fontFamily;
    if (f) fams[f.split(',')[0].replace(/["']/g, '')] = (fams[f.split(',')[0].replace(/["']/g, '')] || 0) + 1;
  }
  out.font_families = top(fams, 5);
  out.font_face_count = flat.length && [...rules].length ? undefined : undefined;

  // Contrast of body text vs its background.
  const lum = (c) => {
    const m = c.match(/[\d.]+/g); if (!m) return null;
    const [r, g, b] = m.slice(0, 3).map(Number).map((v) => {
      v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const bgOf = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      if (bg && !/rgba?\(0, 0, 0, 0\)|transparent/.test(bg)) return bg;
      n = n.parentElement;
    }
    return getComputedStyle(document.body).backgroundColor || 'rgb(255,255,255)';
  };
  const ratio = (a, b) => { const L1 = lum(a), L2 = lum(b); if (L1 == null || L2 == null) return null;
    const hi = Math.max(L1, L2), lo = Math.min(L1, L2); return +((hi + 0.05) / (lo + 0.05)).toFixed(2); };
  const ps = [...document.querySelectorAll('p')].filter((p) => p.textContent.trim().split(/\s+/).length > 8);
  out.contrast_body = ps.length ? ratio(getComputedStyle(ps[0]).color, bgOf(ps[0])) : null;
  const links = [...document.querySelectorAll('p a[href]')];
  out.contrast_link = links.length ? ratio(getComputedStyle(links[0]).color, bgOf(links[0])) : null;
  out.link_underlined = links.length ? getComputedStyle(links[0]).textDecorationLine : null;

  // Spacing: are margins/padding on a base unit?
  const sp = {};
  for (const el of [...document.querySelectorAll('body *')].slice(0, 1500)) {
    const s = getComputedStyle(el);
    for (const k of ['marginTop', 'marginBottom', 'paddingTop', 'paddingBottom']) {
      const v = Math.round(parseFloat(s[k]) || 0);
      if (v > 0) sp[v] = (sp[v] || 0) + 1;
    }
  }
  const vals = Object.keys(sp).map(Number);
  out.spacing_top = top(sp, 10);
  out.spacing_mult_of_4 = +(vals.filter((v) => v % 4 === 0).length / (vals.length || 1)).toFixed(2);
  out.spacing_mult_of_8 = +(vals.filter((v) => v % 8 === 0).length / (vals.length || 1)).toFixed(2);

  // Head completeness and structure.
  const has = (s) => !!document.querySelector(s);
  out.head = {
    canonical: has('link[rel=canonical]'),
    apple_touch: has('link[rel="apple-touch-icon"]'),
    theme_color: has('meta[name="theme-color"]'),
    manifest: has('link[rel=manifest]'),
    favicon_svg: has('link[rel=icon][type="image/svg+xml"]'),
  };
  out.skip_link = !!document.querySelector('a[href^="#"]:first-of-type');
  out.landmarks = ['main', 'nav', 'header', 'footer', 'aside'].filter((t) => has(t));
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => +h.tagName[1]);
  out.heading_count = hs.length;
  out.heading_order_ok = hs.every((h, i) => i === 0 || h - hs[i - 1] <= 1);
  out.inline_svg = document.querySelectorAll('svg').length;
  out.img_count = document.querySelectorAll('img').length;
  out.img_missing_alt = [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length;
  return out;
};

// Re-fetch cross-origin sheets from Node, where same-origin policy does not
// apply, and inject them as same-origin <style> so the CSSOM can read them.
const inlineCrossOrigin = async (page) => {
  const hrefs = await page.evaluate(() => [...document.styleSheets]
    .filter((s) => { try { void s.cssRules; return false; } catch { return !!s.href; } })
    .map((s) => s.href));
  let added = 0;
  for (const href of hrefs.slice(0, 12)) {
    try {
      const res = await fetch(href);
      if (!res.ok) continue;
      const css = await res.text();
      if (css.length > 4_000_000) continue;
      await page.evaluate((t) => {
        const el = document.createElement('style');
        el.textContent = t; el.dataset.injected = '1';
        document.head.appendChild(el);
      }, css);
      added++;
    } catch { /* unreachable sheet, reported via sheets_unreadable_inline */ }
  }
  return { attempted: hrefs.length, added };
};

const [outPath, ...urls] = process.argv.slice(2);
const browser = await chromium.launch();
const results = {};
for (const url of urls) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let bytes = 0, reqs = 0;
  page.on('response', async (r) => {
    reqs++;
    const l = r.headers()['content-length'];
    if (l) bytes += +l;
  });
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 35000 });
    await page.waitForTimeout(1500);
    const inj = await inlineCrossOrigin(page);
    const r = await page.evaluate(STUDY);
    r.sheets_refetched = inj;
    r.requests = reqs; r.bytes_reported = bytes;
    r.libs = await page.evaluate(() => Object.keys(window)
      .filter((k) => /^(React|__NEXT|__NUXT|Vue|jQuery|\$|gsap|THREE|d3|Alpine|htmx|Svelte|astro)/i.test(k))
      .slice(0, 12));
    results[url] = r;
    console.error('ok   ' + url + '  rules=' + r.rules_readable + ' tokens=' + r.token_count);
  } catch (e) {
    results[url] = { error: String(e).slice(0, 140) };
    console.error('FAIL ' + url + '  ' + String(e).slice(0, 90));
  }
  await page.close();
}
await browser.close();
(await import('node:fs')).writeFileSync(outPath, JSON.stringify(results, null, 2) + '\n');
console.error('wrote ' + outPath);
