import {V5AdvancedService} from './v5-advanced-service.mjs';
// Authoritative V5 state and native Testnet-10 payments. Runs only inside the
// existing serialized FaucetWallet Durable Object; it never holds a second key.
import {NETWORK,MAX_FEE,publicAddress} from './policy.mjs';
import {publicTransactionMass} from '../src/public-contracts.mjs';
import {observePublicAcceptance} from '../src/public-acceptance.mjs';
import {createGame,projectGame,applyGameAction,quoteGameAction,getGameView,quoteMarketUse,applyMarketUse} from '../src/v5-economy.mjs';
import {V5_ARGENT_RESOURCES,v5ArgentInitialState,instantiateV5Argent,buildV5ArgentGenesis,buildV5ArgentTrade,buildV5ArgentConfigure,buildV5ArgentRestock,buildV5ArgentFund,signV5ArgentPlan,v5ArgentJournal,v5ArgentCertificateDigest,v5ArgentWirePlan,deriveV5ArgentPlan} from '../src/v5-argent-protocol.mjs';
import {V5MarketService} from './v5-market-service.mjs';

const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const only=(value,keys)=>{if(!value||Array.isArray(value)||typeof value!=='object'||Object.keys(value).some(key=>!keys.includes(key)))fail('Unexpected request fields.');return value;};
const hex=/^[0-9a-f]{64}$/;
const bytes=value=>new TextEncoder().encode(value);
const toHex=value=>Array.from(new Uint8Array(value),n=>n.toString(16).padStart(2,'0')).join('');
const hash=async value=>toHex(await crypto.subtle.digest('SHA-256',bytes(value)));
const idOf=input=>`${input.transactionId}:${input.index}`;
const scriptOf=value=>value.entry?.scriptPublicKey||value.scriptPublicKey;
const amountOf=value=>BigInt(value.amount);
const storedEntry=entry=>({outpoint:{transactionId:entry.outpoint.transactionId,index:entry.outpoint.index},amount:String(entry.amount),scriptPublicKey:{version:scriptOf(entry).version,script:scriptOf(entry).script},covenantId:entry.entry?.covenantId||null});
const capValue=(value,fallback,maximum)=>{try{const n=BigInt(value??fallback);return n>=0n&&n<=maximum?n:BigInt(fallback);}catch{return BigInt(fallback);}};

export const v5SessionMessage=(address,nonce)=>`Kaspa Explained V5 session\nTestnet-10\n${address}\n${nonce}`;

// Supplied UTXO metadata is never trusted: inputs must match the server's node
// snapshot taken before this payment, and all output value stays with the two
// reviewed addresses. The finalized transaction ID is then checked on the node.
export function validateV5Payment(sdk,tx,{source,destination,amountSompi,entries,feeRate=100}){
 publicAddress(sdk,source);publicAddress(sdk,destination);
 const own=sdk.payToAddressScript(new sdk.Address(source)),recipient=sdk.payToAddressScript(new sdk.Address(destination));
 if(source===destination||BigInt(amountSompi)<=0n)fail('Invalid payment destination or amount.');
 if(tx.version!==1||tx.lockTime!==0n||tx.subnetworkId!=='00'.repeat(20)||tx.gas!==0n||tx.payload!=='')fail('Unexpected transaction envelope.');
 if(tx.inputs.length<1||tx.inputs.length>8||tx.outputs.length!==2)fail('Use one payment output and your own change.');
 const known=new Map(entries.map(entry=>[idOf(entry.outpoint),entry])),used=new Set();let total=0n;
 for(const input of tx.inputs){
  const id=idOf(input.previousOutpoint),entry=known.get(id),metadata=input.utxo;
  if(!entry||used.has(id)||entry.covenantId||entry.entry?.covenantId||scriptOf(entry).version!==0||scriptOf(entry).script!==own.script||amountOf(entry)<=0n)fail('Payment input is not an observed player-owned output.');
  if(!metadata||idOf(metadata.outpoint)!==id||BigInt(metadata.amount)!==amountOf(entry)||metadata.entry?.covenantId||scriptOf(metadata).version!==0||scriptOf(metadata).script!==own.script)fail('Payment input metadata changed.');
  if(input.sequence!==0n||input.computeBudget!==16||!/^41[0-9a-f]{128}01$/i.test(input.signatureScript))fail('Use standard signed payment inputs.');
  used.add(id);total+=amountOf(entry);
 }
 const [payment,change]=tx.outputs;
 if(payment.value!==BigInt(amountSompi)||payment.scriptPublicKey.version!==0||payment.scriptPublicKey.script!==recipient.script||payment.covenant)fail('Payment amount or destination changed.');
 if(change.value<=0n||change.scriptPublicKey.version!==0||change.scriptPublicKey.script!==own.script||change.covenant)fail('Change must return to the paying wallet.');
 const fee=total-payment.value-change.value,mass=publicTransactionMass(tx,{feeRate});
 if(fee<0n||fee>MAX_FEE||fee<BigInt(mass.minimumFee)||!mass.withinBlockLimits||tx.storageMass!==BigInt(mass.storageMass))fail('Payment fee or mass exceeds its limit.');
 tx.finalize();return {transactionId:tx.id,feeSompi:String(fee)};
}

export function buildV5Reward(sdk,{entries,source,destination,amountSompi,feeRate}){
 const own=sdk.payToAddressScript(new sdk.Address(source)),recipient=sdk.payToAddressScript(new sdk.Address(destination)),amount=BigInt(amountSompi);
 const usable=entries.filter(entry=>!entry.entry?.covenantId&&scriptOf(entry).version===0&&scriptOf(entry).script===own.script&&BigInt(entry.amount)>0n).sort((a,b)=>BigInt(a.amount)>BigInt(b.amount)?-1:1);
 const selected=[];let total=0n;
 for(const entry of usable.slice(0,8)){
  selected.push(entry);total+=BigInt(entry.amount);let fee=1000n;
  for(let attempt=0;attempt<5&&total>amount+fee;attempt++){
   const transaction=new sdk.Transaction({version:1,inputs:selected.map(e=>({previousOutpoint:e.outpoint,utxo:e,signatureScript:'41'+'00'.repeat(64)+'01',sequence:0n,sigOpCount:0,computeBudget:16})),outputs:[{value:amount,scriptPublicKey:recipient},{value:total-amount-fee,scriptPublicKey:own}],lockTime:0n,subnetworkId:'00'.repeat(20),gas:0n,payload:''});
   const mass=publicTransactionMass(transaction,{feeRate});if(fee<BigInt(mass.minimumFee)){fee=BigInt(mass.minimumFee);continue;}
   if(!mass.withinBlockLimits||fee>MAX_FEE)break;transaction.storageMass=BigInt(mass.storageMass);
   validateV5Payment(sdk,transaction,{source,destination,amountSompi,entries:selected,feeRate});return {transaction,entries:selected.map(storedEntry),feeSompi:String(fee)};
  }
 }
 fail('The town treasury needs more test coins or a lower network fee. Your order has not been delivered.',503);
}

