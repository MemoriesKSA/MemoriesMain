// Every false positive the self-check produced came from the same cause: a
// source it needed was not in front of it.
//
//   - no customer request, so the SAR 15,000 budget the customer typed in
//     read as an invented figure
//   - no trip calendar, so "23 August is a Sunday" was something it could
//     doubt but never verify
//   - no stop plan, so it could see Cappadocia on Day 6 and had no way to
//     tell whether that was right
//
// Each one made a correct draft look wrong to the reviewer. So this asserts
// what the pass is handed, not what it concludes: the conclusions are a
// sampled model output and belong in recheck-proposal.ts, but the inputs are
// ours and they should never silently go missing again.

import { customerRequestForCheck, buildSelfCheckSystemPrompt, type DraftGuideSubmission } from "../app/draft-guide";

const submission = {
  submissionId: "test",
  city: "istanbul",
  countrySlug: "turkey",
  countryName: "Türkiye",
  stops: ["istanbul", "cappadocia"],
  stopNights: [5, 3],
  purpose: "leisure",
  travellers: "couple",
  travellerCount: "2",
  fromDate: "2026-10-04",
  toDate: "2026-10-12",
  transport: ["flights", "private-driver"],
  stays: ["hotel"],
  stayRating: "4",
  departureCity: "Riyadh",
  flightTiming: "any",
  planIncludes: ["attractions", "restaurants"],
  currency: "SAR",
  budget: "30000",
  packageNotes: "Keen on a balloon flight in Cappadocia.",
  name: "Test Customer",
  email: "test@example.com",
  phone: "+966500000000",
} as DraftGuideSubmission;

const request = customerRequestForCheck(submission, "Istanbul → Cappadocia", ["Istanbul", "Cappadocia"]);
const prompt = buildSelfCheckSystemPrompt();

// A single-stop trip must not grow a stops line out of nowhere.
const soloRequest = customerRequestForCheck(
  { ...submission, stops: ["istanbul"], stopNights: undefined } as DraftGuideSubmission,
  "Istanbul",
  ["Istanbul"],
);

const cases: [string, unknown, unknown][] = [
  // The budget that got flagged as invented.
  ["the customer's budget is shown", request.includes("SAR 30,000"), true],
  ["and their traveller count", request.includes("2"), true],
  // The star rating that got flagged as invented.
  ["their requested star rating is shown", /Preferred accommodation rating: 4/.test(request), true],
  ["their departure city is shown", request.includes("Riyadh"), true],
  ["their own notes are shown", request.includes("balloon flight"), true],
  ["their dates are shown", request.includes("2026-10-04"), true],

  // The stop plan, and the arithmetic the draft has to match.
  ["the stop order is shown", /Istanbul, 5 nights.*Cappadocia, 3 nights/.test(request), true],
  ["with the day range each stop occupies", request.includes("Day 1 to Day 6"), true],
  ["and the second stop's real first day", request.includes("Day 6 to Day 9"), true],
  ["a single-stop trip gets no stops line", /Stops in order/.test(soloRequest), false],

  // The rule that stops the request being mistaken for evidence about places.
  ["the prompt says the request is a source", /CUSTOMER REQUEST below is a source/.test(prompt), true],
  ["and says not to flag those as invented", /Never flag one of those as invented/.test(prompt), true],
  ["and draws the line at claims about real places", /does not make "this hotel is 4-star" sourced/.test(prompt), true],

  // The format that decides the banner colour.
  ["the prompt demands a CLEAN or ISSUES first line", /VERDICT: CLEAN[\s\S]*VERDICT: ISSUES/.test(prompt), true],
  ["and forbids listing what checked out fine", /Only defects go in that list/.test(prompt), true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) {
  console.log("\n--- request as built ---\n" + request);
  process.exit(1);
}
