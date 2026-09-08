# Local education redesign acceptance

8 September 2026. Local review at `http://127.0.0.1:8915/`; no publication, push or deployment.

The homepage introduces Kaspa, offers a four-part route through network ordering, payments, spending conditions and tradeoffs, and links to the local six-chapter Sprout Harbor workshop. Its diagrams are labeled illustrations. The workshop uses demonstration accounts and Testnet coins; its physical goods remain illustrations of ledger results.

Editorial pages share paper and green colors, readable type, responsive navigation, dark appearance, source links and an optional return-to-reading link. Four optional reasoning checks give immediate explanations without scoring or blocking navigation. The full network model lives in its explanation and the playground. Guided actions bring the model into view on desktop as well as phone.

## Verification

- `npm run check`: 57 tests passed, including models, payment accounting, recovery and generated routes.
- `npm run check:guided`: every existing model walkthrough completed; monetary payout and conditional group results passed; 120 viewport/theme states passed. The same run exercised all four new reasoning checks, keyboard activation, explanation disclosure, reading continuity and search.
- Standalone education build: 15 pages and 78 compatibility routes. Full local build: 20 pages and 87 compatibility routes.
- Release artifact and historical-link checks passed. Both Moose books, author attribution and existing section destinations remain present.
- Built phone checks at 390 × 844 confirm that monetary payout and group results remain visible with Continue. Enlarged text at 200% wraps the header without overlap. Menu Enter/Escape and focus return passed.
- The coordinator directly inspected the homepage and first lesson in the local browser and replayed the first lesson action after the scrolling correction.

Evidence is in `.cache/visual-review/education-guides/report.json` and `.cache/site-redesign-qa/` (`model-results.json`, `final-header.json` and screenshots). These are local browser and emulated viewport checks, not physical-device measurements.

V6 protocol and funded-browser acceptance are tracked separately in `docs/v6-local-acceptance.md`. Education-page checks do not establish completion of that transaction journey.
