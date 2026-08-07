#!/usr/bin/env python3
"""Refresh the model-picker blob from a dated leaderboard transcription.

Why this exists instead of build-model-data.py: that script was written when the
page carried 19 metrics and one input file that is no longer in the repo. The
page now carries 39 metrics and a confidence interval per figure. Running the
old script would silently drop twenty metrics and every ci array, and the gate's
own check-model-picker.py would then fail because dials name metrics that would
no longer be in the data. It is kept for its history, not for running.

This script refreshes the 35 metrics that a leaderboard transcription can carry
and leaves four alone:

  confirmed, praise, steer, bash

Those are Agent Arena session signals from data/arena-agent.json. A leaderboard
export of the Agent board carries only its Net Improvement column, which this
page deliberately refuses to import because Arena's own rank is built from it.
The roster is unchanged, so those four stay normalized against the same set of
models they were normalized against before, and carrying them across is exact
rather than approximate. If the roster ever changes, they must be rebuilt.

  python3 scripts/refresh-model-data.py data/leaderboards-2026-08-07.json
"""
import json, math, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / "model-picker.html"
BLOB = re.compile(r"(window\.__MP__=)(\{.*?\})(;</script>)", re.S)

# Position in the blob's metric list -> where the value comes from.
# ("lb", i) and ("aa", i) index the raw arrays in the transcription file.
# ("keep",) means carry the existing normalized value across untouched.
LB = ["overall", "reasoning", "coding", "agentic", "math", "data", "language",
      "ifollow", "costPerSuccess"]
AA = ["intelligence", "gdpval", "tbhard", "tbv2", "tau2", "tau3", "lcr", "omni",
      "nonhallu", "hle", "gpqa", "scicode", "ifbench", "critpt", "apex",
      "itbench", "mmmu", "costPerTask", "tps", "ttft", "total", "context"]

KEEP = {"confirmed", "praise", "steer", "bash"}
# Lower is better. Everything else is higher is better.
LOWER = {"costPerSuccess", "costPerTask", "ttft", "total"}

# Coverage floors, owner's call on 7 August 2026: score on figures that most of
# the field actually published, and list models that most of those figures
# actually cover.
#
# A metric measured on 5 of 23 models is worse than useless here. Every model
# that never sat the benchmark scores zero on it, the page's own 70% coverage
# rule then drops those models from any ranking that asks for it, and a dial
# reading "Looking at images" quietly ranks the five models that happened to
# publish MMMU rather than the best of the field. Arena's per-board Elo is the
# worst of these: only the top fifteen of each board publish a score at all, so
# the metric is structurally biased toward models already winning.
MIN_METRIC_COV = 0.80   # share of models that must report a metric to keep it
MIN_MODEL_COV = 0.90    # share of kept metrics a model must report to be listed


