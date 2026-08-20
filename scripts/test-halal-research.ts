// The research pass gained halal food and prayer as a category, and the
// cheapest honest way to check a research prompt is to run it and read what
// comes back. One city, one call, no draft: a full country draft costs half
// an hour and most of that is the drafting, not the thing under test.
//
//   npx tsx --env-file=.env.local scripts/test-halal-research.ts bangkok
//
// Bangkok by default because it is the case that matters: a city where
// halal is neither the default nor absent, so a useful answer has to name
// districts and places rather than reassure.

import Anthropic from "@anthropic-ai/sdk";
import { researchOperationalFacts } from "../app/draft-guide";
import { flagshipCityGuideBySlug, flagshipCountryForCity } from "../app/flagship-city-data";
import { travelCountries } from "../app/components/planner-data";

const citySlug = process.argv[2] ?? "bangkok";

async function main() {
  const countrySlug = flagshipCountryForCity(citySlug);
  if (!countrySlug) { console.error(`No data for ${citySlug}`); process.exit(1); }
  const guide = flagshipCityGuideBySlug(countrySlug, citySlug)!;
  const country = travelCountries.find((c) => c.value === countrySlug);
  const label = country?.cities.find((c) => c.value === citySlug)?.en ?? citySlug;

  const notes = await researchOperationalFacts(
    new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
    guide,
    {
      submissionId: "halal-check", city: citySlug, countrySlug, countryName: country?.en ?? countrySlug,
      stops: [citySlug], purpose: "leisure", travellers: "couple", travellerCount: "2",
      fromDate: "2026-11-08", toDate: "2026-11-12", transport: ["private-driver"], stays: ["hotel"],
      planIncludes: ["attractions", "restaurants"], currency: "SAR",
      name: "Halal research check", email: "mixedhopes2022@gmail.com", phone: "+966500000000",
    } as Parameters<typeof researchOperationalFacts>[2],
    label,
  );

  console.log(notes || "(the research pass returned nothing)");

  // Drivers are only researched for a city we hold none for, so asserting
  // them everywhere fails on exactly the cities where the pipeline is doing
  // the right thing. Bangkok holds Blacklane, and its notes correctly say
  // nothing about drivers.
  const holdsADriver = !![...(guide.trustedProviders ?? []), ...(guide.extendedProviders ?? [])].length;

  const checks: [string, boolean][] = [
    ["it came back with something", notes.length > 400],
    ["halal is addressed at all", /halal/i.test(notes)],
    ["prayer or a mosque is addressed", /mosque|prayer|musholla|surau/i.test(notes)],
    ["things to do are still covered", /museum|market|park|temple|day trip/i.test(notes)],
    holdsADriver
      ? ["drivers are left to our own data, as they should be", true]
      : ["drivers are researched, since we hold none here", /driver|chauffeur|transfer/i.test(notes)],
  ];
  console.log("\n--- checks ---");
  let pass = 0;
  for (const [name, ok] of checks) { if (ok) pass++; console.log(`${ok ? "PASS" : "FAIL"}  ${name}`); }
  console.log(`\n${pass}/${checks.length} passed  ·  ${notes.length} characters of notes`);
  if (pass !== checks.length) process.exit(1);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
