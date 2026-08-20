// One end-to-end draft per country, to prove the pipeline is not Saudi-shaped.
//
// This started as test-turkey-draft.ts. Turkey passing proved the country
// work in one place; it did not prove the pattern generalises, and the four
// countries added after it have thinner grounding, which is exactly where a
// model starts inventing. So the case moved into a table and the checks that
// matter - no Saudi chain, no Saudi permit platform, the country's own map
// searches, the hotels and sights we actually hold - run for all of them.
//
//   npx tsx --env-file=.env.local scripts/test-country-draft.ts georgia
//
// Multi-stop on purpose: it exercises the stop mapping, the transitions and
// the per-city grounding at once, and a second stop is where a model that
// has run out of real places will reach for a plausible-sounding one.

import { generateDraftGuide } from "../app/draft-guide";
import { createSupabaseAdminClient } from "../app/supabase-admin";
import { applyPaywall } from "../app/journey/paywall";
import { placeNamesForCity, officialUrlMapForCity, placeCityMapForCity } from "../app/journey/place-links";
import { nightsBetween, daysFromNights, planFee } from "../app/journey/pricing";
import { dayNumberFromLine } from "../app/journey/parse-itinerary";
import type { PlanStop } from "../app/journey/plan-stops";

type Case = {
  countryName: string;
  stops: [string, string];
  stopNights: [number, number];
  from: string;
  to: string;
  notes: string;
  // A place we hold in each category, to prove the grounding reached the
  // draft rather than the model writing from memory.
  hotels: RegExp;
  sights: RegExp;
  // The lower-cased key a map search should be built from, and the label it
  // should carry.
  mapKey: string;
  mapLabel: string;
  // A place in the first stop that has its own verified site.
  siteKey: string;
};

const CASES: Record<string, Case> = {
  turkey: {
    countryName: "Türkiye",
    stops: ["istanbul", "cappadocia"],
    stopNights: [5, 3],
    from: "2026-10-04",
    to: "2026-10-12",
    notes: "First visit to Türkiye. Keen on a balloon flight in Cappadocia.",
    hotels: /Four Seasons|Kempinski|Pera Palace|Novotel|ibis|Museum Hotel|Argos|Sultan Cave/,
    sights: /Hagia Sophia|Topkapi|Göreme|Uçhisar|Blue Mosque/,
    mapKey: "hagia sophia",
    mapLabel: "Istanbul, Türkiye",
    siteKey: "pera palace hotel",
  },
  georgia: {
    countryName: "Georgia",
    stops: ["tbilisi", "kazbegi"],
    stopNights: [4, 2],
    from: "2026-09-12",
    to: "2026-09-18",
    notes: "First visit to Georgia. Want a day in the mountains and the sulphur baths.",
    hotels: /Stamba|Rooms Hotel/,
    sights: /Narikala|Gergeti|Abanotubani|Rustaveli|Military Highway/,
    mapKey: "narikala fortress",
    mapLabel: "Tbilisi, Georgia",
    siteKey: "stamba hotel",
  },
  thailand: {
    countryName: "Thailand",
    stops: ["bangkok", "chiang-mai"],
    stopNights: [4, 3],
    from: "2026-11-08",
    to: "2026-11-15",
    notes: "First visit to Thailand. Halal food matters to us and we want the temples.",
    hotels: /Mandarin Oriental|Peninsula|The Siam|Four Seasons|137 Pillars/,
    sights: /Grand Palace|Wat Pho|Doi Suthep|Chatuchak|Jim Thompson/,
    mapKey: "wat pho",
    mapLabel: "Bangkok, Thailand",
    siteKey: "the siam",
  },
  malaysia: {
    countryName: "Malaysia",
    stops: ["kuala-lumpur", "langkawi"],
    stopNights: [3, 4],
    from: "2026-12-05",
    to: "2026-12-12",
    notes: "Family trip. City first, then the beach. Halal dining throughout.",
    hotels: /Mandarin Oriental|Ritz-Carlton|The Datai/,
    sights: /Petronas|Batu Caves|Merdeka|SkyCab|Kilim/,
    mapKey: "batu caves",
    mapLabel: "Kuala Lumpur, Malaysia",
    siteKey: "mandarin oriental, kuala lumpur",
  },
  russia: {
    countryName: "Russia",
    stops: ["moscow", "saint-petersburg"],
    stopNights: [4, 4],
    from: "2026-06-20",
    to: "2026-06-28",
    notes: "First visit to Russia. Interested in the museums and the white nights.",
    hotels: /Metropol|Astoria/,
    sights: /Red Square|Kremlin|Hermitage|Peterhof|Nevsky/,
    mapKey: "red square & the kremlin",
    mapLabel: "Moscow, Russia",
    siteKey: "hotel metropol moscow",
  },
};

