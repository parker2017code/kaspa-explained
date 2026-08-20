#!/usr/bin/env python3
"""Build data/picker-data.json from raw leaderboard snapshots in data/.

Why this exists: model-picker.html used to embed window.__MP__ with only
percentiles and 0/1 availability flags, no raw benchmark values. When the
roster changed, every percentile silently became a percentile of a field
that might no longer exist, and there was no way to recompute or audit it.
This script makes the blob a build artifact: raw values are parsed from
source files, an explicit alias table resolves model identity across
sources, percentiles are computed fresh from the raw values, and a roster
rule decides inclusion in an auditable, one-line-change way.

Pipeline:
  1. Parse data/aa-2026-08-20.md, data/livebench-2026-08-20.md, and every
     data/arena-*.md file present (glob'd, so sibling deep-pull files that
     land later are picked up automatically).
  2. Resolve each source row's model name to a canonical key via the
     explicit ALIASES table below. Unresolved rows are never dropped
     silently -- they are counted and printed to stderr.
  3. Store every parsed metric as a raw value, tagged with its source and
     unit, under the canonical model.
  4. Compute a 0-100 rank percentile (average-rank tie handling) for each
     WIRED metric, across only the models that end up on the roster.
  5. Apply the roster rule: a model is included only if it has a real
     value on at least MIN_METRICS of the WIRED metrics. Every candidate's
     decision is printed with its count.
  6. Write data/picker-data.json and print a coverage summary.

Python 3 standard library only.
"""
from __future__ import annotations

import glob
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

# ---------------------------------------------------------------------------
# Roster rule. Change MIN_METRICS here to change the cut in one place.
# ---------------------------------------------------------------------------
MIN_METRICS = 10

# ---------------------------------------------------------------------------
# Metric catalog: every metric id this script knows how to parse, with its
# label, unit, direction (True = higher is better, used to invert cost /
# latency / price so percentiles always read "higher percentile = better"),
# and whether it is WIRED (drives percentiles + the roster-inclusion count)
# or raw-only (stored for the record, never invented from).
#
# Wiring decisions and why a metric was left raw-only:
#
# AA (data/aa-2026-08-20.md): the file's own header notes flag GPQA-Diamond,
# AA-LCR, TB-v2.1, CritPt and MMMU-Pro as saturated or too-tight on this
# roster; APEX-Agents, ITBench, IFBench, TB-Hard, AA-AnalystAgent and
# tau2-Telecom as too sparse (<10/22 coverage) to trust. OmniscienceIndex is
# explicitly a composite of Omni-Accuracy + Omni-NonHallucination ("do not
# use alongside both") -- both components are wired, so the composite is
# raw-only to avoid triple-counting the same signal. IntelligenceIndex is
# AA's own headline composite and is saturated on this roster (top-5 within
# 2 points), so it is raw-only too. InputPrice and TotalResponse are
# raw-only because they are near-duplicates (r > 0.95) of OutputPrice/
# CostPerTask and LatencyFirstChunk respectively; CacheHit/CacheWrite are
# too sparse to matter.
#
# LiveBench: Overall and Reasoning are saturated on this roster (top-5 gap
# under 6 points) and stay raw-only. CostPerSuccessfulTask was raw-only
# under an earlier redundancy call (r > 0.9 vs AA's cost metric); as of the
# 2026-08-20 metric-set update it is wired as an independent cost
# cross-check, inverted like the other cost/latency metrics.
#
# Arena (2026-08-20 metric-set update): the five Agent-board signals
# (Confirmed Success, Praise vs Complaint, Steerability, Bash Recovery,
# Tool Hallucination) and the board's own headline "Net Improvement"
# (agentArena) are ALL raw-only, none wired. Reason, per the NOTES section
# of arena-deep-agent-code-2026-08-20.md: the displayed percentage for
# every one of these six is an UNSIGNED MAGNITUDE of a signed/causal-
# adjusted coefficient -- the site shows a green "up"/red "down" arrow and
# a matching CSS color class to carry the sign, neither of which survives
# a plain-text scrape. The data confirms this: tail ranks routinely show
# raw values numerically better than top-ranked models (e.g. Confirmed
# Success rank 50 "Inkling Small" at 17.56% barely trails rank 1's 18.52%
# despite being dead last). Roughly the bottom half of the Agent board is
# actually negative; normalizing the scraped magnitude into a percentile
# would score those models as strong. None of the five signals can be
# rescued by sign-flipping post hoc -- the sign isn't in the text at all.
# Tool Hallucination has a second, independent disqualifier on top of the
# sign problem: 14 of 50 models (ranks 1-14) report the byte-identical
# 1.13-1.14%, and the ± confidence interval does not shrink with the
# 2,196,674-session sample size behind it -- a saturated-metric artifact,
# not real precision. All five signals plus Net Improvement are still
# parsed into raw (never invented, just not scored) so the data survives
# for future reference if Arena ever exposes the sign in scrapable form.
#
# webdevArena is wired (STRONG/DISCRIMINATING per
# arena-overview-2026-08-20.md, excellent roster coverage). imageToWebdevArena
# is wired too: arena-deep-agent-code-2026-08-20.md's NOTES find it has the
# widest top-5 gap (90 Elo) of any board or signal captured, the cleanest
# separation on the whole site. Four Text sub-category boards are wired --
# arenaHardPrompts, arenaCreativeWriting, arenaLongerQuery,
# arenaTextInstructionFollowing -- because arena-deep-text-vision-
# 2026-08-20.md's discrimination-analysis NOTES find their rank1-5 gaps
# clear the CI-overlap bar (4-7 point margins) where Text Overall, Coding,
# Math, and Expert do not (margins of 2 points or an exact CI-sum tie, or
# an outright overlap). textArena (Overall), textCoding, textMath, and
# textExpert are therefore raw-only, alongside docArena, visionArena, and
# searchArena, which fall below this roster's coverage bar or (Vision,
# Document) have top-5 gaps that are exact CI ties.
# ---------------------------------------------------------------------------

