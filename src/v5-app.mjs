import {mountV5Town} from './v5-town.mjs';
import {createV5Wallet, V5_WALLET_STORE} from './v5-wallet.mjs';

const explorer = id => 'https://tn10.kaspa.stream/transactions/' + id;

/** Browser orchestration. All game changes come back from the service. */
export function mountV5App(root, options = {}) {
  const wallet = options.wallet || createV5Wallet(options.walletOptions);
  let current = wallet.snapshot(), network = {label: 'Testnet-10', status: 'Connect your wallet', blocks: []};
  const advancedReceiptsSeen = new Set(), acceptedPaymentsSeen = new Set();
  let receiptPlayer = null;
  let busy = false, error = '', status = '', disposed = false, timer = null, lastNetworkAt = 0, pollWork = null;

  function render() {
    const receipts = [...Object.values(current.state?.receipts || {}),...(current.marketReceipts || []),...(current.advanced?.receipts||[])].map(receipt => ({
      ...receipt, id: receipt.transactionId, status: 'accepted',
      label: ({'ring-genesis':'Three contract stores opened',ring:'Three-way exchange accepted','role-funding':'Demo accounts prepared','delivery-open':'Payment and bond locked','delivery-release':'Courier paid','refund-open':'Second delivery agreement opened','delivery-refund':'Customer refunded'}[receipt.operation]) || (receipt.kind === 'market' ? ({genesis:'Trading store opened',restock:'Trading supplies added',configure:'Pip’s budget updated',trade:'Market trade accepted',fund:'Business transfer accepted'}[receipt.operation] || 'Market transaction') : receipt.kind === 'reward' ? 'Order payment received' : 'Harbor purchase'),
      url: explorer(receipt.transactionId),
    })).sort((a, b) => b.at - a.at);
    const payment = current.payment;
    const firstPlayerSnapshot = Boolean(current.playerId) && receiptPlayer !== current.playerId;
    if (firstPlayerSnapshot) {
      // A restored snapshot is evidence of past work, not a new scene event.
      receiptPlayer = current.playerId;
      advancedReceiptsSeen.clear(); acceptedPaymentsSeen.clear();
    }
    const animateAccepted = Boolean(current.playerId) && !firstPlayerSnapshot;
    if (payment?.transactionId && !receipts.some(receipt => receipt.id === payment.transactionId)) receipts.unshift({
      ...payment, id: payment.transactionId,
      label: payment.kind === 'market' ? 'Market transaction' : payment.kind === 'reward' ? 'Order payment' : 'Harbor purchase', url: explorer(payment.transactionId),
    });
    ui.render({...current.view, state:current.state, market: current.market || current.view?.market, payment:current.payment,advanced:current.advanced,
      wallet: {connected: Boolean(current.playerId), address: current.address,
        balanceSompi: current.balanceSompi, busy, status},
      network, receipts, busy, error, status,
      actionHint: current.journal && !current.journal.accepted ? 'Your payment is saved. Check its receipt before another purchase.' : undefined,
    });
    const advancedPayment=current.advanced?.pending;if(advancedPayment?.transactionId)ui.transaction({id:advancedPayment.transactionId,status:advancedPayment.status,acceptingBlock:advancedPayment.acceptingBlock,operation:current.advanced?.visual?.operation,kind:'bundle'});
    for (const receipt of current.advanced?.receipts || []) {
      if (animateAccepted && !advancedReceiptsSeen.has(receipt.transactionId)) ui.transaction({...receipt,id:receipt.transactionId,status:'accepted',acceptingBlock:receipt.acceptingBlock,kind:'bundle'});
      advancedReceiptsSeen.add(receipt.transactionId);
    }
    if (payment?.transactionId) {
      if (payment.status !== 'accepted' || (animateAccepted && !acceptedPaymentsSeen.has(payment.transactionId))) ui.transaction({id:payment.transactionId,status:payment.status,acceptingBlock:payment.acceptingBlock,operation:payment.marketPlan?.operation,kind:payment.kind,purpose:payment.marketPlan?.purpose});
      if (payment.status === 'accepted') acceptedPaymentsSeen.add(payment.transactionId);
    }
    while (advancedReceiptsSeen.size > 256) advancedReceiptsSeen.delete(advancedReceiptsSeen.values().next().value);
    while (acceptedPaymentsSeen.size > 256) acceptedPaymentsSeen.delete(acceptedPaymentsSeen.values().next().value);
  }

  async function refresh({retry = false} = {}) {
    if (!current.address) return;
    if (retry && current.payment?.kind === 'market') current = await wallet.retryPayment();
    else if (retry && current.journal && !current.journal.accepted) current = await wallet.retryPayment();
    else if (retry && current.pendingAction) current = await wallet.action(current.pendingAction);
    else current = await wallet.status();
    await wallet.getBalance(); current = wallet.snapshot();
    if (Date.now() - lastNetworkAt > 15000) {
      try { network = await wallet.getNetwork(); lastNetworkAt = Date.now(); }
      catch { network = {...network, status: 'Reconnecting'}; }
    }
    render();
  }

  async function run(message, work) {
    if (busy || disposed) return;
    busy = true; error = ''; status = message; render();
    try { if (pollWork) await pollWork; await work(); }
    catch (failure) { current = wallet.snapshot(); error = failure.safeMessage || failure.message || 'The action could not finish. Your saved progress is available.'; }
    finally { busy = false; status = ''; if (!disposed) render(); }
  }

  function recoveryDialog(mode) {
    return new Promise(resolve => {
      const dialog = document.createElement('dialog'); dialog.className = 'v5-dialog';
      dialog.innerHTML = `<form><div class="v5-dialog-header"><h2>${mode === 'export' ? 'Save your wallet' : 'Restore your wallet'}</h2><button type="button" data-close>Cancel</button></div><p>${mode === 'export' ? 'Choose a password for your recovery file. Keep the file and password so you can return from another browser.' : 'Choose your V5 recovery file and enter its password.'}</p>${mode === 'restore' ? '<p><label>Recovery file <input type="file" accept=".json,application/json" required></label></p>' : ''}<p><label>Password <input type="password" autocomplete="off" minlength="12" required></label></p><p data-error role="alert"></p><div class="v5-dialog-actions"><button class="v5-primary" type="submit">${mode === 'export' ? 'Download recovery file' : 'Restore wallet'}</button></div></form>`;
      root.append(dialog); const finish = () => { dialog.close(); dialog.remove(); resolve(); };
      dialog.querySelector('[data-close]').addEventListener('click', finish);
      dialog.addEventListener('cancel', event => { event.preventDefault(); finish(); });
      dialog.querySelector('form').addEventListener('submit', async event => {
        event.preventDefault(); const button = dialog.querySelector('[type=submit]'); button.disabled = true;
        try {
          const password = dialog.querySelector('[type=password]').value;
          if (mode === 'export') {
            const content = await wallet.exportRecovery(password), url = URL.createObjectURL(new Blob([content], {type: 'application/json'}));
            const link = document.createElement('a'); link.href = url; link.download = 'sprout-harbor-wallet.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
          } else {
            const file = dialog.querySelector('[type=file]').files[0];
            if (!file || file.size > 700000) throw Error('Choose a V5 wallet recovery file.');
            current = await wallet.restoreRecovery(await file.text(), password); await refresh();
          }
          finish();
        } catch (failure) { dialog.querySelector('[data-error]').textContent = failure.message; button.disabled = false; }
      });
      dialog.showModal();
    });
  }

  const ui = mountV5Town(root, {
    onWallet: () => run('Opening your wallet…', async () => {
      current = await wallet.start(); await wallet.getBalance(); current = wallet.snapshot();
      if (BigInt(current.balanceSompi || 0) === 0n) current = await wallet.requestCoins();
      await refresh();
    }),
    onAction: (type, payload = {}) => run('Updating your harbor…', async () => {
      if (type === 'request_coins') current = await wallet.requestCoins();
      else { const {actionId, ...fields} = payload; current = await wallet.action({type, ...fields, id: fields.id || actionId || crypto.randomUUID()}); }
      await refresh();
    }),
    onRefresh: () => run('Checking your saved receipt…', () => refresh({retry: true})),
    onExport: () => recoveryDialog('export'),
    onRestore: () => recoveryDialog('restore'),
  });

  async function poll() {
    if (disposed) return;
    if (!busy && !document.hidden && current.playerId) {
      pollWork = (async () => { try { await refresh(); if (!busy) error = ''; } catch (failure) { if (!busy) { error = failure.message; render(); } } })();
      await pollWork; pollWork = null;
    }
    if (!disposed) timer = setTimeout(poll, current.advanced?.pending || current.payment && current.payment.status !== 'accepted' ? 2500 : 7000);
  }
  render();
  try { if ((options.storage || localStorage).getItem(V5_WALLET_STORE)) void run('Restoring your harbor…', async () => { current = await wallet.restore(); await refresh(); }); } catch {}
  timer = setTimeout(poll, 2000);
  return {wallet, refresh, destroy() { disposed = true; clearTimeout(timer); ui.destroy(); void wallet.disconnect(); }};
}

if (typeof document !== 'undefined') for (const root of document.querySelectorAll('[data-v5-app]')) mountV5App(root);
