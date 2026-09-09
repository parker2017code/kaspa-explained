import {execFile} from 'node:child_process';
import {verifyArgentBuild} from './runtime/argent-build.mjs';
import {createRequire} from 'node:module';
import {mkdtemp, readFile, readdir, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';

const run = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const kaspaSdk = require('../.cache/upstream/kaspa-wasm32-sdk/nodejs/kaspa');
const argentRoot = join(root, '.cache/upstream/argent');
const compiler = join(argentRoot, 'target/debug/argentc');
const compilerPin = 'd08e52dd1e18c9f7e9a2dc482048c2db31d25611';

const argentExamples = Object.freeze({
  habitat: {name: 'Two-app habitat', entry: 'contracts/public/argent-habitat/warden.ag', sources: ['contracts/public/argent-habitat/warden.ag', 'contracts/public/argent-habitat/creature.ag']},
  business: {name: 'Business state machine', entry: 'contracts/public/argent-market/business.ag', sources: ['contracts/public/argent-market/business.ag', 'contracts/public/argent-market/capsule.ag']},
  observer: {name: 'Open actor observer', entry: 'contracts/public/argent-market/observer.ag', sources: ['contracts/public/argent-market/observer.ag', 'contracts/public/argent-market/capsule.ag']},
  ring: {name: 'Three-party resource ring', entry: 'contracts/public/argent-market/ring.ag', sources: ['contracts/public/argent-market/ring.ag']},
  delivery: {name: 'Bonded delivery', entry: 'contracts/public/argent-market/delivery.ag', sources: ['contracts/public/argent-market/delivery.ag']}
});

export const argentCatalog = () => Object.entries(argentExamples).map(([id, example]) => ({id, name: example.name, entry: example.entry, compilerPin, boundary: 'Compiles reviewed, checked-in source locally. It does not submit a transaction or establish network acceptance.'}));

async function collect(directory, filename, output = []) {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path, filename, output);
    else if (entry.name === filename) output.push(path);
  }
  return output;
}

export async function inspectArgent(exampleId) {
  const example = argentExamples[exampleId];
  if (!example) throw new Error('Unknown Argent example. Choose an id from the catalog.');
  if (process.env.WORKBENCH_ARGENT_MANIFEST) {
    await verifyArgentBuild(process.env.WORKBENCH_ARGENT_MANIFEST, compiler, compilerPin);
  } else {
    const {stdout: revision} = await run('git', ['-C', argentRoot, 'rev-parse', 'HEAD'], {encoding: 'utf8', timeout: 60_000});
    if (revision.trim() !== compilerPin) throw new Error('Installed Argent compiler does not match the reviewed pin.');
  }
  const output = await mkdtemp(join(tmpdir(), 'kaspa-argent-inspect-'));
  try {
    await run(compiler, ['build', join(root, example.entry), '--out', output], {cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 60_000});
    const silPaths = await collect(output, '.never');
    silPaths.length = 0;
    const walk = async directory => {
      for (const entry of await readdir(directory, {withFileTypes: true})) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) await walk(path);
        else if (entry.name.endsWith('.sil')) silPaths.push(path);
      }
    };
    await walk(output);
    const artifactPaths = await collect(output, 'artifact.json');
    const generatedSilverScript = await Promise.all(silPaths.sort().map(async path => ({path: relative(output, path), code: await readFile(path, 'utf8')})));
    const artifacts = await Promise.all(artifactPaths.sort().map(async path => ({path: relative(output, path), value: JSON.parse(await readFile(path, 'utf8'))})));
    const source = await Promise.all(example.sources.map(async path => ({path, code: await readFile(join(root, path), 'utf8')})));
    if (!generatedSilverScript.length || !artifacts.length) throw new Error('Argent compiler did not emit the required SilverScript and artifact outputs.');
    return {
      ok: true,
      example: {id: exampleId, name: example.name, entry: example.entry},
      compiler: {name: 'argentc', revision: compilerPin},
      source,
      generated: generatedSilverScript.map(file => ({name: file.path, source: file.code})),
      generatedSilverScript,
      artifact: artifacts[0]?.value ?? null,
      artifacts,
      checks: [`Compiler revision equals ${compilerPin}.`, 'Input selected from the reviewed example allowlist.', 'Argent emitted parseable artifact JSON and generated SilverScript.'],
      boundary: 'Local source-to-artifact compilation only. No VM result, audit, transaction submission, or chain acceptance is claimed.'
    };
  } finally {
    await rm(output, {recursive: true, force: true});
  }
}

