// Rebuild only Ring and Delivery with the pinned compiler. Business is deliberately separate.
// Usage: node scripts/build-v5-advanced.mjs [--check]
// --check recompiles into .cache and verifies the committed bundle and generated SilverScript.
import {execFileSync} from 'node:child_process';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {V5_DELIVERY_ARTIFACT_ID} from '../src/v5-delivery-protocol.mjs';

const revision = 'd08e52dd1e18c9f7e9a2dc482048c2db31d25611';
const check = process.argv.includes('--check');
if (process.argv.slice(2).some(arg => arg !== '--check')) throw Error('Usage: node scripts/build-v5-advanced.mjs [--check]');
assert.equal(execFileSync('git', ['-C', '.cache/upstream/argent', 'rev-parse', 'HEAD'], {encoding:'utf8'}).trim(), revision, 'Use the pinned Argent compiler checkout');
const specs = [
  {name:'ring', app:'FixedRing', contract:'Ring', id:'b0a99e69b69a03e8e263a29bc601af8e0a272a34de67faf344877ad0df8b126a'},
  {name:'delivery', app:'DeliveryApp', contract:'Delivery', id:V5_DELIVERY_ARTIFACT_ID},
];
const compiled = {};
for (const spec of specs) {
  const source = `contracts/public/argent-market/${spec.name}.ag`, output = `.cache/v5-${spec.name}`;
  execFileSync('.cache/upstream/argent/target/debug/argentc', ['build', source, '--out', output], {stdio:'inherit'});
  const artifact = JSON.parse(await readFile(`${output}/artifact.json`, 'utf8'));
  assert.equal(artifact.app, spec.app, `${spec.name}: unexpected app`);
  assert.equal(artifact.id, spec.id, `${spec.name}: generated artifact differs from the reviewed ID; review the contract and protocol pin before updating`);
  assert.ok(artifact.sil_abi?.contracts?.[spec.contract], `${spec.name}: missing compiled contract`);
  compiled[spec.name] = artifact;
}
const ring = compiled.ring;
const bundle = {version:1, network:'testnet-10', ring:{version:1, network:'testnet-10', compiler:{name:'argentc', revision}, apps:{ring:{id:ring.id, app:ring.app, contractName:'Ring', computeBudget:100, artifact:ring.sil_abi, argent:ring.argent}}}, delivery:compiled.delivery};
const outputs = specs.map(spec => [`contracts/public/argent-market/generated/${spec.contract}.sil`, `.cache/v5-${spec.name}/sil/${spec.contract}.sil`]);
const files = await Promise.all(outputs.map(async ([destination, source]) => [destination, await readFile(source, 'utf8')]));
files.push(['src/v5-advanced-templates.json', JSON.stringify(bundle)]);
if (!check) await mkdir('contracts/public/argent-market/generated', {recursive:true});
for (const [path, content] of files) {
  let current;
  try { current = await readFile(path, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (check) assert.equal(current, content, `${path} is not reproducible; run node scripts/build-v5-advanced.mjs`);
  else if (current !== content) await writeFile(path, content);
}
console.log(JSON.stringify({mode:check ? 'verified' : 'built', output:'src/v5-advanced-templates.json', artifacts:Object.fromEntries(specs.map(spec => [spec.name, {id:compiled[spec.name].id, bytes:compiled[spec.name].sil_abi.contracts[spec.contract].compiled.bytecode.length}]))}));
