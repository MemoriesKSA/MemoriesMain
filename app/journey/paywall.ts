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
 * Hides the chosen hotel names in the overview while leaving every reason
 * for choosing them in place.
 *
 * The point is to tease, not to withhold the proof: "an outdoor pool and
 * garden after dusty desert mornings, well-reviewed, and a straightforward
 * mid-range base that keeps your budget in good shape" is what convinces
 * someone the plan is real and theirs. Only the answer is held back.
 *
 * Scoped to the stay section on purpose. Hotels named elsewhere are the
 * upgrade options, and those work as aspiration precisely because they are
 * readable.
 *
 * Done here rather than with a blur in the browser for the same reason as
 * the days: a name blurred in CSS is still a name sitting in the page source.
 */
export function redactStayNames(text: string, stayNames: string[]): string {
  if (!text || !stayNames.length) return text;

  const lines = text.split(/\r?\n/);
  // Longest first, so a hotel whose name contains another's is matched whole.
  const ordered = [...stayNames].filter(Boolean).sort((a, b) => b.length - a.length);
  const escape = (name: string) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Which lines are the stay block, and which hotels were actually chosen.
  // Only the picks are hidden: the hotels named further down are the upgrade
  // options, and those work as aspiration precisely because they're readable.
  const inStay: boolean[] = [];
  const chosen = new Set<string>();
  let insideStay = false;
  lines.forEach((line, i) => {
    const heading = line.trim();
    if (isStayHeading(heading)) {
      insideStay = true;
      inStay[i] = false;
      return;
    }
    if (insideStay && isOtherHeading(heading)) insideStay = false;
    inStay[i] = insideStay;
    // Only the assignment lines, "Riyadh, Days 1-7: <hotel> (<tag>)", name a
    // pick. The prose underneath them discusses the upgrade options, and
    // treating those as picks hid the very names the upsell depends on.
    if (insideStay && isStayAssignmentLine(line)) {
      for (const name of ordered) {
        if (new RegExp(escape(name), "i").test(line)) chosen.add(name);
      }
    }
  });
  if (!chosen.size) return text;

  return lines
    .map((line, i) => {
      let out = line;
      // A chosen hotel is hidden everywhere it appears, not only in the stay
      // block. It was named again inside a free day ("transfer to X") and
      // rendered there as a plain, readable link, which handed over the
      // answer the overview was carefully withholding.
      for (const name of chosen) {
        out = out.replace(new RegExp(escape(name), "gi"), () => REDACTION(name.length));
      }
      // In the stay block the tag that follows the name goes too, since
      // "(4-star suite hotel on Olaya Street)" narrows it to one property.
      // Elsewhere the surrounding sentence is ordinary prose and stays.
      if (inStay[i]) {
        out = out.replace(/(⟦R:\d+⟧)\s*\(([^)]{0,120})\)/g, (_m, marker: string, inner: string) => `${marker} ${REDACTION(inner.length + 2)}`);
      }
      return out;
    })
    .join("\n");
}

// "Where you'll stay" and its Arabic equivalent, as written by the drafting
// prompt. Matched loosely because the model varies the wording slightly.
function isStayHeading(line: string): boolean {
  return /^where you.{0,3}ll stay$/i.test(line) || /^(مكان|أماكن) الإقامة$/.test(line) || /^أين ستقيم/.test(line);
}

// "Riyadh, Days 1-7: <hotel>" and its Arabic equivalent: a stop, its span of
// days, then the pick. A colon alone isn't enough, since "On the tier:"
// introduces the upgrade paragraph and must not count.
function isStayAssignmentLine(line: string): boolean {
  return line.includes(":") && /\bdays?\b|اليوم|الأيام/i.test(line);
}

// Any of the other overview headings, which mark the end of the stay block.
function isOtherHeading(line: string): boolean {
  return !isStayHeading(line) && /^[A-Za-z؀-ۿ]/.test(line) && line.split(/\s+/).length <= 8;
}

/**
 * Whether a plan should be paywalled at all. Kept in one place so the page,
 * the email and any future surface cannot drift apart on the question.
 */
export function shouldPaywall(proposal: { paid?: boolean | null }): boolean {
  return proposal.paid !== true;
}
