// The re-warm cron refreshes ONE city per run. That is the spend guard and it
// should stay. What it costs is queue throughput, and that is where this can
// break without anyone noticing.
//
// When several cities come due at once they are refreshed one at a time, so
// the last city in the queue waits (list length / runs per day) days past the
// moment it became due. If that wait is longer than the margin the refresh
// window leaves, the city goes cold. Nothing errors. No log line appears. The
// next customer for that city simply pays for research and waits for it
// inside their own request.
//
// Ten Saudi cities were warmed by hand for about $23 and were never added to
// the list, so all of it would have expired thirty days later. Adding them
// took the list from 2 to 12, which daily runs cannot drain, so the schedule
// moved to every six hours. This asserts the two agree, reading the real
// schedule out of vercel.json rather than trusting a constant next to it.

import { readFileSync } from "fs";
import { KEEP_WARM, RUNS_PER_DAY, KEEP_WARM_CAPACITY } from "../app/api/cron/rewarm-research/keep-warm";
import { flagshipCityKeys } from "../app/flagship-city-data";

const vercel = JSON.parse(readFileSync("vercel.json", "utf8")) as {
  crons: { path: string; schedule: string }[];
};
const cron = vercel.crons.find((c) => c.path === "/api/cron/rewarm-research");

// Only the shapes this project actually uses: "0 3 * * *" and "0 */6 * * *".
function runsPerDay(schedule: string): number {
  const hour = schedule.split(" ")[1];
  if (hour === "*") return 24;
  const every = hour.match(/^\*\/(\d+)$/);
  if (every) return 24 / Number(every[1]);
  return hour.split(",").length;
}

const scheduled = cron ? runsPerDay(cron.schedule) : 0;
const known = new Set(flagshipCityKeys().map((k) => k.citySlug));
const unknownCities = KEEP_WARM.filter((c) => !known.has(c));
const duplicates = KEEP_WARM.filter((c, i) => KEEP_WARM.indexOf(c) !== i);
// Curated rows never expire and cacheResearch refuses to overwrite them, so
// listing one would schedule a purchase whose result is then thrown away.
const CURATED = new Set(["riyadh", "jeddah", "alula", "makkah", "madinah"]);
const curatedListed = KEEP_WARM.filter((c) => CURATED.has(c));

const cases: [string, unknown, unknown][] = [
  ["the re-warm cron is actually scheduled", !!cron, true],
  ["the schedule matches the runs-per-day the capacity assumes", scheduled, RUNS_PER_DAY],
  ["the list fits what the schedule can drain", KEEP_WARM.length <= KEEP_WARM_CAPACITY, true],
  ["every city on the list is one we hold data for", unknownCities.length, 0],
  ["no city is listed twice", duplicates.length, 0],
  ["no curated city is on the list", curatedListed.length, 0],
  ["the Saudi cities that were paid for are kept warm", ["abha", "al-ahsa", "dammam", "taif", "yanbu"].every((c) => KEEP_WARM.includes(c)), true],
  ["and so are the two Türkiye cities we sell", ["istanbul", "cappadocia"].every((c) => KEEP_WARM.includes(c)), true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
if (unknownCities.length) console.log("\nnot in the deep data:", unknownCities.join(", "));
console.log(`\n${pass}/${cases.length} passed  ·  ${KEEP_WARM.length} cities listed, capacity ${KEEP_WARM_CAPACITY} at ${scheduled} runs a day`);
if (pass !== cases.length) process.exit(1);
