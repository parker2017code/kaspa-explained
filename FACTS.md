# FACTS.md: Claim verification pass, 2026-08-23

Scope note up front: this repo has 100 HTML files (50+ pages, about 20
interactive demos) and a 730-line CLAIMS.yml. This pass checked every
`recheck_after` date, ran a corrected forbidden-copy scan across all 100
files, confirmed the kaspa.org marketing-source ban is respected,
spot-verified the highest-risk numeric/status claims (Toccata DAA score,
finality/pruning depths, DAGKnight status), and ran a live primary-source
verbatim check on the KCC-0020 quote dispute, the exact class of thing
that broke silently on this site before. It did not re-check every number,
date, and quote on every page individually; see "Not checked" at the
bottom.

## WRONG

None found.

## UNSUPPORTED

None found among the claims checked.

## STALE

None found. No `recheck_after` date in CLAIMS.yml has passed. Today is
2026-08-23; the file's own `recheck_after` is 2026-08-30, and every
per-claim `recheck_after` is today or later.

## Tooling defect (affects the reliability of this whole check)

**CLAIMS.yml line 574, `kcc_conventions.forbidden_copy`, is silently broken
by unquoted YAML.** The line reads:

```yaml
      - issue #11 is still open
```

YAML treats a `#` preceded by whitespace as a comment marker even inside an
unquoted plain scalar. `yaml.safe_load` on this file parses that list entry
as the single word `issue`, with `#11 is still open` silently dropped as a
comment. Confirmed directly:

```
python3 -c "import yaml; print(yaml.safe_load(open('CLAIMS.yml'))['claims']['kcc_conventions']['forbidden_copy'])"
```
shows `'issue'` in the list, not `'issue #11 is still open'`.

If `scripts/check-status-freshness.py` does a substring match against this
list (per its own description in AGENTS.md: "fails ... when any
`forbidden_copy` phrase appears in a page's visible text"), the literal word
"issue" is currently a banned phrase. Rechecked after glossary.html,
kaspa-claims-checker.html, and kaspa-developments.html were retired to
redirect stubs: a scan of the corrected phrase against all 101 HTML files
now finds the bare word "issue" on 13 pages: status.html,
build-on-kaspa.html, about.html, chain-comparer.html, start-here.html,
toccata-explained.html, why-kaspa-matters.html, crypto-from-scratch.html,
kips.html, sources.html, design/patterns.html, demos/emission-schedule.html,
and demos/supply-split.html. kaspa-claims-checker.html and
kaspa-developments.html no longer trip it themselves; their content moved
into status.html's `#claim-fact-check` section, which does trip it. Several
of these are the pages that correctly discuss KCC issues #11 and #14. This
needs quoting (`- "issue #11 is still open"`) so the real forbidden phrase
is the intended sentence, not the bare word. Left unfixed per instructions;
flagging only.

With the phrase corrected in memory to its evident intent, a full scan of
every `forbidden_copy` entry across all 101 HTML files returned **zero
hits**. Nothing on the site currently uses a banned phrasing.

## Live primary-source verification: KCC-0020 issue #14 (kaspanet/kccs)

`github.com/kaspanet/kccs/issues/14` was loaded directly in a browser, not
curl, and read end to end, including all comments, to check the quotes on
`demos/supply-split.html`, `kips.html`, `design/patterns.html`, and
`build-on-kaspa.html` against the actual thread. Result: **holds.**

- Status: **Open** on GitHub, matching every site page's claim.
- Comment count: **4** (Manyfestation, michaelsutton, Manyfestation again,
  ShawnPearce), matching CLAIMS.yml's "now with 4 comments."
- `demos/supply-split.html` line 216 quotes Manyfestation verbatim:
  "...the combination of extended state, alongside token-specific entry
  points, allows for various use cases which are not only write-once, nor
  only for a singleton token..." An exact match to the GitHub comment,
  correctly attributed to Manyfestation, not Sutton, who quoted the same
  text back inside his own reply before adding his own point; that reply
  structure could easily get misattributed by anyone skimming the rendered
  page.
- Line 220's Sutton quote, "indeed renders the token as temporarily non
  fungible," is an exact match, word for word, including the informal
  "bcs" and lowercase "i".
- Line 224's Sutton "wrong pattern" quote uses a mid-quote ellipsis in place
  of "Ie info that is meant to testify on past events and not influence
  future fungibility." That is a legitimate elision, not a silent
  smoothing; the words on either side of the ellipsis are exact.
- Manyfestation's reply, "I agree that kind of pattern should either be
  defined in the standard or implemented in a non state storage," is an
  exact match. The site drops the trailing parenthetical "(maybe the
  payload, as you once suggested)," which does not change the meaning of
  the sentence quoted.
