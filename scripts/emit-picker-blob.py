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
#
# Corroborated on a second board that measures something else entirely.
# LiveBench publishes Claude 4.5 Opus at low, medium and high effort with
# reasoning on, across four releases. Asking that data what fraction of the
# low-to-high gain is already delivered at medium gives 0.753, 0.764 and 0.788
# in the three releases where the ordering is monotonic, a median of 0.776. The
# curve below answers the same question with 0.687. Two independent boards,
# one a composite of 23 live tasks and the other a set of capability figures,
# agreeing to 13 percent on the shape of the same curve.
#
# The fourth release, 2025-05-30, reads 1.481 because medium outscores high
# there by 1.3 points. Left out of the median as non-monotonic rather than
# smoothed away: it is a real reading and small enough to be noise.
#
# Worth knowing alongside it, from the same rows: turning reasoning on is worth
# more than the entire effort dial. The median gap between thinking and not
# thinking at the same effort label is 10.1 points, against 7.7 for the whole
# low-to-high climb with thinking already on.
POOLED_CURVE = [(0.0, 0.00), (0.1, 0.17), (0.2, 0.33), (0.3, 0.48),
                (0.4, 0.57), (0.5, 0.65), (0.6, 0.72), (0.7, 0.78),
                (0.8, 0.85), (0.9, 0.92), (1.0, 1.00)]

# How wide a full published ladder is, in doublings of price, pooled. A model
# with one published setting is moved along the pooled curve by this much.
#
# This is the best measured constant on the page, not the weakest. It rests on
# 24 adjacent rung steps whose ratios have a median of 1.57 and quartiles of
# 1.46 and 1.71, a spread of 17 percent across the interquartile range. Counting
# families rather than steps undersells it: ten families, but twenty-four
# measurements, and they agree closely.
#
# Reconstructing a price for the fifteen families that publish effort settings
# without prices was tried and does not work. Cost per task is output tokens
# times price per token, and price per token does not move with effort, so a
# rung's cost ratio should be its token ratio, and the board publishes tokens
# per second and both timings. Four forms were tested against the twenty-two
# steps that publish both a price and a timing: tokens per second times total
# response, tokens per second times time to first token, and each timing alone.
# Correlations came out between minus 0.16 and minus 0.07 with median errors of
# 41 to 85 percent. Timing does not predict price on this board. The idea is
# recorded here so it is not tried a third time.
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

