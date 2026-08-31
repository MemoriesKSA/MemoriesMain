// An unpaid reader must not be handed a single tappable name.
//
// The paywall began by withholding only the recommendations, so a free preview
// still carried working links to the airport, the districts, the metro lines
// and — because the linking list and the hiding list were two different lists
// — the national chains and booking platforms as well. All of it is the same
// researched work, sitting in a plan nobody has bought.
//
// So the invariant this checks is not "these particular names are hidden" but
// the structural one: the set that gets redacted IS the set that gets linked.
// That is the only version of this that cannot drift again.

import { readFileSync } from "node:fs";
import { redactPlaceNames, REDACTION_PATTERN } from "../app/journey/paywall";
import { parseAllNamedPlaces, parsePickNames, parseContextPlaceNames } from "../app/journey/plan-stops";
import { placeNamesForCity, placeMatchPattern } from "../app/journey/place-links";

const notes = [
  "PICKS: Atlantis, The Palm = أتلانتس ذا بالم = hotel | Ravi's = مطعم راوي = restaurant | Sixt = سيكست = car rental",
  "PLACES: Dubai International Airport = مطار دبي الدولي = airport | Palm Jumeirah = نخلة جميرا = district | Deira = ديرة = district",
].join("\n");

const plan = [
  "Fly into Dubai International Airport, roughly 32 km from Palm Jumeirah.",
  "Check in at Atlantis, The Palm, our pick for the five nights.",
  "Collect your Sixt car at the desk in your arrivals terminal.",
  "Dinner at Ravi's in Al Satwa, operating since 1978, about AED 40 a head.",
  "Cross to Deira by abra for the souks, free to enter and mostly outdoors.",
  "Every figure here is an estimate to plan around, not a price anyone agreed.",
].join("\n");

// Exactly what the page builds: our own city data plus the draft's own markers.
const namedInDraft = parseAllNamedPlaces(notes);
const linkable = (city: string, ar: boolean) =>
  [...new Set([...placeNamesForCity(city, ar), ...namedInDraft])].sort((a, b) => b.length - a.length);

const places = linkable("Dubai", false);
const redacted = redactPlaceNames(plan, places);

/** Anything still matchable is something the reader could still tap. */
const stillLinkable = (text: string, names: string[]) => {
  const pattern = placeMatchPattern(names);
  if (!pattern) return [];
  return [...text.matchAll(pattern)].map((m) => m[1]);
};

// A Saudi plan is where the two lists disagreed: these are linked for every
// city in the country, and the old redaction list did not contain them.
const riyadh = linkable("Riyadh", false);
const riyadhAr = linkable("Riyadh", true);
const chainPlan = "Grab lunch at Al Baik near the museum, about SAR 25, and book the Haramain High-Speed Railway ahead.";
const chainRedacted = redactPlaceNames(chainPlan, riyadh);

// Everything above proves the mechanism. This proves the page is wired to it:
// the list handed to the linkifier and the list handed to the redactor have to
// be the same variable, in both languages. Reading the source is crude, but it
// is the check that would have caught the drift, because the drift was two
// call sites being given two different lists.
const page = readFileSync("app/journey/journey-page-content.tsx", "utf8");
const sameList = (lang: "en" | "ar", prop: string) => {
  const redacts = page.match(new RegExp(`redactPlaceNames\\(${lang}\\.visibleText,\\s*([A-Za-z]+)\\)`))?.[1];
  const links = page.match(new RegExp(`<ItineraryView text=\\{${prop}\\} places=\\{([A-Za-z]+)\\}`))?.[1];
  return redacts && links && redacts === links ? redacts : `redacts=${redacts} links=${links}`;
};

const cases: [string, unknown, unknown][] = [
  ["the page redacts the same list it links, in English", sameList("en", "visibleEn"), "placesEn"],
  ["and the same in Arabic", sameList("ar", "visibleAr"), "placesAr"],

  // The list itself has to cover both marker lines, or nothing else matters.
  ["picks and places are both linkable names", namedInDraft.length, parsePickNames(notes).length + parseContextPlaceNames(notes).length],
  ["which includes the context ones", namedInDraft.includes("Dubai International Airport"), true],

  // The point of the change.
  ["no linkable name survives a free preview", stillLinkable(redacted, places).length, 0],
  ["the recommended hotel is gone", redacted.includes("Atlantis, The Palm"), false],
  ["the restaurant is gone", redacted.includes("Ravi's"), false],
  ["the rental company is gone", redacted.includes("Sixt"), false],
  ["the airport is gone too, which it was not before", redacted.includes("Dubai International Airport"), false],
  ["so is the district", redacted.includes("Palm Jumeirah"), false],
  ["and the old quarter", redacted.includes("Deira"), false],
  ["something was actually redacted", REDACTION_PATTERN.test(redacted), true],

  // The gap that only existed because linking and hiding were separate lists.
  ["a national chain is linkable in Saudi", riyadh.includes("Al Baik"), true],
  ["and is therefore hidden when unpaid", chainRedacted.includes("Al Baik"), false],
  ["a booking platform is linkable", riyadh.includes("Haramain High-Speed Railway"), true],
  ["and is therefore hidden too", chainRedacted.includes("Haramain High-Speed Railway"), false],
  ["nothing tappable survives on a Saudi plan", stillLinkable(chainRedacted, riyadh).length, 0],
  ["the Arabic side has names of its own", riyadhAr.some((n) => /[؀-ۿ]/.test(n)), true],

  // What must survive, or the preview stops being worth reading.
  ["the distance survives", redacted.includes("32 km"), true],
  ["the price survives", redacted.includes("AED 40"), true],
  ["the year it opened survives", redacted.includes("since 1978"), true],
  ["the honesty about estimates survives", redacted.includes("not a price anyone agreed"), true],
  ["the practical advice survives", redacted.includes("free to enter and mostly outdoors"), true],
  ["and so does a price beside a hidden name", chainRedacted.includes("SAR 25"), true],

  // A paid reader is untouched: nothing is withheld at all.
  ["a paid plan keeps every name", stillLinkable(plan, places).length > 0, true],
  ["including the airport", plan.includes("Dubai International Airport"), true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed  ·  ${places.length} linkable names in Dubai, ${stillLinkable(redacted, places).length} survived redaction`);
if (pass !== cases.length) process.exit(1);
