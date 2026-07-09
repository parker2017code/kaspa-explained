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
  encryptXChaCha20Poly1305,
  decryptXChaCha20Poly1305,
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

// Public-deployment safety valve: this is a play/testnet faucet-funded
// wallet meant for people to poke at, not a real-money app. Cap manual
// sends so a typo or a script kiddie can't drain the whole seed wallet in
// one shot. Message/room/feed/profile carrier amounts (MSG_DUST) are far
// below this and unaffected.
const MAX_SEND_KAS = 10;

function deriveMsgPrivateKey(walletPrivKeyHex) {
  const seedHex = sha256FromText(`kaspaexplained-tn10-msgkey:v1:${walletPrivKeyHex}`);
  return new CryptoBoxPrivateKey(seedHex);
}

// Public social feed: every wallet posts to the same well-known TN10 address
// (deterministically derived, not owned by anyone in particular) and every
// reader scans that one address's transactions. Same "L1 tx as public post"
// pattern as thesheepcat/K and Kasia's own history, just unencrypted since
// a feed is meant to be public. Posts embed the poster's own address in the
// payload text so the feed doesn't need to resolve tx input addresses.
const FEED_PREFIX = "post:1:";
let FEED_ADDRESS = null; // set in boot() once the WASM module is initialized

// Group chat rooms: a room name derives both a shared posting address and a
// shared symmetric password (encryptXChaCha20Poly1305/decrypt, the SDK's own
// password-based cipher, not hand-rolled). Anyone who knows the room name can
// join, same trust model as an unlisted invite link/shared passphrase group.
// Each member posts from their own funded wallet so no shared/custodial
// wallet is needed to pay fees.
const ROOM_PREFIX = "grp-msg:1:";
function deriveRoom(roomName) {
  const addrSeed = sha256FromText(`kaspaexplained-tn10-room-address:v1:${roomName}`);
  const password = sha256FromText(`kaspaexplained-tn10-room-password:v1:${roomName}`);
  const address = new PrivateKey(addrSeed).toAddress("testnet-10").toString();
  return { address, password };
}

