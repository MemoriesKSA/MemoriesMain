// The Arabic name of a plan's stored city, for Arabic pages and emails.
//
//   npx tsx scripts/test-arabic-city.ts
import { arabicCityLabel } from "../app/components/planner-data";

const cases: Array<[string, string]> = [
  ["London", "لندن"],
  ["Jeddah", "جدة"],
  ["Yogyakarta", "يوجياكارتا"],
  ["AlUla", "العلا"],
  ["Red Sea", "البحر الأحمر"],
  ["Riyadh → Jeddah → AlUla", "الرياض ← جدة ← العلا"],
  // Catalogue cities outside the planner still have Arabic names.
  ["Edinburgh", "إدنبرة"],
  // Not a city we know: left exactly as the customer wrote it.
  ["Llandudno", "Llandudno"],
  ["قرية في الجبال", "قرية في الجبال"],
];

let failed = 0;
for (const [input, want] of cases) {
  const got = arabicCityLabel(input);
  const ok = got === want;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${input}  ->  ${got}${ok ? "" : `   (wanted ${want})`}`);
}
console.log(`${cases.length - failed}/${cases.length}`);
process.exit(failed ? 1 : 0);
