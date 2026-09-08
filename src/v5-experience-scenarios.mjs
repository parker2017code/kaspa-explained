// Pure, bounded descriptions for the Sprout Harbor V5 experience.
//
// This module only reads a service view, a story step and an action. It never
// advances a game clock, signs a transaction, or changes a wallet record. The
// presenter owns pending/accepted timing; these descriptions supply the
// causal copy and the concrete goods/coin flows for that presenter.

import {CATALOGUE, MARKET_USES, NPCS} from './v5-economy.mjs';

const RESOURCES = Object.freeze(['crops', 'wood', 'ore', 'tools', 'bread', 'water', 'parts']);
const MARKET_RESOURCES = new Set(['crops', 'wood', 'ore', 'tools', 'bread']);
const RESOURCE_SET = new Set(RESOURCES);
// These are the bounded, named inputs in v5-economy.mjs. They are fallback
// descriptions for the concrete farming actions; an explicit action or saved
// quote still wins when the host supplies one.
const GAME_INPUTS = Object.freeze({plant:{water:1}, water:{water:1}, craft_parts:{crops:2, water:1}});
const has = (value, key) => Boolean(value && typeof value === 'object' && !Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, key));
const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

function positiveInteger(value) {
  if (typeof value === 'bigint') return value > 0n && value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : null;
  if (typeof value === 'number') return Number.isSafeInteger(value) && value > 0 ? value : null;
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    try {
      const n = BigInt(value);
      return n > 0n && n <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(n) : null;
    } catch { return null; }
  }
  return null;
}

function nonNegativeSompi(value) {
  if (typeof value === 'bigint') return value >= 0n ? value.toString() : null;
  if (typeof value === 'number') return Number.isSafeInteger(value) && value >= 0 ? String(value) : null;
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    try { return BigInt(value).toString(); } catch { return null; }
  }
  return null;
}

function positiveSompi(value) {
  const result = nonNegativeSompi(value);
  return result !== null && BigInt(result) > 0n ? result : null;
}

function bundle(value, allowed = RESOURCE_SET) {
  const source = record(value), result = {};
  for (const [resource, amount] of Object.entries(source)) {
    if (!allowed.has(resource)) continue;
    const n = positiveInteger(amount);
    if (n !== null) result[resource] = n;
  }
  return result;
}

function hasGoods(value) { return Object.keys(value || {}).length > 0; }

function mergeBundles(...values) {
  const result = {};
  for (const value of values) for (const [resource, amount] of Object.entries(bundle(value))) result[resource] = (result[resource] || 0) + amount;
  return result;
}

function firstBundle(...values) {
  for (const value of values) {
    const result = bundle(value);
    if (hasGoods(result)) return result;
  }
  return {};
}

function formatGoods(value) {
  const entries = Object.entries(value || {});
  return entries.map(([resource, amount]) => `${amount} ${amount === 1 ? ({crops:'crop',tools:'tool',parts:'part'}[resource] || resource) : resource}`).join(', ');
}

function formatSompi(value) {
  const amount = nonNegativeSompi(value);
  if (amount === null) return null;
  const n = BigInt(amount), whole = n / 100000000n, fraction = String(n % 100000000n).padStart(8, '0').replace(/0+$/, '');
  return `${whole}${fraction ? `.${fraction}` : ''} tKAS`;
}

function sumSompi(...values) {
  const amounts = values.map(nonNegativeSompi);
  if (amounts.some(value => value === null)) return null;
  return amounts.reduce((sum, value) => sum + BigInt(value), 0n).toString();
}

function cloneSerializable(value) {
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') return undefined;
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return value.map(cloneSerializable).filter(value => value !== undefined);
  if (value && typeof value === 'object') {
    const result = {};
    for (const [key, item] of Object.entries(value)) {
      const next = cloneSerializable(item);
      if (next !== undefined) result[key] = next;
    }
    return result;
  }
  return value;
}

function playerId(view) {
  const m = record(view?.market);
  return String(m.playerId || view?.playerId || view?.state?.playerId || 'player');
}

function actorName(view, id, fallback) {
  if (String(id) === playerId(view)) return 'Your business';
  const m = record(view?.market), actors = record(m.actors);
  const actor = actors[id];
  return String(actor?.name || fallback || id);
}

function actorKind(view, id) { return record(view?.market?.actors)[id]?.kind || null; }

function canonicalAction(step, provided) {
  const candidate = provided ?? step?.action ?? step ?? {};
  if (typeof candidate === 'string') return {type: candidate};
  return record(candidate);
}

const ACTION_ALIASES = Object.freeze({
  open_fund: 'market_fund',
  open_native_buy: 'market_buy',
  open_stock: 'market_stock',
  open_assistant: 'market_assistant',
  open_habitat: 'market_use',
  open_construction: 'market_use',
  market_revoke: 'market_assistant',
  revoke_pip: 'market_assistant',
  pip_revoke: 'market_assistant',
});

function canonicalType(action, step = {}) {
  let type = String(action?.type || action?.kind || step?.type || '');
  if (type === 'open_habitat' || type === 'open_construction') {
    const stepId = String(step.id || ''), prefix = stepId.split('-')[0];
    const purpose = action.purpose || step.purpose || ({feed_habitat: 'feed_habitat', build_workshop: 'build_workshop', expand_greenhouse: 'expand_greenhouse'}[step.id] || {
      habitat: 'feed_habitat', construction: 'build_workshop', expand: 'expand_greenhouse', workshop: 'build_workshop', greenhouse: 'expand_greenhouse', build: 'build_workshop',
    }[prefix] || (stepId.startsWith('feed_habitat') ? 'feed_habitat' : stepId.startsWith('build_workshop') ? 'build_workshop' : stepId.startsWith('expand_greenhouse') ? 'expand_greenhouse' : undefined));
    return {type: 'market_use', ...(purpose ? {purpose} : {})};
  }
  return {type: ACTION_ALIASES[type] || type};
}

function storedAction(view, action) {
  const id = action?.id;
  if (!id) return {};
  return record(view?.state?.actions)?.[id] || record(view?.actions)?.[id] || record(view?.actionHistory)?.[id] || {};
}

function gameQuote(view, action) {
  const stored = storedAction(view, action);
  return record(stored.quote || record(view?.quotes)?.[action?.id] || view?.quote || action?.quote);
}

function upgrade(view, action) {
  const id = action?.upgradeId || (action?.type === 'buy_plot' ? 'plots' : null);
  const listed = (view?.upgrades || []).find(item => item?.id === id);
  if (listed) return listed;
  const catalogue = CATALOGUE.upgrades?.[id];
  if (!catalogue) return null;
  const levelValue = record(view?.state?.upgrades)[id];
  const level = typeof levelValue === 'number' && Number.isSafeInteger(levelValue) && levelValue >= 0 ? levelValue : 0;
  return {id, label:catalogue.label, level, maxLevel:catalogue.pricesSompi.length, priceSompi:catalogue.pricesSompi[level] ?? null};
}

function order(view, action) {
  const id = action?.orderId;
  const listed = (view?.orders || []).find(item => item?.id === id);
  if (listed) return listed;
  const catalogue = CATALOGUE.orders?.[id];
  if (!catalogue) return null;
  const npc = NPCS.find(item => item.id === catalogue.npcId);
  return {id, ...catalogue, ...(npc ? {npcName:npc.name, business:npc.business} : {})};
}

function useRecipe(view, purpose) {
  return (view?.marketUses || []).find(item => item?.purpose === purpose) || MARKET_USES[purpose] || null;
}

function marketTrade(view, action) {
  const m = record(view?.market), payment = record(view?.payment), plan = record(payment.marketPlan || view?.marketPlan), review = record(plan.economicReview);
  const id = action?.tradeId || plan.tradeId || payment.continuation?.tradeId;
  return record(m.trades?.[id] || view?.marketAction || review.trade || view?.trade);
}

function paymentOperation(view) {
  const payment = record(view?.payment), plan = record(payment.marketPlan || view?.marketPlan), advanced = record(view?.advanced), pending = record(advanced.pending);
  if (payment.kind === 'market' && ['awaiting-signature', 'pending', 'submitted'].includes(payment.status)) return String(plan.operation || '');
  if (pending.phase) return String(pending.phase);
  return '';
}

function transactionOutputValues(value) {
  let tx = value;
  if (typeof tx === 'string') {
    try { tx = JSON.parse(tx); } catch { return []; }
  }
  const outputs = Array.isArray(tx) ? tx : Array.isArray(tx?.outputs) ? tx.outputs : [];
  return outputs.map(output => nonNegativeSompi(output?.value));
}

function transactionAmount(view, event, index = 0) {
  const payment = record(view?.payment), plan = record(payment.marketPlan || view?.marketPlan), wire = record(plan.wire);
  const eventValues = transactionOutputValues(event?.transaction || event?.wire || event?.outputs);
  const eventId = event?.id || event?.transactionId;
  const samePayment = !eventId || eventId === payment.transactionId;
  const wireValues = samePayment ? transactionOutputValues(wire.transaction || plan.transaction || payment.transaction) : [];
  const values = eventValues.length ? eventValues : wireValues;
  return values[index] || null;
}

