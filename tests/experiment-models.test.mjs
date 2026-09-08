import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newExperiment,transitionExperiment as step,findAtomicCycle,validateAtomicCycle,validatePermission} from '../src/experiment-models.mjs';
const economy=s=>{const {revision,history,last,...rest}=s;return rest;};
const denied=(s,action,payload)=>{const next=step(s,action,payload);assert.equal(next.last.ok,false,next.last.message);assert.deepEqual(economy(next),economy(s));return next;};
test('descendant authority is a subset, reserves conserve money, recovered authority can be replaced',()=>{
 let s=newExperiment('delegation');for(const payload of [{amount:101,cap:20,service:'compute'},{amount:30,cap:31,service:'compute'},{amount:30,cap:20,service:'unrestricted'}])denied(s,'delegate',payload);
 s=step(s,'delegate',{amount:40,cap:18,service:'storage'});assert.equal(s.last.ok,true);denied(s,'spend',{amount:15,service:'compute'});denied(s,'spend',{amount:19,service:'storage'});s=step(s,'spend',{amount:15,service:'storage'});assert.equal(s.available+s.reserved+s.spent,100);
 s=step(s,'revoke');assert.equal(s.available,85);denied(s,'spend',{amount:1,service:'storage'});s=step(s,'delegate',{amount:20,cap:5,service:'compute'});assert.equal(s.last.ok,true);assert.equal(s.available+s.reserved+s.spent,100);assert.equal(s.reserved,20);
});
test('solver responds to missing offers and minimum returns; settlement rejects stale or tampered proposals',()=>{
 let s=newExperiment('completion');s=step(s,'edit',{active:false});assert.equal(findAtomicCycle(s),null);denied(s,'solve');s=step(s,'edit',{active:true,minimum:9});assert.equal(findAtomicCycle(s),null);s=step(s,'edit',{minimum:8});const proposal=findAtomicCycle(s);assert.equal(proposal.transfers.length,3);
 assert.throws(()=>validateAtomicCycle(s,{...proposal,transfers:proposal.transfers.slice(1)}),/minimum/);const stale=step(s,'edit',{minimum:7});assert.throws(()=>validateAtomicCycle(stale,proposal),/terms changed/);
 s=step(s,'settle',{proposal});assert.equal(s.last.ok,true);assert.deepEqual(Object.values(s.stores).reduce((a,v)=>a.map((n,i)=>n+Object.values(v)[i]),[0,0,0]),[8,1,4]);denied(s,'settle',{proposal});
});
test('competing execution validates submitted result, task output and single consumption in either order',()=>{
 for(const provider of ['North','South']){let s=newExperiment('execution');for(const payload of [{provider,a:6,b:6},{provider,a:0,b:13},{provider,a:16,b:1},{provider,a:6,b:7,input:'wrong:0'}])denied(s,'settle',payload);s=step(s,'settle',{provider,a:6,b:7});assert.equal(s.last.ok,true);assert.equal(s.spent,12);denied(s,'settle',{provider:provider==='North'?'South':'North',a:7,b:6});}
});
test('counterexample verifier checks the whole bounded domain and rewards only x=1, once',()=>{
 for(let witness=0;witness<=10;witness++){const s=newExperiment('correction'),next=step(s,'claim',{witness});assert.equal(next.last.ok,witness===1);assert.equal(next.paid,witness===1?10:0);}
 let s=newExperiment('correction');for(const witness of ['',-1,11,1.5])denied(s,'claim',{witness});s=step(s,'claim',{witness:1});denied(s,'claim',{witness:1});
});
test('one proposal validator evaluates independent signer, recipient, amount, balance and revocation fields',()=>{
 let s=newExperiment('arena');for(const payload of [{signer:'none',recipient:'supplier',amount:5},{signer:'agent',recipient:'attacker',amount:5},{signer:'agent',recipient:'supplier',amount:6},{signer:'agent',recipient:'supplier',amount:0}])denied(s,'submit',payload);
 const good={signer:'agent',recipient:'supplier',amount:5};s=step(s,'submit',good);assert.equal(s.budget,15);assert.equal(s.spent,5);assert.throws(()=>validatePermission(s.policy,good,4),/remaining budget/);s=step(s,'revoke');denied(s,'submit',good);
});
