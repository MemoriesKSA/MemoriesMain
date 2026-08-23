// A study plan has no days, and that made it render as raw text.
//
// parseItinerary refused anything without a "Day N" heading and the page fell
// back to a pre-wrapped block: no card, no gold section headings, no bullets.
// Habib spotted it by putting a Manchester study plan next to a Bangkok trip
// plan - one looked finished, the other looked like a paste.
//
// The cause was a rule I added myself. The study brief forbids a "Day 1"
// heading so the paywall cannot mistake a consultation for an itinerary, and
// the parser used that same heading as its only signal that a document was
// structured at all. Protecting one thing broke another, silently, and only
// on the study path.
//
// A day-less document is now parsed as overview groups, which is what it is.

import { parseItinerary, splitOverviewGroup } from "../app/journey/parse-itinerary";

const studyPlan = [
  "STUDY ABROAD PLAN — MANCHESTER, UNITED KINGDOM",
  "Level: Master's, Computer Science",
  "",
  "Why Manchester, and why this fits you",
  "",
  "Manchester is a compact, walkable northern English city with an enormous student population.",
  "",
  "THE UNIVERSITIES",
  "",
  "English requirement: IELTS 7.0 overall with no sub-test below 6.5.",
  "Fees: the 2026-entry page publishes GBP 39,400 a year for international students.",
].join("\n");

const tripPlan = [
  "Bangkok and Koh Samui, 24-29 August 2026",
  "Six days, five nights.",
  "",
  "Day 1 — Monday 24 August, Bangkok",
  "Evening: the night market.",
].join("\n");

const parsedStudy = parseItinerary(studyPlan);
const parsedTrip = parseItinerary(tripPlan);
const studyOverview = parsedStudy?.find((s) => s.kind === "overview") as { groups: string[][] } | undefined;
const labels = (studyOverview?.groups ?? []).map((g) => splitOverviewGroup(g).label).filter(Boolean);

const cases: [string, unknown, unknown][] = [
  // The bug.
  ["a day-less plan parses instead of falling back to raw text", parsedStudy !== null, true],
  ["it becomes one overview section", parsedStudy?.length, 1],
  ["with its headings recognised for the gold styling", labels.length >= 2, true],
  ["including a section heading", labels.includes("THE UNIVERSITIES"), true],
  ["and a sentence-case one", labels.includes("Why Manchester, and why this fits you"), true],
  ["and no content is lost", (studyOverview?.groups ?? []).flat().some((l) => l.includes("IELTS 7.0")), true],

  // A trip must still parse exactly as before.
  ["a trip with days still parses", parsedTrip !== null, true],
  ["and still produces a day section", parsedTrip?.some((s) => s.kind === "day"), true],

  // The fallback still exists for genuinely unstructured scraps, so a
  // reviewer pasting two words does not get restructured into a plan.
  ["a one-line scrap still falls back", parseItinerary("just a note"), null],
  ["as does an empty draft", parseItinerary(""), null],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed  ·  ${labels.length} headings recognised in the study plan`);
if (pass !== cases.length) process.exit(1);
