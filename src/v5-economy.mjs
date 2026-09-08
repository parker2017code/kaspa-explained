// Authoritative game rules for the V5 backend. Production is a game mechanic.
// This module has no wallet balance and never creates or transfers tKAS.
// payment witnesses must be independently verified by the backend before use.
export const OFFLINE_CAP_MS=8*60*60*1000;
export const FEE_RESERVE_SOMPI=1000000;
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const NPCS=freeze([{id:'food-store',name:'Mara',business:'Town Food Store'},{id:'cafe',name:'Jun',business:'Harbor Café'},{id:'workshop',name:'Moss',business:'Moss’s Workshop'}]);
export const CATALOGUE=freeze({
 upgrades:{
  plots:{label:'Growing plots',pricesSompi:[50000000,65000000,80000000,100000000,125000000]},
  water:{label:'Water supply',pricesSompi:[10000000,20000000,35000000]},
  storage:{label:'Storehouse',pricesSompi:[10000000,20000000,35000000]},
  workshop:{label:'Parts workshop',pricesSompi:[15000000,25000000,40000000]},
  energy:{label:'Solar energy',pricesSompi:[15000000,25000000,40000000]}
 },
 orders:{
  'first-harvest':{npcId:'food-store',title:'Food for the town',requires:{crops:3},rewardSompi:25000000,cooldownMs:120000},
  'cafe-delivery':{npcId:'cafe',title:'Fresh café ingredients',requires:{crops:6,water:2},rewardSompi:15000000,cooldownMs:90000},
  'workshop-delivery':{npcId:'workshop',title:'Parts for the harbor',requires:{parts:2},rewardSompi:20000000,cooldownMs:120000}
 },
 rivals:{
  'quay-restock':{name:'Linden’s rival delivery',description:'Beat a local courier’s eight-minute restocking target.',requires:{crops:9},durationMs:480000,bonusCapacity:6},
  'repair-race':{name:'Fern’s repair contract',description:'Prepare three parts before the local workshop deadline.',requires:{parts:3},durationMs:600000,bonusCapacity:10}
 }
});
export const GUIDE=freeze([
 {id:'plot',title:'Claim your first plot',detail:'Pay 0.5 tKAS to open a growing plot. Your plot opens when the network accepts your payment.',action:{type:'buy_plot',label:'Buy first plot · 0.5 tKAS'}},
 {id:'plant',title:'Plant the first crop',detail:'Use one water to start growing. Your plot keeps producing until you pause it.',action:{type:'plant',label:'Plant crops'}},
 {id:'water',title:'Water the new planting',detail:'Use one water to finish a batch of three game crops now.',action:{type:'water',label:'Water the crops'}},
 {id:'harvest',title:'Bring in your first harvest',detail:'Move the ripe crops from your plot into the storehouse.',action:{type:'harvest',label:'Harvest crops'}},
 {id:'order',title:'Meet Mara at the food store',detail:'Mara’s first order needs three crops and offers a treasury-funded 0.25 tKAS payment.',action:{type:'accept_order',orderId:'first-harvest',label:'Accept Mara’s order'}},
 {id:'delivery',title:'Deliver three crops',detail:'The town sets aside your payment. Deliver your crops when the network accepts the 0.25 tKAS transfer.',action:{type:'deliver_order',orderId:'first-harvest',label:'Deliver crops · receive 0.25 tKAS'}},
 {id:'upgrade',title:'Improve your water supply',detail:'Spend 0.1 tKAS on faster water replenishment and a larger reserve.',action:{type:'buy_upgrade',upgradeId:'water',label:'Upgrade water · 0.1 tKAS'}},
 {id:'pip',title:'Let Pip collect the harvest',detail:'Pip can harvest and run your parts workshop. Orders and coin transfers still need your action.',action:{type:'enable_pip',label:'Enable Pip'}},
]);
function fail(code,message){const error=new Error(message);error.code=code;throw error;}
const timestamp=now=>{if(!Number.isSafeInteger(now)||now<0)fail('INVALID_TIME','A valid server timestamp is required.');return now;};
const identity=(value,label)=>{if(typeof value!=='string'||value.length<1||value.length>256)fail('INVALID_ID',`A valid ${label} is required.`);return value;};
const fingerprint=value=>JSON.stringify(value,Object.keys(value).sort());
const capacities=s=>({crops:18+s.upgrades.storage*18+s.bonusCapacity,water:6+s.upgrades.water*6,parts:8+s.upgrades.storage*8+s.bonusCapacity});
const cropInterval=s=>Math.floor(45000/(1+s.upgrades.energy*.25));
const waterInterval=s=>Math.floor(90000/(1+s.upgrades.water*2));
const workshopInterval=s=>Math.floor(60000/(1+s.upgrades.energy*.25));
const event=(s,now,type,title,detail)=>{s.events.unshift({id:s.revision+':'+s.events.length,at:now,type,title,detail});s.events=s.events.slice(0,80);};
function checkedState(state){if(state?.version!==5||!state.playerId||!state.upgrades||!state.resources)fail('INVALID_GAME','This game state needs recovery.');return structuredClone(state);}
export function createGame({playerId,now=Date.now()}={}){
 identity(playerId,'player identity');timestamp(now);
 return {version:5,playerId,createdAt:now,lastProjectedAt:now,revision:0,district:1,resources:{crops:0,water:6,parts:0},upgrades:{plots:0,water:0,storage:0,workshop:0,energy:0},production:{planted:false,readyCrops:0,cropProgressMs:0,waterProgressMs:0,workshopProgressMs:0},automation:{enabled:false},orders:{},rivals:{},bonusCapacity:0,guideCompleted:[],statistics:{deliveries:0,harvested:0,partsCrafted:0,districtDeliveries:0},actions:{},receipts:{},events:[],offline:{capMs:OFFLINE_CAP_MS,appliedMs:0,capped:false}};
}
export function projectGame(state,now=Date.now()){
 timestamp(now);const s=checkedState(state),elapsed=Math.max(0,now-s.lastProjectedAt),duration=Math.min(elapsed,OFFLINE_CAP_MS),cap=capacities(s);
 s.offline={capMs:OFFLINE_CAP_MS,appliedMs:duration,capped:elapsed>OFFLINE_CAP_MS};if(now<s.lastProjectedAt)return s;
 s.lastProjectedAt=now;
 if(!duration)return s;
 // Advance production at resource-event boundaries. A long offline projection
 // and equivalent smaller checks produce the same result up to the offline cap.
 let remaining=duration;
 while(remaining>0){
  const growing=s.production.planted&&s.upgrades.plots>0,crafting=s.automation.enabled&&s.upgrades.workshop>0;
  const delta=Math.max(0,Math.min(remaining,waterInterval(s)-s.production.waterProgressMs,growing?cropInterval(s)-s.production.cropProgressMs:Infinity,crafting?workshopInterval(s)-s.production.workshopProgressMs:Infinity));
  remaining-=delta;s.production.waterProgressMs+=delta;if(growing)s.production.cropProgressMs+=delta;if(crafting)s.production.workshopProgressMs+=delta;
  if(s.production.waterProgressMs>=waterInterval(s)){s.production.waterProgressMs-=waterInterval(s);s.resources.water=Math.min(cap.water,s.resources.water+1);}
  if(growing&&s.production.cropProgressMs>=cropInterval(s)){s.production.cropProgressMs-=cropInterval(s);s.production.readyCrops=Math.min(Math.max(0,cap.crops-s.resources.crops),s.production.readyCrops+3*s.upgrades.plots);}
  if(s.automation.enabled){const amount=Math.min(s.production.readyCrops,cap.crops-s.resources.crops);s.resources.crops+=amount;s.production.readyCrops-=amount;s.statistics.harvested+=amount;}
  if(crafting&&s.production.workshopProgressMs>=workshopInterval(s)){s.production.workshopProgressMs-=workshopInterval(s);const count=Math.min(s.upgrades.workshop,Math.floor(s.resources.crops/2),s.resources.water,cap.parts-s.resources.parts);s.resources.crops-=count*2;s.resources.water-=count;s.resources.parts+=count;s.statistics.partsCrafted+=count;}
 }
 for(const contract of Object.values(s.rivals))if(contract.status==='accepted'&&now>contract.deadline)contract.status='expired';
 return s;
}
const owns=s=>{if(!s.upgrades.plots)fail('NEED_PLOT','Buy a growing plot first.');};
const hasResources=(s,required)=>Object.entries(required).every(([resource,amount])=>s.resources[resource]>=amount);
const requireResources=(s,required)=>{if(!hasResources(s,required))fail('NEED_RESOURCES','The storehouse does not contain the required supplies.');};
const spendResources=(s,required)=>{for(const [resource,amount]of Object.entries(required))s.resources[resource]-=amount;};
const mark=(s,id)=>{if(!s.guideCompleted.includes(id))s.guideCompleted.push(id);};
function execute(state,action,now){
 const s=projectGame(state,now);identity(action?.id,'action ID');identity(action?.type,'action type');const prior=s.actions[action.id];if(prior){if(prior.fingerprint!==fingerprint(action))fail('ACTION_CONFLICT','This action ID already belongs to a different request.');return {state:s,quote:{...prior.quote,alreadyApplied:true}};}
 const quote={kind:'free',amountSompi:0,actionId:action.id,description:'',alreadyApplied:false};const money=(kind,amount,description)=>Object.assign(quote,{kind,amountSompi:amount,description});const cap=capacities(s);
 if(action.type==='buy_plot'||action.type==='buy_upgrade'){
  const id=action.type==='buy_plot'?'plots':action.upgradeId,catalogue=CATALOGUE.upgrades[id];if(!catalogue)fail('UNKNOWN_UPGRADE','Choose a listed upgrade.');if(id!=='plots')owns(s);const level=s.upgrades[id];if(level>=catalogue.pricesSompi.length)fail('MAX_LEVEL','This upgrade is already complete.');money('purchase',catalogue.pricesSompi[level],catalogue.label+' level '+(level+1));s.upgrades[id]++;if(id==='plots')mark(s,'plot');if(id==='water')mark(s,'upgrade');event(s,now,'upgrade',catalogue.label+' improved','Accepted payment unlocks level '+s.upgrades[id]+'.');
 }else if(action.type==='plant'){
  owns(s);if(s.production.planted)fail('ALREADY_PLANTED','The plot is already growing crops.');requireResources(s,{water:1});s.resources.water--;s.production.planted=true;s.production.cropProgressMs=0;mark(s,'plant');event(s,now,'production','Crops planted','The plot grows three crops per batch.');
 }else if(action.type==='water'){
  owns(s);if(!s.production.planted)fail('NEED_PLANTING','Plant crops first.');if(s.resources.crops+s.production.readyCrops>=cap.crops)fail('STORE_FULL','Use or deliver crops before growing more.');requireResources(s,{water:1});s.resources.water--;s.production.readyCrops=Math.min(cap.crops-s.resources.crops,s.production.readyCrops+3*s.upgrades.plots);mark(s,'water');event(s,now,'production','A crop batch is ready','Watering finished a batch in the game.');
 }else if(action.type==='harvest'){
  const amount=Math.min(s.production.readyCrops,cap.crops-s.resources.crops);if(amount<=0)fail('NOT_READY','There are no ripe crops with room in storage.');s.production.readyCrops-=amount;s.resources.crops+=amount;s.statistics.harvested+=amount;mark(s,'harvest');event(s,now,'production','Harvest stored',amount+' crops moved into the storehouse.');
 }else if(action.type==='accept_order'){
  owns(s);const order=CATALOGUE.orders[action.orderId];if(!order)fail('UNKNOWN_ORDER','Choose a listed town order.');const current=s.orders[action.orderId];if(current?.status==='accepted')fail('ORDER_ACTIVE','This order is already accepted.');if((current?.availableAt||0)>now)fail('ORDER_COOLDOWN','This business is not ready for another delivery yet.');s.orders[action.orderId]={status:'accepted',acceptedAt:now,availableAt:0};if(action.orderId==='first-harvest')mark(s,'order');event(s,now,'order','Order accepted',order.title+'. Payment requires an accepted treasury transaction.');
 }else if(action.type==='deliver_order'){
  const order=CATALOGUE.orders[action.orderId];if(!order||s.orders[action.orderId]?.status!=='accepted')fail('NO_ORDER','Accept this order before delivering.');requireResources(s,order.requires);money('reward',order.rewardSompi,order.title);spendResources(s,order.requires);s.orders[action.orderId]={status:'cooldown',completedAt:now,availableAt:now+order.cooldownMs};s.statistics.deliveries++;s.statistics.districtDeliveries++;if(action.orderId==='first-harvest')mark(s,'delivery');event(s,now,'order','Order delivered','The receipt confirms the real treasury payment; the supplies were delivered in the game.');
 }else if(action.type==='enable_pip'){
  if(!s.statistics.deliveries||!s.upgrades.water)fail('PIP_LOCKED','Finish an order and improve the water supply first.');if(s.automation.enabled)fail('PIP_ENABLED','Pip is already helping.');s.automation.enabled=true;mark(s,'pip');event(s,now,'automation','Pip is on harvest duty','Pip collects crops and crafts parts when a workshop is available. It does not spend coins or submit orders.');
 }else if(action.type==='disable_pip'){
  s.automation.enabled=false;event(s,now,'automation','Pip is resting','Harvest and crafting remain available by hand.');
 }else if(action.type==='craft_parts'){
  if(!s.upgrades.workshop)fail('NEED_WORKSHOP','Build the parts workshop first.');if(s.resources.parts>=cap.parts)fail('STORE_FULL','The parts store is full.');requireResources(s,{crops:2,water:1});spendResources(s,{crops:2,water:1});s.resources.parts++;s.statistics.partsCrafted++;event(s,now,'production','One part crafted','Used two crops and one water in the game workshop.');
 }else if(action.type==='accept_rival'){
  if(s.statistics.deliveries<1)fail('RIVAL_LOCKED','Finish a town order before taking a rival contract.');const r=CATALOGUE.rivals[action.rivalId];if(!r)fail('UNKNOWN_RIVAL','Choose a listed rival contract.');if(s.rivals[action.rivalId]?.status==='completed')fail('RIVAL_COMPLETE','This contract already awarded its district bonus.');if(s.rivals[action.rivalId]?.status==='accepted')fail('RIVAL_ACTIVE','This rival contract is already running.');s.rivals[action.rivalId]={status:'accepted',deadline:now+r.durationMs};event(s,now,'rival','Rival contract started',r.description+' This is a local NPC challenge.');
 }else if(action.type==='complete_rival'){
  const r=CATALOGUE.rivals[action.rivalId],active=s.rivals[action.rivalId];if(!r||active?.status!=='accepted'||now>active.deadline)fail('NO_RIVAL','There is no active rival contract ready to finish.');requireResources(s,r.requires);spendResources(s,r.requires);s.bonusCapacity+=r.bonusCapacity;s.rivals[action.rivalId]={...active,status:'completed',completedAt:now};event(s,now,'rival','Rival delivery finished','Earned '+r.bonusCapacity+' extra game storage capacity. No coin reward.');
 }else if(action.type==='prestige'){
  if(s.statistics.districtDeliveries<3||s.upgrades.plots<2||s.upgrades.workshop<1)fail('DISTRICT_LOCKED','Finish three orders, own two plots and build a workshop to open a new district.');s.district++;s.resources={crops:0,water:6,parts:0};s.upgrades={plots:0,water:0,storage:0,workshop:0,energy:0};s.production={planted:false,readyCrops:0,cropProgressMs:0,waterProgressMs:0,workshopProgressMs:0};s.automation.enabled=false;s.orders={};s.rivals={};s.bonusCapacity=0;s.statistics.districtDeliveries=0;event(s,now,'district','District '+s.district+' opened','Local buildings and supplies restarted. Your real wallet and accepted payment history remain unchanged.');
 }else fail('UNKNOWN_ACTION','Choose an available town action.');
 return {state:s,quote};
}
export function quoteGameAction(state,action,now=Date.now()){return execute(state,action,now).quote;}
export function applyGameAction(state,action,now=Date.now(),{payment}={}){
 const {state:s,quote}=execute(state,action,now);if(quote.alreadyApplied)return s;
 if(quote.kind!=='free'){
  if(!payment?.transactionId||!payment.acceptingBlock)fail('PAYMENT_REQUIRED','An accepted payment receipt is required.');
  if(payment.playerId!==s.playerId||payment.actionId!==action.id||payment.kind!==quote.kind||Number(payment.amountSompi)!==quote.amountSompi||!Number.isSafeInteger(Number(payment.amountSompi)))fail('PAYMENT_MISMATCH','The accepted receipt does not match this player, action and exact amount.');
  if(s.receipts[payment.transactionId])fail('PAYMENT_USED','This payment receipt was already used by another action.');
  s.receipts[payment.transactionId]={transactionId:payment.transactionId,acceptingBlock:payment.acceptingBlock,actionId:action.id,kind:quote.kind,amountSompi:quote.amountSompi,at:now};
 }
 s.actions[action.id]={fingerprint:fingerprint(action),quote,transactionId:payment?.transactionId||null};s.revision++;
 return s;
}
export function getGameView(state,now=Date.now()){
 const s=projectGame(state,now),cap=capacities(s),guideIndex=GUIDE.findIndex(g=>!s.guideCompleted.includes(g.id));
 return {playerId:s.playerId,revision:s.revision,district:s.district,habitat:{food:Number(s.habitat?.food||0),careCount:Number(s.habitat?.careCount||0),lastCaredAt:s.habitat?.lastCaredAt??null,sproutEnergy:s.habitat?.sproutEnergy??null},marketUses:Object.keys(MARKET_USES).map(purpose=>{try{return {...quoteMarketUse(s,purpose,now),available:true,disabledReason:null};}catch(error){return {purpose,...structuredClone(MARKET_USES[purpose]),available:false,disabledReason:error.message};}}),resources:Object.entries(s.resources).map(([id,amount])=>({id,label:({crops:'Crops',water:'Water',parts:'Parts'})[id],amount,capacity:cap[id],ratePerMinute:id==='crops'&&s.production.planted?3*s.upgrades.plots*60000/cropInterval(s):id==='water'?60000/waterInterval(s):id==='parts'&&s.automation.enabled?s.upgrades.workshop*60000/workshopInterval(s):0})),plots:{count:s.upgrades.plots,planted:s.production.planted,readyCrops:s.production.readyCrops,nextHarvestAt:s.production.planted?s.lastProjectedAt+cropInterval(s)-s.production.cropProgressMs:null},upgrades:Object.entries(CATALOGUE.upgrades).map(([id,c])=>({id,label:c.label,level:s.upgrades[id],maxLevel:c.pricesSompi.length,priceSompi:c.pricesSompi[s.upgrades[id]]??null,unlocked:id==='plots'||s.upgrades.plots>0,disabledReason:s.upgrades[id]>=c.pricesSompi.length?'Fully upgraded':id!=='plots'&&!s.upgrades.plots?'Buy a plot first':null})),orders:Object.entries(CATALOGUE.orders).map(([id,o])=>{const current=s.orders[id],npc=NPCS.find(n=>n.id===o.npcId);return{id,...o,npcName:npc.name,business:npc.business,status:current?.status==='accepted'?'accepted':(current?.availableAt||0)>now?'cooldown':'available',ready:current?.status==='accepted'&&hasResources(s,o.requires),availableAt:current?.availableAt||0};}),guide:{index:guideIndex<0?GUIDE.length:guideIndex,total:GUIDE.length,complete:guideIndex<0,step:guideIndex<0?null:structuredClone(GUIDE[guideIndex])},automation:{enabled:s.automation.enabled,unlocked:s.statistics.deliveries>0&&s.upgrades.water>0},rivals:Object.entries(CATALOGUE.rivals).map(([id,r])=>({id,...r,status:s.rivals[id]?.status||'available',deadline:s.rivals[id]?.deadline||null,ready:s.rivals[id]?.status==='accepted'&&hasResources(s,r.requires),unlocked:s.statistics.deliveries>0})),prestige:{available:s.statistics.districtDeliveries>=3&&s.upgrades.plots>=2&&s.upgrades.workshop>=1,reason:'Complete three district orders, own two plots and build a workshop. Buildings and supplies restart; your wallet is unchanged.',nextDistrict:s.district+1},offline:s.offline,events:s.events,statistics:s.statistics,feeReserveSompi:FEE_RESERVE_SOMPI,boundaries:{production:'Production, upgrades, orders and NPC rivals are authoritative backend game rules.',money:'tKAS moves only through independently accepted chain payments. This game view does not contain a wallet balance.'}};
}

