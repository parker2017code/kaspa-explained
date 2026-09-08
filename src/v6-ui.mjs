import {
  V6_CAUSAL_STAGES,
  V6_CHAPTERS,
  V6_STEPS,
  getV6Lesson,
  getV6StepCopy,
  normalizeV6View,
  v6CompletedCount,
  v6RemainingMinutes,
} from './v6-lessons.mjs';

// V6 is a presentation shell.  The host supplies state transitions and owns
// signing, node observation, persistence and the actual Three.js scene.

const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
const json = value => esc(JSON.stringify(value ?? {}));
const asText = value => String(value ?? '').trim();
const validHash = value => /^[a-f0-9]{64}$/i.test(String(value ?? ''));
const shortHash = value => validHash(value) ? `${String(value).slice(0, 10)}…` : asText(value);
const number = value => Number(value || 0).toLocaleString('en-US', {maximumFractionDigits: 2});
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || min));

function formatSompi(value, suffix = 'tKAS') {
  try {
    const amount = BigInt(value ?? 0);
    const whole = amount / 100000000n;
    const fraction = String(amount % 100000000n).padStart(8, '0').replace(/0+$/, '');
    return `${whole}${fraction ? `.${fraction}` : ''} ${suffix}`;
  } catch {
    return asText(value) || 'Not available';
  }
}

function formatValue(value, key = '') {
  if (value === null || value === undefined || value === '') return 'Not available';
  if (/sompi$/i.test(key) || /tKAS/i.test(String(key))) return formatSompi(value);
  if (typeof value === 'number') return number(value);
  return asText(value);
}

function safeStorage() {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

const storage = safeStorage();
const readNumber = (key, fallback) => {
  const value = Number(storage?.getItem(key));
  return Number.isFinite(value) && value > 0 ? value : fallback;
};
const writeStorage = (key, value) => {
  try { storage?.setItem(key, String(value)); } catch { /* private browsing */ }
};

const causalFor = view => {
  const phase = String(view.operation?.phase || '').toLowerCase();
  const step = String(view.step || 'intro');
  if (step === 'outcome' || step === 'complete') return 5;
  if (['accepted', 'confirmed', 'settled', 'released', 'refunded'].includes(phase)) return 4;
  if (['pending', 'submitted', 'submitting', 'broadcast', 'awaiting-acceptance'].includes(phase) || step === 'pending') return 3;
  if (step === 'review') return 2;
  if (step === 'risk') return 0;
  return 0;
};

const phaseCopy = Object.freeze({
  prepared: ['Proposal prepared', 'The host prepared this proposal. Nothing has been accepted by a node yet.'],
  review: ['Review before signing', 'Check the roles, amounts and rule before authorizing the saved transaction.'],
  'awaiting-signature': ['Awaiting authorization', 'The signed transaction has not been submitted.'],
  signing: ['Collecting signatures', 'The host is collecting the required demonstration-account signatures.'],
  submitting: ['Submitting to Testnet-10', 'The host is sending the signed transaction to the node.'],
  submitted: ['Submitted to Testnet-10', 'The transaction is outside the block view until an accepting block is observed.'],
  pending: ['Waiting for acceptance', 'The result stays provisional until an accepting block identity is observed.'],
  'awaiting-acceptance': ['Waiting for acceptance', 'The result stays provisional until an accepting block identity is observed.'],
  accepted: ['Accepted by the node', 'The accepting block identity is recorded below.'],
  confirmed: ['Accepted by the node', 'The accepting block identity is recorded below.'],
  settled: ['Accepted by the node', 'The accepting block identity is recorded below.'],
  released: ['Release accepted', 'The observed transaction released the agreed amount.'],
  refunded: ['Refund accepted', 'The observed transaction returned the eligible protected amount.'],
  rejected: ['Rejected', 'The check failed and the relevant state stays unchanged.'],
  failed: ['Rejected', 'The check failed and the relevant state stays unchanged.'],
  cancelled: ['Cancelled', 'The saved proposal was cancelled before acceptance.'],
});

function operationPhase(view) {
  const operation = view.operation;
  if (!operation) return null;
  const raw = String(operation.phase || 'prepared').toLowerCase();
  const hasBlock = validHash(operation.acceptingBlock);
  const accepted = ['accepted', 'confirmed', 'settled', 'released', 'refunded'].includes(raw);
  if (accepted && !hasBlock) return ['Awaiting accepting block', 'The result is not final in this interface until the node supplies a valid accepting block identity.'];
  return phaseCopy[raw] || [operation.title || 'Transaction status', operation.detail || 'The host will report the next observed transaction phase here.'];
}

function renderIcon(kind) {
  const paths = {
    leaf: '<path d="M20 4C8 4 4 9 4 20c8 0 16-4 16-16Z"/><path d="M4 20 15 9"/>',
    harbor: '<path d="m3 18 9-12 9 12M5 18h14M8 18v3m8-3v3M6 21h12"/>',
    wallet: '<path d="M4 6h15a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 0V4h13"/><path d="M14 12h7v4h-7a2 2 0 0 1 0-4Z"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    pin: '<path d="m8 4 8 0 1 5-3 2v5l-4 3v-8l-3-2 1-5Z"/>',
    grip: '<path d="M8 5h.01M8 12h.01M8 19h.01M16 5h.01M16 12h.01M16 19h.01"/>',
  };
  return `<svg class="v6-icon" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[kind] || paths.leaf}</g></svg>`;
}

function actionButton(type, label, payload = {}, disabled = false, className = '') {
  return `<button type="button" class="v6-button ${className}" data-v6-action="${esc(type)}" data-v6-payload="${json(payload)}"${disabled ? ' disabled' : ''}>${esc(label)}</button>`;
}

function renderAmountList(amounts) {
  if (!amounts) return '';
  const entries = Array.isArray(amounts)
    ? amounts.map(item => [item?.label || item?.name || 'Amount', item?.value ?? item?.amount ?? 'Not available'])
    : Object.entries(amounts);
  return entries.filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([label, value]) => `<div class="v6-amount"><dt>${esc(label)}</dt><dd>${esc(formatValue(value, label))}</dd></div>`).join('');
}

