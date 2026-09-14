# Cross-leaderboard model ranking: complete methods and results

Snapshot date: August 2026. Received from the owner 25 August 2026, produced in a
separate analysis session. This file is the source of record for the figures below.
Nothing here was re-derived by the site; treat every number as sourced-to-this-document
until independently checked, and mark anything the site restates with its evidence tier.

**Sources.** Four public leaderboards, snapshotted August 2026: ARC Prize
(ARC-AGI-1/2/3), Arena (Agent, Text, WebDev, Image-to-WebDev, Vision, Document,
Search), LiveBench release 2026-06-25 (overall + 7 categories), Artificial Analysis
(19 benchmark columns + cost, throughput, latency).

**Final scope.** 43 model families, 45 merged columns (was 42; SUPERSEDED 29 Aug 2026), 780 metric pairs, 86
effort-ladder observations across 23 families, 44 secondary ladder observations, 43
latency/throughput ladder rows.

## 1. Validation

| source | rows | columns | length errors |
|---|---|---|---|
| Artificial Analysis | 43 | 23 | none |
| LiveBench | 43 | 8 | none |
| ARC Prize | 26 | 3 | none |
| Arena | 29 | 7 | none |

Merged matrix 43 x 42. No duplicate keys. Range checks on bounded metrics pass.

**Column-alignment check.** The Artificial Analysis table has 19 benchmark columns
with `--` for missing cells, so one mis-parse shifts every later column. Each row was
verified by counting tokens from both ends independently (MMMU Pro is the last column
before Cost per Task). All 43 rows reconcile at exactly 19. This matters because the
alignment produces a result that would otherwise look like a parsing bug: GPT-5.6 Sol
scores 8% on AA's non-hallucination rate while Grok 4.6 scores 66%. That is real, and
reflects abstention behavior rather than capability.

