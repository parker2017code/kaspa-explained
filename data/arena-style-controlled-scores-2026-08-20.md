# LM Arena Text, Style Control on: the four boards this page scores

Read 20 August 2026, board dated Aug 19 2026. Pasted from the rendered page by
the site owner, not scraped. Style Control is Arena's own correction, which
removes formatting and length from the ranking.

These replace the plain Elo for the four Arena figures the picker scores.

| arena slug | Hard Prompts | Creative Writing | Instruction Following | Longer Query |
| --- | --- | --- | --- | --- |
| claude-fable-5 | 1511 | 1501 | 1505 | 1510 |
| claude-opus-5-high | 1511 | 1488 | 1515 | 1518 |
| claude-opus-5-max | 1516 | 1483 | 1511 | 1514 |
| claude-sonnet-5-high | 1481 | 1417 | 1452 | 1464 |
| gpt-5.6-sol-xhigh | 1504 | 1453 | 1475 | 1475 |
| gpt-5.6-terra-xhigh | 1493 | 1404 | 1452 | 1452 |
| gpt-5.6-luna-xhigh | 1485 | 1393 | 1437 | 1436 |
| gemini-3.1-pro-preview | 1490 | 1481 | 1466 | 1483 |
| gemini-3.6-flash-high | 1492 | 1463 | 1468 | 1475 |
| gemini-3.7-flash-high | 1505 | 1490 | 1486 | 1492 |
| grok-4.5 | 1495 | 1437 | 1448 | 1468 |
| grok-4.6-high | 1483 | 1450 | 1446 | 1468 |
| kimi-k3-max | 1499 | 1450 | 1480 | 1490 |
| deepseek-v4-pro-high-20260813 | 1481 | 1404 | 1446 | 1461 |
| glm-5.2-max | 1480 | 1461 | 1453 | 1468 |
| glm-5.3-max | 1496 | 1463 | 1481 | 1477 |
| qwen3.8-max | 1502 | 1485 | 1482 | 1495 |
| muse-spark-1.1 | 1487 | 1438 | 1459 | 1459 |
| muse-spark-1.2 (xHigh) | 1498 | 1446 | 1468 | 1484 |

Vote counts: Hard Prompts 3,570,555 across 393 models. Creative Writing
1,199,344 across 391. Instruction Following 2,577,623 across 393. Longer Query
1,919,397 across 371.

## What the correction is worth

Median style penalty on Overall is 12 points and on Creative Writing 5. The
penalty is a property of the model rather than of the task: a model's Overall
delta predicts its Creative Writing delta at r = 0.849 over 19 models, with a
slope of 0.84. A model that wins on presentation wins that way everywhere, and
creative writing only compresses the effect.

That refuted the obvious guess, which was that style would matter most where
writing matters most. It does not. It matters most in general chat.

## Not captured

Style Control for Coding was not read, so the Coding board is not part of this
and the picker does not score it.