function renderDeltas(deltas) {
  if (!Array.isArray(deltas) || !deltas.length) return '';
  return `<div class="v6-deltas" role="list">${deltas.map(delta => `<div class="v6-delta" role="listitem"><span>${esc(delta?.label || 'State')}</span><span class="v6-delta-values"><strong>${esc(formatValue(delta?.before, delta?.beforeKey || ''))}</strong><span aria-hidden="true">→</span><strong>${esc(formatValue(delta?.after, delta?.afterKey || ''))}</strong></span></div>`).join('')}</div>`;
}

function renderTech(technology) {
  if (!Array.isArray(technology) || !technology.length) return '<p class="v6-muted">No technology claim supplied for this chapter.</p>';
  return `<ul class="v6-tech-list">${technology.map(item => {
    const name = typeof item === 'string' ? item : item?.name || 'Technology';
    const context = typeof item === 'string' ? '' : item?.context || '';
    const status = typeof item === 'string' ? '' : item?.status === 'prospective' ? 'Prospective' : '';
    return `<li class="v6-tech-item"><span class="v6-tech-badge">${esc(name)}</span><span>${esc(context)}</span>${status ? `<em>${esc(status)}</em>` : ''}</li>`;
  }).join('')}</ul>`;
}

function renderHistory(history) {
  if (!Array.isArray(history) || !history.length) return '<p class="v6-muted">No observed transactions in this session.</p>';
  return `<ol class="v6-history">${history.slice(-8).reverse().map(item => {
    const status = item?.phase || item?.status || 'recorded';
    const id = item?.transactionId || item?.id;
    return `<li><div><strong>${esc(item?.title || item?.kind || 'Transaction')}</strong><span>${esc(item?.detail || status)}</span></div><small>${esc(id ? shortHash(id) : status)}</small></li>`;
  }).join('')}</ol>`;
}

