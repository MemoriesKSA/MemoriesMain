// Verified official websites for the bookable places we name in itineraries.
//
// The rule for this file: a URL only goes in if it was seen as a real,
// resolving address for that exact business, not constructed from a chain's
// usual URL pattern and not recalled from memory. A wrong link in a paid
// plan is the same class of error as a wrong price, and a customer clicking
// through to the wrong hotel is worse than one running a map search.
//
// Anything absent here falls back to a Google Maps search (see place-links),
// which is why an incomplete list is safe: the gap degrades to something
// still useful rather than to a dead link.
//
// Restaurants are deliberately excluded. Many Saudi restaurants have no site
// at all, or run on Instagram, and for a diner the map result (hours, phone,
// reservation link, photos) beats a homepage anyway.
//
// Keys are the exact nameEn from flagship-city-data.ts.

export const PLACE_URLS: Record<string, string> = {
  // Riyadh, attractions
  "Diriyah & At-Turaif": "https://www.diriyah.sa/en",
  "National Museum & Al Murabba": "https://www.nationalmuseum.org.sa",
  "Six Flags Qiddiya City": "https://sixflagsqiddiyacity.com/en",
  "AquaRabia": "https://aquarabiaqiddiyacity.com/en",
  "Boulevard World": "https://riyadhseason.com",
  "Kingdom Centre & KAFD": "https://www.visitsaudi.com/en/riyadh/attractions/sky-bridge-at-kingdom-center",

  // Riyadh, hotels
  "Four Seasons Hotel Riyadh at Kingdom Centre": "https://www.fourseasons.com/riyadh/",
  "Mandarin Oriental Al Faisaliah, Riyadh": "https://www.mandarinoriental.com/en/riyadh/olaya",
  "Courtyard by Marriott Riyadh Olaya": "https://www.marriott.com/en-us/hotels/ruhcy-courtyard-riyadh-olaya/overview/",

  // Riyadh, drivers
  "Blacklane": "https://www.blacklane.com/en/countries/saudi-arabia/riyadh/",
  "NAYLAM": "https://naylam.com/",

  // Jeddah
  "Al-Balad": "https://jeddahalbalad.sa",
  "Rosewood Jeddah": "https://www.rosewoodhotels.com/en/jeddah",
  "Radisson Hotel Jeddah Tahlia": "https://www.radissonhotels.com/en-us/hotels/radisson-jeddah-tahlia",
};

export function officialUrlFor(placeName: string): string | null {
  return PLACE_URLS[placeName] ?? null;
}
