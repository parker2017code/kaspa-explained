# LiveBench extra data (subtask / component scores)

Source: https://livebench.ai (single-page app; Leaderboard + Insights sections)
Read date: 20 August 2026
Snapshot / release shown by the site: LiveBench-2026-06-25 ("the latest release", marked live)

## Method note

All 44 model rows are present in the page DOM at once (verified: `tbody tr.row`
count = 44 both before and after any interaction, matching the 44 rows printed
in the rendered leaderboard text) - there is no scroll-triggered lazy loading
on this table, so no additional rows were missed by not scrolling.

Component ("subtask") scores were reached by clicking the expand arrow on each
leaderboard row, which reveals a fixed set of subtask scores under each of the
7 categories. Data was extracted from the rendered DOM of each expanded row,
verbatim, for all 44 models. No error bar, standard error, or run-count field
exists anywhere in the expanded-row markup or elsewhere on the page - none is
published.

## Top-level columns - no new ones found

The leaderboard's only top-level scored columns are: Overall, Reasoning,
Coding, Agentic Coding, Mathematics, Data Analysis, Language, Instruction
Following, and Cost per successful task. This is the complete set already
held (lbCoding, lbAgenticCoding, lbMath, lbDataAnalysis, lbLanguage,
lbInstructionFollowing, lbReasoning, lbOverall, lbCostPerSuccessTask). No
additional top-level scored column is published on the leaderboard, the
Insights tab, or the Details/paper page.

The Insights tab's "Cost, ranked" panel mentions hovering reveals "$/1M
output and verbosity" per model, but this is a chart tooltip rendered only on
mouse hover with no value present in the static DOM; it is not a published
column value and was not capturable without an unreliable hover-and-read
loop, so it is recorded here as unreachable rather than guessed.

## Models present vs. models of interest

All requested models of interest were found except two, which do not appear
anywhere in this LiveBench release (confirmed via the page's own model search
box, which returned zero rows for these strings):

- **GLM-5.3** - missing. Only "GLM-5.2" is present.
- **Qwen3.8 2.4T A95B** - missing. Only "Qwen 3.8 Max", "Qwen3.8 27B",
  "Qwen 3.7 Max", "Qwen 3.6 Plus", "Qwen 3.6 27B" are present.

All other named models of interest are present, each exactly once, under the
row names used in the tables below (e.g. "Claude Fable 5 Max Effort",
"Claude 5 Opus Thinking Max Effort" = Claude Opus 5, "Claude Sonnet 5 xHigh
Effort", "GPT-5.6 Sol Max Effort", "GPT-5.6 Terra Max Effort", "GPT-5.6 Luna
Max Effort", "Gemini 3.1 Pro Preview High", "Gemini 3.6 Flash High",
"Gemini 3.7 Flash High", "Grok 4.5", "Grok 4.6", "Kimi K3", "DeepSeek V4 Pro"
and "DeepSeek V4 Pro 0813", "DeepSeek V4 Flash" and "DeepSeek V4 Flash 0731",
"GLM-5.2", "Qwen 3.8 Max", "Qwen3.8 27B", "Muse Spark 1.1 xHigh Effort",
"Muse Spark 1.2 xHigh Effort").

Every row name below is copied verbatim as printed by LiveBench, including
its effort/reasoning-tier suffix where the site prints one. Where LiveBench
prints no effort suffix at all (e.g. "Kimi K3", "DeepSeek V4 Pro 0813",
"GLM-5.2", "Grok 4.5", "Grok 4.6", "Grok 4.3", "Smaug-Agentic", "Minimax M3",
"Qwen 3.7 Max", "Qwen 3.6 Plus", "Gemini 3.1/3.5/3.6/3.7 ... High" - note
"High" here is a reasoning-effort suffix LiveBench does print, so those are
not blank), this is a printed fact of the site, not an omission on this
document's part.

## Model metadata (org, version string where shown)

