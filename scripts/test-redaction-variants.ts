// The same name written shorter must be hidden too, and nothing else may be.
//
// The leak: the draft put "منتجع الدانا لنكاوي" on its PICKS line and wrote
// "في الدانا" in the sentence, so exact matching hid the marker form and left
// the hotel readable on the free preview. Same for "ريتز كارلتون كوالالمبور",
// written "ريتز كارلتون" in the prose.
//
// The danger is the cure. Carving words out of names is one step from blurring
// ordinary words, and an unpaid preview full of blurred everyday language costs
// more than the leak does. So most of this file is about what must survive:
// the destination, the map, the category words, and above all the religious and
// practical vocabulary a reader needs.

import { shortFormsToHide, type NamedThing } from "../app/journey/redaction-variants";
import { redactPlaceNames, REDACTION_PATTERN } from "../app/journey/paywall";
import { parseNamedThings, parsePickNames } from "../app/journey/plan-stops";

const forms = (named: NamedThing[], labels: string[]) =>
  shortFormsToHide(named, { tripLabels: labels }).map((h) => h.hiddenOnly);

const sell = (name: string, aliases?: string[]): NamedThing => ({ name, commercial: true, ...(aliases ? { aliases } : {}) });
const map = (name: string): NamedThing => ({ name, commercial: false });

// The real Langkawi plan, reduced to the entries that matter.
const langkawi: NamedThing[] = [
  sell("منتجع الدانا لنكاوي"),
  sell("The Danna Langkawi Resort & Beach Villas"),
  sell("ريتز كارلتون كوالالمبور"),
  sell("The Ritz-Carlton, Kuala Lumpur"),
  sell("منتجع برجايا لنكاوي"),
  map("مطار لنكاوي الدولي"),
  map("Langkawi International Airport"),
  map("Kuala Lumpur International Airport"),
];
const lk = forms(langkawi, ["Langkawi → Kuala Lumpur"]);

// A Makkah plan, where a false positive is not an embarrassment but a defect
// in front of a pilgrim.
const makkah: NamedThing[] = [
  sell("فندق دار التوحيد إنتركونتيننتال"),
  sell("مطعم زمزم بلازا"),
  sell("Zamzam Pullman Makkah"),
  map("المسجد الحرام"),
  map("جبل النور"),
];
const mk = forms(makkah, ["Makkah", "مكة"]);

