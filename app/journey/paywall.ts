import { placeMatchPattern } from "./place-links";

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
/**
 * Pill widths, which say nothing about the name underneath.
 *
 * The hidden text never reaches the browser, but the pill drawn in its place
 * used to be exactly as long as the name it covered - and we publish a free
 * page per city listing the names we recommend. So a reader could measure a
 * pill, look down our own list, and keep the candidates of that exact length.
 * On one unpaid plan that pinned 2 of 47 pills to a single name and narrowed
 * 14 more to four or fewer, without a hidden character ever being sent.
 *
 * Bucketing the widths was the first fix and it was not enough: the widest
 * bucket held one name, so scarcity identified it just as well as precision
 * had. So the width is now taken from the pill's position in the text and not
 * from the name at all. It is a cycle, so the blurred lines still vary the way
 * prose does, and it carries exactly zero bits about what is underneath.
 *
 * It also breaks the weaker correlation that bucketing left behind: two pills
 * of the same width no longer suggest the same name, and one name gets
 * different widths in different sentences.
 */
const PILL_WIDTHS = [12, 19, 27, 34];
export const pillWidth = (occurrence: number) => PILL_WIDTHS[occurrence % PILL_WIDTHS.length];

const REDACTION = (occurrence: number) => `⟦R:${pillWidth(occurrence)}⟧`;
export const REDACTION_PATTERN = /⟦R:(\d+)⟧/g;

/**
 * A name we hide but must never link.
 *
 * An object rather than a string, deliberately. These are short forms carved
 * out of a longer name - "Ritz-Carlton" out of "The Ritz-Carlton, Kuala
 * Lumpur" - and they exist only so the redactor can find them in prose. Giving
 * one to the linkifier would send a paying customer to a personalised map
 * guess for a fragment of a name, which is the exact failure the kind field was
 * added to kill. As a bare string it would flow into the places list unnoticed,
 * because that list is also strings; as { hiddenOnly } the compiler refuses.
 */
export type HiddenName = { hiddenOnly: string };

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
export function redactPlaceNames(text: string, placeNames: string[], alsoHide: readonly HiddenName[] = []): string {
  if (!text) return text;

  // Longest first, so a name containing another is matched whole - and so a
  // full name always beats the short form carved out of it. The marker left
  // behind holds no letters, so a short form can never then re-match inside a
  // span the full name has already replaced.
  const ordered = [...placeNames, ...alsoHide.map((h) => h.hiddenOnly)].filter(Boolean).sort((a, b) => b.length - a.length);
  // Checked after the merge, not before: guarding on placeNames alone made a
  // variants-only call silently do nothing.
  if (!ordered.length) return text;

  let out = text;
  // Counts every pill placed, so each takes the next width in the cycle
  // rather than one derived from the name it covers.
  let placed = 0;
  for (const name of ordered) {
    // Word-bounded, using the same rule as the linkifier so the two can never
    // disagree about where a name begins. Unbounded, this blanked letters out
    // of innocent words: "National" matched inside "inter[national]", and the
    // Arabic "ديرة" inside "ج[ديرة]". A stray link is embarrassing; a redaction
    // eating half a real word corrupts the plan somebody is deciding whether
    // to buy.
    const pattern = placeMatchPattern([name]);
    if (!pattern) continue;
    out = out.replace(pattern, () => REDACTION(placed++));
  }
  // The tag right after a name goes too: "(4-star suite hotel on Olaya
  // Street)" narrows it to one property as surely as the name does. A
  // parenthetical carrying a figure is left alone, since the prices are the
  // part worth showing.
  return out.replace(/(⟦R:\d+⟧)\s*\(([^)]{0,120})\)/g, (whole, marker: string, inner: string) =>
    CARRIES_A_FIGURE.test(inner) ? whole : `${marker} ${REDACTION(placed++)}`,
  );
}

// Old name, kept so the reviewer tooling and existing tests keep compiling.
export const redactStayNames = redactPlaceNames;

