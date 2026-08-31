// The apps and platforms a plan names must be links, and must not eat ordinary
// words on the way.
//
// A Langkawi plan told the reader that Klook and GetYourGuide sell the same
// charter, that Agoda showed 9.1 from 1,588 reviews, and to book a Grab to the
// airport. Every one of those was dead text: the only platform list we held was
// Nusuk and the Haramain railway, gated to Saudi Arabia.
//
// The catch is that this same list is what the paywall redacts, so a name that
// is also an ordinary word does double damage - a wrong link on a paid plan and
// a blurred everyday word in the free preview somebody is deciding on. Half of
// this file is therefore about what must NOT match: "grab lunch", "a bolt of
// silk", "رمضان كريم", "hire a kayak".

import { placeNamesForCity, officialUrlMapForCity, placeMatchPattern } from "../app/journey/place-links";
import { redactPlaceNames, REDACTION_PATTERN } from "../app/journey/paywall";
import { parsePickNames } from "../app/journey/plan-stops";

const enNames = placeNamesForCity("Langkawi", false);
const arNames = placeNamesForCity("Langkawi", true);

const hits = (text: string, names: string[]) => {
  const pattern = placeMatchPattern(names);
  return pattern ? [...text.matchAll(pattern)].map((m) => m[1]) : [];
};
/** How many of the city's linkable names this sentence contains. */
const found = (text: string, ar = false) => hits(text, ar ? arNames : enNames);

const urls = officialUrlMapForCity("Langkawi");

