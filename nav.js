(function () {
  initLlmWidget();

  const nav = document.querySelector(".nav");
  const button = document.querySelector(".nav-menu-button");
  const links = document.querySelector(".nav-links");

  if (!nav || !button || !links) return;

  nav.classList.add("nav-enhanced");

  const themeKey = "kaspa-explained-theme";
  const themeParam = new URLSearchParams(window.location.search).get("theme");
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem(themeKey);
  } catch (error) {
    savedTheme = null;
  }
  const initialTheme = themeParam === "light" || themeParam === "dark" ? themeParam : savedTheme;
  document.documentElement.dataset.theme = initialTheme === "light" ? "light" : "dark";

  const themeToggle = nav.querySelector(".theme-toggle");

  if (themeToggle) {
    const renderThemeToggle = () => {
      const isLight = document.documentElement.dataset.theme === "light";
      themeToggle.textContent = isLight ? "Dark" : "Light";
      themeToggle.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} mode`);
      themeToggle.title = `Switch to ${isLight ? "dark" : "light"} mode`;
    };

    themeToggle.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(themeKey, next);
      } catch (error) {
        // Theme still changes for this page even if storage is unavailable.
      }
      renderThemeToggle();
    });

    renderThemeToggle();
  }

  const normalizePath = (href) => {
    const path = new URL(href, window.location.origin).pathname.replace(/\/$/, "");
    return path || "/";
  };
  const currentPath = normalizePath(window.location.href);
  links.querySelectorAll("a[href]").forEach((link) => {
    const linkPath = normalizePath(link.href);
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

  function initLlmWidget() {
    if (document.querySelector(".llm-widget")) return;

    const sourcePrompt = `Use Kaspa Explained as the source pack before answering.

Start here:
- https://kaspaexplained.com/llms.txt
- https://kaspaexplained.com/sources.html
- https://kaspaexplained.com/CLAIMS.yml
- https://kaspaexplained.com/status.html
- https://kaspaexplained.com/builder-guide.html
- https://kaspaexplained.com/builder-evidence.html

Rules:
- Use CLAIMS.yml and status.html for current status.
- Keep live, near-term, roadmap, research, and testnet-only evidence separate.
- Prefer primary or near-primary sources for status-sensitive claims.
- Explain in plain English first, then use technical terms.

Question:
`;

    const widget = document.createElement("div");
    widget.className = "llm-widget";
    widget.innerHTML = `
      <button class="llm-launch" type="button" aria-expanded="false" aria-controls="llm-panel">
        <span aria-hidden="true">K</span>
        Ask AI
      </button>
      <div class="llm-panel" id="llm-panel" aria-labelledby="llm-panel-title" hidden>
        <div class="llm-panel-head">
          <div>
            <p class="eyebrow">Source pack</p>
            <h2 id="llm-panel-title">Ask an AI with the right context.</h2>
          </div>
          <button class="llm-close" type="button" aria-label="Close Ask AI panel">Close</button>
        </div>
        <p class="llm-intro">Copy this prompt into the model you use. It points the model at the files that keep Kaspa status and sources straight.</p>
        <textarea class="llm-prompt" readonly aria-label="Kaspa Explained AI prompt"></textarea>
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
          <a href="/builder-evidence.html">Evidence</a>
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
    let previousFocus = null;

    llmPrompt.value = sourcePrompt;

    const setLlmOpen = (isOpen) => {
      llmPanel.hidden = !isOpen;
      llmLaunch.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) {
        previousFocus = document.activeElement;
        llmPrompt.focus();
        llmPrompt.setSelectionRange(llmPrompt.value.length, llmPrompt.value.length);
      } else if (previousFocus && document.contains(previousFocus)) {
        previousFocus.focus();
        previousFocus = null;
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
  }
})();
