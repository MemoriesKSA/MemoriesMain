// Every key in PLACE_URLS must exactly match a nameEn in the flagship data
// or a national chain, otherwise the URL silently never applies and the place
// quietly falls back to a Maps search with nobody noticing.

import { PLACE_URLS } from "../app/journey/place-urls";
import { flagshipCityGuideBySlug, flagshipCityKeys } from "../app/flagship-city-data";
import { NATIONAL_CHAINS, PLATFORMS } from "../app/journey/place-links";

// Walks every country in the data. It used to walk Saudi's city list, which
// was the whole dataset at the time; the first Turkish city made every
// Turkish name look like an orphan.
const known = new Set<string>();
for (const { countrySlug, citySlug } of flagshipCityKeys()) {
  const g = flagshipCityGuideBySlug(countrySlug, citySlug);
  if (!g) continue;
  g.attractions.forEach((a) => known.add(a.nameEn));
  g.dining.forEach((d) => known.add(d.nameEn));
  [...g.stay, ...(g.extendedStay ?? [])].forEach((s) => known.add(s.nameEn));
  [...(g.trustedProviders ?? []), ...(g.extendedProviders ?? [])].forEach((p) => known.add(p.nameEn));
}

// Chains are matched in every city rather than held in any one city's
// data, so they are legitimate keys and are not orphans.
NATIONAL_CHAINS.forEach((c) => known.add(c.en));
PLATFORMS.forEach((p) => known.add(p.en));

const orphans = Object.keys(PLACE_URLS).filter((k) => !known.has(k));

console.log(`registry keys: ${Object.keys(PLACE_URLS).length}`);
console.log(`known place names: ${known.size}`);
if (!orphans.length) {
  console.log("\nAll registry keys match a real place name.");
} else {
  console.log(`\nORPHANED KEYS (${orphans.length}) - these will never link:`);
  for (const o of orphans) {
    const near = [...known].filter((k) => k.toLowerCase().includes(o.toLowerCase().slice(0, 8)) || o.toLowerCase().includes(k.toLowerCase().slice(0, 8)));
    console.log(`  "${o}"${near.length ? `\n     did you mean: ${near.map((n) => `"${n}"`).join(" | ")}` : ""}`);
  }
}