const cases: [string, unknown, unknown][] = [
  // ---- Reach: the whole point. These are not Saudi platforms. ----
  ["Klook is linkable in Malaysia", enNames.includes("Klook"), true],
  ["and in Turkey", placeNamesForCity("Istanbul", false).includes("Klook"), true],
  ["and in Saudi Arabia", placeNamesForCity("Riyadh", false).includes("Klook"), true],
  ["and in a city we hold no guide for at all", placeNamesForCity("Nowhere We Have Written Up", false).includes("Agoda"), true],
  ["the Saudi-only chains stay Saudi-only", placeNamesForCity("Istanbul", false).includes("Al Baik"), false],
  ["so does the Saudi permit platform", placeNamesForCity("Istanbul", false).includes("Nusuk"), false],
  ["Klook links to its own site, not a map search", urls["klook"], "https://www.klook.com/"],
  ["the Arabic spelling reaches the same site", urls["كلوك"], "https://www.klook.com/"],
  ["Bolt goes to bolt.eu, not the fintech at bolt.com", urls["bolt app"], "https://bolt.eu"],

  // ---- The names we deliberately refused ----
  ["bare Grab is not linkable", enNames.includes("Grab"), false],
  ["bare Booking is not linkable", enNames.includes("Booking"), false],
  ["bare Trip is not linkable", enNames.includes("Trip"), false],
  ["Kayak is not linkable at all", enNames.includes("Kayak"), false],
  ["bare كريم is not linkable", arNames.includes("كريم"), false],
  ["nor المسافر", arNames.includes("المسافر"), false],
  ["nor غراب", arNames.includes("غراب"), false],

  // ---- Ordinary words that must survive, English ----
  ["\"the macaques will grab loose items\" is untouched", found("The macaques will grab loose items, so keep bags closed.").length, 0],
  ["\"Grab lunch at Al Baik\" is untouched", found("Grab lunch at Al Baik near the museum.").length, 0],
  ["\"a bolt of silk in the souq\" is untouched", found("a bolt of silk in the souq").length, 0],
  ["\"hire a kayak\" is untouched", found("hire a kayak on the mangrove tour").length, 0],
  ["\"ahead of booking\" is untouched", found("Check the entry requirements well ahead of booking.").length, 0],
  ["\"an easy day trip\" is untouched", found("an easy day trip. Compare fares first.").length, 0],
  ["\"head out early\" is untouched", found("head out early to beat the heat").length, 0],
  ["\"Small Luxury Hotels of the World\" is untouched", found("a member of Small Luxury Hotels of the World").length, 0],
  ["our own \"Discover Saudi Arabia\" is untouched", found("Discover Saudi Arabia, for leisure or pilgrimage.").length, 0],

  // ---- The same words as brands, which must match ----
  ["Klook and GetYourGuide both match", found("Klook and GetYourGuide sell the same 8-hour charter.").length, 2],
  ["GrabCar matches", found("Order a GrabCar to the jetty, about RM 25.").join(), "GrabCar"],
  ["the Grab app matches", found("The Grab app is how you move around Kuala Lumpur.").join(), "Grab app"],
  ["Booking.com matches, dotted", found("rated 8.8 on Booking.com from 3,383 reviews").join(), "Booking.com"],
  ["Trip.com matches, dotted", found("listed as halal on Trip.com and rated 4.3").join(), "Trip.com"],
  ["Headout matches", found("Headout sells the skip-the-line ticket.").join(), "Headout"],
  ["Skyscanner matches", found("Compare fares on Skyscanner before you commit.").join(), "Skyscanner"],

  // ---- Arabic: the words that must survive ----
  ["\"رمضان كريم\" is untouched", found("رمضان كريم وكل عام وأنتم بخير", true).length, 0],
  ["\"مضيف كريم\" is untouched", found("مضيف كريم ومطعم ممتاز", true).length, 0],
  ["a crow stays a crow", found("مشاهدة غراب فوق الأشجار", true).length, 0],
  ["\"جولة كاياك\" is untouched", found("جولة كاياك بين أشجار المانجروف", true).length, 0],
  ["\"من أجود الفنادق\" is untouched", found("من أجود الفنادق في المدينة", true).length, 0],
  ["the opera house is untouched", found("زيارة دار الأوبرا مساءً", true).length, 0],
  ["كلوك does not fire inside سلوك", found("سلوك المسافرين في المطار", true).length, 0],

  // ---- Arabic: the brands that must match ----
  ["تطبيق كريم matches", found("احجز عبر تطبيق كريم إلى المطار", true).join(), "تطبيق كريم"],
  ["تطبيق غراب matches", found("تطبيق غراب هو وسيلة التنقل داخل المدينة", true).join(), "تطبيق غراب"],
  ["أجودا matches", found("يعرض أجودا متوسط 9.1 من 1,588 مراجعة", true).join(), "أجودا"],
  ["أوبر matches", found("استخدم أوبر من المطار", true).join(), "أوبر"],
  // The main coverage win: our own Arabic drafts write these brands in Latin,
  // with the Arabic و glued straight onto the front of the second one.
  ["Latin brands match inside Arabic prose, proclitic and all", found("ويبيع Klook وGetYourGuide النمط نفسه من التأجير", true).length, 2],

  // ---- The paywall reads from this same list ----
  ["a platform is withheld on an unpaid plan", redactPlaceNames("Klook and GetYourGuide sell the same charter.", enNames).includes("Klook"), false],
  ["so is Agoda", redactPlaceNames("Agoda shows an average of 9.1.", enNames).includes("Agoda"), false],
  ["and something was actually redacted", REDACTION_PATTERN.test(redactPlaceNames("Book on Klook.", enNames)), true],
  ["but the verb survives redaction", redactPlaceNames("The macaques will grab loose items.", enNames).includes("will grab loose items"), true],
  ["and so does رمضان كريم", redactPlaceNames("رمضان كريم في لنكاوي", arNames).includes("رمضان كريم"), true],
  ["nothing linkable is left in a redacted preview", hits(redactPlaceNames("Klook and GetYourGuide sell the same charter, and Agoda shows 9.1.", enNames), enNames).length, 0],

  // ---- The two boundary bugs this change also fixed ----
  // A diacritic is a mark, not a letter, so the trailing boundary walked past
  // it and matched a name inside a longer word.
  ["a name does not match inside a vowelled word", hits("أعمار المسافرَين الأصغر", ["المسافر"]).length, 0],
  ["nor does نسك inside نسكَن", hits("نسكَن في الفندق", ["نسك"]).length, 0],
  ["and the unvowelled case still behaves", hits("أعمار المسافرين الأصغر", ["المسافر"]).length, 0],
  ["a standalone name still matches", hits("المسافر يصل", ["المسافر"]).join(), "المسافر"],
  // Only the first PICKS line used to be read, so a model that wrapped its
  // list lost everything after the first line, silently.
  ["a wrapped PICKS list keeps every entry", parsePickNames("PICKS: Alpha Hotel = ألفا = hotel\nPICKS: Gamma Tours = جاما = tour operator").includes("Gamma Tours"), true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed  ·  ${enNames.length} linkable names in Langkawi, ${Object.keys(urls).length} with their own site`);
if (pass !== cases.length) process.exit(1);
