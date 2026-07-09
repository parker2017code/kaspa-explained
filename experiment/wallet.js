import init, {
  Keypair,
  PrivateKey,
  Resolver,
  RpcClient,
  kaspaToSompi,
  sompiToKaspaString,
  createTransactions,
  version,
  CryptoBox,
  CryptoBoxPrivateKey,
  CryptoBoxPublicKey,
  sha256FromText,
} from "./sdk/kaspa/kaspa.js";

// Wallet-to-wallet encrypted messaging over TN10 L1 transaction payloads.
// Same design as the open-source Kasia messaging app (K-Kluster/Kasia):
// encrypted app data riding in ordinary tx payloads, no server. This build
// reuses the official Rusty Kaspa WASM SDK's own CryptoBox (X25519 +
// XChaCha20Poly1305) instead of Kasia's forked cipher-wasm, because that
// fork needs a WASM-targeting C toolchain (secp256k1-sys) this machine's
// Xcode clang doesn't have and there's no brew/sudo here to fix that.
// CryptoBox is an official, audited primitive from the same SDK already
// proven working for the wallet above, not a hand-rolled cipher.
const MSG_KEY_PREFIX = "kx-key:1:";
const MSG_PREFIX = "kx-msg:1:";
const MSG_DUST = 20000000n; // 0.2 tKAS carrier amount for message/announce txs

function deriveMsgPrivateKey(walletPrivKeyHex) {
  const seedHex = sha256FromText(`kaspaexplained-tn10-msgkey:v1:${walletPrivKeyHex}`);
  return new CryptoBoxPrivateKey(seedHex);
}

function textToPayloadBytes(text) {
  return new TextEncoder().encode(text);
}

function payloadHexToText(hex) {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
  return new TextDecoder().decode(bytes);
}

const NETWORK_ID = "testnet-10";
const REST_BASE = "https://api-tn10.kaspa.org";
const STORAGE_KEY = "kaspaexplained-tn10-experiment-wallets";

// Seed wallet: generated and funded earlier in this build session, so the
// interface has something real to show on first load instead of an empty state.
const SEED_WALLET = "923d073b268afd30ba9b3d49f10eb2a61df8f2888d65894153df72a5b5da29a5";

let rpc = null;
let wallets = []; // array of private key hex strings
let activeIndex = 0;

const $ = (sel) => document.querySelector(sel);
const logEl = $("#log");

function log(msg) {
  const t = new Date().toISOString().split("T")[1].replace("Z", "");
  logEl.textContent += `[${t}] ${msg}\n`;
  logEl.scrollTop = logEl.scrollHeight;
  console.log(msg);
}

function loadWallets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    wallets = raw ? JSON.parse(raw) : [];
  } catch {
    wallets = [];
  }
  if (wallets.length === 0) {
    wallets.push(SEED_WALLET);
  }
}

function saveWallets() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets));
}

function addressFor(privKeyHex) {
  return new PrivateKey(privKeyHex).toAddress(NETWORK_ID).toString();
}

function renderWalletSelect() {
  const sel = $("#walletSelect");
  sel.innerHTML = "";
  wallets.forEach((pk, i) => {
    const opt = document.createElement("option");
    const addr = addressFor(pk);
    opt.value = String(i);
    opt.textContent = `${addr.slice(0, 18)}…${addr.slice(-6)}`;
    sel.appendChild(opt);
  });
  sel.value = String(activeIndex);
}

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
// connect() still holds — matches the site's own "don't trust local state,
// check the real connection" verification habit.
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
  const pk = wallets[activeIndex];
  const address = addressFor(pk);
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

function renderActive() {
  const pk = wallets[activeIndex];
  const address = addressFor(pk);
  $("#address").textContent = address;
  $("#privkey").textContent = pk;
  if (rpc) refreshBalance();
  else $("#balance").textContent = "connecting…";
}