const cases: [string, unknown, unknown][] = [
  // ---- The leak it exists to close ----
  ["the Ritz-Carlton short form is carved", lk.includes("ريتز كارلتون"), true],
  ["and its English one", lk.includes("Ritz-Carlton"), true],
  ["carved out of the source string, hyphen and all", lk.some((f) => f.includes("-")), true],
  ["and it actually redacts the prose that leaked", redactPlaceNames("ليلتين في ريتز كارلتون", [], [{ hiddenOnly: "ريتز كارلتون" }]).includes("ريتز كارلتون"), false],

  // ---- The destination must survive ----
  ["the trip's own city is never carved", lk.some((f) => f.includes("لنكاوي")), false],
  ["nor the second stop", lk.some((f) => f.includes("كوالالمبور")), false],
  ["nor the English city name", lk.some((f) => f.includes("Langkawi")), false],
  ["a country's other cities are safe too", forms([sell("Tbilisi Grand Palace Hotel")], ["Mtskheta"]).some((f) => f.includes("Tbilisi")), false],

  // ---- Geography the draft declared must survive ----
  ["a word from a declared airport name is protected", lk.some((f) => f === "International Airport"), false],

  // ---- Category words must survive ----
  ["\"منتجع\" is never carved", lk.some((f) => f.startsWith("منتجع")), false],
  ["\"Resort & Beach\" is not a name", lk.some((f) => /Resort|Beach|Villas/.test(f)), false],
  ["\"Old Town\" yields nothing", forms([sell("Old Town Hotel")], ["Kraków"]).length, 0],
  ["\"Grand Palace\" yields nothing", forms([sell("Grand Palace Restaurant")], ["Bangkok"]).length, 0],

  // ---- Religious and practical vocabulary must survive ----
  ["زمزم is never carved", mk.some((f) => f.includes("زمزم")), false],
  ["nor عمرة", forms([sell("مكتب العمرة الذهبي")], ["مكة"]).some((f) => f.includes("عمرة")), false],
  ["nor حلال", forms([sell("مطعم الحلال الطيب")], ["مكة"]).some((f) => f.includes("حلال")), false],
  ["nor a king's name", forms([sell("فندق الملك فهد بلازا")], ["الرياض"]).some((f) => f.includes("الملك")), false],
  ["nor the English equivalents", forms([sell("Zamzam Tower Halal Kitchen")], ["Makkah"]).length, 0],

  // ---- Single words are refused, deliberately ----
  ["\"الدانا\" alone is NOT carved by the heuristic", lk.includes("الدانا"), false],
  ["a two-word run is", forms([sell("Madam Kwan Restaurant")], ["Kuala Lumpur"]).includes("Madam Kwan"), true],
  // Only MAXIMAL runs, never every sub-run inside one. "Madam Kwan Bukit
  // Bintang" is all carveable words, so the only run is the whole name, which
  // exact redaction already covers. Emitting sub-runs would also emit "Bukit
  // Bintang", and blurring a district that the plan mentions everywhere is
  // exactly the failure this design is shaped to avoid.
  ["an all-carveable name yields nothing", forms([sell("Madam Kwan Bukit Bintang")], ["Kuala Lumpur"]).length, 0],
  ["so no district is carved out of it", forms([sell("Madam Kwan Bukit Bintang")], ["Kuala Lumpur"]).includes("Bukit Bintang"), false],
  ["a one-word name yields nothing at all", forms([sell("Blacklane")], ["Dubai"]).length, 0],

  // ---- Which is why the draft can declare one itself ----
  ["a declared short form is honoured", forms([sell("منتجع الدانا لنكاوي", ["الدانا"])], ["لنكاوي"]).includes("الدانا"), true],
  ["even though the heuristic refused it", forms([sell("منتجع الدانا لنكاوي")], ["لنكاوي"]).includes("الدانا"), false],
  ["but only if it is words out of that name", forms([sell("منتجع الدانا لنكاوي", ["الريتز"])], ["لنكاوي"]).includes("الريتز"), false],
  ["never a protected word", forms([sell("فندق زمزم بلازا", ["زمزم"])], ["مكة"]).includes("زمزم"), false],
  ["never the destination", forms([sell("منتجع الدانا لنكاوي", ["لنكاوي"])], ["لنكاوي"]).includes("لنكاوي"), false],
  ["never the whole name back again", forms([sell("Madam Kwan", ["Madam Kwan"])], ["Kuala Lumpur"]).includes("Madam Kwan"), false],
  ["and it is read off the fourth marker field", parseNamedThings("PICKS: The Danna = منتجع الدانا لنكاوي = hotel = الدانا").some((t) => t.aliases?.includes("الدانا")), true],
  ["a fourth field does not disturb the name", parsePickNames("PICKS: The Danna = منتجع الدانا لنكاوي = hotel = الدانا").includes("The Danna"), true],

  // ---- The map is never carved, only what we sell ----
  ["nothing is carved from a geographic name", forms([map("Kuala Lumpur International Airport")], ["Kuala Lumpur"]).length, 0],
  ["even a long one", forms([map("Sultan Abdul Samad Building")], ["Kuala Lumpur"]).length, 0],

  // ---- Things that would corrupt the output ----
  ["a name carrying diacritics is skipped whole", forms([sell("مطعم طُعمة الشامي")], ["دمشق"]).length, 0],
  ["a run with a number in it is refused", forms([sell("Hotel 1926 Boutique Lodge")], ["Penang"]).some((f) => /\d/.test(f)), false],
  ["a run equal to the whole name is not emitted twice", forms([sell("Madam Kwan")], ["Kuala Lumpur"]).includes("Madam Kwan"), false],
  ["short runs are refused", forms([sell("Ana Bo Cafe")], ["Lisbon"]).length, 0],

  // ---- The redactor's own contract ----
  ["variants alone still redact", REDACTION_PATTERN.test(redactPlaceNames("stay at Madam Kwan tonight", [], [{ hiddenOnly: "Madam Kwan" }])), true],
  ["the full name wins over its own short form", redactPlaceNames("The Ritz-Carlton, Kuala Lumpur is the pick", ["The Ritz-Carlton, Kuala Lumpur"], [{ hiddenOnly: "Ritz-Carlton" }]).match(REDACTION_PATTERN)?.length, 1],
  ["no names and no variants leaves the text alone", redactPlaceNames("nothing to hide here", [], []), "nothing to hide here"],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed  ·  Langkawi carves ${lk.length} short forms, Makkah ${mk.length}`);
if (pass !== cases.length) process.exit(1);
