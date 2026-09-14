#!/usr/bin/env python3
"""Correlation analysis for the 11 chain-comparer dials.

Extracts the __CC__ blob embedded in chain-comparer.html, reproduces the same
derived fields and per-dial normalization the page's own JS applies (log
transform where the dial specifies it, direction flip, 0-100 scaling against
the chains that report the field), then computes Pearson r for every dial
pair on the resulting 0-100 scores. This mirrors what model-picker's own
methodology note does for its ten benchmark figures, applied to chain-comparer's
eleven dials instead.

Read-only: prints a correlation matrix and pairwise r values. Does not touch
chain-comparer.html or its data file.
"""
import json
import math
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HTML = REPO / "chain-comparer.html"

DIALS = [
    ("fast",    "bt",     -1, True),
    ("settle",  "fin",    -1, True),
    ("cheap",   "fee",    -1, True),
    ("volume",  "tps",     1, True),
    ("progs",   "_progs",  1, False),
    ("privacy", "priv",    1, False),
    ("spread",  "nak",     1, True),
    ("node",    "disk",   -1, True),
    ("people",  "devft",   1, True),
    ("ready",   "_ready",  1, False),
    ("mined",   "_mined",  1, False),
]

DIAL_LABELS = {
    "fast": "shows up fast", "settle": "settles for good", "cheap": "costs little to send",
    "volume": "carries real volume", "progs": "runs real programs",
    "privacy": "keeps payments private", "spread": "hard for a few to control",
    "node": "cheap to run yourself", "people": "has people behind it",
    "ready": "ready to use today", "mined": "secured by mining",
}

PROGS = {"none": 0, "rules": 50, "vm": 100}
MINED = {"pow": 100, "storage": 60, "pos": 0, "federated": 0, "permissioned": 0}


def load_chains():
    text = HTML.read_text()
    m = re.search(r"window\.__CC__=(\{.*?\});</script>", text, re.S)
    if not m:
        raise SystemExit("could not find __CC__ blob in chain-comparer.html")
    blob = json.loads(m.group(1))
    chains = blob["chains"]
    for c in chains:
        c["_progs"] = PROGS.get(c.get("sc"))
        c["_mined"] = MINED.get(c.get("sec"))
        wal = c.get("wal") or 0
        cust = c.get("cust") or 0
        etf = c.get("etf")
        etf_pts = 2 if etf == "live" else 1 if etf == "filed" else 0
        cme_pts = 1 if c.get("cme") else 0
        c["_ready"] = min(8, wal + cust + etf_pts + cme_pts)
    return chains


def normalize(chains):
    """Reproduce chain-comparer.html's per-dial 0-100 normalization."""
    scores = {k: {} for k, _, _, _ in DIALS}
    for k, field, direction, log in DIALS:
        vals = [(c["n"], c.get(field)) for c in chains]
        present = [(n, v) for n, v in vals if v is not None]
        if not present:
            continue
        def t(v):
            return math.log10(max(v, 1e-7)) if log else v
        ts = [t(v) for _, v in present]
        lo, hi = min(ts), max(ts)
        for n, v in present:
            if hi == lo:
                s = 50.0
            else:
                s = (t(v) - lo) / (hi - lo) * 100
                if direction == -1:
                    s = 100 - s
            scores[k][n] = s
    return scores


def pearson(xs, ys):
    n = len(xs)
    if n < 3:
        return None
    mx, my = sum(xs) / n, sum(ys) / n
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    sxx = sum((x - mx) ** 2 for x in xs)
    syy = sum((y - my) ** 2 for y in ys)
    if sxx == 0 or syy == 0:
        return None
    return sxy / math.sqrt(sxx * syy)


def main():
    chains = load_chains()
    scores = normalize(chains)
    keys = [k for k, _, _, _ in DIALS]

    print(f"Chains: {len(chains)}")
    for k in keys:
        print(f"  {k:8s} n={len(scores[k]):2d}  ({DIAL_LABELS[k]})")
    print()

    pairs = []
    print("Correlation matrix (Pearson r, on the 0-100 normalized dial scores):\n")
    header = "         " + " ".join(f"{k:>7s}" for k in keys)
    print(header)
    for k1 in keys:
        row = [f"{k1:8s}"]
        for k2 in keys:
            common = sorted(set(scores[k1]) & set(scores[k2]))
            xs = [scores[k1][n] for n in common]
            ys = [scores[k2][n] for n in common]
            r = pearson(xs, ys)
            if k1 == k2:
                row.append("   1.00")
            elif r is None:
                row.append("      .")
            else:
                row.append(f"{r:7.2f}")
            if k1 < k2 and r is not None:
                pairs.append((r, k1, k2, len(common)))
        print(" ".join(row))

    print("\nAll pairs, sorted by |r|:\n")
    for r, k1, k2, n in sorted(pairs, key=lambda p: -abs(p[0])):
        print(f"  r = {r:+.3f}  n={n:2d}   {k1:8s} <-> {k2:8s}   ({DIAL_LABELS[k1]} / {DIAL_LABELS[k2]})")


if __name__ == "__main__":
    main()
