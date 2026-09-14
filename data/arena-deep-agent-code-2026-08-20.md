# Arena Deep Data Capture: Agent, WebDev, Image-to-WebDev

Captured 2026-08-20 (site date stamp: Agent/WebDev "Aug 19, 2026", Image-to-WebDev "Aug 4, 2026").
Source: https://arena.ai/leaderboard/agent, https://arena.ai/leaderboard/code/webdev, https://arena.ai/leaderboard/code/image-to-webdev

All values transcribed exactly as rendered by the site (no rounding/estimation). Percent signals show `value / ±CI` where a CI was shown. Elo boards show `score / +CI/-CI`.

IMPORTANT CAVEAT (verified from data, not site documentation): none of the five Agent sub-signal rankings are a simple descending/ascending sort of the displayed percentage. In every signal, the tail ranks (roughly rank 30-50) include raw values that are numerically better (e.g. lower, for Tool Hallucination and Bash Recovery) than many models ranked well above them, and in some signals (Confirmed Success, Praise vs Complaint) tail-rank raw values exceed rank-1's value. The site is evidently ranking by a signed/causal-adjusted coefficient (green "up" = favorable, red "down" = unfavorable) and the plain-text scrape captured magnitude only, not the color/sign glyph. Rank order is transcribed as shown; do not re-derive rank from the raw percentage.

---

## BOARD A: Agent Arena (Overall / Net Improvement), 50 models, 1,896,814 sessions

| Rank | Model | Net Improvement | CI |
|---|---|---|---|
| 1 | Claude Opus 5 (High) | 12.47% | ±1.54% |
| 2 | Claude Opus 5 (Max) | 12.00% | ±1.80% |
| 3 | Claude Fable 5 (High) | 11.57% | ±1.70% |
| 4 | Kimi K3 (Max) | 10.41% | ±0.62% |
| 5 | GPT 5.6 Sol (xHigh) | 9.74% | ±1.39% |
| 6 | Claude Opus 4.8 (High) | 9.55% | ±1.51% |
| 7 | GPT 5.5 (xHigh) | 8.51% | ±0.93% |
| 8 | Claude Opus 4.7 (High) | 8.12% | ±1.24% |
| 9 | GPT 5.5 (High) | 7.74% | ±0.84% |
| 10 | Claude Opus 4.7 | 7.40% | ±1.25% |
| 11 | Claude Sonnet 5 (High) | 6.62% | ±2.19% |
| 12 | Claude Opus 4.6 | 6.60% | ±1.20% |
| 13 | GPT 5.5 | 6.38% | ±0.80% |
| 14 | DeepSeek V4 Pro (High) (0813) | 6.26% | ±1.28% |
| 15 | Qwen3.8 Max | 6.20% | ±1.36% |
| 16 | Grok 4.5 | 6.17% | ±1.16% |
| 17 | GLM 5.2 (Max) | 5.82% | ±0.87% |
| 18 | GPT 5.4 (High) | 4.98% | ±0.80% |
| 19 | GPT 5.6 Luna (xHigh) | 4.04% | ±1.87% |
| 20 | Deepseek V4 Flash (High) (20260731) | 3.99% | ±0.79% |
| 21 | Gemini 3.7 Flash (High) | 3.32% | ±1.02% |
| 22 | GPT 5.6 Terra (xHigh) | 3.19% | ±1.19% |
| 23 | Claude Sonnet 4.6 | 2.88% | ±1.19% |
| 24 | Claude Opus 4.8 | 2.51% | ±2.25% |
| 25 | Muse Spark 1.1 | 0.93% | ±0.61% |
| 26 | Kimi K2.7 Code | 0.43% | ±2.07% |
| 27 | DeepSeek V4 Pro | 0.05% | ±0.88% |
| 28 | GLM 5.1 | 0.00% | ±0.75% |
| 29 | Gemini 3.5 Flash (High) | 0.68% | ±0.61% |
| 30 | Qwen3.7 Max | 0.75% | ±0.85% |
| 31 | Gemini 3.1 Pro Preview | 0.88% | ±0.68% |
| 32 | Kimi K2.6 | 1.10% | ±2.23% |
| 33 | Mimo V2.5 Pro | 2.25% | ±0.88% |
| 34 | Hy3 | 2.38% | ±1.24% |
| 35 | Qwen3.7 Plus | 2.51% | ±1.28% |
| 36 | Gemini 3.6 Flash (High) | 3.04% | ±1.23% |
| 37 | Minimax M3 | 3.15% | ±0.83% |
| 38 | Gemini 3.5 Flash (Medium) | 3.86% | ±1.40% |
| 39 | Inkling Small | 6.82% | ±1.75% |
| 40 | Inkling | 7.19% | ±0.93% |
| 41 | Mistral Medium 3.5 | 7.60% | ±1.88% |
| 42 | Grok 4.3 (High) | 9.02% | ±0.84% |
| 43 | Gemini 3 Flash | 9.13% | ±0.82% |
| 44 | Grok Build 0.1 | 9.48% | ±0.90% |
| 45 | Solar Pro 4 | 10.82% | ±2.39% |
| 46 | Gemini 3.5 Flash Lite | 10.82% | ±1.23% |
| 47 | Minimax M2.7 | 11.86% | ±1.09% |
| 48 | Nemotron 3 Ultra | 15.36% | ±2.34% |
| 49 | Grok 4.3 | 16.45% | ±1.22% |
| 50 | Gemma 4 31B | 19.82% | ±2.57% |

---

## BOARD A: Signal: Confirmed Success (task_outcome_explicit), 50 models, 972,358 sessions

