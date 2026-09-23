// A yellow banner used to mean "somebody should read this before it goes out".
//
// That works while somebody reads every draft by hand, and stops working the
// day after that. Three rounds of new drafting rules on one Bali draft removed
// an invented show duration, left the invented monkeys, and produced a fresh
// set of unsourced details each time. Writing more rules was not converging.
//
// The self-check already names each defect exactly, so the draft goes back with
// the findings and is corrected surgically, then checked again on the corrected
// text. This tests the surgery, which is the part that could quietly damage a
// plan somebody paid for.
//
// It returns edits rather than a rewritten draft on purpose. A rewrite of both
// languages is ~35,000 output tokens and lets the model change anything it
// passes; a list of exact replacements cannot touch a line it was not asked to.

import { readFileSync } from "node:fs";
import { parseDraftEdits, applyDraftEdits, spliceFindings } from "../app/draft-guide";

const draft = [
  "Day 2 — Uluwatu",
  "18:00: the Kecak Fire Dance, the single most memorable ninety minutes of this trip.",
  "Hold on to snacks, the resident monkeys are opportunists.",
  "Sunday is the worst day for coastal traffic.",
].join("\n");

const model = [
  "FIND-EN: the single most memorable ninety minutes of this trip",
  "REPLACE-WITH: the most memorable evening of this trip",
  "FIND-EN: Hold on to snacks, the resident monkeys are opportunists.",
  "REPLACE-WITH: Arrive early, the amphitheatre fills before sunset.",
  "FIND-AR: يوم الأحد هو الأسوأ",
  "REPLACE-WITH: عطلة نهاية الأسبوع هي الأسوأ",
].join("\n");

const edits = parseDraftEdits(model);
const en = applyDraftEdits(draft, edits.filter((e) => e.lang === "en"));

// The two ways an edit can be unsafe.
const ambiguous = applyDraftEdits("the hotel is good. the hotel is good.", [{ lang: "en", find: "the hotel is good.", replace: "x" }]);
const absent = applyDraftEdits(draft, [{ lang: "en", find: "a sentence that was never written", replace: "x" }]);

// Malformed model output must yield nothing, never a half-applied edit.
const noPair = parseDraftEdits("FIND-EN: something\nsome commentary instead of a replacement");
const chatty = parseDraftEdits("Here are my fixes:\n\nFIND-EN: alpha\nREPLACE-WITH: beta\n\nHope that helps!");
const emptyFind = parseDraftEdits("FIND-EN:\nREPLACE-WITH: beta");

const cases: [string, unknown, unknown][] = [
  // Parsing.
  ["three edits parse from the model's output", edits.length, 3],
  ["the Arabic one is tagged Arabic", edits[2].lang, "ar"],
  ["and the English ones English", edits[0].lang, "en"],
  ["prose around the edits is ignored", chatty.length, 1],
  ["and the edit itself still parses", chatty[0].replace, "beta"],
  ["a FIND with no REPLACE-WITH is dropped", noPair.length, 0],
  ["an empty FIND is dropped", emptyFind.length, 0],
  ["no edits at all yields none", parseDraftEdits("").length, 0],

  // Applying.
  ["both English edits apply", en.applied, 2],
  ["the invented duration is gone", en.text.includes("ninety minutes"), false],
  ["the invented monkeys are gone", en.text.includes("monkeys"), false],
  ["the replacement text is in", en.text.includes("the most memorable evening"), true],
  ["untouched lines survive exactly", en.text.includes("Day 2 — Uluwatu"), true],
  ["and so does a line no edit named", en.text.includes("Sunday is the worst day for coastal traffic."), true],

  // Refusing the unsafe ones. An edit matching twice would change a line
  // nobody reviewed; one matching nothing means the model retyped from memory.
  ["an ambiguous edit is refused", ambiguous.applied, 0],
  ["and the draft is left alone", ambiguous.text, "the hotel is good. the hotel is good."],
  ["and it says why", ambiguous.skipped[0].includes("more than once"), true],
  ["an edit that matches nothing is refused", absent.applied, 0],
  ["and says that too", absent.skipped[0].includes("not found"), true],
  ["a refused edit never half-applies", absent.text, draft],

  // Deletion is a valid fix: removing an unsupported claim is the point.
  ["an empty replacement deletes the text", applyDraftEdits("keep this. drop this.", [{ lang: "en", find: " drop this.", replace: "" }]).text, "keep this."],
];

// A word that changes alphabet halfway now becomes a finding rather than a
// warning nobody acts on. Telling the translator not to do it failed twice:
// ناniwa-ku for Naniwa-ku, then بيبيز إيطالianissimo for Italianissimo. A rule
// it can forget is weaker than a detector that cannot.
const spliced = spliceFindings("مطاعم بيبيز إيطالianissimo في ليدز");
const cleanArabic = spliceFindings("مطاعم إيطالية في ليدز");
const withProclitic = spliceFindings("جامعة ليدز وUNSW");

const spliceCases: [string, unknown, unknown][] = [
  ["a spliced word becomes a finding", spliced.length > 0, true],
  ["the finding names the fragment", spliced.includes("لi"), true],
  ["and says what to do about it", spliced.includes("wholly in Arabic script"), true],
  ["and mentions the self-correction habit", spliced.includes("self-correction"), true],
  ["clean Arabic yields no findings", cleanArabic, ""],
  ["and a standalone conjunction before Latin is not a splice", withProclitic, ""],
  ["neither is an empty draft", spliceFindings(""), ""],
];
cases.push(...spliceCases);

