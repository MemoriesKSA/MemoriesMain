// Server-side paywall for published plans (see docs/paid-plans-spec.md).
//
// THE RULE THIS FILE EXISTS TO ENFORCE: locked days must never be sent to the
// browser. Rendering the whole plan and hiding part of it with CSS would make
// the entire product free to anyone who opens devtools. So the split happens
// here, on the server, and the withheld text is dropped before the page is
// ever serialised. `applyPaywall` returns the text that may be shown plus the
// bare headings of what is withheld, and nothing else crosses the boundary.

import { dayNumberFromLine } from "./parse-itinerary";
import { freeDayNumbers, type PlanStop } from "./plan-stops";

export type PaywalledPlan = {
  /** Everything the reader is allowed to see, as plain text. */
  visibleText: string;
  /** Headings only, for the days being withheld. Never their contents. */
  lockedTitles: string[];
};

/**
 * Splits an itinerary into what an unpaid reader may see and what they may
 * not. Free days are the first day of every stop, so a two-city trip shows
 * day one of each rather than only the very first.
 *
 * Everything before the first day heading (the overview: hotel and driver
 * picks, practical notes, getting there) is always visible. It is the proof
 * the plan is genuinely theirs, and withholding it would hide the very
 * evidence that makes it worth paying for.
 *
 * `totalDays` lets a very short trip withhold every day, since on a one or
 * two day plan the free day would be the plan. See freeDayNumbers.
 */
export function applyPaywall(text: string, stops: PlanStop[] | null, totalDays?: number): PaywalledPlan {
  if (!text) return { visibleText: "", lockedTitles: [] };

  const freeDays = new Set(freeDayNumbers(stops, totalDays));
  const lines = text.split(/\r?\n/);

  const visible: string[] = [];
  const lockedTitles: string[] = [];
  // Null while still in the overview, which is always kept.
  let currentDayIsFree: boolean | null = null;

  for (const line of lines) {
    const dayNumber = dayNumberFromLine(line);

    if (dayNumber !== null) {
      currentDayIsFree = freeDays.has(dayNumber);
      if (currentDayIsFree) visible.push(line);
      else lockedTitles.push(line.trim());
      continue;
    }

    // Overview lines, or lines belonging to a day we are keeping.
    if (currentDayIsFree === null || currentDayIsFree) visible.push(line);
    // Otherwise this line belongs to a locked day and is simply dropped.
  }

  return { visibleText: visible.join("\n").trim(), lockedTitles };
}

/**
 * Whether a plan should be paywalled at all. Kept in one place so the page,
 * the email and any future surface cannot drift apart on the question.
 */
export function shouldPaywall(proposal: { paid?: boolean | null }): boolean {
  return proposal.paid !== true;
}
