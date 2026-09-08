import test from 'node:test';
import assert from 'node:assert/strict';
import {getV5StoryStep} from '../src/v5-ui.mjs';

const player='player';
const uses=[
 {purpose:'feed_habitat',requires:{crops:3},recipientId:'habitat-keeper'},
 {purpose:'build_workshop',requires:{wood:2,ore:1,tools:1},recipientId:'town-builder'},
 {purpose:'expand_greenhouse',requires:{wood:3,tools:2},recipientId:'town-builder'},
];
const actors=({playerInventory={crops:7,wood:2,ore:1,tools:0,bread:3},miraTools=1,beaTools=0,prepared=[],miraNeeds={bread:3,tools:3},nativeQuotes=[]}={})=>({
 [player]:{id:player,name:'You',kind:'player',inventory:{crops:0,wood:0,ore:0,tools:0,bread:0,...playerInventory}},
 mira:{id:'mira',name:'Mira',kind:'business',inventory:{crops:57,wood:8,ore:0,tools:miraTools,bread:1},needs:{crops:4,wood:8,tools:3,bread:3,...miraNeeds},recipe:{input:{wood:1},output:{crops:4}}},
 bea:{id:'bea',name:'Bea',kind:'business',inventory:{crops:7,wood:0,ore:2,tools:beaTools,bread:0},needs:{tools:3,wood:7,ore:8,crops:5},recipe:{input:{wood:1,ore:1},output:{tools:2}}},
 rowan:{id:'rowan',name:'Rowan',kind:'business',inventory:{wood:58,bread:2,ore:0,tools:0,crops:0},needs:{wood:4,bread:5,tools:3},recipe:{input:{bread:1},output:{wood:4}}},
 ivo:{id:'ivo',name:'Ivo',kind:'business',inventory:{ore:35,wood:0,bread:0,tools:0,crops:0},needs:{ore:4,bread:6,tools:3},recipe:{input:{bread:1},output:{ore:3}}},
 nell:{id:'nell',name:'Nell',kind:'business',inventory:{bread:58,wood:0,ore:0,tools:0,crops:0},needs:{bread:4,crops:12,wood:3},recipe:{input:{crops:1,wood:1},output:{bread:4}}},
});
function view(options={}){
 const {playerInventory,miraTools,beaTools,prepared,miraNeeds,nativeQuotes}=options;
 const marketActors=actors({playerInventory,miraTools,beaTools,miraNeeds});
 return {market:{playerId:player,actors:marketActors,trades:Object.fromEntries(prepared||[]),cells:{[player]:{nativeSompi:'100000000'}},nativeQuotes:nativeQuotes||[]},marketUses:uses,resources:[],habitat:{careCount:1},upgrades:[{id:'workshop',level:0},{id:'plots',level:1}],state:{upgrades:{workshop:0,plots:1},marketUseActions:{care:{purpose:'feed_habitat'}}},story:{funded:true,purchased:true,bartered:true}};
}

test('guide proposes a concrete partial barter when stock has no native quote',()=>{
 const step=getV5StoryStep(view({playerInventory:{crops:7,wood:2,ore:1,tools:0,bread:3},miraTools:1}));
 assert.equal(step.action.type,'market_propose');
 assert.equal(step.action.to,'mira');
 assert.deepEqual(step.action.give,{bread:1});
 assert.deepEqual(step.action.want,{tools:1});
 assert.match(step.detail,/1 bread/);
 assert.match(step.detail,/1 tool/);
 assert.equal(step.supplyRecoveryDetail,step.detail);
});

test('guide reuses an already accepted offer instead of creating a duplicate',()=>{
 const trade={id:'trade-41',from:player,to:'mira',give:{bread:1},want:{tools:1},status:'offered',decision:'accept',expires:120};
 const step=getV5StoryStep(view({miraTools:1,prepared:[[trade.id,trade]],playerInventory:{crops:7,wood:2,ore:1,tools:0,bread:3}}));
 assert.equal(step.action.type,'market_accept');
 assert.equal(step.action.tradeId,trade.id);
});