METRIC_INFO: dict[str, dict] = {
    # -- Artificial Analysis --
    "aaIntelligence":      {"label": "AA Intelligence Index",        "unit": "index", "higher": True,  "wired": False, "source": "aa"},
    "aaOmniscience":       {"label": "AA Omniscience Index",         "unit": "index", "higher": True,  "wired": False, "source": "aa"},
    "gdpval":              {"label": "GDPval-AA-v2",                 "unit": "%",     "higher": True,  "wired": True,  "source": "aa"},
    "aaAnalystAgent":      {"label": "AA-AnalystAgent",               "unit": "%",     "higher": True,  "wired": False, "source": "aa"},
    "aaTbHard":            {"label": "Terminal-Bench Hard",           "unit": "%",     "higher": True,  "wired": False, "source": "aa"},
    "aaTbv2":              {"label": "Terminal-Bench v2.1",           "unit": "%",     "higher": True,  "wired": False, "source": "aa"},
    "aaTau2Telecom":       {"label": "tau2-Telecom",                  "unit": "%",     "higher": True,  "wired": False, "source": "aa"},
    "tau3Banking":         {"label": "tau3-Banking",                  "unit": "%",     "higher": True,  "wired": True,  "source": "aa"},
    "aaLcr":               {"label": "AA-LCR",                        "unit": "%",     "higher": True,  "wired": False, "source": "aa"},
    "omniAccuracy":        {"label": "Omniscience Accuracy",          "unit": "%",     "higher": True,  "wired": True,  "source": "aa"},
    "omniNonHallucination":{"label": "Omniscience Non-Hallucination", "unit": "%",     "higher": True,  "wired": True,  "source": "aa"},
    "hle":                 {"label": "Humanity's Last Exam",          "unit": "%",     "higher": True,  "wired": True,  "source": "aa"},
    "aaGpqaDiamond":       {"label": "GPQA Diamond",                  "unit": "%",     "higher": True,  "wired": False, "source": "aa"},
    "scicode":             {"label": "SciCode",                       "unit": "%",     "higher": True,  "wired": True,  "source": "aa"},
    "aaIfbench":           {"label": "IFBench",                       "unit": "%",     "higher": True,  "wired": False, "source": "aa"},
    "aaCritpt":            {"label": "CritPt",                        "unit": "%",     "higher": True,  "wired": False, "source": "aa"},
    "aaApexAgents":        {"label": "APEX-Agents",                   "unit": "%",     "higher": True,  "wired": False, "source": "aa"},
    "aaItbench":           {"label": "ITBench",                       "unit": "%",     "higher": True,  "wired": False, "source": "aa"},
    "aaMmmuPro":           {"label": "MMMU-Pro",                      "unit": "%",     "higher": True,  "wired": False, "source": "aa"},
    "aaCostPerTask":       {"label": "AA Cost Per Task",              "unit": "$",     "higher": False, "wired": True,  "source": "aa"},
    "aaInputPrice":        {"label": "AA Input Price",                "unit": "$/Mtok","higher": False, "wired": False, "source": "aa"},
    "aaOutputPrice":       {"label": "AA Output Price",               "unit": "$/Mtok","higher": False, "wired": False, "source": "aa"},
    "aaCacheHit":          {"label": "AA Cache Hit Price",            "unit": "$/Mtok","higher": False, "wired": False, "source": "aa"},
    "aaCacheWrite":        {"label": "AA Cache Write Price",          "unit": "$/Mtok","higher": False, "wired": False, "source": "aa"},
    "tokensPerSec":        {"label": "Median Output Tokens/s",        "unit": "tok/s", "higher": True,  "wired": True,  "source": "aa"},
    "ttft":                {"label": "Latency to First Chunk",        "unit": "s",     "higher": False, "wired": True,  "source": "aa"},
    "aaTotalResponse":     {"label": "AA Total Response Time",        "unit": "s",     "higher": False, "wired": False, "source": "aa"},
    # -- LiveBench --
    "lbOverall":              {"label": "LiveBench Overall",             "unit": "pts", "higher": True, "wired": False, "source": "livebench"},
    "lbReasoning":            {"label": "LiveBench Reasoning",           "unit": "pts", "higher": True, "wired": False, "source": "livebench"},
    "lbCoding":               {"label": "LiveBench Coding",              "unit": "pts", "higher": True, "wired": True,  "source": "livebench"},
    "lbAgenticCoding":        {"label": "LiveBench Agentic Coding",      "unit": "pts", "higher": True, "wired": True,  "source": "livebench"},
    "lbMath":                 {"label": "LiveBench Mathematics",         "unit": "pts", "higher": True, "wired": True,  "source": "livebench"},
    "lbDataAnalysis":         {"label": "LiveBench Data Analysis",       "unit": "pts", "higher": True, "wired": True,  "source": "livebench"},
    "lbLanguage":             {"label": "LiveBench Language",            "unit": "pts", "higher": True, "wired": True,  "source": "livebench"},
    "lbInstructionFollowing": {"label": "LiveBench Instruction Following","unit": "pts", "higher": True, "wired": True,  "source": "livebench"},
    "lbCostPerSuccessTask":   {"label": "LiveBench Cost Per Successful Task", "unit": "$", "higher": False, "wired": True,  "source": "livebench"},
    # -- Arena --
    "agentArena":             {"label": "Arena Agent Net Improvement",   "unit": "win%", "higher": True, "wired": False, "source": "arena"},
    "textArena":               {"label": "Arena Text",                   "unit": "elo",  "higher": True, "wired": False, "source": "arena"},
    "textCoding":              {"label": "Arena Text: Coding",           "unit": "elo",  "higher": True, "wired": False, "source": "arena"},
    "textMath":                {"label": "Arena Text: Math",             "unit": "elo",  "higher": True, "wired": False, "source": "arena"},
    "textExpert":              {"label": "Arena Text: Expert",           "unit": "elo",  "higher": True, "wired": False, "source": "arena"},
    "arenaHardPrompts":        {"label": "Arena Text: Hard Prompts",     "unit": "elo",  "higher": True, "wired": True,  "source": "arena"},
    "arenaCreativeWriting":    {"label": "Arena Text: Creative Writing", "unit": "elo",  "higher": True, "wired": True,  "source": "arena"},
    "arenaLongerQuery":        {"label": "Arena Text: Longer Query",     "unit": "elo",  "higher": True, "wired": True,  "source": "arena"},
    "arenaTextInstructionFollowing": {"label": "Arena Text: Instruction Following", "unit": "elo", "higher": True, "wired": True, "source": "arena"},
    "webdevArena":             {"label": "Arena WebDev",                 "unit": "elo",  "higher": True, "wired": True,  "source": "arena"},
    "imageToWebdevArena":      {"label": "Arena Image-to-WebDev",        "unit": "elo",  "higher": True, "wired": True,  "source": "arena"},
    "visionArena":             {"label": "Arena Vision",                 "unit": "elo",  "higher": True, "wired": False, "source": "arena"},
    "docArena":                {"label": "Arena Document",               "unit": "elo",  "higher": True, "wired": False, "source": "arena"},
    "searchArena":             {"label": "Arena Search",                 "unit": "elo",  "higher": True, "wired": False, "source": "arena"},
    "agentConfirmedSuccess":   {"label": "Arena Agent: Confirmed Success","unit": "win%", "higher": True, "wired": False, "source": "arena"},
    "agentPraiseComplaint":    {"label": "Arena Agent: Praise vs Complaint", "unit": "win%", "higher": True, "wired": False, "source": "arena"},
    "agentSteerability":       {"label": "Arena Agent: Steerability",    "unit": "win%", "higher": True,  "wired": False, "source": "arena"},
    "agentBashRecovery":       {"label": "Arena Agent: Bash Recovery",   "unit": "win%", "higher": True,  "wired": False, "source": "arena"},
    "agentToolHallucination":  {"label": "Arena Agent: Tool Hallucination", "unit": "%", "higher": False, "wired": False, "source": "arena"},
}

