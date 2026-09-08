// Testnet-10 only.  This module builds the V6 Observatory's real bounded
// proof transactions.  The verifier artifact fixes the circuit and lesson
// constants; recipient halves and the task nonce live in the funded state so
// each session has its own exact identity binding.
import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {bytesHex, hexBytes, pushPublicData, publicTransactionMass} from './public-contracts.mjs';

export const V6_PROOF_NETWORK = 'testnet-10';
export const V6_PROOF_KIND = 'v6-proof';
export const V6_PROOF_CONTRACT = 'V6ProofPayout';
export const V6_PROOF_PRINCIPAL = 13000000n;
export const V6_PROOF_MAX_FEE = 20000000n;
export const V6_PROOF_COMPUTE_BUDGET = 1800;
export const V6_PROOF_TASK_SCORE = 42;
export const V6_PROOF_REWARD_UNITS = 13;
export const V6_PROOF_PROVER_TIMEOUT_MS = 30000;
export const V6_PROOF_PUBLIC_INPUT_ORDER = Object.freeze([
  'taskScore',
  'rewardUnits',
  'recipientLo128',
  'recipientHi128',
  'taskNonce128',
]);
export const V6_PROOF_CIRCUIT = 'kaspa-explained:v6-bounded-work:v1';
const SIGHASH_ALL = '01';
const PLACEHOLDER_SIGNATURE = '00'.repeat(64) + SIGHASH_ALL;
const ZERO_16 = '00'.repeat(16);
const ZERO_32 = '00'.repeat(32);
const MAX_I64 = 9223372036854775807n;

const clone = value => JSON.parse(JSON.stringify(value));
const asHex = (value, bytes, label = 'hex') => {
  const expected = bytes * 2;
  if (typeof value !== 'string' || value.length !== expected || !/^[0-9a-f]+$/i.test(value)) throw Error(`Invalid ${label}.`);
  return value.toLowerCase();
};
const asAmount = (value, label = 'amount') => {
  let result;
  try { result = BigInt(value); } catch { throw Error(`Invalid ${label}.`); }
  if (result < 0n || result > MAX_I64) throw Error(`Invalid ${label}.`);
  return result;
};
const asInteger = (value, min, max, label) => {
  const n = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  if (!Number.isSafeInteger(n) || n < min || n > max) throw Error(`Invalid ${label}.`);
  return n;
};
const stateInteger = value => {
  let n = asAmount(value, 'state integer');
  const out = new Uint8Array(8);
  for (let index = 0; index < out.length; index++) { out[index] = Number(n & 255n); n >>= 8n; }
  return out;
};
const canonical128 = (value, label = '128-bit value') => {
  let hex;
  if (value instanceof Uint8Array || Array.isArray(value)) {
    const bytes = Uint8Array.from(value);
    if (bytes.length === 16) return bytesHex(bytes) + ZERO_16;
    if (bytes.length === 32) { hex = bytesHex(bytes); }
    else throw Error(`Invalid ${label}.`);
  } else if (typeof value === 'string') {
    if (value.length === 32 && /^[0-9a-f]+$/i.test(value)) return value.toLowerCase() + ZERO_32.slice(32);
    if (value.length === 64 && /^[0-9a-f]+$/i.test(value)) hex = value.toLowerCase();
    else throw Error(`Invalid ${label}.`);
  } else throw Error(`Invalid ${label}.`);
  if (hex.slice(32) !== ZERO_16) throw Error(`${label} must be a canonical 128-bit value.`);
  return hex;
};

// Return the exact 32-byte Fr encoding for a 128-bit half.  The first 16
// bytes retain the key/nonce bytes; the upper half is zero, so no field
// reduction is involved.
export function encodeV6Fr128(value, label = '128-bit value') {
  return canonical128(value, label);
}

export function ownerHalves(owner) {
  const key = asHex(owner, 32, 'owner x-only public key');
  return {recipientLo: key.slice(0, 32) + ZERO_16, recipientHi: key.slice(32) + ZERO_16};
}

export function taskNonce128(taskNonce) {
  return canonical128(taskNonce, 'task nonce');
}