test('guide skips expired or stale offers and rechecks the current business state',()=>{
 const expired={id:'trade-expired',from:player,to:'mira',give:{bread:1},want:{tools:1},status:'offered',decision:'accept',expires:1};
 const expiredStep=getV5StoryStep({...view({miraTools:1,prepared:[[expired.id,expired]],playerInventory:{crops:7,wood:2,ore:1,tools:0,bread:3}}),market:{...view({}).market,time:2,actors:actors({miraTools:1,playerInventory:{crops:7,wood:2,ore:1,tools:0,bread:3}}),trades:{[expired.id]:expired}}});
 assert.equal(expiredStep.action.type,'market_propose');
 const stale={...expired,id:'trade-stale',expires:120};
 const staleStep=getV5StoryStep(view({miraTools:0,beaTools:1,prepared:[[stale.id,stale]],playerInventory:{crops:7,wood:2,ore:1,tools:0,bread:3}}));
 assert.equal(staleStep.action.type,'market_propose');
 assert.equal(staleStep.action.to,'bea');
});

test('guide ignores reserved stock and uses an unreserved neighbor',()=>{
 const prepared={id:'trade-reserved',from:'other-player',to:'mira',give:{bread:1},want:{tools:1},status:'prepared',decision:'accept',expires:120};
 const step=getV5StoryStep(view({miraTools:1,beaTools:2,prepared:[[prepared.id,prepared]],playerInventory:{crops:7,wood:2,ore:1,tools:0,bread:3}}));
 assert.equal(step.action.type,'market_propose');
 assert.equal(step.action.to,'bea');
 assert.deepEqual(step.action.want,{tools:1});
});

test('guide gives a producer a spare recipe input when no output stock exists',()=>{
 const step=getV5StoryStep(view({miraTools:0,beaTools:0,playerInventory:{crops:7,wood:3,ore:1,tools:0,bread:3}}));
 assert.equal(step.action.type,'market_propose');
 assert.equal(step.action.to,'bea');
 assert.deepEqual(step.action.give,{wood:1});
 assert.deepEqual(step.action.want,{ore:1});
 assert.match(step.detail,/missing recipe input/);
});

test('guide reuses a producer-input barter already waiting for acceptance',()=>{
 const trade={id:'trade-input',from:player,to:'bea',give:{wood:1},want:{ore:1},status:'offered',decision:'accept',expires:120};
 const step=getV5StoryStep(view({miraTools:0,beaTools:0,playerInventory:{crops:7,wood:3,ore:1,tools:0,bread:3},prepared:[[trade.id,trade]]}));
 assert.equal(step.action.type,'market_accept');
 assert.equal(step.action.tradeId,trade.id);
});

test('guide buys a producer input first when a native quote is available',()=>{
 const step=getV5StoryStep(view({miraTools:0,beaTools:0,playerInventory:{crops:7,wood:2,ore:1,tools:0,bread:3},nativeQuotes:[{actorId:'rowan',resource:'wood',available:4,unitPriceSompi:'1500000'}]}));
 assert.equal(step.action.type,'market_buy');
 assert.equal(step.action.to,'rowan');
 assert.equal(step.action.resource,'wood');
 assert.equal(step.action.amount,1);
});

test('guide prefers the cheapest native quote and buys only currently available stock',()=>{
 const step=getV5StoryStep(view({miraTools:1,beaTools:1,playerInventory:{crops:7,wood:2,ore:1,tools:0,bread:3},nativeQuotes:[
  {actorId:'mira',resource:'tools',available:1,unitPriceSompi:'4000000'},
  {actorId:'bea',resource:'tools',available:1,unitPriceSompi:'3000000'},
 ]}));
 assert.equal(step.action.type,'market_buy');
 assert.equal(step.action.to,'bea');
 assert.equal(step.action.amount,1);
 assert.equal(step.action.maxTotalSompi,'3000000');
});

test('guide opens a bounded recovery path when no stock, quote or producer route exists',()=>{
 const v=view({miraTools:0,beaTools:0,playerInventory:{crops:0,wood:2,ore:1,tools:0,bread:0}});
 for(const actor of Object.values(v.market.actors))if(actor.kind==='business'){actor.inventory={crops:0,wood:0,ore:0,tools:0,bread:0};actor.needs={};actor.recipe=null;}
 const step=getV5StoryStep(v);
 assert.equal(step.action.type,'open_market');
 assert.doesNotMatch(step.detail,/replenishing|Continue to check/);
});