function renderOperation(operation, evidence) {
  if (!operation) return '';
  const [label, fallbackDetail] = operationPhase({operation});
  const phase = String(operation.phase || 'prepared').toLowerCase();
  const accepted = ['accepted', 'confirmed', 'settled', 'released', 'refunded'].includes(phase) && validHash(operation.acceptingBlock);
  const tx = operation.transactionId || operation.id;
  const receiptUrl = evidence?.receiptUrl || (validHash(tx) ? `https://tn10.kaspa.stream/transactions/${tx}` : '');
  const block = validHash(operation.acceptingBlock) ? operation.acceptingBlock : '';
  return `<section class="v6-receipt-card" data-v6-receipt-phase="${esc(phase)}" aria-labelledby="v6-receipt-title"><div class="v6-card-heading"><div><p class="v6-eyebrow">Network receipt</p><h2 id="v6-receipt-title">${esc(label)}</h2></div><span class="v6-phase-mark" data-accepted="${accepted}">${accepted ? 'Observed' : phase === 'rejected' || phase === 'failed' ? 'Unchanged' : 'In progress'}</span></div><p>${esc(operation.detail || fallbackDetail)}</p>${operation.setup ? '<p class="v6-setup-note">Contract setup is included in this chapter’s saved operation.</p>' : ''}${operation.amounts || operation.feeSompi ? `<dl class="v6-amounts">${renderAmountList(operation.amounts)}${operation.feeSompi !== undefined ? `<div class="v6-amount"><dt>Network fee</dt><dd>${esc(formatSompi(operation.feeSompi))}</dd></div>` : ''}</dl>` : ''}<dl class="v6-receipt-facts">${tx ? `<div><dt>Transaction</dt><dd>${esc(shortHash(tx))}</dd></div>` : ''}${block ? `<div><dt>Accepting block</dt><dd>${esc(shortHash(block))}</dd></div>` : ''}${operation.kind ? `<div><dt>Purpose</dt><dd>${esc(operation.kind)}</dd></div>` : ''}</dl>${tx && receiptUrl ? `<a class="v6-text-link" href="${esc(receiptUrl)}" target="_blank" rel="noopener">Inspect this transaction ${renderIcon('arrow')}</a>` : ''}</section>`;
}

function chapterComplete(progress, lesson) {
  const complete = new Set((Array.isArray(progress?.completed) ? progress.completed : []).map(value => String(value)));
  return complete.has(lesson.id) || complete.has(String(lesson.index));
}

function renderCausalRail(view) {
  const active = causalFor(view);
  return `<ol class="v6-causal-rail" aria-label="Learning sequence">${V6_CAUSAL_STAGES.map((stage, index) => `<li class="${index < active ? 'is-past' : ''} ${index === active ? 'is-active' : ''}" data-v6-causal-stage="${esc(stage.id)}"><span>${index < active ? '✓' : index + 1}</span><strong>${esc(stage.label)}</strong></li>`).join('')}</ol>`;
}

function renderChapterDirectory(view) {
  const done = new Set((Array.isArray(view.progress?.completed) ? view.progress.completed : []).map(value => String(value)));
  return `<nav class="v6-directory" aria-label="Learning chapters"><div class="v6-directory-heading"><div><strong>${v6CompletedCount(view.progress)} of 6 complete</strong><span>${v6RemainingMinutes(view.progress)} min remaining</span></div><p class="v6-directory-note">Select a completed chapter to inspect it.</p></div><ol>${V6_CHAPTERS.map(lesson => {
    const complete = done.has(lesson.id) || done.has(String(lesson.index));
    const current = lesson.index === view.chapter;
    return `<li class="${current ? 'is-current' : ''} ${complete ? 'is-complete' : ''}"><button type="button" data-v6-chapter="${lesson.index}" aria-current="${current ? 'step' : 'false'}" aria-label="Chapter ${lesson.index + 1}: ${esc(lesson.title)}${complete ? ', complete' : ''}"><span class="v6-directory-number">${complete ? '✓' : lesson.index + 1}</span><span><strong>${esc(lesson.shortTitle)}</strong><small>${esc(lesson.place)} · ${lesson.estimatedMinutes} min</small></span></button></li>`;
  }).join('')}</ol></nav>`;
}

