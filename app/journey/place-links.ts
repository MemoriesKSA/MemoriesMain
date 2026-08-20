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

import { flagshipCityGuideBySlug, flagshipCountryForCity } from "../flagship-city-data";
import { officialUrlFor } from "./place-urls";
import { travelCountries, type CountryOption } from "../components/planner-data";

/**
 * A map search for a place, in its own city and its own country.
 *
 * The country used to be the literal string "Saudi Arabia", which was
 * correct while the data was Saudi and silently wrong the moment it wasn't:
 * "Hagia Sophia, Istanbul, Saudi Arabia" finds nothing at all.
 */
export function mapsSearchUrl(placeName: string, cityLabel: string, countryName = "") {
  const query = [placeName, cityLabel, countryName].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Every country the planner offers, searched rather than assuming Saudi. */
function allCountries(): CountryOption[] {
  return travelCountries;
}

// Proposals store the display label ("Riyadh", "Dammam & Al Khobar"), not the
// slug, so match on the label in either language rather than trying to
// reverse a slug out of it. Searched across every country, since a label
// alone no longer implies which one.
export function citySlugFromLabel(label: string): string | null {
  const needle = label.trim().toLowerCase();
  for (const country of allCountries()) {
    const hit = country.cities.find((c) => c.en.toLowerCase() === needle || c.ar === label.trim() || c.value === needle);
    if (hit) return hit.value;
  }
  return null;
}

/**
 * Every city in a stored label, because a multi-stop plan stores all of them
 * in one string: "Riyadh → Jeddah → AlUla".
 *
 * That label matched no city at all, so a three-city plan came back with
 * zero links in it, not even a map search, while every single-city plan
 * linked normally. The unit tests missed it because they all passed one
 * city name, which is the shape that always worked.
 */
export function citySlugsFromLabel(label: string): string[] {
  const parts = label.split(/→|->|,/).map((p) => p.trim()).filter(Boolean);
  const slugs = (parts.length ? parts : [label]).map(citySlugFromLabel).filter((s): s is string => !!s);
  // A label like "Dammam & Al Khobar" is one city whose own name contains a
  // separator we don't split on, so it still resolves through the whole
  // string when the pieces don't resolve individually.
  if (!slugs.length) {
    const whole = citySlugFromLabel(label);
    return whole ? [whole] : [];
  }
  return [...new Set(slugs)];
}

function guidesForLabel(label: string) {
  return citySlugsFromLabel(label)
    .map((slug) => {
      const countrySlug = flagshipCountryForCity(slug);
      return countrySlug ? { slug, countrySlug, guide: flagshipCityGuideBySlug(countrySlug, slug) } : null;
    })
    .filter((g): g is { slug: string; countrySlug: string; guide: NonNullable<ReturnType<typeof flagshipCityGuideBySlug>> } => !!g?.guide);
}

/** The English city name for a slug, which is what a map search wants. */
function cityLabelForSlug(slug: string): string {
  for (const country of allCountries()) {
    const hit = country.cities.find((c) => c.value === slug);
    if (hit) return hit.en;
  }
  return slug;
}

/** The English country name for a slug, for the tail of a map search. */
export function countryNameForSlug(countrySlug: string): string {
  return allCountries().find((c) => c.value === countrySlug)?.en ?? "";
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
// Scoped to Saudi Arabia, because that is what "national" means here. Left
// unscoped these attached to every city in the data, so an Istanbul plan
// would happily link Al Baik and a Rawdah permit platform.
export const NATIONAL_CHAINS_COUNTRY = "saudi-arabia";

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
// Also Saudi: Nusuk is the Saudi Ministry of Hajj and Umrah's platform and
// the Haramain line runs between Saudi cities.
export const PLATFORMS_COUNTRY = "saudi-arabia";

export const PLATFORMS: { en: string; ar: string }[] = [
  { en: "Nusuk", ar: "نسك" },
  { en: "Haramain High-Speed Railway", ar: "قطار الحرمين السريع" },
  { en: "Haramain High Speed Railway", ar: "قطار الحرمين عالي السرعة" },
  { en: "Haramain High-Speed Train", ar: "قطار الحرمين" },
];

export function placeNamesForCity(cityLabel: string, ar: boolean): string[] {
  const guides = guidesForLabel(cityLabel);
  if (!guides.length) return [];
  const inSaudi = guides.some((g) => g.countrySlug === NATIONAL_CHAINS_COUNTRY);

  const names = [
    ...guides.flatMap(({ guide }) => [
      ...guide.attractions.map((a) => (ar ? a.nameAr : a.nameEn)),
      ...guide.dining.map((d) => (ar ? d.nameAr : d.nameEn)),
      ...[...guide.stay, ...(guide.extendedStay ?? [])].map((s) => (ar ? s.nameAr : s.nameEn)),
      ...[...(guide.trustedProviders ?? []), ...(guide.extendedProviders ?? [])].map((p) => (ar ? p.nameAr : p.nameEn)),
    ]),
    ...(inSaudi ? NATIONAL_CHAINS.map((c) => (ar ? c.ar : c.en)) : []),
    ...(inSaudi ? PLATFORMS.map((p) => (ar ? p.ar : p.en)) : []),
  ];

  // Longest first, so "Four Seasons Hotel Riyadh at Kingdom Centre" wins over
  // the "Kingdom Centre" sitting inside it and we don't link a fragment.
  return [...new Set(names.filter((n) => n && n.trim().length > 3))].sort((a, b) => b.length - a.length);
}

/**
 * Just the hotels, for the paywall's name redaction. Restaurants and
 * attractions stay readable: it is the chosen hotel that is worth teasing,
 * and blurring everything would leave the overview meaningless rather than
 * tantalising.
 */
export function stayNamesForCity(cityLabel: string, ar: boolean): string[] {
  const names = guidesForLabel(cityLabel).flatMap(({ guide }) =>
    [...guide.stay, ...(guide.extendedStay ?? [])].map((s) => (ar ? s.nameAr : s.nameEn)),
  );
  return [...new Set(names.filter((n) => n && n.trim().length > 3))];
}

/**
 * Where each name should be searched: its own city and its own country, as
 * one "Istanbul, Turkey" string.
 *
 * Without it a multi-stop plan searches every place in the whole trip label,
 * and "Sura, Riyadh → Jeddah → AlUla" finds nothing. The country half was a
 * hardcoded "Saudi Arabia" until the data covered more than one, at which
 * point it stopped being a detail and started sending people to the wrong
 * hemisphere.
 *
 * Keyed lowercase, in both languages, pointing at the English names because
 * that is what a map search resolves most reliably.
 */
export function placeCityMapForCity(cityLabel: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const { slug, countrySlug, guide } of guidesForLabel(cityLabel)) {
    const city = [cityLabelForSlug(slug), countryNameForSlug(countrySlug)].filter(Boolean).join(", ");
    const add = (en: string, arName: string) => {
      // First city wins, so a name shared by two stops keeps the earlier one
      // rather than silently flipping to the later.
      if (en && !(en.toLowerCase() in map)) map[en.toLowerCase()] = city;
      if (arName && !(arName.toLowerCase() in map)) map[arName.toLowerCase()] = city;
    };
    guide.attractions.forEach((a) => add(a.nameEn, a.nameAr));
    guide.dining.forEach((d) => add(d.nameEn, d.nameAr));
    [...guide.stay, ...(guide.extendedStay ?? [])].forEach((s) => add(s.nameEn, s.nameAr));
    [...(guide.trustedProviders ?? []), ...(guide.extendedProviders ?? [])].forEach((p) => add(p.nameEn, p.nameAr));
  }
  return map;
}

// English name -> official URL, for the names we hold in this city. The
// itinerary is matched case-insensitively, so key the map that way too.
export function officialUrlMapForCity(cityLabel: string): Record<string, string> {
  const guides = guidesForLabel(cityLabel);
  if (!guides.length) return {};

  const map: Record<string, string> = {};
  const add = (nameEn: string, nameAr: string) => {
    const url = officialUrlFor(nameEn);
    if (!url) return;
    // Both languages point at the same official site, since that is where
    // the customer actually books regardless of which page they are reading.
    map[nameEn.toLowerCase()] = url;
    if (nameAr) map[nameAr.toLowerCase()] = url;
  };

  for (const { guide } of guides) {
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
  }
  if (guides.some((g) => g.countrySlug === NATIONAL_CHAINS_COUNTRY)) {
    NATIONAL_CHAINS.forEach((c) => add(c.en, c.ar));
    PLATFORMS.forEach((p) => add(p.en, p.ar));
  }
  return map;
}
