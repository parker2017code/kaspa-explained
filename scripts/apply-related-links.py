#!/usr/bin/env python3
"""Write the site's one-link "Next" step onto every page (design/THE-BAR.md).

This used to auto-pick three cards (Previous/Next/fallback) from position in
site-manifest.json's pages array. That produced a list, not a path: on 24
August 2026 it briefly offered a 404 page as the recommended next read,
because "next by position" has no idea whether the position it lands on
still exists. It is replaced with NEXT_STEP below: one hand-written
destination and one hand-written reason per page, in that page's own voice,
telling the reader what they get when they arrive. The reading order this
encodes is documented in HANDOFF.md; site-manifest.json's pages array was
reordered to match it, but this script no longer reads that order to build
links, only to know which pages exist and to render each page's title/eyebrow
for the block.
"""
from html.parser import HTMLParser
from pathlib import Path
import html
import json
import re


MANIFEST = json.loads(Path("site-manifest.json").read_text(encoding="utf-8"))
PAGES = MANIFEST["pages"]
START = "<!-- related-links:start -->"
END = "<!-- related-links:end -->"

# One deliberate next step per page: (href, reason). href may carry a
# fragment straight into the destination page's own demo or live table, so
# the reason can promise something concrete and the click delivers it
# immediately. index.html is exempt (see check-site.sh); every other page in
# PAGES needs an entry here or apply-related-links.py raises on it.
NEXT_STEP = {
    "start-here.html": (
        "/crypto-from-scratch",
        "Crypto from scratch: what it's actually for, what it's bad at, and why a coin has a price at all.",
    ),
    "crypto-from-scratch.html": (
        "/what-is-kaspa#collision-sim",
        "Turn up how fast blocks are found, and watch a single chain throw away what a blockDAG keeps.",
    ),
    "what-is-kaspa.html": (
        "/kips#parameterless-demo",
        "Set the network's real delay by hand, and watch a security margin fixed in advance fall behind one that tracks it.",
    ),
    "kips.html": (
        "/kaspa-origin-story#dag-time-demo",
        "Turn a DAA score into a real date, then try to fake a timestamp and watch the network refuse it.",
    ),
    "kaspa-origin-story.html": (
        "/why-kaspa-matters#confirmation-risk-demo",
        "Set how much mining power an attacker holds, then read how long Bitcoin, Litecoin, and Kaspa each need before a payment is safe.",
    ),
    "why-kaspa-matters.html": (
        "/utxo-vs-accounts",
        "Spend from a coin model and a balance model side by side, and watch one queue while the other hands back change.",
    ),
    "utxo-vs-accounts.html": (
        "/status",
        "Every feature and repeated claim, labeled live, testnet, roadmap, research, or wrong, with the source behind each label.",
    ),
    "status.html": (
        "/skeptical-case",
        "The strongest case against Kaspa, argued properly, and what evidence would actually prove it right.",
    ),
    "skeptical-case.html": (
        "/kaspa-mining#attack-cost",
        "Price a 51% attack on Kaspa against five other chains, and watch which half of the bill grows when it runs longer.",
    ),
    "kaspa-mining.html": (
        "/build-on-kaspa#covenant-breaker-demo",
        "Try to break a Toccata covenant vault yourself, and see exactly which attack gets stopped and why.",
    ),
    "build-on-kaspa.html": (
        "/argent-explained#argent-pipeline",
        "Watch a real line of code compile from Argent through Silverscript to the Kaspa Script that runs on-chain.",
    ),
    # Rerouted 2026-09-02: this pointed at /chain-comparer, deleted on 1 September.
    # The page itself had been hand-corrected, so the dead link survived only in
    # this map, where the next regeneration would have put it back on a live page.
    "argent-explained.html": (
        "/kips",
        "Read the KIPs and KCCs the compiler targets, and see which are merged, which are drafts, and which are neither.",
    ),
    # Added 2026-08-29 with the page itself, rerouted 2026-08-30 through the
    # full table rather than straight back to the tool: a reader who just
    # read that every estimated cell is marked on its row is the reader most
    # likely to want to see those marks before going back to using it.
    # Added 2026-08-30 with the page itself. Its own job is done once a
    # reader has seen the row they came for; the tool is what they came from.
    "the-instrument.html": (
        "/sources",
        "Check this argument the way every claim on this site gets checked: against the primary sources behind it.",
    ),
    "moose.html": (
        "/sources",
        "Check these arguments against the primary sources behind them.",
    ),
    "sources.html": (
        "/status",
        "See what's live on the network today, and come back here whenever a claim needs a fresh check.",
    ),
    "search.html": (
        "/start-here",
        "Start at the beginning: no assumed vocabulary, nothing skipped.",
    ),
    "404.html": (
        "/search",
        "Every concept, page, and status label on this site, searchable in one place.",
    ),
}

