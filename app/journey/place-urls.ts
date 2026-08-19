// Verified official websites for the bookable places we name in itineraries.
//
// The rule for this file: a URL only goes in if it was seen as a real,
// resolving address for that exact business, not constructed from a chain's
// usual URL pattern and not recalled from memory. A wrong link in a paid
// plan is the same class of error as a wrong price, and a customer clicking
// through to the wrong hotel is worse than one running a map search.
//
// Every entry below has been fetched or opened in a browser. Sites that sit
// behind bot protection (Marriott, Radisson, Diriyah, the Qiddiya parks)
// return 403 to a script but load normally for a real visitor, so they were
// checked by eye rather than by status code.
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
  // ---- Riyadh ----
  "Diriyah & At-Turaif": "https://diriyah.sa",
  // nationalmuseum.org.sa no longer resolves; the live official page is the
  // Ministry of Culture's, which is also where tickets are actually booked.
  "National Museum & Al Murabba": "https://engage.moc.gov.sa/national_museum/book-your-tickets/",
  "Six Flags Qiddiya City": "https://sixflagsqiddiyacity.com/en",
  "AquaRabia": "https://aquarabiaqiddiyacity.com/en",
  "Boulevard World": "https://riyadhseason.com",
  "Kingdom Centre & KAFD": "https://www.visitsaudi.com/en/riyadh/attractions/sky-bridge-at-kingdom-center",
  "Four Seasons Hotel Riyadh at Kingdom Centre": "https://www.fourseasons.com/riyadh/",
  "Mandarin Oriental Al Faisaliah, Riyadh": "https://www.mandarinoriental.com/en/riyadh/olaya",
  "Fairmont Riyadh": "https://www.fairmont.com/en/hotels/riyadh/fairmont-riyadh.html",
  "Courtyard by Marriott Riyadh Olaya": "https://www.marriott.com/en-us/hotels/ruhcy-courtyard-riyadh-olaya/overview/",
  "Blacklane": "https://www.blacklane.com/en/countries/saudi-arabia/riyadh/",
  "NAYLAM": "https://naylam.com/",

  // ---- Jeddah ----
  // jeddahalbalad.sa redirects to the district's current visitor site.
  "Al-Balad": "https://visitalbalad.com/",
  "Rosewood Jeddah": "https://www.rosewoodhotels.com/en/jeddah",
  "Radisson Hotel Jeddah Tahlia": "https://www.radissonhotels.com/en-us/hotels/radisson-jeddah-tahlia",

  // ---- AlUla ----
  // AlUla ticketing and accommodation both run through the official
  // Experience AlUla platform, which is the right place to send a customer.
  "Hegra": "https://www.experiencealula.com/en/places-to-go/hegra",
  "Banyan Tree AlUla": "https://www.experiencealula.com/en/hotels-and-stays/banyan-tree-alula",
  "Dar Tantora The House Hotel": "https://www.experiencealula.com/en/hotels-and-stays/dar-tantora-the-house-hotel",
  "The Chedi Hegra": "https://www.experiencealula.com/en/hotels-and-stays/the-chedi-hegra",
  "Shaden Resort": "https://www.experiencealula.com/en/hotels-and-stays/shaden-resort",
  "Cloud7 Residence AlUla": "https://www.experiencealula.com/en/hotels-and-stays/cloud7-residence",
  // ---- Makkah ----
  // Most of the Haram-adjacent towers are Accor brands, and Accor runs a
  // dedicated Makkah & Madinah portal which is the right booking surface.
  "Fairmont Makkah Clock Royal Tower": "https://makkah-madinah.accor.com/hotels/makkah-clock-royal-tower-a-fairmont-hotel/",
  "Raffles Makkah Palace": "https://makkah-madinah.accor.com/hotels/raffles-makkah-palace/",
  "Swissôtel Al Maqam Makkah": "https://makkah-madinah.accor.com/hotels/swissotel-al-maqam-makkah/",
  "Pullman ZamZam Makkah": "https://makkah-madinah.accor.com/hotels/pullman-zamzam-makkah/",
  "Mövenpick Hajar Tower Makkah": "https://makkah-madinah.accor.com/hotels/movenpick-hotel-residence-makkah-hajar-tower/",

  // ---- Madinah ----
  "Pullman Zamzam Madinah": "https://makkah-madinah.accor.com/hotels/pullman-zamzam-madinah/",
  "Anwar Al Madinah Mövenpick": "https://makkah-madinah.accor.com/hotels/anwar-al-madinah-movenpick-hotel/",
  "InterContinental Dar Al Iman Madinah": "https://www.ihg.com/intercontinental/hotels/us/en/madinah/medha/hoteldetail",
};

export function officialUrlFor(placeName: string): string | null {
  return PLACE_URLS[placeName] ?? null;
}
