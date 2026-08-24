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

import { categoriesFor, buildStudySystemPrompt, missingCategories, researchIsComplete, customerRequestForCheck, type DraftGuideSubmission } from "../app/draft-guide";
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
  // This asserted 0 until a trip city was allowed to research from nothing.
  // The old name was already at odds with the old number: it said "never
  // falls back to an empty list" while asserting the list WAS empty, which
  // is exactly what let a whole country sit in the planner producing nothing.
  ["a trip city with no guide researches everything", categoriesFor(undefined, false).length, 7],
  ["and a study city still gets its own four, not those seven", studyCats.length, 4],

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


// A study city is measured for completeness against the STUDY categories, not
// the trip ones, and has no guide to measure against. The first real study
// draft ran cold and got two of four categories - universities and the visa
// route - so it published with no housing and no halal detail at all. It was
// honest about the gap, which is right, but the gap should not have been
// there: four categories cannot fit the in-request research deadline, so
// study cities need warming ahead of time like any other.

const partial = "##cat:universities\n...\n##cat:studyvisa\n...";
const full = "##cat:universities\n.\n##cat:studyvisa\n.\n##cat:living\n.\n##cat:studentlife\n.";

// The self-check must see the study answers, or it calls the student's own
// form entries inventions. A real London draft was flagged for "Mechanical
// Engineering" - which the customer had typed in - and the finding claimed it
// drove the entire university shortlist. Same bug as the SAR 15,000 budget on
// a Jeddah plan, one release later, in the one pass that exists to catch
// invented detail. Three runs went green the moment the checker could see it.
const studyRequestView = customerRequestForCheck({
  ...submission,
  name: "Test", fromDate: "2027-09-20", toDate: "2028-06-30",
  travellers: "solo", travellerCount: "1", transport: [], stays: [],
  planIncludes: [], currency: "SAR", budget: "", budgetMode: "open",
  packageNotes: "none",
} as unknown as DraftGuideSubmission, "London");

const tripRequestView = customerRequestForCheck({
  name: "Test", countryName: "Turkiye", purpose: "leisure",
  fromDate: "2026-11-14", toDate: "2026-11-20",
  travellers: "couple", travellerCount: "2", transport: [], stays: [],
  planIncludes: [], currency: "SAR", budget: "30000", budgetMode: "fixed",
  packageNotes: "none",
} as unknown as DraftGuideSubmission, "Istanbul");

const checkerCases: [string, unknown, unknown][] = [
  ["the checker is told this is a study request", /STUDY ABROAD request/.test(studyRequestView), true],
  ["and that the customer is a Saudi citizen", /Saudi citizen/.test(studyRequestView), true],
  // The fixture's field, which is what the London draft was wrongly flagged
  // for having "invented".
  ["it sees the field of study the customer typed", studyRequestView.includes("computer science"), true],
  ["and the university they named", studyRequestView.includes("University of Manchester"), true],
  ["it sees the study level", /Study level/.test(studyRequestView), true],
  ["it sees whether a university was named", /Named university/.test(studyRequestView), true],
  ["and the support they asked for", /Support requested/.test(studyRequestView), true],
  // None of it belongs on a holiday, where it would be noise in every check.
  ["a trip check carries no study lines", /STUDY ABROAD request|Study level|Named university/.test(tripRequestView), false],
];

const warmCases: [string, unknown, unknown][] = [
  ["the real Manchester shape is incomplete", researchIsComplete(undefined, partial, true), false],
  ["and names exactly what is missing", missingCategories(undefined, partial, true).join(","), "living,studentlife"],
  ["all four categories is complete", researchIsComplete(undefined, full, true), true],
  ["with nothing left to buy", missingCategories(undefined, full, true).length, 0],
  ["empty notes need all four", missingCategories(undefined, "", true).length, 4],
  // Measured against the wrong set this used to read as complete, because a
  // trip city with no guide needed no categories at all, so any notes at all
  // satisfied it. Now the wrong set is seven trip categories that four study
  // categories plainly do not cover, so the mistake reports itself instead of
  // passing quietly. Strictly better than the behaviour this line was written
  // to pin down.
  ["study notes measured as a trip now read as incomplete", researchIsComplete(undefined, full, false), false],
  ["and name the trip categories they are missing", missingCategories(undefined, full, false).includes("stays"), true],
];

// One run, one exit code. Kept together deliberately: an early exit after the
// first block would have skipped every warming check and still reported a pass.
const all = [...cases, ...warmCases, ...checkerCases];
let pass = 0;
for (const [name, got, want] of all) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
if (studyCityWithData.length) console.log("\nunexpectedly has flagship data:", studyCityWithData.join(", "));
console.log(`\n${pass}/${all.length} passed  ·  study researches: ${studyCats.join(", ")}`);
if (pass !== all.length) process.exit(1);
