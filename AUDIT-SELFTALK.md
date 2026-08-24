# LLM self-talk audit, read-only pages

Scope: every page not in the owned-for-edit list (`sources.html`,
`skeptical-case.html`, `search.html`, `404.html`, `demos/index.html`,
`llms.txt`, `design/patterns.html`, `design/page-template.html`) and not
touchable under the hard constraints. Read-only. No edits made here.

## Method

Read each page end to end at reading speed for cumulative impression first,
then grepped for the starting tell list plus its natural extensions, then
checked every hit's surrounding sentence for false positives (domain terms
like "leverage" as a financial term or "unlock" in vesting/covenant contexts
are not the hype-verb tell).

## What extended the tell list

The single biggest false-positive risk on this repo is domain vocabulary that
overlaps banned hype words by coincidence: "leverage" (margin trading),
"unlock overhang" (token vesting), "unlocking script" (a real Kaspa/Bitcoin
UTXO term). A banned-word grep against this site will always need a human
pass over each hit's sentence, because the corpus is financial and technical
and legitimately uses several of the words the tell list flags. None of the
hits found here were actual cringe; all were domain-correct usage.

Two things worth adding to the tell list beyond the brief's starting set.
Reading end to end surfaced both; grepping would have missed them.

- **Uniform section-answer cadence** is a tell distinct from any single
  phrase: a page where every card, every table row, and every collapsible
  opens with the identical "verdict sentence, then justification" shape,
  with no variation in where the caveat lands or how the sentence is built,
  reads assembled even when no sentence is individually bad. `AGENTS.md`'s
  own "Variance targets" section already names this exact failure mode
  (perfect uniformity of a correct pattern) as the site's second-order tell,
  and it is the more useful lens than the word list for a page like this
  one, where the content is short, factual, and link-dense.
- **Self-describing internal documentation leaking structure-narration onto
  a page a reader actually visits** is a distinct risk on a site with an
  internal design/ directory: `design/patterns.html` and
  `design/page-template.html` are internal (noindex/nofollow) and are
  allowed to describe their own components ("For / Not for / Accessibility"
  per pattern) because that is their actual job as a pattern library, not
  self-talk. The tell would be that register showing up on a page readers
  land on; it does not here.

## Findings by page

**Real content pages, all in the do-not-touch list, read but not edited**
(`index.html`, `what-is-kaspa.html`, `why-kaspa-matters.html`,
`crypto-from-scratch.html`, `chain-comparer.html`, `model-picker.html`,
`kaspa-origin-story.html`, `argent-explained.html`, `build-on-kaspa.html`,
`status.html`, `kaspa-mining.html`, `kips.html`, `start-here.html`,
`utxo-vs-accounts.html`, `the-instrument.html`): no self-talk found. Every
page grepped clean against the extended tell list. The handful of raw hits
(`leverage` x4, `unlock`/`Unlock` x2, `overall` x3) were domain-correct
financial or covenant terms, or JS code comments. None was visible hype language.
Cumulative-impression read: these pages carry the site's real signature,
numbers with sources, status labels used once and moved past, short
sentences after long ones, sections that end without a caveat. They read as
written by someone who checked the primary source and would tell you if the
numbers didn't add up. This is the site's strongest surface. None of them
read as machine-assembled.

**Redirect stubs (53 files in the repo root, 17 under `demos/`)**: every one
of these is 13-15 lines, `noindex`, a `meta http-equiv="refresh"`, and one
plain sentence of body text pointing at the page's real home (for example
`about.html`: "The disclosure and editorial policy now run in the site
footer and on kaspaexplained.com/status."). No prose to audit, no tell risk.
Full list: `about.html`, `adoption-metrics.html`, `ai-guidance.html`,
`analyze-any-coin.html`, `application-layer.html`, `build-this-now.html`,
`builder-evidence.html`, `builder-fit-survey.html`, `builder-guide.html`,
`claims-reference.html`, `coin-atlas.html`, `command-line.html`,
`crypto-from-zero.html`, `crypto-history.html`, `faq.html`,
`ghostdag-explained.html`, `glossary.html`, `investor-supporter-survey.html`,
`kaspa-app-ideas.html`, `kaspa-claims-checker.html`,
`kaspa-confirmations-finality.html`, `kaspa-coordination-markets.html`,
`kaspa-covenants-explained.html`, `kaspa-developments.html`,
`kaspa-for-fintech-founders.html`, `kaspa-founder-investor-matching.html`,
`kaspa-hackathon-challenges.html`, `kaspa-in-one-screen.html`,
`kaspa-mining-cycle-visuals.html`, `kaspa-mining-cycle.html`,
`kaspa-smart-contracts-status.html`, `kaspa-status-check-may-2026.html`,
`kaspa-status-updates.html`, `kaspa-toccata-use-cases.html`,
`kaspa-tps-explained.html`, `kaspa-vprogs-explained.html`,
`kaspa-vs-ethereum-apps.html`, `kaspa-vs-solana-builders.html`,
`knowledge-map.html`, `overview.html`, `reality-check.html`,
`solo-mining-guide.html`, `toccata-essay.html`, `toccata-explained.html`,
`toccata-expressiveness-upgrade.html`,
`toccata-expressiveness-upgrade-part-2.html`,
`toccata-expressiveness-upgrade-part-3.html`, `toccata-status.html`,
`tradeoff-map.html`, `what-crypto-is-good-for.html`,
`what-still-has-to-be-built.html`, `where-kaspa-fits.html`,
`why-are-there-so-many-coins.html`, `why-crypto-has-value.html`, plus all 17
`demos/<name>.html` stubs.

## Bottom line

No page in the read-only scope needs a self-talk fix. The pages doing real
work are already the site's cleanest writing; the rest is stub plumbing with
one sentence each. The two variance items above are the useful output of
this pass, worth applying to whichever pages a later editing round touches.
This scope itself has no defect list.