function artifactFor(template) {
  if (!template || template.version !== 1 || template.network !== V6_PROOF_NETWORK || template.kind !== V6_PROOF_KIND) throw Error('Unsupported V6 proof template.');
  if (template.circuit?.id && template.circuit.id !== V6_PROOF_CIRCUIT) throw Error('V6 proof circuit does not match the verifier artifact.');
  const artifact = template.artifact;
  if (template.contractName && template.contractName !== V6_PROOF_CONTRACT) throw Error('V6 proof artifact contract does not match the V6 verifier.');
  if (!artifact?.contracts?.[V6_PROOF_CONTRACT]) throw Error('V6 proof artifact is missing its contract.');
  const contractName = template.contractName || V6_PROOF_CONTRACT;
  const contract = artifact.contracts[contractName];
  if (!contract.runtime_state?.fields || !contract.compiled?.bytecode || !contract.compiled?.state_span) throw Error('V6 proof artifact is incomplete.');
  if (!contract.entries?.verify) throw Error('V6 proof verifier entry is missing.');
  return {artifact, contract, contractName};
}

function stateValue(field, value) {
  if (field.type.kind === 'pubkey') return hexBytes(asHex(value, 32, field.name));
  if (field.type.kind === 'fixed_bytes') return hexBytes(asHex(value, field.type.len, field.name));
  if (field.type.kind === 'int') return stateInteger(value);
  throw Error(`Unsupported V6 state field ${field.name}.`);
}

function nativeOwner(utxo) {
  const entry = utxo?.entry;
  if (!entry || entry.covenantId || entry.scriptPublicKey?.version !== 0 || !/^20[0-9a-f]{64}ac$/i.test(entry.scriptPublicKey.script)) throw Error('V6 fee inputs must be plain native P2PK outputs.');
  return entry.scriptPublicKey.script.slice(2, 66).toLowerCase();
}

function nativeInput(utxo, budget = 16) {
  if (!utxo?.outpoint || !utxo.entry) throw Error('Complete V6 UTXO references are required.');
  return {previousOutpoint: utxo.outpoint, utxo, signatureScript: '', sequence: 0n, sigOpCount: 0, computeBudget: budget};
}

function payment(sdk, owner, value) {
  const key = asHex(owner, 32, 'payment owner');
  return {value: asAmount(value), scriptPublicKey: sdk.payToAddressScript(new sdk.PublicKey('02' + key).toAddress(V6_PROOF_NETWORK))};
}

function unsignedShape(transaction) {
  const json = JSON.parse(transaction.serializeToSafeJSON());
  delete json.id;
  for (const input of json.inputs) delete input.signatureScript;
  return JSON.stringify(json);
}

function planMetadata(plan) {
  return JSON.stringify({
    operation: plan.operation,
    state: plan.contract?.state,
    proof: plan.proof,
    signers: plan.signers,
    inputKinds: plan.inputKinds,
  });
}

function normalizeSignature(value) {
  let signature = typeof value === 'string' ? value.toLowerCase() : '';
  if (/^41[0-9a-f]{130}$/i.test(signature)) signature = signature.slice(2);
  if (!/^[0-9a-f]{130}$/i.test(signature) || !signature.endsWith(SIGHASH_ALL) || signature === PLACEHOLDER_SIGNATURE) throw Error('V6 requires a complete SIGHASH_ALL signature.');
  return signature;
}

function proofHex(value) {
  const proof = typeof value === 'object' && value ? value.proof : value;
  if (typeof proof !== 'string' || proof.length < 2 || proof.length > 20000 || proof.length % 2 || !/^[0-9a-f]+$/i.test(proof)) throw Error('Invalid Groth16 proof bytes.');
  return proof.toLowerCase();
}

function entryUnlock(contract, proof, signature = PLACEHOLDER_SIGNATURE) {
  const entry = contract.entries.verify;
  if (!entry || entry.params.length !== 2 || entry.params[0].type.kind !== 'sig' || entry.params[1].type.kind !== 'bytes') throw Error('Unexpected V6 verifier ABI.');
  return pushPublicData(signature) + pushPublicData(proof) + pushPublicData(entry.dispatch_tag) + pushPublicData(contract.script);
}

function scriptForState(contract, state) {
  const fields = contract.runtime_state.fields;
  if (Object.keys(state).length !== fields.length || fields.some(field => !(field.name in state))) throw Error('V6 proof state fields mismatch.');
  const span = contract.compiled.state_span;
  const code = contract.compiled.bytecode;
  if (!Number.isInteger(span.offset) || !Number.isInteger(span.len) || span.offset < 0 || span.len < 0 || span.offset + span.len > code.length) throw Error('V6 proof state span is invalid.');
  const encoded = fields.map(field => pushPublicData(stateValue(field, state[field.name]), true)).join('');
  if (encoded.length / 2 !== span.len) throw Error('V6 proof state patch changed its fixed-width span.');
  return bytesHex(code.slice(0, span.offset)) + encoded + bytesHex(code.slice(span.offset + span.len));
}

