# Live sweep: kaspaexplained.com, commit cccdfba

Tested against the live production domain only, never local files. Method:
`fetch()` and DOM measurement from a same-origin browser tab against
`https://kaspaexplained.com` for anything scriptable; a localhost iframe
harness (`scratchpad/harness1.html`, served on port 8917) for width checks,
since `resize_window` is banned in this pass. Every finding below was
reproduced at least twice and checked with `location.href` in the same
evaluation as the measurement, per the method constraints in the brief.

Not exhaustive. See "Not reached" at the bottom before treating this as full
coverage.

## Severity-ranked findings

### 1. HIGH — `/model-picker` and `/chain-comparer` ship bare `<title>` tags

`document.title` on both pages omits the `| Kaspa Explained` suffix every
other real page carries.

- `/model-picker` → `"Which model should you use?"`
- `/chain-comparer` → `"Which chain fits the job?"`

Confirmed by fetching all 18 real-page URLs live and regexing `<title>`;
every other page (home included, which uses a different but complete
pattern) carries full branding. Reproduced twice, once via `document.title`
after `navigate`, once via raw `fetch()` text. This is a rebuild-day
regression, not a template gap — 16 of 18 pages have the suffix.

Fix: add `| Kaspa Explained` to the `<title>` element in both files
(likely `model-picker.html` and `chain-comparer.html` at the repo root).

### 2. Informational — earlier live-data readings were false negatives, corrected in-session

