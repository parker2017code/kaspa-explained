import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const checkedExtensions = new Set([
  ".html",
  ".htm",
  ".md",
  ".mdx",
  ".txt",
  ".json",
  ".yml",
  ".yaml",
]);

const skipDirs = new Set([
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
  "vendor",
  "private-review",
  "gf-project",
]);

const skipFiles = new Set([
  "AGENTS.md",
  "COPY_STYLE.md",
  "CLAUDE.md",
  "CONTENT_BRIEF.md",
  "agent-index.json",
  "package-lock.json",
  "scripts/audit-domain-terms.mjs",
]);

const exactBadPhrases = [
  "validation-capacity layer",
  "throughput sovereignty engine",
  "dag-native settlement fabric",
  "app-readiness pathway",
  "proof-of-work scalability stack",
  "blockdag execution substrate",
  "decentralized confirmation intelligence",
  "user-owned throughput layer",
  "finality confidence engine",
  "programmable sovereignty framework",
  "miner-aligned application fabric",
  "serious app layer",
  "real-world settlement network",
  "blockspace coordination flywheel",
  "next-generation payment rail",
  "customer intelligence loop",
  "decision infrastructure",
  "outreach engine",
  "strategic alignment framework",
  "execution flywheel",
  "evidence platform",
  "narrative architecture",
  "trust layer",
  "operational substrate",
  "ecosystem maturity",
  "institutional readiness",
  "enterprise adoption",
  "platform unlock",
  "powerful platform",
  "production-grade usage",
  "practical adoption path",
  "mature app layer",
  "serious builder ecosystem",
];

const editorialLabels = [
  "clean public summary",
  "clean summary",
  "citable summary",
  "plain-language explanation",
  "plain-language guide",
  "plain-language route",
  "plain-language synthesis",
  "why this matters",
  "what this means",
  "key takeaway",
  "useful framing",
  "practical implication",
  "source of truth",
  "highest-signal",
  "operating spec",
];

const riskyModifiers = [
  "app-readiness",
  "blockdag",
  "blockspace",
  "capacity",
  "confirmation",
  "coordination",
  "dag-native",
  "decentralized",
  "decision",
  "evidence",
  "execution",
  "finality",
  "miner-aligned",
  "narrative",
  "next-generation",
  "operational",
  "programmable",
  "proof-of-work",
  "real-world",
  "settlement",
  "sovereignty",
  "strategic",
  "throughput",
  "trust",
  "user-owned",
  "validation",
];

const riskyNouns = [
  "engine",
  "fabric",
  "flywheel",
  "intelligence",
  "pathway",
  "substrate",
  "framework",
  "layer",
  "platform",
  "rail",
  "stack",
  "architecture",
  "ecosystem",
];

const allowedTerms = new Set([
  "account based architecture",
  "account-based architecture",
  "application layer",
  "application-layer",
  "app layer",
  "app-layer",
  "base layer",
  "base-layer",
  "blockchain architecture",
  "bridge architecture",
  "builder ecosystem",
  "consensus layer",
  "contract architecture",
  "developer ecosystem",
  "developer platform",
  "execution framework",
  "execution model",
  "fee market",
  "future architecture",
  "github actions",
  "global state",
  "kaspa developer platform",
  "kaspa ecosystem",
  "layer 1",
  "layer one",
  "layer two",
  "l1",
  "l2",
  "light client",
  "local state",
  "mempool",
  "network layer",
  "network stack",
  "node operator",
  "platform docs",
  "protocol architecture",
  "protocol layer",
  "research architecture",
  "roadmap architecture",
  "rollup architecture",
  "settlement layer",
  "smart-contract platform",
  "source stack",
  "stack-based",
  "state machine",
  "testnet",
  "transaction ordering",
  "utxo architecture",
  "utxo model",
  "virtual machine",
  "vm-based",
  "vprogs framework",
  "zk framework",
]);

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
    if (shouldSkipFile(fullPath, relativePath)) continue;
    checkFile(fullPath, relativePath);
  }
}

function shouldSkipFile(fullPath, relativePath) {
  const normalizedPath = relativePath.split(path.sep).join("/");
  if (skipFiles.has(normalizedPath)) return true;
  // X post drafts are the owner's social copy in his own voice.
  if (/^kaspa-x-posts.*\.md$/.test(normalizedPath)) return true;
  if (/^kaspa-toccata-.*-post-series\.md$/.test(normalizedPath)) return true;
  if (!checkedExtensions.has(path.extname(fullPath))) return true;
  if (fs.statSync(fullPath).size > 2_000_000) return true;
  return false;
}

function checkFile(fullPath, relativePath) {
  const text = fs.readFileSync(fullPath, "utf8");
  const segments = extractSegments(text, path.extname(fullPath).toLowerCase());

  for (const segment of segments) {
    const clean = normalizeText(segment.text);
    if (!clean) continue;
    if (isInstructionContext(relativePath, clean)) continue;

    checkExactPhrases(relativePath, segment.line, clean);
    checkInventedTermShell(relativePath, segment.line, clean);
  }
}

