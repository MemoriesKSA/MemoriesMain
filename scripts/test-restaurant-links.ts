// The twelve-day Madinah plan named four restaurants and linked none of
// them, because Madinah holds no dining entries at all. These check that the
// chains now resolve everywhere, and that a restaurant with a real site gets
// it rather than a map search.

import { placeNamesForCity, officialUrlMapForCity } from "../app/journey/place-links";

const madinahNames = placeNamesForCity("Madinah", false);
const madinahNamesAr = placeNamesForCity("Madinah", true);
const madinahUrls = officialUrlMapForCity("Madinah");
const riyadhUrls = officialUrlMapForCity("Riyadh");
const alulaUrls = officialUrlMapForCity("AlUla");

const cases: [string, unknown, unknown][] = [
  // Madinah has an empty dining list, so before this these were unlinkable.
  ["Al Baik is linkable in Madinah", madinahNames.includes("Al Baik"), true],
  ["Zaitoon is linkable in Madinah", madinahNames.includes("Zaitoon"), true],
  ["Kudu is linkable in Madinah", madinahNames.includes("Kudu"), true],
  ["Al Tazaj is linkable in Madinah", madinahNames.includes("Al Tazaj"), true],
  ["chains appear in Arabic too", madinahNamesAr.includes("البيك"), true],

  ["Al Baik gets its own site", madinahUrls["al baik"], "https://www.albaik.com/"],
  ["Zaitoon gets its own site", madinahUrls["zaitoon"], "https://zaitoonksa.com/"],
  ["Arabic name maps to the same site", madinahUrls["البيك"], "https://www.albaik.com/"],

  // Chains are national, so they work in a city that does have dining data.
  ["chains work in Riyadh as well", riyadhUrls["kudu"], "https://www.kudu.com.sa/"],

  // City restaurants that do have sites, now that dining is included.
  ["La Petite Maison links to its Riyadh page", riyadhUrls["la petite maison"], "https://lpmrestaurants.com/riyadh/"],
  ["Myazu links to its own site", riyadhUrls["myazu"], "https://myazu.com/"],
  ["Maraya Social links to its own site", alulaUrls["maraya social"], "https://marayasocial.com/"],

  // Verified as having no usable official site, so these must stay on maps.
  // A wrong link is worse than a map search.
  ["Yauatcha stays on maps", riyadhUrls["yauatcha"], undefined],
  ["Porter House stays on maps", riyadhUrls["porter house"], undefined],
  // ...but still linkable, as a map search.
  ["Yauatcha is still linked at all", placeNamesForCity("Riyadh", false).includes("Yauatcha"), true],

  // Dining researched for the cities that had none. These had no entry at
  // all, so a plan naming them linked nothing.
  ["Madinah names To'mah", madinahNames.includes("To'mah"), true],
  ["Madinah names Zaman Jaddi in Arabic", madinahNamesAr.includes("مطعم زمان جدي"), true],
  ["Taif names Baitna Alqadeem", placeNamesForCity("Taif", false).includes("Baitna Alqadeem"), true],
  ["Aseer names Karamna", placeNamesForCity("Aseer", false).includes("Karamna"), true],
  ["Makkah names Maki House", placeNamesForCity("Makkah", false).includes("Maki House"), true],

  // Al Romansiah is the fallback that matters for the cities still carrying
  // no dining list of their own.
  ["Al Romansiah works in Jazan", placeNamesForCity("Jazan", false).includes("Al Romansiah"), true],
  ["Al Romansiah works in Yanbu", placeNamesForCity("Yanbu", false).includes("Al Romansiah"), true],
  ["Al Romansiah has its own site", officialUrlMapForCity("Tabuk")["al romansiah"], "https://alromansiah.com"],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
