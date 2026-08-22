#!/usr/bin/env python3
"""Write data/l1-chains.json into chain-comparer.html as its inline blob.

The page used to carry a hand-maintained copy of the chain data while
data/l1-chains.json sat next to it referenced by nothing. Two sources of truth,
one of them dead: edits to the JSON silently did nothing, which is exactly the
bug that hid a wrong Polkadot value and a stale "limited" label. The JSON is now
canonical and this script regenerates the blob.

Short keys are kept because the blob ships to every visitor and the long names
roughly double it.

  python3 scripts/build-chain-data.py            # rewrite the blob
  python3 scripts/build-chain-data.py --check    # fail if the blob is stale
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "l1-chains.json"
PAGE = ROOT / "chain-comparer.html"
BLOB = re.compile(r"(window\.__CC__=)(\{.*?\})(;</script>)", re.S)

# long name in the JSON -> short key in the shipped blob
FIELDS = {
    "consensus": "con", "launched": "yr", "block_time_s": "bt", "finality_s": "fin",
    "tps_sustained": "tps", "tps_peak_observed": "peak", "tps_claimed": "claim",
    "median_fee_usd": "fee", "block_producers": "prod", "nakamoto_coefficient": "nak",
    "smart_contracts": "sc", "sc_note": "scn", "security": "sec",
    "node_ram_gb": "ram", "node_disk_gb": "disk",
    "devs_monthly_active": "dev", "devs_full_time": "devft", "steward": "stew",
    "wallets_of_5": "wal", "us_spot_etf": "etf", "cme_futures": "cme",
    "daily_transactions": "tx", "daily_transactions_raw": "txraw", "tx_note": "txnote",
    "privacy_default": "priv", "market_cap_usd": "cap", "hashrate_ehs": "hr",
    "emission_native_per_day": "emn", "emission_usd_per_day": "emu",
    "purpose": "why", "weakness": "weak", "measured_2026_08_22": "meas",
}


def build():
    d = json.loads(DATA.read_text())
    rows = []
    for name, v in d["chains"].items():
        r = {"n": name}
        for long, short in FIELDS.items():
            if long in v:
                r[short] = v[long]
        # Two fields are derived rather than stored, because storing them would
        # let them drift from the values they summarize.
        r["sdk"] = len(v.get("sdk_languages") or [])
        r["cust"] = int(bool(v.get("custody_bitgo"))) + int(bool(v.get("custody_copper")))
        rows.append(r)
    return {"chains": rows, "caveats": d["meta"]["caveats"], "as_of": d["meta"]["as_of"]}


def main():
    want = json.dumps(build(), ensure_ascii=False, separators=(",", ":"))
    src = PAGE.read_text()
    m = BLOB.search(src)
    if not m:
        sys.exit("could not find the window.__CC__ blob in chain-comparer.html")
    if "--check" in sys.argv:
        stale = m.group(2) != want
        print("chain blob is STALE, run scripts/build-chain-data.py" if stale
              else "chain blob matches data/l1-chains.json")
        return 1 if stale else 0
    PAGE.write_text(src[:m.start(2)] + want + src[m.end(2):])
    n = len(json.loads(want)["chains"])
    print(f"wrote {n} chains into chain-comparer.html ({len(want):,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
