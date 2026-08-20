# LiveBench historical releases

Source: https://livebench.ai (single-page app; RELEASE slider control at top of page).
All data below was read directly from the rendered page (leaderboard table text and,
for the two 2025-12-23 / 2026-01-08 releases, the per-category subtask tables reached
by clicking each CATEGORY tab). No API, JSON endpoint, or GitHub raw file was used.

Read date for everything in this file: 20 August 2026.

## Releases the RELEASE control offers

The slider lists 11 releases, oldest to newest:

1. 2024-06-24 (labeled "v1")
2. 2024-07-26
3. 2024-08-31
4. 2024-11-25
5. 2025-04-02
6. 2025-04-25
7. 2025-05-30
8. 2025-11-25
9. 2025-12-23
10. 2026-01-08
11. 2026-06-25 (labeled "latest" - already captured in data/livebench-2026-08-20.md and
    data/livebench-extra-2026-08-20.md; not repeated here)

All 10 non-latest releases were captured below.

Cost per successful task is published for the 2026-06-25 latest release only. Every
other release's page states "Cost data is published for the latest release only" (or,
for 2025-05-30 onward, shows no cost column) and no cost figures were found anywhere
in the rendered page for these 10 releases. Recorded as: cost not published.

Column set changed across releases:
- 2024-06-24 through 2025-04-25 (releases 1-6): 6 categories - Reasoning, Coding,
  Mathematics, Data Analysis, Language, Instruction Following. No Agentic Coding
  category existed yet.
- 2025-05-30 through 2026-06-25 (releases 7-11): 7 categories - the 6 above plus
  Agentic Coding.

---

## Release 2024-06-24 (v1)

Header on page: "17 objective tasks across 6 categories". 41 model rows. Read 20 Aug 2026.

Columns: Model | Overall | Reasoning | Coding | Mathematics | DataAnalysis | Language | InstructionFollowing

```
Claude 3.5 Sonnet | 61.2 | 64.0 | 63.2 | 53.8 | 56.7 | 56.9 | 72.3
GPT-4o | 56.5 | 54.0 | 50.6 | 52.3 | 52.9 | 54.4 | 74.6
ChatGPT-4o | 55.4 | 57.0 | 46.0 | 52.2 | 54.4 | 50.0 | 72.5
Llama 3.1 405B Instruct Turbo [open] | 55.2 | 57.0 | 45.7 | 46.5 | 53.5 | 49.8 | 78.5
Gemini 1.5 Pro Experimental | 55.1 | 56.0 | 42.0 | 56.3 | 50.8 | 49.3 | 75.9
GPT-4o | 55.0 | 55.0 | 46.4 | 49.9 | 52.4 | 53.9 | 72.2
Gemini 1.5 Pro Experimental | 53.6 | 55.0 | 43.4 | 47.5 | 50.2 | 47.0 | 78.8
GPT-4 Turbo | 53.0 | 54.0 | 47.1 | 49.0 | 51.3 | 45.3 | 71.4
Claude 3 Opus | 50.8 | 41.0 | 40.1 | 46.5 | 54.3 | 51.7 | 70.9
Dracarys Llama 3.1 70B Instruct [open] | 49.8 | 50.0 | 36.1 | 45.7 | 48.0 | 41.8 | 77.4
GPT-4 Preview | 49.4 | 48.0 | 44.1 | 42.7 | 54.1 | 43.6 | 63.9
Llama 3.1 70B Instruct Turbo [open] | 48.9 | 43.0 | 33.1 | 45.6 | 50.3 | 42.4 | 79.1
DeepSeek V2.5 [open] | 48.9 | 43.0 | 46.5 | 52.5 | 46.8 | 35.2 | 69.2
Mistral Large [open] | 48.4 | 45.0 | 46.4 | 40.5 | 46.6 | 39.8 | 71.8
Gemini 1.5 Flash Experimental | 47.5 | 52.0 | 39.7 | 36.3 | 47.9 | 31.0 | 78.1
DeepSeek Coder V2 [open] | 46.8 | 49.0 | 41.1 | 52.5 | 38.3 | 33.0 | 67.2
GPT-4 | 44.9 | 31.0 | 37.1 | 36.2 | 44.0 | 49.6 | 71.8
GPT-4o Mini | 44.6 | 37.0 | 43.4 | 41.6 | 44.5 | 35.3 | 65.7
Gemini 1.5 Pro API | 44.4 | 33.0 | 32.8 | 42.4 | 52.8 | 38.3 | 67.2
Dracarys 72B Instruct [open] | 41.7 | 41.0 | 41.1 | 42.8 | 26.2 | 31.2 | 68.1
Gemma 2 27B [open] | 41.2 | 31.0 | 36.7 | 36.2 | 43.6 | 32.4 | 67.4
Gemini 1.5 Flash API | 41.0 | 30.0 | 39.1 | 38.9 | 44.0 | 30.7 | 63.0
Claude 3 Sonnet | 38.1 | 26.0 | 25.2 | 29.6 | 44.6 | 38.1 | 65.0
Gemini 1.5 Flash 8B Experimental | 36.0 | 28.0 | 28.2 | 33.2 | 35.3 | 22.5 | 69.0
Claude 3 Haiku | 35.3 | 26.0 | 24.5 | 25.7 | 41.5 | 30.1 | 64.0
Mixtral 8x22B Instruct [open] | 35.3 | 29.0 | 33.1 | 28.3 | 31.7 | 26.5 | 63.2
Phi-3.5 MoE Instruct [open] | 35.1 | 41.0 | 19.3 | 33.3 | 40.5 | 17.1 | 59.7
GPT-3.5 Turbo | 34.7 | 26.0 | 29.2 | 26.9 | 41.2 | 24.2 | 60.5
Command R Plus | 34.5 | 33.0 | 16.9 | 26.4 | 35.9 | 31.0 | 63.6
Mistral Small | 33.0 | 28.0 | 24.2 | 28.1 | 31.9 | 22.1 | 63.9
Command R Plus | 32.9 | 32.0 | 20.3 | 24.9 | 24.6 | 23.9 | 71.5
Gemma 2 9B [open] | 31.6 | 19.0 | 22.2 | 24.0 | 35.1 | 27.6 | 61.5
Phi-3 Medium 4K Instruct [open] | 31.0 | 35.0 | 20.6 | 31.4 | 31.6 | 13.9 | 53.3
Command R | 30.6 | 26.0 | 17.3 | 26.3 | 31.3 | 17.0 | 65.7
Phi-3 Medium 128K Instruct [open] | 29.9 | 31.0 | 21.6 | 25.6 | 32.1 | 12.8 | 56.2
Phi-3 Small 128K Instruct [open] | 29.7 | 28.0 | 24.9 | 29.0 | 27.3 | 15.5 | 53.5
Phi-3 Small 8K Instruct [open] | 29.1 | 29.0 | 21.2 | 23.7 | 29.6 | 15.1 | 55.8
Open Mistral Nemo [open] | 29.0 | 25.0 | 28.2 | 21.7 | 33.4 | 14.1 | 51.8
Llama 3.1 8B Instruct Turbo [open] | 28.1 | 14.0 | 21.6 | 24.4 | 32.2 | 20.0 | 56.5
Phi-3.5 Mini Instruct [open] | 27.8 | 31.0 | 15.3 | 22.2 | 30.4 | 9.7 | 58.3
Command R | 27.2 | 28.0 | 14.9 | 16.9 | 31.7 | 14.6 | 57.2
Phi-3 Mini 128K Instruct [open] | 24.8 | 24.0 | 14.3 | 17.1 | 34.0 | 7.8 | 51.4
Phi-3 Mini 4K Instruct [open] | 24.4 | 22.0 | 14.8 | 20.8 | 29.5 | 8.1 | 51.3
```

Cost: not published.

---

## Release 2024-07-26

Header: "18 objective tasks across 6 categories". 41 model rows. Read 20 Aug 2026.

Columns: Model | Overall | Reasoning | Coding | Mathematics | DataAnalysis | Language | InstructionFollowing

```
Claude 3.5 Sonnet | 59.9 | 58.7 | 60.8 | 53.8 | 56.7 | 56.9 | 72.3
GPT-4o | 56.7 | 54.7 | 51.4 | 52.3 | 52.9 | 54.4 | 74.6
ChatGPT-4o | 54.7 | 52.0 | 47.2 | 52.2 | 54.4 | 50.0 | 72.5
GPT-4o | 54.6 | 50.0 | 49.4 | 49.9 | 52.4 | 53.9 | 72.2
Llama 3.1 405B Instruct Turbo [open] | 54.3 | 53.3 | 43.8 | 46.5 | 53.5 | 49.8 | 78.5
Gemini 1.5 Pro Experimental | 53.8 | 49.3 | 40.9 | 56.3 | 50.8 | 49.3 | 75.9
GPT-4 Turbo | 52.9 | 51.3 | 49.0 | 49.0 | 51.3 | 45.3 | 71.4
Gemini 1.5 Pro Experimental | 52.2 | 48.7 | 41.2 | 47.5 | 50.2 | 47.0 | 78.8
Claude 3 Opus | 50.6 | 41.3 | 38.6 | 46.5 | 54.3 | 51.7 | 70.9
GPT-4 Preview | 48.9 | 47.3 | 41.8 | 42.7 | 54.1 | 43.6 | 63.9
Dracarys Llama 3.1 70B Instruct [open] | 48.7 | 44.0 | 35.2 | 45.7 | 48.0 | 41.8 | 77.4
Llama 3.1 70B Instruct Turbo [open] | 48.4 | 40.7 | 32.7 | 45.6 | 50.3 | 42.4 | 79.1
DeepSeek V2.5 [open] | 48.1 | 39.3 | 45.5 | 52.5 | 46.8 | 35.2 | 69.2
Mistral Large [open] | 48.0 | 42.0 | 47.1 | 40.5 | 46.6 | 39.8 | 71.8
Gemini 1.5 Flash Experimental | 46.9 | 47.3 | 40.6 | 36.3 | 47.9 | 31.0 | 78.1
DeepSeek Coder V2 [open] | 46.3 | 45.3 | 41.5 | 52.5 | 38.3 | 33.0 | 67.2
GPT-4 | 45.6 | 34.7 | 37.3 | 36.2 | 44.0 | 49.6 | 71.8
Gemini 1.5 Pro API | 44.7 | 35.3 | 32.3 | 42.4 | 52.8 | 38.3 | 67.2
GPT-4o Mini | 44.3 | 35.3 | 43.2 | 41.6 | 44.5 | 35.3 | 65.7
Gemma 2 27B [open] | 41.3 | 32.0 | 35.9 | 36.2 | 43.6 | 32.4 | 67.4
Dracarys 72B Instruct [open] | 41.2 | 40.0 | 38.9 | 42.8 | 26.2 | 31.2 | 68.1
Gemini 1.5 Flash API | 40.0 | 29.3 | 34.3 | 38.9 | 44.0 | 30.7 | 63.0
Claude 3 Sonnet | 38.7 | 28.7 | 26.4 | 29.6 | 44.6 | 38.1 | 65.0
Gemini 1.5 Flash 8B Experimental | 37.0 | 33.3 | 28.7 | 33.2 | 35.3 | 22.5 | 69.0
Claude 3 Haiku | 35.9 | 29.3 | 24.5 | 25.7 | 41.5 | 30.1 | 64.0
Mixtral 8x22B Instruct [open] | 35.2 | 29.3 | 32.0 | 28.3 | 31.7 | 26.5 | 63.2
Phi-3.5 MoE Instruct [open] | 35.2 | 38.7 | 21.7 | 33.3 | 40.5 | 17.1 | 59.7
GPT-3.5 Turbo | 34.5 | 26.7 | 27.7 | 26.9 | 41.2 | 24.2 | 60.5
Command R Plus | 34.5 | 30.7 | 19.5 | 26.4 | 35.9 | 31.0 | 63.6
Mistral Small | 32.2 | 26.0 | 21.2 | 28.1 | 31.9 | 22.1 | 63.9
Command R Plus | 32.2 | 28.7 | 19.5 | 24.9 | 24.6 | 23.9 | 71.5
Gemma 2 9B [open] | 31.3 | 17.3 | 22.5 | 24.0 | 35.1 | 27.6 | 61.5
Phi-3 Medium 4K Instruct [open] | 31.2 | 36.7 | 20.5 | 31.4 | 31.6 | 13.9 | 53.3
Command R | 30.8 | 26.7 | 17.9 | 26.3 | 31.3 | 17.0 | 65.7
Phi-3 Medium 128K Instruct [open] | 30.3 | 34.0 | 21.1 | 25.6 | 32.1 | 12.8 | 56.2
Phi-3 Small 128K Instruct [open] | 30.0 | 30.0 | 24.6 | 29.0 | 27.3 | 15.5 | 53.5
Open Mistral Nemo [open] | 29.2 | 25.3 | 28.7 | 21.7 | 33.4 | 14.1 | 51.8
Phi-3.5 Mini Instruct [open] | 28.3 | 33.3 | 15.9 | 22.2 | 30.4 | 9.7 | 58.3
Llama 3.1 8B Instruct Turbo [open] | 28.0 | 15.3 | 19.7 | 24.4 | 32.2 | 20.0 | 56.5
Phi-3 Small 8K Instruct [open] | 28.0 | 23.3 | 20.3 | 23.7 | 29.6 | 15.1 | 55.8
Command R | 26.8 | 25.3 | 15.3 | 16.9 | 31.7 | 14.6 | 57.2
Phi-3 Mini 128K Instruct [open] | 25.6 | 28.0 | 15.0 | 17.1 | 34.0 | 7.8 | 51.4
Phi-3 Mini 4K Instruct [open] | 25.5 | 28.0 | 15.0 | 20.8 | 29.5 | 8.1 | 51.3
```

