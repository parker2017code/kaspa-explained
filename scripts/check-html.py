#!/usr/bin/env python3
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

MANIFEST = json.loads(Path("site-manifest.json").read_text(encoding="utf-8"))
DOMAIN = MANIFEST["domain"]
PAGES = MANIFEST["pages"]
SITEMAP_EXTRA_FILES = MANIFEST.get("sitemapExtraFiles", [])


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_head = False
        self.ids = []
        self.titles = 0
        self.h1s = 0
        self.main_top = 0
        self.canonicals = []
        self.date_modified = []
        self.meta_descriptions = 0
        self.open_graph_images = 0
        self.twitter_cards = 0
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "head":
            self.in_head = True
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "title" and self.in_head:
            self.titles += 1
        if tag == "h1":
            self.h1s += 1
        if tag == "main" and attrs.get("id") == "top":
            self.main_top += 1
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href", ""))
        if tag == "meta" and attrs.get("name") == "description" and attrs.get("content", "").strip():
            self.meta_descriptions += 1
        if tag == "meta" and attrs.get("name") == "dateModified":
            self.date_modified.append(attrs.get("content", ""))
        if tag == "meta" and attrs.get("property") == "og:image":
            self.open_graph_images += 1
        if tag == "meta" and attrs.get("name") == "twitter:card":
            self.twitter_cards += 1
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])

    def handle_endtag(self, tag):
        if tag == "head":
            self.in_head = False


def expected_url(page):
    if page == "index.html":
        return f"{DOMAIN}/"
    if page.endswith("/index.html"):
        return f"{DOMAIN}/{page[:-len('index.html')]}"
    if page.endswith(".html"):
        page = page[:-5]
    return f"{DOMAIN}/{page}"


def read_sitemap_dates():
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    tree = ET.parse("sitemap.xml")
    dates = {}
    for url in tree.findall("sm:url", ns):
        loc = url.findtext("sm:loc", default="", namespaces=ns)
        lastmod = url.findtext("sm:lastmod", default="", namespaces=ns)
        if loc:
            dates[loc] = lastmod
    return dates


def fail(errors, message):
    errors.append(message)


def main():
    errors = []
    sitemap_dates = read_sitemap_dates()
    sitemap_urls = set(sitemap_dates)
    iso_date = re.compile(r"^\d{4}-\d{2}-\d{2}$")
    manifest_urls = {expected_url(page) for page in PAGES}
    allowed_sitemap_urls = manifest_urls | {
        expected_url(path) if path.endswith(".html") else f"{DOMAIN}/{path}"
        for path in SITEMAP_EXTRA_FILES
    }

    if not manifest_urls.issubset(sitemap_urls):
        missing = sorted(manifest_urls - sitemap_urls)
        fail(errors, f"sitemap missing manifest pages: {', '.join(missing)}")
    if sitemap_urls - allowed_sitemap_urls:
        extra = sorted(sitemap_urls - allowed_sitemap_urls)
        fail(errors, f"sitemap has entries not listed in site-manifest.json: {', '.join(extra)}")

    for page in PAGES:
        parser = PageParser()
        parser.feed(Path(page).read_text(encoding="utf-8"))
        url = expected_url(page)

        duplicated_ids = sorted({value for value in parser.ids if parser.ids.count(value) > 1})
        if duplicated_ids:
            fail(errors, f"{page} has duplicate ids: {', '.join(duplicated_ids)}")
        if parser.titles != 1:
            fail(errors, f"{page} must have exactly one title")
        if parser.h1s != 1:
            fail(errors, f"{page} must have exactly one h1")
        if parser.main_top != 1:
            fail(errors, f"{page} must have exactly one main#top")
        if parser.canonicals != [url]:
            fail(errors, f"{page} canonical mismatch: {parser.canonicals} != {url}")
        if parser.meta_descriptions != 1:
            fail(errors, f"{page} must have exactly one non-empty meta description")
        if len(parser.date_modified) != 1 or not iso_date.match(parser.date_modified[0]):
            fail(errors, f"{page} must have exactly one ISO dateModified")
        if parser.open_graph_images < 1:
            fail(errors, f"{page} missing OpenGraph image")
        if parser.twitter_cards < 1:
            fail(errors, f"{page} missing Twitter card")

        sitemap_lastmod = sitemap_dates.get(url)
        if sitemap_lastmod != parser.date_modified[0]:
            fail(errors, f"{page} sitemap lastmod {sitemap_lastmod} does not match dateModified {parser.date_modified[0]}")
        if page == "search.html":
            search_links = {
                f"{DOMAIN}{href}" if href.startswith("/") else href
                for href in parser.links
                if href == "/" or (href.startswith("/") and "." not in href.rsplit("/", 1)[-1])
            }
            if not manifest_urls.issubset(search_links):
                missing = sorted(manifest_urls - search_links)
                fail(errors, f"search.html missing manifest page links: {', '.join(missing)}")

    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1

    print(f"HTML checks passed. pages={len(PAGES)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
