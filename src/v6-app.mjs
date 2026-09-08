import {V6BrowserWallet, v6Coins, v6Call, v6Hash} from './v6-browser-wallet.mjs';
import {V6BrowserEngine} from './v6-browser-engine.mjs';
import {mountBrowserUI} from './v6-browser-ui.mjs';
import {browserLessons, browserAction} from './v6-browser-lessons.mjs';
import {mountV6World} from './v6-world.mjs';
import {mountV6Dag} from './v6-dag.mjs';

export async function mountBrowserHarbor(root, options = {}) {
  document.body.classList.add('v6-page');
  let ui, world, dag, disposed = false, poll = null, feedRpc = null, feedOn = true, feedPaint = null;
  let network = {status:'idle', blocks:[], lastEventAt:0}, presentation = null, legacy = null;
  const wallet = options.wallet || new V6BrowserWallet({onChange:() => render()});
  const engine = options.engine || new V6BrowserEngine(wallet);
  engine.onChange = () => render();
  engine.onAccepted = record => {
    presentation = {freshAcceptance:true, transactionId:record.id, startedAt:Date.now()};
    world?.update(scene(record)); render();
  };
  function scene(fresh = null) {
    const has = id => !!engine.accepted(id), selected = Number(wallet.data.selected) || 0;
    const cells = engine.templates ? engine.cells() : new Map();
    const inventory = {};
    for (const [i,name] of ['grower','toolmaker','miner'].entries()) {const cell = cells.get('ring-' + i);if (cell) inventory[name] = {crops:cell.state.crops,tools:cell.state.tools,ore:cell.state.ore};}
    const buyer = cells.get('purchase-buyer'); if (buyer) inventory.buyer = {tools:buyer.state.tools};
    const pip = cells.get('pip-buyer');
    const operation = {'purchase-buy':'purchase','pip-pay':'pip-allow','ring-settle':'ring','greenhouse-settle':'greenhouse-settle','courier-deliver':'delivery-release','refund-claim':'delivery-refund','proof-redeem':'proof-verified'}[fresh?.step] || (fresh?.step?.startsWith('greenhouse-withdraw') ? 'withdraw' : fresh?.step?.startsWith('greenhouse-ready') ? 'pledge' : null);
    return {chapter:selected,district:browserLessons[selected].district,phase:'intro',accepted:true,eventId:fresh?.id || null,operation,paused:document.hidden,progress:{completed:engine.completed.filter(i => i !== 3 || has('greenhouse-settle'))},inventory,result:{
      toolReceived:has('purchase-buy'),
      pip:{allowanceSompi:pip?.state.allow_coin || 0,receivedWood:pip?.state.wood || 0,revoked:has('pip-revoke')},
      greenhouse:{built:has('greenhouse-settle'),pledges:[0,1,2].map(i => ({state:cells.has('greenhouse-' + i) ? (has('greenhouse-ready' + i) ? 'accepted' : 'locked') : 'absent'}))},
      courier:{paymentSompi:has('courier-open')?'20000000':'0',bondSompi:has('courier-open')?'10000000':'0',delivered:has('courier-deliver'),receiptPresent:has('courier-deliver'),refund:has('refund-claim')},
      proof:{machineOn:has('proof-redeem')},
    }};
  }
  function render() {
    if (!ui || disposed) return;
    ui.render();
    const feedControl = ui.find('[data-action="feed"]');
    if (feedControl) feedControl.textContent = !wallet.rpc ? 'Connect live blocks' : feedOn ? 'Pause live blocks' : 'Resume live blocks';
    if (engine.templates) {try {world?.update(scene());} catch (error) {engine.error = error.message;}}
    const selectedRecords = engine.records.filter(record => record.chapter === Number(wallet.data.selected));
    dag?.update(network,engine.pending || selectedRecords.at(-1) || null,presentation);
    scheduleCheck();
  }
  function observeBlock(event) {
    const block = event?.data?.block || event?.block, header = block?.header, hash = header?.hash || block?.verboseData?.hash;
    if (!feedOn || document.hidden || !v6Hash(hash) || network.blocks.some(b => b.hash === hash)) return;
    network.blocks.push({hash,parents:(header.parentsByLevel?.[0] || []).filter(v6Hash),daaScore:String(header.daaScore),observedAt:Date.now()});
    network.blocks = network.blocks.slice(-96);network.status = 'live';network.lastEventAt = Date.now();
    if (!feedPaint) feedPaint = setTimeout(() => {feedPaint = null;render();},150);
  }
  async function startFeed() {
    if (disposed || !feedOn || document.hidden || !wallet.rpc || feedRpc === wallet.rpc) return;
    if (feedRpc) {feedRpc.removeEventListener?.('block-added',observeBlock);try {await feedRpc.unsubscribeBlockAdded?.();} catch {}}
    feedRpc = wallet.rpc;feedRpc.addEventListener?.('block-added',observeBlock);network.status = 'connecting';
    try {await v6Call(feedRpc.subscribeBlockAdded());const {sink} = await v6Call(feedRpc.getSink());const response = await v6Call(feedRpc.getBlock({hash:sink,includeTransactions:false}));observeBlock({block:response.block});}
    catch {network.status = 'disconnected';render();}
  }
  async function stopFeed() {
    network.status = 'paused';render();
    const rpc = feedRpc;feedRpc = null;
    rpc?.removeEventListener?.('block-added',observeBlock);try {await rpc?.unsubscribeBlockAdded?.();} catch {}
    render();
  }
  function scheduleCheck() {
    if (poll || disposed || document.hidden || !wallet.ready || engine.busy || engine.checking || !(engine.pending || wallet.data.faucet?.id && !wallet.data.faucet.acceptingBlock)) return;
    poll = setTimeout(async () => {poll = null;await engine.run(() => engine.check());await startFeed();},5000);
  }
  async function selectChapter(index) {
    if (!Number.isInteger(index) || index < 0 || index > 5) return;
    wallet.data.selected = index;engine.review = null;presentation = null;render();world?.select(index);
    if (wallet.ready) {try {await wallet.save();} catch {engine.error = 'The selected lesson could not be saved. Existing transactions remain in this tab.';render();}}
  }
  async function action(name, step) {
    if (name === 'dismiss') {engine.message = '';engine.error = null;render();return;}
    if (name === 'next') {await selectChapter(Math.min(5,Number(wallet.data.selected) + 1));return;}
    if (name === 'cancel') {engine.cancelReview();return;}
    if (name === 'import') {ui.find('[data-import-file]').click();return;}
    if (name === 'feed') {feedOn = !wallet.rpc || !feedOn;ui.find('[data-action="feed"]').textContent = feedOn ? 'Pause live blocks' : 'Resume live blocks';if (feedOn) {await engine.run(() => wallet.connect());await startFeed();} else await stopFeed();return;}
    await engine.run(async () => {
      if (name === 'create') {await wallet.create();await engine.load();engine.message = 'Wallet created. No coins requested and no transaction sent.';}
      else if (name === 'faucet') {await wallet.requestCoins();engine.message = wallet.data.faucet?.acceptingBlock ? 'The 10 free test coins were accepted into your wallet.' : 'The faucet transaction is saved and being checked.';}
      else if (name === 'refresh' || name === 'check') await engine.check();
      else if (name === 'prepare') await engine.prepare(step,browserAction(step).title);
      else if (name === 'confirm') await engine.confirm();
      else if (name === 'retry') {await engine.retry();if (engine.pending) engine.pending.storageUncertain = false;}
      else if (name === 'proof') await engine.generateProof(Number(ui.find('[data-allocation]').value),Number(ui.find('[data-rate]').value));
      else if (name === 'backup') {
        const password = ui.find('[data-backup-password]').value, envelope = await wallet.backup(password);
        const url = URL.createObjectURL(new Blob([JSON.stringify(envelope)],{type:'application/json'}));
        const link = document.createElement('a');link.href = url;link.download = 'sprout-harbor-wallet-' + wallet.data.id + '.json';link.click();setTimeout(() => URL.revokeObjectURL(url),10000);
        ui.find('[data-backup-password]').value = '';ui.find('[data-backup-result]').textContent = 'Recovery file prepared for download. Keep it and its password. Save another copy after later transactions.';
      } else if (name === 'legacy-check') await checkLegacy();
    });
    await startFeed();
  }
  async function checkLegacy() {
    if (!legacy) return;
    const response = await fetch('/api/v6/status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:legacy.id,capability:legacy.capability}),signal:AbortSignal.timeout(30000)});
    const result = await response.json();if (!response.ok) throw Error(result.error || 'The earlier session could not be checked.');
    legacy.snapshot = result.session;localStorage.setItem('kaspa-v6-local-session-v1',JSON.stringify(legacy));renderLegacy();
    engine.message = 'Earlier session checked without signing or resubmitting.';
  }
  function renderLegacy() {
    const panel = ui.find('[data-legacy]');if (!legacy) return;
    panel.hidden = false;
    // Construct text nodes for old server data; never treat a saved title as markup.
    panel.replaceChildren();const title = document.createElement('h2');title.textContent = 'Your earlier hosted session';panel.append(title);
    const text = document.createElement('p');text.textContent = 'Your previous session is preserved separately. Checking it only observes its saved transaction; it does not continue the old setup sequence.';panel.append(text);
    const record = legacy.snapshot?.operation || legacy.snapshot?.pending;
    if (record) {const status = document.createElement('p');status.textContent = (record.title || record.name || record.operation || 'Saved transaction') + (record.acceptingBlock ? ' · accepted' : ' · saved status needs checking');panel.append(status);const id = record.transactionId || record.id;if (v6Hash(id)) {const link = document.createElement('a');link.textContent = 'Inspect earlier transaction ↗';link.href = 'https://tn10.kaspa.stream/transactions/' + id;link.target = '_blank';link.rel = 'noopener';panel.append(link);}}
    const check = document.createElement('button');check.type = 'button';check.dataset.action = 'legacy-check';check.textContent = 'Check earlier saved session';panel.append(check);
  }
  ui = mountBrowserUI(root,{wallet,engine,onAction:action,onChapter:selectChapter});
  dag = mountV6Dag(ui.dag);
  const feedButton = document.createElement('button');feedButton.type = 'button';feedButton.dataset.action = 'feed';feedButton.textContent = 'Pause live blocks';ui.dag.append(feedButton);
  ui.find('[data-import-file]').addEventListener('change',async event => {
    const file = event.target.files?.[0];if (!file) return;
    await engine.run(async () => {if (file.size > 9000000) throw Error('This recovery file is too large.');await wallet.importBackup(JSON.parse(await file.text()),ui.find('[data-backup-password]').value);ui.find('[data-backup-password]').value = '';await engine.load();await engine.check();engine.message = 'Wallet restored. Saved transactions were checked without signing or resubmitting.';});event.target.value = '';await startFeed();
  });
  try {const saved = JSON.parse(localStorage.getItem('kaspa-v6-local-session-v1') || 'null');if (/^[a-f0-9-]{36}$/i.test(saved?.id || '') && /^[a-f0-9]{64}$/i.test(saved?.capability || '')) legacy = saved;} catch {}
  renderLegacy();render();
  const makeWorld = options.mountWorld || mountV6World;
  void makeWorld(ui.scene,{onSelect:district => {const index = browserLessons.findIndex(lesson => lesson.district === district);if (index >= 0) void selectChapter(index);}}).then(value => {if (disposed) {value.destroy();return;}world = value;ui.find('[data-scene-loading]')?.remove();world.update(scene());}).catch(() => {const note = ui.find('[data-scene-loading]');if (note) note.textContent = 'The harbor illustration could not load. All lesson controls and transaction receipts remain available.';});
  await engine.run(async () => {if (!wallet.ready && !await wallet.restore()) return;await engine.load();await engine.check();engine.message = 'Saved wallet restored. No transaction was signed or resubmitted.';});
  await startFeed();
  const visible = () => {if (document.hidden) {clearTimeout(poll);poll = null;void stopFeed();} else {render();void startFeed();}};
  document.addEventListener('visibilitychange',visible);
  function destroy() {disposed = true;clearTimeout(poll);clearTimeout(feedPaint);document.removeEventListener('visibilitychange',visible);world?.destroy();dag?.destroy();void wallet.close();}
  window.addEventListener('pagehide',destroy,{once:true});
  return {wallet,engine,ui,inspectWorld:() => world?.inspect(),destroy};
}
const root = document.querySelector('[data-v6-app]');
if (root) void mountBrowserHarbor(root);
