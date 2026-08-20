// The goal in one script: design a plan for a city in Türkiye and have the
// AI deliver, with no Saudi assumptions leaking in.
//
// Multi-stop on purpose, Istanbul then Cappadocia, since that is the trip
// most people actually take and it exercises the stop mapping, the
// transitions and the per-city grounding at once.
//
//   npx tsx --env-file=.env.local scripts/test-turkey-draft.ts

import { generateDraftGuide } from "../app/draft-guide";
import { createSupabaseAdminClient } from "../app/supabase-admin";
import { applyPaywall } from "../app/journey/paywall";
import { placeNamesForCity, officialUrlMapForCity, placeCityMapForCity } from "../app/journey/place-links";
import { nightsBetween, daysFromNights, planFee } from "../app/journey/pricing";
import { dayNumberFromLine } from "../app/journey/parse-itinerary";
import type { PlanStop } from "../app/journey/plan-stops";

const submissionId = `turkey-${Date.now()}`;
const TEST_NAME = `Turkey Test ${submissionId}`;
const FROM = "2026-10-04";
const TO = "2026-10-12"; // 8 nights
const STOP_NIGHTS = [5, 3];

if (!process.env.RESEND_API_KEY) {
  process.env.RESEND_API_KEY = "local-test-placeholder-no-email-will-send";
  console.log("RESEND_API_KEY is empty locally, using a placeholder. No email will send.\n");
}

const daysIn = (text: string) =>
  [...new Set(text.split(/\r?\n/).map(dayNumberFromLine).filter((n): n is number => n !== null))].sort((a, b) => a - b);

async function main() {
  const nights = nightsBetween(FROM, TO);
  const totalDays = daysFromNights(nights);
  console.log(`Istanbul ${STOP_NIGHTS[0]} nights then Cappadocia ${STOP_NIGHTS[1]}, ${nights} nights / ${totalDays} days`);
  console.log(`Fee at the standard rate: SAR ${planFee(nights, 2)}\n`);

  const started = Date.now();
  await generateDraftGuide({
    submissionId,
    city: "istanbul",
    countrySlug: "turkey",
    countryName: "Türkiye",
    stops: ["istanbul", "cappadocia"],
    stopPurposes: ["leisure", "leisure"],
    stopNights: STOP_NIGHTS,
    stopNightsChosen: true,
    purpose: "leisure",
    travellers: "couple",
    travellerCount: "2",
    fromDate: FROM,
    toDate: TO,
    transport: ["flights", "private-driver"],
    stays: ["hotel"],
    stayRating: "4",
    departureCity: "Riyadh",
    flightTiming: "any",
    planIncludes: ["attractions", "restaurants"],
    packageNotes: "First visit to Türkiye. Keen on a balloon flight in Cappadocia.",
    currency: "SAR",
    budget: "30000",
    name: TEST_NAME,
    email: "mixedhopes2022@gmail.com",
    phone: "+966500000000",
  });
  console.log(`\nFinished in ${Math.round((Date.now() - started) / 1000)}s\n`);

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("proposals")
    .select("reference, city, itinerary_en, itinerary_ar, notes, stops")
    .eq("customer_name", TEST_NAME)
    .maybeSingle();

  if (!data) {
    console.error(`FAIL  no proposal written for ${TEST_NAME}. The draft never completed; see above.`);
    process.exit(1);
  }

  const en = data.itinerary_en ?? "";
  const ar = data.itinerary_ar ?? "";
  const stops = data.stops as PlanStop[] | null;
  const names = placeNamesForCity(data.city, false);
  const urls = officialUrlMapForCity(data.city);
  const linked = names.filter((n) => en.includes(n));
  const paywalled = applyPaywall(en, stops, totalDays);

  const checks: [string, unknown, unknown][] = [
    ["a Turkish plan was written at all", !!data.reference, true],
    ["English draft present", en.length > 500, true],
    ["Arabic draft present", ar.length > 500, true],
    ["every day is there", daysIn(en).length, totalDays],
    ["Arabic goes the distance too", daysIn(ar).includes(totalDays), true],
    ["the stop mapping came from the form", JSON.stringify(stops?.map((s) => s.firstDay)), "[1,6]"],

    // The point of the country work: no Saudi should appear anywhere.
    ["no Saudi chain is recommended", /Al Baik|Al Romansiah|Shawarmer|Herfy/.test(en), false],
    ["no Saudi permit platform is offered", /Nusuk|Haramain/.test(en), false],
    ["the plan does not think Türkiye is Saudi Arabia", /Saudi Arabia/.test(en), false],

    // Grounding actually reached the draft.
    ["it uses the hotels we hold", /Four Seasons|Kempinski|Pera Palace|Novotel|ibis|Museum Hotel|Argos|Sultan Cave/.test(en), true],
    ["it uses the sights we hold", /Hagia Sophia|Topkapi|Göreme|Uçhisar|Blue Mosque/.test(en), true],
    ["places from both stops are linkable", linked.length > 6, true],
    ["a Turkish place gets a Turkish map search", placeCityMapForCity(data.city)["hagia sophia"], "Istanbul, Türkiye"],
    ["a Turkish hotel carries its own site", !!urls["pera palace hotel"], true],

    // Paywall behaves the same as it does for Saudi.
    ["the paywall withholds the rest", paywalled.lockedDays.length, totalDays - 2],
  ];

  let pass = 0;
  console.log("--- checks ---");
  for (const [name, got, want] of checks) {
    const ok = got === want;
    if (ok) pass++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
  }
  console.log(`\n${pass}/${checks.length} passed`);
  console.log(`linked place names in the draft: ${linked.length} (${linked.slice(0, 8).join(", ")})`);
  console.log(`\nReference ${data.reference}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