function coinAmount(view, action, ...extra) {
  const quote = gameQuote(view, action), payment = record(view?.payment), plan = record(payment.marketPlan || view?.marketPlan), review = record(plan.economicReview);
  const candidates = [
    action?.amountSompi, action?.rewardSompi, action?.priceSompi,
    quote.amountSompi, review.fundAmountSompi, plan.fundAmountSompi,
    ...extra, payment.kind === 'market' ? null : payment.amountSompi,
  ];
  for (const candidate of candidates) {
    const amount = positiveSompi(candidate);
    if (amount) return amount;
  }
  return null;
}

function marketCoinAmount(view, action, trade = {}) {
  const payment = record(view?.payment), plan = record(payment.marketPlan || view?.marketPlan), review = record(plan.economicReview);
  const candidates = [action?.amountSompi, action?.totalSompi, action?.nativeAmountSompi, trade.nativeAmountSompi, review.trade?.nativeAmountSompi, review.nativeAmountSompi];
  for (const candidate of candidates) {
    const amount = positiveSompi(candidate);
    if (amount) return amount;
  }
  if (action?.resource && positiveInteger(action?.amount)) {
    const seller = action?.to || action?.actorId;
    const quote = (view?.market?.nativeQuotes || []).find(item => item?.actorId === seller && item?.resource === action.resource);
    if (quote) {
      const unit = positiveSompi(quote.unitPriceSompi);
      if (unit) return (BigInt(unit) * BigInt(action.amount)).toString();
    }
    const unit = positiveSompi(action?.unitPriceSompi || action?.unitPrice);
    if (unit) return (BigInt(unit) * BigInt(action.amount)).toString();
  }
  return null;
}

function marketActors(view, from, to, names = {}) {
  const m = record(view?.market);
  const result = {};
  if (from) result[from] = actorName(view, from, names[from] || (from === playerId(view) ? 'Your business' : from));
  if (to) result[to] = actorName(view, to, names[to] || to);
  return result;
}

function createContext(view, step, providedAction, operationOverride = '') {
  const action = canonicalAction(step, providedAction), canonical = canonicalType(action, step), merged = {...action, ...canonical};
  if (!merged.purpose && canonical.purpose) merged.purpose = canonical.purpose;
  return {view: record(view), step: record(step), action: merged, originalAction: action, type: canonical.type, operationOverride: operationOverride || '', player: playerId(view)};
}

function emptyActors() { return []; }

function makeActors(view, entries = []) {
  const map = new Map();
  for (const entry of entries) {
    if (!entry?.id) continue;
    const id = String(entry.id), prior = map.get(id) || {id, name:String(entry.name || id), gives:{}, receives:{}};
    if (entry.name) prior.name = String(entry.name);
    prior.gives = {...prior.gives, ...bundle(entry.gives)};
    prior.receives = {...prior.receives, ...bundle(entry.receives)};
    map.set(id, prior);
  }
  return [...map.values()];
}

function addActor(actors, id, name, gives = {}, receives = {}) {
  if (!id) return;
  const prior = actors.find(actor => actor.id === String(id));
  if (prior) {
    if (name) prior.name = String(name);
    prior.gives = {...prior.gives, ...bundle(gives)};
    prior.receives = {...prior.receives, ...bundle(receives)};
    return;
  }
  actors.push({id:String(id), name:String(name || id), gives:bundle(gives), receives:bundle(receives)});
}

function addFlow(actors, {from, to, goods = {}, coinsSompi = null, label = ''} = {}) {
  if (!from || !to) return null;
  const cleanGoods = bundle(goods), cleanCoins = positiveSompi(coinsSompi);
  if (!hasGoods(cleanGoods) && !cleanCoins) return null;
  const flow = {from:String(from), to:String(to), goods:cleanGoods, ...(cleanCoins ? {coinsSompi:cleanCoins} : {}), label:String(label || 'Transfer')};
  const fromActor = actors.find(actor => actor.id === flow.from), toActor = actors.find(actor => actor.id === flow.to);
  if (fromActor) fromActor.gives = {...fromActor.gives, ...cleanGoods};
  if (toActor) toActor.receives = {...toActor.receives, ...cleanGoods};
  return flow;
}

function actorDisplay(view, id, player, fallback = 'Neighbor') {
  if (String(id) === String(player)) return 'You';
  if (String(id) === `${player}:wallet`) return 'Your wallet';
  if (String(id) === `${player}:farm`) return 'Your harbor storehouse';
  return actorName(view, id, fallback);
}

// Keep the result sentence about the observable transfer. Contract and game
// consequences belong in rule/boundary; this text is what the user sees when
// the scene returns from the accepting block.
const actorLabels = (actors, player) => Object.fromEntries(actors.map(actor=>[actor.id, actor.id === player ? 'You' : actor.name]));

function receivedSummary(view, flows, player, labels = {}) {
  const statements = [];
  for (const flow of flows || []) {
    const recipient = labels[flow.to] || actorDisplay(view, flow.to, player);
    const goodsText = formatGoods(flow.goods);
    if (goodsText) statements.push(`${recipient} received ${goodsText}`);
    const coinsText = formatSompi(flow.coinsSompi);
    if (coinsText) statements.push(`${recipient} received ${coinsText}`);
  }
  return statements.length ? `${statements.join('. ')}.` : null;
}

// Coin-only contract steps often have two legs to the same endpoint (the
// delivery payment and the courier bond). Group those legs so the result says
// exactly what the recipient received without repeating the endpoint twice.
function coinReceivedSummary(view, flows, player, labels = {}) {
  const grouped = new Map();
  for (const flow of flows || []) {
    const amount = formatSompi(flow.coinsSompi);
    if (!amount) continue;
    const recipient = labels[flow.to] || actorDisplay(view, flow.to, player);
    const amounts = grouped.get(recipient) || [];
    amounts.push(amount);
    grouped.set(recipient, amounts);
  }
  return [...grouped].map(([recipient, amounts]) => `${recipient} received ${amounts.join(' and ')}.`).join(' ') || null;
}

function baseScenario({id, room, title, problem, mode, actionLabel, rule, resultTitle, result, technology, boundary, actors = [], flows = []}) {
  return cloneSerializable({id, room, title, problem, mode, actionLabel, actors, flows, rule, resultTitle, result, technology, boundary});
}

const tech = {
  local: [{label:'Game state', text:'The harbor saves production and inventory as game state.'}],
  proposal: [{label:'Saved offer', text:'The terms wait for approval before supplies move.'}],
  observe: [{label:'Receipt', text:'The saved result is read back without creating a transaction.'}],
  wallet: [{label:'Wallet', text:'The wallet signs a Testnet-10 payment.'}, {label:'Kaspa', text:'An accepting DAG block records the payment.'}],
  market: [{label:'Argent', text:'Business state and spending rules are checked together.'}, {label:'SilverScript', text:'The contract checks the requested successor state.'}, {label:'Kaspa', text:'An accepting DAG block records the contract transaction.'}],
  advanced: [{label:'Argent', text:'The demo contract binds roles, amounts and successor state.'}, {label:'SilverScript', text:'The compiled script checks the spend.'}, {label:'Kaspa', text:'An accepting DAG block records the accepted transaction.'}],
};

function gameLocal(ctx, details = {}) {
  const {view, action, type, player} = ctx, actors = [], flows = [], goods = details.goods || firstBundle(action.requires, action.consumes, action.goods, action.resources, action.input), target = details.target || 'game-state';
  const source = details.from || player;
  addActor(actors, source, details.fromName || 'Your harbor');
  if (details.participant) addActor(actors, details.participant.id, details.participant.name);
  if (hasGoods(goods) && details.to) {
    addActor(actors, details.to, details.toName || details.to);
    const transfer = addFlow(actors, {from:source, to:details.to, goods, label:details.flowLabel || 'Game supply used'});
    if (transfer) flows.push(transfer);
  }
  if (type === 'accept_order' && details.order) addActor(actors, details.order.npcId, details.order.npcName || details.order.business || details.order.npcId);
  const text = details.goodsText || (hasGoods(goods) ? formatGoods(goods) : null);
  return baseScenario({
    id:details.id || `v5-${type}`,
    room:details.room || 'coordination',
    title:details.title || 'Update the harbor',
    problem:details.problem || 'The harbor needs a local game action to keep moving.',
    mode:'local',
    actionLabel:details.actionLabel || action.label || details.label || 'Continue',
    actors,
    flows,
    rule:details.rule || (text ? `Use ${text} in the harbor game.` : 'The saved game state applies this action.'),
    resultTitle:details.resultTitle || 'Harbor state updated',
    result:details.result || 'The game state records the action. No Testnet coins move.',
    technology:tech.local,
    boundary:details.boundary || 'Game-only action; it does not move tKAS.',
  });
}

