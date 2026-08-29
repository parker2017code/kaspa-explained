#!/usr/bin/env bash
set -euo pipefail

# Density budget gate (design/density-budget.md, written 2026-08-22, scoped
# by page type 2026-08-22).
#
# Hard limits, per that doc: 150 visible words before the first interaction
# (the first collapsed <details> or data-collapsed="true" element, in
# document order), a 60-word paragraph cap, and a 30-word table-cell cap. A
# paragraph or cell inside an already-collapsed <details> is exempt.
#
# These limits are scoped to page type (design/density-budget.md, "Page-type
# scope" section), the same way scripts/audit-content-flow.mjs already scopes
# its word-count ceiling with a personalEssayFiles list instead of one number
# for every page:
#   - ESSAY_FILES: the pre-interaction limit does not apply (continuous prose
#     is the point) and the paragraph limit does not apply (a deliberate
#     run-on is voice, not a defect). The cell limit still applies.
#   - REFERENCE_FILES: the pre-interaction limit does not apply (a reader
#     arrives already knowing what they want; there is no "answer" to surface
#     before a lookup table). Paragraph and cell limits still apply in full.
#   - Everything else (answer/status pages): all three limits apply in full,
#     unchanged. This is the rule's original, correct target.
#
# Total word count, <details> count, and readability are ADVISORY per the same
# doc: they are reported, never gated.
#
# THIS GATE IS ADVISORY FOR NOW, on purpose. The current site violates the
# hard limits heavily (121 paragraphs over 60 words at last count) because the
# rewrite these limits are written for has not landed yet. A gate that fails
# the build on day one gets disabled, and a disabled gate is worse than none.
#
# >>> BLOCKING SWITCH: flip to "true" once the density rebuild lands. <<<
DENSITY_GATE_BLOCKING=false

DENSITY_GATE_BLOCKING="$DENSITY_GATE_BLOCKING" python3 - <<'PY'
import json
import os
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

MANIFEST = json.loads(Path("site-manifest.json").read_text(encoding="utf-8"))
PAGES = MANIFEST["pages"]  # the 25 live pages; redirect stubs are not measured

PRE_INTERACTION_LIMIT = 150
PARAGRAPH_LIMIT = 60
CELL_LIMIT = 30

# Essays and arguments: continuous prose is the product. Read from
# scripts/essay-pages.json, the single list scripts/audit-content-flow.mjs
# also reads, so the two gates cannot drift on which pages count as an essay.
# See design/density-budget.md, "Page-type scope."
ESSAY_FILES = {page["file"] for page in json.loads(Path("scripts/essay-pages.json").read_text(encoding="utf-8"))["essays"]}

# Reference and lookup pages: a reader arrives already knowing what they want,
# so there is no "answer" to surface before a table or index.
REFERENCE_FILES = {
    "sources.html",
    "glossary.html",
    "kips.html",
}

SKIP_TAGS = {"script", "style", "svg", "nav", "header", "footer"}
MEASURED_TAGS = {"p": "paragraph", "td": "cell", "th": "cell"}


# design/density-budget.md defines the pre-interaction limit as "everything above
# the fold's first <details> OR INTERACTIVE ELEMENT." This script only ever counted
# <details>, so a page whose first interaction is a slider or a button was measured
# as if that control were not there: on 2026-08-29 kaspa-mining.html reported 423
# pre-interaction words while its first slider sits about 160 words in, because
# opening its four demos moved the first *closed* disclosure further down the page.
# A rule that counts a closed panel as an interaction and a live control as prose
# rewards re-hiding the demos, which is the defect the whole budget exists to catch.
INTERACTIVE_TAGS = {"button", "input", "select", "textarea"}


def is_boundary(tag, attrs):
    if tag in INTERACTIVE_TAGS:
        return True
    if tag != "details" and attrs.get("data-collapsed") != "true":
        return False
    if tag == "details" and "open" in attrs:
        return False
    return True


# Void elements never get a closing tag in this codebase's HTML, so pushing them
# onto the stack leaves an entry that the next real closing tag pops instead.
# That silently marks everything after a details-wrapped image as collapsed.
VOID_TAGS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}


class DensityParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip_stack = []
        self.stack = []  # [{"tag":..., "collapsed": bool}]
        self.reached_boundary = False
        self.pre_interaction_words = 0
        self.total_words = 0
        self.details_count = 0
        self.measure_stack = []  # [{"tag":..., "words":[], "collapsed": bool}]
        self.paragraphs = []  # (words, collapsed, preview)
        self.cells = []
        self.full_text_words = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in SKIP_TAGS:
            self.skip_stack.append(tag)
            return
        if tag in VOID_TAGS:
            if not self.skip_stack and tag in INTERACTIVE_TAGS:
                self.reached_boundary = True
            return
        if self.skip_stack:
            return
        if tag == "details":
            self.details_count += 1
        boundary = is_boundary(tag, attrs)
        inherited = self.stack[-1]["collapsed"] if self.stack else False
        collapsed = inherited or boundary
        self.stack.append({"tag": tag, "collapsed": collapsed})
        if boundary:
            self.reached_boundary = True
        if tag in MEASURED_TAGS:
            self.measure_stack.append({"tag": tag, "words": [], "collapsed": collapsed})

    def handle_startendtag(self, tag, attrs):
        # self-closing tags (br, img, ...) carry no text; nothing to do.
        pass

    def handle_endtag(self, tag):
        if tag in VOID_TAGS:
            return
        if self.skip_stack:
            if self.skip_stack[-1] == tag:
                self.skip_stack.pop()
            return
        if tag in MEASURED_TAGS and self.measure_stack and self.measure_stack[-1]["tag"] == tag:
            item = self.measure_stack.pop()
            words = item["words"]
            kind = MEASURED_TAGS[tag]
            preview = " ".join(words)[:120]
            if kind == "paragraph":
                self.paragraphs.append((len(words), item["collapsed"], preview))
            else:
                self.cells.append((len(words), item["collapsed"], preview))
        if self.stack and self.stack[-1]["tag"] == tag:
            self.stack.pop()

    def handle_data(self, data):
        if self.skip_stack:
            return
        words = data.split()
        if not words:
            return
        self.total_words += len(words)
        self.full_text_words.extend(words)
        if self.measure_stack:
            self.measure_stack[-1]["words"].extend(words)
        if not self.reached_boundary:
            self.pre_interaction_words += len(words)


