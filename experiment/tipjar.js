import init, {
  PrivateKey,
  Keypair,
  Resolver,
  RpcClient,
  kaspaToSompi,
  sompiToKaspaString,
  createTransactions,
  version,
  sha256FromText,
} from "./sdk/kaspa/kaspa.js";

// Tip jar: every visitor gets their own client-side TN10 wallet (separate
// localStorage key from the main wallet.js experiment so the two pages don't
// collide) and can send a small tip plus a short message to one well-known
// shared TN10 address. Same "L1 tx as public post" pattern as wallet.js's
// public feed and group chat rooms, just carrying an amount that counts
// toward a leaderboard instead of free text alone.

const NETWORK_ID = "testnet-10";
const REST_BASE = "https://api-tn10.kaspa.org";
const STORAGE_KEY = "kaspaexplained-tn10-tipjar-wallet";

// Public-deployment safety valve, same rule as wallet.js's MAX_SEND_KAS:
// this is a play/testnet wallet meant for people to poke at, not a
// real-money app. Cap tip amounts so a typo or a script kiddie can't drain
// a funded wallet in one shot.
const MAX_SEND_KAS = 10;

// Tip amount is user-adjustable (a leaderboard ranked by total tipped is
// only interesting if amounts can differ), but it's floored at the same
// 0.2 tKAS = 20000000n sompi carrier-amount convention wallet.js uses for
// its payload-carrying transactions (messages, room posts, feed posts,
// profile posts), and it's the pre-filled suggested amount below.
const MIN_TIP_KAS = "0.2";
const MIN_TIP_SOMPI = 20000000n;

const TIP_PREFIX = "tip:1:";
// Deferred until init() resolves, same reason wallet.js sets FEED_ADDRESS
// inside boot() instead of as a top-level const: PrivateKey/sha256FromText
// are WASM-backed calls and aren't callable until the module has finished
// loading.
let TIPJAR_ADDRESS = null;

let rpc = null;
let walletPrivKey = null; // this page's single wallet, hex string

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

function addressFor(privKeyHex) {
  return new PrivateKey(privKeyHex).toAddress(NETWORK_ID).toString();
}

function loadOrCreateWallet() {
  let pk = localStorage.getItem(STORAGE_KEY);
  if (!pk) {
    pk = Keypair.random().privateKey;
    localStorage.setItem(STORAGE_KEY, pk);
    log(`generated new tip jar wallet ${addressFor(pk)}`);
  } else {
    log(`loaded existing tip jar wallet ${addressFor(pk)}`);
  }
  walletPrivKey = pk;
}

async function connectRpc() {
  rpc = new RpcClient({ resolver: new Resolver(), networkId: NETWORK_ID });
  rpc.addEventListener("disconnect", () => log("RPC disconnected, will reconnect on next request"));
  rpc.addEventListener("connect", () => log(`RPC (re)connected -> ${rpc.url || "resolved node"}`));
  await rpc.connect();
  const info = await rpc.getServerInfo();
  log(
    `RPC connected via public resolver -> node ${info.serverVersion}, network ${info.networkId}, synced=${info.isSynced}, utxoIndex=${info.hasUtxoIndex}, virtualDaaScore=${info.virtualDaaScore}`
  );
}

// The public-resolver websocket can drop between UI actions. Every call site
// that touches rpc goes through this first instead of assuming the earlier
// connect() still holds, same "don't trust local state, check the real
// connection" habit as wallet.js's own ensureConnected().
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
  const address = addressFor(walletPrivKey);
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

