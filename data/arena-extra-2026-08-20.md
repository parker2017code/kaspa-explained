# LM Arena — Additional Boards and Sub-Categories

Source: https://arena.ai/leaderboard (lmarena.ai redirects to arena.ai). Read live via browser automation on 2026-08-20.
All boards/sub-categories below were reached by clicking the site's own board selector ("Chat" nav dropdown → Vision → Filters → Categories) and column/category toggles, then "View all" to expand each table to its full row count. Every row below is transcribed directly from the rendered page. No values were inferred, interpolated, or estimated.

## Coverage summary

- Confirmed complete board inventory (site footer "LEADERBOARD RANKINGS" + top-nav Chat/Code/Image/Video dropdowns): Overall (summary page, not a distinct board), Agent, Text, WebDev, Image-to-WebDev, Text to Image, Image Edit, Text to Video, Image to Video, Video Edit, Vision, Document, Search. This matches the previously-collected set exactly — **no LLM-relevant board exists beyond the list already collected.**
- **New find: Vision Arena has a "Categories" filter with 10 entries (Overall + 9 named sub-categories) that is easy to miss** — it's a second-level filter inside the "Filters" panel, not a top-level tab. The 9 sub-categories not previously captured: English, Chinese, Captioning, Creative Writing, Diagram, Entity Recognition, Homework, Humor, OCR. All 9 are captured in full below.
- **Document Arena has no Categories filter.** Checked its Filters panel directly (View as / Style Control / License Type / Score Range / Input Price / Output Price / Context Length only) — confirmed no sub-category breakdown is published for Document.
- **Search Arena has no Categories filter either**, but it does have an "Adjustments" radio (Style Control / Factuality / None) not present on other boards. Selecting Factuality re-ranks the board (rank 1 becomes `gpt-5.5-search` at 1244 ±4, versus `claude-opus-4-6-search` at 1253 ±5 on the default/None view). This is a same-board re-scoring toggle, not a distinct sub-category board, so only the headline observation is recorded here (not a full row capture) — Search Overall itself is already collected per the prior file.
- **Confirmed unsigned-number defect on the Agent board**, with a second, more direct piece of evidence beyond the previously-noted one: viewing the full 50-model table (not just the top 25) shows Net Improvement descending from rank 1 (12.47%) down to rank 28 (`GLM 5.1`, 0.00%), then **increasing again** from rank 29 (`Gemini 3.5 Flash (High)`, 0.68%) up to rank 50 (`Gemma 4 31B`, 19.82%). Because the table is rank-ordered by descending Net Improvement, a value that is genuinely climbing back up after touching zero is only possible if ranks 29–50 are actually negative numbers whose magnitude is printed without the minus sign. No board other than Agent showed this pattern — Vision/Document/Search/Text/WebDev/Image-to-WebDev all use an Elo-like score that is not a signed delta, and no negative or unsigned-looking values were observed on any of them.

---

## Agent — full 50-model table (re-verified, not previously captured past rank 25)

Source: https://arena.ai/leaderboard/agent. Read 2026-08-20. Score type: Net Improvement (%), a win-rate-style signed delta, ± 95% CI. Data as of Aug 19, 2026. 1,896,814 sessions. 50 models total, all 50 shown (previous capture only went to rank 25).

Model names are transcribed exactly as printed, including suffixes. Where the board prints no suffix (e.g. "Qwen3.8 Max"), that is recorded as-is — the absence of a suffix is what the site shows, not an omission on my part.

| Rank | Model | Org · License | Net Improvement | CI |
|---|---|---|---|---|
| 1 | Claude Opus 5 (High) | Anthropic · Proprietary | 12.47% | ±1.54% |
| 2 | Claude Opus 5 (Max) | Anthropic · Proprietary | 12.00% | ±1.80% |
| 3 | Claude Fable 5 (High) | Anthropic · Proprietary | 11.57% | ±1.70% |
| 4 | Kimi K3 (Max) | Moonshot · Kimi K3 license | 10.41% | ±0.62% |
| 5 | GPT 5.6 Sol (xHigh) | OpenAI · Proprietary | 9.74% | ±1.39% |
| 6 | Claude Opus 4.8 (High) | Anthropic · Proprietary | 9.55% | ±1.51% |
| 7 | GPT 5.5 (xHigh) | OpenAI · Proprietary | 8.51% | ±0.93% |
| 8 | Claude Opus 4.7 (High) | Anthropic · Proprietary | 8.12% | ±1.24% |
| 9 | GPT 5.5 (High) | OpenAI · Proprietary | 7.74% | ±0.84% |
| 10 | Claude Opus 4.7 | Anthropic · Proprietary | 7.40% | ±1.25% |
| 11 | Claude Sonnet 5 (High) | Anthropic · Proprietary | 6.62% | ±2.19% |
| 12 | Claude Opus 4.6 | Anthropic · Proprietary | 6.60% | ±1.20% |
| 13 | GPT 5.5 | OpenAI · Proprietary | 6.38% | ±0.80% |
| 14 | DeepSeek V4 Pro (High) (0813) | DeepSeek · MIT | 6.26% | ±1.28% |
| 15 | Qwen3.8 Max | Alibaba · Proprietary (no suffix printed) | 6.20% | ±1.36% |
| 16 | Grok 4.5 | SpaceXAI · Proprietary (no suffix printed) | 6.17% | ±1.16% |
| 17 | GLM 5.2 (Max) | Z.ai · MIT · SiliconFlow | 5.82% | ±0.87% |
| 18 | GPT 5.4 (High) | OpenAI · Proprietary | 4.98% | ±0.80% |
| 19 | GPT 5.6 Luna (xHigh) | OpenAI · Proprietary | 4.04% | ±1.87% |
| 20 | Deepseek V4 Flash (High) (20260731) | DeepSeek · MIT | 3.99% | ±0.79% |
| 21 | Gemini 3.7 Flash (High) | Google · Proprietary | 3.32% | ±1.02% |
| 22 | GPT 5.6 Terra (xHigh) | OpenAI · Proprietary | 3.19% | ±1.19% |
| 23 | Claude Sonnet 4.6 | Anthropic · Proprietary (no suffix printed) | 2.88% | ±1.19% |
| 24 | Claude Opus 4.8 | Anthropic · Proprietary (no suffix printed) | 2.51% | ±2.25% |
| 25 | Muse Spark 1.1 | Meta · Proprietary (no suffix printed) | 0.93% | ±0.61% |
| 26 | Kimi K2.7 Code | Moonshot · Modified MIT | 0.43% | ±2.07% |
| 27 | DeepSeek V4 Pro | DeepSeek · MIT (no suffix printed) | 0.05% | ±0.88% |
| 28 | GLM 5.1 | Z.ai · MIT · SiliconFlow (no suffix printed) | 0.00% | ±0.75% |
| 29 | Gemini 3.5 Flash (High) | Google · Proprietary | 0.68% | ±0.61% |
| 30 | Qwen3.7 Max | Alibaba · Proprietary (no suffix printed) | 0.75% | ±0.85% |
| 31 | Gemini 3.1 Pro Preview | Google · Proprietary (no suffix printed) | 0.88% | ±0.68% |
| 32 | Kimi K2.6 | Moonshot · Modified MIT (no suffix printed) | 1.10% | ±2.23% |
| 33 | Mimo V2.5 Pro | Xiaomi · MIT | 2.25% | ±0.88% |
| 34 | Hy3 | Tencent · Apache 2.0 | 2.38% | ±1.24% |
| 35 | Qwen3.7 Plus | Alibaba · Proprietary | 2.51% | ±1.28% |
| 36 | Gemini 3.6 Flash (High) | Google · Proprietary | 3.04% | ±1.23% |
| 37 | Minimax M3 | MiniMax · MiniMax Community License | 3.15% | ±0.83% |
| 38 | Gemini 3.5 Flash (Medium) | Google · Proprietary | 3.86% | ±1.40% |
| 39 | Inkling Small | Thinky · Apache 2.0 | 6.82% | ±1.75% |
| 40 | Inkling | Thinky · Apache 2.0 (no suffix printed) | 7.19% | ±0.93% |
| 41 | Mistral Medium 3.5 | Mistral · Modified MIT | 7.60% | ±1.88% |
| 42 | Grok 4.3 (High) | SpaceXAI · Proprietary | 9.02% | ±0.84% |
| 43 | Gemini 3 Flash | Google · Proprietary (no suffix printed) | 9.13% | ±0.82% |
| 44 | Grok Build 0.1 | SpaceXAI · Proprietary | 9.48% | ±0.90% |
| 45 | Solar Pro 4 | Upstage · Proprietary | 10.82% | ±2.39% |
| 46 | Gemini 3.5 Flash Lite | Google · Proprietary | 10.82% | ±1.23% |
| 47 | Minimax M2.7 | MiniMax · Modified MIT | 11.86% | ±1.09% |
| 48 | Nemotron 3 Ultra | Nvidia · OpenMDW-1.1 | 15.36% | ±2.34% |
| 49 | Grok 4.3 | SpaceXAI · Proprietary (no suffix printed) | 16.45% | ±1.22% |
| 50 | Gemma 4 31B | Google · Apache 2.0 | 19.82% | ±2.57% |

Ranks 29–50 above are the direct evidence for the unsigned-magnitude defect described in the coverage summary.

---

# Vision Arena — 9 sub-categories not previously captured

All 9 tables below share: Source https://arena.ai/leaderboard/vision (Filters → Categories). Read 2026-08-20. Data as of Aug 6, 2026. Score type: Arena Score (Elo-like) ± symmetric 95% CI. Every row is the complete table for that category (row count matches the "N models" the page states, verified by counting after "View all").

## Vision: English (146 models, 549,960 votes)