function chainWallet(ctx, details = {}) {
  const {view, action, player} = ctx, actors = [], flows = [], amount = details.amount || coinAmount(view, action), treasury = details.treasury || 'treasury';
  addActor(actors, player, 'Your wallet'); addActor(actors, treasury, details.treasuryName || 'Town treasury');
  const transfer = addFlow(actors, {from:player, to:treasury, coinsSompi:amount, label:details.flowLabel || 'Testnet payment'});
  if (transfer) flows.push(transfer);
  const amountText = formatSompi(amount);
  return baseScenario({
    id:details.id || `v5-${ctx.type}`,
    room:details.room || 'coordination',
    title:details.title || 'Pay to move the harbor forward',
    problem:details.problem || 'This harbor change needs a Testnet-10 payment.',
    mode:'chain',
    actionLabel:details.actionLabel || (amountText ? `${details.label || 'Pay'} · ${amountText}` : details.label || 'Review payment'),
    actors, flows,
    rule:details.rule || (amountText ? `The wallet pays ${amountText}; the game effect waits for acceptance.` : 'The wallet payment must be accepted before the game effect is applied.'),
    resultTitle:details.resultTitle || 'Payment accepted',
    result:details.result || [details.consequence, receivedSummary(view, flows, player, Object.fromEntries(actors.map(actor=>[actor.id,actor.name])))].filter(Boolean).join(' ') || 'The payment is recorded after an accepting block; the harbor applies its game effect afterward.',
    technology:tech.wallet,
    boundary:details.boundary || 'The accepting block proves the test-coin payment; the harbor effect is a game rule.',
  });
}

function requestCoins(ctx) {
  const {view, action, player} = ctx, actors = [], flows = [], amount = coinAmount(view, action, view?.faucet?.amountSompi, view?.faucet?.amount);
  addActor(actors, 'faucet', 'Testnet faucet'); addActor(actors, player, 'Your wallet');
  const transfer = addFlow(actors, {from:'faucet', to:player, coinsSompi:amount, label:'Faucet payment'});
  if (transfer) flows.push(transfer);
  return baseScenario({
    id:'v5-wallet-faucet', room:'wallet', title:'Get test coins for the harbor',
    problem:'Your wallet needs Testnet-10 coins to pay for harbor actions.', mode:'chain',
    actionLabel:'Request test coins', actors, flows,
    rule:'The faucet sends test coins to this wallet; the node must accept that payment.',
    resultTitle:'Test coins accepted',
    result:receivedSummary(view, flows, player, actorLabels(actors,player)) || 'The faucet payment is credited after an accepting block. You can use the coins for the harbor demonstration.',
    technology:tech.wallet,
    boundary:'Testnet coins have no real monetary value; this faucet does not fund a production wallet.',
  });
}

function buyPlot(ctx) {
  const item = upgrade(ctx.view, {upgradeId:'plots'}), action = {...ctx.action, amountSompi:ctx.action.amountSompi || item?.priceSompi}, next = chainWallet({...ctx, action}, {
    id:'v5-farm-plot', room:'coordination', title:'Make room to grow', problem:'The harbor has no growing plot for its first crop.', label:'Open the first plot',
    rule:'The accepted payment unlocks one growing plot in the saved game state.', resultTitle:'Growing plot accepted', consequence:'Your first growing plot is ready.',
    boundary:'The accepting block proves the test-coin payment; the plot is a game rule.',
  });
  return next;
}

function buyUpgrade(ctx) {
  const item = upgrade(ctx.view, ctx.action), action = {...ctx.action, amountSompi:ctx.action.amountSompi || item?.priceSompi}, name = item?.label || ctx.action.upgradeId || 'harbor upgrade';
  return chainWallet({...ctx, action}, {
    id:`v5-upgrade-${ctx.action.upgradeId || 'harbor'}`, room:'coordination', title:`Improve ${name.toLowerCase()}`,
    problem:`The harbor needs a stronger ${name.toLowerCase()} for its next job.`, label:`Improve ${name}`,
    rule:'The accepted payment unlocks the next upgrade level in the saved game state.', resultTitle:`${name} accepted`, consequence:`${name} is upgraded.`,
    boundary:'The accepting block proves the test-coin payment; the upgrade is a game rule.',
  });
}

function orderGoods(ctx, current) {
  const actionGoods = firstBundle(ctx.action.requires, ctx.action.goods, ctx.action.deliver, ctx.action.resources);
  return hasGoods(actionGoods) ? actionGoods : bundle(current?.requires);
}

function acceptOrder(ctx) {
  const current = order(ctx.view, ctx.action), actors = [], player = ctx.player, npc = current?.npcId || ctx.action.npcId || 'town-order';
  const supplies = formatGoods(orderGoods(ctx,current)), reward = formatSompi(current?.rewardSompi);
  addActor(actors, player, 'Your harbor'); addActor(actors, npc, current?.npcName || current?.business || 'Town business');
  return baseScenario({
    id:'v5-order-accept', room:'market', title:'Take the next town order',
    problem:`${current?.npcName || current?.business || 'A town business'} needs ${supplies || 'supplies'}.${reward ? ` Deliver them for ${reward}.` : ''}`, mode:'local', actionLabel:'Accept the order', actors, flows:[],
    rule:'Accepting records the order in game state; its payment is prepared for the later delivery.', resultTitle:'Order accepted',
    result:'The order is ready when the required game supplies are available. No coins move yet.', technology:tech.local,
    boundary:'Order acceptance is a local game action. The later treasury payment is a separate accepted transaction.',
  });
}

function deliverOrder(ctx) {
  const current = order(ctx.view, ctx.action), goods = orderGoods(ctx, current), actors = [], flows = [], player = ctx.player, npc = current?.npcId || ctx.action.npcId || 'town-business', amount = coinAmount(ctx.view, ctx.action, current?.rewardSompi);
  addActor(actors, player, 'Your harbor'); addActor(actors, npc, current?.npcName || current?.business || 'Town business'); addActor(actors, 'treasury', 'Town treasury');
  const goodsFlow = addFlow(actors, {from:player, to:npc, goods, label:'Game delivery'}); if (goodsFlow) flows.push(goodsFlow);
  const coinFlow = addFlow(actors, {from:'treasury', to:player, coinsSompi:amount, label:'Treasury payment'}); if (coinFlow) flows.push(coinFlow);
  const reward = formatSompi(amount), goodsText = formatGoods(goods);
  return baseScenario({
    id:'v5-order-delivery', room:'computation', title:'Turn the order into a paid delivery',
    problem:`${current?.npcName || current?.business || 'The town'} is waiting for ${goodsText || 'the required supplies'}.`, mode:'chain', actionLabel:reward ? `Deliver the order · receive ${reward}` : 'Deliver the order', actors, flows,
    rule:reward ? `The treasury payment is ${reward}; the game delivery and payment settle as separate facts.` : 'The treasury payment and game delivery must be recorded before the order completes.',
    resultTitle:'Delivery payment accepted', result:receivedSummary(ctx.view, flows, player, actorLabels(actors,player)) || 'The treasury payment is credited after an accepting block; the order completes in game state after that evidence.', technology:tech.wallet,
    boundary:'The accepting block proves the test-coin payment; it does not prove physical delivery of the supplies.',
  });
}