WIRED_METRICS = [m for m, info in METRIC_INFO.items() if info["wired"]]

# AA columns -> metric id (order matches "Columns in order:" in the file, but
# the parser reads that header line dynamically rather than trusting this
# order, so this dict only needs to map names to ids).
AA_COLUMN_TO_METRIC = {
    "IntelligenceIndex": "aaIntelligence",
    "OmniscienceIndex": "aaOmniscience",
    "GDPval-AA-v2": "gdpval",
    "AA-AnalystAgent": "aaAnalystAgent",
    "TB-Hard": "aaTbHard",
    "TB-v2.1": "aaTbv2",
    "tau2-Telecom": "aaTau2Telecom",
    "tau3-Banking": "tau3Banking",
    "AA-LCR": "aaLcr",
    "Omni-Accuracy": "omniAccuracy",
    "Omni-NonHallucination": "omniNonHallucination",
    "HLE": "hle",
    "GPQA-Diamond": "aaGpqaDiamond",
    "SciCode": "scicode",
    "IFBench": "aaIfbench",
    "CritPt": "aaCritpt",
    "APEX-Agents": "aaApexAgents",
    "ITBench": "aaItbench",
    "MMMU-Pro": "aaMmmuPro",
    "CostPerTask": "aaCostPerTask",
    "InputPrice": "aaInputPrice",
    "OutputPrice": "aaOutputPrice",
    "CacheHit": "aaCacheHit",
    "CacheWrite": "aaCacheWrite",
    "MedianTokS": "tokensPerSec",
    "LatencyFirstChunk": "ttft",
    "TotalResponse": "aaTotalResponse",
}

LIVEBENCH_COLUMN_TO_METRIC = {
    "Overall": "lbOverall",
    "Reasoning": "lbReasoning",
    "Coding": "lbCoding",
    "AgenticCoding": "lbAgenticCoding",
    "Mathematics": "lbMath",
    "DataAnalysis": "lbDataAnalysis",
    "Language": "lbLanguage",
    "InstructionFollowing": "lbInstructionFollowing",
    "CostPerSuccessfulTask": "lbCostPerSuccessTask",
}

