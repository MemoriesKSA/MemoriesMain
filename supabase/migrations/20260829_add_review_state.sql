-- Green and yellow, as a column rather than a regular expression.
--
-- Whether a plan may be sent without a person reading it is the most
-- consequential fact about it, and until now the only record of it was the
-- phrase "AI self-check: CLEAN" inside a free-text notes column. Three
-- different places matched that string with three different patterns, and a
-- diagnostic that read it wrongly reported a clean draft as unchecked.
--
-- 'clean'   the self-check found nothing; safe to release automatically
-- 'flagged' the self-check found something; a person must read it first
-- null      the self-check never ran or never finished
--
-- Apply by hand, as with every migration here.

alter table proposals
  add column if not exists review_state text;

-- The reviewer page and the release job both ask "what is waiting for me" and
-- "what may go out", so both queries are on this column and the release clock.
create index if not exists proposals_review_state_idx on proposals (review_state, release_at);

comment on column proposals.review_state is
  'clean = releasable without a person, flagged = a person must read it, null = never checked.';

-- Backfill from the notes we already have, so the split is right for every
-- plan written before this column existed rather than only new ones.
update proposals
   set review_state = case
     when notes ilike '%self-check: CLEAN%' then 'clean'
     when notes ilike '%needs a look%'      then 'flagged'
     else null
   end
 where review_state is null
   and notes is not null;