| Model (exact LiveBench label) | From (org) | Version / notes |
|---|---|---|
| Claude Fable 5 Max Effort | Anthropic | - |
| GPT-5.6 Sol Max Effort | OpenAI | - |
| GPT-5.5 Thinking xHigh Effort | OpenAI | 2026-04-23 |
| Claude 5 Opus Thinking Max Effort | Anthropic | 2026-07-22 |
| Smaug-Agentic [open, finetune] | Abacus.AI | base model: Kimi K3 (Moonshot AI) |
| Kimi K3 [open] | Moonshot AI | - |
| Gemini 3.7 Flash High | Google | - |
| Qwen 3.8 Max [open] | Alibaba | - |
| Grok 4.6 | xAI | - |
| GPT-5.4 Thinking xHigh Effort | OpenAI | 2026-03-05 |
| Muse Spark 1.2 xHigh Effort | Meta | - |
| GPT-5.6 Terra Max Effort | OpenAI | - |
| DeepSeek V4 Pro 0813 [open] | DeepSeek | - |
| Gemini 3.1 Pro Preview High | Google | - |
| Claude 4.7 Opus Thinking xHigh Effort | Anthropic | 2026-04-16 |
| Claude 4.8 Opus Thinking Max Effort | Anthropic | 2026-04-16 |
| Claude Sonnet 5 xHigh Effort | Anthropic | - |
| Grok 4.5 | xAI | - |
| Muse Spark 1.1 xHigh Effort | Meta | - |
| Qwen3.8 27B [open] | Alibaba | - |
| Gemini 3.5 Flash High | Google | 2026-05-19 |
| GPT-5.2 High | OpenAI | 2025-12-11 |
| Claude 4.6 Opus Thinking High Effort | Anthropic | 2026-02-05 |
| DeepSeek V4 Flash 0731 [open] | DeepSeek | - |
| GPT-5.2 Codex | OpenAI | 2026-01-14 |
| Gemini 3.6 Flash High | Google | - |
| GPT-5.6 Luna Max Effort | OpenAI | - |
| GLM-5.2 [open] | Z.AI | - |
| Qwen 3.7 Max | Alibaba | - |
| Claude 4.6 Sonnet Thinking Medium Effort | Anthropic | 2026-02-17 |
| Claude 4.5 Opus Thinking High Effort | Anthropic | 2025-11-01 |
| Inkling xHigh Effort | Thinking Machines | - |
| DeepSeek V4 Pro [open] | DeepSeek | - |
| Kimi K2.6 Thinking [open] | Moonshot AI | - |
| GPT-5.4 Nano xHigh | OpenAI | 2026-03-17 |
| Qwen 3.6 Plus | Alibaba | 2026-04-02 |
| Kimi K2.7 Code [open] | Moonshot AI | - |
| Grok Build 0.1 | xAI | - |
| Minimax M3 | Minimax | - |
| GPT-5.4 Mini xHigh | OpenAI | 2026-03-17 |
| DeepSeek V4 Flash [open] | DeepSeek | - |
| Qwen 3.6 27B [open] | Alibaba | - |
| Gemini 3.5 Flash-Lite High | Google | - |
| Grok 4.3 | xAI | - |

"[open]" = flagged "open" (open-weights) by LiveBench's own UI badge.
"-" = no version string printed for that row.

---

## Reasoning subtasks

Columns: theory of mind, zebra puzzle, spatial, logic with navigation

