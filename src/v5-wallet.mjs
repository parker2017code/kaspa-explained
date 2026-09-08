// Browser-only V5 wallet. No private key or recovery material enters an API request.
import {signV5MarketPayment,reviewV5MarketPlan} from './v5-market-wallet.mjs';
import {publicTransactionMass} from './public-contracts.mjs';

export const V5_NETWORK = 'testnet-10';
export const V5_WALLET_STORE = 'kaspa-v5-wallet-v1';
const DEFAULT_ORIGIN = typeof location !== 'undefined' && ['127.0.0.1','localhost'].includes(location.hostname) ? location.origin : 'https://kaspa-demo-faucet.parker2017.workers.dev';
const MAX_FEE = 1000000n, HEX = /^[0-9a-f]{64}$/;
const clone = value => structuredClone(value);
const text = value => new TextEncoder().encode(value);
const hex = value => Array.from(value, n => n.toString(16).padStart(2, '0')).join('');
const fail = message => { throw Object.assign(new Error(message), {safeMessage: message}); };
const scriptOf = entry => entry.entry?.scriptPublicKey || entry.scriptPublicKey;
const outpointId = value => `${value.transactionId}:${value.index}`;
const encode = value => { let result = ''; for (let i = 0; i < value.length; i += 32768) result += String.fromCharCode(...value.subarray(i, i + 32768)); return btoa(result); };
const decode = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
export const v5WalletSessionMessage = (address, nonce) => `Kaspa Explained V5 session\nTestnet-10\n${address}\n${nonce}`;

function addressScript(sdk, address) {
  if (typeof address !== 'string' || !address.startsWith('kaspatest:') || address.length > 100) fail('Use a Testnet-10 wallet address.');
  const parsed = new sdk.Address(address), script = sdk.payToAddressScript(parsed);
  if (parsed.toString() !== address || script.version !== 0 || !/^20[0-9a-f]{64}ac$/.test(script.script)) fail('Use a standard Testnet-10 wallet address.');
  return script;
}

function checkPayment(sdk, tx, {source, destination, amountSompi, feeRate = 100}) {
  const own = addressScript(sdk, source), recipient = addressScript(sdk, destination);
  if (source === destination || !/^[1-9][0-9]*$/.test(String(amountSompi))) fail('Invalid payment amount or destination.');
  if (tx.version !== 1 || tx.lockTime !== 0n || tx.subnetworkId !== '00'.repeat(20) || tx.gas !== 0n || tx.payload !== '' || tx.inputs.length < 1 || tx.inputs.length > 8 || tx.outputs.length !== 2) fail('Unexpected payment transaction.');
  let total = 0n; const used = new Set();
  for (const input of tx.inputs) {
    const entry = input.utxo, id = outpointId(input.previousOutpoint);
    if (!entry || outpointId(entry.outpoint) !== id || used.has(id) || entry.covenantId || entry.entry?.covenantId || scriptOf(entry)?.version !== 0 || scriptOf(entry)?.script !== own.script || BigInt(entry.amount) <= 0n || input.sequence !== 0n || input.computeBudget !== 16 || !/^41[0-9a-f]{128}01$/i.test(input.signatureScript)) fail('Payment inputs changed.');
    total += BigInt(entry.amount); used.add(id);
  }
  const [payment, change] = tx.outputs;
  if (payment.value !== BigInt(amountSompi) || payment.scriptPublicKey.version !== 0 || payment.scriptPublicKey.script !== recipient.script || payment.covenant || change.value <= 0n || change.scriptPublicKey.version !== 0 || change.scriptPublicKey.script !== own.script || change.covenant) fail('Payment or wallet change changed.');
  const fee = total - payment.value - change.value, mass = publicTransactionMass(tx, {feeRate});
  if (fee < BigInt(mass.minimumFee) || fee > MAX_FEE || !mass.withinBlockLimits || tx.storageMass !== BigInt(mass.storageMass)) fail('Payment exceeds its fee or mass limit.');
  tx.finalize();
  return {transactionId: tx.id, feeSompi: String(fee)};
}

