// Bounded, read-only visual storytelling for the V5 town story.
// The caller owns the phase and Continue action. This renderer never submits or
// infers a transaction result; acceptance requires both status and a block.

const PHASES = ['problem', 'acting', 'submitting', 'network', 'returning', 'result'];
const MODES = ['chain', 'local', 'proposal', 'observe'];
const SOMPI_PER_KAS = 100000000n;

const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]));

const slug = value => String(value || 'scene')
  .toLowerCase()
  .replace(/[^a-z0-9_-]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 48) || 'scene';

const text = (value, fallback = '') => {
  const result = String(value ?? '').trim();
  return result || fallback;
};

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function phaseOf(value) {
  const phase = String(value || '').toLowerCase();
  return PHASES.includes(phase) ? phase : 'problem';
}

function modeOf(value) {
  const mode = String(value || '').toLowerCase();
  return MODES.includes(mode) ? mode : 'chain';
}

function safeAmount(value) {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
}

function entries(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.entries(value).filter(([name, amount]) => text(name) && amount !== null && amount !== undefined && amount !== '');
}

function amountText(value) {
  const valueText = safeAmount(value);
  return valueText || 'Unknown';
}

function bundleText(value, empty = 'nothing') {
  const items = entries(value);
  return items.length ? items.map(([name, amount]) => `${amountText(amount)} ${String(amount) === '1' ? ({crops:'crop',tools:'tool',parts:'part'}[name] || name) : name}`).join(' · ') : empty;
}

function firstResource(value, fallback = 'goods') {
  return entries(value)[0]?.[0] || fallback;
}

function short(value, length = 18) {
  const source = text(value);
  if (source.length <= length) return source;
  return `${source.slice(0, Math.max(1, length - 1)).trimEnd()}…`;
}

function actorNameLines(value, max = 9) {
  const words = text(value, 'Participant').split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && next.length > max) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= 3) return lines;
  return [...lines.slice(0, 2), short(lines.slice(2).join(' '), max)];
}

function humanize(value, fallback = 'transaction') {
  const source = text(value, fallback).replace(/[_-]+/g, ' ');
  return source.charAt(0).toUpperCase() + source.slice(1);
}

function formatSompi(value) {
  const source = String(value ?? '').trim();
  if (!/^\d+$/.test(source)) return source;
  try {
    const amount = BigInt(source);
    const whole = amount / SOMPI_PER_KAS;
    const fraction = String(amount % SOMPI_PER_KAS).padStart(8, '0').replace(/0+$/, '');
    return `${whole}${fraction ? `.${fraction}` : ''} tKAS`;
  } catch {
    return source;
  }
}

function normalizeBundle(value) {
  return Object.fromEntries(entries(value).map(([name, amount]) => [text(name), safeAmount(amount)]));
}

function normalizeScenario(input = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const sourceActors = Array.isArray(source.actors) ? source.actors : [];
  const actors = sourceActors.map((actor, index) => {
    // Actor identities can share an entire wallet address prefix. Preserve
    // their suffixes; escaping belongs at the HTML boundary below.
    const id = text(actor?.id, `actor-${index + 1}`);
    return {
      id,
      name: text(actor?.name, `Participant ${index + 1}`),
      gives: normalizeBundle(actor?.gives),
      receives: normalizeBundle(actor?.receives),
    };
  });
  const actorIds = new Set(actors.map(actor => actor.id));
  const sourceFlows = Array.isArray(source.flows) ? source.flows : [];
  const flows = sourceFlows.map((flow, index) => {
    const from = text(flow?.from, actors[0]?.id || `actor-${index + 1}`);
    const to = text(flow?.to, actors[1]?.id || actors[0]?.id || `actor-${index + 2}`);
    return {
      from,
      to,
      goods: normalizeBundle(flow?.goods),
      coinsSompi: flow?.coinsSompi === null || flow?.coinsSompi === undefined || flow?.coinsSompi === '' ? '' : String(flow.coinsSompi),
      label: text(flow?.label, `${from} → ${to}`),
      fromKnown: actorIds.has(from),
      toKnown: actorIds.has(to),
    };
  });
  const technology = Array.isArray(source.technology)
    ? source.technology.map(item => ({label: text(item?.label), text: text(item?.text)})).filter(item => item.label || item.text)
    : [];
  return {
    id: text(source.id, 'town-exchange'),
    room: text(source.room, 'Town'),
    title: text(source.title, 'A small exchange in Sprout Harbor'),
    problem: text(source.problem, 'A neighbor needs something the town can make.'),
    mode: modeOf(source.mode),
    actionLabel: text(source.actionLabel, 'Set the terms'),
    actors,
    flows,
    rule: text(source.rule, 'The town applies the stated rule after the required step.'),
    resultTitle: text(source.resultTitle, 'The town has a confirmed result'),
    result: text(source.result, 'The named participant receives the agreed result.'),
    technology,
    boundary: text(source.boundary, source.mode === 'chain'
      ? 'Testnet acceptance proves the transaction; the town applies its game result separately.'
      : 'This scene is a local game rule; it does not claim a network transaction.'),
  };
}