# ---------------------------------------------------------------------------
# Alias table. One canonical key per model+effort-tier, with the exact
# strings seen for it in each source. Matching is EXACT (after whitespace
# collapse) -- never fuzzy. A source row whose name is not in this table is
# reported unmatched, never guessed at or dropped silently.
#
# Canonical roster = every row in the AA file (the richest source, 36 rows)
# plus Muse Spark 1.1, which only appears in LiveBench/Arena but is
# obviously the same product family as Muse Spark 1.2 (which does have an
# AA row). Legacy/other-generation models that only show up on Arena boards
# (Claude Opus 4.x, GPT-5.5/5.4/5.2, Gemini 3-pro, muse-spark base, Kimi
# K2.x, seed-2.1-pro, ernie-5.1, grok-4.20, etc.) are deliberately NOT given
# canonical entries: they are a different model generation, have zero AA or
# LiveBench data by construction, and would never clear MIN_METRICS anyway.
# They show up as unmatched Arena rows, which is a scope statement, not an
# alias-table gap -- see the run summary for the breakdown.
#
# Cross-source effort-tier notes (documented per-model below where it's not
# a straight name match):
#   - Grok 4.6 / Grok 4.5: LiveBench and Arena's "generic" board entries
#     don't split by reasoning effort; AA only publishes a "(high)" row for
#     each, so the untiered LiveBench/Arena name is treated as that row.
#   - Gemini 3.1 Pro Preview / Gemini 3.6 Flash: AA publishes one untiered
#     row for each; LiveBench's only entry for each names a "High" effort
#     tier. Since each file has exactly one row for the model with no
#     competing tier to confuse it with, they're aliased 1:1 by elimination.
#     Arena's "-high" suffixed Gemini 3.6 Flash entries are aliased the same
#     way; its untiered "gemini-3.1-pro-preview" rows need no such call.
#   - DeepSeek V4 Pro 0813: Arena's board shows only one 0813-dated Pro
#     entry, labeled "-high-" rather than "-max-"; matched on the shared
#     date stamp since it's the only 0813 entry on the board.
#   - DeepSeek V4 Flash 0731: the WebDev/Text boards only carry an undated
#     "deepseek-v4-flash-high" entry, which arena-2026-08-20.md's own notes
#     explicitly flag as NOT confirmed to be the same as the 0731-dated
#     model -- that one is left unaliased. The Agent board separately
#     publishes a dated "(20260731)" entry, which is aliased.
# ---------------------------------------------------------------------------

