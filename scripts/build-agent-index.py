#!/usr/bin/env python3
from html.parser import HTMLParser
import argparse
import json
from pathlib import Path
import re
import sys


MANIFEST = json.loads(Path("site-manifest.json").read_text(encoding="utf-8"))
DOMAIN = MANIFEST["domain"]
PAGES = MANIFEST["pages"]
REFERENCE_FILES = [
    "llms.txt",
    "CLAIMS.yml",
    "CONTENT_BRIEF.md",
    "README.md",
    "COPY_STYLE.md",
    "site-manifest.json",
    "sitemap.xml",
]
OUTPUT = Path("agent-index.json")


class PageTextParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip_depth = 0
        self.in_title = False
        self.in_main = False
        self.in_h1 = False
        self.title = []
        self.main_text = []
        self.h1 = []
        self.description = ""
        self.date_modified = ""
        self.canonical = ""

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in {"script", "style", "nav", "footer", "svg"}:
            self.skip_depth += 1
        if tag == "title":
            self.in_title = True
        if tag == "main":
            self.in_main = True
        if tag == "h1":
            self.in_h1 = True
        if tag == "meta" and attrs.get("name") == "description":
            self.description = attrs.get("content", "").strip()
        if tag == "meta" and attrs.get("name") == "dateModified":
            self.date_modified = attrs.get("content", "").strip()
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs.get("href", "").strip()

    def handle_endtag(self, tag):
        if tag in {"script", "style", "nav", "footer", "svg"} and self.skip_depth:
            self.skip_depth -= 1
        if tag == "title":
            self.in_title = False
        if tag == "main":
            self.in_main = False
        if tag == "h1":
            self.in_h1 = False

    def handle_data(self, data):
        if self.skip_depth:
            return
        if self.in_title:
            self.title.append(data)
        if self.in_h1:
            self.h1.append(data)
        if self.in_main:
            self.main_text.append(data)


def compact_text(value):
    value = re.sub(r"\s+", " ", value).strip()
    return value


def href_for(page):
    if page == "index.html":
        return "/"
    return f"/{page[:-5]}" if page.endswith(".html") else f"/{page}"


def url_for(page):
    return f"{DOMAIN}{href_for(page)}" if href_for(page) != "/" else f"{DOMAIN}/"


def parse_page(path):
    parser = PageTextParser()
    parser.feed(Path(path).read_text(encoding="utf-8"))
    title = compact_text(" ".join(parser.title))
    h1 = compact_text(" ".join(parser.h1))
    text = compact_text(" ".join(parser.main_text))
    return {
        "path": path,
        "href": href_for(path),
        "url": parser.canonical or url_for(path),
        "title": title,
        "h1": h1,
        "description": parser.description,
        "dateModified": parser.date_modified,
        "text": text,
    }


def read_reference_file(path):
    return {
        "path": path,
        "url": f"{DOMAIN}/{path}",
        "text": Path(path).read_text(encoding="utf-8"),
    }


def build_index():
    pages = [parse_page(page) for page in PAGES]
    reference_files = [read_reference_file(path) for path in REFERENCE_FILES]
    version_dates = [page["dateModified"] for page in pages if page["dateModified"]]
    version_dates.extend(MANIFEST.get("sitemapExtraLastmod", {}).values())
    return {
        "name": "Kaspa Explained Agent Index",
        "version": max(version_dates),
        "domain": DOMAIN,
        "scope": "Read-only Kaspa Explained L1/status retrieval. Do not use as a generic crypto search index.",
        "recommendedEntryPoints": {
            "humans": f"{DOMAIN}/ai-guidance",
            "agents": f"{DOMAIN}/agent-index.json",
            "claims": f"{DOMAIN}/CLAIMS.yml",
            "llmContext": f"{DOMAIN}/llms.txt",
            "sources": f"{DOMAIN}/sources",
        },
        "agentUse": [
            "Search page text and reference files for Kaspa-specific questions.",
            "Keep live mainnet, testnet, targeted, roadmap, research, wrong, unsupported, and out-of-scope claims separate.",
            "Cite the canonical page URL near each claim.",
            "Use primary sources linked from the page before treating status-sensitive claims as current.",
            "Do not provide price predictions or investment advice.",
        ],
        "mcpNote": "This static index is the zero-cost agent gateway. A hosted MCP endpoint can wrap this data later, but GitHub Pages cannot run the MCP JSON-RPC server protocol by itself.",
        "pages": pages,
        "referenceFiles": reference_files,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if agent-index.json is not generated output.")
    args = parser.parse_args()
    generated = json.dumps(build_index(), ensure_ascii=False, indent=2) + "\n"

    if args.check:
        if not OUTPUT.exists():
            print("agent-index.json is missing.", file=sys.stderr)
            return 1
        current = OUTPUT.read_text(encoding="utf-8")
        if current != generated:
            print("agent-index.json is not generated from site-manifest.json and public files.", file=sys.stderr)
            return 1
        print("Agent index generation check passed.")
        return 0

    OUTPUT.write_text(generated, encoding="utf-8")
    print("Wrote agent-index.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
