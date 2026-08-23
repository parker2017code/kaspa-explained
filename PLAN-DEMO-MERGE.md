# Demo merge plan

The owner's instruction: "Some demos have their own page. That shouldn't
be the case. It should be a page with a demo."

Today every demo exists twice, as a standalone page under `demos/` and
again embedded on a topic page. The target is one thing per concept: a
page about the concept with the demo in it, no separate demo URL, and
`demos/` as a component library rather than a set of destinations.

## Ground truth, checked against the tree

Two premises in the original brief were wrong:

- `collision-sim` is not a card. It is the featured hero embed at the top
  of `demos/index.html`, duplicated as the hero on `index.html`.
- `supply-split` was not cut from the index. It is the seventeenth and
  last card, with a live link.

17 cards plus 1 hero is 18 demos, matching the file count.

All 18 are already embedded on at least one topic page. Six are embedded
on more than one, which is the duplication this merge has to resolve
rather than carry forward:

| Demo | Embedded on |
|---|---|
| attack-cost | kaspa-mining, skeptical-case |
| confirmation-risk | why-kaspa-matters, what-is-kaspa |
| covenant-breaker | build-on-kaspa, toccata-explained |
| fair-launch | crypto-from-scratch, kaspa-origin-story |
| shared-state | argent-explained, utxo-vs-accounts, toccata-explained |
| utxo-vs-accounts | utxo-vs-accounts, start-here |

## The mapping

Where a demo has two hosts, one gets the embed and the other gets a text
link. Duplicating an embed is the problem, not the solution.

| Demo | Target | Note |
|---|---|---|
| argent-pipeline | argent-explained | Single host |
| attack-cost | kaspa-mining | skeptical-case keeps a link |
| collision-sim | what-is-kaspa | Anchored to the blockDAG explanation |
| confirmation-risk | why-kaspa-matters | what-is-kaspa keeps a link |
| covenant-breaker | build-on-kaspa | toccata-explained keeps a link |
| dag-time | kaspa-origin-story | Single host |
| emission-schedule | kaspa-mining | Single host |
| fair-launch | kaspa-origin-story | crypto-from-scratch keeps a link |
| fee-market | kaspa-mining | Single host |
| ghostdag-playground | what-is-kaspa | Single host |
| live-network | what-is-kaspa | Single host |
| mass-calculator | what-is-kaspa | Cross-links become anchors |
| node-cost | kaspa-mining | Single host |
| parameterless | kips | status keeps a link |
| shared-state | utxo-vs-accounts | argent-explained and toccata-explained keep links |
| supply-split | kips | Supporting evidence, lands closed |
| utxo-vs-accounts | utxo-vs-accounts | Closes a redundant loop |
| zk-boundary | toccata-explained | Single host |

No demo is homeless. The real finding is the opposite: `shared-state`
genuinely illustrates three different arguments, and picking one home
costs two legitimate embeds. That trade is made explicitly here rather
than pretended away.

Pages absorbing more than one: kaspa-mining takes four, what-is-kaspa
takes four counting links, kips takes two, toccata-explained takes one
embed and two links.

## URLs

All 18 demo URLs stop being destinations and need stubs pointing at the
target page's anchor. Pay the cost: `llms.txt` carries 21 references and
`agent-index.json` carries 61, both describing demos as citable
resources, and breaking those is an open-ended regression against a
bounded one-time cost.

Two gate problems to fix before any stub is trusted:

1. `scripts/check-redirect-stubs.sh` globs `*.html` at the root only. It
   does not scan `demos/`, so 18 new stubs there would go unvalidated.
   That is a silent gap, not a free pass.
2. Its target resolution maps a refresh target to a whole page and does
   not understand anchors. A stub pointing at `/kaspa-mining#attack-cost`
   needs the anchor stripped for the existence check.

One exception to the pattern: `demos/utxo-vs-accounts.html` redirects to
`/utxo-vs-accounts` with no anchor, because the demo becomes the whole
page rather than a section of it.

## demos/index.html