ALIASES: dict[str, dict[str, list[str]]] = {
    "claude-opus-5-max": {
        "aa": ["Claude Opus 5 (max)"],
        "livebench": ["Claude 5 Opus Thinking Max Effort"],
        "arena": ["Claude Opus 5 (Max)", "claude-opus-5-max"],
    },
    "claude-opus-5-xhigh": {
        "aa": ["Claude Opus 5 (xhigh)"],
        "livebench": [],
        "arena": ["Claude Opus 5 (xHigh)", "claude-opus-5-xhigh"],
    },
    "claude-opus-5-high": {
        "aa": ["Claude Opus 5 (high)"],
        "livebench": [],
        "arena": ["Claude Opus 5 (High)", "claude-opus-5-high"],
    },
    "claude-opus-5-medium": {
        "aa": ["Claude Opus 5 (medium)"],
        "livebench": [],
        "arena": ["Claude Opus 5 (Medium)", "claude-opus-5-medium"],
    },
    "claude-opus-5-low": {
        "aa": ["Claude Opus 5 (low)"],
        "livebench": [],
        "arena": ["Claude Opus 5 (Low)", "claude-opus-5-low"],
    },
    "claude-fable-5": {
        "aa": ["Claude Fable 5 (with fallback)"],
        "livebench": ["Claude Fable 5 Max Effort"],
        "arena": ["claude-fable-5", "Claude Fable 5 (High)"],
    },
    "gpt-5.6-sol-max": {
        "aa": ["GPT-5.6 Sol (max)"],
        "livebench": ["GPT-5.6 Sol Max Effort"],
        "arena": ["GPT 5.6 Sol (Max)", "gpt-5.6-sol-max"],
    },
    "gpt-5.6-sol-xhigh": {
        "aa": ["GPT-5.6 Sol (xhigh)"],
        "livebench": [],
        "arena": ["GPT 5.6 Sol (xHigh)", "gpt-5.6-sol-xhigh", "gpt-5.6-sol-xhigh (codex-harness)"],
    },
    "gpt-5.6-sol-high": {
        "aa": ["GPT-5.6 Sol (high)"],
        "livebench": [],
        "arena": ["GPT 5.6 Sol (High)", "gpt-5.6-sol-high"],
    },
    "gpt-5.6-sol-medium": {
        "aa": ["GPT-5.6 Sol (medium)"],
        "livebench": [],
        "arena": [],
    },
    "gpt-5.6-sol-low": {
        "aa": ["GPT-5.6 Sol (low)"],
        "livebench": [],
        "arena": [],
    },
    "gpt-5.6-terra-max": {
        "aa": ["GPT-5.6 Terra (max)"],
        "livebench": ["GPT-5.6 Terra Max Effort"],
        "arena": ["GPT 5.6 Terra (Max)", "gpt-5.6-terra-max"],
    },
    "gpt-5.6-terra-xhigh": {
        "aa": ["GPT-5.6 Terra (xhigh)"],
        "livebench": [],
        "arena": ["gpt-5.6-terra-xhigh", "gpt-5.6-terra-xhigh (codex-harness)", "GPT 5.6 Terra (xHigh)"],
    },
    "gpt-5.6-terra-high": {
        "aa": ["GPT-5.6 Terra (high)"],
        "livebench": [],
        "arena": ["gpt-5.6-terra-high"],
    },
    "gpt-5.6-luna-max": {
        "aa": ["GPT-5.6 Luna (max)"],
        "livebench": ["GPT-5.6 Luna Max Effort"],
        "arena": ["GPT 5.6 Luna (Max)", "gpt-5.6-luna-max"],
    },
    "gpt-5.6-luna-xhigh": {
        "aa": ["GPT-5.6 Luna (xhigh)"],
        "livebench": [],
        "arena": ["gpt-5.6-luna-xhigh", "gpt-5.6-luna-xhigh (codex-harness)", "GPT 5.6 Luna (xHigh)"],
    },
    "grok-4.6-high": {
        "aa": ["Grok 4.6 (high)"],
        "livebench": ["Grok 4.6"],
        "arena": ["Grok 4.6 (High)", "grok-4.6-high", "grok-4.6-high (Preliminary)"],
    },
    "grok-4.5-high": {
        "aa": ["Grok 4.5 (high)"],
        "livebench": ["Grok 4.5"],
        "arena": ["Grok 4.5", "grok-4.5"],
    },
    "kimi-k3-max": {
        "aa": ["Kimi K3 (max)"],
        "livebench": ["Kimi K3 [open]"],
        "arena": ["Kimi K3 (Max)", "kimi-k3-max"],
    },
    "kimi-k3-low": {
        "aa": ["Kimi K3 (low)"],
        "livebench": [],
        "arena": [],
    },
    "glm-5.3-max": {
        "aa": ["GLM-5.3 (max)"],
        "livebench": [],
        "arena": ["GLM 5.3 (Max)", "glm-5.3-max"],
    },
    "glm-5.2-max": {
        "aa": ["GLM-5.2 (max)"],
        "livebench": ["GLM-5.2 [open]"],
        "arena": ["GLM 5.2 (Max)", "glm-5.2-max"],
    },
    "qwen3.8-max": {
        "aa": ["Qwen3.8 Max"],
        "livebench": ["Qwen 3.8 Max [open]"],
        "arena": ["qwen3.8-max", "Qwen3.8 Max"],
    },
    "qwen3.8-2.4t-a95b": {
        "aa": ["Qwen3.8 2.4T A95B"],
        "livebench": [],
        "arena": [],
    },
    "qwen3.8-27b": {
        "aa": ["Qwen3.8 27B"],
        "livebench": ["Qwen3.8 27B [open]"],
        "arena": [],
    },
    "gemini-3.7-flash-high": {
        "aa": ["Gemini 3.7 Flash (high)"],
        "livebench": ["Gemini 3.7 Flash High"],
        "arena": ["gemini-3.7-flash-high", "Gemini 3.7 Flash (High)",
                  "gemini-3.7-flash-high (Preliminary)"],
    },
    "gemini-3.7-flash-medium": {
        "aa": ["Gemini 3.7 Flash (medium)"],
        "livebench": [],
        "arena": [],
    },
    "gemini-3.7-flash-low": {
        "aa": ["Gemini 3.7 Flash (low)"],
        "livebench": [],
        "arena": [],
    },
    "gemini-3.6-flash": {
        "aa": ["Gemini 3.6 Flash"],
        "livebench": ["Gemini 3.6 Flash High"],
        "arena": ["gemini-3.6-flash-high", "Gemini 3.6 Flash (High)"],
    },
    "gemini-3.1-pro-preview": {
        "aa": ["Gemini 3.1 Pro Preview"],
        "livebench": ["Gemini 3.1 Pro Preview High"],
        "arena": ["gemini-3.1-pro-preview", "Gemini 3.1 Pro Preview"],
    },
    "deepseek-v4-pro-0813-max": {
        "aa": ["DeepSeek V4 Pro 0813 (max)"],
        "livebench": ["DeepSeek V4 Pro 0813 [open]"],
        "arena": ["deepseek-v4-pro-high-20260813", "DeepSeek V4 Pro (High) (0813)", "DeepSeek V4 Pro (High) 0813"],
    },
    "deepseek-v4-flash-0731-max": {
        "aa": ["DeepSeek V4 Flash 0731 (max)"],
        "livebench": ["DeepSeek V4 Flash 0731 [open]"],
        "arena": ["Deepseek V4 Flash (High) (20260731)", "DeepSeek V4 Flash (High) 20260731"],
    },
    "claude-sonnet-5-max": {
        "aa": ["Claude Sonnet 5 (max)"],
        "livebench": [],
        "arena": [],
    },
    "claude-sonnet-5-xhigh": {
        "aa": ["Claude Sonnet 5 (xhigh)"],
        "livebench": ["Claude Sonnet 5 xHigh Effort"],
        "arena": [],
    },
    "claude-sonnet-5-high": {
        "aa": ["Claude Sonnet 5 (high)"],
        "livebench": [],
        "arena": ["Claude Sonnet 5 (High)", "claude-sonnet-5-high"],
    },
    "muse-spark-1.2-xhigh": {
        "aa": ["Muse Spark 1.2 (xhigh)"],
        "livebench": ["Muse Spark 1.2 xHigh Effort"],
        "arena": ["muse-spark-1.2 (xHigh)"],
    },
    "muse-spark-1.1-xhigh": {
        "aa": [],
        "livebench": ["Muse Spark 1.1 xHigh Effort"],
        "arena": ["muse-spark-1.1", "Muse Spark 1.1"],
    },
}

# Fallback metadata for canonical models with no AA row (their label/lab/
# open-weights/context can't be read from the AA table). Never invented
# beyond what's plainly readable from the LiveBench name itself.
MANUAL_META = {
    "muse-spark-1.1-xhigh": {"label": "Muse Spark 1.1 (xHigh Effort)", "name": "Muse Spark 1.1",
                              "variant": "xhigh", "lab": None, "open_weights": None, "context_window": None},
}

# Reverse index: normalized alias string -> (canonical, source)
_REVERSE: dict[tuple[str, str], str] = {}
for _canon, _srcs in ALIASES.items():
    for _src, _names in _srcs.items():
        for _name in _names:
            _key = (_src, re.sub(r"\s+", " ", _name.strip()))
            if _key in _REVERSE:
                print(f"WARNING: alias collision {_key!r} claimed by both "
                      f"{_REVERSE[_key]!r} and {_canon!r}", file=sys.stderr)
            _REVERSE[_key] = _canon


