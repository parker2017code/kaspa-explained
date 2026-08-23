import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const checkedExtensions = new Set([
  ".md",
  ".mdx",
  ".html",
  ".htm",
  ".tsx",
  ".jsx",
  ".ts",
  ".js",
  ".astro",
  ".vue",
  ".svelte",
  ".txt",
  ".yml",
  ".yaml",
  ".json",
]);

const skipDirs = new Set([
  // Raw data-capture logs and exported machine notes. These record how a
  // dataset was scraped, not prose any reader sees, and linting them as
  // facing copy blocked commits over the wording of a capture note.
  "data",
  "exports",
  ".claude",
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".vercel",
  "coverage",
  "artifacts",
  "fixtures",
  "generated",
  "exports",
  "visual-audit",
  "vendor",
  "private-review",
  "gf-project",
  "_preview-site",
]);

const skipFiles = new Set([
  "MAINTENANCE.md",
  "PROSE_STANDARD.md",
  // Guidance files describe these patterns in order to ban them, so linting
  // them for the patterns they name is circular. AGENTS.md was already
  // exempt; the rest belong with it.
  "AGENTS.md",
  "CLAUDE.md",
  "COPY_STYLE.md",
  "CONTENT_BRIEF.md",
  "agent-index.json",
  // Internal working documents. They record findings for agents, and several
  // quote the exact patterns they exist to ban, so linting them as reader
  // copy is circular and blocks commits over the wording of a defect report.
  "COLD-READ.md",
  "BREAK.md",
  "FACTS.md",
  "CROSS-READ.md",
  "CONTRIBUTING.md",
  "CLI_FROM_ZERO.md",
  "PROGRESS.md",
  "REVIEW.md",
  "TODO.md",
  "HANDOFF.md",
  "AUDIT.md",
  "design/STANDARD.md",
  "design/house-style.md",
  "design/handoff-checklist.md",
  "design/model-picker-methodology.md",
  // Owner-authored. He wrote and tuned this page himself over a full day. The
  // essay-voice protection below applies for the same reason: a linter does
  // not get to rewrite the owner's own writing.
  "model-picker.html",
  "scripts/audit-domain-terms.mjs",
  "scripts/audit-facing-copy.mjs",
  "scripts/lint-copy.mjs",
  "package-lock.json",
]);

// X post drafts are the owner's own social copy in his voice, not site copy.
// The essay-voice protection in AGENTS.md applies to them, so the site's
// cadence rules stop at the filename.
const skipFilePatterns = [/^kaspa-x-posts.*\.md$/, /^kaspa-toccata-.*-post-series\.md$/];

const personalEssayFiles = new Set([
  "toccata-essay.html",
  "toccata-expressiveness-upgrade.html",
  "toccata-expressiveness-upgrade-part-2.html",
  "toccata-expressiveness-upgrade-part-3.html",
]);

const relaxedEssayRules = new Set([
  "not-reframe-but",
  "does-not-reframe-but",
  "comma-but-reframe",
  "comma-not-reframe",
  "imperative-comma-not",
  "comma-not-contrast",
  "not-only-bridge",
  "more-than-reframe",
  "merely-reframe",
  "beyond-reframe",
  "rather-than-reframe",
  "contrast-label",
  "importance-signpost",
]);

