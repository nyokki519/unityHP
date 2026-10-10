# Unity SEO Growth design

Goal: preserve the existing site and increase discoverability through readable HTML, truthful metadata, and a free weekly evidence-based SEO loop. User explicitly authorizes autonomous research, implementation, tests, GitHub reflection and publication; review/approval pauses are replaced by recorded decisions, except credentials or unavailable external configuration.

## Architecture
1. HP: generate static content from existing content.js, retaining the visual design and client interactions. Existing ownership file/robots/sitemap are preserved; sitemap gains only one genuinely useful cafe participation guide. Organization/WebSite/WebPage structured data only; no invented dated Event, ratings, addresses, or rankings.
2. Empty Unity-agent repository: Python standard-library modules plus google-auth for read-only GSC authentication. GitHub Actions runs weekly. Separate property totals, query rows, and page rows, final-data lag and Pacific dates, sampled/truncated data, URL inspection limitations, public HTTP audits, immutable Markdown/JSON artifacts, local SQLite task/measure history and Obsidian-managed reports. No extra AI API.
3. Analytics: dedicated-token authenticated ingest/read APIs and additive RLS-protected storage migration; no public search-query or credential exposure. Schema version 1 connects agent reports to existing Supabase.
4. Safe automation: technical metadata/alt/static-build/sitemap updates only through tested pull requests. No automated publishing of marketing copy or arbitrary agent commands. 28-day cooldown and a single open improvement branch, no position-chasing. Pending tasks persist; history links patches, observations and later evidence without claiming causality.

## Facts and uncertainty
Confirmed: Tokyo/Shinagawa cafe community, 20s focus, reading/board-game/social activities, real provided photographs, member introductions, Instagram unity_up9, main Tunagate Circle ID 93279 in Analytics. No confirmed future event schedule or specific Gotanda reading venue; do not fabricate.
GSC ownership is user-reported; existing verification file is present. ADC is not usable in this environment. Public/Google/Meta requests are blocked by current cloud proxy; save destinations for user settings and perform public smoke tests through GitHub Actions. Indexing status and live field CWV remain unknown until authoritative authenticated/API evidence is available.

## Contracts and checks
Agent report schemaVersion=1; siteUrl=https://nyokki519.github.io/unityHP/; period start/end are inclusive YYYY-MM-DD; GSC dimensions=[] totals and separate query/page tables; unavailable never equals zero. URL inspection reads Google's last indexed snapshot, not live fetch or index submission. Reports are plaintext managed Markdown, never executable commands. Paths stay inside output/vault; user-edited reports are preserved.
Ingest: POST /api/seo/reports, GET /api/seo/reports, Bearer SEO_INGEST_TOKEN, <=512KiB UTF-8; strict finite metric/date/site/schema validation; idempotent insert by report id, reject divergent overwrite; SQL storage disabled until migration applies.
Validation: HP initial HTML/metadata/JSON-LD/links/no-JS visibility; existing browser suite; agent HTTP/auth/pagination/missing-data/comparison/cooldown/path safety tests; Analytics focused tests then full suite, typecheck and build; GitHub Pages public status and published content checks through CI.