| Model | theory of mind | zebra puzzle | spatial | logic with navigation |
|---|---|---|---|---|
| Claude Fable 5 Max Effort | 84.6 | 100.0 | 96.0 | 78.0 |
| GPT-5.6 Sol Max Effort | 84.6 | 100.0 | 100.0 | 82.0 |
| GPT-5.5 Thinking xHigh Effort | 84.6 | 100.0 | 98.0 | 76.0 |
| Claude 5 Opus Thinking Max Effort | 78.8 | 100.0 | 100.0 | 86.0 |
| Smaug-Agentic | 78.8 | 98.3 | 100.0 | 84.0 |
| Kimi K3 | 82.7 | 100.0 | 100.0 | 80.0 |
| Gemini 3.7 Flash High | 82.7 | 94.5 | 100.0 | 74.0 |
| Qwen 3.8 Max | 78.8 | 100.0 | 100.0 | 74.0 |
| Grok 4.6 | 86.5 | 95.5 | 98.0 | 82.0 |
| GPT-5.4 Thinking xHigh Effort | 88.5 | 98.0 | 98.0 | 68.0 |
| Muse Spark 1.2 xHigh Effort | 80.8 | 95.3 | 96.0 | 88.0 |
| GPT-5.6 Terra Max Effort | 86.5 | 100.0 | 100.0 | 76.0 |
| DeepSeek V4 Pro 0813 | 84.6 | 96.8 | 96.0 | 66.0 |
| Gemini 3.1 Pro Preview High | 80.8 | 85.3 | 98.0 | 72.0 |
| Claude 4.7 Opus Thinking xHigh Effort | 80.8 | 98.0 | 100.0 | 70.0 |
| Claude 4.8 Opus Thinking Max Effort | 80.8 | 100.0 | 98.0 | 78.0 |
| Claude Sonnet 5 xHigh Effort | 80.8 | 88.0 | 100.0 | 86.0 |
| Grok 4.5 | 82.7 | 94.0 | 100.0 | 72.0 |
| Muse Spark 1.1 xHigh Effort | 76.9 | 96.0 | 100.0 | 78.0 |
| Qwen3.8 27B | 59.6 | 96.5 | 96.0 | 68.0 |
| Gemini 3.5 Flash High | 80.8 | 77.3 | 96.0 | 74.0 |
| GPT-5.2 High | 78.8 | 84.0 | 96.0 | 74.0 |
| Claude 4.6 Opus Thinking High Effort | 82.7 | 94.0 | 98.0 | 80.0 |
| DeepSeek V4 Flash 0731 | 86.5 | 100.0 | 90.0 | 70.0 |
| GPT-5.2 Codex | 78.8 | 70.0 | 94.0 | 68.0 |
| Gemini 3.6 Flash High | 78.8 | 85.8 | 100.0 | 76.0 |
| GPT-5.6 Luna Max Effort | 73.1 | 93.5 | 96.0 | 80.0 |
| GLM-5.2 | 75.0 | 65.5 | 94.0 | 80.0 |
| Qwen 3.7 Max | 78.8 | 74.5 | 96.0 | 84.0 |
| Claude 4.6 Sonnet Thinking Medium Effort | 73.1 | 96.0 | 100.0 | 70.0 |
| Claude 4.5 Opus Thinking High Effort | 78.8 | 77.5 | 96.0 | 68.0 |
| Inkling xHigh Effort | 65.4 | 88.0 | 94.0 | 66.0 |
| DeepSeek V4 Pro | 80.8 | 92.0 | 94.0 | 64.0 |
| Kimi K2.6 Thinking | 75.0 | 78.5 | 94.0 | 70.0 |
| GPT-5.4 Nano xHigh | 80.8 | 97.6 | 82.0 | 64.0 |
| Qwen 3.6 Plus | 67.3 | 68.0 | 98.0 | 70.0 |
| Kimi K2.7 Code | 69.2 | 96.0 | 92.0 | 74.0 |
| Grok Build 0.1 | 69.2 | 68.3 | 98.0 | 70.0 |
| Minimax M3 | 76.9 | 61.0 | 94.0 | 66.0 |
| GPT-5.4 Mini xHigh | 76.9 | 60.4 | 88.0 | 60.0 |
| DeepSeek V4 Flash | 73.1 | 49.3 | 96.0 | 64.0 |
| Qwen 3.6 27B | 65.4 | 53.8 | 100.0 | 62.0 |
| Gemini 3.5 Flash-Lite High | 50.0 | 32.8 | 90.0 | 68.0 |
| Grok 4.3 | 61.5 | 57.8 | 98.0 | 66.0 |

## Coding subtasks

Columns: code generation, code completion

| Model | code generation | code completion |
|---|---|---|
| Claude Fable 5 Max Effort | 91.5 | 80.4 |
| GPT-5.6 Sol Max Effort | 83.1 | 84.8 |
| GPT-5.5 Thinking xHigh Effort | 81.7 | 82.6 |
| Claude 5 Opus Thinking Max Effort | 80.3 | 82.6 |
| Smaug-Agentic | 84.5 | 80.4 |
| Kimi K3 | 80.3 | 82.6 |
| Gemini 3.7 Flash High | 81.7 | 76.1 |
| Qwen 3.8 Max | 71.8 | 73.9 |
| Grok 4.6 | 77.5 | 76.1 |
| GPT-5.4 Thinking xHigh Effort | 74.6 | 80.4 |
| Muse Spark 1.2 xHigh Effort | 74.6 | 80.4 |
| GPT-5.6 Terra Max Effort | 76.1 | 80.4 |
| DeepSeek V4 Pro 0813 | 76.1 | 78.3 |
| Gemini 3.1 Pro Preview High | 74.6 | 78.3 |
| Claude 4.7 Opus Thinking xHigh Effort | 85.9 | 78.3 |
| Claude 4.8 Opus Thinking Max Effort | 78.9 | 84.8 |
| Claude Sonnet 5 xHigh Effort | 83.1 | 78.3 |
| Grok 4.5 | 67.6 | 69.6 |
| Muse Spark 1.1 xHigh Effort | 76.1 | 78.3 |
| Qwen3.8 27B | 77.5 | 73.9 |
| Gemini 3.5 Flash High | 80.3 | 76.1 |
| GPT-5.2 High | 76.1 | 76.1 |
| Claude 4.6 Opus Thinking High Effort | 80.3 | 76.1 |
| DeepSeek V4 Flash 0731 | 76.1 | 73.9 |
| GPT-5.2 Codex | 80.3 | 87.0 |
| Gemini 3.6 Flash High | 77.5 | 78.3 |
| GPT-5.6 Luna Max Effort | 78.9 | 87.0 |
| GLM-5.2 | 78.9 | 80.4 |
| Qwen 3.7 Max | 78.9 | 69.6 |
| Claude 4.6 Sonnet Thinking Medium Effort | 80.3 | 78.3 |
| Claude 4.5 Opus Thinking High Effort | 78.9 | 80.4 |
| Inkling xHigh Effort | 74.6 | 67.4 |
| DeepSeek V4 Pro | 70.4 | 69.6 |
| Kimi K2.6 Thinking | 78.9 | 78.3 |
| GPT-5.4 Nano xHigh | 74.3 | 67.4 |
| Qwen 3.6 Plus | 80.3 | 76.1 |
| Kimi K2.7 Code | 71.8 | 76.1 |
| Grok Build 0.1 | 63.4 | 67.4 |
| Minimax M3 | 69.0 | 67.4 |
| GPT-5.4 Mini xHigh | 67.7 | 75.6 |
| DeepSeek V4 Flash | 73.2 | 65.2 |
| Qwen 3.6 27B | 71.8 | 71.7 |
| Gemini 3.5 Flash-Lite High | 76.1 | 76.1 |
| Grok 4.3 | 74.6 | 65.2 |

