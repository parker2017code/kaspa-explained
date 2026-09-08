// Design models only. These functions neither sign nor submit transactions.
export const EXPERIMENTS = Object.freeze([
  {id:'delegation',title:'A budget that follows the job',question:'Can subcontractors receive useful authority without expanding it?',why:'An untrusted subcontractor should receive a limited spend path, not the customer’s unrestricted key.',boundary:'One parent-to-child delegation is simulated. The testnet lab separately exercises a fixed-payee allowance and owner recovery.'},
  {id:'completion',title:'Complete the missing deal',question:'Can a solver make three incompatible direct trades work together?',why:'A solver may assemble the transaction, but should not take custody or change anyone’s minimum return.',boundary:'This solver and its offers are simulated. The testnet lab exercises an existing fixed three-asset atomic bundle; it is not an open offer market.'},
  {id:'execution',title:'Let providers compete',question:'Can two providers compete for one payment without being able to charge twice?',why:'Both providers can hold conditional authorization while the same spendable output can be consumed only once.',boundary:'Competing authorizations and providers are simulated. This is not a deployed intent protocol, privacy system, or latency benchmark.'},
  {id:'correction',title:'Pay for a valid correction',question:'Can a worker earn a bounty by disproving a precise claim?',why:'The payer should not be able to suppress a valid counterexample after committing the reward.',boundary:'The bounded counterexample verifier is simulated. No bounty covenant has been compiled or deployed for this predicate.'},
  {id:'arena',title:'Try to escape the permission',question:'Which attacks can a narrowly authorized agent actually execute?',why:'A wallet’s labels are insufficient: a hostile holder of the spending key must still face enforceable restrictions.',boundary:'These attacks run against a design model, not the Kaspa VM. V6 separately runs real VM rejection checks and records accepted Testnet-10 transactions.'},
]);
const copy=x=>structuredClone(x);
const requireRule=(condition,message)=>{if(!condition)throw Error(message);};
function units(value,label='Amount'){const n=Number(value);requireRule((typeof value==='number'||typeof value==='string'&&value.trim()!=='')&&Number.isSafeInteger(n)&&n>0&&n<=1000000,`${label} must be a positive whole number.`);return n;}
export function newExperiment(id){
  requireRule(EXPERIMENTS.some(x=>x.id===id),'Unknown experiment');
  return {version:1,id,revision:0,history:[],last:null,...({
    delegation:{available:100,reserved:0,spent:0,child:null,parent:{cap:30,services:['compute','storage']}},
    completion:{settled:false,proposal:null,stores:{buyer:{coins:8,tools:0,credits:0},maker:{coins:0,tools:1,credits:0},provider:{coins:0,tools:0,credits:4}},offers:[{id:'buyer',give:'coins',amount:8,want:'tools',minimum:1,active:true},{id:'maker',give:'tools',amount:1,want:'credits',minimum:4,active:true},{id:'provider',give:'credits',amount:4,want:'coins',minimum:8,active:true}]},
    execution:{available:12,spent:0,winner:null,outputId:'task-reward:0',spentOutput:null,proposals:['North','South']},
    correction:{reward:10,paid:0,witness:null},
    arena:{budget:20,spent:0,revoked:false,policy:{signer:'agent',recipient:'supplier',cap:5}},
  }[id])};
}
export function validatePermission(policy,proposal,balance,revoked=false){
  requireRule(!revoked,'The owner revoked this spending path.');
  requireRule(proposal.signer===policy.signer,'The proposed signer does not hold the spending permission.');
  requireRule(proposal.recipient===policy.recipient,'The proposed recipient is not the authorized supplier.');
  const amount=units(proposal.amount);
  requireRule(amount<=policy.cap,`The payment exceeds the ${policy.cap}-unit cap.`);
  requireRule(amount<=balance,'The remaining budget cannot cover the payment.');
  return amount;
}
export function validateExecution(state,proposal){
  requireRule(state.proposals.includes(proposal.provider),'Unknown provider.');
  requireRule(!state.spentOutput&&proposal.input===state.outputId,'The reward output has already been consumed or is not this task’s output.');
  const a=units(proposal.a,'First setting'),b=units(proposal.b,'Second setting');
  requireRule(a<=15&&b<=15,'Both settings must be between one and fifteen.');
  requireRule(a*b===42&&a+b===13,'The supplied settings do not have product 42 and sum 13.');
  return {provider:proposal.provider,a,b};
}
// Search every active subset. This small model deliberately favors inspectability
// over throughput. The settlement validator is independent of the search.
export function findAtomicCycle(state){
  const active=state.offers.filter(o=>o.active),assetNames=['coins','tools','credits'];
  for(let mask=1;mask<2**active.length;mask++){
    const offers=active.filter((_,i)=>mask&(1<<i));if(offers.length<2)continue;
    const supply=Object.fromEntries(assetNames.map(a=>[a,0])),demand={...supply};
    if(offers.some(o=>state.stores[o.id][o.give]<o.amount))continue;
    for(const o of offers){supply[o.give]+=o.amount;demand[o.want]+=o.minimum;}
    if(assetNames.some(a=>supply[a]<demand[a]))continue;
    const transfers=[],remaining=new Map(offers.map(o=>[o.id,o.amount]));
    for(const recipient of offers){let owed=recipient.minimum;for(const donor of offers.filter(o=>o.give===recipient.want&&o.id!==recipient.id)){const n=Math.min(owed,remaining.get(donor.id));if(n){transfers.push({from:donor.id,to:recipient.id,asset:donor.give,amount:n});remaining.set(donor.id,remaining.get(donor.id)-n);owed-=n;}if(!owed)break;}if(owed)break;}
    const proposal={offerIds:offers.map(o=>o.id),terms:copy(offers),transfers};
    try{validateAtomicCycle(state,proposal);return proposal;}catch{}
  }
  return null;
}
export function validateAtomicCycle(state,proposal){
  requireRule(!state.settled,'These offers have already settled.');
  requireRule(proposal&&Array.isArray(proposal.offerIds)&&proposal.offerIds.length>=2,'A settlement needs at least two offers.');
  requireRule(new Set(proposal.offerIds).size===proposal.offerIds.length,'An offer cannot be consumed twice.');
  const offers=proposal.offerIds.map(id=>state.offers.find(o=>o.id===id));
  requireRule(offers.every(o=>o?.active),'A required offer is unavailable.');
  requireRule(JSON.stringify(offers)===JSON.stringify(proposal.terms),'The offer terms changed after this proposal was prepared.');
  requireRule(Array.isArray(proposal.transfers)&&proposal.transfers.length<=20,'Invalid transfer list.');
  const next=copy(state.stores),given=Object.fromEntries(offers.map(o=>[o.id,0])),received=Object.fromEntries(offers.map(o=>[o.id,0]));
  for(const transfer of proposal.transfers){
    const source=offers.find(o=>o.id===transfer.from),target=offers.find(o=>o.id===transfer.to);
    requireRule(source&&target&&source.id!==target.id,'Every transfer must connect different participating offers.');
    requireRule(transfer.asset===source.give&&transfer.asset===target.want,'The transfer changes an authorized asset.');
    const n=units(transfer.amount);given[source.id]+=n;received[target.id]+=n;
    next[source.id][transfer.asset]-=n;next[target.id][transfer.asset]+=n;
  }
  for(const offer of offers){requireRule(given[offer.id]<=offer.amount,'A participant gives more than authorized.');requireRule(received[offer.id]>=offer.minimum,`${offer.id} does not receive its minimum return.`);}
  requireRule(Object.values(next).every(v=>Object.values(v).every(n=>Number.isSafeInteger(n)&&n>=0)),'A proposed transfer spends unavailable inventory.');
  return next;
}
export function transitionExperiment(input,action,payload={}){
  const s=copy(input);let message='',ok=false;
  try{
    if(s.id==='delegation'){
      if(action==='delegate'){
        requireRule(!s.child?.active,'Recover the current subcontract’s remainder before replacing it.');
        const amount=units(payload.amount??30,'Reserved budget'),cap=units(payload.cap??20,'Payment cap'),service=payload.service??'compute';
        requireRule(amount<=s.available,'The owner has insufficient unreserved budget.');requireRule(cap<=s.parent.cap,'A child cannot exceed its parent’s per-payment cap.');requireRule(s.parent.services.includes(service),'A child cannot add a service outside its parent’s permission.');
        s.available-=amount;s.reserved+=amount;s.child={remaining:amount,cap,services:[service],active:true};message=`Reserved ${amount}. Child payments are limited to ${cap}, for ${service}.`;
      }else if(action==='spend'){
        requireRule(s.child?.active,'The subcontract has no active authority.');const amount=units(payload.amount??15),service=payload.service??'compute';
        requireRule(s.child.services.includes(service),'The requested service is outside the child’s permission.');requireRule(amount<=s.child.cap&&amount<=s.child.remaining,'This payment exceeds the child’s cap or remaining budget.');
        s.child.remaining-=amount;s.reserved-=amount;s.spent+=amount;message=`Paid ${amount} for ${service}. The remaining child budget is ${s.child.remaining}.`;
      }else if(action==='revoke'){
        requireRule(s.child?.active,'There is no active subcontract to recover.');const amount=s.child.remaining;s.available+=amount;s.reserved-=amount;s.child={...s.child,remaining:0,active:false};message=`Recovered ${amount}. Old child authority is revoked; the owner can now create another subcontract.`;
      }else throw Error('Unknown action');
    }else if(s.id==='completion'){
      if(action==='edit'){
        requireRule(!s.settled,'Reset the model before creating fresh offers.');const offer=s.offers.find(o=>o.id===(payload.owner??'provider'));requireRule(offer,'Unknown offer.');
        if(payload.minimum!==undefined)offer.minimum=units(payload.minimum,'Minimum return');if(payload.active!==undefined)offer.active=Boolean(payload.active);s.proposal=null;message='Updated the offer. Earlier prepared settlements are no longer valid.';
      }else if(action==='solve'){
        s.proposal=findAtomicCycle(s);requireRule(s.proposal,'No active subset satisfies every participant’s minimum return. No assets moved.');message=`Found ${s.proposal.offerIds.length} compatible offers and ${s.proposal.transfers.length} transfers. Review them before settlement.`;
      }else if(action==='settle'){
        s.stores=validateAtomicCycle(s,payload.proposal??s.proposal);s.settled=true;message='All proposed transfers passed the independent settlement check and moved together.';
      }else throw Error('Unknown action');
    }else if(s.id==='execution'){
      requireRule(action==='settle','Unknown action');const result=validateExecution(s,{...payload,input:payload.input??s.outputId});
      s.winner=result.provider;s.available=0;s.spent=12;s.spentOutput=s.outputId;message=`Verified ${result.a} × ${result.b} = 42 and ${result.a} + ${result.b} = 13. ${result.provider} received 12. The task output is consumed.`;
    }else if(s.id==='correction'){
      requireRule(action==='claim','Unknown action');requireRule(!s.paid,'The bounty has already been claimed.');const x=Number(payload.witness);
      requireRule(payload.witness!==''&&payload.witness!==undefined&&Number.isInteger(x)&&x>=0&&x<=10,'The witness must be an integer from zero through ten.');
      requireRule(x*x<2*x,`${x}² ≥ 2 × ${x}. This value does not disprove the claim.`);s.witness=x;s.paid=s.reward;s.reward=0;message=`Valid counterexample: ${x}² = ${x*x}, below ${2*x}. The modeled reward moved to the finder.`;
    }else if(s.id==='arena'){
      if(action==='revoke'){requireRule(!s.revoked,'Authority is already revoked.');s.revoked=true;message='Owner revoked the modeled spend path. Remaining funds stay protected.';}
      else{requireRule(action==='submit','Unknown action');const amount=validatePermission(s.policy,payload,s.budget,s.revoked);s.budget-=amount;s.spent+=amount;message=`Accepted ${amount} to ${payload.recipient}. The protected remainder is ${s.budget}.`;}
    }
    ok=true;
  }catch(error){message=error.message;}
  const next=ok?s:copy(input);next.revision=input.revision+1;next.last={ok,action,message};next.history=[...input.history,{...next.last,revision:next.revision}].slice(-24);return next;
}