**Entity resolution.** Leaderboards name variants inconsistently ("Claude 5 Opus
Thinking Max Effort", "claude-opus-5-max", "Claude Opus 5 (max)"). Records were
collapsed to a model-family key taking the best-scoring tested variant within each
source. Best-variant scores are not price-matched across sources; Section 5 exists to
correct that. Dropped as unusable: ox-alpha-max (listed at $0.000, an unpriced
preview) and the human baseline rows.

**Cost normalization.** The three cost figures are on incompatible bases: LiveBench
cost-per-successful-task (median $0.227), ARC cost-per-task (median $1.265), AA
cost-per-task (median $0.395). Each is divided by its own source median, combined by
geometric mean over available sources, and re-expressed in AA dollars. 42 of 43 models
have at least two sources. Claude Fable 5 spans $1.44 to $5.45 across sources, a 4x
spread on one model, and the largest single error term on the cost axis.

## 2. Benchmark comparability

All 780 metric pairs tested with pairwise-complete-case Pearson correlation. A pair is
computable if at least 8 models carry both metrics.

- 748 of 780 (96%) computable. The 32 that are not involve ar_search (n=9), arc3
  (n=12), aa_APEX and aa_ITBench crossed with each other.
- Median |r| among computable pairs 0.502; 60% significant at p<0.05.

| band | pairs | reading |
|---|---|---|
| >=0.85 | 36 | redundant, drop one |
| 0.70-0.85 | 124 | strong |
| 0.50-0.70 | 219 | moderate |
| 0.25-0.50 | 219 | weak |
| <0.25 | 150 | orthogonal |

### Redundant pairs

| pair | r | n |
|---|---|---|
| aa_HLE ~ ar_agent | +0.952 | 13 |
| aa_II ~ aa_TB21 | +0.940 | 40 |
| arc1 ~ arc2 | +0.936 | 26 |
| ar_webdev ~ ar_i2wd | +0.929 | 15 |
| ar_text ~ ar_vision | +0.916 | 12 |
| aa_GDPval ~ aa_ITBench | +0.909 | 14 |
| aa_LCR ~ aa_APEX | +0.902 | 14 |

ARC-AGI-1 and ARC-AGI-2 are near-duplicates, so only ARC-AGI-2 is used downstream.
Arena WebDev and Image-to-WebDev are effectively one board. AA's headline Intelligence
Index is largely a restatement of Terminal-Bench 2.1 (r=0.940, n=40).

### Orthogonal metrics that must be kept separate

aa_NonHall (non-hallucination) correlates negatively with LiveBench overall and is
uncorrelated with Arena WebDev and with cost: higher-scoring models hallucinate more
because they abstain less. aa_LCR (long-context reasoning) is uncorrelated with cost
and with LiveBench maths. aa_T2Tel (tau-2-Bench Telecom) is uncorrelated with the AA
Intelligence Index itself. The two instruction-following benchmarks disagree with each
other: lb_if correlates positively with overall capability, aa_IFBench negatively.
They should never be averaged.

### The four "overall" scores against each other

| pair | r | r2 | n |
|---|---|---|---|
| lb_overall ~ arc2 | +0.880 | 0.77 | 26 |
| aa_II ~ lb_overall | +0.860 | 0.74 | 43 |
| aa_II ~ arc2 | +0.763 | 0.58 | 26 |
| arc2 ~ ar_agent | +0.707 | 0.50 | 10 |
| lb_overall ~ ar_agent | +0.673 | 0.45 | 13 |
| arc2 ~ ar_text | +0.665 | 0.44 | 17 |
| lb_overall ~ ar_text | +0.622 | 0.39 | 23 |
| ar_text ~ ar_agent | +0.537 | 0.29 | 13 |
| aa_II ~ ar_text | +0.475 | 0.23 | 23 |

The three benchmark-style overalls agree well (r2=0.58-0.77). Arena agrees with none
of them above r2=0.50. Human preference is the outlier axis, and no single leaderboard
is a sufficient statistic for the others, which is the justification for a composite.

**Correction to an earlier working figure.** An intermediate pass reported ARC-AGI-2
as uncorrelated with Arena (r=+0.03). That came from correlating ARC against a mean of
four Arena boards computed over inconsistent model subsets, which averaged the signal
away. Against Arena Text on complete cases, r=+0.665 (n=17). ARC and Arena are
moderately related, not orthogonal.

## 3. Factor structure

PCA on the 14 primitive metrics with complete coverage across all 43 models (headline
composites aa_II, aa_Omni, lb_overall excluded to avoid circularity), z-scored.

- PC1 53.8%, PC2 9.5%, PC3 8.6%
- 5 components for 80% of variance
- Effective dimensionality 5.52 of 14 (exponential of eigenvalue entropy)

PC1 (general capability) loads on HLE, LiveBench reasoning, SciCode and CritPt, and
negatively on non-hallucination. PC2 separates data-analysis and agentic work from
instruction-following and knowledge. PC3 is a calibration/long-context axis.

A single number captures just over half the variance, which is why the composite is
reported with intervals rather than as a point estimate.

### Net of the general factor, almost nothing survives

Removing g and re-correlating the residuals within the frontier cohort, only 15 of 190
pairs remain above |r|=0.60, down from 60; mean |partial| falls to 0.270. The
surviving cluster is almost entirely agentic/economic work (GDPval, tau-3-Banking,
Terminal-Bench, LiveBench agentic coding), a coherent second factor independent of
general capability. Two correlations flip sign only after g is removed: aa_T3Bank ~
aa_OmAcc to -0.72 and lb_lng ~ lb_rsn to -0.65. At equal general capability, agentic
tool use trades against factual knowledge, and language ability trades against
reasoning.

Most apparent inter-benchmark agreement is one general factor wearing twenty different
names.

## 4. Functional form

The log-linear-in-logit form was an assumption and was tested against alternatives.

### Per-family fits cannot identify extra parameters

For each family with n>=4 effort rungs: logit-linear (2 params), four-parameter
logistic with free ceiling (3), logit-quadratic (3).

| form | AICc wins | LOOCV wins | mean LOOCV RMSE |
|---|---|---|---|
| logit-linear | 9/12 | 5/12 | 4.00 pts |
| 4PL free ceiling | 2/12 | 4/12 | 6.44 pts |
| logit-quadratic | 1/12 | 3/12 | 9.37 pts |

Free ceilings come back as 256% for Grok 4.6, 117% for GPT-5.6 Luna, 112% for
GPT-5.2. The parameter is unidentified at n=4-5. Per-family non-linearity overfits.

### Pooled curvature is real

Borrowing strength across all 86 observations with one shared quadratic term:

| spec | k | R2 | AICc |
|---|---|---|---|
| A. family intercepts + shared slope | 24 | 0.9763 | -167.3 |
| B. A + shared curvature | 25 | 0.9804 | -179.7 |
| C. family intercepts + family slopes | 46 | 0.9931 | -138.4 |
| D. C + shared curvature | 47 | 0.9939 | -139.1 |

A to B: F=12.82, p=0.0007. C to D: F=5.11, p=0.0295. Shared curvature ~~-0.847~~ **-0.552**
in spec D (the F statistic and p value are unchanged; the coefficient was WITHDRAWN and
corrected 29 Aug 2026): concave in logit space, returns decay faster than log-linear predicts. Residual SD
falls 0.300 to 0.192 logits. Spec D is used for all iso-cost work below.

### Link function and aggregator: immaterial

Bridge link functions move LOOCV RMSE from 11.92 (linear) to 11.65 (logit-y), 2%. At
n=26 the error is dominated by construct mismatch, not curve shape. CES aggregation
across pillars swept from rho=-2 (complements) to rho=+2 (substitutes) correlates
0.877-0.993 with the arithmetic mean; the top four never move. Only Claude Opus 4.6,
GLM-5.2, Claude Sonnet 4.6 and Gemini 3.6 Flash shift 2 places.

## 5. Effort elasticity and iso-cost normalization

> **SUPERSEDED 29 August 2026, kept in place.** An iso-TOKEN normalization now
> differences within each family, `cost_i - cost_0 = (tokens_i - tokens_0) x price`,
> stripping fixed input spend and the price differential, over 62 rungs across 22
> families. Rank correlation between the iso-token and iso-dollar orderings is only
> rho = +0.503, and eight of twelve families move two or more places. Held to equal
> dollars the OpenAI line wins; held to equal computation the Anthropic line wins.
> Both are true of different questions. The table below is the iso-DOLLAR answer.

Pooled slope +2.87 logits per 10x spend; per-family slopes differ significantly.
GPT-5.6 Sol is the most elastic (+4.35), Claude Fable 5 (+1.56), Opus 4.7 (+1.20) and
DeepSeek V4 Pro (+0.83) barely move. Anthropic's line buys a high floor with little
headroom; OpenAI's 5.6 line buys a low floor with steep returns. Replicated on the AA
Intelligence Index (n=44, 12 families, R2=0.958, slope heterogeneity p=0.030).

Re-solving each fitted curve at a common $1.00/task budget:

| family | ARC-2 @ $1.00 | 95% CI | n | status |
|---|---|---|---|---|
| Gemini 3.7 Flash | 95.6 | [87.7, 98.5] | 3 | extrapolated |
| GPT-5.6 Sol | 88.9 | [86.6, 90.8] | 5 | interpolated |
| Inkling Small | 86.3 | [70.1, 94.4] | 5 | extrapolated |
| GPT-5.6 Terra | 82.9 | [78.7, 86.4] | 5 | interpolated |
| GPT-5.5 | 73.4 | [69.3, 77.2] | 4 | interpolated |
| Claude Fable 5 | 72.8 | [63.6, 80.4] | 5 | extrapolated |
| Grok 4.6 | 72.1 | [65.4, 78.0] | 4 | extrapolated |
| Gemini 3.6 Flash | 70.7 | [58.0, 80.8] | 3 | extrapolated |
| GPT-5.4 | 66.1 | [61.1, 70.8] | 4 | interpolated |
| GPT-5.6 Luna | 65.9 | [56.5, 74.2] | 5 | extrapolated |
| DeepSeek V4 Flash 0731 | 63.3 | [9.4, 96.6] | 3 | extrapolated |
| DeepSeek V4 Pro 0813 | 63.0 | [45.5, 77.6] | 3 | extrapolated |
| Grok 4.5 | 59.8 | [49.4, 69.4] | 3 | extrapolated |
| Claude Opus 4.6 | 51.9 | [26.1, 76.7] | 4 | extrapolated |
| Kimi K3 | 51.3 | [45.1, 57.5] | 3 | interpolated |
| Claude Opus 4.8 | 48.1 | [27.3, 69.5] | 3 | extrapolated |
| Claude Opus 4.7 | 45.1 | [29.6, 61.5] | 4 | extrapolated |
| GPT-5.2 | 35.8 | [31.1, 40.7] | 4 | interpolated |
| Opus 4.5 | 26.3 | [22.6, 30.3] | 5 | interpolated |
| GPT-5.1 | 15.0 | [11.3, 19.6] | 3 | interpolated |
| o3 | 6.5 | [4.4, 9.5] | 3 | extrapolated |
| Gemini 2.5 Pro | 4.9 | [3.3, 7.3] | 3 | extrapolated |

Held to an equal budget the headline ordering inverts. Claude Fable 5's 89.2% requires
$5.45/task; at $1.00 both GPT-5.6 variants beat it.

**Known failure.** The concave form still cannot represent a curve that decreases.
Grok 4.5 scores 52.6 at both medium and high; Claude Opus 4.6 scores 68.8 at Max,
below its 69.2 at High. Those two families have saturated and their fitted slopes are
biased downward.

## 6. The saturation asymmetry

Latency and throughput ladders per effort rung, compared against the score axis on the
same ladder.

| axis | per rung | over 4 rungs | form |
|---|---|---|---|
| Time to first answer | 2.41x | 33.8x | multiplicative |
| Total response time | 1.68x | 8.0x | multiplicative |
| Cost per task | 1.45x | 4.4x | multiplicative |
| Output tokens/sec | 1.03x | 1.1x | flat |
| ARC-AGI-2 | +9.9 pts | +39.6 pts | additive, then ceiling |
| AA Intelligence Index | +2.6 pts | +10.4 pts | additive, then ceiling |

Throughput is nearly constant: models do not generate faster at higher effort, they
generate longer. Almost all latency growth is thinking time before the first token,
which is why time-to-first-answer grows four times faster than cost.

### Dynamic range across the top 20

| metric | span | max/min |
|---|---|---|
| aa_GPQA | 5.0 pts (90 to 95) | 1.1x |
| lb_overall | 7.7 pts | 1.1x |
| aa_LCR | 10.0 pts | 1.1x |
| lb_rsn | 11.7 pts | 1.1x |
| aa_II | 15.0 pts | 1.3x |
| arc2 | 32.1 pts | 1.5x |
| cost (Artificial Analysis, raw) | - | 31.4x |
| cost (blended, used elsewhere in this doc) | - | 27.8x |
| response time | - | 22.3x |
| tokens/sec | - | 14.1x |

Frontier benchmarks vary by 10-30%; the resources to run them vary by 1,300-3,000%.
GPQA Diamond is functionally dead as a discriminator at the top. ARC-AGI-2 is the only
score with real spread left, which is why it carries weight in the composite.

### Marginal cost of a benchmark point

Inverting the spec-D curvature model:

| family | 50% | 60% | 70% | 80% | 85% | 90% | $/pt 50-60 | $/pt 80-90 | ratio |
|---|---|---|---|---|---|---|---|---|---|
| Gemini 3.7 Flash | $0.076 | $0.099 | $0.133 | $0.198 | $0.262 | $0.392 | $0.0023 | $0.0194 | 8.4x |
| GPT-5.6 Sol | $0.342 | $0.417 | $0.519 | $0.686 | $0.828 | $1.072 | $0.0074 | $0.0386 | 5.2x |
| GPT-5.6 Terra | $0.367 | $0.466 | $0.613 | $0.875 | $1.119 | $1.592 | $0.0099 | $0.0718 | 7.3x |
| GPT-5.5 | $0.515 | $0.664 | $0.890 | $1.309 | $1.715 | $2.533 | $0.0149 | $0.1223 | 8.2x |
| Claude Fable 5 | $0.425 | $0.590 | $0.876 | $1.531 | $2.356 | $4.976 | $0.0165 | $0.3445 | 20.9x |
| Grok 4.6 | $0.430 | $0.602 | $0.903 | $1.611 | $2.537 | $5.785 | $0.0172 | $0.4174 | 24.3x |

The last ten points cost 5-24x more per point than the middle ten. A single "dollars
per benchmark point" figure is meaningless: it varies 24x within one family depending
on where you sit.

## 7. Restriction of range

Restricting to the top 20 models and the 20 best-covered metrics gives 190 pairs. Mean
|Pearson| within the top 20 is 0.358 against 0.450 in the full cohort; 79% of pairs
attenuate, mean attenuation +0.159.

This is why leaderboards look noisier at the top than they are: comparing only frontier
models truncates variance and mechanically shrinks every correlation.

The Thorndike Case II correction barely works, and this is testable because the full
cohort is observable. Mean absolute error against the true full-cohort r: 0.192
uncorrected, 0.182 corrected, a 5% improvement. Case II assumes direct selection on one
variable, but selection was on a composite, which is Case III. It overshoots on
individual pairs, mapping aa_TB21 ~ log_cost to +0.81 when the truth is +0.34.
Corrected values are an upper bound, not a point estimate.

60 of 190 pairs (32%) reach |r|>=0.60 on some coefficient. All negative correlates
above 0.6 involve non-hallucination: aa_NonHall ~ lb_mth -0.60, ~ aa_CritPt -0.61, ~
aa_OmAcc -0.55.

## 8. Bridges and imputation

OLS with leave-one-out CV; missing cells filled from prediction intervals (including
the +1 term for a new observation), not confidence intervals on the mean.

| bridge | n | R2 | LOOCV RMSE | verdict |
|---|---|---|---|---|
| aa_II ~ lb_overall | 43 | 0.740 | 3.93 | usable |
| arc2 ~ lb_overall | 26 | 0.774 | 12.29 | usable, wide |
| arena ~ lb_overall | 29 | 0.240 | 68.53 | rejected |

Expanding the cohort improved the bridge. Refitting ARC on 26 rather than 22 models
raised R2 from 0.600 to 0.774, the Section 7 range-restriction effect running in
reverse. Adding weaker models restores variance and un-attenuates the relationship.

The Arena bridge is rejected: +/-134 Elo at 95% is wider than the entire spread of the
top 20. Models missing Arena lose the pillar rather than gain a fabricated value.
Imputed ARC cells carry roughly +/-24 points at 95%, which is why imputed models show
intervals about twice as wide.

## 9. Composite construction

Pillars, each a z-score average of its metrics, then averaged with equal weight:
LiveBench overall; ARC-AGI-2; Arena (Agent + Elo boards); Artificial Analysis
(Intelligence + Omniscience).

**Uncertainty.** 20,000-draw Monte Carlo. Measurement SDs: ARC +/-4.0 (binomial on a
120-task eval), LiveBench +/-1.0, AA Index +/-1.2, AA Omniscience +/-3.0, Arena from
each board's published +/- divided by 1.96, Arena Agent +/-14% relative. Imputed cells
drawn from their full prediction distribution.

Evidence tiers, so imputed rows are never mistaken for measured ones:

- Tier A (19 models): ARC measured, Arena present, all 3 cost sources
- Tier B (16): one of ARC or Arena measured
- Tier C (8): LiveBench + AA only; ARC imputed, no Arena pillar. Provisional.

## 10. Full ranking, 43 models

| # | Model | Score | 95% CI | Rank CI | Blended $ | resp s | tok/s | ARC-2 | Arena | Tier |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Claude Fable 5 | 100.0 | [93.2, 106.8] | [1, 3] | $2.374 | 104 | 65 | measured | yes | A |
| 2 | Claude Opus 5 | 97.8 | [90.5, 105.2] | [1, 3] | $1.223 | 81 | 55 | measured | yes | A |
| 3 | GPT-5.6 Sol | 92.5 | [86.1, 98.7] | [2, 4] | $0.726 | 170 | 75 | measured | yes | A |
| 4 | Gemini 3.7 Flash | 86.0 | [81.7, 90.4] | [3, 5] | $0.204 | 11 | 324 | measured | yes | A |
| 5 | Kimi K3 | 80.4 | [74.5, 86.4] | [4, 9] | $0.632 | 78 | 36 | measured | yes | A |
| 6 | GPT-5.5 | 76.9 | [71.5, 82.5] | [5, 12] | $0.807 | 104 | 81 | measured | yes | A |
| 7 | Grok 4.6 | 76.4 | [71.3, 81.5] | [5, 12] | $0.431 | 52 | 59 | measured | yes | A |
| 8 | GPT-5.6 Terra | 75.2 | [70.8, 79.6] | [5, 13] | $0.480 | 164 | 109 | measured | yes | A |
| 9 | Claude Opus 4.8 | 74.1 | [67.9, 80.3] | [5, 15] | $1.438 | 54 | 59 | measured | yes | A |
| 10 | Gemini 3.1 Pro | 73.3 | [69.1, 77.5] | [6, 14] | $0.367 | 32 | 121 | measured | yes | A |
| 11 | Claude Opus 4.7 | 70.2 | [64.9, 75.5] | [8, 18] | $1.681 | 33 | 50 | measured | yes | A |
| 12 | Qwen 3.8 Max | 70.0 | [61.7, 78.5] | [6, 20] | $0.660 | 112 | 23 | imputed | yes | B |
| 13 | Qwen 3.8 27B | 69.6 | [61.9, 77.3] | [7, 20] | $0.246 | 58 | 46 | imputed | yes | B |
| 14 | GPT-5.4 | 69.1 | [64.8, 73.3] | [10, 18] | $0.710 | 147 | 135 | measured | yes | A |
| 15 | Muse Spark 1.1 | 68.9 | [61.1, 76.7] | [7, 21] | $0.316 | 14 | 197 | imputed | yes | B |
| 16 | Muse Spark 1.2 | 68.1 | [60.2, 76.0] | [8, 21] | $0.511 | -- | -- | imputed | yes | B |
| 17 | Claude Sonnet 5 | 66.2 | [57.7, 74.6] | [9, 24] | $1.229 | 236 | 86 | imputed | yes | B |
| 18 | GLM-5.3 | 63.5 | [55.4, 71.7] | [12, 26] | $0.730 | 34 | 77 | imputed | yes | B |
| 19 | Qwen 3.8 Flash Next | 63.0 | [52.7, 73.2] | [10, 28] | $0.085 | 36 | 76 | imputed | no | C |
| 20 | DeepSeek V4 Pro 0813 | 63.0 | [57.8, 68.1] | [15, 24] | $0.157 | 41 | 64 | measured | yes | A |
| 21 | Grok 4.5 | 60.7 | [55.6, 65.8] | [17, 26] | $0.288 | 24 | 53 | measured | yes | A |
| 22 | DeepSeek V4 Flash Vision | 59.7 | [49.4, 70.0] | [13, 30] | $0.103 | 23 | 117 | imputed | no | C |
| 23 | Claude Opus 4.6 | 59.5 | [55.2, 63.7] | [18, 27] | $0.873 | 38 | 41 | measured | yes | B |
| 24 | GLM-5.2 | 57.7 | [53.4, 62.0] | [20, 28] | $0.238 | 36 | 72 | measured | yes | A |
| 25 | Claude Sonnet 4.6 | 57.6 | [53.4, 61.8] | [20, 28] | $0.818 | 146 | 66 | measured | yes | A |
| 26 | Gemini 3.5 Flash | 56.5 | [52.2, 60.7] | [21, 29] | $0.430 | 22 | 204 | measured | yes | A |
| 27 | Gemini 3.6 Flash | 55.8 | [51.4, 60.2] | [21, 29] | $0.297 | 21 | 175 | measured | yes | A |
| 28 | DeepSeek V4 Flash 0731 | 53.7 | [48.1, 59.1] | [22, 31] | $0.107 | 22 | 118 | measured | no | B |
| 29 | GPT-5.6 Luna | 52.9 | [47.4, 58.4] | [23, 31] | $0.093 | 155 | 127 | measured | no | B |
| 30 | GPT-5.2 | 49.1 | [43.7, 54.5] | [27, 31] | $0.492 | 199 | 80 | measured | no | B |
| 31 | GPT-5.2 Codex | 46.7 | [36.5, 57.0] | [25, 32] | $0.325 | 199 | 80 | imputed | no | C |
| 32 | GLM-5.3 Flash | 32.5 | [24.6, 40.4] | [32, 37] | $0.070 | 52 | 49 | imputed | yes | B |
| 33 | Kimi K2.6 | 31.3 | [23.6, 39.2] | [32, 37] | $0.339 | 134 | 38 | imputed | yes | B |
| 34 | Inkling | 30.7 | [26.4, 35.0] | [32, 36] | $0.333 | 45 | 59 | measured | yes | A |
| 35 | Qwen 3.6 Plus | 26.7 | [16.2, 37.1] | [32, 38] | $0.377 | 112 | 55 | imputed | no | C |
| 36 | Minimax M3 | 25.3 | [17.0, 33.4] | [33, 38] | $0.121 | 21 | 124 | imputed | yes | B |
| 37 | Grok Build 0.1 | 24.5 | [13.6, 35.4] | [32, 39] | $0.098 | 50 | 50 | imputed | no | C |
| 38 | Kimi K2.7 Code | 23.6 | [12.9, 34.3] | [32, 39] | $0.196 | 63 | 45 | imputed | no | C |
| 39 | GPT-5.4 Mini | 12.7 | [7.2, 18.2] | [38, 42] | $0.534 | 12 | 164 | measured | no | B |
| 40 | GPT-5.4 Nano | 10.6 | [5.0, 16.1] | [39, 42] | $0.154 | 9 | 168 | measured | no | B |
| 41 | Gemini 3.5 Flash-Lite | 8.6 | [3.0, 14.1] | [39, 43] | $0.110 | 11 | 368 | measured | no | B |
| 42 | Grok 4.3 | 4.2 | [-7.4, 15.6] | [39, 43] | $0.126 | 26 | 123 | imputed | no | C |
| 43 | Qwen 3.6 27B | -0.0 | [-11.3, 11.2] | [40, 43] | $0.319 | 127 | 50 | imputed | no | C |

### Pareto frontier

GLM-5.3 Flash ($0.070, tier B) to Qwen 3.8 Flash Next ($0.085, tier C) to Gemini 3.7
Flash ($0.204, tier A) to GPT-5.6 Sol ($0.726, tier A) to Claude Opus 5 ($1.223, tier
A) to Claude Fable 5 ($2.374, tier A).

The two cheapest frontier members separate cleanly from their neighbors; everything
from Gemini 3.7 Flash upward overlaps in confidence interval. DeepSeek V4 Pro 0813
dropped off the frontier when the cohort expanded: Qwen 3.8 Flash Next matches its
quality at half the cost.

## 11. Blended value index

0.60*z(quality) + 0.25*z(-log cost) + 0.15*z(-log response time).

The speed term uses latency, not throughput. Earlier passes used tokens/sec, which
moves only 1.1x across four effort rungs and is close to uninformative. Response time
moves 8x and is what a user experiences. Switching the term changes the ranking
materially: Spearman 0.948 between the two versions, but GPT-5.6 Luna falls 10 places,
GPT-5.4 falls 10, GPT-5.6 Terra falls 9, while Grok 4.5 rises 8 and GLM-5.2 rises 6.
GPT-5.6 Sol drops from 2nd to 7th on a 170-second response time.

| # | Model | Value | Quality | Cost | resp s | Tier |
|---|---|---|---|---|---|---|
| 1 | Gemini 3.7 Flash | +1.17 | 86.0 | $0.204 | 11 | A |
| 2 | Qwen 3.8 Flash Next | +0.66 | 63.0 | $0.085 | 36 | C |
| 3 | DeepSeek V4 Flash Vision | +0.61 | 59.7 | $0.103 | 23 | C |
| 4 | Claude Opus 5 | +0.59 | 97.8 | $1.223 | 81 | A |
| 5 | Muse Spark 1.1 | +0.58 | 68.9 | $0.316 | 14 | B |
| 6 | Gemini 3.1 Pro | +0.51 | 73.3 | $0.367 | 32 | A |
| 7 | GPT-5.6 Sol | +0.49 | 92.5 | $0.726 | 170 | A |
| 8 | DeepSeek V4 Pro 0813 | +0.47 | 63.0 | $0.157 | 41 | A |
| 9 | Grok 4.6 | +0.46 | 76.4 | $0.431 | 52 | A |
| 10 | DeepSeek V4 Flash 0731 | +0.45 | 53.7 | $0.107 | 22 | B |
| 11 | Qwen 3.8 27B | +0.44 | 69.6 | $0.246 | 58 | B |
| 12 | Claude Fable 5 | +0.42 | 100.0 | $2.374 | 104 | A |

Tier A only, the defensible list:

| # | Model | Value | Quality | Cost |
|---|---|---|---|---|
| 1 | Gemini 3.7 Flash | +1.17 | 86.0 | $0.204 |
| 2 | Claude Opus 5 | +0.59 | 97.8 | $1.223 |
| 3 | Gemini 3.1 Pro | +0.51 | 73.3 | $0.367 |
| 4 | GPT-5.6 Sol | +0.49 | 92.5 | $0.726 |
| 5 | DeepSeek V4 Pro 0813 | +0.47 | 63.0 | $0.157 |
| 6 | Grok 4.6 | +0.46 | 76.4 | $0.431 |
| 7 | Claude Fable 5 | +0.42 | 100.0 | $2.374 |
| 8 | Kimi K3 | +0.38 | 80.4 | $0.632 |

Three of the unrestricted top twelve are tier C riding on imputed ARC scores with
+/-24-point intervals and should not drive a decision alone.

## 12. Robustness

Six specifications: z-score vs percentile-rank normalization, and leave-one-pillar-out
x4. The top three are 1-2-3 under every specification. Mid-table is unstable: Claude
Opus 4.6, Grok 4.5 and Qwen 3.8 27B each swing 10 ranks; Grok 4.6 swings 8, carried by
the AA index, and falls to 16th if that pillar is dropped.

The equal-weight composite correlates r=+0.869 with a variance-weighted 3-factor PCA
alternative, and PC1 alone correlates r=+0.902. The ranking is not an artifact of
pillar weighting.

Statistically, the top three are tied. Claude Fable 5, Claude Opus 5 and GPT-5.6 Sol
have overlapping 95% intervals, and Fable 5 holds rank 1 in only about half the Monte
Carlo draws. Rank intervals in the 12-25 band run 8-15 places wide; the mid-table is
not resolvable with this evidence.

## 13. (absent)

No section 13 exists in the source document as received on 25 August 2026. The
document numbers 12, then 14. Recorded here so the gap is not mistaken for a
transcription loss on this side.

## 14. The effort-aware Pareto frontier


> **PARTIALLY WITHDRAWN 29 August 2026, kept in place.** The flat region reported
> between $0.50 and $1.00, and the three-regime marginal-return reading built on it,
> were artifacts of extrapolating past tested rungs. Restricted to measured rungs the
> flat region disappears: GPT-5.6 Sol climbs continuously from 83.9 to 93.5 across
> $0.396 to $1.417. Gemini 3.7 Flash's band shrinks to its tested $0.081 to $0.245 and
> its top score falls from an extrapolated 92.0 to a measured 83.9. Do not restate the
> withdrawn version.

Sections 10 and 11 build a frontier over models, taking one variant each. That is the
wrong object. The real decision is over (model, effort level) configurations, because
a cheaper family run harder often beats a stronger family run soft. Tracing every
family's fitted spec-D curve and taking the upper envelope gives the frontier over
configurations.

### Who owns each budget band

| budget band | best configuration | ARC-AGI-2 across the band |
|---|---|---|
| $0.05 - $0.09 | DeepSeek V4 Flash 0731 | 60.4 to 66.1 |
| $0.09 - $0.51 | Gemini 3.7 Flash | 66.1 to 92.0 |
| $0.52 - $2.97 | GPT-5.6 Sol | 92.0 to 97.7 |
| above $3 | GPT-5.5 / Claude Fable 5 | flat at ~97.7 |

Only two families own any meaningful stretch of the curve. Gemini 3.7 Flash dominates
from 9 cents to about 51 cents; GPT-5.6 Sol owns everything above that until the curve
flattens. Claude Fable 5, Claude Opus 4.7, Grok 4.6 and GPT-5.5 never touch the
envelope: at every budget where they were tested, another family reaches the same ARC
score for less.

This is a sharper statement than Section 10's model-level frontier, and it partly
contradicts it: on ARC-AGI-2 with effort held to a budget, the Anthropic line is
dominated everywhere. The composite ranking still puts Fable 5 and Opus 5 first
because they win on Arena, LiveBench and the AA index, which the ARC-only envelope
does not see. Both statements are true of different questions.

### Marginal value of budget along the envelope

| band | spend multiple | score gain | pts per extra $ |
|---|---|---|---|
| $0.05 to $0.10 | 2.0x | +5.5 | 109 |
| $0.10 to $0.25 | 2.5x | +18.2 | 121 |
| $0.25 to $0.50 | 2.0x | +7.4 | 30 |
| $0.50 to $1.00 | 2.0x | +0.0 | 0 |
| $1.00 to $2.00 | 2.0x | +4.1 | 4 |
| $2.00 to $6.00 | 3.0x | +1.5 | 0.4 |

Three regimes. Below $0.25 the return is roughly 120 points per dollar. Between $0.25
and $0.50 it drops fourfold. From $0.50 to $1.00 the frontier is flat, a genuine dead
zone where doubling the budget buys nothing, because Gemini 3.7 Flash has run out of
tested headroom and GPT-5.6 Sol has not yet pulled ahead. Above $2 the return is 0.4
points per dollar, roughly 300x worse than the cheap end.

### Evidence caveat, which is severe here

Dashed segments in the chart lie outside each family's tested ladder. Extrapolation is
capped at 0.30 log units (about 2x) beyond the observed range, and even so:

- Gemini 3.7 Flash was tested only to $0.249. Its ownership of the $0.25-$0.51 band and
  its approach to 92% are extrapolated, not measured.
- Every segment above $3 is extrapolation on all families and should be read as "the
  curve has flattened," not as a specific number.
- The $0.50-$1.00 dead zone sits exactly where Gemini's extrapolation ends and Sol's
  measured range begins, so its width is partly an artifact of what was tested rather
  than a property of the models.

The one band resting entirely on measured data is $0.32 to $1.44, owned by GPT-5.6
Sol, whose five tested rungs span that range. That is the most trustworthy claim in
this section.

## 15. Cross-source construct agreement (multitrait-multimethod)

Sections 2 and 3 tested every pair. This section asks a narrower question: when two
different providers claim to measure the same underlying ability, do they agree? Every
metric was labeled with a construct (reasoning, coding, agentic, instruction-
following, knowledge, data, vision, overall) and a source (AA / LiveBench / ARC /
Arena), giving the classic MTMM grid.

| | same source | different source |
|---|---|---|
| same construct | +0.538 mean, +0.720 median (n=31) | +0.575 mean, +0.629 median (n=35) |
| different construct | +0.445 / +0.512 (n=185) | +0.473 / +0.547 (n=355) |

Convergent minus discriminant gap, cross-source: +0.103. Construct labels carry real
information, but only about a tenth of a correlation unit beyond the general factor.
Two benchmarks nominally measuring different things still correlate +0.473 on average.
This is the Section 3 finding in another form: most of what benchmarks measure is one
shared factor.

### Same construct, different provider

| construct | pair | n | r | r2 |
|---|---|---|---|---|
| reasoning | aa_GPQA ~ arc1 | 26 | +0.874 | 0.76 |
| reasoning | aa_HLE ~ arc1 | 26 | +0.867 | 0.75 |
| overall | aa_II ~ lb_overall | 43 | +0.860 | 0.74 |
| reasoning | aa_HLE ~ arc2 | 26 | +0.857 | 0.74 |
| reasoning | aa_GPQA ~ arc2 | 26 | +0.838 | 0.70 |
| reasoning | lb_rsn ~ arc2 | 26 | +0.808 | 0.65 |
| agentic | lb_agt ~ aa_T3Bank | 40 | +0.815 | 0.66 |
| reasoning | aa_HLE ~ lb_rsn | 43 | +0.794 | 0.63 |
| agentic | lb_agt ~ aa_ITBench | 14 | +0.589 | 0.35 |
| coding | lb_cod ~ ar_i2wd | 15 | +0.568 | 0.32 |
| coding | aa_SciCode ~ ar_webdev | 21 | +0.546 | 0.30 |
| vision | aa_MMMU ~ ar_vision | 11 | +0.537 | 0.29 |
| coding | aa_SciCode ~ lb_cod | 43 | +0.532 | 0.28 |
| agentic | aa_GDPval ~ ar_agent | 13 | +0.403 | 0.16 |
| data | aa_Analyst ~ lb_dat | 18 | +0.284 | 0.08 |
| instruction | aa_IFBench ~ lb_if | 22 | +0.032 | 0.00 |
| agentic | lb_agt ~ aa_T2Tel | 22 | -0.078 | 0.01 |
| agentic | aa_T3Bank ~ ar_agent | 13 | -0.347 | 0.12 |

Reasoning is the only construct where providers genuinely agree (r2 = 0.63-0.76 across
four independent measurement programs). Coding agreement is mediocre: AA SciCode and
LiveBench Coding share just 28% of variance despite both being "coding". Instruction-
following agreement is zero (r = +0.032, n=22): AA's IFBench and LiveBench's IF
category are, empirically, unrelated measurements that happen to share a name. And two
agentic pairs are negative, including tau-3-Banking against Arena Agent at -0.347,
meaning a model that ranks well on Arena's agentic voting tends to rank worse on AA's
banking tool-use benchmark.

**Practical rule.** Treat "reasoning" scores from any source as interchangeable. Never
substitute one provider's coding, agentic or instruction-following score for another's;
they are different tests.

### Where ARC-AGI-2 fits

ARC-2's correlation profile across all 35 other metrics, mean |r| by source: LiveBench
0.664, AA 0.639, Arena 0.570. Its strongest correlates are not what the benchmark's
framing suggests:

| rank | metric | construct | source | r |
|---|---|---|---|---|
| 1 | aa_OmAcc | knowledge | AA | +0.900 |
| 2 | aa_Analyst | data | AA | +0.888 |
| 3 | lb_overall | overall | LB | +0.880 |
| 4 | lb_lng | language | LB | +0.858 |
| 5 | aa_HLE | reasoning | AA | +0.857 |
| 6 | aa_GPQA | reasoning | AA | +0.838 |
| 7 | aa_TB21 | agentic | AA | +0.823 |
| 8 | lb_rsn | reasoning | LB | +0.808 |
| 30 | lb_if | instruction | LB | +0.408 |
| 34 | aa_NonHall | knowledge | AA | -0.189 |
| 35 | aa_IFBench | instruction | AA | -0.222 |

ARC-AGI-2's single strongest correlate is Omniscience Accuracy (+0.900), a knowledge
benchmark, higher than any dedicated reasoning benchmark including HLE (+0.857) and
GPQA (+0.838). ARC-2 also correlates +0.823 with Terminal-Bench 2.1, an agentic coding
benchmark.

This complicates ARC's positioning as a measure of fluid intelligence independent of
acquired knowledge. On this cohort ARC-AGI-2 behaves as a high-loading measure of the
general factor rather than of anything specific: it correlates 0.80+ with reasoning,
knowledge, data analysis, language and agentic benchmarks alike. That is not a defect
for composite construction, it is why ARC-2 is the most informative single pillar and
why it survived every robustness check, but it does undercut the claim that ARC
measures something the other benchmarks miss.

The two metrics ARC-2 does not track are the same two that behave anomalously
everywhere else: non-hallucination (-0.189) and AA's IFBench (-0.222). Both are
calibration/compliance measures where models that answer more confidently score worse.

## 16. A vendor-neutral effort scale, and the formulas on it

Everything up to here used **cost** as the effort proxy. That is wrong in a specific
way, and this section fixes it.

### Why vendor labels cannot be compared

Placing every tested variant on a measured token count (throughput x response time),
the pooled meaning of each label is:

| label | E = log10(tokens) | tokens/task | spread across families |
|---|---|---|---|
| non-reasoning | 2.76 | 580 | 1.0x |
| low | 2.88 | 751 | 1.5x |
| med | 3.08 | 1,194 | 3.1x |
| high | 3.37 | 2,331 | 2.3x |
| xhigh | 3.75 | 5,570 | 4.3x |
| max | 4.12 | 13,224 | 3.6x |

Mean within-label SD is 0.19 log units: the same label means up to 2.4x different work
depending on the vendor. The ranges overlap. `max` on Grok 4.6 (E=3.52) is less work
than `xhigh` on GPT-5.6 Luna (E=3.93). Label ordering is not effort ordering, and any
comparison of "high vs high" across vendors is comparing different amounts of
computation.

Ladder ranges also differ enormously. GPT-5.6 Luna spans 33.3x from low to max; Grok
4.3 spans 2.6x. OpenAI ships a wide effort dial, xAI ships a narrow one.

### Two token estimates disagree, and that matters

Tokens can be estimated two ways: from cost divided by output price, or from
throughput times response time. They correlate only **r=0.528**, with the cost estimate
running a median **15x higher**. The gap is input tokens: cost-per-task includes the
prompt, which dominates for cheap models. **Cost is a contaminated proxy for effort**,
and the token scale below uses only the directly measured quantity.

### The formulas (pooled OLS, family-demeaned, elasticity w.r.t. tokens)

| quantity | slope | 95% CI | R2 | reading |
|---|---|---|---|---|
| log10 time to first answer | +1.457 | +/-0.084 | 0.964 | super-proportional |
| log10 response time | +0.946 | +/-0.010 | 0.999 | 1:1 with tokens |
| log10 cost per task | +0.500 | +/-0.060 | 0.874 | sub-proportional |
| logit(AA Intelligence Index) | +0.381 | +/-0.061 | 0.817 | logistic |
| log10 throughput | +0.054 | +/-0.010 | 0.700 | flat |

`log10(response_time) = 0.95*E - 2.83` with R2=0.999: **latency is effort**, to three
decimal places. That is the cleanest relationship in this entire analysis and it makes
response time the correct effort proxy, better than cost.

Cost has elasticity only +0.50 because fixed input cost dilutes it: doubling the
thinking budget less than doubles the bill. Throughput is flat at +0.05, models do not
speed up under load, they run longer. And score is logistic in log-tokens with slope
+0.38, so **raw score points saturate while every resource keeps climbing.** That
single asymmetry, resources proportional-or-worse in tokens and score logarithmic in
tokens, generates every diminishing-return result in Sections 4, 5, 6 and 14.

### Best estimates: every family at exactly 10,000 tokens/task

| family | AA Intelligence Index @ E=4.0 | 95% CI | n | extrapolated |
|---|---|---|---|---|
| Claude Opus 5 | 68.6 | [56.5, 78.6] | 5 | yes |
| Grok 4.6 | 68.2 | [63.2, 72.8] | 4 | yes |
| GPT-5.6 Sol | 60.7 | [57.1, 64.2] | 5 | no |
| GPT-5.5 | 58.1 | [48.2, 67.4] | 4 | yes |
| Gemini 3.7 Flash | 58.0 | [26.3, 84.2] | 3 | yes |
| GPT-5.6 Terra | 55.1 | [48.4, 61.7] | 5 | no |
| GPT-5.6 Luna | 50.3 | [44.5, 56.2] | 5 | no |
| Grok 4.3 | 40.5 | [38.5, 42.5] | 3 | yes |

**This reverses the iso-cost ranking of Section 5.** Held to equal dollars, GPT-5.6 Sol
beat Claude Fable 5. Held to equal computation, Claude Opus 5 and Grok 4.6 lead. Both
are true: Anthropic extracts more per token, OpenAI charges less per token. Which
comparison is right depends on whether your constraint is budget or latency.

Only three of these estimates are interpolated. Claude Opus 5's lead rests on
extrapolating past its tested ceiling of E=4.31, and Gemini 3.7 Flash's interval spans
[26, 84] on three rungs, not usable. The trustworthy statement is the GPT-5.6 ordering
(Sol > Terra > Luna at equal tokens), which is fully interpolated.

## 17. Cohort sensitivity: what changes the answer and what does not

Every result above depends on which models are in the cohort. This section ablates that
choice systematically. Baseline: 43 models, PC1 53.8%, median |r| 0.477, ARC~LiveBench
bridge R2 0.774, top five Fable 5 / Opus 5 / Sol / Gemini 3.7 Flash / Kimi K3.

### Dropping a whole company changes almost nothing

| ablation | n | PC1 | median abs r | bridge R2 | rank rho vs baseline |
|---|---|---|---|---|---|
| drop all Anthropic | 36 | 53.6% | 0.488 | 0.780 | 0.997 |
| drop all OpenAI | 34 | 52.6% | 0.473 | 0.694 | 0.998 |
| drop all Google | 38 | 53.8% | 0.505 | 0.753 | 1.000 |
| drop all xAI | 39 | 54.0% | 0.480 | 0.784 | 0.999 |
| drop all Alibaba | 38 | 52.6% | 0.481 | 0.774 | 1.000 |
| drop all DeepSeek | 40 | 54.9% | 0.490 | 0.783 | 1.000 |
| drop all Z.ai | 40 | 55.1% | 0.806 | 0.806 | 0.998 |
| drop all Moonshot | 40 | 53.6% | 0.471 | 0.801 | 0.999 |
| exclude the three biggest vendors | 22 | 53.1% | 0.431 | - | - |
| one model per vendor (best each) | 10 | 52.8% | 0.477 | - | - |

Rank correlation with baseline never falls below 0.997 when a vendor is removed. The
factor structure is not an artifact of any one company's models, and correlations are
not inflated by multiple variants of the same family: one-model-per-vendor gives median
|r| of exactly 0.477, the same as the full cohort.

### Dropping pillars changes little

| ablation | rank rho | top-5 retained |
|---|---|---|
| drop ARC pillar | 0.975 | 5/5 |
| drop Arena pillar | 0.964 | 4/5 |
| drop AA pillar | 0.954 | 4/5 |
| drop LiveBench pillar | 0.984 | 5/5 |

Minimum rho across all 18 ablations is 0.954, median 0.996. The ranking is robust to
composition.

### Restricting the range destroys the statistics

| cohort | n | PC1 | median abs r | bridge R2 |
|---|---|---|---|---|
| full (43) | 43 | 53.8% | 0.477 | 0.774 |
| drop models missing ARC | 26 | 59.9% | 0.495 | 0.774 |
| drop models missing Arena | 29 | 47.7% | 0.422 | 0.588 |
| only current-generation lines | 16 | 40.2% | 0.346 | 0.506 |
| top 20 only | 20 | 36.8% | 0.315 | 0.357 |
| bottom 30 only | 30 | 46.7% | 0.389 | 0.670 |
| middle 20 (ranks 12-31) | 20 | 27.6% | 0.265 | 0.173 |

Restricting to the current generation cuts the bridge R2 from 0.774 to 0.506.
Restricting to the top 20 cuts it to 0.357. Restricting to the middle 20, models that
are neither frontier nor obsolete, collapses it to 0.173, and PC1 to 27.6%.

So the honest reading of every correlation in this document is: it is a statement about
the range from Grok 4.3 to Claude Fable 5, not about the models you are actually
choosing between. If your shortlist is five current frontier models, the correlations
that apply to you are the top-20 numbers (median |r| 0.315), not the headline ones.
Benchmarks agree about the difference between good and bad models; they agree much less
about the difference between two good ones.

### The earlier fills rest on a slope fitted mostly outside the frontier

Section 8 noted that expanding the cohort raised the ARC bridge R2 from 0.600 to 0.774
and called that an improvement. The ablations qualify that. The wider cohort gives a
better-estimated relationship, but the relationship is being estimated over a range that
includes models nobody would deploy. Using it to impute ARC for a frontier model like
Qwen 3.8 Max means applying a slope fitted mostly on the good-versus-bad contrast to a
good-versus-good question. The +/-24-point prediction interval already reflects this,
but the point estimate should be read as weakly informed, not as a measurement.

### The one ablation that changes the answer

"Only legacy generation" and "bottom 30 only" both return 0/5 of the baseline top five,
trivially, because those cohorts exclude the winners. Every other ablation retains 4/5
or 5/5. There is no composition choice, short of deleting the leaders, that changes who
leads.

## 18. How many correlations are actually solid?

Sections 2 and 15 reported correlations without correcting for multiple testing or
checking power. With 780 pairs, roughly 39 would clear p<0.05 by chance alone. This
section reruns everything with Fisher-z confidence intervals, Benjamini-Hochberg FDR
correction, and a power calculation, then grades each pair.

**Grading rule.** A pair is **solid** if it survives FDR at q<0.05 and its 95% CI lies
entirely beyond |r|=0.5, that is, we can rule out a merely moderate relationship. A pair
is **underpowered** if it fails significance while having under 80% power to detect
r=0.5, meaning the null result is uninformative. A pair is a **well-powered null** if it
fails significance with adequate power, which is real evidence of absence.

### Full cohort, 43 models

| filter | pairs | share of testable |
|---|---|---|
| testable at n>=8 | 748 | - |
| raw p < 0.05 | 452 | 60% |
| BH-FDR q < 0.05 | 410 | 55% |
| Bonferroni | 128 | 17% |
| SOLID | 109 | 15% |

**SUPERSEDED 29 Aug 2026:** re-run gives 113 solid, 406 passing FDR, 250 underpowered.
The three figures above are the values as first computed and are kept for the record.

| grade | pairs | share |
|---|---|---|
| Solid | 109 | 15% |
| Significant but weak or uncertain | 301 | 40% |
| Underpowered, cannot conclude | 248 | 33% |
| Well-powered null | 90 | 12% |

Median CI width on r is 0.600, which is enormous. Median power to detect r=0.5 is 67%,
and only 36% of pairs have adequate power. So of 748 testable pairs, only about 109
support a confident statement, and a third are simply uninformative in either direction.

### The same analysis on a realistic shortlist

| cohort | testable | FDR q<0.05 | solid | underpowered | median power |
|---|---|---|---|---|---|
| Full (43) | 748 | 410 (55%) | 109 (15%) | 248 (33%) | 67% |
| Top 20 | 616 | 39 (6%) | 8 (1%) | 577 (94%) | 41% |
| Middle 20 (ranks 12-31) | 369 | 12 (3%) | 3 (1%) | 357 (97%) | 54% |

On a top-20 shortlist, 8 of 616 pairs are solid and 94% are underpowered. Zero pairs
reach a well-powered null, meaning nothing can be concluded from any non-significant
result. Median CI width rises to 0.884: a correlation estimated as +0.4 could plausibly
be -0.1 or +0.8.

This is the strictest version of the Section 17 finding. Among frontier models there is
almost no statistically defensible knowledge about how benchmarks relate to each other.
Twenty models is not enough to estimate a correlation matrix over forty metrics, and no
amount of methodology fixes it.

### What the solid pairs look like (109 at first count, 113 on the 29 Aug re-run)

The strongest are near-tautologies: aa_II ~ aa_TB21 +0.940 (n=40), arc1 ~ arc2 +0.936,
ar_webdev ~ ar_i2wd +0.929, lb_overall ~ lb_rsn +0.894. The most substantive
cross-source ones are aa_OmAcc ~ arc2 +0.900 [+0.787, +0.955], lb_overall ~ arc2 +0.880
[+0.747, +0.945], and aa_II ~ lb_overall +0.860 [+0.755, +0.922]. These three carry the
composite.

Only 7 solid pairs are negative, and they cluster on two metrics: AA's IFBench against
Arena Document (-0.805), Vision (-0.782) and Text (-0.687), and non-hallucination
against Arena Search (-0.751). Both are compliance/calibration measures that run against
everything else. Note all four have n between 8 and 12, so despite being "solid" by the
CI rule their intervals remain wide.

### What this changes about the earlier sections

Nothing in the ranking: the composite rests on the three cross-source correlations
above, all solid with tight intervals. But it substantially weakens the descriptive
claims. Statements like "instruction-following agreement is zero (r=+0.032)" come from
n=22 with roughly 60% power; that is consistent with a true correlation anywhere from
about -0.4 to +0.45. The correct reading is "no evidence of agreement," not "evidence of
no agreement." Section 15's construct-agreement table should be read with that caveat
throughout: only the reasoning cluster has enough data behind it to be called
established.

## 19. Limitations

1. Best-variant selection is not price-matched across sources. Section 5 corrects this
   for ARC only.
2. Cost bases differ up to 4x for the same model. Every horizontal position carries that
   uncertainty.
3. Speed, latency and AA cost come from one source. No cross-check possible.
4. The effort model captures decay but not turnover: Grok 4.5 and Claude Opus 4.6 remain
   misfitted.
5. Arena cells cannot be imputed; models missing Arena lose a pillar entirely.
6. Equal pillar weights are a choice. WITHDRAWN AND REVERSED by Section 21: the
   original claim was backwards. ARC weighting mildly favors ANTHROPIC (+0.08) over
   OpenAI (-0.05); Arena is Anthropic's WORST pillar (-0.39) and xAI's best (+0.45).
   LiveBench most favors OpenAI; Artificial Analysis most favors Google.
7. Range correction is Case II applied to Case III selection: treat corrected values as
   upper bounds.
8. Six of eleven headline metrics have under 1.2x dynamic range across the frontier.
   Correlations on them are attenuated by construction, and no statistical correction
   recovers signal a benchmark never had room to express.
9. No temporal control. Scores span Nov 2025 to Aug 2026; older models faced older
   harnesses.
10. Single snapshot, no test-retest. Intervals cover sampling and imputation error, not
    run-to-run variance in the benchmarks themselves.
11. The effort-aware frontier depends heavily on which rungs each vendor submitted.
    Gemini 3.7 Flash has only three tested rungs ending at $0.249; its dominance of the
    mid-range is extrapolated.
12. Construct labels are the analysis author's, not the providers'. The MTMM grid in
    Section 15 depends on how each metric was assigned to a construct; a different
    assignment would move the convergent-discriminant gap.
13. Cost was used as the effort proxy in Sections 4-6 and 14. Section 16 shows cost has
    elasticity only +0.50 w.r.t. tokens; response time (+0.95) is the better proxy.
    Those sections would shift if rebuilt on tokens.
14. Correlations are range-dependent (Section 17). Headline values describe the full
    43-model span; for a frontier-only shortlist the applicable figures are roughly 35%
    lower.
15. Only 15% of testable pairs are statistically solid (Section 18); 33% are
    underpowered. Most individual correlations quoted in Sections 2 and 15 are suggestive
    rather than established.

## 20. The learnings

Author's own summary, received 25 August 2026 alongside the master chart (all 43
models, composite with 95% intervals, evidence tier by color, frontier through six).

