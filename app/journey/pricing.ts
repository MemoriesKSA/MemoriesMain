// The one place a plan's price is decided (see docs/paid-plans-spec.md).
//
// It lives here because two surfaces quote it: the planner, while the
// customer is still filling the form, and the journey page, when they are
// asked to unlock. Those used to hold separate copies of the same price
// table, which is fine right up until one of them is edited alone and the
// site quotes two different numbers for the same trip.

/**
 * Free while payments are closed.
 *
 * Nothing can be charged today: the gateway is not live, so a plan quoting a
 * fee is a plan nobody can buy, and the site would be asking for money it has
 * no way to take. Free is the honest version of the same state, and it puts
 * real trips in front of real people while the merchant account is sorted.
 *
 * The rate below is kept, not deleted, and this is the switch back. While
 * this is true no surface states it: not the forms, the example pages, a
 * customer's plan, the terms or the chat assistant (Habib, 7 Oct 2026:
 * "remove anywhere that says the price is 15 a night or was 15 a night, just
 * say free right now"). Each of them shows the figure again in its paid
 * branch, except legal-content.ts, whose fee paragraph is plain text and has
 * to be given its numbers back by hand before a riyal is charged.
 *
 * Turning it off does NOT re-lock what was given away. Mark every existing
 * unpaid plan paid first, or a customer who was handed a finished plan opens
 * their link one day and finds two thirds of it hidden.
 */
export const PLANS_FREE = true;

/** Per night of the trip. Was 20 until 2026-08-22. */
export const NIGHT_RATE = 15;

/**
 * Per destination after the first. A second city is a second set of
 * research, another hotel chosen and a transition to plan, none of which
 * the night count reflects: three cities in nine nights is materially more
 * work than one city in nine nights.
 */
export const EXTRA_STOP_FEE = 20;

/** Nights between two ISO dates, or 0 if either is missing or malformed. */
export function nightsBetween(from: string | null | undefined, to: string | null | undefined): number {
  if (!from || !to) return 0;
  const start = new Date(`${from}T00:00:00Z`).getTime();
  const end = new Date(`${to}T00:00:00Z`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.round((end - start) / 86_400_000);
}

/**
 * What the plan costs: the nights, plus each destination after the first.
 *
 * There is deliberately no minimum. A one-night trip is a real, small piece
 * of work and is priced as one, and the paywall keeps it worth buying by
 * withholding the day itself rather than leaning on a price floor.
 */
export function listPlanFee(nights: number, stopCount: number): number {
  const safeNights = Number.isFinite(nights) && nights > 0 ? Math.floor(nights) : 0;
  const extraStops = Number.isFinite(stopCount) && stopCount > 1 ? Math.floor(stopCount) - 1 : 0;
  return safeNights * NIGHT_RATE + extraStops * EXTRA_STOP_FEE;
}

/**
 * What we are charging for it today, which is nothing while PLANS_FREE.
 *
 * Separate from listPlanFee because "what is this worth" and "what are we
 * billing" are different questions with different answers right now, and a
 * single function answering both told the plan page a plan was worth SAR 0.
 */
export function planFee(nights: number, stopCount: number): number {
  return PLANS_FREE ? 0 : listPlanFee(nights, stopCount);
}

/**
 * A trip runs one more day than it has nights: arrive, sleep, leave.
 */
export function daysFromNights(nights: number): number {
  return nights > 0 ? nights + 1 : 0;
}

/**
 * What every plan is priced and charged in. The currency on a request is the
 * customer's trip budget; the fee is ours, and it is riyals.
 */
export const PLAN_CURRENCY = "SAR";

/** Riyals to halalas. A payment provider charges in the smallest unit. */
export function toHalalas(riyals: number): number {
  return Math.round(riyals * 100);
}

/**
 * The unlock fee for a stored plan, exactly as the journey page quotes it.
 *
 * The page and the payment check both call this. A payment checked against a
 * different number than the button showed is either a customer charged the
 * wrong amount or a paid plan that never unlocks.
 */
export function listPlanFeeForProposal(proposal: { from_date?: string | null; to_date?: string | null; stops?: unknown }): number {
  const stops = Array.isArray(proposal.stops) ? proposal.stops.length : 0;
  const stopCount = Math.min(Math.max(stops || 1, 1), 3);
  return listPlanFee(nightsBetween(proposal.from_date, proposal.to_date), stopCount);
}

/** What this stored plan is billed, which is nothing while PLANS_FREE. */
export function planFeeForProposal(proposal: { from_date?: string | null; to_date?: string | null; stops?: unknown }): number {
  return PLANS_FREE ? 0 : listPlanFeeForProposal(proposal);
}
