import init, {
  Keypair,
  PrivateKey,
  Resolver,
  RpcClient,
  kaspaToSompi,
  sompiToKaspaString,
  createTransactions,
  version,
  sha256FromText,
} from "./sdk/kaspa/kaspa.js";

// Shared on-chain task board. Anyone can post a task, anyone can claim an
// open task, and whoever claimed it can mark it complete. There is no
// database and no server holding "the real state": every reader (including
// this page) computes the board by fetching one well-known shared address's
// full transaction history and replaying task:1:new / task:1:claim /
// task:1:done events in chain order. Same "based app" pattern the builder
// guide describes: richer app state anchored to Kaspa ordering, computed by
// deterministic replay over accepted transactions instead of stored
// anywhere off-chain.
//
// The claim/complete gating this page applies (only claim what's open, only
// complete what you claimed) is this UI's own courtesy policy, not a
// protocol rule. Nothing on-chain stops another wallet from broadcasting its
// own claim/done event for the same task id; this page just chooses not to
// offer that button. Said plainly in the "How this board works" panel too,
// not just here.

const NETWORK_ID = "testnet-10";
const REST_BASE = "https://api-tn10.kaspa.org";
const STORAGE_KEY = "kaspaexplained-tn10-board-wallet";
const BOARD_SEED = "kaspaexplained-tn10-board:v1";
const BOARD_DUST = 20000000n; // 0.2 tKAS carrier amount, same value wallet.js uses for its message/announce txs

const NEW_PREFIX = "task:1:new:";
const CLAIM_PREFIX = "task:1:claim:";
const DONE_PREFIX = "task:1:done:";

let rpc = null;
let walletPrivKeyHex = null;
let BOARD_ADDRESS = null; // set in boot() once the WASM module is initialized
let currentTasks = []; // last replayed board state, cached so click handlers can re-check status right before building a tx

const $ = (sel) => document.querySelector(sel);
const logEl = $("#log");

function log(msg) {
  const t = new Date().toISOString().split("T")[1].replace("Z", "");
  logEl.textContent += `[${t}] ${msg}\n`;
  logEl.scrollTop = logEl.scrollHeight;
  console.log(msg);
}

function textToPayloadBytes(text) {
  return new TextEncoder().encode(text);
}

function payloadHexToText(hex) {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
  return new TextDecoder().decode(bytes);
}

function safePayloadText(hex) {
  try {
    return payloadHexToText(hex);
  } catch {
    return null;
  }
}

// ---- Wallet ----
// This page has its own single localStorage wallet, separate from the main
// experiment page's multi-wallet key ("kaspaexplained-tn10-experiment-wallets").
// Generated once on first visit, then reused.

function loadOrCreateWallet() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      walletPrivKeyHex = stored;
      return;
    }
  } catch {
    // localStorage unavailable (e.g. private browsing); fall through to an in-memory wallet
  }
  const kp = Keypair.random();
  walletPrivKeyHex = kp.privateKey;
  try {
    localStorage.setItem(STORAGE_KEY, walletPrivKeyHex);
  } catch {
    // ignore write failures; wallet still works for this session, just won't persist
  }
}

function addressFor() {
  return new PrivateKey(walletPrivKeyHex).toAddress(NETWORK_ID).toString();
}

function renderWallet() {
  const address = addressFor();
  $("#address").textContent = address;
  $("#privkey").textContent = walletPrivKeyHex;
  if (rpc) refreshBalance();
  else $("#balance").textContent = "connecting…";
}

// ---- RPC ----

async function connectRpc() {
  rpc = new RpcClient({ resolver: new Resolver(), networkId: NETWORK_ID });
  rpc.addEventListener("disconnect", () => log("RPC disconnected, will reconnect on next request"));
  rpc.addEventListener("connect", () => log(`RPC (re)connected -> ${rpc.url || "resolved node"}`));
  await rpc.connect();
  const info = await rpc.getServerInfo();
  log(
    `RPC connected via public resolver -> node ${info.serverVersion}, network ${info.networkId}, synced=${info.isSynced}, utxoIndex=${info.hasUtxoIndex}, virtualDaa=${info.virtualDaaScore}`
  );
}

// The public-resolver websocket can drop between UI actions. Every call site
// that touches rpc goes through this first instead of assuming the earlier
// connect() still holds. Copied from wallet.js, which hit a real "WebSocket
// is not connected" race from the resolver's websocket dropping mid-session.
async function ensureConnected() {
  if (rpc && rpc.isConnected) return;
  log("RPC not connected, reconnecting…");
  if (!rpc) {
    await connectRpc();
    return;
  }
  await rpc.connect();
}

