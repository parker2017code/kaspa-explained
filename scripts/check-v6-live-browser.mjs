import {chromium} from 'playwright';
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {V6_STAGE_ACTIONS} from '../src/v6-progress.mjs';

// Chain-backed local-browser acceptance for the V6 guide.  This driver uses
// the rendered controls and the host's normal browser requests.  It does not
// intercept, synthesize, or call the V6 API directly.
const origin = new URL(process.env.V6_QA_URL || 'http://127.0.0.1:8915/covenants-v6');
const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname);
const hosted = !loopback;
const hostedHosts = new Set(['kaspaexplained.com', 'www.kaspaexplained.com', 'kaspa-explained.parker2017.workers.dev', 'kaspa-explained.pages.dev']);
if (origin.protocol !== 'http:' && origin.protocol !== 'https:') throw Error('V6 live browser QA requires an HTTP(S) URL.');
if (hosted && origin.protocol !== 'https:') throw Error('Hosted V6 live browser QA requires HTTPS.');
if (hosted && !hostedHosts.has(origin.hostname)) throw Error(`Hosted V6 live browser QA does not allow ${origin.hostname}.`);
if (hosted && process.env.V6_QA_HOSTED !== '1') throw Error('Hosted V6 live browser QA requires explicit V6_QA_HOSTED=1 opt-in.');
if (!['/covenants-v6', '/covenants/v6'].includes(origin.pathname)) throw Error('V6 live browser QA requires the /covenants-v6 or /covenants/v6 route.');
if (hosted && origin.pathname !== '/covenants/v6') throw Error('Hosted V6 live browser QA requires the canonical /covenants/v6 route.');

const profile = resolve(process.env.V6_QA_PROFILE || (hosted ? '.local/v6-cloudflare-browser-qa' : '.local/v6-browser-qa'));
const output = resolve(process.env.V6_QA_OUTPUT || (hosted ? '.cache/cloudflare-qa/v6' : '.cache/v6-qa/live'));
const reportPath = join(output, 'report.json');
const recoveryPath = join(output, 'first-pending-reload.json');
const publicSessionPath = join(output, 'session-public.json');
const historyPath = join(output, 'session-history.json');
const maxRuntimeMs = Math.max(60_000, Number(process.env.V6_QA_MAX_MS || 25 * 60_000));
const headless = process.env.V6_QA_HEADLESS === '1' || process.env.V6_QA_HEADLESS === 'true';
const KEY = 'kaspa-v6-local-session-v1';
const HASH = /^[a-f0-9]{64}$/i;

const startedAt = Date.now();
const requestLog = [];
const responseLog = [];
const failedRequests = [];
const snapshots = [];
const actions = [];
const screenshots = [];
const stageChanges = [];
const accepted = new Map();
const report = {
  scope: `Actual Chromium browser journey against the ${hosted ? 'hosted Cloudflare' : 'loopback'} V6 host. API requests are observed only; no request interception or direct API action calls are used. Transaction IDs and accepting blocks are public receipt evidence; credentials and signed transaction bytes are omitted.`,
  environment: hosted ? 'hosted' : 'loopback',
  url: origin.href,
  profile,
  output,
  startedAt: new Date(startedAt).toISOString(),
  status: 'running',
  stages: stageChanges,
  actions,
  accepted: [],
  rejections: [],
  requests: requestLog,
  responses: responseLog,
  failedRequests,
  screenshots,
  checks: [],
  findings: [],
};

let context = null;
let page = null;
let currentSnapshot = null;
let currentStage = 'not-started';
let lastSnapshotKey = '';
let screenshotNumber = 0;
let lastStatusNudge = 0;
let heartbeatTimer = null;

const sha256 = value => createHash('sha256').update(String(value)).digest('hex');
const validHash = value => HASH.test(String(value || ''));
const elapsed = () => Date.now() - startedAt;
const remaining = () => Math.max(0, maxRuntimeMs - elapsed());
const check = (condition, description) => {
  if (condition) report.checks.push(description);
  else report.findings.push(description);
  return Boolean(condition);
};

function clonePublic(value) {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value, (key, item) => {
    const lower = key.toLowerCase();
    if (['capability', 'inflight', 'transaction', 'signedhash', 'journal', 'signaturescript', 'requestid', 'body', 'privatekey', 'secret'].includes(lower)) return undefined;
    if (typeof item === 'bigint') return String(item);
    return item;
  }));
}

