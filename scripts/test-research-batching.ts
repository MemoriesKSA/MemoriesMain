// Research is now one call per category rather than one per city, and the
// stored notes carry a marker per category so a re-run can fill only the
// gaps. Two things have to hold for that to be safe:
//
//   the markers must be readable, or a failed city gets re-bought in full
//   the markers must never reach the drafting pass, or they end up in a plan
//
// Cappadocia failed three times and kept nothing, at about $20. This is the
// logic that stops that repeating.
//
//   npx tsx scripts/test-research-batching.ts

import { categoriesPresent, stripCategoryMarkers } from "../app/draft-guide";

const twoCategories = [
  "##cat:halal",
  "Halal food and prayer:",
  "Halal is the default in Istanbul.",
  "",
  "##cat:drivers",
  "Private drivers:",
  "Cab Istanbul - airport transfers, states it is TURSAB registered.",
].join("\n");

const legacy = "Restaurants:\n- somewhere real\nRental cars:\n- Sixt";

const cases: [string, unknown, unknown][] = [
  ["both categories are seen", [...categoriesPresent(twoCategories)].sort().join(","), "drivers,halal"],
  ["a category present is not re-bought", categoriesPresent(twoCategories).has("halal"), true],
  ["a category absent is still to do", categoriesPresent(twoCategories).has("rentals"), false],

  // Notes written before batching have no markers at all. They must read as
  // "nothing done yet" rather than as complete, or a city stays half-researched
  // forever.
  ["notes from before batching claim no categories", categoriesPresent(legacy).size, 0],
  ["and survive stripping untouched", stripCategoryMarkers(legacy), legacy],

  // The drafting pass must never see a marker.
  ["markers are stripped", stripCategoryMarkers(twoCategories).includes("##cat:"), false],
  ["the findings survive", stripCategoryMarkers(twoCategories).includes("Cab Istanbul"), true],
  ["so do the headers a planner reads", stripCategoryMarkers(twoCategories).includes("Halal food and prayer:"), true],
  ["stripping does not leave a run of blank lines", /\n{3,}/.test(stripCategoryMarkers(twoCategories)), false],

  ["empty notes are safe", categoriesPresent("").size, 0],
  ["empty notes strip to empty", stripCategoryMarkers(""), ""],

  // A marker only counts at the start of a line. A findings line mentioning
  // one is a restaurant called something odd, not a category.
  ["a marker mid-line is not a category", categoriesPresent("Restaurants:\n- a bar called ##cat:halal").size, 0],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);
