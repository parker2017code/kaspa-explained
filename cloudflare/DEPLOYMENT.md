# Kaspa Explained deployment

Verified September 21, 2026 while publishing Moose's updated book.

## Production divergence found September 25, 2026

Do not deploy a full asset rebuild from this checkout until production assets
have been reconciled. GitHub `main` was `78d6ba9`, but Cloudflare had two later
API deployments, most recently `4e152e65-c506-461d-bd22-97e9a4e2034b`.
The live `/the-instrument` contains a self-contained interactive page; the
tracked `the-instrument.html` is an older redirect. Of 175 built files checked,
174 matched production bytes and this one differed. That comparison does not
enumerate additional production-only paths.

The September 25 audiobook release therefore updates Worker code with
Cloudflare's `keep_assets: true`, preserving the complete existing asset set
and secret bindings. The Worker adds the reviewed audiobook link only to the
older Moose HTML and leaves HTML that already contains the link unchanged.
`moose.html` also contains the link for a future reconciled full build.

The full gate currently stops at the unrelated stale
`l1_status_snapshot.recheck_after: 2026-09-21`. This scoped release uses the
passing HTML, copy, generated-index, sitemap, Worker behavior, and rendered
Moose-page checks; it does not claim that the full gate passed or refresh
unrelated protocol claims.

## Working release path

1. Work from current `origin/main` in a clean checkout and run the applicable checks.
2. Commit and push the reviewed change to GitHub `main`. A push is not proof of deployment.
3. Run `python3 scripts/build-static-dist.py` from the repository root.
4. Run `npx --yes wrangler@4.131.2 deploy --config cloudflare/wrangler.jsonc` using the existing authorized Cloudflare login.
5. Verify the custom-domain HTML and downloads, not only Wrangler's success output.

Cloudflare Worker `kaspa-explained` serves `dist/` at `kaspaexplained.com` and `www.kaspaexplained.com`. This is the current production host, superseding older GitHub Pages instructions elsewhere in the repository.

## GitHub automation boundary

Commit `2f46054` disabled the push trigger in `.github/workflows/deploy-cloudflare.yml`. The workflow currently supports manual dispatch only; its comment records a missing `CLOUDFLARE_API_TOKEN` repository secret. The secret was not independently enumerated during this release. A separate Cloudflare GitHub build connection was not verified: the browser dashboard required sign-in. Do not assume a GitHub push alone publishes the site or assert that no separate connection exists.

The September 21 release used the authenticated local Wrangler path successfully, with source commit `c29ba1f` and Cloudflare version `a7db107d-92b5-48d3-8111-93d6925fa52c`. The live page, supplied PDF bytes, unchanged Instrument PDF, and old-book redirect were verified.

## Release check boundary

The unmodified full gate failed on the pre-existing Argent `recheck_after: 2026-09-20`. The book-only release explicitly excepted that unrelated freshness failure without changing claim dates or repository checks. Remaining gates passed, including 60 rendered broken-link/blank-content checks. This does not mean the unmodified full gate passed.