function normalizeTransaction(input = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const status = text(source.status, 'ready').toLowerCase();
  const acceptingBlock = text(source.acceptingBlock);
  const accepted = status === 'accepted' && Boolean(acceptingBlock);
  return {
    id: text(source.id),
    status,
    acceptingBlock,
    operation: text(source.operation),
    feeSompi: source.feeSompi === null || source.feeSompi === undefined || source.feeSompi === '' ? '' : String(source.feeSompi),
    accepted,
  };
}

// These are deliberately small vector marks. They stay crisp in the compact
// story panel and make each concrete good recognizable without image assets.
function glyph(name, x, y, scale = 1, extraClass = '') {
  const kind = slug(name || 'goods');
  const transform = `translate(${Number(x) || 0} ${Number(y) || 0}) scale(${scale})`;
  const prefix = `<g class="v5-experience-glyph v5-experience-glyph--${kind} ${extraClass}" transform="${transform}" aria-hidden="true">`;
  const suffix = '</g>';
  if (['crop', 'crops', 'wheat', 'grain'].includes(kind)) {
    return `${prefix}<path class="v5-experience-glyph-stroke" d="M0 12V-10M0-2C-8-7-11-3-1 2M0-7C8-12 11-8 1-3M0 4C-8-1-10 3-1 8"/><path class="v5-experience-glyph-fill" d="M-3 13h6v3h-6z"/>${suffix}`;
  }
  if (['tool', 'tools', 'hammer', 'pick'].includes(kind)) {
    return `${prefix}<path class="v5-experience-glyph-stroke" d="M-8 12 5-5M2-12l9 5-4 6-9-5z"/><path class="v5-experience-glyph-fill" d="M3-13l9 5-2 3-9-5z"/>${suffix}`;
  }
  if (['ore', 'rock', 'stone'].includes(kind)) {
    return `${prefix}<path class="v5-experience-glyph-fill" d="m-13 8 4-14 9-7 12 8-3 14-11 5z"/><path class="v5-experience-glyph-stroke" d="m-9-6 9 2 8-9M-9-6l-4 14M0-4 0 6l9 3"/>${suffix}`;
  }
  if (['coin', 'coins', 'kas', 'money'].includes(kind)) {
    return `${prefix}<circle class="v5-experience-glyph-fill" cx="0" cy="0" r="12"/><circle class="v5-experience-glyph-stroke" cx="0" cy="0" r="7"/><path class="v5-experience-glyph-stroke" d="M-2-6v12M2-6v12"/>${suffix}`;
  }
  if (['water', 'waters', 'droplet'].includes(kind)) {
    return `${prefix}<path class="v5-experience-glyph-fill" d="M0-15C0-15 12-2 12 5A12 12 0 1 1-12 5C-12-2 0-15 0-15Z"/><path class="v5-experience-glyph-stroke v5-experience-glyph-stroke--light" d="M-5 6a6 6 0 0 0 8 5"/>${suffix}`;
  }
  return `${prefix}<path class="v5-experience-glyph-fill" d="M-12-8 0-15 12-8v16L0 15l-12-7z"/><path class="v5-experience-glyph-stroke" d="M-12-8 0 0l12-8M0 0v15"/>${suffix}`;
}

