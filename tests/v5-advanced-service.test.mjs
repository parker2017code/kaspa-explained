import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {V5AdvancedService} from '../faucet/v5-advanced-service.mjs';
const sdk=createRequire(import.meta.url)('../.cache/upstream/kaspa-wasm32-sdk/nodejs/kaspa'),templates=JSON.parse(await readFile('src/v5-advanced-templates.json'));
const clone=v=>structuredClone(v),key=new sdk.PrivateKey('31'.repeat(32)),address=key.toAddress('testnet-10').toString(),player={id:'ab'.repeat(32)};
function fixture({amount=10000000000n}={}){
 const map=new Map(),submitted=[],accepted=[];let entries=[],now=100000,daa=1000,failSave=false,failSend=false;
 const entry=(tx,i,daa=1000n)=>new sdk.UtxoEntries([{outpoint:{transactionId:tx.id,index:i},amount:tx.outputs[i].value,scriptPublicKey:tx.outputs[i].scriptPublicKey,...(tx.outputs[i].covenant?{covenant_id:tx.outputs[i].covenant.covenantId.toString()}:{}),blockDaaScore:daa,isCoinbase:false}]).items[0];
 entries=new sdk.UtxoEntries([{outpoint:{transactionId:'ee'.repeat(32),index:0},amount,scriptPublicKey:sdk.payToAddressScript(new sdk.Address(address)),blockDaaScore:1n,isCoinbase:false}]).items;
 const storage={async get(k){return clone(map.get(k));},async put(o){if(failSave)throw Error('disk unavailable');for(const [k,v]of Object.entries(o))map.set(k,clone(v));}};
 const h={sdk,key,address,storage,env:{FAUCET_KEY:'31'.repeat(32),V5_ENABLED:'true'},now:()=>now,node:p=>p,marketOwner:a=>sdk.payToAddressScript(new sdk.Address(a)).script.slice(2,66),marketEntry:e=>({outpoint:{transactionId:e.outpoint.transactionId,index:e.outpoint.index},amount:String(e.amount),scriptPublicKey:{version:e.entry.scriptPublicKey.version,script:e.entry.scriptPublicKey.script},covenantId:e.entry.covenantId?.toString()||null,blockDaaScore:String(e.blockDaaScore),isCoinbase:false}),hydrateMarketEntry:e=>new sdk.UtxoEntries([{...e,amount:BigInt(e.amount),blockDaaScore:BigInt(e.blockDaaScore),...(e.covenantId?{covenant_id:e.covenantId}:{})}]).items[0],async marketFunding(a=address){const script=sdk.payToAddressScript(new sdk.Address(a)).script;return entries.filter(e=>!e.entry.covenantId&&e.entry.scriptPublicKey.script===script).slice(0,8).map(e=>h.marketEntry(e));},async response(p,error,status=200){return{status,advanced:await service.view(p)};}};
 h.rpc={async getServerInfo(){return{networkId:'testnet-10',isSynced:true,virtualDaaScore:BigInt(daa)};},async getSink(){return{sink:'11'.repeat(32)};},async getFeeEstimate(){return{estimate:{priorityBucket:{feerate:100}}};},async getUtxosByAddresses(addresses){const scripts=addresses.map(a=>sdk.payToAddressScript(new sdk.Address(a)).script);return{entries:entries.filter(e=>scripts.includes(e.entry.scriptPublicKey.script))};},async submitTransaction({transaction:tx}){const a=await storage.get('v5:advanced:'+player.id),global=await storage.get('state');assert.equal(a.pending.transactionId,tx.id,'signed plan must be saved before send');assert.equal(global.pending.id,a.pending.id,'shared lock must precede send');assert.equal(a.pending.transaction,tx.serializeToSafeJSON());submitted.push(tx);if(failSend)throw Error('RPC response lost');return{transactionId:tx.id};},async getVirtualChainFromBlock(){return{removedChainBlockHashes:[],addedChainBlockHashes:[],acceptedTransactionIds:accepted.map(id=>({acceptingBlockHash:'22'.repeat(32),acceptedTransactionIds:[id]}))};}};
 const service=new V5AdvancedService(h,templates);
 return{h,service,storage,submitted,setDaa(v){daa=v;},setFailSave(v){failSave=v;},setFailSend(v){failSend=v;},advance(){now+=16000;},accept(){const tx=submitted.at(-1);accepted.push(tx.id);const consumed=new Set(tx.inputs.map(i=>i.previousOutpoint.transactionId+':'+i.previousOutpoint.index));entries=entries.filter(e=>!consumed.has(e.outpoint.transactionId+':'+e.outpoint.index));entries.push(...tx.outputs.map((_,i)=>entry(tx,i)));}};
}
const action=(id,stage)=>({id,type:'advanced_continue',stage});
test('ring identities receive certificates only after accepted outputs are observed',async()=>{const f=fixture();await f.service.action(player,action('open','ring-intro'));let a=await f.service.load(player);assert.equal(a.stage,'ring-intro');assert.equal(a.ringCells,undefined);await f.service.reconcile(player);assert.equal((await f.service.load(player)).ringCells,undefined);f.accept();await f.service.reconcile(player);a=await f.service.load(player);assert.equal(a.stage,'ring-ready');assert.equal(a.ringCells.length,3);assert.equal(new Set(a.ringCells.map(c=>c.covenantId)).size,3);assert.ok(a.ringCells.every(c=>c.certificate.length===128));assert.equal((await f.storage.get('state')).pending,null);await f.service.action(player,action('cycle','ring-ready'));assert.equal(f.submitted.length,2);f.accept();await f.service.reconcile(player);a=await f.service.load(player);assert.equal(a.stage,'ring-complete');assert.equal((await f.service.view(player)).visual.stage,'accepted');assert.deepEqual(a.ringCells.map(c=>[c.state.crops,c.state.tools,c.state.ore]),[[0,0,2],[3,0,0],[0,1,0]]);assert.equal(a.receipts.at(-1).purpose,'ring');await f.service.action(player,action('cycle','ring-ready'));assert.equal(f.submitted.length,2);});
test('failed durable save prevents broadcast and a shared treasury lock prevents preparation',async()=>{const f=fixture();f.setFailSave(true);await assert.rejects(()=>f.service.action(player,action('open','ring-intro')),/disk unavailable/);assert.equal(f.submitted.length,0);f.setFailSave(false);await f.storage.put({state:{pending:{id:'another'}}});await assert.rejects(()=>f.service.action(player,action('open','ring-intro')),/Another town transaction/);assert.equal(f.submitted.length,0);});
test('ambiguous send retains signed bytes; paused reconciliation never resends',async()=>{const f=fixture();f.setFailSend(true);await f.service.action(player,action('open','ring-intro'));const first=(await f.service.load(player)).pending.transaction;f.advance();f.h.env.V5_ENABLED='false';await f.service.reconcile(player);assert.equal(f.submitted.length,1);assert.equal((await f.service.load(player)).pending.transaction,first);f.h.env.V5_ENABLED='true';await f.service.reconcile(player);assert.equal(f.submitted.length,2);assert.equal(f.submitted[0].serializeToSafeJSON(),f.submitted[1].serializeToSafeJSON());});