async function refreshBalance() {
  const address = addressFor();
  $("#balance").textContent = "loading…";
  try {
    await ensureConnected();
    const res = await rpc.getBalanceByAddress({ address });
    $("#balance").textContent = `${sompiToKaspaString(res.balance)} tKAS`;
    log(`balance(${address.slice(0, 14)}…) = ${res.balance} sompi`);
  } catch (e) {
    $("#balance").textContent = "error";
    log(`balance query failed: ${e}`);
  }
}

async function fetchAcceptance(txid, attempts = 6) {
  for (let i = 0; i < attempts; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const res = await fetch(`${REST_BASE}/transactions/${txid}`);
      if (res.ok) {
        const json = await res.json();
        if (json.is_accepted !== undefined) {
          return json;
        }
      }
    } catch {
      // keep polling
    }
  }
  return null;
}

// Shared build -> sign -> submit -> verify-acceptance path for every board
// event (post/claim/done). All board txs carry BOARD_DUST to BOARD_ADDRESS
// with an event payload; there's no user-adjustable amount here (unlike
// wallet.js's plain Send form), so no separate send cap is needed.
async function buildSignSubmit({ payloadBytes, statusEl }) {
  const address = addressFor();
  const privateKey = new PrivateKey(walletPrivKeyHex);

  await ensureConnected();
  statusEl.className = "status";
  statusEl.textContent = "fetching UTXOs…";
  const { entries } = await rpc.getUtxosByAddresses([address]);
  if (entries.length === 0) throw new Error("no spendable UTXOs on this wallet");

  statusEl.textContent = "building transaction…";
  const settings = {
    outputs: [{ address: BOARD_ADDRESS, amount: BOARD_DUST }],
    changeAddress: address,
    priorityFee: 0n,
    entries,
    networkId: NETWORK_ID,
    payload: payloadBytes,
  };

  const { transactions, summary } = await createTransactions(settings);
  log(`generator summary: ${JSON.stringify(summary, (_, v) => (typeof v === "bigint" ? v.toString() : v))}`);

  let lastTxid = null;
  for (const tx of transactions) {
    tx.sign([privateKey]);
    lastTxid = await tx.submit(rpc);
    log(
      `submitted -> txid ${lastTxid} | sdk kaspa-wasm ${version()} | network ${NETWORK_ID} | endpoint via Resolver | payload=${payloadBytes.length}B | changeAddress ${address}`
    );
  }

  statusEl.className = "status";
  statusEl.textContent = `submitted, txid ${lastTxid}\nwaiting for accepted-transaction evidence (not trusting local submit alone)…`;

  const accepted = await fetchAcceptance(lastTxid);
  if (accepted) {
    statusEl.className = "status ok";
    statusEl.textContent = `txid ${lastTxid}\naccepted: ${accepted.is_accepted}\nblock: ${accepted.accepting_block_hash || "n/a"}`;
    log(`acceptance check via REST: is_accepted=${accepted.is_accepted}`);
  } else {
    statusEl.className = "status err";
    statusEl.textContent = `txid ${lastTxid}\nsubmitted, but acceptance not confirmed yet via REST after polling. Check manually.`;
    log(`acceptance check timed out for ${lastTxid}`);
  }

  refreshBalance();
  return { txid: lastTxid, accepted };
}

// ---- Task actions ----

function findTask(taskId) {
  return currentTasks.find((t) => t.id === taskId);
}

async function postTask() {
  const title = $("#taskTitle").value.trim();
  const statusEl = $("#postStatus");
  statusEl.className = "status";
  statusEl.textContent = "";
  if (!title) {
    statusEl.className = "status err";
    statusEl.textContent = "task title is empty";
    return;
  }
  const address = addressFor();
  try {
    const payload = textToPayloadBytes(`${NEW_PREFIX}${address}:${title}`);
    await buildSignSubmit({ payloadBytes: payload, statusEl });
    $("#taskTitle").value = "";
    loadBoard();
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = String(e);
    log(`post task failed: ${e}`);
  }
}

async function claimTask(taskId) {
  const statusEl = $("#boardStatus");
  statusEl.className = "status";
  statusEl.textContent = "";
  // Client-side-only guard: re-check the last replayed state right before
  // building the tx, since a render can go stale between page load and
  // click. This is UI guidance, not enforcement, see the "How this board
  // works" panel copy for why.
  const task = findTask(taskId);
  if (!task || task.status !== "open") {
    statusEl.className = "status err";
    statusEl.textContent = "this task is no longer open (someone may have already claimed it), refresh the board and try again";
    return;
  }
  const address = addressFor();
  try {
    statusEl.textContent = `claiming ${taskId.slice(0, 12)}…`;
    const payload = textToPayloadBytes(`${CLAIM_PREFIX}${taskId}:${address}`);
    await buildSignSubmit({ payloadBytes: payload, statusEl });
    loadBoard();
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = String(e);
    log(`claim failed: ${e}`);
  }
}