function normalizeActorPositions(actors) {
  const points = {
    1: [[200, 112]],
    2: [[68, 112], [332, 112]],
    3: [[72, 58], [328, 58], [200, 166]],
    4: [[72, 52], [328, 52], [328, 150], [72, 150]],
  };
  const selected = points[Math.min(4, Math.max(1, actors.length))] || points[2];
  return actors.map((actor, index) => {
    const fallback = [index % 2 ? 328 : 72, index % 2 ? 150 : 52];
    const [x, y] = selected[index] || fallback;
    const nameLines = actorNameLines(actor.name);
    return {...actor, x, y, width: 128, height: 56 + Math.max(0, nameLines.length - 1) * 12};
  });
}

function actorPosition(positions, id, fallbackIndex = 0) {
  return positions.find(position => position.id === id) || positions[fallbackIndex % Math.max(1, positions.length)] || {
    id,
    name: humanize(id, 'Participant'),
    x: 380,
    y: 70,
    width: 112,
    height: 56,
    gives: {},
    receives: {},
  };
}

function routePoints(from, to, index, flowCount) {
  const startRight = from.x <= to.x;
  const endRight = to.x >= from.x;
  const sx = from.x + (startRight ? from.width / 2 : -from.width / 2);
  const tx = to.x + (endRight ? -to.width / 2 : to.width / 2);
  // Two-party exchanges get independent horizontal lanes. Parallel curves
  // made opposite payments read like a single crossed arrow on a phone.
  if (Math.abs(from.y - to.y) < 12 && Math.abs(from.x - to.x) > 100 && flowCount <= 2) {
    const laneY = from.y + (flowCount === 2 ? (index === 0 ? -12 : 12) : 0);
    const d = `M ${sx} ${laneY} L ${tx} ${laneY}`;
    const reverse = `M ${tx} ${laneY} L ${sx} ${laneY}`;
    return {d, reverse, labelX: (sx + tx) / 2, labelY: laneY};
  }
  const offset = (index - (flowCount - 1) / 2) * 13;
  const cx = (sx + tx) / 2;
  const cy = 116 + offset;
  const d = `M ${sx} ${from.y} C ${cx} ${cy - 30} ${cx} ${cy + 30} ${tx} ${to.y}`;
  const reverse = `M ${tx} ${to.y} C ${cx} ${cy + 30} ${cx} ${cy - 30} ${sx} ${from.y}`;
  return {d, reverse, labelX: cx, labelY: cy + offset * .15};
}

function flowState({mode, phase, accepted}) {
  if (mode === 'observe' || mode === 'proposal') return 'held';
  if (mode === 'local') {
    if (phase === 'result') return 'delivered';
    if (phase === 'acting' || phase === 'submitting' || phase === 'returning') return 'moving';
    return 'held';
  }
  if (!accepted) return ['submitting', 'network'].includes(phase) ? 'pending' : 'held';
  if (phase === 'returning') return 'moving';
  return phase === 'result' ? 'delivered' : 'held';
}

function actorCard(actor, position, scenario) {
  const describeFlows = flows => flows.flatMap(flow=>[bundleText(flow.goods,''),flow.coinsSompi !== '' ? formatSompi(flow.coinsSompi) : '']).filter(Boolean).join(' and ') || 'nothing';
  const sender = scenario.flows.some(flow => flow.from === actor.id);
  const recipient = scenario.flows.some(flow => flow.to === actor.id);
  const left = position.x - position.width / 2;
  const top = position.y - position.height / 2;
  const state = sender && recipient ? 'sender-recipient' : sender ? 'sender' : recipient ? 'recipient' : 'participant';
  const nameLines = actorNameLines(actor.name);
  const nameStart = nameLines.length === 1 ? 25 : nameLines.length === 2 ? 19 : 15;
  const nameMarkup = nameLines.map((line, index) => `<text class="v5-experience-actor-name" x="38" y="${nameStart + index * 13}"${line.length > 8 ? ' textLength="80" lengthAdjust="spacingAndGlyphs"' : ''}>${esc(line)}</text>`).join('');
  return `<g class="v5-experience-actor" data-experience-actor="${esc(actor.id)}" data-actor-state="${state}" transform="translate(${left} ${top})">
    <title>${esc(actor.name)}: sends ${esc(describeFlows(scenario.flows.filter(flow=>flow.from===actor.id)))}; receives ${esc(describeFlows(scenario.flows.filter(flow=>flow.to===actor.id)))}</title>
    <rect class="v5-experience-actor-card" width="${position.width}" height="${position.height}" rx="18"/>
    <circle class="v5-experience-person" cx="22" cy="24" r="13"/>
    <path class="v5-experience-person-body" d="M10 53c0-11 7-17 12-17s12 6 12 17"/>
    ${nameMarkup}
  </g>`;
}

