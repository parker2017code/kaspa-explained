import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {checkV6Script} from '../server/v6-vm.mjs';
import {
  buildOpen,
  buildRedeem,
  derive,
  generateProof,
  initialV6ProofState,
  journal,
  signV6ProofPlan,
  verifyProof,
} from '../src/v6-proof-protocol.mjs';

const sdk = createRequire(import.meta.url)('../.cache/upstream/kaspa-wasm32-sdk/nodejs/kaspa');
const template = JSON.parse(await readFile(new URL('../src/v6-proof-templates.json', import.meta.url), 'utf8'));
const keys = [new sdk.PrivateKey('01'.repeat(32)), new sdk.PrivateKey('02'.repeat(32))];
const owner = keys[0].toPublicKey().toXOnlyPublicKey().toString();
const feeSponsor = keys[1].toPublicKey().toXOnlyPublicKey().toString();
const taskNonce = '0102030405060708090a0b0c0d0e0f10';

function nativeUtxo(tag, value) {
  return new sdk.UtxoEntries([{
    outpoint: {transactionId: tag.toString(16).padStart(2, '0').repeat(32), index: 0},
    amount: BigInt(value),
    scriptPublicKey: sdk.payToAddressScript(new sdk.Address(keys[1].toAddress('testnet-10').toString())),
    blockDaaScore: 0n,
    isCoinbase: false,
  }]).items[0];
}

function mutateByte(value) {
  const first = Number.parseInt(value.slice(0, 2), 16);
  return `${((first + 1) & 0xff).toString(16).padStart(2, '0')}${value.slice(2)}`;
}

test('the generated Groth16 proof binds every canonical public input', () => {
  const proof = generateProof({owner, taskNonce});
  assert.equal(proof.verified, true);
  assert.equal(verifyProof(proof), true);
  assert.equal(verifyProof({verifyingKey: proof.verifyingKey, proof: proof.proof, publicInputs: proof.publicInputs.values}), true);
  for (const [index, label] of proof.publicInputs.order.entries()) {
    const values = [...proof.publicInputs.values];
    values[index] = mutateByte(values[index]);
    assert.equal(verifyProof({verifyingKey: proof.verifyingKey, proof: proof.proof, publicInputs: {values}}), false, `${label} must bind the proof`);
  }
});

test('a signed V6 open and redeem transaction pass the native Kaspa VM', async () => {
  const proof = generateProof({owner, taskNonce});
  const state = initialV6ProofState({owner, feeSponsor, taskNonce});
  const open = buildOpen(sdk, {template, state, fundingUtxos: [nativeUtxo(1, 100000000n)]});
  await signV6ProofPlan(open, (tx, index) => sdk.createInputSignature(tx, index, keys[1]));
  assert.equal((await checkV6Script(open.transaction)).valid, true, 'proof opening must execute in the native VM');

  const cell = {
    asset: open.contract,
    utxo: new sdk.UtxoEntries([{
      outpoint: {transactionId: open.transaction.id, index: 0},
      amount: open.transaction.outputs[0].value,
      scriptPublicKey: open.transaction.outputs[0].scriptPublicKey,
      blockDaaScore: 0n,
      isCoinbase: false,
      covenant_id: open.transaction.outputs[0].covenant.covenantId,
    }]).items[0],
  };
  const redeem = buildRedeem(sdk, {template, cell, proofBundle: proof, proof: proof.proof, fundingUtxos: [nativeUtxo(2, 30000000n)]});
  await signV6ProofPlan(redeem, (tx, index) => sdk.createInputSignature(tx, index, index === 0 ? keys[0] : keys[1]));
  const check = await checkV6Script(redeem.transaction);
  assert.equal(check.valid, true, `signed Groth16 redemption must execute in the native VM: ${JSON.stringify(check)}`);
  assert.equal(redeem.transaction.outputs[0].value, 13000000n);
  assert.equal(redeem.transaction.outputs.length, 2);
});