function verifyTemplateConstants(template, proofBundle) {
  const expected = template.verifyingKey || template.proofFixture?.verifyingKey || template.circuit?.verifyingKey;
  if (expected && proofBundle?.verifyingKey && expected.toLowerCase() !== proofBundle.verifyingKey.toLowerCase()) throw Error('Proof uses a different verifier key than the V6 template.');
}

function publicInputValues(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.values)) return value.values;
  return null;
}

export function initialV6ProofState({owner, feeSponsor, taskNonce, maxFee = V6_PROOF_MAX_FEE} = {}) {
  const worker = asHex(owner, 32, 'owner x-only public key');
  const sponsor = asHex(feeSponsor, 32, 'fee sponsor x-only public key');
  if (worker === sponsor) throw Error('V6 worker and fee sponsor must be distinct keys.');
  const halves = ownerHalves(worker);
  return {
    owner: worker,
    feeSponsor: sponsor,
    recipientLo: halves.recipientLo,
    recipientHi: halves.recipientHi,
    taskNonce: taskNonce128(taskNonce),
    principal: String(V6_PROOF_PRINCIPAL),
    maxFee: String(asAmount(maxFee, 'V6 maximum fee')),
  };
}

export function instantiateV6Proof(sdk, template, state) {
  const {artifact, contract, contractName} = artifactFor(template);
  const normalized = {
    owner: asHex(state.owner, 32, 'owner x-only public key'),
    feeSponsor: asHex(state.feeSponsor, 32, 'fee sponsor x-only public key'),
    recipientLo: canonical128(state.recipientLo, 'recipient low half'),
    recipientHi: canonical128(state.recipientHi, 'recipient high half'),
    taskNonce: canonical128(state.taskNonce, 'task nonce'),
    principal: String(asAmount(state.principal, 'V6 principal')),
    maxFee: String(asAmount(state.maxFee, 'V6 maximum fee')),
  };
  if (normalized.owner === normalized.feeSponsor) throw Error('V6 worker and fee sponsor must be distinct keys.');
  const halves = ownerHalves(normalized.owner);
  if (normalized.recipientLo !== halves.recipientLo || normalized.recipientHi !== halves.recipientHi) throw Error('V6 recipient halves must equal the full worker x-only key.');
  if (BigInt(normalized.principal) !== V6_PROOF_PRINCIPAL) throw Error('V6 principal must be exactly 0.13 tKAS.');
  if (BigInt(normalized.maxFee) < 0n || BigInt(normalized.maxFee) > V6_PROOF_MAX_FEE) throw Error('V6 maximum fee exceeds its Testnet-10 cap.');
  new sdk.PublicKey('02' + normalized.owner);
  new sdk.PublicKey('02' + normalized.feeSponsor);
  const script = scriptForState(contract, normalized);
  const lockingScript = sdk.payToScriptHashScript(script).script;
  return {
    artifact,
    template,
    kind: V6_PROOF_KIND,
    contractName,
    state: clone(normalized),
    script,
    lockingScript,
    entries: contract.entries,
    computeBudget: template.computeBudget || V6_PROOF_COMPUTE_BUDGET,
    address: sdk.addressFromScriptPublicKey(sdk.payToScriptHashScript(script), V6_PROOF_NETWORK).toString(),
    prefixLength: contract.compiled.state_span.offset,
    suffixLength: contract.compiled.bytecode.length - contract.compiled.state_span.offset - contract.compiled.state_span.len,
    circuit: template.circuit || {id: V6_PROOF_CIRCUIT, taskScore: V6_PROOF_TASK_SCORE, rewardUnits: V6_PROOF_REWARD_UNITS, publicInputOrder: V6_PROOF_PUBLIC_INPUT_ORDER},
  };
}

export const instantiate = instantiateV6Proof;

function assertNativeGroup(utxos, expectedOwner, label, max = 8) {
  if (!Array.isArray(utxos) || !utxos.length || utxos.length > max) throw Error(`${label} needs one to ${max} native inputs.`);
  const owners = utxos.map(nativeOwner);
  if (expectedOwner && owners.some(owner => owner !== expectedOwner)) throw Error(`${label} owner does not match the covenant fee sponsor.`);
  if (new Set(utxos.map(utxo => `${utxo.outpoint.transactionId}:${utxo.outpoint.index}`)).size !== utxos.length) throw Error(`${label} contains a duplicate input.`);
  return {owners, total: utxos.reduce((sum, utxo) => sum + asAmount(utxo.amount), 0n)};
}