// Display names: a self-send payload announcing "this address goes by this
// name," same publish pattern as the messaging key. Feed/room/inbox views
// resolve and cache names per address so the app reads like a social app
// instead of raw bech32 strings everywhere.
const PROFILE_PREFIX = "profile:1:";
const profileCache = new Map(); // address -> name | null (null = looked up, none found)

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
// connect() still holds. Matches the site's own "don't trust local state,
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
  if (sompiAmount > kaspaToSompi(String(MAX_SEND_KAS))) {
    statusEl.className = "status err";
    statusEl.textContent = `this is a public play wallet, sends are capped at ${MAX_SEND_KAS} tKAS per transaction`;
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

// ---- Profiles (display names) ----

async function publishProfile() {
  const name = $("#profileName").value.trim();
  const statusEl = $("#profileStatus");
  statusEl.className = "status";
  statusEl.textContent = "";
  if (!name) {
    statusEl.className = "status err";
    statusEl.textContent = "enter a display name";
    return;
  }
  const pk = wallets[activeIndex];
  const address = addressFor(pk);
  try {
    const payload = textToPayloadBytes(`${PROFILE_PREFIX}${name}`);
    await buildSignSubmit({ toAddress: address, sompiAmount: MSG_DUST, payloadBytes: payload, statusEl });
    profileCache.set(address, name);
    log(`set display name "${name}" for ${address}`);
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = String(e);
    log(`publish profile failed: ${e}`);
  }
}

async function resolveProfileName(address) {
  if (profileCache.has(address)) return profileCache.get(address);
  try {
    const res = await fetch(`${REST_BASE}/addresses/${address}/full-transactions?limit=50`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const txs = await res.json();
    const hits = txs
      .filter((tx) => tx.payload)
      .filter((tx) => tx.outputs.some((o) => o.script_public_key_address === address))
      .map((tx) => ({ tx, text: safePayloadText(tx.payload) }))
      .filter((x) => x.text && x.text.startsWith(PROFILE_PREFIX))
      .sort((a, b) => Number(b.tx.block_time || 0) - Number(a.tx.block_time || 0));
    const name = hits.length ? hits[0].text.slice(PROFILE_PREFIX.length) : null;
    profileCache.set(address, name);
    return name;
  } catch {
    return null;
  }
}

// Renders "shortAddress · when · txid" immediately, then swaps in a
// resolved display name asynchronously if one shows up (feed/room posts
// embed the poster's real address, so this works for both).
function buildMetaLine(address, when, txid) {
  const span = document.createElement("span");
  span.className = "msg-meta";
  const who = document.createElement("span");
  who.className = "who";
  who.textContent = `${address.slice(0, 18)}…`;
  who.title = address;
  span.appendChild(who);
  span.append(` · ${when} · `);
  const code = document.createElement("code");
  code.textContent = `${txid.slice(0, 12)}…`;
  span.appendChild(code);
  resolveProfileName(address).then((name) => {
    if (name) who.textContent = name;
  });
  return span;
}

// ---- Public feed ----

async function postToFeed() {
  const text = $("#feedText").value;
  const statusEl = $("#feedStatus");
  statusEl.className = "status";
  statusEl.textContent = "";
  if (!text) {
    statusEl.className = "status err";
    statusEl.textContent = "post is empty";
    return;
  }
  const pk = wallets[activeIndex];
  const address = addressFor(pk);
  try {
    const payload = textToPayloadBytes(`${FEED_PREFIX}${address}:${text}`);
    await buildSignSubmit({ toAddress: FEED_ADDRESS, sompiAmount: MSG_DUST, payloadBytes: payload, statusEl });
    $("#feedText").value = "";
    loadFeed();
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = String(e);
    log(`post failed: ${e}`);
  }
}

async function loadFeed() {
  const listEl = $("#feedList");
  listEl.innerHTML = "<p>loading…</p>";
  try {
    const res = await fetch(`${REST_BASE}/addresses/${FEED_ADDRESS}/full-transactions?limit=50`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const txs = await res.json();
    const posts = [];
    for (const tx of txs) {
      if (!tx.payload) continue;
      if (!tx.outputs.some((o) => o.script_public_key_address === FEED_ADDRESS)) continue;
      const text = safePayloadText(tx.payload);
      if (!text || !text.startsWith(FEED_PREFIX)) continue;
      const rest = text.slice(FEED_PREFIX.length);
      // rest starts with a full "kaspatest:..." address, which has its own
      // colon, so skip past that fixed prefix before finding our separator.
      const sep = rest.indexOf(":", "kaspatest:".length);
      if (sep === -1) continue;
      posts.push({
        poster: rest.slice(0, sep),
        text: rest.slice(sep + 1),
        time: Number(tx.block_time || 0),
        txid: tx.transaction_id,
      });
    }
    posts.sort((a, b) => b.time - a.time);
    if (posts.length === 0) {
      listEl.innerHTML = "<p>no posts yet</p>";
      return;
    }
    listEl.innerHTML = "";
    for (const p of posts) {
      const div = document.createElement("div");
      div.className = "msg-item";
      const when = p.time ? new Date(p.time).toLocaleString() : "unknown time";
      div.appendChild(buildMetaLine(p.poster, when, p.txid));
      const textDiv = document.createElement("div");
      textDiv.className = "msg-text";
      textDiv.textContent = p.text;
      div.appendChild(textDiv);
      listEl.appendChild(div);
    }
    log(`feed: loaded ${posts.length} post(s) from ${FEED_ADDRESS.slice(0, 14)}…`);
  } catch (e) {
    listEl.innerHTML = `<p>error: ${e}</p>`;
    log(`feed load failed: ${e}`);
  }
}

// ---- Group chat rooms ----

let currentRoom = null; // { name, address, password }

function joinRoom() {
  const name = $("#roomName").value.trim();
  if (!name) return;
  currentRoom = { name, ...deriveRoom(name) };
  $("#roomStatus").textContent = `joined room "${name}" -> posting address ${currentRoom.address.slice(0, 18)}…`;
  log(`joined room "${name}": address ${currentRoom.address}, derived from room name (shared-passphrase trust model, same as an unlisted invite link)`);
  loadRoomMessages();
}

async function sendRoomMessage() {
  const statusEl = $("#roomSendStatus");
  statusEl.className = "status";
  statusEl.textContent = "";
  if (!currentRoom) {
    statusEl.className = "status err";
    statusEl.textContent = "join a room first";
    return;
  }
  const text = $("#roomText").value;
  if (!text) {
    statusEl.className = "status err";
    statusEl.textContent = "message is empty";
    return;
  }
  const pk = wallets[activeIndex];
  const address = addressFor(pk);
  try {
    const ciphertextB64 = encryptXChaCha20Poly1305(text, currentRoom.password);
    const payload = textToPayloadBytes(`${ROOM_PREFIX}${address}:${ciphertextB64}`);
    await buildSignSubmit({ toAddress: currentRoom.address, sompiAmount: MSG_DUST, payloadBytes: payload, statusEl });
    $("#roomText").value = "";
    loadRoomMessages();
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = String(e);
    log(`room send failed: ${e}`);
  }
}

async function loadRoomMessages() {
  const listEl = $("#roomList");
  if (!currentRoom) {
    listEl.innerHTML = "<p>join a room first</p>";
    return;
  }
  listEl.innerHTML = "<p>loading…</p>";
  try {
    const res = await fetch(`${REST_BASE}/addresses/${currentRoom.address}/full-transactions?limit=50`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const txs = await res.json();
    const messages = [];
    for (const tx of txs) {
      if (!tx.payload) continue;
      if (!tx.outputs.some((o) => o.script_public_key_address === currentRoom.address)) continue;
      const text = safePayloadText(tx.payload);
      if (!text || !text.startsWith(ROOM_PREFIX)) continue;
      const rest = text.slice(ROOM_PREFIX.length);
      // Same fixed-address-prefix skip as the feed parser above.
      const sep = rest.indexOf(":", "kaspatest:".length);
      if (sep === -1) continue;
      const sender = rest.slice(0, sep);
      const ciphertextB64 = rest.slice(sep + 1);
      try {
        const plaintext = decryptXChaCha20Poly1305(ciphertextB64, currentRoom.password);
        messages.push({ sender, plaintext, time: Number(tx.block_time || 0), txid: tx.transaction_id });
      } catch (e) {
        log(`room decrypt failed for ${tx.transaction_id}: ${e}`);
      }
    }
    messages.sort((a, b) => b.time - a.time);
    if (messages.length === 0) {
      listEl.innerHTML = "<p>no messages in this room yet</p>";
      return;
    }
    listEl.innerHTML = "";
    for (const m of messages) {
      const div = document.createElement("div");
      div.className = "msg-item";
      const when = m.time ? new Date(m.time).toLocaleString() : "unknown time";
      div.appendChild(buildMetaLine(m.sender, when, m.txid));
      const textDiv = document.createElement("div");
      textDiv.className = "msg-text";
      textDiv.textContent = m.plaintext;
      div.appendChild(textDiv);
      listEl.appendChild(div);
    }
    log(`room "${currentRoom.name}": decrypted ${messages.length} message(s)`);
  } catch (e) {
    listEl.innerHTML = `<p>error: ${e}</p>`;
    log(`room load failed: ${e}`);
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
  $("#btnPost").addEventListener("click", postToFeed);
  $("#btnLoadFeed").addEventListener("click", loadFeed);
  $("#btnJoinRoom").addEventListener("click", joinRoom);
  $("#btnSendRoomMsg").addEventListener("click", sendRoomMessage);
  $("#btnLoadRoom").addEventListener("click", loadRoomMessages);
  $("#btnSetProfile").addEventListener("click", publishProfile);
  $("#btnGetWeather").addEventListener("click", getWeather);

  document.querySelectorAll(".copy").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.dataset.copy);
      navigator.clipboard.writeText(target.textContent);
      btn.textContent = "copied";
      setTimeout(() => (btn.textContent = "copy"), 1000);
    });
  });
}

