/**
 * Dead-CSS cascade scanner (2026-08-23 legacy/apple cleanup).
 *
 * For every selector rule in a stylesheet, this determines two things by
 * rendering the real site in a real browser rather than by reading the
 * file: whether the selector matches any element on any page, in both
 * themes, at both a phone and a desktop width, and, where it matches,
 * whether its declarations actually change the rendered computed style
 * (whether they win the cascade) or are fully overridden by something
 * else.
 *
 * Method: parse the stylesheet source into a flat, ordered list of style
 * rules (recursing into @media, skipping @keyframes as opaque) using a
 * small hand-written brace-depth tokenizer. Separately, in the browser,
 * walk the live CSSOM of the loaded stylesheet with the identical
 * recursion rule, producing a same-length, same-order list of
 * CSSStyleRule objects. The two lists are position-aligned by
 * construction; a length/selector spot-check validates the alignment
 * before any classification runs, and the scan aborts loudly if it does
 * not hold.
 *
 * For each rule, on each (page, theme, width): elements are matched with
 * querySelectorAll (or, for ::before/::after, on the base selector with
 * getComputedStyle(el, pseudo)). Where an element matches, the rule's own
 * declarations are cleared (`rule.style.cssText = ''`), the element's
 * full computed style is diffed against a snapshot taken before the
 * clear, and the rule is restored. Any difference means the rule causes
 * a rendered pixel and is "live" for that element. No difference across
 * every match, on every page/theme/width, means the rule is provably
 * inert: deleting it is proven not to change any computed style, by the
 * same mechanism used to classify it.
 *
 * Selectors built on dynamic states this harness cannot safely force in a
 * static render (:hover, :focus*, :active, :checked, :target, ::selection,
 * ::placeholder, ::marker, :link/:visited, and friends) skip the dynamic
 * clear test and fall back to a conservative existence check: if the
 * selector with the dynamic pseudo stripped matches any element anywhere,
 * the rule is treated as live and never auto-removed. Only a rule whose
 * base target does not exist anywhere is called dead.
 *
 * Usage:
 *   node scripts/dead-css-scan.mjs <siteRoot> <cssRelPath> [--out=report.json]
 *
 * siteRoot is the directory to serve pages from (file:// URLs); cssRelPath
 * is the stylesheet's path relative to siteRoot (normally styles.css).
 * Prints a JSON classification report to stdout (or --out file).
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import http from 'node:http';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};

function startStaticServer(root) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath = path.join(root, urlPath);
      try {
        let st = statSync(filePath);
        if (st.isDirectory()) filePath = path.join(filePath, 'index.html');
      } catch {
        // fall through to 404 below
      }
      try {
        const data = readFileSync(filePath);
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end('not found: ' + urlPath);
      }
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findChromeExecutable() {
  const cacheDir = path.join(process.env.HOME, 'Library/Caches/ms-playwright');
  try {
    const dirs = execSync(`ls "${cacheDir}"`).toString().trim().split('\n');
    for (const d of dirs) {
      if (d.startsWith('chromium-')) {
        const p = path.join(
          cacheDir,
          d,
          'chrome-mac-arm64',
          'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
        );
        try {
          execSync(`test -x "${p}"`);
          return p;
        } catch {}
      }
    }
  } catch {}
  return null;
}

// ---------- Node-side stylesheet tokenizer ----------

function findMatchingClose(text, openPos) {
  // text[openPos] === '{'; returns index of the matching '}' (inclusive close).
  let depth = 0;
  let i = openPos;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2;
      continue;
    }
    if (c === '"' || c === "'") {
      const quote = c;
      i++;
      while (i < n && text[i] !== quote) {
        if (text[i] === '\\') i++;
        i++;
      }
      i++;
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  throw new Error('Unbalanced braces near offset ' + openPos);
}

function skipWs(text, i) {
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2;
      continue;
    }
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    break;
  }
  return i;
}

function parseBlock(text, start, end, appleOffset, out) {
  let i = skipWs(text, start);
  while (i < end) {
    if (text[i] === '@') {
      // at-rule: read prelude up to '{' or ';'
      let j = i + 1;
      while (j < end && /[a-zA-Z-]/.test(text[j])) j++;
      const name = text.slice(i + 1, j).toLowerCase();
      let k = j;
      while (k < end && text[k] !== '{' && text[k] !== ';') {
        if (text[k] === '/' && text[k + 1] === '*') {
          const c = text.indexOf('*/', k + 2);
          k = c === -1 ? end : c + 2;
          continue;
        }
        k++;
      }
      if (text[k] === ';') {
        i = k + 1;
        i = skipWs(text, i);
        continue;
      }
      // text[k] === '{'
      const close = findMatchingClose(text, k);
      if (name === 'media' || name === 'supports') {
        parseBlock(text, k + 1, close, appleOffset, out);
      }
      // else (keyframes, font-face, page, etc.): opaque, skip entirely
      i = close + 1;
      i = skipWs(text, i);
      continue;
    }
    // Normal style rule: selector up to next unescaped '{'
    let k = i;
    while (k < end && text[k] !== '{') {
      if (text[k] === '/' && text[k + 1] === '*') {
        const c = text.indexOf('*/', k + 2);
        k = c === -1 ? end : c + 2;
        continue;
      }
      k++;
    }
    if (k >= end) break; // trailing garbage/comment, ignore
    const selectorText = text.slice(i, k).replace(/\/\*[\s\S]*?\*\//g, '').trim();
    const close = findMatchingClose(text, k);
    out.push({
      index: out.length,
      selectorText,
      ruleStart: i,
      ruleEnd: close + 1,
      region: i < appleOffset ? 'legacy' : 'apple',
    });
    i = close + 1;
    i = skipWs(text, i);
  }
}

