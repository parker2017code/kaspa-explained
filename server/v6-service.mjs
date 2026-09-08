// Sprout Harbor V6 local demonstration service.
//
// The service owns only a browser-scoped demonstration session.  The host
// still owns the treasury, RPC connection and the shared pending lock used by
// V5.  Every durable V6 operation contains the exact signed transaction bytes
// before the host is asked to submit them.
import {createHash, timingSafeEqual} from 'node:crypto';
import {observePublicAcceptance} from '../src/public-acceptance.mjs';
import {publicTransactionMass, pushPublicData} from '../src/public-contracts.mjs';
import {
  V5_ARGENT_RESOURCES,
  v5ArgentInitialState,
  buildV5ArgentGenesis,
  buildV5ArgentConfigure,
  buildV5ArgentTrade,
  signV5ArgentPlan,
  v5ArgentJournal,
  v5ArgentCertificateDigest,
  instantiateV5Argent,
  v5ArgentMass,
} from '../src/v5-argent-protocol.mjs';
import * as ring from '../src/v5-ring-protocol.mjs';
import * as delivery from '../src/v5-delivery-protocol.mjs';
import {
  instantiateV4,
  buildV4Genesis,
  buildV4Transition,
  publicV4Journal,
  derivePublicV4RecoveryPlan,
} from '../src/public-v4-protocol.mjs';
import {signPublicAssetPlan} from '../src/public-asset-signing.mjs';
import {v5ArgentUnlock} from '../src/v5-argent-protocol.mjs';
import {checkV6Script} from './v6-vm.mjs';

const NETWORK = 'testnet-10';
const HASH = /^[a-f0-9]{64}$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACTIONS = new Set([
  'start', 'primary', 'continue', 'purchase', 'purchase_attack', 'configure',
  'pip_attack', 'revoke', 'ring', 'ring_attack', 'coord_attack', 'withdraw',
  'resume', 'join', 'courier_open', 'courier_release', 'courier_refund_open',
  'refund', 'proof_attack', 'proof_redeem', 'refresh', 'connect', 'cancel',
]);
const SESSION_CAP = 800000000n;
const GLOBAL_CAP = 10000000000n;
const MAX_RECEIPTS = 80;

const STAGE_CHAPTER = Object.freeze({
  'purchase-ready': 0, 'purchase-complete': 0,
  'pip-ready': 1, 'pip-permitted': 1, 'pip-traded': 1,
  'pip-blocked': 1, 'pip-complete': 1,
  'ring-setup': 2, 'ring-ready': 2, 'ring-complete': 2,
  'coord-setup': 3, 'coord-ready': 3, 'coord-withdrawn': 3,
  'coord-join-ready': 3, 'coord-complete': 3,
  'courier-funding': 4, 'courier-ready': 4, 'courier-locked': 4,
  'courier-delivered': 4, 'courier-wait': 4, 'courier-refund-ready': 4,
  'courier-complete': 4,
  'proof-create': 5, 'proof-ready': 5, 'proof-blocked': 5,
  'proof-verified': 5, 'proof-complete': 5, complete: 5,
});

const STAGE_NAMES = Object.freeze([
  'purchase-ready', 'pip-ready', 'ring-ready', 'coord-ready',
  'courier-ready', 'proof-ready',
]);

const json = (value, status = 200) => Response.json(value, {
  status,
  headers: {'Cache-Control': 'no-store'},
});
const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), {status});
};
const copy = value => value === undefined ? undefined : structuredClone(value);
const plain = value => JSON.parse(JSON.stringify(value, (_, item) => typeof item === 'bigint' ? String(item) : item));
const asString = value => String(value ?? '');
const asBig = (value, fallback = 0n) => {
  try { return BigInt(value ?? fallback); } catch { return fallback; }
};
const positiveBig = value => asBig(value) > 0n;
const idOf = outpoint => `${outpoint?.transactionId}:${outpoint?.index}`;
const transactionIdOf = tx => tx?.id || tx?.transactionId || '';
const sha256 = value => createHash('sha256').update(String(value)).digest('hex');
const validHash = value => HASH.test(String(value || ''));
const safeHex = value => String(value || '').toLowerCase();
const nowMs = () => Date.now();

function only(value, keys) {
  if (!value || Array.isArray(value) || typeof value !== 'object' || Object.keys(value).some(key => !keys.includes(key))) fail('Unexpected request fields.');
  return value;
}

function timingEqualHex(expected, actual) {
  if (typeof expected !== 'string' || typeof actual !== 'string' || !HASH.test(expected) || !HASH.test(actual)) return false;
  const left = Buffer.from(expected, 'hex'), right = Buffer.from(actual, 'hex');
  return left.length === right.length && timingSafeEqual(left, right);
}

function scriptOf(value) {
  return value?.entry?.scriptPublicKey || value?.scriptPublicKey || {};
}

const requireAsset = fn => {
  try { return fn(); } catch (error) { fail(error?.message || 'The saved contract template is invalid.', 503); }
};
const instantiateArgent = (sdk, templates, state) => instantiateV5Argent(sdk, templates, state);

function normalizedSignature(raw) {
  const value = String(raw || '');
  return /^41[0-9a-f]{130}$/i.test(value) ? value.slice(2) : value;
}

function replaceSignatureByte(script) {
  const value = String(script || '');
  if (value.length < 8) return value;
  const offset = Math.max(2, value.length - 8);
  const prior = value.slice(offset, offset + 2).toLowerCase();
  return value.slice(0, offset) + (prior === '00' ? '01' : '00') + value.slice(offset + 2);
}

function sanitizeReceipt(record) {
  if (!record) return null;
  const result = {};
  for (const key of ['operation', 'kind', 'purpose', 'transactionId', 'acceptingBlock', 'feeSompi', 'at', 'title', 'detail', 'controlledRoles', 'phase', 'role', 'chapter']) {
    if (record[key] !== undefined && key !== 'transaction') result[key] = copy(record[key]);
  }
  for (const key of ['toolReceived', 'built', 'refund', 'receiptPresent', 'machineOn', 'rejected', 'member', 'resourceDeltas', 'amounts']) {
    if (record[key] !== undefined) result[key] = copy(record[key]);
  }
  return result;
}

function sanitizeOperation(operation) {
  if (!operation || !['submitted', 'accepted'].includes(operation.phase)) return null;
  const value = {
    kind: operation.kind || operation.operation || 'transaction',
    phase: operation.phase,
    title: operation.title || '',
    detail: operation.detail || '',
  };
  if (typeof operation.transactionId === 'string' && operation.transactionId) value.transactionId = operation.transactionId;
  if (operation.phase === 'accepted' && validHash(operation.acceptingBlock)) value.acceptingBlock = operation.acceptingBlock;
  if (operation.amounts) value.amounts = copy(operation.amounts);
  if (operation.feeSompi !== undefined) value.feeSompi = String(operation.feeSompi);
  if (operation.setup) value.setup = true;
  return value;
}

function defaultInventory() {
  return {
    buyer: {crops: 4, wood: 0, ore: 0, tools: 0, bread: 0},
    seller: {crops: 0, wood: 3, ore: 0, tools: 3, bread: 0},
    grower: {crops: 3, wood: 0, ore: 0, tools: 0, bread: 0},
    toolmaker: {crops: 0, wood: 0, ore: 0, tools: 1, bread: 0},
    miner: {crops: 0, wood: 0, ore: 2, tools: 0, bread: 0},
    customer: {coinsSompi: '0'},
    courier: {coinsSompi: '0'},
    recipient: {coinsSompi: '0'},
    greenhouse: {built: false},
    observatory: {machineOn: false},
  };
}

function makeSession(id, capHash, now = nowMs()) {
  return {
    version: 1,
    id,
    capHash,
    createdAt: now,
    stage: 'purchase-ready',
    chapter: 0,
    completed: [],
    actions: {},
    receipts: [],
    attackEvidence: [],
    inventory: defaultInventory(),
    cells: {},
    scene: {
      place: 'Exchange',
      focus: 'The tool and the payment are waiting on one atomic rule.',
      status: 'The seller is ready to propose an exchange.',
      mode: 'Illustrative scene',
      chapter: 0,
    },
    spentSompi: '0',
    operation: null,
    result: null,
    error: null,
    pending: null,
    intent: null,
  };
}

function makeIntent(session, kind, steps, finalStage, intermediateStage, index = 0) {
  return {id: sha256(`v6 intent\n${session.id}\n${kind}`), kind, index, steps: [...steps], finalStage, intermediateStage};
}

export class V6Service {
  constructor({host = null, storage, sdk = null, rpc = null, key = null, address = null, entries = [], call = p => p, argentTemplates = null, advancedTemplates = null, launchTemplate = null, proofTemplates = null, now = null} = {}) {
    this.host = host;
    this.storage = storage || host?.storage;
    this.sdk = sdk || host?.sdk;
    this.rpc = rpc || host?.rpc;
    this.key = key || host?.key;
    this.address = address || host?.address;
    this.entries = entries || [];
    this.call = call || (value => value);
    this.argentTemplates = argentTemplates || host?.argentTemplates;
    this.advancedTemplates = advancedTemplates || host?.advancedTemplates;
    this.launchTemplate = launchTemplate;
    this.proofTemplates = proofTemplates;
    this.now = now || host?.now || nowMs;
    this.vmCheck = host?.checkV6Script || checkV6Script;
    this.observeAcceptance = host?.observePublicAcceptance || observePublicAcceptance;
    this.prepareHook = host?.prepareV6Operation || null;
    this.rolesCache = new Map();
  }

  sessionKey(id) { return `v6:session:${id}`; }

  async load(id) {
    const value = await this.storage?.get?.(this.sessionKey(id));
    if (!value) return null;
    return copy(value);
  }

  async save(session, extra = {}) {
    if (!this.storage?.put) fail('The local session store is unavailable.', 503);
    session.revision = Number(session.revision || 0) + 1;
    // Durable storage is JSON backed in the host. Keep SDK BigInts in the
    // live session object, but persist the existing JSON-safe representation.
    const value = plain(session);
    await this.storage.put({[this.sessionKey(session.id)]: value, ...extra});
    return session;
  }

  async state() {
    return copy(await this.storage?.get?.('state')) || {pending: null};
  }

  async budget() {
    return copy(await this.storage?.get?.('v6:budget')) || {version: 1, allocatedSompi: '0', reservedSompi: '0', sessions: {}};
  }

  async putBudget(value) {
    await this.storage.put({'v6:budget': plain(value)});
  }

  treasuryOwner(address = this.address) {
    if (this.host?.marketOwner) return this.host.marketOwner(address);
    if (!this.sdk || !address) return '';
    return this.sdk.payToAddressScript(new this.sdk.Address(address)).script.slice(2, -2);
  }

  nativeOwner(value) {
    const script = scriptOf(value);
    if (Number(script?.version) !== 0 || !/^20[0-9a-f]{64}ac$/i.test(String(script?.script || ''))) return null;
    return String(script.script).slice(2, 66).toLowerCase();
  }

  // Count only the treasury's actual native value reduction.  Contract
  // deposits and role funding therefore reserve the amount that leaves the
  // treasury after its change output, while role-owned inputs are not charged
  // a second time on later covenant transitions.
  treasuryDebit(transaction) {
    const owner = String(this.treasuryOwner() || '').toLowerCase();
    if (!owner || !transaction) return null;
    let input = 0n, output = 0n;
    for (const value of transaction.inputs || []) {
      if (!value?.utxo?.entry?.covenantId && this.nativeOwner(value.utxo) === owner) input += asBig(value.utxo.amount);
    }
    for (const value of transaction.outputs || []) {
      if (!value?.covenant && this.nativeOwner(value) === owner) output += asBig(value.value);
    }
    return input > output ? input - output : 0n;
  }

  roleSeed(session, role) {
    const secret = this.host?.env?.FAUCET_KEY || this.host?.treasurySecret || this.key?.toString?.() || String(this.key || '');
    return sha256(`Kaspa Explained V6 role\n${secret}\n${session.id}\n${role}`);
  }

  role(session, role) {
    const key = `${session.id}:${role}`;
    if (this.rolesCache.has(key)) return this.rolesCache.get(key);
    if (!this.sdk) return {name: role, owner: '', address: '', key: null};
    const privateKey = new this.sdk.PrivateKey(this.roleSeed(session, role));
    const address = privateKey.toAddress(NETWORK).toString();
    const owner = this.treasuryOwner(address);
    const result = {name: role, key: privateKey, address, owner};
    this.rolesCache.set(key, result);
    return result;
  }

  allRoles(session) {
    const roles = {};
    for (const name of ['buyer', 'seller', 'pip', 'grower', 'toolmaker', 'miner', 'member0', 'member1', 'member2', 'customer', 'courier', 'recipient', 'worker', 'beneficiary']) roles[name] = this.role(session, name);
    roles.treasury = {name: 'treasury', key: this.key, address: this.address, owner: this.treasuryOwner()};
    return roles;
  }

  signFor(session, owner, tx, index) {
    const roles = this.allRoles(session);
    const role = Object.values(roles).find(value => value.owner === owner);
    if (!role?.key) fail('The local demonstration signer is unavailable.', 503);
    return this.sdk.createInputSignature(tx, index, role.key);
  }

  async resignArgentPlan(session, plan) {
    if (!plan?.transaction || !Array.isArray(plan.signers)) fail('The adversarial Business transaction is incomplete.', 503);
    // Mutating a reviewed output or call changes the sighash.  Rebuild every
    // input script from the mutated call, recompute mass/storage, then sign
    // each input with the owner named by the plan.  This keeps the VM failure
    // attributable to the demonstrated rule rather than to a bad signature.
    plan.transaction.inputs.forEach((input, index) => {
      input.signatureScript = v5ArgentUnlock(plan.calls?.[index] || null);
    });
    const mass = v5ArgentMass(plan, {feeRate: plan.mass?.feeRate || 100});
    plan.mass = mass;
    plan.transaction.storageMass = BigInt(mass.storageMass);
    for (let index = 0; index < plan.transaction.inputs.length; index += 1) {
      const signer = plan.signers[index];
      const owners = signer?.owners || (signer?.owner ? [signer.owner] : []);
      if (owners.length !== 1) fail('The adversarial Business signer shape is incomplete.', 503);
      const raw = normalizedSignature(this.signFor(session, owners[0], plan.transaction, index));
      plan.transaction.inputs[index].signatureScript = v5ArgentUnlock(plan.calls?.[index] || null, [raw]);
    }
    plan.transaction.finalize();
    return plan;
  }

