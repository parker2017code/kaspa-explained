// Fresh reproducible Argent compilation. No RPC or private key access.
import{execFileSync}from'node:child_process';import{readFile,writeFile,mkdir,copyFile}from'node:fs/promises';import{createHash}from'node:crypto';import assert from'node:assert/strict';
const revision='d08e52dd1e18c9f7e9a2dc482048c2db31d25611';assert.equal(execFileSync('git',['-C','.cache/upstream/argent','rev-parse','HEAD'],{encoding:'utf8'}).trim(),revision);
execFileSync('.cache/upstream/argent/target/debug/argentc',['build','contracts/public/argent-market/business.ag','--out','.cache/v5-argent'],{stdio:'inherit'});
const a=JSON.parse(await readFile('.cache/v5-argent/artifact.json')),templates={version:1,network:'testnet-10',compiler:{name:'argentc',revision},apps:{business:{app:a.app,id:a.id,contractName:'Business',computeBudget:100,artifact:a.sil_abi,argent:a.argent}},sources:{}};
execFileSync('.cache/upstream/argent/target/debug/argentc',['build','contracts/public/argent-market/observer.ag','--out','.cache/v5-argent-observer'],{stdio:'inherit'});
const observer=JSON.parse(await readFile('.cache/v5-argent-observer/artifact.json'));templates.apps.observer={app:observer.app,id:observer.id,contractName:'Observer',computeBudget:100,artifact:observer.sil_abi,argent:observer.argent};
await mkdir('contracts/public/argent-market/generated',{recursive:true});await copyFile('.cache/v5-argent/sil/Business.sil','contracts/public/argent-market/generated/Business.sil');
await copyFile('.cache/v5-argent-observer/sil/Observer.sil','contracts/public/argent-market/generated/Observer.sil');
for(const path of['contracts/public/argent-market/observer.ag','contracts/public/argent-market/generated/Observer.sil','contracts/public/argent-market/business.ag','contracts/public/argent-market/capsule.ag','contracts/public/argent-market/generated/Business.sil'])templates.sources[path]={sha256:createHash('sha256').update(await readFile(path)).digest('hex')};
await writeFile('src/v5-argent-templates.json',JSON.stringify(templates));console.log(JSON.stringify({artifact:a.id,bytes:a.sil_abi.contracts.Business.compiled.bytecode.length}));
