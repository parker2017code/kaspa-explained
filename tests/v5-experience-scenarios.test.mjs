import test from 'node:test';
import assert from 'node:assert/strict';
import {describeV5Experience, describeV5Transaction} from '../src/v5-experience-scenarios.mjs';
import {renderV5ExperienceScene} from '../src/v5-experience-scene.mjs';

const schema = ['id', 'room', 'title', 'problem', 'mode', 'actionLabel', 'actors', 'flows', 'rule', 'resultTitle', 'result', 'technology', 'boundary'];
const player = 'player-1';

test('wallet and business diagrams preserve identities sharing a long player prefix', () => {
  const prefix = 'a'.repeat(64), from = `${prefix}:wallet`, to = `${prefix}:business`;
  const html = renderV5ExperienceScene({scenario: {
    actors: [{id:from,name:'Your wallet'}, {id:to,name:'Your business'}],
    flows: [{from,to,coinsSompi:'25000000'}],
  }});
  assert.match(html, /Your wallet sends 0\.25 tKAS to Your business/);
  assert.match(html, /Your wallet: sends 0\.25 tKAS; receives nothing/);
  assert.match(html, /Your business: sends nothing; receives 0\.25 tKAS/);
});
const baseView = {
  playerId: player,
  market: {
    playerId: player,
    actors: { [player]: {name: 'Your business'}, mira: {name: 'Mira'} },
    nativeQuotes: [{actorId: 'mira', resource: 'crops', available: 8, unitPriceSompi: '2000000'}],
  },
};

// These small inputs are also convenient screenshot-QA seeds. Each has a
// distinct actor count: local (2), ordinary market (2), ring (3), delivery
// agreement (3). The visual harness can import this test module and call the
// public descriptor with a fixture's view and action.
export const V5_EXPERIENCE_QA_FIXTURES = Object.freeze({
  local: {view: {playerId: player}, action: {type: 'plant'}},
  market: {view: baseView, action: {type: 'market_buy', to: 'mira', resource: 'crops', amount: 3, unitPriceSompi: '2000000'}},
  ring: {view: {playerId: player, advanced: {visual: {kind: 'ring', participants: [
    {name: 'Grower', gives: {crops: 3}}, {name: 'Toolmaker', gives: {tools: 1}}, {name: 'Miner', gives: {ore: 2}},
  ]}}}, action: {type: 'advanced_continue', stage: 'ring-ready'}},
  delivery: {view: {playerId: player, advanced: {visual: {kind: 'delivery', paymentSompi: '20000000', bondSompi: '10000000'}}}, action: {type: 'advanced_continue', stage: 'delivery-intro'}},
});

function scenario(action, view = baseView, step = {}) {
  return describeV5Experience(view, {step, action});
}

test('every described action has the serializable scenario schema', () => {
  for (const action of [
    {type: 'buy_plot'}, {type: 'plant'}, {type: 'water'}, {type: 'harvest'},
    {type: 'accept_order', orderId: 'first-harvest'}, {type: 'deliver_order', orderId: 'first-harvest'},
    {type: 'buy_upgrade', upgradeId: 'water'}, {type: 'enable_pip'}, {type: 'craft_parts'},
    {type: 'market_buy', to: 'mira', resource: 'crops', amount: 3, unitPriceSompi: '2000000'},
    {type: 'market_use', purpose: 'feed_habitat'}, {type: 'market_assistant', enabled: true, maxGive: {crops: 2}},
  ]) {
    const result = scenario(action);
    assert.ok(result);
    assert.deepEqual(Object.keys(result), schema);
    assert.doesNotThrow(() => JSON.stringify(result));
  }
});

test('farming descriptions show their actual game inputs', () => {
  assert.deepEqual(scenario({type: 'plant'}).flows[0].goods, {water: 1});
  assert.deepEqual(scenario({type: 'water'}).flows[0].goods, {water: 1});
  const craft = scenario({type: 'craft_parts'});
  assert.deepEqual(craft.flows[0].goods, {crops: 2, water: 1});
  assert.deepEqual(craft.flows[1].goods, {parts: 1});
});

test('catalogue fallbacks keep upgrade, order and native purchase quantities concrete', () => {
  assert.match(scenario({type: 'buy_plot'}).actionLabel, /0\.5 tKAS/);
  assert.equal(scenario({type:'buy_plot'}).result, 'Your first growing plot is ready. Town treasury received 0.5 tKAS.');
  assert.match(scenario({type: 'buy_upgrade', upgradeId: 'water'}).actionLabel, /0\.1 tKAS/);
  const delivery = scenario({type: 'deliver_order', orderId: 'first-harvest'});
  assert.deepEqual(delivery.flows.find(flow => flow.goods.crops)?.goods, {crops: 3});
  assert.equal(delivery.flows.find(flow => flow.coinsSompi)?.coinsSompi, '25000000');
  const buy = scenario({type: 'market_buy', to: 'mira', resource: 'crops', amount: 3, unitPriceSompi: '2000000'});
  assert.equal(buy.result, 'You received 3 crops. Mira received 0.06 tKAS.');
});

test('stocked workshop parts become tradeable tools', () => {
  const result = scenario({type: 'market_stock', resource: 'parts', amount: 2});
  assert.deepEqual(result.flows[0].goods, {tools: 2});
  assert.match(result.result, /You received 2 tools/);
});

