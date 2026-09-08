import { chromium, firefox, webkit } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// UI/controller recovery regression only. Every V6 API request is intercepted;
// these snapshots are synthetic and are never evidence of contract execution.
const origin = new URL(process.env.V6_QA_URL || 'http://127.0.0.1:8915/covenants-v6');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname)) throw Error('V6 QA requires a loopback URL.');
const output = resolve(process.env.V6_BROWSER_QA_OUTPUT || '.cache/v6-qa/browser');
await mkdir(output, { recursive: true });
const requested = process.argv.includes('--engine') ? process.argv[process.argv.indexOf('--engine') + 1].split(',') : ['chromium', 'firefox', 'webkit'];
const engines = { chromium, firefox, webkit };
const hash = name => createHash('sha256').update(`v6-synthetic-browser:${name}`).digest('hex');
const copy = value => JSON.parse(JSON.stringify(value));
const report = {
  scope: 'Synthetic API responses exercising the actual built V6 controller, UI and Three.js renderer. No real Start/action/status POST reaches the host. SSE blocks are synthetic. Not protocol or node-acceptance evidence.',
  instrumentation: 'A transparent response-only wrapper exposes the existing world inspect() method. No repository app source is edited.',
  buildFingerprints: Object.fromEntries(await Promise.all(['v6-app.mjs','v6-ui.mjs','v6-world.mjs','v6-progress.mjs'].map(async file => [file, createHash('sha256').update(await readFile(resolve('dist/assets',file))).digest('hex')]))),
  url: origin.href, startedAt: new Date().toISOString(), engines: {},
};

