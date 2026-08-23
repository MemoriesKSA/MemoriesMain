// Nothing on a study page was clickable.
//
// A trip plan turns every named thing into a map link: 33 of them on a live
// Bangkok page. The same live Manchester page had zero. A student reading
// about Fallowfield, Rusholme and the University of Manchester - the one
// audience that most wants to see where things actually are, because they
// are deciding where to live for three years - got flat text.
//
// The rendering side was never the problem. It reads PICKS/PLACES out of the
// internal notes and links whatever it finds, with no dependence on our
// curated city data. The trip brief tells the model to write those lines.
// The study brief never did, so there was nothing to read.
//
// Same shape as the day-heading bug: a feature built on the tourism path
// that the study path silently never inherited.

import { buildStudySystemPrompt } from "../app/draft-guide";
import { parseAllNamedPlaces, parsePickNames, parseContextPlaceNames, stripNameMarkers } from "../app/journey/plan-stops";
import { mapsSearchUrl } from "../app/journey/place-links";

const study = buildStudySystemPrompt();

// A study plan's internal notes, in the shape the brief now asks for.
const notes = [
  "For the planner",
  "Fees were taken from the 2026-entry page and may move.",
  "PICKS: University of Manchester | Manchester Metropolitan University | Manchester Central Mosque",
  "PLACES: Manchester Airport | Oxford Road | Fallowfield | Rusholme",
].join("\n");

const picks = parsePickNames(notes);
const context = parseContextPlaceNames(notes);
const all = parseAllNamedPlaces(notes);
const url = mapsSearchUrl("University of Manchester", "Manchester");

const cases: [string, unknown, unknown][] = [
  // The brief must ask for them, which is the whole fix.
  ["the study brief asks for the recommendation line", /PICKS:/.test(study), true],
  ["and the context line", /PLACES:/.test(study), true],
  ["it says why, so the rule survives an edit", /map link/.test(study), true],
  ["universities count as recommendations", /universities, colleges/.test(study), true],
  ["so do mosques and halal grocers", /mosques and prayer facilities/.test(study), true],
  ["neighbourhoods are context, not recommendations", /districts, neighbourhoods/.test(study), true],
  ["and the study city itself is never listed", /Never the study city itself/.test(study), true],

  // The existing reader handles them with no study-specific work.
  ["the recommendations parse", picks.length, 3],
  ["a named university among them", picks.includes("University of Manchester"), true],
  ["the context places parse", context.length, 4],
  ["a neighbourhood among them", context.includes("Fallowfield"), true],
  ["both feed the linkifier together", all.length, 7],

  // A study city has no curated data, so every link is the Maps fallback.
  ["an uncurated name still gets a map link", url.startsWith("https://www.google.com/maps/search/"), true],
  ["scoped to the city, so it finds the right one", decodeURIComponent(url).includes("University of Manchester, Manchester"), true],

  // And the markers must never reach the customer.
  ["the marker lines are stripped from what is shown", stripNameMarkers(notes).includes("PICKS:"), false],
  ["while the planner's own note survives", stripNameMarkers(notes).includes("Fees were taken"), true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed  ·  ${all.length} names would become links`);
if (pass !== cases.length) process.exit(1);
