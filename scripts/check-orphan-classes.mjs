#!/usr/bin/env node
/**
 * Orphan-class gate.
 *
 * Why this exists: on 2026-08-24 .footer-legal and .footer-disclosure sat
 * on 19 pages each, and .answer-block on two, with zero matching CSS rule
 * anywhere. An element carrying a class with no rule renders with no
 * styling at all, throws no error, and passes every other check this repo
 * has, because every other check reads either the CSS or the DOM, never
 * both cross-referenced against each other. This script does exactly
 * that cross-reference: every class token used in a page's markup, or
 * built by that page's own JavaScript, must resolve to a rule in
 * styles.css or in that page's own scoped <style> block.
 *
 * This has to look inside <script> blocks too, not just static markup.
 * A first version of this scan stripped <script> entirely to avoid
 * false positives from JS string parsing, and it missed a real orphan
 * on kips.html that only ever existed as a runtime-built <p>. Fixed by
 * parsing four specific JS shapes instead of grepping raw script text:
 * class="literal" / class='literal', a bare className = "literal"
 * assignment, classList.add/toggle/remove('literal', ...), and
 * setAttribute('class', 'literal'). Only complete string literals count.
 * A literal built by concatenation (e.g. "o-" + b.color, or
 * '<div class="cvb-stat' + deadClass + '">') is a prefix or fragment, not
 * a full class name, and checking it would produce exactly the noisy
 * false positives ("'.lab'", "'.(cls'", "cvb-stat'" with a trailing
 * quote) that made the first scan unreliable. Those get skipped, not
 * guessed at: this script only ever asserts a class is missing when it
 * found a complete, unambiguous class token with no rule, and undercounts
 * (silently skips a dynamic case) rather than overcounts (cries wolf on
 * a fragment). classList.toggle's second argument is a boolean condition,
 * never a class name, and is never read as one.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function listHtmlFiles() {
  const files = [];
  for (const entry of fs.readdirSync(root)) {
    if (entry.endsWith(".html")) files.push(entry);
  }
  const demosDir = path.join(root, "demos");
  if (fs.existsSync(demosDir)) {
    for (const entry of fs.readdirSync(demosDir)) {
      if (entry.endsWith(".html")) files.push(path.join("demos", entry));
    }
  }
  return files.sort();
}

function extractClassSelectors(cssText) {
  const set = new Set();
  const re = /\.(-?[_a-zA-Z][_a-zA-Z0-9-]*)/g;
  let m;
  while ((m = re.exec(cssText))) set.add(m[1]);
  return set;
}

function stripBlocks(html, tag) {
  const re = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, "gi");
  return html.replace(re, "");
}

function blocksOf(html, tag) {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

const VALID_TOKEN = /^[A-Za-z_][A-Za-z0-9_-]*$/;

// Splits a JS call's argument text on top-level commas (ignoring commas
// inside nested parens/brackets/strings), so classList.add('a', b, 'c')
// yields ["'a'", " b", " 'c'"] rather than being split on every comma.
function splitTopLevelArgs(argText) {
  const args = [];
  let depth = 0;
  let inStr = null;
  let cur = "";
  for (let i = 0; i < argText.length; i++) {
    const ch = argText[i];
    if (inStr) {
      cur += ch;
      if (ch === inStr && argText[i - 1] !== "\\") inStr = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      inStr = ch;
      cur += ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    if (ch === ")" || ch === "]" || ch === "}") depth--;
    if (ch === "," && depth === 0) {
      args.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) args.push(cur);
  return args;
}

// A bare string-literal argument, whole and only that: 'foo', "foo", or
// `foo` with no interpolation and no surrounding concatenation.
function literalOf(argText) {
  const t = argText.trim();
  const m = /^(['"`])([^'"`]*)\1$/.exec(t);
  return m ? m[2] : null;
}

function candidatesFromScript(script) {
  const found = new Set();

  // class="literal" / class='literal', including the escaped-quote form
  // JS template strings sometimes use. The literal must be the complete
  // attribute value: bounded by the same quote character on both ends,
  // with nothing of the string before the opening quote in that segment
  // (checked implicitly: the regex anchors on `class=` immediately).
  for (const m of script.matchAll(/class=\\?(["'])([^"'\\]*)\\?\1/g)) {
    for (const tok of m[2].split(/\s+/).filter(Boolean)) found.add(tok);
  }

  // className = "literal" or className += "literal". Reject when the
  // literal is immediately followed by string concatenation, since that
  // means it is a prefix/fragment, not a complete class name.
  for (const m of script.matchAll(/\.className\s*\+?=\s*(['"`])([^'"`]*)\1\s*([;,)]|$)/g)) {
    for (const tok of m[2].split(/\s+/).filter(Boolean)) found.add(tok);
  }

  // classList.add(...) / .toggle(...) / .remove(...): only bare string
  // literal arguments count. toggle's second argument is a condition,
  // never a class, so literalOf() on it is never treated as a class
  // (it's only reached if it happens to itself be a quoted string, which
  // would be a boolean-as-string bug elsewhere, not a class name here).
  // to be safe, toggle only reads its first argument.
  for (const m of script.matchAll(/classList\.(add|toggle|remove)\(([^)]*)\)/g)) {
    const method = m[1];
    const args = splitTopLevelArgs(m[2]);
    const relevant = method === "toggle" ? args.slice(0, 1) : args;
    for (const a of relevant) {
      const lit = literalOf(a);
      if (lit) for (const tok of lit.split(/\s+/).filter(Boolean)) found.add(tok);
    }
  }

  // setAttribute('class', 'literal')
  for (const m of script.matchAll(/setAttribute\(\s*(['"`])class\1\s*,\s*(['"`])([^'"`]*)\2/g)) {
    for (const tok of m[3].split(/\s+/).filter(Boolean)) found.add(tok);
  }

  return [...found].filter((t) => VALID_TOKEN.test(t));
}

function checkFile(relPath, globalDefined) {
  const html = fs.readFileSync(path.join(root, relPath), "utf8");

  const scoped = new Set();
  for (const styleBody of blocksOf(html, "style")) {
    for (const c of extractClassSelectors(styleBody)) scoped.add(c);
  }

  const defined = new Set([...globalDefined, ...scoped]);

  const markupOnly = stripBlocks(stripBlocks(html, "script"), "style");
  const used = new Set();
  for (const m of markupOnly.matchAll(/class\s*=\s*"([^"]*)"/g)) {
    for (const tok of m[1].split(/\s+/).filter(Boolean)) used.add(tok);
  }
  for (const m of markupOnly.matchAll(/class\s*=\s*'([^']*)'/g)) {
    for (const tok of m[1].split(/\s+/).filter(Boolean)) used.add(tok);
  }

  for (const scriptBody of blocksOf(html, "script")) {
    for (const tok of candidatesFromScript(scriptBody)) used.add(tok);
  }

  const orphans = [...used]
    .filter((t) => VALID_TOKEN.test(t))
    .filter((t) => !defined.has(t))
    .sort();

  return orphans;
}

function main() {
  const cssText = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  const globalDefined = extractClassSelectors(cssText);

  const files = listHtmlFiles();
  const report = [];
  for (const f of files) {
    const orphans = checkFile(f, globalDefined);
    if (orphans.length) report.push([f, orphans]);
  }

  if (report.length === 0) {
    console.log("Orphan-class gate: no unstyled classes found across " + files.length + " pages.");
    process.exit(0);
  }

  console.error("FAILED orphan-class gate: class used in markup with no matching rule in styles.css or that page's own <style> block.\n");
  for (const [file, orphans] of report) {
    for (const cls of orphans) {
      console.error(`  ${file}: .${cls}`);
    }
  }
  console.error(`\n${report.reduce((n, [, o]) => n + o.length, 0)} orphan class instance(s) across ${report.length} file(s).`);
  process.exit(1);
}

main();
