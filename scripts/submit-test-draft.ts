// Submits one real journey request to production, the way the form does.
//
// For testing the named-request path end to end: the customer asks for a
// property the city research has never heard of, and we watch what the draft
// does with it. Before this existed, the answer was "our research for this
// trip doesn't cover it, so we have nothing verified to tell you", which is
// true of the cache and useless to the person who asked.
//
// This spends real money (a full draft is roughly $2), so it is never part of
// the test sweep and is always run deliberately.
//
//   npx tsx --env-file=.env.local scripts/submit-test-draft.ts

import { randomUUID } from "node:crypto";

const SITE = process.env.TEST_SITE ?? "https://memories.tours";

// The property under test. Verified absent from the Dubai research with
// scripts/peek-hotels.ts, and the exact one a real customer asked for and
// did not get: the search found it, cost thirty cents, and a timer threw
// the answer away a moment before it was used.
//
// Written the way they wrote it, as one bare word, so the extraction has to
// expand it to Lapita Dubai Parks and Resorts on its own.
const NAMED = "Lapita";

const submissionId = randomUUID();

const body = {
  submissionId,
  journeyType: "journey",
  country: "uae",
  city: "dubai",
  stops: "dubai",
  stopPurposes: "leisure",
  stopNights: "3",
  stopNightsChosen: "yes",
  purpose: "leisure",
  travellers: "solo",
  travellerCount: "1",
  fromDate: "2026-11-12",
  toDate: "2026-11-15",
  transport: ["rental-car"],
  stays: ["hotel"],
  stayRating: "5-star",
  departureCity: "Riyadh",
  flightTiming: "daytime",
  planIncludes: ["accommodation", "transport", "dining", "activities"],
  packageNotes: `I want to stay at ${NAMED}. If it is not sensible for this trip please say so honestly.`,
  currency: "SAR",
  budget: "18000",
  budgetMode: "fixed",
  delivery: ["email"],
  name: "Test Draft (Lapita)",
  email: "dr.zakivet123@gmail.com",
  phoneCode: "+966",
  phone: "500000000",
  notes: "Also curious whether the Dubai Taxi app is worth having on our phones for the evenings we don't want to drive.",
  privacyAccepted: "yes",
};

async function main() {
  console.log(`Submitting to ${SITE}`);
  console.log(`  named request under test: ${NAMED}`);
  console.log(`  submissionId: ${submissionId}`);
  console.log(`  reference:    ${submissionId.slice(0, 8).toUpperCase()}\n`);

  const response = await fetch(`${SITE}/api/journeys`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  console.log(`HTTP ${response.status}`);
  console.log(text.slice(0, 600));

  if (!response.ok) process.exit(1);
  console.log(`\nDrafting runs in the background. Watch for reference ${submissionId.slice(0, 8).toUpperCase()}.`);
}

main().then(() => process.exit(0));