function localFarm(ctx) {
  const {type, action, view, player} = ctx;
  const explicit = firstBundle(action.requires, action.consumes, action.goods, action.resources, action.input);
  const inputs = hasGoods(explicit) ? explicit : bundle(GAME_INPUTS[type]);
  if (type === 'plant') return gameLocal(ctx, {id:'v5-farm-plant', room:'coordination', title:'Start the first crop', problem:'The growing plot needs water before a crop can start.', actionLabel:'Plant crops', to:'growing-plot', toName:'Growing plot', flowLabel:'Planting water', goods:inputs, rule:`Use ${formatGoods(inputs) || 'the supplied game resource'} to start the crop.`, resultTitle:'Crop planted', result:'The crop starts growing in the saved game state.', boundary:'Planting is game-only; it does not create or move tKAS.'});
  if (type === 'water') return gameLocal(ctx, {id:'v5-farm-water', room:'coordination', title:'Water the growing crop', problem:'The planted crop needs water to finish a game batch.', actionLabel:'Water the crops', to:'growing-plot', toName:'Growing plot', flowLabel:'Water used', goods:inputs, rule:`Use ${formatGoods(inputs) || 'the supplied game resource'} to finish the batch.`, resultTitle:'Crop batch ready', result:'The game marks a crop batch ready for harvest.', boundary:'Watering is game-only; it does not create or move tKAS.'});
  if (type === 'harvest') {
    const ready = positiveInteger(action.amount) || positiveInteger(action.quantity) || positiveInteger(view?.plots?.readyCrops), goods = ready ? {crops:ready} : explicit;
    return gameLocal(ctx, {id:'v5-farm-harvest', room:'coordination', title:'Bring in the harvest', problem:'Ripe crops are waiting in the growing plot.', actionLabel:ready ? `Harvest ${ready} crops` : 'Harvest crops', from:'growing-plot', fromName:'Growing plot', to:'storehouse', toName:'Harbor storehouse', flowLabel:'Harvest stored', goods, rule:hasGoods(goods) ? `Move ${formatGoods(goods)} into the storehouse.` : 'Move the ripe crop batch into the storehouse.', resultTitle:'Harvest stored', result:ready ? `You harvested ${ready} crops into the harbor storehouse.` : 'The harvested crops are in the harbor storehouse.', boundary:'Harvesting is game-only; it does not create or move tKAS.'});
  }
  if (type === 'craft_parts') {
    const actors = [], flows = [];
    addActor(actors, player, 'Harbor storehouse'); addActor(actors, 'workshop', 'Parts workshop'); addActor(actors, 'parts-store', 'Parts store');
    const incoming = addFlow(actors, {from:player, to:'workshop', goods:inputs, label:'Workshop inputs'}); if (incoming) flows.push(incoming);
    const output = firstBundle(action.outputs, action.output, action.created); const crafted = hasGoods(output) ? output : {parts:1};
    const outgoing = addFlow(actors, {from:'workshop', to:'parts-store', goods:crafted, label:'Crafted part'}); if (outgoing) flows.push(outgoing);
    return baseScenario({id:'v5-workshop-craft', room:'agent', title:'Make workshop parts', problem:'The next town job needs workshop parts.', mode:'local', actionLabel:'Make workshop parts', actors, flows, rule:`Use ${formatGoods(inputs) || 'the supplied game inputs'} in the workshop and save ${formatGoods(crafted)}.`, resultTitle:'Parts crafted', result:'The game workshop adds the crafted parts to the harbor storehouse.', technology:tech.local, boundary:'Crafting is game-only; it does not create or move tKAS.'});
  }
  if (type === 'enable_pip') return gameLocal(ctx, {id:'v5-pip-harvest', participant:{id:'pip',name:'Pip'}, room:'agent', title:'Put Pip to work', problem:'Harvesting and workshop work are waiting for a helper.', actionLabel:'Put Pip to work', rule:'The saved game setting lets Pip collect ready crops and make parts when supplies allow.', resultTitle:'Pip is working', result:'Pip can handle eligible game production. Orders and coin transfers still need your action.', boundary:'Pip’s production is game-only; this permission does not authorize tKAS spending.'});
  if (type === 'disable_pip') return gameLocal(ctx, {id:'v5-pip-rest', participant:{id:'pip',name:'Pip'}, room:'agent', title:'Let Pip rest', problem:'You want to resume manual production.', actionLabel:'Let Pip rest', rule:'The saved game setting returns harvesting and workshop work to manual control.', resultTitle:'Pip is resting', result:'Manual game production is available again.', boundary:'Pip’s setting is game-only; no tKAS moves.'});
  if (type === 'accept_rival') {
    const rival = (view?.rivals || []).find(item => item.id === action.rivalId) || CATALOGUE.rivals?.[action.rivalId], actors = []; addActor(actors, player, 'Your harbor'); addActor(actors, action.rivalId || 'rival', rival?.name || 'Local rival');
    return baseScenario({id:'v5-rival-accept', room:'computation', title:'Take the rival challenge', problem:rival?.description || 'A local courier challenge is available.', mode:'local', actionLabel:'Join the challenge', actors, flows:[], rule:'The rival deadline and bonus are local game rules.', resultTitle:'Challenge started', result:'The game starts the rival challenge and tracks its deadline.', technology:tech.local, boundary:'This NPC challenge is local game state; it creates no Testnet payment.'});
  }
  if (type === 'complete_rival') {
    const rival = (view?.rivals || []).find(item => item.id === action.rivalId) || CATALOGUE.rivals?.[action.rivalId], goods = hasGoods(explicit) ? explicit : bundle(rival?.requires), actors = [], flows = []; addActor(actors, player, 'Your harbor'); addActor(actors, action.rivalId || 'rival', rival?.name || 'Local rival'); const transfer = addFlow(actors, {from:player, to:action.rivalId || 'rival', goods, label:'Rival game delivery'}); if (transfer) flows.push(transfer);
    return baseScenario({id:'v5-rival-complete', room:'computation', title:'Finish the rival challenge', problem:'The rival deadline is active and its supplies are ready.', mode:'local', actionLabel:'Finish the challenge', actors, flows, rule:hasGoods(goods) ? `Use ${formatGoods(goods)} before the local deadline.` : 'Use the required game supplies before the local deadline.', resultTitle:'Challenge complete', result:receivedSummary(view, flows, player, actorLabels(actors,player)) ? `${receivedSummary(view, flows, player, actorLabels(actors,player))} The game records the district storage bonus. No coin reward is created.` : 'The game records the district storage bonus. No coin reward is created.', technology:tech.local, boundary:'This NPC challenge is local game state; it creates no Testnet payment.'});
  }
  if (type === 'prestige') return gameLocal(ctx, {id:'v5-district-expand', room:'coordination', title:'Open the next harbor district', problem:'The current district is ready for a local reset and expansion.', actionLabel:'Open the next district', rule:'The game resets local buildings and supplies while retaining the wallet and accepted payment history.', resultTitle:'New district opened', result:'The game opens the next district and restarts its local production.', boundary:'District expansion is game-only; your wallet and accepted payment records do not change.'});
  return gameLocal(ctx, {title:'Keep the harbor moving'});
}

function marketGenesis(ctx, operation = 'genesis') {
  const {view, action, player} = ctx, actors = [], flows = [], payment = record(view?.payment), plan = record(payment.marketPlan || view?.marketPlan);
  const eventId = ctx.event?.id || ctx.event?.transactionId;
  const matchedCell = eventId ? Object.entries(view?.market?.cells || {}).find(([,cell])=>cell.transactionId === eventId) : null;
  const samePlan = plan.operation === 'genesis' && (!eventId || eventId === payment.transactionId);
  const target = ctx.event?.actors?.[0] || matchedCell?.[0] || (samePlan && plan.actors?.[0]) || player;
  const targetName = target === player ? 'Your business' : actorName(view,target,'Business store');
  const amount = transactionAmount(view,ctx.event || {},0) || positiveSompi(matchedCell?.[1]?.nativeSompi) || (samePlan ? positiveSompi(plan.depositSompi) || positiveSompi(plan.economicReview?.depositSompi) : null);
  addActor(actors, 'treasury', 'Town treasury'); addActor(actors, target, targetName);
  const transfer = addFlow(actors, {from:'treasury', to:target, coinsSompi:amount, label:'Open business store'}); if (transfer) flows.push(transfer);
  const amountText = formatSompi(amount), requested = ctx.type === 'market_fund' ? 'funding' : ctx.type === 'market_use' ? 'material transfer' : 'purchase';
  return baseScenario({id:ctx.baseId || 'v5-business-action', room:'market', title:target === player ? 'Open your business store' : `Open ${targetName}’s store`, problem:'This business needs a contract store before the requested action.', mode:'chain', actionLabel:'Open trading store', actors, flows,
    rule:amountText ? `The treasury opens the store with ${amountText}; this is preparation for the requested ${requested}.` : `A genesis transaction opens the store before the requested ${requested}.`, resultTitle:'Business store opened', result:receivedSummary(view, flows, player, actorLabels(actors,player)) || `The trading store is open. The requested ${requested} still needs its own settlement.`, technology:tech.market,
    boundary:'This preparatory transaction opens a contract store; it does not prove the later purchase, barter or material delivery.'});
}

function marketRestock(ctx) {
  const {view, player} = ctx, payment = record(view?.payment), plan = record(payment.marketPlan || view?.marketPlan);
  const eventId = ctx.event?.id || ctx.event?.transactionId;
  const samePlan = plan.operation === 'restock' && (!eventId || eventId === payment.transactionId);
  const wire = samePlan ? record(plan.wire) : {}, input = record(wire.inputStates?.[0]), output = record(wire.states?.[0]), goods = {};
  for (const resource of MARKET_RESOURCES) { const before = positiveInteger(input[resource]) || 0, after = positiveInteger(output[resource]) || 0; if (after > before) goods[resource] = after - before; }
  const target = ctx.event?.actors?.[0] || (samePlan && plan.actors?.[0]) || ctx.action.to || 'business', actors = [], flows = []; addActor(actors, 'treasury', 'Town issuer'); addActor(actors, target, actorName(view, target, 'Business store')); const transfer = addFlow(actors, {from:'treasury', to:target, goods, label:'Restock contract'}); if (transfer) flows.push(transfer);
  return baseScenario({id:ctx.baseId || 'v5-business-action', room:'market', title:'Restock the business contract', problem:'The requested trade needs goods added to the business store first.', mode:'chain', actionLabel:'Restock the store', actors, flows,
    rule:hasGoods(goods) ? `The issuer adds ${formatGoods(goods)} to the contract store before the requested trade.` : 'The issuer restocks the contract store before the requested trade.', resultTitle:'Business store restocked', result:receivedSummary(view, flows, player, actorLabels(actors,player)) || 'The store is restocked. The requested purchase or barter still needs its own settlement.', technology:tech.market,
    boundary:'This preparatory transaction adds modeled game supplies; it does not prove a physical shipment or complete the requested trade.'});
}

function marketFund(ctx) {
  const {view, action, player} = ctx, actors = [], flows = [], payment = record(view?.payment), plan = record(payment.marketPlan || view?.marketPlan), amount = coinAmount(view, action, plan.economicReview?.fundAmountSompi), business = player;
  // A wallet and its business share a player identity in the service view. Use
  // a distinct visual endpoint while retaining the stable player ID on the
  // business actor.
  const walletId = `${player}:wallet`;
  addActor(actors, walletId, 'Your wallet'); addActor(actors, business, 'Your business');
  const transfer = addFlow(actors, {from:walletId, to:business, coinsSompi:amount, label:'Fund business store'}); if (transfer) flows.push(transfer);
  const amountText = formatSompi(amount);
  return baseScenario({id:ctx.baseId || 'v5-business-fund', room:'market', title:'Put test coins into the business', problem:'The business needs contract-held test coins for its next purchase or fee.', mode:'chain', actionLabel:amountText ? `Move ${amountText} into business` : 'Move test coins into business', actors, flows,
    rule:amountText ? `Move ${amountText} from the wallet into the business contract.` : 'Move the reviewed amount from the wallet into the business contract.', resultTitle:'Business funded', result:receivedSummary(view, flows, player, {[business]:'Your business'}) || 'The accepted contract output increases the business balance. The wallet and business remain separate balances.', technology:tech.market,
    boundary:'The accepting block proves the business balance transition; game supplies and physical delivery remain separate evidence.'});
}

