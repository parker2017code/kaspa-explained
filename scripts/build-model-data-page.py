#!/usr/bin/env python3
"""Regenerate model-picker-data.html's data blob from model-picker.html.

model-picker.html's own `window.__MP__` blob is the single source of truth
for every model figure on this site. This script never re-measures or
re-estimates anything; it reads that blob and the live `DIALS` / `DEFAULTS`
config out of model-picker.html's own script (via
scripts/measure-dial-discrimination.py's already-verified `Scorer`, `load_blob`
and `parse_dials`, the same reproduction of buildWeights()/dialMix()/
metricTrust()/score() used to audit the picker itself), and writes the
result as `window.__MPD__` into model-picker-data.html between the
`<!-- model-data:start -->` / `<!-- model-data:end -->` markers.

Run this whenever model-picker.html's blob changes (after
scripts/build-picker-data.py + scripts/emit-picker-blob.py), the same way
scripts/build-sitemap.py runs after a page is added. It is read-only on
model-picker.html and writes only inside the marked block of
model-picker-data.html.

    python3 scripts/build-model-data-page.py
"""
import importlib.util
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

spec = importlib.util.spec_from_file_location(
    "mdd", os.path.join(ROOT, "scripts", "measure-dial-discrimination.py"))
mdd = importlib.util.module_from_spec(spec)
sys.modules["mdd"] = mdd
spec.loader.exec_module(mdd)

TARGET = os.path.join(ROOT, "model-picker-data.html")
START = "<!-- model-data:start -->"
END = "<!-- model-data:end -->"

PROV_LABEL = {0: "no data", 1: "measured", 2: "sibling-carried", 3: "imputed"}


def parse_defaults(html):
    body = re.search(r"var DEFAULTS = \{(.*?)\n\s*\};", html, re.S)
    if not body:
        sys.exit("could not find DEFAULTS in model-picker.html")
    return {k: int(v) for k, v in re.findall(r"(\w+):\s*(\d+)", body.group(1))}


def parse_dial_names(html):
    body = re.search(r"var DIALS = \[(.*?)\n  \];", html, re.S)
    out = {}
    for m in re.finditer(r"\{ k: '([^']+)',\s*t: '([^']+)',", body.group(1)):
        out[m.group(1)] = m.group(2)
    return out


def parse_prov(html):
    """PROV's [display name, description, board, read date] per metric key."""
    body = re.search(r"var PROV = \{(.*?)\n  \};", html, re.S)
    out = {}
    for m in re.finditer(
            r"(\w+):\s*\[([^\]]*)\]", body.group(1)):
        key = m.group(1)
        parts = re.findall(r"'((?:[^'\\]|\\.)*)'", m.group(2))
        parts = [p.replace("\\u2019", "’").replace("\\'", "'") for p in parts]
        out[key] = parts
    return out


def main():
    blob, html = mdd.load_blob()
    dials = mdd.parse_dials(html)
    defaults = parse_defaults(html)
    dial_names = parse_dial_names(html)
    prov = parse_prov(html)
    sc = mdd.Scorer(blob, dials)

    metrics = blob["metrics"]
    rng = blob["range"]
    W_default, tot_default, _ = sc.build_weights(defaults)

    dial_weight_vecs = {}
    for k, ms in dials:
        W, tot, _ = sc.build_weights({k: 1})
        dial_weight_vecs[k] = (W, tot)

    out_models = []
    grand = {"measured": 0, "sibling": 0, "imputed": 0, "none": 0}
    for m in blob["models"]:
        cells = []
        counts = {"measured": 0, "sibling": 0, "imputed": 0, "none": 0}
        for j, k in enumerate(metrics):
            pv = m["p"][j] if j < len(m.get("p", [])) else 0
            label = PROV_LABEL.get(pv, "no data")
            counts[{1: "measured", 2: "sibling", 3: "imputed"}.get(pv, "none")] += 1
            raw = m.get("nat", [None] * len(metrics))[j] if j < len(m.get("nat") or []) else None
            cells.append({
                "k": k,
                "raw": raw,
                "u": rng.get(k, {}).get("u"),
                "pct": m["v"][j] if j < len(m["v"]) else None,
                "honest": m["hv"][j] if j < len(m["hv"]) else None,
                "prov": pv,
                "provLabel": label,
            })
        for kk in grand:
            grand[kk] += counts[kk]

        dial_vals = {}
        for k, _ in dials:
            W, tot = dial_weight_vecs[k]
            r = sc.score(m, W, tot)
            dial_vals[k] = round(r["s"], 1) if r else None

        r_default = sc.score(m, W_default, tot_default)
        out_models.append({
            "n": m["n"],
            "lab": m["lab"],
            "open": bool(m.get("open")),
            "cells": cells,
            "dialVals": dial_vals,
            "score": round(r_default["s"], 1) if r_default else None,
            "counts": counts,
        })

    metric_names = {k: prov.get(k, [k])[0] for k in metrics}
    metric_source = {k: [prov.get(k, ["", "", "", ""])[2], prov.get(k, ["", "", "", ""])[3]]
                      for k in metrics}

    data = {
        "metrics": metrics,
        "metricNames": metric_names,
        "metricUnits": {k: rng.get(k, {}).get("u") for k in metrics},
        "metricSource": metric_source,
        "dials": [[k, ms] for k, ms in dials],
        "dialNames": dial_names,
        "defaults": defaults,
        "models": out_models,
        "totals": grand,
        "ciNote": blob.get("ci_note"),
    }

    blob_js = "window.__MPD__=" + json.dumps(data, separators=(",", ":")) + ";"
    script_block = "<script>" + blob_js + "</script>"

    text = open(TARGET, encoding="utf-8").read()
    if START not in text or END not in text:
        sys.exit(f"{TARGET} is missing the {START} / {END} markers")
    pre, rest = text.split(START, 1)
    _, post = rest.split(END, 1)
    new_text = pre + START + "\n  " + script_block + "\n  " + END + post
    if new_text != text:
        open(TARGET, "w", encoding="utf-8").write(new_text)
        print(f"model-picker-data.html updated: {len(out_models)} models, "
              f"{grand['measured']} measured, {grand['sibling']} sibling, "
              f"{grand['imputed']} imputed, {grand['none']} missing, of "
              f"{len(out_models) * len(metrics)} cells.")
    else:
        print("model-picker-data.html already up to date.")


if __name__ == "__main__":
    main()
