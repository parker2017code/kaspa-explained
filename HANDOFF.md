# Handoff

State of the kaspa-explained rebuild. Written for whoever picks this up
next, including a future instance of me after a context compaction.

## What this site is

An independent Kaspa explainer at kaspaexplained.com, static HTML on
GitHub Pages, repo `parker2017code/kaspa-explained`, deployed from
`main`. Seventeen interactive demos under `demos/`, plus reading pages.

The owner's standing framing, recorded in `design/STANDARD.md`: the job
is to represent concepts visually so a reader sees a thing happen rather
than reading a claim that it happens. Learning resource first, argument
second. Where Kaspa is weak, show the weakness plainly; a demo that
flatters Kaspa is worth less than one that does not, because the reader
can tell.

## The governing documents, read these first

- `design/STANDARD.md` carries the design bar (macOS and iOS), the 300-word
  visible ceiling, and the weaknesses-are-the-material rule.
- `design/handoff-checklist.md` sets the mandatory cold read that runs
  before anything reaches the owner.
- `design/house-style.md`, `design/density-budget.md`,
  `design/interaction-standard.md`.
- `CLAIMS.yml` holds the checked claim set. Its `forbidden_copy` list
  records phrasings banned because they were wrong before.
- `data/chain-methodology-2026-08-22.md` records how the chain data was
  measured, and the standing rule about protocol constants.

## Hard rules

- Every claim needs a primary source. `kaspa.org` marketing pages are
  banned and enforced by `scripts/check-source-ban.sh`; wiki, docs and
  api subdomains are fine. Third-party explainers including `kaspa.com`
  (KaspaCom) are not accepted.
- Never present a protocol constant as a measurement. Bitcoin at exactly
  600.0s and Polkadot at exactly 6.0 were both constants posing as
  observations; both were re-derived from raw timestamps.
- Quotations must be verbatim against source. Three separate instances of
  silently smoothed quotes were found and corrected today.
- Anything invented in a demo must say it is invented. A vault holding
  10,000 KAS and a token called KAI both had to be labeled.
- `the-instrument.html` is a hosted guest piece by Moose. Never edited.
- `kaspa-x-posts-*.md` stay local and uncommitted. Now gitignored.
- Never `--no-verify`. `bash scripts/check-site.sh` must end in
  "Site checks passed."
- Subagents are Sonnet only.

## Rules leak unless mechanized

This is the most important lesson from this session. Every rule fixed by
hand came back. The kaspa.org citation ban leaked four times before
`check-source-ban.sh` existed and has not leaked since. Heading-as-link
color was fixed and returned, so `scripts/check-heading-link-color.mjs`
now renders every page in both themes and reads computed color, because
a grep cannot catch a CSS specificity fight.

When you fix a class of defect, add a gate check for it, and watch the
check fail before you trust it passing.

## Outstanding work

- Supply-split has failed the owner three times. It demonstrates nothing
  legible to him. Consider whether it should exist rather than reworking
  it a fourth time.
- A full multi-viewport verification sweep of every page: phone, tablet,
  desktop, both themes, top to bottom.
- The DAGKnight optimistic/pessimistic regime split, in flight.
- History rewrite to remove three `kaspa-x-posts-*.md` files from git
  history. Owner authorized; needs a clean tree and a force push. Full
  backup bundle and file copies are in the session scratchpad.

## What the owner rejects, learned the hard way

- Text walls. He counts "blah blah blah" out loud.
- Chrome that states the obvious. A footer saying the page is part of
  this site was noise and was removed sitewide.
- Collapsing primary content while leaving trivia visible.
- The same disclosure mechanism on every page. Vary it.
- Demos that are mechanically correct and demonstrate nothing legible.
- Being asked to catch bugs himself. Finding them is the agents' job.

## State at 23 August 2026, mid-session

Live and deploying continuously from `main`. Every commit runs the gate
via a pre-commit hook, and the gate must end in "Site checks passed."

Agents in flight, each owning disjoint files so they cannot collide:
attack-cost plus the supply-split judgment call; the four tool pages
(argent-explained, model-picker, kaspa-claims-checker, chain-comparer);
six long-form guides; six reference pages; four demos with touch and
text defects; seven short pages under the ceiling; and the glass scan on
styles.css.

### Decisions taken this session

The 300-word ceiling is hard for demos, the homepage and routing pages.
On long-form guides and reference surfaces it becomes a per-section rule
instead: no run of prose exceeds roughly 300 words without structure
breaking it up. Applying the cap literally to a 3,287-word mining guide
would hide ninety percent of it, which is the inverted disclosure the
same standard bans.

supply-split is delisted from the demos index pending a recommendation
on whether it should exist at all. It failed the owner three times. The
page still resolves directly. The index says sixteen demos.

Live pricing stays, and is now wired to Kraken's public ticker for BTC,
LTC, XMR, ETH and SOL, plus api.kaspa.org for Kaspa. Both were tested by
real browser fetch on this origin, never curl, which is how the original
bug shipped. Coinbase has no KAS pair, Binance blocks this origin, and
CoinCap's public tier failed outright. Kraken serves price but not market
cap, so some figures are a live price against a dated supply ratio and
the sourcing lines say which half is which.

One correction to the record: the false "read live" claim was blamed on
broken fallback logic. Forced-failure testing could not reproduce that.
The fallback was already honest. The real fault was CoinGecko rate
limiting under bursty traffic and returning errors with no CORS header,
which a browser reports as a bare CORS block.

supply-split is cut, not just delisted. It works and is correctly
sourced. It was cut because the subject is a static one-path fact rather
than a system with parameter space, and kips.html already teaches it in
prose with better sourcing. The file stays on disk and still resolves so
no link 404s.

### Known remaining work

Dead CSS cleanup: 34 classes and one id confirmed unused, plus 227
selectors defined in both the legacy region and the Apple layer where
the legacy one still supplies layout. Queued behind the glass scan,
because the scan establishes which rules actually render.

Verification gaps from the last full sweep: 768px was only spot checked,
light theme was only spot checked, anchor scrolling was not tested, and
contrast was not computed numerically.

The visible-word check is advisory. Flip `VISIBLE_WORDS_BLOCKING` to
true once the over-limit list is empty.

## Finish standard

Work stops when all seven are green. Not before, and not after: no
unprompted improvements past this line. Each item is a command or a
count, not an opinion, so it can be checked rather than argued.

1. `bash scripts/check-site.sh` ends in "Site checks passed." on a fresh
   clone, not just in the working tree.
2. `VISIBLE_WORDS_BLOCKING=true bash scripts/check-site.sh` passes. Every
   page is under the ceiling or carries a listed exemption in
   `scripts/essay-pages.json`. Then the variable's default flips to true.
3. The glass inventory in `_preview-site/measure.html` prints only
   sanctioned brand-gradient accents, in both themes.
4. Every page and demo renders clean at 390, 768 and 1280 in both themes:
   no horizontal scroll, no body text under 16px, no touch target under
   44px, no console errors, no text contrast under 4.5:1 computed
   numerically, and every in-page anchor lands on its target.
5. Every demo passes a cold read by an agent that built no part of it,
   with no open defect above cosmetic.
6. No `recheck_after` date in `CLAIMS.yml` has passed.
7. Tree clean, pushed, and the live domain serves the same commit hash.

At green, hand to the owner and stop. He drives, then says what is next.
