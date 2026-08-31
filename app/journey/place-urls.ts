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
  // The three international operators below are pointed at their own
  // front doors rather than a country page. Each of them now appears in
  // several countries' city data, and this registry holds one URL per
  // name, so the Riyadh and Saudi-Arabia pages that used to be here were
  // sending a Bangkok or Istanbul customer to the wrong country. Their
  // city coverage was checked directly: Blacklane has live pages for
  // Bangkok, Phuket, Kuala Lumpur and Istanbul and none for Tbilisi or
  // Moscow; Transfeero's own country pages name Tbilisi and Kutaisi in
  // Georgia and Istanbul, Antalya and Ankara in Türkiye.
  "Blacklane": "https://www.blacklane.com/en/",
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
  "MyChauffeur": "https://mychauffeur.com/en/",
  "Online Umrah Taxi": "https://onlineumrahtaxi.com/",
  "Easy Access AlUla": "https://www.alulashuttle.com/",
  // Their own page for exactly the transfer our Red Sea plans describe.
  "GH Trips": "https://ghtrips.com/saudi-arabia/private-transfer-in-shura-island/",
  "Transfeero": "https://www.transfeero.com/en/",
  "Noorha Transport": "https://noorhatransport.com/",

  // ---- Türkiye ----
  // Istanbul. Hotels and restaurants checked against the operator's own site
  // or the MICHELIN Guide before being written into the data.
  "Çırağan Palace Kempinski Istanbul": "https://www.kempinski.com/en/ciragan-palace",
  "Pera Palace Hotel": "https://www.perapalace.com/",
  // Four Seasons refuses scripts like the other luxury brands, so this one
  // was read in a browser rather than by status code.
  "Four Seasons Hotel Istanbul at Sultanahmet": "https://www.fourseasons.com/istanbul/",
  "Novotel Istanbul Bosphorus": "https://all.accor.com/hotel/8654/index.en.shtml",
  "ibis Istanbul Sisli": "https://all.accor.com/hotel/C0D0/index.en.shtml",
  "Mikla": "https://www.miklarestaurant.com/",
  "Neolokal": "https://neolokal.com/",
  "Karaköy Lokantası": "https://karakoylokantasi.com/",
  "Cab Istanbul": "https://cabistanbul.com/",

  // The rest of Türkiye.
  "Museum Hotel": "https://www.museumhotel.com.tr/en",
  "Argos in Cappadocia": "https://www.argosincappadocia.com/",
  "Sultan Cave Suites": "https://sultancavesuites.com/",
  "Tuvana Hotel": "https://tuvanahotel.com/",
  "Akra Hotel": "https://www.akrahotels.com/",
  "Mandarin Oriental, Bodrum": "https://www.mandarinoriental.com/en/bodrum/paradise-bay",
  "Swissôtel Büyük Efes, İzmir": "https://www.swissotel.com/hotels/izmir/",
  "Hillside Beach Club": "https://www.hillsidebeachclub.com/en",
  // Marriott refuses scripts, so this was read in a browser.
  "JW Marriott Hotel Ankara": "https://www.marriott.com/en-us/hotels/esbjw-jw-marriott-hotel-ankara/overview/",
  "Zorlu Grand Hotel Trabzon": "https://www.zorlugrand.com/EN/",

  // ---- Thailand ----
  "Mandarin Oriental, Bangkok": "https://www.mandarinoriental.com/en/bangkok/chao-phraya-river",
  "The Peninsula Bangkok": "https://www.peninsula.com/en/bangkok/5-star-luxury-hotel-riverside",
  "The Siam": "https://www.thesiamhotel.com/",
  "Bo.lan": "https://bolan.co.th/",
  "Rosewood Phuket": "https://www.rosewoodhotels.com/en/phuket",
  "Trisara": "https://trisara.com/",
  "137 Pillars House": "https://137pillarshotels.com/en/chiangmai/",
  "Rayavadee": "https://www.rayavadee.com/",
  // Four Seasons refuses scripts everywhere, so these two were read in a
  // browser like the Istanbul one.
  "Four Seasons Resort Chiang Mai": "https://www.fourseasons.com/chiangmai/",
  "Four Seasons Resort Koh Samui": "https://www.fourseasons.com/kohsamui/",

  // ---- Malaysia ----
  "Mandarin Oriental, Kuala Lumpur": "https://www.mandarinoriental.com/en/kuala-lumpur/petronas-towers",
  "The Ritz-Carlton, Kuala Lumpur": "https://www.ritzcarlton.com/en/hotels/kulrz-the-ritz-carlton-kuala-lumpur/overview/",
  "Eastern & Oriental Hotel": "https://www.eohotels.com/",
  "The Datai Langkawi": "https://www.thedatai.com/",
  "The Ritz-Carlton, Langkawi": "https://www.ritzcarlton.com/en/hotels/lgkrz-the-ritz-carlton-langkawi/overview/",
  "Casa del Rio Melaka": "https://casadelrio-melaka.com/",
  "Shangri-La Tanjung Aru": "https://www.shangri-la.com/kotakinabalu/tanjungaruresort/",
  "Cameron Highlands Resort": "https://www.cameronhighlandsresort.com/",

  // ---- Georgia ----
  "Stamba Hotel": "https://stambahotel.com/",
  "Rooms Hotel Tbilisi": "https://roomshotels.com/tbilisi/",
  "Rooms Hotel Batumi": "https://roomshotels.com/batumi/",
  "Rooms Hotel Kazbegi": "https://roomshotels.com/kazbegi/",
  "Crowne Plaza Borjomi": "https://www.ihg.com/crowneplaza/hotels/us/en/borjomi/bjrcp/hoteldetail",

  // ---- Russia ----
  "Hotel Metropol Moscow": "https://metropol-moscow.ru/en/",
  "Hotel Astoria": "https://www.roccofortehotels.com/hotels-and-resorts/hotel-astoria/",
  "Radisson Blu Hotel, Kaliningrad": "https://www.radissonhotels.com/en-us/hotels/radisson-blu-kaliningrad",

  // ---- Booking platforms, Saudi ----
  // The permit and ticket systems a plan sends the customer to. Nusuk is the
  // Ministry's own platform for Rawdah and Umrah permits; the Haramain train
  // is booked through Saudi Arabia Railways, which is why the link is theirs.
  "Nusuk": "https://www.nusuk.sa",
  "Haramain High-Speed Railway": "https://www.sar.com.sa/haramain",
  "Haramain High Speed Railway": "https://www.sar.com.sa/haramain",
  "Haramain High-Speed Train": "https://www.sar.com.sa/haramain",

  // ---- Booking platforms, global ----
  // The names in GLOBAL_PLATFORMS (place-links.ts), which match in every city
  // rather than in one country. Each is the bare global entry point, not a
  // language or country path: these sites all geo-negotiate on their own, and a
  // hardcoded /en/ would be the wrong page for half our readers. bolt.eu
  // answered a request from here with /ar-sa/ unprompted, which is the
  // behaviour being relied on.
  //
  // Several sit behind DataDome or Cloudflare and answer a script with a 403 or
  // a captcha page while loading normally for a real visitor: the same
  // situation as the Marriott and Radisson entries above, and treated the same
  // way.
  "Klook": "https://www.klook.com/",
  "GetYourGuide": "https://www.getyourguide.com/",
  "Viator": "https://www.viator.com/",
  "Tiqets": "https://www.tiqets.com/",
  "Headout": "https://www.headout.com/",
  "Booking.com": "https://www.booking.com/",
  "Agoda": "https://www.agoda.com/",
  "Airbnb": "https://www.airbnb.com/",
  "Expedia": "https://www.expedia.com/",
  "Hotels.com": "https://www.hotels.com/",
  "Traveloka": "https://www.traveloka.com/",
  "Trip.com": "https://www.trip.com/",
  // .net, not .com: .net is the domain Skyscanner's own app listing points at,
  // and the one that answers. A script gets their captcha page, but the domain
  // is theirs.
  "Skyscanner": "https://www.skyscanner.net/",
  "Almosafer": "https://www.almosafer.com/",
  "Careem": "https://www.careem.com",
  "Uber": "https://www.uber.com",
  // One site behind three names, because a bare "Grab" is a verb we refuse to
  // match. See the rejected list in place-links.ts.
  "Grab app": "https://www.grab.com",
  "GrabCar": "https://www.grab.com",
  "GrabFood": "https://www.grab.com",
  // bolt.eu, NOT bolt.com: bolt.com is Bolt Financial, a different company.
  "Bolt app": "https://bolt.eu",
  "inDrive": "https://indrive.com",
  "Gojek": "https://www.gojek.com",
  "Rome2Rio": "https://www.rome2rio.com/",
  // 12go.co resolves too, but the homepage's own links and assets all use
  // 12go.asia, so that is the canonical one.
  "12Go": "https://12go.asia/",
  "Omio": "https://www.omio.com/",
  "Rentalcars.com": "https://www.rentalcars.com/",
  "Discover Cars": "https://www.discovercars.com/",
  "DiscoverCars.com": "https://www.discovercars.com/",
  // trainline.com redirects here, which is what ties the brand to the domain.
  "Trainline": "https://www.thetrainline.com/",
  // The corporate portal. online.ktmb.com.my is the booking surface but was not
  // opened, and this file does not carry URLs nobody has looked at.
  "KTMB": "https://www.ktmb.com.my/",

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

  // ---- Restaurants outside Saudi ----
  // Same rule as the Saudi ones: listed only where the restaurant has its
  // own site and that site was opened and seen showing this restaurant.
  // Checked and left out, so nobody re-adds them from memory: Barbarestan
  // (barbarestan.ge serves a certificate for a different domain), White
  // Rabbit Moscow (expired certificate), Shavi Lomi and Raya Phuket (no
  // site of their own). All four are real and all four fall through to a
  // map search.
  "Blue Elephant Bangkok": "https://blueelephant.com/restaurant/bangkok/",
  "Blue Elephant Phuket": "https://blueelephant.com/restaurant/phuket-restaurant/",
  "Dewakan": "https://dewakan.my/",
  "Kebaya Dining Room": "https://kebaya.com.my/",
  "Twins Garden": "https://twinsgarden.ru/home-eng",

  // ---- Hotels outside Saudi that were opened rather than assumed ----
  // The wider hotel pass that added these cities' second and third
  // properties verified the NAMES against each operator's own domain, which
  // is a lower bar than this file asks of a URL. So only the four below are
  // registered: their own pages were actually loaded and seen offering
  // rooms. The rest carry no URL and fall through to a map search, which is
  // the honest outcome, not a gap to be filled in from memory later.
  "Golden Tulip Borjomi": "https://borjomi.goldentulip.com/en-us/",
  "Grand Hotel Moika 22": "https://moika22-stpetersburg.com/en/",
  "Korston Royal Kazan": "https://korston.ru/en/kazan/hotel/",
  "Kaiserhof Hotel & Spa": "https://kaiserhof-hotel.com/",
};

export function officialUrlFor(placeName: string): string | null {
  return PLACE_URLS[placeName] ?? null;
}
