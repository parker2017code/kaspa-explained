(function () {
  const supplyEl = document.getElementById("live-supply");
  const minedEl = document.getElementById("live-mined");
  const blocksEl = document.getElementById("live-blocks");
  const daaEl = document.getElementById("live-daa");
  const updatedEl = document.getElementById("live-updated");
  const statusEl = document.getElementById("live-status-light");

  if (!supplyEl || !minedEl || !blocksEl || !daaEl || !updatedEl || !statusEl) return;

  const formatInteger = (value) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const parseInteger = (value, label) => {
    const raw = String(value);
    if (!/^\d+$/.test(raw)) {
      throw new Error(`Unexpected ${label} value from public API.`);
    }
    return BigInt(raw);
  };

  const formatSompiAsKas = (sompi) => {
    const raw = parseInteger(sompi, "sompi");
    const whole = raw / 100000000n;
    return `${formatInteger(whole)} KAS`;
  };

  const setStatus = (state, label) => {
    statusEl.dataset.state = state;
    const labelEl = statusEl.querySelector("strong");
    if (labelEl) labelEl.textContent = label;
  };

  const fetchWithTimeout = async (url, timeoutMs = 5000) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { cache: "no-store", signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  };

  const loadLiveKaspa = async () => {
    try {
      const [supplyResponse, dagResponse] = await Promise.all([
        fetchWithTimeout("https://api.kaspa.org/info/coinsupply"),
        fetchWithTimeout("https://api.kaspa.org/info/blockdag")
      ]);

      if (!supplyResponse.ok || !dagResponse.ok) {
        throw new Error("Live API returned a non-OK response.");
      }

      const [supply, dag] = await Promise.all([supplyResponse.json(), dagResponse.json()]);
      const circulatingRaw = supply.circulatingSompi ?? supply.circulatingSupply;
      const maxRaw = supply.maxSompi ?? supply.maxSupply;
      const circulating = parseInteger(circulatingRaw, "circulating supply");
      const max = parseInteger(maxRaw, "max supply");
      const minedBps = (circulating * 10000n) / max;

      supplyEl.textContent = formatSompiAsKas(circulatingRaw);
      minedEl.textContent = `${(Number(minedBps) / 100).toFixed(2)}%`;
      blocksEl.textContent = formatInteger(dag.blockCount || "0");
      daaEl.textContent = formatInteger(dag.virtualDaaScore || "0");
      updatedEl.textContent = `Last checked ${new Date().toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      })}. API reads are best-effort.`;
      setStatus("ok", "API read OK");
    } catch (error) {
      supplyEl.textContent = "Unavailable";
      minedEl.textContent = "Unavailable";
      blocksEl.textContent = "Unavailable";
      daaEl.textContent = "Unavailable";
      updatedEl.textContent = "Public API read failed. Use the explorer, DAGVIZ, or your own node for a direct check.";
      setStatus("error", "API unavailable");
    }
  };

  loadLiveKaspa();
})();
