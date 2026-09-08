// The V6 tour is a finite learning sequence.  The host owns state, signing,
// node observation and persistence; this module only describes what a learner
// should notice at each stop.

export const V6_STEPS = Object.freeze(['intro', 'risk', 'review', 'pending', 'outcome', 'complete']);
export const V6_CAUSAL_STAGES = Object.freeze([
  Object.freeze({id: 'problem', label: 'Problem', detail: 'What could go wrong?'}),
  Object.freeze({id: 'rule', label: 'Rule', detail: 'What must happen together?'}),
  Object.freeze({id: 'authorize', label: 'Authorize', detail: 'What are you approving?'}),
  Object.freeze({id: 'submit', label: 'Submit', detail: 'What did the transaction carry?'}),
  Object.freeze({id: 'observe', label: 'Observe', detail: 'Which block accepted it?'}),
  Object.freeze({id: 'consequence', label: 'Consequence', detail: 'What changed in the harbor?'}),
]);

const tech = (name, context, status = 'in-context') => Object.freeze({name, context, status});
const step = (title, body, actionLabel, extra = {}) => Object.freeze({title, body, actionLabel, ...extra});

export const V6_CHAPTERS = Object.freeze([
  Object.freeze({
    id: 'atomic-exchange', index: 0, place: 'Exchange', shortTitle: 'Atomic exchange',
    title: 'Buy without trusting the seller', estimatedMinutes: 2,
    problem: 'Seller wants your coins before giving the tool',
    risk: 'If you pay first, the seller can keep the coins and never hand over the promised tool.',
    rule: 'The payment and the Business covenant’s tool quantity change together in one transaction, or neither changes.',
    objective: 'Compare the unsafe proposal with the atomic exchange, then inspect what the accepted transaction delivered.',
    technology: [
      tech('Argent', 'coordinates the buyer and seller approvals'),
      tech('SilverScript', 'compiles the exchange conditions'),
      tech('Kaspa', 'checks the signed transaction on Testnet-10'),
      tech('KIP-20', 'identifies the Business covenant lineage used by this ledger'),
    ],
    boundary: 'The tool is a ledger quantity in the Business covenant lineage. This is not a full KCC20 asset/controller implementation or proof of authentic physical tool identity. The harbor illustrates the accepted ledger change.',
    scene: {kind: 'exchange', place: 'Exchange', focus: 'tool ledger quantity', actors: ['You', 'Seller'], goods: ['tool', 'coins']},
    steps: {
      intro: step('Start with the risk', 'A payment sent first can be lost. Look at the seller’s proposal and its tool ledger quantity before authorizing anything.', 'See the unsafe proposal'),
      risk: step('Pay first, and trust the seller', 'The unsafe proposal sends your coins to the seller before the tool changes hands. That order gives the seller the advantage.', 'Compare the atomic exchange', {secondaryAction: {type: 'try_attack', label: 'Try paying first'}}),
      review: step('The contract makes the order indivisible', 'Review the two sides: your coins and the tool quantity. Authorize only the proposal that requires both transfers in the same transaction.', 'Authorize atomic exchange'),
      pending: step('The exchange is on its way', 'The signed transaction is waiting for node acceptance. The tool remains provisional until an accepting block is observed.', 'Check the accepting block'),
      outcome: step('The tool arrived with the payment', 'The observed transaction debited the coins and updated the tool quantity together. The tool is now in your cart.', 'Inspect what changed'),
      complete: step('You can buy without trusting first', 'Atomic exchange changes the risk: the seller cannot satisfy only the payment side of the agreed transition.', 'Continue to Pip’s policy'),
    },
  }),
  Object.freeze({
    id: 'pip-budget', index: 1, place: 'Workshop', shortTitle: 'Pip’s policy',
    title: 'Give Pip useful power', estimatedMinutes: 2,
    problem: 'Pip can help, but unrestricted authority could consume your resources.',
    risk: 'A helper should complete a specific resource trade without gaining general spending authority.',
    rule: 'Pip may spend at most 2 crops and receive at least 1 resource. This barter proposes 1 timber; native spending is disabled.',
    objective: 'Let Pip make the allowed crop-for-wood trade, test a separate request outside the policy, then revoke permission.',
    technology: [
      tech('Argent', 'separates Pip’s spending role from your other approvals'),
      tech('SilverScript', 'checks the Business resource policy and allowance'),
      tech('Kaspa', 'accepts the allowed state transition on Testnet-10'),
    ],
    boundary: 'Pip is game-operated. The policy allows at most 2 crops spent and at least 1 resource received across crops, wood, ore, tools or bread. This proposal receives timber; the policy does not require timber or restrict the recipient. Native spending is disabled.',
    scene: {kind: 'workshop', place: 'Workshop', focus: 'Pip at the workbench', actors: ['You', 'Pip'], goods: ['crops', 'wood']},
    steps: {
      intro: step('Give a helper a narrow job', 'Pip can exchange 2 crops for 1 wood for the workshop. The demo accounts are funded from the workshop’s Testnet reserve; your personal wallet is not involved.', 'Review Pip’s policy'),
      risk: step('A useful helper still needs limits', 'The policy caps crop spending at 2 and requires at least 1 resource received. Test a request outside that resource policy and inspect the reported check before concluding that it failed.', 'Try the allowed trade', {secondaryAction: {type: 'try_attack', label: 'Test a disallowed trade'}}),
      review: step('Authorize the resource policy', 'Confirm the maximum of 2 crops spent, at least 1 resource received and native spending disabled. This proposal exchanges 2 crops for 1 timber. Revocation remains available afterward.', 'Authorize demo transfer'),
      pending: step('Pip’s request is being checked', 'The receipt separates submission from acceptance. A smooth scene animation does not settle the Testnet transaction.', 'Check the accepting block'),
      outcome: step('Inspect Pip’s resource trade', 'Compare the observed crop and wood quantities. A separate failed request is established only when the reported check confirms rejection.', 'Review the policy check'),
      complete: step('Power with a boundary', 'Pip is useful because its authority is narrow and revocable. The demonstration account is separate from your personal funds.', 'Continue to the trading ring'),
    },
  }),
  Object.freeze({
    id: 'atomic-ring', index: 2, place: 'Exchange', shortTitle: 'Trading ring',
    title: 'Trade when nobody can go first', estimatedMinutes: 2,
    problem: 'Three businesses each hold what another needs, but an individual transfer leaves someone exposed.',
    risk: 'If one business hands over its goods first, the next business can keep them and stop the ring.',
    rule: 'The fixed ring consumes all three conditional transitions together. Each participant gives and receives in the same accepted transaction.',
    objective: 'Preview the exposure in separate transfers, then settle the three recognizable goods in one ring.',
    technology: [
      tech('Argent', 'coordinates the three roles in the ring'),
      tech('SilverScript', 'binds each give/receive condition to the same settlement'),
      tech('Kaspa', 'validates the combined transaction and its accepting block'),
    ],
    boundary: 'The businesses and their goods are game-operated. The ring proves a conditional transaction path, not independent real-world counterparties or physical shipment.',
    scene: {kind: 'ring', place: 'Exchange', focus: 'three-way settlement', actors: ['Grower', 'Toolmaker', 'Miner'], goods: ['grain', 'tool', 'ore']},
    steps: {
      intro: step('A trade can have three sides', 'The grower has grain, the toolmaker has a tool and the miner has ore. Each wants the next item in the ring.', 'Preview the ring'),
      risk: step('Going first exposes one participant', 'A direct transfer solves one side while leaving the sender waiting. The ring keeps each handoff conditional on the complete set.', 'See the exposed transfer', {secondaryAction: {type: 'try_attack', label: 'Try one transfer first'}}),
      review: step('Review all three handoffs', 'Check the concrete goods and recipients: grain goes to the toolmaker, the tool goes to the miner, and ore goes to the grower.', 'Authorize the ring'),
      pending: step('The ring waits as one transaction', 'The goods stay at their starting stores until the node accepts the combined transition.', 'Check the accepting block'),
      outcome: step('All three businesses moved together', 'The accepted ring delivered each good to the next store. No participant had to trust a previous leg.', 'Inspect the three receipts'),
      complete: step('A ring removes the first-mover problem', 'Conditional settlement makes the three transfers one decision with one observed outcome.', 'Continue to shared construction'),
    },
  }),
  Object.freeze({
    id: 'shared-greenhouse', index: 3, place: 'Greenhouse', shortTitle: 'Shared greenhouse',
    title: 'Build only if we cooperate', estimatedMinutes: 2,
    problem: 'Neighbors want a shared greenhouse but fear committing resources alone.',
    risk: 'A pledge made without all three ready participants could leave one neighbor committing to a project that cannot launch.',
    rule: 'V4Launch requires 3 distinct ready pledges to settle together; a participant can withdraw before the launch.',
    objective: 'See a withdrawal before the group is ready, then settle the 3 distinct ready pledges and watch the greenhouse open.',
    technology: [
      tech('SilverScript', 'compiles V4Launch’s 3-distinct-ready-pledge condition'),
      tech('Kaspa', 'consumes the ready pledges in the observed settlement'),
    ],
    boundary: 'This is the V4Launch SilverScript contract with 3 distinct ready pledges, not an arbitrary fundraising threshold. The neighbors and construction are game-operated.',
    scene: {kind: 'coordination', place: 'Greenhouse', focus: 'conditional pledges', actors: ['Grower', 'Toolmaker', 'Miner'], goods: ['pledge', 'greenhouse']},
    steps: {
      intro: step('A shared project needs protection', 'The neighbors can contribute to one greenhouse, but no one should be stranded by an incomplete group.', 'Review the pledges'),
      risk: step('A pledge can still be withdrawn', 'Before the group is ready, a participant can withdraw. The incomplete project remains unchanged.', 'Withdraw one pledge', {secondaryAction: {type: 'try_attack', label: 'Try releasing early'}}),
      review: step('Set the group condition', 'Review the 3 distinct participants and their ready pledges. Only the complete ready set can authorize the launch transition.', 'Authorize group settlement'),
      pending: step('The pledges wait together', 'The project stays unopened while the node checks the combined transition. The scene shows the proposal separately from the receipt.', 'Check the accepting block'),
      outcome: step('The greenhouse opened together', 'The accepted transaction consumed the ready pledges and changed the greenhouse state. Each participant’s before and after is visible.', 'Inspect the group result'),
      complete: step('Conditional commitments change incentives', 'The shared rule protects early participants until the agreed group is ready, while leaving the coordination problem visible.', 'Continue to the courier'),
    },
  }),
  Object.freeze({
    id: 'courier-release', index: 4, place: 'Habitat', shortTitle: 'Courier release',
    title: 'Pay a courier who might disappear', estimatedMinutes: 2,
    problem: 'A customer wants to pay for delivery while the courier could disappear before completing it.',
    risk: 'The customer’s payment and the courier’s bond need different conditions; treating them as one amount hides who is protected.',
    rule: 'A recipient signature pays the payment plus bond to the courier. After the required chain age, the customer can claim both instead, including the courier’s forfeited bond.',
    objective: 'Keep the customer payment and courier bond separate, then follow either the signed release or the eligible refund path.',
    technology: [
      tech('Argent', 'coordinates customer, courier and recipient roles'),
      tech('SilverScript', 'checks signatures, release conditions and chain age'),
      tech('Kaspa', 'checks the transaction and its observed block age'),
    ],
    boundary: 'The witness and physical delivery are game-operated. Kaspa checks the supplied signature and chain conditions; it does not observe the courier carrying anything.',
    scene: {kind: 'delivery', place: 'Habitat', focus: 'payment and bond', actors: ['Customer', 'Courier', 'Recipient'], goods: ['parcel', 'coins']},
    steps: {
      intro: step('A delivery needs two safeguards', 'The customer payment rewards the delivery and the courier bond protects against disappearance. Keep those amounts visible as separate roles.', 'Review the delivery terms'),
      risk: step('The courier can fail the route', 'Without a valid recipient signature, the payout stays held. After the required chain age, an eligible refund can return the protected amount.', 'Compare release and refund', {secondaryAction: {type: 'try_attack', label: 'Try releasing without proof'}}),
      review: step('Authorize the exact roles', 'Review the customer payment, courier bond and recipient signature condition. The game-operated witness supplies the signature; the contract checks it.', 'Authorize delivery terms'),
      pending: step('The delivery contract is waiting', 'The scene may show a parcel in motion, but only the observed receipt can release or refund the contract-held amounts.', 'Check the accepting block'),
      outcome: step('The valid path paid or refunded', 'The accepted result names the role that received the payout and keeps the bond accounting separate. The physical route remains a game rule.', 'Inspect the delivery result'),
      complete: step('A signature can release a held payment', 'The contract makes the release condition explicit while keeping the limits of the physical witness visible.', 'Continue to the observatory'),
    },
  }),
  Object.freeze({
    id: 'verified-work', index: 5, place: 'Observatory', shortTitle: 'Verified work',
    title: 'Verify work without trusting the worker', estimatedMinutes: 3,
    problem: 'A worker supplies a solution for a precisely defined task, but the customer should not accept an invalid result.',
    risk: 'A plausible answer is not enough: the verifier must reject an invalid proof and release the reward only for the defined result.',
    rule: 'The verifier checks the submitted result against the task’s circuit and proof conditions before the reward and machine state can change.',
    objective: 'Inspect the exact task, test an adversarial invalid proof, then observe the verified result release the reward.',
    technology: [
      tech('R1CS', 'constrains allocation and rate to 1–15, their sum to 13 and product to public score 42'),
      tech('Kaspa', 'accepts the verified state transition on Testnet-10'),
      tech('Custom proof verifier', 'binds the bounded task to the recipient x-only key and nonce'),
    ],
    boundary: 'The custom circuit/prover/verifier path checks a bounded allocation/rate R1CS task: each value is 1–15, the public score is 42 and sum is 13, bound to a recipient x-only key and nonce. It uses a reproducible development setup, not a secure production ceremony. The public task reveals the possible settings; no privacy guarantee is claimed.',
    scene: {kind: 'observatory', place: 'Observatory', focus: 'verified machine', actors: ['Worker', 'Verifier'], goods: ['solution', 'reward']},
    steps: {
      intro: step('Work needs a precise test', 'Find allocation and rate values from 1 to 15 with public score 42 and sum 13. The proof binds this task to the recipient x-only key and nonce.', 'Inspect the task'),
      risk: step('A plausible answer can be invalid', 'Try the adversarial result. The verifier must reject it and leave the reward and machine unchanged.', 'Test the invalid proof', {secondaryAction: {type: 'try_attack', label: 'Submit an invalid proof'}}),
      review: step('Review the proof boundary', 'Review the bounded R1CS task, recipient x-only key, nonce and reward condition. The actual prover and verifier must agree on these public inputs.', 'Review verification path'),
      pending: step('The result is waiting for verification', 'A local calculation or animation cannot stand in for proof verification. The reward stays held until the actual path accepts.', 'Check the accepting block'),
      outcome: step('Verified work changed the machine', 'Only an observed valid result releases the reward and operates the machine. Inspect the separate adversarial check to establish whether the invalid attempt was rejected.', 'Inspect the verified result'),
      complete: step('Verification narrows what must be trusted', 'The verifier checks this defined arithmetic result without trusting the worker’s explanation. This bounded demonstration makes no privacy guarantee.', 'Finish the learning tour'),
    },
  }),
]);

