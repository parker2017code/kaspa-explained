#!/usr/bin/env python3
"""Pair every cited external URL with the sentence that cites it.

check-links.sh answers "does this URL resolve". This answers the question that
actually matters: "what did we claim, next to which link". A source can return
200 and no longer support the sentence beside it, which is how the Argent claim
shipped wrong on 2026-07-30 with every check green.

The script cannot read meaning. It builds the claim/source pairs so a person or
an agent can read them, and it ranks them so the riskiest get read first.

Usage:
  python3 scripts/check-source-freshness.py              # risky pairs only
  python3 scripts/check-source-freshness.py --all        # every pair
  python3 scripts/check-source-freshness.py --host x.com # one host
"""
import glob
import html
import re
import sys
from urllib.parse import urlparse

# A sentence carrying one of these next to a link is a claim that can go stale
# silently. Version numbers and status words rot fastest.
RISK = {
    "version": r"\bv?\d+\.\d+\.\d+\b|\breleases?\b|\btag(ged)?\b",
    "status": r"\b(live|active|activated|shipped|merged|open|draft|proposed|"
              r"experimental|prototype|early|beta|stable|audited|unaudited|"
              r"release-ready|production)\b",
    "capability": r"\b(supports?|can(not)?|does(n't| not)?|able to|lacks?|"
                  r"missing|absent|no longer|still)\b",
    "number": r"\b\d[\d,]{2,}\b|\b\d+(\.\d+)?\s?(BPS|KAS|MB|seconds?|blocks?)\b",
}

# Pages that describe the site's own rules rather than making external claims.
SKIP = {"search.html", "404.html"}


def sentences_with_links(path):
    raw = open(path, encoding="utf-8", errors="ignore").read()
    raw = re.sub(r"<(script|style)\b.*?</\1>", " ", raw, flags=re.S | re.I)
    raw = re.sub(r"<head\b.*?</head>", " ", raw, flags=re.S | re.I)
    out = []
    # each anchor, plus the text of the block it sits in
    for m in re.finditer(r'<a\b[^>]*href="(https?://[^"]+)"[^>]*>(.*?)</a>', raw, re.S | re.I):
        url, label = m.group(1), re.sub(r"<[^>]+>", "", m.group(2)).strip()
        start = raw.rfind("<", 0, max(0, m.start() - 400))
        block = raw[max(0, start):m.end() + 400]
        text = html.unescape(re.sub(r"<[^>]+>", " ", block))
        text = re.sub(r"\s+", " ", text).strip()
        out.append((url, label, text))
    return out


def risk_tags(text):
    return [name for name, pat in RISK.items() if re.search(pat, text, re.I)]


def main():
    show_all = "--all" in sys.argv
    host_filter = None
    if "--host" in sys.argv:
        host_filter = sys.argv[sys.argv.index("--host") + 1]

    pairs, risky = 0, 0
    for path in sorted(glob.glob("*.html")):
        if path in SKIP:
            continue
        rows = []
        for url, label, text in sentences_with_links(path):
            host = urlparse(url).netloc
            if host_filter and host_filter not in host:
                continue
            pairs += 1
            tags = risk_tags(text)
            if tags:
                risky += 1
            if tags or show_all:
                rows.append((url, label, tags, text[:300]))
        if rows:
            print(f"\n=== {path} ===")
            for url, label, tags, text in rows:
                flag = ",".join(tags) if tags else "-"
                print(f"  [{flag}] {url}")
                print(f"      cited as: {label[:70]}")
                print(f"      claim:    ...{text[:220]}...")

    print(f"\n{pairs} claim/source pairs, {risky} carrying a version, status, "
          f"capability or number claim.")
    print("Open the risky ones and confirm the source still says it. "
          "See SOURCE_AUDIT.md.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
