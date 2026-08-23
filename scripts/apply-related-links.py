#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
import html
import json
import re


MANIFEST = json.loads(Path("site-manifest.json").read_text(encoding="utf-8"))
PAGES = MANIFEST["pages"]
START = "<!-- related-links:start -->"
END = "<!-- related-links:end -->"


class PageMetaParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_h1 = False
        self.h1 = []
        self.description = ""

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h1":
            self.in_h1 = True
        if tag == "meta" and attrs.get("name") == "description":
            self.description = attrs.get("content", "").strip()

    def handle_endtag(self, tag):
        if tag == "h1":
            self.in_h1 = False

    def handle_data(self, data):
        if self.in_h1:
            self.h1.append(data)


def compact(value):
    return re.sub(r"\s+", " ", value).strip()


def href_for(page):
    if page == "index.html":
        return "/"
    return "/" + page[:-5]


def page_meta(page):
    parser = PageMetaParser()
    parser.feed(Path(page).read_text(encoding="utf-8"))
    title = compact(" ".join(parser.h1)) or page[:-5].replace("-", " ").title()
    description = compact(parser.description)
    if len(description) > 142:
        description = description[:139].rsplit(" ", 1)[0].rstrip(",;:.") + "..."
    return {"title": title, "description": description}


META = {page: page_meta(page) for page in PAGES}


def card(label, page):
    meta = META[page]
    return (
        f'        <a href="{href_for(page)}">'
        f"<span>{html.escape(label)}</span>"
        f"<strong>{html.escape(meta['title'])}</strong>"
        f"<p>{html.escape(meta['description'])}</p>"
        "</a>"
    )


def related_for(page):
    index = PAGES.index(page)
    picks = []
    if index > 0:
        picks.append(("Previous", PAGES[index - 1]))
    if index + 1 < len(PAGES):
        picks.append(("Next", PAGES[index + 1]))

    for label, fallback in (
        ("Status", "status.html"),
        ("Sources", "sources.html"),
        ("Claims", "skeptical-case.html"),
    ):
        if fallback != page and fallback not in [candidate for _, candidate in picks]:
            picks.append((label, fallback))
        if len(picks) == 3:
            break

    return picks[:3]


def block_for(page):
    cards = "\n".join(card(label, target) for label, target in related_for(page))
    return f"""{START}
    <section class="section site-related" aria-labelledby="related-links-title">
      <p class="eyebrow">Keep reading</p>
      <h2 id="related-links-title">Next pages</h2>
      <div class="site-related-grid">
{cards}
      </div>
    </section>
{END}"""


def replace_block(text, page):
    text = re.sub(rf"\n?\s*{re.escape(START)}.*?{re.escape(END)}\n?", "\n", text, flags=re.S)
    marker = "\n  </main>"
    if marker not in text:
        raise ValueError(f"{page} missing closing main marker")
    return text.replace(marker, "\n" + block_for(page) + marker, 1)


def main():
    for page in PAGES:
        path = Path(page)
        updated = replace_block(path.read_text(encoding="utf-8"), page)
        path.write_text(updated, encoding="utf-8")
    print(f"Updated related links on {len(PAGES)} pages.")


if __name__ == "__main__":
    main()