Cost: not published.

---

## Release 2024-08-31

Header: "18 objective tasks across 6 categories". 55 model rows. Read 20 Aug 2026.

Columns: Model | Overall | Reasoning | Coding | Mathematics | DataAnalysis | Language | InstructionFollowing

```
o1 Preview | 66.0 | 68.0 | 50.8 | 62.9 | 64.0 | 72.7 | 77.7
Claude 3.5 Sonnet | 60.3 | 58.7 | 67.1 | 51.3 | 52.8 | 58.1 | 74.1
Claude 3.5 Sonnet | 59.8 | 58.7 | 60.8 | 53.3 | 56.7 | 56.9 | 72.3
o1-Mini | 59.1 | 77.3 | 48.1 | 59.2 | 54.1 | 45.7 | 70.2
Step 2 16K | 57.7 | 58.7 | 46.9 | 48.9 | 54.9 | 50.2 | 86.6
Gemini Experimental 1121 | 57.3 | 45.3 | 50.4 | 62.8 | 57.0 | 41.6 | 86.5
Gemini Experimental 1114 | 57.0 | 54.7 | 52.4 | 54.9 | 57.5 | 44.9 | 77.4
GPT-4o | 56.0 | 54.7 | 51.4 | 48.2 | 52.9 | 54.4 | 74.6
Gemini 1.5 Pro | 54.9 | 46.0 | 48.8 | 57.4 | 52.3 | 47.4 | 77.7
ChatGPT-4o | 54.3 | 51.3 | 49.7 | 46.7 | 54.2 | 51.7 | 71.7
GPT-4o | 54.0 | 50.0 | 49.4 | 46.0 | 52.4 | 53.9 | 72.2
Gemini 1.5 Pro Experimental | 53.8 | 49.3 | 40.9 | 56.1 | 50.8 | 49.3 | 75.9
Llama 3.1 405B Instruct Turbo [open] | 53.2 | 53.3 | 43.8 | 40.5 | 53.5 | 49.8 | 78.5
GPT-4o | 52.8 | 53.3 | 46.1 | 42.5 | 47.2 | 53.0 | 74.8
GPT-4 Turbo | 51.8 | 51.3 | 49.0 | 42.7 | 51.3 | 45.3 | 71.4
Dracarys2 72B Instruct [open] | 51.8 | 42.7 | 56.6 | 50.6 | 49.1 | 37.1 | 74.7
Gemini 1.5 Pro Experimental | 51.6 | 48.7 | 41.2 | 43.5 | 50.2 | 47.0 | 78.8
Claude 3 Opus | 50.0 | 41.3 | 38.6 | 43.4 | 54.3 | 51.7 | 70.9
Gemini 1.5 Flash | 49.6 | 50.0 | 41.9 | 47.2 | 44.2 | 29.5 | 84.5
Mistral Large [open] | 48.5 | 42.0 | 47.1 | 43.7 | 46.6 | 39.8 | 71.8
Qwen2.5 Coder 32B Instruct [open] | 48.1 | 47.3 | 56.8 | 45.9 | 43.4 | 27.0 | 68.3
Dracarys2 Llama 3.1 70B Instruct [open] | 47.8 | 47.3 | 36.3 | 38.9 | 46.1 | 41.5 | 76.6
GPT-4 Preview | 47.3 | 47.3 | 41.8 | 33.4 | 54.1 | 43.6 | 63.9
DeepSeek V2.5 [open] | 47.3 | 39.3 | 45.5 | 47.9 | 46.8 | 35.2 | 69.2
Llama 3.1 70B Instruct Turbo [open] | 46.6 | 40.7 | 32.7 | 34.4 | 50.3 | 42.4 | 79.1
Grok 2 | 46.5 | 38.0 | 36.2 | 42.7 | 52.7 | 34.8 | 74.8
Gemini 1.5 Flash Experimental | 45.6 | 47.3 | 40.6 | 28.9 | 47.9 | 31.0 | 78.1
Grok 2 Mini | 45.5 | 42.0 | 37.5 | 40.3 | 44.3 | 39.5 | 69.7
DeepSeek Coder V2 [open] | 45.4 | 45.3 | 41.5 | 47.1 | 38.3 | 33.0 | 67.2
GPT-4 | 45.1 | 34.7 | 37.3 | 33.5 | 44.0 | 49.6 | 71.8
Claude 3.5 Haiku | 44.8 | 29.3 | 51.4 | 35.5 | 42.4 | 38.9 | 71.3
Gemini 1.5 Pro API | 43.8 | 35.3 | 32.3 | 36.9 | 52.8 | 38.3 | 67.2
GPT-4o Mini | 43.3 | 35.3 | 43.2 | 35.6 | 44.5 | 35.3 | 65.7
Llama 3.1 Nemotron 70B Instruct [open] | 43.1 | 48.0 | 32.7 | 37.6 | 39.1 | 31.8 | 69.6
Gemma 2 27B [open] | 39.6 | 32.0 | 35.9 | 26.2 | 43.6 | 32.4 | 67.4
Gemini 1.5 Flash API | 38.9 | 29.3 | 34.3 | 32.3 | 44.0 | 30.7 | 63.0
Claude 3 Sonnet | 37.5 | 28.7 | 26.4 | 22.2 | 44.6 | 38.1 | 65.0
Gemini 1.5 Flash 8B Experimental | 36.1 | 33.3 | 28.7 | 27.8 | 35.3 | 22.5 | 69.0
Qwen2.5 7B Instruct Turbo [open] | 35.7 | 30.7 | 37.9 | 38.2 | 32.8 | 14.8 | 59.8
Claude 3 Haiku | 35.4 | 29.3 | 24.5 | 22.9 | 41.5 | 30.1 | 64.0
Mixtral 8x22B Instruct [open] | 34.5 | 29.3 | 32.0 | 24.6 | 31.7 | 26.5 | 63.2
Phi-3.5 MoE Instruct [open] | 34.1 | 38.7 | 21.7 | 26.8 | 40.5 | 17.1 | 59.7
Command R Plus | 33.3 | 30.7 | 19.5 | 19.3 | 35.9 | 31.0 | 63.6
GPT-3.5 Turbo | 33.2 | 26.7 | 27.7 | 18.9 | 41.2 | 24.2 | 60.5
Command R Plus | 30.8 | 28.7 | 19.5 | 16.8 | 24.6 | 23.9 | 71.5
Gemma 2 9B [open] | 30.6 | 17.3 | 22.5 | 19.5 | 35.1 | 27.6 | 61.5
Mistral Small | 30.6 | 26.0 | 21.2 | 18.5 | 31.9 | 22.1 | 63.9
Command R | 29.7 | 26.7 | 17.9 | 19.5 | 31.3 | 17.0 | 65.7
Phi-3 Medium 4K Instruct [open] | 29.3 | 36.7 | 20.5 | 19.6 | 31.6 | 13.9 | 53.3
Phi-3 Small 128K Instruct [open] | 29.1 | 30.0 | 24.6 | 23.6 | 27.3 | 15.5 | 53.5
Phi-3 Medium 128K Instruct [open] | 29.0 | 34.0 | 21.1 | 17.6 | 32.1 | 12.8 | 56.2
Open Mistral Nemo [open] | 28.4 | 25.3 | 28.7 | 16.9 | 33.4 | 14.1 | 51.8
Phi-3.5 Mini Instruct [open] | 27.4 | 33.3 | 15.9 | 16.8 | 30.4 | 9.7 | 58.3
Phi-3 Small 8K Instruct [open] | 26.9 | 23.3 | 20.3 | 17.2 | 29.6 | 15.1 | 55.8
Llama 3.1 8B Instruct Turbo [open] | 26.7 | 15.3 | 19.7 | 16.6 | 32.2 | 20.0 | 56.5
Command R | 25.9 | 25.3 | 15.3 | 11.5 | 31.7 | 14.6 | 57.2
Phi-3 Mini 128K Instruct [open] | 25.1 | 28.0 | 15.0 | 14.6 | 34.0 | 7.8 | 51.4
Phi-3 Mini 4K Instruct [open] | 24.5 | 28.0 | 15.0 | 15.0 | 29.5 | 8.1 | 51.3
```

Cost: not published.

---

## Release 2024-11-25

Header: "18 objective tasks across 6 categories". 60 model rows. Read 20 Aug 2026.

Columns: Model | Overall | Reasoning | Coding | Mathematics | DataAnalysis | Language | InstructionFollowing

```
Gemini 2.5 Pro Preview | 82.3 | 89.8 | 85.9 | 90.2 | 79.9 | 67.8 | 80.6
Claude 3.7 Sonnet Thinking | 76.1 | 87.8 | 74.5 | 79.0 | 74.1 | 59.9 | 81.3
o3-Mini High | 75.9 | 89.6 | 82.7 | 77.3 | 70.6 | 50.7 | 84.4
o1 High | 75.7 | 91.6 | 69.7 | 80.3 | 65.5 | 65.4 | 81.5
QwQ 32B [open] | 72.0 | 83.5 | 72.2 | 77.8 | 65.0 | 51.4 | 81.8
DeepSeek R1 [open] | 71.6 | 83.2 | 66.7 | 80.7 | 69.8 | 48.5 | 80.5
GPT-4.5 Preview | 69.0 | 71.1 | 75.2 | 69.3 | 64.3 | 61.4 | 72.3
Gemini 2.0 Flash Thinking Experimental | 66.9 | 78.2 | 53.5 | 75.9 | 69.4 | 42.2 | 82.5
DeepSeek V3 0324 [open] | 66.9 | 65.8 | 70.9 | 73.5 | 60.4 | 49.1 | 81.5
Claude 3.7 Sonnet | 65.6 | 66.0 | 67.5 | 63.3 | 63.4 | 56.8 | 76.5
Gemini 2.0 Pro Experimental | 65.1 | 60.1 | 63.5 | 71.0 | 68.0 | 44.8 | 83.4
ChatGPT-4o | 64.8 | 64.9 | 65.0 | 59.5 | 70.5 | 56.7 | 71.9
Gemini Experimental 1206 | 64.1 | 57.0 | 63.4 | 72.4 | 63.2 | 51.3 | 77.3
Qwen2.5 Max | 62.3 | 51.4 | 64.4 | 58.3 | 67.9 | 56.3 | 75.3
Gemini 2.0 Flash | 61.5 | 55.3 | 53.9 | 65.6 | 67.5 | 40.7 | 85.8
Hunyuan Turbos | 60.6 | 53.3 | 46.6 | 62.0 | 75.5 | 50.4 | 76.1
DeepSeek V3 [open] | 60.5 | 56.8 | 61.8 | 60.5 | 60.9 | 47.5 | 75.2
Perplexity Sonar Pro | 60.3 | 52.9 | 60.1 | 55.4 | 59.8 | 69.0 | 64.2
Gemini 2.0 Flash Experimental | 59.3 | 59.1 | 54.4 | 60.4 | 61.7 | 38.2 | 81.9
Claude 3.5 Sonnet | 59.0 | 56.7 | 67.1 | 52.3 | 55.0 | 53.8 | 69.3
ChatGPT-4o | 57.8 | 57.9 | 60.6 | 48.0 | 66.0 | 49.1 | 65.1
o1-Mini | 57.8 | 72.3 | 48.1 | 62.0 | 57.9 | 40.9 | 65.4
Step 2 16K | 56.0 | 52.2 | 47.2 | 48.8 | 63.7 | 44.4 | 79.9
GPT-4o | 55.3 | 53.9 | 51.4 | 49.5 | 60.9 | 47.6 | 68.6
DeepSeek R1 Distill Llama 70B [open] | 54.5 | 67.6 | 51.6 | 58.1 | 55.9 | 23.8 | 69.9
Grok 2 | 54.3 | 54.8 | 46.4 | 54.9 | 54.4 | 45.6 | 69.6
Gemini 2.0 Flash Lite | 54.3 | 44.9 | 47.1 | 58.1 | 65.4 | 33.6 | 76.6
Gemini 2.0 Flash Lite Preview | 53.2 | 50.1 | 43.8 | 55.5 | 57.5 | 34.3 | 78.3
Dracarys2 72B Instruct [open] | 52.6 | 47.4 | 58.9 | 54.7 | 55.5 | 34.1 | 65.2
Llama 3.1 405B Instruct Turbo [open] | 52.4 | 53.3 | 42.7 | 41.1 | 55.8 | 45.5 | 75.9
GPT-4o | 52.2 | 55.8 | 46.1 | 42.9 | 56.2 | 47.4 | 64.9
LearnLM 1.5 Pro Experimental | 52.2 | 43.4 | 46.9 | 57.8 | 55.0 | 42.0 | 68.2
Qwen2.5 72B Instruct Turbo [open] | 51.4 | 45.4 | 57.6 | 54.3 | 51.9 | 35.0 | 64.4
Llama 3.3 70B Instruct Turbo [open] | 50.2 | 50.8 | 36.6 | 42.2 | 49.5 | 39.2 | 82.7
Gemma 3 27B [open] | 50.0 | 43.8 | 39.9 | 55.4 | 51.4 | 34.6 | 74.9
Grok Beta | 49.2 | 37.0 | 45.2 | 45.8 | 54.3 | 43.2 | 69.6
Claude 3 Opus | 49.2 | 40.6 | 38.6 | 43.6 | 57.9 | 50.4 | 63.9
Mistral Large [open] | 48.4 | 43.5 | 47.1 | 42.5 | 50.2 | 39.4 | 67.9
Perplexity Sonar | 46.9 | 46.3 | 35.2 | 41.6 | 37.9 | 44.1 | 76.2
Qwen2.5 Coder 32B Instruct [open] | 46.2 | 42.1 | 56.8 | 46.6 | 49.9 | 23.2 | 58.7
Dracarys2 Llama 3.1 70B Instruct [open] | 46.2 | 44.7 | 36.3 | 40.3 | 54.0 | 38.8 | 63.2
DeepSeek R1 Distill Qwen 32B [open] | 45.5 | 52.3 | 33.7 | 59.4 | 45.4 | 26.8 | 55.7
Llama 3.1 70B Instruct Turbo [open] | 44.9 | 43.0 | 33.5 | 34.7 | 53.8 | 35.4 | 69.0
Mistral Small | 44.0 | 44.8 | 36.2 | 39.4 | 50.5 | 29.1 | 63.7
Nova Pro | 43.5 | 32.6 | 38.2 | 38.0 | 48.3 | 37.0 | 67.1
Claude 3.5 Haiku | 43.5 | 28.1 | 51.4 | 35.5 | 48.5 | 35.4 | 61.9
Mistral Small | 42.5 | 36.4 | 35.3 | 39.9 | 53.7 | 30.5 | 59.5
Phi-4 [open] | 41.6 | 47.8 | 30.7 | 42.0 | 45.2 | 25.6 | 58.4
GPT-4o Mini | 41.3 | 32.8 | 43.2 | 36.3 | 50.0 | 28.6 | 56.8
QwQ 32B Preview [open] | 40.3 | 57.7 | 37.2 | 58.3 | 31.6 | 21.1 | 35.6
Gemma 2 27B [open] | 38.2 | 28.1 | 35.9 | 26.5 | 47.9 | 32.6 | 58.1
Nova Lite | 36.4 | 36.7 | 27.5 | 36.7 | 37.2 | 25.9 | 54.1
Qwen2.5 7B Instruct Turbo [open] | 34.9 | 28.4 | 38.4 | 39.5 | 35.2 | 15.8 | 52.1
AzeroGPT | 34.2 | 25.3 | 31.4 | 32.9 | 34.0 | 22.4 | 59.3
Command R Plus | 31.8 | 24.8 | 19.1 | 21.3 | 38.1 | 29.7 | 57.6
Nova Micro | 29.6 | 25.1 | 20.2 | 34.5 | 33.9 | 15.8 | 48.0
Gemma 2 9B [open] | 28.7 | 15.2 | 22.5 | 19.8 | 36.4 | 25.5 | 52.6
Command R | 27.5 | 21.9 | 17.9 | 19.4 | 33.3 | 16.7 | 55.6
Llama 3.1 8B Instruct Turbo [open] | 26.0 | 13.3 | 18.7 | 18.3 | 32.8 | 17.7 | 54.9
Phi-3 Small 8K Instruct [open] | 24.0 | 15.9 | 20.3 | 17.6 | 30.3 | 12.9 | 47.2
Phi-3 Mini 128K Instruct [open] | 22.4 | 20.5 | 15.0 | 15.7 | 34.7 | 9.2 | 39.1
OLMo 2 13B Instruct [open] | 22.1 | 16.3 | 10.4 | 13.6 | 20.6 | 11.2 | 60.6
Phi-3 Mini 4K Instruct [open] | 22.1 | 26.8 | 15.5 | 15.0 | 30.2 | 8.6 | 36.4
```