function renderInfo(view) {
  const lesson = getV6Lesson(view.chapter);
  const copy = view.stepCopy && typeof view.stepCopy === 'object' ? view.stepCopy : getV6StepCopy(view.chapter, view.step);
  const disabled = Boolean(view.busy || view.actionDisabled);
  const connected = Boolean(view.wallet?.connected);
  const actionType = connected ? 'primary' : 'connect';
  const actionLabel = connected ? (view.actionLabel || copy.actionLabel) : (view.actionLabel || 'Start the guide');
  const secondary = copy?.secondaryAction;
  const complete = chapterComplete(view.progress, lesson);
  const operation = renderOperation(view.operation, view.evidence);
  const result = view.result ? `<section class="v6-result-card" data-v6-result aria-labelledby="v6-result-title"><p class="v6-eyebrow">Consequence</p><h2 id="v6-result-title">${esc(view.result.title || 'The state changed')}</h2><p>${esc(view.result.detail || view.result.description || 'The host supplied a verified result.')}</p>${renderDeltas(view.result.deltas)}${view.result.description && view.result.detail ? `<p class="v6-muted">${esc(view.result.description)}</p>` : ''}</section>` : '';
  const error = view.error ? `<div class="v6-error" role="alert"><strong>Needs attention</strong><p>${esc(view.error?.message || view.error)}</p></div>` : '';
  const chapterAction = view.step === 'complete' && view.chapter === V6_CHAPTERS.length - 1
    ? `${actionButton('freeplay', 'Explore the harbor', {}, false, 'v6-button-quiet')} ${actionButton('replay', 'Replay this chapter', {chapter: lesson.index}, false, 'v6-button-quiet')}`
    : view.step === 'complete' || (complete && view.step === 'outcome')
      ? `${actionButton('continue', actionLabel, {}, disabled, 'v6-button-primary')} ${actionButton('replay', 'Replay this chapter', {chapter: lesson.index}, false, 'v6-button-quiet')}`
      : '';
  const checked = Array.isArray(view.evidence?.checked) && view.evidence.checked.length
    ? `<div class="v6-checked"><strong>Checks for this result</strong><ul>${view.evidence.checked.map(item => `<li>${esc(item)}</li>`).join('')}</ul></div>` : '';
  return `<div class="v6-info-scroll"><div class="v6-info-inner">
    <header class="v6-info-heading"><div><p class="v6-eyebrow">Chapter ${lesson.index + 1} of 6 · ${esc(lesson.place)}</p><h1>${esc(view.title || lesson.title)}</h1></div><button type="button" class="v6-dock-button" data-v6-dock aria-pressed="true">${renderIcon('pin')}<span>Dock guide</span></button></header>
    <section class="v6-trust-problem" aria-labelledby="v6-trust-title"><h2 id="v6-trust-title">${esc(view.problem || lesson.problem)}</h2></section>
    <p class="v6-enforced-rule"><strong>Enforced rule.</strong> ${esc(view.flow?.enforced || lesson.flow?.enforced || view.rule || lesson.rule)}</p>
    ${result && ['outcome','complete'].includes(view.step) ? '' : `<section class="v6-action-card" data-v6-action-card aria-labelledby="v6-action-title"><div class="v6-card-heading"><div><p class="v6-eyebrow">${view.step === 'outcome' || view.step === 'complete' ? 'Observed result' : view.step === 'pending' ? 'Awaiting acceptance' : 'Next step'}</p><h2 id="v6-action-title">${esc(copy?.title || 'Choose the next step')}</h2></div>${connected ? `<span class="v6-demo-badge">Demo accounts</span>` : ''}</div><p>${esc(copy?.body || '')}</p></section>`}
    ${result}
    ${operation}
    <details class="v6-detail-panel" data-v6-evidence><summary><span><strong>Contract and receipts</strong><small>Inspect the rule and its limits</small></span><span aria-hidden="true">＋</span></summary><div class="v6-detail-body"><section><h2>What remains trusted</h2><p>${esc(view.flow?.remaining || lesson.flow?.remaining || view.evidence?.boundary || lesson.boundary)}</p><p class="v6-boundary">${esc(view.evidence?.boundary || lesson.boundary)}</p></section><section><h2>Technology in context</h2>${renderTech(view.evidence?.technology || lesson.technology)}</section>${checked}<section><h2>Session receipts</h2>${renderHistory(view.history)}</section></div></details>
  </div></div><div class="v6-action-footer" aria-label="Current chapter action">${error}<div class="v6-action-row">${chapterAction || `${actionButton(actionType, actionLabel, {chapter: lesson.index, step: view.step}, disabled, 'v6-button-primary')}${secondary && connected ? actionButton(secondary.type || 'try_attack', secondary.label, secondary.payload || {chapter: lesson.index, step: view.step}, disabled, 'v6-button-secondary') : ''}`}</div>${view.busy ? '<p class="v6-busy" role="status" aria-live="polite">Working with the saved session…</p>' : ''}</div>`;
}

