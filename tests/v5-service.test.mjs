import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {V5Service,v5SessionMessage,buildV5Reward,validateV5Payment} from '../faucet/v5-service.mjs';
const sdk=createRequire(import.meta.url)('../.cache/upstream/kaspa-wasm32-sdk/nodejs/kaspa');
const keys=[81,82,83].map(n=>new sdk.PrivateKey(n.toString(16).padStart(2,'0').repeat(32))),addresses=keys.map(key=>key.toAddress('testnet-10').toString());
const entry=(owner=0,tag=1,amount=10000000000n)=>new sdk.UtxoEntries([{outpoint:{transactionId:tag.toString(16).padStart(2,'0').repeat(32),index:0},amount,scriptPublicKey:sdk.payToAddressScript(keys[owner].toAddress('testnet-10')),blockDaaScore:0n,isCoinbase:false}]).items[0];
const copy=tx=>sdk.Transaction.deserializeFromSafeJSON(tx.serializeToSafeJSON());
function fixture(overrides={}){
 const records=new Map(),accepted=new Set(),submissions=[],entries=[entry()],playerEntries=[entry(1,2)],chainEntries=[...entries,...playerEntries];let now=1000000;
 const storage={get:async key=>structuredClone(records.get(key)),put:async values=>{for(const [key,value]of Object.entries(values))records.set(key,structuredClone(value));}};
 const rpc={getSink:async()=>({sink:'ab'.repeat(32)}),getUtxosByAddresses:async([address])=>({entries:overrides.argentTemplates?chainEntries.filter(e=>sdk.addressFromScriptPublicKey(e.entry.scriptPublicKey,'testnet-10')?.toString()===address):address===addresses[0]?entries:playerEntries}),getFeeEstimate:async()=>({estimate:{priorityBucket:{feerate:100}}}),getVirtualChainFromBlock:async()=>({removedChainBlockHashes:[],addedChainBlockHashes:[],acceptedTransactionIds:[{acceptingBlockHash:'cd'.repeat(32),acceptedTransactionIds:[...accepted]}]}),submitTransaction:async({transaction})=>{assert.equal(records.get('state').pending.transactionId,transaction.id,'Pending treasury lock exists before submit');assert.equal(records.get('v5:payment:'+records.get('state').pending.id).transaction,transaction.serializeToSafeJSON(),'Signed bytes exist before submit');submissions.push(transaction.serializeToSafeJSON());if(overrides.argentTemplates){for(const input of transaction.inputs){const n=chainEntries.findIndex(e=>e.outpoint.transactionId===input.previousOutpoint.transactionId&&e.outpoint.index===input.previousOutpoint.index);if(n>=0)chainEntries.splice(n,1);}transaction.outputs.forEach((o,i)=>chainEntries.push(new sdk.UtxoEntries([{outpoint:{transactionId:transaction.id,index:i},amount:o.value,scriptPublicKey:o.scriptPublicKey,blockDaaScore:0n,isCoinbase:false,...(o.covenant?{covenant_id:o.covenant.covenantId.toString()}:{})}]).items[0]));}if(overrides.uncertain)throw Error('Network disconnected');return {transactionId:transaction.id};}};
 const env={FAUCET_KEY:'51'.repeat(32),V5_ENABLED:'true',...overrides},service=new V5Service({storage,env,sdk,rpc,key:keys[0],address:addresses[0],entries,argentTemplates:overrides.argentTemplates||null,now:()=>now});
 const call=async(path,body)=>{const response=await service.handle(new Request('https://example.invalid/api/v5/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));return {status:response.status,...await response.json()};};
 const start=async(owner=1,nonce='12'.repeat(32))=>{const address=addresses[owner],signature=sdk.signMessage({privateKey:keys[owner],message:v5SessionMessage(address,nonce)}),result=await call('start',{address,nonce,signature});assert.equal(result.status,200,result.error);return result;};
 const auth=result=>({playerId:result.playerId,capability:result.capability});
 const action=(a,id,type,extra={})=>call('action',{...auth(a),action:{id,type,...extra}});
 const purchase=async(a,id='plot')=>{
  const prepared=await action(a,id,'buy_plot');assert.equal(prepared.status,200,prepared.error);
  const plan=buildV5Reward(sdk,{entries:playerEntries,source:addresses[1],destination:addresses[0],amountSompi:prepared.payment.amountSompi,feeRate:100});for(let i=0;i<plan.transaction.inputs.length;i++)plan.transaction.inputs[i].signatureScript=sdk.createInputSignature(plan.transaction,i,keys[1]);plan.transaction.finalize();
  return {prepared,transaction:plan.transaction,body:{...auth(a),paymentId:prepared.payment.id,transaction:plan.transaction.serializeToSafeJSON()}};
 };
 const openPlot=async a=>{const p=await purchase(a);accepted.add(p.transaction.id);const paid=await call('payment',p.body);assert.equal(paid.status,200,paid.error);return p;};
 const readyOrder=async a=>{await openPlot(a);for(const [id,type,extra]of[['plant','plant'],['water','water'],['harvest','harvest'],['order','accept_order',{orderId:'first-harvest'}]]){const r=await action(a,id,type,extra);assert.equal(r.status,200,r.error);}};
 return {records,accepted,submissions,storage,rpc,service,call,start,auth,action,purchase,openPlot,readyOrder,playerEntries,advance:ms=>{now+=ms;}};
}

test('V5 sessions require wallet signatures, retain state and rotate capability without exposing keys',async()=>{
 const f=fixture(),a=await f.start();assert.equal(a.state.playerId,a.playerId);assert.equal(a.treasuryAddress,addresses[0]);assert.equal(a.state.upgrades.plots,0);assert(!JSON.stringify(a).includes('FAUCET_KEY'));
 assert.equal((await f.call('state',{...f.auth(a),capability:'ff'.repeat(32)})).status,401);
 assert.equal((await f.call('start',{address:addresses[1],nonce:'34'.repeat(32),signature:sdk.signMessage({privateKey:keys[2],message:v5SessionMessage(addresses[1],'34'.repeat(32))})})).status,401);
 const b=await f.start(1,'56'.repeat(32));assert.equal(b.playerId,a.playerId);assert.notEqual(b.capability,a.capability);assert.equal((await f.call('state',f.auth(a))).status,401);assert.equal((await f.call('state',f.auth(b))).status,200);
 assert.equal((await f.call('state',{...f.auth(b),state:{upgrades:{plots:50}}})).status,400);
});

test('V5 purchase never trusts client acceptance or applies a pending payment',async()=>{
 const f=fixture(),a=await f.start(),p=await f.purchase(a);
 const pending=await f.call('payment',p.body);assert.equal(pending.status,202);assert.equal(pending.state.upgrades.plots,0);assert.equal(pending.payment.transactionId,p.transaction.id);assert.equal(f.submissions.length,0,'Backend never broadcasts a player payment');
 assert.equal((await f.action(a,'plant','plant')).status,409,'Mutation is frozen while purchase pending');
 assert.equal((await f.call('payment',{...p.body,acceptingBlock:'de'.repeat(32)})).status,400,'Client cannot supply acceptance evidence');
 f.accepted.add(p.transaction.id);const accepted=await f.call('payment',{...f.auth(a),paymentId:p.prepared.payment.id});assert.equal(accepted.status,200);assert.equal(accepted.state.upgrades.plots,1);assert.equal(accepted.payment.acceptingBlock,'cd'.repeat(32));
 const repeated=await f.call('payment',p.body);assert.equal(repeated.state.upgrades.plots,1);assert.equal(Object.keys(repeated.state.receipts).length,1);assert.equal(f.submissions.length,0);
});

test('V5 purchase checks observed player input identity, exact treasury amount and owned change',async()=>{
 const f=fixture(),a=await f.start(),p=await f.purchase(a),options={source:addresses[1],destination:addresses[0],amountSompi:p.prepared.payment.amountSompi,entries:f.playerEntries,feeRate:100};
 assert.doesNotThrow(()=>validateV5Payment(sdk,copy(p.transaction),options));
 for(const mutate of [tx=>tx.outputs[0].scriptPublicKey=sdk.payToAddressScript(keys[2].toAddress('testnet-10')),tx=>tx.outputs[1].scriptPublicKey=sdk.payToAddressScript(keys[2].toAddress('testnet-10')),tx=>{tx.outputs[0].value--;tx.outputs[1].value++;},tx=>tx.inputs[0].signatureScript='',tx=>tx.inputs[0].sequence=1n,tx=>tx.payload='aa',tx=>tx.storageMass++]){
  const tx=copy(p.transaction);mutate(tx);const result=await f.call('payment',{...p.body,transaction:tx.serializeToSafeJSON()});assert.equal(result.status,400);assert.equal(f.records.get('v5:payment:'+p.prepared.payment.id).transactionId,null);
 }
 assert.throws(()=>validateV5Payment(sdk,copy(p.transaction),{...options,entries:[entry(2,2)]}),/player-owned/);
 assert.throws(()=>validateV5Payment(sdk,copy(p.transaction),{...options,entries:[entry(1,2,10000000001n)]}),/metadata/);
});

test('V5 reward is durably journaled under the shared faucet lock and applied once after acceptance',async()=>{
 const f=fixture(),a=await f.start();await f.readyOrder(a);
 const first=await f.action(a,'delivery','deliver_order',{orderId:'first-harvest'});assert.equal(first.status,202,first.error);assert.equal(first.state.statistics.deliveries,0);assert.equal(first.state.resources.crops,3);assert.equal(f.submissions.length,1);assert.equal(f.records.get('state').pending.purpose,'v5-reward');
 const repeat=await f.action(a,'delivery','deliver_order',{orderId:'first-harvest'});assert.equal(repeat.payment.transactionId,first.payment.transactionId);assert.equal(f.submissions.length,1);
 f.accepted.add(first.payment.transactionId);const done=await f.call('status',f.auth(a));assert.equal(done.status,200,done.error);assert.equal(done.state.statistics.deliveries,1);assert.equal(done.state.resources.crops,0);assert.equal(done.payment.amountSompi,'25000000');assert.equal(f.records.get('state').pending,null);
 const duplicate=await f.call('payment',{...f.auth(a),paymentId:first.payment.id});assert.equal(duplicate.state.statistics.deliveries,1);assert.equal(f.submissions.length,1);assert.equal(f.records.get('v5:budget').reservedSompi,'25000000');
});

test('V5 uncertain reward retries only identical signed bytes and never reserves a second payout',async()=>{
 const f=fixture({uncertain:true}),a=await f.start();await f.readyOrder(a);const first=await f.action(a,'delivery','deliver_order',{orderId:'first-harvest'});assert.equal(first.status,202);
 for(let i=0;i<4;i++){f.advance(16000);const checked=await f.call('payment',{...f.auth(a),paymentId:first.payment.id});assert.equal(checked.status,202);assert.equal(checked.state.statistics.deliveries,0);}
 assert.equal(f.submissions.length,3);assert.equal(new Set(f.submissions).size,1);assert.equal(f.records.get('v5:budget').reservedSompi,'25000000');assert.equal(f.records.get('state').pending.transactionId,first.payment.transactionId);
});

test('V5 budgets and an existing faucet payment block payouts without consuming crops',async()=>{
 for(const override of [{V5_PLAYER_DAILY_REWARD_SOMPI:'24999999'},{V5_TOTAL_REWARD_SOMPI:'24999999'},{}]){
  const f=fixture(override),a=await f.start();await f.readyOrder(a);if(!Object.keys(override).length)await f.storage.put({state:{address:addresses[0],claims:5,pending:{transactionId:'ef'.repeat(32)}}});
  const r=await f.action(a,'delivery','deliver_order',{orderId:'first-harvest'});assert([429,503].includes(r.status));assert.equal(f.submissions.length,0);assert.equal(f.records.get('v5:player:'+a.playerId).game.resources.crops,3);assert.equal(f.records.get('v5:player:'+a.playerId).pendingPayment,null);
 }
});

test('V5 payment IDs and transaction IDs cannot be reassigned between players',async()=>{
 const f=fixture(),a=await f.start(),b=await f.start(2),p=await f.purchase(a);
 assert.equal((await f.call('payment',{...f.auth(b),paymentId:p.prepared.payment.id,transaction:p.body.transaction})).status,404);
 await f.storage.put({['v5:transaction:'+p.transaction.id]:'another-payment'});assert.equal((await f.call('payment',p.body)).status,409);assert.equal(f.records.get('v5:player:'+a.playerId).game.upgrades.plots,0);
});

test('Argent market journals genesis and bilateral trade, requires owner signature, commits only accepted outputs',async()=>{
 const templates=JSON.parse(readFileSync(new URL('../src/v5-argent-templates.json',import.meta.url))),f=fixture({argentTemplates:templates}),a=await f.start();
 const proposed=await f.action(a,'market-offer','market_propose',{to:'nell',give:{crops:2},want:{bread:1}});assert.equal(proposed.status,200,proposed.error);
 let r=await f.action(a,'market-accept','market_accept',{tradeId:proposed.marketAction.id});assert.equal(r.status,202,r.error);assert.equal(r.payment.marketPlan.operation,'genesis');assert.equal(r.market.actors[a.playerId].inventory.crops,6);
 for(let i=0;i<2;i++){assert.equal(r.payment.marketPlan.operation,'genesis');f.accepted.add(r.payment.transactionId);r=await f.call('status',f.auth(a));assert.equal(r.status,202,r.error);}
 assert.equal(r.payment.marketPlan.operation,'trade');assert.equal(r.payment.status,'awaiting-signature');assert.equal(f.submissions.length,2);assert.equal(r.market.actors[a.playerId].inventory.crops,6);
 const {deriveV5ArgentPlan}=await import('../src/v5-argent-protocol.mjs');const w=r.payment.marketPlan,plan=deriveV5ArgentPlan(sdk,{templates,journal:w.wire,issuer:w.issuer,world:w.world});
 const signatures=w.requiredSignatures.map(s=>({...s,signature:sdk.createInputSignature(plan.transaction,s.inputIndex,keys[1])})).map(({owner,...s})=>s);
 assert.equal((await f.call('payment',{...f.auth(a),paymentId:r.payment.id,signatures:[{inputIndex:9,signatureIndex:0,signature:'aa'}]})).status,400);
 r=await f.call('payment',{...f.auth(a),paymentId:r.payment.id,signatures});assert.equal(r.status,202,r.error);assert.equal(f.submissions.length,3);assert.equal(r.market.actors[a.playerId].inventory.crops,6);
 f.accepted.add(r.payment.transactionId);r=await f.call('status',f.auth(a));assert.equal(r.status,200,r.error);assert.equal(r.market.actors[a.playerId].inventory.crops,4);assert.equal(r.market.actors[a.playerId].inventory.bread,3);assert.equal(f.records.get('state').pending,null);
 const again=await f.call('payment',{...f.auth(a),paymentId:r.payment.id});assert.equal(again.market.actors[a.playerId].inventory.crops,4);assert.equal(f.submissions.length,3);
});

test('native market buy transfers exact contract-held coins for reserved resources and retains phase receipts',async()=>{
 const templates=JSON.parse(readFileSync(new URL('../src/v5-argent-templates.json',import.meta.url))),f=fixture({argentTemplates:templates}),a=await f.start();
 assert.equal((await f.action(a,'cheap','market_buy',{to:'nell',resource:'bread',amount:1,maxTotalSompi:'1'})).status,400);
 let r=await f.action(a,'buy-bread','market_buy',{to:'nell',resource:'bread',amount:1,maxTotalSompi:'2000000'});assert.equal(r.status,202,r.error);
 const {deriveV5ArgentPlan}=await import('../src/v5-argent-protocol.mjs');for(let phase=0;phase<5&&r.payment?.status!=='accepted';phase++){
  if(r.payment.transactionId){f.accepted.add(r.payment.transactionId);r=await f.call('status',f.auth(a));}
  else {const w=r.payment.marketPlan,p=deriveV5ArgentPlan(sdk,{templates,journal:w.wire,issuer:w.issuer,world:w.world});assert.equal(w.operation,'trade');assert.equal(p.transaction.outputs[0].value,98000000n);assert.equal(p.transaction.outputs[1].value,102000000n);const signatures=w.requiredSignatures.map(({inputIndex,signatureIndex})=>({inputIndex,signatureIndex,signature:sdk.createInputSignature(p.transaction,inputIndex,keys[1])}));r=await f.call('payment',{...f.auth(a),paymentId:r.payment.id,signatures});}
  assert.ok([200,202].includes(r.status),r.error);
 }
 assert.equal(r.payment.status,'accepted');assert.equal(r.market.actors[a.playerId].inventory.bread,3);assert.equal(r.market.cells[a.playerId].nativeSompi,'98000000');assert.deepEqual(r.marketReceipts.map(x=>x.operation),['genesis','genesis','trade']);assert.equal((await f.call('state',f.auth(a))).marketReceipts.length,3);assert.equal(r.marketReceipts.at(-1).nativePurchaseSompi,'2000000');assert.equal(r.marketReceipts.at(-1).delegatedPlayerTrade,false);assert.ok(r.marketReceipts.every(receipt=>receipt.kind==='market'));assert.equal(r.marketReceipts[0].nativePurchaseSompi,'0');
});

test('accepted bounded mandate lets host sign only permitted assistant resource trades',async()=>{
 const templates=JSON.parse(readFileSync(new URL('../src/v5-argent-templates.json',import.meta.url))),f=fixture({argentTemplates:templates}),a=await f.start();const {deriveV5ArgentPlan}=await import('../src/v5-argent-protocol.mjs');
 const finish=async r=>{for(let i=0;i<8&&r.payment?.status!=='accepted';i++){if(r.payment.transactionId){f.accepted.add(r.payment.transactionId);r=await f.call('status',f.auth(a));}else{const w=r.payment.marketPlan,p=deriveV5ArgentPlan(sdk,{templates,journal:w.wire,issuer:w.issuer,world:w.world});r=await f.call('payment',{...f.auth(a),paymentId:r.payment.id,signatures:w.requiredSignatures.map(({inputIndex,signatureIndex})=>({inputIndex,signatureIndex,signature:sdk.createInputSignature(p.transaction,inputIndex,keys[1])}))});}assert.ok([200,202].includes(r.status),r.error);}return r;};
 let r=await f.action(a,'mandate','market_assistant',{enabled:true,maxTradesPerTick:1,maxGive:{crops:2}});r=await finish(r);assert.equal(r.payment.marketPlan.operation,'configure');const cell=f.records.get('v5:market-cell:'+a.playerId);assert.equal(cell.state.allow_crops,2);assert.equal(cell.state.allow_coin,0);assert.equal(r.marketReceipts.at(-1).configureEnabled,true);assert.equal(r.marketReceipts.at(-1).configureRevoked,false);
 f.advance(10000);await f.call('state',f.auth(a));r=await f.call('state',f.auth(a));assert.equal(r.status,202,r.error);r=await finish(r);assert.equal(r.payment.marketPlan.operation,'trade');assert.equal(r.payment.marketPlan.requiredSignatures.length,0,'Accepted bounded operator signs without owner again');assert.ok(f.records.get('v5:market-cell:'+a.playerId).state.allow_crops<2);assert.ok(r.market.assistant.spent.crops<=2);const delegatedReceipt=r.marketReceipts.at(-1);assert.equal(delegatedReceipt.delegatedPlayerTrade,true);assert.equal(delegatedReceipt.nativePurchaseSompi,'0');f.advance(1);r=await f.action(a,'revoke-mandate','market_assistant',{enabled:false,maxTradesPerTick:1,maxGive:{crops:0}});r=await finish(r);assert.equal(r.marketReceipts.at(-1).configureRevoked,true);assert.equal(r.marketReceipts.at(-1).configureEnabled,false);assert.ok(r.marketReceipts.at(-1).at>delegatedReceipt.at);
});

test('accepted assistant revocation releases only marked automatic reservations without a saved payment',async()=>{
 const templates=JSON.parse(readFileSync(new URL('../src/v5-argent-templates.json',import.meta.url))),f=fixture({argentTemplates:templates}),a=await f.start(),player=f.records.get('v5:player:'+a.playerId),market=await f.service.market.load();
 market.assistant.enabled=false;market.assistants[a.playerId]={enabled:true};
 market.trades['auto-stale']={id:'auto-stale',from:a.playerId,to:'nell',give:{crops:1},want:{bread:1},status:'prepared',delegated:true,requiresReceipt:true};
 market.trades['auto-pending']={id:'auto-pending',from:a.playerId,to:'nell',give:{crops:1},want:{bread:1},status:'prepared',delegated:true,requiresReceipt:true,paymentId:'auto-payment'};
 delete market.reserved;
 await f.storage.put({'v5-market-world':market,['v5:payment:auto-payment']:{id:'auto-payment',kind:'market',status:'submitted',continuation:{tradeId:'auto-pending'}}});
 assert.equal(await f.service.cancelRevokedAssistantReservations(player),null);
 market.assistants[a.playerId].enabled=false;await f.storage.put({'v5-market-world':market});
 const cleaned=await f.service.cancelRevokedAssistantReservations(player);
 assert.equal(cleaned.trades['auto-stale'].status,'cancelled');
 assert.equal(cleaned.trades['auto-pending'].status,'prepared');
 assert.equal(cleaned.reserved[a.playerId].crops,1);
 assert.equal(cleaned.reserved.nell.bread,1);
});

test('accepted assistant revocation clears a stale automatic reservation before recovery can submit it',async()=>{
 const templates=JSON.parse(readFileSync(new URL('../src/v5-argent-templates.json',import.meta.url))),f=fixture({argentTemplates:templates}),a=await f.start();const finish=async r=>{for(let i=0;i<8&&r.payment?.status!=='accepted';i++){if(r.payment.transactionId){f.accepted.add(r.payment.transactionId);r=await f.call('status',f.auth(a));}else{const w=r.payment.marketPlan,p=(await import('../src/v5-argent-protocol.mjs')).deriveV5ArgentPlan(sdk,{templates,journal:w.wire,issuer:w.issuer,world:w.world});r=await f.call('payment',{...f.auth(a),paymentId:r.payment.id,signatures:w.requiredSignatures.map(({inputIndex,signatureIndex})=>({inputIndex,signatureIndex,signature:sdk.createInputSignature(p.transaction,inputIndex,keys[1])}))});}assert.ok([200,202].includes(r.status),r.error);}return r;};
 let r=await f.action(a,'enable','market_assistant',{enabled:true,maxTradesPerTick:1,maxGive:{crops:2}});r=await finish(r);assert.equal(r.marketReceipts.at(-1).configureEnabled,true);f.advance(10000);
 await f.call('state',f.auth(a));const getSink=f.rpc.getSink;f.rpc.getSink=async()=>{throw Error('temporary RPC failure');};r=await f.call('state',f.auth(a));assert.equal(r.status,503);f.rpc.getSink=getSink;
 let market=await f.service.market.load(),stale=Object.values(market.trades).find(t=>t.status==='prepared'&&t.delegated===true);assert.ok(stale,'assistant left a marked reservation before automatic recovery');
 r=await f.action(a,'disable','market_assistant',{enabled:false,maxTradesPerTick:1,maxGive:{crops:0}});r=await finish(r);assert.equal(r.marketReceipts.at(-1).configureRevoked,true);
 market=await f.service.market.load();assert.equal(market.trades[stale.id].status,'cancelled');assert.equal((await f.service.market.pending()).some(t=>t.id===stale.id),false);
});

test('native insufficient funds fails before reserving trade or creating treasury payment',async()=>{
 const templates=JSON.parse(readFileSync(new URL('../src/v5-argent-templates.json',import.meta.url))),f=fixture({argentTemplates:templates}),a=await f.start();
 await f.storage.put({['v5:market-cell:'+a.playerId]:{state:{},utxo:{amount:'10000001',outpoint:{transactionId:'ee'.repeat(32),index:0}},transactionId:'ee'.repeat(32)}});
 const r=await f.action(a,'too-costly','market_buy',{to:'nell',resource:'bread',amount:1,maxTotalSompi:'2000000'});assert.equal(r.status,400);assert.match(r.error,/more native/);assert.equal((await f.service.market.pending()).length,0);assert.equal(f.records.get('v5:player:'+a.playerId).pendingPayment,null);assert.equal(f.submissions.length,0);
});

test('paused service can record acceptance but never starts next phase or sends a signature request',async()=>{
 const templates=JSON.parse(readFileSync(new URL('../src/v5-argent-templates.json',import.meta.url))),f=fixture({argentTemplates:templates}),a=await f.start();let r=await f.action(a,'buy','market_buy',{to:'nell',resource:'bread',amount:1,maxTotalSompi:'2000000'});assert.equal(f.submissions.length,1);f.service.env.V5_ENABLED='false';f.accepted.add(r.payment.transactionId);r=await f.call('status',f.auth(a));assert.equal(r.status,200,r.error);assert.equal(f.submissions.length,1);assert.ok(f.records.get('v5:player:'+a.playerId).marketContinuation);await f.call('state',f.auth(a));assert.equal(f.submissions.length,1);f.service.env.V5_ENABLED='true';r=await f.call('status',f.auth(a));assert.equal(f.submissions.length,2);f.accepted.add(r.payment.transactionId);r=await f.call('status',f.auth(a));assert.equal(r.payment.status,'awaiting-signature');f.service.env.V5_ENABLED='false';const rejected=await f.call('payment',{...f.auth(a),paymentId:r.payment.id,signatures:[]});assert.equal(rejected.status,503);assert.equal(f.submissions.length,2);
});

test('explicit node signature rejection journals failure and permits correction without automatic replay',async()=>{
 const templates=JSON.parse(readFileSync(new URL('../src/v5-argent-templates.json',import.meta.url))),f=fixture({argentTemplates:templates}),a=await f.start();let r=await f.action(a,'buy','market_buy',{to:'nell',resource:'bread',amount:1,maxTotalSompi:'2000000'});for(let i=0;i<2;i++){f.accepted.add(r.payment.transactionId);r=await f.call('status',f.auth(a));}const {deriveV5ArgentPlan}=await import('../src/v5-argent-protocol.mjs'),w=r.payment.marketPlan,p=deriveV5ArgentPlan(sdk,{templates,journal:w.wire,issuer:w.issuer,world:w.world}),body={...f.auth(a),paymentId:r.payment.id,signatures:w.requiredSignatures.map(({inputIndex,signatureIndex})=>({inputIndex,signatureIndex,signature:sdk.createInputSignature(p.transaction,inputIndex,keys[1])}))};
 const submit=f.rpc.submitTransaction;let rejectedCalls=0;f.rpc.submitTransaction=async()=>{rejectedCalls++;throw Error('signature invalid');};r=await f.call('payment',body);assert.equal(r.payment.status,'awaiting-signature');assert.equal(r.payment.transactionId,null);assert.ok(f.records.get('v5:market-rejected:'+r.payment.id+':0').transaction);f.advance(60000);await f.call('status',f.auth(a));assert.equal(rejectedCalls,1);f.rpc.submitTransaction=submit;r=await f.call('payment',body);assert.equal(r.payment.status,'submitted');assert.equal(f.submissions.length,3);assert.equal(r.market.actors[a.playerId].inventory.bread,2);
});

test('business top-up spends observed owner wallet amount plus bounded fee and preserves resource policy',async()=>{
 const templates=JSON.parse(readFileSync(new URL('../src/v5-argent-templates.json',import.meta.url))),f=fixture({argentTemplates:templates}),a=await f.start();let r=await f.action(a,'fund-business','market_fund',{amountSompi:'25000000'});assert.equal(r.payment.marketPlan.operation,'genesis');f.accepted.add(r.payment.transactionId);r=await f.call('status',f.auth(a));assert.equal(r.status,202,r.error);assert.equal(r.payment.status,'awaiting-signature');assert.equal(r.payment.marketPlan.operation,'fund');const w=r.payment.marketPlan,{deriveV5ArgentPlan}=await import('../src/v5-argent-protocol.mjs'),p=deriveV5ArgentPlan(sdk,{templates,journal:w.wire,issuer:w.issuer,world:w.world});assert.equal(w.economicReview.maxFeeSompi,'5000000');assert.ok(BigInt(w.feeSompi)>1000000n&&BigInt(w.feeSompi)<=5000000n);assert.equal(p.transaction.outputs[0].value-p.transaction.inputs[0].utxo.amount,25000000n);assert.equal(p.transaction.inputs[1].utxo.entry.scriptPublicKey.script,sdk.payToAddressScript(keys[1].toAddress('testnet-10')).script);assert.equal(p.states[0].crops,p.inputStates[0].crops);assert.equal(p.states[0].allow_crops,p.inputStates[0].allow_crops);
 const signatures=w.requiredSignatures.map(({inputIndex,signatureIndex})=>({inputIndex,signatureIndex,signature:sdk.createInputSignature(p.transaction,inputIndex,keys[1])}));r=await f.call('payment',{...f.auth(a),paymentId:r.payment.id,signatures});assert.equal(r.status,202,r.error);assert.equal(r.market.cells[a.playerId].nativeSompi,'100000000');f.accepted.add(r.payment.transactionId);r=await f.call('status',f.auth(a));assert.equal(r.market.cells[a.playerId].nativeSompi,'125000000');const count=f.submissions.length;const repeated=await f.action(a,'fund-business','market_fund',{amountSompi:'25000000'});assert.equal(repeated.payment.id,r.payment.id);assert.equal(f.submissions.length,count);assert.equal((await f.action(a,'fund-business','market_fund',{amountSompi:'30000000'})).status,409);assert.equal(r.marketReceipts.at(-1).fundAmountSompi,'25000000');const old=f.records.get('v5:market-receipts:'+a.playerId);for(const receipt of old)for(const field of ['kind','delegatedPlayerTrade','configureEnabled','configureRevoked','nativePurchaseSompi','fundAmountSompi'])delete receipt[field];f.records.set('v5:market-receipts:'+a.playerId,old);const restored=await f.call('state',f.auth(a));assert.equal(restored.marketReceipts.at(-1).fundAmountSompi,'25000000');assert.equal(restored.marketReceipts.at(-1).kind,'market');
});

test('unsubmitted fund quote can cancel without blocking later actions; cancelled quote cannot submit',async()=>{
 const templates=JSON.parse(readFileSync(new URL('../src/v5-argent-templates.json',import.meta.url))),f=fixture({argentTemplates:templates}),a=await f.start();let r=await f.action(a,'fund-quote','market_fund',{amountSompi:'25000000'});f.accepted.add(r.payment.transactionId);r=await f.call('status',f.auth(a));const paymentId=r.payment.id;assert.equal(r.payment.quoteCancellable,true);assert.ok(r.payment.marketPlan.wire.signatures.flat().every(s=>s===null));const before=f.submissions.length;
 r=await f.action(a,'cancel-quote','market_cancel_quote',{paymentId});assert.equal(r.status,200,r.error);assert.equal(r.payment.status,'cancelled');assert.equal(f.records.get('state').pending,null);assert.equal(f.records.get('v5:player:'+a.playerId).pendingPayment,null);assert.equal(f.submissions.length,before);assert.equal((await f.call('payment',{...f.auth(a),paymentId,signatures:[]})).status,409);assert.equal((await f.action(a,'cancel-again','market_cancel_quote',{paymentId})).status,200);const next=await f.action(a,'new-fund-quote','market_fund',{amountSompi:'25000000'});assert.equal(next.payment.status,'awaiting-signature');assert.equal(f.submissions.length,before);
});

test('trade quote withholds host signatures and cancellation releases reserved game goods',async()=>{
 const templates=JSON.parse(readFileSync(new URL('../src/v5-argent-templates.json',import.meta.url))),f=fixture({argentTemplates:templates}),a=await f.start();let r=await f.action(a,'buy','market_buy',{to:'nell',resource:'bread',amount:1,maxTotalSompi:'2000000'});for(let i=0;i<2;i++){f.accepted.add(r.payment.transactionId);r=await f.call('status',f.auth(a));}assert.equal(r.payment.marketPlan.operation,'trade');assert.equal(r.payment.marketPlan.requiredSignatures.length,1);assert.equal(r.payment.marketPlan.wire.signatures.flat().filter(s=>s===null).length,3);const tradeId=r.payment.marketPlan.tradeId;assert.equal(r.payment.quoteCancellable,true);r=await f.action(a,'cancel-trade','market_cancel_quote',{paymentId:r.payment.id});assert.equal(r.market.trades[tradeId].status,'cancelled');assert.equal((await f.service.market.load()).reserved.nell.bread,0);assert.equal(r.market.actors[a.playerId].inventory.bread,2);assert.equal(f.submissions.length,2);
});

test('saved submitted transaction cannot be cancelled even before acceptance',async()=>{
 const templates=JSON.parse(readFileSync(new URL('../src/v5-argent-templates.json',import.meta.url))),f=fixture({argentTemplates:templates}),a=await f.start();const r=await f.action(a,'fund','market_fund',{amountSompi:'25000000'});assert.equal(r.payment.quoteCancellable,false);const rejected=await f.action(a,'cancel','market_cancel_quote',{paymentId:r.payment.id});assert.equal(rejected.status,409);assert.equal(f.records.get('state').pending.id,r.payment.id);assert.equal(f.submissions.length,1);
});

test('accepted material transfers apply care and construction once without debiting farm stock',async()=>{
 const templates=JSON.parse(readFileSync(new URL('../src/v5-argent-templates.json',import.meta.url))),{deriveV5ArgentPlan}=await import('../src/v5-argent-protocol.mjs');
 for(const [purpose,requires,recipient]of [['feed_habitat',{crops:3},'habitat-keeper'],['build_workshop',{wood:2,ore:1,tools:1},'town-builder'],['expand_greenhouse',{wood:3,tools:2},'town-builder']]){
  const f=fixture({argentTemplates:templates}),a=await f.start();if(purpose==='expand_greenhouse')await f.service.market.deposit({playerId:a.playerId,sourceId:'fixture-materials',inventory:{wood:1,tools:1}});const before=(await f.service.market.view(a.playerId)).actors[a.playerId].inventory;let r=await f.action(a,'use-materials','market_use',{purpose});assert.equal(r.status,202,r.error);const initialGame=r.state;
  for(let phase=0;phase<5&&r.payment.status!=='accepted';phase++){
   if(r.payment.transactionId){f.accepted.add(r.payment.transactionId);r=await f.call('status',f.auth(a));}
   else {const w=r.payment.marketPlan,p=deriveV5ArgentPlan(sdk,{templates,journal:w.wire,issuer:w.issuer,world:w.world});assert.deepEqual(w.economicReview.use,{purpose,requires,recipientId:recipient});assert.deepEqual(w.economicReview.trade.want,{});assert.equal(w.economicReview.coinDelta,0);for(const[k,n]of Object.entries(requires)){assert.equal(p.states[0][k],p.inputStates[0][k]-n);assert.equal(p.states[1][k],p.inputStates[1][k]+n);}assert.equal(p.transaction.outputs[0].value,p.transaction.inputs[0].utxo.amount);const signatures=w.requiredSignatures.map(({inputIndex,signatureIndex})=>({inputIndex,signatureIndex,signature:sdk.createInputSignature(p.transaction,inputIndex,keys[1])}));r=await f.call('payment',{...f.auth(a),paymentId:r.payment.id,signatures});assert.equal(r.state.upgrades.workshop,initialGame.upgrades.workshop);assert.equal(r.state.habitat?.careCount||0,initialGame.habitat?.careCount||0);}
   assert.ok([200,202].includes(r.status),r.error);
  }
  assert.equal(r.payment.status,'accepted');for(const[k,n]of Object.entries(requires)){assert.equal(r.market.actors[a.playerId].inventory[k],before[k]-n);assert.equal(r.market.actors[recipient].inventory[k],n);}assert.deepEqual(r.state.resources,initialGame.resources);
  if(purpose==='feed_habitat'){assert.equal(r.state.habitat.food,3);assert.equal(r.state.habitat.careCount,1);}else assert.equal(r.state.upgrades[purpose==='build_workshop'?'workshop':'plots'],1);
  const count=f.submissions.length,again=await f.action(a,'use-materials','market_use',{purpose});assert.equal(again.status,200,again.error);assert.equal(f.submissions.length,count);assert.deepEqual(again.state.marketUseActions,r.state.marketUseActions);assert.equal(again.marketReceipts.at(-1).purpose,purpose);
 }
});

test('market action replay reflects settled or cancelled state instead of cached preparation',async()=>{
 const f=fixture(),a=await f.start();const action={id:'replay-buy',type:'market_buy',to:'nell',resource:'bread',amount:1,maxTotalSompi:'2000000'};const first=await f.service.market.action(a.playerId,action);await f.service.market.settle({tradeId:first.result.id,verifiedReceipt:'fe'.repeat(32)});const replay=await f.service.market.action(a.playerId,action);assert.equal(replay.result.status,'settled');assert.equal(replay.market.actors[a.playerId].inventory.bread,3);assert.equal(replay.market.trades[first.result.id].status,'settled');const proposal={id:'replay-propose',type:'market_propose',to:'nell',give:{crops:1},want:{bread:1}},offered=await f.service.market.action(a.playerId,proposal);await f.service.market.action(a.playerId,{id:'cancel-offer',type:'market_cancel',tradeId:offered.result.id});assert.equal((await f.service.market.action(a.playerId,proposal)).result.status,'cancelled');
});

test('keeper and builder inventories cannot be withdrawn through ordinary barter',async()=>{
 const f=fixture(),a=await f.start(),quote={purpose:'feed_habitat',requires:{crops:3},recipientId:'habitat-keeper'};const prepared=await f.service.market.prepareUse(a.playerId,{action:{id:'care',type:'market_use',purpose:'feed_habitat'},quote});await f.service.market.settle({tradeId:prepared.result.id,verifiedReceipt:'fa'.repeat(32)});const before=await f.service.market.load();assert.equal(before.actors['habitat-keeper'].inventory.crops,3);
 const response=await f.action(a,'take-back','market_propose',{to:'habitat-keeper',give:{wood:3},want:{crops:3}});assert.equal(response.status,400);assert.match(response.error,/cannot be traded back/);assert.equal((await f.service.market.load()).actors['habitat-keeper'].inventory.crops,3);
});

test('material reservation recovery and exact recipe validation prevent duplicate spending',async()=>{
 const f=fixture(),a=await f.start(),quote={purpose:'feed_habitat',requires:{crops:3},recipientId:'habitat-keeper'};await f.service.market.prepareUse(a.playerId,{action:{id:'care-a',type:'market_use',purpose:'feed_habitat'},quote});const saved=f.records.get('v5-market-world');saved.reserved={};saved.actors[a.playerId].inventory.crops=3;f.records.set('v5-market-world',saved);assert.equal((await f.service.market.load()).reserved[a.playerId].crops,3);await assert.rejects(()=>f.service.market.prepareUse(a.playerId,{action:{id:'care-b',type:'market_use',purpose:'feed_habitat'},quote}),/required materials/);await assert.rejects(()=>f.service.market.prepareUse(a.playerId,{action:{id:'wrong-cost',type:'market_use',purpose:'feed_habitat'},quote:{...quote,requires:{crops:1}}}),/Invalid purpose quote/);assert.equal((await f.service.market.pending()).length,1);
});

test('orphan material reservation recovers original action after RPC failure and applies accepted care once',async()=>{
 const templates=JSON.parse(readFileSync(new URL('../src/v5-argent-templates.json',import.meta.url))),f=fixture({argentTemplates:templates}),a=await f.start(),action={id:'recover-care',type:'market_use',purpose:'feed_habitat'};const sink=f.rpc.getSink;f.rpc.getSink=async()=>{throw Error('temporary RPC failure');};let r=await f.call('action',{...f.auth(a),action});assert.equal(r.status,503);assert.equal(f.records.get('v5:player:'+a.playerId).pendingPayment,null);const pending=await f.service.market.pending();assert.equal(pending.length,1);assert.equal(pending[0].useActionId,action.id);assert.equal(f.submissions.length,0);
 f.rpc.getSink=sink;r=await f.call('state',f.auth(a));assert.equal(r.status,202,r.error);assert.deepEqual(f.records.get('v5:payment:'+r.payment.id).continuation.action,action);const {deriveV5ArgentPlan}=await import('../src/v5-argent-protocol.mjs');
 for(let i=0;i<6&&r.payment.status!=='accepted';i++){if(r.payment.transactionId){f.accepted.add(r.payment.transactionId);r=await f.call('status',f.auth(a));}else{const w=r.payment.marketPlan,p=deriveV5ArgentPlan(sdk,{templates,journal:w.wire,issuer:w.issuer,world:w.world});assert.deepEqual(f.records.get('v5:payment:'+r.payment.id).continuation.action,action);r=await f.call('payment',{...f.auth(a),paymentId:r.payment.id,signatures:w.requiredSignatures.map(({inputIndex,signatureIndex})=>({inputIndex,signatureIndex,signature:sdk.createInputSignature(p.transaction,inputIndex,keys[1])}))});assert.equal(r.state.habitat?.careCount||0,0);}assert.ok([200,202].includes(r.status),r.error);}
 assert.equal(r.payment.status,'accepted');assert.equal(r.state.habitat.careCount,1);assert.equal(r.state.habitat.food,3);assert.equal(r.market.actors[a.playerId].inventory.crops,3);assert.equal(r.state.marketUseActions[action.id].purpose,action.purpose);const submissions=f.submissions.length;const reload=await f.call('state',f.auth(a));assert.equal(reload.state.habitat.careCount,1);assert.equal(reload.market.actors[a.playerId].inventory.crops,3);assert.equal((await f.call('action',{...f.auth(a),action})).status,200);assert.equal(f.submissions.length,submissions);
});

test('accepted story milestones remain available beyond the recent receipt window',async()=>{
 const f=fixture(),a=await f.start(),receipts=Array.from({length:120},(_,i)=>({paymentId:'phase-'+i,transactionId:i.toString(16).padStart(64,'0'),acceptingBlock:'ab'.repeat(32),at:i,kind:'market',operation:'trade',delegatedPlayerTrade:i===1,configureEnabled:i===0,configureRevoked:i===4,nativePurchaseSompi:i===2?'2000000':'0',fundAmountSompi:i===3?'25000000':'0'}));await f.storage.put({['v5:market-receipts:'+a.playerId]:receipts});const history=await f.service.marketReceiptHistory(f.records.get('v5:player:'+a.playerId));assert.equal(history.length,105);for(let i=0;i<5;i++)assert.ok(history.some(r=>r.paymentId==='phase-'+i));assert.equal(history.at(-1).paymentId,'phase-119');
});
