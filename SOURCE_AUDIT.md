# Source audit

Every claim on this site traces to something. `check-links.sh` proves a URL
returns 200. It does not prove the page still says what the sentence beside it
claims. A source can be alive and have moved underneath us, and that is the
failure mode this file exists to catch.

It happened on 2026-07-30. The Argent page called the project an unfinished
prototype, sourced to `docs.kaspa.org`, a third-party page that also still
linked a repository path that had moved. Argent's own README said the main
pieces were present and the remaining gate was an audit. Michael Sutton
corrected it publicly. Nothing was broken, nothing 404'd, and the claim was
wrong anyway.

## The rule

Cite the thing itself. A project's own README, source file, release tag or
specification outranks any page describing it, including official ecosystem
documentation, including this site.

When a description and the primary source disagree, the primary source wins and
the description gets replaced, not footnoted.

Being wrong in the conservative direction still counts as wrong. Calling a
finished thing unfinished costs the same credibility as the reverse.

## What rots, and where the truth lives

| Claim class | Primary source | Failure seen |
|---|---|---|
| Repo state, maturity, capability | that repo's README and source | Argent, above |
| Protocol constants: BPS, k, finality depth, merge depth, mass | `rusty-kaspa/consensus/core/src/config/params.rs` | numbers copied from prose |
| Emission and block reward | `consensus/src/processes/coinbase.rs`, `/info/blockreward` | monthly steps described as a halving |
| KIP status words | `kaspanet/kips` README table | spec repo lags activation by weeks |
| Convention drafts | `kaspanet/kccs` pull requests | open PR quoted as a standard |
| Live network numbers | a node, or `api.kaspa.org` | snapshot quoted as a constant |
| Other chains | that chain's own docs | written once, never rechecked |
| Kaspa history | papers, repo history, genesis proof | community lore |
| Third-party tools, commands, flags | that tool's own repo | a changed flag is worse than a dead link |
| Attribution | the durable transcript or post | secondhand relay |

## Sources that lag

`kaspa.org/developments`, `kaspa.org/build` and `kaspa.org/lore` described
Toccata as pre-activation for weeks after it activated at DAA score
474,165,565. `docs.kaspa.org` is better and still trails repositories. None of
them settle a status claim on their own.

A repository path that redirects is a signal the describing page is old.
`michaelsutton/argent` now redirects to `argent-lang/argent`.

## How to run the audit

`python3 scripts/check-source-freshness.py` lists every external URL the site
cites, grouped by page, with the sentence that cites it. Work down the list and
open the ones attached to a status, capability, version or number claim. The
script cannot read meaning, so it hands you the pairs and you do the reading.

Priority order when time is short: anything with a version number, anything with
a status word, anything describing what a project can or cannot do, then
everything else.

Fix the claim, then move `last_checked` in `CLAIMS.yml`. Never move a date
without rereading the source.
