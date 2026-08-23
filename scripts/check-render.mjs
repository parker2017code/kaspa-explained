/**
 * Render-matrix gate (design/STANDARD.md; HANDOFF.md "Finish standard" item 4,
 * 2026-08-23).
 *
 * Loads every page in sitemap.xml plus every file under demos/, at three
 * widths (390, 768, 1280) in both themes, served from a local static HTTP
 * server rooted at the repo (not file://, so localStorage is one shared
 * origin the way it is in production, and relative fetches behave like a
 * real deploy). For every render it asserts:
 *
 *   1. No horizontal overflow: document.scrollWidth <= viewport width + 1px.
 *   2. No visible body text under 16px, at width 390.
 *   3. No visible interactive control smaller than 44x44, at width 390.
 *   4. No console errors, except known external-API noise (see ALLOWLIST).
 *   5. Text contrast >= 4.5:1 for normal text, >= 3:1 for large text
 *      (>=24px, or >=18.66px at font-weight >=700), computed from the WCAG
 *      2.1 relative-luminance formula against the actual walked-up effective
 *      background, not assumed against body.
 *   6. Every in-page href="#..." resolves to an element that exists, and
 *      after navigating to that fragment the target lands in the viewport.
 *
 * Theme mechanism, read from nav.js and each page's inline #theme-init
 * script rather than assumed: the theme is decided by the localStorage key
 * "kaspa-explained-theme" ("light", or anything else falls back to dark),
 * read synchronously before first paint. It is NOT prefers-color-scheme.
 * This script sets that key via page.addInitScript before every navigation,
 * and the same init script also forces documentElement.dataset.theme
 * directly, because not every file under demos/ carries the inline
 * #theme-init script (demos/attack-cost.html does not) -- the direct
 * attribute set is the fallback for pages that only pick up theme through
 * nav.js, or not at all.
 *
 * Exclusions -- each one narrows an assertion above, none of them exempts a
 * whole page:
 *
 *   - Assertion 2 (16px floor) measures body content text only. It reuses
 *     the exact SKIP_TAGS boundary scripts/check-visible-words.mjs already
 *     draws between "body copy" and "site chrome" (SCRIPT, STYLE, SVG, NAV,
 *     HEADER, FOOTER, TEMPLATE, NOSCRIPT are chrome, not body), so the two
 *     text gates cannot disagree about what counts as body copy. Chrome
 *     text is still covered by assertions 3, 4 and 5.
 *   - Assertion 3 (44x44 touch target) exempts an <a> that sits inline
 *     inside running prose -- it has non-whitespace sibling text in the
 *     same parent element -- per WCAG SC 2.5.8's documented inline
 *     exception for text links within a sentence. A link that is the sole
 *     content of its block (a card title, a nav item, a button-styled link)
 *     still has to meet 44x44.
 *   - Assertions 3 and 5 skip anything inside <svg>. SVG geometry does not
 *     expose the same getComputedStyle box/paint semantics HTML does, and
 *     the other two Playwright gates in this repo
 *     (check-heading-link-color.mjs, check-visible-words.mjs) already draw
 *     that same line.
 *   - Assertion 4 allowlists console errors that name a known external,
 *     rate-limited API the site already fetches live client-side
 *     (api.kaspa.org, api.github.com, raw.githubusercontent.com) -- matched
 *     by URL pattern in the error text, not by suppressing all errors.
 *   - Assertion 5's effective-background walk composites ancestor
 *     background-color from <html> down to the element, ignoring
 *     background-image/gradients (the same documented limitation axe-core's
 *     contrast checker carries); a violation on an element painted solely
 *     by a gradient is reported against the nearest solid-color ancestor,
 *     which is a conservative approximation, not exact. Ancestor CSS
 *     opacity is folded into the text's alpha as a flat multiplier before
 *     compositing, which is an approximation of real group-opacity
 *     stacking, but is exact enough to catch the actual failure mode this
 *     assertion exists for: near-invisible low-opacity text.
 *   - Assertion 6's "lands in viewport" half only runs when the target
 *     element is actually visible at that width/theme (checkVisibility());
 *     a fragment target that is legitimately hidden at one breakpoint (e.g.
 *     a mobile-only element on a desktop render) still has its existence
 *     checked, just not its landing position, at that render.
 *
 * Advisory-then-blocking, same pattern as check-visible-words.mjs and
 * check-density.sh: env var RENDER_GATE_BLOCKING, default false. Wired into
 * scripts/check-site.sh the same way the visible-words gate is.
 *
 * RENDER_GATE_PAGES, optional: comma-separated relative paths, overrides the
 * full sitemap+demos page list. Used to point this gate at a single scratch
 * page while proving each assertion actually catches a violation (see
 * HANDOFF.md, "watch the check fail before you trust it passing").
 *
 * Usage: node scripts/check-render.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
    console.log('SKIPPED render-matrix check: playwright not installed');
    process.exit(0);
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const WIDTHS = [390, 768, 1280];
const THEMES = ['dark', 'light'];
const THEME_KEY = 'kaspa-explained-theme';

// Assertion 4: known external, rate-limited APIs the site already fetches
// client-side. A console error naming one of these hosts is pre-existing
// network noise (403/429/CORS from the outside world, or from a sandbox with
// no external egress), not a site bug.
const CONSOLE_ALLOWLIST = [
  /api\.kaspa\.org/,
  /api\.github\.com/,
  /raw\.githubusercontent\.com/,
  /api\.coingecko\.com/,
  /api\.kraken\.com/,
  /coincap\.io/,
  /open-meteo\.com/,
];

// ---- page list: sitemap.xml + every file under demos/ ----

function sitemapToRelPath(loc) {
  const url = new URL(loc);
  let p = url.pathname; // e.g. "/", "/what-is-kaspa", "/demos/", "/demos/attack-cost"
  if (path.extname(p)) return null; // skip llms.txt, agent-index.json, *.md, *.yml, *.pdf etc.
  if (p === '/') return 'index.html';
  if (p.endsWith('/')) p += 'index';
  const rel = p.slice(1) + '.html';
  return existsSync(path.join(ROOT, rel)) ? rel : null;
}

function buildPageList() {
  if (process.env.RENDER_GATE_PAGES) {
    return process.env.RENDER_GATE_PAGES.split(',').map((s) => s.trim()).filter(Boolean);
  }
  const sitemapXml = readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const fromSitemap = locs.map(sitemapToRelPath).filter(Boolean);

  const demoFiles = readdirSync(path.join(ROOT, 'demos'))
    .filter((f) => f.endsWith('.html'))
    .map((f) => `demos/${f}`);

  return [...new Set([...fromSitemap, ...demoFiles])].sort();
}

// ---- tiny static file server, rooted at ROOT ----

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.pdf': 'application/pdf',
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.yml': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function startServer() {
  const server = http.createServer((req, res) => {
    let pathname = decodeURIComponent(req.url.split('?')[0]);
    if (pathname === '/') pathname = '/index.html';
    let filePath = path.join(ROOT, pathname);

    if (!existsSync(filePath) || (existsSync(filePath) && filePath.endsWith('/'))) {
      if (existsSync(path.join(filePath, 'index.html'))) {
        filePath = path.join(filePath, 'index.html');
      } else if (existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      }
    }

    if (!existsSync(filePath) || !filePath.startsWith(ROOT)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(readFileSync(filePath));
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

// ---- in-page structural checks (runs inside the browser) ----

function collectChecks(width) {
  const SKIP_TAGS_BODY = new Set(['SCRIPT', 'STYLE', 'SVG', 'NAV', 'HEADER', 'FOOTER', 'TEMPLATE', 'NOSCRIPT']);
  const SKIP_TAGS_ALL = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT']);

  function isVisible(el) {
    if (typeof el.checkVisibility === 'function') {
      return el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
    }
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
  }

  function underAriaHidden(el) {
    let n = el;
    while (n) {
      if (n.getAttribute && n.getAttribute('aria-hidden') === 'true') return true;
      n = n.parentElement;
    }
    return false;
  }

  function underTag(el, tags) {
    let n = el;
    while (n) {
      if (tags.has(n.tagName)) return true;
      n = n.parentElement;
    }
    return false;
  }

  function inSvg(el) {
    let n = el;
    while (n) {
      if (n.tagName === 'SVG') return true;
      n = n.parentElement;
    }
    return false;
  }

  function selectorFor(el) {
    const parts = [];
    let n = el;
    let depth = 0;
    while (n && n.tagName && depth < 4) {
      let part = n.tagName.toLowerCase();
      if (n.id) {
        part += `#${n.id}`;
        parts.unshift(part);
        break;
      }
      if (n.classList && n.classList.length) {
        part += '.' + [...n.classList].slice(0, 2).join('.');
      }
      const parent = n.parentElement;
      if (parent) {
        const siblings = [...parent.children].filter((c) => c.tagName === n.tagName);
        if (siblings.length > 1) {
          part += `:nth-of-type(${siblings.indexOf(n) + 1})`;
        }
      }
      parts.unshift(part);
      n = n.parentElement;
      depth++;
    }
    return parts.join(' > ');
  }

  // ---- assertion 1: horizontal overflow ----
  const overflow = [];
  const scrollWidth = document.documentElement.scrollWidth;
  if (scrollWidth > width + 1) {
    overflow.push({ selector: 'document', measured: `${scrollWidth}px scrollWidth`, expected: `<= ${width + 1}px` });
  }

  // ---- assertion 2: 16px body text floor (width 390 only, caller decides) ----
  const smallText = [];
  {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        let el = node.parentElement;
        while (el) {
          if (SKIP_TAGS_BODY.has(el.tagName)) return NodeFilter.FILTER_REJECT;
          el = el.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const seen = new Set();
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent.trim();
      if (!text) continue;
      const el = node.parentElement;
      if (!el || seen.has(el)) continue;
      if (!isVisible(el) || underAriaHidden(el)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 1 && rect.height <= 1) continue;
      seen.add(el);
      const fontSize = parseFloat(getComputedStyle(el).fontSize);
      if (fontSize < 16) {
        smallText.push({
          selector: selectorFor(el),
          measured: `${fontSize}px`,
          expected: '>= 16px',
          sample: text.slice(0, 50),
        });
      }
    }
  }

  // ---- assertion 3: 44x44 touch target (width 390 only, caller decides) ----
  const smallTargets = [];
  {
    const controls = document.querySelectorAll('a, button, input, select, [role="button"], summary');
    for (const el of controls) {
      if (!isVisible(el) || underAriaHidden(el) || inSvg(el)) continue;

      if (el.tagName === 'A') {
        const parent = el.parentElement;
        if (parent) {
          const siblingText = [...parent.childNodes]
            .filter((n) => n !== el)
            .map((n) => n.textContent.trim())
            .join('');
          if (siblingText.length > 0) continue; // inline prose link, WCAG SC 2.5.8 exception
        }
      }

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue; // not actually rendered
      if (rect.width < 44 || rect.height < 44) {
        smallTargets.push({
          selector: selectorFor(el),
          measured: `${Math.round(rect.width)}x${Math.round(rect.height)}px`,
          expected: '>= 44x44px',
        });
      }
    }
  }

  // ---- assertion 5: text contrast ----
  const contrastFails = [];
  {
    function parseColor(str) {
      if (!str || str === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
      const m = str.match(/rgba?\(([^)]+)\)/);
      if (!m) return { r: 0, g: 0, b: 0, a: 0 };
      const parts = m[1].split(',').map((s) => parseFloat(s));
      return { r: parts[0] || 0, g: parts[1] || 0, b: parts[2] || 0, a: parts.length > 3 ? parts[3] : 1 };
    }
    function compositeOver(top, bottom) {
      const a = top.a + bottom.a * (1 - top.a);
      if (a === 0) return { r: 255, g: 255, b: 255, a: 0 };
      return {
        r: (top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / a,
        g: (top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / a,
        b: (top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / a,
        a,
      };
    }
    function effectiveBackground(el) {
      const chain = [];
      let n = el;
      while (n) {
        chain.push(n);
        n = n.parentElement;
      }
      chain.reverse();
      let bg = { r: 255, g: 255, b: 255, a: 1 };
      for (const node of chain) {
        const cs = getComputedStyle(node);
        const parsed = parseColor(cs.backgroundColor);
        if (parsed.a > 0) bg = compositeOver(parsed, bg);
      }
      return bg;
    }
    function effectiveOpacity(el) {
      let n = el;
      let o = 1;
      while (n) {
        const op = parseFloat(getComputedStyle(n).opacity);
        if (!isNaN(op)) o *= op;
        n = n.parentElement;
      }
      return o;
    }
    function relLuminance({ r, g, b }) {
      const lin = (c) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    }
    function contrastRatio(c1, c2) {
      const l1 = relLuminance(c1);
      const l2 = relLuminance(c2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        let el = node.parentElement;
        while (el) {
          if (SKIP_TAGS_ALL.has(el.tagName)) return NodeFilter.FILTER_REJECT;
          el = el.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const seen = new Set();
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent.trim();
      if (!text) continue;
      const el = node.parentElement;
      if (!el || seen.has(el) || inSvg(el)) continue;
      if (!isVisible(el) || underAriaHidden(el)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 1 && rect.height <= 1) continue;
      seen.add(el);

      const cs = getComputedStyle(el);
      const textColor = parseColor(cs.color);
      const opacity = effectiveOpacity(el);
      const bg = effectiveBackground(el);
      const composedText = compositeOver({ ...textColor, a: textColor.a * opacity }, bg);
      const ratio = contrastRatio(composedText, bg);

      const fontSize = parseFloat(cs.fontSize);
      const weightRaw = cs.fontWeight;
      const weight = weightRaw === 'bold' ? 700 : parseInt(weightRaw, 10) || 400;
      const isLarge = fontSize >= 24 || (fontSize >= 18.66 && weight >= 700);
      const required = isLarge ? 3 : 4.5;

      if (ratio < required - 0.001) {
        contrastFails.push({
          selector: selectorFor(el),
          measured: `${ratio.toFixed(2)}:1`,
          expected: `>= ${required}:1${isLarge ? ' (large text)' : ''}`,
          sample: text.slice(0, 50),
        });
      }
    }
  }

  // ---- assertion 6, part 1: anchors that exist ----
  const anchors = [];
  {
    const seenIds = new Set();
    for (const a of document.querySelectorAll('a[href^="#"]')) {
      const href = a.getAttribute('href');
      const id = href.slice(1);
      if (!id || seenIds.has(id)) continue;
      seenIds.add(id);
      const target = document.getElementById(id) || document.getElementsByName(id)[0];
      anchors.push({ id, exists: !!target, visible: target ? isVisible(target) : false });
    }
  }

  return { overflow, smallText, smallTargets, contrastFails, anchors };
}

// ---- main ----

async function main() {
  const pages = buildPageList();
  const server = await startServer();
  const port = server.address().port;
  const browser = await chromium.launch({ channel: 'chrome' });

  const violations = []; // { page, width, theme, kind, selector, measured, expected }
  let renders = 0;

  for (const rel of pages) {
    for (const width of WIDTHS) {
      for (const theme of THEMES) {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        await context.addInitScript(
          ({ key, value }) => {
            try {
              localStorage.setItem(key, value);
            } catch {
              // storage unavailable; the direct attribute set below still applies
            }
            // documentElement can be briefly null the instant this init script
            // runs (it fires before the page's own scripts, sometimes before
            // <html> exists yet); guard it, and re-apply on DOMContentLoaded
            // as a fallback so the attribute is never left unset.
            if (document.documentElement) document.documentElement.dataset.theme = value;
            document.addEventListener('DOMContentLoaded', () => {
              document.documentElement.dataset.theme = value;
            });
          },
          { key: THEME_KEY, value: theme }
        );

        const page = await context.newPage();
        const consoleErrors = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') consoleErrors.push(msg.text());
        });
        page.on('pageerror', (err) => consoleErrors.push(String(err)));

        const url = `http://127.0.0.1:${port}/${rel}`;
        try {
          await page.goto(url, { waitUntil: 'load', timeout: 20000 });
        } catch (err) {
          violations.push({
            page: rel,
            width,
            theme,
            selector: 'document',
            measured: `failed to load (${err.message})`,
            expected: 'page loads',
            kind: 'load',
          });
          await context.close();
          continue;
        }
        await page.waitForTimeout(80); // let inline scripts / theme-init settle
        renders++;

        // re-assert theme directly, in case nav.js overwrote it after its own
        // early-return guard (pages missing .nav / .nav-menu-button / .nav-links)
        await page.evaluate((t) => {
          document.documentElement.dataset.theme = t;
        }, theme);
        await page.waitForTimeout(20);

        const checks = await page.evaluate(collectChecks, width);

        for (const v of checks.overflow) {
          violations.push({ page: rel, width, theme, kind: 'overflow', ...v });
        }
        if (width === 390) {
          for (const v of checks.smallText) {
            violations.push({ page: rel, width, theme, kind: 'font-size', ...v });
          }
          for (const v of checks.smallTargets) {
            violations.push({ page: rel, width, theme, kind: 'touch-target', ...v });
          }
        }
        for (const v of checks.contrastFails) {
          violations.push({ page: rel, width, theme, kind: 'contrast', ...v });
        }
        for (const err of consoleErrors) {
          if (CONSOLE_ALLOWLIST.some((re) => re.test(err))) continue;
          violations.push({
            page: rel,
            width,
            theme,
            kind: 'console-error',
            selector: 'document',
            measured: err.slice(0, 200),
            expected: 'no console errors',
          });
        }

        // assertion 6, part 2: anchors land in viewport after navigating
        for (const a of checks.anchors) {
          if (!a.exists) {
            violations.push({
              page: rel,
              width,
              theme,
              kind: 'anchor-missing',
              selector: `#${a.id}`,
              measured: 'target does not exist',
              expected: 'element with matching id/name',
            });
            continue;
          }
          if (!a.visible) continue; // legitimately hidden at this render; existence already checked

          await page.evaluate(() => {
            location.hash = '';
          });
          await page.evaluate((id) => {
            location.hash = `#${id}`;
          }, a.id);
          await page.waitForTimeout(60);

          const landed = await page.evaluate(
            ({ id, w }) => {
              const el = document.getElementById(id) || document.getElementsByName(id)[0];
              if (!el) return false;
              const r = el.getBoundingClientRect();
              const vh = window.innerHeight;
              return r.bottom > 0 && r.top < vh && r.right > 0 && r.left < w;
            },
            { id: a.id, w: width }
          );
          if (!landed) {
            violations.push({
              page: rel,
              width,
              theme,
              kind: 'anchor-offscreen',
              selector: `#${a.id}`,
              measured: 'target outside viewport after navigating to fragment',
              expected: 'target intersects viewport',
            });
          }
        }

        await context.close();
      }
    }
  }

  await browser.close();
  server.close();

  console.log(`Render-matrix check: ${pages.length} page(s), ${renders} render(s) (width x theme combinations).`);

  if (violations.length === 0) {
    console.log('\nRender-matrix check: no violations.');
    return;
  }

  const severity = {
    load: 0,
    'anchor-missing': 1,
    contrast: 2,
    'touch-target': 3,
    overflow: 4,
    'anchor-offscreen': 5,
    'font-size': 6,
    'console-error': 7,
  };

  const byPage = new Map();
  for (const v of violations) {
    if (!byPage.has(v.page)) byPage.set(v.page, []);
    byPage.get(v.page).push(v);
  }

  const pagesBySeverity = [...byPage.entries()].sort((a, b) => {
    const worstA = Math.min(...a[1].map((v) => severity[v.kind] ?? 9));
    const worstB = Math.min(...b[1].map((v) => severity[v.kind] ?? 9));
    if (worstA !== worstB) return worstA - worstB;
    return b[1].length - a[1].length;
  });

  console.error(`\nRender-matrix check failed. ${violations.length} violation(s) across ${byPage.size} page(s), most severe first:\n`);
  for (const [pageName, vs] of pagesBySeverity) {
    console.error(`${pageName}`);
    const sorted = [...vs].sort((a, b) => (severity[a.kind] ?? 9) - (severity[b.kind] ?? 9));
    for (const v of sorted) {
      console.error(
        `  [${v.kind}] width=${v.width} theme=${v.theme} selector=${v.selector}\n` +
        `      measured: ${v.measured}\n` +
        `      expected: ${v.expected}` +
        (v.sample ? `\n      text: "${v.sample}"` : '')
      );
    }
  }

  const blocking = process.env.RENDER_GATE_BLOCKING === 'true';
  if (blocking) {
    process.exit(1);
  } else {
    console.error(`\n(RENDER_GATE_BLOCKING is not "true": reporting only, not failing the build.)`);
  }
}

await main();
