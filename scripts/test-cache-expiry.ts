// What expiry actually costs, which is not what I told Habib.
//
// I said the ~$49 of warmed research "decays over the next month" and that
// warming more would be betting on an unproven launch date. That was wrong,
// and it was wrong in a way that shaped a real decision, so it is worth a
// test rather than a correction that fades out of the conversation.
//
// The actual path for a row that is past its TTL but complete and on the
// current scope:
//
//   getCachedResearch  -> stale: true
//   the draft path     -> falls through to researchOperationalFacts
//   that function      -> every category already present, todo is empty
//                      -> returns the notes unchanged, zero API calls
//   the draft path     -> re-caches them, which RESETS updated_at
//
// So age never costs a request anything, and any city that gets used resets
// its own clock. The TTL only decides whether the re-warm cron re-buys, which
// is the one place it can spend money - and that cron is paused.
//
// RESEARCH_SCOPE_VERSION is the real invalidation lever, and this checks that
// the two are not confused: scope invalidates, age effectively does not.

import { categoriesFor, missingCategories, RESEARCH_CACHE_TTL_DAYS, RESEARCH_SCOPE_VERSION, readScopeVersion } from "../app/draft-guide";
import { flagshipCityGuideBySlug } from "../app/flagship-city-data";

const guide = flagshipCityGuideBySlug("turkey", "istanbul")!;
const complete = categoriesFor(guide).map((c) => `##cat:${c.key}\nsomething real\n`).join("");
const stamped = `#scope:v${RESEARCH_SCOPE_VERSION}\n${complete}`;
const oldScope = `#scope:v1\n${complete}`;

// The question the draft path actually asks of a stale row: is there anything
// left to buy? For a complete row the answer is no, whatever its age.
const todoWhenComplete = missingCategories(guide, readScopeVersion(stamped).notes);
const todoWhenPartial = missingCategories(guide, "##cat:dining\nonly this one\n");

const cases: [string, unknown, unknown][] = [
  ["a complete row has nothing left to research", todoWhenComplete.length, 0],
  ["so an expired-but-complete row costs zero API calls", todoWhenComplete.length === 0, true],
  ["while a genuinely partial row does have work", todoWhenPartial.length > 0, true],

  // Scope is the lever that actually invalidates.
  ["the current scope reads as current", readScopeVersion(stamped).version, RESEARCH_SCOPE_VERSION],
  ["an older scope is detected", readScopeVersion(oldScope).version !== RESEARCH_SCOPE_VERSION, true],
  ["and an older scope's notes are still readable for resuming", readScopeVersion(oldScope).notes.length > 0, true],

  // The knob itself, so a future change to it is deliberate.
  ["the TTL is a year, i.e. effectively no expiry", RESEARCH_CACHE_TTL_DAYS, 365],
  ["which is far longer than the cron's refresh margin", RESEARCH_CACHE_TTL_DAYS > 30, true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed  ·  TTL ${RESEARCH_CACHE_TTL_DAYS} days, scope v${RESEARCH_SCOPE_VERSION}`);
if (pass !== cases.length) process.exit(1);