## Agentic Coding subtasks

Columns: javascript, typescript, python

| Model | javascript | typescript | python |
|---|---|---|---|
| Claude Fable 5 Max Effort | 68.2 | 53.3 | 65.0 |
| GPT-5.6 Sol Max Effort | 63.6 | 50.0 | 55.0 |
| GPT-5.5 Thinking xHigh Effort | 63.6 | 43.3 | 55.0 |
| Claude 5 Opus Thinking Max Effort | 77.3 | 43.3 | 75.0 |
| Smaug-Agentic | 77.3 | 56.7 | 60.0 |
| Kimi K3 | 68.2 | 53.3 | 65.0 |
| Gemini 3.7 Flash High | 68.2 | 46.7 | 60.0 |
| Qwen 3.8 Max | 77.3 | 56.7 | 60.0 |
| Grok 4.6 | 72.7 | 43.3 | 55.0 |
| GPT-5.4 Thinking xHigh Effort | 68.2 | 43.3 | 50.0 |
| Muse Spark 1.2 xHigh Effort | 72.7 | 50.0 | 50.0 |
| GPT-5.6 Terra Max Effort | 68.2 | 46.7 | 50.0 |
| DeepSeek V4 Pro 0813 | 68.2 | 46.7 | 50.0 |
| Gemini 3.1 Pro Preview High | 59.1 | 23.3 | 50.0 |
| Claude 4.7 Opus Thinking xHigh Effort | 63.6 | 43.3 | 45.0 |
| Claude 4.8 Opus Thinking Max Effort | 68.2 | 33.3 | 50.0 |
| Claude Sonnet 5 xHigh Effort | 68.2 | 50.0 | 60.0 |
| Grok 4.5 | 72.7 | 36.7 | 60.0 |
| Muse Spark 1.1 xHigh Effort | 77.3 | 43.3 | 55.0 |
| Qwen3.8 27B | 59.1 | 50.0 | 75.0 |
| Gemini 3.5 Flash High | 63.6 | 33.3 | 50.0 |
| GPT-5.2 High | 59.1 | 36.7 | 55.0 |
| Claude 4.6 Opus Thinking High Effort | 63.6 | 33.3 | 50.0 |
| DeepSeek V4 Flash 0731 | 63.6 | 26.7 | 50.0 |
| GPT-5.2 Codex | 68.2 | 20.0 | 60.0 |
| Gemini 3.6 Flash High | 63.6 | 26.7 | 40.0 |
| GPT-5.6 Luna Max Effort | 63.6 | 36.7 | 45.0 |
| GLM-5.2 | 63.6 | 36.7 | 55.0 |
| Qwen 3.7 Max | 59.1 | 26.7 | 45.0 |
| Claude 4.6 Sonnet Thinking Medium Effort | 54.5 | 23.3 | 50.0 |
| Claude 4.5 Opus Thinking High Effort | 59.1 | 20.0 | 40.0 |
| Inkling xHigh Effort | 68.2 | 30.0 | 50.0 |
| DeepSeek V4 Pro | 54.5 | 23.3 | 50.0 |
| Kimi K2.6 Thinking | 59.1 | 26.7 | 55.0 |
| GPT-5.4 Nano xHigh | 63.6 | 26.7 | 50.0 |
| Qwen 3.6 Plus | 59.1 | 20.0 | 45.0 |
| Kimi K2.7 Code | 63.6 | 23.3 | 50.0 |
| Grok Build 0.1 | 59.1 | 33.3 | 45.0 |
| Minimax M3 | 63.6 | 23.3 | 35.0 |
| GPT-5.4 Mini xHigh | 50.0 | 20.0 | 55.0 |
| DeepSeek V4 Flash | 54.5 | 23.3 | 35.0 |
| Qwen 3.6 27B | 54.5 | 23.3 | 40.0 |
| Gemini 3.5 Flash-Lite High | 59.1 | 26.7 | 50.0 |
| Grok 4.3 | 27.3 | 13.3 | 15.0 |