| Rank | Model | % | CI |
|---|---|---|---|
| 1 | Claude Opus 5 (Max) | 18.52% | ±3.24% |
| 2 | Kimi K3 (Max) | 17.97% | ±1.23% |
| 3 | Claude Opus 5 (High) | 15.41% | ±3.16% |
| 4 | DeepSeek V4 Pro (High) (0813) | 13.06% | ±2.65% |
| 5 | Claude Fable 5 (High) | 12.44% | ±3.24% |
| 6 | Qwen3.8 Max | 11.62% | ±3.03% |
| 7 | GPT 5.6 Sol (xHigh) | 10.00% | ±2.87% |
| 8 | Gemini 3.7 Flash (High) | 9.96% | ±2.43% |
| 9 | Claude Opus 4.8 (High) | 8.26% | ±2.70% |
| 10 | Deepseek V4 Flash (High) (20260731) | 8.09% | ±1.89% |
| 11 | Claude Opus 4.8 | 7.78% | ±2.77% |
| 12 | GLM 5.2 (Max) | 7.24% | ±1.87% |
| 13 | Muse Spark 1.1 | 6.58% | ±1.43% |
| 14 | Claude Opus 4.7 (High) | 5.62% | ±2.53% |
| 15 | Grok 4.5 | 5.47% | ±2.57% |
| 16 | Claude Opus 4.7 | 4.99% | ±2.59% |
| 17 | Claude Opus 4.6 | 4.85% | ±2.53% |
| 18 | GPT 5.4 (High) | 4.62% | ±1.76% |
| 19 | GPT 5.5 (xHigh) | 4.42% | ±1.96% |
| 20 | GPT 5.5 (High) | 4.09% | ±1.74% |
| 21 | Kimi K2.7 Code | 3.72% | ±4.42% |
| 22 | GPT 5.5 | 3.34% | ±1.69% |
| 23 | Claude Sonnet 5 (High) | 1.51% | ±4.60% |
| 24 | GLM 5.1 | 0.93% | ±1.69% |
| 25 | Gemini 3.1 Pro Preview | 0.81% | ±1.52% |
| 26 | Gemini 3.5 Flash (High) | 0.11% | ±1.41% |
| 27 | Claude Sonnet 4.6 | 0.65% | ±2.67% |
| 28 | Gemma 4 31B | 1.30% | ±1.80% |
| 29 | Kimi K2.6 | 1.52% | ±4.63% |
| 30 | GPT 5.6 Terra (xHigh) | 1.83% | ±2.92% |
| 31 | Hy3 | 1.87% | ±2.86% |
| 32 | GPT 5.6 Luna (xHigh) | 1.88% | ±4.26% |
| 33 | Qwen3.7 Max | 2.66% | ±2.19% |
| 34 | DeepSeek V4 Pro | 2.66% | ±2.21% |
| 35 | Qwen3.7 Plus | 2.95% | ±3.34% |
| 36 | Mimo V2.5 Pro | 3.33% | ±2.20% |
| 37 | Gemini 3.6 Flash (High) | 3.45% | ±3.09% |
| 38 | Grok Build 0.1 | 5.58% | ±1.77% |
| 39 | Minimax M3 | 6.64% | ±2.23% |
| 40 | Solar Pro 4 | 7.14% | ±5.80% |
| 41 | Gemini 3 Flash | 7.66% | ±1.53% |
| 42 | Gemini 3.5 Flash (Medium) | 8.70% | ±3.48% |
| 43 | Grok 4.3 (High) | 10.45% | ±1.76% |
| 44 | Grok 4.3 | 11.33% | ±1.60% |
| 45 | Mistral Medium 3.5 | 11.54% | ±4.51% |
| 46 | Inkling | 12.21% | ±2.68% |
| 47 | Minimax M2.7 | 12.25% | ±2.57% |
| 48 | Gemini 3.5 Flash Lite | 12.76% | ±2.99% |
| 49 | Nemotron 3 Ultra | 15.26% | ±4.99% |
| 50 | Inkling Small | 17.56% | ±4.91% |

---

## BOARD A: Signal: Praise vs Complaint (praise_complaint), 50 models, 397,616 sessions

| Rank | Model | % | CI |
|---|---|---|---|
| 1 | GPT 5.6 Sol (xHigh) | 22.20% | ±5.11% |
| 2 | Claude Opus 4.8 (High) | 21.65% | ±4.97% |
| 3 | Claude Fable 5 (High) | 21.37% | ±5.95% |
| 4 | Claude Opus 5 (High) | 20.52% | ±5.59% |
| 5 | Claude Opus 5 (Max) | 19.13% | ±6.56% |
| 6 | Kimi K3 (Max) | 18.31% | ±2.23% |
| 7 | Claude Sonnet 5 (High) | 14.80% | ±7.61% |
| 8 | Claude Opus 4.8 | 13.68% | ±4.78% |
| 9 | GPT 5.5 (xHigh) | 13.46% | ±3.23% |
| 10 | Claude Opus 4.7 (High) | 12.36% | ±4.17% |
| 11 | Claude Opus 4.7 | 11.51% | ±4.09% |
| 12 | GPT 5.5 (High) | 11.26% | ±2.94% |
| 13 | GLM 5.2 (Max) | 9.42% | ±2.99% |
| 14 | Claude Opus 4.6 | 8.49% | ±3.90% |
| 15 | GPT 5.5 | 7.80% | ±2.72% |
| 16 | GPT 5.6 Luna (xHigh) | 7.78% | ±6.41% |
| 17 | Qwen3.8 Max | 6.81% | ±4.79% |
| 18 | Grok 4.5 | 5.62% | ±4.11% |
| 19 | DeepSeek V4 Pro (High) (0813) | 3.82% | ±4.37% |
| 20 | GPT 5.4 (High) | 3.08% | ±2.67% |
| 21 | Gemini 3.1 Pro Preview | 2.91% | ±2.08% |
| 22 | Deepseek V4 Flash (High) (20260731) | 2.15% | ±2.64% |
| 23 | GPT 5.6 Terra (xHigh) | 1.77% | ±3.95% |
| 24 | Kimi K2.7 Code | 1.53% | ±6.94% |
| 25 | Kimi K2.6 | 1.52% | ±7.01% |
| 26 | Claude Sonnet 4.6 | 0.99% | ±3.58% |
| 27 | Gemini 3.7 Flash (High) | 0.04% | ±3.35% |
| 28 | GLM 5.1 | 0.28% | ±2.27% |
| 29 | Gemini 3.5 Flash (High) | 0.64% | ±1.88% |
| 30 | Hy3 | 2.12% | ±4.15% |
| 31 | DeepSeek V4 Pro | 2.39% | ±2.82% |
| 32 | Gemma 4 31B | 3.54% | ±2.55% |
| 33 | Gemini 3.6 Flash (High) | 5.12% | ±3.81% |
| 34 | Muse Spark 1.1 | 5.57% | ±1.82% |
| 35 | Qwen3.7 Max | 6.19% | ±2.55% |
| 36 | Gemini 3.5 Flash (Medium) | 6.43% | ±4.03% |
| 37 | Mimo V2.5 Pro | 7.79% | ±2.69% |
| 38 | Minimax M3 | 9.34% | ±2.53% |
| 39 | Qwen3.7 Plus | 10.27% | ±3.81% |
| 40 | Gemini 3 Flash | 10.75% | ±1.75% |
| 41 | Grok Build 0.1 | 10.92% | ±2.20% |
| 42 | Mistral Medium 3.5 | 11.27% | ±5.36% |
| 43 | Grok 4.3 (High) | 13.93% | ±1.84% |
| 44 | Gemini 3.5 Flash Lite | 14.11% | ±3.08% |
| 45 | Inkling Small | 14.84% | ±5.32% |
| 46 | Nemotron 3 Ultra | 15.46% | ±6.09% |
| 47 | Grok 4.3 | 15.99% | ±1.70% |
| 48 | Minimax M2.7 | 16.44% | ±2.84% |
| 49 | Solar Pro 4 | 17.18% | ±6.53% |
| 50 | Inkling | 17.85% | ±2.63% |

