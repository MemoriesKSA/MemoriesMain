// Server-side paywall for published plans (see docs/paid-plans-spec.md).
//
// THE RULE THIS FILE EXISTS TO ENFORCE: locked days must never be sent to the
// browser. Rendering the whole plan and hiding part of it with CSS would make
// the entire product free to anyone who opens devtools. So the split happens
// here, on the server, and the withheld text is dropped before the page is
// ever serialised. `applyPaywall` returns the text that may be shown plus the
// bare headings of what is withheld, and nothing else crosses the boundary.
//
// The page shows locked days as blurred text rather than as a bare list of
// titles, because the shape of a real day is far better proof that something
// is there. That is done WITHOUT sending the day: only its measurements
// travel, and the browser draws meaningless filler to those measurements. A
// CSS blur over the real words would defeat this entire file, since a blur
// is removed with one click in devtools and the source shows the plain text
// to anyone who looks.

import { dayNumberFromLine } from "./parse-itinerary";
import { freeDayNumbers, type PlanStop } from "./plan-stops";

/**
 * A withheld day, described only by its measurements.
 *
 * `lineLengths` is how many characters each withheld line had. That is enough
 * for the page to draw a convincing blurred block, and not enough to recover
 * a single word.
 */
export type LockedDay = {
  /** The heading, which is deliberately shown: it is the teaser. */
  title: string;
  /** Characters per withheld line. Never the characters themselves. */
  lineLengths: number[];
};

export type PaywalledPlan = {
  /** Everything the reader is allowed to see, as plain text. */
  visibleText: string;
  /** Withheld days as headings plus measurements. Never their contents. */
  lockedDays: LockedDay[];
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
  if (!text) return { visibleText: "", lockedDays: [] };

  const freeDays = new Set(freeDayNumbers(stops, totalDays));
  const lines = text.split(/\r?\n/);

  const visible: string[] = [];
  const lockedDays: LockedDay[] = [];
  // Null while still in the overview, which is always kept.
  let currentDayIsFree: boolean | null = null;

  for (const line of lines) {
    const dayNumber = dayNumberFromLine(line);

    if (dayNumber !== null) {
      currentDayIsFree = freeDays.has(dayNumber);
      if (currentDayIsFree) visible.push(line);
      else lockedDays.push({ title: line.trim(), lineLengths: [] });
      continue;
    }

    // Overview lines, or lines belonging to a day we are keeping.
    if (currentDayIsFree === null || currentDayIsFree) {
      visible.push(line);
      continue;
    }

    // A line of a withheld day. Only its length survives, and blank lines
    // are skipped so the drawn block doesn't inherit the source's spacing.
    const trimmed = line.trim();
    if (trimmed) lockedDays[lockedDays.length - 1]?.lineLengths.push(trimmed.length);
  }

  return { visibleText: visible.join("\n").trim(), lockedDays };
}

// Marks a name the reader has not paid to see. Carries the length so the page
// can draw a blurred pill the right width, and nothing else. Square brackets
// of a kind no itinerary uses, so it cannot collide with real prose.
const REDACTION = (length: number) => `⟦R:${length}⟧`;
export const REDACTION_PATTERN = /⟦R:(\d+)⟧/g;

/**
 * Hides every name an unpaid reader could act on, while leaving the reasons,
 * the tiers and the prices readable.
 *
 * It began as the hotel picks only, then the alternatives too, on the
 * reasoning that "swap the AlUla leg for The Chedi Hegra, from about SAR
 * 3,915 a night" is a researched recommendation somebody can act on without
 * paying. That reasoning was right and the scope was too narrow: the
 * restaurants, the drivers and the attractions are the same kind of answer.
 * A Bangkok teaser that named the Muslim-run kitchen, its street address and
 * the fixed-price transfer company had already given away the work.
 *
 * What stays is everything that proves the work is real and none of which can
 * be acted on: the reasoning, every figure, the halal and prayer guidance, the
 * districts to look in, the warnings and the hedges. A reader can see there is
 * a property at SAR 3,915 a night, and a halal kitchen in a named quarter, and
 * that we have a reason for both. They cannot see which ones.
 *
 * Done here rather than with a blur in the browser for the same reason as the
 * days: a name blurred in CSS is still a name sitting in the page source.
 */
export function redactPlaceNames(text: string, placeNames: string[]): string {
  if (!text || !placeNames.length) return text;

  // Longest first, so a name containing another is matched whole.
  const ordered = [...placeNames].filter(Boolean).sort((a, b) => b.length - a.length);
  const escape = (name: string) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  let out = text;
  for (const name of ordered) {
    out = out.replace(new RegExp(escape(name), "gi"), () => REDACTION(name.length));
  }
  // The tag right after a name goes too: "(4-star suite hotel on Olaya
  // Street)" narrows it to one property as surely as the name does. A
  // parenthetical carrying a figure is left alone, since the prices are the
  // part worth showing.
  return out.replace(/(⟦R:\d+⟧)\s*\(([^)]{0,120})\)/g, (whole, marker: string, inner: string) =>
    CARRIES_A_FIGURE.test(inner) ? whole : `${marker} ${REDACTION(inner.length + 2)}`,
  );
}

// Old name, kept so the reviewer tooling and existing tests keep compiling.
export const redactStayNames = redactPlaceNames;

// A parenthetical that quotes money or a rate, which stays readable.
const CARRIES_A_FIGURE = /SAR|USD|ريال|دولار|\d[\d,.]*\s*(a night|per night|لليلة)/i;

/**
 * Whether a plan should be paywalled at all. Kept in one place so the page,
 * the email and any future surface cannot drift apart on the question.
 */
export function shouldPaywall(proposal: { paid?: boolean | null }): boolean {
  return proposal.paid !== true;
}
