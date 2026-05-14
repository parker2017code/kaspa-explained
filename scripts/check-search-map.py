#!/usr/bin/env python3
from html.parser import HTMLParser
import json
from pathlib import Path
import sys


MANIFEST = json.loads(Path("site-manifest.json").read_text(encoding="utf-8"))
PAGES = MANIFEST["pages"]


class SearchParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_results = False
        self.article_depth = 0
        self.current = None
        self.cards = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "div" and attrs.get("id") == "search-results":
            self.in_results = True
        if self.in_results and tag == "article":
            self.article_depth += 1
            self.current = {
                "data_search": attrs.get("data-search", "").strip(),
                "hrefs": [],
                "has_span": False,
                "has_h3": False,
                "has_paragraph": False,
            }
        elif self.in_results and self.current is not None:
            if tag == "a" and attrs.get("href"):
                self.current["hrefs"].append(attrs["href"])
            if tag == "span":
                self.current["has_span"] = True
            if tag == "h3":
                self.current["has_h3"] = True
            if tag == "p":
                self.current["has_paragraph"] = True

    def handle_endtag(self, tag):
        if self.in_results and tag == "article" and self.current is not None:
            self.cards.append(self.current)
            self.current = None
            self.article_depth -= 1
        elif tag == "div" and self.in_results and self.article_depth == 0:
            self.in_results = False


def expected_href(page):
    if page == "index.html":
        return "/"
    if page.endswith(".html"):
        page = page[:-5]
    return f"/{page}"


def main():
    parser = SearchParser()
    parser.feed(Path("search.html").read_text(encoding="utf-8"))

    errors = []
    expected = [expected_href(page) for page in PAGES]
    observed = []

    for index, card in enumerate(parser.cards, start=1):
        hrefs = [href for href in card["hrefs"] if href == "/" or (href.startswith("/") and "." not in href.rsplit("/", 1)[-1])]
        if len(hrefs) != 1:
            errors.append(f"search card {index} must have exactly one page link; found {hrefs}")
            continue
        observed.append(hrefs[0])
        if not card["data_search"]:
            errors.append(f"search card {hrefs[0]} missing data-search terms")
        if not card["has_span"]:
            errors.append(f"search card {hrefs[0]} missing category span")
        if not card["has_h3"]:
            errors.append(f"search card {hrefs[0]} missing h3")
        if not card["has_paragraph"]:
            errors.append(f"search card {hrefs[0]} missing description paragraph")

    if observed != expected:
        missing = [href for href in expected if href not in observed]
        extra = [href for href in observed if href not in expected]
        duplicate = sorted({href for href in observed if observed.count(href) > 1})
        errors.append(
            "search results must match site-manifest.json page order"
            f"; missing={missing}; extra={extra}; duplicate={duplicate}"
        )

    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1

    print(f"Search map checks passed. cards={len(parser.cards)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