---

## BOARD A: Signal: Steerability (steerability), 50 models, 664,613 sessions

| Rank | Model | % | CI |
|---|---|---|---|
| 1 | Claude Opus 5 (High) | 11.15% | ±2.98% |
| 2 | Claude Opus 4.7 | 9.32% | ±2.45% |
| 3 | GPT 5.5 (High) | 9.12% | ±1.56% |
| 4 | Claude Opus 4.8 (High) | 9.01% | ±2.86% |
| 5 | Claude Fable 5 (High) | 8.99% | ±3.55% |
| 6 | GPT 5.5 (xHigh) | 8.86% | ±1.76% |
| 7 | Claude Opus 4.7 (High) | 8.44% | ±2.47% |
| 8 | Claude Opus 4.8 | 8.05% | ±2.79% |
| 9 | GPT 5.5 | 7.93% | ±1.51% |
| 10 | Claude Opus 4.6 | 7.47% | ±2.33% |
| 11 | Grok 4.5 | 7.17% | ±2.19% |
| 12 | Claude Opus 5 (Max) | 6.65% | ±3.66% |
| 13 | GPT 5.4 (High) | 6.55% | ±1.58% |
| 14 | Kimi K3 (Max) | 5.96% | ±1.13% |
| 15 | GPT 5.6 Sol (xHigh) | 5.77% | ±2.88% |
| 16 | GLM 5.2 (Max) | 5.22% | ±1.53% |
| 17 | GPT 5.6 Terra (xHigh) | 5.02% | ±2.39% |
| 18 | Claude Sonnet 5 (High) | 4.63% | ±4.65% |
| 19 | Qwen3.8 Max | 4.00% | ±2.67% |
| 20 | Deepseek V4 Flash (High) (20260731) | 3.45% | ±1.50% |
| 21 | Gemini 3.1 Pro Preview | 3.18% | ±1.20% |
| 22 | Gemini 3.7 Flash (High) | 2.65% | ±2.05% |
| 23 | DeepSeek V4 Pro (High) (0813) | 2.35% | ±2.83% |
| 24 | Claude Sonnet 4.6 | 1.81% | ±2.30% |
| 25 | GPT 5.6 Luna (xHigh) | 1.72% | ±3.79% |
| 26 | GLM 5.1 | 0.97% | ±1.40% |
| 27 | DeepSeek V4 Pro | 0.15% | ±1.66% |
| 28 | Qwen3.7 Max | 0.35% | ±1.51% |
| 29 | Gemini 3.5 Flash (High) | 0.50% | ±1.12% |
| 30 | Kimi K2.6 | 0.62% | ±4.77% |
| 31 | Mimo V2.5 Pro | 1.73% | ±1.61% |
| 32 | Kimi K2.7 Code | 2.59% | ±4.69% |
| 33 | Gemini 3.5 Flash (Medium) | 3.23% | ±2.69% |
| 34 | Muse Spark 1.1 | 3.39% | ±1.16% |
| 35 | Gemini 3.6 Flash (High) | 3.44% | ±2.34% |
| 36 | Gemini 3 Flash | 3.77% | ±1.20% |
| 37 | Qwen3.7 Plus | 5.56% | ±2.66% |
| 38 | Grok 4.3 | 5.70% | ±1.19% |
| 39 | Minimax M3 | 6.16% | ±1.56% |
| 40 | Grok 4.3 (High) | 7.35% | ±1.28% |
| 41 | Gemma 4 31B | 8.37% | ±1.75% |
| 42 | Hy3 | 8.99% | ±2.37% |
| 43 | Grok Build 0.1 | 9.21% | ±1.60% |
| 44 | Mistral Medium 3.5 | 11.20% | ±3.86% |
| 45 | Gemini 3.5 Flash Lite | 11.20% | ±2.34% |
| 46 | Inkling Small | 12.81% | ±4.02% |
| 47 | Inkling | 13.69% | ±1.96% |
| 48 | Minimax M2.7 | 14.31% | ±2.00% |
| 49 | Solar Pro 4 | 16.03% | ±4.85% |
| 50 | Nemotron 3 Ultra | 20.47% | ±4.37% |

---

## BOARD A: Signal: Bash Recovery (bash_recovery_steps), 50 models, 674,650 sessions