test('guided route preserves accepted result beats and finishes within a 3.021508 tKAS treasury',async()=>{
 const f=fixture({amount:302150800n});let n=0;
 const step=async(expected)=>{const a=await f.service.load(player);await f.service.action(player,action('step-'+n++,a.stage));const pending=(await f.service.load(player)).pending;if(pending){f.accept();await f.service.reconcile(player);const retained=await f.storage.get('v5:advanced-receipt:'+pending.transactionId);assert.equal(retained.status,'accepted');assert.equal(retained.transaction,pending.transaction);assert.equal(retained.signedHash,pending.signedHash);assert.equal(retained.acceptingBlock,'22'.repeat(32));assert.deepEqual(retained.journal,pending.journal);}assert.equal((await f.service.load(player)).stage,expected);};
 const acknowledge=async(expected)=>{const before=f.submitted.length,view=await f.service.view(player);assert.equal(view.visual.stage,'accepted');assert.match(view.visual.acceptingBlock,/^[a-f0-9]{64}$/);await step(expected);assert.equal(f.submitted.length,before,'acknowledging an accepted result must not send another transaction');};
 await step('ring-ready');await step('ring-complete');await acknowledge('delivery-intro');await step('delivery-intro');await step('delivery-ready');await step('delivery-complete');await acknowledge('refund-intro');await step('refund-wait');
 const count=f.submitted.length;await step('refund-wait');assert.equal(f.submitted.length,count);f.setDaa(1101);await step('refund-ready');assert.equal(f.submitted.length,count);await step('refund-complete');await acknowledge('complete');
 const a=await f.service.load(player);assert.deepEqual(a.receipts.filter(r=>r.purpose).map(r=>r.purpose),['ring','delivery_release','delivery_refund']);assert.equal(f.submitted.at(-1).inputs[0].sequence,100n);assert.equal(f.submitted.at(-1).outputs[0].value,30000000n);assert.equal((await f.storage.get('state')).pending,null);
});
test('public advanced metadata keeps preparation amounts scoped to exact transaction outputs and backfills legacy receipts',async()=>{
 const f=fixture();
 await f.service.action(player,action('open-ring','ring-intro'));
 let a=await f.service.load(player),view=await f.service.view(player);
 assert.deepEqual(a.pending.ringDeposits,['30000000','30000000','30000000']);
 assert.deepEqual(view.pending.ringDeposits,a.pending.ringDeposits);
 assert.deepEqual(view.visual.ringDeposits,a.pending.ringDeposits);
 f.accept();await f.service.reconcile(player);
 a=await f.service.load(player);assert.deepEqual(a.receipts[0].ringDeposits,['30000000','30000000','30000000']);
 delete a.receipts[0].ringDeposits;await f.storage.put({['v5:advanced:'+player.id]:a});
 view=await f.service.view(player);assert.deepEqual(view.receipts[0].ringDeposits,['30000000','30000000','30000000']);assert.deepEqual(view.visual.ringDeposits,['30000000','30000000','30000000']);
 await f.service.action(player,action('cycle-ring','ring-ready'));f.accept();await f.service.reconcile(player);
 await f.service.action(player,action('open-delivery','ring-complete'));
 await f.service.action(player,action('fund-roles','delivery-intro'));
 a=await f.service.load(player);view=await f.service.view(player);
 assert.equal(a.pending.customerFundingSompi,'50000000');assert.equal(a.pending.courierFundingSompi,'20000000');
 assert.equal(view.visual.paymentSompi,'20000000');assert.equal(view.visual.bondSompi,'10000000');
 assert.equal(view.visual.customerFundingSompi,'50000000');assert.equal(view.visual.courierFundingSompi,'20000000');
 f.accept();await f.service.reconcile(player);a=await f.service.load(player);
 const receipt=a.receipts.find(r=>r.operation==='role-funding');assert.equal(receipt.customerFundingSompi,'50000000');assert.equal(receipt.courierFundingSompi,'20000000');
 delete receipt.customerFundingSompi;delete receipt.courierFundingSompi;await f.storage.put({['v5:advanced:'+player.id]:a});
 view=await f.service.view(player);const restored=view.receipts.find(r=>r.operation==='role-funding');assert.equal(restored.customerFundingSompi,'50000000');assert.equal(restored.courierFundingSompi,'20000000');
});

