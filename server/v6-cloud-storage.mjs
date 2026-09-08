// Durable state adapter for the Cloudflare V6 container.
//
// The container is deliberately stateless.  The Worker Durable Object owns
// the records; this adapter keeps one private snapshot in memory and writes
// every mutation with an optimistic compare-and-swap revision.  A write whose
// result is uncertain poisons the process so no later request can prepare a
// second transaction against an unknown state.

export const MAX_STATE_BYTES = 16 * 1024 * 1024;
export const DEFAULT_BRIDGE_TIMEOUT_MS = 15000;

const objectOf = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export class CloudStateError extends Error {
  constructor(message, {status = 503, code = 'cloud_state_unavailable', poison = false, cause = null} = {}) {
    super(message, cause ? {cause} : undefined);
    this.name = 'CloudStateError';
    this.status = status;
    this.code = code;
    this.poison = poison;
    this.publicMessage = poison
      ? 'The shared V6 state is unavailable. No new transaction was sent.'
      : message;
  }
}

export class CloudStatePoisonedError extends CloudStateError {
  constructor(message = 'The shared V6 state is unavailable.') {
    super(message, {status: 503, code: 'cloud_state_poisoned', poison: true});
    this.name = 'CloudStatePoisonedError';
  }
}

function jsonClone(value, label = 'state') {
  let text;
  try {
    text = JSON.stringify(value);
  } catch (error) {
    throw new CloudStateError(`The ${label} is not JSON serializable.`, {
      status: 400,
      code: 'state_not_json',
      cause: error,
    });
  }
  if (typeof text !== 'string') throw new CloudStateError(`The ${label} is not JSON serializable.`, {status: 400, code: 'state_not_json'});
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new CloudStateError(`The ${label} is not JSON serializable.`, {status: 400, code: 'state_not_json', cause: error});
  }
}

function byteLength(text) {
  return new TextEncoder().encode(text).byteLength;
}

function encodeRecords(records, maxBytes = MAX_STATE_BYTES) {
  const text = JSON.stringify(records);
  if (byteLength(text) > maxBytes) {
    throw new CloudStateError('The shared V6 state is too large.', {status: 413, code: 'state_too_large'});
  }
  return text;
}

function validateRevision(value, {allowZero = true} = {}) {
  if (!Number.isSafeInteger(value) || value < (allowZero ? 0 : 1)) {
    throw new CloudStatePoisonedError('The state bridge returned an invalid revision.');
  }
  return value;
}

function validateRecords(value) {
  if (!objectOf(value)) throw new CloudStatePoisonedError('The state bridge returned invalid records.');
  // Clone through JSON to reject BigInt, functions and mutable references and
  // to ensure that no prototype supplied by a remote response is retained.
  const records = jsonClone(value, 'bridge records');
  if (!objectOf(records)) throw new CloudStatePoisonedError('The state bridge returned invalid records.');
  return records;
}

async function boundedResponseText(response, maxBytes) {
  if (!response || typeof response !== 'object') throw new CloudStatePoisonedError('The state bridge returned no response.');
  const advertised = Number(response.headers?.get?.('content-length') || 0);
  if (Number.isFinite(advertised) && advertised > maxBytes) {
    throw new CloudStatePoisonedError('The state bridge response is too large.');
  }
  let text;
  try {
    text = await response.text();
  } catch (error) {
    throw new CloudStatePoisonedError('The state bridge response could not be read.');
  }
  if (typeof text !== 'string' || byteLength(text) > maxBytes) throw new CloudStatePoisonedError('The state bridge response is too large.');
  return text;
}

async function responseJson(response, maxBytes) {
  const text = await boundedResponseText(response, maxBytes);
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new CloudStatePoisonedError('The state bridge returned invalid JSON.');
  }
}

function headerMap(token, hasBody = false) {
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    'Cache-Control': 'no-store',
  };
  if (hasBody) headers['Content-Type'] = 'application/json';
  return headers;
}

/**
 * A JSON-safe, revisioned state store backed by the Worker bridge.
 *
 * The public surface intentionally mirrors the local store used by V5/V6:
 * `get(key)` returns a clone and `put(values)` atomically replaces the named
 * records in the current snapshot.  Callers must serialize their own writes
 * (the Cloud runtime does this through its request queue); a concurrent CAS
 * conflict is treated as a terminal process condition by design.
 */
export class V6CloudStorage {
  constructor({
    bridgeUrl = process.env.V6_STATE_BRIDGE_URL,
    bridgeToken = process.env.V6_STATE_BRIDGE_TOKEN,
    fetchImpl = globalThis.fetch,
    maxBytes = MAX_STATE_BYTES,
    timeoutMs = DEFAULT_BRIDGE_TIMEOUT_MS,
    now = () => Date.now(),
  } = {}) {
    this.bridgeUrl = typeof bridgeUrl === 'string' ? bridgeUrl.trim() : '';
    this.bridgeToken = typeof bridgeToken === 'string' ? bridgeToken : '';
    this.fetchImpl = fetchImpl;
    this.maxBytes = maxBytes;
    this.timeoutMs = timeoutMs;
    this.now = now;
    this.records = null;
    this.revision = null;
    this.loaded = false;
    this.loadPromise = null;
    this.poisoned = false;
    this.poisonReason = null;
    this.lastLoadedAt = null;
    this.lastWrittenAt = null;
  }

  get isPoisoned() { return this.poisoned; }

  snapshot() {
    return {
      loaded: this.loaded,
      revision: this.revision,
      poisoned: this.poisoned,
      lastLoadedAt: this.lastLoadedAt,
      lastWrittenAt: this.lastWrittenAt,
    };
  }