function retainMarketReceipts(receipts){
 const anchors=[];for(const match of [r=>r.configureEnabled,r=>r.delegatedPlayerTrade,r=>BigInt(r.nativePurchaseSompi||0)>0n,r=>BigInt(r.fundAmountSompi||0)>0n]){const first=receipts.find(match);if(first)anchors.push(first);}const revoke=receipts.findLast(r=>r.configureRevoked);if(revoke)anchors.push(revoke);const keep=new Set([...anchors,...receipts.slice(-100)].map(r=>r.paymentId));return receipts.filter(r=>keep.has(r.paymentId));
}

export class V5Service{
 constructor({storage,env,sdk,rpc,key,address,entries,argentTemplates=null,advancedTemplates=null,call=p=>p,now=()=>Date.now()}){Object.assign(this,{storage,env,sdk,rpc,key,address,entries,argentTemplates,call,now});this.market=new V5MarketService({storage,now});this.advanced=new V5AdvancedService(this,advancedTemplates);}
 async node(promise){try{return await this.call(promise);}catch{fail('The test network did not respond. Check the saved payment again.',503);}}
 async signatureCapability(address,nonce){const key=await crypto.subtle.importKey('raw',bytes(this.env.FAUCET_KEY),{name:'HMAC',hash:'SHA-256'},false,['sign']);return toHex(await crypto.subtle.sign('HMAC',key,bytes('v5 capability\n'+address+'\n'+nonce)));}
 async player(body){
  if(!hex.test(body.playerId||'')||!hex.test(body.capability||''))fail('Reconnect your saved test wallet.',401);
  const player=await this.storage.get('v5:player:'+body.playerId);
  if(!player||player.capabilityHash!==await hash(body.capability))fail('Reconnect your saved test wallet.',401);
  return player;
 }
 quoteCancellable(payment){return payment?.kind==='market'&&payment.status==='awaiting-signature'&&!payment.transactionId&&!payment.attempts&&!payment.signatureRejections&&['fund','trade','restock'].includes(payment.marketPlan?.operation)&&payment.marketPlan.wire.signatures.every(slots=>slots.every(sig=>sig===null));}
 publicPayment(payment){if(!payment)return null;return {id:payment.id,kind:payment.kind,actionId:payment.action.id,amountSompi:payment.amountSompi,destination:payment.destination,checkpoint:payment.checkpoint,status:payment.status,transactionId:payment.transactionId||null,acceptingBlock:payment.acceptingBlock||null,feeRate:payment.feeRate||100,feeSompi:payment.feeSompi||null,...(payment.kind==='market'?{marketPlan:payment.marketPlan,quoteCancellable:this.quoteCancellable(payment),signatureError:payment.signatureError||null}: {})};}
 marketReceiptEvidence(player,payment){
  if(!payment.acceptingBlock||!payment.journal||payment.journal.id!==payment.transactionId)fail('Accepted market journal is missing.',503);
  const journal=payment.journal,tx=this.sdk.Transaction.deserializeFromSafeJSON(journal.transaction);tx.finalize();if(tx.id!==payment.transactionId)fail('Accepted market journal changed.',503);
  const index=payment.marketPlan.actors.indexOf(player.id),input=journal.inputStates[index],output=journal.states[index],owned=index>=0&&output?.owner===this.marketOwner(player.address),operation=journal.operation;let delegatedPlayerTrade=false,configureEnabled=null,configureRevoked=null,nativePurchaseSompi='0',fundAmountSompi='0';
  if(owned&&input&&operation==='trade'){
   delegatedPlayerTrade=journal.calls[index]?.args?.[7]===1&&input.operator!==input.owner&&journal.signers[index]?.owners?.[0]===input.operator;
   const spent=tx.inputs[index].utxo.amount-tx.outputs[index].value;if(spent>0n&&V5_ARGENT_RESOURCES.some(r=>output[r]>input[r]))nativePurchaseSompi=String(spent);
  }
  if(owned&&operation==='configure'){const allowances=[...V5_ARGENT_RESOURCES,'coin'].map(r=>output['allow_'+r]);configureEnabled=output.operator!==output.owner&&allowances.some(n=>n>0);configureRevoked=output.operator===output.owner&&allowances.every(n=>n===0);}
  if(owned&&input&&operation==='fund'){const increase=tx.outputs[index].value-tx.inputs[index].utxo.amount;if(increase>0n)fundAmountSompi=String(increase);}
  return {kind:'market',delegatedPlayerTrade,configureEnabled,configureRevoked,nativePurchaseSompi,fundAmountSompi};
 }
 async marketReceiptHistory(player){let receipts=await this.storage.get('v5:market-receipts:'+player.id)||[],changed=false;for(let i=0;i<receipts.length;i++){if(receipts[i].delegatedPlayerTrade!==undefined&&receipts[i].kind==='market')continue;const payment=await this.storage.get('v5:payment:'+receipts[i].paymentId);if(payment?.applied&&payment.acceptingBlock===receipts[i].acceptingBlock&&payment.transactionId===receipts[i].transactionId){receipts[i]={...receipts[i],...this.marketReceiptEvidence(player,payment)};changed=true;}}const retained=retainMarketReceipts(receipts);if(retained.length!==receipts.length)changed=true;receipts=retained;if(changed)await this.storage.put({['v5:market-receipts:'+player.id]:receipts});return receipts;}
 async cancelRevokedAssistantReservations(player){
  const market=await this.market.load(),assistant=market.assistants?.[player.id] || (player.id==='player' ? market.assistant : null);if(assistant?.enabled)return null;
  let changed=false;
  for(const trade of Object.values(market.trades||{})){
   if(trade.status!=='prepared'||![trade.from,trade.to].includes(player.id)||trade.purpose)continue;
   if(trade.delegated!==true)continue;
   const paymentId=trade.paymentId,payment=paymentId?await this.storage.get('v5:payment:'+paymentId):null;if(paymentId&&!payment||payment&&payment.status!=='cancelled')continue;
   const bundles=[[trade.from,trade.give],[trade.to,trade.want]];if(bundles.some(([id,bundle])=>Object.entries(bundle||{}).some(([resource,amount])=>(market.reserved?.[id]?.[resource]||0)<amount)))continue;
   for(const[id,bundle]of bundles)for(const[resource,amount]of Object.entries(bundle||{}))market.reserved[id][resource]-=amount;trade.status='cancelled';changed=true;
  }
  return changed?market:null;
 }
 async response(player,payment=null,status=200){
  if(!payment&&player.pendingPayment)payment=await this.storage.get('v5:payment:'+player.pendingPayment);
  const market=await this.market.view(player);market.cells={};for(const actorId of Object.keys(market.actors)){const cell=await this.storage.get('v5:market-cell:'+actorId);if(cell)market.cells[actorId]={state:structuredClone(cell.state),utxo:structuredClone(cell.utxo),outpoint:structuredClone(cell.utxo.outpoint),nativeSompi:cell.utxo.amount,transactionId:cell.transactionId,acceptingBlock:cell.acceptingBlock,covenantId:cell.utxo.covenantId};}const marketReceipts=await this.marketReceiptHistory(player);
  return json({network:NETWORK,playerId:player.id,address:player.address,treasuryAddress:this.address,state:projectGame(player.game,this.now()),view:getGameView(player.game,this.now()),market,marketReceipts,advanced:await this.advanced.view(player),payment:this.publicPayment(payment)},status);
 }
 async start(body){
  only(body,['address','nonce','signature']);const address=publicAddress(this.sdk,body.address);
  if(address===this.address)fail('Use a separate player wallet.');
  if(typeof body.nonce!=='string'||!/^[0-9a-f]{32,64}$/.test(body.nonce)||typeof body.signature!=='string'||!/^[0-9a-f]{128}$/.test(body.signature))fail('Sign the session message with your test wallet.');
  const publicKey=this.sdk.payToAddressScript(new this.sdk.Address(address)).script.slice(2,-2);
  if(!this.sdk.verifyMessage({message:v5SessionMessage(address,body.nonce),signature:body.signature,publicKey}))fail('The session signature does not match this test wallet.',401);
  const id=await hash('v5 player\n'+address),capability=await this.signatureCapability(address,body.nonce),prior=await this.storage.get('v5:player:'+id);
  const player={...(prior||{id,address,game:createGame({playerId:id,now:this.now()}),pendingPayment:null,createdAt:this.now()}),capabilityHash:await hash(capability)};
  await this.storage.put({['v5:player:'+id]:player});
  await this.market.ensurePlayer({id,name:'Harbor '+address.slice(-6)});
  const result=await this.response(player),value=await result.json();return json({...value,capability});
 }
 async action(player,action){
  if(action?.type==='market_cancel_quote')return this.cancelMarketQuote(player,action);
  if(this.env.V5_ENABLED!=='true')fail('The town is temporarily paused. Your progress is saved.',503);
  if(player.pendingPayment){const pending=await this.storage.get('v5:payment:'+player.pendingPayment);if(JSON.stringify(pending.action)!==JSON.stringify(action))fail('Check your pending payment before another action.',409);return this.response(player,pending,pending.status==='accepted'?200:202);}
  const advancedState=await this.advanced.load(player);if(advancedState.pending)return this.advanced.reconcile(player,advancedState);
  if(action?.type==='advanced_continue')return this.advanced.action(player,action);
  if(action?.type?.startsWith('market_')){
   if(action.type==='market_use'){
    only(action,['id','type','purpose']);if(typeof action.id!=='string'||!action.id||action.id.length>128||!['feed_habitat','build_workshop','expand_greenhouse'].includes(action.purpose))fail('Choose a listed use for your market materials.');
    if(player.game.marketUseActions?.[action.id]){const used=player.game.marketUseActions[action.id],receipt=player.game.marketUseReceipts[used.transactionId];player.game=applyMarketUse(player.game,{id:action.id,purpose:action.purpose},this.now(),{...receipt,playerId:player.id});return this.response(player);}
    const prior=await this.storage.get('v5:market-use:'+player.id+':'+action.id),quote=prior?null:quoteMarketUse(player.game,action.purpose,this.now());const outcome=await this.market.prepareUse(player,{action,quote});if(outcome.result.status==='prepared')return this.beginMarket(player,{tradeId:outcome.result.id,action});const res=await this.response(player),body=await res.json();return json({...body,marketAction:outcome.result});
   }
   if(action.type==='market_fund'){only(action,['id','type','amountSompi']);if(typeof action.id!=='string'||!action.id||action.id.length>128||typeof action.amountSompi!=='string'||!/^\d{1,12}$/.test(action.amountSompi)||BigInt(action.amountSompi)<1000000n||BigInt(action.amountSompi)>100000000000n)fail('Choose a business deposit between 0.01 and 1000 tKAS.');const prior=await this.storage.get('v5:market-fund:'+player.id+':'+action.id);if(prior){if(prior.fingerprint!==JSON.stringify(action))fail('This action ID belongs to another deposit.',409);const saved=await this.storage.get('v5:payment:'+prior.paymentId);return this.response(player,saved,saved.applied||saved.status==='cancelled'?200:202);}const funds=await this.marketFunding(player.address);if(funds.reduce((n,e)=>n+BigInt(e.amount),0n)<=BigInt(action.amountSompi)+5000000n)fail('Your wallet needs the deposit amount plus the 0.05 tKAS maximum network fee.',409);return this.beginMarket(player,{fundAmountSompi:action.amountSompi,action});}
   if(action.type==='market_stock')return this.stockMarket(player,action);
   const outcome=await this.market.action(player,action);if(outcome.result?.status==='prepared'&&this.argentTemplates)return this.beginMarket(player,{tradeId:outcome.result.id,action});if(action.type==='market_assistant'&&this.argentTemplates){const config=outcome.market.assistant;return this.beginMarket(player,{policy:{operator:config.enabled?this.marketOwner(this.address):this.marketOwner(player.address),...Object.fromEntries(V5_ARGENT_RESOURCES.map(r=>['allow_'+r,config.enabled?config.maxGive[r]:0])),allow_coin:0,min_receive:1},action});}const res=await this.response(player),body=await res.json();
   return json({...body,market:outcome.market,marketAction:outcome.result||null});
  }
  const now=this.now(),quote=quoteGameAction(player.game,action,now);
  if(quote.alreadyApplied)return this.response(player);
  if(quote.kind==='free'){
   player.game=applyGameAction(player.game,action,now);await this.storage.put({['v5:player:'+player.id]:player});return this.response(player);
  }
  const id=await hash('v5 payment\n'+player.id+'\n'+action.id),prior=await this.storage.get('v5:payment:'+id);
  if(prior){if(JSON.stringify(prior.action)!==JSON.stringify(action))fail('This action ID was already used.',409);return this.response(player,prior,prior.status==='accepted'?200:202);}
  const {sink}=await this.node(this.rpc.getSink());if(!hex.test(sink))fail('The node did not return a payment checkpoint.',503);
  const payment={id,playerId:player.id,action:structuredClone(action),kind:quote.kind,amountSompi:String(quote.amountSompi),destination:quote.kind==='purchase'?this.address:player.address,source:quote.kind==='purchase'?player.address:this.address,checkpoint:sink,scanCursor:null,createdAt:now,status:'prepared',transactionId:null};
  if(quote.kind==='purchase'){
   const {entries}=await this.node(this.rpc.getUtxosByAddresses([player.address]));
   if(entries.length>512)fail('This wallet has too many outputs for the demo.',400);
   payment.entries=entries.map(storedEntry);if(!payment.entries.length)fail('Wait for your test coins to arrive before buying.',409);
   player.pendingPayment=id;await this.storage.put({['v5:player:'+player.id]:player,['v5:payment:'+id]:payment});return this.response(player,payment);
  }
  return this.reward(player,payment);
 }
 async stockMarket(player,action){
  only(action,['id','type','resource','amount']);
  if(typeof action.id!=='string'||action.id.length<1||action.id.length>128||!['crops','parts'].includes(action.resource)||!Number.isSafeInteger(action.amount)||action.amount<1||action.amount>1000000)fail('Choose supplies to bring to the market.');
  const actionKey='v5:stock:'+player.id+':'+action.id,previous=await this.storage.get(actionKey),fingerprint=JSON.stringify(action);
  if(previous){if(previous!==fingerprint)fail('This action ID belongs to a different transfer.',409);return this.response(player);}
  const game=projectGame(player.game,this.now());
  if(game.resources[action.resource]<action.amount)fail('Your farm does not have those supplies.');
  const market=await this.market.load(),actor=market.actors[player.id],resource=action.resource==='parts'?'tools':'crops';
  if(!actor||actor.inventory[resource]+action.amount>1000000)fail('The trading store has no room for those supplies.');
  game.resources[action.resource]-=action.amount;game.revision++;actor.inventory[resource]+=action.amount;
  game.events.unshift({id:action.id,at:this.now(),type:'market',title:'Supplies brought to market',detail:action.amount+' '+resource+' are ready to trade.'});game.events=game.events.slice(0,80);player.game=game;
  await this.storage.put({['v5:player:'+player.id]:player,'v5-market-world':market,[actionKey]:fingerprint});return this.response(player);
 }
 async reward(player,payment){
  const treasury=await this.storage.get('state')||{address:this.address,claims:0,pending:null};
  if(treasury.pending)fail('The town treasury is finishing another payment. Your order is still ready; check again shortly.',503);
  const day=Math.floor(this.now()/86400000),budget=await this.storage.get('v5:budget')||{reservedSompi:'0'},bucketKey='v5:reward-day:'+player.id+':'+day,bucket=await this.storage.get(bucketKey)||{reservedSompi:'0'};
  const amount=BigInt(payment.amountSompi),playerLimit=capValue(this.env.V5_PLAYER_DAILY_REWARD_SOMPI,'1000000000',10000000000n),globalLimit=capValue(this.env.V5_TOTAL_REWARD_SOMPI,'100000000000',1000000000000n);
  if(BigInt(bucket.reservedSompi)+amount>playerLimit)fail('This wallet has reached today’s town reward limit. Your order remains ready.',429);
  if(BigInt(budget.reservedSompi)+amount>globalLimit)fail('The town reward budget is paused. Your order remains ready.',503);
  const estimate=await this.node(this.rpc.getFeeEstimate()),feeRate=Math.max(100,Math.ceil(estimate.estimate.priorityBucket.feerate));
  const plan=buildV5Reward(this.sdk,{entries:this.entries,source:this.address,destination:player.address,amountSompi:payment.amountSompi,feeRate});
  for(let i=0;i<plan.transaction.inputs.length;i++)plan.transaction.inputs[i].signatureScript=this.sdk.createInputSignature(plan.transaction,i,this.key);
  const checked=validateV5Payment(this.sdk,plan.transaction,{source:this.address,destination:player.address,amountSompi:payment.amountSompi,entries:plan.entries,feeRate});
  Object.assign(payment,{purpose:'v5-reward',status:'pending',transactionId:checked.transactionId,transaction:plan.transaction.serializeToSafeJSON(),entries:plan.entries,feeRate,feeSompi:checked.feeSompi,attempts:1,attemptedAt:this.now()});
  player.pendingPayment=payment.id;treasury.pending=payment;
  await this.storage.put({'state':treasury,['v5:player:'+player.id]:player,['v5:payment:'+payment.id]:payment,['v5:transaction:'+payment.transactionId]:payment.id,'v5:budget':{reservedSompi:String(BigInt(budget.reservedSompi)+BigInt(payment.amountSompi))},[bucketKey]:{reservedSompi:String(BigInt(bucket.reservedSompi)+BigInt(payment.amountSompi))}});
  // Every uncertain payout holds the same treasury lock and immutable signed
  // transaction. Neither a faucet claim nor another reward can spend its inputs.
  try{const submitted=await this.node(this.rpc.submitTransaction({transaction:plan.transaction,allowOrphan:false}));if(submitted.transactionId!==payment.transactionId)fail('Unexpected submitted transaction ID.',503);payment.status='submitted';treasury.pending=payment;await this.storage.put({'state':treasury,['v5:payment:'+payment.id]:payment});}catch{}
  return this.response(player,payment,202);
 }
 async observe(payment){
  if(!payment.transactionId)return payment;
  const evidence=await observePublicAcceptance(this.rpc,{id:payment.transactionId,checkpoint:payment.checkpoint,scanCursor:payment.scanCursor,acceptingBlock:payment.acceptingBlock},{call:p=>this.node(p),pages:3});
  Object.assign(payment,evidence);if(evidence.acceptingBlock)payment.status='accepted';
  await this.storage.put({['v5:payment:'+payment.id]:payment});return payment;
 }
 async commit(player,payment){
  if(!payment.acceptingBlock||payment.applied)return player;
  const witness={kind:payment.kind,transactionId:payment.transactionId,acceptingBlock:payment.acceptingBlock,playerId:player.id,actionId:payment.action.id,amountSompi:payment.amountSompi};
  player.game=applyGameAction(player.game,payment.action,payment.createdAt,{payment:witness});player.pendingPayment=null;payment.applied=true;payment.appliedAt=this.now();
  const writes={['v5:player:'+player.id]:player,['v5:payment:'+payment.id]:payment};
  if(payment.kind==='reward'){const treasury=await this.storage.get('state');if(treasury?.pending?.transactionId!==payment.transactionId)fail('Town payment lock changed. Contact the site operator.',503);writes.state={...treasury,pending:null};}
  await this.storage.put(writes);return player;
 }
 async reconcileTreasury(state){
  if(state.pending?.purpose==='v5-market'){const player=await this.storage.get('v5:player:'+state.pending.playerId);if(player)await this.marketPayment(player,state.pending);return await this.storage.get('state');}
  if(state.pending?.purpose!=='v5-reward')return state;
  const payment=await this.observe(state.pending);
  if(payment.status==='accepted'){const player=await this.storage.get('v5:player:'+payment.playerId);await this.commit(player,payment);return await this.storage.get('state');}
  const next={...state,pending:payment};await this.storage.put({'state':next});return next;
 }
  marketOwner(address){return this.sdk.payToAddressScript(new this.sdk.Address(address)).script.slice(2,-2);}
 marketEntry(entry){return {outpoint:{transactionId:entry.outpoint.transactionId,index:entry.outpoint.index},amount:String(entry.amount),scriptPublicKey:{version:scriptOf(entry).version,script:scriptOf(entry).script},blockDaaScore:String(entry.blockDaaScore||0),isCoinbase:!!entry.isCoinbase,covenantId:entry.entry?.covenantId?.toString()||entry.covenantId?.toString()||null};}
 hydrateMarketEntry(e){return new this.sdk.UtxoEntries([{...e,amount:BigInt(e.amount),blockDaaScore:BigInt(e.blockDaaScore||0),...(e.covenantId?{covenant_id:e.covenantId}:{})}]).items[0];}
 rebuildMarket(plan){
  if(!this.argentTemplates)fail('Argent market contracts are not configured on this host.',503);
  if(plan.wire)return deriveV5ArgentPlan(this.sdk,{templates:this.argentTemplates,journal:plan.wire,issuer:plan.issuer,world:plan.world});
  const options=structuredClone(plan.options);options.templates=this.argentTemplates;options.fundingUtxos=options.fundingUtxos.map(e=>this.hydrateMarketEntry(e));
  for(const name of ['cell','left','right'])if(options[name])options[name].utxo=this.hydrateMarketEntry(options[name].utxo);
  const builder={genesis:buildV5ArgentGenesis,trade:buildV5ArgentTrade,configure:buildV5ArgentConfigure,restock:buildV5ArgentRestock,fund:buildV5ArgentFund}[plan.operation];if(!builder)fail('Unknown market transition.');return builder(this.sdk,options);
 }
 async marketFunding(address=this.address){const {entries}=await this.node(this.rpc.getUtxosByAddresses([address]));const own=this.marketOwner(address);return entries.filter(e=>!e.entry?.covenantId&&scriptOf(e).script==='20'+own+'ac').sort((a,b)=>a.amount>b.amount?-1:1).slice(0,8).map(e=>this.marketEntry(e));}
 async marketCell(actorId){const saved=await this.storage.get('v5:market-cell:'+actorId);if(!saved)return null;const asset=instantiateV5Argent(this.sdk,this.argentTemplates,saved.state),{entries}=await this.node(this.rpc.getUtxosByAddresses([asset.address]));const found=entries.find(e=>idOf(e.outpoint)===idOf(saved.utxo.outpoint));if(!found||String(found.amount)!==saved.utxo.amount||found.entry?.covenantId?.toString()!==saved.utxo.covenantId)fail('A market contract output changed. Check the saved settlement.',409);return {...saved,utxo:this.marketEntry(found)};}
 async beginMarket(player,{tradeId=null,policy=null,fundAmountSompi=null,action=null}={}){
  if(this.env.V5_ENABLED!=='true')fail('The town is paused. Your settlement is saved.',503);
  if(!this.argentTemplates)fail('Argent market contracts are not configured on this host.',503);
  const treasury=await this.storage.get('state')||{address:this.address,claims:0,pending:null};if(treasury.pending)fail('The treasury is finishing a saved transaction. Check again shortly.',409);
  const m=await this.market.load(),trade=tradeId?m.trades[tradeId]:null;
  if(tradeId&&(!trade||trade.status!=='prepared'||![trade.from,trade.to].includes(player.id)))fail('No prepared player trade to settle.',409);
  // A reservation can survive a network/treasury failure before a payment is
  // saved. Recover the exact originating material action from that reservation.
  if(trade?.purpose){const original={id:trade.useActionId,type:'market_use',purpose:trade.purpose};if(typeof original.id!=='string'||!original.id||original.id.length>128||!['feed_habitat','build_workshop','expand_greenhouse'].includes(original.purpose)||action&&(action.id!==original.id||action.type!==original.type||action.purpose!==original.purpose))fail('The saved material-use action changed.',409);action=original;quoteMarketUse(player.game,original.purpose,this.now());}
  const actors=trade?[trade.from,trade.to]:[player.id];if(actors.some(id=>m.actors[id]?.kind==='player'&&id!==player.id))fail('Direct player-to-player settlement needs both wallet approvals and is not connected yet.',409);
  const cells=[];for(const id of actors)cells.push(await this.marketCell(id));
  const fundingUtxos=await this.marketFunding(fundAmountSompi&&cells.every(Boolean)?player.address:this.address);if(!fundingUtxos.length)fail('The treasury needs native test coins for market fees.',503);
  const {sink}=await this.node(this.rpc.getSink());if(!hex.test(sink))fail('Missing market acceptance checkpoint.',503);
  const owner=this.marketOwner(this.address),world=await hash('v5 shared market\n'+this.address),feeRate=Math.max(100,Math.ceil((await this.node(this.rpc.getFeeEstimate())).estimate.priorityBucket.feerate));
  let operation,options,phaseActors;const missing=cells.findIndex(c=>!c);
  if(missing>=0){const id=actors[missing],actor=m.actors[id],actorOwner=actor.kind==='player'?this.marketOwner(player.address):owner;operation='genesis';phaseActors=[id];options={state:v5ArgentInitialState({owner:actorOwner,issuer:owner,world,resources:actor.inventory}),deposit:'100000000',fundingUtxos,feeRate};}
  else if(fundAmountSompi){operation='fund';phaseActors=[player.id];options={cell:cells[0],amountSompi:fundAmountSompi,fundingUtxos,feeRate,maxFee:'5000000'};}
  else if(policy){operation='configure';phaseActors=[player.id];options={cell:cells[0],policy,fundingUtxos,feeRate};}
  else {
   // Only issuer-attested modeled resources may be added. Existing chain units
   // never authorize spending more than the market's reserved game inventory.
   const restock=cells.findIndex((c,i)=>V5_ARGENT_RESOURCES.some(r=>c.state[r]<(i===0?(trade.give[r]||0):(trade.want[r]||0))));
   if(restock>=0){operation='restock';phaseActors=[actors[restock]];options={cell:cells[restock],resources:Object.fromEntries(V5_ARGENT_RESOURCES.map(r=>[r,Math.max(0,m.actors[actors[restock]].inventory[r]-cells[restock].state[r])])),fundingUtxos,feeRate};}
   else {operation='trade';phaseActors=actors;const deltas=Object.fromEntries(V5_ARGENT_RESOURCES.map(r=>[r,(trade.want[r]||0)-(trade.give[r]||0)]));deltas.coin=-Number(trade.nativeAmountSompi||0);if(cells[0].utxo.amount&&BigInt(cells[0].utxo.amount)+BigInt(deltas.coin)<10000000n)fail('Your business contract needs more native test coins for this purchase. Its remaining deposit must stay at least 0.1 tKAS.',409);const delegated=cells.map((c,i)=>c.state.operator===owner&&c.state.owner!==owner&&c.state.allow_coin>=Math.max(0,i?deltas.coin:-deltas.coin)&&V5_ARGENT_RESOURCES.every(r=>c.state['allow_'+r]>=Math.max(0,i?deltas[r]:-deltas[r]))&&V5_ARGENT_RESOURCES.reduce((n,r)=>n+Math.max(0,i?-deltas[r]:deltas[r]),0)>=c.state.min_receive);options={left:cells[0],right:cells[1],deltas,leftDelegated:delegated[0],rightDelegated:delegated[1],fundingUtxos,feeRate};}
  }
  const descriptor={version:1,operation,actors:phaseActors,tradeId,options,templateId:this.argentTemplates.apps.business.id};const plan=this.rebuildMarket(descriptor);descriptor.options.fee=plan.fee;
  await signV5ArgentPlan(plan,(tx,i)=>this.sdk.createInputSignature(tx,i,this.key),{owners:[owner]});
  const continuation={tradeId,policy,fundAmountSompi,action:action||{id:'settle-'+tradeId,type:'market_accept',tradeId}};
  const id=await hash('v5 market phase\n'+player.id+'\n'+JSON.stringify({continuation,operation,inputs:plan.transaction.inputs.map(i=>idOf(i.previousOutpoint))}));
  const payment={id,playerId:player.id,kind:'market',purpose:'v5-market',action:continuation.action,continuation,amountSompi:'0',destination:null,source:this.address,checkpoint:sink,createdAt:this.now(),status:'awaiting-signature',transactionId:null,feeSompi:plan.fee,feeRate,marketPlan:{version:1,operation,actors:phaseActors,tradeId,templateId:descriptor.templateId,issuer:owner,world,wire:v5ArgentWirePlan(this.rebuildMarket(descriptor)),economicReview:{playerId:player.id,playerOwner:this.marketOwner(player.address),trade:trade?{id:trade.id,from:trade.from,to:trade.to,give:trade.give,want:trade.want,nativeAmountSompi:trade.nativeAmountSompi||'0',purpose:trade.purpose||null}:null,use:trade?.purpose?{purpose:trade.purpose,requires:trade.give,recipientId:trade.to}:null,policy,fundAmountSompi:operation==='fund'?fundAmountSompi:null,coinDelta:-(Number(trade?.nativeAmountSompi||0)),feePayer:operation==='fund'?this.marketOwner(player.address):owner,maxFeeSompi:operation==='fund'?'5000000':'20000000'},feeSompi:plan.fee,requiredSignatures:plan.signers.flatMap((s,i)=>s.owners.flatMap((o,j)=>plan.signatures[i][j]?[]:[{inputIndex:i,signatureIndex:j,owner:o}]))}};
  if(payment.marketPlan.requiredSignatures.some(s=>s.owner!==this.marketOwner(player.address)))fail('Another wallet signature is required.',409);
  if(trade){trade.paymentId=id;m.trades[trade.id]=trade;}
  player.pendingPayment=id;player.marketContinuation=null;treasury.pending=payment;await this.storage.put({'state':treasury,['v5:player:'+player.id]:player,['v5:payment:'+id]:payment,...(trade?{'v5-market-world':m}:{}),...(fundAmountSompi?{['v5:market-fund:'+player.id+':'+continuation.action.id]:{fingerprint:JSON.stringify(continuation.action),paymentId:id}}:{})});
  if(!payment.marketPlan.requiredSignatures.length)return this.submitMarket(player,payment,plan);
  return this.response(player,payment,202);
 }
 async cancelMarketQuote(player,action){
  only(action,['id','type','paymentId']);if(typeof action.id!=='string'||!action.id||action.id.length>128||!hex.test(action.paymentId||''))fail('Choose the saved quote to cancel.');
  const payment=await this.storage.get('v5:payment:'+action.paymentId);if(!payment||payment.playerId!==player.id)fail('Quote belongs to another player.',404);if(payment.status==='cancelled')return this.response(player,payment);
  const treasury=await this.storage.get('state');if(player.pendingPayment!==payment.id||treasury?.pending?.id!==payment.id||!this.quoteCancellable(payment))fail('This settlement can no longer be cancelled. Check its saved transaction.',409);
  const writes={};if(payment.continuation.tradeId){const m=await this.market.load(),trade=m.trades[payment.continuation.tradeId];if(!trade||trade.status!=='prepared')fail('The reserved trade changed.',409);for(const[id,bundle]of [[trade.from,trade.give],[trade.to,trade.want]])for(const[k,n]of Object.entries(bundle)){if(!m.reserved?.[id]||m.reserved[id][k]<n)fail('The trade reservation changed.',409);m.reserved[id][k]-=n;}trade.status='cancelled';writes['v5-market-world']=m;}
  // Retain the unsigned owner quote as recovery evidence. In an owner-only fund
  // transaction its owner could still sign/broadcast independently; that cannot
  // spend treasury funds, and subsequent cell use still checks actual UTXOs.
  payment.status='cancelled';payment.cancelledAt=this.now();player.pendingPayment=null;player.marketContinuation=null;Object.assign(writes,{'state':{...treasury,pending:null},['v5:player:'+player.id]:player,['v5:payment:'+payment.id]:payment});await this.storage.put(writes);return this.response(player,payment);
 }
 async submitMarket(player,payment,plan){
  if(this.env.V5_ENABLED!=='true')fail('The town is paused. Your reviewed settlement is saved.',503);
  const journal=v5ArgentJournal(plan),treasury=await this.storage.get('state');if(treasury?.pending?.id!==payment.id)fail('Market treasury lock changed.',409);
  const used=await this.storage.get('v5:transaction:'+journal.id);if(used&&used!==payment.id)fail('Market transaction already belongs to another action.',409);
  Object.assign(payment,{status:'pending',transactionId:journal.id,transaction:journal.transaction,feeSompi:journal.fee,feeRate:journal.feeRate,journal,attempts:1,attemptedAt:this.now()});
  await this.storage.put({'state':{...treasury,pending:payment},['v5:payment:'+payment.id]:payment,['v5:transaction:'+journal.id]:payment.id});
  try{const result=await this.call(this.rpc.submitTransaction({transaction:plan.transaction,allowOrphan:false}));if(result.transactionId!==journal.id)fail('Unexpected market transaction ID.',503);payment.status='submitted';await this.storage.put({'state':{...treasury,pending:payment},['v5:payment:'+payment.id]:payment});}catch(error){
   // A node's explicit signature validation failure means the transaction was
   // rejected, unlike a timeout/disconnection. Keep the reviewed request so its
   // owner can correct signatures, while preserving the failed bytes separately.
   if(/(?:signature.*(?:invalid|failed)|(?:invalid|failed).*signature)/i.test(String(error.message))&&payment.marketPlan.requiredSignatures.length){
    await this.storage.put({['v5:market-rejected:'+payment.id+':'+(payment.signatureRejections||0)]:{transaction:payment.transaction,transactionId:payment.transactionId,reason:String(error.message).slice(0,300)}});
    payment.signatureRejections=(payment.signatureRejections||0)+1;payment.status='awaiting-signature';payment.transactionId=null;payment.transaction=null;payment.signatureError='The node rejected the wallet signature. Sign the same reviewed request again.';await this.storage.put({'state':{...treasury,pending:payment},['v5:payment:'+payment.id]:payment});
   }
  }
  return this.response(player,payment,202);
 }
 async marketPayment(player,payment,body={}){
  if(payment.status==='cancelled')fail('This quote was cancelled. Request a new quote before signing.',409);
  if(payment.applied)return this.response(player,payment);
  if(body.transaction!==undefined)fail('Market settlement uses reviewed signature slots.');
  if(body.signatures!==undefined){
   if(this.env.V5_ENABLED!=='true')fail('The town is paused. Your reviewed settlement is saved.',503);
   if((payment.signatureRejections||0)>=3)fail('Repeated invalid signatures. Contact the site operator.',409);
   if(payment.transactionId)fail('This market transaction is already saved. Check its acceptance.',409);
   if(!Array.isArray(body.signatures)||body.signatures.length!==payment.marketPlan.requiredSignatures.length)fail('Sign every requested market input.');
   const plan=this.rebuildMarket(payment.marketPlan),saved=payment.marketPlan;
   const supplied=new Map();for(const sig of body.signatures){only(sig,['inputIndex','signatureIndex','signature']);const expected=saved.requiredSignatures.find(s=>s.inputIndex===sig.inputIndex&&s.signatureIndex===sig.signatureIndex);const slot=sig.inputIndex+':'+sig.signatureIndex;if(!expected||expected.owner!==this.marketOwner(player.address)||supplied.has(slot)||typeof sig.signature!=='string')fail('Unexpected market signature slot.');supplied.set(slot,sig.signature);}
   // Re-sign the immutable reviewed plan with the same treasury key, then add
   // only signatures belonging to the authenticated owner.
   await signV5ArgentPlan(plan,(tx,i,{owner,signatureIndex})=>owner===this.marketOwner(this.address)?this.sdk.createInputSignature(tx,i,this.key):supplied.get(i+':'+signatureIndex));
   return this.submitMarket(player,payment,plan);
  }
  if(!payment.transactionId)return this.response(player,payment,202);
  payment=await this.observe(payment);
  if(payment.acceptingBlock){
   const treasury=await this.storage.get('state');if(treasury?.pending?.id!==payment.id)fail('Market treasury lock changed.',409);
   const writes={};for(let i=0;i<payment.marketPlan.actors.length;i++){
    const actorId=payment.marketPlan.actors[i],state=payment.journal.states[i],asset=instantiateV5Argent(this.sdk,this.argentTemplates,state),{entries}=await this.node(this.rpc.getUtxosByAddresses([asset.address]));const utxo=entries.find(e=>e.outpoint.transactionId===payment.transactionId&&e.outpoint.index===i);if(!utxo)fail('Accepted market output is not yet available. Check again.',503);
    const digest=await v5ArgentCertificateDigest({world:state.world,covenantId:utxo.entry.covenantId.toString(),owner:state.owner});const certificate=this.sdk.signScriptHash(digest,this.key).slice(2,-2);writes['v5:market-cell:'+actorId]={state,utxo:this.marketEntry(utxo),certificate,acceptingBlock:payment.acceptingBlock,transactionId:payment.transactionId};
   }
 if(payment.marketPlan.operation==='trade'){
    const use=payment.marketPlan.economicReview.use;if(use){if(payment.continuation.action.type!=='market_use'||payment.continuation.action.purpose!==use.purpose)fail('The saved material use changed.',409);player.game=applyMarketUse(player.game,{id:payment.continuation.action.id,purpose:use.purpose},this.now(),{transactionId:payment.transactionId,acceptingBlock:payment.acceptingBlock,playerId:player.id,purpose:use.purpose,requires:use.requires,recipientId:use.recipientId});}
    await this.market.settle({tradeId:payment.continuation.tradeId,verifiedReceipt:payment.transactionId});
   }
   const evidence=this.marketReceiptEvidence(player,payment),receipts=await this.storage.get('v5:market-receipts:'+player.id)||[];if(!receipts.some(r=>r.paymentId===payment.id))receipts.push({...evidence,paymentId:payment.id,transactionId:payment.transactionId,acceptingBlock:payment.acceptingBlock,operation:payment.marketPlan.operation,purpose:payment.marketPlan.economicReview.use?.purpose||null,tradeId:payment.continuation.tradeId,at:this.now(),feeSompi:payment.feeSompi,actors:payment.marketPlan.actors});writes['v5:market-receipts:'+player.id]=retainMarketReceipts(receipts);
   // Revocation is the accepted boundary for delegated spending. Release only
   // marked automatic reservations that have no saved payment; a submitted or
   // signed transaction remains recoverable and must not be erased here.
   if(payment.marketPlan.operation==='configure'&&evidence.configureRevoked){const market=await this.cancelRevokedAssistantReservations(player);if(market)writes['v5-market-world']=market;}
   payment.applied=true;payment.appliedAt=this.now();player.pendingPayment=null;player.marketContinuation=['genesis','restock'].includes(payment.marketPlan.operation)?payment.continuation:null;Object.assign(writes,{'state':{...treasury,pending:null},['v5:payment:'+payment.id]:payment,['v5:player:'+player.id]:player});await this.storage.put(writes);
   if(['genesis','restock'].includes(payment.marketPlan.operation)&&this.env.V5_ENABLED==='true')return this.beginMarket(player,payment.continuation);
   return this.response(player,payment);
  }
  if((payment.attempts||0)<3&&this.now()-payment.attemptedAt>15000&&this.env.V5_ENABLED==='true'){
   const treasury=await this.storage.get('state');if(treasury?.pending?.id!==payment.id)fail('Market treasury lock changed.',409);const tx=this.sdk.Transaction.deserializeFromSafeJSON(payment.transaction);tx.finalize();if(tx.id!==payment.transactionId)fail('Saved market transaction changed.',503);payment.attempts++;payment.attemptedAt=this.now();await this.storage.put({'state':{...treasury,pending:payment},['v5:payment:'+payment.id]:payment});try{await this.node(this.rpc.submitTransaction({transaction:tx,allowOrphan:false}));}catch{}
  }
  return this.response(player,payment,202);
 }