  async node(promise) {
    try { return await this.call(promise); } catch (error) { fail(error?.message || 'The Testnet-10 node did not respond.', 503); }
  }

  async feeRate() {
    if (this.host?.v6FeeRate) return Number(await this.host.v6FeeRate());
    if (!this.rpc?.getFeeEstimate) return 100;
    try {
      const estimate = await this.node(this.rpc.getFeeEstimate());
      return Math.max(100, Math.ceil(Number(estimate?.estimate?.priorityBucket?.feerate || 100)));
    } catch { return 100; }
  }

  async checkpoint() {
    if (this.host?.v6Checkpoint) return this.host.v6Checkpoint();
    if (!this.rpc?.getSink) return '0'.repeat(64);
    const result = await this.node(this.rpc.getSink());
    if (!validHash(result?.sink)) fail('The node did not return an acceptance checkpoint.', 503);
    return result.sink;
  }

  hydrate(entry) {
    if (!entry || !this.sdk) return entry;
    if (this.host?.hydrateMarketEntry) return this.host.hydrateMarketEntry(entry);
    try {
      return new this.sdk.UtxoEntries([{...entry, amount: BigInt(entry.amount), blockDaaScore: BigInt(entry.blockDaaScore || 0), ...(entry.covenantId ? {covenant_id: entry.covenantId} : {})}]).items[0];
    } catch { return entry; }
  }

  storeEntry(entry) {
    if (this.host?.marketEntry) return this.host.marketEntry(entry);
    const script = scriptOf(entry);
    return {outpoint: copy(entry.outpoint), amount: String(entry.amount), scriptPublicKey: {version: script.version, script: script.script}, blockDaaScore: String(entry.blockDaaScore || 0), isCoinbase: Boolean(entry.isCoinbase), covenantId: entry.entry?.covenantId?.toString?.() || entry.covenantId?.toString?.() || entry.covenantId || null};
  }

  async funding(address = this.address, minimum = 10000000n, maxInputs = 7) {
    let list;
    if (this.host?.marketFunding) list = await this.host.marketFunding(address);
    else if (this.rpc?.getUtxosByAddresses) list = (await this.node(this.rpc.getUtxosByAddresses([address]))).entries;
    else list = this.entries;
    const owner = this.treasuryOwner(address);
    const usable = (list || []).filter(entry => !entry.entry?.covenantId && !entry.covenantId && scriptOf(entry).version === 0 && scriptOf(entry).script === `20${owner}ac` && asBig(entry.amount) > 0n).sort((a, b) => asBig(b.amount) > asBig(a.amount) ? 1 : -1);
    const selected = [];
    let total = 0n;
    for (const entry of usable) {
      selected.push(this.hydrate(entry));
      total += asBig(entry.amount);
      if (total >= minimum || selected.length >= maxInputs) break;
    }
    if (total < minimum) fail('The local demonstration treasury needs more Testnet-10 coins.', 503);
    return selected;
  }

  async observedCell(asset, saved) {
    if (!this.rpc?.getUtxosByAddresses) return this.hydrate(saved?.utxo || saved);
    const result = await this.node(this.rpc.getUtxosByAddresses([asset.address]));
    const found = (result?.entries || []).find(entry => idOf(entry.outpoint) === idOf(saved.outpoint));
    if (!found) fail('The saved contract output is not currently spendable. Check its acceptance receipt.', 503);
    const stored = this.storeEntry(found);
    if (saved.amount && String(found.amount) !== String(saved.amount)) fail('The saved contract amount changed.', 503);
    if (saved.covenantId && String(found.entry?.covenantId || found.covenantId) !== String(saved.covenantId)) fail('The saved contract identity changed.', 503);
    return this.hydrate(stored);
  }

  async outputCell(session, asset, transactionId, index, state, certificate = null, expected = null, protocol = null) {
    const saved = {outpoint: {transactionId, index}, amount: '0', state, covenantId: null, certificate};
    if (this.rpc?.getUtxosByAddresses) {
      const result = await this.node(this.rpc.getUtxosByAddresses([asset.address]));
      const found = (result?.entries || []).find(entry => idOf(entry.outpoint) === idOf(saved.outpoint));
      if (!found) fail('The accepted contract output is not available yet. Check again shortly.', 503);
      const foundScript = scriptOf(found);
      const foundCovenant = found.entry?.covenantId?.toString?.() || found.covenantId?.toString?.() || found.covenantId || null;
      const stored = this.storeEntry(found), actualCovenant = foundCovenant || stored?.covenantId || null;
      if (expected && (String(found.amount) !== String(expected.value) || expected.scriptPublicKey?.script !== foundScript.script || Number(expected.scriptPublicKey?.version) !== Number(foundScript.version) || String(expected.covenantId || '') !== String(actualCovenant || ''))) fail('The accepted output does not match the saved transaction.', 503);
      saved.amount = String(found.amount);
      saved.utxo = stored;
      saved.covenantId = actualCovenant;
      // Delivery refunds are gated by the accepted output's chain age. Keep
      // the deadline beside the saved cell so a later refresh can evaluate
      // the same relative-age rule after a restart.
      if (protocol === 'delivery' && state?.refund_age !== undefined && stored?.blockDaaScore !== undefined) {
        saved.refundDaa = String(BigInt(stored.blockDaaScore) + BigInt(state.refund_age) + 1n);
      }
      return saved;
    }
    saved.utxo = saved;
    return saved;
  }

  async acceptedEvidence(pending, {allowBroadcast = false} = {}) {
    if (!pending?.transactionId) return {};
    if (this.host?.v6Observe) return this.host.v6Observe(pending, {allowBroadcast});
    if (!this.rpc) return {};
    try {
      return await this.observeAcceptance(this.rpc, {
        id: pending.transactionId,
        checkpoint: pending.checkpoint,
        scanCursor: pending.scanCursor,
        acceptingBlock: pending.acceptingBlock,
      }, {call: value => this.node(value), pages: 3});
    } catch (error) {
      // An unavailable observation is an uncertain transaction, not a failure
      // and must leave the exact signed request recoverable.
      pending.lastObservationError = String(error?.message || error).slice(0, 240);
      return {};
    }
  }

  async vm(plan) {
    if (!plan?.transaction) fail('The V6 operation has no signed transaction to check. No transaction was sent.', 503);
    if (plan.skipVm) fail('V6 broadcasts cannot bypass the local Kaspa script VM.', 503);
    try {
      const result = await this.vmCheck(plan.transaction);
      const inputCount = Array.isArray(plan.transaction.inputs) ? plan.transaction.inputs.length : -1;
      if (result?.valid === false && result.engine === 'Kaspa TxScriptEngine' && Number.isSafeInteger(result.checkedInputs) && result.checkedInputs >= 0 && result.checkedInputs <= inputCount) {
        fail('The local Kaspa script VM rejected this transaction. No transaction was sent.', 409);
      }
      if (result?.valid !== true || result.engine !== 'Kaspa TxScriptEngine' || !Number.isSafeInteger(result.checkedInputs) || result.checkedInputs !== inputCount) {
        fail('The local Kaspa script VM did not return a complete native verification result. No transaction was sent.', 503);
      }
      return result;
    } catch (error) {
      if (error?.status) throw error;
      fail(error?.message || 'The local Kaspa script VM is unavailable. No transaction was sent.', 503);
    }
  }

  async reserve(session, amount) {
    const debit = asBig(amount);
    if (debit < 0n) fail('Invalid V6 treasury debit.', 503);
    const spent = asBig(session.spentSompi);
    if (spent + debit > SESSION_CAP) fail('This demonstration reached its 8 tKAS session treasury limit.', 409);
    const budget = await this.budget();
    const allocated = asBig(budget.allocatedSompi), reserved = asBig(budget.reservedSompi);
    if (allocated + reserved + debit > GLOBAL_CAP) fail('The shared V6 demonstration allocation is full. Try again later.', 409);
    budget.reservedSompi = String(reserved + debit);
    budget.sessions ||= {};
    budget.sessions[session.id] = {reservedSompi: String(asBig(budget.sessions[session.id]?.reservedSompi) + debit), spentSompi: String(asBig(budget.sessions[session.id]?.spentSompi))};
    return {budget, debit};
  }

  async commitReserve(session, amount, budget = null) {
    const debit = asBig(amount), current = budget || await this.budget();
    const reserved = asBig(current.reservedSompi), sessionBudget = current.sessions?.[session.id] || {};
    current.reservedSompi = String(reserved >= debit ? reserved - debit : 0n);
    current.allocatedSompi = String(asBig(current.allocatedSompi) + debit);
    current.sessions ||= {};
    current.sessions[session.id] = {reservedSompi: String(asBig(sessionBudget.reservedSompi) >= debit ? asBig(sessionBudget.reservedSompi) - debit : 0n), spentSompi: String(asBig(sessionBudget.spentSompi) + debit)};
    session.spentSompi = String(asBig(session.spentSompi) + debit);
    return current;
  }

  async persistPending(session, descriptor, requestId, action) {
    const transaction = descriptor.plan?.transaction;
    let serialized = typeof descriptor.transaction === 'string' ? descriptor.transaction : descriptor.transaction?.serializeToSafeJSON?.() || transaction?.serializeToSafeJSON?.();
    let transactionId = descriptor.transactionId || transactionIdOf(transaction || descriptor.transaction);
    if (transaction && !serialized) serialized = transaction.serializeToSafeJSON();
    if (!transactionId || !serialized) fail('The operation did not produce a signed transaction.', 503);
    if (transaction?.finalize) transaction.finalize();
    if (transaction && transaction.id !== transactionId) fail('The saved transaction identity changed before submission.', 503);
    if (typeof serialized !== 'string') fail('The saved V6 transaction is not serializable.', 503);
    if (descriptor.journal?.transaction && descriptor.journal.transaction !== serialized) fail('The saved V6 journal does not contain the exact signed transaction.', 503);
    if (descriptor.journal?.id && descriptor.journal.id !== transactionId) fail('The saved V6 journal transaction identity changed.', 503);
    if (!descriptor.journal || typeof descriptor.journal !== 'object' || Array.isArray(descriptor.journal)) fail('The signed V6 transaction has no recoverable journal.', 503);
    const vm = await this.vm(descriptor.plan);
    const actualDebit = transaction ? this.treasuryDebit(transaction) : null;
    const debitSompi = actualDebit === null ? asBig(descriptor.debitSompi || 0n) : actualDebit;
    const reservation = await this.reserve(session, debitSompi);
    const checkpoint = descriptor.checkpoint || await this.checkpoint();
    const expectedOutputs = transaction?.outputs?.map((output, index) => ({index, value: String(output.value), scriptPublicKey: {version: output.scriptPublicKey?.version, script: output.scriptPublicKey?.script}, covenantId: output.covenant?.covenantId?.toString?.() || null})) || descriptor.expectedOutputs || [];
    const pending = {
      version: 1,
      id: sha256(`v6 operation\n${session.id}\n${requestId}\n${transactionId}`),
      purpose: 'v6',
      sessionId: session.id,
      requestId,
      action,
      phase: descriptor.phase || descriptor.operation || 'v6',
      kind: descriptor.kind || descriptor.operation || 'transaction',
      nextStage: descriptor.nextStage || session.stage,
      status: 'pending',
      transactionId,
      transaction: serialized,
      signedHash: sha256(serialized),
      checkpoint,
      scanCursor: null,
      acceptingBlock: null,
      attempts: 1,
      attemptedAt: this.now(),
      feeSompi: String(descriptor.plan?.fee ?? descriptor.feeSompi ?? 0),
      debitSompi: String(reservation.debit),
      journal: descriptor.journal ? plain(descriptor.journal) : null,
      meta: plain(descriptor.meta || {}),
      expectedOutputs,
      vm: copy(vm),
    };
    // Re-derive the saved journal before taking the lock or asking the node to
    // accept the transaction. Recovery must be possible from the first write,
    // including when a host supplied malformed protocol metadata.
    await this.verifyJournal(session, pending);
    session.revision = Number(session.revision || 0) + 1;
    session.pending = pending;
    session.operation = {
      kind: pending.kind,
      phase: 'submitted',
      title: descriptor.title || 'Saved Testnet-10 transaction',
      detail: descriptor.detail || 'The exact signed transaction is saved before submission.',
      transactionId,
      acceptingBlock: null,
      feeSompi: pending.feeSompi,
      setup: Boolean(descriptor.setup),
      amounts: descriptor.amounts,
    };
    session.error = null;
    const state = await this.state();
    if (state.pending) fail('Another saved town transaction is settling. Continue checking that transaction first.', 409);
    const transactionOwner = await this.storage.get(`v6:transaction:${transactionId}`);
    if (transactionOwner && transactionOwner !== session.id) fail('This transaction already belongs to another V6 session.', 409);
    state.pending = pending;
    const writes = {
      [this.sessionKey(session.id)]: plain(session),
      state: plain(state),
      [`v6:transaction:${transactionId}`]: session.id,
      'v6:budget': plain(reservation.budget),
    };
    await this.storage.put(writes);
    if (this.rpc?.submitTransaction && transaction) {
      try {
        const result = await this.node(this.rpc.submitTransaction({transaction, allowOrphan: false}));
        if (result?.transactionId && result.transactionId !== transactionId) fail('The node returned a different transaction identity.', 503);
        pending.status = 'submitted';
        await this.save(session, {state: plain({...state, pending}), [`v6:transaction:${transactionId}`]: session.id});
      } catch (error) {
        // Do not clear or replace pending bytes after an uncertain submit.
        if (error?.status && /different transaction identity/i.test(error.message)) throw error;
        pending.submitError = String(error?.message || error).slice(0, 240);
        await this.save(session, {state: plain({...state, pending})});
      }
    }
    return 202;
  }