Cost: not published.

---

## Release 2025-04-02

Header: "18 objective tasks across 6 categories". 57 model rows. Read 20 Aug 2026.

Columns: Model | Overall | Reasoning | Coding | Mathematics | DataAnalysis | Language | InstructionFollowing

```
o3 High | 81.5 | 93.3 | 73.3 | 84.7 | 75.8 | 76.0 | 86.2
o4-Mini High | 78.1 | 88.1 | 74.3 | 84.9 | 70.4 | 66.1 | 85.0
Gemini 2.5 Pro Preview | 77.4 | 87.5 | 58.1 | 89.2 | 79.9 | 69.3 | 80.6
o1 High | 72.2 | 77.5 | 57.1 | 79.3 | 65.5 | 72.2 | 81.5
o3-Mini High | 71.4 | 74.4 | 65.5 | 76.6 | 70.6 | 56.9 | 84.4
Gemini 2.5 Flash Preview | 71.2 | 73.5 | 58.4 | 81.5 | 75.5 | 59.4 | 79.0
Claude 3.7 Sonnet Thinking | 70.6 | 76.2 | 44.7 | 79.0 | 74.1 | 68.3 | 81.3
Grok 3 Mini Beta (High) | 68.3 | 87.6 | 39.7 | 77.0 | 67.9 | 59.1 | 78.7
DeepSeek R1 [open] | 67.5 | 76.6 | 48.5 | 77.9 | 67.6 | 54.8 | 79.5
QwQ 32B [open] | 65.7 | 76.7 | 43.0 | 76.1 | 65.0 | 51.5 | 81.8
GPT-4.5 Preview | 62.1 | 54.4 | 49.0 | 67.9 | 64.3 | 64.8 | 72.3
Gemini 2.0 Flash Thinking Experimental | 62.0 | 61.5 | 35.7 | 74.8 | 69.4 | 48.4 | 82.5
Gemini 2.0 Pro Experimental | 61.6 | 61.8 | 35.3 | 68.5 | 68.0 | 52.5 | 83.4
GPT-4.1 | 58.4 | 44.4 | 43.0 | 62.4 | 69.1 | 54.6 | 77.0
Claude 3.7 Sonnet | 58.2 | 49.1 | 32.4 | 64.7 | 63.4 | 63.2 | 76.5
DeepSeek V3 0324 [open] | 57.5 | 44.3 | 40.5 | 71.4 | 60.4 | 46.8 | 81.5
Grok 3 Beta | 57.0 | 48.5 | 37.3 | 62.8 | 54.5 | 53.8 | 84.7
ChatGPT-4o | 55.8 | 48.8 | 38.7 | 55.7 | 70.5 | 49.4 | 71.9
GPT-4.1 Mini | 55.5 | 53.8 | 47.6 | 58.8 | 64.9 | 38.0 | 70.3
Qwen2.5 Max | 55.1 | 38.5 | 33.8 | 56.9 | 67.9 | 58.4 | 75.3
Gemini 2.0 Flash | 54.9 | 44.3 | 26.2 | 63.2 | 67.5 | 42.4 | 85.8
DeepSeek R1 Distill Llama 70B [open] | 54.7 | 59.8 | 46.6 | 58.8 | 55.9 | 37.1 | 69.9
Llama 4 Maverick 17B 128E Instruct [open] | 54.4 | 43.8 | 37.4 | 60.6 | 59.0 | 49.6 | 75.7
o1-Mini | 53.4 | 51.3 | 41.0 | 60.3 | 57.9 | 44.7 | 65.4
Hunyuan Turbos | 50.8 | 38.2 | 23.2 | 57.5 | 75.5 | 34.5 | 76.1
Claude 3.5 Sonnet | 50.8 | 43.2 | 32.3 | 50.5 | 55.0 | 54.5 | 69.3
Step 2 16K | 49.9 | 42.4 | 31.1 | 43.7 | 63.7 | 38.4 | 79.9
GPT-4o | 49.2 | 42.6 | 31.8 | 45.7 | 60.9 | 45.6 | 68.6
DeepSeek R1 Distill Qwen 32B [open] | 48.1 | 44.4 | 52.3 | 60.1 | 45.4 | 30.9 | 55.7
Grok 2 | 48.1 | 36.7 | 26.1 | 55.9 | 54.4 | 45.8 | 69.6
Gemini 2.0 Flash Lite | 47.8 | 32.3 | 23.4 | 55.0 | 65.4 | 33.9 | 76.6
Llama 3.1 405B Instruct Turbo [open] | 47.5 | 40.6 | 28.8 | 40.5 | 55.8 | 43.6 | 75.9
LearnLM 1.5 Pro Experimental | 47.5 | 34.9 | 32.4 | 56.7 | 55.0 | 37.9 | 68.2
GPT-4o | 47.0 | 39.8 | 35.2 | 41.5 | 56.2 | 44.7 | 64.9
Gemma 3 27B [open] | 46.6 | 34.4 | 25.4 | 52.3 | 51.4 | 41.3 | 74.9
Llama 3.3 70B Instruct Turbo [open] | 45.7 | 32.5 | 24.0 | 41.4 | 49.5 | 44.0 | 82.7
Claude 3 Opus | 45.6 | 32.0 | 23.3 | 42.9 | 57.9 | 53.6 | 63.9
Command A | 45.3 | 36.3 | 20.4 | 45.5 | 50.1 | 36.7 | 82.9
Dracarys2 72B Instruct [open] | 44.8 | 37.5 | 25.4 | 52.3 | 55.5 | 33.1 | 65.2
Mistral Large [open] | 43.6 | 33.8 | 27.0 | 42.2 | 50.2 | 40.5 | 67.9
Qwen2.5 72B Instruct Turbo [open] | 43.4 | 34.1 | 21.3 | 51.9 | 51.9 | 36.6 | 64.4
Dracarys2 Llama 3.1 70B Instruct [open] | 43.0 | 36.7 | 21.2 | 40.3 | 54.0 | 42.4 | 63.2
Gemma 3 12B [open] | 41.3 | 28.6 | 19.1 | 48.1 | 46.6 | 31.3 | 73.8
Mistral Small | 40.9 | 37.1 | 21.3 | 38.4 | 50.5 | 34.6 | 63.7
Phi-4 [open] | 40.7 | 39.1 | 29.1 | 43.0 | 45.2 | 29.3 | 58.4
Llama 3.1 70B Instruct Turbo [open] | 40.5 | 29.7 | 19.9 | 32.5 | 53.8 | 38.4 | 69.0
Nova Pro | 40.0 | 28.3 | 20.0 | 37.7 | 48.3 | 38.9 | 67.1
GPT-4.1 Nano | 39.7 | 35.6 | 25.3 | 42.4 | 46.6 | 31.0 | 57.5
Claude 3.5 Haiku | 38.5 | 26.2 | 19.9 | 34.8 | 48.5 | 39.7 | 61.9
GPT-4o Mini | 37.6 | 25.6 | 25.5 | 38.0 | 50.0 | 29.9 | 56.8
Gemini 1.5 Flash 8B | 34.4 | 18.7 | 16.5 | 32.2 | 46.3 | 22.9 | 69.7
Nova Lite | 33.5 | 32.0 | 15.2 | 34.6 | 37.2 | 27.6 | 54.1
AzeroGPT | 32.7 | 24.5 | 16.0 | 31.8 | 34.0 | 30.7 | 59.3
Gemma 3 4B [open] | 30.1 | 19.8 | 11.7 | 31.3 | 39.3 | 15.1 | 63.6
Command R Plus | 29.9 | 21.6 | 8.2 | 22.8 | 38.1 | 30.9 | 57.6
Qwen2.5 7B Instruct Turbo [open] | 29.2 | 22.3 | 11.0 | 36.8 | 35.2 | 17.9 | 52.1
Nova Micro | 28.6 | 25.4 | 6.1 | 34.1 | 33.9 | 24.2 | 48.0
Command R | 27.0 | 20.6 | 6.1 | 18.4 | 33.3 | 27.9 | 55.6
Llama 3.1 8B Instruct Turbo [open] | 24.9 | 14.8 | 11.0 | 15.1 | 32.8 | 21.1 | 54.9
```

Cost: not published.

---

## Release 2025-04-25

Header: "17 objective tasks across 6 categories". 53 model rows. Read 20 Aug 2026.

Columns: Model | Overall | Reasoning | Coding | Mathematics | DataAnalysis | Language | InstructionFollowing

Contains the first reasoning-on/off pairs found in this whole survey: Claude 4 Opus
Thinking vs Claude 4 Opus, and Claude 4 Sonnet Thinking vs Claude 4 Sonnet.