| Rank | Model | Org · License | Score | CI |
|---|---|---|---|---|
| 1 | claude-fable-5 | Anthropic · Proprietary | 1312 | ±12 |
| 2 | gemini-3.6-flash-high | Google · Proprietary | 1306 | ±29 |
| 3 | claude-opus-4-7-high | Anthropic · Proprietary | 1303 | ±9 |
| 4 | claude-opus-4-7 | Anthropic · Proprietary | 1301 | ±9 |
| 5 | claude-opus-4-6-high | Anthropic · Proprietary | 1299 | ±9 |
| 6 | qwen3.8-max | Alibaba · Proprietary | 1293 | ±15 |
| 7 | claude-opus-4-6 | Anthropic · Proprietary | 1293 | ±9 |
| 8 | muse-spark | Meta · Proprietary | 1289 | ±14 |
| 9 | muse-spark-1.1 | Meta · Proprietary | 1288 | ±16 |
| 10 | claude-opus-5-high | Anthropic · Proprietary | 1288 | ±17 |
| 11 | gpt-5.5 | OpenAI · Proprietary | 1284 | ±10 |
| 12 | claude-sonnet-4-6 | Anthropic · Proprietary | 1282 | ±9 |
| 13 | claude-opus-4-8 | Anthropic · Proprietary | 1281 | ±11 |
| 14 | claude-opus-4-8-high | Anthropic · Proprietary | 1280 | ±11 |
| 15 | gpt-5.5-instant | OpenAI · Proprietary | 1280 | ±13 |
| 16 | gpt-5.5-high | OpenAI · Proprietary | 1279 | ±10 |
| 17 | gpt-5.2-chat-latest-20260210 | OpenAI · Proprietary | 1279 | ±9 |
| 18 | gpt-5.4-high | OpenAI · Proprietary | 1279 | ±9 |
| 19 | gemini-3.5-flash-high | Google · Proprietary | 1277 | ±14 |
| 20 | gpt-5.4 | OpenAI · Proprietary | 1277 | ±9 |
| 21 | gpt-5.6-sol-xhigh | OpenAI · Proprietary | 1276 | ±19 |
| 22 | grok-4.5 | SpaceXAI · Proprietary | 1276 | ±17 |
| 23 | dola-seed-2.0-pro | Bytedance · Proprietary | 1276 | ±11 |
| 24 | gemini-3-pro | Google · Proprietary | 1276 | ±10 |
| 25 | gemini-3.5-flash-medium | Google · Proprietary | 1275 | ±14 |
| 26 | gemini-3.1-pro-preview | Google · Proprietary | 1272 | ±8 |
| 27 | claude-sonnet-5-high | Anthropic · Proprietary | 1268 | ±13 |
| 28 | kimi-k2.6 | Moonshot · Modified MIT | 1266 | ±10 |
| 29 | gemini-3.5-flash-lite | Google · Proprietary | 1265 | ±30 |
| 30 | gpt-5.6-terra-xhigh | OpenAI · Proprietary | 1262 | ±19 |
| 31 | muse-spark-1.2 (xHigh) | Meta · Proprietary | 1259 | ±28 |
| 32 | gemini-3-flash | Google · Proprietary | 1259 | ±7 |
| 33 | gpt-5.6-luna-xhigh | OpenAI · Proprietary | 1254 | ±19 |
| 34 | gemma-4-31b | Google · Apache 2.0 | 1254 | ±9 |
| 35 | qwen3.5-397b-a17b | Alibaba · Apache 2.0 | 1254 | ±8 |
| 36 | qwen3.7-plus | Alibaba · Proprietary | 1253 | ±13 |
| 37 | grok-4.20-beta-0309-reasoning | SpaceXAI · Proprietary | 1252 | ±9 |
| 38 | kimi-k2.5-thinking | Moonshot · Modified MIT | 1251 | ±8 |
| 39 | gpt-5.1-high | OpenAI · Proprietary | 1250 | ±11 |
| 40 | gemini-3-flash (thinking-minimal) | Google · Proprietary | 1249 | ±8 |
| 41 | gpt-5.4-mini-high | OpenAI · Proprietary | 1248 | ±9 |
| 42 | grok-4.3 | SpaceXAI · Proprietary | 1247 | ±10 |
| 43 | grok-4.20-multi-agent-beta-0309 | SpaceXAI · Proprietary | 1247 | ±9 |
| 44 | minimax-m3 | MiniMax · MiniMax Community License | 1246 | ±11 |
| 45 | gemini-2.5-pro | Google · Proprietary | 1245 | ±6 |
| 46 | mimo-v2.5 | Xiaomi · MIT | 1244 | ±9 |
| 47 | gpt-5.2-high | OpenAI · Proprietary | 1240 | ±9 |
| 48 | glm-5v-turbo | Z.ai · Proprietary | 1239 | ±9 |
| 49 | chatgpt-4o-latest-20250326 | OpenAI · Proprietary | 1238 | ±7 |
| 50 | kimi-k2.5-instant | Moonshot · Modified MIT | 1237 | ±16 |
| 51 | gemma-4-26b-a4b | Google · Apache 2.0 | 1237 | ±9 |
| 52 | gpt-5.1 | OpenAI · Proprietary | 1233 | ±11 |
| 53 | gemini-2.5-flash-preview-09-2025 | Google · Proprietary | 1230 | ±14 |
| 54 | gpt-5.2 | OpenAI · Proprietary | 1228 | ±9 |
| 55 | qwen3.5-122b-a10b | Alibaba · Apache 2.0 | 1227 | ±10 |
| 56 | mimo-v2-omni | Xiaomi · Proprietary | 1225 | ±11 |
| 57 | gemini-3.1-flash-lite-preview | Google · Proprietary | 1224 | ±9 |
| 58 | qwen3.5-27b | Alibaba · Apache 2.0 | 1223 | ±9 |
| 59 | gpt-5-chat | OpenAI · Proprietary | 1221 | ±10 |
| 60 | gpt-4.5-preview-2025-02-27 | OpenAI · Proprietary | 1220 | ±16 |
| 61 | qwen3-vl-235b-a22b-instruct | Alibaba · Apache 2.0 | 1218 | ±10 |
| 62 | o3-2025-04-16 | OpenAI · Proprietary | 1218 | ±9 |
| 63 | gemini-2.5-flash | Google · Proprietary | 1217 | ±7 |
| 64 | gpt-5-high | OpenAI · Proprietary | 1216 | ±10 |
| 65 | Inkling Small | Thinky · Apache 2.0 | 1216 | ±26 |
| 66 | ernie-5.0-preview-1220 | Baidu · Proprietary | 1215 | ±17 |
| 67 | mistral-medium-3.5 | Mistral · Modified MIT | 1215 | ±14 |
| 68 | gpt-4.1-2025-04-14 | OpenAI · Proprietary | 1211 | ±9 |
| 69 | gpt-4.1-mini-2025-04-14 | OpenAI · Proprietary | 1209 | ±9 |
| 70 | claude-sonnet-4-20250514-thinking-32k | Anthropic · Proprietary | 1207 | ±24 |
| 71 | grok-4-1-fast-reasoning | SpaceXAI · Proprietary | 1206 | ±10 |
| 72 | gpt-5.4-nano-high | OpenAI · Proprietary | 1205 | ±9 |
| 73 | o4-mini-2025-04-16 | OpenAI · Proprietary | 1201 | ±9 |
| 74 | qwen3-vl-235b-a22b-thinking | Alibaba · Apache 2.0 | 1197 | ±18 |
| 75 | claude-opus-4-20250514 | Anthropic · Proprietary | 1196 | ±18 |
| 76 | qwen-vl-max-2025-08-13 | Alibaba · Proprietary | 1195 | ±16 |
| 77 | mistral-large-3 | Mistral · Apache 2.0 | 1195 | ±20 |
| 78 | claude-opus-4-20250514-thinking-16k | Anthropic · Proprietary | 1194 | ±24 |
| 79 | claude-3-7-sonnet-20250219-thinking-32k | Anthropic · Proprietary | 1193 | ±22 |
| 80 | gpt-5-mini-high | OpenAI · Proprietary | 1192 | ±11 |
| 81 | gemini-2.5-flash-lite-preview-06-17-thinking | Google · Proprietary | 1189 | ±10 |
| 82 | o1-2024-12-17 | OpenAI · Proprietary | 1188 | ±14 |
| 83 | grok-4-0709 | SpaceXAI · Proprietary | 1187 | ±10 |
| 84 | gemini-2.0-flash-001 | Google · Proprietary | 1184 | ±9 |
| 85 | claude-sonnet-4-20250514 | Anthropic · Proprietary | 1178 | ±20 |
| 86 | gemini-2.5-flash-lite-preview-09-2025-no-thinking | Google · Proprietary | 1177 | ±14 |
| 87 | glm-4.6v | Z.ai · MIT | 1176 | ±20 |
| 88 | glm-4.5v | Z.ai · MIT | 1173 | ±16 |
| 89 | gemini-1.5-pro-002 | Google · Proprietary | 1173 | ±11 |
| 90 | step-1o-turbo-202506 | StepFun · Proprietary | 1173 | ±20 |
| 91 | gemma-3-27b-it | Google · Gemma | 1171 | ±10 |
| 92 | mistral-medium-2505 | Mistral · Proprietary | 1171 | ±11 |
| 93 | gpt-4o-2024-05-13 | OpenAI · Proprietary | 1168 | ±11 |
| 94 | step-3 | StepFun · Apache 2.0 | 1166 | ±16 |
| 95 | hunyuan-vision-1.5-thinking | Tencent · Proprietary | 1166 | ±17 |
| 96 | mistral-medium-2508 | Mistral · Proprietary | 1163 | ±8 |
| 97 | claude-3-7-sonnet-20250219 | Anthropic · Proprietary | 1161 | ±13 |
| 98 | hunyuan-large-vision | Tencent · Proprietary | 1160 | ±23 |
| 99 | gpt-5-nano-high | OpenAI · Proprietary | 1154 | ±15 |
| 100 | claude-3-5-sonnet-20241022 | Anthropic · Proprietary | 1154 | ±10 |
| 101 | gemini-1.5-flash-002 | Google · Proprietary | 1154 | ±12 |
| 102 | mistral-small-2506 | Mistral · Apache 2.0 | 1153 | ±11 |
| 103 | llama-4-maverick-17b-128e-instruct | Meta · Llama 4 | 1152 | ±12 |
| 104 | gemini-2.0-flash-lite-preview-02-05 | Google · Proprietary | 1151 | ±13 |
| 105 | llama-4-scout-17b-16e-instruct | Meta · Llama | 1146 | ±12 |
| 106 | step-1o-vision-32k-highres | StepFun · Proprietary | 1143 | ±16 |
| 107 | mistral-small-3.1-24b-instruct-2503 | Mistral · Apache 2.0 | 1141 | ±10 |
| 108 | claude-3-5-sonnet-20240620 | Anthropic · Proprietary | 1136 | ±13 |
| 109 | claude-3-5-haiku-20241022 | Anthropic · Proprietary | 1128 | ±23 |
| 110 | gpt-4.1-nano-2025-04-14 | OpenAI · Proprietary | 1125 | ±27 |
| 111 | qwen2.5-vl-72b-instruct | Alibaba · Qwen | 1125 | ±14 |
| 112 | qwen2.5-vl-32b-instruct | Alibaba · Apache 2.0 | 1124 | ±19 |
| 113 | gpt-4o-2024-08-06 | OpenAI · Proprietary | 1123 | ±16 |
| 114 | molmo-2-8b | Ai2 · Apache 2.0 | 1117 | ±30 |
| 115 | gemini-1.5-pro-001 | Google · Proprietary | 1114 | ±13 |
| 116 | gpt-4-turbo-2024-04-09 | OpenAI · Proprietary | 1113 | ±14 |
| 117 | pixtral-large-2411 | Mistral · MRL | 1100 | ±12 |
| 118 | gpt-4o-mini-2024-07-18 | OpenAI · Proprietary | 1099 | ±11 |
| 119 | qwen-vl-max-1119 | Alibaba · Proprietary | 1095 | ±22 |
| 120 | gemini-1.5-flash-8b-001 | Google · Proprietary | 1088 | ±13 |
| 121 | qwen2-vl-72b | Alibaba · Qwen | 1086 | ±13 |
| 122 | step-1v-32k | StepFun · Proprietary | 1082 | ±22 |
| 123 | gemini-1.5-flash-001 | Google · Proprietary | 1071 | ±14 |
| 124 | molmo-72b-0924 | Ai2 · Apache 2.0 | 1069 | ±17 |
| 125 | hunyuan-standard-vision-2024-12-31 | Tencent · Proprietary | 1056 | ±27 |
| 126 | claude-3-opus-20240229 | Anthropic · Proprietary | 1052 | ±13 |
| 127 | internvl2-26b | MIT | 1051 | ±15 |
| 128 | pixtral-12b-2409 | Mistral · Apache 2.0 | 1042 | ±12 |
| 129 | qwen2-vl-7b-instruct | Alibaba · Apache 2.0 | 1041 | ±13 |
| 130 | llama-3.2-vision-90b-instruct | Meta · Llama 3.2 | 1040 | ±12 |
| 131 | molmo-7b-d-0924 | Ai2 · Apache 2.0 | 1036 | ±18 |
| 132 | amazon-nova-lite-v1.0 | Amazon · Proprietary | 1026 | ±20 |
| 133 | amazon-nova-pro-v1.0 | Amazon · Proprietary | 1023 | ±18 |
| 134 | yi-vision | Proprietary | 1022 | ±23 |
| 135 | llama-3.2-vision-11b-instruct | Meta · Llama 3.2 | 1017 | ±14 |
| 136 | llava-onevision-qwen2-72b-ov | Apache 2.0 | 1009 | ±22 |
| 137 | claude-3-sonnet-20240229 | Anthropic · Proprietary | 1007 | ±14 |
| 138 | internvl2-4b | MIT | 1000 | ±16 |
| 139 | c4ai-aya-vision-32b | Cohere · CC-BY-NC-4.0 | 998 | ±30 |
| 140 | claude-3-haiku-20240307 | Anthropic · Proprietary | 992 | ±15 |
| 141 | nvila-internal-15b-v1 | Nvidia · - | 991 | ±26 |
| 142 | cogvlm2-llama3-chat-19b | Z.ai · CogVLM2 | 990 | ±20 |
| 143 | minicpm-v-2_6 | Apache 2.0 | 990 | ±19 |
| 144 | llava-v1.6-34b | Apache 2.0 | 988 | ±16 |
| 145 | phi-3.5-vision-instruct | Microsoft · MIT | 936 | ±19 |
| 146 | phi-3-vision-128k-instruct | Microsoft · MIT | 899 | ±23 |

