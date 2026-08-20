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
// Restaurants were excluded at first, on the reasoning that many Saudi
// restaurants have no site or run on Instagram. That holds for most of them
// and they still fall back to a map search, but it was wrong as a blanket
// rule: the ones that DO have a real site are exactly the ones a customer
// wants to open, to see a menu or book a table. So a restaurant is listed
// here when it has its own verified site, and left out when it doesn't.
//
// Checked and rejected, so nobody re-adds them from memory: Yauatcha (the
// Hakkasan group page has no Riyadh venue, and the Mandarin Oriental page
// redirects to the hotel's general dining index rather than the restaurant),
// Sultan's Steakhouse, Sura, Circolo and San Carlo Cicchetti (real, but no
// working page: San Carlo's group site 404s on its Jeddah restaurant). All
// of those are better served by a map search.
//
// Porterhouse and OKTO were on that list until a later pass searched for
// them properly and found porterhouse-sa.com and okto-sa.com. A search that
// comes back empty means the search was wrong at least as often as it means
// the thing does not exist, so "rejected" here means checked, not proven
// absent.
//
// Keys are the exact nameEn from flagship-city-data.ts, or from the national
// chain list in place-links.ts.

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
  "Crowne Plaza Madinah": "https://www.ihg.com/crowneplaza/hotels/us/en/madinah/medin/hoteldetail",
  // Not the Crowne Plaza Madinah Al Haramain, which is a separate property
  // being built by the railway station. This is the operating one, and its
  // IHG code is medin.
  "Nozol Royal Inn Hotel": "https://madenhotels.com/en/hotels-nozol/",

  // Hilton and IHG both refuse scripts, so these two were read in a browser:
  // Conrad's page loads as "Conrad Jabal Omar Makkah", ours keeps the shorter
  // name a customer would actually search for.
  "Conrad Makkah": "https://www.hilton.com/en/hotels/makcici-conrad-jabal-omar-makkah/",
  "Al Kiswah Towers Hotel": "https://alkiswah-towers.com/",

  // ---- Restaurants ----
  // National chains first. These are named in plans for cities whose dining
  // list is empty, so they are matched everywhere rather than per city (see
  // NATIONAL_CHAINS in place-links.ts).
  "Al Baik": "https://www.albaik.com/",
  "Kudu": "https://www.kudu.com.sa/",
  // taza.com.sa is the address that gets quoted around, but it redirects
  // here, so the destination is what's stored.
  "Al Tazaj": "https://www.altazaj.sa/",
  "Zaitoon": "https://zaitoonksa.com/",
  "Al Romansiah": "https://alromansiah.com",
  "Herfy": "https://herfy.com",
  "Shawarmer": "https://www.shawarmer.com",

  // ---- Drivers ----
  // All thirteen were checked in August 2026 and every one is a real,
  // operating business. These are the entries a plan tells the customer to
  // go and contact, so a map search for a chauffeur company was the least
  // useful fallback in the file: their own site is where the fleet, the
  // routes and the booking form live.
  "Hello Chauffeur": "https://hellochauffeurlimo.com/",
  "The Royal Chauffeur": "https://theroyalchauffeur.com/",
  "MyChauffeur": "https://mychauffeur.com/en/saudi-arabia/riyadh",
  "Online Umrah Taxi": "https://onlineumrahtaxi.com/",
  "Easy Access AlUla": "https://www.alulashuttle.com/",
  // Their own page for exactly the transfer our Red Sea plans describe.
  "GH Trips": "https://ghtrips.com/saudi-arabia/private-transfer-in-shura-island/",
  "Transfeero": "https://www.transfeero.com/en/country/saudi-arabia/",
  "Noorha Transport": "https://noorhatransport.com/",

  // ---- Booking platforms ----
  // The permit and ticket systems a plan sends the customer to. Nusuk is the
  // Ministry's own platform for Rawdah and Umrah permits; the Haramain train
  // is booked through Saudi Arabia Railways, which is why the link is theirs.
  "Nusuk": "https://www.nusuk.sa",
  "Haramain High-Speed Railway": "https://www.sar.com.sa/haramain",
  "Haramain High Speed Railway": "https://www.sar.com.sa/haramain",
  "Haramain High-Speed Train": "https://www.sar.com.sa/haramain",

  // City restaurants with their own sites.
  // The brand's own Riyadh page, not the group index, so the link lands on
  // the right restaurant in the right city.
  "La Petite Maison": "https://lpmrestaurants.com/riyadh/",
  "Myazu": "https://myazu.com/",
  "Lusin": "https://lusinrestaurant.com/",
  "Maraya Social": "https://marayasocial.com/",
  "Porterhouse": "https://porterhouse-sa.com/",
  "OKTO": "https://okto-sa.com/",
  // Inside Mövenpick Al Khobar, so the hotel's own page for it is the
  // booking surface rather than a separate restaurant site.
  "Maharaja by Vineet": "https://movenpick.accor.com/en/middle-east/saudi-arabia/al-khobar/hotel-al-khobar/restaurants/maharaja-by-vineet.html",
};

export function officialUrlFor(placeName: string): string | null {
  return PLACE_URLS[placeName] ?? null;
}
