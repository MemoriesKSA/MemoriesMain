// A customer's Arabic plan arrived 97% empty and nothing said so.
//
// JP-17875, a real Tokyo study draft: 29,092 characters of English, 995 of
// Arabic. The universities, the visa route, the costs and the housing were
// all filed as the planner's private notes.
//
// The English internal headings are anchored, so only a line that IS the
// heading matches. The Arabic ones matched on keywords anywhere in the line,
// because a translation is free to word a heading slightly differently. The
// Arabic draft then wrote this, mid-paragraph and in quotation marks:
//
//   وقد أُدرجت تحت "على الفريق تأكيده قبل الحجز" ليتابعها زميل كما ينبغي
//   (it has been listed under "Team to confirm before booking")
//
// Both keywords, so splitDraftForStorage called it a heading and switched to
// internal. Only a day heading switches back, and a study plan has none.
//
// Two defences here: a heading has to look like a heading, and a split that
// hands the customer a fraction of the document says so out loud.

import { splitDraftForStorage } from "../app/journey/parse-itinerary";
import { splitLooksLopsided } from "../app/draft-guide";

// The real sentence, with a plan either side of it.
const body = (mid: string) => [
  "طوكيو — سنة للوصول إلى JLPT N2، ثم التقديم الجامعي",
  "",
  "لماذا طوكيو، ولماذا تناسبك هذه السنة",
  "أنت تبدأ من الصفر في اللغة اليابانية وهدفك واضح.",
  "",
  mid,
  "",
  "الجامعات التي ستستهدفها",
  "جامعة طوكيو معروفة بالعلوم والهندسة.",
  "هذه وجهات ما بعد N2، لا أماكن تتقدم إليها الآن.",
].join("\n");

const prose = body('وقد أُدرجت تحت "على الفريق تأكيده قبل الحجز" ليتابعها زميل كما ينبغي.');
const realHeading = body("على الفريق تأكيده قبل الحجز");

const fromProse = splitDraftForStorage(prose);
const fromHeading = splitDraftForStorage(realHeading);

// English must keep behaving exactly as it did.
const english = splitDraftForStorage([
  "Day 1 — Monday", "Evening: the night market.", "",
  "Team to confirm before booking", "Check the ferry times.", "",
  "For the planner", "Prices move.",
].join("\n"));

const long = "x".repeat(30_000);

const cases: [string, unknown, unknown][] = [
  // The bug.
  ["prose mentioning a heading is not a heading", fromProse.customerFacing.includes("الجامعات التي ستستهدفها"), true],
  ["so the universities reach the customer", fromProse.customerFacing.includes("جامعة طوكيو"), true],
  ["and the closing line survives too", fromProse.customerFacing.includes("هذه وجهات ما بعد N2"), true],
  ["the sentence itself stays in the plan, it was written for the customer", fromProse.customerFacing.includes("ليتابعها زميل"), true],
  ["nothing was filed as internal at all", fromProse.internalOnly, ""],

  // A real Arabic heading must still split, or the planner's notes go public.
  ["a real Arabic heading still splits", fromHeading.internalOnly.includes("على الفريق تأكيده قبل الحجز"), true],
  ["and everything under it stays internal", fromHeading.internalOnly.includes("الجامعات التي ستستهدفها"), true],
  ["while the opening stays with the customer", fromHeading.customerFacing.includes("لماذا طوكيو"), true],

  // English, unchanged.
  ["an English day still reaches the customer", english.customerFacing.includes("night market"), true],
  ["an English internal heading still splits", english.internalOnly.includes("Team to confirm before booking"), true],
  ["and the planner's note stays internal", english.internalOnly.includes("Prices move"), true],
  ["no internal text leaks to the customer", english.customerFacing.includes("Prices move"), false],

  // The safety net, which catches this shape whatever causes it next time.
  ["995 of 29,092 characters is lopsided", splitLooksLopsided("x".repeat(995), long), true],
  ["a normal split is not", splitLooksLopsided("x".repeat(26_000), long), false],
  ["a draft that is nearly all internal is", splitLooksLopsided("x".repeat(5_000), long), true],
  ["a short draft is never judged, too noisy", splitLooksLopsided("x".repeat(10), "x".repeat(500)), false],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(String(got).slice(0, 60))} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed  ·  prose case now keeps ${fromProse.customerFacing.length} chars for the customer, was 0 after the heading`);
if (pass !== cases.length) process.exit(1);