function marketStock(ctx) {
  const {action, player} = ctx, resource = action.resource, amount = positiveInteger(action.amount), gameResource = resource === 'parts' ? 'tools' : resource, actors = [], flows = [];
  addActor(actors, `${player}:farm`, 'Harbor storehouse'); addActor(actors, player, 'Your business'); const goods = resource && amount ? {[gameResource]:amount} : {}; const transfer = addFlow(actors, {from:`${player}:farm`, to:player, goods, label:'Stock the business'}); if (transfer) flows.push(transfer);
  const amountText = amount ? formatGoods(goods) : 'the selected supplies';
  return baseScenario({id:'v5-market-stock', room:'market', title:'Bring supplies to market', problem:'The trading store needs game supplies before a neighbor or town recipient can receive them.', mode:'local', actionLabel:amount ? `Bring ${amountText}` : 'Bring farm supplies', actors, flows,
    rule:`Move ${amountText} from the harbor storehouse into the trading store.`, resultTitle:'Supplies ready to trade', result:receivedSummary(ctx.view, flows, player, actorLabels(actors,player)) || 'The local game inventory records the stock move. A later contract settlement proves a transfer to a business or service recipient.', technology:tech.local,
    boundary:'Stocking is a game inventory move; it does not create a chain transaction or prove physical goods.'});
}

function proposal(ctx) {
  const {view, action, player, type} = ctx, trade = marketTrade(view, action), from = type === 'market_counter' ? player : trade.from || action.from || player, to = type === 'market_counter' ? (trade.from || action.to || 'neighbor') : trade.to || action.to || 'neighbor', give = type === 'market_counter' ? firstBundle(action.give, trade.want) : firstBundle(action.give, trade.give), want = type === 'market_counter' ? firstBundle(action.want, trade.give) : firstBundle(action.want, trade.want), actors = [], flows = [];
  addActor(actors, from, actorName(view, from, from === player ? 'Your business' : 'Neighbor')); addActor(actors, to, actorName(view, to, 'Neighbor'));
  const outgoing = addFlow(actors, {from, to, goods:give, label:'Proposed terms'}); if (outgoing) flows.push(outgoing); const incoming = addFlow(actors, {from:to, to:from, goods:want, label:'Requested in return'}); if (incoming) flows.push(incoming);
  return baseScenario({id:ctx.baseId || 'v5-market-proposal', room:'market', title:type === 'market_counter' ? 'Change the trade terms' : 'Propose a barter', problem:'Two businesses need terms they can both accept.', mode:'proposal', actionLabel:type === 'market_counter' ? 'Send counteroffer' : 'Propose trade', actors, flows,
    rule:hasGoods(give) || hasGoods(want) ? `Offer ${formatGoods(give) || 'supplies'} for ${formatGoods(want) || 'the neighbor’s supplies'}.` : 'Save the reviewed terms before either side moves supplies.', resultTitle:'Offer saved', result:'The offer moves no supplies. An accepted settlement must still pass both contract checks and an accepting block.', technology:tech.proposal,
    boundary:'A proposal is not a transfer. No game supply or tKAS moves until the accepted terms settle.'});
}

function marketUse(ctx) {
  const {view, action, player} = ctx, purpose = action.purpose, recipe = useRecipe(view, purpose), trade = marketTrade(view, action), requirements = firstBundle(action.requires, action.goods, recipe?.requires, trade.give), recipient = recipe?.recipientId || trade.to || ({feed_habitat:'habitat-keeper',build_workshop:'town-builder',expand_greenhouse:'town-builder'}[purpose] || 'town-recipient'), actors = [], flows = [];
  addActor(actors, player, 'Your business'); addActor(actors, recipient, recipient === 'habitat-keeper' ? 'Sprout’s habitat keeper' : recipient === 'town-builder' ? 'Town builder' : recipient);
  const transfer = addFlow(actors, {from:player, to:recipient, goods:requirements, label:purpose === 'feed_habitat' ? 'Care transfer' : purpose === 'build_workshop' ? 'Workshop materials' : 'Greenhouse materials'}); if (transfer) flows.push(transfer);
  const names = {feed_habitat:['Care for Sprout','Sprout needs food before care can apply','Care for Sprout','Sprout cared for','The habitat effect applies after the accepted material transfer.'],build_workshop:['Build the parts workshop','The town builder needs materials for the workshop','Build workshop','Workshop built','The workshop appears after the accepted material transfer.'],expand_greenhouse:['Add a growing plot','The harbor needs materials to make room for another harvest','Add growing plot','Growing plot added','The plot opens after the accepted material transfer.']};
  const [title, problem, label, resultTitle, result] = names[purpose] || ['Use materials in town','A town recipient is waiting for supplies','Send supplies','Material transfer accepted','The game applies the recipient’s effect after acceptance.'];
  const goodsText = formatGoods(requirements);
  const observedResult = receivedSummary(view, flows, player, {[recipient]:recipient === 'habitat-keeper' ? 'Sprout’s habitat keeper' : recipient === 'town-builder' ? 'Town builder' : recipient});
  return baseScenario({id:ctx.baseId || `v5-${purpose || 'market-use'}`, room:purpose === 'feed_habitat' ? 'terrarium' : purpose === 'build_workshop' ? 'agent' : 'coordination', title, problem, mode:'chain', actionLabel:goodsText ? `${label} · ${goodsText}` : label, actors, flows,
    rule:goodsText ? `The accepted contract transfer sends ${goodsText} to ${recipient === 'habitat-keeper' ? 'the habitat keeper' : 'the town builder'}.` : 'The accepted contract transfer must contain the reviewed material recipe.', resultTitle, result:observedResult || result, technology:tech.market,
    boundary:'The accepting block proves the contract transfer; care, construction and physical delivery are game outcomes.'});
}

function isDelegatedTrade(ctx, trade) {
  const {view, action} = ctx, receipts = [...(view?.receipts || []), ...(view?.marketReceipts || [])];
  return action.delegated === true || trade.delegated === true || receipts.some(receipt => receipt.delegatedPlayerTrade === true && (!trade.id || receipt.tradeId === trade.id));
}

function marketTradeSettlement(ctx) {
  const {view, action, player} = ctx, trade = marketTrade(view, action), from = trade.from || action.from || player, to = trade.to || action.to || action.actorId || 'neighbor', give = firstBundle(trade.give, action.give), requested = action.resource && positiveInteger(action.amount) && MARKET_RESOURCES.has(action.resource) ? {[action.resource]:positiveInteger(action.amount)} : {}, want = firstBundle(trade.want, action.want, requested), coins = marketCoinAmount(view, action, trade), purchase = Boolean(coins && !hasGoods(give) && hasGoods(want)), delegated = isDelegatedTrade(ctx, trade), actors = [], flows = [];
  addActor(actors, from, actorName(view, from, from === player ? 'Your business' : 'Neighbor')); addActor(actors, to, actorName(view, to, 'Neighbor'));
  const outgoing = addFlow(actors, {from, to, goods:give, label:delegated ? 'Pip’s permitted supply' : 'Contract goods'}); if (outgoing) flows.push(outgoing);
  const incoming = addFlow(actors, {from:to, to:from, goods:want, label:'Contract goods'}); if (incoming) flows.push(incoming);
  if (coins) { const coinFlow = addFlow(actors, {from, to, coinsSompi:coins, label:purchase ? 'Business purchase' : 'Quoted test-coin side'}); if (coinFlow) flows.push(coinFlow); }
  const coinText = formatSompi(coins), giveText = formatGoods(give), wantText = formatGoods(want);
  const observedResult = receivedSummary(view, flows, player, actorLabels(actors,player));
  return baseScenario({id:ctx.baseId || (delegated ? 'v5-pip-trade' : 'v5-market-settlement'), room:'market', title:delegated ? 'Let Pip complete the permitted barter' : purchase ? 'Buy supplies from a business' : 'Settle the barter', problem:purchase ? `The business needs ${wantText || 'the quoted supplies'}.` : 'Both businesses have terms ready to settle.', mode:'chain', actionLabel:purchase ? (coinText ? `Buy ${wantText || 'supplies'} · ${coinText}` : `Buy ${wantText || 'supplies'}`) : delegated ? 'Check Pip’s trade' : 'Accept the trade', actors, flows,
    rule:purchase ? (coinText ? `The business pays ${coinText} for ${wantText || 'the quoted supplies'} in one contract transaction.` : 'The business pays the reviewed native amount for the quoted supplies.') : giveText || wantText ? `The contract moves ${giveText || 'the agreed supplies'} and returns ${wantText || 'the agreed supplies'} together.` : 'The contract checks both successor inventories before settling.', resultTitle:delegated ? 'Pip’s trade accepted' : purchase ? 'Supplies purchased' : 'Barter accepted', result:observedResult ? `${delegated ? 'Pip completed the exchange. ' : ''}${observedResult}` : 'The contract settlement is recorded after an accepting block; each successor balance stays explicit.', technology:tech.market,
    boundary:delegated ? 'Pip may trade only the allowed game supplies; it cannot spend tKAS. The accepting block does not prove physical delivery.' : 'The accepting block proves the contract state transition; it does not prove physical delivery of game supplies.'});
}

