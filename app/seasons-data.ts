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
 * The badge is ours, in our own style. Riyadh Season's logo belongs to the
 * General Entertainment Authority, and putting it here would read as an
 * endorsement we don't have.
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
};

export const CITY_SEASONS: CitySeason[] = [
  {
    country: "saudi-arabia",
    city: "riyadh",
    // Opened 21 October 2026 (the GEA chairman's announcement, reported by
    // Gulf News and Asharq Al-Awsat on 27 September 2026). The headline
    // programme is ten weeks; the wider season is listed to 1 March 2027 and
    // zones like Boulevard World run that long. Re-check the end in January.
    startsOn: "2026-10-21",
    endsOn: "2027-03-01",
    labelEn: "Riyadh Season is on",
    labelAr: "انطلق موسم الرياض",
    lineEn: "Riyadh Season opened on 21 October. Its zones, concerts, shows and sports nights run through the winter, so evenings here are busier than any other time of year.",
    lineAr: "انطلق موسم الرياض في 21 أكتوبر، ومناطقه وحفلاته وعروضه وأمسياته الرياضية مستمرة طوال الشتاء، فأمسيات الرياض الآن أحلى من أي وقت في السنة.",
  },
];

/** Today's date in Riyadh, YYYY-MM-DD, so the switch happens at Saudi midnight. */
function saudiToday(now: Date): string {
  return new Date(now.getTime() + 3 * 3600 * 1000).toISOString().slice(0, 10);
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