# ---------------------------------------------------------------------------
# LM Arena figures are read with Style Control on.
#
# Arena publishes its own correction that removes formatting and length from
# the ranking, and the gap to the plain board says how much of a model's
# standing is presentation. The median model loses 12 points on Overall and 5
# on Creative Writing when it is applied.
#
# Using the corrected numbers is simply better evidence, and it is Arena's own
# correction rather than one invented here. All four boards this page scores
# were read with it on, from data/arena-style-controlled-scores-2026-08-20.md,
# so nothing mixes corrected and uncorrected.
#
# The penalty turns out to be a property of the model and not of the task. A
# model's Overall delta predicts its Creative Writing delta at r = 0.849 across
# 19 models. That refuted the obvious guess, which was that style would matter
# most where writing matters most; it matters most in general chat.
#
# Worth knowing which way the correction cuts: GPT-5.6 Sol loses 28 points on
# Overall, Luna 22, Terra 20, Claude Sonnet 5 19. Claude Opus 5 is the only
# model that gains, 16 at max and 12 at high.
STYLE_CONTROLLED = {
    "claude-fable-5": {"arenaHardPrompts": 1532, "arenaCreativeWriting": 1509, "arenaTextInstructionFollowing": 1512, "arenaLongerQuery": 1522},
    "claude-opus-5-high": {"arenaHardPrompts": 1519, "arenaCreativeWriting": 1474, "arenaTextInstructionFollowing": 1498, "arenaLongerQuery": 1509},
    "claude-opus-5-max": {"arenaHardPrompts": 1512, "arenaCreativeWriting": 1464, "arenaTextInstructionFollowing": 1489, "arenaLongerQuery": 1499},
    "claude-sonnet-5-high": {"arenaHardPrompts": 1491, "arenaCreativeWriting": 1436, "arenaTextInstructionFollowing": 1467, "arenaLongerQuery": 1482},
    "gpt-5.6-sol-xhigh": {"arenaHardPrompts": 1505, "arenaCreativeWriting": 1474, "arenaTextInstructionFollowing": 1483, "arenaLongerQuery": 1492},
    "gpt-5.6-terra-xhigh": {"arenaHardPrompts": 1486, "arenaCreativeWriting": 1421, "arenaTextInstructionFollowing": 1460, "arenaLongerQuery": 1468},
    "gpt-5.6-luna-xhigh": {"arenaHardPrompts": 1472, "arenaCreativeWriting": 1408, "arenaTextInstructionFollowing": 1443, "arenaLongerQuery": 1452},
    "qwen3.8-max": {"arenaHardPrompts": 1507, "arenaCreativeWriting": 1472, "arenaTextInstructionFollowing": 1476, "arenaLongerQuery": 1497},
    "kimi-k3-max": {"arenaHardPrompts": 1518, "arenaCreativeWriting": 1458, "arenaTextInstructionFollowing": 1485, "arenaLongerQuery": 1500},
    "glm-5.3-max": {"arenaHardPrompts": 1502, "arenaCreativeWriting": 1467, "arenaTextInstructionFollowing": 1483, "arenaLongerQuery": 1483},
    "glm-5.2-max": {"arenaHardPrompts": 1488, "arenaCreativeWriting": 1450, "arenaTextInstructionFollowing": 1462, "arenaLongerQuery": 1478},
    "grok-4.5": {"arenaHardPrompts": 1494, "arenaCreativeWriting": 1447, "arenaTextInstructionFollowing": 1465, "arenaLongerQuery": 1485},
    "grok-4.6-high": {"arenaHardPrompts": 1485, "arenaCreativeWriting": 1459, "arenaTextInstructionFollowing": 1458, "arenaLongerQuery": 1480},
    "gemini-3.1-pro-preview": {"arenaHardPrompts": 1507, "arenaCreativeWriting": 1479, "arenaTextInstructionFollowing": 1480, "arenaLongerQuery": 1499},
    "gemini-3.6-flash-high": {"arenaHardPrompts": 1501, "arenaCreativeWriting": 1469, "arenaTextInstructionFollowing": 1475, "arenaLongerQuery": 1486},
    "gemini-3.7-flash-high": {"arenaHardPrompts": 1507, "arenaCreativeWriting": 1493, "arenaTextInstructionFollowing": 1486, "arenaLongerQuery": 1499},
    "muse-spark-1.1": {"arenaHardPrompts": 1510, "arenaCreativeWriting": 1446, "arenaTextInstructionFollowing": 1474, "arenaLongerQuery": 1477},
    "muse-spark-1.2 (xHigh)": {"arenaHardPrompts": 1511, "arenaCreativeWriting": 1451, "arenaTextInstructionFollowing": 1477, "arenaLongerQuery": 1499},
    "deepseek-v4-pro-high-20260813": {"arenaHardPrompts": 1488, "arenaCreativeWriting": 1408, "arenaTextInstructionFollowing": 1461, "arenaLongerQuery": 1480},
}