function buildPlan(sdk, options, construct) {
  let fee = options.fee === undefined ? 1000n : asAmount(options.fee, 'V6 fee');
  for (let attempt = 0; attempt < 8; attempt++) {
    const plan = construct(fee);
    const mass = v6ProofMass(plan, {feeRate: options.feeRate ?? 100});
    if (options.fee === undefined && fee !== BigInt(mass.minimumFee)) { fee = BigInt(mass.minimumFee); continue; }
    if (fee <= 0n || fee > BigInt(options.maxFee ?? V6_PROOF_MAX_FEE) || fee < BigInt(mass.minimumFee) || !mass.withinBlockLimits) throw Error('V6 proof fee or mass limit exceeded.');
    plan.fee = String(fee);
    plan.mass = mass;
    plan.transaction.storageMass = BigInt(mass.storageMass);
    plan.signatures = plan.signers.map(() => null);
    Object.defineProperties(plan, {sdk: {value: sdk}, unsignedShape: {value: unsignedShape(plan.transaction)}, reviewedMetadata: {value: planMetadata(plan)}});
    validateV6ProofPlan(plan);
    return plan;
  }
  throw Error('V6 proof fee did not converge.');
}

function makeTransaction(sdk, inputs, outputs) {
  if (inputs.length < 1 || inputs.length > 9 || outputs.length < 1 || outputs.length > 2) throw Error('V6 proof transaction shape.');
  if (outputs.some(output => output.value <= 0n)) throw Error('V6 proof outputs must be positive.');
  if (new Set(inputs.map(input => `${input.previousOutpoint.transactionId}:${input.previousOutpoint.index}`)).size !== inputs.length) throw Error('V6 proof inputs must be distinct.');
  const totalIn = inputs.reduce((sum, input) => sum + asAmount(input.utxo.amount), 0n);
  const totalOut = outputs.reduce((sum, output) => sum + asAmount(output.value), 0n);
  if (totalIn < totalOut) throw Error('V6 proof transaction spends more than its inputs.');
  return new sdk.Transaction({version: 1, inputs, outputs, lockTime: 0n, subnetworkId: '00'.repeat(20), gas: 0n, payload: ''});
}

export function buildV6ProofOpen(sdk, {template, state, fundingUtxos, feeRate = 100, fee, maxFee = V6_PROOF_MAX_FEE} = {}) {
  const contract = instantiateV6Proof(sdk, template, state);
  const sponsor = contract.state.feeSponsor;
  const funding = assertNativeGroup(fundingUtxos, sponsor, 'V6 proof opening');
  const principal = BigInt(contract.state.principal);
  return buildPlan(sdk, {feeRate, fee, maxFee}, networkFee => {
    const change = funding.total - principal - networkFee;
    if (change <= 0n) throw Error('V6 proof opening needs principal plus a treasury change output.');
    const inputs = fundingUtxos.map(utxo => nativeInput(utxo));
    const outputs = [{value: principal, scriptPublicKey: sdk.payToScriptHashScript(contract.script)}, payment(sdk, sponsor, change)];
    const transaction = makeTransaction(sdk, inputs, outputs);
    for (const input of transaction.inputs) input.signatureScript = pushPublicData(PLACEHOLDER_SIGNATURE);
    transaction.populateGenesisCovenants([{authorizingInput: 0, outputs: [0]}]);
    return {
      network: V6_PROOF_NETWORK,
      kind: V6_PROOF_KIND,
      operation: 'proof-open',
      funding: true,
      contract,
      transaction,
      signers: funding.owners,
      inputKinds: funding.owners.map(() => 'native'),
      proof: null,
      states: [contract.state],
      inputStates: [],
      covenantId: transaction.outputs[0].covenant?.covenantId?.toString() || null,
    };
  });
}

export const buildOpen = buildV6ProofOpen;

function proofMatchesContract(contract, proofBundle, proof) {
  const value = proofBundle || {};
  verifyTemplateConstants(contract.template, value);
  if (value.verified === false) throw Error('Only a locally verified proof may be redeemed.');
  if (value.circuit && value.circuit !== V6_PROOF_CIRCUIT) throw Error('Proof circuit does not match the V6 task.');
  const expectedInputs = publicInputValues(value.public_inputs) || publicInputValues(value.publicInputs);
  if (expectedInputs && (!Array.isArray(expectedInputs) || expectedInputs.length !== 5)) throw Error('V6 proof public input arity mismatch.');
  if (expectedInputs) {
    const halves = ownerHalves(contract.state.owner);
    const expected = [
      '2a'.padEnd(64, '0'),
      '0d'.padEnd(64, '0'),
      halves.recipientLo,
      halves.recipientHi,
      contract.state.taskNonce,
    ];
    if (expected.some((item, index) => expectedInputs[index].toLowerCase() !== item)) throw Error('Proof public inputs do not match the funded V6 task.');
  }
  return proofHex(proof ?? value.proof);
}

