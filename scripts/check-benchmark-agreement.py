#!/usr/bin/env python3
"""Reproduce the agreement numbers the model picker states in prose.

Every figure the page quotes about how these benchmarks relate to each other is
computed here, from the data files in the repo, so a reader or a later agent can
check it rather than trust it. A red team flagged these as unverifiable when the
analysis lived only in a scratch script; that is the reason this file exists.

Run it plain to print the numbers. Run it with --check to fail when the page's
stated values and the recomputed ones disagree by more than the tolerance.
"""
import json
import math
import re
import statistics
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "model-picker.html"
AA = ROOT / "data" / "aa-all-status-2026-08-20.md"
LB = ROOT / "data" / "livebench-2026-08-20.md"
ARC = ROOT / "data" / "arc-agi-2026-08-21.md"

RUNG = {"minimal": 1, "low": 2, "medium": 3, "high": 4, "xhigh": 5, "max": 6}


def num(text):
    text = (text or "").strip().replace("$", "").replace("%", "").replace(",", "")
    if text in ("--", "", "N/A"):
        return None
    try:
        return float(text)
    except ValueError:
        return None


def norm(name):
    """One spelling for a model across boards.

    The boards disagree on word order and on where the effort tier goes.
    LiveBench writes "Claude 5 Opus Thinking Max Effort" for what Artificial
    Analysis calls "Claude Opus 5 (max)". Without this, a naive join matches a
    fraction of the rows and every correlation below is measured on the wrong
    sample.
    """
    n = name.lower().replace("[open]", "").strip()
    n = re.sub(r"\((?:[^)]*)\)", " ", n)
    n = re.sub(r"\b(thinking|effort|preview)\b", " ", n)
    n = re.sub(r"\b(max|xhigh|high|medium|low|minimal|none)\b", " ", n)
    m = re.match(r"^\s*claude\s+([\d.]+)\s+(opus|sonnet|haiku|fable)\s*$", n.strip())
    if m:
        n = f"claude {m.group(2)} {m.group(1)}"
    return re.sub(r"[^a-z0-9.]+", "", n)


def best_rung(store, key, rung, value):
    """Keep each family at its highest published effort setting."""
    if value is None:
        return
    if key not in store or rung >= store[key][0]:
        store[key] = (rung, value)


def aa_index():
    out = {}
    lines = [l for l in AA.read_text(encoding="utf-8").splitlines() if l.startswith("| ")]
    if not lines:
        return out
    head = [c.strip() for c in lines[0].strip("|").split("|")]
    for line in lines[2:]:
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) != len(head):
            continue
        row = dict(zip(head, cells))
        best_rung(out, norm(row.get("Model", "")),
                  RUNG.get(row.get("Effort Setting", "").strip(), 0),
                  num(row.get("Intelligence Index")))
    return {k: v for k, (_, v) in out.items()}


def lb_overall():
    out = {}
    for line in LB.read_text(encoding="utf-8").splitlines():
        if "|" not in line or line.startswith("#"):
            continue
        cells = [c.strip() for c in line.split("|")]
        if len(cells) < 10:
            continue
        best_rung(out, norm(cells[0]), 0, num(cells[1]))
    return {k: v for k, (_, v) in out.items()}


def arc_agi2():
    out = {}
    for line in ARC.read_text(encoding="utf-8").splitlines():
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) == 5 and cells[1] in RUNG:
            best_rung(out, norm(cells[0]), RUNG[cells[1]], num(cells[3]))
    return {k: v for k, (_, v) in out.items()}


def pearson(xs, ys):
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    sxy = sum((a - mx) * (b - my) for a, b in zip(xs, ys))
    sxx = sum((a - mx) ** 2 for a in xs)
    syy = sum((b - my) ** 2 for b in ys)
    if sxx <= 0 or syy <= 0:
        return None
    return sxy / math.sqrt(sxx * syy)


def agree(a, b):
    common = sorted(set(a) & set(b))
    if len(common) < 8:
        return None, len(common)
    return pearson([a[k] for k in common], [b[k] for k in common]), len(common)


def blob():
    text = PAGE.read_text(encoding="utf-8")
    i = text.index("window.__MP__=") + len("window.__MP__=")
    return json.JSONDecoder().raw_decode(text[i:])[0], text