# Our model names to the slug Arena prints. Only the rows we score.
STYLE_SLUG = {
    ("Claude Fable 5", None): "claude-fable-5",
    ("Claude Opus 5", "high"): "claude-opus-5-high",
    ("Claude Opus 5", "max"): "claude-opus-5-max",
    ("Claude Sonnet 5", None): "claude-sonnet-5-high",
    ("GPT-5.6 Sol", None): "gpt-5.6-sol-xhigh",
    ("GPT-5.6 Terra", None): "gpt-5.6-terra-xhigh",
    ("GPT-5.6 Luna", None): "gpt-5.6-luna-xhigh",
    ("Gemini 3.1 Pro Preview", None): "gemini-3.1-pro-preview",
    ("Gemini 3.6 Flash", None): "gemini-3.6-flash-high",
    ("Gemini 3.7 Flash", None): "gemini-3.7-flash-high",
    ("Grok 4.5", None): "grok-4.5",
    ("Grok 4.6", None): "grok-4.6-high",
    ("Kimi K3", None): "kimi-k3-max",
    ("DeepSeek V4 Pro 0813", None): "deepseek-v4-pro-high-20260813",
    ("GLM-5.2", None): "glm-5.2-max",
    ("GLM-5.3", None): "glm-5.3-max",
    ("Qwen3.8 Max", None): "qwen3.8-max",
    ("Muse Spark 1.1", None): "muse-spark-1.1",
    ("Muse Spark 1.2", None): "muse-spark-1.2 (xHigh)",
}


def style_slug(name, variant):
    """The Arena slug for a row, preferring an exact name and variant match."""
    if (name, variant) in STYLE_SLUG:
        return STYLE_SLUG[(name, variant)]
    return STYLE_SLUG.get((name, None))


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


# ---------------------------------------------------------------------------
# The effort ladder is fit on the whole Artificial Analysis board, not on the
# 21 models that ship here.
#
# data/aa-all-status-2026-08-20.md is that board read with the status filter set
# to All: 610 models, 41 columns, every generation it has ever tested. Fitting
# the ladder on the shipped roster alone gave 10 families with more than one
# effort setting and 4 with a full one. This file has far more, and a ladder fit
# on four families is a ladder fit on Anthropic and OpenAI.
#
# The corpus is used ONLY to fit how effort behaves. It never adds a model to
# the page and never supplies a figure for one. Gains are measured here in the
# board's own units and converted to the page's percentile scale through each
# metric's own span, so the two never mix.
LADDER_CORPUS = ROOT / "data" / "aa-all-status-2026-08-20.md"

CORPUS_COLUMNS = {
    "GDPval-AA v2": "gdpval",
    "AA-AnalystAgent": "aaAnalystAgent",
    "Terminal-Bench Hard": "aaTbHard",
    "Terminal-Bench v2.1": "aaTbv2",
    "tau2-Bench Telecom": "aaTau2Telecom",
    "tau3-Banking": "tau3Banking",
    "AA-LCR": "aaLcr",
    "Omniscience Accuracy": "omniAccuracy",
    "Non-Hallucination Rate": "omniNonHallucination",
    "Humanity's Last Exam": "hle",
    "GPQA Diamond": "aaGpqaDiamond",
    "SciCode": "scicode",
    "IFBench": "aaIfbench",
    "CritPt": "aaCritpt",
    "APEX-Agents-AA": "aaApexAgents",
    "ITBench-AA": "aaItbench",
    "MMMU Pro": "aaMmmuPro",
    "Cost per Task (USD)": "aaCostPerTask",
    "Output Price (USD/1M)": "aaOutputPrice",
    "Median Tokens/s": "tokensPerSec",
    "Latency First Chunk (s)": "ttft",
    "Total Response (s)": "aaTotalResponse",
}


def corpus_number(x):
    """A cell as a number, or None. Blank is '--' on this board."""
    if x is None:
        return None
    x = x.strip()
    if x in ("--", "", "N/A"):
        return None
    x = x.replace("$", "").replace("%", "").replace(",", "").replace("*", "")
    try:
        return float(x)
    except ValueError:
        return None


def load_ladder_corpus_all(_cache={}):
    """Every family with two or more effort settings, priced or not.

    A capability ladder needs two rungs and nothing else. Requiring a price at
    both drops the family count from 25 to 10 and throws away most of the
    evidence about what effort buys.
    """
    if "v" in _cache:
        return _cache["v"]
    _cache["v"] = _load_corpus(require_price=False)
    return _cache["v"]


def load_ladder_corpus():
    """Families on the full board that publish more than one effort setting.

    Returns {family: [{"variant": str, metric: value, ...}]}, sorted cheapest
    first, keeping only families with at least two priced settings, since a
    ladder needs a price axis to sit on.
    """
    return _load_corpus(require_price=True)


