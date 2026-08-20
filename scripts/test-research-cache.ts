// The research cache stores city notes for a week. The TTL answers "is this
// too old"; the scope stamp answers "was this gathered under the scope the
// draft now expects". The second question only appeared when private drivers
// became a researched category and every already-cached city carried on
// serving driver-less notes for the rest of its week.
//
//   npx tsx scripts/test-research-cache.ts

import { readScopeVersion, RESEARCH_SCOPE_VERSION } from "../app/draft-guide";

const stamped = `#scope:v${RESEARCH_SCOPE_VERSION}\nRestaurants:\n- somewhere real`;
const older = "#scope:v1\nRestaurants:\n- somewhere real";
const unstamped = "Restaurants:\n- somewhere real";
const mentionsLater = "Restaurants:\n- a place called #scope:v9";

const cases: [string, unknown, unknown][] = [
  ["a current stamp reads as current", readScopeVersion(stamped).version, RESEARCH_SCOPE_VERSION],
  ["the stamp is taken off the notes", readScopeVersion(stamped).notes.startsWith("Restaurants:"), true],
  ["nothing else is taken off", readScopeVersion(stamped).notes, unstamped],
  ["an older stamp keeps its own number", readScopeVersion(older).version, 1],
  ["an older stamp is not the current one", readScopeVersion(older).version === RESEARCH_SCOPE_VERSION, false],
  ["an older stamp is still stripped", readScopeVersion(older).notes, unstamped],

  // Anything cached before stamping existed is the generation that predates
  // the driver category, so it has to read as out of date rather than as
  // "no version, assume fine".
  ["unstamped notes read as version zero", readScopeVersion(unstamped).version, 0],
  ["unstamped notes are never the current version", readScopeVersion(unstamped).version === RESEARCH_SCOPE_VERSION, false],
  ["unstamped notes come back whole", readScopeVersion(unstamped).notes, unstamped],

  // The stamp is only a stamp on the first line. A findings line that
  // happens to contain the same text is a restaurant name, not a version.
  ["a stamp further down is just text", readScopeVersion(mentionsLater).version, 0],
  ["and that text survives", readScopeVersion(mentionsLater).notes, mentionsLater],

  ["empty notes are safe", readScopeVersion("").version, 0],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);