function renderSceneCaption(view) {
  const scene = view.scene || {};
  const actors = Array.isArray(scene.actors) ? scene.actors : [];
  const goods = Array.isArray(scene.goods) ? scene.goods : [];
  return `<div class="v6-scene-caption"><div><p class="v6-eyebrow">${esc(scene.place || view.place || 'Sprout Harbor')}</p><strong>${esc(scene.focus || 'Interactive harbor scene')}</strong><p>${esc(scene.status || (actors.length ? `${actors.join(' · ')}${goods.length ? ` · ${goods.join(', ')}` : ''}` : 'The scene follows the current chapter.'))}</p></div><span class="v6-scene-mode">${esc(scene.mode || 'Illustrative scene')}</span></div>`;
}

function sceneEvidenceMarkup() {
  return `<section class="v6-scene-evidence" data-v6-scene-evidence aria-labelledby="v6-scene-evidence-title"><div class="v6-scene-evidence-header"><div><p class="v6-eyebrow">Observed chain evidence</p><h2 id="v6-scene-evidence-title">No active transaction</h2></div><div class="v6-scene-evidence-actions"><button type="button" class="v6-evidence-toggle" data-v6-evidence-toggle aria-expanded="true" aria-controls="v6-dag-host">Hide DAG</button><button type="button" class="v6-evidence-size" data-v6-evidence-size aria-label="Expand evidence panel" aria-pressed="false">+</button></div></div><div class="v6-scene-evidence-body" data-v6-evidence-body><div class="v6-dag-host" id="v6-dag-host" data-v6-dag-host></div></div></section>`;
}

function mountMarkup() {
  return `<header class="v6-header"><a class="v6-brand" href="/" aria-label="Kaspa Explained home">${renderIcon('leaf')}<span><strong>Sprout Harbor</strong><small>A Kaspa learning experience</small></span></a><div class="v6-header-status"><span class="v6-network-pill"><i data-v6-network-dot></i><span data-v6-network-status>Testnet-10 · ready</span></span><span class="v6-wallet-pill" data-v6-wallet-display>Demo accounts</span><span class="v6-time-pill" data-v6-time>12–15 min</span></div></header><div data-v6-directory-host></div><main class="v6-main"><section class="v6-scene-pane" aria-label="Interactive harbor scene"><div class="v6-scene-toolbar"><span data-v6-scene-place>Exchange</span><span data-v6-scene-hint>Scene motion follows the saved result</span></div><div class="v6-scene" data-v6-scene data-v6-kind="exchange"><div class="v6-scene-placeholder" data-v6-scene-placeholder><span>${renderIcon('harbor')}</span><strong>Sprout Harbor</strong><small>Loading the interactive Testnet scene…</small></div></div><div data-v6-scene-evidence-host></div><div data-v6-scene-caption></div></section><button type="button" class="v6-resizer" data-v6-resizer role="separator" aria-label="Resize scene and explanation pane" aria-orientation="vertical" aria-valuemin="300" aria-valuemax="520" aria-valuenow="360">${renderIcon('grip')}</button><aside class="v6-info-pane" data-v6-info-pane aria-label="Chapter explanation"><div data-v6-info></div></aside></main><footer class="v6-footer"><span>Demo accounts · Kaspa Testnet-10 · experimental and unaudited</span><span>Inspect the rule, transaction, and accepting block.</span></footer>`;
}

