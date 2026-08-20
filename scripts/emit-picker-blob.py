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

# LiveBench publishes its seven categories as a roll-up of 23 component tasks,
# and the components are where the bunching shows. The field is spread 51 to 79
# on plot unscrambling and sits on top of itself on connections, which the
# Language average hides completely.
#
# These can never be scored. A component is part of a category already on this
# page, and averaging both counts the same answers twice. As evidence of how
# close the field is they are the best material here, because four dials had no
# saturated figure at all until these arrived.
SUBTASK_FILE = ROOT / "data" / "livebench-extra-2026-08-20.md"
SUBTASK_PICKS = {
    "Language": ["connections", "plot unscrambling"],
    "Data Analysis": ["table reformat", "consecutive events"],
    "Instruction Following": ["simplify", "paraphrase"],
    "Agentic Coding": ["javascript", "typescript"],
    "Coding": ["code completion"],
    "Reasoning": ["zebra puzzle", "spatial"],
}
# LiveBench's model strings carry the effort setting; ours do not. Mapped by
# hand from the strings the board actually prints, never by fuzzy matching.
SUBTASK_MODEL_MAP = {
    "Claude Fable 5 Max Effort": "Claude Fable 5",
    "Claude 5 Opus Thinking Max Effort": "Claude Opus 5",
    "Claude Sonnet 5 xHigh Effort": "Claude Sonnet 5",
    "GPT-5.6 Sol Max Effort": "GPT-5.6 Sol",
    "GPT-5.6 Terra Max Effort": "GPT-5.6 Terra",
    "GPT-5.6 Luna Max Effort": "GPT-5.6 Luna",
    "Gemini 3.1 Pro Preview High": "Gemini 3.1 Pro Preview",
    "Gemini 3.6 Flash High": "Gemini 3.6 Flash",
    "Gemini 3.7 Flash High": "Gemini 3.7 Flash",
    "Grok 4.5": "Grok 4.5",
    "Grok 4.6": "Grok 4.6",
    "Kimi K3": "Kimi K3",
    "DeepSeek V4 Pro 0813": "DeepSeek V4 Pro 0813",
    "DeepSeek V4 Flash 0731": "DeepSeek V4 Flash 0731",
    "GLM-5.2": "GLM-5.2",
    "Qwen 3.8 Max": "Qwen3.8 Max",
    "Qwen3.8 27B": "Qwen3.8 27B",
    "Muse Spark 1.1 xHigh Effort": "Muse Spark 1.1",
    "Muse Spark 1.2 xHigh Effort": "Muse Spark 1.2",
}


def subtask_closeness(shipped_names):
    """LiveBench component scores, read for the models that ship here."""
    if not SUBTASK_FILE.exists():
        return []
    text = SUBTASK_FILE.read_text(encoding="utf-8")
    out = []
    for chunk in re.split(r"\n## ", text):
        head = chunk.split("\n", 1)[0].strip()
        m = re.match(r"(.+?)\s+subtasks", head)
        if not m or m.group(1).strip() not in SUBTASK_PICKS:
            continue
        cat = m.group(1).strip()
        lines = [l for l in chunk.splitlines() if l.strip().startswith("|")]
        if len(lines) < 3:
            continue
        hdr = [c.strip() for c in lines[0].strip("|").split("|")]
        cols = {h: [] for h in hdr[1:]}
        for line in lines[2:]:
            cells = [c.strip() for c in line.strip("|").split("|")]
            if len(cells) != len(hdr):
                continue
            ours = SUBTASK_MODEL_MAP.get(cells[0])
            if not ours or ours not in shipped_names:
                continue
            for h, v in zip(hdr[1:], cells[1:]):
                try:
                    cols[h].append(float(re.sub(r"[^0-9.\-]", "", v)))
                except ValueError:
                    pass
        for name in SUBTASK_PICKS[cat]:
            vals = cols.get(name)
            if not vals or len(vals) < CLOSENESS_MIN_COVERAGE:
                continue
            ordered = sorted(vals, reverse=True)
            out.append({
                "k": "lbSub:" + name,
                "cat": cat,
                "lo": round(min(vals), 2),
                "hi": round(max(vals), 2),
                "t5": round(ordered[0] - ordered[4], 2) if len(ordered) >= 5 else None,
                "n": len(vals),
                "u": "pts",
                "up": True,
            })
    return out

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

