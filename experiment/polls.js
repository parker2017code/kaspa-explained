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

// On-chain polls/voting mini-app, same "L1 tx as public app data" pattern as
// wallet.js's public feed / group rooms: every poll and every vote is an
// ordinary TN10 transaction with a text payload, sent to one well-known
// shared board address that nobody in particular owns (deterministically
// derived from a fixed seed string, same trick as wallet.js's FEED_ADDRESS /
// deriveRoom()). Anyone reading that address's transaction history can
// reconstruct every poll and tally every vote; there is no server and no
// database, just the public REST indexer over accepted transactions.

const NETWORK_ID = "testnet-10";
const REST_BASE = "https://api-tn10.kaspa.org";

// This page's own single wallet. Deliberately a different localStorage key
// than wallet.js's "kaspaexplained-tn10-experiment-wallets": that key holds
// an array of wallets for the main experiment page; reusing it here would
// either corrupt that page's data shape or silently share keys across two
// unrelated apps. This page only ever needs one wallet.
const STORAGE_KEY = "kaspaexplained-tn10-polls-wallet";

const POLL_PREFIX = "poll:1:";
const VOTE_PREFIX = "vote:1:";
const CARRIER_SOMPI = 20000000n; // 0.2 tKAS fixed carrier amount, same as wallet.js's MSG_DUST; no user-adjustable amount on this page

// Board address is derived from a fixed seed via the SDK's own sha256FromText
// + PrivateKey().toAddress(), same pattern as wallet.js's FEED_ADDRESS /
// deriveRoom(). It is intentionally left null and only computed inside
// boot() after `await init()` resolves: sha256FromText and PrivateKey are
// WASM-bound exports from the SDK and are not callable until the wasm
// module has actually loaded, so computing this as a top-level const would
// run before init() and throw.
let BOARD_ADDRESS = null;

let rpc = null;
let privKeyHex = null;
let myAddress = null;

const $ = (sel) => document.querySelector(sel);
const logEl = () => $("#log");

function log(msg) {
  const t = new Date().toISOString().split("T")[1].replace("Z", "");
  const el = logEl();
  if (el) {
    el.textContent += `[${t}] ${msg}\n`;
    el.scrollTop = el.scrollHeight;
  }
  console.log(msg);
}

// ---- Wallet (single, localStorage-backed) ----

function loadWallet() {
  try {
    privKeyHex = localStorage.getItem(STORAGE_KEY);
  } catch {
    privKeyHex = null;
  }
  if (!privKeyHex) {
    const kp = Keypair.random();
    privKeyHex = kp.privateKey;
    localStorage.setItem(STORAGE_KEY, privKeyHex);
    log(`generated new polls wallet ${addressFor(privKeyHex)}`);
  }
  myAddress = addressFor(privKeyHex);
}

function addressFor(pk) {
  return new PrivateKey(pk).toAddress(NETWORK_ID).toString();
}