function marketConfigure(ctx) {
  const {view, action, player} = ctx, payment = record(view?.payment), plan = record(payment.marketPlan || view?.marketPlan), policy = record(action.policy || plan.economicReview?.policy), enabled = action.enabled !== undefined ? Boolean(action.enabled) : Boolean(policy.operator && policy.owner && policy.operator !== policy.owner), allowances = firstBundle(action.maxGive, policy.maxGive, Object.fromEntries(RESOURCES.filter(resource => resource !== 'water' && resource !== 'parts').map(resource => [resource, positiveInteger(policy[`allow_${resource}`]) || 0]))), actors = [];
  addActor(actors, player, 'Your business'); addActor(actors, 'pip', 'Pip');
  const allowanceText = formatGoods(allowances);
  const result = enabled
    ? (allowanceText ? `Pip’s trade budget allows at most ${allowanceText}. Pip receives no coin allowance.` : 'Pip’s trade budget is saved with no allowed resource spend and no coin allowance.')
    : 'Pip’s trade budget is cleared; Pip receives no resource or coin allowance.';
  return baseScenario({id:ctx.baseId || (enabled ? 'v5-pip-delegate' : 'v5-pip-revoke'), room:'agent', title:enabled ? 'Give Pip a bounded trade budget' : 'Revoke Pip’s trade budget', problem:enabled ? (allowanceText ? `Allow Pip to trade at most ${allowanceText}. Pip cannot spend test coins.` : 'Review Pip’s resource limits. Pip cannot spend test coins.') : 'Clear Pip’s resource allowances and return trade control to you.', mode:'chain', actionLabel:enabled ? 'Authorize Pip to trade' : 'Revoke Pip’s trading permission', actors, flows:[],
    rule:enabled ? (hasGoods(allowances) ? `The contract allows Pip to give at most ${formatGoods(allowances)}; it cannot spend coins.` : 'The contract records the reviewed resource allowances and a zero coin allowance.') : 'The accepted successor state returns trade control to the owner and clears Pip’s allowances.', resultTitle:enabled ? 'Pip’s budget accepted' : 'Pip’s permission revoked', result, technology:tech.market,
    boundary:'Pip’s delegation covers game supplies only. The contract does not authorize Pip to spend test coins.'});
}

function advancedData(view) {
  const advanced = record(view?.advanced), visual = record(advanced.visual || advanced); return {advanced, visual};
}

