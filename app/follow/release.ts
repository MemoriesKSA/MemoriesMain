// When a finished plan goes out, and what the customer is told about it.
//
// One module because three things need the same answer and must never give
// different ones: the form (what it promises when you tick priority), the
// follow page (what it shows while you wait), and the release job (when it
// actually sends).

/**
 * Standard requests are promised a range and released at the far end of it.
 *
 * The range is deliberately not a single number: a promise of "in 5 hours"
 * that arrives at 5 hours and two minutes reads as late, while "4 to 5 hours"
 * arriving at 5 reads as kept. The top of the range is the real release, so
 * the promise cannot turn out to have been optimistic.
 */
export const STANDARD_WINDOW_HOURS = { min: 4, max: 5 } as const;

/** Priority is promised a time, so it is a single number and a short one. */
export const PRIORITY_WINDOW_HOURS = 1;

/** SAR. Payment is not wired yet; this is the number the form quotes. */
export const PRIORITY_PRICE_SAR = 25;

/**
 * The master switch for sending without a person in the loop.
 *
 * On, deliberately, while only the team is submitting. This is the one
 * capability in the system that reaches a customer with nobody watching, so it
 * is a constant rather than an environment variable: turning it off is a
 * one-line change that goes through review like anything else.
 *
 * A plan is only ever released automatically when the self-check came back
 * clean. Anything flagged waits for a person, whatever this says.
 */
export const AUTO_RELEASE_ENABLED = true;

/**
 * When a request submitted now may be sent.
 *
 * Standard releases at the far end of its promised range, so "6 to 8 hours"
 * is never a sentence that turns out to be optimistic.
 */
export function releaseAt(submittedAt: Date, priority: boolean): Date {
  const hours = priority ? PRIORITY_WINDOW_HOURS : STANDARD_WINDOW_HOURS.max;
  return new Date(submittedAt.getTime() + hours * 3_600_000);
}

/** What the customer is told to expect, in their own language. */
export function deliveryPromise(priority: boolean, ar: boolean): string {
  if (priority) {
    return ar ? "خلال ساعة واحدة" : "within one hour";
  }
  return ar
    ? `خلال ${STANDARD_WINDOW_HOURS.min}–${STANDARD_WINDOW_HOURS.max} ساعات`
    : `within ${STANDARD_WINDOW_HOURS.min}–${STANDARD_WINDOW_HOURS.max} hours`;
}

/**
 * A token for the follow page.
 *
 * Its own secret, separate from public_token, so that handing somebody a
 * status link never hands them the plan.
 */
export function newFollowToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function followUrl(siteUrl: string, token: string, ar: boolean): string {
  return `${siteUrl.replace(/\/$/, "")}${ar ? "/ar" : ""}/follow/${token}`;
}
