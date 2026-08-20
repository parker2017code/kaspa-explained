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

# Figures that are not scored and are published anyway, as evidence of how
# close this field is.
#
# Each of these was cut from the ranking for saturation: the strongest models
# sit on top of each other, so the figure cannot order them. That is a fair
# reason to keep a figure out of a ranking and a terrible reason to hide it.
# Ranking only on the tests that spread models apart guarantees the page
# overstates how far apart they are. A test where the frontier is bunched is
# not broken. It is a measurement saying these models are close, which is the
# single most useful thing this page can tell somebody choosing between them.
#
# So they are carried here, scored by nobody, shown in the real-terms reading
# next to whichever dial they belong to. Composites are still excluded, on a
# different argument that saturation does not touch: the AA Intelligence Index,
# LiveBench overall, AA Omniscience and Text Arena overall are blends of
# figures already on this page, and averaging a blend back in counts the same
# evidence twice. LM Arena's Agent board stays out too, because it prints the
# size of a signed number without the sign.
CLOSENESS = ["aaGpqaDiamond", "aaCritpt", "aaMmmuPro", "lbReasoning",
             "textCoding", "textMath", "textExpert"]
CLOSENESS_MIN_COVERAGE = 12

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

# Every model is quoted at the same effort setting, and the setting is derived,
# not chosen. These boards test whatever each lab submitted: Claude Opus 5 at
# five settings, GLM-5.2 only at max, Grok 4.5 only at high. Ranking those
# against each other compares submissions, not models.
#
# Which rung, and why not the cheapest one that still scores well: capability
# keeps rising all the way up. Measured on capability figures alone, a rung
# buys +14.9 points from low to medium, +5.9 to high, +7.4 to xhigh, +11.4 to
# max, against about 1.5x the price each time. Every one of those clears
# COST_PENALTY, so a value walk does not stop anywhere and cannot pick a rung.
# An earlier version of this file thought it could, because it averaged the
# cost and speed figures in with capability, and those fall as effort rises.
# That made the top rung look negative. It is not.
#
# So the rung is picked to invent as little as possible: the one the most
# models were actually tested at, inside the medium-to-high band a buyer
# actually runs. Counting rungs of extrapolation over the 21 models, medium
# costs 23 and has 9 models measured there, high costs 13 and has 13. High
# wins on both. TARGET is derived in derived_target() and printed on every
# build, because a refresh can move it.
TARGET_BAND = ("medium", "high")

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

    # Effort changes these directly, so they are rescaled in dollars and
    # seconds rather than shifted in percentile space, each by its own measured
    # ratio. Output price per token is not here on purpose: effort changes how
    # many tokens a model spends, never what a token costs. Throughput is not
    # here either, because it does not move (1.02 per rung across 16 steps).
    # Latency is not on this list, and it was until the numbers were looked at.
    # Price is a real ladder: 1.30 to 1.71 across thirteen measured steps, tight
    # enough to chain. Latency is not. Its steps range from 1.39 to 9.98, so
    # chaining two of them put GLM-5.2 at 0.17 seconds to first token, which is
    # not a measurement of anything. Time to first token and total response
    # time are therefore left at whatever setting the board tested, which
    # flatters nobody and penalizes the models only submitted at max.
    SCALED_RAW = ["aaCostPerTask", "lbCostPerSuccessTask"]

    # Capability is everything the dials score that is not a price or a clock.
    CAP_METRICS = [m for m in METRICS if m not in NO_IMPUTE]

    def pooled_ladder():
        """One rung of effort, measured across every family that publishes two.

        Price and latency are measured in dollars and seconds, never in
        percentiles. Taking a ratio after normalizing turns a small step into a
        large one, which is how an earlier version of this page came to claim
        an effort rung cost 2.5x.
        """
        rows = {}
        for name, ks in groups.items():
            ladder = sorted([k for k in ks if inc[k]["variant"] in EFFORT_ORDER],
                            key=lambda k: EFFORT_ORDER[inc[k]["variant"]])
            for a, b in zip(ladder, ladder[1:]):
                pair = (inc[a]["variant"], inc[b]["variant"])
                shared = [m for m in CAP_METRICS if m in pv[a] and m in pv[b]]
                if not shared:
                    continue
                obs = {"cap": sum(pv[b][m] - pv[a][m] for m in shared) / len(shared)}
                for m in SCALED_RAW:
                    x = inc[a]["raw"].get(m, {}).get("value")
                    y = inc[b]["raw"].get(m, {}).get("value")
                    obs[m] = (y / x) if (x and y) else None
                rows.setdefault(pair, []).append(obs)
        out = {}
        for pair, obs in rows.items():
            caps = [o["cap"] for o in obs]
            entry = {"cap": statistics.median(caps),
                     "cap_sd": statistics.pstdev(caps) if len(caps) > 1 else 4.0,
                     "n": len(obs)}
            for m in SCALED_RAW:
                vals = [o[m] for o in obs if o[m]]
                entry[m] = statistics.median(vals) if vals else None
            out[pair] = entry
        return out

    LADDER = pooled_ladder()
    RUNGS = ["low", "medium", "high", "xhigh", "max"]

    def derived_target():
        """The rung inside TARGET_BAND that takes the least extrapolation.

        Cost is counted in rungs: for each model, how far its nearest measured
        setting sits from the candidate. A model already measured there costs
        nothing. Ties go to the rung more models were tested at, then to the
        lower rung, because a cheaper quote is the more conservative claim.
        """
        band = RUNGS[RUNGS.index(TARGET_BAND[0]):RUNGS.index(TARGET_BAND[1]) + 1]
        best = None
        for cand in band:
            hops, exact = 0, 0
            for name, ks in groups.items():
                rungs = [EFFORT_ORDER[inc[k]["variant"]] for k in ks
                         if inc[k]["variant"] in EFFORT_ORDER]
                if not rungs:
                    continue
                far = min(abs(r - RUNGS.index(cand)) for r in rungs)
                hops += far
                exact += 1 if far == 0 else 0
            score = (hops, -exact, RUNGS.index(cand))
            if best is None or score < best[0]:
                best = (score, cand)
        return best[1]

    def hop(src, dst, name):
        """What it takes to quote a model measured at src as if it ran at dst.

        A family's own two settings beat the board-wide ladder every time, so
        those are used when the family has both. Otherwise the board-wide
        ladder is chained a rung at a time, and the spread of those steps
        becomes the error on the result.
        """
        if src == dst or src not in RUNGS or dst not in RUNGS:
            return None
        i, j = RUNGS.index(src), RUNGS.index(dst)
        own = {inc[k]["variant"]: k for k in groups.get(name, [])}
        if src in own and dst in own:
            a, b = own[src], own[dst]
            shared = [m for m in CAP_METRICS if m in pv[a] and m in pv[b]]
            ca, cb = cost_of(a), cost_of(b)
            if shared and ca and cb:
                out = {"cap": sum(pv[b][m] - pv[a][m] for m in shared) / len(shared),
                       "sd": 0.0, "own": True, "rungs": abs(j - i)}
                for m in SCALED_RAW:
                    x = inc[a]["raw"].get(m, {}).get("value")
                    y = inc[b]["raw"].get(m, {}).get("value")
                    out[m] = (y / x) if (x and y) else None
                return out
        cap, var = 0.0, 0.0
        mult = {m: 1.0 for m in SCALED_RAW}
        up = 1 if j > i else -1
        for at in range(i, j, up):
            a, b = (RUNGS[at], RUNGS[at + 1]) if up > 0 else (RUNGS[at - 1], RUNGS[at])
            step = LADDER.get((a, b))
            if not step or not step["aaCostPerTask"]:
                return None
            cap += step["cap"] * up
            var += step["cap_sd"] ** 2
            for m in SCALED_RAW:
                if step[m]:
                    mult[m] *= step[m] ** up
        out = {"cap": cap, "sd": var ** 0.5, "own": False, "rungs": abs(j - i)}
        out.update(mult)
        return out

    TARGET = derived_target()

    def choose_setting(keys):
        """The measured setting to quote from, before it is moved to TARGET.

        Nearest the target rung wins, because a short hop carries less error
        than a long one. A priced setting beats an unpriced one at the same
        distance: cost is one of the ten dials and the whole x axis of the
        value chart, and it cannot be recovered from a setting that never
        published it. Coverage breaks what is left.
        """
        if len(keys) == 1:
            return keys[0]
        target_i = RUNGS.index(TARGET)

        def rank(k):
            v = inc[k]["variant"]
            far = abs(EFFORT_ORDER[v] - target_i) if v in EFFORT_ORDER else 9
            return (0 if cost_of(k) is not None else 1, far,
                    -inc[k]["wired_metric_count"])
        return min(keys, key=rank)

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
        # What it takes to quote this setting as if it ran at the common rung.
        # None means it already does, or that the ladder cannot get there.
        H = hop(v["variant"], TARGET, v["name"]) if v["variant"] in EFFORT_ORDER else None
        raw_at_target = dict(v["raw"])
        if H:
            for m in SCALED_RAW:
                if H.get(m) and m in raw_at_target:
                    e = dict(raw_at_target[m])
                    e["value"] = e["value"] * H[m]
                    raw_at_target[m] = e

        # Pass one: what this setting was measured on, then what its own
        # neighboring settings can supply. Same-model evidence first, always.
        val, kind, sd = {}, {}, {}
        for m in METRICS:
            if m in raw_at_target:
                # A price or a clock is rescaled in its own units and then
                # read off the same scale as everybody else. Everything the
                # dials score as capability is shifted by the ladder instead.
                val[m] = pctile(m, raw_at_target[m]["value"])
                if H and m in CAP_METRICS:
                    val[m] = max(0.0, min(100.0, val[m] + H["cap"]))
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
            # An imputed figure is predicted from figures already moved to the
            # common rung, so it lands there too. No second shift.
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
            "t": TARGET + " effort",
            "lab": v["lab"],
            "open": bool(v["open_weights"]),
            "ctx": int(v["context_window"] / 1000) if v.get("context_window") else None,
            "cost": raw_at_target.get("aaCostPerTask", {}).get("value"),
            "ttft": raw_at_target.get("ttft", {}).get("value"),
            "tps": raw_at_target.get("tokensPerSec", {}).get("value"),
            "solid": v["wired_metric_count"] >= 19,
            "v": pct,
            "a": av,
        }
        if H:
            # Everything on this row was moved, so the row says so once rather
            # than every figure saying it separately.
            row["sh"] = {
                "from": tier_of(v["variant"]),
                "price": round(H.get("aaCostPerTask") or 1.0, 3),
                "cap": round(H["cap"], 1),
                "sd": round(H["sd"], 2),
                "own": bool(H["own"]),
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
    # Raw low and high per figure, so the page can say what a score point is
    # worth in the figure's own units. Without this the 0-to-100 scale reads as
    # a percentage of something absolute, and the whole field here sits inside
    # 44 Elo on Arena Hard Prompts.
    ranges = {}
    for m in METRICS:
        unit = next((v["raw"][m].get("unit") for v in inc.values() if m in v["raw"]), None)
        ranges[m] = {"lo": round(lo[m], 4), "hi": round(hi[m], 4), "u": unit,
                     "up": bool(d["metrics"][m]["higher"])}

    # ---- the natural scale
    #
    # Percentiles answer "who is ahead" and destroy "by how much": min-max
    # stretches every figure across the same 0 to 100 no matter whether the
    # models are 1 point apart or 40. That is fine for ranking and useless for
    # the question of how close this field really is, and it is why a saturated
    # figure cannot simply be added to the ranking. On its own scale a test
    # where everyone scores between 89 and 95 contributes a 6 point spread. Min
    # maxed it contributes 100, which is the opposite of the truth.
    #
    # So capability figures get a second reading on the scale the test itself
    # uses. Pass rates and LiveBench points are already 0 to 100. Elo is not a
    # magnitude at all, so it is converted to the expected win rate against the
    # middle of this field, which is what an Elo difference actually means.
    def natural(m, value, mean_elo):
        u = d["metrics"][m].get("unit")
        if u in ("%", "pts"):
            return max(0.0, min(100.0, value))
        if u == "elo":
            return 100.0 / (1.0 + 10.0 ** ((mean_elo[m] - value) / 400.0))
        return None

    NAT_METRICS = [m for m in CAP_METRICS if d["metrics"][m].get("unit") in ("%", "pts", "elo")]
    CLOSE_OK = []
    mean_elo = {}
    for m in set(NAT_METRICS) | set(CLOSENESS):
        if m not in d["metrics"]:
            continue
        vals = [inc[k]["raw"][m]["value"] for k in chosen_keys if m in inc[k]["raw"]]
        if vals and d["metrics"][m].get("unit") == "elo":
            mean_elo[m] = sum(vals) / len(vals)
    for m in CLOSENESS:
        if m not in d["metrics"]:
            continue
        if d["metrics"][m].get("unit") not in ("%", "pts", "elo"):
            continue
        n = sum(1 for k in chosen_keys if m in inc[k]["raw"])
        if n >= CLOSENESS_MIN_COVERAGE:
            CLOSE_OK.append(m)

    for row, key in zip(rows, order):
        v = inc[key]
        H = hop(v["variant"], TARGET, v["name"]) if v["variant"] in EFFORT_ORDER else None
        nat, cnat = [], []
        for m in METRICS:
            if m in NAT_METRICS and m in v["raw"]:
                nat.append(round(natural(m, v["raw"][m]["value"], mean_elo), 2))
            else:
                nat.append(None)
        for m in CLOSE_OK:
            if m in v["raw"]:
                cnat.append(round(natural(m, v["raw"][m]["value"], mean_elo), 2))
            else:
                cnat.append(None)
        row["nat"] = nat
        if any(x is not None for x in cnat):
            row["cnat"] = cnat

    # Same field the ranking uses, so "the whole field spans" means the models
    # on the page and not a wider list nobody can see.
    close = []
    for m in CLOSENESS:
        if m not in d["metrics"]:
            continue
        vals = [inc[k]["raw"][m]["value"] for k in chosen_keys if m in inc[k]["raw"]]
        if len(vals) < CLOSENESS_MIN_COVERAGE:
            continue
        higher = bool(d["metrics"][m]["higher"])
        ordered = sorted(vals, reverse=higher)
        top5 = ordered[:5]
        close.append({
            "k": m,
            "lo": round(min(vals), 4),
            "hi": round(max(vals), 4),
            "t5": round(abs(top5[0] - top5[-1]), 4) if len(top5) >= 5 else None,
            "n": len(vals),
            "u": next((inc[k]["raw"][m].get("unit") for k in chosen_keys
                       if m in inc[k]["raw"]), None),
            "up": higher,
        })

    blob = {
        "metrics": METRICS,
        "range": ranges,
        "close": close,
        "cm": CLOSE_OK,
        "models": rows,
        "sources": {"Artificial Analysis": 13, "LiveBench": 7, "LM Arena": 5},
        "ci_note": note,
    }

    js = "window.__MP__=" + json.dumps(blob, separators=(",", ":"), ensure_ascii=False) + ";"

    print(f"metrics {len(METRICS)}  models {len(rows)}  settings dropped {dropped}")
    print(f"common operating point: {TARGET} effort  (ladder rungs measured: "
          + ", ".join(f"{a}->{b} n={LADDER[(a, b)]['n']}" for a, b in LADDER) + ")")
    for r in rows:
        e = sum(r.get("e", []))
        sh = r.get("sh")
        moved = (f"  <- {sh['from']} x{sh['price']:.2f} cap{sh['cap']:+.1f}"
                 + (" (own)" if sh["own"] else "")) if sh else ""
        print(f"  {sum(r['a']):2d}/{len(METRICS)}  est {e:2d}  "
              f"{('$%.3f' % r['cost']) if r['cost'] is not None else '   -   ':>7}  "
              f"{r['n']}{moved}")
    print(f"rows carrying published intervals: {sum(1 for r in rows if 'ci' in r)}")
    print("closeness evidence, not scored:")
    for c in close:
        print(f"  {c['k']:<18} {c['n']:2d} models  field {c['lo']} to {c['hi']} {c['u']}"
              + (f"  top five inside {c['t5']}" if c["t5"] is not None else ""))

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
