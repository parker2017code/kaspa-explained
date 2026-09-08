// Real SDK signatures and native Kaspa script VM, with an unfunded UTXO fixture.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {V6BrowserWallet} from '../src/v6-browser-wallet.mjs';
import {V6BrowserEngine} from '../src/v6-browser-engine.mjs';
import {checkV6Script} from '../server/v6-vm.mjs';
import {generateProof} from '../src/v6-proof-protocol.mjs';
import {buildPublicPayment, signPublicAssetPlan} from '../src/public-asset-signing.mjs';
const sdk = createRequire(import.meta.url)('../.cache/upstream/kaspa-wasm32-sdk/nodejs/kaspa');
const read = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const templates = {business: await read('../src/v5-argent-templates.json'), advanced: await read('../src/v5-advanced-templates.json'), launch: (await read('../.cache/public-templates/templates.json')).templates.launch, proof: await read('../src/v6-proof-templates.json')};
const digest = value => createHash('sha256').update(value).digest('hex');
const opId = outpoint => outpoint.transactionId + ':' + outpoint.index;
async function fixture() {
const controls = {failSave: false, interruptReply: false, rejectBeforeApply: false, hideAcceptance: false, reverseGroups: false};
const storageMap = new Map(), storage = {getItem: key => storageMap.get(key) || null, setItem: (key, value) => {if (controls.failSave) throw Error('Injected storage failure'); storageMap.set(key, value);}};
const wallet = new V6BrowserWallet({storage}); wallet.sdk = sdk; wallet.keys = ['11','22','33'].map(value => new sdk.PrivateKey(value.repeat(32))); wallet.secret = 'ab'.repeat(32); storage.setItem('kaspa-v6-browser-wallet-v1-secret', wallet.secret);
const utxos = new Map(), accepted = [], broadcasts = [], attempts = [], changes = [], initialSink = digest('browser fixture start'); let daa = 100000n;
function addOutput(transactionId,index,value,scriptPublicKey,covenantId=null) {
  const entry = new sdk.UtxoEntries([{outpoint:{transactionId,index},amount:BigInt(value),scriptPublicKey,blockDaaScore:daa,isCoinbase:false,...(covenantId?{covenant_id:covenantId}:{})}]).items[0]; utxos.set(opId(entry.outpoint), entry);
}
addOutput(digest('unfunded ten test coin fixture'),0,1000000000n,sdk.payToAddressScript(new sdk.Address(wallet.address)));
let signed = 0;
const rpc = {
  async getServerInfo(){daa += 100n; return {networkId:'testnet-10',isSynced:true,hasUtxoIndex:true,virtualDaaScore:daa};},
  async getBlockDagInfo(){return {virtualDaaScore:daa,pastMedianTime:BigInt(Date.now())};},
  async getFeeEstimate(){return {estimate:{priorityBucket:{feerate:100}}};},
  async getSink(){return {sink:accepted.at(-1)?.acceptingBlockHash || initialSink};},
  async getUtxosByAddresses(addresses){const scripts=new Set(addresses.map(a=>sdk.payToAddressScript(new sdk.Address(a)).script));return {entries:[...utxos.values()].filter(e=>scripts.has(e.entry.scriptPublicKey.script))};},
  async getVirtualChainFromBlock({startHash}){const index=startHash===initialSink?-1:accepted.findIndex(g=>g.acceptingBlockHash===startHash);assert(index>=0||startHash===initialSink);const groups=controls.hideAcceptance?[]:accepted.slice(index+1);if(controls.reverseGroups)groups.reverse();return {removedChainBlockHashes:[],addedChainBlockHashes:groups.map(g=>g.acceptingBlockHash),acceptedTransactionIds:groups};},
  async submitTransaction({transaction:tx}){
    tx.finalize();
    attempts.push({id:tx.id,wire:tx.serializeToSafeJSON()});
    const durable = new V6BrowserWallet({storage:controls.submissionStorage || storage});durable.sdk=sdk;await durable.restore();
    const saved = durable.data.records.find(record=>record.id===tx.id);
    assert(saved,'every submission must have an encrypted saved journal first');
    assert.equal(saved.journal.transaction,tx.serializeToSafeJSON(),'submission must match the persisted signed bytes');
    if(controls.rejectBeforeApply)throw Error('Interrupted before node acknowledgement'); if(accepted.some(group=>group.acceptedTransactionIds.includes(tx.id)))return {transactionId:tx.id};
    const check=await checkV6Script(tx); assert.equal(check.valid,true,'VM must accept '+JSON.stringify(check));
    for(const input of tx.inputs){const entry=utxos.get(opId(input.previousOutpoint));assert(entry);assert.equal(entry.amount,input.utxo.amount);assert.equal(entry.entry.scriptPublicKey.script,input.utxo.entry.scriptPublicKey.script);}
    tx.inputs.forEach(input=>utxos.delete(opId(input.previousOutpoint)));daa++;
    tx.outputs.forEach((output,index)=>addOutput(tx.id,index,output.value,output.scriptPublicKey,output.covenant?.covenantId?.toString()));
    const block=digest('browser fixture accepted '+tx.id);accepted.push({acceptingBlockHash:block,acceptedTransactionIds:[tx.id]});broadcasts.push(tx.id);
    if(controls.interruptReply){controls.interruptReply=false;throw Error('Interrupted submit reply');}return {transactionId:tx.id};
  },
};
wallet.rpc=rpc; const originalSign=wallet.sign.bind(wallet);wallet.sign=(...args)=>{signed++;return originalSign(...args);};
const engine=new V6BrowserEngine(wallet,{onAccepted:record=>changes.push(record.id)});engine.templates=templates;await engine.loadDomains();
await wallet.save();
return {wallet, engine, storage, utxos, accepted, broadcasts, attempts, changes, controls, rpc, get signed(){return signed;}};
}
const main = await fixture();
const {wallet, engine, storage, broadcasts, changes, rpc} = main;
async function step(id){const before=broadcasts.length,beforeSigns=main.signed;await engine.prepare(id,id);assert.equal(broadcasts.length,before,'review never submits');assert.equal(main.signed,beforeSigns,'review never signs a transaction');await engine.confirm();assert(engine.accepted(id),'step accepted '+id);assert.equal(broadcasts.length,before+1,'one approval produces one transaction');const after=broadcasts.length;await engine.check();await engine.check();assert.equal(broadcasts.length,after,'status never submits');console.log(id+' accepted');}
await engine.prepare('purchase-buyer','Your trading account');engine.review.createdAt-=130000;const before=main.signed;await assert.rejects(engine.confirm(),/expired/);assert.equal(main.signed,before,'expired review never signs');
for(const id of ['purchase-buyer','purchase-seller','purchase-buy','pip-buyer','pip-seller','pip-permit','pip-pay','pip-revoke','ring-create','ring-settle','greenhouse-create','greenhouse-ready0','greenhouse-ready1','greenhouse-ready2','greenhouse-settle','courier-fund','courier-open','courier-deliver','refund-open','refund-claim','proof-open'])await step(id);
const proofCell=engine.cells().get('proof-open');engine.proofBundle=generateProof({owner:proofCell.state.owner,taskNonce:proofCell.state.taskNonce});main.controls.interruptReply=true;await step('proof-redeem');
assert.deepEqual(engine.completed,[0,1,2,3,4,5]);assert.equal(new Set(changes).size,changes.length,'acceptance emits once');
const restore=new V6BrowserWallet({storage});restore.sdk=sdk;await restore.restore();restore.rpc=rpc;const restored=new V6BrowserEngine(restore);restored.templates=templates;await restored.loadDomains();restored.validateRecovery();const beforeRestore=broadcasts.length;await restored.check();assert.equal(broadcasts.length,beforeRestore);assert.deepEqual(restored.completed,[0,1,2,3,4,5]);

