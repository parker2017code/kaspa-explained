# Adversarial check 2

Read-only pass. Every finding below was checked by hand against its primary
source (github.com/kaspanet/rusty-kaspa, github.com/kaspanet/kips,
github.com/kaspanet/kccs, or the site's own code, read directly), not against
another page of this site and not against CLAIMS.yml. Claims that checked out
correct are not listed. Three background research agents were launched early
in this pass and then explicitly countermanded; nothing below is taken from
their output unadopted — each finding was independently re-derived by reading
the primary source or the code myself before being written here.

## 1. kips.html: the live-refresh failure path does not do what the page says it does

`kips.html:1013` tells the reader: "If GitHub is unreachable or rate-limits
the request, the baseline stays and the stamp says so."

The code does not make the stamp say so. Both fetches on the page end in a
no-op catch:

```
kips.html:1091-1094 (KIP fetch)
      .catch(function () { /* baseline stands */ });

kips.html:1098 (KCC pull-request fetch)
      .catch(function () { /* baseline stands */ });
```

Neither catch block touches `kip-stamp` or `kcc-stamp`. On failure the stamp
text stays exactly what shipped in the HTML:

```
kips.html:331  "Baseline read from the KIP repository on August 22, 2026.
                This table refreshes from the repository when the page loads."
kips.html:873  "Baseline read from the KCC repository on August 22, 2026.
                This table refreshes from the repository when the page loads;
                the live fetch below only lists currently open pull requests..."
```

That sentence, unchanged, tells a visitor a refresh just happened even when
it silently failed. This is the same shape as the original curl-vs-browser
incident this site already shipped once: a live-labeled figure falling back
to stale data with no visible caveat. The GitHub PR endpoint
(`api.github.com/repos/kaspanet/kccs/pulls`) is unauthenticated and shares a
rate limit with every other anonymous caller from the same network, so this
is not a hypothetical edge case, it is the default state for a visitor on a
rate-limited IP.

Severity: moderate. Fix is a one-line change to each catch block, not a
redesign.

## 2. kips.html: "the reporter never withdrew his concern" no longer matches the source thread

`kips.html:910` and `kips.html:1004` both assert that Knitser, who opened
`kaspanet/kccs` issue #14, never withdrew his concern:

> "The reporter never withdrew his concern, and the issue is still open."
> "Knitser has not withdrawn his original concern, and no spec change has
> merged."

Fetched the live issue thread directly
(github.com/kaspanet/kccs/issues/14). The thread now has two comments this
page's prose does not account for, both dated August 23, 2026:

- Knitser, replying after the four points the page does cite: "Thanks all,
  this clears it up for me. The rock/paper/scissors example is the right
  mental model: the extended state says which cells are interchangeable with
  which, and the standard transfer will not mix them." He then asks for four
  wording/documentation refinements, not a design change.
- Manyfestation, immediately after: "Opened a related change-
  https://github.com/kaspanet/kccs/pull/16/changes  Thank you for the
  feedback @Knitser @michaelsutton @ShawnPearce"

"The issue is still open" is still true (confirmed: no closed state on the
issue as fetched). "No spec change has merged" is also still true, PR #16 is
open, not merged. But "never withdrew his concern" reads differently once
Knitser's own reply is in view: he says the explanation clears it up and
reframes his remaining ask as documentation wording, not a standing bug
report. The four verbatim quotes already on the page (Manyfestation's
extended-state comment, Sutton's frozen-bool and receipt-like-data comments,
Manyfestation's agreement) all check out word for word against the source
and are not the problem here. The problem is the surrounding narrative
framing, which was accurate when written and is now trailing the thread by
one exchange.

Severity: moderate. This is exactly the kind of claim the brief calls out:
correct when written, overtaken by the same live source it cites.

## 3. CLAIMS.yml: one recheck_after date expires tomorrow

Today is 2026-08-24. No `recheck_after` date in CLAIMS.yml has passed. One is
imminent: `tps_and_speed_context` (CLAIMS.yml:62) is dated `recheck_after:
2026-08-25`, tomorrow. It is also one of the faster-moving claims in the
file (TPS/throughput framing tied to `kaspa-tps-explained.html`). Not a
defect, but it will be stale by the time anyone reads this without a
recheck the day after next.

## What I did not get to

Given the correction to work personally rather than through subagents, I
prioritized the two kips.html findings above and confirmed the six
load-bearing protocol facts (Toccata DAA score 474,165,565 and 30 June 2026
date, rusty-kaspa v2.0.0 published 5 June and v2.0.1 15 June, Crescendo DAA
110,165,000, finality depth 432,000 blocks, pruning depth 1,080,000 blocks,
DAGKnight as KIP-2 Status: Proposed, vProgs not on testnet) each against
rusty-kaspa's params.rs/bps.rs/constants.rs, the v2.0.0/v2.0.1 release notes,
and kip-0002.md directly, by hand, including recomputing the pruning-depth
formula's lower bound (627,258) against the flat floor (1,080,000) to confirm
which one actually wins. All six check out; none are listed above because
they are correct.

I did not personally re-walk every one of the 18 merged demos and their host
pages for protocol-constants-presented-as-measurements or self-disagreeing
figures (priorities 1's broader sweep and 6), or personally re-test
demos/live-network.html / what-is-kaspa.html's live widget in a real browser,
beyond the code-level check on kips.html above. That is real remaining
surface area, not a claim of a clean bill of health for those sections.
