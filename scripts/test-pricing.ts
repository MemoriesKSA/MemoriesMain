import { planFee, nightsBetween, daysFromNights, NIGHT_RATE, EXTRA_STOP_FEE } from "../app/journey/pricing";
import { freeDayNumbers, stopsFromNights } from "../app/journey/plan-stops";
import { applyPaywall } from "../app/journey/paywall";

const shortPlan = ["Your Riyadh trip", "An overview of the stay.", "Day 1 · Monday", "Breakfast somewhere.", "Day 2 · Tuesday", "Fly home."].join("\n");

const cases: [string, unknown, unknown][] = [
  ["rate is 15", NIGHT_RATE, 15],
  ["extra stop is 20", EXTRA_STOP_FEE, 20],

  // Per night, plus each destination after the first.
  ["1 night, 1 city", planFee(1, 1), 15],
  ["5 nights, 1 city", planFee(5, 1), 75],
  ["7 nights, 2 cities", planFee(7, 2), 125],
  ["9 nights, 3 cities", planFee(9, 3), 175],
  ["14 nights, 1 city", planFee(14, 1), 210],
  // The first destination is never surcharged, only the ones after it.
  ["one city carries no stop fee", planFee(9, 1), 135],

  ["no dates means no fee", planFee(0, 1), 0],
  ["negative nights cannot bill", planFee(-4, 1), 0],

  ["nights between dates", nightsBetween("2026-09-03", "2026-09-12"), 9],
  ["reversed dates are zero", nightsBetween("2026-09-12", "2026-09-03"), 0],
  ["missing date is zero", nightsBetween(null, "2026-09-12"), 0],
  ["nine nights is ten days", daysFromNights(9), 10],

  // A one-night trip is two days, and giving day one away would be giving
  // away the plan. Nothing is free but the overview.
  ["1 night frees no day", JSON.stringify(freeDayNumbers(null, daysFromNights(1))), "[]"],
  ["2 nights frees day one", JSON.stringify(freeDayNumbers(null, daysFromNights(2))), "[1]"],
  ["unknown length keeps old behaviour", JSON.stringify(freeDayNumbers(null)), "[1]"],
  [
    "multi-stop still frees each first day",
    JSON.stringify(freeDayNumbers(stopsFromNights(["Riyadh", "Jeddah"], [2, 3]), daysFromNights(5))),
    "[1,3]",
  ],

  // The paywall must actually withhold the day, not just score it.
  ["short trip keeps the overview", applyPaywall(shortPlan, null, 2).visibleText.includes("An overview of the stay."), true],
  ["short trip withholds day one", applyPaywall(shortPlan, null, 2).visibleText.includes("Breakfast somewhere."), false],
  ["short trip teases both headings", applyPaywall(shortPlan, null, 2).lockedDays.length, 2],
  ["normal trip still shows day one", applyPaywall(shortPlan, null, 6).visibleText.includes("Breakfast somewhere."), true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
