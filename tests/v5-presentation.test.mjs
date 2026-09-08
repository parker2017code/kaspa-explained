import test from 'node:test';
import assert from 'node:assert/strict';
import {createV5Presentation} from '../src/v5-presentation.mjs';
const id = 'a'.repeat(64), block = 'b'.repeat(64);
function fixture(mode='chain', reduced=false) {
  let time=0;const p=createV5Presentation({now:()=>time,reducedMotion:()=>reduced});
  p.begin({scenario:{id:'buy',mode},before:{inventory:0},action:{type:'buy'}});
  return {p,at:n=>time=n};
}
test('fast acceptance cannot skip network travel, consequence or explicit acknowledgement',()=>{
  const {p,at}=fixture();p.transaction({id,status:'accepted',acceptingBlock:block});p.finish();at(10000);
  assert.equal(p.tick({journey:()=>({phase:'into-block',active:true})}).worldReleased,false);
  assert.equal(p.acknowledge(),false);
  assert.equal(p.tick({journey:()=>({phase:'settled',active:false})}).phase,'returning');
  at(14000);assert.equal(p.tick({motionActive:true}).phase,'returning');
  assert.equal(p.tick({motionActive:false}).phase,'result');at(99999);
  assert.equal(p.tick().phase,'result');assert.equal(p.acknowledge(),true);assert.equal(p.snapshot(),null);
});
test('submission without an accepting block never releases outcomes, even after a long wait',()=>{
  const {p,at}=fixture();p.transaction({id,status:'accepted'});p.finish();at(999999);
  assert.equal(p.tick({journey:()=>({phase:'settled'})}).worldReleased,false);
  assert.equal(p.snapshot().transactions[0].status,'pending');
});
test('multiple transactions must all settle; late pending duplicates cannot regress accepted records',()=>{
  const {p,at}=fixture();const second='c'.repeat(64);
  p.transaction({id,status:'accepted',acceptingBlock:block});p.transaction({id:second,status:'pending'});
  p.transaction({id,status:'pending'});p.finish();at(9000);
  assert.equal(p.tick({journey:()=>({phase:'settled'})}).worldReleased,false);
  p.transaction({id:second,status:'accepted',acceptingBlock:block});
  assert.equal(p.tick({journey:()=>({phase:'settled'})}).worldReleased,true);
  assert.equal(p.snapshot().transactions.length,2);
});
test('review waits for an explicit signing action; local actions do not invent a network event',()=>{
  const {p,at}=fixture('local');p.finish();at(9000);
  assert.equal(p.tick({signatureRequired:true}).phase,'review');
  assert.equal(p.tick({pending:true}).worldReleased,false);
  assert.equal(p.tick().worldReleased,true);assert.equal(p.snapshot().transactions.length,0);
});
test('reduced motion preserves result acknowledgement and factual acceptance requirements',()=>{
  const {p,at}=fixture('chain',true);p.transaction({id,status:'pending'});p.finish();at(10000);
  assert.equal(p.tick().worldReleased,false);p.transaction({id,status:'accepted',acceptingBlock:block});
  assert.equal(p.tick().worldReleased,true);at(10300);assert.equal(p.tick().phase,'result');assert(p.acknowledge());
});

test('a completed chain request with no payment or transaction returns to recovery',()=>{
  const {p,at}=fixture();p.finish();at(2000);
  assert.equal(p.tick({pending:true}).phase,'submitting');
  const result=p.tick();assert.equal(result.phase,'error');
  assert.match(result.error,/No transaction was created/);assert.equal(result.worldReleased,false);
});