**1. No leaderboard is a sufficient statistic for another.** The three benchmark-style
overalls agree at r2 0.58-0.77. Arena agrees with none of them above 0.50. If you read
one leaderboard, you are reading roughly two-thirds of one axis.

**2. Most of what benchmarks measure is one factor wearing many names.** PC1 explains
53.8% of variance; effective dimensionality is 5.5 of 14. Remove the general factor
and only 15 of 190 pairs stay above r=0.60, down from 60. The convergent-discriminant
gap in the MTMM grid is +0.103: construct labels are real but thin.

**3. Only "reasoning" survives cross-provider validation.** GPQA, HLE, LiveBench
reasoning and ARC agree at r2 0.63-0.76. Coding agreement is 28%. Instruction-following
is +0.032: AA's IFBench and LiveBench's IF share a name and nothing else. Two agentic
pairs are negative.

**4. ARC-AGI-2's top correlate is a knowledge benchmark**, not a reasoning one:
Omniscience Accuracy at +0.900, above HLE and GPQA. It is the most informative single
pillar precisely because it loads so heavily on the general factor, which sits
awkwardly with its framing as knowledge-independent fluid intelligence.

**5. Effort curves are concave, and per-family fits cannot see it.** Pooled curvature
is ~~-0.847~~ **-0.552** (p=0.0007; coefficient WITHDRAWN and corrected 29 Aug 2026);
fitted per family it overfits and returns ceilings of 256%. Every
extrapolated iso-cost estimate moved DOWN once curvature was added: the log-linear
model was systematically optimistic.

