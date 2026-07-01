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

  const imageFigures = Array.from(document.querySelectorAll(".article-visual"));
  if (imageFigures.length) {
    const viewer = document.createElement("div");
    viewer.className = "image-viewer";
    viewer.setAttribute("role", "dialog");
    viewer.setAttribute("aria-modal", "true");
    viewer.setAttribute("aria-hidden", "true");
    viewer.innerHTML = `
      <button class="image-viewer-close" type="button" aria-label="Close expanded image">Close</button>
      <figure>
        <img alt="">
        <figcaption></figcaption>
      </figure>
    `;
    document.body.appendChild(viewer);

    const viewerImage = viewer.querySelector("img");
    const viewerCaption = viewer.querySelector("figcaption");
    const closeViewer = () => {
      viewer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("image-viewer-open");
      viewerImage.removeAttribute("src");
    };
    const openViewer = (image, captionText) => {
      viewerImage.src = image.currentSrc || image.src;
      viewerImage.alt = image.alt || "";
      viewerCaption.textContent = captionText || "";
      viewer.setAttribute("aria-hidden", "false");
      document.body.classList.add("image-viewer-open");
    };

    viewer.addEventListener("click", (event) => {
      if (event.target === viewer || event.target.closest(".image-viewer-close")) closeViewer();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && viewer.getAttribute("aria-hidden") === "false") closeViewer();
    });

    imageFigures.forEach((figure) => {
      const image = figure.querySelector("img");
      if (!image || figure.querySelector(".image-expand-button")) return;
      const captionText = figure.querySelector("figcaption")?.textContent?.trim() || "";
      const expand = document.createElement("button");
      expand.className = "image-expand-button";
      expand.type = "button";
      expand.textContent = "Expand";
      expand.setAttribute("aria-label", "Expand image");
      expand.addEventListener("click", () => openViewer(image, captionText));
      image.addEventListener("click", () => openViewer(image, captionText));
      image.tabIndex = 0;
      image.setAttribute("role", "button");
      image.setAttribute("aria-label", "Expand image");
      image.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openViewer(image, captionText);
        }
      });
      figure.appendChild(expand);
    });
  }
})();
