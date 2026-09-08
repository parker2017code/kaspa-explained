import {observePublicAcceptance} from './public-acceptance.mjs';

export const V6_NETWORK = 'testnet-10';
export const V6_WALLET_STORE = 'kaspa-v6-browser-wallet-v1';
const SECRET_STORE = V6_WALLET_STORE + '-secret';
const FAUCET = 'https://kaspa-demo-faucet.parker2017.workers.dev/api/faucet';
const RPC = 'wss://muon-10.kaspa.blue/kaspa/testnet-10/wrpc/borsh';
const hex = bytes => [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
const bytes = value => Uint8Array.from(value.match(/../g) || [], c => parseInt(c, 16));
const encode = value => {let out = ''; for (let i = 0; i < value.length; i += 16384) out += String.fromCharCode(...value.subarray(i, i + 16384)); return btoa(out);};
const decode = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
export const v6Clone = value => JSON.parse(JSON.stringify(value, (_, item) => typeof item === 'bigint' ? String(item) : item));
export const v6Coins = value => `${(Number(value || 0) / 1e8).toLocaleString('en-US', {maximumFractionDigits: 8})}`;
export const v6Hash = value => /^[a-f0-9]{64}$/i.test(value || '');
export const v6Outpoint = input => `${input.outpoint?.transactionId || input.previousOutpoint?.transactionId}:${input.outpoint?.index ?? input.previousOutpoint?.index}`;
export const v6Call = (promise, ms = 15000) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(Error('The Testnet node has not replied. Your saved transaction has not been replaced.')), ms);
  Promise.resolve(promise).then(value => {clearTimeout(timer); resolve(value);}, error => {clearTimeout(timer); reject(error);});
});
const emptyState = () => ({version: 1, id: crypto.randomUUID(), records: [], completed: [], selected: 0, learned: {}, faucet: null, assistance: null});

