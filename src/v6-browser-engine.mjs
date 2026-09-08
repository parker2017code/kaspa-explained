import {V6_NETWORK, v6Call, v6Clone, v6Hash, v6Outpoint} from './v6-browser-wallet.mjs';
import {observePublicAcceptance} from './public-acceptance.mjs';
import {publicTransactionMass, pushPublicData} from './public-contracts.mjs';
import {buildPublicPayment, signPublicAssetPlan, validatePublicAssetPlan} from './public-asset-signing.mjs';
import {buildV4Genesis, buildV4Transition, instantiateV4, publicV4Journal, derivePublicV4RecoveryPlan} from './public-v4-protocol.mjs';
import * as business from './v5-argent-protocol.mjs';
import * as ring from './v5-ring-protocol.mjs';
import * as delivery from './v5-delivery-protocol.mjs';
import * as proof from './v6-proof-core.mjs';

const stepChapter = id => id.startsWith('purchase-') ? 0 : id.startsWith('pip-') ? 1 : id.startsWith('ring-') ? 2 : id.startsWith('greenhouse-') ? 3 : id.startsWith('courier-') || id.startsWith('refund-') ? 4 : id.startsWith('proof-') ? 5 : -1;
const STEPS = new Set(['purchase-buyer','purchase-seller','purchase-buy','pip-buyer','pip-seller','pip-permit','pip-pay','pip-revoke','ring-create','ring-settle','greenhouse-create','greenhouse-ready0','greenhouse-ready1','greenhouse-ready2','greenhouse-withdraw0','greenhouse-withdraw1','greenhouse-withdraw2','greenhouse-settle','courier-fund','courier-open','courier-deliver','refund-open','refund-claim','proof-open','proof-redeem']);
const NATIVE_KIND = 'v6-native-payment';
const digest = async value => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(b => b.toString(16).padStart(2, '0')).join('');
const rawSignature = value => /^41[0-9a-f]{130}$/i.test(value) ? value.slice(2) : value;
const txShape = transaction => {const value = JSON.parse(transaction.serializeToSafeJSON()); delete value.id; for (const input of value.inputs) delete input.signatureScript; return JSON.stringify(value);};
const outputId = output => output.covenant?.covenantId?.toString() || null;
const entryId = entry => entry.entry?.covenantId?.toString() || null;