def _load_corpus(require_price):
    if not LADDER_CORPUS.exists():
        return {}
    lines = [l for l in LADDER_CORPUS.read_text(encoding="utf-8").splitlines()
             if l.startswith("| ")]
    if len(lines) < 3:
        return {}
    header = [c.strip() for c in lines[0].strip("|").split("|")]
    fams = {}
    for line in lines[2:]:
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) != len(header):
            continue
        row = dict(zip(header, cells))
        variant = row.get("Effort Setting", "").strip()
        if variant not in EFFORT_ORDER_BASE:
            continue
        name = re.sub(
            r"\s*\((?:low|medium|high|xhigh|max|minimal|Non-reasoning[^)]*)\)\s*$",
            "", row.get("Model", "")).strip()
        if not name:
            continue
        rec = {"variant": variant}
        for col, key in CORPUS_COLUMNS.items():
            v = corpus_number(row.get(col))
            if v is not None:
                rec[key] = v
        fams.setdefault(name, []).append(rec)
    out = {}
    for name, recs in fams.items():
        if require_price:
            recs = [r for r in recs if r.get("aaCostPerTask")]
        if len({r["variant"] for r in recs}) < 2:
            continue
        recs.sort(key=lambda r: (r.get("aaCostPerTask") or 0,
                                 EFFORT_ORDER_BASE[r["variant"]]))
        out[name] = recs
    return out


# One ladder, not two. The vocabulary changed and the thing did not.
#
# These boards have called the same control thinking, then reasoning, then
# effort, and they publish a bottom rung under several names: "Non-reasoning",
# "minimal", and on LiveBench a model listed without the word "Thinking" at
# all. Treating that as a separate on-off switch beside the effort dial is
# wrong. It is the bottom of the same ladder, and Artificial Analysis files it
# in the same Effort Setting column as low and medium, which settles it.
#
# Including it takes the corpus from 25 families with two or more settings to
# 28, and from 10 priced to 12. Thirteen families gain a rung, among them
# Claude Sonnet 5, Grok 4.3, GPT-5.5 and all three GPT-5.6 models.
EFFORT_ORDER_BASE = {
    # Explicitly off. Its own floor, below every setting of on, because a model
    # told not to reason is doing a different thing from one reasoning a
    # little. The boards name this state three ways.
    #
    # The depth of that floor is measured, not assumed. It used to sit two rungs
    # below low, which was a guess. LiveBench publishes the same model with
    # reasoning off and reasoning on across ten historical releases, and seven
    # of those pairs name the effort tier on the on side, which is what it takes
    # to place the floor: subtract the low-to-that-tier climb from the pair's gap
    # and what is left is how far below low the off state sits.
    #
    # On LiveBench Overall a full low-to-max climb is worth 17.0 points, median
    # of 10 within-model steps. The seven pairs put the off state 10.0 to 19.7
    # points below low, median 16.1, which is 0.95 of an entire ladder, or 3.79
    # rungs on this 0-to-6 scale. All seven agree in direction. So off belongs
    # near -1.8, not 0, and the old guess understated the floor by about half.
    #
    # 31 further pairs carry a bare "Thinking" label with no tier on the on side.
    # They cannot place the floor and are left out rather than guessed at.
    #
    # No model on the current roster was measured with reasoning off, so this
    # moves nothing on the page today. It is fixed because it is wrong, and it
    # would bite silently the first time a non-reasoning model is ranked.
    "Non-reasoning": -1.8, "Non-reasoning, high": -1.8, "Non-reasoning, Low Effort": -1.8,
    # On, from the lowest setting up. OpenAI calls its lowest "minimal", which
    # is reasoning turned down rather than turned off, so it sits above off.
    "minimal": 1,
    "low": 2, "medium": 3, "high": 4, "xhigh": 5, "max": 6,
}

# The widest a ladder gets, used to normalize a partial climb to a full one.
# Top to bottom, not top to zero: the floor went negative when it was measured,
# and reading only the maximum would quietly shrink every climb that starts from
# reasoning turned off.
LADDER_SPAN = max(EFFORT_ORDER_BASE.values()) - min(EFFORT_ORDER_BASE.values())


