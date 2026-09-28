# Kaspa Explained deployment

Prepared September 28, 2026 for a source-driven release that preserves unknown
production assets.

## Current release path

Production contains assets from later API releases whose complete asset path
list is unavailable. A normal `wrangler deploy` from `dist/` would replace that
asset set. Use the preserved-assets release helper until the full production
asset inventory is known and recovered. The helper uploads every tracked text
asset, the EPUB whose current endpoint comes from a Worker module, and binary
assets whose bytes differ from production. A text file may look unchanged on
the public site while its bytes actually come from the outgoing Worker, so it
must be included again. Cloudflare's `keep_assets: true` retains all current
assets, including unlinked paths we cannot enumerate. It also keeps existing
secret bindings. The Worker uses those staged modules for exact path overrides
and falls through to the retained asset binding for every other path.

The owner withdrew the interactive Instrument explainer on September 28.
`/the-instrument` and its HTML and directory variants redirect to `/moose`.
The tracked HTML is a redirect stub; the original remains in Git history.
Keep `the-instrument.pdf` available. Do not restore the interactive explainer
without a new explicit request. `scripts/build-static-dist.py` includes five explicitly
advertised source resources: `agent-index.json`, `site-manifest.json`,
`CONTENT_BRIEF.md`, `README.md`, and `CLAIMS.yml`. As observed before this
release on September 28, these returned 404 despite their sitemap or
`llms.txt` listings. The build does not publish internal files such as
`AGENTS.md` or `.github/`.

After source changes are reviewed and the applicable site checks pass:

1. Identify the currently deployed Cloudflare version ID. Pass it explicitly
   to the prepare command. The command stops if production has changed.
2. Run `python3 scripts/preserved-assets-release.py prepare --expected-version VERSION --output /private/tmp/kaspa-reviewed-release`. This rebuilds `dist/`, checks the public file contract, compares every built path with the live custom domain, and writes a staged Worker bundle plus `report.json`.
3. Inspect `report.json` and the exact changed source files. Run
   `node scripts/check-preserved-release.mjs /private/tmp/kaspa-reviewed-release`.
   The check covers staged bytes, response types, HEAD and EPUB download
   headers, the old PDF redirect, and fallback to retained assets. Run
   `python3 scripts/preserved-assets-release.py verify --stage /private/tmp/kaspa-reviewed-release`
   to check that source, staged bytes, and production version still match.
4. Commit and push the reviewed source. The push alone does not publish the
   site. If any source changed since preparation, prepare again.
5. Run `python3 scripts/preserved-assets-release.py deploy --stage /private/tmp/kaspa-reviewed-release` only for the approved release. It checks the
   expected production version and every staged/source hash again before the
   API upload. It does not replace the existing asset set.
6. Verify the changed custom-domain pages, downloadable bytes, response
   headers, and the withdrawn Instrument redirect plus representative retained
   routes after deployment.

The release helper uses the existing authorized Wrangler OAuth login without
printing its token. Do not put the token in commands or review files. The
staged bundle is generated output, not source to commit. A partial release is
the safe path while the production asset inventory is incomplete.

## Earlier release history

The September 25 audiobook and September 27 EPUB releases used Worker code
injection plus `keep_assets: true` to avoid replacing the production-only
Instrument. The source Moose page now has both links, so the release helper
serves that reviewed HTML directly. The EPUB remains a forced module override
to preserve its media type and attachment filename until a full static-asset
deployment is independently verified.

Cloudflare Worker `kaspa-explained` serves `dist/` at `kaspaexplained.com` and `www.kaspaexplained.com`. This is the current production host, superseding older GitHub Pages instructions elsewhere in the repository.

## GitHub automation boundary

Commit `2f46054` disabled the push trigger in `.github/workflows/deploy-cloudflare.yml`. The workflow currently supports manual dispatch only; its comment records a missing `CLOUDFLARE_API_TOKEN` repository secret. The secret was not independently enumerated during this release. A separate Cloudflare GitHub build connection was not verified: the browser dashboard required sign-in. Do not assume a GitHub push alone publishes the site or assert that no separate connection exists.

The September 21 release used the authenticated local Wrangler path successfully, with source commit `c29ba1f` and Cloudflare version `a7db107d-92b5-48d3-8111-93d6925fa52c`. The live page, supplied PDF bytes, unchanged Instrument PDF, and old-book redirect were verified. Full Wrangler asset replacement is suspended until the later production-only asset set is recovered.

## Release check boundary

The September 21 unmodified full gate failed on the pre-existing Argent `recheck_after: 2026-09-20`. That book-only release explicitly excepted the unrelated freshness failure without changing claim dates or repository checks. Re-run the current gate for each new release and report its actual result.
