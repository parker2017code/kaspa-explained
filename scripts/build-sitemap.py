#!/usr/bin/env python3
from html.parser import HTMLParser
import argparse
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

MANIFEST = json.loads(Path("site-manifest.json").read_text(encoding="utf-8"))
DOMAIN = MANIFEST["domain"]
PAGES = MANIFEST["pages"]
EXTRA_FILES = MANIFEST.get("sitemapExtraFiles", [])
EXTRA_LASTMOD = MANIFEST.get("sitemapExtraLastmod", {})
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"


class DateParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.date_modified = ""

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta" and attrs.get("name") == "dateModified":
            self.date_modified = attrs.get("content", "")


def url_for(path):
    if path == "index.html":
        return f"{DOMAIN}/"
    if path.endswith("/index.html"):
        return f"{DOMAIN}/{path[:-len('index.html')]}"
    if path.endswith(".html"):
        path = path[:-5]
    return f"{DOMAIN}/{path}"


def read_existing_metadata():
    if not Path("sitemap.xml").exists():
      return {}
    ns = {"sm": SITEMAP_NS}
    tree = ET.parse("sitemap.xml")
    metadata = {}
    for node in tree.findall("sm:url", ns):
        loc = node.findtext("sm:loc", default="", namespaces=ns)
        if not loc:
            continue
        metadata[loc] = {
            "lastmod": node.findtext("sm:lastmod", default="", namespaces=ns),
            "changefreq": node.findtext("sm:changefreq", default="weekly", namespaces=ns),
            "priority": node.findtext("sm:priority", default="0.5", namespaces=ns)
        }
    return metadata


def page_date_modified(path):
    parser = DateParser()
    parser.feed(Path(path).read_text(encoding="utf-8"))
    if not parser.date_modified:
        raise ValueError(f"{path} missing dateModified")
    return parser.date_modified


def build_sitemap():
    existing = read_existing_metadata()
    entries = []

    for page in PAGES:
        loc = url_for(page)
        old = existing.get(loc, {})
        entries.append({
            "loc": loc,
            "lastmod": page_date_modified(page),
            "changefreq": old.get("changefreq", "weekly"),
            "priority": old.get("priority", "0.8")
        })

    for path in EXTRA_FILES:
        loc = url_for(path) if path.endswith(".html") else f"{DOMAIN}/{path}"
        old = existing.get(loc, {})
        entries.append({
            "loc": loc,
            "lastmod": EXTRA_LASTMOD.get(path, old.get("lastmod", page_date_modified(path) if path.endswith(".html") else "2026-05-11")),
            "changefreq": old.get("changefreq", "weekly"),
            "priority": old.get("priority", "0.5")
        })

    lines = ['<?xml version="1.0" encoding="UTF-8"?>', f'<urlset xmlns="{SITEMAP_NS}">']
    for entry in entries:
        lines.extend([
            "  <url>",
            f"    <loc>{entry['loc']}</loc>",
            f"    <lastmod>{entry['lastmod']}</lastmod>",
            f"    <changefreq>{entry['changefreq']}</changefreq>",
            f"    <priority>{entry['priority']}</priority>",
            "  </url>"
        ])
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if sitemap.xml is not generated output.")
    args = parser.parse_args()
    generated = build_sitemap()
    path = Path("sitemap.xml")

    if args.check:
        current = path.read_text(encoding="utf-8")
        if current != generated:
            print("sitemap.xml is not generated from site-manifest.json and page metadata.", file=sys.stderr)
            return 1
        print("Sitemap generation check passed.")
        return 0

    path.write_text(generated, encoding="utf-8")
    print("Wrote sitemap.xml")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
