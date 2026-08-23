# Demos

Small interactive pages, formerly called "toys." Each is a single HTML file
with inline CSS and JS for its own controls and visuals: no build step, and
no dependency on the site's `styles.css` for those parts (each demo copies
the CSS custom properties it needs, drawn from `design/house-style.md`, so
its own controls keep rendering correctly if the main stylesheet changes).
Every demo also loads `../styles.css` and `../nav.js` and carries the site's
own header, footer, and skip link, so it reads as a page of the site rather
than a standalone artifact; a reader can navigate away and back without the
back button. A demo embedded in an iframe elsewhere on the site (the
homepage's collision simulator, for one) detects that with `window.self !==
window.top` in a pre-paint script and hides its own header and footer so the
embedding page's chrome is the only chrome shown. Open any file directly or
serve the repo locally and browse to `/demos/<file>.html`.

## attack-cost.html

Models the hourly dollar cost of mounting a 51% attack, per chain, and
expresses it as a share of the value the chain secures rather than a raw
dollar figure. Covers six chains: Bitcoin, Kaspa, Litecoin, and Monero as
proof of work; Ethereum and Solana as proof of stake. Pick a chain, toggle
rent vs. buy for PoW hash power or a target stake share for PoS, with every
input exposed as a slider.

For PoW: cost = attacker TH/s x (rental $/TH/hr, or hardware $/TH plus energy)
x hours, using per-chain hash rate, hardware efficiency, and rental-price
defaults sourced inline (CoinWarz, Hashrate Index, minerstat, NiceHash payrate
history, asicminervalue.com, Kaspalytics, 2Miners, hashrate.no, dated August
2026). For PoS: cost = circulating supply x stake share x token price x
slippage multiplier, amortized over a chosen holding period, with price and
stake-ratio defaults from CoinGecko, CoinDesk, MetaMask, and Bitget.

States its own limits plainly: rentable hash power on markets like NiceHash is
a small fraction of total network hash rate, especially for a chain Bitcoin's
size; buying a stake position at that scale does not happen at spot price,
and the slippage slider is a rough stand-in for that, not a market
simulation; and a successful attack destroys the value of whatever was used
to mount it, so the cost shown is a lower bound, not a total cost, since it
excludes the collapse in value of the attacked asset and, for PoS, the
attacker's own stake. Litecoin and Monero get a hash rate figure but no
per-unit hardware or rental price, because Litecoin's Scrypt hash rate is not
comparable to SHA-256 TH figures without unit confusion, and Monero's RandomX
has no ASIC market at all; the page says so rather than guessing a number.
All figures are stated as point-in-time estimates gathered in August 2026, not
a live feed.

## collision-sim.html

Simulates why a single chain discards competing blocks that a blockDAG keeps.
Two sliders, block rate and propagation delay, drive a live Poisson-process
block generator rendered as two side-by-side strips: a single chain (orphaned
blocks fade out, discarded) and a blockDAG (every block survives, ordered by
its parent references).

Model: p = 1 - e^(-lambda*d), where lambda is block rate and d is propagation
delay, the standard collision probability for competing blocks under a
Poisson arrival process. This is a first-principles derivation the page
states and simulates directly, not a claim sourced from an external
reference; the simulation's own measured discard rate is checked live against
this formula's predicted rate as the sliders move. Only the ratio lambda*d
matters, and the page says so; animation pacing is normalized for legibility
and does not represent real wall-clock block times.

## confirmation-risk.html

Plots double-spend reversal probability against wall-clock time, not block
count, for Bitcoin, Litecoin, and Kaspa on the same log-time axis, so "10
blocks per second" stops reading as instant settlement. Inputs: value at
stake, attacker's share of hash rate, and a risk-tolerance line; the readout
states, in plain seconds, minutes, or hours, how long each chain needs to
fall under that tolerance, or states plainly that at 50%+ attacker share no
wait is ever enough.

Model: the Nakamoto whitepaper's own gambler's-ruin double-spend formula
(Bitcoin whitepaper, section 11, 2008), a Poisson-weighted catch-up
probability, not a further approximation of it and not Grunspan and
Perez-Marco's later exact correction, which the page names but does not
implement. Verified against the whitepaper's own published table (for
example q=0.1, z=5 gives P=0.0009137 in both). The Poisson term is computed
in log space via a Lanczos log-gamma so it stays numerically stable out to
the tens of thousands of blocks Kaspa accumulates within an hour.

States plainly that the Kaspa curve is an approximation, not a derivation
from GHOSTDAG: a single-chain race model is fed Kaspa's block interval,
because production confirmation depth is actually measured in blue work
across a DAG, not a block tally. The page names two ways this could be wrong
in opposite directions: it likely undercredits GHOSTDAG's orphan-avoidance on
the honest side, and may overstate how cleanly a fixed depth captures the
anticone-tolerance flexibility GHOSTDAG gives an attacker over very recent
ordering, rather than picking one direction and calling the curve exact.
Finality depth (12 hours, 432,000 blocks at 10 BPS, from this site's own
chain-comparer data) is discussed as a separate, fixed protocol parameter and
is deliberately not plotted on the risk curve.

## covenant-breaker.html

A vault covenant with real rules (owner-signed withdrawals, a 500 KAS
per-transaction cap, a fixed payout address, a 36,000 DAA-score delay since
the covenant's last spend, and a fixed-destination recovery path), shown
alongside a Silverscript-style pseudocode listing. Compose spends against it:
drain it in one shot, skip the delay, redirect the output, or redirect a
recovery, and each is rejected with the specific input rule, output rule, or
continuation-state check that failed.

One attack succeeds on purpose: repeated cap-and-delay-respecting withdrawals
drain the vault to zero over time, because the cap bounds a single
transaction and nothing in the covenant tracks a running total or limits how
many times `withdraw()` can be called. That is the honest limit the demo
exists to teach: a covenant is a predicate on the spending transaction, not a
policy over the account's future.

Introspection opcodes are named against what
[KIP-17](https://github.com/kaspanet/kips/blob/master/kip-0017.md) actually
defines (`OpTxOutputAmount`, `OpTxOutputSpk`, `OpTxInputDaaScore`,
`OpTxLockTime`); continuation identity is modeled on
[KIP-20](https://github.com/kaspanet/kips/blob/master/kip-0020.md)'s covenant
ID and genesis-hash anti-forgery mechanism. Pseudocode follows the
state/actor/entry/require/become shape from `argent-explained.html`'s worked
example, for consistency with the rest of the site. No network requests; all
arithmetic runs client-side against a small simulated vault state.

## emission-schedule.html

Shows Kaspa's emission reward stepping down by about 5.61% (a factor of
2^(-1/12)) every 2,629,800 seconds, 426 times total, hard-coded in consensus,
against a scrub slider that makes the point that there is no cliff: every
step is the same small size as the one before it, keyed to DAA score rather
than the calendar.

Formula: reward(n) = 23.12465141 x 2^(-n/12) KAS/sec, where n = 0 is the step
beginning at DAA score 504,909,000; DAA(n) = 504,909,000 + n x 26,298,000 in
the 10 BPS era (the pre-Crescendo table used 2,629,800 DAA per step at 1
BPS). Verified against `SUBSIDY_BY_MONTH_TABLE` (426 entries) and
`SECONDS_PER_MONTH = 2,629,800` in rusty-kaspa's
`consensus/src/processes/coinbase.rs`.

States that the calendar-date estimate uses a nominal 2,629,800-second month
that consensus assumes, and actual calendar dates drift with how fast blocks
actually land, since the trigger is DAA score, not wall-clock time. Notably,
this demo makes a live request to `api.kaspa.org` for the current DAA score
and reward, with a stated offline fallback reading; this is the one demo on
this list that is not fully offline, unlike the "no network requests"
convention the rest of this directory follows (see the accessibility and
factual issues note below).

## fair-launch.html

Plots the share of supply held by founders, a company, or a foundation, not
yet public, over the years since genesis, for four chains: Kaspa (fair
launch), Ethereum (ICO with a founder and foundation premine), Cardano
(foundation allocation), and XRP (100% company premine, no public sale at
genesis). A year slider drives a table showing exactly who held what at that
point.

Kaspa's fair-launch claim was verified directly against rusty-kaspa's
`consensus/core/src/config/genesis.rs`: the mainnet genesis block has an
empty UTXO set, a timestamp of 1637609671037 ms (23 November 2021), and
checkpoint DAA score 1312860, no allocation to any party, ever.
Genesis-point figures for the other three chains are sourced and marked
verified in the page: Ethereum's 2014 crowdsale raised 60,102,216 ETH from
public buyers against a 72M ETH genesis supply, with the remaining 12M
(16.7%) split evenly between founders and early contributors and the
Ethereum Foundation; Cardano's own genesis page lists IOHK at 5.50%, Emurgo
at 4.60%, and the Cardano Foundation at 1.42% of the 45B ADA max supply, with
57.62% sold in the public ICO; XRP's 100B genesis supply went 80B to Ripple
Labs and 20B to its three founders, with zero held by the public at genesis.

States plainly that the curves connecting genesis to today are a modeled
exponential decay anchored to an estimated current concentration, not a
measured yearly series, and that segments beyond each chain's actual current
age are drawn dashed as projections. Also states that a premine is not
automatically dishonest (Ethereum's and Cardano's allocations were disclosed,
not hidden) and that no premine does not mean no early concentration: Kaspa's
earliest blocks were still mined disproportionately by whoever had
ASIC-class hardware and network access first.

## ghostdag-playground.html

Lets a reader build a small DAG by hand and watch GHOSTDAG's own ordering
rule run on it. Mine a block and it joins with a small anticone, because
everyone already saw its parents; run a hidden miner in secret and release
its blocks later, and they surface with a wide anticone, because they
reference an outdated view. A k slider caps how many blue blocks may sit in
any blue block's anticone; inside the cap, a block is blue, outside, red.
Each block also picks the parent carrying the most blue work as its selected
parent, chaining into a spine; walking that spine and folding in each merge
set blue-before-red resolves the whole DAG into one linear order. Hovering or
focusing a block highlights its past, future, and anticone.

This demo implements the GHOSTDAG blue/red anticone-cap classification and
selected-parent spine-walk directly, as a hands-on simulator of the
protocol's own ordering mechanism, rather than citing an external numeric
claim that needs a separate source. It does not model network propagation
delay or an actual attacker strategy; the hidden-miner control is a manual
stand-in for a withheld branch, not a simulated adversary.

## mass-calculator.html

Answers "what's Kaspa's TPS" by showing that a transaction is charged on
whichever of three independent dimensions is largest, compute, storage, and
transient (proof-sized data), never their sum, each checked against its own
per-block limit at 10 blocks per second. Build a transaction with sliders for
inputs, outputs, amount, and payload/proof bytes, plus a script-type choice,
and see which dimension binds and what that does to throughput.

Formulas (transaction size, compute mass, transient mass, and storage mass
per KIP-0009) are reproduced in full in the page's own details block, verified
against rusty-kaspa's `consensus/core/src/mass/mod.rs`, `config/params.rs`,
and `constants.rs`.

States plainly that it models a standard Schnorr P2PK-style input/output
shape and assumes value is conserved with no fee, and that real network TPS
is lower once relay policy, fee markets, and mempool behavior are added on
top of this pure mass-ceiling calculation. Offline, no network requests.

## node-cost.html

Compares node storage across twenty chains on a log scale (Kaspa about 50 GB,
Bitcoin 758 GB, Ethereum 2 TB, Solana 2.5 TB, Internet Computer 32 TB, and
others), then plots pruned vs. unpruned storage growth over time, with a
finality-depth callout: once a Kaspa block sits 432,000 blocks deep (12 hours
at 10 BPS), nodes refuse any reorganization that would rewrite it, which is
what makes discarding the data behind it safe rather than merely convenient.

Node disk figures for all twenty chains come from this site's own
`data/l1-chains.json` dataset, captured 2026-08-01. Finality depth cites the
same dataset's stated distinction between Kaspa's practical 10-second
settlement convention and its actual 12-hour/432,000-block consensus finality
boundary, backed by `kaspa.com/finality-depth` and `kaspa.com/pruning-depth`.

States explicitly, and labels on-chart, that no published Kaspa
archival-node size exists to plot: the unpruned growth line is drawn
schematically, with a reader-adjustable exponent, to show the shape of
unbounded growth, not a measured rate, and the page calls this "illustrative"
rather than presenting it with the same confidence as the sourced, real
pruned-node figure.

## parameterless.html

Makes "parameterless consensus" picturable. GHOSTDAG derives its security
parameter k from an upper bound on network latency set at configuration time
plus the block rate; DAGKnight (KIP-2, status: Proposed) instead derives k
from an assumed worst-case latency bound at every point, adapting as
conditions change. Set the assumed bound D with one slider, then push actual
latency past it with a second slider or scenario buttons: the fixed side
breaks once actual latency exceeds D, because anticones outgrow the
configured cap and read as attacks; the adaptive side only slows.

The k(D, lambda) derivation reproduces rusty-kaspa's own formula exactly,
from `consensus/core/src/config/bps.rs` and `constants.rs`
(`NETWORK_DELAY_BOUND = 5s`, `GHOSTDAG_TAIL_DELTA = 0.01`), verified against
the compiled table in `bps.rs` at every checked point (1 bps gives k=18, 2
gives 31, 5 gives 67, 10 gives 124); the page fixes lambda at 10 (current
mainnet) and lets only D and actual latency move.

States plainly that the "DAGKnight" side is a simplified, labeled model of
the paper's qualitative relationship, not a simulation of its real
k-cluster selection algorithm or confirmation-time formula, and that
DAGKnight is not shipped (KIP-2 status: Proposed; the rusty-kaspa dagknight
branch has been dormant since March 22, 2026), is not actually
parameter-free (the paper still requires a client-set worst-case latency
bound, Pass-Shi Theorem 14), and that KIP-2 itself calls its own pseudocode
"highly inefficient," with no established cost comparison against
GHOSTDAG's table lookup. Sources: Sompolinsky and Sutton, "The DAG KNIGHT
Protocol," IACR ePrint 2022/1494; KIP-2; rusty-kaspa's `bps.rs`, `params.rs`,
`constants.rs`.

## shared-state.html

Dramatizes "the shared-state gap": what Toccata already gives you (Argent's
Inter-Covenant Communication composes separately compiled covenant apps
atomically today, so far only in unaudited offline demos) versus the case
vProgs and KIP-21 target instead, many users changing one app's state at
once. Three tabs: an auction whose high bid lives in a UTXO (two users race
to spend the same outpoint; one confirms, the other's outpoint is gone and
must rebuild and retry), the same auction as a slot in a global account VM
(both writes land, in order, no retry, but every full node re-executes both
writes forever), and what KIP-21's partitioned lanes change (a prover for one
app's lane follows only that lane, not the whole DAG).

Block-admission numbers (50 non-coinbase lanes per block, 1,000,000,000 gas
per lane) are verified against Section 2.2 of `kip-0021.md` in
`kaspanet/kips`; the lane-tip commitment mechanism is verified against the
same KIP's abstract and mental-model section. The vProgs description (state
split into named resources, each keyed by a transaction's declared read and
write list) is verified against the `kaspanet/vprogs` README's layered
architecture (core, state, scheduling layers) rather than assumed.

The Inter-Covenant Communication claim, and its "unaudited offline demos
only" status, matches `argent-explained.html`'s existing description and
`toccata-explained.html`'s line distinguishing cross-app composition (works
now) from shared mutable state (what vProgs adds); this demo does not change
that boundary, it dramatizes it. No network requests; all figures are static.

## supply-split.html

Delisted from `demos/index.html` and `site-manifest.json` as of 23 August
2026: the subject is a static one-path logical fact rather than a system
with parameter space to explore, and `kips.html` teaches the same fact in
prose with better sourcing. The file stays on disk and still resolves
directly, so existing links still resolve. Nothing on the site links to
it and it does not count toward the site's demo total.

Shows KCC-0020's permanent supply split live: a token's UTXO set as cells
held by four holders, distinguished by glyph and border pattern, never color
alone. Issuing, transferring, and consolidating cells work freely until an
extended-state update runs; only holders who check "authorizes" have their
cells move to a new commitment, and consolidating across commitment groups is
refused with the specific reason (`extension_commitment` mismatch). A preset
loads Michael Sutton's own frozen-flag stablecoin example from the spec's
issue thread.

Verified directly against `kcc-0020.md` (Section 2's consolidation rule,
Section 4's update entrypoint) and the full comment thread on
`github.com/kaspanet/kccs/issues/14`, fetched via the GitHub API rather than
the rendered page (the rendered issue page did not surface its own comments
on fetch). Quotes from Sivan Helfer and Michael Sutton, KCC-0020 co-authors,
are shown with attribution.

States plainly that KCC-0020 is still a draft (no spec change merged as of
this writing) and that the split shown is a live, open design tradeoff, not a
resolved bug: both co-authors call the fragmentation intended behavior for a
token like a stablecoin with a freeze flag, not a defect awaiting a fix.

## zk-boundary.html

A ZK proof proves a computation was carried out correctly over its chosen
inputs; it does not prove those inputs are true. Pick a claim someone is
asking you to trust, then try to give it a trust anchor for the part a proof
cannot touch. If there isn't a real one to pick, the demo refuses, and states
exactly what is missing.

Kaspa's Toccata hard fork activated KIP-16, which adds an `OpZkPrecompile`
opcode so a script can check a proof from a chosen proof system, initially
Groth16 and RISC0-Succinct. The opcode checks that a proof verifies against a
given verifying key and public inputs; it says nothing about where those
public inputs came from. Sourced against
[KIP-16](https://github.com/kaspanet/kips/blob/master/kip-0016.md), the
rusty-kaspa Toccata node setup guide, and this site's own
`toccata-explained.html`, which states the same boundary in prose: "ZK does
not prove prices, bridge truth, or real-world events on its own. Outside
facts need an anchor: a light client, a finality certificate, an oracle, or a
challenge process."

States plainly that the four claims presented are illustrative, not
Kaspa-specific protocols; only the rollup-batch case is built to work end to
end, since proving a batch of transactions executed correctly against a
known, agreed-upon prior state is exactly the kind of statement a SNARK or
STARK settles.

## Building a new demo

The house style is documented in full at `design/house-style.md`: palette
tokens for both themes, the type scale, the five-step radius system, card and
table and button treatment, the focus-visible ring, and the `data-theme` plus
`localStorage["kaspa-explained-theme"]` toggle mechanism every page on the
site actually uses (not a `prefers-color-scheme` media query). Copy the
token block and toggle script from an existing demo or from
`design/page-template.html` rather than re-deriving them from `styles.css`
directly, since `styles.css` still carries an older, superseded token
generation above the block that currently renders. Keep everything in one
file, avoid external requests and charting libraries, and respect
`prefers-reduced-motion` for anything that animates.
