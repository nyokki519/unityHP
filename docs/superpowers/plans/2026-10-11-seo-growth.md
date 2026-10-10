# Unity SEO Growth Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline. User requests autonomous execution without approval stops.

**Goal:** Deliver readable HP SEO and a weekly, free, evidence-based SEO Growth Agent.
**Architecture:** Static HP content + Python weekly monitor + private Analytics ingestion.
**Tech Stack:** HTML/CSS/JS, Python 3.11+, google-auth, GitHub Actions, Next.js/Supabase.
**Spec:** ../specs/2026-10-11-seo-growth-design.md

## Global Constraints
- Preserve supplied photographs, design, animation and members.
- Preserve existing ownership HTML and robots; update existing sitemap only for a genuine new page.
- No new paid service or external AI API; existing isolated checkouts, no worktrees.
- No fabricated dates, rankings, Instagram account settings or conversions.
- Unknown data is not zero; credentials never enter reports or source.

## Review Focus
- Empty/anonymized/truncated GSC data: accurate totals separate from displayed rows.
- Missing auth/429/partial inspection: bounded requests and explicit unknown status.
- Duplicate weekly runs and task cooldown: no overwrites or daily ranking churn.
- Untrusted titles/queries/vault paths: no arbitrary execution or traversal.
- Concurrent ingest: reject conflicting overwrite, retain original report.

### Task 1: HP crawlability and guide
Files: tools/build-static.mjs, tools/check-seo.py, index.html, content.js, script.js, cafe-community/index.html, sitemap.xml, docs/seo/*.md.
- [ ] Write/run initial-HTML tests: member text, photo alt, links, structured data and guide fail before implementation.
- [ ] Generate central-data static content, hydrate existing images, add truthful graph and one participation guide; retain robots/verification.
- [ ] Run SEO tests and existing browser suite; commit.

### Task 2: SEO Growth Agent
Files: Unity-agent/seo_growth/{gsc,analysis,audit,storage,report,cli,automation}.py, tests/, config.json, .github/workflows/seo-weekly.yml, README.md.
Interfaces: report schemaVersion 1; periods, metrics, query/page observations and task ids; HTTP transport injected in tests; SQLite managed state + Markdown output.
- [ ] Write failing tests for auth/requests/pagination, period lag, comparison, missing data, safe history/task cooldown/vault writes.
- [ ] Implement read-only GSC and public audits, weekly reporting and tested allowlisted PR automation.
- [ ] Run complete unittest suite and a no-auth report; commit.

### Task 3: Analytics bridge
Files: lib/seo-growth.ts, app/api/seo/reports/route.ts, tests/seo-growth.test.ts, supabase/migrations/013_seo_growth.sql, docs/seo-growth.md.
Interface: Bearer SEO_INGEST_TOKEN; schema 1; immutable idempotent reports by id; private GET and POST.
- [ ] Write and run failing validation/auth/ingest tests.
- [ ] Implement bounded body/strict validation/auth/storage; additive RLS SQL; deployment instructions.
- [ ] Run focused/full tests, typecheck/build; commit.

### Task 4: Public verification and handoff
Files: HP tools/audit-public.py and .github/workflows/seo-validation.yml, docs/seo/diagnosis.md and final-status.md.
- [ ] Push completed changes; CI verifies published Pages, sitemap, robots, ownership, initial HTML, guide and source links.
- [ ] Review complete changes with one fresh reviewer; address important findings with tests.
- [ ] Document official source URLs, verified/unverified research, Instagram proposal, auth setup, rollback and remaining activation steps.
