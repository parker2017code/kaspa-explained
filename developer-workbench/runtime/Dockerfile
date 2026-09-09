# syntax=docker/dockerfile:1.7
# Build with repository root as context. Root .dockerignore excludes all local
# wallets, caches, environment secrets and generated binaries.
FROM --platform=linux/amd64 node:22-bookworm AS native
ARG RUST_VERSION=1.94.0
ARG SILVERSCRIPT_REVISION=c7d17a15ac88610d013ec9ffffa9520aeb69929b
ARG ARGENT_REVISION=d08e52dd1e18c9f7e9a2dc482048c2db31d25611
ENV PATH=/root/.cargo/bin:$PATH CARGO_NET_GIT_FETCH_WITH_CLI=true CARGO_BUILD_JOBS=2 CARGO_PROFILE_DEV_DEBUG=0 CARGO_PROFILE_TEST_DEBUG=0
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl git build-essential pkg-config libssl-dev unzip zip clang libclang-dev protobuf-compiler libprotobuf-dev && rm -rf /var/lib/apt/lists/* \
 && curl --proto '=https' --tlsv1.2 -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain "${RUST_VERSION}"
COPY scripts ./scripts
COPY contracts/public ./contracts/public
COPY src ./src
COPY faucet/policy.mjs ./faucet/policy.mjs
COPY developer-workbench ./developer-workbench
COPY LICENSE.md THIRD_PARTY.md favicon.svg ./
COPY licenses ./licenses
RUN node scripts/setup-testnet.mjs \
 && git clone --filter=blob:none https://github.com/kaspanet/silverscript.git .cache/upstream/silverscript \
 && git -C .cache/upstream/silverscript checkout --detach "${SILVERSCRIPT_REVISION}" \
 && test "$(git -C .cache/upstream/silverscript rev-parse HEAD)" = "${SILVERSCRIPT_REVISION}" \
 && git clone --filter=blob:none https://github.com/argent-lang/argent.git .cache/upstream/argent \
 && git -C .cache/upstream/argent checkout --detach "${ARGENT_REVISION}" \
 && test "$(git -C .cache/upstream/argent rev-parse HEAD)" = "${ARGENT_REVISION}"
RUN cp developer-workbench/export-template/runner.rs .cache/upstream/silverscript/silverscript-lang/tests/kaspa_workbench.rs \
 && cargo test --manifest-path .cache/upstream/silverscript/Cargo.toml -p silverscript-lang --test kaspa_workbench --locked --no-run \
 && mkdir -p /opt/studio \
 && find .cache/upstream/silverscript/target/debug/deps -maxdepth 1 -type f -executable -name 'kaspa_workbench-*' -exec cp '{}' /opt/studio/vm \; \
 && test -x /opt/studio/vm
RUN cargo build --manifest-path .cache/upstream/argent/Cargo.toml --locked --bin argentc \
 && node scripts/setup-v6-proof.mjs \
 && node scripts/build-public-templates.mjs \
 && node developer-workbench/runtime/argent-build.mjs .cache/upstream/argent/target/debug/argentc "${ARGENT_REVISION}" /opt/studio/argent-build.json

FROM --platform=linux/amd64 node:22-bookworm-slim AS runtime-base
ENV NODE_ENV=production WORKBENCH_PORT=8930 WORKBENCH_VM_EXECUTABLE=/opt/studio/vm WORKBENCH_ARGENT_MANIFEST=/opt/studio/argent-build.json
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates zip && rm -rf /var/lib/apt/lists/* \
 && useradd --system --uid 10002 --create-home studio
COPY --from=native /opt/studio /opt/studio
COPY --from=native /app/developer-workbench ./developer-workbench
COPY --from=native /app/contracts/public ./contracts/public
COPY --from=native /app/src/public-contracts.mjs /app/src/public-receipt.mjs /app/src/public-asset-signing.mjs /app/src/public-acceptance.mjs /app/src/v6-browser-wallet.mjs /app/src/v5-argent-protocol.mjs /app/src/v6-proof-protocol.mjs /app/src/v6-proof-core.mjs /app/src/v5-argent-templates.json ./src/
COPY --from=native /app/faucet/policy.mjs ./faucet/policy.mjs
COPY --from=native /app/LICENSE.md /app/THIRD_PARTY.md /app/favicon.svg ./
COPY --from=native /app/licenses ./licenses
COPY --from=native /app/.cache/public-templates/templates.json ./.cache/public-templates/templates.json
COPY --from=native /app/.cache/upstream/kaspa-wasm32-sdk/nodejs/kaspa ./.cache/upstream/kaspa-wasm32-sdk/nodejs/kaspa
COPY --from=native /app/.cache/upstream/kaspa-wasm32-sdk/web/kaspa ./.cache/upstream/kaspa-wasm32-sdk/web/kaspa
COPY --from=native /app/.cache/upstream/silverc ./.cache/upstream/silverc
COPY --from=native /app/.cache/upstream/silverscript/LICENSE ./.cache/upstream/silverscript/LICENSE
COPY --from=native /app/.cache/upstream/argent/LICENSE ./.cache/upstream/argent/LICENSE
COPY --from=native /app/.cache/upstream/argent/target/debug/argentc ./.cache/upstream/argent/target/debug/argentc
COPY --from=native /app/scripts/v6-proof-prover/Cargo.toml /app/scripts/v6-proof-prover/Cargo.lock ./scripts/v6-proof-prover/
COPY --from=native /app/scripts/v6-proof-prover/src ./scripts/v6-proof-prover/src
COPY --from=native /app/scripts/v6-proof-prover/target/debug/v6-proof-prover ./scripts/v6-proof-prover/target/debug/v6-proof-prover
RUN mkdir -p .cache/workbench && chown studio:studio .cache/workbench \
 && chmod 755 /opt/studio/vm
USER studio
RUN node --input-type=module -e "await import('./developer-workbench/server.mjs')"
EXPOSE 8930
CMD ["node", "developer-workbench/runtime/start.mjs"]

# Verify the actual stripped filesystem and shared libraries, as the runtime user.
FROM runtime-base AS verify
USER root
RUN apt-get update && apt-get install -y --no-install-recommends unzip procps && rm -rf /var/lib/apt/lists/*
USER studio
RUN node --test developer-workbench/tests/*.test.mjs && touch /tmp/studio-verified

FROM runtime-base AS runtime
# This dependency makes a runtime build itself contingent on successful verification.
COPY --from=verify /tmp/studio-verified /opt/studio/verified
