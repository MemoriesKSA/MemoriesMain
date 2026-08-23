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
