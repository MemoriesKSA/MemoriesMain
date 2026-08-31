// How much a blurred pill gives away by its width alone.
//
// The withheld text never reaches the browser, which is the part that was
// designed carefully. What does reach the browser is a pill drawn to the
// hidden name's character count, and we publish a free page per city listing
// the very names we recommend. So a reader who never sees a letter can still
// take each pill's length, look up our own public list for that city, and keep
// only the names that are exactly that long.
//
// This does that, as an attacker would, and reports how many of the plan's
// hidden names it resolves.
//
//   npx tsx scripts/pill-fingerprint.ts jed3.html Jeddah

import { readFileSync } from "node:fs";
import { placeNamesForCity } from "../app/journey/place-links";

const file = process.argv[2] ?? "";
const city = process.argv[3] ?? "";

if (!file || !city) {
  console.error("usage: pill-fingerprint.ts <saved-page.html> <city label>");
  process.exit(2);
}

const html = readFileSync(file, "utf8");

// Each pill is a span carrying this label, holding filler drawn to the hidden
// name's length. Reading the filler back out is the whole attack.
const PILL = /aria-label="hidden until unlocked"[^>]*>([^<]*)</g;
const pills = [...html.matchAll(PILL)].map((m) => m[1].trim());

// What an outsider can see: our own public city page lists these by name.
const candidates = [...new Set([...placeNamesForCity(city, false), ...placeNamesForCity(city, true)])];

// The pill is clamped, so only lengths inside the clamp carry information.
const CLAMP_LOW = 6;
const CLAMP_HIGH = 40;

const byLength = new Map<number, string[]>();
for (const name of candidates) {
  const key = Math.max(CLAMP_LOW, Math.min(name.length, CLAMP_HIGH));
  byLength.set(key, [...(byLength.get(key) ?? []), name]);
}

let unique = 0;
let narrowed = 0;
const found: string[] = [];

for (const pill of pills) {
  const matches = byLength.get(pill.length) ?? [];
  if (matches.length === 1) {
    unique++;
    found.push(`${String(pill.length).padStart(3)} chars -> ${matches[0]}`);
  } else if (matches.length > 1 && matches.length <= 4) {
    narrowed++;
    found.push(`${String(pill.length).padStart(3)} chars -> one of: ${matches.join(" | ")}`);
  }
}

console.log(`${file}, city "${city}"\n`);
console.log(`${pills.length} blurred pills on the page`);
console.log(`${candidates.length} names on our own public page for this city\n`);
console.log(`${unique} pill(s) resolve to exactly ONE candidate`);
console.log(`${narrowed} pill(s) narrow to four or fewer\n`);
for (const line of [...new Set(found)].slice(0, 25)) console.log(`  ${line}`);

const exposed = unique + narrowed;
console.log(
  `\n${exposed} of ${pills.length} pills leak something (${Math.round((exposed / Math.max(pills.length, 1)) * 100)}%),` +
    ` without a single hidden character being sent to the browser.`,
);