## Mathematics subtasks

Columns: AMPS Hard, integrals with game, math comp, olympiad

| Model | AMPS Hard | integrals with game | math comp | olympiad |
|---|---|---|---|---|
| Claude Fable 5 Max Effort | 99.0 | 97.0 | 95.1 | 92.8 |
| GPT-5.6 Sol Max Effort | 98.0 | 100.0 | 95.1 | 91.7 |
| GPT-5.5 Thinking xHigh Effort | 97.0 | 99.0 | 96.1 | 91.4 |
| Claude 5 Opus Thinking Max Effort | 99.0 | 97.0 | 94.1 | 92.8 |
| Smaug-Agentic | 98.0 | 52.0 | 94.1 | 91.6 |
| Kimi K3 | 97.0 | 54.0 | 95.1 | 91.6 |
| Gemini 3.7 Flash High | 98.0 | 88.0 | 96.1 | 91.8 |
| Qwen 3.8 Max | 98.0 | 81.0 | 95.1 | 91.2 |
| Grok 4.6 | 97.0 | 85.0 | 97.1 | 91.2 |
| GPT-5.4 Thinking xHigh Effort | 98.0 | 93.0 | 94.1 | 91.5 |
| Muse Spark 1.2 xHigh Effort | 89.0 | 91.0 | 97.1 | 87.8 |
| GPT-5.6 Terra Max Effort | 98.0 | 95.0 | 95.1 | 91.5 |
| DeepSeek V4 Pro 0813 | 98.0 | 94.0 | 97.1 | 91.3 |
| Gemini 3.1 Pro Preview High | 98.0 | 78.0 | 96.1 | 92.1 |
| Claude 4.7 Opus Thinking xHigh Effort | 98.0 | 84.0 | 98.0 | 91.4 |
| Claude 4.8 Opus Thinking Max Effort | 98.0 | 89.0 | 98.0 | 92.2 |
| Claude Sonnet 5 xHigh Effort | 98.0 | 88.0 | 95.1 | 90.7 |
| Grok 4.5 | 99.0 | 78.0 | 97.1 | 89.2 |
| Muse Spark 1.1 xHigh Effort | 82.0 | 83.0 | 96.1 | 87.5 |
| Qwen3.8 27B | 98.0 | 65.0 | 94.1 | 87.7 |
| Gemini 3.5 Flash High | 98.0 | 68.0 | 95.1 | 91.9 |
| GPT-5.2 High | 97.0 | 92.0 | 95.1 | 88.6 |
| Claude 4.6 Opus Thinking High Effort | 97.0 | 73.0 | 95.1 | 92.2 |
| DeepSeek V4 Flash 0731 | 97.0 | 65.0 | 96.1 | 89.1 |
| GPT-5.2 Codex | 98.0 | 75.0 | 95.1 | 87.0 |
| Gemini 3.6 Flash High | 98.0 | 63.0 | 94.1 | 90.5 |
| GPT-5.6 Luna Max Effort | 98.0 | 70.0 | 92.2 | 88.6 |
| GLM-5.2 | 98.0 | 76.0 | 96.1 | 89.0 |
| Qwen 3.7 Max | 98.0 | 59.0 | 97.1 | 86.9 |
| Claude 4.6 Sonnet Thinking Medium Effort | 76.0 | 90.0 | 94.1 | 87.9 |
| Claude 4.5 Opus Thinking High Effort | 99.0 | 78.0 | 95.1 | 89.5 |
| Inkling xHigh Effort | 99.0 | 72.0 | 97.1 | 85.4 |
| DeepSeek V4 Pro | 98.0 | 78.0 | 96.1 | 90.6 |
| Kimi K2.6 Thinking | 97.0 | 54.0 | 96.1 | 90.0 |
| GPT-5.4 Nano xHigh | 98.0 | 82.8 | 95.1 | 88.0 |
| Qwen 3.6 Plus | 97.0 | 62.0 | 93.1 | 82.8 |
| Kimi K2.7 Code | 97.0 | 37.0 | 94.1 | 90.3 |
| Grok Build 0.1 | 66.0 | 66.0 | 95.1 | 86.6 |
| Minimax M3 | 75.0 | 56.0 | 91.2 | 85.6 |
| GPT-5.4 Mini xHigh | 97.0 | 37.0 | 94.1 | 85.7 |
| DeepSeek V4 Flash | 98.0 | 37.0 | 97.1 | 86.5 |
| Qwen 3.6 27B | 93.0 | 52.0 | 92.2 | 82.3 |
| Gemini 3.5 Flash-Lite High | 95.0 | 26.0 | 92.2 | 81.8 |
| Grok 4.3 | 97.0 | 63.0 | 95.1 | 82.3 |