export const krc20SchemaCatalog = Object.freeze({
  source: 'https://github.com/kasplex/go-krc20d/tree/main/operation/contract/KRC-20',
  boundary: 'These schemas check a small JSON payload offline. Only a compatible indexer observing a correctly formed commit/reveal transaction can determine protocol acceptance and state effects.',
  operations: {
    deploy: {required: ['p', 'op', 'tick', 'max', 'lim'], optional: ['pre', 'dec', 'to']},
    mint: {required: ['p', 'op', 'tick'], optional: ['to']},
    transfer: {required: ['p', 'op', 'tick', 'amt', 'to'], optional: ['memo']}
  }
});

const amount = value => typeof value === 'string' && /^[1-9][0-9]{0,31}$/.test(value);
const zeroOrAmount = value => value === '0' || amount(value);
const ticker = value => typeof value === 'string' && /^[A-Za-z]{4,6}$/.test(value);
const address = value => {
  if (typeof value !== 'string' || value !== value.toLowerCase()) return false;
  try { return kaspaSdk.Address.validate(value); } catch { return false; }
};

export function inspectKrc(payload) {
  let value;
  try { value = typeof payload === 'string' ? JSON.parse(payload) : payload; }
  catch { throw new Error('Payload must be valid JSON.'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Payload must be a JSON object.');
  if (JSON.stringify(value).length > 4096) throw new Error('Payload is too large for this inspector.');
  const schema = krc20SchemaCatalog.operations[value.op];
  if (!schema) throw new Error('Supported operations are deploy, mint, and transfer.');
  const allowed = new Set([...schema.required, ...schema.optional]);
  const unknown = Object.keys(value).filter(key => !allowed.has(key));
  const missing = schema.required.filter(key => value[key] === undefined);
  const errors = [];
  if (unknown.length) errors.push(`Unknown fields: ${unknown.join(', ')}.`);
  if (missing.length) errors.push(`Missing fields: ${missing.join(', ')}.`);
  if (value.p !== 'krc-20') errors.push('p must equal krc-20.');
  if (!ticker(value.tick)) errors.push('tick must contain 4 to 6 ASCII letters.');
  for (const field of ['max', 'lim', 'amt']) if (value[field] !== undefined && !amount(value[field])) errors.push(`${field} must be a positive canonical decimal string of at most 32 digits.`);
  if (value.pre !== undefined && !zeroOrAmount(value.pre)) errors.push('pre must be zero or a positive canonical decimal string of at most 32 digits.');
  if (value.op === 'deploy' && amount(value.max) && amount(value.lim) && BigInt(value.lim) > BigInt(value.max)) errors.push('lim cannot exceed max.');
  if (value.op === 'deploy' && zeroOrAmount(value.pre) && amount(value.max) && BigInt(value.pre) > BigInt(value.max)) errors.push('pre cannot exceed max.');
  if (value.dec !== undefined && !(typeof value.dec === 'string' && /^(?:[0-9]|1[0-8])$/.test(value.dec))) errors.push('dec must be a canonical decimal string from 0 through 18.');
  if (value.to !== undefined && !address(value.to)) errors.push('to must be a checksum-valid lowercase Kaspa address.');
  if (value.memo !== undefined && !(typeof value.memo === 'string' && value.memo.length <= 256 && /^[\x20-\x7e]*$/.test(value.memo))) errors.push('memo must be at most 256 printable ASCII characters.');
  const valid = errors.length === 0;
  const normalized = valid ? {...value, tick: value.tick.toUpperCase()} : null;
  return {
    ok: valid,
    valid: errors.length === 0,
    operation: value.op,
    payload: normalized,
    normalized,
    errors,
    checks: valid ? ['Recognized supported KRC-20 operation.', 'Required fields are present.', 'Fields pass this inspector’s strict syntax checks.'] : errors,
    summary: valid ? `Structurally valid ${value.op} payload for offline inspection.` : `Payload has ${errors.length} structural issue${errors.length === 1 ? '' : 's'}.`,
    fields: {required: schema.required, optional: schema.optional},
    source: krc20SchemaCatalog.source,
    boundary: krc20SchemaCatalog.boundary
  };
}
