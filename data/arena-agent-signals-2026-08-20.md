# Arena Agent Leaderboard sub-signals, read 20 August 2026
# https://arena.ai/leaderboard/agent  |  board dated Aug 19 2026 | 1,896,814 sessions | 50 models
# Headline metric "Net Improvement". FIVE separately-scored signals underneath it.

## HEADLINE: Net Improvement (win rate %)
1 Claude Opus 5 (High) 12.47 ±1.54
2 Claude Opus 5 (Max) 12.00 ±1.80
3 Claude Fable 5 (High) 11.57 ±1.70
4 Kimi K3 (Max) 10.41 ±0.62
5 GPT 5.6 Sol (xHigh) 9.74 ±1.39
6 Claude Opus 4.8 (High) 9.55 ±1.51
7 GPT 5.5 (xHigh) 8.51 ±0.93
8 Claude Opus 4.7 (High) 8.12 ±1.24
9 GPT 5.5 (High) 7.74 ±0.84
10 Claude Opus 4.7 7.40 ±1.25
11 Claude Sonnet 5 (High) 6.62 ±2.19
TOP-5 GAP 2.73 pts / ~23% relative. USABLE.

## SIGNAL 1: Confirmed Success  (972,358 sessions)
"How often the model gets users to confirm the task is done."
1 Claude Opus 5 (Max) 18.52 | 2 Kimi K3 (Max) 17.97 | 3 Claude Opus 5 (High) 15.41
4 DeepSeek V4 Pro (High) 0813 13.06 | 5 Claude Fable 5 (High) 12.44 | 6 Qwen3.8 Max 11.62
7 GPT 5.6 Sol (xHigh) 10.00 | 8 Gemini 3.7 Flash (High) 9.96 | 9 Claude Opus 4.8 (High) 8.26
10 DeepSeek V4 Flash (High) 20260731 8.09
TOP-5 GAP 6.08 pts. STRONGEST agent signal. Excellent roster coverage.

## SIGNAL 2: Praise vs Complaint  (397,616 sessions)
"How often the model earns more explicitly positive responses than negative ones."
1 GPT 5.6 Sol (xHigh) 22.20 | 2 Claude Opus 4.8 (High) 21.65 | 3 Claude Fable 5 (High) 21.37
4 Claude Opus 5 (High) 20.52 | 5 Claude Opus 5 (Max) 19.13 | 6 Kimi K3 (Max) 18.31
7 Claude Sonnet 5 (High) 14.80 | 8 Claude Opus 4.8 13.68 | 9 GPT 5.5 (xHigh) 13.46
10 Claude Opus 4.7 (High) 12.36
TOP-5 GAP 3.07 pts. MODERATE. Measures user sentiment, distinct from task completion.

## SIGNAL 3: Steerability  (664,613 sessions)
"How well the model lands user corrections when they push back."
1 Claude Opus 5 (High) 11.15 | 2 Claude Opus 4.7 9.32 | 3 GPT 5.5 (High) 9.12
4 Claude Opus 4.8 (High) 9.01 | 5 Claude Fable 5 (High) 8.99 | 6 GPT 5.5 (xHigh) 8.86
7 Claude Opus 4.7 (High) 8.44 | 8 Claude Opus 4.8 8.05 | 9 GPT 5.5 7.93 | 10 Claude Opus 4.6 7.47
TOP-5 GAP 2.16 pts on ~9 base (24% relative). MODERATE. No other source measures this at all.

## SIGNAL 4: Bash Recovery  (674,650 sessions)
"How quickly the model recovers when a command doesn't work."
1 GPT 5.5 (xHigh) 14.67 | 2 Claude Opus 5 (Max) 14.61 | 3 Claude Opus 5 (High) 14.23
4 Claude Fable 5 (High) 13.90 | 5 Claude Opus 4.7 (High) 13.16 | 6 GPT 5.5 (High) 13.09
7 GPT 5.5 11.70 | 8 Grok 4.5 11.45 | 9 GPT 5.6 Luna (xHigh) 11.43 | 10 Claude Sonnet 4.6 11.21
TOP-5 GAP 1.51 pts. WEAK but not tied.

## SIGNAL 5: Tool Hallucination  (2,196,674 sessions)
"How much the model hallucinates tools it doesn't have."
1 GLM 5.2 (Max) 1.14 | 2 Kimi K3 (Max) 1.14 | 3 GPT 5.4 (High) 1.14 | 4 GPT 5.5 (High) 1.14
5 Kimi K2.7 Code 1.14 | 6 GPT 5.6 Luna (xHigh) 1.14 | 7 DeepSeek V4 Pro (High) 0813 1.14
8 Kimi K2.6 1.14 | 9 Grok 4.5 1.14 | 10 GPT 5.5 1.14
*** DEAD METRIC. All ten report the identical 1.14%. Zero separation despite the largest
session count on the board. DO NOT WIRE. Classic saturated-benchmark trap wearing a big number. ***

## BOARD URL MAP (corrected, from footer)
Overall            https://arena.ai/leaderboard
Agent              https://arena.ai/leaderboard/agent
Text               https://arena.ai/leaderboard/text
WebDev             https://arena.ai/leaderboard/code/webdev
Image-to-WebDev    https://arena.ai/leaderboard/code/image-to-webdev
Vision             https://arena.ai/leaderboard/vision
Document           https://arena.ai/leaderboard/document
Search             https://arena.ai/leaderboard/search