function flowLabel(flow, from, to, point, index) {
  const goods = entries(flow.goods);
  const goodsText = bundleText(flow.goods, '');
  const coinText = flow.coinsSompi !== '' ? formatSompi(flow.coinsSompi) : '';
  const label = short(flow.label || `${from.name} → ${to.name}`, 25);
  const values = [];
  if (goodsText) values.push({kind: goods[0]?.[0] || 'goods', text: goodsText, className: 'v5-experience-flow-label-detail'});
  if (coinText) values.push({kind: 'coins', text: coinText, className: 'v5-experience-flow-label-money'});
  const height = values.length > 1 ? 54 : 40;
  const titleY = values.length > 1 ? -18 : -11;
  const firstValueY = values.length > 1 ? -2 : 8;
  const glyphScale = values.length > 1 ? .78 : 1.3;
  const valueMarkup = values.map((value, valueIndex) => {
    const y = firstValueY + valueIndex * 17;
    return `${glyph(value.kind, -48, y - 4, glyphScale)}<text class="${value.className}" x="-27" y="${y}">${esc(value.text)}</text>`;
  }).join('');
  return `<g class="v5-experience-flow-label" data-flow-label="${index}" transform="translate(${point.labelX} ${point.labelY})">
    <rect x="-64" y="${-height / 2}" width="128" height="${height}" rx="10"/>
    <text class="v5-experience-flow-label-title" x="0" y="${titleY}" text-anchor="middle">${esc(label)}</text>
    ${valueMarkup}
  </g>`;
}

function flowLabelPoint(from, to, point, index, actorCount, flowCount) {
  if (actorCount === 2) {
    const labelY = flowCount === 1 ? 57 : flowCount === 2 ? (index === 0 ? 57 : 167) : 57 + (index % 3) * 55;
    return {labelX: 200, labelY};
  }
  // The three actor layout is intentionally triangular. Give its three route
  // labels their own corners so a circular swap reads as three separate goods
  // movements instead of one stack of cards.
  if (actorCount === 3) {
    if (Math.abs(from.y - to.y) < 12) return {labelX: 200, labelY: 108};
    if (Math.max(from.x, to.x) > 200) return {labelX: 324, labelY: 137};
    return {labelX: 76, labelY: 137};
  }
  return point;
}

