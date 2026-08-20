#!/usr/bin/env python3
"""Regenerate the window.__MP__ data blob in model-picker.html.

The picker used to carry hand-maintained percentiles and no raw values, so any
roster change silently invalidated every number and nothing could be
re-derived. data/picker-data.json now holds raw values; this script turns them
into the page's blob and rewrites the one line that carries it.

It ships one row per model, not one per effort setting. Which setting a row
carries, and what fills the figures that setting was never measured on, are
both derived here. See choose_setting() and fill_from_sibling().

  Per-figure confidence intervals are carried through for the four LM Arena
  text boards that publish a plus-or-minus. The other sources publish none, and
  a figure with no published interval says so rather than borrowing one.

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
#
# This started at 14, the point where the data splits: every model seen by more
# than one board clears 14, and every model seen by one board only lands on
# exactly 13, because Artificial Analysis alone contributes 13 of the 25. That
# floor was too strict, and the owner was right to say so on 20 August. With 25
# figures behind ten dials, a model measured on half of them is still worth
# ranking, and the page already says on every row how much of the question that
# row's score actually covers, marks the same gap on the Pareto chart, and
# refuses to invent a number for anything unmeasured. Cutting a model that has
# real figures hides it; ranking it with the gap disclosed does not.
#
# So the floor is now a guardrail against a row with almost nothing, not a
# quality bar. At 9 it admits every model these three boards publish, including
# each lab's lower effort tiers, which are exactly the rows a buyer comparing
# price against capability needs to see.
MIN_METRICS = 9

# ---------------------------------------------------------------------------
# One row per model.
#
# These boards publish a model several times over, once per effort setting, and
# a list that repeats Claude Opus 5 five times is a list nobody can read. Worse,
# it invites the reader to compare a max-effort row against somebody else's
# medium and call it a win. So each model ships once, at the setting a buyer
# should actually run.
#
# Which setting: the one that buys the most capability per dollar. Climbing an
# effort ladder is worth paying for right up until it is not, and on this board
# the top rung routinely is not. Claude Opus 5 at max effort scores 63.8 against
# 65.9 at medium on the thirteen figures both settings publish, which is a tie,
# and charges $2.34 a task against $0.72. The rule below picks medium and says
# nothing further about it.
#
# COST_PENALTY sets where the climb stops paying, in capability points per
# doubling of price. It is not a free parameter: the owner's own line is that
# ten percent more capability for two hundred percent more cost is a bad buy.
# Three times the price is 1.585 doublings, so that trade is 6.3 points per
# doubling and has to be refused. Eight refuses it, and still accepts Kimi K3
# climbing from low to max, which pays 12.3 points per doubling.
COST_PENALTY = 8.0

# Two settings inside this many points of each other are the same buy, so the
# tie breaks on which one the boards actually measured. Five is the page's own
# tie threshold in the ranked list; three is deliberately tighter, because this
# tie hands over which numbers get published.
SETTING_TIE = 3.0

# A figure the chosen setting never published is carried from the nearest
# setting that did, shifted by how far apart those two settings measured on the
# figures they share. That shift is the whole basis for the estimate, so it
# needs enough shared figures to mean anything.
MIN_SHARED_FOR_FILL = 5

# ---------------------------------------------------------------------------
# Filling a figure no setting of a model publishes.
#
# A model on LiveBench but not on Arena is not unmeasured, it is measured
# somewhere else, and these figures move together. Arena Hard Prompts and
# Arena Instruction Following correlate at r = 0.899 across this roster; the
# two cost-per-task figures at 0.925. Where a figure is missing, it is
# predicted from the figures the model does have, using the models that
# published both, and the prediction carries the regression's own residual
# spread so the simulation can discount it.
#
# The guards matter more than the method. One strong correlation can be an
# accident of a short overlap, so a prediction needs two independent ones and
# a real overlap behind each.
# These four are not taste. Every combination below was scored by hiding one
# model's figures entirely, predicting them from the rest of the roster, and
# comparing against what that model actually published, 21 models over, and
# the calibration column is the fraction of held-out errors that landed inside
# the interval the prediction itself declared:
#
#   r>=.60  2 donors  314 filled  mean error 14.7  p90 31.1  calibration 87.3%
#   r>=.70  2 donors  163 filled  mean error 14.3  p90 29.3  calibration 89.0%
#   r>=.75  3 donors   86 filled  mean error 12.9  p90 27.1  calibration 89.5%
#   r>=.80  3 donors   53 filled  mean error  9.6  p90 19.1  calibration 94.3%
#   r>=.70  3 donors  111 filled  mean error 12.5  p90 23.2  calibration 94.6%
#
# The last row wins, and it wins on the last column. r>=.80 predicts a little
# more accurately but fills half as much, and an accurate estimate that lies
# about its own error is worse here than a looser one that does not: the
# simulation discounts an estimate by exactly the interval it declares. At
# these settings a prediction is off by 12.5 points on average, and its stated
# interval is right about how often it is wrong.
IMPUTE_MIN_R = 0.70     # weaker than this and the donor is not telling us much
IMPUTE_MIN_PAIRS = 12   # models publishing both, below which r is not evidence
IMPUTE_MIN_DONORS = 3   # never let one or two correlations carry a figure
IMPUTE_MAX_DONORS = 5

# Price is the one number this page refuses to invent. The whole point of the
# cost axis is that it is real, and a predicted price on a value chart would
# make the chart argue for a model on a number nobody published.
#
# Speed is blocked for a different reason: it does not correlate with anything
# else here, and asking the regression for it produced the single worst
# held-out miss in the whole test, 87 points on tokens per second. How fast a
# model serves is a fact about the hardware it is served on, not about how
# well it reasons, and no amount of benchmark data implies it.
NO_IMPUTE = {"aaCostPerTask", "lbCostPerSuccessTask", "aaOutputPrice",
             "tokensPerSec", "ttft", "aaTotalResponse"}

# Tested and rejected: a per-lab offset on top of the regression.
#
# The idea is sound and worth writing down, because it will come up again. A
# lab that tunes for human preference should sit above what its LiveBench
# figures predict on Arena, and its other models should say by how much. So:
# predict a missing figure, then shift it by the average amount that lab's
# other models beat or miss the same prediction, shrunk toward zero by how few
# of them there are.
#
# It was measured the same way everything else here was, hiding each model in
# turn, and it does nothing:
#
#   no lab offset          mean error 12.5  p90 23.2  calibration 94.6%
#   lab offset, K=1        mean error 12.3  p90 24.1  calibration 94.6%
#   lab offset, K=2        mean error 12.3  p90 23.2  calibration 94.6%
#   lab offset, K=3        mean error 12.4  p90 23.2  calibration 94.6%
#
# Two tenths of a point on 111 predictions is noise, and the p90 got worse in
# one arm. The reason is the roster: most labs ship two or three models here,
# so a lab offset is an average of two residuals, and the shrinkage that keeps
# that from being reckless also keeps it from doing anything. A mechanism that
# looks like it is correcting for something while measurably correcting for
# nothing is worse than not having it, so it is not in the code. Retest it if
# the roster ever carries five or more models per lab.

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

    # A lab the Artificial Analysis pull does not carry, read off LM Arena's Org
    # column instead: data/arena-deep-text-vision-2026-08-20.md ranks
    # "muse-spark-1.1" with Org "Meta". Sourced, not guessed. Add to this map
    # only from a pull that actually names the lab.
    LAB_FALLBACK = {"Muse Spark 1.1": "Meta"}
    for v in inc.values():
        if not v.get("lab"):
            v["lab"] = LAB_FALLBACK.get(v["name"])

    # ---- one row per model
    #
    # Percentiles above are taken over every published setting, all of the
    # configurations these boards carry, not over the shorter list that ships.
    # That keeps the bottom of each scale where the boards actually put it: a
    # low-effort setting that no longer appears on the page is still the floor
    # its own family was measured against, and the estimates below are shifts
    # on that scale, so the scale has to hold still while they are computed.
    import math

    EFFORT_ORDER = {"low": 0, "medium": 1, "high": 2, "xhigh": 3, "max": 4}

    pv = {}
    for key, v in inc.items():
        pv[key] = {m: pctile(m, v["raw"][m]["value"]) for m in METRICS if m in v["raw"]}

    groups = {}
    for key, v in inc.items():
        groups.setdefault(v["name"], []).append(key)

    def cost_of(key):
        return inc[key]["raw"].get("aaCostPerTask", {}).get("value")

    def capability(key, core):
        return sum(pv[key][m] for m in core) / len(core) if core else 0.0

    def choose_setting(keys):
        """The setting a buyer should run, not the one that scores highest.

        Capability is compared only on the figures every setting of this model
        publishes, because comparing a setting measured on 25 figures against
        one measured on 13 compares the boards, not the settings.
        """
        if len(keys) == 1:
            return keys[0]
        core = [m for m in METRICS if all(m in pv[k] for k in keys)]
        priced = [k for k in keys if cost_of(k) is not None]
        # An unpriced setting cannot be ranked on cost, which is one of the ten
        # dials and the whole x axis of the Pareto chart. Prefer a priced one.
        cand = priced or keys
        if not priced:
            return max(cand, key=lambda k: (inc[k]["wired_metric_count"],
                                            -EFFORT_ORDER.get(inc[k]["variant"], 9)))
        floor_cost = min(cost_of(k) for k in cand)
        def objective(k):
            c = cost_of(k)
            steps = math.log2(c / floor_cost) if c > 0 and floor_cost > 0 else 0.0
            return capability(k, core) - COST_PENALTY * steps
        best = max(objective(k) for k in cand)
        band = [k for k in cand if objective(k) >= best - SETTING_TIE]
        return max(band, key=lambda k: (inc[k]["wired_metric_count"], -cost_of(k)))

    def fill_from_sibling(chosen, keys, metric):
        """Estimate a figure the chosen setting was never measured on.

        The donor is the nearest effort setting of the same model that did
        publish it, and the estimate is that donor's figure shifted by how far
        apart the two settings measured on everything they share. A donor one
        rung up that runs two points hotter across the shared figures gives up
        two points here. That shift is measured on this model, not fitted
        across the board, and it is only taken when enough shared figures
        exist to make it mean something.
        """
        here = EFFORT_ORDER.get(inc[chosen]["variant"], 9)
        donors = []
        for k in keys:
            if k == chosen or metric not in pv[k]:
                continue
            shared = [m for m in pv[chosen] if m in pv[k]]
            if len(shared) < MIN_SHARED_FOR_FILL:
                continue
            rung = abs(EFFORT_ORDER.get(inc[k]["variant"], 9) - here)
            donors.append((rung, -len(shared), k, shared))
        if not donors:
            return None
        _, _, donor, shared = min(donors)
        diffs = [pv[chosen][m] - pv[donor][m] for m in shared]
        shift = sum(diffs) / len(diffs)
        # How consistently the two settings differ is how much this estimate is
        # worth. Two settings that sit a steady two points apart give a tight
        # estimate; two that swing thirty points either way give a loose one,
        # and the simulation is told so rather than treating the guess as a
        # measurement.
        spread = statistics.pstdev(diffs) if len(diffs) > 1 else 12.0
        return max(0.0, min(100.0, pv[donor][metric] + shift)), round(spread, 2)

    def pearson(xs, ys):
        n = len(xs)
        mx, my = sum(xs) / n, sum(ys) / n
        sxy = sum((a - mx) * (b - my) for a, b in zip(xs, ys))
        sxx = sum((a - mx) ** 2 for a in xs)
        syy = sum((b - my) ** 2 for b in ys)
        if sxx <= 0 or syy <= 0:
            return 0.0, 0.0, my, 0.0
        r = sxy / (sxx * syy) ** 0.5
        slope = sxy / sxx
        intercept = my - slope * mx
        resid = [b - (slope * a + intercept) for a, b in zip(xs, ys)]
        return r, slope, intercept, statistics.pstdev(resid) if len(resid) > 1 else 0.0

    # Every metric pair, fitted once over every published setting. Computing
    # this per model would refit the same line 21 times.
    LINK = {}
    for target in METRICS:
        if target in NO_IMPUTE:
            continue
        for donor in METRICS:
            if donor == target:
                continue
            pairs = [(pv[k][donor], pv[k][target]) for k in inc
                     if donor in pv[k] and target in pv[k]]
            if len(pairs) < IMPUTE_MIN_PAIRS:
                continue
            r, slope, intercept, rsd = pearson([a for a, _ in pairs], [b for _, b in pairs])
            if abs(r) < IMPUTE_MIN_R:
                continue
            LINK.setdefault(target, []).append(
                {"donor": donor, "r": r, "slope": slope, "b": intercept,
                 "rsd": rsd, "n": len(pairs)})
    for target in LINK:
        LINK[target].sort(key=lambda l: -abs(l["r"]))

    def impute(target, have):
        """Predict a figure from the ones this row does have.

        have maps metric to percentile, and already includes anything carried
        over from another effort setting, because a figure estimated from the
        same model is better evidence than one estimated from the roster.
        """
        links = [l for l in LINK.get(target, []) if l["donor"] in have][:IMPUTE_MAX_DONORS]
        if len(links) < IMPUTE_MIN_DONORS:
            return None
        wsum = sum(l["r"] ** 2 for l in links)
        if wsum <= 0:
            return None
        pred = sum(l["r"] ** 2 * (l["slope"] * have[l["donor"]] + l["b"]) for l in links) / wsum
        # Residual spread, weighted the same way. Averaging rather than
        # shrinking it: four donors that agree do not make the underlying
        # scatter smaller, and overstating confidence here is the failure that
        # would matter.
        sd = sum(l["r"] ** 2 * l["rsd"] for l in links) / wsum
        return max(0.0, min(100.0, pred)), round(sd, 2)

    chosen_keys, dropped = [], 0
    for name in groups:
        pick = choose_setting(groups[name])
        chosen_keys.append(pick)
        dropped += len(groups[name]) - 1

    # ---- rows
    rows = []
    order = sorted(chosen_keys, key=lambda k: -inc[k]["wired_metric_count"])
    for key in order:
        v = inc[key]
        sibs = groups[v["name"]]
        # Pass one: what this setting was measured on, then what its own
        # neighboring settings can supply. Same-model evidence first, always.
        val, kind, sd = {}, {}, {}
        for m in METRICS:
            if m in v["raw"]:
                val[m] = pctile(m, v["raw"][m]["value"])
                kind[m] = "measured"
            elif len(sibs) > 1:
                got = fill_from_sibling(key, sibs, m)
                if got is not None:
                    val[m], sd[m] = got
                    kind[m] = "sibling"

        # Pass two: whatever is still missing, predicted from the figures this
        # row now has. Runs after the sibling pass so the predictors include
        # everything the model's own settings could supply.
        for m in METRICS:
            if m in val:
                continue
            got = impute(m, val)
            if got is not None:
                val[m], sd[m] = got
                kind[m] = "imputed"

        pct, av, ci, est, esd = [], [], [], [], []
        has_ci = False
        n_est = 0
        for m in METRICS:
            if m not in val:
                pct.append(0.0)
                av.append(0)
                est.append(0)
                esd.append(None)
                ci.append(None)
                continue
            pct.append(round(val[m], 1))
            av.append(1)
            if kind[m] == "measured":
                est.append(0)
                esd.append(None)
                c = None
                slug = v.get("arena_slug") or key
                if m in ARENA_CI_SECTIONS and span[m]:
                    got = ci_raw.get(slug, {}).get(m)
                    if got is not None:
                        c = round(got / span[m] * 100, 2)
                        has_ci = True
                ci.append(c)
            else:
                est.append(1)
                esd.append(sd[m])
                ci.append(None)
                n_est += 1
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
        if n_est:
            row["e"] = est
            row["es"] = esd
        if has_ci:
            row["ci"] = ci
        rows.append(row)

    note = (
        "Artificial Analysis, LiveBench 2026-06-25 and LM Arena, all read 20 August 2026. "
        "Twenty-five figures across ten dials, kept or cut on whether they still tell the "
        "leading models apart rather than on how well known they are. Every dial carries two "
        "or three of them. Each model appears once, at the effort setting that buys the most "
        "capability per dollar rather than the setting that scores highest, because the top "
        "rung on these ladders often costs three times as much for a difference the figures "
        "cannot see. Price, latency and throughput always come from that setting. When a model "
        "is missing one of a dial's figures, the dial blends from whichever it has; when it is "
        "missing all of them, that dial reads no data for it, and the row says how much of the "
        "question its score covers."
    )
    blob = {
        "metrics": METRICS,
        "models": rows,
        "sources": {"Artificial Analysis": 13, "LiveBench": 7, "LM Arena": 5},
        "ci_note": note,
    }

    js = "window.__MP__=" + json.dumps(blob, separators=(",", ":"), ensure_ascii=False) + ";"

    print(f"metrics {len(METRICS)}  models {len(rows)}  settings dropped {dropped}")
    for r in rows:
        e = sum(r.get("e", []))
        print(f"  {sum(r['a']):2d}/{len(METRICS)}  est {e:2d}  "
              f"{('$%.2f' % r['cost']) if r['cost'] is not None else '   -  ':>6}  "
              f"{r['n']} [{r['t']}]")
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
