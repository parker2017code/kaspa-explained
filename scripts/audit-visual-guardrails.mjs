import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "site-manifest.json"), "utf8"));
const htmlFiles = [...new Set([...manifest.pages, "404.html"])];
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const failures = [];

/* Every guardrail below defends a rendered appearance. A guardrail whose target
   class renders on no page defends nothing, and it does worse than nothing: it
   demands a stylesheet rule for an element that does not exist, so the gate goes
   red and the only way to green it is to add dead CSS. That is what happened to
   .origin-proof-strip, .reality-grid, .field-study-grid and .ai-destination-grid,
   removed from every page in b87ff53/dbc472d and still guarded here on
   2026-08-29, blocking the gate with eight failures nobody could act on.
   GUARDED_CLASSES is the fix in the other direction: name every class a guardrail
   depends on, and fail when one stops rendering, pointing at the guardrail to
   delete rather than at the stylesheet to pad. */
const markupCorpus = [...htmlFiles, ...(fs.existsSync(path.join(root, "demos"))
  ? fs.readdirSync(path.join(root, "demos")).filter((f) => f.endsWith(".html")).map((f) => `demos/${f}`)
  : [])]
  .filter((f) => fs.existsSync(path.join(root, f)))
  .map((f) => fs.readFileSync(path.join(root, f), "utf8"))
  .join("\n");

const GUARDED_CLASSES = [
  "section",
  "transaction-rail",
  "code-block",
  "nav-links",
  /* .nav-cta was removed from every page and 11 rules for it still sit in
     styles.css. It is named in auditHeaderControls's hover regex as an optional
     alternation, so that guardrail still covers the three controls that do
     render. Not listed here because the fix is deleting its CSS, not restoring
     the class. */
  "theme-toggle",
  "nav-menu-button",
];

function auditGuardrailTargetsStillRender() {
  for (const name of GUARDED_CLASSES) {
    const used = new RegExp(`class="[^"]*\\b${name}\\b`).test(markupCorpus)
      || new RegExp(`classList[^\n]*['"\`]${name}['"\`]`).test(markupCorpus);
    if (!used) {
      fail(`guardrail targets .${name}, which no page renders any more. Delete the guardrail, do not add CSS for it.`);
    }
  }
}

function fail(message) {
  failures.push(message);
}

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function numberFromCssValue(value) {
  if (!value) return Number.NaN;
  const normalized = value.trim().replace(/^\./, "0.");
  return Number.parseFloat(normalized);
}

function declarationBlock(selectorPattern, label) {
  // Concatenate every matching block in file order. Identical selectors
  // cascade last-wins, and declarationValue reads the last occurrence, so
  // the assertion tests the value that actually renders rather than
  // whichever definition happens to appear first in the file.
  const global = new RegExp(selectorPattern.source, "g");
  const bodies = [];
  let match;
  while ((match = global.exec(css)) !== null) bodies.push(match[1]);
  if (bodies.length === 0) {
    fail(`styles.css missing ${label}`);
    return "";
  }
  return bodies.join("\n");
}

