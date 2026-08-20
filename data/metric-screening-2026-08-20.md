# Metric Screening Report: 20 August 2026

Roster: 22 candidate models. Source files: `aa-2026-08-20.md`, `livebench-2026-08-20.md`. Script: `screen_metrics.py`.

CV = population standard deviation / mean (coefficient of variation), computed over roster models with data. Top-5 gap = range of this metric among the 5 roster models with the highest AA Intelligence Index that also have data on this metric (fewer than 5 used if fewer have both). SATURATED = score/percentage-type metric with top-5 gap under 6 points. THIN = coverage under 10/22. OK otherwise.

| source | metric | coverage | min | max | range | cv | top5gap | flag |
|---|---|---|---|---|---|---|---|---|
| AA | AA-LCR | 22/22 | 74.00 | 83.00 | 9.00 | 0.03 | 2.00 | SATURATED |
| AA | APEX-Agents | 5/22 | 32.00 | 41.00 | 9.00 | 0.09 | 9.00 | THIN |
| AA | AnalystAgent | 9/22 | 35.00 | 60.00 | 25.00 | 0.16 | 15.00 | THIN |
| AA | CostPerTask | 22/22 | 0.05 | 3.14 | 3.09 | 0.83 | 1.91 | OK |
| AA | CritPt | 22/22 | 5.00 | 32.00 | 27.00 | 0.30 | 4.00 | SATURATED |
| AA | GDPval | 22/22 | 23.00 | 67.00 | 44.00 | 0.16 | 6.00 | OK |
| AA | GPQA | 22/22 | 89.00 | 95.00 | 6.00 | 0.02 | 1.00 | SATURATED |
| AA | HLE | 22/22 | 34.00 | 55.00 | 21.00 | 0.12 | 6.00 | OK |
| AA | IFBench | 6/22 | 63.00 | 77.00 | 14.00 | 0.06 | 10.00 | THIN |
| AA | ITBench | 6/22 | 30.00 | 56.00 | 26.00 | 0.19 | 16.00 | THIN |
| AA | InputPrice | 22/22 | 0.20 | 10.00 | 9.80 | 0.83 | 5.00 | OK |
| AA | IntelligenceIndex | 22/22 | 48.00 | 63.00 | 15.00 | 0.07 | 2.00 | SATURATED |
| AA | LatencyFirstChunk | 20/22 | 1.17 | 219.33 | 218.16 | 1.27 | 191.20 | OK |
| AA | MMMU-Pro | 14/22 | 76.00 | 85.00 | 9.00 | 0.03 | 4.00 | SATURATED |
| AA | MedianTokS | 20/22 | 39.00 | 365.00 | 326.00 | 0.74 | 17.00 | OK |
| AA | Omni-Accuracy | 22/22 | 16.00 | 65.00 | 49.00 | 0.27 | 6.00 | OK |
| AA | Omni-NonHallucination | 22/22 | 5.00 | 74.00 | 69.00 | 0.57 | 32.00 | OK |
| AA | OmniscienceIndex | 22/22 | -14.00 | 43.00 | 57.00 | 1.00 | 21.00 | OK |
| AA | OutputPrice | 22/22 | 1.20 | 50.00 | 48.80 | 0.96 | 25.00 | OK |
| AA | SciCode | 22/22 | 45.00 | 60.00 | 15.00 | 0.06 | 6.00 | OK |
| AA | TB-Hard | 6/22 | 51.00 | 66.00 | 15.00 | 0.09 | 15.00 | THIN |
| AA | TB-v2.1 | 22/22 | 74.00 | 90.00 | 16.00 | 0.05 | 4.00 | SATURATED |
| AA | TotalResponse | 20/22 | 13.24 | 223.62 | 210.38 | 0.88 | 189.96 | OK |
| AA | tau2-Telecom | 6/22 | 85.00 | 99.00 | 14.00 | 0.07 | 14.00 | THIN |
| AA | tau3-Banking | 22/22 | 21.00 | 51.00 | 30.00 | 0.18 | 7.00 | OK |
| LiveBench | AgenticCoding | 16/22 | 44.10 | 65.20 | 21.10 | 0.11 | 9.00 | OK |
| LiveBench | Coding | 16/22 | 68.60 | 86.00 | 17.40 | 0.05 | 9.20 | OK |
| LiveBench | CostPerSuccessfulTask | 16/22 | 0.04 | 1.44 | 1.40 | 0.98 | 1.23 | OK |
| LiveBench | DataAnalysis | 16/22 | 68.00 | 80.50 | 12.50 | 0.04 | 6.60 | OK |
| LiveBench | InstructionFollowing | 16/22 | 60.10 | 79.90 | 19.80 | 0.08 | 12.00 | OK |
| LiveBench | Language | 16/22 | 72.60 | 90.70 | 18.10 | 0.06 | 7.00 | OK |
| LiveBench | Mathematics | 16/22 | 84.40 | 96.20 | 11.80 | 0.04 | 11.80 | OK |
| LiveBench | Overall | 16/22 | 73.20 | 83.00 | 9.80 | 0.03 | 5.00 | SATURATED |
| LiveBench | Reasoning | 16/22 | 78.60 | 91.70 | 13.10 | 0.04 | 2.00 | SATURATED |

## High correlation pairs (|r| > 0.85, among OK-flagged metrics)

| metric A | metric B | r | n (paired models) |
|---|---|---|---|
| AA:InputPrice | AA:OutputPrice | 0.981 | 22 |
| AA:LatencyFirstChunk | AA:TotalResponse | 0.971 | 20 |
| AA:InputPrice | LiveBench:CostPerSuccessfulTask | 0.955 | 16 |
| AA:OutputPrice | LiveBench:CostPerSuccessfulTask | 0.943 | 16 |
| AA:CostPerTask | LiveBench:CostPerSuccessfulTask | 0.926 | 16 |
| AA:HLE | LiveBench:Language | 0.881 | 16 |
| AA:CostPerTask | AA:InputPrice | 0.857 | 22 |
| AA:HLE | AA:OmniscienceIndex | 0.856 | 22 |

## Unmatched roster models

AA file: none, all 22 matched
LiveBench file: ['Claude Opus 5 (xhigh)', 'Claude Opus 5 (high)', 'GPT-5.6 Sol (xhigh)', 'GLM-5.3 (max)', 'Qwen3.8 2.4T A95B', 'Claude Sonnet 5 (max)']
