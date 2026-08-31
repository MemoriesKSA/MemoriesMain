// A free preview must not hand a search engine the answer.
//
// Hiding the name was not enough. Beside one blurred hotel the preview still
// read "a member of Small Luxury Hotels of the World, listed as a 5.0-star
// property, with a spa, gym and a children's club, 9.1 from 1,588 reviews".
// Pasted into a search engine that returns the property, first result.
//
// Two things do that work: a named collection is a membership list anyone can
// read down, and an exact review count is close to a unique key. Both are
// blunted. Everything else - the prices, the distances, the star rating, the
// halal guidance, every reason - has to survive, because that is what shows
// the work is real.
//
// The second half of this file is the pill width, which was its own giveaway:
// the bar drawn over a hidden name used to be exactly as long as the name.

import { generaliseSearchKeys, redactPlaceNames, REDACTION_PATTERN } from "../app/journey/paywall";

const g = generaliseSearchKeys;
/** The width of every pill this text would render. */
const widths = (text: string) => [...text.matchAll(REDACTION_PATTERN)].map((m) => Number(m[1]));

const real =
  "The Danna, a member of Small Luxury Hotels of the World and listed by Expedia as a 5.0-star property, " +
  "with a spa, gym and a children's club. Agoda shows an average of 9.1 from 1,588 reviews, with rates " +
  "quoted from about US$356++ a night, roughly 32 km from the airport.";
const generalised = g(real);

const cases: [string, unknown, unknown][] = [
  // ---- The membership list ----
  ["the collection is no longer named", generalised.includes("Small Luxury Hotels"), false],
  ["but the claim survives", generalised.includes("a member of a recognised international hotel association"), true],
  ["Leading Hotels goes too", g("one of The Leading Hotels of the World").includes("Leading Hotels"), false],
  ["so does Relais & Châteaux", g("a Relais & Châteaux property").includes("Relais"), false],
  ["and Forbes Five-Star", g("holds a Forbes Travel Guide Five-Star rating").includes("Forbes"), false],
  ["a Michelin count becomes a distinction", g("it holds two Michelin stars"), "it holds a Michelin distinction"],
  ["the Arabic collection phrase too", g("عضو في مجموعة Small Luxury Hotels of the World").includes("Small Luxury"), false],
  ["and the Arabic Michelin count", g("ويحمل نجمتَي ميشلان").includes("نجمتَي"), false],

  // ---- The review count ----
  ["the exact count is gone", generalised.includes("1,588"), false],
  ["rounded down, and said so", generalised.includes("more than 1,500 reviews"), true],
  ["a smaller count rounds to hundreds", g("3,383 verified reviews").includes("more than 3,000"), true],
  ["Arabic counts round too", g("من 1,588 مراجعة").includes("أكثر من 1,500"), true],
  ["and read as Arabic, not English", g("من 1,588 مراجعة").includes("more than"), false],
  ["a count below 100 is left alone", g("12 reviews"), "12 reviews"],
  ["an already-round count is left alone", g("2,000 reviews"), "2,000 reviews"],

  // ---- What must survive, or the preview stops being worth reading ----
  ["the star rating survives", generalised.includes("5.0-star"), true],
  ["the score survives", generalised.includes("9.1"), true],
  ["the price survives exactly", generalised.includes("US$356++"), true],
  ["the distance survives exactly", generalised.includes("32 km"), true],
  ["the amenities survive", generalised.includes("spa, gym and a children's club"), true],
  ["a room rate is not a review count", g("rooms from 1,588 SAR a night").includes("more than"), false],
  ["a year is not a review count", g("operating since 1978").includes("more than"), false],
  ["prayer guidance is untouched", g("the qibla is marked and prayer mats are in the wardrobe"), "the qibla is marked and prayer mats are in the wardrobe"],
  ["empty text is safe", g(""), ""],

  // ---- The pill width ----
  // The width is taken from the pill's position in the text, never from the
  // name. Bucketing by length was the first attempt and scarcity defeated it:
  // the widest bucket held exactly one name on a real page.
  ["a short name and a long one can share a width", widths(redactPlaceNames("Sixt then Sixt", ["Sixt"]))[0] === widths(redactPlaceNames("The Ritz-Carlton, Kuala Lumpur", ["The Ritz-Carlton, Kuala Lumpur"]))[0], true],
  ["one name gets different widths in one text", new Set(widths(redactPlaceNames("Sixt, then Sixt, then Sixt, then Sixt, then Sixt", ["Sixt"]))).size > 1, true],
  ["the width never equals the name's length", ["Rosewood Jeddah", "Radisson Hotel Jeddah Tahlia"].some((n) => widths(redactPlaceNames(`x ${n} y`, [n]))[0] === n.length), false],
  ["a pill can be narrower than what it hides, which is the point", widths(redactPlaceNames("x The Ritz-Carlton, Kuala Lumpur y", ["The Ritz-Carlton, Kuala Lumpur"]))[0] < "The Ritz-Carlton, Kuala Lumpur".length, true],
  ["there are only four widths in all", new Set([2, 9, 14, 22, 33, 48].map((n) => widths(redactPlaceNames("a".repeat(n) + " and " + "b".repeat(n), ["a".repeat(n), "b".repeat(n)]))).flat()).size <= 4, true],
  ["every pill still has a plausible width", widths(redactPlaceNames("Sixt and Sixt and Sixt", ["Sixt"])).every((w) => w >= 12 && w <= 34), true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);