# The honest scale.
#
# The 0-to-100 the page has always shown is a percentile across the 21 models on
# it. That makes the bottom model 0 and the top model 100 by construction, no
# matter how close together they actually are, which is how a field that agrees
# to within a couple of points on a benchmark ends up looking 51 points apart.
# It answers "who is ahead here", and it cannot answer "by how much".
#
# So every figure also gets a second reading, against the full published board
# it came from rather than against this page's roster. Artificial Analysis
# publishes 610 models, LiveBench its whole board, and LM Arena a board that
# starts at the models from 2023. Those ranges are real and none of them move
# when the roster changes.
#
# Each source contributes its own metrics on its own full range, which keeps the
# three sources a third each in the same way the ladder fit does, rather than
# letting whichever board has the widest numbers dominate.
ARENA_FULL_RANGE = {
    # Style Control on, the setting these figures are scored at. The floor is a
    # real model: llama-13b and its contemporaries still sit at the bottom of
    # these boards, which is what makes the range worth using as a scale.
    #
    # Hard Prompts and Creative Writing are read off the captured rows
    # themselves, all 393 and 391 of them, in data/arena-text-raw-dumps. The
    # other two are read off each board's own Score Range filter, because no
    # full row capture of them exists at this setting yet. The two that can be
    # checked both ways agree: Creative Writing matches exactly and Hard Prompts
    # differs by one point on the top, which is the filter rounding. That is
    # the evidence for trusting the filter on the remaining two.
    "arenaHardPrompts": (917.0, 1533.0),
    "arenaCreativeWriting": (931.0, 1509.0),
    "arenaTextInstructionFollowing": (908.0, 1514.0),
    "arenaLongerQuery": (1042.0, 1525.0),
    # WebDev is a separate board, captured without Style Control, exactly as the
    # figure it scales is. Wrong together beats wrong apart.
    "webdevArena": (1080.0, 1691.0),
}

LIVEBENCH_COLUMNS = {
    "Coding": "lbCoding", "AgenticCoding": "lbAgenticCoding",
    "Mathematics": "lbMath", "DataAnalysis": "lbDataAnalysis",
    "Language": "lbLanguage", "InstructionFollowing": "lbInstructionFollowing",
    "CostPerSuccessfulTask": "lbCostPerSuccessTask",
}


# Figures that are already a score out of 100, so their honest range is the
# scale the test is marked on and nothing has to be inferred at all. A model
# that gets 55 percent of Humanity's Last Exam right reads 55, not 91 because
# 55 happens to be the best anyone has managed. Every LiveBench category is
# marked the same way.
#
# This is the correction that matters most. Taking these ranges from the models
# on the board instead reproduced the exact fault the honest scale exists to
# remove, one roster deep: LiveBench Language came out 62.5 to 90.7, where 90.7
# is Claude Fable 5's own score, so Fable read 100 on that figure by
# construction. Bigger arbitrary is still arbitrary.
TRUE_SCALE_UNITS = {"%", "pts"}


