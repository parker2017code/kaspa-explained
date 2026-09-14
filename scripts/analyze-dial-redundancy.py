#!/usr/bin/env python3
"""Do the model picker's 10 dials measure 10 different things?

Reads the live blob out of model-picker.html, correlates every one of the 45
dial pairs across the roster, and compares against the pair correlations the
source document supplies.

Source of record: data/model-analysis-2026-08-25.md
Live artifact:    model-picker.html, window.__MP__

Reads only. Writes nothing. Exits non-zero when any pair reaches
REDUNDANT_THRESHOLD, so this can later be wired as a gate.

Three arrays are correlated, on purpose:

  hv    the array the page actually scores on (vecOf() returns hv). Each
        element is honest(m, unpctile(m, v)), which is an affine map of the
        board's raw figure onto that board's full published range, clamped to
        [0, 100]. Affine maps leave Pearson r unchanged, so r(hv) is r(raw)
        except where clamping bites. hv is complete: cells the boards never
        published were filled by regression from other metrics upstream.

  hv-measured   the same array with predicted cells (p == 3) dropped pairwise.
        Predicted cells are regressions on other metrics, so leaving them in
        inflates exactly the association being measured.

  nat   the raw board figure at the model's own variant, no imputation, None
        where the board never published. Closest available analog to what the
        document correlated.

Run: python3 scripts/analyze-dial-redundancy.py
"""

import json
import math
import os
import random
import re
import sys

# A pair at or above this shares enough variance that one of the two dials is
# not adding information. The document's own band table calls this "redundant,
# drop one".
REDUNDANT_THRESHOLD = 0.85
# Below redundant, above coincidence. The document calls this band "strong".
STRONG_THRESHOLD = 0.70
# Fewer than this many pairwise-complete models and the r is not worth printing.
MIN_N = 8

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, "model-picker.html")
DOC = os.path.join(ROOT, "data", "model-analysis-2026-08-25.md")

# Picker metric key -> name in the source document's namespace.
# Every one of these is confirmed from scripts/build-picker-data.py METRICS
# (label + source) against the document's own metric list. Nothing guessed; a
# key with no confirmed counterpart would carry None and be reported as
# "no correspondence in source".
DOC_NAME = {
    "hle": "aa_HLE",
    "aaCritpt": "aa_CritPt",
    "arcAgi2": "arc2",
    "lbCoding": "lb_cod",
    "lbAgenticCoding": "lb_agt",
    "webdevArena": "ar_webdev",
    "lbInstructionFollowing": "lb_if",
    "omniAccuracy": "aa_OmAcc",
    "omniNonHallucination": "aa_NonHall",
    "lbLanguage": "lb_lng",
}

# Reader-facing dial labels, so a redundancy finding can be stated in the terms
# the page puts in front of the reader rather than in metric keys.
DIAL_LABEL = {
    "hle": "hard",
    "aaCritpt": "physics",
    "arcAgi2": "novel",
    "lbCoding": "code",
    "lbAgenticCoding": "agent",
    "webdevArena": "webdev",
    "lbInstructionFollowing": "follow",
    "omniAccuracy": "know",
    "omniNonHallucination": "honest",
    "lbLanguage": "language",
}

# Pair correlations the document states directly, keyed by the picker's own
# metric keys. Nothing here is interpolated. Every entry carries its line
# number in the source document and the cohort it was computed on, because two
# of the seven are top-20-restricted rather than full-cohort figures and are
# therefore not comparable on the same footing as the other five.
DOC_R = {
    ("arcAgi2", "omniAccuracy"): (
        +0.900, 26, "S15 line 590, ARC-2 profile, full cohort"),
    ("arcAgi2", "lbLanguage"): (
        +0.858, 26, "S15 line 593, ARC-2 profile, full cohort"),
    ("arcAgi2", "hle"): (
        +0.857, 26, "S15 lines 553/594, full cohort, n stated"),
    ("arcAgi2", "lbInstructionFollowing"): (
        +0.408, 26, "S15 line 598, ARC-2 profile, full cohort"),
    ("arcAgi2", "omniNonHallucination"): (
        -0.189, 26, "S15 line 599, ARC-2 profile, full cohort"),
    ("aaCritpt", "omniNonHallucination"): (
        -0.610, None, "S7 line 301, TOP-20 RESTRICTED, not full cohort"),
    ("omniAccuracy", "omniNonHallucination"): (
        -0.550, None, "S7 line 302, TOP-20 RESTRICTED, not full cohort"),
}
# n for the ARC-2 profile rows is not printed per row. arc2 pairs elsewhere in
# the document are consistently n=26 (ARC Prize covers 26 of the 43 models),
# and 26 is carried here on that basis. Flagged rather than asserted.
DOC_N_INFERRED = {("arcAgi2", "omniAccuracy"), ("arcAgi2", "lbLanguage"),
                  ("arcAgi2", "lbInstructionFollowing"),
                  ("arcAgi2", "omniNonHallucination")}

