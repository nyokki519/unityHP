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
  if (!root.classList.contains("intro-pending") || motion.matches) {
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
  document
    .querySelector(".hero-photo img")
    ?.decode()
    .catch(() => {});
  const mark = screen.querySelector("img");
  const reveal = () => {
    if (finished || screen.classList.contains("is-ready")) return;
    requestAnimationFrame(() => {
      if (finished) return;
      screen.classList.add("is-ready");
      later(() => {
        root.classList.add("intro-revealing");
        screen.classList.add("is-leaving");
        later(finish, 950);
      }, 1250);
    });
  };
  mark.decode().then(reveal, finish);
  later(reveal, 400);
  // Independent of CSS animation events and the other application scripts.
  later(finish, 3200);
})();