export function buildV6ProofRedeem(sdk, {template, cell, proofBundle = null, proof, fundingUtxos, feeRate = 100, fee, maxFee = V6_PROOF_MAX_FEE} = {}) {
  if (!cell?.asset || !cell?.utxo) throw Error('V6 proof redeem requires a funded contract cell.');
  const contract = instantiateV6Proof(sdk, template, cell.asset.state || cell.state);
  if (!cell.utxo.entry?.covenantId || cell.utxo.entry.scriptPublicKey.version !== 0 || cell.utxo.entry.scriptPublicKey.script !== contract.lockingScript || BigInt(cell.utxo.amount) !== BigInt(contract.state.principal)) throw Error('V6 proof cell template or value mismatch.');
  const proofBytes = proofMatchesContract(contract, proofBundle, proof);
  const funding = assertNativeGroup(fundingUtxos, contract.state.feeSponsor, 'V6 proof redemption', 8);
  return buildPlan(sdk, {feeRate, fee, maxFee}, networkFee => {
    const change = funding.total - networkFee;
    if (change <= 0n) throw Error('V6 proof redemption needs a positive treasury change output.');
    const inputs = [nativeInput(cell.utxo, contract.computeBudget), ...fundingUtxos.map(utxo => nativeInput(utxo))];
    const outputs = [payment(sdk, contract.state.owner, BigInt(contract.state.principal)), payment(sdk, contract.state.feeSponsor, change)];
    const transaction = makeTransaction(sdk, inputs, outputs);
    const call = {asset: contract, entry: 'verify', args: [null, proofBytes]};
    transaction.inputs[0].signatureScript = entryUnlock(contract, proofBytes, PLACEHOLDER_SIGNATURE);
    for (const input of transaction.inputs.slice(1)) input.signatureScript = pushPublicData(PLACEHOLDER_SIGNATURE);
    return {
      network: V6_PROOF_NETWORK,
      kind: V6_PROOF_KIND,
      operation: 'proof-redeem',
      funding: false,
      contract,
      transaction,
      proof: proofBytes,
      call,
      signers: [contract.state.owner, ...funding.owners],
      inputKinds: ['covenant', ...funding.owners.map(() => 'native')],
      states: [],
      inputStates: [contract.state],
    };
  });
}

export const buildRedeem = buildV6ProofRedeem;

export function v6ProofUnlock(plan, signature = PLACEHOLDER_SIGNATURE) {
  if (!plan?.contract || !plan.proof) throw Error('V6 proof unlock requires a redeem plan.');
  return entryUnlock(plan.contract, plan.proof, signature);
}

export function v6ProofMass(plan, {feeRate = 100} = {}) {
  if (!plan?.transaction) throw Error('V6 proof transaction required.');
  return publicTransactionMass(plan.transaction, {feeRate});
}

function expectedNativeScript(sdk, owner) { return payment(sdk, owner, 1n).scriptPublicKey.script; }

