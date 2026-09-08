# V6 Cloud Runtime

The V6 Testnet-10 transaction service runs in one short-lived Cloudflare
Container. The public Worker is the only public entry point. It forwards the
three V6 JSON routes to the container with the internal token and exposes the
durable state bridge through its Durable Object.

The container listens on `0.0.0.0` and `PORT` (8080 by default). It serves:

- `GET /health`, which reports process and queue state without opening RPC.
- `POST /api/v6/start`, `/api/v6/status`, and `/api/v6/action`, each with a
  JSON body no larger than 64 KiB.
- `GET /api/v6/events`, an authenticated Testnet-10 block stream limited to
  ten clients. Each stream closes after 60 seconds and can reconnect.

Every API request must carry `X-V6-Bridge-Token` with the value configured in
`V6_PROXY_TOKEN`. The header may contain an optional `Bearer ` prefix. The
container also accepts `Authorization: Bearer <token>` for direct smoke tests.
When `V6_PUBLIC_ORIGIN` is set, browser requests must have that exact Origin.
The container does not mount V5, faucet, static, or arbitrary proxy routes.

## State bridge

The container loads the complete shared record map once before admitting the
first API task:

```http
GET ${V6_STATE_BRIDGE_URL}
Authorization: Bearer ${V6_STATE_BRIDGE_TOKEN}
```

The Worker returns `{ "revision": 12, "records": { ... } }`. Each mutation
is sent as a full JSON snapshot using compare-and-swap:

```http
PUT ${V6_STATE_BRIDGE_URL}
Authorization: Bearer ${V6_STATE_BRIDGE_TOKEN}
Content-Type: application/json

{ "revision": 12, "records": { ... } }
```

The successful response is `{ "revision": 13 }`. The record map is capped at
16 MiB. Reads and writes are JSON-cloned, so an SDK object or caller cannot
mutate the cached snapshot through a returned reference. A conflict, timeout,
malformed response, or any other uncertain PUT poisons the container. It
retains the last known snapshot for diagnosis and refuses later work; no
automatic retry can create a second transaction after an unknown write.

The state map includes V6 sessions, the shared pending transaction lock,
budgets, transaction ownership, receipts, and recovery journals. The treasury
private key is never a record: it is read only from `V6_TREASURY_KEY` and held
in process memory. The key must be a freshly provisioned 32-byte Testnet-10
private key; the host never generates or uploads one.

## RPC and transaction boundary

Before a queued API task runs, the host connects to the configured
Testnet-10 WebSocket RPC and requires `networkId: testnet-10`, `isSynced: true`,
and `hasUtxoIndex: true`. It reads the treasury UTXO snapshot for the service.
The V5 service is instantiated only as V6's pinned protocol helper; no V5
route or faucet passthrough exists in this process.

V6Service must derive its actual transaction journal and run the native
Kaspa/SilverScript VM check. It writes the exact serialized transaction,
journal, reservation, and shared pending lock through the CAS bridge before
calling `submitTransaction`. If the bridge write is not confirmed, submission
is skipped. The container never bypasses the VM and never submits a replacement
transaction after an uncertain submission.

## Lease and shutdown

`V6_LEASE_DEADLINE_MS` is supplied by the Durable Object as an absolute
epoch-millisecond deadline. It must be no more than 30 minutes after process
start. The runtime stops accepting new work 30 seconds before that deadline,
drains the serial queue for at most 30 seconds, closes event streams, and
disconnects RPC by the deadline. For local tests, `V6_MAX_RUNTIME_MS` can set a
shorter limit; its default is 30 minutes. `SIGTERM` and `SIGINT` use the same
bounded drain path. A stopped process does not restart under its old lease.

The API queue is FIFO and serial with a maximum depth of 20 occupied slots.
Requests beyond that limit receive `429`. One `standard-1` instance is allowed
to run at a time (0.5 vCPU, 4 GiB memory, 8 GB disk), and it sleeps after 60
seconds without activity.

The Worker reserves at most 40 half-hour starts in a rolling 30-day window,
equivalent to at most 20 reserved container-hours. Every start counts even if
the process is idle, fails, or stops early; there are no refunds. The expiry
callback destroys a process that is still running. A first visit can reserve a
lease through `POST /api/v6/start`. After sleep or expiry, `status` or `action`
can reserve a new lease only when the supplied browser session ID and capability
hash match a saved `v6:session` record. Invalid credentials and anonymous event
streams cannot reserve a lease. A restored `status` remains read-only: the host
may reconcile observed chain state with `allowBroadcast: false`, but does not
retry or submit a transaction.

The Worker also caps requests at 180 per IP per minute, 600 globally per minute,
6,000 globally per day, and 1,000 per saved session per day. The recorded
658.6-second browser run used 73 requests (24 actions, 46 status polls, and three
event streams), so the session allowance leaves room for a slower complete tour
and reload recovery. Budget storage or client-IP failures close the API rather
than bypassing the limits. Cloudflare Worker observability is disabled in the
deployment configuration.

These controls bound this application's use. They are not a Cloudflare account
billing cap, spending limit, or guarantee that other Workers and Containers on
the account cannot incur charges.

The browser opens no API or block stream on the welcome screen or when restoring
a completed tour. Hidden tabs pause status polling and block streams. Visible
tabs also pause after five minutes without a guide action, including when a
transaction remains pending. Returning to an incomplete tour or using its saved
transaction control resumes reconciliation. The saved request and transaction
journal remain intact; an already-authorized finite setup queue can finish.
Stream errors close the connection before a controlled retry, with delays from
two seconds up to one minute inside the same activity window.

## Required runtime configuration

```text
V6_TREASURY_KEY       fresh 64-hex-character Testnet-10 private key
V6_PROXY_TOKEN        Worker-to-container token
V6_STATE_BRIDGE_URL   Worker Durable Object state endpoint
V6_STATE_BRIDGE_TOKEN state bridge token
V6_PUBLIC_ORIGIN      exact public browser origin
V6_RPC_URL            optional Testnet-10 WebSocket RPC URL
V6_LEASE_DEADLINE_MS  optional absolute deadline from the Durable Object
V6_MAX_RUNTIME_MS     optional shorter test limit
```

No secret is logged, returned in a response, or persisted in the state bridge.
