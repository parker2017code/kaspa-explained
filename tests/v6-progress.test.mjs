import test from 'node:test';
import assert from 'node:assert/strict';
import {v6PublicView,v6StageAction,v6SceneConsequences} from '../src/v6-progress.mjs';
test('submission cannot animate an accepted consequence without its actual accepting block',()=>{
  const session={stage:'purchase-ready',chapter:0,pending:true,operation:{phase:'submitted',transactionId:'a'.repeat(64)},completed:[]};
  let view=v6PublicView(session);assert.equal(view.scene.accepted,false);assert.equal(view.scene.eventId,null);assert.equal(view.step,'pending');
  session.operation.phase='accepted';view=v6PublicView(session);assert.equal(view.scene.accepted,false);
  session.operation.acceptingBlock='b'.repeat(64);session.pending=false;view=v6PublicView(session);assert.equal(view.scene.accepted,true);assert.equal(view.scene.eventId,'a'.repeat(64));
});
test('reload reconstructs each earlier consequence only from accepted receipts',()=>{
  const receipt=operation=>({operation,transactionId:'a'.repeat(64),acceptingBlock:'b'.repeat(64)});
  const receipts=['purchase','pip-configure','pip-trade','pip-revoke','coord-settle','delivery-open','delivery-release','refund-open','delivery-refund','proof-redeem'].map(receipt);
  const result=v6SceneConsequences(receipts);
  assert.equal(result.toolReceived,true);assert.deepEqual(result.pip,{allowanceCrops:0,receivedWood:1,revoked:true});
  assert.equal(result.greenhouse.built,true);assert.equal(result.courier.delivered,true);assert.equal(result.courier.receiptPresent,false);assert.equal(result.courier.refund,true);assert.equal(result.proof.machineOn,true);
  const unaccepted=receipts.map(r=>({...r,acceptingBlock:null}));assert.equal(v6SceneConsequences(unaccepted).proof.machineOn,undefined);
  const restored=v6PublicView({stage:'complete',chapter:5,receipts,scene:{result:{proof:{machineOn:false}}}});
  assert.equal(restored.scene.result.pip.revoked,true);assert.equal(restored.scene.result.proof.machineOn,true);
});
test('the saved stage selects useful actions and inspection cannot advance it',()=>{
  assert.equal(v6StageAction({stage:'pip-traded'}).action,'pip_attack');assert.equal(v6StageAction({stage:'pip-blocked'}).action,'revoke');
  assert.equal(v6StageAction({stage:'courier-wait'}).action,'refresh');assert.equal(v6StageAction({stage:'proof-blocked'}).action,'proof_redeem');
  const session={stage:'purchase-ready',chapter:0,completed:[]};const view=v6PublicView(session,{inspectChapter:4});
  assert.equal(view.chapter,4);assert.equal(view.actionLabel,'Return to the current chapter');assert.equal(session.stage,'purchase-ready');assert.deepEqual(view.progress.completed,[]);
});