function renderWallet() {
  $("#address").textContent = myAddress;
  $("#privkey").textContent = privKeyHex;
  if (rpc) refreshBalance();
  else $("#balance").textContent = "connecting…";
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

// The public-resolver websocket can drop between UI actions (observed in
// wallet.js as a real "WebSocket is not connected" race). Every call site
// that touches rpc goes through this first instead of assuming an earlier
// connect() still holds.
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
  $("#balance").textContent = "loading…";
  try {
    await ensureConnected();
    const res = await rpc.getBalanceByAddress({ address: myAddress });
    $("#balance").textContent = `${sompiToKaspaString(res.balance)} tKAS`;
    log(`balance(${myAddress.slice(0, 14)}…) = ${res.balance} sompi`);
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

// Shared build -> sign -> submit -> verify-acceptance path for both poll
// creation and voting. Mirrors wallet.js's buildSignSubmit exactly, adapted
// to this page's single wallet (no wallets[]/activeIndex).
async function buildSignSubmit({ toAddress, sompiAmount, payloadBytes, statusEl }) {
  const privateKey = new PrivateKey(privKeyHex);

  await ensureConnected();
  statusEl.textContent = "fetching UTXOs…";
  const { entries } = await rpc.getUtxosByAddresses([myAddress]);
  if (entries.length === 0) throw new Error("no spendable UTXOs on this wallet");

  statusEl.textContent = "building transaction…";
  const settings = {
    outputs: [{ address: toAddress, amount: sompiAmount }],
    changeAddress: myAddress,
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
      `submitted -> txid ${lastTxid} | sdk kaspa-wasm ${version()} | network ${NETWORK_ID} | endpoint via Resolver | payload=${payloadBytes ? payloadBytes.length + "B" : "none"} | changeAddress ${myAddress}`
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

// ---- Poll payload parsing ----
//
// poll:1:<creatorAddress>:<question>|<option1>|<option2>[|<option3>][|<option4>]
// vote:1:<pollTxid>:<voterAddress>:<optionIndex>
//
// Both payloads embed a "kaspatest:..." address, and that address itself
// contains a colon. A naive text.indexOf(":") after the prefix would split
// inside the address instead of at the real field separator (this bit
// wallet.js's feed/room parsers before the fix). The fix: skip past the
// address's own fixed-length "kaspatest:" prefix before searching for the
// separator that actually ends the address field.
const ADDR_PREFIX_LEN = "kaspatest:".length;

function parsePollPayload(text, txid, time) {
  if (!text || !text.startsWith(POLL_PREFIX)) return null;
  const rest = text.slice(POLL_PREFIX.length); // "<creatorAddress>:<question>|<opt1>|..."
  const sep = rest.indexOf(":", ADDR_PREFIX_LEN);
  if (sep === -1) return null;
  const creator = rest.slice(0, sep);
  const optionsPart = rest.slice(sep + 1);
  const parts = optionsPart.split("|");
  if (parts.length < 3) return null; // question + at least 2 options
  const question = parts[0];
  const options = parts.slice(1, 5); // defensively cap at 4 even if a malformed payload embedded more
  if (!question || options.some((o) => !o)) return null;
  if (options.length < 2 || options.length > 4) return null;
  return { pollTxid: txid, creator, question, options, time };
}

function parseVotePayload(text) {
  if (!text || !text.startsWith(VOTE_PREFIX)) return null;
  const rest = text.slice(VOTE_PREFIX.length); // "<pollTxid>:<voterAddress>:<optionIndex>"
  const sep1 = rest.indexOf(":"); // pollTxid is a plain hex txid, no embedded colon, so a plain indexOf is safe here
  if (sep1 === -1) return null;
  const pollTxid = rest.slice(0, sep1);
  const rest2 = rest.slice(sep1 + 1); // "<voterAddress>:<optionIndex>"
  const sep2 = rest2.indexOf(":", ADDR_PREFIX_LEN); // same fixed-prefix skip as parsePollPayload
  if (sep2 === -1) return null;
  const voter = rest2.slice(0, sep2);
  const optionIndex = Number(rest2.slice(sep2 + 1));
  if (!Number.isInteger(optionIndex) || optionIndex < 0) return null;
  return { pollTxid, voter, optionIndex };
}

// ---- Create poll ----

async function createPoll() {
  const statusEl = $("#createPollStatus");
  statusEl.className = "status";
  statusEl.textContent = "";

  const question = $("#pollQuestion").value.trim();
  const optionEls = Array.from(document.querySelectorAll(".pollOption"));
  const options = optionEls.map((el) => el.value.trim()).filter((v) => v.length > 0);

  if (!question) {
    statusEl.className = "status err";
    statusEl.textContent = "enter a question";
    return;
  }
  if (question.includes("|")) {
    statusEl.className = "status err";
    statusEl.textContent = "question can't contain the | character";
    return;
  }
  if (options.length < 2) {
    statusEl.className = "status err";
    statusEl.textContent = "need at least 2 options";
    return;
  }
  if (options.length > 4) {
    statusEl.className = "status err";
    statusEl.textContent = "at most 4 options";
    return;
  }
  if (options.some((o) => o.includes("|"))) {
    statusEl.className = "status err";
    statusEl.textContent = "options can't contain the | character";
    return;
  }

  const payloadText = `${POLL_PREFIX}${myAddress}:${question}|${options.join("|")}`;
  const payloadBytes = textToPayloadBytes(payloadText);

  try {
    const { txid } = await buildSignSubmit({ toAddress: BOARD_ADDRESS, sompiAmount: CARRIER_SOMPI, payloadBytes, statusEl });
    log(`created poll ${txid}: "${question}" [${options.join(", ")}]`);
    $("#pollQuestion").value = "";
    document.querySelectorAll(".pollOption").forEach((el) => (el.value = ""));
    loadPolls();
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = String(e);
    log(`create poll failed: ${e}`);
  }
}

// ---- Vote ----

async function vote(pollTxid, optionIndex) {
  const statusEl = $(`#voteStatus-${pollTxid}`);
  if (!statusEl) return;
  statusEl.className = "status";
  statusEl.textContent = "";

  const payloadText = `${VOTE_PREFIX}${pollTxid}:${myAddress}:${optionIndex}`;
  const payloadBytes = textToPayloadBytes(payloadText);

  try {
    const { txid } = await buildSignSubmit({ toAddress: BOARD_ADDRESS, sompiAmount: CARRIER_SOMPI, payloadBytes, statusEl });
    log(`voted on poll ${pollTxid.slice(0, 12)}… option ${optionIndex}, tx ${txid}`);
    loadPolls();
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = String(e);
    log(`vote failed: ${e}`);
  }
}

// ---- Read + tally ----

async function loadPolls() {
  const listEl = $("#pollsList");
  listEl.innerHTML = "<p>loading…</p>";
  try {
    const res = await fetch(`${REST_BASE}/addresses/${BOARD_ADDRESS}/full-transactions?limit=100`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const txs = await res.json();

    const polls = new Map(); // pollTxid -> poll record
    const votesRaw = []; // {pollTxid, voter, optionIndex, time}

    for (const tx of txs) {
      if (!tx.payload) continue;
      if (!tx.outputs.some((o) => o.script_public_key_address === BOARD_ADDRESS)) continue;
      const text = safePayloadText(tx.payload);
      if (!text) continue;
      const time = Number(tx.block_time || 0);

      const poll = parsePollPayload(text, tx.transaction_id, time);
      if (poll) {
        polls.set(poll.pollTxid, poll);
        continue;
      }
      const v = parseVotePayload(text);
      if (v) votesRaw.push({ ...v, time });
    }

    // A wallet's most recent vote for a given pollTxid counts: keep only the
    // latest (highest block_time) vote per (pollTxid, voter) pair.
    const latestVotes = new Map(); // `${pollTxid}:${voter}` -> vote
    for (const v of votesRaw) {
      const key = `${v.pollTxid}:${v.voter}`;
      const existing = latestVotes.get(key);
      if (!existing || v.time > existing.time) latestVotes.set(key, v);
    }

    // Tally per poll, skipping votes for unknown polls or out-of-range options.
    const tallies = new Map(); // pollTxid -> counts array (index-aligned with poll.options)
    const myVotes = new Map(); // pollTxid -> this wallet's current optionIndex
    for (const v of latestVotes.values()) {
      const poll = polls.get(v.pollTxid);
      if (!poll) continue;
      if (v.optionIndex < 0 || v.optionIndex >= poll.options.length) continue;
      if (!tallies.has(v.pollTxid)) tallies.set(v.pollTxid, new Array(poll.options.length).fill(0));
      tallies.get(v.pollTxid)[v.optionIndex]++;
      if (v.voter === myAddress) myVotes.set(v.pollTxid, v.optionIndex);
    }

    const pollList = Array.from(polls.values()).sort((a, b) => b.time - a.time);

    if (pollList.length === 0) {
      listEl.innerHTML = "<p>no polls yet, create the first one above</p>";
      log(`polls: 0 found at board ${BOARD_ADDRESS.slice(0, 14)}…`);
      return;
    }

    listEl.innerHTML = "";
    for (const poll of pollList) {
      const counts = tallies.get(poll.pollTxid) || new Array(poll.options.length).fill(0);
      listEl.appendChild(renderPoll(poll, counts, myVotes.get(poll.pollTxid)));
    }
    log(`polls: loaded ${pollList.length} poll(s), ${latestVotes.size} distinct voter-poll vote(s) from ${votesRaw.length} raw vote tx(s)`);
  } catch (e) {
    listEl.innerHTML = `<p>error: ${e}</p>`;
    log(`polls load failed: ${e}`);
  }
}

function renderPoll(poll, counts, myVoteIndex) {
  const total = counts.reduce((a, b) => a + b, 0);

  const div = document.createElement("div");
  div.className = "panel poll-item";

  const metaDiv = document.createElement("div");
  metaDiv.className = "msg-meta";
  const when = poll.time ? new Date(poll.time).toLocaleString() : "unknown time";
  metaDiv.textContent = `${poll.creator.slice(0, 18)}… · ${when} · `;
  const code = document.createElement("code");
  code.textContent = `${poll.pollTxid.slice(0, 12)}…`;
  metaDiv.appendChild(code);
  div.appendChild(metaDiv);

  const h3 = document.createElement("h3");
  h3.textContent = poll.question;
  div.appendChild(h3);

  const optionsDiv = document.createElement("div");
  optionsDiv.className = "poll-options";

  poll.options.forEach((optionText, i) => {
    const count = counts[i] || 0;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const isMine = myVoteIndex === i;

    const optDiv = document.createElement("div");
    optDiv.className = "poll-option";

    const rowDiv = document.createElement("div");
    rowDiv.className = "poll-option-row";

    const btn = document.createElement("button");
    btn.className = "button poll-vote-btn" + (isMine ? " voted" : "");
    btn.textContent = isMine ? "Your vote" : "Vote";
    btn.disabled = isMine;
    btn.addEventListener("click", () => vote(poll.pollTxid, i));
    rowDiv.appendChild(btn);

    const label = document.createElement("span");
    label.className = "poll-option-label";
    label.textContent = optionText;
    rowDiv.appendChild(label);

    const countSpan = document.createElement("span");
    countSpan.className = "poll-option-count";
    countSpan.textContent = `${count} vote${count === 1 ? "" : "s"} (${pct}%)`;
    rowDiv.appendChild(countSpan);

    optDiv.appendChild(rowDiv);

    const barDiv = document.createElement("div");
    barDiv.className = "poll-bar";
    const fillDiv = document.createElement("div");
    fillDiv.className = "poll-bar-fill";
    fillDiv.style.width = `${pct}%`;
    barDiv.appendChild(fillDiv);
    optDiv.appendChild(barDiv);

    optionsDiv.appendChild(optDiv);
  });

  div.appendChild(optionsDiv);

  const totalP = document.createElement("p");
  totalP.className = "hint";
  totalP.textContent = `${total} total vote${total === 1 ? "" : "s"}`;
  div.appendChild(totalP);

  const statusDiv = document.createElement("div");
  statusDiv.className = "status";
  statusDiv.id = `voteStatus-${poll.pollTxid}`;
  div.appendChild(statusDiv);

  return div;
}

// ---- Create-poll option row management (2-4 options) ----

function updateOptionButtons() {
  const count = document.querySelectorAll(".pollOption").length;
  $("#btnAddOption").disabled = count >= 4;
  $("#btnRemoveOption").disabled = count <= 2;
}

function addOptionInput() {
  const container = $("#optionInputs");
  const count = container.querySelectorAll(".pollOption").length;
  if (count >= 4) return;
  const rowDiv = document.createElement("div");
  rowDiv.className = "row option-input-row";
  const input = document.createElement("input");
  input.className = "pollOption";
  input.placeholder = `option ${count + 1}`;
  input.spellcheck = false;
  rowDiv.appendChild(input);
  container.appendChild(rowDiv);
  updateOptionButtons();
}

function removeOptionInput() {
  const container = $("#optionInputs");
  const rows = container.querySelectorAll(".option-input-row");
  if (rows.length <= 2) return;
  rows[rows.length - 1].remove();
  updateOptionButtons();
}

function bindUI() {
  $("#btnRefresh").addEventListener("click", refreshBalance);
  $("#btnAddOption").addEventListener("click", addOptionInput);
  $("#btnRemoveOption").addEventListener("click", removeOptionInput);
  $("#btnCreatePoll").addEventListener("click", createPoll);
  $("#btnLoadPolls").addEventListener("click", loadPolls);

  document.querySelectorAll(".copy").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.dataset.copy);
      navigator.clipboard.writeText(target.textContent);
      btn.textContent = "copied";
      setTimeout(() => (btn.textContent = "copy"), 1000);
    });
  });

  updateOptionButtons();
}

async function boot() {
  log("loading kaspa-wasm SDK (v2.0.1, official rusty-kaspa browser build)…");
  await init();
  log(`SDK ready, kaspa-wasm version ${version()}`);

  BOARD_ADDRESS = new PrivateKey(sha256FromText("kaspaexplained-tn10-polls:v1")).toAddress(NETWORK_ID).toString();
  log(`polls board address: ${BOARD_ADDRESS}`);
  $("#boardAddress").textContent = BOARD_ADDRESS;

  loadWallet();
  bindUI();
  renderWallet();
  loadPolls();

  try {
    await connectRpc();
    refreshBalance();
  } catch (e) {
    log(`RPC connect failed: ${e}`);
  }
}

boot();
