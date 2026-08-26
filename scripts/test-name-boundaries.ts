// A Riyadh plan linked the rental company National inside the word
// "international", twice in one sentence:
//
//   "Alamo (inter[national] rental chain) has a desk at King Khalid
//    Inter[national] Terminal 5"
//
// The linkifier matched a name anywhere in a line, with no word boundary at
// all. Arabic had it worse, because the definite article makes short names
// common inside longer words: "جديرة" (worth knowing) came out as "ج[ديرة]",
// linking Deira inside an ordinary adjective.
//
// The same list drives the paywall, so the bug had a second, uglier form. A
// stray link is embarrassing; a redaction that eats half a real word corrupts
// the plan somebody is deciding whether to buy.
//
// Both now go through one pattern, so they cannot disagree about where a name
// begins.

import { placeMatchPattern, mapsSearchUrl } from "../app/journey/place-links";
import { parseNameKinds } from "../app/journey/plan-stops";
import { redactPlaceNames } from "../app/journey/paywall";

const linked = (text: string, names: string[]): string[] => {
  const pattern = placeMatchPattern(names);
  if (!pattern) return [];
  return [...text.matchAll(pattern)].map((m) => m[1]);
};

// The exact sentence from the Riyadh draft.
const riyadh = "Alamo (international rental chain) has a desk at King Khalid International Terminal 5, and National also operates airport branches.";
const rentals = ["National", "Alamo", "Terminal 5"].sort((a, b) => b.length - a.length);

// The exact phrase from the Arabic Dubai draft.
const arabic = "أمور عملية جديرة بالمعرفة، والعشاء في ديرة قريب.";
const arabicNames = ["ديرة"];

// Arabic attaches و ف ب ك ل to the front of a word; that must still match.
const withProclitic = linked("سنذهب وديرة ثم نعود", arabicNames);

const redacted = redactPlaceNames("Alamo is an international chain near Deira.", ["National", "Deira"]);
const redactedAr = redactPlaceNames("أمور جديرة بالمعرفة في ديرة", ["ديرة"]);

const cases: [string, unknown, unknown][] = [
  // The reported bug.
  ["\"National\" is not matched inside \"international\"", linked(riyadh, rentals).filter((m) => m.toLowerCase() === "national").length, 1],
  ["and the standalone National still is", linked(riyadh, rentals).includes("National"), true],
  ["Alamo at the start of a line matches", linked(riyadh, rentals).includes("Alamo"), true],
  ["a name with a digit still matches", linked(riyadh, rentals).includes("Terminal 5"), true],
  ["nothing is matched twice by accident", linked(riyadh, rentals).length, 3],

  // Arabic, where it read worse.
  ["\"ديرة\" is not matched inside \"جديرة\"", linked(arabic, arabicNames).length, 1],
  ["and the real ديرة still is", linked(arabic, arabicNames)[0], "ديرة"],
  ["a leading و does not block the match", withProclitic.length, 1],

  // The paywall, driven by the same list.
  ["redaction leaves \"international\" intact", redacted.includes("international"), true],
  ["and still redacts the real name", /⟦R:\d+⟧/.test(redacted), true],
  ["Arabic redaction leaves \"جديرة\" intact", redactedAr.includes("جديرة"), true],
  ["and still redacts the real ديرة", (redactedAr.match(/⟦R:\d+⟧/g) ?? []).length, 1],

  // Ordinary behaviour must survive the change.
  ["a name in the middle of prose matches", linked("dinner at Ravi's tonight", ["Ravi's"]).length, 1],
  ["a name followed by punctuation matches", linked("go to Deira, then home", ["Deira"]).length, 1],
  ["a possessive does not break the match", linked("Zuma's terrace", ["Zuma"]).length, 1],
  ["a name that is not present matches nothing", linked("nothing here", ["Atlantis"]).length, 0],
  ["an empty name list yields no pattern", placeMatchPattern([]), null],
  ["a list of empty strings yields no pattern", placeMatchPattern(["", ""]), null],
  ["regex characters in a name are escaped, not interpreted", linked("dinner at 3Fils (harbour)", ["3Fils (harbour)"]).length, 1],
  ["matching is case-insensitive, since prose capitalises freely", linked("ALAMO desk", ["Alamo"]).length, 1],
];

// A map search for a bare name is a guess, and Maps resolves the guess
// differently for every reader. One Riyadh plan's "National" link opened the
// National Museum on a laptop, an oil-change shop when the Arabic name was
// searched on another, and the actual car rental desk on a phone: one link,
// three answers, because ranking is personalised.
//
// So each marker entry now carries what the thing is, and that rides into the
// query behind the name.
const notes = [
  "PICKS: National = ناشيونال = car rental | Alamo = ألامو = car rental | Dubai Taxi Company = شركة تاكسي دبي = taxi company | Al Mallah = الملاح = restaurant",
  "PLACES: Terminal 5 = صالة 5 = airport terminal | Olaya = العليا = district",
].join("\n");
const kinds = parseNameKinds(notes);

const q = (url: string) => decodeURIComponent(new URL(url).searchParams.get("query") ?? "");

const kindCases: [string, unknown, unknown][] = [
  ["the kind is read off the entry", kinds["national"], "car rental"],
  ["and reaches the Arabic name too", kinds["ناشيونال"], "car rental"],
  ["places carry a kind as well", kinds["olaya"], "district"],

  // The reported failure, and the query that fixes it.
  ["a bare name is no longer searched alone", q(mapsSearchUrl("National", "Riyadh", "", "car rental")), "National car rental, Riyadh"],
  ["the Arabic name gets the same qualifier", q(mapsSearchUrl("ناشيونال", "Riyadh", "", "car rental")), "ناشيونال car rental, Riyadh"],

  // Don't ask for it twice when the name already says it.
  ["a name that already contains its kind is left alone", q(mapsSearchUrl("Dubai Taxi Company", "Dubai", "", "taxi company")), "Dubai Taxi Company, Dubai"],
  ["matching there is case-insensitive", q(mapsSearchUrl("National Car Rental", "Riyadh", "", "car rental")), "National Car Rental, Riyadh"],

  // Old drafts have no kinds at all and must behave exactly as before.
  ["no kind means the old query, unchanged", q(mapsSearchUrl("Wat Pho", "Bangkok")), "Wat Pho, Bangkok"],
  ["a legacy two-field entry yields no kind", parseNameKinds("PICKS: Wat Pho = وات بو")["wat pho"], undefined],
  ["a legacy one-field entry yields no kind", parseNameKinds("PICKS: Wat Pho")["wat pho"], undefined],
  ["no markers at all is safe", Object.keys(parseNameKinds("")).length, 0],

  // The country still lands last, where an address expects it.
  ["country is appended after the city", q(mapsSearchUrl("Nara Thai", "Bangkok", "Thailand", "restaurant")), "Nara Thai restaurant, Bangkok, Thailand"],
];
cases.push(...kindCases);

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);