const rules = [
  {
    name: "not-reframe-but",
    pattern: /\bnot\s+(?:just|only|merely|simply)\s+[^.!?\n]{1,120}\s+but\s+(?:also\s+)?[^.!?\n]{1,120}/gi,
  },
  {
    name: "does-not-reframe-but",
    pattern: /\b(?:does|do|did)\s+not\s+[^.!?\n]{1,120}\s+but\s+[^.!?\n]{1,120}/gi,
  },
  {
    name: "comma-but-reframe",
    pattern: /\b(?:this|that|it|they|we|the\s+(?:goal|point|question|claim|site|page|demo|repo|product|value|story))\s+(?:is|are|was|were)\s+(?!not\b)[^.!?\n]{1,80},\s+but\s+[^.!?\n]{1,120}/gi,
  },
  {
    name: "comma-not-reframe",
    advisory: true,
    pattern: /\b(?:this|that|it|they|we|you|i|the\s+(?:answer|goal|point|question|claim|site|page|demo|repo|product|value|story|idea|thesis|risk|tradeoff|difference|distinction|path|rule|design|upgrade|model|network|chain|protocol))\s+(?:is|are|was|were|means|becomes|stays|remains|gets|gives|uses|should\s+be|can\s+be)\s+[^.!?\n]{1,100},\s+not\s+[^.!?\n]{1,120}/gi,
  },
  {
    name: "imperative-comma-not",
    pattern: /\b(?:use|write|say|choose|show|name|state|start\s+with|lead\s+with|treat|call|replace)\s+[^.!?\n]{1,90},\s+not\s+[^.!?\n]{1,120}/gi,
  },
  {
    name: "comma-not-contrast",
    advisory: true,
    pattern: /,\s+not\s+[^.!?\n]{1,120}/gi,
  },
  {
    name: "not-only-bridge",
    advisory: true,
    pattern: /\bnot\s+(?:just|only)\s+[^.!?\n]{1,120}/gi,
  },
  {
    name: "more-than-reframe",
    advisory: true,
    pattern: /\bmore\s+than\s+(?![\d.,$%])[^.!?\n]{1,120}/gi,
  },
  {
    name: "merely-reframe",
    advisory: true,
    pattern: /\b(?:is|are|was|were|isn't|aren't|wasn't|weren't)\s+(?:merely|simply|just)\s+[^.!?\n]{1,120}/gi,
  },
  {
    name: "beyond-reframe",
    advisory: true,
    pattern: /\b(?:goes?|extends?|moves?)\s+beyond\s+[^.!?\n]{1,120}/gi,
  },
  {
    name: "rather-than-reframe",
    advisory: true,
    pattern: /\brather\s+than\s+[^.!?\n]{1,120}/gi,
  },
  {
    name: "throat-clearing",
    pattern: /\b(in today'?s rapidly evolving landscape|it is important to note|it is worth noting|in conclusion|ultimately|at its core|in essence|from a broader perspective|this (?:highlights|underscores)(?: the importance)?)\b/gi,
  },
  {
    name: "generic-polish",
    pattern: /\b(delve|underscore|intricate|tapestry|realm|pivotal|seamless|robust|holistic|cutting[- ]edge|game[- ]changing|transformative|revolutionary|empower|foster)\b|\bunlock(?:s|ed|ing)?\s+(?:new\s+)?(?:value|potential|insights?|opportunities?|efficiency|growth|power|capabilities)\b|\bleverage(?:s|d|ing)?\s+[^.!?\n]{0,80}\s+(?:to|for)\b|\bnavigate(?:s|d|ing)?\s+(?:the\s+)?(?:complexities|landscape|world|realm)\b/gi,
  },
  {
    name: "generic-platform-copy",
    pattern: /\b(platform capabilities|technology overview|where the platform applies|start a conversation|complete picture|all-in-one|end-to-end|valuable insights|drive innovation|enhance efficiency|comprehensive solution)\b/gi,
  },
  {
    name: "unearned-scope-label",
    pattern: /\b(explain fully|fully explain|full explanation|complete overview|comprehensive overview|comprehensive guide|everything you need to know|ultimate guide|deep dive|thorough overview|full breakdown|long-form overview)\b/gi,
  },
  {
    name: "process-narration",
    advisory: true,
    pattern: /\b(i(?:'|\u2019)?m going to|i(?:'|\u2019)?ll start by|i will start by|my thinking is|the logic here is|the key is|this works because|i(?:'|\u2019)?d frame it as|i would frame it as|the best approach is)\b/gi,
  },
  {
    name: "workflow-scaffold",
    pattern: /\b(internal reasoning|workflow notes|scoring logic|drafting rationale|process commentary|ranking labels?|writer-facing|reader-facing clutter)\b/gi,
  },
  {
    name: "editorial-scaffold-label",
    pattern: /\b(clean public summary|citable summary|plain[- ]language explanation|source of truth|highest[- ]signal|operating spec|useful framing|why this matters|what this means|key takeaway|broader point|immediate point|stronger version|practical implication|public[- ]facing|reader[- ]facing|builder[- ]facing|copy tone)\b/gi,
  },
  {
    name: "contrast-label",
    advisory: true,
    pattern: /\b(say this|not this|bad shortcut|better version|use this wording|avoid this wording|loose wording to avoid|do not say|do not copy the category|do not let the model bluff|do not build shallow demos)\b/gi,
  },
  {
    name: "llm-transition-scaffold",
    pattern: /\b(put simply|in plain language|more importantly|it(?:'|\u2019)?s worth noting|it is worth noting|this matters because|at the end of the day)\b/gi,
  },
  {
    name: "importance-signpost",
    advisory: true,
    pattern: /\bwhy\s+(?:it|this|that|[a-z][\w'-]*(?:\s+[a-z][\w'-]*){0,4})\s+matters\b|\b(?:this|that|it|the\s+(?:distinction|point|idea|difference|reason|effect|claim|rule|design|path|case|question|locality))\s+(?:still\s+)?(?:matters|is\s+(?:important|crucial|critical|key|useful|meaningful|powerful|exciting|serious))(?:\s+because)?\b|\b(?:the\s+key\s+(?:point|idea)\s+is|the\s+important\s+part\s+is|what\s+this\s+means|this\s+(?:shows|signals|highlights|underscores))\b/gi,
  },
  {
    name: "writer-facing-label",
    pattern: /(?:^|[|>]\s*)(?:angle|cta|decision|priority|rationale|uncertainty|optional|recommended|if sending|strong fit|weak fit|research[- ]first)\s*(?::|[-|])|(?:^|[|>]\s*)skip\s*(?::|[|])/gi,
  },
];

const failures = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) walk(fullPath);
      continue;
    }

    if (!entry.isFile()) continue;
    const normalized = relativePath.split(path.sep).join("/");
    if (skipFiles.has(normalized)) continue;
    if (skipFilePatterns.some((re) => re.test(normalized))) continue;
    if (!checkedExtensions.has(path.extname(entry.name))) continue;

    checkFile(fullPath, relativePath);
  }
}

