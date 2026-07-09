import init, {
  Keypair,
  PrivateKey,
  Resolver,
  RpcClient,
  kaspaToSompi,
  sompiToKaspaString,
  createTransactions,
  createTransaction,
  createInputSignature,
  calculateTransactionFee,
  version,
  sha256FromText,
  encryptXChaCha20Poly1305,
  decryptXChaCha20Poly1305,
  ScriptBuilder,
  Opcodes,
  SighashType,
  payToAddressScript,
  payToScriptHashScript,
  addressFromScriptPublicKey,
} from "./sdk/kaspa/kaspa.js";

// Pay-to-unlock content locker. A creator locks a small TN10 payment behind
// a hash-lock script: OP_SHA256 <hash> OP_EQUALVERIFY <pubkey> OP_CHECKSIG,
// wrapped pay-to-script-hash (P2SH) with the official SDK's ScriptBuilder /
// payToScriptHashScript / createTransaction. Claiming that payment requires
// publishing the secret whose hash matches, in the clear, inside the
// claiming transaction's own signature script. That transaction is public,
// so the secret becomes public the moment it's spent, which is what
// actually unlocks the content for whoever paid.
//
// This is a real, older script primitive (P2SH + hash-lock), not Kaspa's
// newer covenant-ID mechanism (CovenantBinding / covenantId() /
// OpInputCovenantId / OpOutputCovenantId). Both are real in the same SDK;
// this page only built and tested the first one. See vault.html's "What
// this actually is" panel for why that distinction matters here.

const NETWORK_ID = "testnet-10";
const REST_BASE = "https://api-tn10.kaspa.org";
const STORAGE_KEY = "kaspaexplained-tn10-vault-wallet";
const MINE_KEY = "kaspaexplained-tn10-vault-mine";
const PURCHASES_KEY = "kaspaexplained-tn10-vault-purchases";
const LISTING_SEED = "kaspaexplained-tn10-vault-listings:v1";
const LISTING_PREFIX = "vault:1:list:";
const LISTING_DUST = 20000000n; // 0.2 tKAS carrier for a listing announcement, same value used elsewhere for post/announce txs
const MIN_PRICE_KAS = "0.2";
const MAX_PRICE_KAS = "10"; // same public-play-wallet ceiling wallet.js's Send form uses
const CONTENT_MAX_CHARS = 300;
const CLAIM_FEE_FALLBACK = 300000n; // sompi, used only if calculateTransactionFee can't be used

let rpc = null;
let walletPrivKeyHex = null;
let LISTING_ADDRESS = null; // set in boot() once the WASM module is initialized
let currentListings = []; // last fetched listing set

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

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256HexOfBytes(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return bytesToHex(new Uint8Array(digest));
}

function readJsonList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeJsonList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // ignore write failures (private browsing etc); still works for this session
  }
}

// ---- Wallet ----
// Own single localStorage wallet, separate from the main experiment page's
// multi-wallet key, same pattern board.js and tipjar.js already use.

