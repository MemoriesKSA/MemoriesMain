-- Revision requests and the single unpaid reminder
-- (see docs/paid-plans-spec.md sections 5 and 7).

alter table proposals
  -- What the customer asked to change, kept so the team can act on it and so
  -- there is a record of what the free revision was spent on.
  add column if not exists revision_note text,
  add column if not exists revision_requested_at timestamptz,
  -- Set the moment the one reminder goes out, so it can never go out twice.
  -- The spec is explicit that this is one nudge, not a drip campaign.
  add column if not exists reminder_sent_at timestamptz;

-- The reminder job looks for published, unpaid plans that have not been
-- reminded yet. This keeps that scan cheap as the table grows.
create index if not exists proposals_reminder_scan_idx
  on proposals (status, paid, reminder_sent_at);
