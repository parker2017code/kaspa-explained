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

  // Same-page anchor pills (route jumps like "#build", "#verify", a page's
  // own table of contents) were landing short of their target, sometimes by
  // more than a screen, sometimes not moving at all. The browser's own
  // smooth-scroll-to-fragment reads the target's position once and animates
  // toward it over several frames; anything that reflows the page in that
  // window (this file recomputing --site-header-clearance, in particular)
  // leaves the animation chasing a target that has since moved, and some
  // engines just stop rather than retarget. Taking the jump over here and
  // doing it as a single instant snap removes the multi-frame window
  // entirely, and re-snapping a couple of animation frames later catches
  // any reflow that still lands after the jump (a details block settling
  // its final height, for instance) so the pill always ends on the real
  // target regardless of what shifted around it.
  //
  // The instant part depends on the literal string "instant", not "auto".
  // Per the CSSOM View spec, ScrollOptions.behavior: "auto" means "use the
  // computed scroll-behavior of the scrolling box," and html has
  // scroll-behavior: smooth set further down in this stylesheet. So
  // "auto" here was quietly asking for the same multi-frame animated
  // scroll this function exists to avoid, and every scheduled re-snap
  // (the two rAFs, the 250ms timeout) restarted that animation from
  // wherever it had gotten to. On a page that reflows or runs a script at
  // load (an inlined demo drawing its own UI, images still arriving), a
  // restart can land before the prior animation ever painted a frame,
  // and the scroll never visibly starts. "instant" is a distinct value
  // from "auto" in the same spec and always jumps synchronously,
  // regardless of the CSS scroll-behavior value.
  // Every demo on this site now lives inside the page that explains it, most
  // behind a <details> block that is closed by default for a reader
  // scrolling the page normally. A fragment can name that details directly,
  // an element nested inside one or more closed details, or a <section>
  // that itself wraps a closed "Demo" accordion as a child. A reader who
  // clicked a link named after that demo asked for it directly, so the
  // closed-by-default rule does not apply to them: reveal the target from
  // both directions before this function measures anything.
  //
  // Upward: open every closed ancestor of the target (the target itself
  // included, if it is a details), outermost first, so a fragment landing
  // inside a closed details is actually rendered.
  //
  // Downward: open only a details that is explicitly marked
  // data-fragment-demo. That marker means "the target renders as nothing
  // meaningful without this open" and is set by hand in the markup on the
  // handful of sections whose entire demo sits behind one closed accordion
  // (build-on-kaspa.html's covenant-breaker-demo and zk-boundary-demo, as
  // of this writing). Most fragment targets are sections that already
  // render real content on their own, with unrelated closed details further
  // down (a code panel, a caveat panel, a reference table); those must stay
  // closed, matching what a reader gets by scrolling to the same spot
  // instead of clicking a link. An unmarked heuristic here (guessing from
  // position or depth) was tried and got this backwards on
  // argent-explained.html: it opened the page's "What's real here, and
  // what's illustrative" caveat, which is exactly the kind of panel the
  // site's own closed-by-default rule exists to keep shut. The explicit
  // marker cannot make that mistake and will not drift the next time
  // someone adds another caveat panel inside a demo section.
  //
  // This runs on every call (the initial snap and each scheduled re-snap),
  // which is safe because opening an already-open details is a no-op, and
  // it means the reveal survives no matter which of the click handler,
  // hashchange, or load path reached this function first.
  const revealAncestorDetails = (target) => {
    const closedAncestors = [];
    let node = target;
    while (node) {
      if (node.tagName === "DETAILS" && !node.open) closedAncestors.push(node);
      node = node.parentElement;
    }
    closedAncestors.reverse().forEach((details) => {
      details.open = true;
    });

    // If the target itself is a details, the reader named that one thing
    // directly and got it from the upward loop above; stop there and leave
    // whatever is nested inside it (its own optional foldouts) alone.
    if (target.tagName === "DETAILS") return;

    target.querySelectorAll("details[data-fragment-demo]").forEach((details) => {
      details.open = true;
    });
  };

  const snapToId = (id) => {
    const target = document.getElementById(id);
    if (!target) return null;
    revealAncestorDetails(target);
    const clearance = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--site-header-clearance")
    ) || 132;
    const targetTop = Math.max(target.getBoundingClientRect().top + window.scrollY - clearance, 0);
    window.scrollTo({ top: targetTop, behavior: "instant" });
    return target;
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href").slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    snapToId(id);
    history.pushState(null, "", `#${id}`);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => snapToId(id));
    });
    window.setTimeout(() => snapToId(id), 250);

    const hadTabIndex = target.hasAttribute("tabindex");
    if (!hadTabIndex) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    if (!hadTabIndex) {
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
    }
  });

  // Arriving from another page with a fragment already in the URL never runs
  // the click handler above, so that landing falls back to CSS scroll-margin
  // alone and lands short once the sticky header and late images settle. Snap
  // on load and on hash change using the same re-snap schedule as a click.
  const snapToHash = () => {
    // decodeURIComponent throws URIError on a malformed escape, and a stray "%"
    // in a URL is enough. Unguarded this threw on every page, on both the load
    // and hashchange paths, because this file is loaded sitewide. A hash that
    // cannot be decoded is still a usable literal id, so fall back to the raw
    // text rather than giving up.
    const raw = window.location.hash.slice(1);
    let id;
    try {
      id = decodeURIComponent(raw);
    } catch (error) {
      id = raw;
    }
    if (!id || !document.getElementById(id)) return;
    snapToId(id);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => snapToId(id));
    });
    window.setTimeout(() => snapToId(id), 250);
  };

  window.addEventListener("hashchange", snapToHash);
  if (window.location.hash) {
    if (document.readyState === "complete") snapToHash();
    else window.addEventListener("load", snapToHash, { once: true });
  }

  // Mobile nav focus trap. The panel only exists below 700px: that is the
  // breakpoint (styles.css, the max-width: 700px block that first sets
  // .nav-menu-button { display: inline-flex } and hides .nav-links behind
  // data-open) where the button becomes visible and nav-links stops being a
  // plain visible row and starts being a toggled panel. Above that width the
  // button is display: none and never receives a click, so nothing below
  // needs to special-case desktop; it is gated on the same query anyway so a
  // mid-session resize cannot leave a trap active in the wrong mode.
  const mobilePanelQuery = window.matchMedia("(max-width: 700px)");
  if (!links.hasAttribute("tabindex")) links.setAttribute("tabindex", "-1");

  const supportsInert = "inert" in HTMLElement.prototype;
  const backgroundSiblings = () =>
    Array.from(document.body.children).filter((child) => child !== nav && !child.contains(nav));

  const setBackgroundInert = (isInert) => {
    backgroundSiblings().forEach((child) => {
      if (supportsInert) child.inert = isInert;
      if (isInert) {
        // Fallback for browsers without inert support (Safari < 15.5,
        // Firefox < 112): aria-hidden alone keeps content out of the
        // accessibility tree but does nothing about tab order, so the
        // keydown trap below is what actually stops Tab from reaching it.
        child.setAttribute("aria-hidden", "true");
      } else {
        child.removeAttribute("aria-hidden");
      }
    });
  };

  const focusableSelector =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const getFocusable = (container) =>
    Array.from(container.querySelectorAll(focusableSelector)).filter(
      (el) => el.getClientRects().length > 0
    );

  const trapTabKey = (event) => {
    if (event.key !== "Tab") return;
    const focusable = getFocusable(nav);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    } else if (!nav.contains(document.activeElement)) {
      // Focus somehow landed outside the trap (a browser extension, a
      // programmatic .focus() call elsewhere); pull it back in rather than
      // letting Tab continue from wherever it is.
      event.preventDefault();
      first.focus();
    }
  };

  const setOpen = (isOpen) => {
    const wasOpen = nav.dataset.open === "true";
    const isPanel = mobilePanelQuery.matches;
    nav.dataset.open = isOpen ? "true" : "false";
    button.setAttribute("aria-expanded", String(isOpen));
    requestAnimationFrame(updateHeaderClearance);

    if (isOpen && isPanel) {
      setBackgroundInert(true);
      document.addEventListener("keydown", trapTabKey, true);
      const firstFocusable = getFocusable(links)[0];
      (firstFocusable || links).focus({ preventScroll: true });
    } else if (wasOpen) {
      setBackgroundInert(false);
      document.removeEventListener("keydown", trapTabKey, true);
      if (isPanel) button.focus({ preventScroll: true });
    }
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

  // If the viewport crosses the panel breakpoint while the menu is open
  // (rotating a tablet, resizing a browser window), tear down the trap and
  // the inert background rather than leaving them stuck in a state the
  // current layout no longer matches.
  mobilePanelQuery.addEventListener("change", () => {
    if (nav.dataset.open === "true") setOpen(false);
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

// Animate every <details> accordion (.source-more, .deep-dive, .guide-detail,
// .cell-detail) open and closed instead of the native instant snap. Native
// <details> has no transition hook at all, so this drives the height itself
// with the Web Animations API, skips entirely under prefers-reduced-motion,
// and never touches the reader's current scroll position: the animated
// property is the details element's own height, not anything above it.
(function () {
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = 240;
  const openEasing = "cubic-bezier(.2,.8,.2,1)";
  const closeEasing = "cubic-bezier(.4,0,.2,1)";

  document.querySelectorAll("details").forEach((details) => {
    const summary = details.querySelector(":scope > summary");
    if (!summary) return;

    let animation = null;
    let isClosing = false;
    let isExpanding = false;

    const finish = (isOpen) => {
      details.open = isOpen;
      details.style.height = "";
      details.style.overflow = "";
      animation = null;
      isClosing = false;
      isExpanding = false;
    };

    const shrink = () => {
      isClosing = true;
      const startHeight = `${details.offsetHeight}px`;
      // The details element itself can carry vertical padding around the
      // summary (.source-more does); the closed target has to include that
      // padding too, or the animation undershoots and the box snaps taller
      // the instant inline height clears and native closed layout takes over.
      const detailsStyle = getComputedStyle(details);
      const verticalPadding = parseFloat(detailsStyle.paddingTop) + parseFloat(detailsStyle.paddingBottom);
      const endHeight = `${summary.offsetHeight + verticalPadding}px`;
      details.style.overflow = "hidden";
      if (animation) animation.cancel();
      animation = details.animate({ height: [startHeight, endHeight] }, { duration, easing: closeEasing });
      animation.onfinish = () => finish(false);
      animation.oncancel = () => { isClosing = false; };
    };

    const expand = () => {
      details.style.overflow = "hidden";
      details.style.height = `${details.offsetHeight}px`;
      details.open = true;
      requestAnimationFrame(() => {
        isExpanding = true;
        const startHeight = details.style.height;
        const endHeight = `${details.scrollHeight}px`;
        if (animation) animation.cancel();
        animation = details.animate({ height: [startHeight, endHeight] }, { duration, easing: openEasing });
        animation.onfinish = () => finish(true);
        animation.oncancel = () => { isExpanding = false; };
      });
    };

    summary.addEventListener("click", (event) => {
      event.preventDefault();
      if (reduceMotion()) {
        details.open = !details.open;
        return;
      }
      if (isClosing || !details.open) {
        expand();
      } else {
        shrink();
      }
    });
  });
})();
