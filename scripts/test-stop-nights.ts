import { stopsFromNights, freeDayNumbers } from "../app/journey/plan-stops";

// The worked example from the request that prompted this: two nights in
// Riyadh, three in Jeddah, four in Abha. Nine nights, so a ten-day trip,
// and each stop begins the morning after the previous one's last night.
const trip = stopsFromNights(["Riyadh", "Jeddah", "Abha"], [2, 3, 4]);

const cases: [string, unknown, unknown][] = [
  ["three stops mapped", trip?.length, 3],
  ["Riyadh starts day 1", trip?.[0].firstDay, 1],
  ["Jeddah starts day 3", trip?.[1].firstDay, 3],
  ["Abha starts day 6", trip?.[2].firstDay, 6],
  ["free days are each stop's first", JSON.stringify(freeDayNumbers(trip ?? null)), "[1,3,6]"],
  // 9 nights is a 10-day trip, and Abha holds days 6 through 10.
  ["last stop ends on the final day", (trip?.[2].firstDay ?? 0) + 4, 10],

  ["single stop is not a multi-stop map", stopsFromNights(["Riyadh"], [4]), null],
  ["count mismatch rejected", stopsFromNights(["Riyadh", "Jeddah"], [4]), null],
  ["a zero-night stop is rejected", stopsFromNights(["Riyadh", "Jeddah"], [0, 5]), null],
  ["a fractional night is rejected", stopsFromNights(["Riyadh", "Jeddah"], [1.5, 3]), null],
  // Falling back to null matters: freeDayNumbers(null) gives day one free,
  // whereas a mapping full of zeros would give the customer nothing.
  ["null still frees day one", JSON.stringify(freeDayNumbers(null)), "[1]"],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