```
o3 High | 80.7 | 93.3 | 76.7 | 85.0 | 67.0 | 76.0 | 86.2
Claude 4 Opus Thinking | 79.5 | 90.5 | 73.3 | 88.2 | 70.7 | 73.7 | 80.7
Claude 4 Sonnet Thinking | 79.1 | 95.3 | 73.6 | 85.2 | 69.8 | 70.2 | 80.4
Gemini 2.5 Pro Preview | 79.0 | 88.3 | 72.9 | 88.6 | 68.8 | 71.8 | 83.5
o4-Mini High | 78.7 | 88.1 | 80.0 | 84.9 | 68.3 | 66.1 | 85.0
DeepSeek R1 [open] | 76.8 | 91.1 | 68.1 | 85.3 | 71.5 | 64.8 | 80.0
Gemini 2.5 Pro Preview | 76.7 | 87.5 | 71.1 | 89.2 | 62.5 | 69.3 | 80.6
Claude 3.7 Sonnet Thinking | 74.5 | 76.2 | 73.2 | 79.0 | 69.1 | 68.3 | 81.3
Qwen 3 235B A22B Thinking [open] | 73.5 | 77.9 | 66.4 | 80.2 | 68.3 | 60.6 | 87.7
DeepSeek R1 [open] | 72.7 | 77.2 | 76.1 | 77.9 | 69.6 | 54.8 | 80.5
Qwen 3 32B [open] | 72.7 | 83.1 | 64.2 | 80.1 | 68.3 | 55.2 | 85.2
Claude 4 Opus | 71.5 | 56.4 | 72.9 | 78.8 | 66.5 | 76.1 | 78.4
Grok 3 Mini Beta (High) | 70.3 | 87.6 | 54.5 | 77.0 | 64.6 | 59.1 | 78.7
Gemini 2.5 Flash Preview | 69.9 | 73.5 | 60.3 | 81.8 | 65.5 | 59.4 | 79.0
Claude 4 Sonnet | 69.7 | 54.9 | 77.5 | 76.4 | 64.7 | 67.2 | 77.2
QwQ 32B [open] | 69.5 | 76.7 | 61.4 | 76.1 | 69.5 | 51.5 | 81.8
Qwen 3 14B [open] | 68.2 | 73.6 | 58.2 | 73.5 | 68.2 | 53.1 | 82.3
Qwen 3 30B A3B | 66.9 | 71.3 | 47.5 | 76.6 | 66.6 | 56.2 | 83.2
GPT-4.5 Preview | 65.9 | 54.4 | 76.1 | 67.9 | 60.1 | 64.8 | 72.3
Claude 3.7 Sonnet | 64.6 | 49.1 | 74.3 | 64.7 | 60.0 | 63.2 | 76.5
Grok 3 Beta | 63.2 | 48.5 | 73.6 | 62.8 | 55.6 | 53.8 | 84.7
GPT-4.1 | 63.0 | 44.4 | 73.2 | 62.4 | 66.4 | 54.6 | 77.0
DeepSeek V3 0324 [open] | 62.8 | 44.3 | 68.9 | 71.4 | 64.0 | 46.8 | 81.5
ChatGPT-4o | 61.6 | 48.8 | 77.5 | 55.7 | 66.5 | 49.4 | 71.9
Qwen2.5 Max | 60.0 | 38.5 | 66.8 | 56.9 | 64.3 | 58.4 | 75.3
GPT-4.1 Mini | 59.0 | 53.8 | 72.1 | 58.8 | 61.3 | 38.0 | 70.3
Claude 3.5 Sonnet | 57.9 | 43.2 | 73.9 | 50.5 | 56.2 | 54.5 | 69.3
LearnLM 2.0 Flash Experimental | 57.3 | 39.7 | 64.3 | 61.1 | 51.4 | 43.3 | 83.8
Phi-4 Reasoning Plus [open] | 56.6 | 57.8 | 60.6 | 62.8 | 54.7 | 30.7 | 73.2
Mistral Medium 3 | 56.6 | 42.0 | 61.5 | 59.7 | 60.2 | 44.7 | 71.4
DeepSeek R1 Distill Llama 70B [open] | 55.5 | 59.8 | 46.6 | 58.8 | 60.8 | 37.1 | 69.9
Llama 4 Maverick 17B 128E Instruct [open] | 55.2 | 43.8 | 54.2 | 60.6 | 47.1 | 49.6 | 75.7
Step 2 16K | 54.0 | 42.4 | 57.6 | 43.7 | 62.3 | 38.4 | 79.9
GPT-4o | 54.0 | 39.8 | 69.3 | 41.5 | 63.5 | 44.7 | 64.9
Gemini 2.0 Flash Lite | 53.8 | 32.3 | 59.3 | 55.0 | 65.4 | 33.9 | 76.6
Hunyuan Turbos | 50.8 | 38.2 | 50.4 | 57.5 | 48.0 | 34.5 | 76.1
Mistral Large [open] | 50.3 | 33.8 | 62.9 | 42.2 | 54.2 | 40.5 | 67.9
LearnLM 1.5 Pro Experimental | 49.3 | 34.9 | 58.9 | 56.7 | 39.3 | 37.9 | 68.2
Dracarys2 72B Instruct [open] | 49.2 | 37.5 | 58.7 | 52.3 | 48.5 | 33.1 | 65.2
Qwen2.5 72B Instruct Turbo [open] | 49.0 | 34.1 | 57.3 | 51.9 | 50.2 | 36.5 | 64.4
Llama 3.3 70B Instruct Turbo [open] | 48.9 | 32.5 | 51.8 | 41.4 | 40.8 | 44.0 | 82.7
Gemma 3 27B [open] | 48.4 | 34.4 | 48.9 | 52.3 | 38.8 | 41.3 | 74.9
DeepSeek R1 Distill Qwen 32B [open] | 47.5 | 44.4 | 47.0 | 60.1 | 46.9 | 30.9 | 55.7
GPT-4.1 Nano | 46.6 | 35.6 | 63.2 | 42.4 | 49.8 | 31.0 | 57.5
Dracarys2 Llama 3.1 70B Instruct [open] | 46.5 | 36.7 | 41.1 | 40.3 | 55.1 | 42.4 | 63.2
Mistral Small | 45.9 | 37.1 | 49.6 | 38.4 | 52.1 | 34.6 | 63.7
Claude 3.5 Haiku | 45.0 | 26.2 | 53.2 | 34.8 | 54.1 | 39.7 | 61.9
Nova Pro | 44.3 | 28.3 | 49.6 | 37.7 | 44.3 | 38.9 | 67.1
GPT-4o Mini | 43.4 | 25.6 | 55.0 | 38.0 | 55.1 | 29.9 | 56.8
Nova Lite | 39.1 | 32.0 | 45.0 | 34.6 | 41.2 | 27.6 | 54.1
Command R Plus | 34.9 | 21.6 | 27.1 | 22.8 | 49.2 | 30.9 | 57.6
Qwen2.5 7B Instruct Turbo [open] | 34.4 | 22.3 | 34.3 | 36.8 | 42.3 | 18.4 | 52.1
Nova Micro | 33.7 | 25.4 | 28.9 | 34.1 | 41.3 | 24.2 | 48.0
Command R | 31.4 | 20.6 | 26.1 | 18.4 | 39.8 | 27.9 | 55.6
```

Cost: not published.

---

## Release 2025-05-30

Header: "20 objective tasks across 7 categories". 56 model rows visible in the default
leaderboard table (DOM row count confirmed via JS: `document.querySelectorAll('table
tbody tr, table tr.row, tbody tr').length` = 56, so no scroll-triggered lazy loading
was missed). Read 20 Aug 2026.

Note on completeness: the "category profile" compare tool's "Add model" dropdown for
this release lists more names than the 56-row table shows (about 67 total, including
low/minimal reasoning-effort tiers of GPT-5, GPT-5 Mini, GPT-5 Nano, and Gemini 3 Pro
Preview that the default table collapses out). Searching the model-search box for an
exact name surfaces the missing row with full category scores; three effort-tier rows
for Claude 4.5 Opus were pulled this way and are listed after the main table below.
Not every hidden row was pulled (would require ~10 more individual searches); this is
flagged rather than silently treated as complete.

This release contains the first large batch of reasoning-on/off pairs: Claude Sonnet
4.5 Thinking/Claude Sonnet 4.5, Claude 4.1 Opus Thinking/Claude 4.1 Opus, Claude 4
Sonnet Thinking/Claude 4 Sonnet, Claude Haiku 4.5 Thinking/Claude Haiku 4.5, DeepSeek
V3.2 Exp Thinking/DeepSeek V3.2 Exp, Kimi K2 Thinking/Kimi K2 Instruct, Qwen 3 235B
A22B Thinking 2507/Instruct 2507, Qwen 3 Next 80B A3B Thinking/Instruct, Grok 4.1
Fast/Grok 4.1 Fast (Non-Reasoning), Grok 4 Fast/Grok 4 Fast (Non-Reasoning), GPT-5.1
High/GPT-5.1 No Thinking.

Columns: Model | Overall | Reasoning | Coding | AgenticCoding | Mathematics | DataAnalysis | Language | InstructionFollowing

```
Gemini 3 Pro Preview High | 79.7 | 98.8 | 74.6 | 45.0 | 95.0 | 74.9 | 83.8 | 85.9
GPT-5 High | 79.3 | 98.2 | 77.1 | 46.7 | 92.8 | 71.6 | 80.8 | 88.1
GPT-5.1 High | 78.8 | 95.8 | 72.5 | 43.3 | 94.5 | 72.1 | 80.1 | 93.3
GPT-5 Pro | 78.7 | 96.7 | 72.1 | 43.3 | 93.8 | 72.4 | 81.4 | 91.4
Claude Sonnet 4.5 Thinking | 78.3 | 95.3 | 80.4 | 50.0 | 93.0 | 71.8 | 77.5 | 80.0
GPT-5 Codex | 78.2 | 98.7 | 69.6 | 48.3 | 92.7 | 70.3 | 79.3 | 88.7
Claude 4.5 Opus Medium Effort | 75.6 | 72.3 | 78.5 | 63.3 | 87.5 | 67.2 | 79.2 | 81.2
GPT-5 Mini High | 75.3 | 91.4 | 68.2 | 43.3 | 90.7 | 72.0 | 75.6 | 85.9
Claude 4.1 Opus Thinking | 75.3 | 93.2 | 74.7 | 45.0 | 91.2 | 71.1 | 71.2 | 80.4
GPT-5.1 Codex | 75.1 | 98.0 | 71.8 | 43.3 | 87.9 | 68.8 | 70.6 | 85.3
Claude 4 Sonnet Thinking | 73.8 | 95.3 | 77.5 | 38.3 | 85.2 | 69.8 | 70.2 | 80.4
Grok 4 | 72.8 | 97.8 | 73.1 | 26.7 | 88.8 | 69.5 | 75.8 | 78.1
Gemini 2.5 Pro (Max Thinking) | 71.9 | 94.3 | 75.7 | 25.0 | 84.2 | 71.5 | 75.4 | 77.4
DeepSeek V3.2 Exp Thinking [open] | 71.6 | 88.7 | 70.1 | 26.7 | 89.1 | 72.8 | 71.1 | 83.0
Kimi K2 Thinking [open] | 71.6 | 87.7 | 68.2 | 35.0 | 88.5 | 69.1 | 61.9 | 90.6
DeepSeek V3.1 Terminus Thinking [open] | 71.4 | 85.6 | 71.4 | 30.0 | 89.3 | 71.8 | 69.5 | 82.3
Claude Haiku 4.5 Thinking | 71.4 | 92.2 | 72.8 | 36.7 | 87.4 | 69.3 | 63.3 | 78.0
GLM 4.6 [open] | 71.2 | 92.2 | 71.0 | 35.0 | 90.1 | 71.7 | 56.8 | 81.7
Claude Sonnet 4.5 | 70.6 | 63.1 | 76.1 | 50.0 | 82.2 | 67.3 | 76.2 | 79.1
GPT-5.1 Codex Mini | 70.5 | 89.8 | 69.9 | 35.0 | 87.0 | 70.3 | 61.4 | 80.2
Grok 4 Fast | 70.1 | 96.2 | 69.0 | 21.7 | 87.3 | 68.9 | 75.1 | 72.5
Grok 4.1 Fast | 69.9 | 96.2 | 69.6 | 30.0 | 82.1 | 63.4 | 74.5 | 73.2
Qwen 3 Max | 69.9 | 89.0 | 71.8 | 31.7 | 83.2 | 65.4 | 71.4 | 76.5
DeepSeek R1 [open] | 69.4 | 91.1 | 73.2 | 20.0 | 85.3 | 71.5 | 64.8 | 80.0
Qwen 3 235B A22B Thinking 2507 [open] | 69.1 | 91.6 | 69.0 | 6.7 | 81.1 | 74.7 | 70.9 | 90.0
Claude 3.7 Sonnet Thinking | 68.6 | 76.2 | 75.0 | 31.7 | 79.0 | 69.1 | 68.3 | 81.3
Gemini 2.5 Flash (Max Thinking) | 68.2 | 82.5 | 67.5 | 20.0 | 88.9 | 72.7 | 63.5 | 82.3
Claude 4.1 Opus | 67.8 | 56.8 | 76.1 | 36.7 | 82.5 | 67.0 | 75.6 | 79.8
DeepSeek V3.2 Exp [open] | 66.6 | 66.6 | 73.2 | 35.0 | 80.8 | 65.1 | 62.7 | 83.1
Qwen 3 Next 80B A3B Instruct [open] | 66.3 | 88.2 | 68.2 | 10.0 | 80.7 | 68.6 | 68.2 | 80.2
Claude 4 Sonnet | 65.4 | 54.9 | 80.7 | 36.7 | 76.4 | 64.7 | 67.2 | 77.2
Qwen 3 235B A22B Instruct 2507 [open] | 65.2 | 86.9 | 69.6 | 13.3 | 79.2 | 65.2 | 66.3 | 75.7
GLM 4.5 [open] | 65.0 | 69.6 | 62.1 | 31.7 | 82.1 | 66.3 | 61.6 | 81.6
DeepSeek V3.1 Terminus [open] | 64.7 | 64.6 | 69.6 | 25.0 | 80.7 | 67.3 | 63.9 | 81.9
Qwen 3 Next 80B A3B Thinking [open] | 64.6 | 91.3 | 60.7 | 5.0 | 82.4 | 73.2 | 54.5 | 85.1
Gemini 2.5 Flash (Max Thinking) | 64.3 | 78.9 | 66.0 | 15.0 | 82.8 | 69.7 | 57.9 | 80.2
Minimax M2 [open] | 64.3 | 88.2 | 57.8 | 21.7 | 86.0 | 67.6 | 47.6 | 81.0
Kimi K2 Instruct [open] | 63.8 | 63.0 | 74.3 | 25.0 | 74.4 | 63.4 | 63.9 | 82.5
Qwen 3 235B A22B Thinking [open] | 63.4 | 77.9 | 67.5 | 1.7 | 80.2 | 68.3 | 60.6 | 87.7
Qwen 3 32B [open] | 62.8 | 83.1 | 66.0 | 1.7 | 80.1 | 68.3 | 55.2 | 85.2
Qwen 3 Coder 480B A35B Instruct [open] | 61.7 | 54.6 | 75.0 | 31.7 | 67.3 | 64.7 | 64.3 | 74.2
GPT-5 Chat | 61.0 | 63.1 | 78.6 | 11.7 | 73.5 | 64.5 | 63.0 | 73.0
GLM 4.5 Air [open] | 60.5 | 78.3 | 60.3 | 16.7 | 79.4 | 66.0 | 44.3 | 78.8
Claude Haiku 4.5 | 60.4 | 54.8 | 72.2 | 28.3 | 74.4 | 66.2 | 53.6 | 73.4
Claude 3.7 Sonnet | 60.4 | 49.1 | 76.1 | 33.3 | 64.7 | 60.0 | 63.2 | 76.5
Grok Code Fast | 59.4 | 66.9 | 64.4 | 30.0 | 69.9 | 69.0 | 43.7 | 71.7
GPT-5 Nano | 59.0 | 64.1 | 67.4 | 23.3 | 71.7 | 65.7 | 46.1 | 74.6
GPT-5.1 No Thinking | 58.8 | 48.1 | 77.5 | 26.7 | 60.4 | 64.1 | 51.9 | 82.7
Gemini 2.5 Flash Lite (Max Thinking) | 58.5 | 64.3 | 65.4 | 1.7 | 77.3 | 67.6 | 50.7 | 82.2
Gemini 2.5 Flash Lite (Max Thinking) | 58.4 | 65.7 | 66.4 | 5.0 | 75.9 | 67.3 | 47.9 | 80.7
Qwen 3 30B A3B | 57.8 | 71.3 | 48.9 | 1.7 | 76.6 | 66.6 | 56.2 | 83.2
GPT OSS 120b [open] | 55.6 | 77.6 | 60.2 | 15.0 | 69.9 | 56.8 | 43.1 | 66.3
Mistral Medium 3 | 50.3 | 42.0 | 64.0 | 10.0 | 59.7 | 60.2 | 44.7 | 71.4
Grok 4.1 Fast (Non-Reasoning) | 47.0 | 39.1 | 56.1 | 10.0 | 41.9 | 58.7 | 54.0 | 69.4
Grok 4 Fast (Non-Reasoning) | 46.1 | 37.8 | 58.5 | 8.3 | 47.7 | 61.0 | 42.3 | 66.8
Command A | 44.1 | 36.3 | 55.3 | 3.3 | 45.5 | 48.5 | 36.7 | 82.9
```

