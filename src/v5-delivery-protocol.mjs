// Network-free Testnet courier escrow. The recipient is an explicitly trusted game oracle.
// The contract fixes both payouts; external native inputs pay network fees separately.
import {bytesHex, hexBytes} from './public-contracts.mjs';
import {instantiateV5Argent, v5ArgentUnlock, v5ArgentMass, validateV5ArgentPlan, signV5ArgentPlan} from './v5-argent-protocol.mjs';

export const V5_DELIVERY_ARTIFACT_ID = 'b3e370219706d0e0af2f38c2b7ec8a1ca90b6ddc48536982af7063a362e63e17';
export const V5_DELIVERY_RECEIPT_DOMAIN = 'V5DeliveryReceipt:testnet-10:v1';
export const V5_DELIVERY_REFUND_AGE = 100;
const NETWORK = 'testnet-10', REVISION = 'd08e52dd1e18c9f7e9a2dc482048c2db31d25611';
const PLACEHOLDER = '00'.repeat(64) + '01';
const clone = value => JSON.parse(JSON.stringify(value));
const hex = (value, length = 32) => {
  if (typeof value !== 'string' || !new RegExp(`^[0-9a-f]{${length * 2}}$`, 'i').test(value)) throw Error('Invalid delivery hex');
  return value.toLowerCase();
};
const integer = (value, min = 1, max = 1000000000000) => {
  const n = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  if (!Number.isSafeInteger(n) || n < min || n > max) throw Error('Invalid delivery amount or age');
  return n;
};
const fixed = value => {
  let n = BigInt(integer(value));
  return Uint8Array.from({length:8}, () => { const byte = Number(n & 255n); n >>= 8n; return byte; });
};
const covenantId = utxo => utxo.entry?.covenantId?.toString();
const nativeOwner = utxo => {
  if (covenantId(utxo) || utxo.entry?.scriptPublicKey.version !== 0 || !/^20[0-9a-f]{64}ac$/i.test(utxo.entry.scriptPublicKey.script)) throw Error('Delivery funding requires native P2PK inputs');
  return utxo.entry.scriptPublicKey.script.slice(2, 66).toLowerCase();
};
const input = (utxo, budget = 16, sequence = 0n) => ({previousOutpoint:utxo.outpoint, utxo, signatureScript:'', sequence, sigOpCount:0, computeBudget:budget});
const payment = (sdk, owner, value) => ({value, scriptPublicKey:sdk.payToAddressScript(new sdk.PublicKey('02' + owner).toAddress(NETWORK))});
const shape = tx => {
  const value = JSON.parse(tx.serializeToSafeJSON());
  delete value.id;
  value.inputs.forEach(i => delete i.signatureScript);
  return JSON.stringify(value);
};
const metadata = p => JSON.stringify({operation:p.operation, states:p.states, inputStates:p.inputStates, calls:p.calls.map(c => c ? {script:c.asset.script, entry:c.entry, args:c.args} : null), signers:p.signers});