function flowGraphic(flow, index, positions, scenario, phase, transaction) {
  const from = actorPosition(positions, flow.from, index);
  const to = actorPosition(positions, flow.to, index + 1);
  const point = routePoints(from, to, index, Math.max(1, scenario.flows.length));
  const labelPoint = flowLabelPoint(from, to, point, index, positions.length, scenario.flows.length);
  const state = flowState({mode: scenario.mode, phase, accepted: transaction.accepted});
  const marker = state === 'delivered' || state === 'moving' ? 'accepted' : state === 'returning' ? 'returning' : state === 'pending' ? 'pending' : 'held';
  const tokenResource = firstResource(flow.goods, flow.coinsSompi !== '' ? 'coins' : 'goods');
  const sendVerb = /^you$/i.test(from.name) ? 'send' : 'sends';
  const contents = [bundleText(flow.goods,''),flow.coinsSompi !== '' ? formatSompi(flow.coinsSompi) : ''].filter(Boolean).join(' and ') || 'the agreed supplies';
  const aria = `${from.name} ${sendVerb} ${contents} to ${to.name}. ${state === 'delivered' ? 'Delivered.' : state === 'moving' ? 'Accepted and moving to the recipient.' : state === 'returning' ? 'Accepted and returning.' : state === 'pending' ? 'Held while acceptance is pending.' : 'Held.'}`;
  return `<g class="v5-experience-flow v5-experience-flow--${state}" data-experience-flow="${index}" data-flow-from="${esc(flow.from)}" data-flow-to="${esc(flow.to)}" data-flow-state="${state}" aria-label="${esc(aria)}">
    <path class="v5-experience-route v5-experience-route--${state}" data-flow-route="${index}" d="${point.d}" pathLength="1" marker-end="url(#v5-experience-${marker}-arrow)"/>
    <path class="v5-experience-route-progress" data-flow-progress="${index}" d="${point.d}" pathLength="1"/>
    <g class="v5-experience-token v5-experience-token--forward" data-flow-token="${index}" data-token-direction="forward">
      <circle class="v5-experience-token-shell" r="17"/>
      ${glyph(tokenResource, 0, 0, .46, 'v5-experience-token-glyph')}
      <animateMotion dur="2.7s" repeatCount="indefinite" path="${point.d}"/>
    </g>
    <g class="v5-experience-token v5-experience-token--return" data-flow-token-return="${index}" data-token-direction="return">
      <circle class="v5-experience-token-shell" r="17"/>
      ${glyph(tokenResource, 0, 0, .46, 'v5-experience-token-glyph')}
      <animateMotion dur="2.45s" repeatCount="indefinite" path="${point.reverse}"/>
    </g>
    <g class="v5-experience-token-static v5-experience-token-static--held" data-token-static="held" transform="translate(${from.x + (from.x <= to.x ? from.width / 2 - 22 : -from.width / 2 + 22)} ${from.y})">
      <circle class="v5-experience-token-shell" r="15"/>${glyph(tokenResource, 0, 0, .4, 'v5-experience-token-glyph')}
    </g>
    <g class="v5-experience-token-static v5-experience-token-static--delivered" data-token-static="delivered" transform="translate(${to.x + (to.x >= from.x ? -to.width / 2 + 22 : to.width / 2 - 22)} ${to.y})">
      <circle class="v5-experience-token-shell" r="15"/>${glyph(tokenResource, 0, 0, .4, 'v5-experience-token-glyph')}
    </g>
    ${flowLabel(flow, from, to, labelPoint, index)}
  </g>`;
}

function stageNodes(scenario, positions) {
  const actorNames = positions.filter(position => scenario.flows.some(flow => flow.from === position.id)).map(position => position.name);
  const recipientNames = positions.filter(position => scenario.flows.some(flow => flow.to === position.id)).map(position => position.name);
  const actorDetail = short(actorNames.join(' + ') || positions[0]?.name || 'Participant', 20);
  const recipientDetail = short(recipientNames.join(' + ') || positions.at(-1)?.name || 'Recipient', 20);
  if (scenario.mode === 'chain') return [
    {key: 'actor', label: 'Actor', detail: actorDetail},
    {key: 'contract', label: 'Agreement', technical: 'Contract', detail: 'Rules checked'},
    {key: 'network', label: 'Network', detail: 'Testnet-10'},
    {key: 'recipient', label: 'Recipient', detail: recipientDetail},
  ];
  if (scenario.mode === 'local') return [
    {key: 'actor', label: 'Actor', detail: actorDetail},
    {key: 'rule', label: 'Town rule', detail: 'Saved game state'},
    {key: 'recipient', label: 'Recipient', detail: recipientDetail},
  ];
  if (scenario.mode === 'proposal') return [
    {key: 'actor', label: 'Actor', detail: actorDetail},
    {key: 'offer', label: 'Offer', detail: 'No assets moved'},
    {key: 'recipient', label: 'Recipient', detail: recipientDetail},
  ];
  return [
    {key: 'actor', label: 'Actor', detail: actorDetail},
    {key: 'watch', label: 'Read only', detail: 'Observe state'},
    {key: 'recipient', label: 'Recipient', detail: recipientDetail},
  ];
}