## Vision: Chinese (106 models, 50,473 votes)

| Rank | Model | Org · License | Score | CI |
|---|---|---|---|---|
| 1 | claude-opus-5-high | Anthropic · Proprietary | 1384 | ±53 |
| 2 | claude-fable-5 | Anthropic · Proprietary | 1367 | ±34 |
| 3 | claude-opus-4-6-high | Anthropic · Proprietary | 1360 | ±22 |
| 4 | claude-opus-4-6 | Anthropic · Proprietary | 1359 | ±21 |
| 5 | gemini-3.5-flash-high | Google · Proprietary | 1355 | ±37 |
| 6 | muse-spark-1.1 | Meta · Proprietary | 1354 | ±44 |
| 7 | gemini-3.5-flash-medium | Google · Proprietary | 1354 | ±40 |
| 8 | gemini-3-pro | Google · Proprietary | 1352 | ±20 |
| 9 | qwen3.8-max | Alibaba · Proprietary | 1345 | ±47 |
| 10 | gemini-3.1-pro-preview | Google · Proprietary | 1345 | ±18 |
| 11 | grok-4.5 | SpaceXAI · Proprietary | 1343 | ±48 |
| 12 | claude-opus-4-7-high | Anthropic · Proprietary | 1343 | ±22 |
| 13 | muse-spark | Meta · Proprietary | 1341 | ±31 |
| 14 | claude-opus-4-7 | Anthropic · Proprietary | 1340 | ±21 |
| 15 | claude-sonnet-5-high | Anthropic · Proprietary | 1337 | ±39 |
| 16 | claude-opus-4-8 | Anthropic · Proprietary | 1333 | ±28 |
| 17 | claude-opus-4-8-high | Anthropic · Proprietary | 1331 | ±30 |
| 18 | kimi-k2.6 | Moonshot · Modified MIT | 1330 | ±24 |
| 19 | kimi-k2.5-instant | Moonshot · Modified MIT | 1326 | ±43 |
| 20 | gemini-3-flash | Google · Proprietary | 1323 | ±18 |
| 21 | gpt-5.5-high | OpenAI · Proprietary | 1321 | ±24 |
| 22 | gpt-5.4-high | OpenAI · Proprietary | 1318 | ±22 |
| 23 | qwen3.7-plus | Alibaba · Proprietary | 1317 | ±39 |
| 24 | gpt-5.5 | OpenAI · Proprietary | 1316 | ±23 |
| 25 | mimo-v2.5 | Xiaomi · MIT | 1315 | ±23 |
| 26 | gemini-3-flash (thinking-minimal) | Google · Proprietary | 1313 | ±18 |
| 27 | gemma-4-31b | Google · Apache 2.0 | 1312 | ±18 |
| 28 | minimax-m3 | MiniMax · MiniMax Community License | 1305 | ±30 |
| 29 | claude-sonnet-4-6 | Anthropic · Proprietary | 1302 | ±21 |
| 30 | gpt-5.4 | OpenAI · Proprietary | 1300 | ±23 |
| 31 | kimi-k2.5-thinking | Moonshot · Modified MIT | 1298 | ±20 |
| 32 | qwen3.5-397b-a17b | Alibaba · Apache 2.0 | 1298 | ±21 |
| 33 | dola-seed-2.0-pro | Bytedance · Proprietary | 1297 | ±27 |
| 34 | grok-4.20-beta-0309-reasoning | SpaceXAI · Proprietary | 1296 | ±21 |
| 35 | grok-4.20-multi-agent-beta-0309 | SpaceXAI · Proprietary | 1296 | ±21 |
| 36 | gemma-4-26b-a4b | Google · Apache 2.0 | 1295 | ±21 |
| 37 | gpt-5.4-mini-high | OpenAI · Proprietary | 1294 | ±22 |
| 38 | gpt-5.2-high | OpenAI · Proprietary | 1291 | ±22 |
| 39 | glm-5v-turbo | Z.ai · Proprietary | 1290 | ±20 |
| 40 | grok-4.3 | SpaceXAI · Proprietary | 1286 | ±24 |
| 41 | qwen3.5-27b | Alibaba · Apache 2.0 | 1279 | ±22 |
| 42 | qwen3.5-122b-a10b | Alibaba · Apache 2.0 | 1279 | ±25 |
| 43 | gpt-5.5-instant | OpenAI · Proprietary | 1278 | ±33 |
| 44 | gemini-3.1-flash-lite-preview | Google · Proprietary | 1277 | ±20 |
| 45 | gpt-5.1-high | OpenAI · Proprietary | 1276 | ±29 |
| 46 | mimo-v2-omni | Xiaomi · Proprietary | 1270 | ±28 |
| 47 | gemini-2.5-pro | Google · Proprietary | 1267 | ±16 |
| 48 | gpt-5.2-chat-latest-20260210 | OpenAI · Proprietary | 1266 | ±25 |
| 49 | gpt-5.2 | OpenAI · Proprietary | 1265 | ±22 |
| 50 | o1-2024-12-17 | OpenAI · Proprietary | 1262 | ±57 |
| 51 | gpt-5-chat | OpenAI · Proprietary | 1259 | ±20 |
| 52 | gpt-5.1 | OpenAI · Proprietary | 1258 | ±26 |
| 53 | gemini-2.5-flash-preview-09-2025 | Google · Proprietary | 1257 | ±30 |
| 54 | gemini-2.5-flash | Google · Proprietary | 1256 | ±16 |
| 55 | chatgpt-4o-latest-20250326 | OpenAI · Proprietary | 1251 | ±20 |
| 56 | mistral-medium-3.5 | Mistral · Modified MIT | 1246 | ±42 |
| 57 | qwen3-vl-235b-a22b-instruct | Alibaba · Apache 2.0 | 1243 | ±24 |
| 58 | gpt-4.1-2025-04-14 | OpenAI · Proprietary | 1239 | ±19 |
| 59 | gpt-5.4-nano-high | OpenAI · Proprietary | 1239 | ±21 |
| 60 | ernie-5.0-preview-1220 | Baidu · Proprietary | 1236 | ±46 |
| 61 | gpt-5-high | OpenAI · Proprietary | 1227 | ±22 |
| 62 | gpt-4.1-mini-2025-04-14 | OpenAI · Proprietary | 1226 | ±21 |
| 63 | o3-2025-04-16 | OpenAI · Proprietary | 1225 | ±19 |
| 64 | grok-4-1-fast-reasoning | SpaceXAI · Proprietary | 1222 | ±25 |
| 65 | grok-4-0709 | SpaceXAI · Proprietary | 1214 | ±21 |
| 66 | o4-mini-2025-04-16 | OpenAI · Proprietary | 1211 | ±21 |
| 67 | gemini-2.5-flash-lite-preview-09-2025-no-thinking | Google · Proprietary | 1207 | ±28 |
| 68 | gemini-1.5-pro-002 | Google · Proprietary | 1201 | ±43 |
| 69 | gpt-4.5-preview-2025-02-27 | OpenAI · Proprietary | 1200 | ±61 |
| 70 | gemini-2.5-flash-lite-preview-06-17-thinking | Google · Proprietary | 1189 | ±23 |
| 71 | gpt-5-mini-high | OpenAI · Proprietary | 1177 | ±24 |
| 72 | claude-3-7-sonnet-20250219 | Anthropic · Proprietary | 1175 | ±48 |
| 73 | mistral-medium-2508 | Mistral · Proprietary | 1172 | ±20 |
| 74 | gemma-3-27b-it | Google · Gemma | 1169 | ±25 |
| 75 | gemini-2.0-flash-001 | Google · Proprietary | 1166 | ±33 |
| 76 | claude-3-5-sonnet-20241022 | Anthropic · Proprietary | 1160 | ±38 |
| 77 | gpt-4o-2024-05-13 | OpenAI · Proprietary | 1154 | ±37 |
| 78 | mistral-medium-2505 | Mistral · Proprietary | 1152 | ±29 |
| 79 | mistral-small-2506 | Mistral · Apache 2.0 | 1146 | ±30 |
| 80 | mistral-small-3.1-24b-instruct-2503 | Mistral · Apache 2.0 | 1137 | ±26 |
| 81 | llama-4-maverick-17b-128e-instruct | Meta · Llama 4 | 1131 | ±38 |
| 82 | gemini-1.5-flash-002 | Google · Proprietary | 1130 | ±43 |
| 83 | qwen2.5-vl-72b-instruct | Alibaba · Qwen | 1123 | ±54 |
| 84 | claude-3-5-sonnet-20240620 | Anthropic · Proprietary | 1119 | ±38 |
| 85 | qwen2-vl-72b | Alibaba · Qwen | 1108 | ±45 |
| 86 | llama-4-scout-17b-16e-instruct | Meta · Llama | 1099 | ±40 |
| 87 | pixtral-large-2411 | Mistral · MRL | 1096 | ±51 |
| 88 | gemini-2.0-flash-lite-preview-02-05 | Google · Proprietary | 1079 | ±60 |
| 89 | gpt-4o-mini-2024-07-18 | OpenAI · Proprietary | 1079 | ±37 |
| 90 | internvl2-26b | MIT | 1078 | ±47 |
| 91 | gpt-4o-2024-08-06 | OpenAI · Proprietary | 1072 | ±51 |
| 92 | gemini-1.5-pro-001 | Google · Proprietary | 1072 | ±39 |
| 93 | gpt-4-turbo-2024-04-09 | OpenAI · Proprietary | 1061 | ±40 |
| 94 | qwen2-vl-7b-instruct | Alibaba · Apache 2.0 | 1036 | ±46 |
| 95 | gemini-1.5-flash-001 | Google · Proprietary | 1028 | ±40 |
| 96 | claude-3-opus-20240229 | Anthropic · Proprietary | 1025 | ±40 |
| 97 | gemini-1.5-flash-8b-001 | Google · Proprietary | 1019 | ±44 |
| 98 | llama-3.2-vision-90b-instruct | Meta · Llama 3.2 | 1004 | ±43 |
| 99 | molmo-72b-0924 | Ai2 · Apache 2.0 | 983 | ±54 |
| 100 | claude-3-sonnet-20240229 | Anthropic · Proprietary | 980 | ±40 |
| 101 | claude-3-haiku-20240307 | Anthropic · Proprietary | 975 | ±40 |
| 102 | internvl2-4b | MIT | 969 | ±55 |
| 103 | pixtral-12b-2409 | Mistral · Apache 2.0 | 964 | ±44 |
| 104 | molmo-7b-d-0924 | Ai2 · Apache 2.0 | 954 | ±55 |
| 105 | llava-v1.6-34b | Apache 2.0 | 951 | ±46 |
| 106 | llama-3.2-vision-11b-instruct | Meta · Llama 3.2 | 951 | ±49 |

