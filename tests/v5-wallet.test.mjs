import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {createV5Wallet, V5_WALLET_STORE, buildV5WalletPayment, v5WalletSessionMessage} from '../src/v5-wallet.mjs';
import {V5Service, v5SessionMessage, validateV5Payment} from '../faucet/v5-service.mjs';
const sdk = createRequire(import.meta.url)('../.cache/upstream/kaspa-wasm32-sdk/nodejs/kaspa');
const treasuryKey = new sdk.PrivateKey('51'.repeat(32)), treasuryAddress = treasuryKey.toAddress('testnet-10').toString();
const utxo = (address, tag, amount = 10000000000n) => new sdk.UtxoEntries([{outpoint: {transactionId: tag.repeat(32), index: 0}, amount, scriptPublicKey: sdk.payToAddressScript(new sdk.Address(address)), blockDaaScore: 0n, isCoinbase: false}]).items[0];
const storage = () => { const values = new Map(); return {getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k)}; };

function fixture() {
  const browser = storage(), records = new Map(), accepted = new Set(), sent = [], requests = [], playerEntries = new Map(), chainEntries = [utxo(treasuryAddress, '01')];
  const flags = {loseRegistration: false, loseSubmission: false, badRegistration: false, wrongNetwork: false, marketChain: false};
  const serverStorage = {get: async key => structuredClone(records.get(key)), put: async values => { for (const [key, value] of Object.entries(values)) records.set(key, structuredClone(value)); }};
  const rpc = {
    getServerInfo: async () => ({networkId: flags.wrongNetwork ? 'mainnet' : 'testnet-10', isSynced: true, hasUtxoIndex: true}),
    getSink: async () => ({sink: 'ab'.repeat(32)}),
    getFeeEstimate: async () => ({estimate: {priorityBucket: {feerate: 100}}}),
    getUtxosByAddresses: async ([address]) => ({entries: flags.marketChain ? chainEntries.filter(entry => sdk.addressFromScriptPublicKey(entry.entry.scriptPublicKey, 'testnet-10')?.toString() === address) : address === treasuryAddress ? [utxo(address, '01')] : playerEntries.get(address) || []}),
    getVirtualChainFromBlock: async () => ({removedChainBlockHashes: [], addedChainBlockHashes: [], acceptedTransactionIds: [{acceptingBlockHash: 'cd'.repeat(32), acceptedTransactionIds: [...accepted]}]}),
    submitTransaction: async ({transaction}) => {
      const paymentId = records.get('v5:transaction:' + transaction.id), payment = records.get('v5:payment:' + paymentId);
      assert(payment, 'Backend registration must precede broadcast');
      assert.equal(payment.transaction, transaction.serializeToSafeJSON(), 'Registration bytes must match broadcast bytes');
      assert(browser.getItem(V5_WALLET_STORE), 'Browser recovery must precede broadcast');
      sent.push(transaction.serializeToSafeJSON());
      if (flags.marketChain) {
        for (const input of transaction.inputs) { const index = chainEntries.findIndex(entry => entry.outpoint.transactionId === input.previousOutpoint.transactionId && entry.outpoint.index === input.previousOutpoint.index); if (index >= 0) chainEntries.splice(index, 1); }
        transaction.outputs.forEach((output, index) => chainEntries.push(new sdk.UtxoEntries([{outpoint: {transactionId: transaction.id, index}, amount: output.value, scriptPublicKey: output.scriptPublicKey, blockDaaScore: 0n, isCoinbase: false, ...(output.covenant ? {covenant_id: output.covenant.covenantId.toString()} : {})}]).items[0]));
      }
      if (flags.loseSubmission) throw Error('Lost submission response');
      return {transactionId: transaction.id};
    },
    disconnect: async () => {},
  };
  const service = new V5Service({storage: serverStorage, env: {FAUCET_KEY: '51'.repeat(32), V5_ENABLED: 'true'}, sdk, rpc, key: treasuryKey, address: treasuryAddress, entries: [utxo(treasuryAddress, '01')], now: () => 1000000});
  const fetcher = async (url, options) => {
    if (url.endsWith('/assets/v5-argent-templates.json')) return Response.json(JSON.parse(readFileSync(new URL('../src/v5-argent-templates.json', import.meta.url))));
    const body = JSON.parse(options.body); requests.push({url, body});
    assert(!('privateKey' in body) && !('keys' in body) && !('secret' in body));
    if (url.endsWith('/api/faucet')) { playerEntries.set(body.address, [utxo(body.address, 'fe', 1000000000n)]); return Response.json({network: 'testnet-10', amount: '1000000000', transactionId: 'fe'.repeat(32), status: 'submitted'}); }
    const result = await service.handle(new Request(url, options));
    if (url.endsWith('/payment') && body.transaction && flags.loseRegistration) throw Error('Lost registration response');
    if (url.endsWith('/payment') && body.transaction && flags.badRegistration) { const value = await result.json(); value.payment.transactionId = 'dd'.repeat(32); return Response.json(value); }
    return result;
  };
  const make = (saved = browser) => createV5Wallet({sdk, rpc, fetch: fetcher, storage: saved});
  const wallet = make();
  const start = async () => { const value = await wallet.start(); playerEntries.set(value.address, [utxo(value.address, '02')]); return value; };
  const enableMarketChain = address => { flags.marketChain = true; for (const entry of playerEntries.get(address) || []) if (!chainEntries.some(existing => existing.outpoint.transactionId === entry.outpoint.transactionId && existing.outpoint.index === entry.outpoint.index)) chainEntries.push(entry); };
  return {wallet, make, browser, records, accepted, sent, requests, flags, start, playerEntries, service, enableMarketChain};
}