// Material use is a game effect of an independently accepted market transfer.
// Inventory is debited by that market transfer, never a second time in this module.
export const MARKET_USES=freeze({
 'feed_habitat':{requires:{crops:3},recipientId:'habitat-keeper',description:'Deliver three crops to the habitat and care for Sprout.'},
 'build_workshop':{requires:{wood:2,ore:1,tools:1},recipientId:'town-builder',description:'Deliver building materials to open the first parts workshop.'},
 'expand_greenhouse':{requires:{wood:3,tools:2},recipientId:'town-builder',description:'Deliver building materials to add one growing plot.'},
});
export function quoteMarketUse(state,purpose,now=Date.now()){
 const s=projectGame(state,now),recipe=Object.hasOwn(MARKET_USES,purpose)?MARKET_USES[purpose]:null;if(!recipe)fail('UNKNOWN_MARKET_USE','Choose a listed use for your materials.');
 if(purpose==='build_workshop'&&s.upgrades.workshop>0)fail('WORKSHOP_BUILT','The first workshop is already built.');
 if(purpose==='expand_greenhouse'&&s.upgrades.plots>=CATALOGUE.upgrades.plots.pricesSompi.length)fail('MAX_PLOTS','All growing plots are already open.');
 if(purpose==='feed_habitat'&&(Number(s.habitat?.food||0)>999997||Number(s.habitat?.careCount||0)>=1000000))fail('HABITAT_FULL','The habitat has enough supplies.');
 return {purpose,...structuredClone(recipe)};
}
export function applyMarketUse(state,action,now=Date.now(),receipt){
 timestamp(now);identity(action?.id,'action ID');identity(action?.purpose,'material purpose');
 const s=checkedState(state),fp=JSON.stringify({id:action.id,purpose:action.purpose}),prior=s.marketUseActions?.[action.id],hash=v=>typeof v==='string'&&/^[0-9a-f]{64}$/i.test(v);
 if(!receipt||!hash(receipt.transactionId)||!hash(receipt.acceptingBlock)||receipt.playerId!==s.playerId||receipt.purpose!==action.purpose)fail('MARKET_RECEIPT_REQUIRED','An accepted material transfer for this player and purpose is required.');
 const recipe=Object.hasOwn(MARKET_USES,action.purpose)?MARKET_USES[action.purpose]:null;if(!recipe||receipt.recipientId!==recipe.recipientId||!receipt.requires||JSON.stringify(Object.keys(receipt.requires).sort())!==JSON.stringify(Object.keys(recipe.requires).sort())||Object.entries(recipe.requires).some(([r,n])=>receipt.requires[r]!==n))fail('MARKET_RECEIPT_MISMATCH','The accepted transfer must deliver the exact material recipe to its recipient.');
 if(prior){if(prior.fingerprint!==fp||prior.transactionId!==receipt.transactionId)fail('ACTION_CONFLICT','This action ID already belongs to another material transfer.');return s;}
 if(s.actions[action.id]||s.marketUseReceipts?.[receipt.transactionId]||s.receipts[receipt.transactionId])fail('PAYMENT_USED','This action or transfer receipt was already used.');
 const quote=quoteMarketUse(s,action.purpose,now),next=projectGame(s,now);
 if(action.purpose==='feed_habitat')next.habitat={food:Number(next.habitat?.food||0)+3,careCount:Number(next.habitat?.careCount||0)+1,lastCaredAt:now,sproutEnergy:Math.min(12,Number(next.habitat?.sproutEnergy??8)+4)};
 else if(action.purpose==='build_workshop')next.upgrades.workshop=1;
 else {next.upgrades.plots++;mark(next,'plot');}
 next.marketUseActions??={};next.marketUseReceipts??={};
 next.marketUseActions[action.id]={fingerprint:fp,transactionId:receipt.transactionId,purpose:action.purpose,requires:quote.requires,recipientId:quote.recipientId};
 next.marketUseReceipts[receipt.transactionId]={transactionId:receipt.transactionId,acceptingBlock:receipt.acceptingBlock,actionId:action.id,purpose:action.purpose,requires:quote.requires,recipientId:quote.recipientId,kind:'market-use',at:now};
 next.revision++;event(next,now,'materials',action.purpose==='feed_habitat'?'Sprout’s habitat supplied':action.purpose==='build_workshop'?'Parts workshop built':'Growing plot opened','The node accepted the material transfer. '+quote.description);return next;
}