# Every model is quoted at the same point on its own effort curve.
#
# Not at the same labeled setting. The labels are not comparable and the data
# says so plainly. Measured as a fraction along each model's own log-price
# ladder, where 0 is its cheapest published setting and 1 its dearest, the word
# "high" lands at:
#
#   GPT-5.6 Terra      0.00   its cheapest setting
#   GPT-5.6 Sol        0.52
#   Claude Opus 5      0.62
#   Gemini 3.7 Flash   1.00   its dearest setting
#
# The same word spans the whole ladder. Quoting everything at "high" puts one
# model at the bottom of its curve and another at the top and calls that a fair
# comparison. It is the same mistake as comparing one lab's max against
# another's medium, moved up one level.
#
# So the target is a position, and every model is interpolated to it along its
# own curve. Where that position sits is derived, not chosen. Pooling the
# families that publish three or more settings and reading marginal capability
# per doubling of price along the normalized curve:
#
#   f 0.0 to 0.3    30.2, 19.4, 18.2 points per doubling
#   f 0.3 to 0.5    11.9, 11.9
#   f 0.5 to 1.0    10.3, 9.8, 9.8, 9.8, 9.8
#
# Marginal return falls by a third between 0.3 and 0.4 and is flat across the
# entire top half. That break is the knee, and buying past it is paying for a
# curve that has stopped rising. TARGET_F is placed there.
#
# For scale, the capability curve is steeply concave: Claude Opus 5 collects
# 70 percent of everything max effort buys it within the first 30 percent of
# its price span.
TARGET_F = 0.35

# Where each label falls on its own model's price span, pooled across the
# families that publish a full ladder. Used only to place a model that
# publishes a single setting, which has no curve of its own to interpolate on.
# The spread behind these is wide, which is the whole point of not using them
# as the target.
POOLED_F = {"low": 0.00, "medium": 0.30, "high": 0.57, "xhigh": 0.75, "max": 1.00}

# The pooled curve itself: capability as a fraction of a model's own low-to-max
# gain, at each position. Read off the same families.
POOLED_CURVE = [(0.0, 0.00), (0.1, 0.17), (0.2, 0.33), (0.3, 0.48),
                (0.4, 0.57), (0.5, 0.65), (0.6, 0.72), (0.7, 0.78),
                (0.8, 0.85), (0.9, 0.92), (1.0, 1.00)]

# How wide a full low-to-max ladder is, in doublings of price, pooled. A model
# with one published setting is moved along the pooled curve by this much.
POOLED_LADDER_DOUBLINGS = 1.97

# How many percentile points a full low-to-max climb buys, pooled. Same use.
POOLED_LADDER_CAP = 26.0

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
# How much an older release of a rotating benchmark still counts.
#
# LiveBench replaces its questions every six months to stay contamination free,
# which means each release is a harder exam than the last and the same model
# scores lower on it without having changed. Claude 4.5 Opus at medium effort
# reads 75.6 on the 2025-05-30 release and 59.1 on 2026-01-08. Worse, the
# effort ladder itself widens with difficulty: the medium to high gap on that
# model goes from 11.2 points to 16.9 across those releases, and GPT-5.1's
# reasoning-on against reasoning-off gap goes from 20.0 to 29.4.
#
# So effort buys more on harder tasks, and an old release measures a rung that
# no longer exists. The newest three carry the fit; older ones are kept at a
# tenth so they can contradict it but not set it.
RELEASE_DECAY = [1.0, 0.6, 0.35]
RELEASE_TAIL = 0.1

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