Additional rows found by searching the model-search box (not in the default 56-row
table but present in the underlying data, full 7-category scores confirmed):

```
Claude 4.5 Opus High Effort | 74.3 | 69.0 | 77.8 | 61.7 | 89.2 | 67.4 | 75.8 | 79.0
Claude 4.5 Opus Low Effort | 71.6 | 64.7 | 78.2 | 50.0 | 86.1 | 65.4 | 76.2 | 80.9
GPT-5 Minimal | 57.9 | 54.9 | 72.6 | 26.7 | 59.0 | 64.4 | 51.0 | 76.9
```

Note the non-monotonic effort result for Claude 4.5 Opus in this release: Medium
Effort (75.6) scores higher overall than High Effort (74.3), which in turn scores
higher than Low Effort (71.6). Recorded as observed, not inferred as a trend.

Cost: not published (release page has no cost column and no Insights cost view).

---

## Release 2025-11-25

Header: "20 objective tasks across 7 categories". 46 model rows in the default table.
Read 20 Aug 2026.

More reasoning-on/off pairs confirmed here: Claude Sonnet 4.5 Thinking/Claude Sonnet
4.5, Claude 4.1 Opus Thinking/Claude 4.1 Opus, Claude 4 Sonnet Thinking/Claude 4
Sonnet, Claude Haiku 4.5 Thinking/Claude Haiku 4.5, DeepSeek V3.2 Thinking/DeepSeek
V3.2, DeepSeek V3.2 Exp Thinking/DeepSeek V3.2 Exp, Kimi K2 Thinking/Kimi K2 Instruct,
Qwen 3 235B A22B Thinking 2507/Instruct 2507, Qwen 3 Next 80B A3B Thinking/Instruct,
GPT-5.2 High/GPT-5.2 No Thinking, GPT-5.1 High/GPT-5.1 No Thinking, Grok 4.1
Fast/Grok 4.1 Fast (Non-Reasoning).

Effort-tier note: the main table carries only "Claude 4.5 Opus Thinking High Effort"
(76.8) and "Claude 4.5 Opus Medium Effort" (64.8), but the category-profile "Add
model" dropdown for this release additionally lists (not pulled into full row form):
Claude 4.5 Opus Thinking Medium Effort (74.9), Claude 4.5 Opus Thinking Low Effort
(69.1), Claude 4.5 Opus High Effort (64.2), Claude 4.5 Opus Low Effort (61.4) - i.e. a
6-way Thinking x{High,Medium,Low} / non-Thinking x{High,Medium,Low} matrix already
exists for this model in this release, overall-score only for four of the six cells.

Columns: Model | Overall | Reasoning | Coding | AgenticCoding | Mathematics | DataAnalysis | Language | InstructionFollowing

```
Claude 4.5 Opus Thinking High Effort | 76.8 | 84.1 | 79.7 | 63.3 | 94.5 | 72.0 | 81.3 | 62.5
GPT-5.1 Codex Max | 76.6 | 91.4 | 81.4 | 56.7 | 92.9 | 71.4 | 75.4 | 67.1
Gemini 3 Pro Preview High | 75.6 | 79.9 | 74.6 | 55.0 | 94.1 | 74.9 | 84.6 | 65.8
GPT-5 Pro | 74.7 | 87.6 | 72.1 | 51.7 | 94.2 | 72.4 | 80.7 | 64.0
GPT-5.2 High | 74.6 | 86.3 | 76.1 | 51.7 | 93.6 | 72.8 | 79.8 | 61.8
GPT-5.1 High | 74.0 | 83.1 | 72.5 | 53.3 | 93.5 | 72.1 | 79.3 | 63.9
Gemini 3 Flash Preview High | 73.9 | 75.4 | 73.9 | 40.0 | 93.6 | 74.7 | 84.6 | 74.9
Claude Sonnet 4.5 Thinking | 72.3 | 80.8 | 80.4 | 53.3 | 90.1 | 71.8 | 76.5 | 53.4
GPT-5.1 Codex | 72.3 | 88.0 | 71.8 | 53.3 | 91.1 | 68.8 | 69.5 | 63.4
GPT-5 Mini High | 69.8 | 70.4 | 68.2 | 46.7 | 90.6 | 72.0 | 75.5 | 65.3
Claude 4.1 Opus Thinking | 67.3 | 73.1 | 74.7 | 48.3 | 88.9 | 71.1 | 72.8 | 42.4
DeepSeek V3.2 Thinking [open] | 66.8 | 81.6 | 64.6 | 40.0 | 92.4 | 70.8 | 70.4 | 48.2
Kimi K2 Thinking [open] | 65.8 | 65.3 | 67.4 | 38.3 | 90.8 | 70.6 | 66.5 | 62.0
GPT-5.1 Codex Mini | 65.7 | 66.9 | 69.9 | 40.0 | 91.0 | 70.3 | 63.0 | 59.0
Claude 4 Sonnet Thinking | 65.7 | 70.0 | 77.5 | 40.0 | 85.0 | 69.8 | 72.9 | 44.3
Claude Haiku 4.5 Thinking | 65.0 | 64.2 | 72.8 | 41.7 | 90.7 | 69.3 | 66.5 | 49.8
Claude 4.5 Opus Medium Effort | 64.8 | 51.6 | 78.5 | 63.3 | 86.1 | 67.2 | 78.7 | 28.1
DeepSeek V3.2 Speciale [open] | 64.0 | 81.4 | 68.2 | 8.3 | 92.5 | 73.1 | 74.5 | 50.3
Grok 4 | 64.0 | 80.8 | 73.1 | 30.0 | 89.0 | 69.5 | 76.4 | 29.1
Gemini 2.5 Pro (Max Thinking) | 63.4 | 71.7 | 75.7 | 33.3 | 83.1 | 71.5 | 75.5 | 33.1
Grok 4.1 Fast | 63.0 | 83.6 | 69.6 | 31.7 | 90.0 | 63.4 | 74.3 | 28.2
DeepSeek V3.2 Exp Thinking [open] | 62.8 | 62.5 | 70.1 | 31.7 | 90.2 | 72.8 | 71.1 | 41.3
Claude 4.1 Opus | 60.0 | 40.5 | 76.1 | 53.3 | 80.4 | 67.0 | 76.8 | 25.9
Claude Sonnet 4.5 | 59.7 | 45.7 | 76.1 | 48.3 | 80.8 | 67.3 | 76.0 | 23.5
GLM 4.6 [open] | 59.6 | 62.8 | 71.0 | 35.0 | 91.5 | 71.7 | 59.0 | 26.2
Qwen 3 235B A22B Thinking 2507 [open] | 57.7 | 59.2 | 69.0 | 6.7 | 84.5 | 74.7 | 69.5 | 40.6
DeepSeek V3.2 [open] | 57.6 | 45.0 | 75.7 | 46.7 | 81.9 | 66.7 | 64.2 | 23.1
Claude 4 Sonnet | 57.1 | 43.6 | 80.7 | 38.3 | 78.5 | 64.7 | 71.0 | 22.7
Gemini 2.5 Flash (Max Thinking) | 56.4 | 48.6 | 67.5 | 23.3 | 89.8 | 72.7 | 65.3 | 27.7
DeepSeek V3.2 Exp [open] | 55.5 | 47.3 | 73.2 | 36.7 | 81.5 | 65.1 | 65.6 | 19.3
GPT-5 Nano | 55.0 | 44.6 | 67.4 | 28.3 | 78.9 | 65.7 | 47.7 | 52.0
Qwen 3 Next 80B A3B Thinking [open] | 54.9 | 58.2 | 60.7 | 8.3 | 86.3 | 73.2 | 56.3 | 41.5
Qwen 3 235B A22B Instruct 2507 [open] | 53.9 | 57.2 | 69.6 | 13.3 | 83.7 | 65.2 | 66.1 | 21.7
GPT-5.2 No Thinking | 53.8 | 39.1 | 76.5 | 40.0 | 75.3 | 68.8 | 50.0 | 27.2
Gemini 2.5 Flash (Max Thinking) | 53.8 | 48.9 | 66.0 | 16.7 | 84.7 | 69.7 | 62.3 | 28.5
Kimi K2 Instruct [open] | 53.8 | 45.0 | 74.3 | 31.7 | 75.2 | 63.4 | 66.7 | 20.4
Qwen 3 Next 80B A3B Instruct [open] | 53.3 | 55.7 | 68.2 | 10.0 | 84.9 | 68.6 | 66.3 | 19.2
GPT OSS 120b [open] | 51.9 | 49.6 | 60.2 | 16.7 | 81.2 | 56.8 | 48.6 | 50.3
Claude Haiku 4.5 | 51.7 | 39.3 | 72.2 | 33.3 | 76.0 | 66.2 | 57.0 | 17.8
Grok Code Fast | 50.3 | 42.4 | 64.4 | 33.3 | 72.0 | 69.0 | 48.6 | 22.3
Qwen 3 32B [open] | 49.6 | 54.3 | 66.0 | 3.3 | 81.6 | 68.3 | 55.5 | 17.8
Gemini 2.5 Flash Lite (Max Thinking) | 48.1 | 40.2 | 65.4 | 1.7 | 80.9 | 67.6 | 52.6 | 28.1
Gemini 2.5 Flash Lite (Max Thinking) | 47.9 | 43.8 | 66.4 | 5.0 | 77.7 | 67.3 | 52.0 | 23.1
GPT-5.1 No Thinking | 47.5 | 27.1 | 77.5 | 28.3 | 58.3 | 64.1 | 53.8 | 23.5
GLM 4.6V [open] | 46.6 | 45.6 | 64.2 | 3.3 | 80.0 | 66.5 | 49.7 | 17.1
Devstral 2 [open] | 46.5 | 31.7 | 66.8 | 43.3 | 67.7 | 57.0 | 45.7 | 13.5
Qwen 3 30B A3B | 45.4 | 45.6 | 48.9 | 1.7 | 79.8 | 66.6 | 54.5 | 21.1
Grok 4.1 Fast (Non-Reasoning) | 38.3 | 28.5 | 54.3 | 10.0 | 50.2 | 58.3 | 50.0 | 17.0
```

Cost: not published.

---

## Release 2025-12-23

Header: "21 objective tasks across 7 categories". 47 model rows in the default table.
Read 20 Aug 2026.

Reasoning-on/off pairs confirmed: Claude Sonnet 4.5 Thinking/Claude Sonnet 4.5,
Claude 4.1 Opus Thinking/Claude 4.1 Opus, Claude 4 Sonnet Thinking/Claude 4 Sonnet,
Claude Haiku 4.5 Thinking/Claude Haiku 4.5, DeepSeek V3.2 Thinking/DeepSeek V3.2,
DeepSeek V3.2 Exp Thinking/DeepSeek V3.2 Exp, Kimi K2 Thinking/Kimi K2 Instruct,
Qwen 3 235B A22B Thinking 2507/Instruct 2507, Qwen 3 Next 80B A3B Thinking/Instruct,
GPT-5.2 High/GPT-5.2 No Thinking, GPT-5.1 High/GPT-5.1 No Thinking, Grok 4.1
Fast/Grok 4.1 Fast (Non-Reasoning).

Effort-tier pair confirmed exactly as described in the brief: Claude 4.5 Opus Thinking
High Effort (76.2) and Claude 4.5 Opus Medium Effort (65.0) are both present in the
default 47-row table. The category-profile dropdown additionally lists (overall score
only, not pulled as full rows): Claude 4.5 Opus Thinking Medium Effort (74.5), Claude
4.5 Opus Thinking Low Effort (69.0), Claude 4.5 Opus High Effort (64.5), Claude 4.5
Opus Low Effort (61.5).

Columns: Model | Overall | Reasoning | Coding | AgenticCoding | Mathematics | DataAnalysis | Language | InstructionFollowing

