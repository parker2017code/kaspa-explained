# Isolated Studio runtime

Build from the repository root, using its `.dockerignore`:

```sh
docker build --platform linux/amd64 -f developer-workbench/runtime/Dockerfile --target verify .
docker build --platform linux/amd64 -f developer-workbench/runtime/Dockerfile --target runtime -t kaspa-studio .
docker run --rm -p 8930:8930 -e WORKBENCH_PUBLIC_ORIGIN=https://kaspaexplained.com -e WORKBENCH_LEASE_EXPIRES_AT="$(node -p 'Date.now()+300000')" kaspa-studio
```

The PID 1 supervisor requires WORKBENCH_LEASE_EXPIRES_AT to be a prepaid absolute deadline no more than five minutes ahead. At expiry it kills the entire server process group, including native child tools, then exits. Synchronous proof work cannot block this independent supervisor. The Worker must prepay each lease before starting the container and destroy it at the same deadline. No outbound Internet is required in runtime. The filesystem contains prebuilt executables, public artifacts and notices; Cargo, build dependency caches, Git history and existing wallet services are excluded. A build-generated Argent revision and SHA-256 manifest verifies the shipped compiler without Git.

The public Worker routes `/studio/api/*` to this singleton and strips `/studio`; the service expects root `/api/*` paths and an exact `Host: kaspaexplained.com`. POST `Origin`, when present, must equal `https://kaspaexplained.com`. The Worker must enforce same-origin access, body limits, request budgets and a persistent prepaid runtime allowance. Public mode disables this service's faucet proxy. Wallet keys, signing, balance queries and transaction submission stay in the visitor's browser. There are no real-wallet files or existing V5/V6 service modules in the runtime.

The API accepts only bounded fields for five built-in examples and named reviewed Argent sources. It cannot execute supplied source, commands or paths. Heavy requests need Worker concurrency and rate limits. Operations can last up to 120 seconds; the upstream timeout must allow that. Health is `/api/health`. No private credential is required.

The build fetches SDK/compiler archives through the existing pinned-hash setup, checks exact SilverScript and Argent source revisions, then builds the native VM adapter, Argent compiler and proof generator. Runtime validation executes the standalone VM test binary directly; no Cargo compiler or dependency cache is shipped. The exported starter stays offline and includes public sources, tool binaries, dependency notices and fixture tests.

Verification runs against the stripped runtime filesystem as the unprivileged service user, including positive/negative native VM checks, export extraction/startup, and browser-wallet engine tests with controlled RPC. A Linux build and deployed endpoint checks are still required before claiming production readiness. CI also loads the verified runtime and executes all five presets, all five reviewed Argent sources and a proof ZIP export with no network, a 1 GiB memory limit, no swap and one CPU. It reports the Linux cgroup memory peak, including native children and charged filesystem cache, before publishing. Until that gate succeeds, 1 GiB remains an unverified deployment size. The Worker must serialize expensive requests; this measurement does not cover simultaneous workloads.
