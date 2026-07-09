import init, {
  Keypair,
  PrivateKey,
  Resolver,
  RpcClient,
  kaspaToSompi,
  sompiToKaspaString,
  createTransactions,
  version,
} from "./sdk/kaspa/kaspa.js";

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
  await rpc.connect();
  const info = await rpc.getServerInfo();
  log(
    `RPC connected via public resolver -> node ${info.serverVersion}, network ${info.networkId}, synced=${info.isSynced}, utxoIndex=${info.hasUtxoIndex}, virtualDaa=${info.virtualDaaScore}`
  );
}

async function refreshBalance() {
  if (!rpc) {
    $("#balance").textContent = "connecting…";
    return;
  }
  const pk = wallets[activeIndex];
  const address = addressFor(pk);
  $("#balance").textContent = "loading…";
  try {
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
  refreshBalance();
}

async function loadUtxos() {
  if (!rpc) {
    alert("Still connecting to a TN10 node, try again in a moment.");
    return;
  }
  const pk = wallets[activeIndex];
  const address = addressFor(pk);
  const tbody = $("#utxoTable tbody");
  tbody.innerHTML = `<tr><td colspan="3">loading…</td></tr>`;
  try {
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

async function send() {
  if (!rpc) {
    alert("Still connecting to a TN10 node, try again in a moment.");
    return;
  }
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

  const pk = wallets[activeIndex];
  const address = addressFor(pk);
  const privateKey = new PrivateKey(pk);

  try {
    statusEl.textContent = "fetching UTXOs…";
    const { entries } = await rpc.getUtxosByAddresses([address]);
    if (entries.length === 0) throw new Error("no spendable UTXOs on this wallet");

    statusEl.textContent = "building transaction…";
    const { transactions, summary } = await createTransactions({
      outputs: [{ address: to, amount: sompiAmount }],
      changeAddress: address,
      priorityFee: 0n,
      entries,
      networkId: NETWORK_ID,
    });
    log(`generator summary: ${JSON.stringify(summary, (_, v) => (typeof v === "bigint" ? v.toString() : v))}`);

    let lastTxid = null;
    for (const tx of transactions) {
      tx.sign([privateKey]);
      lastTxid = await tx.submit(rpc);
      log(
        `submitted -> txid ${lastTxid} | sdk kaspa-wasm ${version()} | network ${NETWORK_ID} | endpoint via Resolver | encoding default | changeAddress ${address}`
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
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = String(e);
    log(`send failed: ${e}`);
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
