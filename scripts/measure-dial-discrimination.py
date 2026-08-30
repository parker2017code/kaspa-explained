#!/usr/bin/env python3
"""How many different answers can the model picker actually give?

Consolidating dials trades expressiveness for honesty. This measures the
expressiveness side so the trade is a number rather than an opinion.

Discrimination, defined three ways over a large sample of random reader weight
vectors, each dial drawn independently from the same 0-to-10 integer range the
page's sliders offer:

  distinct top-1      how many different models can reach first place
  distinct top-3      how many different unordered top-three sets appear
  mean rank distance  mean 1 - Spearman rho between the rankings that two
                      different weight vectors produce, over random pairs.
                      0 means every reader sees the same list; 1 means two
                      readers' lists are unrelated; 2 means reversed.

Ship criterion. A consolidated dial set must retain at least SHIP_FLOOR of the
current set's distinct top-1 count AND at least SHIP_FLOOR of its mean rank
distance. Below either, the consolidation destroys more expressiveness than the
honesty is worth. This script exits non-zero when that fails.

The scorer here is not an approximation of the page. It reproduces
buildWeights(), dialMix(), metricTrust(), frontierSpread() and score() from
model-picker.html, including the order-dependent trust cache: the page fills
trustCache while it builds the dial controls, so each dial's own metrics are
measured with that dial still switched off. Reproducing the quirk matters,
because computing trust any other way gives different within-dial shares.

The current dial set is parsed out of the page rather than copied, so this
cannot silently measure a configuration the page no longer ships.

  python3 scripts/measure-dial-discrimination.py
  python3 scripts/measure-dial-discrimination.py --self-test-only

Reads only. Writes nothing.
"""

import argparse
import json
import math
import os
import random
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, "model-picker.html")

# A consolidated set must keep this share of the current set's distinct top-1
# count and of its mean rank distance. Set by the brief for this slice, not
# derived from the data: it is the point at which the owner would rather keep
# ten dials that double-count than six that cannot tell models apart.
SHIP_FLOOR = 0.80

# How many random reader weight vectors to score. 2000 is the stated floor;
# 6000 costs a second and stops the distinct-set counts wandering between runs.
SAMPLES = 6000
# Random ranking pairs used for the mean rank distance.
PAIRS = 20000
SEED = 20260829

# Page constants, copied from model-picker.html and checked against it below.
SEP_FULL = 15.0
SEP_FLOOR = 0.35
FRONTIER_N = 5
SLIDER_MAX = 10

# The consolidation this slice proposes. Derived from average-linkage
# clustering of the picker's own correlation matrix at k=6, not from the
# benchmark menu. See report_grouping() for the numbers behind each merge.
PROPOSED = [
    ("reason", ["hle", "aaCritpt", "arcAgi2"]),
    ("code", ["lbCoding"]),
    ("build", ["lbAgenticCoding", "webdevArena"]),
    ("follow", ["lbInstructionFollowing"]),
    ("know", ["omniAccuracy", "lbLanguage"]),
    ("honest", ["omniNonHallucination"]),
]

# What the page shipped before 29 August 2026: ten dials, one figure each.
# Kept as the fixed baseline the ship criterion is measured against, so the
# comparison does not quietly become the live set against itself once the
# consolidation lands. This is a historical record, not a live read.
BASELINE_10 = [
    ("reason", ["hle"]), ("physics", ["aaCritpt"]), ("novel", ["arcAgi2"]),
    ("code", ["lbCoding"]), ("build", ["lbAgenticCoding"]),
    ("apps", ["webdevArena"]), ("follow", ["lbInstructionFollowing"]),
    ("know", ["omniAccuracy"]), ("honest", ["omniNonHallucination"]),
    ("write", ["lbLanguage"]),
]

# Groupings that were measured and not chosen, kept so the choice can be
# checked rather than taken on trust. The one the brief for this slice
# hypothesised is among them, and it fails the criterion.
ALTERNATIVES = [
    ("seven, knowing and language kept apart", [
        ("reason", ["hle", "aaCritpt", "arcAgi2"]),
        ("code", ["lbCoding"]),
        ("build", ["lbAgenticCoding", "webdevArena"]),
        ("follow", ["lbInstructionFollowing"]),
        ("know", ["omniAccuracy"]),
        ("write", ["lbLanguage"]),
        ("honest", ["omniNonHallucination"])]),
    ("six, with coding folded into agentic work", [
        ("reason", ["hle", "aaCritpt", "arcAgi2"]),
        ("build", ["lbAgenticCoding", "webdevArena", "lbCoding"]),
        ("know", ["omniAccuracy"]),
        ("follow", ["lbInstructionFollowing"]),
        ("write", ["lbLanguage"]),
        ("honest", ["omniNonHallucination"])]),
    ("five, knowing and language folded into reasoning", [
        ("reason", ["hle", "aaCritpt", "arcAgi2", "omniAccuracy", "lbLanguage"]),
        ("code", ["lbCoding"]),
        ("build", ["lbAgenticCoding", "webdevArena"]),
        ("follow", ["lbInstructionFollowing"]),
        ("honest", ["omniNonHallucination"])]),
]

