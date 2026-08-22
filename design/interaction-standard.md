# Interaction standard

This document defines what "malleable" means for `demos/`, then audits all
thirteen demos against it. It does not touch any demo file: thirteen agents
are restyling those files in parallel right now, and editing under them would
lose work. This is the standard and the audit. Implementation is a separate,
later wave.

**Status note (2026-08-22).** The paragraph below and the per-demo audit
further down describe `attack-cost.html` as having eight sliders (hardware
cost, energy price, rental rate, attack duration, hash-rate share, stake
share, slippage, amortization window) and call it "the reference" for that
reason. That stopped being true: a later pass hardcoded seven of those eight
into fixed JS constants, leaving the page with zero inputs, which three
separate audits then flagged as a regression. The fix restores exactly one
primary control, attack duration ("how long the attack runs"), matching the
page's own title ("what an attack would cost, per hour") and the site's "one
obvious thing to do" rule in `design/STANDARD.md`; the other seven values are
fixed at round, defensible defaults and stay disclosed with sources in the
collapsible, not exposed as sliders. `attack-cost.html` is no longer the
maximally-malleable reference this document describes it as; where this
document and the live file disagree, the file is correct. The
`confirmation-risk.html` claim two sections down (attacker-share slider
reaching 60%, past the 50% line) is accurate as of this note: that slider's
max was actually 49 until this pass extended it to 60 and made the ≥50% "no
wait is enough" case explicit in both the per-chain readout and the payoff
sentence.

Also since the original audit: `shared-state.html`'s "Grab it" button now has
a real disabled visual state (reduced opacity, default cursor) during its
~650ms race animation, instead of silently swallowing clicks while still
looking green and clickable. `collision-sim.html`'s `#delay` slider focus
ring was raised in contrast (and given more offset) because the standard
28%-alpha cyan ring was nearly invisible sitting on top of the slider's own
teal fill. `demos/index.html`'s cards now have a real hover state on the
whole card container, and the whole card (heading and description together)
is one real anchor rather than only the heading text being clickable.
`shared-state.html`, `supply-split.html`, `zk-boundary.html`, and
`demos/index.html` now carry the site's standard focus ring
(`a:focus-visible, button:focus-visible, input:focus-visible,
select:focus-visible`) directly in their own markup; they previously shipped
none at all and fell back to the browser default.

## Why malleable, not interactive

A demo with three preset buttons is interactive. A demo where every
assumption is exposed, adjustable, and challengeable is malleable. The
difference matters here specifically because this site's whole proposition is
that a reader does not have to take its word for anything. A number the
reader can change is a claim they can test. A number baked into the source is
a claim they have to trust, which puts the demo in exactly the position the
site criticizes everywhere else on the page.

`demos/attack-cost.html` is the reference. Hardware cost, energy price, rental
rate, attack duration, hash-rate share, stake share, slippage, and
amortization window are all sliders, not constants. It works because nothing
load-bearing in its conclusion is hidden from the control surface: a reader
who disagrees with the site's default assumptions can drag them to their own
and watch the number change, live, in front of them. That is the bar every
other demo is measured against below.

## The rules

### Every assumption is a control, not a constant

If a calculation depends on a number that is disputable, debatable, or simply
a point-in-time estimate, that number is a slider, a radio group, or a
number input, not a value sitting in a JavaScript object. The test: could a
reasonable reader look at this number and say "I don't buy that, what if it
were different"? If yes, it must move. `attack-cost.html` passes this test
for hardware price, electricity price, rental rate, and stake slippage, each
carrying a source note and an admitted uncertainty range. `fair-launch.html`
fails a narrower version of it: the post-genesis decay curve is explicitly
labeled "modeled, not measured" in its own disclosure panel, and yet the
decay rate itself has no control. The demo discloses that it's guessing,
correctly, but doesn't let the reader test the guess.

### Sourced facts are not controls

The inverse failure is just as real. A number independently verified against
a primary source and presented as fact, a protocol constant, a cited genesis
allocation, a quoted comment, must not be silently editable, because that
lets a reader "test" something that isn't actually in question and quietly
launders a verified fact into a toy the reader thinks they're overriding.
`mass-calculator.html` gets this right: the block mass limits and the
per-byte cost constants come straight from `rusty-kaspa`'s consensus code and
are frozen, while the transaction shape built against those limits (inputs,
outputs, payload size, compute budget) is fully open. `emission-schedule.html`
gets it right too: the reward-halving constants are consensus values, cited
and frozen, and the only control is a slider that scrubs a reader's position
along that fixed schedule rather than editing the schedule itself.

