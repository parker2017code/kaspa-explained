#!/usr/bin/env python3
"""Fail when model-picker.html scores on figures it never loaded.

A dial names its metrics as object keys. Nothing checks them at author time, so
a typo or a metric that was planned and never loaded resolves to undefined, the
weight lands on a property instead of an array index, and the dial silently runs
at a fraction of the share the page prints next to it. That shipped: the
"Writing code" dial carried a scicode weight that was never in the data, so it
ran at three quarters strength while its label read the full percentage.

  python3 scripts/check-model-picker.py
"""
import json, pathlib, re, sys

PAGE = pathlib.Path(__file__).resolve().parent.parent / "model-picker.html"


def main():
    src = PAGE.read_text()
    blob = re.search(r"window\.__MP__=(\{.*?\});</script>", src, re.S)
    if not blob:
        sys.exit("could not find the window.__MP__ blob in model-picker.html")
    data = json.loads(blob.group(1))
    metrics = set(data["metrics"])

    body = re.search(r"var DIALS = \[(.*?)\n  \];", src, re.S)
    if not body:
        sys.exit("could not find the DIALS array in model-picker.html")

    dials, bad = [], []
    for m in re.finditer(r"\{ k: '([^']+)',\s*t: '([^']+)',\s*w: \{([^}]*)\}", body.group(1)):
        key, weights = m.group(1), dict(re.findall(r"(\w+):\s*(\d+)", m.group(3)))
        dials.append(key)
        for metric in weights:
            if metric not in metrics:
                bad.append((key, metric))

    presets = re.search(r"var PRESETS = \[(.*?)\n  \];", src, re.S)
    if presets:
        for m in re.finditer(r"v: \{([^}]*)\}", presets.group(1)):
            for k in re.findall(r"(\w+):\s*\d+", m.group(1)):
                if k not in dials:
                    bad.append(("preset", k))

    if bad:
        for owner, metric in bad:
            print(f"  {owner} references unknown key {metric!r}")
        sys.exit(f"model-picker.html: {len(bad)} dangling reference(s)")

    print(f"model picker: {len(dials)} dials, all weights resolve to loaded metrics")
    return 0


if __name__ == "__main__":
    sys.exit(main())
