// A Kazbegi plan reached the reviewer with this inside the Arabic:
//
//   أشهر التزلج في غودauri — وأصححها: أشهر التزلج في غودوري
//
// "the ski months in Gudauri — and I correct it: the ski months in Gudauri".
// The name came out half in Latin letters, the model noticed, and wrote the
// correction into the document rather than replacing the mistake. Nothing like
// it existed in the English.
//
// The self-check caught it, which is the safety net working, but that pass is
// a sampled model output and this is a deterministic property of the text. So
// it is also checked directly.
//
// The hard part is not detection, it is not firing on the Latin that BELONGS
// in an Arabic itinerary. Airport codes, tram lines, websites and a hotel's
// own Latin name are all correct, and the translation prompt explicitly
// requires the codes. What makes the artifact different is that the two
// scripts are fused inside one word with no space between them.

import { mixedScriptFragments } from "../app/draft-guide";

const cases: [string, string, boolean][] = [
  // The real thing.
  ["the real Kazbegi artifact", "أشهر التزلج في غودauri — وأصححها: أشهر التزلج في غودوري", true],
  ["a fused name on its own", "زرنا مدينةStepantsminda اليوم", true],
  ["fused the other way round", "فندقRooms يطل على الجبل", true],

  // All of this Latin is correct and must never be flagged.
  ["an airport code in brackets", "مطار إسطنبول (IST) هو البوابة الرئيسية", false],
  ["a bare airport code", "ابحث عن RUH إلى IST", false],
  ["a tram line", "خط الترام T1 يمر من هنا", false],
  ["a website", "أكّد على sehirhatlari.istanbul قبل يوم", false],
  ["a business's own Latin name", "فندق Rooms Hotel Kazbegi يطل على الجبل", false],
  ["a transliteration beside the Latin", "مدينة Stepantsminda ستيبانتسميندا", false],
  ["pure Arabic", "اليوم 1 — الوصول إلى تبليسي", false],
  ["pure English", "Day 1 — arrival in Tbilisi", false],
  ["empty", "", false],

  // Arabic punctuation after Latin. The detector used to call every one of
  // these a fused word, because U+0600-U+06FF holds the Arabic comma and the
  // Arabic-Indic digits as well as the letters. On one Edinburgh study draft
  // that was five of six warnings, and the sixth, real one sat in the noise.
  // Identifiers staying Latin and then being punctuated in Arabic is exactly
  // what the translation prompt asks for.
  ["a URL then an Arabic comma", "لا من قراءة مباشرة على gov.uk، وعدد منها", false],
  ["a postcode then an Arabic comma", "في 50 Potterrow, EH8 9BT، يقع داخل الحرم", false],
  ["an address then an Arabic comma", "في 1 Bristo Square، الملاصق مباشرة", false],
  ["a Latin word then an Arabic full stop", "راجع ukvisa.blog۔", false],
  ["a Latin word then an Arabic question mark", "هل زرت Heriot-Watt؟", false],
  ["Arabic-Indic digits beside Latin", "الغرفة ٤٥ EH8", false],

  // But a real fusion must still be caught, including the conjunction "wa"
  // welded straight onto a Latin domain, which is the one the Edinburgh
  // draft actually had.
  ["a standalone conjunction is Arabic, not a fusion", "وروان وtheimmigrationworld", false],
  ["nor is one before an acronym", "يُقبل TOEFL iBT وPTE", false],
  ["nor before a proper noun", "جامعة سيدني وUNSW", false],
  ["nor the other proclitics", "من MoneySmart فStudy Australia", false],
  // But the letter has to stand alone. Real Arabic before the Latin is
  // still a name the model began transliterating and abandoned.
  ["a fusion after a whole Arabic word still flags", "زرنا مدينةStepantsminda", true],
  ["and a conjunction mid-word is not a prefix", "أشهر غودauri", true],
];

let pass = 0;
for (const [name, text, shouldFlag] of cases) {
  const hits = mixedScriptFragments(text);
  const ok = (hits.length > 0) === shouldFlag;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${shouldFlag ? "flags" : "allows"} ${name}${ok ? "" : `  got=${JSON.stringify(hits)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);