The line: an assumption a reader may reasonably challenge is a control. A
figure with a named primary source, verified and cited as fact, is not, and
should read as fixed, ideally with the source visible next to it so a reader
who does want to check it can, without being invited to overwrite it.

### Reset, and reset to what

A demo a reader has driven into a corner needs a way back to a known state,
and that known state must be the honest default. A flattering default is a lie the reader has to discover. A
"reset" that returns Kaspa's attack-cost-to-value ratio conveniently low, or a
covenant's balance to a round number that happens to make the demo's point
cleanest, is doing PR, not modeling. `covenant-breaker.html`'s reset returns
the vault to its literal starting balance and state, the same one the
narrative describes; that's the right shape. `ghostdag-playground.html`'s
reset returns k, the DAG, and the hidden-miner state to the same seeded graph
every time. Both are correct because the reset target is the same starting
condition the demo's prose already commits to, not a cherry-picked one.

### Presets are entry points, not the interface

A preset shows a reader where to start. It must not be the only place they
can stand. `mass-calculator.html`'s four preset buttons (plain payment,
change output, covenant, ZK proof) load a starting shape into the same
sliders the reader can then move freely; the presets never gate a control or
hide it. `covenant-breaker.html`'s five attack presets are the same shape:
each one fills the same form the reader can otherwise fill by hand, and
"Run the patient attack" runs a real sequence of the same submit action a
reader could trigger manually, one click at a time. The failure mode is a
preset that swaps in a canned visualization or a scripted animation with no
underlying control surface behind it (see `shared-state.html` below):
that's a slideshow with buttons, not a preset over a malleable model.

### Live feedback

Output updates as a control moves; there is no "apply" or "calculate" button
standing between a dragged slider and a changed number anywhere in the
current set. Every demo audited below already does this. Keep it: any new
control added during implementation binds to `input`, not `change` or a
submit action, unless the action is a genuinely discrete event the model
represents as discrete (mining a block, submitting a transaction, an
attacker choosing to release withheld blocks). Continuous assumptions get
continuous feedback; discrete actions get a discrete trigger, and the
distinction should track what's actually being modeled, not implementation
convenience.

### Show the working

The formula belongs on the surface or one `<details>` click away, and where
practical, the intermediate values do too, so a reader can check the
arithmetic instead of trusting the result. `collision-sim.html` prints
`p = 1 − e^(−λd)` directly on the page, live values of λ and d next to the
sliders that set them, and both the simulated and the formula-predicted
collision rate side by side, so a reader can watch the simulation converge on
the formula's prediction rather than being asked to believe either one alone.
`confirmation-risk.html` goes further: its `<details>` names the exact
whitepaper formula implemented, states plainly that it is the whitepaper's
Poisson approximation rather than the tighter Grunspan-Pérez-Marco exact
form, and names two specific, opposite-direction ways the single-chain model
misrepresents Kaspa's actual GHOSTDAG security. Naming the model's own
error bars where they aren't zero is the standard, not an afterthought.

### Honest ranges

A slider whose range excludes the values that would embarrass the demo's own
conclusion is dishonest, whether or not that was deliberate. `collision-sim.html`
sets its block-rate slider's range to run from Bitcoin's real cadence (1
block per 600 seconds) through Kaspa's, and it does this on a log scale so
the two regimes aren't visually collapsed into the same few pixels; the
demo's claim about the DAG's advantage is allowed to actually vanish at the
Bitcoin end of the range, because that's where the honest math says it
should. `confirmation-risk.html`'s attacker-share slider runs to 60%, past
the 50% line where its own model correctly reports "no wait is enough,"
rather than stopping just short of the uncomfortable answer.

The check for every slider during implementation: does the range include the
value at which the demo's headline claim stops being true? If the honest
answer is "the claim never stops being true across any real-world range,"
say that explicitly in the copy. If the answer is "the claim breaks past X,"
X needs to be inside the slider's range, not just past its edge.

### Malleability limits

Every control needs a boundary on the other side too. Three categories of
non-editable content, and why each is correctly frozen:

1. **Protocol constants verified against source.** Block mass limits, the
   emission halving schedule, GHOSTDAG's `NETWORK_DELAY_BOUND` and
   `GHOSTDAG_TAIL_DELTA` in `parameterless.html`. These are facts about a
   running system, not opinions about it, and are correctly not sliders.
2. **A fixed scenario being analyzed, not a variable being modeled.**
   `covenant-breaker.html`'s vault cap (500 KAS) and delay (36,000 DAA) are
   the specific covenant under test; the demo's whole point is "here is one
   real rule set, find the hole in it," not "explore the design space of
   possible caps." Freezing them is correct for that framing. (A future,
   more ambitious version of that demo could let a reader edit the covenant's
   own rules and watch new attack surfaces open, which would be a different
   and more powerful demo, but the current framing is not itself an error.)
