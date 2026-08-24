# Handoff checklist

Nothing reaches the owner until every line here is done BY AN AGENT, not by him.
He is the last reviewer, never the first tester.

## Cold read, required per demo and per page

An agent loads it fresh, having not built it, and before touching anything writes
down what it thinks the thing is for. If that first read is wrong, the page fails.

Then, for every visible element:
1. What am I looking at?
2. What does this axis, number, or label mean?
3. Why do I care?
4. What am I supposed to do here?

An element that cannot answer all four from what is on screen is a defect.
Answers found only in source or in a collapsible do not count.

## Hard limits

- Under 40 words before the interactive thing.
- No jargon without its plain meaning in the same label.
- Human units. Days and weeks, never raw seconds. "Halves in a year", never an exponent.
- Round numbers on screen. Full precision lives in the collapsible.
- One obvious primary interaction. A second control must be visibly quieter.
- Small titles.
- It must respond instantly and feel alive. prefers-reduced-motion gets a static equivalent.

## Verified, not asserted

- Every link fetched, status recorded.
- Live domain checked, not just localhost. Localhost passing means nothing has shipped.
- Click path walked in a browser and stated explicitly in the report.
- Gate green on a clean clone, not the dirty tree.

## The standard

"UI UX should be superb. Modern. Feel like a modern startup, crypto, Tesla, Apple.
Apple is the vibe. It should feel awesome and cool and fun."

Not words. Not a clunky square interface. If it reads as something an AI produced
and nobody re-read, it fails.

## Design standard

The bar for this site is macOS and iOS. Not "modern," not "clean," Apple
specifically. Read design/STANDARD.md before writing any markup or CSS, and
design/handoff-checklist.md before reporting anything as done. Both govern
every page and every demo. Correct but unusable is a failure here.

## How to actually switch themes when verifying

Agents keep verifying "both themes" by forcing `prefers-color-scheme`
through the viewport or an emulation flag. This site does not read that
media query. It reads a `data-theme` attribute on the root element,
persisted in `localStorage` under `kaspa-explained-theme`, and it is
dark by default. Forcing the media query changes nothing and produces a
report claiming two themes were checked when one was.

Set it directly, then confirm it took:

    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('kaspa-explained-theme', 'light');
    getComputedStyle(document.body).backgroundColor;

The computed background must actually differ between the two runs. If it
does not, the theme did not switch and the check did not happen.

## Never resize the browser window

The browser pane is the owner's own Chrome window on his machine, not a
scratch instance. Calling `resize_window` moves his window while he is
working in it. He has asked for this to stop and it is now a standing
rule in every brief.

Checking a layout at 390, 768, 1024 or 1280 is still required. Do it with
a harness instead:

Write a scratch HTML file containing an iframe of the exact width you
want, pointing at the page under test. Serve it and screenshot or measure
that. Media queries respond to the iframe's viewport width, so a 390px
iframe is a faithful mobile render. Keep the harness in the session
scratchpad, never in the repo.

For numbers, reading `getBoundingClientRect` and `getComputedStyle` inside
that iframe is more precise than a screenshot anyway, and it is what the
measurements in every audit today were actually based on.

The same courtesy applies to tabs. Several agents had their tab reclaimed
mid-measurement today and two previous sessions filed false reports of
sitewide breakage because of it. Confirm `location.href` in the same
evaluation as every measurement, and do not navigate a tab you did not
open.