First pass used the harness's `read_network_requests` tool to check whether
`/build-on-kaspa`'s covenant panel (kascov.io), `/kips` (GitHub), and the
`/what-is-kaspa#live-network` demo (api.kaspa.org) were actually issuing
live fetches. That tool reported zero requests to any of the three origins,
which would have been a severe finding (labels claiming "read live ...
just now" backed by nothing).

Rechecked with `performance.getEntriesByType('resource')`, which is a more
reliable, standards-based enumeration of everything the page actually
fetched. All three came back positive:

- `kascov.io/data/mainnet-live.json` and `testnet-10-live.json` — status
  200, ~2.1s each, inside the `<details class="deep-dive">` on
  `/build-on-kaspa`.
- `https://raw.githubusercontent.com/kaspanet/kips/master/README.md` and
  `https://api.github.com/repos/kaspanet/kccs/pulls?state=open&per_page=30`
  — both status 200, on `/kips`.
- `api.kaspa.org/info/blockdag` and `api.kaspa.org/blocks/...` — dozens of
  successful fetches over a 10-second window on `/what-is-kaspa#live-network`,
  and the block list visibly rotated between two reads taken 10 seconds
  apart, confirming it is polling, not replaying a static snapshot.

No live-data violation found on any of the three sources actually checked.
`/status` was also checked and carries no "read live ... just now" claim
anywhere in its markup — it uses static Live/Targeted/Roadmap/Research
labels only, which the site's own glossary defines as classifications, not
live reads, so nothing there needed a live backing in the first place.

Flagging this only because the brief specifically warns about false
sitewide-breakage reports from a prior pass, and because the first tool I
reached for produced exactly that kind of false read. Recorded here so a
future pass doesn't need to redo the correction.

### 3. Unconfirmed — possible header/anchor overlap at 390px, contradicted by same-origin measurement

The 390px iframe screenshot for `/what-is-kaspa#collision-demo` appeared to
show body text rendering underneath the sticky header. Rechecked the same
anchor at the pane's native width (586px, same-origin, real DOM) with
`getBoundingClientRect()`: `headerBottom` = 61, target `rect.top` = 89, a
clean 28px gap matching the `--site-header-clearance` value nav.js computes
deliberately. No overlap at 586px.

Not reported as a confirmed bug — cross-origin iframes block DOM access, so
the 390px reading came from a screenshot taken before the harness page's
`load` event may have let `nav.js` finish computing clearance, a plausible
iframe-only timing artifact rather than a site defect. Could not be checked
directly at true 390px without a same-origin method. Flagging as unconfirmed
per the brief's rule rather than dropping it silently.

## Verified clean (would not be worth re-checking without new cause)

- **Freshness**: all 18 real pages plus `/404` (via a nonexistent URL,
  correctly returning HTTP 404) serve `styles.css?v=20260824-143221`, the
  current cache key, on a no-store fetch. No stale copies found.
- **Redirect stubs**: 14 checked (`/glossary`, `/faq`, `/overview`,
  `/about`, `/adoption-metrics`, `/ai-guidance`, `/analyze-any-coin`,
  `/application-layer`, `/build-this-now`, `/builder-evidence`,
  `/coin-atlas`, `/command-line`, `/kaspa-tps-explained`,
  `/why-are-there-so-many-coins`) — all return 200 with matching
  `<meta http-equiv="refresh">` and `<link rel="canonical">` targets, all
  landing on one of the 18 real pages, none dead-ending.
- **`/demos`**: lists all 18 demos, each linking to `page#anchor` rather
  than a standalone URL. All 18 anchor IDs verified present in their target
  page's HTML via fetch. 2 spot-checked by direct navigation
  (`/kaspa-mining#attack-cost`, `/build-on-kaspa#covenant-breaker-demo`):
  both scroll to within 90px of the top with the target in view, not
  parked at the page top.
- **Theme toggle**: click on `/status` flipped `data-theme` dark→light,
  `localStorage["kaspa-explained-theme"]` updated, `body` background
  rgb(16,14,12) → rgb(255,255,255). Reloaded the same URL: theme and
  background stayed light. Persistence confirmed.
- **Mobile nav at 390** (iframe harness, visual): Menu button opens a
  full-height panel with link list; Escape closes it and returns visible
  focus to the Menu button. Read `nav.js` source directly for the trap
  implementation (lines ~209–282): `getFocusable`, Tab-wrap on first/last
  focusable, a keydown listener added only while open, Escape handler, and
  focus restored to the trigger button on close. Implementation looks
  correct; behavior matches on the one width tested.
- **Horizontal overflow at 586px** (native, real DOM, both with and without
  `<details>` forced open): `/`, `/what-is-kaspa`, `/kaspa-mining`,
  `/build-on-kaspa`, `/model-picker` all report
  `document.documentElement.scrollWidth === window.innerWidth`, no
  page-level overflow. Two `<pre>` command blocks on `/kaspa-mining` are
  wider than the viewport (1157px, 1116px) but sit inside
  `overflow-x: auto` containers, which is the compliant pattern, not a
  defect.
- **404 page**: on-brand copy ("That page isn't in the guide"), no cringe,
  offers Search / Status / Start Here, plus two contextual "keep reading"
  cards. Passes the voice bar.
- **Light theme**: `/` at `?theme=light` renders `body` background
  rgb(255,255,255), text rgb(33,30,26). Not an afterthought at a glance;
  not checked past the homepage.

## The Apple test, page by page

Only judged where actually read (see below); not extended to pages only
touched by a fetch-and-title check.

- **`/` (homepage)**: passes. One claim, one demo path, clean 390px render
  scrolled through the hero and the blockchain-vs-blockDAG comparison. No
  cringe language observed in the sampled text.
- **`/404`**: passes, see above.
- **`/what-is-kaspa`, `/kaspa-mining`, `/build-on-kaspa`, `/kips`**: no
  disqualifying finding surfaced in the checks run (live data genuinely
  live, anchors land correctly, no overflow), but these were not read
  start-to-finish for voice or scrolled through visually at all four
  required widths, so this is not a full pass/fail call.
- **`/model-picker`, `/chain-comparer`**: would not pass as shipped. A
  bare, suffix-less browser tab title is exactly the kind of unfinished
  edge Apple's own pages never leave — every other page on the site got
  the finishing touch and these two didn't.

## Not reached

This pass did not cover, and these should not be read as clean:

- 12 of 18 real pages got no visual check at any width, in either theme:
  `/crypto-from-scratch`, `/search`, `/skeptical-case`, `/sources`,
  `/start-here`, `/status` (checked functionally, not visually),
  `/why-kaspa-matters`, `/the-instrument`, `/argent-explained`,
  `/utxo-vs-accounts`, `/kaspa-origin-story`, and `/kips` (visual only, not
  checked).
- No page was checked at all four required widths (390/768/1024/1280) with
  reliable same-origin measurement. 390 got the most attention (iframe,
  visual only); 586 (the pane's native width) got real DOM measurement;
  768/1024/1280 were not checked at all.
- Light theme was only checked on the homepage background/text color, not
  screenshotted or checked for contrast anywhere else, and not checked on
  any demo's internal color tokens (several demos, e.g. `#livenet-demo`,
  carry their own `:root[data-theme="light"]` overrides in scoped `<style>`
  blocks — none of those overrides were verified to actually apply).
- No demo control was actually dragged/clicked to confirm visible change,
  except reading the live-network block list rotate on its own. The
  GHOSTDAG playground, DAA/block-time scrubber, parameterless-consensus
  demo, fee market, node cost, emission schedule, attack cost, zk-boundary,
  argent pipeline, fair-launch, and supply-split demos were none of them
  driven by hand.
- Mobile nav was checked at one width (390, via iframe) and one interaction
  path (open, Escape-close). Tab-key traversal through the panel was not
  driven by hand; the pass relied on reading `nav.js`'s trap logic rather
  than exercising it with real Tab presses, since cross-origin iframes
  block scripted focus inspection and the real tab could not be resized to
  390 to test it directly.
- Redirect-stub sample was 14, comfortably over the 10 minimum, but that
  leaves roughly 45 of the ~59 stub files unchecked.
- Contrast was not measured numerically (no WCAG ratio computed) anywhere.
- Touch targets under 44px were not surveyed; the brief says this is
  already known and accepted, so this pass did not re-run that check.
