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

})();