## Vision: Captioning (31 models, 4,053 votes)

Notable: no Claude, Muse Spark, Kimi, DeepSeek, GLM, or Qwen3.8 model appears anywhere in this category — it is dominated entirely by Gemini, GPT, and one Gemma model.

| Rank | Model | Org · License | Score | CI |
|---|---|---|---|---|
| 1 | gemini-3.1-pro-preview | Google · Proprietary | 1274 | ±51 |
| 2 | gemini-3-pro | Google · Proprietary | 1271 | ±36 |
| 3 | gpt-5.2-high | OpenAI · Proprietary | 1268 | ±59 |
| 4 | gemini-2.5-pro | Google · Proprietary | 1251 | ±23 |
| 5 | gemma-4-26b-a4b | Google · Apache 2.0 | 1248 | ±84 |
| 6 | gpt-5.1-high | OpenAI · Proprietary | 1240 | ±56 |
| 7 | gemini-3.1-flash-lite-preview | Google · Proprietary | 1226 | ±71 |
| 8 | gemini-3-flash | Google · Proprietary | 1226 | ±41 |
| 9 | gemini-2.5-flash | Google · Proprietary | 1215 | ±26 |
| 10 | gemini-3-flash (thinking-minimal) | Google · Proprietary | 1213 | ±46 |
| 11 | chatgpt-4o-latest-20250326 | OpenAI · Proprietary | 1212 | ±35 |
| 12 | qwen3-vl-235b-a22b-instruct | Alibaba · Apache 2.0 | 1208 | ±47 |
| 13 | gpt-4.1-2025-04-14 | OpenAI · Proprietary | 1207 | ±31 |
| 14 | gpt-5-chat | OpenAI · Proprietary | 1198 | ±31 |
| 15 | kimi-k2.5-thinking | Moonshot · Modified MIT | 1196 | ±54 |
| 16 | gpt-4.1-mini-2025-04-14 | OpenAI · Proprietary | 1195 | ±33 |
| 17 | gpt-5-high | OpenAI · Proprietary | 1191 | ±35 |
| 18 | gemini-2.5-flash-lite-preview-06-17-thinking | Google · Proprietary | 1185 | ±32 |
| 19 | o4-mini-2025-04-16 | OpenAI · Proprietary | 1182 | ±30 |
| 20 | o3-2025-04-16 | OpenAI · Proprietary | 1181 | ±29 |
| 21 | gpt-5.1 | OpenAI · Proprietary | 1180 | ±48 |
| 22 | gpt-5-mini-high | OpenAI · Proprietary | 1168 | ±42 |
| 23 | grok-4-0709 | SpaceXAI · Proprietary | 1167 | ±36 |
| 24 | gpt-5.2 | OpenAI · Proprietary | 1167 | ±59 |
| 25 | gemma-4-31b | Google · Apache 2.0 | 1165 | ±65 |
| 26 | gemini-2.0-flash-001 | Google · Proprietary | 1148 | ±59 |
| 27 | mistral-small-3.1-24b-instruct-2503 | Mistral · Apache 2.0 | 1135 | ±38 |
| 28 | mistral-medium-2508 | Mistral · Proprietary | 1130 | ±30 |
| 29 | gemma-3-27b-it | Google · Gemma | 1118 | ±38 |
| 30 | mistral-medium-2505 | Mistral · Proprietary | 1092 | ±48 |
| 31 | mistral-small-2506 | Mistral · Apache 2.0 | 1055 | ±48 |

## Vision: Creative Writing (81 models, 44,928 votes)

| Rank | Model | Org · License | Score | CI |
|---|---|---|---|---|
| 1 | gemini-3-pro | Google · Proprietary | 1331 | ±19 |
| 2 | claude-fable-5 | Anthropic · Proprietary | 1329 | ±27 |
| 3 | claude-opus-4-6-high | Anthropic · Proprietary | 1314 | ±18 |
| 4 | muse-spark | Meta · Proprietary | 1307 | ±34 |
| 5 | claude-opus-4-8-high | Anthropic · Proprietary | 1306 | ±25 |
| 6 | qwen3.8-max | Alibaba · Proprietary | 1303 | ±40 |
| 7 | claude-opus-4-7-high | Anthropic · Proprietary | 1302 | ±18 |
| 8 | gemini-3.1-pro-preview | Google · Proprietary | 1298 | ±14 |
| 9 | claude-opus-4-6 | Anthropic · Proprietary | 1297 | ±17 |
| 10 | gpt-5.6-sol-xhigh | OpenAI · Proprietary | 1289 | ±45 |
| 11 | claude-opus-4-7 | Anthropic · Proprietary | 1289 | ±18 |
| 12 | gemini-3.5-flash-medium | Google · Proprietary | 1284 | ±38 |
| 13 | gemini-3-flash | Google · Proprietary | 1280 | ±13 |
| 14 | gpt-5.5-high | OpenAI · Proprietary | 1277 | ±20 |
| 15 | grok-4.5 | SpaceXAI · Proprietary | 1277 | ±44 |
| 16 | gemini-3-flash (thinking-minimal) | Google · Proprietary | 1276 | ±13 |
| 17 | grok-4.20-multi-agent-beta-0309 | SpaceXAI · Proprietary | 1274 | ±17 |
| 18 | grok-4.20-beta-0309-reasoning | SpaceXAI · Proprietary | 1273 | ±17 |
| 19 | claude-opus-4-8 | Anthropic · Proprietary | 1272 | ±25 |
| 20 | gemini-3.5-flash-high | Google · Proprietary | 1271 | ±36 |
| 21 | claude-sonnet-4-6 | Anthropic · Proprietary | 1267 | ±17 |
| 22 | gpt-5.5 | OpenAI · Proprietary | 1267 | ±19 |
| 23 | gpt-5.5-instant | OpenAI · Proprietary | 1263 | ±34 |
| 24 | chatgpt-4o-latest-20250326 | OpenAI · Proprietary | 1262 | ±18 |
| 25 | claude-opus-5-high | Anthropic · Proprietary | 1260 | ±43 |
| 26 | grok-4.3 | SpaceXAI · Proprietary | 1259 | ±20 |
| 27 | gemma-4-31b | Google · Apache 2.0 | 1259 | ±14 |
| 28 | qwen3.5-397b-a17b | Alibaba · Apache 2.0 | 1259 | ±16 |
| 29 | gpt-5.4-high | OpenAI · Proprietary | 1258 | ±19 |
| 30 | gemini-2.5-pro | Google · Proprietary | 1257 | ±13 |
| 31 | gpt-5.4 | OpenAI · Proprietary | 1253 | ±19 |
| 32 | claude-sonnet-5-high | Anthropic · Proprietary | 1252 | ±34 |
| 33 | kimi-k2.6 | Moonshot · Modified MIT | 1251 | ±21 |
| 34 | gpt-5.1 | OpenAI · Proprietary | 1250 | ±23 |
| 35 | qwen3.7-plus | Alibaba · Proprietary | 1248 | ±31 |
| 36 | gpt-5.1-high | OpenAI · Proprietary | 1242 | ±24 |
| 37 | kimi-k2.5-thinking | Moonshot · Modified MIT | 1241 | ±16 |
| 38 | grok-4-1-fast-reasoning | SpaceXAI · Proprietary | 1240 | ±22 |
| 39 | kimi-k2.5-instant | Moonshot · Modified MIT | 1239 | ±36 |
| 40 | gemini-3.1-flash-lite-preview | Google · Proprietary | 1239 | ±16 |
| 41 | gemini-2.5-flash-preview-09-2025 | Google · Proprietary | 1238 | ±34 |
| 42 | dola-seed-2.0-pro | Bytedance · Proprietary | 1237 | ±29 |
| 43 | gpt-5.6-luna-xhigh | OpenAI · Proprietary | 1236 | ±49 |
| 44 | gemma-4-26b-a4b | Google · Apache 2.0 | 1235 | ±17 |
| 45 | gpt-5.2-chat-latest-20260210 | OpenAI · Proprietary | 1234 | ±21 |
| 46 | gpt-4.1-2025-04-14 | OpenAI · Proprietary | 1228 | ±20 |
| 47 | gpt-5.4-mini-high | OpenAI · Proprietary | 1227 | ±17 |
| 48 | muse-spark-1.1 | Meta · Proprietary | 1227 | ±39 |
| 49 | gemini-2.5-flash | Google · Proprietary | 1225 | ±13 |
| 50 | gpt-5.2 | OpenAI · Proprietary | 1219 | ±19 |
| 51 | gpt-5.2-high | OpenAI · Proprietary | 1218 | ±18 |
| 52 | gpt-4.1-mini-2025-04-14 | OpenAI · Proprietary | 1218 | ±21 |
| 53 | gpt-5-chat | OpenAI · Proprietary | 1217 | ±19 |
| 54 | glm-5v-turbo | Z.ai · Proprietary | 1216 | ±16 |
| 55 | grok-4-0709 | SpaceXAI · Proprietary | 1210 | ±20 |
| 56 | mimo-v2.5 | Xiaomi · MIT | 1209 | ±19 |
| 57 | minimax-m3 | MiniMax · MiniMax Community License | 1208 | ±27 |
| 58 | qwen3.5-122b-a10b | Alibaba · Apache 2.0 | 1207 | ±22 |
| 59 | o3-2025-04-16 | OpenAI · Proprietary | 1206 | ±18 |
| 60 | ernie-5.0-preview-1220 | Baidu · Proprietary | 1206 | ±31 |
| 61 | qwen3.5-27b | Alibaba · Apache 2.0 | 1198 | ±18 |
| 62 | qwen3-vl-235b-a22b-instruct | Alibaba · Apache 2.0 | 1198 | ±21 |
| 63 | mistral-small-2506 | Mistral · Apache 2.0 | 1195 | ±29 |
| 64 | gemini-2.0-flash-001 | Google · Proprietary | 1195 | ±40 |
| 65 | mistral-medium-2508 | Mistral · Proprietary | 1193 | ±17 |
| 66 | gemini-2.5-flash-lite-preview-06-17-thinking | Google · Proprietary | 1189 | ±21 |
| 67 | mistral-medium-3.5 | Mistral · Modified MIT | 1187 | ±35 |
| 68 | gpt-5-high | OpenAI · Proprietary | 1185 | ±20 |
| 69 | mimo-v2-omni | Xiaomi · Proprietary | 1181 | ±25 |
| 70 | gemini-2.5-flash-lite-preview-09-2025-no-thinking | Google · Proprietary | 1181 | ±32 |
| 71 | o4-mini-2025-04-16 | OpenAI · Proprietary | 1176 | ±20 |
| 72 | gemma-3-27b-it | Google · Gemma | 1174 | ±25 |
| 73 | gpt-5.4-nano-high | OpenAI · Proprietary | 1164 | ±18 |
| 74 | gpt-5-mini-high | OpenAI · Proprietary | 1160 | ±23 |
| 75 | llama-4-scout-17b-16e-instruct | Meta · Llama | 1148 | ±42 |
| 76 | mistral-medium-2505 | Mistral · Proprietary | 1148 | ±29 |
| 77 | mistral-large-3 | Mistral · Apache 2.0 | 1147 | ±48 |
| 78 | glm-4.6v | Z.ai · MIT | 1133 | ±44 |
| 79 | hunyuan-vision-1.5-thinking | Tencent · Proprietary | 1128 | ±44 |
| 80 | mistral-small-3.1-24b-instruct-2503 | Mistral · Apache 2.0 | 1119 | ±24 |
| 81 | llama-4-maverick-17b-128e-instruct | Meta · Llama 4 | 1113 | ±43 |