  async applyAccepted(session, pending, evidence) {
    if (!validHash(evidence?.acceptingBlock || pending.acceptingBlock)) return false;
    const acceptingBlock = safeHex(evidence.acceptingBlock || pending.acceptingBlock);
    pending.acceptingBlock = acceptingBlock;
    pending.status = 'accepted';
    const meta = pending.meta || {};
    if (meta.cell) {
      const value = await this.acceptedCell(session, pending, meta.cell);
      session.cells[meta.cell.name] = value;
    }
    if (Array.isArray(meta.cells)) {
      for (const cell of meta.cells) {
        const value = await this.acceptedCell(session, pending, cell);
        session.cells[cell.name] = value;
      }
    }
    if (meta.cellUpdates) {
      for (const update of meta.cellUpdates) {
        const prior = session.cells[update.name];
        if (!prior) continue;
        const value = await this.acceptedCell(session, pending, {name: update.name, protocol: update.protocol || prior.protocol, state: copy(update.state), index: update.index ?? 0, amount: update.amount, certificate: update.certificate || prior.certificate});
        session.cells[update.name] = {...prior, ...value, state: copy(update.state), certificate: update.certificate || value.certificate || prior.certificate, transactionId: pending.transactionId, acceptingBlock};
      }
    }
    for (const name of meta.removeCells || []) delete session.cells[name];
    this.patchInventory(session, meta.inventoryPatch);
    if (meta.scene) session.scene = {...session.scene, ...copy(meta.scene)};
    if (meta.result) session.result = copy(meta.result);
    session.operation = {
      kind: pending.kind,
      phase: 'accepted',
      title: meta.title || session.operation?.title || 'Accepted by the node',
      detail: meta.detail || session.operation?.detail || 'The accepting block identity is recorded.',
      transactionId: pending.transactionId,
      acceptingBlock,
      feeSompi: pending.feeSompi,
      setup: Boolean(meta.setup),
      amounts: copy(meta.amounts),
    };
    const receipt = sanitizeReceipt({
      operation: pending.phase,
      kind: pending.kind,
      purpose: meta.purpose,
      transactionId: pending.transactionId,
      acceptingBlock,
      feeSompi: pending.feeSompi,
      at: this.now(),
      chapter: STAGE_CHAPTER[pending.nextStage] ?? session.chapter,
      title: meta.title,
      detail: meta.detail,
      role: meta.role,
      ...meta.receipt,
    });
    session.receipts = [...(session.receipts || []).filter(item => item.transactionId !== receipt.transactionId), receipt].slice(-MAX_RECEIPTS);
    const budget = await this.commitReserve(session, pending.debitSompi || 0n);
    const state = await this.state();
    if (state.pending?.id !== pending.id || state.pending.sessionId !== session.id) fail('The shared V6 transaction lock changed.', 503);
    state.pending = null;
    session.pending = null;
    const intent = session.intent;
    if (intent && pending.meta?.intentIndex !== undefined) {
      intent.index = Number(pending.meta.intentIndex) + 1;
      if (intent.index >= intent.steps.length) {
        session.intent = null;
        session.stage = intent.finalStage;
      } else {
        session.stage = intent.intermediateStage || session.stage;
      }
    } else {
      session.stage = pending.nextStage || session.stage;
    }
    this.updateProgress(session);
    session.chapter = STAGE_CHAPTER[session.stage] ?? session.chapter;
    session.revision = Number(session.revision || 0) + 1;
    await this.storage.put({[this.sessionKey(session.id)]: plain(session), state: plain(state), 'v6:budget': plain(budget), [`v6:receipt:${pending.transactionId}`]: plain({...pending, status: 'accepted', acceptingBlock, acceptedAt: this.now()})});
    return true;
  }

  async acceptedCell(session, pending, cell) {
    if (cell.saved) return copy({...cell.saved, transactionId: pending.transactionId, acceptingBlock: pending.acceptingBlock});
    let asset = cell.asset;
    if (!asset && cell.protocol === 'argent' && this.sdk && this.argentTemplates) asset = requireAsset(() => instantiateArgent(this.sdk, this.argentTemplates, cell.state));
    if (!asset && cell.protocol === 'ring' && this.sdk && this.advancedTemplates?.ring) asset = requireAsset(() => ring.instantiateV5Ring(this.sdk, this.advancedTemplates.ring, cell.state));
    if (!asset && cell.protocol === 'delivery' && this.sdk && this.advancedTemplates) asset = requireAsset(() => delivery.instantiateV5Delivery(this.sdk, this.deliveryArtifact(), cell.state));
    if (!asset && cell.protocol === 'launch' && this.sdk && this.launchTemplate) asset = requireAsset(() => instantiateV4(this.sdk, this.launchTemplate, 'launch', cell.state));
    if (!asset && cell.protocol === 'proof' && this.sdk && this.proofTemplates) {
      const module = await this.proofModule();
      if (module?.instantiateV6Proof) asset = requireAsset(() => module.instantiateV6Proof(this.sdk, this.proofTemplates, cell.state));
    }
    if (this.rpc?.getUtxosByAddresses && asset) {
      return this.outputCell(session, asset, pending.transactionId, cell.index ?? 0, cell.state, cell.certificate, pending.expectedOutputs?.find(output => output.index === (cell.index ?? 0)), cell.protocol);
    }
    return {state: copy(cell.state), outpoint: {transactionId: pending.transactionId, index: cell.index ?? 0}, amount: String(cell.amount || 0), covenantId: cell.covenantId || null, certificate: cell.certificate || null, transactionId: pending.transactionId, acceptingBlock: pending.acceptingBlock};
  }

  async verifyJournal(session, pending) {
    const journal = pending?.journal;
    if (!journal || typeof journal !== 'object' || Array.isArray(journal)) fail('The saved V6 transaction has no recoverable journal.', 503);
    if (!this.sdk?.Transaction) fail('The local SDK is unavailable for V6 journal recovery.', 503);
    if (typeof journal.kind !== 'string') fail('The saved V6 journal has no protocol kind.', 503);
    if (typeof pending?.transaction !== 'string' || journal.transaction !== pending.transaction) fail('The saved V6 journal bytes changed.', 503);
    if (!validHash(journal.id) || journal.id !== pending.transactionId) fail('The saved V6 journal transaction identity changed.', 503);

    const phase = String(pending.phase || '');
    const expectedKind = phase.startsWith('purchase') || phase.startsWith('pip-') ? 'v5-argent'
      : phase.startsWith('ring') ? 'v5-ring'
        : phase.startsWith('coord-') ? 'launch'
          : phase === 'courier-role-funding' ? 'v6-native'
            : phase.startsWith('delivery-') || phase === 'refund-open' ? 'v5-delivery'
              : phase.startsWith('proof-') ? 'v6-proof' : null;
    if (!expectedKind || journal.kind !== expectedKind) fail('The saved V6 journal protocol does not match the pending operation.', 503);

    // Derive the expected input/output states from the session lineage and
    // pending operation metadata. A journal must agree with those states
    // before its protocol-specific recovery builder is allowed to run.
    const meta = pending.meta || {}, expectedInputs = [], expectedOutputs = [], inputNames = [], outputNames = [];
    const addInput = (name, state) => {
      if (!state || typeof state !== 'object') fail('The saved V6 journal is missing its input lineage.', 503);
      inputNames.push(name); expectedInputs.push(copy(state));
    };
    const addOutput = (name, state) => {
      if (!state || typeof state !== 'object') fail('The saved V6 journal is missing its output lineage.', 503);
      outputNames.push(name); expectedOutputs.push(copy(state));
    };
    if (Array.isArray(meta.cells)) for (const cell of meta.cells) addOutput(cell.name, cell.state);
    if (meta.cell) addOutput(meta.cell.name, meta.cell.state);
    if (Array.isArray(meta.cellUpdates)) {
      for (const update of meta.cellUpdates) {
        addInput(update.name, session.cells?.[update.name]?.state);
        addOutput(update.name, update.state);
      }
    }
    if (Array.isArray(meta.removeCells)) {
      for (const name of meta.removeCells) addInput(name, session.cells?.[name]?.state);
    }
    if (journal.kind === 'v5-delivery' && !meta.cell) {
      const name = phase === 'delivery-refund' ? 'courierRefund' : 'courierDelivery';
      addInput(name, session.cells?.[name]?.state);
    }
    if (journal.kind === 'v6-proof' && !meta.cell && phase === 'proof-redeem') addInput('proof', session.cells?.proof?.state);

    const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
    const requireStates = (actual, expected, label) => {
      if (!Array.isArray(actual) || actual.length !== expected.length || actual.some((state, index) => !same(state, expected[index]))) fail(`The saved V6 journal ${label} state changed.`, 503);
    };
    const roles = this.allRoles(session), roleOwner = name => String(roles[name]?.owner || '').toLowerCase();
    const bindOwners = (states, names) => states.forEach((state, index) => {
      const owner = roleOwner(names[index]);
      if (owner && String(state.owner || '').toLowerCase() !== owner) fail('The saved V6 journal participant changed.', 503);
    });

    try {
      if (journal.kind === 'v5-argent') {
        const issuer = roleOwner('treasury'), world = sha256(`Sprout Harbor V6 business\n${this.address}\n${session.id}`), allStates = [...(journal.inputStates || []), ...(journal.states || [])];
        if (!issuer || allStates.some(state => state.issuer !== issuer || state.world !== world)) fail('The saved Business journal is bound to a different issuer or session.', 503);
        requireStates(journal.inputStates, expectedInputs, 'input');
        requireStates(journal.states, expectedOutputs, 'output');
        bindOwners(journal.inputStates, inputNames); bindOwners(journal.states, outputNames);
        const plan = (await import('../src/v5-argent-protocol.mjs')).deriveV5ArgentPlan(this.sdk, {templates: this.argentTemplates, journal, issuer, world});
        if (plan.transaction.id !== pending.transactionId) fail('The saved Business journal derived a different transaction.', 503);
      } else if (journal.kind === 'v5-ring') {
        const issuer = roleOwner('treasury'), world = sha256(`Sprout Harbor V6 ring\n${this.address}\n${session.id}`), allStates = [...(journal.inputStates || []), ...(journal.states || [])];
        if (!issuer || allStates.some(state => state.issuer !== issuer || state.world !== world)) fail('The saved ring journal is bound to a different issuer or session.', 503);
        requireStates(journal.inputStates, expectedInputs, 'input');
        requireStates(journal.states, expectedOutputs, 'output');
        bindOwners(journal.inputStates, inputNames); bindOwners(journal.states, outputNames);
        const plan = ring.deriveV5RingPlan(this.sdk, {templates: this.advancedTemplates?.ring, journal, issuer, world});
        if (plan.transaction.id !== pending.transactionId) fail('The saved ring journal derived a different transaction.', 503);
      } else if (journal.kind === 'v5-delivery') {
        requireStates(journal.inputStates, expectedInputs, 'input');
        requireStates(journal.states, expectedOutputs, 'output');
        const expectedState = journal.operation === 'delivery-open' ? expectedOutputs[0] : expectedInputs[0];
        const suffix = phase === 'refund-open' || journal.operation === 'refund-open' || journal.operation === 'delivery-refund' ? 'refund' : 'delivery';
        const canonical = this.deliveryState(session, suffix);
        if (!expectedState || !same(expectedState, canonical)) fail('The saved delivery journal is bound to a different session or role.', 503);
        const plan = delivery.deriveV5DeliveryPlan(this.sdk, {artifact: this.deliveryArtifact(), journal, expectedState});
        if (plan.transaction.id !== pending.transactionId) fail('The saved delivery journal derived a different transaction.', 503);
      } else if (journal.kind === 'v6-proof') {
        const module = await this.proofModule();
        const derive = module?.deriveV6ProofPlan || module?.derive;
        if (!module?.initialV6ProofState || !expectedInputs.length && !expectedOutputs.length) fail('The saved proof journal is missing its task state.', 503);
        const nonce = sha256(`Sprout Harbor V6 proof\n${this.address}\n${session.id}`).slice(0, 32).padEnd(64, '0');
        const canonical = module.initialV6ProofState({owner: roleOwner('worker'), feeSponsor: roleOwner('treasury'), taskNonce: nonce});
        const expectedState = journal.operation === 'proof-open' ? expectedOutputs[0] : expectedInputs[0];
        if (!expectedState || !same(expectedState, canonical) || !same(journal.state, canonical)) fail('The saved proof journal is bound to a different session or role.', 503);
        const plan = typeof derive === 'function' ? derive(this.sdk, {template: this.proofTemplates, journal, expectedState: canonical}) : null;
        if (!plan || plan.transaction.id !== pending.transactionId) fail('The saved proof journal could not be derived.', 503);
      } else if (journal.kind === 'launch') {
        if (journal.operation === null) {
          requireStates(journal.inputStates, [], 'input'); requireStates(journal.states, [], 'output'); requireStates(journal.genesis, expectedOutputs, 'genesis');
        } else {
          requireStates(journal.inputStates, expectedInputs, 'input'); requireStates(journal.states, expectedOutputs, 'output');
        }
        const worldId = this.launchWorld(session), beneficiary = roleOwner('beneficiary');
        const checkParticipant = (state, name) => {
          if (state.worldId !== worldId || state.beneficiary !== beneficiary || state.owner !== roleOwner(name) || Number(state.member) !== Number(String(name || '').replace('member', ''))) fail('The saved greenhouse journal participant changed.', 503);
        };
        if (journal.operation === null) journal.genesis.forEach((state, index) => checkParticipant(state, outputNames[index]));
        else {
          journal.inputStates.forEach((state, index) => checkParticipant(state, inputNames[index]));
          journal.states.forEach((state, index) => checkParticipant(state, outputNames[index]));
        }
        const owners = Object.values(roles).map(role => role.owner).filter(Boolean);
        const plan = derivePublicV4RecoveryPlan(this.sdk, {templates: {launch: this.launchTemplate}, journal, keysPublic: owners});
        if (plan.transaction.id !== pending.transactionId) fail('The saved greenhouse journal derived a different transaction.', 503);
      } else if (journal.kind === 'v6-native') {
        const allowed = ['version', 'network', 'kind', 'operation', 'id', 'transaction', 'fee', 'feeRate', 'signers'];
        if (Object.keys(journal).some(key => !allowed.includes(key)) || journal.version !== 1 || journal.network !== NETWORK || journal.operation !== 'courier-role-funding' || !Array.isArray(journal.signers)) fail('The saved native V6 journal shape changed.', 503);
        const tx = this.sdk.Transaction.deserializeFromSafeJSON(journal.transaction); tx.finalize();
        if (tx.id !== pending.transactionId || journal.signers.length !== tx.inputs.length) fail('The saved native V6 journal transaction changed.', 503);
        const fee = tx.inputs.reduce((sum, input) => sum + asBig(input.utxo?.amount), 0n) - tx.outputs.reduce((sum, output) => sum + asBig(output.value), 0n);
        if (String(fee) !== String(journal.fee)) fail('The saved native V6 journal fee changed.', 503);
        tx.inputs.forEach((input, index) => {
          const signer = journal.signers[index];
          if (!signer || signer.index !== index || signer.kind !== 'native' || signer.owner !== this.nativeOwner(input.utxo)) fail('The saved native V6 journal signer changed.', 503);
        });
      }
    } catch (error) {
      if (error?.status) throw error;
      fail(`The saved V6 journal could not be re-derived: ${String(error?.message || error).slice(0, 220)}`, 503);
    }
  }

