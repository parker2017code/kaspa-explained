# Browser-owned Sprout Harbor

V6 now creates three demo keys in the browser. Creating a wallet sends no transaction; requesting ten Testnet-10 coins is a separate action. Every lesson transaction has an explicit review, exact fee, cancellation and approval. The browser saves its signed transaction before submitting it directly to the public node. Pending transactions block further spending but never lesson navigation. Status checks are read-only; explicit retry uses the identical saved transaction.

The six lessons cover a conditional purchase, a limited agent allowance, a three-party exchange, refundable group pledges, payment against a delivery receipt, and a proof-conditioned reward. All roles belong to the same browser. Physical goods and buildings are illustrations: contracts enforce ledger quantities, signatures and stated conditions, not physical delivery. The greenhouse appears only after an accepted group payout. Result animations run once per newly observed transaction; reload restores the result without replaying it.

Wallet keys and journals are encrypted in local storage using a random key held in this tab's session storage. Reload works; closing the tab can lose that session key. The page therefore offers a password-protected recovery file. Import never replaces an existing wallet, and imported acceptance claims must be observed again from the node before spending. Existing host-controlled V6 records remain available through a read-only legacy panel; loading the new guide does not resume their action queue.

Ordinary guide activity does not use the hosted V6 transaction service. Only the final proof-generation step calls bounded browser-assistance endpoints. They accept public proof parameters, retain capability authentication and request/start limits, and hold no browser keys. The older hosted signer remains only for existing legacy sessions.

## Acceptance evidence

`docs/v6-browser-wallet-verification.json` records one fresh ten-coin wallet completing 22 real Testnet-10 transactions and all six lessons, with accepting-block hashes and no browser errors. This was a loopback frontend using direct public RPC and the actual local proof helper; it is not evidence of production helper acceptance.

`scripts/check-v6-browser-engine.mjs` checks the 22-transaction journey against the native VM plus nine failure/recovery cases. `scripts/check-v6-wallet-browser.mjs` runs the built browser wallet, UI and world against a synthetic node fixture, validating signed transactions with the native VM. Chromium, Firefox and WebKit each completed all 22 steps and preserved all six completions on reload without resubmission or repeated world events. Separate checks cover edited proof settings, narrow layouts, dark dialogs, keyboard focus and failed requests. These are browser/viewport emulations, not physical-device checks.
