# Chain comparer methodology review, 2026-08-22

Scope note: this file is new analysis only. It does not edit `chain-comparer.html`
or `data/l1-chains.json`. Numbers below come from parsing the `window.__CC__`
blob embedded in `chain-comparer.html` (dated 2026-08-01) with
`scripts/chain-dial-correlation.py`, plus new live-source checks run today.
Claim status is marked verified, inferred, estimated, or unknown throughout.

## Task 1: redundancy across the 11 dials

Method: reproduced chain-comparer's own per-dial normalization in Python
(log10 transform where the dial specifies `log: 1`, direction flip, then
0-100 scaling against whichever chains report that field, exactly as the
page's own JS does), then computed Pearson r for every dial pair on those
0-100 scores. Full matrix and script: `scripts/chain-dial-correlation.py`.
Verified: reran and reproduced the numbers below directly from the script.

Coverage per dial (of 20 chains): fast 20, progs 20, privacy 20, node 20,
ready 20, mined 20, volume 19, people 19, spread 18, settle 17, **cheap 6**.
`cheap` (median fee, in dollars) is the one dial six chains actually publish
a comparable figure for: Bitcoin, Ethereum, Litecoin, Monero, Kaspa, Bitcoin
Cash. Every correlation involving `cheap` runs on n=5 or n=6 and all six of
those chains are older, fee-market-driven PoW or PoW-descended designs. Those
r values are not treated as reliable evidence of redundancy below; they
describe five old-school chains, not the dataset.

### Correlation matrix (Pearson r, 0-100 normalized dial scores)

```
            fast  settle   cheap  volume   progs privacy  spread    node  people   ready   mined
fast        1.00    0.86    0.50    0.60    0.59   -0.30    0.50   -0.39   -0.26   -0.12   -0.61
settle      0.86    1.00    0.82    0.43    0.64   -0.35    0.72   -0.27   -0.21   -0.01   -0.67
cheap       0.50    0.82    1.00   -0.54   -0.12   -0.25    0.05    0.86   -0.91   -0.49    0.42
volume      0.60    0.43   -0.54    1.00    0.63   -0.35    0.37   -0.67    0.24    0.37   -0.63
progs       0.59    0.64   -0.12    0.63    1.00   -0.70    0.58   -0.50    0.30    0.51   -0.93
privacy    -0.30   -0.35   -0.25   -0.35   -0.70    1.00   -0.30    0.19   -0.09   -0.55    0.40
spread      0.50    0.72    0.05    0.37    0.58   -0.30    1.00   -0.37   -0.15    0.14   -0.61
node       -0.39   -0.27    0.86   -0.67   -0.50    0.19   -0.37    1.00   -0.31   -0.37    0.54
people     -0.26   -0.21   -0.91    0.24    0.30   -0.09   -0.15   -0.31    1.00    0.64   -0.36
ready      -0.12   -0.01   -0.49    0.37    0.51   -0.55    0.14   -0.37    0.64    1.00   -0.38
mined      -0.61   -0.67    0.42   -0.63   -0.93    0.40   -0.61    0.54   -0.36   -0.38    1.00
```

Rows/columns: fast, settle, cheap, volume, progs, privacy, spread, node,
people, ready, mined (same order as `chain-comparer.html`'s `DIALS` array).

### Every pair with n >= 10, sorted by |r|

| r | n | pair | reading |
|---|---|------|---------|
| **-0.93** | 20 | mined <-> progs | secured by mining / runs real programs |
| **+0.86** | 17 | fast <-> settle | shows up fast / settles for good |
| -0.70 | 20 | privacy <-> progs | keeps payments private / runs real programs |
| -0.67 | 19 | node <-> volume | cheap to run yourself / carries real volume |
| -0.67 | 17 | mined <-> settle | secured by mining / settles for good |
| +0.64 | 17 | progs <-> settle | runs real programs / settles for good |
| **+0.64** | 19 | people <-> ready | has people behind it / ready to use today |
| -0.63 | 19 | mined <-> volume | secured by mining / carries real volume |
| +0.63 | 19 | progs <-> volume | runs real programs / carries real volume |
| -0.61 | 18 | mined <-> spread | secured by mining / hard for a few to control |
| -0.61 | 20 | fast <-> mined | shows up fast / secured by mining |
| +0.60 | 19 | fast <-> volume | shows up fast / carries real volume |
| +0.59 | 20 | fast <-> progs | shows up fast / runs real programs |
| +0.58 | 18 | progs <-> spread | runs real programs / hard for a few to control |
| -0.55 | 20 | privacy <-> ready | keeps payments private / ready to use today |
| +0.54 | 20 | mined <-> node | secured by mining / cheap to run yourself |
| +0.51 | 20 | progs <-> ready | runs real programs / ready to use today |
| +0.50 | 20 | fast <-> spread | shows up fast / hard for a few to control |
| -0.50 | 20 | node <-> progs | cheap to run yourself / runs real programs |
| +0.43 | 16 | settle <-> volume | settles for good / carries real volume |
| +0.40 | 20 | mined <-> privacy | secured by mining / keeps payments private |
| -0.39 | 20 | fast <-> node | shows up fast / cheap to run yourself |
| -0.38 | 20 | mined <-> ready | secured by mining / ready to use today |
| -0.37 | 18 | node <-> spread | cheap to run yourself / hard for a few to control |
| -0.37 | 20 | node <-> ready | cheap to run yourself / ready to use today |
| +0.37 | 19 | ready <-> volume | ready to use today / carries real volume |
| +0.37 | 18 | spread <-> volume | hard for a few to control / carries real volume |
| -0.36 | 19 | mined <-> people | secured by mining / has people behind it |
| -0.35 | 17 | privacy <-> settle | keeps payments private / settles for good |
| -0.35 | 19 | privacy <-> volume | keeps payments private / carries real volume |
| -0.31 | 19 | node <-> people | cheap to run yourself / has people behind it |
| -0.30 | 20 | fast <-> privacy | shows up fast / keeps payments private |
| +0.30 | 19 | people <-> progs | has people behind it / runs real programs |
| -0.30 | 18 | privacy <-> spread | keeps payments private / hard for a few to control |
| -0.27 | 17 | node <-> settle | cheap to run yourself / settles for good |
| -0.26 | 19 | fast <-> people | shows up fast / has people behind it |
| +0.24 | 18 | people <-> volume | has people behind it / carries real volume |
| -0.21 | 17 | people <-> settle | has people behind it / settles for good |
| +0.20 | 20 | node <-> privacy | cheap to run yourself / keeps payments private |
| -0.15 | 18 | people <-> spread | has people behind it / hard for a few to control |
| +0.14 | 18 | ready <-> spread | ready to use today / hard for a few to control |
| -0.12 | 20 | fast <-> ready | shows up fast / ready to use today |
| -0.09 | 19 | people <-> privacy | has people behind it / keeps payments private |
| -0.02 | 17 | ready <-> settle | ready to use today / settles for good |

### Testing the hypothesis

**"Shows up fast" and "settles for good" largely predict each other: confirmed,
r = 0.86, n = 17.** This is the single strongest reliable pair in the matrix.
It makes sense mechanically: every chain here that includes a transaction
quickly also finalizes it quickly, because both numbers are driven by the same
underlying thing, how fast the consensus mechanism itself runs. The two chains
that separate them are Cardano (fast block production, no live finality
figure at all) and Kaspa (0.1s inclusion, 10s practical settlement, a real
310x gap between the two dials by design). Those exceptions are the reason to
keep both dials rather than force one number, but for 15 of 17 chains, one of
these two numbers would predict the other inside a wide margin.

**"Ready to use today" and "has people behind it" predict each other:
weaker than hypothesized. r = 0.64, n = 19,** meaning about 41% shared
variance, not "largely." Cardano is the clean counterexample: 239 full-time
developers (mid-pack) but only 2 of 5 wallets, no live ETF, no CME futures,
landing near the bottom of `ready`. Developer headcount buys wallet and
custody integration only loosely; regulatory and exchange decisions move on
their own timeline. Correlated, not redundant.

**The strongest pair in the whole matrix was not in the hypothesis: mined
<-> progs, r = -0.93, n = 20.** Every dial-11 (mined) chain in this roster
(Bitcoin, Litecoin, Monero, Kaspa, Bitcoin Cash: all PoW) scores 0 or 50 on
programmability (Bitcoin/Litecoin/Bitcoin Cash/Kaspa = "rules," Monero =
"none"), and almost every non-PoW chain in the roster carries a full VM. This
is a property of which 20 chains got selected, not a law that mining and
programmability trade off against each other: it would take only one
PoW-with-a-VM chain (Ergo, Kadena) or one PoS chain without a VM in the
roster to break it. Recommendation below is to flag this, not merge the
dials, because "how it is secured" and "what it lets you build" are
conceptually distinct questions even when this particular sample answers them
almost identically.

### Redundancy verdict

Eleven dials do not cleanly collapse to six. One merge is well supported by
the data; the rest of the strong correlations are either too thin on sample
size (`cheap`, n=6) or artifacts of chain selection (`mined`/`progs`) rather
than genuine redundancy.

1. **Merge `fast` and `settle`, or keep both but stop double-counting them.**
   r=0.86 on n=17 is strong and mechanically sound: they measure the same
   underlying consensus speed for all but two chains. If the dial count must
   shrink, this is the pair to cut. If both stay (recommended, because Kaspa
   and Cardano are exactly the cases a reader benefits from seeing split
   apart), a preset or scoring note should say plainly that turning both up
   mostly counts one property twice.
2. **Do not merge `mined` and `progs` despite r=-0.93.** The correlation is
   real in this dataset and worth a caveat in the page copy ("every PoW chain
   here trades away programmability, and every programmable chain here is not
   mined, so these two dials move together on this roster even though they
   answer different questions"), but merging them would make it structurally
   impossible for a future chain (or a fixed roster) that breaks the pattern
   to register correctly on either axis.
3. **`ready` and `people` are correlated (r=0.64) but not redundant.** Keep
   both; Cardano is the visible counterexample the site would lose if they
   were merged.
4. **`cheap` cannot be evaluated for redundancy at all.** Six data points is
   not enough to trust any r against it, and the six that exist are the
   oldest, least representative slice of the roster (see Task 2: the fee
   field is also the one with the worst missing-data problem in the set).
   The honest fix is not a redundancy call, it is getting more chains a
   comparable fee figure (Task 3 addresses live sources for that).
5. No dial reaches the threshold that would justify deleting it outright.
   The weakest, most independent dial is `ready` (correlates with nothing
   above 0.64, and near-zero with `settle` and `fast`), which is the opposite
   of redundant: it is the dial carrying information no other dial carries.

Net: one confirmed strong redundancy (`fast`/`settle`), one confirmed-but-
moderate correlation (`ready`/`people`), one strong-but-artifactual
correlation that should be flagged rather than acted on (`mined`/`progs`),
and one dial (`cheap`) too thin on data to judge either way.

## Task 2: measurement integrity, the "carries real volume" dial

The `volume` dial reads the `tps` field, which is `tps_sustained` in
`data/l1-chains.json`: a per-chain sustained-throughput figure. Its own
caveat already flags a window problem (some chains are genuine 30-day means,
others one-hour or one-day snapshots). Task 2 asks a different question: for
the chains whose raw activity counts inflated headlines (Solana votes, TON
multi-tx, Aptos metadata, Sui system overhead), does the `tps` figure that
actually feeds the dial carry the same inflation, or was it already cleaned?

Checked by comparing `tps * 86400` (implied daily count) against each
chain's published `tx` (cleaned) and `txraw` (raw headline) fields, for the
eight chains that publish both a tps figure and a tx/txraw pair:

| Chain | tps | implied daily (tps x 86400) | tx (cleaned) | txraw | reads as |
|---|---|---|---|---|---|
| Kaspa | 0.895 | 77,328 | 77,207 | 737,701 | **matches cleaned** (within 0.2%) |
| Sui | 62.79 | 5,425,056 | 5,453,196 | not published | **matches cleaned** (within 0.5%) |
| Aptos | 140.49 | 12,138,336 | 12,162,290 | 16,887,232 | **matches cleaned** (within 0.2%) |
| BNB Chain | 201.7 | 17,426,880 | 14,769,147 | not published | closer to cleaned, 18% over it |
| Hedera | 3.66 | 316,224 | 409,199 | not published | below cleaned by 23%, unexplained |
| **TON** | 39.13 | 3,380,832 | 485,433 | 3,142,820 | **matches raw**, not cleaned (7x cleaned) |
| **Solana** | 1,175 | 101,520,000 | 136,477,068 | 281,210,710 | **matches neither** |
| Polkadot | null | n/a | 12,919 | not published | tps not scored |

Verified from the site's own data (not external): Kaspa, Sui, and Aptos's
`volume` dial score is built on the honest, deduplicated transaction count.
The raw-vs-clean gap the site documents in its own caveats does not leak
into the dial for these three.

**TON is the concrete finding.** The `tps_sustained` figure feeding TON's
`volume` dial (39.13) implies ~3.38 million transactions a day, which lands
within 8% of TON's own *raw* count (3.14 million) and nowhere near its
cleaned count (485,433). The site's caveat text says TON's headline is
"roughly 6.5x inflated" and names the reason (one user action becomes
several account-level transactions), but the dial itself is scored off that
same inflated number. TON's `volume` score should be roughly 6.5x lower once
corrected. This is a real bug in the current dataset, not a methodology
nitpick: the page's own prose and its own scored number disagree about which
figure is honest.

**Solana cannot be reconciled at all.** Its `tps_sustained` implies about
101.5 million transactions a day, which sits below both its cleaned count
(136.5 million) and its raw count (281.2 million). It does not match either
published transaction total, which means it most likely comes from a third
source, a different day, or a different measurement window than either `tx`
or `txraw`, and nothing in the dataset documents which. Inferred: the figure
is probably closer to the cleaned basis than the raw one (roughly 74% of
it), but this is a guess, not a check, and should be labeled that way if the
`volume` dial keeps using it.

**BNB Chain and Hedera cannot be checked at all**, because neither publishes
a `txraw` figure, so there is no way to tell from the site's own data whether
their `tx` count is already clean or still carries an uncounted category of
non-user activity. Their `tps_sustained` figures are close in order of
magnitude to their one published transaction count, which is weak
reassurance at best.

**The other twelve chains (Bitcoin, Ethereum, Cardano, Avalanche, TRON, Near,
Algorand, Litecoin, Monero, Internet Computer, Stellar, Bitcoin Cash) publish
no `tx`/`txraw` pair at all**, so there is no basis in this dataset to know
whether their `tps_sustained` figure counts a single, comparable category of
activity (a plain user-initiated transfer or contract call) or something
broader (e.g., internal system messages, the way Filecoin's message count
runs roughly 20x its user-message count per the site's own caveat on a chain
not even in this roster). These twelve are **not normalized and not
verifiable from data already on hand.**

### Proposed normalized measure

Where a chain publishes both `tx` (site-cleaned) and `txraw`, the `volume`
dial should read `tx / 86400`, not `tps_sustained`, whenever the two
disagree by more than the window-length caveat can explain (the TON case).
Where only `tx` exists (BNB, Hedera), keep using it but keep the "not
independently verified against a raw count" flag. Where neither exists
(the twelve chains above, plus Solana's unreconciled figure), the honest
label is "comparability with the cleaned-count chains is unverified," not a
number correction, because there is nothing in hand to correct it against.

### Chains not normalizable from current data (explicit list)

Solana (figure does not match either published transaction basis),
BNB Chain, Hedera (no raw baseline to check against), Bitcoin, Ethereum,
Cardano, Avalanche, TRON, Near, Algorand, Litecoin, Monero, Internet
Computer, Stellar, Bitcoin Cash, Polkadot (no tx/txraw pair published at
all, or tps null). That is 15 of 20 chains where the `volume` dial's
comparability cannot be confirmed from what the site already has on file.

## Task 3: live sources per dial

Confirmed reachable from this environment today (`curl` status checks, not
full response validation): `api.kaspa.org` (200), `kascov.io` (200),
`raw.githubusercontent.com` (200 on a valid path; 404 above was a bad file
name, not a block), `api.blockchair.com` (200), `api.llama.fi` (200),
`mempool.space` (200), `api.blockcypher.com` (200), `api.etherscan.io`
(200), `chainspect.app` (200), `api.mainnet-beta.solana.com` (200, raw RPC),
`horizon.stellar.org` (200). Not reachable or auth-gated from here:
`api.solscan.io`, `beacon.electriccapital.com`,
`community-api.coinmetrics.io` (400, likely needs a query, not blocked),
`api.developerreport.com`. This list is a today snapshot, not a guarantee;
recheck before wiring a refresh script to any of them.

| Dial | Field | Source(s) | Pullable programmatically | Manual only |
|---|---|---|---|---|
| Shows up fast | `bt` block time | Chain RPC/explorer per chain (`getBlockTime` for Solana, Blockchair `stats` endpoint for Bitcoin/Ethereum/Litecoin/Bitcoin Cash/Cardano, native RPC for Avalanche/BNB/Cronos) | Yes, per chain, no single aggregator covers all 20 | None if per-chain RPC access exists |
| Settles for good | `fin` finality | Chain docs/protocol constants (BFT chains: fixed by consensus round; PoW: confirmation-depth convention) | Partly: BFT finality times are often protocol constants, not observed data | PoW confirmation conventions and Cardano's Peras-target ambiguity need a documented human judgment call, not a fetch |
| Costs little to send | `fee` median fee | Blockchair `stats.median_transaction_fee_usd` (Bitcoin, Litecoin, Bitcoin Cash), mempool.space fee estimator (Bitcoin), Etherscan gas oracle (Ethereum), chain-specific explorers otherwise | Yes for the handful with a public fee-stats endpoint | Most of the other 14 chains: no chain publishes a "median fee in USD" endpoint directly comparable to Blockchair's; would need a bespoke calc from gas price x native token price x USD rate per chain |
| Carries real volume | `tps` | Blockchair `stats` (6 chains), chain RPC block-scan (Avalanche/BNB/Solana/Cronos), Chainspect.app (aggregator, used for `tps_claimed`/`tps_peak_observed` on many rows already) | Yes for the chains Chainspect or Blockchair cover | The cleaned vs raw distinction (Task 2) is not something any aggregator API states; it must be derived from each chain's own docs on what counts as a "transaction" |
| Runs real programs | `_progs` (derived from `sc`) | Each chain's own docs: does it expose an account-based VM, script-only spend rules, or nothing | No live endpoint; this is a categorical fact that changes on a hard fork, not daily | Manual. It rarely changes: recheck only after a named upgrade |
| Keeps payments private | `priv` | Protocol docs / whitepaper: is privacy on by default | No endpoint; categorical | Manual, changes only on protocol redesign |
| Hard for a few to control | `nak` Nakamoto coefficient | Third-party trackers (e.g. a community Nakamoto-coefficient tracker per PoW chain's mining-pool distribution; for PoS chains, on-chain stake distribution queryable from each chain's own staking module/RPC) | Partly: PoS stake concentration is derivable from on-chain data via RPC; PoW pool share needs an external pool-attribution service (no canonical free API found reachable from here) | The Polkadot case in this dataset (166 to 4 depending on clustering) shows this figure needs a documented methodology choice, not just a fetch |
| Cheap to run yourself | `disk` node disk size | Each chain's own client release notes / sync-guide docs (rarely an API; usually a docs page or a community wiki figure) | No | Manual: changes slowly, worth a periodic docs recheck rather than automation |
| Has people behind it | `devft` | Electric Capital Developer Report (`developerreport.com` API / `data.opendevdata.org` parquet snapshot, both cited in `l1-chains.json` already), not reachable from here today | No, from this environment (auth/network gated today) | Manual pull of the published monthly snapshot until API access is confirmed |
| Ready to use today | `_ready` (wallets + custody + ETF + CME, derived) | Wallet vendor registries (MetaMask, Phantom, Trust Wallet `registry.json` on GitHub, Exodus asset list, Keplr chain-registry, all already used per `l1-chains.json` sources), BitGo `assets.bitgo.com/protocols.data`, Copper `api.copper.co/platform/currencies`, SEC EDGAR full-text search for 8-A12B/S-1 filings, CME product listings | Wallet registries and BitGo/Copper feeds: yes, JSON endpoints. SEC filings: yes via EDGAR full-text search API, but the "live vs filed" call requires reading the filing text. The API returns no boolean for it. | ETF/CME status changes are infrequent and filing language needs a human read regardless of API access |
| Secured by mining | `_mined` (derived from `sec`) | Protocol docs: consensus family, categorical | No | Manual, changes only on a consensus-mechanism hard fork (rare, newsworthy) |

### What a refresh script could and could not automate

**Could automate today, plausibly in one script:** block time and observed
TPS for the handful of chains Blockchair and Chainspect already cover
(confirmed reachable: `api.blockchair.com` returned 200 for `bitcoin/stats`
just now); Solana's own RPC for block time and slot data
(`api.mainnet-beta.solana.com` returned 200); wallet-registry JSON pulls for
the `ready` dial's wallet count, the same pattern `l1-chains.json` already
documents as its wallet source; GitHub-hosted registries via
`raw.githubusercontent.com` (confirmed reachable) for anything the chain
ecosystems publish as a JSON file in a public repo (chain registries, wallet
registries, KIP-style spec repos).

**Could not automate, needs a person:** the Nakamoto coefficient (no single
free, reliable, machine-readable source across both PoW pool-share and PoS
stake-concentration conventions, and the Polkadot case shows the number
itself is a methodology argument, not a fact to fetch); node disk-size
requirements (published in prose in release notes and sync guides, not an
API); `_progs` and `_mined` (categorical facts from protocol docs that
change only on a hard fork, better hand-verified than polled); ETF/CME
status (the filing exists via API but "is this actually live and traded" is
a judgment call the raw filing text does not make for you); the Electric
Capital developer figures (the API was not reachable from this environment
today, and even when reachable, its rollup-vs-first-party distinction, flagged
already in `l1-chains.json`'s own caveats, needs a human check per chain,
not just a number pull); and, per Task 2, the cleaned-vs-raw transaction
question for any chain not already covered by a documented `tx`/`txraw`
split, since no aggregator API states which basis it is reporting on.

A workable refresh script shape: one Python file, one function per pullable
field, each hitting a documented endpoint and writing into a dated JSON
blob (matching the existing `data/l1-chains.json` shape and its
`measured_2026_08_01`-style per-chain provenance list), with every
non-pullable field left untouched and flagged with its last manual-check
date, the same pattern `AGENTS.md`'s live-fetch note already recommends for
the KIP/KCC tables: write a hand-verified baseline, fetch what can be
fetched, and never let a failed fetch silently blank a field the baseline
already had right.

## Task 4: honest 0-100 scale per dial

The site's own model-picker frames "0 the worst ever recorded, 100 the
best," fitted from measured extremes rather than from this one 20-chain
roster. The same discipline applied to chain-comparer's dials, with log vs.
linear called explicitly and reasoned per dial. Anchors below are the best
available reasoning, not all independently re-verified today; each is
labeled.

| Dial | Worst-ever anchor | Best-ever anchor | Linear or log | Reasoning |
|---|---|---|---|---|
| Shows up fast (block time) | Estimated: multi-hour effective inclusion during severe congestion (Bitcoin's Dec 2017 fee spike stranded transactions for over 24h; use 86,400s as a round worst-case floor) | Verified from this dataset: Aptos's 0.037s block time, sub-frame | **Log.** Block times in this roster span 0.037s to 580s, four orders of magnitude, and a linear scale would crush every chain below Bitcoin Cash into the bottom 1% of the range while the reader's actual question ("do I wait a second or a minute") is a log-scale question | 
| Settles for good (finality) | Estimated: Bitcoin's 6-confirmation convention at its slowest observed block-time stretch (multi-hour); treat 43,200s (12h) as a round worst-case, matching Kaspa's own documented consensus-finality boundary at 10 BPS | Verified from this dataset: sub-second BFT finality (Sui/TON/BNB, ~0.5-0.8s) | **Log.** Same order-of-magnitude spread as block time (sub-second to hours), same reasoning |
| Costs little to send | Estimated: a historic Bitcoin/Ethereum fee spike, on the order of $50-100 per transaction during 2021-2022 congestion peaks (needs a primary re-check before shipping a number, marked unverified here) | Verified from this dataset: Kaspa's $0.000063 median fee | **Log.** Fees here span six orders of magnitude ($0.00006 to $0.13 within just this roster, and historic spikes push the top far higher); explicitly one of the two dials the model-picker methodology already calls "certainly log," and nothing about fee distributions argues otherwise here |
| Carries real volume (tps) | Anchor at 0, a chain with no observed activity | Estimated: Solana's own claimed ceiling (65,000 tps) or a higher lab-benchmark figure from a chain not in this roster; needs a documented apples-to-apples peak, not a per-project marketing claim | **Log.** Sustained throughput here spans 0.174 to 1,322 tps, four orders of magnitude, and peak-observed figures in the same dataset already run into the tens of thousands; a linear scale would make every sub-100-tps chain (11 of 20) indistinguishable at the bottom |
| Runs real programs | 0: no contract capability (Monero, "none") | 100: full account-based VM ("vm") | **Linear**, but really a 3-point ordinal (0/50/100), not a continuous measurement. There is no meaningful "more VM than another VM" axis at this level of resolution; log transform would misrepresent a categorical fact as a continuous one |
| Keeps payments private | 0: fully public ledger | 100: sender, receiver, and amount hidden by default | **Linear**, same reasoning as above: this is a categorical fact with three values in the current dataset (0/1/2). It is not a rate. |
| Hard for a few to control (Nakamoto coefficient) | 1: a single entity produces a majority of blocks (documented in this dataset for Ethereum Classic, a chain not in the 20 but cited in the caveats, and functionally true for Ethereum's own nak=1 here) | Estimated: no chain has a verified coefficient much above the 20s-30s range once conservative clustering is applied (this dataset's Polkadot dispute, 166 vs 4, is itself the cautionary case); treat ~30 as a reasoned ceiling rather than trusting an unclustered self-reported number | **Log.** The difference between "1 party" and "3 parties" matters enormously more than the difference between "22 parties" and "24 parties," which is exactly a log relationship, and the model-picker precedent already treats similarly skewed concentration-style figures as log |
| Cheap to run yourself (node disk) | Estimated: the heaviest node in wide use today, on the order of tens of terabytes (this dataset's Internet Computer at 32,000 GB is close to that ceiling already) | Verified from this dataset: Algorand's 100 GB | **Log.** Disk requirements here span 100 GB to 32,000 GB, 2.5 orders of magnitude, and the reader's real question ("does this fit on a laptop or does it need a data center") is a log-scale distinction |
| Has people behind it (full-time devs) | 0: no measurable full-time contributor activity | Verified from this dataset: Ethereum's 2,760 | **Log.** Spans 0 to thousands; a handful of large ecosystems would otherwise dominate the entire visible range and compress every chain under 500 developers into an unreadable cluster |
| Ready to use today | 0: no wallet, custody, ETF, or futures support | 8: the dial's own defined ceiling (5 wallets + 2 custody desks + ETF live at 2 + CME at 1, capped) | **Linear.** This is already an engineered composite of small integer counts, not a measured rate; a log transform would add false precision to what is fundamentally a checklist score | 
| Secured by mining | 0: not proof-of-work (PoS, federated, permissioned) | 100: proof-of-work | **Linear**, and arguably should not be a graded scale at all: `_mined` currently also assigns 60 to "storage" (proof-of-space/-time chains, none of which appear in this 20-chain roster today), which is a real intermediate category, but among the chains actually scored here it is a binary (0 or 100), so log vs. linear is moot until a proof-of-storage chain is added |

Two dials the model-picker precedent calls "certainly log" (latency, fees)
map here to `fast`/`settle` (both log, confirmed above) and `cheap` (log,
confirmed above). The remaining rate-like dials (`volume`, `spread`, `node`,
`people`) are also log for the same reason chain-comparer's own code already
applies `log: 1` to them; the analysis above is really confirming the
existing implementation's log/linear choices are correct, with one
exception worth flagging: `mined` and `ready` are implemented as `log: 0`
(linear) already, which this review agrees with for different reasons in
each case (categorical vs. engineered-composite).

## What could not be verified (explicit)

- **The `tps_sustained` methodology for 15 of 20 chains** (Task 2): no
  documented cleaned-vs-raw basis exists in the site's own data for Bitcoin,
  Ethereum, Cardano, Avalanche, TRON, Near, Algorand, Litecoin, Monero,
  Internet Computer, Stellar, Bitcoin Cash, Polkadot, BNB Chain, or Hedera.
  Solana's figure was checked and found to match neither its cleaned nor raw
  published transaction count.
- **Electric Capital developer-report API access** was not reachable from
  this environment today (`api.developerreport.com`, `beacon.electriccapital.com`
  both failed to resolve); the `people` dial's live-refresh path is unverified
  until that is retried from wherever the refresh script actually runs.
- **Nakamoto-coefficient sourcing for PoW pool-share** has no single
  reliable, machine-readable, freely reachable source confirmed today; every
  number in this field in the existing dataset is effectively a
  point-in-time manual read, and the Polkadot case in the existing caveats
  (166 vs. 25 vs. 14 vs. 4, depending on clustering methodology) shows the
  figure is a methodology choice as much as a measurement.
- **The worst-ever anchors proposed in Task 4 for `fast`, `settle`, and
  `cheap`** are estimated, not independently re-verified against a primary
  source today (e.g., the exact peak Bitcoin fee during 2021-2022 congestion,
  or the longest historically documented Bitcoin confirmation wait). They
  are directionally reasonable but should be checked against a primary
  source (Blockchair or mempool.space historical fee charts, e.g.) before
  they are treated as fixed constants a build can fail against, the way
  model-picker's own effort-position derivation fails its own build past a
  stated tolerance.
- **BitGo and Copper feed shapes** were not fetched live in this session
  (only reachability of unrelated example domains was checked); the `ready`
  dial's live-refresh path for custody data is inferred to work from
  `l1-chains.json`'s existing sourcing note, not freshly confirmed.
- **SEC EDGAR's distinction between a filed and an effective (live) ETF**
  is checkable via the EDGAR full-text search API, but "is this actually
  trading" still needs a human read of the filing; not something a refresh
  script can resolve unattended without misclassifying a lapsed or withdrawn
  filing as live.
