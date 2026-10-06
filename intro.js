"use strict";
/* A short, decorative opening. The page stays usable if assets or scripts fail. */
(() => {
  const root = document.documentElement;
  const screen = document.querySelector(".intro-screen");
  if (!screen) return;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const regions = Array.from(
    document.querySelectorAll(".site-header, main, .site-footer"),
  );
  const timers = new Set();
  let finished = false;
  let revealScheduled = false;
  const preventScroll = (event) => event.preventDefault();
  const later = (callback, delay) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(window.unityIntroFallback);
    timers.forEach(clearTimeout);
    root.classList.remove("intro-pending", "intro-revealing");
    screen.remove();
    regions.forEach((node) => {
      if (node.hasAttribute("data-intro-inert")) {
        node.inert = false;
        delete node.dataset.introInert;
      }
    });
    document.removeEventListener("keydown", skipOnKey);
    document.removeEventListener("wheel", preventScroll);
    document.removeEventListener("touchmove", preventScroll);
    motion.removeEventListener("change", finish);
    window.removeEventListener("pageshow", skipOnRestore);
  };
  const skipOnKey = (event) => {
    if (
      [
        "Escape",
        "Tab",
        "ArrowDown",
        "ArrowUp",
        "PageDown",
        "PageUp",
        "Home",
        "End",
        " ",
      ].includes(event.key)
    )
      finish();
  };
  const skipOnRestore = (event) => {
    if (event.persisted) finish();
  };
  if (!root.classList.contains("intro-pending")) {
    finish();
    return;
  }
  regions.forEach((node) => {
    if (!node.inert) {
      node.inert = true;
      node.dataset.introInert = "";
    }
  });
  document.addEventListener("keydown", skipOnKey);
  document.addEventListener("wheel", preventScroll, { passive: false });
  document.addEventListener("touchmove", preventScroll, { passive: false });
  motion.addEventListener("change", finish);
  window.addEventListener("pageshow", skipOnRestore);
  // The hero can decode while the trademark is visible. Never wait for all photos.
  const hero = document.querySelector(".hero-photo img");
  if (typeof hero?.decode === "function") hero.decode().catch(() => {});
  const mark = screen.querySelector("img");
  const reveal = () => {
    if (finished || revealScheduled) return;
    revealScheduled = true;
    // Give mobile browsers a painted initial frame before changing opacity.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (finished) return;
        screen.classList.add("is-ready");
        later(
          () => {
            root.classList.add("intro-revealing");
            screen.classList.add("is-leaving");
            later(finish, motion.matches ? 0 : 950);
          },
          motion.matches ? 800 : 1250,
        );
      }),
    );
  };
  const start = () => {
    if (finished) return;
    window.unityStartIntroFallback?.();
    // Safari can reject decode() during a source change even when load succeeds.
    // Treat the load event and natural dimensions as authoritative too.
    mark.addEventListener("load", reveal, { once: true });
    mark.addEventListener("error", finish, { once: true });
    if (mark.complete && mark.naturalWidth > 0) reveal();
    if (typeof mark.decode === "function") {
      mark.decode().then(reveal, () => {
        if (mark.naturalWidth > 0) reveal();
      });
    }
    // Bound the cover independently of app scripts and CSS animation events.
    later(finish, 3200);
  };
  const stylesheet = document.querySelector('link[rel="stylesheet"]');
  if (!stylesheet || stylesheet.sheet) start();
  else {
    stylesheet.addEventListener("load", start, { once: true });
    stylesheet.addEventListener("error", finish, { once: true });
  }
})();