```
Claude 4.5 Opus Thinking High Effort | 76.2 | 80.1 | 79.7 | 63.3 | 94.5 | 72.0 | 81.3 | 62.5
GPT-5.1 Codex Max | 75.6 | 84.6 | 81.4 | 56.7 | 92.9 | 71.4 | 75.4 | 67.1
Gemini 3 Pro Preview High | 75.2 | 77.4 | 74.6 | 55.0 | 94.1 | 74.9 | 84.6 | 65.8
GPT-5.2 High | 74.1 | 83.2 | 76.1 | 51.7 | 93.6 | 72.8 | 79.8 | 61.8
GPT-5 Pro | 73.8 | 81.7 | 72.1 | 51.7 | 94.2 | 72.4 | 80.7 | 64.0
Gemini 3 Flash Preview High | 73.7 | 74.5 | 73.9 | 40.0 | 93.6 | 74.7 | 84.6 | 74.9
GPT-5.1 High | 73.3 | 78.8 | 72.5 | 53.3 | 93.5 | 72.1 | 79.3 | 63.9
Claude Sonnet 4.5 Thinking | 71.8 | 77.6 | 80.4 | 53.3 | 90.1 | 71.8 | 76.5 | 53.4
GPT-5.1 Codex | 71.4 | 82.0 | 71.8 | 53.3 | 91.1 | 68.8 | 69.5 | 63.4
GPT-5 Mini High | 69.5 | 68.3 | 68.2 | 46.7 | 90.6 | 72.0 | 75.5 | 65.3
Claude 4.1 Opus Thinking | 67.2 | 72.3 | 74.7 | 48.3 | 88.9 | 71.1 | 72.8 | 42.4
DeepSeek V3.2 Thinking [open] | 66.2 | 77.2 | 64.6 | 40.0 | 92.4 | 70.8 | 70.4 | 48.2
Kimi K2 Thinking [open] | 65.6 | 63.5 | 67.4 | 38.3 | 90.8 | 70.6 | 66.5 | 62.0
Claude 4 Sonnet Thinking | 65.5 | 69.0 | 77.5 | 40.0 | 85.0 | 69.8 | 72.9 | 44.3
GPT-5.1 Codex Mini | 65.4 | 64.7 | 69.9 | 40.0 | 91.0 | 70.3 | 63.0 | 59.0
Claude 4.5 Opus Medium Effort | 65.0 | 53.2 | 78.5 | 63.3 | 86.1 | 67.2 | 78.7 | 28.1
Claude Haiku 4.5 Thinking | 64.6 | 61.7 | 72.8 | 41.7 | 90.7 | 69.3 | 66.5 | 49.8
Grok 4 | 63.8 | 79.1 | 73.1 | 30.0 | 89.0 | 69.5 | 76.4 | 29.1
Gemini 2.5 Pro (Max Thinking) | 63.3 | 70.8 | 75.7 | 33.3 | 83.1 | 71.5 | 75.5 | 33.1
DeepSeek V3.2 Exp Thinking [open] | 63.1 | 64.4 | 70.1 | 31.7 | 90.2 | 72.8 | 71.1 | 41.3
GLM 4.7 [open] | 62.7 | 59.7 | 73.1 | 41.7 | 89.7 | 73.7 | 65.2 | 35.7
Grok 4.1 Fast | 62.5 | 80.2 | 69.6 | 31.7 | 90.0 | 63.4 | 74.3 | 28.2
Claude 4.1 Opus | 60.0 | 40.9 | 76.1 | 53.3 | 80.4 | 67.0 | 76.8 | 25.9
GLM 4.6 [open] | 59.5 | 62.1 | 71.0 | 35.0 | 91.5 | 71.7 | 59.0 | 26.2
Claude Sonnet 4.5 | 59.2 | 42.3 | 76.1 | 48.3 | 80.8 | 67.3 | 76.0 | 23.5
Qwen 3 235B A22B Thinking 2507 [open] | 57.8 | 59.4 | 69.0 | 6.7 | 84.5 | 74.7 | 69.5 | 40.6
DeepSeek V3.2 [open] | 57.5 | 44.3 | 75.7 | 46.7 | 81.9 | 66.7 | 64.2 | 23.1
Gemini 2.5 Flash (Max Thinking) | 56.8 | 51.5 | 67.5 | 23.3 | 89.8 | 72.7 | 65.3 | 27.7
Claude 4 Sonnet | 56.5 | 39.7 | 80.7 | 38.3 | 78.5 | 64.7 | 71.0 | 22.7
DeepSeek V3.2 Exp [open] | 55.3 | 45.5 | 73.2 | 36.7 | 81.5 | 65.1 | 65.6 | 19.3
Qwen 3 Next 80B A3B Thinking [open] | 54.9 | 58.2 | 60.7 | 8.3 | 86.3 | 73.2 | 56.3 | 41.5
GPT-5.2 No Thinking | 54.4 | 42.8 | 76.5 | 40.0 | 75.3 | 68.8 | 50.0 | 27.2
Qwen 3 235B A22B Instruct 2507 [open] | 54.0 | 58.4 | 69.6 | 13.3 | 83.7 | 65.2 | 66.1 | 21.7
GPT-5 Nano | 53.6 | 35.5 | 67.4 | 28.3 | 78.9 | 65.7 | 47.7 | 52.0
Kimi K2 Instruct [open] | 53.4 | 42.2 | 74.3 | 31.7 | 75.2 | 63.4 | 66.7 | 20.4
Gemini 2.5 Flash (Max Thinking) | 53.2 | 44.6 | 66.0 | 16.7 | 84.7 | 69.7 | 62.3 | 28.5
Qwen 3 Next 80B A3B Instruct [open] | 53.1 | 54.7 | 68.2 | 10.0 | 84.9 | 68.6 | 66.3 | 19.2
Claude Haiku 4.5 | 50.9 | 33.9 | 72.2 | 33.3 | 76.0 | 66.2 | 57.0 | 17.8
GPT OSS 120b [open] | 50.4 | 39.2 | 60.2 | 16.7 | 81.2 | 56.8 | 48.6 | 50.3
Grok Code Fast | 50.3 | 42.3 | 64.4 | 33.3 | 72.0 | 69.0 | 48.6 | 22.3
Qwen 3 32B [open] | 48.7 | 48.3 | 66.0 | 3.3 | 81.6 | 68.3 | 55.5 | 17.8
Gemini 2.5 Flash Lite (Max Thinking) | 47.8 | 43.3 | 66.4 | 5.0 | 77.7 | 67.3 | 52.0 | 23.1
Gemini 2.5 Flash Lite (Max Thinking) | 47.5 | 36.2 | 65.4 | 1.7 | 80.9 | 67.6 | 52.6 | 28.1
GPT-5.1 No Thinking | 47.5 | 26.8 | 77.5 | 28.3 | 58.3 | 64.1 | 53.8 | 23.5
Devstral 2 [open] | 46.0 | 27.7 | 66.8 | 43.3 | 67.7 | 57.0 | 45.7 | 13.5
GLM 4.6V [open] | 45.4 | 37.2 | 64.2 | 3.3 | 80.0 | 66.5 | 49.7 | 17.1
Qwen 3 30B A3B | 44.2 | 36.7 | 48.9 | 1.7 | 79.8 | 66.6 | 54.5 | 21.1
Grok 4.1 Fast (Non-Reasoning) | 37.6 | 23.3 | 54.3 | 10.0 | 50.2 | 58.3 | 50.0 | 17.0
```

Cost: not published.

### 2025-12-23 subtask breakdown (all 7 categories)

Reached by clicking each CATEGORY tab in turn (not per-row expansion, which would be
redundant with this - the category-tab view shows the same subtask numbers for every
model in the release at once). Subtask set for this release sums to 4+2+3+3+2+3+4 =
21, matching the page's stated "21 objective tasks" exactly.

**Reasoning (4 subtasks: Theory of Mind, Zebra Puzzle, Spatial, Logic with Navigation)**

Columns: Model | Reasoning | TheoryOfMind | ZebraPuzzle | Spatial | LogicWithNavigation

```
GPT-5.1 Codex Max | 84.6 | 86.5 | 87.8 | 100.0 | 64.0
GPT-5.2 High | 83.2 | 78.8 | 84.0 | 96.0 | 74.0
GPT-5.1 Codex | 82.0 | 76.9 | 89.0 | 98.0 | 64.0
GPT-5 Pro | 81.7 | 80.8 | 84.0 | 98.0 | 64.0
Grok 4.1 Fast | 80.2 | 61.5 | 95.3 | 94.0 | 70.0
Claude 4.5 Opus Thinking High Effort | 80.1 | 78.8 | 77.5 | 96.0 | 68.0
Grok 4 | 79.1 | 61.5 | 85.0 | 96.0 | 74.0
GPT-5.1 High | 78.8 | 76.9 | 80.3 | 92.0 | 66.0
Claude Sonnet 4.5 Thinking | 77.6 | 78.8 | 67.5 | 96.0 | 68.0
Gemini 3 Pro Preview High | 77.4 | 76.9 | 64.8 | 98.0 | 70.0
DeepSeek V3.2 Thinking [open] | 77.2 | 76.9 | 69.8 | 98.0 | 64.0
Gemini 3 Flash Preview High | 74.5 | 82.7 | 47.5 | 96.0 | 72.0
Claude 4.1 Opus Thinking | 72.3 | 67.3 | 62.0 | 90.0 | 70.0
Gemini 2.5 Pro (Max Thinking) | 70.8 | 69.2 | 48.0 | 98.0 | 68.0
Claude 4 Sonnet Thinking | 69.0 | 61.5 | 52.5 | 96.0 | 66.0
GPT-5 Mini High | 68.3 | 61.5 | 61.8 | 88.0 | 62.0
GPT-5.1 Codex Mini | 64.7 | 53.8 | 53.0 | 94.0 | 58.0
DeepSeek V3.2 Exp Thinking [open] | 64.4 | 69.2 | 30.3 | 88.0 | 70.0
Kimi K2 Thinking [open] | 63.5 | 57.7 | 46.3 | 92.0 | 58.0
GLM 4.6 [open] | 62.1 | 50.0 | 48.3 | 90.0 | 60.0
Claude Haiku 4.5 Thinking | 61.7 | 44.2 | 58.5 | 90.0 | 54.0
GLM 4.7 [open] | 59.7 | 76.9 | 18.0 | 82.0 | 62.0
Qwen 3 235B A22B Thinking 2507 [open] | 59.4 | 53.8 | 37.8 | 86.0 | 60.0
Qwen 3 235B A22B Instruct 2507 [open] | 58.4 | 44.2 | 43.5 | 84.0 | 62.0
Qwen 3 Next 80B A3B Thinking [open] | 58.2 | 46.2 | 32.5 | 96.0 | 58.0
Qwen 3 Next 80B A3B Instruct [open] | 54.7 | 44.2 | 32.8 | 90.0 | 52.0
Claude 4.5 Opus Medium Effort | 53.2 | 53.8 | 19.0 | 82.0 | 58.0
Gemini 2.5 Flash (Max Thinking) | 51.5 | 42.3 | 23.5 | 80.0 | 60.0
Qwen 3 32B [open] | 48.3 | 55.8 | 21.3 | 86.0 | 30.0
DeepSeek V3.2 Exp [open] | 45.5 | 50.0 | 12.0 | 80.0 | 40.0
Gemini 2.5 Flash (Max Thinking) | 44.6 | 42.3 | 18.3 | 86.0 | 32.0
DeepSeek V3.2 [open] | 44.3 | 50.0 | 9.0 | 76.0 | 42.0
Gemini 2.5 Flash Lite (Max Thinking) | 43.3 | 34.6 | 12.8 | 84.0 | 42.0
GPT-5.2 No Thinking | 42.8 | 32.7 | 10.5 | 74.0 | 54.0
Grok Code Fast | 42.3 | 38.5 | 14.8 | 74.0 | 42.0
Claude Sonnet 4.5 | 42.3 | 51.9 | 15.3 | 70.0 | 32.0
Kimi K2 Instruct [open] | 42.2 | 51.9 | 21.0 | 62.0 | 34.0
Claude 4.1 Opus | 40.9 | 48.1 | 11.5 | 62.0 | 42.0
Claude 4 Sonnet | 39.7 | 57.7 | 13.0 | 60.0 | 28.0
GPT OSS 120b [open] | 39.2 | 48.1 | 20.8 | 80.0 | 8.0
GLM 4.6V [open] | 37.2 | 34.6 | 18.3 | 84.0 | 12.0
Qwen 3 30B A3B | 36.7 | 38.5 | 16.3 | 82.0 | 10.0
Gemini 2.5 Flash Lite (Max Thinking) | 36.2 | 40.4 | 12.3 | 68.0 | 24.0
GPT-5 Nano | 35.5 | 42.3 | 11.5 | 80.0 | 8.0
Claude Haiku 4.5 | 33.9 | 50.0 | 9.8 | 58.0 | 18.0
Devstral 2 [open] | 27.7 | 38.5 | 0.5 | 56.0 | 16.0
GPT-5.1 No Thinking | 26.8 | 25.0 | 8.3 | 48.0 | 26.0
Grok 4.1 Fast (Non-Reasoning) | 23.3 | 40.4 | 9.0 | 36.0 | 8.0
```

**Coding (2 subtasks: Code Generation, Code Completion)**

Columns: Model | Coding | CodeGeneration | CodeCompletion