function advancedParticipants(view, kind) {
  const {visual} = advancedData(view), list = Array.isArray(visual.participants) ? visual.participants : [];
  const defaults = kind === 'ring' ? [{id:'grower',name:'Grower'},{id:'toolmaker',name:'Toolmaker'},{id:'miner',name:'Miner'}] : [{id:'customer',name:'Customer'},{id:'courier',name:'Courier'},{id:'recipient',name:'Recipient'}];
  return defaults.map((fallback, index) => { const item = record(list[index]), id = String(item.id || fallback.id || String(item.name || fallback.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')); return {id, name:String(item.name || fallback.name), gives:bundle(item.gives), receives:bundle(item.receives)}; });
}

function advancedRing(ctx, operation = 'ring') {
  const {view} = ctx, participants = advancedParticipants(view, 'ring'), actors = [], flows = [];
  const labels = Object.fromEntries(participants.map(participant => [participant.id, participant.name]));
  if (operation === 'ring-genesis') {
    const visual = record(view?.advanced?.visual), deposits = ctx.event?.ringDeposits || (visual.operation === 'ring-genesis' && (!ctx.event?.id || visual.transactionId === ctx.event.id) ? visual.ringDeposits : []);
    if (Array.isArray(deposits) && deposits.some(positiveSompi)) addActor(actors, 'treasury', 'Town treasury');
    for (const participant of participants) addActor(actors, participant.id, participant.name);
    for (const [index, participant] of participants.entries()) { const transfer = addFlow(actors, {from:'treasury', to:participant.id, coinsSompi:positiveSompi(deposits?.[index]), label:'Open contract store'}); if (transfer) flows.push(transfer); }
    const depositsReceived = coinReceivedSummary(view, flows, ctx.player, labels);
    return baseScenario({id:ctx.baseId || 'v5-advanced-ring', room:'market', title:'Open the three ring stores', problem:'Three demo businesses need contract stores before their circular exchange can start.', mode:'chain', actionLabel:'Open ring stores', actors, flows, rule:'The genesis transaction opens three stores; no ring goods move in this preparation step.', resultTitle:'Ring stores opened', result:depositsReceived ? `${depositsReceived} The circular exchange is a later transaction.` : 'The three contract stores are ready. The complete circular exchange is a later transaction.', technology:tech.advanced, boundary:'This is a host-controlled demo of contract stores. Opening them is not the circular exchange and does not prove physical delivery.'});
  }
  for (const participant of participants) addActor(actors, participant.id, participant.name, participant.gives, participant.receives);
  for (let index = 0; index < participants.length; index++) { const from = participants[index], to = participants[(index + 1) % participants.length], transfer = addFlow(actors, {from:from.id, to:to.id, goods:from.gives, label:`${from.name} → ${to.name}`}); if (transfer) flows.push(transfer); }
  const observedResult = receivedSummary(view, flows, ctx.player, labels);
  return baseScenario({id:ctx.baseId || 'v5-advanced-ring', room:'market', title:'Close the complete circular exchange', problem:'Each demo business needs the next business’s supply in the same transaction.', mode:'chain', actionLabel:'Exchange all three supplies', actors, flows, rule:'All three contract legs must satisfy their successor checks together; an incomplete ring cannot settle.', resultTitle:'Ring exchange accepted', result:observedResult || 'The complete circular exchange is recorded after an accepting block; each successor balance stays explicit.', technology:tech.advanced, boundary:'The host controls all demo roles and game-issued supplies. An accepted block proves contract execution, not physical manufacture or delivery.'});
}

function advancedRoleFunding(ctx) {
  const {view} = ctx, actors = [], flows = [], visual = record(view?.advanced?.visual), funding = visual.operation === 'role-funding' && (!ctx.event?.id || visual.transactionId === ctx.event.id) ? visual : {}, values = transactionOutputValues(ctx.event?.transaction || ctx.event?.wire || record(view?.advanced?.pending).transaction || funding.transaction), customerAmount = positiveSompi(ctx.event?.customerFundingSompi) || values[0] || positiveSompi(funding.customerFundingSompi), courierAmount = positiveSompi(ctx.event?.courierFundingSompi) || values[1] || positiveSompi(funding.courierFundingSompi);
  addActor(actors, 'treasury', 'Town treasury'); addActor(actors, 'customer', 'Customer'); addActor(actors, 'courier', 'Courier');
  const customer = addFlow(actors, {from:'treasury', to:'customer', coinsSompi:customerAmount, label:'Fund customer role'}); if (customer) flows.push(customer);
  const courier = addFlow(actors, {from:'treasury', to:'courier', coinsSompi:courierAmount, label:'Fund courier role'}); if (courier) flows.push(courier);
  const observedResult = coinReceivedSummary(view, flows, ctx.player, {customer:'Customer', courier:'Courier'});
  return baseScenario({id:ctx.baseId || 'v5-advanced-delivery', room:'computation', title:'Fund the demo delivery roles', problem:'The customer and courier roles need native test coins before the agreement can open.', mode:'chain', actionLabel:'Fund customer and courier', actors, flows, rule:'This preparation transaction funds the host-controlled roles; it does not lock the delivery agreement.', resultTitle:'Delivery roles funded', result:observedResult || 'The demo accounts are funded. A later transaction opens the payment-and-bond agreement.', technology:tech.wallet, boundary:'The host controls these demonstration roles. Role funding is separate from the escrow agreement and proves no physical delivery.'});
}

function advancedEscrowOpen(ctx, operation = 'delivery-open') {
  const {view} = ctx, {visual} = advancedData(view), payment = positiveSompi(ctx.event?.paymentSompi) || positiveSompi(visual.paymentSompi), bond = positiveSompi(ctx.event?.bondSompi) || positiveSompi(visual.bondSompi), actors = [], flows = [];
  addActor(actors, 'customer', 'Customer'); addActor(actors, 'courier', 'Courier'); addActor(actors, 'delivery-contract', operation === 'refund-open' ? 'Refund agreement' : 'Delivery agreement');
  const pay = addFlow(actors, {from:'customer', to:'delivery-contract', coinsSompi:payment, label:'Lock customer payment'}); if (pay) flows.push(pay); const bondFlow = addFlow(actors, {from:'courier', to:'delivery-contract', coinsSompi:bond, label:'Lock courier bond'}); if (bondFlow) flows.push(bondFlow);
  const paymentText = formatSompi(payment), bondText = formatSompi(bond);
  const agreement = operation === 'refund-open' ? 'Refund agreement' : 'Delivery agreement';
  const observedResult = coinReceivedSummary(view, flows, ctx.player, {'delivery-contract':agreement});
  return baseScenario({id:ctx.baseId || 'v5-advanced-delivery', room:'computation', title:operation === 'refund-open' ? 'Open the refund agreement' : 'Lock payment and courier bond', problem:'The agreement needs a customer payment and courier bond before either outcome can settle.', mode:'chain', actionLabel:operation === 'refund-open' ? 'Open refund agreement' : 'Open delivery agreement', actors, flows,
    rule:paymentText || bondText ? `Lock ${paymentText || 'the quoted payment'} and ${bondText || 'the quoted bond'} in one contract output.` : 'Lock the reviewed payment and bond in one contract output.', resultTitle:'Agreement opened', result:observedResult || 'The accepting block locks the payment and bond. A receipt release or aged refund is a later spend.', technology:tech.advanced,
    boundary:'The host controls the customer, courier and recipient roles. Locking an agreement does not prove physical delivery.'});
}

function advancedClose(ctx, operation = 'delivery-release') {
  const {view} = ctx, {visual} = advancedData(view), payment = positiveSompi(ctx.event?.paymentSompi) || positiveSompi(visual.paymentSompi), bond = positiveSompi(ctx.event?.bondSompi) || positiveSompi(visual.bondSompi), recipient = operation === 'delivery-refund' ? 'customer' : 'courier', actors = [], flows = [];
  const agreement = operation === 'delivery-refund' ? 'Refund agreement' : 'Delivery agreement', recipientName = recipient === 'customer' ? 'Customer' : 'Courier';
  addActor(actors, 'delivery-contract', agreement); addActor(actors, recipient, recipientName);
  const pay = addFlow(actors, {from:'delivery-contract', to:recipient, coinsSompi:payment, label:operation === 'delivery-refund' ? 'Refund customer payment' : 'Release customer payment'}); if (pay) flows.push(pay); const bondFlow = addFlow(actors, {from:'delivery-contract', to:recipient, coinsSompi:bond, label:operation === 'delivery-refund' ? 'Return forfeited bond' : 'Return courier bond'}); if (bondFlow) flows.push(bondFlow);
  const refund = operation === 'delivery-refund';
  const observedResult = coinReceivedSummary(view, flows, ctx.player, {[recipient]:recipientName});
  return baseScenario({id:ctx.baseId || 'v5-advanced-delivery', room:'computation', title:refund ? 'Claim the aged refund' : 'Release the payment with a receipt', problem:refund ? 'The agreement has reached its relative age without a receipt.' : 'The recipient’s signed receipt is ready to release the agreement.', mode:'chain', actionLabel:refund ? 'Submit the refund' : 'Release to courier', actors, flows,
    rule:refund ? 'The contract checks the relative DAA age and pays the customer the fixed payment plus forfeited bond.' : 'The contract checks the recipient signature and pays the courier the fixed payment plus returned bond.', resultTitle:refund ? 'Refund accepted' : 'Receipt release accepted', result:observedResult || (refund ? 'The accepting block pays the customer and consumes the agreement.' : 'The accepting block releases the payment and bond to the courier.'), technology:tech.advanced,
    boundary:refund ? 'The host controls these demo roles; age enables the refund but does not prove a real-world dispute.' : 'The recipient signature is a trusted game attestation. An accepted block proves the contract spend, not physical delivery.'});
}

function advancedWait(ctx) {
  const {view} = ctx, {visual} = advancedData(view), current = ctx.action.currentDaa || visual.currentDaa, deadline = ctx.action.deadlineDaa || visual.deadlineDaa;
  return baseScenario({id:ctx.baseId || 'v5-advanced-delivery', room:'computation', title:'Wait for the refund age', problem:'The refund branch is not spendable until the node reports the required relative age.', mode:'observe', actionLabel:'Check refund age', actors:[{id:'delivery-contract',name:'Refund agreement'},{id:'customer',name:'Customer'}], flows:[], rule:current !== undefined && deadline !== undefined ? `The node compares the current DAA score with the agreement’s refund age (${deadline}).` : 'The node reports when the agreement’s relative DAA age is reached.', resultTitle:'Refund age observed', result:'No transaction is created while waiting. Once the node reports eligibility, the refund can be submitted.', technology:tech.observe, boundary:'A wall-clock countdown cannot authorize this spend; the contract uses node-observed relative age.'});
}

function advancedAcknowledge(ctx) {
  const stage = ctx.action.stage || '', ring = stage.startsWith('ring'), refund = stage.startsWith('refund');
  return baseScenario({id:ctx.baseId || `v5-advanced-${ring ? 'ring' : refund ? 'refund' : 'delivery'}`, room:ring ? 'market' : 'computation', title:refund ? 'Acknowledge the accepted refund' : ring ? 'Acknowledge the accepted ring' : 'Acknowledge the accepted delivery', problem:'The previous contract transaction has an accepting block.', mode:'observe', actionLabel:'Continue', actors:[], flows:[], rule:'Read the saved acceptance before moving to the next agreement step.', resultTitle:refund ? 'Refund result acknowledged' : ring ? 'Ring result acknowledged' : 'Delivery result acknowledged', result:'Acknowledgment reads the accepted result and creates no new transaction.', technology:tech.observe, boundary:refund ? 'The accepted block proves the contract refund; it does not establish an outside-world outcome.' : 'The accepted block proves contract execution; it does not prove physical delivery.'});
}

function advancedScenario(ctx) {
  const stage = String(ctx.action.stage || ''), operation = ctx.operationOverride || ({'ring-intro':'ring-genesis','ring-ready':'ring','delivery-intro':'delivery-open','refund-intro':'refund-open','delivery-ready':'delivery-release','refund-ready':'delivery-refund'}[stage] || '');
  if (['ring-complete', 'delivery-complete', 'refund-complete'].includes(stage)) return advancedAcknowledge(ctx);
  if (stage === 'refund-wait') return advancedWait(ctx);
  if (operation === 'ring-genesis' || operation === 'ring') return advancedRing(ctx, operation);
  if (operation === 'role-funding') return advancedRoleFunding(ctx);
  if (operation === 'delivery-open' || operation === 'refund-open') return advancedEscrowOpen(ctx, operation);
  if (operation === 'delivery-release' || operation === 'delivery-refund') return advancedClose(ctx, operation);
  return advancedAcknowledge(ctx);
}

function pendingCheck(ctx) {
  const {view} = ctx, payment = record(view?.payment), operation = paymentOperation(view), advanced = record(view?.advanced), pending = record(advanced.pending);
  if (pending.phase || (payment.kind === 'market' && operation && ['awaiting-signature', 'pending', 'submitted'].includes(payment.status)) || (payment.transactionId && payment.status && !['accepted', 'cancelled'].includes(payment.status))) {
    const action = payment.action || (pending.phase ? {type:'advanced_continue', stage:advanced.stage} : {}), next = createContext(view, ctx.step, action, operation);
    next.baseId = ctx.baseId || `v5-${ctx.type || 'transaction'}`; next.event = payment;
    if (pending.phase) return advancedScenario(next);
    if (operation === 'genesis') return marketGenesis(next, operation);
    if (operation === 'restock') return marketRestock(next);
    if (operation === 'fund') return marketFund(next);
    if (operation === 'configure') return marketConfigure(next);
    if (operation === 'trade') return marketTradeSettlement(next);
    if (payment.kind === 'reward') return deliverOrder(next);
    if (next.type === 'buy_plot') return buyPlot(next);
    if (next.type === 'buy_upgrade') return buyUpgrade(next);
    return chainWallet(next);
  }
  const prepared = Object.values(record(view?.market).trades || {}).find(trade => trade?.status === 'prepared' && [trade.from, trade.to].includes(playerId(view)));
  if (prepared) {
    const action = prepared.purpose ? {type:'market_use', purpose:prepared.purpose, tradeId:prepared.id} : {type:'market_accept', tradeId:prepared.id};
    const next = createContext(view, ctx.step, action, 'trade');
    next.baseId = ctx.baseId || 'v5-market-pending';
    return prepared.purpose ? marketUse(next) : marketTradeSettlement(next);
  }
  // A supply or assistant check has no transfer to draw yet. Keep the guide's
  // actual waiting reason instead of replacing it with a generic empty scene.
  return null;
}

const BUILDERS = Object.freeze({
  request_coins: requestCoins,
  buy_plot: buyPlot,
  buy_upgrade: buyUpgrade,
  plant: localFarm,
  water: localFarm,
  harvest: localFarm,
  accept_order: acceptOrder,
  deliver_order: deliverOrder,
  enable_pip: localFarm,
  disable_pip: localFarm,
  craft_parts: localFarm,
  accept_rival: localFarm,
  complete_rival: localFarm,
  prestige: localFarm,
  market_fund: ctx => paymentOperation(ctx.view) === 'genesis' ? marketGenesis(ctx) : marketFund(ctx),
  market_buy: ctx => paymentOperation(ctx.view) === 'genesis' ? marketGenesis(ctx) : paymentOperation(ctx.view) === 'restock' ? marketRestock(ctx) : marketTradeSettlement(ctx),
  market_stock: marketStock,
  market_propose: proposal,
  market_counter: proposal,
  market_accept: ctx => { const trade = marketTrade(ctx.view, ctx.action); return trade.purpose ? marketUse({...ctx, action:{...ctx.action, purpose:trade.purpose}}) : marketTradeSettlement(ctx); },
  market_use: marketUse,
  market_assistant: ctx => paymentOperation(ctx.view) === 'genesis' ? marketGenesis(ctx) : marketConfigure(ctx),
  check_market_payment: pendingCheck,
  advanced_continue: advancedScenario,
});

function operationFromEvent(view, event = {}) {
  const advanced = record(view?.advanced), payment = record(view?.payment), plan = record(payment.marketPlan || view?.marketPlan), pending = record(advanced.pending);
  const candidates = [event.operation, event.phase, event.marketOperation, event.kind === 'bundle' && (pending.phase || advanced.visual?.operation), payment.kind === 'market' && plan.operation];
  const normalize = raw => String(raw || '').replace(/^v5-(?:market|advanced)-/, '').replace(/_/g, '-');
  const known = new Set(['ring-genesis', 'ring', 'role-funding', 'delivery-open', 'refund-open', 'delivery-release', 'delivery-refund', 'refund-wait', 'genesis', 'restock', 'fund', 'configure', 'trade']);
  for (const raw of candidates) {
    const value = normalize(raw);
    if (known.has(value)) return value;
    if (value === 'market-use') return 'trade';
  }
  // A material-use receipt may arrive after the payment view has already been
  // cleared. Its purpose is enough to identify the final transfer.
  if (event.purpose || event.action?.purpose || plan.economicReview?.trade?.purpose || plan.economicReview?.use?.purpose) return 'trade';
  return '';
}

function actionOperation(action = {}, step = {}) {
  const type = canonicalType(action, step).type;
  if (['market_buy', 'market_accept', 'market_use', 'market_assistant', 'market_propose', 'market_counter'].includes(type)) return type === 'market_assistant' ? 'configure' : 'trade';
  if (type === 'market_fund') return 'fund';
  if (type !== 'advanced_continue') return '';
  const stage = String(action.stage || step.stage || '');
  return ({'ring-intro':'ring-genesis','ring-ready':'ring','delivery-intro':'delivery-open','refund-intro':'refund-open','delivery-ready':'delivery-release','refund-ready':'delivery-refund','refund-wait':'refund-wait'}[stage] || '');
}

function transactionAction(view, event, operation) {
  const eventAction = record(event?.action), paymentAction = record(view?.payment?.action);
  if (Object.keys(eventAction).length) return eventAction;
  if (Object.keys(paymentAction).length) return paymentAction;
  const trade = record(event?.trade || event?.marketTrade);
  const fields = {};
  for (const key of ['purpose', 'tradeId', 'from', 'to', 'resource', 'amount', 'amountSompi', 'totalSompi', 'nativeAmountSompi', 'unitPriceSompi', 'give', 'want', 'requires', 'goods', 'policy', 'enabled', 'maxGive', 'stage', 'upgradeId', 'orderId']) {
    if (event?.[key] !== undefined) fields[key] = event[key];
  }
  if (trade.id) fields.tradeId = trade.id;
  if (event?.purpose) fields.purpose = event.purpose;
  if (Object.keys(fields).length) {
    const type = fields.purpose ? 'market_use' : operation === 'fund' ? 'market_fund' : operation === 'configure' ? 'market_assistant' : operation === 'trade' ? 'market_accept' : 'check_market_payment';
    return {type, ...fields};
  }
  if (operation === 'ring-genesis' || operation === 'ring') return {type:'advanced_continue', stage:operation === 'ring-genesis' ? 'ring-intro' : 'ring-ready'};
  if (operation === 'role-funding') return {type:'advanced_continue', stage:view?.advanced?.stage || 'delivery-intro'};
  if (operation === 'delivery-open') return {type:'advanced_continue', stage:'delivery-intro'};
  if (operation === 'refund-open') return {type:'advanced_continue', stage:'refund-intro'};
  if (operation === 'delivery-release') return {type:'advanced_continue', stage:'delivery-ready'};
  if (operation === 'delivery-refund') return {type:'advanced_continue', stage:'refund-ready'};
  if (operation === 'refund-wait') return {type:'advanced_continue', stage:'refund-wait'};
  if (operation === 'fund') return {type:'market_fund'};
  if (operation === 'configure') return {type:'market_assistant'};
  if (operation === 'trade') return {type:'market_accept'};
  return {type:'check_market_payment'};
}

function hasScenarioContent(scenario) {
  return Boolean(scenario && ((Array.isArray(scenario.flows) && scenario.flows.length) || (Array.isArray(scenario.actors) && scenario.actors.length)));
}

function hasFlowMetadata(view, event, action) {
  const payment = record(view?.payment), plan = record(payment.marketPlan || view?.marketPlan), review = record(plan.economicReview), trade = record(event?.trade || event?.marketTrade || review.trade);
  return Boolean(
    action?.give || action?.want || action?.requires || action?.goods ||
    (action?.resource !== undefined && action?.amount !== undefined) ||
    event?.give || event?.want || event?.requires || event?.goods || event?.trade || event?.marketTrade ||
    trade.give || trade.want || review.use?.requires || review.use?.recipientId ||
    view?.marketAction || view?.trade || (action?.resource && view?.market?.nativeQuotes?.length)
  );
}

/**
 * Describe the user-facing journey for one V5 story action.
 *
 * `step` may be the object returned by getV5StoryStep (or a raw guide step),
 * while `action` is the concrete action payload when one has already been
 * chosen. Every quantity is copied from that payload, a quote, or the saved
 * view. Missing quantities stay absent from actors and flows.
 */
export function describeV5Experience(view = {}, {step = {}, action = undefined} = {}) {
  const ctx = createContext(view, step, action), builder = BUILDERS[ctx.type];
  if (ctx.type === 'open_freeplay') return null;
  if (!builder) return pendingCheck({...ctx, baseId:`v5-${ctx.type || 'observe'}`});
  const scenario = builder(ctx);
  if (scenario && step.supplyRecoveryDetail && ctx.type === step.action?.type) scenario.problem = step.supplyRecoveryDetail;
  return cloneSerializable(scenario);
}

/**
 * Re-label a scenario when a transaction event identifies a preparatory or
 * final operation. The supplied scenario ID is retained so presentation can
 * keep one journey through genesis, pending, acceptance and acknowledgment.
 * Signature: describeV5Transaction(view, event, scenario) -> scenario.
 */
export function describeV5Transaction(view = {}, event = {}, scenario = null) {
  const base = scenario || describeV5Experience(view, {action:event?.action || view?.payment?.action || {type:'check_market_payment'}}), operation = operationFromEvent(view, event);
  if (!operation) return cloneSerializable(base);
  const sourceAction = transactionAction(view, event, operation);
  // Receipt events can carry the trade but the payment view may already be
  // gone. Feed that saved event into the normal market lookup without
  // mutating the caller's view.
  const transactionView = event?.trade || event?.marketTrade
    ? {...record(view), marketAction:event.trade || event.marketTrade, trade:event.trade || event.marketTrade}
    : view;
  const ctx = createContext(transactionView, {}, sourceAction, operation); ctx.baseId = base?.id || `v5-${operation}`; ctx.event = event;
  let next;
  if (operation === 'genesis') next = marketGenesis(ctx, operation);
  else if (operation === 'restock') next = marketRestock(ctx);
  else if (operation === 'fund') next = marketFund(ctx);
  else if (operation === 'configure') next = marketConfigure(ctx);
  else if (operation === 'trade') {
    const trade = marketTrade(transactionView, sourceAction), purpose = event?.purpose || sourceAction.purpose || trade.purpose;
    next = purpose ? marketUse({...ctx, action:{...ctx.action, purpose}}) : marketTradeSettlement(ctx);
  } else if (operation === 'ring-genesis' || operation === 'ring') next = advancedRing(ctx, operation);
  else if (operation === 'role-funding') next = advancedRoleFunding(ctx);
  else if (operation === 'delivery-open' || operation === 'refund-open') next = advancedEscrowOpen(ctx, operation);
  else if (operation === 'delivery-release' || operation === 'delivery-refund') next = advancedClose(ctx, operation);
  else next = base;
  const sourceOperation = actionOperation(sourceAction);
  const sameUltimate = sourceOperation ? sourceOperation === operation : ['trade', 'fund', 'configure', 'ring', 'delivery-open', 'refund-open', 'delivery-release', 'delivery-refund', 'refund-wait'].includes(operation);
  // A status-only receipt must not erase the concrete route that was already
  // on screen. Preparatory operations always get their own description so a
  // purchase route can never be mistaken for genesis or restock.
  const preparatory = ['genesis', 'restock', 'role-funding', 'ring-genesis'].includes(operation);
  if (!preparatory && sameUltimate && hasScenarioContent(base)) {
    const baseFlows = Array.isArray(base.flows) ? base.flows : [], nextFlows = Array.isArray(next?.flows) ? next.flows : [];
    if (!hasFlowMetadata(transactionView, event, sourceAction) || !nextFlows.length || nextFlows.length < baseFlows.length) return cloneSerializable(base);
  }
  // Preserve the journey identity and any fields the operation-specific view
  // cannot know. The operation copy is authoritative for title/rule/flows.
  return cloneSerializable({...next, id:base?.id || next.id});
}
