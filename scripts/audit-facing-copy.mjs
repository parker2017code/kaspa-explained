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
  ".mjs",
  ".txt",
  ".yml",
  ".yaml",
  ".json",
]);

const skipDirs = new Set([
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
]);

const skipFiles = new Set([
  "package-lock.json",
  "scripts/audit-facing-copy.mjs",
  "scripts/lint-copy.mjs",
]);

const rules = [
  {
    name: "not-reframe-but",
    pattern: /\bnot\s+(?:just|only|merely|simply)?\s*[^.!?\n]{1,120}\s+but\s+(?:also\s+)?[^.!?\n]{1,120}/i,
  },
  {
    name: "does-not-reframe-but",
    pattern: /\b(?:does|do|did)\s+not\s+[^.!?\n]{1,120}\s+but\s+[^.!?\n]{1,120}/i,
  },
  {
    name: "more-than-reframe",
    pattern: /\bmore\s+than\s+[^.!?\n]{1,120}/i,
  },
  {
    name: "merely-reframe",
    pattern: /\b(?:is|are|was|were|isn't|aren't|wasn't|weren't)\s+(?:merely|simply|just)\s+[^.!?\n]{1,120}/i,
  },
  {
    name: "beyond-reframe",
    pattern: /\b(?:goes?|extends?|moves?)\s+beyond\s+[^.!?\n]{1,120}/i,
  },
  {
    name: "rather-than-reframe",
    pattern: /\brather\s+than\s+[^.!?\n]{1,120}/i,
  },
  {
    name: "throat-clearing",
    pattern: /\b(it is important to note|it is worth noting|at its core|in essence|from a broader perspective|rapidly evolving landscape|this (?:highlights|underscores) the importance)\b/i,
  },
  {
    name: "generic-polish",
    pattern: /\b(delve|underscore|intricate|tapestry|realm|pivotal|seamless|robust|holistic|cutting[- ]edge|game[- ]changing|transformative|revolutionary|empower|foster)\b/i,
  },
  {
    name: "generic-platform-copy",
    pattern: /\b(platform capabilities|technology overview|where the platform applies|start a conversation|complete picture|all-in-one|end-to-end|valuable insights|drive innovation|enhance efficiency|comprehensive solution)\b/i,
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
    if (shouldSkipFile(fullPath, relativePath)) continue;

    checkFile(fullPath, relativePath);
  }
}

function shouldSkipFile(fullPath, relativePath) {
  if (skipFiles.has(relativePath)) return true;
  const extension = path.extname(fullPath);
  if (!checkedExtensions.has(extension)) return true;
  const parts = relativePath.split(path.sep);
  const stat = fs.statSync(fullPath);
  if (parts.includes("assets") && stat.size > 200_000) return true;
  if (stat.size > 2_000_000) return true;
  return false;
}

function checkFile(fullPath, relativePath) {
  const text = fs.readFileSync(fullPath, "utf8");
  const extension = path.extname(fullPath).toLowerCase();
  const segments = extractSegments(text, extension, relativePath);

  for (const segment of segments) {
    const clean = normalizeText(segment.text);
    if (!clean) continue;
    if (isInstructionContext(relativePath, clean)) continue;

    for (const rule of rules) {
      if (!rule.pattern.test(clean)) continue;
      if (isAllowedUse(rule.name, clean)) continue;
      failures.push({
        file: relativePath,
        line: segment.line,
        source: segment.source,
        rule: rule.name,
        text: clean,
      });
    }
  }
}

function extractSegments(text, extension, relativePath) {
  if (extension === ".html" || extension === ".htm") {
    const visible = text
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "\n")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "\n")
      .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, "\n")
      .replace(/<!--[\s\S]*?-->/g, "\n")
      .replace(/<[^>]+>/g, "\n");

    const segments = linesFromText(decodeHtml(visible), "visible", 1);

    const scriptBlocks = Array.from(text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi));
    for (const match of scriptBlocks) {
      const scriptStartLine = lineNumberAt(text, match.index);
      segments.push(...stringLiteralsFromText(match[1], "script-string", scriptStartLine));
    }

    return segments;
  }

  if ([".js", ".mjs", ".ts", ".tsx", ".jsx"].includes(extension)) {
    return stringLiteralsFromText(text, "source-string", 1);
  }

  if ([".md", ".mdx"].includes(extension)) {
    return markdownLines(text);
  }

  return linesFromText(text, "text", 1);
}

function markdownLines(text) {
  const segments = [];
  let inFence = false;
  const lines = text.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) {
      segments.push({ text: line, line: index + 1, source: "markdown" });
    }
  }

  return segments;
}

function stringLiteralsFromText(text, source, startLine) {
  const segments = [];
  const pattern = /(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const value = match[2]
      .replace(/\\n/g, " ")
      .replace(/\\r/g, " ")
      .replace(/\\t/g, " ")
      .replace(/\\"/g, "\"")
      .replace(/\\'/g, "'");
    if (!/[A-Za-z]/.test(value)) continue;
    if (value.length < 4 || value.length > 360) continue;
    segments.push({
      text: value,
      line: startLine + lineNumberAt(text, match.index) - 1,
      source,
    });
  }

  return segments;
}

function linesFromText(text, source, startLine) {
  return text.split(/\r?\n/).map((line, index) => ({
    text: line,
    line: startLine + index,
    source,
  }));
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

function isInstructionContext(relativePath, text) {
  const normalizedPath = relativePath.replaceAll(path.sep, "/");
  const lower = text.toLowerCase();
  const ruleFile =
    normalizedPath === "AGENTS.md" ||
    normalizedPath === "COPY_STYLE.md" ||
    normalizedPath === "CONTENT_BRIEF.md" ||
    normalizedPath === "llms.txt" ||
    normalizedPath.endsWith("/COPY_RULES.md") ||
    normalizedPath.endsWith("/DEVELOPMENT_PRINCIPLES.md");

  if (!ruleFile) return false;

  if (/[`|]/.test(text)) return true;
  if (/\b(such as|avoid|cut|delete|rewrite|ban|banned|do not|do n't|should not|weak|better|rule|rules|pattern|patterns|style|standard|llm|ai prose|generic|brochure|copy)\b/i.test(lower)) return true;
  if (/,/.test(text) && /\b(delve|underscore|intricate|tapestry|realm|pivotal|leverage|unlock|empower|foster|navigate|seamless|robust|holistic|transformative|cutting)\b/i.test(text)) return true;
  return false;
}

function isAllowedUse(ruleName, text) {
  const lower = text.toLowerCase();

  if (ruleName === "generic-polish") {
    if (/\brobustness\b/.test(lower)) return true;
    if (/\bfoster|empower\b/.test(lower) && /\bavoid|do not|cut|rewrite\b/.test(lower)) return true;
  }

  if (ruleName.includes("reframe") && /\bquote|quoting|quoted|pattern|avoid|rewrite\b/.test(lower)) {
    return true;
  }

  return false;
}

walk(root);

if (failures.length > 0) {
  console.error("\nFacing-copy audit failed. Rewrite or justify these lines:\n");

  for (const failure of failures) {
    console.error(`${failure.file}:${failure.line} [${failure.source}/${failure.rule}] ${failure.text}`);
  }

  console.error("\nA passing line should add an actor, action, evidence, status label, constraint, consequence, useful distinction, or judgment.\n");
  process.exit(1);
}

console.log("Facing-copy audit passed.");
