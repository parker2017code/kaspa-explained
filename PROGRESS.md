# Progress to handoff

Definition of done: gate green on a clean clone, everything committed, site plus demos
readable locally. Deploy is the owner's call and is NOT part of this.

## Done

- Accuracy pass, all 25 live pages. Two fabricated claims removed, two upstream issues
  filed at kaspamedia/kaspa-org (#22, #23), every live figure re-read.
- Two issues filed upstream against kaspa.org's source repo, both open:
  https://github.com/kaspamedia/kaspa-org/issues/22 (Toccata described as pre-mainnet
  on /developments and /build) and https://github.com/kaspamedia/kaspa-org/issues/23
  (same error on /lore and two further /build entries). Filed by parker2017code.
  Recorded here because a red team could not find them and searched the wrong org.
- kaspa.org purged as a source. Now enforced by scripts/check-source-ban.sh with an
  explicit call-out marker for legitimate quotation.
- 47 redirect stubs audited. Five double redirects fixed. Now enforced by
  scripts/check-redirect-stubs.sh.
- Machine surfaces rebuilt: llms.txt, README.md, CONTENT_BRIEF.md all described a site
  that did not exist.
- 13 demos built, each verified against primary sources by its author.
- design/: house-style.md, patterns.html, page-template.html, density-budget.md,
  interaction-standard.md, css-audit pending.
- PLAN-REDESIGN.md: target sitemap, kill list, hook-per-page table.
- Gates added: source-ban (blocking), density (advisory), redirect-stubs (blocking).
- Prose standard folded into check-prose.py.

## In flight

- 13 demos: rendered verification sweep, interaction/malleability fixes.
- 21 pages: density compression across 3 batched agents.
- chain-comparer: TON scoring bug, fast/settle dial merge, fee dial decision.
- Demos wired into pages, sitemap, manifest, llms.txt.
- CSS audit: ~6,300 lines of overridden legacy CSS still shipping.
- kaspa-timeline demo: needs rebuild, agent stalled.

## Blocking handoff

1. All in-flight agents land.
2. Full gate green.
3. Clean-clone gate green. This is the one that has lied before.
4. Single commit, nothing partial.

## Not doing without the owner

- Deploy.
- Deleting the legacy CSS layer.
- The page merges in PLAN-REDESIGN.md, which cut 25 pages to 11 core plus 5 reference.

## Design standard

The bar for this site is macOS and iOS. Not "modern," not "clean," Apple
specifically. Read design/STANDARD.md before writing any markup or CSS, and
design/handoff-checklist.md before reporting anything as done. Both govern
every page and every demo. Correct but unusable is a failure here.