function publicSession(snapshot) {
  if (!snapshot) return null;
  const result = {
    sessionIdHash: snapshot.id ? sha256(snapshot.id) : null,
    stage: snapshot.stage || null,
    chapter: snapshot.chapter ?? null,
    completed: Array.isArray(snapshot.completed) ? snapshot.completed.map(Number).filter(Number.isInteger) : [],
    operation: snapshot.operation ? {
      kind: snapshot.operation.kind || null,
      phase: snapshot.operation.phase || null,
      title: snapshot.operation.title || null,
      detail: snapshot.operation.detail || null,
      transactionId: validHash(snapshot.operation.transactionId) ? snapshot.operation.transactionId : null,
      acceptingBlock: validHash(snapshot.operation.acceptingBlock) ? snapshot.operation.acceptingBlock : null,
      feeSompi: snapshot.operation.feeSompi !== undefined ? String(snapshot.operation.feeSompi) : undefined,
      setup: Boolean(snapshot.operation.setup),
      amounts: clonePublic(snapshot.operation.amounts || null),
    } : null,
    receipts: (Array.isArray(snapshot.receipts) ? snapshot.receipts : []).map(receipt => ({
      operation: receipt?.operation || null,
      kind: receipt?.kind || null,
      purpose: receipt?.purpose || null,
      transactionId: validHash(receipt?.transactionId) ? receipt.transactionId : null,
      acceptingBlock: validHash(receipt?.acceptingBlock) ? receipt.acceptingBlock : null,
      feeSompi: receipt?.feeSompi !== undefined ? String(receipt.feeSompi) : undefined,
      at: receipt?.at || null,
      title: receipt?.title || null,
      detail: receipt?.detail || null,
      chapter: receipt?.chapter ?? null,
      controlledRoles: clonePublic(receipt?.controlledRoles || undefined),
      resourceDeltas: clonePublic(receipt?.resourceDeltas || undefined),
      amounts: clonePublic(receipt?.amounts || undefined),
    })),
    rejections: (Array.isArray(snapshot.attackEvidence) ? snapshot.attackEvidence : []).map(item => ({
      idHash: item?.id ? sha256(item.id) : null,
      chapter: item?.chapter ?? null,
      stage: item?.stage || null,
      action: item?.action || null,
      summary: item?.summary || null,
      rule: item?.rule || null,
      checkedAt: item?.checkedAt || null,
      vm: item?.vm ? {
        valid: item.vm.valid,
        engine: item.vm.engine,
        scope: item.vm.scope,
        failedInput: item.vm.failedInput,
        checkedInputs: item.vm.checkedInputs,
        units: item.vm.units,
      } : null,
    })),
    inventory: clonePublic(snapshot.inventory || {}),
    scene: clonePublic(snapshot.scene || {}),
    spentSompi: String(snapshot.spentSompi || '0'),
    result: clonePublic(snapshot.result || null),
    error: snapshot.error || null,
    pending: snapshot.pending ? {
      status: snapshot.pending.status || null,
      phase: snapshot.pending.phase || null,
      transactionId: validHash(snapshot.pending.transactionId) ? snapshot.pending.transactionId : null,
      acceptingBlock: null,
      attempts: snapshot.pending.attempts ?? null,
      lastObservationError: snapshot.pending.lastObservationError || null,
    } : null,
    intent: snapshot.intent ? {
      idHash: snapshot.intent.id ? sha256(snapshot.intent.id) : null,
      kind: snapshot.intent.kind || null,
      index: snapshot.intent.index ?? null,
      total: snapshot.intent.total ?? null,
    } : null,
    balanceSompi: snapshot.balanceSompi !== undefined ? String(snapshot.balanceSompi) : undefined,
  };
  return JSON.parse(JSON.stringify(result));
}

function snapshotKey(snapshot) {
  if (!snapshot) return '';
  return JSON.stringify({
    id: snapshot.id,
    stage: snapshot.stage,
    chapter: snapshot.chapter,
    pending: snapshot.pending ? [snapshot.pending.transactionId, snapshot.pending.status, snapshot.pending.attempts] : null,
    operation: snapshot.operation ? [snapshot.operation.phase, snapshot.operation.transactionId, snapshot.operation.acceptingBlock] : null,
    receipts: (snapshot.receipts || []).map(item => [item.transactionId, item.acceptingBlock]),
    attacks: (snapshot.attackEvidence || []).map(item => [item.action, item.id]),
    inventory: snapshot.inventory,
    result: snapshot.result,
    error: snapshot.error,
  });
}

async function writeJson(path, value) {
  await writeFile(path, JSON.stringify(value, (_, item) => typeof item === 'bigint' ? String(item) : item, null, 2) + '\n');
}