const clampChapter = value => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(V6_CHAPTERS.length - 1, Math.trunc(number))) : 0;
};

export function getV6Lesson(chapter = 0) {
  return V6_CHAPTERS[clampChapter(chapter)];
}

export function getV6Step(stepName = 'intro') {
  return V6_STEPS.includes(stepName) ? stepName : 'intro';
}

export function getV6StepCopy(chapter = 0, stepName = 'intro') {
  const lesson = getV6Lesson(chapter);
  return lesson.steps[getV6Step(stepName)] || lesson.steps.intro;
}

export function v6CompletedCount(progress = {}) {
  const completed = Array.isArray(progress.completed) ? progress.completed : [];
  const ids = new Set(completed.map(value => String(value)));
  return V6_CHAPTERS.filter(lesson => ids.has(lesson.id) || ids.has(String(lesson.index))).length;
}

export function v6RemainingMinutes(progress = {}) {
  const completed = new Set((Array.isArray(progress.completed) ? progress.completed : []).map(value => String(value)));
  return V6_CHAPTERS.reduce((sum, lesson) => sum + (completed.has(lesson.id) || completed.has(String(lesson.index)) ? 0 : lesson.estimatedMinutes), 0);
}

export function normalizeV6View(view = {}) {
  const source = view && typeof view === 'object' ? view : {};
  const lesson = getV6Lesson(source.chapter);
  const stepName = getV6Step(source.step);
  const progress = source.progress && typeof source.progress === 'object' ? source.progress : {};
  const evidence = source.evidence && typeof source.evidence === 'object' ? source.evidence : {};
  const network = source.network && typeof source.network === 'object' ? source.network : {};
  const wallet = source.wallet && typeof source.wallet === 'object' ? source.wallet : {};
  const scene = source.scene && typeof source.scene === 'object' ? source.scene : {};
  const result = source.result && typeof source.result === 'object' ? source.result : null;
  const operation = source.operation && typeof source.operation === 'object' ? source.operation : null;
  const copy = getV6StepCopy(lesson.index, stepName);
  return {
    ...source,
    chapter: lesson.index,
    step: stepName,
    title: source.title || lesson.title,
    place: source.place || lesson.place,
    shortTitle: source.shortTitle || lesson.shortTitle,
    problem: source.problem || lesson.problem,
    risk: source.risk || lesson.risk,
    rule: source.rule || lesson.rule,
    objective: source.objective || lesson.objective,
    actionLabel: source.actionLabel || copy.actionLabel,
    actionDisabled: Boolean(source.actionDisabled),
    busy: Boolean(source.busy),
    error: source.error || null,
    stepCopy: source.stepCopy || copy,
    progress: {...progress, completed: Array.isArray(progress.completed) ? progress.completed.slice() : [], total: 6},
    wallet: {connected: Boolean(wallet.connected), balanceSompi: wallet.balanceSompi ?? '0', label: wallet.label || 'Demo funds', ...wallet},
    operation: operation ? {...operation} : null,
    evidence: {
      technology: evidence.technology || lesson.technology,
      checked: Array.isArray(evidence.checked) ? evidence.checked.slice() : [],
      boundary: evidence.boundary || lesson.boundary,
      receiptUrl: evidence.receiptUrl || '',
      ...evidence,
    },
    result: result ? {
      ...result,
      deltas: Array.isArray(result.deltas) ? result.deltas.slice() : [],
    } : null,
    network: {
      ...network,
      status: network.status || 'Not connected',
      blocks: Array.isArray(network.blocks) ? network.blocks.slice(0, 24) : [],
      lastUpdated: network.lastUpdated || null,
    },
    history: Array.isArray(source.history) ? source.history.slice(-24) : [],
    scene: {...lesson.scene, ...scene},
  };
}
