-- Marks a cache entry as hand-researched and verified rather than produced
-- by the automated researchOperationalFacts() web-search pass.
--
-- Why this exists: the cache has a 7-day TTL, so without this flag any
-- hand-written entry would silently expire and get overwritten by an
-- automated pass a week later, throwing the careful version away and
-- paying API cost to replace it with something weaker. Curated entries
-- never expire on their own (see getCachedResearch in app/draft-guide.ts);
-- they're refreshed deliberately, not on a timer. That's safe here because
-- a human reviewer already verifies hours, pricing and availability before
-- anything reaches a customer, so a slightly dated entry is a starting
-- point, never something published unchecked.

alter table city_research_cache
  add column if not exists curated boolean not null default false;
