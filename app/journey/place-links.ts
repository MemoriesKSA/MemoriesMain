// Turns the real business names already inside a published itinerary into
// links the customer can tap.
//
// The URL is deliberately NOT something anyone writes down or that the AI
// produces: it's a Google Maps search built from the place's own name plus
// the city. That matters, because a homepage URL is a factual claim that can
// be wrong or die, and an invented one would be exactly the kind of
// confident, checkable error the whole drafting pipeline exists to avoid. A
// search link can't be wrong in that way, it just runs the search the
// customer would have run themselves, and it lands them somewhere far more
// useful for a trip: directions, opening hours, phone number, photos,
// reviews, and the venue's own website if it has one.

import { flagshipCityGuideBySlug } from "../flagship-city-data";
import { officialUrlFor } from "./place-urls";
import { saudiArabia } from "../components/planner-data";

export function mapsSearchUrl(placeName: string, cityLabel: string) {
  const query = `${placeName}, ${cityLabel}, Saudi Arabia`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// Proposals store the display label ("Riyadh", "Dammam & Al Khobar"), not the
// slug, so match on the label in either language rather than trying to
// reverse a slug out of it.
export function citySlugFromLabel(label: string): string | null {
  const needle = label.trim().toLowerCase();
  const hit = saudiArabia.cities.find((c) => c.en.toLowerCase() === needle || c.ar === label.trim() || c.value === needle);
  return hit?.value ?? null;
}

// Every real, named business or site we hold for this city, in the language
// being rendered. Only these get linked: the list is finite and curated, so
// we never guess at what is or isn't a place name in free prose.
//
// Chains with branches across the Kingdom, kept here rather than in each
// city's data because they appear in plans for cities whose dining list is
// empty, which is most of them. A twelve-day Madinah plan named Al Baik,
// Zaitoon, Kudu and Al Tazaj and linked none of them, because Madinah holds
// no dining entries for the linker to match against.
//
// Matching these in any Saudi city is safe precisely because they are
// national. A per-city entry would be claiming "there is a branch here",
// which we can't verify for every city; a chain's own site claims nothing
// about a particular branch.
export const NATIONAL_CHAINS: { en: string; ar: string }[] = [
  { en: "Al Baik", ar: "البيك" },
  { en: "Kudu", ar: "كودو" },
  { en: "Al Tazaj", ar: "التزاج" },
  { en: "Zaitoon", ar: "زيتون" },
  // Al Romansiah earns its place here more than the fast-food names do: it
  // serves kabsa, mandi and mathbi, it is in every city we cover, and it is
  // often the most useful answer for a visitor who wants Saudi food without
  // a reservation. The cities with no dining list of their own lean on it.
  { en: "Al Romansiah", ar: "الرومانسية" },
  { en: "Herfy", ar: "هرفي" },
  { en: "Shawarmer", ar: "شاورمر" },
];

// Booking platforms and operators a plan tells the customer to go and use.
// A plan that says "book your Rawdah permit through Nusuk" and then leaves
// them to find Nusuk themselves has stopped short of the thing being sold,
// which is the directions. Anything we instruct someone to use should be one
// tap away, exactly like a hotel or a restaurant.
//
// Nationwide, so they match in any city, and listed under several of the
// names a draft might reasonably use for the same thing.
export const PLATFORMS: { en: string; ar: string }[] = [
  { en: "Nusuk", ar: "نسك" },
  { en: "Haramain High-Speed Railway", ar: "قطار الحرمين السريع" },
  { en: "Haramain High Speed Railway", ar: "قطار الحرمين عالي السرعة" },
  { en: "Haramain High-Speed Train", ar: "قطار الحرمين" },
];

export function placeNamesForCity(cityLabel: string, ar: boolean): string[] {
  const slug = citySlugFromLabel(cityLabel);
  if (!slug) return [];
  const guide = flagshipCityGuideBySlug("saudi-arabia", slug);
  if (!guide) return [];

  const names = [
    ...guide.attractions.map((a) => (ar ? a.nameAr : a.nameEn)),
    ...guide.dining.map((d) => (ar ? d.nameAr : d.nameEn)),
    ...[...guide.stay, ...(guide.extendedStay ?? [])].map((s) => (ar ? s.nameAr : s.nameEn)),
    ...[...(guide.trustedProviders ?? []), ...(guide.extendedProviders ?? [])].map((p) => (ar ? p.nameAr : p.nameEn)),
    ...NATIONAL_CHAINS.map((c) => (ar ? c.ar : c.en)),
    ...PLATFORMS.map((p) => (ar ? p.ar : p.en)),
  ];

  // Longest first, so "Four Seasons Hotel Riyadh at Kingdom Centre" wins over
  // the "Kingdom Centre" sitting inside it and we don't link a fragment.
  return [...new Set(names.filter((n) => n && n.trim().length > 3))].sort((a, b) => b.length - a.length);
}

// English name -> official URL, for the names we hold in this city. The
// itinerary is matched case-insensitively, so key the map that way too.
export function officialUrlMapForCity(cityLabel: string): Record<string, string> {
  const slug = citySlugFromLabel(cityLabel);
  if (!slug) return {};
  const guide = flagshipCityGuideBySlug("saudi-arabia", slug);
  if (!guide) return {};

  const map: Record<string, string> = {};
  const add = (nameEn: string, nameAr: string) => {
    const url = officialUrlFor(nameEn);
    if (!url) return;
    // Both languages point at the same official site, since that is where
    // the customer actually books regardless of which page they are reading.
    map[nameEn.toLowerCase()] = url;
    if (nameAr) map[nameAr.toLowerCase()] = url;
  };

  guide.attractions.forEach((a) => add(a.nameEn, a.nameAr));
  [...guide.stay, ...(guide.extendedStay ?? [])].forEach((s) => add(s.nameEn, s.nameAr));
  [...(guide.trustedProviders ?? []), ...(guide.extendedProviders ?? [])].forEach((p) => add(p.nameEn, p.nameAr));
  // Restaurants were held back from official links deliberately, on the
  // grounds that a map result serves a diner better. That is still true of
  // the ones with no site, and they still fall through to a map search, but
  // a restaurant that has a real site is exactly the one worth opening: the
  // menu and the booking page live there. add() only fires for names that
  // are actually in PLACE_URLS, so the rest are unaffected.
  guide.dining.forEach((d) => add(d.nameEn, d.nameAr));
  NATIONAL_CHAINS.forEach((c) => add(c.en, c.ar));
  PLATFORMS.forEach((p) => add(p.en, p.ar));
  return map;
}
