#!/usr/bin/env python3
"""Generate the social preview card.

The card shows the thing the site teaches rather than describing it. A real
GHOSTDAG shape, one block marked red, and the fact that surprises people: a red
block is not discarded. It keeps its place, its parents and its transactions,
which is the whole difference from a single chain where the loser's work is
thrown away. That claim is stated on what-is-kaspa.html and is the reason this
card says what it says.

The wording is exact on purpose. In GHOSTDAG "red" means a block fell outside
the k cap, not that it lost a race, so the card says "marked red" rather than
"lost". what-is-kaspa.html states the rest verbatim: red blocks "keep their
place, their parents, and their transactions."

Colors come from the dark palette in the APPLE DESIGN LAYER of styles.css,
which is the site's default theme. They are duplicated here because an SVG
cannot read CSS custom properties; check-og-card.py fails if they drift.

Sizes are set for how a feed actually renders this. X shows the card about
500px wide, so a 1200px-wide card is displayed at roughly 42%. Nothing below
34px survives that, which is why there is no small print.

Run: python3 scripts/build-og-card.py
"""
import os

BG      = "#100e0c"   # --bg
TEXT    = "#f8f5ef"   # --text
MUTED   = "#b6b0a7"   # --muted
FAINT   = "#9d988c"   # --faint
GREEN   = "#66d1c1"   # --green, the blue set
RED     = "#ff6961"   # --red on what-is-kaspa.html, dark theme
LINE    = "#4a453d"   # --line

# One honest small DAG. gen -> list of (id, is_spine, is_red).
GENS = [
    [("a", True,  False)],
    [("b", True,  False), ("c", False, False)],
    [("d", True,  False), ("e", False, False), ("f", False, False)],
    [("g", True,  False), ("h", False, True)],
    [("i", True,  False)],
]
# child -> parents it references
EDGES = {
    "b": ["a"], "c": ["a"],
    "d": ["b"], "e": ["b", "c"], "f": ["c"],
    "g": ["d", "e"], "h": ["f"],
    "i": ["g", "h"],
}

W, H = 1200, 630
BW, BH, R = 62, 44, 10          # block width, height, corner radius
X0, XSTEP = 96, 208             # first column, column pitch
YMID, YSTEP = 452, 86           # vertical center of the DAG, row pitch


def positions():
    pos = {}
    for gi, gen in enumerate(GENS):
        x = X0 + gi * XSTEP
        n = len(gen)
        for bi, (bid, spine, red) in enumerate(gen):
            y = YMID + (bi - (n - 1) / 2) * YSTEP
            pos[bid] = (x, y, spine, red)
    return pos


def build():
    pos = positions()
    out = []
    out.append(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
        f'viewBox="0 0 {W} {H}" role="img" '
        f'aria-label="A blockDAG with one block marked red. The red block keeps '
        f'its place, its parents and its transactions.">'
    )
    out.append(f'<rect width="{W}" height="{H}" fill="{BG}"/>')

    # Edges first so blocks sit on top of them. The red block's own edges are
    # drawn in red and thicker: the claim is that it keeps its parents, and the
    # parents ARE the edges, so they have to be the most legible thing on the
    # card rather than the faintest.
    def edge_path(child, parent):
        cx, cy, _, _ = pos[child]
        px, py, _, _ = pos[parent]
        x1, y1 = px + BW / 2, py
        x2, y2 = cx - BW / 2, cy
        mid = (x1 + x2) / 2
        return (f'M{x1:.0f} {y1:.0f} C{mid:.0f} {y1:.0f} '
                f'{mid:.0f} {y2:.0f} {x2:.0f} {y2:.0f}')

    red_ids = {b for g in GENS for b, _, r in g if r}
    out.append(f'<g stroke="{LINE}" stroke-width="3" fill="none">')
    for child, parents in EDGES.items():
        for p in parents:
            if child in red_ids or p in red_ids:
                continue
            out.append(f'<path d="{edge_path(child, p)}"/>')
    out.append('</g>')
    out.append(f'<g stroke="{RED}" stroke-width="5" fill="none">')
    for child, parents in EDGES.items():
        for p in parents:
            if child in red_ids or p in red_ids:
                out.append(f'<path d="{edge_path(child, p)}"/>')
    out.append('</g>')

    # Blocks. One fill for the blue set, one for the red block. No opacity
    # variation: it encoded nothing and read as a third color.
    for bid, (x, y, spine, red) in pos.items():
        out.append(
            f'<rect x="{x - BW/2:.0f}" y="{y - BH/2:.0f}" width="{BW}" '
            f'height="{BH}" rx="{R}" fill="{RED if red else GREEN}"/>'
        )

    # Text block.
    f = 'font-family="Aptos, Segoe UI, Helvetica, Arial, sans-serif"'
    out.append(f'<g {f}>')
    # The headline has to stand alone. In a feed the eye takes it before the
    # diagram, so a pronoun with no antecedent ("It still counts") reads as
    # nothing. Two short sentences carry the whole idea unaided.
    out.append(
        f'<text x="96" y="132" fill="{TEXT}" font-size="70" '
        f'font-weight="800" letter-spacing="-.02em">Marked red.</text>'
    )
    out.append(
        f'<text x="96" y="210" fill="{RED}" font-size="70" '
        f'font-weight="800" letter-spacing="-.02em">Still counted.</text>'
    )
    out.append(
        f'<text x="96" y="266" fill="{MUTED}" font-size="34" '
        f'font-weight="500">A single chain would discard this block. Kaspa'
        f'</text>'
    )
    out.append(
        f'<text x="96" y="308" fill="{MUTED}" font-size="34" '
        f'font-weight="500">keeps it, its parents, and its transactions.</text>'
    )
    out.append(
        f'<text x="{W - 96}" y="{H - 46}" fill="{FAINT}" font-size="28" '
        f'text-anchor="end">kaspaexplained.com</text>'
    )
    out.append('</g>')
    out.append('</svg>')
    return "\n".join(out) + "\n"


if __name__ == "__main__":
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dest = os.path.join(root, "og-kaspa-explained.svg")
    with open(dest, "w", encoding="utf-8") as fh:
        fh.write(build())
    print("wrote", dest)