**6. Resources compound while scores saturate.** Over four effort rungs:
time-to-first-answer 33.8x, response time 8x, cost 4.4x, throughput 1.1x, score +39.6
points then a ceiling. Across the top 20, benchmarks span 10-30% while cost spans 31x
and latency 22x. GPQA separates the best and worst frontier model by 5 points; it is
finished as a discriminator.

**7. There is a dead zone between $0.50 and $1.00** where the effort-aware frontier is
flat. Below $0.25 you get about 120 ARC points per dollar; above $2 you get 0.4.
Marginal cost per point varies 24x within a single model family depending on where you
sit, so any single "dollars per point" figure is meaningless.

**8. Restricting to the frontier destroys correlation signal, and the standard fix
barely works.** Mean |r| falls from 0.450 to 0.358 under top-20 restriction. Thorndike
Case II recovers 5% of the error, because selection was on a composite (Case III), not
one variable.

**9. The top three are statistically tied.** Fable 5, Opus 5 and Sol have overlapping
intervals; Fable 5 holds rank 1 in about half the draws. Ranks 12-25 have intervals
8-15 places wide and are not resolvable with this evidence.

**10. Two errors made along the way, both from the same mistake.** ARC was reported as
uncorrelated with Arena (r=+0.03); that came from averaging four Arena boards over
inconsistent subsets, and the real value is +0.665. And the speed term was built on
throughput, the one resource axis that barely moves. Both were cases of averaging or
picking a proxy without checking what it was actually made of.