 async payment(player,body){
  const id=body.paymentId||player.pendingPayment;if(!hex.test(id||''))fail('No saved payment to check.');
  let payment=await this.storage.get('v5:payment:'+id);if(!payment||payment.playerId!==player.id)fail('Payment belongs to another player.',404);
  if(payment.kind==='market')return this.marketPayment(player,payment,body);
  if(body.signatures!==undefined)fail('Unexpected signature slots.');
  if(body.transaction!==undefined){
   if(payment.kind!=='purchase')fail('Town rewards are signed by the treasury.');
   if(typeof body.transaction!=='string'||body.transaction.length>50000)fail('Invalid signed transaction.');
   const tx=this.sdk.Transaction.deserializeFromSafeJSON(body.transaction),checked=validateV5Payment(this.sdk,tx,{source:player.address,destination:this.address,amountSompi:payment.amountSompi,entries:payment.entries,feeRate:100});
   if(payment.transactionId&&payment.transactionId!==checked.transactionId)fail('This payment already has a saved transaction. Check that transaction; do not send another.',409);
   const used=await this.storage.get('v5:transaction:'+checked.transactionId);if(used&&used!==payment.id)fail('This transaction already belongs to another action.',409);
   Object.assign(payment,{transactionId:checked.transactionId,transaction:tx.serializeToSafeJSON(),feeSompi:checked.feeSompi,status:payment.applied?'accepted':'pending'});
   await this.storage.put({['v5:payment:'+id]:payment,['v5:transaction:'+checked.transactionId]:id});
  }
  payment=await this.observe(payment);if(payment.status==='accepted')player=await this.commit(player,payment);
  else if(payment.kind==='reward'&&payment.transactionId&&(payment.attempts||0)<3&&this.now()-payment.attemptedAt>15000&&this.env.V5_ENABLED==='true'){
   const treasury=await this.storage.get('state');if(treasury?.pending?.transactionId!==payment.transactionId)fail('Town payment lock changed.',503);
   const tx=this.sdk.Transaction.deserializeFromSafeJSON(payment.transaction),checked=validateV5Payment(this.sdk,tx,{source:this.address,destination:player.address,amountSompi:payment.amountSompi,entries:payment.entries,feeRate:payment.feeRate});if(checked.transactionId!==payment.transactionId)fail('Saved transaction identity changed.',503);
   payment.attempts++;payment.attemptedAt=this.now();treasury.pending=payment;await this.storage.put({'state':treasury,['v5:payment:'+id]:payment});
   try{const result=await this.node(this.rpc.submitTransaction({transaction:tx,allowOrphan:false}));if(result.transactionId!==payment.transactionId)fail('Unexpected submitted transaction ID.',503);}catch{}
  }
  return this.response(player,payment,payment.status==='accepted'?200:202);
 }
 async handle(request){
  try{
   const path=new URL(request.url).pathname,body=await request.json();
   if(path==='/api/v5/start'){if(this.env.V5_ENABLED!=='true')fail('The town is being connected.',503);return await this.start(body);}
   only(body,['playerId','capability',...(path==='/api/v5/action'?['action']:path==='/api/v5/payment'?['paymentId','transaction','signatures']:[])]);const player=await this.player(body);
   if(path==='/api/v5/action')return await this.action(player,body.action);
   if(path==='/api/v5/payment')return await this.payment(player,body);
   if(path==='/api/v5/state'||path==='/api/v5/status'){const advancedState=await this.advanced.load(player);if(advancedState.pending)return this.advanced.reconcile(player,advancedState);if(player.pendingPayment)return await this.payment(player,{paymentId:player.pendingPayment});if(this.argentTemplates&&this.env.V5_ENABLED==='true'){if(player.marketContinuation)return await this.beginMarket(player,player.marketContinuation);const pending=(await this.market.pending()).find(t=>[t.from,t.to].includes(player.id));if(pending)return await this.beginMarket(player,{tradeId:pending.id});}return await this.response(player);}
   fail('Not found.',404);
  }catch(error){return json({network:NETWORK,error:error.message||'Unable to update your town.'},error.status||400);}
 }
}
