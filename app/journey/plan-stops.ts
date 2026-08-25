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
const SITES_LINE = /^\s*SITES:/i;

/** Hosts that are never an institution's own site. */
const NOT_OFFICIAL = /^https?:\/\/(?:[a-z0-9-]+\.)*(?:wikipedia\.org|wikidata\.org|facebook\.com|linkedin\.com|instagram\.com|x\.com|twitter\.com|youtube\.com|topuniversities\.com|timeshighereducation\.com|shanghairanking\.com|studyportals\.com|hotcoursesabroad\.com)\//i;
export const NAME_MARKER_LINE = /^\s*(PICKS|PLACES|SITES):/i;

const ARABIC_LETTER = /[ء-ي]/;

/**
 * One named thing, in both the languages the plan is written in.
 *
 * The marker lines used to carry the English name alone, which meant the
 * Arabic half of every plan had no links at all: the linkifier was hunting for
 * "Atlantis, The Palm" in a paragraph that says أتلانتس ذا بالم. Worse, the
 * paywall redacts from the same list, so on an unpaid plan the Arabic text
 * still named the hotel the customer had not bought yet.
 *
 * So an entry may now be written "English = العربية". The old bare form still
 * parses, because drafts written before this are cached and must keep working;
 * they simply have no Arabic side, exactly as they do today.
 */
type NamePair = { en: string; ar?: string };

function readMarkerPairs(internalText: string, pattern: RegExp): NamePair[] {
  if (!internalText) return [];
  const line = internalText.split(/\r?\n/).find((l) => pattern.test(l));
  if (!line) return [];
  const out: NamePair[] = [];
  const seen = new Set<string>();
  for (const entry of line.replace(pattern, "").split("|")) {
    const at = entry.indexOf("=");
    const en = (at < 0 ? entry : entry.slice(0, at)).trim();
    const arRaw = at < 0 ? "" : entry.slice(at + 1).trim();
    // Only take the right-hand side when it really is Arabic, so a stray "="
    // inside an English name cannot silently truncate it.
    const ar = ARABIC_LETTER.test(arRaw) ? arRaw : "";
    // "none" is the draft saying the line is empty, not a place called None.
    // Anything very short is punctuation noise rather than a name, and
    // linkifying it would match fragments all over the prose.
    if (en.length <= 3 || en.toLowerCase() === "none") continue;
    if (seen.has(en.toLowerCase())) continue;
    seen.add(en.toLowerCase());
    out.push(ar ? { en, ar } : { en });
  }
  return out;
}

/** Every form of every name, so one list serves both languages at once. */
function flatten(pairs: NamePair[]): string[] {
  const all: string[] = [];
  for (const { en, ar } of pairs) {
    all.push(en);
    if (ar && ar.length > 3) all.push(ar);
  }
  return [...new Set(all)];
}

function readMarkerList(internalText: string, pattern: RegExp): string[] {
  return flatten(readMarkerPairs(internalText, pattern));
}

/** The things the plan recommends. Redacted from an unpaid teaser. */
export function parsePickNames(internalText: string): string[] {
  return readMarkerList(internalText, PICKS_LINE);
}

/** Airports, transit, districts and geography. Readable whether or not they paid. */
export function parseContextPlaceNames(internalText: string): string[] {
  return readMarkerList(internalText, PLACES_LINE);
}

/**
 * Official websites for things the plan names, as `SITES: Name = url | ...`.
 *
 * A map search is the right link for a restaurant, and the wrong one for a
 * university: somebody deciding where to spend three years wants the
 * admissions page, not a pin on a map. The drafting pass supplies the URL
 * because it is the only part of the system that has read the research the
 * URL came from, and it is told to give only URLs that actually appear
 * there rather than construct one that looks right.
 *
 * Anything that is not a plain http(s) URL is dropped. A malformed entry
 * falls back to the map search, which is worse but never wrong.
 */
export function parseSiteLinks(internalText: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!internalText) return out;
  for (const line of internalText.split(/\r?\n/)) {
    if (!SITES_LINE.test(line)) continue;
    const body = line.replace(SITES_LINE, "").trim();
    if (!body || /^none$/i.test(body)) continue;
    for (const entry of body.split("|")) {
      const at = entry.indexOf("=");
      if (at < 0) continue;
      const name = entry.slice(0, at).trim();
      const url = entry.slice(at + 1).trim();
      // A URL copied out of prose often brings the sentence's full stop with
      // it. A trailing-dot hostname is a valid FQDN and mostly works, but it
      // breaks on servers that match the Host header strictly, and it looks
      // like a typo in a plan somebody paid for. Three of 316 researched URLs
      // arrived this way.
      const cleaned = url.replace(/[.,;:!?)\]]+$/, "");
      if (!name || !/^https?:\/\/[^\s]+$/i.test(cleaned)) continue;
      // The point of this line is the institution's own admissions page. An
      // encyclopedia article or a rankings aggregator is not that, and a
      // student tapping "entry requirements" does not expect Wikipedia. Four
      // of 316 came back this way; they fall through to a map search, which is
      // a more honest answer than a link to the wrong kind of page.
      if (NOT_OFFICIAL.test(cleaned)) continue;
      out[name.toLowerCase()] = cleaned;
    }
  }
  return out;
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

/**
 * Arabic name -> English name, for everything the plan named.
 *
 * The SITES line gives a URL once, under the English name. Without this the
 * Arabic plan would fall back to a map search for exactly the things a map
 * search suits worst, which is what that line exists to avoid.
 */
export function parseNameAliases(internalText: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const { en, ar } of [...readMarkerPairs(internalText, PICKS_LINE), ...readMarkerPairs(internalText, PLACES_LINE)]) {
    if (ar && ar.length > 3) out[ar.toLowerCase()] = en.toLowerCase();
  }
  return out;
}