test('V5 wallet starts, authenticates, observes balance, restores and exports password recovery without exposing keys', async () => {
  const f = fixture(), first = await f.start();
  assert.equal(first.network, 'testnet-10'); assert.equal(first.state.upgrades.plots, 0);
  assert.equal(v5WalletSessionMessage(first.address, 'ab'), v5SessionMessage(first.address, 'ab'));
  assert.equal((await f.wallet.getBalance()).amountSompi, '10000000000');
  const restored = await f.make().restore(); assert.equal(restored.address, first.address); assert.equal(restored.playerId, first.playerId);
  // Restore persisted a new envelope, so the original instance must not overwrite it.
  await assert.rejects(f.wallet.exportRecovery('correct horse battery'), /another tab/);
  const fresh = f.make(); await fresh.restore();
  const exported = await fresh.exportRecovery('correct horse battery');
  assert.equal(JSON.parse(exported).kdf, 'PBKDF2-SHA256'); assert(!exported.includes('privateKey')); assert(!exported.includes('secret'));
  const imported = f.make(storage()); await assert.rejects(imported.restoreRecovery(exported, 'wrong password'), /password/);
  assert.equal((await imported.restoreRecovery(exported, 'correct horse battery')).address, first.address);
  assert(!JSON.stringify(imported.snapshot()).includes('privateKey')); assert(!JSON.stringify(imported.snapshot()).includes('capability'));
  await assert.rejects(imported.exportRecovery('short'), /12 characters/);
});

test('purchase registration precedes broadcast and acceptance alone applies the authoritative upgrade', async () => {
  const f = fixture(); await f.start();
  const pending = await f.wallet.action({id: 'buy-one', type: 'buy_plot'});
  assert.equal(f.sent.length, 1); assert.equal(pending.state.upgrades.plots, 0); assert.equal(pending.journal.registered, true);
  await assert.rejects(f.wallet.action({id: 'second', type: 'buy_plot'}), /saved payment/);
  f.accepted.add(pending.journal.transactionId);
  const done = await f.wallet.status(); assert.equal(done.state.upgrades.plots, 1); assert.equal(done.journal.accepted, true); assert.equal(done.pendingAction, null);
  await f.wallet.retryPayment(); assert.equal(f.sent.length, 1, 'Accepted purchase is never rebroadcast');
});

test('lost registration response prevents broadcast and restore retries the identical signed bytes', async () => {
  const f = fixture(); await f.start(); f.flags.loseRegistration = true;
  await assert.rejects(f.wallet.action({id: 'buy-one', type: 'buy_plot'}), /registration/);
  const id = f.wallet.snapshot().journal.transactionId;
  const registered = f.records.get('v5:payment:' + f.wallet.snapshot().journal.paymentId).transaction;
  assert.equal(f.sent.length, 0); f.flags.loseRegistration = false;
  const restored = f.make(); await restored.restore(); await restored.retryPayment();
  assert.deepEqual(f.sent, [registered]); assert.equal(restored.snapshot().journal.transactionId, id);
});