test('a fresh controller resumes accepted saved work without a duplicate broadcast',async()=>{const f=fixture();await f.service.action(player,action('open','ring-intro'));const restarted=new V5AdvancedService(f.h,templates);f.accept();await restarted.reconcile(player);assert.equal((await restarted.load(player)).stage,'ring-ready');assert.equal(f.submitted.length,1);assert.equal((await f.storage.get('state')).pending,null);});

test('restart rejects changed signed bytes even when the transaction ID remains unchanged',async()=>{
 const f=fixture();await f.service.action(player,action('open','ring-intro'));const a=await f.service.load(player),tx=sdk.Transaction.deserializeFromSafeJSON(a.pending.transaction);tx.inputs[0].signatureScript='41'+'00'.repeat(64)+'01';tx.finalize();assert.equal(tx.id,a.pending.transactionId,'transaction ID does not bind its signatures');a.pending.transaction=tx.serializeToSafeJSON();await f.storage.put({['v5:advanced:'+player.id]:a});f.advance();const resumed=new V5AdvancedService(f.h,templates);await assert.rejects(()=>resumed.reconcile(player),/signed transaction bytes changed/);assert.equal(f.submitted.length,1);assert.equal((await f.service.load(player)).stage,'ring-intro');
});
test('restart rejects successor state edits before applying acceptance or rebroadcasting',async()=>{
 const f=fixture();await f.service.action(player,action('open','ring-intro'));const a=await f.service.load(player);a.pending.states[0].crops++;await f.storage.put({['v5:advanced:'+player.id]:a});f.accept();await assert.rejects(()=>new V5AdvancedService(f.h,templates).reconcile(player),/successor states changed/);assert.equal(f.submitted.length,1);assert.equal((await f.service.load(player)).ringCells,undefined);assert.ok((await f.storage.get('state')).pending);
});
test('legacy journal replay still rejects changed signature bytes without a saved hash',async()=>{
 const f=fixture();await f.service.action(player,action('open','ring-intro'));const a=await f.service.load(player),tx=sdk.Transaction.deserializeFromSafeJSON(a.pending.transaction);delete a.pending.signedHash;tx.inputs[0].signatureScript='41'+'00'.repeat(64)+'01';a.pending.transaction=tx.serializeToSafeJSON();await f.storage.put({['v5:advanced:'+player.id]:a});f.advance();await assert.rejects(()=>new V5AdvancedService(f.h,templates).reconcile(player),/ring signatures changed/);assert.equal(f.submitted.length,1);
});
