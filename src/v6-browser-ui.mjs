import {browserLessons, browserAction} from './v6-browser-lessons.mjs';
import {v6Coins} from './v6-browser-wallet.mjs';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button = (action, label, attrs = '') => `<button type="button" data-action="${action}" ${attrs}>${label}</button>`;
const receipt = record => `<a href="https://tn10.kaspa.stream/transactions/${esc(record.id)}" target="_blank" rel="noopener">${esc(record.title || 'Test coins')} ↗</a>`;

export function mountBrowserUI(root, {wallet, engine, onAction, onChapter}) {
  root.className = 'v6-browser';
  root.innerHTML = `<header class="harbor-heading"><div><p class="harbor-kicker">Sprout Harbor · real Testnet-10 transactions</p><h1>Try the rule. See what changes.</h1><p>Six everyday trust problems. Your browser holds the demo keys; you approve each transaction.</p></div><span data-progress>0 of 6 explored</span></header>
    <section class="harbor-wallet" aria-label="Your test wallet"><div><span>Your available test coins</span><strong data-balance>0</strong><small data-network>Wallet not created</small></div><div class="harbor-wallet-actions" data-wallet-actions></div><p data-wallet-note></p><details><summary>Balances, backup and recovery</summary><div data-wallet-balances></div><p>This tab keeps the wallet across reloads. Save a password-protected recovery file before closing it. All three role keys belong to this browser. Use test coins only.</p><label>Recovery password <input type="password" autocomplete="new-password" minlength="12" data-backup-password placeholder="At least 12 characters"></label><div class="harbor-buttons">${button('backup','Save recovery file')}${button('import','Import recovery file')}<input type="file" accept="application/json,.json" data-import-file hidden></div><p data-backup-result></p><details><summary>Exact demo addresses</summary><div data-addresses></div></details></details></section>
    <nav class="harbor-chapters" aria-label="Choose a lesson">${browserLessons.map((lesson,index) => `<button type="button" data-chapter="${index}" aria-current="${index === 0 ? 'step' : 'false'}"><span>${index + 1}</span>${esc(lesson.short)}<small data-done="${index}"></small></button>`).join('')}</nav>
    <div class="harbor-layout"><div class="harbor-world-column"><div class="harbor-scene" data-scene><p data-scene-loading>Opening the harbor illustration…</p></div><p class="harbor-scene-note">The harbor illustrates contract results. Coins move only when you approve a transaction and the network accepts it.</p><div data-dag></div></div><section class="harbor-lesson" aria-label="Selected lesson"><div data-lesson-content></div><dialog class="harbor-review" data-review aria-label="Review and approve one transaction"></dialog></section></div>
    <section class="harbor-status" aria-label="Transaction status"><div class="harbor-notice" data-notice hidden><p data-message role="status" aria-live="polite"></p><p data-error role="alert" hidden></p>${button('dismiss','Dismiss')}</div><div data-pending></div></section>
    <details class="harbor-history"><summary>Saved transaction receipts <span data-receipt-count>0</span></summary><ol data-receipts></ol></details><section data-legacy hidden></section>`;
  const find = selector => root.querySelector(selector);
  let proofDraft = {allocation:'6',rate:'7'};
  let noticeKey = '', noticeTimer;
  let chapter = -1, lessonKey = '', reviewKey = '', pendingKey = '', receiptsKey = '', walletKey = '';
  root.addEventListener('click', event => {
    const selected = event.target.closest('[data-chapter]');
    if (selected) {onChapter(Number(selected.dataset.chapter)); return;}
    const target = event.target.closest('[data-action]'); if (target && !target.disabled) onAction(target.dataset.action, target.dataset.step);
  });
  root.addEventListener('input', event => {
    if (!event.target.matches('[data-allocation],[data-rate]') || engine.busy) return;
    proofDraft[event.target.matches('[data-allocation]') ? 'allocation' : 'rate'] = event.target.value;
    engine.proofBundle = null;engine.review = null;engine.message = 'Settings changed. Generate a proof for these settings before reviewing the payout.';engine.notify();
  });
  find('[data-review]').addEventListener('cancel', event => {event.preventDefault();engine.cancelReview();});
  function renderLesson(selected) {
    const lesson = browserLessons[selected];
    // Network polls do not replace lesson content, inputs, disclosures or focus.
    const key = selected + ':' + engine.records.map(r => r.step + ':' + !!r.acceptingBlock).join(',') + ':' + !!engine.proofBundle;
    if (key === lessonKey) return; lessonKey = key;
    const oldDetails = [...find('[data-lesson-content]').querySelectorAll('details')].map(d => d.open);
    const focusedStep = document.activeElement?.dataset?.step;
    const oldScroll = root.closest('main')?.scrollTop;
    const withdrawn = selected === 3 && [0,1,2].some(i => engine.accepted('greenhouse-withdraw' + i));
    const complete = engine.completed.includes(selected);
    const steps = withdrawn ? lesson.alternatives : lesson.steps;
    const next = steps.find(step => !engine.accepted(step.id));
    const stepMarkup = (step, alternative = false) => {
      const saved = engine.records.find(record => record.step === step.id), accepted = !!saved?.acceptingBlock;
      const current = step.id === next?.id || !!saved && !accepted || alternative;
      return `<li class="${accepted ? 'is-done' : saved ? 'is-pending' : ''}"><span class="harbor-step-mark">${accepted ? '✓' : saved ? '…' : '○'}</span><div><strong>${esc(step.title)}</strong>${current ? `<p>${esc(step.effect)}</p>` : ''}${saved ? `<small>${accepted ? 'Accepted' : 'Saved; awaiting acceptance'} · ${receipt(saved)}</small>` : current ? `${button('prepare','Review transaction', `data-step="${step.id}" ${step.id !== next?.id ? 'disabled' : ''}`)}<small>${esc(step.cost)} + network fee shown in review</small>` : `<small>Later · ${esc(step.cost)}</small>`}</div></li>`;
    };
    find('[data-lesson-content]').innerHTML = `<p class="harbor-kicker">Lesson ${selected + 1} · ${esc(lesson.question)}</p><h2 tabindex="-1">${esc(lesson.title)}</h2><p class="harbor-problem">${esc(lesson.problem)}</p><div class="harbor-rule"><span>The rule the network checks</span><p>${esc(lesson.rule)}</p></div><details><summary>What could go wrong without this rule?</summary><p>${esc(lesson.comparison)}</p><p>This explanation is a local comparison. It does not send a deliberately invalid transaction.</p></details><details><summary>What this example does and what it cannot prove</summary><p>${esc(lesson.boundary)}</p></details>${complete ? `<div class="harbor-outcome"><strong>${withdrawn ? 'The pledges were withdrawn.' : 'Lesson complete'}</strong><p>${esc(withdrawn ? 'Each remaining pledge returned to its owner. No group payout occurred.' : lesson.result)}</p>${selected < 5 ? button('next','Explore the next lesson') : '<p>You have completed the six contract examples. Your receipts remain available below.</p>'}</div>` : ''}<ol class="harbor-steps">${steps.map(step => stepMarkup(step)).join('')}</ol>${selected === 5 && engine.accepted('proof-open') && !engine.accepted('proof-redeem') ? `<section class="harbor-proof"><h3>Choose the machine settings</h3><label>First setting <input type="number" min="1" max="15" value="${esc(proofDraft.allocation)}" data-allocation></label><label>Second setting <input type="number" min="1" max="15" value="${esc(proofDraft.rate)}" data-rate></label>${button('proof',engine.proofBundle ? 'Generate proof again' : 'Generate proof')}<p>Generating a proof does not sign or send a transaction. It calls the hosted proof helper.</p><p data-proof-check>${engine.proofBundle ? `Generated proof: first setting ${esc(engine.proofBundle.allocation)}, second setting ${esc(engine.proofBundle.rate)}.` : ''}</p></section>` : ''}${lesson.alternatives && !withdrawn ? `<details class="harbor-alternatives"><summary>${selected === 3 ? 'Prefer to withdraw? Explore the exit' : 'Optional: try the refund branch'}</summary><p>${selected === 3 ? 'Withdrawing any pledge prevents this group from settling. You can then withdraw the other two.' : 'This opens an additional contract and spends additional network fees.'}</p><ol class="harbor-steps">${lesson.alternatives.map(step => stepMarkup(step,true)).join('')}</ol></details>` : ''}`;
    if (chapter === selected) {
      [...find('[data-lesson-content]').querySelectorAll('details')].forEach((d,i) => {d.open = oldDetails[i] || false;});
      if (focusedStep) find(`[data-step="${focusedStep}"]`)?.focus({preventScroll:true});
      if (oldScroll !== undefined) root.closest('main').scrollTop = oldScroll;
    }
    chapter = selected;
  }
  function render() {
    const selected = Math.max(0, Math.min(5, Number(wallet.data.selected) || 0));
    find('[data-progress]').textContent = `${engine.completed.length} of 6 complete`;
    find('[data-balance]').textContent = v6Coins(wallet.balances[0]);
    find('[data-network]').textContent = wallet.ready ? wallet.network : 'Create a wallet, then request 10 free test coins';
    const readyKey = `${wallet.ready}:${!!wallet.data.faucet?.id}:${!!wallet.data.faucet?.acceptingBlock}`;
    if (walletKey !== readyKey) {
      walletKey = readyKey;
      find('[data-wallet-actions]').innerHTML = !wallet.ready ? button('create','Create my test wallet') : `${!wallet.data.faucet?.acceptingBlock ? button('faucet', wallet.data.faucet ? 'Check / retry my 10-coin request' : 'Get 10 free test coins') : ''}${button('refresh','Refresh balances')}`;
    }
    find('[data-wallet-note]').textContent = !wallet.ready ? 'Creating the wallet makes no transaction. The next button requests test coins.' : wallet.data.faucet?.acceptingBlock ? 'Test coins received. Deposits, payments and fees reduce your available balance; contract balances are shown separately.' : wallet.data.faucet?.id ? 'The faucet transaction is saved. Waiting for an accepting-block observation; no second claim is created.' : 'Your wallet is ready. Requesting coins is a separate action.';
    let held = 0n; try {if (engine.templates) for (const cell of engine.cells().values()) held += cell.amount;} catch {}
    find('[data-wallet-balances]').textContent = `Main available: ${v6Coins(wallet.balances[0])} · Other demo accounts: ${v6Coins(wallet.balances[1] + wallet.balances[2])} · In lesson contracts: ${v6Coins(held)} test coins. Balances reflect the last node check.`;
    find('[data-addresses]').innerHTML = wallet.addresses.map((address,i) => `<p>${['Main / recipient','Seller / courier / worker','Pip / customer'][i]}<code>${esc(address)}</code></p>`).join('');
    for (const button of root.querySelectorAll('[data-chapter]')) {button.setAttribute('aria-current',Number(button.dataset.chapter) === selected ? 'step' : 'false');button.querySelector('small').textContent = engine.completed.includes(Number(button.dataset.chapter)) ? '✓' : '';}
    renderLesson(selected);
    const review = engine.review, key = review ? `${review.step}:${review.createdAt}` : '';
    if (reviewKey !== key) {
      reviewKey = key; if (!review && find('[data-review]').open) find('[data-review]').close();
      if (review) {
        const action = browserAction(review.step), tx = review.plan.transaction;
        find('[data-review]').innerHTML = `<p class="harbor-kicker">Your approval · one transaction</p><h3>${esc(review.title)}</h3><p>${esc(action.effect)}</p><dl><dt>Movement</dt><dd>${esc(action.cost)}</dd><dt>Exact network fee</dt><dd>${v6Coins(review.plan.fee)} test coins</dd><dt>Network</dt><dd>Kaspa Testnet-10</dd></dl><p>Your browser will sign with the required demo keys, save the signed transaction, and submit it once. Review expires after two minutes.</p><details><summary>Inspect exact outputs</summary><ol>${[...tx.outputs].map(output => `<li>${v6Coins(output.value)} test coins · <code>${esc(wallet.sdk.addressFromScriptPublicKey(output.scriptPublicKey,'testnet-10')?.toString() || output.scriptPublicKey.script)}</code></li>`).join('')}</ol></details><div class="harbor-buttons">${button('confirm','Approve, sign and send', 'class="harbor-primary"')}${button('cancel','Cancel review')}</div>`;
        if (!find('[data-review]').open) find('[data-review]').showModal();
      }
    }
    const pending = engine.pending, pkey = pending ? `${pending.id}:${pending.phase}:${!!pending.storageUncertain}` : '';
    if (pendingKey !== pkey) {
      pendingKey = pkey; find('[data-pending]').innerHTML = pending ? `<strong>${esc(pending.title)}</strong><p>${pending.storageUncertain ? 'Saving failed before submission. This transaction was not sent. Keep this tab open; save a recovery file and retry saving before any submission.' : 'The exact transaction is saved. You can explore any lesson while its acceptance is checked. No other transaction will be signed until this one resolves.'}</p><p>${receipt(pending)} · <code>${esc(pending.id)}</code></p><div class="harbor-buttons">${button('check','Check status (no sending)')}${button('retry','Retry this exact transaction')}</div>` : '';
    }
    find('[data-message]').textContent = engine.busy ? (engine.message || 'Working on your request…') : engine.message;
    find('[data-notice]').hidden = !engine.message && !engine.error && !engine.busy;
    const nextNotice = `${engine.message}:${engine.error}:${engine.busy}`;
    if (noticeKey !== nextNotice) {
      noticeKey = nextNotice; clearTimeout(noticeTimer);
      if (engine.message && !engine.error && !engine.busy) noticeTimer = setTimeout(() => onAction('dismiss'), 6000);
    }
    find('[data-error]').hidden = !engine.error; find('[data-error]').textContent = engine.error || '';
    const rkey = engine.records.map(r => r.id + !!r.acceptingBlock).join(',');
    if (receiptsKey !== rkey) {receiptsKey = rkey;find('[data-receipt-count]').textContent = engine.records.length;find('[data-receipts]').innerHTML = [...engine.records].reverse().map(r => `<li>${receipt(r)}<span>${r.acceptingBlock ? 'Accepted' : 'Unresolved'} · ${v6Coins(r.fee ?? r.journal.fee)} fee</span><code>${esc(r.id)}</code></li>`).join('');}
    for (const input of root.querySelectorAll('[data-allocation],[data-rate]')) input.disabled = engine.busy;
    for (const control of root.querySelectorAll('[data-action]')) {
      const action = control.dataset.action;
      if (action === 'prepare') {
        let available = wallet.ready && !engine.pending && !engine.busy;
        try {engine.assertStep(control.dataset.step);} catch {available = false;}
        if (control.dataset.step === 'proof-redeem' && !engine.proofBundle) available = false;
        if (control.dataset.step === 'greenhouse-settle' && [0,1,2].some(i => engine.accepted('greenhouse-withdraw' + i))) available = false;
        control.disabled = !available;
      } else control.disabled = action !== 'dismiss' && (engine.busy || (['backup','refresh','proof'].includes(action) && !wallet.ready));
    }
  }
  return {render, find, scene:find('[data-scene]'), dag:find('[data-dag]')};
}
