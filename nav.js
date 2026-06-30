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

  const TOCCATA_TARGET_DAA = 474165565;
  const TOCCATA_WATCH_START_DAA = 473005279;
  const TOCCATA_DAA_API = "https://api.kaspa.org/info/blockdag";
  const numberFormat = new Intl.NumberFormat("en-US");
  const params = new URLSearchParams(window.location.search);
  const localHostnames = new Set(["localhost", "127.0.0.1", "::1"]);
  const isLocalPreview = localHostnames.has(window.location.hostname) || window.location.protocol === "file:";
  const shouldShowToccataWatch = isLocalPreview && params.get("toccataWatch") !== "0";
  let fireworksStarted = false;

  const formatNumber = (value) => numberFormat.format(Math.max(0, Math.floor(Number(value) || 0)));

  const launchFireworks = () => {
    if (fireworksStarted || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    fireworksStarted = true;

    const canvas = document.createElement("canvas");
    canvas.className = "toccata-fireworks";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);

    const context = canvas.getContext("2d");
    const colors = ["#6fc7ba", "#8cc8ff", "#f2b86f", "#f4fbf9"];
    const particles = [];
    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };
    const burst = (x, y) => {
      for (let index = 0; index < 42; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.8 + Math.random() * 4.8;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 58 + Math.random() * 26,
          color: colors[index % colors.length],
          size: 1.4 + Math.random() * 2.6
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    let burstsOpen = true;
    const interval = window.setInterval(() => {
      burst(70 + Math.random() * (window.innerWidth - 140), 100 + Math.random() * Math.min(320, window.innerHeight * 0.5));
    }, 420);
    window.setTimeout(() => {
      burstsOpen = false;
      window.clearInterval(interval);
    }, 6200);

    const animate = () => {
      frame += 1;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.035;
        particle.life -= 1;
        context.globalAlpha = Math.max(0, particle.life / 84);
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
        if (particle.life <= 0) particles.splice(index, 1);
      }
      context.globalAlpha = 1;
      if (burstsOpen || particles.length > 0) {
        requestAnimationFrame(animate);
      } else {
        window.removeEventListener("resize", resize);
        canvas.remove();
        fireworksStarted = false;
      }
    };

    burst(window.innerWidth * 0.5, 150);
    animate();
  };

  const createToccataWatch = () => {
    if (!shouldShowToccataWatch || document.querySelector(".toccata-launch-watch")) return;
    const header = document.querySelector(".site-header");
    if (!header) return;

    const watch = document.createElement("aside");
    watch.className = "toccata-launch-watch";
    watch.setAttribute("aria-live", "polite");
    watch.innerHTML = `
      <div class="toccata-launch-copy">
        <span class="toccata-launch-kicker">Local activation draft</span>
        <strong>Toccata watch armed</strong>
        <p>Reading mainnet DAA. Push only after ${formatNumber(TOCCATA_TARGET_DAA)} and a normal post-target network check.</p>
        <small>After launch week, remove this local watch and fireworks.</small>
      </div>
      <div class="toccata-launch-score">
        <span data-toccata-status>Checking</span>
        <b data-toccata-daa>...</b>
        <small data-toccata-remaining>Waiting for REST status.</small>
        <div class="toccata-launch-meter" aria-hidden="true"><i data-toccata-meter></i></div>
      </div>
      <div class="toccata-launch-actions">
        <a href="/toccata-status">Status</a>
        <button type="button" data-toccata-party>Rehearse</button>
      </div>
    `;
    header.insertAdjacentElement("afterend", watch);
    document.body.classList.add("toccata-watch-active");

    const status = watch.querySelector("[data-toccata-status]");
    const daa = watch.querySelector("[data-toccata-daa]");
    const remaining = watch.querySelector("[data-toccata-remaining]");
    const meter = watch.querySelector("[data-toccata-meter]");
    const party = watch.querySelector("[data-toccata-party]");

    party.addEventListener("click", launchFireworks);
    if (params.get("party") === "1") launchFireworks();

    fetch(TOCCATA_DAA_API, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`DAA read failed: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        const currentDaa = Number(data.virtualDaaScore);
        const isReached = currentDaa >= TOCCATA_TARGET_DAA;
        const distance = TOCCATA_TARGET_DAA - currentDaa;
        const progress = Math.max(
          0,
          Math.min(100, ((currentDaa - TOCCATA_WATCH_START_DAA) / (TOCCATA_TARGET_DAA - TOCCATA_WATCH_START_DAA)) * 100)
        );

        daa.textContent = formatNumber(currentDaa);
        meter.style.width = `${isReached ? 100 : progress}%`;
        if (isReached) {
          status.textContent = "DAA target reached";
          remaining.textContent = "Post-target network checks are now required before publish.";
          party.textContent = "Fireworks";
          watch.classList.add("is-reached");
          launchFireworks();
        } else {
          status.textContent = "Push blocked";
          remaining.textContent = `${formatNumber(distance)} DAA remaining. Local preview only.`;
        }
      })
      .catch(() => {
        status.textContent = "DAA unavailable";
        daa.textContent = "Check manually";
        remaining.textContent = "Push stays blocked if the guard cannot read DAA.";
      });
  };

  createToccataWatch();

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

  const updateHeaderClearance = () => {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const rect = header.getBoundingClientRect();
    const clearance = Math.ceil(rect.bottom + 28);
    document.documentElement.style.setProperty("--site-header-clearance", `${clearance}px`);
  };

  updateHeaderClearance();
  window.addEventListener("resize", updateHeaderClearance);
  window.addEventListener("orientationchange", updateHeaderClearance);
  window.addEventListener("hashchange", updateHeaderClearance);
  window.addEventListener("load", updateHeaderClearance);
  document.fonts?.ready?.then(updateHeaderClearance).catch(() => {});

  const setOpen = (isOpen) => {
    nav.dataset.open = isOpen ? "true" : "false";
    button.setAttribute("aria-expanded", String(isOpen));
    requestAnimationFrame(updateHeaderClearance);
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
})();