test('uncertain submission is recovered by status without another payment or optimistic game progress', async () => {
  const f = fixture(); await f.start(); f.flags.loseSubmission = true;
  await assert.rejects(f.wallet.action({id: 'buy-one', type: 'buy_plot'}), /submission/);
  assert.equal(f.sent.length, 1); const saved = f.sent[0], id = f.wallet.snapshot().journal.transactionId;
  await f.wallet.status(); assert.equal(f.sent.length, 1); assert.equal(f.wallet.snapshot().state.upgrades.plots, 0);
  f.flags.loseSubmission = false; await f.wallet.retryPayment(); assert.deepEqual(f.sent, [saved, saved]);
  f.accepted.add(id); await f.wallet.status(); assert.equal(f.wallet.snapshot().state.upgrades.plots, 1);
});

test('wrong registration identity and failed durable storage both block broadcast', async () => {
  const f = fixture(); await f.start(); f.flags.badRegistration = true;
  await assert.rejects(f.wallet.action({id: 'buy-one', type: 'buy_plot'}), /register|changed/); assert.equal(f.sent.length, 0);
  const g = fixture(); await g.start(); g.browser.setItem = () => { throw Error('Quota exceeded'); };
  await assert.rejects(g.wallet.action({id: 'buy-one', type: 'buy_plot'}), /storage/); assert.equal(g.sent.length, 0);
  assert.equal(g.requests.filter(r => r.url.endsWith('/action')).length, 0);
});

test('prepared market reservation keeps consent through payment-free recovery before a later quote', async () => {
  const f = fixture(); await f.start(); const action = {id: 'recover-care', type: 'market_use', purpose: 'feed_habitat'};
  await assert.rejects(f.wallet.action(action), /Argent market contracts/);
  const prepared = await f.wallet.status();
  assert.ok(Object.values(prepared.market.trades).some(trade => trade.status === 'prepared' && trade.useActionId === action.id), 'Status retains the exact prepared reservation');
  assert.deepEqual(f.wallet.snapshot().pendingAction, action);

  f.service.argentTemplates = JSON.parse(readFileSync(new URL('../src/v5-argent-templates.json', import.meta.url)));
  f.enableMarketChain((await f.wallet.snapshot()).address);
  let quote = await f.wallet.status();
  for (let phase = 0; phase < 5 && quote.payment?.marketPlan?.operation !== 'trade'; phase++) {
    assert.ok(quote.payment?.transactionId, 'Each host phase has a saved transaction');
    f.accepted.add(quote.payment.transactionId);
    quote = await f.wallet.status();
  }
  assert.equal(quote.payment?.marketPlan?.operation, 'trade');
  assert.deepEqual(f.wallet.snapshot().pendingAction, action);
  const before = f.sent.length;
  const submitted = await f.wallet.retryPayment();
  assert.equal(f.sent.length, before + 1);
  assert.equal(submitted.payment.status, 'submitted');
  assert.deepEqual(submitted.pendingAction, action);
});

test('faucet retries preserve request identity and require the exact received output', async () => {
  const f = fixture(); await f.start(); const first = await f.wallet.requestCoins(), second = await f.wallet.requestCoins();
  assert.equal(first.faucet.observed, true); assert.equal(second.faucet.requestId, first.faucet.requestId);
  assert.deepEqual(f.requests.filter(r => r.url.endsWith('/faucet')).map(r => r.body.requestId), [first.faucet.requestId, first.faucet.requestId]);
  f.flags.wrongNetwork = true; await assert.rejects(f.wallet.getBalance(), /Testnet-10/);
});

test('native wallet plan uses exact destination and owned change, excludes covenants and rejects duplicate inputs', () => {
  const owner = new sdk.PrivateKey('52'.repeat(32)), source = owner.toAddress('testnet-10').toString(), entries = [utxo(source, '03')];
  const options = {source, destination: treasuryAddress, amountSompi: '50000000', feeRate: 100};
  const plan = buildV5WalletPayment(sdk, {entries, ...options});
  plan.transaction.inputs[0].signatureScript = sdk.createInputSignature(plan.transaction, 0, owner);
  assert.doesNotThrow(() => validateV5Payment(sdk, plan.transaction, {...options, entries}));
  assert.throws(() => buildV5WalletPayment(sdk, {entries: [...entries, ...entries], ...options}), /duplicate/);
  assert.throws(() => buildV5WalletPayment(sdk, {entries, ...options, amountSompi: '10000000000'}), /Not enough/);
});
