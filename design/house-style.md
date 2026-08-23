# House style

This is the site's actual visual language, read back out of `styles.css` and
the live pages rather than invented. It exists because thirteen agents were
each told to "match the house style" from the same 8,400-line stylesheet and
produced thirteen different visual dialects. The CSS has tokens and
components; it did not have a spec a fresh agent could match without reading
every page first. This document is that spec.

A note on `styles.css` itself: the file holds two eras. Roughly the first
6,300 lines are a pre-redesign "glass" system (translucent rgba panels, blur,
soft glows). A block appended at the end, comment-labeled `APPLE DESIGN
LAYER, 2026-07-08`, overrides it by cascade order (CSS is last-wins) and is
the system that actually renders on every page today. If you inspect the file
top to bottom you will read the glass era first and copy the wrong tokens.
**Only the Apple layer, from that comment to the end of the file, describes
the current look.** Everything below is drawn from that layer and from
`design/patterns.html`.

## Palette

Dark is the default theme, not light. `color-scheme: dark` sits on the bare
`:root`; light is opt-in via `:root[data-theme="light"]`. There is no
`prefers-color-scheme` media query anywhere in the stylesheet: theme is
controlled entirely by a `data-theme` attribute on `<html>`, set by a small
inline script and toggled by a button (`nav.js`), persisted to
`localStorage["kaspa-explained-theme"]`.

| token | role | dark | light |
|---|---|---|---|
| `--bg` | page background | `#100e0c` | `#fbfaf6` |
| `--bg-2` | secondary page tone | `#1c1a17` | `#f3f0ea` |
| `--panel` | section-level tile background | `#1c1a17` | `#f3f0ea` |
| `--panel-strong` | emphasized panel | `#221f1c` | `#fbfaf6` |
| `--card-bg` | card/tile background inside a panel | `#322f2a` | `#fbfaf6` |
| `--line` | hairline border | `#4a453d` | `#d8d4cb` |
| `--line-bright` | stronger hairline (dashed notes, emphasis) | `#746e60` | `#bcb6a8` |
| `--text` | body text | `#f8f5ef` | `#211e1a` |
| `--muted` | secondary text (leads, captions) | `#b6b0a7` | `#646057` |
| `--faint` | tertiary text (table headers, meta) | `#9d988c` | `#757066` |
| `--green` | primary accent (brand, links, primary buttons) | `#66d1c1` | `#0e7c6b` |
| `--cyan` | secondary accent (focus ring, info notes) | `#2997ff` | `#0071e3` |
| `--purple` | tertiary accent, used sparingly | `#bf5af2` | `#6e56cf` |
| `--purple-pill` | roadmap status-pill color only; brighter than `--purple` in dark so the pill clears AA (see Status pills) | `#ce80f5` | `#6e56cf` (= `--purple`) |
| `--pink` | quaternary accent, used sparingly | `#ff9f0a` | `#b25000` |
| `--ink` | text color placed on a solid accent fill | `#06201b` | `#ffffff` |
| `--accent-soft` | green tint at 10-12% for soft highlight fills | rgba(102,209,193,.12) | rgba(14,124,107,.1) |
| `--control-bg` | button/input resting fill | `#2c2c2e` | `#e8e8ed` |
| `--control-hover` | button/input hover fill | `#3a3a3c` | `#dededf` |
| `--field-bg` | text input / code block background | `#221f1c` | `#ffffff` |
| `--field-line` | text input / code block border | `#4a453d` | `#d2d2d7` |

Four accent colors exist (`--green`, `--cyan`, `--purple`, `--pink`) and each
has a job: green is the brand color and the default call to action, cyan
marks focus and informational asides, purple and pink are used only where a
fourth or fifth categorical color is genuinely needed (a chart legend, a
fourth status state). Reach for green first. Do not invent a fifth color.

`--brand-gradient` (`linear-gradient(135deg, <green>, <green-adjacent>)`,
values differ slightly per theme) is the one sanctioned gradient on the whole
site. It fills small pill badges and CTA accents. It never fills a card, a
section, or a page background, and no other gradient exists anywhere in the
Apple layer.