# Section 7: restricting to frontier models attenuates correlations by this
# much on average, and 79% of pairs attenuate. The picker's roster is the
# restricted cohort, so its own r should come back LOWER than the document's.
EXPECTED_ATTENUATION = 0.159


# ---------------------------------------------------------------- correlation

def pearson(xs, ys):
    """Pearson r over two equal-length numeric sequences, or None."""
    n = len(xs)
    if n != len(ys) or n < 2:
        return None
    mx = sum(xs) / n
    my = sum(ys) / n
    sxy = sxx = syy = 0.0
    for x, y in zip(xs, ys):
        dx = x - mx
        dy = y - my
        sxy += dx * dy
        sxx += dx * dx
        syy += dy * dy
    if sxx <= 0 or syy <= 0:
        return None
    return sxy / math.sqrt(sxx * syy)


def self_test():
    """Watch the correlation function pass and watch the gate fail.

    A check nobody has seen fail is decoration. Four cases: the two limits, the
    null, and a planted violation that must trip the redundancy classifier.
    """
    print("SELF-TEST")
    ok = True

    a = [3.0, 1.0, 4.0, 1.0, 5.0, 9.0, 2.0, 6.0, 5.0, 3.0, 5.0,
         8.0, 9.0, 7.0, 9.0, 3.0, 2.0, 3.0, 8.0, 4.0, 6.0, 2.0, 6.0]
    r_ident = pearson(a, a)
    print(f"  identical arrays (n=23)            r = {r_ident:+.3f}   expect +1.000")
    ok &= abs(r_ident - 1.0) < 1e-9

    r_neg = pearson(a, [-x for x in a])
    print(f"  array vs its own negation (n=23)   r = {r_neg:+.3f}   expect -1.000")
    ok &= abs(r_neg + 1.0) < 1e-9

    rng = random.Random(20260829)
    one = pearson([rng.gauss(0, 1) for _ in range(23)],
                  [rng.gauss(0, 1) for _ in range(23)])
    trials = []
    for _ in range(4000):
        r = pearson([rng.gauss(0, 1) for _ in range(23)],
                    [rng.gauss(0, 1) for _ in range(23)])
        if r is not None:
            trials.append(r)
    mean_r = sum(trials) / len(trials)
    mean_abs = sum(abs(r) for r in trials) / len(trials)
    print(f"  independent random pair (n=23)     r = {one:+.3f}   "
          f"expect near 0")
    print(f"  4000 independent random pairs      mean r = {mean_r:+.3f}, "
          f"mean |r| = {mean_abs:.3f}   expect mean r near 0")
    ok &= abs(mean_r) < 0.02
    ok &= abs(one) < 0.45

    # Planted violation, watched failing. A pair constructed at r ~ +0.99 must
    # be classified redundant. If the classifier lets this through, every clean
    # result below is worthless.
    planted_x = [float(i) for i in range(23)]
    planted_y = [float(i) + (0.4 if i % 3 == 0 else -0.3) for i in range(23)]
    r_planted = pearson(planted_x, planted_y)
    flagged = abs(r_planted) >= REDUNDANT_THRESHOLD
    print(f"  planted redundant pair             r = {r_planted:+.3f}   "
          f"classifier flags it: {flagged}   expect True")
    ok &= flagged

    # And the mirror: a pair that must NOT be flagged.
    quiet = abs(one) >= REDUNDANT_THRESHOLD
    print(f"  planted clean pair                 r = {one:+.3f}   "
          f"classifier flags it: {quiet}   expect False")
    ok &= not quiet

    print(f"  SELF-TEST {'PASS' if ok else 'FAIL'}")
    if not ok:
        sys.exit("self-test failed; no finding below can be trusted")
    print()
    return ok


# ---------------------------------------------------------------- data access

def load_blob(path):
    """Parse window.__MP__ out of the page itself, not out of any sidecar."""
    with open(path, encoding="utf-8") as fh:
        html = fh.read()
    i = html.index("window.__MP__=")
    j = html.index("};</script>", i)
    return json.loads(html[i + len("window.__MP__="):j + 1])