### Why item 10 governs the site work

The site's model picker currently commits the second of those two errors in a related
form: it carries `tps` (throughput) per model, the axis proven to move 1.1x across four
effort rungs, while carrying `ttft` unused in scoring. Any speed signal the picker
surfaces from throughput is close to noise. This is the first thing to check against the
live artifact rather than against this document.

## 21. Limitations revisited: what has since been tested

The limitations list was written as a set of assertions. Six were testable and have now
been tested. One of them was wrong.

### Resolved

**"The effort model captures decay but not turnover."** There is no turnover to fit.
ARC-AGI-2 runs on a 120-task eval, giving a binomial SE of about 4.2 points near 70%.
Grok 4.5 scores 52.6 at both medium and high (difference 0.0, SE 6.4, p = 1.00). Claude
Opus 4.6 scores 69.2 at high and 68.8 at max (difference -0.4, SE 6.0, p = 0.95). Both
"turnovers" are a fraction of one standard error. The correct statement is that those
two families plateau, which the concave model already represents. Limitation withdrawn.

**"Range correction is Case II applied to Case III selection."** Case III is now
implemented, using each variable's correlation with the selection variable in the
unrestricted sample. Validated against the observable full cohort over ~~291~~ **369** pairs
(SUPERSEDED 29 Aug 2026):

