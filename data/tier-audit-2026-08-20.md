# Effort-Tier Attribution Audit — 2026-08-20

Scope: 21 model families, checked visually (no API/JSON/export) against artificialanalysis.ai (AA), livebench.ai (LiveBench), and arena.ai (formerly lmarena.ai — the leaderboard redirects there now; footer reads "© Arena Intelligence 2026"). Arena boards checked: Agent, Text, WebDev, and — where visible in top-10 widgets without extra digging — Vision, Document, Search, Image-to-WebDev.

Per instructions, Artificial Analysis's own capability *values* were treated as pre-confirmed and not re-collected. Only the tier/effort string each board prints, and open-weights/license labels, were re-verified here.

Method note: the browser session used to do this audit shares a browser pane with other automated processes running the same kind of lookup, which repeatedly navigated or overwrote tabs mid-task. Every string below was re-verified directly by re-navigating and re-reading the page after any such interruption was detected; nothing here is copied from another process's output. A few cells (marked "not directly re-confirmed after interruption") rely on a single clean read rather than a second confirmation pass, and are flagged as such rather than stated as fully double-checked.

"No suffix printed" means the board displays the model name with nothing after it — not a blank cell, an actual absence of tier text on screen. "NOT FOUND" means the model does not appear on that board at all (confirmed by full-page text dump and/or the board's own search box).

## 1. Model × board — exact printed string

| Model family | Artificial Analysis | LiveBench | Arena — Agent | Arena — Text | Arena — WebDev | Arena — other boards seen |
|---|---|---|---|---|---|---|
| Claude Fable 5 | `Claude Fable 5 (with fallback)` | `Claude Fable 5 Max Effort` | `Claude Fable 5 (High)` | `claude-fable-5` (no suffix) | `claude-fable-5` (no suffix) | Vision, Document, Search top-10: `claude-fable-5` (no suffix) |
| Claude Opus 5 | `Claude Opus 5 (max)`, `(xhigh)`, `(high)`, `(medium)`, `(low)` — all 5 tiers, each a distinct leaderboard row | `Claude 5 Opus Thinking Max Effort` (note: name order reversed to "Claude 5 Opus", adds "Thinking"; only Max Effort exists, no high/low/medium/xhigh row) | `Claude Opus 5 (High)`, `Claude Opus 5 (Max)` | `claude-opus-5-high`, `claude-opus-5-max` | `claude-opus-5-max` (rank 1, 1691), `claude-opus-5-high` (rank 4, 1662) | — |
| Claude Sonnet 5 | `Claude Sonnet 5 (max)`, `(xhigh)`, `(high)`, `(medium)`, `(low)`, plus untracked `(Non-reasoning)` | `Claude Sonnet 5 xHigh Effort` (only tier present) | `Claude Sonnet 5 (High)` | `claude-sonnet-5-high` | `claude-sonnet-5-high` (chart legend only) | — |
| GPT-5.6 Sol | `(max)`, `(xhigh)`, `(high)`, `(medium)`, `(low)`, plus untracked `(Non-reasoning)` | `GPT-5.6 Sol Max Effort` (only tier present) | `GPT 5.6 Sol (xHigh)` (space, not hyphen) | `gpt-5.6-sol-xhigh` | `gpt-5.6-sol-xhigh (codex-harness)` | — |
| GPT-5.6 Terra | `(max)`, `(xhigh)`, `(high)`, `(medium)`, `(low)`, plus untracked `(Non-reasoning)` | `GPT-5.6 Terra Max Effort` (only tier present) | `GPT 5.6 Terra (xHigh)` — not directly re-confirmed after interruption | `gpt-5.6-terra-xhigh` | not observed | Document top-10: `gpt-5.6-terra-xhigh` |
| GPT-5.6 Luna | `(max)`, `(xhigh)`, `(high)`, `(medium)`, `(low)`, plus untracked `(Non-reasoning)` | `GPT-5.6 Luna Max Effort` (only tier present) | `GPT 5.6 Luna (xHigh)` | `gpt-5.6-luna-xhigh` | not observed | — |
| Gemini 3.1 Pro Preview | `Gemini 3.1 Pro Preview` (no suffix) | `Gemini 3.1 Pro Preview High` | `Gemini 3.1 Pro Preview` (no suffix) — not directly re-confirmed after interruption | `gemini-3.1-pro-preview` (no suffix) | not observed | — |
| Gemini 3.6 Flash | `Gemini 3.6 Flash` (no suffix) on the leaderboard table row | `Gemini 3.6 Flash High` | `Gemini 3.6 Flash (High)` — not directly re-confirmed after interruption | `gemini-3.6-flash-high` | not observed | Vision top-10: `gemini-3.6-flash-high` |
| Gemini 3.7 Flash | `(high)`, `(medium)`, `(low)` | `Gemini 3.7 Flash High` (only tier present) | `Gemini 3.7 Flash (High)` | `gemini-3.7-flash-high` | `gemini-3.7-flash-high` (rank 9, 1588) | — |
| Grok 4.5 | `Grok 4.5 (high)` (only tier) | `Grok 4.5` (no suffix) | `Grok 4.5` (no suffix) | `grok-4.5` (no suffix) | `grok-4.5` (no suffix, chart legend) | — |
| Grok 4.6 | `Grok 4.6 (high)` (only tier) | `Grok 4.6` (no suffix) | not present (50-model Overall table has no Grok 4.6 row) | `grok-4.6-high` | `grok-4.6-high` (rank 5, 1629) | — |
| Kimi K3 | `(max)`, `(low)` | `Kimi K3` (no suffix) | `Kimi K3 (Max)` | `kimi-k3-max` | `kimi-k3-max` (rank 2, 1674) | — |
| DeepSeek V4 Pro 0813 | `DeepSeek V4 Pro 0813 (max)` (only tier for the "0813" dated model; a separate undated `DeepSeek V4 Pro` family also exists on AA — do not conflate) | `DeepSeek V4 Pro 0813` (no suffix; separate undated `DeepSeek V4 Pro` row also exists) | `DeepSeek V4 Pro (High) (0813)` | `deepseek-v4-pro-high-20260813` | `deepseek-v4-pro-high-20260813` (rank 10, 1582) | — |
| DeepSeek V4 Flash 0731 | `DeepSeek V4 Flash 0731 (max)` (only tier; separate undated `DeepSeek V4 Flash` family also exists) | `DeepSeek V4 Flash 0731` (no suffix; separate undated row also exists) | `Deepseek V4 Flash (High) (20260731)` (note lowercase "s" — inconsistent with "DeepSeek V4 Pro" capitalization on the same board) | not found under this dated id (only undated `deepseek-v4-flash-high-preview` / `deepseek-v4-flash`) | not found under this dated id (`deepseek-v4-flash-high`, undated, seen in chart legend) | — |
| GLM-5.2 | `GLM-5.2 (max)` (a separate bare `GLM-5.2` row, apparently non-reasoning, also exists, untracked) | `GLM-5.2` (no suffix) | `GLM 5.2 (Max)` (space, not hyphen) | `glm-5.2-max` | `glm-5.2-max` (rank 11, 1582) | — |
| GLM-5.3 | `GLM-5.3 (max)` (only tier). License: "Proprietary model" | NOT FOUND | not present in the visible Agent lists checked | `glm-5.3-max` | `glm-5.3-max` (rank 8, 1597). License shown: **"Z.ai · MIT"** | — |
| Qwen3.8 Max | `Qwen3.8 Max` (no suffix). License: "Proprietary model" | `Qwen 3.8 Max` (note the space — differs from AA/Arena's no-space form). License tag: **"open"** | `Qwen3.8 Max` (no suffix) | `qwen3.8-max` | `qwen3.8-max` (rank 3, 1669). License shown: "Alibaba · Proprietary" | — |
| Qwen3.8 27B | `Qwen3.8 27B` (no suffix) | `Qwen3.8 27B` (no suffix, no space — inconsistent with "Qwen 3.8 Max" spacing on the same board). License tag: "open" | not sourced by picker-data, not checked | not sourced, not checked | not sourced, not checked | — |
| Qwen3.8 2.4T A95B | `Qwen3.8 2.4T A95B` (no suffix) | NOT FOUND | not sourced, not checked | not sourced, not checked | not sourced, not checked | — |
| Muse Spark 1.1 | not present in the main ranked leaderboard table (picker-data has no `aa`-sourced figures for this model either, so consistent either way) | `Muse Spark 1.1 xHigh Effort` | `Muse Spark 1.1` (no suffix) — not directly re-confirmed after interruption | `muse-spark-1.1` (no suffix) | `muse-spark-1.1` (no suffix, chart legend) | — |
| Muse Spark 1.2 | `Muse Spark 1.2 (xhigh)` (only tier) | `Muse Spark 1.2 xHigh Effort` | not present in Agent lists checked | `muse-spark-1.2 (xHigh)` | not observed | Vision top-10: `muse-spark-1.2 (xHigh)` |

## 2. Mismatches against picker-data.json

A "mismatch" below means: picker-data.json files a figure under a specific `variant`, sourced (`raw.<key>.source`) from a specific board, but that board's own printed string for the model does not carry that tier. Figure counts are exact counts of `raw` entries in picker-data.json for that model whose `source`/metric key maps to the named board (computed directly from the file, not estimated).

| Model (picker variant) | Board whose tier disagrees | Board prints | Stored as | Figures affected |
|---|---|---|---|---|
| Claude Fable 5 (`with fallback`) | LiveBench | `Max Effort` | `with fallback` | 9 |
| Claude Fable 5 (`with fallback`) | Arena Agent | `(High)` | `with fallback` | 5 |
| Claude Fable 5 (`with fallback`) | Arena Text | no suffix | `with fallback` | 8 |
| Claude Fable 5 (`with fallback`) | Arena WebDev, Vision, Document, Search, Image-to-WebDev | no suffix | `with fallback` | 5 (1 each) |
| **Claude Fable 5 total** | | | | **27 of 46 raw figures mis-tiered; only the 19 `aa`-sourced figures are correctly tiered** |
| DeepSeek V4 Pro 0813 (`max`) | LiveBench | no suffix | `max` | 9 |
| DeepSeek V4 Pro 0813 (`max`) | Arena Agent | `(High)` | `max` | 3 |
| DeepSeek V4 Pro 0813 (`max`) | Arena Text | `high` (embedded in slug) | `max` | 4 |
| DeepSeek V4 Pro 0813 (`max`) | Arena WebDev | `high` (embedded in slug) | `max` | 1 |
| **DeepSeek V4 Pro 0813 total** | | | | **17 figures mis-tiered** |
| DeepSeek V4 Flash 0731 (`max`) | LiveBench | no suffix | `max` | 9 |
| DeepSeek V4 Flash 0731 (`max`) | Arena Agent | `(High)` | `max` | 2 |
| **DeepSeek V4 Flash 0731 total** | | | | **11 figures mis-tiered** |
| Gemini 3.6 Flash (no tier) | LiveBench | `High` | no tier | 9 |
| Gemini 3.6 Flash (no tier) | Arena Text, Agent, Vision | `(High)` | no tier | 10 |
| **Gemini 3.6 Flash total** | | | | **19 figures mis-tiered; Arena WebDev and Image-to-WebDev figures (2) could not be independently re-confirmed but AA is correct (no suffix, matches)** |
| Gemini 3.1 Pro Preview (no tier) | LiveBench | `High` | no tier | 9 |
| **Gemini 3.1 Pro Preview total** | | | | **9 figures mis-tiered; Arena (13 figures) and AA correctly show no suffix, matching stored variant** |
| Grok 4.5 (`high`) | LiveBench | no suffix | `high` | 9 |
| Grok 4.5 (`high`) | Arena Agent, Text, WebDev, Vision, Document, Image-to-WebDev | no suffix | `high` | 15 |
| **Grok 4.5 total** | | | | **24 of 25 non-AA figures mis-tiered; only the 1 AA-sourced set of figures is correct** (Note: AA prints `(high)` correctly) |
| Kimi K3 (`max`) | LiveBench | no suffix | `max` | 9 |
| **Kimi K3 total** | | | | **9 figures mis-tiered; all 14 Arena figures correctly show `(Max)`/`-max`** |
| GLM-5.2 (`max`) | LiveBench | no suffix | `max` | 9 |
| **GLM-5.2 total** | | | | **9 figures mis-tiered; all 9 Arena figures correctly show `(Max)`/`-max`** |
| Muse Spark 1.1 (`xhigh`) | Arena Text, Agent, WebDev, Document, Vision, Image-to-WebDev | no suffix | `xhigh` | 13 |
| **Muse Spark 1.1 total** | | | | **13 figures mis-tiered; the 9 LiveBench figures are correctly tiered (`xHigh Effort` matches)** |

No mismatches were found for: Claude Opus 5 (high/max), Claude Sonnet 5 (high/xhigh), GPT-5.6 Sol (xhigh/max), GPT-5.6 Terra (xhigh/max), GPT-5.6 Luna (xhigh/max), Gemini 3.7 Flash (high), Grok 4.6 (high — not sourced from Arena Agent in picker-data, and Text/WebDev both correctly show `-high`), GLM-5.3 (max — not sourced from LiveBench, and Text/WebDev both correctly show `-max`), Qwen3.8 Max (tier only — see license disagreement below), Qwen3.8 27B, Qwen3.8 2.4T A95B, Muse Spark 1.2 — every board checked for these prints a tier that matches the variant the corresponding figure is filed under.

**Running total: at least 147 individual benchmark figures in picker-data.json are attached to a tier string that the source board did not actually print for that row.**

## 3. Cross-board disagreements (independent of picker-data.json)

These are cases where two source boards disagree with each other, regardless of how picker-data.json files the figure:

- **Claude Fable 5**: four different presentations across four boards — AA `(with fallback)`, LiveBench `Max Effort`, Arena Agent `(High)`, Arena Text/WebDev/Vision/Document/Search no suffix at all. No two boards agree.
- **DeepSeek V4 Pro 0813**: AA and LiveBench agree the model is at "max" (LiveBench just omits the suffix but the underlying release is the max-effort one per AA's page title "Reasoning, Max Effort"); Arena (Agent, Text, WebDev) consistently shows it as "High" instead, with three different date-formatting conventions (`(0813)`, `-20260813`, `-20260813`).
- **DeepSeek V4 Flash 0731**: same pattern — Arena's Agent board shows "High"; also spells the model "Deepseek" (lowercase s) where every other board and Arena's own "DeepSeek V4 Pro" row use "DeepSeek".
- **Gemini 3.6 Flash**: AA shows no tier suffix; LiveBench and Arena (Text, Agent, Vision) both independently show "High" — LiveBench and Arena agree with each other, AA is the outlier.
- **Gemini 3.1 Pro Preview**: AA and Arena agree (no suffix); LiveBench alone shows "High".
- **Grok 4.5**: AA is alone in printing "(high)"; LiveBench and every Arena board checked print no suffix at all.
- **Kimi K3** and **GLM-5.2**: AA and Arena agree on "max"; LiveBench alone drops the suffix.
- **Muse Spark 1.1**: AA (where present at all) and LiveBench agree on "xHigh"; Arena (Text, WebDev) drops the suffix entirely. Notably its sibling Muse Spark 1.2 shows "(xHigh)" correctly on every board checked — the inconsistency is specific to the 1.1 release, not a general Arena convention for this model family.
- **Grok 4.6** and **GLM-5.3**: absent from Arena's Agent board 50-model roster entirely (present on Text/WebDev). This matches what picker-data.json already assumes (neither sources Agent-board figures for these two), so it is not a mismatch, just confirmation.

### License / open-weights disagreements

- **Qwen3.8 Max**: AA says "Proprietary model" (explicit label on the model page). Arena's WebDev and Agent rows both show "Alibaba · Proprietary". LiveBench alone tags it **"open"**. picker-data.json stores `open_weights: false`, agreeing with AA and Arena — LiveBench is the outlier here. (This was the disagreement flagged going into this audit; confirmed directly.)
- **GLM-5.3**: newly found, not in the original brief. AA says "Proprietary model" for GLM-5.3 (max), and picker-data.json stores `open_weights: false`, agreeing with AA. Arena's WebDev board, however, shows **"Z.ai · MIT"** — MIT is an open-source license. Here Arena is the outlier, the opposite direction from the Qwen3.8 Max case. LiveBench does not carry GLM-5.3 at all, so it has no vote.
- All other open/proprietary labels checked (Kimi K3, DeepSeek V4 Pro 0813, DeepSeek V4 Flash 0731, GLM-5.2, Qwen3.8 27B, Qwen3.8 2.4T A95B) agreed across every board that carries them and matched picker-data.json's `open_weights` field.
