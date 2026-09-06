import {instantiatePublicToken,buildTokenGenesis,buildTokenMove,buildTokenExchange} from './public-token.mjs';
import {instantiatePublicReceipt,buildBackedGenesis,buildBackedMove} from './public-receipt.mjs';
import {buildPublicPayment,signPublicAssetPlan,validatePublicAssetPlan} from './public-asset-signing.mjs';
import {publicAssetJournal,derivePublicAssetRecoveryPlan} from './public-asset-recovery.mjs';
import {observePublicAcceptance} from './public-acceptance.mjs';
const network='testnet-10',kas=n=>`${(Number(n)/1e8).toLocaleString('en-US',{maximumFractionDigits:8})} tKAS`;
const pubHex=v=>typeof v==='string'&&/^[a-f0-9]{64}$/i.test(v);
const element=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
function validFields(value,names){return value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).every(key=>names.includes(key));}
const metadata=asset=>asset.kind==='token'?{issuer:asset.issuer,cap:asset.cap}:{series:asset.series,maxFee:asset.maxFee};
const instantiate=(sdk,templates,kind,record)=>kind==='token'?instantiatePublicToken(sdk,templates.token,record):instantiatePublicReceipt(sdk,templates.receipt,record);
export function validatePublicAssetsState(sdk,templates,state,owners){
 if(state===undefined)return {version:1,collections:[],activity:[]};
 if(!validFields(state,['version','collections','activity'])||state.version!==1||!Array.isArray(state.collections)||state.collections.length>8||!Array.isArray(state.activity)||state.activity.length>24)throw new Error('Invalid asset recovery state.');
 for(const collection of state.collections){
  if(!validFields(collection,['kind','covenantId','identity','cells'])||!['token','receipt'].includes(collection.kind)||!pubHex(collection.covenantId)||!Array.isArray(collection.cells)||collection.cells.length>8)throw new Error('Invalid recovered collection.');
  for(const cell of collection.cells){
   if(!validFields(cell,['state','script','address','transactionId','index','amount'])||!pubHex(cell.transactionId)||!Number.isInteger(cell.index)||cell.index<0||cell.index>7||!/^[0-9]+$/.test(cell.amount)||BigInt(cell.amount)>100000000n||BigInt(cell.amount)<=0n)throw new Error('Invalid recovered holding.');
   const rebuilt=instantiate(sdk,templates,collection.kind,{...collection.identity,state:cell.state});
   if(rebuilt.script!==cell.script||rebuilt.address!==cell.address||!owners.includes(rebuilt.state.owner))throw new Error('Recovered holding does not match this wallet and template.');
  }
 }
 const journals=new Map(),collections=new Set(),holdings=new Set();
 for(const record of state.activity){
  if(!validFields(record,['journal','attempted','submitted','observed','checkpoint','scanCursor','acceptingBlock','scanCaughtUp','outputsObserved','applied']))throw new Error('Invalid asset activity fields.');
  const plan=derivePublicAssetRecoveryPlan(sdk,{templates,journal:record.journal,keysPublic:owners});
  if(journals.has(record.journal.id))throw new Error('Duplicate recovered asset transaction.');
  journals.set(record.journal.id,{plan,kind:record.journal.kind});
  if(record.checkpoint&&!pubHex(record.checkpoint))throw new Error('Invalid asset receipt checkpoint.');
  record.observed=false;record.outputsObserved=false;record.acceptingBlock=null;record.scanCursor=record.checkpoint||null;
 }
 for(const collection of state.collections){
  if(collections.has(collection.covenantId))throw new Error('Duplicate recovered collection.');
  collections.add(collection.covenantId);
  for(const cell of collection.cells){
   const key=`${cell.transactionId}:${cell.index}`,saved=journals.get(cell.transactionId),output=saved?.plan.transaction.outputs[cell.index];
   if(holdings.has(key)||saved?.kind!==collection.kind||saved?.plan.covenantId!==collection.covenantId||!output?.covenant||output.covenant.covenantId.toString()!==collection.covenantId||output.scriptPublicKey.version!==0||output.scriptPublicKey.script!==sdk.payToScriptHashScript(cell.script).script||String(output.value)!==cell.amount)throw new Error('Recovered holding is not an exact signed journal output.');
   holdings.add(key);
  }
 }
 return state;
}
export function createPublicAssetsUI(panel,host){
 let mode='token',review=null,reviewTime=0,signed=false,recovery=false,recoverySaved=false,selectedCellId='';
 panel.innerHTML=`<div class="asset-intro"><p class="eyebrow" data-asset-label></p><h2 data-asset-title></h2><p data-asset-description></p></div><div class="asset-product"><div class="asset-holdings" data-asset-holdings></div><div class="asset-controls"><label>Receiving account<select data-asset-recipient></select></label><div data-asset-create-area><button class="primary" data-asset-create></button></div><div data-asset-payment-area hidden><label>Amount · tKAS<input type="number" min="0.00000001" max="1" step="0.01" value="0.05" data-asset-amount></label><button class="primary" data-asset-pay>Review payment</button></div><div class="asset-operation-list" data-asset-operations></div><p class="public-small" data-asset-limits></p></div></div><section class="public-review" data-asset-review hidden tabindex="-1"><h3 data-asset-review-title>Review transaction</h3><dl data-asset-review-details></dl><div class="public-action-row"><button class="primary" data-asset-submit>Sign and save recovery</button><button data-asset-cancel>Cancel</button></div><p class="public-small">The recovery download includes the exact signed transaction. Save it before submitting.</p></section><section class="public-receipt" data-asset-activity hidden><h3>Activity</h3><p data-asset-status></p><a data-asset-tx target="_blank" rel="noopener noreferrer"></a><div class="public-action-row"><button data-asset-check>Check node observation</button><button data-asset-resume>Review saved transaction</button></div></section>`;
 const q=name=>panel.querySelector(`[data-asset-${name}]`),text=(name,value)=>q(name).textContent=value;
 const state=()=>host.getState()||{version:1,collections:[],activity:[]};
 const ctx=()=>host.context(),latest=()=>state().activity.at(-1),pending=()=>Boolean(latest()&&!latest().observed);
 const owners=()=>ctx().owners,recipient=()=>owners()[Number(q('recipient').value)],collection=()=>state().collections.findLast(c=>c.kind===mode&&c.cells.length);
 const assets=c=>c.cells.map(cell=>({...cell,asset:instantiate(ctx().sdk,ctx().templates,c.kind,{...c.identity,state:cell.state})}));
 function display(){
  const c=ctx();if(!c.sdk)return;
  const selected=q('recipient').value;q('recipient').replaceChildren(...c.owners.map((_,index)=>{const option=element('option',`${['Main','Second','Third'][index]} account${c.balances?` · ${kas(c.balances[index])}`:''}`);option.value=index;return option;}));q('recipient').value=selected||String((c.account+1)%3);
  const descriptions={token:['Learning token','Create and move a token.','A custom token with a fixed issuance cap. Its units are separate from the test coins carried by each holding.'],receipt:['Backed receipt','Hold a claim on test coins.','Every receipt unit is backed by a sompi in its contract. Move or split the claim, then redeem test coins to the holder.'],payment:['Test payment','Send a small amount.','Move Testnet-10 coins between your example accounts. Review the destination, amount, and fee first.']};
  text('label',descriptions[mode][0]);text('title',descriptions[mode][1]);text('description',descriptions[mode][2]);
  q('payment-area').hidden=mode!=='payment';q('create-area').hidden=mode==='payment'||Boolean(collection());
  text('create',mode==='token'?'Review token creation · 0.5 tKAS':'Review backed receipt · 0.5 tKAS');
  text('limits',mode==='payment'?'Maximum payment: 1 tKAS. Fee cap: 0.01 tKAS.':mode==='token'?'Initial cell: 0.5 tKAS. Cap: 1,000 token units. Token actions may cost up to 0.03 tKAS; cell value is not a redemption promise.':'Initial backing: 0.5 tKAS. A selected account separately pays transaction fees, capped at 0.03 tKAS.');
  q('holdings').replaceChildren();q('operations').replaceChildren();
  const current=collection();
  if(mode==='payment'){q('holdings').append(element('span','From your selected account','public-small'),element('strong',['Main account','Second account','Third account'][c.account],'asset-balance'),element('span','→','asset-transfer-arrow'),element('span','To the receiving account selected beside this panel','public-small'));}
  else if(!current){q('holdings').append(element('span',mode==='token'?'LEARN · local display name':'tKAS receipt','public-small'),element('strong',mode==='token'?'1,000':'0.5 tKAS','asset-balance'),element('p',mode==='token'?'Capacity to issue. Start with one issuer holding.':'Full backing. Redemption returns the claimed test coins.'));}
  else{
   const cells=assets(current),holders=cells.filter(cell=>!cell.state.isMinter),total=holders.reduce((sum,cell)=>sum+cell.state.quantity,0);
   q('holdings').append(element('span',mode==='token'?'Token units held':'Claim on test coins','public-small'),element('strong',mode==='token'?total.toLocaleString():kas(total),'asset-balance'));
   for(const cell of cells){const row=element('button',undefined,'asset-cell');row.type='button';row.setAttribute('aria-pressed',String(selectedCellId===`${cell.transactionId}:${cell.index}`));row.addEventListener('click',()=>{selectedCellId=`${cell.transactionId}:${cell.index}`;display();});row.append(element('span',`${['Main','Second','Third'][c.owners.indexOf(cell.state.owner)]} account${cell.state.isMinter?' · issuer':''}`),element('strong',mode==='token'?`${cell.state.quantity} ${cell.state.isMinter?'unissued':'units'}`:kas(cell.state.quantity)),element('small',`Contract value ${kas(cell.amount)}`));q('holdings').append(row);}
   const button=(label,fn)=>{const b=element('button',label);b.addEventListener('click',()=>host.action(fn));q('operations').append(b);};
   if(mode==='token'){
    const minter=cells.find(cell=>cell.state.isMinter);if(minter?.state.quantity>=100)button('Mint 100 units',()=>tokenOperation('mint'));
    if(holders.length){button('Move a holding',()=>tokenOperation('move'));button('Split a holding',()=>tokenOperation('split'));button('Exchange holding for 0.05 tKAS',()=>tokenOperation('exchange'));}
    if(holders.length>=2)button('Merge two holdings',()=>tokenOperation('merge'));
    if(minter&&holders.length)button('Burn a holding',()=>tokenOperation('burn'));
   }else{
    button('Move receipt',()=>receiptOperation('move'));button('Split receipt',()=>receiptOperation('split'));if(cells.length>=2)button('Merge two receipts',()=>receiptOperation('merge'));button('Redeem half',()=>receiptOperation('half'));button('Redeem full holding',()=>receiptOperation('full'));
   }
  }
  showActivity();
 }
 async function funds(index=ctx().account){const c=ctx(),address=c.addresses[index],{entries}=await c.call(c.rpc.getUtxosByAddresses([address]));return entries.filter(e=>!e.entry.covenantId&&e.entry.scriptPublicKey.script===c.sdk.payToAddressScript(new c.sdk.Address(address)).script).sort((a,b)=>a.amount>b.amount?-1:a.amount<b.amount?1:0).slice(0,8);}
 async function currentCells(){const current=collection();if(!current)host.fail('Create a collection first.');const c=ctx(),items=assets(current),{entries}=await c.call(c.rpc.getUtxosByAddresses([...new Set(items.map(cell=>cell.address))]));return items.map(cell=>{const utxo=entries.find(e=>e.outpoint.transactionId===cell.transactionId&&e.outpoint.index===cell.index&&e.entry.scriptPublicKey.version===0&&e.entry.scriptPublicKey.script===c.sdk.payToScriptHashScript(cell.asset.script).script&&String(e.amount)===cell.amount&&e.entry.covenantId?.toString()===current.covenantId);return {...cell,utxo};}).filter(cell=>cell.utxo);}
 function requireReady(){if(host.pending()||pending())host.fail('Check the unresolved transaction before creating another.');if(!host.hasRecovery())host.fail('Save your wallet recovery file first.');if(state().activity.length>=24)host.fail('This small session has reached its transaction limit. Save its recovery and use a new disposable wallet.');}
 function showReview(plan,title){const prior=state().collections.find(c=>c.covenantId===plan.covenantId);const incoming=plan.transaction.inputs.filter(i=>i.utxo.entry.covenantId).length,outgoing=plan.transaction.outputs.filter(o=>o.covenant).length;if(prior&&prior.cells.length-incoming+outgoing>8)host.fail('Merge existing holdings before creating more cells.');if(!prior&&outgoing&&state().collections.length>=8)host.fail('This recovery file has reached its collection limit.');review=plan;reviewTime=Date.now();signed=false;recovery=false;recoverySaved=false;q('review').hidden=false;text('review-title',title);text('submit','Sign and save recovery');q('submit').disabled=false;const rows=[['Network',network],['Fee',kas(plan.fee)],...plan.transaction.outputs.map((o,index)=>[`Output ${index+1} · ${kas(o.value)}`,ctx().sdk.addressFromScriptPublicKey(o.scriptPublicKey,network).toString()])];q('review-details').replaceChildren(...rows.flatMap(([name,value])=>[element('dt',name),element('dd',value)]));q('review').focus();}
 async function create(){requireReady();const {feeRate}=await host.nodeInfo();const c=ctx(),available=await funds();if(available.reduce((sum,u)=>sum+u.amount,0n)<=50000000n)host.fail('The selected account needs more than 0.5 tKAS to cover creation and its fee. Receive test coins, then refresh.');if(mode==='receipt'&&(!available[0]||available[0].amount<=50000000n))host.fail('Receipt creation needs one test-coin output larger than 0.5 tKAS. Receive a small refill into this account.');if(mode==='token'){const token=instantiatePublicToken(c.sdk,c.templates.token,{issuer:c.owners[c.account],cap:1000,state:{owner:c.owners[c.account],quantity:1000,isMinter:true}});showReview(buildTokenGenesis(c.sdk,{fundingUtxos:available,token,cellAmount:50000000n,changeAddress:c.addresses[c.account],feeRate}),'Create token issuance capacity');}else{const series=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join(''),receipt=instantiatePublicReceipt(c.sdk,c.templates.receipt,{series,maxFee:3000000,state:{owner:c.owners[c.account],quantity:50000000}});showReview(buildBackedGenesis(c.sdk,{fundingUtxos:available.slice(0,1),receipt,sponsorPublicKey:c.owners[c.account],feeRate}),'Create a fully backed receipt');}}
 async function tokenOperation(operation){
  requireReady();const {feeRate}=await host.nodeInfo();const c=ctx(),cells=await currentCells(),minter=cells.find(cell=>cell.state.isMinter),holders=cells.filter(cell=>!cell.state.isMinter),selected=holders.find(cell=>`${cell.transactionId}:${cell.index}`===selectedCellId)||holders[0];
  const successor=(source,owner,quantity,isMinter=false)=>instantiatePublicToken(c.sdk,c.templates.token,{issuer:source.asset.issuer,cap:source.asset.cap,state:{owner,quantity,isMinter}});
  let inputs,outputs,code=0,fundingUtxos=[],payments=[];
  if(operation==='mint'){if(!minter||minter.state.quantity<100)host.fail('No spendable issuer capacity is available.');inputs=[minter];const half=BigInt(minter.amount)/2n;outputs=[{token:successor(minter,minter.state.owner,minter.state.quantity-100,true),amount:half},{token:successor(minter,recipient(),100),amount:BigInt(minter.amount)-half}];code=1;}
  else if(operation==='merge'){if(holders.length<2)host.fail('Two spendable holdings are required.');inputs=holders.slice(0,2);outputs=[{token:successor(inputs[0],recipient(),inputs.reduce((n,x)=>n+x.state.quantity,0)),amount:inputs.reduce((n,x)=>n+BigInt(x.amount),0n)}];}
  else if(operation==='burn'){if(!minter||!selected)host.fail('Issuer and holder outputs are both required.');inputs=[minter,selected];outputs=[{token:successor(minter,minter.state.owner,minter.state.quantity,true),amount:BigInt(minter.amount)+BigInt(selected.amount)}];code=2;}
  else{if(!selected)host.fail('No spendable holder output is available.');inputs=[selected];if(operation==='exchange'){if(recipient()===selected.state.owner)host.fail('Choose another account as the buyer.');const buyerIndex=c.owners.indexOf(recipient());showReview(buildTokenExchange(c.sdk,{sellerToken:{token:selected.asset,utxo:selected.utxo},buyerFundingUtxos:await funds(buyerIndex),buyerToken:successor(selected,recipient(),selected.state.quantity),price:5000000n,sellerAddress:c.addresses[c.owners.indexOf(selected.state.owner)],buyerChangeAddress:c.addresses[buyerIndex],feeRate}),'Exchange the token holding for 0.05 tKAS');return;}
   if(operation==='split'){if(selected.state.quantity<2)host.fail('At least two units are needed to split.');fundingUtxos=await funds();const total=fundingUtxos.reduce((n,u)=>n+u.amount,0n);if(total<=20000000n)host.fail('Splitting needs 0.2 tKAS of extra cell value plus change in the selected account.');payments=[{address:c.addresses[c.account],amount:total-20000000n}];const value=BigInt(selected.amount)+20000000n,half=value/2n,quantity=Math.floor(selected.state.quantity/2);outputs=[{token:successor(selected,selected.state.owner,quantity),amount:half},{token:successor(selected,recipient(),selected.state.quantity-quantity),amount:value-half}];}
   else{if(recipient()===selected.state.owner)host.fail('Choose another receiving account to move this holding.');outputs=[{token:successor(selected,recipient(),selected.state.quantity),amount:BigInt(selected.amount)}];}
  }
  showReview(buildTokenMove(c.sdk,{tokenInputs:inputs.map(i=>({token:i.asset,utxo:i.utxo})),successors:outputs,operation:code,fundingUtxos,payments,feeRate}),`${operation[0].toUpperCase()+operation.slice(1)} token holding`);
 }
 async function receiptOperation(operation){
  requireReady();const {feeRate}=await host.nodeInfo();const c=ctx(),cells=await currentCells(),first=cells.find(cell=>`${cell.transactionId}:${cell.index}`===selectedCellId)||cells[0];if(!first)host.fail('No spendable receipt is available.');const sponsor=(await funds())[0];if(!sponsor)host.fail('The selected account needs test coins for the receipt fee.');const make=(owner,quantity)=>instantiatePublicReceipt(c.sdk,c.templates.receipt,{...collection().identity,state:{owner,quantity}});let inputs=[first],successors,route='transfer';
  if(operation==='merge'){if(cells.length<2)host.fail('Two spendable receipts are required.');inputs=cells.slice(0,2);successors=[make(recipient(),inputs.reduce((n,i)=>n+i.state.quantity,0))];}
  else if(operation==='split'){const half=Math.floor(first.state.quantity/2);if(half<1)host.fail('The receipt is too small to split.');successors=[make(first.state.owner,half),make(recipient(),first.state.quantity-half)];}
  else if(operation==='half'){const half=Math.floor(first.state.quantity/2);if(half<1)host.fail('The receipt is too small for partial redemption.');successors=[make(first.state.owner,half)];route='redeem';}
  else if(operation==='full'){successors=[];route='redeem';}
  else{if(recipient()===first.state.owner)host.fail('Choose another receiving account to move this receipt.');successors=[make(recipient(),first.state.quantity)];}
  showReview(buildBackedMove(c.sdk,{receiptInputs:inputs.map(i=>({receipt:i.asset,utxo:i.utxo})),successors,operation:route,sponsorUtxo:sponsor,sponsorPublicKey:c.owners[c.account],feeRate}),operation==='full'?'Redeem the complete holding':operation==='half'?'Redeem half the holding':`${operation[0].toUpperCase()+operation.slice(1)} receipt`);
 }
 async function pay(){requireReady();const {feeRate}=await host.nodeInfo();const raw=q('amount').value;if(!/^\d+(?:\.\d{1,8})?$/.test(raw))host.fail('Enter a test amount with at most eight decimal places.');const [whole,fraction='']=raw.split('.'),amount=BigInt(whole)*100000000n+BigInt(fraction.padEnd(8,'0'));if(recipient()===owners()[ctx().account])host.fail('Choose another receiving account.');showReview(buildPublicPayment(ctx().sdk,{fundingUtxos:await funds(),owner:owners()[ctx().account],recipient:recipient(),amount,feeRate}),'Send a test payment');}
 function showActivity(){const record=latest();q('activity').hidden=!record;if(!record)return;text('status',record.acceptingBlock?'Included in this node’s accepted-chain history.':record.outputsObserved?'Exact outputs are visible at this node.':record.submitted?'Submitted; check the node’s observation.':'Saved signed transaction; submission may be pending or uncertain.');q('tx').textContent=record.journal.id;q('tx').href=`https://tn10.kaspa.stream/transactions/${record.journal.id}`;q('resume').disabled=record.observed;}
 async function save(stateValue){await host.saveState(stateValue);}
 async function submit(){
  if(host.pending())host.fail('Check the unresolved contract transaction first.');if(!review)host.fail('Review an action first.');const current=await host.nodeInfo();validatePublicAssetPlan(review);if(current.feeRate>review.mass.feeRate)host.fail('The current fee estimate increased. Cancel and review again before signing, or wait before retrying saved bytes.');
  if(!signed){if(Date.now()-reviewTime>60000)host.fail('Review expired. Cancel and review the current holdings.');const {sink}=await ctx().call(ctx().rpc.getSink());await signPublicAssetPlan(review,host.sign);const value=state(),journal=publicAssetJournal(review);if(!value.activity.some(record=>record.journal.id===journal.id))value.activity.push({journal,attempted:false,submitted:false,observed:false,checkpoint:sink,applied:false});signed=true;await save(value);}
  if(!recoverySaved){await save(state());host.download(await host.encrypted());recoverySaved=true;text('submit','I saved recovery · submit transaction');showActivity();host.message('Signed recovery saved. Save the downloaded file before submitting.');return;}
  const record=latest();if(record.attempted&&!recovery)host.fail('This transaction was already attempted. Review its saved transaction to retry the identical bytes.');record.attempted=true;await save(state());q('submit').disabled=true;
  try{const result=await ctx().call(ctx().rpc.submitTransaction({transaction:review.transaction,allowOrphan:false}));if(result.transactionId!==record.journal.id)host.fail('Unexpected transaction ID. Treat the submission as uncertain.');record.submitted=true;await save(state());}finally{q('review').hidden=true;review=null;showActivity();}
  await check();
 }
 function apply(plan,record){
  if(record.journal.kind==='payment')return;
  const value=state(),kind=record.journal.kind,identity=plan.operation===null?kind==='token'?{issuer:plan.genesis.issuer,cap:plan.genesis.cap}:{series:plan.genesis.series,maxFee:plan.genesis.maxFee}:metadata((plan.tokens??plan.receipts)[0]);
  let current=value.collections.find(c=>c.covenantId===plan.covenantId);if(!current){if(value.collections.length>=8)host.fail('Collection limit reached.');current={kind,covenantId:plan.covenantId,identity,cells:[]};value.collections.push(current);}
  const spent=new Set(plan.transaction.inputs.map(i=>`${i.previousOutpoint.transactionId}:${i.previousOutpoint.index}`));current.cells=current.cells.filter(cell=>!spent.has(`${cell.transactionId}:${cell.index}`)&&cell.transactionId!==plan.transaction.id);
  const next=plan.operation===null?[plan.genesis.state]:plan.states;
  for(let index=0;index<next.length;index++){const asset=instantiate(ctx().sdk,ctx().templates,kind,{...identity,state:next[index]});current.cells.push({state:asset.state,script:asset.script,address:asset.address,transactionId:plan.transaction.id,index,amount:String(plan.transaction.outputs[index].value)});}
  record.applied=true;
 }
 async function check(){
  const record=latest();if(!record)host.fail('No saved asset transaction.');await host.nodeInfo();const c=ctx(),plan=derivePublicAssetRecoveryPlan(c.sdk,{templates:c.templates,journal:record.journal,keysPublic:c.owners}),outputs=plan.transaction.outputs.map((o,index)=>({index,value:o.value,script:o.scriptPublicKey.script,version:o.scriptPublicKey.version,covenantId:o.covenant?.covenantId?.toString()||null,address:c.sdk.addressFromScriptPublicKey(o.scriptPublicKey,network).toString()}));
  const {entries}=await c.call(c.rpc.getUtxosByAddresses([...new Set(outputs.map(o=>o.address))]));record.outputsObserved=outputs.every(o=>entries.some(e=>e.outpoint.transactionId===record.journal.id&&e.outpoint.index===o.index&&e.amount===o.value&&e.entry.scriptPublicKey.version===o.version&&e.entry.scriptPublicKey.script===o.script&&(e.entry.covenantId?.toString()||null)===o.covenantId));
  if(record.checkpoint)Object.assign(record,await observePublicAcceptance(c.rpc,{...record,id:record.journal.id},{call:c.call}));record.observed=Boolean(record.acceptingBlock)||record.outputsObserved;
  if(record.observed&&!record.applied)apply(plan,record);await save(state());await host.refresh();display();host.message(record.observed?'Transaction observed at this node. Holdings refreshed. This is not a finality guarantee.':'The transaction remains pending or uncertain. New actions stay blocked.');
 }
 async function resume(){const record=latest();if(!record||record.observed)host.fail('No unresolved transaction requires a retry.');const plan=derivePublicAssetRecoveryPlan(ctx().sdk,{templates:ctx().templates,journal:record.journal,keysPublic:owners()});showReview(plan,'Submit the identical saved transaction');signed=true;recovery=true;recoverySaved=true;text('submit','Submit identical saved transaction');}
 q('create').addEventListener('click',()=>host.action(create));q('pay').addEventListener('click',()=>host.action(pay));q('submit').addEventListener('click',()=>host.action(submit));q('cancel').addEventListener('click',()=>{review=null;q('review').hidden=true;});q('check').addEventListener('click',()=>host.action(check));q('resume').addEventListener('click',()=>host.action(resume));
 return {invalidate(){review=null;q('review').hidden=true;},open(next){review=null;q('review').hidden=true;mode=next;selectedCellId='';panel.hidden=false;display();},render:display,pending};
}