- `kips.html` line 212's account of ShawnPearce's August 23 comment (payload
  committed unconditionally by the v1 sighash, borrowed receive lets a
  non-owner control the payload) matches the actual comment's substance
  closely. ShawnPearce's real comment runs longer and covers additional
  ground, a live wallet payload-signing bug and a KIP-12 MUST clause, that
  the site correctly leaves out as excess detail rather than
  misrepresenting.
- Separately confirmed `github.com/kaspanet/kccs/issues/11` is **Closed**,
  matching CLAIMS.yml and the site's account.
- `status.html`'s `#claim-fact-check` section (the page that absorbed
  kaspa-claims-checker.html's tables) carries a paraphrase of this dispute
  rather than a direct quote, and the paraphrase holds: "issue #14... its
  transfer-consolidation rule and its extended-state update entrypoint
  contradict each other... Co-authors defend one pattern behind this as
  intended, a frozen or blacklist flag, but conceded a second pattern...
  is a wrong one needing a spec fix. The reporter's concern stands
  unwithdrawn, and the issue remains open." Its one direct quote, KaspaCom's
  "partially aligned, not fully conforming," is an exact substring of issue
  #11's body text on GitHub.

## kaspa.org marketing-source ban

Every `.html` file was grepped for `href="https://kaspa.org...` and
`href="https://www.kaspa.org...`. The only hits are in `sources.html` line
497, inside an HTML comment tagged kaspa-org-callout that explains these
pages are excluded, not recommended as sources, and captioned "Named here
only to explain why they are not accepted as sources." No page cites
kaspa.org marketing pages as a source for a claim.
Compliant.

## Spot-checked numeric/status constants (site-wide consistency)

- Toccata activation DAA score **474,165,565** appears identically in
  about.html, status.html (3 times), index.html, build-on-kaspa.html,
  kaspa-origin-story.html, skeptical-case.html, toccata-status.html (3
  times), what-is-kaspa.html (twice), toccata-explained.html,
  why-kaspa-matters.html (twice), kaspa-mining.html (twice), sources.html,
  demos/dag-time.html (3 times), and demos/utxo-vs-accounts.html. No
  conflicting figure found.
- Finality depth **432,000 blocks**: demos/confirmation-risk.html and
  demos/node-cost.html agree, matching the anchor fact.
- Pruning depth **1,080,000 blocks**: demos/node-cost.html (4 occurrences),
  matching the anchor fact.
