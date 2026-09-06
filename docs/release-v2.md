# V2 release candidate

Prepared September 6, 2026. Public deployment remains pending. The original 23-transaction live
application sequence is accepted; an added two-recipient payment is pending. This document describes the source and static release
candidate; it does not certify production readiness.

V2 contains sixteen canonical pages: the fifteen educational documents from V1
and `/applications`, plus 87 compatibility routes. The public application lets visitors create a disposable
Testnet-10 wallet, send test coins, use escrow and threshold treasury rules,
resolve a prediction payout, verify a fixed proof, and operate capped tokens
and fully backed native receipts. It runs from static files with a browser SDK
and node RPC. The private workshop signer is not part of the public release.

Publish `dist/` from the reviewed source revision. Keep `dist-v1/` available as
the separately built educational release. Historical testnet, contracts and
split routes lead to the public applications page. The release packaging test
checks that local signing interfaces and API callers are absent. Source reuse
follows `LICENSE.md` and `THIRD_PARTY.md`; compiler, SDK and example proof
materials retain their stated notices.

## Builder entry points

[Public architecture](public-architecture.md) gives the file map, trust model,
exact caps, recovery format, build commands, and public VM checks. The six
contract sources live in `contracts/public/`. Start with the transaction
builders and signing adapters in `src/public-*.mjs` when reusing behavior;
the UI is one disposable-wallet demonstration of those APIs.

```sh
npm ci
npm run setup:testnet
node scripts/build-public-templates.mjs --check-vm
node scripts/public-token-fixtures.mjs --check-vm
node scripts/public-receipt-fixtures.mjs --check-vm
npm run check:public
npx playwright install chromium firefox webkit
npm run check:public:browser
```

These commands generate templates, execute unfunded consensus fixtures,
validate recovery/signing, and build `dist/`. The browser gate requires a real
Testnet-10 connection and fails if it cannot create and restore an unfunded
wallet; it does not broadcast or establish funded transaction acceptance. For the complete educational checks also run `npm run check`,
`npm run check:copy`, `npm run check:posts`, and the documented browser review.

## Release checks

- [x] Public architecture documents all sixteen canonical pages and six templates.
- [x] Separate public signing adapters enforce transaction/body/signature integrity.
- [x] Restore rejects forged holding lineage and clears saved acceptance claims.
- [x] Accepted-history tests cover exact transaction IDs, spent outputs,
  pagination, reorganizations, missing checkpoints and node failures.
- [x] Nineteen public release/transaction/acceptance/recovery tests and signing checks pass.
- [x] A bounded scan of the 136-file static artifact found no suspicious secret
  filenames or embedded private-key/token literals. This is not exhaustive
  secret detection or a security audit.
- [x] Record all 23 original public-browser transactions in accepted-chain history,
  including the full token and backed-receipt sequences.
- [x] Complete 144 unfunded browser states across Chromium, Firefox and WebKit,
  four widths and both themes, with actual RPC and encrypted recovery.
- [ ] Record the added two-recipient native payment acceptance.
- [ ] Complete final responsive, keyboard, error and recovery browser review
  against the final generated artifact.
- [ ] Run final combined release checks after the last code change.
- [ ] Publish the reviewed source revision and static artifact.
- [ ] Verify the custom domain, application SDK/WASM/templates, historical
  routes and public education pages after deployment.

## Live evidence

All 23 original public-browser transactions were found in accepted-chain history
in the September 6 scan completed at 15:43:28 UTC. This includes escrow funding
and refund, treasury funding and A/B spend, prediction funding and Yes settlement,
proof funding and verification, native payments, every backed-receipt lifecycle
operation, and token genesis through mint, move, split, merge, exchange and burn.
The proof exit fee was 0.181539 tKAS, below its distinct 0.2 tKAS cap.

[The public browser review](../design/PUBLIC-APPS-REVIEW.md) records full IDs,
fees and accepting blocks. The original sequence used 0.312202 tKAS in fees;
native balances and the remaining issuer cell reconcile with fees to the
1.2 tKAS allocation. Receipts were fully redeemed, and token circulating supply
was zero with 900 units still unissued. These balances describe that observation,
prior to the added two-recipient payment. Its acceptance remains a separate check.

The reproducible unfunded browser gate passed 48 states per engine in Chromium,
Firefox and WebKit. It verifies SDK/WASM loading, three distinct zero-balance
accounts, missing-file and wrong-password errors, encrypted file and browser
recovery, keyboard interaction and no horizontal overflow at 320/390/768/1440
pixels in both themes. Safari initially exposed SDK resolver cross-origin errors;
the public entry point now connects directly to the verified Testnet-10 endpoint
and disconnects on page hide. Fresh runs passed all 144 states without hiding
errors. Node unavailability remains a visible failure rather than an offline pass.

Final funded-holdings screenshots and post-deployment verification remain
separate release requirements. No installed external-wallet or physical-device
claim follows from the automated engine checks.

## Trust and limits

Only Testnet-10 is supported. Ordinary contract and payment fees are capped
at 0.01 tKAS, token/receipt fees at 0.03 tKAS, and the fixed proof example at
0.2 tKAS. Principal limits are 1 tKAS; native debit checks allow only the
actual calculated fee above the permitted principal after controlled change
is verified. Caps bound an individual plan, not the security of a wallet or
an application deployed by someone else.

The prediction oracle determines the reported outcome. The three sandbox
accounts share one browser operator and demonstrate signature rules rather
than independent governance. Tokens have a lifetime issuance cap; burning
does not restore issuance. Receipts redeem native tKAS backing and make no
USD or off-chain reserve promise. The fixed proof demonstrates verification,
not complete privacy. Node observation is current evidence, not finality.
External-wallet callback tests do not establish installed-provider behavior.
Physical-device testing and an independent security audit remain unverified.


Additional split review status: a 0.01 + 0.01 tKAS proposal failed the real
storage-mass limit before signing (2,045,832 versus 500,000). No 24th transaction
was submitted. The UI reports the mass-limit reason; a feasible two-recipient
case and the final 80-state funded/read-only visual review remain pending.
