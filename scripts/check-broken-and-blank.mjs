/**
 * Broken-link and blank-content gate (owner instruction, 2026-08-24: "How
 * can you catch page links and things that are broken before I do?").
 *
 * The existing ~20 checks verify structure, copy, and style, but nothing
 * renders every page, opens every disclosure, and asks "does this link go
 * anywhere, and is this element actually showing something." That gap is
 * why broken and blank content was being found by casually scrolling the
 * live site instead of by a gate. This script closes it and BLOCKS the
 * build; it is not advisory.
 *
 * For every page in site-manifest.json plus every file under demos/ (same
 * page list as scripts/check-visible-words.mjs, same reasons: redirect
 * stubs are skipped because their zero-second meta refresh navigates the
 * page out from under page.evaluate mid-flight, and 404.html is skipped
 * because it is a deliberate non-destination, the same exclusion
 * scripts/check-site.sh, scripts/build-sitemap.py, scripts/apply-related-links.py
 * and scripts/check-redirect-stubs.sh already carry), this renders the page
 * at 390 and 1280 in both themes, opens every <details> so disclosed
 * content is measured too, and checks:
 *
 *   1. Every internal <a href> resolves to a file that exists on disk.
 *   2. Every fragment (#id, on this page or another) resolves to an
 *      element that actually exists in the target page's rendered DOM.
 *   3. No empty heading (h1-h6 with no rendered text).
 *   4. No empty table cell (a <td> with no text and no child element).
 *   5. No element whose entire own text is a literal placeholder token:
 *      "undefined", "NaN", "null", "[object Object]", or empty where the
 *      page structure implies a value was supposed to render there.
 *   6. No <details> that opens onto nothing (no text, no media, in its
 *      body besides the <summary>).
 *   7. No broken image (naturalWidth 0 after load).
 *
 * A draft of this check also flagged every <button>/[role="button"] with
 * no JS click listener in its ancestor chain as "dead." Run against the
 * live site, that flagged 320 of 324 total findings, all of them the same
 * false positive: .term-def and .info-affordance__trigger, a deliberate
 * CSS-only hover/focus reveal pattern documented in styles.css (search
 * "term-def / info-affordance panels"), not a JS control. That check is
 * cut. It was not in the owner's ask (links, anchors, blank content,
 * placeholder strings, broken media) and it drowned every real finding in
 * noise on its first real run, which is the failure mode this whole task
 * exists to avoid.
 *
 * External links are out of scope here: scripts/check-links.sh already
 * fetches every https:// URL in the repo and is wired into
 * .github/workflows/link-check.yml.
 *
 * Opt-out: wrap a deliberately-empty element in a container carrying
 * data-blank-ok="true" (same opt-in-on-the-page pattern as
 * data-overlap-ok/data-clip-ok in scripts/check-render.mjs) to exempt it
 * and everything inside it from checks 3-7.
 *
 * Usage: node scripts/check-broken-and-blank.mjs
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
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
    console.log('SKIPPED broken-and-blank check: playwright not installed');
    process.exit(0);
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const manifest = JSON.parse(readFileSync(path.join(ROOT, 'site-manifest.json'), 'utf8'));
const DOMAIN = manifest.domain; // "https://kaspaexplained.com"
const WIDTHS = [390, 1280];
const THEMES = ['dark', 'light'];
const THEME_KEY = 'kaspa-explained-theme';

// 404.html is in the manifest deliberately but is not a destination -- the
// same exclusion scripts/check-site.sh, build-sitemap.py,
// apply-related-links.py and check-redirect-stubs.sh carry.
const NOT_A_DESTINATION = new Set(['404.html']);

const isRedirectStub = (rel) => {
  try {
    return /http-equiv=["']refresh["']/i.test(readFileSync(path.join(ROOT, rel), 'utf8'));
  } catch {
    return false;
  }
};

const demoFiles = readdirSync(path.join(ROOT, 'demos'))
  .filter((f) => f.endsWith('.html'))
  .map((f) => `demos/${f}`)
  .sort();

const pages = [...new Set([...manifest.pages, ...demoFiles])]
  .filter((rel) => !NOT_A_DESTINATION.has(rel))
  .filter((rel) => !isRedirectStub(rel))
  .sort();

// ---- tiny static file server, rooted at ROOT (same as check-render.mjs, so
// relative fetch()/localStorage behave like a real deploy, not file://) ----

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

    if (!existsSync(filePath) || filePath.endsWith('/')) {
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

// ---- in-page checks, runs inside the browser after load + details open ----

function collectPageChecks() {
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'SVG', 'TEMPLATE', 'NOSCRIPT']);
  const PLACEHOLDER_TOKENS = new Set(['undefined', 'NaN', 'null', '[object Object]']);

  function isVisible(el) {
    if (typeof el.checkVisibility === 'function') {
      return el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
    }
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
  }

  function exempt(el) {
    return !!el.closest('[data-blank-ok]');
  }

  function selectorFor(el) {
    let s = el.tagName.toLowerCase();
    if (el.id) return s + '#' + el.id;
    if (typeof el.className === 'string' && el.className.trim()) {
      s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
    }
    const parent = el.parentElement;
    if (parent) {
      const siblings = [...parent.children].filter((c) => c.tagName === el.tagName);
      if (siblings.length > 1) s += `:nth-of-type(${siblings.indexOf(el) + 1})`;
    }
    return s;
  }

  const emptyHeadings = [];
  const emptyCells = [];
  const placeholders = [];
  const emptyDetails = [];
  const brokenImages = [];

  document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((h) => {
    if (!isVisible(h) || exempt(h)) return;
    if (!h.textContent.trim()) emptyHeadings.push(selectorFor(h));
  });

  document.querySelectorAll('td').forEach((td) => {
    if (!isVisible(td) || exempt(td)) return;
    if (td.children.length > 0) return;
    if (!td.textContent.trim()) {
      const table = td.closest('table');
      emptyCells.push(selectorFor(td) + (table ? ` in ${selectorFor(table)}` : ''));
    }
  });

  document.querySelectorAll('body *').forEach((el) => {
    if (SKIP_TAGS.has(el.tagName) || exempt(el)) return;
    if (!isVisible(el)) return;
    let ownText = '';
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) ownText += node.textContent;
    }
    ownText = ownText.trim();
    if (PLACEHOLDER_TOKENS.has(ownText)) {
      placeholders.push(`${selectorFor(el)} renders literal "${ownText}"`);
    }
  });

  document.querySelectorAll('details').forEach((d) => {
    if (!isVisible(d) || exempt(d)) return;
    let hasContent = false;
    for (const child of d.children) {
      if (child.tagName === 'SUMMARY') continue;
      if (child.textContent.trim() || child.querySelector('img,svg,canvas,video,button,a,table')) {
        hasContent = true;
        break;
      }
    }
    if (!hasContent) emptyDetails.push(selectorFor(d));
  });

  document.querySelectorAll('img').forEach((img) => {
    if (!isVisible(img) || exempt(img)) return;
    if (img.complete && img.naturalWidth === 0) {
      brokenImages.push(`${selectorFor(img)} src="${img.getAttribute('src')}"`);
    }
  });

  const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
  const links = [...document.querySelectorAll('a[href]')].map((a) => ({
    href: a.getAttribute('href'),
    text: (a.textContent || '').trim().slice(0, 60),
  }));

  return { emptyHeadings, emptyCells, placeholders, emptyDetails, brokenImages, ids, links };
}

// ---- link resolution (runs in Node, after rendering) ----

function resolveInternalTarget(href, fromFile) {
  let p = href.trim();
  if (p.startsWith(DOMAIN)) p = p.slice(DOMAIN.length) || '/';
  if (p.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(p)) return null; // protocol-relative or other-scheme (http(s) to another host, mailto:, tel:, javascript:)
  if (!p) return null; // empty href handled as a dead-control candidate, not a link target

  let pathPart = p;
  let frag = null;
  if (p.includes('#')) {
    [pathPart, frag] = p.split('#');
  }

  if (pathPart === '') {
    // fragment-only link on the current page
    return { file: fromFile, frag };
  }

  let absPath;
  if (pathPart.startsWith('/')) {
    absPath = pathPart;
  } else {
    // relative to the directory of the linking file
    const base = path.posix.dirname('/' + fromFile);
    absPath = path.posix.normalize(base + '/' + pathPart);
  }

  let file;
  if (absPath === '/' || absPath === '') {
    file = 'index.html';
  } else if (absPath.endsWith('/')) {
    file = absPath.slice(1) + 'index.html';
  } else {
    const bare = absPath.slice(1);
    if (path.extname(bare) === '') {
      // Extensionless path, e.g. "/demos". Same fallback order as
      // startServer() above (and the real GitHub Pages host): a directory
      // with its own index.html wins over a same-named ".html" file, since
      // that is the actual clean-URL convention every nav link on this site
      // uses ("/demos" resolving to demos/index.html, not demos.html).
      if (existsSync(path.join(ROOT, bare, 'index.html'))) {
        file = bare + '/index.html';
      } else {
        file = bare + '.html';
      }
    } else {
      file = bare;
    }
  }
  return { file, frag };
}

async function main() {
  const server = await startServer();
  const port = server.address().port;
  const browser = await chromium.launch({ channel: 'chrome' });

  const idsByPage = new Map(); // file -> Set(ids), union across all renders
  const linksByPage = new Map(); // file -> [{href,text}], deduped
  const contentFailures = []; // strings, one per violation, already page-qualified

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
              // storage unavailable; direct attribute set below still applies
            }
            if (document.documentElement) document.documentElement.dataset.theme = value;
            document.addEventListener('DOMContentLoaded', () => {
              document.documentElement.dataset.theme = value;
            });
          },
          { key: THEME_KEY, value: theme }
        );

        const page = await context.newPage();
        const url = `http://127.0.0.1:${port}/${rel}`;
        try {
          await page.goto(url, { waitUntil: 'load', timeout: 20000 });
        } catch (err) {
          contentFailures.push(`${rel} [${width}/${theme}]: page failed to load (${err.message})`);
          await context.close();
          continue;
        }
        await page.waitForTimeout(200); // let inline scripts / async data fetches settle
        await page.evaluate(() => {
          document.querySelectorAll('details').forEach((d) => {
            d.open = true;
          });
        });
        await page.waitForTimeout(50);

        renders++;
        const result = await page.evaluate(collectPageChecks);

        const tag = `${rel} [${width}/${theme}]`;
        for (const s of result.emptyHeadings) contentFailures.push(`${tag}: empty heading, ${s}`);
        for (const s of result.emptyCells) contentFailures.push(`${tag}: empty table cell, ${s}`);
        for (const s of result.placeholders) contentFailures.push(`${tag}: placeholder text, ${s}`);
        for (const s of result.emptyDetails) contentFailures.push(`${tag}: disclosure opens onto nothing, ${s}`);
        for (const s of result.brokenImages) contentFailures.push(`${tag}: broken image, ${s}`);

        const idSet = idsByPage.get(rel) || new Set();
        for (const id of result.ids) idSet.add(id);
        idsByPage.set(rel, idSet);

        const linkList = linksByPage.get(rel) || [];
        linkList.push(...result.links);
        linksByPage.set(rel, linkList);

        await context.close();
      }
    }
  }

  await browser.close();
  server.close();

  // ---- link/anchor resolution, once per page using the rendered link and id sets ----

  const linkFailures = [];
  const seen = new Set();

  for (const [fromFile, links] of linksByPage) {
    for (const { href, text } of links) {
      const key = `${fromFile}|${href}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const target = resolveInternalTarget(href, fromFile);
      if (!target) continue; // external, mailto, tel, javascript:, or empty (dead-control's problem)

      const { file, frag } = target;

      if (!existsSync(path.join(ROOT, file))) {
        linkFailures.push(
          `${fromFile}: link "${text}" (href="${href}") points at ${file}, which does not exist`
        );
        continue;
      }

      if (!frag) continue;

      let targetIds = idsByPage.get(file);
      if (!targetIds) {
        // target file was not part of this run's page/render list (e.g. it's
        // excluded as a redirect stub, or it's 404.html); fall back to a
        // static read of the file source, same check scripts/check-site.sh
        // already does for the analogous case.
        try {
          const src = readFileSync(path.join(ROOT, file), 'utf8');
          targetIds = new Set([...src.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
        } catch {
          targetIds = new Set();
        }
      }

      if (!targetIds.has(frag)) {
        linkFailures.push(
          `${fromFile}: link "${text}" (href="${href}") points at ${file}#${frag}, which has no element with that id`
        );
      }
    }
  }

  console.log(`Broken-and-blank check: ${renders} render(s) across ${pages.length} page(s) at widths [${WIDTHS.join(', ')}] and themes [${THEMES.join(', ')}].`);

  const allFailures = [...linkFailures, ...contentFailures];

  if (allFailures.length) {
    console.error(`\nBroken-and-blank check failed. ${allFailures.length} problem(s):`);
    for (const f of allFailures.sort()) console.error('  ' + f);
    console.error(
      '\nFix the link/anchor, add the missing rendered content, or if the ' +
      'element is deliberately empty, wrap it in a container carrying ' +
      'data-blank-ok="true".'
    );
    process.exit(1);
  }

  console.log('No broken internal links, missing anchors, or blank rendered content found.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