export function v5DeliveryInitialState({customer, courier, recipient, world, deliveryId, paymentSompi, bondSompi, refundAgeDaa = V5_DELIVERY_REFUND_AGE}) {
  const state = {customer:hex(customer), courier:hex(courier), recipient:hex(recipient), world:hex(world), delivery_id:hex(deliveryId), payment:integer(paymentSompi), bond:integer(bondSompi), refund_age:integer(refundAgeDaa, 1, 4294967295)};
  if (state.customer === state.courier || state.recipient === state.courier) throw Error('Delivery customer and receipt signer must differ from courier');
  return state;
}
function checkedState(state) {
  if (!state || Object.keys(state).sort().join(',') !== 'bond,courier,customer,delivery_id,payment,recipient,refund_age,world') throw Error('Delivery state fields mismatch');
  return v5DeliveryInitialState({...state, deliveryId:state.delivery_id, paymentSompi:state.payment, bondSompi:state.bond, refundAgeDaa:state.refund_age});
}
function templates(artifact) {
  if (!artifact || artifact.id !== V5_DELIVERY_ARTIFACT_ID || artifact.app !== 'DeliveryApp' || !artifact.sil_abi?.contracts?.Delivery) throw Error('Unsupported delivery artifact');
  return {version:1, network:NETWORK, compiler:{name:'argentc', revision:REVISION}, apps:{delivery:{contractName:'Delivery', computeBudget:100, artifact:artifact.sil_abi}}};
}
export function instantiateV5Delivery(sdk, artifact, state) {
  return instantiateV5Argent(sdk, templates(artifact), checkedState(state), 'delivery');
}
export async function v5DeliveryReceiptDigest({state, covenantId: id}, crypto = globalThis.crypto) {
  const s = checkedState(state);
  const domain = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(V5_DELIVERY_RECEIPT_DOMAIN)));
  const message = Uint8Array.from([...domain, ...hexBytes(s.world + hex(id) + s.delivery_id + s.customer + s.courier + s.recipient), ...fixed(s.payment), ...fixed(s.bond), ...fixed(s.refund_age)]);
  return bytesHex(new Uint8Array(await crypto.subtle.digest('SHA-256', message)));
}
function nativeGroup(sdk, utxos, amount, owner) {
  if (!Array.isArray(utxos) || !utxos.length || utxos.length > 8) throw Error('Delivery native input group required');
  const owners = utxos.map(nativeOwner);
  if (owners.some(o => o !== (owner || owners[0]))) throw Error('Delivery input owner mismatch');
  const change = utxos.reduce((n, u) => n + u.amount, 0n) - amount;
  if (change < 0n) throw Error('Insufficient delivery contribution');
  return {inputs:utxos.map(u => input(u)), change:change ? [payment(sdk, owners[0], change)] : [], calls:utxos.map(() => null), signers:owners.map(o => ({owners:[o]}))};
}
function txplan(sdk, operation, inputs, outputs, fee, meta) {
  if (inputs.length > 10 || new Set(inputs.map(i => i.previousOutpoint.transactionId + ':' + i.previousOutpoint.index)).size !== inputs.length || outputs.some(o => o.value <= 0n)) throw Error('Delivery input/output shape');
  if (inputs.reduce((n, i) => n + i.utxo.amount, 0n) - outputs.reduce((n, o) => n + o.value, 0n) !== fee) throw Error('Delivery value conservation');
  return {network:NETWORK, kind:'v5-delivery', operation, fee:String(fee), transaction:new sdk.Transaction({version:1, inputs, outputs, lockTime:0n, subnetworkId:'00'.repeat(20), gas:0n, payload:''}), ...meta};
}
function build(sdk, options, construct) {
  let fee = options.fee === undefined ? 1n : BigInt(options.fee);
  for (let attempt = 0; attempt < 8; attempt++) {
    const p = construct(fee), mass = v5ArgentMass(p, {feeRate:options.feeRate || 100});
    if (options.fee === undefined && fee !== BigInt(mass.minimumFee)) { fee = BigInt(mass.minimumFee); continue; }
    if (fee <= 0n || fee > BigInt(options.maxFee ?? 20000000) || fee < BigInt(mass.minimumFee) || !mass.withinBlockLimits) throw Error('Delivery fee or mass limit');
    p.mass = mass;
    p.transaction.storageMass = BigInt(mass.storageMass);
    p.signatures = p.signers.map(s => s.owners.map(() => null));
    Object.defineProperties(p, {sdk:{value:sdk}, unsignedShape:{value:shape(p.transaction)}, reviewedMetadata:{value:metadata(p)}});
    return p;
  }
  throw Error('Delivery fee did not converge');
}
export function buildV5DeliveryOpen(sdk, options) {
  const state = checkedState(options.state), asset = instantiateV5Delivery(sdk, options.artifact, state);
  return build(sdk, options, fee => {
    const customer = nativeGroup(sdk, options.customerUtxos, BigInt(state.payment), state.customer);
    const courier = nativeGroup(sdk, options.courierUtxos, BigInt(state.bond), state.courier);
    const funding = nativeGroup(sdk, options.fundingUtxos, fee);
    const p = txplan(sdk, 'delivery-open', [...customer.inputs, ...courier.inputs, ...funding.inputs], [{value:BigInt(state.payment + state.bond), scriptPublicKey:sdk.payToScriptHashScript(asset.script)}, ...customer.change, ...courier.change, ...funding.change], fee, {states:[state], inputStates:[], calls:[...customer.calls, ...courier.calls, ...funding.calls], signers:[...customer.signers, ...courier.signers, ...funding.signers]});
    Object.defineProperty(p, 'openingCounts', {value:[customer.inputs.length, courier.inputs.length]});
    p.transaction.populateGenesisCovenants([{authorizingInput:0, outputs:[0]}]);
    p.covenantId = p.transaction.outputs[0].covenant.covenantId.toString();
    return p;
  });
}
function cell(sdk, artifact, value) {
  const asset = instantiateV5Delivery(sdk, artifact, value.state), utxo = value.utxo;
  if (!covenantId(utxo) || utxo.entry?.scriptPublicKey.version !== 0 || utxo.entry.scriptPublicKey.script !== sdk.payToScriptHashScript(asset.script).script || utxo.amount !== BigInt(asset.state.payment + asset.state.bond)) throw Error('Delivery cell template or value mismatch');
  return {asset, utxo};
}
function close(sdk, options, release) {
  const c = cell(sdk, options.artifact, options.cell), state = c.asset.state, recipient = release ? state.courier : state.customer;
  const call = {asset:c.asset, entry:release ? 'release' : 'refund', args:release ? [hex(options.receipt, 64), null] : [null]};
  return build(sdk, options, fee => {
    const funding = nativeGroup(sdk, options.fundingUtxos, fee);
    return txplan(sdk, release ? 'delivery-release' : 'delivery-refund', [input(c.utxo, c.asset.computeBudget, release ? 0n : BigInt(state.refund_age)), ...funding.inputs], [payment(sdk, recipient, c.utxo.amount), ...funding.change], fee, {states:[], inputStates:[state], calls:[call, ...funding.calls], signers:[{owners:[recipient]}, ...funding.signers]});
  });
}
export const buildV5DeliveryRelease = (sdk, options) => close(sdk, options, true);
export const buildV5DeliveryRefund = (sdk, options) => close(sdk, options, false);
export const signV5DeliveryPlan = signV5ArgentPlan;
export const validateV5DeliveryPlan = validateV5ArgentPlan;
export const v5DeliveryUnlock = v5ArgentUnlock;
export const v5DeliveryMass = v5ArgentMass;

