(function () {
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
    const path = new URL(href, window.location.origin).pathname
      .replace(/\/$/, "")
      .replace(/\.html$/, "");
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

  const huntSignals = [
    { path: "/", label: "Signal 1 found", clue: "You found the countdown. Toccata has a target, and the chase starts here.", next: "Next stop: Status." },
    { path: "/status", label: "Signal 2 found", clue: "You found the timing check. Scheduled is exciting; live still needs the network to reach the target.", next: "Next stop: Toccata." },
    { path: "/toccata-status", label: "Signal 3 found", clue: "You found the release note. The target is DAA 474,165,565.", next: "Next stop: Build on Kaspa." },
    { path: "/build-on-kaspa", label: "Signal 4 found", clue: "You found the builder spark. The point is useful apps with fewer central chokepoints.", next: "Next stop: App ideas." },
    { path: "/kaspa-app-ideas", label: "Signal 5 found", clue: "You found the idea board: vaults, escrow, assets, receipts, safer payouts, and stranger things.", next: "Next stop: Claims." },
    { path: "/kaspa-claims-checker", label: "Signal 6 found", clue: "You found the hype filter. Good excitement survives clear wording.", next: "Next stop: Sources." },
    { path: "/sources", label: "Signal 7 found", clue: "You found the last signal. The trail is complete.", next: "Return home for the final chord." }
  ];
  const huntKey = "kaspa-toccata-chase-signals";
  const rewardText = "Final chord: Toccata targets DAA 474,165,565. The chase is complete. Now go build something worth the countdown.";

  const showHuntBurst = (x, y, isFinal) => {
    const burst = document.createElement("div");
    burst.className = `toccata-hunt-burst${isFinal ? " is-final" : ""}`;
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    for (let index = 0; index < 18; index += 1) {
      const spark = document.createElement("span");
      spark.style.setProperty("--angle", `${index * 20}deg`);
      spark.style.setProperty("--distance", `${isFinal ? 86 + (index % 4) * 10 : 46 + (index % 3) * 8}px`);
      spark.style.setProperty("--delay", `${index * 12}ms`);
      burst.appendChild(spark);
    }
    document.body.appendChild(burst);
    window.setTimeout(() => burst.remove(), isFinal ? 1150 : 820);
  };

  const showFinale = () => {
    if (document.querySelector(".toccata-finale")) return;
    const finale = document.createElement("div");
    finale.className = "toccata-finale";
    finale.setAttribute("role", "status");
    finale.setAttribute("aria-live", "polite");
    finale.innerHTML = "<strong>Toccata chord found</strong><span>Seven signals down. The countdown is on.</span>";
    document.body.appendChild(finale);
    window.setTimeout(() => finale.dataset.show = "true", 20);
    window.setTimeout(() => {
      finale.dataset.show = "false";
      window.setTimeout(() => finale.remove(), 280);
    }, 4200);
  };

  const readHuntState = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(huntKey) || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
    } catch (error) {
      return [];
    }
  };

  const writeHuntState = (state) => {
    try {
      localStorage.setItem(huntKey, JSON.stringify(state));
    } catch (error) {
      // The hunt remains decorative if storage is unavailable.
    }
  };

  const renderHuntProgress = () => {
    const progressEl = document.getElementById("toccata-hunt-progress");
    const rewardEl = document.getElementById("toccata-hunt-reward");
    if (!progressEl || !rewardEl) return;
    const state = readHuntState();
    const foundCount = Math.min(state.length, huntSignals.length);
    const isComplete = foundCount >= huntSignals.length;
    progressEl.textContent = `${foundCount} / ${huntSignals.length} signals found`;
    rewardEl.textContent = isComplete ? rewardText : "Find the quiet signals around the site. The final note appears here.";
    document.querySelector(".toccata-console")?.classList.toggle("is-complete", isComplete);
  };

  const currentSignal = huntSignals.find((signal) => signal.path === currentPath);
  if (currentSignal) {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = "toccata-hunt-marker";
    marker.setAttribute("aria-label", `Find ${currentSignal.label}`);
    marker.title = `Toccata chase: ${currentSignal.label}`;
    marker.innerHTML = "<span></span>";
    document.body.appendChild(marker);

    const toast = document.createElement("div");
    toast.className = "toccata-hunt-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);

    marker.addEventListener("click", (event) => {
      const state = readHuntState();
      const nextState = state.includes(currentSignal.path) ? state : [...state, currentSignal.path];
      const isFinal = nextState.length >= huntSignals.length && state.length < huntSignals.length;
      writeHuntState(nextState);
      marker.classList.add("is-found");
      toast.innerHTML = `<strong>${currentSignal.label}</strong><span>${currentSignal.clue}</span><small>${currentSignal.next}</small>`;
      toast.dataset.show = "true";
      showHuntBurst(event.clientX, event.clientY, isFinal);
      if (isFinal) showFinale();
      renderHuntProgress();
      window.clearTimeout(marker._huntTimer);
      marker._huntTimer = window.setTimeout(() => {
        toast.dataset.show = "false";
      }, 4800);
    });

    if (readHuntState().includes(currentSignal.path)) {
      marker.classList.add("is-found");
    }
  }

  renderHuntProgress();
  window.addEventListener("storage", renderHuntProgress);
})();
