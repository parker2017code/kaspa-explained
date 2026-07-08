#!/usr/bin/env python3
"""Make CLAIMS.yml's freshness triggers executable.

Two checks, both hard failures:

1. Recheck dates: the top-level `recheck_after` and every per-claim
   `recheck_after` must be today or later. When a date passes, this check
   breaks the publish gate on purpose: recheck the claim against primary
   sources, update the entry, and move the date forward. That is the whole
   mechanism; do not bump dates without actually rechecking.

2. Forbidden copy: every `forbidden_copy` phrase in CLAIMS.yml is searched
   against the visible text of every public HTML page (tags and scripts
   stripped, entities unescaped, case-insensitive). A hit means a page is
   carrying wording the claims registry has explicitly banned, which is
   exactly the drift this file exists to stop. Fix the page or, if the
   world changed, fix the registry entry first.

Run from the repo root: python3 scripts/check-status-freshness.py
"""

from __future__ import annotations

import datetime as dt
import html
import re
import sys
from pathlib import Path

CLAIMS_PATH = Path("CLAIMS.yml")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
CLAIM_RE = re.compile(r"^  ([a-z0-9_]+):$")


def fail(messages: list[str]) -> None:
    for message in messages:
        print(f"Status freshness check failed: {message}", file=sys.stderr)
    sys.exit(1)


def parse_claims(text: str):
    """Return (recheck_dates, forbidden_phrases) from the flat YAML layout."""
    recheck_dates: list[tuple[str, str]] = []
    phrases: list[tuple[str, str]] = []
    current = "(top level)"
    in_forbidden = False
    for line in text.splitlines():
        claim_match = CLAIM_RE.match(line)
        if claim_match:
            current = claim_match.group(1)
            in_forbidden = False
            continue
        top_match = re.match(r"^recheck_after:\s*(\S+)$", line)
        if top_match:
            recheck_dates.append(("(top level)", top_match.group(1)))
            continue
        field_match = re.match(r"^    recheck_after:\s*(\S+)$", line)
        if field_match:
            recheck_dates.append((current, field_match.group(1)))
            in_forbidden = False
            continue
        if re.match(r"^    forbidden_copy:", line):
            in_forbidden = True
            continue
        if in_forbidden:
            item_match = re.match(r"^      - (.*)$", line)
            if item_match:
                phrases.append((current, item_match.group(1).strip()))
            else:
                in_forbidden = False
    return recheck_dates, phrases


def visible_text(path: Path) -> str:
    raw = path.read_text(encoding="utf-8")
    raw = re.sub(r"<script.*?</script>", " ", raw, flags=re.S)
    raw = re.sub(r"<style.*?</style>", " ", raw, flags=re.S)
    raw = re.sub(r"<[^>]+>", " ", raw)
    return html.unescape(re.sub(r"\s+", " ", raw)).lower()


def main() -> None:
    problems: list[str] = []
    recheck_dates, phrases = parse_claims(CLAIMS_PATH.read_text(encoding="utf-8"))

    today = dt.date.today()
    for claim, value in recheck_dates:
        if not DATE_RE.match(value):
            problems.append(f"{claim}: recheck_after '{value}' is not YYYY-MM-DD")
            continue
        due = dt.date.fromisoformat(value)
        if due < today:
            problems.append(
                f"{claim}: recheck_after {value} has passed. Recheck the claim "
                "against primary sources, update the entry, then move the date."
            )

    pages = sorted(Path(".").glob("*.html"))
    for page in pages:
        text = visible_text(page)
        for claim, phrase in phrases:
            if phrase.lower() in text:
                problems.append(
                    f"{page.name}: contains forbidden wording from claim "
                    f"'{claim}': \"{phrase}\""
                )

    if problems:
        fail(problems)
    print(
        f"Status freshness checks passed. recheck_dates={len(recheck_dates)} "
        f"forbidden_phrases={len(phrases)} pages={len(pages)}"
    )


if __name__ == "__main__":
    main()