async function saveReport() {
  report.latest = publicSession(currentSnapshot);
  report.completedAt = new Date().toISOString();
  report.elapsedMs = elapsed();
  report.requestSummary = {
    start: requestLog.filter(item => item.path === 'start' && item.method === 'POST').length,
    action: requestLog.filter(item => item.path === 'action' && item.method === 'POST').length,
    status: requestLog.filter(item => item.path === 'status' && item.method === 'POST').length,
    events: requestLog.filter(item => item.path === 'events').length,
  };
  await writeJson(reportPath, report);
}

async function recordSnapshot(snapshot, source = 'poll') {
  if (!snapshot) return;
  currentSnapshot = snapshot;
  const safe = publicSession(snapshot);
  const key = snapshotKey(snapshot);
  if (snapshot.stage && snapshot.stage !== currentStage) {
    currentStage = snapshot.stage;
    stageChanges.push({at: new Date().toISOString(), elapsedMs: elapsed(), stage: currentStage, pending: Boolean(snapshot.pending), intent: snapshot.intent?.kind || null});
    console.log(JSON.stringify({event: 'stage', stage: currentStage, pending: Boolean(snapshot.pending), intent: snapshot.intent?.kind || null, elapsedMs: elapsed()}));
  }
  if (key === lastSnapshotKey) return;
  lastSnapshotKey = key;
  snapshots.push({at: new Date().toISOString(), source, session: safe});
  await writeJson(publicSessionPath, {scope: report.scope, capturedAt: new Date().toISOString(), session: safe});
  await writeJson(historyPath, {scope: report.scope, capturedAt: new Date().toISOString(), snapshots});
  for (const receipt of safe.receipts || []) {
    if (!validHash(receipt.transactionId) || !validHash(receipt.acceptingBlock)) continue;
    accepted.set(receipt.transactionId, {
      operation: receipt.operation,
      kind: receipt.kind,
      transactionId: receipt.transactionId,
      acceptingBlock: receipt.acceptingBlock,
      feeSompi: receipt.feeSompi,
    });
  }
  report.accepted = [...accepted.values()];
  report.rejections = safe.rejections || [];
}

function countRequests(path) {
  return requestLog.filter(item => item.method === 'POST' && item.path === path).length;
}

function requestCounts() {
  return {start: countRequests('start'), action: countRequests('action'), status: countRequests('status')};
}

function txInSnapshot(snapshot, transactionId) {
  if (!snapshot || !validHash(transactionId)) return false;
  return snapshot.pending?.transactionId === transactionId
    || snapshot.operation?.transactionId === transactionId
    || (snapshot.receipts || []).some(receipt => receipt.transactionId === transactionId);
}

async function readBrowserState(source = 'localStorage') {
  if (!page) return null;
  const value = await page.evaluate(key => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (!saved) return null;
      return {
        snapshot: saved.snapshot || null,
        inflight: saved.inflight ? {path: saved.inflight.path || null} : null,
      };
    } catch { return null; }
  }, KEY);
  await recordSnapshot(value?.snapshot || null, source);
  return value;
}

async function uiState() {
  if (!page) return null;
  return page.evaluate(() => ({
    stage: document.querySelector('.v6-shell')?.dataset.v6Chapter || null,
    step: document.querySelector('.v6-shell')?.dataset.v6Step || null,
    busy: document.querySelector('.v6-shell')?.dataset.v6Busy || null,
    error: document.querySelector('.v6-error')?.innerText?.slice(0, 800) || null,
    buttons: [...document.querySelectorAll('.v6-action-footer [data-v6-action]')].map(button => ({
      action: button.dataset.v6Action,
      text: button.innerText.trim(),
      disabled: button.disabled,
    })),
    canvasCount: document.querySelectorAll('[data-v6-scene] canvas').length,
  }));
}

async function waitForApp() {
  await page.waitForSelector('.v6-shell', {state: 'attached', timeout: Math.min(30_000, remaining())});
  await page.waitForSelector('.v6-action-footer', {state: 'attached', timeout: Math.min(30_000, remaining())});
  await page.waitForTimeout(250);
}

async function nudgeStatus(snapshot, description) {
  if (!snapshot || Date.now() - lastStatusNudge < 4_000) return;
  const pending = Boolean(snapshot.pending);
  const refundWait = snapshot.stage === 'courier-wait' && !pending;
  if (!pending && !refundWait) return;
  const expected = pending ? 'Check the saved transaction' : 'Check refund eligibility';
  const button = page.locator('.v6-action-footer').getByRole('button',{name:expected,exact:true});
  if (!(await button.isVisible().catch(() => false)) || !(await button.isEnabled().catch(() => false))) return;
  const text = (await button.innerText().catch(() => '')).trim();
  if (!text.includes(expected)) return;
  lastStatusNudge = Date.now();
  await button.click({timeout:1000});
  console.log(JSON.stringify({event: 'status-check', stage: snapshot.stage, description, elapsedMs: elapsed()}));
}

