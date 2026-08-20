# Refreshing the model picker data

Everything the picker shows is derived. Nothing in `model-picker.html` is
hand-maintained: `scripts/emit-picker-blob.py` rebuilds the `window.__MP__`
blob from `data/picker-data.json`, and that file is built from the six pulls
below. To refresh the page you re-pull, rebuild, and run the gate.

## Why it is partitioned this way

The three sources are nothing like the same size. Artificial Analysis and
LiveBench are each one wide table. LM Arena is fifteen separate boards, some
of them 393 models long, and its sub-category scores live behind a different
view from its ranks. One agent reading all of it serially is the whole cost of
a refresh. So the work splits by how much reading each part actually takes,
not by source:

| Pull | Source | What it reads | Size |
| --- | --- | --- | --- |
| 1 | Artificial Analysis | the full model table, one row per effort setting, with price, latency and throughput | 51 lines |
| 2 | LiveBench | the overall table and every category column | 49 lines |
| 3 | LM Arena | board index, score types, board URL map | 103 lines |
| 4 | LM Arena | Agent board and its five behavior signals | 65 lines |
| 5 | LM Arena | Agent board in full, WebDev, Image-to-WebDev | 570 lines |
| 6 | LM Arena | Text Arena overall, seven sub-category boards with scores and intervals, Vision, Document | 880 lines |

Six pulls, run concurrently, each writing one file into `data/`. Four of the
six are LM Arena because LM Arena is four fifths of the reading.

Pull 3 is not redundant with 4, 5 and 6. Arena's board names and its URLs
disagree in places, and the score type differs per board: the Agent board is a
win rate, everything else is Elo. Reading the index separately is what caught
that the Agent board prints the size of a signed number without its sign,
which is why that board is read and not scored.

Do not partition by model. Every board has to be read whole. Ranks and
percentiles only mean something against the full field, and a partial board
gives a normalization taken over a subset, which is a different number wearing
the same name.

## The timing target

Six concurrent pulls is sized so a refresh is one round of reading rather than
six. Wall clock has not been measured, so treat any figure for it as a target
and not a result. The binding constraint is pull 6, which is the longest read
by a wide margin; splitting it further by board is the next move if a refresh
needs to be faster.

## Order of operations

1. Six pulls into `data/<source>-<YYYY-MM-DD>.md`. Read live, never from
   cache, and record the date the board itself displays alongside the date it
   was read. LiveBench dates its release; Arena does not.
2. `python3 scripts/build-picker-data.py` to fold the pulls into
   `data/picker-data.json`.
3. `python3 scripts/emit-picker-blob.py` to rewrite the blob in the page.
   It prints one line per shipped model: measured coverage, estimated figure
   count, price, and which effort setting was chosen. Read that output. A
   model that jumps effort setting between refreshes is worth understanding
   before shipping, because the price on its row moved with it.
4. `python3 scripts/build-agent-index.py`.
5. `bash scripts/check-site.sh`. It must print "Site checks passed."
6. Load the page and confirm the console is clean. The blob is written by
   regex, and a broken blob is a syntax error that kills every script on the
   page, not a visibly wrong number.

## What the emitter decides, and where to argue with it

Three judgment calls live in `scripts/emit-picker-blob.py`, each with its
reasoning next to the constant:

- `COST_PENALTY` picks which effort setting each model ships at. It is set to
  refuse the trade of three times the price for ten more points.
- `IMPUTE_MIN_R` and friends decide when a missing figure gets predicted from
  the figures a model does have. The settings were chosen by hiding each
  model's figures in turn and predicting them blind; the table of what each
  combination scored is in the file.
- `NO_IMPUTE` lists what is never predicted: the three price figures and the
  three speed figures.

Change any of them and rerun the held-out test before shipping. An estimate
that understates its own error is worse than no estimate, because the
simulation discounts an estimate by exactly the interval it declares.

## Tested and rejected

A per-lab offset on the regression: predict a missing figure, then shift it by
how far that lab's other models sit from the same prediction. Measured with
the same held-out test, it moved mean error from 12.5 points to 12.3 and left
calibration untouched, which on 111 predictions is noise. Most labs ship two
or three models here, so the offset is an average of two residuals and the
shrinkage that keeps it honest also keeps it inert. The reasoning is written
out in `scripts/emit-picker-blob.py` next to `NO_IMPUTE`. Retest it if the
roster ever carries five or more models per lab.