| Rank | Model | % | CI |
|---|---|---|---|
| 1 | GPT 5.5 (xHigh) | 14.67% | ±1.20% |
| 2 | Claude Opus 5 (Max) | 14.61% | ±0.90% |
| 3 | Claude Opus 5 (High) | 14.23% | ±0.81% |
| 4 | Claude Fable 5 (High) | 13.90% | ±2.45% |
| 5 | Claude Opus 4.7 (High) | 13.16% | ±1.76% |
| 6 | GPT 5.5 (High) | 13.09% | ±0.93% |
| 7 | GPT 5.5 | 11.70% | ±0.93% |
| 8 | Grok 4.5 | 11.45% | ±1.14% |
| 9 | GPT 5.6 Luna (xHigh) | 11.43% | ±1.47% |
| 10 | Claude Sonnet 4.6 | 11.21% | ±2.26% |
| 11 | Claude Sonnet 5 (High) | 11.14% | ±1.73% |
| 12 | Claude Opus 4.6 | 11.03% | ±1.80% |
| 13 | DeepSeek V4 Pro (High) (0813) | 10.94% | ±0.92% |
| 14 | Inkling Small | 10.73% | ±1.64% |
| 15 | Claude Opus 4.8 | 10.37% | ±1.94% |
| 16 | Claude Opus 4.7 | 10.10% | ±1.98% |
| 17 | GPT 5.6 Terra (xHigh) | 9.87% | ±1.23% |
| 18 | GPT 5.6 Sol (xHigh) | 9.60% | ±1.03% |
| 19 | GPT 5.4 (High) | 9.52% | ±1.06% |
| 20 | Claude Opus 4.8 (High) | 9.22% | ±2.46% |
| 21 | Kimi K3 (Max) | 8.66% | ±0.54% |
| 22 | Qwen3.8 Max | 8.39% | ±1.13% |
| 23 | Inkling | 7.23% | ±1.05% |
| 24 | Qwen3.7 Plus | 6.13% | ±1.71% |
| 25 | GLM 5.2 (Max) | 6.09% | ±1.11% |
| 26 | Muse Spark 1.1 | 5.92% | ±1.12% |
| 27 | Minimax M3 | 5.76% | ±0.85% |
| 28 | Deepseek V4 Flash (High) (20260731) | 5.11% | ±0.64% |
| 29 | DeepSeek V4 Pro | 4.84% | ±0.94% |
| 30 | Qwen3.7 Max | 4.83% | ±1.54% |
| 31 | Gemini 3.7 Flash (High) | 2.93% | ±1.14% |
| 32 | Hy3 | 2.32% | ±1.99% |
| 33 | Mimo V2.5 Pro | 1.54% | ±1.44% |
| 34 | GLM 5.1 | 1.05% | ±1.41% |
| 35 | Gemini 3.5 Flash (Medium) | 1.48% | ±2.47% |
| 36 | Kimi K2.7 Code | 1.63% | ±2.61% |
| 37 | Mistral Medium 3.5 | 1.72% | ±3.07% |
| 38 | Gemini 3.5 Flash (High) | 2.48% | ±1.11% |
| 39 | Gemini 3.6 Flash (High) | 4.31% | ±1.67% |
| 40 | Kimi K2.6 | 6.03% | ±4.46% |
| 41 | Gemini 3.1 Pro Preview | 12.20% | ±1.34% |
| 42 | Solar Pro 4 | 12.78% | ±4.40% |
| 43 | Grok 4.3 (High) | 14.27% | ±2.87% |
| 44 | Gemini 3.5 Flash Lite | 15.86% | ±2.90% |
| 45 | Minimax M2.7 | 17.27% | ±2.93% |
| 46 | Grok Build 0.1 | 22.37% | ±2.78% |
| 47 | Gemini 3 Flash | 22.93% | ±2.43% |
| 48 | Nemotron 3 Ultra | 25.88% | ±6.87% |
| 49 | Grok 4.3 | 50.25% | ±5.43% |
| 50 | Gemma 4 31B | 54.09% | ±10.17% |

---

## BOARD A: Signal: Tool Hallucination (tool_hallucination), 50 models, 2,196,674 sessions

| Rank | Model | % | CI |
|---|---|---|---|
| 1 | GLM 5.2 (Max) | 1.14% | ±0.16% |
| 2 | Kimi K3 (Max) | 1.14% | ±0.16% |
| 3 | GPT 5.4 (High) | 1.14% | ±0.16% |
| 4 | GPT 5.5 (High) | 1.14% | ±0.16% |
| 5 | Kimi K2.7 Code | 1.14% | ±0.16% |
| 6 | GPT 5.6 Luna (xHigh) | 1.14% | ±0.16% |
| 7 | DeepSeek V4 Pro (High) (0813) | 1.14% | ±0.16% |
| 8 | Kimi K2.6 | 1.14% | ±0.16% |
| 9 | Grok 4.5 | 1.14% | ±0.16% |
| 10 | GPT 5.5 | 1.14% | ±0.16% |
| 11 | GPT 5.6 Terra (xHigh) | 1.14% | ±0.16% |
| 12 | GPT 5.6 Sol (xHigh) | 1.14% | ±0.16% |
| 13 | Deepseek V4 Flash (High) (20260731) | 1.14% | ±0.16% |
| 14 | Claude Opus 4.6 | 1.14% | ±0.16% |
| 15 | GPT 5.5 (xHigh) | 1.13% | ±0.16% |
| 16 | Claude Fable 5 (High) | 1.13% | ±0.16% |
| 17 | Gemini 3.6 Flash (High) | 1.11% | ±0.17% |
| 18 | Muse Spark 1.1 | 1.11% | ±0.16% |
| 19 | Claude Opus 5 (Max) | 1.10% | ±0.17% |
| 20 | Gemini 3.7 Flash (High) | 1.10% | ±0.17% |
| 21 | Claude Opus 4.7 | 1.08% | ±0.17% |
| 22 | Claude Sonnet 4.6 | 1.04% | ±0.20% |
| 23 | Claude Opus 5 (High) | 1.04% | ±0.17% |
| 24 | Claude Opus 4.7 (High) | 1.02% | ±0.19% |
| 25 | Grok 4.3 | 1.00% | ±0.17% |
| 26 | Claude Sonnet 5 (High) | 1.00% | ±0.17% |
| 27 | Minimax M2.7 | 0.95% | ±0.20% |
| 28 | Grok 4.3 (High) | 0.90% | ±0.17% |
| 29 | Gemini 3.1 Pro Preview | 0.90% | ±0.26% |
| 30 | Grok Build 0.1 | 0.69% | ±0.17% |
| 31 | Minimax M3 | 0.65% | ±0.29% |
| 32 | Qwen3.7 Max | 0.60% | ±0.23% |
| 33 | Inkling | 0.57% | ±0.22% |
| 34 | Gemini 3.5 Flash (Medium) | 0.54% | ±0.55% |
| 35 | Inkling Small | 0.36% | ±0.48% |
| 36 | DeepSeek V4 Pro | 0.32% | ±0.25% |
| 37 | Nemotron 3 Ultra | 0.28% | ±0.41% |
| 38 | Qwen3.8 Max | 0.18% | ±0.33% |
| 39 | Qwen3.7 Plus | 0.13% | ±0.36% |
| 40 | Gemini 3.5 Flash (High) | 0.12% | ±0.20% |
| 41 | Mimo V2.5 Pro | 0.05% | ±0.31% |
| 42 | Gemini 3.5 Flash Lite | 0.17% | ±0.43% |
| 43 | Claude Opus 4.8 (High) | 0.40% | ±1.58% |
| 44 | Gemini 3 Flash | 0.55% | ±1.66% |
| 45 | GLM 5.1 | 0.59% | ±0.45% |
| 46 | Solar Pro 4 | 0.97% | ±2.93% |
| 47 | Hy3 | 1.25% | ±0.61% |
| 48 | Mistral Medium 3.5 | 2.29% | ±1.69% |
| 49 | Claude Opus 4.8 | 27.34% | ±8.77% |
| 50 | Gemma 4 31B | 31.78% | ±7.04% |

