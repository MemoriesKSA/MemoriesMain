import { applyPaywall } from "../app/journey/paywall";

const plan = [
  "Where you'll stay",
  "Courtyard by Marriott Riyadh Olaya, 3 nights.",
  "",
  "Day 1 — Monday 31 August",
  "Afternoon: land at RUH.",
  "Evening: SECRET_D1 dinner.",
  "",
  "Day 2 — Tuesday 1 September",
  "Morning: SECRET_D2 museum.",
  "",
  "Day 5 — Friday 4 September",
  "Morning: SECRET_D5 arrive Jeddah.",
  "",
  "Day 6 — Saturday 5 September",
  "Morning: SECRET_D6 Al-Balad.",
].join("\n");

// Two stops: Riyadh from day 1, Jeddah from day 5.
const twoStops = [{ label: "Riyadh", firstDay: 1 }, { label: "Jeddah", firstDay: 5 }];

const multi = applyPaywall(plan, twoStops);
const single = applyPaywall(plan, null);

const cases: [string, unknown, unknown][] = [
  ["overview always visible", multi.visibleText.includes("Courtyard by Marriott"), true],
  ["free day 1 body visible", multi.visibleText.includes("SECRET_D1"), true],
  ["free day 5 body visible (first day of stop 2)", multi.visibleText.includes("SECRET_D5"), true],
  ["locked day 2 body withheld", multi.visibleText.includes("SECRET_D2"), false],
  ["locked day 6 body withheld", multi.visibleText.includes("SECRET_D6"), false],
  ["two locked headings returned", multi.lockedTitles.length, 2],
  ["locked heading kept for teaser", multi.lockedTitles[0].startsWith("Day 2"), true],
  ["locked headings carry no body", multi.lockedTitles.join(" ").includes("SECRET"), false],

  // With no stop markers we must fall back to day one only, never more.
  ["fallback keeps day 1", single.visibleText.includes("SECRET_D1"), true],
  ["fallback locks day 5 too", single.visibleText.includes("SECRET_D5"), false],
  ["fallback locks three days", single.lockedTitles.length, 3],

  // Arabic headings must behave identically.
  ["arabic day heading parsed", applyPaywall(["اليوم 1 — الاثنين", "صباحًا: وصول", "اليوم 2 — الثلاثاء", "SECRET_AR"].join("\n"), null).visibleText.includes("SECRET_AR"), false],
  ["arabic free day kept", applyPaywall(["اليوم 1 — الاثنين", "صباحًا: وصول"].join("\n"), null).visibleText.includes("وصول"), true],

  ["empty input is safe", applyPaywall("", twoStops).visibleText, ""],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exitCode = 1;