// ---- The repair has to reach the customer, and has to fit in the run ----
//
// Both of these were real. The repair rounds rewrote the draft in memory and
// nothing ever stored the rewrite, so itinerary_en kept the text the check had
// objected to while review_state described the corrected text: a plan whose
// findings were all repaired released as clean carrying every one of them. And
// a measured London plan used 86% of the route's 800 seconds, so on a longer
// trip the run was cut off mid-pipeline, leaving no Arabic, no verdict and no
// email, with nothing anywhere saying so.
//
// Wiring, not behaviour, so it is asserted against the source. A unit test
// cannot see whether the update is there; this can.
const pipeline = readFileSync("app/draft-guide.ts", "utf8");
const journeysRoute = readFileSync("app/api/journeys/route.ts", "utf8");
const budgetMs = Number(/const PIPELINE_BUDGET_MS = (\d+) \* 1000;/.exec(pipeline)?.[1] ?? 0) * 1000;
const routeMaxMs = Number(/export const maxDuration = (\d+);/.exec(journeysRoute)?.[1] ?? 0) * 1000;

cases.push(
  ["the repaired draft is re-split", pipeline.includes("englishSplit = splitDraftForStorage(englishDraft);"), true],
  ["and written back to the customer's column", /itinerary_en: englishSplit\.customerFacing \|\| englishDraft,[\s\S]{0,200}arabicSplit\?\.customerFacing/.test(pipeline), true],
  ["only when a round actually applied one", pipeline.includes("if (repaired_any) {"), true],
  ["the pipeline has a budget", budgetMs > 0, true],
  ["which leaves the route room to return", budgetMs < routeMaxMs, true],
  ["the check is skipped rather than started too late", pipeline.includes("const timeForCheck = msLeft() > SELF_CHECK_ESTIMATE_MS + FINALISE_RESERVE_MS;"), true],
  ["a repair round must afford its own re-check", pipeline.includes("if (msLeft() < REPAIR_ROUND_ESTIMATE_MS + SELF_CHECK_ESTIMATE_MS + FINALISE_RESERVE_MS) {"), true],
  ["a missing verdict says so in the email", pipeline.includes("AI SELF-CHECK &middot; DID NOT RUN"), true],
  ["a dropped qualifier is a drafting rule, not only a check", pipeline.includes("travels with that fact into the plan"), true],
);

// ---- The two halves of the pipeline, and the state machine between them ----
//
// Writing and translating a London plan measured 689 of the route's 800
// seconds, so the check and its repairs ran on what was left, which was
// nothing. Being cut off there is silent: the plan is stored, no verdict is
// written, no email goes out. The halves are separate runs now, and these
// assertions are about the seam between them, which is where a split like
// this goes wrong.
const cronRoute = readFileSync("app/api/cron/check-drafts/route.ts", "utf8");
const contextStore = readFileSync("app/draft-context.ts", "utf8");
const vercelJson = JSON.parse(readFileSync("vercel.json", "utf8")) as { crons: { path: string; schedule: string }[] };
const checkCron = vercelJson.crons.find((c) => c.path === "/api/cron/check-drafts");
const releaseCron = readFileSync("app/api/cron/release-plans/route.ts", "utf8");

cases.push(
  ["the checking half is its own exported run", pipeline.includes("export async function checkAndFinishDraft("), true],
  ["the writing half hands over what it used", pipeline.includes("await saveDraftContext(supabase, proposalId, {"), true],
  ["and the writing half no longer runs the check", pipeline.lastIndexOf("await runCheck(") < pipeline.indexOf("export async function generateDraftGuide"), true],
  ["the checker is given the writer's own sources", contextStore.includes("groundedFactsEn") && contextStore.includes("operationalResearch"), true],
  ["the context is thrown away once it is used", cronRoute.includes("dropDraftContext"), true],

  ["the sweep is scheduled", !!checkCron, true],
  ["often enough that a plan waits minutes, not hours", checkCron?.schedule, "*/5 * * * *"],
  ["it has the same ceiling as the drafting route", cronRoute.includes("export const maxDuration = 800;"), true],
  ["and the same authorisation as every other cron", cronRoute.includes("Bearer ${secret}"), true],

  ["a plan is claimed before it is paid for", cronRoute.includes('.update({ review_state: "checking" })') && cronRoute.includes('.is("review_state", null)'), true],
  ["one plan per sweep, so a bad day cannot spend without a bound", cronRoute.includes(".limit(1)"), true],
  ["a claim left by a dead run is taken back", cronRoute.includes("STALE_CLAIM_MS"), true],
  ["a failed check is released for the next sweep", cronRoute.includes('.update({ review_state: null })'), true],
  ["a plan that cannot be checked stops asking", cronRoute.includes('"unchecked"'), true],
  ["and its team is told rather than left waiting", cronRoute.includes("sendReviewerEmailForUnchecked"), true],

  // The rule that keeps all of the above safe: none of these states release.
  ["only a clean verdict ever reaches a customer", releaseCron.includes('.eq("review_state", "clean")'), true],
);

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);
