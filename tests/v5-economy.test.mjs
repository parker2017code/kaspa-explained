import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,projectGame,applyGameAction,quoteGameAction,getGameView,GUIDE,CATALOGUE,OFFLINE_CAP_MS} from '../src/v5-economy.mjs';
const now=1000000;
let receiptNumber=0;
const witness=(state,action,at=now)=>{const quote=quoteGameAction(state,action,at);return {transactionId:'tx-'+(++receiptNumber),acceptingBlock:'block-'+receiptNumber,playerId:state.playerId,actionId:action.id,kind:quote.kind,amountSompi:quote.amountSompi};};
const act=(s,type,options={},at=now)=>{const action={id:type+'-'+s.revision,type,...options};return applyGameAction(s,action,at,{payment:quoteGameAction(s,action,at).kind==='free'?undefined:witness(s,action,at)});};
function tutorial(){let s=createGame({playerId:'player',now});for(const step of GUIDE){const {label,...action}=step.action;s=act(s,action.type,action);}return s;}
test('first order is playable in eight guided actions with exact accepted purchase and reward receipts',()=>{
 const s=tutorial(),view=getGameView(s,now);assert.equal(s.revision,8);assert.equal(view.guide.complete,true);assert.equal(s.automation.enabled,true);assert.equal(s.statistics.deliveries,1);assert.equal(s.resources.crops,0);
 assert.deepEqual(Object.values(s.receipts).map(r=>[r.kind,r.amountSompi]),[['purchase',50000000],['reward',25000000],['purchase',10000000]]);
 assert.equal('balanceSompi' in s,false);assert.equal('money' in s,false);assert.equal(view.resources.length,3);assert.equal(view.orders.length,3);assert.equal(view.upgrades.length,5);
});
test('unaccepted, wrong-player, wrong-action and wrong-amount payments cannot unlock a plot',()=>{
 const s=createGame({playerId:'player',now}),action={id:'plot',type:'buy_plot'},receipt=witness(s,action),before=JSON.stringify(s);
 for(const payment of [undefined,{...receipt,acceptingBlock:null},{...receipt,playerId:'someone-else'},{...receipt,actionId:'other'},{...receipt,amountSompi:49999999}])assert.throws(()=>applyGameAction(s,action,now,{payment}));
 assert.equal(JSON.stringify(s),before);assert.equal(s.upgrades.plots,0);
});
test('quotes neither consume crops nor fabricate a funded reward; accepted payout commits the delivery once',()=>{
 let s=createGame({playerId:'player',now});for(const step of GUIDE.slice(0,5)){const{label,...a}=step.action;s=act(s,a.type,a);}const action={id:'delivery',type:'deliver_order',orderId:'first-harvest'},before=JSON.stringify(s);
 assert.equal(quoteGameAction(s,action,now).amountSompi,25000000);assert.equal(JSON.stringify(s),before);assert.throws(()=>applyGameAction(s,action,now),/accepted payment/);assert.equal(s.resources.crops,3);
 const payment=witness(s,action),done=applyGameAction(s,action,now,{payment});assert.equal(done.resources.crops,0);assert.equal(done.statistics.deliveries,1);assert.deepEqual(applyGameAction(done,action,now,{payment}),done);
 assert.throws(()=>quoteGameAction(done,{id:'delivery-again',type:'deliver_order',orderId:'first-harvest'},now),/Accept this order/);
});
test('action identity and transaction identity independently prevent replay across purchases',()=>{
 let s=createGame({playerId:'player',now});const action={id:'plot',type:'buy_plot'},payment=witness(s,action);s=applyGameAction(s,action,now,{payment});
 assert.equal(applyGameAction(s,action,now,{payment}).upgrades.plots,1);
 assert.throws(()=>quoteGameAction(s,{id:'plot',type:'plant'},now),/different request/);
 const upgrade={id:'water',type:'buy_upgrade',upgradeId:'water'},reused={...payment,actionId:'water',amountSompi:10000000};assert.throws(()=>applyGameAction(s,upgrade,now,{payment:reused}),/already used/);
});
test('offline production caps elapsed time and storage, and repeated projection cannot award it twice',()=>{
 let s=act(createGame({playerId:'player',now}),'buy_plot');s=act(s,'plant');const future=now+OFFLINE_CAP_MS*3,p=projectGame(s,future);assert.equal(p.offline.capped,true);assert.equal(p.offline.appliedMs,OFFLINE_CAP_MS);assert.equal(p.production.readyCrops,18);assert.equal(p.resources.water,6);
 assert.deepEqual(projectGame(p,future).resources,p.resources);assert.equal(projectGame(p,future).production.readyCrops,p.production.readyCrops);assert.equal(projectGame(p,now).production.readyCrops,p.production.readyCrops);
 assert.equal(s.production.readyCrops,0,'Projection must not mutate persisted input');
});
test('Pip harvests and crafts within physical capacities but cannot submit orders or invent coin receipts',()=>{
 let s=tutorial();s=act(s,'buy_upgrade',{upgradeId:'workshop'});const receipts=structuredClone(s.receipts),orders=structuredClone(s.orders);s=projectGame(s,now+10*60000);
 assert(s.resources.parts>0);assert(s.resources.parts<=8);assert(s.resources.crops<=18);assert(s.resources.water>=0);assert.deepEqual(s.receipts,receipts);assert.deepEqual(s.orders,orders);
});
test('offline production matches smaller projections while within the cap',()=>{
 let s=tutorial();s=act(s,'buy_upgrade',{upgradeId:'workshop'});s=act(s,'buy_upgrade',{upgradeId:'energy'});const once=projectGame(s,now+600000);let pieces=s;for(let i=1;i<=60;i++)pieces=projectGame(pieces,now+i*10000);
 assert.deepEqual(pieces.resources,once.resources);assert.deepEqual(pieces.production,once.production);assert.deepEqual(pieces.statistics,once.statistics);
});
test('rivals expire using server time and cannot award repeated storage bonuses',()=>{
 let s=tutorial();s=act(s,'accept_rival',{rivalId:'quay-restock'});const expired=projectGame(s,now+480001);assert.equal(expired.rivals['quay-restock'].status,'expired');assert.throws(()=>act(expired,'complete_rival',{rivalId:'quay-restock'},now+480001));
 s=projectGame(s,now+180000);s=act(s,'complete_rival',{rivalId:'quay-restock'},now+180000);assert.equal(s.bonusCapacity,6);assert.throws(()=>act(s,'accept_rival',{rivalId:'quay-restock'},now+180000),/already awarded/);
});
test('new districts reset production only after progression, preserving receipt history and real-money boundary',()=>{
 let s=tutorial();assert.throws(()=>act(s,'prestige'),/three orders/);s=act(s,'buy_plot');s=act(s,'buy_upgrade',{upgradeId:'workshop'});
 for(let n=1;n<=2;n++){const at=now+n*180000;s=projectGame(s,at);s=act(s,'accept_order',{orderId:'first-harvest'},at);s=act(s,'deliver_order',{orderId:'first-harvest'},at);}
 const receipts=structuredClone(s.receipts),actions=Object.keys(s.actions).length;s=act(s,'prestige',{},now+360000);assert.equal(s.district,2);assert.equal(s.upgrades.plots,0);assert.equal(s.resources.crops,0);assert.equal(s.statistics.districtDeliveries,0);assert.deepEqual(s.receipts,receipts);assert.equal(Object.keys(s.actions).length,actions+1);assert.equal(getGameView(s,now+360000).guide.complete,true);
});
test('upgrade levels and prices are catalogue-controlled; free requests cannot set arbitrary state',()=>{
 let s=act(createGame({playerId:'player',now}),'buy_plot');const action={id:'water',type:'buy_upgrade',upgradeId:'water',priceSompi:1,level:99};assert.equal(quoteGameAction(s,action,now).amountSompi,CATALOGUE.upgrades.water.pricesSompi[0]);s=applyGameAction(s,action,now,{payment:witness(s,action)});assert.equal(s.upgrades.water,1);assert.throws(()=>act(s,'buy_upgrade',{upgradeId:'wallet-balance'}),/listed upgrade/);assert.throws(()=>act(s,'mint-money'),/available town action/);
});
