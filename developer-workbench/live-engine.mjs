// Browser-only live escrow adapter. The caller owns keys and durable storage.
// No signer, wallet secret, faucet claim or automatic broadcast exists here.
import {instantiatePublicContract,buildPublicFunding,buildPublicSpend,signPublicPlan,validatePublicPlan,publicUnlockScript} from '../src/public-contracts.mjs';
import {observePublicAcceptance} from '../src/public-acceptance.mjs';
const NETWORK='testnet-10',HEX=/^[a-f0-9]{64}$/i,clone=v=>JSON.parse(JSON.stringify(v,(_,x)=>typeof x==='bigint'?String(x):x));
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
const timed=async promise=>{let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Testnet response timed out. Saved transaction bytes remain unchanged.')),15000);})]);}finally{clearTimeout(timer);}};
const point=o=>`${o.transactionId}:${o.index}`,spk=u=>u.entry?.scriptPublicKey||u.scriptPublicKey;
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const fail=message=>{throw Error(message);};
const strict=(value,fields)=>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!fields.includes(k)))fail('Unexpected live request fields.');};
const txShape=tx=>{const raw=JSON.parse(tx.serializeToSafeJSON());delete raw.id;raw.inputs.forEach(i=>delete i.signatureScript);return JSON.stringify(raw);};
function termsState(terms,buyer){strict(terms,['buyer','seller','arbiter','refundAfter','principal','maxFee']);if(terms.buyer!==buyer||![terms.buyer,terms.seller,terms.arbiter].every(x=>HEX.test(x||''))||new Set([terms.buyer,terms.seller,terms.arbiter]).size!==3||!Number.isSafeInteger(terms.refundAfter)||terms.refundAfter<500000000000||!Number.isSafeInteger(terms.principal)||terms.principal<20000000||terms.principal>100000000||terms.maxFee!==1000000)fail('The saved escrow policy is invalid.');return clone(terms);}
function summary(plan){return{feeSompi:String(plan.fee),feeRate:plan.mass.feeRate,inputs:plan.transaction.inputs.map(i=>({outpoint:{transactionId:i.previousOutpoint.transactionId,index:i.previousOutpoint.index},amountSompi:String(i.utxo.amount),scriptPublicKey:spk(i.utxo).script})),outputs:plan.transaction.outputs.map((o,index)=>({index,amountSompi:String(o.value),scriptPublicKey:o.scriptPublicKey.script,address:plan.sdk.addressFromScriptPublicKey(o.scriptPublicKey,NETWORK)?.toString()||null})),requiredSigners:[...plan.signers],mass:clone(plan.mass)};}