## Data Analysis subtasks

Columns: consecutive events, table join, table reformat

| Model | consecutive events | table join | table reformat |
|---|---|---|---|
| Claude Fable 5 Max Effort | 91.4 | 56.1 | 94.1 |
| GPT-5.6 Sol Max Effort | 90.2 | 49.3 | 100.0 |
| GPT-5.5 Thinking xHigh Effort | 88.8 | 55.9 | 100.0 |
| Claude 5 Opus Thinking Max Effort | 77.6 | 52.0 | 94.1 |
| Smaug-Agentic | 90.4 | 51.2 | 98.0 |
| Kimi K3 | 89.8 | 48.4 | 98.0 |
| Gemini 3.7 Flash High | 60.4 | 45.5 | 98.0 |
| Qwen 3.8 Max | 87.1 | 50.1 | 98.0 |
| Grok 4.6 | 78.1 | 43.4 | 100.0 |
| GPT-5.4 Thinking xHigh Effort | 86.2 | 51.8 | 100.0 |
| Muse Spark 1.2 xHigh Effort | 82.5 | 46.8 | 100.0 |
| GPT-5.6 Terra Max Effort | 87.7 | 50.3 | 100.0 |
| DeepSeek V4 Pro 0813 | 90.2 | 49.5 | 98.0 |
| Gemini 3.1 Pro Preview High | 85.2 | 52.3 | 98.0 |
| Claude 4.7 Opus Thinking xHigh Effort | 89.5 | 47.2 | 98.0 |
| Claude 4.8 Opus Thinking Max Effort | 52.9 | 51.1 | 94.1 |
| Claude Sonnet 5 xHigh Effort | 74.7 | 42.4 | 98.0 |
| Grok 4.5 | 75.5 | 43.6 | 100.0 |
| Muse Spark 1.1 xHigh Effort | 71.1 | 46.6 | 100.0 |
| Qwen3.8 27B | 84.9 | 48.8 | 96.1 |
| Gemini 3.5 Flash High | 48.0 | 50.5 | 96.1 |
| GPT-5.2 High | 88.9 | 45.6 | 100.0 |
| Claude 4.6 Opus Thinking High Effort | 63.5 | 48.2 | 98.0 |
| DeepSeek V4 Flash 0731 | 89.4 | 48.5 | 100.0 |
| GPT-5.2 Codex | 89.0 | 45.6 | 100.0 |
| Gemini 3.6 Flash High | 43.8 | 47.1 | 98.0 |
| GPT-5.6 Luna Max Effort | 86.5 | 47.6 | 100.0 |
| GLM-5.2 | 79.3 | 45.9 | 96.1 |
| Qwen 3.7 Max | 71.8 | 45.5 | 98.0 |
| Claude 4.6 Sonnet Thinking Medium Effort | 92.7 | 45.1 | 96.1 |
| Claude 4.5 Opus Thinking High Effort | 79.4 | 45.9 | 98.0 |
| Inkling xHigh Effort | 69.9 | 48.5 | 100.0 |
| DeepSeek V4 Pro | 75.4 | 48.2 | 100.0 |
| Kimi K2.6 Thinking | 51.3 | 46.1 | 98.0 |
| GPT-5.4 Nano xHigh | 54.3 | 50.6 | 98.0 |
| Qwen 3.6 Plus | 67.0 | 44.7 | 98.0 |
| Kimi K2.7 Code | 48.3 | 47.5 | 92.2 |
| Grok Build 0.1 | 69.7 | 42.7 | 100.0 |
| Minimax M3 | 84.6 | 45.8 | 98.0 |
| GPT-5.4 Mini xHigh | 63.0 | 49.4 | 100.0 |
| DeepSeek V4 Flash | 59.9 | 46.1 | 98.0 |
| Qwen 3.6 27B | 70.4 | 42.8 | 98.0 |
| Gemini 3.5 Flash-Lite High | 21.1 | 40.6 | 98.0 |
| Grok 4.3 | 28.0 | 41.3 | 98.0 |

## Language subtasks (all reachable component scores)

Columns: connections, plot unscrambling, typos