async function loadUtxos() {
  const pk = wallets[activeIndex];
  const address = addressFor(pk);
  const tbody = $("#utxoTable tbody");
  tbody.innerHTML = `<tr><td colspan="3">loading…</td></tr>`;
  try {
    await ensureConnected();
    const res = await rpc.getUtxosByAddresses([address]);
    if (res.entries.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3">no UTXOs</td></tr>`;
      return;
    }
    tbody.innerHTML = "";
    for (const entry of res.entries) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${sompiToKaspaString(entry.amount)}</td><td>${entry.outpoint.transactionId}</td><td>${entry.blockDaaScore}</td>`;
      tbody.appendChild(tr);
    }
    log(`loaded ${res.entries.length} UTXO(s) for ${address.slice(0, 14)}…`);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="3">error</td></tr>`;
    log(`utxo query failed: ${e}`);
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

// Shared build -> sign -> submit -> verify-acceptance path for both plain
// sends and message/announce transactions (payload optional).
async function buildSignSubmit({ toAddress, sompiAmount, payloadBytes, statusEl }) {
  const pk = wallets[activeIndex];
  const address = addressFor(pk);
  const privateKey = new PrivateKey(pk);

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
  loadUtxos();
  return { txid: lastTxid, accepted };
}

async function send() {
  const to = $("#sendTo").value.trim();
  const amountStr = $("#sendAmount").value.trim();
  const statusEl = $("#sendStatus");
  statusEl.className = "status";
  statusEl.textContent = "";

  if (!to.startsWith("kaspatest:")) {
    statusEl.className = "status err";
    statusEl.textContent = "recipient must be a kaspatest: address";
    return;
  }
  const sompiAmount = kaspaToSompi(amountStr);
  if (!sompiAmount) {
    statusEl.className = "status err";
    statusEl.textContent = "invalid amount";
    return;
  }

  try {
    await buildSignSubmit({ toAddress: to, sompiAmount, statusEl });
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = String(e);
    log(`send failed: ${e}`);
  }
}

async function publishMsgKey() {
  const statusEl = $("#msgKeyStatus");
  statusEl.className = "status";
  statusEl.textContent = "";
  const pk = wallets[activeIndex];
  const address = addressFor(pk);
  const msgPrivKey = deriveMsgPrivateKey(pk);
  const msgPubKeyHex = msgPrivKey.to_public_key().toString();

  try {
    const payload = textToPayloadBytes(MSG_KEY_PREFIX + msgPubKeyHex);
    await buildSignSubmit({ toAddress: address, sompiAmount: MSG_DUST, payloadBytes: payload, statusEl });
    log(`published messaging key ${msgPubKeyHex} for ${address}`);
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = String(e);
    log(`publish messaging key failed: ${e}`);
  }
}

async function lookupMsgKey(address) {
  const res = await fetch(`${REST_BASE}/addresses/${address}/full-transactions?limit=50`);
  if (!res.ok) throw new Error(`lookup failed: HTTP ${res.status}`);
  const txs = await res.json();
  const hits = txs
    .filter((tx) => tx.payload)
    .filter((tx) => tx.outputs.some((o) => o.script_public_key_address === address))
    .map((tx) => ({ tx, text: safePayloadText(tx.payload) }))
    .filter((x) => x.text && x.text.startsWith(MSG_KEY_PREFIX))
    .sort((a, b) => Number(b.tx.block_time || 0) - Number(a.tx.block_time || 0));
  if (hits.length === 0) return null;
  return hits[0].text.slice(MSG_KEY_PREFIX.length);
}

function safePayloadText(hex) {
  try {
    return payloadHexToText(hex);
  } catch {
    return null;
  }
}

async function sendMessage() {
  const to = $("#msgTo").value.trim();
  const text = $("#msgText").value;
  const statusEl = $("#msgSendStatus");
  statusEl.className = "status";
  statusEl.textContent = "";

  if (!to.startsWith("kaspatest:")) {
    statusEl.className = "status err";
    statusEl.textContent = "recipient must be a kaspatest: address";
    return;
  }
  if (!text) {
    statusEl.className = "status err";
    statusEl.textContent = "message is empty";
    return;
  }

  try {
    statusEl.textContent = "looking up recipient's published messaging key…";
    const recipientKeyHex = await lookupMsgKey(to);
    if (!recipientKeyHex) {
      statusEl.className = "status err";
      statusEl.textContent = "recipient hasn't published a messaging key yet (they need to click \"Publish my messaging key\" first)";
      return;
    }
    log(`found recipient messaging key ${recipientKeyHex}`);

    const pk = wallets[activeIndex];
    const myMsgPrivKey = deriveMsgPrivateKey(pk);
    const myMsgPubKeyHex = myMsgPrivKey.to_public_key().toString();
    const box = new CryptoBox(myMsgPrivKey, new CryptoBoxPublicKey(recipientKeyHex));
    const ciphertextB64 = box.encrypt(text);

    const payload = textToPayloadBytes(`${MSG_PREFIX}${myMsgPubKeyHex}:${ciphertextB64}`);
    await buildSignSubmit({ toAddress: to, sompiAmount: MSG_DUST, payloadBytes: payload, statusEl: { className: "", textContent: "" } });
    statusEl.className = "status ok";
    statusEl.textContent = `encrypted and sent to ${to.slice(0, 18)}…`;
    $("#msgText").value = "";
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = String(e);
    log(`send message failed: ${e}`);
  }
}

async function checkInbox() {
  const listEl = $("#inboxList");
  listEl.innerHTML = "<p>loading…</p>";
  const pk = wallets[activeIndex];
  const address = addressFor(pk);
  const myMsgPrivKey = deriveMsgPrivateKey(pk);

  try {
    const res = await fetch(`${REST_BASE}/addresses/${address}/full-transactions?limit=50`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const txs = await res.json();
    const messages = [];
    for (const tx of txs) {
      if (!tx.payload) continue;
      if (!tx.outputs.some((o) => o.script_public_key_address === address)) continue;
      const text = safePayloadText(tx.payload);
      if (!text || !text.startsWith(MSG_PREFIX)) continue;
      const rest = text.slice(MSG_PREFIX.length);
      const sep = rest.indexOf(":");
      if (sep === -1) continue;
      const senderPubKeyHex = rest.slice(0, sep);
      const ciphertextB64 = rest.slice(sep + 1);
      try {
        const box = new CryptoBox(myMsgPrivKey, new CryptoBoxPublicKey(senderPubKeyHex));
        const plaintext = box.decrypt(ciphertextB64);
        messages.push({ plaintext, senderPubKeyHex, time: Number(tx.block_time || 0), txid: tx.transaction_id });
      } catch (e) {
        log(`decrypt failed for ${tx.transaction_id}: ${e}`);
      }
    }
    messages.sort((a, b) => b.time - a.time);
    if (messages.length === 0) {
      listEl.innerHTML = "<p>no messages found for this wallet</p>";
      return;
    }
    listEl.innerHTML = "";
    for (const m of messages) {
      const div = document.createElement("div");
      div.className = "msg-item";
      const when = m.time ? new Date(m.time).toLocaleString() : "unknown time";
      div.innerHTML = `<div class="msg-meta">from key ${m.senderPubKeyHex.slice(0, 10)}… · ${when} · <code>${m.txid.slice(0, 12)}…</code></div><div class="msg-text"></div>`;
      div.querySelector(".msg-text").textContent = m.plaintext;
      listEl.appendChild(div);
    }
    log(`inbox: decrypted ${messages.length} message(s) for ${address.slice(0, 14)}…`);
  } catch (e) {
    listEl.innerHTML = `<p>error: ${e}</p>`;
    log(`inbox check failed: ${e}`);
  }
}

function bindUI() {
  $("#walletSelect").addEventListener("change", (e) => {
    activeIndex = Number(e.target.value);
    renderActive();
  });

  $("#btnNew").addEventListener("click", () => {
    const kp = Keypair.random();
    wallets.push(kp.privateKey);
    saveWallets();
    activeIndex = wallets.length - 1;
    renderWalletSelect();
    renderActive();
    log(`created new wallet ${addressFor(kp.privateKey)}`);
  });

  $("#btnImport").addEventListener("click", () => {
    $("#importForm").classList.toggle("hidden");
  });
  $("#btnImportCancel").addEventListener("click", () => {
    $("#importForm").classList.add("hidden");
    $("#importKey").value = "";
  });
  $("#btnImportConfirm").addEventListener("click", () => {
    const key = $("#importKey").value.trim();
    try {
      const addr = addressFor(key); // validates
      wallets.push(key);
      saveWallets();
      activeIndex = wallets.length - 1;
      renderWalletSelect();
      renderActive();
      $("#importForm").classList.add("hidden");
      $("#importKey").value = "";
      log(`imported wallet ${addr}`);
    } catch (e) {
      alert("Invalid private key: " + e);
    }
  });

  $("#btnRemove").addEventListener("click", () => {
    if (wallets.length <= 1) {
      alert("Keep at least one wallet.");
      return;
    }
    const addr = addressFor(wallets[activeIndex]);
    wallets.splice(activeIndex, 1);
    activeIndex = 0;
    saveWallets();
    renderWalletSelect();
    renderActive();
    log(`removed wallet ${addr}`);
  });

  $("#btnRefresh").addEventListener("click", refreshBalance);
  $("#btnLoadUtxos").addEventListener("click", loadUtxos);
  $("#btnSend").addEventListener("click", send);
  $("#btnPublishKey").addEventListener("click", publishMsgKey);
  $("#btnSendMsg").addEventListener("click", sendMessage);
  $("#btnCheckInbox").addEventListener("click", checkInbox);

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
  loadWallets();
  saveWallets();
  renderWalletSelect();
  bindUI();
  renderActive();
  try {
    await connectRpc();
    refreshBalance();
  } catch (e) {
    log(`RPC connect failed: ${e}`);
  }
}

boot();