def column(models, idx, arr, require_measured=False):
    """One metric's column, with availability and provenance honored.

    a[j] == 0 means the model carries no real figure for metric j. Such a cell
    is dropped, never median-substituted: the page substitutes a median when it
    scores, which is right for a score and wrong for a correlation, because a
    constant injected into both columns of a pair manufactures agreement.

    require_measured additionally drops p[j] == 3, the cells predicted by
    regression from other metrics.
    """
    out = []
    for m in models:
        vec = m.get(arr)
        if not vec or idx >= len(vec):
            out.append(None)
            continue
        if not m.get("a") or not m["a"][idx]:
            out.append(None)
            continue
        if require_measured:
            p = m.get("p")
            if p and idx < len(p) and p[idx] == 3:
                out.append(None)
                continue
        v = vec[idx]
        out.append(float(v) if isinstance(v, (int, float)) else None)
    return out


def pairwise(xs, ys):
    """Complete cases only, both sides present."""
    px, py = [], []
    for x, y in zip(xs, ys):
        if x is None or y is None:
            continue
        px.append(x)
        py.append(y)
    return px, py


def corr_matrix(models, metrics, arr, require_measured=False):
    cols = {k: column(models, i, arr, require_measured)
            for i, k in enumerate(metrics)}
    out = {}
    for i in range(len(metrics)):
        for j in range(i + 1, len(metrics)):
            a, b = metrics[i], metrics[j]
            px, py = pairwise(cols[a], cols[b])
            if len(px) < MIN_N:
                out[(a, b)] = (None, len(px),
                               f"only {len(px)} pairwise-complete models, "
                               f"below the {MIN_N} floor")
            else:
                r = pearson(px, py)
                out[(a, b)] = (r, len(px),
                               None if r is not None else
                               "zero variance in one column")
    return out


# -------------------------------------------------------------------- report

def speed_check(models):
    """Cheap cross-check of Section 16's speed claims against the artifact.

    Section 16 reports elasticities with respect to tokens generated, measured
    WITHIN a family across its effort rungs: throughput +0.054 (flat), time to
    first answer +1.457, response time +0.946.

    Those cannot be reproduced from window.__MP__. The blob carries each model
    exactly once, at one effort rung, and carries no token count at all. What
    follows is a different and weaker quantity: the cross-model association
    between log cost and each speed axis, over 23 different models at 23
    different rungs. It is confounded by model size and serving hardware and it
    is NOT the document's elasticity. It is reported because it is the only
    speed evidence the artifact contains.
    """
    print("SECTION 16 SPEED CLAIMS, WHAT THE ARTIFACT CAN AND CANNOT CHECK")
    print("  cannot check: the blob has one effort rung per model and no token")
    print("  counts, so no within-family elasticity is computable from it.")
    rows = [(m["cost"], m["ttft"], m["tps"]) for m in models
            if m.get("cost") and m.get("ttft") and m.get("tps")]
    print(f"  models carrying cost, ttft and tps all three: {len(rows)} of "
          f"{len(models)}")
    lc = [math.log10(c) for c, _, _ in rows]
    lt = [math.log10(t) for _, t, _ in rows]
    lp = [math.log10(p) for _, _, p in rows]
    print(f"  cross-model log10 cost ~ log10 ttft        r = "
          f"{fmt(pearson(lc, lt))}   doc: ttft elasticity +1.457, R2 0.964")
    print(f"  cross-model log10 cost ~ log10 throughput  r = "
          f"{fmt(pearson(lc, lp))}   doc: tps elasticity +0.054, R2 0.700")
    ttfts = sorted(t for _, t, _ in rows)
    tpss = sorted(p for _, _, p in rows)
    print(f"  ttft spread across roster: {ttfts[0]:.2f}s to {ttfts[-1]:.2f}s "
          f"= {ttfts[-1] / ttfts[0]:.1f}x")
    print(f"  tps  spread across roster: {tpss[0]:.1f} to {tpss[-1]:.1f} "
          f"= {tpss[-1] / tpss[0]:.1f}x")
    print("  Reading: throughput varies MORE across this roster than latency")
    print("  does, which does not contradict the document. The document's")
    print("  'flat' is flat in effort within one model, not flat across")
    print("  models. The artifact cannot separate the two. Unverified.")
    print()


def band(r):
    if r is None:
        return "n/a"
    a = abs(r)
    if a >= REDUNDANT_THRESHOLD:
        return "REDUNDANT"
    if a >= STRONG_THRESHOLD:
        return "strong"
    if a >= 0.50:
        return "moderate"
    if a >= 0.25:
        return "weak"
    return "orthogonal"


