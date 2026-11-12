/**
 * Seasons that are on right now: a badge on a city's card and page, and the
 * Saudi Winter band on Discover Saudi.
 *
 * Asked for on 12 Nov 2026: Riyadh should show from the outside that Riyadh
 * Season has opened, and Discover Saudi should point to Saudi Winter the way
 * the tourism authority's own winter page does. Every entry carries its own
 * dates, so a badge comes down by itself when the season ends and nobody has
 * to remember to take it off.
 *
 * The badge is ours, in our own style. Where a season has an official mark
 * (`logo`), the badge carries it: Habib's call on 12 Nov 2026 that Riyadh
 * Season's logo is a public government mark and fine to show. The mark itself
 * is in components/riyadh-season-logo.tsx, copied from riyadhseason.com.
 */

export type CitySeason = {
  country: string;
  city: string;
  /** Inclusive, as YYYY-MM-DD in Saudi time. */
  startsOn: string;
  /** Inclusive. The badge is gone the day after. */
  endsOn: string;
  labelEn: string;
  labelAr: string;
  lineEn: string;
  lineAr: string;
  /** The season's own mark, shown inside the badge. */
  logo?: "riyadh-season";
};

export const CITY_SEASONS: CitySeason[] = [
  {
    country: "saudi-arabia",
    city: "riyadh",
    // Opened 21 October 2026 (the GEA chairman's announcement, reported by
    // Gulf News and Asharq Al-Awsat on 27 September 2026). No official end
    // date was published; Habib, 12 Nov 2026: "it finishes 28 february 2027".
    // The badge's countdown runs to the end of that day, Saudi time. Some
    // zones and events (Battle Dome at Boulevard World, "until 22 May") run on
    // after it. Re-check in January in case the authority announces a date.
    startsOn: "2026-10-21",
    endsOn: "2027-02-28",
    logo: "riyadh-season",
    labelEn: "Riyadh Season is on",
    labelAr: "انطلق موسم الرياض",
    lineEn: "Riyadh Season opened on 21 October and runs until 28 February. Its zones, concerts, shows and sports nights fill the winter, so evenings here are busier than any other time of year.",
    lineAr: "انطلق موسم الرياض في 21 أكتوبر ويستمر حتى 28 فبراير، ومناطقه وحفلاته وعروضه وأمسياته الرياضية تملأ الشتاء، فأمسيات الرياض الآن أحلى من أي وقت في السنة.",
  },
];

/** Today's date in Riyadh, YYYY-MM-DD, so the switch happens at Saudi midnight. */
function saudiToday(now: Date): string {
  return new Date(now.getTime() + 3 * 3600 * 1000).toISOString().slice(0, 10);
}

/** Midnight at the end of the season's final day, Saudi time, as epoch ms. */
export function seasonEndsAt(season: CitySeason): number {
  return Date.parse(`${season.endsOn}T23:59:59+03:00`) + 1000;
}

/** Whether a season is on at a moment, for code that has to decide in the browser because its page is static. */
export function seasonIsOnAt(season: CitySeason, now: number): boolean {
  return now >= Date.parse(`${season.startsOn}T00:00:00+03:00`) && now < seasonEndsAt(season);
}

export function activeSeasonFor(country: string, city: string, now: Date = new Date()): CitySeason | null {
  const today = saudiToday(now);
  return CITY_SEASONS.find((s) => s.country === country && s.city === city && s.startsOn <= today && today <= s.endsOn) ?? null;
}

export type WinterPick = { city: string; lineEn: string; lineAr: string };

/**
 * Saudi Winter 2026–27, from the tourism authority's winter page
 * (visitsaudi.com/ar/campaigns/winter, read 12 November 2026). That page
 * names Riyadh, Jeddah, Al Khobar, the Red Sea, AlUla, Al-Ahsa, Qassim, Hail
 * and a Northern Route from Diriyah to Jubbah. The picks below are the ones
 * with a page on this site, in our own words; Qassim, Hail and the Northern
 * Route get a line in the band until they have pages. The previous edition
 * ran to the end of March, so that is the assumed end here: re-check in
 * February.
 */
export const SAUDI_WINTER = {
  startsOn: "2026-10-21",
  endsOn: "2027-03-31",
  sourceUrlEn: "https://www.visitsaudi.com/en/campaigns/winter",
  sourceUrlAr: "https://www.visitsaudi.com/ar/campaigns/winter",
  picks: [
    {
      city: "riyadh",
      lineEn: "Riyadh Season's zones and shows, and evenings cool enough for the old city.",
      lineAr: "مناطق موسم الرياض وعروضه، وأمسيات باردة تكفي لجولة في الرياض القديمة.",
    },
    {
      city: "alula",
      lineEn: "Cool days for Hegra, Dadan and Elephant Rock, and clear desert nights.",
      lineAr: "أيام معتدلة لزيارة الحجر ودادان وصخرة الفيل، وليالٍ صحراوية صافية.",
    },
    {
      city: "red-sea",
      lineEn: "Island resorts, Shura among them, with calm water for snorkelling and boat days.",
      lineAr: "منتجعات الجزر ومنها جزيرة شورى، وبحر هادئ للسنوركل ورحلات القوارب.",
    },
    {
      city: "jeddah",
      lineEn: "Al Balad's lanes and the sea front, finally cool enough to walk.",
      lineAr: "أزقة البلد والواجهة البحرية، والجو أخيرًا يسمح بالمشي.",
    },
    {
      city: "al-ahsa",
      lineEn: "The UNESCO oasis at its best: palm groves, old souqs and Al Qarah's caves.",
      lineAr: "واحة الأحساء المسجلة في اليونسكو في أحلى أوقاتها: النخيل والأسواق القديمة وكهوف جبل القارة.",
    },
    {
      city: "dammam",
      lineEn: "Al Khobar's waterfront, parks and cafés in the mildest months of the year.",
      lineAr: "واجهة الخبر البحرية وحدائقها ومقاهيها في ألطف أشهر السنة.",
    },
  ] satisfies WinterPick[],
};

export function saudiWinterIsOn(now: Date = new Date()): boolean {
  const today = saudiToday(now);
  return SAUDI_WINTER.startsOn <= today && today <= SAUDI_WINTER.endsOn;
}
