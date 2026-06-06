(function () {
  const root = document.querySelector("[data-pitch-checker]");
  if (!root) return;

  const input = root.querySelector("[data-pitch-input]");
  const scoreEl = root.querySelector("[data-pitch-score]");
  const verdictEl = root.querySelector("[data-pitch-verdict]");
  const resultsEl = root.querySelector("[data-pitch-results]");
  const copyButton = root.querySelector("[data-pitch-copy]");
  const copyStatus = root.querySelector("[data-pitch-copy-status]");
  const sampleButtons = Array.from(root.querySelectorAll("[data-pitch-sample]"));

  const checks = [
    {
      id: "user",
      label: "Specific user",
      question: "Who is the exact user?",
      terms: ["trader", "wallet", "merchant", "miner", "exchange", "developer", "issuer", "founder", "lp", "market maker", "fund", "consumer", "creator"]
    },
    {
      id: "job",
      label: "Concrete job",
      question: "What does the user do?",
      terms: ["send", "swap", "borrow", "lend", "launch", "mint", "redeem", "escrow", "pay", "sign", "verify", "stake", "route", "settle", "withdraw"]
    },
    {
      id: "liquidity",
      label: "Liquidity source",
      question: "Where does the first liquidity or demand come from?",
      terms: ["liquidity", "lp", "market maker", "stablecoin", "treasury", "revenue", "volume", "buyers", "collateral", "pool", "spread"]
    },
    {
      id: "wallet",
      label: "Wallet flow",
      question: "Who signs what, and what does the user see?",
      terms: ["wallet", "sign", "signature", "transaction", "custody", "seed", "recovery", "address", "utxo", "history"]
    },
    {
      id: "status",
      label: "Status",
      question: "Is it live, ecosystem tooling, testnet, roadmap, or research?",
      terms: ["live", "mainnet", "testnet", "tn12", "toccata", "roadmap", "research", "prototype", "krc", "activation", "release"]
    },
    {
      id: "evidence",
      label: "Evidence",
      question: "What can someone verify?",
      terms: ["txid", "source", "docs", "code", "audit", "release", "explorer", "api", "accepted", "metrics", "users", "integration"]
    },
    {
      id: "risk",
      label: "Failure mode",
      question: "What breaks or gets abused?",
      terms: ["risk", "fail", "abuse", "exploit", "oracle", "liquidation", "downtime", "scam", "insider", "bot", "refund", "rollback"]
    },
    {
      id: "retention",
      label: "Day-two behavior",
      question: "Why does anyone come back after launch?",
      terms: ["retention", "repeat", "daily", "weekly", "support", "integration", "revenue", "workflow", "subscription", "usage"]
    }
  ];

  const samples = {
    launchpad: "A KRC-aware launch tool for event credits. Organizers mint access passes, users redeem them at a wallet check-in, and the app shows accepted transaction evidence plus off-chain redemption status. Liquidity is not promised unless an issuer adds a separate pool.",
    agent: "An AI agent task board where a developer posts a bounty, a worker submits proof, and a wallet signs release or refund transactions. TN12 examples are testnet evidence only; mainnet would need wallet, indexer, and rule-enforcement paths.",
    wallet: "A consumer wallet mode for Kaspa newcomers that explains every signature, tracks KAS and KRC objects, warns about unknown launch pages, and links each balance/history view to explorer or API evidence.",
    vault: "A team vault prototype where a budget cannot drain at once. Users need a clear wallet approval flow, accepted transaction evidence, failure recovery, and a status label separating TN12 proof from mainnet availability."
  };

  function normalize(value) {
    return value.toLowerCase();
  }

  function runChecks() {
    const text = normalize(input.value);
    const hasText = text.trim().length > 0;
    const results = checks.map((check) => ({
      ...check,
      passed: hasText && check.terms.some((term) => text.includes(term))
    }));
    const score = results.filter((item) => item.passed).length;
    scoreEl.textContent = hasText ? `${score}/${checks.length}` : "Start";
    verdictEl.textContent = verdict(score, hasText);
    resultsEl.innerHTML = results.map((item) => {
      const state = hasText ? (item.passed ? "pass" : "miss") : "neutral";
      const label = hasText ? (item.passed ? "Keyword found" : "Not found") : "Question";
      return `
      <article class="${state}">
        <span>${label}</span>
        <strong>${item.label}</strong>
        <p>${item.question}</p>
      </article>
    `;
    }).join("");
  }

  function redTeamPrompt() {
    const pitch = input.value.trim() || "Paste a Kaspa product pitch here.";
    return [
      "Red-team this Kaspa product pitch using the Reality Check framework.",
      "",
      `Pitch: ${pitch}`,
      "",
      "Check: specific user, concrete job, liquidity source, wallet/signing flow, live/testnet/roadmap status, evidence, failure modes, and day-two behavior.",
      "Then say what would make the idea real, what is missing, and which claims should not be repeated yet."
    ].join("\n");
  }

  function verdict(score, hasText) {
    if (!hasText) return "Paste a pitch to start.";
    if (score <= 2) return "Keyword scan: few product basics found.";
    if (score <= 5) return "Keyword scan: partial coverage only.";
    if (score <= 7) return "Keyword scan: most basics mentioned.";
    return "Keyword scan: now verify the answers.";
  }

  input.addEventListener("input", runChecks);
  copyButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(redTeamPrompt());
      copyStatus.textContent = "Red-team prompt copied.";
    } catch (error) {
      copyStatus.textContent = "Copy is blocked. Select the pitch text and copy it manually.";
    }
  });
  sampleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      input.value = samples[button.dataset.pitchSample] || "";
      runChecks();
    });
  });

  runChecks();
})();