function renderWallet() {
  const address = addressFor(walletPrivKey);
  $("#address").textContent = address;
  $("#privkey").textContent = walletPrivKey;
  if (rpc) refreshBalance();
  else $("#balance").textContent = "connecting…";
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

// Shared build -> sign -> submit -> verify-acceptance path, same shape as
// wallet.js's buildSignSubmit but against this page's single wallet instead
// of an active-index array of wallets.
async function buildSignSubmit({ toAddress, sompiAmount, payloadBytes, statusEl }) {
  const address = addressFor(walletPrivKey);
  const privateKey = new PrivateKey(walletPrivKey);

  await ensureConnected();
  statusEl.textContent = "fetching UTXOs…";
  const { entries } = await rpc.getUtxosByAddresses([address]);
  if (entries.length === 0) throw new Error("no spendable UTXOs on this wallet");

  statusEl.textContent = "building transaction…";
  const settings = {
    outputs: [{ address: toAddress, amount: sompiAmount }],
    changeAddress: address,
    priorityFee: 0n,
    entries,
    networkId: NETWORK_ID,
  };
  if (payloadBytes) settings.payload = payloadBytes;

  const { transactions, summary } = await createTransactions(settings);
  log(`generator summary: ${JSON.stringify(summary, (_, v) => (typeof v === "bigint" ? v.toString() : v))}`);

  let lastTxid = null;
  for (const tx of transactions) {
    tx.sign([privateKey]);
    lastTxid = await tx.submit(rpc);
    log(
      `submitted -> txid ${lastTxid} | sdk kaspa-wasm ${version()} | network ${NETWORK_ID} | endpoint via Resolver | payload=${payloadBytes ? payloadBytes.length + "B" : "none"} | changeAddress ${address}`
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

async function sendTip() {
  const amountStr = $("#tipAmount").value.trim();
  const message = $("#tipMessage").value.trim();
  const statusEl = $("#tipStatus");
  statusEl.className = "status";
  statusEl.textContent = "";

  if (!TIPJAR_ADDRESS) {
    statusEl.className = "status err";
    statusEl.textContent = "tip jar address not ready yet, reload the page";
    return;
  }
  if (!message) {
    statusEl.className = "status err";
    statusEl.textContent = "enter a short message with your tip";
    return;
  }
  const sompiAmount = kaspaToSompi(amountStr);
  if (!sompiAmount) {
    statusEl.className = "status err";
    statusEl.textContent = "invalid amount";
    return;
  }
  if (sompiAmount < MIN_TIP_SOMPI) {
    statusEl.className = "status err";
    statusEl.textContent = `minimum tip is ${MIN_TIP_KAS} tKAS`;
    return;
  }
  if (sompiAmount > kaspaToSompi(String(MAX_SEND_KAS))) {
    statusEl.className = "status err";
    statusEl.textContent = `this is a public play wallet, tips are capped at ${MAX_SEND_KAS} tKAS per transaction`;
    return;
  }

  const senderAddress = addressFor(walletPrivKey);
  try {
    const payload = textToPayloadBytes(`${TIP_PREFIX}${senderAddress}:${message}`);
    await buildSignSubmit({ toAddress: TIPJAR_ADDRESS, sompiAmount, payloadBytes: payload, statusEl });
    $("#tipMessage").value = "";
    loadLeaderboard();
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = String(e);
    log(`send tip failed: ${e}`);
  }
}

async function loadLeaderboard() {
  const lbBody = $("#leaderboardTable tbody");
  const recentEl = $("#recentTips");
  lbBody.innerHTML = `<tr><td colspan="3">loading…</td></tr>`;
  recentEl.innerHTML = "<p>loading…</p>";
  try {
    const res = await fetch(`${REST_BASE}/addresses/${TIPJAR_ADDRESS}/full-transactions?limit=50`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const txs = await res.json();
    const tips = [];
    for (const tx of txs) {
      if (!tx.payload) continue;
      const text = safePayloadText(tx.payload);
      if (!text || !text.startsWith(TIP_PREFIX)) continue;
      const rest = text.slice(TIP_PREFIX.length);
      // rest starts with a full "kaspatest:..." sender address, which has
      // its own colon, so skip past that fixed prefix before finding the
      // real separator. wallet.js's feed/room parsers hit exactly this bug
      // with a naive indexOf(":") and fixed it the same way.
      const sep = rest.indexOf(":", "kaspatest:".length);
      if (sep === -1) continue;
      const sender = rest.slice(0, sep);
      const message = rest.slice(sep + 1);
      const tipOutput = tx.outputs.find((o) => o.script_public_key_address === TIPJAR_ADDRESS);
      if (!tipOutput) continue;
      tips.push({
        sender,
        message,
        amountSompi: BigInt(tipOutput.amount),
        time: Number(tx.block_time || 0),
        txid: tx.transaction_id,
      });
    }
    tips.sort((a, b) => b.time - a.time);

    const totals = new Map(); // sender address -> { amount: bigint, count: number }
    for (const tip of tips) {
      const cur = totals.get(tip.sender) || { amount: 0n, count: 0 };
      cur.amount += tip.amountSompi;
      cur.count += 1;
      totals.set(tip.sender, cur);
    }
    const ranked = [...totals.entries()].sort((a, b) =>
      b[1].amount > a[1].amount ? 1 : b[1].amount < a[1].amount ? -1 : 0
    );

    if (ranked.length === 0) {
      lbBody.innerHTML = `<tr><td colspan="3">no tips yet</td></tr>`;
    } else {
      lbBody.innerHTML = "";
      for (const [address, stats] of ranked) {
        const tr = document.createElement("tr");
        const addrTd = document.createElement("td");
        addrTd.textContent = `${address.slice(0, 18)}…${address.slice(-6)}`;
        addrTd.title = address;
        const totalTd = document.createElement("td");
        totalTd.textContent = `${sompiToKaspaString(stats.amount)} tKAS`;
        const countTd = document.createElement("td");
        countTd.textContent = String(stats.count);
        tr.append(addrTd, totalTd, countTd);
        lbBody.appendChild(tr);
      }
    }

    if (tips.length === 0) {
      recentEl.innerHTML = "<p>no tips yet</p>";
    } else {
      recentEl.innerHTML = "";
      for (const tip of tips) {
        const div = document.createElement("div");
        div.className = "msg-item";
        const when = tip.time ? new Date(tip.time).toLocaleString() : "unknown time";
        const meta = document.createElement("div");
        meta.className = "msg-meta";
        meta.textContent = `${tip.sender.slice(0, 18)}… · ${sompiToKaspaString(tip.amountSompi)} tKAS · ${when} · `;
        const code = document.createElement("code");
        code.textContent = `${tip.txid.slice(0, 12)}…`;
        meta.appendChild(code);
        const textDiv = document.createElement("div");
        textDiv.className = "msg-text";
        textDiv.textContent = tip.message;
        div.appendChild(meta);
        div.appendChild(textDiv);
        recentEl.appendChild(div);
      }
    }
    log(`leaderboard: ${tips.length} tip(s) from ${ranked.length} tipper(s)`);
  } catch (e) {
    lbBody.innerHTML = `<tr><td colspan="3">error</td></tr>`;
    recentEl.innerHTML = `<p>error: ${e}</p>`;
    log(`leaderboard load failed: ${e}`);
  }
}

function bindUI() {
  $("#btnRefreshBalance").addEventListener("click", refreshBalance);
  $("#btnSendTip").addEventListener("click", sendTip);
  $("#btnLoadLeaderboard").addEventListener("click", loadLeaderboard);

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
  TIPJAR_ADDRESS = new PrivateKey(sha256FromText("kaspaexplained-tn10-tipjar:v1")).toAddress(NETWORK_ID).toString();
  log(`tip jar address: ${TIPJAR_ADDRESS}`);
  $("#tipjarAddress").textContent = TIPJAR_ADDRESS;

  loadOrCreateWallet();
  bindUI();
  renderWallet();
  loadLeaderboard();
  try {
    await connectRpc();
    refreshBalance();
  } catch (e) {
    log(`RPC connect failed: ${e}`);
  }
}

boot();