function currentStage(scenario, phase) {
  if (scenario.mode === 'chain') {
    return {problem: 'actor', acting: 'actor', submitting: 'contract', network: 'network', returning: 'recipient', result: 'recipient'}[phase] || 'actor';
  }
  if (scenario.mode === 'local') return {problem: 'actor', acting: 'rule', submitting: 'rule', network: 'rule', returning: 'recipient', result: 'recipient'}[phase] || 'actor';
  if (scenario.mode === 'proposal') return {problem: 'actor', acting: 'offer', submitting: 'offer', network: 'offer', returning: 'recipient', result: 'recipient'}[phase] || 'actor';
  return {problem: 'actor', acting: 'watch', submitting: 'watch', network: 'watch', returning: 'recipient', result: 'recipient'}[phase] || 'actor';
}

function phaseRibbon(scenario, phase, transaction, positions) {
  const nodes = stageNodes(scenario, positions);
  const activeKey = currentStage(scenario, phase);
  const accepted = scenario.mode === 'chain' ? transaction.accepted : phase === 'result';
  const labels = nodes.map((node, index) => {
    const complete = accepted && (index < nodes.length - 1 || phase === 'result');
    const active = node.key === activeKey;
    return `<span class="v5-experience-ribbon-step ${complete ? 'is-complete' : ''} ${active ? 'is-active' : ''}" data-ribbon-step="${node.key}" data-ribbon-state="${complete ? 'complete' : active ? 'active' : 'waiting'}"><i>${complete ? '✓' : index + 1}</i><b>${esc(node.label)}</b></span>`;
  });
  const separators = nodes.slice(0, -1).map((_, index) => `<span class="v5-experience-ribbon-arrow" aria-hidden="true">→</span>`);
  const markup = [];
  for (let index = 0; index < labels.length; index += 1) {
    markup.push(labels[index]);
    if (separators[index]) markup.push(separators[index]);
  }
  return `<div class="v5-experience-ribbon" data-experience-ribbon="${scenario.mode}" role="list" aria-label="${esc(nodes.map(node => node.label).join(' to '))}">${markup.join('')}</div>`;
}

function sceneCaption(scenario, phase, transaction, positions) {
  if (phase === 'problem' && scenario.problem) return scenario.problem;
  const first = positions[0]?.name || 'The actor';
  const flow = scenario.flows[0];
  const target = positions.find(position => position.id === flow?.to)?.name || 'the recipient';
  const good = bundleText(flow?.goods, 'the agreed goods');
  const acceptedBlock = short(transaction.acceptingBlock, 12);
  const needs = /^you$/i.test(first) ? 'need' : 'needs';
  if (scenario.mode === 'local') {
    return {
      problem: `${first} ${needs} ${good}.`,
      acting: `${scenario.actionLabel}…`,
      submitting: 'Applying the town rule.',
      network: 'Local rule · no network transaction.',
      returning: 'The town result is moving to the recipient.',
      result: `${short(scenario.resultTitle, 56)}: ${scenario.result}`,
    }[phase];
  }
  if (scenario.mode === 'proposal') {
    return {
      problem: `${first} ${needs} ${good}.`,
      acting: `${scenario.actionLabel}: draft the offer.`,
      submitting: 'Saving terms · no assets are moving.',
      network: 'Proposal only · no network acceptance.',
      returning: 'Terms are ready for the recipient to review.',
      result: `${short(scenario.resultTitle, 56)}: ${scenario.result}`,
    }[phase];
  }
  if (scenario.mode === 'observe') {
    return {
      problem: `${first} has a visible town state.`,
      acting: 'Reading the named actors and their holdings.',
      submitting: 'Read-only view · no transaction is submitted.',
      network: 'Read-only view · no network wait.',
      returning: 'The observed state remains unchanged.',
      result: `${short(scenario.resultTitle, 56)}: ${scenario.result}`,
    }[phase];
  }
  return {
    problem: `${first} ${needs} ${good}.`,
    acting: `${scenario.actionLabel}: agree who gives what.`,
    submitting: 'Signed transfer submitted · goods stay held.',
    network: transaction.accepted ? `Accepted by block ${acceptedBlock}.` : 'Awaiting network acceptance · outside blocks.',
    returning: transaction.accepted ? `Accepted by block ${acceptedBlock} · result returning.` : 'Awaiting network acceptance · result is held.',
    result: transaction.accepted ? `${short(scenario.resultTitle, 56)}: ${scenario.result}` : 'Awaiting network acceptance · nothing is marked delivered.',
  }[phase];
}

