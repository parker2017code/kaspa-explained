import {chromium} from 'playwright';
import {mkdir, writeFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';

// Hosted V5 acceptance uses only rendered controls and the page's own requests.
// It deliberately never reads browser storage, calls an API directly, or
// intercepts a request. The dedicated profile must not be shared with local QA.
const target = new URL(process.env.V5_QA_URL || 'https://kaspa-explained.pages.dev/covenants/v5');
const allowedHosts = new Set(['kaspaexplained.com', 'www.kaspaexplained.com', 'kaspa-explained.parker2017.workers.dev', 'kaspa-explained.pages.dev']);
if (target.protocol !== 'https:' || !allowedHosts.has(target.hostname) || target.pathname !== '/covenants/v5') {
  throw Error('V5 hosted browser QA requires an allowlisted HTTPS host and the /covenants/v5 route.');
}

const profile = resolve(process.env.V5_QA_PROFILE || '.local/v5-cloudflare-browser-qa');
const output = resolve(process.env.V5_QA_OUTPUT || '.cache/cloudflare-qa/v5');
const maxRuntimeMs = Math.max(60_000, Number(process.env.V5_QA_MAX_MS || 35 * 60_000));
const maxSpendSompi = 800_000_000n;
const faucetBaselineSompi = 1_000_000_000n;
const startedAt = Date.now();
const hash = value => /^[a-f0-9]{64}$/i.test(String(value || ''));
const elapsed = () => Date.now() - startedAt;
const remaining = () => Math.max(0, maxRuntimeMs - elapsed());

const report = {
  scope: 'Actual persistent Chromium browser journey against hosted V5. All actions use rendered controls and the page\'s normal requests; no request interception, direct API calls, synthetic chain, or browser-storage inspection. Public transaction IDs and accepting blocks are retained. Capabilities, keys, signatures, serialized transactions, and raw request bodies are omitted.',
  url: target.href,
  profile,
  output,
  startedAt: new Date(startedAt).toISOString(),
  status: 'running',
  actions: [], requests: [], responses: [], receipts: [], screenshots: [], checks: [], findings: [],
};

let context;
let page;
let screenshotNumber = 0;
let initialBalance = null;
let lowestBalance = null;
const receiptIds = new Set();
const check = (condition, description) => {
  (condition ? report.checks : report.findings).push(description);
  return Boolean(condition);
};

function publicEvidence(value) {
  if (!value || typeof value !== 'object') return;
  const stack = [value];
  while (stack.length) {
    const item = stack.pop();
    if (!item || typeof item !== 'object') continue;
    const tx = item.transactionId;
    const block = item.acceptingBlock;
    if (hash(tx) && hash(block) && !receiptIds.has(tx)) {
      receiptIds.add(tx);
      report.receipts.push({transactionId: tx, acceptingBlock: block, operation: typeof item.operation === 'string' ? item.operation : null, kind: typeof item.kind === 'string' ? item.kind : null, purpose: typeof item.purpose === 'string' ? item.purpose : null});
    }
    for (const [key, child] of Object.entries(item)) {
      if (['capability', 'privateKey', 'transaction', 'reviewedWire', 'wire', 'signature', 'signatures', 'scriptPublicKey', 'entries', 'journal', 'marketJournal'].includes(key)) continue;
      if (child && typeof child === 'object') stack.push(child);
    }
  }
}

async function writeReport() {
  report.completedAt = new Date().toISOString();
  report.elapsedMs = elapsed();
  await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
}

async function uiState() {
  return page.evaluate(() => {
    const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
    const button = document.querySelector('[data-game-continue]');
    const dialog = [...document.querySelectorAll('dialog[open], .v5-dialog:not([hidden])')].find(node => node.offsetParent !== null || node.open);
    return {
      title: clean(document.querySelector('[data-game-title]')?.textContent),
      status: clean(document.querySelector('[data-game-line]')?.textContent),
      location: clean(document.querySelector('[data-game-location]')?.textContent),
      phase: document.querySelector('[data-public-v4]')?.dataset.experiencePhase || null,
      guideButton: button ? {text: clean(button.textContent), disabled: button.disabled} : null,
      dialogTitle: clean(dialog?.querySelector('h2,h3,strong')?.textContent),
      dialogText: clean(dialog?.textContent).slice(0, 900),
      dialogButtons: dialog ? [...dialog.querySelectorAll('button')].filter(b => b.offsetParent !== null).map(b => ({text: clean(b.textContent), disabled: b.disabled, type: b.type})) : [],
      walletText: clean(document.querySelector('[data-game-stats]')?.textContent),
      canvasCount: document.querySelectorAll('canvas').length,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
}

function balanceFrom(text) {
  const match = String(text).match(/Wallet\s+(\d+(?:\.\d+)?)\s+tKAS/i);
  if (!match) return null;
  const [whole, fraction = ''] = match[1].split('.');
  return BigInt(whole) * 100_000_000n + BigInt(fraction.padEnd(8, '0'));
}

async function capture(label) {
  const filename = `${String(++screenshotNumber).padStart(2, '0')}-${label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`;
  const path = join(output, filename);
  await page.screenshot({path, fullPage: true});
  report.screenshots.push({label, path, ui: await uiState()});
}

async function waitChanged(before, timeout = Math.min(90_000, remaining())) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    await page.waitForTimeout(500);
    const state = await uiState();
    const fingerprint = JSON.stringify([state.title, state.status, state.phase, state.guideButton, state.dialogTitle, state.dialogButtons]);
    if (fingerprint !== before) return state;
  }
  throw Error('The rendered V5 state did not change after the selected control.');
}

async function click(locator, control, state) {
  const before = JSON.stringify([state.title, state.status, state.phase, state.guideButton, state.dialogTitle, state.dialogButtons]);
  report.actions.push({at: new Date().toISOString(), elapsedMs: elapsed(), control, title: state.title, phase: state.phase, location: state.location});
  await locator.click({timeout: Math.min(30_000, remaining())});
  return waitChanged(before);
}

async function handleDialog(state) {
  const dialog = page.locator('dialog[open]').first();
  const enabled = dialog.locator('button:not([disabled]):visible');
  const count = await enabled.count();
  if (!count) throw Error(`Open dialog has no enabled control: ${state.dialogTitle || state.dialogText}`);
  const preferred = enabled.filter({hasText: /^(Buy|Build|Take order|Deliver order|Plant|Water|Harvest|Enable|Disable|Save|Bring|Set up|Accept|Open|Start|Continue|Get|Fund|Care|Craft|Lock|Release|Claim|Settle|Prepare)/i}).first();
  const button = await preferred.count() ? preferred : enabled.filter({hasNotText: /Cancel|Close|Back|Return/i}).first();
  if (!await button.count()) throw Error(`Dialog only offers cancellation controls: ${state.dialogTitle || state.dialogText}`);
  const label = (await button.innerText()).replace(/\s+/g, ' ').trim();
  return click(button, `dialog:${label}`, state);
}

async function run() {
  await mkdir(output, {recursive: true});
  await mkdir(profile, {recursive: true});
  context = await chromium.launchPersistentContext(profile, {headless: process.env.V5_QA_HEADLESS !== '0', viewport: {width: 1440, height: 900}, args: ['--enable-unsafe-swiftshader', '--no-first-run', '--no-default-browser-check']});
  page = context.pages()[0] || await context.newPage();
  page.setDefaultTimeout(30_000);
  page.on('pageerror', error => report.findings.push(`Page error: ${error.message}`));
  page.on('requestfailed', request => { if (request.url().includes('/api/')) report.findings.push(`Failed request: ${new URL(request.url()).pathname} (${request.failure()?.errorText || 'unknown'})`); });
  page.on('request', request => {
    const url = new URL(request.url());
    if (!url.pathname.startsWith('/api/')) return;
    let action = null, hasCapability = false;
    try { const body = request.postDataJSON(); action = body?.action?.type || body?.action || null; hasCapability = Boolean(body?.capability); } catch {}
    report.requests.push({at: new Date().toISOString(), method: request.method(), path: url.pathname, action, hasCapability, bodyRecorded: false});
  });
  page.on('response', async response => {
    const url = new URL(response.url());
    if (!url.pathname.startsWith('/api/')) return;
    report.responses.push({at: new Date().toISOString(), method: response.request().method(), path: url.pathname, status: response.status()});
    const type = response.headers()['content-type'] || '';
    if (type.includes('application/json')) publicEvidence(await response.json().catch(() => null));
  });

  await page.goto(target.href, {waitUntil: 'domcontentloaded', timeout: 90_000});
  await page.waitForSelector('[data-v5-app] [data-game-continue]', {timeout: 30_000});
  const robots = await page.locator('meta[name="robots"]').getAttribute('content');
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  check(/noindex/i.test(robots || ''), 'Hosted V5 route carries a noindex directive');
  check(canonical === 'https://kaspaexplained.com/covenants/v5', 'Hosted V5 route declares the canonical /covenants/v5 URL');
  const [homeResponse, searchResponse, sitemapResponse] = await Promise.all([
    context.request.get(new URL('/', target).href),
    context.request.get(new URL('/search', target).href),
    context.request.get(new URL('/sitemap.xml', target).href),
  ]);
  const [home, search, sitemap] = await Promise.all([homeResponse.text(), searchResponse.text(), sitemapResponse.text()]);
  check(!/href=["']\/covenants\/(?:v5|v6)/i.test(home), 'Hosted V5 and V6 routes are absent from public home navigation');
  check(!/href=["']\/covenants\/(?:v5|v6)/i.test(search), 'Hosted V5 and V6 routes are absent from site search');
  check(!/\/covenants\/(?:v5|v6)/i.test(sitemap), 'Hosted V5 and V6 routes are absent from the sitemap');
  await capture('initial-render');

  let state = await uiState();
  let lastProgress = '';
  let unchanged = 0;
  let completed = false;
  while (elapsed() < maxRuntimeMs) {
    const balance = balanceFrom(state.walletText);
    if (balance !== null) {
      if (initialBalance === null) initialBalance = balance;
      if (lowestBalance === null || balance < lowestBalance) lowestBalance = balance;
      if (balance <= faucetBaselineSompi && faucetBaselineSompi - balance > maxSpendSompi) throw Error('The browser wallet exceeded the 8 tKAS QA spending cap.');
    }
    if (/Play freely/i.test(state.guideButton?.text || '') && !state.dialogTitle) { completed = true; break; }
    const progress = JSON.stringify([state.title, state.status, state.phase, state.dialogTitle, state.guideButton?.text]);
    unchanged = progress === lastProgress ? unchanged + 1 : 0;
    lastProgress = progress;
    if (unchanged > 120) throw Error(`Rendered journey stopped progressing at “${state.title}”: ${state.status}`);

    if (state.dialogTitle) state = await handleDialog(state);
    else if (state.guideButton && !state.guideButton.disabled) state = await click(page.locator('[data-game-continue]'), `guide:${state.guideButton.text}`, state);
    else {
      if (/error|failed|could not|refused|limit/i.test(state.status) && !/Waiting|Checking/i.test(state.status)) throw Error(`Visible V5 error: ${state.status}`);
      await page.waitForTimeout(1500);
      state = await uiState();
    }
    if (state.phase === 'result' || report.receipts.length && report.receipts.length % 4 === 0) await capture(`progress-${report.receipts.length}-${state.phase || 'guide'}`);
  }

  if (!completed) throw Error('The hosted V5 journey exceeded its bounded runtime before reaching free play.');
  state = await uiState();
  check(/Play freely/i.test(state.guideButton?.text || ''), 'The complete hosted guide reaches its explicit free-play boundary');
  check(report.receipts.length > 0 && report.receipts.every(item => hash(item.transactionId) && hash(item.acceptingBlock)), `Observed ${report.receipts.length} accepted public receipts with accepting blocks`);
  check(state.canvasCount > 0, 'The rendered V5 town includes its canvas world');
  check(!state.horizontalOverflow, 'Desktop completion view has no horizontal overflow');
  await capture('guide-complete');

  const actionsBeforeReload = report.requests.filter(item => item.method === 'POST' && /\/api\/v5\/(?:action|payment)$/.test(item.path)).length;
  await page.reload({waitUntil: 'domcontentloaded', timeout: 90_000});
  await page.waitForSelector('[data-v5-app] [data-game-continue]');
  await page.waitForFunction(() => /Play freely/i.test(document.querySelector('[data-game-continue]')?.textContent || ''), null, {timeout: Math.min(30_000, remaining())});
  const restored = await uiState();
  const actionsAfterReload = report.requests.filter(item => item.method === 'POST' && /\/api\/v5\/(?:action|payment)$/.test(item.path)).length;
  check(/Play freely/i.test(restored.guideButton?.text || ''), 'Reload restores the completed guide state');
  check(actionsAfterReload === actionsBeforeReload, 'Reload restoration does not submit a new action');
  await capture('guide-complete-reloaded');

  await page.setViewportSize({width: 390, height: 844});
  await page.waitForTimeout(500);
  const mobile = await uiState();
  check(!mobile.horizontalOverflow, 'Phone-width completion view has no horizontal overflow');
  check(mobile.canvasCount > 0, 'Phone-width completion view keeps the town rendered');
  await capture('guide-complete-mobile');
  if (report.findings.length) throw Error(`V5 hosted browser acceptance found ${report.findings.length} issue(s).`);
  report.status = 'complete';
}

try {
  await run();
} catch (error) {
  report.status = 'failed';
  report.failure = {error: error?.message || String(error), elapsedMs: elapsed(), ui: page ? await uiState().catch(() => null) : null};
  if (page) await capture('failure').catch(() => {});
  console.error(JSON.stringify({event: 'failure', error: report.failure.error, elapsedMs: elapsed()}));
  process.exitCode = 1;
} finally {
  report.balance = {faucetBaselineSompi: faucetBaselineSompi.toString(), initialSompi: initialBalance?.toString() || null, lowestSompi: lowestBalance?.toString() || null, observedNetDecreaseFromFaucetSompi: lowestBalance !== null && lowestBalance <= faucetBaselineSompi ? (faucetBaselineSompi - lowestBalance).toString() : '0', capSompi: maxSpendSompi.toString()};
  if (context) await context.close().catch(() => {});
  await writeReport().catch(() => {});
  console.log(JSON.stringify({event: 'complete', status: report.status, receipts: report.receipts.length, screenshots: report.screenshots.length, report: join(output, 'report.json')}));
}