export async function createLiveEngine({sdk,wallet,rpc,save,snapshot=null,template}={}){
 if(!sdk||!wallet||!rpc||typeof save!=='function'||!template)fail('SDK, wallet, RPC, durable save and an escrow template are required.');
 const buyer=wallet.publicKey,address=wallet.address;
 if(!HEX.test(buyer||'')||typeof wallet.signInput!=='function'||new sdk.PublicKey('02'+buyer).toAddress(NETWORK).toString()!==address)fail('A matching Testnet wallet and public key are required.');
 if(template.kind!=='escrow'||template.network!==NETWORK)fail('Only the reviewed Testnet escrow template is supported live.');
 let data=snapshot?clone(snapshot):{version:1,network:NETWORK,walletAddress:address,buyer,stage:'empty',terms:null,escrow:null,review:null,pending:null,receipts:[],balanceSompi:null};
 if(data.version!==1||data.network!==NETWORK||data.walletAddress!==address||data.buyer!==buyer||!Array.isArray(data.receipts)||data.receipts.length>100)fail('Saved live project belongs to another wallet or network.');
 for(const r of data.receipts)delete r.recheckCursor;if(data.pending){data.pending.acceptingBlock=null;data.pending.scanCursor=null;}
 let queue=Promise.resolve(),poisoned=false;const verifiedReceipts=new Set();
 const lock=fn=>{const next=queue.then(()=>{if(poisoned)fail('Storage failed. Restore the saved project before another transaction.');return fn();});queue=next.catch(()=>{});return next;};
 const persist=async()=>{try{await save(clone(data));}catch(e){poisoned=true;throw Error('Could not durably save the project. Keep this project and restore its saved transaction journal before continuing.');}};
 const historyVerified=()=>data.receipts.every(r=>verifiedReceipts.has(r.transactionId));
 const assertHistory=()=>{if(!historyVerified())fail('Check the saved acceptance history before preparing or signing another transaction.');};
 const assertFresh=r=>{if(!Number.isSafeInteger(r.createdAt)||Date.now()-r.createdAt>120000||r.createdAt>Date.now()+5000)fail('This review expired. Prepare and approve a fresh review.');};
 const status=()=>clone({...data,stage:historyVerified()?data.stage:'checking',acceptanceVerified:historyVerified(),receipts:data.receipts.map(r=>({...r,status:verifiedReceipts.has(r.transactionId)?r.status:'unverified',acceptanceVerified:verifiedReceipts.has(r.transactionId)})),supportedExamples:['escrow'],live:true,automaticBroadcast:false,storageBlocked:poisoned});
 async function node(){const[info,dag,fees]=await Promise.all([timed(rpc.getServerInfo()),timed(rpc.getBlockDagInfo()),timed(rpc.getFeeEstimate())]);if(info.networkId!==NETWORK||dag.network&&dag.network!==NETWORK||!info.isSynced||!info.hasUtxoIndex)fail('A synchronized Testnet-10 node with the UTXO index is required.');const feeRate=Math.max(100,Math.ceil(fees.estimate?.priorityBucket?.feerate));if(!Number.isFinite(feeRate)||feeRate>100000||!Number.isSafeInteger(Number(dag.pastMedianTime)))fail('The node supplied unusable fee or time data.');return{feeRate,pastMedianTime:Number(dag.pastMedianTime)};}
 async function entries(at){const r=await timed(rpc.getUtxosByAddresses([at]));if(!Array.isArray(r.entries))fail('The node supplied no UTXO list.');return r.entries;}
 const contract=terms=>instantiatePublicContract(sdk,template,termsState(terms,buyer));
 function native(entries){const own=sdk.payToAddressScript(new sdk.Address(address));return entries.filter(e=>!e.entry?.covenantId&&!e.covenantId&&spk(e)?.version===0&&spk(e)?.script===own.script).sort((a,b)=>a.amount>b.amount?-1:1);}
 async function refreshBalance(){const own=native(await entries(address));data.balanceSompi=String(own.reduce((n,e)=>n+BigInt(e.amount),0n));return own;}
 async function observeInputs(plan){const addresses=[...new Set(plan.transaction.inputs.map(i=>sdk.addressFromScriptPublicKey(spk(i.utxo),NETWORK)?.toString()))];if(addresses.some(a=>!a))fail('Unrecognized input address.');const rows=(await Promise.all(addresses.map(entries))).flat();for(const i of plan.transaction.inputs){const e=rows.find(e=>point(e.outpoint)===point(i.previousOutpoint));if(!e||BigInt(e.amount)!==i.utxo.amount||spk(e)?.version!==spk(i.utxo).version||spk(e)?.script!==spk(i.utxo).script||e.entry?.covenantId||e.covenantId)fail('A reviewed input is no longer the observed spendable output. Prepare a fresh review.');}}
 function rebuild(record){
  if(!record||!['fund','release','refund','resolve'].includes(record.action)||typeof record.transaction!=='string'||record.transaction.length>200000||!Number.isFinite(record.feeRate)||record.feeRate<100||record.feeRate>100000)fail('Invalid saved transaction review.');
  const c=contract(record.terms),tx=sdk.Transaction.deserializeFromSafeJSON(record.transaction);if(tx.inputs.length<1||tx.inputs.length>8)fail('Invalid saved input count.');
  const p=record.action==='fund'?buildPublicFunding(sdk,{contract:c,fundingUtxos:tx.inputs.map(i=>i.utxo),owner:buyer,feeRate:record.feeRate}):buildPublicSpend(sdk,{contract:c,utxo:tx.inputs[0].utxo,entry:record.action,parameters:{paySeller:true},pastMedianTime:record.action==='refund'?record.terms.refundAfter:undefined,feeRate:record.feeRate});
  if(txShape(p.transaction)!==txShape(tx)||String(p.fee)!==record.feeSompi||!equal(summary(p).outputs,record.outputs)||!equal(p.signers,record.requiredSigners))fail('Saved bytes differ from the independently rebuilt policy.');return p;
 }
 async function verifyJournal(record){if(!record||await hash(record.transaction)!==record.signedHash)fail('Saved signed transaction bytes changed.');const plan=rebuild(record),tx=sdk.Transaction.deserializeFromSafeJSON(record.transaction);tx.finalize();if(tx.id!==record.transactionId)fail('Saved transaction identity changed.');return{plan,tx};}
 async function observeHistory(){
  for(const r of data.receipts){await verifyJournal(r);const previouslyVerified=verifiedReceipts.has(r.transactionId),evidence=await observePublicAcceptance(rpc,{id:r.transactionId,checkpoint:r.checkpoint,scanCursor:previouslyVerified?r.scanCursor:r.recheckCursor||null,acceptingBlock:previouslyVerified?r.acceptingBlock:null},{call:timed,pages:3});
   r.recheckCursor=evidence.scanCursor;if(HEX.test(evidence.acceptingBlock||'')){Object.assign(r,evidence);r.status='accepted';verifiedReceipts.add(r.transactionId);}else{r.acceptingBlock=null;r.status='unconfirmed';verifiedReceipts.delete(r.transactionId);}
  }
  if(!historyVerified()){data.escrow=null;data.stage='checking';return false;}
  const last=data.receipts.at(-1);if(last&&!data.pending&&!data.review){data.terms=clone(last.terms);if(last.action==='fund'){const c=contract(last.terms),found=(await entries(c.address)).find(e=>e.outpoint.transactionId===last.transactionId&&e.outpoint.index===0&&BigInt(e.amount)===BigInt(last.terms.principal)&&spk(e)?.script===c.lockingScript&&!e.entry?.covenantId);if(!found){data.escrow=null;data.stage='unavailable';return false;}data.escrow={outpoint:{transactionId:last.transactionId,index:0},address:c.address,amountSompi:String(found.amount),terms:clone(last.terms)};data.stage='funded';}else{data.escrow=null;data.stage='complete';}}
  return true;
 }
 async function check(){return lock(async()=>{
  await node();await observeHistory();
  if(data.review){const r=data.review;if(await hash(JSON.stringify({...r,id:undefined}))!==r.id)fail('Saved unsigned review changed.');rebuild(r);}
  if(data.pending){const p=data.pending;if(await hash(p.transaction)!==p.signedHash)fail('Saved signed transaction bytes changed.');const rebuilt=rebuild(p),tx=sdk.Transaction.deserializeFromSafeJSON(p.transaction);tx.finalize();if(tx.id!==p.transactionId)fail('Saved transaction identity changed.');
   const evidence=await observePublicAcceptance(rpc,{id:p.transactionId,checkpoint:p.checkpoint,scanCursor:p.scanCursor,acceptingBlock:p.acceptingBlock},{call:timed,pages:3});Object.assign(p,evidence);
   if(HEX.test(p.acceptingBlock||'')){
    if(p.action==='fund'){const c=contract(p.terms),rows=await entries(c.address),found=rows.find(e=>e.outpoint.transactionId===p.transactionId&&e.outpoint.index===0&&BigInt(e.amount)===BigInt(p.terms.principal)&&spk(e)?.script===c.lockingScript&&!e.entry?.covenantId);if(!found){await persist();fail('Funding was accepted, but its escrow output is not currently spendable. Inspect the saved transaction.');}data.escrow={outpoint:{transactionId:p.transactionId,index:0},address:c.address,amountSompi:String(found.amount),terms:clone(p.terms)};data.stage='funded';}
    else{data.escrow=null;data.stage='complete';}
    if(!data.receipts.some(r=>r.transactionId===p.transactionId))data.receipts.push({...clone(p),status:'accepted',acceptedAt:Date.now()});verifiedReceipts.add(p.transactionId);data.terms=clone(p.terms);data.pending=null;data.review=null;
   }
  }
  await refreshBalance();await persist();return status();
 });}
 async function prepare(request){return lock(async()=>{
  assertHistory();strict(request,['action','terms']);const{action}=request;if(!['fund','release','refund','resolve'].includes(action))fail('Choose a supported live escrow action.');if(data.pending)fail('Check the saved pending transaction before another action.');const info=await node();let p,terms;
  if(action==='fund'){
   if(data.escrow||data.receipts.at(-1)?.action==='fund')fail('This escrow is already funded. Spend it before funding another.');strict(request.terms,['principalSompi','sellerPublicKey','arbiterPublicKey','refundDelayMs']);const t=request.terms;if(typeof t.principalSompi!=='string'||!/^\d{1,9}$/.test(t.principalSompi)||!Number.isSafeInteger(t.refundDelayMs)||t.refundDelayMs<60000||t.refundDelayMs>86400000)fail('Choose 0.2–1 tKAS and a refund delay between one minute and one day.');terms=termsState({buyer,seller:t.sellerPublicKey,arbiter:t.arbiterPublicKey,principal:Number(t.principalSompi),refundAfter:info.pastMedianTime+t.refundDelayMs,maxFee:1000000},buyer);const c=contract(terms),own=await refreshBalance();let total=0n,selected=[];for(const e of own.slice(0,8)){selected.push(e);total+=BigInt(e.amount);if(total>=BigInt(terms.principal)+1000000n)break;}if(!selected.length)fail('The wallet needs an observed native Testnet balance.');p=buildPublicFunding(sdk,{contract:c,fundingUtxos:selected,owner:buyer,feeRate:info.feeRate});
  }else{
   if(request.terms!==undefined)fail('Funded escrow terms cannot be changed.');const funded=data.receipts.at(-1);if(!funded||funded.action!=='fund'||!verifiedReceipts.has(funded.transactionId))fail('An accepted and observed escrow output is required.');terms=termsState(funded.terms,buyer);const c=contract(terms),rows=await entries(c.address),utxo=rows.find(e=>e.outpoint.transactionId===funded.transactionId&&e.outpoint.index===0);if(!utxo)fail('The accepted escrow output is no longer spendable.');p=buildPublicSpend(sdk,{contract:c,utxo,entry:action,parameters:{paySeller:true},pastMedianTime:info.pastMedianTime,feeRate:info.feeRate});
  }
  const review={action,terms,transaction:p.transaction.serializeToSafeJSON(),...summary(p),network:NETWORK,requiresApproval:true,createdAt:Date.now()};review.id=await hash(JSON.stringify(review));data.review=review;data.stage='review';await persist();return clone(review);
 });}
 async function confirm(reviewId){return lock(async()=>{
  assertHistory();if(data.pending)fail('This project already has signed pending work. Check its saved transaction.');const r=data.review;if(!r||r.id!==reviewId)fail('Approve the current reviewed transaction.');if(await hash(JSON.stringify({...r,id:undefined}))!==r.id)fail('The stored review changed.');assertFresh(r);const info=await node();assertFresh(r);if(info.feeRate>r.feeRate)fail('The required fee increased. Prepare and review the transaction again.');if(r.action==='refund'&&info.pastMedianTime<r.terms.refundAfter)fail('The node median time has not reached the refund deadline.');const p=rebuild(r);await observeInputs(p);const{sink}=await timed(rpc.getSink());if(!HEX.test(sink||''))fail('The node did not supply an acceptance checkpoint.');assertFresh(r);await signPublicPlan(p,(tx,index,signer)=>wallet.signInput(tx,index,signer));assertFresh(r);validatePublicPlan(p);p.transaction.finalize();const signed=p.transaction.serializeToSafeJSON();
  data.pending={...clone(r),transaction:signed,transactionId:p.transaction.id,signedHash:await hash(signed),checkpoint:sink,scanCursor:null,acceptingBlock:null,status:'saved',attempts:0};data.review=null;data.stage='pending';await persist();
  data.pending.attempts=1;data.pending.status='submitting';await persist();
  try{const reply=await timed(rpc.submitTransaction({transaction:p.transaction,allowOrphan:false}));if(reply.transactionId!==p.transaction.id)fail('The node returned an unexpected transaction identity.');data.pending.status='submitted';}catch(e){data.pending.status='uncertain';data.pending.error=String(e.message).slice(0,300);}await persist();return status();
 });}
 async function cancelReview(id){return lock(async()=>{if(data.pending)fail('Signed pending work cannot be discarded.');if(!data.review||data.review.id!==id)fail('No matching unsigned review.');data.review=null;data.stage=data.escrow?'funded':data.receipts.length?'complete':'empty';await persist();return status();});}
 async function retry(transactionId){return lock(async()=>{
  const p=data.pending;if(!p||p.transactionId!==transactionId)fail('No matching signed pending transaction.');if(p.attempts>=3)fail('The same saved transaction has reached its retry limit. Check its acceptance or inspect the node error.');await node();const{tx}=await verifyJournal(p);const evidence=await observePublicAcceptance(rpc,{id:p.transactionId,checkpoint:p.checkpoint,scanCursor:p.scanCursor,acceptingBlock:p.acceptingBlock},{call:timed,pages:3});Object.assign(p,evidence);if(HEX.test(p.acceptingBlock||'')){await persist();return status();}await observeInputs({transaction:tx});p.attempts++;p.status='submitting';await persist();try{const result=await timed(rpc.submitTransaction({transaction:tx,allowOrphan:false}));if(result.transactionId!==p.transactionId)fail('The node returned an unexpected transaction identity.');p.status='submitted';delete p.error;}catch(e){p.status='uncertain';p.error=String(e.message).slice(0,300);}await persist();return status();
 });}
 return{status,prepare,confirm,check,cancelReview,retry};
}
