// The blurred-day and hidden-name treatment is a presentation idea with a
// security requirement underneath it: the reader must see the SHAPE of what
// they haven't paid for and none of the CONTENT. A CSS blur over real text
// would look identical and give the whole plan away to anyone who opens
// devtools, so these check that the words are genuinely gone.

import { applyPaywall, redactStayNames, REDACTION_PATTERN } from "../app/journey/paywall";
import { stopsFromNights } from "../app/journey/plan-stops";
import { splitOverviewGroup } from "../app/journey/parse-itinerary";

const plan = [
  "Riyadh and Jeddah — 5 days",
  "",
  "Where you'll stay",
  "",
  "Riyadh, Days 1-3: Novotel Suites Riyadh Olaya (4-star suite hotel).",
  "A kitchenette and an indoor pool, which is what a family wants.",
  "",
  "Getting around",
  "",
  "Book a driver rather than hailing rides, the Novotel Suites Riyadh Olaya desk can arrange it.",
  "",
  "Day 1 — Monday, Riyadh",
  "Morning: the museum, which opens at nine.",
  "Evening: dinner at Myazu, booked ahead.",
  "",
  "Day 2 — Tuesday, Riyadh",
  "Morning: SECRETMORNINGPLAN at the palace.",
  "Evening: SECRETEVENINGPLAN by the water.",
  "",
  "Day 3 — Wednesday, Jeddah",
  "Morning: SECRETTHIRDDAY in the old town.",
].join("\n");

const stops = stopsFromNights(["Riyadh", "Jeddah"], [2, 2]);
const paywalled = applyPaywall(plan, stops, 5);
const redacted = redactStayNames(paywalled.visibleText, ["Novotel Suites Riyadh Olaya"]);
const serialised = JSON.stringify({ text: redacted, lockedDays: paywalled.lockedDays });

const day2 = paywalled.lockedDays.find((d) => d.title.startsWith("Day 2"));
// The stay line specifically. The same hotel is named again further down
// under "Getting around", and that mention is deliberately left readable, so
// asserting the name is absent from the whole document would be asserting
// the opposite of what the scoping is meant to do.
const stayLine = redacted.split("\n").find((l) => l.startsWith("Riyadh, Days 1-3")) ?? "";

const cases: [string, unknown, unknown][] = [
  // Free days are day 1 and day 3 (first day of each stop), so day 2 locks.
  ["day 2 is withheld", !!day2, true],
  ["its heading is kept, as the teaser", day2?.title, "Day 2 — Tuesday, Riyadh"],
  ["its measurements are kept", JSON.stringify(day2?.lineLengths), "[41,40]"],

  // The point of the whole exercise.
  ["no withheld word reaches the browser", /SECRETMORNINGPLAN|SECRETEVENINGPLAN/.test(serialised), false],
  ["a free day's words do reach it", serialised.includes("dinner at Myazu"), true],
  // Day 3 starts the Jeddah stop, so it is free and must survive intact.
  ["the second stop's first day is free", serialised.includes("SECRETTHIRDDAY"), true],

  // Hidden hotel name: gone from the text, reasons intact.
  ["the hotel name is gone from the stay line", stayLine.includes("Novotel Suites Riyadh Olaya"), false],
  ["a marker stands in its place", /⟦R:\d+⟧/.test(stayLine), true],
  ["the marker carries the length", /⟦R:27⟧/.test(stayLine), true],
  ["the reason for the choice survives", redacted.includes("A kitchenette and an indoor pool"), true],
  // Only inside the stay section: the same name later is a different point
  // and stays readable.
  // A chosen hotel is hidden everywhere, including where a free day names
  // it, because a readable link in day one gives away what the overview is
  // withholding.
  ["a chosen hotel is hidden outside the stay block too", redacted.includes("Novotel Suites Riyadh Olaya"), false],
  ["the sentence around it survives", redacted.includes("desk can arrange it"), true],
  // The tag after the name narrows it to one property, so it goes as well.
  ["the descriptor after the name is hidden too", stayLine.includes("4-star suite hotel"), false],
  // A hotel never chosen is an upgrade option and stays readable.
  ["an unchosen hotel stays readable", redactStayNames(paywalled.visibleText, ["Banyan Tree AlUla", "Novotel Suites Riyadh Olaya"]).includes("Myazu"), true],

  // Nothing is redacted once they have paid.
  ["an unlocked plan keeps its names", redactStayNames(plan, []).includes("Novotel Suites Riyadh Olaya"), true],

  // The overview headings that were rendering as body text.
  ["a lone heading is a label", splitOverviewGroup(["Where you'll stay"]).label, "Where you'll stay"],
  ["a heading above its own lines still works", splitOverviewGroup(["Getting around", "Book a driver."]).label, "Getting around"],
  ["a real sentence is not a heading", splitOverviewGroup(["We built this to sit inside your budget of sixty thousand."]).label, null],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
