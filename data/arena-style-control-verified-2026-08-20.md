# LM Arena Text with Style Control on: the four boards this page scores

Read 20 August 2026, board dated Aug 19 2026. Pasted from the rendered page by
the site owner, who confirmed the toggle state on each board directly.

Earlier in the same session two captures were labeled backwards, because the
setting was inferred from a control in the page text rather than from the
toggle. Boards read with the correction on print "Default" by the plots;
boards read with it off print "Remove Style Control". That is the opposite of
how it was first read, and it is the reason a whole set of findings had to be
withdrawn. Page furniture is not provenance.

| arena slug | Hard Prompts | Creative Writing | Instruction Following | Longer Query |
| --- | --- | --- | --- | --- |
| claude-fable-5 | 1532 | 1509 | 1512 | 1522 |
| claude-opus-5-high | 1519 | 1474 | 1498 | 1509 |
| claude-opus-5-max | 1512 | 1464 | 1489 | 1499 |
| claude-sonnet-5-high | 1491 | 1436 | 1467 | 1482 |
| gpt-5.6-sol-xhigh | 1505 | 1474 | 1483 | 1492 |
| gpt-5.6-terra-xhigh | 1486 | 1421 | 1460 | 1468 |
| gpt-5.6-luna-xhigh | 1472 | 1408 | 1443 | 1452 |
| qwen3.8-max | 1507 | 1472 | 1476 | 1497 |
| kimi-k3-max | 1518 | 1458 | 1485 | 1500 |
| glm-5.3-max | 1502 | 1467 | 1483 | 1483 |
| glm-5.2-max | 1488 | 1450 | 1462 | 1478 |
| grok-4.5 | 1494 | 1447 | 1465 | 1485 |
| grok-4.6-high | 1485 | 1459 | 1458 | 1480 |
| gemini-3.1-pro-preview | 1507 | 1479 | 1480 | 1499 |
| gemini-3.6-flash-high | 1501 | 1469 | 1475 | 1486 |
| gemini-3.7-flash-high | 1507 | 1493 | 1486 | 1499 |
| muse-spark-1.1 | 1510 | 1446 | 1474 | 1477 |
| muse-spark-1.2 (xHigh) | 1511 | 1451 | 1477 | 1499 |
| deepseek-v4-pro-high-20260813 | 1488 | 1408 | 1461 | 1480 |

## Reading the correction

Elo is a relative fit. Turning Style Control on refits the entire board, so the
scale moves and a raw before and after is not like for like. The median model
shifts 21 points on Hard Prompts, 8 on Instruction Following and 33 on Coding.
Those numbers are the scale, not the models. Centering each board on its median
model is what isolates who gains and loses against the field.

Centered, the effect is a property of the model and hardly varies by task. A
model's figure on one board predicts its figure on another at r = 0.955 to
0.977 across the three boards where both settings were read. A model that wins
on presentation wins that way everywhere, by about the same amount.

Claude Opus 5 is the most presentation-dependent model measured, giving up 27
points at high effort and 33 at max on Hard Prompts, and 31 and 37 on Coding.
Qwen3.8 Max follows near 14 and Gemini 3.7 Flash near 11. Claude Fable 5 is the
flat case, moving a point or less on every board.

## Not captured

Style Control on the WebDev board, which is a separate leaderboard. The picker
scores one WebDev figure and it remains the plain number.
