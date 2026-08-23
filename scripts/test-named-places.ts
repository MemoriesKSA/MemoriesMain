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

import { parsePickNames, parseContextPlaceNames, parseAllNamedPlaces, stripNameMarkers } from "../app/journey/plan-stops";
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

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed  ·  ${picks.length} picks, ${context.length} context places`);
if (pass !== cases.length) process.exit(1);