async function waitFor(description, predicate, {timeoutMs = Math.min(180_000, remaining())} = {}) {
  const localDeadline = Math.min(Date.now() + timeoutMs, startedAt + maxRuntimeMs);
  let lastError = null;
  while (Date.now() < localDeadline) {
    const state = await readBrowserState(`wait:${description}`);
    const snapshot = state?.snapshot || null;
    if (await predicate(snapshot)) return snapshot;
    const diagnostic = await uiState().catch(() => null);
    if (diagnostic?.error) lastError = diagnostic.error;
    if(diagnostic?.error&&!snapshot?.pending&&!snapshot?.intent&&diagnostic.busy==='false')throw Error(`${description}: ${diagnostic.error}`);
    await nudgeStatus(snapshot, description).catch(error => { lastError = error.message; });
    await page.waitForTimeout(Math.min(700, Math.max(100, localDeadline - Date.now())));
  }
  const diagnostic = await uiState().catch(() => null);
  const stage = currentSnapshot?.stage || diagnostic?.stage || 'unknown';
  const detail = lastError || diagnostic?.error || 'the expected saved session state did not appear';
  throw Error(`${description} timed out at stage ${stage}: ${detail}`);
}

async function waitStage(stage, description = `stage ${stage}`) {
  return waitFor(description, snapshot => reachedStage(snapshot, stage) && !snapshot.pending);
}

// A retry of this driver must continue the existing funded session. The guide
// stages are monotonic; a later saved stage already satisfies an earlier wait.
const stageOrder=Object.keys(V6_STAGE_ACTIONS);
function reachedStage(snapshot, stage){
  const actual=stageOrder.indexOf(snapshot?.stage),expected=stageOrder.indexOf(stage);
  return expected>=0&&actual>=expected;
}

function acceptedReceipt(snapshot, operation) {
  return (snapshot?.receipts || []).find(receipt => receipt.operation === operation && validHash(receipt.transactionId) && validHash(receipt.acceptingBlock));
}

async function waitAccepted(stage, operation, description = `${operation} accepted`) {
  return waitFor(description, snapshot => reachedStage(snapshot,stage) && !snapshot.pending && Boolean(acceptedReceipt(snapshot, operation)));
}

async function waitRejection(stage, action, description = `${action} VM rejection`) {
  return waitFor(description, snapshot => snapshot?.stage === stage && !snapshot.pending && (snapshot.attackEvidence || []).some(item => item.action === action && item.vm?.valid === false && item.vm?.engine === 'Kaspa TxScriptEngine'));
}

function buttonLabel(button) {
  return String(button || '').replace(/\s+/g, ' ').trim();
}

async function clickPrimary(expectedLabel = null) {
  const button = expectedLabel?page.locator('.v6-action-footer').getByRole('button',{name:expectedLabel,exact:true}):page.locator('.v6-action-footer [data-v6-action]').first();
  await button.waitFor({state: 'visible', timeout: Math.min(30_000, remaining())});
  await page.waitForFunction(label=>{const button=document.querySelector('.v6-action-footer [data-v6-action]');return button&&!button.disabled&&(!label||button.innerText.replace(/\s+/g,' ').trim()===label);},expectedLabel,{timeout:Math.min(30_000,remaining())});
  const label = buttonLabel(await button.innerText());
  if (expectedLabel && label !== expectedLabel) throw Error(`Expected rendered primary action “${expectedLabel}”, found “${label}” at stage ${currentSnapshot?.stage || 'unknown'}.`);
  if (await button.isDisabled()) throw Error(`Rendered primary action “${label}” is disabled at stage ${currentSnapshot?.stage || 'unknown'}.`);
  const before = currentSnapshot?.stage || null;
  actions.push({at: new Date().toISOString(), elapsedMs: elapsed(), control: 'primary', label, stageBefore: before});
  await button.click();
  return label;
}

async function clickSecondary(expectedLabel) {
  const button = page.locator('.v6-action-footer [data-v6-action]').filter({hasText: expectedLabel}).first();
  await button.waitFor({state: 'visible', timeout: Math.min(30_000, remaining())});
  await page.waitForFunction(label=>[...document.querySelectorAll('.v6-action-footer [data-v6-action]')].some(button=>!button.disabled&&button.innerText.includes(label)),expectedLabel,{timeout:Math.min(30_000,remaining())});
  const label = buttonLabel(await button.innerText());
  if (!label.includes(expectedLabel)) throw Error(`Expected rendered secondary action “${expectedLabel}”, found “${label}”.`);
  if (await button.isDisabled()) throw Error(`Rendered secondary action “${label}” is disabled at stage ${currentSnapshot?.stage || 'unknown'}.`);
  actions.push({at: new Date().toISOString(), elapsedMs: elapsed(), control: 'secondary', label, stageBefore: currentSnapshot?.stage || null});
  await button.click();
  return label;
}

