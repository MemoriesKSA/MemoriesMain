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
 * Characters that make a name part of a longer word rather than its own.
 *
 * \p{M} is in here because Arabic diacritics are marks, not letters, and
 * without it the boundary walked straight past one: "المسافر" matched inside
 * "أعمار المسافرَين" purely because of the fatha, while the same sentence
 * unvowelled was correctly left alone. It reaches names we already ship -
 * "نسك" matched inside "نسكَن" too. Rare in ordinary prose and invisible when
 * it happens, which is the worst combination for something that blanks words
 * out of a plan behind the paywall.
 */
const WORD_CHAR = "[\\p{L}\\p{N}\\p{M}]";

/**
 * Arabic attaches و ف ب ك ل to the front of a word, so "وديرة" is still Deira.
 * One of them is allowed, provided it sits at the start of a word itself.
 */
const PROCLITIC = "[وفبكل]";

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Matches these names only where each stands as its own word.
 *
 * Without the boundaries a name matched anywhere in a line, and a Riyadh plan
 * linked the rental company National inside the word "international", twice in
 * one sentence: "King Khalid Inter[national]". Arabic had it worse, because
 * the definite article makes short names common inside longer words: "جديرة"
 * (worth knowing) came out as "ج[ديرة]", linking Deira inside an ordinary
 * adjective.
 *
 * The same rule guards the paywall, which redacts from the same list. A missed
 * boundary there does not add a stray link, it blanks letters out of an
 * innocent word in a plan somebody is deciding whether to buy.
 *
 * Names must arrive longest-first so the alternation prefers the fullest name
 * over a fragment of it.
 */
export function placeMatchPattern(names: string[]): RegExp | null {
  const usable = names.filter(Boolean);
  if (!usable.length) return null;
  const before = `(?:(?<!${WORD_CHAR})|(?<=(?<!${WORD_CHAR})${PROCLITIC}))`;
  const after = `(?!${WORD_CHAR})`;
  return new RegExp(`${before}(${usable.map(escapeRegex).join("|")})${after}`, "giu");
}

/**
 * A map search for a place, in its own city and its own country.
 *
 * The country used to be the literal string "Saudi Arabia", which was
 * correct while the data was Saudi and silently wrong the moment it wasn't:
 * "Hagia Sophia, Istanbul, Saudi Arabia" finds nothing at all.
 */