  poison(error) {
    this.poisoned = true;
    this.poisonReason = error instanceof Error ? error.message : String(error || 'unknown state error');
    return error instanceof CloudStatePoisonedError
      ? error
      : new CloudStatePoisonedError(this.poisonReason);
  }

  assertUsable() {
    if (this.poisoned) throw new CloudStatePoisonedError(this.poisonReason || 'The shared V6 state is unavailable.');
    if (!this.bridgeUrl || !/^https?:\/\//i.test(this.bridgeUrl)) {
      throw new CloudStateError('The V6 state bridge is not configured.', {status: 503, code: 'state_bridge_not_configured'});
    }
    if (!this.bridgeToken) {
      throw new CloudStateError('The V6 state bridge token is not configured.', {status: 503, code: 'state_bridge_not_configured'});
    }
    if (typeof this.fetchImpl !== 'function') {
      throw new CloudStateError('The V6 state bridge client is unavailable.', {status: 503, code: 'state_bridge_unavailable'});
    }
  }

  async fetchWithTimeout(url, init) {
    let timer;
    let controller;
    let signal = init?.signal;
    if (!signal && Number.isFinite(this.timeoutMs) && this.timeoutMs > 0 && typeof AbortController === 'function') {
      controller = new AbortController();
      signal = controller.signal;
      timer = setTimeout(() => controller.abort(), this.timeoutMs);
    }
    try {
      return await this.fetchImpl(url, {...init, ...(signal ? {signal} : {})});
    } catch (error) {
      throw new CloudStateError('The V6 state bridge did not respond.', {status: 503, code: 'state_bridge_unavailable', cause: error});
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async load() {
    if (this.poisoned) throw new CloudStatePoisonedError(this.poisonReason || 'The shared V6 state is unavailable.');
    if (this.loaded) return this.snapshotRecords();
    if (this.loadPromise) return this.loadPromise;
    this.loadPromise = (async () => {
      this.assertUsable();
      const response = await this.fetchWithTimeout(this.bridgeUrl, {method: 'GET', headers: headerMap(this.bridgeToken)});
      if (!response.ok) {
        // A failed GET does not imply that a write happened.  Leave the store
        // retryable while preventing any API work from running without state.
        throw new CloudStateError('The V6 state bridge is unavailable.', {status: 503, code: 'state_bridge_unavailable'});
      }
      const body = await responseJson(response, this.maxBytes);
      if (!objectOf(body) || !Object.prototype.hasOwnProperty.call(body, 'records')) {
        throw this.poison(new CloudStatePoisonedError('The state bridge returned an incomplete snapshot.'));
      }
      let records;
      try { records = validateRecords(body.records); } catch (error) { throw this.poison(error); }
      if (byteLength(JSON.stringify(records)) > this.maxBytes) throw this.poison(new CloudStatePoisonedError('The shared V6 state is too large.'));
      let revision;
      try { revision = validateRevision(Number(body.revision)); } catch (error) { throw this.poison(error); }
      this.records = records;
      this.revision = revision;
      this.loaded = true;
      this.lastLoadedAt = this.now();
      return this.snapshotRecords();
    })();
    try {
      return await this.loadPromise;
    } finally {
      this.loadPromise = null;
    }
  }

  async hydrate() { return this.load(); }

  snapshotRecords() {
    if (!this.loaded || !this.records) return {};
    return jsonClone(this.records, 'state snapshot');
  }

  async get(key) {
    if (typeof key !== 'string' || !key || key.length > 512) throw new CloudStateError('The V6 state key is invalid.', {status: 400, code: 'state_key_invalid'});
    await this.load();
    return Object.prototype.hasOwnProperty.call(this.records, key) ? jsonClone(this.records[key], `state record ${key}`) : undefined;
  }

  async put(values) {
    if (!objectOf(values)) throw new CloudStateError('The V6 state update is invalid.', {status: 400, code: 'state_update_invalid'});
    await this.load();
    this.assertUsable();
    const patch = jsonClone(values, 'state update');
    if (!objectOf(patch) || Object.keys(patch).some(key => !key || key.length > 512)) throw new CloudStateError('The V6 state update is invalid.', {status: 400, code: 'state_update_invalid'});
    const next = {...this.records};
    for (const [key, value] of Object.entries(patch)) next[key] = value;
    const recordsText = encodeRecords(next, this.maxBytes);
    const expectedRevision = this.revision;
    let response;
    try {
      response = await this.fetchWithTimeout(this.bridgeUrl, {
        method: 'PUT',
        headers: headerMap(this.bridgeToken, true),
        body: JSON.stringify({revision: expectedRevision, records: JSON.parse(recordsText)}),
      });
    } catch (error) {
      // A network timeout can have happened after the Worker committed.  The
      // local copy therefore cannot be safely used for another transaction.
      throw this.poison(error);
    }
    if (response.status === 409 || response.status === 412) throw this.poison(new CloudStatePoisonedError('The state bridge revision changed.'));
    if (!response.ok) throw this.poison(new CloudStatePoisonedError('The state bridge did not confirm the write.'));
    let body;
    try { body = await responseJson(response, 1024 * 1024); } catch (error) { throw this.poison(error); }
    let revision;
    try { revision = validateRevision(Number(body?.revision), {allowZero: false}); } catch (error) { throw this.poison(error); }
    if (revision !== expectedRevision + 1) throw this.poison(new CloudStatePoisonedError('The state bridge confirmed an unexpected revision.'));
    this.records = JSON.parse(recordsText);
    this.revision = revision;
    this.lastWrittenAt = this.now();
    return this.snapshotRecords();
  }
}

export const createV6CloudStorage = options => new V6CloudStorage(options);