test('material purpose drives the recipient and free play has no scenario', () => {
  const use = scenario({type: 'market_use', purpose: 'feed_habitat'});
  assert.deepEqual(use.flows[0].goods, {crops: 3});
  assert.equal(use.flows[0].to, 'habitat-keeper');
  assert.match(use.result, /received 3 crops/);
  assert.equal(scenario({type:'market_use',purpose:'build_workshop'}).room,'agent');
  assert.equal(scenario({type:'market_use',purpose:'expand_greenhouse'}).room,'coordination');
  assert.equal(describeV5Experience(baseView, {action: {type: 'open_freeplay'}}), null);
});

test('ring, role funding and delivery close results name concrete recipients', () => {
  const ringView = {playerId: player, advanced: {visual: {kind: 'ring', participants: [
    {name: 'Grower', gives: {crops: 3}}, {name: 'Toolmaker', gives: {tools: 1}}, {name: 'Miner', gives: {ore: 2}},
  ]}}};
  const ring = scenario({type: 'advanced_continue', stage: 'ring-ready'}, ringView);
  assert.match(ring.result, /Toolmaker received 3 crops/);
  assert.match(ring.result, /Miner received 1 tool\./);
  assert.match(ring.result, /Grower received 2 ore/);

  const funding = describeV5Transaction({playerId: player}, {operation: 'role-funding', transaction: {outputs: [{value: 50000000}, {value: 20000000}]}}, {id: 'delivery', room: 'computation', title: 'Delivery', problem: 'p', mode: 'chain', actionLabel: 'Fund', actors: [], flows: [], rule: 'r', resultTitle: 'Funded', result: 'old', technology: [], boundary: 'b'});
  assert.equal(funding.result, 'Customer received 0.5 tKAS. Courier received 0.2 tKAS.');

  const close = scenario({type: 'advanced_continue', stage: 'delivery-ready'}, {playerId: player, advanced: {visual: {kind: 'delivery', paymentSompi: '20000000', bondSompi: '10000000'}}});
  assert.equal(close.result, 'Courier received 0.2 tKAS and 0.1 tKAS.');
});

test('transaction mapping uses a material purpose even when payment metadata is gone', () => {
  const base = scenario({type: 'market_use', purpose: 'feed_habitat'});
  const result = describeV5Transaction({playerId: player}, {operation: 'trade', purpose: 'feed_habitat'}, base);
  assert.equal(result.id, base.id);
  assert.deepEqual(result.flows, base.flows);
  assert.match(result.result, /received 3 crops/);
});

test('advanced funding diagrams use exact receipt deposits instead of delivery payment values', () => {
  const view = {playerId:player,advanced:{visual:{kind:'delivery',paymentSompi:'20000000',bondSompi:'10000000'}}};
  const base = scenario({type:'advanced_continue',stage:'delivery-intro'},view);
  const funded = describeV5Transaction(view,{operation:'role-funding',customerFundingSompi:'50000000',courierFundingSompi:'20000000'},base);
  assert.equal(funded.result,'Customer received 0.5 tKAS. Courier received 0.2 tKAS.');
  const unknown = describeV5Transaction(view,{operation:'role-funding'},base);
  assert.equal(unknown.flows.length,0);
  const opened = describeV5Transaction(view,{operation:'ring-genesis',ringDeposits:['30000000','30000000','30000000']},scenario({type:'advanced_continue',stage:'ring-intro'},view));
  assert.deepEqual(opened.flows.map(flow=>flow.coinsSompi),['30000000','30000000','30000000']);
  assert.equal(opened.flows.every(flow=>flow.from==='treasury'),true);
  assert.match(opened.result,/Grower received 0.3 tKAS/);
});

test('status-only final events preserve the existing concrete route', () => {
  const base = scenario({type: 'market_buy', to: 'mira', resource: 'crops', amount: 3, unitPriceSompi: '2000000'});
  const result = describeV5Transaction({playerId: player}, {operation: 'trade'}, base);
  assert.deepEqual(result, base);
});

test('preparatory genesis and restock descriptions do not retain purchase flows', () => {
  const base = scenario({type: 'market_buy', to: 'mira', resource: 'crops', amount: 3, unitPriceSompi: '2000000'});
  const genesis = describeV5Transaction({playerId: player}, {operation: 'genesis'}, base);
  const restock = describeV5Transaction({playerId: player}, {operation: 'restock'}, base);
  assert.equal(genesis.flows.some(flow => flow.coinsSompi === '6000000' || flow.goods.crops), false);
  assert.equal(restock.flows.some(flow => flow.coinsSompi === '6000000' || flow.goods.crops), false);
});

test('preparatory receipts cannot borrow an amount or supplies from a later quote',()=>{
  const id='a'.repeat(64), base=scenario({type:'market_fund',amountSompi:'25000000'});
  const view={...baseView,market:{...baseView.market,cells:{mira:{transactionId:id,nativeSompi:'100000000'}}},payment:{kind:'market',status:'awaiting-signature',transactionId:null,marketPlan:{operation:'fund',actors:[player],wire:{transaction:{outputs:[{value:'125000000'}]}}}}};
  const genesis=describeV5Transaction(view,{id,operation:'genesis',actors:['mira']},base);
  assert.equal(genesis.flows[0].coinsSompi,'100000000');
  assert.equal(genesis.flows[0].to,'mira');
  assert.equal(genesis.actors.find(actor=>actor.id==='mira').name,'Mira');
  view.payment.marketPlan={operation:'trade',actors:[player,'mira'],wire:{inputStates:[{crops:0}],states:[{crops:3}]}};
  const restock=describeV5Transaction(view,{id,operation:'restock',actors:['mira']},base);
  assert.equal(restock.flows.length,0);
});
