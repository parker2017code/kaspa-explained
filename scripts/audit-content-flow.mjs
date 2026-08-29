import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "site-manifest.json"), "utf8"));
const pages = manifest.pages;
const failures = [];

const generalStatusNoteAllowed = new Set([
  "status.html",
  "kaspa-claims-checker.html",
  "claims-reference.html",
  "kaspa-status-check-may-2026.html",
  "kaspa-status-updates.html",
  "sources.html",
]);

const buttonHeavyAllowed = new Set([
  "about.html",
  "ai-guidance.html",
  "command-line.html",
  "sources.html",
]);

const longReferenceAllowed = new Set([
  "claims-reference.html",
  "glossary.html",
  "kaspa-mining.html",
  "sources.html",
  "status.html",
  // Long-form guides governed by the per-section rule in
  // scripts/check-visible-sections.mjs, which caps any unbroken prose run at
  // 300 words. A whole-page ceiling is the wrong standard for them and this
  // check was applying both.
  "why-kaspa-matters.html",
  "crypto-from-scratch.html",
  "build-on-kaspa.html",
  "kaspa-origin-story.html",
  // The methodology behind model-picker.html's ranking: benchmark provenance
  // for 230 cells across 23 models and 6 dials. It lived inside one closed
  // "How the score works" disclosure on model-picker.html, 6,685 words behind
  // a single toggle, until 2026-08-29. This check's own failure message says
  // to "move reference material behind a dedicated reference page"; this page
  // is that page, so the whole-page ceiling is the wrong standard for it, the
  // same way it is for the guides above. check-visible-sections.mjs still caps
  // every unbroken prose run on it at 300 words.
  "model-picker-method.html",
  // toccata-explained.html was listed here and has been a redirect stub into
  // /what-is-kaspa#covenants since the page merge. It carries no prose, so the
  // exemption protected nothing. Removed 2026-08-29.
]);

const normalPageWordLimit = 2400;
const essayPageWordLimit = 4000;

// Shared with scripts/check-density.sh so the two content gates agree on
// which pages are essays. See scripts/essay-pages.json and
// design/density-budget.md, "Page-type scope."
const essayPages = JSON.parse(fs.readFileSync(path.join(root, "scripts/essay-pages.json"), "utf8")).essays;

const personalEssayFiles = new Set(
  essayPages.filter((page) => page.extended_word_limit).map((page) => page.file),
);

function fail(message) {
  failures.push(message);
}

function read(page) {
  return fs.readFileSync(path.join(root, page), "utf8");
}

function visibleText(html) {
  return html
    .replace(/<details\b(?![^>]*\bopen\b)[^>]*>([\s\S]*?)<\/details>/gi, (_match, body) => {
      const summary = /<summary\b[^>]*>([\s\S]*?)<\/summary>/i.exec(body);
      return summary?.[0] ?? "\n";
    })
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "\n")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, "\n")
    .replace(/<!--[\s\S]*?-->/g, "\n")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function buttonLinks(html) {
  return [...html.matchAll(/<a\s+[^>]*class="[^"]*\bbutton\b[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    .map((match) => ({
      href: match[1],
      label: visibleText(match[2]),
    }));
}

function sectionHtml(html, className) {
  const match = new RegExp(`<section[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>[\\s\\S]*?<\\/section>`).exec(html);
  return match?.[0] ?? "";
}

function auditHomepage() {
  const html = read("index.html");
  const buttons = buttonLinks(html);
  const labels = buttons.map((button) => button.label);

  if (buttons.length > 10) {
    fail(`index.html has ${buttons.length} button CTAs; keep the homepage route-focused`);
  }

  // Check the route, not the label. The intent is that the homepage sends
  // readers to the build hub; the button wording is free to change and has.
  if (!/href="\/build-on-kaspa"/.test(html)) {
    fail("index.html should route to the build hub at /build-on-kaspa");
  }

  for (const button of buttons) {
    if (/\b(?:April|May)\b/i.test(button.label)) {
      fail(`index.html still features old dated archive button: ${button.label}`);
    }
  }

  const nextStep = sectionHtml(html, "next-step");
  if (buttonLinks(nextStep).length > 3) {
    fail("index.html next-step section should keep three or fewer button CTAs");
  }
}

function auditBuildHub() {
  const html = read("build-on-kaspa.html");
  // Routes, not labels. The earlier list named pages that were merged into
  // their stronger neighbours, so it asserted a site map that no longer exists.
  // These are the builder routes the hub actually has to keep reachable.
  // Those four merged into this hub itself in the Aug 2026 cut, so requiring
  // links to them asserted a site map that no longer exists.
  // kaspa-claims-checker was retired on 23 Aug 2026 and its claim tables
  // moved into status.html under #claim-fact-check, so requiring a link to
  // it asserted a page that no longer exists.
  // toccata-explained was retired on 23 Aug 2026. Toccata activated on
  // mainnet on 30 June 2026, so a page named after the upgrade was a page
  // organized around a release. Its covenant material moved to
  // what-is-kaspa.html#covenants and its builder material and ZK demo to
  // this page, so requiring a link to it asserted a page that no longer
  // exists. The route it stood for is still checked, at its new address.
  const flowRoutes = [
    "/what-is-kaspa#covenants",
    "/status",
  ];

  for (const route of flowRoutes) {
    if (!html.includes(`href="${route}"`)) {
      fail(`build-on-kaspa.html should keep the builder route reachable: ${route}`);
    }
  }
}

function auditButtonsAndDates() {
  for (const page of pages) {
    const html = read(page);
    const buttons = buttonLinks(html);

    if (!buttonHeavyAllowed.has(page) && buttons.length > 8) {
      fail(`${page} has ${buttons.length} button CTAs; convert secondary/source links to text links`);
    }

    for (const button of buttons) {
      if (/\b(?:April|May)\b/i.test(button.label)) {
        fail(`${page} has an old dated button label: ${button.label}`);
      }
    }

    const text = visibleText(html);
    if (!generalStatusNoteAllowed.has(page) && /Status-sensitive page\.|Last checked:? June 5, 2026/i.test(text)) {
      fail(`${page} has status-check boilerplate outside a status/source page`);
    }
  }
}

function countWords(text) {
  return (text.match(/\b[\w'-]+\b/g) ?? []).length;
}

function auditAttentionBudget() {
  for (const page of pages) {
    if (longReferenceAllowed.has(page)) continue;

    const words = countWords(visibleText(read(page)));
    const wordLimit = personalEssayFiles.has(page) ? essayPageWordLimit : normalPageWordLimit;
    if (words > wordLimit) {
      fail(`${page} has ${words} visible words; cut or move reference material behind a dedicated reference page`);
    }
  }
}

auditHomepage();
auditBuildHub();
auditButtonsAndDates();
auditAttentionBudget();

if (failures.length > 0) {
  console.error("\nContent-flow audit failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("");
  process.exit(1);
}

console.log("Content-flow audit passed.");