def full_board_ranges(metric_meta):
    """Per-figure honest range.

    A test marked out of 100 uses 0 to 100. Elo has no zero, so it uses the
    published board, floor included, which still reaches back to the models of
    2023. Prices and clocks have no ceiling either and use the full board.
    """
    out = dict(ARENA_FULL_RANGE)
    for k, meta in metric_meta.items():
        if meta.get("unit") in TRUE_SCALE_UNITS:
            out[k] = (0.0, 100.0)

    if LADDER_CORPUS.exists():
        lines = [l for l in LADDER_CORPUS.read_text(encoding="utf-8").splitlines()
                 if l.startswith("| ")]
        if len(lines) >= 3:
            header = [c.strip() for c in lines[0].strip("|").split("|")]
            acc = {}
            for line in lines[2:]:
                cells = [c.strip() for c in line.strip("|").split("|")]
                if len(cells) != len(header):
                    continue
                row = dict(zip(header, cells))
                for col, key in CORPUS_COLUMNS.items():
                    v = corpus_number(row.get(col))
                    if v is not None:
                        acc.setdefault(key, []).append(v)
            for k, vals in acc.items():
                if k in out:
                    continue
                if len(vals) >= 20 and max(vals) > min(vals):
                    out[k] = (min(vals), max(vals))

    lb = ROOT / "data" / "livebench-2026-08-20.md"
    if lb.exists():
        cols = []
        acc = {}
        for line in lb.read_text(encoding="utf-8").splitlines():
            if line.startswith("# Columns:"):
                cols = [c.strip() for c in line.split(":", 1)[1].split("|")]
                continue
            if not cols or "|" not in line or line.startswith("#"):
                continue
            cells = [c.strip() for c in line.split("|")]
            if len(cells) != len(cols):
                continue
            for col, val in zip(cols, cells):
                key = LIVEBENCH_COLUMNS.get(col)
                if not key:
                    continue
                v = corpus_number(val)
                if v is not None:
                    acc.setdefault(key, []).append(v)
        for k, vals in acc.items():
            if k in out:
                continue
            if len(vals) >= 20 and max(vals) > min(vals):
                out[k] = (min(vals), max(vals))
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

    FULL = full_board_ranges(d["metrics"])

    def unpctile(m, p):
        """Back from this page's percentile to the figure the board printed.

        The honest reading is taken from the raw value rather than recomputed
        from scratch, so that every correction already applied to a figure, the
        move to the common effort rung above all, survives the change of scale
        instead of being silently dropped.
        """
        if not span[m]:
            return lo[m]
        if not d["metrics"][m]["higher"]:
            p = 100.0 - p
        return lo[m] + p / 100.0 * span[m]

    def honest(m, val):
        """0 to 100 against the whole board this figure comes from.

        Clamped, because a roster model can sit outside the captured range when
        the board moved between captures, and a score over 100 would say the
        model beat a scale it is being measured against.
        """
        r = FULL.get(m)
        if not r or r[1] <= r[0]:
            return None
        p = (val - r[0]) / (r[1] - r[0]) * 100.0
        p = max(0.0, min(100.0, p))
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

    # Score the Arena text figures with Style Control on, verified board by board
    # against the live toggle rather than inferred from the page text.
    swapped = 0
    for v in inc.values():
        slug = style_slug(v["name"], v["variant"])
        for m, val in STYLE_CONTROLLED.get(slug or "", {}).items():
            if m in v["raw"]:
                e = dict(v["raw"][m]); e["value"] = float(val)
                e["adjustment"] = "style control"
                v["raw"][m] = e; swapped += 1
    print(f"arena text figures on style control: {swapped}")


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
    # A clock is a floor plus thinking time, and only the thinking part moves.
    #
    # Treating latency as one elasticity was wrong twice over: dropping it
    # ignored a large real effect, and applying a pooled multiplier put GLM-5.2
    # at 0.2 seconds. The reason both failed is that latency is not one
    # quantity. Across the ten families on this board that publish a ladder,
    # the multiplier over a full climb runs from 0.96 to 133.8, and what
    # predicts it is simply how slow the model already is at max effort:
    # log latency ratio against log max-effort latency fits at r = 0.970.
    #
    # That is because every model starts from about the same floor. The
    # cheapest setting of each family reads 0.92, 1.67, 1.78, 1.96, 2.78, 3.07,
    # 3.51 and 4.29 seconds, a median of 1.91, while their max-effort readings
    # run from 0.88 to 223. All of the spread is thinking time.
    #
    # So the clock is modeled as floor plus a thinking budget, and the budget is
    # spent late: fitting the share spent by position f across those families
    # gives f to the power 3.5, with a root mean square error of 0.111. At the
    # target position only about 2.5 percent of a model's thinking budget has
    # been spent.
    #
    # This moves every model, with no exceptions and nothing invented. GPT-5.6
    # Terra has a floor of 1.67 seconds and a budget of 221.8, so it lands at
    # 7.2. GLM-5.2 has a floor of 1.91 and a budget of 0.04, so it lands at
    # 1.91 and barely moves, which is correct: it was never thinking before it
    # answered and there is nothing to take away.
    CLOCK_METRICS = {"ttft", "aaTotalResponse"}
    CLOCK_SHAPE = 3.5
    POOLED_FLOOR = {"ttft": 1.91, "aaTotalResponse": 5.0}

    def clock_share(f):
        return max(f, 0.0) ** CLOCK_SHAPE
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
    def corpus_metric_gain():
        """Per-figure gain over a full climb, fit on the whole board.

        The shipped roster gives at most four families with a usable ladder,
        which is a ladder fit on two labs. The full board gives up to 24 for a
        capability figure, because a capability comparison needs two rungs and
        not a price at each of them.

        Measured in the board's own units and converted to this page's
        percentile scale through each metric's own span, so a raw gain and a
        percentile gain are never added together.

        Gains are per rung of the effort order rather than per step of price,
        since most of these families do not publish a price at every setting.
        """
        corpus = load_ladder_corpus_all()
        out = {}
        for m in CAP_METRICS:
            vals = []
            for name, recs in corpus.items():
                seen = {}
                for r in recs:
                    if m in r:
                        seen[r["variant"]] = r[m]
                if len(seen) < 2:
                    continue
                rungs = sorted(seen, key=lambda v: EFFORT_ORDER_BASE[v])
                lo_v, hi_v = rungs[0], rungs[-1]
                steps = EFFORT_ORDER_BASE[hi_v] - EFFORT_ORDER_BASE[lo_v]
                if steps < 1:
                    continue
                # Normalized to a full climb across the whole ladder.
                vals.append((seen[hi_v] - seen[lo_v]) / steps * LADDER_SPAN)
            if len(vals) >= 4 and span.get(m):
                raw = statistics.median(vals)
                out[m] = {"gain": raw / span[m] * 100.0,
                          "raw": raw,
                          "sd": statistics.pstdev(vals) / span[m] * 100.0,
                          "n": len(vals)}
        return out

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

    # The board-wide fit wins where it has enough families; the shipped-roster
    # fit fills anything it cannot reach, such as the LiveBench and Arena
    # figures the corpus does not carry.
    GAIN = per_metric_gain()
    GAIN.update(corpus_metric_gain())
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

    def clock_at_target(name, metric, f_now, measured):
        """Move a clock for any model, on the floor-plus-thinking model.

        Works for every model on the board, including the ones with a single
        published setting, because it needs only that model's own reading and
        the shared shape. A model whose reading is already at the floor has no
        budget and does not move, which is the whole reason this replaced a
        pooled multiplier.
        """
        if not measured or measured <= 0:
            return None
        floor = POOLED_FLOOR.get(metric)
        own = own_raw_curve(name, metric)
        if own:
            # Its own cheapest reading is a better floor than the pooled one.
            floor = min(2 ** v for _, v in own)
        if floor is None:
            return None
        floor = min(floor, measured)
        spent = clock_share(f_now)
        if spent < 0.02:
            # Measured so near the bottom of the curve that the budget cannot
            # be recovered from it without dividing by almost nothing.
            return None
        budget = (measured - floor) / spent
        return floor + budget * clock_share(TARGET_F)

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
            if Hm and m in CLOCK_METRICS:
                tgt = clock_at_target(v["name"], m, Hm["from_f"], e.get("value"))
                if tgt is not None:
                    e = dict(e)
                    e["value"] = tgt
            elif Hm:
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

        pct, av, ci, est, esd, hpct = [], [], [], [], [], []
        has_ci = False
        n_est = 0
        for m in METRICS:
            if m not in val:
                pct.append(0.0)
                hpct.append(None)
                av.append(0)
                est.append(0)
                esd.append(None)
                ci.append(None)
                continue
            pct.append(round(val[m], 1))
            h = honest(m, unpctile(m, val[m]))
            hpct.append(round(h, 1) if h is not None else None)
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
            "hv": hpct,
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