def fmt(r):
    return "     --" if r is None else f"{r:+.3f}"


def main():
    self_test()

    blob = load_blob(PAGE)
    metrics = blob["metrics"]
    models = blob["models"]

    print(f"ARTIFACT  {os.path.relpath(PAGE, ROOT)}, window.__MP__")
    print(f"          {len(models)} models, {len(metrics)} scored metrics, "
          f"{len(metrics) * (len(metrics) - 1) // 2} pairs")
    missing_a = sum(1 for m in models for x in m.get("a", []) if not x)
    null_hv = sum(1 for m in models for x in (m.get("hv") or []) if x is None)
    pred = sum(1 for m in models for x in (m.get("p") or []) if x == 3)
    sib = sum(1 for m in models for x in (m.get("p") or []) if x == 2)
    print(f"          a[j]==0 cells: {missing_a}   null hv cells: {null_hv}")
    print(f"          p==2 sibling-carried cells: {sib}   "
          f"p==3 predicted cells: {pred}")
    print()

    print("MAPPING  picker key -> source document namespace")
    for k in metrics:
        d = DOC_NAME.get(k)
        print(f"  {k:<24} {d if d else 'NO CORRESPONDENCE IN SOURCE'}")
    print()

    hv = corr_matrix(models, metrics, "hv")
    hv_meas = corr_matrix(models, metrics, "hv", require_measured=True)
    nat = corr_matrix(models, metrics, "nat")

    order = sorted(hv, key=lambda p: -abs(hv[p][0]) if hv[p][0] is not None else 1)

    print("ALL 45 PAIRS, PICKER'S OWN DATA")
    print(f"  {'pair':<49} {'hv r':>7} {'n':>3}  "
          f"{'meas r':>7} {'n':>3}  {'nat r':>7} {'n':>3}  "
          f"{'doc r':>7}  band")
    for p in order:
        a, b = p
        rh, nh, wh = hv[p]
        rm, nm, _ = hv_meas[p]
        rn, nn, _ = nat[p]
        dr = DOC_R.get(p) or DOC_R.get((b, a))
        name = f"{DOC_NAME[a]} ~ {DOC_NAME[b]}"
        dial = f'("{DIAL_LABEL[a]}" ~ "{DIAL_LABEL[b]}")'
        print(f"  {name:<24}{dial:<25} {fmt(rh)} {nh:>3}  "
              f"{fmt(rm)} {nm:>3}  {fmt(rn)} {nn:>3}  "
              f"{fmt(dr[0]) if dr else '     --'}  {band(rh)}")
        for lab, (rr, nn2, ww) in (("hv", hv[p]), ("measured-only", hv_meas[p]),
                                   ("nat", nat[p])):
            if ww:
                print(f"      NOT COMPUTABLE on {lab}: {ww}")
    print()

    def get(mat, p):
        return mat[p] if p in mat else mat[(p[1], p[0])]

    print("PAIRS THE DOCUMENT SUPPLIES, SIDE BY SIDE")
    print("  hv is what the page scores. meas drops the p==3 predicted cells,")
    print("  which for arc2 is 10 of 23 models, and is the closer analog to the")
    print("  document's own pairwise-complete-case rule.")
    diffs = []
    diffs_meas = []
    full_cohort_diffs = []
    print(f"  {'pair':<26} {'doc r':>7} {'hv r':>8} {'diff':>7} {'dir':>10}  "
          f"{'meas r':>7} {'n':>3} {'diff':>7} {'dir':>10}")
    for p, (dr, dn, prov) in DOC_R.items():
        rh = get(hv, p)[0]
        rm, nm, _ = get(hv_meas, p)
        d = rh - dr
        diffs.append(abs(d))
        if "TOP-20" not in prov:
            full_cohort_diffs.append(abs(d))
        dm = (rm - dr) if rm is not None else None
        if dm is not None:
            diffs_meas.append(abs(dm))
        direction = "attenuated" if abs(rh) < abs(dr) else "AMPLIFIED"
        dirm = ("--" if rm is None else
                "attenuated" if abs(rm) < abs(dr) else "AMPLIFIED")
        star = " *" if p in DOC_N_INFERRED else ""
        print(f"  {DOC_NAME[p[0]]} ~ {DOC_NAME[p[1]]:<14} {dr:+.3f} "
              f"{rh:+8.3f} {d:+7.3f} {direction:>10}  "
              f"{fmt(rm):>7} {nm:>3} "
              f"{(f'{dm:+.3f}' if dm is not None else '     --'):>7} {dirm:>10}")
        print(f"      {prov}  doc n={dn if dn else 'not given'}{star}")
    mad = sum(diffs) / len(diffs)
    mad_meas = sum(diffs_meas) / len(diffs_meas)
    mad_full = sum(full_cohort_diffs) / len(full_cohort_diffs)
    print(f"  * n inferred as 26 from other arc2 pairs; not printed per row "
          f"in the source.")
    print()
    print(f"  mean absolute difference, all {len(diffs)} document-supplied "
          f"pairs, hv:   {mad:.3f}")
    print(f"  mean absolute difference, {len(diffs_meas)} pairs, "
          f"measured-only cells:     {mad_meas:.3f}")
    print(f"  mean absolute difference, {len(full_cohort_diffs)} full-cohort "
          f"pairs only:  {mad_full:.3f}")
    print(f"  Section 7 predicts attenuation of about "
          f"{EXPECTED_ATTENUATION:.3f} in the restricted cohort.")
    amplified = sum(1 for p, (dr, _, _) in DOC_R.items()
                    if abs(get(hv, p)[0]) > abs(dr))
    print(f"  pairs where the picker's |r| is LARGER than the document's: "
          f"{amplified} of {len(DOC_R)}")
    print()

    print("REDUNDANT, r >= %.2f ON THE PICKER'S OWN DATA" % REDUNDANT_THRESHOLD)
    print("  Checked on both bases. hv is what the page scores. measured-only")
    print("  drops the regression-predicted cells, which for arc2 is 10 of 23")
    print("  models and drags that column's correlations down hard. A pair that")
    print("  is redundant in the figures the boards actually published is a")
    print("  redundant pair, whether or not imputation hides it in the score.")
    red = [p for p in order if hv[p][0] is not None
           and abs(hv[p][0]) >= REDUNDANT_THRESHOLD]
    red_meas = [p for p in order if hv_meas[p][0] is not None
                and abs(hv_meas[p][0]) >= REDUNDANT_THRESHOLD]
    print("  on hv (what the reader's weights actually multiply):")
    if not red:
        print("    none")
    for p in red:
        a, b = p
        print(f'    "{DIAL_LABEL[a]}" and "{DIAL_LABEL[b]}"  r={hv[p][0]:+.3f} '
              f'n={hv[p][1]}  ->  a reader raising both is weighting '
              f'{DIAL_LABEL[a]} roughly twice')
    print("  on measured cells only:")
    if not red_meas:
        print("    none")
    for p in red_meas:
        a, b = p
        print(f'    "{DIAL_LABEL[a]}" and "{DIAL_LABEL[b]}"  r={hv_meas[p][0]:+.3f} '
              f'n={hv_meas[p][1]}  ->  a reader raising both is weighting '
              f'{DIAL_LABEL[a]} roughly twice')
    print()
    tripped = list(dict.fromkeys(red + red_meas))

    print("STRONG, %.2f <= r < %.2f" % (STRONG_THRESHOLD, REDUNDANT_THRESHOLD))
    strong = [p for p in order if hv[p][0] is not None
              and STRONG_THRESHOLD <= abs(hv[p][0]) < REDUNDANT_THRESHOLD]
    if not strong:
        print("  none")
    for p in strong:
        a, b = p
        sign = "same direction" if hv[p][0] > 0 else "OPPOSED"
        print(f'  "{DIAL_LABEL[a]}" and "{DIAL_LABEL[b]}"  r={hv[p][0]:+.3f} '
              f'n={hv[p][1]}  {sign}')
    print()

    print("THE OPPOSITION TRAP: know vs honest")
    trap = ("omniAccuracy", "omniNonHallucination")
    for label, mat in (("hv (scored)", hv), ("hv measured-only", hv_meas),
                       ("nat (raw board)", nat)):
        r, n, _ = mat[trap]
        print(f"  {label:<18} r = {fmt(r)}  n = {n}")
    for other in metrics:
        if other == "omniNonHallucination":
            continue
        p = tuple(sorted((other, "omniNonHallucination"),
                         key=lambda k: metrics.index(k)))
        r = hv[p][0]
        if r is not None and r < 0:
            print(f'  "honest" vs "{DIAL_LABEL[other]}"   r = {r:+.3f}')
    print()

    speed_check(models)

    if tripped:
        print(f"GATE: {len(tripped)} pair(s) at or above "
              f"{REDUNDANT_THRESHOLD:.2f}. Exiting non-zero.")
        return 1
    print(f"GATE: no pair at or above {REDUNDANT_THRESHOLD:.2f}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
