#!/usr/bin/env python3
"""Guard the card-grid span system in styles.css.

On 2026-07-29 every card grid on the site rendered as one row of very narrow,
very tall columns at any width at or above 900px. Seven cards on the risks page
came out 4,743px tall. The publish gate passed the whole time, because nothing
in it looks at rendered geometry.

The cause was a single legacy rule:

    @media (min-width: 900px) {
      :where(... .summary-grid ...) > :is(a, article, .route-card-link) {
        grid-column: auto !important;
      }
    }

The generated "no card alone on a row" block sets a 12 track container and a
matching span on each child. `!important` outranks any selector, so the tracks
survived and the spans were stripped, leaving N cards in 12 single tracks.

Two invariants follow, and this script enforces both:

1. No `!important` on any grid placement property, anywhere. It cannot be
   outranked by the generated rules, so it silently wins.
2. Every generated container rule that sets 12 tracks for a given child count
   has a matching `> *` span rule for that same count. A container without its
   spans is exactly the broken state above.
"""
import re
import sys

CSS = "styles.css"
# Placement only. `grid-template-columns: 1fr !important` inside a narrow
# max-width query is a legitimate "force one column on phones" reset and is not
# what broke the site; `grid-column` is, because that is what the generated
# rules set on each card.
GRID_PROPS = ("grid-column", "grid-row")


def main() -> int:
    raw = open(CSS, encoding="utf-8").read()
    css = re.sub(r"/\*.*?\*/", "", raw, flags=re.S)
    failures = []

    # 1. no !important on grid placement
    for m in re.finditer(r"([a-z-]+)\s*:\s*[^;{}]*!important", css):
        if m.group(1) in GRID_PROPS:
            line = css[: m.start()].count("\n") + 1
            failures.append(
                f"{CSS}:{line} !important on {m.group(1)}. It outranks the generated "
                f"span rules and strips them: {m.group(0).strip()[:70]}"
            )

    # 2. every generated 12-track container has matching spans
    containers = set()
    spans = set()
    for m in re.finditer(
        r"\.grid-cards:has\(> :nth-child\((\d+)\):last-child\)(\s*>\s*\*)?\s*\{([^}]*)\}", css
    ):
        count, is_child, body = int(m.group(1)), bool(m.group(2)), m.group(3)
        if not is_child and "grid-template-columns" in body:
            containers.add(count)
        if is_child and "grid-column" in body:
            spans.add(count)

    for count in sorted(containers - spans):
        failures.append(
            f"{CSS}: .grid-cards:has(> :nth-child({count}):last-child) sets a track count "
            f"with no matching '> *' span rule. {count} cards would land in one row."
        )

    if not containers:
        failures.append(
            f"{CSS}: found no generated .grid-cards container rules at all. The "
            f"no-card-alone block is missing or was renamed."
        )

    if failures:
        for f in failures:
            print(f, file=sys.stderr)
        return 1

    print(f"Grid span checks passed. counts={len(containers)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