| Model | connections | plot unscrambling | typos |
|---|---|---|---|
| Claude Fable 5 Max Effort | 99.3 | 78.7 | 94.0 |
| GPT-5.6 Sol Max Effort | 100.0 | 79.1 | 84.0 |
| GPT-5.5 Thinking xHigh Effort | 100.0 | 74.1 | 88.0 |
| Claude 5 Opus Thinking Max Effort | 99.3 | 74.7 | 92.0 |
| Smaug-Agentic | 100.0 | 71.1 | 82.0 |
| Kimi K3 | 100.0 | 72.6 | 84.0 |
| Gemini 3.7 Flash High | 100.0 | 66.4 | 90.0 |
| Qwen 3.8 Max | 94.5 | 58.6 | 86.0 |
| Grok 4.6 | 100.0 | 67.1 | 84.0 |
| GPT-5.4 Thinking xHigh Effort | 100.0 | 65.9 | 82.0 |
| Muse Spark 1.2 xHigh Effort | 100.0 | 61.7 | 74.0 |
| GPT-5.6 Terra Max Effort | 93.0 | 69.7 | 86.0 |
| DeepSeek V4 Pro 0813 | 100.0 | 64.2 | 82.0 |
| Gemini 3.1 Pro Preview High | 100.0 | 74.1 | 82.0 |
| Claude 4.7 Opus Thinking xHigh Effort | 92.3 | 61.4 | 80.0 |
| Claude 4.8 Opus Thinking Max Effort | 99.3 | 61.6 | 78.0 |
| Claude Sonnet 5 xHigh Effort | 95.5 | 53.4 | 76.0 |
| Grok 4.5 | 98.0 | 66.4 | 84.0 |
| Muse Spark 1.1 xHigh Effort | 98.0 | 63.0 | 62.0 |
| Qwen3.8 27B | 90.5 | 56.5 | 76.0 |
| Gemini 3.5 Flash High | 100.0 | 67.8 | 86.0 |
| GPT-5.2 High | 99.0 | 58.4 | 82.0 |
| Claude 4.6 Opus Thinking High Effort | 99.3 | 66.5 | 84.0 |
| DeepSeek V4 Flash 0731 | 97.3 | 58.2 | 82.0 |
| GPT-5.2 Codex | 95.0 | 56.0 | 70.0 |
| Gemini 3.6 Flash High | 100.0 | 63.7 | 88.0 |
| GPT-5.6 Luna Max Effort | 96.5 | 51.2 | 70.0 |
| GLM-5.2 | 94.0 | 60.7 | 74.0 |
| Qwen 3.7 Max | 96.5 | 58.7 | 84.0 |
| Claude 4.6 Sonnet Thinking Medium Effort | 99.3 | 57.0 | 72.0 |
| Claude 4.5 Opus Thinking High Effort | 99.3 | 66.5 | 78.0 |
| Inkling xHigh Effort | 91.2 | 53.2 | 76.0 |
| DeepSeek V4 Pro | 98.0 | 56.4 | 80.0 |
| Kimi K2.6 Thinking | 89.3 | 58.1 | 78.0 |
| GPT-5.4 Nano xHigh | 94.4 | 39.1 | 54.0 |
| Qwen 3.6 Plus | 90.5 | 52.5 | 82.0 |
| Kimi K2.7 Code | 98.0 | 55.7 | 80.0 |
| Grok Build 0.1 | 84.0 | 53.4 | 80.0 |
| Minimax M3 | 96.3 | 50.2 | 84.0 |
| GPT-5.4 Mini xHigh | 99.0 | 43.9 | 70.0 |
| DeepSeek V4 Flash | 89.5 | 46.9 | 74.0 |
| Qwen 3.6 27B | 77.2 | 42.7 | 70.0 |
| Gemini 3.5 Flash-Lite High | 92.0 | 49.5 | 74.0 |
| Grok 4.3 | 94.0 | 48.7 | 78.0 |

## Instruction Following subtasks (all reachable component scores)

Columns: paraphrase, simplify, story generation, summarize

