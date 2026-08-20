// Does the drafting pass actually show the budget adding up, and does it
// obey the never-invent rule while doing arithmetic with money?
//
// The rule says: build the allocation only from figures already in the plan,
// and where there is no sourced figure for a category (flights, normally)
// give it as the amount left over rather than a number. Flights are
// deliberately requested here so that exact pressure is applied.
//
//   npx tsx --env-file=.env.local scripts/test-budget-draft.ts

import { generateDraftGuide } from "../app/draft-guide";
import { createSupabaseAdminClient } from "../app/supabase-admin";

const submissionId = `budget-${Date.now()}`;
const TEST_NAME = `Budget Test ${submissionId}`;
const BUDGET = "30000";

if (!process.env.RESEND_API_KEY) {
  process.env.RESEND_API_KEY = "local-test-placeholder-no-email-will-send";
  console.log("RESEND_API_KEY is empty locally, using a placeholder. No email will send.\n");
}

async function main() {
  console.log(`Riyadh 4 nights then Jeddah 4 nights, 2 travellers, SAR ${BUDGET} stated budget, flights requested.\n`);
  const started = Date.now();

  await generateDraftGuide({
    submissionId,
    city: "riyadh",
    stops: ["riyadh", "jeddah"],
    stopPurposes: ["leisure", "leisure"],
    stopNights: [4, 4],
    stopNightsChosen: true,
    purpose: "leisure",
    travellers: "couple",
    travellerCount: "2",
    fromDate: "2026-10-05",
    toDate: "2026-10-13",
    transport: ["flights", "private-driver"],
    stays: ["hotel"],
    stayRating: "4",
    departureCity: "London",
    flightTiming: "any",
    planIncludes: ["attractions", "restaurants"],
    packageNotes: "A couple in their thirties, first visit to Saudi Arabia.",
    currency: "SAR",
    budget: BUDGET,
    name: TEST_NAME,
    email: "mixedhopes2022@gmail.com",
    phone: "+966500000000",
  });

  console.log(`Draft finished in ${Math.round((Date.now() - started) / 1000)}s\n`);

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("proposals")
    .select("reference, itinerary_en, itinerary_ar, notes")
    .eq("customer_name", TEST_NAME)
    .maybeSingle();

  if (!data) {
    console.error("FAIL  no proposal written, the draft never completed");
    process.exit(1);
  }

  const en = data.itinerary_en ?? "";
  const lines = en.split(/\r?\n/);
  const start = lines.findIndex((l: string) => /where the budget goes/i.test(l));

  console.log("=== BUDGET SECTION (English) ===");
  if (start === -1) {
    console.log("(no 'Where the budget goes' heading found)\n");
  } else {
    let end = start + 1;
    while (end < lines.length && !/^(Day |Getting|A few|Before|Where you)/i.test(lines[end])) end++;
    console.log(lines.slice(start, end).filter(Boolean).join("\n"));
  }

  const ar = data.itinerary_ar ?? "";
  const arStart = ar.split(/\r?\n/).findIndex((l: string) => /الميزانية/.test(l));
  console.log("\n=== BUDGET SECTION (Arabic, first lines) ===");
  console.log(arStart === -1 ? "(not found)" : ar.split(/\r?\n/).slice(arStart, arStart + 7).filter(Boolean).join("\n"));

  console.log(`\nReference ${data.reference}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
