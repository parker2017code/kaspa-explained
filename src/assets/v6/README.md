# V6 harbor art

`models/harbor.glb` is authored by `scripts/build-v6-assets.py` using Blender 5.2.1 LTS. Rebuild from the repository root with Blender background mode and that script. No downloaded art is included. Named roots: tool (axe), timber (logs), grain (wheat bundle), ore, parcel, coin, cart, pip, sprout, courier, machine. The library includes articulated child objects and an authored grasp action; the world uses bounded task poses to match accepted events.

The runtime is isolated from V4/V5. The `vendor` folder contains Three.js 0.180.0 and its matching glTF loader, with upstream license and source attribution. Copy this entire folder to `dist/assets/v6/` during the V6 build.

Acceptance: Chromium software-WebGL source fixture loaded with zero JavaScript errors; Exchange overview and roofless interior visually inspected. Full integrated chapter choreography and responsive browser checks belong to V6 application acceptance, not this asset check.

State checks (isolated Chromium fixture, 8 September 2026): pending purchase leaves cart unchanged; accepted purchase carries and leaves a tool; repeated event ID does not replay; restored accepted purchase has no motion; ring produces three simultaneous resource routes and persistent 3 crops / 1 tool / 2 ore destinations; greenhouse, refund and verified proof settle without browser errors. Pip allowance/revocation and courier receipt were rendered and inspected. A 390 × 480 scene, reduced-motion mode, and keyboard orbit/zoom were exercised. Captures and fixture runners are under `.cache/v6-qa/` (local evidence, not a release artifact). `npm run check` passed 57 tests before final visual iteration; the coordinator owns the final integrated suite.