EXEMPT = {"index.html"}


class PageMetaParser(HTMLParser):
    # Several h1s carry an inline term-def tooltip (e.g. kips.html's "<h1>
    # <span class="term-def">KIP<span role="tooltip">Kaspa Improvement
    # Proposal...</span></span>s and KCCs</h1>"). A parser that just
    # collects data while in_h1 is true pulls the tooltip's full sentence
    # into the title along with it. self.tag_stack tracks whether each open
    # tag started a role="tooltip" element, so data inside one is skipped
    # regardless of nesting depth, the same exclusion build-agent-index.py
    # already applies for script/style/nav/footer/svg.
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_h1 = False
        self.h1 = []
        self.tag_stack = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h1":
            self.in_h1 = True
        self.tag_stack.append(attrs.get("role") == "tooltip")

    def handle_endtag(self, tag):
        if tag == "h1":
            self.in_h1 = False
        if self.tag_stack:
            self.tag_stack.pop()

    def handle_data(self, data):
        if self.in_h1 and not any(self.tag_stack):
            self.h1.append(data)


def compact(value):
    return re.sub(r"\s+", " ", value).strip()


def target_title(href):
    # href may carry a fragment (e.g. "/kips#parameterless-demo"); the title
    # always describes the destination page, not the anchor.
    page = href.split("#", 1)[0].lstrip("/") or "index"
    path = Path(f"{page}.html")
    parser = PageMetaParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return compact("".join(parser.h1)) or page.replace("-", " ").title()


# The destination's name used to sit in an sr-only heading, so a sighted reader
# got the eyebrow "Next", a sentence of reasoning, and no idea which page it led
# to. The name is the one thing a next-link has to show. It is the visible
# heading now, and it carries the link; the reason follows as supporting text.
def block_for(page):
    href, reason = NEXT_STEP[page]
    title = target_title(href)
    return f"""{START}
    <section class="section site-related" aria-labelledby="related-links-title">
      <p class="eyebrow">Next</p>
      <h2 id="related-links-title" class="site-next-title"><a href="{href}">{html.escape(title)}</a></h2>
      <p class="site-next-reason">{html.escape(reason)}</p>
    </section>
{END}"""


def replace_block(text, page):
    text = re.sub(rf"\n?\s*{re.escape(START)}.*?{re.escape(END)}\n?", "\n", text, flags=re.S)
    marker = "\n  </main>"
    if marker not in text:
        raise ValueError(f"{page} missing closing main marker")
    return text.replace(marker, "\n" + block_for(page) + marker, 1)


def main():
    missing = [p for p in PAGES if p not in EXEMPT and p not in NEXT_STEP]
    if missing:
        raise SystemExit(f"NEXT_STEP has no entry for: {', '.join(missing)}")

    updated_count = 0
    for page in PAGES:
        if page in EXEMPT:
            continue
        path = Path(page)
        updated = replace_block(path.read_text(encoding="utf-8"), page)
        path.write_text(updated, encoding="utf-8")
        updated_count += 1
    print(f"Updated next-step links on {updated_count} pages.")


if __name__ == "__main__":
    main()
