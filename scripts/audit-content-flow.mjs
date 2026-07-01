import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "site-manifest.json"), "utf8"));
const pages = manifest.pages;
const failures = [];

const generalStatusNoteAllowed = new Set([
  "status.html",
  "toccata-status.html",
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
  "kaspa-mining-cycle.html",
  "sources.html",
  "status.html",
]);

const normalPageWordLimit = 2400;
const essayPageWordLimit = 3200;

const personalEssayFiles = new Set([
  "toccata-expressiveness-upgrade.html",
  "toccata-expressiveness-upgrade-part-2.html",
  "toccata-expressiveness-upgrade-part-3.html",
]);

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

  if (!labels.includes("Build on Kaspa")) {
    fail("index.html should feature Build on Kaspa as a main route");
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
  const flowLabels = [
    "Founder fit",
    "Product ideas",
    "Toccata ideas",
    "Compare",
    "Evidence",
    "Reality check",
  ];

  for (const label of flowLabels) {
    if (!html.includes(label)) {
      fail(`build-on-kaspa.html should expose builder flow label: ${label}`);
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