def main():
    raw = json.loads(pathlib.Path(sys.argv[1]).read_text())
    page = PAGE.read_text()
    m = BLOB.search(page)
    if not m:
        sys.exit("could not find the window.__MP__ blob")
    cur = json.loads(m.group(2))
    metrics = cur["metrics"]
    old_by_name = {x["n"]: x for x in cur["models"]}

    src = raw["models"]
    names = [x["name"] for x in src]
    missing = [n for n in names if n not in old_by_name]
    if missing:
        sys.exit("roster changed, so the carried-over Arena signals would be "
                 "normalized against a different set: " + ", ".join(missing))
    if len(src) != len(cur["models"]):
        sys.exit(f"roster size changed ({len(cur['models'])} -> {len(src)}); "
                 "the Arena signals must be rebuilt, not carried across")

    # Pull every raw figure into one flat {model: {metric: value}}.
    vals = {}
    for rec in src:
        d = {}
        for i, k in enumerate(LB):
            v = rec["lb"][i]
            if v is not None:
                d[k] = float(v)
        for i, k in enumerate(AA):
            v = rec["aa"][i]
            if v is not None:
                d[k] = float(v)
        for k, v in rec["arena"].items():
            if v is not None:
                d[k] = float(v)
        vals[rec["name"]] = d

    # Drop thin metrics first, then models that are thin across what survived.
    # Order matters: a model must not be judged on coverage of metrics that are
    # themselves being dropped for thinness.
    n_all = len(src)
    dropped_metrics = []
    kept = []
    for k in metrics:
        if k in KEEP:
            kept.append(k); continue
        cov = sum(1 for d in vals.values() if k in d) / n_all
        (kept if cov >= MIN_METRIC_COV else dropped_metrics).append(k)
        if cov < MIN_METRIC_COV:
            dropped_metrics[-1] = (k, cov)
    kept = [k for k in kept if not isinstance(k, tuple)]

    scorable = [k for k in kept if k not in KEEP]
    dropped_models = []
    keep_names = []
    for rec in src:
        d = vals[rec["name"]]
        cov = sum(1 for k in scorable if k in d) / len(scorable)
        if cov >= MIN_MODEL_COV:
            keep_names.append(rec["name"])
        else:
            dropped_models.append((rec["name"], cov))
    src = [r for r in src if r["name"] in keep_names]
    vals = {k: v for k, v in vals.items() if k in keep_names}

    for k, cov in dropped_metrics:
        print(f"  dropped metric {k:<14} {cov * 100:.0f}% of models reported it")
    for n_, cov in dropped_models:
        print(f"  dropped model  {n_:<24} {cov * 100:.0f}% of kept metrics")

    # Percentile-normalize each metric across only the models that report it,
    # the same rule the original build used, now over the surviving field.
    scale = {}
    for k in set().union(*(d.keys() for d in vals.values())):
        seen = sorted(d[k] for d in vals.values() if k in d)
        if len(seen) >= 2:
            scale[k] = (seen[0], seen[-1])

    ctxs = sorted({d["context"] for d in vals.values() if "context" in d})
    cl, ch = ctxs[0], ctxs[-1]

    old_idx = {k: i for i, k in enumerate(metrics)}
    metrics = kept

    out = []
    for rec in src:
        name = rec["name"]
        d, old = vals[name], old_by_name[name]
        v, a = [], []
        for key in metrics:
            if key in KEEP:
                oi = old_idx[key]
                v.append(old["v"][oi]); a.append(old["a"][oi]); continue
            if key == "context":
                if "context" in d:
                    s = (math.log10(d["context"]) - math.log10(cl)) / \
                        (math.log10(ch) - math.log10(cl)) * 100
                    v.append(round(s, 1)); a.append(1)
                else:
                    v.append(0.0); a.append(0)
                continue
            if key in d and key in scale:
                lo, hi = scale[key]
                s = 50.0 if hi == lo else (d[key] - lo) / (hi - lo) * 100
                v.append(round(s if key not in LOWER else 100 - s, 1)); a.append(1)
            else:
                v.append(0.0); a.append(0)

        out.append({
            "n": name, "t": None, "lab": rec["lab"], "open": rec["open"],
            "ctx": int(d["context"]) if "context" in d else None,
            "cost": d.get("costPerTask"), "ttft": d.get("ttft"), "tps": d.get("tps"),
            # ci is indexed by the metric list, so it has to be pruned with it.
            "solid": True, "v": v, "a": a,
            "ci": [old["ci"][old_idx[k]] for k in metrics],
        })

    out.sort(key=lambda r: -r["v"][0])
    payload = dict(cur)
    payload["metrics"] = metrics
    payload["models"] = out
    blob = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    PAGE.write_text(page[:m.start()] + m.group(1) + blob + m.group(3) + page[m.end():])

    covered = sum(sum(r["a"]) for r in out)
    print(f"{len(out)} models, {len(metrics)} metrics, "
          f"{covered}/{len(out) * len(metrics)} figures present "
          f"({covered / (len(out) * len(metrics)) * 100:.0f}% coverage)")
    print("carried across untouched: " + ", ".join(sorted(KEEP)))


if __name__ == "__main__":
    main()
