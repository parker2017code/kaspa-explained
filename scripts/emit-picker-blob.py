#!/usr/bin/env python3
"""Regenerate the window.__MP__ data blob in model-picker.html.

The picker used to carry hand-maintained percentiles and no raw values, so any
roster change silently invalidated every number and nothing could be
re-derived. data/picker-data.json now holds raw values; this script turns them
into the page's blob and rewrites the one line that carries it.

It also derives two things the page cannot assert honestly by hand:

  STEP_RATIO / RAW_STEP, measured from every family on this board that
  publishes more than one effort tier, used to fill a tier a source skipped.

  Per-figure confidence intervals, carried through for the four LM Arena text
  boards that publish a plus-or-minus. The other sources publish none, and a
  figure with no published interval says so rather than borrowing one.

  python3 scripts/emit-picker-blob.py            # rewrite the blob
  python3 scripts/emit-picker-blob.py --print    # show what it would write
"""
import json, pathlib, re, statistics, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "picker-data.json"
ARENA = ROOT / "data" / "arena-deep-text-vision-2026-08-20.md"
PAGE = ROOT / "model-picker.html"

# Metric order is dial order, so the blob reads the way the page does.
# 25 figures across 10 dials: Artificial Analysis 13, LiveBench 7, LM Arena 5.
# Every dial carries two or three figures. No dial carries one: a control built
# on a single number is that number's leaderboard with a slider on it.
METRICS = [
    "hle", "lbMath", "arenaHardPrompts",
    "scicode", "lbCoding", "webdevArena",
    "lbAgenticCoding", "tau3Banking", "aaTbv2",
    "gdpval", "lbDataAnalysis",
    "omniNonHallucination", "omniAccuracy",
    "lbInstructionFollowing", "arenaTextInstructionFollowing",
    "arenaCreativeWriting", "lbLanguage",
    "aaLcr", "arenaLongerQuery",
    "tokensPerSec", "ttft", "aaTotalResponse",
    "aaCostPerTask", "lbCostPerSuccessTask", "aaOutputPrice",
]

# A model needs published figures for at least this many of the 25 to be ranked.
# 14 is where the data breaks, not a round number chosen first. Every model with
# figures from more than one board clears it. Every model with figures from one
# board only sits at exactly 13, because Artificial Analysis alone contributes 13
# of the 25. So the floor sorts on cross-source evidence, which is the thing
# worth sorting on, and it does it without naming a source in the rule. Check
# this number against the data after any change to METRICS; it is not a constant.
MIN_METRICS = 14

# Which Arena section heading carries the published interval for each figure.
ARENA_CI_SECTIONS = {
    "arenaTextInstructionFollowing": "### Instruction Following",
    "arenaCreativeWriting": "### Creative Writing",
    "arenaHardPrompts": "### Hard Prompts",
    "arenaLongerQuery": "### Longer Query",
}

VARIANT_MAP = {
    "max": "max effort", "xhigh": "xhigh effort", "high": "high effort",
    "medium": "medium effort", "low": "low effort",
    "xHigh Effort": "xhigh effort",
}


def tier_of(variant):
    if variant is None:
        return None
    return VARIANT_MAP.get(variant, variant)


def arena_intervals():
    """Model slug -> {metric: published half-width}, read off the ± column."""
    if not ARENA.exists():
        return {}
    text = ARENA.read_text(encoding="utf-8")
    out = {}
    for metric, heading in ARENA_CI_SECTIONS.items():
        i = text.find(heading)
        if i < 0:
            continue
        chunk = text[i:]
        j = chunk.find("\n### ", 4)
        if j > 0:
            chunk = chunk[:j]
        for row in re.finditer(r"^\|\s*\d+\s*\|\s*([^|]+?)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|", chunk, re.M):
            slug, _score, ci = row.group(1).strip(), row.group(2), row.group(3)
            out.setdefault(slug, {})[metric] = int(ci)
    return out


