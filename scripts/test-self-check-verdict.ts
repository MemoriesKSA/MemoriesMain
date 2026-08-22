// The self-check's colour in the reviewer's email used to be decided by
// testing whether its text STARTED with "No issues found".
//
// That made a clean draft depend on the model opening with the right
// sentence, and it does not reliably. A Jeddah draft with nothing wrong with
// it came back as seven bullets of "checked this, it's correct" with the
// clean sentence at the very bottom, so a good plan was shown to the reviewer
// under a warning colour. Habib had been reading Riyadh and Jeddah as the
// perfect ones; they were drawing yellow banners too, for a reason that had
// nothing to do with the drafts.
//
// The verdict is a first-line token now. These cases are the shapes that
// actually turned up, plus the ones that decide whether a bad reading fails
// safe.

import { readSelfCheckVerdict } from "../app/draft-guide";

// The real Jeddah output, trimmed. Ends with the clean sentence, opens with
// a wall of confirmations. Under the old rule this was yellow.
const jeddahNarrated = `Checked both drafts against grounded facts, research notes, and trip calendar.

- Day 2 weekday check: draft labels "Tuesday September 1" - per trip calendar Day 2 is indeed Tuesday September 1, correct.
- No mismatches in day order, restaurant assignments, or driver/hotel names between English and Arabic versions.

No issues found, the translation is faithful and both are consistent with the grounded facts and research notes.`;

const cases: [string, unknown, unknown][] = [
  // The format the prompt now demands.
  ["a clean verdict reads clean", readSelfCheckVerdict("VERDICT: CLEAN").clean, true],
  ["a clean verdict carries no body to show", readSelfCheckVerdict("VERDICT: CLEAN").clean && readSelfCheckVerdict("VERDICT: CLEAN").body, ""],
  ["an issues verdict reads not clean", readSelfCheckVerdict("VERDICT: ISSUES\n- the fountain hours dropped their hedge").clean, false],
  ["and the verdict line is stripped from what the reviewer reads",
    readSelfCheckVerdict("VERDICT: ISSUES\n- the fountain hours dropped their hedge").body,
    "- the fountain hours dropped their hedge"],
  ["lower case is accepted", readSelfCheckVerdict("verdict: clean").clean, true],
  ["extra spacing is accepted", readSelfCheckVerdict("VERDICT:   CLEAN  ").clean, true],
  ["leading blank lines are accepted", readSelfCheckVerdict("\n\nVERDICT: CLEAN").clean, true],

  // Drafts written before the token existed, still sitting in the database.
  ["the old clean sentence still reads clean", readSelfCheckVerdict("No issues found, the translation is faithful and both are consistent with the grounded facts and research notes.").clean, true],

  // The case this was built for.
  ["a narrated clean result is NOT silently trusted", readSelfCheckVerdict(jeddahNarrated).clean, false],
  ["and the reviewer still sees every word of it", readSelfCheckVerdict(jeddahNarrated).body.includes("Tuesday September 1"), true],

  // Failing safe. An unreadable verdict is a reason for a human to look,
  // never a reason to paint the banner green.
  ["an unrecognised shape is treated as needing a look", readSelfCheckVerdict("Looks mostly fine to me.").clean, false],
  ["a verdict buried on line two does not count", readSelfCheckVerdict("Here is my check.\nVERDICT: CLEAN").clean, false],
  ["an empty self-check is not clean", readSelfCheckVerdict("").clean, false],
  ["and neither is whitespace", readSelfCheckVerdict("   \n  ").clean, false],
  ["a made-up verdict word is not clean", readSelfCheckVerdict("VERDICT: PROBABLY").clean, false],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);

// The banner itself. The whole point of the verdict token is the colour the
// reviewer sees, and nothing tested that the CLEAN path actually paints
// green - the one thing they look at before reading a word.
import { wrapEmailHtml } from "../app/draft-guide";

const GREEN_BG = "#f2f8f5";
const YELLOW_BG = "#fdf6e8";
const emailFor = (selfCheck: string) =>
  wrapEmailHtml("ABC12345", "Istanbul → Cappadocia", "Habib", "Day 1 — arrive", "اليوم 1", selfCheck, "https://memories.tours/x");

const cleanEmail = emailFor("VERDICT: CLEAN");
const issuesEmail = emailFor("VERDICT: ISSUES\n- the fountain hours dropped their hedge");
const narratedEmail = emailFor(jeddahNarrated);

const bannerCases: [string, unknown, unknown][] = [
  ["a clean verdict paints the banner green", cleanEmail.includes(GREEN_BG), true],
  ["and never the warning colour", cleanEmail.includes(YELLOW_BG), false],
  ["and is labelled CLEAN", cleanEmail.includes("SECOND PASS · CLEAN"), true],
  ["and says so in a full sentence, not the raw token", cleanEmail.includes("No issues found."), true],
  ["and never shows the token itself", cleanEmail.includes("VERDICT:"), false],

  ["an issues verdict paints the banner yellow", issuesEmail.includes(YELLOW_BG), true],
  ["and is labelled as needing a look", issuesEmail.includes("NEEDS A LOOK"), true],
  ["and shows the finding", issuesEmail.includes("dropped their hedge"), true],
  ["and strips the token from the body", issuesEmail.includes("VERDICT:"), false],

  ["a narrated clean result still warns rather than reassures", narratedEmail.includes(YELLOW_BG), true],

  // An ISSUES verdict with no bullets must not render an empty warning box.
  ["an empty finding list still says something", emailFor("VERDICT: ISSUES").includes("gave no detail"), true],
];

let bannerPass = 0;
for (const [name, got, want] of bannerCases) {
  const ok = got === want;
  if (ok) bannerPass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${bannerPass}/${bannerCases.length} banner checks passed`);
if (bannerPass !== bannerCases.length) process.exit(1);
