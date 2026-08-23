// "Warm" used to mean the right scope version and a recent enough date. That
// quietly answers a different question than the one anybody cares about,
// which is whether the research is actually finished.
//
// A city researched inside a customer's request only gets the categories that
// fit RESEARCH_DEADLINE_MS. Antalya came back holding two of its seven - no
// drivers, no halal or prayer, no opening hours, no rental cars, no flights -
// and then read as "fresh" to both the pre-warm and the cron. Nothing would
// ever have filled the other five. Every later Antalya customer would have
// received the thin plan and handed their reviewer the same four things to
// check by hand, forever, with no signal anywhere that anything was missing.
//
// Resuming is cheap, so the fix is only about noticing.

import { researchIsComplete, missingCategories, categoriesFor } from "../app/draft-guide";
import { flagshipCityGuideBySlug, flagshipCountryForCity } from "../app/flagship-city-data";

function guideFor(citySlug: string) {
  const country = flagshipCountryForCity(citySlug);
  const guide = country ? flagshipCityGuideBySlug(country, citySlug) : undefined;
  if (!guide) throw new Error(`no guide for ${citySlug}`);
  return guide;
}

const antalya = guideFor("antalya");
const expected = categoriesFor(antalya).map((c) => c.key);

// The shape a partial in-request run leaves behind: the marker lines are what
// categoriesPresent reads.
const partial = "##cat:dining\nRestaurants:\n...\n##cat:sights\nMore to do:\n...";
const full = expected.map((k) => `##cat:${k}\nsomething\n`).join("");

const cases: [string, unknown, unknown][] = [
  ["a city needs more than two categories", expected.length > 2, true],
  ["notes holding every category are complete", researchIsComplete(antalya, full), true],
  ["and report nothing missing", missingCategories(antalya, full).length, 0],

  // The exact case that slipped through.
  ["the two-category Antalya shape is NOT complete", researchIsComplete(antalya, partial), false],
  ["and names what is missing", missingCategories(antalya, partial).length, expected.length - 2],
  ["specifically the halal category", missingCategories(antalya, partial).includes("halal"), true],
  ["and flights", missingCategories(antalya, partial).includes("flights"), true],

  ["empty notes are not complete", researchIsComplete(antalya, ""), false],
  ["and report every category missing", missingCategories(antalya, "").length, expected.length],

  // A city whose own data already covers a category doesn't need it researched,
  // so completeness is measured against what THIS city needs, not a fixed list.
  ["completeness is judged per city, not against a fixed list",
    categoriesFor(guideFor("istanbul")).length !== categoriesFor(guideFor("cappadocia")).length, true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed  ·  Antalya needs ${expected.length} categories: ${expected.join(", ")}`);
if (pass !== cases.length) process.exit(1);
