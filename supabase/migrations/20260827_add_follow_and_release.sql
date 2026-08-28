-- A customer can follow their request from the moment they submit it.
--
-- Until now the proposals row did not exist until drafting FINISHED, roughly
-- eight minutes after submission. A "follow your request" link in the
-- confirmation email would therefore 404 at exactly the moment the customer
-- first clicked it, which is the moment they care most. So the row is now
-- created at submit time with status 'received' and filled in as the pipeline
-- runs.
--
-- Apply by hand, as with every migration in this folder. The code tolerates
-- these columns being absent, so a deploy can safely land before this runs.

alter table proposals
  -- When the finished plan may be released to the customer. Standard requests
  -- get a longer window than priority ones; the column holds the answer rather
  -- than the rule, so changing the rule never rewrites history.
  add column if not exists release_at timestamptz,

  -- Paid priority. Shortens the window above. Payment is not wired yet, so
  -- this is set by hand or by the form and charged later.
  add column if not exists priority boolean not null default false,

  -- When the plan email actually went. The follow page's last stage is driven
  -- by this and nothing else, so it can never claim a plan was sent before it
  -- was.
  add column if not exists sent_at timestamptz,

  -- Set when the pipeline finishes writing, so the follow page can tell the
  -- difference between "still being written" and "written, awaiting release".
  add column if not exists drafted_at timestamptz,

  -- The follow page's own key, deliberately NOT public_token.
  --
  -- Two capabilities, two secrets: public_token opens the plan the customer
  -- paid for, this one opens a page saying how far along it is. Leaking the
  -- status link must never hand over the plan. The reference was the other
  -- candidate and was rejected: it is eight hex characters taken from a UUID,
  -- which is guessable at scale, and it is printed in every email.
  add column if not exists follow_token text;

create unique index if not exists proposals_follow_token_key on proposals (follow_token);

-- The reference is now written at submit time rather than at the end of
-- drafting, so it has to be unique from the start.
create unique index if not exists proposals_reference_key on proposals (reference);

comment on column proposals.release_at is 'When the finished plan may be sent. Null means no schedule was set.';
comment on column proposals.priority is 'Customer paid for a shorter release window.';
comment on column proposals.sent_at is 'When the plan email actually went to the customer.';
comment on column proposals.drafted_at is 'When the drafting pipeline finished writing this plan.';
