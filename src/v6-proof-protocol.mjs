// Server-only prover adapter; transaction construction and signing live in the browser-safe core.
import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {hexBytes} from './public-contracts.mjs';
import {
  V6_PROOF_TASK_SCORE, V6_PROOF_REWARD_UNITS, V6_PROOF_PROVER_TIMEOUT_MS,
  V6_PROOF_CIRCUIT, V6_PROOF_PUBLIC_INPUT_ORDER, ownerHalves, taskNonce128,
  v6ProofHexValue as asHex, v6ProofBytes as proofHex,
  v6ProofPublicInputValues as publicInputValues, v6ProofEqualJSON as equalJSON,
} from './v6-proof-core.mjs';

export {
  V6_PROOF_NETWORK,
  V6_PROOF_KIND,
  V6_PROOF_CONTRACT,
  V6_PROOF_PRINCIPAL,
  V6_PROOF_MAX_FEE,
  V6_PROOF_COMPUTE_BUDGET,
  V6_PROOF_TASK_SCORE,
  V6_PROOF_REWARD_UNITS,
  V6_PROOF_PROVER_TIMEOUT_MS,
  V6_PROOF_PUBLIC_INPUT_ORDER,
  V6_PROOF_CIRCUIT,
  encodeV6Fr128,
  ownerHalves,
  taskNonce128,
  initialV6ProofState,
  instantiateV6Proof,
  instantiate,
  buildV6ProofOpen,
  buildOpen,
  buildV6ProofRedeem,
  buildRedeem,
  v6ProofUnlock,
  v6ProofMass,
  validateV6ProofPlan,
  signV6ProofPlan,
  v6ProofWirePlan,
  v6ProofJournal,
  journal,
  deriveV6ProofPlan,
  derive,
} from './v6-proof-core.mjs';

const asInteger = (value, min, max, label) => {
  const n = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  if (!Number.isSafeInteger(n) || n < min || n > max) throw Error(`Invalid ${label}.`);
  return n;
};

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
