"use strict";
/* Inlined before network dependencies. Every document entry gets an opening. */
(function () {
  var root = document.documentElement;
  var current = null;
  var template = null;
  var wasHidden = document.hidden;
  var mobile =
    window.innerWidth <= 900 ||
    (window.matchMedia &&
      window.matchMedia("(max-width: 900px), (pointer: coarse)").matches);
  var hold = mobile ? 3000 : 1250;
  var fade = mobile ? 1800 : 950;
  root.classList.add("intro-pending");

  function start(screen) {
    if (current) return;
    if (!template) template = screen.cloneNode(true);
    var regions = [];
    var timers = [];
    var finished = false;
    var launched = false;
    var revealing = false;
    var visibleAt = 0;
    var mark = screen.querySelector("img");
    var observer;
    var state = { finish: finish, resume: launch, pause: pause };
    current = state;
    root.classList.add("intro-pending");
    root.classList.remove("intro-revealing");

    function later(callback, delay) {
      var id = setTimeout(callback, delay);
      timers.push(id);
    }
    function clearTimers() {
      timers.forEach(clearTimeout);
      timers = [];
    }
    function lockRegions() {
      if (finished) return;
      document
        .querySelectorAll(".site-header, main, .site-footer")
        .forEach(function (node) {
          if (regions.indexOf(node) < 0 && !node.inert) {
            node.inert = true;
            node.setAttribute("data-intro-inert", "");
            regions.push(node);
          }
        });
    }
    function finish() {
      if (finished) return;
      finished = true;
      clearTimers();
      if (observer) observer.disconnect();
      root.classList.remove("intro-pending", "intro-revealing");
      screen.remove();
      regions.forEach(function (node) {
        node.inert = false;
        node.removeAttribute("data-intro-inert");
      });
      document.removeEventListener("keydown", skipOnKey);
      document.removeEventListener("wheel", preventScroll);
      document.removeEventListener("touchmove", preventScroll);
      current = null;
    }
    function preventScroll(event) {
      event.preventDefault();
    }
    function skipOnKey(event) {
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
        ].indexOf(event.key) >= 0
      )
        finish();
    }
    function siteReady() {
      var css = document.getElementById("site-styles");
      var hero = document.querySelector(".hero-photo img");
      // Older in-app browsers may not apply a preload link's load handler.
      if (css && css.rel !== "stylesheet") css.rel = "stylesheet";
      return (
        document.readyState !== "loading" &&
        (!css || (css.rel === "stylesheet" && css.sheet)) &&
        hero &&
        hero.complete &&
        hero.naturalWidth > 0
      );
    }
    function leave() {
      if (finished || document.hidden || revealing) return;
      // Decode the first photograph underneath the logo before the crossfade.
      if (!siteReady() && Date.now() - visibleAt < 10000) {
        later(leave, 100);
        return;
      }
      revealing = true;
      var hero = document.querySelector(".hero-photo img");
      var begin = function () {
        if (finished || document.hidden) return;
        root.classList.add("intro-revealing");
        screen.classList.add("is-leaving");
        later(finish, fade + 80);
      };
      var begun = false;
      var once = function () {
        if (!begun) {
          begun = true;
          begin();
        }
      };
      if (hero && typeof hero.decode === "function") {
        hero.decode().then(once, once);
        later(once, 300);
      } else once();
    }
    function launch() {
      if (finished || launched || document.hidden) return;
      launched = true;
      visibleAt = Date.now();
      var raf =
        window.requestAnimationFrame ||
        function (callback) {
          setTimeout(callback, 16);
        };
      // Two frames preserve the fade even with a fully cached, embedded logo.
      raf(function () {
        raf(function () {
          if (finished || document.hidden) {
            launched = false;
            return;
          }
          screen.classList.add("is-ready");
          later(leave, hold);
          later(finish, 14000);
        });
      });
    }
    function pause() {
      if (finished) return;
      clearTimers();
      launched = false;
      revealing = false;
      root.classList.remove("intro-revealing");
      screen.classList.remove("is-ready", "is-leaving");
    }
    lockRegions();
    observer = new MutationObserver(lockRegions);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    document.addEventListener("keydown", skipOnKey);
    document.addEventListener("wheel", preventScroll, { passive: false });
    document.addEventListener("touchmove", preventScroll, { passive: false });
    // The trademark is embedded in the document: no image or JS fetch can skip it.
    mark.addEventListener("load", launch, { once: true });
    mark.addEventListener("error", launch, { once: true });
    if (mark.complete) launch();
    else later(launch, 300);
  }

  function replay() {
    if (current) {
      current.pause();
      current.resume();
      return;
    }
    if (!template || !document.body) return;
    var screen = template.cloneNode(true);
    document.body.insertBefore(screen, document.body.firstChild);
    start(screen);
  }
  var boot = new MutationObserver(function () {
    var screen = document.querySelector(".intro-screen");
    if (screen && screen.querySelector(".intro-caption")) {
      boot.disconnect();
      start(screen);
    }
  });
  boot.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) replay();
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      wasHidden = true;
      if (current) current.pause();
    } else if (wasHidden) {
      wasHidden = false;
      replay();
    }
  });
})();