const checks = [], failures = [];
async function check(name, run) {
  try {await run(); checks.push(name); console.log('PASS '+name);}
  catch (error) {failures.push({name,error:error.message}); console.error('FAIL '+name+': '+error.stack);}
}
const copy = value => JSON.parse(JSON.stringify(value));
async function approved(f, id) {await f.engine.prepare(id,id);return f.engine.confirm();}
async function reload(f) {
  const restoredWallet = new V6BrowserWallet({storage:f.storage});restoredWallet.sdk=sdk;await restoredWallet.restore();restoredWallet.rpc=f.rpc;
  const restoredEngine = new V6BrowserEngine(restoredWallet);restoredEngine.templates=templates;await restoredEngine.loadDomains();restoredEngine.validateRecovery();
  return {wallet:restoredWallet,engine:restoredEngine};
}
await check('stale input stops before signatures, storage, and submission',async()=>{
  const f=await fixture();await f.engine.prepare('purchase-buyer','Review');
  const input=f.engine.review.plan.transaction.inputs[0];f.utxos.delete(opId(input.previousOutpoint));
  await assert.rejects(f.engine.confirm(),/unspent|input|changed/i);
  assert.equal(f.signed,0);assert.equal(f.attempts.length,0);assert.equal(f.engine.records.length,0);
});
await check('expired review stops before signatures and submission',async()=>{
  const f=await fixture();await f.engine.prepare('purchase-buyer','Review');f.engine.review.createdAt-=130000;
  await assert.rejects(f.engine.confirm(),/expired/);assert.equal(f.signed,0);assert.equal(f.attempts.length,0);assert.equal(f.engine.records.length,0);
});
await check('storage failure retains signed journal; explicit retry sends exact saved bytes without signing',async()=>{
  const f=await fixture();await f.engine.prepare('purchase-buyer','Review');f.controls.failSave=true;
  await assert.rejects(f.engine.confirm(),/saving/);assert.equal(f.attempts.length,0);assert(f.signed>0);
  const pending=f.engine.pending, journal=copy(pending.journal), signatures=f.signed;
  assert.equal(pending.storageUncertain,true);assert.equal(pending.submitted,false);
  assert.equal(f.engine.recover(journal).transaction.serializeToSafeJSON(),journal.transaction);
  await assert.rejects(f.engine.prepare('purchase-seller','Other review'),/still being observed/);
  assert.deepEqual(f.engine.pending.journal,journal);
  f.controls.failSave=false;await f.wallet.save();const saved=await reload(f);
  assert.deepEqual(saved.engine.pending.journal,journal,'encrypted save restores exact signed journal');
  await f.engine.retry();assert.equal(f.signed,signatures);assert.equal(f.attempts.length,1);
  assert.equal(f.attempts[0].wire,journal.transaction);assert.equal(f.attempts[0].id,journal.id);
  assert(f.engine.accepted('purchase-buyer'));assert.equal(f.changes.length,1);
});
await check('unresolved interrupted reply stays pending across reload; checks do not resend; retry keeps ID and bytes',async()=>{
  const f=await fixture();f.controls.rejectBeforeApply=true;
  await approved(f,'purchase-buyer');const journal=copy(f.engine.pending.journal),signatures=f.signed;
  assert.equal(f.engine.pending.phase,'uncertain');assert.equal(f.attempts.length,1);assert.equal(f.broadcasts.length,0);
  await Promise.all([f.engine.check(),f.engine.check()]);await f.engine.check();
  await assert.rejects(f.engine.prepare('purchase-seller','Other'),/still being observed/);
  assert.equal(f.attempts.length,1);assert.equal(f.signed,signatures);assert.deepEqual(f.engine.pending.journal,journal);
  const saved=await reload(f);await saved.engine.check();assert.equal(saved.engine.pending.id,journal.id);assert.equal(f.attempts.length,1);
  f.controls.rejectBeforeApply=false;await f.engine.retry();assert.equal(f.attempts.length,2);assert.equal(f.signed,signatures);
  assert.deepEqual(f.attempts.map(x=>x.wire),[journal.transaction,journal.transaction]);assert.equal(f.changes.length,1);
});
await check('visible outputs cannot complete without accepting-block evidence; reordered repeated checks emit once',async()=>{
  const f=await fixture();f.controls.hideAcceptance=true;f.controls.interruptReply=true;
  await approved(f,'purchase-buyer');const id=f.engine.pending.id;
  assert([...f.utxos.values()].some(x=>x.outpoint.transactionId===id),'node fixture exposes created output');
  await f.engine.check();assert.equal(f.engine.accepted('purchase-buyer'),undefined);assert.equal(f.engine.pending.id,id);assert.equal(f.changes.length,0);
  f.controls.hideAcceptance=false;f.controls.reverseGroups=true;
  // Supply an unrelated later block so the returned groups are genuinely reordered.
  f.accepted.push({acceptingBlockHash:digest('unrelated later fixture block'),acceptedTransactionIds:[digest('unrelated transaction')]});
  await Promise.all([f.engine.check(),f.engine.check()]);await f.engine.check();await f.engine.check();
  assert(f.engine.accepted('purchase-buyer'));assert.deepEqual(f.changes,[id]);assert.equal(f.attempts.length,1);
});
await check('greenhouse withdrawal returns each contribution without group settlement',async()=>{
  const f=await fixture();await approved(f,'greenhouse-create');
  // Cover withdrawal of both an approved contribution and untouched contributions.
  await approved(f,'greenhouse-ready0');
  for(let i=0;i<3;i++)await approved(f,'greenhouse-withdraw'+i);
  assert(f.engine.completed.includes(3));assert.equal(f.engine.accepted('greenhouse-settle'),undefined);
  assert.equal([...f.engine.cells().keys()].filter(x=>x.startsWith('greenhouse-')).length,0);
  for(let i=0;i<3;i++){
    const record=f.engine.accepted('greenhouse-withdraw'+i),tx=sdk.Transaction.deserializeFromSafeJSON(record.journal.transaction);
    assert.equal(record.journal.operation,2);assert.equal(tx.inputs.length,1);assert.equal(tx.outputs.length,1);
    assert.equal(tx.outputs[0].scriptPublicKey.script,sdk.payToAddressScript(new sdk.Address(f.wallet.addresses[i])).script);
  }
  const attempts=f.attempts.length,signatures=f.signed;
  await assert.rejects(f.engine.prepare('greenhouse-settle','Group'),/preparation|unspent|earlier deposit/);
  assert.equal(f.attempts.length,attempts);assert.equal(f.signed,signatures);
});
await check('recovery rejects a valid journal relabeled as a different lesson action',async()=>{
  const f=await fixture();await approved(f,'purchase-buyer');const record=f.engine.records[0];
  record.step='purchase-seller';assert.throws(()=>f.engine.validateRecovery(),/saved|match|owner|inventory/i);
  record.step='purchase-buy';assert.throws(()=>f.engine.validateRecovery(),/saved|match/i);
});
await check('recovery rejects a valid signed native payment with foreign recipients',async()=>{
  const f=await fixture(),foreign=new sdk.PrivateKey('44'.repeat(32)).toPublicKey().toXOnlyPublicKey().toString();
  const recipients=[{recipient:foreign,amount:'40000000'},{recipient:f.wallet.owners[1],amount:'20000000'}];
  const plan=buildPublicPayment(sdk,{fundingUtxos:await f.wallet.funding(0,80000000n),owner:f.wallet.owners[0],recipients,feeRate:100});
  await signPublicAssetPlan(plan,f.wallet.sign.bind(f.wallet));
  const journal={version:1,network:'testnet-10',kind:'v6-native-payment',id:plan.transaction.id,transaction:plan.transaction.serializeToSafeJSON(),fee:String(plan.fee),feeRate:plan.mass.feeRate,owner:f.wallet.owners[0],recipients};
  assert.throws(()=>f.engine.recover(journal),/recipient|account-funding/i);assert.equal(f.attempts.length,0);
});
await check('imported acceptingBlock claims require new node evidence and block spending',async()=>{
  const f=await fixture();f.controls.rejectBeforeApply=true;await approved(f,'purchase-buyer');
  // An authenticated recovery file can contain a claimed observation: authentication
  // identifies its author but does not establish Testnet acceptance.
  f.engine.records[0].acceptingBlock=digest('invented accepting block');f.engine.records[0].phase='accepted';
  const envelope=await f.wallet.backup('unfunded fixture recovery password');
  const importedStorageMap=new Map(),importedWallet=new V6BrowserWallet({storage:{getItem:k=>importedStorageMap.get(k)||null,setItem:(k,v)=>importedStorageMap.set(k,v)}});
  importedWallet.sdk=sdk;await importedWallet.importBackup(envelope,'unfunded fixture recovery password');importedWallet.rpc=f.rpc;
  const events=[],importedEngine=new V6BrowserEngine(importedWallet,{onAccepted:r=>events.push(r.id)});importedEngine.templates=templates;await importedEngine.loadDomains();importedEngine.validateRecovery();
  assert.equal(importedEngine.accepted('purchase-buyer'),undefined);assert(importedEngine.pending);
  await importedEngine.check();assert.equal(importedEngine.accepted('purchase-buyer'),undefined);
  await assert.rejects(importedEngine.prepare('purchase-seller','Other'),/still being observed/);assert.equal(f.attempts.length,1);
  f.controls.rejectBeforeApply=false;f.controls.submissionStorage=importedWallet.storage;await importedEngine.retry();assert(importedEngine.accepted('purchase-buyer'));
  assert.equal(events.length,0,'recovered historical observation does not replay celebration');
});
await mkdir('.cache/v6-browser-engine',{recursive:true});
await writeFile('.cache/v6-browser-engine/report.json',JSON.stringify({scope:'unfunded synthetic UTXO node; real SDK and native Kaspa VM',transactions:broadcasts.length,completed:engine.completed,acceptanceEvents:changes.length,remainingNative:wallet.balances.map(String),operations:engine.records.map(r=>({step:r.step,kind:r.journal.kind,operation:r.journal.operation})),checks,failures},null,2));
if(failures.length){process.exitCode=1;console.error(`${failures.length} recovery/failure checks failed; inspect .cache/v6-browser-engine/report.json.`);}
else console.log(`PASS browser wallet engine: ${broadcasts.length} main-journey VM transactions and ${checks.length} recovery/failure checks.`);