/** Pure unsigned payment plan, with fixed-size signature placeholders. */
export function buildV5WalletPayment(sdk, {entries, source, destination, amountSompi, feeRate = 100}) {
  const own = addressScript(sdk, source), recipient = addressScript(sdk, destination);
  if (!Number.isSafeInteger(feeRate) || feeRate < 100 || feeRate > 100000 || !Array.isArray(entries) || entries.length > 512) fail('The network returned unusable payment inputs or fees.');
  if (!/^[1-9][0-9]*$/.test(String(amountSompi)) || source === destination) fail('Invalid payment amount or destination.');
  const amount = BigInt(amountSompi), selected = []; let total = 0n;
  const usable = entries.filter(e => !e.covenantId && !e.entry?.covenantId && scriptOf(e)?.version === 0 && scriptOf(e)?.script === own.script && BigInt(e.amount) > 0n).sort((a, b) => BigInt(a.amount) > BigInt(b.amount) ? -1 : 1);
  if (new Set(usable.map(e => outpointId(e.outpoint))).size !== usable.length) fail('The node returned duplicate wallet outputs.');
  for (const entry of usable.slice(0, 8)) {
    selected.push(entry); total += BigInt(entry.amount); let fee = 1000n;
    for (let attempt = 0; attempt < 6 && total > amount + fee; attempt++) {
      const transaction = new sdk.Transaction({version: 1, inputs: selected.map(e => ({previousOutpoint: e.outpoint, utxo: e, signatureScript: '41' + '00'.repeat(64) + '01', sequence: 0n, sigOpCount: 0, computeBudget: 16})), outputs: [{value: amount, scriptPublicKey: recipient}, {value: total - amount - fee, scriptPublicKey: own}], lockTime: 0n, subnetworkId: '00'.repeat(20), gas: 0n, payload: ''});
      const mass = publicTransactionMass(transaction, {feeRate});
      if (fee < BigInt(mass.minimumFee)) { fee = BigInt(mass.minimumFee); continue; }
      if (!mass.withinBlockLimits || fee > MAX_FEE) break;
      transaction.storageMass = BigInt(mass.storageMass);
      return {transaction, ...checkPayment(sdk, transaction, {source, destination, amountSompi, feeRate})};
    }
  }
  fail('Not enough spendable test coins for this purchase and its fee.');
}

async function cryptKey(crypto, password, salt) {
  const raw = await crypto.subtle.importKey('raw', text(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256'}, raw, {name: 'AES-GCM', length: 256}, false, ['encrypt', 'decrypt']);
}
async function seal(crypto, value, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({name: 'AES-GCM', iv}, await cryptKey(crypto, password, salt), text(JSON.stringify(value)));
  return {version: 1, network: V5_NETWORK, kdf: 'PBKDF2-SHA256', iterations: 250000, salt: encode(salt), iv: encode(iv), ciphertext: encode(new Uint8Array(cipher))};
}
async function unseal(crypto, envelope, password) {
  if (!envelope || envelope.version !== 1 || envelope.network !== V5_NETWORK || envelope.kdf !== 'PBKDF2-SHA256' || envelope.iterations !== 250000 || typeof envelope.ciphertext !== 'string' || envelope.ciphertext.length > 500000) fail('Invalid V5 recovery file.');
  try {
    const salt = decode(envelope.salt), iv = decode(envelope.iv);
    if (salt.length !== 16 || iv.length !== 12) throw Error();
    return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name: 'AES-GCM', iv}, await cryptKey(crypto, password, salt), decode(envelope.ciphertext))));
  } catch { fail('The recovery password or file is incorrect.'); }
}

/**
 * Creates isolated browser wallet infrastructure; no DOM or backend signer access.
 * Inject sdk/rpc/fetch/storage/crypto for tests. Defaults load the bundled SDK and
 * connect directly to the existing indexed TN10 node. Methods return snapshots
 * containing authoritative service state/view, never private keys/capabilities.
 *
 * start(): create only if no saved wallet, otherwise restore. restore(): reopen
 * browser recovery and reauthenticate. exportRecovery(password): password-encrypted
 * JSON string; restoreRecovery(json,password): import without replacing another
 * saved wallet. getBalance(): observed spendable amountSompi. requestCoins(): one
 * durable faucet request. action(action): save action ID, prepare/register/send a
 * purchase or request a reward. status(): reconcile only, never broadcast.
 * retryPayment(): explicitly register/rebroadcast identical saved purchase bytes.
 * snapshot(): public state. disconnect(): close RPC, preserve recovery.
 *
 * Automatic local recovery stores a random wrapping secret beside ciphertext;
 * it protects against accidental cleartext logging, not same-origin code access.
 * Export uses the caller's password and contains no automatic wrapping secret.
 */