function transactionReceipt(scenario, phase, transaction) {
  if (!transaction.id || (scenario.mode === 'chain' && !transaction.accepted)) return '';
  const accepted = scenario.mode === 'chain' ? transaction.accepted : phase === 'result';
  const canInspect = /^[a-f0-9]{64}$/i.test(transaction.id);
  const inspect = canInspect
    ? `<a data-experience-transaction-link href="https://tn10.kaspa.stream/transactions/${esc(transaction.id)}" target="_blank" rel="noopener">Inspect transaction ↗</a>`
    : '';
  const block = transaction.acceptingBlock ? ` · accepting block ${short(transaction.acceptingBlock, 14)}` : ' · no accepting block yet';
  return `<div class="v5-experience-receipt" data-experience-receipt data-receipt-state="${accepted ? 'accepted' : 'pending'}"><span><b>${accepted ? 'Accepted transaction' : 'Transaction submitted'}</b><small data-transaction-id-text data-full-transaction-id="${esc(transaction.id)}" title="${esc(transaction.id)}">${esc(short(transaction.id, 18))}${esc(block)}</small></span>${inspect}</div>`;
}

function optionalDepth(scenario, transaction) {
  const hasRule = Boolean(scenario.rule);
  const hasTechnology = scenario.technology.length > 0;
  const hasBoundary = Boolean(scenario.boundary);
  if (!hasRule && !hasTechnology && !hasBoundary) return '';
  const rule = hasRule ? `<div class="v5-experience-depth-section" data-depth-rule><h4>Rule</h4><p data-experience-rule>${esc(scenario.rule)}</p></div>` : '';
  const technology = hasTechnology ? `<div class="v5-experience-depth-section" data-depth-technology><h4>Technology</h4>${scenario.technology.map(item => `<p data-technology-label="${esc(item.label)}"><b>${esc(item.label)}</b>${item.text ? ` · ${esc(item.text)}` : ''}</p>`).join('')}</div>` : '';
  const boundary = hasBoundary ? `<div class="v5-experience-depth-section" data-depth-boundary><h4>Boundary</h4><p data-experience-boundary-detail>${esc(scenario.boundary)}</p></div>` : '';
  const acceptance = transaction.accepted ? `<p class="v5-experience-accepting-block" data-accepting-block-text>Accepting block ${esc(transaction.acceptingBlock)}</p>` : '';
  return `<details class="v5-experience-depth" data-experience-depth><summary>Show the rule and boundary</summary>${rule}${technology}${boundary}${acceptance}</details>`;
}