---

## BOARD B: WebDev, 117 models, 596,892 votes

| Rank | Model | Elo | CI |
|---|---|---|---|
| 1 | claude-opus-5-max | 1691 | +9/-9 |
| 2 | kimi-k3-max | 1674 | +11/-11 |
| 3 | qwen3.8-max | 1669 | +13/-13 |
| 4 | claude-opus-5-high | 1662 | +8/-8 |
| 5 | grok-4.6-high | 1629 | +17/-17 |
| 6 | claude-fable-5 | 1626 | +8/-8 |
| 7 | gpt-5.6-sol-xhigh (codex-harness) | 1619 | +8/-8 |
| 8 | glm-5.3-max | 1597 | +16/-16 |
| 9 | gemini-3.7-flash-high | 1588 | +13/-13 |
| 10 | deepseek-v4-pro-high-20260813 | 1582 | +12/-12 |
| 11 | glm-5.2-max | 1582 | +8/-8 |
| 12 | deepseek-v4-flash-high | 1578 | +11/-11 |
| 13 | claude-opus-4-8-high | 1564 | +7/-7 |
| 14 | claude-opus-4-7 | 1558 | +6/-6 |
| 15 | claude-opus-4-7-high | 1557 | +6/-6 |
| 16 | grok-4.5 | 1557 | +9/-9 |
| 17 | claude-opus-4-6-high | 1546 | +6/-6 |
| 18 | claude-sonnet-5-high | 1540 | +8/-8 |
| 19 | claude-opus-4-8 | 1539 | +7/-7 |
| 20 | muse-spark-1.1 | 1539 | +9/-9 |
| 21 | gemini-3.6-flash-high | 1538 | +9/-9 |
| 22 | claude-opus-4-6 | 1537 | +6/-6 |
| 23 | muse-spark-1.2 (xHigh) | 1534 | +14/-14 |
| 24 | claude-sonnet-4-6 | 1523 | +5/-5 |
| 25 | seed-2.1-pro-preview | 1521 | +8/-8 |
| 26 | gpt-5.6-terra-xhigh (codex-harness) | 1520 | +9/-9 |
| 27 | hy3 | 1517 | +13/-13 |
| 28 | qwen3.7-max-20260517 | 1517 | +8/-8 |
| 29 | gpt-5.6-luna-xhigh (codex-harness) | 1517 | +9/-9 |
| 30 | glm-5.1 | 1510 | +7/-7 |
| 31 | kimi-k2.6 | 1509 | +7/-7 |
| 32 | gpt-5.5-xhigh (codex-harness) | 1508 | +6/-6 |
| 33 | gemini-3.5-flash-high | 1499 | +8/-8 |
| 34 | claude-opus-4-5-20251101-high-32k | 1494 | +8/-8 |
| 35 | gemini-3.5-flash-medium | 1490 | +7/-7 |
| 36 | minimax-m3 | 1489 | +7/-7 |
| 37 | gpt-5.5-high (codex-harness) | 1486 | +6/-6 |
| 38 | qwen3.6-max-preview | 1479 | +13/-13 |
| 39 | mimo-v2.5-pro | 1476 | +6/-6 |
| 40 | kimi-k2.7-code | 1473 | +10/-10 |
| 41 | claude-opus-4-5-20251101 | 1468 | +7/-7 |
| 42 | deepseek-v4-pro-high-preview | 1464 | +7/-7 |
| 43 | gpt-5.4-high (codex-harness) | 1463 | +19/-19 |
| 44 | qwen3.6-plus | 1460 | +6/-6 |
| 45 | gpt-5.5 (codex-harness) | 1457 | +6/-6 |
| 46 | gemini-3.5-flash-lite | 1449 | +43/-43 |
| 47 | gemini-3.1-pro-preview | 1447 | +5/-5 |
| 48 | deepseek-v4-pro | 1446 | +7/-7 |
| 49 | gpt-5.4-medium (codex-harness) | 1442 | +19/-19 |
| 50 | gemini-3-flash | 1438 | +9/-9 |
| 51 | mimo-v2.5 | 1438 | +6/-6 |
| 52 | gemini-3-pro | 1438 | +9/-9 |
| 53 | kimi-k2.5-thinking | 1436 | +5/-5 |
| 54 | glm-5 | 1436 | +8/-8 |
| 55 | glm-4.7 | 1434 | +12/-12 |
| 56 | mimo-v2-pro | 1433 | +8/-8 |
| 57 | deepseek-v4-flash-high-preview | 1431 | +7/-7 |
| 58 | gpt-5-medium | 1419 | +16/-16 |
| 59 | gpt-5.2 | 1418 | +23/-23 |
| 60 | gpt-5.3-codex (codex-harness) | 1409 | +14/-14 |
| 61 | inkling | 1406 | +8/-8 |
| 62 | kimi-k2.5-instant | 1405 | +12/-12 |
| 63 | Inkling Small | 1402 | +11/-11 |
| 64 | glm-5v-turbo | 1400 | +14/-14 |
| 65 | qwen3.5-397b-a17b | 1399 | +5/-5 |
| 66 | minimax-m2.7 | 1398 | +6/-6 |
| 67 | gpt-5.4-mini-high | 1397 | +7/-7 |
| 68 | claude-sonnet-4-5-20250929-high-32k | 1392 | +8/-8 |
| 69 | gpt-5.1-medium | 1391 | +12/-12 |
| 70 | gpt-5.4 | 1389 | +15/-15 |
| 71 | claude-opus-4-1-20250805 | 1389 | +11/-11 |
| 72 | minimax-m2.1-preview | 1387 | +10/-10 |
| 73 | claude-sonnet-4-5-20250929 | 1385 | +7/-7 |
| 74 | minimax-m2.5 | 1384 | +8/-8 |
| 75 | gemini-3-flash (thinking-minimal) | 1383 | +5/-5 |
| 76 | grok-4.20-beta-0309-reasoning | 1374 | +6/-6 |
| 77 | solar-pro4 | 1371 | +17/-17 |
| 78 | gpt-5.3-codex (codex-harness) | 1370 | +12/-12 |
| 79 | gemma-4-31b | 1364 | +7/-7 |
| 80 | gemma-4-26b-a4b | 1361 | +17/-17 |
| 81 | deepseek-v3.2-thinking | 1360 | +9/-9 |
| 82 | muse-glimmer | 1359 | +16/-16 |
| 83 | qwen3.5-122b-a10b | 1358 | +8/-8 |
| 84 | qwen3.5-27b | 1357 | +8/-8 |
| 85 | hunyuan-hy3-preview | 1356 | +18/-18 |
| 86 | grok-4.3 | 1356 | +7/-7 |
| 87 | laguna-m.1 | 1347 | +10/-10 |
| 88 | gpt-5.1 | 1341 | +9/-9 |
| 89 | glm-4.6 | 1340 | +11/-11 |
| 90 | gpt-5.2-codex | 1338 | +9/-9 |
| 91 | gpt-5.1-codex | 1336 | +12/-12 |
| 92 | mimo-v2-flash (non-thinking) | 1330 | +10/-10 |
| 93 | claude-haiku-4-5-20251001 | 1327 | +5/-5 |
| 94 | deepseek-v3.2 | 1324 | +8/-8 |
| 95 | kimi-k2-thinking-turbo | 1322 | +7/-7 |
| 96 | laguna-xs.2 | 1302 | +11/-11 |
| 97 | minimax-m2 | 1297 | +11/-11 |
| 98 | mimo-v2-flash (thinking) | 1292 | +17/-17 |
| 99 | qwen3-coder-480b-a35b-instruct | 1273 | +8/-8 |
| 100 | deepseek-v3.2-exp | 1272 | +14/-14 |
| 101 | mistral-medium-3.5 | 1265 | +15/-15 |
| 102 | KAT-Coder-Pro-V1 | 1255 | +20/-20 |
| 103 | gemini-3.1-flash-lite-preview | 1254 | +7/-7 |
| 104 | qwen3.5-35b-a3b | 1250 | +18/-18 |
| 105 | gpt-5.1-codex-mini | 1244 | +22/-22 |
| 106 | grok-4-1-fast-reasoning | 1240 | +11/-11 |
| 107 | trinity-large-thinking | 1238 | +20/-20 |
| 108 | qwen3.5-flash | 1238 | +20/-20 |
| 109 | mistral-large-3 | 1230 | +26/-26 |
| 110 | gemini-2.5-pro | 1225 | +16/-16 |
| 111 | grok-4.1-thinking | 1210 | +25/-25 |
| 112 | devstral-2 | 1193 | +21/-21 |
| 113 | granite-4.1-8b | 1193 | +19/-19 |
| 114 | mercury-2 | 1166 | +25/-25 |
| 115 | grok-code-fast-1 | 1164 | +28/-28 |
| 116 | grok-4-fast-reasoning | 1161 | +28/-28 |
| 117 | devstral-medium-2507 | 1080 | +31/-31 |