  patchInventory(session, patch) {
    if (!patch) return;
    for (const [actor, values] of Object.entries(patch)) {
      session.inventory[actor] ||= {};
      for (const [key, value] of Object.entries(values || {})) {
        if (typeof value === 'number') session.inventory[actor][key] = (Number(session.inventory[actor][key]) || 0) + value;
        else session.inventory[actor][key] = copy(value);
      }
    }
  }

  updateProgress(session) {
    const chapter = STAGE_CHAPTER[session.stage];
    if (chapter !== undefined && ['purchase-complete', 'pip-complete', 'ring-complete', 'coord-complete', 'courier-complete', 'proof-verified', 'proof-complete', 'complete'].includes(session.stage) && !session.completed.includes(chapter)) session.completed.push(chapter);
    session.completed = [...new Set(session.completed.map(Number).filter(Number.isInteger).filter(value => value >= 0 && value < 6))].sort((a, b) => a - b);
  }

  publicSnapshot(session) {
    // The response is sent through JSON.stringify. Normalize any SDK BigInts
    // left in descriptor metadata or host supplied result fields before the
    // snapshot is handed to Response.json.
    const copySession = plain(session);
    const pending = copySession.pending ? {
      status: copySession.pending.status,
      phase: copySession.pending.phase,
      transactionId: copySession.pending.transactionId,
      acceptingBlock: null,
      attempts: copySession.pending.attempts,
      retryable: Number(copySession.pending.attempts || 0) < 3 && this.now() - Number(copySession.pending.attemptedAt || 0) >= 15000,
      lastObservationError: copySession.pending.lastObservationError || null,
    } : null;
    const result = {
      id: copySession.id,
      stage: copySession.stage,
      chapter: STAGE_CHAPTER[copySession.stage] ?? copySession.chapter ?? 0,
      completed: copy(copySession.completed || []),
      operation: sanitizeOperation(copySession.operation),
      receipts: (copySession.receipts || []).map(sanitizeReceipt),
      attackEvidence: (copySession.attackEvidence || []).map(copy),
      inventory: copy(copySession.inventory || {}),
      scene: copy(copySession.scene || {}),
      spentSompi: String(copySession.spentSompi || '0'),
      error: copySession.error || null,
      pending,
    };
    if (copySession.result) result.result = copy(copySession.result);
    if (copySession.balanceSompi !== undefined && copySession.balanceSompi !== null) result.balanceSompi = String(copySession.balanceSompi);
    if (copySession.intent) result.intent = {id: copySession.intent.id, kind: copySession.intent.kind, index: copySession.intent.index, total: copySession.intent.steps?.length || 0};
    return result;
  }

  validateIntentResume(session, requestId, payload) {
    if (!session.intent) return;
    // A retry may resume the exact pending bytes without repeating the intent
    // envelope. Once that transaction is settled, every next step must carry
    // the saved intent id and index so an old Resume cannot advance the tour.
    if ((payload === undefined || payload === null) && session.pending) return;
    if (payload === undefined || payload === null) fail('This V6 continuation is missing its saved intent.', 409);
    if (!validHash(session.intent.id)) session.intent.id = sha256(`v6 intent\n${session.id}\n${session.intent.kind}`);
    only(payload, ['intentId', 'intentIndex']);
    if (payload.intentId !== session.intent.id || Number(payload.intentIndex) !== Number(session.intent.index)) fail('This V6 continuation is stale. Refresh the saved session before continuing.', 409);
    if (requestId !== `resume:${session.intent.id}:${session.intent.index}`) fail('This V6 continuation request id does not match the saved intent.', 409);
  }

  async reconcile(session, {allowBroadcast = false} = {}) {
    if (!session) return null;
    const pending = session.pending;
    if (!pending) {
      await this.refreshRefundStage(session);
      await this.save(session);
      return session;
    }
    const state = await this.state();
    if (state.pending?.id !== pending.id || state.pending.sessionId !== session.id) fail('The shared V6 transaction lock changed. Keep checking the saved session.', 409);
    if (pending.transaction && this.sdk?.Transaction) {
      let tx;
      try { tx = this.sdk.Transaction.deserializeFromSafeJSON(pending.transaction); tx.finalize(); } catch { fail('The saved V6 transaction cannot be reconstructed.', 503); }
      if (tx.id !== pending.transactionId || sha256(pending.transaction) !== pending.signedHash) fail('The saved signed V6 transaction bytes changed.', 503);
    }
    await this.verifyJournal(session, pending);
    const evidence = await this.acceptedEvidence(pending, {allowBroadcast});
    if (validHash(evidence?.acceptingBlock || pending.acceptingBlock)) {
      await this.applyAccepted(session, pending, evidence);
      return session;
    }
    if (allowBroadcast && pending.transaction && this.rpc?.submitTransaction && pending.attempts < 3 && this.now() - Number(pending.attemptedAt || 0) >= 15000) {
      const tx = this.sdk.Transaction.deserializeFromSafeJSON(pending.transaction); tx.finalize();
      pending.attempts += 1; pending.attemptedAt = this.now();
      await this.save(session, {state: plain({...state, pending})});
      try { const result = await this.node(this.rpc.submitTransaction({transaction: tx, allowOrphan: false})); if (result?.transactionId && result.transactionId !== pending.transactionId) fail('The node returned a different transaction identity.', 503); pending.status = 'submitted'; } catch (error) { pending.submitError = String(error?.message || error).slice(0, 240); }
      await this.save(session, {state: plain({...state, pending})});
    }
    await this.refreshRefundStage(session);
    await this.save(session);
    return session;
  }

  async refreshRefundStage(session) {
    if (session.stage !== 'courier-wait' || !session.cells?.courierRefund) return;
    const cell = session.cells.courierRefund;
    let deadline = Number(cell.refundDaa || session.scene?.refundDaa || 0);
    if (!deadline && cell.state?.refund_age !== undefined && cell.utxo?.blockDaaScore !== undefined) {
      deadline = Number(BigInt(cell.utxo.blockDaaScore) + BigInt(cell.state.refund_age) + 1n);
      cell.refundDaa = String(deadline);
    }
    if (!deadline || !this.rpc?.getServerInfo) return;
    try {
      const info = await this.node(this.rpc.getServerInfo());
      const current = Number(info?.virtualDaaScore || 0);
      session.scene = {...session.scene, currentDaa: current, refundDaa: deadline};
      if (current >= deadline) session.stage = 'courier-refund-ready';
    } catch { /* leave the age gate unchanged */ }
  }

  async attack(session, requestId, action, {nextStage = session.stage, rule, summary, chapter = STAGE_CHAPTER[session.stage] ?? session.chapter, hostPlan = null} = {}) {
    if (!hostPlan) fail('An actual signed adversarial transaction is required for this local VM check.', 503);
    const transaction = hostPlan.transaction || hostPlan, vmResult = await this.vmCheck(transaction), inputCount = Array.isArray(transaction?.inputs) ? transaction.inputs.length : -1;
    const failedInputValid = vmResult?.failedInput === undefined || (Number.isSafeInteger(vmResult.failedInput) && vmResult.failedInput >= 0 && vmResult.failedInput < inputCount);
    if (vmResult?.valid !== false || vmResult.engine !== 'Kaspa TxScriptEngine' || !Number.isSafeInteger(vmResult.checkedInputs) || vmResult.checkedInputs < 0 || vmResult.checkedInputs > inputCount || !failedInputValid) fail('The adversarial proposal did not receive a complete native Kaspa VM rejection. No transaction was sent.', 503);
    const evidence = {id: requestId, chapter, stage: session.stage, action, summary: summary || 'Kaspa script VM rejected locally · no transaction sent', rule, checkedAt: this.now(), vm: {valid: false, scope: 'local', ...(vmResult || {})}};
    session.attackEvidence = [...(session.attackEvidence || []).filter(item => item.id !== requestId), evidence];
    session.result = {title: 'The proposal stayed unchanged', detail: summary || 'Kaspa script VM rejected locally · no transaction sent.', description: rule};
    session.error = null;
    session.stage = nextStage;
    session.chapter = STAGE_CHAPTER[nextStage] ?? session.chapter;
    await this.save(session);
    return session;
  }

  async startOperation(session, requestId, action = 'start') {
    if (!this.sdk || !this.argentTemplates) fail('The V6 demonstration signer and Business artifact are unavailable. No setup transaction was prepared.', 503);
    if (!session.intent) session.intent = makeIntent(session, 'purchase-setup', ['buyer', 'seller'], 'purchase-ready', 'purchase-setup');
    return this.continueIntent(session, requestId, action);
  }

  async continueIntent(session, requestId, action) {
    const intent = session.intent;
    if (!intent) return session;
    const step = intent.steps[intent.index];
    let descriptor;
    if (intent.kind === 'purchase-setup') descriptor = await this.preparePurchaseGenesis(session, step);
    else if (intent.kind === 'coord-setup') descriptor = await this.prepareCoordSetupStep(session, step);
    else if (intent.kind === 'coord-cleanup') descriptor = await this.prepareCoordCleanupStep(session, step);
    else if (intent.kind === 'coord-join') descriptor = await this.prepareCoordJoinStep(session, step);
    else descriptor = await this.prepareHookDescriptor(session, `${intent.kind}:${step}`, action);
    descriptor.meta = {...(descriptor.meta || {}), intentIndex: intent.index};
    await this.persistPending(session, descriptor, requestId, action);
    return session;
  }

  async prepareHookDescriptor(session, operation, action) {
    if (this.prepareHook) {
      const descriptor = await this.prepareHook({session: copy(session), operation, action});
      if (descriptor) return descriptor;
    }
    fail(`The ${operation} protocol is not configured on this local host.`, 503);
  }

  async preparePurchaseGenesis(session, roleName) {
    const roles = this.allRoles(session), role = roles[roleName], owner = role.owner, issuer = roles.treasury.owner;
    const world = sha256(`Sprout Harbor V6 business\n${this.address}\n${session.id}`);
    const resources = roleName === 'buyer' ? {crops: 4} : {wood: 3, tools: 3};
    const state = v5ArgentInitialState({owner, issuer, world, resources});
    const fundingUtxos = await this.funding(this.address, 30000000n + 6000000n);
    const plan = buildV5ArgentGenesis(this.sdk, {templates: this.argentTemplates, state, deposit: '30000000', fundingUtxos, feeRate: await this.feeRate(), maxFee: '20000000'});
    await signV5ArgentPlan(plan, (tx, index, signer) => this.signFor(session, signer.owner, tx, index));
    const asset = instantiateV5Argent(this.sdk, this.argentTemplates, state);
    return {plan, journal: v5ArgentJournal(plan), phase: `purchase-setup-${roleName}`, kind: 'business-setup', setup: true, title: `${roleName === 'buyer' ? 'Buyer' : 'Seller'} account prepared`, detail: 'A local demonstration business was funded under the Argent rule.', debitSompi: String(30000000n + asBig(plan.fee)), meta: {purpose: 'purchase-setup', role: roleName, cell: {name: roleName, protocol: 'argent', assetAddress: asset.address, state, index: 0, certificate: null, amount: '30000000', setup: true}, scene: {focus: 'Two local businesses are being prepared for one atomic exchange.', status: `${roleName === 'buyer' ? 'Buyer' : 'Seller'} account setup is saved before submission.`}}};
  }

  async businessCell(session, name) {
    const saved = session.cells?.[name]; if (!saved) fail(`The ${name} business is not ready yet.`, 409);
    const asset = instantiateV5Argent(this.sdk, this.argentTemplates, saved.state);
    const current = saved.utxo ? await this.observedCell(asset, saved) : this.hydrate(saved);
    return {...saved, utxo: current};
  }