async function completeTask(taskId) {
  const statusEl = $("#boardStatus");
  statusEl.className = "status";
  statusEl.textContent = "";
  const address = addressFor();
  const task = findTask(taskId);
  if (!task || task.status !== "claimed" || task.claimer !== address) {
    statusEl.className = "status err";
    statusEl.textContent = "you can only mark complete a task the replayed board state shows you as the claimer of, refresh and try again";
    return;
  }
  try {
    statusEl.textContent = `marking ${taskId.slice(0, 12)}… complete`;
    const payload = textToPayloadBytes(`${DONE_PREFIX}${taskId}:${address}`);
    await buildSignSubmit({ payloadBytes: payload, statusEl });
    loadBoard();
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = String(e);
    log(`complete failed: ${e}`);
  }
}

// ---- Read + replay ----

async function fetchBoardTransactions() {
  const res = await fetch(`${REST_BASE}/addresses/${BOARD_ADDRESS}/full-transactions?limit=100`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

// Pure function: raw REST transaction list in, replayed task list out. Sorts
// by block_time ascending and folds task:1:new/claim/done events into a Map
// keyed by the "new" event's own txid (the task id everyone references
// afterward). Same fixed-prefix colon-skip fix wallet.js uses for its
// feed/room parsing: an embedded "kaspatest:..." address has its own colon,
// so a naive indexOf(":") split breaks on it. The status checks below are
// the "ignore as a no-op if the transition isn't valid against current
// state" replay guard: a stray claim/done for an unknown or already-settled
// task just doesn't apply.
function replayBoard(txs) {
  const relevant = txs
    .filter((tx) => tx.payload)
    .filter((tx) => tx.outputs.some((o) => o.script_public_key_address === BOARD_ADDRESS))
    .map((tx) => ({ tx, text: safePayloadText(tx.payload) }))
    .filter(
      (x) => x.text && (x.text.startsWith(NEW_PREFIX) || x.text.startsWith(CLAIM_PREFIX) || x.text.startsWith(DONE_PREFIX))
    )
    .sort((a, b) => Number(a.tx.block_time || 0) - Number(b.tx.block_time || 0));

  const tasks = new Map(); // txid -> { id, poster, title, status, claimer, time }

  for (const { tx, text } of relevant) {
    const txid = tx.transaction_id;
    const time = Number(tx.block_time || 0);

    if (text.startsWith(NEW_PREFIX)) {
      const rest = text.slice(NEW_PREFIX.length);
      // rest starts with a full "kaspatest:..." poster address, which has
      // its own colon, so skip past that fixed prefix before splitting.
      const sep = rest.indexOf(":", "kaspatest:".length);
      if (sep === -1) continue;
      const poster = rest.slice(0, sep);
      const title = rest.slice(sep + 1);
      if (!title || tasks.has(txid)) continue;
      tasks.set(txid, { id: txid, poster, title, status: "open", claimer: null, time });
    } else if (text.startsWith(CLAIM_PREFIX)) {
      const rest = text.slice(CLAIM_PREFIX.length);
      // taskTxid is plain hex (no colon), so the first colon reliably
      // separates it from the trailing claimer address.
      const sep = rest.indexOf(":");
      if (sep === -1) continue;
      const taskTxid = rest.slice(0, sep);
      const claimer = rest.slice(sep + 1);
      const task = tasks.get(taskTxid);
      if (!task || task.status !== "open") continue; // no-op: unknown task, or already claimed/completed
      task.status = "claimed";
      task.claimer = claimer;
    } else if (text.startsWith(DONE_PREFIX)) {
      const rest = text.slice(DONE_PREFIX.length);
      const sep = rest.indexOf(":");
      if (sep === -1) continue;
      const taskTxid = rest.slice(0, sep);
      const completer = rest.slice(sep + 1);
      const task = tasks.get(taskTxid);
      if (!task || task.status !== "claimed" || task.claimer !== completer) continue; // no-op: only the current claimer can complete
      task.status = "completed";
    }
  }

  return Array.from(tasks.values()).sort((a, b) => b.time - a.time);
}

async function loadBoard() {
  try {
    const txs = await fetchBoardTransactions();
    currentTasks = replayBoard(txs);
    renderColumns();
    log(`board: replayed ${currentTasks.length} task(s) from ${txs.length} transaction(s) on ${BOARD_ADDRESS.slice(0, 14)}…`);
  } catch (e) {
    $("#openTable tbody").innerHTML = `<tr><td colspan="3">error: ${e}</td></tr>`;
    $("#claimedTable tbody").innerHTML = `<tr><td colspan="4">error: ${e}</td></tr>`;
    $("#completedTable tbody").innerHTML = `<tr><td colspan="3">error: ${e}</td></tr>`;
    log(`board load failed: ${e}`);
  }
}

function shortAddr(addr) {
  return `${addr.slice(0, 18)}…`;
}

function td(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function addrTd(fullAddress) {
  const cell = document.createElement("td");
  cell.textContent = shortAddr(fullAddress);
  cell.title = fullAddress;
  return cell;
}

function renderColumns() {
  const myAddress = addressFor();
  const open = currentTasks.filter((t) => t.status === "open");
  const claimed = currentTasks.filter((t) => t.status === "claimed");
  const completed = currentTasks.filter((t) => t.status === "completed");

  renderOpenTable(open);
  renderClaimedTable(claimed, myAddress);
  renderCompletedTable(completed);
}

function renderOpenTable(tasks) {
  const tbody = $("#openTable tbody");
  if (tasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3">no open tasks</td></tr>`;
    return;
  }
  tbody.innerHTML = "";
  for (const t of tasks) {
    const tr = document.createElement("tr");
    tr.appendChild(td(t.title));
    tr.appendChild(addrTd(t.poster));
    const actionTd = document.createElement("td");
    const btn = document.createElement("button");
    btn.className = "button primary";
    btn.textContent = "Claim";
    btn.addEventListener("click", () => claimTask(t.id));
    actionTd.appendChild(btn);
    tr.appendChild(actionTd);
    tbody.appendChild(tr);
  }
}

function renderClaimedTable(tasks, myAddress) {
  const tbody = $("#claimedTable tbody");
  if (tasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">no claimed tasks</td></tr>`;
    return;
  }
  tbody.innerHTML = "";
  for (const t of tasks) {
    const tr = document.createElement("tr");
    tr.appendChild(td(t.title));
    tr.appendChild(addrTd(t.poster));
    if (t.claimer === myAddress) {
      const meTd = document.createElement("td");
      meTd.textContent = "you";
      meTd.title = t.claimer;
      tr.appendChild(meTd);
    } else {
      tr.appendChild(addrTd(t.claimer));
    }
    const actionTd = document.createElement("td");
    if (t.claimer === myAddress) {
      const btn = document.createElement("button");
      btn.className = "button primary";
      btn.textContent = "Mark complete";
      btn.addEventListener("click", () => completeTask(t.id));
      actionTd.appendChild(btn);
    } else {
      actionTd.textContent = "-";
    }
    tr.appendChild(actionTd);
    tbody.appendChild(tr);
  }
}

function renderCompletedTable(tasks) {
  const tbody = $("#completedTable tbody");
  if (tasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3">no completed tasks</td></tr>`;
    return;
  }
  tbody.innerHTML = "";
  for (const t of tasks) {
    const tr = document.createElement("tr");
    tr.appendChild(td(t.title));
    tr.appendChild(addrTd(t.poster));
    tr.appendChild(addrTd(t.claimer));
    tbody.appendChild(tr);
  }
}

// ---- Boot ----

function bindUI() {
  $("#btnRefreshBalance").addEventListener("click", refreshBalance);
  $("#btnPostTask").addEventListener("click", postTask);
  $("#btnRefreshBoard").addEventListener("click", loadBoard);

  document.querySelectorAll(".copy").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.dataset.copy);
      navigator.clipboard.writeText(target.textContent);
      btn.textContent = "copied";
      setTimeout(() => (btn.textContent = "copy"), 1000);
    });
  });
}

async function boot() {
  log("loading kaspa-wasm SDK (v2.0.1, official rusty-kaspa browser build)…");
  await init();
  log(`SDK ready, kaspa-wasm version ${version()}`);
  // BOARD_ADDRESS depends on sha256FromText/PrivateKey, both WASM-backed
  // calls that only work after init() resolves, so this can't be a
  // top-level const. Same reason wallet.js computes FEED_ADDRESS inside
  // boot() rather than at module load time.
  BOARD_ADDRESS = new PrivateKey(sha256FromText(BOARD_SEED)).toAddress(NETWORK_ID).toString();
  $("#boardAddress").textContent = BOARD_ADDRESS;
  log(`board address: ${BOARD_ADDRESS}`);

  loadOrCreateWallet();
  bindUI();
  renderWallet();
  loadBoard();

  try {
    await connectRpc();
    refreshBalance();
  } catch (e) {
    log(`RPC connect failed: ${e}`);
  }
}

boot();