| method | mean absolute error vs true full-cohort r |
|---|---|
| uncorrected restricted r | 0.291 |
| Thorndike Case II | 0.258 |
| Thorndike Case III | ~~0.133~~ **0.125** |

Case III halves the error where Case II recovered only 11%. Section 7's corrected column
should be replaced by Case III values, and they are estimates rather than upper bounds.

### Corrected: the original claim was wrong

**"Weighting toward ARC favors OpenAI; toward Arena favors Anthropic."** Both halves are
backwards. Mean pillar z-score by vendor, as each pillar's advantage relative to that
vendor's own average across pillars:

| vendor | LiveBench | ARC | AA | Arena |
|---|---|---|---|---|
| Anthropic (n=7) | +0.07 | +0.08 | +0.24 | -0.39 |
| OpenAI (n=9) | +0.22 | -0.05 | -0.36 | +0.19 |
| Google (n=5) | -0.10 | +0.00 | +0.26 | -0.17 |
| xAI (n=4) | -0.64 | -0.04 | +0.22 | +0.45 |

ARC weighting mildly favors Anthropic, not OpenAI. Arena weighting is Anthropic's worst
pillar by a wide margin and xAI's best. The pillar that most favors OpenAI is LiveBench;
the one that most favors Google is Artificial Analysis. A plausible-sounding relationship
was asserted without checking it. Per-vendor samples are n=4-9, so directional, not
precise.

