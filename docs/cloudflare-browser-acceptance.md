# Cloudflare browser acceptance

This is the release gate for the hosted V5 and V6 Testnet-10 applications. It
uses persistent Chromium profiles and the controls rendered by each page. The
drivers do not intercept requests, call application APIs directly, or synthesize
chain state. V5 observes rendered controls and responses. V6 also reads the saved
public session snapshot and pending request path to verify reload recovery;
it does not export browser credentials or modify saved state.

## Safety boundary

- Use only Testnet-10 funds.
- V5 uses `.local/v5-cloudflare-browser-qa`; V6 uses
  `.local/v6-cloudflare-browser-qa`. Do not substitute `.local/v5-final`, the
  local V6 profile, or another funded profile.
- Each browser journey enforces an 8 tKAS session cap. Use the normal capped
  faucet. Do not create a separate V6 funding path from an acceptance run.
- When a transaction is submitted but its outcome is uncertain, leave the
  profile intact and reconcile that same transaction. Do not resubmit it.
- Reports retain public transaction IDs and accepting blocks. They omit
  capabilities, private keys, signatures, serialized transactions, scripts and
  raw request bodies.

## V5

Run the staging gate with:

```sh
V5_QA_HEADLESS=1 node scripts/check-v5-live-browser.mjs
```

Set `V5_QA_URL=https://kaspaexplained.com/covenants/v5` for the final canonical
route after it is deployed. The driver accepts only the canonical site, its
`www` host, the production Worker host and the Pages host, all over HTTPS.

The gate walks the rendered guide through farming, orders, upgrades, the
business exchange, habitat care, workshop construction, Pip's bounded trading
permission, the three-party ring, bonded delivery, receipt release and aged
refund. It then verifies the free-play boundary, reload restoration without a
new action, desktop layout, and a 390 by 844 completion view.

The 8 September 2026 Pages run completed at
`https://kaspa-explained.pages.dev/covenants/v5`. The isolated wallet started
from the normal 10 tKAS faucet allocation and ended at 9.376168 tKAS, a net
decrease of 0.623832 tKAS. The final restored session contained 28 accepted
receipts with accepting blocks, including ring setup and settlement, delivery
role funding, payment and bond lock, receipt release, a second agreement, and
the aged refund. The desktop and phone-width completion views had no horizontal
overflow and kept the town canvas rendered. Reload returned to `Play freely`
without a new `/api/v5/action` or `/api/v5/payment` request.

The machine-readable report and screenshots are in
`.cache/cloudflare-qa/v5/`. The report is the receipt index; screenshots show
the actual rendered state. This gate observes application receipt evidence. It
does not independently reconstruct transactions from a separate RPC node.

## V6

Hosted V6 is disabled by default. After the V6 API and page are deployed and
the coordinator confirms the funded hosted profile is ready, run:

```sh
V6_QA_HOSTED=1 \
V6_QA_URL=https://kaspaexplained.com/covenants/v6 \
V6_QA_HEADLESS=1 \
node scripts/check-v6-live-browser.mjs
```

The hosted opt-in is mandatory. The driver accepts the same four HTTPS hosts as
V5 and requires `/covenants/v6`; loopback retains the existing
`/covenants-v6` route and local profile defaults.

The V6 gate retains the existing acceptance requirements: first-pending reload
keeps the same transaction and sends no duplicate start or action, the accepted
purchase and completed scene survive reload, all 26 setup and chapter
transactions have transaction IDs and accepting blocks, at least five invalid
attempts are rejected by the Kaspa transaction script engine, the final
inventory and completed scene persist, and total host spending remains within
8 tKAS. Output is written to `.cache/cloudflare-qa/v6/`.

Do not treat a page-only response or a predeployment API failure as acceptance.
The hosted V6 report must finish with `status: "complete"`, 26 accepted
transactions, the VM rejection evidence, and no pending transaction.

## Publication checks

Both routes must keep `noindex` and remain absent from public navigation, site
search and the sitemap. Their canonical links should be
`https://kaspaexplained.com/covenants/v5` and
`https://kaspaexplained.com/covenants/v6`. Check these again on the canonical
host after the final Cloudflare deployment; a Pages result proves staging only.