export function mapsSearchUrl(placeName: string, cityLabel: string, countryName = "", kind = "") {
  // The kind rides just behind the name, unpunctuated, because it is a search
  // term rather than part of an address: "National car rental, Riyadh".
  //
  // Without it a common word is a guess, and Maps resolves the guess per
  // reader. "National, Riyadh" gave the National Museum on one laptop, an
  // oil-change shop searched in Arabic on another, and the right car rental
  // desk on a phone. Three answers, one link, because ranking is personalised
  // and the query never said what we meant. Skipped when the name already
  // contains it, so "National Car Rental" is not asked for twice.
  const named = kind && !placeName.toLowerCase().includes(kind.toLowerCase())
    ? `${placeName} ${kind}`
    : placeName;
  const query = [named, cityLabel, countryName].filter(Boolean).join(", ");
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

/**
 * Every name in this city a plan can link, used for BOTH linkifying a paid
 * plan and redacting an unpaid one.
 *
 * One list, deliberately. A name we can link is a name we have to be able to
 * hide, and while these were two lists they drifted: the national chains and
 * the platforms below sat in the linking half and not the hiding half, so an
 * unpaid reader still got a working link to them.
 *
 * The paywall used to hide only the hotels, arguing that blurring anything
 * more would leave the overview meaningless rather than tantalising. That drew
 * the line in the wrong place twice over. "Al Hussain, 75/8 Sukhumvit Soi 3/1,
 * homely cooking with fresh naan" is a finished, actionable answer, and so are
 * the airport transfer and the district to stay in: all of it is the same
 * researched work, sitting in a plan nobody has bought.
 *
 * What stays readable is everything that proves the work is real and none of
 * which can be acted on: the reasoning, every price and range, the halal and
 * prayer guidance, the day structure, the warnings and the hedges. The reader
 * sees that there is a Muslim-run kitchen at a known price and that we have a
 * reason for it. They just cannot see which one it is.
 */
// Checked and rejected, so nobody re-adds them from memory. Every name here is
// a real platform whose URL we hold; what is wrong with it is the NAME, not the
// site. This list is also the redaction list, so an ordinary word does double
// damage: a wrong link on a paid plan, and a blurred everyday word in the free
// preview somebody is deciding on.
//
//   Grab (bare)      an English verb. Our own paywall fixture opens "Grab lunch
//                    at Al Baik", and the Langkawi plan writes "the macaques
//                    will grab loose items". Shipped as "Grab app"/GrabCar.
//   Bolt (bare)      an English noun: a bolt of silk in the souq. As "Bolt app".
//   Kayak            an English noun, and dangerous exactly where we sell:
//                    "hire a kayak on the mangrove tour". Skyscanner does the
//                    same job with no ambiguity, so this one is not worth
//                    rescuing at all.
//   Booking, Trip,   the bare, unsuffixed forms. Across the stored plans
//   Hotels           "Booking" appears mostly as the gerund and "Trip" as the
//                    ordinary noun; the dotted forms are almost always the
//                    company. The suffix is the entry. Do not add the bare form
//                    "so a draft that writes 'book it on Booking' still links":
//                    that trades one missed link against a blurred word in
//                    every "your trip to Langkawi".
//   Discover (bare)  our own navigation label, "Discover Saudi Arabia".
//   KTM (bare)       also a motorcycle marque. Only the operator's own "KTMB".
//   كريم             generous, a very common man's name, the loanword for
//                    cream, and رمضان كريم. The proclitic rule adds وكريم and
//                    بكريم on top. The worst false positive available to us.
//                    Shipped only as تطبيق كريم.
//   غراب             a crow, on an island sold for its birdlife. Only تطبيق غراب.
//   المسافر          "the traveller", the most predictable noun in a travel plan.

/**
 * The platforms and apps a plan sends the customer to, anywhere in the world.
 *
 * Same argument as the Saudi PLATFORMS list above, minus the border. A plan
 * that says "Klook and GetYourGuide sell the same charter" and then leaves the
 * reader to go and find Klook has stopped one step short of the thing being
 * sold. Every Malaysia plan we have written did exactly that, because the only
 * platform list we had was gated to Saudi Arabia.
 *
 * Not gated to a country, because these are not of one: Klook, Agoda, Uber and
 * Rome2Rio are the right answer in Langkawi, Istanbul and Tbilisi alike. If a
 * national operator whose name is not self-gating ever goes in here, give it a
 * country map rather than letting it match everywhere.
 *
 * The Arabic column is the Latin brand string for most entries, which looks
 * like an oversight and is not: our own Arabic drafts write these names in
 * Latin inside Arabic sentences ("ويبيع Klook وGetYourGuide النمط نفسه"), and
 * the matcher already handles a Latin token after a glued Arabic proclitic. So
 * the Latin form has both the wider coverage and no way at all to collide with
 * Arabic prose. The attested Arabic spellings follow as extra rows, each one
 * checked against the ordinary words it could shadow.
 */
export const GLOBAL_PLATFORMS: { en: string; ar: string }[] = [
  // Tours, tickets and activities.
  { en: "Klook", ar: "Klook" },
  { en: "GetYourGuide", ar: "GetYourGuide" },
  { en: "Viator", ar: "Viator" },
  { en: "Tiqets", ar: "Tiqets" },
  // Safe bare, because "head out" is two words and cannot match one token.
  { en: "Headout", ar: "Headout" },

  // Stays. The dotted forms only, for the reason in the rejected list above.
  { en: "Booking.com", ar: "Booking.com" },
  { en: "Agoda", ar: "Agoda" },
  { en: "Airbnb", ar: "Airbnb" },
  { en: "Expedia", ar: "Expedia" },
  { en: "Hotels.com", ar: "Hotels.com" },

  // Flights.
  { en: "Traveloka", ar: "Traveloka" },
  { en: "Trip.com", ar: "Trip.com" },
  { en: "Skyscanner", ar: "Skyscanner" },
  // Latin on purpose: المسافر is "the traveller" long before it is a brand.
  { en: "Almosafer", ar: "Almosafer" },

  // Ride-hailing, in the forms that are not also ordinary words.
  { en: "Careem", ar: "Careem" },
  { en: "Uber", ar: "Uber" },
  { en: "Grab app", ar: "Grab app" },
  { en: "GrabCar", ar: "GrabCar" },
  { en: "GrabFood", ar: "GrabFood" },
  { en: "Bolt app", ar: "Bolt app" },
  { en: "inDrive", ar: "inDrive" },
  { en: "Gojek", ar: "Gojek" },

  // Ground transport, rail and car hire.
  { en: "Blacklane", ar: "Blacklane" },
  { en: "Rome2Rio", ar: "Rome2Rio" },
  { en: "12Go", ar: "12Go" },
  { en: "Omio", ar: "Omio" },
  { en: "Rentalcars.com", ar: "Rentalcars.com" },
  // Two words only, and the company's own one-word spelling. Never "Discover".
  { en: "Discover Cars", ar: "Discover Cars" },
  { en: "DiscoverCars.com", ar: "DiscoverCars.com" },
  { en: "Trainline", ar: "Trainline" },
  { en: "KTMB", ar: "KTMB" },

  // The attested Arabic spellings. Extra rows rather than replacements: the
  // English repeats so the same URL attaches to both, and the list is deduped.
  { en: "Klook", ar: "كلوك" },
  { en: "GetYourGuide", ar: "جيت يور جايد" },
  { en: "Traveloka", ar: "ترافيلوكا" },
  // The trailing alef is what keeps it out of أجود and أجودها.
  { en: "Agoda", ar: "أجودا" },
  // The boundary keeps both of these out of أوبرا and دار الأوبرا. Two rows
  // because the matcher does no hamza normalising, so the bare-alef spelling
  // needs its own.
  { en: "Uber", ar: "أوبر" },
  { en: "Uber", ar: "اوبر" },
  // Safe bare in Arabic, where a bolt is مسمار or برغي.
  { en: "Bolt app", ar: "بولت" },
  { en: "inDrive", ar: "إن درايف" },
  { en: "inDrive", ar: "ان درايف" },
  { en: "Gojek", ar: "جوجيك" },
  { en: "Gojek", ar: "غوجيك" },
  // The only safe Arabic forms for these two. See the rejected list above.
  { en: "Careem", ar: "تطبيق كريم" },
  { en: "Grab app", ar: "تطبيق غراب" },
];

export function placeNamesForCity(cityLabel: string, ar: boolean): string[] {
  const guides = guidesForLabel(cityLabel);
  const inSaudi = guides.some((g) => g.countrySlug === NATIONAL_CHAINS_COUNTRY);

  const names = [
    // First, and outside any guard: a city we hold no guide for used to return
    // an empty list and therefore no links at all, and Agoda is still the right
    // answer there whether or not we have written that city's dining list yet.
    ...GLOBAL_PLATFORMS.map((p) => (ar ? p.ar : p.en)),
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
  // the "Kingdom Centre" sitting inside it: we neither link a fragment nor
  // redact one and leave the rest of the name standing.
  return [...new Set(names.filter((n) => n && n.trim().length > 3))].sort((a, b) => b.length - a.length);
}

/**
 * Just the hotels. Kept because the reviewer tooling and the tests still ask
 * for exactly the stays; the paywall itself now redacts every name a plan
 * could link, see placeNamesForCity.
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

  const map: Record<string, string> = {};
  const add = (nameEn: string, nameAr: string) => {
    const url = officialUrlFor(nameEn);
    if (!url) return;
    // Both languages point at the same official site, since that is where
    // the customer actually books regardless of which page they are reading.
    map[nameEn.toLowerCase()] = url;
    if (nameAr) map[nameAr.toLowerCase()] = url;
  };

  // Global first, so a city holding its own entry for the same name still wins
  // on the overwrite below.
  GLOBAL_PLATFORMS.forEach((p) => add(p.en, p.ar));

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
