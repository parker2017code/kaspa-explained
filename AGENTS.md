# Kaspa Explained

Build understanding through correct, inspectable interactions. Use concise language and keep technical depth accessible without making it mandatory.

- Work in this checkout; preserve unrelated changes.
- Source is in src/, server/, and contracts/. npm run build generates dist/. npm run serve starts the loopback preview.
- Run `npm run check` for source/build/test changes. Verify browser journeys when the touched surface is interactive, and network behavior when it changes network-facing logic. A build is not visual or protocol evidence.
- Keep proposals, compiler behavior, testnet acceptance, mainnet activation, and adoption distinct.
- Keep private wallet state and credentials out of Git. Testnet applications are unaudited and never intended for mainnet. Do not expose the local signer publicly.
- Preserve both Moose PDFs, author attribution, and useful historical URLs. Legacy HTML implementations may be replaced by generated pages and redirects.
- Use the global Astra Low coordinator / Sol Low helper policy. Delegate independent, bounded work with disjoint ownership; do not keep agents busy without useful parallel work. The coordinator owns architecture, integration and acceptance; follow the global model and fork-boundary instructions when assigning execution.
- V1 is standalone education; the current public build includes Sprout Harbor and Testnet applications. See RELEASE-CHECKLIST.md for unfinished release requirements. Do not publish an unfinished stage or claim unverified capabilities.
- The user authorized migration of the whole site to Cloudflare, with V5 and V6 available only through unlisted `/covenants/v5` and `/covenants/v6` links. Verify the complete deployed flows before reporting completion. Preserve `.local/v5-final`; never replace funded state to reset a test. The hosted V6 runtime uses a separate fresh Testnet-10 signer through the protected cloud host; never expose or upload the existing local signer. GitHub hosting is being retired; preserve source checks and reviewed container builds.
