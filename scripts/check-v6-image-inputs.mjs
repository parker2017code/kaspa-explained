// Static packaging guard. This does not start a service, read wallet state, or contact Testnet.
import assert from 'node:assert/strict';
import {readFile, lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFile(resolve(root, name), 'utf8');
const docker = await read('Dockerfile.v6');
const rules = (await read('.dockerignore')).split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'));

// Docker's ordered exclusion/re-inclusion rules, for ordinary literal/*/**/? patterns.
// Reject unsupported patterns rather than silently treating a sensitive path as excluded.
function glob(pattern) {
  assert(!/[\[\]\\]/.test(pattern), `Unsupported .dockerignore pattern: ${pattern}`);
  pattern = pattern.replace(/^\/+|\/+$/g, '');
  let source = '';
  for (let i = 0; i < pattern.length; i++) {
    if (pattern.slice(i, i + 3) === '**/') { source += '(?:.*/)?'; i += 2; }
    else if (pattern.slice(i, i + 2) === '**') { source += '.*'; i++; }
    else if (pattern[i] === '*') source += '[^/]*';
    else if (pattern[i] === '?') source += '[^/]';
    else source += pattern[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${source}(?:/.*)?$`);
}
const patterns = rules.map(rule => ({include: rule.startsWith('!'), pattern: glob(rule.replace(/^!/, ''))}));
function excluded(path) {
  let result = false;
  for (const rule of patterns) if (rule.pattern.test(path)) result = !rule.include;
  return result;
}
const privatePaths = [
  '.local/v5-final/state.json', '.cache/upstream/silverscript/target/debug/ke-v6-vm',
  '.git/config', '.wrangler/state/key', '.dev.vars', '.env', '.env.production',
  'node_modules/example/index.js', 'dist/index.html', 'dist-v1/index.html',
  'scripts/v6-proof-prover/target/debug/v6-proof-prover',
];
for (const path of privatePaths) assert(excluded(path), `Build context must exclude ${path}`);

const required = [
  'Dockerfile.v6', 'package.json', 'package-lock.json',
  'scripts/setup-testnet.mjs', 'scripts/setup-v6-vm.mjs', 'scripts/setup-v6-proof.mjs',
  'scripts/build.mjs', 'scripts/build-public-templates.mjs', 'scripts/v6-vm-check.rs',
  'scripts/v6-proof-prover/Cargo.toml', 'scripts/v6-proof-prover/Cargo.lock',
  'scripts/v6-proof-prover/src/lib.rs', 'scripts/v6-proof-prover/src/main.rs',
  'scripts/check-v6-protocol-journey.mjs', 'tests/v6-proof.test.mjs',
  'tests/v6-service.test.mjs', 'tests/v6-network.test.mjs', 'tests/v6-assistance.test.mjs', 'tests/v6-cloud.test.mjs', 'src/v6-proof-core.mjs',
  'src/v6-proof-templates.json', 'src/v5-argent-templates.json', 'src/v5-advanced-templates.json',
  'server/v6-service.mjs', 'server/v6-vm.mjs',
];
for (const path of required) {
  assert(!excluded(path), `Required image source excluded: ${path}`);
  assert((await lstat(resolve(root, path))).isFile(), `Required regular source file missing: ${path}`);
}

const instructions = docker.replace(/\\\r?\n/g, ' ').split(/\r?\n/).filter(line => !line.trim().startsWith('#'));
for (const line of instructions) {
  assert(!/^\s*(ARG|ENV)\s+[^\n]*(FAUCET_KEY|PRIVATE_KEY|HOST_KEY|API_TOKEN|SECRET|PASSWORD)/i.test(line), 'Signer keys and credentials must be runtime secrets, never ARG/ENV image values');
  if (/^\s*(COPY|ADD)\s/i.test(line) && !/--from[=\s]/.test(line)) {
    assert(!/(?:^|[\s"/])(\.local|\.cache|\.env|\.dev\.vars|target)(?:[\s"/]|$)/.test(line), `Host artifact COPY/ADD is forbidden: ${line}`);
  }
}
for (const stage of ['verify', 'runtime']) assert(new RegExp(`^FROM .+ AS ${stage}$`, 'im').test(docker), `Dockerfile must provide ${stage} target`);
const setup = await read('scripts/setup-testnet.mjs');
assert(setup.includes('Checksum mismatch') && /linux-x64/.test(setup) && /[a-f0-9]{64}/.test(setup), 'SDK and Linux compiler downloads must retain checksum verification');
const vmSetup = await read('scripts/setup-v6-vm.mjs');
const nativeInputs = docker + '\n' + vmSetup;
assert(/[a-f0-9]{40}/.test(nativeInputs) && /rev-parse/.test(nativeInputs), 'Native SilverScript source must verify its exact Git revision');
assert(vmSetup.includes('--locked') && (await read('scripts/setup-v6-proof.mjs')).includes('--locked'), 'Native Rust setup must use checked-in Cargo locks');
assert((await read('scripts/v6-proof-prover/Cargo.lock')).includes('checksum ='), 'Proof dependency lock must contain registry checksums');
console.log(JSON.stringify({ok: true, requiredSources: required.length, excludedPrivatePaths: privatePaths.length, scope: 'Static container input checks; no network or signing'}, null, 2));
