(function () {
  const supplyEl = document.getElementById("live-supply");
  const minedEl = document.getElementById("live-mined");
  const blocksEl = document.getElementById("live-blocks");
  const daaEl = document.getElementById("live-daa");
  const updatedEl = document.getElementById("live-updated");
  const statusEl = document.getElementById("live-status-light");

  if (!supplyEl || !minedEl || !blocksEl || !daaEl || !updatedEl || !statusEl) return;

  const formatInteger = (value) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const formatSompiAsKas = (sompi) => {
    const raw = BigInt(sompi);
    const whole = raw / 100000000n;
    return `${formatInteger(whole)} KAS`;
  };

  const setStatus = (state, label) => {
    statusEl.dataset.state = state;
    statusEl.querySelector("strong").textContent = label;
  };

  const loadLiveKaspa = async () => {
    try {
      const [supplyResponse, dagResponse] = await Promise.all([
        fetch("https://api.kaspa.org/info/coinsupply", { cache: "no-store" }),
        fetch("https://api.kaspa.org/info/blockdag", { cache: "no-store" })
      ]);

      if (!supplyResponse.ok || !dagResponse.ok) {
        throw new Error("Live API returned a non-OK response.");
      }

      const [supply, dag] = await Promise.all([supplyResponse.json(), dagResponse.json()]);
      const circulating = BigInt(supply.circulatingSupply);
      const max = BigInt(supply.maxSupply);
      const minedRatio = (Number(circulating) / Number(max)) * 100;

      supplyEl.textContent = formatSompiAsKas(supply.circulatingSupply);
      minedEl.textContent = `${minedRatio.toFixed(2)}%`;
      blocksEl.textContent = formatInteger(dag.blockCount || "0");
      daaEl.textContent = formatInteger(dag.virtualDaaScore || "0");
      updatedEl.textContent = `Last checked ${new Date().toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      })}. API reads are best-effort.`;
      setStatus("ok", "Live");
    } catch (error) {
      supplyEl.textContent = "Unavailable";
      minedEl.textContent = "Unavailable";
      blocksEl.textContent = "Unavailable";
      daaEl.textContent = "Unavailable";
      updatedEl.textContent = "Live read failed. Use the explorer, DAGVIZ, or your own node for a direct check.";
      setStatus("error", "Offline");
    }
  };

  loadLiveKaspa();
})();
