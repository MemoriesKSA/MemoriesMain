-- Paid plans (see docs/paid-plans-spec.md).
--
-- Turns the journey plan into the product: the customer sees the overview
-- and the first day of each stop for free, then pays to unlock the rest.

alter table proposals
  add column if not exists paid boolean not null default false,
  add column if not exists paid_at timestamptz,
  -- The payment provider's own reference, so a charge can be traced back
  -- from their dashboard to this plan and vice versa.
  add column if not exists payment_ref text,
  -- What was actually charged, in the smallest currency unit (halalas), so
  -- a later price change never rewrites history on old plans.
  add column if not exists amount integer,
  add column if not exists revision_used boolean not null default false,
  -- Ordered stops for this one trip, e.g.
  --   [{"slug":"riyadh","label":"Riyadh","firstDay":1},
  --    {"slug":"jeddah","label":"Jeddah","firstDay":5}]
  -- firstDay is the sequential day number the stop begins on, which is how
  -- the page knows which days to show free. Null on older single-city rows,
  -- which fall back to the city column.
  add column if not exists stops jsonb;

-- Everything published before this migration was delivered free. Grandfather
-- it as paid so no existing customer loses access to a plan they already
-- have a link to.
update proposals set paid = true, paid_at = coalesce(paid_at, created_at)
where paid = false;

-- Finding a plan from a provider webhook has to be fast and exact.
create index if not exists proposals_payment_ref_idx on proposals (payment_ref);