function sceneSvg(scenario, phase, transaction, positions, id, progressValue) {
  const routeMarkup = scenario.flows.map((flow, index) => flowGraphic(flow, index, positions, scenario, phase, transaction)).join('');
  const actorMarkup = positions.map(actor => actorCard(actor, actor, scenario)).join('');
  const boardLabel = scenario.mode === 'chain' ? 'Goods and coin movement' : scenario.mode === 'local' ? 'Local game goods' : scenario.mode === 'proposal' ? 'Offer · no assets moved' : 'Read-only town state';
  return `<figure class="v5-experience-figure" data-experience-figure data-figure-state="${transaction.accepted ? (phase === 'returning' ? 'returning' : 'accepted') : 'pending'}">
    <svg class="v5-experience-svg" viewBox="0 0 400 220" role="img" aria-labelledby="${id}-visual-title ${id}-visual-description" data-progress="${progressValue ?? ''}">
      <title id="${id}-visual-title">${esc(boardLabel)}</title>
      <desc id="${id}-visual-description">${esc(sceneCaption(scenario, phase, transaction, positions))}</desc>
      <defs>
        <marker id="v5-experience-accepted-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="#2f805c"/></marker>
        <marker id="v5-experience-returning-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="#2d7190"/></marker>
        <marker id="v5-experience-pending-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="#b7792e"/></marker>
        <marker id="v5-experience-held-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="#8da59a"/></marker>
      </defs>
      <rect class="v5-experience-board" x="4" y="4" width="392" height="212" rx="18"/>
      <text class="v5-experience-board-label" x="14" y="23">${esc(boardLabel)}</text>
      <g class="v5-experience-flow-layer" data-experience-flow-layer>${routeMarkup}</g>
      <g class="v5-experience-actor-layer" data-experience-actor-layer>${actorMarkup}</g>
    </svg>
    ${['problem','result'].includes(phase) ? '' : `<figcaption class="v5-experience-caption" data-experience-caption data-current-caption>${esc(sceneCaption(scenario, phase, transaction, positions))}</figcaption>`}
  </figure>`;
}

/**
 * Render one stable visual scene for the V5 town story.
 *
 * Schema is intentionally read-only. `phase` belongs to the caller and may be
 * advanced independently of `transaction`; a chain result is green only when
 * transaction.status === "accepted" and transaction.acceptingBlock is present.
 */
export function renderV5ExperienceScene({scenario: inputScenario = {}, phase: inputPhase = 'problem', transaction: inputTransaction = {}, progress: inputProgress} = {}) {
  const scenario = normalizeScenario(inputScenario);
  const phase = phaseOf(inputPhase);
  const transaction = normalizeTransaction(inputTransaction);
  const positions = normalizeActorPositions(scenario.actors.length ? scenario.actors : [{id: 'actor-1', name: 'Actor', gives: {}, receives: {}}]);
  const progressValue = Number.isFinite(Number(inputProgress)) ? clamp(Number(inputProgress)) : null;
  const id = `v5-experience-${slug(scenario.id)}`;
  const accepted = transaction.accepted;
  const dataProgress = progressValue === null ? '' : String(progressValue);
  const operation = transaction.operation || scenario.actionLabel;
  const transactionStatus = transaction.status || 'ready';
  return `<section class="v5-experience-scene v5-experience-scene--${scenario.mode} v5-experience-scene--${phase}" data-v5-experience-scene data-experience-scene aria-label="${esc(scenario.title)}" data-scenario-id="${esc(scenario.id)}" data-scene-id="${esc(scenario.id)}" data-room="${esc(scenario.room)}" data-mode="${scenario.mode}" data-phase="${phase}" data-current-phase="${phase}" data-transaction-id="${esc(transaction.id)}" data-transaction-status="${esc(transactionStatus)}" data-accepting-block="${esc(transaction.acceptingBlock)}" data-operation="${esc(operation)}" data-progress="${esc(dataProgress)}" data-network-state="${scenario.mode === 'chain' ? (accepted ? 'accepted' : 'awaiting') : 'not-applicable'}" data-accepted="${accepted}" data-result-ack="${phase === 'result' && (scenario.mode !== 'chain' || accepted)}" data-action-label="${esc(scenario.actionLabel)}" style="--v5-experience-progress:${progressValue === null ? 0 : progressValue}">
    <header class="v5-experience-header">
      <div><span class="v5-experience-kicker">${scenario.mode === 'proposal' ? 'Proposed exchange' : !scenario.flows.length ? 'Who takes part' : phase === 'result' ? 'Who received what' : 'Who gives what'}</span></div>
      <span class="v5-experience-action" data-experience-action>${esc(scenario.actionLabel)}</span>
    </header>
    ${phaseRibbon(scenario, phase, transaction, positions)}
    ${sceneSvg(scenario, phase, transaction, positions, id, progressValue)}
    ${transactionReceipt(scenario, phase, transaction)}
    ${optionalDepth(scenario, transaction)}
  </section>`;
}
