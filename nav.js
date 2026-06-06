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
    { path: "/", name: "Countdown", label: "Signal 1 found", clue: "You found the countdown. Toccata has a target, and the chase starts here.", next: "Next stop: Toccata Status." },
    { path: "/toccata-status", name: "Toccata Status", label: "Signal 2 found", clue: "You found the number to watch: DAA 474,165,565.", next: "Next stop: Build on Kaspa." },
    { path: "/build-on-kaspa", name: "Build on Kaspa", label: "Signal 3 found", clue: "You found the builder spark: useful apps with fewer central chokepoints.", next: "Next stop: App Ideas." },
    { path: "/kaspa-app-ideas", name: "App Ideas", label: "Signal 4 found", clue: "You found the idea board: vaults, escrow, assets, receipts, safer payouts, and stranger things.", next: "Next stop: Sources." },
    { path: "/sources", name: "Sources", label: "Signal 5 found", clue: "You found the receipts. The hunt is complete.", next: "Return home to unlock your Toccata passport." }
  ];
  const huntKey = "kaspa-toccata-chase-signals";
  const validHuntPaths = new Set(huntSignals.map((signal) => signal.path));
  const rewardText = "Passport unlocked: you found why Toccata matters. More app rules can move from private servers toward Kaspa-native validation.";
  const victoryLine = "I finished the Kaspa Explained Toccata hunt: countdown, DAA target, builder spark, app ideas, and receipts. Toccata is about moving more app rules toward Kaspa-native validation.";

  const signalIndex = (path) => huntSignals.findIndex((signal) => signal.path === path);

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
    finale.innerHTML = "<strong>Toccata passport unlocked</strong><span>Five signals down. You found the builder spark.</span>";
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
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string" && validHuntPaths.has(item)) : [];
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
    const passportEl = document.getElementById("toccata-passport");
    const state = readHuntState();
    const foundCount = Math.min(state.length, huntSignals.length);
    const isComplete = foundCount >= huntSignals.length;
    if (progressEl) progressEl.textContent = `${foundCount} / ${huntSignals.length} signals found`;
    if (rewardEl) rewardEl.textContent = isComplete ? rewardText : "Find five quiet signals around the site. The reward unlocks here.";
    if (passportEl) passportEl.hidden = !isComplete;
    document.querySelector(".toccata-console")?.classList.toggle("is-complete", isComplete);
    document.querySelectorAll(".toccata-signal-map a").forEach((link) => {
      const url = new URL(link.getAttribute("href"), window.location.origin);
      const path = url.pathname === "/" ? "/" : url.pathname.replace(/\/$/, "");
      const index = signalIndex(path);
      const isFound = state.includes(path);
      const isNext = !isComplete && index === foundCount;
      link.dataset.huntState = isFound ? "found" : isNext ? "next" : "locked";
      link.setAttribute("aria-label", `${link.textContent.trim().replace(/\s+/g, " ")} - ${isFound ? "found" : isNext ? "next" : "locked"}`);
    });
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
      const currentIndex = signalIndex(currentSignal.path);
      const expectedSignal = huntSignals[state.length];
      const alreadyFound = state.includes(currentSignal.path);
      const isExpected = currentIndex === state.length;
      if (!alreadyFound && !isExpected) {
        toast.innerHTML = `<strong>${currentSignal.name} is later</strong><span>This hunt unlocks in order so it stays easy to follow.</span><small>Next stop: ${expectedSignal?.name || "return home"}.</small>`;
        toast.dataset.show = "true";
        showHuntBurst(event.clientX, event.clientY, false);
        window.clearTimeout(marker._huntTimer);
        marker._huntTimer = window.setTimeout(() => {
          toast.dataset.show = "false";
        }, 4800);
        return;
      }
      const nextState = alreadyFound ? state : [...state, currentSignal.path];
      const isFinal = nextState.length >= huntSignals.length && state.length < huntSignals.length;
      writeHuntState(nextState);
      marker.classList.add("is-found");
      toast.innerHTML = `<strong>${alreadyFound ? "Already found" : currentSignal.label}</strong><span>${currentSignal.clue}</span><small>${isFinal ? "Return home for your passport." : currentSignal.next}</small>`;
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
  const copyPassport = document.getElementById("toccata-passport-copy");
  const copyTextFallback = () => {
    const existing = document.getElementById("toccata-passport-copy-fallback");
    const textarea = existing || document.createElement("textarea");
    textarea.id = "toccata-passport-copy-fallback";
    textarea.value = victoryLine;
    textarea.readOnly = true;
    textarea.setAttribute("aria-label", "Toccata victory line");
    textarea.className = "toccata-copy-fallback";
    if (!existing) {
      copyPassport.insertAdjacentElement("afterend", textarea);
    }
    textarea.hidden = false;
    textarea.focus();
    textarea.select();
    try {
      const copied = document.execCommand("copy");
      copyPassport.textContent = copied ? "Copied" : "Select text";
      if (copied) textarea.hidden = true;
    } catch (error) {
      copyPassport.textContent = "Select text";
    }
  };
  copyPassport?.addEventListener("click", async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(victoryLine);
      copyPassport.textContent = "Copied";
    } catch (error) {
      copyTextFallback();
    }
  });
  window.addEventListener("storage", renderHuntProgress);
})();