### Weakened

**"Arena cells cannot be imputed."** Too strong. Better predictor sets help:

| specification | n | R2 | LOOCV RMSE |
|---|---|---|---|
| arena ~ lb_overall | 29 | 0.240 | 68.5 Elo |
| arena ~ lb + aa_II + arc2 | 20 | 0.388 | 64.6 Elo |
| arena ~ aa_II + aa_MMMU | 20 | 0.432 | 59.0 Elo |
| arena ~ lb + aa_MMMU + aa_LCR | 20 | 0.444 | 61.6 Elo |

Adding a vision benchmark nearly doubles R2, which makes sense: Arena voters see
multimodal output. But the best LOOCV error is still 59 Elo against a top-20 spread of
200 Elo, 30% of the entire range. The honest restatement is not "cannot be imputed" but
"can only be imputed with an error worth a third of the signal," still too poor for the
composite. The decision stands; the reasoning was overstated.

**"No temporal control."** Now tested. The composite correlates with release month at
r = +0.498 (p = 0.008, n = 27): newer models score higher, expected rather than a
confound. Partialling release date out of the key bridge moves r(arc2, lb_overall) from
+0.774 to +0.789, marginally stronger. Date is not a confound for the correlation
structure. Downgraded to: the cohort spans nine months of harness evolution, which
affects levels but not relationships between metrics.