3. **Direct quotations.** `supply-split.html`'s two co-author quotes from the
   KCC-0020 GitHub issue are presented as fixed text with a citation and a
   link, correctly, because they are someone's words on the record, not a
   parameter.

The rule that separates 1 and 3 from a genuine violation: does the source
citation sit next to the fixed value? If yes, and the value traces to a
primary source, it's correctly frozen. If a number is presented as fact with
no source, or is disclosed in the `<details>` as "modeled" or "estimated" yet
still has no control, that is the error this section exists to catch, and
Task 3 below names the instances found.

### Keyboard parity

Everything a mouse can do, a keyboard can do, with a visible focus ring per
the Focus states section of `house-style.md`. Every demo audited uses native
`<input type="range">`, `<button>`, `<input type="checkbox">`,
`<input type="radio">`, `<select>`, and `<details>`/`<summary>` for its
controls, which gets correct tab order, arrow-key adjustment on sliders, and
Enter/Space activation for free from the browser. `ghostdag-playground.html`
goes further, adding real keyboard handling to its custom DAG nodes
(`tabindex="0"`, `role="button"`, Enter/Space to pin a node's focus
highlight, Escape to clear it) because those nodes are not native form
elements. That is the pattern to copy anywhere a demo needs a custom
interactive element a native input can't express: give it a role, a tabindex,
and the same key handling a mouse click would trigger.

No demo audited introduces a custom slider, a drag-and-drop control, or a
canvas-based control surface that bypasses native keyboard handling. Keep it
that way; a custom control is more restyling risk than a native one is worth.

### State legibility

A reader must be able to tell, at any moment, what the current settings are
and how far they are from the defaults. Every demo audited shows live numeric
readouts next to its sliders (the `<b id="...Val">` pattern), which covers
the first half. The second half, visibly marking drift from a preset or
default, is inconsistent:

- `mass-calculator.html` and `parameterless.html` mark a preset button
  `aria-pressed="true"` when clicked, but nothing clears that pressed state
  when the reader then drags a slider away from the preset's values. A reader
  who clicked "Plain 1-in 1-out payment" and then dragged the payload slider
  to 20,000 bytes still sees that preset marked active, which is a state-
  legibility bug: the visible label no longer matches the actual control
  state.
- No demo currently shows an explicit "n sliders changed from default" or
  equivalent summary. Given the numeric readouts already present next to
  each control, this is a small addition, not a redesign, and worth adding
  wherever a demo has more than two or three controls.

Fix during implementation: any control's `input` handler that changes state
away from the currently-marked preset must clear that preset's
`aria-pressed` (or mark a new implicit "custom" state), the same way a
document editor un-bolds its Save button's implied "saved" state the moment
a keystroke lands.

### URL state

