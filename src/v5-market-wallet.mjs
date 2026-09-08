import {MARKET_USES} from './v5-economy.mjs';
import {deriveV5ArgentPlan,signV5ArgentPlan,V5_ARGENT_RESOURCES} from './v5-argent-protocol.mjs';
const reject=message=>{throw Error(message);};
/** Browser policy: only the resource trade or budget explicitly chosen by this wallet. */
export function reviewV5MarketPlan(sdk,{templates,payment,address,treasuryAddress,playerId,consent,expectedCell,expectedInventory}){
 const m=payment.marketPlan,owner=sdk.payToAddressScript(new sdk.Address(address)).script.slice(2,66),issuer=sdk.payToAddressScript(new sdk.Address(treasuryAddress)).script.slice(2,66);
 if(!m||m.version!==1||m.issuer!==issuer||m.economicReview?.playerId!==playerId||m.economicReview.playerOwner!==owner||m.economicReview.feePayer!==(consent?.action?.type==='market_fund'?owner:issuer))reject('The trade wallet or issuer changed.');
 const p=deriveV5ArgentPlan(sdk,{templates,journal:m.wire,issuer,world:m.world});
 if((consent?.action?.type==='market_fund'&&p.operation!=='fund')||(consent?.action?.type==='market_assistant'&&p.operation!=='configure')||(consent?.action?.type==='market_buy'&&p.operation!=='trade'))reject('The operation differs from your requested transfer or trade.');
 if(p.operation!==m.operation||BigInt(p.fee)>20000000n)reject('The trade operation or fee changed.');
 if(!Array.isArray(m.actors)||m.actors.length!==p.inputStates.length)reject('The business participant count changed.');
 const own=p.inputStates.map((s,i)=>s.owner===owner?i:-1).filter(i=>i>=0);
 if(own.length!==1||m.actors[own[0]]!==playerId)reject('The trade does not spend your business.');
 const i=own[0],before=p.inputStates[i],after=p.states[i];
 if(expectedCell){const input=p.transaction.inputs[i],id=input.utxo.entry.covenantId?.toString();if(id!==expectedCell.covenantId||input.previousOutpoint.transactionId!==expectedCell.transactionId||expectedCell.outpoint&&input.previousOutpoint.index!==expectedCell.outpoint.index||expectedCell.state&&JSON.stringify(before)!==JSON.stringify(expectedCell.state))reject('Your business contract changed since its last accepted state.');}
 if(after.owner!==owner||after.issuer!==issuer||after.world!==before.world)reject('The trade changed business ownership.');
 const nativeDelta=p.transaction.outputs[i].value-p.transaction.inputs[i].utxo.amount;
 const using=consent?.action?.type==='market_use',purchase=consent?.action?.type==='market_buy',funding=consent?.action?.type==='market_fund';
 if(!purchase && !funding && nativeDelta!==0n)reject('This barter cannot spend your test coins.');
 for(let n=p.inputStates.length;n<p.transaction.inputs.length;n++)if(p.transaction.inputs[n].utxo.entry.scriptPublicKey.script!==sdk.payToAddressScript(new sdk.Address(funding?address:treasuryAddress)).script)reject('The funding wallet changed.');
 if(p.operation==='trade'){
  const t=purchase||using?m.economicReview.trade:consent?.trade;if(!t||m.tradeId!==t.id||![t.from,t.to].includes(playerId))reject('Review and accept this exact trade first.');
  if(purchase){ const a=consent.action,total=BigInt(t.nativeAmountSompi||0); if(t.from!==playerId||t.to!==a.to||Object.keys(t.give).length||Object.keys(t.want).length!==1||t.want[a.resource]!==a.amount||total<=0n||total>BigInt(a.maxTotalSompi)||nativeDelta!==-total||p.transaction.outputs[i].value<10000000n)reject('The purchase exceeds the reviewed quantities or price.'); }
  if(JSON.stringify(m.actors)!==JSON.stringify([t.from,t.to]))reject('The reviewed trade counterparty changed.');
  if(using){const recipe=MARKET_USES[consent.action.purpose],use=m.economicReview.use;if(!recipe||t.purpose!==consent.action.purpose||(t.nativeAmountSompi??'0')!=='0'||use?.purpose!==consent.action.purpose||use.recipientId!==recipe.recipientId||!use.requires||Object.keys(use.requires).length!==Object.keys(recipe.requires).length||Object.entries(recipe.requires).some(([r,n])=>use.requires[r]!==n)||t.from!==playerId||t.to!==recipe.recipientId||Object.keys(t.want).length||Object.keys(t.give).some(r=>!V5_ARGENT_RESOURCES.includes(r))||V5_ARGENT_RESOURCES.some(r=>(t.give[r]??0)!==(recipe.requires[r]??0)))reject('The materials or their town purpose changed.');}
  const from=t.from===playerId,give=from?t.give:t.want,want=from?t.want:t.give;
  for(const r of V5_ARGENT_RESOURCES)if(after[r]-before[r]!==Number(want[r]||0)-Number(give[r]||0))reject('The trade quantities changed.');
  if(after.operator!==before.operator||after.min_receive!==before.min_receive||[...V5_ARGENT_RESOURCES,'coin'].some(r=>after['allow_'+r]!==before['allow_'+r]))reject('A manual trade cannot change Pip’s budget.');
 }else if(p.operation==='fund'){
  const a=consent?.action; if(!funding || !/^[1-9][0-9]*$/.test(a.amountSompi||'') || nativeDelta!==BigInt(a.amountSompi) || nativeDelta>1000000000n || BigInt(p.fee)>5000000n)reject('The business transfer amount or fee changed.');
  if(Object.keys(before).some(k=>k!=='sequence'&&after[k]!==before[k]))reject('Moving coins cannot change your supplies or Pip’s authority.');
 }else if(p.operation==='configure'){
  const a=consent?.action;if(a?.type!=='market_assistant')reject('Choose Pip’s budget before signing it.');
  if(after.operator!==(a.enabled?issuer:owner)||after.allow_coin!==0||after.min_receive!==1)reject('Pip’s authority changed.');
  for(const r of V5_ARGENT_RESOURCES)if(after[r]!==before[r]||after['allow_'+r]!==Number(a.enabled?a.maxGive?.[r]||0:0))reject('Pip’s spending limit changed.');
 }else if(p.operation==='restock'){
  if(!consent?.trade&&!consent?.action?.type?.startsWith('market_'))reject('This stock update was not requested.');
  for(const r of V5_ARGENT_RESOURCES)if(after[r]<before[r]||expectedInventory && after[r]!==Math.max(before[r],Number(expectedInventory[r]||0)))reject('The added stock differs from your trading inventory.');
  if(after.operator!==before.operator||after.min_receive!==before.min_receive||[...V5_ARGENT_RESOURCES,'coin'].some(r=>after['allow_'+r]!==before['allow_'+r]))reject('Adding stock cannot change Pip’s authority.');
 }else reject('Unsupported wallet trade operation.');
 const expected=p.signers.flatMap((s,i)=>s.owners.flatMap((o,j)=>p.signatures[i][j]||o!==owner?[]:[{inputIndex:i,signatureIndex:j,owner:o}]));
 if(JSON.stringify(expected)!==JSON.stringify(m.requiredSignatures)||expected.some(s=>s.owner!==owner))reject('Unexpected trade signature request.');
 return p;
}
export async function signV5MarketPayment(sdk,options,key){const p=reviewV5MarketPlan(sdk,options);await signV5ArgentPlan(p,(tx,i)=>sdk.createInputSignature(tx,i,key),{owners:[sdk.payToAddressScript(new sdk.Address(options.address)).script.slice(2,66)]});return {transactionId:p.transaction.id,signatures:options.payment.marketPlan.requiredSignatures.map(s=>({...s,owner:undefined,signature:p.signatures[s.inputIndex][s.signatureIndex]}))};}