export function validateV6ProofPlan(plan) {
  if (!plan || plan.network !== V6_PROOF_NETWORK || !plan.contract || !plan.transaction) throw Error('Invalid V6 proof plan.');
  const tx = plan.transaction;
  if (tx.version !== 1 || tx.lockTime !== 0n || tx.subnetworkId !== '00'.repeat(20) || tx.gas !== 0n || tx.payload !== '') throw Error('Unexpected V6 proof transaction envelope.');
  if (plan.unsignedShape && unsignedShape(tx) !== plan.unsignedShape) throw Error('V6 proof reviewed transaction changed.');
  if (plan.reviewedMetadata && planMetadata(plan) !== plan.reviewedMetadata) throw Error('V6 proof reviewed metadata changed.');
  const principal = BigInt(plan.contract.state.principal);
  const totalIn = tx.inputs.reduce((sum, input) => sum + asAmount(input.utxo?.amount), 0n);
  const totalOut = tx.outputs.reduce((sum, output) => sum + asAmount(output.value), 0n);
  const actualFee = totalIn - totalOut;
  if (actualFee < 0n || actualFee !== BigInt(plan.fee) || actualFee > BigInt(plan.contract.state.maxFee) || actualFee > V6_PROOF_MAX_FEE) throw Error('V6 proof fee exceeds its reviewed cap.');
  if (plan.operation === 'proof-open') {
    if (!plan.funding || tx.inputs.length < 1 || tx.inputs.length > 8 || tx.outputs.length !== 2 || tx.outputs[0].value !== principal || tx.outputs[0].scriptPublicKey.script !== plan.contract.lockingScript) throw Error('V6 proof opening payout shape changed.');
    const sponsorScript = expectedNativeScript(plan.sdk, plan.contract.state.feeSponsor);
    if (tx.inputs.some(input => input.utxo.entry?.covenantId || input.utxo.entry?.scriptPublicKey?.script !== sponsorScript) || tx.outputs[1].scriptPublicKey.script !== sponsorScript || tx.outputs[1].value <= 0n) throw Error('V6 proof opening change is not treasury-controlled.');
    if (!tx.outputs[0].covenant) throw Error('V6 proof opening must create a covenant output.');
  } else if (plan.operation === 'proof-redeem') {
    if (plan.funding || tx.inputs.length < 2 || tx.inputs.length > 9 || tx.outputs.length !== 2 || tx.inputs[0].utxo.entry?.covenantId === undefined || tx.inputs[0].utxo.entry?.scriptPublicKey?.script !== plan.contract.lockingScript || BigInt(tx.inputs[0].utxo.amount) !== principal) throw Error('V6 proof redemption input shape changed.');
    if (tx.outputs[0].value !== principal || tx.outputs[0].scriptPublicKey.script !== expectedNativeScript(plan.sdk, plan.contract.state.owner)) throw Error('V6 proof redemption worker payout changed.');
    const sponsorScript = expectedNativeScript(plan.sdk, plan.contract.state.feeSponsor);
    if (tx.outputs[1].value <= 0n || tx.outputs[1].scriptPublicKey.script !== sponsorScript || tx.inputs.slice(1).some(input => input.utxo.entry?.covenantId || input.utxo.entry?.scriptPublicKey?.script !== sponsorScript)) throw Error('V6 proof redemption fee route changed.');
    if (plan.proof && tx.inputs[0].signatureScript) {
      const expectedUnlock = v6ProofUnlock(plan, plan.signatures?.[0] || PLACEHOLDER_SIGNATURE);
      if (tx.inputs[0].signatureScript !== expectedUnlock) throw Error('V6 proof invocation changed.');
    }
  } else throw Error('Unsupported V6 proof operation.');
  const mass = v6ProofMass(plan, {feeRate: plan.mass?.feeRate ?? 100});
  if (!mass.withinBlockLimits || actualFee < BigInt(mass.minimumFee) || tx.storageMass !== BigInt(mass.storageMass)) throw Error('V6 proof mass or storage commitment changed.');
  const complete = tx.inputs.every((input, index) => {
    if (plan.operation === 'proof-redeem' && index === 0) return input.signatureScript === v6ProofUnlock(plan, plan.signatures?.[0] || PLACEHOLDER_SIGNATURE) && plan.signatures?.[0] && plan.signatures[0] !== PLACEHOLDER_SIGNATURE;
    return /^41[0-9a-f]{130}$/i.test(input.signatureScript || '') && input.signatureScript.slice(2) !== PLACEHOLDER_SIGNATURE;
  });
  return {complete, fee: String(actualFee), mass};
}

export async function signV6ProofPlan(plan, sign) {
  if (typeof sign !== 'function') throw Error('V6 proof signing callback required.');
  validateV6ProofPlan(plan);
  const shape = unsignedShape(plan.transaction);
  const metadata = planMetadata(plan);
  for (let index = 0; index < plan.signers.length; index++) {
    if (plan.signatures[index] && plan.signatures[index] !== PLACEHOLDER_SIGNATURE) continue;
    const priorScripts = plan.transaction.inputs.map(input => input.signatureScript);
    let raw = await sign(plan.transaction, index, {owner: plan.signers[index], signer: index});
    if (unsignedShape(plan.transaction) !== shape || planMetadata(plan) !== metadata || plan.transaction.inputs.some((input, i) => input.signatureScript !== priorScripts[i])) throw Error('Signer changed the reviewed V6 proof transaction.');
    raw = normalizeSignature(raw);
    plan.signatures[index] = raw;
    plan.transaction.inputs[index].signatureScript = plan.operation === 'proof-redeem' && index === 0 ? v6ProofUnlock(plan, raw) : pushPublicData(raw);
    if (plan.operation === 'proof-redeem' && index === 0) plan.transaction.inputs[0].signatureScript = v6ProofUnlock(plan, raw);
  }
  plan.transaction.finalize();
  validateV6ProofPlan(plan);
  return plan;
}

