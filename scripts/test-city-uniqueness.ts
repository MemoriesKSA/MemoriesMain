// The country a published plan belongs to is derived from its city, because
// the proposals table stores a city label and no country. That is only safe
// while no two countries in our data share a city name.
//
// It is not true of the world. There is an Antalya in Turkey and a Tripoli in
// both Libya and Lebanon, and if we ever add both halves of such a pair, a
// Turkish plan would quietly resolve its hotels, its links and its map
// searches against the wrong country. This fails the moment that happens,
// which is the point: the fix is a country column, and this is what tells
// you the day you need one.

import { flagshipCityGuideBySlug, flagshipCityKeys, flagshipCountryForCity } from "../app/flagship-city-data";
import { travelCountries } from "../app/components/planner-data";

const keys = flagshipCityKeys();
const bySlug = new Map<string, string[]>();
for (const { countrySlug, citySlug } of keys) {
  bySlug.set(citySlug, [...(bySlug.get(citySlug) ?? []), countrySlug]);
}
const collisions = [...bySlug.entries()].filter(([, countries]) => countries.length > 1);

// The same risk one level up: two countries offering a city of the same name
// in the planner would break citySlugFromLabel, which searches all of them
// and takes the first hit.
const plannerSlugs = new Map<string, string[]>();
for (const country of travelCountries) {
  for (const city of country.cities) {
    if (city.value.startsWith("other-")) continue;
    plannerSlugs.set(city.value, [...(plannerSlugs.get(city.value) ?? []), country.value]);
  }
}
const plannerCollisions = [...plannerSlugs.entries()].filter(([, c]) => c.length > 1);

// A country we hold any data for is a country we are telling customers we
// can plan. Offering one of its cities in the planner with no data behind it
// doesn't fail loudly: the draft stops and the team gets a "plan this one by
// hand" email, which is a fine fallback for France and a broken promise for
// a country whose other eight cities all work. Countries with no data at all
// are skipped, since every one of their cities is meant to be planned by
// hand.
const supported = new Set(keys.map((k) => k.countrySlug));
const gaps = travelCountries
  .filter((country) => supported.has(country.value))
  .flatMap((country) =>
    country.cities
      .filter((city) => !city.value.startsWith("other-") && !flagshipCityGuideBySlug(country.value, city.value))
      .map((city) => `${country.value}/${city.value}`));

const cases: [string, unknown, unknown][] = [
  ["no city slug is claimed by two countries in the deep data", collisions.length, 0],
  ["no city slug is claimed by two countries in the planner", plannerCollisions.length, 0],
  ["every deep-data city resolves to exactly one country", keys.every((k) => flagshipCountryForCity(k.citySlug) === k.countrySlug), true],
  ["every city we offer in a supported country has data behind it", gaps.length, 0],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
if (collisions.length) console.log("\ndeep-data collisions:", JSON.stringify(collisions));
if (plannerCollisions.length) console.log("\nplanner collisions:", JSON.stringify(plannerCollisions));
if (gaps.length) console.log("\ncities offered with no data behind them:", gaps.join(", "));
console.log(`\n${pass}/${cases.length} passed  ·  ${keys.length} cities with deep data`);
