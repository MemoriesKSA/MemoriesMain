// Every city we offer has to hold enough hand-written data to build a plan on.
//
// Most gaps are self-healing: thin dining triggers the dining research
// category, no driver triggers the drivers category, and so on. Those are
// meant to be thin and cost nothing to leave alone.
//
// Hotels are the exception, and it is easy to miss. There is no "stays"
// research category, so nothing ever fills them: a city added with one hotel
// has one hotel forever, however warm it gets. The draft can still name
// somewhere to sleep, but it cannot offer the tier choice the accuracy rules
// assume, so a budget-conscious customer is shown one luxury property and no
// alternative.
//
// Three Georgian cities are already in that state. They are listed rather than
// silently allowed, so they stay visible until somebody adds a second property
// and so a NEW city cannot be added below the bar without this failing.

import { flagshipCityKeys, flagshipCityGuideBySlug } from "../app/flagship-city-data";

// A plan needs somewhere to sleep plus one alternative, and enough to fill a
// day list. Both are floors, not targets.
const MIN_STAYS = 2;
const MIN_ATTRACTIONS = 3;

// Known, accepted gaps. Shrink this list, never grow it: adding a city here
// instead of adding it a hotel is how the bar quietly stops meaning anything.
const KNOWN_SINGLE_HOTEL = new Set(["kazbegi", "kutaisi", "mtskheta"]);

const missingGuide: string[] = [];
const tooFewStays: string[] = [];
const tooFewAttractions: string[] = [];
const fixedSinceListed: string[] = [];

for (const { countrySlug, citySlug } of flagshipCityKeys()) {
  const g = flagshipCityGuideBySlug(countrySlug, citySlug);
  if (!g) { missingGuide.push(`${countrySlug}/${citySlug}`); continue; }

  const stays = [...g.stay, ...(g.extendedStay ?? [])];
  if (stays.length < MIN_STAYS) {
    if (!KNOWN_SINGLE_HOTEL.has(citySlug)) tooFewStays.push(`${countrySlug}/${citySlug} (${stays.length})`);
  } else if (KNOWN_SINGLE_HOTEL.has(citySlug)) {
    fixedSinceListed.push(`${countrySlug}/${citySlug}`);
  }

  if (g.attractions.length < MIN_ATTRACTIONS) {
    tooFewAttractions.push(`${countrySlug}/${citySlug} (${g.attractions.length})`);
  }
}

const cases: [string, unknown, unknown][] = [
  ["every offered city has a guide", missingGuide.length, 0],
  [`every city can name ${MIN_STAYS} places to stay, or is a known exception`, tooFewStays.length, 0],
  [`every city has at least ${MIN_ATTRACTIONS} attractions to build days from`, tooFewAttractions.length, 0],
  ["no city is still listed as a known gap after being fixed", fixedSinceListed.length, 0],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
if (missingGuide.length) console.log("\nno guide:", missingGuide.join(", "));
if (tooFewStays.length) console.log("\nfewer than " + MIN_STAYS + " places to stay:", tooFewStays.join(", "));
if (tooFewAttractions.length) console.log("\nfewer than " + MIN_ATTRACTIONS + " attractions:", tooFewAttractions.join(", "));
if (fixedSinceListed.length) console.log("\nremove from KNOWN_SINGLE_HOTEL, these now have a choice:", fixedSinceListed.join(", "));

console.log(`\n${pass}/${cases.length} passed  ·  ${KNOWN_SINGLE_HOTEL.size} cities still hold a single hotel: ${[...KNOWN_SINGLE_HOTEL].join(", ")}`);
if (pass !== cases.length) process.exit(1);