def resolve(name: str, source: str) -> str | None:
    norm = re.sub(r"\s+", " ", name.strip())
    return _REVERSE.get((source, norm))


# ---------------------------------------------------------------------------
# Value parsing helpers
# ---------------------------------------------------------------------------

def parse_value(raw: str) -> float | None:
    raw = raw.strip()
    if raw in ("", "--", "-", "N/A", "n/a"):
        return None
    try:
        if raw.startswith("$"):
            return float(raw[1:])
        if raw.endswith("%"):
            return float(raw[:-1])
        return float(raw)
    except ValueError:
        print(f"WARNING: could not parse numeric value {raw!r}", file=sys.stderr)
        return None


def parse_ctx(raw: str) -> int | None:
    raw = raw.strip()
    m = re.match(r"^([\d.]+)\s*([MmKk])$", raw)
    if not m:
        return None
    num, unit = float(m.group(1)), m.group(2).lower()
    return int(round(num * (1_000_000 if unit == "m" else 1_000)))


def split_name_variant(raw_name: str) -> tuple[str, str | None]:
    m = re.match(r"^(.*?)\s*\(([^)]*)\)\s*$", raw_name)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    return raw_name.strip(), None


# ---------------------------------------------------------------------------
# Parsers
# ---------------------------------------------------------------------------

def parse_aa(path: Path, unmatched: list[str]) -> dict[str, dict]:
    """Returns canonical -> {"meta": {...}, "raw": {metric_id: value}}."""
    if not path.exists():
        print(f"WARNING: {path.name} not found, skipping AA source", file=sys.stderr)
        return {}
    text = path.read_text()
    lines = text.splitlines()

    # Header: everything between "Columns in order:" and the next blank line.
    try:
        start = next(i for i, l in enumerate(lines) if l.strip() == "Columns in order:") + 1
    except StopIteration:
        print(f"ERROR: {path.name}: no 'Columns in order:' header found, "
              f"cannot parse this file's format", file=sys.stderr)
        return {}
    header_lines = []
    i = start
    while i < len(lines) and lines[i].strip() != "":
        header_lines.append(lines[i])
        i += 1
    columns = [c.strip() for c in " ".join(header_lines).split("|") if c.strip()]
    if not columns or columns[0] != "Model":
        print(f"ERROR: {path.name}: header did not parse as expected "
              f"(got {columns[:3]}...), format may have changed", file=sys.stderr)
        return {}

    out: dict[str, dict] = {}
    i += 1  # skip blank line after header
    while i < len(lines):
        line = lines[i]
        i += 1
        if not line.strip() or line.strip().startswith("#"):
            continue
        fields = [f.strip() for f in line.split("|")]
        if len(fields) != len(columns):
            print(f"WARNING: {path.name}: row has {len(fields)} fields, "
                  f"expected {len(columns)}, skipping: {line[:60]!r}", file=sys.stderr)
            continue
        row = dict(zip(columns, fields))
        raw_name = row["Model"]
        canon = resolve(raw_name, "aa")
        if canon is None:
            unmatched.append(raw_name)
            continue
        name, variant = split_name_variant(raw_name)
        meta = {
            "label": raw_name,
            "name": name,
            "variant": variant,
            "lab": row.get("Creator") or None,
            "open_weights": {"Open": True, "Prop": False}.get(row.get("License"), None),
            "context_window": parse_ctx(row.get("Ctx", "")),
        }
        raw_metrics = {}
        for col, metric_id in AA_COLUMN_TO_METRIC.items():
            if col in row:
                v = parse_value(row[col])
                if v is not None:
                    raw_metrics[metric_id] = {"value": v, "source": "aa", "unit": METRIC_INFO[metric_id]["unit"]}
        out[canon] = {"meta": meta, "raw": raw_metrics}
    return out


def parse_livebench(path: Path, unmatched: list[str]) -> dict[str, dict]:
    if not path.exists():
        print(f"WARNING: {path.name} not found, skipping LiveBench source", file=sys.stderr)
        return {}
    text = path.read_text()
    lines = text.splitlines()

    header = next((l for l in lines if l.strip().startswith("# Columns:")), None)
    if header is None:
        print(f"ERROR: {path.name}: no '# Columns:' header found, "
              f"cannot parse this file's format", file=sys.stderr)
        return {}
    columns = [c.strip() for c in header.split(":", 1)[1].split("|") if c.strip()]
    if not columns or columns[0] != "Model":
        print(f"ERROR: {path.name}: header did not parse as expected "
              f"(got {columns[:3]}...)", file=sys.stderr)
        return {}

    out: dict[str, dict] = {}
    for line in lines:
        if not line.strip() or line.strip().startswith("#"):
            continue
        fields = [f.strip() for f in line.split("|")]
        if len(fields) != len(columns):
            continue  # narrative / footer lines, not data rows
        row = dict(zip(columns, fields))
        raw_name = row["Model"]
        canon = resolve(raw_name, "livebench")
        if canon is None:
            unmatched.append(raw_name)
            continue
        raw_metrics = {}
        for col, metric_id in LIVEBENCH_COLUMN_TO_METRIC.items():
            if col in row:
                v = parse_value(row[col])
                if v is not None:
                    raw_metrics[metric_id] = {"value": v, "source": "livebench", "unit": METRIC_INFO[metric_id]["unit"]}
        out[canon] = {"raw": raw_metrics}
    return out


