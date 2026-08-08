#!/usr/bin/env python3
"""Refresh the model-picker blob from a dated leaderboard transcription.

Why this exists instead of build-model-data.py: that script was written when the
page carried 19 metrics and one input file that is no longer in the repo. The
page now carries 39 metrics and a confidence interval per figure. Running the
old script would silently drop twenty metrics and every ci array, and the gate's
own check-model-picker.py would then fail because dials name metrics that would
no longer be in the data. It is kept for its history, not for running.

Every figure is rebuilt from source, including Arena's four session signals,
which are read raw from data/arena-agent.json and sign-recovered here. Nothing
is carried across from the previous build: a carried value is a percentile of
whatever field existed last time, and the moment the roster moves it sits in a
row beside figures scaled to a different one.

The output is a fully dense grid. Every listed model has every listed figure,
no exceptions, because a model that skipped a benchmark does not score badly on
it, it skips it, and its average is then taken over an easier question than the
model beside it that published a weak number.

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

# Agent Arena session signals. Read from data/arena-agent.json as raw values and
# normalized here with everything else, rather than carried across from the last
# build. Carrying them was exact only while the roster never moved; the moment
# densify drops a model, a carried value is a percentile of a field that no
# longer exists, sitting in a row beside figures scaled to the field that does.
ARENA = ["confirmed", "praise", "steer", "bash"]
KEEP = set()
# Lower is better. Everything else is higher is better.
LOWER = {"costPerSuccess", "costPerTask", "ttft", "total"}

# No gaps. Not "few gaps", none.
#
# Percentile coverage thresholds were the first attempt and they were wrong in a
# way that is easy to miss: 80/90 floors still left one hole, and one hole is
# enough to bend a comparison. A model missing a figure does not score badly on
# it, it skips it, so its score is an average over an easier question than the
# model beside it that published the number and carried a weak result. Partial
# coverage quietly rewards not publishing. The only way the columns compare like
# with like is if every listed model has every listed figure.
#
# So instead of a threshold, find the largest fully dense submatrix: the choice
# of models and figures with no missing cell anywhere. That is the maximum-edge
# biclique problem, which is NP-hard, so this does greedy removal from several
# starts and keeps the best result. The field is 23x39, small enough that greedy
# lands on the optimum or next to it.
#
# The trade runs both ways and the search makes it explicitly. A benchmark only
# some models sat is dropped rather than excusing the models that skipped it. A
# model missing figures the rest all published is dropped rather than dragging
# those figures out of the set. Which side gives way is decided by which keeps
# more of the grid, not by hand.
# Cells are not worth the same, so the search does not maximize raw area.
# Maximizing area alone kept three trailing models by sacrificing GDPval real
# world work, Terminal-Bench v2.1, tau-3 tool use and cost per task, which is
# the wrong way round: those four drive dials and the three models were the
# only ones missing them. A figure that no dial reads cannot change an answer,
# so it is worth little; a figure a dial is built on is worth defending, and a
# model that skipped several of those is the thing that should give way.
DIAL_FIGURE_WEIGHT = 4.0
IDLE_FIGURE_WEIGHT = 1.0

# Which figures count as load bearing, stated here rather than read from DIALS.
#
# Reading the live dials made the data selection depend on the editorial choice
# it is supposed to feed: rewriting a factor changed which figures counted,
# which changed which models were eligible, which changed the roster. One dial
# edit moved the grid from 20x28 to 23x25 with no new data. A selection rule
# that moves when you rewrite a label is not a rule.
#
# So the list is fixed and explicit. It is the figures a person choosing a
# frontier model is actually choosing on, written down BEFORE looking at which
# models it drops, which is the other half of the same discipline.
LOAD_BEARING = {
    "overall", "reasoning", "coding", "agentic", "math", "data", "language",
    "ifollow", "costPerSuccess", "intelligence", "gdpval", "tbv2", "tau3",
    "lcr", "omni", "nonhallu", "hle", "gpqa", "scicode", "critpt",
    "ttft", "tps", "costPerTask",
}


EFFORT = [("xhigh", "xhigh effort"), ("max", "max effort"), ("high", "high effort"),
           ("medium", "medium effort"), ("low", "low effort"),
           ("non-reasoning", "no reasoning"), ("thinking", "thinking")]


def tier_of(rec):
    """What configuration these figures actually came from.

    Every row was written as null, so the page printed "default setting" on all
    twenty while the transcription deliberately takes each model's BEST
    published configuration. Claude Opus 5 read "default setting" carrying
    Opus 5 (max) and Opus Thinking Max Effort. A label is part of the claim.

    The two boards can disagree, so say so rather than picking one.
    """
    def eff(row):
        low = (row or "").lower()
        for key, label in EFFORT:
            if key in low:
                return label
        return None
    a, b = eff(rec.get("aa_row")), eff(rec.get("lb_row"))
    if a and b and a == b:
        return a
    if a and b:
        return a + " / " + b
    return a or b


def norm_name(x):
    """Arena writes 'GPT 5.6 Sol (xHigh)' where the transcription writes
    'GPT-5.6 Sol'. Strip the tier and everything that is not alphanumeric."""
    return re.sub(r"[^a-z0-9]", "", re.sub(r"\s*\(.*?\)\s*$", "", x).lower())


def arena_raw():
    """Arena's four session signals, sign-recovered, keyed by normalized name.

    Arena prints these with the minus signs stripped, so read as printed the
    worst model looks best at recovering from a failed command. A signal's own
    top-ten list gives the threshold that recovers the sign: absent from the
    top ten while above its tenth value means the number was negative.

    Rows are ranked, so the first match for a family is its best tier, which is
    the same 'best published configuration' rule the other sources get.
    """
    a = json.loads((ROOT / "data" / "arena-agent.json").read_text())
    cols = a["columns"][1:]
    out = {}
    for row in a["printed"]:
        key = norm_name(row[0])
        if key in out:
            continue
        rec = {}
        for c, v in zip(cols, row[1:]):
            if row[0] not in a["top10"][c] and abs(v) > a["thresholds"][c]:
                v = -abs(v)
            rec[c] = v
        out[key] = rec
    return out


def main():
    raw = json.loads(pathlib.Path(sys.argv[1]).read_text())
    page = PAGE.read_text()
    m = BLOB.search(page)
    if not m:
        sys.exit("could not find the window.__MP__ blob")
    cur = json.loads(m.group(2))
    # The live page only carries whatever survived the last densify, so it
    # cannot be the metric universe: figures cut once could never come back
    # even if a later refresh completes them. The baseline blob keeps the full
    # space and the ci per figure.
    base = json.loads((ROOT / "data" / "model-picker-baseline.json").read_text())
    metrics = base["metrics"]
    old_by_name = {x["n"]: x for x in base["models"]}

    src = raw["models"]
    arena = arena_raw()

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
        for k, v in (arena.get(norm_name(rec["name"])) or {}).items():
            d[k] = float(v)
        vals[rec["name"]] = d

    all_models = [r["name"] for r in src]
    # KEEP metrics are carried from the old blob for every listed model, so they
    # are present by construction and never constrain the search.
    all_metrics = [k for k in metrics if k not in KEEP and k != "context"]

    # Figures the page actually scores on, read from the DIALS array so this
    # cannot drift away from the page the way a hand-kept list would.
    used = LOAD_BEARING

    def fw(k):
        return DIAL_FIGURE_WEIGHT if k in used else IDLE_FIGURE_WEIGHT

    def value(ms, ks):
        return len(ms) * sum(fw(k) for k in ks)

    # Eligibility, applied before any search. A model that skipped several of
    # the figures the page actually scores on is not a cheap row to carry, it
    # is a row that drags those figures out of the set for everyone else. Area
    # alone will never say so: keeping a model is worth more than keeping a
    # figure at any weight, so without this gate the trailing models always win
    # and the benchmarks that measure agentic work always lose.
    MAX_MISSING_DIAL_FIGURES = 2

    def density(ms, ks):
        return sum(1 for n_ in ms for k in ks if k in vals[n_])

    def densify(order_bias):
        ms, ks = list(all_models), list(all_metrics)
        while True:
            holes = density(ms, ks)
            if holes == len(ms) * len(ks):
                return ms, ks
            # worst offender on each axis, scored by how many cells it costs
            wm = max(ms, key=lambda n_: (sum(1 for k in ks if k not in vals[n_]), n_))
            wk = max(ks, key=lambda k: (sum(1 for n_ in ms if k not in vals[n_]), k))
            miss_m = sum(1 for k in ks if k not in vals[wm])
            miss_k = sum(1 for n_ in ms if wk not in vals[n_])
            # value left if we cut each way; bias lets models win close calls
            area_cut_model = value([x for x in ms if x != wm], ks) * order_bias
            area_cut_metric = value(ms, [x for x in ks if x != wk])
            if miss_m == 0:
                ks.remove(wk)
            elif miss_k == 0:
                ms.remove(wm)
            elif area_cut_model >= area_cut_metric:
                ms.remove(wm)
            else:
                ks.remove(wk)

    def drop_models_first(k):
        """Evict the k models that block the most dial-weighted figures, then
        drop only whatever is still incomplete.

        Greedy alone cannot see this trade. It removes the worst offender on
        each axis in turn, so by the time it reaches a figure only three models
        are missing, evicting those three looks locally worse than dropping the
        figure, even when the figure drives a dial and the three models are the
        weakest on the board.
        """
        def blocking(n_):
            return sum(fw(x) for x in all_metrics if x not in vals[n_])
        ms = sorted(all_models, key=lambda n_: (-blocking(n_), n_))[k:]
        if not ms:
            return [], []
        ks = [x for x in all_metrics if all(x in vals[n_] for n_ in ms)]
        return ms, ks

    ineligible = []
    for n_ in list(all_models):
        gone = [k for k in all_metrics if k in used and k not in vals[n_]]
        if len(gone) > MAX_MISSING_DIAL_FIGURES:
            ineligible.append((n_, gone))
    for n_, gone in ineligible:
        print(f"  not eligible  {n_:<24} skipped {len(gone)} scored figures: "
              + ", ".join(gone))
    all_models = [n_ for n_ in all_models if n_ not in dict(ineligible)]

    best = None
    cands = [densify(b) for b in (0.90, 1.0, 1.05, 1.15, 1.30)]
    cands += [drop_models_first(k) for k in range(0, 9)]
    for ms, ks in cands:
        if not ms or not ks:
            continue
        if sum(1 for n_ in ms for x in ks if x not in vals[n_]):
            continue                      # not dense, not a candidate
        score = (value(ms, ks), len(ms))
        if best is None or score > best[0]:
            best = (score, ms, ks)
    _, keep_names, keep_metrics = best

    dropped_models = [n_ for n_ in all_models if n_ not in keep_names]
    dropped_metrics = [k for k in all_metrics if k not in keep_metrics]
    for k in dropped_metrics:
        miss = [n_ for n_ in all_models if k not in vals[n_]]
        print(f"  dropped figure {k:<14} {len(miss)} of {len(all_models)} models never published it")
    for n_ in dropped_models:
        miss = [k for k in all_metrics if k not in vals[n_]]
        print(f"  dropped model  {n_:<24} missing {len(miss)} of {len(all_metrics)} figures")

    kept = [k for k in metrics if k in keep_metrics or k in KEEP or k == "context"]
    src = [r for r in src if r["name"] in keep_names]
    vals = {k: v for k, v in vals.items() if k in keep_names}

    holes = sum(1 for n_ in keep_names for k in keep_metrics if k not in vals[n_])
    if holes:
        sys.exit(f"densify failed: {holes} gaps remain")
    print(f"  fully dense: {len(keep_names)} models x {len(keep_metrics)} "
          f"searchable figures, zero gaps")

    # Percentile-normalize each metric across only the models that report it,
    # the same rule the original build used, now over the surviving field.
    scale = {}
    for k in set().union(*(d.keys() for d in vals.values())):
        seen = sorted(d[k] for d in vals.values() if k in d)
        if len(seen) >= 2:
            scale[k] = (seen[0], seen[-1])

    ctxs = sorted({d["context"] for d in vals.values() if "context" in d})
    cl, ch = ctxs[0], ctxs[-1]

    # A model transcribed after the baseline was cut has no ci row. For every
    # LiveBench and Artificial Analysis figure the interval is a property of the
    # METRIC, not of the model: the note on the page says both boards publish
    # point figures and carry an assumed 1.5 points converted through each
    # metric's own range. So a new row inherits the metric's interval, taken as
    # the median across the models that have one. Arena's four are genuinely
    # per model, and they are dropped by densify the moment a model without
    # Arena data joins, so no Arena interval is ever guessed here.
    import statistics
    ci_by_metric = []
    for i in range(len(metrics)):
        vals_i = [x["ci"][i] for x in base["models"] if i < len(x.get("ci", []))]
        ci_by_metric.append(statistics.median(vals_i) if vals_i else 6.0)

    old_idx = {k: i for i, k in enumerate(metrics)}
    metrics = kept

    out = []
    for rec in src:
        name = rec["name"]
        d = vals[name]
        old = old_by_name.get(name) or {"ci": ci_by_metric}
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
            "n": name, "t": tier_of(rec), "lab": rec["lab"], "open": rec["open"],
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