```
GPT-5.1 Codex Max | 81.4 | 84.5 | 78.3
Claude 4 Sonnet | 80.7 | 78.9 | 82.6
Claude Sonnet 4.5 Thinking | 80.4 | 80.3 | 80.4
Claude 4.5 Opus Thinking High Effort | 79.7 | 78.9 | 80.4
Claude 4.5 Opus Medium Effort | 78.5 | 83.1 | 73.9
Claude 4 Sonnet Thinking | 77.5 | 78.9 | 76.1
GPT-5.1 No Thinking | 77.5 | 78.9 | 76.1
GPT-5.2 No Thinking | 76.5 | 74.6 | 78.3
Claude 4.1 Opus | 76.1 | 76.1 | 76.1
Claude Sonnet 4.5 | 76.1 | 76.1 | 76.1
GPT-5.2 High | 76.1 | 76.1 | 76.1
DeepSeek V3.2 [open] | 75.7 | 77.5 | 73.9
Gemini 2.5 Pro (Max Thinking) | 75.7 | 77.5 | 73.9
Claude 4.1 Opus Thinking | 74.7 | 73.2 | 76.1
Gemini 3 Pro Preview High | 74.6 | 77.5 | 71.7
Kimi K2 Instruct [open] | 74.3 | 74.6 | 73.9
Gemini 3 Flash Preview High | 73.9 | 76.1 | 71.7
DeepSeek V3.2 Exp [open] | 73.2 | 74.6 | 71.7
GLM 4.7 [open] | 73.1 | 78.9 | 67.4
Grok 4 | 73.1 | 78.9 | 67.4
Claude Haiku 4.5 Thinking | 72.8 | 76.1 | 69.6
GPT-5.1 High | 72.5 | 73.2 | 71.7
Claude Haiku 4.5 | 72.2 | 70.4 | 73.9
GPT-5 Pro | 72.1 | 74.6 | 69.6
GPT-5.1 Codex | 71.8 | 71.8 | 71.7
GLM 4.6 [open] | 71.0 | 74.6 | 67.4
DeepSeek V3.2 Exp Thinking [open] | 70.1 | 66.2 | 73.9
GPT-5.1 Codex Mini | 69.9 | 74.6 | 65.2
Grok 4.1 Fast | 69.6 | 71.8 | 67.4
Qwen 3 235B A22B Instruct 2507 [open] | 69.6 | 71.8 | 67.4
Qwen 3 235B A22B Thinking 2507 [open] | 69.0 | 66.2 | 71.7
GPT-5 Mini High | 68.2 | 69.0 | 67.4
Qwen 3 Next 80B A3B Instruct [open] | 68.2 | 69.0 | 67.4
Gemini 2.5 Flash (Max Thinking) | 67.5 | 67.6 | 67.4
Kimi K2 Thinking [open] | 67.4 | 71.8 | 63.0
GPT-5 Nano | 67.4 | 76.1 | 58.7
Devstral 2 [open] | 66.8 | 66.2 | 67.4
Gemini 2.5 Flash Lite (Max Thinking) | 66.4 | 67.6 | 65.2
Gemini 2.5 Flash (Max Thinking) | 66.0 | 69.0 | 63.0
Qwen 3 32B [open] | 66.0 | 69.0 | 63.0
Gemini 2.5 Flash Lite (Max Thinking) | 65.4 | 63.4 | 67.4
DeepSeek V3.2 Thinking [open] | 64.6 | 66.2 | 63.0
Grok Code Fast | 64.4 | 78.9 | 50.0
GLM 4.6V [open] | 64.2 | 67.6 | 60.9
Qwen 3 Next 80B A3B Thinking [open] | 60.7 | 64.8 | 56.5
GPT OSS 120b [open] | 60.2 | 70.4 | 50.0
Grok 4.1 Fast (Non-Reasoning) | 54.3 | 56.3 | 52.2
Qwen 3 30B A3B | 48.9 | 52.1 | 45.7
```

**Agentic Coding (3 subtasks: JavaScript, TypeScript, Python)**

Columns: Model | AgenticCoding | JavaScript | TypeScript | Python

```
Claude 4.5 Opus Medium Effort | 63.3 | 65.0 | 55.0 | 70.0
Claude 4.5 Opus Thinking High Effort | 63.3 | 50.0 | 55.0 | 85.0
GPT-5.1 Codex Max | 56.7 | 40.0 | 55.0 | 75.0
Gemini 3 Pro Preview High | 55.0 | 60.0 | 35.0 | 70.0
Claude 4.1 Opus | 53.3 | 45.0 | 40.0 | 75.0
Claude Sonnet 4.5 Thinking | 53.3 | 40.0 | 45.0 | 75.0
GPT-5.1 High | 53.3 | 50.0 | 45.0 | 65.0
GPT-5.1 Codex | 53.3 | 45.0 | 50.0 | 65.0
GPT-5 Pro | 51.7 | 45.0 | 45.0 | 65.0
GPT-5.2 High | 51.7 | 50.0 | 35.0 | 70.0
Claude 4.1 Opus Thinking | 48.3 | 45.0 | 30.0 | 70.0
Claude Sonnet 4.5 | 48.3 | 45.0 | 20.0 | 80.0
DeepSeek V3.2 [open] | 46.7 | 40.0 | 30.0 | 70.0
GPT-5 Mini High | 46.7 | 50.0 | 20.0 | 70.0
Devstral 2 [open] | 43.3 | 40.0 | 20.0 | 70.0
Claude Haiku 4.5 Thinking | 41.7 | 40.0 | 20.0 | 65.0
GLM 4.7 [open] | 41.7 | 25.0 | 35.0 | 65.0
Claude 4 Sonnet Thinking | 40.0 | 30.0 | 30.0 | 60.0
DeepSeek V3.2 Thinking [open] | 40.0 | 30.0 | 30.0 | 60.0
Gemini 3 Flash Preview High | 40.0 | 40.0 | 35.0 | 45.0
GPT-5.1 Codex Mini | 40.0 | 25.0 | 30.0 | 65.0
GPT-5.2 No Thinking | 40.0 | 35.0 | 35.0 | 50.0
Claude 4 Sonnet | 38.3 | 25.0 | 25.0 | 65.0
Kimi K2 Thinking [open] | 38.3 | 40.0 | 20.0 | 55.0
DeepSeek V3.2 Exp [open] | 36.7 | 30.0 | 25.0 | 55.0
GLM 4.6 [open] | 35.0 | 30.0 | 20.0 | 55.0
Claude Haiku 4.5 | 33.3 | 30.0 | 25.0 | 45.0
Gemini 2.5 Pro (Max Thinking) | 33.3 | 30.0 | 25.0 | 45.0
Grok Code Fast | 33.3 | 30.0 | 15.0 | 55.0
DeepSeek V3.2 Exp Thinking [open] | 31.7 | 25.0 | 20.0 | 50.0
Grok 4.1 Fast | 31.7 | 25.0 | 20.0 | 50.0
Kimi K2 Instruct [open] | 31.7 | 35.0 | 15.0 | 45.0
Grok 4 | 30.0 | 20.0 | 20.0 | 50.0
GPT-5 Nano | 28.3 | 20.0 | 20.0 | 45.0
GPT-5.1 No Thinking | 28.3 | 35.0 | 20.0 | 30.0
Gemini 2.5 Flash (Max Thinking) | 23.3 | 15.0 | 15.0 | 40.0
Gemini 2.5 Flash (Max Thinking) | 16.7 | 10.0 | 0.0 | 40.0
GPT OSS 120b [open] | 16.7 | 20.0 | 10.0 | 20.0
Qwen 3 235B A22B Instruct 2507 [open] | 13.3 | 10.0 | 10.0 | 20.0
Grok 4.1 Fast (Non-Reasoning) | 10.0 | 10.0 | 5.0 | 15.0
Qwen 3 Next 80B A3B Instruct [open] | 10.0 | 5.0 | 5.0 | 20.0
Qwen 3 Next 80B A3B Thinking [open] | 8.3 | 15.0 | 0.0 | 10.0
Qwen 3 235B A22B Thinking 2507 [open] | 6.7 | 5.0 | 5.0 | 10.0
Gemini 2.5 Flash Lite (Max Thinking) | 5.0 | 5.0 | 0.0 | 10.0
GLM 4.6V [open] | 3.3 | 0.0 | 0.0 | 10.0
Qwen 3 32B [open] | 3.3 | 0.0 | 0.0 | 10.0
Gemini 2.5 Flash Lite (Max Thinking) | 1.7 | 5.0 | 0.0 | 0.0
Qwen 3 30B A3B | 1.7 | 0.0 | 0.0 | 5.0
```

**Mathematics (3 subtasks: AMPS Hard, Math Comp, Olympiad - no "Integrals with Game"
subtask in this release; see 2026-01-08 for the added subtask)**

Columns: Model | Mathematics | AMPSHard | MathComp | Olympiad

```
Claude 4.5 Opus Thinking High Effort | 94.5 | 99.0 | 95.1 | 89.5
GPT-5 Pro | 94.2 | 98.0 | 97.1 | 87.6
Gemini 3 Pro Preview High | 94.1 | 97.0 | 95.1 | 90.3
Gemini 3 Flash Preview High | 93.6 | 98.0 | 93.1 | 89.6
GPT-5.2 High | 93.6 | 97.0 | 95.1 | 88.6
GPT-5.1 High | 93.5 | 97.0 | 95.1 | 88.5
GPT-5.1 Codex Max | 92.9 | 96.0 | 93.1 | 89.5
DeepSeek V3.2 Thinking [open] | 92.4 | 97.0 | 95.1 | 85.0
GLM 4.6 [open] | 91.5 | 98.0 | 95.1 | 81.4
GPT-5.1 Codex | 91.1 | 95.0 | 96.1 | 82.2
GPT-5.1 Codex Mini | 91.0 | 98.0 | 94.1 | 80.9
Kimi K2 Thinking [open] | 90.8 | 96.0 | 96.1 | 80.3
Claude Haiku 4.5 Thinking | 90.7 | 97.0 | 95.1 | 80.0
GPT-5 Mini High | 90.6 | 98.0 | 91.2 | 82.6
DeepSeek V3.2 Exp Thinking [open] | 90.2 | 96.0 | 92.2 | 82.4
Claude Sonnet 4.5 Thinking | 90.1 | 97.0 | 90.2 | 83.1
Grok 4.1 Fast | 90.0 | 95.0 | 96.1 | 78.8
Gemini 2.5 Flash (Max Thinking) | 89.8 | 96.0 | 89.2 | 84.2
GLM 4.7 [open] | 89.7 | 97.0 | 92.2 | 79.9
Grok 4 | 89.0 | 86.0 | 94.1 | 87.0
Claude 4.1 Opus Thinking | 88.9 | 93.0 | 85.3 | 88.5
Qwen 3 Next 80B A3B Thinking [open] | 86.3 | 98.0 | 88.2 | 72.8
Claude 4.5 Opus Medium Effort | 86.1 | 88.0 | 83.3 | 86.9
Claude 4 Sonnet Thinking | 85.0 | 86.0 | 85.3 | 83.7
Qwen 3 Next 80B A3B Instruct [open] | 84.9 | 97.0 | 86.3 | 71.4
Gemini 2.5 Flash (Max Thinking) | 84.7 | 85.0 | 87.3 | 81.8
Qwen 3 235B A22B Thinking 2507 [open] | 84.5 | 86.0 | 86.3 | 81.3
Qwen 3 235B A22B Instruct 2507 [open] | 83.7 | 84.0 | 90.2 | 76.9
Gemini 2.5 Pro (Max Thinking) | 83.1 | 74.0 | 89.2 | 86.0
DeepSeek V3.2 [open] | 81.9 | 95.0 | 76.5 | 74.3
Qwen 3 32B [open] | 81.6 | 87.0 | 84.3 | 73.4
DeepSeek V3.2 Exp [open] | 81.5 | 92.0 | 75.5 | 77.0
GPT OSS 120b [open] | 81.2 | 92.0 | 92.2 | 59.3
Gemini 2.5 Flash Lite (Max Thinking) | 80.9 | 93.0 | 83.3 | 66.3
Claude Sonnet 4.5 | 80.8 | 91.0 | 68.6 | 82.9
Claude 4.1 Opus | 80.4 | 89.0 | 65.7 | 86.6
GLM 4.6V [open] | 80.0 | 95.0 | 84.3 | 60.7
Qwen 3 30B A3B | 79.8 | 91.0 | 84.3 | 64.1
GPT-5 Nano | 78.9 | 96.0 | 86.3 | 54.5
Claude 4 Sonnet | 78.5 | 84.0 | 70.6 | 80.8
Gemini 2.5 Flash Lite (Max Thinking) | 77.7 | 93.0 | 73.5 | 66.6
Claude Haiku 4.5 | 76.0 | 88.0 | 68.6 | 71.3
GPT-5.2 No Thinking | 75.3 | 77.0 | 67.6 | 81.4
Kimi K2 Instruct [open] | 75.2 | 82.0 | 72.5 | 71.1
Grok Code Fast | 72.0 | 87.0 | 61.8 | 67.3
Devstral 2 [open] | 67.7 | 80.0 | 60.8 | 62.3
GPT-5.1 No Thinking | 58.3 | 78.0 | 28.4 | 68.6
Grok 4.1 Fast (Non-Reasoning) | 50.2 | 47.0 | 45.1 | 58.6
```

**Data Analysis (2 subtasks: Table Join, Table Reformat - no "Consecutive Events"
subtask in this release; see 2026-01-08 for the added subtask)**

Columns: Model | DataAnalysis | TableJoin | TableReformat