function wirePlan(plan) {
  validateV6ProofPlan(plan);
  if (!plan.signatures.every(signature => signature && signature !== PLACEHOLDER_SIGNATURE)) throw Error('V6 proof journal requires complete signatures.');
  const saved = plan.transaction.inputs.map(input => input.signatureScript);
  try {
    plan.transaction.inputs.forEach((input, index) => { input.signatureScript = plan.operation === 'proof-redeem' && index === 0 ? v6ProofUnlock(plan, plan.signatures[0]) : pushPublicData(plan.signatures[index]); });
    plan.transaction.finalize();
    return clone({
      version: 1,
      network: V6_PROOF_NETWORK,
      kind: V6_PROOF_KIND,
      operation: plan.operation,
      id: plan.transaction.id,
      transaction: plan.transaction.serializeToSafeJSON(),
      fee: plan.fee,
      feeRate: plan.mass.feeRate,
      state: plan.contract.state,
      proof: plan.proof,
      signers: plan.signers,
      signatures: plan.signatures,
      funding: Boolean(plan.funding),
      covenantId: plan.covenantId || plan.contract.state.covenantId || null,
    });
  } finally {
    plan.transaction.inputs.forEach((input, index) => { input.signatureScript = saved[index]; });
    plan.transaction.finalize();
  }
}

export function v6ProofWirePlan(plan) { return wirePlan(plan); }
export function v6ProofJournal(plan) { return wirePlan(plan); }
export const journal = v6ProofJournal;

