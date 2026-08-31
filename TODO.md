# Running list

Everything outstanding. Updated as work lands. The owner should never be
the one to find an item for this list. Closed items live in the commits
that closed them; git history holds the session logs this file used to
carry.

## Open, reader-facing

- **Live Kaspa DAG view: possible, deliberately not built.** Tested 29 Aug
  2026 from a real browser: `api.kaspa.org/info/blockdag` returns 200 with
  CORS allowed and hands back `tipHashes`, the live DAG frontier;
  `/blocks` needs a valid 64-hex `lowHash` from those tips. Not the couple
  of lines it looks like: needs polling, rate limiting, a visible failure
  path (a silent fallback showing stale numbers as current is worse than
  an error), and a loading-state decision. Its own piece of work.
- **The adversarial pass, never run to completion.** Break it,
  misunderstand it, check it, cross-read it; by agents that built none of
  it; every finding fixed and re-checked by a different agent than the one
  that found it. Any finding must carry `location.href` captured in the
  same evaluation as the measurement (two prior attempts produced false
  sitewide-breakage reports from browser contention).

## Open, maintenance

- **The bulk "overridden" cut is dead, measured 31 Aug 2026.** Deleting all
  146 rules the scanner classifies as overridden changed the rendered
  computed style on **88 of 96** page/width/theme combos. The instrument's
  own noise floor is 1 of 96 (index.html at 1280 light, the live collision
  demo), so 88 is signal, not drift. "Overridden on cold load" does not mean
  removable: something in a state the cold render does not enter puts those
  declarations back in charge. Do not retry the bulk cut. Any further cut
  needs the per-rule proof this file already asked for, and the line count
  is not worth the regression risk without it.
- **`driven-style-snapshot.mjs` hangs and cannot be used as written.** It
  does not block external requests the way the hardened cold snapshot does,
  so the pages with live API reads never settle; observed 29 CPU-minutes
  with no output before being killed. The hardened cold snapshot completes
  the same 96 combos in about 90 seconds. Fix the fetch blocking before
  anyone relies on the driven variant for a deletion proof.
- **`dead-css-scan.mjs` was dead on arrival and is fixed.** It aborted every
  run: its parser counted 672 rules against the browser CSSOM's 669, because
  Chrome discards the three `::-moz-range-thumb` rules added 31 Aug for
  slider hover and press states. Correct Firefox CSS, unparseable here, so
  the counts could never agree and every future CSS cleanup was silently
  blocked. The scanner now drops rules the engine cannot parse, names them,
  and still fails loudly on genuine parser drift.
- **Cascade debt in styles.css, remaining half.** 6,735 lines as of 31 Aug
  2026 (from 7,496: 260 identical-selector shadowed declarations removed by
  cascade algebra, 7 driven-state-proven dead rules, whitespace collapse;
  every cut verified by an empty computed-style diff, 96 combos x 41,584
  elements). Target under 6,000 still open. What remains is the hard half:
  158 scanner-"overridden" rules that DO match (deleting them on cold-load
  evidence is the `cccdfba` mistake; each needs a per-rule rendered proof
  across driven states), the six generated `.grid-cards:has(8|31-child)`
  rules (unmatched today, kept because the family is systematic and a
  future 8-card grid would regress), and merging split selector blocks
  (order-tied against ~280 equal-specificity intervening declarations; a
  conservative merge pass and a part-level shadowing pass were both built,
  both vetoed by the snapshot instrument, and abandoned). The instrument
  that makes further cuts provable: the hardened computed-style snapshot
  (sorted properties, fixed server port, external fetches blocked, DOM
  settle wait) plus the driven-state variant (menu clicked open, details
  opened, dialogs shown); the un-hardened script reads noisy.
- **RESOLVED 31 Aug: the raw leaderboard dumps are verified, not read.**
  `scripts/verify-picker-sources.py` proves all 1,223 raw cells in
  `data/picker-data.json` appear on their own model's real row in their own
  source board file, matched through `build-picker-data.py`'s ALIASES table.
  1,223 of 1,223. Reading 48,000 lines would not have proved this; a
  fabricated or mistyped number cannot pass it. Re-run after any `data/`
  refresh. Note the boards disagree on names: LiveBench calls Claude Opus 5
  "Claude 5 Opus Thinking Max Effort", and a checker matching on the picker's
  own display name reports 19 false misses, every one an alias spelling.
- **`check-label-colors.py` never reads `styles.css`.** It scans
  page-local `<style>` blocks only, so a raw color on a `.tag` rule in the
  main stylesheet passes silently. Either state that as deliberate where
  the gate lives, or close the gap.
- **The pre-push clean-clone hook is heavy** and history shows it gets
  bypassed with `--no-verify` under time pressure. It needs to be cheap or
  it will keep getting skipped, which is worse than not having it.

## For the owner to decide, not for an agent to act on

- **sources.html contradicts the site's own rule.** design/STANDARD.md
  says a source belongs attached to the claim it settles and a page nobody
  arrives at on purpose should not exist. The page is cut to ~700 words
  with all URLs kept, so it is good; the question is whether it should
  exist at all versus attaching every source inline at the claim. Real
  work, changes how every page reads.
- **status.html reads as a template**: 37 identical disclosures, zero use
  of the info affordance or view switch. The owner has rejected uniformity
  in general, but a reference surface may genuinely scan better uniform.
  Argue it either way rather than assume.

## Standing rules for every item

- Verified at 390, 768, and 1280, in both themes, rendered, by someone who
  did not build it, before deploy. Report measured before/after numbers,
  never "looks right".
- Committed AND pushed; confirm the changed strings from served bytes on
  kaspaexplained.com with a cache-busting URL.
- The landing rule: every page opens with what a reader needs and holds
  the rest one click away. The 300-word ceiling serves this rule, not the
  other way round.
- A demo makes ONE point and shows it happening. When a reader does not
  get it, cut until the one thing is unmissable; never explain harder.
- Any cutting pass states a target reduction before it starts and is
  judged on it. A pass that cuts nothing has failed and says so.
- Jargon appears with its meaning in the same label, or does not appear.
  One phrasing per concept, everywhere; write the definition once and
  reuse the exact text.
- Full gate before push: `VISIBLE_WORDS_BLOCKING=true
  RENDER_GATE_BLOCKING=true PAGE_HEIGHT_BLOCKING=true
  DEMO_SURFACE_BLOCKING=true DENSITY_GATE_BLOCKING=true bash
  scripts/check-site.sh` printing `Site checks passed.`, then
  `bash scripts/check-clean-clone.sh`. The pre-commit hook runs only the
  structural half; never report its pass as the full gate.
