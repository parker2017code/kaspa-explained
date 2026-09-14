#!/usr/bin/env python3
import json
import pathlib
import re
import sys

pages = json.loads(pathlib.Path("site-manifest.json").read_text())["pages"]

forbidden = [
    re.compile(pattern, re.I)
    for pattern in [
        r"\bcrypto rails\b",
        r"\bpayment rails\b",
        r"\bpayments rails\b",
        r"\bpayments-as-rails\b",
        r"\bapp rails\b",
        r"\bproduction app rails\b",
        r"\blive app rails\b",
        r"\bpublic builder rails\b",
        r"\breceipt and transfer rails\b",
        r"\bbasic rails\b",
        r"\bbasic Kaspa rails\b",
        r"\bwallet-readable\b",
        r"\bproof surface\b",
    ]
]

for page in pages:
    text = pathlib.Path(page).read_text()
    for pattern in forbidden:
        if pattern.search(text):
            print(f"{page} contains stale public copy: {pattern.pattern}", file=sys.stderr)
            sys.exit(1)

print("Copy quality checks passed.")
