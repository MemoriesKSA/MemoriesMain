// The self-check is a second AI pass that advises the reviewer. It is the
// first thing in the draft email, so what it says sets how much the reviewer
// trusts everything below it.
//
// On the first real two-stop Türkiye draft it opened with this:
//
//   "all grounded facts and research notes are based on a trip window of
//    21-28 September 2026 ... it undermines all the day-of-week-dependent
//    operational advice (mosque closures, Topkapi Tuesday closure, Grand
//    Bazaar Sunday closure, market days, etc.)"
//
// Every word of that was wrong. The itinerary's weekdays were right, the
// closures were routed around correctly, and the September window was only
// the window the CACHED research had been run for. The drafting pass had
// already been taught to treat that window as plumbing; the self-check
// hadn't, so it rediscovered it and called the plan unreliable.
//
// Two failures worth keeping caught:
//   - a prompt rule taught to one pass and not the sibling pass that needs it
//   - a checker asked to verify weekdays while holding no calendar
//
// So: the calendar is checked against real dates, and the prompt is checked
// for both halves of the rule.

import { dayByDayCalendar, buildSelfCheckSystemPrompt } from "../app/draft-guide";

const prompt = buildSelfCheckSystemPrompt();
const augustWindow = dayByDayCalendar("2026-08-23", "2026-08-27");

const cases: [string, unknown, unknown][] = [
  // The exact window that was misreported. 23 August 2026 really is a Sunday.
  ["day 1 of the Türkiye trip is Sunday 23 August", augustWindow.includes("Day 1 = Sunday August 23"), true],
  ["day 3 is Tuesday, the day Topkapi is shut", augustWindow.includes("Day 3 = Tuesday August 25"), true],
  ["day 5 is Thursday, the departure day", augustWindow.includes("Day 5 = Thursday August 27"), true],
  ["the window is five days, not four or six", augustWindow.split(", ").length, 5],

  // A trip that crosses a month boundary, where an off-by-one is easiest.
  ["a month boundary rolls over correctly", dayByDayCalendar("2026-09-29", "2026-10-02").includes("Day 3 = Thursday October 1"), true],

  // No dates at all is the pre-warm case, and must not fabricate a window.
  ["no dates produces no calendar rather than an invented one", dayByDayCalendar("", ""), ""],
  ["a reversed range produces nothing", dayByDayCalendar("2026-08-27", "2026-08-23"), ""],

  // The prompt rule itself. Both halves matter: the first stops the false
  // alarm, the second keeps the check that was worth having.
  ["the self-check is told cached notes carry their own window", /cached per city and reused/i.test(prompt), true],
  ["and told that difference is never a finding", /never a finding/i.test(prompt), true],
  ["and pointed at the trip calendar as the authority", /TRIP CALENDAR/.test(prompt), true],
  ["and still asked to catch a weekday that contradicts it", /contradicts the TRIP CALENDAR/.test(prompt), true],
  ["and to catch a place scheduled on a day it is shut", /closed weekday/i.test(prompt), true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);
