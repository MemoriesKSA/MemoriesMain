// The one place a plan's price is decided (see docs/paid-plans-spec.md).
//
// It lives here because two surfaces quote it: the planner, while the
// customer is still filling the form, and the journey page, when they are
// asked to unlock. Those used to hold separate copies of the same price
// table, which is fine right up until one of them is edited alone and the
// site quotes two different numbers for the same trip.

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
export function planFee(nights: number, stopCount: number): number {
  const safeNights = Number.isFinite(nights) && nights > 0 ? Math.floor(nights) : 0;
  const extraStops = Number.isFinite(stopCount) && stopCount > 1 ? Math.floor(stopCount) - 1 : 0;
  return safeNights * NIGHT_RATE + extraStops * EXTRA_STOP_FEE;
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
export function planFeeForProposal(proposal: { from_date?: string | null; to_date?: string | null; stops?: unknown }): number {
  const stops = Array.isArray(proposal.stops) ? proposal.stops.length : 0;
  const stopCount = Math.min(Math.max(stops || 1, 1), 3);
  return planFee(nightsBetween(proposal.from_date, proposal.to_date), stopCount);
}
