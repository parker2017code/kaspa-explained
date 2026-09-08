// Presentation pacing is separate from the authoritative wallet and game state.
// This controller never signs, sends, or changes an economic record.
const hash = value => /^[a-f0-9]{64}$/i.test(String(value || ''));
const copy = value => structuredClone(value);
export function createV5Presentation({now = () => performance.now(), reducedMotion = () => false} = {}) {
  let current = null;
  function begin({scenario, before, action, restored = false}) {
    if (current) return false;
    current = {scenario:copy(scenario), baseScenario:copy(scenario), before:copy(before), action:copy(action || {}),
      startedAt:now(), phase:'acting', requestDone:restored, error:'', restored,
      transactions:[], worldReleased:false, consequenceAt:null, resultAt:null};
    return true;
  }
  function transaction(event) {
    if (!current || !hash(event.id)) return false;
    let record = current.transactions.find(t => t.id === event.id);
    if (!record) { record = {id:event.id, receivedAt:now(), status:'pending'}; current.transactions.push(record); }
    if (record.status === 'accepted') return false;
    Object.assign(record, event, {status:event.status === 'accepted' && hash(event.acceptingBlock) ? 'accepted' : 'pending'});
    if (record.status === 'accepted') record.acceptedAt = now();
    return true;
  }
  function finish(error = '') { if (current) { current.requestDone = true; current.error = String(error || ''); } }
  function tick({journey = () => null, pending = false, signatureRequired = false, motionActive = false} = {}) {
    const p = current; if (!p) return null;
    const time = now(), reduced = reducedMotion();
    p.signatureRequired = signatureRequired;
    if (p.phase === 'result') return p;
    if (signatureRequired) { p.phase = 'review'; return p; }
    if (p.error) { p.phase = 'error'; return p; }
    if (p.worldReleased) {
      p.phase = 'returning';
      if (!motionActive && time - p.consequenceAt >= (reduced ? 250 : 3200)) {
        p.phase = 'result'; p.resultAt = time;
      }
      return p;
    }
    const transactions = p.transactions;
    if (p.requestDone && !pending && !transactions.length && p.scenario.mode === 'chain') {
      p.error = 'No transaction was created. The offer or available supplies may have changed. Continue to review the next available action.';
      p.phase = 'error';
      return p;
    }
    let networkSettled = transactions.length > 0;
    for (const tx of transactions) {
      const state = journey(tx.id);
      const settled = tx.status === 'accepted' && (p.restored || reduced ||
        (state ? state.phase === 'settled' : time - tx.acceptedAt >= 6000));
      if (!settled) networkSettled = false;
    }
    if (transactions.length) {
      const active = transactions.find(tx => tx.status !== 'accepted' || journey(tx.id)?.active) || transactions.at(-1);
      const state = journey(active.id);
      p.phase = state?.phase === 'to-node' ? 'submitting' : state?.phase === 'returning' ? 'returning' : 'network';
    } else p.phase = time - p.startedAt < 1400 ? 'acting' : 'submitting';
    const localFinished = !transactions.length && ['local','proposal'].includes(p.scenario.mode) && time - p.startedAt >= (reduced ? 250 : 1800);
    if (p.requestDone && !pending && (networkSettled || localFinished)) {
      p.worldReleased = true; p.consequenceAt = time; p.phase = p.restored ? 'result' : 'returning';
      if (p.restored) p.resultAt = time;
    }
    return p;
  }
  function acknowledge() { if (current?.phase !== 'result') return false; current = null; return true; }
  function clear() { current = null; }
  function retry() { if (current) { current.error = ''; current.requestDone = false; } }
  function snapshot() { return current; }
  return {begin, transaction, finish, tick, acknowledge, clear, retry, snapshot};
}