async function capture(label) {
  if (!page) return null;
  const filename = `${String(++screenshotNumber).padStart(2, '0')}-${label.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()}.png`;
  const path = join(output, filename);
  await page.screenshot({path, fullPage: true});
  const ui = await uiState().catch(() => null);
  screenshots.push({label, path, stage: currentSnapshot?.stage || null, canvasCount: ui?.canvasCount ?? null});
  return path;
}

async function reloadAndCheckPersistedPurchase() {
  const before = currentSnapshot;
  const beforeTools = before?.inventory?.buyer?.tools;
  const countsBefore = requestCounts();
  await page.reload({waitUntil: 'domcontentloaded', timeout: Math.min(90_000, remaining())});
  await waitForApp();
  const after = await waitStage('purchase-complete', 'purchase result after reload');
  const countsAfter = requestCounts();
  check(after.inventory?.buyer?.tools === beforeTools && Number(after.inventory?.buyer?.tools) === 1, 'Reload preserves the accepted purchase inventory quantity');
  check(countsAfter.start === countsBefore.start && countsAfter.action === countsBefore.action, 'Purchase-result reload reconciles through status without a new Start or action request');
  await capture('purchase-complete-reload');
  return after;
}

async function reloadFirstPending(snapshot) {
  const tx = snapshot?.pending?.transactionId;
  if (!validHash(tx)) throw Error('First pending session state did not expose a transaction ID.');
  const countsBefore = requestCounts();
  await capture('first-pending-before-reload');
  const reloadStarted = Date.now();
  const statusSeen = new Promise(resolveStatus => {
    let timer = null;
    const finish = value => {
      if (timer) clearTimeout(timer);
      resolveStatus(value);
    };
    const handler = response => {
      try {
        const url = new URL(response.url());
        if (url.pathname === '/api/v6/status') {
          page.off('response', handler);
          finish({status: response.status(), at: Date.now(), requestCounts: requestCounts()});
        }
      } catch { /* ignore non-URL response metadata */ }
    };
    page.on('response', handler);
    timer = setTimeout(() => { page.off('response', handler); finish({status: null, at: Date.now()}); }, Math.min(30_000, remaining()));
  });
  await page.reload({waitUntil: 'domcontentloaded', timeout: Math.min(90_000, remaining())});
  await waitForApp();
  const status = await statusSeen;
  const reloaded = await waitFor('same saved transaction after first pending reload', value => txInSnapshot(value, tx), {timeoutMs: Math.min(60_000, remaining())});
  const countsAfter = requestCounts();
  const same = txInSnapshot(reloaded, tx);
  check(status.status !== null, 'First pending reload received a status response');
  check(same, 'First pending reload retains the same transaction identity');
  const countsAtStatus = status.requestCounts || countsAfter;
  check(countsAtStatus.start === countsBefore.start && countsAtStatus.action === countsBefore.action, 'First pending reload does not issue a new Start or action request before status reconciliation');
  const marker = {scope: 'V6 browser recovery check', sessionIdHash: snapshot.id ? sha256(snapshot.id) : null, transactionId: tx, reloadedTransactionId: reloaded.pending?.transactionId || reloaded.operation?.transactionId || tx, requestCountsBefore: countsBefore, requestCountsAtStatus: countsAtStatus, requestCountsAfter: countsAfter, statusResponse: status.status, reloadStartedAt: new Date(reloadStarted).toISOString(), checkedAt: new Date().toISOString()};
  await writeJson(recoveryPath, marker);
  report.recovery = marker;
  await capture('first-pending-after-reload');
  return reloaded;
}

async function maybeReloadFirstPending(snapshot) {
  if (!snapshot?.pending?.transactionId) return snapshot;
  let marker = null;
  if (existsSync(recoveryPath)) {
    try { marker = JSON.parse(await readFile(recoveryPath, 'utf8')); } catch { marker = null; }
  }
  if (marker?.sessionIdHash === (snapshot.id ? sha256(snapshot.id) : null) && marker.transactionId === snapshot.pending.transactionId) {
    report.recovery = marker;
    check(true, 'First pending reload marker matches the current saved session');
    return snapshot;
  }
  return reloadFirstPending(snapshot);
}

