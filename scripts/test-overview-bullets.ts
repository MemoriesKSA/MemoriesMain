// "Where the budget goes" rendered as six unrelated paragraphs:
//
//   Bangkok tickets: Grand Palace 500 THB each, Wat Pho 300 THB each...
//   Samui: Big Buddha, Wat Plai Laem and Fisherman's Village are free...
//   Food: roughly 1,000-1,500 per person per day across the trip...
//
// That is a list in everything but presentation. The day sections already
// render as bullets; the overview did not, so the one section a customer reads
// most carefully was the hardest to scan.
//
// The draft is plain text with no markdown by design, so shape is all there is
// to go on. The risk is the opposite failure - bulleting ordinary prose - so
// the rule is deliberately tight and both sides of it are checked here.

import { groupOverviewLines } from "../app/journey/itinerary-view";

const budget = [
  "All figures are estimates to plan around, not prices anyone has agreed, for two people over six days.",
  "Bangkok tickets: Grand Palace 500 THB each, Wat Pho 300 THB each - about 3,150 for the two of you.",
  "Samui: Big Buddha, Wat Plai Laem and Fisherman's Village are free.",
  "Food: roughly 1,000-1,500 per person per day across the trip.",
  "Ground transport: Bangkok's trains and boats cost tens of baht a ride.",
];
const grouped = groupOverviewLines(budget);

// Prose that happens to contain a colon must stay prose.
const prose = groupOverviewLines([
  "One trap to avoid: Bangkok's two airports are separate sites with no airside link.",
  "Bangkok traffic is genuinely bad, and you asked for public transport.",
]);

// A single labelled line under a heading is a sentence, not a list.
const single = groupOverviewLines(["Bangkok: The Siam, thirty-eight suites on three riverside acres."]);

// Day lines lead with a time and are already bulleted by the day renderer.
const dayish = groupOverviewLines([
  "09:00 - Topkapi Palace at opening.",
  "10:30 - the Grand Bazaar, sixty-odd covered streets.",
]);

const cases: [string, unknown, unknown][] = [
  ["the budget section splits into two blocks", grouped.length, 2],
  ["the lead sentence stays prose", grouped[0]?.kind, "prose"],
  ["and is the only line in that block", grouped[0]?.lines.length, 1],
  ["the labelled figures become items", grouped[1]?.kind, "items"],
  ["all four of them, in one list", grouped[1]?.lines.length, 4],

  ["a sentence with a colon in the middle stays prose", prose.every((b) => b.kind === "prose"), true],
  ["and is not split up", prose.length, 1],

  ["a lone labelled line stays prose", single[0]?.kind, "prose"],

  ["a timed day line is not treated as a labelled item", dayish.every((b) => b.kind === "prose"), true],

  ["nothing is lost", grouped.flatMap((b) => b.lines).length, budget.length],
  ["and the order is preserved", grouped.flatMap((b) => b.lines).join("|"), budget.join("|")],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);