**"Construct labels are mine, not the providers'."** Tested by permutation. The
assignment produces a convergent-minus-discriminant gap of +0.236; 300 random
relabellings produce -0.002 +/- 0.076, permutation p < 0.001. The labels carry real
signal and are not an arbitrary carve-up. The gap's size would shift under a different
reasonable assignment, but its existence is established.

### Still standing unchanged

Best-variant selection is price-matched only for ARC (cost) and the AA index (tokens,
Section 16), not for LiveBench or Arena, which publish no effort ladders. Cost bases
still differ up to 4x per model. Speed and latency still come from one source, and
Section 16's partial cross-check FAILED: cost-derived and time-derived token counts
correlate only r = 0.528. Six of eleven headline metrics still have under 1.2x dynamic
range. There is still no test-retest data. The effort-aware frontier still depends on
which rungs vendors chose to submit.

## 22. Corrections and reconciliations from the 29 August 2026 picker build

Written down because they existed only in relayed messages. A correction that is
explained and never recorded reads exactly like one that was applied, which is the
failure this section exists to prevent. Each entry says what was believed, what
disproved it, and what stands.

### Claims withdrawn or corrected in this document

| claim as first written | what disproved it | what stands |
|---|---|---|
| Effort-aware frontier flat from $0.50 to $1.00, with three regimes of marginal return | Restricting the frontier to measured rungs removes the flat region entirely | WITHDRAWN. GPT-5.6 Sol climbs continuously 83.9 to 93.5 across $0.396-$1.417. Gemini 3.7 Flash's tested band is $0.081-$0.245 and its top score is a measured 83.9, not an extrapolated 92.0 |
| Pooled shared curvature -0.847 | Recomputation | -0.552. F=12.82, p=0.0007 unchanged |
| 109 solid pairs, 410 passing FDR, 248 underpowered | Re-run | 113, 406, 250 |
| Case III mean absolute error 0.133, validated on 291 pairs | Re-run on a wider validation set | 0.125 on 369 pairs |
| 42 merged columns | Recount | 45 |
| Section 5's iso-cost table is the effort-normalized answer | An iso-token normalization over 62 rungs across 22 families | Both stand for different questions. Iso-token and iso-dollar orderings agree at only rho = +0.503, and eight of twelve families move two or more places |
| Vendor differences in effort-dial range confound a weak dial with a model near its ceiling, so the comparison must not be stated | Measuring the share of AVAILABLE headroom each family uses | The confound does not hold. Anthropic 33%, OpenAI 69%, Welch t = -3.42, p = 0.014. Opus 4.5 starts at 9.4 with 90.6 points of headroom and still uses 31%. Directional at n = 4 to 6 per vendor |
| Score against resources is saturating in log, but logistic and log-quadratic are tied at 0.2% and no form should be called established | The pooled tie was an artifact of averaging families with different curvature | Logistic. It wins 5 of 6 families and beats log-linear by 30 to 45% on four of them |
| Restricting to the frontier attenuates correlations, so any picker figure larger than this document's indicates a calculation error | Case III on the top 20 | True in general and FALSE for the non-hallucination pairs. `aa_NonHall ~ lb_overall` goes from -0.211 on the full cohort to -0.510 on the top 20. The effect sharpens at the frontier |
| Figures traceable only to this document must carry a "not verified against a primary board" caveat on any page that shows them | The figures were read off ARC Prize, Arena, LiveBench and Artificial Analysis directly | WITHDRAWN. Provenance is primary. The unverified step is transcription, not sourcing. Cite the board, the column and the read date |
| Two items were blocked: the transcription check needed the original documents, and per-family form races needed n >= 6 | The documents were available throughout, and n >= 6 was a self-chosen threshold on ladders that mostly have 5 rungs | Neither was blocked. Both ran once the assumption was checked |

### A verifier can be less reliable than the thing it verifies

A transcription audit flagged six discrepancies. Three were the audit's own errors: it
merged GPT-5.4 Pro into GPT-5.4 and GPT-5.5 Pro into GPT-5.5, which are distinct effort
tiers, and it misread Kimi K2.5 as K2.6 and Minimax M2.5 as M3. The original data was
right in all four. The three real discrepancies were best-variant selection, on a metric
nothing downstream uses. A re-transcription being fresher does not make it more
trustworthy, and a firing assertion is a hypothesis about the data rather than a verdict
on it.

### Measured on the picker's own 23-model cohort, not carried from this document

These were computed from `window.__MP__` and from the repo's own captured board files by
`scripts/measure-dial-discrimination.py`. Two of them are adjustments this document found
null on 43 models and which are NOT null on a frontier-only cohort of 23.

| finding | value |
|---|---|
| PC1 across the picker's ten scored figures | 42.8% |
| Effective dimensionality | 5.26 of 10 |
| Median leave-one-model-out r2 predicting each figure from the other nine | 0.35, and negative for LiveBench coding |
| Pairs passing BH-FDR at q<0.05, of 45 | 12 |
| Pairs also clearing an interval beyond r=0.5 | 3 |
| Distinct top-1 models over 6,000 random weightings, ten dials vs six | 7 vs 10 |
| Distinct top-3 sets, ten dials vs six | 23 vs 52 |
| Mean 1 minus Spearman between two readers' rankings, ten dials vs six | 0.135 vs 0.239 |
| Typical model's 5th-to-95th-percentile rank band over 5,000 weightings | 9.2 places of 23 |
| Share of weightings won by Claude Opus 5 or Claude Fable 5 | 84% |
| Placement axis, leave-one-family-out error predicting normalized capability | log price 0.167, time to first token 0.214, tokens 0.241, response time 0.260 |
| Families whose ladder spans under 0.25 doublings | price 1 of 17, response time 4 of 20 |
| Median share of cost per task not spent generating output, 101 priced AA rows | 96% |
| Cost per task against cost per 1,000 generated tokens, log-log | r = +0.688 |
| Tokens generated per task against the picker's default score, n=21 | r = +0.16, not significant |
| Logit rather than percentage averaging | Spearman +0.972, top two swap |
| Reliability weighting of figures | Spearman +0.765, one model moves 11 places, and it almost silences non-hallucination whose measured spread is entirely error by that test |
| AA figures in the blob matching a rung in `data/aa-2026-08-25.md` | 88 of 88 |

### What the picker implements and what only lives here

In the tool: ten scored figures, six dials, the move to a common effort setting, the
value chart, and the Monte Carlo. Only here: the token-normalized cost axis, the fitted
per-family effort curves, and any comparison holding computation equal rather than money.