# ---------------------------------------------------------------------------
# Tier corrections, from data/tier-audit-2026-08-20.md.
#
# The boards disagree about which effort setting they tested, and a figure has
# to be moved to the common rung from the setting its own board used. The audit
# checked all 21 models across all three sources and reported 147 mis-tiered
# figures. That number is inflated and the corrections below are the part of it
# that survives, because most of what it counted was a board printing no suffix
# at all. Silence is not disagreement. LiveBench prints "Kimi K3" with no
# suffix while Artificial Analysis prints "Kimi K3 (max)"; only one of them made
# a claim, and it is not evidence of a second setting.
#
# What counts is a board printing a DIFFERENT setting than another board.
#
# ARENA_TIER moves the Arena-sourced figures for a model onto the setting Arena
# actually tested, leaving that model's other figures where they were:
#
#   Claude Fable 5         Arena Agent prints "Claude Fable 5 (High)" while
#                          Artificial Analysis and LiveBench both say max.
#   DeepSeek V4 Pro 0813   Arena prints "DeepSeek V4 Pro (High) (0813)" and
#                          "deepseek-v4-pro-high-20260813" against AA's (max).
#   DeepSeek V4 Flash 0731 Arena prints "Deepseek V4 Flash (High) (20260731)"
#                          against AA's (max).
#
# VARIANT_FIX is the other direction: Artificial Analysis prints no setting at
# all for these two, so they were filed with no rung and the ladder could not
# place them. LiveBench and Arena both print High for Gemini 3.6 Flash, and
# LiveBench prints High for Gemini 3.1 Pro Preview. Two boards naming a setting
# beats one board staying silent.
ARENA_METRICS = {
    "arenaHardPrompts", "arenaCreativeWriting", "arenaLongerQuery",
    "arenaTextInstructionFollowing", "webdevArena", "imageToWebdevArena",
    "textArena", "textCoding", "textMath", "textExpert",
    "visionArena", "docArena", "searchArena", "agentArena",
}
ARENA_TIER = {
    "Claude Fable 5": "high",
    "DeepSeek V4 Pro 0813": "high",
    "DeepSeek V4 Flash 0731": "high",
}
VARIANT_FIX = {
    "Gemini 3.6 Flash": "high",
    "Gemini 3.1 Pro Preview": "high",
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

    # Settings whose printed name is not a rung but which are one.
    #
    # Artificial Analysis charts Claude Fable 5 as "(with fallback)". Its own
    # prose on the same page calls the same model "Claude Fable 5 (Adaptive
    # Reasoning, Max Effort, Opus 4.8 Fallback)". So it is max effort with a
    # fallback attached, and the leaderboard label just leaves the effort out.
    # Left unmapped it matched no rung, the ladder could not move it, and the
    # top-ranked model on the page was the one model quoted at max effort while
    # every other row had been brought down to the common rung. That is the
    # worst possible place for this bug to land.
    EFFORT_ALIAS = {"with fallback": "max"}

    def rung(variant):
        if variant in EFFORT_ORDER:
            return variant
        return EFFORT_ALIAS.get(variant)

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
    # Everything effort moves directly, each by its own elasticity.
    #
    # An earlier version left the clock out, on the grounds that chaining
    # rung-to-rung latency ratios was too unstable. That was the wrong fix for
    # a real problem: it treated the single most elastic quantity on the whole
    # ladder as though effort did not touch it, and left rows showing a
    # normalized price beside a max-effort clock. Claude Fable 5 read $1.29 a
    # task next to 141 seconds to first token.
    #
    # Measured over a full low-to-max climb across the families with complete
    # ladders, the median multipliers are:
    #
    #   capability          +29.7 points, on a field spanning about 35
    #   cost per task        x3.9
    #   total response time  x11.7
    #   time to first token  x35.6
    #
    # The clock runs away nine times faster than price and price already
    # outruns capability. That is the asymmetry this whole page exists to show,
    # so it is measured rather than dropped.
    #
    # It is noisier than price: across families the full-span latency ratio runs
    # 13.3, 15.2, 56.1, 74.3, against 2.3 to 5.4 for price. Wide, but the
    # direction and the order of magnitude are not in doubt in any family, and
    # an interval carries that.
    #
    # Output price per token is deliberately absent: effort changes how many
    # tokens a model spends, never what one costs. Throughput is absent too,
    # measured at 1.02 across a full climb.
    SCALED_RAW = ["aaCostPerTask", "lbCostPerSuccessTask", "ttft", "aaTotalResponse"]

    # Full-span multiplier per figure, low to max, pooled across families.
    # A move of df along the curve multiplies by ELASTICITY ** df.
    CLOCK_METRICS = {"ttft", "aaTotalResponse"}
    ELASTICITY = {
        "aaCostPerTask": 3.92,
        "lbCostPerSuccessTask": 3.92,
        "ttft": 35.6,
        "aaTotalResponse": 11.7,
    }

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
                obs = {"cap": sum(pv[b][m] - pv[a][m] for m in shared) / len(shared),
                       "src": "aa"}
                for m in SCALED_RAW:
                    x = inc[a]["raw"].get(m, {}).get("value")
                    y = inc[b]["raw"].get(m, {}).get("value")
                    obs[m] = (y / x) if (x and y) else None
                rows.setdefault(pair, []).append(obs)
        # Pooled by source, then averaged across sources equally.
        #
        # Not a flat average over every observation. The boards do not sample
        # independently: LiveBench republishes the same model across five
        # releases, so a flat pool counts that model five times and lets
        # whichever board publishes most often set the ladder for all of them.
        # Each source gets a third of the say regardless of how much it prints.
        #
        # Every observation here currently carries source "aa", because the
        # ladder is fit from data/picker-data.json alone. The grouping is in
        # place so the LiveBench and Arena ladders drop straight in.
        out = {}
        for pair, obs in rows.items():
            by_src = {}
            for o in obs:
                by_src.setdefault(o.get("src", "aa"), []).append(o)

            def across_sources(pick):
                """One number per source, then averaged across sources equally.

                Inside a source, observations are grouped by the release they
                came from, each release reduced to a median across families,
                and the releases combined by recency. A benchmark that rotates
                its questions gets harder each time, so an old release is
                measuring a different thing and should not carry the same
                weight as the one running now. The newest three carry almost
                all of it and anything older is kept only as a sanity check.
                """
                per = []
                for src_obs in by_src.values():
                    by_rel = {}
                    for ob in src_obs:
                        v = pick(ob)
                        if v is not None:
                            by_rel.setdefault(ob.get("rel", ""), []).append(v)
                    if not by_rel:
                        continue
                    # Newest first. Releases are ISO dates, so a plain reverse
                    # sort is chronological, and the empty string used when a
                    # source publishes no release date sorts last on its own.
                    rels = sorted(by_rel, reverse=True)
                    num = den = 0.0
                    for i, r in enumerate(rels):
                        w = RELEASE_DECAY[i] if i < len(RELEASE_DECAY) else RELEASE_TAIL
                        num += w * statistics.median(by_rel[r])
                        den += w
                    per.append(num / den)
                return per

            caps = across_sources(lambda o: o["cap"])
            if not caps:
                continue
            # Spread is taken over the raw observations, not over the three
            # source medians. Three numbers cannot describe a spread, and
            # understating this error is what the simulation would inherit.
            raw_caps = [o["cap"] for o in obs]
            entry = {"cap": sum(caps) / len(caps),
                     "cap_sd": statistics.pstdev(raw_caps) if len(raw_caps) > 1 else 4.0,
                     "n": len(obs),
                     "sources": sorted(by_src)}
            for m in SCALED_RAW:
                per = across_sources(lambda o, _m=m: o[_m])
                entry[m] = (sum(per) / len(per)) if per else None
            out[pair] = entry
        return out

    LADDER = pooled_ladder()
    RUNGS = ["low", "medium", "high", "xhigh", "max"]

    RUNG_LIST = ["low", "medium", "high", "xhigh", "max"]

    # How much a full climb buys, PER FIGURE, rather than one number for all.
    #
    # Applying a single shift to every capability figure is wrong and the data
    # says how wrong. Measured across the families that publish a full ladder,
    # a low-to-max climb buys 71.9 percentile points on Terminal-Bench v2.1 and
    # 2.2 on the non-hallucination rate. Effort transforms agentic coding and
    # does almost nothing for whether a model makes things up. The pooled
    # number is 23.3, so using it understates Terminal-Bench by 48 points and
    # overstates hallucination resistance by 21.
    #
    # Some figures also move the wrong way for some models. Claude Opus 5 loses
    # 10 points of long-context reasoning climbing to max effort while GPT-5.6
    # Sol gains 70 on the same figure. That is why a model with its own ladder
    # is read off its own curve figure by figure, and the table below is only
    # for models that have no ladder to read.
    def per_metric_gain():
        out = {}
        for m in CAP_METRICS:
            vals = []
            for name, ks in groups.items():
                ladder = [k for k in ks
                          if inc[k]["variant"] in EFFORT_ORDER and cost_of(k)]
                if len(ladder) < 3:
                    continue
                ladder.sort(key=lambda k: math.log2(cost_of(k)))
                a, b = ladder[0], ladder[-1]
                if m in pv[a] and m in pv[b]:
                    vals.append(pv[b][m] - pv[a][m])
            if len(vals) >= 3:
                out[m] = {"gain": statistics.median(vals),
                          "sd": statistics.pstdev(vals),
                          "n": len(vals)}
        return out

    GAIN = per_metric_gain()
    GAIN_REF = statistics.median([g["gain"] for g in GAIN.values()]) if GAIN else 1.0

    def own_raw_curve(name, metric):
        """One model's own readings of a priced or timed figure across its ladder."""
        curve = own_curve(name)
        if not curve:
            return None
        by_var = {}
        for k in groups.get(name, []):
            var = inc[k]["variant"]
            val = inc[k]["raw"].get(metric, {}).get("value")
            if var in EFFORT_ORDER and val and val > 0:
                by_var[var] = math.log2(val)
        pts = [(c[0], by_var[c[3]]) for c in curve if c[3] in by_var]
        return pts if len(pts) >= 2 else None

    def raw_factor(name, metric, f_now):
        """What moving to TARGET_F does to one priced or timed figure.

        The model's own readings first, which is a real measurement of that
        model's own curve. The pooled elasticity only when it has none.
        """
        own = own_raw_curve(name, metric)
        if own:
            a = interp([(f, v, 0, None) for f, v in own], f_now, 1)
            b = interp([(f, v, 0, None) for f, v in own], TARGET_F, 1)
            return 2 ** (b - a)
        e = ELASTICITY.get(metric)
        if not e:
            return None
        if metric in CLOCK_METRICS:
            # The pooled clock elasticity does not transfer and the data says so
            # plainly. It is fit on families whose max-effort latency runs 65 to
            # 223 seconds, where nearly all of the wait is the model thinking
            # before it says anything. GLM-5.2 answers in 1.95 seconds at max
            # effort and DeepSeek V4 Flash in 1.17: those models are streaming
            # immediately and have no thinking time to take away. Applying x35
            # to them produced 0.2 and 0.1 seconds, which is not a measurement
            # of anything, and is the same failure that got latency dropped from
            # this list once already.
            #
            # So a clock is only moved when the model's own ladder measured it
            # moving. Otherwise the row keeps the time the board recorded and
            # says so, which is wrong in a known direction rather than wrong by
            # an invented factor.
            return None
        return e ** (TARGET_F - f_now)

    def own_curve(name):
        """A model's own ladder: [(f, capability, log2 price)], cheapest first.

        f is the position along that model's own log-price span, 0 at its
        cheapest published setting and 1 at its dearest. None when the model
        publishes fewer than two priced settings, which is when the pooled
        curve has to stand in for it.
        """
        ks = [k for k in groups.get(name, [])
              if inc[k]["variant"] in EFFORT_ORDER and cost_of(k)]
        if len(ks) < 2:
            return None
        core = [m for m in CAP_METRICS if all(m in pv[k] for k in ks)]
        if not core:
            return None
        pts = []
        for k in ks:
            cap = sum(pv[k][m] for m in core) / len(core)
            pts.append((math.log2(cost_of(k)), cap, inc[k]["variant"]))
        pts.sort()
        lo_p, hi_p = pts[0][0], pts[-1][0]
        if hi_p <= lo_p:
            return None
        return [((p - lo_p) / (hi_p - lo_p), c, p, var) for p, c, var in pts]

    def interp(curve, f, idx):
        """Read a curve at position f, straight-line between its measured points."""
        if f <= curve[0][0]:
            return curve[0][idx]
        if f >= curve[-1][0]:
            return curve[-1][idx]
        for i in range(len(curve) - 1):
            x0, x1 = curve[i][0], curve[i + 1][0]
            if x0 <= f <= x1:
                if x1 == x0:
                    return curve[i][idx]
                t = (f - x0) / (x1 - x0)
                return curve[i][idx] + t * (curve[i + 1][idx] - curve[i][idx])
        return curve[-1][idx]

    def pooled_cap_frac(f):
        return interp([(x, y, 0, None) for x, y in POOLED_CURVE], f, 1)

    def own_metric_curve(name, metric):
        """One model's own readings of one figure across its own ladder.

        The most honest thing available: no pooling at all, just that model
        measured on that figure at several prices. Returns [(f, value)] or None.
        """
        curve = own_curve(name)
        if not curve:
            return None
        by_var = {}
        for k in groups.get(name, []):
            if inc[k]["variant"] in EFFORT_ORDER and metric in pv[k]:
                by_var[inc[k]["variant"]] = pv[k][metric]
        pts = [(c[0], by_var[c[3]]) for c in curve if c[3] in by_var]
        return pts if len(pts) >= 2 else None

    def metric_shift(name, metric, f_now, overall):
        """What moving to TARGET_F does to one figure, for one model.

        Three ways down, best first. The model's own readings of this exact
        figure across its own ladder. Failing that, its own overall move scaled
        by how much this figure responds to effort board-wide. Failing that,
        the overall move unscaled.
        """
        own = own_metric_curve(name, metric)
        if own:
            a = interp([(f, v, 0, None) for f, v in own], f_now, 1)
            b = interp([(f, v, 0, None) for f, v in own], TARGET_F, 1)
            return b - a, 0.0
        g = GAIN.get(metric)
        if g and GAIN_REF:
            scale = g["gain"] / GAIN_REF
            # The spread across families on this figure is the error on using
            # a board-wide number for it, carried proportionally.
            return overall["cap"] * scale, abs(overall["cap"]) * (
                g["sd"] / abs(g["gain"]) if g["gain"] else 1.0) * 0.5
        return overall["cap"], 0.0

    def to_target(name, variant):
        """Move a model from the setting it was measured at to TARGET_F.

        Returns the multiplier to apply to its price and the shift to apply to
        its capability figures, plus the error on that shift.

        A model that publishes two or more priced settings is interpolated on
        its own curve, which is the real measurement and carries almost no
        assumption. A model published at one setting only has no curve, so the
        pooled one stands in: its label places it on the shared curve and it
        moves from there. That is a much weaker claim and it carries a much
        wider error.
        """
        if variant not in EFFORT_ORDER:
            return None
        curve = own_curve(name)
        if curve:
            f_now = next((c[0] for c in curve if c[3] == variant), None)
            if f_now is None:
                return None
            if abs(f_now - TARGET_F) < 1e-9:
                return None
            cap_now = interp(curve, f_now, 1)
            cap_tgt = interp(curve, TARGET_F, 1)
            p_now = interp(curve, f_now, 2)
            p_tgt = interp(curve, TARGET_F, 2)
            # Error is how far this model's own curve sits from the pooled one
            # over the stretch being crossed. A model whose ladder behaves like
            # everybody else's is a safe interpolation; one that does not is not.
            span = abs(curve[-1][1] - curve[0][1]) or 1.0
            resid = [abs((c[1] - curve[0][1]) / span - pooled_cap_frac(c[0])) for c in curve]
            sd = (sum(r * r for r in resid) / len(resid)) ** 0.5 * span
            return {"price": 2 ** (p_tgt - p_now),
                    "cap": cap_tgt - cap_now,
                    "sd": max(sd, 1.0),
                    "own": True,
                    "from_f": f_now}
        # No curve of its own. Place it by label on the pooled curve.
        f_now = POOLED_F.get(variant)
        if f_now is None:
            return None
        d_frac = pooled_cap_frac(TARGET_F) - pooled_cap_frac(f_now)
        return {"price": 2 ** ((TARGET_F - f_now) * POOLED_LADDER_DOUBLINGS),
                "cap": d_frac * POOLED_LADDER_CAP,
                # The label is the weak link. "high" was measured anywhere from
                # 0.00 to 1.00 of a model's span, so placing a model by its
                # label alone is worth about a third of the ladder in error.
                "sd": 0.30 * POOLED_LADDER_CAP,
                "own": False,
                "from_f": f_now}

    def choose_setting(keys):
        """Which measured setting to quote from, before moving it to TARGET_F.

        The one already nearest the target position, because a short move
        carries less error than a long one. A priced setting beats an unpriced
        one at equal distance: cost is one of the ten dials and the whole x
        axis of the value chart, and it cannot be recovered from a setting that
        never published it. Coverage breaks what is left.
        """
        if len(keys) == 1:
            return keys[0]
        name = inc[keys[0]]["name"]
        curve = own_curve(name)
        f_of = {}
        if curve:
            for c in curve:
                f_of[c[3]] = c[0]

        def rank(k):
            v = inc[k]["variant"]
            f = f_of.get(v, POOLED_F.get(v))
            far = abs(f - TARGET_F) if f is not None else 9
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
        # Each figure moves to the common rung from the setting its own board
        # tested, not from one setting assumed for the whole row.
        #
        # The boards disagree, and filing every figure under a single tier is
        # simply wrong. Artificial Analysis prints "Claude Fable 5 (with
        # fallback)", LiveBench prints "Claude Fable 5 Max Effort" and LM Arena
        # prints "Claude Fable 5 (High)". Same model, three settings. Before
        # this, a row carried one tier and a figure measured at another was
        # quoted as though it came from that one, which is the error that made
        # a model with no rung in its name escape the normalization entirely.
        #
        # A figure carries its own tier when data/picker-data.json records one
        # for it. Where it does not, the row's variant is the best available
        # answer and is used, which is exactly the old behavior. So this reads
        # correctly against data collected before per-figure tiers existed and
        # sharpens as the audit fills them in.
        def tier_of_figure(m):
            t = v["raw"][m].get("tier")
            if not t and m in ARENA_METRICS:
                t = ARENA_TIER.get(v["name"])
            if not t:
                t = VARIANT_FIX.get(v["name"]) or v["variant"]
            return rung(t)

        def hop_for(m):
            t = tier_of_figure(m)
            return to_target(v["name"], t) if t in EFFORT_ORDER else None

        raw_at_target = {}
        for m, e in v["raw"].items():
            Hm = hop_for(m) if m in SCALED_RAW else None
            if Hm:
                fac = raw_factor(v["name"], m, Hm["from_f"])
                if fac:
                    e = dict(e)
                    e["value"] = e["value"] * fac
            raw_at_target[m] = e

        # The row-level summary still needs one hop to describe. Use the one
        # that moved the cost, since price is what a reader acts on.
        H = hop_for("aaCostPerTask") if "aaCostPerTask" in v["raw"] else None
        base_variant = VARIANT_FIX.get(v["name"]) or v["variant"]
        if H is None and rung(base_variant):
            H = to_target(v["name"], rung(base_variant))

        # Pass one: what this setting was measured on, then what its own
        # neighboring settings can supply. Same-model evidence first, always.
        val, kind, sd = {}, {}, {}
        metric_sd = {}
        src_tiers = {}
        for m in METRICS:
            if m in raw_at_target:
                # A price or a clock is rescaled in its own units and then
                # read off the same scale as everybody else. Everything the
                # dials score as capability is shifted by the ladder instead.
                val[m] = pctile(m, raw_at_target[m]["value"])
                Hm = hop_for(m)
                if Hm and m in CAP_METRICS:
                    # Per figure, not one shift for all of them.
                    dm, dsd = metric_shift(v["name"], m, Hm["from_f"], Hm)
                    val[m] = max(0.0, min(100.0, val[m] + dm))
                    metric_sd[m] = (Hm["sd"] ** 2 + dsd ** 2) ** 0.5
                src_tiers[m] = tier_of_figure(m)
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
                # A measured figure that was moved along the curve carries the
                # error of that move, per figure. It is still a measurement, so
                # it is not marked estimated, but the simulation has to know
                # how far it was carried.
                esd.append(round(metric_sd[m], 2) if m in metric_sd else None)
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
            "t": None,
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
            froms = sorted({t for t in src_tiers.values() if t})
            row["sh"] = {
                "from": " and ".join(tier_of(t) for t in froms) if froms
                        else tier_of(v["variant"]),
                "price": round(H["price"], 3),
                "cap": round(H["cap"], 1),
                "sd": round(H["sd"], 2),
                "own": bool(H["own"]),
                "f": round(H["from_f"], 2),
            }
        if n_est:
            row["e"] = est
        # Emitted whenever any figure carries an error of its own, which now
        # includes measured figures that were moved along the curve, not only
        # the estimated ones.
        if any(x is not None for x in esd):
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
        base_variant = VARIANT_FIX.get(v["name"]) or v["variant"]
        H = to_target(v["name"], rung(base_variant)) if rung(base_variant) else None
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

    close += subtask_closeness({inc[k]["name"] for k in chosen_keys})

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
    print(f"common operating point: f={TARGET_F} along each model's own "
          f"price ladder  (0 = its cheapest setting, 1 = its dearest)")
    for r in rows:
        e = sum(r.get("e", []))
        sh = r.get("sh")
        moved = (f"  <- f={sh['f']:.2f} x{sh['price']:.2f} cap{sh['cap']:+.1f}"
                 + (" own-curve" if sh["own"] else " pooled")) if sh else ""
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
