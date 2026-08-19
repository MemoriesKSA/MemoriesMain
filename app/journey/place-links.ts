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
  ];

  // Longest first, so "Four Seasons Hotel Riyadh at Kingdom Centre" wins over
  // the "Kingdom Centre" sitting inside it and we don't link a fragment.
  return [...new Set(names.filter((n) => n && n.trim().length > 3))].sort((a, b) => b.length - a.length);
}