def syllables(word):
    word = word.lower().strip(".,;:!?\"'()")
    if not word:
        return 0
    groups = re.findall(r"[aeiouy]+", word)
    n = len(groups)
    if word.endswith("e") and n > 1:
        n -= 1
    return max(1, n)


def flesch_kincaid_grade(words):
    sentences = max(1, len(words) // 17)  # rough estimate, no sentence splitting here
    if not words:
        return None
    syl = sum(syllables(w) for w in words)
    return round(0.39 * (len(words) / sentences) + 11.8 * (syl / len(words)) - 15.59, 1)


def analyse(page):
    parser = DensityParser()
    parser.feed(Path(page).read_text(encoding="utf-8"))
    hard_violations = []
    is_essay = page in ESSAY_FILES
    is_reference = page in REFERENCE_FILES
    # Pre-interaction limit: skipped for essays (continuous prose is the
    # point) and reference pages (a reader arrives already knowing what they
    # want; there is no answer block to surface before a lookup table).
    if not is_essay and not is_reference and parser.pre_interaction_words > PRE_INTERACTION_LIMIT:
        hard_violations.append(
            f"{page}: {parser.pre_interaction_words} words before first interaction "
            f"(limit {PRE_INTERACTION_LIMIT})"
        )
    # Paragraph limit: skipped for essays only. A deliberate run-on is voice,
    # not a defect, in continuous prose; it stays enforced everywhere else,
    # reference pages included.
    if not is_essay:
        for words, collapsed, preview in parser.paragraphs:
            if collapsed or words <= PARAGRAPH_LIMIT:
                continue
            hard_violations.append(f"{page}: paragraph at {words} words (limit {PARAGRAPH_LIMIT}): \"{preview}...\"")
    # Cell limit: never relaxed, for any page type. A table cell is a scanning
    # tool regardless of what kind of page it sits on.
    for words, collapsed, preview in parser.cells:
        if collapsed or words <= CELL_LIMIT:
            continue
        hard_violations.append(f"{page}: table cell at {words} words (limit {CELL_LIMIT}): \"{preview}...\"")
    advisory = {
        "total_words": parser.total_words,
        "details_count": parser.details_count,
        "grade": flesch_kincaid_grade(parser.full_text_words),
    }
    return hard_violations, advisory


def main():
    blocking = os.environ.get("DENSITY_GATE_BLOCKING", "false").strip().lower() == "true"

    all_hard = []
    rows = []
    for page in PAGES:
        if not Path(page).exists():
            continue
        hard, advisory = analyse(page)
        all_hard.extend(hard)
        rows.append((page, advisory))

    # Worst first: paragraph and cell violations sorted by word count, page violations first.
    def sort_key(line):
        m = re.search(r"at (\d+) words", line)
        if m:
            return -int(m.group(1))
        m = re.search(r"^\S+: (\d+) words before", line)
        return -int(m.group(1)) if m else 0

    all_hard.sort(key=sort_key)

    print(f"Density budget check: {len(rows)} live page(s) measured.")
    print(f"Page-type scope: {len(ESSAY_FILES & set(PAGES))} essay page(s) exempt from the pre-interaction "
          f"and paragraph limits, {len(REFERENCE_FILES & set(PAGES))} reference page(s) exempt from the "
          f"pre-interaction limit only. See design/density-budget.md.")
    print(f"Hard-limit violations: {len(all_hard)} "
          f"(150-word intro / 60-word paragraph / 30-word cell; collapsed <details> content exempt)")
    for line in all_hard:
        print(f"  {line}")

    print("\nAdvisory (never fails): total words, <details> count, rough reading grade, per page:")
    rows.sort(key=lambda r: -r[1]["total_words"])
    for page, advisory in rows:
        print(f"  {page:32s} words={advisory['total_words']:5d}  details={advisory['details_count']:2d}  "
              f"grade~{advisory['grade']}")

    print(f"\nBlocking mode: {'ON' if blocking else 'OFF (advisory only)'}")
    if blocking and all_hard:
        print(f"\n{len(all_hard)} hard density-budget violation(s). Fix or move content behind a "
              f"<details> element.", file=sys.stderr)
        return 1
    if all_hard:
        print(f"\n{len(all_hard)} hard density-budget violation(s) found, not blocking the build "
              f"(DENSITY_GATE_BLOCKING=false in scripts/check-density.sh).")
    else:
        print("\nDensity budget: no violations.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
PY