export function v5DeliveryWirePlan(p) {
  validateV5DeliveryPlan(p);
  const saved = p.transaction.inputs.map(i => i.signatureScript);
  try {
    p.transaction.inputs.forEach((i, n) => i.signatureScript = v5DeliveryUnlock(p.calls[n], p.signatures[n]));
    p.transaction.finalize();
    return clone({version:1, network:NETWORK, kind:'v5-delivery', operation:p.operation, id:p.transaction.id, transaction:p.transaction.serializeToSafeJSON(), fee:p.fee, feeRate:p.mass.feeRate, states:p.states, inputStates:p.inputStates, calls:p.calls.map(c => c ? {entry:c.entry, args:c.args} : null), signers:p.signers, signatures:p.signatures, openingCounts:p.openingCounts || null});
  } finally {
    p.transaction.inputs.forEach((i, n) => i.signatureScript = saved[n]);
    p.transaction.finalize();
  }
}
export function v5DeliveryJournal(p) {
  if (!validateV5DeliveryPlan(p).complete) throw Error('Delivery requires complete signatures before journaling');
  return v5DeliveryWirePlan(p);
}
// Rebuild from known artifact and independently expected participants before accepting remote signatures.
export function deriveV5DeliveryPlan(sdk, {artifact, journal:j, expectedState}) {
  if (!j || j.version !== 1 || j.network !== NETWORK || j.kind !== 'v5-delivery' || typeof j.transaction !== 'string' || j.transaction.length > 300000 || Object.keys(j).some(k => !['version','network','kind','operation','id','transaction','fee','feeRate','states','inputStates','calls','signers','signatures','openingCounts'].includes(k))) throw Error('Invalid delivery wire plan');
  const tx = sdk.Transaction.deserializeFromSafeJSON(j.transaction);
  if (!tx.inputs.length || tx.inputs.length > 10 || !tx.outputs.length || tx.outputs.length > 4) throw Error('Delivery wire shape');
  const fee = tx.inputs.reduce((n, i) => n + i.utxo.amount, 0n) - tx.outputs.reduce((n, o) => n + o.value, 0n);
  if (String(fee) !== j.fee) throw Error('Delivery wire fee');
  if (!expectedState) throw Error('Delivery expected state required');
  const state = checkedState(expectedState);
  const opts = {artifact, fee, feeRate:j.feeRate};
  let p;
  if (j.operation === 'delivery-open') {
    if (j.inputStates?.length !== 0 || j.states?.length !== 1 || JSON.stringify(checkedState(j.states[0])) !== JSON.stringify(state) || !Array.isArray(j.openingCounts) || j.openingCounts.length !== 2 || j.openingCounts.some(n => !Number.isInteger(n) || n < 1 || n > 8)) throw Error('Delivery opening state or groups');
    const [a, b] = j.openingCounts;
    p = buildV5DeliveryOpen(sdk, {...opts, state, customerUtxos:tx.inputs.slice(0, a).map(i => i.utxo), courierUtxos:tx.inputs.slice(a, a + b).map(i => i.utxo), fundingUtxos:tx.inputs.slice(a + b).map(i => i.utxo)});
  } else if (['delivery-release','delivery-refund'].includes(j.operation)) {
    if (j.states?.length !== 0 || j.inputStates?.length !== 1 || JSON.stringify(checkedState(j.inputStates[0])) !== JSON.stringify(state) || j.openingCounts !== null) throw Error('Delivery closing state');
    const options = {...opts, cell:{state, utxo:tx.inputs[0].utxo}, fundingUtxos:tx.inputs.slice(1).map(i => i.utxo)};
    p = j.operation === 'delivery-release' ? buildV5DeliveryRelease(sdk, {...options, receipt:j.calls?.[0]?.args?.[0]}) : buildV5DeliveryRefund(sdk, options);
  } else throw Error('Unsupported delivery operation');
  if (shape(p.transaction) !== shape(tx) || JSON.stringify(p.states) !== JSON.stringify(j.states) || JSON.stringify(p.inputStates) !== JSON.stringify(j.inputStates) || JSON.stringify(p.signers) !== JSON.stringify(j.signers) || JSON.stringify(p.calls.map(c => c ? {entry:c.entry, args:c.args} : null)) !== JSON.stringify(j.calls)) throw Error('Delivery wire differs from rebuilt policy');
  if (!Array.isArray(j.signatures) || j.signatures.length !== p.signatures.length) throw Error('Delivery wire signatures');
  j.signatures.forEach((signatures, i) => {
    if (!Array.isArray(signatures) || signatures.length !== p.signatures[i].length) throw Error('Delivery wire signer shape');
    signatures.forEach((signature, n) => {
      if (signature !== null && (hex(signature, 65) === PLACEHOLDER || !signature.endsWith('01'))) throw Error('Delivery signature placeholder or sighash');
      p.signatures[i][n] = signature;
    });
    p.transaction.inputs[i].signatureScript = tx.inputs[i].signatureScript;
  });
  validateV5DeliveryPlan(p);
  p.transaction.finalize();
  if (p.transaction.id !== j.id) throw Error('Delivery wire transaction ID');
  return p;
}
