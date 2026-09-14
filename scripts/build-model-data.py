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

Three sources feed one index, and none of their own composites is imported.
LiveBench gives seven category scores plus cost per successful task.
Artificial Analysis gives an intelligence index, cost, throughput and latency.
Agent Arena gives four session signals, sign-recovered in data/arena-agent.json;
its Net Improvement column is deliberately left out, because that is the number
its own rank is built from and copying it would just replay their ranking.
Tool Hallucination is left out too: it is a placeholder, not a measurement.

  python3 scripts/build-model-data.py <merged.json>
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / "model-picker.html"
BLOB = re.compile(r"(window\.__MP__=)(\{.*?\})(;</script>)", re.S)

# metric key -> (source block, field, higher_is_better)
# Relevance rule: a model is listed only if all three leaderboards scored it.
# This replaces a hand-picked family list, and it does two jobs at once. It keeps
# the set to models people actually choose between, and it guarantees every row
# is measured on the same three sources, so the ranking compares like with like
# instead of scoring a one-source entry against a three-source one.

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
    # Agent Arena signals. Not its Net Improvement column: that is Arena's own
    # composite and the thing its rank is built from, so importing it would
    # replay their index rather than build one.
    ("confirmed",      "ar", "confirmed",      True),
    ("praise",         "ar", "praise",         True),
    ("steer",          "ar", "steer",          True),
    ("bash",           "ar", "bash",           True),
]
TIERS = {5: "MAX", 4: "XHI", 3: "HIGH", 2: "MED", 1: "LOW", 0: "OFF"}


def arena_by_family():
    """Arena rows, sign-recovered, keyed the way the merged export keys models."""
    a = json.loads((ROOT / "data" / "arena-agent.json").read_text())
    cols = a["columns"][1:]
    out = {}
    for row in a["printed"]:
        name, vals = row[0], row[1:]
        rec = {}
        for c, v in zip(cols, vals):
            # Absent from the signal's own top ten and above its tenth value
            # means the printed number had its minus sign stripped.
            if name not in a["top10"][c] and abs(v) > a["thresholds"][c]:
                v = -abs(v)
            rec[c] = v
        out[name] = rec
    return out


def match_arena(rec, arena):
    """Arena names a model differently from the export. Normalize and match."""
    def norm(x):
        return re.sub(r"[^a-z0-9]", "", x.lower())
    tier_word = {"MAX": "max", "XHI": "xhigh", "HIGH": "high",
                 "MED": "medium", "LOW": "low", "OFF": ""}.get(TIERS.get(rec["tier"]), "")
    want = norm(rec["name"]) + tier_word
    for k, v in arena.items():
        m = re.match(r"^(.*?)\s*\((.*)\)$", k)
        base, t = (m.group(1), m.group(2)) if m else (k, "")
        # Arena writes "Thinking" where the export uses an effort tier.
        t = t.replace("Thinking", "high")
        if norm(base) + norm(t) == want:
            return v
    return None


def main():
    src = json.loads(pathlib.Path(sys.argv[1]).read_text())
    arena = arena_by_family()
    for r in src:
        hit = match_arena(r, arena)
        if hit:
            r["ar"] = hit

    # Collapse to one row per model family.
    #
    # The export splits a family across records by reasoning effort, and the
    # leaderboards do not agree on which effort to publish: LiveBench scored
    # Claude Fable 5 at max effort, Artificial Analysis scored its default. No
    # single record therefore carries both, and requiring that on one record
    # threw away almost every model anyone actually uses.
    #
    # Collapsing also fixes the six-identical-looking-rows problem: one model is
    # one row, at its best published configuration for each source.
    fams = {}
    for r in src:
        f = fams.setdefault(r["family"], {"name": r["name"], "lab": r["lab"],
                                          "weights": r["weights"], "context": r.get("context")})
        if "lb" in r and (r["lb"].get("overall") or 0) > (f.get("lb", {}).get("overall") or -1):
            f["lb"] = r["lb"]; f["tier"] = r["tier"]
        if "aa" in r and (r["aa"].get("intelligence") or 0) > (f.get("aa", {}).get("intelligence") or -1):
            f["aa"] = r["aa"]
        if "ar" in r and "ar" not in f:
            f["ar"] = r["ar"]
        f["context"] = max(f.get("context") or 0, r.get("context") or 0) or None

    before = len(src)
    src = [dict(v, family=k, tier=v.get("tier"), id=k)
           for k, v in fams.items() if "lb" in v and "aa" in v and "ar" in v]
    src.sort(key=lambda r: -(r["lb"].get("overall") or 0))
    print(f"{before} entries across {len(fams)} families, "
          f"{len(src)} scored by all three leaderboards")

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
            # Log scale. Linearly, one 10M-token outlier pushed every 1M model
            # down to 9 out of 100, which reads as "they are all too short".
            import math
            s_ = (math.log10(ctx) - math.log10(cl)) / (math.log10(ch) - math.log10(cl)) * 100
            v.append(round(s_, 1)); a.append(1)
        else:
            v.append(0.0); a.append(0)

        out.append({
            "n": r["name"], "t": None, "lab": r["lab"],
            "open": r["weights"] == "open", "ctx": ctx,
            "cost": (r.get("aa") or {}).get("costPerTask"),
            "ttft": (r.get("aa") or {}).get("ttft"),
            "tps": (r.get("aa") or {}).get("tps"),
            # Every listed row clears the three-source rule, so this is always true.
            "solid": True,
            "v": v, "a": a,
        })

    payload = {"metrics": [m[0] for m in METRICS] + ["context"], "models": out}
    blob = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    page = PAGE.read_text()
    m = BLOB.search(page)
    if not m:
        sys.exit("could not find the window.__MP__ blob")
    PAGE.write_text(page[:m.start(2)] + blob + page[m.end(2):])

    print(f"{len(out)} models written")
    print(f"  metrics: {len(payload['metrics'])} across three leaderboards")
    return 0


if __name__ == "__main__":
    sys.exit(main())
