# Adversarial pass 2 — findings

Tested against `http://localhost:4330` (local `scripts/serve-local.py` server
started for this pass; port 4330, no conflict with 4187). All testing was
driven by hand, one JS evaluation at a time, with `location.href` captured in
the same evaluation as every measurement reported below. No files were
edited. This file is the only write made.

**Environment note, not a site defect:** the shared browser instance used for
this pass had other concurrent processes actively navigating tabs during
testing. On at least four occasions a tab I was driving was silently
re-navigated to an unrelated page (`utxo-vs-accounts.html`,
`kaspa-mining.html#emission-schedule`, `about.html`'s redirect target)
between one tool call and the next, caught only because `location.href` was
checked before trusting any read. Every finding below was re-verified on a
tab whose `href` matched the page under test at the moment of measurement.
Two stray tabs were closed to regain a stable tab; nothing else about the
browser or repo was touched.

## 1. Wrong number: account balance goes negative on utxo-vs-accounts.html

**Page:** `http://localhost:4330/utxo-vs-accounts.html`, `#shared-state`
account-model demo (buttons `uva-moveLittle`, `uva-moveLot`,
`uva-moveCombine`, `uva-moveSplit`, balance display `uva-acctNum`).

**Steps:** From a fresh load, click all four move buttons in the sequence
Little → Lot → Combine → Split, repeated 15 times back to back (60 clicks,
skipping any button already `disabled` at click time). Then read
`uva-acctNum` immediately, and again after a 5-second pause with no further
input.

**Expected:** account balance floors at 0 and stays there; once at the
floor, any button whose cost the balance can't cover stays disabled.

**Actual:** immediately after the click loop, `uva-acctNum` reads `0`
(correct). With no further interaction, 5 seconds later it reads `-7,500`,
and `uva-moveCombine` / `uva-moveSplit` remain `disabled: false` at that
point — the balance drifted negative asynchronously after the interaction
stopped, and the two buttons that should have locked out once the balance
was floored did not. Read separately: `uva-moveLittle` and `uva-moveLot` did
correctly end up `disabled: true`.

**Reproduced 3 times, all matching:**
- `http://localhost:4330/utxo-vs-accounts.html`, width 390, theme dark
  (`getComputedStyle(document.body).backgroundColor` = `rgb(16, 14, 12)`):
  `-7,500`.
- Same page/steps repeated on reload: immediate read `0`, wait-then-read
  `-7,500` again.
- `http://localhost:4330/utxo-vs-accounts.html`, width 1280, theme light
  (bg = `rgb(255, 255, 255)`, confirmed switched via `localStorage` +
  reload): immediate read `0`, wait-then-read `-7,500`.

Not width- or theme-dependent. Looks like queued/animated debits continue to
apply after the click loop ends, computed against a balance figure that was
already stale by the time each queued debit lands, so the running total
walks past zero instead of clamping there.

## 2. Stuck state: live-network demo keeps asserting "right now" during a confirmed outage

**Page:** `http://localhost:4330/what-is-kaspa.html`, `#live-network` demo.

**Steps:** Load the page, let the first live fetch to `api.kaspa.org`
succeed normally. Patch `window.fetch` to reject any request whose URL
contains `kaspa.org`. Wait 10+ seconds (the widget's own stated refresh
interval is 9s) and read the widget's state twice, 10 seconds apart, with no
further interaction between reads.

**What's right:** the widget does show an honest, visible failure banner:
`ln-failBanner` becomes `display: block` with the text "Can't reach the
public network right now. Retrying every 9 seconds. The explanation below
still applies; nothing on this page is invented while it waits." The
`ln-statusLine` also updates to "Can't reach the public API right now."
This is the correct behavior and is not a defect.

**What's wrong:** directly below that banner, `ln-tipCount` (`13`) and
`ln-tipLabel` ("blocks racing for the same spot right now") keep asserting
present-tense, "right now" language, and the feed's top row keeps reading
"Empty block · 9s ago · ...". Read twice, 10 seconds apart, with the fetch
still confirmed patched (`window.fetch !== window.__origFetch`) both times:
the feed row's timestamp stayed `9s ago` word-for-word both times, i.e. it
does not tick forward while the network is down, and the "13 blocks ...
right now" line never changes to reflect that the number is no longer live.
Two visibly different claims about data currency now sit on the same
screen: the banner says the network is unreachable, and the metric one line
below still reads as a live, current claim.

- `http://localhost:4330/what-is-kaspa.html`, width 1280 (default at time of
  test), theme dark. First read after patch + 10s wait: `tipCount: "13"`,
  `sampleLine feed row: "Empty block9s ago..."`. Second read, 10s later, no
  interaction in between: identical `9s ago`, fetch still confirmed patched.

## Not reportable — investigated, ruled out

- **`kaspa-mining.html` attack-cost demo, "not priceable" for Kaspa in
  "Rent the power" mode, all slider positions:** initially looked like a
  broken calculation (100% of slider positions returned `not priceable` for
  the Kaspa chain in rent mode). Traced to `limitsNote`, which explains it
  explicitly: "Not priceable because there is no verified rental market at
  attack scale, not because KAS itself is hard to buy: NiceHash lists
  kHeavyHash, but nowhere near the order-book depth to rent 51% of Kaspa's
  network is confirmed, so this page will not substitute a guessed number
  for it." Switching to "Buy it outright" mode for Kaspa produces a real
  number (`$3.15 million` at the max duration). This is a deliberate,
  labeled design choice, not a defect.
- **Duplicate DOM ids on the multi-demo pages:** `kaspa-mining.html` (4
  demos, 107 ids), `what-is-kaspa.html` (4 demos, 100 ids), `kips.html` (2
  demos, 60 ids) — zero duplicate ids on any of the three, checked with all
  `<details>` sections forced open simultaneously so every demo's markup was
  live in the DOM at once. The id-prefixing done during the merge
  (`ac-`, `nc-`, `mc-`, `gp-`, `cs-`, `ln-`, `uva-`, `ss-`, etc.) holds.
- **Slider limits on kaspa-mining.html (attack-cost, emission-schedule,
  fee-market, node-cost) and what-is-kaspa.html mass-calculator:** driven to
  both extremes and to native-clamp-past-range on every range input found;
  all outputs stayed numeric and internally consistent (e.g. fee-market's
  fixed capacity figures `307` / `3,070 tx/s` reappear identically as
  mass-calculator's floor values on `what-is-kaspa.html`, which is the
  correct behavior for a shared network-capacity constant, not a
  collision). No NaN, no blank, no silent clamp-without-feedback found. Note
  range inputs clamp natively on `.value =` assignment past `min`/`max`, so
  this only tests the display path, not literal out-of-range typed input —
  none of the sliders checked pair with an editable number field.
- **Reload mid-interaction, `kaspa-mining.html`:** slider dragged to 950,
  reloaded — resets cleanly to the default `563`, no stale or half-broken
  state, no duplicate ids post-reload.
- **Deep link into a collapsed section, `kaspa-mining.html#fee-market`:**
  on fresh load the `<details>` opens (`el.open === true`) and scrolls into
  view. Not claimed as a finding either way — this behavior is explicitly
  called out as being actively changed elsewhere.
- **Rapid/double-click and mid-animation interaction** on
  `ghostdag-playground` (`gp-btn-mine-secret`, `gp-btn-release`,
  `gp-btn-advance` fired 20x each in a tight loop): no crash, no console
  error, buttons correctly self-disable at the end state.
- **Redirect stubs:** all 18 `demos/*.html` stubs resolve 200 and their
  `url=` target's anchor exists on the destination page (checked all 18
  pairs directly against the live pages). `demos/index.html`'s 23 unique
  hrefs to topic-page anchors also all resolve to an existing `id` on their
  target page.