  async preparePurchase(session) {
    const buyer = await this.businessCell(session, 'buyer'), seller = await this.businessCell(session, 'seller');
    const roles = this.allRoles(session), feeRate = await this.feeRate();
    const left = {...buyer, certificate: buyer.certificate || await this.certificate(session, buyer)};
    const right = {...seller, certificate: seller.certificate || await this.certificate(session, seller)};
    const fundingUtxos = await this.funding(this.address, 5000000n);
    const plan = buildV5ArgentTrade(this.sdk, {templates: this.argentTemplates, left, right, deltas: {tools: 1, coin: -6000000}, leftDelegated: false, rightDelegated: false, fundingUtxos, feeRate});
    await signV5ArgentPlan(plan, (tx, index, signer) => this.signFor(session, signer.owner, tx, index));
    return {plan, journal: v5ArgentJournal(plan), phase: 'purchase', kind: 'atomic-exchange', nextStage: 'purchase-complete', debitSompi: String(asBig(plan.fee)), title: 'Atomic exchange accepted', detail: 'The payment and the digital tool move together in one transaction.', amounts: {payment: '6000000', tool: '1'}, meta: {purpose: 'purchase', inventoryPatch: {buyer: {tools: 1}, seller: {tools: -1, coinsSompi: '6000000'}}, scene: {place: 'Exchange', focus: 'The exact tool arrived with the payment.', status: 'Payment and tool changed hands together.'}, result: {title: 'The tool arrived with the payment', detail: 'The accepting transaction debited 0.06 tKAS and transferred one tool in the same state transition.', deltas: [{label: 'Buyer tools', before: 0, after: 1}, {label: 'Seller tools', before: 3, after: 2}]}, cellUpdates: [{name: 'buyer', protocol: 'argent', state: plan.states[0], index: 0, amount: String(plan.transaction.outputs[0].value)}, {name: 'seller', protocol: 'argent', state: plan.states[1], index: 1, amount: String(plan.transaction.outputs[1].value)}]}};
  }

  async certificate(session, cell) {
    if (cell.certificate) return cell.certificate;
    if (!cell.covenantId || !this.key) return '00'.repeat(64);
    const digest = await v5ArgentCertificateDigest({world: cell.state.world, covenantId: cell.covenantId, owner: cell.state.owner});
    return this.sdk.signScriptHash(digest, this.key).slice(2, -2);
  }

  async prepareConfigure(session) {
    const buyer = await this.businessCell(session, 'buyer');
    const cell = {...buyer, certificate: buyer.certificate || await this.certificate(session, buyer)};
    const owner = cell.state.owner, pip = this.role(session, 'pip').owner;
    const plan = buildV5ArgentConfigure(this.sdk, {templates: this.argentTemplates, cell, policy: {operator: pip, allow_crops: 2, allow_wood: 0, allow_ore: 0, allow_tools: 0, allow_bread: 0, allow_coin: 0, min_receive: 1}, fundingUtxos: await this.funding(this.address, 5000000n), feeRate: await this.feeRate()});
    await signV5ArgentPlan(plan, (tx, index, signer) => this.signFor(session, signer.owner, tx, index));
    return {plan, journal: v5ArgentJournal(plan), phase: 'pip-configure', kind: 'pip-allow', nextStage: 'pip-permitted', debitSompi: String(asBig(plan.fee)), title: 'Pip received a narrow permission', detail: 'Pip may spend two crops for at least one resource; this proposal receives timber. Native-coin spending remains disabled.', meta: {purpose: 'pip-configure', scene: {place: 'Workshop', focus: 'Pip has one bounded job.', status: 'The owner’s spending rule is now recorded.'}, result: {title: 'The allowance is narrow by construction', detail: 'Pip can use two crops for at least one resource; this proposal receives timber, and native coin spending remains disabled.', deltas: [{label: 'Crop allowance', before: 0, after: 2}, {label: 'Native coin allowance', before: 0, after: 0}]}, cellUpdates: [{name: 'buyer', protocol: 'argent', state: plan.states[0], index: 0, amount: cell.utxo.amount}]}};
  }

  async preparePipTrade(session) {
    const buyer = await this.businessCell(session, 'buyer'), seller = await this.businessCell(session, 'seller');
    const left = {...buyer, certificate: buyer.certificate || await this.certificate(session, buyer)}, right = {...seller, certificate: seller.certificate || await this.certificate(session, seller)};
    const plan = buildV5ArgentTrade(this.sdk, {templates: this.argentTemplates, left, right, deltas: {crops: -2, wood: 1}, leftDelegated: true, rightDelegated: false, fundingUtxos: await this.funding(this.address, 5000000n), feeRate: await this.feeRate()});
    await signV5ArgentPlan(plan, (tx, index, signer) => this.signFor(session, signer.owner, tx, index));
    return {plan, journal: v5ArgentJournal(plan), phase: 'pip-trade', kind: 'pip-allow', nextStage: 'pip-traded', debitSompi: String(asBig(plan.fee)), title: 'Pip completed the allowed barter', detail: 'Two crops became one timber under the saved policy.', amounts: {crops: '2', timber: '1'}, meta: {purpose: 'pip-trade', inventoryPatch: {buyer: {crops: -2, wood: 1}, seller: {crops: 2, wood: -1}}, scene: {place: 'Workshop', focus: 'Pip handed over the exact permitted resources.', status: 'Two crops left the buyer’s store and one timber arrived.', result: {pip: {allowanceCrops: 0, receivedWood: 1, revoked: false, rejected: false}}}, result: {title: 'The allowed job completed', detail: 'Pip’s operator signature spent exactly two crops and received one timber.', deltas: [{label: 'Buyer crops', before: 4, after: 2}, {label: 'Buyer timber', before: 0, after: 1}]}, cellUpdates: [{name: 'buyer', protocol: 'argent', state: plan.states[0], index: 0, amount: String(plan.transaction.outputs[0].value)}, {name: 'seller', protocol: 'argent', state: plan.states[1], index: 1, amount: String(plan.transaction.outputs[1].value)}]}};
  }

  async prepareRevoke(session) {
    const buyer = await this.businessCell(session, 'buyer'), cell = {...buyer, certificate: buyer.certificate || await this.certificate(session, buyer)};
    const plan = buildV5ArgentConfigure(this.sdk, {templates: this.argentTemplates, cell, policy: {operator: cell.state.owner, allow_crops: 0, allow_wood: 0, allow_ore: 0, allow_tools: 0, allow_bread: 0, allow_coin: 0, min_receive: 0}, fundingUtxos: await this.funding(this.address, 5000000n), feeRate: await this.feeRate()});
    await signV5ArgentPlan(plan, (tx, index, signer) => this.signFor(session, signer.owner, tx, index));
    return {plan, journal: v5ArgentJournal(plan), phase: 'pip-revoke', kind: 'pip-revoke', nextStage: 'pip-complete', debitSompi: String(asBig(plan.fee)), title: 'Pip’s route was revoked', detail: 'The owner restored the operator to itself and cleared every allowance.', meta: {purpose: 'pip-revoke', scene: {place: 'Workshop', focus: 'Pip is idle because the operator permission is closed.', status: 'No delegated spending route remains.', result: {pip: {allowanceCrops: 0, receivedWood: 1, revoked: true, rejected: true}}}, result: {title: 'Revocation closed the route', detail: 'The accepted state has no delegated resource or native-coin allowance.', deltas: [{label: 'Operator', before: 'Pip', after: 'Owner'}, {label: 'Crop allowance', before: 0, after: 0}]}, cellUpdates: [{name: 'buyer', protocol: 'argent', state: plan.states[0], index: 0, amount: String(plan.transaction.outputs[0].value)}]}};
  }

  async prepareRingGenesis(session) {
    const roles = this.allRoles(session), issuer = roles.treasury.owner, world = sha256(`Sprout Harbor V6 ring\n${this.address}\n${session.id}`);
    const states = [
      ring.v5RingInitialState({owner: roles.grower.owner, issuer, world, role: 0, resources: {crops: 3}}),
      ring.v5RingInitialState({owner: roles.toolmaker.owner, issuer, world, role: 1, resources: {tools: 1}}),
      ring.v5RingInitialState({owner: roles.miner.owner, issuer, world, role: 2, resources: {ore: 2}}),
    ];
    const plan = ring.buildV5RingGenesis(this.sdk, {templates: this.advancedTemplates?.ring, states, deposit: '30000000', fundingUtxos: await this.funding(this.address, 95000000n), feeRate: await this.feeRate(), maxFee: '20000000'});
    await ring.signV5RingPlan(plan, (tx, index, signer) => this.signFor(session, signer.owner, tx, index));
    const cells = states.map((state, index) => ({name: ['grower', 'toolmaker', 'miner'][index], protocol: 'ring', state, index, amount: '30000000', certificate: null}));
    return {plan, journal: ring.v5RingJournal(plan), phase: 'ring-genesis', kind: 'ring-setup', nextStage: 'ring-setup', setup: true, debitSompi: String(90000000n + asBig(plan.fee)), title: 'The three trading cells were prepared', detail: 'Three businesses now hold their starting goods under one fixed ring.', meta: {purpose: 'ring-genesis', cells, scene: {place: 'Exchange', focus: 'Three stores are holding one side of a circular trade.', status: 'The ring is ready for one all-at-once settlement.'}}};
  }

  async ringCell(session, name) {
    const saved = session.cells?.[name];
    if (!saved) fail(`The ${name} ring cell is not ready yet.`, 409);
    const asset = ring.instantiateV5Ring(this.sdk, this.advancedTemplates?.ring, saved.state);
    const utxo = saved.utxo ? await this.observedCell(asset, saved) : this.hydrate(saved);
    // Accepted cells are keyed by name in the session store, but the stored
    // cell itself does not need to repeat that key. Carry it into the builder
    // result so the next journal records explicit input/output lineage.
    return {...saved, name, asset, utxo, certificate: saved.certificate || await this.ringCertificate(session, saved)};
  }

  async ringCertificate(session, cell) {
    if (cell.certificate) return cell.certificate;
    if (!cell.covenantId || !this.key) return '00'.repeat(64);
    const digest = await ring.v5RingCertificateDigest({world: cell.state.world, covenantId: cell.covenantId, owner: cell.state.owner});
    return this.sdk.signScriptHash(digest, this.key).slice(2, -2);
  }

  async prepareRingSwap(session) {
    const cells = await Promise.all(['grower', 'toolmaker', 'miner'].map(name => this.ringCell(session, name)));
    const plan = ring.buildV5RingSwap(this.sdk, {templates: this.advancedTemplates?.ring, cells, fundingUtxos: await this.funding(this.address, 5000000n), feeRate: await this.feeRate(), maxFee: '20000000'});
    await ring.signV5RingPlan(plan, (tx, index, signer) => this.signFor(session, signer.owner, tx, index));
    return {plan, journal: ring.v5RingJournal(plan), phase: 'ring', kind: 'ring-settlement', nextStage: 'ring-complete', debitSompi: String(asBig(plan.fee)), title: 'The circular trade settled together', detail: 'Three resource handoffs were accepted in one transaction.', amounts: {crops: '3', tools: '1', ore: '2'}, meta: {purpose: 'ring', inventoryPatch: {grower: {crops: -3, ore: 2, tools: 0}, toolmaker: {crops: 3, tools: -1}, miner: {ore: -2, tools: 1}}, scene: {place: 'Exchange', focus: 'Each recognizable good arrived at the next store.', status: 'The ring settled all three handoffs together.'}, result: {title: 'No business went first', detail: 'The accepted ring transition moved three crops, one tool and two ore in one transaction.', deltas: [{label: 'Grower receives', before: '0 ore', after: '2 ore'}, {label: 'Toolmaker receives', before: '0 crops', after: '3 crops'}, {label: 'Miner receives', before: '0 tools', after: '1 tool'}]}, cellUpdates: cells.map((cell, index) => ({name: cell.name, protocol: 'ring', state: plan.states[index], index, amount: String(plan.transaction.outputs[index].value)}))}};
  }

  launchWorld(session) {
    return sha256(`Sprout Harbor V6 greenhouse\n${this.address}\n${session.id}`);
  }

  launchStates(session, ready = false) {
    const roles = this.allRoles(session), worldId = this.launchWorld(session);
    return [0, 1, 2].map(member => ({worldId, owner: roles[`member${member}`].owner, beneficiary: roles.beneficiary.owner, member, ready, maxFee: 3000000}));
  }

  async signV4(session, plan) {
    await signPublicAssetPlan(plan, (tx, index, signer) => this.signFor(session, signer.owner, tx, index));
    return plan;
  }

  async prepareCoordSetupStep(session, step) {
    if (!this.launchTemplate || !this.sdk) return this.prepareHookDescriptor(session, `coord-setup:${step}`, 'resume');
    const templates = {launch: this.launchTemplate}, states = this.launchStates(session, false), names = ['member0', 'member1', 'member2'];
    if (step === 'genesis') {
      // Keep each genesis pledge large enough that the public storage-mass
      // rule does not reject three contract outputs against one large reserve
      // UTXO. The value remains a small, disposable Testnet-10 contribution.
      const pledge = 30000000n;
      const plan = buildV4Genesis(this.sdk, {kind: 'launch', templates, states, cellAmounts: [pledge, pledge, pledge], fundingUtxos: await this.funding(this.address, pledge * 3n + 10000000n), changeAddress: this.address, feeRate: await this.feeRate()});
      await this.signV4(session, plan);
      const cells = states.map((state, index) => ({name: names[index], protocol: 'launch', state, index, amount: String(pledge)}));
      return {plan, journal: publicV4Journal(plan), phase: 'coord-genesis', kind: 'coordination-setup', nextStage: 'coord-setup', setup: true, debitSompi: String(pledge * 3n + asBig(plan.fee)), title: 'Three greenhouse pledges were prepared', detail: 'Each neighbor has a separate conditional pledge.', meta: {purpose: 'coord-genesis', cells, scene: {place: 'Greenhouse', focus: 'Three neighbors are considering one shared build.', status: 'Two readiness approvals will be recorded before the third is invited.'}}};
    }
    const member = Number(String(step).replace('ready', ''));
    if (![0, 1].includes(member)) fail('Unknown greenhouse setup member.', 409);
    const name = names[member], saved = session.cells?.[name];
    if (!saved) fail('Greenhouse setup cells are not ready.', 409);
    const current = await this.observedCell(instantiateV4(this.sdk, this.launchTemplate, 'launch', saved.state), saved);
    const state = {...saved.state, ready: true};
    const plan = buildV4Transition(this.sdk, {kind: 'launch', templates, cells: [{state: saved.state, utxo: current}], states: [state], operation: 0, feeRate: await this.feeRate()});
    await this.signV4(session, plan);
    return {plan, journal: publicV4Journal(plan), phase: `coord-ready-${member}`, kind: 'coordination-setup', nextStage: 'coord-setup', debitSompi: '0', title: `Neighbor ${member + 1} approved the build`, detail: 'The pledge remains locked while the group is incomplete.', meta: {purpose: 'coord-ready', role: name, cellUpdates: [{name, protocol: 'launch', state, index: 0, amount: String(plan.transaction.outputs[0].value)}], scene: {place: 'Greenhouse', focus: `${member + 1} of 3 neighbors is ready.`, status: 'The pledge remains protected until every required member is ready.'}}};
  }