```
Gemini 3 Pro Preview High | 74.9 | 51.8 | 98.0
Gemini 3 Flash Preview High | 74.7 | 51.4 | 98.0
Qwen 3 235B A22B Thinking 2507 [open] | 74.7 | 49.3 | 100.0
GLM 4.7 [open] | 73.7 | 47.4 | 100.0
Qwen 3 Next 80B A3B Thinking [open] | 73.2 | 46.3 | 100.0
GPT-5.2 High | 72.8 | 45.6 | 100.0
DeepSeek V3.2 Exp Thinking [open] | 72.8 | 45.6 | 100.0
Gemini 2.5 Flash (Max Thinking) | 72.7 | 47.4 | 98.0
GPT-5 Pro | 72.4 | 44.8 | 100.0
GPT-5.1 High | 72.1 | 44.1 | 100.0
Claude 4.5 Opus Thinking High Effort | 72.0 | 45.9 | 98.0
GPT-5 Mini High | 72.0 | 43.9 | 100.0
Claude Sonnet 4.5 Thinking | 71.8 | 45.5 | 98.0
GLM 4.6 [open] | 71.7 | 43.5 | 100.0
Gemini 2.5 Pro (Max Thinking) | 71.5 | 45.0 | 98.0
GPT-5.1 Codex Max | 71.4 | 42.8 | 100.0
Claude 4.1 Opus Thinking | 71.1 | 44.3 | 98.0
DeepSeek V3.2 Thinking [open] | 70.8 | 41.6 | 100.0
Kimi K2 Thinking [open] | 70.6 | 45.1 | 96.1
GPT-5.1 Codex Mini | 70.3 | 40.6 | 100.0
Claude 4 Sonnet Thinking | 69.8 | 41.6 | 98.0
Gemini 2.5 Flash (Max Thinking) | 69.7 | 41.3 | 98.0
Grok 4 | 69.5 | 41.0 | 98.0
Claude Haiku 4.5 Thinking | 69.3 | 42.6 | 96.1
Grok Code Fast | 69.0 | 38.0 | 100.0
GPT-5.1 Codex | 68.8 | 41.5 | 96.1
GPT-5.2 No Thinking | 68.8 | 37.6 | 100.0
Qwen 3 Next 80B A3B Instruct [open] | 68.6 | 45.1 | 92.2
Qwen 3 32B [open] | 68.3 | 38.5 | 98.0
Gemini 2.5 Flash Lite (Max Thinking) | 67.6 | 37.3 | 98.0
Claude Sonnet 4.5 | 67.3 | 36.6 | 98.0
Gemini 2.5 Flash Lite (Max Thinking) | 67.3 | 36.5 | 98.0
Claude 4.5 Opus Medium Effort | 67.2 | 36.3 | 98.0
Claude 4.1 Opus | 67.0 | 37.8 | 96.1
DeepSeek V3.2 [open] | 66.7 | 35.4 | 98.0
Qwen 3 30B A3B | 66.6 | 37.1 | 96.1
GLM 4.6V [open] | 66.5 | 34.9 | 98.0
Claude Haiku 4.5 | 66.2 | 38.3 | 94.1
GPT-5 Nano | 65.7 | 35.4 | 96.1
Qwen 3 235B A22B Instruct 2507 [open] | 65.2 | 34.4 | 96.1
DeepSeek V3.2 Exp [open] | 65.1 | 32.1 | 98.0
Claude 4 Sonnet | 64.7 | 35.3 | 94.1
GPT-5.1 No Thinking | 64.1 | 32.2 | 96.1
Kimi K2 Instruct [open] | 63.4 | 32.7 | 94.1
Grok 4.1 Fast | 63.4 | 38.5 | 88.2
Grok 4.1 Fast (Non-Reasoning) | 58.3 | 26.3 | 90.2
Devstral 2 [open] | 57.0 | 21.8 | 92.2
GPT OSS 120b [open] | 56.8 | 29.2 | 84.3
```

**Language (3 subtasks: Connections, Plot Unscrambling, Typos)**

Columns: Model | Language | Connections | PlotUnscrambling | Typos

```
Gemini 3 Pro Preview High | 84.6 | 100.0 | 69.9 | 84.0
Gemini 3 Flash Preview High | 84.6 | 100.0 | 65.7 | 88.0
Claude 4.5 Opus Thinking High Effort | 81.3 | 99.3 | 66.5 | 78.0
GPT-5 Pro | 80.7 | 98.0 | 64.1 | 80.0
GPT-5.2 High | 79.8 | 99.0 | 58.4 | 82.0
GPT-5.1 High | 79.3 | 97.3 | 60.4 | 80.0
Claude 4.5 Opus Medium Effort | 78.7 | 89.7 | 62.3 | 84.0
Claude 4.1 Opus | 76.8 | 86.0 | 60.3 | 84.0
Claude Sonnet 4.5 Thinking | 76.5 | 91.3 | 62.0 | 76.0
Grok 4 | 76.4 | 98.7 | 60.5 | 70.0
Claude Sonnet 4.5 | 76.0 | 80.7 | 57.3 | 90.0
GPT-5 Mini High | 75.5 | 98.7 | 41.9 | 86.0
Gemini 2.5 Pro (Max Thinking) | 75.5 | 87.5 | 63.0 | 76.0
GPT-5.1 Codex Max | 75.4 | 86.0 | 58.2 | 82.0
Grok 4.1 Fast | 74.3 | 99.3 | 47.6 | 76.0
Claude 4 Sonnet Thinking | 72.9 | 82.8 | 55.9 | 80.0
Claude 4.1 Opus Thinking | 72.8 | 93.8 | 60.5 | 64.0
DeepSeek V3.2 Exp Thinking [open] | 71.1 | 87.7 | 47.5 | 78.0
Claude 4 Sonnet | 71.0 | 74.8 | 54.2 | 84.0
DeepSeek V3.2 Thinking [open] | 70.4 | 93.5 | 45.7 | 72.0
Qwen 3 235B A22B Thinking 2507 [open] | 69.5 | 83.0 | 47.6 | 78.0
GPT-5.1 Codex | 69.5 | 96.5 | 41.9 | 70.0
Kimi K2 Instruct [open] | 66.7 | 78.2 | 45.9 | 76.0
Claude Haiku 4.5 Thinking | 66.5 | 84.8 | 42.5 | 72.0
Kimi K2 Thinking [open] | 66.5 | 88.0 | 43.4 | 68.0
Qwen 3 Next 80B A3B Instruct [open] | 66.3 | 89.0 | 40.0 | 70.0
Qwen 3 235B A22B Instruct 2507 [open] | 66.1 | 91.0 | 39.2 | 68.0
DeepSeek V3.2 Exp [open] | 65.6 | 79.3 | 45.5 | 72.0
Gemini 2.5 Flash (Max Thinking) | 65.3 | 77.7 | 52.4 | 66.0
GLM 4.7 [open] | 65.2 | 70.5 | 53.2 | 72.0
DeepSeek V3.2 [open] | 64.2 | 81.8 | 44.9 | 66.0
GPT-5.1 Codex Mini | 63.0 | 97.0 | 30.0 | 62.0
Gemini 2.5 Flash (Max Thinking) | 62.3 | 70.2 | 52.7 | 64.0
GLM 4.6 [open] | 59.0 | 71.0 | 50.0 | 56.0
Claude Haiku 4.5 | 57.0 | 71.3 | 37.8 | 62.0
Qwen 3 Next 80B A3B Thinking [open] | 56.3 | 70.2 | 40.8 | 58.0
Qwen 3 32B [open] | 55.5 | 61.0 | 37.6 | 68.0
Qwen 3 30B A3B | 54.5 | 68.2 | 31.2 | 64.0
GPT-5.1 No Thinking | 53.8 | 44.7 | 42.9 | 74.0
Gemini 2.5 Flash Lite (Max Thinking) | 52.6 | 63.0 | 32.8 | 62.0
Gemini 2.5 Flash Lite (Max Thinking) | 52.0 | 61.8 | 32.1 | 62.0
Grok 4.1 Fast (Non-Reasoning) | 50.0 | 44.2 | 41.9 | 64.0
GPT-5.2 No Thinking | 50.0 | 48.8 | 45.1 | 56.0
GLM 4.6V [open] | 49.7 | 57.5 | 29.7 | 62.0
GPT OSS 120b [open] | 48.6 | 79.2 | 18.6 | 48.0
Grok Code Fast | 48.6 | 55.7 | 38.0 | 52.0
GPT-5 Nano | 47.7 | 74.7 | 16.5 | 52.0
Devstral 2 [open] | 45.7 | 34.3 | 38.7 | 64.0
```

**Instruction Following (4 subtasks: Paraphrase, Simplify, Story Generation,
Summarize)**

Columns: Model | InstructionFollowing | Paraphrase | Simplify | StoryGeneration | Summarize

```
Gemini 3 Flash Preview High | 74.9 | 73.0 | 70.1 | 71.5 | 84.9
GPT-5.1 Codex Max | 67.1 | 57.4 | 66.5 | 71.3 | 73.4
Gemini 3 Pro Preview High | 65.8 | 64.3 | 58.2 | 66.8 | 74.1
GPT-5 Mini High | 65.3 | 61.9 | 60.4 | 73.5 | 65.3
GPT-5 Pro | 64.0 | 61.4 | 62.2 | 67.3 | 65.0
GPT-5.1 High | 63.9 | 58.3 | 60.1 | 76.1 | 61.0
GPT-5.1 Codex | 63.4 | 61.0 | 60.3 | 67.5 | 64.7
Claude 4.5 Opus Thinking High Effort | 62.5 | 65.7 | 55.0 | 65.8 | 63.7
Kimi K2 Thinking [open] | 62.0 | 63.4 | 50.9 | 67.4 | 66.5
GPT-5.2 High | 61.8 | 64.1 | 54.1 | 65.7 | 63.2
GPT-5.1 Codex Mini | 59.0 | 45.5 | 59.8 | 68.4 | 62.5
Claude Sonnet 4.5 Thinking | 53.4 | 53.4 | 47.9 | 58.4 | 53.7
GPT-5 Nano | 52.0 | 48.8 | 55.1 | 55.4 | 48.7
GPT OSS 120b [open] | 50.3 | 44.8 | 55.5 | 56.5 | 44.4
Claude Haiku 4.5 Thinking | 49.8 | 42.6 | 45.4 | 57.3 | 53.8
DeepSeek V3.2 Thinking [open] | 48.2 | 41.8 | 48.2 | 55.1 | 47.6
Claude 4 Sonnet Thinking | 44.3 | 41.4 | 46.0 | 48.7 | 41.3
Claude 4.1 Opus Thinking | 42.4 | 35.4 | 44.4 | 44.7 | 45.2
Qwen 3 Next 80B A3B Thinking [open] | 41.5 | 33.2 | 39.1 | 48.3 | 45.6
DeepSeek V3.2 Exp Thinking [open] | 41.3 | 34.3 | 41.0 | 42.5 | 47.2
Qwen 3 235B A22B Thinking 2507 [open] | 40.6 | 37.6 | 38.1 | 39.2 | 47.6
GLM 4.7 [open] | 35.7 | 31.2 | 36.8 | 37.9 | 36.8
Gemini 2.5 Pro (Max Thinking) | 33.1 | 28.6 | 34.5 | 32.1 | 37.0
Grok 4 | 29.1 | 19.8 | 25.9 | 38.8 | 31.8
Gemini 2.5 Flash (Max Thinking) | 28.5 | 25.4 | 22.5 | 32.9 | 33.2
Grok 4.1 Fast | 28.2 | 23.7 | 25.8 | 32.3 | 31.0
Claude 4.5 Opus Medium Effort | 28.1 | 22.8 | 27.3 | 31.7 | 30.6
Gemini 2.5 Flash Lite (Max Thinking) | 28.1 | 27.2 | 24.3 | 32.7 | 28.2
Gemini 2.5 Flash (Max Thinking) | 27.7 | 24.5 | 26.9 | 30.8 | 28.5
GPT-5.2 No Thinking | 27.2 | 21.6 | 25.2 | 30.3 | 31.8
GLM 4.6 [open] | 26.2 | 22.8 | 20.8 | 29.4 | 31.8
Claude 4.1 Opus | 25.9 | 19.1 | 25.6 | 31.0 | 27.9
Claude Sonnet 4.5 | 23.5 | 19.6 | 19.4 | 28.2 | 26.9
GPT-5.1 No Thinking | 23.5 | 16.9 | 27.1 | 21.9 | 28.1
Gemini 2.5 Flash Lite (Max Thinking) | 23.1 | 16.6 | 23.4 | 27.8 | 24.6
DeepSeek V3.2 [open] | 23.1 | 20.6 | 24.0 | 20.7 | 27.0
Claude 4 Sonnet | 22.7 | 17.0 | 22.2 | 24.8 | 26.8
Grok Code Fast | 22.3 | 18.6 | 20.1 | 24.8 | 25.6
Qwen 3 235B A22B Instruct 2507 [open] | 21.7 | 18.0 | 21.9 | 19.4 | 27.6
Qwen 3 30B A3B | 21.1 | 17.9 | 20.4 | 25.1 | 21.1
Kimi K2 Instruct [open] | 20.4 | 13.0 | 20.3 | 24.3 | 23.9
DeepSeek V3.2 Exp [open] | 19.3 | 16.1 | 20.9 | 16.7 | 23.7
Qwen 3 Next 80B A3B Instruct [open] | 19.2 | 16.4 | 18.4 | 17.6 | 24.4
Qwen 3 32B [open] | 17.8 | 15.8 | 20.1 | 14.5 | 20.7
Claude Haiku 4.5 | 17.8 | 15.5 | 18.9 | 16.4 | 20.2
GLM 4.6V [open] | 17.1 | 17.0 | 14.9 | 14.6 | 21.7
Grok 4.1 Fast (Non-Reasoning) | 17.0 | 12.6 | 17.1 | 18.7 | 19.4
Devstral 2 [open] | 13.5 | 12.3 | 13.2 | 11.5 | 16.9
```

Cost: not published.

---