## Could not test, and why

- **`kips.html`'s live GitHub fetch failure path.** The fetch fires
  synchronously as the page's own inline `<script>` executes during initial
  parse, before any post-navigation `javascript_tool` call can install a
  `fetch` patch — by the time a patch can be injected, the real request has
  already gone out and (on this network) already succeeded. This toolset has
  no init-script/pre-navigation-script or request-blocking capability, so
  the failure path could not be exercised live. From source
  (`kips.html:1071-1116`): the `.catch()` for both the KIP-README fetch and
  the KCC-pulls fetch is empty, and simply leaves the pre-existing baseline
  text in place (`"Baseline read from the KIP repository on August 22,
  2026..."`), which is written to name a specific past date rather than
  claim to be live, so on inspection it looks like honest-by-construction
  degradation — but this was not confirmed against a real failure.
- **JavaScript-disabled rendering**, on any page. No tool in this
  environment can disable JavaScript for a navigated page. Not tested; not
  inferred as pass or fail.
- **Full keyboard Tab-order walk with real key presses**, and the mobile-nav
  focus trap at 390px, across all four multi-demo pages. Time budget and
  the tab contention described above did not leave room for a reliable
  key-by-key walk with visual confirmation on every control. Checked only
  that `styles.css` contains no sitewide `outline: none` rule, which rules
  out the single most common way a site kills focus visibility everywhere
  at once, but does not confirm any individual control's focus ring or the
  mobile nav's trap behavior.
- **kaspa-origin-story.html, argent-explained.html, why-kaspa-matters.html,
  build-on-kaspa.html, toccata-explained.html sliders and cross-links** —
  not reached in this pass; time was spent going deep on the two
  highest-priority multi-demo pages and the live-fetch paths instead of wide
  across all eighteen demos. The `parameterless` demo on `kips.html` was
  skipped per instruction (being rebuilt concurrently).
