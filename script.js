"use strict";
(() => {
  const content = window.UNITY_CONTENT;
  if (!content) return;
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const safeUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  };
  const safeImageUrl = (value) => {
    // Single-file previews use embedded WebP photos; links remain HTTP(S) only.
    if (
      typeof value === "string" &&
      /^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(value)
    )
      return value;
    return safeUrl(value);
  };
  const externalLink = (label, url) => {
    const a = element("a", "text-link", label);
    const href = safeUrl(url);
    if (!href) return null;
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    const arrow = element("span", "", "↗");
    arrow.setAttribute("aria-hidden", "true");
    a.append(arrow);
    return a;
  };
  const appendPhoto = (
    frame,
    photoId,
    {
      priority = false,
      sizes = "(max-width: 600px) 90vw, 40vw",
      initial = null,
    } = {},
  ) => {
    frame.classList.add("photo-frame");
    const photo = content.photos[photoId];
    const src = safeImageUrl(photo?.src);
    const placeholder = () => {
      frame.replaceChildren(
        element("span", "photo-missing", initial || "Unity"),
      );
      frame.classList.add("placeholder");
    };
    if (!src) {
      placeholder();
      return;
    }
    const img = element("img");
    img.alt = photo.alt || "";
    img.width = photo.width || 1200;
    img.height = photo.height || 900;
    img.loading = priority ? "eager" : "lazy";
    img.decoding = "async";
    if (priority) img.setAttribute("fetchpriority", "high");
    if (photo.srcset) {
      img.srcset = photo.srcset;
      img.sizes = sizes;
    }
    frame.style.setProperty("--photo-position", photo.position || "50% 50%");
    if (photo.mobilePosition)
      frame.style.setProperty("--photo-mobile-position", photo.mobilePosition);
    img.addEventListener("error", placeholder, { once: true });
    img.src = src;
    frame.append(img);
  };
  document
    .querySelectorAll("[data-photo]")
    .forEach((frame) => appendPhoto(frame, frame.dataset.photo));
  document.querySelectorAll("[data-featured]").forEach((frame) =>
    appendPhoto(frame, content.featured[frame.dataset.featured], {
      priority: frame.dataset.featured === "hero",
      sizes:
        frame.dataset.featured === "hero"
          ? "100vw"
          : "(max-width: 600px) 90vw, 55vw",
    }),
  );
  document.querySelectorAll("[data-link]").forEach((a) => {
    const href = safeUrl(content.links[a.dataset.link]);
    if (href) {
      a.href = href;
      a.hidden = false;
    } else {
      a.hidden = true;
    }
  });
  const dateLabel = (date) => {
    if (!date) return "日程はInstagram・公式LINEでご案内";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      return "日程はInstagram・公式LINEでご案内";
    const parsed = new Date(`${date}T00:00:00+09:00`);
    if (!Number.isFinite(parsed.valueOf()))
      return "日程はInstagram・公式LINEでご案内";
    return new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(parsed);
  };
  const eventList = document.querySelector("#event-list");
  const feedStatus = document.querySelector("#event-feed-status");
  const scheduleDate = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
  const scheduleTime = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const renderEvents = (events, mode = "fallback") => {
    const fragment = document.createDocumentFragment();
    events.forEach((event, index) => {
      const card = element("article", "event-card");
      const number = element(
        "span",
        "event-index",
        String(index + 1).padStart(2, "0"),
      );
      number.setAttribute("aria-hidden", "true");
      const category = element("div", "event-category");
      category.append(
        element("span", "", event.category),
        element(
          "span",
          "",
          event.startsAt || event.date ? "EVENT" : "開催案内",
        ),
      );
      const heading = element("h3", "", event.title);
      const meta = element("div", "event-meta");
      if (event.startsAt) {
        const time = element(
          "time",
          "",
          scheduleDate.format(new Date(event.startsAt)),
        );
        time.dateTime = event.startsAt;
        meta.append(time);
        meta.append(
          element(
            "span",
            "",
            scheduleTime.format(new Date(event.startsAt)) + " 開始",
          ),
        );
      } else if (event.date && /^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
        const time = element("time", "", dateLabel(event.date));
        time.dateTime = event.date;
        meta.append(time);
      } else meta.append(element("span", "", dateLabel(null)));
      if (event.time) meta.append(element("span", "", event.time));
      if (event.location) meta.append(element("span", "", event.location));
      card.append(
        number,
        category,
        heading,
        meta,
        element("p", "", event.description),
      );
      const link = externalLink(
        "参加申込フォームへ",
        event.url || content.links.registration,
      );
      if (link) card.append(link);
      fragment.append(card);
    });
    if (!events.length)
      fragment.append(
        element(
          "p",
          "section-lead",
          mode === "live"
            ? "現在、公開されている開催予定はありません。次の案内は公式LINE・Instagramでもお知らせします。"
            : "次の開催は、Instagram・公式LINEでお知らせします。",
        ),
      );
    eventList.replaceChildren(fragment);
  };
  renderEvents(content.events);
  const feed = content.eventFeed;
  if (feed?.url && window.UNITY_EVENT_FEED) {
    let busy = false;
    let lastAttempt = 0;
    const refreshEvents = async () => {
      if (busy || document.hidden || eventList.contains(document.activeElement))
        return;
      busy = true;
      lastAttempt = Date.now();
      const controller = new AbortController();
      const timer = setTimeout(
        () => controller.abort(),
        feed.timeoutMs || 8000,
      );
      try {
        const url = safeUrl(feed.url);
        if (!url) throw new Error("invalid_feed_url");
        const response = await fetch(url, {
          signal: controller.signal,
          mode: "cors",
          credentials: "omit",
          cache: "no-store",
        });
        if (!response.ok) throw new Error("feed_unavailable");
        const events = window.UNITY_EVENT_FEED.normalize(
          await response.json(),
          feed,
        );
        renderEvents(events, "live");
        if (feedStatus)
          feedStatus.textContent =
            "開催日時は日本時間です。会場・参加費・募集状況はInstagram・公式LINEでご確認ください。";
      } catch {
        renderEvents(content.events);
        if (feedStatus)
          feedStatus.textContent =
            "最新の日程・参加費はInstagramや公式LINEでご確認ください。お申し込みは参加申込フォームへ。";
      } finally {
        clearTimeout(timer);
        busy = false;
      }
    };
    refreshEvents();
    const refreshMs = Math.max(60000, feed.refreshMs || 300000);
    setInterval(refreshEvents, refreshMs);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && Date.now() - lastAttempt >= refreshMs)
        refreshEvents();
    });
  }
  const gallery = document.querySelector("#gallery-list");
  const scenes = content.gallery.filter((scene) =>
    safeImageUrl(content.photos[scene.photo]?.src),
  );
  document.querySelector(".gallery-dialog")?.remove();
  const dialog = element("dialog", "gallery-dialog");
  dialog.setAttribute("aria-label", "Unityの日々の写真");
  const bar = element("div", "lightbox-bar");
  const count = element("span");
  const close = element("button", "lightbox-close", "×");
  close.type = "button";
  close.setAttribute("aria-label", "写真を閉じる");
  bar.append(count, close);
  const layout = element("div", "lightbox-layout");
  const previous = element("button", "lightbox-arrow", "←");
  previous.type = "button";
  previous.setAttribute("aria-label", "前の写真");
  const next = element("button", "lightbox-arrow", "→");
  next.type = "button";
  next.setAttribute("aria-label", "次の写真");
  const largePhoto = element("img", "lightbox-image");
  const largeCaption = element("p", "lightbox-caption");
  largeCaption.setAttribute("aria-live", "polite");
  layout.append(previous, largePhoto, next);
  dialog.append(bar, layout, largeCaption);
  document.body.append(dialog);
  let selectedScene = 0;
  let galleryTrigger;
  const showScene = (index) => {
    selectedScene = (index + scenes.length) % scenes.length;
    const scene = scenes[selectedScene];
    const photo = content.photos[scene.photo];
    largePhoto.src = safeImageUrl(photo.src);
    largePhoto.alt = photo.alt || scene.caption;
    count.textContent = `${String(selectedScene + 1).padStart(2, "0")} / ${String(scenes.length).padStart(2, "0")}`;
    largeCaption.textContent = scene.caption;
  };
  previous.addEventListener("click", () => showScene(selectedScene - 1));
  next.addEventListener("click", () => showScene(selectedScene + 1));
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    document.body.classList.remove("lightbox-open");
    galleryTrigger?.focus({ preventScroll: true });
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showScene(selectedScene + (event.key === "ArrowLeft" ? -1 : 1));
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  scenes.forEach((scene, index) => {
    const figure = element(
      "figure",
      `gallery-item ${["wide", "portrait", "landscape"].includes(scene.layout) ? scene.layout : "landscape"}`,
    );
    const frame = element("div", "gallery-photo");
    appendPhoto(frame, scene.photo, { sizes: "(max-width: 600px) 90vw, 55vw" });
    const open = element("button", "gallery-open");
    open.type = "button";
    open.setAttribute("aria-label", `写真を拡大：${scene.caption}`);
    open.append(frame);
    open.addEventListener("click", () => {
      galleryTrigger = open;
      showScene(index);
      document.body.classList.add("lightbox-open");
      dialog.showModal();
      close.focus();
    });
    const caption = element("figcaption");
    caption.append(
      element("div", "", scene.caption),
      element("span", "", String(gallery.children.length + 1).padStart(2, "0")),
    );
    figure.append(open, caption);
    gallery.append(figure);
  });
  gallery.classList.toggle("compact-gallery", scenes.length <= 2);
  const representative = content.representative;
  if (representative) {
    appendPhoto(
      document.querySelector("#representative-photo"),
      representative.photo,
      {
        sizes: "(max-width: 600px) 85vw, 40vw",
        initial: representative.initial,
      },
    );
    document.querySelector("#representative-role").textContent =
      representative.role;
    document.querySelector("#representative-heading").textContent =
      representative.heading.join("\n");
    document.querySelector("#representative-message").textContent =
      representative.message;
    document.querySelector("#representative-name").textContent =
      representative.name;
    document.querySelector("#representative-hobby").textContent =
      representative.hobby;
  }
  const hosts = document.querySelector("#host-list");
  content.hosts.forEach((host, index) => {
    const card = element("article", "host");
    const frame = element("div", "host-photo");
    appendPhoto(frame, host.photo, {
      sizes: "(max-width: 900px) 42vw, 22vw",
      initial: host.initial,
    });
    const role = element("p", "host-role", host.role || "運営");
    role.append(element("span", "", String(index + 2).padStart(2, "0")));
    const name = element("h4", "host-name", host.name);
    const details = element("details", "host-details");
    const summary = element("summary", "", "好きなこと");
    details.append(summary, element("p", "host-hobby", host.hobby));
    card.append(
      frame,
      role,
      name,
      element("p", "host-message", host.message),
      details,
    );
    hosts.append(card);
  });
  const voices = document.querySelector("#voice-list");
  content.voices.forEach((voice) => {
    const figure = element("figure");
    const caption = element("figcaption", "", voice.name);
    caption.append(element("span", "", voice.detail));
    figure.append(element("blockquote", "", voice.quote), caption);
    voices.append(figure);
  });
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#navigation");
  const media = window.matchMedia("(max-width: 900px)");
  const setMenu = (open, restoreFocus = false) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "メニューを閉じる" : "メニューを開く",
    );
    nav.classList.toggle("open", open);
    if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener("click", () =>
    setMenu(toggle.getAttribute("aria-expanded") !== "true"),
  );
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open"))
      setMenu(false, true);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header") && nav.classList.contains("open"))
      setMenu(false);
  });
  nav.addEventListener("focusout", () => {
    requestAnimationFrame(() => {
      if (
        nav.classList.contains("open") &&
        !document.querySelector(".site-header").contains(document.activeElement)
      )
        setMenu(false);
    });
  });
  const resetMenu = () => setMenu(false);
  if (typeof media.addEventListener === "function")
    media.addEventListener("change", resetMenu);
  else if (typeof media.addListener === "function")
    media.addListener(resetMenu);
  const header = document.querySelector(".site-header");
  const updateHeader = () =>
    header.classList.toggle("scrolled", window.scrollY > 20);
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
})();