---

## BOARD C: Image-to-WebDev, 42 models, 86,653 votes

| Rank | Model | Elo | CI |
|---|---|---|---|
| 1 | claude-opus-5-max | 1670 | +21/-21 |
| 2 | qwen3.8-max | 1631 | +20/-20 |
| 3 | claude-fable-5 | 1626 | +13/-13 |
| 4 | gpt-5.6-sol-xhigh (codex-harness) | 1581 | +22/-22 |
| 5 | grok-4.5 | 1580 | +22/-22 |
| 6 | claude-opus-4-7-high | 1579 | +11/-11 |
| 7 | kimi-k3-max | 1570 | +24/-24 |
| 8 | claude-opus-4-7 | 1565 | +10/-10 |
| 9 | muse-spark-1.1 | 1544 | +22/-22 |
| 10 | claude-opus-4-6-high | 1540 | +10/-10 |
| 11 | claude-sonnet-5-high | 1540 | +12/-12 |
| 12 | claude-opus-4-6 | 1538 | +10/-10 |
| 13 | claude-sonnet-4-6 | 1530 | +10/-10 |
| 14 | gemini-3.6-flash-high | 1529 | +29/-29 |
| 15 | gpt-5.5-xhigh (codex-harness) | 1526 | +11/-11 |
| 16 | gpt-5.6-terra-xhigh (codex-harness) | 1525 | +23/-23 |
| 17 | kimi-k2.6 | 1520 | +12/-12 |
| 18 | kimi-k2.7-code | 1512 | +21/-21 |
| 19 | gpt-5.5-high (codex-harness) | 1511 | +10/-10 |
| 20 | seed-2.1-pro-preview | 1506 | +18/-18 |
| 21 | gpt-5.5 (codex-harness) | 1499 | +10/-10 |
| 22 | gpt-5.6-luna-xhigh (codex-harness) | 1492 | +22/-22 |
| 23 | gemini-3.5-flash-high | 1492 | +21/-21 |
| 24 | gemini-3.5-flash-medium | 1490 | +15/-15 |
| 25 | gemini-3.1-pro-preview | 1481 | +10/-10 |
| 26 | minimax-m3 | 1475 | +14/-14 |
| 27 | qwen3.6-plus | 1470 | +11/-11 |
| 28 | gemini-3-flash | 1455 | +9/-9 |
| 29 | gpt-5.4 | 1449 | +15/-15 |
| 30 | gemini-3-pro | 1448 | +23/-23 |
| 31 | gpt-5.3-codex (codex-harness) | 1446 | +14/-14 |
| 32 | kimi-k2.5-thinking | 1441 | +18/-18 |
| 33 | gemini-3-flash (thinking-minimal) | 1432 | +9/-9 |
| 34 | gemini-3.5-flash-lite | 1426 | +30/-30 |
| 35 | glm-5v-turbo | 1423 | +17/-17 |
| 36 | gpt-5.1-high | 1420 | +22/-22 |
| 37 | kimi-k2.5-instant | 1418 | +22/-22 |
| 38 | grok-4.3 | 1375 | +11/-11 |
| 39 | mistral-large-3 | 1361 | +26/-26 |
| 40 | gpt-5.1 | 1345 | +21/-21 |
| 41 | gemini-3.1-flash-lite-preview | 1336 | +11/-11 |
| 42 | gemini-2.5-pro | 1283 | +22/-22 |