def loo_median_r2(data):
    """Median leave-one-model-out r squared, each figure from all the others.

    Ridge regularized, because nine predictors on twenty-one models is enough
    to fit noise perfectly without it. This is the number the page quotes to
    say the ten figures are not spares for each other.
    """
    mets = data["metrics"]
    rows = []
    for m in data["models"]:
        vec = [m["hv"][j] if m["a"][j] else None for j in range(len(mets))]
        if all(v is not None for v in vec):
            rows.append(vec)
    if len(rows) < 8:
        return None, len(rows)
    out = []
    for t in range(len(mets)):
        ys = [r[t] for r in rows]
        xs = [[r[j] for j in range(len(mets)) if j != t] for r in rows]
        preds = []
        for hold in range(len(rows)):
            tx = [xs[i] for i in range(len(xs)) if i != hold]
            ty = [ys[i] for i in range(len(ys)) if i != hold]
            k = len(tx[0])
            mu = [sum(r[c] for r in tx) / len(tx) for c in range(k)]
            sd = [statistics.pstdev([r[c] for r in tx]) or 1.0 for c in range(k)]
            zx = [[(r[c] - mu[c]) / sd[c] for c in range(k)] for r in tx]
            my = sum(ty) / len(ty)
            A = [[sum(z[a] * z[b] for z in zx) + (10.0 if a == b else 0.0)
                  for b in range(k)] for a in range(k)]
            rhs = [sum(z[a] * (y - my) for z, y in zip(zx, ty)) for a in range(k)]
            w = solve(A, rhs)
            if w is None:
                continue
            zt = [(xs[hold][c] - mu[c]) / sd[c] for c in range(k)]
            preds.append((ys[hold], my + sum(wi * zi for wi, zi in zip(w, zt))))
        if not preds:
            continue
        mean_y = sum(p[0] for p in preds) / len(preds)
        ss = sum((a - b) ** 2 for a, b in preds)
        tt = sum((a - mean_y) ** 2 for a, _ in preds)
        out.append(1 - ss / tt if tt else 0.0)
    return (statistics.median(out) if out else None), len(rows)


def solve(A, b):
    k = len(b)
    M = [list(A[i]) + [b[i]] for i in range(k)]
    for i in range(k):
        piv = max(range(i, k), key=lambda r: abs(M[r][i]))
        if abs(M[piv][i]) < 1e-12:
            return None
        M[i], M[piv] = M[piv], M[i]
        for r in range(i + 1, k):
            f = M[r][i] / M[i][i]
            for c in range(i, k + 1):
                M[r][c] -= f * M[i][c]
    x = [0.0] * k
    for i in range(k - 1, -1, -1):
        x[i] = (M[i][k] - sum(M[i][c] * x[c] for c in range(i + 1, k))) / M[i][i]
    return x


def pc1_share(data):
    """Share of variance on the first principal component of the ten figures.

    The page quotes this to argue the field has several real axes rather than
    one. Power iteration on the correlation matrix, which is enough for the
    leading eigenvalue.
    """
    mets = data["metrics"]
    rows = [[m["hv"][j] for j in range(len(mets))]
            for m in data["models"] if all(m["a"][j] for j in range(len(mets)))]
    if len(rows) < 8:
        return None, len(rows)
    k = len(mets)
    mu = [sum(r[c] for r in rows) / len(rows) for c in range(k)]
    sd = [statistics.pstdev([r[c] for r in rows]) or 1.0 for c in range(k)]
    z = [[(r[c] - mu[c]) / sd[c] for c in range(k)] for r in rows]
    C = [[sum(r[a] * r[b] for r in z) / len(z) for b in range(k)] for a in range(k)]
    v = [1.0] * k
    for _ in range(500):
        w = [sum(C[a][b] * v[b] for b in range(k)) for a in range(k)]
        n = math.sqrt(sum(x * x for x in w)) or 1.0
        v = [x / n for x in w]
    lam = sum(v[a] * sum(C[a][b] * v[b] for b in range(k)) for a in range(k))
    return lam / k, len(rows)


def main():
    strict = "--check" in sys.argv
    data, text = blob()
    aa, lb, arc = aa_index(), lb_overall(), arc_agi2()
    print(f"rosters: AA index {len(aa)}, LiveBench Overall {len(lb)}, ARC-AGI-2 {len(arc)}")

    r_aa_lb, n_aa_lb = agree(aa, lb)
    r_lb_arc, n_lb_arc = agree(lb, arc)
    print(f"AA index vs LiveBench Overall   r={r_aa_lb:.3f}  n={n_aa_lb}")
    print(f"LiveBench Overall vs ARC-AGI-2  r={r_lb_arc:.3f}  n={n_lb_arc}")

    pc1, n_pca = pc1_share(data)
    print(f"first principal component carries {pc1*100:.1f} percent of the "
          f"variance across {n_pca} complete rows")

    med, n_complete = loo_median_r2(data)
    print(f"median leave-one-out r2, each figure from the other nine: "
          f"{med:.3f} on {n_complete} complete rows")

    problems = []
    for claim, got, tol, what in (
        (0.930, r_aa_lb, 0.02, "AA index vs LiveBench Overall"),
        (0.868, r_lb_arc, 0.02, "LiveBench Overall vs ARC-AGI-2"),
        (0.42, med, 0.06, "median leave-one-out r squared"),
        (0.405, pc1, 0.04, "first principal component share"),
    ):
        if got is None or abs(got - claim) > tol:
            problems.append(f"{what}: page says {claim}, data gives "
                            f"{'none' if got is None else round(got, 3)}")
    if strict:
        if problems:
            for p in problems:
                print("MISMATCH: " + p, file=sys.stderr)
            sys.exit("benchmark agreement claims no longer match the data")
        print("Benchmark agreement claims match the data.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
