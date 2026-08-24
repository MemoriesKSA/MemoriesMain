// Three drafts came back yellow, and every finding was the same failure.
//
// Green is the bar. A yellow banner means the draft is wrong, not that a
// reviewer has reading to do, and all seven findings across Bali, Kazbegi and
// Osaka were the draft saying more than its source did:
//
//   "315 m from Masjid Istiq"        -> a mosque given a full name
//   "Cycling is a real cost lever:"  -> "most students have one"
//   "widely available"               -> "on every menu in town"
//   "the school sets this figure"    -> "what the Japanese authorities think"
//   Turkish Airlines -> Istanbul     -> Bangkok paired with Turkish Airlines
//
// Three of those came from research that had been cut off mid-word, which was
// a real bug rather than a prompt problem: the research call had 4,000 tokens
// to cover adaptive thinking, a dozen web searches and the report. All four
// Osaka categories ended mid-sentence. So the ceiling went up, a truncated
// report is now trimmed back to its last finished line, and both briefs are
// told never to finish a sentence the research did not finish.

import { trimToLastCompleteLine, buildStudySystemPrompt } from "../app/draft-guide";
import { parseSiteLinks, parseAllNamedPlaces, stripNameMarkers } from "../app/journey/plan-stops";

const study = buildStudySystemPrompt();

// The real truncations, from the stored research.
const cutMidWord = "Dhaka Halal and Bangaliana Spice & Halal Food, 315 m and 522 m respectively from Masjid Istiq";
const cutAtColon = "Trains run every few minutes.\nCycling is a real cost lever:";
const clean = "Trains run every few minutes.\nCycling is a real cost lever, and a bike costs about 10,000 yen.";

const notes = [
  "For the planner",
  "Fees were taken from the 2026-entry page.",
  "PICKS: The University of Osaka | Osaka Metropolitan University | Masjid Ohtsuka",
  "SITES: The University of Osaka = https://www.osaka-u.ac.jp/en | Osaka Metropolitan University = https://www.omu.ac.jp/en/",
].join("\n");

const sites = parseSiteLinks(notes);

// Things that must never become links.
const bad = parseSiteLinks([
  "SITES: Somewhere = not-a-url | Nowhere = | = https://orphan.example | Fine = https://ok.example",
].join("\n"));

const cases: [string, unknown, unknown][] = [
  // Truncated research is cut back rather than left danglingz.
  ["a line cut mid-word is dropped entirely", trimToLastCompleteLine(cutMidWord), ""],
  ["a line cut at a colon is dropped", trimToLastCompleteLine(cutAtColon), "Trains run every few minutes."],
  ["a finished report is left alone", trimToLastCompleteLine(clean), clean],
  ["a report ending in a bracket counts as finished", trimToLastCompleteLine("Open daily (summer only)"), "Open daily (summer only)"],
  ["Arabic sentence endings count too", trimToLastCompleteLine("الفندق مفتوح طوال العام۔"), "الفندق مفتوح طوال العام۔"],
  ["an empty report stays empty", trimToLastCompleteLine(""), ""],
  ["a report that is entirely one unfinished line becomes nothing", trimToLastCompleteLine("Masjid Istiq"), ""],

  // Both briefs are told not to finish the source's sentences.
  ["the study brief forbids completing a truncated source", /Never finish a sentence the research did not finish/.test(study), true],
  ["it forbids upgrading a hedge", /Do not upgrade a hedge into a stronger claim/.test(study), true],
  ["and forbids inventing a correspondence between two lists", /Two lists are not a mapping/.test(study), true],
  ["it names the actual mistakes so the rule cannot be read as abstract", /Masjid Istiq/.test(study), true],

  // University links.
  ["the study brief asks for site links", /SITES:/.test(study), true],
  ["and only for URLs that appear in the research", /ONLY if that exact URL appears in the research/.test(study), true],
  ["and says why a wrong one is worse than none", /worse than no link/.test(study), true],
  ["a university resolves to its own site", sites["the university of osaka"], "https://www.osaka-u.ac.jp/en"],
  ["so does the second one", sites["osaka metropolitan university"], "https://www.omu.ac.jp/en/"],
  ["a name with no site is simply absent, and falls back to a map", sites["masjid ohtsuka"], undefined],
  ["matching is case-insensitive, since the plan capitalises freely", sites["THE UNIVERSITY OF OSAKA".toLowerCase()], "https://www.osaka-u.ac.jp/en"],

  // Malformed entries are dropped rather than becoming broken links.
  ["a non-URL is refused", bad["somewhere"], undefined],
  ["an empty URL is refused", bad["nowhere"], undefined],
  ["an entry with no name is refused", bad[""], undefined],
  ["but a good entry alongside them still works", bad["fine"], "https://ok.example"],
  ["\"none\" yields nothing", Object.keys(parseSiteLinks("SITES: none")).length, 0],

  // The new marker must not leak to the customer, like the other two.
  ["SITES is stripped from customer-facing text", stripNameMarkers(notes).includes("SITES:"), false],
  ["while the planner's own note survives", stripNameMarkers(notes).includes("Fees were taken"), true],
  ["and PICKS still parses alongside it", parseAllNamedPlaces(notes).includes("Masjid Ohtsuka"), true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed  ·  ${Object.keys(sites).length} site links parsed`);
if (pass !== cases.length) process.exit(1);