// A dated changelog records what was true on a given date. Rewriting those
// entries to satisfy a style rule falsifies the record, so style rules stop
// at the changelog boundary. Accuracy rules still apply everywhere.
function historicalLogLines(lines) {
  const skip = new Set();
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/id="status-changelog"/.test(lines[i])) depth = 1;
    if (depth > 0) {
      skip.add(i);
      if (/<\/section>/.test(lines[i])) depth = 0;
    }
  }
  return skip;
}

// A verbatim quotation from a source is evidence, not house prose. Rewriting it
// to satisfy a style rule would falsify the quote, so strip double-quoted spans
// before matching. Added 2026-07-29, after the rule fired on Kaspa's own
// documentation being quoted exactly on the Argent page.
function withoutQuotedSpans(line) {
  return line.replace(/"[^"]{12,}"/g, (m) => " ".repeat(m.length));
}

function checkFile(fullPath, relativePath) {
  const text = fs.readFileSync(fullPath, "utf8");
  const lines = text.split(/\r?\n/);
  const historical = historicalLogLines(lines);

  for (const rule of rules) {
    for (let i = 0; i < lines.length; i++) {
      const line = withoutQuotedSpans(lines[i]);
      if (historical.has(i)) continue;
      if (/\.(js|mjs|cjs)$/.test(relativePath) && /^\s*(\/\/|\*|\/\*)/.test(line)) continue;
      if (isInstructionContext(relativePath, line)) continue;
      if (isRelaxedEssayRule(relativePath, rule.name)) continue;
      if (isCodePropertyLine(line, rule.name)) continue;
      rule.pattern.lastIndex = 0;
      const match = rule.pattern.exec(line);

      if (match) {
        failures.push({
          advisory: rule.advisory === true,
          file: relativePath,
          line: i + 1,
          rule: rule.name,
          text: lines[i].trim(),
        });
      }
    }
  }
}

function isRelaxedEssayRule(relativePath, ruleName) {
  const normalizedPath = relativePath.split(path.sep).join("/");
  return personalEssayFiles.has(normalizedPath) && relaxedEssayRules.has(ruleName);
}

function isCodePropertyLine(line, ruleName) {
  if (ruleName !== "empty-marketing-verb") return false;
  return /\b(?:text-)?transform\s*:/.test(line) || /\btransition\s*:[^;]*\btransform\b/.test(line);
}

function isInstructionContext(relativePath, line) {
  const normalizedPath = relativePath.replaceAll(path.sep, "/");
  const ruleFile =
    normalizedPath === "AGENTS.md" ||
    normalizedPath === "COPY_STYLE.md" ||
    normalizedPath === "CONTENT_BRIEF.md" ||
    normalizedPath === "llms.txt" ||
    normalizedPath.endsWith("/COPY_RULES.md") ||
    normalizedPath.endsWith("/DEVELOPMENT_PRINCIPLES.md");

  if (!ruleFile) return false;
  if (/[`|]/.test(line)) return true;
  return /\b(such as|avoid|cut|delete|rewrite|ban|banned|do not|should not|weak|better|rule|rules|pattern|patterns|style|standard|llm|ai prose|generic|brochure|copy|guardrail|guidance|workflow)\b/i.test(line);
}

walk(root);

// Two severities. Blocking rules match constructions that are tells no matter
// the context. Advisory rules match comparison words, and a comparison that
// encodes a real mechanism or a measurement is good writing that a regex cannot
// distinguish from rhetorical scaffolding. Gating on those produced 36 hits of
// which nearly all were correct prose, so they report without failing. Read the
// advisory list; do not obey it blindly.
const blocking = failures.filter((f) => !f.advisory);
const advisories = failures.filter((f) => f.advisory);

if (advisories.length > 0) {
  console.error(`\nCopy lint advisories (${advisories.length}), review, do not auto-apply:\n`);
  for (const failure of advisories) {
    console.error(`${failure.file}:${failure.line} [${failure.rule}] ${failure.text}`);
  }
}

if (blocking.length > 0) {
  console.error("\nCopy lint failed. Rewrite these LLM-cadence patterns:\n");
  for (const failure of blocking) {
    console.error(`${failure.file}:${failure.line} [${failure.rule}] ${failure.text}`);
  }
  console.error("\nRewrite as direct positive claims. Avoid rhetorical contrast framing.\n");
  process.exit(1);
}

console.log(`Copy lint passed. advisories=${advisories.length}`);
