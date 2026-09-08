// Keep the existing town renderer and controls. The V5 service supplies its economy.
import {mountV4Game} from './v4-game.mjs';
import {v4StageMarkup} from './v4-showcase-page.mjs';
import {mountV5UI, getV5StoryStep} from './v5-ui.mjs';
import {projectV5Town} from './v5-town-model.mjs';
import {renderV5Advanced} from './v5-advanced-ui.mjs';
import {createV5Presentation} from './v5-presentation.mjs';
import {describeV5Experience, describeV5Transaction} from './v5-experience-scenarios.mjs';
import {renderV5ExperienceScene} from './v5-experience-scene.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hash = value => /^[a-f0-9]{64}$/i.test(String(value || ''));
const kas = value => { try { const n = BigInt(value || 0); return `${n / 100000000n}${n % 100000000n ? '.' + String(n % 100000000n).padStart(8, '0').replace(/0+$/, '') : ''} tKAS`; } catch { return 'Not available'; } };
const places = {agent:'Workshop',market:'Exchange',terrarium:'Habitat',coordination:'Greenhouse',computation:'Observatory'};
const roomPanels = {agent:'assistant',market:'businesses',terrarium:'habitat',coordination:'construction',computation:'orders'};
const actionPanels = {open_orders:'orders',open_market:'market',open_assistant:'assistant',open_stock:'stock',open_market_status:'market_status',open_fund:'fund',open_native_buy:'native_buy',open_habitat:'habitat',open_construction:'construction',open_farm:'farm',open_workshop:'workshop'};

function whyFor(action, step) {
  if (step?.why) return step.why;
  const type = action?.type || '';
  if (['plant','water','harvest','craft_parts','enable_pip','disable_pip'].includes(type)) return 'This action changes the town’s saved game state. Farming and workshop production do not need a coin transaction. Bringing supplies into a business, trading them, and receiving delivery payments have separate accepted transactions.';
  if (['buy_plot','buy_upgrade','accept_order','deliver_order'].includes(type)) return (step?.detail || 'The town prepares and checks the required payment.') + ' Kaspa acceptance proves the test-coin transfer. Plot unlocks, upgrade effects and order completion are saved game rules applied after that payment evidence.';
  if (type === 'market_propose') return 'This step saves an offer. It does not move either party’s supplies. Accepting the terms prepares one transaction that must satisfy both business contracts.';
  const mechanism = type === 'market_assistant' ? 'The business contract records Pip’s remaining resource allowances. Delegated spends must stay inside those limits; revocation changes the contract state so the old permission cannot be reused.'
    : type === 'market_use' ? 'The accepted transaction proves the listed supplies left your business and reached the keeper or builder. The town applies care or construction only after that proof.'
    : type.startsWith('market_') ? 'Business UTXOs hold the current supplies and test coins. The transaction consumes those outputs and creates successors that satisfy the contract’s balance, recipient and signature rules.'
    : step?.detail || 'The town waits for the actual transaction and accepting block before recording a payment.';
  return mechanism + ' Argent expresses the business rules; SilverScript compiles them into Kaspa script. The accepting DAG block proves that the transaction passed those checks.';
}