  async coordCell(session, name) {
    const saved = session.cells?.[name];
    if (!saved) fail(`The ${name} greenhouse pledge is unavailable.`, 409);
    const asset = instantiateV4(this.sdk, this.launchTemplate, 'launch', saved.state);
    const utxo = saved.utxo ? await this.observedCell(asset, saved) : this.hydrate(saved);
    // Preserve the session key on builder cells so multi-input cleanup and
    // settlement journals can record the exact participant names.
    return {...saved, name, asset, utxo};
  }

  async prepareCoordWithdraw(session) {
    const cell = await this.coordCell(session, 'member1'), roles = this.allRoles(session);
    const plan = buildV4Transition(this.sdk, {kind: 'launch', templates: {launch: this.launchTemplate}, cells: [{state: cell.state, utxo: cell.utxo}], states: [], operation: 2, payments: [{address: roles.member1.address, amount: cell.utxo.amount}], feeRate: await this.feeRate()});
    await this.signV4(session, plan);
    return {plan, journal: publicV4Journal(plan), phase: 'coord-withdraw', kind: 'coordination-withdraw', nextStage: 'coord-withdrawn', debitSompi: '0', title: 'One neighbor withdrew safely', detail: 'The incomplete group did not trap the withdrawing pledge.', meta: {purpose: 'coord-withdraw', removeCells: ['member1'], scene: {place: 'Greenhouse', focus: 'One neighbor received its remaining pledge.', status: 'The group is incomplete, so settlement cannot happen yet.'}, result: {title: 'The pledge could leave', detail: 'The accepted withdrawal returned the member’s pledge less the transaction fee.', deltas: [{label: 'Member 2 pledge', before: 'locked', after: 'returned'}]}}};
  }

  async prepareCoordCleanupStep(session, step) {
    if (step === 'close0' || step === 'close2') {
      const member = step === 'close0' ? 0 : 2, name = `member${member}`, cell = await this.coordCell(session, name), roles = this.allRoles(session);
      const plan = buildV4Transition(this.sdk, {kind: 'launch', templates: {launch: this.launchTemplate}, cells: [{state: cell.state, utxo: cell.utxo}], states: [], operation: 2, payments: [{address: roles[name].address, amount: cell.utxo.amount}], feeRate: await this.feeRate()});
      await this.signV4(session, plan);
      return {plan, journal: publicV4Journal(plan), phase: `coord-cleanup-${member}`, kind: 'coordination-cleanup', nextStage: 'coord-setup', debitSompi: '0', title: 'An old pledge was closed', detail: 'The previous incomplete round is being cleared before a fresh group starts.', meta: {purpose: 'coord-cleanup', removeCells: [name], scene: {place: 'Greenhouse', focus: 'The old incomplete round is being cleared.', status: `Neighbor ${member + 1} received its old pledge back.`}}};
    }
    if (step === 'genesis') return this.prepareCoordSetupStep(session, 'genesis');
    return this.prepareCoordSetupStep(session, step);
  }

  async prepareCoordJoinStep(session, step) {
    if (step === 'ready2') {
      const cell = await this.coordCell(session, 'member2'), state = {...cell.state, ready: true};
      const plan = buildV4Transition(this.sdk, {kind: 'launch', templates: {launch: this.launchTemplate}, cells: [{state: cell.state, utxo: cell.utxo}], states: [state], operation: 0, feeRate: await this.feeRate()});
      await this.signV4(session, plan);
      return {plan, journal: publicV4Journal(plan), phase: 'coord-ready-2', kind: 'coordination-join', nextStage: 'coord-join-ready', debitSompi: '0', title: 'The third neighbor joined', detail: 'All three pledges are now ready for the conditional settlement.', meta: {purpose: 'coord-ready', cellUpdates: [{name: 'member2', protocol: 'launch', state, index: 0, amount: String(plan.transaction.outputs[0].value)}], scene: {place: 'Greenhouse', focus: 'Three distinct ready pledges are aligned.', status: 'The cooperative settlement can now execute.'}}};
    }
    const cells = await Promise.all(['member0', 'member1', 'member2'].map(name => this.coordCell(session, name)));
    const roles = this.allRoles(session), total = cells.reduce((sum, cell) => sum + asBig(cell.utxo.amount), 0n), plan = buildV4Transition(this.sdk, {kind: 'launch', templates: {launch: this.launchTemplate}, cells, states: [], operation: 1, payments: [{address: roles.beneficiary.address, amount: total}], feeRate: await this.feeRate()});
    await this.signV4(session, plan);
    return {plan, journal: publicV4Journal(plan), phase: 'coord-settle', kind: 'coordination-settlement', nextStage: 'coord-complete', debitSompi: '0', title: 'The greenhouse settled with all three approvals', detail: 'All three conditional pledges moved to the shared greenhouse beneficiary together.', amounts: {pledges: String(total)}, meta: {purpose: 'coord-settle', removeCells: cells.map(cell => cell.name), scene: {place: 'Greenhouse', focus: 'The timber greenhouse is being built.', status: 'Three ready pledges settled in one accepted transaction.'}, result: {title: 'The group built together', detail: 'The conditional launch required every distinct ready pledge before the beneficiary received the pooled funds.', deltas: [{label: 'Ready neighbors', before: '2', after: '3'}, {label: 'Greenhouse', before: 'planned', after: 'built'}]}, inventoryPatch: {greenhouse: {built: true}}}};
  }

