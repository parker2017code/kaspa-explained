// Pure projection of the last service snapshot. Never advances time or invents a receipt.
import {createWorld} from './v4-world-model.mjs';
const R=['crops','wood','ore','tools','bread'],hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/i.test(v);
const count=v=>Number.isSafeInteger(Number(v))&&Number(v)>=0?Number(v):0;
const coin=v=>{try{const n=BigInt(v);return n>=0n?n.toString():null;}catch{return null;}};
const copy=v=>structuredClone(v);
const values=v=>Array.isArray(v)?v:Object.values(v||{});
const bag=v=>Object.fromEntries(R.map(r=>[r,count(v?.[r])]));
const sum=v=>v.reduce((total,n)=>total+BigInt(coin(n)||0),0n).toString();
function acceptedReceipts(snapshot,state,view){const receipts=new Map();for(const r of [...values(state?.receipts),...values(state?.marketUseReceipts),...values(snapshot.marketReceipts),...values(view.receipts)]){const id=r.transactionId||r.id;if(!hash(id)||!hash(r.acceptingBlock)||r.status&&r.status!=='accepted')continue;receipts.set(id,{...receipts.get(id),...copy(r),transactionId:id,status:'accepted',source:'testnet'});}return [...receipts.values()].sort((a,b)=>count(b.at)-count(a.at));}
export function projectV5Town(snapshot={}){
 const state=snapshot.state?.version===5?snapshot.state:null,view=snapshot.view||snapshot,market=snapshot.market||view.market||{},playerId=snapshot.playerId||state?.playerId||market.playerId||view.playerId;
 const farm=state?{crops:count(state.resources?.crops),water:count(state.resources?.water),parts:count(state.resources?.parts)}:Object.fromEntries(['crops','water','parts'].map(id=>[id,count(view.resources?.find?.(r=>r.id===id)?.amount)]));
 const upgrades=Object.fromEntries(['plots','water','storage','workshop','energy'].map(id=>[id,count(state?.upgrades?.[id]??view.upgrades?.find?.(u=>u.id===id)?.level??(id==='plots'?view.plots?.count:0))]));
 const habitat=state?.habitat||view.habitat||{},careCount=count(habitat.careCount),habitatFood=count(habitat.food);
 const ready=count(state?.production?.readyCrops??view.plots?.readyCrops),planted=Boolean(state?.production?.planted??view.plots?.planted),automation=Boolean(state?.automation?.enabled??view.automation?.enabled),statistics=state?.statistics||view.statistics||{};
 const receipts=acceptedReceipts(snapshot,state,view),trades=receipts.filter(r=>r.operation==='trade'&&!r.purpose),deliveries=count(statistics.deliveries),cell=market.cells?.[playerId],cellAccepted=hash(cell?.transactionId)&&hash(cell?.acceptingBlock),marketInventory=bag(market.actors?.[playerId]?.inventory),businessInventory=cellAccepted?bag(cell.state):null;
 const walletSompi=coin(snapshot.balanceSompi??view.wallet?.balanceSompi),businessSompi=cellAccepted?coin(cell.nativeSompi??cell.utxo?.amount):null;
 const mandate=cellAccepted&&cell.state?{operator:cell.state.operator,owner:cell.state.owner,allowances:Object.fromEntries([...R,'coin'].map(r=>[r,count(cell.state['allow_'+r])])),minReceive:count(cell.state.min_receive)}:null;
 const tradingEnabled=Boolean(market.assistant?.enabled)&&Boolean(mandate&&mandate.operator!==mandate.owner&&R.some(r=>mandate.allowances[r]>0));
 const pending=snapshot.payment||view.payment,deliveryOrders=values(state?.orders).filter(o=>o.status==='accepted').length||values(view.orders).filter(o=>o.status==='accepted').length;
 const world=createWorld();world.version=5;world.welcome=!state&&!view.playerId&&!view.wallet?.connected;world.tick=count(state?.revision??view.revision);world.mode='v5-service';
 // The existing shell's food/parts props depict game crops and crafted parts.
 world.resources={ore:marketInventory.ore,food:farm.crops,parts:farm.parts,energy:0};
 world.simulation={parts:farm.parts,food:habitatFood,shortage:false,efficient:false,factoryBuilt:upgrades.plots>0,habitatSupplied:careCount>0};
 world.economy={production:count(statistics.harvested),fees:0};
 world.coordination={raised:0,launched:upgrades.plots>0,readyMembers:[]};world.computation={verified:false,paid:false};
 world.market={settled:trades.length>0,exchanged:trades.length>0,acceptedTradeCount:trades.length};
 world.agent={budget:0,spent:0};world.robots=[{id:'Moss',x:0,y:0,strategy:'cautious',budget:0,inventory:upgrades.workshop?farm.parts:0},{id:'Pip',x:1,y:0,strategy:'cautious',budget:0,inventory:0},{id:'Bolt',x:2,y:0,strategy:'cautious',budget:0,inventory:0}];
 // Walking remains decorative; only accepted material care changes Sprout’s energy.
 world.creatures=world.creatures.map(c=>c.id==='Sprout'&&careCount>0?{...c,energy:count(habitat.sproutEnergy),source:'backend-game'}:{...c,source:'decorative'});world.terrarium={x:1,y:1,energy:careCount>0?count(habitat.sproutEnergy):8,source:careCount>0?'backend-game':'decorative'};
 world.events=receipts.map(r=>({id:r.transactionId,tick:world.tick,kind:r.purpose==='feed_habitat'?'terrarium':r.operation?'market':'coordination',title:r.purpose==='feed_habitat'?'Sprout’s habitat supplied':r.purpose==='build_workshop'?'Parts workshop built':r.purpose==='expand_greenhouse'?'Growing plot opened':r.operation==='trade'?'Market trade accepted':r.operation==='fund'?'Business funded':r.kind==='reward'?'Order payment accepted':'Transaction accepted',detail:r.kind==='reward'?'Treasury payment accepted.':'Accepted transaction recorded by the town.',source:'testnet',proof:{transactionId:r.transactionId,acceptingBlock:r.acceptingBlock}}));world.history=[];
 world.live={active:Boolean(snapshot.address||view.wallet?.address),balances:[walletSompi||'0',businessSompi||'0'],budget:0};
 const labels={parts:`${farm.parts} crafted parts`,food:careCount?`${habitatFood} crops supplied`:'Sprout’s habitat',delivery:deliveries?`${deliveries} order${deliveries===1?'':'s'} completed`:'Town orders',schedule:upgrades.workshop?'Parts workshop':'Town orders',greenhouse:upgrades.plots?`${upgrades.plots} growing plot${upgrades.plots===1?'':'s'}`:'Growing plots',market:trades.length?`${trades.length} accepted trade${trades.length===1?'':'s'}`:'Browse businesses',agent:tradingEnabled?'Pip’s remaining resource budget':'Choose Pip’s resource budget',care:careCount?'Sprout · cared for':'Care for Sprout',production:ready?`${ready} ripe crops`:planted?'Crops growing':'Plant crops'};
 labels.goods=['Crops','Materials','Tools'];labels.cart=trades.length?'Trade completed':'Choose a trade';labels.work=deliveryOrders?`${deliveryOrders} active order${deliveryOrders===1?'':'s'}`:'Town orders';labels.build=labels.greenhouse;
 labels.backers=['Growing plots','Pip · helper','Town builder'];labels.actors=[upgrades.workshop?'Moss · workshop ready':'Moss · town builder',automation?'Pip · harvesting':'Pip · your helper','Town courier'];
 labels.props={
  'agent:overspend':{text:'Pip’s trade budget',purpose:'Choose which resources Pip may trade and its remaining allowance.'},
  'agent:safe':{text:'Pip’s duties',purpose:'Review harvesting and trading help.'},'agent:revoke':{text:'Business coins',purpose:'Move wallet coins into your business before buying supplies.'},
  'market:partial':{text:'Stock and offers',purpose:'Compare available resources and complete trade offers.'},'market:complete':{text:'Trade with a business',purpose:'Review the exact quantities before signing an exchange.'},
  'terrarium:feed':{text:careCount?'Care for Sprout again':'Care for Sprout · 3 crops',purpose:'Transfer three market crops to the habitat keeper. Sprout’s care changes after acceptance.'},
  'terrarium:move':{text:'Growing crops',purpose:'Plant, water and harvest your growing plots.'},'terrarium:jump':{text:'Farm supplies',purpose:'Inspect crops, water and crafted parts.'},
  'coordination:invite':{text:'Growing plots',purpose:'Check planting and building progress.'},'coordination:build':{text:'Build with materials',purpose:'Transfer the listed materials to the town builder to open a workshop or plot.'},
  'computation:solve':{text:'Town orders',purpose:'Choose a delivery and inspect its accepted payment.'},
  'agent:escrow':{text:'Payment receipts',purpose:'Inspect accepted payments.'},'agent:treasury':{text:'Business coins',purpose:'Inspect or fund your business balance.'},
  'market:token':{text:'Businesses',purpose:'Inspect town businesses and available stock.'},'market:receipt':{text:'Trade receipts',purpose:'Inspect completed market transactions.'},
  'coordination:prediction':{text:'Town orders',purpose:'Check outstanding town deliveries.'},'computation:proof':{text:'Order receipts',purpose:'Inspect payments for completed deliveries.'},
 };
 world.v5Town={version:5,source:'service-snapshot',playerId:playerId||null,district:count(state?.district??view.district)||1,revision:world.tick,inventory:{farm,market:marketInventory,business:businessInventory},buildings:{...upgrades,growingPlots:upgrades.plots>0,partsWorkshop:upgrades.workshop>0},production:{planted,watered:Object.values(state?.actions||{}).filter(a=>{try{return JSON.parse(a.fingerprint).type==='water';}catch{return false;}}).length,readyCrops:ready,harvested:count(statistics.harvested),partsCrafted:count(statistics.partsCrafted),nextHarvestAt:view.plots?.nextHarvestAt??null,source:'backend-game'},delivery:{completed:deliveries,activeOrders:deliveryOrders,pending:Boolean(pending&&pending.status!=='accepted'&&(pending.action?.type==='deliver_order'||pending.kind==='reward')),inTransit:false,source:'backend-game'},pip:{harvesting:automation,trading:tradingEnabled,mandate},habitat:{food:habitatFood,careCount,lastCaredAt:habitat.lastCaredAt??null,sproutEnergy:habitat.sproutEnergy??null,source:'backend-game'},companions:{careAvailable:Boolean(state||view.marketUses?.some(x=>x.purpose==='feed_habitat')),movementIsIllustrative:true},money:{walletSompi,businessSompi,earnedSompi:sum(receipts.filter(r=>r.kind==='reward').map(r=>r.amountSompi)),purchasedSompi:sum(receipts.filter(r=>r.kind==='purchase').map(r=>r.amountSompi)),knownFeeSompi:sum(receipts.map(r=>r.feeSompi)),feesComplete:receipts.every(r=>coin(r.feeSompi)!==null)},receipts,pending:pending&&pending.status!=='accepted'?{status:pending.status,transactionId:pending.transactionId||null,kind:pending.kind}:null,labels};
 // Adapter compatibility; economicLoop stays absent to avoid its fixed V4 wage story.
 world.v5Economy=copy(view);return world;
}