function mediaRuleBlock(maxWidth, selector, label) {
  const mediaNeedle = `@media (max-width: ${maxWidth}px)`;
  const mediaIndex = css.indexOf(mediaNeedle);
  if (mediaIndex < 0) {
    fail(`styles.css missing ${mediaNeedle}`);
    return "";
  }

  const openIndex = css.indexOf("{", mediaIndex);
  if (openIndex < 0) {
    fail(`styles.css missing ${mediaNeedle} block body`);
    return "";
  }

  let depth = 0;
  let closeIndex = -1;
  for (let index = openIndex; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") depth -= 1;
    if (depth === 0) {
      closeIndex = index;
      break;
    }
  }

  if (closeIndex < 0) {
    fail(`styles.css has an unterminated ${mediaNeedle} block`);
    return "";
  }

  // Concatenate the selector's body from EVERY same-max-width media block,
  // in file order, for the same last-wins reason as declarationBlock.
  const bodies = [];
  let searchFrom = 0;
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  while (true) {
    const mi = css.indexOf(mediaNeedle, searchFrom);
    if (mi < 0) break;
    const oi = css.indexOf("{", mi);
    let d = 0;
    let ci = -1;
    for (let index = oi; index < css.length; index += 1) {
      if (css[index] === "{") d += 1;
      if (css[index] === "}") d -= 1;
      if (d === 0) { ci = index; break; }
    }
    if (ci < 0) break;
    const body = css.slice(oi + 1, ci);
    const re = new RegExp(`\\n\\s*${escapedSelector}\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, "g");
    let m;
    while ((m = re.exec(body)) !== null) bodies.push(m[1]);
    searchFrom = ci + 1;
  }
  if (bodies.length === 0) {
    fail(`styles.css missing ${label}`);
    return "";
  }
  return bodies.join("\n");
}

function declarationValue(block, property) {
  // Last occurrence wins, matching the cascade for identical selectors.
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = [...block.matchAll(new RegExp(`(?<![-a-zA-Z])${escaped}\\s*:\\s*([^;]+);`, "g"))];
  return matches.length ? matches[matches.length - 1][1].trim() : "";
}

function assertOpacityAtMost(block, propertyName, max) {
  const value = numberFromCssValue(declarationValue(block, propertyName));
  if (!Number.isFinite(value)) {
    fail(`styles.css missing ${propertyName} opacity guardrail`);
    return;
  }
  if (value > max) {
    fail(`styles.css ${propertyName} opacity ${value} is above ${max}`);
  }
}

function assertCssIncludes(snippet, label) {
  if (!css.includes(snippet)) fail(`styles.css missing ${label}`);
}

function auditKaspaBrandTokens() {
  // RETIRED (pre-2026-07-08 glass design): assertCssIncludes("--green: #6fc7ba;", "dark Kaspa mint brand token");
  // RETIRED (pre-2026-07-08 glass design): assertCssIncludes("--green-rgb: 111, 199, 186;", "dark Kaspa mint RGB token");
  // RETIRED (pre-2026-07-08 glass design): assertCssIncludes("--green: #197a6b;", "light accessible Kaspa green token");
  // RETIRED (pre-2026-07-08 glass design): assertCssIncludes("--green-rgb: 25, 122, 107;", "light accessible Kaspa green RGB token");
  // RETIRED (pre-2026-07-08 glass design): assertCssIncludes("--bg: #0b1110;", "dark Kaspa graphite background");
  // RETIRED (pre-2026-07-08 glass design): assertCssIncludes("--text: #14201f;", "light Kaspa ink text");
  const defaultDriftTokens = [
    "--green: #188038;",
    "--cyan: #1a73e8;",
    "--text: #202124;",
    "--faint: #80868b;",
  ];

  for (const token of defaultDriftTokens) {
    if (css.includes(token)) {
      fail(`styles.css should not drift back to generic Google token ${token}`);
    }
  }
}

function auditKaspaSurfaceTreatment() {
  // RETIRED (pre-2026-07-08 glass design): assertCssIncludes( "background:\n linear-gradient(132deg, rgba(var(--green-rgb), .068), transparent 30%, rgba(var(--cyan-rgb), .035) 65%, transparent 88%),", "dark Kaspa background wash", );
  // RETIRED: .hero-visual appears on zero pages, so this asserted styling for a
  // component that nothing renders.
  // The eyebrow's winning form is split across its base block (uppercase)
  // and the final design layer (letter-spacing), so assert the cascaded
  // values instead of one byte snippet.
  const eyebrowBlock = declarationBlock(/\n\.eyebrow\s*\{([\s\S]*?)\n\}/, "technical eyebrow label treatment");
  if (declarationValue(eyebrowBlock, "text-transform") !== "uppercase" ||
      !declarationValue(eyebrowBlock, "letter-spacing")) {
    fail("styles.css missing technical eyebrow label treatment");
  }
}

function auditIntegratedGlassPolish() {
  // RETIRED (pre-2026-07-08 glass design): assertCssIncludes("--preview-radius: 18px;", "integrated Kaspa glass/material radius token");
  // RETIRED (pre-2026-07-08 glass design): assertCssIncludes("--preview-glass: rgba(16, 28, 25, .7);", "dark integrated glass surface token");
  // RETIRED (pre-2026-07-08 glass design): assertCssIncludes("--preview-glass: rgba(255, 255, 255, .78);", "light integrated glass surface token");
  // RETIRED (pre-2026-07-08 glass design): assertCssIncludes("Kaspa glass/material production layer.", "final production glass/material override layer");
  // RETIRED (pre-2026-07-08 glass design): assertCssIncludes("backdrop-filter: blur(24px) saturate(155%);", "strong glass header blur");
  // RETIRED (pre-2026-07-08 glass design): assertCssIncludes("box-shadow: inset 0 1px 0 var(--preview-glass-highlight), var(--preview-elevation-1);", "material elevation on glass surfaces");
  for (const file of htmlFiles) {
    const html = readFile(file);
    if (html.includes("styles-glass-material-preview.css")) {
      fail(`${file} should not ship the local-only preview stylesheet`);
    }
  }
}

function auditStylesheetCacheKeys() {
  const keys = new Map();

  for (const file of htmlFiles) {
    const html = readFile(file);
    const matches = [...html.matchAll(/<link rel="stylesheet" href="styles\.css\?v=([^"]+)">/g)];
    if (matches.length !== 1) {
      fail(`${file} must include exactly one versioned styles.css link`);
      continue;
    }
    keys.set(file, matches[0][1]);
  }

  const uniqueKeys = new Set(keys.values());
  if (uniqueKeys.size !== 1) {
    fail(`styles.css cache keys must match across pages: ${[...uniqueKeys].join(", ")}`);
  }
}

function auditSelectivePolish() {
  // RETIRED (2026-08-23, glass/gradient cleanup): this used to REQUIRE a
  // --glass-sheen gradient token and REQUIRE it stay attached to
  // .section::before, .quadrant, .fit-note, and friends -- i.e. it treated
  // the site's glossy sheen as a sanctioned, mandatory design element. That
  // was itself part of why the owner kept finding glass after four "clean"
  // audits: the guardrail meant to catch regressions was actively
  // protecting the thing being complained about. The owner's 2026-08-23
  // instruction removed the sanctioned-exception status of every gradient
  // surface, including this one. The token and its consuming rules are
  // gone from styles.css; this function now guards against it coming back.
  if (/--glass-(?:surface|edge|sheen|inset|rim):/i.test(css)) {
    fail("styles.css should not reintroduce --glass-surface/--glass-edge/--glass-sheen/--glass-inset/--glass-rim; the flat token treatment (color-mix background + color-mix border + token text color) replaced it site-wide on 2026-08-23");
  }
}

function auditGlowAndContrastDefaults() {
  if (/drop-shadow\(/i.test(css)) fail("styles.css should not use drop-shadow glow effects");
  if (/box-shadow\s*:\s*0\s+0\s+(?!0)/i.test(css)) {
    fail("styles.css should not use broad 0 0 glow shadows");
  }

  // RETIRED (2026-08-31 cascade cleanup): the body::before texture layer is
  // display:none in the final design layer ("body::before, body::after {
  // display: none; }"), so its opacity renders nowhere. Guard the hiding
  // rule instead: if the texture ever comes back, the opacity caps come
  // back with it.
  if (!/body::before,\s*\nbody::after\s*\{\s*\n\s*display:\s*none;/.test(css)) {
    fail("final design layer should keep body::before/::after hidden (or restore the opacity caps this replaced)");
  }

  const lightHeadingBlock = declarationBlock(
    /\n:root\[data-theme="light"\]\s+h1,\s*\n:root\[data-theme="light"\]\s+h2\s*\{([\s\S]*?)\n\}/,
    "light heading shadow reset",
  );
  if (declarationValue(lightHeadingBlock, "text-shadow") !== "none") {
    fail("light-mode h1/h2 must reset text-shadow to none");
  }

  for (const match of css.matchAll(/backdrop-filter:\s*blur\(([\d.]+)px\)\s+saturate\(([\d.]+)%\)/g)) {
    const blur = Number.parseFloat(match[1]);
    const saturation = Number.parseFloat(match[2]);
    if (blur > 24 || saturation > 160) {
      fail(`backdrop-filter is too dramatic: blur(${blur}px) saturate(${saturation}%)`);
    }
  }
}

function auditGraphReadout() {
  // RETIRED: the .visual-readout component was removed from index.html when the
  // homepage was restructured. Nothing renders it, so these assertions describe
  // a component that no longer exists.
  return;
  assertCssIncludes(".dag-node circle {\n  fill: var(--graph-node-fill);", "opaque DAG node fill");
  assertCssIncludes(".dag-node.soft circle {\n  fill: var(--graph-node-soft-fill);", "opaque soft DAG node fill");
  assertCssIncludes(".dag-node.selected circle {\n  fill: var(--graph-node-selected-fill);", "opaque selected DAG node fill");
  assertCssIncludes(".demo-edge {\n  fill: none;", "unfilled demo edges");
  assertCssIncludes(':root[data-theme="light"] .demo-edge {\n  stroke: rgba(47, 118, 105, .58);\n  fill: none;', "unfilled light-mode demo edges");
  assertCssIncludes(".demo-block circle {\n  fill: var(--graph-node-fill);", "opaque demo node fill");
  assertCssIncludes(".demo-block.side circle {\n  fill: var(--graph-node-side-fill);", "opaque side demo node fill");

  const readoutBlock = declarationBlock(/\n\.visual-readout\s*\{([\s\S]*?)\n\}/, "visual-readout");
  const readoutMargin = declarationValue(readoutBlock, "margin-bottom");
  if (!/clamp\((?:8|9|10|1[1-9])px,/.test(readoutMargin)) {
    fail(".visual-readout needs a bottom margin so cards do not crowd the next section");
  }

  const cardBlock = declarationBlock(/\n\.visual-readout div\s*\{([\s\S]*?)\n\}/, "visual-readout card");
  const minHeight = numberFromCssValue(declarationValue(cardBlock, "min-height"));
  if (!Number.isFinite(minHeight) || minHeight < 84) {
    fail(".visual-readout cards need a stable min-height of at least 84px");
  }

  const padding = declarationValue(cardBlock, "padding");
  const paddingParts = padding.split(/\s+/).map(numberFromCssValue).filter(Number.isFinite);
  const paddingBottom =
    paddingParts.length === 1 ? paddingParts[0] :
    paddingParts.length === 2 ? paddingParts[0] :
    paddingParts.length === 3 ? paddingParts[2] :
    paddingParts.length >= 4 ? paddingParts[2] :
    Number.NaN;
  if (!Number.isFinite(paddingBottom) || paddingBottom < 14) {
    fail(".visual-readout cards need at least 14px bottom padding");
  }

  const index = readFile("index.html");
  const start = index.indexOf('class="visual-caption visual-readout"');
  const end = start >= 0 ? index.indexOf("</section>", start) : -1;
  const readoutHtml = start >= 0 && end > start ? index.slice(start, end) : "";
  const expectedLabels = ["Structure", "Rule", "Boundary"];
  for (const label of expectedLabels) {
    if (!readoutHtml.includes(`<span>${label}</span>`)) {
      fail(`index.html visual readout missing ${label} card`);
    }
  }
}

function auditCardPadding() {
  const sectionBlock = declarationBlock(/\n\.section\s*\{([\s\S]*?)\n\}/, "section spacing");
  /* The owner asked for tighter vertical rhythm sitewide. The old floor of
     20px encoded the opposite preference and blocked the compression pass.
     A floor still exists so sections cannot collapse to nothing. */
  if (!/padding:\s*clamp\((?:1[2-9]|2[0-9]|3[0-9])px,/.test(sectionBlock)) {
    fail(".section internal padding fell below the 12px floor");
  }

}

function auditResponsiveCardGrids() {
  const transactionRailBlock = declarationBlock(/\n\.transaction-rail\s*\{([\s\S]*?)\n\}/, "transaction rail grid");
  if (!/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*9\.5rem\),\s*1fr\)\);/.test(transactionRailBlock)) {
    fail(".transaction-rail should wrap before step cards become cramped");
  }

  const transactionConnectorBlock = declarationBlock(
    /\n\.transaction-rail article:not\(:last-child\)::after\s*\{([\s\S]*?)\n\}/,
    "transaction rail connector default",
  );
  if (declarationValue(transactionConnectorBlock, "content") !== "none") {
    fail(".transaction-rail connectors should default off until the layout has enough room");
  }
}

function auditCodeBlocks() {
  const preBlock = declarationBlock(/\npre\s*\{([\s\S]*?)\n\}/, "base pre block");
  if (declarationValue(preBlock, "max-width") !== "100%") {
    fail("pre blocks need max-width: 100%");
  }
  if (declarationValue(preBlock, "overflow-x") !== "auto") {
    fail("pre blocks need overflow-x: auto");
  }
  if (declarationValue(preBlock, "white-space") !== "pre-wrap") {
    fail("standalone pre blocks should wrap long command lines");
  }
  if (declarationValue(preBlock, "overflow-wrap") !== "anywhere") {
    fail("pre blocks need overflow-wrap: anywhere");
  }
}

function auditNextStepButtons() {
  // RETIRED (2026-08-31): no .next-step section has a direct .button child on
  // any page in any driven state (menu open, details open, dialogs open, 390
  // and 1280); the CSS rules this asserted were deleted as unmatched. The
  // homepage CTA group this defended lives under .actions, asserted below.
  // UPDATED (2026-09-02): the single "Start Here" button was replaced by the
  // vocabulary router merged in from the retired /start-here page, which routes
  // a reader to one of two destination cards and rings the suggested one. The
  // rule this defended is that the homepage hero offers a primary route onward,
  // not that the route is shaped like a button, so it accepts either form.
  const home = readFile("index.html");
  const hasButton = /class="actions"[\s\S]{0,400}?<a class="button primary"/.test(home);
  const doorLinks = (home.match(/class="path-grid[^"]*"[\s\S]*?<\/div>/) || [""])[0]
    .match(/<a href="\//g) || [];
  if (!hasButton && doorLinks.length < 2) {
    fail("index.html should keep a primary route out of the hero: a .button primary in .actions, or a .path-grid of at least two destinations");
  }
}

function auditHeaderControls() {
  const navBlock = declarationBlock(/\n\.nav\s*\{([\s\S]*?)\n\}/, "base nav");
  const navMinHeight = numberFromCssValue(declarationValue(navBlock, "min-height"));
  // 56px is the winning apple-layer value (earlier 72px blocks are legacy,
  // overridden since 2026-07-08); assert the rendered height, not the relic.
  if (!Number.isFinite(navMinHeight) || navMinHeight < 56) {
    fail(".nav should keep a stable desktop header height");
  }

  const themeToggleBlock = declarationBlock(/\n\.theme-toggle\s*\{([\s\S]*?)\n\}/, "theme toggle");
  const toggleMinHeight = numberFromCssValue(declarationValue(themeToggleBlock, "min-height"));
  if (!Number.isFinite(toggleMinHeight) || toggleMinHeight < 38) {
    fail(".theme-toggle should keep at least a 38px desktop touch target");
  }

  const tabletNavBlock = mediaRuleBlock(1060, ".nav", "tablet nav spacing");
  if (declarationValue(tabletNavBlock, "padding") !== "10px 0") {
    fail("tablet .nav needs vertical padding so header controls are not flush to the top");
  }
  if (declarationValue(tabletNavBlock, "row-gap") !== "8px") {
    fail("tablet .nav needs row-gap for two-row header spacing");
  }

  const mobileNavBlock = mediaRuleBlock(700, ".nav", "mobile nav spacing");
  // "8px 0" is the winning apple-layer mobile padding; the "14px 0" this
  // guarded was the overridden legacy block.
  if (declarationValue(mobileNavBlock, "padding") !== "8px 0") {
    fail("mobile .nav should keep vertical padding");
  }

  const mobileToggleBlock = mediaRuleBlock(700, ".theme-toggle", "mobile theme toggle");
  const mobileToggleMinHeight = numberFromCssValue(declarationValue(mobileToggleBlock, "min-height"));
  if (!Number.isFinite(mobileToggleMinHeight) || mobileToggleMinHeight < 34) {
    fail("mobile .theme-toggle should not shrink below 34px");
  }
  const mobileToggleFontSize = numberFromCssValue(declarationValue(mobileToggleBlock, "font-size"));
  if (!Number.isFinite(mobileToggleFontSize) || mobileToggleFontSize < 12) {
    fail("mobile .theme-toggle text should remain readable");
  }

  const headerHoverBlocks = [
    ...css.matchAll(/\n\.nav-links a:hover,\s*\n\.nav-cta:hover(?:,\s*\n\.theme-toggle:hover,\s*\n\.nav-menu-button:hover)?\s*\{([\s\S]*?)\n\}/g),
    ...css.matchAll(/\n\.theme-toggle:hover\s*\{([\s\S]*?)\n\}/g),
    ...css.matchAll(/\n\.nav-menu-button:hover\s*\{([\s\S]*?)\n\}/g),
  ];

  for (const match of headerHoverBlocks) {
    if (/transform\s*:\s*translateY\(\s*-\s*[\d.]+px\s*\)/.test(match[1])) {
      fail("sticky header hover controls must not translate upward; the pill can clip against the viewport top");
    }
  }
}

auditKaspaBrandTokens();
auditKaspaSurfaceTreatment();
auditIntegratedGlassPolish();
auditStylesheetCacheKeys();
auditSelectivePolish();
auditGlowAndContrastDefaults();
auditGraphReadout();
auditCardPadding();
auditResponsiveCardGrids();
auditCodeBlocks();
auditNextStepButtons();
auditHeaderControls();
auditGuardrailTargetsStillRender();

if (failures.length > 0) {
  console.error("\nVisual guardrail audit failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("");
  process.exit(1);
}

console.log("Visual guardrails passed.");
