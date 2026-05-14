(function () {
  const root = document.querySelector("[data-ai-ask]");
  if (!root) return;

  const question = root.querySelector("[data-ai-question]");
  const custom = root.querySelector("[data-ai-custom]");
  const promptBox = root.querySelector("[data-ai-prompt]");
  const copyButton = root.querySelector("[data-ai-copy]");
  const status = root.querySelector("[data-ai-status]");
  const sourceInputs = Array.from(root.querySelectorAll("[data-ai-source]"));
  const openLinks = Array.from(root.querySelectorAll("[data-ai-open]"));
  const presetButtons = Array.from(root.querySelectorAll("[data-ai-preset]"));
  const siteOrigin = "https://kaspaexplained.com";
  const transferKey = "kaspa-explained-reality-redteam-prompt";

  const tasks = {
    short: "Give me the short, accurate explanation of Kaspa for a smart reader who is not a protocol engineer.",
    blockdag: "Explain blockchain versus blockDAG. Use plain language first, then the technical version. Include why ordering still matters.",
    status: "Check the claim I provide and classify each part as live mainnet, testnet evidence, targeted upgrade, roadmap, research, or unverified.",
    builder: "Show the builder path for Kaspa: running a node, using hosted APIs, wallet or payment work, KRC tooling, and TN12 or covenant-related work. Separate live paths from future paths.",
    compare: "Compare Kaspa to Bitcoin, Ethereum, Solana, and other fast chains without tribal framing. Explain the actual design differences, tradeoffs, and claim boundaries.",
    design: "Generate three useful Kaspa app, product, or research ideas. For each one, state the user job, what can be built now, what needs Toccata or later work, and what evidence would prove it.",
    redteam: "Red-team a bullish Kaspa claim or product pitch. Identify the user, job, liquidity source, wallet flow, evidence, live-versus-roadmap mixing, failure modes, and strongest counterargument.",
    roadmap: "Separate Crescendo, KRC tooling, Toccata, vProgs, DAGKnight, and app-layer claims. For each, say what is live, what is targeted, what is research, and where to verify it.",
    safety: "Explain wallets, mining, nodes, and common safety checks for someone trying not to rely on hype or unsafe links.",
    skeptical: "Give me the skeptical case for Kaspa. List the strongest concerns, the evidence that exists, and what would need fresh verification."
  };

  const presets = {
    status: {
      question: "status",
      custom: "Paste a Kaspa claim here. Classify each part and show which source would verify it."
    },
    builder: {
      question: "builder",
      custom: "I want to build something useful on or around Kaspa. Give me the practical path, current tools, and what not to claim yet."
    },
    redteam: {
      question: "redteam",
      custom: "Challenge the strongest version of this Kaspa pitch without lazy dismissal or price talk. Test user, job, liquidity, wallet flow, evidence, status boundary, failure modes, and day-two behavior."
    },
    design: {
      question: "design",
      custom: "Create product ideas that fit Kaspa's real strengths: fast PoW settlement feel, UTXO records, public commitments, wallets, APIs, and future covenant-style rules."
    }
  };

  const destinations = {
    chatgpt: (prompt) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
    claude: (prompt) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
    perplexity: (prompt) => `https://www.perplexity.ai/search/new?q=${encodeURIComponent(prompt)}`,
    grok: (prompt) => `https://grok.com/?q=${encodeURIComponent(prompt)}`
  };

  const params = new URLSearchParams(window.location.search);

  function sourceUrl(path) {
    return new URL(path, siteOrigin).href;
  }

  function selectedSources() {
    return sourceInputs
      .filter((input) => input.checked)
      .map((input) => `- ${input.dataset.label}: ${sourceUrl(input.value)}`);
  }

  function buildPrompt() {
    const sourceLines = selectedSources();
    const extra = custom.value.trim();
    return [
      "Use Kaspa Explained as the starting source trail for this Kaspa question.",
      "",
      `Task: ${tasks[question.value] || tasks.short}`,
      extra ? `My context: ${extra}` : "My context: no extra context provided.",
      "",
      "Use these sources first:",
      ...(sourceLines.length ? sourceLines : ["- Kaspa Explained sources: https://kaspaexplained.com/sources.html"]),
      "",
      "Answer rules:",
      "- Separate live mainnet behavior, testnet evidence, targeted upgrades, roadmap work, research, and unverified claims.",
      "- Cite the specific source URLs you used.",
      "- Say when a claim needs current verification.",
      "- Keep the answer plain and concise.",
      "- Do not make price predictions or investment advice."
    ].join("\n");
  }

  function renderPrompt() {
    promptBox.value = buildPrompt();
    openLinks.forEach((link) => {
      const buildUrl = destinations[link.dataset.aiOpen];
      if (buildUrl) link.href = buildUrl(promptBox.value);
    });
  }

  function applyUrlState() {
    const mode = params.get("mode") || params.get("question");
    if (mode && tasks[mode]) question.value = mode;
    try {
      const storedPrompt = window.sessionStorage.getItem(transferKey);
      if (storedPrompt) {
        custom.value = storedPrompt;
        window.sessionStorage.removeItem(transferKey);
        status.textContent = "Reality check prompt loaded from this browser session.";
      }
    } catch (error) {
      // Session storage is an enhancement; copy/paste still works.
    }
  }

  async function copyPrompt(showStatus = true) {
    renderPrompt();
    try {
      await navigator.clipboard.writeText(promptBox.value);
      if (showStatus) status.textContent = "Prompt copied.";
      return true;
    } catch (error) {
      promptBox.focus();
      promptBox.select();
      document.execCommand("copy");
      if (showStatus) status.textContent = "Prompt selected. Copy it if your browser blocked clipboard access.";
      return false;
    }
  }

  question.addEventListener("change", renderPrompt);
  custom.addEventListener("input", renderPrompt);
  sourceInputs.forEach((input) => input.addEventListener("change", renderPrompt));
  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const preset = presets[button.dataset.aiPreset];
      if (!preset) return;
      question.value = preset.question;
      custom.value = preset.custom;
      renderPrompt();
      status.textContent = `${button.textContent} prompt loaded.`;
    });
  });
  copyButton.addEventListener("click", () => copyPrompt(true));
  openLinks.forEach((link) => {
    link.addEventListener("click", async (event) => {
      event.preventDefault();
      await copyPrompt(false);
      status.textContent = `Copied. Opening ${link.textContent}.`;
      window.open(link.href, "_blank", "noopener,noreferrer");
    });
  });

  applyUrlState();
  renderPrompt();
})();
