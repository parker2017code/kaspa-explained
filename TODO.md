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
- **Three thin disclosure panels.** `what-is-kaspa.html` "Why Bitcoin
  chose the opposite trade-off", `why-kaspa-matters.html` "Why evidence
  next", `crypto-from-scratch.html` "NIST's definition" open onto
  one-sentence restatements. A disclosure that opens onto a restatement
  teaches a reader not to open the next one: carry real depth or inline.
- **The adversarial pass, never run to completion.** Break it,
  misunderstand it, check it, cross-read it; by agents that built none of
  it; every finding fixed and re-checked by a different agent than the one
  that found it. Any finding must carry `location.href` captured in the
  same evaluation as the measurement (two prior attempts produced false
  sitewide-breakage reports from browser contention).

## Open, maintenance

- **Cascade debt in styles.css.** 229 of 941 selectors declared three or
  more times (`.quick-grid article` 13 times across 3,000 lines);
  `kaspa-mining.html` renders 16 distinct font sizes against Linear's 6.
  Target: under 6,000 lines (7,370 as of 31 Aug 2026 after two orphan-rule
  cuts). The remaining dead/inert rules from
  `data/dead-css-scan-2026-08-29.json` need a state-driven re-scan (all
  six widths, dialogs opened, hover/focus driven) before any deletion:
  that scan's "dead" class includes rules that only apply inside opened
  dialogs, which is exactly what `cccdfba` broke once already. 31 Aug: the
  zero-reference-class rules are gone (33 removed, pixel-verified);
  pruning dead PARTS from mixed comma selectors broke the light theme
  sitewide and was reverted, so do not retry that without the pixel
  harness.
- **296 design-token values copied into page-local style blocks** across
  six demo pages (`--bg`, `--green`, `--orange`, ...). Checked 29 Aug:
  nothing has drifted yet, which is the trap; a palette change will
  silently miss six demos. Fix by inheriting tokens rather than restating
  them; needs its own both-theme verification, same shape as the
  collision-demo duplication that hid a real bug.
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
