// Runs the real drafting pipeline against the heaviest trip the planner
// will accept: three stops over sixteen nights, which is a seventeen-day
// itinerary in two languages. The twelve-day single-city plan that came
// back truncated was smaller than this in every dimension.
//
// This is not a mock. It spends real tokens, writes a real draft proposal
// and sends the internal review email, which is the point: the failure
// being tested only appears in the real pipeline.
//
//   npx tsx --env-file=.env.local scripts/test-long-draft.ts

import { generateDraftGuide } from "../app/draft-guide";
import { createSupabaseAdminClient } from "../app/supabase-admin";
import { parseStopMarkers, freeDayNumbers, stopsFromNights } from "../app/journey/plan-stops";
import { applyPaywall } from "../app/journey/paywall";
import { planFee, nightsBetween, daysFromNights } from "../app/journey/pricing";
import { dayNumberFromLine } from "../app/journey/parse-itinerary";

const submissionId = `longtrip-${Date.now()}`;
const TEST_NAME = `Long Trip Test ${submissionId}`;
const FROM = "2026-11-02";
const TO = "2026-11-18"; // 16 nights, 17 days
const STOP_NIGHTS = [6, 6, 4];

// The pipeline refuses to start without a Resend key, and .env.local carries
// an empty one: the real key lives in Vercel, which is why production sends
// email and a local run cannot. The draft, the translation and the proposal
// all happen before the email, so a placeholder lets the part being tested
// run. The send then fails and logs, which is the correct outcome locally.
if (!process.env.RESEND_API_KEY) {
  process.env.RESEND_API_KEY = "local-test-placeholder-no-email-will-send";
  console.log("RESEND_API_KEY is empty locally, using a placeholder. The internal email will not send.\n");
}

function daysPresent(text: string): number[] {
  return [...new Set(text.split(/\r?\n/).map(dayNumberFromLine).filter((n): n is number => n !== null))].sort((a, b) => a - b);
}

async function main() {
  const nights = nightsBetween(FROM, TO);
  const totalDays = daysFromNights(nights);
  console.log(`Trip: ${FROM} to ${TO} = ${nights} nights / ${totalDays} days across 3 stops`);
  console.log(`Split: Riyadh ${STOP_NIGHTS[0]}, Jeddah ${STOP_NIGHTS[1]}, AlUla ${STOP_NIGHTS[2]}`);
  console.log(`Expected fee: SAR ${planFee(nights, 3)}`);
  console.log(`Expected stop start days: ${JSON.stringify(stopsFromNights(["Riyadh", "Jeddah", "AlUla"], STOP_NIGHTS)?.map((s) => s.firstDay))}\n`);

  const started = Date.now();
  await generateDraftGuide({
    submissionId,
    city: "riyadh",
    stops: ["riyadh", "jeddah", "alula"],
    stopPurposes: ["leisure", "leisure", "leisure"],
    stopNights: STOP_NIGHTS,
    stopNightsChosen: true,
    purpose: "leisure",
    travellers: "family",
    travellerCount: "4",
    fromDate: FROM,
    toDate: TO,
    transport: ["flights", "private-driver"],
    stays: ["hotel"],
    stayRating: "4",
    departureCity: "Dubai",
    flightTiming: "daytime",
    planIncludes: ["attractions", "restaurants", "experiences"],
    packageNotes: "Two adults and two children aged 9 and 12. One of the children is vegetarian.",
    currency: "SAR",
    budget: "60000",
    name: TEST_NAME,
    email: "mixedhopes2022@gmail.com",
    phone: "+966500000000",
  });
  console.log(`\nDraft pipeline finished in ${Math.round((Date.now() - started) / 1000)}s\n`);

  const supabase = createSupabaseAdminClient();
  // Matched on this run's own name. Reading "the newest proposal" instead
  // meant that when the pipeline bailed early, the checks silently graded
  // the previous customer's plan and reported its faults as this run's.
  const { data } = await supabase
    .from("proposals")
    .select("id, reference, itinerary_en, itinerary_ar, notes, stops, from_date, to_date")
    .eq("customer_name", TEST_NAME)
    .maybeSingle();

  if (!data) {
    console.error(`FAIL  no proposal was written for ${TEST_NAME}, so the draft never completed. Look above for why.`);
    process.exit(1);
  }

  const en = data.itinerary_en ?? "";
  const ar = data.itinerary_ar ?? "";
  const enDays = daysPresent(en);
  const arDays = daysPresent(ar);
  const markers = parseStopMarkers(data.notes ?? "");
  const stored = data.stops as { label: string; firstDay: number }[] | null;
  const paywalled = applyPaywall(en, stored, totalDays);

  const checks: [string, boolean, string][] = [
    ["proposal written", !!data.reference, `reference ${data.reference}`],
    ["English draft present", en.length > 500, `${en.length} chars`],
    ["Arabic draft present", ar.length > 500, `${ar.length} chars`],
    // The exact failure being retested: Arabic stopped at day 11 of 12.
    ["Arabic reaches the final day", arDays.includes(totalDays), `Arabic days: ${arDays.join(",")}`],
    ["English reaches the final day", enDays.includes(totalDays), `English days: ${enDays.join(",")}`],
    ["Arabic has as many days as English", arDays.length === enDays.length, `${arDays.length} vs ${enDays.length}`],
    ["no day is missing in English", enDays.length === totalDays, `${enDays.length} of ${totalDays}`],
    ["Arabic does not end mid-sentence", /[.!؟。؟]$|[ء-ي]$/.test(ar.trim().slice(-1)) || ar.trim().endsWith("."), `ends: ${JSON.stringify(ar.trim().slice(-40))}`],
    ["stop mapping stored", !!stored?.length, JSON.stringify(stored)],
    ["stop mapping came from the form", JSON.stringify(stored?.map((s) => s.firstDay)) === "[1,7,13]", `got ${JSON.stringify(stored?.map((s) => s.firstDay))}`],
    ["free days are each stop's first", JSON.stringify(freeDayNumbers(stored, totalDays)) === "[1,7,13]", JSON.stringify(freeDayNumbers(stored, totalDays))],
    ["paywall withholds most of the plan", paywalled.lockedDays.length === totalDays - 3, `${paywalled.lockedDays.length} locked of ${totalDays}`],
    ["model's own STOPS line agrees", JSON.stringify(markers?.map((s) => s.firstDay)) === "[1,7,13]", `model said ${JSON.stringify(markers?.map((s) => s.firstDay))}`],
  ];

  let pass = 0;
  console.log("--- checks ---");
  for (const [name, ok, detail] of checks) {
    if (ok) pass++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  (${detail})`}`);
  }
  console.log(`\n${pass}/${checks.length} passed`);
  console.log(`\nReview at /internal/journeys  ·  reference ${data.reference}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