function equalJSON(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function validateJournalShape(value) {
  if (!value || value.version !== 1 || value.network !== V6_PROOF_NETWORK || value.kind !== V6_PROOF_KIND || !['proof-open', 'proof-redeem'].includes(value.operation) || typeof value.transaction !== 'string' || value.transaction.length > 400000 || !/^[0-9a-f]{64}$/i.test(value.id)) throw Error('Invalid V6 proof journal.');
  const allowed = ['version', 'network', 'kind', 'operation', 'id', 'transaction', 'fee', 'feeRate', 'state', 'proof', 'signers', 'signatures', 'funding', 'covenantId'];
  if (Object.keys(value).some(key => !allowed.includes(key))) throw Error('Unexpected V6 proof journal field.');
  if (!Array.isArray(value.signers) || !Array.isArray(value.signatures) || value.signers.length !== value.signatures.length) throw Error('V6 proof journal signer shape.');
}

export function deriveV6ProofPlan(sdk, {template, journal: saved, expectedState} = {}) {
  validateJournalShape(saved);
  const state = instantiateV6Proof(sdk, template, expectedState || saved.state).state;
  if (!saved.state || !equalJSON(saved.state, state)) throw Error('V6 proof journal state does not match the expected task.');
  const tx = sdk.Transaction.deserializeFromSafeJSON(saved.transaction);
  tx.finalize();
  if (tx.id !== saved.id || tx.inputs.length < 1 || tx.inputs.length > 9 || tx.outputs.length < 1 || tx.outputs.length > 2) throw Error('V6 proof journal transaction identity or shape mismatch.');
  const fee = tx.inputs.reduce((sum, input) => sum + input.utxo.amount, 0n) - tx.outputs.reduce((sum, output) => sum + output.value, 0n);
  if (String(fee) !== String(saved.fee)) throw Error('V6 proof journal fee mismatch.');
  let plan;
  if (saved.operation === 'proof-open') {
    plan = buildV6ProofOpen(sdk, {template, state, fundingUtxos: tx.inputs.map(input => input.utxo), feeRate: saved.feeRate, fee});
  } else {
    const proof = proofHex(saved.proof);
    plan = buildV6ProofRedeem(sdk, {template, cell: {asset: instantiateV6Proof(sdk, template, state), utxo: tx.inputs[0].utxo}, proof, fundingUtxos: tx.inputs.slice(1).map(input => input.utxo), feeRate: saved.feeRate, fee});
  }
  if (unsignedShape(plan.transaction) !== unsignedShape(tx) || !equalJSON(plan.signers, saved.signers) || plan.proof !== (saved.proof || null)) throw Error('V6 proof journal differs from rebuilt policy.');
  if (saved.signatures.some((signature, index) => typeof signature !== 'string' || normalizeSignature(signature) !== signature.toLowerCase())) throw Error('V6 proof journal contains an invalid signature.');
  plan.signatures = saved.signatures.map(signature => signature.toLowerCase());
  plan.transaction.inputs.forEach((input, index) => { input.signatureScript = tx.inputs[index].signatureScript; });
  validateV6ProofPlan(plan);
  plan.transaction.finalize();
  if (plan.transaction.id !== saved.id) throw Error('V6 proof journal transaction ID changed.');
  plan.signed = true;
  plan.recovery = true;
  return plan;
}

export const derive = deriveV6ProofPlan;

// The server calls this only on the local host.  It invokes the pinned
// arkworks prover and never logs the request, owner key, nonce, or witness.
export function generateProof({owner, taskScore = V6_PROOF_TASK_SCORE, rewardUnits = V6_PROOF_REWARD_UNITS, taskNonce, allocation = 6, rate = 7, executable} = {}) {
  const worker = asHex(owner, 32, 'owner x-only public key');
  if (taskScore !== V6_PROOF_TASK_SCORE || rewardUnits !== V6_PROOF_REWARD_UNITS) throw Error('The V6 lesson uses taskScore=42 and rewardUnits=13.');
  const allocationValue = asInteger(allocation, 1, 15, 'allocation');
  const rateValue = asInteger(rate, 1, 15, 'rate');
  const halves = ownerHalves(worker);
  const nonce = taskNonce128(taskNonce);
  const request = {
    task_score: taskScore,
    reward_units: rewardUnits,
    recipient_lo: Array.from(hexBytes(halves.recipientLo).slice(0, 16)),
    recipient_hi: Array.from(hexBytes(halves.recipientHi).slice(0, 16)),
    task_nonce: Array.from(hexBytes(nonce).slice(0, 16)),
    allocation: allocationValue,
    rate: rateValue,
  };
  const path = executable || process.env.KASPA_V6_PROOF_PROVER || resolve(import.meta.dirname, '../scripts/v6-proof-prover/target/debug/v6-proof-prover');
  if (!existsSync(path)) throw Error('The local V6 proof prover is not built. Run scripts/setup-v6-proof.mjs first.');
  let result;
  try { result = JSON.parse(execFileSync(path, [], {input: JSON.stringify(request), encoding: 'utf8', maxBuffer: 1000000, timeout: V6_PROOF_PROVER_TIMEOUT_MS})); }
  catch (error) { throw Error(`V6 proof generation failed: ${error.message}`); }
  if (result.error) throw Error(result.error);
  if (result.circuit !== V6_PROOF_CIRCUIT || result.verified !== true) throw Error('The local prover did not return a verified V6 proof.');
  const expectedInputs = [
    '2a'.padEnd(64, '0'),
    '0d'.padEnd(64, '0'),
    halves.recipientLo,
    halves.recipientHi,
    nonce,
  ];
  if (!equalJSON(result.public_inputs?.order, V6_PROOF_PUBLIC_INPUT_ORDER) || !equalJSON(result.public_inputs?.values, expectedInputs)) throw Error('The prover returned unexpected V6 public inputs.');
  return {
    ...result,
    verifyingKey: result.verifying_key,
    owner: worker,
    recipientLo: halves.recipientLo,
    recipientHi: halves.recipientHi,
    taskNonce: nonce,
    taskScore,
    rewardUnits,
    allocation: allocationValue,
    rate: rateValue,
    publicInputs: result.public_inputs,
    public_inputs: result.public_inputs,
  };
}

export function verifyProof({verifyingKey, proof, publicInputs, public_inputs, executable} = {}) {
  const values = publicInputValues(publicInputs) || publicInputValues(public_inputs);
  if (!Array.isArray(values) || values.length !== 5) throw Error('V6 verification needs five public inputs.');
  const key = asHex(verifyingKey, 424, 'V6 verifying key');
  const proofValue = proofHex(proof);
  const path = executable || process.env.KASPA_V6_PROOF_PROVER || resolve(import.meta.dirname, '../scripts/v6-proof-prover/target/debug/v6-proof-prover');
  if (!existsSync(path)) throw Error('The local V6 proof prover is not built.');
  const result = JSON.parse(execFileSync(path, [], {input: JSON.stringify({operation: 'verify', verifying_key: key, proof: proofValue, public_inputs: values}), encoding: 'utf8', maxBuffer: 1000000, timeout: V6_PROOF_PROVER_TIMEOUT_MS}));
  if (result.error) throw Error(result.error);
  return Boolean(result.verified);
}