export function createV5Wallet(options = {}) {
  const crypto = options.crypto || globalThis.crypto, storage = options.storage || globalThis.localStorage, fetcher = options.fetch || globalThis.fetch;
  const origin = (options.apiOrigin || DEFAULT_ORIGIN).replace(/\/$/, ''), store = options.storeKey || V5_WALLET_STORE;
  let templates = options.argentTemplates;
  let sdk = options.sdk, rpc = options.rpc, data = null, key = null, secret = null, disk = null, response = null, queue = Promise.resolve();
  const run = fn => { const next = queue.then(fn); queue = next.catch(() => {}); return next; };
  const timed = promise => { let timer; return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(Error('The test network did not respond. Your saved request can be checked again.')), options.timeoutMs || 15000); })]).finally(() => clearTimeout(timer)); };
  const random = n => hex(crypto.getRandomValues(new Uint8Array(n)));
  const snapshot = () => clone({network: V5_NETWORK, address: data?.address || null, playerId: data?.playerId || null, ...response, capability: undefined, balanceSompi: data?.balanceSompi ?? null, pendingAction: data?.pendingAction || null, marketJournal: data?.marketJournal ? {paymentId:data.marketJournal.paymentId,transactionId:data.marketJournal.transactionId,accepted:data.marketJournal.accepted} : null, journal: data?.journal ? {paymentId: data.journal.paymentId, transactionId: data.journal.transactionId, registered: data.journal.registered, submitted: data.journal.submitted, accepted: data.journal.accepted, feeSompi: data.journal.feeSompi} : null, faucet: data?.faucet || null});
  async function initialize() {
    if (!sdk) { sdk = await import('/assets/kaspa/kaspa.js'); await sdk.default({module_or_path: '/assets/kaspa/kaspa_bg.wasm'}); }
    if (!rpc) { const candidate = new sdk.RpcClient({url: 'wss://muon-10.kaspa.blue/kaspa/testnet-10/wrpc/borsh', networkId: V5_NETWORK}); try { await timed(candidate.connect({blockAsyncConnect: true, timeoutDuration: 6000})); rpc = candidate; } catch (error) { try { await candidate.disconnect(); } catch {} throw error; } }
    const info = await timed(rpc.getServerInfo());
    if (info.networkId !== V5_NETWORK || info.isSynced !== true || info.hasUtxoIndex !== true) fail('A synchronized Testnet-10 node with a UTXO index is required.');
  }
  async function save() {
    const envelope = await seal(crypto, data, secret), next = JSON.stringify({version: 1, secret, envelope});
    try {
      if (storage.getItem(store) !== disk) fail('This wallet changed in another tab. Restore it before continuing.');
      storage.setItem(store, next);
      if (storage.getItem(store) !== next) throw Error();
      disk = next;
    } catch (error) { fail(error.safeMessage || 'Wallet recovery could not be saved. Sending is blocked until browser storage works.'); }
  }
  function requireWallet() { if (!data || !key) fail('Start or restore your test wallet first.'); }
  async function request(path, fields) {
    const res = await timed(fetcher(origin + '/api/v5/' + path, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(fields), signal: AbortSignal.timeout(options.timeoutMs || 15000)}));
    const value = await res.json();
    if (!res.ok) throw Object.assign(new Error(typeof value.error === 'string' ? value.error.slice(0, 240) : 'The town did not accept this request.'), {status: res.status});
    if (value.network !== V5_NETWORK || value.address !== data.address || !HEX.test(value.playerId || '') || value.playerId !== await playerId(data.address)) fail('The town returned a different wallet session.');
    addressScript(sdk, value.treasuryAddress);
    if (data.treasuryAddress && value.treasuryAddress !== data.treasuryAddress) fail('The town treasury changed. Keep your saved recovery.');
    if (value.payment) {
      const p = value.payment;
      if (p.kind === 'market') {
        if (!HEX.test(p.id || '') || !HEX.test(p.checkpoint || '') || !['awaiting-signature','pending','submitted','accepted','cancelled'].includes(p.status) || p.amountSompi !== '0' || p.destination !== null || !p.marketPlan || p.transactionId && !HEX.test(p.transactionId) || p.status === 'accepted' && !HEX.test(p.acceptingBlock || '')) fail('Invalid market payment.');
      } else if (!HEX.test(p.id || '') || !HEX.test(p.checkpoint || '') || !['purchase', 'reward'].includes(p.kind) || !['prepared', 'pending', 'submitted', 'accepted'].includes(p.status) || !/^[1-9][0-9]*$/.test(p.amountSompi) || p.destination !== (p.kind === 'purchase' ? value.treasuryAddress : data.address) || p.transactionId && !HEX.test(p.transactionId) || p.status === 'accepted' && (!HEX.test(p.acceptingBlock || '') || !HEX.test(p.transactionId || ''))) fail('The town returned an invalid payment receipt.');
    }
    return value;
  }
  const playerId = async address => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', text('v5 player\n' + address))));
  const auth = () => ({playerId: data.playerId, capability: data.capability});
  const marketTradeKey = trade => JSON.stringify({id: trade?.id || null, from: trade?.from || null, to: trade?.to || null,
    give: Object.fromEntries(Object.entries(trade?.give || {}).sort(([a], [b]) => a.localeCompare(b))),
    want: Object.fromEntries(Object.entries(trade?.want || {}).sort(([a], [b]) => a.localeCompare(b))),
    nativeAmountSompi: String(trade?.nativeAmountSompi || '0'), unitPriceSompi: trade?.unitPriceSompi === undefined ? null : String(trade.unitPriceSompi),
    purpose: trade?.purpose || null, useActionId: trade?.useActionId || null});
  function hasPreparedMarketReservation(value) {
    const action = data.pendingAction, consent = data.marketConsent;
    if (!action || !consent?.action || JSON.stringify(consent.action) !== JSON.stringify(action) || !action.type?.startsWith('market_')) return false;
    return Object.values(value.market?.trades || {}).some(trade => {
      if (trade?.status !== 'prepared' || ![trade.from, trade.to].includes(data.playerId)) return false;
      if (consent.trade && marketTradeKey(consent.trade) !== marketTradeKey(trade)) return false;
      if (action.type === 'market_use') return trade.from === data.playerId && trade.useActionId === action.id && trade.purpose === action.purpose;
      if (action.type === 'market_accept') return Boolean(consent.trade) && trade.id === action.tradeId;
      if (action.type !== 'market_buy') return false;
      let total, maximum; try { total = BigInt(trade.nativeAmountSompi || 0); maximum = BigInt(action.maxTotalSompi || 0); } catch { return false; }
      return trade.from === data.playerId && trade.to === action.to && !Object.keys(trade.give || {}).length && Object.keys(trade.want || {}).length === 1 &&
        trade.want?.[action.resource] === action.amount && total > 0n && total <= maximum;
    });
  }
  async function accept(value) {
    if (data.journal && value.payment?.id === data.journal.paymentId) {
      if (value.payment.kind !== 'purchase' || value.payment.destination !== data.journal.destination || value.payment.amountSompi !== data.journal.amountSompi || value.payment.checkpoint !== data.journal.checkpoint) fail('The saved payment details changed.');
      if (value.payment.transactionId && value.payment.transactionId !== data.journal.transactionId) fail('The saved payment transaction changed.');
      if (value.payment.status === 'accepted') data.journal.accepted = true;
    }
    if (data.marketJournal && value.payment?.id === data.marketJournal.paymentId) {
      if (value.payment.transactionId && value.payment.transactionId !== data.marketJournal.transactionId) fail('The saved trade transaction changed.');
      if (value.payment.status === 'accepted') data.marketJournal.accepted = true;
    }
    if (value.market?.cells?.[data.playerId]) data.marketCell = clone(value.market.cells[data.playerId]);
    data.treasuryAddress = value.treasuryAddress; response = {...value}; delete response.capability; if(value.payment?.status==='cancelled')response.payment=null;
    if ((!value.payment && !hasPreparedMarketReservation(value)) || ['accepted','cancelled'].includes(value.payment?.status)) { data.pendingAction = null; data.marketConsent = null; }
    await save(); return snapshot();
  }
  async function authenticate() {
    data.nonce ||= random(32); await save();
    const value = await request('start', {address: data.address, nonce: data.nonce, signature: sdk.signMessage({privateKey: key, message: v5WalletSessionMessage(data.address, data.nonce)})});
    if (!HEX.test(value.capability || '')) fail('The town did not return a valid session capability.');
    data.capability = value.capability; data.playerId = value.playerId;
    return accept(value);
  }
  function validateRecovery(value) {
    if (!value || value.version !== 1 || value.network !== V5_NETWORK || !HEX.test(value.privateKey || '')) fail('Invalid V5 wallet recovery.');
    const restored = new sdk.PrivateKey(value.privateKey);
    if (restored.toAddress(V5_NETWORK).toString() !== value.address) fail('Recovery wallet address does not match its key.');
    addressScript(sdk, value.address);
    if (value.journal) {
      const j = value.journal;
      if (!HEX.test(j.paymentId || '') || !HEX.test(j.transactionId || '') || typeof j.transaction !== 'string' || j.transaction.length > 50000 || !HEX.test(j.checkpoint || '') || j.destination !== value.treasuryAddress || !Number.isSafeInteger(j.feeRate) || j.feeRate < 100 || j.feeRate > 100000) fail('Invalid saved payment.');
      const tx = sdk.Transaction.deserializeFromSafeJSON(j.transaction);
      const checked = checkPayment(sdk, tx, {source: value.address, destination: j.destination, amountSompi: j.amountSompi, feeRate: j.feeRate});
      if (checked.transactionId !== j.transactionId || tx.serializeToSafeJSON() !== j.transaction) fail('Saved payment bytes changed.');
    }
    if (value.marketJournal && !value.marketJournal.accepted) {const j=value.marketJournal;if(!HEX.test(j.paymentId||'')||!HEX.test(j.transactionId||'')||typeof j.reviewedWire!=='string'||j.reviewedWire.length>400000||!Array.isArray(j.signatures)||j.signatures.length>10||j.signatures.some(s=>!Number.isSafeInteger(s.inputIndex)||s.inputIndex<0||s.inputIndex>9||!Number.isSafeInteger(s.signatureIndex)||s.signatureIndex<0||s.signatureIndex>1||!/^([0-9a-f]{128})01$/.test(s.signature||'')))fail('Invalid saved market signatures.');}
    if (value.marketConsent && (!value.marketConsent.action || typeof value.marketConsent.action.id!=='string' || !value.marketConsent.action.type?.startsWith('market_') || JSON.stringify(value.marketConsent).length>10000))fail('Invalid saved market approval.');
    return restored;
  }
  async function restore() {
    await initialize(); const saved = storage.getItem(store);
    if (!saved || saved.length > 700000) fail('No valid V5 wallet is saved in this browser.');
    const wrapper = JSON.parse(saved);
    if (wrapper.version !== 1 || !HEX.test(wrapper.secret || '')) fail('Invalid saved V5 wallet.');
    const value = await unseal(crypto, wrapper.envelope, wrapper.secret), restored = validateRecovery(value);
    disk = saved; secret = wrapper.secret; data = value; key = restored;
    return authenticate();
  }
  async function status() {
    requireWallet(); await initialize();
    let value;
    try { value = await request('status', auth()); } catch (error) { if (error.status !== 401) throw error; await authenticate(); value = await request('status', auth()); }
    return accept(value);
  }
  async function sendMarket() {
    requireWallet(); await initialize();
    let value = await request('status', auth()); await accept(value);
    const payment = value.payment;
    if (payment?.kind !== 'market' || payment.status !== 'awaiting-signature') return snapshot();
    if (!templates) { const r = await timed(fetcher('/assets/v5-argent-templates.json')); if (!r.ok) fail('The market contract could not load.'); templates = await r.json(); }
    const reviewOptions = {templates,payment,address:data.address,treasuryAddress:data.treasuryAddress,playerId:data.playerId,consent:data.marketConsent,expectedCell:data.marketCell,expectedInventory:response?.market?.actors?.[data.playerId]?.inventory};
    reviewV5MarketPlan(sdk, reviewOptions);
    const reviewedWire = JSON.stringify(payment.marketPlan.wire);
    let journal = data.marketJournal;
    if (journal?.paymentId === payment.id && journal.reviewedWire !== reviewedWire) fail('The saved trade plan changed. No signatures were resent.');
    if (!journal || journal.paymentId !== payment.id) {
      const signed = await signV5MarketPayment(sdk, reviewOptions, key);
      journal = data.marketJournal = {paymentId:payment.id,...signed,reviewedWire,accepted:false}; await save();
    }
    value = await request('payment', {...auth(),paymentId:payment.id,signatures:journal.signatures});
    return accept(value);
  }
  async function sendSaved() {
    requireWallet(); await initialize(); if (response?.payment?.kind === 'market') return sendMarket(); const j = data.journal;
    if (!j || j.accepted) return status();
    const tx = sdk.Transaction.deserializeFromSafeJSON(j.transaction), checked = checkPayment(sdk, tx, {source: data.address, destination: j.destination, amountSompi: j.amountSompi, feeRate: j.feeRate});
    if (checked.transactionId !== j.transactionId || tx.serializeToSafeJSON() !== j.transaction) fail('The saved transaction changed. Sending is blocked.');
    await save();
    // Registration must return the exact ID before any direct RPC broadcast.
    const registered = await request('payment', {...auth(), paymentId: j.paymentId, transaction: j.transaction});
    if (registered.payment?.id !== j.paymentId || registered.payment.transactionId !== j.transactionId) fail('The town did not register the saved transaction. Nothing was sent.');
    j.registered = true; await accept(registered);
    if (j.accepted) return snapshot();
    j.attempted = true; await save();
    const submitted = await timed(rpc.submitTransaction({transaction: tx, allowOrphan: false}));
    if (submitted.transactionId !== j.transactionId) fail('The node returned a different transaction ID. Check the saved payment.');
    j.submitted = true; await save(); return status();
  }
  async function action(action) {
    requireWallet(); await initialize();
    if (!action || typeof action.id !== 'string' || !action.id || typeof action.type !== 'string' || JSON.stringify(action).length > 4000) fail('Provide a named V5 action with a stable ID.');
    if(action.type === 'market_cancel_quote') { if(response?.payment?.id!==action.paymentId || !response.payment.quoteCancellable)fail('Only an unsigned quote can be cancelled.'); const value=await request('action',{...auth(),action}); await accept(value); data.marketJournal=null; await save(); return snapshot(); }
    if (data.journal && !data.journal.accepted) { if (data.pendingAction?.id !== action.id) fail('Check your saved payment before another action.'); return status(); }
    if (data.pendingAction && JSON.stringify(data.pendingAction) !== JSON.stringify(action)) fail('Finish checking the saved action before another action.');
    if (action.type.startsWith('market_') && !data.marketConsent) {
      const trade = action.tradeId ? response?.market?.trades?.[action.tradeId] : null;
      data.marketConsent = {action:clone(action),trade:trade?clone(trade):null};
    }
    data.pendingAction = clone(action); await save();
    let value;
    try { value = await request('action', {...auth(), action: data.pendingAction}); }
    catch (error) {
      // A rejected preparation has no signed transaction. Reconcile the service
      // before releasing the local action so a corrected proposal is possible.
      if (error.status >= 400 && error.status < 500) { try { await status(); } catch {} }
      throw error;
    }
    await accept(value);
    const payment = value.payment;
    if (payment?.kind === 'market') return action.type === 'market_fund' ? snapshot() : sendMarket();
    if (!payment || payment.status === 'accepted' || payment.kind !== 'purchase') return snapshot();
    if (payment.actionId !== action.id) fail('The town prepared a different action.');
    if (payment.transactionId) fail('This purchase already has a transaction. Restore its original wallet recovery before retrying.');
    const [{entries}, estimate] = await Promise.all([timed(rpc.getUtxosByAddresses([data.address])), timed(rpc.getFeeEstimate())]);
    const feeRate = Math.max(100, Math.ceil(estimate.estimate.priorityBucket.feerate));
    const plan = buildV5WalletPayment(sdk, {entries, source: data.address, destination: payment.destination, amountSompi: payment.amountSompi, feeRate});
    for (let i = 0; i < plan.transaction.inputs.length; i++) plan.transaction.inputs[i].signatureScript = sdk.createInputSignature(plan.transaction, i, key);
    const checked = checkPayment(sdk, plan.transaction, {source: data.address, destination: payment.destination, amountSompi: payment.amountSompi, feeRate});
    data.journal = {paymentId: payment.id, checkpoint: payment.checkpoint, destination: payment.destination, amountSompi: payment.amountSompi, feeRate, ...checked, transaction: plan.transaction.serializeToSafeJSON(), registered: false, submitted: false, accepted: false};
    await save(); return sendSaved();
  }
  return {
    snapshot,
    start: () => run(async () => {
      if (data) return status();
      if (storage.getItem(store)) return restore();
      await initialize();
      for (let i = 0; i < 8 && !key; i++) { try { key = new sdk.PrivateKey(random(32)); } catch {} }
      if (!key) fail('Could not create a test wallet.');
      secret = random(32); disk = null;
      data = {version: 1, network: V5_NETWORK, privateKey: key.toString(), address: key.toAddress(V5_NETWORK).toString(), pendingAction: null, journal: null};
      await save(); return authenticate();
    }),
    restore: () => run(restore),
    exportRecovery: password => run(async () => { requireWallet(); if (typeof password !== 'string' || password.length < 12) fail('Use a recovery password of at least 12 characters.'); await save(); return JSON.stringify(await seal(crypto, data, password)); }),
    restoreRecovery: (input, password) => run(async () => {
      await initialize(); if (typeof input !== 'string' || input.length > 700000) fail('Invalid V5 recovery file.');
      const value = await unseal(crypto, JSON.parse(input), password), restored = validateRecovery(value);
      if (storage.getItem(store)) fail('A V5 wallet is already saved here. Export it before importing into a separate browser profile.');
      data = value; key = restored; secret = random(32); disk = null; await save(); return authenticate();
    }),
    getBalance: () => run(async () => {
      requireWallet(); await initialize(); const {entries} = await timed(rpc.getUtxosByAddresses([data.address])), own = addressScript(sdk, data.address);
      if (!Array.isArray(entries) || entries.length > 512) fail('The node returned too many wallet outputs.');
      const usable = entries.filter(e => !e.covenantId && !e.entry?.covenantId && scriptOf(e)?.version === 0 && scriptOf(e)?.script === own.script && BigInt(e.amount) > 0n);
      if (new Set(usable.map(e => outpointId(e.outpoint))).size !== usable.length) fail('The node returned duplicate wallet outputs.');
      data.balanceSompi = String(usable.reduce((sum, e) => sum + BigInt(e.amount), 0n)); await save();
      return {network: V5_NETWORK, address: data.address, amountSompi: data.balanceSompi, outputCount: usable.length};
    }),
    getNetwork: () => run(async () => {
      await initialize();
      const {sink} = await timed(rpc.getSink());
      if (!HEX.test(sink || '')) fail('The node returned an invalid block identity.');
      const {block} = await timed(rpc.getBlock({hash: sink, includeTransactions: false}));
      const parents = (block?.header?.parentsByLevel || []).flatMap(level => Array.isArray(level) ? level : level.parentHashes || []).map(String).filter(value => HEX.test(value));
      return {label: 'Testnet-10', status: 'Connected', blocks: [{hash: sink, parents}]};
    }),
    requestCoins: () => run(async () => {
      requireWallet(); await initialize(); data.faucet ||= {requestId: crypto.randomUUID(), observed: false}; await save();
      const res = await timed(fetcher(origin + '/api/faucet', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({address: data.address, requestId: data.faucet.requestId}), signal: AbortSignal.timeout(options.timeoutMs || 15000)}));
      const value = await res.json();
      if (!res.ok) fail(value.error || 'The faucet request could not complete. Check the same request again.');
      if (value.network !== V5_NETWORK || value.amount !== '1000000000' || !HEX.test(value.transactionId || '') || !['pending', 'submitted', 'accepted'].includes(value.status) || data.faucet.transactionId && data.faucet.transactionId !== value.transactionId) fail('The faucet returned an unexpected transaction.');
      data.faucet.transactionId = value.transactionId; await save();
      const {entries} = await timed(rpc.getUtxosByAddresses([data.address])), own = addressScript(sdk, data.address);
      data.faucet.observed = entries.some(e => e.outpoint.transactionId === value.transactionId && e.outpoint.index === 0 && BigInt(e.amount) === 1000000000n && scriptOf(e)?.version === 0 && scriptOf(e)?.script === own.script && !e.covenantId && !e.entry?.covenantId);
      await save(); return snapshot();
    }),
    action: value => run(() => action(value)),
    status: () => run(status),
    retryPayment: () => run(sendSaved),
    disconnect: () => run(async () => { if (rpc) await rpc.disconnect(); rpc = null; }),
  };
}
