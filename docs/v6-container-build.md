# V6 container build

The manual **Build V6 container** GitHub Actions workflow builds Linux/amd64 on a standard Ubuntu runner and publishes to `ghcr.io/parker2017code/kaspa-explained-v6`. It does not deploy Pages, Workers, or Containers. Cloudflare remains the hosting destination.

## Build and hand off

1. Integrate the reviewed source and push the commit. The workflow must be present on the default branch before GitHub exposes its manual dispatch button.
2. In Actions, select **Build V6 container**, then **Run workflow** and the reviewed branch/ref. Checkout uses the event's exact commit SHA, even if the branch moves afterward.
3. Confirm input checks and the Dockerfile `verify` target pass. Verification must execute the V6 service/network/proof tests and synthetic protocol journey using the Linux native VM and prover. These tests use synthetic keys and RPC; they do not fund accounts or broadcast to Testnet.
4. Copy the successful job summary's `ghcr.io/parker2017code/kaspa-explained-v6@sha256:…` reference into the separately reviewed Cloudflare deployment configuration. The full-commit tag is convenient for lookup; the digest is the immutable identity. Rebuilding the same commit can change its digest when base images or system packages change.
5. Verify the hosted service and complete the real browser journey separately. A successful container build is not hosted acceptance evidence.

There are no workflow secret inputs. The job uses its short-lived `GITHUB_TOKEN` with `contents: read` and `packages: write` only for repository checkout and registry authentication. Signer keys are injected by Cloudflare at runtime, never passed as build arguments or included in the context. For a public pull path, confirm the GHCR package visibility is public after first publication; repository visibility does not automatically make a newly created package public.

## Build contract

`Dockerfile.v6` supplies `verify` and `runtime` targets. The workflow builds verification first and only publishes the runtime target after it succeeds. Both use the same checkout and Linux/amd64 platform. Native source downloads must verify the exact SilverScript revision; SDK/compiler archives retain SHA-256 checks; Cargo uses lockfiles. `node scripts/check-v6-image-inputs.mjs` checks these packaging requirements without reading private wallet files or making network requests.

The Docker context excludes `.local`, `.cache`, `.git`, `.wrangler`, environment files, local dependencies, generated website output, and Rust `target` directories. Dependencies and native executables are rebuilt inside Linux. BuildKit retains reusable layers in the single `v6-linux-amd64` Actions cache scope; a cold Rust build can take substantially longer than a cached build. The job stops after 120 minutes and does not run automatically on pushes or pull requests.

Provenance and SBOM attestations accompany the published image. Build arguments are visible in provenance, which is another reason to keep credentials entirely out of the build. Docker build-record artifact upload is disabled; the digest remains in the job summary.

## Source packaging review

Use a reviewed explicit file list rather than adding the whole working tree. Existing tracked dependencies remain necessary, including the root PDFs, images and licenses, `src/vendor`, existing contract sources, and `docs/wrap-poc-roundtrip-verification.json` consumed by the site build.

The new V6 artifact also depends on V5 protocol/service modules and their generated templates. Include the reviewed new `src/v5-*`, `src/v5.css`, `src/v6-*`, `src/v6.css`, `src/assets/v6`, `faucet/v5-*.mjs`, `server/v5-local.mjs`, `server/v6-*.mjs`, relevant `contracts/public/argent-market` and `contracts/public/v6-proof` source/artifacts, and the site redesign modules imported by the current site build. Include the Linux setup/check scripts and tests referenced by the Dockerfile. Cloudflare runtime/Worker configuration is a separate part of the same release, owned by the hosting change.

For `scripts/v6-proof-prover`, include **only** `Cargo.toml`, `Cargo.lock`, `src/lib.rs`, and `src/main.rs`. Its `target` tree contains local native build output and must never be staged with a broad directory add.

The dirty `.githooks/pre-commit`, design histories, research notes, browser screenshots/reports, and unrelated V4 verification documents are not image inputs merely because they exist in the checkout. Review workflow changes and release documentation separately; do not clean or stage unrelated changes as part of container packaging.

## Cost and references

Standard GitHub-hosted runner minutes are free for public repositories. This workflow uses a standard Ubuntu runner. Artifact/cache limits still apply, and increasing paid storage limits can incur charges; this workflow does not change those limits. Cloudflare hosting charges are separate. See [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions), [GitHub Container Registry authentication and visibility](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry), [Docker's Actions cache](https://docs.docker.com/build/cache/backends/gha/), and [Docker provenance and SBOM guidance](https://docs.docker.com/build/ci/github-actions/attestations/).