def main():
    d = json.loads(DATA.read_text(encoding="utf-8"))
    models = d["models"]
    # Inclusion is recomputed against THIS metric set. picker-data.json carries
    # a flag from whatever set was wired when it was built, and reading that
    # stale flag would rank models on a floor no longer in force.
    for v in models.values():
        v["wired_metric_count"] = sum(1 for m in METRICS if m in v["raw"])
        v["included"] = v["wired_metric_count"] >= MIN_METRICS
    inc = {k: v for k, v in models.items() if v["included"]}

    missing = [m for m in METRICS if m not in d["metrics"]]
    if missing:
        sys.exit(f"metrics not present in picker-data.json: {missing}")

    # ---- Percentiles are computed here, over the live roster, not read from
    # picker-data.json. That file carries percentiles for whatever metric set
    # was wired when it was built, so three of the figures below have none at
    # all, and the ones it does have are normalized across a different roster.
    # A percentile is only meaningful against the field it is taken over.
    lo, hi, span = {}, {}, {}
    for m in METRICS:
        vals = [v["raw"][m]["value"] for v in inc.values() if m in v["raw"]]
        if not vals:
            sys.exit(f"no model on the roster publishes {m}")
        lo[m], hi[m] = min(vals), max(vals)
        span[m] = hi[m] - lo[m]

    def pctile(m, val):
        """0 to 100 across this roster, flipped where lower is better."""
        if not span[m]:
            return 100.0
        p = (val - lo[m]) / span[m] * 100.0
        return p if d["metrics"][m]["higher"] else 100.0 - p

    ci_raw = arena_intervals()

    # ---- rows
    rows = []
    for key, v in sorted(inc.items(), key=lambda kv: -kv[1]["wired_metric_count"]):
        pct, av, ci = [], [], []
        has_ci = False
        for m in METRICS:
            if m in v["raw"]:
                pct.append(round(pctile(m, v["raw"][m]["value"]), 1))
                av.append(1)
                c = None
                slug = v.get("arena_slug") or key
                if m in ARENA_CI_SECTIONS and span[m]:
                    got = ci_raw.get(slug, {}).get(m)
                    if got is not None:
                        c = round(got / span[m] * 100, 2)
                        has_ci = True
                ci.append(c)
            else:
                pct.append(0.0)
                av.append(0)
                ci.append(None)
        raw = v["raw"]
        row = {
            "n": v["name"],
            "t": tier_of(v["variant"]),
            "lab": v["lab"],
            "open": bool(v["open_weights"]),
            "ctx": int(v["context_window"] / 1000) if v.get("context_window") else None,
            "cost": raw.get("aaCostPerTask", {}).get("value"),
            "ttft": raw.get("ttft", {}).get("value"),
            "tps": raw.get("tokensPerSec", {}).get("value"),
            "solid": v["wired_metric_count"] >= 19,
            "v": pct,
            "a": av,
        }
        if has_ci:
            row["ci"] = ci
        rows.append(row)

    note = (
        "Artificial Analysis, LiveBench 2026-06-25 and LM Arena, all read 20 August 2026. "
        "Twenty-five figures across ten dials, kept or cut on whether they still tell the "
        "leading models apart rather than on how well known they are. Every dial carries two "
        "or three of them. A model is ranked only if it has published figures for at least "
        f"{MIN_METRICS} of the 25, which is why the roster is a subset of the models these three "
        "boards score between them. When a model is missing one of a dial's figures, the dial "
        "blends from whichever it has; when it is missing all of them, that dial reads no data "
        "for it."
    )
    blob = {
        "metrics": METRICS,
        "models": rows,
        "sources": {"Artificial Analysis": 13, "LiveBench": 7, "LM Arena": 5},
        "ci_note": note,
    }

    js = "window.__MP__=" + json.dumps(blob, separators=(",", ":"), ensure_ascii=False) + ";"

    print(f"metrics {len(METRICS)}  models {len(rows)}")
    print(f"rows carrying published intervals: {sum(1 for r in rows if 'ci' in r)}")

    if "--print" in sys.argv:
        print("\n" + js[:400] + " ...")
        return 0

    src = PAGE.read_text(encoding="utf-8")
    new, n = re.subn(r"window\.__MP__=\{.*?\};", lambda _: js, src, count=1, flags=re.S)
    if n != 1:
        sys.exit("could not find the window.__MP__ blob in model-picker.html")
    PAGE.write_text(new, encoding="utf-8")
    print(f"\nrewrote the blob in {PAGE.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