---

## NOTES: Saturation / Tie Analysis

Method: for each board/signal, models ranked, value at rank 1/5/10/last, rank1-rank5 gap (the saturation test), and whether the displayed value repeats across many models (tie check on the exact displayed value, since that is the precision the site exposes).

### Board A signals

| Signal | N | Rank1 | Rank5 | Rank10 | Last (Rank50) | Gap(1-5) | Ties |
|---|---|---|---|---|---|---|---|
| Net Improvement (headline) | 50 | 12.47% | 9.74% | 7.40% | 19.82% | 2.73 pp | 2 pairs (rank24/35 @2.51%; rank45/46 @10.82%) |
| Confirmed Success | 50 | 18.52% | 12.44% | 8.09% | 17.56% | 6.08 pp | 1 pair (rank33/34 @2.66%) |
| Praise vs Complaint | 50 | 22.20% | 19.13% | 12.36% | 17.85% | 3.07 pp | none found at 2-decimal precision |
| Steerability | 50 | 11.15% | 8.99% | 7.47% | 20.47% | 2.16 pp | 2 pairs (rank5/42 @8.99%; rank44/45 @11.20%) |
| Bash Recovery | 50 | 14.67% | 13.16% | 11.21% | 54.09% | 1.51 pp | none found at 2-decimal precision |
| **Tool Hallucination** | 50 | 1.14% | **1.14%** | 1.14% | 31.78% | **0.00 pp** | **14 of 50 models (ranks 1-14) display the identical value 1.14% ±0.16%.** Ranks 15-16 sit at 1.13%, only 0.01 pp lower. |

**Tool Hallucination is confirmed tied all the way down the usable top, worse than the top-10 tie already found.** 28% of the entire 50-model field (14 models) is indistinguishable at the displayed precision, despite carrying the largest session count on the whole site (2,196,674). This signal has effectively zero discriminating power among frontier models and should not be scored.

**Bash Recovery has the tightest rank1-5 gap (1.51 pp) among the four non-degenerate signals**, so the very top of that signal sits close to saturated. Its values stay distinct, with no exact ties of the kind Tool Hallucination shows. Treat it with caution and keep it in the candidate pool.

**Confirmed Success has the widest rank1-5 gap (6.08 pp)** and the cleanest separation at the top, best discriminator of the five sub-signals by this test.

