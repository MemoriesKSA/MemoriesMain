-- What each draft cost to produce, in US dollars at list prices.
--
-- Why this exists: the pipeline spent real money all day on 2026-08-20 and
-- there was no way to answer "what did that cost" except arithmetic off the
-- pricing page. One city was pre-warmed three times by an SDK retry, for
-- about $15, and the only reason anyone found out was the bill. A figure per
-- draft turns that from a surprise into a number somebody can look at.
--
-- An estimate, not an invoice: it is computed from token counts and
-- Anthropic's published rates (see the price constants in
-- app/draft-guide.ts), which drift. Good enough to spot a draft that cost
-- ten times what it should, which is the job.
--
-- Nullable on purpose. Rows written before this existed have no figure, and
-- a draft that fails partway has no meaningful total, so zero would be a
-- lie in both cases.

alter table proposals
  add column if not exists draft_cost_usd numeric(10, 4);

comment on column proposals.draft_cost_usd is
  'Estimated cost of generating this draft in USD at list prices: research, English draft, Arabic translation and self-check. Null for drafts written before cost tracking, or for ones that did not complete.';
