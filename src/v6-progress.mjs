import {getV6Lesson} from './v6-lessons.mjs';

// Copy and actions are tied to saved protocol stages, not to a slideshow counter.
const stage = (chapter, action, actionLabel, title, body, step = 'review') => ({chapter,action,actionLabel,title,body,step});
export const V6_STAGE_ACTIONS = Object.freeze({
  intro: stage(0,'resume','Prepare the exchange','Two sides of one purchase','The guide prepares two local demonstration businesses. Their separate setup transactions remain in the receipt history.'),
  'purchase-ready': stage(0,'purchase','Buy the tool atomically','A tool for 0.06 tKAS','The proposed transaction moves one digital tool to your business and 0.06 tKAS to the seller together. Try the incomplete proposal first to see which check protects you.'),
  'purchase-complete': stage(0,'continue','Continue to Pip’s permission','The tool is yours','The accepting block is recorded. The seller received the coins and your business received one tool in the same transaction.','outcome'),
  'pip-ready': stage(1,'configure','Give Pip this one job','Two crops for one timber','Authorize Pip to spend at most two crops and receive at least one resource. This proposed barter receives one timber; the policy does not limit the resource type. Native-coin spending is disabled.'),
  'pip-permitted': stage(1,'resume','Let Pip complete the barter','The permission is recorded','Pip can now submit the authorized two-crop barter. The budget alone has not delivered any goods.'),
  'pip-traded': stage(1,'pip_attack','Try exceeding the allowance','Pip finished the allowed job','The barter received one timber. Now ask Pip to spend beyond its remaining crop allowance. This proposed transaction will be checked locally without broadcasting.','outcome'),
  'pip-blocked': stage(1,'revoke','Revoke Pip’s permission','A failed request leaves goods unchanged','The local Kaspa script VM rejected the excessive request. Revoke Pip’s operator permission to close its route for future transactions.'),
  'pip-complete': stage(1,'continue','Continue to the trading ring','Useful power can stay narrow','The owner’s revocation is accepted. Pip keeps no authority to initiate another delegated trade.','outcome'),
  'ring-ready': stage(2,'ring','Settle all three trades','No business has to go first','Three crops go from the grower to the toolmaker, one tool goes to the miner, and two ore go to the grower. All three businesses authorize the same transaction.'),
  'ring-complete': stage(2,'continue','Continue to the greenhouse','Three handoffs, one settlement','All three conditional transitions were accepted together. Follow each type of goods to its new store.','outcome'),
  'coord-ready': stage(3,'withdraw','Withdraw one neighbor’s pledge','Two ready neighbors still need a third','The launch rule requires three distinct ready pledges with the same project beneficiary. Try an early release, then withdraw a pledge to see that an incomplete group need not trap a participant.'),
  'coord-withdrawn': stage(3,'resume','Re-form the protected group','The neighbor received a refund','The withdrawal returned that pledge minus its transaction fee. Continue closes the other old pledges and prepares a fresh group, with each setup receipt retained.','outcome'),
  'coord-join-ready': stage(3,'join','Join and build together','You are the third ready neighbor','Your ready pledge completes the required set. This authorization includes settling all three ready pledges to the greenhouse beneficiary. Fees come from the pledged coins.'),
  'coord-complete': stage(3,'continue','Continue to the courier','The group launched the greenhouse','All three ready pledges settled in one accepted transaction. The harbor uses that observed result to build the greenhouse.','outcome'),
  'courier-ready': stage(4,'courier_open','Lock payment and bond','What if the courier disappears?','Lock the customer’s 0.2 tKAS payment beside the courier’s 0.1 tKAS bond. A recipient signature pays both to the courier. The age-based refund pays both to the customer, so the courier risks losing its bond.'),
  'courier-locked': stage(4,'courier_release','Deliver with the recipient’s receipt','A signature, not a physical-delivery oracle','The game operates the recipient account. Its signature authorizes the courier payout. Kaspa checks that signature and the contract conditions; it cannot observe the parcel.'),
  'courier-delivered': stage(4,'courier_refund_open','Try the no-receipt path','The signed receipt released the payout','Now open a second delivery under the same terms and withhold its receipt. This creates a separate contract so the refund can be demonstrated honestly.','outcome'),
  'courier-wait': stage(4,'refresh','Check refund eligibility','The refund depends on chain age','The coins remain locked until the contract’s relative chain-age condition is satisfied. Elapsed animation time cannot unlock them.','pending'),
  'courier-refund-ready': stage(4,'refund','Claim the refund and forfeited bond','The refund condition is now eligible','The customer receives its 0.2 tKAS payment plus the courier’s forfeited 0.1 tKAS bond. Chain age permits this path; it does not prove a delivery failed.'),
  'courier-complete': stage(4,'continue','Continue to verified work','Both exit paths have receipts','You have seen a recipient-authorized payout and an age-eligible refund. Each path has its own actual accepting block.','outcome'),
  'proof-ready': stage(5,'proof_attack','Try an invalid proof','Can the worker claim an unearned reward?','The task requires settings between 1 and 15 whose product is 42 and sum is 13. The Groth16 proof also binds the recipient and this task’s nonce. Check a tampered proof before claiming the 0.13 tKAS reward.'),
  'proof-blocked': stage(5,'proof_redeem','Verify the work and release 0.13 tKAS','Only a valid proof can claim the reward','The invalid proof failed in the local Kaspa script VM. Submit the real proof for settings 6 and 7, together with the designated worker’s signature.'),
  'proof-verified': stage(5,'continue','Finish the tour','Verified work powers the observatory','The valid proof transaction paid the bound recipient and has an observed accepting block. The machine now runs with settings 6 and 7.','outcome'),
  'proof-complete': stage(5,'continue','Finish the tour','The worker received the reward','The accepted proof transaction paid the task’s designated recipient.','outcome'),
  complete: stage(5,'freeplay','Explore the harbor','You have seen six rules change six risks','Return to any building to inspect its outcome and receipts. The demonstration accounts and saved results stay with this browser session.','complete'),
});
const attacks = {'purchase-ready':['purchase_attack','Try the missing-tool proposal'],'ring-ready':['ring_attack','Try a ring without one approval'],'coord-ready':['coord_attack','Try releasing too early']};
const sceneOperations = {'atomic-exchange':'purchase',purchase:'purchase','pip-configure':'pip-permit','pip-trade':'pip-allow','pip-revoke':'pip-revoke',ring:'ring','ring-settlement':'ring','coord-withdraw':'withdraw','coord-settle':'greenhouse-settle','coordination-withdraw':'withdraw','coordination-settlement':'greenhouse-settle','delivery-open':'delivery-open','delivery-release':'delivery-release','delivery-refund':'delivery-refund','proof-redeem':'proof-verified','proof-verified':'proof-verified'};
export function v6StageAction(session){return V6_STAGE_ACTIONS[session?.stage]||stage(session?.chapter||0,'resume','Resume the saved operation','Preparing this chapter','The saved authorization is being prepared or checked. Every contract setup has its own transaction receipt.','pending');}
export function v6SceneConsequences(receipts=[]){
  const result={pip:{},greenhouse:{},courier:{},proof:{}};
  for(const receipt of receipts){
    if(!/^[a-f0-9]{64}$/i.test(receipt.transactionId||'')||!/^[a-f0-9]{64}$/i.test(receipt.acceptingBlock||''))continue;
    switch(receipt.operation){
      case 'purchase':result.toolReceived=true;break;
      case 'pip-configure':Object.assign(result.pip,{allowanceCrops:2,receivedWood:0,revoked:false});break;
      case 'pip-trade':Object.assign(result.pip,{allowanceCrops:0,receivedWood:1,revoked:false});break;
      case 'pip-revoke':Object.assign(result.pip,{allowanceCrops:0,revoked:true});break;
      case 'coord-settle':result.greenhouse.built=true;break;
      case 'delivery-open':case 'refund-open':Object.assign(result.courier,{paymentSompi:'20000000',bondSompi:'10000000',receiptPresent:false,refund:false});break;
      case 'delivery-release':Object.assign(result.courier,{receiptPresent:true,delivered:true});break;
      case 'delivery-refund':Object.assign(result.courier,{refund:true});break;
      case 'proof-redeem':result.proof.machineOn=true;break;
    }
  }
  return result;
}
export function v6PublicView(session,{busy=false,error=null,network={},inspectChapter=null}={}){
  const spec=v6StageAction(session),chapter=inspectChapter??session?.chapter??spec.chapter,lesson=getV6Lesson(chapter);
  if(!session)return {chapter:0,step:'intro',actionLabel:'Start the guide',wallet:{connected:false},busy,error,network,
    stepCopy:{title:'What can a contract change?',body:'Visit six harbor businesses and test the rules that protect them. Start prepares demonstration accounts with Testnet-10 coins. No personal wallet is involved.'},scene:{...lesson.scene,chapter:0,phase:'intro'}};
  const operation=session.operation||null,pending=Boolean(session.pending),receipts=session.receipts||[],last=receipts.at(-1);
  const evidence=session.attackEvidence,attackList=Array.isArray(evidence)?evidence:Object.values(evidence||{}),checked=attackList.filter(x=>x?.chapter===chapter||x?.stage===session.stage).map(x=>x.summary||x.error||x.rule).filter(Boolean);
  const accepted=operation?.phase==='accepted'&&/^[a-f0-9]{64}$/i.test(operation?.acceptingBlock||'');
  const receipt=receipts.find(item=>item.transactionId===operation?.transactionId),operationName=receipt?.operation||operation?.operation||operation?.kind;
  const rejected=attackList.filter(item=>item?.chapter===chapter&&item?.vm?.valid===false&&item?.vm?.engine==='Kaspa TxScriptEngine').at(-1);
  const actionSpec=inspectChapter===null?spec:stage(chapter,'return','Return to the current chapter',lesson.title,'Inspect this building and the session’s observed receipts. Return to continue the saved tour.');
  const attack=inspectChapter===null&&!pending?attacks[session.stage]:null;
  const secondaryAction=pending&&session.pending.retryable?{type:'retry_submission',label:'Retry the saved submission'}:attack?{type:'try_attack',label:attack[1],payload:{action:attack[0]}}:null;
  return {chapter,step:pending?'pending':actionSpec.step,title:lesson.title,busy,error:error||session.error,actionDisabled:busy,
    actionLabel:pending?'Check the saved transaction':actionSpec.actionLabel,
    stepCopy:{title:pending?'Waiting for the saved transaction':actionSpec.title,body:pending?'Submission and acceptance are separate. The result stays provisional until the service observes the accepting block.':actionSpec.body,...(secondaryAction?{secondaryAction}:{})},
    wallet:{connected:true,balanceSompi:session.balanceSompi??null,label:'Demo balance'},progress:{completed:session.completed||[],total:6},operation,
    evidence:{technology:lesson.technology,checked,boundary:lesson.boundary,receiptUrl:operation?.transactionId?`https://tn10.kaspa.stream/transactions/${operation.transactionId}`:''},
    result:session.result||null,history:receipts,network,
    scene:{...lesson.scene,...session.scene,result:v6SceneConsequences(receipts),chapter,phase:pending?'pending':spec.step,eventId:accepted?(operation.transactionId||last?.transactionId):null,accepted,operation:sceneOperations[operationName]||session.scene?.operation||'setup',inventory:session.inventory||session.scene?.inventory,progress:{completed:session.completed||[]},transaction:operation,...(rejected?{rejected:{id:rejected.id,rule:rejected.rule,checked:true}}:{})}};
}