Not worth it for this set of demos, and skipping it is a judgment call, not
an oversight to fix later. None of the thirteen demos are the kind of tool a
reader shares a specific configuration of ("look at this exact 73% hash-rate
scenario") the way a shared spreadsheet cell or a chart with a specific date
range is shared; they are each built to be dropped into and explored once,
inline in an article, and the payoff of most of them (attack-cost,
confirmation-risk, mass-calculator) is watching a number move as a slider
drags, not landing on one frozen state. Serializing every demo's control
state to the URL query string would add real complexity (parsing on load,
handling malformed or partial state, keeping the serialization format in
sync with every future control added to thirteen separately-restyled files)
for a sharing use case that doesn't obviously exist yet. Revisit only if a
specific demo earns a "share this exact scenario" request from a real reader,
not preemptively across the set.

## Per-demo audit

Ranked by how much work each needs to meet the standard above. "Hardcoded
that should be a control" and "frozen assumption" flag Task 3 violations;
everything else is Task 2 scoring.

### Needs the most work

**`shared-state.html`.** Zero exposed assumptions. The auction bids (100,
120, 130), the winner-alternation pattern, and the timing of each animated
step are all hardcoded inside `runUtxoRound`/`runVmRound`; "Run round" plays
back the same scripted sequence every time rather than computing an outcome
from anything a reader set. This is the one demo in the set that is better
described as an animated explainer than a malleable model. It does have real
strengths worth keeping: proper ARIA tabs with roving arrow-key navigation,
a working reset per tab, and a clean three-way UTXO/VM/lanes comparison
structure. To meet the standard it needs actual inputs: a bid amount per
user (so a reader can test tie-breaking, not just watch a scripted race), a
number of concurrent bidders, and ideally a variable for mempool/settlement
timing so "who wins" becomes a function of something a reader controls
rather than an alternating counter. This is a rebuild of the interaction
layer, not a tuning pass.

**`zk-boundary.html`.** Fixed content: four claims, three anchor choices
each, all fully authored strings with no numeric or adjustable dimension
anywhere. This is defensible on its own terms, since the demo teaches a
qualitative distinction (what a proof settles vs. what it doesn't) rather
than modeling a quantity, and a slider would not obviously improve it. It is
flagged here because it is the least malleable demo in the set and is worth
a deliberate call during implementation: either accept that this demo's
genre is a decision-tree exercise and leave it as authored content (a
legitimate choice, not a violation, given nothing here is a debatable
quantity), or add a genuine parameter (letting a reader define their own
claim and test which anchor would satisfy it) if the site wants every demo
to clear the same bar. Separately, this file has no `data-theme` mechanism
at all: it uses `@media (prefers-color-scheme: light)` exclusively, which
`house-style.md` explicitly bans as the theme mechanism. That is a styling
concern in the parallel restyling wave, not an interaction one, but it also
means the site's own theme toggle button does nothing on this page, which is
an interaction gap worth a one-line flag here even though it's out of this
audit's scope to fix.

**`fair-launch.html`.** One frozen assumption: the post-genesis decay curve's
rate constant (`tau`, or the derived `k` in `valueAt`) has no control, even
though the demo's own `<details>` panel states outright that this curve is
"a modeled trend anchored to today's estimated concentration, not a measured
yearly series." The genesis-point allocations are correctly sourced and
frozen; the decay shape between genesis and today is the one thing here that
should be a slider (a "decay speed" or "half-life" control) so a reader can
test whether a faster or slower falloff still supports the demo's point, or
whether the conclusion depends on the specific curve chosen. Moderate work:
one new control, one formula change, no restructuring.

### Needs moderate work

**`ghostdag-playground.html`.** Strong on malleability (free-form mining,
hidden-miner attack simulation, an honest k-slider from 0 to 8, a real
reset), but has two gaps: no `<details>` sources/formula block anywhere on
the page (the k-cap mechanism is explained in prose in the lede, but the
actual GHOSTDAG blue-set algorithm it's running is not cited to KIP or
source), and no `data-theme`/localStorage theme mechanism at all (same
`prefers-color-scheme`-only pattern as `zk-boundary.html`, a styling-layer
gap out of this audit's scope but worth naming once). Add a sources
disclosure; the theme mechanism is the parallel wave's job.

**`node-cost.html`.** The single quantitative control (years-since-launch)
and the chain toggle chips both work correctly, and the sourced disk figures
are properly frozen with a dataset citation. The one gap: the "unpruned"
growth curve is explicitly labeled illustrative with no real published
figure behind it, which is honest, but there's no way to challenge the shape
of that illustrative curve (its growth exponent is a hardcoded `1.15` power
with no source and no control). Minor: since it's disclosed as
illustration rather than a measured claim, this is a smaller gap than
`fair-launch.html`'s, but the same fix pattern applies if it's worth doing:
either add a control or make even more explicit in the caption that the
shape itself, not just the scale, is invented.

**`parameterless.html`.** Two sliders (assumed max latency D, actual network
latency L), scenario presets, a real formula with citations to
`rusty-kaspa`'s `bps.rs`, and an honest research/live status framing
throughout. The state-legibility gap named above (scenario buttons don't
un-press when a slider is dragged away from their value) applies here too.
Otherwise close to the standard; small fix.

**`mass-calculator.html`.** Correctly frozen protocol constants, fully open
transaction-shape controls, formulas shown in full with source citations.
Two gaps: the same preset/slider state-legibility issue described above
(dragging a slider after clicking a preset leaves the preset marked active),
and no reset control at all, only re-clicking a preset gets a reader back to
a known state, and only the "plain" preset happens to match the demo's
actual defaults. Add an explicit reset and fix the preset-state bug.

### Close to the standard already

**`confirmation-risk.html`.** Three sliders (value at stake, attacker share,
risk tolerance), honest ranges including the ≥50% "no wait is enough" case,
a fully cited formula with the model's own error bounds stated explicitly in
both directions, chain checkboxes as toggle-able comparison, live SVG chart.
No reset button, but with only three independent sliders and no preset
buttons to fall out of sync with, the state-legibility risk this creates is
low. Lowest-priority polish: consider a small reset-to-default control
anyway, for consistency with demos that do have one.

**`collision-sim.html`.** Honest log-scale ranges spanning Bitcoin through
Kaspa on both axes, live formula and live predicted-vs-simulated comparison,
`prefers-reduced-motion` handled by swapping to a manual step button. No
`<details>` sources block and no explicit reset (though resetting is
implicit: any slider move restarts the simulation cleanly). Add a short
sources note; otherwise minimal work.

**`emission-schedule.html`.** Correctly frozen consensus constants
(`SUBSIDY_BY_MONTH_TABLE`, `SECONDS_PER_MONTH`), one honest scrub control,
live network reading with a stated, dated fallback when offline, full
formula and source citation in `<details>`. The one gap: no "jump back to
now" button once a reader has scrubbed away from the live position, though
the live badge does mark which step is current. Small, optional addition.

**`covenant-breaker.html`.** Free-form transaction composer plus five attack
presets that all funnel through the same real submit path, a working reset
to the vault's actual starting state, full rule pseudocode shown with KIP
citations, and a transaction ledger that shows the full history of what a
reader tried, why it passed or failed. This is close to the attack-cost
standard for a state-machine demo rather than a slider demo. Only the
noted, optional idea (letting a reader edit the covenant's own rules, not
just the transaction) would move it further.

**`supply-split.html`.** A genuine free-form sandbox: issue, transfer,
consolidate, and authorize-update actions all operate on real state, a full
event log shows every action's outcome, reset and a labeled preset both
work, and the two direct quotes are correctly frozen with citation and link.
Essentially meets the standard as a discrete-state simulator; no numeric
sliders are needed given what it's modeling.

**`attack-cost.html`.** No longer the maximally-malleable reference this
document once described (see the status note at the top of this file). A
later edit hardcoded hardware cost, energy price, rental rate, hash/stake
share, slippage, and amortization window into fixed JS constants and left
attack duration hardcoded too, so the page briefly shipped with zero inputs
at all: no slider, nothing to drag. Fixed by restoring exactly one primary
control, attack duration ("how long the attack runs," 1 hour to 1 week),
which is the one variable the page's own title asks about. The other six
values stay fixed at round, defensible defaults, each disclosed with its
value and reasoning in the `<details>` panel rather than hidden; chain and
rent/buy mode are still switchable. The "what this number does not capture"
panel still names the model's own blind spots (rentable supply limits,
slippage crudeness, the attacker's own asset collapsing in value) as prose.
This is now a "one obvious control, everything else disclosed" demo per
`design/STANDARD.md`, not an every-assumption-is-a-slider demo; judge it
against that shape, not against the eight-slider description earlier in this
file.

## Task 3: sourced-fact and frozen-assumption errors found

No sourced fact was found presented as user-editable anywhere in the audited
set. Every protocol constant, cited genesis figure, disk-size dataset entry,
and direct quotation checked is correctly frozen with a visible source.

Frozen assumptions that should be controls, in order of how directly the
demo's own copy admits it's modeling rather than measuring:

1. **`fair-launch.html`**, decay-curve rate constant. The demo's own
   disclosure panel calls the curve "modeled... not a measured yearly
   series," yet the modeling parameter has no slider. Highest-priority fix
   of the two, because the demo says out loud that it's an assumption and
   then doesn't let a reader touch it.
2. **`node-cost.html`**, unpruned-growth curve exponent. Lower priority: the
   curve is labeled illustrative rather than modeled-from-data, so the bar
   for exposing it as a control is lower, but the same principle applies.

## Recommended implementation order

1. **`shared-state.html`** first. It's the only demo that needs a genuine
   interaction rebuild rather than additions to an existing control surface,
   so it should start as its own wave while the smaller fixes below happen
   in parallel on other files.
2. **The two frozen-assumption fixes** (`fair-launch.html`,
   `node-cost.html`), since each is a single new control plus a formula
   change, not a restructuring, and directly closes a Task 3 finding.
3. **The state-legibility bug** (preset `aria-pressed` not clearing on
   manual slider input) across `mass-calculator.html` and
   `parameterless.html`, since it's the same fix applied twice.
4. **Small additions**: reset controls where missing
   (`mass-calculator.html`, optionally `confirmation-risk.html` and
   `emission-schedule.html`), a sources block on `collision-sim.html` and
   `ghostdag-playground.html`.
5. **`zk-boundary.html`**, last, and only after a deliberate decision on
   whether it should grow a parameter or stay a fixed decision-tree exercise
   as a legitimate different genre of demo.

Everything above is scoped to control logic and disclosure content, not
visual restyling, so it can proceed independently of the parallel
restyling wave once that wave lands.
