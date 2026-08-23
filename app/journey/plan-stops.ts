// A trip can visit up to three cities (see docs/paid-plans-spec.md). The
// drafting pass ends a multi-stop plan with one machine-readable line:
//
//   STOPS: Riyadh=1, Jeddah=5
//
// naming the day each stop begins on. That is what lets the customer's page
// show the first day of every stop for free without having to guess where
// one city ends and the next starts.
//
// The line is written into the internal half of the draft, so it is already
// stripped from anything the customer sees by splitDraftForStorage. These
// helpers exist to read it and to belt-and-brace remove it.

export type PlanStop = { label: string; firstDay: number };

const STOPS_LINE = /^\s*STOPS:/i;

/**
 * Reads the stop markers out of the internal notes.
 *
 * Returning null is a safe outcome rather than a failure: the caller then
 * treats the plan as a single stop and shows only day one for free, which
 * errs toward showing less rather than accidentally giving away paid days.
 */
export function parseStopMarkers(internalText: string): PlanStop[] | null {
  if (!internalText) return null;
  const line = internalText.split(/\r?\n/).find((l) => STOPS_LINE.test(l));
  if (!line) return null;

  const stops = line
    .replace(STOPS_LINE, "")
    .split(",")
    .map((part) => {
      const [label, day] = part.split("=");
      const firstDay = Number(String(day ?? "").trim());
      if (!label?.trim() || !Number.isFinite(firstDay) || firstDay < 1) return null;
      return { label: label.trim(), firstDay };
    })
    .filter((stop): stop is PlanStop => stop !== null);

  return stops.length ? stops.sort((a, b) => a.firstDay - b.firstDay) : null;
}

/** The marker is tooling, not prose, so it never belongs in what a human reads. */
export function stripStopMarkers(text: string): string {
  if (!text) return text;
  return text
    .split(/\r?\n/)
    .filter((line) => !STOPS_LINE.test(line))
    .join("\n")
    .trim();
}

/**
 * Which day numbers are free to read before paying: the first day of every
 * stop. With no markers this is just day one.
 *
 * `totalDays` closes a hole that opened when pricing moved to per night. A
 * one-night trip is two days long, so handing over day one hands over most
 * of the product for nothing. Under three days nothing is free but the
 * overview, which still carries the hotel and driver picks and the reasoning
 * behind them, so the proof of real work survives while the plan itself does
 * not. Called without it, the old behaviour is unchanged.
 */
export function freeDayNumbers(stops: PlanStop[] | null, totalDays?: number): number[] {
  if (typeof totalDays === "number" && totalDays > 0 && totalDays < 3) return [];
  if (!stops?.length) return [1];
  return [...new Set(stops.map((s) => s.firstDay))].sort((a, b) => a - b);
}

/**
 * Builds the stop mapping from the per-stop night counts the customer chose
 * in the planner, rather than reading it back out of the model's output.
 *
 * Day 1 is the arrival day, and a stop's nights are the nights slept there,
 * so a stop begins on day `1 + (every night before it)`. Two nights in
 * Riyadh then three in Jeddah gives Riyadh=1, Jeddah=3, which lines up with
 * the trip being `nights + 1` days long.
 *
 * This exists because the STOPS line used to be the only source of that
 * mapping, and it was written by the model. When it came back missing or
 * malformed the customer's page fell back to treating firstDay as 0, and a
 * paying multi-stop customer saw no free day at all. Anything we can know
 * from the form should not be recovered from generated text.
 *
 * Returns null when the counts don't describe a real multi-stop trip, so the
 * caller can fall back to reading the model's line instead.
 */
export function stopsFromNights(labels: string[], nights: number[]): PlanStop[] | null {
  if (labels.length < 2 || nights.length !== labels.length) return null;
  if (!nights.every((n) => Number.isInteger(n) && n >= 1)) return null;

  let day = 1;
  return labels.map((label, i) => {
    const stop = { label, firstDay: day };
    day += nights[i];
    return stop;
  });
}

// Two more machine lines the drafting pass writes beside STOPS, listing every
// real named thing in the plan so the page can turn each into a map link:
//
//   PICKS:  Jodd Fairs Ratchada | Nara Thai Cuisine | Koh Samui Taxis
//   PLACES: Suvarnabhumi Airport | Airport Rail Link | Soi Arab | Bang Rak
//
// Before these, only names already in our own city data could be linked, so a
// Bangkok plan linked the one hotel we happened to hold and left the airport,
// the rail link, the districts and every researched restaurant as dead text.
// The draft knows which words in it are places; these lines are how it says so.
//
// They are split because the paywall treats them differently. PICKS are the
// answers being sold and are redacted from an unpaid teaser; PLACES are the
// context a reader needs either way and stay readable.
//
// Pipe separated, because place names contain commas ("Hua Thanon, Samui").
const PICKS_LINE = /^\s*PICKS:/i;
const PLACES_LINE = /^\s*PLACES:/i;
export const NAME_MARKER_LINE = /^\s*(PICKS|PLACES):/i;

function readMarkerList(internalText: string, pattern: RegExp): string[] {
  if (!internalText) return [];
  const line = internalText.split(/\r?\n/).find((l) => pattern.test(l));
  if (!line) return [];
  return [...new Set(
    line
      .replace(pattern, "")
      .split("|")
      .map((part) => part.trim())
      // "none" is the draft saying the line is empty, not a place called None.
      // Anything very short is punctuation noise rather than a name, and
      // linkifying it would match fragments all over the prose.
      .filter((name) => name.length > 3 && name.toLowerCase() !== "none"),
  )];
}

/** The things the plan recommends. Redacted from an unpaid teaser. */
export function parsePickNames(internalText: string): string[] {
  return readMarkerList(internalText, PICKS_LINE);
}

/** Airports, transit, districts and geography. Readable whether or not they paid. */
export function parseContextPlaceNames(internalText: string): string[] {
  return readMarkerList(internalText, PLACES_LINE);
}

/** Both, longest first, for linkifying. */
export function parseAllNamedPlaces(internalText: string): string[] {
  const all = [...parsePickNames(internalText), ...parseContextPlaceNames(internalText)];
  return [...new Set(all)].sort((a, b) => b.length - a.length);
}

/** Tooling, not prose: never shown to a human. */
export function stripNameMarkers(text: string): string {
  if (!text) return text;
  return text
    .split(/\r?\n/)
    .filter((line) => !NAME_MARKER_LINE.test(line))
    .join("\n")
    .trim();
}
