-- Somewhere for people to tell us what they think, in their own words.
--
-- Deliberately almost empty: one required message and everything else
-- optional. A feedback form that demands a name and an email before it will
-- listen collects fewer, politer, less useful answers than one that does not,
-- and the people most worth hearing from are the ones in a hurry.
--
-- `about` carries an optional subject, e.g. the country slug from a "we're
-- working on it" page, so wanting-this-destination arrives as a countable
-- signal rather than as prose someone has to read and tally.

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  name text,
  email text,
  about text,
  locale text not null default 'en',
  -- Where they were standing when they said it. Useful for the ones that
  -- read as "this page is confusing" with no mention of which page.
  page text,
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_at_idx on feedback (created_at desc);
create index if not exists feedback_about_idx on feedback (about) where about is not null;

-- Same security model as proposals and city_research_cache: RLS on, no
-- policies at all, so only the service-role key server-side can read or
-- write. The browser posts to our own API route, never to Supabase, so the
-- anon key never needs to touch this and a scraper cannot read what people
-- wrote about us.
alter table feedback enable row level security;