## Vision: Diagram (102 models, 193,994 votes)

| Rank | Model | Org · License | Score | CI |
|---|---|---|---|---|
| 1 | claude-fable-5 | Anthropic · Proprietary | 1363 | ±13 |
| 2 | claude-opus-4-7-high | Anthropic · Proprietary | 1337 | ±10 |
| 3 | claude-opus-4-7 | Anthropic · Proprietary | 1333 | ±10 |
| 4 | claude-opus-4-6 | Anthropic · Proprietary | 1331 | ±9 |
| 5 | grok-4.5 | SpaceXAI · Proprietary | 1328 | ±19 |
| 6 | claude-opus-5-high | Anthropic · Proprietary | 1328 | ±20 |
| 7 | qwen3.8-max | Alibaba · Proprietary | 1327 | ±16 |
| 8 | gpt-5.5 | OpenAI · Proprietary | 1326 | ±10 |
| 9 | claude-opus-4-6-high | Anthropic · Proprietary | 1325 | ±10 |
| 10 | claude-opus-4-8-high | Anthropic · Proprietary | 1320 | ±12 |
| 11 | claude-sonnet-5-high | Anthropic · Proprietary | 1320 | ±15 |
| 12 | gpt-5.4-high | OpenAI · Proprietary | 1319 | ±10 |
| 13 | gpt-5.4 | OpenAI · Proprietary | 1318 | ±10 |
| 14 | muse-spark-1.2 (xHigh) | Meta · Proprietary | 1316 | ±33 |
| 15 | gpt-5.5-instant | OpenAI · Proprietary | 1315 | ±15 |
| 16 | gpt-5.5-high | OpenAI · Proprietary | 1314 | ±10 |
| 17 | muse-spark | Meta · Proprietary | 1313 | ±16 |
| 18 | gemini-3.6-flash-high | Google · Proprietary | 1313 | ±35 |
| 19 | gpt-5.6-terra-xhigh | OpenAI · Proprietary | 1312 | ±20 |
| 20 | gpt-5.2-chat-latest-20260210 | OpenAI · Proprietary | 1310 | ±11 |
| 21 | gemini-3.1-pro-preview | Google · Proprietary | 1309 | ±8 |
| 22 | gpt-5.6-sol-xhigh | OpenAI · Proprietary | 1308 | ±21 |
| 23 | claude-sonnet-4-6 | Anthropic · Proprietary | 1306 | ±9 |
| 24 | gemini-3.5-flash-high | Google · Proprietary | 1304 | ±16 |
| 25 | claude-opus-4-8 | Anthropic · Proprietary | 1304 | ±12 |
| 26 | gemini-3-pro | Google · Proprietary | 1300 | ±12 |
| 27 | muse-spark-1.1 | Meta · Proprietary | 1299 | ±17 |
| 28 | gemini-3.5-flash-medium | Google · Proprietary | 1297 | ±16 |
| 29 | gemini-3-flash | Google · Proprietary | 1294 | ±7 |
| 30 | kimi-k2.6 | Moonshot · Modified MIT | 1292 | ±11 |
| 31 | dola-seed-2.0-pro | Bytedance · Proprietary | 1287 | ±12 |
| 32 | gemini-3-flash (thinking-minimal) | Google · Proprietary | 1284 | ±8 |
| 33 | gpt-5.4-mini-high | OpenAI · Proprietary | 1284 | ±9 |
| 34 | gemini-3.5-flash-lite | Google · Proprietary | 1283 | ±37 |
| 35 | gpt-5.6-luna-xhigh | OpenAI · Proprietary | 1281 | ±21 |
| 36 | gemma-4-31b | Google · Apache 2.0 | 1281 | ±8 |
| 37 | qwen3.7-plus | Alibaba · Proprietary | 1279 | ±14 |
| 38 | kimi-k2.5-thinking | Moonshot · Modified MIT | 1277 | ±8 |
| 39 | qwen3.5-397b-a17b | Alibaba · Apache 2.0 | 1276 | ±9 |
| 40 | gpt-5.1-high | OpenAI · Proprietary | 1275 | ±13 |
| 41 | gpt-5.2-high | OpenAI · Proprietary | 1274 | ±10 |
| 42 | grok-4.20-beta-0309-reasoning | SpaceXAI · Proprietary | 1273 | ±9 |
| 43 | mimo-v2.5 | Xiaomi · MIT | 1271 | ±10 |
| 44 | grok-4.20-multi-agent-beta-0309 | SpaceXAI · Proprietary | 1268 | ±9 |
| 45 | grok-4.3 | SpaceXAI · Proprietary | 1268 | ±10 |
| 46 | gemini-2.5-pro | Google · Proprietary | 1266 | ±7 |
| 47 | gpt-5.1 | OpenAI · Proprietary | 1264 | ±13 |
| 48 | chatgpt-4o-latest-20250326 | OpenAI · Proprietary | 1264 | ±11 |
| 49 | glm-5v-turbo | Z.ai · Proprietary | 1264 | ±9 |
| 50 | minimax-m3 | MiniMax · MiniMax Community License | 1263 | ±12 |
| 51 | gemma-4-26b-a4b | Google · Apache 2.0 | 1261 | ±9 |
| 52 | gpt-5-chat | OpenAI · Proprietary | 1260 | ±13 |
| 53 | gpt-5.2 | OpenAI · Proprietary | 1257 | ±10 |
| 54 | mimo-v2-omni | Xiaomi · Proprietary | 1254 | ±13 |
| 55 | gpt-5-high | OpenAI · Proprietary | 1252 | ±13 |
| 56 | gemini-3.1-flash-lite-preview | Google · Proprietary | 1251 | ±9 |
| 57 | kimi-k2.5-instant | Moonshot · Modified MIT | 1249 | ±19 |
| 58 | qwen-vl-max-2025-08-13 | Alibaba · Proprietary | 1249 | ±31 |
| 59 | qwen3.5-122b-a10b | Alibaba · Apache 2.0 | 1246 | ±11 |
| 60 | Inkling Small | Thinky · Apache 2.0 | 1243 | ±30 |
| 61 | mistral-medium-3.5 | Mistral · Modified MIT | 1242 | ±17 |
| 62 | qwen3.5-27b | Alibaba · Apache 2.0 | 1242 | ±9 |
| 63 | mistral-large-3 | Mistral · Apache 2.0 | 1241 | ±22 |
| 64 | gemini-2.5-flash-preview-09-2025 | Google · Proprietary | 1240 | ±19 |
| 65 | qwen3-vl-235b-a22b-instruct | Alibaba · Apache 2.0 | 1239 | ±12 |
| 66 | gemini-2.5-flash | Google · Proprietary | 1233 | ±8 |
| 67 | gpt-4.1-2025-04-14 | OpenAI · Proprietary | 1232 | ±13 |
| 68 | o3-2025-04-16 | OpenAI · Proprietary | 1231 | ±12 |
| 69 | gpt-5.4-nano-high | OpenAI · Proprietary | 1229 | ±9 |
| 70 | claude-sonnet-4-20250514-thinking-32k | Anthropic · Proprietary | 1228 | ±37 |
| 71 | ernie-5.0-preview-1220 | Baidu · Proprietary | 1223 | ±22 |
| 72 | o4-mini-2025-04-16 | OpenAI · Proprietary | 1220 | ±13 |
| 73 | claude-3-7-sonnet-20250219-thinking-32k | Anthropic · Proprietary | 1216 | ±33 |
| 74 | grok-4-1-fast-reasoning | SpaceXAI · Proprietary | 1215 | ±11 |
| 75 | gpt-5-mini-high | OpenAI · Proprietary | 1214 | ±15 |
| 76 | qwen3-vl-235b-a22b-thinking | Alibaba · Apache 2.0 | 1210 | ±26 |
| 77 | gpt-4.1-mini-2025-04-14 | OpenAI · Proprietary | 1209 | ±14 |
| 78 | claude-opus-4-20250514 | Anthropic · Proprietary | 1203 | ±25 |
| 79 | claude-opus-4-20250514-thinking-16k | Anthropic · Proprietary | 1203 | ±35 |
| 80 | claude-sonnet-4-20250514 | Anthropic · Proprietary | 1202 | ±29 |
| 81 | claude-3-7-sonnet-20250219 | Anthropic · Proprietary | 1192 | ±32 |
| 82 | grok-4-0709 | SpaceXAI · Proprietary | 1191 | ±13 |
| 83 | gemini-2.5-flash-lite-preview-06-17-thinking | Google · Proprietary | 1187 | ±13 |
| 84 | hunyuan-vision-1.5-thinking | Tencent · Proprietary | 1186 | ±26 |
| 85 | glm-4.6v | Z.ai · MIT | 1186 | ±24 |
| 86 | claude-3-5-sonnet-20241022 | Anthropic · Proprietary | 1184 | ±32 |
| 87 | gemini-2.5-flash-lite-preview-09-2025-no-thinking | Google · Proprietary | 1183 | ±19 |
| 88 | mistral-medium-2508 | Mistral · Proprietary | 1178 | ±11 |
| 89 | gemini-2.0-flash-001 | Google · Proprietary | 1176 | ±18 |
| 90 | glm-4.5v | Z.ai · MIT | 1169 | ±30 |
| 91 | mistral-medium-2505 | Mistral · Proprietary | 1167 | ±16 |
| 92 | gemma-3-27b-it | Google · Gemma | 1166 | ±15 |
| 93 | step-1o-turbo-202506 | StepFun · Proprietary | 1162 | ±29 |
| 94 | gpt-5-nano-high | OpenAI · Proprietary | 1153 | ±27 |
| 95 | llama-4-maverick-17b-128e-instruct | Meta · Llama 4 | 1152 | ±19 |
| 96 | llama-4-scout-17b-16e-instruct | Meta · Llama | 1148 | ±20 |
| 97 | step-3 | StepFun · Apache 2.0 | 1146 | ±30 |
| 98 | mistral-small-2506 | Mistral · Apache 2.0 | 1140 | ±18 |
| 99 | claude-3-5-haiku-20241022 | Anthropic · Proprietary | 1135 | ±33 |
| 100 | mistral-small-3.1-24b-instruct-2503 | Mistral · Apache 2.0 | 1130 | ±16 |
| 101 | hunyuan-large-vision | Tencent · Proprietary | 1114 | ±35 |
| 102 | molmo-2-8b | Ai2 · Apache 2.0 | 1108 | ±39 |

## Vision: Entity Recognition (46 models, 6,010 votes)

Notable: no Claude Fable/Opus 5/Sonnet 5, Muse Spark, DeepSeek, GLM, or Kimi K3 model appears anywhere in this category.