export class V6BrowserEngine {
  constructor(wallet, {onChange = () => {}, onAccepted = () => {}} = {}) {
    this.wallet = wallet; this.onChange = onChange; this.onAccepted = onAccepted;
    this.domains = null; this.templates = null; this.loading = null; this.review = null; this.busy = false; this.checking = false;
    this.error = null; this.message = ''; this.proofBundle = null; this.reviewDuration = 120000;
  }
  get data() {return this.wallet.data;}
  get records() {return this.data.records || [];}
  get pending() {return this.records.find(record => !record.acceptingBlock) || null;}
  accepted(step) {return this.records.find(record => record.step === step && v6Hash(record.acceptingBlock));}
  get completed() {
    return [this.accepted('purchase-buy'),this.accepted('pip-revoke'),this.accepted('ring-settle'),this.accepted('greenhouse-settle') || [0,1,2].every(i => this.accepted(`greenhouse-withdraw${i}`)),this.accepted('courier-deliver'),this.accepted('proof-redeem')].flatMap((done, index) => done ? [index] : []);
  }
  async load() {
    if (this.templates) return;
    if (this.loading) return this.loading;
    this.loading = (async () => {
      await this.wallet.loadSDK();
      const files = ['v5-argent-templates.json', 'v5-advanced-templates.json', 'public-templates.json', 'v6-proof-templates.json'];
      const values = await Promise.all(files.map(async file => {const response = await fetch('/assets/' + file); if (!response.ok) throw Error('A required contract file could not be loaded. No transaction was prepared.'); return response.json();}));
      this.templates = {business: values[0], advanced: values[1], launch: values[2].templates.launch, proof: values[3]};
      await this.loadDomains(); this.validateRecovery();
    })().catch(error => {this.templates = null; throw error;}).finally(() => {this.loading = null;});
    return this.loading;
  }
  async loadDomains() {this.domains = Object.fromEntries(await Promise.all(['purchase','pip','ring','greenhouse','courier','proof'].map(async name => [name,await this.world(name)])));}
  async world(name) {return digest(`Kaspa Explained browser lesson\n${this.data.id}\n${name}`);}
  notify() {this.onChange();}
  async run(fn) {
    if (this.busy) return;
    this.busy = true; this.error = null; this.message = ''; this.notify();
    try {await fn();} catch (error) {this.error = error.message || 'This action could not finish. The saved wallet and transactions are retained.';}
    finally {this.busy = false; this.notify();}
  }
  validateRecovery() {
    if (!this.wallet.ready) return;
    const ids = new Set(), steps = new Set();
    for (const record of this.records) {
      if (!STEPS.has(record.step) || stepChapter(record.step) !== record.chapter || ids.has(record.id) || steps.has(record.step)) throw Error('The saved lesson history is inconsistent. Nothing will be signed.');
      this.validateRecord(record); this.recover(record.journal); ids.add(record.id); steps.add(record.step);
      if (record.acceptingBlock && !v6Hash(record.acceptingBlock) || record.checkpoint && !v6Hash(record.checkpoint)) throw Error('A saved transaction observation is invalid.');
    }
    if (this.records.filter(record => !record.acceptingBlock && !record.acceptanceUnverified).length > 1) throw Error('More than one unresolved transaction is saved. Keep this wallet for recovery.');
  }
  validateRecord(record) {
    const step = record.step, j = record.journal, owners = this.wallet.owners;
    let expected;
    if (/^(purchase|pip)-(buyer|seller)$/.test(step)) expected = ['v5-argent','genesis'];
    else if (step === 'purchase-buy' || step === 'pip-pay') expected = ['v5-argent','trade'];
    else if (step === 'pip-permit' || step === 'pip-revoke') expected = ['v5-argent','configure'];
    else if (step.startsWith('ring-')) expected = ['v5-ring',step === 'ring-create' ? 'ring-genesis' : 'ring'];
    else if (step.startsWith('greenhouse-')) expected = ['launch',step === 'greenhouse-create' ? null : step.includes('ready') ? 0 : step.includes('withdraw') ? 2 : 1];
    else if (step === 'courier-fund') expected = [NATIVE_KIND,undefined];
    else if (step === 'proof-open' || step === 'proof-redeem') expected = ['v6-proof',step];
    else if (step === 'courier-open' || step === 'refund-open') expected = ['v5-delivery','delivery-open'];
    else if (step === 'courier-deliver') expected = ['v5-delivery','delivery-release'];
    else if (step === 'refund-claim') expected = ['v5-delivery','delivery-refund'];
    if (!expected || j.kind !== expected[0] || j.operation !== expected[1]) throw Error('A saved lesson action does not match its transaction. Nothing will be signed.');
    const tx = this.wallet.sdk.Transaction.deserializeFromSafeJSON(j.transaction), states = [...(j.states || []),...(j.inputStates || []),...(j.genesis || []),...(j.state ? [j.state] : [])];
    if (record.id !== j.id || tx.id !== record.id || !v6Hash(record.checkpoint)) throw Error('A saved transaction identity or observation checkpoint is invalid.');
    const fee = tx.inputs.reduce((sum,i) => sum + i.utxo.amount,0n) - tx.outputs.reduce((sum,o) => sum + o.value,0n);
    if (record.fee !== undefined && record.fee !== String(fee)) throw Error('A saved transaction fee changed.');
    if (j.kind === 'v5-argent') {
      const prefix = step.split('-')[0];
      if (states.some(state => !owners.slice(0,2).includes(state.owner) || this.domains && state.world !== this.domains[prefix])) throw Error('A saved trading account belongs to a different lesson or owner.');
      if (step.endsWith('-buyer') || step.endsWith('-seller')) {
        const seller = step.endsWith('-seller');
        const expectedState = business.v5ArgentInitialState({owner:owners[seller?1:0],issuer:owners[0],world:j.states[0].world,resources:seller?{tools:3,wood:3}:{}});
        if (JSON.stringify(expectedState) !== JSON.stringify(j.states[0]) || tx.outputs[0].value !== (seller ? 10000000n : 40000000n)) throw Error('The saved starting inventory or deposit changed.');
      }
      if (j.operation === 'trade') {
        const resource = step === 'purchase-buy' ? 'tools' : 'wood';
        if (j.states[0].owner !== owners[0] || j.states[1].owner !== owners[1] || tx.inputs[0].utxo.amount - tx.outputs[0].value !== 6000000n || ['crops','wood','ore','tools','bread'].some(r => j.states[0][r] - j.inputStates[0][r] !== (r === resource ? 1 : 0))) throw Error('The saved purchase does not match the reviewed price and goods.');
      }
      if (j.operation === 'configure') {
        const permit = step === 'pip-permit', state = j.states[0];
        if (state.owner !== owners[0] || state.operator !== owners[permit?2:0] || state.allow_coin !== (permit?6000000:0) || state.min_receive !== (permit?1:0) || ['crops','wood','ore','tools','bread'].some(r => state['allow_' + r] !== 0)) throw Error('The saved Pip permission differs from this lesson.');
      }
    }
    if (j.kind === 'v5-ring' && states.some(state => state.owner !== owners[state.role] || this.domains && state.world !== this.domains.ring)) throw Error('A saved ring participant or lesson changed.');
    if (j.kind === 'launch' && states.some(state => state.owner !== owners[state.member] || state.beneficiary !== owners[0] || this.domains && state.worldId !== this.domains.greenhouse)) throw Error('A saved pledge belongs to a different group.');
    if (/^greenhouse-(ready|withdraw)/.test(step) && j.inputStates[0]?.member !== Number(step.at(-1))) throw Error('The saved pledge action names a different neighbor.');
    if (j.kind === 'v5-delivery' && states.some(state => state.customer !== owners[2] || state.courier !== owners[1] || state.recipient !== owners[0] || this.domains && state.world !== this.domains.courier)) throw Error('A saved delivery account or lesson changed.');
    if (j.kind === 'v6-proof' && states.some(state => state.owner !== owners[1] || state.feeSponsor !== owners[0] || this.domains && state.taskNonce !== this.domains.proof.slice(0,32).padEnd(64,'0'))) throw Error('The saved proof is for a different task or recipient.');
  }
  recover(journal) {
    const sdk = this.wallet.sdk, owners = this.wallet.owners, t = this.templates;
    let plan;
    if (journal.kind === 'v5-argent') plan = business.deriveV5ArgentPlan(sdk, {templates: t.business, journal, issuer: owners[0]});
    else if (journal.kind === 'v5-ring') plan = ring.deriveV5RingPlan(sdk, {templates: t.advanced.ring, journal, issuer: owners[0]});
    else if (journal.kind === 'v5-delivery') plan = delivery.deriveV5DeliveryPlan(sdk, {artifact: t.advanced.delivery, journal, expectedState: journal.states?.[0] || journal.inputStates?.[0]});
    else if (journal.kind === 'launch') plan = derivePublicV4RecoveryPlan(sdk, {templates: {launch: t.launch}, journal, keysPublic: owners});
    else if (journal.kind === 'v6-proof') plan = proof.deriveV6ProofPlan(sdk, {template: t.proof, journal});
    else if (journal.kind === NATIVE_KIND) {
      const tx = sdk.Transaction.deserializeFromSafeJSON(journal.transaction); tx.finalize();
      if (tx.id !== journal.id || journal.network !== V6_NETWORK || journal.version !== 1 || !Array.isArray(journal.recipients) || journal.recipients.length !== 2 || journal.owner !== owners[0]) throw Error('The saved account-funding transaction changed.');
      if (JSON.stringify(journal.recipients) !== JSON.stringify([{recipient:owners[2],amount:'40000000'},{recipient:owners[1],amount:'20000000'}])) throw Error('The saved account-funding recipients or amounts changed.');
      plan = buildPublicPayment(sdk, {fundingUtxos: tx.inputs.map(input => input.utxo), owner: journal.owner, recipients: journal.recipients, feeRate: journal.feeRate});
      if (txShape(plan.transaction) !== txShape(tx) || String(plan.fee) !== journal.fee) throw Error('The saved account-funding outputs changed.');
      // Native signatures are checked by the node; keep the exact wire for
      // a retry instead of signing or rebuilding a different transaction.
      plan.transaction = tx;
    } else throw Error('The saved transaction uses an unsupported contract.');
    if (plan.signers.some(signer => (signer.owners || [typeof signer === 'string' ? signer : signer.owner]).some(owner => !owners.includes(owner)))) throw Error('A saved transaction requires a key outside this wallet.');
    return plan;
  }
  cells() {
    const result = new Map();
    for (const record of this.records) {
      if (!record.acceptingBlock) continue;
      const journal = record.journal, tx = this.wallet.sdk.Transaction.deserializeFromSafeJSON(journal.transaction);
      const set = (name, index, state, kind) => {const output = tx.outputs[index]; if (!output) throw Error('A saved contract output is missing.'); result.set(name, {name, kind, state, amount: BigInt(output.value), script: output.scriptPublicKey.script, covenantId: outputId(output), transactionId: record.id, index, acceptingBlock: record.acceptingBlock});};
      const step = record.step;
      if (/^(purchase|pip)-(buyer|seller)$/.test(step)) set(step, 0, journal.states[0], 'business');
      if (step === 'purchase-buy' || step === 'pip-pay') {const prefix = step.split('-')[0]; set(prefix + '-buyer', 0, journal.states[0], 'business'); set(prefix + '-seller', 1, journal.states[1], 'business');}
      if (step === 'pip-permit' || step === 'pip-revoke') set('pip-buyer', 0, journal.states[0], 'business');
      if (step === 'ring-create' || step === 'ring-settle') for (let i = 0; i < 3; i++) set('ring-' + i, i, journal.states[i], 'ring');
      if (step === 'greenhouse-create') for (let i = 0; i < 3; i++) set('greenhouse-' + i, i, journal.genesis[i], 'launch');
      if (step.startsWith('greenhouse-ready')) set('greenhouse-' + step.at(-1), 0, journal.states[0], 'launch');
      if (step.startsWith('greenhouse-withdraw')) result.delete('greenhouse-' + step.at(-1));
      if (step === 'greenhouse-settle') for (let i = 0; i < 3; i++) result.delete('greenhouse-' + i);
      if (step === 'courier-open' || step === 'refund-open') set(step, 0, journal.states[0], 'delivery');
      if (step === 'courier-deliver') result.delete('courier-open');
      if (step === 'refund-claim') result.delete('refund-open');
      if (step === 'proof-open') set(step, 0, journal.state, 'proof');
      if (step === 'proof-redeem') result.delete('proof-open');
    }
    return result;
  }
  async liveCell(name) {
    const saved = this.cells().get(name); if (!saved) throw Error('This example needs its earlier deposit first.');
    const sdk = this.wallet.sdk, t = this.templates;
    const asset = saved.kind === 'business' ? business.instantiateV5Argent(sdk, t.business, saved.state) : saved.kind === 'ring' ? ring.instantiateV5Ring(sdk, t.advanced.ring, saved.state) : saved.kind === 'launch' ? instantiateV4(sdk, t.launch, 'launch', saved.state) : saved.kind === 'delivery' ? delivery.instantiateV5Delivery(sdk, t.advanced.delivery, saved.state) : proof.instantiateV6Proof(sdk, t.proof, saved.state);
    if (sdk.payToScriptHashScript(asset.script).script !== saved.script) throw Error('The saved contract does not match its rule.');
    const address = sdk.addressFromScriptPublicKey({version: 0, script: saved.script}, V6_NETWORK).toString();
    const {entries} = await v6Call(this.wallet.rpc.getUtxosByAddresses([address]));
    const utxo = entries.find(entry => entry.outpoint.transactionId === saved.transactionId && entry.outpoint.index === saved.index && BigInt(entry.amount) === saved.amount && entry.entry.scriptPublicKey.version === 0 && entry.entry.scriptPublicKey.script === saved.script && entryId(entry) === saved.covenantId);
    if (!utxo) throw Error('The node cannot find this exact unspent contract output. No transaction was signed; refresh its transaction record.');
    let certificate = null;
    if (saved.kind === 'business' || saved.kind === 'ring') {
      const makeDigest = saved.kind === 'business' ? business.v5ArgentCertificateDigest : ring.v5RingCertificateDigest;
      const hash = await makeDigest({world: saved.state.world, covenantId: saved.covenantId, owner: saved.state.owner});
      certificate = this.wallet.sdk.signScriptHash(hash, this.wallet.keys[0]).slice(2, -2);
    }
    return {...saved, asset, utxo, certificate};
  }
  assertStep(step) {
    if (!STEPS.has(step)) throw Error('Unknown lesson action.');
    if (this.records.some(record => record.step === step)) throw Error('That action already has a saved transaction. It will not be sent twice.');
    const need = (...ids) => {if (ids.some(id => !this.accepted(id))) throw Error('Finish the named preparation steps before this transaction.');};
    if (step === 'purchase-buy') need('purchase-buyer', 'purchase-seller');
    if (step === 'pip-permit') need('pip-buyer', 'pip-seller');
    if (step === 'pip-pay') need('pip-permit');
    if (step === 'pip-revoke') need('pip-pay');
    if (step === 'ring-settle') need('ring-create');
    if (/^greenhouse-(ready|withdraw)/.test(step)) need('greenhouse-create');
    if (step === 'greenhouse-settle') need('greenhouse-ready0','greenhouse-ready1','greenhouse-ready2');
    if (step === 'courier-open') need('courier-fund');
    if (step === 'courier-deliver') need('courier-open');
    if (step === 'refund-open') need('courier-deliver');
    if (step === 'refund-claim') need('refund-open');
    if (step === 'proof-redeem') need('proof-open');
  }
  async prepare(step, title) {
    this.review = null;
    if (!this.wallet.ready) throw Error('Create your test wallet first.');
    if (this.pending) throw Error(`“${this.pending.title}” is still being observed. You can explore other lessons while it resolves.`);
    if (this.records.length >= 90) throw Error('This wallet has reached the demonstration history limit. Keep its recovery file.');
    await this.load(); await this.wallet.connect(); this.assertStep(step);
    const sdk = this.wallet.sdk, owners = this.wallet.owners, addresses = this.wallet.addresses, t = this.templates;
    const info = await this.wallet.nodeInfo(true), feeRate = info.feeRate, funds = minimum => this.wallet.funding(0, minimum || 50000000n);
    let plan, kind, recipients;
    if (/^(purchase|pip)-(buyer|seller)$/.test(step)) {
      const [prefix, role] = step.split('-'), state = business.v5ArgentInitialState({owner: owners[role === 'buyer' ? 0 : 1], issuer: owners[0], world: await this.world(prefix), resources: role === 'seller' ? {tools: 3, wood: 3} : {}});
      plan = business.buildV5ArgentGenesis(sdk, {templates: t.business, state, deposit: role === 'buyer' ? '40000000' : '10000000', fundingUtxos: await funds(60000000n), feeRate}); kind = 'business';
    } else if (step === 'purchase-buy' || step === 'pip-pay') {
      const prefix = step.split('-')[0], left = await this.liveCell(prefix + '-buyer'), right = await this.liveCell(prefix + '-seller');
      plan = business.buildV5ArgentTrade(sdk, {templates: t.business, left, right, deltas: step === 'purchase-buy' ? {coin: -6000000, tools: 1} : {coin: -6000000, wood: 1}, leftDelegated: step === 'pip-pay', fundingUtxos: await funds(), feeRate}); kind = 'business';
    } else if (step === 'pip-permit' || step === 'pip-revoke') {
      const cell = await this.liveCell('pip-buyer');
      plan = business.buildV5ArgentConfigure(sdk, {templates: t.business, cell, policy: {operator: step === 'pip-permit' ? owners[2] : owners[0], allow_coin: step === 'pip-permit' ? 6000000 : 0, min_receive: step === 'pip-permit' ? 1 : 0}, fundingUtxos: await funds(), feeRate}); kind = 'business';
    } else if (step === 'ring-create') {
      const world = await this.world('ring'), states = [{crops: 3}, {tools: 1}, {ore: 2}].map((resources, role) => ring.v5RingInitialState({owner: owners[role], issuer: owners[0], world, role, resources}));
      plan = ring.buildV5RingGenesis(sdk, {templates: t.advanced.ring, states, deposit: '30000000', fundingUtxos: await funds(100000000n), feeRate, maxFee: '20000000'}); kind = 'ring';
    } else if (step === 'ring-settle') {
      plan = ring.buildV5RingSwap(sdk, {templates: t.advanced.ring, cells: await Promise.all([0,1,2].map(i => this.liveCell('ring-' + i))), fundingUtxos: await funds(), feeRate, maxFee: '20000000'}); kind = 'ring';
    } else if (step === 'greenhouse-create') {
      const worldId = await this.world('greenhouse'), states = owners.map((owner, member) => ({worldId, owner, beneficiary: owners[0], member, ready: false, maxFee: 3000000}));
      plan = buildV4Genesis(sdk, {kind: 'launch', templates: {launch: t.launch}, states, cellAmounts: ['30000000','30000000','30000000'], fundingUtxos: await funds(100000000n), changeAddress: addresses[0], feeRate}); kind = 'launch';
    } else if (step.startsWith('greenhouse-ready')) {
      const cell = await this.liveCell('greenhouse-' + step.at(-1));
      if (cell.state.ready) throw Error('This neighbor already approved the contribution.');
      plan = buildV4Transition(sdk, {kind: 'launch', templates: {launch: t.launch}, cells: [cell], states: [{...cell.state, ready: true}], operation: 0, feeRate}); kind = 'launch';
    } else if (step.startsWith('greenhouse-withdraw')) {
      const cell = await this.liveCell('greenhouse-' + step.at(-1));
      plan = buildV4Transition(sdk, {kind: 'launch', templates: {launch: t.launch}, cells: [cell], states: [], operation: 2, payments: [{address: addresses[Number(step.at(-1))], amount: cell.utxo.amount}], feeRate}); kind = 'launch';
    } else if (step === 'greenhouse-settle') {
      const cells = await Promise.all([0,1,2].map(i => this.liveCell('greenhouse-' + i)));
      if (cells.some(cell => !cell.state.ready)) throw Error('All three neighbors must approve before their coins can move together.');
      plan = buildV4Transition(sdk, {kind: 'launch', templates: {launch: t.launch}, cells, states: [], operation: 1, payments: [{address: addresses[0], amount: cells.reduce((sum, cell) => sum + cell.utxo.amount, 0n)}], feeRate}); kind = 'launch';
    } else if (step === 'courier-fund') {
      recipients = [{recipient: owners[2], amount: '40000000'}, {recipient: owners[1], amount: '20000000'}];
      plan = buildPublicPayment(sdk, {fundingUtxos: await funds(80000000n), owner: owners[0], recipients, feeRate}); kind = 'native';
    } else if (step === 'courier-open' || step === 'refund-open') {
      const world = await this.world('courier'), state = delivery.v5DeliveryInitialState({customer: owners[2], courier: owners[1], recipient: owners[0], world, deliveryId: await digest(world + step), paymentSompi: '20000000', bondSompi: '10000000', refundAgeDaa: 100});
      plan = delivery.buildV5DeliveryOpen(sdk, {artifact: t.advanced.delivery, state, customerUtxos: await this.wallet.funding(2, 20000000n), courierUtxos: await this.wallet.funding(1, 10000000n), fundingUtxos: await funds(), feeRate, maxFee: '20000000'}); kind = 'delivery';
    } else if (step === 'courier-deliver') {
      const cell = await this.liveCell('courier-open'), hash = await delivery.v5DeliveryReceiptDigest({state: cell.state, covenantId: cell.covenantId});
      const receipt = sdk.signScriptHash(hash, this.wallet.keys[0]).slice(2, -2);
      plan = delivery.buildV5DeliveryRelease(sdk, {artifact: t.advanced.delivery, cell, receipt, fundingUtxos: await funds(), feeRate, maxFee: '20000000'}); kind = 'delivery';
    } else if (step === 'refund-claim') {
      const cell = await this.liveCell('refund-open');
      if (BigInt(info.virtualDaaScore ?? 0) < BigInt(cell.utxo.blockDaaScore || 0) + BigInt(cell.state.refund_age)) throw Error('The refund is not eligible yet. The contract counts network progress; it does not use the animation timer.');
      plan = delivery.buildV5DeliveryRefund(sdk, {artifact: t.advanced.delivery, cell, fundingUtxos: await funds(), feeRate, maxFee: '20000000'}); kind = 'delivery';
    } else if (step === 'proof-open') {
      const nonce = (await this.world('proof')).slice(0, 32), state = proof.initialV6ProofState({owner: owners[1], feeSponsor: owners[0], taskNonce: nonce});
      plan = proof.buildV6ProofOpen(sdk, {template: t.proof, state, fundingUtxos: await funds(), feeRate}); kind = 'proof';
    } else if (step === 'proof-redeem') {
      const cell = await this.liveCell('proof-open');
      if (!this.proofBundle) throw Error('Generate the proof for this saved task before reviewing its payout.');
      plan = proof.buildV6ProofRedeem(sdk, {template: t.proof, cell, proofBundle: this.proofBundle, fundingUtxos: await funds(), feeRate}); kind = 'proof';
    }
    if (!plan) throw Error('This transaction is not available.');
    const mass = this.mass(plan, kind, feeRate);
    if (!mass.withinBlockLimits || BigInt(plan.fee) > 20000000n) throw Error('This example exceeds its network fee or size limit. No transaction was signed.');
    this.review = {step, title, chapter: stepChapter(step), plan, kind, recipients, createdAt: Date.now(), shape: txShape(plan.transaction)};
    this.message = 'Review the amounts and rule. No transaction has been signed or sent.'; this.notify(); return this.review;
  }
  mass(plan, kind, feeRate) {
    if (kind === 'proof') return proof.v6ProofMass(plan, {feeRate});
    if (['business','ring','delivery'].includes(kind)) return business.v5ArgentMass(plan, {feeRate});
    return publicTransactionMass(plan.transaction, {feeRate});
  }
  cancelReview() {if (this.busy) return; this.review = null; this.message = 'Review cancelled. No transaction was signed or sent.'; this.notify();}
  async freshInputs(plan) {
    const sdk = this.wallet.sdk, addresses = [...new Set(plan.transaction.inputs.map(input => sdk.addressFromScriptPublicKey(input.utxo.entry.scriptPublicKey, V6_NETWORK).toString()))];
    const {entries} = await v6Call(this.wallet.rpc.getUtxosByAddresses(addresses));
    if (plan.transaction.inputs.some(input => !entries.some(entry => v6Outpoint(entry) === v6Outpoint(input) && BigInt(entry.amount) === BigInt(input.utxo.amount) && entry.entry.scriptPublicKey.version === input.utxo.entry.scriptPublicKey.version && entry.entry.scriptPublicKey.script === input.utxo.entry.scriptPublicKey.script && entryId(entry) === entryId(input.utxo)))) throw Error('An input changed after this review. No transaction was signed. Prepare a fresh review.');
  }
  async confirm() {
    const review = this.review;
    if (!review || this.pending) throw Error('There is no current transaction to approve.');
    if (Date.now() - review.createdAt > this.reviewDuration || txShape(review.plan.transaction) !== review.shape) {this.review = null; throw Error('This review expired or changed. Prepare it again before signing.');}
    this.assertStep(review.step);
    const info = await this.wallet.nodeInfo(true);
    if (BigInt(this.mass(review.plan, review.kind, info.feeRate).minimumFee) > BigInt(review.plan.fee)) {this.review = null; throw Error('The required fee increased. Review the updated transaction before signing.');}
    await this.freshInputs(review.plan);
    if (Date.now() - review.createdAt > this.reviewDuration) {this.review = null; throw Error('This review expired during the network check. No transaction was signed.');}
    const {sink} = await v6Call(this.wallet.rpc.getSink());
    const sign = this.wallet.sign.bind(this.wallet), plan = review.plan;
    if (review.kind === 'proof') await proof.signV6ProofPlan(plan, sign);
    else if (['business','ring','delivery'].includes(review.kind)) await business.signV5ArgentPlan(plan, sign);
    else await signPublicAssetPlan(plan, sign);
    const journal = review.kind === 'proof' ? proof.v6ProofJournal(plan) : review.kind === 'delivery' ? delivery.v5DeliveryJournal(plan) : review.kind === 'ring' ? ring.v5RingJournal(plan) : review.kind === 'business' ? business.v5ArgentJournal(plan) : review.kind === 'launch' ? publicV4Journal(plan) : {version: 1, network: V6_NETWORK, kind: NATIVE_KIND, id: plan.transaction.id, transaction: plan.transaction.serializeToSafeJSON(), fee: String(plan.fee), feeRate: plan.mass.feeRate, owner: this.wallet.owners[0], recipients: review.recipients};
    this.recover(journal);
    const record = {id: journal.id, journal, fee:String(plan.fee), step: review.step, chapter: review.chapter, title: review.title, checkpoint: sink, createdAt: Date.now(), submitted: false, acceptingBlock: null, phase: 'saved'};
    this.validateRecord(record); this.records.push(record); this.review = null;
    // This storage write is the boundary: no signed bytes reach the network
    // unless this exact recoverable record has been persisted successfully.
    try {await this.wallet.save();} catch (error) {record.storageUncertain = true; throw Error('The browser could not confirm saving this transaction. It was not sent. Keep this tab open and save a recovery file.');}
    this.message = `Sending “${record.title}” to Testnet-10…`; this.notify();
    try {
      const result = await v6Call(this.wallet.rpc.submitTransaction({transaction: plan.transaction, allowOrphan: false}), 20000);
      if (result.transactionId !== record.id) throw Error('The node returned a different transaction identifier.');
      record.submitted = true; record.phase = 'submitted'; await this.wallet.save();
    } catch (error) {record.phase = 'uncertain'; record.error = 'The submission reply was interrupted. The exact signed transaction is retained.'; await this.wallet.save(); this.error = record.error;}
    this.notify(); await this.check(); return record;
  }
  async check() {
    if (this.checking || !this.wallet.ready) return;
    this.checking = true;
    try {
      await this.load(); await this.wallet.connect();
      if (this.data.faucet?.id && !this.data.faucet.acceptingBlock) await this.wallet.observeFaucet();
      for (let scanned = 0; scanned < 3; scanned++) {
        const record = this.pending; if (!record) break;
        this.validateRecord(record); this.recover(record.journal);
        const restoring = record.acceptanceUnverified === true;
        const observed = await observePublicAcceptance(this.wallet.rpc, {...record, transactionId: record.id}, {call: v6Call});
        Object.assign(record, observed);
        if (record.acceptingBlock) {
          record.acceptanceUnverified = false; record.phase = 'accepted'; record.error = null; record.acceptedAt = Date.now(); this.data.completed = this.completed;
          await this.wallet.save(); this.error = null; this.message = `Accepted: ${record.title}.`;
          if (!restoring) this.onAccepted(record);
        } else {record.checkedAt = Date.now(); await this.wallet.save();break;}
      }
      await this.wallet.refresh();
    } finally {this.checking = false; this.notify();}
  }
  async retry() {
    const record = this.pending; if (!record) return;
    // Checking may discover acceptance, so explicit retry never blindly
    // sends an already observed transaction, and never produces a new ID.
    await this.check(); if (!this.pending || this.pending.id !== record.id) return;
    const plan = this.recover(record.journal);
    await this.wallet.save();
    const response = await v6Call(this.wallet.rpc.submitTransaction({transaction: plan.transaction, allowOrphan: false}), 20000);
    if (response.transactionId !== record.id) throw Error('The node returned an unexpected transaction identifier.');
    record.submitted = true; record.phase = 'submitted'; await this.wallet.save(); await this.check();
  }
  async generateProof(allocation = 6, rate = 7) {
    await this.load();
    if (!Number.isInteger(allocation) || !Number.isInteger(rate) || allocation < 1 || rate < 1 || allocation > 15 || rate > 15 || allocation * rate !== 42 || allocation + rate !== 13) throw Error('These settings do not meet the task: multiply to 42 and add to 13. No transaction was signed or sent.');
    const saved = this.cells().get('proof-open'); if (!saved) throw Error('Reserve the task’s reward first.');
    if (!this.data.assistance) {this.data.assistance = {id: crypto.randomUUID(), capability: [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, '0')).join('')}; await this.wallet.save();}
    const auth = this.data.assistance;
    const call = async (path, extra) => {
      const response = await fetch('/api/v6/' + path, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...auth, ...extra}), signal: AbortSignal.timeout(60000)});
      const result = await response.json(); if (!response.ok) throw Error(result.error || 'The proof helper is temporarily unavailable. Your reward remains in its contract.'); return result;
    };
    await call('start', {mode: 'browser-assistance'});
    const result = await call('proof', {owner: saved.state.owner, taskNonce: saved.state.taskNonce, allocation, rate});
    if (!result.proof || result.proof.owner !== saved.state.owner || result.proof.taskNonce !== saved.state.taskNonce) throw Error('The proof helper returned a proof for a different task.');
    this.proofBundle = result.proof; this.message = 'Proof generated for these settings and this reward recipient. Review the payout next.'; this.notify();
  }
}
