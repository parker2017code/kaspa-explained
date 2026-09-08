import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const origin = process.env.V5_SOURCE_ORIGIN || 'http://127.0.0.1:8977';
const id = 'c'.repeat(64);
const block = 'd'.repeat(64);
const genesisId = 'e'.repeat(64);
const genesisBlock = 'f'.repeat(64);

const base = () => ({
  playerId: 'callback-qa',
  wallet: {connected: true, address: 'callback-qa-wallet', balanceSompi: '1000000000'},
  revision: 1,
  state: {revision: 1, upgrades: {plots: 1}, resources: {crops: 0, water: 3}, statistics: {}},
  resources: [{id: 'crops', amount: 0, capacity: 12}, {id: 'water', amount: 3, capacity: 12}],
  plots: {count: 1, planted: 0, readyCrops: 0},
  upgrades: [{id: 'plots', level: 1}],
  market: {
    playerId: 'callback-qa',
    actors: {'callback-qa': {name: 'You', inventory: {crops: 0}}, mira: {name: 'Mira', inventory: {crops: 12}}},
    cells: {'callback-qa': {nativeSompi: '0'}},
    nativeQuotes: [{actorId: 'mira', resource: 'crops', available: 12, unitPriceSompi: '2000000'}],
  },
  receipts: [],
  guide: {step: {id: 'business-fund', title: 'Put test coins into your business', detail: 'Move a little test KAS into the business.', action: {type: 'open_fund'}}},
});
const fixture = base();

const browser = await chromium.launch({headless: true, args: ['--enable-unsafe-swiftshader']});
try {
  const context = await browser.newContext({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/');
  await page.setContent('<link rel="stylesheet" href="/src/app.css"><link rel="stylesheet" href="/src/v4-game.css"><link rel="stylesheet" href="/src/v4-showcase.css"><link rel="stylesheet" href="/src/v5.css"><link rel="stylesheet" href="/src/v5-experience.css"><main><div id="app"></div></main>');
  await page.evaluate(async ({id, block, fixture}) => {
    const {mountV5Town} = await import('/src/v5-town.mjs');
    window.id = id; window.block = block; window.genesisId = `eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`; window.genesisBlock = `ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff`; window.calls = [];
    window.__base = fixture;
    window.next = null;
    window.ui = null;
    window.mount = callbacks => { window.ui?.destroy(); window.ui = mountV5Town(document.querySelector('#app'), callbacks); window.ui.render(window.next); };
  }, {id, block, fixture});

  // Guided market funding reaches signature review, then cancellation clears
  // only after the callback returns an authoritative payment-free snapshot.
  await page.evaluate(() => {
    next = structuredClone(window.__base);
    mount({
      onAction: async (type, payload) => {
        calls.push({type, payload});
        if (type === 'market_fund') {
          next = {...structuredClone(next), receipts: [{id: window.genesisId, transactionId: window.genesisId, kind: 'market', operation: 'genesis', status: 'accepted', acceptingBlock: window.genesisBlock, at: 1}], payment: {kind: 'market', id: window.id, status: 'awaiting-signature', quoteCancellable: true, marketPlan: {operation: 'fund', economicReview: {fundAmountSompi: '25000000'}, feeSompi: '100000'}}};
          ui.render(next);
        } else if (type === 'market_cancel_quote') {
          next = structuredClone(next); delete next.payment; next.revision++; ui.render(next);
        }
      },
      onRefresh: async () => {},
    });
  });
  await page.waitForFunction(() => ui.game.getCameraState());
  await page.locator('[data-game-continue]').click();
  await page.waitForFunction(() => ui.getPresentationState()?.phase === 'review').catch(async error => {
    console.log(JSON.stringify(await page.evaluate(() => ({calls, presentation: ui.getPresentationState(), next, guide: document.querySelector('[data-game-title]')?.textContent, error: document.querySelector('[data-game-message]')?.textContent}))));
    throw error;
  });
  await page.evaluate(() => ui.openPanel('fund'));
  await page.waitForFunction(() => document.querySelector('[data-v5-dialog][open] [data-v5-action="market_cancel_quote"]'));
  await page.locator('[data-v5-action="market_cancel_quote"]:visible').click();
  await page.waitForFunction(() => !ui.getPresentationState());
  assert.equal(await page.evaluate(() => calls.filter(call => call.type === 'market_cancel_quote').length), 1);
  await page.waitForTimeout(3100);
  assert.equal(await page.evaluate(() => ui.getPresentationState()), null, 'Accepted genesis is baselined after cancellation; no replay starts');
  assert.equal(await page.locator('[data-game-continue]').isDisabled(), false, 'Continue is usable after authoritative cancellation');
  const cancelCase = {acceptedGenesisBeforeAwaitingSignature: true, cancelClearsAfterAuthoritativeSnapshot: true, noGenesisReplayFor3s: true, continueEnabledAfterCancel: true};

  // A panel action in free play starts its own presentation and closes the
  // dialog. Its local result Continue only acknowledges; it never resends.
  await page.evaluate(() => {
    sessionStorage.clear();
    next = structuredClone(window.__base);
    next.guide = {step: {id: 'open-freeplay', title: 'Play freely', detail: 'Choose what to do next.', action: {type: 'open_freeplay'}}};
    calls = [];
    mount({onAction: async type => {
      calls.push({type});
      next = structuredClone(next); next.plots = {...next.plots, planted: 1}; next.state.production = {planted: true}; next.revision++; ui.render(next);
    }});
  });
  await page.locator('[data-game-explore]').click();
  await page.evaluate(() => ui.openPanel('farm'));
  await page.waitForFunction(() => document.querySelector('[data-v5-dialog][open]'));
  await page.locator('[data-v5-action="plant"]').click();
  await page.waitForFunction(() => !document.querySelector('[data-v5-dialog][open]') && ui.getPresentationState());
  await page.waitForFunction(() => ui.getPresentationState()?.phase === 'result', null, {timeout: 5000});
  assert.equal(await page.evaluate(() => calls.length), 1);
  await page.locator('[data-game-continue]').click();
  await page.waitForFunction(() => !ui.getPresentationState());
  assert.equal(await page.evaluate(() => calls.length), 1, 'Result acknowledgement does not resend panel action');
  const freeplayCase = {panelStartsPresentation: true, panelDialogCloses: true, acknowledgementSendsNothing: true};

  // Host-side failures arrive as a rendered error after the callback catches
  // them. The presentation must leave submitting and expose recovery.
  await page.evaluate(() => {
    sessionStorage.clear();
    next = structuredClone(window.__base);
    next.guide = {step: {id: 'open-freeplay', title: 'Play freely', detail: 'Choose what to do next.', action: {type: 'open_freeplay'}}};
    calls = [];
    mount({onAction: async type => { calls.push({type}); next = {...structuredClone(next), error: 'Cannot complete this action.'}; ui.render(next); }});
  });
  await page.locator('[data-game-explore]').click();
  await page.evaluate(() => ui.openPanel('farm'));
  await page.locator('[data-v5-action="plant"]').click();
  await page.waitForFunction(() => ui.getPresentationState()?.phase === 'error');
  assert.equal(await page.evaluate(() => ui.getPresentationState()?.phase), 'error');
  assert.equal(await page.evaluate(() => ui.getPresentationState()?.phase === 'submitting'), false, 'Rendered host error does not remain submitting');
  const errorCase = {renderedHostErrorLeavesSubmitting: true, phase: 'error'};

  assert.deepEqual(errors, []);
  console.log(JSON.stringify({cancelCase, freeplayCase, errorCase}));
  await context.close();
} finally {
  await browser.close();
}