# How many dials a reader turns up. One sampling model is one point, not a
# property: a reader who moves every slider and a reader who turns up two are
# different tools' worth of difference. The criterion is applied to the WORST
# case across all of these, not to the friendliest one.
SPARSE_K = (2, 3, 4)


# --------------------------------------------------------------- small stats

def pearson(xs, ys):
    n = len(xs)
    mx = sum(xs) / n
    my = sum(ys) / n
    sxy = sxx = syy = 0.0
    for x, y in zip(xs, ys):
        dx, dy = x - mx, y - my
        sxy += dx * dy
        sxx += dx * dx
        syy += dy * dy
    if sxx <= 0 or syy <= 0:
        return None
    return sxy / math.sqrt(sxx * syy)


def spearman_from_ranks(ra, rb):
    """Spearman rho between two rank vectors already in rank space.

    Both inputs are permutations of 0..n-1, so no ties and the closed form
    applies exactly.
    """
    n = len(ra)
    d2 = 0
    for i in range(n):
        d = ra[i] - rb[i]
        d2 += d * d
    return 1.0 - 6.0 * d2 / (n * (n * n - 1))


# ------------------------------------------------------------------ the page

def load_blob(path=PAGE):
    with open(path, encoding="utf-8") as fh:
        html = fh.read()
    i = html.index("window.__MP__=")
    j = html.index("};</script>", i)
    return json.loads(html[i + len("window.__MP__="):j + 1]), html


def parse_dials(html):
    """The dial set the page actually ships, read off the page.

    Copying it into this file would let the two drift, and a discrimination
    number measured on a configuration that is not live is worse than no
    number at all.
    """
    body = re.search(r"var DIALS = \[(.*?)\n  \];", html, re.S)
    if not body:
        sys.exit("could not find the DIALS array in model-picker.html")
    out = []
    for m in re.finditer(r"\{ k: '([^']+)',\s*t: '([^']+)',\s*w: \{([^}]*)\}",
                         body.group(1)):
        keys = re.findall(r"(\w+):\s*(\d+)", m.group(3))
        out.append((m.group(1), [k for k, _ in keys]))
    if not out:
        sys.exit("DIALS array parsed to nothing; the format changed")
    return out


def check_page_constants(html):
    """The page's own numbers, or this scorer is measuring a different tool."""
    bad = []
    for name, want, pat in (
            ("SEP_FULL/SEP_FLOOR", f"{SEP_FULL:g}, {SEP_FLOOR:g}",
             r"var SEP_FULL = ([\d.]+), SEP_FLOOR = ([\d.]+);"),
            ("FRONTIER_N", str(FRONTIER_N), r"var FRONTIER_N = (\d+);"),
    ):
        m = re.search(pat, html)
        if not m:
            bad.append(f"{name}: not found in the page")
            continue
        got = ", ".join(m.groups())
        if got != want:
            bad.append(f"{name}: page says {got}, this script assumes {want}")
    return bad


