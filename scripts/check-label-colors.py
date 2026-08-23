#!/usr/bin/env python3
"""Guard the label color system: one mechanism for every status/category label.

styles.css defines a single mechanism for every label on the site
(design/house-style.md, "Label color system"): each state sets one
--status-color custom property on .status-pill or .tag and the shared base
rule derives border, text, background, and dot from it. A page-local <style>
block that sets background/color/border directly on a .status-pill.* or
.tag.* selector, or that reassigns --status-color to a raw color instead of
a var(--token), quietly recreates a second, divergent color language.

That already happened once: toccata-status.html carried

    .toccata-status-table .status-pill.testnet {
      --status-color: var(--cyan);
    }

which reasserted the exact testnet/target collision styles.css's
LABEL COLOR SYSTEM block exists to fix, with higher specificity, so the fix
silently lost on that one page. This check exists so that class of bug fails
the gate instead of shipping quietly.

Scope: every *.html file at the site root and in one level of subdirectories,
except demos/, which is a separately owned surface with its own component
patterns; those are reported as warnings, not failures, so this check does
not block work on files it was not asked to fix.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

SKIP_DIRS = {
    "node_modules", "_preview-site", "visual-audit", "exports", "experiment",
    ".git",
}
WARN_ONLY_DIRS = {"demos"}

STYLE_BLOCK_RE = re.compile(r"<style\b[^>]*>(.*?)</style>", re.DOTALL | re.IGNORECASE)
# A rule targeting a label state: .status-pill.live, .tag.build, etc.
LABEL_RULE_RE = re.compile(
    r"\.(?:status-pill|tag)\.[\w-]+(?:\s*,\s*\.(?:status-pill|tag)\.[\w-]+)*\s*\{([^}]*)\}",
)
DIRECT_COLOR_PROP_RE = re.compile(
    r"(?<!--status-color)\b(background(?:-color)?|(?<!border-)color|border(?:-color)?)\s*:",
)
RAW_STATUS_COLOR_RE = re.compile(r"--status-color\s*:\s*(?!var\()")


def find_html_files():
    for path in sorted(ROOT.glob("*.html")):
        yield path, False
    for sub in sorted(ROOT.iterdir()):
        if not sub.is_dir() or sub.name in SKIP_DIRS:
            continue
        warn_only = sub.name in WARN_ONLY_DIRS
        for path in sorted(sub.glob("*.html")):
            yield path, warn_only


def scan_file(path):
    text = path.read_text(encoding="utf-8", errors="replace")
    violations = []
    for style_block in STYLE_BLOCK_RE.findall(text):
        for rule_match in LABEL_RULE_RE.finditer(style_block):
            body = rule_match.group(1)
            selector = style_block[: rule_match.start()].rsplit("\n", 1)[-1].strip() or rule_match.group(0)[:60]
            if RAW_STATUS_COLOR_RE.search(body):
                violations.append(
                    f"  --status-color set to a raw value instead of var(--token): {rule_match.group(0)[:120].strip()}"
                )
            # Strip a bare --status-color: var(...) declaration before checking
            # for direct color properties, since that is the sanctioned form.
            body_without_token = re.sub(r"--status-color\s*:\s*var\([^)]*\)\s*;?", "", body)
            for prop_match in DIRECT_COLOR_PROP_RE.finditer(body_without_token):
                violations.append(
                    f"  direct '{prop_match.group(1)}' on a label selector, bypassing --status-color: "
                    f"{rule_match.group(0)[:120].strip()}"
                )
    return violations


def main():
    failures = []
    warnings = []
    for path, warn_only in find_html_files():
        violations = scan_file(path)
        if not violations:
            continue
        rel = path.relative_to(ROOT)
        bucket = warnings if warn_only else failures
        bucket.append((rel, violations))

    if warnings:
        print("Label color system: warnings (owned surface, not blocking):")
        for rel, violations in warnings:
            print(f" {rel}")
            for v in violations:
                print(v)
        print()

    if failures:
        print("Label color system: FAILED")
        print(
            "One or more pages style a .status-pill or .tag state directly instead "
            "of through --status-color. Fix: set --status-color to an existing "
            "token (var(--green), var(--cyan), var(--purple-pill), var(--pink), "
            "var(--amber), var(--red), var(--muted)) and let the shared base rule "
            "in styles.css derive border, text, background, and dot. See "
            "design/house-style.md, 'Label color system'."
        )
        for rel, violations in failures:
            print(f" {rel}")
            for v in violations:
                print(v)
        return 1

    print("Label color system: every .status-pill/.tag state on the checked "
          "surface uses --status-color. OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
