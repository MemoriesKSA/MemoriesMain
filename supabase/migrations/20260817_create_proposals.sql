-- Proposals: the finalized, customer-facing itinerary a reviewer publishes
-- after working from the AI draft. Row-level security is enabled with NO
-- policies added on purpose, with RLS on and zero policies, the anon and
-- authenticated roles can read or write nothing at all. Only the
-- service_role key (used server-side in app/supabase-admin.ts, never
-- exposed to the browser) can touch this table. That's the entire access
-- control model: the public /journey/[token] page and the /internal
-- reviewer tool both go through our own server code, which enforces the
-- token match or the reviewer allowlist check itself, never Postgres RLS
-- policies keyed on request data.

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  public_token text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published')),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  city text not null,
  from_date date,
  to_date date,
  currency text not null default 'SAR',
  price numeric,
  itinerary_en text,
  itinerary_ar text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.proposals enable row level security;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger proposals_set_updated_at
  before update on public.proposals
  for each row
  execute function public.set_updated_at();