| Rank | Model | Org · License | Score | CI |
|---|---|---|---|---|
| 1 | gemini-3-pro | Google · Proprietary | 1299 | ±36 |
| 2 | gemini-3-flash | Google · Proprietary | 1292 | ±32 |
| 3 | gemini-3.1-pro-preview | Google · Proprietary | 1286 | ±31 |
| 4 | gemini-3-flash (thinking-minimal) | Google · Proprietary | 1278 | ±32 |
| 5 | gemini-3.1-flash-lite-preview | Google · Proprietary | 1272 | ±35 |
| 6 | claude-opus-4-6-high | Anthropic · Proprietary | 1269 | ±52 |
| 7 | gpt-5-high | OpenAI · Proprietary | 1257 | ±33 |
| 8 | gemini-2.5-pro | Google · Proprietary | 1252 | ±22 |
| 9 | grok-4.20-beta-0309-reasoning | SpaceXAI · Proprietary | 1247 | ±45 |
| 10 | gpt-5.1-high | OpenAI · Proprietary | 1240 | ±50 |
| 11 | grok-4-0709 | SpaceXAI · Proprietary | 1236 | ±35 |
| 12 | claude-opus-4-7-high | Anthropic · Proprietary | 1234 | ±42 |
| 13 | o3-2025-04-16 | OpenAI · Proprietary | 1234 | ±31 |
| 14 | grok-4.20-multi-agent-beta-0309 | SpaceXAI · Proprietary | 1231 | ±45 |
| 15 | kimi-k2.5-thinking | Moonshot · Modified MIT | 1230 | ±35 |
| 16 | grok-4.3 | SpaceXAI · Proprietary | 1227 | ±53 |
| 17 | qwen3.5-397b-a17b | Alibaba · Apache 2.0 | 1226 | ±41 |
| 18 | chatgpt-4o-latest-20250326 | OpenAI · Proprietary | 1225 | ±32 |
| 19 | gpt-5.2-chat-latest-20260210 | OpenAI · Proprietary | 1223 | ±52 |
| 20 | claude-opus-4-6 | Anthropic · Proprietary | 1222 | ±45 |
| 21 | gemini-2.5-flash | Google · Proprietary | 1220 | ±24 |
| 22 | o4-mini-2025-04-16 | OpenAI · Proprietary | 1218 | ±33 |
| 23 | gpt-5-mini-high | OpenAI · Proprietary | 1207 | ±40 |
| 24 | grok-4-1-fast-reasoning | SpaceXAI · Proprietary | 1202 | ±53 |
| 25 | gpt-4.1-mini-2025-04-14 | OpenAI · Proprietary | 1198 | ±33 |
| 26 | gpt-5.2 | OpenAI · Proprietary | 1192 | ±41 |
| 27 | gemma-4-31b | Google · Apache 2.0 | 1191 | ±32 |
| 28 | qwen3-vl-235b-a22b-instruct | Alibaba · Apache 2.0 | 1190 | ±43 |
| 29 | gpt-5-chat | OpenAI · Proprietary | 1188 | ±33 |
| 30 | gpt-5.1 | OpenAI · Proprietary | 1188 | ±44 |
| 31 | gpt-5.2-high | OpenAI · Proprietary | 1185 | ±44 |
| 32 | gemini-2.5-flash-lite-preview-06-17-thinking | Google · Proprietary | 1185 | ±32 |
| 33 | gpt-5.4-high | OpenAI · Proprietary | 1183 | ±53 |
| 34 | gpt-4.1-2025-04-14 | OpenAI · Proprietary | 1183 | ±32 |
| 35 | gpt-5.4-mini-high | OpenAI · Proprietary | 1182 | ±47 |
| 36 | glm-5v-turbo | Z.ai · Proprietary | 1181 | ±45 |
| 37 | gemma-3-27b-it | Google · Gemma | 1175 | ±34 |
| 38 | mimo-v2.5 | Xiaomi · MIT | 1172 | ±47 |
| 39 | claude-sonnet-4-6 | Anthropic · Proprietary | 1159 | ±50 |
| 40 | gemma-4-26b-a4b | Google · Apache 2.0 | 1153 | ±39 |
| 41 | qwen3.5-27b | Alibaba · Apache 2.0 | 1149 | ±47 |
| 42 | mistral-small-2506 | Mistral · Apache 2.0 | 1134 | ±41 |
| 43 | mistral-medium-2508 | Mistral · Proprietary | 1132 | ±32 |
| 44 | mistral-small-3.1-24b-instruct-2503 | Mistral · Apache 2.0 | 1127 | ±40 |
| 45 | mistral-medium-2505 | Mistral · Proprietary | 1123 | ±40 |
| 46 | gpt-5.4-nano-high | OpenAI · Proprietary | 1119 | ±47 |

## Vision: Homework (94 models, 100,107 votes)

| Rank | Model | Org · License | Score | CI |
|---|---|---|---|---|
| 1 | claude-fable-5 | Anthropic · Proprietary | 1346 | ±20 |
| 2 | claude-opus-5-high | Anthropic · Proprietary | 1344 | ±36 |
| 3 | gpt-5.5-high | OpenAI · Proprietary | 1339 | ±13 |
| 4 | claude-opus-4-8-high | Anthropic · Proprietary | 1338 | ±17 |
| 5 | grok-4.5 | SpaceXAI · Proprietary | 1337 | ±33 |
| 6 | qwen3.8-max | Alibaba · Proprietary | 1331 | ±30 |
| 7 | gpt-5.4-high | OpenAI · Proprietary | 1330 | ±12 |
| 8 | gpt-5.5 | OpenAI · Proprietary | 1330 | ±13 |
| 9 | claude-opus-4-7-high | Anthropic · Proprietary | 1330 | ±12 |
| 10 | claude-opus-4-7 | Anthropic · Proprietary | 1327 | ±12 |
| 11 | claude-opus-4-6-high | Anthropic · Proprietary | 1325 | ±13 |
| 12 | gemini-3.5-flash-medium | Google · Proprietary | 1322 | ±26 |
| 13 | claude-opus-4-8 | Anthropic · Proprietary | 1322 | ±16 |
| 14 | gpt-5.6-terra-xhigh | OpenAI · Proprietary | 1317 | ±37 |
| 15 | claude-opus-4-6 | Anthropic · Proprietary | 1314 | ±11 |
| 16 | gpt-5.6-sol-xhigh | OpenAI · Proprietary | 1313 | ±35 |
| 17 | claude-sonnet-5-high | Anthropic · Proprietary | 1313 | ±25 |
| 18 | gemini-3.1-pro-preview | Google · Proprietary | 1311 | ±9 |
| 19 | gemini-3-pro | Google · Proprietary | 1309 | ±14 |
| 20 | gemini-3-flash | Google · Proprietary | 1307 | ±9 |
| 21 | gpt-5.4 | OpenAI · Proprietary | 1307 | ±12 |
| 22 | kimi-k2.6 | Moonshot · Modified MIT | 1302 | ±13 |
| 23 | claude-sonnet-4-6 | Anthropic · Proprietary | 1301 | ±11 |
| 24 | gemma-4-31b | Google · Apache 2.0 | 1300 | ±10 |
| 25 | muse-spark | Meta · Proprietary | 1300 | ±20 |
| 26 | gemini-3-flash (thinking-minimal) | Google · Proprietary | 1298 | ±9 |
| 27 | gemini-3.5-flash-high | Google · Proprietary | 1294 | ±23 |
| 28 | gpt-5.2-chat-latest-20260210 | OpenAI · Proprietary | 1293 | ±13 |
| 29 | gpt-5.4-mini-high | OpenAI · Proprietary | 1293 | ±12 |
| 30 | kimi-k2.5-thinking | Moonshot · Modified MIT | 1290 | ±11 |
| 31 | gemma-4-26b-a4b | Google · Apache 2.0 | 1285 | ±11 |
| 32 | gpt-5.6-luna-xhigh | OpenAI · Proprietary | 1285 | ±36 |
| 33 | gpt-5.2-high | OpenAI · Proprietary | 1284 | ±12 |
| 34 | qwen3.5-397b-a17b | Alibaba · Apache 2.0 | 1283 | ±11 |
| 35 | gpt-5.1-high | OpenAI · Proprietary | 1282 | ±17 |
| 36 | gpt-5.5-instant | OpenAI · Proprietary | 1282 | ±19 |
| 37 | muse-spark-1.1 | Meta · Proprietary | 1279 | ±28 |
| 38 | dola-seed-2.0-pro | Bytedance · Proprietary | 1279 | ±15 |
| 39 | qwen3.7-plus | Alibaba · Proprietary | 1276 | ±21 |
| 40 | gpt-5-chat | OpenAI · Proprietary | 1274 | ±17 |
| 41 | grok-4.20-multi-agent-beta-0309 | SpaceXAI · Proprietary | 1273 | ±12 |
| 42 | gemini-2.5-pro | Google · Proprietary | 1272 | ±9 |
| 43 | gemini-3.1-flash-lite-preview | Google · Proprietary | 1270 | ±11 |
| 44 | gpt-5.2 | OpenAI · Proprietary | 1267 | ±12 |
| 45 | gemini-2.5-flash-preview-09-2025 | Google · Proprietary | 1266 | ±23 |
| 46 | minimax-m3 | MiniMax · MiniMax Community License | 1263 | ±17 |
| 47 | grok-4.20-beta-0309-reasoning | SpaceXAI · Proprietary | 1263 | ±11 |
| 48 | mimo-v2.5 | Xiaomi · MIT | 1260 | ±12 |
| 49 | qwen3-vl-235b-a22b-instruct | Alibaba · Apache 2.0 | 1260 | ±15 |
| 50 | gpt-5-high | OpenAI · Proprietary | 1260 | ±16 |
| 51 | grok-4.3 | SpaceXAI · Proprietary | 1256 | ±13 |
| 52 | gpt-5.1 | OpenAI · Proprietary | 1254 | ±16 |
| 53 | glm-5v-turbo | Z.ai · Proprietary | 1254 | ±11 |
| 54 | qwen3.5-122b-a10b | Alibaba · Apache 2.0 | 1252 | ±14 |
| 55 | o4-mini-2025-04-16 | OpenAI · Proprietary | 1251 | ±16 |
| 56 | gpt-4.1-2025-04-14 | OpenAI · Proprietary | 1249 | ±16 |
| 57 | kimi-k2.5-instant | Moonshot · Modified MIT | 1247 | ±24 |
| 58 | o3-2025-04-16 | OpenAI · Proprietary | 1247 | ±15 |
| 59 | chatgpt-4o-latest-20250326 | OpenAI · Proprietary | 1247 | ±13 |
| 60 | mimo-v2-omni | Xiaomi · Proprietary | 1246 | ±16 |
| 61 | qwen3.5-27b | Alibaba · Apache 2.0 | 1242 | ±12 |
| 62 | gemini-2.5-flash | Google · Proprietary | 1238 | ±9 |
| 63 | ernie-5.0-preview-1220 | Baidu · Proprietary | 1237 | ±29 |
| 64 | claude-opus-4-20250514 | Anthropic · Proprietary | 1237 | ±32 |
| 65 | gpt-5.4-nano-high | OpenAI · Proprietary | 1235 | ±12 |
| 66 | gpt-5-mini-high | OpenAI · Proprietary | 1233 | ±19 |
| 67 | hunyuan-vision-1.5-thinking | Tencent · Proprietary | 1229 | ±33 |
| 68 | claude-3-7-sonnet-20250219 | Anthropic · Proprietary | 1228 | ±36 |
| 69 | qwen3-vl-235b-a22b-thinking | Alibaba · Apache 2.0 | 1227 | ±32 |
| 70 | claude-sonnet-4-20250514 | Anthropic · Proprietary | 1222 | ±35 |
| 71 | gpt-4.1-mini-2025-04-14 | OpenAI · Proprietary | 1222 | ±17 |
| 72 | mistral-large-3 | Mistral · Apache 2.0 | 1221 | ±38 |
| 73 | claude-opus-4-20250514-thinking-16k | Anthropic · Proprietary | 1216 | ±45 |
| 74 | mistral-medium-3.5 | Mistral · Modified MIT | 1216 | ±23 |
| 75 | claude-3-7-sonnet-20250219-thinking-32k | Anthropic · Proprietary | 1210 | ±40 |
| 76 | gemini-2.5-flash-lite-preview-09-2025-no-thinking | Google · Proprietary | 1194 | ±22 |
| 77 | gemini-2.5-flash-lite-preview-06-17-thinking | Google · Proprietary | 1190 | ±17 |
| 78 | gemini-2.0-flash-001 | Google · Proprietary | 1190 | ±21 |
| 79 | gpt-5-nano-high | OpenAI · Proprietary | 1187 | ±35 |
| 80 | mistral-small-2506 | Mistral · Apache 2.0 | 1176 | ±23 |
| 81 | step-3 | StepFun · Apache 2.0 | 1176 | ±39 |
| 82 | gemma-3-27b-it | Google · Gemma | 1172 | ±19 |
| 83 | grok-4-1-fast-reasoning | SpaceXAI · Proprietary | 1170 | ±15 |
| 84 | claude-3-5-sonnet-20241022 | Anthropic · Proprietary | 1170 | ±38 |
| 85 | mistral-medium-2508 | Mistral · Proprietary | 1170 | ±13 |
| 86 | glm-4.5v | Z.ai · MIT | 1170 | ±38 |
| 87 | grok-4-0709 | SpaceXAI · Proprietary | 1169 | ±18 |
| 88 | mistral-medium-2505 | Mistral · Proprietary | 1165 | ±20 |
| 89 | llama-4-maverick-17b-128e-instruct | Meta · Llama 4 | 1163 | ±25 |
| 90 | mistral-small-3.1-24b-instruct-2503 | Mistral · Apache 2.0 | 1159 | ±21 |
| 91 | glm-4.6v | Z.ai · MIT | 1155 | ±37 |
| 92 | claude-3-5-haiku-20241022 | Anthropic · Proprietary | 1150 | ±38 |
| 93 | llama-4-scout-17b-16e-instruct | Meta · Llama | 1149 | ±26 |
| 94 | step-1o-turbo-202506 | StepFun · Proprietary | 1138 | ±35 |