export function mountV5Town(root, callbacks = {}) {
  if (!root) return null;
  const hadPageClass = document.body.classList.contains('covenant-world-page');
  document.body.classList.add('covenant-world-page');
  root.classList.add('v5-town');
  root.classList.remove('v5-game');
  root.innerHTML = v4StageMarkup().replace('data-public-v4 hidden', 'data-public-v4') + '<div class="v5-game v5-dialog-host" data-v5-dialog-host></div>';
  const shell = root.querySelector('[data-public-v4]');
  const dialogHost = root.querySelector('[data-v5-dialog-host]');
  let view = {}, selected = 'agent', free = false, disposed = false, pending = false, localError = '', lastGuideKey = '', guideTimer = null, guideDelayUntil = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let clockVisible = !document.hidden, clockAt = performance.now(), clockValue = 0;
  const experienceNow = () => { const wall=performance.now();if(clockVisible)clockValue+=Math.max(0,wall-clockAt);clockAt=wall;return clockValue; };
  const presentation = createV5Presentation({now:experienceNow,reducedMotion:() => reduced.matches});
  let presentationTimer = null, lastProjectedView = null, lastDialogsView = null, worldVersion = 0, lastLiveKey = '', observedPlayer = null, savedPresentation = '', presentationKey = '', deferredBefore = null;
  const receiptBaseline = new Set();
  const seenBlocks = new Set(), acceptedTransactions = new Set();
  const connected = () => Boolean(view.wallet?.connected || view.wallet?.address);
  const busy = () => pending || Boolean(view.busy || view.wallet?.busy);
  const resource = id => Number(view.resources?.find(r => r.id === id)?.amount || 0);
  const playerId = () => view.market?.playerId || view.playerId || 'player';
  const businessAmount = () => view.market?.cells?.[playerId()]?.nativeSompi;

  async function invoke(fn, ...args) {
    if (busy() || !fn || disposed) return;
    pending = true; localError = ''; render(view);
    try {
      const p = presentation.snapshot();
      if (p && !p.requestDone && !p.transactions.length && !reduced.matches) {
        const preparation = Math.max(0, 1000 - (experienceNow() - p.startedAt));
        if (preparation) await new Promise(resolve=>setTimeout(resolve,preparation));
      }
      if (!disposed) await fn(...args);
    }
    catch (error) { localError = error.safeMessage || error.message || 'The action could not finish.'; }
    finally { pending = false; presentation.finish(localError || view.error?.message || view.error || ''); if (!disposed) render(view); }
  }
  async function invokePassive(fn, ...args) {
    if (busy() || !fn || disposed) return;
    pending = true; localError = ''; render(view);
    try { if (!disposed) await fn(...args); }
    catch (error) { localError = error.safeMessage || error.message || 'The action could not finish.'; }
    finally { pending = false; if (!disposed) render(view); }
  }
  function beginPanelPresentation(type, payload = {}) {
    if (presentation.snapshot() || type === 'request_coins' || type === 'market_cancel_quote') return false;
    const {actionId, label, disabled, disabledReason, ...fields} = payload;
    const action = {type, ...fields, id: fields.id || actionId || crypto.randomUUID()};
    const {step} = dialogs.getNextStep(), scenario = describeV5Experience(view, {step, action});
    if (!scenario || scenario.mode === 'observe') return false;
    presentation.begin({scenario, before:view, action});
    if (scenario.room && scenario.room !== selected) { selected = scenario.room; game.select(selected); }
    persistPresentation();
    return true;
  }
  async function panelAction(type, payload = {}) {
    const active = presentation.snapshot(), refresh = type === 'check_market_payment', cancelQuote = type === 'market_cancel_quote', cancelReview = cancelQuote && ['review','error'].includes(active?.phase) && view.payment?.kind === 'market' && view.payment.status === 'awaiting-signature';
    // The saved result is a deliberate acknowledgement boundary. Panel actions
    // may not race it; refreshing is read-only and quote cancellation is only
    // valid from the signature-review state.
    if (active && !refresh && !cancelReview) return;
    if (refresh) return invoke(callbacks.onRefresh);
    const beforePayment = cancelQuote ? view.payment : null;
    const beforePaymentId = beforePayment?.id || beforePayment?.transactionId;
    if (cancelQuote && (!beforePaymentId || payload.paymentId && payload.paymentId !== beforePaymentId)) return;
    const started = !active && beginPanelPresentation(type, payload);
    // A service dialog is only a setup surface. Once the action has entered
    // the presentation lifecycle, expose the world and its acknowledgement
    // control so a native dialog cannot cover the result while it settles.
    if (started) dialogs.closePanel?.();
    await invoke(callbacks.onAction, type, payload);
    if (cancelQuote && active && beforePaymentId) {
      const afterPayment = view.payment, afterId = afterPayment?.id || afterPayment?.transactionId;
      const disappeared = !afterPayment || afterPayment.status === 'cancelled' && afterId === beforePaymentId || afterId && afterId !== beforePaymentId;
      if (disappeared) {
        for (const tx of active.transactions) if (hash(tx.acceptingBlock)) receiptBaseline.add(tx.id);
        presentation.clear(); persistPresentation(); lastGuideKey = ''; dialogs.closePanel?.(); render(view);
      }
    }
  }
  const dialogs = mountV5UI(dialogHost, {...callbacks, onAction: panelAction});
  function openPanel(name) { if (!disposed) dialogs.openPanel(name); }
  function primary() {
    if (!connected()) return void invoke(callbacks.onWallet);
    const active = presentation.snapshot();
    if (active) {
      if (active.phase === 'result') {
        for (const r of active.transactions) if (hash(r.acceptingBlock)) receiptBaseline.add(r.id);
        presentation.acknowledge(); persistPresentation(); lastGuideKey = '';
        const stage = view.advanced?.stage;
        if (active.action.type === 'advanced_continue' && ['ring-complete','delivery-complete','refund-complete'].includes(stage)) {
          // This server action only acknowledges the saved result; it cannot spend.
          const id = crypto.randomUUID(); return void invoke(callbacks.onAction,'advanced_continue',{stage,id,actionId:id});
        }
        render(view); return;
      }
      if (active.phase === 'error' && !active.transactions.length && (!view.payment || ['accepted','cancelled'].includes(view.payment.status)) && !view.advanced?.pending && !view.actionHint) {
        presentation.clear();persistPresentation();localError='';render(view);return;
      }
      if (['review','error'].includes(active.phase) || active.phase === 'network' && experienceNow() - active.startedAt > 15000) {
        presentation.retry(); return void invoke(callbacks.onRefresh);
      }
      return;
    }
    const {step, action} = dialogs.getNextStep();
    if (action?.type === 'open_freeplay') { free = true; clearTimeout(guideTimer); guideTimer = null; guideDelayUntil = 0; render(view); return; }
    if (actionPanels[action?.type]) return openPanel(actionPanels[action.type]);
    if (!action?.type) return openPanel(roomPanels[selected]);
    const {type, label, disabled, disabledReason, ...fields} = action;
    if (disabled) return;
    const scenario = describeV5Experience(view, {step, action});
    if (scenario && scenario.mode !== 'observe') {
      presentation.begin({scenario, before:view, action});
      if (scenario.room && scenario.room !== selected) { selected = scenario.room; game.select(selected); }
      persistPresentation();
    }
    if (action.type === 'check_market_payment') return void invoke(callbacks.onRefresh);
    const id = crypto.randomUUID();
    return void invoke(callbacks.onAction, type, {...fields, id, actionId:id});
  }
  function roomAction(action) {
    // The task panel remains the single acknowledgement surface while a
    // presentation is active, including when free play was selected earlier.
    if (presentation.snapshot()) return action ? undefined : primary();
    if (!action) return free && !(view.payment?.kind === 'market' && view.payment.status === 'awaiting-signature') ? openPanel(roomPanels[selected]) : primary();
    if (action === 'service') return openPanel(roomPanels[selected]);
    if (selected === 'agent') return openPanel(action === 'revoke' ? 'fund' : action === 'safe' ? 'pip' : 'assistant');
    if (selected === 'market') return openPanel(action === 'supply' ? 'stock' : action === 'partial' ? 'market' : 'businesses');
    if (selected === 'terrarium') return openPanel(action === 'move' ? 'farm' : action === 'jump' ? 'stock' : 'habitat');
    if (selected === 'coordination') return openPanel(action === 'invite' ? 'farm' : 'construction');
    return openPanel(roomPanels[selected] || 'about');
  }
  const game = mountV4Game(shell, {
    onSelect(kind) { if (presentation.snapshot()) { game.select(selected); return; } selected = kind; free = true; render(view); },
    onService(name) {
      if (name === 'bridge') { location.assign('/wrap'); return; }
      openPanel(({activity:'wallet',argent:'habitat',treasury:'fund',escrow:'wallet',receipt:'wallet',token:'businesses',proof:'orders',prediction:'orders',bridge:'about'})[name] || roomPanels[selected] || 'about');
    },
  });
  const controls = document.createElement('div');
  controls.className = 'v4-testnet-controls';
  controls.innerHTML = '<button data-v4-wallet-menu>Wallet</button><button data-town-panel="businesses">Exchange</button><button data-town-panel="farm">Greenhouse</button><button data-town-panel="assistant">Pip’s trading budget</button><button data-town-panel="pip">Pip’s farm work</button><button data-town-panel="workshop">Make workshop parts</button><button data-town-panel="orders">Town orders</button><button data-town-panel="stock">Bring farm supplies</button><button data-town-panel="fund">Move test coins into business</button><button data-town-guide>Continue your next step</button><button data-town-refresh>Check saved transactions</button><button data-town-restore>Restore wallet</button>';
  game.mountControls(controls);
  const walletButton = shell.querySelector('[data-v4-wallet-menu]');
  walletButton.onclick = () => connected() ? openPanel('wallet') : void invoke(callbacks.onWallet);
  const onControls = event => {
    const b = event.target.closest('button'); if (!b) return;
    if (b.dataset.townPanel) { shell.querySelector('[data-game-menu]').open = false; return openPanel(b.dataset.townPanel); }
    if (b.hasAttribute('data-town-guide')) { shell.querySelector('[data-game-menu]').open = false; free = false; lastGuideKey = ''; render(view); return; }
    if (b.hasAttribute('data-town-refresh')) return void invoke(callbacks.onRefresh);
    if (b.hasAttribute('data-town-restore')) return void invokePassive(callbacks.onRestore);
  };
  controls.addEventListener('click', onControls);
  shell.querySelector('[data-game-reset]').textContent = 'Continue your next step';
  shell.querySelector('[data-game-reset]').onclick = () => { free = false; lastGuideKey = ''; render(view); };
  shell.querySelector('[data-game-about]').onclick = () => openPanel('about');
  shell.querySelector('[data-game-code]').textContent = 'Show the contract';
  shell.querySelector('[data-game-code]').onclick = () => openPanel('contract');
  shell.querySelector('[data-game-technical]').hidden = true;

  function projectWorld(source) {
    if (lastProjectedView === source) return;
    lastProjectedView = source;
    worldVersion++;
    Object.assign(game.getWorld(), projectV5Town(source));
  }
  function persistPresentation() {
    if (!presentationKey) return;
    try {
      const p = presentation.snapshot();
      if (!p) { sessionStorage.removeItem(presentationKey); savedPresentation = ''; return; }
      const record = JSON.stringify({version:1,scenario:p.baseScenario,action:p.action,phase:p.phase,
        baseline:[...receiptBaseline].slice(-180),transactions:p.transactions.map(t=>({id:t.id,operation:t.operation,purpose:t.purpose}))});
      if (record !== savedPresentation) { sessionStorage.setItem(presentationKey, record); savedPresentation = record; }
    } catch {}
  }
  function observePresentation(previous, next) {
    const identity = next.wallet?.address || next.playerId || next.market?.playerId;
    if (!identity) return;
    if (observedPlayer !== identity) {
      observedPlayer = identity; presentation.clear(); receiptBaseline.clear();
      presentationKey = 'sprout-harbor-v5-presentation:' + identity;
      for (const r of next.receipts || []) if (hash(r.acceptingBlock)) receiptBaseline.add(r.id || r.transactionId);
      try {
        const raw = sessionStorage.getItem(presentationKey);
        const saved = raw && raw.length < 100000 ? JSON.parse(raw) : null;
        if (saved?.version === 1 && saved.scenario?.id && saved.action && Array.isArray(saved.baseline)) {
          presentation.begin({scenario:saved.scenario,before:next,action:saved.action,restored:true});
          if (places[saved.scenario.room] && selected !== saved.scenario.room) { selected=saved.scenario.room;game.select(selected); }
          receiptBaseline.clear(); for (const id of saved.baseline) if (hash(id)) receiptBaseline.add(id);
          for (const record of saved.transactions || []) if (hash(record.id)) presentation.transaction({...record,status:'pending'});
        }
      } catch {}
    }
    const fresh = (next.receipts || []).filter(r=>hash(r.acceptingBlock) && !receiptBaseline.has(r.id || r.transactionId));
    if (!presentation.snapshot() && !free && fresh.length && previous.wallet?.connected) {
      const before = deferredBefore || previous, priorStep = getV5StoryStep(before), prior = {step:priorStep,action:priorStep?.action};
      const scenario = describeV5Experience(before, prior);
      if (scenario && scenario.mode !== 'observe') {
        presentation.begin({scenario,before,action:prior.action}); presentation.finish();deferredBefore=null;
        if (places[scenario.room] && selected !== scenario.room) { selected=scenario.room;game.select(selected); }
      }
    }
    for (const receipt of fresh) {
      const event = {...receipt,id:receipt.id || receipt.transactionId,status:'accepted'};
      if (presentation.snapshot()) recordPresentationTransaction(event, next);
      // Keep the baseline at action start until acknowledgement for reload recovery.
      else receiptBaseline.add(event.id);
    }
    const pendingPayment = next.advanced?.pending || next.payment;
    if (presentation.snapshot() && hash(pendingPayment?.transactionId)) {
      recordPresentationTransaction({...pendingPayment,id:pendingPayment.transactionId,
        operation:pendingPayment.operation || next.advanced?.visual?.operation || pendingPayment.marketPlan?.operation}, next);
    }
  }
  function recordPresentationTransaction(event, source = view) {
    const p = presentation.snapshot(); if (!p) return;
    if (p.worldReleased && !p.transactions.some(t=>t.id === event.id)) {
      deferredBefore ||= p.after || p.before; return;
    }
    const exact = describeV5Transaction(source, {...event,action:p.action}, p.baseScenario) || p.baseScenario;
    const changed = presentation.transaction({...event,scenario:exact});
    if (changed && !p.restored) sendTransaction(event, exact);
  }
  function render(next = {}) {
    if (disposed) return;
    const previous = view;
    observePresentation(previous, next || {});
    view = next || {};
    if (lastDialogsView !== view) { dialogs.render(view); lastDialogsView = view; }
    const actual = dialogs.getNextStep();
    const active = presentation.tick({journey:id=>game.getTransactionJourneyState?.(id),
      pending:busy() || Boolean(view.advanced?.pending) || Boolean(view.payment && !['accepted','cancelled'].includes(view.payment.status)),
      signatureRequired:view.payment?.status === 'awaiting-signature', motionActive:Boolean(game.getSceneMotionState?.()?.active || game.getSceneMotionState?.()?.queued?.length)});
    const activeTransaction = active?.phase === 'review' ? null : (active?.worldReleased ? active.transactions.at(-1) : active?.transactions.find(t=>t.status!=='accepted' || game.getTransactionJourneyState?.(t.id)?.phase !== 'settled')) || active?.transactions.at(-1);
    if (active?.phase === 'review') active.scenario = active.baseScenario;
    else if (active && activeTransaction?.scenario) active.scenario = activeTransaction.scenario;
    if (active?.worldReleased && !active.after) active.after = view;
    projectWorld(active ? active.worldReleased ? active.after : active.before : view);
    const {step, action} = active ? {step:{id:active.scenario.id,title:active.scenario.title,detail:active.scenario.problem,why:active.scenario.rule},action:active.action} : actual;
    const signing = view.payment?.kind === 'market' && view.payment.status === 'awaiting-signature';
    const followGuide = !free || signing || Boolean(active);
    const guideKey = `${step?.id || ''}:${action?.type || ''}:${action?.purpose || ''}`;
    let guideDestination = null;
    if (!active && !free && !signing && connected() && guideKey && guideKey !== lastGuideKey) {
      const type = action?.type || '';
      const advancedKind = view.advanced?.visual?.kind || view.advanced?.kind || (String(view.advanced?.stage || '').startsWith('ring-') ? 'ring' : 'delivery');
      const destination = type === 'advanced_continue' ? (advancedKind === 'delivery' ? 'computation' : 'market')
        : action?.purpose === 'feed_habitat' || type === 'open_habitat' ? 'terrarium'
        : ['buy_plot','plant','water','harvest','buy_upgrade','open_farm','open_construction'].includes(type) ? 'coordination'
        : action?.purpose === 'build_workshop' ? 'agent'
        : ['enable_pip','disable_pip','craft_parts','open_assistant','market_mandate','market_assistant','open_workshop'].includes(type) ? 'agent'
        : type === 'market_use' ? 'coordination'
        : ['accept_order','deliver_order','open_orders','open_market','open_stock','open_fund','open_market_status','open_native_buy'].includes(type) || type.startsWith('market_') ? 'market' : null;
      guideDestination = destination;
    }
    const latestReceipt = active ? activeTransaction : null;
    const scenario = active?.scenario || (followGuide && connected() && actual.action?.type !== 'open_freeplay' ? describeV5Experience(view, actual) : null);
    const title = !connected() ? 'What could a KAS economy look like?' : active?.phase === 'result' ? active.scenario.resultTitle : followGuide ? scenario?.title || step?.title || 'Keep the town supplied.' : places[selected];
    const detail = !connected() ? 'Build a greenhouse, put Pip to work, trade supplies and fill town orders. Your town and its controls are here; start with free Testnet coins.' : followGuide ? step?.detail || 'Visit a business, review its needs and choose your next trade.' : ({agent:'Review Pip’s trading budget or move coins into your business.',market:'Meet the businesses, negotiate a trade, or buy supplies with contract-held test coins.',terrarium:'Bring food to the habitat. The keeper receives it through an accepted business transfer.',coordination:'Use market materials to build a workshop or expand your greenhouse.',computation:'Review the town’s funded orders and delivery requirements.'})[selected];
    const live = {
      mode:connected() ? 'economy' : 'welcome', guided:followGuide,
      chapter:connected() ? `${places[selected]} · Sprout Harbor` : 'Start here · Testnet-10',
      title, objective:'', status:localError || view.error?.message || view.error || active?.error || (active?.phase === 'result' ? active.scenario.result : active ? '' : scenario?.problem || detail),
      label:busy() ? view.status || 'Preparing the action…' : active ? ({review:'Sign the reviewed transfer',error:'Check the saved action',result:'Continue',acting:'Watch the action…',submitting:'Following the transaction…',network:activeTransaction?.status==='accepted'?'Accepted · watch the block…':experienceNow()-active.startedAt>15000?'Check network progress':'Waiting for acceptance…',returning:'Watch the result…'})[active.phase] : !connected() ? 'Create my test wallet' : followGuide ? (action?.type === 'open_freeplay' ? 'Play freely' : 'Continue') : ({agent:'Open Pip’s budget',market:'Open the exchange',terrarium:'Care for the habitat',coordination:'Build with supplies',computation:'See town orders'})[selected],
      guideStepId:(step?.id || action?.type || selected) + (active ? ':'+active.phase : ''), pending:busy() || (active ? !['result','review','error'].includes(active.phase) && !(active.phase==='network' && activeTransaction?.status!=='accepted' && experienceNow()-active.startedAt>15000) : Boolean(action?.disabled && followGuide)),
      balances:[String(view.wallet?.balanceSompi || 0), String(businessAmount() || 0), '0'], budget:String(businessAmount() || 0),
      transactionId:hash(latestReceipt?.id || latestReceipt?.transactionId) ? latestReceipt.id || latestReceipt.transactionId : undefined,
      why:scenario?.rule || whyFor(action, step),
      onAction:roomAction, onFree:active ? undefined : () => { free = true; render(view); },
    };
    const liveKey = JSON.stringify([live, worldVersion]);
    if (liveKey !== lastLiveKey) { lastLiveKey = liveKey; game.setLive(live); }
    if (guideDestination) {
      const motion = game.getSceneMotionState?.();
      if (guideDestination !== selected && lastGuideKey && (motion?.active || motion?.queued?.length) && !guideDelayUntil) guideDelayUntil = performance.now() + 3000;
      if (guideDelayUntil > performance.now()) {
        if (!guideTimer) guideTimer = setTimeout(() => { guideTimer = null; render(view); }, Math.max(1, guideDelayUntil - performance.now()));
      } else {
        guideDelayUntil = 0; lastGuideKey = guideKey;
        if (guideDestination !== selected) { selected = guideDestination; game.select(selected); render(view); return; }
      }
    }
    let advancedHost = shell.querySelector('[data-town-advanced]');
    if (!advancedHost) { advancedHost = document.createElement('div'); advancedHost.dataset.townAdvanced = ''; shell.querySelector('[data-game-continue]').before(advancedHost); }
    const showAdvanced = !scenario && action?.type !== 'open_freeplay' && ((!free && String(step?.id || '').startsWith('advanced')) || Boolean(view.advanced?.pending));
    const advancedHTML = showAdvanced ? renderV5Advanced(view.advanced?.visual || view.advanced || {}, {explain:false}) : '';
    if (advancedHost.innerHTML !== advancedHTML) advancedHost.innerHTML = advancedHTML;
    advancedHost.hidden = !advancedHTML;
    let sceneHost = shell.querySelector('[data-town-experience]');
    if (!sceneHost) { sceneHost = document.createElement('div'); sceneHost.dataset.townExperience = ''; shell.querySelector('[data-game-continue]').before(sceneHost); }
    const sceneHTML = scenario ? renderV5ExperienceScene({scenario,phase:active?.phase === 'review' ? 'problem' : active?.phase === 'error' ? (activeTransaction ? 'network' : 'problem') : active?.phase || 'problem',transaction:activeTransaction,progress:game.getTransactionJourneyState?.(activeTransaction?.id)?.progress || 0}) : '';
    // Phase changes start an animation once. Polls do not restart it.
    const sceneKey = JSON.stringify([scenario,active?.phase,activeTransaction?.id,activeTransaction?.status,activeTransaction?.acceptingBlock]);
    if (sceneHost.dataset.key !== sceneKey) { sceneHost.innerHTML = sceneHTML; sceneHost.dataset.key = sceneKey; }
    sceneHost.hidden = !sceneHTML;
    let reviewHost = shell.querySelector('[data-town-signature-review]');
    if (!reviewHost) { reviewHost = document.createElement('div'); reviewHost.dataset.townSignatureReview = ''; sceneHost.after(reviewHost); }
    if (active?.phase === 'review') {
      sceneHost.before(reviewHost);
      const payment = view.payment, plan = payment?.marketPlan, funding = plan?.operation === 'fund', amount = plan?.economicReview?.fundAmountSompi,
        fee = payment?.feeSompi ?? payment?.marketPlan?.feeSompi,
        quoted = funding && /^\d+$/.test(String(amount)) && /^\d+$/.test(String(fee)),
        feeLabel = funding ? 'Network fee from your wallet' : plan?.economicReview?.feePayer && plan.economicReview.feePayer === plan.issuer ? 'Network fee paid by town treasury' : 'Network fee';
      reviewHost.innerHTML = `<div class="v5-signature-review"><strong>Review before signing</strong>${funding ? `<p>Wallet → your business: <b>${amount == null ? 'See the saved quote' : esc(kas(amount))}</b></p>` : '<p>Your wallet signs the transfer shown below.</p>'}<p>${feeLabel}: <b>${fee == null ? 'Not yet available' : esc(kas(fee))}</b></p>${quoted ? `<p>Total from wallet: <b>${esc(kas(BigInt(amount)+BigInt(fee)))}</b></p>` : ''}<small>Your wallet checks the saved amount and destinations before signing.</small>${payment?.quoteCancellable ? '<button type="button" data-town-cancel-quote>Cancel quote</button>' : ''}</div>`;
      const cancel = reviewHost.querySelector('[data-town-cancel-quote]');
      if (cancel) { cancel.disabled = busy(); cancel.onclick = () => void panelAction('market_cancel_quote',{paymentId:payment.id}); }
      reviewHost.hidden = false;
    } else { sceneHost.after(reviewHost); reviewHost.hidden = true; reviewHost.replaceChildren(); }
    if (shell.dataset.experiencePhase !== (active?.phase || 'problem') && ['review','result'].includes(active?.phase)) shell.querySelector('.v4-story').scrollTop = 0;
    shell.dataset.experiencePhase = active?.phase || 'problem';
    persistPresentation();
    if (active && active.phase !== 'result' && !presentationTimer) presentationTimer = setTimeout(()=>{presentationTimer=null;if(!disposed)render(view);},125);
    const stats = shell.querySelector('[data-game-stats]');
    controls.querySelector('[data-town-panel="workshop"]').hidden = !Number(view.state?.upgrades?.workshop ?? view.upgrades?.find?.(item=>item.id==='workshop')?.level ?? 0);
    stats.innerHTML = connected() ? `<span>Wallet <b>${esc(kas(view.wallet?.balanceSompi))}</b></span><span>Business <b>${businessAmount() === undefined ? 'Not opened' : esc(kas(businessAmount()))}</b></span><span>Farm crops <b>${resource('crops')}</b></span>` : '<span>Free Testnet coins · no real money</span>';
    walletButton.textContent = connected() ? 'Wallet · ' + kas(view.wallet?.balanceSompi) : 'Create test wallet';
    for (const block of view.network?.blocks || []) {
      if (!hash(block.hash) || seenBlocks.has(block.hash)) continue;
      seenBlocks.add(block.hash);
      game.updateDag({...block,parents:(block.parents || []).filter(hash),source:block.source || 'poll'});
    }
    while (seenBlocks.size > 160) seenBlocks.delete(seenBlocks.values().next().value);
  }
  function sendTransaction(event = {}, scenario) {
    if (disposed || !hash(event.id)) return;
    let tx = null;
    try { if (view.payment?.transactionId === event.id) tx = JSON.parse(view.payment?.marketPlan?.wire?.transaction || 'null'); } catch {}
    const accepted = event.status === 'accepted' && hash(event.acceptingBlock);
    if (!accepted && acceptedTransactions.has(event.id)) return;
    if (accepted) { acceptedTransactions.add(event.id); while (acceptedTransactions.size > 160) acceptedTransactions.delete(acceptedTransactions.values().next().value); }
    const kind = scenario?.room || (places[event.kind] ? event.kind : selected);
    game.transaction({...event,status:accepted ? 'accepted' : 'pending',acceptingBlock:accepted ? event.acceptingBlock : undefined,kind,
      inputCount:event.inputCount ?? tx?.inputs?.length ?? 'unreported', outputCount:event.outputCount ?? tx?.outputs?.length ?? 'unreported',
      covenantCount:event.covenantCount ?? (tx ? view.payment?.marketPlan?.wire?.inputStates?.filter(Boolean).length : undefined) ?? 'unreported',
      presentation:'v5',originLabel:scenario?.actors?.[0]?.name,recipientLabel:scenario?.actors?.at(-1)?.name,
      originAccount:event.originAccount,recipientAccount:event.recipientAccount,
    });
  }
  function transaction(event = {}) {
    if (presentation.snapshot()) { recordPresentationTransaction(event); render(view); }
    else sendTransaction(event);
  }
  const onVisibility = () => { experienceNow(); clockVisible = !document.hidden; if(clockVisible && !disposed) render(view); };
  document.addEventListener('visibilitychange',onVisibility);
  render({});
  return {render,transaction,openPanel,game,getPresentationState:()=>presentation.snapshot(),destroy() { disposed = true; clearTimeout(guideTimer);clearTimeout(presentationTimer);document.removeEventListener('visibilitychange',onVisibility); game.setPlaying(false); game.destroy?.(); dialogs.destroy(); controls.removeEventListener('click',onControls); root.replaceChildren(); if (!hadPageClass) document.body.classList.remove('covenant-world-page'); }};
}
