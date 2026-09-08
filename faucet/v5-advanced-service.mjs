// Two guided contract experiments. All demo roles are controlled by this host;
// player private keys are never involved in these treasury-funded demonstrations.
import {publicTransactionMass} from '../src/public-contracts.mjs';
import {observePublicAcceptance} from '../src/public-acceptance.mjs';
import * as ring from '../src/v5-ring-protocol.mjs';
import * as delivery from '../src/v5-delivery-protocol.mjs';
const hex=/^[a-f0-9]{64}$/;
const digest=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('');
const plain=v=>JSON.parse(JSON.stringify(v,(_,x)=>typeof x==='bigint'?String(x):x));
const fail=s=>{throw Object.assign(Error(s),{status:409});};
const same=(a,b)=>a.transactionId===b.transactionId&&a.index===b.index;
const sompi=v=>{
 if(typeof v==='bigint')return v>=0n?v.toString():null;
 if(typeof v==='number')return Number.isSafeInteger(v)&&v>=0?String(v):null;
 if(typeof v==='string'&&/^\d+$/.test(v))try{return BigInt(v).toString();}catch{}
 return null;
};
const txOutputValues=value=>{
 let tx=value;
 if(typeof tx==='string')try{tx=JSON.parse(tx);}catch{return [];}
 const outputs=Array.isArray(tx?.outputs)?tx.outputs:[];
 return outputs.map(output=>sompi(output?.value));
};
const publicMetadataFields=record=>{
 const result={},phase=record?.phase||record?.operation;
 if(phase==='role-funding'){
  const customer=sompi(record?.customerFundingSompi),courier=sompi(record?.courierFundingSompi);
  if(customer!==null&&courier!==null){result.customerFundingSompi=customer;result.courierFundingSompi=courier;}
 }
 if(phase==='ring-genesis'&&Array.isArray(record?.ringDeposits)&&record.ringDeposits.length===3){const deposits=record.ringDeposits.map(sompi);if(deposits.every(value=>value!==null))result.ringDeposits=deposits;}
 return result;
};
// These are public, operation-specific facts copied from the exact signed
// transaction journal. Do not substitute the delivery payment/bond values.
const publicTransactionMetadata=record=>{
 const phase=record?.phase||record?.operation,values=txOutputValues(record?.transaction);
 if(phase==='role-funding'&&values.length>=2&&values[0]!==null&&values[1]!==null)
   return {customerFundingSompi:values[0],courierFundingSompi:values[1]};
 if(phase==='ring-genesis'&&values.length>=3&&values.slice(0,3).every(value=>value!==null))
   return {ringDeposits:values.slice(0,3)};
 return publicMetadataFields(record);
};
const STAGES=['ring-intro','ring-ready','ring-complete','delivery-intro','delivery-ready','delivery-complete','refund-intro','refund-wait','refund-ready','refund-complete','complete'];
const names=['Grower','Toolmaker','Miner'];
export class V5AdvancedService{
 constructor(host,templates){this.h=host;this.templates=templates;}
 key(id){return 'v5:advanced:'+id;}
 async load(player){return await this.h.storage.get(this.key(player.id))||{version:1,stage:'ring-intro',receipts:[],actions:{},pending:null};}
 async save(player,a,extra={}){await this.h.storage.put({[this.key(player.id)]:plain(a),...extra});}
 async roles(player){const roles={treasury:{key:this.h.key,address:this.h.address,owner:this.h.marketOwner(this.h.address)}};for(const name of ['grower','toolmaker','miner','customer','courier','recipient']){const key=new this.h.sdk.PrivateKey(await digest('v5 advanced roles\n'+this.h.env.FAUCET_KEY+'\n'+player.id+'\n'+name)),address=key.toAddress('testnet-10').toString();roles[name]={key,address,owner:this.h.marketOwner(address)};}return roles;}
 async funds(address=this.h.address,minimum=20000000n,maxInputs=7){const selected=[];let total=0n;for(const entry of await this.h.marketFunding(address)){const e=this.h.hydrateMarketEntry(entry);selected.push(e);total+=e.amount;if(total>=minimum||selected.length>=maxInputs)break;}return selected;}
 async view(player){
  if(!this.templates?.ring||!this.templates?.delivery)return null;
  const a=await this.load(player),kind=a.stage.startsWith('ring')?'ring':'delivery',refund=a.stage.startsWith('refund')||a.stage==='complete';
  // A receipt may predate the public fields added later. Read its durable
  // journal and derive only the operation-specific output facts, without
  // mutating the saved state or returning the signed transaction bytes.
  const receipts=await Promise.all((a.receipts||[]).map(async receipt=>{
   const durable=await this.h.storage.get('v5:advanced-receipt:'+receipt.transactionId),journal=durable?.transactionId===receipt.transactionId&&durable?.status==='accepted'&&durable?.acceptingBlock===receipt.acceptingBlock&&durable?.phase===receipt.operation?durable:null;
   return {...receipt,...publicTransactionMetadata(journal?{...journal,operation:receipt.operation}:receipt)};
 }));
  const last=receipts.filter(r=>kind==='ring'?r.operation?.startsWith('ring'):refund?['refund-open','delivery-refund'].includes(r.operation):['role-funding','delivery-open','delivery-release'].includes(r.operation)).at(-1);
  const pendingMetadata=publicTransactionMetadata(a.pending||{}),metadata=a.pending?pendingMetadata:publicMetadataFields(last||{});
  const visual={kind,stage:a.pending?'pending':a.stage.endsWith('intro')?'intro':a.stage==='refund-ready'?'refund-ready':'ready',participants:kind==='ring'?[{name:'Grower',gives:{crops:3},receives:{ore:2}},{name:'Toolmaker',gives:{tools:1},receives:{crops:3}},{name:'Miner',gives:{ore:2},receives:{tools:1}}]:[{name:'Customer'},{name:'Courier'},{name:'Recipient'}],paymentSompi:'20000000',bondSompi:'10000000',receiptTrusted:true,receiptPresent:a.stage==='delivery-complete',refund,operation:a.pending?.phase||last?.operation||null,controlledRoles:true,currentDaa:a.currentDaa,deadlineDaa:a.refundDaa,transactionId:a.pending?.transactionId||last?.transactionId,acceptingBlock:a.pending?null:last?.acceptingBlock,...metadata};
  if(a.stage.endsWith('complete')){visual.stage='accepted';if(a.stage==='refund-complete'||a.stage==='complete'){visual.outcome='refund';visual.purpose='delivery_refund';}}
  return {stage:a.stage,kind,pending:a.pending?{status:a.pending.status,phase:a.pending.phase,transactionId:a.pending.transactionId,acceptingBlock:a.pending.acceptingBlock||null,...pendingMetadata}:null,receipts,visual};
 }
 async observedCell(asset,saved){const {entries}=await this.h.node(this.h.rpc.getUtxosByAddresses([asset.address])),found=entries.find(e=>same(e.outpoint,saved.outpoint));if(!found)fail('The saved agreement output is not currently spendable. Check its transaction.');const utxo=this.h.hydrateMarketEntry(this.h.marketEntry(found));if(saved.covenantId&&utxo.entry.covenantId?.toString()!==saved.covenantId)fail('The agreement identity changed.');return utxo;}
 async sign(plan,roles,fn){const keys=new Map(Object.values(roles).map(r=>[r.owner,r.key]));await fn(plan,(tx,i,{owner})=>{const key=keys.get(owner);if(!key)fail('Unknown demo signing role.');return this.h.sdk.createInputSignature(tx,i,key);});}
 async submit(player,a,plan,{phase,nextStage,roles,journal,action}){
  const treasury=await this.h.storage.get('state')||{};if(treasury.pending)fail('Another saved town transaction is settling. Continue once it is accepted.');
  const info=await this.h.node(this.h.rpc.getServerInfo());if(info.networkId!=='testnet-10'||!info.isSynced)fail('A synchronized Testnet-10 node is required.');
  const {sink}=await this.h.node(this.h.rpc.getSink());if(!hex.test(sink))fail('No acceptance checkpoint was supplied.');
  const tx=plan.transaction;tx.finalize();const id=await digest('v5 advanced payment\n'+player.id+'\n'+phase+'\n'+tx.id),transaction=tx.serializeToSafeJSON(),metadata=publicTransactionMetadata({phase,transaction});
  a.actions[action.id]={stage:action.stage};a.pending={id,playerId:player.id,purpose:'v5-advanced',phase,nextStage,status:'pending',transactionId:tx.id,transaction,...metadata,signedHash:await digest(transaction),feeRate:plan.mass?.feeRate||plan.feeRate||100,journal:journal?plain(journal):null,checkpoint:sink,scanCursor:null,acceptingBlock:null,feeSompi:String(plan.fee),states:plain(plan.states||[]),attempts:1,attemptedAt:this.h.now()};
  // The durable signed bytes and shared treasury lock precede every broadcast.
  await this.save(player,a,{state:{...treasury,pending:a.pending},['v5:transaction:'+tx.id]:id});
  try{const result=await this.h.node(this.h.rpc.submitTransaction({transaction:tx,allowOrphan:false}));if(result.transactionId!==tx.id)fail('Unexpected advanced transaction identity.');a.pending.status='submitted';await this.save(player,a,{state:{...treasury,pending:a.pending}});}catch{}
  return this.h.response(player,null,202);
 }
 async roleFunding(roles,feeRate){const sdk=this.h.sdk,entries=await this.funds(this.h.address,75000000n),selected=[];let total=0n;for(const e of entries){selected.push(e);total+=e.amount;if(total>75000000n)break;}if(total<=75000000n)fail('The town needs more test coins for the demonstration.');let fee=1000n;for(let n=0;n<8;n++){if(total<=70000000n+fee)fail('The town needs the role deposits plus the network fee.');const tx=new sdk.Transaction({version:1,inputs:selected.map(e=>({previousOutpoint:e.outpoint,utxo:e,signatureScript:'41'+'00'.repeat(64)+'01',sequence:0n,sigOpCount:0,computeBudget:16})),outputs:[{value:50000000n,scriptPublicKey:sdk.payToAddressScript(new sdk.Address(roles.customer.address))},{value:20000000n,scriptPublicKey:sdk.payToAddressScript(new sdk.Address(roles.courier.address))},{value:total-70000000n-fee,scriptPublicKey:sdk.payToAddressScript(new sdk.Address(this.h.address))}],lockTime:0n,subnetworkId:'00'.repeat(20),gas:0n,payload:''});const mass=publicTransactionMass(tx,{feeRate});if(fee<BigInt(mass.minimumFee)){fee=BigInt(mass.minimumFee);continue;}if(!mass.withinBlockLimits||fee>5000000n)fail('Role funding exceeds the demo fee limit.');tx.storageMass=BigInt(mass.storageMass);for(let i=0;i<tx.inputs.length;i++)tx.inputs[i].signatureScript=sdk.createInputSignature(tx,i,this.h.key);tx.finalize();return {transaction:tx,fee:String(fee),feeRate,states:[]};}fail('Unable to prepare role funding.');}
 async action(player,action){
  if(!this.templates?.ring||!this.templates?.delivery)fail('Advanced contract artifacts are not loaded.');
  if(!action||Object.keys(action).some(k=>!['id','type','stage'].includes(k))||typeof action.id!=='string'||!action.id||action.id.length>128||!STAGES.includes(action.stage))fail('Invalid guided agreement action.');
  const a=await this.load(player);if(a.pending)return this.reconcile(player,a);if(a.actions[action.id]){if(a.actions[action.id].stage!==action.stage)fail('Action identity was reused.');return this.h.response(player);}if(action.stage!==a.stage)return this.h.response(player);
  if(a.stage==='complete')return this.h.response(player);
  const onward={'ring-complete':'delivery-intro','delivery-complete':'refund-intro','refund-complete':'complete'};if(onward[a.stage]){a.actions[action.id]={stage:a.stage};a.stage=onward[a.stage];await this.save(player,a);return this.h.response(player);}
  const treasury=await this.h.storage.get('state');if(treasury?.pending)fail('Another town transaction is settling. Continue to check again.');
  const roles=await this.roles(player),sdk=this.h.sdk,world=await digest('v5 advanced world\n'+this.h.address+'\n'+player.id),fundingUtxos=await this.funds(this.h.address,a.stage==='ring-intro'?110000000n:20000000n),feeRate=Math.max(100,Math.ceil((await this.h.node(this.h.rpc.getFeeEstimate())).estimate.priorityBucket.feerate));
  if(a.stage==='ring-intro'){const states=names.map((_,role)=>ring.v5RingInitialState({owner:roles[['grower','toolmaker','miner'][role]].owner,issuer:roles.treasury.owner,world,role,resources:[{crops:3},{tools:1},{ore:2}][role]})),plan=ring.buildV5RingGenesis(sdk,{templates:this.templates.ring,states,deposit:'30000000',fundingUtxos,feeRate,maxFee:'20000000'});await this.sign(plan,roles,ring.signV5RingPlan);return this.submit(player,a,plan,{phase:'ring-genesis',nextStage:'ring-ready',roles,journal:ring.v5RingJournal(plan),action});}
  if(a.stage==='ring-ready'){const cells=[];for(const saved of a.ringCells||[]){const asset=ring.instantiateV5Ring(sdk,this.templates.ring,saved.state),utxo=await this.observedCell(asset,saved);cells.push({state:saved.state,utxo,certificate:saved.certificate});}const plan=ring.buildV5RingSwap(sdk,{templates:this.templates.ring,cells,fundingUtxos,feeRate,maxFee:'20000000'});await this.sign(plan,roles,ring.signV5RingPlan);return this.submit(player,a,plan,{phase:'ring',nextStage:'ring-complete',roles,journal:ring.v5RingJournal(plan),action});}
  if(['delivery-intro','refund-intro'].includes(a.stage)){
   const customerUtxos=await this.funds(roles.customer.address,20000000n,2),courierUtxos=await this.funds(roles.courier.address,10000000n,2);
   if(customerUtxos.reduce((n,e)=>n+e.amount,0n)<20000000n||courierUtxos.reduce((n,e)=>n+e.amount,0n)<10000000n){const plan=await this.roleFunding(roles,feeRate);return this.submit(player,a,plan,{phase:'role-funding',nextStage:a.stage,roles,action});}
   const state=delivery.v5DeliveryInitialState({customer:roles.customer.owner,courier:roles.courier.owner,recipient:roles.recipient.owner,world,deliveryId:await digest(world+'\n'+a.stage),paymentSompi:'20000000',bondSompi:'10000000',refundAgeDaa:100}),plan=delivery.buildV5DeliveryOpen(sdk,{artifact:this.templates.delivery,state,customerUtxos,courierUtxos,fundingUtxos:fundingUtxos.slice(0,10-customerUtxos.length-courierUtxos.length),feeRate,maxFee:'20000000'});await this.sign(plan,roles,delivery.signV5DeliveryPlan);return this.submit(player,a,plan,{phase:a.stage==='refund-intro'?'refund-open':'delivery-open',nextStage:a.stage==='refund-intro'?'refund-wait':'delivery-ready',roles,journal:delivery.v5DeliveryJournal(plan),action});
  }
  const saved=a.deliveryCell,asset=delivery.instantiateV5Delivery(sdk,this.templates.delivery,saved.state),utxo=await this.observedCell(asset,saved),cell={state:saved.state,utxo};
  if(a.stage==='refund-wait'){const info=await this.h.node(this.h.rpc.getServerInfo());a.currentDaa=Number(info.virtualDaaScore);a.refundDaa=Number(utxo.blockDaaScore)+saved.state.refund_age+1;if(a.currentDaa>=a.refundDaa)a.stage='refund-ready';await this.save(player,a);return this.h.response(player);}
  const release=a.stage==='delivery-ready';if(!release&&a.stage!=='refund-ready')fail('Unknown agreement stage.');
  const receipt=release?sdk.signScriptHash(await delivery.v5DeliveryReceiptDigest({state:cell.state,covenantId:utxo.entry.covenantId.toString()}),roles.recipient.key).slice(2,-2):null;
  const plan=(release?delivery.buildV5DeliveryRelease:delivery.buildV5DeliveryRefund)(sdk,{artifact:this.templates.delivery,cell,receipt,fundingUtxos,feeRate,maxFee:'20000000'});await this.sign(plan,roles,delivery.signV5DeliveryPlan);return this.submit(player,a,plan,{phase:release?'delivery-release':'delivery-refund',nextStage:release?'delivery-complete':'refund-complete',roles,journal:delivery.v5DeliveryJournal(plan),action});
 }
 async validateSaved(player,p){
  if(p.signedHash&&await digest(p.transaction)!==p.signedHash)fail('The saved signed transaction bytes changed.');
  const roles=await this.roles(player),world=await digest('v5 advanced world\n'+this.h.address+'\n'+player.id),sdk=this.h.sdk;
  let rebuilt;
  if(['ring-genesis','ring'].includes(p.phase)){
   const expected=names.map((_,role)=>ring.v5RingInitialState({owner:roles[['grower','toolmaker','miner'][role]].owner,issuer:roles.treasury.owner,world,role,resources:[{crops:3},{tools:1},{ore:2}][role]}));
   if(JSON.stringify(p.phase==='ring'?p.journal?.inputStates:p.journal?.states)!==JSON.stringify(expected))fail('The saved ring participants or resources changed.');
   rebuilt=ring.deriveV5RingPlan(sdk,{templates:this.templates.ring,journal:p.journal,issuer:roles.treasury.owner,world});
   if(ring.v5RingJournal(rebuilt).transaction!==p.transaction)fail('The saved ring signatures changed.');
  }else if(['delivery-open','refund-open','delivery-release','delivery-refund'].includes(p.phase)){
   const order=['refund-open','delivery-refund'].includes(p.phase)?'refund-intro':'delivery-intro';
   const expectedState=delivery.v5DeliveryInitialState({customer:roles.customer.owner,courier:roles.courier.owner,recipient:roles.recipient.owner,world,deliveryId:await digest(world+'\n'+order),paymentSompi:'20000000',bondSompi:'10000000',refundAgeDaa:100});
   rebuilt=delivery.deriveV5DeliveryPlan(sdk,{artifact:this.templates.delivery,journal:p.journal,expectedState});
   if(delivery.v5DeliveryJournal(rebuilt).transaction!==p.transaction)fail('The saved delivery signatures changed.');
  }else if(p.phase==='role-funding'){
   const tx=sdk.Transaction.deserializeFromSafeJSON(p.transaction),ownerScript=sdk.payToAddressScript(new sdk.Address(this.h.address)).script;
   if(tx.inputs.length<1||tx.inputs.length>7||tx.outputs.length!==3||tx.version!==1||tx.lockTime!==0n||tx.payload!==''||tx.inputs.some(i=>i.utxo.entry.covenantId||i.utxo.entry.scriptPublicKey.script!==ownerScript||i.sequence!==0n||i.computeBudget!==16||!/^41[0-9a-f]{128}01$/i.test(i.signatureScript)))fail('The saved role funding inputs changed.');
   const recipients=[roles.customer.address,roles.courier.address,this.h.address];if(tx.outputs.some((o,i)=>o.covenant||o.scriptPublicKey.script!==sdk.payToAddressScript(new sdk.Address(recipients[i])).script||o.value<=0n||(i<2&&o.value!==[50000000n,20000000n][i])))fail('The saved role funding recipients changed.');
   const fee=tx.inputs.reduce((n,i)=>n+i.utxo.amount,0n)-tx.outputs.reduce((n,o)=>n+o.value,0n),mass=publicTransactionMass(tx,{feeRate:p.feeRate||100});if(String(fee)!==p.feeSompi||fee>5000000n||fee<BigInt(mass.minimumFee)||!mass.withinBlockLimits)fail('The saved role funding fee changed.');
  }else fail('Unknown saved agreement phase.');
  if(rebuilt&&JSON.stringify(rebuilt.states)!==JSON.stringify(p.states))fail('The saved agreement successor states changed.');
 }
 async reconcile(player,a=undefined){
  a??=await this.load(player);const p=a.pending;if(!p)return this.h.response(player);
  const treasury=await this.h.storage.get('state');if(treasury?.pending?.id!==p.id)fail('The saved demonstration lock changed.');
  await this.validateSaved(player,p);
  const tx=this.h.sdk.Transaction.deserializeFromSafeJSON(p.transaction);tx.finalize();if(tx.id!==p.transactionId)fail('The saved demonstration transaction changed.');
  const evidence=await observePublicAcceptance(this.h.rpc,{id:p.transactionId,checkpoint:p.checkpoint,scanCursor:p.scanCursor,acceptingBlock:p.acceptingBlock},{call:q=>this.h.node(q),pages:3});Object.assign(p,evidence);
  if(hex.test(p.acceptingBlock||'')){
   const roles=await this.roles(player),saved=[];
   if(['ring-genesis','ring','delivery-open','refund-open'].includes(p.phase))for(let i=0;i<p.states.length;i++){
    const state=p.states[i],asset=p.phase.startsWith('ring')?ring.instantiateV5Ring(this.h.sdk,this.templates.ring,state):delivery.instantiateV5Delivery(this.h.sdk,this.templates.delivery,state),outpoint={transactionId:p.transactionId,index:i};
    const utxo=await this.observedCell(asset,{outpoint});const item={state,outpoint,covenantId:utxo.entry.covenantId.toString(),blockDaaScore:String(utxo.blockDaaScore)};
    if(p.phase.startsWith('ring'))item.certificate=this.h.sdk.signScriptHash(await ring.v5RingCertificateDigest({world:state.world,covenantId:item.covenantId,owner:state.owner}),roles.treasury.key).slice(2,-2);saved.push(item);
   }
   if(p.phase.startsWith('ring'))a.ringCells=saved;
   if(['delivery-open','refund-open'].includes(p.phase))a.deliveryCell=saved[0];
   const purpose=p.phase==='ring'?'ring':p.phase==='delivery-release'?'delivery_release':p.phase==='delivery-refund'?'delivery_refund':null,metadata=publicTransactionMetadata(p);
   if(!a.receipts.some(r=>r.transactionId===p.transactionId))a.receipts.push({kind:'advanced',operation:p.phase,purpose,transactionId:p.transactionId,acceptingBlock:p.acceptingBlock,feeSompi:p.feeSompi,at:this.h.now(),controlledRoles:true,...metadata});
   a.stage=p.nextStage;a.pending=null;await this.save(player,a,{state:{...treasury,pending:null},['v5:advanced-receipt:'+p.transactionId]:{...p,status:'accepted',acceptedAt:this.h.now()}});return this.h.response(player);
  }
  if(p.attempts<3&&this.h.now()-p.attemptedAt>15000&&this.h.env.V5_ENABLED==='true'){p.attempts++;p.attemptedAt=this.h.now();await this.save(player,a,{state:{...treasury,pending:p}});try{await this.h.node(this.h.rpc.submitTransaction({transaction:tx,allowOrphan:false}));}catch{}}
  await this.save(player,a,{state:{...treasury,pending:p}});return this.h.response(player,null,202);
 }
}