## Vision: Humor (74 models, 30,160 votes)

| Rank | Model | Org · License | Score | CI |
|---|---|---|---|---|
| 1 | muse-spark | Meta · Proprietary | 1325 | ±41 |
| 2 | claude-fable-5 | Anthropic · Proprietary | 1323 | ±36 |
| 3 | gemini-3-pro | Google · Proprietary | 1316 | ±25 |
| 4 | claude-opus-4-6 | Anthropic · Proprietary | 1306 | ±21 |
| 5 | gemini-3.1-pro-preview | Google · Proprietary | 1306 | ±17 |
| 6 | gpt-5.5-instant | OpenAI · Proprietary | 1297 | ±40 |
| 7 | claude-opus-4-7-high | Anthropic · Proprietary | 1294 | ±23 |
| 8 | claude-opus-4-6-high | Anthropic · Proprietary | 1293 | ±23 |
| 9 | qwen3.8-max | Alibaba · Proprietary | 1292 | ±52 |
| 10 | gemini-3.5-flash-medium | Google · Proprietary | 1288 | ±48 |
| 11 | claude-opus-4-7 | Anthropic · Proprietary | 1288 | ±22 |
| 12 | gpt-5.5-high | OpenAI · Proprietary | 1287 | ±24 |
| 13 | gemini-3.5-flash-high | Google · Proprietary | 1286 | ±47 |
| 14 | gpt-5.5 | OpenAI · Proprietary | 1277 | ±24 |
| 15 | claude-opus-4-8-high | Anthropic · Proprietary | 1275 | ±31 |
| 16 | claude-opus-4-8 | Anthropic · Proprietary | 1271 | ±30 |
| 17 | grok-4.20-beta-0309-reasoning | SpaceXAI · Proprietary | 1269 | ±21 |
| 18 | qwen3.7-plus | Alibaba · Proprietary | 1266 | ±38 |
| 19 | muse-spark-1.1 | Meta · Proprietary | 1265 | ±44 |
| 20 | gemini-3-flash | Google · Proprietary | 1265 | ±17 |
| 21 | kimi-k2.5-thinking | Moonshot · Modified MIT | 1263 | ±20 |
| 22 | kimi-k2.6 | Moonshot · Modified MIT | 1262 | ±26 |
| 23 | gpt-5.4-high | OpenAI · Proprietary | 1259 | ±24 |
| 24 | claude-sonnet-5-high | Anthropic · Proprietary | 1259 | ±41 |
| 25 | grok-4.20-multi-agent-beta-0309 | SpaceXAI · Proprietary | 1258 | ±22 |
| 26 | dola-seed-2.0-pro | Bytedance · Proprietary | 1258 | ±31 |
| 27 | gemini-3.1-flash-lite-preview | Google · Proprietary | 1255 | ±20 |
| 28 | gemini-3-flash (thinking-minimal) | Google · Proprietary | 1253 | ±17 |
| 29 | gemma-4-26b-a4b | Google · Apache 2.0 | 1252 | ±21 |
| 30 | gemma-4-31b | Google · Apache 2.0 | 1251 | ±17 |
| 31 | qwen3.5-397b-a17b | Alibaba · Apache 2.0 | 1247 | ±21 |
| 32 | gemini-2.5-pro | Google · Proprietary | 1247 | ±15 |
| 33 | gpt-5.1 | OpenAI · Proprietary | 1246 | ±34 |
| 34 | gpt-5.4 | OpenAI · Proprietary | 1240 | ±23 |
| 35 | claude-sonnet-4-6 | Anthropic · Proprietary | 1239 | ±21 |
| 36 | gpt-5.4-mini-high | OpenAI · Proprietary | 1238 | ±23 |
| 37 | grok-4.3 | SpaceXAI · Proprietary | 1237 | ±25 |
| 38 | gpt-5.2-chat-latest-20260210 | OpenAI · Proprietary | 1234 | ±27 |
| 39 | minimax-m3 | MiniMax · MiniMax Community License | 1233 | ±32 |
| 40 | gpt-5.1-high | OpenAI · Proprietary | 1233 | ±32 |
| 41 | glm-5v-turbo | Z.ai · Proprietary | 1232 | ±19 |
| 42 | chatgpt-4o-latest-20250326 | OpenAI · Proprietary | 1230 | ±22 |
| 43 | qwen3.5-122b-a10b | Alibaba · Apache 2.0 | 1227 | ±29 |
| 44 | grok-4-1-fast-reasoning | SpaceXAI · Proprietary | 1225 | ±29 |
| 45 | gemini-2.5-flash-preview-09-2025 | Google · Proprietary | 1224 | ±37 |
| 46 | gpt-5.2-high | OpenAI · Proprietary | 1221 | ±25 |
| 47 | mimo-v2.5 | Xiaomi · MIT | 1220 | ±22 |
| 48 | o3-2025-04-16 | OpenAI · Proprietary | 1211 | ±20 |
| 49 | gemini-2.5-flash | Google · Proprietary | 1205 | ±15 |
| 50 | gpt-5-high | OpenAI · Proprietary | 1204 | ±22 |
| 51 | qwen3.5-27b | Alibaba · Apache 2.0 | 1203 | ±22 |
| 52 | gpt-5-chat | OpenAI · Proprietary | 1200 | ±20 |
| 53 | gpt-4.1-mini-2025-04-14 | OpenAI · Proprietary | 1197 | ±20 |
| 54 | o4-mini-2025-04-16 | OpenAI · Proprietary | 1192 | ±20 |
| 55 | gemini-2.5-flash-lite-preview-06-17-thinking | Google · Proprietary | 1189 | ±20 |
| 56 | gpt-5.2 | OpenAI · Proprietary | 1186 | ±25 |
| 57 | mistral-medium-3.5 | Mistral · Modified MIT | 1183 | ±40 |
| 58 | gpt-4.1-2025-04-14 | OpenAI · Proprietary | 1183 | ±20 |
| 59 | gpt-5-mini-high | OpenAI · Proprietary | 1182 | ±24 |
| 60 | grok-4-0709 | SpaceXAI · Proprietary | 1171 | ±21 |
| 61 | gemini-2.0-flash-001 | Google · Proprietary | 1169 | ±41 |
| 62 | mimo-v2-omni | Xiaomi · Proprietary | 1169 | ±33 |
| 63 | gpt-5.4-nano-high | OpenAI · Proprietary | 1159 | ±23 |
| 64 | qwen3-vl-235b-a22b-instruct | Alibaba · Apache 2.0 | 1158 | ±28 |
| 65 | gemma-3-27b-it | Google · Gemma | 1152 | ±24 |
| 66 | ernie-5.0-preview-1220 | Baidu · Proprietary | 1144 | ±44 |
| 67 | mistral-medium-2508 | Mistral · Proprietary | 1143 | ±19 |
| 68 | gemini-2.5-flash-lite-preview-09-2025-no-thinking | Google · Proprietary | 1135 | ±38 |
| 69 | mistral-small-2506 | Mistral · Apache 2.0 | 1127 | ±29 |
| 70 | mistral-medium-2505 | Mistral · Proprietary | 1123 | ±30 |
| 71 | mistral-small-3.1-24b-instruct-2503 | Mistral · Apache 2.0 | 1118 | ±23 |
| 72 | llama-4-scout-17b-16e-instruct | Meta · Llama | 1101 | ±44 |
| 73 | llama-4-maverick-17b-128e-instruct | Meta · Llama 4 | 1093 | ±39 |
| 74 | gpt-5-nano-high | OpenAI · Proprietary | 1092 | ±47 |

## Vision: OCR (102 models, 555,961 votes)