  async prepareCourierFunding(session) {
    if (!this.sdk) return this.prepareHookDescriptor(session, 'courier-funding', 'continue');
    const roles = this.allRoles(session), funding = await this.funding(this.address, 75000000n), feeRate = await this.feeRate();
    const total = funding.reduce((sum, entry) => sum + asBig(entry.amount), 0n);
    let fee = 1000n, transaction, mass;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const change = total - 70000000n - fee;
      if (change <= 0n) fail('The local treasury needs the courier deposits and network fee.', 503);
      transaction = new this.sdk.Transaction({
        version: 1,
        inputs: funding.map(entry => ({previousOutpoint: entry.outpoint, utxo: entry, signatureScript: '41' + '00'.repeat(64) + '01', sequence: 0n, sigOpCount: 0, computeBudget: 16})),
        outputs: [
          {value: 50000000n, scriptPublicKey: this.sdk.payToAddressScript(new this.sdk.Address(roles.customer.address))},
          {value: 20000000n, scriptPublicKey: this.sdk.payToAddressScript(new this.sdk.Address(roles.courier.address))},
          {value: change, scriptPublicKey: this.sdk.payToAddressScript(new this.sdk.Address(this.address))},
        ], lockTime: 0n, subnetworkId: '00'.repeat(20), gas: 0n, payload: '',
      });
      mass = publicTransactionMass(transaction, {feeRate});
      if (fee < BigInt(mass.minimumFee)) { fee = BigInt(mass.minimumFee); continue; }
      if (!mass.withinBlockLimits || fee > 5000000n) fail('Courier role funding exceeds its network fee limit.', 409);
      transaction.storageMass = BigInt(mass.storageMass); break;
    }
    if (!transaction) fail('Unable to prepare courier role funding.', 503);
    for (let index = 0; index < transaction.inputs.length; index += 1) transaction.inputs[index].signatureScript = this.sdk.createInputSignature(transaction, index, this.key);
    transaction.finalize();
    const plan = {network: NETWORK, kind: 'v6-native', operation: 'courier-role-funding', transaction, fee: String(fee), mass, signers: funding.map((entry, index) => ({index, kind: 'native', owner: this.nativeOwner(entry)})), calls: funding.map(() => null)};
    return {plan, journal: {version: 1, network: NETWORK, kind: 'v6-native', operation: 'courier-role-funding', id: transaction.id, transaction: transaction.serializeToSafeJSON(), fee: String(fee), feeRate, signers: plan.signers}, transactionId: transaction.id, phase: 'courier-role-funding', kind: 'courier-funding', nextStage: 'courier-ready', feeSompi: String(fee), debitSompi: String(70000000n + fee), title: 'Courier roles received separate deposits', detail: 'The customer payment and courier bond will be locked separately.', amounts: {customer: '50000000', courier: '20000000'}, meta: {purpose: 'courier-funding', inventoryPatch: {customer: {coinsSompi: '50000000'}, courier: {coinsSompi: '20000000'}}, scene: {place: 'Habitat', focus: 'The customer and courier now have separate test funds.', status: 'The payment and bond are ready to enter the delivery agreement.'}}};
  }

  deliveryArtifact() {
    const artifact = this.advancedTemplates?.delivery;
    if (!artifact) fail('The delivery contract artifact is not configured on this local host.', 503);
    return artifact;
  }

  async roleFunds(session, roleName, minimum) {
    const role = this.role(session, roleName);
    return this.funding(role.address, minimum, 3);
  }

  deliveryState(session, suffix = 'delivery') {
    const roles = this.allRoles(session), world = sha256(`Sprout Harbor V6 delivery\n${this.address}\n${session.id}`), deliveryId = sha256(`${world}\n${suffix}`);
    return delivery.v5DeliveryInitialState({customer: roles.customer.owner, courier: roles.courier.owner, recipient: roles.recipient.owner, world, deliveryId, paymentSompi: '20000000', bondSompi: '10000000', refundAgeDaa: 100});
  }

  async prepareCourierOpen(session, suffix = 'delivery', phase = 'delivery-open', nextStage = 'courier-locked') {
    const state = this.deliveryState(session, suffix), roles = this.allRoles(session), feeRate = await this.feeRate();
    const customerUtxos = await this.roleFunds(session, 'customer', 20000000n), courierUtxos = await this.roleFunds(session, 'courier', 10000000n), fundingUtxos = await this.funding(this.address, 5000000n);
    const plan = delivery.buildV5DeliveryOpen(this.sdk, {artifact: this.deliveryArtifact(), state, customerUtxos, courierUtxos, fundingUtxos, feeRate, maxFee: '20000000'});
    await delivery.signV5DeliveryPlan(plan, (tx, index, signer) => this.signFor(session, signer.owner, tx, index));
    const cellName = suffix === 'refund' ? 'courierRefund' : 'courierDelivery';
    const inventoryPatch = suffix === 'refund' ? {customer: {coinsSompi: '10000000'}, courier: {coinsSompi: '30000000'}} : {customer: {coinsSompi: '30000000'}, courier: {coinsSompi: '10000000'}};
    return {plan, journal: delivery.v5DeliveryJournal(plan), phase, kind: phase === 'refund-open' ? 'courier-refund-open' : 'courier-open', nextStage, debitSompi: String(asBig(plan.fee)), title: suffix === 'refund' ? 'A second delivery agreement was opened' : 'Payment and bond are locked separately', detail: suffix === 'refund' ? 'This second agreement withholds the recipient receipt for the age-based refund path.' : 'The customer payment and courier bond are now held by the delivery contract.', amounts: {payment: '20000000', bond: '10000000'}, meta: {purpose: phase, inventoryPatch, cell: {name: cellName, protocol: 'delivery', state, index: 0, certificate: null, amount: '30000000', setup: true}, scene: {place: 'Habitat', focus: suffix === 'refund' ? 'The no-receipt agreement is waiting for chain age.' : 'The customer payment and courier bond are visible as separate locked amounts.', status: suffix === 'refund' ? 'No receipt will be supplied for this second agreement.' : 'A recipient signature can release both amounts to the courier.'}}};
  }

  async courierCell(session, name = 'courierDelivery') {
    const saved = session.cells?.[name]; if (!saved) fail('The delivery agreement is not ready yet.', 409);
    const asset = delivery.instantiateV5Delivery(this.sdk, this.deliveryArtifact(), saved.state), utxo = saved.utxo ? await this.observedCell(asset, saved) : this.hydrate(saved);
    return {...saved, asset, utxo};
  }

  async prepareCourierRelease(session) {
    const cell = await this.courierCell(session, 'courierDelivery'), roles = this.allRoles(session), receiptDigest = await delivery.v5DeliveryReceiptDigest({state: cell.state, covenantId: cell.utxo.entry?.covenantId?.toString?.() || cell.utxo.covenantId}), receipt = this.sdk.signScriptHash(receiptDigest, roles.recipient.key).slice(2, -2), plan = delivery.buildV5DeliveryRelease(this.sdk, {artifact: this.deliveryArtifact(), cell, receipt, fundingUtxos: await this.funding(this.address, 5000000n), feeRate: await this.feeRate(), maxFee: '20000000'});
    await delivery.signV5DeliveryPlan(plan, (tx, index, signer) => this.signFor(session, signer.owner, tx, index));
    return {plan, journal: delivery.v5DeliveryJournal(plan), phase: 'delivery-release', kind: 'courier-release', nextStage: 'courier-delivered', debitSompi: String(asBig(plan.fee)), title: 'The courier was paid after the recipient receipt', detail: 'The game-operated recipient signature authorized release; Kaspa checked the signature and contract conditions.', amounts: {payment: '20000000', bond: '10000000'}, meta: {purpose: 'delivery-release', inventoryPatch: {customer: {coinsSompi: '30000000'}, courier: {coinsSompi: '40000000'}}, scene: {place: 'Habitat', focus: 'The courier carries the paid parcel away.', status: 'The recipient signature released the payment and bond.'}, result: {title: 'A signature authorized the payout', detail: 'The contract checked the recipient signature. It did not observe the physical parcel.', courier: {receiptPresent: true, paymentSompi: '20000000', bondSompi: '10000000'}, deltas: [{label: 'Recipient receipt', before: 'absent', after: 'verified'}, {label: 'Courier payout', before: '0.0 tKAS', after: '0.3 tKAS'}]}}};
  }

  async prepareCourierRefund(session) {
    const cell = await this.courierCell(session, 'courierRefund'), plan = delivery.buildV5DeliveryRefund(this.sdk, {artifact: this.deliveryArtifact(), cell, fundingUtxos: await this.funding(this.address, 5000000n), feeRate: await this.feeRate(), maxFee: '20000000'});
    await delivery.signV5DeliveryPlan(plan, (tx, index, signer) => this.signFor(session, signer.owner, tx, index));
    return {plan, journal: delivery.v5DeliveryJournal(plan), phase: 'delivery-refund', kind: 'courier-refund', nextStage: 'courier-complete', debitSompi: String(asBig(plan.fee)), title: 'The age-eligible refund returned the locked funds', detail: 'The customer received the 0.2 tKAS payment and the courier forfeited its 0.1 tKAS bond after the relative chain-age condition.', amounts: {payment: '20000000', bond: '10000000'}, meta: {purpose: 'delivery-refund', inventoryPatch: {customer: {coinsSompi: '40000000'}, courier: {coinsSompi: '0'}}, scene: {place: 'Habitat', focus: 'The no-receipt agreement returned the payment and forfeited the bond.', status: 'Chain age allowed the customer refund path.'}, result: {title: 'The refund used chain age', detail: 'The customer received the payment and the courier bond was forfeited. This does not prove whether a physical delivery failed.', courier: {refund: true, paymentSompi: '20000000', bondSompi: '10000000', bondForfeited: true}, deltas: [{label: 'Customer payment', before: 'locked', after: 'returned'}, {label: 'Courier bond', before: 'locked', after: 'forfeited to customer'}]}}};
  }

  async proofModule() {
    if (this.host?.v6ProofModule) return this.host.v6ProofModule;
    if (this._proofModule !== undefined) return this._proofModule;
    try { this._proofModule = await import('../src/v6-proof-protocol.mjs'); } catch { this._proofModule = null; }
    return this._proofModule;
  }

  async prepareProof(session) {
    const module = await this.proofModule();
    if (!module) return this.prepareHookDescriptor(session, 'proof-create', 'continue');
    const options = {session: copy(session), sdk: this.sdk, rpc: this.rpc, key: this.key, address: this.address, module, templates: this.proofTemplates, roles: this.allRoles(session)};
    const fn = module.buildV6ProofOpen || module.buildProofOpen || module.buildOpen;
    let descriptor;
    if (typeof fn === 'function') {
      if (!this.sdk || !this.proofTemplates || typeof module.initialV6ProofState !== 'function') fail('The V6 proof artifact and SDK are unavailable. No proof setup was prepared.', 503);
      const roles = this.allRoles(session), nonce = sha256(`Sprout Harbor V6 proof\n${this.address}\n${session.id}`).slice(0, 32).padEnd(64, '0'), state = module.initialV6ProofState({owner: roles.worker.owner, feeSponsor: roles.treasury.owner, taskNonce: nonce});
      const plan = fn(this.sdk, {template: this.proofTemplates, state, fundingUtxos: await this.funding(this.address, 33000000n), feeRate: await this.feeRate(), maxFee: '20000000'});
      await module.signV6ProofPlan(plan, (tx, index, signer) => this.signFor(session, typeof signer === 'string' ? signer : signer.owner, tx, index));
      const asset = module.instantiateV6Proof(this.sdk, this.proofTemplates, state);
      descriptor = {plan, journal: module.v6ProofJournal?.(plan) || module.proofJournal?.(plan), phase: 'proof-open', kind: 'proof-open', nextStage: 'proof-ready', meta: {purpose: 'proof-open', cell: {name: 'proof', protocol: 'proof', assetAddress: asset.address, state, index: 0, certificate: null, amount: String(plan.transaction.outputs[0].value), setup: true}}};
    } else if (typeof this.host?.prepareV6Proof === 'function') descriptor = await this.host.prepareV6Proof(options);
    else return this.prepareHookDescriptor(session, 'proof-create', 'continue');
    if (!descriptor) fail('The proof protocol did not prepare a transaction.', 503);
    if (descriptor.plan && !descriptor.journal) descriptor.journal = module.v6ProofJournal?.(descriptor.plan) || module.proofJournal?.(descriptor.plan) || null;
    return {...descriptor, phase: descriptor.phase || 'proof-open', kind: descriptor.kind || 'proof-open', nextStage: descriptor.nextStage || 'proof-ready', debitSompi: descriptor.debitSompi || String(descriptor.plan?.fee || 0), meta: {...(descriptor.meta || {}), purpose: 'proof-open', scene: {place: 'Observatory', focus: 'A precisely defined task is waiting for a proof.', status: 'The reward stays locked until the designated proof verifies.'}}};
  }

  async prepareProofRedeem(session) {
    const module = await this.proofModule();
    if (!module) return this.prepareHookDescriptor(session, 'proof-redeem', 'proof_redeem');
    const options = {session: copy(session), sdk: this.sdk, rpc: this.rpc, key: this.key, address: this.address, module, templates: this.proofTemplates, roles: this.allRoles(session)};
    const fn = module.buildV6ProofRedeem || module.buildProofRedeem || module.buildRedeem;
    let descriptor;
    if (typeof fn === 'function') {
      if (!this.sdk || !this.proofTemplates || typeof module.generateProof !== 'function') fail('The V6 proof artifact, prover and SDK are unavailable. No redemption was prepared.', 503);
      const saved = session.cells?.proof;
      if (!saved) fail('The funded proof task is unavailable. Open the Observatory task again.', 409);
      const asset = module.instantiateV6Proof(this.sdk, this.proofTemplates, saved.state), observed = saved.utxo ? await this.observedCell(asset, saved) : this.hydrate(saved), cell = {...saved, asset, utxo: observed}, proofBundle = module.generateProof({owner: saved.state.owner, taskNonce: saved.state.taskNonce, allocation: 6, rate: 7});
      const plan = fn(this.sdk, {template: this.proofTemplates, cell, proofBundle, fundingUtxos: await this.funding(this.address, 5000000n), feeRate: await this.feeRate(), maxFee: '20000000'});
      await module.signV6ProofPlan(plan, (tx, index, signer) => this.signFor(session, typeof signer === 'string' ? signer : signer.owner, tx, index));
      descriptor = {plan, journal: module.v6ProofJournal?.(plan) || module.proofJournal?.(plan), phase: 'proof-redeem', kind: 'proof-redeem', nextStage: 'proof-verified'};
    } else if (typeof this.host?.prepareV6ProofRedeem === 'function') descriptor = await this.host.prepareV6ProofRedeem(options);
    else return this.prepareHookDescriptor(session, 'proof-redeem', 'proof_redeem');
    if (!descriptor) fail('The proof protocol did not prepare a redemption transaction.', 503);
    if (descriptor.plan && !descriptor.journal) descriptor.journal = module.v6ProofJournal?.(descriptor.plan) || module.proofJournal?.(descriptor.plan) || null;
    return {...descriptor, phase: descriptor.phase || 'proof-redeem', kind: descriptor.kind || 'proof-redeem', nextStage: descriptor.nextStage || 'proof-verified', debitSompi: descriptor.debitSompi || String(descriptor.plan?.fee || 0), meta: {...(descriptor.meta || {}), purpose: 'proof-redeem', inventoryPatch: {worker: {coinsSompi: '13000000'}, observatory: {machineOn: true}}, scene: {place: 'Observatory', focus: 'The machine is running from the verified result.', status: 'Settings 6 and 7 satisfy the defined task.'}, result: {title: 'The proof released the reward', detail: 'The accepted proof paid the designated worker and turned on the observatory machine.', proof: {machineOn: true, allocation: 6, rate: 7, taskScore: 42}, deltas: [{label: 'Worker reward', before: 'locked', after: '0.13 tKAS'}, {label: 'Machine', before: 'off', after: 'on'}]}}};
  }

  async prepareAttack(session, action) {
    if (this.host?.prepareV6Attack) return this.host.prepareV6Attack({session: copy(session), action, sdk: this.sdk, templates: {argent: this.argentTemplates, advanced: this.advancedTemplates, launch: this.launchTemplate, proof: this.proofTemplates}, roles: this.allRoles(session)});
    if (!this.sdk) fail('An actual signed adversarial transaction is required for this local VM check.', 503);
    if (action === 'purchase_attack') {
      const descriptor = await this.preparePurchase(session), plan = descriptor.plan;
      // Keep the agreed +1 tool delta and every valid signer, but encode the
      // buyer output with its old tool quantity. The VM must reject the
      // seller's attempted payment-without-tool transition for that reason.
      const prior = plan.inputStates?.[0] || session.cells?.buyer?.state;
      if (!prior) fail('The purchase attack has no prior buyer state.', 503);
      const invalidState = {...plan.states[0], tools: Number(prior.tools)};
      const invalidAsset = instantiateV5Argent(this.sdk, this.argentTemplates, invalidState);
      plan.transaction.outputs[0].scriptPublicKey = this.sdk.payToScriptHashScript(invalidAsset.script);
      return this.resignArgentPlan(session, plan);
    }
    if (action === 'pip_attack') {
      const buyer = await this.businessCell(session, 'buyer'), seller = await this.businessCell(session, 'seller');
      const roles = this.allRoles(session), left = {...buyer, certificate: buyer.certificate || await this.certificate(session, buyer)}, right = {...seller, certificate: seller.certificate || await this.certificate(session, seller)};
      // Build an otherwise valid owner trade, then declare it delegated. The
      // buyer's saved allowance is already zero after Pip's prior trade; the
      // correct Pip signature therefore reaches the allowance check directly.
      const plan = buildV5ArgentTrade(this.sdk, {templates: this.argentTemplates, left, right, deltas: {crops: -1, wood: 1}, leftDelegated: false, rightDelegated: false, fundingUtxos: await this.funding(this.address, 5000000n), feeRate: await this.feeRate()});
      plan.calls[0].args[7] = 1;
      plan.signers[0] = {...plan.signers[0], owners: [roles.pip.owner]};
      return this.resignArgentPlan(session, plan);
    }
    if (action === 'ring_attack') {
      const descriptor = await this.prepareRingSwap(session), roles = this.allRoles(session), plan = descriptor.plan;
      const wrong = normalizedSignature(this.sdk.createInputSignature(plan.transaction, 0, roles.toolmaker.key));
      plan.transaction.inputs[0].signatureScript = v5ArgentUnlock(plan.calls[0], [wrong]);
      plan.transaction.finalize();
      return plan;
    }
    if (action === 'coord_attack') {
      // At coord-ready member2 is intentionally still unready. The normal
      // settle builder preserves that state; the launch VM must reject it.
      const descriptor = await this.prepareCoordJoinStep(session, 'settle');
      descriptor.plan.transaction.finalize();
      return descriptor.plan;
    }
    if (action === 'proof_attack') {
      const descriptor = await this.prepareProofRedeem(session), plan = descriptor?.plan, module = await this.proofModule();
      if (!plan?.transaction || !module?.v6ProofUnlock || !module?.v6ProofMass) fail('The proof attack needs the real proof transaction builder.', 503);
      const proof = String(plan.proof || '');
      if (proof.length < 2) fail('The proof attack has no proof bytes to mutate.', 503);
      // Preserve the designated worker and fee-sponsor signatures while
      // changing one proof byte. The native VM must reject the cryptographic
      // proof itself, rather than a substitute signer.
      const offset = 0, prior = proof.slice(offset, offset + 2).toLowerCase();
      plan.proof = proof.slice(0, offset) + (prior === '00' ? '01' : '00') + proof.slice(offset + 2);
      if (plan.call?.args) plan.call.args[1] = plan.proof;
      const placeholder = '00'.repeat(64) + '01';
      plan.transaction.inputs[0].signatureScript = module.v6ProofUnlock(plan, placeholder);
      for (const input of plan.transaction.inputs.slice(1)) input.signatureScript = pushPublicData(placeholder);
      const mass = module.v6ProofMass(plan, {feeRate: plan.mass?.feeRate || 100});
      plan.mass = mass;
      plan.transaction.storageMass = BigInt(mass.storageMass);
      for (let index = 0; index < plan.transaction.inputs.length; index += 1) {
        const signer = plan.signers[index];
        const owner = typeof signer === 'string' ? signer : signer?.owner;
        if (!owner) fail('The proof attack signer shape is incomplete.', 503);
        const raw = normalizedSignature(this.signFor(session, owner, plan.transaction, index));
        plan.transaction.inputs[index].signatureScript = index === 0 ? module.v6ProofUnlock(plan, raw) : pushPublicData(raw);
      }
      plan.transaction.finalize();
      return plan;
    }
    fail('No signed adversarial proposal is defined for this action.', 503);
  }

  async advance(session, requestId, action) {
    if (action === 'primary') action = this.primaryAction(session.stage);
    if (session.pending) {
      if (action !== 'resume' && action !== 'start') fail('A saved V6 transaction is still settling. Resume that exact transaction first.', 409);
      await this.reconcile(session, {allowBroadcast: true});
      if (session.pending) return session;
      // An accepted queued step is deliberately returned before the next step
      // is prepared. The next Resume click authorizes the next transaction.
      if (session.intent) return session;
    }
    if (session.intent && (action === 'resume' || action === 'continue' || action === 'start')) return this.continueIntent(session, requestId, action);
    switch (session.stage) {
      case 'purchase-ready':
        if (action === 'purchase_attack') return this.prepareAttack(session, action).then(plan => this.attack(session, requestId, action, {hostPlan: plan, rule: 'The seller cannot keep the payment while omitting the promised tool.', summary: 'Kaspa script VM rejected locally · no transaction sent'}));
        if (action === 'purchase') return this.persistPending(session, await this.preparePurchase(session), requestId, action).then(() => session);
        break;
      case 'purchase-complete':
        if (action === 'continue') { session.stage = 'pip-ready'; session.chapter = 1; session.result = null; session.operation = null; session.scene = {place: 'Workshop', focus: 'Pip is waiting for one bounded job.', status: 'The next chapter begins with a saved spending rule.'}; await this.save(session); return session; }
        break;
      case 'pip-ready':
        if (action === 'configure') return this.persistPending(session, await this.prepareConfigure(session), requestId, action).then(() => session);
        break;
      case 'pip-permitted':
        if (action === 'resume') return this.persistPending(session, await this.preparePipTrade(session), requestId, action).then(() => session);
        break;
      case 'pip-traded':
        if (action === 'pip_attack') {
          session.scene = {...session.scene, result: {pip: {allowanceCrops: 0, receivedWood: 1, revoked: false, rejected: true}}};
          return this.prepareAttack(session, action).then(plan => this.attack(session, requestId, action, {hostPlan: plan, nextStage: 'pip-blocked', rule: 'Pip’s remaining crop allowance is zero, so an additional delegated crop spend is rejected.', summary: 'Kaspa script VM rejected locally · no transaction sent'}));
        }
        break;
      case 'pip-blocked':
        if (action === 'revoke') return this.persistPending(session, await this.prepareRevoke(session), requestId, action).then(() => session);
        break;
      case 'pip-complete':
        if (action === 'continue') {
          session.stage = 'ring-setup'; session.chapter = 2; session.result = null; session.operation = null; session.intent = makeIntent(session, 'ring-setup', ['genesis'], 'ring-ready', 'ring-setup');
          const descriptor = await this.prepareRingGenesis(session); descriptor.meta = {...(descriptor.meta || {}), intentIndex: 0}; await this.persistPending(session, descriptor, requestId, action); return session;
        }
        break;
      case 'ring-ready':
        if (action === 'ring_attack') return this.prepareAttack(session, action).then(plan => this.attack(session, requestId, action, {hostPlan: plan, rule: 'The ring requires every distinct business and cannot settle with one approval missing.', summary: 'Kaspa script VM rejected locally · no transaction sent'}));
        if (action === 'ring') return this.persistPending(session, await this.prepareRingSwap(session), requestId, action).then(() => session);
        break;
      case 'ring-complete':
        if (action === 'continue') {
          session.stage = 'coord-setup'; session.chapter = 3; session.result = null; session.operation = null; session.intent = makeIntent(session, 'coord-setup', ['genesis', 'ready0', 'ready1'], 'coord-ready', 'coord-setup');
          const descriptor = await this.prepareCoordSetupStep(session, 'genesis'); descriptor.meta = {...(descriptor.meta || {}), intentIndex: 0}; await this.persistPending(session, descriptor, requestId, action); return session;
        }
        break;
      case 'coord-ready':
        if (action === 'coord_attack') return this.prepareAttack(session, action).then(plan => this.attack(session, requestId, action, {hostPlan: plan, rule: 'The greenhouse contract needs three distinct ready pledges before it can release the pooled amount.', summary: 'Kaspa script VM rejected locally · no transaction sent'}));
        if (action === 'withdraw') return this.persistPending(session, await this.prepareCoordWithdraw(session), requestId, action).then(() => session);
        break;
      case 'coord-withdrawn':
        if (action === 'resume') {
          session.stage = 'coord-setup'; session.intent = makeIntent(session, 'coord-cleanup', ['close0', 'close2', 'genesis', 'ready0', 'ready1'], 'coord-join-ready', 'coord-setup');
          const descriptor = await this.prepareCoordCleanupStep(session, 'close0'); descriptor.meta = {...(descriptor.meta || {}), intentIndex: 0}; await this.persistPending(session, descriptor, requestId, action); return session;
        }
        break;
      case 'coord-join-ready':
        if (action === 'join') {
          session.intent = makeIntent(session, 'coord-join', ['ready2', 'settle'], 'coord-complete', 'coord-join-ready');
          const descriptor = await this.prepareCoordJoinStep(session, 'ready2'); descriptor.meta = {...(descriptor.meta || {}), intentIndex: 0}; await this.persistPending(session, descriptor, requestId, action); return session;
        }
        break;
      case 'coord-complete':
        if (action === 'continue') {
          session.stage = 'courier-funding'; session.chapter = 4; session.result = null; session.operation = null; await this.persistPending(session, await this.prepareCourierFunding(session), requestId, action); return session;
        }
        break;
      case 'courier-ready':
        if (action === 'courier_open') return this.persistPending(session, await this.prepareCourierOpen(session), requestId, action).then(() => session);
        break;
      case 'courier-locked':
        if (action === 'courier_release') return this.persistPending(session, await this.prepareCourierRelease(session), requestId, action).then(() => session);
        break;
      case 'courier-delivered':
        if (action === 'courier_refund_open') return this.persistPending(session, await this.prepareCourierOpen(session, 'refund', 'refund-open', 'courier-wait'), requestId, action).then(() => session);
        break;
      case 'courier-wait':
        if (action === 'refresh' || action === 'resume') { await this.refreshRefundStage(session); await this.save(session); return session; }
        break;
      case 'courier-refund-ready':
        if (action === 'refund') return this.persistPending(session, await this.prepareCourierRefund(session), requestId, action).then(() => session);
        break;
      case 'courier-complete':
        if (action === 'continue') {
          session.stage = 'proof-create'; session.chapter = 5; session.result = null; session.operation = null; session.intent = null; await this.persistPending(session, await this.prepareProof(session), requestId, action); return session;
        }
        break;
      case 'proof-ready':
        if (action === 'proof_attack') return this.prepareAttack(session, action).then(plan => this.attack(session, requestId, action, {hostPlan: plan, nextStage: 'proof-blocked', rule: 'The proof must bind the task score, reward, recipient and nonce; a tampered proof cannot release the reward.', summary: 'Kaspa script VM rejected locally · no transaction sent'}));
        break;
      case 'proof-blocked':
        if (action === 'proof_redeem') return this.persistPending(session, await this.prepareProofRedeem(session), requestId, action).then(() => session);
        break;
      case 'proof-verified':
      case 'proof-complete':
        if (action === 'continue') { session.stage = 'complete'; session.chapter = 5; session.result = {title: 'The six rules are complete', detail: 'Return to any district to inspect the observed receipts and persistent consequences.', description: 'Local demonstration accounts remain isolated from personal funds.'}; this.updateProgress(session); await this.save(session); return session; }
        break;
      case 'complete':
        if (action === 'freeplay' || action === 'continue') return session;
        break;
      default: break;
    }
    fail(`Action ${action} is not available at stage ${session.stage}.`, 409);
  }

  primaryAction(stage) {
    return {
      'purchase-ready': 'purchase', 'purchase-complete': 'continue', 'pip-ready': 'configure', 'pip-permitted': 'resume', 'pip-traded': 'pip_attack', 'pip-blocked': 'revoke', 'pip-complete': 'continue', 'ring-ready': 'ring', 'ring-complete': 'continue', 'coord-ready': 'withdraw', 'coord-withdrawn': 'resume', 'coord-join-ready': 'join', 'coord-complete': 'continue', 'courier-ready': 'courier_open', 'courier-locked': 'courier_release', 'courier-delivered': 'courier_refund_open', 'courier-wait': 'refresh', 'courier-refund-ready': 'refund', 'courier-complete': 'continue', 'proof-ready': 'proof_attack', 'proof-blocked': 'proof_redeem', 'proof-verified': 'continue', 'proof-complete': 'continue', complete: 'freeplay',
    }[stage] || 'resume';
  }

  async authenticate(id, capability) {
    if (typeof id !== 'string' || !UUID.test(id) || typeof capability !== 'string' || !/^[a-f0-9]{64}$/i.test(capability)) fail('Reconnect the saved local V6 session.', 401);
    const session = await this.load(id);
    if (!session || !timingEqualHex(session.capHash, sha256(capability))) fail('Reconnect the saved local V6 session.', 401);
    return session;
  }

  async start(body) {
    only(body, ['id', 'capability']);
    if (typeof body.id !== 'string' || !UUID.test(body.id) || typeof body.capability !== 'string' || !/^[a-f0-9]{64}$/i.test(body.capability)) fail('A browser-generated V6 id and 32-byte capability are required.', 400);
    const capHash = sha256(body.capability), existing = await this.load(body.id);
    if (existing) {
      if (!timingEqualHex(existing.capHash, capHash)) fail('This V6 id is already paired with another capability.', 401);
      await this.reconcile(existing, {allowBroadcast: false});
      const startAction = existing.actions?.__start;
      if (!existing.pending && startAction && ['preparing', 'failed'].includes(startAction.status) && startAction.retryable !== false) {
        startAction.status = 'preparing';
        startAction.attempts = Number(startAction.attempts || 0) + 1;
        startAction.updatedAt = this.now();
        await this.save(existing);
        try {
          await this.startOperation(existing, '__start', 'start');
          existing.actions.__start = {...startAction, status: existing.pending ? 'submitted' : 'applied', retryable: false};
          await this.save(existing);
        } catch (error) {
          const stored = await this.load(existing.id) || existing;
          if (!stored.pending) {
            stored.actions ||= {};
            stored.actions.__start = {...(stored.actions.__start || startAction), status: 'failed', retryable: true, error: String(error?.message || error).slice(0, 240), failedAt: this.now()};
            stored.error = String(error?.message || error).slice(0, 240);
            await this.save(stored);
          }
          throw error;
        }
      }
      return json({session: this.publicSnapshot(existing)}, existing.pending ? 202 : 200);
    }
    const session = makeSession(body.id, capHash, this.now());
    // The browser-generated identity is durable before the first protocol
    // preparation. A timeout can therefore repeat Start without funding twice.
    await this.save(session);
    session.actions.__start = {fingerprint: JSON.stringify({action: 'start'}), stage: session.stage, status: 'preparing', attempts: 1, createdAt: this.now()};
    await this.save(session);
    try {
      await this.startOperation(session, '__start', 'start');
      session.actions.__start = {...session.actions.__start, status: session.pending ? 'submitted' : 'applied', retryable: false};
      await this.save(session);
    } catch (error) {
      // Preparation can fail before a pending transaction exists (for
      // example, a temporary RPC or artifact failure). Preserve the request
      // as retryable so repeating Start does not strand the browser session.
      const stored = await this.load(session.id) || session;
      if (!stored.pending) {
        stored.actions ||= {};
        stored.actions.__start = {...(stored.actions.__start || session.actions.__start), status: 'failed', retryable: true, error: String(error?.message || error).slice(0, 240), failedAt: this.now()};
        stored.error = String(error?.message || error).slice(0, 240);
        await this.save(stored);
      }
      throw error;
    }
    return json({session: this.publicSnapshot(session)}, session.pending ? 202 : 200);
  }

  async action(body) {
    only(body, ['id', 'capability', 'requestId', 'action', 'payload']);
    if (typeof body.requestId !== 'string' || !body.requestId || body.requestId.length > 128 || typeof body.action !== 'string' || !ACTIONS.has(body.action)) fail('Invalid V6 action request.', 400);
    const session = await this.authenticate(body.id, body.capability);
    const action = body.action === 'connect' ? 'resume' : body.action;
    if (action === 'resume') this.validateIntentResume(session, body.requestId, body.payload);
    if (session.pending && action !== 'resume') {
      // A repeated request may safely observe the same saved operation. A new
      // intent cannot overtake it.
      const prior = session.actions?.[body.requestId];
      if (!prior) fail('Resume the saved V6 transaction before another action.', 409);
    }
    const fingerprint = JSON.stringify({action: body.action, payload: body.payload ?? null});
    const prior = session.actions?.[body.requestId];
    if (prior && prior.fingerprint !== fingerprint) fail('This V6 request id was already used for another action.', 409);
    const retryPreparation = prior && !session.pending && ['preparing', 'failed'].includes(prior.status) && prior.retryable !== false;
    if (prior && !retryPreparation) {
      await this.reconcile(session, {allowBroadcast: action === 'resume'});
      return json({session: this.publicSnapshot(session)}, session.pending ? 202 : 200);
    }
    session.actions ||= {};
    session.actions[body.requestId] = {
      ...(retryPreparation ? prior : {}),
      fingerprint,
      stage: retryPreparation ? prior.stage : session.stage,
      createdAt: retryPreparation ? prior.createdAt : this.now(),
      status: 'preparing',
      attempts: Number(retryPreparation ? prior.attempts : 0) + 1,
      updatedAt: this.now(),
    };
    await this.save(session);
    try {
      await this.advance(session, body.requestId, action);
      session.actions[body.requestId] = {...session.actions[body.requestId], status: session.pending ? 'submitted' : 'applied', retryable: false};
      await this.save(session);
    } catch (error) {
      // A failed preparation without a pending lock is safe to retry with
      // the same idempotency key. If a pending lock was durable, retain the
      // preparing record so the next request reconciles that exact operation.
      const stored = await this.load(session.id) || session;
      if (!stored.pending) {
        stored.actions ||= {};
        stored.actions[body.requestId] = {...(stored.actions[body.requestId] || session.actions[body.requestId]), status: 'failed', retryable: true, error: String(error?.message || error).slice(0, 240), failedAt: this.now()};
        stored.error = String(error?.message || error).slice(0, 240);
        await this.save(stored);
      }
      throw error;
    }
    return json({session: this.publicSnapshot(session)}, session.pending ? 202 : 200);
  }

  async handle(request) {
    try {
      if (!request || request.method !== 'POST') fail('V6 actions require POST.', 405);
      const path = new URL(request.url).pathname, body = await request.json();
      if (path === '/api/v6/start') return await this.start(body);
      if (path === '/api/v6/status') {
        only(body, ['id', 'capability']);
        const session = await this.authenticate(body.id, body.capability);
        await this.reconcile(session, {allowBroadcast: false});
        return json({session: this.publicSnapshot(session)}, session.pending ? 202 : 200);
      }
      if (path === '/api/v6/action') return await this.action(body);
      fail('Not found.', 404);
    } catch (error) {
      return json({error: error?.message || 'Unable to update the local V6 session.'}, error?.status || 503);
    }
  }
}