- KIP-2 (DAGKnight) status: kips.html lists it **Proposed** in the table
  and again in prose ("has been Proposed for years and stays Proposed:
  internal devnet only, no testnet, no date"), and toccata-status.html
  correctly labels TN10/TN12 testing as "Testnet," not live. No page claims
  DAGKnight is running on mainnet.
- Fabricated example labeling: `demos/covenant-breaker.html`'s "This vault
  holds 10,000 KAS" example is immediately preceded by `<p
  class="fictional-note">A worked example. Nothing here is on a real
  blockchain.</p>`, correctly labeled. No "KAI" token example currently
  exists anywhere on the site; that prior defect example was not
  reproduced, either already fixed or never present in this snapshot.

## Retired pages: glossary.html, kaspa-claims-checker.html, kaspa-developments.html

All three are now `<meta http-equiv="refresh">` redirect stubs (tagged
`noindex`, canonical pointing at the merge target). glossary.html points to
what-is-kaspa.html; kaspa-claims-checker.html and kaspa-developments.html
both point to status.html. kaspa-claims-checker.html's stub text says its
four claim tables "merged into" status.html at `#claim-fact-check`, which
matches what is actually on status.html now (see the KCC-0020 paraphrase
check above). No dangling internal links to the old paths were checked for
in this pass; that would need a separate sweep of every page's nav and
in-body links.

## Flagged: an ambiguous "fetched live" claim with no fetch behind it

`skeptical-case.html`'s security-budget paragraph reads: "At $0.02934513
per KAS (CoinGecko, fetched live), that's about $58,631 a day paid to
miners." The file contains zero `fetch(` calls; grepped directly. This
number is a hardcoded, static figure, not something the page reads from
CoinGecko when a visitor loads it. The only date evidence anywhere in the
file is an invisible `<meta name="dateModified" content="2026-08-22">` in
the `<head>`; the visible prose carries no date at all next to the figure.

This appears to be inherited phrasing rather than an invented one: CLAIMS.yml's
own `fees_vs_subsidy_2026_08_22` entry uses nearly identical wording, "At
$0.02934513/KAS (CoinGecko simple price, fetched live)," to describe how
the number was originally sourced by whoever ran the analysis on August 22,
meaning fetched live at research time, not simulated or guessed. Read that
way the claim is accurate. But nothing on the rendered page tells a visitor
which reading applies, and the page sits right next to an embedded iframe
(`/demos/attack-cost`) that does perform genuine live fetches with its own
labeled fallback text, which raises the odds a reader assumes the same is
true of the number in the surrounding prose. This is exactly the failure
shape flagged as high-risk: a "live" claim next to a number that does not
move. Recommend either dropping "fetched live" for something like "CoinGecko,
read August 22, 2026" or adding a visible date so the static nature of the
figure is not implied to be dynamic.

## Could not verify: in-browser live-fetch behavior

`demos/live-network.html`, `toccata-explained.html`, `kips.html`,
`argent-explained.html`, and `demos/emission-schedule.html` all call
`fetch()` against `api.kaspa.org` and GitHub raw/API endpoints
client-side. The task requires confirming these actually perform the fetch
in a browser on the page's own origin, not via curl, since curl has no CORS
policy and that is exactly how a prior false "live" claim shipped here.

This could not be done cleanly this session. The Chrome browser instance is
shared with other concurrently running agents also editing this repo, and
every tab driven for this check, including a dedicated one on port 4215,
the port assigned for this task, got repeatedly re-navigated out from under
this session by another agent's automation, sometimes within one to two
seconds, including mid-`wait` and once mid-script during a
`javascript_tool` injection ("Inspected target navigated or closed"). One
clean load of `demos/live-network.html` did show genuine loading-state text
("Reading the first blocks…"), but a network-request read scoped to that
tab showed zero `api.kaspa.org` requests even after that load, and the tab
was lost to another agent's navigation before a longer observation window
could be attempted.

What static code review alone can confirm: the fetch calls target real
endpoints directly (`https://api.kaspa.org/info/blockdag`,
`https://api.kaspa.org/blocks/{blockId}`), not a proxy or mock, and the
page carries honest-failure language ("If the API can't be reached, this
page says so instead of faking it") rather than a hardcoded success path.
That matches the live-fetch pattern AGENTS.md documents as intentional
sitewide: stamped baseline, live fetch on load, table replaced, baseline
left standing on failure. But no clean network trace proving the fetch
actually completes and populates the page in a live browser was captured
this session, so the "live" label on these five surfaces should be treated
as unconfirmed by this pass, not as disproven.

## Not checked (scope not reached this pass)

Given the size of the site, this pass did not individually verify every
number, date, and quote on: the remaining roughly 45 non-demo pages
(kaspa-mining.html body beyond the DAA score, glossary.html,
kaspa-mining-cycle.html, kaspa-tps-explained.html,
kaspa-confirmations-finality.html, coin-atlas.html, adoption-metrics.html,
and the rest of the long tail); the roughly 15 remaining demos beyond
covenant-breaker, supply-split, live-network, node-cost, and
confirmation-risk; or chain-comparer.html's full 20-chain dataset against
each chain's own primary source. Only Kaspa's own figures were
cross-checked here; Bitcoin, Litecoin, Monero, Bitcoin Cash, and the 15
unsourced PoS/BFT chains' emission and hashrate figures in
`data/l1-chains.json` were not independently re-verified this pass. A full
sweep of those surfaces needs a follow-up pass, ideally with exclusive,
non-shared browser access so live-fetch claims can actually be confirmed
in-browser.