| Rank | Model | Org · License | Score | CI |
|---|---|---|---|---|
| 1 | claude-fable-5 | Anthropic · Proprietary | 1331 | ±9 |
| 2 | qwen3.8-max | Alibaba · Proprietary | 1317 | ±10 |
| 3 | claude-opus-4-6-high | Anthropic · Proprietary | 1315 | ±7 |
| 4 | claude-opus-4-7 | Anthropic · Proprietary | 1314 | ±7 |
| 5 | claude-opus-4-7-high | Anthropic · Proprietary | 1313 | ±7 |
| 6 | claude-opus-4-6 | Anthropic · Proprietary | 1310 | ±7 |
| 7 | gemini-3.6-flash-high | Google · Proprietary | 1308 | ±21 |
| 8 | claude-opus-5-high | Anthropic · Proprietary | 1308 | ±12 |
| 9 | gemini-3-pro | Google · Proprietary | 1303 | ±8 |
| 10 | muse-spark | Meta · Proprietary | 1302 | ±10 |
| 11 | gpt-5.4-high | OpenAI · Proprietary | 1299 | ±7 |
| 12 | muse-spark-1.2 (xHigh) | Meta · Proprietary | 1299 | ±21 |
| 13 | gpt-5.5-high | OpenAI · Proprietary | 1299 | ±7 |
| 14 | claude-opus-4-8-high | Anthropic · Proprietary | 1299 | ±8 |
| 15 | gpt-5.5 | OpenAI · Proprietary | 1299 | ±7 |
| 16 | grok-4.5 | SpaceXAI · Proprietary | 1296 | ±12 |
| 17 | gemini-3.5-flash-medium | Google · Proprietary | 1296 | ±10 |
| 18 | gemini-3.1-pro-preview | Google · Proprietary | 1294 | ±6 |
| 19 | gpt-5.4 | OpenAI · Proprietary | 1294 | ±7 |
| 20 | muse-spark-1.1 | Meta · Proprietary | 1293 | ±11 |
| 21 | claude-opus-4-8 | Anthropic · Proprietary | 1293 | ±8 |
| 22 | gemini-3.5-flash-high | Google · Proprietary | 1292 | ±10 |
| 23 | claude-sonnet-5-high | Anthropic · Proprietary | 1291 | ±10 |
| 24 | claude-sonnet-4-6 | Anthropic · Proprietary | 1291 | ±6 |
| 25 | gpt-5.6-sol-xhigh | OpenAI · Proprietary | 1288 | ±13 |
| 26 | gpt-5.2-chat-latest-20260210 | OpenAI · Proprietary | 1288 | ±7 |
| 27 | gpt-5.5-instant | OpenAI · Proprietary | 1286 | ±10 |
| 28 | gemini-3-flash | Google · Proprietary | 1285 | ±5 |
| 29 | gemini-3.5-flash-lite | Google · Proprietary | 1282 | ±21 |
| 30 | gpt-5.6-terra-xhigh | OpenAI · Proprietary | 1280 | ±13 |
| 31 | kimi-k2.6 | Moonshot · Modified MIT | 1278 | ±7 |
| 32 | qwen3.7-plus | Alibaba · Proprietary | 1278 | ±9 |
| 33 | gemini-3-flash (thinking-minimal) | Google · Proprietary | 1271 | ±5 |
| 34 | dola-seed-2.0-pro | Bytedance · Proprietary | 1270 | ±8 |
| 35 | gemma-4-31b | Google · Apache 2.0 | 1270 | ±6 |
| 36 | gpt-5.4-mini-high | OpenAI · Proprietary | 1266 | ±7 |
| 37 | grok-4.20-beta-0309-reasoning | SpaceXAI · Proprietary | 1264 | ±6 |
| 38 | kimi-k2.5-thinking | Moonshot · Modified MIT | 1264 | ±6 |
| 39 | qwen3.5-397b-a17b | Alibaba · Apache 2.0 | 1262 | ±6 |
| 40 | grok-4.20-multi-agent-beta-0309 | SpaceXAI · Proprietary | 1261 | ±6 |
| 41 | gpt-5.2-high | OpenAI · Proprietary | 1260 | ±7 |
| 42 | gpt-5.1-high | OpenAI · Proprietary | 1258 | ±9 |
| 43 | gemini-2.5-pro | Google · Proprietary | 1257 | ±5 |
| 44 | gpt-5.6-luna-xhigh | OpenAI · Proprietary | 1256 | ±13 |
| 45 | gemma-4-26b-a4b | Google · Apache 2.0 | 1256 | ±7 |
| 46 | minimax-m3 | MiniMax · MiniMax Community License | 1253 | ±8 |
| 47 | mimo-v2.5 | Xiaomi · MIT | 1253 | ±7 |
| 48 | grok-4.3 | SpaceXAI · Proprietary | 1253 | ±7 |
| 49 | gpt-5.1 | OpenAI · Proprietary | 1252 | ±9 |
| 50 | chatgpt-4o-latest-20250326 | OpenAI · Proprietary | 1249 | ±7 |
| 51 | gemini-3.1-flash-lite-preview | Google · Proprietary | 1247 | ±6 |
| 52 | kimi-k2.5-instant | Moonshot · Modified MIT | 1245 | ±12 |
| 53 | gpt-5-chat | OpenAI · Proprietary | 1245 | ±9 |
| 54 | glm-5v-turbo | Z.ai · Proprietary | 1244 | ±6 |
| 55 | qwen3.5-122b-a10b | Alibaba · Apache 2.0 | 1239 | ±7 |
| 56 | gemini-2.5-flash-preview-09-2025 | Google · Proprietary | 1239 | ±12 |
| 57 | gpt-5.2 | OpenAI · Proprietary | 1238 | ±6 |
| 58 | qwen3.5-27b | Alibaba · Apache 2.0 | 1232 | ±6 |
| 59 | gpt-5-high | OpenAI · Proprietary | 1232 | ±9 |
| 60 | mimo-v2-omni | Xiaomi · Proprietary | 1231 | ±8 |
| 61 | ernie-5.0-preview-1220 | Baidu · Proprietary | 1230 | ±14 |
| 62 | qwen3-vl-235b-a22b-instruct | Alibaba · Apache 2.0 | 1229 | ±8 |
| 63 | gpt-4.1-2025-04-14 | OpenAI · Proprietary | 1226 | ±9 |
| 64 | o3-2025-04-16 | OpenAI · Proprietary | 1223 | ±8 |
| 65 | Inkling Small | Thinky · Apache 2.0 | 1223 | ±18 |
| 66 | gemini-2.5-flash | Google · Proprietary | 1222 | ±5 |
| 67 | mistral-large-3 | Mistral · Apache 2.0 | 1219 | ±14 |
| 68 | claude-opus-4-20250514-thinking-16k | Anthropic · Proprietary | 1216 | ±20 |
| 69 | claude-sonnet-4-20250514-thinking-32k | Anthropic · Proprietary | 1216 | ±21 |
| 70 | mistral-medium-3.5 | Mistral · Modified MIT | 1215 | ±11 |
| 71 | gpt-5.4-nano-high | OpenAI · Proprietary | 1215 | ±7 |
| 72 | qwen-vl-max-2025-08-13 | Alibaba · Proprietary | 1214 | ±18 |
| 73 | claude-3-7-sonnet-20250219-thinking-32k | Anthropic · Proprietary | 1210 | ±19 |
| 74 | o4-mini-2025-04-16 | OpenAI · Proprietary | 1210 | ±9 |
| 75 | gpt-4.1-mini-2025-04-14 | OpenAI · Proprietary | 1206 | ±9 |
| 76 | qwen3-vl-235b-a22b-thinking | Alibaba · Apache 2.0 | 1201 | ±16 |
| 77 | gpt-5-mini-high | OpenAI · Proprietary | 1197 | ±10 |
| 78 | claude-opus-4-20250514 | Anthropic · Proprietary | 1197 | ±16 |
| 79 | grok-4-1-fast-reasoning | SpaceXAI · Proprietary | 1192 | ±8 |
| 80 | claude-sonnet-4-20250514 | Anthropic · Proprietary | 1190 | ±17 |
| 81 | gemini-2.5-flash-lite-preview-06-17-thinking | Google · Proprietary | 1188 | ±9 |
| 82 | claude-3-7-sonnet-20250219 | Anthropic · Proprietary | 1186 | ±19 |
| 83 | gemini-2.5-flash-lite-preview-09-2025-no-thinking | Google · Proprietary | 1185 | ±12 |
| 84 | claude-3-5-sonnet-20241022 | Anthropic · Proprietary | 1177 | ±19 |
| 85 | grok-4-0709 | SpaceXAI · Proprietary | 1175 | ±9 |
| 86 | mistral-medium-2508 | Mistral · Proprietary | 1172 | ±7 |
| 87 | glm-4.6v | Z.ai · MIT | 1171 | ±17 |
| 88 | gemini-2.0-flash-001 | Google · Proprietary | 1166 | ±11 |
| 89 | gemma-3-27b-it | Google · Gemma | 1162 | ±10 |
| 90 | hunyuan-vision-1.5-thinking | Tencent · Proprietary | 1161 | ±16 |
| 91 | mistral-medium-2505 | Mistral · Proprietary | 1159 | ±10 |
| 92 | glm-4.5v | Z.ai · MIT | 1158 | ±17 |
| 93 | gpt-5-nano-high | OpenAI · Proprietary | 1158 | ±15 |
| 94 | step-1o-turbo-202506 | StepFun · Proprietary | 1154 | ±17 |
| 95 | llama-4-maverick-17b-128e-instruct | Meta · Llama 4 | 1153 | ±12 |
| 96 | step-3 | StepFun · Apache 2.0 | 1151 | ±17 |
| 97 | hunyuan-large-vision | Tencent · Proprietary | 1146 | ±20 |
| 98 | mistral-small-2506 | Mistral · Apache 2.0 | 1142 | ±11 |
| 99 | mistral-small-3.1-24b-instruct-2503 | Mistral · Apache 2.0 | 1133 | ±10 |
| 100 | llama-4-scout-17b-16e-instruct | Meta · Llama | 1130 | ±12 |
| 101 | claude-3-5-haiku-20241022 | Anthropic · Proprietary | 1129 | ±20 |
| 102 | molmo-2-8b | Ai2 · Apache 2.0 | 1087 | ±25 |

---

## Document Arena — no sub-categories found

Source: https://arena.ai/leaderboard/document. Read 2026-08-20. Data as of Jul 26, 2026. 322,650 votes. 39 models. Score type: Arena Score (Elo-like) ± symmetric 95% CI.

The Filters panel was opened and inspected directly (not just the top nav): it contains "View as" (Ranking/Pareto), "Style Control" (On/Off), "License Type", "Score Range", "Input Price", "Output Price", "Context Length" — no "Categories" section. Document Overall is already collected per the prior file; nothing further to add here.

## Search Arena — no sub-categories, but has a scoring "Adjustments" toggle

Source: https://arena.ai/leaderboard/search. Read 2026-08-20. Data as of Jul 21, 2026. 939,947 votes. 32 models. Score type: Arena Score (Elo-like) ± symmetric 95% CI.

The Filters panel has no "Categories" section, but does have an "Adjustments" radio group (Style Control / Factuality / None) that other boards (Vision, Document, Text) do not show. Selecting "Factuality" changes the ranking and scores from the default view. This is a re-scoring toggle on the same board, not a separate sub-category, so only the headline is recorded (Search Overall itself is already collected):

Top of "Factuality"-adjusted view: 1. gpt-5.5-search (OpenAI · Proprietary) 1244 ±4; 2. claude-opus-4-6-search (Anthropic · Proprietary) 1227 ±3; 3. gpt-5.2-search (OpenAI · Proprietary) 1223 ±4; 4. claude-fable-5 (Anthropic · Proprietary) 1216 ±6; 5. ernie-5.1 (Baidu · Proprietary) 1214 ±9.

For comparison, the default/"None"-adjustment view's rank 1 is claude-opus-4-6-search at 1253 ±5 (already on file). The two views are not equivalent and should not be conflated.

---

## Notes on models of interest across the 9 new Vision categories

- Claude Fable 5 appears in every category and is rank 1 in English, OCR, and Homework.
- Claude Opus 5 (as `claude-opus-5-high`) appears in Chinese, Diagram, Homework, and OCR, but is absent from English's top ranks (present further down) and absent entirely from Captioning and Entity Recognition.
- Muse Spark / Muse Spark 1.1 / Muse Spark 1.2 (xHigh) appear across most categories but never in Captioning or Entity Recognition.
- GPT 5.6 Sol / Terra / Luna variants (as `gpt-5.6-sol-xhigh`, `gpt-5.6-terra-xhigh`, `gpt-5.6-luna-xhigh`) appear in English, Diagram, Homework, and OCR; none appear in Captioning, Entity Recognition, Humor, or Creative Writing.
- Grok 4.5 and Grok 4.6-family variants: `grok-4.5` appears widely; no `grok-4.6` variant string was observed in any of the 9 Vision categories (only `grok-4.20-*`, `grok-4.3`, `grok-4-0709`, `grok-4-1-fast-reasoning` and `grok-4.5` were found).
- Kimi K3 does not appear in any Vision category (only `kimi-k2.x` variants are present in Vision; Kimi K3 was only seen on the Agent board).
- DeepSeek V4 Pro / V4 Flash: not found in any of the 9 Vision categories.
- GLM-5.2 / GLM-5.3: not found in Vision; only `glm-5v-turbo`, `glm-4.5v`, `glm-4.6v` (vision-specific GLM builds) appear.
- Qwen3.8 Max / Qwen3.8 27B / Qwen3.8 2.4T A95B: only `qwen3.8-max` was found (in English, Chinese, Diagram, Homework, OCR, Humor). No `qwen3.8-27b` or `qwen3.8-2.4t-a95b` string was found in any Vision category.
- Captioning and Entity Recognition are structurally different from the other 7 categories: both are dominated by Gemini/GPT/Grok/Mistral and contain zero rows from Anthropic's newest tier (Fable 5, Opus 5, Sonnet 5), Meta's Muse Spark line, Moonshot's Kimi K3, DeepSeek, GLM, or Qwen3.8 — worth flagging since it is a real gap in frontier-model coverage for those two tasks, not a data-collection omission.
