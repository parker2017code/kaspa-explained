# V2 release candidate

Prepared September 6, 2026. Public deployment and the full live acceptance
sequence remain pending. This document describes the source and static release
candidate; it does not certify production readiness.

V2 contains sixteen canonical pages: the fifteen educational documents from V1
and `/applications`. The public application lets visitors create a disposable
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
```

These commands generate templates, execute unfunded consensus fixtures,
validate recovery/signing, and build `dist/`. They do not establish live node
acceptance. For the complete educational checks also run `npm run check`,
`npm run check:copy`, `npm run check:posts`, and the documented browser review.

## Release checks

- [x] Public architecture documents all sixteen canonical pages and six templates.
- [x] Separate public signing adapters enforce transaction/body/signature integrity.
- [x] Restore rejects forged holding lineage and clears saved acceptance claims.
- [x] Accepted-history tests cover exact transaction IDs, spent outputs,
  pagination, reorganizations, missing checkpoints and node failures.
- [x] Twelve focused acceptance/recovery/restored-state tests pass in the current review.
- [x] A bounded scan of the 136-file static artifact found no suspicious secret
  filenames or embedded private-key/token literals. This is not exhaustive
  secret detection or a security audit.
- [ ] Finish and record the full live application sequence, including token
  operations and receipt merge, move, and partial/full redemption.
- [ ] Complete final responsive, keyboard, error and recovery browser review
  against the final generated artifact.
- [ ] Run final combined release checks after the last code change.
- [ ] Publish the reviewed source revision and static artifact.
- [ ] Verify the custom domain, application SDK/WASM/templates, historical
  routes and public education pages after deployment.

## Live evidence in progress

The browser reviewer has reported accepted-chain observations for treasury
funding and its A/B exit, prediction funding and a Yes payout, proof funding
and its proof exit, a 0.1 tKAS payment, and receipt genesis and split. The proof
exit fee was 0.181539 tKAS, below its distinct 0.2 tKAS cap. Earlier escrow
coverage and exact transaction identifiers belong in
[the public browser review](../design/PUBLIC-APPS-REVIEW.md), which is the
maintained evidence ledger. Receipt remaining operations, the full token
sequence, and final responsive review were still running when these notes
were prepared. Do not infer those outcomes from the unfunded VM fixtures.

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
