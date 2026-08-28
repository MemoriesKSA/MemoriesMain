// Where a request has got to, worked out from timestamps alone.
//
// Pure on purpose. Everything the follow page shows is derived here from four
// times and a verdict, so the whole thing can be tested without a database and
// without waiting eight hours for a stage to change.
//
// The stages are the pipeline's real steps. Research really runs, the English
// draft really is the longest single step, the Arabic really is a separate
// pass, and the self-check really reads both. What the page must never do is
// invent a timestamp for work that did not happen: the last stage flips on
// sent_at and nothing else, so it cannot claim a plan reached somebody before
// it did.

export type StageKey = "received" | "researching" | "writing" | "arabic" | "checking" | "final" | "sent";

export type Stage = {
  key: StageKey;
  /** "done" is finished, "active" is happening now, "waiting" has not started. */
  state: "done" | "active" | "waiting";
  /** When it finished, where we know. Null while it is still running. */
  at: Date | null;
};

export type FollowInput = {
  submittedAt: Date;
  /** When the pipeline finished writing. Null while it is still writing. */
  draftedAt: Date | null;
  /** When the finished plan may be sent. Null if no schedule was set. */
  releaseAt: Date | null;
  /** When the plan email actually went. */
  sentAt: Date | null;
  /** True when the self-check flagged something, so a person really is looking. */
  needsReview: boolean;
  now: Date;
};

/**
 * How long each writing step takes, in seconds, measured from real drafts.
 *
 * Only used to pace the five drafting stages while the pipeline is still
 * running, so the page moves rather than sitting on "received" for ten
 * minutes. Once drafted_at exists these are irrelevant: every one of them is
 * marked done, because it is.
 *
 * Writing is much the longest, which is not a flourish. A 14,000-token English
 * draft is most of the wall clock; the research before it comes from cache for
 * a warm city, and the checks after it are short by comparison.
 */
const PACE: Record<Exclude<StageKey, "final" | "sent">, number> = {
  received: 0,
  researching: 90,
  writing: 400,
  arabic: 260,
  checking: 150,
};

const ORDER: StageKey[] = ["received", "researching", "writing", "arabic", "checking", "final", "sent"];

/** Seconds from submission at which each drafting stage is expected to end. */
function expectedEnds(submittedAt: Date): Map<StageKey, number> {
  const out = new Map<StageKey, number>();
  let running = 0;
  for (const key of ["received", "researching", "writing", "arabic", "checking"] as const) {
    running += PACE[key];
    out.set(key, running);
  }
  return out;
}

export function followStages(input: FollowInput): Stage[] {
  const { submittedAt, draftedAt, releaseAt, sentAt, needsReview, now } = input;
  const elapsed = (now.getTime() - submittedAt.getTime()) / 1000;
  const ends = expectedEnds(submittedAt);

  // The plan has actually reached the customer. Everything before it is done,
  // whatever the clocks say, because the only way to get here is to have sent.
  if (sentAt) {
    return ORDER.map((key) => ({ key, state: "done" as const, at: key === "sent" ? sentAt : key === "final" ? sentAt : draftedAt }));
  }

  const drafting = ORDER.slice(0, 5) as Exclude<StageKey, "final" | "sent">[];

  // Writing is finished. Every drafting stage is done and the request is in
  // its release window.
  if (draftedAt) {
    return [
      ...drafting.map((key) => ({ key, state: "done" as const, at: draftedAt })),
      { key: "final" as const, state: "active" as const, at: null },
      { key: "sent" as const, state: "waiting" as const, at: null },
    ];
  }

  // Still writing. Pace the drafting stages so the page moves, and never mark
  // one done past the last stage, since we cannot know it finished.
  return ORDER.map((key) => {
    if (key === "final" || key === "sent") return { key, state: "waiting" as const, at: null };
    const endsAt = ends.get(key) ?? 0;
    const startsAt = endsAt - PACE[key as keyof typeof PACE];
    if (elapsed >= endsAt && key !== "checking") return { key, state: "done" as const, at: null };
    if (elapsed >= startsAt) return { key, state: "active" as const, at: null };
    return { key, state: "waiting" as const, at: null };
  });
}

/** The stage a customer is looking at right now. */
export function currentStage(stages: Stage[]): Stage {
  return stages.find((s) => s.state === "active") ?? stages[stages.length - 1];
}

/**
 * When the plan should reach them, as a real time rather than a countdown.
 *
 * A countdown that slips is worse than a time that holds, and the release
 * window is generous enough that the time will hold.
 */
export function expectedDelivery(input: FollowInput): Date | null {
  if (input.sentAt) return input.sentAt;
  if (input.releaseAt) return input.releaseAt;
  return null;
}

/** How far through, 0 to 1, for a bar that has to move without lying. */
export function progress(input: FollowInput): number {
  const { submittedAt, releaseAt, sentAt, now } = input;
  if (sentAt) return 1;
  const target = releaseAt ?? null;
  if (!target) {
    // No schedule: fall back to the drafting pace so the bar still moves.
    const total = Object.values(PACE).reduce((a, b) => a + b, 0);
    const elapsed = (now.getTime() - submittedAt.getTime()) / 1000;
    return Math.max(0.02, Math.min(0.95, elapsed / total));
  }
  const span = target.getTime() - submittedAt.getTime();
  if (span <= 0) return 0.95;
  const done = now.getTime() - submittedAt.getTime();
  // Never a full bar before the plan is actually sent.
  return Math.max(0.02, Math.min(0.97, done / span));
}