async function runJourney() {
  await mkdir(output, {recursive: true});
  await mkdir(profile, {recursive: true});

  context = await chromium.launchPersistentContext(profile, {
    headless,
    viewport: {width: 1440, height: 900},
    args: ['--enable-unsafe-swiftshader', '--no-first-run', '--no-default-browser-check'],
  });
  page = context.pages()[0] || await context.newPage();
  page.setDefaultTimeout(Math.min(30_000, remaining()));
  page.on('request', request => {
    try {
      const url = new URL(request.url());
      if (!url.pathname.startsWith('/api/v6/')) return;
      let body = null;
      try { body = request.postDataJSON?.(); } catch { body = null; }
      requestLog.push({at: new Date().toISOString(), elapsedMs: elapsed(), method: request.method(), path: url.pathname.slice('/api/v6/'.length), action: body?.action || null, requestIdHash: body?.requestId ? sha256(body.requestId) : null, hasSessionId: Boolean(body?.id), hasCapability: Boolean(body?.capability)});
    } catch { /* ignore browser-internal request metadata */ }
  });
  page.on('response', async response => {
    try {
      const url = new URL(response.url());
      if (url.pathname.startsWith('/api/v6/')) {
        const item={at:new Date().toISOString(),elapsedMs:elapsed(),method:response.request().method(),path:url.pathname.slice('/api/v6/'.length),status:response.status()};
        responseLog.push(item);
        if(response.status()>=400){const body=await response.json().catch(()=>null);if(body?.error)item.error=String(body.error).slice(0,400);}
      }
    } catch { /* ignore browser-internal response metadata */ }
  });
  page.on('requestfailed', request => {
    try {
      const url = new URL(request.url());
      if (url.pathname.startsWith('/api/v6/')) failedRequests.push({at: new Date().toISOString(), path: url.pathname.slice('/api/v6/'.length), method: request.method(), reason: request.failure()?.errorText || 'unknown'});
    } catch { /* ignore browser-internal request metadata */ }
  });
  page.on('pageerror', error => report.findings.push(`Page error: ${error.message}`));

  heartbeatTimer = setInterval(() => {
    console.log(JSON.stringify({event: 'heartbeat', stage: currentSnapshot?.stage || currentStage, pending: Boolean(currentSnapshot?.pending), intent: currentSnapshot?.intent?.kind || null, elapsedMs: elapsed(), remainingMs: remaining()}));
  }, 30_000);

  await page.goto(origin.href, {waitUntil: 'domcontentloaded', timeout: Math.min(90_000, remaining())});
  await waitForApp();
  await readBrowserState('initial-load');
  if(currentSnapshot&&existsSync(recoveryPath)){
    const priorRecovery=JSON.parse(await readFile(recoveryPath,'utf8'));
    if(priorRecovery.sessionIdHash===sha256(currentSnapshot.id))report.recovery=priorRecovery;
  }
  if (!currentSnapshot) {
    await clickPrimary('Start the guide');
    await waitFor('new local V6 session', snapshot => Boolean(snapshot?.id && (snapshot.pending || snapshot.intent)), {timeoutMs: Math.min(90_000, remaining())});
  }
  await maybeReloadFirstPending(currentSnapshot);
  if(currentSnapshot&&!currentSnapshot.pending&&!currentSnapshot.intent&&acceptedReceipt(currentSnapshot,'purchase')){
    const before=requestCounts();
    await page.reload({waitUntil:'domcontentloaded'});await waitForApp();
    await waitFor('restored accepted purchase',snapshot=>Boolean(acceptedReceipt(snapshot,'purchase'))&&!snapshot.pending);
    check(Number(currentSnapshot.inventory?.buyer?.tools)===1,'The restored browser session retains its one accepted tool');
    check(requestCounts().start===before.start&&requestCounts().action===before.action,'Restored purchase inspection makes no new spending action');
    await capture('restored-purchase-outcome');
  }

  // The host's finite setup queues resume only their saved intent.  Wait for
  // the rendered guide to reach each chapter before authorizing its next step.
  await waitStage('purchase-ready', 'purchase setup');
  if (currentSnapshot.stage==='purchase-ready' && !(currentSnapshot.attackEvidence || []).some(item => item.action === 'purchase_attack')) {
    const receiptsBefore = currentSnapshot.receipts?.length || 0;
    await clickSecondary('Try the missing-tool proposal');
    const attack = await waitRejection('purchase-ready', 'purchase_attack');
    check((attack.receipts?.length || 0) === receiptsBefore, 'Purchase attack changes no receipt or inventory state');
    await capture('purchase-vm-rejection');
  }
  if (currentSnapshot.stage === 'purchase-ready') {
    await clickPrimary('Buy the tool atomically');
    const purchase = await waitAccepted('purchase-complete', 'purchase', 'purchase acceptance');
    check(validHash(purchase.operation?.transactionId) && validHash(purchase.operation?.acceptingBlock), 'Purchase receipt has a transaction ID and accepting block');
    await capture('purchase-accepted');
    await reloadAndCheckPersistedPurchase();
  }
  if (currentSnapshot.stage === 'purchase-complete') {
    await clickPrimary('Continue to Pip’s permission');
  }

  await waitStage('pip-ready', 'Pip chapter ready');
  if (currentSnapshot.stage === 'pip-ready') await clickPrimary('Give Pip this one job');
  await waitAccepted('pip-permitted', 'pip-configure', 'Pip permission acceptance');
  await capture('pip-permission-accepted');
  if (currentSnapshot.stage === 'pip-permitted') await clickPrimary('Let Pip complete the barter');
  await waitAccepted('pip-traded', 'pip-trade', 'Pip barter acceptance');
  await capture('pip-barter-accepted');
  if (currentSnapshot.stage === 'pip-traded') {
    const receiptsBefore = currentSnapshot.receipts?.length || 0;
    await clickPrimary('Try exceeding the allowance');
    const attack = await waitRejection('pip-blocked', 'pip_attack');
    check((attack.receipts?.length || 0) === receiptsBefore, 'Pip allowance attack leaves the goods and receipts unchanged');
    await capture('pip-vm-rejection');
  }
  if (currentSnapshot.stage === 'pip-blocked') await clickPrimary('Revoke Pip’s permission');
  await waitAccepted('pip-complete', 'pip-revoke', 'Pip revocation acceptance');
  await capture('pip-revoked');
  if (currentSnapshot.stage === 'pip-complete') await clickPrimary('Continue to the trading ring');

  await waitStage('ring-ready', 'trading ring setup');
  if (currentSnapshot.stage==='ring-ready' && !(currentSnapshot.attackEvidence || []).some(item => item.action === 'ring_attack')) {
    const receiptsBefore = currentSnapshot.receipts?.length || 0;
    await clickSecondary('Try a ring without one approval');
    const attack = await waitRejection('ring-ready', 'ring_attack');
    check((attack.receipts?.length || 0) === receiptsBefore, 'Ring attack changes no receipt or inventory state');
    await capture('ring-vm-rejection');
  }
  if (currentSnapshot.stage === 'ring-ready') await clickPrimary('Settle all three trades');
  await waitAccepted('ring-complete', 'ring', 'trading ring acceptance');
  await capture('ring-accepted');
  if (currentSnapshot.stage === 'ring-complete') await clickPrimary('Continue to the greenhouse');

  await waitStage('coord-ready', 'greenhouse setup');
  if (currentSnapshot.stage==='coord-ready' && !(currentSnapshot.attackEvidence || []).some(item => item.action === 'coord_attack')) {
    const receiptsBefore = currentSnapshot.receipts?.length || 0;
    await clickSecondary('Try releasing too early');
    const attack = await waitRejection('coord-ready', 'coord_attack');
    check((attack.receipts?.length || 0) === receiptsBefore, 'Coordination attack changes no receipt or inventory state');
    await capture('coordination-vm-rejection');
  }
  if (currentSnapshot.stage === 'coord-ready') await clickPrimary('Withdraw one neighbor’s pledge');
  await waitAccepted('coord-withdrawn', 'coord-withdraw', 'pledge withdrawal acceptance');
  await capture('coordination-withdrawal-accepted');
  if (currentSnapshot.stage === 'coord-withdrawn') await clickPrimary('Re-form the protected group');
  await waitStage('coord-join-ready', 'protected group re-formed');
  if (currentSnapshot.stage === 'coord-join-ready') await clickPrimary('Join and build together');
  await waitAccepted('coord-complete', 'coord-settle', 'greenhouse settlement acceptance');
  await capture('greenhouse-accepted');
  if (currentSnapshot.stage === 'coord-complete') await clickPrimary('Continue to the courier');

  await waitStage('courier-ready', 'courier funding');
  if (currentSnapshot.stage === 'courier-ready') await clickPrimary('Lock payment and bond');
  await waitAccepted('courier-locked', 'delivery-open', 'delivery lock acceptance');
  await capture('courier-lock-accepted');
  if (currentSnapshot.stage === 'courier-locked') await clickPrimary('Deliver with the recipient’s receipt');
  await waitAccepted('courier-delivered', 'delivery-release', 'recipient receipt acceptance');
  await capture('courier-release-accepted');
  if (currentSnapshot.stage === 'courier-delivered') await clickPrimary('Try the no-receipt path');
  const refundOpen = await waitFor('no-receipt agreement acceptance', snapshot => reachedStage(snapshot,'courier-wait') && !snapshot.pending && Boolean(acceptedReceipt(snapshot, 'refund-open')));
  check(validHash(acceptedReceipt(refundOpen, 'refund-open')?.transactionId) && validHash(acceptedReceipt(refundOpen, 'refund-open')?.acceptingBlock), 'No-receipt agreement has an accepting block before refund eligibility');
  await capture('courier-refund-wait');
  if (currentSnapshot.stage === 'courier-wait') await waitStage('courier-refund-ready', 'chain-age refund eligibility');
  if (currentSnapshot.stage === 'courier-refund-ready') await clickPrimary('Claim the refund and forfeited bond');
  await waitAccepted('courier-complete', 'delivery-refund', 'courier refund acceptance');
  await capture('courier-refund-accepted');
  if (currentSnapshot.stage === 'courier-complete') await clickPrimary('Continue to verified work');

  await waitStage('proof-ready', 'proof chapter ready');
  if (currentSnapshot.stage === 'proof-ready') {
    const receiptsBefore = currentSnapshot.receipts?.length || 0;
    await clickPrimary('Try an invalid proof');
    const attack = await waitRejection('proof-blocked', 'proof_attack');
    check((attack.receipts?.length || 0) === receiptsBefore, 'Invalid proof changes no receipt or inventory state');
    await capture('proof-vm-rejection');
  }
  if (currentSnapshot.stage === 'proof-blocked') await clickPrimary('Verify the work and release 0.13 tKAS');
  await waitAccepted('proof-verified', 'proof-redeem', 'proof redemption acceptance');
  await capture('proof-accepted');
  if (currentSnapshot.stage === 'proof-verified') await clickPrimary('Finish the tour');
  await waitStage('complete', 'completed V6 tour');
  await capture('tour-complete');

  const countsBeforeFinalReload=requestCounts();
  await page.reload({waitUntil:'domcontentloaded'});
  await waitForApp();
  const final = await waitStage('complete','completed results after reload');
  check(requestCounts().start===countsBeforeFinalReload.start&&requestCounts().action===countsBeforeFinalReload.action,'Completed-tour reload makes no new spending action');
  await capture('tour-complete-reloaded');
  const finalAccepted = (final.receipts || []).filter(receipt => validHash(receipt.transactionId) && validHash(receipt.acceptingBlock));
  const finalRejections = (final.attackEvidence || []).filter(item => item.vm?.valid === false && item.vm?.engine === 'Kaspa TxScriptEngine');
  check(final.completed?.length === 6 && [0, 1, 2, 3, 4, 5].every(chapter => final.completed.includes(chapter)), 'All six V6 chapters are complete');
  check(finalAccepted.length === 26, `All 26 setup and chapter transactions have transaction and accepting-block receipts (${finalAccepted.length})`);
  check(finalRejections.length >= 5, `At least five attempted transactions were rejected by the Kaspa script VM (${finalRejections.length})`);
  check(!final.pending, 'No saved transaction remains pending at the end of the tour');
  check(BigInt(final.spentSompi || '0') <= 800000000n, 'The browser session remains within the 8 tKAS V6 treasury cap');
  check(Number(final.inventory?.buyer?.tools) === 1 && Number(final.inventory?.buyer?.crops) === 2 && Number(final.inventory?.buyer?.wood) === 1, 'Buyer inventory records the tool, two remaining crops, and one received timber');
  check(Number(final.inventory?.miner?.tools) === 1 && Number(final.inventory?.grower?.ore) === 2 && Number(final.inventory?.toolmaker?.crops) === 3, 'Ring inventory records all three accepted handoffs');
  check(final.inventory?.greenhouse?.built === true && final.inventory?.observatory?.machineOn === true && final.inventory?.worker?.coinsSompi === '13000000', 'Greenhouse and observatory results persist in the browser session');

  if (report.findings.length) throw Error(`V6 live browser acceptance found ${report.findings.length} issue(s).`);
  report.status = 'complete';
}

try {
  await runJourney();
} catch (error) {
  report.status = 'failed';
  report.failure = {stage: currentSnapshot?.stage || currentStage, error: error?.message || String(error), elapsedMs: elapsed(), visible: (await uiState().catch(() => null))?.error || null};
  if (page) await capture('failure').catch(() => {});
  console.error(JSON.stringify({event: 'failure', stage: report.failure.stage, error: report.failure.error, elapsedMs: report.failure.elapsedMs}));
  process.exitCode = 1;
} finally {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  if (context) await context.close().catch(() => {});
  await saveReport().catch(error => console.error(JSON.stringify({event: 'report-write-failure', error: error.message})));
  console.log(JSON.stringify({event: 'complete', status: report.status, stage: report.latest?.stage || currentStage, accepted: report.accepted.length, rejections: report.rejections.length, screenshots: screenshots.length, report: reportPath, elapsedMs: report.elapsedMs}));
}