// ---- Weather ----
// Not a Kaspa feature; a plain widget using Open-Meteo's free, no-API-key
// geocoding + forecast endpoints, same "reuse an existing open service
// instead of reinventing it" approach as the rest of this experiment.

const WMO_CODES = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Rain showers", 81: "Rain showers", 82: "Violent rain showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Severe thunderstorm with hail",
};

async function getWeather() {
  const place = $("#weatherPlace").value.trim();
  const resultEl = $("#weatherResult");
  resultEl.textContent = "";
  if (!place) {
    resultEl.textContent = "enter a place name";
    return;
  }
  resultEl.textContent = "looking up…";
  try {
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1`);
    const geo = await geoRes.json();
    if (!geo.results || geo.results.length === 0) {
      resultEl.textContent = `no location found for "${place}"`;
      return;
    }
    const { latitude, longitude, name, country } = geo.results[0];
    const wxRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m`);
    const wx = await wxRes.json();
    const c = wx.current;
    const condition = WMO_CODES[c.weather_code] || `code ${c.weather_code}`;
    resultEl.innerHTML = "";
    const strong = document.createElement("strong");
    strong.textContent = `${c.temperature_2m}°C, ${condition}`;
    const p = document.createElement("p");
    p.className = "hint";
    p.textContent = `${name}, ${country} · wind ${c.wind_speed_10m} km/h · via Open-Meteo (free, no API key)`;
    resultEl.appendChild(strong);
    resultEl.appendChild(p);
    log(`weather(${name}, ${country}) = ${c.temperature_2m}°C, ${condition}`);
  } catch (e) {
    resultEl.textContent = `error: ${e}`;
    log(`weather lookup failed: ${e}`);
  }
}

async function boot() {
  log("loading kaspa-wasm SDK (v2.0.1, official rusty-kaspa browser build)…");
  await init();
  log(`SDK ready, kaspa-wasm version ${version()}`);
  FEED_ADDRESS = new PrivateKey(sha256FromText("kaspaexplained-tn10-public-feed:v1")).toAddress(NETWORK_ID).toString();
  log(`public feed address: ${FEED_ADDRESS}`);
  loadWallets();
  saveWallets();
  renderWalletSelect();
  bindUI();
  renderActive();
  loadFeed();
  try {
    await connectRpc();
    refreshBalance();
  } catch (e) {
    log(`RPC connect failed: ${e}`);
  }
}

boot();