## Type scale

Body font is the system stack: `-apple-system, BlinkMacSystemFont, "SF Pro
Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif` (headings use "SF Pro
Display" in the same stack). No webfont is loaded. No page pulls a Google Font
or any other custom family; monospace content (formulas, code, hashes) uses
`ui-monospace, Menlo, Consolas, monospace`, which is the one departure from
the system sans stack and it is reserved for genuinely monospaced content.

| element | size | weight | tracking | line-height | color |
|---|---|---|---|---|---|
| `body` | 17px | 400 | normal | 1.6 | `--text` |
| `h1` | `clamp(2.9rem, 6.2vw, 4.6rem)` | 700 | -.017em | 1.04 | `--text` |
| `h2` | `clamp(1.9rem, 3.6vw, 2.9rem)` | 700 | -.014em | 1.08 | `--text` |
| `h3` | contextual, ~18-20px in body content | 650 | -.008em | default | `--text` |
| `.lead` (intro line under a heading) | `clamp(1.19rem, 1.9vw, 1.42rem)` | 420 | normal | 1.45 | `--muted` |
| `.eyebrow` (small label above a heading) | 12px | 700 | .08em | default | `--green` |

`h1` and `h2` are large on purpose: this is the one place the site is
generous with size. Everything below that (body copy, table cells, captions,
button labels) sits in a tight 11px-17px band. There is no mid-size heading
tier between "hero-scale h1/h2" and "17px body with a bold run-in phrase";
resist inventing an 24px "section title" size that doesn't already exist.

The `.eyebrow` is a plain text label, not a pill. It carries no border,
background, or padding: `margin: 0 0 12px; color: var(--green); font-size:
12px; font-weight: 700; letter-spacing: .08em;`. If something needs a
background and a border, it is a different component (a status pill, see
below), not an eyebrow with a box drawn around it.

## Spacing and shape

Radius is not a single number. It scales with what it's wrapping, in five
fixed steps. Use the nearest one; do not interpolate a sixth.

| radius | used for |
|---|---|
| 980px (effectively a pill) | buttons, the nav CTA, status pills, chips |
| 28px | the outer page-level tile / hero wrapper |
| 18px | cards, table wraps, search-result cards |
| 14px | small notes, quote blocks, inline callouts |
| 8px | inputs, small controls, code blocks, small buttons inside a demo UI |

Nothing on the site uses 4px, 12px, 16px, 20px, or 24px. A radius that isn't
one of the five above is a tell that the CSS wasn't drawn from this system.

Cards carry no visible stroke in the current layer (`border: 0`); depth comes
from a background step up from the page (`--card-bg` sitting on `--panel` or
`--bg`) plus a very quiet shadow, not a border line. The one sanctioned
shadow pair:

```css
/* light */
box-shadow: 0 1px 2px rgba(0,0,0,.05), 0 6px 16px rgba(0,0,0,.04);
/* dark */
box-shadow: 0 1px 2px rgba(0,0,0,.4), 0 12px 32px rgba(0,0,0,.35);
```

A 1px `var(--line)` hairline border is the one exception, and it appears only
on tables (row dividers) and the footer's top rule. It is a divider, not a
card outline.

## Components

**Buttons** are pills: `min-height: 44px; border: 0; border-radius: 980px;
padding: 11px 22px; background: var(--control-bg); color: var(--text);
font-size: 16px; font-weight: 500;` with no shadow. A primary button swaps to
`background: var(--green); color: var(--ink);`. Hover swaps `--control-bg` for
`--control-hover` (or darkens `--green` slightly for primary); nothing lifts,
scales, or glows on hover. A smaller in-demo control button (a toggle, a preset
picker) can drop to a 32-36px min-height and 8px radius rather than the full
44px pill, but keeps the same flat, borderless, shadow-free treatment.

**Status pills** (`.status-pill` in `styles.css`, demonstrated in
`design/patterns.html` pattern 4) are the component for "live / testnet /
roadmap / research / wrong" labeling: small, rounded 999px, colored text on a
soft tint of that color, never relying on color alone (the word itself always
ships with the color). Use this component wherever a status word would
otherwise get typed out inline in prose repeatedly.

Every state uses one formula: label `color-mix(in srgb, var(--status-color)
78%, var(--text))`, fill `color-mix(in srgb, var(--status-color) 14%,
transparent)` composited over the card it sits on. The `.roadmap` state is
the one exception: it reads `--status-color` from `--purple-pill`, not
`--purple`, because `--purple` run through the shared formula lands at
4.16:1 on `--card-bg` in dark, below AA. `--purple-pill` is a brighter purple
used only for this pill; `--purple` itself is unchanged everywhere else it
appears. Do not adjust the shared 78/14 formula to fix a single state —
green, cyan, pink, and the muted (`not-live`) state all clear AA under it
already; give a future failing state its own `--<color>-pill` token instead.

**Tables** live inside a wrapping container: `border-radius: 18px; background:
var(--card-bg);` plus the card shadow. Header cells: `color: var(--faint);
font-size: 12px; letter-spacing: .05em; border-bottom: 1px solid var(--line);`.
Body cells: `border-bottom: 1px solid color-mix(in srgb, var(--line) 55%,
transparent);`. A cell that wants to hold a paragraph instead gets a short
summary plus a `<details class="cell-detail">` (pattern 3 in
`design/patterns.html`), not a wide cell with wrapped prose.

**Disclosure** (`<details>`/`<summary>`, styled as `.deep-dive` or
`.cell-detail`) is the workhorse for optional depth: model derivations, source
notes, caveats a first-time reader doesn't need. Restyle the summary marker
(a plain `+`/`−` glyph, not default browser triangle chrome) so it reads as a
deliberate control, not unstyled `<details>`.

**Evidence notes** (`.evidence-note`) pair a citation with what it does and
does not establish: `border-left: 3px solid var(--cyan); border-radius: 0 8px
8px 0; background: rgba(var(--cyan-rgb), .06);`, holding a small definition
list (`Source` / `Establishes` / `Does not establish`).

**Stat tiles** show a labeled number with its unit and its as-of date and
source inline, in one component, so the date can't quietly rot into a later
edit without visibly breaking the sentence it lives in.

### Disclosure components (the 300-word surface)

`design/STANDARD.md`, "The 300-word surface," caps every page at 300 visible
words and names `<details>` as one mechanism among several, not the default
answer for every page. Three more live at the end of `styles.css`, after the
heading-as-link block. Reach for whichever fits the content; using the same
one everywhere is the failure the rule exists to prevent. `scripts/check-
visible-words.mjs` enforces the ceiling by rendering each page and reading
computed visibility, so anything genuinely hidden behind one of these (closed
by default) does not count against the budget; anything left open does.

**Info affordance** (`.info-affordance`) — a small round `(i)` next to a
control or a line of text, for a short aside at the exact point a reader
would want it: what a slider's unit means, why a default was chosen, a
one-sentence caveat. Opens on hover or keyboard focus with no JS at all;
add a tap-to-toggle script for touch devices, which is the one part CSS
can't do alone:

```html
<span class="info-affordance" id="rate-info">
  <button class="info-affordance__trigger" type="button"
          aria-expanded="false" aria-describedby="rate-info-panel">
    <i class="info-affordance__glyph" aria-hidden="true">i</i>
    <span class="sr-only">More about block rate</span>
  </button>
  <span class="info-affordance__panel" id="rate-info-panel" role="tooltip">
    Kaspa runs at 10 blocks a second today. Bitcoin runs at roughly one
    every 10 minutes.
  </span>
</span>
```

```js
document.querySelectorAll('.info-affordance').forEach((el) => {
  const trigger = el.querySelector('.info-affordance__trigger');
  trigger.addEventListener('click', () => {
    const open = el.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', String(open));
  });
});
document.addEventListener('click', (e) => {
  document.querySelectorAll('.info-affordance.is-open').forEach((el) => {
    if (!el.contains(e.target)) {
      el.classList.remove('is-open');
      el.querySelector('.info-affordance__trigger').setAttribute('aria-expanded', 'false');
    }
  });
});
```

Use it for: one sentence of context tied to one control or one number. Not
for: anything a reader needs to complete the page's primary task, or more
than two or three sentences (reach for the view switch instead, so the extra
text gets room to breathe rather than living in a cramped floating box).

**Term-level definition reveal** (`.term-def`) — wraps one jargon word inline
in running prose; hover, focus, or tap reveals its plain-language meaning
without leaving the sentence:

```html
<p>Every block references its <span class="term-def" tabindex="0"
   role="button" aria-describedby="anticone-def">anticone<span
   class="term-def__panel" id="anticone-def" role="tooltip">The blocks a
   given block couldn't have known about yet when it was mined.</span></span>,
   not just its parent.</p>
```

Opens on hover/focus with no JS. Add the same tap-toggle pattern as the info
affordance (target `.term-def` instead of `.info-affordance__trigger`) if the
page needs touch support and the term sits somewhere a reader is likely to be
on a phone. Use it for exactly one word or short phrase the reader has
already been introduced to once on the page (STANDARD.md's "define once,
then use it" rule still applies; a term reveal only reminds, and the
definition still needs a home elsewhere on the page). Keep instances spaced out in a paragraph: two
`.term-def` spans sitting close together can overlap each other's tap area.

**Secondary-view switch** (`.view-switch`) — a segmented control that swaps
one panel for another rather than expanding a panel below the fold. Use it
when a page has two competing framings of the same content and only one
belongs on the surface at a time: a simple readout versus the full formula,
a chart versus its data table. Pure CSS, no JS; panels are matched to tabs by
position, so keep each switch's inputs and panels in the same order:

```html
<div class="view-switch">
  <input class="view-switch__input" type="radio" name="mass-view" id="mass-simple" checked>
  <input class="view-switch__input" type="radio" name="mass-view" id="mass-detail">
  <div class="view-switch__tabs" role="radiogroup" aria-label="View">
    <label class="view-switch__tab" for="mass-simple">Simple</label>
    <label class="view-switch__tab" for="mass-detail">Formula</label>
  </div>
  <div class="view-switch__panels">
    <div class="view-switch__panel">Compute is the binding dimension.</div>
    <div class="view-switch__panel">mass = max(compute, storage, transient)</div>
  </div>
</div>
```

Give every switch on a page its own `name` so two switches don't fight each
other. Not for: more than three or four views (a control that wide stops
reading as a single choice), or anything that should stay visible
side-by-side for comparison — that's two panels in the layout, not a switch.

## Light and dark

Every color is a token; nothing is hardcoded. The dark and light values above
are not the same colors at different opacities. They are genuinely different,
theme-appropriate colors (for example `--green` is `#66d1c1` in dark and
`#0e7c6b` in light, not one hex value with an alpha channel toggled). Do not
implement "dark mode" by dimming a single light palette.

The mechanism is a `data-theme` attribute on `<html>`, not a media query. A
tiny inline script reads `localStorage["kaspa-explained-theme"]` (falling back
to dark), sets `document.documentElement.dataset.theme`, and a button toggles
it and rewrites storage. See `design/page-template.html`'s script block for
the exact thirteen lines. Anything that instead keys off
`@media (prefers-color-scheme: ...)` alone will look plausible in isolation
but breaks the moment a reader expects the page's own toggle button to work,
and it can't be told apart from the real thing without opening dev tools,
which is exactly the kind of seam this document exists to close.

## Focus states

```css
a:focus-visible,
button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--cyan) 28%, transparent);
  outline-offset: 3px;
}
```

This is the only focus treatment on the site. It must render visibly in both
themes at every interactive element: links, buttons, inputs, selects,
textareas, and anything made keyboard-operable with `tabindex`/role
attributes (custom sliders, card-as-button patterns). Never suppress it with
`outline: none` without supplying an equivalent replacement, and never rely on
a background or border color change alone to signal focus, since that fails
the same way color-only status signaling fails.

## What the site deliberately does not do

This is the list that matters most, because it is what generic "AI mockup"
output reaches for by default and the site never does:

- **No decorative gradients.** The one exception is `--brand-gradient` as a
  thin fill on a small pill or badge. No gradient page background, no
  gradient card, no gradient hero panel, no purple-to-blue "tech" gradient
  anywhere.
- **No drop shadows beyond the two specified shadow pairs.** No glow, no
  colored shadow, no shadow used to fake a floating card unless it's the
  quiet `0 1px 2px / 0 6-32px` pair above.
- **No emoji as iconography.** Status and category markers are text labels,
  color, shape, or a genuine SVG glyph, never an emoji standing in for an
  icon.
- **No purple-to-blue AI-mockup color scheme.** Purple and pink exist as
  minor accents only, never as the dominant two-color scheme of a page.
- **No centered marketing hero for a working tool.** A demo's title can be a
  short line at the top; the interactive body reads left-aligned like normal
  site content, not a centered wall of oversized text.
- **No chunky, heavily-shadowed rounded-rectangle buttons.** Buttons are flat
  pills with no shadow, per the Components section above.
- **No arbitrary hex colors.** Every color traces back to a token in the
  Palette table. If a needed color isn't in the table, that's a sign to reuse
  an existing token's role rather than inventing a new hex value.
- **No alternate font stack.** No Inter, Poppins, Montserrat, or any Google
  Font. The system stack is not a placeholder; it's the actual choice.
- **No `prefers-color-scheme` media query as the theme mechanism.** See Light
  and dark, above.
- **No color-only encoding.** Anything distinguished by color (a status, a
  group, a series in a chart) also carries a shape, a pattern, or a text
  label, so it survives grayscale and colorblind vision.

## How to build a demo

Demos live in `demos/` as single, self-contained HTML files: inline `<style>`
and inline `<script>`, no build step, no external network request, no shared
`<link>` to `styles.css`. Copy the token values from this document directly
into the file's own `:root` block rather than linking the stylesheet, so a
demo keeps rendering correctly even if `styles.css` changes shape later, and
still opens correctly from a local file:// path with no server.

- **Structure**: a short answer or framing line up top (this is the one place
  a slightly larger, centered treatment is fine), the interactive model
  itself, a compact result readout, then a `<details>` block holding the
  model's derivation and its sources. Depth is optional and collapsed by
  default; the surface reading path should be short.
- **Prose budget**: state the model, state what it's verified against, state
  what it does not prove, in that order, and keep it that short. A demo is not
  an essay; if there's more to say than a paragraph or two per section, that
  belongs in the `<details>`, not the visible surface.
- **Sourcing**: every number that comes from somewhere real names that source
  inline or in the details block. A modeled or estimated number says so
  explicitly rather than presenting an estimate with the same confidence as a
  verified one.
- **Keyboard operable**: every control (slider, toggle, tab, preset button)
  must be reachable and operable by keyboard alone, with a visible focus
  ring matching the Focus states section above. Test with Tab and
  Enter/Space, no mouse.
- **No color-only encoding**: charts, legends, and grouped elements pair color
  with a shape, pattern, or label.
- **Respect `prefers-reduced-motion`**: anything that animates continuously
  (not a one-off transition on click) should check this media query and
  fall back to a static or instantly-updating state.
- **Theme toggle**: include the same `data-theme` + `localStorage` mechanism
  described in Light and dark, so opening a demo feels identical to opening
  a real page, defaulting to dark.

Before calling a demo done: render it at 375px and at desktop width, in both
light and dark, and tab through every control checking that focus is visible
at each stop.

## Design standard

The bar for this site is macOS and iOS. Not "modern," not "clean," Apple
specifically. Read design/STANDARD.md before writing any markup or CSS, and
design/handoff-checklist.md before reporting anything as done. Both govern
every page and every demo. Correct but unusable is a failure here.
