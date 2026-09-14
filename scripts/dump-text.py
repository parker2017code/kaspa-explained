#!/usr/bin/env python3
"""Dump every page's visible text to one reviewable file.

Owner asked for the whole site as plain text so it can be read end to end
without a browser. Strips nav, footer, scripts and the generated related-links
block, so what lands in the file is what a reader actually reads.

  python3 scripts/dump-text.py > site-text.txt
"""
import re, sys, pathlib, html, json

ROOT = pathlib.Path(__file__).resolve().parent.parent
DROP = re.compile(r"<(script|style|svg|nav|header|footer)\b.*?</\1>", re.S | re.I)
GEN = re.compile(r"<!--\s*related-links:start\s*-->.*?<!--\s*related-links:end\s*-->", re.S | re.I)
BLOCK = re.compile(r"<(h1|h2|h3|p|li|td|th|figcaption|summary)\b[^>]*>(.*?)</\1>", re.S | re.I)
TAG = re.compile(r"<[^>]+>")

def order():
    m = ROOT / "site-manifest.json"
    if m.exists():
        return json.loads(m.read_text())["pages"]
    return sorted(p.name for p in ROOT.glob("*.html"))

total = 0
for name in order():
    f = ROOT / name
    if not f.exists():
        continue
    src = GEN.sub(" ", DROP.sub(" ", f.read_text(encoding="utf-8")))
    m = re.search(r"<main\b[^>]*>(.*?)</main>", src, re.S | re.I)
    if not m:
        continue
    title = re.search(r"<title>(.*?)</title>", f.read_text(encoding="utf-8"), re.S)
    lines, words = [], 0
    for b in BLOCK.finditer(m.group(1)):
        t = re.sub(r"\s+", " ", html.unescape(TAG.sub(" ", b.group(2)))).strip()
        if not t:
            continue
        words += len(t.split())
        tag = b.group(1).lower()
        lines.append(("\n## " if tag in ("h1", "h2") else "### " if tag == "h3" else "") + t)
    total += words
    print("=" * 78)
    print(f"{name}   [{words} words]")
    if title:
        print(f"title: {re.sub(r'<[^>]+>', '', title.group(1)).strip()}")
    print("=" * 78)
    print("\n".join(lines))
    print()
print("=" * 78)
print(f"TOTAL: {total} words across the site")
