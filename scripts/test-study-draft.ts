// Study submissions have never produced an AI draft. The draft only ran when
// the chosen city had curated flagship data, and no UK, Canadian, Australian
// or Japanese city has any, so every study request since launch generated the
// team email and nothing else. Nothing errored; the branch simply never ran.
//
// The fix is not to write flagship data for 28 study cities. A student does
// not need our restaurant list, they need to know which universities are
// there, whether a Saudi passport gets the visa, what a year costs and
// whether they can eat and pray near campus. So a study city is researched
// from nothing, through its own categories.
//
// This asserts the wiring, since the writing itself is a model output and
// belongs in a real end-to-end run.

import { categoriesFor, buildStudySystemPrompt, type DraftGuideSubmission } from "../app/draft-guide";
import { flagshipCityGuideBySlug } from "../app/flagship-city-data";
import { studyCountries } from "../app/components/planner-data";

const studyCats = categoriesFor(undefined, true).map((c) => c.key);
const tripGuide = flagshipCityGuideBySlug("turkey", "istanbul")!;
const tripCats = categoriesFor(tripGuide, false).map((c) => c.key);
const prompt = buildStudySystemPrompt();

// The premise: no study city is in the flagship data.
const studyCityWithData = studyCountries.flatMap((c) =>
  c.cities.filter((city) => !city.value.startsWith("other-") && flagshipCityGuideBySlug(c.value, city.value)).map((city) => `${c.value}/${city.value}`),
);

const submission = {
  journeyType: "study",
  purpose: "master",
  hasSpecificField: "yes",
  specificField: "computer science",
  hasSpecificUniversity: "yes",
  specificUniversity: "University of Manchester",
  studySupport: "complete",
  countryName: "United Kingdom",
} as DraftGuideSubmission;

const scoped = categoriesFor(undefined, true).map((c) =>
  c.scope({ cityLabelEn: "Manchester", countryName: "United Kingdom", purpose: "master",
    studyLevel: "Master's degree", studyField: submission.specificField, studyUniversity: submission.specificUniversity, studySupport: "Complete" }),
);
const allScopes = scoped.join("\n");

const cases: [string, unknown, unknown][] = [
  // The premise this whole design rests on.
  ["no study city has flagship data", studyCityWithData.length, 0],
  ["so a study city researches with no guide at all", studyCats.length, 4],
  ["and never falls back to an empty list", categoriesFor(undefined, false).length, 0],

  ["study asks about universities", studyCats.includes("universities"), true],
  ["the Saudi visa route", studyCats.includes("studyvisa"), true],
  ["housing and cost of living", studyCats.includes("living"), true],
  ["halal, prayer and community", studyCats.includes("studentlife"), true],

  // A study plan must not inherit the holiday questions.
  ["study does not research restaurants for an evening out", studyCats.includes("dining"), false],
  ["nor private drivers", studyCats.includes("drivers"), false],
  ["nor rental cars", studyCats.includes("rentals"), false],
  ["and a trip still gets its own set", tripCats.includes("halal") && !tripCats.includes("universities"), true],

  // The questionnaire answers have to reach the research, or it writes a
  // generic city guide instead of answering this student.
  ["the named university drives the research", allScopes.includes("University of Manchester"), true],
  ["so does the field of study", allScopes.includes("computer science"), true],
  ["and the study level", allScopes.includes("Master's degree"), true],

  // The Saudi-specific answers are the reason this service exists.
  ["the visa scope is written for a Saudi citizen", /SAUDI CITIZEN/.test(allScopes), true],
  ["and covers the scholarship route", /scholarship/i.test(allScopes), true],
  ["and the cultural attaché", /attach/i.test(allScopes), true],

  // The brief.
  ["the study brief says who it is for", /SAUDI CITIZEN/.test(prompt), true],
  ["refuses to state a visa rule as settled", /Never state a visa rule as settled fact/.test(prompt), true],
  ["promises no admission or visa outcome", /Never promise an admission outcome/.test(prompt), true],
  ["and forbids a day heading, which would paywall it as an itinerary", /Never write a "Day 1" heading/.test(prompt), true],
  ["it keeps the internal headings our tooling parses", /Team to confirm before booking/.test(prompt), true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
if (studyCityWithData.length) console.log("\nunexpectedly has flagship data:", studyCityWithData.join(", "));
console.log(`\n${pass}/${cases.length} passed  ·  study researches: ${studyCats.join(", ")}`);
if (pass !== cases.length) process.exit(1);
