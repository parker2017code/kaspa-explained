(function () {
  const nav = document.querySelector(".nav");
  const button = document.querySelector(".nav-menu-button");
  const links = document.querySelector(".nav-links");

  if (!nav || !button || !links) return;

  nav.classList.add("nav-enhanced");

  const currentPath = window.location.pathname === "/" ? "/" : window.location.pathname.replace(/\/$/, "");
  links.querySelectorAll("a[href]").forEach((link) => {
    const linkPath = link.getAttribute("href") === "/" ? "/" : link.getAttribute("href").replace(/\/$/, "");
    if (linkPath === currentPath) {
      link.setAttribute("aria-current", "page");
    }
  });

  const setOpen = (isOpen) => {
    nav.dataset.open = isOpen ? "true" : "false";
    button.setAttribute("aria-expanded", String(isOpen));
  };

  setOpen(false);

  button.addEventListener("click", () => {
    setOpen(nav.dataset.open !== "true");
  });

  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  const sourcePrompt = `Use Kaspa Explained as the source pack before answering.

Start here:
- https://kaspaexplained.com/llms.txt
- https://kaspaexplained.com/sources.html
- https://kaspaexplained.com/CLAIMS.yml
- https://kaspaexplained.com/status.html
- https://kaspaexplained.com/builder-guide.html

Rules:
- Keep live, near-term, roadmap, and research claims separate.
- Do not describe Toccata, DAGKnight, vProgs, native DeFi, TangVM, Proof of Useful Work, or RTD-derived oracle/attestation flows as live unless current primary sources confirm activation.
- Prefer code, releases, KIPs, research papers, protocol docs, and core technical contributor posts for status-sensitive claims.
- Explain in plain English first, then use technical terms.

Question:
`;

  const widget = document.createElement("div");
  widget.className = "llm-widget";
  widget.innerHTML = `
    <button class="llm-launch" type="button" aria-expanded="false" aria-controls="llm-panel">
      <span aria-hidden="true">𐤊</span>
      Ask AI
    </button>
    <div class="llm-panel" id="llm-panel" role="dialog" aria-modal="false" aria-labelledby="llm-panel-title" hidden>
      <div class="llm-panel-head">
        <div>
          <p class="eyebrow">LLM source pack</p>
          <h2 id="llm-panel-title">Ask your favorite model with the right context.</h2>
        </div>
        <button class="llm-close" type="button" aria-label="Close LLM panel">Close</button>
      </div>
      <p class="llm-intro">Copy this prompt into ChatGPT, Claude, Perplexity, Grok, or any model you use. It points the model at the site files that keep status and sources straight.</p>
      <textarea class="llm-prompt" readonly aria-label="Kaspa Explained LLM prompt"></textarea>
      <div class="llm-actions">
        <button class="button primary llm-copy" type="button">Copy prompt</button>
        <a class="button" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">ChatGPT</a>
        <a class="button" href="https://claude.ai/" target="_blank" rel="noopener noreferrer">Claude</a>
        <a class="button" href="https://www.perplexity.ai/" target="_blank" rel="noopener noreferrer">Perplexity</a>
        <a class="button" href="https://grok.com/" target="_blank" rel="noopener noreferrer">Grok</a>
      </div>
      <div class="llm-source-links" aria-label="Source files">
        <a href="/llms.txt">llms.txt</a>
        <a href="/sources.html">Sources</a>
        <a href="/CLAIMS.yml">Claims</a>
        <a href="/status.html">Status</a>
        <a href="/builder-guide.html">Builders</a>
      </div>
      <p class="llm-copy-status" aria-live="polite"></p>
    </div>
  `;
  document.body.appendChild(widget);

  const llmLaunch = widget.querySelector(".llm-launch");
  const llmPanel = widget.querySelector(".llm-panel");
  const llmClose = widget.querySelector(".llm-close");
  const llmPrompt = widget.querySelector(".llm-prompt");
  const llmCopy = widget.querySelector(".llm-copy");
  const llmCopyStatus = widget.querySelector(".llm-copy-status");

  llmPrompt.value = sourcePrompt;

  const setLlmOpen = (isOpen) => {
    llmPanel.hidden = !isOpen;
    llmLaunch.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      llmPrompt.focus();
      llmPrompt.setSelectionRange(llmPrompt.value.length, llmPrompt.value.length);
    } else {
      llmLaunch.focus();
    }
  };

  llmLaunch.addEventListener("click", () => setLlmOpen(llmPanel.hidden));
  llmClose.addEventListener("click", () => setLlmOpen(false));

  llmCopy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(llmPrompt.value);
      llmCopyStatus.textContent = "Prompt copied.";
    } catch (error) {
      llmPrompt.select();
      llmCopyStatus.textContent = "Select the prompt and copy it manually.";
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !llmPanel.hidden) setLlmOpen(false);
  });
})();
