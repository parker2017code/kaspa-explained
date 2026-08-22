# LM Arena Text Leaderboard: All Categories and Adjustments

Source: https://arena.ai (lmarena.ai redirects here), Text Arena, leaderboard page reached via the "Categories" sidebar control (29 categories) and the "Adjustments" panel (Style Control, Factuality, None).

Capture method: browser-rendered DOM read via the Claude Browser tools (get_page_text, and targeted DOM text extraction of the same rendered `<table>` element already visible on screen). No API, JSON endpoint, or export was used. Row counts were checked against the model count the page states for each view.

Columns: Rank, Rank Spread (low-high), Model, Lab and License, Score, Interval, Flag (e.g. Preliminary), Votes, Price $/M (input / output), Context.

Format per row: `rank | rank spread | model | lab · license | score | interval | flag | votes | price | context`

---

## Category: Overall (adjustment: None)

Source: https://arena.ai, Text Arena leaderboard, Categories panel, "Overall" selected, Adjustments = None.
Date shown on page: Aug 19, 2026. Votes: 7,874,713. Models: 393. Captured row count: 393 (verified match).

```
1	1-4	claude-fable-5	Anthropic · Proprietary	1507	±5		23,626	$10 / $50	1M
2	1-4	claude-opus-4-6-high	Anthropic · Proprietary	1505	±4		72,392	$5 / $25	1M
3	1-7	claude-opus-4-7-high	Anthropic · Proprietary	1502	±4		60,237	$5 / $25	1M
4	1-16	muse-spark-1.2 (xHigh)	Meta · Proprietary	1498	±10		3,264	$1.25 / $4.25	N/A
5	3-12	claude-opus-4-6	Anthropic · Proprietary	1497	±3		76,389	$5 / $25	1M
6	4-13	claude-opus-4-7	Anthropic · Proprietary	1494	±4		61,326	$5 / $25	1M
7	3-16	claude-opus-5-high	Anthropic · Proprietary	1493	±5		25,628	$5 / $25	1M
8	4-19	muse-spark-1.1	Meta · Proprietary	1491	±5		19,324	$1.25 / $4.25	N/A
9	3-22	gemini-3.7-flash-high	Google · Proprietary	1490	±8	Preliminary	5,723	$0.75 / $3.57	1M
10	4-21	kimi-k3-max	Moonshot · Kimi K3 license	1490	±6		14,241	N/A	N/A
11	4-22	muse-spark	Meta · Proprietary	1488	±6		13,581	N/A	N/A
12	5-23	claude-opus-5-max	Anthropic · Proprietary	1487	±6		12,434	$5 / $25	1M
13	6-22	gemini-3.1-pro-preview	Google · Proprietary	1486	±3		98,068	$1 / $6	1M
14	6-22	gemini-3-pro	Google · Proprietary	1485	±4		41,496	$2 / $12	1M
15	4-39	glm-5.3-max	Z.ai · MIT	1484	±11		2,698	$1.40 / $4.40	1M
16	8-28	claude-opus-4-8-high	Anthropic · Proprietary	1482	±4		43,616	$5 / $25	1M
17	6-35	qwen3.8-max	Alibaba · Proprietary	1482	±7		9,271	$2 / $6	1M
18	8-31	gpt-5.6-sol-xhigh	OpenAI · Proprietary	1482	±5		18,535	$5 / $30	N/A
19	9-28	gpt-5.5-high	OpenAI · Proprietary	1482	±4		58,479	$2.50 / $15	1.1M
20	8-34	gemini-3.6-flash-high	Google · Proprietary	1481	±6		16,883	$0.38 / $1.88	1M
21	10-36	gemini-3.5-flash-high	Google · Proprietary	1479	±5		28,931	$0.75 / $4.50	1M
22	14-38	gpt-5.4-high	OpenAI · Proprietary	1476	±4		60,758	$2.50 / $15	1.1M
23	15-39	gpt-5.2-chat-latest-20260210	OpenAI · Proprietary	1476	±4		34,339	$1.75 / $14	128K
24	15-39	gpt-5.5	OpenAI · Proprietary	1476	±4		59,847	$2.50 / $15	1.1M
25	15-43	gemini-3.5-flash-medium	Google · Proprietary	1475	±5		27,212	$0.75 / $4.50	1M
26	15-43	grok-4.20-beta1	SpaceXAI · Proprietary	1475	±5		26,783	N/A	N/A
27	9-50	qwen3.7-max-preview	Alibaba · Proprietary	1474	±10		3,714	$1.48 / $4.42	1M
28	15-46	gpt-5.5-instant	OpenAI · Proprietary	1473	±5		25,858	$2.50 / $15	1.1M
29	17-46	claude-opus-4-8	Anthropic · Proprietary	1473	±4		44,286	$5 / $25	1M
30	17-46	gemini-3-flash	Google · Proprietary	1473	±4		30,860	$0.50 / $3	1M
31	17-45	claude-opus-4-5-20251101-high-32k	Anthropic · Proprietary	1473	±4		37,214	$5 / $25	200K
32	18-46	claude-sonnet-4-6	Anthropic · Proprietary	1472	±4		66,542	$1.50 / $7.50	1M
33	18-47	grok-4.20-beta-0309-reasoning	SpaceXAI · Proprietary	1472	±4		62,296	$1.25 / $2.50	1M
34	20-47	grok-4.20-multi-agent-beta-0309	SpaceXAI · Proprietary	1470	±4		60,880	$1.25 / $2.50	1M
35	18-49	glm-5.2-max	Z.ai · MIT	1470	±5		29,677	$1.40 / $4.40	1M
36	19-50	grok-4.5	SpaceXAI · Proprietary	1470	±5		20,912	$2 / $6	500K
37	22-48	claude-opus-4-5-20251101	Anthropic · Proprietary	1469	±3		70,998	$5 / $25	200K
38	21-50	ernie-5.1	Baidu · Proprietary	1468	±5		37,156	N/A	N/A
39	25-50	glm-5.1	Z.ai · MIT	1468	±4		41,410	$1.40 / $4.40	202.8K
40	25-50	mimo-v2.5-pro	Xiaomi · MIT	1467	±4		53,264	$0.43 / $0.87	1.1M
41	27-53	gpt-5.4	OpenAI · Proprietary	1466	±4		63,696	$2.50 / $15	1.1M
42	28-53	grok-4.1-thinking	SpaceXAI · Proprietary	1466	±3		65,583	N/A	N/A
43	25-56	qwen3.5-max-preview	Alibaba · Proprietary	1465	±5		21,488	$1.20 / $6	N/A
44	27-58	gpt-5.6-terra-xhigh	OpenAI · Proprietary	1465	±5		19,110	$2.50 / $15	N/A
45	21-69	deepseek-v4-pro-high-20260813	DeepSeek · MIT	1462	±11		2,654	$1.32 / $3.96	N/A
46	25-69	grok-4.6-high	SpaceXAI · Proprietary	1462	±10	Preliminary	3,478	$2 / $6	500K
47	34-63	claude-sonnet-5-high	Anthropic · Proprietary	1461	±5		26,291	$1 / $5	1M
48	36-63	kimi-k2.6	Moonshot · Modified MIT	1460	±5		37,569	$0.95 / $4	262.1K
49	32-69	qwen3.6-max-preview	Alibaba · Proprietary	1460	±8		5,200	$1.03 / $6.16	262.1K
50	41-63	grok-4.1	SpaceXAI · Proprietary	1459	±3		67,784	N/A	N/A
51	43-64	gemini-3-flash (thinking-minimal)	Google · Proprietary	1458	±3		86,389	$0.50 / $3	1M
52	41-66	qwen3.7-plus	Alibaba · Proprietary	1458	±5		33,489	$0.32 / $1.28	1M
53	43-64	deepseek-v4-pro	DeepSeek · MIT	1458	±4		54,307	$1.32 / $3.96	1M
54	35-72	hy3	Tencent · Apache 2.0	1458	±8		5,515	$0.13 / $0.53	262.1K
55	41-69	gemini-3.5-flash-lite	Google · Proprietary	1457	±6		16,859	$0.15 / $1.25	1M
56	43-67	glm-5	Z.ai · MIT	1457	±4		27,852	$1 / $3.20	202.8K
57	44-67	dola-seed-2.0-pro	Bytedance · Proprietary	1456	±3		74,553	N/A	N/A
58	45-67	claude-sonnet-4-5-20250929-high-32k	Anthropic · Proprietary	1456	±3		82,496	$3 / $15	200K
59	44-69	deepseek-v4-pro-high-preview	DeepSeek · MIT	1455	±4		51,678	$1.32 / $3.96	1M
60	45-69	claude-sonnet-4-5-20250929	Anthropic · Proprietary	1455	±3		80,871	$3 / $15	200K
61	45-69	gpt-5.1-high	OpenAI · Proprietary	1455	±4		40,953	$0.63 / $5	400K
62	45-81	gemma-4-31b	Google · Apache 2.0	1451	±8		5,896	$0.14 / $0.40	262.1K
63	45-77	gpt-5.6-luna-xhigh	OpenAI · Proprietary	1451	±5		19,631	$1 / $6	N/A
64	50-76	kimi-k2.5-thinking	Moonshot · Modified MIT	1450	±3		70,948	$0.60 / $3	N/A
65	48-82	ernie-5.0-preview-1203	Baidu · Proprietary	1449	±7		9,776	N/A	N/A
66	54-80	claude-opus-4-1-20250805-thinking-16k	Anthropic · Proprietary	1449	±3		50,026	$15 / $75	200K
67	51-81	gpt-5.3-chat-latest	OpenAI · Proprietary	1449	±4		32,851	$1.75 / $14	128K
68	50-81	mimo-v2-pro	Xiaomi · Proprietary	1449	±5		24,400	$1 / $3	1M
69	54-81	gpt-5.4-mini-high	OpenAI · Proprietary	1448	±4		59,547	$0.75 / $4.50	400K
70	61-81	claude-opus-4-1-20250805	Anthropic · Proprietary	1447	±3		77,774	$15 / $75	200K
71	61-83	ernie-5.0-0110	Baidu · Proprietary	1446	±4		35,279	N/A	N/A
72	62-81	gemini-2.5-pro	Google · Proprietary	1445	±2		124,829	$0.63 / $5	1M
73	61-87	gpt-4.5-preview-2025-02-27	OpenAI · Proprietary	1445	±6		14,547	$75 / $150	128K
74	62-87	qwen3.6-plus	Alibaba · Proprietary	1444	±4		45,396	$0.33 / $1.95	1M
75	64-85	chatgpt-4o-latest-20250326	OpenAI · Proprietary	1443	±3		82,766	$5 / $15	128K
76	62-91	minimax-m3	MiniMax · MiniMax Community License	1442	±5		39,985	$0.60 / $2.40	N/A
77	64-90	qwen3.5-397b-a17b	Alibaba · Apache 2.0	1442	±3		69,341	$0.39 / $2.34	262.1K
78	64-91	grok-4.3	SpaceXAI · Proprietary	1442	±4		59,827	$1.25 / $2.50	1M
79	62-96	glm-4.7	Z.ai · MIT	1441	±6		12,158	$0.40 / $1.75	204.8K
80	65-97	inkling	Thinky · Apache 2.0	1440	±6		17,484	$1 / $4.05	524.3K
81	72-96	gpt-5.1	OpenAI · Proprietary	1439	±4		43,649	$0.63 / $5	400K
82	63-103	gemma-4-26b-a4b	Google · Apache 2.0	1438	±8		5,810	N/A	N/A
83	71-97	deepseek-v4-flash-high-preview	DeepSeek · MIT	1438	±4		48,700	$0.44 / $1.32	1M
84	73-98	gpt-5.2-high	OpenAI · Proprietary	1438	±4		47,928	$0.88 / $7	400K
85	74-101	deepseek-v4-flash	DeepSeek · MIT	1436	±4		49,015	$0.44 / $1.32	1M
86	73-102	longcat-flash-chat-2602-exp	Meituan · Proprietary	1436	±5		28,000	N/A	N/A
87	76-101	gpt-5.2	OpenAI · Proprietary	1435	±3		79,430	$0.88 / $7	400K
88	76-103	qwen3-max-preview	Alibaba · Proprietary	1434	±4		27,848	$0.78 / $3.90	262.1K
89	76-104	gpt-5-high	OpenAI · Proprietary	1434	±4		32,090	$0.63 / $5	400K
90	77-105	mimo-v2.5	Xiaomi · MIT	1434	±4		44,575	$0.14 / $0.28	1.1M
91	74-112	glm-5v-turbo	Z.ai · Proprietary	1433	±7		9,389	$1.20 / $4	202.8K
92	79-107	gemini-3.1-flash-lite-preview	Google · Proprietary	1432	±4		60,617	$0.25 / $1.50	1M
93	79-115	kimi-k2.5-instant	Moonshot · Modified MIT	1431	±7		8,185	$0.45 / $2.25	262.1K
94	81-110	o3-2025-04-16	OpenAI · Proprietary	1431	±4		59,894	$2 / $8	200K
95	83-110	grok-4-1-fast-reasoning	SpaceXAI · Proprietary	1431	±3		56,786	$0.20 / $0.50	2M
96	79-115	mimo-v2-omni	Xiaomi · Proprietary	1430	±6		19,440	$0.40 / $2	262.1K
97	84-111	kimi-k2-thinking-turbo	Moonshot · Modified MIT	1430	±3		62,120	$1.15 / $8	262.1K
98	84-122	mistral-medium-3.5	Mistral · Modified MIT	1427	±7		11,016	$1.50 / $7.50	262.1K
99	87-120	gpt-5-chat	OpenAI · Proprietary	1427	±4		31,682	$1.25 / $10	N/A
100	79-127	muse-glimmer	Meta · Apache-2.0	1427	±10		3,724	N/A	N/A
101	84-124	nvidia-nemotron-3-ultra-550b-a55b-nvfp4	Nvidia · OpenMDW-1.1	1426	±7		10,706	N/A	N/A
102	79-128	amazon-nova-experimental-chat-26-02-10	Amazon · Proprietary	1426	±10		3,409	N/A	N/A
103	91-120	deepseek-v3.2	DeepSeek · MIT	1425	±4		47,307	$0.27 / $0.40	163.8K
104	90-122	claude-opus-4-20250514-thinking-16k	Anthropic · Proprietary	1425	±4		37,001	$15 / $75	200K
105	86-124	deepseek-v3.2-exp-thinking	DeepSeek · MIT	1425	±7		9,110	$0.27 / $0.41	163.8K
106	92-122	glm-4.6	Z.ai · MIT	1424	±4		35,832	$0.50 / $2	204.8K
107	89-126	qwen3-max-2025-09-23	Alibaba · Proprietary	1423	±6		9,195	$0.78 / $3.90	262.1K
108	96-122	qwen3-235b-a22b-instruct-2507	Alibaba · Apache 2.0	1423	±3		97,430	$0.26 / $1.06	N/A
109	96-124	deepseek-v3.2-thinking	DeepSeek · MIT	1423	±4		41,133	$0.27 / $0.40	163.8K
110	91-127	deepseek-v3.2-exp	DeepSeek · MIT	1422	±6		11,991	$0.27 / $0.41	163.8K
111	92-127	deepseek-r1-0528	DeepSeek · MIT	1422	±6		18,494	$0.50 / $2.15	163.8K
112	92-131	grok-4-fast-chat	SpaceXAI · Proprietary	1420	±8		6,834	$3 / $15	256K
113	95-135	ernie-5.0-preview-1022	Baidu · Proprietary	1418	±9		4,737	N/A	N/A
114	98-131	kimi-k2-0711-preview	Moonshot · Modified MIT	1418	±5		27,722	$0.60 / $2.50	131.1K
115	98-135	kimi-k2-0905-preview	Moonshot · Modified MIT	1418	±6		11,814	$0.60 / $2.50	262.1K
116	98-135	deepseek-v3.1	DeepSeek · MIT	1417	±6		15,004	$1.23 / $4.94	N/A
117	94-137	deepseek-v3.1-terminus-thinking	DeepSeek · MIT	1417	±10		3,470	$0.27 / $1	163.8K
118	100-131	qwen3.5-122b-a10b	Alibaba · Apache 2.0	1417	±4		28,422	$0.26 / $2.08	262.1K
119	104-131	minimax-m2.7	MiniMax · Modified MIT	1416	±4		61,145	$0.30 / $1.20	204.8K
120	98-135	deepseek-v3.1-thinking	DeepSeek · MIT	1416	±7		11,790	$1.23 / $4.94	N/A
121	96-144	amazon-nova-experimental-chat-26-01-10	Amazon · Proprietary	1415	±10		3,417	N/A	N/A
122	98-144	deepseek-v3.1-terminus	DeepSeek · MIT	1415	±10		3,701	$0.27 / $1	163.8K
123	100-137	qwen3-vl-235b-a22b-instruct	Alibaba · Apache 2.0	1414	±6		11,558	$0.21 / $1.90	262.1K
124	107-135	mistral-large-3	Mistral · Apache 2.0	1414	±3		61,772	$0.50 / $1.50	N/A
125	107-135	gpt-4.1-2025-04-14	OpenAI · Proprietary	1414	±4		51,130	$2 / $8	1M
126	112-135	claude-haiku-4-5-20251001	Anthropic · Proprietary	1413	±3		121,458	$1 / $5	200K
127	108-136	claude-opus-4-20250514	Anthropic · Proprietary	1413	±4		44,334	$15 / $75	200K
128	104-144	hunyuan-hy3-preview	Tencent · tencent-hunyuan-community	1412	±8		6,612	$0.29 / $1.17	262.1K
129	112-140	grok-3-preview-02-24	SpaceXAI · Proprietary	1411	±4		32,940	$3 / $15	131.1K
130	111-142	glm-4.5	Z.ai · MIT	1411	±5		24,411	$0.60 / $2.20	131.1K
131	116-137	gemini-2.5-flash	Google · Proprietary	1410	±2		124,776	$0.15 / $1.25	1M
132	112-144	grok-4-0709	SpaceXAI · Proprietary	1409	±4		41,547	$3 / $15	256K
133	116-141	mistral-medium-2508	Mistral · Proprietary	1409	±3		94,028	$0.40 / $2	131.1K
134	116-145	qwen3.5-27b	Alibaba · Apache 2.0	1408	±4		27,293	$0.20 / $1.56	262.1K
135	116-151	Inkling Small	Thinky · Apache 2.0	1405	±7		10,465	$0.45 / $1.20	524.3K
136	124-149	gemini-2.5-flash-preview-09-2025	Google · Proprietary	1404	±4		33,074	$0.30 / $2.50	1M
137	123-151	grok-4-fast-reasoning	SpaceXAI · Proprietary	1404	±5		18,809	$0.20 / $0.50	2M
138	127-152	qwen3-235b-a22b-no-thinking	Alibaba · Apache 2.0	1402	±5		38,274	$0.46 / $1.82	131.1K
139	129-151	gpt-5.4-nano-high	OpenAI · Proprietary	1402	±4		58,581	$0.20 / $1.25	400K
140	128-152	o1-2024-12-17	OpenAI · Proprietary	1402	±4		27,807	$15 / $60	200K
141	130-152	qwen3-next-80b-a3b-instruct	Alibaba · Apache 2.0	1401	±5		23,002	$0.09 / $1.10	262.1K
142	127-156	longcat-flash-chat	Meituan · MIT	1401	±6		11,426	$0.20 / $0.80	131.1K
143	134-153	claude-sonnet-4-20250514-thinking-32k	Anthropic · Proprietary	1400	±4		35,234	$3 / $15	1M
144	130-161	qwen3-235b-a22b-thinking-2507	Alibaba · Apache 2.0	1399	±7		9,013	$0.23 / $2.30	262.1K
145	135-159	deepseek-r1	DeepSeek · MIT	1398	±5		18,524	$0.70 / $2.50	64K
146	135-159	qwen3.5-flash	Alibaba · Proprietary	1397	±4		58,370	N/A	N/A
147	136-162	deepseek-v3-0324	DeepSeek · MIT	1396	±4		45,603	$3 / $4.50	32.8K
148	136-163	qwen3.5-35b-a3b	Alibaba · Apache 2.0	1395	±4		29,110	$0.25 / $1.25	262.1K
149	135-167	qwen3-vl-235b-a22b-thinking	Alibaba · Apache 2.0	1395	±7		7,991	$0.40 / $4	131.1K
150	127-171	hunyuan-vision-1.5-thinking	Tencent · Proprietary	1395	±12		2,233	N/A	N/A
151	139-163	step-3.5-flash	StepFun · Apache 2.0	1394	±4		57,441	$0.10 / $0.30	262.1K
152	135-169	amazon-nova-experimental-chat-12-10	Amazon · Proprietary	1393	±10		3,703	N/A	N/A
153	142-165	mimo-v2-flash (non-thinking)	Xiaomi · MIT	1392	±4		46,619	$0.10 / $0.30	262.1K
154	143-169	minimax-m2.5	MiniMax · Modified MIT	1390	±4		41,032	$0.23 / $0.90	204.8K
155	144-169	o4-mini-2025-04-16	OpenAI · Proprietary	1390	±4		45,552	$1.10 / $4.40	200K
156	143-169	gpt-5-mini-high	OpenAI · Proprietary	1390	±5		27,151	$0.13 / $1	400K
157	144-169	claude-sonnet-4-20250514	Anthropic · Proprietary	1390	±4		40,425	$3 / $15	1M
158	144-169	o1-preview	OpenAI · Proprietary	1389	±5		31,122	$15 / $60	N/A
159	147-169	claude-3-7-sonnet-20250219-thinking-32k	Anthropic · Proprietary	1388	±4		38,871	$3 / $15	200K
160	146-171	qwen3-coder-480b-a35b-instruct	Alibaba · Apache 2.0	1388	±5		25,799	$0.40 / $1.60	262.1K
161	148-171	mistral-medium-2505	Mistral · Proprietary	1387	±5		33,281	$0.40 / $2	131.1K
162	143-174	hunyuan-t1-20250711	Tencent · Proprietary	1387	±9		4,716	N/A	N/A
163	146-171	mimo-v2-flash (thinking)	Xiaomi · MIT	1386	±6		10,983	$0.10 / $0.30	262.1K
164	150-173	minimax-m2.1-preview	MiniMax · MIT	1384	±5		17,157	$0.30 / $1.20	204.8K
165	152-173	qwen3-30b-a3b-instruct-2507	Alibaba · Apache 2.0	1383	±5		23,835	$0.05 / $0.19	262.1K
166	152-173	gpt-4.1-mini-2025-04-14	OpenAI · Proprietary	1383	±4		39,399	$0.40 / $1.60	1M
167	150-176	hunyuan-turbos-20250416	Tencent · Proprietary	1383	±6		10,737	N/A	N/A
168	159-176	gemini-2.5-flash-lite-preview-09-2025-no-thinking	Google · Proprietary	1380	±3		47,453	$0.10 / $0.40	1M
169	159-178	trinity-large-preview	Apache 2.0	1379	±4		29,892	$0.15 / $0.45	131K
170	151-186	glm-4.6v	Z.ai · MIT	1377	±11		2,818	$0.30 / $0.90	131.1K
171	151-187	solar-pro4	Upstage · Proprietary	1376	±12		2,442	$0.03 / $0.12	524.3K
172	163-180	qwen3-235b-a22b	Alibaba · Apache 2.0	1375	±5		26,339	$0.46 / $1.82	131.1K
173	163-180	gemini-2.5-flash-lite-preview-06-17-thinking	Google · Proprietary	1375	±5		33,027	$0.10 / $0.40	1M
174	166-180	qwen2.5-max	Alibaba · Proprietary	1374	±4		32,631	N/A	N/A
175	167-180	claude-3-5-sonnet-20241022	Anthropic · Proprietary	1374	±3		88,398	$3 / $15	200K
176	167-183	glm-4.5-air	Z.ai · MIT	1373	±4		31,201	$0.13 / $0.85	131.1K
177	169-183	claude-3-7-sonnet-20250219	Anthropic · Proprietary	1372	±4		43,232	$3 / $15	200K
178	169-189	qwen3-next-80b-a3b-thinking	Alibaba · Apache 2.0	1369	±6		13,750	$0.15 / $1.20	262.1K
179	170-186	trinity-large-thinking	Apache 2.0	1369	±5		28,994	$0.22 / $0.85	262.1K
180	170-191	glm-4.7-flash	Z.ai · MIT	1367	±6		11,756	$0.06 / $0.40	202.8K
181	174-189	gemma-3-27b-it	Google · Gemma	1366	±4		47,570	$0.08 / $0.45	262.1K
182	174-192	amazon-nova-experimental-chat-11-10	Amazon · Proprietary	1366	±4		25,431	N/A	N/A
183	174-195	o3-mini-high	OpenAI · Proprietary	1363	±5		18,589	$0.55 / $2.20	200K
184	176-195	minimax-m1	MiniMax · Apache 2.0	1363	±4		35,258	$0.55 / $2.20	1M
185	176-201	grok-3-mini-high	SpaceXAI · Proprietary	1362	±5		17,020	$0.25 / $1.27	N/A
186	176-208	nvidia-nemotron-3-super-120b-a12b	Nvidia · NVIDIA Open Model	1360	±7		7,539	N/A	N/A
187	179-199	gemini-2.0-flash-001	Google · Proprietary	1360	±4		43,796	$0.10 / $0.40	1M
188	179-205	deepseek-v3	DeepSeek · DeepSeek	1358	±5		21,770	$1.14 / $4.56	N/A
189	181-209	mistral-small-2506	Mistral · Apache 2.0	1357	±5		17,769	$0.10 / $0.30	32K
190	182-211	grok-3-mini-beta	SpaceXAI · Proprietary	1356	±5		22,775	$0.30 / $0.50	131.1K
191	178-214	intellect-3	MIT	1356	±8		5,365	$0.20 / $1.10	131.1K
192	185-213	command-a-03-2025	Cohere · CC-BY-NC-4.0	1354	±3		56,415	$2.50 / $10	256K
193	185-214	gemini-2.0-flash-lite-preview-02-05	Google · Proprietary	1354	±4		24,955	$0.07 / $0.30	1M
194	181-215	glm-4.5v	Z.ai · MIT	1353	±8		4,968	$0.60 / $1.80	65.5K
195	186-214	gpt-oss-120b	OpenAI · Apache 2.0	1352	±4		30,761	$0.03 / $0.17	131.1K
196	187-214	gemini-1.5-pro-002	Google · Proprietary	1351	±3		55,606	$3.50 / $10.50	2.1M
197	187-216	amazon-nova-experimental-chat-10-20	Amazon · Proprietary	1349	±6		11,542	N/A	N/A
198	183-225	hunyuan-turbos-20250226	Tencent · Proprietary	1349	±12		2,220	N/A	N/A
199	187-218	step-3	StepFun · Apache 2.0	1348	±7		6,560	$0.57 / $1.42	65.5K
200	183-225	nvidia-nemotron-3.5-lightning-30b-a3b-nvfp4	Nvidia · OpenMDW-1.1	1348	±11	Preliminary	3,389	N/A	N/A
201	190-215	o3-mini	OpenAI · Proprietary	1348	±4		57,446	$0.55 / $2.20	200K
202	183-227	llama-3.1-nemotron-ultra-253b-v1	Nvidia · Nvidia Open Model	1347	±12		2,549	$0.60 / $1.80	131.1K
203	185-226	amazon-nova-experimental-chat-10-09	Amazon · Proprietary	1347	±11		2,836	N/A	N/A
204	186-225	qwen3-32b	Alibaba · Apache 2.0	1347	±9		3,926	$0.08 / $0.28	131.1K
205	185-226	mercury-2	Inception AI · Proprietary	1347	±11		3,122	$0.25 / $0.75	128K
206	187-225	qwen-plus-0125	Alibaba · Proprietary	1346	±8		5,819	$0.40 / $1.20	131.1K
207	192-216	gpt-4o-2024-05-13	OpenAI · Proprietary	1346	±3		112,881	$5 / $15	128K
208	188-225	ling-flash-2.0	Ant Group · MIT	1346	±7		7,033	N/A	N/A
209	188-225	minimax-m2	MiniMax · Apache 2.0	1346	±8		6,913	$0.26 / $1.02	204.8K
210	188-229	nvidia-llama-3.3-nemotron-super-49b-v1.5	Nvidia · Nvidia Open	1343	±10		3,359	$0.10 / $0.40	131.1K
211	196-223	claude-3-5-sonnet-20240620	Anthropic · Proprietary	1343	±3		82,419	$3 / $15	200K
212	191-228	glm-4-plus-0111	Z.ai · Proprietary	1343	±8		5,760	N/A	N/A
213	190-229	gemma-3-12b-it	Google · Gemma	1342	±10		3,829	$0.05 / $0.15	131.1K
214	189-233	hunyuan-turbo-0110	Tencent · Proprietary	1341	±12		2,290	N/A	N/A
215	198-232	gpt-5-nano-high	OpenAI · Proprietary	1337	±7		8,292	$0.03 / $0.20	400K
216	201-228	o1-mini	OpenAI · Proprietary	1337	±4		51,981	$1.10 / $4.40	N/A
217	201-232	gemini-advanced-0514	Google · Proprietary	1336	±5		50,148	N/A	N/A
218	200-233	nova-2-lite	Amazon · Proprietary	1336	±6		12,294	$0.30 / $2.50	1M
219	202-229	grok-2-2024-08-13	SpaceXAI · Proprietary	1336	±4		63,498	$2 / $10	131.1K
220	201-232	qwq-32b	Alibaba · Apache 2.0	1336	±4		25,445	$0.50 / $1	16.4K
221	201-232	gpt-4o-2024-08-06	OpenAI · Proprietary	1335	±4		45,499	$2.50 / $10	128K
222	202-231	llama-3.1-405b-instruct-bf16	Meta · Llama 3.1 Community	1335	±4		41,375	$4 / $4	32.8K
223	200-239	step-2-16k-exp-202412	StepFun · Proprietary	1334	±9		4,833	N/A	N/A
224	208-233	llama-3.1-405b-instruct-fp8	Meta · Llama 3.1 Community	1333	±4		59,656	$4 / $4	32.8K
225	211-243	olmo-3.1-32b-instruct	Ai2 · Apache 2.0	1329	±6		12,274	$0.20 / $0.60	65.5K
226	191-264	molmo-2-8b	Ai2 · Apache 2.0	1329	±21		803	$0.20 / $0.20	36.9K
227	213-243	yi-lightning	Proprietary	1328	±5		27,332	N/A	N/A
228	201-255	llama-3.3-nemotron-49b-super-v1	Nvidia · Nvidia	1328	±12		2,218	N/A	N/A
229	217-244	llama-4-maverick-17b-128e-instruct	Meta · Llama 4	1327	±4		40,050	$0.63 / $1.80	131.1K
230	216-244	qwen3-30b-a3b	Alibaba · Apache 2.0	1327	±5		26,557	$0.13 / $0.52	131.1K
231	210-253	hunyuan-large-2025-02-10	Tencent · Proprietary	1326	±10		3,738	N/A	N/A
232	224-249	gpt-4-turbo-2024-04-09	OpenAI · Proprietary	1324	±4		98,114	$10 / $30	128K
233	224-248	claude-3-5-haiku-20241022	Anthropic · Proprietary	1324	±3		70,041	$1 / $5	200K
234	224-249	gemini-1.5-pro-001	Google · Proprietary	1324	±4		79,138	$3.50 / $10.50	2.1M
235	216-255	deepseek-v2.5-1210	DeepSeek · DeepSeek	1323	±8		6,795	N/A	N/A
236	224-252	llama-4-scout-17b-16e-instruct	Meta · Llama	1322	±5		30,384	$0.40 / $0.70	8.2K
237	221-255	gpt-4.1-nano-2025-04-14	OpenAI · Proprietary	1322	±8		6,103	$0.10 / $0.40	1M
238	225-250	claude-3-opus-20240229	Anthropic · Proprietary	1322	±3		194,909	$15 / $75	200K
239	224-257	ring-flash-2.0	Ant Group · MIT	1320	±7		7,163	N/A	N/A
240	224-257	step-1o-turbo-202506	StepFun · Proprietary	1320	±7		9,027	N/A	N/A
241	225-255	glm-4-plus	Z.ai · Proprietary	1319	±5		26,126	$0.44 / $1.76	204.8K
242	229-255	llama-3.3-70b-instruct	Meta · Llama-3.3	1318	±3		54,774	$0.10 / $0.32	131.1K
243	227-257	gemma-3n-e4b-it	Google · Gemma	1318	±5		22,628	$0.06 / $0.12	32.8K
244	225-258	qwen-max-0919	Alibaba · Qwen	1318	±6		16,478	$1.60 / $6.40	32.8K
245	229-255	gpt-4o-mini-2024-07-18	OpenAI · Proprietary	1318	±4		68,715	$0.15 / $0.60	128K
246	225-261	gpt-oss-20b	OpenAI · Apache 2.0	1318	±6		10,669	$0.03 / $0.13	131.1K
247	230-263	nvidia-nemotron-3-nano-30b-a3b-bf16	Nvidia · NVIDIA Open Model	1315	±6		15,581	$0.06 / $0.24	262.1K
248	229-263	qwen2.5-plus-1127	Alibaba · Proprietary	1315	±6		10,187	N/A	N/A
249	233-262	mistral-large-2407	Mistral · Mistral Research	1314	±4		45,459	$2 / $6	131.1K
250	233-263	athene-v2-chat	NexusFlow	1314	±5		24,739	N/A	N/A
251	234-263	gpt-4-0125-preview	OpenAI · Proprietary	1313	±4		93,439	$10 / $30	128K
252	235-263	gpt-4-1106-preview	OpenAI · Proprietary	1313	±4		100,105	$10 / $30	128K
253	229-267	hunyuan-standard-2025-02-10	Tencent · Proprietary	1311	±10		3,904	N/A	N/A
254	241-266	gemini-1.5-flash-002	Google · Proprietary	1309	±4		34,902	$0.07 / $0.30	1M
255	245-266	grok-2-mini-2024-08-13	SpaceXAI · Proprietary	1308	±4		52,567	$2 / $10	131.1K
256	245-267	deepseek-v2.5	DeepSeek · DeepSeek	1307	±5		24,572	N/A	N/A
257	245-267	athene-70b-0725	CC-BY-NC-4.0	1307	±6		19,621	N/A	N/A
258	232-275	mercury	Inception AI · Proprietary	1306	±14		1,972	$0.25 / $0.75	128K
259	235-271	granite-4.1-8b	IBM · Apache 2.0	1306	±10		4,029	$0.05 / $0.10	131.1K
260	247-267	mistral-large-2411	Mistral · MRL	1305	±4		28,073	$2 / $6	128K
261	241-268	olmo-3-32b-think	Ai2 · Apache 2.0	1305	±8		5,968	$0.15 / $0.50	65.5K
262	246-267	magistral-medium-2506	Mistral · Proprietary	1304	±6		11,665	$2 / $5	40K
263	252-267	mistral-small-3.1-24b-instruct-2503	Mistral · Apache 2.0	1304	±5		33,296	$0.10 / $0.30	32K
264	244-274	gemma-3-4b-it	Google · Gemma	1303	±9		4,171	$0.05 / $0.10	131.1K
265	253-267	qwen2.5-72b-instruct	Alibaba · Qwen	1303	±4		39,406	$1.20 / $1.20	N/A
266	253-277	llama-3.1-nemotron-70b-instruct	Nvidia · Llama 3.1	1299	±8		7,140	$1.20 / $1.20	131.1K
267	255-280	hunyuan-large-vision	Tencent · Proprietary	1294	±9		5,380	N/A	N/A
268	262-278	llama-3.1-70b-instruct	Meta · Llama 3.1 Community	1293	±4		55,240	$0.40 / $0.40	131.1K
269	264-279	amazon-nova-pro-v1.0	Amazon · Proprietary	1290	±5		24,745	$0.80 / $3.20	300K
270	263-282	jamba-1.5-large	Jamba Open	1289	±7		8,662	$2 / $8	256K
271	265-279	gemma-2-27b-it	Google · Gemma license	1289	±3		75,754	$0.65 / $0.65	8.2K
272	264-282	reka-core-20240904	Proprietary	1288	±7		7,312	N/A	N/A
273	266-281	gpt-4-0314	OpenAI · Proprietary	1287	±5		54,173	$30 / $60	8.2K
274	264-288	ibm-granite-h-small	IBM · Apache 2.0	1287	±8		5,719	N/A	N/A
275	267-282	gemini-1.5-flash-001	Google · Proprietary	1286	±5		62,833	$0.07 / $0.30	1M
276	263-288	llama-3.1-nemotron-51b-instruct	Nvidia · Llama 3.1	1286	±10		3,749	N/A	N/A
277	263-288	llama-3.1-tulu-3-70b	Ai2 · Llama 3.1	1286	±10		2,846	N/A	N/A
278	266-288	olmo-3.1-32b-think	Ai2 · Apache 2.0	1285	±7		8,550	$0.15 / $0.50	65.5K
279	270-288	claude-3-sonnet-20240229	Anthropic · Proprietary	1281	±4		109,284	$3 / $15	200K
280	268-288	gemma-2-9b-it-simpo	MIT	1280	±7		10,072	$0.03 / $0.09	8.2K
281	272-289	nemotron-4-340b-instruct	Nvidia · NVIDIA Open Model	1277	±5		19,659	N/A	N/A
282	275-288	llama-3-70b-instruct	Meta · Llama 3 Community	1276	±4		156,876	$0.51 / $0.74	8.2K
283	271-291	command-r-plus-08-2024	Cohere · CC-BY-NC-4.0	1276	±7		9,866	$2.50 / $10	128K
284	275-289	gpt-4-0613	OpenAI · Proprietary	1276	±4		88,723	$30 / $60	8.2K
285	275-291	mistral-small-24b-instruct-2501	Mistral · Apache 2.0	1274	±6		14,681	$0.05 / $0.08	32.8K
286	275-292	glm-4-0520	Z.ai · Proprietary	1273	±7		9,788	N/A	N/A
287	275-294	reka-flash-20240904	Proprietary	1272	±7		7,536	N/A	N/A
288	275-296	qwen2.5-coder-32b-instruct	Alibaba · Apache 2.0	1271	±8		5,432	$0.87 / $0.87	32K
289	282-297	c4ai-aya-expanse-32b	Cohere · CC-BY-NC-4.0	1267	±5		27,124	N/A	N/A
290	284-296	gemma-2-9b-it	Google · Gemma license	1267	±4		54,611	$0.03 / $0.09	8.2K
291	284-298	deepseek-coder-v2	DeepSeek · DeepSeek License	1265	±6		15,147	$0.14 / $0.28	128K
292	286-299	qwen2-72b-instruct	Alibaba · Qianwen LICENSE	1261	±5		37,325	$0.90 / $0.90	32.8K
293	287-298	command-r-plus	Cohere · CC-BY-NC-4.0	1261	±4		77,554	$2.50 / $10	128K
294	288-298	claude-3-haiku-20240307	Anthropic · Proprietary	1261	±4		117,701	$0.25 / $1.25	200K
295	287-299	amazon-nova-lite-v1.0	Amazon · Proprietary	1260	±5		19,372	$0.06 / $0.24	300K
296	288-299	gemini-1.5-flash-8b-001	Google · Proprietary	1259	±4		35,558	$0.07 / $0.30	1M
297	291-299	phi-4	Microsoft · MIT	1256	±5		24,126	$0.07 / $0.14	16.4K
298	290-305	olmo-2-0325-32b-instruct	Ai2 · Apache-2.0	1251	±11		3,334	$0.05 / $0.20	128K
299	294-305	command-r-08-2024	Cohere · CC-BY-NC-4.0	1250	±7		10,140	$0.15 / $0.60	128K
300	298-308	mistral-large-2402	Mistral · Proprietary	1242	±5		62,436	$4 / $12	32K
301	298-308	amazon-nova-micro-v1.0	Amazon · Proprietary	1241	±5		19,364	$0.04 / $0.14	128K
302	298-311	jamba-1.5-mini	Jamba Open	1240	±7		8,858	$0.20 / $0.40	256K
303	298-315	ministral-8b-2410	Mistral · MRL	1237	±9		4,781	$0.10 / $0.10	131.1K
304	298-315	gemini-pro-dev-api	Google · Proprietary	1236	±7		18,354	$0.35 / $1.05	32.8K
305	300-315	qwen1.5-110b-chat	Alibaba · Qianwen LICENSE	1234	±6		26,195	N/A	N/A
306	300-317	reka-flash-21b-20240226-online	Proprietary	1233	±7		15,450	N/A	N/A
307	298-318	hunyuan-standard-256k	Tencent · Proprietary	1233	±12		2,728	N/A	N/A
308	300-315	qwen1.5-72b-chat	Alibaba · Qianwen LICENSE	1233	±5		39,302	N/A	N/A
309	302-317	mixtral-8x22b-instruct-v0.1	Mistral · Apache 2.0	1229	±5		51,416	$0.90 / $0.90	65.5K
310	302-318	reka-flash-21b-20240226	Proprietary	1226	±6		24,806	N/A	N/A
311	303-318	command-r	Cohere · CC-BY-NC-4.0	1226	±5		54,036	$0.15 / $0.60	128K
312	303-318	gpt-3.5-turbo-0125	OpenAI · Proprietary	1225	±5		66,207	$0.50 / $1.50	16.4K
313	307-318	llama-3-8b-instruct	Meta · Llama 3 Community	1223	±4		104,642	$0.14 / $0.14	8.2K
314	302-322	gemini-pro	Google · Proprietary	1223	±12		6,390	$0.35 / $1.05	32.8K
315	303-320	c4ai-aya-expanse-8b	Cohere · CC-BY-NC-4.0	1223	±7		9,818	N/A	N/A
316	307-320	mistral-medium	Mistral · Proprietary	1222	±5		34,550	$2.70 / $8.10	32K
317	303-322	llama-3.1-tulu-3-8b	Ai2 · Llama 3.1	1220	±11		2,896	N/A	N/A
318	314-323	yi-1.5-34b-chat	Apache-2.0	1213	±5		24,146	N/A	N/A
319	309-325	zephyr-orpo-141b-A35b-v0.1	Apache 2.0	1213	±11		4,652	N/A	N/A
320	316-323	llama-3.1-8b-instruct	Meta · Llama 3.1 Community	1211	±4		49,605	$0.05 / $0.08	131.1K
321	314-329	granite-3.1-8b-instruct	IBM · Apache 2.0	1208	±11		3,090	N/A	N/A
322	318-329	qwen1.5-32b-chat	Alibaba · Qianwen LICENSE	1204	±6		21,741	N/A	N/A
323	316-330	gpt-3.5-turbo-1106	OpenAI · Proprietary	1204	±9		16,619	$1 / $2	16.4K
324	320-329	gemma-2-2b-it	Google · Gemma license	1200	±4		46,616	N/A	N/A
325	320-331	phi-3-medium-4k-instruct	Microsoft · MIT	1198	±5		25,055	$0.17 / $0.68	N/A
326	321-331	mixtral-8x7b-instruct-v0.1	Mistral · Apache 2.0	1197	±4		73,503	$0.63 / $0.63	32K
327	321-336	dbrx-instruct-preview	DBRX LICENSE	1195	±6		32,191	$0.60 / $0.60	32.8K
328	321-340	qwen1.5-14b-chat	Alibaba · Qianwen LICENSE	1191	±7		17,839	$0.30 / $0.30	N/A
329	321-340	internlm2_5-20b-chat	Other	1191	±7		9,901	$0 / $0	32.8K
330	324-347	deepseek-llm-67b-chat	DeepSeek · DeepSeek License	1184	±11		4,932	N/A	N/A
331	325-346	wizardlm-70b	Microsoft · Llama 2 Community	1184	±9		8,214	N/A	N/A
332	327-343	yi-34b-chat	Yi License	1183	±7		15,483	$0.90 / $0.90	4.1K
333	327-347	granite-3.0-8b-instruct	IBM · Apache 2.0	1183	±9		6,638	N/A	N/A
334	327-347	openchat-3.5	Apache-2.0	1183	±10		7,968	$0.20 / $0.20	N/A
335	327-346	openchat-3.5-0106	Apache-2.0	1182	±8		12,637	N/A	N/A
336	328-343	gemma-1.1-7b-it	Google · Gemma license	1182	±6		23,893	$0.03 / $0.09	8.2K
337	328-347	snowflake-arctic-instruct	Apache 2.0	1180	±6		32,832	N/A	N/A
338	327-347	granite-3.1-2b-instruct	IBM · Apache 2.0	1179	±11		3,188	N/A	N/A
339	328-347	tulu-2-dpo-70b	AI2 ImpACT Low-risk	1177	±10		6,535	N/A	N/A
340	328-351	openhermes-2.5-mistral-7b	Apache-2.0	1175	±10		5,006	$0.17 / $0.17	N/A
341	330-349	vicuna-33b	Non-commercial	1173	±6		22,479	$0 / $0	2K
342	330-353	starling-lm-7b-beta	Apache-2.0	1171	±7		16,056	N/A	N/A
343	330-351	phi-3-small-8k-instruct	Microsoft · MIT	1171	±6		17,766	$0.15 / $0.60	N/A
344	332-351	llama-2-70b-chat	Meta · Llama 2 Community	1170	±5		38,492	$0.70 / $2.80	4.1K
345	332-354	starling-lm-7b-alpha	CC-BY-NC-4.0	1167	±8		10,224	N/A	N/A
346	334-354	llama-3.2-3b-instruct	Meta · Llama 3.2	1167	±8		7,936	$0.05 / $0.33	131.1K
347	332-357	nous-hermes-2-mixtral-8x7b-dpo	Apache-2.0	1164	±12		3,777	$0.90 / $0.90	N/A
348	344-360	granite-3.0-2b-instruct	IBM · Apache 2.0	1156	±8		6,837	N/A	N/A
349	341-364	qwq-32b-preview	Alibaba · Apache 2.0	1154	±11		3,231	$0.50 / $1	16.4K
350	340-365	llama2-70b-steerlm-chat	Nvidia · Llama 2 Community	1154	±13		3,585	N/A	N/A
351	341-367	solar-10.7b-instruct-v1.0	CC-BY-NC-4.0	1152	±13		4,155	$0.30 / $0.30	N/A
352	340-369	dolphin-2.2.1-mistral-7b	Apache-2.0	1152	±15		1,679	$0.50 / $0.50	16.4K
353	345-367	mpt-30b-chat	CC-BY-NC-SA-4.0	1150	±12		2,572	N/A	N/A
354	347-365	wizardlm-13b	Microsoft · Llama 2 Community	1149	±9		7,044	$0.30 / $0.30	N/A
355	347-364	mistral-7b-instruct-v0.2	Mistral · Apache-2.0	1149	±7		19,402	$0.20 / $0.20	32.8K
356	344-371	falcon-180b-chat	Falcon-180B TII License	1148	±17		1,295	N/A	N/A
357	347-370	qwen1.5-7b-chat	Alibaba · Qianwen LICENSE	1144	±10		4,737	$0.20 / $0.20	N/A
358	348-369	phi-3-mini-4k-instruct-june-2024	Microsoft · MIT	1143	±6		12,297	$0.13 / $0.52	4.1K
359	348-369	llama-2-13b-chat	Meta · Llama 2 Community	1141	±7		19,174	$0.25 / $0.25	4.1K
360	349-369	vicuna-13b	Llama 2 Community	1141	±7		19,367	$0.30 / $0.30	N/A
361	348-372	qwen-14b-chat	Alibaba · Qianwen LICENSE	1139	±11		4,964	N/A	N/A
362	349-371	palm-2	Google · Proprietary	1138	±9		8,554	$0.50 / $0.50	25.8K
363	349-372	gemma-7b-it	Google · Gemma license	1137	±9		8,925	$0.05 / $0.08	8.2K
364	349-372	codellama-34b-instruct	Meta · Llama 2 Community	1136	±9		7,366	$0.35 / $1.40	16.4K
365	353-374	zephyr-7b-beta	MIT	1130	±9		11,118	$0.15 / $0.15	16.4K
366	355-374	phi-3-mini-128k-instruct	Microsoft · MIT	1129	±7		20,685	$0.13 / $0.52	N/A
367	359-374	phi-3-mini-4k-instruct	Microsoft · MIT	1128	±6		20,118	$0.13 / $0.52	N/A
368	353-376	guanaco-33b	Non-commercial	1127	±12		2,921	N/A	N/A
369	351-377	zephyr-7b-alpha	MIT	1127	±16		1,785	N/A	N/A
370	360-377	stripedhyena-nous-7b	Apache 2.0	1121	±11		5,182	$0.20 / $0.20	N/A
371	355-378	codellama-70b-instruct	Meta · Llama 2 Community	1119	±18		1,143	$0.70 / $2.80	16.4K
372	365-377	gemma-1.1-2b-it	Google · Gemma license	1116	±8		10,854	N/A	N/A
373	365-377	vicuna-7b	Llama 2 Community	1115	±9		6,923	$0.20 / $0.20	N/A
374	362-378	smollm2-1.7b-instruct	Apache 2.0	1114	±14		2,199	N/A	N/A
375	368-378	llama-3.2-1b-instruct	Meta · Llama 3.2	1111	±8		8,045	$0.03 / $0.20	60K
376	368-378	mistral-7b-instruct	Mistral · Apache 2.0	1110	±9		8,977	$0.07 / $0.28	4.1K
377	369-378	llama-2-7b-chat	Meta · Llama 2 Community	1108	±7		14,148	$0.15 / $0.15	4.1K
378	373-381	gemma-2b-it	Google · Gemma license	1093	±11		4,780	$0.10 / $0.10	N/A
379	378-381	qwen1.5-4b-chat	Alibaba · Qianwen LICENSE	1091	±9		7,597	$0.10 / $0.10	N/A
380	378-385	olmo-7b-instruct	Ai2 · Apache-2.0	1073	±11		6,328	$0.20 / $0.20	N/A
381	380-385	koala-13b	Non-commercial	1070	±10		6,965	N/A	N/A
382	380-385	alpaca-13b	Non-commercial	1069	±11		5,745	N/A	N/A
383	378-386	gpt4all-13b-snoozy	Non-commercial	1067	±15		1,743	N/A	N/A
384	380-386	mpt-7b-chat	CC-BY-NC-SA-4.0	1063	±12		3,924	N/A	N/A
385	380-386	chatglm3-6b	Apache-2.0	1056	±12		4,658	N/A	N/A
386	383-388	RWKV-4-Raven-14B	Apache 2.0	1042	±11		4,845	N/A	N/A
387	386-388	chatglm2-6b	Apache-2.0	1024	±14		2,658	N/A	N/A
388	386-388	oasst-pythia-12b	Apache 2.0	1023	±11		6,310	N/A	N/A
389	389-392	chatglm-6b	Non-commercial	995	±13		4,914	N/A	N/A
390	389-392	fastchat-t5-3b	Apache 2.0	992	±12		4,203	N/A	N/A
391	389-392	dolly-v2-12b	MIT	982	±13		3,412	N/A	N/A
392	389-393	llama-13b	Meta · Non-commercial	974	±16		2,391	$0.23 / $0.23	N/A
393	392-393	stablelm-tuned-alpha-7b	CC-BY-NC-SA-4.0	953	±13		3,287	N/A	N/A
```

## Category: Multi-Turn (adjustment: None)

Source: https://arena.ai, Text Arena leaderboard, Categories panel, "Multi-Turn" selected, Adjustments = None.
Date shown on page: Aug 19, 2026. Votes: 1,316,607. Models: 391. Captured row count: 391 (verified match).

```
1	1-27	muse-spark-1.2 (xHigh)	Meta · Proprietary	1519	±26		517	$1.25 / $4.25	N/A
2	1-10	claude-opus-4-6-high	Anthropic · Proprietary	1517	±7		12,367	$5 / $25	1M
3	1-10	claude-opus-4-7-high	Anthropic · Proprietary	1516	±7		10,602	$5 / $25	1M
4	1-12	claude-fable-5	Anthropic · Proprietary	1516	±10		3,978	$10 / $50	1M
5	1-12	claude-opus-4-7	Anthropic · Proprietary	1515	±7		10,904	$5 / $25	1M
6	1-13	claude-opus-4-6	Anthropic · Proprietary	1512	±6		13,561	$5 / $25	1M
7	3-27	claude-opus-4-8-high	Anthropic · Proprietary	1501	±8		7,812	$5 / $25	1M
8	1-51	gemini-3.7-flash-high	Google · Proprietary	1500	±21	Preliminary	884	$0.75 / $3.57	1M
9	1-40	kimi-k3-max	Moonshot · Kimi K3 license	1499	±13		2,275	N/A	N/A
10	3-38	muse-spark-1.1	Meta · Proprietary	1498	±11		3,092	$1.25 / $4.25	N/A
11	5-31	claude-opus-4-8	Anthropic · Proprietary	1498	±8		8,014	$5 / $25	1M
12	1-51	qwen3.8-max	Alibaba · Proprietary	1496	±16		1,426	$2 / $6	1M
13	6-36	gemini-3-pro	Google · Proprietary	1495	±8		6,826	$2 / $12	1M
14	1-68	glm-5.3-max	Z.ai · MIT	1495	±29		408	$1.40 / $4.40	1M
15	6-36	gpt-5.4-high	OpenAI · Proprietary	1494	±7		11,299	$2.50 / $15	1.1M
16	6-40	gpt-5.2-chat-latest-20260210	OpenAI · Proprietary	1494	±8		6,522	$1.75 / $14	128K
17	6-35	gemini-3.1-pro-preview	Google · Proprietary	1494	±6		17,053	$1 / $6	1M
18	6-55	muse-spark	Meta · Proprietary	1491	±13		2,183	N/A	N/A
19	6-51	claude-opus-5-high	Anthropic · Proprietary	1489	±10		4,079	$5 / $25	1M
20	6-55	gpt-5.6-sol-xhigh	OpenAI · Proprietary	1489	±11		3,076	$5 / $30	N/A
21	6-46	gpt-5.5-high	OpenAI · Proprietary	1489	±7		10,073	$2.50 / $15	1.1M
22	6-60	gemini-3.6-flash-high	Google · Proprietary	1487	±12		2,830	$0.38 / $1.88	1M
23	6-53	claude-opus-4-5-20251101-high-32k	Anthropic · Proprietary	1487	±8		6,518	$5 / $25	200K
24	6-56	gemini-3.5-flash-high	Google · Proprietary	1485	±9		4,945	$0.75 / $4.50	1M
25	8-55	claude-opus-4-5-20251101	Anthropic · Proprietary	1484	±6		12,686	$5 / $25	200K
26	8-61	gemini-3-flash	Google · Proprietary	1483	±9		5,372	$0.50 / $3	1M
27	8-62	gpt-5.5-instant	OpenAI · Proprietary	1483	±9		4,899	$2.50 / $15	1.1M
28	8-63	grok-4.20-beta1	SpaceXAI · Proprietary	1483	±10		4,402	N/A	N/A
29	9-60	gpt-5.5	OpenAI · Proprietary	1482	±7		10,524	$2.50 / $15	1.1M
30	6-78	qwen3.7-max-preview	Alibaba · Proprietary	1482	±23		660	$1.48 / $4.42	1M
31	6-68	claude-opus-5-max	Anthropic · Proprietary	1482	±14		1,927	$5 / $25	1M
32	10-62	gpt-5.4	OpenAI · Proprietary	1481	±7		12,011	$2.50 / $15	1.1M
33	12-62	claude-sonnet-4-6	Anthropic · Proprietary	1481	±7		12,025	$1.50 / $7.50	1M
34	12-62	grok-4.20-beta-0309-reasoning	SpaceXAI · Proprietary	1480	±7		11,433	$1.25 / $2.50	1M
35	9-64	gemini-3.5-flash-medium	Google · Proprietary	1480	±9		4,586	$0.75 / $4.50	1M
36	9-65	qwen3.5-max-preview	Alibaba · Proprietary	1480	±10		3,650	$1.20 / $6	N/A
37	13-64	glm-5.1	Z.ai · MIT	1479	±8		6,813	$1.40 / $4.40	202.8K
38	15-63	claude-sonnet-4-5-20250929	Anthropic · Proprietary	1479	±6		14,237	$3 / $15	200K
39	15-64	mimo-v2.5-pro	Xiaomi · MIT	1478	±7		9,371	$0.43 / $0.87	1.1M
40	15-65	deepseek-v4-pro	DeepSeek · MIT	1477	±7		9,841	$1.32 / $3.96	1M
41	13-69	grok-4.5	SpaceXAI · Proprietary	1476	±10		3,609	$2 / $6	500K
42	16-67	gemini-3-flash (thinking-minimal)	Google · Proprietary	1475	±6		15,564	$0.50 / $3	1M
43	16-68	grok-4.20-multi-agent-beta-0309	SpaceXAI · Proprietary	1474	±7		10,025	$1.25 / $2.50	1M
44	16-70	ernie-5.1	Baidu · Proprietary	1473	±8		6,434	N/A	N/A
45	16-70	glm-5	Z.ai · MIT	1473	±9		4,482	$1 / $3.20	202.8K
46	20-69	claude-opus-4-1-20250805-thinking-16k	Anthropic · Proprietary	1472	±7		8,629	$15 / $75	200K
47	15-74	gpt-5.6-terra-xhigh	OpenAI · Proprietary	1471	±11		3,210	$2.50 / $15	N/A
48	16-72	claude-sonnet-5-high	Anthropic · Proprietary	1471	±9		4,610	$1 / $5	1M
49	24-69	chatgpt-4o-latest-20250326	OpenAI · Proprietary	1470	±5		14,683	$5 / $15	128K
50	24-70	claude-sonnet-4-5-20250929-high-32k	Anthropic · Proprietary	1470	±6		14,129	$3 / $15	200K
51	19-74	glm-5.2-max	Z.ai · MIT	1470	±9		4,898	$1.40 / $4.40	1M
52	20-76	mimo-v2-pro	Xiaomi · Proprietary	1469	±9		4,415	$1 / $3	1M
53	24-72	gpt-5.4-mini-high	OpenAI · Proprietary	1469	±7		11,185	$0.75 / $4.50	400K
54	9-94	qwen3.6-max-preview	Alibaba · Proprietary	1469	±20		905	$1.03 / $6.16	262.1K
55	27-71	claude-opus-4-1-20250805	Anthropic · Proprietary	1469	±6		13,366	$15 / $75	200K
56	23-76	qwen3.7-plus	Alibaba · Proprietary	1468	±9		5,605	$0.32 / $1.28	1M
57	24-77	gpt-5.3-chat-latest	OpenAI · Proprietary	1468	±8		6,191	$1.75 / $14	128K
58	19-89	gpt-4.5-preview-2025-02-27	OpenAI · Proprietary	1466	±13		2,052	$75 / $150	128K
59	6-110	deepseek-v4-pro-high-20260813	DeepSeek · MIT	1465	±29		414	$1.32 / $3.96	N/A
60	15-94	gemma-4-31b	Google · Apache 2.0	1465	±18		1,077	$0.14 / $0.40	262.1K
61	26-89	gemini-3.5-flash-lite	Google · Proprietary	1463	±12		2,850	$0.15 / $1.25	1M
62	38-80	grok-4.1	SpaceXAI · Proprietary	1463	±6		12,412	N/A	N/A
63	36-82	gpt-5.1-high	OpenAI · Proprietary	1463	±8		7,178	$0.63 / $5	400K
64	15-99	hy3	Tencent · Apache 2.0	1462	±20		934	$0.13 / $0.53	262.1K
65	39-89	kimi-k2.6	Moonshot · Modified MIT	1460	±8		6,573	$0.95 / $4	262.1K
66	42-88	grok-4.1-thinking	SpaceXAI · Proprietary	1459	±6		12,179	N/A	N/A
67	33-96	glm-4.7	Z.ai · MIT	1458	±13		1,938	$0.40 / $1.75	204.8K
68	38-94	gpt-5.6-luna-xhigh	OpenAI · Proprietary	1458	±11		3,337	$1 / $6	N/A
69	48-94	deepseek-v4-pro-high-preview	DeepSeek · MIT	1456	±7		9,164	$1.32 / $3.96	1M
70	55-94	qwen3.5-397b-a17b	Alibaba · Apache 2.0	1453	±6		11,665	$0.39 / $2.34	262.1K
71	53-95	deepseek-v4-flash	DeepSeek · MIT	1453	±7		8,842	$0.44 / $1.32	1M
72	57-94	kimi-k2.5-thinking	Moonshot · Modified MIT	1452	±6		12,564	$0.60 / $3	N/A
73	53-96	minimax-m3	MiniMax · MiniMax Community License	1452	±8		7,286	$0.60 / $2.40	N/A
74	56-98	mimo-v2.5	Xiaomi · MIT	1451	±8		7,925	$0.14 / $0.28	1.1M
75	51-106	mimo-v2-omni	Xiaomi · Proprietary	1450	±11		3,291	$0.40 / $2	262.1K
76	57-102	gpt-5-chat	OpenAI · Proprietary	1449	±8		5,838	$1.25 / $10	N/A
77	59-96	gemini-2.5-pro	Google · Proprietary	1449	±5		21,361	$0.63 / $5	1M
78	59-99	dola-seed-2.0-pro	Bytedance · Proprietary	1449	±6		13,121	N/A	N/A
79	58-101	gpt-5.1	OpenAI · Proprietary	1448	±7		8,091	$0.63 / $5	400K
80	49-114	qwen3-max-2025-09-23	Alibaba · Proprietary	1448	±14		1,694	$0.78 / $3.90	262.1K
81	31-126	grok-4.6-high	SpaceXAI · Proprietary	1448	±25	Preliminary	572	$2 / $6	500K
82	58-105	qwen3.6-plus	Alibaba · Proprietary	1448	±8		8,031	$0.33 / $1.95	1M
83	45-117	gemma-4-26b-a4b	Google · Apache 2.0	1447	±17		1,093	N/A	N/A
84	59-107	deepseek-v4-flash-high-preview	DeepSeek · MIT	1446	±8		8,688	$0.44 / $1.32	1M
85	60-107	grok-4.3	SpaceXAI · Proprietary	1446	±7		10,893	$1.25 / $2.50	1M
86	59-111	qwen3-max-preview	Alibaba · Proprietary	1445	±9		4,684	$0.78 / $3.90	262.1K
87	63-107	gpt-5.2	OpenAI · Proprietary	1444	±6		15,129	$0.88 / $7	400K
88	59-115	inkling	Thinky · Apache 2.0	1443	±12		2,878	$1 / $4.05	524.3K
89	63-110	gpt-5.2-high	OpenAI · Proprietary	1443	±7		8,906	$0.88 / $7	400K
90	63-115	ernie-5.0-0110	Baidu · Proprietary	1441	±8		5,728	N/A	N/A
91	59-127	kimi-k2.5-instant	Moonshot · Modified MIT	1438	±15		1,473	$0.45 / $2.25	262.1K
92	70-118	claude-opus-4-20250514-thinking-16k	Anthropic · Proprietary	1437	±8		6,350	$15 / $75	200K
93	76-115	qwen3-235b-a22b-instruct-2507	Alibaba · Apache 2.0	1437	±5		17,123	$0.26 / $1.06	N/A
94	73-116	gemini-3.1-flash-lite-preview	Google · Proprietary	1437	±7		11,019	$0.25 / $1.50	1M
95	51-145	muse-glimmer	Meta · Apache-2.0	1437	±25		603	N/A	N/A
96	63-133	glm-5v-turbo	Z.ai · Proprietary	1433	±16		1,558	$1.20 / $4	202.8K
97	79-123	kimi-k2-thinking-turbo	Moonshot · Modified MIT	1433	±6		10,824	$1.15 / $8	262.1K
98	69-135	mistral-medium-3.5	Mistral · Modified MIT	1431	±14		1,808	$1.50 / $7.50	262.1K
99	78-127	longcat-flash-chat-2602-exp	Meituan · Proprietary	1431	±9		5,021	N/A	N/A
100	73-135	deepseek-v3.2-exp	DeepSeek · MIT	1430	±13		1,998	$0.27 / $0.41	163.8K
101	83-127	gpt-4.1-2025-04-14	OpenAI · Proprietary	1429	±7		9,003	$2 / $8	1M
102	85-130	claude-opus-4-20250514	Anthropic · Proprietary	1428	±8		7,763	$15 / $75	200K
103	74-143	ernie-5.0-preview-1203	Baidu · Proprietary	1428	±15		1,552	N/A	N/A
104	86-130	deepseek-v3.2	DeepSeek · MIT	1428	±7		8,315	$0.27 / $0.40	163.8K
105	63-155	amazon-nova-experimental-chat-26-02-10	Amazon · Proprietary	1427	±24		599	N/A	N/A
106	87-130	minimax-m2.7	MiniMax · Modified MIT	1427	±7		10,876	$0.30 / $1.20	204.8K
107	86-131	deepseek-v3.2-thinking	DeepSeek · MIT	1426	±8		6,914	$0.27 / $0.40	163.8K
108	91-130	claude-haiku-4-5-20251001	Anthropic · Proprietary	1425	±5		21,658	$1 / $5	200K
109	80-145	qwen3-vl-235b-a22b-instruct	Alibaba · Apache 2.0	1425	±14		2,026	$0.21 / $1.90	262.1K
110	78-151	grok-4-fast-chat	SpaceXAI · Proprietary	1424	±17		1,220	$3 / $15	256K
111	93-136	mistral-large-3	Mistral · Apache 2.0	1423	±6		10,677	$0.50 / $1.50	N/A
112	83-151	deepseek-v3.2-exp-thinking	DeepSeek · MIT	1422	±15		1,438	$0.27 / $0.41	163.8K
113	90-143	gpt-5-high	OpenAI · Proprietary	1421	±9		5,071	$0.63 / $5	400K
114	83-151	Inkling Small	Thinky · Apache 2.0	1421	±15		1,694	$0.45 / $1.20	524.3K
115	92-145	kimi-k2-0711-preview	Moonshot · Modified MIT	1421	±9		4,732	$0.60 / $2.50	131.1K
116	93-143	glm-4.6	Z.ai · MIT	1421	±8		5,709	$0.50 / $2	204.8K
117	93-145	claude-sonnet-4-20250514-thinking-32k	Anthropic · Proprietary	1420	±8		5,955	$3 / $15	1M
118	78-163	ernie-5.0-preview-1022	Baidu · Proprietary	1419	±21		710	N/A	N/A
119	94-143	o3-2025-04-16	OpenAI · Proprietary	1419	±7		9,981	$2 / $8	200K
120	93-147	qwen3.5-122b-a10b	Alibaba · Apache 2.0	1418	±9		4,969	$0.26 / $2.08	262.1K
121	76-166	deepseek-v3.1-terminus-thinking	DeepSeek · MIT	1418	±24		608	$0.27 / $1	163.8K
122	86-163	hunyuan-hy3-preview	Tencent · tencent-hunyuan-community	1416	±18		1,163	$0.29 / $1.17	262.1K
123	98-147	grok-4-1-fast-reasoning	SpaceXAI · Proprietary	1415	±6		10,278	$0.20 / $0.50	2M
124	98-151	gpt-5.4-nano-high	OpenAI · Proprietary	1414	±7		11,156	$0.20 / $1.25	400K
125	95-153	qwen3.5-27b	Alibaba · Apache 2.0	1414	±9		4,628	$0.20 / $1.56	262.1K
126	77-171	hunyuan-vision-1.5-thinking	Tencent · Proprietary	1414	±27		441	N/A	N/A
127	93-161	deepseek-v3.1-thinking	DeepSeek · MIT	1414	±14		1,899	$1.23 / $4.94	N/A
128	102-153	grok-4-0709	SpaceXAI · Proprietary	1412	±8		6,660	$3 / $15	256K
129	103-155	deepseek-v3-0324	DeepSeek · MIT	1411	±7		7,901	$3 / $4.50	32.8K
130	98-163	deepseek-r1	DeepSeek · MIT	1410	±12		2,418	$0.70 / $2.50	64K
131	104-161	qwen3-235b-a22b-no-thinking	Alibaba · Apache 2.0	1410	±8		6,796	$0.46 / $1.82	131.1K
132	103-161	grok-3-preview-02-24	SpaceXAI · Proprietary	1409	±9		4,793	$3 / $15	131.1K
133	107-155	mistral-medium-2508	Mistral · Proprietary	1409	±5		16,259	$0.40 / $2	131.1K
134	107-161	claude-sonnet-4-20250514	Anthropic · Proprietary	1408	±8		7,208	$3 / $15	1M
135	107-163	glm-4.5	Z.ai · MIT	1406	±10		3,923	$0.60 / $2.20	131.1K
136	106-164	deepseek-r1-0528	DeepSeek · MIT	1406	±11		2,977	$0.50 / $2.15	163.8K
137	104-166	deepseek-v3.1	DeepSeek · MIT	1406	±12		2,505	$1.23 / $4.94	N/A
138	107-166	grok-4-fast-reasoning	SpaceXAI · Proprietary	1404	±11		3,090	$0.20 / $0.50	2M
139	117-162	gemini-2.5-flash	Google · Proprietary	1404	±5		21,790	$0.15 / $1.25	1M
140	107-168	kimi-k2-0905-preview	Moonshot · Modified MIT	1403	±13		2,091	$0.60 / $2.50	262.1K
141	111-166	qwen3-next-80b-a3b-instruct	Alibaba · Apache 2.0	1403	±9		4,118	$0.09 / $1.10	262.1K
142	115-166	mistral-medium-2505	Mistral · Proprietary	1402	±8		5,864	$0.40 / $2	131.1K
143	94-179	amazon-nova-experimental-chat-26-01-10	Amazon · Proprietary	1400	±23		604	N/A	N/A
144	117-168	gemini-2.5-flash-preview-09-2025	Google · Proprietary	1400	±8		5,822	$0.30 / $2.50	1M
145	117-168	qwen3-coder-480b-a35b-instruct	Alibaba · Apache 2.0	1399	±9		4,433	$0.40 / $1.60	262.1K
146	107-171	nvidia-nemotron-3-ultra-550b-a55b-nvfp4	Nvidia · OpenMDW-1.1	1399	±15		1,686	N/A	N/A
147	121-168	claude-3-7-sonnet-20250219-thinking-32k	Anthropic · Proprietary	1398	±8		6,401	$3 / $15	200K
148	126-168	step-3.5-flash	StepFun · Apache 2.0	1397	±7		9,950	$0.10 / $0.30	262.1K
149	126-168	qwen3.5-flash	Alibaba · Proprietary	1396	±7		10,333	N/A	N/A
150	123-168	claude-3-7-sonnet-20250219	Anthropic · Proprietary	1396	±8		7,072	$3 / $15	200K
151	126-170	minimax-m2.5	MiniMax · Modified MIT	1395	±8		7,379	$0.23 / $0.90	204.8K
152	126-171	qwen3.5-35b-a3b	Alibaba · Apache 2.0	1394	±9		5,224	$0.25 / $1.25	262.1K
153	121-177	longcat-flash-chat	Meituan · MIT	1393	±13		2,033	$0.20 / $0.80	131.1K
154	107-188	deepseek-v3.1-terminus	DeepSeek · MIT	1393	±22		691	$0.27 / $1	163.8K
155	117-179	qwen3-235b-a22b-thinking-2507	Alibaba · Apache 2.0	1393	±15		1,406	$0.23 / $2.30	262.1K
156	94-198	solar-pro4	Upstage · Proprietary	1392	±31		376	$0.03 / $0.12	524.3K
157	130-171	gpt-4.1-mini-2025-04-14	OpenAI · Proprietary	1392	±8		7,230	$0.40 / $1.60	1M
158	126-177	minimax-m2.1-preview	MiniMax · MIT	1391	±11		2,888	$0.30 / $1.20	204.8K
159	123-181	hunyuan-turbos-20250416	Tencent · Proprietary	1390	±14		1,720	N/A	N/A
160	131-176	o1-preview	OpenAI · Proprietary	1390	±9		5,871	$15 / $60	N/A
161	111-190	amazon-nova-experimental-chat-12-10	Amazon · Proprietary	1389	±23		635	N/A	N/A
162	135-173	mimo-v2-flash (non-thinking)	Xiaomi · MIT	1389	±7		8,298	$0.10 / $0.30	262.1K
163	136-172	claude-3-5-sonnet-20241022	Anthropic · Proprietary	1389	±6		16,062	$3 / $15	200K
164	115-191	hunyuan-t1-20250711	Tencent · Proprietary	1388	±22		690	N/A	N/A
165	126-188	qwen3-vl-235b-a22b-thinking	Alibaba · Apache 2.0	1386	±16		1,296	$0.40 / $4	131.1K
166	136-180	o1-2024-12-17	OpenAI · Proprietary	1386	±9		4,399	$15 / $60	200K
167	141-185	qwen3-30b-a3b-instruct-2507	Alibaba · Apache 2.0	1382	±9		4,097	$0.05 / $0.19	262.1K
168	148-185	o4-mini-2025-04-16	OpenAI · Proprietary	1381	±7		7,962	$1.10 / $4.40	200K
169	149-189	trinity-large-preview	Apache 2.0	1378	±9		5,346	$0.15 / $0.45	131K
170	148-198	mimo-v2-flash (thinking)	Xiaomi · MIT	1374	±13		1,915	$0.10 / $0.30	262.1K
171	155-190	gemini-2.5-flash-lite-preview-09-2025-no-thinking	Google · Proprietary	1374	±7		8,266	$0.10 / $0.40	1M
172	153-196	deepseek-v3	DeepSeek · DeepSeek	1373	±10		3,747	$1.14 / $4.56	N/A
173	154-196	gpt-5-mini-high	OpenAI · Proprietary	1373	±9		4,495	$0.13 / $1	400K
174	155-194	qwen2.5-max	Alibaba · Proprietary	1373	±8		4,879	N/A	N/A
175	156-198	qwen3-235b-a22b	Alibaba · Apache 2.0	1371	±9		4,304	$0.46 / $1.82	131.1K
176	160-199	glm-4.5-air	Z.ai · MIT	1368	±8		5,155	$0.13 / $0.85	131.1K
177	162-201	gemini-2.5-flash-lite-preview-06-17-thinking	Google · Proprietary	1367	±8		5,709	$0.10 / $0.40	1M
178	141-213	glm-4.6v	Z.ai · MIT	1366	±26		485	$0.30 / $0.90	131.1K
179	162-205	mistral-small-2506	Mistral · Apache 2.0	1365	±11		3,101	$0.10 / $0.30	32K
180	155-211	minimax-m2	MiniMax · Apache 2.0	1364	±17		1,126	$0.26 / $1.02	204.8K
181	161-208	glm-4.7-flash	Z.ai · MIT	1363	±13		2,122	$0.06 / $0.40	202.8K
182	169-205	command-a-03-2025	Cohere · CC-BY-NC-4.0	1360	±7		9,519	$2.50 / $10	256K
183	158-216	intellect-3	MIT	1359	±20		789	$0.20 / $1.10	131.1K
184	158-217	glm-4.5v	Z.ai · MIT	1358	±20		896	$0.60 / $1.80	65.5K
185	170-208	gemma-3-27b-it	Google · Gemma	1358	±7		7,038	$0.08 / $0.45	262.1K
186	170-208	gemini-2.0-flash-001	Google · Proprietary	1357	±7		6,952	$0.10 / $0.40	1M
187	171-209	minimax-m1	MiniMax · Apache 2.0	1356	±8		5,728	$0.55 / $2.20	1M
188	164-225	qwen-plus-0125	Alibaba · Proprietary	1353	±19		842	$0.40 / $1.20	131.1K
189	173-217	qwen3-next-80b-a3b-thinking	Alibaba · Apache 2.0	1351	±13		2,304	$0.15 / $1.20	262.1K
190	162-239	amazon-nova-experimental-chat-10-09	Amazon · Proprietary	1349	±26		487	N/A	N/A
191	170-226	nvidia-nemotron-3-super-120b-a12b	Nvidia · NVIDIA Open Model	1349	±16		1,320	N/A	N/A
192	178-216	trinity-large-thinking	Apache 2.0	1349	±9		5,384	$0.22 / $0.85	262.1K
193	178-213	claude-3-5-sonnet-20240620	Anthropic · Proprietary	1348	±7		14,950	$3 / $15	200K
194	177-218	grok-3-mini-high	SpaceXAI · Proprietary	1348	±11		2,888	$0.25 / $1.27	N/A
195	178-225	o3-mini-high	OpenAI · Proprietary	1345	±12		2,535	$0.55 / $2.20	200K
196	166-245	gemma-3-12b-it	Google · Gemma	1344	±26		471	$0.05 / $0.15	131.1K
197	164-247	nvidia-nemotron-3.5-lightning-30b-a3b-nvfp4	Nvidia · OpenMDW-1.1	1344	±28	Preliminary	531	N/A	N/A
198	180-224	amazon-nova-experimental-chat-11-10	Amazon · Proprietary	1343	±9		4,113	N/A	N/A
199	162-248	hunyuan-turbos-20250226	Tencent · Proprietary	1343	±33		293	N/A	N/A
200	180-225	grok-3-mini-beta	SpaceXAI · Proprietary	1343	±10		3,902	$0.30 / $0.50	131.1K
201	167-246	mercury-2	Inception AI · Proprietary	1342	±25		539	$0.25 / $0.75	128K
202	177-238	step-3	StepFun · Apache 2.0	1342	±18		1,120	$0.57 / $1.42	65.5K
203	164-248	llama-3.1-nemotron-ultra-253b-v1	Nvidia · Nvidia Open Model	1342	±30		374	$0.60 / $1.80	131.1K
204	171-246	nvidia-llama-3.3-nemotron-super-49b-v1.5	Nvidia · Nvidia Open	1340	±24		569	$0.10 / $0.40	131.1K
205	184-225	gpt-4o-2024-05-13	OpenAI · Proprietary	1340	±7		20,434	$5 / $15	128K
206	185-225	o3-mini	OpenAI · Proprietary	1340	±7		9,532	$0.55 / $2.20	200K
207	184-228	llama-3.1-405b-instruct-bf16	Meta · Llama 3.1 Community	1339	±8		6,797	$4 / $4	32.8K
208	176-248	qwen3-32b	Alibaba · Apache 2.0	1337	±23		590	$0.08 / $0.28	131.1K
209	183-243	amazon-nova-experimental-chat-10-20	Amazon · Proprietary	1335	±14		1,910	N/A	N/A
210	180-248	glm-4-plus-0111	Z.ai · Proprietary	1333	±19		851	N/A	N/A
211	173-266	llama-3.3-nemotron-49b-super-v1	Nvidia · Nvidia	1331	±32		301	N/A	N/A
212	187-243	yi-lightning	Proprietary	1330	±10		4,748	N/A	N/A
213	192-243	llama-3.1-405b-instruct-fp8	Meta · Llama 3.1 Community	1329	±7		11,136	$4 / $4	32.8K
214	192-243	gemini-1.5-pro-002	Google · Proprietary	1329	±7		10,053	$3.50 / $10.50	2.1M
215	187-248	olmo-3.1-32b-instruct	Ai2 · Apache 2.0	1327	±13		2,240	$0.20 / $0.60	65.5K
216	192-245	gpt-oss-120b	OpenAI · Apache 2.0	1327	±9		5,040	$0.03 / $0.17	131.1K
217	192-246	gemini-2.0-flash-lite-preview-02-05	Google · Proprietary	1327	±10		3,586	$0.07 / $0.30	1M
218	198-243	claude-3-5-haiku-20241022	Anthropic · Proprietary	1327	±6		11,548	$1 / $5	200K
219	192-245	gpt-4o-2024-08-06	OpenAI · Proprietary	1326	±8		8,201	$2.50 / $10	128K
220	178-266	hunyuan-turbo-0110	Tencent · Proprietary	1326	±29		323	N/A	N/A
221	185-248	step-1o-turbo-202506	StepFun · Proprietary	1326	±16		1,397	N/A	N/A
222	199-246	llama-4-maverick-17b-128e-instruct	Meta · Llama 4	1325	±8		6,862	$0.63 / $1.80	131.1K
223	200-246	grok-2-2024-08-13	SpaceXAI · Proprietary	1324	±7		10,743	$2 / $10	131.1K
224	187-251	gpt-5-nano-high	OpenAI · Proprietary	1324	±16		1,459	$0.03 / $0.20	400K
225	191-248	nova-2-lite	Amazon · Proprietary	1324	±13		2,090	$0.30 / $2.50	1M
226	200-247	o1-mini	OpenAI · Proprietary	1323	±7		9,326	$1.10 / $4.40	N/A
227	189-253	deepseek-v2.5-1210	DeepSeek · DeepSeek	1322	±16		1,178	N/A	N/A
228	200-248	qwq-32b	Alibaba · Apache 2.0	1322	±9		3,859	$0.50 / $1	16.4K
229	200-248	claude-3-opus-20240229	Anthropic · Proprietary	1321	±6		31,134	$15 / $75	200K
230	200-248	gemini-advanced-0514	Google · Proprietary	1321	±10		7,776	N/A	N/A
231	200-248	qwen3-30b-a3b	Alibaba · Apache 2.0	1320	±9		4,534	$0.13 / $0.52	131.1K
232	200-248	llama-4-scout-17b-16e-instruct	Meta · Llama	1320	±9		5,398	$0.40 / $0.70	8.2K
233	202-248	llama-3.3-70b-instruct	Meta · Llama-3.3	1317	±7		9,155	$0.10 / $0.32	131.1K
234	193-265	ling-flash-2.0	Ant Group · MIT	1316	±17		1,167	N/A	N/A
235	202-251	gemini-1.5-pro-001	Google · Proprietary	1316	±8		13,712	$3.50 / $10.50	2.1M
236	199-267	gpt-4.1-nano-2025-04-14	OpenAI · Proprietary	1314	±18		1,000	$0.10 / $0.40	1M
237	202-255	glm-4-plus	Z.ai · Proprietary	1314	±9		4,844	$0.44 / $1.76	204.8K
238	207-255	gpt-4-turbo-2024-04-09	OpenAI · Proprietary	1312	±7		15,255	$10 / $30	128K
239	200-266	magistral-medium-2506	Mistral · Proprietary	1312	±15		1,660	$2 / $5	40K
240	192-269	hunyuan-large-2025-02-10	Tencent · Proprietary	1312	±25		510	N/A	N/A
241	210-255	gpt-4o-mini-2024-07-18	OpenAI · Proprietary	1311	±7		12,286	$0.15 / $0.60	128K
242	200-269	step-2-16k-exp-202412	StepFun · Proprietary	1307	±20		805	N/A	N/A
243	207-269	qwen2.5-plus-1127	Alibaba · Proprietary	1307	±13		1,789	N/A	N/A
244	217-266	athene-v2-chat	NexusFlow	1306	±9		4,304	N/A	N/A
245	215-269	qwen-max-0919	Alibaba · Qwen	1305	±11		3,105	$1.60 / $6.40	32.8K
246	202-279	olmo-3-32b-think	Ai2 · Apache 2.0	1301	±21		821	$0.15 / $0.50	65.5K
247	201-280	hunyuan-standard-2025-02-10	Tencent · Proprietary	1300	±24		570	N/A	N/A
248	232-269	qwen2.5-72b-instruct	Alibaba · Qwen	1299	±8		7,250	$1.20 / $1.20	N/A
249	233-269	gpt-4-1106-preview	OpenAI · Proprietary	1298	±8		14,867	$10 / $30	128K
250	200-285	mercury	Inception AI · Proprietary	1298	±32		341	$0.25 / $0.75	128K
251	230-273	nvidia-nemotron-3-nano-30b-a3b-bf16	Nvidia · NVIDIA Open Model	1297	±12		2,633	$0.06 / $0.24	262.1K
252	236-269	grok-2-mini-2024-08-13	SpaceXAI · Proprietary	1296	±7		9,399	$2 / $10	131.1K
253	236-269	mistral-large-2407	Mistral · Mistral Research	1296	±8		8,296	$2 / $6	131.1K
254	232-274	athene-70b-0725	CC-BY-NC-4.0	1295	±11		3,344	N/A	N/A
255	236-274	mistral-large-2411	Mistral · MRL	1293	±9		4,438	$2 / $6	128K
256	230-280	llama-3.1-nemotron-70b-instruct	Nvidia · Llama 3.1	1293	±17		1,227	$1.20 / $1.20	131.1K
257	236-276	gemma-3n-e4b-it	Google · Gemma	1292	±10		3,432	$0.06 / $0.12	32.8K
258	236-275	deepseek-v2.5	DeepSeek · DeepSeek	1292	±10		4,473	N/A	N/A
259	237-274	gpt-4-0125-preview	OpenAI · Proprietary	1291	±8		14,381	$10 / $30	128K
260	236-275	mistral-small-3.1-24b-instruct-2503	Mistral · Apache 2.0	1291	±9		5,600	$0.10 / $0.30	32K
261	233-280	gpt-oss-20b	OpenAI · Apache 2.0	1291	±14		1,851	$0.03 / $0.13	131.1K
262	242-276	llama-3.1-70b-instruct	Meta · Llama 3.1 Community	1288	±7		10,405	$0.40 / $0.40	131.1K
263	230-287	granite-4.1-8b	IBM · Apache 2.0	1285	±25		672	$0.05 / $0.10	131.1K
264	236-286	ibm-granite-h-small	IBM · Apache 2.0	1282	±20		987	N/A	N/A
265	236-285	ring-flash-2.0	Ant Group · MIT	1282	±17		1,219	N/A	N/A
266	236-287	hunyuan-large-vision	Tencent · Proprietary	1281	±19		971	N/A	N/A
267	250-281	gemma-2-27b-it	Google · Gemma license	1279	±7		13,588	$0.65 / $0.65	8.2K
268	236-288	llama-3.1-tulu-3-70b	Ai2 · Llama 3.1	1278	±23		537	N/A	N/A
269	250-283	claude-3-sonnet-20240229	Anthropic · Proprietary	1277	±8		17,062	$3 / $15	200K
270	250-285	amazon-nova-pro-v1.0	Amazon · Proprietary	1277	±9		4,060	$0.80 / $3.20	300K
271	251-285	gemini-1.5-flash-002	Google · Proprietary	1276	±8		6,324	$0.07 / $0.30	1M
272	241-288	llama-3.1-nemotron-51b-instruct	Nvidia · Llama 3.1	1276	±20		781	N/A	N/A
273	256-286	gpt-4-0314	OpenAI · Proprietary	1273	±10		7,992	$30 / $60	8.2K
274	258-285	llama-3-70b-instruct	Meta · Llama 3 Community	1273	±7		21,421	$0.51 / $0.74	8.2K
275	242-292	gemma-3-4b-it	Google · Gemma	1272	±24		565	$0.05 / $0.10	131.1K
276	250-288	gemma-2-9b-it-simpo	MIT	1271	±15		1,660	$0.03 / $0.09	8.2K
277	259-287	gemini-1.5-flash-001	Google · Proprietary	1269	±8		11,065	$0.07 / $0.30	1M
278	258-292	jamba-1.5-large	Jamba Open	1266	±15		1,634	$2 / $8	256K
279	254-293	olmo-3.1-32b-think	Ai2 · Apache 2.0	1265	±18		1,228	$0.15 / $0.50	65.5K
280	258-292	reka-core-20240904	Proprietary	1264	±16		1,255	N/A	N/A
281	263-288	gpt-4-0613	OpenAI · Proprietary	1261	±8		13,168	$30 / $60	8.2K
282	262-294	glm-4-0520	Z.ai · Proprietary	1258	±15		1,631	N/A	N/A
283	264-294	nemotron-4-340b-instruct	Nvidia · NVIDIA Open Model	1257	±12		3,098	N/A	N/A
284	274-294	gemma-2-9b-it	Google · Gemma license	1251	±7		9,730	$0.03 / $0.09	8.2K
285	264-297	qwen2.5-coder-32b-instruct	Alibaba · Apache 2.0	1251	±18		1,024	$0.87 / $0.87	32K
286	269-296	command-r-plus-08-2024	Cohere · CC-BY-NC-4.0	1249	±14		1,826	$2.50 / $10	128K
287	271-296	mistral-small-24b-instruct-2501	Mistral · Apache 2.0	1249	±13		2,151	$0.05 / $0.08	32.8K
288	278-296	claude-3-haiku-20240307	Anthropic · Proprietary	1244	±7		19,344	$0.25 / $1.25	200K
289	278-297	qwen2-72b-instruct	Alibaba · Qianwen LICENSE	1243	±9		6,698	$0.90 / $0.90	32.8K
290	263-308	olmo-2-0325-32b-instruct	Ai2 · Apache-2.0	1243	±29		363	$0.05 / $0.20	128K
291	278-298	phi-4	Microsoft · MIT	1241	±10		3,517	$0.07 / $0.14	16.4K
292	282-299	command-r-plus	Cohere · CC-BY-NC-4.0	1237	±8		12,101	$2.50 / $10	128K
293	278-304	reka-flash-20240904	Proprietary	1237	±16		1,302	N/A	N/A
294	281-303	deepseek-coder-v2	DeepSeek · DeepSeek License	1235	±12		2,683	$0.14 / $0.28	128K
295	285-303	c4ai-aya-expanse-32b	Cohere · CC-BY-NC-4.0	1232	±9		5,170	N/A	N/A
296	285-307	amazon-nova-lite-v1.0	Amazon · Proprietary	1228	±11		3,166	$0.06 / $0.24	300K
297	288-307	mistral-large-2402	Mistral · Proprietary	1225	±9		9,521	$4 / $12	32K
298	291-309	gemini-1.5-flash-8b-001	Google · Proprietary	1221	±8		6,665	$0.07 / $0.30	1M
299	292-310	qwen1.5-72b-chat	Alibaba · Qianwen LICENSE	1217	±10		5,502	N/A	N/A
300	292-317	qwen1.5-110b-chat	Alibaba · Qianwen LICENSE	1212	±11		3,740	N/A	N/A
301	292-318	command-r-08-2024	Cohere · CC-BY-NC-4.0	1212	±14		1,851	$0.15 / $0.60	128K
302	295-318	amazon-nova-micro-v1.0	Amazon · Proprietary	1210	±11		3,069	$0.04 / $0.14	128K
303	290-322	hunyuan-standard-256k	Tencent · Proprietary	1208	±25		532	N/A	N/A
304	292-319	ministral-8b-2410	Mistral · MRL	1207	±19		916	$0.10 / $0.10	131.1K
305	298-319	llama-3-8b-instruct	Meta · Llama 3 Community	1205	±8		14,815	$0.14 / $0.14	8.2K
306	295-319	jamba-1.5-mini	Jamba Open	1205	±15		1,639	$0.20 / $0.40	256K
307	295-319	reka-flash-21b-20240226-online	Proprietary	1204	±15		2,021	N/A	N/A
308	299-319	gpt-3.5-turbo-0125	OpenAI · Proprietary	1200	±9		10,274	$0.50 / $1.50	16.4K
309	297-322	c4ai-aya-expanse-8b	Cohere · CC-BY-NC-4.0	1199	±14		1,746	N/A	N/A
310	300-319	llama-3.1-8b-instruct	Meta · Llama 3.1 Community	1198	±8		8,930	$0.05 / $0.08	131.1K
311	294-330	gemini-pro	Google · Proprietary	1197	±25		641	$0.35 / $1.05	32.8K
312	300-319	command-r	Cohere · CC-BY-NC-4.0	1197	±9		8,273	$0.15 / $0.60	128K
313	300-322	mistral-medium	Mistral · Proprietary	1195	±11		4,621	$2.70 / $8.10	32K
314	300-324	reka-flash-21b-20240226	Proprietary	1193	±12		3,366	N/A	N/A
315	300-325	qwen1.5-32b-chat	Alibaba · Qianwen LICENSE	1192	±12		3,140	N/A	N/A
316	301-326	yi-1.5-34b-chat	Apache-2.0	1189	±11		3,391	N/A	N/A
317	303-326	mixtral-8x22b-instruct-v0.1	Mistral · Apache 2.0	1188	±9		7,764	$0.90 / $0.90	65.5K
318	300-330	gemini-pro-dev-api	Google · Proprietary	1187	±15		2,528	$0.35 / $1.05	32.8K
319	300-343	llama-3.1-tulu-3-8b	Ai2 · Llama 3.1	1178	±25		520	N/A	N/A
320	310-335	dbrx-instruct-preview	DBRX LICENSE	1174	±12		4,918	$0.60 / $0.60	32.8K
321	310-341	gpt-3.5-turbo-1106	OpenAI · Proprietary	1170	±16		2,374	$1 / $2	16.4K
322	317-336	mixtral-8x7b-instruct-v0.1	Mistral · Apache 2.0	1167	±9		10,873	$0.63 / $0.63	32K
323	314-343	internlm2_5-20b-chat	Other	1166	±15		1,751	$0 / $0	32.8K
324	310-345	wizardlm-70b	Microsoft · Llama 2 Community	1165	±19		1,178	N/A	N/A
325	315-343	qwen1.5-14b-chat	Alibaba · Qianwen LICENSE	1165	±14		2,568	$0.30 / $0.30	N/A
326	319-340	gemma-2-2b-it	Google · Gemma license	1163	±8		7,933	N/A	N/A
327	317-345	yi-34b-chat	Yi License	1161	±15		1,947	$0.90 / $0.90	4.1K
328	313-352	zephyr-orpo-141b-A35b-v0.1	Apache 2.0	1158	±24		683	N/A	N/A
329	313-353	granite-3.1-8b-instruct	IBM · Apache 2.0	1156	±26		551	N/A	N/A
330	317-348	openchat-3.5	Apache-2.0	1156	±19		1,167	$0.20 / $0.20	N/A
331	319-348	openchat-3.5-0106	Apache-2.0	1152	±15		1,801	N/A	N/A
332	317-354	deepseek-llm-67b-chat	DeepSeek · DeepSeek License	1152	±24		620	N/A	N/A
333	319-352	llama-3.2-3b-instruct	Meta · Llama 3.2	1149	±17		1,299	$0.05 / $0.33	131.1K
334	320-353	starling-lm-7b-beta	Apache-2.0	1145	±15		2,151	N/A	N/A
335	319-357	qwq-32b-preview	Alibaba · Apache 2.0	1144	±27		487	$0.50 / $1	16.4K
336	319-357	granite-3.1-2b-instruct	IBM · Apache 2.0	1143	±27		579	N/A	N/A
337	322-353	snowflake-arctic-instruct	Apache 2.0	1143	±13		3,963	N/A	N/A
338	323-354	vicuna-33b	Non-commercial	1140	±13		3,114	$0 / $0	2K
339	326-354	phi-3-medium-4k-instruct	Microsoft · MIT	1139	±11		3,824	$0.17 / $0.68	N/A
340	321-357	granite-3.0-8b-instruct	IBM · Apache 2.0	1136	±20		1,148	N/A	N/A
341	321-360	openhermes-2.5-mistral-7b	Apache-2.0	1135	±22		722	$0.17 / $0.17	N/A
342	321-359	tulu-2-dpo-70b	AI2 ImpACT Low-risk	1135	±21		827	N/A	N/A
343	328-356	llama-2-70b-chat	Meta · Llama 2 Community	1134	±11		5,533	$0.70 / $2.80	4.1K
344	326-357	starling-lm-7b-alpha	CC-BY-NC-4.0	1133	±18		1,270	N/A	N/A
345	323-364	nous-hermes-2-mixtral-8x7b-dpo	Apache-2.0	1128	±26		467	$0.90 / $0.90	N/A
346	321-368	mpt-30b-chat	CC-BY-NC-SA-4.0	1124	±32		341	N/A	N/A
347	330-360	gemma-1.1-7b-it	Google · Gemma license	1124	±12		3,635	$0.03 / $0.09	8.2K
348	332-363	phi-3-small-8k-instruct	Microsoft · MIT	1119	±12		3,115	$0.15 / $0.60	N/A
349	330-366	granite-3.0-2b-instruct	IBM · Apache 2.0	1116	±19		1,162	N/A	N/A
350	328-370	qwen1.5-7b-chat	Alibaba · Qianwen LICENSE	1113	±25		589	$0.20 / $0.20	N/A
351	338-364	mistral-7b-instruct-v0.2	Mistral · Apache-2.0	1113	±13		2,566	$0.20 / $0.20	32.8K
352	328-370	llama2-70b-steerlm-chat	Nvidia · Llama 2 Community	1111	±28		451	N/A	N/A
353	330-370	solar-10.7b-instruct-v1.0	CC-BY-NC-4.0	1110	±25		601	$0.30 / $0.30	N/A
354	335-370	wizardlm-13b	Microsoft · Llama 2 Community	1110	±20		983	$0.30 / $0.30	N/A
355	343-370	vicuna-13b	Llama 2 Community	1100	±14		2,552	$0.30 / $0.30	N/A
356	343-370	llama-2-13b-chat	Meta · Llama 2 Community	1100	±14		2,596	$0.25 / $0.25	4.1K
357	344-370	phi-3-mini-4k-instruct-june-2024	Microsoft · MIT	1098	±15		1,839	$0.13 / $0.52	4.1K
358	330-380	falcon-180b-chat	Falcon-180B TII License	1096	±40		207	N/A	N/A
359	339-374	qwen-14b-chat	Alibaba · Qianwen LICENSE	1095	±23		753	N/A	N/A
360	346-374	palm-2	Google · Proprietary	1090	±20		1,163	$0.50 / $0.50	25.8K
361	346-374	zephyr-7b-beta	MIT	1090	±18		1,574	$0.15 / $0.15	16.4K
362	338-380	dolphin-2.2.1-mistral-7b	Apache-2.0	1084	±41		208	$0.50 / $0.50	16.4K
363	349-377	mistral-7b-instruct	Mistral · Apache 2.0	1080	±19		1,259	$0.07 / $0.28	4.1K
364	351-377	llama-2-7b-chat	Meta · Llama 2 Community	1077	±15		1,851	$0.15 / $0.15	4.1K
365	350-380	llama-3.2-1b-instruct	Meta · Llama 3.2	1075	±19		1,236	$0.03 / $0.20	60K
366	349-380	stripedhyena-nous-7b	Apache 2.0	1075	±23		738	$0.20 / $0.20	N/A
367	346-380	zephyr-7b-alpha	MIT	1074	±34		283	N/A	N/A
368	351-380	codellama-34b-instruct	Meta · Llama 2 Community	1073	±19		1,155	$0.35 / $1.40	16.4K
369	347-380	guanaco-33b	Non-commercial	1070	±33		331	N/A	N/A
370	358-380	phi-3-mini-4k-instruct	Microsoft · MIT	1064	±14		2,939	$0.13 / $0.52	N/A
371	358-380	vicuna-7b	Llama 2 Community	1061	±21		935	$0.20 / $0.20	N/A
372	358-380	phi-3-mini-128k-instruct	Microsoft · MIT	1058	±16		2,507	$0.13 / $0.52	N/A
373	358-380	qwen1.5-4b-chat	Alibaba · Qianwen LICENSE	1054	±19		1,136	$0.10 / $0.10	N/A
374	350-383	smollm2-1.7b-instruct	Apache 2.0	1054	±38		339	N/A	N/A
375	361-381	gemma-1.1-2b-it	Google · Gemma license	1050	±18		1,478	N/A	N/A
376	363-382	gemma-7b-it	Google · Gemma license	1041	±19		1,332	$0.05 / $0.08	8.2K
377	361-383	olmo-7b-instruct	Ai2 · Apache-2.0	1041	±28		537	$0.20 / $0.20	N/A
378	363-383	gemma-2b-it	Google · Gemma license	1034	±23		768	$0.10 / $0.10	N/A
379	363-383	chatglm3-6b	Apache-2.0	1034	±26		637	N/A	N/A
380	361-385	gpt4all-13b-snoozy	Non-commercial	1028	±37		253	N/A	N/A
381	374-386	alpaca-13b	Non-commercial	1009	±26		653	N/A	N/A
382	375-386	mpt-7b-chat	CC-BY-NC-SA-4.0	1002	±29		466	N/A	N/A
383	376-386	koala-13b	Non-commercial	997	±24		792	N/A	N/A
384	380-388	RWKV-4-Raven-14B	Apache 2.0	979	±27		556	N/A	N/A
385	380-388	chatglm2-6b	Apache-2.0	975	±32		369	N/A	N/A
386	381-389	oasst-pythia-12b	Apache 2.0	959	±25		683	N/A	N/A
387	384-390	fastchat-t5-3b	Apache 2.0	939	±31		387	N/A	N/A
388	384-391	chatglm-6b	Non-commercial	924	±29		492	N/A	N/A
389	387-391	stablelm-tuned-alpha-7b	CC-BY-NC-SA-4.0	897	±34		354	N/A	N/A
390	386-391	llama-13b	Meta · Non-commercial	891	±43		247	$0.23 / $0.23	N/A
391	388-391	dolly-v2-12b	MIT	866	±35		356	N/A	N/A
```

## Category: Hard Prompts (English) (adjustment: None)

Source: https://arena.ai, Text Arena leaderboard, Categories panel, "Hard Prompts (English)" selected, Adjustments = None.
Date shown on page: Aug 19, 2026. Votes: 1,858,697. Models: 392. Captured row count: 392 (verified match).

```
1	1-4	claude-opus-4-6-high	Anthropic · Proprietary	1537	±5		21,614	$5 / $25	1M
2	1-8	claude-fable-5	Anthropic · Proprietary	1533	±8		6,896	$10 / $50	1M
3	1-9	claude-opus-4-6	Anthropic · Proprietary	1530	±5		23,718	$5 / $25	1M
4	1-10	claude-opus-4-7-high	Anthropic · Proprietary	1527	±6		19,506	$5 / $25	1M
5	2-14	claude-opus-4-7	Anthropic · Proprietary	1521	±6		19,675	$5 / $25	1M
6	2-21	claude-opus-5-high	Anthropic · Proprietary	1518	±8		6,968	$5 / $25	1M
7	2-24	kimi-k3-max	Moonshot · Kimi K3 license	1517	±10		3,591	N/A	N/A
8	4-24	claude-opus-4-8-high	Anthropic · Proprietary	1515	±6		13,331	$5 / $25	1M
9	5-40	claude-opus-5-max	Anthropic · Proprietary	1509	±11		3,353	$5 / $25	1M
10	2-61	glm-5.3-max	Z.ai · MIT	1508	±22		712	$1.40 / $4.40	1M
11	6-33	claude-sonnet-4-6	Anthropic · Proprietary	1507	±6		20,664	$1.50 / $7.50	1M
12	5-41	muse-spark	Meta · Proprietary	1507	±9		4,360	N/A	N/A
13	6-33	gemini-3.1-pro-preview	Google · Proprietary	1506	±5		30,307	$1 / $6	1M
14	3-61	muse-spark-1.2 (xHigh)	Meta · Proprietary	1506	±19		912	$1.25 / $4.25	N/A
15	6-42	muse-spark-1.1	Meta · Proprietary	1506	±9		5,326	$1.25 / $4.25	N/A
16	5-52	qwen3.8-max	Alibaba · Proprietary	1506	±12		2,530	$2 / $6	1M
17	6-37	claude-opus-4-8	Anthropic · Proprietary	1505	±7		13,833	$5 / $25	1M
18	6-40	claude-opus-4-5-20251101-high-32k	Anthropic · Proprietary	1505	±7		9,456	$5 / $25	200K
19	6-51	gpt-5.6-sol-xhigh	OpenAI · Proprietary	1503	±9		5,055	$5 / $30	N/A
20	7-42	mimo-v2.5-pro	Xiaomi · MIT	1503	±6		15,898	$0.43 / $0.87	1.1M
21	7-44	gemini-3-pro	Google · Proprietary	1502	±6		10,800	$2 / $12	1M
22	5-61	gemini-3.7-flash-high	Google · Proprietary	1501	±15	Preliminary	1,607	$0.75 / $3.57	1M
23	7-55	gemini-3.6-flash-high	Google · Proprietary	1501	±9		5,059	$0.38 / $1.88	1M
24	9-53	gpt-5.5-high	OpenAI · Proprietary	1499	±6		18,201	$2.50 / $15	1.1M
25	9-52	claude-opus-4-5-20251101	Anthropic · Proprietary	1499	±5		20,273	$5 / $25	200K
26	9-54	glm-5.1	Z.ai · MIT	1498	±6		12,677	$1.40 / $4.40	202.8K
27	9-55	gpt-5.2-chat-latest-20260210	OpenAI · Proprietary	1498	±7		10,654	$1.75 / $14	128K
28	9-54	claude-sonnet-4-5-20250929-high-32k	Anthropic · Proprietary	1497	±5		23,208	$3 / $15	200K
29	9-56	claude-sonnet-5-high	Anthropic · Proprietary	1497	±8		7,672	$1 / $5	1M
30	9-55	gpt-5.5	OpenAI · Proprietary	1496	±6		18,877	$2.50 / $15	1.1M
31	11-56	gpt-5.4-high	OpenAI · Proprietary	1495	±6		18,981	$2.50 / $15	1.1M
32	9-61	grok-4.5	SpaceXAI · Proprietary	1495	±8		5,678	$2 / $6	500K
33	11-61	qwen3.5-max-preview	Alibaba · Proprietary	1494	±8		6,753	$1.20 / $6	N/A
34	11-61	ernie-5.1	Baidu · Proprietary	1493	±7		11,740	N/A	N/A
35	11-64	gemini-3.5-flash-medium	Google · Proprietary	1493	±7		8,043	$0.75 / $4.50	1M
36	12-66	gemini-3.5-flash-high	Google · Proprietary	1491	±7		8,618	$0.75 / $4.50	1M
37	14-69	glm-5.2-max	Z.ai · MIT	1490	±7		8,727	$1.40 / $4.40	1M
38	18-64	claude-sonnet-4-5-20250929	Anthropic · Proprietary	1490	±5		23,395	$3 / $15	200K
39	18-64	grok-4.20-beta-0309-reasoning	SpaceXAI · Proprietary	1490	±6		19,825	$1.25 / $2.50	1M
40	15-71	mimo-v2-pro	Xiaomi · Proprietary	1490	±7		7,525	$1 / $3	1M
41	17-71	gpt-5.5-instant	OpenAI · Proprietary	1489	±7		8,746	$2.50 / $15	1.1M
42	6-95	deepseek-v4-pro-high-20260813	DeepSeek · MIT	1489	±22		682	$1.32 / $3.96	N/A
43	9-84	qwen3.7-max-preview	Alibaba · Proprietary	1489	±17		1,300	$1.48 / $4.42	1M
44	18-70	claude-opus-4-1-20250805-thinking-16k	Anthropic · Proprietary	1489	±6		12,649	$15 / $75	200K
45	18-73	grok-4.20-beta1	SpaceXAI · Proprietary	1488	±7		8,399	N/A	N/A
46	18-73	gemini-3-flash	Google · Proprietary	1488	±7		7,942	$0.50 / $3	1M
47	19-73	glm-5	Z.ai · MIT	1487	±7		8,464	$1 / $3.20	202.8K
48	22-72	gpt-5.4	OpenAI · Proprietary	1487	±6		20,305	$2.50 / $15	1.1M
49	21-73	kimi-k2.6	Moonshot · Modified MIT	1487	±7		11,775	$0.95 / $4	262.1K
50	18-75	gpt-5.6-luna-xhigh	OpenAI · Proprietary	1486	±9		5,393	$1 / $6	N/A
51	27-73	deepseek-v4-pro	DeepSeek · MIT	1484	±6		16,868	$1.32 / $3.96	1M
52	12-89	gemma-4-31b	Google · Apache 2.0	1484	±15		1,556	$0.14 / $0.40	262.1K
53	12-89	qwen3.6-max-preview	Alibaba · Proprietary	1483	±15		1,646	$1.03 / $6.16	262.1K
54	24-78	gpt-5.6-terra-xhigh	OpenAI · Proprietary	1483	±9		5,162	$2.50 / $15	N/A
55	29-75	claude-opus-4-1-20250805	Anthropic · Proprietary	1482	±5		19,556	$15 / $75	200K
56	29-76	deepseek-v4-pro-high-preview	DeepSeek · MIT	1482	±6		15,953	$1.32 / $3.96	1M
57	29-78	grok-4.20-multi-agent-beta-0309	SpaceXAI · Proprietary	1481	±6		19,294	$1.25 / $2.50	1M
58	17-95	hy3	Tencent · Apache 2.0	1481	±16		1,445	$0.13 / $0.53	262.1K
59	29-81	qwen3.7-plus	Alibaba · Proprietary	1480	±7		9,817	$0.32 / $1.28	1M
60	35-78	dola-seed-2.0-pro	Bytedance · Proprietary	1480	±5		23,004	N/A	N/A
61	35-82	gpt-5.1-high	OpenAI · Proprietary	1479	±7		10,414	$0.63 / $5	400K
62	29-89	gemini-3.5-flash-lite	Google · Proprietary	1479	±9		4,663	$0.15 / $1.25	1M
63	38-81	grok-4.1-thinking	SpaceXAI · Proprietary	1479	±5		18,267	N/A	N/A
64	39-81	kimi-k2.5-thinking	Moonshot · Modified MIT	1478	±5		20,892	$0.60 / $3	N/A
65	40-84	grok-4.1	SpaceXAI · Proprietary	1478	±5		18,904	N/A	N/A
66	39-86	qwen3.6-plus	Alibaba · Proprietary	1477	±6		14,526	$0.33 / $1.95	1M
67	39-89	longcat-flash-chat-2602-exp	Meituan · Proprietary	1476	±7		8,928	N/A	N/A
68	18-111	grok-4.6-high	SpaceXAI · Proprietary	1476	±19	Preliminary	937	$2 / $6	500K
69	43-90	minimax-m3	MiniMax · MiniMax Community License	1475	±7		11,942	$0.60 / $2.40	N/A
70	41-103	glm-4.7	Z.ai · MIT	1472	±11		3,122	$0.40 / $1.75	204.8K
71	51-95	gemini-3-flash (thinking-minimal)	Google · Proprietary	1471	±5		26,427	$0.50 / $3	1M
72	49-96	mimo-v2.5	Xiaomi · MIT	1471	±6		14,246	$0.14 / $0.28	1.1M
73	38-116	gemma-4-26b-a4b	Google · Apache 2.0	1469	±15		1,493	N/A	N/A
74	44-111	glm-5v-turbo	Z.ai · Proprietary	1469	±12		2,654	$1.20 / $4	202.8K
75	52-102	gpt-5.3-chat-latest	OpenAI · Proprietary	1469	±7		10,075	$1.75 / $14	128K
76	58-101	qwen3.5-397b-a17b	Alibaba · Apache 2.0	1468	±5		21,918	$0.39 / $2.34	262.1K
77	59-103	gpt-5.4-mini-high	OpenAI · Proprietary	1467	±6		19,038	$0.75 / $4.50	400K
78	35-127	amazon-nova-experimental-chat-26-01-10	Amazon · Proprietary	1467	±19		887	N/A	N/A
79	59-106	ernie-5.0-0110	Baidu · Proprietary	1466	±6		9,772	N/A	N/A
80	55-111	mimo-v2-omni	Xiaomi · Proprietary	1466	±8		6,297	$0.40 / $2	262.1K
81	49-117	kimi-k2.5-instant	Moonshot · Modified MIT	1465	±12		2,158	$0.45 / $2.25	262.1K
82	61-109	deepseek-v4-flash-high-preview	DeepSeek · MIT	1465	±6		15,142	$0.44 / $1.32	1M
83	55-113	inkling	Thinky · Apache 2.0	1464	±9		4,782	$1 / $4.05	524.3K
84	62-110	deepseek-v4-flash	DeepSeek · MIT	1464	±6		15,369	$0.44 / $1.32	1M
85	52-119	deepseek-v3.2-exp-thinking	DeepSeek · MIT	1464	±12		2,414	$0.27 / $0.41	163.8K
86	62-111	claude-opus-4-20250514-thinking-16k	Anthropic · Proprietary	1463	±7		8,464	$15 / $75	200K
87	67-113	deepseek-v3.2-thinking	DeepSeek · MIT	1462	±6		10,679	$0.27 / $0.40	163.8K
88	67-113	grok-4.3	SpaceXAI · Proprietary	1461	±6		19,100	$1.25 / $2.50	1M
89	67-113	gpt-5.2-high	OpenAI · Proprietary	1461	±6		13,871	$0.88 / $7	400K
90	61-126	ernie-5.0-preview-1203	Baidu · Proprietary	1460	±12		2,541	N/A	N/A
91	70-116	kimi-k2-thinking-turbo	Moonshot · Modified MIT	1460	±5		17,174	$1.15 / $8	262.1K
92	71-116	gpt-5.2	OpenAI · Proprietary	1459	±5		24,626	$0.88 / $7	400K
93	71-117	minimax-m2.7	MiniMax · Modified MIT	1459	±6		18,214	$0.30 / $1.20	204.8K
94	66-127	mistral-medium-3.5	Mistral · Modified MIT	1458	±10		3,637	$1.50 / $7.50	262.1K
95	71-119	gpt-5.1	OpenAI · Proprietary	1457	±6		11,383	$0.63 / $5	400K
96	71-121	qwen3-max-preview	Alibaba · Proprietary	1457	±7		6,908	$0.78 / $3.90	262.1K
97	75-117	gemini-2.5-pro	Google · Proprietary	1457	±4		32,658	$0.63 / $5	1M
98	67-131	qwen3-max-2025-09-23	Alibaba · Proprietary	1456	±12		2,546	$0.78 / $3.90	262.1K
99	73-121	deepseek-v3.2	DeepSeek · MIT	1456	±6		12,563	$0.27 / $0.40	163.8K
100	76-119	claude-haiku-4-5-20251001	Anthropic · Proprietary	1455	±4		35,738	$1 / $5	200K
101	55-145	amazon-nova-experimental-chat-26-02-10	Amazon · Proprietary	1455	±19		928	N/A	N/A
102	76-123	chatgpt-4o-latest-20250326	OpenAI · Proprietary	1454	±5		20,142	$5 / $15	128K
103	75-129	gpt-5-high	OpenAI · Proprietary	1454	±7		7,796	$0.63 / $5	400K
104	72-136	deepseek-v3.2-exp	DeepSeek · MIT	1452	±10		3,218	$0.27 / $0.41	163.8K
105	62-154	deepseek-v3.1-terminus-thinking	DeepSeek · MIT	1450	±20		844	$0.27 / $1	163.8K
106	86-129	qwen3-235b-a22b-instruct-2507	Alibaba · Apache 2.0	1450	±4		25,765	$0.26 / $1.06	N/A
107	75-141	qwen3-vl-235b-a22b-instruct	Alibaba · Apache 2.0	1449	±12		2,973	$0.21 / $1.90	262.1K
108	67-155	muse-glimmer	Meta · Apache-2.0	1449	±19		1,001	N/A	N/A
109	86-137	claude-sonnet-4-20250514-thinking-32k	Anthropic · Proprietary	1448	±7		8,179	$3 / $15	1M
110	77-141	nvidia-nemotron-3-ultra-550b-a55b-nvfp4	Nvidia · OpenMDW-1.1	1448	±11		3,420	N/A	N/A
111	89-137	glm-4.6	Z.ai · MIT	1448	±6		9,703	$0.50 / $2	204.8K
112	86-139	gpt-5-chat	OpenAI · Proprietary	1448	±7		7,802	$1.25 / $10	N/A
113	92-139	o3-2025-04-16	OpenAI · Proprietary	1446	±6		14,040	$2 / $8	200K
114	76-155	grok-4-fast-chat	SpaceXAI · Proprietary	1445	±15		1,619	$3 / $15	256K
115	97-141	grok-4-1-fast-reasoning	SpaceXAI · Proprietary	1444	±5		16,120	$0.20 / $0.50	2M
116	82-148	deepseek-v3.1-thinking	DeepSeek · MIT	1444	±12		2,493	$1.23 / $4.94	N/A
117	95-141	qwen3.5-122b-a10b	Alibaba · Apache 2.0	1444	±7		8,843	$0.26 / $2.08	262.1K
118	82-149	gpt-4.5-preview-2025-02-27	OpenAI · Proprietary	1444	±12		2,260	$75 / $150	128K
119	97-143	claude-opus-4-20250514	Anthropic · Proprietary	1443	±7		9,991	$15 / $75	200K
120	101-146	gemini-3.1-flash-lite-preview	Google · Proprietary	1441	±6		19,585	$0.25 / $1.50	1M
121	101-147	qwen3.5-27b	Alibaba · Apache 2.0	1440	±7		8,489	$0.20 / $1.56	262.1K
122	71-173	solar-pro4	Upstage · Proprietary	1440	±23		656	$0.03 / $0.12	524.3K
123	92-158	hunyuan-hy3-preview	Tencent · tencent-hunyuan-community	1440	±13		2,229	$0.29 / $1.17	262.1K
124	95-158	kimi-k2-0905-preview	Moonshot · Modified MIT	1440	±11		2,866	$0.60 / $2.50	262.1K
125	104-147	mistral-large-3	Mistral · Apache 2.0	1439	±5		17,236	$0.50 / $1.50	N/A
126	78-168	amazon-nova-experimental-chat-12-10	Amazon · Proprietary	1439	±19		910	N/A	N/A
127	98-158	deepseek-r1-0528	DeepSeek · MIT	1438	±10		3,522	$0.50 / $2.15	163.8K
128	98-158	longcat-flash-chat	Meituan · MIT	1438	±11		2,871	$0.20 / $0.80	131.1K
129	104-147	mistral-medium-2508	Mistral · Proprietary	1438	±4		25,900	$0.40 / $2	131.1K
130	98-160	Inkling Small	Thinky · Apache 2.0	1437	±11		2,859	$0.45 / $1.20	524.3K
131	104-153	gpt-4.1-2025-04-14	OpenAI · Proprietary	1437	±6		11,999	$2 / $8	1M
132	103-160	deepseek-v3.1	DeepSeek · MIT	1436	±10		3,384	$1.23 / $4.94	N/A
133	109-158	mimo-v2-flash (non-thinking)	Xiaomi · MIT	1434	±6		13,306	$0.10 / $0.30	262.1K
134	104-159	kimi-k2-0711-preview	Moonshot · Modified MIT	1434	±8		6,402	$0.60 / $2.50	131.1K
135	104-168	deepseek-r1	DeepSeek · MIT	1433	±11		2,656	$0.70 / $2.50	64K
136	107-161	grok-3-preview-02-24	SpaceXAI · Proprietary	1433	±8		6,371	$3 / $15	131.1K
137	107-161	glm-4.5	Z.ai · MIT	1433	±8		5,750	$0.60 / $2.20	131.1K
138	113-163	minimax-m2.5	MiniMax · Modified MIT	1431	±6		12,428	$0.23 / $0.90	204.8K
139	113-162	gpt-5.4-nano-high	OpenAI · Proprietary	1430	±6		19,082	$0.20 / $1.25	400K
140	114-168	claude-3-7-sonnet-20250219-thinking-32k	Anthropic · Proprietary	1429	±7		7,801	$3 / $15	200K
141	114-168	qwen3-next-80b-a3b-instruct	Alibaba · Apache 2.0	1428	±8		6,141	$0.09 / $1.10	262.1K
142	115-168	qwen3-coder-480b-a35b-instruct	Alibaba · Apache 2.0	1428	±8		6,082	$0.40 / $1.60	262.1K
143	103-183	deepseek-v3.1-terminus	DeepSeek · MIT	1427	±18		1,055	$0.27 / $1	163.8K
144	109-177	qwen3-235b-a22b-thinking-2507	Alibaba · Apache 2.0	1427	±13		2,028	$0.23 / $2.30	262.1K
145	105-178	ernie-5.0-preview-1022	Baidu · Proprietary	1426	±15		1,387	N/A	N/A
146	99-189	hunyuan-vision-1.5-thinking	Tencent · Proprietary	1425	±23		591	N/A	N/A
147	123-168	step-3.5-flash	StepFun · Apache 2.0	1425	±6		16,241	$0.10 / $0.30	262.1K
148	121-170	grok-4-0709	SpaceXAI · Proprietary	1425	±6		10,485	$3 / $15	256K
149	121-170	claude-sonnet-4-20250514	Anthropic · Proprietary	1425	±7		9,332	$3 / $15	1M
150	122-171	qwen3.5-35b-a3b	Alibaba · Apache 2.0	1424	±7		8,968	$0.25 / $1.25	262.1K
151	116-178	mimo-v2-flash (thinking)	Xiaomi · MIT	1424	±11		2,779	$0.10 / $0.30	262.1K
152	119-176	minimax-m2.1-preview	MiniMax · MIT	1423	±9		4,218	$0.30 / $1.20	204.8K
153	125-171	qwen3.5-flash	Alibaba · Proprietary	1423	±6		17,823	N/A	N/A
154	121-174	grok-4-fast-reasoning	SpaceXAI · Proprietary	1423	±8		5,238	$0.20 / $0.50	2M
155	125-173	gemini-2.5-flash-preview-09-2025	Google · Proprietary	1423	±7		8,899	$0.30 / $2.50	1M
156	120-177	o1-2024-12-17	OpenAI · Proprietary	1423	±9		4,238	$15 / $60	200K
157	131-178	qwen3-235b-a22b-no-thinking	Alibaba · Apache 2.0	1419	±7		8,690	$0.46 / $1.82	131.1K
158	121-185	qwen3-vl-235b-a22b-thinking	Alibaba · Apache 2.0	1419	±13		2,121	$0.40 / $4	131.1K
159	135-178	deepseek-v3-0324	DeepSeek · MIT	1418	±6		10,290	$3 / $4.50	32.8K
160	137-175	gemini-2.5-flash	Google · Proprietary	1418	±4		32,342	$0.15 / $1.25	1M
161	133-178	trinity-large-preview	Apache 2.0	1418	±7		9,181	$0.15 / $0.45	131K
162	137-179	o4-mini-2025-04-16	OpenAI · Proprietary	1417	±6		10,556	$1.10 / $4.40	200K
163	137-183	qwen3-30b-a3b-instruct-2507	Alibaba · Apache 2.0	1416	±8		5,674	$0.05 / $0.19	262.1K
164	136-189	o3-mini-high	OpenAI · Proprietary	1414	±11		2,944	$0.55 / $2.20	200K
165	137-187	o1-preview	OpenAI · Proprietary	1413	±9		4,917	$15 / $60	N/A
166	143-187	gpt-4.1-mini-2025-04-14	OpenAI · Proprietary	1412	±7		8,790	$0.40 / $1.60	1M
167	143-187	mistral-medium-2505	Mistral · Proprietary	1411	±7		7,381	$0.40 / $2	131.1K
168	145-192	gpt-5-mini-high	OpenAI · Proprietary	1410	±8		6,547	$0.13 / $1	400K
169	125-201	nvidia-nemotron-3.5-lightning-30b-a3b-nvfp4	Nvidia · OpenMDW-1.1	1410	±20	Preliminary	930	N/A	N/A
170	154-194	claude-3-7-sonnet-20250219	Anthropic · Proprietary	1406	±7		8,861	$3 / $15	200K
171	159-193	claude-3-5-sonnet-20241022	Anthropic · Proprietary	1406	±5		15,847	$3 / $15	200K
172	130-207	glm-4.6v	Z.ai · MIT	1405	±22		727	$0.30 / $0.90	131.1K
173	152-196	glm-4.7-flash	Z.ai · MIT	1403	±10		3,090	$0.06 / $0.40	202.8K
174	160-195	glm-4.5-air	Z.ai · MIT	1403	±7		7,728	$0.13 / $0.85	131.1K
175	160-196	qwen3-235b-a22b	Alibaba · Apache 2.0	1402	±8		5,797	$0.46 / $1.82	131.1K
176	147-205	step-3	StepFun · Apache 2.0	1402	±15		1,578	$0.57 / $1.42	65.5K
177	160-196	amazon-nova-experimental-chat-11-10	Amazon · Proprietary	1402	±7		6,582	N/A	N/A
178	151-207	intellect-3	MIT	1399	±15		1,457	$0.20 / $1.10	131.1K
179	150-211	glm-4.5v	Z.ai · MIT	1398	±16		1,236	$0.60 / $1.80	65.5K
180	147-212	hunyuan-t1-20250711	Tencent · Proprietary	1398	±19		935	N/A	N/A
181	137-217	llama-3.1-nemotron-ultra-253b-v1	Nvidia · Nvidia Open Model	1397	±27		448	$0.60 / $1.80	131.1K
182	163-205	mistral-small-2506	Mistral · Apache 2.0	1397	±9		4,092	$0.10 / $0.30	32K
183	168-200	gemini-2.5-flash-lite-preview-09-2025-no-thinking	Google · Proprietary	1396	±6		12,653	$0.10 / $0.40	1M
184	166-203	trinity-large-thinking	Apache 2.0	1396	±7		9,490	$0.22 / $0.85	262.1K
185	163-206	qwen3-next-80b-a3b-thinking	Alibaba · Apache 2.0	1396	±10		3,534	$0.15 / $1.20	262.1K
186	162-206	amazon-nova-experimental-chat-10-20	Amazon · Proprietary	1395	±11		3,036	N/A	N/A
187	162-211	nvidia-nemotron-3-super-120b-a12b	Nvidia · NVIDIA Open Model	1394	±13		2,037	N/A	N/A
188	170-206	minimax-m1	MiniMax · Apache 2.0	1393	±7		8,186	$0.55 / $2.20	1M
189	166-212	hunyuan-turbos-20250416	Tencent · Proprietary	1391	±13		2,217	N/A	N/A
190	168-213	ling-flash-2.0	Ant Group · MIT	1388	±13		1,857	N/A	N/A
191	172-211	qwen2.5-max	Alibaba · Proprietary	1388	±8		6,021	N/A	N/A
192	149-233	llama-3.3-nemotron-49b-super-v1	Nvidia · Nvidia	1387	±29		344	N/A	N/A
193	169-216	minimax-m2	MiniMax · Apache 2.0	1387	±13		1,936	$0.26 / $1.02	204.8K
194	175-213	gemini-2.5-flash-lite-preview-06-17-thinking	Google · Proprietary	1383	±7		7,612	$0.10 / $0.40	1M
195	177-212	o3-mini	OpenAI · Proprietary	1383	±6		11,355	$0.55 / $2.20	200K
196	160-240	hunyuan-turbos-20250226	Tencent · Proprietary	1382	±27		367	N/A	N/A
197	175-216	grok-3-mini-high	SpaceXAI · Proprietary	1382	±9		4,082	$0.25 / $1.27	N/A
198	168-229	qwen3-32b	Alibaba · Apache 2.0	1381	±21		729	$0.08 / $0.28	131.1K
199	176-216	grok-3-mini-beta	SpaceXAI · Proprietary	1381	±8		5,344	$0.30 / $0.50	131.1K
200	175-223	ring-flash-2.0	Ant Group · MIT	1379	±13		1,880	N/A	N/A
201	178-222	nova-2-lite	Amazon · Proprietary	1377	±10		3,233	$0.30 / $2.50	1M
202	185-217	command-a-03-2025	Cohere · CC-BY-NC-4.0	1376	±6		12,812	$2.50 / $10	256K
203	185-222	o1-mini	OpenAI · Proprietary	1375	±7		8,369	$1.10 / $4.40	N/A
204	175-241	mercury-2	Inception AI · Proprietary	1371	±20		873	$0.25 / $0.75	128K
205	188-224	qwq-32b	Alibaba · Apache 2.0	1371	±8		5,109	$0.50 / $1	16.4K
206	185-229	olmo-3.1-32b-instruct	Ai2 · Apache 2.0	1371	±11		3,062	$0.20 / $0.60	65.5K
207	191-224	gemma-3-27b-it	Google · Gemma	1371	±6		9,957	$0.08 / $0.45	262.1K
208	177-242	amazon-nova-experimental-chat-10-09	Amazon · Proprietary	1369	±20		780	N/A	N/A
209	171-248	hunyuan-turbo-0110	Tencent · Proprietary	1369	±27		343	N/A	N/A
210	185-240	gpt-5-nano-high	OpenAI · Proprietary	1368	±13		1,984	$0.03 / $0.20	400K
211	178-243	nvidia-llama-3.3-nemotron-super-49b-v1.5	Nvidia · Nvidia Open	1368	±21		720	$0.10 / $0.40	131.1K
212	193-229	claude-3-5-sonnet-20240620	Anthropic · Proprietary	1367	±7		14,269	$3 / $15	200K
213	183-242	qwen-plus-0125	Alibaba · Proprietary	1367	±17		964	$0.40 / $1.20	131.1K
214	193-229	gemini-2.0-flash-001	Google · Proprietary	1367	±7		8,571	$0.10 / $0.40	1M
215	193-230	gpt-oss-120b	OpenAI · Apache 2.0	1366	±7		7,704	$0.03 / $0.17	131.1K
216	196-241	deepseek-v3	DeepSeek · DeepSeek	1362	±10		3,637	$1.14 / $4.56	N/A
217	198-240	qwen3-30b-a3b	Alibaba · Apache 2.0	1362	±8		5,846	$0.13 / $0.52	131.1K
218	198-240	llama-3.1-405b-instruct-bf16	Meta · Llama 3.1 Community	1361	±7		6,791	$4 / $4	32.8K
219	198-242	yi-lightning	Proprietary	1360	±10		3,939	N/A	N/A
220	203-242	claude-3-5-haiku-20241022	Anthropic · Proprietary	1357	±6		13,484	$1 / $5	200K
221	200-246	magistral-medium-2506	Mistral · Proprietary	1355	±11		2,788	$2 / $5	40K
222	203-242	gemini-1.5-pro-002	Google · Proprietary	1355	±7		9,056	$3.50 / $10.50	2.1M
223	198-252	olmo-3-32b-think	Ai2 · Apache 2.0	1355	±15		1,520	$0.15 / $0.50	65.5K
224	203-244	gemini-2.0-flash-lite-preview-02-05	Google · Proprietary	1354	±9		4,113	$0.07 / $0.30	1M
225	207-244	llama-3.1-405b-instruct-fp8	Meta · Llama 3.1 Community	1353	±7		9,964	$4 / $4	32.8K
226	208-244	llama-4-maverick-17b-128e-instruct	Meta · Llama 4	1351	±7		8,741	$0.63 / $1.80	131.1K
227	209-247	llama-4-scout-17b-16e-instruct	Meta · Llama	1350	±8		6,701	$0.40 / $0.70	8.2K
228	203-259	step-1o-turbo-202506	StepFun · Proprietary	1350	±13		1,897	N/A	N/A
229	208-252	nvidia-nemotron-3-nano-30b-a3b-bf16	Nvidia · NVIDIA Open Model	1349	±10		3,924	$0.06 / $0.24	262.1K
230	209-247	gpt-4o-2024-05-13	OpenAI · Proprietary	1349	±6		19,579	$5 / $15	128K
231	209-257	athene-v2-chat	NexusFlow	1347	±9		4,039	N/A	N/A
232	180-279	molmo-2-8b	Ai2 · Apache 2.0	1346	±41		218	$0.20 / $0.20	36.9K
233	201-264	step-2-16k-exp-202412	StepFun · Proprietary	1346	±19		786	N/A	N/A
234	198-273	mercury	Inception AI · Proprietary	1344	±26		524	$0.25 / $0.75	128K
235	209-264	olmo-3.1-32b-think	Ai2 · Apache 2.0	1344	±13		2,080	$0.15 / $0.50	65.5K
236	209-264	qwen2.5-plus-1127	Alibaba · Proprietary	1344	±13		1,713	N/A	N/A
237	203-274	hunyuan-large-2025-02-10	Tencent · Proprietary	1340	±23		601	N/A	N/A
238	215-264	gpt-oss-20b	OpenAI · Apache 2.0	1340	±12		2,475	$0.03 / $0.13	131.1K
239	220-264	gpt-4o-2024-08-06	OpenAI · Proprietary	1339	±8		8,010	$2.50 / $10	128K
240	209-272	gpt-4.1-nano-2025-04-14	OpenAI · Proprietary	1339	±17		1,062	$0.10 / $0.40	1M
241	209-272	granite-4.1-8b	IBM · Apache 2.0	1339	±18		1,357	$0.05 / $0.10	131.1K
242	224-264	llama-3.3-70b-instruct	Meta · Llama-3.3	1338	±6		10,109	$0.10 / $0.32	131.1K
243	208-274	gemma-3-12b-it	Google · Gemma	1338	±21		700	$0.05 / $0.15	131.1K
244	213-272	deepseek-v2.5-1210	DeepSeek · DeepSeek	1337	±16		1,132	N/A	N/A
245	225-264	mistral-small-3.1-24b-instruct-2503	Mistral · Apache 2.0	1335	±7		7,679	$0.10 / $0.30	32K
246	228-266	mistral-large-2407	Mistral · Mistral Research	1334	±8		7,818	$2 / $6	131.1K
247	230-267	gemini-1.5-pro-001	Google · Proprietary	1332	±7		13,552	$3.50 / $10.50	2.1M
248	230-267	grok-2-2024-08-13	SpaceXAI · Proprietary	1331	±7		10,486	$2 / $10	131.1K
249	228-272	deepseek-v2.5	DeepSeek · DeepSeek	1330	±9		4,055	N/A	N/A
250	228-273	qwen-max-0919	Alibaba · Qwen	1330	±11		2,531	$1.60 / $6.40	32.8K
251	231-269	gpt-4-turbo-2024-04-09	OpenAI · Proprietary	1329	±7		17,922	$10 / $30	128K
252	230-272	gemini-advanced-0514	Google · Proprietary	1329	±9		8,405	N/A	N/A
253	232-273	qwen2.5-72b-instruct	Alibaba · Qwen	1328	±8		6,208	$1.20 / $1.20	N/A
254	224-275	llama-3.1-nemotron-70b-instruct	Nvidia · Llama 3.1	1327	±17		1,136	$1.20 / $1.20	131.1K
255	231-273	glm-4-plus	Z.ai · Proprietary	1327	±10		4,016	$0.44 / $1.76	204.8K
256	232-272	claude-3-opus-20240229	Anthropic · Proprietary	1327	±6		34,293	$15 / $75	200K
257	228-275	ibm-granite-h-small	IBM · Apache 2.0	1326	±15		1,617	N/A	N/A
258	232-274	athene-70b-0725	CC-BY-NC-4.0	1325	±10		3,605	N/A	N/A
259	232-273	gpt-4-1106-preview	OpenAI · Proprietary	1325	±7		18,316	$10 / $30	128K
260	227-278	glm-4-plus-0111	Z.ai · Proprietary	1325	±18		955	N/A	N/A
261	232-274	mistral-large-2411	Mistral · MRL	1324	±9		4,452	$2 / $6	128K
262	221-284	hunyuan-standard-2025-02-10	Tencent · Proprietary	1323	±23		587	N/A	N/A
263	230-279	hunyuan-large-vision	Tencent · Proprietary	1322	±17		1,211	N/A	N/A
264	239-274	gpt-4o-mini-2024-07-18	OpenAI · Proprietary	1321	±6		11,380	$0.15 / $0.60	128K
265	230-283	qwen2.5-coder-32b-instruct	Alibaba · Apache 2.0	1319	±20		759	$0.87 / $0.87	32K
266	240-275	gpt-4-0125-preview	OpenAI · Proprietary	1319	±7		16,792	$10 / $30	128K
267	239-278	gemma-3n-e4b-it	Google · Gemma	1317	±9		4,574	$0.06 / $0.12	32.8K
268	243-278	grok-2-mini-2024-08-13	SpaceXAI · Proprietary	1315	±7		8,664	$2 / $10	131.1K
269	242-279	gpt-4-0314	OpenAI · Proprietary	1315	±9		9,838	$30 / $60	8.2K
270	243-278	llama-3.1-70b-instruct	Meta · Llama 3.1 Community	1315	±7		9,133	$0.40 / $0.40	131.1K
271	242-279	amazon-nova-pro-v1.0	Amazon · Proprietary	1315	±9		4,069	$0.80 / $3.20	300K
272	243-279	gemini-1.5-flash-002	Google · Proprietary	1314	±8		5,484	$0.07 / $0.30	1M
273	254-281	llama-3-70b-instruct	Meta · Llama 3 Community	1311	±7		29,608	$0.51 / $0.74	8.2K
274	262-287	gpt-4-0613	OpenAI · Proprietary	1301	±8		16,244	$30 / $60	8.2K
275	262-293	deepseek-coder-v2	DeepSeek · DeepSeek License	1298	±12		2,699	$0.14 / $0.28	128K
276	249-302	olmo-2-0325-32b-instruct	Ai2 · Apache-2.0	1296	±24		538	$0.05 / $0.20	128K
277	262-297	jamba-1.5-large	Jamba Open	1295	±14		1,528	$2 / $8	256K
278	266-296	mistral-small-24b-instruct-2501	Mistral · Apache 2.0	1295	±12		2,355	$0.05 / $0.08	32.8K
279	272-294	gemini-1.5-flash-001	Google · Proprietary	1294	±7		10,974	$0.07 / $0.30	1M
280	259-304	llama-3.1-tulu-3-70b	Ai2 · Llama 3.1	1291	±23		499	N/A	N/A
281	273-297	phi-4	Microsoft · MIT	1290	±9		3,804	$0.07 / $0.14	16.4K
282	274-296	gemma-2-27b-it	Google · Gemma license	1289	±6		12,606	$0.65 / $0.65	8.2K
283	275-297	claude-3-sonnet-20240229	Anthropic · Proprietary	1286	±7		19,193	$3 / $15	200K
284	274-302	glm-4-0520	Z.ai · Proprietary	1285	±14		1,775	N/A	N/A
285	275-299	qwen2-72b-instruct	Alibaba · Qianwen LICENSE	1284	±9		6,483	$0.90 / $0.90	32.8K
286	271-307	gemma-3-4b-it	Google · Gemma	1284	±20		764	$0.05 / $0.10	131.1K
287	274-304	reka-core-20240904	Proprietary	1282	±14		1,341	N/A	N/A
288	275-304	nemotron-4-340b-instruct	Nvidia · NVIDIA Open Model	1281	±11		3,257	N/A	N/A
289	275-305	gemma-2-9b-it-simpo	MIT	1280	±14		1,661	$0.03 / $0.09	8.2K
290	275-304	amazon-nova-lite-v1.0	Amazon · Proprietary	1278	±10		3,136	$0.06 / $0.24	300K
291	272-313	llama-3.1-nemotron-51b-instruct	Nvidia · Llama 3.1	1278	±22		578	N/A	N/A
292	271-321	hunyuan-standard-256k	Tencent · Proprietary	1277	±28		370	N/A	N/A
293	276-304	c4ai-aya-expanse-32b	Cohere · CC-BY-NC-4.0	1277	±9		4,272	N/A	N/A
294	279-306	mistral-large-2402	Mistral · Proprietary	1274	±8		11,296	$4 / $12	32K
295	277-311	reka-flash-20240904	Proprietary	1271	±14		1,389	N/A	N/A
296	277-311	command-r-plus-08-2024	Cohere · CC-BY-NC-4.0	1270	±13		1,735	$2.50 / $10	128K
297	282-307	claude-3-haiku-20240307	Anthropic · Proprietary	1270	±7		20,673	$0.25 / $1.25	200K
298	283-311	gemini-1.5-flash-8b-001	Google · Proprietary	1267	±8		5,581	$0.07 / $0.30	1M
299	275-325	ministral-8b-2410	Mistral · MRL	1267	±20		703	$0.10 / $0.10	131.1K
300	283-314	qwen1.5-110b-chat	Alibaba · Qianwen LICENSE	1264	±10		4,572	N/A	N/A
301	282-320	command-r-08-2024	Cohere · CC-BY-NC-4.0	1263	±13		1,822	$0.15 / $0.60	128K
302	285-313	gemma-2-9b-it	Google · Gemma license	1263	±7		9,094	$0.03 / $0.09	8.2K
303	291-320	command-r-plus	Cohere · CC-BY-NC-4.0	1258	±8		13,980	$2.50 / $10	128K
304	285-326	internlm2_5-20b-chat	Other	1257	±15		1,456	$0 / $0	32.8K
305	290-325	amazon-nova-micro-v1.0	Amazon · Proprietary	1256	±10		3,050	$0.04 / $0.14	128K
306	292-324	mixtral-8x22b-instruct-v0.1	Mistral · Apache 2.0	1255	±8		9,466	$0.90 / $0.90	65.5K
307	294-326	qwen1.5-72b-chat	Alibaba · Qianwen LICENSE	1252	±9		7,597	N/A	N/A
308	283-329	granite-3.1-8b-instruct	IBM · Apache 2.0	1250	±24		517	N/A	N/A
309	294-328	jamba-1.5-mini	Jamba Open	1248	±14		1,545	$0.20 / $0.40	256K
310	300-327	llama-3-8b-instruct	Meta · Llama 3 Community	1245	±7		19,891	$0.14 / $0.14	8.2K
311	297-329	reka-flash-21b-20240226-online	Proprietary	1243	±13		2,928	N/A	N/A
312	300-328	mistral-medium	Mistral · Proprietary	1243	±10		6,398	$2.70 / $8.10	32K
313	294-332	gemini-pro	Google · Proprietary	1242	±19		1,189	$0.35 / $1.05	32.8K
314	300-329	yi-1.5-34b-chat	Apache-2.0	1241	±10		3,931	N/A	N/A
315	299-329	gpt-3.5-turbo-1106	OpenAI · Proprietary	1241	±14		3,150	$1 / $2	16.4K
316	303-328	gpt-3.5-turbo-0125	OpenAI · Proprietary	1240	±8		12,416	$0.50 / $1.50	16.4K
317	300-329	reka-flash-21b-20240226	Proprietary	1240	±10		4,796	N/A	N/A
318	303-328	llama-3.1-8b-instruct	Meta · Llama 3.1 Community	1240	±8		8,195	$0.05 / $0.08	131.1K
319	294-339	granite-3.1-2b-instruct	IBM · Apache 2.0	1238	±24		511	N/A	N/A
320	303-329	dbrx-instruct-preview	DBRX LICENSE	1237	±11		5,516	$0.60 / $0.60	32.8K
321	302-331	gemini-pro-dev-api	Google · Proprietary	1237	±13		3,298	$0.35 / $1.05	32.8K
322	297-337	granite-3.0-8b-instruct	IBM · Apache 2.0	1236	±20		900	N/A	N/A
323	304-330	qwen1.5-32b-chat	Alibaba · Qianwen LICENSE	1236	±11		3,830	N/A	N/A
324	306-337	c4ai-aya-expanse-8b	Cohere · CC-BY-NC-4.0	1231	±14		1,620	N/A	N/A
325	300-344	zephyr-orpo-141b-A35b-v0.1	Apache 2.0	1230	±21		820	N/A	N/A
326	308-334	phi-3-medium-4k-instruct	Microsoft · MIT	1229	±10		4,087	$0.17 / $0.68	N/A
327	309-333	mixtral-8x7b-instruct-v0.1	Mistral · Apache 2.0	1229	±8		13,360	$0.63 / $0.63	32K
328	300-348	llama-3.1-tulu-3-8b	Ai2 · Llama 3.1	1225	±25		452	N/A	N/A
329	313-338	command-r	Cohere · CC-BY-NC-4.0	1223	±9		9,264	$0.15 / $0.60	128K
330	319-347	phi-3-small-8k-instruct	Microsoft · MIT	1213	±12		3,070	$0.15 / $0.60	N/A
331	322-350	qwen1.5-14b-chat	Alibaba · Qianwen LICENSE	1209	±13		3,024	$0.30 / $0.30	N/A
332	320-350	llama-3.2-3b-instruct	Meta · Llama 3.2	1209	±15		1,377	$0.05 / $0.33	131.1K
333	324-349	gemma-1.1-7b-it	Google · Gemma license	1208	±10		4,180	$0.03 / $0.09	8.2K
334	323-350	starling-lm-7b-beta	Apache-2.0	1208	±13		2,864	N/A	N/A
335	321-353	tulu-2-dpo-70b	AI2 ImpACT Low-risk	1206	±18		1,200	N/A	N/A
336	328-350	snowflake-arctic-instruct	Apache 2.0	1203	±11		6,488	N/A	N/A
337	326-353	phi-3-mini-4k-instruct-june-2024	Microsoft · MIT	1202	±13		2,028	$0.13 / $0.52	4.1K
338	328-355	yi-34b-chat	Yi License	1197	±12		2,844	$0.90 / $0.90	4.1K
339	328-357	openchat-3.5-0106	Apache-2.0	1197	±13		2,468	N/A	N/A
340	327-359	openhermes-2.5-mistral-7b	Apache-2.0	1196	±19		917	$0.17 / $0.17	N/A
341	329-353	gemma-2-2b-it	Google · Gemma license	1196	±8		7,586	N/A	N/A
342	328-361	granite-3.0-2b-instruct	IBM · Apache 2.0	1193	±19		974	N/A	N/A
343	328-361	deepseek-llm-67b-chat	DeepSeek · DeepSeek License	1190	±20		946	N/A	N/A
344	324-368	mpt-30b-chat	CC-BY-NC-SA-4.0	1188	±30		359	N/A	N/A
345	329-361	wizardlm-70b	Microsoft · Llama 2 Community	1187	±16		1,475	N/A	N/A
346	330-361	starling-lm-7b-alpha	CC-BY-NC-4.0	1186	±14		1,894	N/A	N/A
347	324-373	codellama-70b-instruct	Meta · Llama 2 Community	1183	±36		207	$0.70 / $2.80	16.4K
348	332-366	openchat-3.5	Apache-2.0	1179	±17		1,389	$0.20 / $0.20	N/A
349	336-364	phi-3-mini-4k-instruct	Microsoft · MIT	1178	±12		3,447	$0.13 / $0.52	N/A
350	329-369	qwq-32b-preview	Alibaba · Apache 2.0	1177	±25		519	$0.50 / $1	16.4K
351	340-364	llama-2-70b-chat	Meta · Llama 2 Community	1176	±9		6,989	$0.70 / $2.80	4.1K
352	339-366	vicuna-33b	Non-commercial	1175	±11		3,964	$0 / $0	2K
353	339-366	mistral-7b-instruct-v0.2	Mistral · Apache-2.0	1175	±11		3,709	$0.20 / $0.20	32.8K
354	341-369	gemma-7b-it	Google · Gemma license	1169	±15		1,588	$0.05 / $0.08	8.2K
355	336-372	solar-10.7b-instruct-v1.0	CC-BY-NC-4.0	1169	±22		765	$0.30 / $0.30	N/A
356	340-369	palm-2	Google · Proprietary	1169	±17		1,366	$0.50 / $0.50	25.8K
357	331-374	dolphin-2.2.1-mistral-7b	Apache-2.0	1167	±31		286	$0.50 / $0.50	16.4K
358	336-377	smollm2-1.7b-instruct	Apache 2.0	1159	±31		334	N/A	N/A
359	342-374	qwen1.5-7b-chat	Alibaba · Qianwen LICENSE	1158	±18		1,019	$0.20 / $0.20	N/A
360	346-373	llama-2-13b-chat	Meta · Llama 2 Community	1157	±12		3,347	$0.25 / $0.25	4.1K
361	341-375	llama2-70b-steerlm-chat	Nvidia · Llama 2 Community	1156	±23		645	N/A	N/A
362	346-374	llama-3.2-1b-instruct	Meta · Llama 3.2	1154	±15		1,437	$0.03 / $0.20	60K
363	342-375	qwen-14b-chat	Alibaba · Qianwen LICENSE	1153	±20		830	N/A	N/A
364	348-374	phi-3-mini-128k-instruct	Microsoft · MIT	1153	±13		4,149	$0.13 / $0.52	N/A
365	348-374	gemma-1.1-2b-it	Google · Gemma license	1151	±14		1,941	N/A	N/A
366	351-376	codellama-34b-instruct	Meta · Llama 2 Community	1146	±16		1,278	$0.35 / $1.40	16.4K
367	352-376	vicuna-13b	Llama 2 Community	1143	±12		3,220	$0.30 / $0.30	N/A
368	351-377	nous-hermes-2-mixtral-8x7b-dpo	Apache-2.0	1143	±19		929	$0.90 / $0.90	N/A
369	346-380	zephyr-7b-alpha	MIT	1137	±33		278	N/A	N/A
370	355-377	zephyr-7b-beta	MIT	1136	±15		1,847	$0.15 / $0.15	16.4K
371	355-377	mistral-7b-instruct	Mistral · Apache 2.0	1132	±17		1,616	$0.07 / $0.28	4.1K
372	355-379	wizardlm-13b	Microsoft · Llama 2 Community	1129	±18		1,066	$0.30 / $0.30	N/A
373	358-379	stripedhyena-nous-7b	Apache 2.0	1123	±18		1,029	$0.20 / $0.20	N/A
374	356-381	guanaco-33b	Non-commercial	1119	±28		434	N/A	N/A
375	367-381	llama-2-7b-chat	Meta · Llama 2 Community	1116	±12		2,560	$0.15 / $0.15	4.1K
376	363-381	gemma-2b-it	Google · Gemma license	1115	±20		832	$0.10 / $0.10	N/A
377	365-381	vicuna-7b	Llama 2 Community	1113	±19		1,066	$0.20 / $0.20	N/A
378	371-381	qwen1.5-4b-chat	Alibaba · Qianwen LICENSE	1099	±16		1,419	$0.10 / $0.10	N/A
379	373-383	olmo-7b-instruct	Ai2 · Apache-2.0	1086	±19		1,076	$0.20 / $0.20	N/A
380	374-384	chatglm3-6b	Apache-2.0	1083	±21		835	N/A	N/A
381	371-385	gpt4all-13b-snoozy	Non-commercial	1083	±33		287	N/A	N/A
382	379-388	chatglm2-6b	Apache-2.0	1049	±29		408	N/A	N/A
383	379-388	mpt-7b-chat	CC-BY-NC-SA-4.0	1044	±24		626	N/A	N/A
384	380-387	koala-13b	Non-commercial	1044	±20		1,100	N/A	N/A
385	381-388	oasst-pythia-12b	Apache 2.0	1034	±20		1,002	N/A	N/A
386	382-389	RWKV-4-Raven-14B	Apache 2.0	1022	±22		771	N/A	N/A
387	382-388	alpaca-13b	Non-commercial	1021	±21		899	N/A	N/A
388	383-390	chatglm-6b	Non-commercial	998	±24		732	N/A	N/A
389	387-392	dolly-v2-12b	MIT	973	±27		523	N/A	N/A
390	388-392	stablelm-tuned-alpha-7b	CC-BY-NC-SA-4.0	957	±27		497	N/A	N/A
391	389-392	fastchat-t5-3b	Apache 2.0	946	±23		690	N/A	N/A
392	389-392	llama-13b	Meta · Non-commercial	919	±34		371	$0.23 / $0.23	N/A
```

## Category: Occupational: Software & IT Services (adjustment: None)

Source: https://arena.ai, Text Arena leaderboard, Categories panel, "Occupational: Software & IT Services" selected, Adjustments = None.
Date shown on page: Aug 19, 2026. Votes: 2,591,928. Models: 393. Captured row count: 393 (verified match).

```
1	1-8	claude-opus-4-7-high	Anthropic · Proprietary	1541	±5		24,333	$5 / $25	1M
2	1-8	claude-opus-4-6-high	Anthropic · Proprietary	1540	±5		27,650	$5 / $25	1M
3	1-9	claude-fable-5	Anthropic · Proprietary	1539	±7		9,143	$10 / $50	1M
4	1-10	claude-opus-4-6	Anthropic · Proprietary	1535	±5		30,020	$5 / $25	1M
5	1-16	claude-opus-4-7	Anthropic · Proprietary	1531	±5		24,529	$5 / $25	1M
6	1-18	kimi-k3-max	Moonshot · Kimi K3 license	1529	±8		5,609	N/A	N/A
7	1-33	muse-spark-1.2 (xHigh)	Meta · Proprietary	1527	±16		1,337	$1.25 / $4.25	N/A
8	3-20	claude-opus-5-high	Anthropic · Proprietary	1526	±7		9,912	$5 / $25	1M
9	4-27	muse-spark-1.1	Meta · Proprietary	1523	±7		7,773	$1.25 / $4.25	N/A
10	5-26	claude-opus-4-8-high	Anthropic · Proprietary	1522	±6		17,394	$5 / $25	1M
11	1-52	glm-5.3-max	Z.ai · MIT	1521	±19		1,047	$1.40 / $4.40	1M
12	5-33	muse-spark	Meta · Proprietary	1520	±9		5,321	N/A	N/A
13	5-33	gpt-5.6-sol-xhigh	OpenAI · Proprietary	1518	±8		7,487	$5 / $30	N/A
14	5-42	claude-opus-5-max	Anthropic · Proprietary	1517	±9		4,770	$5 / $25	1M
15	7-37	claude-sonnet-4-6	Anthropic · Proprietary	1515	±5		26,050	$1.50 / $7.50	1M
16	5-55	gemini-3.7-flash-high	Google · Proprietary	1513	±12	Preliminary	2,365	$0.75 / $3.57	1M
17	8-44	claude-opus-4-8	Anthropic · Proprietary	1513	±6		17,665	$5 / $25	1M
18	5-59	qwen3.7-max-preview	Alibaba · Proprietary	1513	±16		1,553	$1.48 / $4.42	1M
19	6-52	qwen3.8-max	Alibaba · Proprietary	1512	±10		3,881	$2 / $6	1M
20	8-44	gemini-3.1-pro-preview	Google · Proprietary	1512	±5		38,786	$1 / $6	1M
21	8-46	claude-opus-4-5-20251101-high-32k	Anthropic · Proprietary	1511	±6		12,781	$5 / $25	200K
22	8-51	gemini-3.6-flash-high	Google · Proprietary	1511	±8		7,045	$0.38 / $1.88	1M
23	8-46	gemini-3-pro	Google · Proprietary	1510	±6		14,326	$2 / $12	1M
24	10-46	gpt-5.5-high	OpenAI · Proprietary	1510	±5		23,275	$2.50 / $15	1.1M
25	9-49	gpt-5.2-chat-latest-20260210	OpenAI · Proprietary	1510	±6		13,377	$1.75 / $14	128K
26	8-53	grok-4.5	SpaceXAI · Proprietary	1509	±7		8,583	$2 / $6	500K
27	10-52	ernie-5.1	Baidu · Proprietary	1508	±6		14,768	N/A	N/A
28	10-53	mimo-v2.5-pro	Xiaomi · MIT	1507	±6		21,247	$0.43 / $0.87	1.1M
29	10-53	claude-opus-4-5-20251101	Anthropic · Proprietary	1507	±5		26,322	$5 / $25	200K
30	10-53	gpt-5.4-high	OpenAI · Proprietary	1507	±5		23,901	$2.50 / $15	1.1M
31	6-72	deepseek-v4-pro-high-20260813	DeepSeek · MIT	1506	±17		1,121	$1.32 / $3.96	N/A
32	10-57	claude-sonnet-5-high	Anthropic · Proprietary	1505	±7		10,503	$1 / $5	1M
33	14-57	gpt-5.5	OpenAI · Proprietary	1504	±5		23,962	$2.50 / $15	1.1M
34	13-60	grok-4.20-beta1	SpaceXAI · Proprietary	1503	±7		10,429	N/A	N/A
35	7-76	grok-4.6-high	SpaceXAI · Proprietary	1503	±16	Preliminary	1,389	$2 / $6	500K
36	14-59	glm-5.1	Z.ai · MIT	1503	±6		16,656	$1.40 / $4.40	202.8K
37	14-60	kimi-k2.6	Moonshot · Modified MIT	1503	±6		15,083	$0.95 / $4	262.1K
38	14-58	grok-4.20-beta-0309-reasoning	SpaceXAI · Proprietary	1503	±5		24,462	$1.25 / $2.50	1M
39	13-61	gpt-5.5-instant	OpenAI · Proprietary	1503	±7		10,629	$2.50 / $15	1.1M
40	13-61	gpt-5.6-terra-xhigh	OpenAI · Proprietary	1503	±8		7,636	$2.50 / $15	N/A
41	15-60	grok-4.20-multi-agent-beta-0309	SpaceXAI · Proprietary	1502	±5		24,062	$1.25 / $2.50	1M
42	14-61	gemini-3.5-flash-high	Google · Proprietary	1502	±6		11,787	$0.75 / $4.50	1M
43	17-61	dola-seed-2.0-pro	Bytedance · Proprietary	1501	±5		29,288	N/A	N/A
44	15-63	qwen3.5-max-preview	Alibaba · Proprietary	1501	±7		8,568	$1.20 / $6	N/A
45	17-62	gemini-3-flash	Google · Proprietary	1500	±7		10,582	$0.50 / $3	1M
46	20-61	claude-sonnet-4-5-20250929-high-32k	Anthropic · Proprietary	1500	±4		30,069	$3 / $15	200K
47	20-63	gpt-5.4	OpenAI · Proprietary	1499	±5		25,348	$2.50 / $15	1.1M
48	25-64	claude-sonnet-4-5-20250929	Anthropic · Proprietary	1498	±4		29,777	$3 / $15	200K
49	20-68	gemini-3.5-flash-medium	Google · Proprietary	1497	±7		11,143	$0.75 / $4.50	1M
50	21-68	glm-5.2-max	Z.ai · MIT	1497	±7		11,977	$1.40 / $4.40	1M
51	13-81	qwen3.6-max-preview	Alibaba · Proprietary	1497	±13		2,166	$1.03 / $6.16	262.1K
52	29-67	grok-4.1-thinking	SpaceXAI · Proprietary	1496	±5		23,682	N/A	N/A
53	29-74	qwen3.7-plus	Alibaba · Proprietary	1494	±6		13,771	$0.32 / $1.28	1M
54	35-78	deepseek-v4-pro	DeepSeek · MIT	1492	±5		22,349	$1.32 / $3.96	1M
55	30-80	gpt-5.6-luna-xhigh	OpenAI · Proprietary	1492	±7		7,915	$1 / $6	N/A
56	21-87	gemma-4-31b	Google · Apache 2.0	1491	±12		2,131	$0.14 / $0.40	262.1K
57	38-78	claude-opus-4-1-20250805-thinking-16k	Anthropic · Proprietary	1491	±5		17,053	$15 / $75	200K
58	33-81	mimo-v2-pro	Xiaomi · Proprietary	1491	±7		9,832	$1 / $3	1M
59	22-88	hy3	Tencent · Apache 2.0	1490	±13		2,201	$0.13 / $0.53	262.1K
60	32-85	gemini-3.5-flash-lite	Google · Proprietary	1490	±8		6,923	$0.15 / $1.25	1M
61	30-88	kimi-k2.5-instant	Moonshot · Modified MIT	1490	±11		2,852	$0.45 / $2.25	262.1K
62	44-80	kimi-k2.5-thinking	Moonshot · Modified MIT	1489	±5		28,330	$0.60 / $3	N/A
63	47-81	grok-4.1	SpaceXAI · Proprietary	1489	±5		24,749	N/A	N/A
64	43-85	longcat-flash-chat-2602-exp	Meituan · Proprietary	1488	±7		10,920	N/A	N/A
65	46-86	gpt-5.3-chat-latest	OpenAI · Proprietary	1487	±6		12,762	$1.75 / $14	128K
66	47-86	glm-5	Z.ai · MIT	1487	±6		10,627	$1 / $3.20	202.8K
67	48-86	gpt-5.4-mini-high	OpenAI · Proprietary	1486	±5		23,571	$0.75 / $4.50	400K
68	50-85	claude-opus-4-1-20250805	Anthropic · Proprietary	1486	±4		26,546	$15 / $75	200K
69	47-87	minimax-m3	MiniMax · MiniMax Community License	1486	±6		16,414	$0.60 / $2.40	N/A
70	50-86	gemini-3-flash (thinking-minimal)	Google · Proprietary	1485	±4		33,361	$0.50 / $3	1M
71	50-88	ernie-5.0-0110	Baidu · Proprietary	1484	±6		13,142	N/A	N/A
72	51-88	deepseek-v4-pro-high-preview	DeepSeek · MIT	1483	±5		21,207	$1.32 / $3.96	1M
73	51-91	qwen3.6-plus	Alibaba · Proprietary	1483	±6		18,967	$0.33 / $1.95	1M
74	50-95	inkling	Thinky · Apache 2.0	1482	±8		7,167	$1 / $4.05	524.3K
75	55-92	qwen3.5-397b-a17b	Alibaba · Apache 2.0	1481	±5		28,080	$0.39 / $2.34	262.1K
76	53-93	gpt-5.1-high	OpenAI · Proprietary	1481	±6		14,009	$0.63 / $5	400K
77	55-95	mimo-v2.5	Xiaomi · MIT	1479	±6		18,194	$0.14 / $0.28	1.1M
78	57-95	grok-4.3	SpaceXAI · Proprietary	1479	±5		24,101	$1.25 / $2.50	1M
79	52-103	ernie-5.0-preview-1203	Baidu · Proprietary	1477	±10		3,371	N/A	N/A
80	52-110	gemma-4-26b-a4b	Google · Apache 2.0	1475	±12		2,105	N/A	N/A
81	60-105	glm-4.7	Z.ai · MIT	1474	±9		4,134	$0.40 / $1.75	204.8K
82	63-105	mimo-v2-omni	Xiaomi · Proprietary	1473	±8		7,852	$0.40 / $2	262.1K
83	69-103	deepseek-v4-flash-high-preview	DeepSeek · MIT	1473	±6		20,059	$0.44 / $1.32	1M
84	73-103	kimi-k2-thinking-turbo	Moonshot · Modified MIT	1473	±5		22,854	$1.15 / $8	262.1K
85	60-111	glm-5v-turbo	Z.ai · Proprietary	1473	±10		3,741	$1.20 / $4	202.8K
86	73-103	gpt-5.2	OpenAI · Proprietary	1472	±5		30,697	$0.88 / $7	400K
87	73-104	gpt-5.2-high	OpenAI · Proprietary	1472	±5		17,790	$0.88 / $7	400K
88	75-105	deepseek-v4-flash	DeepSeek · MIT	1471	±6		20,159	$0.44 / $1.32	1M
89	53-126	amazon-nova-experimental-chat-26-02-10	Amazon · Proprietary	1470	±16		1,253	N/A	N/A
90	74-107	qwen3-max-preview	Alibaba · Proprietary	1470	±7		9,578	$0.78 / $3.90	262.1K
91	67-118	mistral-medium-3.5	Mistral · Modified MIT	1470	±10		4,325	$1.50 / $7.50	262.1K
92	76-107	minimax-m2.7	MiniMax · Modified MIT	1469	±5		24,940	$0.30 / $1.20	204.8K
93	60-128	muse-glimmer	Meta · Apache-2.0	1468	±15		1,524	N/A	N/A
94	60-132	amazon-nova-experimental-chat-26-01-10	Amazon · Proprietary	1466	±17		1,175	N/A	N/A
95	79-119	claude-opus-4-20250514-thinking-16k	Anthropic · Proprietary	1466	±6		12,354	$15 / $75	200K
96	79-119	gpt-5.1	OpenAI · Proprietary	1466	±6		15,241	$0.63 / $5	400K
97	79-119	chatgpt-4o-latest-20250326	OpenAI · Proprietary	1465	±4		27,216	$5 / $15	128K
98	76-126	nvidia-nemotron-3-ultra-550b-a55b-nvfp4	Nvidia · OpenMDW-1.1	1465	±10		4,109	N/A	N/A
99	79-123	deepseek-v3.2-thinking	DeepSeek · MIT	1464	±6		14,002	$0.27 / $0.40	163.8K
100	83-120	claude-haiku-4-5-20251001	Anthropic · Proprietary	1463	±4		45,847	$1 / $5	200K
101	84-121	qwen3-235b-a22b-instruct-2507	Alibaba · Apache 2.0	1463	±4		34,858	$0.26 / $1.06	N/A
102	79-128	qwen3-max-2025-09-23	Alibaba · Proprietary	1462	±10		3,416	$0.78 / $3.90	262.1K
103	89-125	gemini-2.5-pro	Google · Proprietary	1460	±4		44,131	$0.63 / $5	1M
104	79-133	gpt-4.5-preview-2025-02-27	OpenAI · Proprietary	1459	±10		3,358	$75 / $150	128K
105	79-133	deepseek-v3.2-exp-thinking	DeepSeek · MIT	1459	±10		3,244	$0.27 / $0.41	163.8K
106	79-138	grok-4-fast-chat	SpaceXAI · Proprietary	1458	±12		2,268	$3 / $15	256K
107	89-128	deepseek-v3.2	DeepSeek · MIT	1458	±5		17,037	$0.27 / $0.40	163.8K
108	91-128	grok-4-1-fast-reasoning	SpaceXAI · Proprietary	1457	±5		20,577	$0.20 / $0.50	2M
109	91-128	mistral-large-3	Mistral · Apache 2.0	1456	±5		23,047	$0.50 / $1.50	N/A
110	87-135	deepseek-r1-0528	DeepSeek · MIT	1456	±8		5,703	$0.50 / $2.15	163.8K
111	87-139	qwen3-vl-235b-a22b-instruct	Alibaba · Apache 2.0	1455	±10		4,125	$0.21 / $1.90	262.1K
112	92-133	gpt-5-chat	OpenAI · Proprietary	1454	±6		10,807	$1.25 / $10	N/A
113	96-133	gemini-3.1-flash-lite-preview	Google · Proprietary	1454	±5		23,969	$0.25 / $1.50	1M
114	91-137	kimi-k2-0711-preview	Moonshot · Modified MIT	1454	±7		9,267	$0.60 / $2.50	131.1K
115	97-133	o3-2025-04-16	OpenAI · Proprietary	1454	±5		19,683	$2 / $8	200K
116	95-137	gpt-5-high	OpenAI · Proprietary	1454	±6		11,019	$0.63 / $5	400K
117	90-141	deepseek-v3.2-exp	DeepSeek · MIT	1453	±9		4,151	$0.27 / $0.41	163.8K
118	91-141	Inkling Small	Thinky · Apache 2.0	1453	±9		4,316	$0.45 / $1.20	524.3K
119	97-137	glm-4.6	Z.ai · MIT	1453	±6		12,694	$0.50 / $2	204.8K
120	91-145	longcat-flash-chat	Meituan · MIT	1452	±10		3,925	$0.20 / $0.80	131.1K
121	91-145	kimi-k2-0905-preview	Moonshot · Modified MIT	1452	±10		3,976	$0.60 / $2.50	262.1K
122	98-139	qwen3.5-122b-a10b	Alibaba · Apache 2.0	1451	±6		11,185	$0.26 / $2.08	262.1K
123	99-139	gpt-5.4-nano-high	OpenAI · Proprietary	1451	±5		23,448	$0.20 / $1.25	400K
124	91-148	hunyuan-hy3-preview	Tencent · tencent-hunyuan-community	1450	±12		2,686	$0.29 / $1.17	262.1K
125	98-148	deepseek-v3.1-thinking	DeepSeek · MIT	1448	±10		3,606	$1.23 / $4.94	N/A
126	89-162	deepseek-v3.1-terminus-thinking	DeepSeek · MIT	1446	±17		1,176	$0.27 / $1	163.8K
127	106-148	qwen3.5-27b	Alibaba · Apache 2.0	1445	±6		10,770	$0.20 / $1.56	262.1K
128	101-151	deepseek-v3.1	DeepSeek · MIT	1445	±9		4,815	$1.23 / $4.94	N/A
129	106-150	glm-4.5	Z.ai · MIT	1444	±7		8,333	$0.60 / $2.20	131.1K
130	106-151	qwen3-next-80b-a3b-instruct	Alibaba · Apache 2.0	1443	±7		8,192	$0.09 / $1.10	262.1K
131	107-150	claude-sonnet-4-20250514-thinking-32k	Anthropic · Proprietary	1443	±6		11,891	$3 / $15	1M
132	112-150	gpt-4.1-2025-04-14	OpenAI · Proprietary	1442	±5		16,937	$2 / $8	1M
133	113-151	claude-opus-4-20250514	Anthropic · Proprietary	1442	±6		14,922	$15 / $75	200K
134	120-151	mistral-medium-2508	Mistral · Proprietary	1441	±4		33,688	$0.40 / $2	131.1K
135	101-166	ernie-5.0-preview-1022	Baidu · Proprietary	1439	±14		1,642	N/A	N/A
136	120-156	qwen3-235b-a22b-no-thinking	Alibaba · Apache 2.0	1438	±6		12,794	$0.46 / $1.82	131.1K
137	122-156	step-3.5-flash	StepFun · Apache 2.0	1438	±5		21,655	$0.10 / $0.30	262.1K
138	122-156	mimo-v2-flash (non-thinking)	Xiaomi · MIT	1438	±5		17,752	$0.10 / $0.30	262.1K
139	112-164	qwen3-vl-235b-a22b-thinking	Alibaba · Apache 2.0	1437	±11		2,855	$0.40 / $4	131.1K
140	122-161	qwen3-coder-480b-a35b-instruct	Alibaba · Apache 2.0	1436	±7		8,719	$0.40 / $1.60	262.1K
141	124-159	minimax-m2.5	MiniMax · Modified MIT	1436	±6		15,819	$0.23 / $0.90	204.8K
142	124-163	grok-3-preview-02-24	SpaceXAI · Proprietary	1434	±7		9,342	$3 / $15	131.1K
143	122-173	qwen3-235b-a22b-thinking-2507	Alibaba · Apache 2.0	1433	±11		3,009	$0.23 / $2.30	262.1K
144	127-164	qwen3.5-flash	Alibaba · Proprietary	1432	±5		23,658	N/A	N/A
145	106-185	solar-pro4	Upstage · Proprietary	1431	±19		958	$0.03 / $0.12	524.3K
146	127-166	qwen3.5-35b-a3b	Alibaba · Apache 2.0	1431	±6		11,493	$0.25 / $1.25	262.1K
147	124-173	deepseek-r1	DeepSeek · MIT	1430	±9		3,954	$0.70 / $2.50	64K
148	130-173	qwen3-30b-a3b-instruct-2507	Alibaba · Apache 2.0	1430	±7		8,247	$0.05 / $0.19	262.1K
149	116-183	amazon-nova-experimental-chat-12-10	Amazon · Proprietary	1430	±16		1,204	N/A	N/A
150	117-182	deepseek-v3.1-terminus	DeepSeek · MIT	1430	±16		1,321	$0.27 / $1	163.8K
151	134-173	claude-sonnet-4-20250514	Anthropic · Proprietary	1428	±6		13,815	$3 / $15	1M
152	113-188	hunyuan-vision-1.5-thinking	Tencent · Proprietary	1427	±20		796	N/A	N/A
153	134-173	trinity-large-preview	Apache 2.0	1427	±6		11,496	$0.15 / $0.45	131K
154	134-175	grok-4-fast-reasoning	SpaceXAI · Proprietary	1426	±7		6,824	$0.20 / $0.50	2M
155	134-179	mimo-v2-flash (thinking)	Xiaomi · MIT	1426	±10		3,764	$0.10 / $0.30	262.1K
156	134-179	glm-4.7-flash	Z.ai · MIT	1424	±9		4,271	$0.06 / $0.40	202.8K
157	138-175	grok-4-0709	SpaceXAI · Proprietary	1424	±6		14,389	$3 / $15	256K
158	138-175	deepseek-v3-0324	DeepSeek · MIT	1424	±6		14,677	$3 / $4.50	32.8K
159	137-179	minimax-m2.1-preview	MiniMax · MIT	1423	±8		5,813	$0.30 / $1.20	204.8K
160	137-179	o1-2024-12-17	OpenAI · Proprietary	1423	±8		6,584	$15 / $60	200K
161	139-178	gemini-2.5-flash-preview-09-2025	Google · Proprietary	1422	±6		11,842	$0.30 / $2.50	1M
162	140-179	mistral-medium-2505	Mistral · Proprietary	1422	±6		10,850	$0.40 / $2	131.1K
163	143-175	gemini-2.5-flash	Google · Proprietary	1422	±4		43,818	$0.15 / $1.25	1M
164	141-179	o4-mini-2025-04-16	OpenAI · Proprietary	1421	±6		15,047	$1.10 / $4.40	200K
165	145-184	gpt-4.1-mini-2025-04-14	OpenAI · Proprietary	1418	±6		12,771	$0.40 / $1.60	1M
166	145-185	claude-3-7-sonnet-20250219-thinking-32k	Anthropic · Proprietary	1418	±6		11,753	$3 / $15	200K
167	145-187	qwen3-235b-a22b	Alibaba · Apache 2.0	1416	±7		8,129	$0.46 / $1.82	131.1K
168	145-187	gpt-5-mini-high	OpenAI · Proprietary	1416	±7		9,097	$0.13 / $1	400K
169	150-187	glm-4.5-air	Z.ai · MIT	1414	±6		10,717	$0.13 / $0.85	131.1K
170	137-198	nvidia-nemotron-3.5-lightning-30b-a3b-nvfp4	Nvidia · OpenMDW-1.1	1413	±17	Preliminary	1,384	N/A	N/A
171	145-194	hunyuan-turbos-20250416	Tencent · Proprietary	1413	±11		3,091	N/A	N/A
172	150-194	o3-mini-high	OpenAI · Proprietary	1411	±9		4,338	$0.55 / $2.20	200K
173	155-194	amazon-nova-experimental-chat-11-10	Amazon · Proprietary	1410	±7		8,778	N/A	N/A
174	145-199	hunyuan-t1-20250711	Tencent · Proprietary	1410	±15		1,567	N/A	N/A
175	154-195	qwen3-next-80b-a3b-thinking	Alibaba · Apache 2.0	1409	±9		4,872	$0.15 / $1.20	262.1K
176	163-194	claude-3-5-sonnet-20241022	Anthropic · Proprietary	1408	±5		25,324	$3 / $15	200K
177	161-196	o1-preview	OpenAI · Proprietary	1407	±8		8,206	$15 / $60	N/A
178	162-195	trinity-large-thinking	Apache 2.0	1407	±7		11,725	$0.22 / $0.85	262.1K
179	143-206	glm-4.6v	Z.ai · MIT	1406	±19		938	$0.30 / $0.90	131.1K
180	164-195	claude-3-7-sonnet-20250219	Anthropic · Proprietary	1406	±6		13,060	$3 / $15	200K
181	154-201	ling-flash-2.0	Ant Group · MIT	1406	±12		2,563	N/A	N/A
182	161-204	nvidia-nemotron-3-super-120b-a12b	Nvidia · NVIDIA Open Model	1402	±11		2,711	N/A	N/A
183	169-199	minimax-m1	MiniMax · Apache 2.0	1402	±6		11,708	$0.55 / $2.20	1M
184	161-207	intellect-3	MIT	1400	±14		1,731	$0.20 / $1.10	131.1K
185	170-200	gemini-2.5-flash-lite-preview-09-2025-no-thinking	Google · Proprietary	1400	±5		16,745	$0.10 / $0.40	1M
186	170-204	mistral-small-2506	Mistral · Apache 2.0	1399	±8		6,084	$0.10 / $0.30	32K
187	154-216	qwen3-32b	Alibaba · Apache 2.0	1398	±19		843	$0.08 / $0.28	131.1K
188	145-221	hunyuan-turbos-20250226	Tencent · Proprietary	1398	±25		470	N/A	N/A
189	170-204	qwen2.5-max	Alibaba · Proprietary	1398	±7		8,643	N/A	N/A
190	170-205	amazon-nova-experimental-chat-10-20	Amazon · Proprietary	1397	±10		3,890	N/A	N/A
191	166-213	glm-4.5v	Z.ai · MIT	1396	±14		1,763	$0.60 / $1.80	65.5K
192	170-215	step-3	StepFun · Apache 2.0	1392	±13		2,194	$0.57 / $1.42	65.5K
193	181-210	o3-mini	OpenAI · Proprietary	1390	±5		16,921	$0.55 / $2.20	200K
194	170-223	nvidia-llama-3.3-nemotron-super-49b-v1.5	Nvidia · Nvidia Open	1388	±16		1,204	$0.10 / $0.40	131.1K
195	166-233	llama-3.1-nemotron-ultra-253b-v1	Nvidia · Nvidia Open Model	1387	±24		588	$0.60 / $1.80	131.1K
196	183-214	gemini-2.5-flash-lite-preview-06-17-thinking	Google · Proprietary	1387	±6		11,023	$0.10 / $0.40	1M
197	183-215	gpt-oss-120b	OpenAI · Apache 2.0	1386	±6		10,535	$0.03 / $0.17	131.1K
198	178-221	minimax-m2	MiniMax · Apache 2.0	1385	±12		2,489	$0.26 / $1.02	204.8K
199	182-221	nova-2-lite	Amazon · Proprietary	1385	±9		4,271	$0.30 / $2.50	1M
200	183-221	deepseek-v3	DeepSeek · DeepSeek	1384	±8		5,176	$1.14 / $4.56	N/A
201	174-230	mercury-2	Inception AI · Proprietary	1383	±18		1,093	$0.25 / $0.75	128K
202	177-233	amazon-nova-experimental-chat-10-09	Amazon · Proprietary	1382	±18		1,001	N/A	N/A
203	179-230	qwen-plus-0125	Alibaba · Proprietary	1381	±15		1,419	$0.40 / $1.20	131.1K
204	189-221	command-a-03-2025	Cohere · CC-BY-NC-4.0	1381	±5		18,303	$2.50 / $10	256K
205	187-223	grok-3-mini-high	SpaceXAI · Proprietary	1380	±8		5,923	$0.25 / $1.27	N/A
206	189-223	grok-3-mini-beta	SpaceXAI · Proprietary	1379	±7		7,638	$0.30 / $0.50	131.1K
207	190-222	gemma-3-27b-it	Google · Gemma	1378	±6		14,470	$0.08 / $0.45	262.1K
208	188-227	olmo-3.1-32b-instruct	Ai2 · Apache 2.0	1377	±9		4,198	$0.20 / $0.60	65.5K
209	190-223	qwq-32b	Alibaba · Apache 2.0	1377	±7		7,493	$0.50 / $1	16.4K
210	191-225	o1-mini	OpenAI · Proprietary	1375	±6		13,214	$1.10 / $4.40	N/A
211	178-247	hunyuan-turbo-0110	Tencent · Proprietary	1375	±23		517	N/A	N/A
212	192-227	claude-3-5-sonnet-20240620	Anthropic · Proprietary	1374	±6		22,198	$3 / $15	200K
213	189-235	ring-flash-2.0	Ant Group · MIT	1373	±12		2,586	N/A	N/A
214	190-235	gpt-5-nano-high	OpenAI · Proprietary	1373	±11		2,896	$0.03 / $0.20	400K
215	195-233	qwen3-30b-a3b	Alibaba · Apache 2.0	1371	±7		8,352	$0.13 / $0.52	131.1K
216	195-232	gemini-2.0-flash-001	Google · Proprietary	1371	±6		12,288	$0.10 / $0.40	1M
217	194-247	deepseek-v2.5-1210	DeepSeek · DeepSeek	1365	±14		1,688	N/A	N/A
218	205-238	claude-3-5-haiku-20241022	Anthropic · Proprietary	1365	±5		20,063	$1 / $5	200K
219	205-240	llama-3.1-405b-instruct-bf16	Meta · Llama 3.1 Community	1364	±6		10,298	$4 / $4	32.8K
220	195-253	gpt-4.1-nano-2025-04-14	OpenAI · Proprietary	1362	±15		1,454	$0.10 / $0.40	1M
221	208-244	gpt-4o-2024-05-13	OpenAI · Proprietary	1360	±6		31,401	$5 / $15	128K
222	206-247	yi-lightning	Proprietary	1360	±8		7,070	N/A	N/A
223	210-247	llama-4-maverick-17b-128e-instruct	Meta · Llama 4	1359	±6		12,622	$0.63 / $1.80	131.1K
224	206-250	gpt-oss-20b	OpenAI · Apache 2.0	1359	±10		3,732	$0.03 / $0.13	131.1K
225	201-254	olmo-3-32b-think	Ai2 · Apache 2.0	1359	±14		1,954	$0.15 / $0.50	65.5K
226	195-262	hunyuan-large-2025-02-10	Tencent · Proprietary	1357	±20		828	N/A	N/A
227	210-252	nvidia-nemotron-3-nano-30b-a3b-bf16	Nvidia · NVIDIA Open Model	1357	±8		5,255	$0.06 / $0.24	262.1K
228	195-267	mercury	Inception AI · Proprietary	1356	±23		681	$0.25 / $0.75	128K
229	216-250	gemini-1.5-pro-002	Google · Proprietary	1356	±6		14,433	$3.50 / $10.50	2.1M
230	214-253	gemini-2.0-flash-lite-preview-02-05	Google · Proprietary	1355	±8		5,685	$0.07 / $0.30	1M
231	216-252	llama-3.1-405b-instruct-fp8	Meta · Llama 3.1 Community	1355	±6		15,817	$4 / $4	32.8K
232	186-274	molmo-2-8b	Ai2 · Apache 2.0	1354	±35		290	$0.20 / $0.20	36.9K
233	216-253	athene-v2-chat	NexusFlow	1354	±8		6,182	N/A	N/A
234	214-262	step-1o-turbo-202506	StepFun · Proprietary	1352	±11		2,859	N/A	N/A
235	208-264	step-2-16k-exp-202412	StepFun · Proprietary	1352	±16		1,200	N/A	N/A
236	218-254	grok-2-2024-08-13	SpaceXAI · Proprietary	1351	±6		16,648	$2 / $10	131.1K
237	208-267	granite-4.1-8b	IBM · Apache 2.0	1350	±16		1,565	$0.05 / $0.10	131.1K
238	218-256	llama-4-scout-17b-16e-instruct	Meta · Llama	1350	±7		9,794	$0.40 / $0.70	8.2K
239	217-260	deepseek-v2.5	DeepSeek · DeepSeek	1350	±8		6,692	N/A	N/A
240	211-266	glm-4-plus-0111	Z.ai · Proprietary	1350	±15		1,406	N/A	N/A
241	217-262	magistral-medium-2506	Mistral · Proprietary	1350	±10		4,084	$2 / $5	40K
242	200-273	llama-3.3-nemotron-49b-super-v1	Nvidia · Nvidia	1348	±24		493	N/A	N/A
243	219-262	gpt-4o-2024-08-06	OpenAI · Proprietary	1347	±7		11,864	$2.50 / $10	128K
244	218-266	qwen2.5-plus-1127	Alibaba · Proprietary	1346	±11		2,391	N/A	N/A
245	223-262	mistral-small-3.1-24b-instruct-2503	Mistral · Apache 2.0	1344	±6		11,150	$0.10 / $0.30	32K
246	219-266	qwen-max-0919	Alibaba · Qwen	1344	±9		4,410	$1.60 / $6.40	32.8K
247	223-264	mistral-large-2407	Mistral · Mistral Research	1343	±7		12,143	$2 / $6	131.1K
248	223-264	qwen2.5-72b-instruct	Alibaba · Qwen	1343	±7		10,448	$1.20 / $1.20	N/A
249	225-264	gemini-1.5-pro-001	Google · Proprietary	1342	±6		21,409	$3.50 / $10.50	2.1M
250	230-264	claude-3-opus-20240229	Anthropic · Proprietary	1341	±5		54,971	$15 / $75	200K
251	225-267	glm-4-plus	Z.ai · Proprietary	1341	±8		7,097	$0.44 / $1.76	204.8K
252	227-268	gemini-advanced-0514	Google · Proprietary	1340	±8		13,757	N/A	N/A
253	232-267	llama-3.3-70b-instruct	Meta · Llama-3.3	1339	±5		14,995	$0.10 / $0.32	131.1K
254	232-267	gpt-4o-mini-2024-07-18	OpenAI · Proprietary	1339	±6		17,800	$0.15 / $0.60	128K
255	233-269	gpt-4-turbo-2024-04-09	OpenAI · Proprietary	1337	±6		27,573	$10 / $30	128K
256	218-276	hunyuan-standard-2025-02-10	Tencent · Proprietary	1336	±19		880	N/A	N/A
257	219-278	gemma-3-12b-it	Google · Gemma	1335	±19		867	$0.05 / $0.15	131.1K
258	233-272	gemma-3n-e4b-it	Google · Gemma	1334	±8		6,644	$0.06 / $0.12	32.8K
259	234-272	mistral-large-2411	Mistral · MRL	1334	±7		6,815	$2 / $6	128K
260	234-273	athene-70b-0725	CC-BY-NC-4.0	1332	±9		5,037	N/A	N/A
261	233-274	olmo-3.1-32b-think	Ai2 · Apache 2.0	1331	±12		2,799	$0.15 / $0.50	65.5K
262	239-274	amazon-nova-pro-v1.0	Amazon · Proprietary	1330	±8		6,163	$0.80 / $3.20	300K
263	244-273	grok-2-mini-2024-08-13	SpaceXAI · Proprietary	1330	±6		13,865	$2 / $10	131.1K
264	233-278	hunyuan-large-vision	Tencent · Proprietary	1328	±14		1,826	N/A	N/A
265	244-278	deepseek-coder-v2	DeepSeek · DeepSeek License	1325	±10		4,344	$0.14 / $0.28	128K
266	239-282	llama-3.1-nemotron-70b-instruct	Nvidia · Llama 3.1	1325	±13		2,081	$1.20 / $1.20	131.1K
267	253-276	gpt-4-1106-preview	OpenAI · Proprietary	1324	±6		26,445	$10 / $30	128K
268	254-278	gemini-1.5-flash-002	Google · Proprietary	1322	±7		9,225	$0.07 / $0.30	1M
269	254-278	gpt-4-0125-preview	OpenAI · Proprietary	1320	±6		25,603	$10 / $30	128K
270	247-284	qwen2.5-coder-32b-instruct	Alibaba · Apache 2.0	1320	±15		1,381	$0.87 / $0.87	32K
271	252-284	ibm-granite-h-small	IBM · Apache 2.0	1319	±13		2,185	N/A	N/A
272	256-280	llama-3.1-70b-instruct	Meta · Llama 3.1 Community	1319	±6		14,811	$0.40 / $0.40	131.1K
273	254-291	llama-3.1-nemotron-51b-instruct	Nvidia · Llama 3.1	1311	±18		1,055	N/A	N/A
274	264-284	gemma-2-27b-it	Google · Gemma license	1310	±5		19,950	$0.65 / $0.65	8.2K
275	259-289	jamba-1.5-large	Jamba Open	1310	±12		2,339	$2 / $8	256K
276	269-285	claude-3-sonnet-20240229	Anthropic · Proprietary	1307	±6		31,448	$3 / $15	200K
277	270-285	gemini-1.5-flash-001	Google · Proprietary	1306	±7		17,507	$0.07 / $0.30	1M
278	264-289	mistral-small-24b-instruct-2501	Mistral · Apache 2.0	1306	±10		3,478	$0.05 / $0.08	32.8K
279	270-289	gpt-4-0314	OpenAI · Proprietary	1305	±8		14,549	$30 / $60	8.2K
280	269-296	reka-core-20240904	Proprietary	1301	±13		2,006	N/A	N/A
281	262-298	gemma-3-4b-it	Google · Gemma	1301	±19		986	$0.05 / $0.10	131.1K
282	271-294	nemotron-4-340b-instruct	Nvidia · NVIDIA Open Model	1300	±9		5,403	N/A	N/A
283	262-301	llama-3.1-tulu-3-70b	Ai2 · Llama 3.1	1299	±20		711	N/A	N/A
284	271-297	glm-4-0520	Z.ai · Proprietary	1297	±12		2,832	N/A	N/A
285	274-296	amazon-nova-lite-v1.0	Amazon · Proprietary	1296	±9		4,869	$0.06 / $0.24	300K
286	276-298	c4ai-aya-expanse-32b	Cohere · CC-BY-NC-4.0	1290	±8		7,302	N/A	N/A
287	276-298	phi-4	Microsoft · MIT	1290	±8		5,580	$0.07 / $0.14	16.4K
288	279-298	llama-3-70b-instruct	Meta · Llama 3 Community	1290	±6		45,062	$0.51 / $0.74	8.2K
289	280-300	gpt-4-0613	OpenAI · Proprietary	1286	±7		23,796	$30 / $60	8.2K
290	276-305	reka-flash-20240904	Proprietary	1286	±13		1,975	N/A	N/A
291	280-300	claude-3-haiku-20240307	Anthropic · Proprietary	1285	±6		34,258	$0.25 / $1.25	200K
292	279-306	gemma-2-9b-it-simpo	MIT	1282	±12		2,537	$0.03 / $0.09	8.2K
293	281-305	qwen2-72b-instruct	Alibaba · Qianwen LICENSE	1281	±8		10,308	$0.90 / $0.90	32.8K
294	283-304	gemma-2-9b-it	Google · Gemma license	1281	±6		14,591	$0.03 / $0.09	8.2K
295	276-313	hunyuan-standard-256k	Tencent · Proprietary	1278	±21		737	N/A	N/A
296	280-312	ministral-8b-2410	Mistral · MRL	1277	±16		1,252	$0.10 / $0.10	131.1K
297	288-307	gemini-1.5-flash-8b-001	Google · Proprietary	1274	±7		9,602	$0.07 / $0.30	1M
298	284-311	command-r-plus-08-2024	Cohere · CC-BY-NC-4.0	1273	±11		2,714	$2.50 / $10	128K
299	288-310	amazon-nova-micro-v1.0	Amazon · Proprietary	1272	±9		4,685	$0.04 / $0.14	128K
300	291-309	command-r-plus	Cohere · CC-BY-NC-4.0	1271	±7		22,666	$2.50 / $10	128K
301	291-310	mistral-large-2402	Mistral · Proprietary	1270	±7		17,516	$4 / $12	32K
302	281-319	olmo-2-0325-32b-instruct	Ai2 · Apache-2.0	1269	±21		740	$0.05 / $0.20	128K
303	290-313	command-r-08-2024	Cohere · CC-BY-NC-4.0	1268	±11		2,845	$0.15 / $0.60	128K
304	291-318	jamba-1.5-mini	Jamba Open	1264	±12		2,294	$0.20 / $0.40	256K
305	292-313	reka-flash-21b-20240226-online	Proprietary	1264	±11		4,673	N/A	N/A
306	295-318	qwen1.5-110b-chat	Alibaba · Qianwen LICENSE	1260	±9		7,665	N/A	N/A
307	296-319	qwen1.5-72b-chat	Alibaba · Qianwen LICENSE	1257	±8		10,756	N/A	N/A
308	300-320	mixtral-8x22b-instruct-v0.1	Mistral · Apache 2.0	1255	±7		14,389	$0.90 / $0.90	65.5K
309	299-323	reka-flash-21b-20240226	Proprietary	1253	±9		7,444	N/A	N/A
310	297-326	c4ai-aya-expanse-8b	Cohere · CC-BY-NC-4.0	1251	±12		2,471	N/A	N/A
311	294-329	granite-3.1-8b-instruct	IBM · Apache 2.0	1251	±21		780	N/A	N/A
312	301-326	gemini-pro-dev-api	Google · Proprietary	1247	±12		4,907	$0.35 / $1.05	32.8K
313	304-326	gpt-3.5-turbo-0125	OpenAI · Proprietary	1245	±7		18,975	$0.50 / $1.50	16.4K
314	304-326	llama-3.1-8b-instruct	Meta · Llama 3.1 Community	1245	±7		13,139	$0.05 / $0.08	131.1K
315	296-332	llama-3.1-tulu-3-8b	Ai2 · Llama 3.1	1244	±20		761	N/A	N/A
316	304-326	mistral-medium	Mistral · Proprietary	1243	±9		9,016	$2.70 / $8.10	32K
317	306-326	llama-3-8b-instruct	Meta · Llama 3 Community	1243	±7		29,645	$0.14 / $0.14	8.2K
318	304-328	qwen1.5-32b-chat	Alibaba · Qianwen LICENSE	1242	±9		6,351	N/A	N/A
319	308-328	command-r	Cohere · CC-BY-NC-4.0	1240	±7		15,749	$0.15 / $0.60	128K
320	309-330	yi-1.5-34b-chat	Apache-2.0	1238	±9		6,462	N/A	N/A
321	304-334	zephyr-orpo-141b-A35b-v0.1	Apache 2.0	1235	±17		1,344	N/A	N/A
322	309-333	internlm2_5-20b-chat	Other	1234	±12		2,727	$0 / $0	32.8K
323	310-334	qwen1.5-14b-chat	Alibaba · Qianwen LICENSE	1231	±11		5,248	$0.30 / $0.30	N/A
324	310-336	gpt-3.5-turbo-1106	OpenAI · Proprietary	1228	±13		4,128	$1 / $2	16.4K
325	309-338	gemini-pro	Google · Proprietary	1228	±19		1,416	$0.35 / $1.05	32.8K
326	318-334	mixtral-8x7b-instruct-v0.1	Mistral · Apache 2.0	1225	±7		20,131	$0.63 / $0.63	32K
327	316-336	dbrx-instruct-preview	DBRX LICENSE	1225	±9		9,343	$0.60 / $0.60	32.8K
328	310-341	granite-3.1-2b-instruct	IBM · Apache 2.0	1224	±20		828	N/A	N/A
329	319-338	phi-3-medium-4k-instruct	Microsoft · MIT	1221	±9		6,654	$0.17 / $0.68	N/A
330	316-341	granite-3.0-8b-instruct	IBM · Apache 2.0	1219	±15		1,825	N/A	N/A
331	320-339	starling-lm-7b-beta	Apache-2.0	1218	±11		4,831	N/A	N/A
332	322-341	gemma-1.1-7b-it	Google · Gemma license	1213	±9		7,051	$0.03 / $0.09	8.2K
333	321-343	openchat-3.5-0106	Apache-2.0	1211	±12		3,463	N/A	N/A
334	320-353	deepseek-llm-67b-chat	DeepSeek · DeepSeek License	1206	±19		1,219	N/A	N/A
335	327-347	snowflake-arctic-instruct	Apache 2.0	1205	±10		9,209	N/A	N/A
336	325-347	yi-34b-chat	Yi License	1205	±11		4,134	$0.90 / $0.90	4.1K
337	325-357	openchat-3.5	Apache-2.0	1200	±15		1,879	$0.20 / $0.20	N/A
338	330-349	gemma-2-2b-it	Google · Gemma license	1199	±7		11,839	N/A	N/A
339	329-353	phi-3-small-8k-instruct	Microsoft · MIT	1199	±10		5,136	$0.15 / $0.60	N/A
340	327-359	tulu-2-dpo-70b	AI2 ImpACT Low-risk	1198	±17		1,495	N/A	N/A
341	334-360	vicuna-33b	Non-commercial	1189	±10		5,525	$0 / $0	2K
342	330-366	openhermes-2.5-mistral-7b	Apache-2.0	1188	±17		1,192	$0.17 / $0.17	N/A
343	333-366	wizardlm-70b	Microsoft · Llama 2 Community	1187	±15		1,935	N/A	N/A
344	333-366	granite-3.0-2b-instruct	IBM · Apache 2.0	1186	±14		1,929	N/A	N/A
345	334-366	starling-lm-7b-alpha	CC-BY-NC-4.0	1186	±13		2,610	N/A	N/A
346	337-362	llama-2-70b-chat	Meta · Llama 2 Community	1183	±8		10,184	$0.70 / $2.80	4.1K
347	334-368	qwen1.5-7b-chat	Alibaba · Qianwen LICENSE	1180	±17		1,282	$0.20 / $0.20	N/A
348	337-366	phi-3-mini-4k-instruct-june-2024	Microsoft · MIT	1180	±11		3,104	$0.13 / $0.52	4.1K
349	334-368	nous-hermes-2-mixtral-8x7b-dpo	Apache-2.0	1179	±19		993	$0.90 / $0.90	N/A
350	339-368	mistral-7b-instruct-v0.2	Mistral · Apache-2.0	1177	±10		5,226	$0.20 / $0.20	32.8K
351	339-368	llama-3.2-3b-instruct	Meta · Llama 3.2	1174	±13		2,165	$0.05 / $0.33	131.1K
352	337-371	qwen-14b-chat	Alibaba · Qianwen LICENSE	1171	±18		1,173	N/A	N/A
353	337-372	solar-10.7b-instruct-v1.0	CC-BY-NC-4.0	1169	±21		981	$0.30 / $0.30	N/A
354	336-375	mpt-30b-chat	CC-BY-NC-SA-4.0	1169	±24		575	N/A	N/A
355	339-375	qwq-32b-preview	Alibaba · Apache 2.0	1167	±21		824	$0.50 / $1	16.4K
356	341-372	gemma-7b-it	Google · Gemma license	1165	±14		2,374	$0.05 / $0.08	8.2K
357	343-371	phi-3-mini-4k-instruct	Microsoft · MIT	1163	±10		5,715	$0.13 / $0.52	N/A
358	342-374	codellama-34b-instruct	Meta · Llama 2 Community	1162	±15		1,769	$0.35 / $1.40	16.4K
359	343-372	vicuna-13b	Llama 2 Community	1162	±11		4,692	$0.30 / $0.30	N/A
360	336-379	codellama-70b-instruct	Meta · Llama 2 Community	1162	±31		325	$0.70 / $2.80	16.4K
361	339-379	zephyr-7b-alpha	MIT	1159	±28		406	N/A	N/A
362	342-377	llama2-70b-steerlm-chat	Nvidia · Llama 2 Community	1158	±20		877	N/A	N/A
363	343-375	wizardlm-13b	Microsoft · Llama 2 Community	1157	±16		1,618	$0.30 / $0.30	N/A
364	348-375	llama-2-13b-chat	Meta · Llama 2 Community	1157	±10		4,910	$0.25 / $0.25	4.1K
365	348-375	gemma-1.1-2b-it	Google · Gemma license	1156	±12		3,194	N/A	N/A
366	340-379	dolphin-2.2.1-mistral-7b	Apache-2.0	1154	±28		366	$0.50 / $0.50	16.4K
367	340-380	falcon-180b-chat	Falcon-180B TII License	1149	±32		309	N/A	N/A
368	343-380	smollm2-1.7b-instruct	Apache 2.0	1147	±26		576	N/A	N/A
369	352-379	zephyr-7b-beta	MIT	1144	±14		2,598	$0.15 / $0.15	16.4K
370	352-379	palm-2	Google · Proprietary	1143	±15		2,077	$0.50 / $0.50	25.8K
371	354-379	phi-3-mini-128k-instruct	Microsoft · MIT	1141	±11		6,056	$0.13 / $0.52	N/A
372	352-380	stripedhyena-nous-7b	Apache 2.0	1137	±18		1,324	$0.20 / $0.20	N/A
373	357-380	vicuna-7b	Llama 2 Community	1131	±16		1,601	$0.20 / $0.20	N/A
374	358-380	mistral-7b-instruct	Mistral · Apache 2.0	1131	±16		2,096	$0.07 / $0.28	4.1K
375	357-380	gemma-2b-it	Google · Gemma license	1130	±18		1,285	$0.10 / $0.10	N/A
376	363-380	llama-3.2-1b-instruct	Meta · Llama 3.2	1127	±14		2,184	$0.03 / $0.20	60K
377	364-381	qwen1.5-4b-chat	Alibaba · Qianwen LICENSE	1119	±15		2,193	$0.10 / $0.10	N/A
378	363-382	guanaco-33b	Non-commercial	1117	±24		635	N/A	N/A
379	364-382	olmo-7b-instruct	Ai2 · Apache-2.0	1116	±17		1,474	$0.20 / $0.20	N/A
380	370-382	llama-2-7b-chat	Meta · Llama 2 Community	1112	±11		3,721	$0.15 / $0.15	4.1K
381	377-384	chatglm3-6b	Apache-2.0	1086	±20		1,082	N/A	N/A
382	378-386	gpt4all-13b-snoozy	Non-commercial	1075	±29		422	N/A	N/A
383	381-386	koala-13b	Non-commercial	1073	±18		1,572	N/A	N/A
384	381-387	mpt-7b-chat	CC-BY-NC-SA-4.0	1056	±22		882	N/A	N/A
385	382-388	RWKV-4-Raven-14B	Apache 2.0	1040	±20		1,072	N/A	N/A
386	382-389	chatglm2-6b	Apache-2.0	1033	±25		653	N/A	N/A
387	384-389	oasst-pythia-12b	Apache 2.0	1019	±19		1,409	N/A	N/A
388	385-391	alpaca-13b	Non-commercial	1008	±20		1,335	N/A	N/A
389	386-392	chatglm-6b	Non-commercial	997	±20		1,162	N/A	N/A
390	388-392	stablelm-tuned-alpha-7b	CC-BY-NC-SA-4.0	969	±24		742	N/A	N/A
391	388-392	fastchat-t5-3b	Apache 2.0	968	±21		955	N/A	N/A
392	389-392	dolly-v2-12b	MIT	963	±24		824	N/A	N/A
393	393-393	llama-13b	Meta · Non-commercial	902	±29		566	$0.23 / $0.23	N/A
```

## Category: Occupational: Writing, Literature, & Language (adjustment: None)

Source: https://arena.ai, Text Arena leaderboard, Categories panel, "Occupational: Writing, Literature, & Language" selected, Adjustments = None.
Date shown on page: Aug 19, 2026. Votes: 1,913,471. Models: 392. Captured row count: 392 (verified match).

```
1	1-1	claude-fable-5	Anthropic · Proprietary	1514	±8		6,369	$10 / $50	1M
2	2-7	claude-opus-4-6-high	Anthropic · Proprietary	1500	±6		18,237	$5 / $25	1M
3	2-8	claude-opus-4-7-high	Anthropic · Proprietary	1497	±6		15,011	$5 / $25	1M
4	2-13	claude-opus-4-6	Anthropic · Proprietary	1491	±6		18,433	$5 / $25	1M
5	2-18	claude-opus-5-high	Anthropic · Proprietary	1489	±8		7,122	$5 / $25	1M
6	2-24	gemini-3.7-flash-high	Google · Proprietary	1488	±16	Preliminary	1,504	$0.75 / $3.57	1M
7	4-20	claude-opus-4-7	Anthropic · Proprietary	1483	±6		15,379	$5 / $25	1M
8	3-24	gpt-5.6-sol-xhigh	OpenAI · Proprietary	1481	±9		4,770	$5 / $30	N/A
9	4-22	gemini-3-pro	Google · Proprietary	1481	±7		9,328	$2 / $12	1M
10	5-21	gemini-3.1-pro-preview	Google · Proprietary	1480	±5		24,077	$1 / $6	1M
11	4-28	gemini-3.6-flash-high	Google · Proprietary	1480	±10		4,423	$0.38 / $1.88	1M
12	5-26	claude-opus-4-8-high	Anthropic · Proprietary	1478	±7		11,334	$5 / $25	1M
13	4-31	claude-opus-5-max	Anthropic · Proprietary	1478	±11		3,506	$5 / $25	1M
14	2-49	muse-spark-1.2 (xHigh)	Meta · Proprietary	1475	±21		850	$1.25 / $4.25	N/A
15	5-31	gemini-3.5-flash-high	Google · Proprietary	1475	±8		7,212	$0.75 / $4.50	1M
16	4-38	qwen3.8-max	Alibaba · Proprietary	1474	±13		2,342	$2 / $6	1M
17	6-34	gpt-5.5-high	OpenAI · Proprietary	1471	±6		14,797	$2.50 / $15	1.1M
18	5-38	kimi-k3-max	Moonshot · Kimi K3 license	1471	±10		3,713	N/A	N/A
19	6-36	gemini-3.5-flash-medium	Google · Proprietary	1471	±8		7,065	$0.75 / $4.50	1M
20	7-38	claude-opus-4-8	Anthropic · Proprietary	1468	±7		11,384	$5 / $25	1M
21	9-41	claude-opus-4-5-20251101-high-32k	Anthropic · Proprietary	1466	±7		8,379	$5 / $25	200K
22	11-39	gpt-5.4-high	OpenAI · Proprietary	1466	±6		15,030	$2.50 / $15	1.1M
23	12-39	claude-opus-4-5-20251101	Anthropic · Proprietary	1465	±6		16,277	$5 / $25	200K
24	11-41	gpt-5.5	OpenAI · Proprietary	1465	±6		15,171	$2.50 / $15	1.1M
25	9-49	muse-spark-1.1	Meta · Proprietary	1464	±9		5,104	$1.25 / $4.25	N/A
26	5-64	glm-5.3-max	Z.ai · MIT	1463	±22		803	$1.40 / $4.40	1M
27	13-51	gpt-5.5-instant	OpenAI · Proprietary	1462	±8		6,291	$2.50 / $15	1.1M
28	13-52	gemini-3-flash	Google · Proprietary	1461	±8		6,888	$0.50 / $3	1M
29	15-51	gpt-5.4	OpenAI · Proprietary	1460	±6		15,386	$2.50 / $15	1.1M
30	12-60	muse-spark	Meta · Proprietary	1460	±11		3,138	N/A	N/A
31	15-61	qwen3.5-max-preview	Alibaba · Proprietary	1457	±9		4,892	$1.20 / $6	N/A
32	17-54	claude-sonnet-4-6	Anthropic · Proprietary	1456	±6		16,297	$1.50 / $7.50	1M
33	17-59	glm-5.1	Z.ai · MIT	1455	±7		10,504	$1.40 / $4.40	202.8K
34	16-61	glm-5.2-max	Z.ai · MIT	1455	±8		7,639	$1.40 / $4.40	1M
35	16-61	grok-4.5	SpaceXAI · Proprietary	1455	±9		5,480	$2 / $6	500K
36	24-60	claude-sonnet-4-5-20250929	Anthropic · Proprietary	1454	±5		18,422	$3 / $15	200K
37	8-70	qwen3.7-max-preview	Alibaba · Proprietary	1453	±21		853	$1.48 / $4.42	1M
38	20-62	gpt-5.2-chat-latest-20260210	OpenAI · Proprietary	1453	±7		8,070	$1.75 / $14	128K
39	24-61	mimo-v2.5-pro	Xiaomi · MIT	1452	±6		13,358	$0.43 / $0.87	1.1M
40	22-64	claude-sonnet-5-high	Anthropic · Proprietary	1451	±8		6,926	$1 / $5	1M
41	24-63	deepseek-v4-pro	DeepSeek · MIT	1451	±7		13,171	$1.32 / $3.96	1M
42	24-61	claude-sonnet-4-5-20250929-high-32k	Anthropic · Proprietary	1451	±5		18,860	$3 / $15	200K
43	22-64	grok-4.20-beta1	SpaceXAI · Proprietary	1451	±8		6,098	N/A	N/A
44	24-63	grok-4.20-beta-0309-reasoning	SpaceXAI · Proprietary	1450	±6		15,273	$1.25 / $2.50	1M
45	13-72	qwen3.6-max-preview	Alibaba · Proprietary	1450	±18		1,121	$1.03 / $6.16	262.1K
46	24-64	glm-5	Z.ai · MIT	1449	±8		6,600	$1 / $3.20	202.8K
47	28-64	gemini-3-flash (thinking-minimal)	Google · Proprietary	1448	±5		20,495	$0.50 / $3	1M
48	24-65	gpt-4.5-preview-2025-02-27	OpenAI · Proprietary	1447	±10		4,092	$75 / $150	128K
49	24-65	gpt-5.6-terra-xhigh	OpenAI · Proprietary	1447	±9		5,087	$2.50 / $15	N/A
50	15-79	grok-4.6-high	SpaceXAI · Proprietary	1447	±20	Preliminary	922	$2 / $6	500K
51	26-66	gemini-3.5-flash-lite	Google · Proprietary	1445	±10		4,425	$0.15 / $1.25	1M
52	29-65	grok-4.20-multi-agent-beta-0309	SpaceXAI · Proprietary	1445	±6		14,781	$1.25 / $2.50	1M
53	30-64	gemini-2.5-pro	Google · Proprietary	1445	±4		27,873	$0.63 / $5	1M
54	29-65	claude-opus-4-1-20250805-thinking-16k	Anthropic · Proprietary	1444	±6		11,081	$15 / $75	200K
55	31-65	claude-opus-4-1-20250805	Anthropic · Proprietary	1443	±5		17,398	$15 / $75	200K
56	30-66	deepseek-v4-pro-high-preview	DeepSeek · MIT	1443	±7		12,751	$1.32 / $3.96	1M
57	30-68	ernie-5.1	Baidu · Proprietary	1442	±7		8,948	N/A	N/A
58	33-69	qwen3.7-plus	Alibaba · Proprietary	1441	±7		8,337	$0.32 / $1.28	1M
59	39-74	kimi-k2.6	Moonshot · Modified MIT	1438	±7		8,849	$0.95 / $4	262.1K
60	38-78	gpt-5.6-luna-xhigh	OpenAI · Proprietary	1437	±9		5,170	$1 / $6	N/A
61	41-77	gpt-5.1-high	OpenAI · Proprietary	1437	±7		9,131	$0.63 / $5	400K
62	30-91	hy3	Tencent · Apache 2.0	1434	±16		1,424	$0.13 / $0.53	262.1K
63	30-94	gemma-4-31b	Google · Apache 2.0	1433	±16		1,354	$0.14 / $0.40	262.1K
64	26-106	deepseek-v4-pro-high-20260813	DeepSeek · MIT	1432	±22		719	$1.32 / $3.96	N/A
65	47-89	mimo-v2-pro	Xiaomi · Proprietary	1432	±8		5,649	$1 / $3	1M
66	54-85	chatgpt-4o-latest-20250326	OpenAI · Proprietary	1430	±5		18,701	$5 / $15	128K
67	52-89	claude-opus-4-20250514-thinking-16k	Anthropic · Proprietary	1430	±7		7,961	$15 / $75	200K
68	55-89	grok-4.1-thinking	SpaceXAI · Proprietary	1429	±6		14,882	N/A	N/A
69	56-89	kimi-k2.5-thinking	Moonshot · Modified MIT	1428	±6		16,695	$0.60 / $3	N/A
70	54-89	gpt-5.3-chat-latest	OpenAI · Proprietary	1427	±7		7,617	$1.75 / $14	128K
71	57-89	grok-4.1	SpaceXAI · Proprietary	1426	±6		14,935	N/A	N/A
72	58-90	gpt-5.4-mini-high	OpenAI · Proprietary	1425	±6		14,572	$0.75 / $4.50	400K
73	57-90	gpt-5.1	OpenAI · Proprietary	1425	±7		9,838	$0.63 / $5	400K
74	58-90	grok-4.3	SpaceXAI · Proprietary	1425	±6		15,086	$1.25 / $2.50	1M
75	59-96	qwen3.6-plus	Alibaba · Proprietary	1424	±7		10,483	$0.33 / $1.95	1M
76	59-96	minimax-m3	MiniMax · MiniMax Community License	1423	±7		9,810	$0.60 / $2.40	N/A
77	60-98	deepseek-v4-flash-high-preview	DeepSeek · MIT	1422	±7		11,843	$0.44 / $1.32	1M
78	62-96	qwen3.5-397b-a17b	Alibaba · Apache 2.0	1421	±6		16,382	$0.39 / $2.34	262.1K
79	62-98	gemini-3.1-flash-lite-preview	Google · Proprietary	1421	±6		14,507	$0.25 / $1.50	1M
80	62-103	ernie-5.0-0110	Baidu · Proprietary	1419	±7		8,020	N/A	N/A
81	63-103	claude-opus-4-20250514	Anthropic · Proprietary	1418	±7		9,492	$15 / $75	200K
82	63-103	deepseek-v4-flash	DeepSeek · MIT	1418	±7		11,736	$0.44 / $1.32	1M
83	62-119	glm-4.7	Z.ai · MIT	1415	±11		2,782	$0.40 / $1.75	204.8K
84	62-122	ernie-5.0-preview-1203	Baidu · Proprietary	1414	±13		2,165	N/A	N/A
85	62-124	glm-5v-turbo	Z.ai · Proprietary	1413	±13		2,379	$1.20 / $4	202.8K
86	63-124	deepseek-v3.2-exp	DeepSeek · MIT	1413	±12		2,630	$0.27 / $0.41	163.8K
87	73-114	gpt-5.2	OpenAI · Proprietary	1412	±5		19,071	$0.88 / $7	400K
88	73-118	mimo-v2.5	Xiaomi · MIT	1411	±7		10,773	$0.14 / $0.28	1.1M
89	74-120	deepseek-v3.2	DeepSeek · MIT	1410	±6		10,442	$0.27 / $0.40	163.8K
90	63-134	gemma-4-26b-a4b	Google · Apache 2.0	1410	±16		1,324	N/A	N/A
91	59-144	deepseek-v3.1-terminus-thinking	DeepSeek · MIT	1409	±21		776	$0.27 / $1	163.8K
92	77-120	gpt-5.2-high	OpenAI · Proprietary	1409	±6		11,049	$0.88 / $7	400K
93	69-128	deepseek-v3.1-thinking	DeepSeek · MIT	1408	±11		2,768	$1.23 / $4.94	N/A
94	79-120	dola-seed-2.0-pro	Bytedance · Proprietary	1408	±6		17,712	N/A	N/A
95	79-122	grok-4-1-fast-reasoning	SpaceXAI · Proprietary	1407	±6		13,036	$0.20 / $0.50	2M
96	61-145	deepseek-v3.1-terminus	DeepSeek · MIT	1407	±21		810	$0.27 / $1	163.8K
97	79-126	gpt-5-chat	OpenAI · Proprietary	1407	±8		6,835	$1.25 / $10	N/A
98	74-134	mistral-medium-3.5	Mistral · Modified MIT	1406	±12		2,728	$1.50 / $7.50	262.1K
99	79-128	grok-3-preview-02-24	SpaceXAI · Proprietary	1405	±7		7,830	$3 / $15	131.1K
100	79-128	qwen3-max-preview	Alibaba · Proprietary	1405	±8		6,242	$0.78 / $3.90	262.1K
101	73-142	kimi-k2.5-instant	Moonshot · Modified MIT	1405	±13		1,858	$0.45 / $2.25	262.1K
102	82-128	glm-4.6	Z.ai · MIT	1404	±7		8,034	$0.50 / $2	204.8K
103	82-128	gpt-4.1-2025-04-14	OpenAI · Proprietary	1404	±6		11,458	$2 / $8	1M
104	83-127	gemini-2.5-flash	Google · Proprietary	1403	±4		28,162	$0.15 / $1.25	1M
105	77-143	qwen3-max-2025-09-23	Alibaba · Proprietary	1403	±13		1,990	$0.78 / $3.90	262.1K
106	83-130	deepseek-v3.2-thinking	DeepSeek · MIT	1402	±7		9,447	$0.27 / $0.40	163.8K
107	72-149	ernie-5.0-preview-1022	Baidu · Proprietary	1401	±17		1,126	N/A	N/A
108	83-142	mimo-v2-omni	Xiaomi · Proprietary	1400	±9		4,822	$0.40 / $2	262.1K
109	85-132	claude-haiku-4-5-20251001	Anthropic · Proprietary	1400	±4		28,394	$1 / $5	200K
110	83-143	inkling	Thinky · Apache 2.0	1399	±9		4,543	$1 / $4.05	524.3K
111	82-147	deepseek-v3.2-exp-thinking	DeepSeek · MIT	1398	±13		2,120	$0.27 / $0.41	163.8K
112	86-134	kimi-k2-thinking-turbo	Moonshot · Modified MIT	1398	±6		14,156	$1.15 / $8	262.1K
113	83-144	deepseek-v3.1	DeepSeek · MIT	1398	±10		3,481	$1.23 / $4.94	N/A
114	84-142	grok-4-0709	SpaceXAI · Proprietary	1398	±7		9,213	$3 / $15	256K
115	84-142	claude-sonnet-4-20250514-thinking-32k	Anthropic · Proprietary	1398	±7		7,554	$3 / $15	1M
116	84-142	o1-2024-12-17	OpenAI · Proprietary	1397	±7		7,663	$15 / $60	200K
117	84-144	gpt-5-high	OpenAI · Proprietary	1397	±8		7,092	$0.63 / $5	400K
118	91-136	qwen3-235b-a22b-instruct-2507	Alibaba · Apache 2.0	1396	±5		21,818	$0.26 / $1.06	N/A
119	89-143	o3-2025-04-16	OpenAI · Proprietary	1396	±6		13,389	$2 / $8	200K
120	89-144	gemini-2.5-flash-preview-09-2025	Google · Proprietary	1395	±7		7,358	$0.30 / $2.50	1M
121	91-147	longcat-flash-chat-2602-exp	Meituan · Proprietary	1393	±8		6,499	N/A	N/A
122	83-153	grok-4-fast-chat	SpaceXAI · Proprietary	1393	±15		1,531	$3 / $15	256K
123	94-147	claude-3-7-sonnet-20250219-thinking-32k	Anthropic · Proprietary	1392	±7		8,894	$3 / $15	200K
124	93-151	deepseek-r1-0528	DeepSeek · MIT	1390	±10		4,245	$0.50 / $2.15	163.8K
125	102-149	mistral-large-3	Mistral · Apache 2.0	1389	±6		14,679	$0.50 / $1.50	N/A
126	100-151	qwen3.5-122b-a10b	Alibaba · Apache 2.0	1389	±8		6,463	$0.26 / $2.08	262.1K
127	101-151	claude-sonnet-4-20250514	Anthropic · Proprietary	1388	±7		8,683	$3 / $15	1M
128	83-164	muse-glimmer	Meta · Apache-2.0	1388	±20		929	N/A	N/A
129	93-156	nvidia-nemotron-3-ultra-550b-a55b-nvfp4	Nvidia · OpenMDW-1.1	1388	±12		2,739	N/A	N/A
130	106-149	mistral-medium-2508	Mistral · Proprietary	1387	±5		21,445	$0.40 / $2	131.1K
131	101-156	grok-4-fast-reasoning	SpaceXAI · Proprietary	1386	±9		4,224	$0.20 / $0.50	2M
132	105-151	deepseek-v3-0324	DeepSeek · MIT	1386	±6		10,399	$3 / $4.50	32.8K
133	95-161	qwen3-vl-235b-a22b-instruct	Alibaba · Apache 2.0	1386	±13		2,384	$0.21 / $1.90	262.1K
134	106-152	minimax-m2.7	MiniMax · Modified MIT	1385	±6		14,301	$0.30 / $1.20	204.8K
135	106-158	glm-4.5	Z.ai · MIT	1383	±8		5,404	$0.60 / $2.20	131.1K
136	83-175	hunyuan-vision-1.5-thinking	Tencent · Proprietary	1382	±26		498	N/A	N/A
137	111-160	deepseek-r1	DeepSeek · MIT	1382	±8		5,355	$0.70 / $2.50	64K
138	114-160	o1-preview	OpenAI · Proprietary	1381	±8		8,360	$15 / $60	N/A
139	100-169	hunyuan-hy3-preview	Tencent · tencent-hunyuan-community	1381	±16		1,520	$0.29 / $1.17	262.1K
140	106-164	kimi-k2-0905-preview	Moonshot · Modified MIT	1380	±12		2,614	$0.60 / $2.50	262.1K
141	118-163	qwen3.5-27b	Alibaba · Apache 2.0	1379	±8		6,155	$0.20 / $1.56	262.1K
142	122-162	claude-3-7-sonnet-20250219	Anthropic · Proprietary	1378	±6		9,822	$3 / $15	200K
143	119-163	gemini-2.5-flash-lite-preview-06-17-thinking	Google · Proprietary	1378	±7		7,170	$0.10 / $0.40	1M
144	122-163	qwen3-235b-a22b-no-thinking	Alibaba · Apache 2.0	1378	±7		8,144	$0.46 / $1.82	131.1K
145	106-169	qwen3-235b-a22b-thinking-2507	Alibaba · Apache 2.0	1378	±14		1,876	$0.23 / $2.30	262.1K
146	125-162	claude-3-5-sonnet-20241022	Anthropic · Proprietary	1376	±5		21,908	$3 / $15	200K
147	102-181	amazon-nova-experimental-chat-26-02-10	Amazon · Proprietary	1374	±21		694	N/A	N/A
148	125-169	kimi-k2-0711-preview	Moonshot · Modified MIT	1373	±8		6,073	$0.60 / $2.50	131.1K
149	106-182	amazon-nova-experimental-chat-12-10	Amazon · Proprietary	1372	±20		836	N/A	N/A
150	105-183	amazon-nova-experimental-chat-26-01-10	Amazon · Proprietary	1372	±21		763	N/A	N/A
151	131-169	minimax-m2.5	MiniMax · Modified MIT	1371	±7		9,634	$0.23 / $0.90	204.8K
152	131-169	gemini-2.5-flash-lite-preview-09-2025-no-thinking	Google · Proprietary	1371	±6		10,554	$0.10 / $0.40	1M
153	131-170	mistral-medium-2505	Mistral · Proprietary	1370	±8		7,253	$0.40 / $2	131.1K
154	133-170	mimo-v2-flash (non-thinking)	Xiaomi · MIT	1369	±6		10,508	$0.10 / $0.30	262.1K
155	134-170	qwen3.5-flash	Alibaba · Proprietary	1368	±6		13,606	N/A	N/A
156	119-188	hunyuan-t1-20250711	Tencent · Proprietary	1368	±18		1,025	N/A	N/A
157	133-175	qwen3-coder-480b-a35b-instruct	Alibaba · Apache 2.0	1367	±8		5,403	$0.40 / $1.60	262.1K
158	137-170	step-3.5-flash	StepFun · Apache 2.0	1366	±6		13,945	$0.10 / $0.30	262.1K
159	136-175	qwen3.5-35b-a3b	Alibaba · Apache 2.0	1365	±8		6,675	$0.25 / $1.25	262.1K
160	139-175	gpt-5.4-nano-high	OpenAI · Proprietary	1365	±6		14,222	$0.20 / $1.25	400K
161	134-176	minimax-m2.1-preview	MiniMax · MIT	1364	±10		3,951	$0.30 / $1.20	204.8K
162	130-186	qwen3-vl-235b-a22b-thinking	Alibaba · Apache 2.0	1364	±14		1,779	$0.40 / $4	131.1K
163	142-175	qwen2.5-max	Alibaba · Proprietary	1362	±7		8,210	N/A	N/A
164	144-179	gpt-4.1-mini-2025-04-14	OpenAI · Proprietary	1360	±7		8,740	$0.40 / $1.60	1M
165	144-183	trinity-large-preview	Apache 2.0	1359	±8		6,878	$0.15 / $0.45	131K
166	144-195	mimo-v2-flash (thinking)	Xiaomi · MIT	1356	±12		2,440	$0.10 / $0.30	262.1K
167	149-190	deepseek-v3	DeepSeek · DeepSeek	1356	±8		5,913	$1.14 / $4.56	N/A
168	129-210	glm-4.6v	Z.ai · MIT	1356	±24		610	$0.30 / $0.90	131.1K
169	144-195	hunyuan-turbos-20250416	Tencent · Proprietary	1355	±12		2,548	N/A	N/A
170	144-196	longcat-flash-chat	Meituan · MIT	1354	±12		2,521	$0.20 / $0.80	131.1K
171	153-190	gemma-3-27b-it	Google · Gemma	1354	±6		10,722	$0.08 / $0.45	262.1K
172	153-192	o4-mini-2025-04-16	OpenAI · Proprietary	1354	±6		10,131	$1.10 / $4.40	200K
173	153-190	gemini-1.5-pro-002	Google · Proprietary	1354	±6		14,953	$3.50 / $10.50	2.1M
174	153-191	gemini-2.0-flash-001	Google · Proprietary	1354	±6		10,580	$0.10 / $0.40	1M
175	153-195	gpt-5-mini-high	OpenAI · Proprietary	1352	±8		6,184	$0.13 / $1	400K
176	159-196	command-a-03-2025	Cohere · CC-BY-NC-4.0	1348	±6		12,871	$2.50 / $10	256K
177	159-199	gemini-2.0-flash-lite-preview-02-05	Google · Proprietary	1347	±7		6,681	$0.07 / $0.30	1M
178	158-206	grok-3-mini-high	SpaceXAI · Proprietary	1345	±10		3,641	$0.25 / $1.27	N/A
179	160-203	qwen3-235b-a22b	Alibaba · Apache 2.0	1345	±8		6,211	$0.46 / $1.82	131.1K
180	160-203	trinity-large-thinking	Apache 2.0	1345	±8		6,910	$0.22 / $0.85	262.1K
181	164-200	gpt-4o-2024-05-13	OpenAI · Proprietary	1345	±6		29,959	$5 / $15	128K
182	162-206	qwen3-next-80b-a3b-instruct	Alibaba · Apache 2.0	1343	±8		5,095	$0.09 / $1.10	262.1K
183	164-207	qwen3-30b-a3b-instruct-2507	Alibaba · Apache 2.0	1342	±8		5,149	$0.05 / $0.19	262.1K
184	165-208	grok-3-mini-beta	SpaceXAI · Proprietary	1341	±9		4,836	$0.30 / $0.50	131.1K
185	166-207	glm-4.5-air	Z.ai · MIT	1341	±7		7,071	$0.13 / $0.85	131.1K
186	166-210	o3-mini-high	OpenAI · Proprietary	1341	±9		4,762	$0.55 / $2.20	200K
187	170-207	gpt-4o-2024-08-06	OpenAI · Proprietary	1340	±7		12,147	$2.50 / $10	128K
188	169-210	gemini-advanced-0514	Google · Proprietary	1340	±8		13,201	N/A	N/A
189	165-214	qwen3-next-80b-a3b-thinking	Alibaba · Apache 2.0	1339	±11		3,099	$0.15 / $1.20	262.1K
190	164-217	Inkling Small	Thinky · Apache 2.0	1339	±12		2,882	$0.45 / $1.20	524.3K
191	161-223	intellect-3	MIT	1336	±17		1,283	$0.20 / $1.10	131.1K
192	171-219	glm-4.7-flash	Z.ai · MIT	1334	±12		2,570	$0.06 / $0.40	202.8K
193	176-217	gemini-1.5-pro-001	Google · Proprietary	1333	±7		20,950	$3.50 / $10.50	2.1M
194	159-241	hunyuan-turbos-20250226	Tencent · Proprietary	1332	±21		662	N/A	N/A
195	171-228	glm-4-plus-0111	Z.ai · Proprietary	1332	±15		1,459	N/A	N/A
196	176-219	amazon-nova-experimental-chat-11-10	Amazon · Proprietary	1332	±8		5,697	N/A	N/A
197	178-219	minimax-m1	MiniMax · Apache 2.0	1331	±7		7,847	$0.55 / $2.20	1M
198	180-219	claude-3-5-sonnet-20240620	Anthropic · Proprietary	1330	±6		21,916	$3 / $15	200K
199	180-219	gpt-4-turbo-2024-04-09	OpenAI · Proprietary	1329	±6		24,529	$10 / $30	128K
200	178-222	mistral-small-2506	Mistral · Apache 2.0	1329	±10		3,815	$0.10 / $0.30	32K
201	186-220	grok-2-2024-08-13	SpaceXAI · Proprietary	1327	±6		17,406	$2 / $10	131.1K
202	177-244	nvidia-nemotron-3-super-120b-a12b	Nvidia · NVIDIA Open Model	1325	±14		1,628	N/A	N/A
203	189-224	o3-mini	OpenAI · Proprietary	1324	±6		13,500	$0.55 / $2.20	200K
204	174-250	hunyuan-turbo-0110	Tencent · Proprietary	1323	±20		711	N/A	N/A
205	171-254	solar-pro4	Upstage · Proprietary	1323	±24		664	$0.03 / $0.12	524.3K
206	180-247	qwen-plus-0125	Alibaba · Proprietary	1321	±15		1,512	$0.40 / $1.20	131.1K
207	178-250	glm-4.5v	Z.ai · MIT	1321	±17		1,099	$0.60 / $1.80	65.5K
208	176-254	llama-3.1-nemotron-ultra-253b-v1	Nvidia · Nvidia Open Model	1320	±21		712	$0.60 / $1.80	131.1K
209	182-250	step-2-16k-exp-202412	StepFun · Proprietary	1319	±16		1,326	N/A	N/A
210	186-251	step-3	StepFun · Apache 2.0	1317	±15		1,416	$0.57 / $1.42	65.5K
211	190-248	amazon-nova-experimental-chat-10-20	Amazon · Proprietary	1316	±12		2,536	N/A	N/A
212	198-244	claude-3-opus-20240229	Anthropic · Proprietary	1315	±5		49,929	$15 / $75	200K
213	197-246	llama-3.1-405b-instruct-fp8	Meta · Llama 3.1 Community	1315	±6		15,999	$4 / $4	32.8K
214	190-252	deepseek-v2.5-1210	DeepSeek · DeepSeek	1314	±13		1,930	N/A	N/A
215	199-247	gpt-4o-mini-2024-07-18	OpenAI · Proprietary	1314	±6		18,539	$0.15 / $0.60	128K
216	189-259	gemma-3-12b-it	Google · Gemma	1313	±18		1,010	$0.05 / $0.15	131.1K
217	201-247	claude-3-5-haiku-20241022	Anthropic · Proprietary	1313	±5		16,986	$1 / $5	200K
218	200-247	llama-4-maverick-17b-128e-instruct	Meta · Llama 4	1312	±7		8,818	$0.63 / $1.80	131.1K
219	201-247	llama-3.1-405b-instruct-bf16	Meta · Llama 3.1 Community	1311	±6		11,150	$4 / $4	32.8K
220	185-267	llama-3.3-nemotron-49b-super-v1	Nvidia · Nvidia	1311	±23		614	N/A	N/A
221	202-248	o1-mini	OpenAI · Proprietary	1310	±6		14,272	$1.10 / $4.40	N/A
222	201-251	gpt-oss-120b	OpenAI · Apache 2.0	1310	±8		6,728	$0.03 / $0.17	131.1K
223	190-264	hunyuan-large-2025-02-10	Tencent · Proprietary	1309	±19		890	N/A	N/A
224	189-271	mercury-2	Inception AI · Proprietary	1309	±22		704	$0.25 / $0.75	128K
225	201-252	glm-4-plus	Z.ai · Proprietary	1309	±8		7,164	$0.44 / $1.76	204.8K
226	202-251	gemini-1.5-flash-002	Google · Proprietary	1309	±7		9,441	$0.07 / $0.30	1M
227	192-264	qwen3-32b	Alibaba · Apache 2.0	1307	±17		1,121	$0.08 / $0.28	131.1K
228	202-253	qwq-32b	Alibaba · Apache 2.0	1307	±8		6,175	$0.50 / $1	16.4K
229	202-256	qwen-max-0919	Alibaba · Qwen	1307	±9		4,631	$1.60 / $6.40	32.8K
230	202-253	gpt-4-1106-preview	OpenAI · Proprietary	1307	±7		24,682	$10 / $30	128K
231	202-254	llama-4-scout-17b-16e-instruct	Meta · Llama	1306	±8		6,782	$0.40 / $0.70	8.2K
232	189-275	amazon-nova-experimental-chat-10-09	Amazon · Proprietary	1305	±23		617	N/A	N/A
233	202-254	gpt-4-0125-preview	OpenAI · Proprietary	1305	±7		23,492	$10 / $30	128K
234	202-259	qwen3-30b-a3b	Alibaba · Apache 2.0	1304	±8		5,999	$0.13 / $0.52	131.1K
235	192-276	nvidia-nemotron-3.5-lightning-30b-a3b-nvfp4	Nvidia · OpenMDW-1.1	1303	±22	Preliminary	900	N/A	N/A
236	203-259	yi-lightning	Proprietary	1303	±8		7,632	N/A	N/A
237	205-259	mistral-large-2407	Mistral · Mistral Research	1302	±7		12,224	$2 / $6	131.1K
238	202-264	olmo-3.1-32b-instruct	Ai2 · Apache 2.0	1301	±12		2,673	$0.20 / $0.60	65.5K
239	202-269	step-1o-turbo-202506	StepFun · Proprietary	1301	±14		1,850	N/A	N/A
240	202-274	minimax-m2	MiniMax · Apache 2.0	1300	±16		1,493	$0.26 / $1.02	204.8K
241	206-264	gemma-3n-e4b-it	Google · Gemma	1300	±9		4,933	$0.06 / $0.12	32.8K
242	203-268	nova-2-lite	Amazon · Proprietary	1299	±12		2,777	$0.30 / $2.50	1M
243	202-274	gpt-4.1-nano-2025-04-14	OpenAI · Proprietary	1299	±14		1,583	$0.10 / $0.40	1M
244	211-264	mistral-large-2411	Mistral · MRL	1298	±7		7,416	$2 / $6	128K
245	198-279	nvidia-llama-3.3-nemotron-super-49b-v1.5	Nvidia · Nvidia Open	1298	±22		668	$0.10 / $0.40	131.1K
246	202-277	gemma-3-4b-it	Google · Gemma	1297	±17		1,080	$0.05 / $0.10	131.1K
247	216-262	gemma-2-27b-it	Google · Gemma license	1297	±6		20,390	$0.65 / $0.65	8.2K
248	221-267	grok-2-mini-2024-08-13	SpaceXAI · Proprietary	1294	±6		14,508	$2 / $10	131.1K
249	203-280	hunyuan-standard-2025-02-10	Tencent · Proprietary	1293	±18		937	N/A	N/A
250	205-280	hunyuan-large-vision	Tencent · Proprietary	1292	±18		1,095	N/A	N/A
251	213-277	magistral-medium-2506	Mistral · Proprietary	1291	±12		2,427	$2 / $5	40K
252	228-273	llama-3.3-70b-instruct	Meta · Llama-3.3	1291	±6		13,856	$0.10 / $0.32	131.1K
253	227-274	gemini-1.5-flash-001	Google · Proprietary	1291	±7		16,463	$0.07 / $0.30	1M
254	227-274	mistral-small-3.1-24b-instruct-2503	Mistral · Apache 2.0	1290	±7		7,165	$0.10 / $0.30	32K
255	213-280	gpt-5-nano-high	OpenAI · Proprietary	1289	±14		1,756	$0.03 / $0.20	400K
256	223-279	qwen2.5-plus-1127	Alibaba · Proprietary	1289	±11		2,823	N/A	N/A
257	219-282	ring-flash-2.0	Ant Group · MIT	1286	±15		1,506	N/A	N/A
258	233-279	gpt-4-0613	OpenAI · Proprietary	1284	±7		22,099	$30 / $60	8.2K
259	232-280	deepseek-v2.5	DeepSeek · DeepSeek	1283	±8		6,613	N/A	N/A
260	233-280	gpt-4-0314	OpenAI · Proprietary	1283	±8		12,861	$30 / $60	8.2K
261	238-280	qwen2.5-72b-instruct	Alibaba · Qwen	1282	±7		10,827	$1.20 / $1.20	N/A
262	232-286	ling-flash-2.0	Ant Group · MIT	1279	±15		1,471	N/A	N/A
263	243-282	athene-v2-chat	NexusFlow	1278	±8		6,686	N/A	N/A
264	242-283	athene-70b-0725	CC-BY-NC-4.0	1278	±9		5,378	N/A	N/A
265	232-287	olmo-3-32b-think	Ai2 · Apache 2.0	1278	±16		1,345	$0.15 / $0.50	65.5K
266	228-288	llama-3.1-tulu-3-70b	Ai2 · Llama 3.1	1277	±20		758	N/A	N/A
267	238-286	jamba-1.5-large	Jamba Open	1276	±13		2,350	$2 / $8	256K
268	240-286	command-r-plus-08-2024	Cohere · CC-BY-NC-4.0	1276	±11		2,672	$2.50 / $10	128K
269	228-290	granite-4.1-8b	IBM · Apache 2.0	1276	±21		951	$0.05 / $0.10	131.1K
270	241-288	gpt-oss-20b	OpenAI · Apache 2.0	1274	±13		2,203	$0.03 / $0.13	131.1K
271	243-286	gemma-2-9b-it-simpo	MIT	1274	±12		2,801	$0.03 / $0.09	8.2K
272	250-284	amazon-nova-pro-v1.0	Amazon · Proprietary	1273	±7		6,609	$0.80 / $3.20	300K
273	244-288	reka-core-20240904	Proprietary	1271	±14		1,890	N/A	N/A
274	249-288	nvidia-nemotron-3-nano-30b-a3b-bf16	Nvidia · NVIDIA Open Model	1271	±10		3,500	$0.06 / $0.24	262.1K
275	255-286	claude-3-sonnet-20240229	Anthropic · Proprietary	1269	±7		27,297	$3 / $15	200K
276	248-290	olmo-3.1-32b-think	Ai2 · Apache 2.0	1269	±14		1,954	$0.15 / $0.50	65.5K
277	242-293	llama-3.1-nemotron-51b-instruct	Nvidia · Llama 3.1	1269	±18		1,007	N/A	N/A
278	261-286	gemma-2-9b-it	Google · Gemma license	1268	±6		14,640	$0.03 / $0.09	8.2K
279	252-293	llama-3.1-nemotron-70b-instruct	Nvidia · Llama 3.1	1265	±14		1,828	$1.20 / $1.20	131.1K
280	263-289	llama-3.1-70b-instruct	Meta · Llama 3.1 Community	1263	±6		14,962	$0.40 / $0.40	131.1K
281	252-296	ibm-granite-h-small	IBM · Apache 2.0	1260	±18		1,214	N/A	N/A
282	238-301	mercury	Inception AI · Proprietary	1260	±29		464	$0.25 / $0.75	128K
283	265-293	command-r-plus	Cohere · CC-BY-NC-4.0	1259	±7		19,567	$2.50 / $10	128K
284	261-296	reka-flash-20240904	Proprietary	1258	±13		1,950	N/A	N/A
285	264-295	nemotron-4-340b-instruct	Nvidia · NVIDIA Open Model	1258	±9		5,386	N/A	N/A
286	272-296	gemini-1.5-flash-8b-001	Google · Proprietary	1254	±7		9,499	$0.07 / $0.30	1M
287	271-296	c4ai-aya-expanse-32b	Cohere · CC-BY-NC-4.0	1254	±8		7,297	N/A	N/A
288	265-297	glm-4-0520	Z.ai · Proprietary	1254	±12		2,609	N/A	N/A
289	277-296	llama-3-70b-instruct	Meta · Llama 3 Community	1249	±6		37,706	$0.51 / $0.74	8.2K
290	276-298	mistral-small-24b-instruct-2501	Mistral · Apache 2.0	1247	±10		3,942	$0.05 / $0.08	32.8K
291	279-298	claude-3-haiku-20240307	Anthropic · Proprietary	1246	±6		29,876	$0.25 / $1.25	200K
292	282-299	qwen2-72b-instruct	Alibaba · Qianwen LICENSE	1242	±8		9,976	$0.90 / $0.90	32.8K
293	279-301	deepseek-coder-v2	DeepSeek · DeepSeek License	1241	±11		3,882	$0.14 / $0.28	128K
294	283-301	amazon-nova-lite-v1.0	Amazon · Proprietary	1239	±8		5,254	$0.06 / $0.24	300K
295	282-305	command-r-08-2024	Cohere · CC-BY-NC-4.0	1238	±12		2,597	$0.15 / $0.60	128K
296	279-314	olmo-2-0325-32b-instruct	Ai2 · Apache-2.0	1233	±19		872	$0.05 / $0.20	128K
297	291-309	phi-4	Microsoft · MIT	1229	±8		6,470	$0.07 / $0.14	16.4K
298	288-315	qwen2.5-coder-32b-instruct	Alibaba · Apache 2.0	1227	±15		1,540	$0.87 / $0.87	32K
299	289-315	ministral-8b-2410	Mistral · MRL	1225	±16		1,350	$0.10 / $0.10	131.1K
300	292-310	mistral-large-2402	Mistral · Proprietary	1225	±8		15,192	$4 / $12	32K
301	292-310	gpt-3.5-turbo-0125	OpenAI · Proprietary	1225	±7		16,149	$0.50 / $1.50	16.4K
302	295-314	amazon-nova-micro-v1.0	Amazon · Proprietary	1222	±8		5,246	$0.04 / $0.14	128K
303	295-316	qwen1.5-110b-chat	Alibaba · Qianwen LICENSE	1218	±10		6,502	N/A	N/A
304	295-317	gemini-pro-dev-api	Google · Proprietary	1216	±12		4,634	$0.35 / $1.05	32.8K
305	296-317	qwen1.5-72b-chat	Alibaba · Qianwen LICENSE	1213	±9		9,492	N/A	N/A
306	296-319	jamba-1.5-mini	Jamba Open	1213	±13		2,361	$0.20 / $0.40	256K
307	296-319	c4ai-aya-expanse-8b	Cohere · CC-BY-NC-4.0	1212	±11		2,746	N/A	N/A
308	299-319	mixtral-8x22b-instruct-v0.1	Mistral · Apache 2.0	1209	±8		12,808	$0.90 / $0.90	65.5K
309	295-325	hunyuan-standard-256k	Tencent · Proprietary	1208	±21		752	N/A	N/A
310	299-319	command-r	Cohere · CC-BY-NC-4.0	1208	±8		13,537	$0.15 / $0.60	128K
311	299-322	mistral-medium	Mistral · Proprietary	1207	±9		8,402	$2.70 / $8.10	32K
312	296-325	gemini-pro	Google · Proprietary	1207	±19		1,319	$0.35 / $1.05	32.8K
313	299-322	reka-flash-21b-20240226-online	Proprietary	1203	±12		3,632	N/A	N/A
314	297-331	llama-3.1-tulu-3-8b	Ai2 · Llama 3.1	1200	±20		816	N/A	N/A
315	304-325	reka-flash-21b-20240226	Proprietary	1197	±10		5,831	N/A	N/A
316	301-332	zephyr-orpo-141b-A35b-v0.1	Apache 2.0	1195	±18		1,129	N/A	N/A
317	303-331	wizardlm-70b	Microsoft · Llama 2 Community	1194	±15		2,313	N/A	N/A
318	310-325	gemma-2-2b-it	Google · Gemma license	1193	±7		12,543	N/A	N/A
319	310-326	llama-3-8b-instruct	Meta · Llama 3 Community	1191	±7		25,481	$0.14 / $0.14	8.2K
320	306-331	gpt-3.5-turbo-1106	OpenAI · Proprietary	1191	±13		3,932	$1 / $2	16.4K
321	312-334	llama-3.1-8b-instruct	Meta · Llama 3.1 Community	1182	±7		13,505	$0.05 / $0.08	131.1K
322	310-345	granite-3.1-8b-instruct	IBM · Apache 2.0	1179	±21		837	N/A	N/A
323	312-341	openchat-3.5	Apache-2.0	1176	±15		1,995	$0.20 / $0.20	N/A
324	316-338	dbrx-instruct-preview	DBRX LICENSE	1176	±10		7,999	$0.60 / $0.60	32.8K
325	317-338	yi-1.5-34b-chat	Apache-2.0	1174	±9		6,540	N/A	N/A
326	317-338	phi-3-medium-4k-instruct	Microsoft · MIT	1172	±9		6,655	$0.17 / $0.68	N/A
327	317-341	qwen1.5-32b-chat	Alibaba · Qianwen LICENSE	1171	±10		5,401	N/A	N/A
328	317-341	vicuna-33b	Non-commercial	1171	±10		5,627	$0 / $0	2K
329	320-339	mixtral-8x7b-instruct-v0.1	Mistral · Apache 2.0	1170	±7		17,942	$0.63 / $0.63	32K
330	306-356	falcon-180b-chat	Falcon-180B TII License	1170	±32		342	N/A	N/A
331	312-348	deepseek-llm-67b-chat	DeepSeek · DeepSeek License	1170	±19		1,142	N/A	N/A
332	317-351	tulu-2-dpo-70b	AI2 ImpACT Low-risk	1165	±17		1,547	N/A	N/A
333	321-347	qwen1.5-14b-chat	Alibaba · Qianwen LICENSE	1164	±11		4,502	$0.30 / $0.30	N/A
334	322-348	yi-34b-chat	Yi License	1163	±11		3,702	$0.90 / $0.90	4.1K
335	322-349	openchat-3.5-0106	Apache-2.0	1163	±12		3,121	N/A	N/A
336	322-349	snowflake-arctic-instruct	Apache 2.0	1159	±10		7,241	N/A	N/A
337	321-353	openhermes-2.5-mistral-7b	Apache-2.0	1158	±18		1,136	$0.17 / $0.17	N/A
338	326-353	gemma-1.1-7b-it	Google · Gemma license	1153	±9		6,034	$0.03 / $0.09	8.2K
339	322-356	wizardlm-13b	Microsoft · Llama 2 Community	1152	±15		1,814	$0.30 / $0.30	N/A
340	325-354	internlm2_5-20b-chat	Other	1151	±12		2,757	$0 / $0	32.8K
341	330-358	vicuna-13b	Llama 2 Community	1145	±11		4,672	$0.30 / $0.30	N/A
342	329-360	granite-3.0-8b-instruct	IBM · Apache 2.0	1143	±16		1,751	N/A	N/A
343	330-360	llama-3.2-3b-instruct	Meta · Llama 3.2	1142	±14		2,118	$0.05 / $0.33	131.1K
344	333-360	phi-3-small-8k-instruct	Microsoft · MIT	1140	±10		4,639	$0.15 / $0.60	N/A
345	329-362	nous-hermes-2-mixtral-8x7b-dpo	Apache-2.0	1140	±20		858	$0.90 / $0.90	N/A
346	331-360	starling-lm-7b-alpha	CC-BY-NC-4.0	1139	±13		2,509	N/A	N/A
347	329-364	solar-10.7b-instruct-v1.0	CC-BY-NC-4.0	1139	±21		894	$0.30 / $0.30	N/A
348	326-364	mpt-30b-chat	CC-BY-NC-SA-4.0	1139	±23		647	N/A	N/A
349	329-373	dolphin-2.2.1-mistral-7b	Apache-2.0	1131	±29		382	$0.50 / $0.50	16.4K
350	339-361	llama-2-70b-chat	Meta · Llama 2 Community	1130	±9		9,591	$0.70 / $2.80	4.1K
351	335-370	llama2-70b-steerlm-chat	Nvidia · Llama 2 Community	1127	±22		836	N/A	N/A
352	335-370	granite-3.1-2b-instruct	IBM · Apache 2.0	1127	±21		850	N/A	N/A
353	338-364	starling-lm-7b-beta	Apache-2.0	1127	±12		4,016	N/A	N/A
354	336-374	zephyr-7b-alpha	MIT	1122	±25		569	N/A	N/A
355	336-373	guanaco-33b	Non-commercial	1122	±23		714	N/A	N/A
356	339-373	qwen-14b-chat	Alibaba · Qianwen LICENSE	1120	±18		1,230	N/A	N/A
357	341-370	zephyr-7b-beta	MIT	1120	±14		2,691	$0.15 / $0.15	16.4K
358	342-373	vicuna-7b	Llama 2 Community	1115	±15		1,783	$0.20 / $0.20	N/A
359	341-374	qwq-32b-preview	Alibaba · Apache 2.0	1113	±21		855	$0.50 / $1	16.4K
360	346-373	mistral-7b-instruct-v0.2	Mistral · Apache-2.0	1113	±11		4,703	$0.20 / $0.20	32.8K
361	342-374	qwen1.5-7b-chat	Alibaba · Qianwen LICENSE	1112	±18		1,093	$0.20 / $0.20	N/A
362	347-378	granite-3.0-2b-instruct	IBM · Apache 2.0	1105	±16		1,820	N/A	N/A
363	348-378	gemma-7b-it	Google · Gemma license	1104	±15		2,191	$0.05 / $0.08	8.2K
364	348-378	codellama-34b-instruct	Meta · Llama 2 Community	1104	±15		2,003	$0.35 / $1.40	16.4K
365	351-374	llama-2-13b-chat	Meta · Llama 2 Community	1104	±11		4,785	$0.25 / $0.25	4.1K
366	351-375	phi-3-mini-4k-instruct-june-2024	Microsoft · MIT	1103	±11		3,382	$0.13 / $0.52	4.1K
367	351-379	phi-3-mini-128k-instruct	Microsoft · MIT	1098	±12		4,627	$0.13 / $0.52	N/A
368	351-379	palm-2	Google · Proprietary	1096	±15		2,155	$0.50 / $0.50	25.8K
369	351-379	mistral-7b-instruct	Mistral · Apache 2.0	1094	±15		2,336	$0.07 / $0.28	4.1K
370	354-379	phi-3-mini-4k-instruct	Microsoft · MIT	1092	±11		5,207	$0.13 / $0.52	N/A
371	351-381	stripedhyena-nous-7b	Apache 2.0	1092	±18		1,271	$0.20 / $0.20	N/A
372	354-379	gemma-1.1-2b-it	Google · Gemma license	1091	±13		2,596	N/A	N/A
373	359-382	alpaca-13b	Non-commercial	1079	±19		1,217	N/A	N/A
374	354-383	smollm2-1.7b-instruct	Apache 2.0	1078	±27		627	N/A	N/A
375	364-382	qwen1.5-4b-chat	Alibaba · Qianwen LICENSE	1076	±15		1,895	$0.10 / $0.10	N/A
376	364-383	llama-3.2-1b-instruct	Meta · Llama 3.2	1075	±15		2,047	$0.03 / $0.20	60K
377	367-382	llama-2-7b-chat	Meta · Llama 2 Community	1075	±11		3,454	$0.15 / $0.15	4.1K
378	363-386	gpt4all-13b-snoozy	Non-commercial	1060	±31		347	N/A	N/A
379	372-384	gemma-2b-it	Google · Gemma license	1057	±19		1,152	$0.10 / $0.10	N/A
380	372-385	mpt-7b-chat	CC-BY-NC-SA-4.0	1056	±21		892	N/A	N/A
381	364-388	codellama-70b-instruct	Meta · Llama 2 Community	1054	±37		262	$0.70 / $2.80	16.4K
382	373-385	koala-13b	Non-commercial	1048	±18		1,515	N/A	N/A
383	376-387	chatglm3-6b	Apache-2.0	1040	±20		1,108	N/A	N/A
384	378-388	olmo-7b-instruct	Ai2 · Apache-2.0	1022	±18		1,511	$0.20 / $0.20	N/A
385	379-390	chatglm2-6b	Apache-2.0	1015	±22		775	N/A	N/A
386	381-390	oasst-pythia-12b	Apache 2.0	1012	±18		1,408	N/A	N/A
387	382-390	RWKV-4-Raven-14B	Apache 2.0	1002	±19		1,098	N/A	N/A
388	383-390	fastchat-t5-3b	Apache 2.0	997	±21		940	N/A	N/A
389	385-390	chatglm-6b	Non-commercial	981	±20		1,056	N/A	N/A
390	385-392	dolly-v2-12b	MIT	974	±23		732	N/A	N/A
391	390-392	stablelm-tuned-alpha-7b	CC-BY-NC-SA-4.0	930	±24		681	N/A	N/A
392	390-392	llama-13b	Meta · Non-commercial	927	±29		513	$0.23 / $0.23	N/A
```

## Category: Occupational: Life, Physical, & Social Science (adjustment: None)

Source: https://arena.ai, Text Arena leaderboard, Categories panel, "Occupational: Life, Physical, & Social Science" selected, Adjustments = None.
Date shown on page: Aug 19, 2026. Votes: 1,308,854. Models: 391. Captured row count: 391 (verified match).

```
1	1-25	glm-5.3-max	Z.ai · MIT	1532	±27		465	$1.40 / $4.40	1M
2	1-12	claude-opus-4-6-high	Anthropic · Proprietary	1528	±7		11,913	$5 / $25	1M
3	1-28	muse-spark-1.2 (xHigh)	Meta · Proprietary	1527	±24		530	$1.25 / $4.25	N/A
4	1-15	claude-fable-5	Anthropic · Proprietary	1527	±10		3,752	$10 / $50	1M
5	1-13	claude-opus-4-7-high	Anthropic · Proprietary	1526	±7		10,127	$5 / $25	1M
6	1-19	kimi-k3-max	Moonshot · Kimi K3 license	1523	±13		2,236	N/A	N/A
7	1-25	qwen3.8-max	Alibaba · Proprietary	1522	±16		1,428	$2 / $6	1M
8	1-17	claude-opus-4-6	Anthropic · Proprietary	1519	±6		12,683	$5 / $25	1M
9	1-25	claude-opus-5-high	Anthropic · Proprietary	1515	±10		4,464	$5 / $25	1M
10	1-29	claude-opus-5-max	Anthropic · Proprietary	1514	±14		2,057	$5 / $25	1M
11	3-26	claude-opus-4-7	Anthropic · Proprietary	1511	±7		10,349	$5 / $25	1M
12	1-47	gemini-3.7-flash-high	Google · Proprietary	1511	±19	Preliminary	965	$0.75 / $3.57	1M
13	4-26	gemini-3.1-pro-preview	Google · Proprietary	1510	±6		16,175	$1 / $6	1M
14	2-34	muse-spark-1.1	Meta · Proprietary	1509	±11		3,165	$1.25 / $4.25	N/A
15	4-31	claude-opus-4-8-high	Anthropic · Proprietary	1507	±8		7,063	$5 / $25	1M
16	1-60	hy3	Tencent · Apache 2.0	1501	±21		827	$0.13 / $0.53	262.1K
17	6-45	claude-sonnet-4-6	Anthropic · Proprietary	1501	±7		10,841	$1.50 / $7.50	1M
18	6-47	claude-opus-4-8	Anthropic · Proprietary	1500	±8		7,213	$5 / $25	1M
19	6-47	gpt-5.5-high	OpenAI · Proprietary	1499	±7		9,776	$2.50 / $15	1.1M
20	6-47	gemini-3-pro	Google · Proprietary	1498	±8		6,791	$2 / $12	1M
21	5-58	muse-spark	Meta · Proprietary	1497	±13		2,269	N/A	N/A
22	11-55	gemini-3.5-flash-medium	Google · Proprietary	1495	±9		4,393	$0.75 / $4.50	1M
23	6-59	gemini-3.6-flash-high	Google · Proprietary	1494	±12		2,725	$0.38 / $1.88	1M
24	11-57	glm-5.2-max	Z.ai · MIT	1494	±9		4,889	$1.40 / $4.40	1M
25	3-79	grok-4.6-high	SpaceXAI · Proprietary	1493	±25	Preliminary	527	$2 / $6	500K
26	14-57	gpt-5.5	OpenAI · Proprietary	1492	±7		9,861	$2.50 / $15	1.1M
27	12-60	gpt-5.5-instant	OpenAI · Proprietary	1491	±10		4,234	$2.50 / $15	1.1M
28	15-60	claude-opus-4-5-20251101-high-32k	Anthropic · Proprietary	1490	±8		5,900	$5 / $25	200K
29	13-61	qwen3.5-max-preview	Alibaba · Proprietary	1489	±10		3,486	$1.20 / $6	N/A
30	14-60	gemini-3.5-flash-high	Google · Proprietary	1489	±9		4,736	$0.75 / $4.50	1M
31	15-59	mimo-v2.5-pro	Xiaomi · MIT	1489	±7		8,636	$0.43 / $0.87	1.1M
32	15-59	claude-opus-4-5-20251101	Anthropic · Proprietary	1488	±6		11,138	$5 / $25	200K
33	15-60	gpt-5.4-high	OpenAI · Proprietary	1488	±7		9,903	$2.50 / $15	1.1M
34	15-60	ernie-5.1	Baidu · Proprietary	1488	±8		5,935	N/A	N/A
35	14-64	grok-4.5	SpaceXAI · Proprietary	1488	±11		3,363	$2 / $6	500K
36	13-65	gpt-5.6-sol-xhigh	OpenAI · Proprietary	1488	±11		2,992	$5 / $30	N/A
37	15-61	glm-5.1	Z.ai · MIT	1487	±8		6,818	$1.40 / $4.40	202.8K
38	15-61	gpt-5.2-chat-latest-20260210	OpenAI · Proprietary	1487	±8		5,484	$1.75 / $14	128K
39	16-60	grok-4.20-beta-0309-reasoning	SpaceXAI · Proprietary	1487	±7		10,108	$1.25 / $2.50	1M
40	15-64	gemini-3-flash	Google · Proprietary	1487	±9		4,949	$0.50 / $3	1M
41	15-65	claude-sonnet-5-high	Anthropic · Proprietary	1486	±9		4,324	$1 / $5	1M
42	9-86	qwen3.6-max-preview	Alibaba · Proprietary	1485	±20		881	$1.03 / $6.16	262.1K
43	6-92	qwen3.7-max-preview	Alibaba · Proprietary	1484	±23		656	$1.48 / $4.42	1M
44	15-73	gemini-3.5-flash-lite	Google · Proprietary	1484	±11		2,761	$0.15 / $1.25	1M
45	5-107	deepseek-v4-pro-high-20260813	DeepSeek · MIT	1483	±30		397	$1.32 / $3.96	N/A
46	20-72	deepseek-v4-pro	DeepSeek · MIT	1481	±7		8,618	$1.32 / $3.96	1M
47	20-71	grok-4.20-multi-agent-beta-0309	SpaceXAI · Proprietary	1481	±7		9,917	$1.25 / $2.50	1M
48	20-73	grok-4.1-thinking	SpaceXAI · Proprietary	1480	±6		10,851	N/A	N/A
49	20-75	glm-5	Z.ai · MIT	1480	±9		4,453	$1 / $3.20	202.8K
50	15-86	ernie-5.0-preview-1203	Baidu · Proprietary	1480	±15		1,624	N/A	N/A
51	21-71	gemini-3-flash (thinking-minimal)	Google · Proprietary	1479	±6		14,026	$0.50 / $3	1M
52	20-73	gpt-5.4	OpenAI · Proprietary	1479	±7		10,335	$2.50 / $15	1.1M
53	20-77	grok-4.20-beta1	SpaceXAI · Proprietary	1479	±9		4,398	N/A	N/A
54	20-75	deepseek-v4-pro-high-preview	DeepSeek · MIT	1479	±7		8,182	$1.32 / $3.96	1M
55	20-78	mimo-v2-pro	Xiaomi · Proprietary	1479	±10		3,922	$1 / $3	1M
56	23-75	grok-4.1	SpaceXAI · Proprietary	1478	±6		10,820	N/A	N/A
57	21-78	kimi-k2.6	Moonshot · Modified MIT	1477	±8		6,228	$0.95 / $4	262.1K
58	16-104	gemma-4-31b	Google · Apache 2.0	1473	±19		886	$0.14 / $0.40	262.1K
59	27-88	qwen3.7-plus	Alibaba · Proprietary	1473	±9		5,315	$0.32 / $1.28	1M
60	37-81	claude-sonnet-4-5-20250929	Anthropic · Proprietary	1472	±6		13,171	$3 / $15	200K
61	37-85	dola-seed-2.0-pro	Bytedance · Proprietary	1472	±6		11,917	N/A	N/A
62	37-85	kimi-k2.5-thinking	Moonshot · Modified MIT	1471	±6		11,066	$0.60 / $3	N/A
63	41-81	gemini-2.5-pro	Google · Proprietary	1471	±5		20,611	$0.63 / $5	1M
64	24-98	glm-4.7	Z.ai · MIT	1470	±13		2,109	$0.40 / $1.75	204.8K
65	41-87	claude-sonnet-4-5-20250929-high-32k	Anthropic · Proprietary	1470	±6		13,238	$3 / $15	200K
66	39-91	claude-opus-4-1-20250805-thinking-16k	Anthropic · Proprietary	1470	±7		7,956	$15 / $75	200K
67	41-95	gpt-5.1-high	OpenAI · Proprietary	1468	±8		6,702	$0.63 / $5	400K
68	34-100	gpt-5.6-terra-xhigh	OpenAI · Proprietary	1468	±11		3,063	$2.50 / $15	N/A
69	44-96	gpt-5.4-mini-high	OpenAI · Proprietary	1466	±7		9,804	$0.75 / $4.50	400K
70	47-96	qwen3.5-397b-a17b	Alibaba · Apache 2.0	1466	±6		11,277	$0.39 / $2.34	262.1K
71	41-99	minimax-m3	MiniMax · MiniMax Community License	1466	±8		6,402	$0.60 / $2.40	N/A
72	50-98	claude-opus-4-1-20250805	Anthropic · Proprietary	1464	±6		12,249	$15 / $75	200K
73	41-110	inkling	Thinky · Apache 2.0	1463	±11		2,828	$1 / $4.05	524.3K
74	51-104	deepseek-v4-flash-high-preview	DeepSeek · MIT	1461	±8		7,977	$0.44 / $1.32	1M
75	56-103	chatgpt-4o-latest-20250326	OpenAI · Proprietary	1460	±6		13,762	$5 / $15	128K
76	53-111	gpt-5.3-chat-latest	OpenAI · Proprietary	1460	±9		5,193	$1.75 / $14	128K
77	56-109	grok-4.3	SpaceXAI · Proprietary	1459	±7		9,893	$1.25 / $2.50	1M
78	56-111	deepseek-v4-flash	DeepSeek · MIT	1458	±8		7,797	$0.44 / $1.32	1M
79	60-113	ernie-5.0-0110	Baidu · Proprietary	1457	±8		5,868	N/A	N/A
80	56-116	qwen3-max-preview	Alibaba · Proprietary	1457	±9		4,261	$0.78 / $3.90	262.1K
81	54-121	gpt-5.6-luna-xhigh	OpenAI · Proprietary	1456	±11		3,140	$1 / $6	N/A
82	62-114	qwen3.6-plus	Alibaba · Proprietary	1456	±8		7,151	$0.33 / $1.95	1M
83	63-115	gpt-5.1	OpenAI · Proprietary	1455	±8		7,024	$0.63 / $5	400K
84	62-119	longcat-flash-chat-2602-exp	Meituan · Proprietary	1455	±9		4,581	N/A	N/A
85	50-130	kimi-k2.5-instant	Moonshot · Modified MIT	1453	±17		1,204	$0.45 / $2.25	262.1K
86	65-117	o3-2025-04-16	OpenAI · Proprietary	1453	±7		10,058	$2 / $8	200K
87	64-120	mimo-v2.5	Xiaomi · MIT	1453	±8		7,218	$0.14 / $0.28	1.1M
88	47-135	gemma-4-26b-a4b	Google · Apache 2.0	1453	±19		878	N/A	N/A
89	54-129	deepseek-v3.2-exp-thinking	DeepSeek · MIT	1453	±15		1,443	$0.27 / $0.41	163.8K
90	41-140	deepseek-v3.1-terminus	DeepSeek · MIT	1452	±24		581	$0.27 / $1	163.8K
91	67-121	deepseek-v3.2	DeepSeek · MIT	1451	±7		7,415	$0.27 / $0.40	163.8K
92	67-122	gpt-5.2-high	OpenAI · Proprietary	1451	±7		7,874	$0.88 / $7	400K
93	70-120	gpt-5.2	OpenAI · Proprietary	1451	±6		13,000	$0.88 / $7	400K
94	69-122	gemini-3.1-flash-lite-preview	Google · Proprietary	1451	±7		9,910	$0.25 / $1.50	1M
95	61-131	nvidia-nemotron-3-ultra-550b-a55b-nvfp4	Nvidia · OpenMDW-1.1	1450	±14		1,746	N/A	N/A
96	64-128	mimo-v2-omni	Xiaomi · Proprietary	1450	±11		3,051	$0.40 / $2	262.1K
97	64-129	gpt-4.5-preview-2025-02-27	OpenAI · Proprietary	1449	±12		2,545	$75 / $150	128K
98	43-148	deepseek-v3.1-terminus-thinking	DeepSeek · MIT	1449	±25		539	$0.27 / $1	163.8K
99	62-135	glm-5v-turbo	Z.ai · Proprietary	1449	±15		1,472	$1.20 / $4	202.8K
100	71-128	gpt-5-chat	OpenAI · Proprietary	1447	±9		5,063	$1.25 / $10	N/A
101	74-126	grok-4-1-fast-reasoning	SpaceXAI · Proprietary	1447	±7		9,219	$0.20 / $0.50	2M
102	77-125	qwen3-235b-a22b-instruct-2507	Alibaba · Apache 2.0	1446	±5		15,471	$0.26 / $1.06	N/A
103	74-129	glm-4.6	Z.ai · MIT	1446	±8		5,925	$0.50 / $2	204.8K
104	75-133	gpt-5-high	OpenAI · Proprietary	1443	±9		5,147	$0.63 / $5	400K
105	82-133	kimi-k2-thinking-turbo	Moonshot · Modified MIT	1441	±6		9,975	$1.15 / $8	262.1K
106	58-157	muse-glimmer	Meta · Apache-2.0	1441	±24		634	N/A	N/A
107	79-138	qwen3.5-27b	Alibaba · Apache 2.0	1440	±9		4,507	$0.20 / $1.56	262.1K
108	72-146	qwen3-vl-235b-a22b-instruct	Alibaba · Apache 2.0	1439	±15		1,772	$0.21 / $1.90	262.1K
109	84-138	deepseek-v3.2-thinking	DeepSeek · MIT	1439	±8		6,638	$0.27 / $0.40	163.8K
110	75-146	kimi-k2-0905-preview	Moonshot · Modified MIT	1439	±14		1,748	$0.60 / $2.50	262.1K
111	71-158	ernie-5.0-preview-1022	Baidu · Proprietary	1437	±20		786	N/A	N/A
112	87-140	claude-opus-4-20250514-thinking-16k	Anthropic · Proprietary	1437	±8		6,008	$15 / $75	200K
113	85-140	qwen3.5-122b-a10b	Alibaba · Apache 2.0	1436	±9		4,651	$0.26 / $2.08	262.1K
114	74-154	hunyuan-hy3-preview	Tencent · tencent-hunyuan-community	1436	±17		1,205	$0.29 / $1.17	262.1K
115	80-150	deepseek-v3.2-exp	DeepSeek · MIT	1435	±13		1,942	$0.27 / $0.41	163.8K
116	91-142	gemini-2.5-flash-preview-09-2025	Google · Proprietary	1435	±8		5,217	$0.30 / $2.50	1M
117	83-149	deepseek-v3.1	DeepSeek · MIT	1435	±12		2,334	$1.23 / $4.94	N/A
118	91-141	grok-4-0709	SpaceXAI · Proprietary	1435	±8		6,909	$3 / $15	256K
119	81-154	mistral-medium-3.5	Mistral · Modified MIT	1433	±14		1,822	$1.50 / $7.50	262.1K
120	71-167	amazon-nova-experimental-chat-26-01-10	Amazon · Proprietary	1433	±24		568	N/A	N/A
121	76-161	grok-4-fast-chat	SpaceXAI · Proprietary	1433	±19		1,016	$3 / $15	256K
122	91-151	grok-4-fast-reasoning	SpaceXAI · Proprietary	1432	±11		3,020	$0.20 / $0.50	2M
123	95-146	minimax-m2.7	MiniMax · Modified MIT	1431	±7		9,691	$0.30 / $1.20	204.8K
124	84-159	qwen3-max-2025-09-23	Alibaba · Proprietary	1431	±15		1,443	$0.78 / $3.90	262.1K
125	100-143	gemini-2.5-flash	Google · Proprietary	1430	±5		20,278	$0.15 / $1.25	1M
126	100-146	claude-haiku-4-5-20251001	Anthropic · Proprietary	1430	±5		19,565	$1 / $5	200K
127	93-153	kimi-k2-0711-preview	Moonshot · Modified MIT	1429	±9		4,423	$0.60 / $2.50	131.1K
128	98-151	claude-opus-4-20250514	Anthropic · Proprietary	1429	±8		7,124	$15 / $75	200K
129	102-152	mistral-large-3	Mistral · Apache 2.0	1428	±6		9,961	$0.50 / $1.50	N/A
130	92-161	deepseek-v3.1-thinking	DeepSeek · MIT	1427	±14		1,877	$1.23 / $4.94	N/A
131	104-152	mistral-medium-2508	Mistral · Proprietary	1426	±5		14,976	$0.40 / $2	131.1K
132	79-172	amazon-nova-experimental-chat-26-02-10	Amazon · Proprietary	1426	±24		517	N/A	N/A
133	99-160	deepseek-r1-0528	DeepSeek · MIT	1426	±11		3,443	$0.50 / $2.15	163.8K
134	104-155	gpt-4.1-2025-04-14	OpenAI · Proprietary	1425	±7		8,599	$2 / $8	1M
135	104-161	glm-4.5	Z.ai · MIT	1423	±10		3,924	$0.60 / $2.20	131.1K
136	89-175	amazon-nova-experimental-chat-12-10	Amazon · Proprietary	1421	±23		610	N/A	N/A
137	110-163	qwen3.5-flash	Alibaba · Proprietary	1420	±7		9,226	N/A	N/A
138	102-170	Inkling Small	Thinky · Apache 2.0	1419	±14		1,776	$0.45 / $1.20	524.3K
139	93-179	hunyuan-t1-20250711	Tencent · Proprietary	1418	±22		729	N/A	N/A
140	112-164	gpt-5.4-nano-high	OpenAI · Proprietary	1418	±7		9,806	$0.20 / $1.25	400K
141	112-167	grok-3-preview-02-24	SpaceXAI · Proprietary	1417	±8		5,799	$3 / $15	131.1K
142	111-168	qwen3-next-80b-a3b-instruct	Alibaba · Apache 2.0	1416	±10		3,556	$0.09 / $1.10	262.1K
143	116-167	qwen3-235b-a22b-no-thinking	Alibaba · Apache 2.0	1416	±8		6,344	$0.46 / $1.82	131.1K
144	117-167	claude-sonnet-4-20250514-thinking-32k	Anthropic · Proprietary	1415	±8		5,737	$3 / $15	1M
145	116-169	qwen3.5-35b-a3b	Alibaba · Apache 2.0	1415	±9		4,949	$0.25 / $1.25	262.1K
146	119-167	deepseek-v3-0324	DeepSeek · MIT	1414	±7		7,719	$3 / $4.50	32.8K
147	109-172	hunyuan-turbos-20250416	Tencent · Proprietary	1414	±13		1,960	N/A	N/A
148	121-172	deepseek-r1	DeepSeek · MIT	1411	±10		3,309	$0.70 / $2.50	64K
149	124-172	o1-2024-12-17	OpenAI · Proprietary	1411	±9		4,820	$15 / $60	200K
150	112-180	qwen3-235b-a22b-thinking-2507	Alibaba · Apache 2.0	1410	±15		1,526	$0.23 / $2.30	262.1K
151	127-172	claude-sonnet-4-20250514	Anthropic · Proprietary	1410	±8		6,493	$3 / $15	1M
152	127-172	minimax-m2.5	MiniMax · Modified MIT	1409	±8		6,766	$0.23 / $0.90	204.8K
153	129-173	mistral-medium-2505	Mistral · Proprietary	1407	±8		5,709	$0.40 / $2	131.1K
154	134-172	step-3.5-flash	StepFun · Apache 2.0	1406	±7		9,325	$0.10 / $0.30	262.1K
155	123-183	longcat-flash-chat	Meituan · MIT	1406	±14		1,714	$0.20 / $0.80	131.1K
156	130-177	trinity-large-preview	Apache 2.0	1406	±9		4,881	$0.15 / $0.45	131K
157	118-188	qwen3-vl-235b-a22b-thinking	Alibaba · Apache 2.0	1406	±17		1,266	$0.40 / $4	131.1K
158	128-180	minimax-m2.1-preview	MiniMax · MIT	1405	±12		2,683	$0.30 / $1.20	204.8K
159	135-176	mimo-v2-flash (non-thinking)	Xiaomi · MIT	1405	±7		7,538	$0.10 / $0.30	262.1K
160	106-203	glm-4.6v	Z.ai · MIT	1404	±26		474	$0.30 / $0.90	131.1K
161	136-180	gemini-2.5-flash-lite-preview-09-2025-no-thinking	Google · Proprietary	1403	±7		7,531	$0.10 / $0.40	1M
162	136-180	claude-3-7-sonnet-20250219-thinking-32k	Anthropic · Proprietary	1402	±8		6,781	$3 / $15	200K
163	136-180	o4-mini-2025-04-16	OpenAI · Proprietary	1402	±7		7,621	$1.10 / $4.40	200K
164	134-194	mimo-v2-flash (thinking)	Xiaomi · MIT	1399	±14		1,713	$0.10 / $0.30	262.1K
165	106-212	hunyuan-vision-1.5-thinking	Tencent · Proprietary	1399	±31		344	N/A	N/A
166	141-191	qwen3-coder-480b-a35b-instruct	Alibaba · Apache 2.0	1397	±10		4,109	$0.40 / $1.60	262.1K
167	143-191	glm-4.5-air	Z.ai · MIT	1397	±8		4,974	$0.13 / $0.85	131.1K
168	142-191	gpt-5-mini-high	OpenAI · Proprietary	1397	±10		4,239	$0.13 / $1	400K
169	144-197	qwen3-30b-a3b-instruct-2507	Alibaba · Apache 2.0	1394	±10		3,727	$0.05 / $0.19	262.1K
170	144-194	trinity-large-thinking	Apache 2.0	1394	±9		4,844	$0.22 / $0.85	262.1K
171	154-197	gemma-3-27b-it	Google · Gemma	1391	±7		7,960	$0.08 / $0.45	262.1K
172	153-201	qwen2.5-max	Alibaba · Proprietary	1390	±8		5,702	N/A	N/A
173	152-201	o1-preview	OpenAI · Proprietary	1389	±9		5,419	$15 / $60	N/A
174	126-223	solar-pro4	Upstage · Proprietary	1388	±30		397	$0.03 / $0.12	524.3K
175	155-203	amazon-nova-experimental-chat-11-10	Amazon · Proprietary	1387	±10		3,946	N/A	N/A
176	131-222	amazon-nova-experimental-chat-10-09	Amazon · Proprietary	1387	±28		431	N/A	N/A
177	161-204	gemini-2.5-flash-lite-preview-06-17-thinking	Google · Proprietary	1384	±8		5,295	$0.10 / $0.40	1M
178	162-203	claude-3-7-sonnet-20250219	Anthropic · Proprietary	1384	±8		7,509	$3 / $15	200K
179	162-204	gpt-4.1-mini-2025-04-14	OpenAI · Proprietary	1384	±8		6,569	$0.40 / $1.60	1M
180	161-206	qwen3-235b-a22b	Alibaba · Apache 2.0	1383	±9		4,626	$0.46 / $1.82	131.1K
181	156-212	glm-4.7-flash	Z.ai · MIT	1382	±14		1,801	$0.06 / $0.40	202.8K
182	162-206	minimax-m1	MiniMax · Apache 2.0	1381	±8		5,902	$0.55 / $2.20	1M
183	151-220	qwen-plus-0125	Alibaba · Proprietary	1381	±18		968	$0.40 / $1.20	131.1K
184	161-212	qwen3-next-80b-a3b-thinking	Alibaba · Apache 2.0	1380	±13		2,141	$0.15 / $1.20	262.1K
185	152-223	qwen3-32b	Alibaba · Apache 2.0	1378	±20		798	$0.08 / $0.28	131.1K
186	163-214	grok-3-mini-high	SpaceXAI · Proprietary	1378	±11		2,770	$0.25 / $1.27	N/A
187	170-208	claude-3-5-sonnet-20241022	Anthropic · Proprietary	1377	±6		15,656	$3 / $15	200K
188	163-220	amazon-nova-experimental-chat-10-20	Amazon · Proprietary	1375	±14		1,874	N/A	N/A
189	155-230	nvidia-llama-3.3-nemotron-super-49b-v1.5	Nvidia · Nvidia Open	1374	±23		598	$0.10 / $0.40	131.1K
190	170-220	deepseek-v3	DeepSeek · DeepSeek	1373	±10		3,766	$1.14 / $4.56	N/A
191	170-220	o3-mini-high	OpenAI · Proprietary	1372	±10		3,382	$0.55 / $2.20	200K
192	172-221	grok-3-mini-beta	SpaceXAI · Proprietary	1371	±10		3,925	$0.30 / $0.50	131.1K
193	175-220	command-a-03-2025	Cohere · CC-BY-NC-4.0	1369	±7		9,452	$2.50 / $10	256K
194	177-222	gemini-2.0-flash-001	Google · Proprietary	1368	±7		7,833	$0.10 / $0.40	1M
195	172-223	mistral-small-2506	Mistral · Apache 2.0	1368	±11		2,928	$0.10 / $0.30	32K
196	163-239	gemma-3-12b-it	Google · Gemma	1368	±21		760	$0.05 / $0.15	131.1K
197	166-238	intellect-3	MIT	1367	±20		898	$0.20 / $1.10	131.1K
198	168-232	nvidia-nemotron-3-super-120b-a12b	Nvidia · NVIDIA Open Model	1367	±17		1,143	N/A	N/A
199	168-237	ling-flash-2.0	Ant Group · MIT	1366	±18		1,028	N/A	N/A
200	168-239	glm-4-plus-0111	Z.ai · Proprietary	1366	±18		986	N/A	N/A
201	162-251	hunyuan-turbo-0110	Tencent · Proprietary	1365	±27		414	N/A	N/A
202	179-227	gemini-2.0-flash-lite-preview-02-05	Google · Proprietary	1364	±9		4,444	$0.07 / $0.30	1M
203	180-227	llama-3.1-405b-instruct-bf16	Meta · Llama 3.1 Community	1362	±7		7,177	$4 / $4	32.8K
204	162-259	llama-3.3-nemotron-49b-super-v1	Nvidia · Nvidia	1361	±28		395	N/A	N/A
205	166-256	llama-3.1-nemotron-ultra-253b-v1	Nvidia · Nvidia Open Model	1360	±26		498	$0.60 / $1.80	131.1K
206	170-251	glm-4.5v	Z.ai · MIT	1360	±22		757	$0.60 / $1.80	65.5K
207	180-230	gpt-oss-120b	OpenAI · Apache 2.0	1360	±9		4,893	$0.03 / $0.17	131.1K
208	183-228	gemini-1.5-pro-002	Google · Proprietary	1360	±7		9,790	$3.50 / $10.50	2.1M
209	166-259	hunyuan-turbos-20250226	Tencent · Proprietary	1359	±27		384	N/A	N/A
210	177-250	minimax-m2	MiniMax · Apache 2.0	1357	±18		1,129	$0.26 / $1.02	204.8K
211	184-234	claude-3-5-sonnet-20240620	Anthropic · Proprietary	1356	±7		13,749	$3 / $15	200K
212	180-247	nova-2-lite	Amazon · Proprietary	1355	±13		2,083	$0.30 / $2.50	1M
213	190-239	gpt-4o-2024-05-13	OpenAI · Proprietary	1354	±7		19,017	$5 / $15	128K
214	184-244	yi-lightning	Proprietary	1353	±10		4,822	N/A	N/A
215	189-245	qwq-32b	Alibaba · Apache 2.0	1352	±9		4,567	$0.50 / $1	16.4K
216	192-242	grok-2-2024-08-13	SpaceXAI · Proprietary	1351	±7		10,796	$2 / $10	131.1K
217	180-259	step-3	StepFun · Apache 2.0	1351	±18		1,090	$0.57 / $1.42	65.5K
218	195-244	o3-mini	OpenAI · Proprietary	1350	±7		9,708	$0.55 / $2.20	200K
219	195-247	llama-3.1-405b-instruct-fp8	Meta · Llama 3.1 Community	1349	±7		10,001	$4 / $4	32.8K
220	184-259	gpt-4.1-nano-2025-04-14	OpenAI · Proprietary	1349	±17		1,162	$0.10 / $0.40	1M
221	195-250	gpt-4o-2024-08-06	OpenAI · Proprietary	1348	±8		7,560	$2.50 / $10	128K
222	184-260	gpt-5-nano-high	OpenAI · Proprietary	1347	±16		1,323	$0.03 / $0.20	400K
223	179-272	nvidia-nemotron-3.5-lightning-30b-a3b-nvfp4	Nvidia · OpenMDW-1.1	1346	±27	Preliminary	534	N/A	N/A
224	184-267	step-2-16k-exp-202412	StepFun · Proprietary	1345	±19		863	N/A	N/A
225	198-256	gemini-advanced-0514	Google · Proprietary	1343	±9		8,815	N/A	N/A
226	195-263	olmo-3.1-32b-instruct	Ai2 · Apache 2.0	1343	±14		1,916	$0.20 / $0.60	65.5K
227	184-272	hunyuan-large-2025-02-10	Tencent · Proprietary	1342	±21		707	N/A	N/A
228	202-255	claude-3-5-haiku-20241022	Anthropic · Proprietary	1342	±6		11,961	$1 / $5	200K
229	201-257	llama-4-maverick-17b-128e-instruct	Meta · Llama 4	1342	±8		6,790	$0.63 / $1.80	131.1K
230	203-259	o1-mini	OpenAI · Proprietary	1340	±7		8,979	$1.10 / $4.40	N/A
231	207-258	llama-3.3-70b-instruct	Meta · Llama-3.3	1340	±7		9,401	$0.10 / $0.32	131.1K
232	207-259	claude-3-opus-20240229	Anthropic · Proprietary	1339	±6		33,790	$15 / $75	200K
233	202-263	gemma-3n-e4b-it	Google · Gemma	1339	±10		3,710	$0.06 / $0.12	32.8K
234	201-264	athene-70b-0725	CC-BY-NC-4.0	1338	±12		3,029	N/A	N/A
235	200-272	qwen2.5-plus-1127	Alibaba · Proprietary	1337	±14		1,771	N/A	N/A
236	207-264	athene-v2-chat	NexusFlow	1336	±9		4,368	N/A	N/A
237	200-272	step-1o-turbo-202506	StepFun · Proprietary	1335	±15		1,516	N/A	N/A
238	208-266	llama-4-scout-17b-16e-instruct	Meta · Llama	1335	±9		5,047	$0.40 / $0.70	8.2K
239	208-268	glm-4-plus	Z.ai · Proprietary	1334	±10		4,702	$0.44 / $1.76	204.8K
240	213-267	grok-2-mini-2024-08-13	SpaceXAI · Proprietary	1333	±7		8,788	$2 / $10	131.1K
241	213-268	gemini-1.5-pro-001	Google · Proprietary	1333	±8		13,570	$3.50 / $10.50	2.1M
242	213-271	qwen3-30b-a3b	Alibaba · Apache 2.0	1333	±9		4,637	$0.13 / $0.52	131.1K
243	197-277	hunyuan-standard-2025-02-10	Tencent · Proprietary	1333	±21		696	N/A	N/A
244	183-286	mercury	Inception AI · Proprietary	1332	±35		295	$0.25 / $0.75	128K
245	204-274	deepseek-v2.5-1210	DeepSeek · DeepSeek	1331	±17		1,137	N/A	N/A
246	215-272	mistral-large-2407	Mistral · Mistral Research	1331	±8		7,485	$2 / $6	131.1K
247	211-274	gpt-oss-20b	OpenAI · Apache 2.0	1328	±15		1,702	$0.03 / $0.13	131.1K
248	217-272	gemini-1.5-flash-002	Google · Proprietary	1327	±8		6,083	$0.07 / $0.30	1M
249	222-272	gpt-4o-mini-2024-07-18	OpenAI · Proprietary	1327	±7		11,645	$0.15 / $0.60	128K
250	220-272	gpt-4-turbo-2024-04-09	OpenAI · Proprietary	1327	±7		16,354	$10 / $30	128K
251	198-286	mercury-2	Inception AI · Proprietary	1326	±27		469	$0.25 / $0.75	128K
252	211-280	ring-flash-2.0	Ant Group · MIT	1325	±18		1,105	N/A	N/A
253	217-274	qwen-max-0919	Alibaba · Qwen	1325	±11		2,975	$1.60 / $6.40	32.8K
254	210-283	olmo-3-32b-think	Ai2 · Apache 2.0	1324	±20		1,021	$0.15 / $0.50	65.5K
255	202-286	granite-4.1-8b	IBM · Apache 2.0	1323	±25		669	$0.05 / $0.10	131.1K
256	217-283	reka-core-20240904	Proprietary	1321	±16		1,183	N/A	N/A
257	229-277	deepseek-v2.5	DeepSeek · DeepSeek	1321	±10		4,318	N/A	N/A
258	231-276	gpt-4-1106-preview	OpenAI · Proprietary	1319	±8		17,680	$10 / $30	128K
259	234-277	llama-3.1-70b-instruct	Meta · Llama 3.1 Community	1318	±7		9,381	$0.40 / $0.40	131.1K
260	233-279	qwen2.5-72b-instruct	Alibaba · Qwen	1318	±8		6,932	$1.20 / $1.20	N/A
261	229-281	nvidia-nemotron-3-nano-30b-a3b-bf16	Nvidia · NVIDIA Open Model	1318	±12		2,513	$0.06 / $0.24	262.1K
262	221-286	llama-3.1-nemotron-70b-instruct	Nvidia · Llama 3.1	1317	±16		1,299	$1.20 / $1.20	131.1K
263	238-280	gpt-4-0125-preview	OpenAI · Proprietary	1316	±8		16,044	$10 / $30	128K
264	217-290	gemma-3-4b-it	Google · Gemma	1315	±21		780	$0.05 / $0.10	131.1K
265	239-281	mistral-large-2411	Mistral · MRL	1315	±9		4,869	$2 / $6	128K
266	229-286	jamba-1.5-large	Jamba Open	1314	±16		1,358	$2 / $8	256K
267	218-290	ibm-granite-h-small	IBM · Apache 2.0	1313	±21		902	N/A	N/A
268	236-286	magistral-medium-2506	Mistral · Proprietary	1311	±15		1,959	$2 / $5	40K
269	238-290	olmo-3.1-32b-think	Ai2 · Apache 2.0	1307	±16		1,429	$0.15 / $0.50	65.5K
270	228-295	llama-3.1-tulu-3-70b	Ai2 · Llama 3.1	1307	±24		520	N/A	N/A
271	247-286	mistral-small-3.1-24b-instruct-2503	Mistral · Apache 2.0	1306	±9		5,296	$0.10 / $0.30	32K
272	233-293	hunyuan-large-vision	Tencent · Proprietary	1306	±20		929	N/A	N/A
273	254-286	gemma-2-27b-it	Google · Gemma license	1304	±7		12,863	$0.65 / $0.65	8.2K
274	250-290	amazon-nova-pro-v1.0	Amazon · Proprietary	1304	±9		4,281	$0.80 / $3.20	300K
275	238-296	llama-3.1-nemotron-51b-instruct	Nvidia · Llama 3.1	1302	±22		682	N/A	N/A
276	247-292	command-r-plus-08-2024	Cohere · CC-BY-NC-4.0	1302	±15		1,639	$2.50 / $10	128K
277	250-291	nemotron-4-340b-instruct	Nvidia · NVIDIA Open Model	1301	±12		3,316	N/A	N/A
278	257-290	claude-3-sonnet-20240229	Anthropic · Proprietary	1299	±8		19,089	$3 / $15	200K
279	251-297	reka-flash-20240904	Proprietary	1295	±16		1,277	N/A	N/A
280	254-296	gemma-2-9b-it-simpo	MIT	1295	±15		1,596	$0.03 / $0.09	8.2K
281	261-292	llama-3-70b-instruct	Meta · Llama 3 Community	1295	±7		25,903	$0.51 / $0.74	8.2K
282	261-293	gemini-1.5-flash-001	Google · Proprietary	1294	±8		10,875	$0.07 / $0.30	1M
283	259-295	mistral-small-24b-instruct-2501	Mistral · Apache 2.0	1294	±12		2,579	$0.05 / $0.08	32.8K
284	259-297	glm-4-0520	Z.ai · Proprietary	1290	±15		1,590	N/A	N/A
285	261-297	command-r-08-2024	Cohere · CC-BY-NC-4.0	1290	±15		1,620	$0.15 / $0.60	128K
286	269-297	command-r-plus	Cohere · CC-BY-NC-4.0	1287	±8		13,227	$2.50 / $10	128K
287	255-305	olmo-2-0325-32b-instruct	Ai2 · Apache-2.0	1286	±24		580	$0.05 / $0.20	128K
288	269-297	c4ai-aya-expanse-32b	Cohere · CC-BY-NC-4.0	1286	±9		4,768	N/A	N/A
289	269-297	gpt-4-0314	OpenAI · Proprietary	1286	±9		9,610	$30 / $60	8.2K
290	274-300	amazon-nova-lite-v1.0	Amazon · Proprietary	1280	±10		3,333	$0.06 / $0.24	300K
291	277-299	gemma-2-9b-it	Google · Gemma license	1280	±7		9,169	$0.03 / $0.09	8.2K
292	275-300	qwen2-72b-instruct	Alibaba · Qianwen LICENSE	1279	±9		6,456	$0.90 / $0.90	32.8K
293	269-309	qwen2.5-coder-32b-instruct	Alibaba · Apache 2.0	1277	±18		956	$0.87 / $0.87	32K
294	279-302	gemini-1.5-flash-8b-001	Google · Proprietary	1276	±8		6,236	$0.07 / $0.30	1M
295	279-303	gpt-4-0613	OpenAI · Proprietary	1276	±8		15,252	$30 / $60	8.2K
296	283-304	claude-3-haiku-20240307	Anthropic · Proprietary	1273	±7		20,565	$0.25 / $1.25	200K
297	281-314	deepseek-coder-v2	DeepSeek · DeepSeek License	1269	±13		2,552	$0.14 / $0.28	128K
298	289-315	phi-4	Microsoft · MIT	1265	±10		4,245	$0.07 / $0.14	16.4K
299	289-316	reka-flash-21b-20240226-online	Proprietary	1260	±14		2,572	N/A	N/A
300	294-316	amazon-nova-micro-v1.0	Amazon · Proprietary	1257	±11		3,314	$0.04 / $0.14	128K
301	292-316	gemini-pro-dev-api	Google · Proprietary	1255	±14		3,251	$0.35 / $1.05	32.8K
302	290-318	jamba-1.5-mini	Jamba Open	1254	±16		1,490	$0.20 / $0.40	256K
303	296-316	mistral-large-2402	Mistral · Proprietary	1251	±9		10,875	$4 / $12	32K
304	296-318	mistral-medium	Mistral · Proprietary	1250	±11		6,062	$2.70 / $8.10	32K
305	295-320	c4ai-aya-expanse-8b	Cohere · CC-BY-NC-4.0	1250	±14		1,689	N/A	N/A
306	297-318	mixtral-8x22b-instruct-v0.1	Mistral · Apache 2.0	1249	±9		8,677	$0.90 / $0.90	65.5K
307	292-323	ministral-8b-2410	Mistral · MRL	1249	±20		827	$0.10 / $0.10	131.1K
308	297-318	command-r	Cohere · CC-BY-NC-4.0	1248	±9		9,216	$0.15 / $0.60	128K
309	297-320	reka-flash-21b-20240226	Proprietary	1247	±12		4,108	N/A	N/A
310	297-320	qwen1.5-110b-chat	Alibaba · Qianwen LICENSE	1247	±11		4,398	N/A	N/A
311	298-320	qwen1.5-72b-chat	Alibaba · Qianwen LICENSE	1246	±10		6,892	N/A	N/A
312	299-320	llama-3-8b-instruct	Meta · Llama 3 Community	1244	±8		17,322	$0.14 / $0.14	8.2K
313	293-329	hunyuan-standard-256k	Tencent · Proprietary	1243	±25		538	N/A	N/A
314	296-328	gemini-pro	Google · Proprietary	1239	±20		1,125	$0.35 / $1.05	32.8K
315	296-330	zephyr-orpo-141b-A35b-v0.1	Apache 2.0	1239	±21		827	N/A	N/A
316	297-331	llama-3.1-tulu-3-8b	Ai2 · Llama 3.1	1235	±25		516	N/A	N/A
317	303-328	yi-1.5-34b-chat	Apache-2.0	1229	±11		4,292	N/A	N/A
318	307-328	llama-3.1-8b-instruct	Meta · Llama 3.1 Community	1229	±8		8,403	$0.05 / $0.08	131.1K
319	312-331	gpt-3.5-turbo-0125	OpenAI · Proprietary	1223	±9		11,407	$0.50 / $1.50	16.4K
320	312-331	phi-3-medium-4k-instruct	Microsoft · MIT	1223	±11		4,186	$0.17 / $0.68	N/A
321	312-333	qwen1.5-32b-chat	Alibaba · Qianwen LICENSE	1220	±12		3,861	N/A	N/A
322	307-350	granite-3.0-8b-instruct	IBM · Apache 2.0	1217	±20		1,128	N/A	N/A
323	303-351	granite-3.1-8b-instruct	IBM · Apache 2.0	1216	±25		560	N/A	N/A
324	313-335	gemma-2-2b-it	Google · Gemma license	1215	±8		7,909	N/A	N/A
325	313-335	mixtral-8x7b-instruct-v0.1	Mistral · Apache 2.0	1213	±8		12,824	$0.63 / $0.63	32K
326	313-350	yi-34b-chat	Yi License	1213	±13		2,658	$0.90 / $0.90	4.1K
327	313-350	dbrx-instruct-preview	DBRX LICENSE	1211	±12		5,642	$0.60 / $0.60	32.8K
328	313-351	internlm2_5-20b-chat	Other	1209	±15		1,700	$0 / $0	32.8K
329	316-351	starling-lm-7b-beta	Apache-2.0	1204	±14		2,912	N/A	N/A
330	317-356	wizardlm-70b	Microsoft · Llama 2 Community	1200	±18		1,334	N/A	N/A
331	318-354	gpt-3.5-turbo-1106	OpenAI · Proprietary	1200	±15		3,046	$1 / $2	16.4K
332	322-354	gemma-1.1-7b-it	Google · Gemma license	1196	±11		4,147	$0.03 / $0.09	8.2K
333	324-354	llama-2-70b-chat	Meta · Llama 2 Community	1195	±10		6,638	$0.70 / $2.80	4.1K
334	321-358	starling-lm-7b-alpha	CC-BY-NC-4.0	1194	±15		1,854	N/A	N/A
335	324-356	snowflake-arctic-instruct	Apache 2.0	1193	±12		5,411	N/A	N/A
336	324-358	phi-3-small-8k-instruct	Microsoft · MIT	1192	±12		3,117	$0.15 / $0.60	N/A
337	324-358	vicuna-33b	Non-commercial	1192	±12		3,986	$0 / $0	2K
338	324-360	qwen1.5-14b-chat	Alibaba · Qianwen LICENSE	1190	±13		3,116	$0.30 / $0.30	N/A
339	322-364	tulu-2-dpo-70b	AI2 ImpACT Low-risk	1189	±19		1,112	N/A	N/A
340	324-364	openchat-3.5	Apache-2.0	1187	±18		1,439	$0.20 / $0.20	N/A
341	321-365	nous-hermes-2-mixtral-8x7b-dpo	Apache-2.0	1187	±23		651	$0.90 / $0.90	N/A
342	324-364	llama-3.2-3b-instruct	Meta · Llama 3.2	1185	±18		1,355	$0.05 / $0.33	131.1K
343	324-365	openhermes-2.5-mistral-7b	Apache-2.0	1182	±20		884	$0.17 / $0.17	N/A
344	327-364	openchat-3.5-0106	Apache-2.0	1181	±14		2,209	N/A	N/A
345	324-365	granite-3.0-2b-instruct	IBM · Apache 2.0	1181	±19		1,206	N/A	N/A
346	324-365	deepseek-llm-67b-chat	DeepSeek · DeepSeek License	1180	±22		876	N/A	N/A
347	324-367	llama2-70b-steerlm-chat	Nvidia · Llama 2 Community	1179	±24		642	N/A	N/A
348	324-367	solar-10.7b-instruct-v1.0	CC-BY-NC-4.0	1177	±23		721	$0.30 / $0.30	N/A
349	324-370	granite-3.1-2b-instruct	IBM · Apache 2.0	1177	±27		549	N/A	N/A
350	333-365	mistral-7b-instruct-v0.2	Mistral · Apache-2.0	1171	±13		3,284	$0.20 / $0.20	32.8K
351	324-373	dolphin-2.2.1-mistral-7b	Apache-2.0	1171	±33		308	$0.50 / $0.50	16.4K
352	330-368	wizardlm-13b	Microsoft · Llama 2 Community	1170	±18		1,246	$0.30 / $0.30	N/A
353	335-371	codellama-34b-instruct	Meta · Llama 2 Community	1163	±18		1,225	$0.35 / $1.40	16.4K
354	324-377	falcon-180b-chat	Falcon-180B TII License	1161	±41		206	N/A	N/A
355	330-375	guanaco-33b	Non-commercial	1161	±26		526	N/A	N/A
356	338-373	palm-2	Google · Proprietary	1160	±18		1,368	$0.50 / $0.50	25.8K
357	335-373	qwen1.5-7b-chat	Alibaba · Qianwen LICENSE	1160	±21		828	$0.20 / $0.20	N/A
358	339-372	phi-3-mini-4k-instruct-june-2024	Microsoft · MIT	1159	±15		1,956	$0.13 / $0.52	4.1K
359	333-375	qwq-32b-preview	Alibaba · Apache 2.0	1159	±26		583	$0.50 / $1	16.4K
360	339-371	llama-2-13b-chat	Meta · Llama 2 Community	1158	±13		3,270	$0.25 / $0.25	4.1K
361	339-373	zephyr-7b-beta	MIT	1157	±16		1,996	$0.15 / $0.15	16.4K
362	338-375	mpt-30b-chat	CC-BY-NC-SA-4.0	1152	±26		509	N/A	N/A
363	343-373	vicuna-13b	Llama 2 Community	1152	±13		3,288	$0.30 / $0.30	N/A
364	330-377	smollm2-1.7b-instruct	Apache 2.0	1151	±35		352	N/A	N/A
365	348-375	phi-3-mini-4k-instruct	Microsoft · MIT	1145	±13		3,517	$0.13 / $0.52	N/A
366	339-377	zephyr-7b-alpha	MIT	1141	±34		294	N/A	N/A
367	348-377	gemma-7b-it	Google · Gemma license	1138	±17		1,588	$0.05 / $0.08	8.2K
368	351-376	phi-3-mini-128k-instruct	Microsoft · MIT	1137	±14		3,426	$0.13 / $0.52	N/A
369	350-377	qwen-14b-chat	Alibaba · Qianwen LICENSE	1133	±21		894	N/A	N/A
370	351-377	stripedhyena-nous-7b	Apache 2.0	1131	±21		863	$0.20 / $0.20	N/A
371	352-377	llama-3.2-1b-instruct	Meta · Llama 3.2	1130	±18		1,407	$0.03 / $0.20	60K
372	355-377	gemma-1.1-2b-it	Google · Gemma license	1127	±16		1,929	N/A	N/A
373	354-377	mistral-7b-instruct	Mistral · Apache 2.0	1127	±18		1,577	$0.07 / $0.28	4.1K
374	360-377	llama-2-7b-chat	Meta · Llama 2 Community	1122	±13		2,474	$0.15 / $0.15	4.1K
375	360-379	vicuna-7b	Llama 2 Community	1116	±19		1,171	$0.20 / $0.20	N/A
376	364-382	qwen1.5-4b-chat	Alibaba · Qianwen LICENSE	1107	±19		1,277	$0.10 / $0.10	N/A
377	365-383	koala-13b	Non-commercial	1102	±21		1,211	N/A	N/A
378	375-386	alpaca-13b	Non-commercial	1076	±22		986	N/A	N/A
379	375-386	gemma-2b-it	Google · Gemma license	1076	±23		879	$0.10 / $0.10	N/A
380	376-386	olmo-7b-instruct	Ai2 · Apache-2.0	1074	±20		1,169	$0.20 / $0.20	N/A
381	376-386	mpt-7b-chat	CC-BY-NC-SA-4.0	1065	±25		677	N/A	N/A
382	377-386	RWKV-4-Raven-14B	Apache 2.0	1062	±23		844	N/A	N/A
383	376-387	gpt4all-13b-snoozy	Non-commercial	1059	±36		305	N/A	N/A
384	378-387	chatglm3-6b	Apache-2.0	1048	±23		888	N/A	N/A
385	378-387	oasst-pythia-12b	Apache 2.0	1045	±21		1,134	N/A	N/A
386	378-389	chatglm2-6b	Apache-2.0	1040	±30		436	N/A	N/A
387	386-390	fastchat-t5-3b	Apache 2.0	994	±25		685	N/A	N/A
388	383-391	llama-13b	Meta · Non-commercial	994	±32		414	$0.23 / $0.23	N/A
389	386-391	dolly-v2-12b	MIT	983	±29		589	N/A	N/A
390	387-391	chatglm-6b	Non-commercial	955	±25		819	N/A	N/A
391	388-391	stablelm-tuned-alpha-7b	CC-BY-NC-SA-4.0	935	±27		615	N/A	N/A
```

## Category: Occupational: Entertainment, Sports, & Media (adjustment: None)

Source: https://arena.ai, Text Arena leaderboard, Categories panel, "Occupational: Entertainment, Sports, & Media" selected, Adjustments = None.
Date shown on page: Aug 19, 2026. Votes: 1,442,017. Models: 391. Captured row count: 391 (verified match).

```
1	1-3	claude-fable-5	Anthropic · Proprietary	1496	±9		5,934	$10 / $50	1M
2	1-3	claude-opus-4-6-high	Anthropic · Proprietary	1492	±6		15,867	$5 / $25	1M
3	3-13	claude-opus-4-7-high	Anthropic · Proprietary	1479	±7		13,671	$5 / $25	1M
4	3-13	claude-opus-4-6	Anthropic · Proprietary	1479	±6		16,460	$5 / $25	1M
5	1-26	gemini-3.7-flash-high	Google · Proprietary	1475	±16	Preliminary	1,594	$0.75 / $3.57	1M
6	3-17	claude-opus-4-7	Anthropic · Proprietary	1472	±6		14,106	$5 / $25	1M
7	3-22	gpt-5.6-sol-xhigh	OpenAI · Proprietary	1472	±10		4,553	$5 / $30	N/A
8	3-26	gemini-3-pro	Google · Proprietary	1468	±8		7,722	$2 / $12	1M
9	5-26	gemini-3.1-pro-preview	Google · Proprietary	1466	±6		21,566	$1 / $6	1M
10	3-28	claude-opus-5-high	Anthropic · Proprietary	1466	±8		6,731	$5 / $25	1M
11	3-35	qwen3.8-max	Alibaba · Proprietary	1465	±13		2,253	$2 / $6	1M
12	3-37	muse-spark	Meta · Proprietary	1462	±12		2,516	N/A	N/A
13	5-31	claude-opus-4-8-high	Anthropic · Proprietary	1462	±7		10,467	$5 / $25	1M
14	5-36	gemini-3.6-flash-high	Google · Proprietary	1461	±10		4,229	$0.38 / $1.88	1M
15	3-56	muse-spark-1.2 (xHigh)	Meta · Proprietary	1459	±22		769	$1.25 / $4.25	N/A
16	6-39	gemini-3.5-flash-medium	Google · Proprietary	1457	±8		6,718	$0.75 / $4.50	1M
17	5-46	claude-opus-5-max	Anthropic · Proprietary	1456	±11		3,256	$5 / $25	1M
18	3-64	glm-5.3-max	Z.ai · MIT	1456	±22		757	$1.40 / $4.40	1M
19	6-39	claude-opus-4-5-20251101-high-32k	Anthropic · Proprietary	1456	±8		6,791	$5 / $25	200K
20	6-39	claude-opus-4-8	Anthropic · Proprietary	1455	±7		10,412	$5 / $25	1M
21	7-44	gemini-3.5-flash-high	Google · Proprietary	1454	±8		6,672	$0.75 / $4.50	1M
22	7-44	gemini-3-flash	Google · Proprietary	1454	±8		5,604	$0.50 / $3	1M
23	10-43	claude-opus-4-5-20251101	Anthropic · Proprietary	1453	±6		13,552	$5 / $25	200K
24	7-47	gpt-5.5-instant	OpenAI · Proprietary	1452	±9		5,468	$2.50 / $15	1.1M
25	7-51	kimi-k3-max	Moonshot · Kimi K3 license	1451	±11		3,372	N/A	N/A
26	10-51	muse-spark-1.1	Meta · Proprietary	1450	±9		4,764	$1.25 / $4.25	N/A
27	11-48	gpt-5.5-high	OpenAI · Proprietary	1449	±7		13,528	$2.50 / $15	1.1M
28	12-48	grok-4.20-beta-0309-reasoning	SpaceXAI · Proprietary	1448	±6		13,591	$1.25 / $2.50	1M
29	11-57	grok-4.5	SpaceXAI · Proprietary	1446	±9		5,280	$2 / $6	500K
30	11-59	qwen3.5-max-preview	Alibaba · Proprietary	1445	±10		4,015	$1.20 / $6	N/A
31	13-54	claude-sonnet-4-6	Anthropic · Proprietary	1445	±6		14,652	$1.50 / $7.50	1M
32	12-59	grok-4.20-beta1	SpaceXAI · Proprietary	1445	±9		5,141	N/A	N/A
33	12-54	gpt-5.5	OpenAI · Proprietary	1445	±7		13,954	$2.50 / $15	1.1M
34	15-54	claude-sonnet-4-5-20250929-high-32k	Anthropic · Proprietary	1444	±5		15,667	$3 / $15	200K
35	14-59	glm-5.1	Z.ai · MIT	1444	±7		9,253	$1.40 / $4.40	202.8K
36	6-74	grok-4.6-high	SpaceXAI · Proprietary	1444	±22	Preliminary	776	$2 / $6	500K
37	15-59	gpt-5.4-high	OpenAI · Proprietary	1443	±7		12,961	$2.50 / $15	1.1M
38	18-57	claude-sonnet-4-5-20250929	Anthropic · Proprietary	1442	±6		15,303	$3 / $15	200K
39	18-62	grok-4.20-multi-agent-beta-0309	SpaceXAI · Proprietary	1441	±6		12,964	$1.25 / $2.50	1M
40	6-80	qwen3.7-max-preview	Alibaba · Proprietary	1440	±23		681	$1.48 / $4.42	1M
41	18-64	glm-5.2-max	Z.ai · MIT	1439	±8		7,150	$1.40 / $4.40	1M
42	19-66	glm-5	Z.ai · MIT	1438	±8		5,536	$1 / $3.20	202.8K
43	21-64	mimo-v2.5-pro	Xiaomi · MIT	1438	±7		11,820	$0.43 / $0.87	1.1M
44	22-64	gemini-3-flash (thinking-minimal)	Google · Proprietary	1438	±6		18,026	$0.50 / $3	1M
45	21-66	gpt-5.2-chat-latest-20260210	OpenAI · Proprietary	1437	±8		6,724	$1.75 / $14	128K
46	18-72	gpt-4.5-preview-2025-02-27	OpenAI · Proprietary	1435	±12		2,627	$75 / $150	128K
47	25-70	deepseek-v4-pro	DeepSeek · MIT	1434	±7		11,893	$1.32 / $3.96	1M
48	27-70	grok-4.1-thinking	SpaceXAI · Proprietary	1434	±6		12,448	N/A	N/A
49	27-70	gpt-5.4	OpenAI · Proprietary	1434	±6		13,616	$2.50 / $15	1.1M
50	27-71	claude-opus-4-1-20250805-thinking-16k	Anthropic · Proprietary	1433	±7		9,089	$15 / $75	200K
51	30-70	claude-opus-4-1-20250805	Anthropic · Proprietary	1433	±6		14,195	$15 / $75	200K
52	23-73	gemini-3.5-flash-lite	Google · Proprietary	1433	±10		4,308	$0.15 / $1.25	1M
53	25-71	claude-sonnet-5-high	Anthropic · Proprietary	1433	±8		6,486	$1 / $5	1M
54	12-85	qwen3.6-max-preview	Alibaba · Proprietary	1432	±20		943	$1.03 / $6.16	262.1K
55	25-74	gpt-5.6-terra-xhigh	OpenAI · Proprietary	1431	±9		4,722	$2.50 / $15	N/A
56	33-73	deepseek-v4-pro-high-preview	DeepSeek · MIT	1430	±7		11,439	$1.32 / $3.96	1M
57	38-71	gemini-2.5-pro	Google · Proprietary	1430	±5		22,958	$0.63 / $5	1M
58	37-73	grok-4.1	SpaceXAI · Proprietary	1429	±6		12,638	N/A	N/A
59	33-74	ernie-5.1	Baidu · Proprietary	1429	±8		7,821	N/A	N/A
60	38-77	kimi-k2.6	Moonshot · Modified MIT	1427	±8		7,628	$0.95 / $4	262.1K
61	37-80	mimo-v2-pro	Xiaomi · Proprietary	1426	±9		4,699	$1 / $3	1M
62	42-75	chatgpt-4o-latest-20250326	OpenAI · Proprietary	1425	±5		14,938	$5 / $15	128K
63	42-85	gpt-5.6-luna-xhigh	OpenAI · Proprietary	1421	±9		4,924	$1 / $6	N/A
64	48-80	kimi-k2.5-thinking	Moonshot · Modified MIT	1421	±6		14,414	$0.60 / $3	N/A
65	44-83	qwen3.7-plus	Alibaba · Proprietary	1421	±8		7,741	$0.32 / $1.28	1M
66	44-83	claude-opus-4-20250514-thinking-16k	Anthropic · Proprietary	1421	±8		6,404	$15 / $75	200K
67	44-83	gpt-5.1-high	OpenAI · Proprietary	1421	±8		7,382	$0.63 / $5	400K
68	30-103	hy3	Tencent · Apache 2.0	1420	±17		1,294	$0.13 / $0.53	262.1K
69	52-85	grok-4.3	SpaceXAI · Proprietary	1417	±6		13,887	$1.25 / $2.50	1M
70	37-114	gemma-4-31b	Google · Apache 2.0	1416	±18		1,043	$0.14 / $0.40	262.1K
71	31-126	deepseek-v4-pro-high-20260813	DeepSeek · MIT	1414	±23		688	$1.32 / $3.96	N/A
72	55-98	gpt-5.3-chat-latest	OpenAI · Proprietary	1414	±8		6,399	$1.75 / $14	128K
73	59-95	dola-seed-2.0-pro	Bytedance · Proprietary	1413	±6		15,752	N/A	N/A
74	58-103	ernie-5.0-0110	Baidu · Proprietary	1412	±8		6,654	N/A	N/A
75	60-103	gpt-5.4-mini-high	OpenAI · Proprietary	1411	±7		12,730	$0.75 / $4.50	400K
76	51-115	ernie-5.0-preview-1203	Baidu · Proprietary	1411	±13		1,901	N/A	N/A
77	44-126	gemma-4-26b-a4b	Google · Apache 2.0	1410	±18		1,051	N/A	N/A
78	63-111	qwen3.6-plus	Alibaba · Proprietary	1407	±7		9,462	$0.33 / $1.95	1M
79	63-112	gpt-5.1	OpenAI · Proprietary	1407	±7		8,000	$0.63 / $5	400K
80	59-118	deepseek-v3.2-exp	DeepSeek · MIT	1407	±13		2,175	$0.27 / $0.41	163.8K
81	63-113	minimax-m3	MiniMax · MiniMax Community License	1406	±7		8,975	$0.60 / $2.40	N/A
82	66-114	deepseek-v4-flash-high-preview	DeepSeek · MIT	1406	±7		10,639	$0.44 / $1.32	1M
83	66-114	deepseek-v4-flash	DeepSeek · MIT	1405	±7		10,434	$0.44 / $1.32	1M
84	60-121	glm-4.7	Z.ai · MIT	1405	±12		2,402	$0.40 / $1.75	204.8K
85	69-115	qwen3.5-397b-a17b	Alibaba · Apache 2.0	1404	±6		14,748	$0.39 / $2.34	262.1K
86	69-116	gemini-3.1-flash-lite-preview	Google · Proprietary	1403	±6		12,644	$0.25 / $1.50	1M
87	69-116	grok-4-1-fast-reasoning	SpaceXAI · Proprietary	1403	±6		10,882	$0.20 / $0.50	2M
88	60-132	kimi-k2.5-instant	Moonshot · Modified MIT	1403	±15		1,430	$0.45 / $2.25	262.1K
89	69-120	mimo-v2.5	Xiaomi · MIT	1401	±7		9,691	$0.14 / $0.28	1.1M
90	71-119	gpt-5.2	OpenAI · Proprietary	1400	±6		16,477	$0.88 / $7	400K
91	70-123	claude-opus-4-20250514	Anthropic · Proprietary	1400	±7		7,635	$15 / $75	200K
92	70-121	gpt-4.1-2025-04-14	OpenAI · Proprietary	1400	±7		9,107	$2 / $8	1M
93	69-129	mimo-v2-omni	Xiaomi · Proprietary	1399	±10		4,269	$0.40 / $2	262.1K
94	70-128	longcat-flash-chat-2602-exp	Meituan · Proprietary	1398	±9		5,451	N/A	N/A
95	71-130	gpt-5-high	OpenAI · Proprietary	1398	±8		5,900	$0.63 / $5	400K
96	71-131	qwen3-max-preview	Alibaba · Proprietary	1397	±9		4,987	$0.78 / $3.90	262.1K
97	69-133	mistral-medium-3.5	Mistral · Modified MIT	1397	±13		2,442	$1.50 / $7.50	262.1K
98	69-133	glm-5v-turbo	Z.ai · Proprietary	1397	±13		2,204	$1.20 / $4	202.8K
99	71-132	grok-3-preview-02-24	SpaceXAI · Proprietary	1397	±8		5,740	$3 / $15	131.1K
100	74-130	deepseek-v3.2	DeepSeek · MIT	1396	±7		8,530	$0.27 / $0.40	163.8K
101	69-133	deepseek-v3.1-thinking	DeepSeek · MIT	1395	±12		2,245	$1.23 / $4.94	N/A
102	74-132	o3-2025-04-16	OpenAI · Proprietary	1395	±6		10,639	$2 / $8	200K
103	74-131	kimi-k2-thinking-turbo	Moonshot · Modified MIT	1394	±6		11,538	$1.15 / $8	262.1K
104	74-132	glm-4.6	Z.ai · MIT	1394	±8		6,626	$0.50 / $2	204.8K
105	71-142	deepseek-v3.2-exp-thinking	DeepSeek · MIT	1391	±14		1,674	$0.27 / $0.41	163.8K
106	77-133	gpt-5-chat	OpenAI · Proprietary	1391	±8		5,656	$1.25 / $10	N/A
107	69-146	ernie-5.0-preview-1022	Baidu · Proprietary	1390	±19		921	N/A	N/A
108	82-133	gpt-5.2-high	OpenAI · Proprietary	1390	±7		8,954	$0.88 / $7	400K
109	80-136	o1-2024-12-17	OpenAI · Proprietary	1390	±8		5,210	$15 / $60	200K
110	75-140	deepseek-r1-0528	DeepSeek · MIT	1389	±11		3,221	$0.50 / $2.15	163.8K
111	87-133	claude-haiku-4-5-20251001	Anthropic · Proprietary	1389	±5		24,857	$1 / $5	200K
112	74-144	qwen3-max-2025-09-23	Alibaba · Proprietary	1389	±14		1,669	$0.78 / $3.90	262.1K
113	84-137	deepseek-v3.2-thinking	DeepSeek · MIT	1388	±7		7,516	$0.27 / $0.40	163.8K
114	84-138	claude-sonnet-4-20250514-thinking-32k	Anthropic · Proprietary	1388	±8		6,149	$3 / $15	1M
115	92-134	gemini-2.5-flash	Google · Proprietary	1387	±5		22,894	$0.15 / $1.25	1M
116	69-155	deepseek-v3.1-terminus-thinking	DeepSeek · MIT	1386	±24		619	$0.27 / $1	163.8K
117	89-141	grok-4-0709	SpaceXAI · Proprietary	1386	±7		7,464	$3 / $15	256K
118	74-148	grok-4-fast-chat	SpaceXAI · Proprietary	1385	±17		1,280	$3 / $15	256K
119	85-144	inkling	Thinky · Apache 2.0	1385	±10		4,459	$1 / $4.05	524.3K
120	90-142	claude-3-7-sonnet-20250219-thinking-32k	Anthropic · Proprietary	1385	±8		6,602	$3 / $15	200K
121	90-145	glm-4.5	Z.ai · MIT	1383	±9		4,359	$0.60 / $2.20	131.1K
122	93-143	deepseek-v3-0324	DeepSeek · MIT	1383	±7		8,109	$3 / $4.50	32.8K
123	92-146	kimi-k2-0711-preview	Moonshot · Modified MIT	1381	±9		4,884	$0.60 / $2.50	131.1K
124	96-146	gemini-2.5-flash-preview-09-2025	Google · Proprietary	1381	±8		6,030	$0.30 / $2.50	1M
125	89-150	kimi-k2-0905-preview	Moonshot · Modified MIT	1380	±13		2,117	$0.60 / $2.50	262.1K
126	74-159	muse-glimmer	Meta · Apache-2.0	1380	±20		936	N/A	N/A
127	94-151	deepseek-v3.1	DeepSeek · MIT	1378	±11		2,773	$1.23 / $4.94	N/A
128	109-146	qwen3-235b-a22b-instruct-2507	Alibaba · Apache 2.0	1377	±5		17,790	$0.26 / $1.06	N/A
129	76-166	deepseek-v3.1-terminus	DeepSeek · MIT	1376	±23		636	$0.27 / $1	163.8K
130	98-155	nvidia-nemotron-3-ultra-550b-a55b-nvfp4	Nvidia · OpenMDW-1.1	1375	±13		2,340	N/A	N/A
131	108-151	claude-sonnet-4-20250514	Anthropic · Proprietary	1374	±8		6,974	$3 / $15	1M
132	111-150	minimax-m2.7	MiniMax · Modified MIT	1374	±7		12,755	$0.30 / $1.20	204.8K
133	74-174	hunyuan-vision-1.5-thinking	Tencent · Proprietary	1374	±29		376	N/A	N/A
134	112-148	mistral-medium-2508	Mistral · Proprietary	1374	±5		17,644	$0.40 / $2	131.1K
135	112-150	mistral-large-3	Mistral · Apache 2.0	1374	±6		12,754	$0.50 / $1.50	N/A
136	109-155	deepseek-r1	DeepSeek · MIT	1372	±10		3,571	$0.70 / $2.50	64K
137	110-155	o1-preview	OpenAI · Proprietary	1372	±10		4,823	$15 / $60	N/A
138	113-152	claude-3-7-sonnet-20250219	Anthropic · Proprietary	1371	±7		7,409	$3 / $15	200K
139	86-174	amazon-nova-experimental-chat-26-02-10	Amazon · Proprietary	1370	±25		543	N/A	N/A
140	90-174	amazon-nova-experimental-chat-26-01-10	Amazon · Proprietary	1369	±23		607	N/A	N/A
141	102-167	hunyuan-hy3-preview	Tencent · tencent-hunyuan-community	1368	±17		1,310	$0.29 / $1.17	262.1K
142	116-163	grok-4-fast-reasoning	SpaceXAI · Proprietary	1367	±10		3,345	$0.20 / $0.50	2M
143	119-161	qwen3.5-122b-a10b	Alibaba · Apache 2.0	1366	±8		5,455	$0.26 / $2.08	262.1K
144	124-160	claude-3-5-sonnet-20241022	Anthropic · Proprietary	1365	±6		14,332	$3 / $15	200K
145	124-165	minimax-m2.5	MiniMax · Modified MIT	1363	±7		7,988	$0.23 / $0.90	204.8K
146	117-174	qwen3-vl-235b-a22b-thinking	Alibaba · Apache 2.0	1361	±15		1,455	$0.40 / $4	131.1K
147	126-166	gemini-2.5-flash-lite-preview-06-17-thinking	Google · Proprietary	1360	±8		5,892	$0.10 / $0.40	1M
148	129-167	qwen3-235b-a22b-no-thinking	Alibaba · Apache 2.0	1359	±8		6,707	$0.46 / $1.82	131.1K
149	120-174	qwen3-vl-235b-a22b-instruct	Alibaba · Apache 2.0	1359	±14		1,914	$0.21 / $1.90	262.1K
150	126-169	qwen3.5-27b	Alibaba · Apache 2.0	1359	±9		5,075	$0.20 / $1.56	262.1K
151	132-172	mimo-v2-flash (non-thinking)	Xiaomi · MIT	1356	±7		8,806	$0.10 / $0.30	262.1K
152	132-174	mistral-medium-2505	Mistral · Proprietary	1354	±8		5,647	$0.40 / $2	131.1K
153	132-174	qwen3-coder-480b-a35b-instruct	Alibaba · Apache 2.0	1354	±9		4,562	$0.40 / $1.60	262.1K
154	136-174	gpt-5.4-nano-high	OpenAI · Proprietary	1353	±7		12,535	$0.20 / $1.25	400K
155	136-176	trinity-large-preview	Apache 2.0	1351	±9		5,607	$0.15 / $0.45	131K
156	114-201	glm-4.6v	Z.ai · MIT	1351	±26		509	$0.30 / $0.90	131.1K
157	136-180	minimax-m2.1-preview	MiniMax · MIT	1350	±11		3,212	$0.30 / $1.20	204.8K
158	131-184	qwen3-235b-a22b-thinking-2507	Alibaba · Apache 2.0	1350	±15		1,543	$0.23 / $2.30	262.1K
159	139-175	step-3.5-flash	StepFun · Apache 2.0	1350	±6		11,375	$0.10 / $0.30	262.1K
160	140-176	o4-mini-2025-04-16	OpenAI · Proprietary	1349	±7		8,025	$1.10 / $4.40	200K
161	138-180	deepseek-v3	DeepSeek · DeepSeek	1349	±9		4,191	$1.14 / $4.56	N/A
162	140-179	gpt-4.1-mini-2025-04-14	OpenAI · Proprietary	1348	±8		6,819	$0.40 / $1.60	1M
163	139-180	gpt-5-mini-high	OpenAI · Proprietary	1348	±9		4,879	$0.13 / $1	400K
164	137-189	mimo-v2-flash (thinking)	Xiaomi · MIT	1346	±13		2,014	$0.10 / $0.30	262.1K
165	141-180	qwen3.5-35b-a3b	Alibaba · Apache 2.0	1346	±8		5,639	$0.25 / $1.25	262.1K
166	143-180	gemini-2.5-flash-lite-preview-09-2025-no-thinking	Google · Proprietary	1345	±7		8,586	$0.10 / $0.40	1M
167	145-180	qwen3.5-flash	Alibaba · Proprietary	1345	±7		11,814	N/A	N/A
168	146-184	gemini-2.0-flash-001	Google · Proprietary	1342	±7		7,784	$0.10 / $0.40	1M
169	136-206	hunyuan-t1-20250711	Tencent · Proprietary	1341	±20		862	N/A	N/A
170	147-193	qwen2.5-max	Alibaba · Proprietary	1340	±8		5,998	N/A	N/A
171	145-201	longcat-flash-chat	Meituan · MIT	1338	±13		1,975	$0.20 / $0.80	131.1K
172	155-196	gpt-4o-2024-05-13	OpenAI · Proprietary	1338	±7		17,607	$5 / $15	128K
173	146-201	Inkling Small	Thinky · Apache 2.0	1337	±12		2,700	$0.45 / $1.20	524.3K
174	147-197	gemini-advanced-0514	Google · Proprietary	1337	±10		7,526	N/A	N/A
175	156-196	gemini-1.5-pro-002	Google · Proprietary	1336	±7		9,269	$3.50 / $10.50	2.1M
176	146-204	hunyuan-turbos-20250416	Tencent · Proprietary	1336	±13		1,884	N/A	N/A
177	159-204	qwen3-30b-a3b-instruct-2507	Alibaba · Apache 2.0	1332	±9		4,177	$0.05 / $0.19	262.1K
178	167-204	command-a-03-2025	Cohere · CC-BY-NC-4.0	1329	±6		10,102	$2.50 / $10	256K
179	167-206	gemma-3-27b-it	Google · Gemma	1327	±7		8,109	$0.08 / $0.45	262.1K
180	165-209	trinity-large-thinking	Apache 2.0	1327	±9		5,922	$0.22 / $0.85	262.1K
181	165-210	qwen3-next-80b-a3b-instruct	Alibaba · Apache 2.0	1327	±9		4,245	$0.09 / $1.10	262.1K
182	167-210	gemini-2.0-flash-lite-preview-02-05	Google · Proprietary	1327	±9		4,510	$0.07 / $0.30	1M
183	165-214	grok-3-mini-high	SpaceXAI · Proprietary	1325	±11		2,998	$0.25 / $1.27	N/A
184	168-210	minimax-m1	MiniMax · Apache 2.0	1325	±8		6,328	$0.55 / $2.20	1M
185	168-213	gpt-4o-2024-08-06	OpenAI · Proprietary	1325	±8		7,043	$2.50 / $10	128K
186	167-214	mistral-small-2506	Mistral · Apache 2.0	1325	±10		3,179	$0.10 / $0.30	32K
187	168-213	glm-4.5-air	Z.ai · MIT	1325	±8		5,730	$0.13 / $0.85	131.1K
188	158-222	step-3	StepFun · Apache 2.0	1324	±17		1,106	$0.57 / $1.42	65.5K
189	169-214	qwen3-235b-a22b	Alibaba · Apache 2.0	1324	±9		4,760	$0.46 / $1.82	131.1K
190	158-225	glm-4.5v	Z.ai · MIT	1322	±19		882	$0.60 / $1.80	65.5K
191	169-214	grok-3-mini-beta	SpaceXAI · Proprietary	1322	±10		3,842	$0.30 / $0.50	131.1K
192	158-229	amazon-nova-experimental-chat-12-10	Amazon · Proprietary	1321	±21		736	N/A	N/A
193	167-222	glm-4.7-flash	Z.ai · MIT	1320	±13		2,061	$0.06 / $0.40	202.8K
194	171-225	qwen3-next-80b-a3b-thinking	Alibaba · Apache 2.0	1316	±12		2,463	$0.15 / $1.20	262.1K
195	168-230	nvidia-nemotron-3-super-120b-a12b	Nvidia · NVIDIA Open Model	1316	±17		1,189	N/A	N/A
196	178-220	grok-2-2024-08-13	SpaceXAI · Proprietary	1315	±7		10,293	$2 / $10	131.1K
197	175-223	amazon-nova-experimental-chat-11-10	Amazon · Proprietary	1314	±9		4,465	N/A	N/A
198	178-222	gpt-4-turbo-2024-04-09	OpenAI · Proprietary	1314	±7		14,793	$10 / $30	128K
199	165-242	mercury-2	Inception AI · Proprietary	1313	±23		664	$0.25 / $0.75	128K
200	180-224	claude-3-5-sonnet-20240620	Anthropic · Proprietary	1311	±7		13,185	$3 / $15	200K
201	180-229	o3-mini-high	OpenAI · Proprietary	1310	±10		3,214	$0.55 / $2.20	200K
202	184-229	gemini-1.5-pro-001	Google · Proprietary	1309	±8		12,133	$3.50 / $10.50	2.1M
203	172-249	gemma-3-12b-it	Google · Gemma	1306	±21		697	$0.05 / $0.15	131.1K
204	169-260	llama-3.3-nemotron-49b-super-v1	Nvidia · Nvidia	1305	±27		410	N/A	N/A
205	175-248	intellect-3	MIT	1304	±19		1,076	$0.20 / $1.10	131.1K
206	190-230	claude-3-5-haiku-20241022	Anthropic · Proprietary	1304	±6		12,492	$1 / $5	200K
207	190-232	llama-3.1-405b-instruct-fp8	Meta · Llama 3.1 Community	1304	±7		9,523	$4 / $4	32.8K
208	172-259	llama-3.1-nemotron-ultra-253b-v1	Nvidia · Nvidia Open Model	1303	±24		532	$0.60 / $1.80	131.1K
209	181-248	deepseek-v2.5-1210	DeepSeek · DeepSeek	1302	±16		1,216	N/A	N/A
210	172-261	solar-pro4	Upstage · Proprietary	1302	±25		647	$0.03 / $0.12	524.3K
211	175-258	hunyuan-large-2025-02-10	Tencent · Proprietary	1302	±22		646	N/A	N/A
212	180-250	step-2-16k-exp-202412	StepFun · Proprietary	1302	±18		873	N/A	N/A
213	191-235	o3-mini	OpenAI · Proprietary	1301	±6		10,322	$0.55 / $2.20	200K
214	172-262	hunyuan-turbo-0110	Tencent · Proprietary	1301	±25		449	N/A	N/A
215	184-250	minimax-m2	MiniMax · Apache 2.0	1300	±17		1,195	$0.26 / $1.02	204.8K
216	184-250	glm-4-plus-0111	Z.ai · Proprietary	1300	±17		1,062	N/A	N/A
217	190-250	amazon-nova-experimental-chat-10-20	Amazon · Proprietary	1296	±13		2,050	N/A	N/A
218	198-246	llama-3.1-405b-instruct-bf16	Meta · Llama 3.1 Community	1296	±7		7,230	$4 / $4	32.8K
219	198-246	llama-4-maverick-17b-128e-instruct	Meta · Llama 4	1295	±8		7,009	$0.63 / $1.80	131.1K
220	195-250	yi-lightning	Proprietary	1295	±10		3,980	N/A	N/A
221	191-256	olmo-3.1-32b-instruct	Ai2 · Apache 2.0	1294	±13		2,114	$0.20 / $0.60	65.5K
222	190-261	qwen-plus-0125	Alibaba · Proprietary	1294	±17		1,091	$0.40 / $1.20	131.1K
223	186-276	amazon-nova-experimental-chat-10-09	Amazon · Proprietary	1291	±24		487	N/A	N/A
224	201-253	mistral-large-2407	Mistral · Mistral Research	1290	±8		7,002	$2 / $6	131.1K
225	203-251	gpt-4-1106-preview	OpenAI · Proprietary	1290	±8		15,221	$10 / $30	128K
226	203-256	llama-4-scout-17b-16e-instruct	Meta · Llama	1290	±9		5,345	$0.40 / $0.70	8.2K
227	190-276	nvidia-llama-3.3-nemotron-super-49b-v1.5	Nvidia · Nvidia Open	1288	±23		570	$0.10 / $0.40	131.1K
228	198-265	magistral-medium-2506	Mistral · Proprietary	1288	±14		1,982	$2 / $5	40K
229	204-258	gpt-4-0125-preview	OpenAI · Proprietary	1287	±8		13,994	$10 / $30	128K
230	196-274	gpt-4.1-nano-2025-04-14	OpenAI · Proprietary	1287	±17		1,061	$0.10 / $0.40	1M
231	204-260	qwq-32b	Alibaba · Apache 2.0	1287	±9		4,481	$0.50 / $1	16.4K
232	190-279	hunyuan-turbos-20250226	Tencent · Proprietary	1286	±26		448	N/A	N/A
233	205-261	gpt-oss-120b	OpenAI · Apache 2.0	1286	±8		5,541	$0.03 / $0.17	131.1K
234	194-276	qwen3-32b	Alibaba · Apache 2.0	1286	±21		704	$0.08 / $0.28	131.1K
235	205-259	llama-3.3-70b-instruct	Meta · Llama-3.3	1285	±6		9,753	$0.10 / $0.32	131.1K
236	205-260	gpt-4o-mini-2024-07-18	OpenAI · Proprietary	1284	±7		11,286	$0.15 / $0.60	128K
237	206-260	claude-3-opus-20240229	Anthropic · Proprietary	1284	±6		29,359	$15 / $75	200K
238	204-274	nova-2-lite	Amazon · Proprietary	1282	±13		2,221	$0.30 / $2.50	1M
239	206-264	o1-mini	OpenAI · Proprietary	1282	±7		8,598	$1.10 / $4.40	N/A
240	206-274	glm-4-plus	Z.ai · Proprietary	1280	±10		3,855	$0.44 / $1.76	204.8K
241	198-281	nvidia-nemotron-3.5-lightning-30b-a3b-nvfp4	Nvidia · OpenMDW-1.1	1280	±23	Preliminary	822	N/A	N/A
242	205-275	qwen-max-0919	Alibaba · Qwen	1280	±12		2,396	$1.60 / $6.40	32.8K
243	206-274	gemma-3n-e4b-it	Google · Gemma	1279	±10		3,924	$0.06 / $0.12	32.8K
244	205-279	step-1o-turbo-202506	StepFun · Proprietary	1278	±15		1,481	N/A	N/A
245	205-279	gpt-5-nano-high	OpenAI · Proprietary	1277	±16		1,384	$0.03 / $0.20	400K
246	211-275	mistral-small-3.1-24b-instruct-2503	Mistral · Apache 2.0	1276	±8		5,880	$0.10 / $0.30	32K
247	205-280	ling-flash-2.0	Ant Group · MIT	1275	±17		1,188	N/A	N/A
248	218-277	gemini-1.5-flash-002	Google · Proprietary	1273	±8		5,693	$0.07 / $0.30	1M
249	222-276	gemma-2-27b-it	Google · Gemma license	1273	±6		12,280	$0.65 / $0.65	8.2K
250	220-279	mistral-large-2411	Mistral · MRL	1271	±8		5,130	$2 / $6	128K
251	218-279	athene-70b-0725	CC-BY-NC-4.0	1271	±11		3,246	N/A	N/A
252	210-282	jamba-1.5-large	Jamba Open	1270	±15		1,433	$2 / $8	256K
253	208-282	ring-flash-2.0	Ant Group · MIT	1270	±16		1,262	N/A	N/A
254	224-279	qwen3-30b-a3b	Alibaba · Apache 2.0	1270	±9		4,592	$0.13 / $0.52	131.1K
255	231-279	gpt-4-0613	OpenAI · Proprietary	1268	±8		13,910	$30 / $60	8.2K
256	216-282	gemma-2-9b-it-simpo	MIT	1268	±14		1,692	$0.03 / $0.09	8.2K
257	208-283	llama-3.1-nemotron-70b-instruct	Nvidia · Llama 3.1	1268	±19		961	$1.20 / $1.20	131.1K
258	217-287	olmo-3-32b-think	Ai2 · Apache 2.0	1264	±18		1,054	$0.15 / $0.50	65.5K
259	234-282	deepseek-v2.5	DeepSeek · DeepSeek	1264	±10		3,664	N/A	N/A
260	234-282	gpt-4-0314	OpenAI · Proprietary	1264	±10		8,080	$30 / $60	8.2K
261	234-281	grok-2-mini-2024-08-13	SpaceXAI · Proprietary	1264	±7		8,614	$2 / $10	131.1K
262	234-281	llama-3.1-70b-instruct	Meta · Llama 3.1 Community	1264	±7		8,719	$0.40 / $0.40	131.1K
263	234-283	nvidia-nemotron-3-nano-30b-a3b-bf16	Nvidia · NVIDIA Open Model	1261	±11		2,883	$0.06 / $0.24	262.1K
264	217-288	llama-3.1-tulu-3-70b	Ai2 · Llama 3.1	1260	±22		551	N/A	N/A
265	218-289	granite-4.1-8b	IBM · Apache 2.0	1259	±23		859	$0.05 / $0.10	131.1K
266	220-288	hunyuan-standard-2025-02-10	Tencent · Proprietary	1259	±22		675	N/A	N/A
267	228-288	ibm-granite-h-small	IBM · Apache 2.0	1258	±20		990	N/A	N/A
268	234-288	command-r-plus-08-2024	Cohere · CC-BY-NC-4.0	1258	±15		1,450	$2.50 / $10	128K
269	234-288	gpt-oss-20b	OpenAI · Apache 2.0	1257	±15		1,764	$0.03 / $0.13	131.1K
270	234-288	olmo-3.1-32b-think	Ai2 · Apache 2.0	1256	±15		1,664	$0.15 / $0.50	65.5K
271	245-285	gemini-1.5-flash-001	Google · Proprietary	1256	±8		9,767	$0.07 / $0.30	1M
272	232-289	hunyuan-large-vision	Tencent · Proprietary	1255	±20		885	N/A	N/A
273	240-288	qwen2.5-plus-1127	Alibaba · Proprietary	1255	±13		1,872	N/A	N/A
274	244-288	nemotron-4-340b-instruct	Nvidia · NVIDIA Open Model	1253	±11		3,252	N/A	N/A
275	232-291	olmo-2-0325-32b-instruct	Ai2 · Apache-2.0	1252	±23		606	$0.05 / $0.20	128K
276	233-293	llama-3.1-nemotron-51b-instruct	Nvidia · Llama 3.1	1251	±24		551	N/A	N/A
277	253-288	llama-3-70b-instruct	Meta · Llama 3 Community	1250	±7		23,202	$0.51 / $0.74	8.2K
278	252-288	athene-v2-chat	NexusFlow	1249	±9		4,378	N/A	N/A
279	238-293	gemma-3-4b-it	Google · Gemma	1248	±21		761	$0.05 / $0.10	131.1K
280	256-288	gemma-2-9b-it	Google · Gemma license	1248	±7		9,128	$0.03 / $0.09	8.2K
281	245-291	reka-core-20240904	Proprietary	1247	±17		1,092	N/A	N/A
282	261-288	qwen2.5-72b-instruct	Alibaba · Qwen	1245	±8		6,207	$1.20 / $1.20	N/A
283	234-304	mercury	Inception AI · Proprietary	1240	±33		372	$0.25 / $0.75	128K
284	263-289	amazon-nova-pro-v1.0	Amazon · Proprietary	1240	±9		4,518	$0.80 / $3.20	300K
285	264-289	claude-3-sonnet-20240229	Anthropic · Proprietary	1239	±8		15,961	$3 / $15	200K
286	264-292	command-r-plus	Cohere · CC-BY-NC-4.0	1237	±8		11,264	$2.50 / $10	128K
287	263-297	glm-4-0520	Z.ai · Proprietary	1234	±15		1,605	N/A	N/A
288	265-302	reka-flash-20240904	Proprietary	1228	±17		1,115	N/A	N/A
289	277-299	mistral-small-24b-instruct-2501	Mistral · Apache 2.0	1225	±12		2,680	$0.05 / $0.08	32.8K
290	281-300	qwen2-72b-instruct	Alibaba · Qianwen LICENSE	1221	±9		5,791	$0.90 / $0.90	32.8K
291	281-300	c4ai-aya-expanse-32b	Cohere · CC-BY-NC-4.0	1221	±9		4,344	N/A	N/A
292	284-299	claude-3-haiku-20240307	Anthropic · Proprietary	1220	±7		17,134	$0.25 / $1.25	200K
293	286-304	gemini-1.5-flash-8b-001	Google · Proprietary	1217	±8		5,700	$0.07 / $0.30	1M
294	283-311	command-r-08-2024	Cohere · CC-BY-NC-4.0	1215	±14		1,593	$0.15 / $0.60	128K
295	286-306	mistral-large-2402	Mistral · Proprietary	1213	±9		9,175	$4 / $12	32K
296	286-311	deepseek-coder-v2	DeepSeek · DeepSeek License	1212	±12		2,513	$0.14 / $0.28	128K
297	286-315	jamba-1.5-mini	Jamba Open	1210	±15		1,450	$0.20 / $0.40	256K
298	287-314	amazon-nova-lite-v1.0	Amazon · Proprietary	1207	±10		3,418	$0.06 / $0.24	300K
299	291-316	phi-4	Microsoft · MIT	1202	±9		4,486	$0.07 / $0.14	16.4K
300	292-317	mixtral-8x22b-instruct-v0.1	Mistral · Apache 2.0	1202	±9		7,616	$0.90 / $0.90	65.5K
301	291-320	reka-flash-21b-20240226-online	Proprietary	1197	±14		2,125	N/A	N/A
302	294-320	gpt-3.5-turbo-0125	OpenAI · Proprietary	1196	±9		9,653	$0.50 / $1.50	16.4K
303	295-320	command-r	Cohere · CC-BY-NC-4.0	1194	±9		7,973	$0.15 / $0.60	128K
304	295-320	amazon-nova-micro-v1.0	Amazon · Proprietary	1193	±10		3,339	$0.04 / $0.14	128K
305	295-322	qwen1.5-110b-chat	Alibaba · Qianwen LICENSE	1192	±11		3,882	N/A	N/A
306	292-332	ministral-8b-2410	Mistral · MRL	1190	±20		773	$0.10 / $0.10	131.1K
307	289-332	zephyr-orpo-141b-A35b-v0.1	Apache 2.0	1190	±23		617	N/A	N/A
308	297-323	mistral-medium	Mistral · Proprietary	1189	±11		5,402	$2.70 / $8.10	32K
309	298-323	llama-3-8b-instruct	Meta · Llama 3 Community	1187	±8		15,413	$0.14 / $0.14	8.2K
310	295-328	gemini-pro-dev-api	Google · Proprietary	1187	±14		2,882	$0.35 / $1.05	32.8K
311	294-332	qwen2.5-coder-32b-instruct	Alibaba · Apache 2.0	1187	±19		929	$0.87 / $0.87	32K
312	297-326	qwen1.5-72b-chat	Alibaba · Qianwen LICENSE	1187	±10		5,818	N/A	N/A
313	287-340	hunyuan-standard-256k	Tencent · Proprietary	1186	±29		379	N/A	N/A
314	299-332	c4ai-aya-expanse-8b	Cohere · CC-BY-NC-4.0	1181	±14		1,784	N/A	N/A
315	295-340	llama-3.1-tulu-3-8b	Ai2 · Llama 3.1	1179	±23		563	N/A	N/A
316	297-340	gemini-pro	Google · Proprietary	1177	±21		1,035	$0.35 / $1.05	32.8K
317	300-339	wizardlm-70b	Microsoft · Llama 2 Community	1175	±18		1,539	N/A	N/A
318	305-332	llama-3.1-8b-instruct	Meta · Llama 3.1 Community	1174	±8		7,706	$0.05 / $0.08	131.1K
319	306-332	gemma-2-2b-it	Google · Gemma license	1172	±8		7,532	N/A	N/A
320	301-341	openchat-3.5	Apache-2.0	1172	±17		1,340	$0.20 / $0.20	N/A
321	301-343	tulu-2-dpo-70b	AI2 ImpACT Low-risk	1171	±20		989	N/A	N/A
322	305-338	dbrx-instruct-preview	DBRX LICENSE	1170	±12		4,630	$0.60 / $0.60	32.8K
323	309-339	mixtral-8x7b-instruct-v0.1	Mistral · Apache 2.0	1166	±8		11,001	$0.63 / $0.63	32K
324	301-346	granite-3.1-8b-instruct	IBM · Apache 2.0	1166	±25		537	N/A	N/A
325	308-341	vicuna-33b	Non-commercial	1165	±12		3,642	$0 / $0	2K
326	308-344	gpt-3.5-turbo-1106	OpenAI · Proprietary	1163	±15		2,646	$1 / $2	16.4K
327	309-343	reka-flash-21b-20240226	Proprietary	1162	±12		3,476	N/A	N/A
328	310-346	yi-34b-chat	Yi License	1159	±13		2,338	$0.90 / $0.90	4.1K
329	316-346	yi-1.5-34b-chat	Apache-2.0	1152	±11		3,893	N/A	N/A
330	316-346	gemma-1.1-7b-it	Google · Gemma license	1151	±12		3,421	$0.03 / $0.09	8.2K
331	310-352	openhermes-2.5-mistral-7b	Apache-2.0	1151	±21		799	$0.17 / $0.17	N/A
332	310-356	granite-3.1-2b-instruct	IBM · Apache 2.0	1148	±24		567	N/A	N/A
333	319-350	snowflake-arctic-instruct	Apache 2.0	1145	±12		4,657	N/A	N/A
334	316-357	llama-3.2-3b-instruct	Meta · Llama 3.2	1142	±18		1,149	$0.05 / $0.33	131.1K
335	316-359	granite-3.0-8b-instruct	IBM · Apache 2.0	1141	±21		934	N/A	N/A
336	310-362	guanaco-33b	Non-commercial	1141	±29		443	N/A	N/A
337	322-356	openchat-3.5-0106	Apache-2.0	1141	±15		1,868	N/A	N/A
338	316-359	deepseek-llm-67b-chat	DeepSeek · DeepSeek License	1141	±21		802	N/A	N/A
339	308-369	falcon-180b-chat	Falcon-180B TII License	1140	±37		229	N/A	N/A
340	317-358	wizardlm-13b	Microsoft · Llama 2 Community	1140	±18		1,219	$0.30 / $0.30	N/A
341	324-354	qwen1.5-32b-chat	Alibaba · Qianwen LICENSE	1140	±12		3,063	N/A	N/A
342	327-356	phi-3-medium-4k-instruct	Microsoft · MIT	1136	±11		3,888	$0.17 / $0.68	N/A
343	326-359	starling-lm-7b-alpha	CC-BY-NC-4.0	1133	±15		1,622	N/A	N/A
344	316-369	mpt-30b-chat	CC-BY-NC-SA-4.0	1131	±29		435	N/A	N/A
345	331-362	qwen1.5-14b-chat	Alibaba · Qianwen LICENSE	1125	±14		2,453	$0.30 / $0.30	N/A
346	327-371	solar-10.7b-instruct-v1.0	CC-BY-NC-4.0	1123	±24		654	$0.30 / $0.30	N/A
347	331-367	internlm2_5-20b-chat	Other	1122	±16		1,427	$0 / $0	32.8K
348	324-376	dolphin-2.2.1-mistral-7b	Apache-2.0	1119	±33		282	$0.50 / $0.50	16.4K
349	332-371	zephyr-7b-beta	MIT	1115	±16		1,869	$0.15 / $0.15	16.4K
350	334-369	phi-3-small-8k-instruct	Microsoft · MIT	1114	±13		2,625	$0.15 / $0.60	N/A
351	333-371	starling-lm-7b-beta	Apache-2.0	1113	±15		2,204	N/A	N/A
352	331-375	nous-hermes-2-mixtral-8x7b-dpo	Apache-2.0	1113	±24		593	$0.90 / $0.90	N/A
353	338-369	llama-2-70b-chat	Meta · Llama 2 Community	1112	±10		6,070	$0.70 / $2.80	4.1K
354	337-371	vicuna-13b	Llama 2 Community	1111	±13		3,239	$0.30 / $0.30	N/A
355	331-376	llama2-70b-steerlm-chat	Nvidia · Llama 2 Community	1110	±25		591	N/A	N/A
356	339-373	mistral-7b-instruct-v0.2	Mistral · Apache-2.0	1109	±12		2,920	$0.20 / $0.20	32.8K
357	334-376	granite-3.0-2b-instruct	IBM · Apache 2.0	1106	±21		941	N/A	N/A
358	342-375	llama-2-13b-chat	Meta · Llama 2 Community	1103	±13		3,085	$0.25 / $0.25	4.1K
359	333-378	qwq-32b-preview	Alibaba · Apache 2.0	1102	±27		540	$0.50 / $1	16.4K
360	332-378	zephyr-7b-alpha	MIT	1099	±32		329	N/A	N/A
361	342-378	vicuna-7b	Llama 2 Community	1098	±18		1,285	$0.20 / $0.20	N/A
362	342-378	palm-2	Google · Proprietary	1097	±18		1,480	$0.50 / $0.50	25.8K
363	345-378	phi-3-mini-4k-instruct-june-2024	Microsoft · MIT	1091	±14		1,973	$0.13 / $0.52	4.1K
364	344-378	gemma-7b-it	Google · Gemma license	1090	±18		1,291	$0.05 / $0.08	8.2K
365	344-378	stripedhyena-nous-7b	Apache 2.0	1088	±21		806	$0.20 / $0.20	N/A
366	345-378	gemma-1.1-2b-it	Google · Gemma license	1087	±17		1,499	N/A	N/A
367	349-378	phi-3-mini-128k-instruct	Microsoft · MIT	1086	±14		2,922	$0.13 / $0.52	N/A
368	344-379	qwen-14b-chat	Alibaba · Qianwen LICENSE	1085	±21		847	N/A	N/A
369	344-379	qwen1.5-7b-chat	Alibaba · Qianwen LICENSE	1085	±23		708	$0.20 / $0.20	N/A
370	349-379	llama-3.2-1b-instruct	Meta · Llama 3.2	1081	±19		1,151	$0.03 / $0.20	60K
371	353-379	codellama-34b-instruct	Meta · Llama 2 Community	1081	±17		1,375	$0.35 / $1.40	16.4K
372	353-379	mistral-7b-instruct	Mistral · Apache 2.0	1080	±17		1,497	$0.07 / $0.28	4.1K
373	344-382	smollm2-1.7b-instruct	Apache 2.0	1074	±33		360	N/A	N/A
374	354-380	alpaca-13b	Non-commercial	1074	±22		935	N/A	N/A
375	359-380	phi-3-mini-4k-instruct	Microsoft · MIT	1069	±12		2,995	$0.13 / $0.52	N/A
376	354-382	gemma-2b-it	Google · Gemma license	1068	±23		677	$0.10 / $0.10	N/A
377	359-380	llama-2-7b-chat	Meta · Llama 2 Community	1068	±14		2,220	$0.15 / $0.15	4.1K
378	356-384	gpt4all-13b-snoozy	Non-commercial	1050	±37		253	N/A	N/A
379	368-383	qwen1.5-4b-chat	Alibaba · Qianwen LICENSE	1048	±18		1,147	$0.10 / $0.10	N/A
380	373-385	mpt-7b-chat	CC-BY-NC-SA-4.0	1036	±24		717	N/A	N/A
381	376-385	koala-13b	Non-commercial	1030	±20		1,134	N/A	N/A
382	376-386	olmo-7b-instruct	Ai2 · Apache-2.0	1025	±21		876	$0.20 / $0.20	N/A
383	378-386	chatglm3-6b	Apache-2.0	1017	±24		754	N/A	N/A
384	379-388	chatglm2-6b	Apache-2.0	994	±28		483	N/A	N/A
385	380-388	RWKV-4-Raven-14B	Apache 2.0	990	±22		834	N/A	N/A
386	382-388	oasst-pythia-12b	Apache 2.0	987	±21		1,067	N/A	N/A
387	384-391	fastchat-t5-3b	Apache 2.0	959	±25		719	N/A	N/A
388	384-391	llama-13b	Meta · Non-commercial	939	±32		402	$0.23 / $0.23	N/A
389	387-391	dolly-v2-12b	MIT	937	±28		558	N/A	N/A
390	387-391	chatglm-6b	Non-commercial	913	±25		774	N/A	N/A
391	387-391	stablelm-tuned-alpha-7b	CC-BY-NC-SA-4.0	906	±29		514	N/A	N/A
```

## Category: Occupational: Business, Management, & Financial Ops (adjustment: None)

Source: https://arena.ai, Text Arena leaderboard, Categories panel, "Occupational: Business, Management, & Financial Ops" selected, Adjustments = None.
Date shown on page: Aug 19, 2026. Votes: 1,229,406. Models: 386. Captured row count: 386 (verified match).

```
1	1-21	muse-spark-1.2 (xHigh)	Meta · Proprietary	1514	±23		644	$1.25 / $4.25	N/A
2	1-7	claude-opus-4-7-high	Anthropic · Proprietary	1509	±7		12,133	$5 / $25	1M
3	1-16	claude-opus-4-6-high	Anthropic · Proprietary	1502	±6		14,466	$5 / $25	1M
4	1-16	claude-opus-4-6	Anthropic · Proprietary	1501	±6		15,264	$5 / $25	1M
5	1-18	claude-fable-5	Anthropic · Proprietary	1500	±9		4,911	$10 / $50	1M
6	1-24	muse-spark-1.1	Meta · Proprietary	1496	±10		3,912	$1.25 / $4.25	N/A
7	2-24	claude-opus-4-7	Anthropic · Proprietary	1495	±7		12,329	$5 / $25	1M
8	1-29	kimi-k3-max	Moonshot · Kimi K3 license	1492	±11		2,885	N/A	N/A
9	2-26	claude-opus-4-8-high	Anthropic · Proprietary	1491	±7		8,868	$5 / $25	1M
10	2-29	claude-opus-5-high	Anthropic · Proprietary	1491	±9		4,931	$5 / $25	1M
11	2-34	muse-spark	Meta · Proprietary	1490	±12		2,743	N/A	N/A
12	2-27	gpt-5.5-high	OpenAI · Proprietary	1489	±7		11,750	$2.50 / $15	1.1M
13	2-36	gpt-5.6-sol-xhigh	OpenAI · Proprietary	1487	±10		3,627	$5 / $30	N/A
14	4-30	claude-opus-4-8	Anthropic · Proprietary	1487	±7		8,836	$5 / $25	1M
15	2-36	gemini-3.6-flash-high	Google · Proprietary	1486	±11		3,275	$0.38 / $1.88	1M
16	5-34	gpt-5.5	OpenAI · Proprietary	1484	±7		11,952	$2.50 / $15	1.1M
17	2-47	qwen3.8-max	Alibaba · Proprietary	1484	±14		1,829	$2 / $6	1M
18	6-35	claude-sonnet-4-6	Anthropic · Proprietary	1484	±6		13,248	$1.50 / $7.50	1M
19	5-36	gpt-5.4-high	OpenAI · Proprietary	1484	±7		12,370	$2.50 / $15	1.1M
20	4-36	gpt-5.2-chat-latest-20260210	OpenAI · Proprietary	1484	±8		6,687	$1.75 / $14	128K
21	2-66	gemini-3.7-flash-high	Google · Proprietary	1477	±19	Preliminary	994	$0.75 / $3.57	1M
22	6-60	claude-opus-5-max	Anthropic · Proprietary	1477	±13		2,346	$5 / $25	1M
23	8-49	ernie-5.1	Baidu · Proprietary	1477	±8		7,423	N/A	N/A
24	10-46	gemini-3.1-pro-preview	Google · Proprietary	1477	±6		19,369	$1 / $6	1M
25	8-53	gpt-5.5-instant	OpenAI · Proprietary	1476	±9		5,429	$2.50 / $15	1.1M
26	9-51	gemini-3-pro	Google · Proprietary	1475	±7		7,646	$2 / $12	1M
27	10-50	gpt-5.4	OpenAI · Proprietary	1475	±7		13,079	$2.50 / $15	1.1M
28	13-53	claude-opus-4-5-20251101	Anthropic · Proprietary	1473	±6		13,730	$5 / $25	200K
29	13-58	mimo-v2.5-pro	Xiaomi · MIT	1472	±7		10,553	$0.43 / $0.87	1.1M
30	13-63	grok-4.20-beta1	SpaceXAI · Proprietary	1471	±9		5,171	N/A	N/A
31	13-63	gemini-3-flash	Google · Proprietary	1470	±8		5,681	$0.50 / $3	1M
32	5-89	grok-4.6-high	SpaceXAI · Proprietary	1469	±22	Preliminary	714	$2 / $6	500K
33	15-68	gpt-5.6-terra-xhigh	OpenAI · Proprietary	1467	±10		3,645	$2.50 / $15	N/A
34	16-68	gpt-5.6-luna-xhigh	OpenAI · Proprietary	1467	±10		3,774	$1 / $6	N/A
35	20-66	claude-opus-4-5-20251101-high-32k	Anthropic · Proprietary	1466	±8		6,928	$5 / $25	200K
36	20-64	grok-4.20-beta-0309-reasoning	SpaceXAI · Proprietary	1466	±6		12,602	$1.25 / $2.50	1M
37	20-66	glm-5.1	Z.ai · MIT	1465	±7		8,340	$1.40 / $4.40	202.8K
38	20-69	claude-sonnet-5-high	Anthropic · Proprietary	1464	±9		5,280	$1 / $5	1M
39	22-66	dola-seed-2.0-pro	Bytedance · Proprietary	1463	±6		14,651	N/A	N/A
40	20-69	gemini-3.5-flash-high	Google · Proprietary	1463	±8		5,788	$0.75 / $4.50	1M
41	6-100	deepseek-v4-pro-high-20260813	DeepSeek · MIT	1463	±25		502	$1.32 / $3.96	N/A
42	20-74	grok-4.5	SpaceXAI · Proprietary	1463	±10		4,154	$2 / $6	500K
43	23-68	grok-4.1	SpaceXAI · Proprietary	1463	±6		12,898	N/A	N/A
44	20-71	gemini-3.5-flash-medium	Google · Proprietary	1463	±9		5,443	$0.75 / $4.50	1M
45	20-77	qwen3.5-max-preview	Alibaba · Proprietary	1462	±9		4,308	$1.20 / $6	N/A
46	22-77	glm-5.2-max	Z.ai · MIT	1461	±8		5,873	$1.40 / $4.40	1M
47	27-68	claude-sonnet-4-5-20250929	Anthropic · Proprietary	1461	±5		15,462	$3 / $15	200K
48	25-71	deepseek-v4-pro	DeepSeek · MIT	1461	±7		10,747	$1.32 / $3.96	1M
49	21-84	gemini-3.5-flash-lite	Google · Proprietary	1460	±11		3,184	$0.15 / $1.25	1M
50	27-71	grok-4.1-thinking	SpaceXAI · Proprietary	1460	±6		12,610	N/A	N/A
51	27-73	gpt-5.4-mini-high	OpenAI · Proprietary	1460	±7		12,120	$0.75 / $4.50	400K
52	25-80	gpt-5.3-chat-latest	OpenAI · Proprietary	1459	±8		6,520	$1.75 / $14	128K
53	12-99	qwen3.7-max-preview	Alibaba · Proprietary	1459	±21		837	$1.48 / $4.42	1M
54	28-74	claude-sonnet-4-5-20250929-high-32k	Anthropic · Proprietary	1459	±5		15,724	$3 / $15	200K
55	29-84	grok-4.20-multi-agent-beta-0309	SpaceXAI · Proprietary	1456	±6		12,192	$1.25 / $2.50	1M
56	29-87	kimi-k2.6	Moonshot · Modified MIT	1456	±8		7,494	$0.95 / $4	262.1K
57	31-83	gemini-3-flash (thinking-minimal)	Google · Proprietary	1455	±5		17,280	$0.50 / $3	1M
58	28-89	mimo-v2-pro	Xiaomi · Proprietary	1455	±9		4,844	$1 / $3	1M
59	32-92	glm-5	Z.ai · MIT	1451	±8		5,626	$1 / $3.20	202.8K
60	36-90	chatgpt-4o-latest-20250326	OpenAI · Proprietary	1451	±6		13,703	$5 / $15	128K
61	32-91	minimax-m3	MiniMax · MiniMax Community License	1451	±8		8,020	$0.60 / $2.40	N/A
62	24-106	qwen3.6-max-preview	Alibaba · Proprietary	1450	±19		1,027	$1.03 / $6.16	262.1K
63	20-115	muse-glimmer	Meta · Apache-2.0	1449	±22		693	N/A	N/A
64	40-95	deepseek-v4-pro-high-preview	DeepSeek · MIT	1448	±7		10,420	$1.32 / $3.96	1M
65	27-106	gemma-4-26b-a4b	Google · Apache 2.0	1448	±17		1,057	N/A	N/A
66	27-110	hy3	Tencent · Apache 2.0	1447	±18		1,099	$0.13 / $0.53	262.1K
67	42-99	gpt-5.1-high	OpenAI · Proprietary	1447	±7		7,649	$0.63 / $5	400K
68	50-97	claude-opus-4-1-20250805	Anthropic · Proprietary	1447	±6		14,079	$15 / $75	200K
69	48-97	claude-opus-4-1-20250805-thinking-16k	Anthropic · Proprietary	1447	±7		9,145	$15 / $75	200K
70	20-126	glm-5.3-max	Z.ai · MIT	1446	±26		524	$1.40 / $4.40	1M
71	46-99	qwen3.6-plus	Alibaba · Proprietary	1446	±7		9,547	$0.33 / $1.95	1M
72	29-110	gemma-4-31b	Google · Apache 2.0	1446	±17		1,146	$0.14 / $0.40	262.1K
73	42-100	qwen3-max-preview	Alibaba · Proprietary	1446	±9		5,193	$0.78 / $3.90	262.1K
74	51-99	gpt-5.2	OpenAI · Proprietary	1444	±6		15,999	$0.88 / $7	400K
75	51-99	qwen3.5-397b-a17b	Alibaba · Apache 2.0	1444	±6		14,111	$0.39 / $2.34	262.1K
76	50-101	qwen3.7-plus	Alibaba · Proprietary	1444	±8		6,824	$0.32 / $1.28	1M
77	51-100	gpt-5.2-high	OpenAI · Proprietary	1444	±7		9,445	$0.88 / $7	400K
78	48-105	inkling	Thinky · Apache 2.0	1442	±11		3,425	$1 / $4.05	524.3K
79	54-102	mimo-v2.5	Xiaomi · MIT	1441	±7		9,129	$0.14 / $0.28	1.1M
80	54-102	gpt-5.1	OpenAI · Proprietary	1441	±7		8,199	$0.63 / $5	400K
81	45-110	glm-4.7	Z.ai · MIT	1441	±12		2,276	$0.40 / $1.75	204.8K
82	55-102	kimi-k2.5-thinking	Moonshot · Modified MIT	1441	±6		13,730	$0.60 / $3	N/A
83	54-102	ernie-5.0-0110	Baidu · Proprietary	1441	±7		6,803	N/A	N/A
84	45-115	ernie-5.0-preview-1203	Baidu · Proprietary	1440	±13		1,905	N/A	N/A
85	52-109	mimo-v2-omni	Xiaomi · Proprietary	1440	±10		3,950	$0.40 / $2	262.1K
86	48-115	glm-5v-turbo	Z.ai · Proprietary	1439	±14		1,957	$1.20 / $4	202.8K
87	55-105	gpt-5-chat	OpenAI · Proprietary	1439	±8		5,651	$1.25 / $10	N/A
88	57-105	grok-4.3	SpaceXAI · Proprietary	1439	±7		12,106	$1.25 / $2.50	1M
89	50-116	qwen3-vl-235b-a22b-instruct	Alibaba · Apache 2.0	1438	±14		2,252	$0.21 / $1.90	262.1K
90	58-108	deepseek-v4-flash	DeepSeek · MIT	1438	±7		9,915	$0.44 / $1.32	1M
91	61-105	gemini-2.5-pro	Google · Proprietary	1437	±5		22,629	$0.63 / $5	1M
92	60-113	deepseek-v4-flash-high-preview	DeepSeek · MIT	1435	±7		10,061	$0.44 / $1.32	1M
93	36-142	amazon-nova-experimental-chat-26-02-10	Amazon · Proprietary	1434	±23		609	N/A	N/A
94	71-115	qwen3-235b-a22b-instruct-2507	Alibaba · Apache 2.0	1432	±5		18,083	$0.26 / $1.06	N/A
95	63-118	longcat-flash-chat-2602-exp	Meituan · Proprietary	1431	±9		5,511	N/A	N/A
96	59-134	mistral-medium-3.5	Mistral · Modified MIT	1430	±13		2,145	$1.50 / $7.50	262.1K
97	76-127	o3-2025-04-16	OpenAI · Proprietary	1426	±7		9,624	$2 / $8	200K
98	76-127	minimax-m2.7	MiniMax · Modified MIT	1426	±7		12,190	$0.30 / $1.20	204.8K
99	61-145	gpt-4.5-preview-2025-02-27	OpenAI · Proprietary	1426	±16		1,394	$75 / $150	128K
100	63-146	kimi-k2.5-instant	Moonshot · Modified MIT	1425	±15		1,495	$0.45 / $2.25	262.1K
101	72-145	deepseek-v3.2-exp	DeepSeek · MIT	1423	±13		2,231	$0.27 / $0.41	163.8K
102	82-138	qwen3.5-122b-a10b	Alibaba · Apache 2.0	1422	±8		5,480	$0.26 / $2.08	262.1K
103	87-138	deepseek-v3.2	DeepSeek · MIT	1422	±7		8,884	$0.27 / $0.40	163.8K
104	87-138	deepseek-v3.2-thinking	DeepSeek · MIT	1421	±7		7,954	$0.27 / $0.40	163.8K
105	88-138	kimi-k2-thinking-turbo	Moonshot · Modified MIT	1421	±6		11,887	$1.15 / $8	262.1K
106	88-138	gemini-3.1-flash-lite-preview	Google · Proprietary	1421	±6		11,907	$0.25 / $1.50	1M
107	60-158	deepseek-v3.1-terminus-thinking	DeepSeek · MIT	1420	±22		704	$0.27 / $1	163.8K
108	76-150	qwen3-max-2025-09-23	Alibaba · Proprietary	1419	±14		1,794	$0.78 / $3.90	262.1K
109	82-150	longcat-flash-chat	Meituan · MIT	1418	±13		2,183	$0.20 / $0.80	131.1K
110	94-138	claude-haiku-4-5-20251001	Anthropic · Proprietary	1418	±5		23,710	$1 / $5	200K
111	93-142	grok-4-1-fast-reasoning	SpaceXAI · Proprietary	1417	±6		10,897	$0.20 / $0.50	2M
112	83-150	nvidia-nemotron-3-ultra-550b-a55b-nvfp4	Nvidia · OpenMDW-1.1	1417	±13		2,142	N/A	N/A
113	84-150	deepseek-v3.1-thinking	DeepSeek · MIT	1416	±13		1,961	$1.23 / $4.94	N/A
114	60-166	hunyuan-vision-1.5-thinking	Tencent · Proprietary	1415	±26		480	N/A	N/A
115	80-156	hunyuan-hy3-preview	Tencent · tencent-hunyuan-community	1415	±16		1,379	$0.29 / $1.17	262.1K
116	94-147	gpt-4.1-2025-04-14	OpenAI · Proprietary	1415	±7		8,354	$2 / $8	1M
117	68-164	amazon-nova-experimental-chat-26-01-10	Amazon · Proprietary	1415	±23		608	N/A	N/A
118	94-150	qwen3-235b-a22b-no-thinking	Alibaba · Apache 2.0	1414	±8		6,395	$0.46 / $1.82	131.1K
119	95-147	mistral-large-3	Mistral · Apache 2.0	1413	±6		11,742	$0.50 / $1.50	N/A
120	92-154	deepseek-v3.1	DeepSeek · MIT	1413	±12		2,547	$1.23 / $4.94	N/A
121	94-150	glm-4.6	Z.ai · MIT	1412	±8		6,911	$0.50 / $2	204.8K
122	94-150	gpt-5-high	OpenAI · Proprietary	1412	±9		5,583	$0.63 / $5	400K
123	94-151	qwen3-next-80b-a3b-instruct	Alibaba · Apache 2.0	1412	±9		4,324	$0.09 / $1.10	262.1K
124	94-151	glm-4.5	Z.ai · MIT	1412	±9		4,328	$0.60 / $2.20	131.1K
125	87-164	ernie-5.0-preview-1022	Baidu · Proprietary	1410	±19		934	N/A	N/A
126	97-153	claude-opus-4-20250514-thinking-16k	Anthropic · Proprietary	1410	±8		6,154	$15 / $75	200K
127	97-156	qwen3.5-27b	Alibaba · Apache 2.0	1409	±8		5,374	$0.20 / $1.56	262.1K
128	98-156	kimi-k2-0711-preview	Moonshot · Modified MIT	1408	±9		4,620	$0.60 / $2.50	131.1K
129	104-151	mistral-medium-2508	Mistral · Proprietary	1407	±5		17,591	$0.40 / $2	131.1K
130	94-165	hunyuan-turbos-20250416	Tencent · Proprietary	1405	±16		1,408	N/A	N/A
131	97-164	kimi-k2-0905-preview	Moonshot · Modified MIT	1405	±13		2,075	$0.60 / $2.50	262.1K
132	98-161	deepseek-r1-0528	DeepSeek · MIT	1405	±11		2,899	$0.50 / $2.15	163.8K
133	104-158	gpt-5.4-nano-high	OpenAI · Proprietary	1404	±7		11,862	$0.20 / $1.25	400K
134	97-164	deepseek-v3.2-exp-thinking	DeepSeek · MIT	1404	±14		1,809	$0.27 / $0.41	163.8K
135	106-158	qwen3.5-flash	Alibaba · Proprietary	1404	±6		11,616	N/A	N/A
136	97-164	Inkling Small	Thinky · Apache 2.0	1404	±14		2,036	$0.45 / $1.20	524.3K
137	97-167	qwen3-235b-a22b-thinking-2507	Alibaba · Apache 2.0	1403	±15		1,560	$0.23 / $2.30	262.1K
138	106-160	gemini-2.5-flash-preview-09-2025	Google · Proprietary	1403	±8		6,161	$0.30 / $2.50	1M
139	108-160	claude-opus-4-20250514	Anthropic · Proprietary	1402	±8		7,221	$15 / $75	200K
140	109-161	qwen3.5-35b-a3b	Alibaba · Apache 2.0	1402	±8		5,878	$0.25 / $1.25	262.1K
141	104-163	grok-3-preview-02-24	SpaceXAI · Proprietary	1402	±10		3,991	$3 / $15	131.1K
142	97-172	grok-4-fast-chat	SpaceXAI · Proprietary	1402	±17		1,211	$3 / $15	256K
143	106-164	grok-4-fast-reasoning	SpaceXAI · Proprietary	1401	±10		3,689	$0.20 / $0.50	2M
144	93-183	amazon-nova-experimental-chat-12-10	Amazon · Proprietary	1400	±23		601	N/A	N/A
145	111-163	minimax-m2.5	MiniMax · Modified MIT	1399	±7		8,053	$0.23 / $0.90	204.8K
146	118-161	gemini-2.5-flash	Google · Proprietary	1398	±5		22,528	$0.15 / $1.25	1M
147	111-167	qwen3-30b-a3b-instruct-2507	Alibaba · Apache 2.0	1397	±9		4,212	$0.05 / $0.19	262.1K
148	98-187	deepseek-v3.1-terminus	DeepSeek · MIT	1395	±21		740	$0.27 / $1	163.8K
149	121-168	grok-4-0709	SpaceXAI · Proprietary	1394	±7		7,318	$3 / $15	256K
150	111-183	qwen3-vl-235b-a22b-thinking	Alibaba · Apache 2.0	1392	±14		1,602	$0.40 / $4	131.1K
151	123-175	qwen3-coder-480b-a35b-instruct	Alibaba · Apache 2.0	1392	±9		4,457	$0.40 / $1.60	262.1K
152	126-173	mimo-v2-flash (non-thinking)	Xiaomi · MIT	1391	±7		8,958	$0.10 / $0.30	262.1K
153	126-175	deepseek-v3-0324	DeepSeek · MIT	1391	±7		6,965	$3 / $4.50	32.8K
154	129-173	step-3.5-flash	StepFun · Apache 2.0	1390	±6		11,269	$0.10 / $0.30	262.1K
155	122-185	mimo-v2-flash (thinking)	Xiaomi · MIT	1389	±12		2,113	$0.10 / $0.30	262.1K
156	121-187	deepseek-r1	DeepSeek · MIT	1388	±14		1,798	$0.70 / $2.50	64K
157	131-180	claude-sonnet-4-20250514	Anthropic · Proprietary	1386	±8		6,700	$3 / $15	1M
158	129-183	mistral-medium-2505	Mistral · Proprietary	1386	±9		5,169	$0.40 / $2	131.1K
159	98-211	gemma-3-12b-it	Google · Gemma	1386	±30		364	$0.05 / $0.15	131.1K
160	104-208	solar-pro4	Upstage · Proprietary	1385	±27		500	$0.03 / $0.12	524.3K
161	134-190	minimax-m2.1-preview	MiniMax · MIT	1381	±11		3,169	$0.30 / $1.20	204.8K
162	143-188	claude-sonnet-4-20250514-thinking-32k	Anthropic · Proprietary	1381	±8		5,913	$3 / $15	1M
163	142-188	trinity-large-preview	Apache 2.0	1381	±8		5,793	$0.15 / $0.45	131K
164	144-190	gpt-5-mini-high	OpenAI · Proprietary	1379	±9		4,887	$0.13 / $1	400K
165	147-190	gpt-4.1-mini-2025-04-14	OpenAI · Proprietary	1379	±8		6,100	$0.40 / $1.60	1M
166	147-188	gemini-2.5-flash-lite-preview-09-2025-no-thinking	Google · Proprietary	1379	±7		9,125	$0.10 / $0.40	1M
167	147-190	o4-mini-2025-04-16	OpenAI · Proprietary	1378	±7		7,141	$1.10 / $4.40	200K
168	147-191	amazon-nova-experimental-chat-11-10	Amazon · Proprietary	1378	±9		4,730	N/A	N/A
169	148-191	gemma-3-27b-it	Google · Gemma	1377	±8		6,603	$0.08 / $0.45	262.1K
170	152-197	glm-4.5-air	Z.ai · MIT	1372	±8		5,568	$0.13 / $0.85	131.1K
171	150-208	glm-4.7-flash	Z.ai · MIT	1371	±12		2,187	$0.06 / $0.40	202.8K
172	152-208	o1-2024-12-17	OpenAI · Proprietary	1370	±12		2,720	$15 / $60	200K
173	134-217	amazon-nova-experimental-chat-10-09	Amazon · Proprietary	1369	±24		580	N/A	N/A
174	153-203	trinity-large-thinking	Apache 2.0	1369	±9		5,857	$0.22 / $0.85	262.1K
175	152-208	qwen2.5-max	Alibaba · Proprietary	1369	±10		3,686	N/A	N/A
176	153-206	qwen3-235b-a22b	Alibaba · Apache 2.0	1369	±9		3,978	$0.46 / $1.82	131.1K
177	123-222	hunyuan-turbos-20250226	Tencent · Proprietary	1369	±32		263	N/A	N/A
178	157-206	claude-3-7-sonnet-20250219	Anthropic · Proprietary	1368	±8		5,829	$3 / $15	200K
179	136-218	glm-4.6v	Z.ai · MIT	1367	±25		541	$0.30 / $0.90	131.1K
180	146-217	hunyuan-t1-20250711	Tencent · Proprietary	1367	±21		778	N/A	N/A
181	153-212	qwen3-next-80b-a3b-thinking	Alibaba · Apache 2.0	1367	±12		2,523	$0.15 / $1.20	262.1K
182	156-215	amazon-nova-experimental-chat-10-20	Amazon · Proprietary	1364	±13		2,158	N/A	N/A
183	157-213	mistral-small-2506	Mistral · Apache 2.0	1363	±11		2,973	$0.10 / $0.30	32K
184	162-212	claude-3-7-sonnet-20250219-thinking-32k	Anthropic · Proprietary	1363	±8		5,661	$3 / $15	200K
185	152-217	intellect-3	MIT	1363	±18		1,002	$0.20 / $1.10	131.1K
186	162-212	gemini-2.5-flash-lite-preview-06-17-thinking	Google · Proprietary	1363	±8		5,510	$0.10 / $0.40	1M
187	166-217	gemini-2.0-flash-lite-preview-02-05	Google · Proprietary	1358	±12		2,418	$0.07 / $0.30	1M
188	150-226	nvidia-nemotron-3.5-lightning-30b-a3b-nvfp4	Nvidia · OpenMDW-1.1	1358	±26	Preliminary	626	N/A	N/A
189	159-218	step-3	StepFun · Apache 2.0	1357	±17		1,172	$0.57 / $1.42	65.5K
190	170-217	claude-3-5-sonnet-20241022	Anthropic · Proprietary	1354	±6		11,335	$3 / $15	200K
191	169-218	o1-preview	OpenAI · Proprietary	1353	±11		3,778	$15 / $60	N/A
192	172-217	minimax-m1	MiniMax · Apache 2.0	1352	±8		6,149	$0.55 / $2.20	1M
193	170-218	gpt-oss-120b	OpenAI · Apache 2.0	1351	±8		5,439	$0.03 / $0.17	131.1K
194	169-222	nova-2-lite	Amazon · Proprietary	1351	±12		2,305	$0.30 / $2.50	1M
195	176-217	command-a-03-2025	Cohere · CC-BY-NC-4.0	1351	±7		8,890	$2.50 / $10	256K
196	169-222	deepseek-v3	DeepSeek · DeepSeek	1350	±12		2,241	$1.14 / $4.56	N/A
197	168-225	nvidia-nemotron-3-super-120b-a12b	Nvidia · NVIDIA Open Model	1350	±15		1,399	N/A	N/A
198	169-224	o3-mini-high	OpenAI · Proprietary	1349	±14		1,815	$0.55 / $2.20	200K
199	168-225	minimax-m2	MiniMax · Apache 2.0	1349	±16		1,330	$0.26 / $1.02	204.8K
200	152-250	hunyuan-turbo-0110	Tencent · Proprietary	1348	±33		256	N/A	N/A
201	170-224	olmo-3.1-32b-instruct	Ai2 · Apache 2.0	1348	±13		2,242	$0.20 / $0.60	65.5K
202	168-226	ling-flash-2.0	Ant Group · MIT	1348	±16		1,343	N/A	N/A
203	177-222	gemini-2.0-flash-001	Google · Proprietary	1347	±8		5,320	$0.10 / $0.40	1M
204	176-224	grok-3-mini-beta	SpaceXAI · Proprietary	1346	±10		3,567	$0.30 / $0.50	131.1K
205	168-244	glm-4-plus-0111	Z.ai · Proprietary	1345	±24		592	N/A	N/A
206	169-239	glm-4.5v	Z.ai · MIT	1343	±19		927	$0.60 / $1.80	65.5K
207	156-259	llama-3.1-nemotron-ultra-253b-v1	Nvidia · Nvidia Open Model	1342	±34		254	$0.60 / $1.80	131.1K
208	168-250	qwen-plus-0125	Alibaba · Proprietary	1342	±23		571	$0.40 / $1.20	131.1K
209	181-226	grok-3-mini-high	SpaceXAI · Proprietary	1341	±11		2,814	$0.25 / $1.27	N/A
210	168-251	qwen3-32b	Alibaba · Apache 2.0	1340	±26		437	$0.08 / $0.28	131.1K
211	169-250	mercury-2	Inception AI · Proprietary	1339	±25		490	$0.25 / $0.75	128K
212	182-232	qwq-32b	Alibaba · Apache 2.0	1338	±10		3,515	$0.50 / $1	16.4K
213	181-246	gpt-5-nano-high	OpenAI · Proprietary	1336	±15		1,548	$0.03 / $0.20	400K
214	193-241	gemini-1.5-pro-002	Google · Proprietary	1331	±8		6,378	$3.50 / $10.50	2.1M
215	193-245	qwen3-30b-a3b	Alibaba · Apache 2.0	1330	±9		4,042	$0.13 / $0.52	131.1K
216	172-269	gemma-3-4b-it	Google · Gemma	1329	±30		390	$0.05 / $0.10	131.1K
217	200-247	o3-mini	OpenAI · Proprietary	1327	±7		7,761	$0.55 / $2.20	200K
218	182-264	nvidia-llama-3.3-nemotron-super-49b-v1.5	Nvidia · Nvidia Open	1327	±23		599	$0.10 / $0.40	131.1K
219	176-271	mercury	Inception AI · Proprietary	1325	±32		359	$0.25 / $0.75	128K
220	193-260	step-1o-turbo-202506	StepFun · Proprietary	1323	±16		1,398	N/A	N/A
221	193-260	ring-flash-2.0	Ant Group · MIT	1323	±16		1,339	N/A	N/A
222	197-259	gpt-oss-20b	OpenAI · Apache 2.0	1322	±14		1,865	$0.03 / $0.13	131.1K
223	205-250	gpt-4o-2024-05-13	OpenAI · Proprietary	1322	±8		13,299	$5 / $15	128K
224	189-269	gpt-4.1-nano-2025-04-14	OpenAI · Proprietary	1321	±22		651	$0.10 / $0.40	1M
225	205-251	claude-3-5-sonnet-20240620	Anthropic · Proprietary	1321	±8		9,702	$3 / $15	200K
226	180-278	llama-3.3-nemotron-49b-super-v1	Nvidia · Nvidia	1319	±35		241	N/A	N/A
227	205-260	glm-4-plus	Z.ai · Proprietary	1319	±11		3,267	$0.44 / $1.76	204.8K
228	206-256	o1-mini	OpenAI · Proprietary	1318	±9		6,092	$1.10 / $4.40	N/A
229	205-260	yi-lightning	Proprietary	1318	±11		3,420	N/A	N/A
230	206-256	llama-4-maverick-17b-128e-instruct	Meta · Llama 4	1318	±8		6,223	$0.63 / $1.80	131.1K
231	205-260	nvidia-nemotron-3-nano-30b-a3b-bf16	Nvidia · NVIDIA Open Model	1318	±11		2,960	$0.06 / $0.24	262.1K
232	206-260	gemma-3n-e4b-it	Google · Gemma	1317	±10		3,316	$0.06 / $0.12	32.8K
233	206-260	llama-4-scout-17b-16e-instruct	Meta · Llama	1316	±9		5,007	$0.40 / $0.70	8.2K
234	208-258	claude-3-5-haiku-20241022	Anthropic · Proprietary	1316	±7		9,193	$1 / $5	200K
235	202-269	qwen2.5-plus-1127	Alibaba · Proprietary	1315	±17		1,078	N/A	N/A
236	207-260	grok-2-2024-08-13	SpaceXAI · Proprietary	1315	±8		7,490	$2 / $10	131.1K
237	206-264	gemini-advanced-0514	Google · Proprietary	1314	±11		6,130	N/A	N/A
238	208-262	llama-3.1-405b-instruct-fp8	Meta · Llama 3.1 Community	1314	±9		6,667	$4 / $4	32.8K
239	208-264	llama-3.1-405b-instruct-bf16	Meta · Llama 3.1 Community	1313	±9		4,512	$4 / $4	32.8K
240	197-277	step-2-16k-exp-202412	StepFun · Proprietary	1312	±24		506	N/A	N/A
241	211-264	gemini-1.5-pro-001	Google · Proprietary	1311	±9		9,291	$3.50 / $10.50	2.1M
242	212-264	gpt-4o-mini-2024-07-18	OpenAI · Proprietary	1311	±8		7,766	$0.15 / $0.60	128K
243	209-269	athene-v2-chat	NexusFlow	1310	±11		2,733	N/A	N/A
244	206-273	olmo-3-32b-think	Ai2 · Apache 2.0	1309	±18		1,124	$0.15 / $0.50	65.5K
245	212-271	qwen-max-0919	Alibaba · Qwen	1306	±13		2,195	$1.60 / $6.40	32.8K
246	206-279	deepseek-v2.5-1210	DeepSeek · DeepSeek	1306	±21		715	N/A	N/A
247	218-269	claude-3-opus-20240229	Anthropic · Proprietary	1305	±7		21,697	$15 / $75	200K
248	218-269	llama-3.3-70b-instruct	Meta · Llama-3.3	1304	±8		6,678	$0.10 / $0.32	131.1K
249	218-271	gpt-4o-2024-08-06	OpenAI · Proprietary	1302	±9		5,095	$2.50 / $10	128K
250	220-272	grok-2-mini-2024-08-13	SpaceXAI · Proprietary	1301	±8		6,124	$2 / $10	131.1K
251	205-284	hunyuan-standard-2025-02-10	Tencent · Proprietary	1300	±28		376	N/A	N/A
252	218-275	deepseek-v2.5	DeepSeek · DeepSeek	1300	±12		2,825	N/A	N/A
253	220-274	qwen2.5-72b-instruct	Alibaba · Qwen	1299	±9		4,656	$1.20 / $1.20	N/A
254	207-284	granite-4.1-8b	IBM · Apache 2.0	1299	±24		678	$0.05 / $0.10	131.1K
255	218-278	athene-70b-0725	CC-BY-NC-4.0	1298	±13		2,092	N/A	N/A
256	223-275	gemini-1.5-flash-002	Google · Proprietary	1298	±10		4,259	$0.07 / $0.30	1M
257	231-275	mistral-small-3.1-24b-instruct-2503	Mistral · Apache 2.0	1297	±9		5,611	$0.10 / $0.30	32K
258	216-282	llama-3.1-nemotron-70b-instruct	Nvidia · Llama 3.1	1295	±19		904	$1.20 / $1.20	131.1K
259	232-279	mistral-large-2411	Mistral · MRL	1294	±11		3,021	$2 / $6	128K
260	231-281	magistral-medium-2506	Mistral · Proprietary	1293	±13		2,252	$2 / $5	40K
261	237-279	gpt-4-turbo-2024-04-09	OpenAI · Proprietary	1293	±9		10,807	$10 / $30	128K
262	212-292	llama-3.1-nemotron-51b-instruct	Nvidia · Llama 3.1	1291	±27		421	N/A	N/A
263	237-281	mistral-large-2407	Mistral · Mistral Research	1290	±9		5,167	$2 / $6	131.1K
264	210-293	hunyuan-large-2025-02-10	Tencent · Proprietary	1290	±31		357	N/A	N/A
265	243-281	llama-3.1-70b-instruct	Meta · Llama 3.1 Community	1287	±9		6,381	$0.40 / $0.40	131.1K
266	237-289	gemma-2-9b-it-simpo	MIT	1284	±17		1,121	$0.03 / $0.09	8.2K
267	243-284	gemini-1.5-flash-001	Google · Proprietary	1284	±9		7,261	$0.07 / $0.30	1M
268	247-284	gpt-4-0125-preview	OpenAI · Proprietary	1283	±9		9,697	$10 / $30	128K
269	232-293	qwen2.5-coder-32b-instruct	Alibaba · Apache 2.0	1283	±22		629	$0.87 / $0.87	32K
270	237-293	reka-core-20240904	Proprietary	1280	±20		837	N/A	N/A
271	237-294	hunyuan-large-vision	Tencent · Proprietary	1280	±21		801	N/A	N/A
272	248-289	amazon-nova-pro-v1.0	Amazon · Proprietary	1279	±11		2,591	$0.80 / $3.20	300K
273	252-285	gpt-4-1106-preview	OpenAI · Proprietary	1279	±9		9,573	$10 / $30	128K
274	253-285	gemma-2-27b-it	Google · Gemma license	1278	±8		8,733	$0.65 / $0.65	8.2K
275	246-293	olmo-3.1-32b-think	Ai2 · Apache 2.0	1277	±16		1,548	$0.15 / $0.50	65.5K
276	221-303	llama-3.1-tulu-3-70b	Ai2 · Llama 3.1	1276	±32		288	N/A	N/A
277	252-299	command-r-plus-08-2024	Cohere · CC-BY-NC-4.0	1271	±17		1,132	$2.50 / $10	128K
278	249-299	ibm-granite-h-small	IBM · Apache 2.0	1270	±19		1,067	N/A	N/A
279	258-296	amazon-nova-lite-v1.0	Amazon · Proprietary	1269	±13		2,103	$0.06 / $0.24	300K
280	261-296	c4ai-aya-expanse-32b	Cohere · CC-BY-NC-4.0	1267	±11		3,115	N/A	N/A
281	255-299	reka-flash-20240904	Proprietary	1266	±19		904	N/A	N/A
282	258-301	jamba-1.5-large	Jamba Open	1264	±18		979	$2 / $8	256K
283	268-299	claude-3-sonnet-20240229	Anthropic · Proprietary	1261	±9		11,853	$3 / $15	200K
284	268-299	gemma-2-9b-it	Google · Gemma license	1261	±9		6,175	$0.03 / $0.09	8.2K
285	262-303	mistral-small-24b-instruct-2501	Mistral · Apache 2.0	1259	±16		1,443	$0.05 / $0.08	32.8K
286	268-299	command-r-plus	Cohere · CC-BY-NC-4.0	1259	±9		8,504	$2.50 / $10	128K
287	266-302	nemotron-4-340b-instruct	Nvidia · NVIDIA Open Model	1258	±13		2,160	N/A	N/A
288	268-303	phi-4	Microsoft · MIT	1256	±12		2,438	$0.07 / $0.14	16.4K
289	270-302	gemini-1.5-flash-8b-001	Google · Proprietary	1255	±10		4,291	$0.07 / $0.30	1M
290	270-308	deepseek-coder-v2	DeepSeek · DeepSeek License	1250	±14		1,796	$0.14 / $0.28	128K
291	276-305	llama-3-70b-instruct	Meta · Llama 3 Community	1249	±8		16,626	$0.51 / $0.74	8.2K
292	278-307	claude-3-haiku-20240307	Anthropic · Proprietary	1248	±8		13,237	$0.25 / $1.25	200K
293	271-311	glm-4-0520	Z.ai · Proprietary	1245	±17		1,186	N/A	N/A
294	278-308	gpt-4-0314	OpenAI · Proprietary	1245	±11		5,128	$30 / $60	8.2K
295	262-317	llama-3.1-tulu-3-8b	Ai2 · Llama 3.1	1244	±32		285	N/A	N/A
296	270-322	olmo-2-0325-32b-instruct	Ai2 · Apache-2.0	1235	±32		336	$0.05 / $0.20	128K
297	275-317	ministral-8b-2410	Mistral · MRL	1235	±24		572	$0.10 / $0.10	131.1K
298	284-313	amazon-nova-micro-v1.0	Amazon · Proprietary	1233	±13		2,061	$0.04 / $0.14	128K
299	291-312	gpt-4-0613	OpenAI · Proprietary	1231	±9		8,676	$30 / $60	8.2K
300	284-317	command-r-08-2024	Cohere · CC-BY-NC-4.0	1229	±18		1,152	$0.15 / $0.60	128K
301	285-318	c4ai-aya-expanse-8b	Cohere · CC-BY-NC-4.0	1228	±18		1,096	N/A	N/A
302	292-316	qwen2-72b-instruct	Alibaba · Qianwen LICENSE	1227	±11		4,345	$0.90 / $0.90	32.8K
303	287-318	gemini-pro-dev-api	Google · Proprietary	1227	±17		1,672	$0.35 / $1.05	32.8K
304	276-324	granite-3.1-8b-instruct	IBM · Apache 2.0	1225	±33		316	N/A	N/A
305	291-318	reka-flash-21b-20240226-online	Proprietary	1224	±16		1,678	N/A	N/A
306	278-324	hunyuan-standard-256k	Tencent · Proprietary	1224	±31		328	N/A	N/A
307	290-322	jamba-1.5-mini	Jamba Open	1223	±18		1,005	$0.20 / $0.40	256K
308	294-317	command-r	Cohere · CC-BY-NC-4.0	1223	±11		5,984	$0.15 / $0.60	128K
309	294-318	mistral-large-2402	Mistral · Proprietary	1220	±10		6,461	$4 / $12	32K
310	294-322	qwen1.5-110b-chat	Alibaba · Qianwen LICENSE	1219	±12		3,117	N/A	N/A
311	290-336	granite-3.1-2b-instruct	IBM · Apache 2.0	1213	±29		382	N/A	N/A
312	295-322	reka-flash-21b-20240226	Proprietary	1213	±13		2,702	N/A	N/A
313	296-322	mixtral-8x22b-instruct-v0.1	Mistral · Apache 2.0	1211	±10		5,554	$0.90 / $0.90	65.5K
314	297-322	llama-3.1-8b-instruct	Meta · Llama 3.1 Community	1209	±9		5,722	$0.05 / $0.08	131.1K
315	297-324	mistral-medium	Mistral · Proprietary	1206	±13		3,224	$2.70 / $8.10	32K
316	297-324	qwen1.5-72b-chat	Alibaba · Qianwen LICENSE	1205	±12		3,842	N/A	N/A
317	298-322	llama-3-8b-instruct	Meta · Llama 3 Community	1205	±9		10,764	$0.14 / $0.14	8.2K
318	306-328	gpt-3.5-turbo-0125	OpenAI · Proprietary	1199	±10		6,898	$0.50 / $1.50	16.4K
319	306-337	yi-1.5-34b-chat	Apache-2.0	1195	±12		2,763	N/A	N/A
320	302-350	zephyr-orpo-141b-A35b-v0.1	Apache 2.0	1183	±28		441	N/A	N/A
321	313-344	qwen1.5-32b-chat	Alibaba · Qianwen LICENSE	1182	±14		2,307	N/A	N/A
322	317-342	gemma-2-2b-it	Google · Gemma license	1181	±9		5,197	N/A	N/A
323	317-344	phi-3-medium-4k-instruct	Microsoft · MIT	1179	±12		2,847	$0.17 / $0.68	N/A
324	318-344	mixtral-8x7b-instruct-v0.1	Mistral · Apache 2.0	1177	±10		7,070	$0.63 / $0.63	32K
325	306-353	gemini-pro	Google · Proprietary	1177	±30		431	$0.35 / $1.05	32.8K
326	318-346	dbrx-instruct-preview	DBRX LICENSE	1174	±13		3,376	$0.60 / $0.60	32.8K
327	306-357	llama2-70b-steerlm-chat	Nvidia · Llama 2 Community	1172	±35		282	N/A	N/A
328	317-350	openchat-3.5-0106	Apache-2.0	1171	±18		1,174	N/A	N/A
329	313-353	wizardlm-70b	Microsoft · Llama 2 Community	1171	±24		682	N/A	N/A
330	318-350	gemma-1.1-7b-it	Google · Gemma license	1171	±13		2,712	$0.03 / $0.09	8.2K
331	318-350	qwen1.5-14b-chat	Alibaba · Qianwen LICENSE	1170	±16		1,866	$0.30 / $0.30	N/A
332	318-351	yi-34b-chat	Yi License	1169	±17		1,433	$0.90 / $0.90	4.1K
333	318-351	starling-lm-7b-beta	Apache-2.0	1169	±16		1,650	N/A	N/A
334	319-353	internlm2_5-20b-chat	Other	1166	±17		1,289	$0 / $0	32.8K
335	317-356	tulu-2-dpo-70b	AI2 ImpACT Low-risk	1165	±25		540	N/A	N/A
336	320-353	llama-2-70b-chat	Meta · Llama 2 Community	1160	±12		3,543	$0.70 / $2.80	4.1K
337	318-358	deepseek-llm-67b-chat	DeepSeek · DeepSeek License	1160	±28		441	N/A	N/A
338	320-356	phi-3-small-8k-instruct	Microsoft · MIT	1159	±14		2,178	$0.15 / $0.60	N/A
339	320-357	starling-lm-7b-alpha	CC-BY-NC-4.0	1158	±21		841	N/A	N/A
340	318-366	nous-hermes-2-mixtral-8x7b-dpo	Apache-2.0	1151	±35		282	$0.90 / $0.90	N/A
341	321-358	gpt-3.5-turbo-1106	OpenAI · Proprietary	1151	±19		1,382	$1 / $2	16.4K
342	324-358	vicuna-33b	Non-commercial	1150	±15		1,909	$0 / $0	2K
343	320-360	granite-3.0-8b-instruct	IBM · Apache 2.0	1150	±23		813	N/A	N/A
344	320-363	qwen1.5-7b-chat	Alibaba · Qianwen LICENSE	1148	±28		447	$0.20 / $0.20	N/A
345	324-360	llama-3.2-3b-instruct	Meta · Llama 3.2	1146	±20		1,012	$0.05 / $0.33	131.1K
346	321-362	openchat-3.5	Apache-2.0	1146	±24		615	$0.20 / $0.20	N/A
347	329-360	snowflake-arctic-instruct	Apache 2.0	1139	±13		3,261	N/A	N/A
348	325-366	granite-3.0-2b-instruct	IBM · Apache 2.0	1136	±22		873	N/A	N/A
349	331-365	llama-2-13b-chat	Meta · Llama 2 Community	1134	±16		1,709	$0.25 / $0.25	4.1K
350	325-373	openhermes-2.5-mistral-7b	Apache-2.0	1131	±30		381	$0.17 / $0.17	N/A
351	335-368	mistral-7b-instruct-v0.2	Mistral · Apache-2.0	1129	±16		1,743	$0.20 / $0.20	32.8K
352	331-373	codellama-34b-instruct	Meta · Llama 2 Community	1128	±25		639	$0.35 / $1.40	16.4K
353	325-375	solar-10.7b-instruct-v1.0	CC-BY-NC-4.0	1125	±34		311	$0.30 / $0.30	N/A
354	335-373	gemma-7b-it	Google · Gemma license	1123	±22		818	$0.05 / $0.08	8.2K
355	325-375	mpt-30b-chat	CC-BY-NC-SA-4.0	1121	±38		207	N/A	N/A
356	335-375	qwen-14b-chat	Alibaba · Qianwen LICENSE	1118	±28		426	N/A	N/A
357	339-373	vicuna-13b	Llama 2 Community	1118	±17		1,638	$0.30 / $0.30	N/A
358	345-373	phi-3-mini-4k-instruct	Microsoft · MIT	1111	±14		2,483	$0.13 / $0.52	N/A
359	337-377	qwq-32b-preview	Alibaba · Apache 2.0	1107	±32		374	$0.50 / $1	16.4K
360	342-375	wizardlm-13b	Microsoft · Llama 2 Community	1107	±24		634	$0.30 / $0.30	N/A
361	345-375	llama-2-7b-chat	Meta · Llama 2 Community	1104	±18		1,255	$0.15 / $0.15	4.1K
362	346-375	phi-3-mini-4k-instruct-june-2024	Microsoft · MIT	1104	±17		1,424	$0.13 / $0.52	4.1K
363	342-377	gemma-2b-it	Google · Gemma license	1102	±28		447	$0.10 / $0.10	N/A
364	347-375	gemma-1.1-2b-it	Google · Gemma license	1100	±19		1,137	N/A	N/A
365	350-375	phi-3-mini-128k-instruct	Microsoft · MIT	1098	±16		2,085	$0.13 / $0.52	N/A
366	350-377	zephyr-7b-beta	MIT	1093	±20		997	$0.15 / $0.15	16.4K
367	348-377	palm-2	Google · Proprietary	1092	±24		755	$0.50 / $0.50	25.8K
368	351-377	olmo-7b-instruct	Ai2 · Apache-2.0	1086	±26		548	$0.20 / $0.20	N/A
369	351-377	qwen1.5-4b-chat	Alibaba · Qianwen LICENSE	1084	±24		738	$0.10 / $0.10	N/A
370	351-377	vicuna-7b	Llama 2 Community	1084	±27		555	$0.20 / $0.20	N/A
371	351-377	stripedhyena-nous-7b	Apache 2.0	1081	±30		455	$0.20 / $0.20	N/A
372	347-380	guanaco-33b	Non-commercial	1080	±38		261	N/A	N/A
373	356-377	llama-3.2-1b-instruct	Meta · Llama 3.2	1070	±21		1,044	$0.03 / $0.20	60K
374	356-378	mistral-7b-instruct	Mistral · Apache 2.0	1070	±24		747	$0.07 / $0.28	4.1K
375	351-381	smollm2-1.7b-instruct	Apache 2.0	1065	±43		252	N/A	N/A
376	364-381	koala-13b	Non-commercial	1048	±29		503	N/A	N/A
377	364-382	chatglm3-6b	Apache-2.0	1044	±31		378	N/A	N/A
378	374-384	RWKV-4-Raven-14B	Apache 2.0	1009	±34		360	N/A	N/A
379	374-384	mpt-7b-chat	CC-BY-NC-SA-4.0	1006	±37		306	N/A	N/A
380	373-384	chatglm2-6b	Apache-2.0	1005	±41		234	N/A	N/A
381	375-384	fastchat-t5-3b	Apache 2.0	1000	±38		287	N/A	N/A
382	377-384	alpaca-13b	Non-commercial	980	±34		391	N/A	N/A
383	378-386	oasst-pythia-12b	Apache 2.0	961	±31		454	N/A	N/A
384	378-386	chatglm-6b	Non-commercial	951	±38		300	N/A	N/A
385	383-386	stablelm-tuned-alpha-7b	CC-BY-NC-SA-4.0	906	±40		238	N/A	N/A
386	383-386	dolly-v2-12b	MIT	898	±43		233	N/A	N/A
```

## Category: Occupational: Mathematical (adjustment: None)

Source: https://arena.ai, Text Arena leaderboard, Categories panel, "Occupational: Mathematical" selected, Adjustments = None.
Date shown on page: Aug 19, 2026. Votes: 581,980. Models: 371. Captured row count: 371 (verified match).

```
1	1-14	claude-opus-5-high	Anthropic · Proprietary	1538	±17		1,318	$5 / $25	1M
2	1-15	claude-opus-4-6-high	Anthropic · Proprietary	1527	±11		3,632	$5 / $25	1M
3	1-36	claude-opus-5-max	Anthropic · Proprietary	1520	±24		666	$5 / $25	1M
4	1-31	claude-fable-5	Anthropic · Proprietary	1516	±17		1,282	$10 / $50	1M
5	1-23	claude-opus-4-6	Anthropic · Proprietary	1515	±10		4,158	$5 / $25	1M
6	1-40	kimi-k3-max	Moonshot · Kimi K3 license	1514	±23		681	N/A	N/A
7	1-25	claude-opus-4-7-high	Anthropic · Proprietary	1514	±11		3,316	$5 / $25	1M
8	1-48	gemini-3.7-flash-high	Google · Proprietary	1512	±31	Preliminary	363	$0.75 / $3.57	1M
9	1-40	gpt-5.6-sol-xhigh	OpenAI · Proprietary	1509	±19		1,022	$5 / $30	N/A
10	1-44	muse-spark-1.1	Meta · Proprietary	1507	±19		997	$1.25 / $4.25	N/A
11	1-55	hy3	Tencent · Apache 2.0	1506	±33		297	$0.13 / $0.53	262.1K
12	2-40	claude-opus-4-8-high	Anthropic · Proprietary	1504	±13		2,246	$5 / $25	1M
13	3-40	gpt-5.5-high	OpenAI · Proprietary	1502	±11		3,247	$2.50 / $15	1.1M
14	1-48	gemini-3.6-flash-high	Google · Proprietary	1502	±20		922	$0.38 / $1.88	1M
15	1-50	qwen3.8-max	Alibaba · Proprietary	1501	±25		513	$2 / $6	1M
16	3-40	claude-opus-4-7	Anthropic · Proprietary	1500	±11		3,478	$5 / $25	1M
17	3-44	gpt-5.4-high	OpenAI · Proprietary	1499	±11		3,242	$2.50 / $15	1.1M
18	3-46	gpt-5.5	OpenAI · Proprietary	1497	±11		3,290	$2.50 / $15	1.1M
19	4-49	mimo-v2.5-pro	Xiaomi · MIT	1492	±12		2,790	$0.43 / $0.87	1.1M
20	3-52	qwen3.5-max-preview	Alibaba · Proprietary	1491	±17		1,220	$1.20 / $6	N/A
21	1-79	qwen3.6-max-preview	Alibaba · Proprietary	1491	±31		342	$1.03 / $6.16	262.1K
22	5-53	ernie-5.1	Baidu · Proprietary	1488	±14		1,909	N/A	N/A
23	3-66	grok-4.5	SpaceXAI · Proprietary	1487	±19		1,026	$2 / $6	500K
24	5-58	gemini-3.5-flash-high	Google · Proprietary	1487	±15		1,626	$0.75 / $4.50	1M
25	7-50	gemini-3.1-pro-preview	Google · Proprietary	1486	±9		5,267	$1 / $6	1M
26	5-60	glm-5.2-max	Z.ai · MIT	1485	±15		1,622	$1.40 / $4.40	1M
27	7-53	claude-sonnet-4-6	Anthropic · Proprietary	1484	±11		3,661	$1.50 / $7.50	1M
28	6-60	kimi-k2.6	Moonshot · Modified MIT	1484	±13		2,043	$0.95 / $4	262.1K
29	6-58	claude-opus-4-8	Anthropic · Proprietary	1483	±13		2,322	$5 / $25	1M
30	5-68	gemini-3.5-flash-medium	Google · Proprietary	1483	±16		1,425	$0.75 / $4.50	1M
31	5-74	gpt-5.6-terra-xhigh	OpenAI · Proprietary	1483	±19		990	$2.50 / $15	N/A
32	6-71	claude-sonnet-5-high	Anthropic · Proprietary	1482	±16		1,372	$1 / $5	1M
33	6-68	qwen3.7-plus	Alibaba · Proprietary	1482	±15		1,725	$0.32 / $1.28	1M
34	7-68	gemini-3-pro	Google · Proprietary	1481	±13		1,998	$2 / $12	1M
35	7-71	glm-5.1	Z.ai · MIT	1479	±13		2,220	$1.40 / $4.40	202.8K
36	12-68	claude-opus-4-5-20251101	Anthropic · Proprietary	1478	±10		3,467	$5 / $25	200K
37	6-82	gpt-5.6-luna-xhigh	OpenAI · Proprietary	1477	±19		980	$1 / $6	N/A
38	14-72	kimi-k2.5-thinking	Moonshot · Modified MIT	1476	±10		3,723	$0.60 / $3	N/A
39	3-108	gemma-4-26b-a4b	Google · Apache 2.0	1475	±32		297	N/A	N/A
40	4-109	gemma-4-31b	Google · Apache 2.0	1473	±30		323	$0.14 / $0.40	262.1K
41	12-83	gemini-3-flash	Google · Proprietary	1472	±15		1,436	$0.50 / $3	1M
42	15-77	gpt-5.4	OpenAI · Proprietary	1472	±11		3,422	$2.50 / $15	1.1M
43	12-95	inkling	Thinky · Apache 2.0	1470	±20		923	$1 / $4.05	524.3K
44	18-79	claude-sonnet-4-5-20250929-high-32k	Anthropic · Proprietary	1469	±10		3,977	$3 / $15	200K
45	3-128	qwen3.7-max-preview	Alibaba · Proprietary	1469	±40		229	$1.48 / $4.42	1M
46	14-89	mimo-v2-pro	Xiaomi · Proprietary	1469	±16		1,459	$1 / $3	1M
47	17-83	deepseek-v4-pro-high-preview	DeepSeek · MIT	1469	±12		2,686	$1.32 / $3.96	1M
48	12-98	muse-spark	Meta · Proprietary	1468	±21		819	N/A	N/A
49	15-89	claude-opus-4-5-20251101-high-32k	Anthropic · Proprietary	1468	±15		1,585	$5 / $25	200K
50	20-94	gpt-5.2-high	OpenAI · Proprietary	1463	±13		2,431	$0.88 / $7	400K
51	5-140	grok-4.6-high	SpaceXAI · Proprietary	1461	±39	Preliminary	217	$2 / $6	500K
52	20-99	gpt-5.1-high	OpenAI · Proprietary	1461	±14		1,761	$0.63 / $5	400K
53	24-96	deepseek-v4-pro	DeepSeek · MIT	1460	±12		3,010	$1.32 / $3.96	1M
54	28-96	qwen3.5-397b-a17b	Alibaba · Apache 2.0	1459	±10		3,863	$0.39 / $2.34	262.1K
55	28-98	grok-4.20-beta-0309-reasoning	SpaceXAI · Proprietary	1459	±11		3,343	$1.25 / $2.50	1M
56	23-109	glm-5	Z.ai · MIT	1458	±15		1,488	$1 / $3.20	202.8K
57	28-99	grok-4.20-multi-agent-beta-0309	SpaceXAI · Proprietary	1457	±11		3,251	$1.25 / $2.50	1M
58	29-106	qwen3.6-plus	Alibaba · Proprietary	1456	±12		2,625	$0.33 / $1.95	1M
59	28-110	gpt-5.2-chat-latest-20260210	OpenAI · Proprietary	1455	±14		1,860	$1.75 / $14	128K
60	26-116	gpt-5.5-instant	OpenAI · Proprietary	1454	±16		1,535	$2.50 / $15	1.1M
61	33-110	mimo-v2.5	Xiaomi · MIT	1454	±13		2,441	$0.14 / $0.28	1.1M
62	28-116	grok-4.20-beta1	SpaceXAI · Proprietary	1454	±16		1,429	N/A	N/A
63	37-110	gpt-5.4-mini-high	OpenAI · Proprietary	1452	±11		3,131	$0.75 / $4.50	400K
64	36-116	minimax-m3	MiniMax · MiniMax Community License	1452	±14		2,119	$0.60 / $2.40	N/A
65	38-110	claude-sonnet-4-5-20250929	Anthropic · Proprietary	1451	±10		4,061	$3 / $15	200K
66	26-124	mimo-v2-omni	Xiaomi · Proprietary	1451	±19		972	$0.40 / $2	262.1K
67	37-114	claude-opus-4-1-20250805-thinking-16k	Anthropic · Proprietary	1451	±12		2,444	$15 / $75	200K
68	28-130	gemini-3.5-flash-lite	Google · Proprietary	1449	±20		879	$0.15 / $1.25	1M
69	24-132	nvidia-nemotron-3-ultra-550b-a55b-nvfp4	Nvidia · OpenMDW-1.1	1449	±23		654	N/A	N/A
70	40-116	o3-2025-04-16	OpenAI · Proprietary	1448	±10		3,477	$2 / $8	200K
71	43-110	gemini-2.5-pro	Google · Proprietary	1448	±8		6,712	$0.63 / $5	1M
72	40-117	dola-seed-2.0-pro	Bytedance · Proprietary	1447	±10		4,028	N/A	N/A
73	38-124	deepseek-v3.2-thinking	DeepSeek · MIT	1446	±14		1,833	$0.27 / $0.40	163.8K
74	43-118	gemini-3-flash (thinking-minimal)	Google · Proprietary	1446	±10		4,447	$0.50 / $3	1M
75	23-145	hunyuan-hy3-preview	Tencent · tencent-hunyuan-community	1445	±28		425	$0.29 / $1.17	262.1K
76	43-120	kimi-k2-thinking-turbo	Moonshot · Modified MIT	1445	±11		3,024	$1.15 / $8	262.1K
77	41-130	gpt-5-high	OpenAI · Proprietary	1443	±14		1,770	$0.63 / $5	400K
78	33-144	deepseek-v3.1-thinking	DeepSeek · MIT	1443	±24		572	$1.23 / $4.94	N/A
79	43-128	deepseek-v4-flash-high-preview	DeepSeek · MIT	1442	±12		2,592	$0.44 / $1.32	1M
80	21-154	grok-4-fast-chat	SpaceXAI · Proprietary	1442	±32		322	$3 / $15	256K
81	45-125	claude-opus-4-1-20250805	Anthropic · Proprietary	1441	±9		3,854	$15 / $75	200K
82	33-146	Inkling Small	Thinky · Apache 2.0	1441	±25		513	$0.45 / $1.20	524.3K
83	35-146	glm-5v-turbo	Z.ai · Proprietary	1440	±25		523	$1.20 / $4	202.8K
84	24-156	kimi-k2.5-instant	Moonshot · Modified MIT	1440	±31		332	$0.45 / $2.25	262.1K
85	36-146	mistral-medium-3.5	Mistral · Modified MIT	1440	±24		589	$1.50 / $7.50	262.1K
86	43-135	longcat-flash-chat-2602-exp	Meituan · Proprietary	1440	±15		1,611	N/A	N/A
87	45-132	grok-4.1-thinking	SpaceXAI · Proprietary	1439	±11		3,086	N/A	N/A
88	29-155	deepseek-v3.2-exp-thinking	DeepSeek · MIT	1439	±29		396	$0.27 / $0.41	163.8K
89	43-138	qwen3-max-preview	Alibaba · Proprietary	1439	±16		1,333	$0.78 / $3.90	262.1K
90	45-135	glm-4.6	Z.ai · MIT	1438	±14		1,730	$0.50 / $2	204.8K
91	47-137	gpt-5.1	OpenAI · Proprietary	1436	±13		2,090	$0.63 / $5	400K
92	51-135	minimax-m2.7	MiniMax · Modified MIT	1436	±11		3,135	$0.30 / $1.20	204.8K
93	46-142	ernie-5.0-0110	Baidu · Proprietary	1436	±14		1,727	N/A	N/A
94	49-138	deepseek-v3.2	DeepSeek · MIT	1436	±13		2,310	$0.27 / $0.40	163.8K
95	53-134	gpt-5.2	OpenAI · Proprietary	1436	±10		4,133	$0.88 / $7	400K
96	45-144	qwen3.5-27b	Alibaba · Apache 2.0	1435	±15		1,538	$0.20 / $1.56	262.1K
97	53-140	grok-4.3	SpaceXAI · Proprietary	1434	±11		3,148	$1.25 / $2.50	1M
98	37-160	qwen3-vl-235b-a22b-thinking	Alibaba · Apache 2.0	1433	±29		384	$0.40 / $4	131.1K
99	53-144	grok-4-0709	SpaceXAI · Proprietary	1432	±13		2,175	$3 / $15	256K
100	54-144	deepseek-v4-flash	DeepSeek · MIT	1432	±12		2,743	$0.44 / $1.32	1M
101	62-139	claude-haiku-4-5-20251001	Anthropic · Proprietary	1431	±8		6,132	$1 / $5	200K
102	57-144	gemini-3.1-flash-lite-preview	Google · Proprietary	1431	±11		3,313	$0.25 / $1.50	1M
103	63-142	qwen3-235b-a22b-instruct-2507	Alibaba · Apache 2.0	1430	±9		5,026	$0.26 / $1.06	N/A
104	62-145	gpt-5.4-nano-high	OpenAI · Proprietary	1429	±11		3,184	$0.20 / $1.25	400K
105	55-152	qwen3.5-122b-a10b	Alibaba · Apache 2.0	1428	±15		1,583	$0.26 / $2.08	262.1K
106	63-151	claude-opus-4-20250514-thinking-16k	Anthropic · Proprietary	1426	±13		2,065	$15 / $75	200K
107	62-154	gpt-5.3-chat-latest	OpenAI · Proprietary	1425	±14		1,864	$1.75 / $14	128K
108	40-171	qwen3-32b	Alibaba · Apache 2.0	1425	±32		282	$0.08 / $0.28	131.1K
109	49-167	qwen3-235b-a22b-thinking-2507	Alibaba · Apache 2.0	1424	±25		495	$0.23 / $2.30	262.1K
110	53-166	kimi-k2-0905-preview	Moonshot · Modified MIT	1424	±23		646	$0.60 / $2.50	262.1K
111	69-154	grok-4-1-fast-reasoning	SpaceXAI · Proprietary	1423	±12		2,820	$0.20 / $0.50	2M
112	70-152	grok-4.1	SpaceXAI · Proprietary	1423	±11		3,437	N/A	N/A
113	53-167	glm-4.7	Z.ai · MIT	1422	±23		560	$0.40 / $1.75	204.8K
114	53-168	longcat-flash-chat	Meituan · MIT	1421	±24		547	$0.20 / $0.80	131.1K
115	73-158	step-3.5-flash	StepFun · Apache 2.0	1420	±11		2,916	$0.10 / $0.30	262.1K
116	70-160	gemini-2.5-flash-preview-09-2025	Google · Proprietary	1418	±14		1,679	$0.30 / $2.50	1M
117	45-175	ernie-5.0-preview-1022	Baidu · Proprietary	1418	±34		267	N/A	N/A
118	69-165	glm-4.5	Z.ai · MIT	1418	±17		1,271	$0.60 / $2.20	131.1K
119	77-159	mistral-large-3	Mistral · Apache 2.0	1417	±11		2,976	$0.50 / $1.50	N/A
120	54-173	ernie-5.0-preview-1203	Baidu · Proprietary	1417	±26		497	N/A	N/A
121	83-156	gemini-2.5-flash	Google · Proprietary	1416	±7		6,894	$0.15 / $1.25	1M
122	67-171	minimax-m2.1-preview	MiniMax · MIT	1416	±22		669	$0.30 / $1.20	204.8K
123	75-167	deepseek-r1	DeepSeek · MIT	1415	±15		1,504	$0.70 / $2.50	64K
124	79-164	o1-2024-12-17	OpenAI · Proprietary	1414	±11		2,644	$15 / $60	200K
125	68-172	deepseek-v3.2-exp	DeepSeek · MIT	1414	±22		646	$0.27 / $0.41	163.8K
126	70-169	deepseek-r1-0528	DeepSeek · MIT	1414	±19		948	$0.50 / $2.15	163.8K
127	77-168	gpt-4.5-preview-2025-02-27	OpenAI · Proprietary	1413	±16		1,283	$75 / $150	128K
128	72-171	deepseek-v3.1	DeepSeek · MIT	1413	±20		844	$1.23 / $4.94	N/A
129	73-170	qwen3-next-80b-a3b-instruct	Alibaba · Apache 2.0	1412	±18		1,063	$0.09 / $1.10	262.1K
130	84-166	qwen3.5-flash	Alibaba · Proprietary	1412	±11		3,066	N/A	N/A
131	79-167	o3-mini-high	OpenAI · Proprietary	1412	±14		1,711	$0.55 / $2.20	200K
132	75-172	grok-4-fast-reasoning	SpaceXAI · Proprietary	1411	±19		956	$0.20 / $0.50	2M
133	83-168	claude-sonnet-4-20250514-thinking-32k	Anthropic · Proprietary	1411	±13		1,929	$3 / $15	1M
134	89-167	claude-opus-4-20250514	Anthropic · Proprietary	1410	±11		2,650	$15 / $75	200K
135	96-164	chatgpt-4o-latest-20250326	OpenAI · Proprietary	1410	±9		4,830	$5 / $15	128K
136	91-167	o4-mini-2025-04-16	OpenAI · Proprietary	1409	±11		2,797	$1.10 / $4.40	200K
137	70-178	qwen3-max-2025-09-23	Alibaba · Proprietary	1407	±26		481	$0.78 / $3.90	262.1K
138	89-172	qwen3.5-35b-a3b	Alibaba · Apache 2.0	1407	±15		1,594	$0.25 / $1.25	262.1K
139	53-196	muse-glimmer	Meta · Apache-2.0	1407	±39		233	N/A	N/A
140	86-173	gpt-5-mini-high	OpenAI · Proprietary	1406	±16		1,299	$0.13 / $1	400K
141	73-176	qwen3-vl-235b-a22b-instruct	Alibaba · Apache 2.0	1406	±24		600	$0.21 / $1.90	262.1K
142	91-173	gpt-5-chat	OpenAI · Proprietary	1405	±15		1,581	$1.25 / $10	N/A
143	102-169	mistral-medium-2508	Mistral · Proprietary	1404	±9		4,863	$0.40 / $2	131.1K
144	101-173	qwen3-235b-a22b-no-thinking	Alibaba · Apache 2.0	1403	±12		2,312	$0.46 / $1.82	131.1K
145	101-173	minimax-m2.5	MiniMax · Modified MIT	1401	±13		2,256	$0.23 / $0.90	204.8K
146	101-173	qwen3-235b-a22b	Alibaba · Apache 2.0	1400	±15		1,510	$0.46 / $1.82	131.1K
147	62-200	nvidia-llama-3.3-nemotron-super-49b-v1.5	Nvidia · Nvidia Open	1400	±40		184	$0.10 / $0.40	131.1K
148	104-173	mimo-v2-flash (non-thinking)	Xiaomi · MIT	1399	±13		2,323	$0.10 / $0.30	262.1K
149	101-176	qwen3-30b-a3b-instruct-2507	Alibaba · Apache 2.0	1398	±16		1,228	$0.05 / $0.19	262.1K
150	80-196	nvidia-nemotron-3-super-120b-a12b	Nvidia · NVIDIA Open Model	1398	±27		417	N/A	N/A
151	110-173	o1-preview	OpenAI · Proprietary	1398	±10		3,876	$15 / $60	N/A
152	114-182	claude-3-7-sonnet-20250219-thinking-32k	Anthropic · Proprietary	1392	±11		2,565	$3 / $15	200K
153	108-192	amazon-nova-experimental-chat-11-10	Amazon · Proprietary	1392	±18		1,073	N/A	N/A
154	119-176	o3-mini	OpenAI · Proprietary	1391	±9		4,391	$0.55 / $2.20	200K
155	111-189	glm-4.5-air	Z.ai · MIT	1391	±15		1,473	$0.13 / $0.85	131.1K
156	114-186	claude-sonnet-4-20250514	Anthropic · Proprietary	1391	±12		2,331	$3 / $15	1M
157	116-188	grok-3-preview-02-24	SpaceXAI · Proprietary	1389	±12		2,454	$3 / $15	131.1K
158	101-200	mimo-v2-flash (thinking)	Xiaomi · MIT	1387	±27		430	$0.10 / $0.30	262.1K
159	110-199	qwen3-next-80b-a3b-thinking	Alibaba · Apache 2.0	1386	±22		688	$0.15 / $1.20	262.1K
160	104-200	glm-4.7-flash	Z.ai · MIT	1386	±26		480	$0.06 / $0.40	202.8K
161	117-195	kimi-k2-0711-preview	Moonshot · Modified MIT	1386	±15		1,582	$0.60 / $2.50	131.1K
162	87-207	hunyuan-t1-20250711	Tencent · Proprietary	1385	±38		224	N/A	N/A
163	125-196	gpt-oss-120b	OpenAI · Apache 2.0	1383	±15		1,562	$0.03 / $0.17	131.1K
164	98-208	intellect-3	MIT	1381	±35		247	$0.20 / $1.10	131.1K
165	128-199	trinity-large-preview	Apache 2.0	1381	±15		1,628	$0.15 / $0.45	131K
166	114-200	amazon-nova-experimental-chat-10-20	Amazon · Proprietary	1380	±23		620	N/A	N/A
167	130-199	qwen3-coder-480b-a35b-instruct	Alibaba · Apache 2.0	1379	±15		1,471	$0.40 / $1.60	262.1K
168	131-199	trinity-large-thinking	Apache 2.0	1379	±16		1,642	$0.22 / $0.85	262.1K
169	137-199	minimax-m1	MiniMax · Apache 2.0	1378	±14		1,777	$0.55 / $2.20	1M
170	107-210	step-3	StepFun · Apache 2.0	1377	±33		305	$0.57 / $1.42	65.5K
171	145-196	o1-mini	OpenAI · Proprietary	1376	±8		6,318	$1.10 / $4.40	N/A
172	134-200	grok-3-mini-high	SpaceXAI · Proprietary	1375	±18		996	$0.25 / $1.27	N/A
173	145-199	gpt-4.1-2025-04-14	OpenAI · Proprietary	1373	±11		3,085	$2 / $8	1M
174	114-213	minimax-m2	MiniMax · Apache 2.0	1369	±34		290	$0.26 / $1.02	204.8K
175	149-200	gemini-2.5-flash-lite-preview-06-17-thinking	Google · Proprietary	1369	±13		2,011	$0.10 / $0.40	1M
176	150-200	gemini-2.5-flash-lite-preview-09-2025-no-thinking	Google · Proprietary	1368	±13		2,142	$0.10 / $0.40	1M
177	112-218	llama-3.3-nemotron-49b-super-v1	Nvidia · Nvidia	1368	±37		207	N/A	N/A
178	152-200	deepseek-v3-0324	DeepSeek · MIT	1367	±11		2,947	$3 / $4.50	32.8K
179	152-200	qwen2.5-max	Alibaba · Proprietary	1367	±10		2,950	N/A	N/A
180	151-203	qwen3-30b-a3b	Alibaba · Apache 2.0	1366	±14		1,588	$0.13 / $0.52	131.1K
181	151-203	qwq-32b	Alibaba · Apache 2.0	1366	±14		1,580	$0.50 / $1	16.4K
182	154-201	claude-3-7-sonnet-20250219	Anthropic · Proprietary	1364	±10		3,192	$3 / $15	200K
183	154-201	gpt-4.1-mini-2025-04-14	OpenAI · Proprietary	1364	±12		2,491	$0.40 / $1.60	1M
184	156-201	gemini-2.0-flash-001	Google · Proprietary	1362	±9		3,763	$0.10 / $0.40	1M
185	153-208	grok-3-mini-beta	SpaceXAI · Proprietary	1361	±15		1,464	$0.30 / $0.50	131.1K
186	160-201	claude-3-5-sonnet-20241022	Anthropic · Proprietary	1359	±7		8,629	$3 / $15	200K
187	150-212	nvidia-nemotron-3-nano-30b-a3b-bf16	Nvidia · NVIDIA Open Model	1359	±22		685	$0.06 / $0.24	262.1K
188	155-212	mistral-small-2506	Mistral · Apache 2.0	1355	±18		1,002	$0.10 / $0.30	32K
189	160-212	mistral-medium-2505	Mistral · Proprietary	1354	±12		2,200	$0.40 / $2	131.1K
190	154-215	hunyuan-turbos-20250416	Tencent · Proprietary	1354	±20		798	N/A	N/A
191	166-208	gemini-1.5-pro-002	Google · Proprietary	1354	±8		6,506	$3.50 / $10.50	2.1M
192	149-224	olmo-3.1-32b-instruct	Ai2 · Apache 2.0	1354	±28		432	$0.20 / $0.60	65.5K
193	146-225	ring-flash-2.0	Ant Group · MIT	1353	±30		362	N/A	N/A
194	150-225	gpt-5-nano-high	OpenAI · Proprietary	1353	±28		440	$0.03 / $0.20	400K
195	150-225	ling-flash-2.0	Ant Group · MIT	1352	±29		373	N/A	N/A
196	155-224	nova-2-lite	Amazon · Proprietary	1350	±24		604	$0.30 / $2.50	1M
197	151-228	gemma-3-12b-it	Google · Gemma	1349	±30		333	$0.05 / $0.15	131.1K
198	151-243	glm-4.5v	Z.ai · MIT	1342	±37		233	$0.60 / $1.80	65.5K
199	181-218	gemma-3-27b-it	Google · Gemma	1340	±10		3,198	$0.08 / $0.45	262.1K
200	181-216	claude-3-5-sonnet-20240620	Anthropic · Proprietary	1339	±8		10,038	$3 / $15	200K
201	181-222	gemini-2.0-flash-lite-preview-02-05	Google · Proprietary	1338	±11		2,399	$0.07 / $0.30	1M
202	155-252	olmo-3-32b-think	Ai2 · Apache 2.0	1335	±39		207	$0.15 / $0.50	65.5K
203	175-234	qwen-plus-0125	Alibaba · Proprietary	1333	±22		627	$0.40 / $1.20	131.1K
204	179-246	gpt-oss-20b	OpenAI · Apache 2.0	1328	±24		588	$0.03 / $0.13	131.1K
205	179-251	hunyuan-large-2025-02-10	Tencent · Proprietary	1326	±26		431	N/A	N/A
206	189-233	command-a-03-2025	Cohere · CC-BY-NC-4.0	1326	±10		3,656	$2.50 / $10	256K
207	160-262	granite-4.1-8b	IBM · Apache 2.0	1325	±41		215	$0.05 / $0.10	131.1K
208	181-251	step-1o-turbo-202506	StepFun · Proprietary	1324	±24		569	N/A	N/A
209	185-248	step-2-16k-exp-202412	StepFun · Proprietary	1323	±22		543	N/A	N/A
210	191-235	athene-v2-chat	NexusFlow	1321	±10		2,942	N/A	N/A
211	194-234	llama-3.1-405b-instruct-fp8	Meta · Llama 3.1 Community	1320	±8		7,242	$4 / $4	32.8K
212	194-237	gemini-advanced-0514	Google · Proprietary	1320	±10		5,787	N/A	N/A
213	192-237	llama-4-maverick-17b-128e-instruct	Meta · Llama 4	1319	±12		2,594	$0.63 / $1.80	131.1K
214	194-237	llama-3.1-405b-instruct-bf16	Meta · Llama 3.1 Community	1318	±9		4,366	$4 / $4	32.8K
215	194-243	deepseek-v3	DeepSeek · DeepSeek	1317	±12		2,326	$1.14 / $4.56	N/A
216	192-248	qwen2.5-plus-1127	Alibaba · Proprietary	1316	±15		1,265	N/A	N/A
217	195-243	yi-lightning	Proprietary	1316	±11		3,206	N/A	N/A
218	186-258	hunyuan-large-vision	Tencent · Proprietary	1314	±28		369	N/A	N/A
219	186-263	olmo-3.1-32b-think	Ai2 · Apache 2.0	1314	±31		352	$0.15 / $0.50	65.5K
220	200-244	gpt-4o-2024-08-06	OpenAI · Proprietary	1313	±8		5,805	$2.50 / $10	128K
221	200-244	gemini-1.5-pro-001	Google · Proprietary	1313	±8		9,328	$3.50 / $10.50	2.1M
222	195-251	llama-4-scout-17b-16e-instruct	Meta · Llama	1312	±14		1,826	$0.40 / $0.70	8.2K
223	182-267	hunyuan-turbo-0110	Tencent · Proprietary	1312	±34		216	N/A	N/A
224	201-246	claude-3-opus-20240229	Anthropic · Proprietary	1310	±7		22,970	$15 / $75	200K
225	201-247	gpt-4o-2024-05-13	OpenAI · Proprietary	1310	±7		13,306	$5 / $15	128K
226	201-248	qwen2.5-72b-instruct	Alibaba · Qwen	1310	±9		4,565	$1.20 / $1.20	N/A
227	185-268	ibm-granite-h-small	IBM · Apache 2.0	1310	±35		283	N/A	N/A
228	201-250	gpt-4-1106-preview	OpenAI · Proprietary	1309	±8		11,549	$10 / $30	128K
229	190-263	hunyuan-standard-2025-02-10	Tencent · Proprietary	1309	±26		441	N/A	N/A
230	197-263	glm-4-plus-0111	Z.ai · Proprietary	1304	±21		638	N/A	N/A
231	190-269	hunyuan-turbos-20250226	Tencent · Proprietary	1302	±32		224	N/A	N/A
232	204-256	gemini-1.5-flash-002	Google · Proprietary	1302	±9		4,114	$0.07 / $0.30	1M
233	205-253	llama-3.3-70b-instruct	Meta · Llama-3.3	1302	±8		5,239	$0.10 / $0.32	131.1K
234	202-258	qwen-max-0919	Alibaba · Qwen	1301	±13		1,804	$1.60 / $6.40	32.8K
235	201-264	llama-3.1-nemotron-70b-instruct	Nvidia · Llama 3.1	1300	±18		874	$1.20 / $1.20	131.1K
236	208-256	grok-2-2024-08-13	SpaceXAI · Proprietary	1300	±8		7,604	$2 / $10	131.1K
237	208-256	claude-3-5-haiku-20241022	Anthropic · Proprietary	1300	±8		5,795	$1 / $5	200K
238	208-256	gpt-4-turbo-2024-04-09	OpenAI · Proprietary	1300	±8		11,796	$10 / $30	128K
239	205-258	glm-4-plus	Z.ai · Proprietary	1299	±11		2,991	$0.44 / $1.76	204.8K
240	208-256	gpt-4-0125-preview	OpenAI · Proprietary	1299	±8		10,830	$10 / $30	128K
241	208-258	mistral-large-2407	Mistral · Mistral Research	1298	±9		5,745	$2 / $6	131.1K
242	208-259	deepseek-v2.5	DeepSeek · DeepSeek	1296	±10		3,039	N/A	N/A
243	200-273	magistral-medium-2506	Mistral · Proprietary	1294	±26		584	$2 / $5	40K
244	220-267	gpt-4-0314	OpenAI · Proprietary	1290	±10		6,112	$30 / $60	8.2K
245	215-267	mistral-small-3.1-24b-instruct-2503	Mistral · Apache 2.0	1290	±13		1,950	$0.10 / $0.30	32K
246	213-272	deepseek-v2.5-1210	DeepSeek · DeepSeek	1287	±18		893	N/A	N/A
247	225-267	gpt-4o-mini-2024-07-18	OpenAI · Proprietary	1286	±7		7,968	$0.15 / $0.60	128K
248	225-267	grok-2-mini-2024-08-13	SpaceXAI · Proprietary	1286	±8		6,253	$2 / $10	131.1K
249	219-270	gemma-3n-e4b-it	Google · Gemma	1285	±16		1,418	$0.06 / $0.12	32.8K
250	224-268	amazon-nova-pro-v1.0	Amazon · Proprietary	1284	±10		2,650	$0.80 / $3.20	300K
251	225-268	mistral-large-2411	Mistral · MRL	1284	±10		3,037	$2 / $6	128K
252	213-279	gpt-4.1-nano-2025-04-14	OpenAI · Proprietary	1280	±24		534	$0.10 / $0.40	1M
253	230-273	phi-4	Microsoft · MIT	1278	±12		2,350	$0.07 / $0.14	16.4K
254	216-281	llama-3.1-nemotron-51b-instruct	Nvidia · Llama 3.1	1276	±25		422	N/A	N/A
255	236-273	llama-3.1-70b-instruct	Meta · Llama 3.1 Community	1275	±8		6,524	$0.40 / $0.40	131.1K
256	235-273	qwen2-72b-instruct	Alibaba · Qianwen LICENSE	1275	±10		4,235	$0.90 / $0.90	32.8K
257	211-285	gemma-3-4b-it	Google · Gemma	1274	±30		365	$0.05 / $0.10	131.1K
258	239-273	gemini-1.5-flash-001	Google · Proprietary	1274	±8		7,315	$0.07 / $0.30	1M
259	219-285	llama-3.1-tulu-3-70b	Ai2 · Llama 3.1	1273	±28		349	N/A	N/A
260	240-273	gpt-4-0613	OpenAI · Proprietary	1272	±9		9,862	$30 / $60	8.2K
261	235-278	deepseek-coder-v2	DeepSeek · DeepSeek License	1271	±14		1,669	$0.14 / $0.28	128K
262	235-279	mistral-small-24b-instruct-2501	Mistral · Apache 2.0	1270	±14		1,447	$0.05 / $0.08	32.8K
263	240-277	athene-70b-0725	CC-BY-NC-4.0	1270	±11		2,559	N/A	N/A
264	234-279	reka-core-20240904	Proprietary	1270	±16		1,039	N/A	N/A
265	230-282	qwen2.5-coder-32b-instruct	Alibaba · Apache 2.0	1269	±21		619	$0.87 / $0.87	32K
266	223-295	hunyuan-standard-256k	Tencent · Proprietary	1266	±31		292	N/A	N/A
267	248-278	gemma-2-27b-it	Google · Gemma license	1265	±7		8,869	$0.65 / $0.65	8.2K
268	240-282	glm-4-0520	Z.ai · Proprietary	1264	±17		1,067	N/A	N/A
269	251-280	llama-3-70b-instruct	Meta · Llama 3 Community	1261	±8		18,728	$0.51 / $0.74	8.2K
270	250-280	claude-3-sonnet-20240229	Anthropic · Proprietary	1261	±8		12,413	$3 / $15	200K
271	249-285	nemotron-4-340b-instruct	Nvidia · NVIDIA Open Model	1258	±13		2,133	N/A	N/A
272	245-287	jamba-1.5-large	Jamba Open	1257	±17		962	$2 / $8	256K
273	250-285	amazon-nova-lite-v1.0	Amazon · Proprietary	1257	±12		2,173	$0.06 / $0.24	300K
274	257-285	gemini-1.5-flash-8b-001	Google · Proprietary	1253	±9		4,171	$0.07 / $0.30	1M
275	258-293	c4ai-aya-expanse-32b	Cohere · CC-BY-NC-4.0	1248	±10		3,239	N/A	N/A
276	257-297	command-r-plus-08-2024	Cohere · CC-BY-NC-4.0	1247	±15		1,243	$2.50 / $10	128K
277	257-299	reka-flash-20240904	Proprietary	1246	±15		1,109	N/A	N/A
278	265-297	mistral-large-2402	Mistral · Proprietary	1242	±9		7,028	$4 / $12	32K
279	268-299	claude-3-haiku-20240307	Anthropic · Proprietary	1239	±8		13,491	$0.25 / $1.25	200K
280	268-299	gemma-2-9b-it	Google · Gemma license	1238	±8		6,297	$0.03 / $0.09	8.2K
281	263-303	gemma-2-9b-it-simpo	MIT	1238	±16		1,139	$0.03 / $0.09	8.2K
282	268-303	amazon-nova-micro-v1.0	Amazon · Proprietary	1235	±12		2,016	$0.04 / $0.14	128K
283	273-305	qwen1.5-110b-chat	Alibaba · Qianwen LICENSE	1232	±12		2,860	N/A	N/A
284	274-305	mixtral-8x22b-instruct-v0.1	Mistral · Apache 2.0	1231	±9		6,001	$0.90 / $0.90	65.5K
285	257-316	granite-3.1-2b-instruct	IBM · Apache 2.0	1230	±29		341	N/A	N/A
286	274-306	mistral-medium	Mistral · Proprietary	1227	±11		3,806	$2.70 / $8.10	32K
287	260-318	granite-3.1-8b-instruct	IBM · Apache 2.0	1226	±31		320	N/A	N/A
288	274-310	command-r-08-2024	Cohere · CC-BY-NC-4.0	1226	±15		1,361	$0.15 / $0.60	128K
289	275-307	phi-3-medium-4k-instruct	Microsoft · MIT	1225	±11		2,729	$0.17 / $0.68	N/A
290	276-307	qwen1.5-72b-chat	Alibaba · Qianwen LICENSE	1223	±10		4,522	N/A	N/A
291	276-311	yi-1.5-34b-chat	Apache-2.0	1222	±12		2,568	N/A	N/A
292	281-307	command-r-plus	Cohere · CC-BY-NC-4.0	1221	±9		8,796	$2.50 / $10	128K
293	266-320	olmo-2-0325-32b-instruct	Ai2 · Apache-2.0	1220	±30		336	$0.05 / $0.20	128K
294	278-315	reka-flash-21b-20240226-online	Proprietary	1218	±15		1,867	N/A	N/A
295	273-320	qwq-32b-preview	Alibaba · Apache 2.0	1217	±27		422	$0.50 / $1	16.4K
296	274-318	gemini-pro	Google · Proprietary	1217	±21		844	$0.35 / $1.05	32.8K
297	274-318	ministral-8b-2410	Mistral · MRL	1217	±22		543	$0.10 / $0.10	131.1K
298	278-317	c4ai-aya-expanse-8b	Cohere · CC-BY-NC-4.0	1216	±16		1,146	N/A	N/A
299	275-318	granite-3.0-8b-instruct	IBM · Apache 2.0	1216	±21		675	N/A	N/A
300	281-315	qwen1.5-32b-chat	Alibaba · Qianwen LICENSE	1215	±13		2,405	N/A	N/A
301	281-318	internlm2_5-20b-chat	Other	1213	±16		1,086	$0 / $0	32.8K
302	283-318	reka-flash-21b-20240226	Proprietary	1210	±12		2,967	N/A	N/A
303	274-323	llama-3.1-tulu-3-8b	Ai2 · Llama 3.1	1208	±29		304	N/A	N/A
304	283-320	gpt-3.5-turbo-1106	OpenAI · Proprietary	1205	±16		1,746	$1 / $2	16.4K
305	285-320	phi-3-small-8k-instruct	Microsoft · MIT	1203	±14		1,849	$0.15 / $0.60	N/A
306	281-323	zephyr-orpo-141b-A35b-v0.1	Apache 2.0	1202	±24		526	N/A	N/A
307	291-318	llama-3-8b-instruct	Meta · Llama 3 Community	1202	±8		12,836	$0.14 / $0.14	8.2K
308	286-320	gemini-pro-dev-api	Google · Proprietary	1199	±15		1,975	$0.35 / $1.05	32.8K
309	291-320	gpt-3.5-turbo-0125	OpenAI · Proprietary	1198	±9		7,493	$0.50 / $1.50	16.4K
310	289-321	phi-3-mini-4k-instruct-june-2024	Microsoft · MIT	1197	±15		1,357	$0.13 / $0.52	4.1K
311	291-320	mixtral-8x7b-instruct-v0.1	Mistral · Apache 2.0	1195	±9		8,472	$0.63 / $0.63	32K
312	289-323	jamba-1.5-mini	Jamba Open	1194	±17		932	$0.20 / $0.40	256K
313	293-320	llama-3.1-8b-instruct	Meta · Llama 3.1 Community	1193	±8		5,985	$0.05 / $0.08	131.1K
314	291-322	dbrx-instruct-preview	DBRX LICENSE	1191	±12		3,599	$0.60 / $0.60	32.8K
315	294-322	command-r	Cohere · CC-BY-NC-4.0	1190	±10		5,906	$0.15 / $0.60	128K
316	290-329	granite-3.0-2b-instruct	IBM · Apache 2.0	1190	±21		751	N/A	N/A
317	295-328	qwen1.5-14b-chat	Alibaba · Qianwen LICENSE	1185	±14		1,972	$0.30 / $0.30	N/A
318	302-326	gemma-2-2b-it	Google · Gemma license	1183	±9		5,632	N/A	N/A
319	289-343	smollm2-1.7b-instruct	Apache 2.0	1178	±34		240	N/A	N/A
320	302-334	llama-3.2-3b-instruct	Meta · Llama 3.2	1174	±17		980	$0.05 / $0.33	131.1K
321	310-334	starling-lm-7b-beta	Apache-2.0	1169	±15		1,816	N/A	N/A
322	316-336	gemma-1.1-7b-it	Google · Gemma license	1164	±12		2,659	$0.03 / $0.09	8.2K
323	317-338	snowflake-arctic-instruct	Apache 2.0	1162	±12		4,220	N/A	N/A
324	311-345	openhermes-2.5-mistral-7b	Apache-2.0	1160	±22		568	$0.17 / $0.17	N/A
325	317-341	yi-34b-chat	Yi License	1159	±14		1,719	$0.90 / $0.90	4.1K
326	313-348	qwen1.5-7b-chat	Alibaba · Qianwen LICENSE	1156	±23		578	$0.20 / $0.20	N/A
327	316-346	wizardlm-70b	Microsoft · Llama 2 Community	1156	±21		764	N/A	N/A
328	318-344	openchat-3.5-0106	Apache-2.0	1156	±15		1,467	N/A	N/A
329	319-344	phi-3-mini-4k-instruct	Microsoft · MIT	1154	±13		2,198	$0.13 / $0.52	N/A
330	316-348	deepseek-llm-67b-chat	DeepSeek · DeepSeek License	1149	±27		484	N/A	N/A
331	319-348	phi-3-mini-128k-instruct	Microsoft · MIT	1143	±14		2,569	$0.13 / $0.52	N/A
332	319-348	tulu-2-dpo-70b	AI2 ImpACT Low-risk	1142	±21		751	N/A	N/A
333	319-348	qwen-14b-chat	Alibaba · Qianwen LICENSE	1142	±26		467	N/A	N/A
334	321-348	llama-2-70b-chat	Meta · Llama 2 Community	1142	±11		4,052	$0.70 / $2.80	4.1K
335	319-348	llama-3.2-1b-instruct	Meta · Llama 3.2	1142	±18		976	$0.03 / $0.20	60K
336	323-348	mistral-7b-instruct-v0.2	Mistral · Apache-2.0	1135	±13		2,193	$0.20 / $0.20	32.8K
337	322-348	starling-lm-7b-alpha	CC-BY-NC-4.0	1134	±17		1,103	N/A	N/A
338	321-349	openchat-3.5	Apache-2.0	1133	±20		826	$0.20 / $0.20	N/A
339	324-348	vicuna-33b	Non-commercial	1130	±14		2,352	$0 / $0	2K
340	323-353	palm-2	Google · Proprietary	1126	±21		801	$0.50 / $0.50	25.8K
341	325-351	gemma-7b-it	Google · Gemma license	1125	±18		982	$0.05 / $0.08	8.2K
342	328-351	llama-2-13b-chat	Meta · Llama 2 Community	1121	±14		1,977	$0.25 / $0.25	4.1K
343	329-354	gemma-1.1-2b-it	Google · Gemma license	1118	±17		1,224	N/A	N/A
344	327-355	codellama-34b-instruct	Meta · Llama 2 Community	1117	±21		667	$0.35 / $1.40	16.4K
345	322-359	mpt-30b-chat	CC-BY-NC-SA-4.0	1115	±37		218	N/A	N/A
346	324-358	llama2-70b-steerlm-chat	Nvidia · Llama 2 Community	1114	±30		353	N/A	N/A
347	323-359	dolphin-2.2.1-mistral-7b	Apache-2.0	1111	±34		201	$0.50 / $0.50	16.4K
348	329-358	solar-10.7b-instruct-v1.0	CC-BY-NC-4.0	1110	±24		529	$0.30 / $0.30	N/A
349	340-359	zephyr-7b-beta	MIT	1094	±18		1,113	$0.15 / $0.15	16.4K
350	342-359	llama-2-7b-chat	Meta · Llama 2 Community	1091	±15		1,401	$0.15 / $0.15	4.1K
351	339-360	nous-hermes-2-mixtral-8x7b-dpo	Apache-2.0	1088	±26		464	$0.90 / $0.90	N/A
352	344-359	vicuna-13b	Llama 2 Community	1085	±15		1,884	$0.30 / $0.30	N/A
353	342-360	stripedhyena-nous-7b	Apache 2.0	1084	±23		530	$0.20 / $0.20	N/A
354	343-361	gemma-2b-it	Google · Gemma license	1078	±25		525	$0.10 / $0.10	N/A
355	340-361	guanaco-33b	Non-commercial	1077	±35		236	N/A	N/A
356	345-361	mistral-7b-instruct	Mistral · Apache 2.0	1074	±21		814	$0.07 / $0.28	4.1K
357	345-361	wizardlm-13b	Microsoft · Llama 2 Community	1071	±23		567	$0.30 / $0.30	N/A
358	345-361	qwen1.5-4b-chat	Alibaba · Qianwen LICENSE	1069	±20		820	$0.10 / $0.10	N/A
359	347-361	olmo-7b-instruct	Ai2 · Apache-2.0	1058	±21		726	$0.20 / $0.20	N/A
360	352-361	vicuna-7b	Llama 2 Community	1046	±24		590	$0.20 / $0.20	N/A
361	354-365	chatglm3-6b	Apache-2.0	1030	±27		466	N/A	N/A
362	361-369	RWKV-4-Raven-14B	Apache 2.0	995	±26		488	N/A	N/A
363	361-369	mpt-7b-chat	CC-BY-NC-SA-4.0	988	±28		397	N/A	N/A
364	361-369	koala-13b	Non-commercial	987	±23		692	N/A	N/A
365	361-369	alpaca-13b	Non-commercial	985	±25		565	N/A	N/A
366	362-370	oasst-pythia-12b	Apache 2.0	975	±25		629	N/A	N/A
367	362-370	chatglm-6b	Non-commercial	974	±28		466	N/A	N/A
368	362-371	dolly-v2-12b	MIT	939	±31		343	N/A	N/A
369	362-371	llama-13b	Meta · Non-commercial	937	±37		228	$0.23 / $0.23	N/A
370	366-371	fastchat-t5-3b	Apache 2.0	924	±29		400	N/A	N/A
371	368-371	stablelm-tuned-alpha-7b	CC-BY-NC-SA-4.0	896	±31		294	N/A	N/A
```

## Category: Occupational: Legal & Government (adjustment: None)

Source: https://arena.ai, Text Arena leaderboard, Categories panel, "Occupational: Legal & Government" selected, Adjustments = None.
Date shown on page: Aug 19, 2026. Votes: 513,496. Models: 366. Captured row count: 366 (verified match).

```
1	1-19	muse-spark-1.2 (xHigh)	Meta · Proprietary	1540	±35		271	$1.25 / $4.25	N/A
2	1-30	kimi-k3-max	Moonshot · Kimi K3 license	1514	±18		1,130	N/A	N/A
3	1-24	claude-opus-4-7-high	Anthropic · Proprietary	1512	±9		4,850	$5 / $25	1M
4	1-25	claude-opus-4-6-high	Anthropic · Proprietary	1510	±9		5,912	$5 / $25	1M
5	1-30	claude-fable-5	Anthropic · Proprietary	1510	±14		1,917	$10 / $50	1M
6	1-30	claude-opus-5-high	Anthropic · Proprietary	1509	±14		2,162	$5 / $25	1M
7	1-28	claude-opus-4-6	Anthropic · Proprietary	1506	±9		6,160	$5 / $25	1M
8	1-47	muse-spark	Meta · Proprietary	1504	±20		977	N/A	N/A
9	1-41	muse-spark-1.1	Meta · Proprietary	1504	±15		1,613	$1.25 / $4.25	N/A
10	1-47	claude-opus-5-max	Anthropic · Proprietary	1504	±19		1,063	$5 / $25	1M
11	1-40	gemini-3-pro	Google · Proprietary	1501	±11		2,963	$2 / $12	1M
12	1-75	gemini-3.7-flash-high	Google · Proprietary	1499	±29	Preliminary	440	$0.75 / $3.57	1M
13	2-41	gemini-3.1-pro-preview	Google · Proprietary	1497	±8		7,998	$1 / $6	1M
14	1-47	claude-opus-4-8	Anthropic · Proprietary	1496	±11		3,650	$5 / $25	1M
15	2-47	gpt-5.5-high	OpenAI · Proprietary	1495	±10		4,752	$2.50 / $15	1.1M
16	2-47	claude-opus-4-7	Anthropic · Proprietary	1494	±9		5,070	$5 / $25	1M
17	2-51	claude-opus-4-8-high	Anthropic · Proprietary	1493	±11		3,638	$5 / $25	1M
18	1-93	glm-5.3-max	Z.ai · MIT	1493	±39		226	$1.40 / $4.40	1M
19	1-61	gpt-5.6-sol-xhigh	OpenAI · Proprietary	1492	±16		1,522	$5 / $30	N/A
20	4-53	gpt-5.4-high	OpenAI · Proprietary	1491	±9		4,899	$2.50 / $15	1.1M
21	2-70	gemini-3.6-flash-high	Google · Proprietary	1488	±16		1,385	$0.38 / $1.88	1M
22	3-63	gemini-3.5-flash-medium	Google · Proprietary	1488	±13		2,171	$0.75 / $4.50	1M
23	1-83	qwen3.8-max	Alibaba · Proprietary	1487	±23		677	$2 / $6	1M
24	4-64	gemini-3-flash	Google · Proprietary	1487	±12		2,374	$0.50 / $3	1M
25	8-61	claude-sonnet-4-6	Anthropic · Proprietary	1486	±9		5,391	$1.50 / $7.50	1M
26	5-64	claude-opus-4-5-20251101-high-32k	Anthropic · Proprietary	1486	±12		2,697	$5 / $25	200K
27	8-63	gpt-5.5	OpenAI · Proprietary	1484	±9		4,919	$2.50 / $15	1.1M
28	4-78	gpt-5.6-terra-xhigh	OpenAI · Proprietary	1484	±16		1,578	$2.50 / $15	N/A
29	8-64	claude-opus-4-5-20251101	Anthropic · Proprietary	1483	±9		5,273	$5 / $25	200K
30	8-76	gpt-5.2-chat-latest-20260210	OpenAI · Proprietary	1481	±12		2,594	$1.75 / $14	128K
31	8-78	glm-5.2-max	Z.ai · MIT	1481	±13		2,407	$1.40 / $4.40	1M
32	1-108	grok-4.6-high	SpaceXAI · Proprietary	1479	±33	Preliminary	287	$2 / $6	500K
33	8-83	gpt-5.5-instant	OpenAI · Proprietary	1478	±14		2,188	$2.50 / $15	1.1M
34	8-83	claude-sonnet-5-high	Anthropic · Proprietary	1478	±13		2,275	$1 / $5	1M
35	11-76	grok-4.20-beta-0309-reasoning	SpaceXAI · Proprietary	1478	±9		4,965	$1.25 / $2.50	1M
36	11-78	grok-4.1-thinking	SpaceXAI · Proprietary	1477	±9		4,815	N/A	N/A
37	11-78	gpt-5.4	OpenAI · Proprietary	1477	±9		5,065	$2.50 / $15	1.1M
38	11-83	glm-5.1	Z.ai · MIT	1477	±11		3,286	$1.40 / $4.40	202.8K
39	11-84	gemini-3.5-flash-high	Google · Proprietary	1476	±13		2,407	$0.75 / $4.50	1M
40	1-120	qwen3.7-max-preview	Alibaba · Proprietary	1475	±35		291	$1.48 / $4.42	1M
41	1-123	deepseek-v4-pro-high-20260813	DeepSeek · MIT	1475	±37		234	$1.32 / $3.96	N/A
42	9-86	qwen3.5-max-preview	Alibaba · Proprietary	1475	±15		1,668	$1.20 / $6	N/A
43	16-83	mimo-v2.5-pro	Xiaomi · MIT	1475	±10		4,293	$0.43 / $0.87	1.1M
44	16-83	deepseek-v4-pro	DeepSeek · MIT	1474	±10		4,250	$1.32 / $3.96	1M
45	18-83	grok-4.1	SpaceXAI · Proprietary	1472	±9		4,955	N/A	N/A
46	17-84	deepseek-v4-pro-high-preview	DeepSeek · MIT	1472	±10		4,072	$1.32 / $3.96	1M
47	11-91	grok-4.5	SpaceXAI · Proprietary	1472	±15		1,772	$2 / $6	500K
48	18-84	grok-4.20-multi-agent-beta-0309	SpaceXAI · Proprietary	1472	±9		4,877	$1.25 / $2.50	1M
49	16-91	grok-4.20-beta1	SpaceXAI · Proprietary	1470	±14		2,027	N/A	N/A
50	18-84	gemini-3-flash (thinking-minimal)	Google · Proprietary	1470	±8		6,889	$0.50 / $3	1M
51	17-92	glm-5	Z.ai · MIT	1469	±13		2,138	$1 / $3.20	202.8K
52	8-108	gpt-4.5-preview-2025-02-27	OpenAI · Proprietary	1468	±23		701	$75 / $150	128K
53	22-84	gemini-2.5-pro	Google · Proprietary	1468	±7		8,940	$0.63 / $5	1M
54	18-94	gpt-5.3-chat-latest	OpenAI · Proprietary	1465	±12		2,564	$1.75 / $14	128K
55	25-91	claude-sonnet-4-5-20250929	Anthropic · Proprietary	1465	±8		5,862	$3 / $15	200K
56	25-92	dola-seed-2.0-pro	Bytedance · Proprietary	1465	±9		5,773	N/A	N/A
57	20-93	ernie-5.1	Baidu · Proprietary	1464	±12		2,933	N/A	N/A
58	8-129	gemma-4-26b-a4b	Google · Apache 2.0	1464	±29		391	N/A	N/A
59	18-105	gpt-5.6-luna-xhigh	OpenAI · Proprietary	1463	±15		1,645	$1 / $6	N/A
60	26-92	claude-sonnet-4-5-20250929-high-32k	Anthropic · Proprietary	1463	±8		5,772	$3 / $15	200K
61	8-131	qwen3.6-max-preview	Alibaba · Proprietary	1463	±31		386	$1.03 / $6.16	262.1K
62	5-138	deepseek-v3.1-terminus-thinking	DeepSeek · MIT	1462	±35		265	$0.27 / $1	163.8K
63	25-97	gpt-5.1-high	OpenAI · Proprietary	1461	±11		2,994	$0.63 / $5	400K
64	25-98	kimi-k2.6	Moonshot · Modified MIT	1461	±11		2,840	$0.95 / $4	262.1K
65	18-110	gemini-3.5-flash-lite	Google · Proprietary	1461	±16		1,412	$0.15 / $1.25	1M
66	26-100	claude-opus-4-1-20250805-thinking-16k	Anthropic · Proprietary	1460	±10		3,243	$15 / $75	200K
67	33-97	claude-opus-4-1-20250805	Anthropic · Proprietary	1459	±8		5,391	$15 / $75	200K
68	29-102	deepseek-v4-flash-high-preview	DeepSeek · MIT	1458	±10		3,878	$0.44 / $1.32	1M
69	33-100	chatgpt-4o-latest-20250326	OpenAI · Proprietary	1458	±8		5,368	$5 / $15	128K
70	25-113	mimo-v2-pro	Xiaomi · Proprietary	1458	±15		1,758	$1 / $3	1M
71	16-134	gemma-4-31b	Google · Apache 2.0	1458	±27		437	$0.14 / $0.40	262.1K
72	26-110	gpt-5-chat	OpenAI · Proprietary	1458	±14		1,984	$1.25 / $10	N/A
73	18-125	ernie-5.0-preview-1203	Baidu · Proprietary	1458	±20		770	N/A	N/A
74	33-105	gpt-5.4-mini-high	OpenAI · Proprietary	1457	±10		4,745	$0.75 / $4.50	400K
75	33-110	qwen3.7-plus	Alibaba · Proprietary	1456	±12		2,851	$0.32 / $1.28	1M
76	29-119	gpt-5-high	OpenAI · Proprietary	1454	±14		1,914	$0.63 / $5	400K
77	25-129	glm-4.7	Z.ai · MIT	1454	±19		963	$0.40 / $1.75	204.8K
78	26-135	kimi-k2-0905-preview	Moonshot · Modified MIT	1451	±21		792	$0.60 / $2.50	262.1K
79	45-120	gpt-5.1	OpenAI · Proprietary	1450	±11		3,110	$0.63 / $5	400K
80	46-120	o3-2025-04-16	OpenAI · Proprietary	1450	±10		3,863	$2 / $8	200K
81	46-120	deepseek-v4-flash	DeepSeek · MIT	1449	±10		3,895	$0.44 / $1.32	1M
82	46-125	qwen3.6-plus	Alibaba · Proprietary	1448	±11		3,440	$0.33 / $1.95	1M
83	46-125	gpt-5.2-high	OpenAI · Proprietary	1447	±10		3,604	$0.88 / $7	400K
84	49-120	kimi-k2.5-thinking	Moonshot · Modified MIT	1447	±9		5,359	$0.60 / $3	N/A
85	20-148	ernie-5.0-preview-1022	Baidu · Proprietary	1447	±30		334	N/A	N/A
86	52-125	gpt-5.2	OpenAI · Proprietary	1445	±8		6,347	$0.88 / $7	400K
87	26-148	hunyuan-hy3-preview	Tencent · tencent-hunyuan-community	1445	±26		532	$0.29 / $1.17	262.1K
88	18-166	amazon-nova-experimental-chat-26-02-10	Amazon · Proprietary	1442	±36		251	N/A	N/A
89	55-130	qwen3.5-397b-a17b	Alibaba · Apache 2.0	1442	±9		5,233	$0.39 / $2.34	262.1K
90	33-152	kimi-k2.5-instant	Moonshot · Modified MIT	1441	±25		520	$0.45 / $2.25	262.1K
91	27-157	hy3	Tencent · Apache 2.0	1441	±29		411	$0.13 / $0.53	262.1K
92	54-136	ernie-5.0-0110	Baidu · Proprietary	1441	±12		2,593	N/A	N/A
93	58-131	gemini-3.1-flash-lite-preview	Google · Proprietary	1441	±9		4,759	$0.25 / $1.50	1M
94	45-150	qwen3-vl-235b-a22b-instruct	Alibaba · Apache 2.0	1439	±22		773	$0.21 / $1.90	262.1K
95	61-136	grok-4.3	SpaceXAI · Proprietary	1438	±10		4,839	$1.25 / $2.50	1M
96	46-149	mistral-medium-3.5	Mistral · Modified MIT	1438	±21		839	$1.50 / $7.50	262.1K
97	61-138	gpt-4.1-2025-04-14	OpenAI · Proprietary	1437	±10		3,327	$2 / $8	1M
98	60-138	claude-opus-4-20250514	Anthropic · Proprietary	1437	±11		2,948	$15 / $75	200K
99	55-145	mimo-v2-omni	Xiaomi · Proprietary	1436	±15		1,608	$0.40 / $2	262.1K
100	55-147	inkling	Thinky · Apache 2.0	1436	±16		1,446	$1 / $4.05	524.3K
101	65-138	kimi-k2-thinking-turbo	Moonshot · Modified MIT	1435	±9		4,483	$1.15 / $8	262.1K
102	63-139	glm-4.6	Z.ai · MIT	1435	±12		2,470	$0.50 / $2	204.8K
103	69-138	qwen3-235b-a22b-instruct-2507	Alibaba · Apache 2.0	1434	±8		6,625	$0.26 / $1.06	N/A
104	65-139	minimax-m3	MiniMax · MiniMax Community License	1434	±11		3,327	$0.60 / $2.40	N/A
105	61-147	qwen3-max-preview	Alibaba · Proprietary	1433	±14		1,772	$0.78 / $3.90	262.1K
106	68-140	deepseek-v3.2	DeepSeek · MIT	1433	±10		3,423	$0.27 / $0.40	163.8K
107	68-141	deepseek-v3.2-thinking	DeepSeek · MIT	1433	±11		2,998	$0.27 / $0.40	163.8K
108	68-147	claude-opus-4-20250514-thinking-16k	Anthropic · Proprietary	1432	±12		2,512	$15 / $75	200K
109	69-155	longcat-flash-chat-2602-exp	Meituan · Proprietary	1429	±14		2,108	N/A	N/A
110	60-166	nvidia-nemotron-3-ultra-550b-a55b-nvfp4	Nvidia · OpenMDW-1.1	1429	±20		907	N/A	N/A
111	69-154	gemini-2.5-flash-preview-09-2025	Google · Proprietary	1428	±13		2,211	$0.30 / $2.50	1M
112	40-183	muse-glimmer	Meta · Apache-2.0	1428	±35		290	N/A	N/A
113	75-149	mimo-v2.5	Xiaomi · MIT	1428	±11		3,577	$0.14 / $0.28	1.1M
114	82-145	gemini-2.5-flash	Google · Proprietary	1428	±7		8,875	$0.15 / $1.25	1M
115	80-148	grok-4-1-fast-reasoning	SpaceXAI · Proprietary	1427	±10		4,128	$0.20 / $0.50	2M
116	76-157	qwen3.5-122b-a10b	Alibaba · Apache 2.0	1425	±13		2,235	$0.26 / $2.08	262.1K
117	63-172	glm-5v-turbo	Z.ai · Proprietary	1424	±22		736	$1.20 / $4	202.8K
118	70-167	grok-4-fast-reasoning	SpaceXAI · Proprietary	1423	±17		1,229	$0.20 / $0.50	2M
119	57-179	grok-4-fast-chat	SpaceXAI · Proprietary	1422	±28		441	$3 / $15	256K
120	80-166	grok-3-preview-02-24	SpaceXAI · Proprietary	1422	±14		1,900	$3 / $15	131.1K
121	63-176	deepseek-v3.2-exp-thinking	DeepSeek · MIT	1422	±24		535	$0.27 / $0.41	163.8K
122	85-157	mistral-large-3	Mistral · Apache 2.0	1422	±9		4,572	$0.50 / $1.50	N/A
123	80-166	kimi-k2-0711-preview	Moonshot · Modified MIT	1421	±14		1,792	$0.60 / $2.50	131.1K
124	83-162	grok-4-0709	SpaceXAI · Proprietary	1421	±11		2,731	$3 / $15	256K
125	69-174	deepseek-v3.1-thinking	DeepSeek · MIT	1421	±20		793	$1.23 / $4.94	N/A
126	75-172	deepseek-v3.1	DeepSeek · MIT	1420	±18		1,032	$1.23 / $4.94	N/A
127	87-160	minimax-m2.7	MiniMax · Modified MIT	1420	±10		4,657	$0.30 / $1.20	204.8K
128	76-177	deepseek-v3.2-exp	DeepSeek · MIT	1417	±20		808	$0.27 / $0.41	163.8K
129	94-166	mistral-medium-2508	Mistral · Proprietary	1416	±8		6,610	$0.40 / $2	131.1K
130	97-166	claude-haiku-4-5-20251001	Anthropic · Proprietary	1416	±7		9,044	$1 / $5	200K
131	86-175	glm-4.5	Z.ai · MIT	1415	±15		1,526	$0.60 / $2.20	131.1K
132	85-175	deepseek-r1-0528	DeepSeek · MIT	1415	±16		1,395	$0.50 / $2.15	163.8K
133	58-199	deepseek-v3.1-terminus	DeepSeek · MIT	1415	±35		271	$0.27 / $1	163.8K
134	75-184	qwen3-max-2025-09-23	Alibaba · Proprietary	1414	±24		579	$0.78 / $3.90	262.1K
135	89-177	qwen3-next-80b-a3b-instruct	Alibaba · Apache 2.0	1412	±15		1,451	$0.09 / $1.10	262.1K
136	98-175	deepseek-v3-0324	DeepSeek · MIT	1411	±11		2,976	$3 / $4.50	32.8K
137	98-176	claude-sonnet-4-20250514	Anthropic · Proprietary	1410	±12		2,715	$3 / $15	1M
138	98-177	mistral-medium-2505	Mistral · Proprietary	1409	±13		2,172	$0.40 / $2	131.1K
139	100-181	qwen3.5-27b	Alibaba · Apache 2.0	1407	±13		2,098	$0.20 / $1.56	262.1K
140	69-213	hunyuan-t1-20250711	Tencent · Proprietary	1406	±34		277	N/A	N/A
141	98-184	o1-2024-12-17	OpenAI · Proprietary	1406	±16		1,454	$15 / $60	200K
142	108-181	qwen3-235b-a22b-no-thinking	Alibaba · Apache 2.0	1405	±12		2,607	$0.46 / $1.82	131.1K
143	106-184	claude-sonnet-4-20250514-thinking-32k	Anthropic · Proprietary	1404	±13		2,311	$3 / $15	1M
144	110-182	minimax-m2.5	MiniMax · Modified MIT	1404	±11		3,158	$0.23 / $0.90	204.8K
145	96-191	Inkling Small	Thinky · Apache 2.0	1403	±20		901	$0.45 / $1.20	524.3K
146	89-203	qwen3-vl-235b-a22b-thinking	Alibaba · Apache 2.0	1403	±25		525	$0.40 / $4	131.1K
147	69-219	glm-4.6v	Z.ai · MIT	1402	±41		204	$0.30 / $0.90	131.1K
148	115-184	gpt-5.4-nano-high	OpenAI · Proprietary	1401	±10		4,622	$0.20 / $1.25	400K
149	80-214	amazon-nova-experimental-chat-12-10	Amazon · Proprietary	1401	±35		259	N/A	N/A
150	110-189	qwen3-coder-480b-a35b-instruct	Alibaba · Apache 2.0	1401	±15		1,613	$0.40 / $1.60	262.1K
151	112-187	qwen3.5-35b-a3b	Alibaba · Apache 2.0	1400	±13		2,286	$0.25 / $1.25	262.1K
152	117-184	qwen3.5-flash	Alibaba · Proprietary	1400	±10		4,543	N/A	N/A
153	109-196	deepseek-r1	DeepSeek · MIT	1399	±18		1,097	$0.70 / $2.50	64K
154	109-196	minimax-m2.1-preview	MiniMax · MIT	1399	±17		1,197	$0.30 / $1.20	204.8K
155	117-186	gemini-2.5-flash-lite-preview-09-2025-no-thinking	Google · Proprietary	1399	±10		3,232	$0.10 / $0.40	1M
156	103-202	mimo-v2-flash (thinking)	Xiaomi · MIT	1399	±20		867	$0.10 / $0.30	262.1K
157	116-189	o4-mini-2025-04-16	OpenAI · Proprietary	1398	±11		2,818	$1.10 / $4.40	200K
158	116-190	claude-3-7-sonnet-20250219-thinking-32k	Anthropic · Proprietary	1398	±12		2,538	$3 / $15	200K
159	117-190	gpt-4.1-mini-2025-04-14	OpenAI · Proprietary	1397	±12		2,508	$0.40 / $1.60	1M
160	115-191	trinity-large-preview	Apache 2.0	1397	±14		2,163	$0.15 / $0.45	131K
161	85-218	amazon-nova-experimental-chat-26-01-10	Amazon · Proprietary	1396	±35		270	N/A	N/A
162	124-190	step-3.5-flash	StepFun · Apache 2.0	1395	±10		4,432	$0.10 / $0.30	262.1K
163	111-211	longcat-flash-chat	Meituan · MIT	1395	±21		794	$0.20 / $0.80	131.1K
164	117-201	gpt-5-mini-high	OpenAI · Proprietary	1394	±15		1,744	$0.13 / $1	400K
165	124-196	claude-3-7-sonnet-20250219	Anthropic · Proprietary	1394	±12		2,521	$3 / $15	200K
166	124-192	mimo-v2-flash (non-thinking)	Xiaomi · MIT	1393	±11		3,373	$0.10 / $0.30	262.1K
167	112-214	qwen3-235b-a22b-thinking-2507	Alibaba · Apache 2.0	1391	±24		551	$0.23 / $2.30	262.1K
168	124-206	o1-preview	OpenAI · Proprietary	1391	±14		1,945	$15 / $60	N/A
169	126-211	qwen2.5-max	Alibaba · Proprietary	1387	±14		1,871	N/A	N/A
170	127-214	deepseek-v3	DeepSeek · DeepSeek	1384	±16		1,312	$1.14 / $4.56	N/A
171	140-211	claude-3-5-sonnet-20241022	Anthropic · Proprietary	1383	±9		5,553	$3 / $15	200K
172	124-219	hunyuan-turbos-20250416	Tencent · Proprietary	1382	±21		742	N/A	N/A
173	100-250	gemma-3-12b-it	Google · Gemma	1382	±39		217	$0.05 / $0.15	131.1K
174	132-214	qwen3-30b-a3b-instruct-2507	Alibaba · Apache 2.0	1382	±15		1,511	$0.05 / $0.19	262.1K
175	115-237	glm-4-plus-0111	Z.ai · Proprietary	1381	±30		367	N/A	N/A
176	138-214	gemma-3-27b-it	Google · Gemma	1381	±11		2,738	$0.08 / $0.45	262.1K
177	136-214	gemini-2.5-flash-lite-preview-06-17-thinking	Google · Proprietary	1381	±13		2,137	$0.10 / $0.40	1M
178	139-214	gemini-2.0-flash-001	Google · Proprietary	1381	±12		2,600	$0.10 / $0.40	1M
179	126-219	glm-4.7-flash	Z.ai · MIT	1381	±20		840	$0.06 / $0.40	202.8K
180	135-216	gemini-2.0-flash-lite-preview-02-05	Google · Proprietary	1380	±15		1,435	$0.07 / $0.30	1M
181	123-242	qwen-plus-0125	Alibaba · Proprietary	1378	±28		392	$0.40 / $1.20	131.1K
182	135-219	grok-3-mini-high	SpaceXAI · Proprietary	1378	±17		1,193	$0.25 / $1.27	N/A
183	147-214	command-a-03-2025	Cohere · CC-BY-NC-4.0	1377	±10		3,528	$2.50 / $10	256K
184	145-218	trinity-large-thinking	Apache 2.0	1376	±13		2,305	$0.22 / $0.85	262.1K
185	145-219	gemini-advanced-0514	Google · Proprietary	1375	±14		2,962	N/A	N/A
186	147-219	glm-4.5-air	Z.ai · MIT	1373	±13		1,982	$0.13 / $0.85	131.1K
187	155-219	gpt-4o-2024-05-13	OpenAI · Proprietary	1371	±10		6,743	$5 / $15	128K
188	136-248	nvidia-nemotron-3-super-120b-a12b	Nvidia · NVIDIA Open Model	1369	±25		525	N/A	N/A
189	155-226	llama-3.1-405b-instruct-bf16	Meta · Llama 3.1 Community	1369	±13		2,330	$4 / $4	32.8K
190	158-224	llama-3.1-405b-instruct-fp8	Meta · Llama 3.1 Community	1369	±12		3,383	$4 / $4	32.8K
191	158-234	amazon-nova-experimental-chat-11-10	Amazon · Proprietary	1367	±14		1,855	N/A	N/A
192	152-242	mistral-small-2506	Mistral · Apache 2.0	1367	±17		1,190	$0.10 / $0.30	32K
193	162-229	gemini-1.5-pro-002	Google · Proprietary	1366	±11		3,342	$3.50 / $10.50	2.1M
194	162-232	minimax-m1	MiniMax · Apache 2.0	1366	±12		2,449	$0.55 / $2.20	1M
195	163-231	grok-2-2024-08-13	SpaceXAI · Proprietary	1365	±11		3,813	$2 / $10	131.1K
196	160-242	yi-lightning	Proprietary	1365	±15		1,697	N/A	N/A
197	130-262	glm-4.5v	Z.ai · MIT	1365	±33		287	$0.60 / $1.80	65.5K
198	161-240	qwen3-235b-a22b	Alibaba · Apache 2.0	1365	±14		1,755	$0.46 / $1.82	131.1K
199	154-250	qwen3-next-80b-a3b-thinking	Alibaba · Apache 2.0	1363	±20		881	$0.15 / $1.20	262.1K
200	162-255	o3-mini-high	OpenAI · Proprietary	1359	±18		1,023	$0.55 / $2.20	200K
201	166-252	grok-3-mini-beta	SpaceXAI · Proprietary	1357	±15		1,532	$0.30 / $0.50	131.1K
202	163-261	olmo-3.1-32b-instruct	Ai2 · Apache 2.0	1356	±20		925	$0.20 / $0.60	65.5K
203	155-263	minimax-m2	MiniMax · Apache 2.0	1355	±27		444	$0.26 / $1.02	204.8K
204	176-250	claude-3-5-sonnet-20240620	Anthropic · Proprietary	1354	±11		4,818	$3 / $15	200K
205	159-269	gpt-4.1-nano-2025-04-14	OpenAI · Proprietary	1352	±29		382	$0.10 / $0.40	1M
206	178-252	claude-3-5-haiku-20241022	Anthropic · Proprietary	1352	±10		4,300	$1 / $5	200K
207	176-261	glm-4-plus	Z.ai · Proprietary	1349	±15		1,723	$0.44 / $1.76	204.8K
208	149-278	nvidia-llama-3.3-nemotron-super-49b-v1.5	Nvidia · Nvidia Open	1349	±36		237	$0.10 / $0.40	131.1K
209	163-270	ling-flash-2.0	Ant Group · MIT	1349	±27		447	N/A	N/A
210	185-261	gpt-4o-2024-08-06	OpenAI · Proprietary	1347	±12		2,674	$2.50 / $10	128K
211	186-258	claude-3-opus-20240229	Anthropic · Proprietary	1347	±10		11,095	$15 / $75	200K
212	158-278	step-2-16k-exp-202412	StepFun · Proprietary	1347	±33		278	N/A	N/A
213	185-261	gpt-4o-mini-2024-07-18	OpenAI · Proprietary	1347	±11		3,866	$0.15 / $0.60	128K
214	146-284	granite-4.1-8b	IBM · Apache 2.0	1347	±41		239	$0.05 / $0.10	131.1K
215	155-284	amazon-nova-experimental-chat-10-09	Amazon · Proprietary	1344	±39		208	N/A	N/A
216	188-262	o1-mini	OpenAI · Proprietary	1343	±12		3,138	$1.10 / $4.40	N/A
217	191-262	llama-3.3-70b-instruct	Meta · Llama-3.3	1342	±11		3,191	$0.10 / $0.32	131.1K
218	187-263	llama-4-scout-17b-16e-instruct	Meta · Llama	1342	±14		2,028	$0.40 / $0.70	8.2K
219	191-263	llama-4-maverick-17b-128e-instruct	Meta · Llama 4	1341	±12		2,659	$0.63 / $1.80	131.1K
220	189-263	gpt-oss-120b	OpenAI · Apache 2.0	1340	±14		1,969	$0.03 / $0.17	131.1K
221	188-263	qwq-32b	Alibaba · Apache 2.0	1340	±14		1,660	$0.50 / $1	16.4K
222	193-263	o3-mini	OpenAI · Proprietary	1340	±10		3,665	$0.55 / $2.20	200K
223	163-285	gemma-3-4b-it	Google · Gemma	1339	±36		245	$0.05 / $0.10	131.1K
224	166-284	hunyuan-standard-2025-02-10	Tencent · Proprietary	1339	±34		288	N/A	N/A
225	159-287	solar-pro4	Upstage · Proprietary	1338	±42		210	$0.03 / $0.12	524.3K
226	193-263	mistral-large-2407	Mistral · Mistral Research	1338	±12		2,735	$2 / $6	131.1K
227	175-282	step-3	StepFun · Apache 2.0	1338	±28		424	$0.57 / $1.42	65.5K
228	196-265	gpt-4-turbo-2024-04-09	OpenAI · Proprietary	1336	±11		5,381	$10 / $30	128K
229	187-277	amazon-nova-experimental-chat-10-20	Amazon · Proprietary	1335	±21		825	N/A	N/A
230	163-290	nvidia-nemotron-3.5-lightning-30b-a3b-nvfp4	Nvidia · OpenMDW-1.1	1335	±40	Preliminary	245	N/A	N/A
231	167-287	hunyuan-large-2025-02-10	Tencent · Proprietary	1335	±36		252	N/A	N/A
232	186-282	step-1o-turbo-202506	StepFun · Proprietary	1333	±23		661	N/A	N/A
233	192-279	athene-70b-0725	CC-BY-NC-4.0	1332	±19		1,008	N/A	N/A
234	196-273	gemini-1.5-pro-001	Google · Proprietary	1332	±12		4,795	$3.50 / $10.50	2.1M
235	192-281	nova-2-lite	Amazon · Proprietary	1331	±20		895	$0.30 / $2.50	1M
236	197-275	qwen2.5-72b-instruct	Alibaba · Qwen	1331	±13		2,386	$1.20 / $1.20	N/A
237	175-291	llama-3.1-nemotron-51b-instruct	Nvidia · Llama 3.1	1330	±36		230	N/A	N/A
238	196-277	deepseek-v2.5	DeepSeek · DeepSeek	1330	±15		1,518	N/A	N/A
239	185-287	intellect-3	MIT	1329	±29		406	$0.20 / $1.10	131.1K
240	202-275	grok-2-mini-2024-08-13	SpaceXAI · Proprietary	1329	±12		3,012	$2 / $10	131.1K
241	185-287	reka-core-20240904	Proprietary	1328	±29		371	N/A	N/A
242	203-275	llama-3.1-70b-instruct	Meta · Llama 3.1 Community	1328	±12		3,177	$0.40 / $0.40	131.1K
243	190-287	llama-3.1-nemotron-70b-instruct	Nvidia · Llama 3.1	1327	±27		489	$1.20 / $1.20	131.1K
244	200-282	athene-v2-chat	NexusFlow	1327	±16		1,443	N/A	N/A
245	203-278	gemini-1.5-flash-002	Google · Proprietary	1327	±13		2,160	$0.07 / $0.30	1M
246	185-291	qwen3-32b	Alibaba · Apache 2.0	1326	±32		285	$0.08 / $0.28	131.1K
247	192-285	gemma-2-9b-it-simpo	MIT	1326	±25		543	$0.03 / $0.09	8.2K
248	190-287	gpt-5-nano-high	OpenAI · Proprietary	1326	±27		483	$0.03 / $0.20	400K
249	196-283	qwen-max-0919	Alibaba · Qwen	1326	±18		1,085	$1.60 / $6.40	32.8K
250	187-287	deepseek-v2.5-1210	DeepSeek · DeepSeek	1326	±29		375	N/A	N/A
251	202-282	mistral-large-2411	Mistral · MRL	1326	±15		1,593	$2 / $6	128K
252	191-287	jamba-1.5-large	Jamba Open	1326	±27		448	$2 / $8	256K
253	202-282	amazon-nova-pro-v1.0	Amazon · Proprietary	1325	±16		1,296	$0.80 / $3.20	300K
254	204-278	gpt-4-0125-preview	OpenAI · Proprietary	1325	±12		5,037	$10 / $30	128K
255	196-287	qwen2.5-plus-1127	Alibaba · Proprietary	1325	±24		588	N/A	N/A
256	203-282	gemma-3n-e4b-it	Google · Gemma	1324	±16		1,422	$0.06 / $0.12	32.8K
257	204-282	qwen3-30b-a3b	Alibaba · Apache 2.0	1323	±14		1,796	$0.13 / $0.52	131.1K
258	196-287	gpt-oss-20b	OpenAI · Apache 2.0	1321	±23		705	$0.03 / $0.13	131.1K
259	200-290	command-r-plus-08-2024	Cohere · CC-BY-NC-4.0	1319	±23		592	$2.50 / $10	128K
260	208-289	nemotron-4-340b-instruct	Nvidia · NVIDIA Open Model	1314	±18		1,177	N/A	N/A
261	218-285	gpt-4-1106-preview	OpenAI · Proprietary	1314	±11		5,572	$10 / $30	128K
262	204-295	glm-4-0520	Z.ai · Proprietary	1312	±25		556	N/A	N/A
263	219-287	command-r-plus	Cohere · CC-BY-NC-4.0	1312	±12		4,403	$2.50 / $10	128K
264	221-287	gemma-2-27b-it	Google · Gemma license	1311	±10		4,458	$0.65 / $0.65	8.2K
265	197-301	qwen2.5-coder-32b-instruct	Alibaba · Apache 2.0	1309	±34		273	$0.87 / $0.87	32K
266	221-290	mistral-small-3.1-24b-instruct-2503	Mistral · Apache 2.0	1308	±13		2,186	$0.10 / $0.30	32K
267	219-294	nvidia-nemotron-3-nano-30b-a3b-bf16	Nvidia · NVIDIA Open Model	1307	±17		1,210	$0.06 / $0.24	262.1K
268	222-291	gemini-1.5-flash-001	Google · Proprietary	1306	±12		3,784	$0.07 / $0.30	1M
269	225-292	claude-3-sonnet-20240229	Anthropic · Proprietary	1303	±12		6,062	$3 / $15	200K
270	219-300	magistral-medium-2506	Mistral · Proprietary	1303	±22		869	$2 / $5	40K
271	211-302	olmo-3-32b-think	Ai2 · Apache 2.0	1302	±29		436	$0.15 / $0.50	65.5K
272	233-294	llama-3-70b-instruct	Meta · Llama 3 Community	1301	±11		8,328	$0.51 / $0.74	8.2K
273	218-301	command-r-08-2024	Cohere · CC-BY-NC-4.0	1301	±24		569	$0.15 / $0.60	128K
274	231-299	c4ai-aya-expanse-32b	Cohere · CC-BY-NC-4.0	1299	±15		1,742	N/A	N/A
275	225-300	phi-4	Microsoft · MIT	1298	±17		1,341	$0.07 / $0.14	16.4K
276	221-302	olmo-3.1-32b-think	Ai2 · Apache 2.0	1297	±24		649	$0.15 / $0.50	65.5K
277	240-301	gpt-4-0314	OpenAI · Proprietary	1294	±14		2,897	$30 / $60	8.2K
278	241-301	gemini-1.5-flash-8b-001	Google · Proprietary	1293	±14		2,128	$0.07 / $0.30	1M
279	219-306	hunyuan-large-vision	Tencent · Proprietary	1292	±31		400	N/A	N/A
280	222-305	ring-flash-2.0	Ant Group · MIT	1290	±28		457	N/A	N/A
281	220-311	ibm-granite-h-small	IBM · Apache 2.0	1289	±34		331	N/A	N/A
282	232-307	jamba-1.5-mini	Jamba Open	1286	±25		531	$0.20 / $0.40	256K
283	259-302	claude-3-haiku-20240307	Anthropic · Proprietary	1285	±11		6,799	$0.25 / $1.25	200K
284	227-311	reka-flash-20240904	Proprietary	1285	±30		414	N/A	N/A
285	259-302	gemma-2-9b-it	Google · Gemma license	1285	±12		3,243	$0.03 / $0.09	8.2K
286	247-305	amazon-nova-lite-v1.0	Amazon · Proprietary	1283	±18		1,079	$0.06 / $0.24	300K
287	247-307	reka-flash-21b-20240226-online	Proprietary	1281	±21		876	N/A	N/A
288	266-305	command-r	Cohere · CC-BY-NC-4.0	1280	±14		3,073	$0.15 / $0.60	128K
289	260-311	mistral-small-24b-instruct-2501	Mistral · Apache 2.0	1275	±21		869	$0.05 / $0.08	32.8K
290	263-311	deepseek-coder-v2	DeepSeek · DeepSeek License	1275	±20		888	$0.14 / $0.28	128K
291	270-307	qwen2-72b-instruct	Alibaba · Qianwen LICENSE	1273	±14		2,262	$0.90 / $0.90	32.8K
292	270-307	gpt-4-0613	OpenAI · Proprietary	1272	±12		4,695	$30 / $60	8.2K
293	232-319	olmo-2-0325-32b-instruct	Ai2 · Apache-2.0	1272	±40		202	$0.05 / $0.20	128K
294	244-317	ministral-8b-2410	Mistral · MRL	1270	±34		324	$0.10 / $0.10	131.1K
295	271-311	mistral-large-2402	Mistral · Proprietary	1268	±14		3,306	$4 / $12	32K
296	270-311	qwen1.5-110b-chat	Alibaba · Qianwen LICENSE	1268	±17		1,506	N/A	N/A
297	269-315	gemini-pro-dev-api	Google · Proprietary	1266	±21		970	$0.35 / $1.05	32.8K
298	270-312	amazon-nova-micro-v1.0	Amazon · Proprietary	1266	±19		1,082	$0.04 / $0.14	128K
299	267-316	c4ai-aya-expanse-8b	Cohere · CC-BY-NC-4.0	1265	±25		551	N/A	N/A
300	273-315	reka-flash-21b-20240226	Proprietary	1262	±18		1,350	N/A	N/A
301	277-315	qwen1.5-72b-chat	Alibaba · Qianwen LICENSE	1259	±15		2,091	N/A	N/A
302	281-316	mixtral-8x22b-instruct-v0.1	Mistral · Apache 2.0	1255	±14		2,798	$0.90 / $0.90	65.5K
303	281-317	mistral-medium	Mistral · Proprietary	1252	±16		1,811	$2.70 / $8.10	32K
304	281-319	yi-1.5-34b-chat	Apache-2.0	1251	±17		1,510	N/A	N/A
305	267-338	granite-3.1-8b-instruct	IBM · Apache 2.0	1250	±41		215	N/A	N/A
306	284-317	gpt-3.5-turbo-0125	OpenAI · Proprietary	1249	±13		3,573	$0.50 / $1.50	16.4K
307	289-319	llama-3.1-8b-instruct	Meta · Llama 3.1 Community	1246	±12		2,882	$0.05 / $0.08	131.1K
308	289-319	llama-3-8b-instruct	Meta · Llama 3 Community	1246	±12		5,578	$0.14 / $0.14	8.2K
309	289-341	openchat-3.5	Apache-2.0	1229	±28		467	$0.20 / $0.20	N/A
310	296-337	qwen1.5-32b-chat	Alibaba · Qianwen LICENSE	1228	±18		1,227	N/A	N/A
311	301-335	mixtral-8x7b-instruct-v0.1	Mistral · Apache 2.0	1224	±13		3,953	$0.63 / $0.63	32K
312	289-343	gemini-pro	Google · Proprietary	1223	±34		309	$0.35 / $1.05	32.8K
313	285-346	zephyr-orpo-141b-A35b-v0.1	Apache 2.0	1223	±38		240	N/A	N/A
314	304-337	gemma-2-2b-it	Google · Gemma license	1222	±13		2,655	N/A	N/A
315	299-341	yi-34b-chat	Yi License	1220	±22		857	$0.90 / $0.90	4.1K
316	296-344	wizardlm-70b	Microsoft · Llama 2 Community	1218	±29		434	N/A	N/A
317	295-345	tulu-2-dpo-70b	AI2 ImpACT Low-risk	1217	±30		377	N/A	N/A
318	308-342	phi-3-medium-4k-instruct	Microsoft · MIT	1211	±17		1,474	$0.17 / $0.68	N/A
319	296-352	openhermes-2.5-mistral-7b	Apache-2.0	1210	±36		275	$0.17 / $0.17	N/A
320	308-342	gemma-1.1-7b-it	Google · Gemma license	1210	±17		1,416	$0.03 / $0.09	8.2K
321	308-345	starling-lm-7b-beta	Apache-2.0	1208	±21		878	N/A	N/A
322	308-343	dbrx-instruct-preview	DBRX LICENSE	1208	±17		1,748	$0.60 / $0.60	32.8K
323	308-346	openchat-3.5-0106	Apache-2.0	1205	±24		637	N/A	N/A
324	308-346	qwen1.5-14b-chat	Alibaba · Qianwen LICENSE	1205	±20		1,037	$0.30 / $0.30	N/A
325	308-346	gpt-3.5-turbo-1106	OpenAI · Proprietary	1203	±23		944	$1 / $2	16.4K
326	308-352	starling-lm-7b-alpha	CC-BY-NC-4.0	1203	±27		504	N/A	N/A
327	304-354	deepseek-llm-67b-chat	DeepSeek · DeepSeek License	1200	±35		300	N/A	N/A
328	308-347	snowflake-arctic-instruct	Apache 2.0	1197	±18		1,535	N/A	N/A
329	308-354	wizardlm-13b	Microsoft · Llama 2 Community	1193	±32		365	$0.30 / $0.30	N/A
330	308-352	phi-3-small-8k-instruct	Microsoft · MIT	1193	±18		1,187	$0.15 / $0.60	N/A
331	308-354	internlm2_5-20b-chat	Other	1193	±24		685	$0 / $0	32.8K
332	308-355	granite-3.0-8b-instruct	IBM · Apache 2.0	1192	±34		428	N/A	N/A
333	312-352	llama-2-70b-chat	Meta · Llama 2 Community	1190	±16		2,073	$0.70 / $2.80	4.1K
334	311-354	vicuna-33b	Non-commercial	1189	±19		1,246	$0 / $0	2K
335	308-354	llama-3.2-3b-instruct	Meta · Llama 3.2	1188	±28		506	$0.05 / $0.33	131.1K
336	309-355	zephyr-7b-beta	MIT	1185	±26		621	$0.15 / $0.15	16.4K
337	312-354	mistral-7b-instruct-v0.2	Mistral · Apache-2.0	1183	±21		976	$0.20 / $0.20	32.8K
338	308-358	solar-10.7b-instruct-v1.0	CC-BY-NC-4.0	1181	±39		219	$0.30 / $0.30	N/A
339	309-357	granite-3.0-2b-instruct	IBM · Apache 2.0	1179	±32		435	N/A	N/A
340	308-360	qwen1.5-7b-chat	Alibaba · Qianwen LICENSE	1178	±41		230	$0.20 / $0.20	N/A
341	312-361	qwen-14b-chat	Alibaba · Qianwen LICENSE	1170	±37		274	N/A	N/A
342	316-356	vicuna-13b	Llama 2 Community	1170	±22		899	$0.30 / $0.30	N/A
343	318-362	codellama-34b-instruct	Meta · Llama 2 Community	1157	±32		383	$0.35 / $1.40	16.4K
344	321-362	gemma-7b-it	Google · Gemma license	1157	±29		462	$0.05 / $0.08	8.2K
345	319-362	palm-2	Google · Proprietary	1155	±32		428	$0.50 / $0.50	25.8K
346	326-361	llama-2-13b-chat	Meta · Llama 2 Community	1155	±21		1,004	$0.25 / $0.25	4.1K
347	314-363	qwq-32b-preview	Alibaba · Apache 2.0	1154	±42		214	$0.50 / $1	16.4K
348	330-361	phi-3-mini-4k-instruct	Microsoft · MIT	1154	±19		1,126	$0.13 / $0.52	N/A
349	326-362	phi-3-mini-4k-instruct-june-2024	Microsoft · MIT	1153	±25		706	$0.13 / $0.52	4.1K
350	326-363	llama-3.2-1b-instruct	Meta · Llama 3.2	1149	±30		489	$0.03 / $0.20	60K
351	326-363	mistral-7b-instruct	Mistral · Apache 2.0	1148	±29		487	$0.07 / $0.28	4.1K
352	325-363	vicuna-7b	Llama 2 Community	1145	±35		305	$0.20 / $0.20	N/A
353	326-364	gemma-2b-it	Google · Gemma license	1139	±38		273	$0.10 / $0.10	N/A
354	330-363	qwen1.5-4b-chat	Alibaba · Qianwen LICENSE	1138	±32		390	$0.10 / $0.10	N/A
355	336-363	llama-2-7b-chat	Meta · Llama 2 Community	1137	±23		760	$0.15 / $0.15	4.1K
356	340-364	gemma-1.1-2b-it	Google · Gemma license	1119	±28		578	N/A	N/A
357	341-364	phi-3-mini-128k-instruct	Microsoft · MIT	1116	±23		1,033	$0.13 / $0.52	N/A
358	339-364	stripedhyena-nous-7b	Apache 2.0	1112	±35		309	$0.20 / $0.20	N/A
359	338-365	RWKV-4-Raven-14B	Apache 2.0	1109	±47		190	N/A	N/A
360	341-365	olmo-7b-instruct	Ai2 · Apache-2.0	1104	±35		301	$0.20 / $0.20	N/A
361	342-365	alpaca-13b	Non-commercial	1091	±43		230	N/A	N/A
362	345-365	chatglm3-6b	Apache-2.0	1090	±41		268	N/A	N/A
363	349-366	koala-13b	Non-commercial	1079	±40		248	N/A	N/A
364	355-366	oasst-pythia-12b	Apache 2.0	1064	±41		266	N/A	N/A
365	359-366	fastchat-t5-3b	Apache 2.0	1030	±46		184	N/A	N/A
366	363-366	chatglm-6b	Non-commercial	992	±47		195	N/A	N/A
```

## Category: Occupational: Medicine & Healthcare (adjustment: None)

Source: https://arena.ai, Text Arena leaderboard, Categories panel, "Occupational: Medicine & Healthcare" selected, Adjustments = None.
Date shown on page: Aug 19, 2026. Votes: 458,875. Models: 361. Captured row count: 361 (verified match).

```
1	1-54	glm-5.3-max	Z.ai · MIT	1534	±43		209	$1.40 / $4.40	1M
2	1-65	muse-spark-1.2 (xHigh)	Meta · Proprietary	1524	±39		230	$1.25 / $4.25	N/A
3	1-21	claude-opus-4-7-high	Anthropic · Proprietary	1520	±10		4,492	$5 / $25	1M
4	1-21	claude-opus-4-6-high	Anthropic · Proprietary	1520	±9		5,382	$5 / $25	1M
5	1-54	qwen3.8-max	Alibaba · Proprietary	1516	±25		591	$2 / $6	1M
6	1-25	claude-opus-4-6	Anthropic · Proprietary	1515	±9		5,654	$5 / $25	1M
7	1-29	claude-opus-4-7	Anthropic · Proprietary	1513	±10		4,545	$5 / $25	1M
8	1-42	gemini-3-pro	Google · Proprietary	1509	±12		2,584	$2 / $12	1M
9	1-52	claude-fable-5	Anthropic · Proprietary	1507	±15		1,641	$10 / $50	1M
10	1-64	kimi-k3-max	Moonshot · Kimi K3 license	1505	±19		961	N/A	N/A
11	1-67	muse-spark	Meta · Proprietary	1503	±20		954	N/A	N/A
12	1-52	grok-4.1-thinking	SpaceXAI · Proprietary	1502	±10		4,370	N/A	N/A
13	3-51	gemini-3.1-pro-preview	Google · Proprietary	1501	±8		7,239	$1 / $6	1M
14	1-59	gpt-5.2-chat-latest-20260210	OpenAI · Proprietary	1501	±13		2,463	$1.75 / $14	128K
15	1-67	claude-opus-5-high	Anthropic · Proprietary	1498	±14		1,959	$5 / $25	1M
16	3-62	claude-opus-4-8-high	Anthropic · Proprietary	1498	±11		3,262	$5 / $25	1M
17	1-67	grok-4.20-beta1	SpaceXAI · Proprietary	1497	±14		1,937	N/A	N/A
18	3-63	claude-opus-4-8	Anthropic · Proprietary	1497	±11		3,233	$5 / $25	1M
19	1-76	claude-opus-5-max	Anthropic · Proprietary	1496	±20		942	$5 / $25	1M
20	1-104	hy3	Tencent · Apache 2.0	1494	±31		378	$0.13 / $0.53	262.1K
21	1-105	gemini-3.7-flash-high	Google · Proprietary	1494	±32	Preliminary	379	$0.75 / $3.57	1M
22	4-70	ernie-5.1	Baidu · Proprietary	1494	±12		2,683	N/A	N/A
23	3-75	qwen3.5-max-preview	Alibaba · Proprietary	1492	±16		1,566	$1.20 / $6	N/A
24	4-74	gemini-3.5-flash-high	Google · Proprietary	1492	±14		2,093	$0.75 / $4.50	1M
25	5-68	claude-sonnet-4-6	Anthropic · Proprietary	1492	±9		5,038	$1.50 / $7.50	1M
26	1-93	ernie-5.0-preview-1203	Baidu · Proprietary	1491	±23		683	N/A	N/A
27	5-72	dola-seed-2.0-pro	Bytedance · Proprietary	1490	±9		5,469	N/A	N/A
28	5-75	mimo-v2.5-pro	Xiaomi · MIT	1488	±11		3,797	$0.43 / $0.87	1.1M
29	1-118	qwen3.6-max-preview	Alibaba · Proprietary	1488	±32		358	$1.03 / $6.16	262.1K
30	6-75	grok-4.20-beta-0309-reasoning	SpaceXAI · Proprietary	1487	±10		4,576	$1.25 / $2.50	1M
31	6-74	claude-opus-4-5-20251101	Anthropic · Proprietary	1487	±9		4,736	$5 / $25	200K
32	5-82	glm-5.2-max	Z.ai · MIT	1487	±14		2,136	$1.40 / $4.40	1M
33	4-88	muse-spark-1.1	Meta · Proprietary	1487	±17		1,424	$1.25 / $4.25	N/A
34	5-84	gpt-5.5-instant	OpenAI · Proprietary	1487	±14		1,960	$2.50 / $15	1.1M
35	5-83	claude-opus-4-5-20251101-high-32k	Anthropic · Proprietary	1486	±13		2,376	$5 / $25	200K
36	6-76	grok-4.1	SpaceXAI · Proprietary	1486	±10		4,442	N/A	N/A
37	6-81	deepseek-v4-pro-high-preview	DeepSeek · MIT	1485	±11		3,582	$1.32 / $3.96	1M
38	5-88	gemini-3.5-flash-medium	Google · Proprietary	1485	±14		1,990	$0.75 / $4.50	1M
39	5-85	gemini-3-flash	Google · Proprietary	1485	±13		2,110	$0.50 / $3	1M
40	6-82	gpt-5.5	OpenAI · Proprietary	1484	±10		4,505	$2.50 / $15	1.1M
41	5-94	gemini-3.6-flash-high	Google · Proprietary	1484	±18		1,223	$0.38 / $1.88	1M
42	6-85	glm-5.1	Z.ai · MIT	1483	±11		3,015	$1.40 / $4.40	202.8K
43	11-87	grok-4.20-multi-agent-beta-0309	SpaceXAI · Proprietary	1481	±10		4,483	$1.25 / $2.50	1M
44	5-109	glm-4.7	Z.ai · MIT	1481	±20		818	$0.40 / $1.75	204.8K
45	6-102	gpt-5.6-sol-xhigh	OpenAI · Proprietary	1480	±17		1,356	$5 / $30	N/A
46	7-94	gpt-5.3-chat-latest	OpenAI · Proprietary	1480	±13		2,456	$1.75 / $14	128K
47	12-93	chatgpt-4o-latest-20250326	OpenAI · Proprietary	1478	±9		4,633	$5 / $15	128K
48	12-93	gpt-5.5-high	OpenAI · Proprietary	1478	±10		4,402	$2.50 / $15	1.1M
49	13-93	gemini-3-flash (thinking-minimal)	Google · Proprietary	1478	±8		6,287	$0.50 / $3	1M
50	6-109	gemini-3.5-flash-lite	Google · Proprietary	1478	±18		1,227	$0.15 / $1.25	1M
51	11-94	claude-opus-4-1-20250805-thinking-16k	Anthropic · Proprietary	1477	±12		2,689	$15 / $75	200K
52	9-104	claude-sonnet-5-high	Anthropic · Proprietary	1477	±14		1,889	$1 / $5	1M
53	12-94	deepseek-v4-pro	DeepSeek · MIT	1477	±11		3,765	$1.32 / $3.96	1M
54	11-104	glm-5	Z.ai · MIT	1477	±13		2,034	$1 / $3.20	202.8K
55	1-142	qwen3.7-max-preview	Alibaba · Proprietary	1476	±35		296	$1.48 / $4.42	1M
56	14-95	gpt-5.4-high	OpenAI · Proprietary	1475	±10		4,469	$2.50 / $15	1.1M
57	5-130	deepseek-v3.2-exp-thinking	DeepSeek · MIT	1474	±28		444	$0.27 / $0.41	163.8K
58	15-104	o3-2025-04-16	OpenAI · Proprietary	1474	±11		3,346	$2 / $8	200K
59	19-102	claude-opus-4-1-20250805	Anthropic · Proprietary	1473	±10		4,392	$15 / $75	200K
60	20-102	claude-sonnet-4-5-20250929	Anthropic · Proprietary	1473	±9		5,208	$3 / $15	200K
61	11-116	qwen3-max-preview	Alibaba · Proprietary	1473	±16		1,473	$0.78 / $3.90	262.1K
62	11-117	grok-4.5	SpaceXAI · Proprietary	1473	±16		1,529	$2 / $6	500K
63	16-112	qwen3.7-plus	Alibaba · Proprietary	1472	±13		2,327	$0.32 / $1.28	1M
64	16-112	ernie-5.0-0110	Baidu · Proprietary	1471	±12		2,405	N/A	N/A
65	22-107	claude-sonnet-4-5-20250929-high-32k	Anthropic · Proprietary	1471	±9		5,249	$3 / $15	200K
66	20-116	gpt-5.1-high	OpenAI · Proprietary	1470	±12		2,540	$0.63 / $5	400K
67	21-116	kimi-k2.6	Moonshot · Modified MIT	1469	±12		2,698	$0.95 / $4	262.1K
68	29-109	gemini-2.5-pro	Google · Proprietary	1468	±7		7,874	$0.63 / $5	1M
69	24-113	gpt-5.4	OpenAI · Proprietary	1468	±10		4,688	$2.50 / $15	1.1M
70	6-143	gemma-4-31b	Google · Apache 2.0	1468	±28		412	$0.14 / $0.40	262.1K
71	22-121	minimax-m3	MiniMax · MiniMax Community License	1467	±12		2,725	$0.60 / $2.40	N/A
72	21-126	mimo-v2-pro	Xiaomi · Proprietary	1467	±15		1,713	$1 / $3	1M
73	4-149	grok-4.6-high	SpaceXAI · Proprietary	1467	±37	Preliminary	233	$2 / $6	500K
74	29-116	kimi-k2.5-thinking	Moonshot · Modified MIT	1466	±9		4,841	$0.60 / $3	N/A
75	5-151	deepseek-v3.1-terminus-thinking	DeepSeek · MIT	1465	±37		230	$0.27 / $1	163.8K
76	32-120	qwen3.5-397b-a17b	Alibaba · Apache 2.0	1464	±9		5,175	$0.39 / $2.34	262.1K
77	29-125	deepseek-v4-flash-high-preview	DeepSeek · MIT	1463	±11		3,494	$0.44 / $1.32	1M
78	29-128	gpt-5.1	OpenAI · Proprietary	1463	±12		2,674	$0.63 / $5	400K
79	5-160	muse-glimmer	Meta · Apache-2.0	1460	±39		251	N/A	N/A
80	36-129	qwen3.6-plus	Alibaba · Proprietary	1460	±11		3,227	$0.33 / $1.95	1M
81	39-129	deepseek-v4-flash	DeepSeek · MIT	1459	±11		3,430	$0.44 / $1.32	1M
82	34-131	longcat-flash-chat-2602-exp	Meituan · Proprietary	1458	±14		1,968	N/A	N/A
83	43-129	gpt-5.2	OpenAI · Proprietary	1458	±9		5,794	$0.88 / $7	400K
84	36-140	gpt-5-high	OpenAI · Proprietary	1456	±15		1,793	$0.63 / $5	400K
85	37-140	gpt-5-chat	OpenAI · Proprietary	1456	±15		1,698	$1.25 / $10	N/A
86	48-129	qwen3-235b-a22b-instruct-2507	Alibaba · Apache 2.0	1456	±8		5,807	$0.26 / $1.06	N/A
87	47-131	grok-4.3	SpaceXAI · Proprietary	1456	±10		4,438	$1.25 / $2.50	1M
88	48-130	gemini-3.1-flash-lite-preview	Google · Proprietary	1456	±10		4,508	$0.25 / $1.50	1M
89	9-168	deepseek-v3.1-terminus	DeepSeek · MIT	1454	±38		261	$0.27 / $1	163.8K
90	39-144	gpt-5.6-terra-xhigh	OpenAI · Proprietary	1453	±17		1,410	$2.50 / $15	N/A
91	39-144	mimo-v2-omni	Xiaomi · Proprietary	1453	±17		1,327	$0.40 / $2	262.1K
92	51-140	gpt-5.2-high	OpenAI · Proprietary	1452	±11		3,363	$0.88 / $7	400K
93	56-137	gpt-5.4-mini-high	OpenAI · Proprietary	1452	±10		4,439	$0.75 / $4.50	400K
94	30-156	gpt-4.5-preview-2025-02-27	OpenAI · Proprietary	1450	±24		589	$75 / $150	128K
95	55-144	glm-4.6	Z.ai · MIT	1449	±14		1,915	$0.50 / $2	204.8K
96	60-144	mimo-v2.5	Xiaomi · MIT	1448	±11		3,162	$0.14 / $0.28	1.1M
97	48-149	inkling	Thinky · Apache 2.0	1448	±17		1,209	$1 / $4.05	524.3K
98	67-144	grok-4-1-fast-reasoning	SpaceXAI · Proprietary	1447	±10		3,725	$0.20 / $0.50	2M
99	63-144	claude-opus-4-20250514	Anthropic · Proprietary	1446	±12		2,648	$15 / $75	200K
100	69-144	kimi-k2-thinking-turbo	Moonshot · Modified MIT	1445	±10		3,902	$1.15 / $8	262.1K
101	29-170	grok-4-fast-chat	SpaceXAI · Proprietary	1445	±30		398	$3 / $15	256K
102	60-149	grok-3-preview-02-24	SpaceXAI · Proprietary	1444	±15		1,627	$3 / $15	131.1K
103	71-149	deepseek-v3.2	DeepSeek · MIT	1443	±11		3,040	$0.27 / $0.40	163.8K
104	48-160	deepseek-v3.1-thinking	DeepSeek · MIT	1443	±22		709	$1.23 / $4.94	N/A
105	63-151	kimi-k2-0711-preview	Moonshot · Modified MIT	1443	±15		1,713	$0.60 / $2.50	131.1K
106	48-161	kimi-k2-0905-preview	Moonshot · Modified MIT	1443	±22		726	$0.60 / $2.50	262.1K
107	48-163	longcat-flash-chat	Meituan · MIT	1442	±23		674	$0.20 / $0.80	131.1K
108	60-158	deepseek-r1-0528	DeepSeek · MIT	1442	±18		1,243	$0.50 / $2.15	163.8K
109	70-151	claude-opus-4-20250514-thinking-16k	Anthropic · Proprietary	1442	±13		2,260	$15 / $75	200K
110	73-153	grok-4-0709	SpaceXAI · Proprietary	1439	±13		2,294	$3 / $15	256K
111	51-170	hunyuan-turbos-20250416	Tencent · Proprietary	1439	±25		591	N/A	N/A
112	27-183	hunyuan-t1-20250711	Tencent · Proprietary	1439	±37		263	N/A	N/A
113	69-160	qwen3-next-80b-a3b-instruct	Alibaba · Apache 2.0	1438	±17		1,184	$0.09 / $1.10	262.1K
114	57-170	deepseek-v3.2-exp	DeepSeek · MIT	1438	±24		595	$0.27 / $0.41	163.8K
115	56-171	kimi-k2.5-instant	Moonshot · Modified MIT	1437	±25		546	$0.45 / $2.25	262.1K
116	33-184	ernie-5.0-preview-1022	Baidu · Proprietary	1436	±37		244	N/A	N/A
117	72-161	gpt-5.6-luna-xhigh	OpenAI · Proprietary	1436	±16		1,456	$1 / $6	N/A
118	73-162	glm-4.5	Z.ai · MIT	1435	±16		1,396	$0.60 / $2.20	131.1K
119	71-168	deepseek-v3.1	DeepSeek · MIT	1435	±19		952	$1.23 / $4.94	N/A
120	71-170	grok-4-fast-reasoning	SpaceXAI · Proprietary	1435	±20		884	$0.20 / $0.50	2M
121	48-183	gemma-4-26b-a4b	Google · Apache 2.0	1434	±30		371	N/A	N/A
122	57-180	qwen3-max-2025-09-23	Alibaba · Proprietary	1434	±27		451	$0.78 / $3.90	262.1K
123	39-188	amazon-nova-experimental-chat-26-01-10	Amazon · Proprietary	1433	±37		241	N/A	N/A
124	63-176	qwen3-vl-235b-a22b-instruct	Alibaba · Apache 2.0	1433	±24		634	$0.21 / $1.90	262.1K
125	86-157	mistral-medium-2508	Mistral · Proprietary	1433	±8		5,883	$0.40 / $2	131.1K
126	83-158	mistral-large-3	Mistral · Apache 2.0	1433	±10		4,263	$0.50 / $1.50	N/A
127	62-180	qwen3-235b-a22b-thinking-2507	Alibaba · Apache 2.0	1433	±26		522	$0.23 / $2.30	262.1K
128	39-188	amazon-nova-experimental-chat-12-10	Amazon · Proprietary	1433	±38		234	N/A	N/A
129	80-162	qwen3.5-122b-a10b	Alibaba · Apache 2.0	1433	±13		2,072	$0.26 / $2.08	262.1K
130	71-171	nvidia-nemotron-3-ultra-550b-a55b-nvfp4	Nvidia · OpenMDW-1.1	1432	±21		802	N/A	N/A
131	82-161	deepseek-v3.2-thinking	DeepSeek · MIT	1432	±12		2,746	$0.27 / $0.40	163.8K
132	82-162	gpt-4.1-2025-04-14	OpenAI · Proprietary	1431	±12		2,816	$2 / $8	1M
133	86-161	minimax-m2.7	MiniMax · Modified MIT	1431	±10		4,179	$0.30 / $1.20	204.8K
134	83-168	qwen3.5-35b-a3b	Alibaba · Apache 2.0	1429	±13		2,184	$0.25 / $1.25	262.1K
135	82-170	qwen3.5-27b	Alibaba · Apache 2.0	1429	±14		1,935	$0.20 / $1.56	262.1K
136	82-170	gemini-2.5-flash-preview-09-2025	Google · Proprietary	1428	±15		1,674	$0.30 / $2.50	1M
137	68-186	hunyuan-hy3-preview	Tencent · tencent-hunyuan-community	1428	±29		460	$0.29 / $1.17	262.1K
138	87-170	qwen3-235b-a22b-no-thinking	Alibaba · Apache 2.0	1427	±13		2,351	$0.46 / $1.82	131.1K
139	88-170	deepseek-v3-0324	DeepSeek · MIT	1427	±12		2,676	$3 / $4.50	32.8K
140	74-183	glm-5v-turbo	Z.ai · Proprietary	1427	±24		648	$1.20 / $4	202.8K
141	95-162	gemini-2.5-flash	Google · Proprietary	1426	±7		7,787	$0.15 / $1.25	1M
142	95-167	claude-haiku-4-5-20251001	Anthropic · Proprietary	1425	±8		8,016	$1 / $5	200K
143	82-184	mistral-medium-3.5	Mistral · Modified MIT	1422	±22		804	$1.50 / $7.50	262.1K
144	95-179	claude-sonnet-4-20250514	Anthropic · Proprietary	1420	±13		2,404	$3 / $15	1M
145	95-182	mistral-medium-2505	Mistral · Proprietary	1419	±14		1,989	$0.40 / $2	131.1K
146	99-183	o4-mini-2025-04-16	OpenAI · Proprietary	1417	±12		2,514	$1.10 / $4.40	200K
147	99-183	claude-sonnet-4-20250514-thinking-32k	Anthropic · Proprietary	1416	±13		2,174	$3 / $15	1M
148	82-197	qwen3-vl-235b-a22b-thinking	Alibaba · Apache 2.0	1415	±28		437	$0.40 / $4	131.1K
149	103-182	gpt-5.4-nano-high	OpenAI · Proprietary	1415	±10		4,439	$0.20 / $1.25	400K
150	78-201	glm-4-plus-0111	Z.ai · Proprietary	1414	±34		293	N/A	N/A
151	107-183	qwen3.5-flash	Alibaba · Proprietary	1413	±10		4,076	N/A	N/A
152	95-191	deepseek-r1	DeepSeek · MIT	1412	±21		830	$0.70 / $2.50	64K
153	103-186	trinity-large-preview	Apache 2.0	1412	±14		2,227	$0.15 / $0.45	131K
154	103-189	qwen3-coder-480b-a35b-instruct	Alibaba · Apache 2.0	1410	±16		1,518	$0.40 / $1.60	262.1K
155	107-188	claude-3-7-sonnet-20250219-thinking-32k	Anthropic · Proprietary	1409	±13		2,279	$3 / $15	200K
156	110-186	minimax-m2.5	MiniMax · Modified MIT	1409	±12		3,067	$0.23 / $0.90	204.8K
157	83-213	amazon-nova-experimental-chat-26-02-10	Amazon · Proprietary	1406	±37		216	N/A	N/A
158	102-199	mimo-v2-flash (thinking)	Xiaomi · MIT	1405	±22		700	$0.10 / $0.30	262.1K
159	120-191	gemma-3-27b-it	Google · Gemma	1404	±13		2,370	$0.08 / $0.45	262.1K
160	119-194	gemini-2.5-flash-lite-preview-06-17-thinking	Google · Proprietary	1404	±14		2,001	$0.10 / $0.40	1M
161	114-197	gpt-5-mini-high	OpenAI · Proprietary	1403	±16		1,431	$0.13 / $1	400K
162	104-201	Inkling Small	Thinky · Apache 2.0	1403	±22		765	$0.45 / $1.20	524.3K
163	123-199	qwen3-30b-a3b-instruct-2507	Alibaba · Apache 2.0	1399	±16		1,356	$0.05 / $0.19	262.1K
164	133-197	gemini-2.5-flash-lite-preview-09-2025-no-thinking	Google · Proprietary	1399	±12		2,549	$0.10 / $0.40	1M
165	123-201	o1-2024-12-17	OpenAI · Proprietary	1398	±17		1,273	$15 / $60	200K
166	133-197	mimo-v2-flash (non-thinking)	Xiaomi · MIT	1398	±11		3,189	$0.10 / $0.30	262.1K
167	134-197	step-3.5-flash	StepFun · Apache 2.0	1398	±10		4,025	$0.10 / $0.30	262.1K
168	133-199	trinity-large-thinking	Apache 2.0	1397	±14		2,185	$0.22 / $0.85	262.1K
169	133-200	glm-4.5-air	Z.ai · MIT	1396	±14		1,662	$0.13 / $0.85	131.1K
170	119-210	qwen3-next-80b-a3b-thinking	Alibaba · Apache 2.0	1396	±22		726	$0.15 / $1.20	262.1K
171	134-199	gpt-4.1-mini-2025-04-14	OpenAI · Proprietary	1395	±13		2,344	$0.40 / $1.60	1M
172	134-202	qwen2.5-max	Alibaba · Proprietary	1394	±15		1,592	N/A	N/A
173	137-201	minimax-m1	MiniMax · Apache 2.0	1393	±13		2,122	$0.55 / $2.20	1M
174	133-208	deepseek-v3	DeepSeek · DeepSeek	1393	±18		1,060	$1.14 / $4.56	N/A
175	102-238	hunyuan-large-2025-02-10	Tencent · Proprietary	1389	±38		212	N/A	N/A
176	137-212	mistral-small-2506	Mistral · Apache 2.0	1388	±18		1,140	$0.10 / $0.30	32K
177	105-240	glm-4.5v	Z.ai · MIT	1387	±37		241	$0.60 / $1.80	65.5K
178	119-233	qwen-plus-0125	Alibaba · Proprietary	1387	±32		315	$0.40 / $1.20	131.1K
179	145-210	amazon-nova-experimental-chat-11-10	Amazon · Proprietary	1386	±15		1,707	N/A	N/A
180	139-217	grok-3-mini-high	SpaceXAI · Proprietary	1386	±19		992	$0.25 / $1.27	N/A
181	153-208	claude-3-5-sonnet-20241022	Anthropic · Proprietary	1385	±10		4,564	$3 / $15	200K
182	150-217	qwen3-235b-a22b	Alibaba · Apache 2.0	1382	±15		1,555	$0.46 / $1.82	131.1K
183	154-217	claude-3-7-sonnet-20250219	Anthropic · Proprietary	1380	±13		2,269	$3 / $15	200K
184	118-246	nvidia-llama-3.3-nemotron-super-49b-v1.5	Nvidia · Nvidia Open	1379	±39		197	$0.10 / $0.40	131.1K
185	119-246	qwen3-32b	Alibaba · Apache 2.0	1379	±39		212	$0.08 / $0.28	131.1K
186	156-218	gemini-2.0-flash-001	Google · Proprietary	1378	±13		2,308	$0.10 / $0.40	1M
187	131-246	step-2-16k-exp-202412	StepFun · Proprietary	1376	±36		265	N/A	N/A
188	154-227	minimax-m2.1-preview	MiniMax · MIT	1374	±18		1,143	$0.30 / $1.20	204.8K
189	162-219	command-a-03-2025	Cohere · CC-BY-NC-4.0	1374	±11		3,075	$2.50 / $10	256K
190	156-235	gemini-2.0-flash-lite-preview-02-05	Google · Proprietary	1373	±19		1,055	$0.07 / $0.30	1M
191	156-240	glm-4.7-flash	Z.ai · MIT	1370	±21		819	$0.06 / $0.40	202.8K
192	147-247	step-3	StepFun · Apache 2.0	1369	±31		351	$0.57 / $1.42	65.5K
193	157-240	o3-mini-high	OpenAI · Proprietary	1368	±21		824	$0.55 / $2.20	200K
194	166-237	gpt-oss-120b	OpenAI · Apache 2.0	1367	±15		1,646	$0.03 / $0.17	131.1K
195	135-255	nvidia-nemotron-3.5-lightning-30b-a3b-nvfp4	Nvidia · OpenMDW-1.1	1366	±41	Preliminary	238	N/A	N/A
196	167-238	o1-preview	OpenAI · Proprietary	1366	±15		1,699	$15 / $60	N/A
197	172-238	llama-3.1-405b-instruct-bf16	Meta · Llama 3.1 Community	1364	±14		1,899	$4 / $4	32.8K
198	150-253	minimax-m2	MiniMax · Apache 2.0	1364	±33		322	$0.26 / $1.02	204.8K
199	147-257	hunyuan-standard-2025-02-10	Tencent · Proprietary	1362	±37		247	N/A	N/A
200	157-251	gpt-5-nano-high	OpenAI · Proprietary	1361	±27		479	$0.03 / $0.20	400K
201	172-242	grok-3-mini-beta	SpaceXAI · Proprietary	1360	±16		1,432	$0.30 / $0.50	131.1K
202	172-250	nova-2-lite	Amazon · Proprietary	1356	±22		723	$0.30 / $2.50	1M
203	178-242	grok-2-2024-08-13	SpaceXAI · Proprietary	1356	±12		3,206	$2 / $10	131.1K
204	176-247	qwq-32b	Alibaba · Apache 2.0	1355	±16		1,368	$0.50 / $1	16.4K
205	171-253	amazon-nova-experimental-chat-10-20	Amazon · Proprietary	1355	±24		647	N/A	N/A
206	178-243	gemini-1.5-pro-002	Google · Proprietary	1355	±13		2,686	$3.50 / $10.50	2.1M
207	176-247	yi-lightning	Proprietary	1355	±16		1,451	N/A	N/A
208	183-245	gpt-4o-2024-05-13	OpenAI · Proprietary	1352	±11		5,984	$5 / $15	128K
209	172-254	gpt-oss-20b	OpenAI · Apache 2.0	1352	±26		570	$0.03 / $0.13	131.1K
210	172-255	nvidia-nemotron-3-super-120b-a12b	Nvidia · NVIDIA Open Model	1351	±26		485	N/A	N/A
211	157-264	gemma-3-4b-it	Google · Gemma	1351	±38		197	$0.05 / $0.10	131.1K
212	183-248	claude-3-5-sonnet-20240620	Anthropic · Proprietary	1349	±12		4,460	$3 / $15	200K
213	162-267	mercury-2	Inception AI · Proprietary	1348	±38		226	$0.25 / $0.75	128K
214	172-261	ling-flash-2.0	Ant Group · MIT	1346	±31		354	N/A	N/A
215	183-250	llama-3.1-405b-instruct-fp8	Meta · Llama 3.1 Community	1346	±12		3,064	$4 / $4	32.8K
216	174-261	reka-core-20240904	Proprietary	1345	±30		364	N/A	N/A
217	184-250	claude-3-5-haiku-20241022	Anthropic · Proprietary	1345	±11		3,677	$1 / $5	200K
218	183-253	llama-4-maverick-17b-128e-instruct	Meta · Llama 4	1344	±13		2,320	$0.63 / $1.80	131.1K
219	183-253	grok-2-mini-2024-08-13	SpaceXAI · Proprietary	1344	±13		2,609	$2 / $10	131.1K
220	174-265	gpt-4.1-nano-2025-04-14	OpenAI · Proprietary	1342	±32		302	$0.10 / $0.40	1M
221	184-253	gpt-4o-2024-08-06	OpenAI · Proprietary	1342	±14		2,174	$2.50 / $10	128K
222	186-253	o3-mini	OpenAI · Proprietary	1342	±11		3,058	$0.55 / $2.20	200K
223	184-254	gemini-advanced-0514	Google · Proprietary	1341	±14		2,701	N/A	N/A
224	184-255	llama-4-scout-17b-16e-instruct	Meta · Llama	1341	±15		1,841	$0.40 / $0.70	8.2K
225	186-253	llama-3.3-70b-instruct	Meta · Llama-3.3	1341	±12		2,757	$0.10 / $0.32	131.1K
226	183-258	gemma-3n-e4b-it	Google · Gemma	1340	±17		1,335	$0.06 / $0.12	32.8K
227	185-258	glm-4-plus	Z.ai · Proprietary	1339	±16		1,513	$0.44 / $1.76	204.8K
228	187-258	qwen3-30b-a3b	Alibaba · Apache 2.0	1337	±15		1,627	$0.13 / $0.52	131.1K
229	190-257	o1-mini	OpenAI · Proprietary	1337	±13		2,639	$1.10 / $4.40	N/A
230	178-272	deepseek-v2.5-1210	DeepSeek · DeepSeek	1336	±32		291	N/A	N/A
231	181-272	llama-3.1-nemotron-70b-instruct	Nvidia · Llama 3.1	1336	±31		392	$1.20 / $1.20	131.1K
232	193-258	gpt-4o-mini-2024-07-18	OpenAI · Proprietary	1334	±11		3,439	$0.15 / $0.60	128K
233	195-258	claude-3-opus-20240229	Anthropic · Proprietary	1334	±10		10,327	$15 / $75	200K
234	183-267	magistral-medium-2506	Mistral · Proprietary	1333	±23		782	$2 / $5	40K
235	178-274	olmo-3-32b-think	Ai2 · Apache 2.0	1333	±35		322	$0.15 / $0.50	65.5K
236	190-261	athene-v2-chat	NexusFlow	1333	±17		1,198	N/A	N/A
237	182-274	intellect-3	MIT	1332	±33		324	$0.20 / $1.10	131.1K
238	184-270	step-1o-turbo-202506	StepFun · Proprietary	1331	±24		603	N/A	N/A
239	184-272	qwen2.5-plus-1127	Alibaba · Proprietary	1329	±26		474	N/A	N/A
240	193-270	athene-70b-0725	CC-BY-NC-4.0	1328	±19		1,039	N/A	N/A
241	203-261	gpt-4-turbo-2024-04-09	OpenAI · Proprietary	1326	±12		5,046	$10 / $30	128K
242	197-265	gemini-1.5-flash-002	Google · Proprietary	1326	±15		1,696	$0.07 / $0.30	1M
243	185-275	ring-flash-2.0	Ant Group · MIT	1324	±30		387	N/A	N/A
244	177-289	gemma-3-12b-it	Google · Gemma	1323	±46		155	$0.05 / $0.15	131.1K
245	204-270	mistral-large-2407	Mistral · Mistral Research	1322	±13		2,423	$2 / $6	131.1K
246	200-272	amazon-nova-pro-v1.0	Amazon · Proprietary	1322	±18		1,096	$0.80 / $3.20	300K
247	196-275	olmo-3.1-32b-instruct	Ai2 · Apache 2.0	1319	±23		811	$0.20 / $0.60	65.5K
248	183-288	granite-4.1-8b	IBM · Apache 2.0	1319	±38		309	$0.05 / $0.10	131.1K
249	208-273	mistral-small-3.1-24b-instruct-2503	Mistral · Apache 2.0	1317	±14		1,966	$0.10 / $0.30	32K
250	207-274	mistral-large-2411	Mistral · MRL	1317	±17		1,230	$2 / $6	128K
251	204-275	qwen-max-0919	Alibaba · Qwen	1316	±19		933	$1.60 / $6.40	32.8K
252	208-275	deepseek-v2.5	DeepSeek · DeepSeek	1314	±18		1,214	N/A	N/A
253	215-274	qwen2.5-72b-instruct	Alibaba · Qwen	1313	±14		1,956	$1.20 / $1.20	N/A
254	222-274	gpt-4-0125-preview	OpenAI · Proprietary	1312	±12		5,155	$10 / $30	128K
255	220-274	llama-3.1-70b-instruct	Meta · Llama 3.1 Community	1312	±13		2,821	$0.40 / $0.40	131.1K
256	231-279	gpt-4-1106-preview	OpenAI · Proprietary	1302	±12		5,514	$10 / $30	128K
257	227-287	nvidia-nemotron-3-nano-30b-a3b-bf16	Nvidia · NVIDIA Open Model	1302	±20		999	$0.06 / $0.24	262.1K
258	196-297	ibm-granite-h-small	IBM · Apache 2.0	1302	±40		258	N/A	N/A
259	220-291	command-r-plus-08-2024	Cohere · CC-BY-NC-4.0	1300	±25		547	$2.50 / $10	128K
260	217-292	gemma-2-9b-it-simpo	MIT	1300	±26		516	$0.03 / $0.09	8.2K
261	236-283	llama-3-70b-instruct	Meta · Llama 3 Community	1298	±11		8,252	$0.51 / $0.74	8.2K
262	234-285	gemini-1.5-pro-001	Google · Proprietary	1298	±12		4,418	$3.50 / $10.50	2.1M
263	234-285	claude-3-sonnet-20240229	Anthropic · Proprietary	1298	±12		5,941	$3 / $15	200K
264	244-289	gemma-2-27b-it	Google · Gemma license	1290	±11		3,862	$0.65 / $0.65	8.2K
265	239-292	c4ai-aya-expanse-32b	Cohere · CC-BY-NC-4.0	1289	±16		1,358	N/A	N/A
266	231-296	olmo-3.1-32b-think	Ai2 · Apache 2.0	1288	±26		601	$0.15 / $0.50	65.5K
267	231-297	command-r-08-2024	Cohere · CC-BY-NC-4.0	1288	±26		500	$0.15 / $0.60	128K
268	227-301	hunyuan-large-vision	Tencent · Proprietary	1286	±33		368	N/A	N/A
269	236-297	mistral-small-24b-instruct-2501	Mistral · Apache 2.0	1286	±24		654	$0.05 / $0.08	32.8K
270	250-292	command-r-plus	Cohere · CC-BY-NC-4.0	1285	±13		4,198	$2.50 / $10	128K
271	243-294	nemotron-4-340b-instruct	Nvidia · NVIDIA Open Model	1284	±19		1,069	N/A	N/A
272	232-300	reka-flash-20240904	Proprietary	1284	±28		390	N/A	N/A
273	236-301	jamba-1.5-large	Jamba Open	1282	±28		474	$2 / $8	256K
274	239-300	glm-4-0520	Z.ai · Proprietary	1280	±24		554	N/A	N/A
275	255-294	claude-3-haiku-20240307	Anthropic · Proprietary	1279	±11		6,385	$0.25 / $1.25	200K
276	227-306	llama-3.1-nemotron-51b-instruct	Nvidia · Llama 3.1	1278	±39		213	N/A	N/A
277	255-298	qwen2-72b-instruct	Alibaba · Qianwen LICENSE	1275	±15		2,067	$0.90 / $0.90	32.8K
278	254-301	amazon-nova-lite-v1.0	Amazon · Proprietary	1272	±20		872	$0.06 / $0.24	300K
279	254-301	phi-4	Microsoft · MIT	1272	±19		1,037	$0.07 / $0.14	16.4K
280	258-300	gpt-4-0314	OpenAI · Proprietary	1271	±15		2,913	$30 / $60	8.2K
281	258-300	gemini-1.5-flash-001	Google · Proprietary	1270	±13		3,461	$0.07 / $0.30	1M
282	256-303	amazon-nova-micro-v1.0	Amazon · Proprietary	1267	±19		952	$0.04 / $0.14	128K
283	259-301	gemini-1.5-flash-8b-001	Google · Proprietary	1267	±15		1,813	$0.07 / $0.30	1M
284	254-306	jamba-1.5-mini	Jamba Open	1264	±27		486	$0.20 / $0.40	256K
285	262-301	gpt-4-0613	OpenAI · Proprietary	1264	±13		4,768	$30 / $60	8.2K
286	260-306	gemini-pro-dev-api	Google · Proprietary	1260	±21		1,076	$0.35 / $1.05	32.8K
287	256-312	c4ai-aya-expanse-8b	Cohere · CC-BY-NC-4.0	1259	±27		470	N/A	N/A
288	266-303	gemma-2-9b-it	Google · Gemma license	1259	±13		2,812	$0.03 / $0.09	8.2K
289	254-322	qwen2.5-coder-32b-instruct	Alibaba · Apache 2.0	1255	±36		221	$0.87 / $0.87	32K
290	263-309	deepseek-coder-v2	DeepSeek · DeepSeek License	1254	±20		847	$0.14 / $0.28	128K
291	255-322	ministral-8b-2410	Mistral · MRL	1254	±34		280	$0.10 / $0.10	131.1K
292	266-318	reka-flash-21b-20240226-online	Proprietary	1248	±21		818	N/A	N/A
293	272-309	mistral-large-2402	Mistral · Proprietary	1247	±14		3,434	$4 / $12	32K
294	268-315	reka-flash-21b-20240226	Proprietary	1247	±18		1,299	N/A	N/A
295	273-313	command-r	Cohere · CC-BY-NC-4.0	1245	±14		2,900	$0.15 / $0.60	128K
296	269-317	qwen1.5-110b-chat	Alibaba · Qianwen LICENSE	1245	±17		1,431	N/A	N/A
297	255-330	olmo-2-0325-32b-instruct	Ai2 · Apache-2.0	1244	±45		204	$0.05 / $0.20	128K
298	273-317	qwen1.5-72b-chat	Alibaba · Qianwen LICENSE	1242	±15		2,386	N/A	N/A
299	277-320	mistral-medium	Mistral · Proprietary	1239	±16		1,925	$2.70 / $8.10	32K
300	262-331	gemini-pro	Google · Proprietary	1237	±39		262	$0.35 / $1.05	32.8K
301	283-319	llama-3-8b-instruct	Meta · Llama 3 Community	1236	±12		5,400	$0.14 / $0.14	8.2K
302	283-320	mixtral-8x22b-instruct-v0.1	Mistral · Apache 2.0	1236	±14		2,823	$0.90 / $0.90	65.5K
303	285-325	llama-3.1-8b-instruct	Meta · Llama 3.1 Community	1230	±13		2,564	$0.05 / $0.08	131.1K
304	285-325	gpt-3.5-turbo-0125	OpenAI · Proprietary	1227	±13		3,837	$0.50 / $1.50	16.4K
305	268-334	zephyr-orpo-141b-A35b-v0.1	Apache 2.0	1227	±36		284	N/A	N/A
306	285-327	yi-1.5-34b-chat	Apache-2.0	1225	±18		1,330	N/A	N/A
307	288-330	phi-3-medium-4k-instruct	Microsoft · MIT	1217	±17		1,320	$0.17 / $0.68	N/A
308	295-330	gemma-2-2b-it	Google · Gemma license	1213	±14		2,336	N/A	N/A
309	292-333	qwen1.5-32b-chat	Alibaba · Qianwen LICENSE	1212	±18		1,187	N/A	N/A
310	291-333	gemma-1.1-7b-it	Google · Gemma license	1212	±19		1,255	$0.03 / $0.09	8.2K
311	288-336	starling-lm-7b-alpha	CC-BY-NC-4.0	1211	±25		568	N/A	N/A
312	293-335	qwen1.5-14b-chat	Alibaba · Qianwen LICENSE	1207	±21		939	$0.30 / $0.30	N/A
313	290-338	internlm2_5-20b-chat	Other	1207	±26		548	$0 / $0	32.8K
314	299-333	mixtral-8x7b-instruct-v0.1	Mistral · Apache 2.0	1207	±13		4,050	$0.63 / $0.63	32K
315	288-340	deepseek-llm-67b-chat	DeepSeek · DeepSeek License	1205	±29		385	N/A	N/A
316	296-338	starling-lm-7b-beta	Apache-2.0	1204	±22		853	N/A	N/A
317	290-340	openchat-3.5	Apache-2.0	1203	±30		426	$0.20 / $0.20	N/A
318	290-342	llama-3.2-3b-instruct	Meta · Llama 3.2	1202	±31		441	$0.05 / $0.33	131.1K
319	301-338	dbrx-instruct-preview	DBRX LICENSE	1200	±18		1,705	$0.60 / $0.60	32.8K
320	301-339	phi-3-small-8k-instruct	Microsoft · MIT	1199	±20		977	$0.15 / $0.60	N/A
321	299-340	yi-34b-chat	Yi License	1198	±22		824	$0.90 / $0.90	4.1K
322	293-345	wizardlm-70b	Microsoft · Llama 2 Community	1198	±30		385	N/A	N/A
323	292-347	granite-3.0-8b-instruct	IBM · Apache 2.0	1195	±36		356	N/A	N/A
324	303-342	openchat-3.5-0106	Apache-2.0	1193	±21		743	N/A	N/A
325	303-340	snowflake-arctic-instruct	Apache 2.0	1192	±19		1,626	N/A	N/A
326	297-348	openhermes-2.5-mistral-7b	Apache-2.0	1189	±35		285	$0.17 / $0.17	N/A
327	308-347	llama-2-70b-chat	Meta · Llama 2 Community	1180	±15		2,169	$0.70 / $2.80	4.1K
328	304-347	gpt-3.5-turbo-1106	OpenAI · Proprietary	1178	±22		906	$1 / $2	16.4K
329	301-353	solar-10.7b-instruct-v1.0	CC-BY-NC-4.0	1177	±40		210	$0.30 / $0.30	N/A
330	308-347	mistral-7b-instruct-v0.2	Mistral · Apache-2.0	1176	±19		1,091	$0.20 / $0.20	32.8K
331	311-347	vicuna-33b	Non-commercial	1174	±19		1,203	$0 / $0	2K
332	304-353	wizardlm-13b	Microsoft · Llama 2 Community	1171	±35		323	$0.30 / $0.30	N/A
333	307-353	tulu-2-dpo-70b	AI2 ImpACT Low-risk	1168	±31		348	N/A	N/A
334	313-353	llama-2-13b-chat	Meta · Llama 2 Community	1165	±21		970	$0.25 / $0.25	4.1K
335	304-357	qwen1.5-7b-chat	Alibaba · Qianwen LICENSE	1164	±36		266	$0.20 / $0.20	N/A
336	314-354	gemma-7b-it	Google · Gemma license	1157	±26		538	$0.05 / $0.08	8.2K
337	318-354	vicuna-13b	Llama 2 Community	1156	±22		884	$0.30 / $0.30	N/A
338	312-357	qwen-14b-chat	Alibaba · Qianwen LICENSE	1154	±37		268	N/A	N/A
339	317-357	nous-hermes-2-mixtral-8x7b-dpo	Apache-2.0	1149	±32		266	$0.90 / $0.90	N/A
340	322-357	zephyr-7b-beta	MIT	1146	±26		580	$0.15 / $0.15	16.4K
341	322-357	phi-3-mini-4k-instruct-june-2024	Microsoft · MIT	1146	±26		653	$0.13 / $0.52	4.1K
342	314-357	palm-2	Google · Proprietary	1146	±38		303	$0.50 / $0.50	25.8K
343	324-357	gemma-1.1-2b-it	Google · Gemma license	1142	±27		628	N/A	N/A
344	325-357	mistral-7b-instruct	Mistral · Apache 2.0	1138	±28		477	$0.07 / $0.28	4.1K
345	324-357	codellama-34b-instruct	Meta · Llama 2 Community	1138	±32		340	$0.35 / $1.40	16.4K
346	324-357	vicuna-7b	Llama 2 Community	1133	±35		291	$0.20 / $0.20	N/A
347	325-357	granite-3.0-2b-instruct	IBM · Apache 2.0	1130	±37		380	N/A	N/A
348	331-357	phi-3-mini-4k-instruct	Microsoft · MIT	1129	±21		1,078	$0.13 / $0.52	N/A
349	331-357	phi-3-mini-128k-instruct	Microsoft · MIT	1128	±22		1,114	$0.13 / $0.52	N/A
350	331-357	llama-2-7b-chat	Meta · Llama 2 Community	1126	±23		764	$0.15 / $0.15	4.1K
351	330-357	stripedhyena-nous-7b	Apache 2.0	1124	±31		327	$0.20 / $0.20	N/A
352	331-357	olmo-7b-instruct	Ai2 · Apache-2.0	1120	±32		339	$0.20 / $0.20	N/A
353	335-359	qwen1.5-4b-chat	Alibaba · Qianwen LICENSE	1104	±31		433	$0.10 / $0.10	N/A
354	337-359	llama-3.2-1b-instruct	Meta · Llama 3.2	1097	±32		445	$0.03 / $0.20	60K
355	331-359	RWKV-4-Raven-14B	Apache 2.0	1097	±49		177	N/A	N/A
356	337-359	gemma-2b-it	Google · Gemma license	1090	±38		292	$0.10 / $0.10	N/A
357	337-359	koala-13b	Non-commercial	1088	±42		253	N/A	N/A
358	353-361	alpaca-13b	Non-commercial	1036	±49		212	N/A	N/A
359	353-361	chatglm3-6b	Apache-2.0	1035	±42		253	N/A	N/A
360	358-361	oasst-pythia-12b	Apache 2.0	981	±49		201	N/A	N/A
361	358-361	chatglm-6b	Non-commercial	943	±52		193	N/A	N/A
```


## Category: Language: English (adjustment: None)

Source: https://arena.ai, Text Arena leaderboard, Categories panel, "Language: English" selected, Adjustments = None.
Date shown on page: Aug 19, 2026. Votes: 4,016,394. Models: 393. Captured row count: 393 (verified match).

```
1	1-6	claude-fable-5	Anthropic · Proprietary	1515	±7		10,383	$10 / $50	1M
2	1-6	claude-opus-4-6-high	Anthropic · Proprietary	1514	±5		33,052	$5 / $25	1M
3	1-8	claude-opus-4-7-high	Anthropic · Proprietary	1509	±5		28,149	$5 / $25	1M
4	1-9	claude-opus-4-6	Anthropic · Proprietary	1507	±4		35,474	$5 / $25	1M
5	1-33	glm-5.3-max	Z.ai · MIT	1501	±18		1,099	$1.40 / $4.40	1M
6	1-32	muse-spark-1.2 (xHigh)	Meta · Proprietary	1500	±16		1,394	$1.25 / $4.25	N/A
7	3-15	claude-opus-4-7	Anthropic · Proprietary	1500	±5		28,425	$5 / $25	1M
8	3-20	kimi-k3-max	Moonshot · Kimi K3 license	1497	±8		5,529	N/A	N/A
9	4-24	muse-spark	Meta · Proprietary	1495	±8		6,477	N/A	N/A
10	5-24	claude-opus-5-high	Anthropic · Proprietary	1494	±7		10,643	$5 / $25	1M
11	5-33	muse-spark-1.1	Meta · Proprietary	1491	±7		7,905	$1.25 / $4.25	N/A
12	5-46	gemini-3.7-flash-high	Google · Proprietary	1489	±12	Preliminary	2,378	$0.75 / $3.57	1M
13	6-32	gemini-3.1-pro-preview	Google · Proprietary	1489	±4		45,239	$1 / $6	1M
14	6-32	gemini-3-pro	Google · Proprietary	1489	±5		19,037	$2 / $12	1M
15	6-37	claude-opus-4-8-high	Anthropic · Proprietary	1488	±6		19,604	$5 / $25	1M
16	5-44	claude-opus-5-max	Anthropic · Proprietary	1488	±9		5,242	$5 / $25	1M
17	5-42	gemini-3.6-flash-high	Google · Proprietary	1487	±8		7,393	$0.38 / $1.88	1M
18	6-44	gpt-5.6-sol-xhigh	OpenAI · Proprietary	1486	±7		7,687	$5 / $30	N/A
19	6-49	qwen3.8-max	Alibaba · Proprietary	1485	±10		3,713	$2 / $6	1M
20	7-44	claude-sonnet-4-6	Anthropic · Proprietary	1484	±5		30,849	$1.50 / $7.50	1M
21	7-44	gpt-5.5-high	OpenAI · Proprietary	1484	±5		26,882	$2.50 / $15	1.1M
22	7-45	claude-opus-4-5-20251101-high-32k	Anthropic · Proprietary	1483	±5		17,057	$5 / $25	200K
23	9-46	mimo-v2.5-pro	Xiaomi · MIT	1482	±5		23,203	$0.43 / $0.87	1.1M
24	9-46	glm-5.1	Z.ai · MIT	1481	±5		18,731	$1.40 / $4.40	202.8K
25	9-49	claude-opus-4-8	Anthropic · Proprietary	1481	±6		20,175	$5 / $25	1M
26	9-49	grok-4.20-beta1	SpaceXAI · Proprietary	1481	±6		12,795	N/A	N/A
27	9-49	gpt-5.2-chat-latest-20260210	OpenAI · Proprietary	1481	±6		16,141	$1.75 / $14	128K
28	9-48	gpt-5.5	OpenAI · Proprietary	1481	±5		27,537	$2.50 / $15	1.1M
29	5-69	deepseek-v4-pro-high-20260813	DeepSeek · MIT	1480	±18		1,040	$1.32 / $3.96	N/A
30	9-54	ernie-5.1	Baidu · Proprietary	1479	±6		17,057	N/A	N/A
31	9-55	gemini-3.5-flash-medium	Google · Proprietary	1479	±6		11,885	$0.75 / $4.50	1M
32	14-49	claude-opus-4-5-20251101	Anthropic · Proprietary	1479	±4		33,195	$5 / $25	200K
33	14-54	grok-4.20-beta-0309-reasoning	SpaceXAI · Proprietary	1478	±5		29,186	$1.25 / $2.50	1M
34	14-54	gpt-5.4-high	OpenAI · Proprietary	1478	±5		28,112	$2.50 / $15	1.1M
35	12-58	gemini-3.5-flash-high	Google · Proprietary	1478	±6		12,713	$0.75 / $4.50	1M
36	14-60	glm-5.2-max	Z.ai · MIT	1477	±6		12,912	$1.40 / $4.40	1M
37	15-65	grok-4.5	SpaceXAI · Proprietary	1475	±7		8,609	$2 / $6	500K
38	15-63	gemini-3-flash	Google · Proprietary	1474	±6		14,167	$0.50 / $3	1M
39	7-73	qwen3.7-max-preview	Alibaba · Proprietary	1474	±14		1,812	$1.48 / $4.42	1M
40	15-65	claude-sonnet-5-high	Anthropic · Proprietary	1474	±6		11,436	$1 / $5	1M
41	15-65	gpt-5.5-instant	OpenAI · Proprietary	1473	±7		12,369	$2.50 / $15	1.1M
42	20-64	grok-4.20-multi-agent-beta-0309	SpaceXAI · Proprietary	1473	±5		28,429	$1.25 / $2.50	1M
43	16-65	qwen3.5-max-preview	Alibaba · Proprietary	1473	±7		10,155	$1.20 / $6	N/A
44	24-63	claude-sonnet-4-5-20250929-high-32k	Anthropic · Proprietary	1472	±4		38,962	$3 / $15	200K
45	24-65	grok-4.1-thinking	SpaceXAI · Proprietary	1472	±4		30,417	N/A	N/A
46	21-66	glm-5	Z.ai · MIT	1471	±6		13,089	$1 / $3.20	202.8K
47	30-67	grok-4.1	SpaceXAI · Proprietary	1470	±4		31,732	N/A	N/A
48	15-75	hy3	Tencent · Apache 2.0	1470	±13		2,168	$0.13 / $0.53	262.1K
49	30-68	gpt-5.4	OpenAI · Proprietary	1469	±5		29,613	$2.50 / $15	1.1M
50	34-68	claude-sonnet-4-5-20250929	Anthropic · Proprietary	1468	±4		38,542	$3 / $15	200K
51	30-70	kimi-k2.6	Moonshot · Modified MIT	1468	±6		17,215	$0.95 / $4	262.1K
52	33-69	deepseek-v4-pro	DeepSeek · MIT	1468	±5		23,993	$1.32 / $3.96	1M
53	16-80	qwen3.6-max-preview	Alibaba · Proprietary	1467	±12		2,393	$1.03 / $6.16	262.1K
54	30-73	gpt-5.6-luna-xhigh	OpenAI · Proprietary	1467	±7		8,095	$1 / $6	N/A
55	30-74	gpt-5.6-terra-xhigh	OpenAI · Proprietary	1467	±7		7,893	$2.50 / $15	N/A
56	34-73	mimo-v2-pro	Xiaomi · Proprietary	1466	±6		11,051	$1 / $3	1M
57	35-72	deepseek-v4-pro-high-preview	DeepSeek · MIT	1466	±5		22,751	$1.32 / $3.96	1M
58	34-73	qwen3.7-plus	Alibaba · Proprietary	1466	±6		14,330	$0.32 / $1.28	1M
59	36-74	claude-opus-4-1-20250805-thinking-16k	Anthropic · Proprietary	1464	±5		23,685	$15 / $75	200K
60	39-74	dola-seed-2.0-pro	Bytedance · Proprietary	1463	±5		34,481	N/A	N/A
61	38-75	gpt-5.1-high	OpenAI · Proprietary	1463	±5		18,821	$0.63 / $5	400K
62	36-82	glm-4.7	Z.ai · MIT	1462	±8		5,602	$0.40 / $1.75	204.8K
63	44-75	kimi-k2.5-thinking	Moonshot · Modified MIT	1461	±4		31,432	$0.60 / $3	N/A
64	36-82	gemini-3.5-flash-lite	Google · Proprietary	1461	±8		7,036	$0.15 / $1.25	1M
65	46-78	gemini-3-flash (thinking-minimal)	Google · Proprietary	1460	±4		40,283	$0.50 / $3	1M
66	35-93	gemma-4-31b	Google · Apache 2.0	1460	±11		2,609	$0.14 / $0.40	262.1K
67	25-100	grok-4.6-high	SpaceXAI · Proprietary	1460	±15	Preliminary	1,442	$2 / $6	500K
68	45-84	longcat-flash-chat-2602-exp	Meituan · Proprietary	1459	±6		13,444	N/A	N/A
69	51-84	claude-opus-4-1-20250805	Anthropic · Proprietary	1458	±4		36,596	$15 / $75	200K
70	50-89	qwen3.6-plus	Alibaba · Proprietary	1456	±5		20,554	$0.33 / $1.95	1M
71	51-91	minimax-m3	MiniMax · MiniMax Community License	1456	±6		17,249	$0.60 / $2.40	N/A
72	48-101	glm-5v-turbo	Z.ai · Proprietary	1453	±9		4,012	$1.20 / $4	202.8K
73	59-96	mimo-v2.5	Xiaomi · MIT	1452	±6		20,255	$0.14 / $0.28	1.1M
74	62-97	gpt-5.4-mini-high	OpenAI · Proprietary	1451	±5		27,849	$0.75 / $4.50	400K
75	62-97	ernie-5.0-0110	Baidu · Proprietary	1451	±5		15,890	N/A	N/A
76	62-98	gpt-5.3-chat-latest	OpenAI · Proprietary	1451	±6		15,389	$1.75 / $14	128K
77	63-97	grok-4.3	SpaceXAI · Proprietary	1451	±5		27,853	$1.25 / $2.50	1M
78	56-106	ernie-5.0-preview-1203	Baidu · Proprietary	1451	±9		4,603	N/A	N/A
79	63-101	deepseek-v4-flash-high-preview	DeepSeek · MIT	1450	±5		21,761	$0.44 / $1.32	1M
80	68-101	qwen3.5-397b-a17b	Alibaba · Apache 2.0	1449	±4		32,344	$0.39 / $2.34	262.1K
81	52-115	gemma-4-26b-a4b	Google · Apache 2.0	1449	±11		2,521	N/A	N/A
82	68-101	gemini-2.5-pro	Google · Proprietary	1448	±3		59,159	$0.63 / $5	1M
83	68-101	chatgpt-4o-latest-20250326	OpenAI · Proprietary	1447	±4		41,326	$5 / $15	128K
84	64-109	inkling	Thinky · Apache 2.0	1447	±8		7,267	$1 / $4.05	524.3K
85	64-109	gpt-4.5-preview-2025-02-27	OpenAI · Proprietary	1447	±7		8,425	$75 / $150	128K
86	69-109	deepseek-v4-flash	DeepSeek · MIT	1445	±5		21,985	$0.44 / $1.32	1M
87	68-113	mimo-v2-omni	Xiaomi · Proprietary	1445	±7		9,031	$0.40 / $2	262.1K
88	66-116	mistral-medium-3.5	Mistral · Modified MIT	1445	±9		5,307	$1.50 / $7.50	262.1K
89	70-110	gpt-5.2-high	OpenAI · Proprietary	1445	±5		22,268	$0.88 / $7	400K
90	71-109	kimi-k2-thinking-turbo	Moonshot · Modified MIT	1444	±4		28,451	$1.15 / $8	262.1K
91	66-119	kimi-k2.5-instant	Moonshot · Modified MIT	1444	±10		3,710	$0.45 / $2.25	262.1K
92	70-112	deepseek-v3.2-thinking	DeepSeek · MIT	1444	±5		18,585	$0.27 / $0.40	163.8K
93	72-115	gpt-5.1	OpenAI · Proprietary	1442	±5		20,177	$0.63 / $5	400K
94	69-124	deepseek-v3.2-exp-thinking	DeepSeek · MIT	1441	±9		4,391	$0.27 / $0.41	163.8K
95	75-116	grok-4-1-fast-reasoning	SpaceXAI · Proprietary	1441	±4		26,431	$0.20 / $0.50	2M
96	71-130	nvidia-nemotron-3-ultra-550b-a55b-nvfp4	Nvidia · OpenMDW-1.1	1439	±9		4,960	N/A	N/A
97	76-122	gpt-5-high	OpenAI · Proprietary	1439	±6		15,250	$0.63 / $5	400K
98	82-119	gpt-5.2	OpenAI · Proprietary	1439	±4		37,353	$0.88 / $7	400K
99	77-122	qwen3-max-preview	Alibaba · Proprietary	1439	±6		13,048	$0.78 / $3.90	262.1K
100	68-137	amazon-nova-experimental-chat-26-02-10	Amazon · Proprietary	1438	±15		1,549	N/A	N/A
101	82-122	o3-2025-04-16	OpenAI · Proprietary	1438	±5		30,226	$2 / $8	200K
102	82-126	deepseek-v3.2	DeepSeek · MIT	1437	±5		21,527	$0.27 / $0.40	163.8K
103	82-126	minimax-m2.7	MiniMax · Modified MIT	1437	±5		26,692	$0.30 / $1.20	204.8K
104	76-130	deepseek-v3.2-exp	DeepSeek · MIT	1437	±8		5,697	$0.27 / $0.41	163.8K
105	83-128	glm-4.6	Z.ai · MIT	1436	±5		17,295	$0.50 / $2	204.8K
106	87-130	claude-opus-4-20250514-thinking-16k	Anthropic · Proprietary	1434	±5		17,540	$15 / $75	200K
107	90-130	gemini-3.1-flash-lite-preview	Google · Proprietary	1433	±5		28,840	$0.25 / $1.50	1M
108	83-136	qwen3-max-2025-09-23	Alibaba · Proprietary	1433	±9		4,505	$0.78 / $3.90	262.1K
109	71-144	amazon-nova-experimental-chat-26-01-10	Amazon · Proprietary	1433	±14		1,575	N/A	N/A
110	94-130	claude-haiku-4-5-20251001	Anthropic · Proprietary	1433	±3		56,711	$1 / $5	200K
111	90-133	gpt-5-chat	OpenAI · Proprietary	1432	±6		15,061	$1.25 / $10	N/A
112	89-136	deepseek-r1-0528	DeepSeek · MIT	1432	±7		8,907	$0.50 / $2.15	163.8K
113	92-136	qwen3.5-122b-a10b	Alibaba · Apache 2.0	1431	±6		13,386	$0.26 / $2.08	262.1K
114	88-139	deepseek-v3.1-thinking	DeepSeek · MIT	1431	±9		5,300	$1.23 / $4.94	N/A
115	96-132	qwen3-235b-a22b-instruct-2507	Alibaba · Apache 2.0	1430	±3		45,199	$0.26 / $1.06	N/A
116	82-149	deepseek-v3.1-terminus-thinking	DeepSeek · MIT	1429	±14		1,677	$0.27 / $1	163.8K
117	88-144	grok-4-fast-chat	SpaceXAI · Proprietary	1429	±10		3,241	$3 / $15	256K
118	94-140	deepseek-v3.1	DeepSeek · MIT	1428	±8		6,806	$1.23 / $4.94	N/A
119	100-137	mistral-large-3	Mistral · Apache 2.0	1428	±4		28,186	$0.50 / $1.50	N/A
120	99-140	kimi-k2-0711-preview	Moonshot · Modified MIT	1426	±6		13,270	$0.60 / $2.50	131.1K
121	96-144	qwen3-vl-235b-a22b-instruct	Alibaba · Apache 2.0	1426	±9		5,667	$0.21 / $1.90	262.1K
122	102-142	qwen3.5-27b	Alibaba · Apache 2.0	1426	±6		12,878	$0.20 / $1.56	262.1K
123	103-142	claude-opus-4-20250514	Anthropic · Proprietary	1425	±5		21,528	$15 / $75	200K
124	83-158	muse-glimmer	Meta · Apache-2.0	1425	±15		1,519	N/A	N/A
125	108-140	mistral-medium-2508	Mistral · Proprietary	1424	±4		44,463	$0.40 / $2	131.1K
126	102-151	kimi-k2-0905-preview	Moonshot · Modified MIT	1423	±8		5,487	$0.60 / $2.50	262.1K
127	96-158	ernie-5.0-preview-1022	Baidu · Proprietary	1422	±12		2,394	N/A	N/A
128	103-151	longcat-flash-chat	Meituan · MIT	1422	±8		5,386	$0.20 / $0.80	131.1K
129	110-144	gpt-4.1-2025-04-14	OpenAI · Proprietary	1422	±5		25,779	$2 / $8	1M
130	100-158	hunyuan-hy3-preview	Tencent · tencent-hunyuan-community	1422	±11		3,223	$0.29 / $1.17	262.1K
131	94-159	deepseek-v3.1-terminus	DeepSeek · MIT	1422	±14		1,857	$0.27 / $1	163.8K
132	110-151	glm-4.5	Z.ai · MIT	1420	±6		11,498	$0.60 / $2.20	131.1K
133	110-151	grok-3-preview-02-24	SpaceXAI · Proprietary	1420	±5		18,081	$3 / $15	131.1K
134	99-164	amazon-nova-experimental-chat-12-10	Amazon · Proprietary	1419	±14		1,676	N/A	N/A
135	115-151	grok-4-0709	SpaceXAI · Proprietary	1418	±5		20,362	$3 / $15	256K
136	109-159	Inkling Small	Thinky · Apache 2.0	1417	±9		4,335	$0.45 / $1.20	524.3K
137	116-157	mimo-v2-flash (non-thinking)	Xiaomi · MIT	1417	±5		21,145	$0.10 / $0.30	262.1K
138	115-158	claude-sonnet-4-20250514-thinking-32k	Anthropic · Proprietary	1417	±6		16,857	$3 / $15	1M
139	119-158	minimax-m2.5	MiniMax · Modified MIT	1415	±5		19,052	$0.23 / $0.90	204.8K
140	121-158	gpt-5.4-nano-high	OpenAI · Proprietary	1415	±5		27,592	$0.20 / $1.25	400K
141	119-162	grok-4-fast-reasoning	SpaceXAI · Proprietary	1413	±7		9,341	$0.20 / $0.50	2M
142	121-162	deepseek-r1	DeepSeek · MIT	1413	±6		10,721	$0.70 / $2.50	64K
143	126-158	gemini-2.5-flash	Google · Proprietary	1412	±3		59,604	$0.15 / $1.25	1M
144	125-162	o1-2024-12-17	OpenAI · Proprietary	1412	±6		16,316	$15 / $60	200K
145	125-164	qwen3.5-35b-a3b	Alibaba · Apache 2.0	1411	±6		13,680	$0.25 / $1.25	262.1K
146	125-164	gemini-2.5-flash-preview-09-2025	Google · Proprietary	1411	±5		15,957	$0.30 / $2.50	1M
147	125-165	qwen3-next-80b-a3b-instruct	Alibaba · Apache 2.0	1410	±6		10,964	$0.09 / $1.10	262.1K
148	126-164	step-3.5-flash	StepFun · Apache 2.0	1410	±5		25,208	$0.10 / $0.30	262.1K
149	125-166	o1-preview	OpenAI · Proprietary	1409	±6		15,891	$15 / $60	N/A
150	108-182	solar-pro4	Upstage · Proprietary	1408	±19		999	$0.03 / $0.12	524.3K
151	131-167	qwen3.5-flash	Alibaba · Proprietary	1408	±5		26,028	N/A	N/A
152	131-167	deepseek-v3-0324	DeepSeek · MIT	1408	±5		23,336	$3 / $4.50	32.8K
153	113-182	hunyuan-vision-1.5-thinking	Tencent · Proprietary	1407	±17		1,111	N/A	N/A
154	132-169	qwen3-235b-a22b-no-thinking	Alibaba · Apache 2.0	1406	±5		18,658	$0.46 / $1.82	131.1K
155	131-173	mimo-v2-flash (thinking)	Xiaomi · MIT	1404	±9		4,933	$0.10 / $0.30	262.1K
156	131-173	qwen3-235b-a22b-thinking-2507	Alibaba · Apache 2.0	1404	±9		4,392	$0.23 / $2.30	262.1K
157	131-175	qwen3-vl-235b-a22b-thinking	Alibaba · Apache 2.0	1403	±9		3,914	$0.40 / $4	131.1K
158	141-171	o4-mini-2025-04-16	OpenAI · Proprietary	1403	±5		23,070	$1.10 / $4.40	200K
159	141-172	claude-3-7-sonnet-20250219-thinking-32k	Anthropic · Proprietary	1403	±5		20,362	$3 / $15	200K
160	139-172	mistral-medium-2505	Mistral · Proprietary	1402	±6		16,736	$0.40 / $2	131.1K
161	141-175	minimax-m2.1-preview	MiniMax · MIT	1401	±7		7,648	$0.30 / $1.20	204.8K
162	144-175	qwen3-coder-480b-a35b-instruct	Alibaba · Apache 2.0	1400	±6		12,410	$0.40 / $1.60	262.1K
163	148-176	trinity-large-preview	Apache 2.0	1399	±6		14,095	$0.15 / $0.45	131K
164	150-177	gpt-4.1-mini-2025-04-14	OpenAI · Proprietary	1398	±5		19,820	$0.40 / $1.60	1M
165	149-178	gpt-5-mini-high	OpenAI · Proprietary	1398	±6		12,808	$0.13 / $1	400K
166	152-178	claude-sonnet-4-20250514	Anthropic · Proprietary	1397	±5		19,548	$3 / $15	1M
167	131-197	glm-4.6v	Z.ai · MIT	1396	±16		1,299	$0.30 / $0.90	131.1K
168	152-188	glm-4.7-flash	Z.ai · MIT	1394	±8		5,300	$0.06 / $0.40	202.8K
169	153-187	qwen3-30b-a3b-instruct-2507	Alibaba · Apache 2.0	1393	±6		11,114	$0.05 / $0.19	262.1K
170	153-193	hunyuan-turbos-20250416	Tencent · Proprietary	1391	±8		5,679	N/A	N/A
171	144-204	nvidia-nemotron-3.5-lightning-30b-a3b-nvfp4	Nvidia · OpenMDW-1.1	1390	±16	Preliminary	1,465	N/A	N/A
172	158-192	glm-4.5-air	Z.ai · MIT	1389	±5		14,894	$0.13 / $0.85	131.1K
173	161-193	qwen3-235b-a22b	Alibaba · Apache 2.0	1387	±6		13,504	$0.46 / $1.82	131.1K
174	158-198	qwen3-next-80b-a3b-thinking	Alibaba · Apache 2.0	1386	±8		6,668	$0.15 / $1.20	262.1K
175	154-206	hunyuan-t1-20250711	Tencent · Proprietary	1385	±13		2,096	N/A	N/A
176	165-196	claude-3-7-sonnet-20250219	Anthropic · Proprietary	1385	±5		23,531	$3 / $15	200K
177	167-196	gemini-2.5-flash-lite-preview-09-2025-no-thinking	Google · Proprietary	1385	±5		22,721	$0.10 / $0.40	1M
178	156-206	intellect-3	MIT	1384	±11		2,636	$0.20 / $1.10	131.1K
179	165-199	trinity-large-thinking	Apache 2.0	1384	±6		13,774	$0.22 / $0.85	262.1K
180	167-199	minimax-m1	MiniMax · Apache 2.0	1384	±5		16,870	$0.55 / $2.20	1M
181	167-198	claude-3-5-sonnet-20241022	Anthropic · Proprietary	1383	±4		46,486	$3 / $15	200K
182	163-206	nvidia-nemotron-3-super-120b-a12b	Nvidia · NVIDIA Open Model	1382	±10		3,471	N/A	N/A
183	167-202	qwen2.5-max	Alibaba · Proprietary	1382	±5		18,707	N/A	N/A
184	162-209	glm-4.5v	Z.ai · MIT	1381	±12		2,380	$0.60 / $1.80	65.5K
185	167-204	mistral-small-2506	Mistral · Apache 2.0	1380	±7		8,537	$0.10 / $0.30	32K
186	169-204	gemini-2.5-flash-lite-preview-06-17-thinking	Google · Proprietary	1379	±6		15,839	$0.10 / $0.40	1M
187	169-206	o3-mini-high	OpenAI · Proprietary	1379	±7		11,130	$0.55 / $2.20	200K
188	169-206	amazon-nova-experimental-chat-11-10	Amazon · Proprietary	1379	±6		11,729	N/A	N/A
189	169-209	amazon-nova-experimental-chat-10-20	Amazon · Proprietary	1377	±8		5,603	N/A	N/A
190	165-222	llama-3.1-nemotron-ultra-253b-v1	Nvidia · Nvidia Open Model	1375	±15		1,491	$0.60 / $1.80	131.1K
191	165-222	llama-3.3-nemotron-49b-super-v1	Nvidia · Nvidia	1374	±16		1,250	N/A	N/A
192	177-208	gemma-3-27b-it	Google · Gemma	1374	±5		24,866	$0.08 / $0.45	262.1K
193	170-215	step-3	StepFun · Apache 2.0	1373	±10		3,178	$0.57 / $1.42	65.5K
194	174-212	grok-3-mini-high	SpaceXAI · Proprietary	1373	±7		8,471	$0.25 / $1.27	N/A
195	168-225	amazon-nova-experimental-chat-10-09	Amazon · Proprietary	1371	±15		1,401	N/A	N/A
196	172-218	ling-flash-2.0	Ant Group · MIT	1371	±10		3,410	N/A	N/A
197	172-222	minimax-m2	MiniMax · Apache 2.0	1370	±10		3,399	$0.26 / $1.02	204.8K
198	180-214	deepseek-v3	DeepSeek · DeepSeek	1370	±6		12,866	$1.14 / $4.56	N/A
199	180-215	grok-3-mini-beta	SpaceXAI · Proprietary	1369	±6		11,659	$0.30 / $0.50	131.1K
200	188-216	gemini-2.0-flash-001	Google · Proprietary	1367	±5		24,809	$0.10 / $0.40	1M
201	188-218	command-a-03-2025	Cohere · CC-BY-NC-4.0	1366	±4		28,590	$2.50 / $10	256K
202	172-233	mercury-2	Inception AI · Proprietary	1365	±16		1,394	$0.25 / $0.75	128K
203	179-229	qwen3-32b	Alibaba · Apache 2.0	1365	±12		2,230	$0.08 / $0.28	131.1K
204	175-232	nvidia-llama-3.3-nemotron-super-49b-v1.5	Nvidia · Nvidia Open	1365	±14		1,547	$0.10 / $0.40	131.1K
205	183-225	olmo-3.1-32b-instruct	Ai2 · Apache 2.0	1365	±8		5,520	$0.20 / $0.60	65.5K
206	191-222	o3-mini	OpenAI · Proprietary	1363	±4		30,472	$0.55 / $2.20	200K
207	179-236	hunyuan-turbos-20250226	Tencent · Proprietary	1362	±15		1,310	N/A	N/A
208	189-229	nova-2-lite	Amazon · Proprietary	1361	±8		5,786	$0.30 / $2.50	1M
209	192-225	llama-3.1-405b-instruct-bf16	Meta · Llama 3.1 Community	1361	±5		23,318	$4 / $4	32.8K
210	191-226	gpt-oss-120b	OpenAI · Apache 2.0	1360	±6		14,764	$0.03 / $0.17	131.1K
211	183-242	hunyuan-turbo-0110	Tencent · Proprietary	1359	±14		1,319	N/A	N/A
212	193-229	qwq-32b	Alibaba · Apache 2.0	1358	±6		13,725	$0.50 / $1	16.4K
213	196-229	llama-3.1-405b-instruct-fp8	Meta · Llama 3.1 Community	1357	±5		32,442	$4 / $4	32.8K
214	198-231	gpt-4o-2024-05-13	OpenAI · Proprietary	1356	±5		60,226	$5 / $15	128K
215	196-232	gemini-2.0-flash-lite-preview-02-05	Google · Proprietary	1356	±5		14,891	$0.07 / $0.30	1M
216	198-231	gemini-1.5-pro-002	Google · Proprietary	1356	±4		30,133	$3.50 / $10.50	2.1M
217	191-240	qwen-plus-0125	Alibaba · Proprietary	1356	±10		3,425	$0.40 / $1.20	131.1K
218	198-236	yi-lightning	Proprietary	1354	±7		13,650	N/A	N/A
219	192-243	step-2-16k-exp-202412	StepFun · Proprietary	1354	±11		2,781	N/A	N/A
220	202-235	o1-mini	OpenAI · Proprietary	1353	±5		27,352	$1.10 / $4.40	N/A
221	195-244	glm-4-plus-0111	Z.ai · Proprietary	1352	±10		3,466	N/A	N/A
222	198-248	gemma-3-12b-it	Google · Gemma	1349	±12		2,330	$0.05 / $0.15	131.1K
223	206-242	claude-3-5-sonnet-20240620	Anthropic · Proprietary	1349	±4		44,433	$3 / $15	200K
224	202-248	ring-flash-2.0	Ant Group · MIT	1348	±10		3,482	N/A	N/A
225	206-243	gpt-4o-2024-08-06	OpenAI · Proprietary	1348	±5		25,286	$2.50 / $10	128K
226	202-251	olmo-3-32b-think	Ai2 · Apache 2.0	1346	±11		2,824	$0.15 / $0.50	65.5K
227	179-273	molmo-2-8b	Ai2 · Apache 2.0	1346	±31		375	$0.20 / $0.20	36.9K
228	214-244	grok-2-2024-08-13	SpaceXAI · Proprietary	1346	±5		34,362	$2 / $10	131.1K
229	210-245	qwen3-30b-a3b	Alibaba · Apache 2.0	1346	±6		13,430	$0.13 / $0.52	131.1K
230	206-251	gpt-5-nano-high	OpenAI · Proprietary	1344	±9		4,022	$0.03 / $0.20	400K
231	216-246	llama-3.3-70b-instruct	Meta · Llama-3.3	1344	±4		30,170	$0.10 / $0.32	131.1K
232	205-258	hunyuan-large-2025-02-10	Tencent · Proprietary	1344	±12		2,255	N/A	N/A
233	212-250	nvidia-nemotron-3-nano-30b-a3b-bf16	Nvidia · NVIDIA Open Model	1343	±8		7,220	$0.06 / $0.24	262.1K
234	215-248	gemini-advanced-0514	Google · Proprietary	1343	±6		26,318	N/A	N/A
235	210-255	olmo-3.1-32b-think	Ai2 · Apache 2.0	1342	±10		3,829	$0.15 / $0.50	65.5K
236	218-250	llama-4-scout-17b-16e-instruct	Meta · Llama	1341	±6		14,486	$0.40 / $0.70	8.2K
237	218-250	gpt-4-turbo-2024-04-09	OpenAI · Proprietary	1341	±5		55,116	$10 / $30	128K
238	218-250	llama-4-maverick-17b-128e-instruct	Meta · Llama 4	1341	±5		20,472	$0.63 / $1.80	131.1K
239	215-260	gpt-4.1-nano-2025-04-14	OpenAI · Proprietary	1340	±10		3,528	$0.10 / $0.40	1M
240	223-255	mistral-large-2407	Mistral · Mistral Research	1337	±5		24,863	$2 / $6	131.1K
241	225-255	claude-3-5-haiku-20241022	Anthropic · Proprietary	1337	±4		37,411	$1 / $5	200K
242	218-267	deepseek-v2.5-1210	DeepSeek · DeepSeek	1336	±10		3,776	N/A	N/A
243	221-267	step-1o-turbo-202506	StepFun · Proprietary	1334	±9		4,360	N/A	N/A
244	226-269	gpt-oss-20b	OpenAI · Apache 2.0	1331	±9		5,094	$0.03 / $0.13	131.1K
245	227-269	qwen2.5-plus-1127	Alibaba · Proprietary	1331	±8		5,804	N/A	N/A
246	219-273	granite-4.1-8b	IBM · Apache 2.0	1331	±14		1,956	$0.05 / $0.10	131.1K
247	230-267	athene-v2-chat	NexusFlow	1331	±6		13,676	N/A	N/A
248	236-269	gemini-1.5-pro-001	Google · Proprietary	1330	±5		42,538	$3.50 / $10.50	2.1M
249	227-272	llama-3.1-nemotron-70b-instruct	Nvidia · Llama 3.1	1329	±10		3,714	$1.20 / $1.20	131.1K
250	236-269	gpt-4o-mini-2024-07-18	OpenAI · Proprietary	1329	±4		37,775	$0.15 / $0.60	128K
251	234-269	athene-70b-0725	CC-BY-NC-4.0	1328	±7		11,268	N/A	N/A
252	236-269	gemma-3n-e4b-it	Google · Gemma	1328	±6		10,972	$0.06 / $0.12	32.8K
253	230-272	magistral-medium-2506	Mistral · Proprietary	1328	±9		5,014	$2 / $5	40K
254	236-271	qwen-max-0919	Alibaba · Qwen	1327	±7		8,347	$1.60 / $6.40	32.8K
255	240-269	llama-3-70b-instruct	Meta · Llama 3 Community	1326	±5		90,553	$0.51 / $0.74	8.2K
256	219-276	mercury	Inception AI · Proprietary	1325	±20		951	$0.25 / $0.75	128K
257	239-272	glm-4-plus	Z.ai · Proprietary	1325	±6		13,191	$0.44 / $1.76	204.8K
258	240-271	gpt-4-1106-preview	OpenAI · Proprietary	1325	±5		64,698	$10 / $30	128K
259	241-272	gpt-4-0125-preview	OpenAI · Proprietary	1324	±5		54,967	$10 / $30	128K
260	241-271	claude-3-opus-20240229	Anthropic · Proprietary	1324	±4		108,426	$15 / $75	200K
261	241-273	mistral-small-3.1-24b-instruct-2503	Mistral · Apache 2.0	1322	±6		15,991	$0.10 / $0.30	32K
262	241-273	mistral-large-2411	Mistral · MRL	1321	±5		16,289	$2 / $6	128K
263	241-273	llama-3.1-70b-instruct	Meta · Llama 3.1 Community	1321	±5		29,694	$0.40 / $0.40	131.1K
264	241-273	grok-2-mini-2024-08-13	SpaceXAI · Proprietary	1321	±5		28,429	$2 / $10	131.1K
265	239-276	hunyuan-standard-2025-02-10	Tencent · Proprietary	1319	±12		2,312	N/A	N/A
266	244-274	deepseek-v2.5	DeepSeek · DeepSeek	1318	±6		12,845	N/A	N/A
267	239-277	llama-3.1-nemotron-51b-instruct	Nvidia · Llama 3.1	1318	±14		1,794	N/A	N/A
268	251-275	qwen2.5-72b-instruct	Alibaba · Qwen	1316	±5		20,561	$1.20 / $1.20	N/A
269	244-276	jamba-1.5-large	Jamba Open	1315	±9		4,915	$2 / $8	256K
270	254-275	gemini-1.5-flash-002	Google · Proprietary	1314	±5		18,364	$0.07 / $0.30	1M
271	241-278	hunyuan-large-vision	Tencent · Proprietary	1314	±12		2,757	N/A	N/A
272	251-284	gemma-3-4b-it	Google · Gemma	1309	±12		2,572	$0.05 / $0.10	131.1K
273	258-287	ibm-granite-h-small	IBM · Apache 2.0	1306	±12		2,831	N/A	N/A
274	265-281	amazon-nova-pro-v1.0	Amazon · Proprietary	1305	±6		14,188	$0.80 / $3.20	300K
275	264-288	llama-3.1-tulu-3-70b	Ai2 · Llama 3.1	1302	±13		1,629	N/A	N/A
276	267-285	gpt-4-0314	OpenAI · Proprietary	1301	±6		35,534	$30 / $60	8.2K
277	271-286	gemma-2-27b-it	Google · Gemma license	1299	±4		41,283	$0.65 / $0.65	8.2K
278	270-288	gemma-2-9b-it-simpo	MIT	1297	±9		5,834	$0.03 / $0.09	8.2K
279	272-288	mistral-small-24b-instruct-2501	Mistral · Apache 2.0	1294	±7		8,740	$0.05 / $0.08	32.8K
280	273-288	gpt-4-0613	OpenAI · Proprietary	1293	±5		57,478	$30 / $60	8.2K
281	272-290	reka-core-20240904	Proprietary	1292	±9		3,934	N/A	N/A
282	274-289	gemini-1.5-flash-001	Google · Proprietary	1290	±5		33,810	$0.07 / $0.30	1M
283	277-289	claude-3-sonnet-20240229	Anthropic · Proprietary	1288	±5		60,970	$3 / $15	200K
284	275-292	nemotron-4-340b-instruct	Nvidia · NVIDIA Open Model	1288	±7		10,292	N/A	N/A
285	273-294	glm-4-0520	Z.ai · Proprietary	1288	±9		5,169	N/A	N/A
286	272-298	olmo-2-0325-32b-instruct	Ai2 · Apache-2.0	1287	±13		2,025	$0.05 / $0.20	128K
287	276-294	command-r-plus-08-2024	Cohere · CC-BY-NC-4.0	1286	±8		5,305	$2.50 / $10	128K
288	273-298	qwen2.5-coder-32b-instruct	Alibaba · Apache 2.0	1286	±11		2,652	$0.87 / $0.87	32K
289	283-298	gemma-2-9b-it	Google · Gemma license	1278	±5		29,787	$0.03 / $0.09	8.2K
290	281-303	reka-flash-20240904	Proprietary	1276	±9		4,032	N/A	N/A
291	284-303	qwen2-72b-instruct	Alibaba · Qianwen LICENSE	1275	±6		19,928	$0.90 / $0.90	32.8K
292	285-303	c4ai-aya-expanse-32b	Cohere · CC-BY-NC-4.0	1274	±6		14,358	N/A	N/A
293	285-303	amazon-nova-lite-v1.0	Amazon · Proprietary	1274	±6		11,044	$0.06 / $0.24	300K
294	284-304	jamba-1.5-mini	Jamba Open	1272	±9		5,087	$0.20 / $0.40	256K
295	287-303	phi-4	Microsoft · MIT	1272	±6		14,101	$0.07 / $0.14	16.4K
296	287-303	command-r-plus	Cohere · CC-BY-NC-4.0	1271	±5		42,376	$2.50 / $10	128K
297	287-303	claude-3-haiku-20240307	Anthropic · Proprietary	1270	±5		64,537	$0.25 / $1.25	200K
298	287-305	deepseek-coder-v2	DeepSeek · DeepSeek License	1270	±8		8,140	$0.14 / $0.28	128K
299	290-306	gemini-1.5-flash-8b-001	Google · Proprietary	1267	±6		18,467	$0.07 / $0.30	1M
300	290-307	mistral-large-2402	Mistral · Proprietary	1266	±6		36,796	$4 / $12	32K
301	290-307	llama-3-8b-instruct	Meta · Llama 3 Community	1265	±5		61,703	$0.14 / $0.14	8.2K
302	290-313	command-r-08-2024	Cohere · CC-BY-NC-4.0	1262	±8		5,416	$0.15 / $0.60	128K
303	290-317	ministral-8b-2410	Mistral · MRL	1257	±12		2,322	$0.10 / $0.10	131.1K
304	297-316	qwen1.5-110b-chat	Alibaba · Qianwen LICENSE	1257	±7		13,896	N/A	N/A
305	299-317	amazon-nova-micro-v1.0	Amazon · Proprietary	1255	±6		10,991	$0.04 / $0.14	128K
306	302-317	mixtral-8x22b-instruct-v0.1	Mistral · Apache 2.0	1252	±6		29,892	$0.90 / $0.90	65.5K
307	302-318	qwen1.5-72b-chat	Alibaba · Qianwen LICENSE	1251	±6		25,039	N/A	N/A
308	302-322	yi-1.5-34b-chat	Apache-2.0	1249	±7		12,503	N/A	N/A
309	298-326	granite-3.1-8b-instruct	IBM · Apache 2.0	1248	±14		1,737	N/A	N/A
310	302-324	gemini-pro-dev-api	Google · Proprietary	1247	±9		12,477	$0.35 / $1.05	32.8K
311	302-324	mistral-medium	Mistral · Proprietary	1247	±6		23,846	$2.70 / $8.10	32K
312	300-330	hunyuan-standard-256k	Tencent · Proprietary	1245	±16		1,278	N/A	N/A
313	302-330	gemini-pro	Google · Proprietary	1242	±13		5,086	$0.35 / $1.05	32.8K
314	303-328	reka-flash-21b-20240226-online	Proprietary	1242	±9		8,935	N/A	N/A
315	303-331	zephyr-orpo-141b-A35b-v0.1	Apache 2.0	1240	±13		2,702	N/A	N/A
316	303-331	llama-3.1-tulu-3-8b	Ai2 · Llama 3.1	1239	±14		1,633	N/A	N/A
317	307-329	reka-flash-21b-20240226	Proprietary	1238	±7		14,444	N/A	N/A
318	304-331	granite-3.0-8b-instruct	IBM · Apache 2.0	1238	±11		3,296	N/A	N/A
319	308-328	llama-3.1-8b-instruct	Meta · Llama 3.1 Community	1237	±5		26,610	$0.05 / $0.08	131.1K
320	308-328	gpt-3.5-turbo-0125	OpenAI · Proprietary	1237	±6		39,956	$0.50 / $1.50	16.4K
321	308-328	command-r	Cohere · CC-BY-NC-4.0	1237	±6		29,623	$0.15 / $0.60	128K
322	308-331	internlm2_5-20b-chat	Other	1234	±9		4,966	$0 / $0	32.8K
323	309-331	c4ai-aya-expanse-8b	Cohere · CC-BY-NC-4.0	1233	±9		5,497	N/A	N/A
324	311-331	phi-3-medium-4k-instruct	Microsoft · MIT	1230	±7		13,283	$0.17 / $0.68	N/A
325	311-331	mixtral-8x7b-instruct-v0.1	Mistral · Apache 2.0	1229	±5		46,298	$0.63 / $0.63	32K
326	309-341	granite-3.1-2b-instruct	IBM · Apache 2.0	1227	±14		1,739	N/A	N/A
327	312-335	dbrx-instruct-preview	DBRX LICENSE	1226	±8		18,053	$0.60 / $0.60	32.8K
328	312-340	llama-3.2-3b-instruct	Meta · Llama 3.2	1224	±10		4,157	$0.05 / $0.33	131.1K
329	316-338	qwen1.5-32b-chat	Alibaba · Qianwen LICENSE	1223	±8		11,877	N/A	N/A
330	319-336	gemma-2-2b-it	Google · Gemma license	1222	±5		25,669	N/A	N/A
331	317-343	gpt-3.5-turbo-1106	OpenAI · Proprietary	1220	±10		12,878	$1 / $2	16.4K
332	326-348	wizardlm-70b	Microsoft · Llama 2 Community	1213	±10		6,411	N/A	N/A
333	326-348	phi-3-small-8k-instruct	Microsoft · MIT	1211	±8		9,107	$0.15 / $0.60	N/A
334	327-348	yi-34b-chat	Yi License	1210	±8		10,572	$0.90 / $0.90	4.1K
335	329-348	gemma-1.1-7b-it	Google · Gemma license	1208	±7		12,733	$0.03 / $0.09	8.2K
336	328-351	qwen1.5-14b-chat	Alibaba · Qianwen LICENSE	1208	±9		9,520	$0.30 / $0.30	N/A
337	328-351	openchat-3.5-0106	Apache-2.0	1207	±9		8,216	N/A	N/A
338	330-348	llama-2-70b-chat	Meta · Llama 2 Community	1207	±6		26,045	$0.70 / $2.80	4.1K
339	326-352	openhermes-2.5-mistral-7b	Apache-2.0	1207	±12		3,857	$0.17 / $0.17	N/A
340	326-353	deepseek-llm-67b-chat	DeepSeek · DeepSeek License	1205	±13		3,820	N/A	N/A
341	329-353	tulu-2-dpo-70b	AI2 ImpACT Low-risk	1205	±11		5,039	N/A	N/A
342	332-353	starling-lm-7b-beta	Apache-2.0	1201	±9		9,101	N/A	N/A
343	331-354	openchat-3.5	Apache-2.0	1201	±11		6,196	$0.20 / $0.20	N/A
344	331-356	granite-3.0-2b-instruct	IBM · Apache 2.0	1201	±11		3,330	N/A	N/A
345	332-353	snowflake-arctic-instruct	Apache 2.0	1201	±8		20,419	N/A	N/A
346	332-353	vicuna-33b	Non-commercial	1200	±7		16,692	$0 / $0	2K
347	332-356	starling-lm-7b-alpha	CC-BY-NC-4.0	1196	±9		7,238	N/A	N/A
348	337-356	phi-3-mini-4k-instruct-june-2024	Microsoft · MIT	1192	±8		6,694	$0.13 / $0.52	4.1K
349	332-361	nous-hermes-2-mixtral-8x7b-dpo	Apache-2.0	1191	±13		3,033	$0.90 / $0.90	N/A
350	339-357	mistral-7b-instruct-v0.2	Mistral · Apache-2.0	1189	±8		12,723	$0.20 / $0.20	32.8K
351	337-369	solar-10.7b-instruct-v1.0	CC-BY-NC-4.0	1184	±14		3,277	$0.30 / $0.30	N/A
352	337-371	dolphin-2.2.1-mistral-7b	Apache-2.0	1182	±17		1,302	$0.50 / $0.50	16.4K
353	340-371	mpt-30b-chat	CC-BY-NC-SA-4.0	1182	±14		2,056	N/A	N/A
354	345-372	llama2-70b-steerlm-chat	Nvidia · Llama 2 Community	1178	±14		2,751	N/A	N/A
355	346-373	qwq-32b-preview	Alibaba · Apache 2.0	1175	±15		1,783	$0.50 / $1	16.4K
356	350-372	llama-2-13b-chat	Meta · Llama 2 Community	1172	±8		13,860	$0.25 / $0.25	4.1K
357	349-373	wizardlm-13b	Microsoft · Llama 2 Community	1172	±10		5,508	$0.30 / $0.30	N/A
358	350-373	phi-3-mini-4k-instruct	Microsoft · MIT	1172	±8		10,322	$0.13 / $0.52	N/A
359	346-375	falcon-180b-chat	Falcon-180B TII License	1171	±19		1,047	N/A	N/A
360	350-373	gemma-7b-it	Google · Gemma license	1168	±11		5,689	$0.05 / $0.08	8.2K
361	351-373	zephyr-7b-beta	MIT	1167	±10		8,764	$0.15 / $0.15	16.4K
362	351-373	palm-2	Google · Proprietary	1166	±10		6,912	$0.50 / $0.50	25.8K
363	351-373	llama-3.2-1b-instruct	Meta · Llama 3.2	1166	±10		4,320	$0.03 / $0.20	60K
364	351-375	qwen1.5-7b-chat	Alibaba · Qianwen LICENSE	1163	±11		3,243	$0.20 / $0.20	N/A
365	351-374	phi-3-mini-128k-instruct	Microsoft · MIT	1163	±9		12,596	$0.13 / $0.52	N/A
366	352-374	vicuna-13b	Llama 2 Community	1162	±8		14,788	$0.30 / $0.30	N/A
367	351-375	codellama-34b-instruct	Meta · Llama 2 Community	1161	±10		5,804	$0.35 / $1.40	16.4K
368	350-377	smollm2-1.7b-instruct	Apache 2.0	1160	±19		1,111	N/A	N/A
369	351-377	zephyr-7b-alpha	MIT	1158	±17		1,415	N/A	N/A
370	352-376	guanaco-33b	Non-commercial	1156	±13		2,352	N/A	N/A
371	354-377	qwen-14b-chat	Alibaba · Qianwen LICENSE	1153	±12		3,849	N/A	N/A
372	351-378	codellama-70b-instruct	Meta · Llama 2 Community	1152	±22		695	$0.70 / $2.80	16.4K
373	356-377	stripedhyena-nous-7b	Apache 2.0	1152	±12		3,987	$0.20 / $0.20	N/A
374	363-377	llama-2-7b-chat	Meta · Llama 2 Community	1147	±8		10,259	$0.15 / $0.15	4.1K
375	365-378	mistral-7b-instruct	Mistral · Apache 2.0	1142	±10		7,073	$0.07 / $0.28	4.1K
376	368-378	gemma-1.1-2b-it	Google · Gemma license	1139	±10		5,934	N/A	N/A
377	369-379	vicuna-7b	Llama 2 Community	1132	±10		5,577	$0.20 / $0.20	N/A
378	374-382	gemma-2b-it	Google · Gemma license	1119	±13		3,028	$0.10 / $0.10	N/A
379	377-385	olmo-7b-instruct	Ai2 · Apache-2.0	1110	±13		4,043	$0.20 / $0.20	N/A
380	378-385	qwen1.5-4b-chat	Alibaba · Qianwen LICENSE	1106	±11		4,756	$0.10 / $0.10	N/A
381	378-385	koala-13b	Non-commercial	1099	±11		5,711	N/A	N/A
382	378-385	gpt4all-13b-snoozy	Non-commercial	1095	±17		1,388	N/A	N/A
383	379-385	alpaca-13b	Non-commercial	1093	±12		4,750	N/A	N/A
384	379-385	mpt-7b-chat	CC-BY-NC-SA-4.0	1087	±13		3,278	N/A	N/A
385	379-385	chatglm3-6b	Apache-2.0	1086	±13		3,600	N/A	N/A
386	386-388	RWKV-4-Raven-14B	Apache 2.0	1059	±13		3,997	N/A	N/A
387	386-388	chatglm2-6b	Apache-2.0	1056	±15		2,059	N/A	N/A
388	386-388	oasst-pythia-12b	Apache 2.0	1050	±12		5,212	N/A	N/A
389	389-390	fastchat-t5-3b	Apache 2.0	1023	±13		3,442	N/A	N/A
390	389-391	chatglm-6b	Non-commercial	1015	±14		4,055	N/A	N/A
391	390-393	dolly-v2-12b	MIT	995	±15		2,765	N/A	N/A
392	391-393	llama-13b	Meta · Non-commercial	984	±17		1,953	$0.23 / $0.23	N/A
393	391-393	stablelm-tuned-alpha-7b	CC-BY-NC-SA-4.0	976	±14		2,707	N/A	N/A
```

<!-- APPEND_MARKER -->

