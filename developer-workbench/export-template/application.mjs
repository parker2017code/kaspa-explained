// Public-key/UTXO integration boundary. No private keys, RPC, signing or submission.
import {instantiatePublicContract,buildPublicSpend} from '../../src/public-contracts.mjs';
import {instantiatePublicReceipt,buildBackedMove} from '../../src/public-receipt.mjs';
import {buildV5ArgentTrade} from '../../src/v5-argent-protocol.mjs';

/**
 * Build using a caller-supplied SDK, compiled template, public participants and
 * SDK UtxoEntryReference objects observed by the caller's node/wallet.
 * Returns an unsigned safe-JSON transaction plus the reviewed builder plan.
 * Templates: public escrow/treasury/proof/receipt template, or full Argent bundle.
 * cell/peer: {utxo,state?,certificate?}; feeUtxos: native SDK references.
 */
export function buildApplication({sdk,example,template,values={},participants={},cell,peer,feeUtxos=[],proofBundle}={}){
 if(!sdk||!template||!cell?.utxo)throw Error('Caller SDK, compiled template and observed contract UTXO are required.');
 const feeRate=values.feeRate??100;let plan;
 if(example==='allowance'){
  if(!peer?.utxo||!cell.state||!peer.state||!cell.certificate||!peer.certificate)throw Error('Both independently observed states and issuer certificates are required.');
  if(values.allowance!==undefined&&values.allowance!==cell.state.allow_crops)throw Error('Requested allowance differs from the observed contract policy.');
  plan=buildV5ArgentTrade(sdk,{templates:template,left:cell,right:peer,deltas:{crops:-values.spend,bread:values.receive},leftDelegated:true,fundingUtxos:feeUtxos,feeRate});
 }else if(example==='receipt'){
  const before=instantiatePublicReceipt(sdk,template,{series:participants.series,state:{owner:participants.holder,quantity:values.backing}}),remaining=values.backing-values.redeem;
  if(!Number.isSafeInteger(remaining)||remaining<0)throw Error('Redemption exceeds backing.');
  const successors=remaining?[instantiatePublicReceipt(sdk,template,{series:participants.series,state:{owner:participants.holder,quantity:remaining}})]:[];
  if(feeUtxos.length!==1)throw Error('One caller-owned native fee input is required.');
  plan=buildBackedMove(sdk,{receiptInputs:[{receipt:before,utxo:cell.utxo}],successors,operation:'redeem',sponsorUtxo:feeUtxos[0],sponsorPublicKey:participants.sponsor,feeRate});
 }else{
  let state,entry,parameters={};
  if(example==='escrow'){state={buyer:participants.buyer,seller:participants.seller,arbiter:participants.arbiter,refundAfter:values.refundAfter,principal:values.principal,maxFee:values.maxFee??1000000};entry=values.action;parameters={paySeller:values.paySeller??true};}
  else if(example==='treasury'){state={memberA:participants.memberA,memberB:participants.memberB,memberC:participants.memberC,principal:values.principal,maxFee:values.maxFee??1000000};entry='spend';parameters={pair:Number(values.pair),beneficiary:participants.beneficiary};}
  else if(example==='proof'){
   if(!proofBundle||proofBundle.owner!==participants.owner||proofBundle.verifyingKey!==template.proofFixture?.verifyingKey||JSON.stringify(proofBundle.publicInputs?.values)!==JSON.stringify(template.proofFixture?.inputs))throw Error('Use a freshly compiled template and generated proof bound to the caller recipient and exact public inputs.');
   state={owner:participants.owner,principal:values.principal,maxFee:values.maxFee??20000000};entry='verify';template={...template,proofFixture:{...template.proofFixture,proof:proofBundle.proof}};
  }else throw Error('Unsupported application.');
  const contract=instantiatePublicContract(sdk,template,state);
  plan=buildPublicSpend(sdk,{contract,utxo:cell.utxo,entry,parameters,pastMedianTime:values.currentMedianTime,feeRate});
 }
 const raw=JSON.parse(plan.transaction.serializeToSafeJSON());raw.inputs.forEach(i=>i.signatureScript='');
 return{network:'testnet-10',submitted:false,transaction:JSON.stringify(raw),feeSompi:String(plan.fee),plan};
}