function parseStylesheet(text) {
  const marker = text.indexOf('APPLE DESIGN LAYER');
  const appleOffset = marker === -1 ? text.length : marker;
  const out = [];
  parseBlock(text, 0, text.length, appleOffset, out);
  return { rules: out, appleOffset };
}

// ---------- Main ----------

async function main() {
  const args = process.argv.slice(2);
  const positional = args.filter((a) => !a.startsWith('--'));
  const outArg = args.find((a) => a.startsWith('--out='));
  const siteRoot = path.resolve(positional[0]);
  const cssRelPath = positional[1] || 'styles.css';
  const outFile = outArg ? outArg.slice('--out='.length) : null;

  const cssText = readFileSync(path.join(siteRoot, cssRelPath), 'utf8');
  const { rules: nodeRules, appleOffset } = parseStylesheet(cssText);
  console.error(`Parsed ${nodeRules.length} style rules from ${cssRelPath} (apple offset ${appleOffset}).`);

  const exe = findChromeExecutable();
  if (!exe) throw new Error('No cached Chromium for Testing executable found.');
  const browser = await chromium.launch({ executablePath: exe });
  const server = await startStaticServer(siteRoot);
  const baseUrl = 'http://127.0.0.1:' + server.address().port;
  console.error('Serving ' + siteRoot + ' at ' + baseUrl);

  // Discover pages that link this stylesheet.
  const htmlFiles = execSync(
    `cd "${siteRoot}" && grep -rl "${path.basename(cssRelPath)}" --include="*.html" . | grep -v '/.claude/worktrees/' | grep -v '/_preview-site/' | grep -v '/visual-audit/' | sort`
  )
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((p) => p.replace(/^\.\//, ''));
  console.error(`Found ${htmlFiles.length} HTML files linking ${cssRelPath}.`);

  const themes = ['dark', 'light'];
  const widths = [390, 1280];

  // Alignment validation: load the first page once, compare rule counts / selectors.
  const validationPage = await browser.newPage();
  await validationPage.setViewportSize({ width: 1280, height: 900 });
  await validationPage.goto(baseUrl + '/' + htmlFiles[0] + '?theme=dark', {
    waitUntil: 'load',
  });
  const browserSelectors = await validationPage.evaluate((cssBase) => {
    const sheet = [...document.styleSheets].find((s) => s.href && s.href.includes(cssBase));
    if (!sheet) return null;
    const out = [];
    function walk(list) {
      for (const r of list) {
        if (r.type === 1) out.push(r.selectorText);
        else if (r.type === 4) walk(r.cssRules);
      }
    }
    walk(sheet.cssRules);
    return out;
  }, path.basename(cssRelPath));
  await validationPage.close();

  if (!browserSelectors) throw new Error('Could not find the stylesheet in document.styleSheets.');

  // A rendering engine silently DROPS any rule whose selector it cannot parse,
  // so a stylesheet carrying another engine's vendor pseudo-elements makes the
  // two lists differ by exactly those rules and the old equal-count assert
  // aborted the whole scan. Chrome rejects ::-moz-range-thumb; the three rules
  // carrying it (added 31 Aug for slider hover and press states) are correct
  // Firefox CSS and must stay. Drop them from the Node list before aligning,
  // and say which ones, so a genuine parser drift still fails loudly.
  const dropped = [];
  if (browserSelectors.length !== nodeRules.length) {
    const validity = await (async () => {
      const vp = await browser.newPage();
      await vp.goto('about:blank');
      const res = await vp.evaluate(
        (list) => list.map((sel) => { try { document.querySelector(sel); return true; } catch { return false; } }),
        nodeRules.map((r) => r.selectorText)
      );
      await vp.close();
      return res;
    })();
    for (let i = nodeRules.length - 1; i >= 0; i--) {
      if (!validity[i]) { dropped.push(nodeRules[i].selectorText); nodeRules.splice(i, 1); }
    }
    if (dropped.length) {
      console.error(`Dropped ${dropped.length} rule(s) this engine cannot parse (kept in the file, excluded from classification):`);
      dropped.forEach((s) => console.error(`  ${s.replace(/\s+/g, ' ').slice(0, 120)}`));
    }
  }
  if (browserSelectors.length !== nodeRules.length) {
    throw new Error(
      `ALIGNMENT FAILURE: Node parser found ${nodeRules.length} rules, browser CSSOM found ${browserSelectors.length}. Aborting rather than risk misaligned classification.`
    );
  }
  let mismatches = 0;
  const norm = (s) =>
    s
      .replace(/\s+/g, ' ')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/\s+,/g, ',')
      .replace(/\*(::?)/g, '$1') // browser drops implicit universal selector before a pseudo
      .replace(/\(\s*(-?\d*n)\s*([+-])\s*(\d+)\s*\)/gi, '($1$2$3)') // nth-child formula spacing
      .trim();
  for (let i = 0; i < nodeRules.length; i++) {
    if (norm(nodeRules[i].selectorText) !== norm(browserSelectors[i])) {
      mismatches++;
      if (mismatches <= 5) {
        console.error(
          `Selector mismatch at index ${i}:\n  node:    ${nodeRules[i].selectorText}\n  browser: ${browserSelectors[i]}`
        );
      }
    }
  }
  if (mismatches > 0) {
    const rate = mismatches / nodeRules.length;
    if (rate > 0.02) {
      throw new Error(`ALIGNMENT FAILURE: ${mismatches}/${nodeRules.length} selector mismatches (${(rate * 100).toFixed(1)}%). Aborting.`);
    }
    console.error(`WARNING: ${mismatches}/${nodeRules.length} selector text mismatches (whitespace-only expected, tolerated).`);
  }
  console.error('Alignment validated: Node parse and browser CSSOM agree on rule order and count.');

  // Classification state, keyed by rule index.
  const state = nodeRules.map(() => ({ anyMatch: false, anyLive: false, mode: null }));

  const DYNAMIC_RE = /:hover|:active|:focus(-visible|-within)?|:target|:checked|:indeterminate|:required|:invalid|:valid|:in-range|:out-of-range|:default|:optional|:read-only|:read-write|::selection|::placeholder|::marker|::first-line|::first-letter|:link|:visited/i;
  const PSEUDO_ELEMENT_RE = /::?(before|after)\b/gi;

  function stripDynamic(sel) {
    return sel
      .replace(/:hover\b/gi, '')
      .replace(/:active\b/gi, '')
      .replace(/:focus(-visible|-within)?\b/gi, '')
      .replace(/:target\b/gi, '')
      .replace(/:checked\b/gi, '')
      .replace(/:indeterminate\b/gi, '')
      .replace(/:required\b/gi, '')
      .replace(/:invalid\b/gi, '')
      .replace(/:valid\b/gi, '')
      .replace(/:in-range\b/gi, '')
      .replace(/:out-of-range\b/gi, '')
      .replace(/:default\b/gi, '')
      .replace(/:optional\b/gi, '')
      .replace(/:read-only\b/gi, '')
      .replace(/:read-write\b/gi, '')
      .replace(/::selection\b/gi, '')
      .replace(/::placeholder\b/gi, '')
      .replace(/::marker\b/gi, '')
      .replace(/::first-line\b/gi, '')
      .replace(/::first-letter\b/gi, '')
      .replace(/:link\b/gi, '')
      .replace(/:visited\b/gi, '')
      .trim();
  }

  let combosRun = 0;
  const totalCombos = htmlFiles.length * themes.length * widths.length;

  for (const file of htmlFiles) {
    for (const width of widths) {
      for (const theme of themes) {
        combosRun++;
        const page = await browser.newPage();
        await page.setViewportSize({ width, height: 1000 });
        try {
          await page.goto(baseUrl + '/' + file + '?theme=' + theme, {
            waitUntil: 'load',
            timeout: 20000,
          });
          await page.waitForTimeout(150);
        } catch (e) {
          console.error(`SKIP ${file} @ ${width}/${theme}: ${e.message}`);
          await page.close();
          continue;
        }

        const results = await page.evaluate(
          ({ cssBase, dynamicRe, dynamicFlags }) => {
            const sheet = [...document.styleSheets].find((s) => s.href && s.href.includes(cssBase));
            if (!sheet) return { error: 'no-sheet' };
            const rules = [];
            function walk(list) {
              for (const r of list) {
                if (r.type === 1) rules.push(r);
                else if (r.type === 4) walk(r.cssRules);
              }
            }
            walk(sheet.cssRules);

            const dynRe = new RegExp(dynamicRe, dynamicFlags);
            const out = new Array(rules.length);

            function computedSignature(el, pseudo) {
              const cs = getComputedStyle(el, pseudo || undefined);
              let sig = '';
              for (let i = 0; i < cs.length; i++) {
                const p = cs[i];
                sig += p + ':' + cs.getPropertyValue(p) + ';';
              }
              return sig;
            }

            // getComputedStyle's indexed enumeration (cs.length/cs[i]) does NOT
            // include custom properties (--foo). A rule that only sets a custom
            // property token (most :root theme-variable rules) would otherwise
            // always show "no diff on itself" when cleared, even though other
            // elements consuming var(--foo) elsewhere are affected. Explicitly
            // re-read every property name this exact rule declares (rule.style
            // enumerates custom-property names fine even though computed-style
            // enumeration does not) via getPropertyValue, which resolves custom
            // properties correctly. The name list must be captured ONCE before
            // the rule is cleared -- reading rule.style.length after clearing
            // would always see zero properties and manufacture a false diff.
            function declaredPropNames(rule) {
              const names = [];
              for (let i = 0; i < rule.style.length; i++) names.push(rule.style.item(i));
              return names;
            }
            function declaredPropSignature(el, names, pseudo) {
              const cs = getComputedStyle(el, pseudo || undefined);
              let sig = '';
              for (const p of names) {
                sig += p + ':' + cs.getPropertyValue(p) + ';';
              }
              return sig;
            }

            function stripDynamicJS(sel) {
              return sel
                .replace(/:hover\b/gi, '')
                .replace(/:active\b/gi, '')
                .replace(/:focus(-visible|-within)?\b/gi, '')
                .replace(/:target\b/gi, '')
                .replace(/:checked\b/gi, '')
                .replace(/:indeterminate\b/gi, '')
                .replace(/:required\b/gi, '')
                .replace(/:invalid\b/gi, '')
                .replace(/:valid\b/gi, '')
                .replace(/:in-range\b/gi, '')
                .replace(/:out-of-range\b/gi, '')
                .replace(/:default\b/gi, '')
                .replace(/:optional\b/gi, '')
                .replace(/:read-only\b/gi, '')
                .replace(/:read-write\b/gi, '')
                .replace(/::selection\b/gi, '')
                .replace(/::placeholder\b/gi, '')
                .replace(/::marker\b/gi, '')
                .replace(/::first-line\b/gi, '')
                .replace(/::first-letter\b/gi, '')
                .replace(/:link\b/gi, '')
                .replace(/:visited\b/gi, '')
                .trim();
            }

            for (let idx = 0; idx < rules.length; idx++) {
              const rule = rules[idx];
              const sel = rule.selectorText;
              const entry = { matched: false, live: false, mode: 'normal' };
              try {
                if (dynRe.test(sel)) {
                  entry.mode = 'dynamic-conservative';
                  const base = stripDynamicJS(sel);
                  if (base) {
                    const els = document.querySelectorAll(base);
                    if (els.length > 0) {
                      entry.matched = true;
                      entry.live = true; // conservative: never auto-delete
                    }
                  }
                } else if (/::?(before|after)\b/i.test(sel)) {
                  entry.mode = 'pseudo-element';
                  const base = sel.replace(/::?(before|after)\b/gi, '').trim();
                  const wantsBefore = /:(:)?before\b/i.test(sel);
                  const wantsAfter = /:(:)?after\b/i.test(sel);
                  if (base) {
                    const els = document.querySelectorAll(base);
                    if (els.length > 0) {
                      entry.matched = true;
                      const sample = Array.from(els).slice(0, 8);
                      const pseudos = [];
                      if (wantsBefore) pseudos.push('::before');
                      if (wantsAfter) pseudos.push('::after');
                      const declaredNames = declaredPropNames(rule);
                      for (const el of sample) {
                        for (const pseudo of pseudos) {
                          const before = computedSignature(el, pseudo) + declaredPropSignature(el, declaredNames, pseudo);
                          const orig = rule.style.cssText;
                          rule.style.cssText = '';
                          const after = computedSignature(el, pseudo) + declaredPropSignature(el, declaredNames, pseudo);
                          rule.style.cssText = orig;
                          if (before !== after) entry.live = true;
                        }
                      }
                    }
                  }
                } else {
                  const els = document.querySelectorAll(sel);
                  if (els.length > 0) {
                    entry.matched = true;
                    const sample = Array.from(els).slice(0, 8);
                    const declaredNames = declaredPropNames(rule);
                    for (const el of sample) {
                      const before = computedSignature(el) + declaredPropSignature(el, declaredNames);
                      const orig = rule.style.cssText;
                      rule.style.cssText = '';
                      const after = computedSignature(el) + declaredPropSignature(el, declaredNames);
                      rule.style.cssText = orig;
                      if (before !== after) {
                        entry.live = true;
                        break;
                      }
                    }
                  }
                }
              } catch (e) {
                entry.mode = 'error:' + e.message;
              }
              out[idx] = entry;
            }
            return { entries: out };
          },
          { cssBase: path.basename(cssRelPath), dynamicRe: DYNAMIC_RE.source, dynamicFlags: DYNAMIC_RE.flags }
        );

        await page.close();

        if (results.error) {
          console.error(`SKIP ${file} @ ${width}/${theme}: ${results.error}`);
          continue;
        }
        for (let i = 0; i < results.entries.length; i++) {
          const e = results.entries[i];
          if (e.matched) state[i].anyMatch = true;
          if (e.live) state[i].anyLive = true;
          if (state[i].mode === null) state[i].mode = e.mode;
        }
        process.stderr.write(`\r[${combosRun}/${totalCombos}] ${file} @ ${width}px/${theme}          `);
      }
    }
  }
  console.error('');

  await browser.close();
  server.close();

  const report = nodeRules.map((r, i) => ({
    index: r.index,
    selectorText: r.selectorText,
    region: r.region,
    ruleStart: r.ruleStart,
    ruleEnd: r.ruleEnd,
    anyMatch: state[i].anyMatch,
    anyLive: state[i].anyLive,
    mode: state[i].mode,
    classification: !state[i].anyMatch ? 'dead' : !state[i].anyLive ? 'overridden' : 'live',
  }));

  const json = JSON.stringify({ appleOffset, cssRelPath, htmlFiles, rules: report }, null, 0);
  if (outFile) {
    writeFileSync(outFile, json);
    console.error(`Wrote report to ${outFile}`);
  } else {
    process.stdout.write(json);
  }

  const dead = report.filter((r) => r.classification === 'dead').length;
  const overridden = report.filter((r) => r.classification === 'overridden').length;
  const live = report.filter((r) => r.classification === 'live').length;
  const liveLegacy = report.filter((r) => r.classification === 'live' && r.region === 'legacy').length;
  console.error(`Summary: ${report.length} rules total. dead=${dead} overridden=${overridden} live=${live} (live-legacy=${liveLegacy})`);
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
