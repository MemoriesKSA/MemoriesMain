// The twelve-day Madinah plan named four restaurants and linked none of
// them, because Madinah holds no dining entries at all. These check that the
// chains now resolve everywhere, and that a restaurant with a real site gets
// it rather than a map search.

import { placeNamesForCity, officialUrlMapForCity, PLATFORMS } from "../app/journey/place-links";
import { officialUrlFor } from "../app/journey/place-urls";

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

  // The five cities researched one by one, each previously unlinkable.
  ["Al-Ahsa names Flavors Restaurant", placeNamesForCity("Al-Ahsa", false).includes("Flavors Restaurant"), true],
  ["Jazan names Ocean Basket Jazan", placeNamesForCity("Jazan", false).includes("Ocean Basket Jazan"), true],
  ["Tabuk names Juzurna Restaurant", placeNamesForCity("Tabuk", false).includes("Juzurna Restaurant"), true],
  ["Yanbu names Trio", placeNamesForCity("Yanbu", false).includes("Trio"), true],
  ["Al-Jouf names its heritage restaurant", placeNamesForCity("Al-Jouf", false).includes("Al Jouf Heritage Restaurant"), true],

  // Platforms a plan tells the customer to go and use.
  ["Nusuk is linkable in Madinah", madinahNames.includes("Nusuk"), true],
  ["Nusuk points at the platform", madinahUrls["nusuk"], "https://www.nusuk.sa"],
  ["Nusuk works in Arabic", madinahUrls["نسك"], "https://www.nusuk.sa"],
  ["Haramain points at the operator", madinahUrls["haramain high-speed railway"], "https://www.sar.com.sa/haramain"],
  // A platform with no URL would fall through to a map search, which is
  // meaningless for a website. Every platform must carry a real link.
  ["every platform has a URL, never a map search", PLATFORMS.every((p) => !!officialUrlFor(p.en)), true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