function fixture() {
  const calls = [], actions = new Set(), expectedFailures = new WeakSet();
  let session = null, startFailed = false, purchaseFailed = false, failStatus = false;
  const receipt = (operation, key) => ({operation, kind: operation, phase: 'accepted', title: operation, transactionId: hash(key), acceptingBlock: hash('accepting-block'), feeSompi: '10000'});
  function accepted(operation, key, stage, chapter, result) {
    const record = receipt(operation, key);
    session = {...session, revision: session.revision + 1, chapter, stage, pending: null, operation: record, receipts: [...session.receipts, record], scene: {...session.scene, result: {...session.scene.result, ...result}}};
  }
  return {
    calls, expectedFailures, retryable(){session={...session,revision:session.revision+1,pending:{...session.pending,retryable:true,attempts:2}};}, get session() { return session; }, get failStatus() { return failStatus; }, set failStatus(value) { failStatus = value; },
    acceptPurchase() {
      accepted('purchase', 'purchase', 'purchase-complete', 0, {toolReceived: true});
      session.inventory = {buyer: {tools: 1, coinSompi: '14000000'}, seller: {tools: 0, coinSompi: '6000000'}};
      session.result = {title: 'The tool arrived', detail: 'Synthetic accepted purchase fixture.', deltas: [{label: 'Your tools', before: 0, after: 1}]};
    },
    async route(route) {
      const request = route.request(), path = new URL(request.url()).pathname.split('/').at(-1);
      if (request.method() === 'GET' && path === 'events') {
        const now = Date.now();
        const blocks = Array.from({length: 12}, (_, index) => ({hash: index === 11 ? hash('accepting-block') : hash(`block-${index}`), parents: index ? [hash(`block-${index - 1}`)] : [], observedAt: now - (11 - index) * 100, daaScore: 1000 + index}));
        return route.fulfill({status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify({network: 'testnet-10', status: 'live', lastEventAt: now, blocks})}\n\n`});
      }
      if (request.method() !== 'POST' || !['start', 'action', 'status'].includes(path)) return route.fulfill({status: 400, json: {error: 'Unexpected synthetic QA API route.'}});
      const body = request.postDataJSON();
      calls.push({path, body: copy(body), stageBefore: session?.stage, pendingBefore: Boolean(session?.pending), at: Date.now()});
      if (path === 'start') {
        if (!session) session = {id: body.id, revision: 1, chapter: 0, stage: 'purchase-ready', pending: null, operation: null, receipts: [], completed: [], scene: {result: {toolReceived: false}}, inventory: {buyer: {tools: 0, coinSompi: '20000000'}, seller: {tools: 1, coinSompi: '0'}}};
        if (!startFailed) { startFailed = true; expectedFailures.add(request); return route.abort('failed'); }
      } else if (path === 'status') {
        if (failStatus) { expectedFailures.add(request); return route.abort('failed'); }
      } else if (!actions.has(body.requestId)) {
        actions.add(body.requestId);
        if (body.action === 'purchase') {
          session = {...session, revision: session.revision + 1, pending: {kind: 'purchase', transactionId: hash('purchase')}, operation: {operation: 'purchase', phase: 'submitted', transactionId: hash('purchase')}};
          if (!purchaseFailed) { purchaseFailed = true; expectedFailures.add(request); return route.abort('failed'); }
        } else if (session.pending) {
          // Return the pending record so the remaining checks can run, but the
          // caller records this as an unsafe new action while reconciling.
        } else if (body.action === 'continue' && session.stage === 'purchase-complete') {
          session = {...session, revision: session.revision + 1, chapter: 1, stage: 'pip-ready', completed: [0], result: null};
        } else if (body.action === 'configure' && session.stage === 'pip-ready') {
          accepted('pip-configure', 'pip-configure', 'pip-permitted', 1, {pip: {allowanceCrops: 2, receivedWood: 0, revoked: false}});
        } else if (body.action === 'resume' && session.stage === 'pip-permitted') {
          accepted('pip-trade', 'pip-trade', 'pip-traded', 1, {pip: {allowanceCrops: 0, receivedWood: 1, revoked: false}});
        } else if (body.action === 'pip_attack' && session.stage === 'pip-traded') {
          session = {...session, revision: session.revision + 1, stage: 'pip-blocked', attackEvidence: [{id: 'synthetic-pip-rejection', chapter: 1, stage: 'pip-blocked', rule: 'Crop allowance exceeded', summary: 'Synthetic VM rejection fixture', vm: {engine: 'Kaspa TxScriptEngine', valid: false}}]};
        } else return route.fulfill({status: 400, json: {error: `Unexpected fixture action ${body.action} at ${session.stage}`}});
      }
      return route.fulfill({status: 200, json: {session: copy(session)}});
    },
  };
}


async function checkSavedQueue(browser, check) {
  for (const failFirst of [false, true]) {
    console.log(`Queue case ${failFirst ? "retry" : "success"} starting`);
    const context = await browser.newContext({reducedMotion:'reduce'});
    const id='12345678-1234-1234-1234-123456789012', capability='a'.repeat(64);
    let session={id,revision:1,chapter:0,stage:'purchase-ready',pending:null,intent:{id:'stable-setup',index:1,total:2},receipts:[],completed:[],scene:{result:{}}};
    const actions=[];
    await context.addInitScript(value=>localStorage.setItem('kaspa-v6-local-session-v1',JSON.stringify(value)),{id,capability,inflight:null,snapshot:session});
    await context.route('**/api/v6/**',async route=>{
      const request=route.request(),path=new URL(request.url()).pathname.split('/').at(-1);
      if(path==='events')return route.fulfill({status:200,contentType:'text/event-stream',body:'data: {"network":"testnet-10","status":"live","blocks":[]}\n\n'});
      if(path==='action'){
        actions.push(request.postDataJSON());
        if(failFirst&&actions.length===1)return route.fulfill({status:500,json:{error:'Synthetic uncertain queue response'}});
        session={...session,revision:session.revision+1,intent:null};
      }else if(path!=='status')throw Error('Unexpected recovery API '+path);
      return route.fulfill({json:{session}});
    });
    const page=await context.newPage();
    try{
      await page.goto(origin.href);
      await page.waitForFunction(()=>JSON.parse(localStorage.getItem('kaspa-v6-local-session-v1'))?.snapshot);
      for(let attempt=0;attempt<100&&actions.length===0;attempt++)await page.waitForTimeout(100);
      await page.waitForFunction(() => document.querySelector('.v6-shell')?.dataset.v6Busy === 'false');
      const expected={id,capability,requestId:'resume:stable-setup:1',action:'resume',payload:{intentId:'stable-setup',intentIndex:1}};
      check(actions.length===1&&JSON.stringify(actions[0])===JSON.stringify(expected),`${failFirst?'Failed':'Successful'} saved queue resumes its exact identified step`);
      if(failFirst){
        const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('kaspa-v6-local-session-v1')));
        check(JSON.stringify(saved.inflight?.body)===JSON.stringify(expected),'HTTP 500 preserves the exact saved queue request');
        await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
        await page.waitForTimeout(700);
        check(actions.length===1,'Failed queue stays paused through status reconciliation');
        await page.locator('.v6-action-footer [data-v6-action]').first().click();
        await page.waitForTimeout(700);
        check(actions.length===2&&JSON.stringify(actions[1])===JSON.stringify(expected),'Manual queue retry uses the identical persisted body');
      }
      await page.waitForTimeout(500);
      check(actions.length===(failFirst?2:1),'Completed setup queue does not authorize the next lesson action');
    }finally{await context.close();}
  }
}

for (const name of requested) {
  const engine = engines[name];
  if (!engine) throw Error(`Unknown engine ${name}`);
  const result = report.engines[name] = {findings: [], checks: [], pageErrors: [], failedRequests: [], screenshots: [], renderer: 'not checked'};
  const check = (condition, description) => { console.log(`${name}: ${condition ? 'PASS' : 'FAIL'} ${description}`); (condition ? result.checks : result.findings).push(description); return condition; };
  if (!existsSync(engine.executablePath())) { result.unavailable = 'Browser executable is not installed'; continue; }
  let browser;
  try {
    browser = await engine.launch({headless: true, ...(name === 'chromium' ? {args: ['--enable-unsafe-swiftshader']} : {})});
    await checkSavedQueue(browser, check);
    console.log(`${name}: saved queue cases complete`);
    await browser.close();
    browser = await engine.launch({headless:true,...(name === 'chromium' ? {args:['--enable-unsafe-swiftshader']} : {})});
    const context = await browser.newContext({viewport: {width: 1440, height: 900}, hasTouch: true});
    const servedFiles = ['v6-app.mjs', 'v6-ui.mjs', 'v6-world.mjs', 'v6-world-assets.mjs', 'v6.css', 'v6-progress.mjs'];
    const servedFingerprints = async () => Object.fromEntries(await Promise.all(servedFiles.map(async file => {const response = await context.request.get(new URL('/assets/' + file, origin).href);return [file, createHash('sha256').update(await response.body()).digest('hex')];})));
    result.servedFingerprints = await servedFingerprints();
    const server = fixture();
    await context.route('**/api/v6/**', route => server.route(route));
    await context.route('**/assets/v6-world.mjs', async route => {
      const response = await route.fetch();
      const source = (await response.text()).replace('export async function mountV6World(', 'async function originalMountV6World(');
      await route.fulfill({response, body: source + '\nexport async function mountV6World(...args){const world=await originalMountV6World(...args);window.__v6QaWorld=world;return world;}\n'});
    });
    const page = await context.newPage();
    let navigating = false;
    page.on('pageerror', error => result.pageErrors.push(error.message));
    page.on('requestfailed', request => result.failedRequests.push({at:Date.now(), startedAt:request.timing().startTime, pageURL:page.url(), path: new URL(request.url()).pathname, reason: request.failure()?.errorText, intentionalApiFailure: server.expectedFailures.has(request), navigationCancellation: navigating && /ABORT|CANCEL/i.test(request.failure()?.errorText || '')}));
    page.setDefaultTimeout(15000);
    await page.goto(origin.href);
    await page.waitForFunction(() => window.__v6QaWorld || document.body.textContent.includes('The 3D harbor could not load'), null, {timeout: 30000});
    result.renderer = await page.evaluate(() => window.__v6QaWorld ? 'Three.js active' : 'WebGL/load fallback');
    if (result.renderer !== 'Three.js active') console.log(`${name}: renderer unavailable; checking the readable fallback and controller.`);
    const rendererSettled = () => page.waitForFunction(() => window.__v6QaWorld || document.body.textContent.includes('The 3D harbor could not load'), null, {timeout: 30000});
    const reloadAndSettle = async () => {navigating = true;try {await page.reload();await rendererSettled();} finally {navigating = false;}};
    const world = () => page.evaluate(() => window.__v6QaWorld?.inspect() || null);
    const idle = () => page.waitForFunction(() => document.querySelector('.v6-shell')?.dataset.v6Busy === 'false');
    const primary = () => page.locator('.v6-action-footer [data-v6-action]').first();
    const triggerStatus = () => page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    const shot = async label => { console.log(`${name}: capture ${label}`); await page.evaluate(() => new Promise(resolve => {setTimeout(resolve, 1000);requestAnimationFrame(() => requestAnimationFrame(resolve));})); await page.waitForTimeout(200); const path = `${output}/${name}-${label}.png`; await page.screenshot({path}); result.screenshots.push(path); (result.canvasSnapshots ||= []).push({label, ...await page.evaluate(() => {const c=document.querySelector('canvas');return c?{width:c.width,height:c.height,rect:c.getBoundingClientRect().toJSON(),style:getComputedStyle(c).display,contextLost:c.getContext('webgl2')?.isContextLost()}:{};})}); };
    const credential = () => page.evaluate(() => JSON.parse(localStorage.getItem('kaspa-v6-local-session-v1')));
    const layout = async label => {
      const values = await page.evaluate(() => {
        const action = document.querySelector('.v6-action-footer button').getBoundingClientRect();
        const guide = document.querySelector('.v6-info-scroll');
        const dag = document.querySelector('[data-v6-dag-host]').getBoundingClientRect();
        return {action: {left: action.left, right: action.right, bottom: action.bottom, height: action.height}, width: innerWidth, height: innerHeight, pageWidth: document.documentElement.scrollWidth, pageHeight: document.documentElement.scrollHeight, guideWidth: guide.clientWidth, guideScrollWidth: guide.scrollWidth, dagRight: dag.right};
      });
      check(values.action.bottom <= values.height + 1 && values.action.right <= values.width + 1 && values.action.left >= -1, `${label}: primary action remains in viewport`);
      check(values.pageWidth <= values.width && values.pageHeight <= values.height + 1 && values.guideScrollWidth <= values.guideWidth + 1 && values.dagRight <= values.width + 1, `${label}: no page or internal horizontal clipping`);
      result.layouts ||= {}; result.layouts[label] = values;
    };
    await primary().focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => Boolean(document.querySelector('.v6-error')));
    await idle();
    const firstStart = await credential();
    check(firstStart?.inflight?.path === 'start', 'Uncertain Start persists its exact intent');
    await primary().click();
    await idle();
    await page.getByRole('button', {name: 'Buy the tool atomically', exact: true}).waitFor();
    const starts = server.calls.filter(call => call.path === 'start');
    check(starts.length === 2 && JSON.stringify(starts[0].body) === JSON.stringify(starts[1].body), 'Start retry preserves ID and capability after synthetic server acceptance');
    await primary().click();
    await page.waitForFunction(() => Boolean(document.querySelector('.v6-error')));
    await idle();
    const uncertainAction = await credential();
    await primary().click();
    await idle();
    const actionCount = server.calls.filter(call => call.path === 'action').length;
    await reloadAndSettle();
    await page.getByRole('button', {name: 'Check the saved transaction', exact: true}).waitFor();
    await page.waitForFunction(() => window.__v6QaWorld || document.body.textContent.includes('The 3D harbor could not load'));
    check(server.calls.filter(call => call.path === 'action').length === actionCount, 'Reload with an uncertain purchase performs status reconciliation without an automatic action POST');
    if (await world()) check((await world()).toolInCart === false, 'Submitted/pending purchase has no destination tool');
    await primary().click();
    await idle();
    const purchases = server.calls.filter(call => call.path === 'action' && call.body.action === 'purchase');
    check(purchases.length >= 2 && purchases.every(call => call.body.requestId === uncertainAction.inflight.body.requestId), 'Action retry reuses the saved requestId');
    await primary().click();
    await idle();
    const newPendingActions = server.calls.filter(call => call.path === 'action' && call.pendingBefore && call.body.requestId !== uncertainAction.inflight.body.requestId);
    check(newPendingActions.length === 0, 'Pending status control must not create a new action authorization');
    server.retryable();
    await triggerStatus();
    await page.getByRole('button',{name:'Retry the saved submission',exact:true}).waitFor();
    await page.getByRole('button',{name:'Retry the saved submission',exact:true}).click();
    await idle();
    const retry=server.calls.filter(call=>call.path==='action').at(-1)?.body;
    check(retry?.action==='resume'&&retry?.requestId===`retry:${hash('purchase')}:2`&&!('payload' in retry),'Explicit saved-submission retry uses the stable transaction attempt ID without payload');
    await page.evaluate(() => { window.__qaDagNode = document.querySelector('[data-v6-dag-host]'); window.__qaDagSvg = window.__qaDagNode.querySelector('svg'); });
    server.acceptPurchase();
    await triggerStatus();
    await page.locator('[data-v6-receipt-phase="accepted"]').waitFor();
    if (await world()) check(!(await world()).toolInCart && !(await world()).activeMotion, 'Real world waits for DAG arrival before starting the accepted handoff');
    check(await primary().isDisabled(), 'Continue stays disabled during acceptance presentation');
    await page.waitForTimeout(1600);
    if (await world()) check((await world()).activeMotion && !(await world()).toolInCart, 'Real 3D handoff starts after DAG arrival');
    check(await primary().isDisabled(), 'Continue stays disabled while the real 3D handoff runs');
    await page.waitForTimeout(3000);
    await idle();
    check((await page.locator('.v6-receipt-facts').textContent()).includes(hash('accepting-block').slice(0, 10)), 'Observed accepting block is visible in the receipt');
    if (await world()) check((await world()).toolInCart && !(await world()).activeMotion, 'Accepted purchase has one persistent destination tool after its bounded handoff');
    const acceptedEvents = (await world())?.seenEvents;
    await triggerStatus(); await page.waitForTimeout(150);
    await triggerStatus(); await page.waitForTimeout(150);
    check(await page.evaluate(() => window.__qaDagNode === document.querySelector('[data-v6-dag-host]') && window.__qaDagSvg === document.querySelector('[data-v6-dag-host] svg')), 'DAG host and SVG identity survive controller updates');
    if (await world()) check((await world()).seenEvents === acceptedEvents && !(await world()).activeMotion, 'Repeated acceptance does not replay destination motion');
    check(await page.locator('[data-v6-scene] canvas').count() === (result.renderer === 'Three.js active' ? 1 : 0), 'Renderer is not duplicated');
    await shot('synthetic-purchase');
    await primary().click(); await idle();
    await page.getByRole('button', {name: 'Give Pip this one job', exact: true}).waitFor();
    check((await page.locator('[data-v6-info]').textContent()).includes('at most two crops'), 'Pip presentation describes the actual resource allowance');
    await primary().click(); await page.waitForTimeout(4600); await idle();
    await page.getByRole('button', {name: 'Let Pip complete the barter', exact: true}).waitFor();
    await primary().click(); await page.waitForTimeout(4600); await idle();
    const beforeInspection = server.calls.filter(call => call.path === 'action').length;
    const building = result.renderer === 'Three.js active' ? page.locator('[data-v6-scene]').getByRole('button', {name: 'Greenhouse', exact: true}) : page.locator('button[data-v6-chapter="3"]');
    await building.focus(); await page.keyboard.press('Enter');
    await page.getByRole('button', {name: 'Return to the current chapter', exact: true}).waitFor();
    await primary().click();
    await page.getByRole('button', {name: 'Try exceeding the allowance', exact: true}).waitFor();
    check(server.calls.filter(call => call.path === 'action').length === beforeInspection, 'Building inspection and return do not authorize a transaction');
    await primary().click(); await idle();
    if (await world()) {
      await page.getByText('Stopped: Crop allowance exceeded', {exact: true}).waitFor();
      await triggerStatus(); await page.waitForTimeout(3000);
      check((await world()).seenRejections === 1 && (await world()).rejection === null, 'Repeated checked rejection has one bounded signal');
    }
    await page.getByRole('button', {name: 'Hide DAG', exact: true}).click();
    check(!(await page.locator('[data-v6-evidence-body]').isVisible()), 'Hide DAG preserves its hidden host');
    await page.getByRole('button', {name: 'Show DAG', exact: true}).click();
    await page.getByRole('button', {name: 'Expand evidence panel', exact: true}).click();
    await page.getByRole('button', {name: 'Zoom in on blockDAG', exact: true}).click();
    await page.getByRole('button', {name: 'Use compact evidence panel', exact: true}).click();
    check(await page.evaluate(() => window.__qaDagSvg === document.querySelector('[data-v6-dag-host] svg')), 'Evidence toggles/zoom preserve the same SVG and listeners');
    for (const [width, height] of [[1440, 900], [390, 844], [844, 390], [768, 1024]]) {
      await page.setViewportSize({width, height});
      await page.evaluate(() => new Promise(resolve => {setTimeout(resolve, 1000);requestAnimationFrame(() => requestAnimationFrame(resolve));}));
      await layout(`${width}x${height}`);
      const splitter = page.getByRole('separator');
      const old = Number(await splitter.getAttribute('aria-valuenow'));
      await splitter.focus();
      await page.keyboard.press((await splitter.getAttribute('aria-orientation')) === 'vertical' ? 'ArrowLeft' : 'ArrowUp');
      check(Number(await splitter.getAttribute('aria-valuenow')) !== old, `${width}x${height}: keyboard splitter changes its saved size`);
      if (width === 390) {
        check((await primary().boundingBox()).height < 100, 'Phone action button does not inherit a vertical 170px flex basis');
        await shot('synthetic-phone');
      }
    }
    await page.setViewportSize({width: 390, height: 844});
    await page.evaluate(() => document.documentElement.style.fontSize = '200%');
    await layout('390x844 text 200%');
    await shot('synthetic-text200');
    await page.evaluate(() => document.documentElement.style.fontSize = '');
    const small = await page.locator('.v6-action-footer button,.v6-scene-evidence button,.v6-resizer').evaluateAll(nodes => nodes.filter(node => node.getClientRects().length).map(node => ({label: node.getAttribute('aria-label') || node.textContent, width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height})).filter(size => size.width < 44 || size.height < 44));
    check(small.length === 0, 'Action/evidence/splitter touch targets are at least 44px');
    result.smallTargets = small;
    if (name === 'chromium') {
      const splitter = page.getByRole('separator'), bounds = await splitter.boundingBox(), old = Number(await splitter.getAttribute('aria-valuenow'));
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: bounds.x + bounds.width / 2, y: bounds.y + 20}]});
      await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: bounds.x + bounds.width / 2, y: bounds.y - 12}]});
      await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
      check(Number(await splitter.getAttribute('aria-valuenow')) !== old, 'Emulated touch drag resizes the splitter');
    } else result.touchLimit = 'Splitter target and keyboard operation checked; continuous touch drag covered only in Chromium.';
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.waitForTimeout(150);
    if (await world()) check((await world()).ambient?.phase === 'rest', 'Reduced motion keeps ambient gardening at rest');
    server.failStatus = true;
    await triggerStatus();
    await page.locator('.v6-error').waitFor();
    check(await primary().isVisible(), 'Status connection failure preserves the guide action');
    await reloadAndSettle();
    await page.locator('.v6-error').waitFor();
    check((await page.locator('[data-v6-info]').textContent()).includes('Revoke Pip’s permission'), 'Offline reload restores the saved chapter from the public snapshot');
    check((await page.locator('.v6-receipt-facts').textContent()).includes(hash('pip-trade').slice(0, 10)), 'Offline reload retains the last known receipt');
    server.failStatus = false;
    await triggerStatus();
    await page.waitForFunction(() => !document.querySelector('.v6-error'));
    check(true, 'Status reconnect clears the synthetic connection failure');
    check(result.pageErrors.length === 0, 'No uncaught page errors');
    const unexpectedRequests = result.failedRequests.filter(request => !request.intentionalApiFailure && !request.navigationCancellation);
    check(unexpectedRequests.length === 0, 'No unexpected failed asset requests');
    result.requestSummary = Object.fromEntries(['start', 'action', 'status'].map(path => [path, server.calls.filter(call => call.path === path).length]));
    result.newPendingAuthorizations = newPendingActions.map(call => ({action: call.body.action, stage: call.stageBefore}));
    check(JSON.stringify(result.servedFingerprints) === JSON.stringify(await servedFingerprints()), 'Built app modules stayed unchanged during this engine run');
    result.finished = true;
  } catch (error) {
    result.findings.push(`Runner stopped: ${error.message}`);
    console.log(`${name}: ${error.message}`);
  } finally {
    await browser?.close();
    await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2) + '\n');
  }
  console.log(`${name}: ${result.checks.length} checks, ${result.findings.length} findings, ${result.renderer}`);
}
report.completedAt = new Date().toISOString();
await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2) + '\n');
console.log(`Synthetic browser report: ${output}/report.json`);
if (Object.values(report.engines).some(result => result.findings.length)) process.exitCode = 1;