**Critical caveat on all five signals and the headline Net Improvement score:** none of them are a simple sort of the displayed percentage. In every case, tail ranks (~30-50) contain raw values that are numerically better than many higher-ranked models (e.g., Tool Hallucination rank 41 Mimo V2.5 Pro at 0.05% sits below 14 models ranked 1-14 at 1.14%; Confirmed Success rank 50 Inkling Small at 17.56% exceeds rank 1's 18.52% by only a hair despite being dead last). This means the site ranks by a signed/causal-adjusted coefficient (green "up" = favorable, red "down" = unfavorable arrows were visible on-screen) rather than raw magnitude, and the plain-text scrape used here captured magnitude only, not the sign glyph. Treat rank order as authoritative and raw-percentage sorting as unreliable for these signals. This is inferred from the non-monotonic pattern in the data, not confirmed from site documentation (the "Read the methodology" page was not opened).

### Board B: WebDev (117 models)

Rank1 = 1691 (claude-opus-5-max), Rank5 = 1629 (grok-4.6-high), Rank10 = 1582 (deepseek-v4-pro-high-20260813), Last (rank117) = 1080 (devstral-medium-2507).
Gap(1-5) = 62 Elo points, healthy separation, not saturated.
Ties: roughly a dozen exact-integer-score pairs/triples scattered across the full 117-model field (e.g., rank10/11 @1582, rank27-29 @1517, rank50-52 @1438), consistent with normal Elo rounding noise on a large field with wide ± CIs (±6 to ±43), not a saturation artifact like Tool Hallucination's exact-percent ties.

### Board C: Image-to-WebDev (42 models)

Rank1 = 1670 (claude-opus-5-max), Rank5 = 1580 (grok-4.5), Rank10 = 1540 (claude-opus-4-6-high, tied with rank11 claude-sonnet-5-high), Last (rank42) = 1283 (gemini-2.5-pro).
Gap(1-5) = 90 Elo points, the widest top-5 gap of any board/signal captured, best separation at the top of any metric here.
Ties: only 2 pairs across 42 models (rank10/11 @1540; rank22/23 @1492). Clean.

### Distinct model-name strings observed

**Board A (Agent, display names, 50 distinct):** Claude Opus 5 (High); Claude Opus 5 (Max); Claude Fable 5 (High); Kimi K3 (Max); GPT 5.6 Sol (xHigh); Claude Opus 4.8 (High); GPT 5.5 (xHigh); Claude Opus 4.7 (High); GPT 5.5 (High); Claude Opus 4.7; Claude Sonnet 5 (High); Claude Opus 4.6; GPT 5.5; DeepSeek V4 Pro (High) (0813); Qwen3.8 Max; Grok 4.5; GLM 5.2 (Max); GPT 5.4 (High); GPT 5.6 Luna (xHigh); Deepseek V4 Flash (High) (20260731); Gemini 3.7 Flash (High); GPT 5.6 Terra (xHigh); Claude Sonnet 4.6; Claude Opus 4.8; Muse Spark 1.1; Kimi K2.7 Code; DeepSeek V4 Pro; GLM 5.1; Gemini 3.5 Flash (High); Qwen3.7 Max; Gemini 3.1 Pro Preview; Kimi K2.6; Mimo V2.5 Pro; Hy3; Qwen3.7 Plus; Gemini 3.6 Flash (High); Minimax M3; Gemini 3.5 Flash (Medium); Inkling Small; Inkling; Mistral Medium 3.5; Grok 4.3 (High); Gemini 3 Flash; Grok Build 0.1; Solar Pro 4; Gemini 3.5 Flash Lite; Minimax M2.7; Nemotron 3 Ultra; Grok 4.3; Gemma 4 31B.

**Boards B ∪ C (slug names, union, distinct):** claude-opus-5-max; kimi-k3-max; qwen3.8-max; claude-opus-5-high; grok-4.6-high; claude-fable-5; gpt-5.6-sol-xhigh (codex-harness); glm-5.3-max; gemini-3.7-flash-high; deepseek-v4-pro-high-20260813; glm-5.2-max; deepseek-v4-flash-high; claude-opus-4-8-high; claude-opus-4-7; claude-opus-4-7-high; grok-4.5; claude-opus-4-6-high; claude-sonnet-5-high; claude-opus-4-8; muse-spark-1.1; gemini-3.6-flash-high; claude-opus-4-6; muse-spark-1.2 (xHigh); claude-sonnet-4-6; seed-2.1-pro-preview; gpt-5.6-terra-xhigh (codex-harness); hy3; qwen3.7-max-20260517; gpt-5.6-luna-xhigh (codex-harness); glm-5.1; kimi-k2.6; gpt-5.5-xhigh (codex-harness); gemini-3.5-flash-high; claude-opus-4-5-20251101-high-32k; gemini-3.5-flash-medium; minimax-m3; gpt-5.5-high (codex-harness); qwen3.6-max-preview; mimo-v2.5-pro; kimi-k2.7-code; claude-opus-4-5-20251101; deepseek-v4-pro-high-preview; gpt-5.4-high (codex-harness); qwen3.6-plus; gpt-5.5 (codex-harness); gemini-3.5-flash-lite; gemini-3.1-pro-preview; deepseek-v4-pro; gpt-5.4-medium (codex-harness); gemini-3-flash; mimo-v2.5; gemini-3-pro; kimi-k2.5-thinking; glm-5; glm-4.7; mimo-v2-pro; deepseek-v4-flash-high-preview; gpt-5-medium; gpt-5.2; gpt-5.3-codex (codex-harness); inkling; kimi-k2.5-instant; Inkling Small; glm-5v-turbo; qwen3.5-397b-a17b; minimax-m2.7; gpt-5.4-mini-high; claude-sonnet-4-5-20250929-high-32k; gpt-5.1-medium; gpt-5.4; claude-opus-4-1-20250805; minimax-m2.1-preview; claude-sonnet-4-5-20250929; minimax-m2.5; gemini-3-flash (thinking-minimal); grok-4.20-beta-0309-reasoning; solar-pro4; gemma-4-31b; gemma-4-26b-a4b; deepseek-v3.2-thinking; muse-glimmer; qwen3.5-122b-a10b; qwen3.5-27b; hunyuan-hy3-preview; grok-4.3; laguna-m.1; gpt-5.1; glm-4.6; gpt-5.2-codex; gpt-5.1-codex; mimo-v2-flash (non-thinking); claude-haiku-4-5-20251001; deepseek-v3.2; kimi-k2-thinking-turbo; laguna-xs.2; minimax-m2; mimo-v2-flash (thinking); qwen3-coder-480b-a35b-instruct; deepseek-v3.2-exp; mistral-medium-3.5; KAT-Coder-Pro-V1; gemini-3.1-flash-lite-preview; qwen3.5-35b-a3b; gpt-5.1-codex-mini; grok-4-1-fast-reasoning; trinity-large-thinking; qwen3.5-flash; mistral-large-3; gemini-2.5-pro; grok-4.1-thinking; devstral-2; granite-4.1-8b; mercury-2; grok-code-fast-1; grok-4-fast-reasoning; devstral-medium-2507; gpt-5.1-high.

### Access notes

All pages loaded and all "View all" expansions succeeded (Board A's 5 sub-signal dialogs, Board B's 117-model table, Board C's 42-model table). No page failed to expand or load. Board A's per-signal "View all 50 models" buttons required invoking the React onClick handler directly via the fiber props (plain `.click()` and synthetic `MouseEvent` dispatch were silently no-ops on this site's button components); this is a data-access-method note, not a data-quality caveat, all captured values came from the same rendered dialog content a human clicking the button would see.