export class V6BrowserWallet {
  constructor({storage = globalThis.sessionStorage, onChange = () => {}} = {}) {
    this.storage = storage; this.onChange = onChange; this.sdk = null; this.rpc = null;
    this.keys = []; this.data = emptyState(); this.balances = [0n, 0n, 0n]; this.entries = [];
    this.secret = null; this.persistQueue = Promise.resolve(); this.network = 'Not connected';
    this.connecting = null; this.loaded = null; this.lastInfo = null; this.disposed = false;
  }
  get ready() {return this.keys.length === 3;}
  get addresses() {return this.keys.map(key => key.toAddress(V6_NETWORK).toString());}
  get owners() {return this.keys.map(key => key.toPublicKey().toXOnlyPublicKey().toString());}
  get address() {return this.addresses[0] || '';}
  async loadSDK() {
    if (this.sdk) return this.sdk;
    if (!this.loaded) this.loaded = (async () => {
      const sdk = await import('/assets/kaspa/kaspa.js');
      await sdk.default({module_or_path: '/assets/kaspa/kaspa_bg.wasm'}); this.sdk = sdk; return sdk;
    })().catch(error => {this.loaded = null; throw error;});
    return this.loaded;
  }
  async connect() {
    if (this.disposed) throw Error('This page is closed.');
    if (this.rpc) return this.rpc;
    if (this.connecting) return this.connecting;
    this.connecting = (async () => {
      await this.loadSDK(); this.network = 'Connecting to Testnet-10'; this.onChange();
      const rpc = new this.sdk.RpcClient({url: RPC, networkId: V6_NETWORK});
      try {
        await v6Call(rpc.connect({blockAsyncConnect: true, timeoutDuration: 6000}), 8000);
        if (this.disposed) throw Error('This page is closed.');
        this.rpc = rpc; await this.nodeInfo(true); this.network = 'Connected to Testnet-10'; this.onChange(); return rpc;
      } catch (error) {try {await rpc.disconnect();} catch {} this.rpc = null; this.network = 'Connection interrupted'; this.onChange(); throw error;}
    })().finally(() => {this.connecting = null;});
    return this.connecting;
  }
  async nodeInfo(fresh = false) {
    if (!this.rpc) await this.connect();
    if (!fresh && this.lastInfo && Date.now() - this.lastInfo.checkedAt < 5000) return this.lastInfo;
    const [info, dag, fee] = await Promise.all([
      v6Call(this.rpc.getServerInfo()), v6Call(this.rpc.getBlockDagInfo()), v6Call(this.rpc.getFeeEstimate()),
    ]);
    if (info.networkId !== V6_NETWORK || !info.isSynced || !info.hasUtxoIndex) throw Error('Sending is paused: this node must be synchronized with Testnet-10.');
    const feeRate = Math.max(100, Math.ceil(fee.estimate?.priorityBucket?.feerate));
    if (!Number.isFinite(feeRate) || feeRate > 100000) throw Error('The node returned an unusable network fee. Nothing was signed.');
    this.lastInfo = {...info, ...dag, feeRate, checkedAt: Date.now()}; return this.lastInfo;
  }
  async create() {
    if (this.ready || this.storage.getItem(V6_WALLET_STORE)) throw Error('Restore the wallet already saved in this tab before creating another.');
    await this.loadSDK();
    const key = () => {for (let i = 0; i < 8; i++) {try {return new this.sdk.PrivateKey(hex(crypto.getRandomValues(new Uint8Array(32))));} catch {}} throw Error('The browser could not create a test key.');};
    this.keys = [key(), key(), key()]; this.secret = hex(crypto.getRandomValues(new Uint8Array(32))); this.data = emptyState();
    this.storage.setItem(SECRET_STORE, this.secret);
    await this.save(); this.onChange();
  }
  payload() {return {version: 1, network: V6_NETWORK, keys: this.keys.map(key => key.toString()), address: this.address, data: this.data};}
  async localKey() {return crypto.subtle.importKey('raw', bytes(this.secret), {name: 'AES-GCM'}, false, ['encrypt', 'decrypt']);}
  save() {
    if (!this.ready || !this.secret) return Promise.reject(Error('Create or restore the test wallet first.'));
    // Capture each write and serialize encryption/storage; an older status save
    // must never overwrite a newer signed journal after its await completes.
    const payload = JSON.stringify(this.payload());
    const write = this.persistQueue.catch(() => {}).then(async () => {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const cipher = await crypto.subtle.encrypt({name: 'AES-GCM', iv}, await this.localKey(), new TextEncoder().encode(payload));
      this.storage.setItem(V6_WALLET_STORE, JSON.stringify({version: 1, iv: encode(iv), ciphertext: encode(new Uint8Array(cipher))}));
    });
    this.persistQueue = write; return write;
  }
  async restore() {
    const saved = this.storage.getItem(V6_WALLET_STORE), secret = this.storage.getItem(SECRET_STORE);
    if (!saved) return false;
    if (!secret || !v6Hash(secret) || saved.length > 8000000) throw Error('The saved wallet needs its recovery file. It has not been overwritten.');
    this.secret = secret;
    const envelope = JSON.parse(saved);
    if (envelope.version !== 1 || decode(envelope.iv).length !== 12) throw Error('The saved wallet is not readable.');
    const clear = await crypto.subtle.decrypt({name: 'AES-GCM', iv: decode(envelope.iv)}, await this.localKey(), decode(envelope.ciphertext));
    await this.acceptPayload(JSON.parse(new TextDecoder().decode(clear))); return true;
  }
  async acceptPayload(payload) {
    if (payload?.version !== 1 || payload.network !== V6_NETWORK || !Array.isArray(payload.keys) || payload.keys.length !== 3 || payload.keys.some(key => !v6Hash(key))) throw Error('This is not a supported Testnet-10 wallet.');
    const data = payload.data;
    if (data?.version !== 1 || !/^[a-f0-9-]{36}$/i.test(data.id || '') || !Array.isArray(data.records) || data.records.length > 100 || !Array.isArray(data.completed) || data.completed.some(x => !Number.isInteger(x) || x < 0 || x > 5)) throw Error('The wallet’s lesson record is invalid.');
    if (data.records.some(record => !v6Hash(record.id) || record.journal?.id !== record.id || typeof record.journal.transaction !== 'string' || record.journal.transaction.length > 750000 || !Number.isInteger(record.chapter) || record.chapter < 0 || record.chapter > 5)) throw Error('A saved transaction is incomplete. Keep the recovery file; it has not been replaced.');
    await this.loadSDK(); const keys = payload.keys.map(value => new this.sdk.PrivateKey(value));
    if (keys[0].toAddress(V6_NETWORK).toString() !== payload.address || new Set(payload.keys).size !== 3) throw Error('The recovered addresses do not match the wallet.');
    this.keys = keys; this.data = data; this.onChange();
  }
  async backup(password) {
    if (password.length < 12) throw Error('Use a recovery password with at least 12 characters.');
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.backupKey(password, salt);
    const ciphertext = await crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, new TextEncoder().encode(JSON.stringify(this.payload())));
    return {version: 1, network: V6_NETWORK, kind: 'v6-browser-wallet', kdf: 'PBKDF2-SHA256', iterations: 250000, salt: encode(salt), iv: encode(iv), ciphertext: encode(new Uint8Array(ciphertext))};
  }
  async backupKey(password, salt) {
    const raw = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256'}, raw, {name: 'AES-GCM', length: 256}, false, ['encrypt', 'decrypt']);
  }
  async importBackup(envelope, password) {
    if (this.ready || this.storage.getItem(V6_WALLET_STORE)) throw Error('A wallet is already present. Open the recovery file in a separate tab so this wallet stays safe.');
    if (envelope?.version !== 1 || envelope.network !== V6_NETWORK || envelope.kind !== 'v6-browser-wallet' || envelope.kdf !== 'PBKDF2-SHA256' || envelope.iterations !== 250000 || typeof envelope.ciphertext !== 'string' || envelope.ciphertext.length > 8000000 || decode(envelope.salt).length !== 16 || decode(envelope.iv).length !== 12) throw Error('Choose a supported V6 wallet recovery file.');
    const key = await this.backupKey(password, decode(envelope.salt));
    const clear = await crypto.subtle.decrypt({name: 'AES-GCM', iv: decode(envelope.iv)}, key, decode(envelope.ciphertext));
    await this.acceptPayload(JSON.parse(new TextDecoder().decode(clear)));
    for (const record of this.data.records) {record.acceptanceUnverified = true;record.savedAcceptingBlock = record.acceptingBlock;record.acceptingBlock = null;record.scanCursor = null;}
    this.data.completed = [];
    if (this.data.faucet) {this.data.faucet.acceptingBlock = null;this.data.faucet.scanCursor = null;}
    this.secret = hex(crypto.getRandomValues(new Uint8Array(32))); this.storage.setItem(SECRET_STORE, this.secret); await this.save();
  }
  async refresh() {
    if (!this.ready) return;
    await this.connect(); const {entries} = await v6Call(this.rpc.getUtxosByAddresses(this.addresses));
    this.entries = entries.filter(entry => !entry.entry.covenantId);
    this.balances = this.addresses.map(address => {
      const script = this.sdk.payToAddressScript(new this.sdk.Address(address)).script;
      return this.entries.filter(entry => entry.entry.scriptPublicKey.version === 0 && entry.entry.scriptPublicKey.script === script).reduce((sum, entry) => sum + BigInt(entry.amount), 0n);
    });
    this.onChange(); return this.entries;
  }
  async funding(index = 0, minimum = 10000000n) {
    await this.refresh(); const script = this.sdk.payToAddressScript(new this.sdk.Address(this.addresses[index])).script;
    const entries = this.entries.filter(entry => entry.entry.scriptPublicKey.script === script).sort((a, b) => a.amount === b.amount ? 0 : a.amount > b.amount ? -1 : 1);
    const selected = []; let sum = 0n;
    for (const entry of entries.slice(0, 7)) {selected.push(entry); sum += BigInt(entry.amount); if (sum >= minimum) break;}
    if (sum < minimum) throw Error(`This account needs at least ${v6Coins(minimum)} test coins. Its current balance is ${v6Coins(sum)}.`);
    return selected;
  }
  sign(transaction, index, signer) {
    const owner = typeof signer === 'string' ? signer : signer.owner;
    const key = this.keys[this.owners.indexOf(owner)];
    if (!key) throw Error('This wallet does not control a required signing key.');
    return this.sdk.createInputSignature(transaction, index, key);
  }
  async requestCoins() {
    if (!this.ready) throw Error('Create your test wallet first.');
    await this.connect();
    if (!this.data.faucet) {const {sink} = await v6Call(this.rpc.getSink()); this.data.faucet = {address: this.address, requestId: crypto.randomUUID(), requestedAt: Date.now(), checkpoint: sink}; await this.save();}
    const claim = this.data.faucet;
    if (claim.acceptingBlock) return;
    // Repeat only the user's same explicit faucet request, never create a
    // replacement identity after a timeout or automatically request coins.
    const response = await fetch(FAUCET, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({address: this.address, requestId: claim.requestId}), signal: AbortSignal.timeout(20000)});
    const result = await response.json();
    if (!response.ok) throw Error(result.error || 'The test-coin faucet is temporarily unavailable. Your wallet is safe.');
    if (result.network !== V6_NETWORK || result.amount !== '1000000000' || !v6Hash(result.transactionId) || claim.id && result.transactionId !== claim.id) throw Error('The faucet returned an unexpected transaction. Keep this request for checking.');
    claim.id = result.transactionId; await this.save(); await this.observeFaucet();
  }
  async observeFaucet() {
    const claim = this.data.faucet; if (!claim?.id || claim.acceptingBlock) return;
    await this.connect();
    const observed = await observePublicAcceptance(this.rpc, claim, {call: v6Call});
    Object.assign(claim, observed); await this.save(); await this.refresh();
  }
  async close() {this.disposed = true; if (this.rpc) {try {await this.rpc.disconnect();} catch {}} this.rpc = null;}
}
