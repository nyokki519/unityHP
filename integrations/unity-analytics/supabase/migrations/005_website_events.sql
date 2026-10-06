-- Run on the Analytics database, not on the static website.
-- Explicit publication separates website events from imported drafts/internal events.
alter table public.events add column if not exists website_visible boolean not null default false;
create index if not exists idx_events_website_upcoming on public.events(starts_at)
  where website_visible = true;
comment on column public.events.website_visible is 'Explicit approval to list this event in the public Unity website feed';
-- Existing RLS stays enabled. Do not grant anonymous database access.