function loadOrCreateWallet() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      walletPrivKeyHex = stored;
      return;
    }
  } catch {
    // localStorage unavailable; fall through to an in-memory wallet
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

// Shared build -> sign -> submit -> verify-acceptance path for plain sends
// (listing announcements and payments), same pattern as wallet.js/board.js.
async function buildSignSubmit({ toAddress, sompiAmount, payloadBytes, statusEl }) {
  const address = addressFor();
  const privateKey = new PrivateKey(walletPrivKeyHex);

  await ensureConnected();
  statusEl.className = "status";
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
    log(`submitted -> txid ${lastTxid} | sdk kaspa-wasm ${version()} | network ${NETWORK_ID} | changeAddress ${address}`);
  }

  statusEl.className = "status";
  statusEl.textContent = `submitted, txid ${lastTxid}\nwaiting for accepted-transaction evidence…`;

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

// ---- Script construction ----

// Pull the exact 32-byte x-only pubkey Kaspa consensus already embeds in a
// standard pay-to-address script, instead of independently re-deriving it
// from a PublicKey object and hoping the byte layout matches. payToAddressScript
// is the same call the network already accepts for every plain send in this
// experiment, so its output bytes are trusted by construction.
function pubkeyHexForAddress(address) {
  const spk = payToAddressScript(address);
  const hex = spk.script; // "20" (push-32) + 64 hex chars (32 bytes) + "ac" (OP_CHECKSIG)
  return hex.slice(2, 2 + 64);
}

function buildRedeemScript(hashHex, pubkeyHex) {
  const sb = new ScriptBuilder();
  sb.addOp(Opcodes.OpSHA256);
  sb.addData(hashHex);
  sb.addOp(Opcodes.OpEqualVerify);
  sb.addData(pubkeyHex);
  sb.addOp(Opcodes.OpCheckSig);
  return sb.toString();
}

// Stack order matters: the redeem script's OP_SHA256 consumes whatever is
// on top of the stack when it runs, so the secret has to be the last thing
// pushed before the redeem script itself (sig underneath it), not the
// first. Confirmed against a live TN10 node: pushing secret-then-sig got
// "script ran, but verification failed" because OP_SHA256 hashed the
// signature instead of the secret.
//
// createInputSignature() already returns a complete canonical push (its
// own length-opcode byte + the signature bytes + a trailing sighash-type
// byte), the same shape a plain P2PK signature script uses elsewhere in
// this codebase. addData() on that value double-encodes it (wraps an
// already-length-prefixed blob in a second length prefix), which a live
// TN10 node rejected as "signature invalid: malformed signature". addOps()
// appends it verbatim instead, the same way redeemScriptHex's own bytes
// get appended as the final push.
function buildClaimSignatureScript(secretHex, sigHex, redeemScriptHex) {
  const sb = new ScriptBuilder();
  sb.addOps(sigHex);
  sb.addData(secretHex);
  sb.addData(redeemScriptHex);
  return sb.toString();
}

// ---- Lock an item (creator) ----

async function lockItem() {
  const title = $("#itemTitle").value.trim();
  const content = $("#itemContent").value;
  const priceStr = $("#itemPrice").value.trim();
  const statusEl = $("#lockStatus");
  statusEl.className = "status";
  statusEl.textContent = "";

  if (!title || title.includes(":")) {
    statusEl.className = "status err";
    statusEl.textContent = "title is required and must not contain the : character (used as the on-chain field delimiter)";
    return;
  }
  if (!content) {
    statusEl.className = "status err";
    statusEl.textContent = "content is empty";
    return;
  }
  if (content.length > CONTENT_MAX_CHARS) {
    statusEl.className = "status err";
    statusEl.textContent = `content is over the ${CONTENT_MAX_CHARS} character demo cap`;
    return;
  }
  let priceSompi = kaspaToSompi(priceStr);
  if (!priceSompi) {
    statusEl.className = "status err";
    statusEl.textContent = "invalid price";
    return;
  }
  if (priceSompi < kaspaToSompi(MIN_PRICE_KAS)) priceSompi = kaspaToSompi(MIN_PRICE_KAS);
  if (priceSompi > kaspaToSompi(MAX_PRICE_KAS)) {
    statusEl.className = "status err";
    statusEl.textContent = `this is a public play wallet, prices are capped at ${MAX_PRICE_KAS} tKAS`;
    return;
  }

  try {
    statusEl.textContent = "building lock script…";
    const creatorAddress = addressFor();
    const secretBytes = crypto.getRandomValues(new Uint8Array(32));
    const secretHex = bytesToHex(secretBytes);
    const hashHex = await sha256HexOfBytes(secretBytes);
    const pubkeyHex = pubkeyHexForAddress(creatorAddress);
    const redeemScriptHex = buildRedeemScript(hashHex, pubkeyHex);
    const p2shSpk = payToScriptHashScript(redeemScriptHex);
    const vaultAddress = addressFromScriptPublicKey(p2shSpk, NETWORK_ID).toString();
    const encryptedContent = encryptXChaCha20Poly1305(content, secretHex);

    const mine = readJsonList(MINE_KEY);
    mine.push({
      vaultAddress,
      redeemScriptHex,
      secretHex,
      title,
      priceSompi: priceSompi.toString(),
      createdAt: Date.now(),
    });
    writeJsonList(MINE_KEY, mine);
    log(`vault locked locally: ${vaultAddress.slice(0, 18)}… (redeem script + secret kept in this browser only)`);

    statusEl.textContent = "publishing listing…";
    const payloadText = `${LISTING_PREFIX}${creatorAddress}:${vaultAddress}:${priceSompi.toString()}:${title}:${encryptedContent}`;
    const payload = textToPayloadBytes(payloadText);
    const result = await buildSignSubmit({ toAddress: LISTING_ADDRESS, sompiAmount: LISTING_DUST, payloadBytes: payload, statusEl });

    $("#itemTitle").value = "";
    $("#itemContent").value = "";
    log(`listing published -> txid ${result.txid}, vault address ${vaultAddress}`);
    loadListings();
    renderMine();
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = String(e);
    log(`lock item failed: ${e}`);
  }
}

// ---- Listings (buyer) ----

async function fetchListingTransactions() {
  const res = await fetch(`${REST_BASE}/addresses/${LISTING_ADDRESS}/full-transactions?limit=100`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

// Pure function: raw REST transaction list in, parsed listing list out.
// Same fixed-prefix colon-skip technique used across this experiment: two
// embedded kaspatest:... addresses each have their own colon, so a naive
// indexOf(":") split breaks. Skip past each address's known "kaspatest:"
// prefix length before looking for the real field separator.
function parseListings(txs) {
  const out = [];
  for (const tx of txs) {
    if (!tx.payload) continue;
    const text = safePayloadText(tx.payload);
    if (!text || !text.startsWith(LISTING_PREFIX)) continue;
    const rest = text.slice(LISTING_PREFIX.length);
    const p1 = rest.indexOf(":", "kaspatest:".length);
    if (p1 === -1) continue;
    const creatorAddress = rest.slice(0, p1);
    const rest2 = rest.slice(p1 + 1);
    const p2 = rest2.indexOf(":", "kaspatest:".length);
    if (p2 === -1) continue;
    const vaultAddress = rest2.slice(0, p2);
    const rest3 = rest2.slice(p2 + 1);
    const p3 = rest3.indexOf(":");
    if (p3 === -1) continue;
    const priceSompi = rest3.slice(0, p3);
    const rest4 = rest3.slice(p3 + 1);
    const p4 = rest4.indexOf(":");
    if (p4 === -1) continue;
    const title = rest4.slice(0, p4);
    const encryptedContent = rest4.slice(p4 + 1);
    if (!title || !encryptedContent) continue;
    out.push({
      listingTxid: tx.transaction_id,
      time: Number(tx.block_time || 0),
      creatorAddress,
      vaultAddress,
      priceSompi,
      title,
      encryptedContent,
    });
  }
  return out.sort((a, b) => b.time - a.time);
}

async function loadListings() {
  const statusEl = $("#listingsStatus");
  try {
    statusEl.className = "status";
    statusEl.textContent = "loading…";
    const txs = await fetchListingTransactions();
    currentListings = parseListings(txs);
    statusEl.textContent = "";
    renderListings();
    log(`listings: parsed ${currentListings.length} listing(s) from ${txs.length} transaction(s) on ${LISTING_ADDRESS.slice(0, 14)}…`);
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = String(e);
    log(`listings load failed: ${e}`);
  }
}

function findPurchase(vaultAddress) {
  return readJsonList(PURCHASES_KEY).find((p) => p.vaultAddress === vaultAddress);
}

async function payForListing(listing) {
  const statusEl = $("#listingsStatus");
  try {
    const priceSompi = BigInt(listing.priceSompi);
    if (priceSompi > kaspaToSompi(MAX_PRICE_KAS)) {
      statusEl.className = "status err";
      statusEl.textContent = "listed price is above this demo's send cap, refusing to auto-pay";
      return;
    }
    const result = await buildSignSubmit({ toAddress: listing.vaultAddress, sompiAmount: priceSompi, statusEl });
    const purchases = readJsonList(PURCHASES_KEY);
    purchases.push({ vaultAddress: listing.vaultAddress, listingTxid: listing.listingTxid, paymentTxid: result.txid });
    writeJsonList(PURCHASES_KEY, purchases);
    log(`paid for listing "${listing.title}" -> ${result.txid}, waiting for creator to claim before it can unlock`);
    renderListings();
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = String(e);
    log(`payment failed: ${e}`);
  }
}

// Look for the transaction that spends the buyer's own known payment
// outpoint from the vault address's transaction history, then pull the
// first pushed data item out of that input's signature script: the 32-byte
// secret this page always pushes first when claiming. That secret is the
// same one whose SHA-256 sits in the locking script, so once it's public,
// anyone can use it, not just the original buyer.
async function tryUnlock(listing, purchase) {
  const res = await fetch(`${REST_BASE}/addresses/${listing.vaultAddress}/full-transactions?limit=20`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const txs = await res.json();
  for (const tx of txs) {
    for (const input of tx.inputs || []) {
      if (input.previous_outpoint_hash === purchase.paymentTxid) {
        const sigScript = input.signature_script || "";
        // Claim signature scripts here are always exactly three canonical
        // data pushes: <sig> <secret> <redeemScript>. Walk the first push
        // (the signature, variable length) to find where the second push
        // (the fixed 32-byte secret) starts, rather than assuming a fixed
        // offset. OpData1..OpData75 encode their own push length as the
        // opcode's numeric value, which is what ScriptBuilder.addData used.
        const pushLenHex = sigScript.slice(0, 2);
        const pushLen = parseInt(pushLenHex, 16);
        if (!pushLen || pushLen > 75) continue; // not a canonical single-byte-length push, unexpected shape
        const secretStart = 2 + pushLen * 2 + 2; // past sig's opcode+bytes, past secret's own 1-byte length opcode
        const secretHex = sigScript.slice(secretStart, secretStart + 64);
        if (secretHex.length !== 64) continue;
        try {
          const plaintext = decryptXChaCha20Poly1305(listing.encryptedContent, secretHex);
          return { plaintext, claimTxid: tx.transaction_id };
        } catch {
          continue; // wrong push length/offset assumption for this input, keep looking
        }
      }
    }
  }
  return null;
}

function listingCard(listing) {
  const card = document.createElement("div");
  card.className = "msg-item";

  const meta = document.createElement("div");
  meta.className = "msg-meta";
  meta.textContent = `${listing.creatorAddress.slice(0, 18)}… · ${sompiToKaspaString(BigInt(listing.priceSompi))} tKAS · ${listing.listingTxid.slice(0, 12)}…`;
  card.appendChild(meta);

  const titleEl = document.createElement("div");
  titleEl.className = "msg-text";
  titleEl.textContent = listing.title;
  card.appendChild(titleEl);

  const myAddress = addressFor();
  const isMine = listing.creatorAddress === myAddress;
  const purchase = findPurchase(listing.vaultAddress);

  const body = document.createElement("div");
  body.className = "hint";
  body.textContent = "locked, content hidden until a payment is claimed";
  card.appendChild(body);

  if (isMine) {
    body.textContent = "this is your own listing, see \"Items you locked\" below to claim payments";
  } else if (!purchase) {
    const btn = document.createElement("button");
    btn.className = "button primary";
    btn.textContent = `Pay ${sompiToKaspaString(BigInt(listing.priceSompi))} tKAS to unlock`;
    btn.addEventListener("click", () => payForListing(listing));
    card.appendChild(btn);
  } else {
    const btn = document.createElement("button");
    btn.className = "button";
    btn.textContent = "Check unlock";
    btn.addEventListener("click", async () => {
      body.textContent = "checking for the creator's claim transaction…";
      try {
        const result = await tryUnlock(listing, purchase);
        if (result) {
          body.textContent = `unlocked (claim txid ${result.claimTxid.slice(0, 12)}…): ${result.plaintext}`;
          log(`unlocked "${listing.title}" from claim tx ${result.claimTxid}`);
        } else {
          body.textContent = "paid, still waiting on the creator's claim transaction, try again shortly";
        }
      } catch (e) {
        body.textContent = `unlock check failed: ${e}`;
      }
    });
    card.appendChild(btn);
  }

  return card;
}

function renderListings() {
  const container = $("#listings");
  container.innerHTML = "";
  if (currentListings.length === 0) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "no listings yet";
    container.appendChild(empty);
    return;
  }
  for (const listing of currentListings) {
    container.appendChild(listingCard(listing));
  }
}

// ---- Items you locked (creator claim flow) ----

async function claimItem(item) {
  const statusEl = $("#mineStatus");
  statusEl.className = "status";
  statusEl.textContent = `checking ${item.vaultAddress.slice(0, 18)}… for payments`;
  try {
    await ensureConnected();
    const { entries } = await rpc.getUtxosByAddresses([item.vaultAddress]);
    if (entries.length === 0) {
      statusEl.textContent = "no payment waiting on this item yet";
      return;
    }
    const entry = entries[0];
    const utxoEntry = {
      address: entry.address,
      outpoint: entry.outpoint,
      amount: entry.amount,
      scriptPublicKey: entry.scriptPublicKey,
      blockDaaScore: entry.blockDaaScore,
      isCoinbase: entry.isCoinbase,
    };

    const creatorAddress = addressFor();
    const creatorPrivateKey = new PrivateKey(walletPrivKeyHex);

    statusEl.textContent = "building claim transaction…";
    let tx = createTransaction([utxoEntry], [{ address: creatorAddress, amount: entry.amount }], 0n, null, 1);

    // Estimate the fee with a correctly-sized placeholder signature script
    // in place first. The real P2SH claim script (sig + secret + redeem
    // script, ~170 bytes) is far bigger than a plain P2PK signature script,
    // so estimating mass/fee against an empty/default signatureScript
    // undercounts it. Confirmed against a live TN10 node: the real
    // signature verified fine, but the tx was rejected as "not standard"
    // for paying a fee computed before the signature script was attached.
    // Schnorr signatures here are always a fixed 64 bytes plus a 1-byte
    // sighash-type suffix (65 bytes payload, canonical push opcode 0x41),
    // so the placeholder only needs to match that length, not the real
    // signature bytes, since fee only depends on serialized size.
    const dummySigHex = "41" + "00".repeat(65);
    tx.inputs[0].signatureScript = buildClaimSignatureScript(item.secretHex, dummySigHex, item.redeemScriptHex);

    let fee = CLAIM_FEE_FALLBACK;
    try {
      const estimated = calculateTransactionFee(NETWORK_ID, tx);
      if (estimated) fee = estimated;
    } catch {
      // keep fallback fee
    }
    if (entry.amount <= fee) {
      statusEl.className = "status err";
      statusEl.textContent = `payment (${sompiToKaspaString(entry.amount)} tKAS) is too small to cover the claim fee`;
      return;
    }
    tx.outputs[0].value = entry.amount - fee;
    tx.finalize();

    statusEl.textContent = "signing claim (hand-built P2SH signature script, not the wallet auto-signer)…";
    const sigHex = createInputSignature(tx, 0, creatorPrivateKey, SighashType.All);
    const sigScriptHex = buildClaimSignatureScript(item.secretHex, sigHex, item.redeemScriptHex);
    tx.inputs[0].signatureScript = sigScriptHex;

    statusEl.textContent = "submitting claim transaction…";
    const submitResult = await rpc.submitTransaction({ transaction: tx });
    const txid = submitResult.transactionId;
    log(
      `claim submitted -> txid ${txid} | spends vault ${item.vaultAddress.slice(0, 18)}… | fee ${fee} sompi | payout ${sompiToKaspaString(tx.outputs[0].value)} tKAS to ${creatorAddress.slice(0, 14)}…`
    );

    statusEl.textContent = `submitted, txid ${txid}\nwaiting for accepted-transaction evidence…`;
    const accepted = await fetchAcceptance(txid);
    if (accepted) {
      statusEl.className = "status ok";
      statusEl.textContent = `txid ${txid}\naccepted: ${accepted.is_accepted}\nblock: ${accepted.accepting_block_hash || "n/a"}\nsecret is now public on-chain in this transaction's signature script`;
      log(`acceptance check via REST: is_accepted=${accepted.is_accepted}`);
    } else {
      statusEl.className = "status err";
      statusEl.textContent = `txid ${txid}\nsubmitted, but acceptance not confirmed yet via REST after polling, and/or the node rejected the custom P2SH signature script. Check manually: https://api-tn10.kaspa.org/transactions/${txid}`;
      log(`acceptance check timed out or submission failed for ${txid}`);
    }
    refreshBalance();
    renderMine();
  } catch (e) {
    statusEl.className = "status err";
    statusEl.textContent = String(e);
    log(`claim failed: ${e}`);
  }
}

function renderMine() {
  const container = $("#mine");
  container.innerHTML = "";
  const mine = readJsonList(MINE_KEY);
  if (mine.length === 0) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "you haven't locked anything yet";
    container.appendChild(empty);
    return;
  }
  for (const item of mine) {
    const card = document.createElement("div");
    card.className = "msg-item";

    const meta = document.createElement("div");
    meta.className = "msg-meta";
    meta.textContent = `${item.vaultAddress.slice(0, 18)}… · ${sompiToKaspaString(BigInt(item.priceSompi))} tKAS`;
    card.appendChild(meta);

    const titleEl = document.createElement("div");
    titleEl.className = "msg-text";
    titleEl.textContent = item.title;
    card.appendChild(titleEl);

    const btn = document.createElement("button");
    btn.className = "button primary";
    btn.textContent = "Check for payment / claim";
    btn.addEventListener("click", () => claimItem(item));
    card.appendChild(btn);

    container.appendChild(card);
  }
}

// ---- Boot ----

function bindUI() {
  $("#btnRefreshBalance").addEventListener("click", refreshBalance);
  $("#btnLock").addEventListener("click", lockItem);
  $("#btnRefreshListings").addEventListener("click", loadListings);
  $("#btnRefreshMine").addEventListener("click", renderMine);

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
  LISTING_ADDRESS = new PrivateKey(sha256FromText(LISTING_SEED)).toAddress(NETWORK_ID).toString();
  log(`listing address: ${LISTING_ADDRESS}`);

  loadOrCreateWallet();
  bindUI();
  renderWallet();
  renderMine();
  loadListings();

  try {
    await connectRpc();
    refreshBalance();
  } catch (e) {
    log(`RPC connect failed: ${e}`);
  }
}

boot();