const countrySlug = (process.argv[2] ?? "").toLowerCase();
const testCase = CASES[countrySlug];
if (!testCase) {
  console.error(`Usage: npx tsx --env-file=.env.local scripts/test-country-draft.ts <${Object.keys(CASES).join("|")}>`);
  process.exit(1);
}

const submissionId = `${countrySlug}-${Date.now()}`;
const TEST_NAME = `${testCase.countryName} Test ${submissionId}`;

if (!process.env.RESEND_API_KEY) {
  process.env.RESEND_API_KEY = "local-test-placeholder-no-email-will-send";
  console.log("RESEND_API_KEY is empty locally, using a placeholder. No email will send.\n");
}

const daysIn = (text: string) =>
  [...new Set(text.split(/\r?\n/).map(dayNumberFromLine).filter((n): n is number => n !== null))].sort((a, b) => a - b);

async function main() {
  const c = testCase;
  const nights = nightsBetween(c.from, c.to);
  const totalDays = daysFromNights(nights);
  console.log(`${c.stops[0]} ${c.stopNights[0]} nights then ${c.stops[1]} ${c.stopNights[1]}, ${nights} nights / ${totalDays} days`);
  console.log(`Fee at the standard rate: SAR ${planFee(nights, 2)}\n`);

  const started = Date.now();
  await generateDraftGuide({
    submissionId,
    city: c.stops[0],
    countrySlug,
    countryName: c.countryName,
    stops: [...c.stops],
    stopPurposes: ["leisure", "leisure"],
    stopNights: [...c.stopNights],
    stopNightsChosen: true,
    purpose: "leisure",
    travellers: "couple",
    travellerCount: "2",
    fromDate: c.from,
    toDate: c.to,
    transport: ["flights", "private-driver"],
    stays: ["hotel"],
    stayRating: "4",
    departureCity: "Riyadh",
    flightTiming: "any",
    planIncludes: ["attractions", "restaurants"],
    packageNotes: c.notes,
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
  const secondStopDay = c.stopNights[0] + 1;

  const checks: [string, unknown, unknown][] = [
    ["a plan was written at all", !!data.reference, true],
    ["English draft present", en.length > 500, true],
    ["Arabic draft present", ar.length > 500, true],
    ["every day is there", daysIn(en).length, totalDays],
    ["Arabic goes the distance too", daysIn(ar).includes(totalDays), true],
    ["the stop mapping came from the form", JSON.stringify(stops?.map((s) => s.firstDay)), `[1,${secondStopDay}]`],

    // The point of the country work: no Saudi should appear anywhere.
    ["no Saudi chain is recommended", /Al Baik|Al Romansiah|Shawarmer|Herfy|Al Tazaj|Kudu/.test(en), false],
    ["no Saudi permit platform is offered", /Nusuk|Haramain/.test(en), false],
    ["the plan does not think it is in Saudi Arabia", /Saudi Arabia/.test(en), false],

    // Grounding actually reached the draft.
    ["it uses the hotels we hold", c.hotels.test(en), true],
    ["it uses the sights we hold", c.sights.test(en), true],
    ["places from both stops are linkable", linked.length > 5, true],
    ["a place gets its own country's map search", placeCityMapForCity(data.city)[c.mapKey], c.mapLabel],
    ["a hotel carries its own site", !!urls[c.siteKey], true],

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
  if (pass !== checks.length) process.exit(1);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
