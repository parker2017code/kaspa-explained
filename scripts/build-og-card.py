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

There is no text on the card, and that is the finding rather than a shortcut.
Four competent references were fetched and looked at on 29 Aug 2026:
ciechanow.ski and distill.pub carry no text at all, just the artifact full
bleed; ourworldindata.org carries two lines, topic and publisher; linear.app
carries a logo. None of them carries a headline plus a subtitle plus a URL.

The reason is mechanical. An unfurl already renders og:title and og:description
as real text beside the image, so a sentence baked into the image is shown
twice, and the baked copy is the one that cannot be selected, translated, or
read aloud by a screen reader. index.html's og:description already says
"Watch a blockDAG keep the blocks a single chain throws away", which is exactly
what this diagram shows. The words are the description's job. The picture is
this file's job.

Keeping the card wordless also removes the legibility floor: at the 320px an
unfurl can shrink to, there is no small print left to lose.

Writes the SVG and rasterizes it to PNG at exactly 1200x630 with headless
Chrome, which is the same renderer a browser uses, so what ships is what was
reviewed. There is no SVG rasterizer library on this machine and qlmanage pads
to a square, so Chrome is the path.

Run: python3 scripts/build-og-card.py
"""
import os
import shutil
import subprocess

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PNG_NAME = "og-kaspa-explained-20260829.png"


def rasterize(root, svg_path):
    if not os.path.exists(CHROME):
        print("skip PNG: Chrome not found at", CHROME)
        return None
    out = os.path.join(root, PNG_NAME)
    tmp = os.path.join(root, ".og-shot.png")
    subprocess.run([
        CHROME, "--headless", "--disable-gpu", "--hide-scrollbars",
        f"--screenshot={tmp}", f"--window-size={W},{H}",
        "file://" + svg_path,
    ], check=True, capture_output=True)
    shutil.move(tmp, out)
    print("wrote", out)
    return out

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
BW, BH, R = 104, 74, 18         # block width, height, corner radius
X0, XSTEP = 132, 234            # first column, column pitch
YMID, YSTEP = 328, 158          # vertical center of the DAG, row pitch


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
    out.append(f'<g stroke="{LINE}" stroke-width="5" fill="none">')
    for child, parents in EDGES.items():
        for p in parents:
            if child in red_ids or p in red_ids:
                continue
            out.append(f'<path d="{edge_path(child, p)}"/>')
    out.append('</g>')
    out.append(f'<g stroke="{RED}" stroke-width="9" fill="none">')
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

    out.append('</svg>')
    return "\n".join(out) + "\n"


if __name__ == "__main__":
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dest = os.path.join(root, "og-kaspa-explained.svg")
    with open(dest, "w", encoding="utf-8") as fh:
        fh.write(build())
    print("wrote", dest)
    rasterize(root, dest)
