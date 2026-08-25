// Until now the customer's page could only link a name that was already in our
// own city data. A Bangkok plan therefore linked the one hotel we happened to
// hold and left everything else as dead text:
//
//   Evening: Jodd Fairs Ratchada (daily evening street-food and stall market)...
//   Arrival at Suvarnabhumi, then into the city by Airport Rail Link...
//   ...clusters around Soi Arab off Sukhumvit (Nana), Pratunam, and Bang Rak
//
// Every one of those is a real place a customer would want to tap, and none of
// them is in the data. The drafting pass now ends each plan with two machine
// lines naming what it referred to, because it is the only thing that knows
// which words in its own prose are places.
//
// They are split by what the paywall should do with them:
//   PICKS  - what we are recommending. Hidden from an unpaid teaser.
//   PLACES - airports, transit, districts, geography. Always readable.
//
// The failure that matters most here is a marker line reaching a customer, so
// that is checked from both directions.

import { parsePickNames, parseContextPlaceNames, parseAllNamedPlaces, stripNameMarkers , parseNameAliases, parseSiteLinks } from "../app/journey/plan-stops";
import { splitDraftForStorage } from "../app/journey/parse-itinerary";

const notes = [
  "For the planner",
  "Hotel pricing was not sourced, so the budget leaves it as the remainder.",
  "STOPS: Bangkok=1, Koh Samui=4",
  "PICKS: Jodd Fairs Ratchada | Nara Thai Cuisine | Kohinoor Indian Restaurant | Koh Samui Taxis | Wat Pho",
  "PLACES: Suvarnabhumi Airport | Airport Rail Link | Sukhumvit | Soi Arab | Bang Rak | Hua Thanon",
].join("\n");

const picks = parsePickNames(notes);
const context = parseContextPlaceNames(notes);
const all = parseAllNamedPlaces(notes);

// A draft that puts a marker in the customer half must not print it.
const leaky = [
  "Bangkok and Koh Samui, 24-29 August 2026",
  "Six days, five nights.",
  "",
  "Day 1 - Monday 24 August, Bangkok",
  "Evening: Jodd Fairs Ratchada, open 17:00-01:00.",
  "PICKS: Jodd Fairs Ratchada | Nara Thai Cuisine",
  "PLACES: Suvarnabhumi Airport | Soi Arab",
  "STOPS: Bangkok=1",
].join("\n");
const split = splitDraftForStorage(leaky);

const cases: [string, unknown, unknown][] = [
  ["the recommendations are read back", picks.length, 5],
  ["including a researched restaurant we never held", picks.includes("Jodd Fairs Ratchada"), true],
  ["and a transfer company", picks.includes("Koh Samui Taxis"), true],

  ["the context places are read back", context.length, 6],
  ["including the airport", context.includes("Suvarnabhumi Airport"), true],
  ["a transit line", context.includes("Airport Rail Link"), true],
  ["and a district", context.includes("Soi Arab"), true],

  ["a district is NOT treated as a recommendation", picks.includes("Soi Arab"), false],
  ["a restaurant is NOT treated as context", context.includes("Jodd Fairs Ratchada"), false],

  ["everything linkable is both lists together", all.length, 11],
  ["longest first, so a name inside another matches whole", all[0].length >= all[all.length - 1].length, true],

  // "none" is the draft saying a line is empty, not a place called None.
  ["an empty line yields nothing", parsePickNames("PICKS: none").length, 0],
  ["a missing line yields nothing", parsePickNames("For the planner\nnothing here").length, 0],
  ["no notes at all is safe", parseAllNamedPlaces("").length, 0],

  // The failure that would be visible to a customer.
  ["a marker in the customer half is stripped", /PICKS:|PLACES:|STOPS:/.test(split.customerFacing), false],
  ["and the plan around it survives", split.customerFacing.includes("Jodd Fairs Ratchada, open 17:00-01:00."), true],
  ["stripNameMarkers removes both kinds", /PICKS:|PLACES:/.test(stripNameMarkers(notes)), false],
  ["but leaves the real note behind", stripNameMarkers(notes).includes("Hotel pricing was not sourced"), true],
];

// The Arabic half of every plan came out with no links at all.
//
// The marker lines carried the English name alone, so the linkifier hunted for
// "Atlantis, The Palm" in a paragraph that says أتلانتس ذا بالم and found
// nothing, on every plan we have ever sent. The same list drives the paywall,
// so an unpaid Arabic plan also still named the hotel the customer had not
// bought. An entry may now carry both, "English = العربية".
const bilingual = [
  "PICKS: Atlantis, The Palm = أتلانتس ذا بالم | Orfali Bros Bistro = أورفلي بروس بيسترو",
  "PLACES: Palm Jumeirah = نخلة جميرا | Dubai Creek = خور دبي",
  "SITES: Dubai Taxi Company = https://www.dubaitaxi.ae",
  "PICKS: Dubai Taxi Company = شركة تاكسي دبي",
].join("\n");
// Only the first PICKS line is read, so the alias for the taxi company comes
// from a note written the way a real draft writes one.
const realNotes = [
  "PICKS: Atlantis, The Palm = أتلانتس ذا بالم | Dubai Taxi Company = شركة تاكسي دبي",
  "PLACES: Palm Jumeirah = نخلة جميرا",
  "SITES: Dubai Taxi Company = https://www.dubaitaxi.ae",
].join("\n");
const bothPicks = parsePickNames(realNotes);
const aliases = parseNameAliases(realNotes);
const siteUrls = parseSiteLinks(realNotes);

// Drafts written before this are cached and must keep working exactly as they do.
const legacy = parsePickNames("PICKS: Nara Thai Cuisine | Wat Pho");

const bilingualCases: [string, unknown, unknown][] = [
  ["the English name still parses", bothPicks.includes("Atlantis, The Palm"), true],
  ["and the Arabic one comes with it", bothPicks.includes("أتلانتس ذا بالم"), true],
  ["both names of both things are present", bothPicks.length, 4],
  ["context places are bilingual too", parseContextPlaceNames(realNotes).includes("نخلة جميرا"), true],
  ["everything lands in the combined list", parseAllNamedPlaces(realNotes).includes("شركة تاكسي دبي"), true],

  // Without the alias the Arabic plan falls back to a map search for an app.
  ["the Arabic name maps to the English one", aliases["شركة تاكسي دبي"], "dubai taxi company"],
  ["so the URL given once reaches both", siteUrls[aliases["شركة تاكسي دبي"]], "https://www.dubaitaxi.ae"],
  ["a place with no Arabic side has no alias", aliases["palm jumeirah"], undefined],

  // Old cached drafts.
  ["a bare English entry still parses", legacy.includes("Nara Thai Cuisine"), true],
  ["and yields exactly one name, not two", legacy.length, 2],

  // An "=" that is not a translation must not truncate the name.
  ["a non-Arabic right-hand side is ignored", parsePickNames("PICKS: Cafe = Bar").includes("Cafe"), true],
  ["and does not become a second name", parsePickNames("PICKS: Cafe = Bar").length, 1],
  ["a two-language entry is still one thing to the paywall", new Set(bothPicks).size, 4],
  ["\"none\" survives the new parser", parsePickNames("PICKS: none").length, 0],
  ["and so does an empty note", parseNameAliases("").hasOwnProperty("x"), false],
];
cases.push(...bilingualCases);

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed  ·  ${picks.length} picks, ${context.length} context places`);
if (pass !== cases.length) process.exit(1);