test('the native verifier rejects a proof with a changed proof byte', async () => {
  const proof = generateProof({owner, taskNonce});
  const state = initialV6ProofState({owner, feeSponsor, taskNonce});
  const open = buildOpen(sdk, {template, state, fundingUtxos: [nativeUtxo(3, 100000000n)]});
  await signV6ProofPlan(open, (tx, index) => sdk.createInputSignature(tx, index, keys[1]));
  const cell = {
    asset: open.contract,
    utxo: new sdk.UtxoEntries([{
      outpoint: {transactionId: open.transaction.id, index: 0},
      amount: open.transaction.outputs[0].value,
      scriptPublicKey: open.transaction.outputs[0].scriptPublicKey,
      blockDaaScore: 0n,
      isCoinbase: false,
      covenant_id: open.transaction.outputs[0].covenant.covenantId,
    }]).items[0],
  };
  const badProof = `${mutateByte(proof.proof.slice(0, 64))}${proof.proof.slice(64)}`;
  const redeem = buildRedeem(sdk, {template, cell, proof: badProof, fundingUtxos: [nativeUtxo(4, 30000000n)]});
  await signV6ProofPlan(redeem, (tx, index) => sdk.createInputSignature(tx, index, index === 0 ? keys[0] : keys[1]));
  const check = await checkV6Script(redeem.transaction);
  assert.equal(check.valid, false);
  assert.equal(check.failedInput, 0);
});

test('the prover CLI bounds its stdin request before parsing JSON', () => {
  const executable = resolve('scripts/v6-proof-prover/target/debug/v6-proof-prover');
  assert.throws(
    () => execFileSync(executable, [], {input: 'x'.repeat(1_000_001), encoding: 'utf8'}),
    error => error.status === 2 && /too large/.test(error.stderr),
  );
});

test('journal recovery preserves exact signed bytes and rejects state or payout tampering', async () => {
  const proof = generateProof({owner, taskNonce});
  const state = initialV6ProofState({owner, feeSponsor, taskNonce});
  const open = buildOpen(sdk, {template, state, fundingUtxos: [nativeUtxo(5, 100000000n)]});
  await signV6ProofPlan(open, (tx, index) => sdk.createInputSignature(tx, index, keys[1]));
  const openJournal = journal(open);
  const recoveredOpen = derive(sdk, {template, journal: openJournal, expectedState: state});
  assert.equal(recoveredOpen.transaction.id, open.transaction.id);
  assert.equal(recoveredOpen.transaction.serializeToSafeJSON(), open.transaction.serializeToSafeJSON());

  const cell = {
    asset: open.contract,
    utxo: new sdk.UtxoEntries([{
      outpoint: {transactionId: open.transaction.id, index: 0},
      amount: open.transaction.outputs[0].value,
      scriptPublicKey: open.transaction.outputs[0].scriptPublicKey,
      blockDaaScore: 0n,
      isCoinbase: false,
      covenant_id: open.transaction.outputs[0].covenant.covenantId,
    }]).items[0],
  };
  const redeem = buildRedeem(sdk, {template, cell, proofBundle: proof, proof: proof.proof, fundingUtxos: [nativeUtxo(6, 30000000n)]});
  await signV6ProofPlan(redeem, (tx, index) => sdk.createInputSignature(tx, index, index === 0 ? keys[0] : keys[1]));
  const redeemJournal = journal(redeem);
  const recoveredRedeem = derive(sdk, {template, journal: redeemJournal, expectedState: state});
  assert.equal(recoveredRedeem.transaction.id, redeem.transaction.id);
  assert.equal(recoveredRedeem.transaction.serializeToSafeJSON(), redeem.transaction.serializeToSafeJSON());

  const wrongState = {...state, taskNonce: '11111111111111111111111111111111' + '00'.repeat(16)};
  assert.throws(() => derive(sdk, {template, journal: redeemJournal, expectedState: wrongState}), /journal state/);

  const changed = sdk.Transaction.deserializeFromSafeJSON(redeemJournal.transaction);
  changed.outputs[0].value -= 1n;
  changed.finalize();
  const changedFee = BigInt(redeemJournal.fee) + 1n;
  assert.throws(() => derive(sdk, {
    template,
    journal: {...redeemJournal, id: changed.id, transaction: changed.serializeToSafeJSON(), fee: String(changedFee)},
    expectedState: state,
  }), /differs from rebuilt policy/);
});
