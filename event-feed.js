"use strict";
/* Public feed adapter. It deliberately reads only public scheduling fields. */
(() => {
  const categories = [
    "CAFE",
    "BOOK",
    "BEAUTY",
    "LATTE ART",
    "BOARD GAME",
    "SPORT",
    "COMMUNITY",
  ];
  function month(now=Date.now()){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit'}).format(new Date(now));}
  function normalize(payload, options = {}, now = Date.now()) {
    if (
      !payload ||
      payload.version !== 1 ||
      payload.month !== month(now) ||
      !Array.isArray(payload.events) ||
      payload.events.length > 10000
    )
      throw new Error("invalid_feed");
    const unique = new Set();
    return payload.events
      .flatMap((event) => {
        if (
          !event ||
          typeof event.id !== "string" ||
          !event.id ||
          unique.has(event.id)
        )
          return [];
        if (
          typeof event.title !== "string" ||
          !event.title.trim() ||
          typeof event.startsAt !== "string"
        )
          return [];
        if (
          !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
            event.startsAt,
          )
        )
          return [];
        const timestamp = Date.parse(event.startsAt);
        if (!Number.isFinite(timestamp) || month(timestamp) !== month(now)) return [];
        const category = categories.includes(event.category)
          ? event.category
          : "COMMUNITY";
        let url = null;
        if (typeof event.url === "string") {
          try {
            const parsed = new URL(event.url);
            if (
              parsed.protocol === "https:" &&
              !parsed.username &&
              !parsed.password
            )
              url = parsed.href;
          } catch {}
        }
        unique.add(event.id);
        return [
          {
            id: event.id,
            title: event.title.trim(),
            startsAt: new Date(timestamp).toISOString(),
            category: typeof event.category==='string' ? event.category.slice(0,80) : category,
            endsAt:typeof event.endsAt==='string'&&Number.isFinite(Date.parse(event.endsAt))&&Date.parse(event.endsAt)>=timestamp?event.endsAt:null,
            image: options.images?.[category] || "cafe",
            url,
            location:
              typeof event.location === "string" ? event.location : null,
            description:
              typeof event.description === "string"
                ? event.description
                : "内容・参加費・会場は、Instagramや公式LINEでご確認ください。",
          },
        ];
      })
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .slice(0, options.limit || 10000);
  }
  window.UNITY_EVENT_FEED = { normalize, month };
})();
