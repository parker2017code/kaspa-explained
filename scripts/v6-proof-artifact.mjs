// Build the checked-in V6 proof template from the pinned compiler and prover.
// The constructor values that are not runtime state are intentionally fixed:
// the score and reward are canonical 32-byte Fr encodings, while identity and
// nonce are patched per funded task by src/v6-proof-protocol.mjs.
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {generateProof} from '../src/v6-proof-protocol.mjs';

const root = resolve(import.meta.dirname, '..');
const silverc = resolve(root, '.cache/upstream/silverc');
const output = resolve(root, 'src/v6-proof-templates.json');
const sdk = createRequire(import.meta.url)('../.cache/upstream/kaspa-wasm32-sdk/nodejs/kaspa');
const key = new sdk.PrivateKey('01'.repeat(32));
const sponsorKey = new sdk.PrivateKey('02'.repeat(32));
const owner = key.toPublicKey().toXOnlyPublicKey().toString();
const feeSponsor = sponsorKey.toPublicKey().toXOnlyPublicKey().toString();
const taskNonce = '0102030405060708090a0b0c0d0e0f10';
const proof = generateProof({owner, taskNonce});
const bytes = value => ({kind: 'bytes', value: [...Buffer.from(value, 'hex')]});
const integer = value => ({kind: 'int', value});
const zero32 = '00'.repeat(32);
const canonical = (value) => value.padEnd(64, '0');
const args = [
  bytes(owner),
  bytes(feeSponsor),
  bytes(proof.verifyingKey),
  bytes(canonical('2a')),
  bytes(canonical('0d')),
  bytes(zero32),
  bytes(zero32),
  bytes(zero32),
  integer(13000000),
  integer(20000000),
];
const argsPath = resolve(tmpdir(), 'v6-proof-constructor-args.json');
const artifactPath = resolve(tmpdir(), 'v6-proof-artifact.json');
await writeFile(argsPath, JSON.stringify(args));
execFileSync(silverc, [resolve(root, 'contracts/public/v6-proof/V6Proof.sil'), '--constructor-args', argsPath, '-o', artifactPath], {stdio: 'inherit'});
const artifact = JSON.parse(await readFile(artifactPath, 'utf8'));
const template = {
  version: 1,
  network: 'testnet-10',
  kind: 'v6-proof',
  contractName: 'V6ProofPayout',
  computeBudget: 1800,
  circuit: {
    id: 'kaspa-explained:v6-bounded-work:v1',
    field: 'BN254 Fr (canonical 32-byte little-endian)',
    taskScore: 42,
    rewardUnits: 13,
    publicInputOrder: ['taskScore', 'rewardUnits', 'recipientLo128', 'recipientHi128', 'taskNonce128'],
    verifyingKey: proof.verifyingKey,
  },
  verifyingKey: proof.verifyingKey,
  artifact,
};
await mkdir(resolve(root, 'src'), {recursive: true});
await writeFile(output, JSON.stringify(template, null, 2) + '\n');
console.log(JSON.stringify({output: 'src/v6-proof-templates.json', verifyingKeyBytes: proof.verifyingKey.length / 2, bytecodeBytes: artifact.contracts.V6ProofPayout.compiled.bytecode.length, stateBytes: artifact.contracts.V6ProofPayout.compiled.state_span.len}));