export function mountV6UI(root, {onAction = () => {}, onChapter = () => {}, onSceneReady = () => {}, onDagReady = () => {}} = {}) {
  if (!root || typeof document === 'undefined') return {render() {}, destroy() {}};
  root.replaceChildren();
  const shell = document.createElement('div');
  shell.className = 'v6-shell';
  shell.dataset.v6Docked = 'true';
  shell.innerHTML = mountMarkup();
  root.append(shell);

  const scene = shell.querySelector('[data-v6-scene]');
  const info = shell.querySelector('[data-v6-info]');
  const directory = shell.querySelector('[data-v6-directory-host]');
  const caption = shell.querySelector('[data-v6-scene-caption]');
  const sceneEvidence = shell.querySelector('[data-v6-scene-evidence-host]');
  sceneEvidence.innerHTML = sceneEvidenceMarkup();
  const dagHost = sceneEvidence.querySelector('[data-v6-dag-host]');
  const evidencePanel = sceneEvidence.querySelector('[data-v6-scene-evidence]');
  const evidenceBody = sceneEvidence.querySelector('[data-v6-evidence-body]');
  const separator = shell.querySelector('[data-v6-resizer]');
  const networkStatus = shell.querySelector('[data-v6-network-status]');
  const walletDisplay = shell.querySelector('[data-v6-wallet-display]');
  const timeStatus = shell.querySelector('[data-v6-time]');
  let disposed = false;
  let current = normalizeV6View({});
  const renderedRegions = new WeakMap();
  const updateRegion = (element, markup) => {
    // Status and network refreshes often leave the guide unchanged. Keep its
    // controls, focus, disclosure state and scroll position in that case.
    if (renderedRegions.get(element) === markup) return;
    element.innerHTML = markup;
    renderedRegions.set(element, markup);
  };
  let axis = 'vertical';
  let infoWidth = clamp(readNumber('kaspa-v6-info-width', 400), 300, 520);
  let sceneHeight = clamp(readNumber('kaspa-v6-scene-height', typeof window !== 'undefined' ? window.innerHeight * .48 : 380), 240, 640);
  let docked = storage?.getItem('kaspa-v6-docked') !== 'false';
  let dragging = null;
  let sceneEvidenceCollapsed = false;
  let sceneEvidenceSize = 'default';

  const updateSceneEvidence = () => {
    const tx = current.operation?.transactionId || current.operation?.id;
    sceneEvidence.querySelector('h2').textContent = tx ? `Tx ${shortHash(tx)}` : 'No active transaction';
    evidencePanel.classList.toggle('is-collapsed', sceneEvidenceCollapsed);
    evidencePanel.classList.toggle('is-expanded', sceneEvidenceSize === 'expanded');
    evidenceBody.hidden = sceneEvidenceCollapsed;
    const toggle = sceneEvidence.querySelector('[data-v6-evidence-toggle]');
    toggle.textContent = sceneEvidenceCollapsed ? 'Show DAG' : 'Hide DAG';
    toggle.setAttribute('aria-expanded', String(!sceneEvidenceCollapsed));
    const size = sceneEvidence.querySelector('[data-v6-evidence-size]');
    size.textContent = sceneEvidenceSize === 'expanded' ? '−' : '+';
    size.setAttribute('aria-label', sceneEvidenceSize === 'expanded' ? 'Use compact evidence panel' : 'Expand evidence panel');
    size.setAttribute('aria-pressed', String(sceneEvidenceSize === 'expanded'));
  };

  const setLayout = (persist = true) => {
    shell.style.setProperty('--v6-info-width', `${infoWidth}px`);
    shell.style.setProperty('--v6-scene-height', `${sceneHeight}px`);
    shell.dataset.v6Docked = String(docked);
    separator.setAttribute('aria-orientation', axis);
    if (axis === 'vertical') {
      separator.setAttribute('aria-valuemin', '300');
      separator.setAttribute('aria-valuemax', '520');
      separator.setAttribute('aria-valuenow', String(Math.round(infoWidth)));
    } else {
      separator.setAttribute('aria-valuemin', '240');
      separator.setAttribute('aria-valuemax', '640');
      separator.setAttribute('aria-valuenow', String(Math.round(sceneHeight)));
    }
    if (persist) {
      writeStorage('kaspa-v6-info-width', Math.round(infoWidth));
      writeStorage('kaspa-v6-scene-height', Math.round(sceneHeight));
      writeStorage('kaspa-v6-docked', docked);
    }
  };

  const updateAxis = () => {
    axis = window.matchMedia?.('(max-width: 999px)').matches && !window.matchMedia?.('(max-height: 600px) and (orientation: landscape)').matches ? 'horizontal' : 'vertical';
    if (axis === 'horizontal') sceneHeight = clamp(sceneHeight, 240, Math.min(640, Math.max(240, window.innerHeight * .6)));
    setLayout(false);
  };

  const onResize = event => {
    if (!dragging) return;
    const delta = axis === 'vertical' ? dragging.startX - event.clientX : event.clientY - dragging.startY;
    if (axis === 'vertical') infoWidth = clamp(dragging.startWidth + delta, 300, 520);
    else sceneHeight = clamp(dragging.startHeight + delta, 240, 640);
    setLayout(false);
  };
  const stopResize = () => {
    if (!dragging) return;
    dragging = null;
    setLayout(true);
    separator.classList.remove('is-dragging');
  };
  const startResize = event => {
    if (event.button !== 0) return;
    dragging = {startX: event.clientX, startY: event.clientY, startWidth: infoWidth, startHeight: sceneHeight};
    separator.classList.add('is-dragging');
    separator.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };
  const keyboardResize = event => {
    const amount = event.shiftKey ? 48 : 16;
    if (axis === 'vertical' && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      infoWidth = clamp(infoWidth + (event.key === 'ArrowLeft' ? amount : -amount), 300, 520);
      setLayout(true);
    } else if (axis === 'horizontal' && ['ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      sceneHeight = clamp(sceneHeight + (event.key === 'ArrowDown' ? amount : -amount), 240, 640);
      setLayout(true);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      if (axis === 'vertical') infoWidth = event.key === 'Home' ? 300 : 520;
      else sceneHeight = event.key === 'Home' ? 240 : 640;
      setLayout(true);
    }
  };
  const onClick = event => {
    const action = event.target.closest?.('[data-v6-action]');
    if (action && shell.contains(action)) {
      if (action.disabled) return;
      let payload = {};
      try { payload = JSON.parse(action.dataset.v6Payload || '{}'); } catch { payload = {}; }
      onAction(action.dataset.v6Action, payload);
      return;
    }
    const chapter = event.target.closest?.('button[data-v6-chapter]');
    if (chapter && shell.contains(chapter)) {
      const index = Number(chapter.dataset.v6Chapter);
      if (Number.isInteger(index)) onChapter(index);
      return;
    }
    const dock = event.target.closest?.('[data-v6-dock]');
    if (dock && shell.contains(dock)) {
      docked = !docked;
      setLayout(true);
      render(current);
      return;
    }
    const evidenceToggle = event.target.closest?.('[data-v6-evidence-toggle]');
    if (evidenceToggle && shell.contains(evidenceToggle)) {
      sceneEvidenceCollapsed = !sceneEvidenceCollapsed;
      updateSceneEvidence();
      sceneEvidence.querySelector('[data-v6-evidence-toggle]')?.focus({preventScroll: true});
      return;
    }
    const evidenceSize = event.target.closest?.('[data-v6-evidence-size]');
    if (evidenceSize && shell.contains(evidenceSize)) {
      sceneEvidenceSize = sceneEvidenceSize === 'expanded' ? 'default' : 'expanded';
      updateSceneEvidence();
      sceneEvidence.querySelector('[data-v6-evidence-size]')?.focus({preventScroll: true});
    }
  };

  separator.addEventListener('pointerdown', startResize);
  separator.addEventListener('pointermove', onResize);
  separator.addEventListener('pointerup', stopResize);
  separator.addEventListener('pointercancel', stopResize);
  separator.addEventListener('keydown', keyboardResize);
  shell.addEventListener('click', onClick);
  window.addEventListener('pointermove', onResize);
  window.addEventListener('pointerup', stopResize);
  window.addEventListener('resize', updateAxis, {passive: true});
  updateAxis();

  // The world host receives the same stable scene element for the lifetime of
  // this UI.  It is intentionally invoked before the first render and never
  // again, so a state refresh cannot duplicate a renderer or its listeners.
  onSceneReady(scene);
  onDagReady(dagHost);

  function render(view = {}) {
    if (disposed) return current;
    const activeElement = document.activeElement;
    const focusAction = shell.contains(activeElement) ? activeElement?.dataset?.v6Action : null;
    const focusChapter = shell.contains(activeElement) ? activeElement?.dataset?.v6Chapter : null;
    current = normalizeV6View(view);
    current._balanceKnown = view._balanceKnown ?? (view.wallet?.balanceSompi !== undefined && view.wallet?.balanceSompi !== null);
    const lesson = getV6Lesson(current.chapter);
    shell.dataset.v6Chapter = String(current.chapter);
    shell.dataset.v6Step = current.step;
    shell.dataset.v6Busy = String(current.busy);
    shell.dataset.v6Connected = String(Boolean(current.wallet?.connected));
    shell.dataset.v6Kind = String(current.scene?.kind || lesson.scene.kind || 'harbor');
    scene.dataset.v6Kind = String(current.scene?.kind || lesson.scene.kind || 'harbor');
    scene.setAttribute('aria-label', `${current.scene?.place || lesson.place} scene. ${current.scene?.focus || lesson.title}.`);
    scene.querySelector('[data-v6-scene-placeholder]')?.setAttribute('aria-hidden', scene.children.length > 1 ? 'true' : 'false');
    updateRegion(directory, renderChapterDirectory(current));
    updateRegion(info, renderInfo(current));
    updateRegion(caption, renderSceneCaption(current));
    caption.hidden = !current.wallet?.connected;
    updateSceneEvidence();
    shell.querySelector('[data-v6-scene-place]').textContent = current.scene?.place || lesson.place;
    shell.querySelector('[data-v6-scene-hint]').textContent = current.scene?.status || 'Scene motion follows the saved result';
    networkStatus.textContent = current.network?.status || 'Testnet-10 · waiting';
    walletDisplay.textContent = !current.wallet?.connected ? 'Demo accounts' : current._balanceKnown ? `${current.wallet?.label || 'Demo funds'} · ${formatSompi(current.wallet.balanceSompi)}` : 'Managed test funds';
    timeStatus.textContent = current.step === 'complete' ? 'Tour complete' : `About ${v6RemainingMinutes(current.progress)} min remaining`;
    const dockButton = shell.querySelector('[data-v6-dock]');
    if (dockButton) {
      dockButton.setAttribute('aria-pressed', String(docked));
      dockButton.querySelector('span').textContent = docked ? 'Dock guide' : 'Re-dock guide';
    }
    setLayout(false);
    if (focusAction) {
      [...shell.querySelectorAll('[data-v6-action]')].find(button => button.dataset.v6Action === focusAction)?.focus({preventScroll: true});
    } else if (focusChapter) {
      [...shell.querySelectorAll('[data-v6-chapter]')].find(button => button.dataset.v6Chapter === focusChapter)?.focus({preventScroll: true});
    }
    return current;
  }

  render(current);
  return {
    render,
    setView: render,
    destroy() {
      if (disposed) return;
      disposed = true;
      separator.removeEventListener('pointerdown', startResize);
      separator.removeEventListener('pointermove', onResize);
      separator.removeEventListener('pointerup', stopResize);
      separator.removeEventListener('pointercancel', stopResize);
      separator.removeEventListener('keydown', keyboardResize);
      shell.removeEventListener('click', onClick);
      window.removeEventListener('pointermove', onResize);
      window.removeEventListener('pointerup', stopResize);
      window.removeEventListener('resize', updateAxis);
      shell.remove();
    },
  };
}