function extractSegments(text, extension) {
  if (extension === ".html" || extension === ".htm") {
    const visible = text
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "\n")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "\n")
      .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, "\n")
      .replace(/<!--[\s\S]*?-->/g, "\n")
      .replace(/<[^>]+>/g, "\n");

    return [
      ...linesFromText(decodeHtml(visible)),
      ...attributeContent(text, "meta-description"),
      ...attributeContent(text, "json-string"),
    ];
  }

  return linesFromText(text);
}

function attributeContent(text, source) {
  const segments = [];
  const pattern = /(?:content|description|name|headline|text|alt)="([^"]{8,360})"/gi;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (!/[A-Za-z]/.test(match[1])) continue;
    segments.push({
      text: decodeHtml(match[1]),
      line: lineNumberAt(text, match.index),
      source,
    });
  }

  return segments;
}

function linesFromText(text) {
  return text.split(/\r?\n/).map((line, index) => ({
    text: line,
    line: index + 1,
    source: "line",
  }));
}

function checkExactPhrases(relativePath, line, clean) {
  const lower = clean.toLowerCase();
  if (/\b(do not say|usually avoid|such as|bad:|better:|replace|rewrite|cut)\b/i.test(clean)) {
    return;
  }

  // A term inside quotation marks is being named in order to reject it, which
  // is the opposite of using it. Scan only the unquoted remainder.
  const unquoted = lower.replace(/"[^"]*"/g, " ").replace(/\u201c[^\u201d]*\u201d/g, " ");

  for (const phrase of [...exactBadPhrases, ...editorialLabels]) {
    if (!unquoted.includes(phrase)) continue;
    failures.push({
      file: relativePath,
      line,
      rule: "invented-or-editorial-term",
      phrase,
      text: clean,
    });
  }
}

function checkInventedTermShell(relativePath, line, clean) {
  const modifierPattern = riskyModifiers
    .map((modifier) => modifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const nounPattern = riskyNouns.join("|");
  const phrasePattern = new RegExp(
    `\\b(?:(?:${modifierPattern})\\s+){1,3}(?:${nounPattern})\\b`,
    "gi",
  );
  let match;

  while ((match = phrasePattern.exec(clean)) !== null) {
    const phrase = normalizeTerm(match[0]);
    if (allowedTerms.has(phrase)) continue;
    if (isAllowedPhrase(phrase)) continue;

    const hasConsultantNoun = /\b(engine|fabric|flywheel|intelligence|pathway|substrate)\b/.test(phrase);

    if (hasConsultantNoun || riskyModifiers.some((modifier) => phrase.includes(modifier))) {
      failures.push({
        file: relativePath,
        line,
        rule: "invented-domain-term",
        phrase,
        text: clean,
      });
    }
  }
}

function isAllowedPhrase(phrase) {
  if (/^(kip|kips|toccata|vprogs|dagknight|ghostdag|kaspa|bitcoin|ethereum|solana|risc zero|risc0|rusty kaspa)\b/.test(phrase)) {
    return true;
  }
  if (/\b(api|sdk|docs?|repo|repository|release|guide|page|route|source|link|wallet|node|miner|indexer|explorer|exchange|bridge|mempool|utxo|zk|l1|l2)\b/.test(phrase)) {
    return true;
  }
  if (/\b(stack-based|account-based|vm-based|proof-of-work|layer one|layer 1)\b/.test(phrase)) {
    return true;
  }
  return false;
}

function isInstructionContext(relativePath, clean) {
  const normalizedPath = relativePath.replaceAll(path.sep, "/");
  const ruleFile =
    normalizedPath === "CONTENT_BRIEF.md" ||
    normalizedPath === "README.md" ||
    normalizedPath === "llms.txt" ||
    normalizedPath.endsWith("/COPY_RULES.md") ||
    normalizedPath.endsWith("/DEVELOPMENT_PRINCIPLES.md");

  if (!ruleFile) return false;
  if (/[`|]/.test(clean)) return true;
  return /\b(avoid|cut|delete|rewrite|do not|should not|weak|better|rule|rules|pattern|patterns|style|standard|llm|generic|brochure|copy|guardrail|guidance|workflow)\b/i.test(clean);
}

function normalizeTerm(term) {
  return term
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[\u2010-\u2015]/g, "-")
    .trim();
}

function normalizeText(text) {
  return decodeHtml(text)
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

walk(root);

if (failures.length > 0) {
  console.error("\nDomain-term audit failed. Rewrite invented labels as mechanisms, status, constraints, or actors:\n");

  for (const failure of failures) {
    console.error(`${failure.file}:${failure.line} [${failure.rule}] ${failure.phrase}`);
    console.error(`  ${failure.text}`);
  }

  console.error("\nKeep field-native terms. Cut consultant-style category names and editorial labels.\n");
  process.exit(1);
}

console.log("Domain-term audit passed.");