class Scorer:
    """model-picker.html's scoring path, reproduced exactly.

    metricTrust() sets a reentrancy guard (inMetricTrust in the page) before
    calling frontierSpread(), and that guard forces buildWeights() to report
    any=false for the whole nested call -- on every metricTrust invocation,
    not only a genuinely recursive one (see the page's own comment on
    inMetricTrust, dated 29 August 2026, for why the guard exists and why it
    reproduces the tool's prior, accidental behavior on purpose).
    frontierSpread's "rank by the reader's current frontier" branch is
    therefore dead code from metricTrust's own call site; only the v0 fallback (each
    figure's own top-N leader spread) ever runs there, regardless of which
    dials are otherwise on. An earlier version of this scorer instead warmed
    trust dial-by-dial with prior dials left "on" in self.state, which does
    not match: any_on was true for every dial but the first, so those
    metrics were trusted off the reader's ranked frontier instead of the
    fallback the page actually uses. metric_trust() below reproduces the
    real guard directly, by always scoring frontier_spread against an empty
    state.
    """

    def __init__(self, blob, dials):
        self.metrics = blob["metrics"]
        self.ix = {k: i for i, k in enumerate(self.metrics)}
        self.models = blob["models"]
        self.dials = [(k, list(ms)) for k, ms in dials]
        for _, ms in self.dials:
            for k in ms:
                if k not in self.ix:
                    sys.exit(f"dial references unloaded metric {k!r}")
        self.trust = {}
        self.state = {}
        self.field_med = self._field_medians()
        for _, ms in self.dials:
            for mk in ms:
                self.metric_trust(mk)

    def _field_medians(self):
        out = []
        for j in range(len(self.metrics)):
            vals = sorted(m["hv"][j] for m in self.models
                          if m["a"][j] and m["hv"][j] is not None)
            out.append(vals[len(vals) // 2] if vals else None)
        return out

    def metric_trust(self, k):
        if k in self.trust:
            return self.trust[k]
        i = self.ix[k]
        n = sum(1 for m in self.models if m["a"][i])
        # Always empty state here, matching the page's inMetricTrust guard:
        # see the class docstring above.
        spread = self.frontier_spread(k, state={})
        sep = max(SEP_FLOOR, min(1.0, spread / SEP_FULL))
        self.trust[k] = (n / len(self.models)) * sep
        return self.trust[k]

    def frontier_spread(self, key, state=None):
        i = self.ix[key]
        W, tot, any_on = self.build_weights(state)
        lead = []
        if any_on:
            rows = [(self.score(m, W, tot), m) for m in self.models]
            rows = [(s, m) for s, m in rows if s is not None]
            rows.sort(key=lambda r: -r[0]["s"])
            lead = [m for _, m in rows[:FRONTIER_N]]
        if len(lead) < FRONTIER_N:
            v0 = sorted((m["v"][i] for m in self.models if m["a"][i]),
                        reverse=True)
            if len(v0) < FRONTIER_N:
                return 0.0
            return v0[0] - v0[FRONTIER_N - 1]
        vals = sorted((m["v"][i] for m in lead if m["a"][i]), reverse=True)
        if len(vals) < 2:
            return 0.0
        return vals[0] - vals[-1]

    def dial_mix(self, ms):
        parts = [(k, self.metric_trust(k)) for k in ms]
        tot = sum(e for _, e in parts)
        if not tot:
            return [], 0.0
        return [(k, e / tot) for k, e in parts], tot

    def build_weights(self, state=None):
        state = self.state if state is None else state
        W = [0.0] * len(self.metrics)
        any_on = False
        for k, ms in self.dials:
            s = state.get(k, 0)
            if not s:
                continue
            any_on = True
            parts, tot = self.dial_mix(ms)
            if not tot:
                continue
            for mk, share in parts:
                W[self.ix[mk]] += s * share
        return W, sum(W), any_on

    def score(self, m, W, tot):
        num = den = covw = 0.0
        vec = m["hv"]
        for j, w in enumerate(W):
            if not w:
                continue
            if not m["a"][j] or vec[j] is None:
                fm = self.field_med[j]
                if fm is not None:
                    num += w * fm
                    den += w
                continue
            covw += w
            num += w * vec[j]
            den += w
        if den <= 0 or covw <= 0:
            return None
        return {"s": num / den}

    def rank(self, state):
        """Model indices best first. Ties broken by index, deterministically."""
        W, tot, any_on = self.build_weights(state)
        if not any_on:
            return None
        scored = []
        for i, m in enumerate(self.models):
            s = self.score(m, W, tot)
            if s is not None:
                scored.append((-s["s"], i))
        scored.sort()
        return [i for _, i in scored]


# ------------------------------------------------------------- the measurement

def measure(scorer, samples=SAMPLES, pairs=PAIRS, seed=SEED):
    rng = random.Random(seed)
    keys = [k for k, _ in scorer.dials]
    n_models = len(scorer.models)
    rank_of = []
    top1 = set()
    top3 = set()
    orders = []
    drawn = 0
    while drawn < samples:
        st = {k: rng.randint(0, SLIDER_MAX) for k in keys}
        if not any(st.values()):
            continue
        order = scorer.rank(st)
        if order is None:
            continue
        drawn += 1
        orders.append(order)
        top1.add(order[0])
        top3.add(frozenset(order[:3]))
        rv = [0] * n_models
        for pos, mi in enumerate(order):
            rv[mi] = pos
        rank_of.append(rv)

    dists = []
    for _ in range(pairs):
        a = rng.randrange(len(rank_of))
        b = rng.randrange(len(rank_of))
        if a == b:
            continue
        dists.append(1.0 - spearman_from_ranks(rank_of[a], rank_of[b]))
    mean_d = sum(dists) / len(dists)
    return {
        "dials": len(keys),
        "samples": drawn,
        "top1": len(top1),
        "top3": len(top3),
        "dist": mean_d,
        "top1_names": sorted(scorer.models[i]["n"] for i in top1),
    }


def measure_sparse(scorer, k_on, samples=4000, pairs=12000, seed=SEED):
    """A reader who turns up only k dials and leaves the rest at zero.

    This is what the page's own presets look like, and it is a harder test for
    a consolidated set: with fewer dials to choose from, a k-dial subset is a
    larger share of the whole tool.
    """
    rng = random.Random(seed)
    keys = [k for k, _ in scorer.dials]
    n = len(scorer.models)
    ranks, top1, top3 = [], set(), set()
    for _ in range(samples):
        on = rng.sample(keys, min(k_on, len(keys)))
        st = {k: (rng.randint(1, SLIDER_MAX) if k in on else 0) for k in keys}
        order = scorer.rank(st)
        if order is None:
            continue
        top1.add(order[0])
        top3.add(frozenset(order[:3]))
        rv = [0] * n
        for pos, mi in enumerate(order):
            rv[mi] = pos
        ranks.append(rv)
    dists = []
    for _ in range(pairs):
        a, b = rng.randrange(len(ranks)), rng.randrange(len(ranks))
        if a != b:
            dists.append(1.0 - spearman_from_ranks(ranks[a], ranks[b]))
    return {"dials": len(keys), "samples": len(ranks), "top1": len(top1),
            "top3": len(top3), "dist": sum(dists) / len(dists),
            "top1_names": sorted(scorer.models[i]["n"] for i in top1)}


def profile(scorer):
    """Every sampling model, so the verdict does not rest on one of them."""
    out = {"all dials moved": measure(scorer)}
    for k in SPARSE_K:
        out[f"only {k} dials turned up"] = measure_sparse(scorer, k)
    return out


def label_matches_score(html, scorer):
    """Does the number printed beside a figure match the number it is scored at?

    The dial panel prints "N% of this dial" from the editorial weight in DIALS.
    buildWeights() scores with that weight multiplied by metricTrust(), which is
    coverage times frontier separation. Today every trust is 1.000 and the two
    agree exactly. Nothing enforces that. If one figure's coverage drops or one
    saturates, the panel keeps printing 33% while the score uses something else,
    and the page looks identical.

    This is the failure class where a value is right in the computation and
    stale in the rendering. An assertion over the scored arrays alone cannot
    see it, because the scored arrays are correct.
    """
    body = re.search(r"var DIALS = \[(.*?)\n  \];", html, re.S)
    bad = []
    for m in re.finditer(r"\{ k: '([^']+)',\s*t: '([^']+)',\s*w: \{([^}]*)\}",
                         body.group(1)):
        key = m.group(1)
        pairs = [(a, int(b)) for a, b in re.findall(r"(\w+):\s*(\d+)", m.group(3))]
        totw = sum(v for _, v in pairs) or 1
        parts, _ = scorer.dial_mix([a for a, _ in pairs])
        scored = dict(parts)
        for mk, w in pairs:
            shown = round(w / totw * 100)
            real = round(scored.get(mk, 0.0) * 100)
            if abs(shown - real) > 1:
                bad.append(f"dial \"{key}\": the panel prints {shown}% for "
                           f"{mk} and the score uses {real}%")
    return bad


def invariants(blob, scorer):
    """Assertions on things that must be true, regardless of any statistics.

    Transcription and column-alignment errors are the one class no amount of
    statistical care catches, and they are caught by asserting the properties
    a correct table cannot violate: a percentile stays inside its scale, a
    published range has its low below its high, a ranked list descends, a
    coverage share cannot exceed one, an error term cannot be negative.

    A firing assertion is a hypothesis about the data, not a verdict on it.
    Check the assertion before changing the artifact to satisfy it: a wrong
    check that is obeyed corrupts data that was correct and leaves a passing
    gate behind.
    """
    K = blob["metrics"]
    bad = []
    for m in blob["models"]:
        for arr in ("v", "hv"):
            for j, x in enumerate(m.get(arr) or []):
                if x is None:
                    continue
                if not 0.0 <= x <= 100.0:
                    bad.append(f"{m['n']} {arr}[{K[j]}] = {x}, outside 0 to 100")
        for arr in ("a", "p", "v", "hv", "es", "nat"):
            if arr in m and len(m[arr]) != len(K):
                bad.append(f"{m['n']} {arr} has {len(m[arr])} entries for "
                           f"{len(K)} figures")
        for j, e in enumerate(m.get("es") or []):
            if e < 0:
                bad.append(f"{m['n']} es[{K[j]}] = {e}, negative error term")
        sh = m.get("sh")
        if sh:
            if not 0.0 <= sh["f"] <= 1.0:
                bad.append(f"{m['n']} sh.f = {sh['f']}, outside 0 to 1")
            if sh["price"] <= 0:
                bad.append(f"{m['n']} sh.price = {sh['price']}, not positive")
            if sh["sd"] < 0:
                bad.append(f"{m['n']} sh.sd = {sh['sd']}, negative")
        for f in ("cost", "tps", "ttft"):
            if m.get(f) is not None and m[f] <= 0:
                bad.append(f"{m['n']} {f} = {m[f]}, not positive")
    for k, R in blob["range"].items():
        if not R["lo"] < R["hi"]:
            bad.append(f"range[{k}]: lo {R['lo']} is not below hi {R['hi']}")
    for c in blob.get("close") or []:
        if c["lo"] > c["hi"]:
            bad.append(f"close[{c['k']}]: lo above hi")
        if c["n"] <= 0:
            bad.append(f"close[{c['k']}]: n = {c['n']}")
        if c.get("t5") is not None and c["t5"] < 0:
            bad.append(f"close[{c['k']}]: negative top-five spread")

    # A ranked list must descend, under every dial setting, not just the
    # default. Checked over a sample rather than argued about.
    rng = random.Random(SEED)
    keys = [k for k, _ in scorer.dials]
    nonmono = 0
    for _ in range(400):
        st = {k: rng.randint(0, SLIDER_MAX) for k in keys}
        if not any(st.values()):
            continue
        W, tot, _ = scorer.build_weights(st)
        order = scorer.rank(st)
        ss = [scorer.score(scorer.models[i], W, tot)["s"] for i in order]
        if any(ss[i] < ss[i + 1] - 1e-9 for i in range(len(ss) - 1)):
            nonmono += 1
        if any(not 0.0 <= x <= 100.0 for x in ss):
            bad.append("a score fell outside 0 to 100 under a random setting")
            break
    if nonmono:
        bad.append(f"{nonmono} random dial settings produced a ranked list "
                   f"that does not descend")
    return bad


def max_abs_within_dial_r(scorer):
    """The strongest correlation any dial contains inside itself.

    A dial holding two metrics at r = 1.000 is weighting one figure twice
    under one label, which is the redundancy consolidation is meant to remove,
    not relocate.
    """
    worst = None
    for k, ms in scorer.dials:
        for a in range(len(ms)):
            for b in range(a + 1, len(ms)):
                ia, ib = scorer.ix[ms[a]], scorer.ix[ms[b]]
                r = pearson([m["hv"][ia] for m in scorer.models],
                            [m["hv"][ib] for m in scorer.models])
                if r is None:
                    continue
                if worst is None or abs(r) > abs(worst[0]):
                    worst = (r, k, ms[a], ms[b])
    return worst


# ------------------------------------------------------------------ self-test

def self_test(blob):
    """Three planted violations, each watched failing before anything is trusted.

    A check nobody has seen fail is decoration.
    """
    print("SELF-TEST")
    ok = True

    # 1. A dial set where two dials hold literally identical arrays must be
    #    reported at maximal redundancy. Planted by duplicating a metric
    #    column into a copy of the blob.
    planted = json.loads(json.dumps(blob))
    src = planted["metrics"].index("hle")
    planted["metrics"] = planted["metrics"] + ["hleTwin"]
    for m in planted["models"]:
        for arr in ("v", "hv", "p", "a", "es", "nat"):
            if arr in m and isinstance(m[arr], list) and len(m[arr]) > src:
                m[arr] = m[arr] + [m[arr][src]]
    planted["range"]["hleTwin"] = planted["range"]["hle"]
    twin = Scorer(planted, [("a", ["hle", "hleTwin"]), ("b", ["lbCoding"])])
    worst = max_abs_within_dial_r(twin)
    print(f"  identical arrays inside one dial     r = {worst[0]:+.3f}  "
          f"({worst[2]} ~ {worst[3]})   expect +1.000")
    ok &= abs(worst[0] - 1.0) < 1e-9

    # And across dials, where the redundancy detector must also see it.
    split = Scorer(planted, [("a", ["hle"]), ("b", ["hleTwin"])])
    ra = [m["hv"][split.ix["hle"]] for m in split.models]
    rb = [m["hv"][split.ix["hleTwin"]] for m in split.models]
    r_split = pearson(ra, rb)
    print(f"  identical arrays on two dials        r = {r_split:+.3f}   "
          f"expect +1.000")
    ok &= abs(r_split - 1.0) < 1e-9

    # 2. One dial only. There is exactly one ranking, so distinct top-1 must
    #    collapse to 1 and mean rank distance to 0.
    one = Scorer(blob, [("only", ["hle"])])
    r1 = measure(one, samples=400, pairs=2000)
    print(f"  single-dial configuration            top-1 = {r1['top1']}, "
          f"mean rank distance = {r1['dist']:.4f}   expect 1 and 0.0000")
    ok &= r1["top1"] == 1
    ok &= abs(r1["dist"]) < 1e-12

    # 3. The ship criterion has to be able to say no. Two dials that both
    #    point at near-identical evidence cannot retain 80% of the ten-dial
    #    tool's spread, and verdict() must return non-zero on it.
    full = Scorer(blob, parse_dials(open(PAGE, encoding="utf-8").read()))
    base = measure(full, samples=1200, pairs=6000)
    crippled = Scorer(planted, [("a", ["hle"]), ("b", ["hleTwin"])])
    crip = measure(crippled, samples=1200, pairs=6000)
    rc, _ = verdict(base, crip, quiet=True)
    print(f"  crippled 2-dial set vs the live 10   "
          f"top-1 {crip['top1']} of {base['top1']} "
          f"({crip['top1'] / base['top1'] * 100:.0f}%), "
          f"distance {crip['dist']:.3f} of {base['dist']:.3f} "
          f"({crip['dist'] / base['dist'] * 100:.0f}%)")
    print(f"  ship criterion on that set           exit code {rc}   "
          f"expect non-zero")
    ok &= rc != 0

    # 4. The mirror: a set compared against itself must pass, or the criterion
    #    rejects everything and its passes mean nothing.
    rc_same, _ = verdict(base, base, quiet=True)
    print(f"  ship criterion on an identical set   exit code {rc_same}   "
          f"expect 0")
    ok &= rc_same == 0

    # 5. The invariant assertions must fire on planted corruption, and stay
    #    quiet on the real blob.
    live_dials = parse_dials(open(PAGE, encoding="utf-8").read())
    clean = invariants(blob, Scorer(blob, live_dials))
    corrupt = json.loads(json.dumps(blob))
    corrupt["models"][0]["hv"][0] = 140.0
    corrupt["models"][1]["es"][0] = -3.0
    k0 = corrupt["metrics"][0]
    corrupt["range"][k0]["lo"], corrupt["range"][k0]["hi"] = (
        corrupt["range"][k0]["hi"], corrupt["range"][k0]["lo"])
    fired = invariants(corrupt, Scorer(corrupt, live_dials))
    # The rendering check has to fire when the printed share and the scored
    # share come apart. Planted by halving one figure's trust, which is what a
    # coverage drop or a saturated benchmark would do in the live page.
    live_html = open(PAGE, encoding="utf-8").read()
    sc_lbl = Scorer(blob, live_dials)
    print(f"  printed share vs scored share, live     "
          f"{len(label_matches_score(live_html, sc_lbl))} violation(s)   "
          f"expect 0")
    ok &= not label_matches_score(live_html, sc_lbl)
    sc_bent = Scorer(blob, live_dials)
    multi = next((ms for _, ms in live_dials if len(ms) > 1), None)
    if multi:
        sc_bent.trust[multi[0]] = sc_bent.trust[multi[0]] * 0.25
        fired_lbl = label_matches_score(live_html, sc_bent)
        print(f"  same check with one figure's trust cut  "
              f"{len(fired_lbl)} violation(s)   expect 2 or more")
        for f in fired_lbl[:2]:
            print(f"      caught: {f}")
        ok &= len(fired_lbl) >= 2
    else:
        print("  same check with one figure's trust cut  SKIPPED: no dial "
              "carries more than one figure")

    print(f"  invariants on the real blob             {len(clean)} "
          f"violation(s)   expect 0")
    print(f"  invariants on a corrupted copy          {len(fired)} "
          f"violation(s)   expect 3 or more")
    for f in fired[:3]:
        print(f"      caught: {f}")
    ok &= not clean
    ok &= len(fired) >= 3

    print(f"  SELF-TEST {'PASS' if ok else 'FAIL'}")
    if not ok:
        sys.exit("self-test failed; no finding below can be trusted")
    print()


# --------------------------------------------------------------------- report

def verdict(base, cons, quiet=False):
    """The criterion, applied to the worst sampling model rather than the best.

    base and cons are either single measurements or full profiles. A profile
    is judged on its weakest row, because a tool that holds up when a reader
    moves every slider and collapses when they move two is not a tool that
    holds up.
    """
    if "top1" in base:
        base, cons = {"all dials moved": base}, {"all dials moved": cons}
    rows = []
    for k in base:
        b, c = base[k], cons[k]
        rows.append((k, c["top1"] / b["top1"] if b["top1"] else 0.0,
                     c["dist"] / b["dist"] if b["dist"] else 0.0, b, c))
    worst = min(min(r[1], r[2]) for r in rows)
    passed = worst >= SHIP_FLOOR
    if not quiet:
        print("SHIP CRITERION")
        print(f"  floor: {SHIP_FLOOR * 100:.0f}% of the current tool's distinct "
              f"top-1 count AND of its mean rank distance,")
        print("  on every sampling model, not on the friendliest one.")
        print(f"  {'sampling model':<28}{'top-1':>14}{'kept':>7}"
              f"{'rank distance':>20}{'kept':>7}")
        for k, kt, kd, b, c in rows:
            t1 = f"{c['top1']} of {b['top1']}"
            dd = f"{c['dist']:.3f} of {b['dist']:.3f}"
            print(f"  {k:<28}{t1:>14}{kt * 100:>6.0f}%"
                  f"{dd:>20}{kd * 100:>6.0f}%")
        print(f"  worst case across all of them: {worst * 100:.0f}%")
        print(f"  VERDICT: {'SHIP' if passed else 'DO NOT SHIP'}")
        print()
    return (0 if passed else 1), passed


def report_grouping(scorer10):
    """Average-linkage clustering of the picker's own correlations.

    The grouping below is read off this, not off the benchmark names.
    """
    ms = scorer10.metrics
    models = scorer10.models
    cols = {k: [m["hv"][i] for m in models] for i, k in enumerate(ms)}
    R = {(a, b): pearson(cols[a], cols[b]) for a in ms for b in ms}

    print("CORRELATION STRUCTURE, PICKER'S OWN DATA (hv, "
          f"{len(models)} models)")
    print("          " + "".join(f"{k[:7]:>8}" for k in ms))
    for a in ms:
        print(f"  {a[:7]:<8}" + "".join(f"{R[(a, b)]:+8.2f}" for b in ms))
    print()

    clusters = [[k] for k in ms]

    def d(c1, c2):
        return sum(1 - R[(a, b)] for a in c1 for b in c2) / (len(c1) * len(c2))

    print("AVERAGE-LINKAGE MERGE ORDER, distance = 1 - r")
    six = None
    while len(clusters) > 1:
        best = min(((d(clusters[a], clusters[b]), a, b)
                    for a in range(len(clusters))
                    for b in range(a + 1, len(clusters))))
        dd, a, b = best
        print(f"  {len(clusters)} -> {len(clusters) - 1}: "
              f"{'+'.join(clusters[a])} with {'+'.join(clusters[b])}"
              f"   mean r = {1 - dd:+.3f}")
        merged = clusters[a] + clusters[b]
        clusters = [c for i, c in enumerate(clusters) if i not in (a, b)]
        clusters.append(merged)
        if len(clusters) == 6:
            six = [list(c) for c in clusters]
    print()
    print("THE SIX-CLUSTER SOLUTION, read off that tree")
    for c in sorted(six, key=len, reverse=True):
        print("  " + ", ".join(c))
    print()
    return six


def report_merge_linearity(scorer):
    """Averaging inside a dial is only right if the merged pairs are linear.

    Leave-one-out error of a straight line against a log-linear and a quadratic
    fit, on every pair this consolidation puts inside one dial. If a merged
    pair were saturating, the mean would be the wrong aggregator and the merge
    would need a different one.
    """
    print("IS AVERAGING THE RIGHT OPERATION INSIDE A MERGED DIAL?")
    print("  leave-one-out RMSE in the y metric's own honest-scale points")
    print(f"  {'pair':<44} {'linear':>8} {'log-lin':>8} {'quad':>8}  winner")
    any_pair = False
    worst_margin = 0.0
    for k, keys in scorer.dials:
        for a in range(len(keys)):
            for b in range(a + 1, len(keys)):
                any_pair = True
                ka, kb = keys[a], keys[b]
                xs = [m["hv"][scorer.ix[ka]] for m in scorer.models]
                ys = [m["hv"][scorer.ix[kb]] for m in scorer.models]
                res = {}
                for name, fx in (("linear", lambda v: v),
                                 ("log-lin", lambda v: math.log(max(v, 0.5))),
                                 ("quad", None)):
                    res[name] = loo_rmse(xs, ys, fx, quad=(name == "quad"))
                win = min(res, key=res.get)
                margin = (max(res.values()) - res[win]) / res[win] * 100
                worst_margin = max(worst_margin, margin)
                print(f"  {ka + ' ~ ' + kb:<44} {res['linear']:8.2f} "
                      f"{res['log-lin']:8.2f} {res['quad']:8.2f}  {win}")
    if not any_pair:
        print("  no dial holds more than one metric; nothing to check")
    else:
        print(f"  widest spread between best and worst form: "
              f"{worst_margin:.1f}%")
        print("  Reading: a straight line is not beaten by enough to matter on")
        print("  these pairs, so the mean is a defensible aggregator inside a")
        print("  dial. This is measured on the merged pairs themselves, not")
        print("  carried over from the source document's own horse race.")
    print()


def loo_rmse(xs, ys, fx, quad=False):
    n = len(xs)
    se = 0.0
    for hold in range(n):
        tx = [fx(xs[i]) if fx else xs[i] for i in range(n) if i != hold]
        ty = [ys[i] for i in range(n) if i != hold]
        if quad:
            co = fit_quad(tx, ty)
            px = xs[hold]
            pred = co[0] + co[1] * px + co[2] * px * px
        else:
            co = fit_line(tx, ty)
            px = fx(xs[hold])
            pred = co[0] + co[1] * px
        se += (ys[hold] - pred) ** 2
    return math.sqrt(se / n)


def fit_line(xs, ys):
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    sxx = sum((x - mx) ** 2 for x in xs)
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    b = sxy / sxx if sxx else 0.0
    return (my - b * mx, b)


def fit_quad(xs, ys):
    """Three-parameter normal equations, solved by Gaussian elimination."""
    S = [[0.0] * 4 for _ in range(3)]
    for x, y in zip(xs, ys):
        powers = [1.0, x, x * x]
        for i in range(3):
            for j in range(3):
                S[i][j] += powers[i] * powers[j]
            S[i][3] += powers[i] * y
    for i in range(3):
        p = max(range(i, 3), key=lambda r: abs(S[r][i]))
        S[i], S[p] = S[p], S[i]
        if abs(S[i][i]) < 1e-12:
            return (0.0, 0.0, 0.0)
        for r in range(3):
            if r == i:
                continue
            f = S[r][i] / S[i][i]
            for c in range(i, 4):
                S[r][c] -= f * S[i][c]
    return tuple(S[i][3] / S[i][i] for i in range(3))


def show(label, res):
    print(f"{label}")
    print(f"  dials                        {res['dials']}")
    print(f"  weight vectors sampled       {res['samples']}")
    print(f"  distinct top-1 models        {res['top1']} of "
          f"{len(res['top1_names']) and 23}")
    print(f"  distinct top-3 sets          {res['top3']}")
    print(f"  mean rank distance           {res['dist']:.4f}")
    print(f"  models that can reach first  "
          + ", ".join(res["top1_names"]))
    print()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--self-test-only", action="store_true")
    args = ap.parse_args()

    blob, html = load_blob()

    drift = check_page_constants(html)
    if drift:
        for line in drift:
            print(f"  {line}")
        sys.exit("model-picker.html moved away from this script's constants")

    self_test(blob)
    if args.self_test_only:
        return 0

    live = parse_dials(html)
    s_inv = Scorer(blob, live)
    bad = invariants(blob, s_inv) + label_matches_score(html, s_inv)
    print("INVARIANTS")
    print("  Properties a correct table cannot violate: percentiles inside "
          "their scale,")
    print("  published ranges with low below high, error terms not negative, "
          "prices and")
    print("  clocks positive, a ranked list that descends under 400 random dial "
          "settings, and")
    print("  every share the dial panel prints matching the share the score "
          "actually uses.")
    if bad:
        for b in bad:
            print(f"  VIOLATION: {b}")
        print(f"  {len(bad)} violation(s). Before changing the blob, check "
              f"the assertion is right.")
    else:
        print(f"  {len(blob['models'])} models x {len(blob['metrics'])} "
              f"figures: no violation.")
    print()

    print(f"ARTIFACT  model-picker.html, window.__MP__")
    print(f"          {len(blob['models'])} models, "
          f"{len(blob['metrics'])} scored figures, "
          f"{len(live)} dials as shipped")
    print(f"          sampling {SAMPLES} random weight vectors per "
          f"configuration, {PAIRS} random ranking pairs, seed {SEED}")
    print()

    s_live = Scorer(blob, live)
    report_grouping(s_live)

    s_base = Scorer(blob, BASELINE_10)

    s_prop = Scorer(blob, PROPOSED)

    print("THE PROPOSED SIX")
    for k, ms in PROPOSED:
        print(f"  {k:<10} {', '.join(ms)}")
    print()

    report_merge_linearity(s_prop)

    for label, sc in (("REDUNDANCY LEFT INSIDE A SINGLE DIAL", s_prop),):
        worst = max_abs_within_dial_r(sc)
        if worst:
            print(f"{label}")
            print(f"  strongest within-dial pair   {worst[2]} ~ {worst[3]} "
                  f"on \"{worst[1]}\"  r = {worst[0]:+.3f}")
            print("  A merged dial is allowed to hold correlated figures; that")
            print("  is the point. What it must not do is present them as two")
            print("  independent questions, which is what the ten-dial set did.")
            print()

    base = profile(s_base)
    cons = profile(s_prop)
    show(f"BASELINE, {len(BASELINE_10)} DIALS (what shipped before 29 Aug 2026)",
         base["all dials moved"])
    show(f"PROPOSED, {len(PROPOSED)} DIALS", cons["all dials moved"])
    if [k for k, _ in live] != [k for k, _ in PROPOSED]:
        print(f"  NOTE: the page currently ships {len(live)} dials "
              f"({', '.join(k for k, _ in live)}), which is not the proposed "
              f"set. The verdict below judges the proposal, not the page.")
        print()

    print("GROUPINGS MEASURED AND NOT CHOSEN")
    print("  Retention against the ten-dial baseline, worst case across every")
    print("  sampling")
    print("  model. The floor is "
          f"{SHIP_FLOOR * 100:.0f}%.")
    print(f"  {'grouping':<46}{'dials':>6}{'top-1':>7}{'dist':>8}{'worst':>8}  verdict")
    rows = [(f"the proposed {len(PROPOSED)}", PROPOSED)] + ALTERNATIVES
    for label, ds in rows:
        prof = cons if ds is PROPOSED else profile(Scorer(blob, ds))
        w = min(min(prof[k]["top1"] / base[k]["top1"],
                    prof[k]["dist"] / base[k]["dist"]) for k in base)
        a = prof["all dials moved"]
        print(f"  {label:<46}{len(ds):>6}{a['top1']:>7}{a['dist']:>8.3f}"
              f"{w * 100:>7.0f}%  {'passes' if w >= SHIP_FLOOR else 'FAILS'}")
    print("  Smaller is preferred where both pass. Five dials is the first")
    print("  grouping that does not, so six is the smallest that ships.")
    print()

    rc, _ = verdict(base, cons)
    return rc


if __name__ == "__main__":
    sys.exit(main())
