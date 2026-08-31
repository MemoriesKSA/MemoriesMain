// Every country we sell must let a customer add a second destination.
//
// This has been wrong twice, both times silently. First it was hardcoded to
// Saudi Arabia and stayed that way through five country launches, so a Türkiye
// customer could not build Istanbul and Cappadocia. Then it was the set of
// countries we hold curated city guides for, which left the UAE, Indonesia and
// the Philippines out: no second stop for Dubai and Abu Dhabi, none for Bali
// and Jakarta, and no plan fee shown at all, because the price is drawn in the
// same block as the button.
//
// Neither was detectable from the form. Both are detectable here.
//
// The rule the pipeline uses is canGroundAPlan: a plannable country can be
// planned with or without curated data, because the research is warmed for it.
// The form must not be stricter than the thing that does the work, so this
// checks the two against each other rather than checking the form alone.

import { multiStopAvailableFor, plannableCountries, studyCountries, saudiArabia, deepDataCountries } from "../app/components/planner-data";
import { canGroundAPlan } from "../app/draft-guide";

/** Countries the form offers but will not let you add a stop in. */
const refused = plannableCountries.filter((c) => !multiStopAvailableFor("journey", c.value));

/** Countries whose cities the pipeline would refuse to plan at all. */
const ungroundable = plannableCountries.filter((country) => {
  const real = country.cities.find((c) => !c.value.startsWith("other-"));
  return !real || !canGroundAPlan(country.value, real.value, false, false);
});

// The three that were silently excluded, named so a regression says which.
const wasBroken = ["uae", "indonesia", "philippines"];

const cases: [string, unknown, unknown][] = [
  ["every country we sell offers a second destination", refused.map((c) => c.value).join(", "), ""],
  ["all nine of them", plannableCountries.filter((c) => multiStopAvailableFor("journey", c.value)).length, plannableCountries.length],

  // The specific regression.
  ["the UAE can add a stop", multiStopAvailableFor("journey", "uae"), true],
  ["Indonesia can", multiStopAvailableFor("journey", "indonesia"), true],
  ["the Philippines can", multiStopAvailableFor("journey", "philippines"), true],
  ["and none of the three has curated data, which is the point", wasBroken.every((slug) => !deepDataCountries.has(slug)), true],

  // The form must not be stricter than the pipeline.
  ["the pipeline can ground a plan in every country we sell", ungroundable.map((c) => c.value).join(", "), ""],
  ["so no country is offered a trip the form then refuses to build", plannableCountries.every((c) => multiStopAvailableFor("journey", c.value)), true],

  // The Saudi path is its own country list and keeps multi-stop.
  ["the Saudi path still offers it", multiStopAvailableFor("saudi", saudiArabia.value), true],
  ["and offers it for nothing else", multiStopAvailableFor("saudi", "turkey"), false],

  // Study is deliberately one city: a student lives somewhere.
  ["study never offers a second destination", studyCountries.every((c) => !multiStopAvailableFor("study", c.value)), true],

  // A country nobody sells is not quietly accepted.
  ["an unknown country is refused", multiStopAvailableFor("journey", "atlantis"), false],
  ["and so is an empty one", multiStopAvailableFor("journey", ""), false],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed  ·  ${plannableCountries.length} countries sold, ${deepDataCountries.size} with curated guides`);
if (pass !== cases.length) process.exit(1);