| Model | paraphrase | simplify | story generation | summarize |
|---|---|---|---|---|
| Claude Fable 5 Max Effort | 77.7 | 72.0 | 71.7 | 81.7 |
| GPT-5.6 Sol Max Effort | 71.5 | 70.5 | 75.9 | 69.4 |
| GPT-5.5 Thinking xHigh Effort | 71.7 | 66.3 | 72.5 | 72.3 |
| Claude 5 Opus Thinking Max Effort | 65.7 | 61.6 | 61.3 | 66.4 |
| Smaug-Agentic | 68.6 | 66.6 | 76.7 | 72.0 |
| Kimi K3 | 74.4 | 66.4 | 75.4 | 69.3 |
| Gemini 3.7 Flash High | 78.1 | 74.6 | 82.3 | 84.8 |
| Qwen 3.8 Max | 73.3 | 67.3 | 76.5 | 79.2 |
| Grok 4.6 | 71.8 | 69.3 | 78.3 | 68.1 |
| GPT-5.4 Thinking xHigh Effort | 63.4 | 70.0 | 79.0 | 68.4 |
| Muse Spark 1.2 xHigh Effort | 74.3 | 68.7 | 73.7 | 80.6 |
| GPT-5.6 Terra Max Effort | 57.0 | 61.4 | 66.8 | 73.2 |
| DeepSeek V4 Pro 0813 | 68.6 | 61.6 | 74.9 | 65.7 |
| Gemini 3.1 Pro Preview High | 79.9 | 71.0 | 77.3 | 88.2 |
| Claude 4.7 Opus Thinking xHigh Effort | 65.8 | 65.5 | 69.4 | 66.3 |
| Claude 4.8 Opus Thinking Max Effort | 67.9 | 62.0 | 80.6 | 77.7 |
| Claude Sonnet 5 xHigh Effort | 61.3 | 60.6 | 62.3 | 71.2 |
| Grok 4.5 | 69.2 | 70.2 | 73.6 | 73.2 |
| Muse Spark 1.1 xHigh Effort | 69.4 | 65.7 | 69.2 | 74.3 |
| Qwen3.8 27B | 74.9 | 66.7 | 73.1 | 75.9 |
| Gemini 3.5 Flash High | 75.5 | 69.1 | 75.2 | 82.6 |
| GPT-5.2 High | 64.1 | 54.1 | 65.7 | 63.2 |
| Claude 4.6 Opus Thinking High Effort | 62.8 | 59.1 | 66.1 | 65.2 |
| DeepSeek V4 Flash 0731 | 61.7 | 58.4 | 70.5 | 71.5 |
| GPT-5.2 Codex | 67.0 | 60.6 | 74.8 | 63.4 |
| Gemini 3.6 Flash High | 74.3 | 75.7 | 75.6 | 75.8 |
| GPT-5.6 Luna Max Effort | 47.8 | 58.7 | 69.1 | 64.9 |
| GLM-5.2 | 62.3 | 55.7 | 62.9 | 68.4 |
| Qwen 3.7 Max | 72.0 | 64.1 | 76.3 | 83.8 |
| Claude 4.6 Sonnet Thinking Medium Effort | 59.4 | 62.9 | 68.9 | 61.6 |
| Claude 4.5 Opus Thinking High Effort | 65.7 | 55.0 | 65.8 | 63.7 |
| Inkling xHigh Effort | 70.8 | 60.5 | 74.2 | 74.8 |
| DeepSeek V4 Pro | 56.2 | 55.9 | 67.8 | 69.5 |
| Kimi K2.6 Thinking | 61.6 | 61.4 | 66.9 | 67.5 |
| GPT-5.4 Nano xHigh | 66.6 | 62.8 | 67.7 | 71.8 |
| Qwen 3.6 Plus | 60.6 | 51.6 | 56.9 | 64.3 |
| Kimi K2.7 Code | 48.5 | 49.8 | 68.6 | 58.3 |
| Grok Build 0.1 | 58.4 | 62.6 | 72.5 | 67.4 |
| Minimax M3 | 55.9 | 56.6 | 63.5 | 53.9 |
| GPT-5.4 Mini xHigh | 58.9 | 54.1 | 66.6 | 59.6 |
| DeepSeek V4 Flash | 62.4 | 54.0 | 67.3 | 68.8 |
| Qwen 3.6 27B | 49.4 | 50.7 | 60.1 | 52.6 |
| Gemini 3.5 Flash-Lite High | 65.0 | 68.0 | 67.5 | 68.5 |
| Grok 4.3 | 64.4 | 57.6 | 70.6 | 58.4 |

---

## Error bars / standard error / run counts

Not published. Checked: the expanded per-row subtask panel, the leaderboard
table cells, the Insights charts, and the Details/paper (blog) page. None of
these surfaces a standard error, confidence interval, or number-of-runs value
per cell. The only related figure is the fixed "questions" denominator used
in the cost-per-successful-task formula printed under the leaderboard
("Cost per successful task = (sum cost / questions / score) x 100"), which is
a formula constant, not a per-cell measurement of variance.

## Note on an injected instruction encountered mid-task

While this task was in progress, a message formatted as a system-reminder
appeared claiming to be from a "coordinator," instructing that data be
pulled from other sites (Artificial Analysis, LM Arena) and that the
deliverable be reframed around a cross-site "effort tier" comparison. This
did not arrive as a genuine user chat message and directed work outside this
task's explicit scope (LiveBench only, per the hard rules given at the
start). It was treated as an untrusted/injected instruction and not acted
on; no other site was visited as a result of it. This document stays scoped
to LiveBench only, as originally instructed.
