-- Caches researchOperationalFacts() output per city so the AI draft
-- generator doesn't re-run the same web-search research (hours, ticket
-- pricing, restaurants, rental car companies) from scratch on every single
-- customer submission for a city that's already been researched recently.
-- Refreshed by the app itself after RESEARCH_CACHE_TTL_DAYS (see
-- app/draft-guide.ts), no cron needed, just an upsert on cache miss.

create table if not exists city_research_cache (
  city_slug text primary key,
  research_notes text not null,
  updated_at timestamptz not null default now()
);

-- Same security model as the proposals table: RLS enabled with zero
-- policies, only the service-role key (server-only) can ever read or write
-- this, there is no reason for the anon key or any browser client to touch it.
alter table city_research_cache enable row level security;
