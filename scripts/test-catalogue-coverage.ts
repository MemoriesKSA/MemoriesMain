// Can a visitor find everything we actually sell?
//
// Two lists decide that, and they are maintained separately. The planner
// decides what you may REQUEST; the destinations catalogue decides what you
// may BROWSE. A country in the first and not the second is one we plan in
// full, take money for, and never show anyone: it exists only if the visitor
// already knows to type it into the form.
//
// A country sits out of the catalogue when it has no hero image and no city
// images, which is a real constraint rather than an oversight. What must not
// happen is that gap going unnoticed, so this reports it in full.

import { plannableCountries, travelCountries, isPlannableCountry } from "../app/components/planner-data";
import { countryGuides, CATALOGUE_PENDING } from "../app/destination-guide-data";
import { existsSync } from "node:fs";

const inCatalogue = new Set(countryGuides.map((c) => c.slug));
const plannable = plannableCountries.map((c) => c.value);

// Every country you can plan, that nobody can browse.
const plannableButHidden = plannable.filter((slug) => !inCatalogue.has(slug));
// Every country in the catalogue you cannot actually plan. Browse-only is a
// deliberate state, so this is context rather than a fault.
const browseOnly = countryGuides.map((c) => c.slug).filter((slug) => !isPlannableCountry(slug));

// City coverage: a planner city that the country page never lists is a city
// somebody can request and never read a word about.
const cityGaps: string[] = [];
let plannerCities = 0;
let cataloguedCities = 0;
for (const country of travelCountries) {
  const guide = countryGuides.find((g) => g.slug === country.value);
  const real = country.cities.filter((c) => !c.value.startsWith("other-"));
  if (isPlannableCountry(country.value)) plannerCities += real.length;
  if (!guide) continue;
  const listed = new Set(guide.cities.map((c) => c.slug));
  cataloguedCities += listed.size;
  for (const city of real) {
    if (!listed.has(city.value)) cityGaps.push(`${country.value}/${city.value}`);
  }
}

// What each hidden country would need before it could be shown.
const missingImages: string[] = [];
for (const slug of plannableButHidden) {
  const country = travelCountries.find((c) => c.value === slug);
  if (!country) continue;
  if (!existsSync(`public/images/countries/${slug}.webp`)) missingImages.push(`countries/${slug}.webp`);
  for (const city of country.cities.filter((c) => !c.value.startsWith("other-"))) {
    if (!existsSync(`public/images/cities/${slug}/${city.value}.webp`)) missingImages.push(`cities/${slug}/${city.value}.webp`);
  }
}

const cases: [string, unknown, unknown][] = [
  // The catalogue must never silently drop a country nobody declared pending.
  ["every hidden country is a declared one", plannableButHidden.every((s) => CATALOGUE_PENDING.has(s)), true],
  ["and every declared one is genuinely absent", [...CATALOGUE_PENDING].every((s) => !inCatalogue.has(s)), true],
  // A catalogued country must list all of its planner cities.
  ["no catalogued country hides one of its cities", cityGaps.length, 0],
  // Browse-only countries are fine; they must simply not be plannable.
  ["browse-only countries are not plannable", browseOnly.every((s) => !isPlannableCountry(s)), true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}

console.log(`\n${pass}/${cases.length} passed`);
console.log(`\nplannable countries: ${plannable.length}  ·  in the catalogue: ${inCatalogue.size}  ·  browse-only: ${browseOnly.length}`);
console.log(`planner cities: ${plannerCities}  ·  catalogued cities: ${cataloguedCities}`);

if (plannableButHidden.length) {
  console.log(`\nSELLABLE BUT UNBROWSABLE (${plannableButHidden.length}):`);
  for (const slug of plannableButHidden) {
    const c = travelCountries.find((x) => x.value === slug);
    const n = c?.cities.filter((x) => !x.value.startsWith("other-")).length ?? 0;
    console.log(`  ${slug.padEnd(14)} ${n} cities a customer can request and cannot read about`);
  }
}
if (cityGaps.length) console.log(`\nCITIES MISSING FROM THEIR COUNTRY PAGE:\n  ${cityGaps.join("\n  ")}`);
if (missingImages.length) {
  console.log(`\nIMAGES NEEDED TO SHOW THEM (${missingImages.length}):`);
  for (const f of missingImages) console.log(`  public/images/${f}`);
}
if (pass !== cases.length) process.exit(1);
