import { parseStopMarkers, stripStopMarkers, freeDayNumbers } from "../app/journey/plan-stops";

const internal = [
  "For the planner",
  "- confirm the Haramain fare at booking time",
  "STOPS: Riyadh=1, Jeddah=5, Riyadh=9",
].join("\n");

const cases: [string, unknown, unknown][] = [
  ["parses three stops", parseStopMarkers(internal)?.length, 3],
  ["first stop day", parseStopMarkers(internal)?.[0].firstDay, 1],
  ["last stop day", parseStopMarkers(internal)?.[2].firstDay, 9],
  ["free days are each stop's first", JSON.stringify(freeDayNumbers(parseStopMarkers(internal))), "[1,5,9]"],
  ["no marker returns null", parseStopMarkers("nothing here"), null],
  ["null stops fall back to day 1 only", JSON.stringify(freeDayNumbers(null)), "[1]"],
  ["marker line is stripped", stripStopMarkers(internal).includes("STOPS:"), false],
  ["other lines survive stripping", stripStopMarkers(internal).split("\n").length, 2],
  ["malformed entries are dropped", parseStopMarkers("STOPS: Riyadh=, Jeddah=5")?.length, 1],
  ["day zero rejected", parseStopMarkers("STOPS: Riyadh=0"), null],
  ["out-of-order markers get sorted", parseStopMarkers("STOPS: Jeddah=5, Riyadh=1")?.[0].label, "Riyadh"],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