_BOARD_KEYWORDS = [
    ("SIGNAL 1", "agentConfirmedSuccess"),
    ("SIGNAL 2", "agentPraiseComplaint"),
    ("SIGNAL 3", "agentSteerability"),
    ("SIGNAL 4", "agentBashRecovery"),
    ("SIGNAL 5", "agentToolHallucination"),  # raw-only: see module docstring
    ("HEADLINE", "agentArena"),
    ("IMAGE-TO-WEBDEV", "imageToWebdevArena"),
    ("IMAGE TO WEBDEV", "imageToWebdevArena"),
    ("WEBDEV", "webdevArena"),
]
_BOARD_WORD = {
    "AGENT": "agentArena",
    "TEXT": "textArena",
    "VISION": "visionArena",
    "DOCUMENT": "docArena",
    "SEARCH": "searchArena",
}

# Text Arena sub-category "### " headers inside arena-deep-text-vision-*.md's
# "## A.2 Sub-category SCORES" section. Checked ahead of/independent from
# map_board_name, which only looks at "## " lines. Ordered so multi-word
# keywords are tried before the single words they could otherwise collide
# with (none currently collide, but keep the order deliberate).
_TEXT_SUBCAT_KEYWORDS = [
    ("INSTRUCTION FOLLOWING", "arenaTextInstructionFollowing"),
    ("CREATIVE WRITING", "arenaCreativeWriting"),
    ("HARD PROMPTS", "arenaHardPrompts"),
    ("LONGER QUERY", "arenaLongerQuery"),
    ("CODING", "textCoding"),
    ("MATH", "textMath"),
    ("EXPERT", "textExpert"),
]


def map_board_name(header_text: str) -> str | None:
    upper = header_text.upper()
    for kw, metric_id in _BOARD_KEYWORDS:
        if kw in upper:
            return metric_id
    for word, metric_id in _BOARD_WORD.items():
        if re.search(rf"\b{word}\b", upper):
            return metric_id
    return None


def map_text_subcat_name(header_text: str) -> str | None:
    upper = header_text.upper()
    for kw, metric_id in _TEXT_SUBCAT_KEYWORDS:
        if kw in upper:
            return metric_id
    return None


_TABLE_ROW = re.compile(r"^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(-?\d+(?:\.\d+)?)%?\s*\|")
_COMPACT_SEGMENT = re.compile(
    r"^\s*\d+\s+(.+?)\s+(-?\d+(?:\.\d+)?)\s*%?\s*"
    r"(?:±\s*\d+(?:\.\d+)?%?|[+\-]\d+(?:\.\d+)?/[+\-]\d+(?:\.\d+)?%?)?\s*$"
)


def parse_arena_file(path: Path, unmatched: list[str]) -> dict[str, list[tuple[str, str, float]]]:
    """Returns canonical -> [(metric_id, value, raw_name), ...] for one file.

    Handles two known layouts per line, auto-detected: markdown pipe tables
    (`| N | Model | Score | CI |`) and the compact "N Name Score +/-CI" form,
    optionally several per line joined with "|". Section headers are any
    line starting with "## "; a "### " line (used by arena-deep-text-vision
    for the Text sub-category tables) is checked against a separate
    keyword table and overrides the enclosing "## " section for the rows
    that follow it. A line/segment that matches neither table shape is
    silently skipped (narrative text, notes, separators) -- this is
    deliberate: those lines carry no score to invent.
    """
    text = path.read_text()
    lines = text.splitlines()
    current_metric: str | None = None
    hits: list[tuple[str, str, float]] = []
    any_row_attempted = False

    for line in lines:
        if line.startswith("### "):
            current_metric = map_text_subcat_name(line)
            continue
        if line.startswith("## "):
            current_metric = map_board_name(line)
            continue
        if current_metric is None:
            continue
        m = _TABLE_ROW.match(line)
        if m:
            any_row_attempted = True
            name, score = m.group(2).strip(), float(m.group(3))
            hits.append((current_metric, name, score))
            continue
        for segment in line.split("|"):
            m = _COMPACT_SEGMENT.match(segment)
            if m:
                any_row_attempted = True
                name, score = m.group(1).strip(), float(m.group(2))
                hits.append((current_metric, name, score))

    if not any_row_attempted:
        print(f"WARNING: {path.name}: no board rows recognized in either "
              f"the markdown-table or compact line format -- format may "
              f"have defeated the parser, file skipped", file=sys.stderr)
        return {}

    out: dict[str, list[tuple[str, str, float]]] = {}
    for metric_id, raw_name, value in hits:
        if metric_id is None:
            continue
        canon = resolve(raw_name, "arena")
        if canon is None:
            unmatched.append(f"{raw_name} [{metric_id}] ({path.name})")
            continue
        out.setdefault(canon, []).append((metric_id, value, raw_name))
    return out


# ---------------------------------------------------------------------------
# Percentiles
# ---------------------------------------------------------------------------

