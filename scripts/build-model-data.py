#!/usr/bin/env python3
"""Build the model-picker dataset from the merged leaderboard export.

The previous dataset back-filled: when a model's reasoning tier had no
benchmark row of its own, it inherited a sibling tier's scores and then marked
every metric as real. Ten models ended up with byte-identical benchmark vectors
across every effort tier, so a ranking that asked for coding ability broke the
tie on cost and speed instead, and "no reasoning" variants won coding.

Two rules here, and both matter more than coverage:

  1. Never copy a score from one record to another. A tier that published
     nothing is scored on nothing.
  2. The availability flags must be the truth. The page already drops a model
     whose real metrics cover under 70% of what was asked, but that rule only
     works if the flags are honest.

Metrics with no source data at all are not carried. The merged export has zero
Arena records, so the six agentic signals it would have supplied (net
improvement, confirmed success, praise, steerability, bash recovery, tool
hallucination) are absent rather than invented.

  python3 scripts/build-model-data.py <merged.json>
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / "model-picker.html"
BLOB = re.compile(r"(window\.__MP__=)(\{.*?\})(;</script>)", re.S)

# metric key -> (source block, field, higher_is_better)
METRICS = [
    ("overall",        "lb", "overall",        True),
    ("reasoning",      "lb", "reasoning",      True),
    ("coding",         "lb", "coding",         True),
    ("agentic",        "lb", "agentic",        True),
    ("math",           "lb", "math",           True),
    ("data",           "lb", "data",           True),
    ("language",       "lb", "language",       True),
    ("ifollow",        "lb", "ifollow",        True),
    ("costPerSuccess", "lb", "costPerSuccess", False),
    ("intelligence",   "aa", "intelligence",   True),
    ("costPerTask",    "aa", "costPerTask",    False),
    ("tps",            "aa", "tps",            True),
    ("ttft",           "aa", "ttft",           False),
    ("total",          "aa", "total",          False),
]
TIERS = {5: "MAX", 4: "XHI", 3: "HIGH", 2: "MED", 1: "LOW", 0: "OFF"}


def main():
    src = json.loads(pathlib.Path(sys.argv[1]).read_text())

    rows, dropped = [], []
    for r in src:
        vals = {}
        for key, block, field, _ in METRICS:
            v = (r.get(block) or {}).get(field)
            if v is not None:
                vals[key] = float(v)
        if not vals:
            dropped.append(r["id"])
            continue
        rows.append({"r": r, "vals": vals})

    # Percentile-normalize each metric across only the records that report it.
    scale = {}
    for key, _, _, higher in METRICS:
        seen = sorted(x["vals"][key] for x in rows if key in x["vals"])
        if len(seen) < 2:
            continue
        lo, hi = seen[0], seen[-1]
        scale[key] = (lo, hi, higher)

    ctxs = sorted({r["r"]["context"] for r in rows if r["r"].get("context")})
    cl, ch = ctxs[0], ctxs[-1]

    out = []
    for x in rows:
        r, vals = x["r"], x["vals"]
        v, a = [], []
        for key, _, _, _ in METRICS:
            if key in vals and key in scale:
                lo, hi, higher = scale[key]
                s = 50.0 if hi == lo else (vals[key] - lo) / (hi - lo) * 100
                v.append(round(s if higher else 100 - s, 1)); a.append(1)
            else:
                v.append(0.0); a.append(0)
        ctx = r.get("context")
        if ctx:
            v.append(round((ctx - cl) / (ch - cl) * 100, 1)); a.append(1)
        else:
            v.append(0.0); a.append(0)

        out.append({
            "n": r["name"], "t": TIERS.get(r["tier"]), "lab": r["lab"],
            "open": r["weights"] == "open", "ctx": ctx,
            "cost": (r.get("aa") or {}).get("costPerTask"),
            "ttft": (r.get("aa") or {}).get("ttft"),
            "tps": (r.get("aa") or {}).get("tps"),
            # Two independent leaderboards behind the row, not one.
            "solid": "lb" in r and "aa" in r,
            "v": v, "a": a,
        })

    payload = {"metrics": [m[0] for m in METRICS] + ["context"], "models": out}
    blob = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    page = PAGE.read_text()
    m = BLOB.search(page)
    if not m:
        sys.exit("could not find the window.__MP__ blob")
    PAGE.write_text(page[:m.start(2)] + blob + page[m.end(2):])

    both = sum(1 for r in out if r["solid"])
    print(f"{len(out)} models written, {len(dropped)} dropped for having no benchmark data")
    print(f"  {both} carry two leaderboards, {len(out)-both} carry one")
    print(f"  metrics: {len(payload['metrics'])} (no Arena signals: the export has none)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