/**
 * Blunts the phrases that identify a hidden name to a search engine.
 *
 * Hiding the name is not the same as hiding the answer. Beside one blurred
 * hotel the preview still read "a member of Small Luxury Hotels of the World,
 * listed as a 5.0-star property, with a spa, gym and a children's club, 9.1
 * from 1,588 reviews". Pasted into a search engine that comes back with the
 * property, first result. The blur made no difference at all.
 *
 * Two things do that work, and only two. A named collection or award is a
 * membership list somebody can just read. An exact review count is close to a
 * unique key: thousands of properties are rated 9.1, and one of them has
 * exactly 1,588 reviews.
 *
 * So those two are generalised and nothing else is. The prices stay, the
 * distances stay, the star rating stays, the halal and prayer guidance stays,
 * every reason stays. Nobody finds a hotel by searching "32 km from the
 * airport", and the figures are the part that proves the work is real.
 *
 * The replacement has to be generic AND true. The first attempt, "a global
 * luxury collection", is itself a Marriott brand: searching the generalised
 * sentence came back with a Luxury Collection resort, which was the wrong
 * hotel, so nothing leaked - but it implied a membership the property does not
 * have, and this file does not trade one accuracy problem for another.
 * * Everything here stays true: "more than 1,500" of 1,588 is not a rounder lie,
 * it is a rounder truth. The paid plan is untouched.
 */
const COLLECTIONS = [
  // Hotel collections and awards: each is a published list to look down.
  [/\b(?:a\s+)?member\s+of\s+Small\s+Luxury\s+Hotels(?:\s+of\s+the\s+World)?\b/gi, "a member of a recognised international hotel association"],
  [/\bSmall\s+Luxury\s+Hotels(?:\s+of\s+the\s+World)?\b/gi, "a recognised international hotel association"],
  [/\b(?:The\s+)?Leading\s+Hotels\s+of\s+the\s+World\b/gi, "a recognised international hotel association"],
  [/\bRelais\s*&?\s*Ch[aâ]teaux\b/gi, "a recognised international hotel association"],
  [/\bPreferred\s+Hotels(?:\s*&?\s*Resorts)?\b/gi, "a recognised international hotel association"],
  [/\bDesign\s+Hotels\b/gi, "a recognised international design-hotel association"],
  [/\bAutograph\s+Collection\b/gi, "a recognised international hotel association"],
  [/\bForbes\s+(?:Travel\s+Guide\s+)?Five[- ]Star\b/gi, "a top international rating"],
  [/\bAAA\s+(?:Five|Four)[- ]Diamond\b/gi, "a top international rating"],
  // A Michelin count is a short public list in any one city.
  [/\b(?:one|two|three|1|2|3)\s+Michelin\s+stars?\b/gi, "a Michelin distinction"],
  [/\bMichelin[- ]starred\b/gi, "Michelin-recognised"],
  // Arabic forms of the same.
  [/عضو\s+في\s+(?:مجموعة\s+)?Small\s+Luxury\s+Hotels(?:\s+of\s+the\s+World)?/g, "عضو في رابطة فنادق عالمية معروفة"],
  [/نجمتَ?ي\s+ميشلان|نجمة\s+ميشلان|ثلاث\s+نجوم\s+ميشلان/g, "تقدير من ميشلان"],
] as const;

/** "1,588 reviews" -> "more than 1,500 reviews", in either language. */
const REVIEW_COUNT = /(\d[\d,،]{2,})(\s*)(reviews?|verified\s+reviews?|traveller\s+reviews?|مراجعة|مراجعات|تقييم|تقييمات|مقيّم|زائر)/gi;

function roundDown(raw: string): number | null {
  const value = Number(raw.replace(/[,،\s]/g, ""));
  if (!Number.isFinite(value) || value < 100) return null;
  const step = value >= 1000 ? 500 : 100;
  const floored = Math.floor(value / step) * step;
  return floored > 0 && floored < value ? floored : null;
}

export function generaliseSearchKeys(text: string): string {
  if (!text) return text;
  let out = text;
  for (const [pattern, replacement] of COLLECTIONS) out = out.replace(pattern, replacement);

  return out.replace(REVIEW_COUNT, (whole, digits: string, gap: string, word: string) => {
    const floored = roundDown(digits);
    if (floored === null) return whole;
    const arabic = /[؀-ۿ]/.test(word);
    const shown = floored.toLocaleString("en-US");
    return arabic ? `أكثر من ${shown}${gap}${word}` : `more than ${shown}${gap}${word}`;
  });
}

// A parenthetical that quotes money or a rate, which stays readable.
const CARRIES_A_FIGURE = /SAR|USD|ريال|دولار|\d[\d,.]*\s*(a night|per night|لليلة)/i;

/**
 * Whether a plan should be paywalled at all. Kept in one place so the page,
 * the email and any future surface cannot drift apart on the question.
 */
export function shouldPaywall(proposal: { paid?: boolean | null }): boolean {
  return proposal.paid !== true;
}
