import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "site-manifest.json"), "utf8"));
const htmlFiles = [...new Set([...manifest.pages, "404.html"])];
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const failures = [];

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
  const match = selectorPattern.exec(css);
  if (!match) {
    fail(`styles.css missing ${label}`);
    return "";
  }
  return match[1];
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

  const mediaBody = css.slice(openIndex + 1, closeIndex);
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`\\n\\s*${escapedSelector}\\s*\\{([\\s\\S]*?)\\n\\s*\\}`).exec(mediaBody);
  if (!match) {
    fail(`styles.css missing ${label}`);
    return "";
  }
  return match[1];
}

function declarationValue(block, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`${escaped}\\s*:\\s*([^;]+);`).exec(block);
  return match?.[1]?.trim() ?? "";
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
  assertCssIncludes("text-transform: uppercase;\n  letter-spacing: .065em;", "technical eyebrow label treatment");
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

  const darkBodyBefore = declarationBlock(/\nbody::before\s*\{([\s\S]*?)\n\}/, "body::before");
  assertOpacityAtMost(darkBodyBefore, "opacity", 0.14);

  const lightBodyBefore = declarationBlock(
    /\n:root\[data-theme="light"\]\s+body::before\s*\{([\s\S]*?)\n\}/,
    "light body::before",
  );
  assertOpacityAtMost(lightBodyBefore, "opacity", 0.06);

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

  const originProofBlock = declarationBlock(/\n\.origin-proof-strip\s*\{([\s\S]*?)\n\}/, "origin proof strip spacing");
  if (declarationValue(originProofBlock, "padding-top")) {
    fail(".origin-proof-strip needs full card padding on all relevant sides");
  }
  const originProofPadding = declarationValue(originProofBlock, "padding");
  if (
    !/clamp\(18px,\s*3vw,\s*28px\)\s+clamp\(18px,\s*3vw,\s*26px\)\s+clamp\(18px,\s*2\.5vw,\s*24px\)/.test(
      originProofPadding,
    )
  ) {
    fail(".origin-proof-strip needs enough inline padding to keep mobile text off the border");
  }

  const realityCardBlock = declarationBlock(
    /\n\.reality-grid article,\s*\n\.field-study-grid article\s*\{([\s\S]*?)\n\}/,
    "reality and field-study card spacing",
  );
  if (!/padding:\s*clamp\(15px,\s*2vw,\s*20px\);/.test(realityCardBlock)) {
    fail(".reality-grid and .field-study-grid article padding should prevent flush-left text");
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

  const aiDestinationBlock = declarationBlock(/\n\.ai-destination-grid\s*\{([\s\S]*?)\n\}/, "AI destination grid");
  if (!/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*7\.25rem\),\s*1fr\)\);/.test(aiDestinationBlock)) {
    fail(".ai-destination-grid should auto-fit instead of forcing cramped columns");
  }

  const aiDestinationLinkBlock = declarationBlock(/\n\.ai-destination-grid a\s*\{([\s\S]*?)\n\}/, "AI destination links");
  if (declarationValue(aiDestinationLinkBlock, "min-width") !== "0") {
    fail(".ai-destination-grid links need min-width: 0 for grid shrink behavior");
  }
  if (declarationValue(aiDestinationLinkBlock, "overflow-wrap") !== "anywhere") {
    fail(".ai-destination-grid links need overflow-wrap: anywhere");
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
  const nextStepButtonBlock = declarationBlock(/\n\.next-step > \.button\s*\{([\s\S]*?)\n\}/, "next-step direct button spacing");
  const blockStart = numberFromCssValue(declarationValue(nextStepButtonBlock, "margin-block-start"));
  const inlineEnd = numberFromCssValue(declarationValue(nextStepButtonBlock, "margin-inline-end"));
  if (!Number.isFinite(blockStart) || blockStart < 8) {
    fail(".next-step direct buttons need top spacing before and between wrapped rows");
  }
  if (!Number.isFinite(inlineEnd) || inlineEnd < 8) {
    fail(".next-step direct buttons need horizontal spacing");
  }

  const nextStepLastButtonBlock = declarationBlock(
    /\n\.next-step > \.button:last-of-type\s*\{([\s\S]*?)\n\}/,
    "next-step last direct button spacing reset",
  );
  if (declarationValue(nextStepLastButtonBlock, "margin-inline-end") !== "0") {
    fail(".next-step final direct button should reset trailing margin");
  }

  const home = readFile("index.html");
  // The homepage restructure replaced the .next-step section wrapper with the
  // shared .actions group. The thing being guarded is unchanged: a primary
  // call-to-action group must survive on the homepage for spacing coverage.
  if (!/class="actions"[\s\S]{0,400}?<a class="button primary"/.test(home)) {
    fail("index.html should keep a next-step button group for spacing audit coverage");
  }
}

function auditHeaderControls() {
  const navBlock = declarationBlock(/\n\.nav\s*\{([\s\S]*?)\n\}/, "base nav");
  const navMinHeight = numberFromCssValue(declarationValue(navBlock, "min-height"));
  if (!Number.isFinite(navMinHeight) || navMinHeight < 72) {
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
  if (declarationValue(mobileNavBlock, "padding") !== "14px 0") {
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

if (failures.length > 0) {
  console.error("\nVisual guardrail audit failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("");
  process.exit(1);
}

console.log("Visual guardrails passed.");