Recommendation: repurpose, do not delete. Keep the page and change every
card's destination from `/demos/x` to the target page's anchor, turning
it from eighteen destinations into one map of where every demo lives.

The reason is concrete. An agent has already re-ordered the 17 cards by
importance, and that work is on disk uncommitted. Deleting the page
discards it. If the executing agent decides to delete anyway, that has to
be a stated decision rather than a side effect.

Either way the hero embed and the "Eighteen demos to push on instead of
read" copy need rewriting, since it is no longer eighteen destinations.

## The embed mechanism does not survive

Today each demo sets `data-embedded` pre-paint when `window.self !==
window.top`, and its own CSS hides the header, footer, and skip link off
that. `?preview=1` sets `data-preview` for the card thumbnails.

That entire mechanism exists to make a demo usable both standalone and
embedded. Once a demo is never standalone, the pre-paint script, the
`[data-embedded]` CSS, the theme sync, the resize observer, and the
preview branch are all dead code solving a problem that no longer
exists. Convert each demo to inline markup and script on its host page.

The cost is real and per-demo: element IDs have to stop colliding with
the host page and with other demos on it, which matters most on
kaspa-mining with four; each demo's `<style>` block needs a home and its
specificity collisions with `styles.css` resolved; each `<script>` needs
to not collide in global scope.

The payoff is weight. `demos/index.html` is roughly 3.2 MB across 77
requests because it iframes 17 full pages, each reloading the whole
site's chrome so a widget can render. Inlining removes that entirely.

## Order of operations

Shared files every merge touches: `site-manifest.json`, `sitemap.xml`,
`llms.txt`, `agent-index.json`, `styles.css`, `scripts/essay-pages.json`,
and `scripts/check-redirect-stubs.sh`.

Because every merge writes the same handful of files, per-demo merges are
not safely parallel. This repo has lost work to exactly that shape four
times.

1. Fix the redirect-stub gate's scope and anchor handling first.
2. Merge content in parallel, grouped BY TARGET PAGE, not by demo. One
   agent owns kaspa-mining and all four of its demos. Each agent touches
   only its own topic page and its own stub files.
3. One agent updates all the shared machine-readable files once, at the
   end, from the final list of what moved where.
4. `demos/index.html` last, by one agent, since it depends on knowing
   every final redirect target and already holds uncommitted work.

## What breaks, measured

- `sitemap.xml`: 19 lines reference `demos/`
- `site-manifest.json`: 38 lines
- `llms.txt`: 21 references
- `agent-index.json`: 61 references
- `search.html`: no per-demo references; its index is built at runtime
- `CLAIMS.yml`: no demo path citations
- Nav and footer: `/demos` appears twice per page across ~26 pages, and
  is unaffected unless `/demos` itself is deleted
- 14 content pages carry 38 individual `/demos/<name>` occurrences as
  iframe sources or links

## The risk worth flagging

Inlining breaks the word ceiling, and prose has nothing to do with it.

A demo's markup lives inside an iframe today, so its words never count
against the host page's budget. That is why `utxo-vs-accounts.html` can
carry two full embeds. The moment a demo becomes inline markup, every
word inside it counts for real.

`utxo-vs-accounts.html` is already at roughly 376 words against a hard
300 ceiling, and is not on the per-section exemption list. The demo it
would absorb is another ~371 words of markup. This is the page the owner
named as the clearest case, which makes it the one most likely to be
merged first and fastest.

Decide the fix before the merge lands, not after a failing gate: land the
demo closed, trim the demo's own copy during inlining, or move the page
onto the per-section list. Pages already on that list have real headroom
and are the safe absorbers.

## Open or closed, per merge

Closed, because the demo is supporting evidence for an argument the prose
already makes: all four on kaspa-mining, both on kips, zk-boundary on
toccata-explained, confirmation-risk on why-kaspa-matters, attack-cost on
skeptical-case.

Open, because the demo is the page's point rather than an illustration of
it: both on utxo-vs-accounts, ghostdag-playground and collision-sim on
what-is-kaspa, argent-pipeline on argent-explained.