def compute_percentiles(values: dict[str, float], higher_is_better: bool) -> dict[str, float]:
    n = len(values)
    if n == 0:
        return {}
    if n == 1:
        only = next(iter(values))
        return {only: 100.0}
    ordered = sorted(values.items(), key=lambda kv: kv[1] if higher_is_better else -kv[1])
    result: dict[str, float] = {}
    i = 0
    while i < n:
        j = i
        while j + 1 < n and ordered[j + 1][1] == ordered[i][1]:
            j += 1
        avg_rank = (i + j) / 2
        pct = round(avg_rank / (n - 1) * 100, 2)
        for k in range(i, j + 1):
            result[ordered[k][0]] = pct
        i = j + 1
    return result


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    unmatched: dict[str, list[str]] = {"aa": [], "livebench": [], "arena": []}
    parser_failures: list[str] = []

    aa_data = parse_aa(DATA / "aa-2026-08-20.md", unmatched["aa"])
    lb_data = parse_livebench(DATA / "livebench-2026-08-20.md", unmatched["livebench"])

    arena_files = sorted(glob.glob(str(DATA / "arena-*.md")))
    models: dict[str, dict] = {}

    for canon, rec in aa_data.items():
        models.setdefault(canon, {"meta": rec["meta"], "raw": {}})["raw"].update(rec["raw"])
        models[canon]["meta"] = rec["meta"]

    for canon, rec in lb_data.items():
        entry = models.setdefault(canon, {"meta": None, "raw": {}})
        entry["raw"].update(rec["raw"])

    for f in arena_files:
        path = Path(f)
        try:
            file_hits = parse_arena_file(path, unmatched["arena"])
        except Exception as exc:  # defensive: never let one bad file kill the run
            print(f"WARNING: {path.name}: parser raised {exc!r}, file skipped", file=sys.stderr)
            parser_failures.append(path.name)
            continue
        for canon, entries in file_hits.items():
            target = models.setdefault(canon, {"meta": None, "raw": {}})
            for metric_id, value, raw_name in entries:
                existing = target["raw"].get(metric_id)
                if existing is not None and existing["value"] != value:
                    print(f"WARNING: conflicting values for {canon}/{metric_id}: "
                          f"{existing['value']} (kept) vs {value} (from {path.name})", file=sys.stderr)
                    continue
                target["raw"][metric_id] = {"value": value, "source": "arena", "unit": METRIC_INFO[metric_id]["unit"]}

    # Fill in fallback metadata for canonical models with no AA row.
    for canon, entry in models.items():
        if entry["meta"] is None:
            entry["meta"] = MANUAL_META.get(canon, {
                "label": canon, "name": canon, "variant": None,
                "lab": None, "open_weights": None, "context_window": None,
            })

    # Roster rule.
    counts = {
        canon: sum(1 for m in WIRED_METRICS if m in entry["raw"])
        for canon, entry in models.items()
    }
    included = {c for c, n in counts.items() if n >= MIN_METRICS}

    # Percentiles: computed per wired metric, across included models only.
    percentiles: dict[str, dict[str, float]] = {}
    for metric_id in WIRED_METRICS:
        higher = METRIC_INFO[metric_id]["higher"]
        vals = {
            c: models[c]["raw"][metric_id]["value"]
            for c in included
            if metric_id in models[c]["raw"]
        }
        percentiles[metric_id] = compute_percentiles(vals, higher)

    # -------------------------- assemble output --------------------------
    out_models = {}
    for canon in sorted(models):
        entry = models[canon]
        out_models[canon] = {
            **entry["meta"],
            "included": canon in included,
            "wired_metric_count": counts[canon],
            "raw": {mid: v for mid, v in sorted(entry["raw"].items())},
            "percentile": {
                mid: percentiles[mid][canon]
                for mid in WIRED_METRICS
                if canon in percentiles.get(mid, {})
            } if canon in included else {},
        }

    payload = {
        "generated": "2026-08-20",
        "min_metrics": MIN_METRICS,
        "wired_metric_count": len(WIRED_METRICS),
        "metrics": METRIC_INFO,
        "wired_metrics": WIRED_METRICS,
        "models": out_models,
        "unmatched": unmatched,
        "parser_failures": parser_failures,
    }

    out_path = DATA / "picker-data.json"
    out_path.write_text(json.dumps(payload, indent=2, sort_keys=False) + "\n")

    # -------------------------- summary --------------------------
    print(f"\n=== Roster decisions (MIN_METRICS={MIN_METRICS} of {len(WIRED_METRICS)} wired) ===")
    for canon, n in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0])):
        decision = "INCLUDE" if canon in included else "EXCLUDE"
        reason = "" if canon in included else f" (needs {MIN_METRICS}, has {n})"
        print(f"  {decision:8s} {canon:32s} {n:2d}/{len(WIRED_METRICS)}{reason}")

    print(f"\n=== Summary ===")
    print(f"Canonical models known: {len(ALIASES)}")
    print(f"Models with any raw data: {len(models)}")
    print(f"Models on roster (included): {len(included)}")
    print(f"Models excluded (thin data): {len(models) - len(included)}")

    print(f"\nMetrics by source:")
    print(f"  AA: {sum(1 for m in METRIC_INFO.values() if m['source'] == 'aa')} metrics "
          f"({sum(1 for m in METRIC_INFO.values() if m['source'] == 'aa' and m['wired'])} wired)")
    print(f"  LiveBench: {sum(1 for m in METRIC_INFO.values() if m['source'] == 'livebench')} metrics "
          f"({sum(1 for m in METRIC_INFO.values() if m['source'] == 'livebench' and m['wired'])} wired)")
    print(f"  Arena: {sum(1 for m in METRIC_INFO.values() if m['source'] == 'arena')} metrics "
          f"({sum(1 for m in METRIC_INFO.values() if m['source'] == 'arena' and m['wired'])} wired)")

    print(f"\nPer-metric coverage (wired metrics, models with data / roster size):")
    for mid in WIRED_METRICS:
        n_with = sum(1 for c in included if mid in models[c]["raw"])
        print(f"  {mid:24s} {n_with:2d}/{len(included)}")

    print(f"\nUnmatched rows per source (never dropped silently, listed here):")
    for src in ("aa", "livebench", "arena"):
        print(f"  {src}: {len(unmatched[src])}")
    for src in ("aa", "livebench", "arena"):
        if unmatched[src]:
            print(f"\n  -- unmatched [{src}] --", file=sys.stderr)
            for name in unmatched[src]:
                print(f"    {name}", file=sys.stderr)

    if parser_failures:
        print(f"\nFiles whose format defeated the parser: {parser_failures}")
    else:
        print(f"\nAll {len(arena_files)} arena-*.md files present parsed without a format failure.")

    print(f"\nWrote {out_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
