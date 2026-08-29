# Spec: wiring the cross-leaderboard analysis into model-picker.html

Source of record: `data/model-analysis-2026-08-25.md`.
Live artifact: `model-picker.html`, roster in `window.__MP__`, pipeline
`scripts/build-picker-data.py` then `scripts/emit-picker-blob.py`.

This spec exists so the work can fail. Every item below is checkable against the
artifact, not against a description of the artifact. A slice is not done because an
agent says it is done; it is done when the stated number is observed in the rendered
page or in the emitted blob.

## Slice 1: does the picker double-count its own dials

The picker scores 10 dials at equal weight within each dial and lets the reader
weight them. That is only valid if the dials measure different things. The source
document establishes that most apparent inter-benchmark agreement is one general
factor: PC1 explains 53.8% of variance across 14 primitive metrics, effective
dimensionality is 5.52 of 14, and 36 of 780 metric pairs sit at r >= 0.85 where one
of the pair should be dropped.

The picker's 10 scored metrics are:
hle, aaCritpt, arcAgi2, lbCoding, lbAgenticCoding, webdevArena,
lbInstructionFollowing, omniAccuracy, omniNonHallucination, lbLanguage.

### Required output

1. A mapping table from each of those 10 keys to its name in the source document's
   namespace (aa_HLE, aa_CritPt, arc2, lb_cod, lb_agentic, ar_webdev, lb_if,
   aa_OmAcc, aa_NonHall, lb_lng), or the explicit statement that no correspondence
   exists. A guess is a failure; state "no correspondence in source" instead.
2. All 45 dial pairs, with the Pearson r the source document gives, and n. Where the
   document does not give a pair directly, say so; do not interpolate one.
3. Every pair at r >= 0.85 named as redundant, and every pair 0.70 to 0.85 named as
   strong. For each, state which dial a reader would unknowingly be weighting twice.
4. Compute the same correlations directly from the picker's own live data, using the
   `hv` arrays in `window.__MP__` across the 23 models, 45 pairs. Report both the
   document's r and the picker's own r side by side. Where they disagree by more
   than 0.15, say which is more trustworthy and why. The picker's cohort is 23
   frontier models; the document's is 43 including weak models. Section 7 predicts
   the picker's own correlations will be ATTENUATED relative to the document's, by
   roughly 0.159 on average. If the picker's numbers come back systematically HIGHER
   than the document's, something is wrong with the calculation; investigate rather
   than report it.

### Acceptance criteria, numeric

- All 45 pairs computed from live picker data. Not 44. If a pair cannot be computed,
  name it and say why.
- The mean absolute difference between document r and picker r is reported to 3
  decimal places, with the direction of the difference stated.
- At least one deliberate violation planted and watched failing before any gate or
  script written here is trusted: feed the correlation code two identical arrays and
  confirm it returns 1.000, and two independent random arrays and confirm it returns
  near 0. A check that has not been watched failing is decoration.

### Known trap, stated in advance

omniAccuracy and omniNonHallucination are on the picker as separate dials, "know"
and "honest". The source document states aa_NonHall correlates NEGATIVELY with
capability, at -0.60 to -0.61 against lb_mth and aa_CritPt, because higher-scoring
models abstain less. A reader who raises both dials is pulling in opposite
directions and the interface does not say so. Determine whether this is true on the
picker's own data and quantify it. Do not fix it in this slice; report it.

## Out of scope for slice 1

Do not import the 43-model cohort. Do not change scoring. Do not touch MC_RUNS. Do
not edit the effort placement. Do not run refresh-model-data.py, ever. Those are
later slices and depend on slice 1's answer.

## Reporting rules

State everything that was skipped, left unverified, or left undone. Silence implies completion and
will be read as such. An honest negative is worth more than a confident wrong
answer. If the premise of this spec turns out to be wrong, say so and stop rather
than producing a beautifully executed answer to the wrong question.

## Second known trap, added after sections 14-17 arrived

Source Section 15 gives ARC-AGI-2's full correlation profile. Its single strongest
correlate across all 35 other metrics is aa_OmAcc (Omniscience Accuracy) at +0.900,
ahead of HLE (+0.857) and GPQA (+0.838).

Both of those are live picker dials: `arcAgi2` is the "novel" dial and `omniAccuracy`
is the "know" dial. +0.900 sits above the document's own >= 0.85 "redundant, drop one"
threshold. If that holds on the picker's own 23-model cohort, then a reader who raises
both dials believes they are weighting two independent abilities and is in fact
weighting one thing twice.

This is the single most consequential finding for the picker and it must be checked
against the artifact, not accepted from the document. Section 7 predicts the picker's
own cohort will show an ATTENUATED correlation, because 23 frontier
models is a restricted range against the document's 43. If the picker's own r comes
back at or above +0.900, the calculation is suspect and must be investigated before
being reported.

Report three numbers for this pair specifically: the document's r (+0.900), the
picker's own r computed from `hv` across its 23 models, and the difference with
direction. Do not recommend a fix in this slice. Establish whether the defect is real
and how large it is.
