/**
 * What the weather is doing in a city right now.
 *
 * The city pages already say when to come and when it is punishing. Neither
 * answers the question somebody has while reading: what is it like there
 * today? This does, and it earns its place by being tied to the cards above
 * it — the reading is written against today's own high, low and sunset, so a
 * hot number arrives with the sentence that makes it useful.
 *
 * Open-Meteo, chosen because it needs no API key, no signup and no billing
 * relationship to start. Note for later: their free service is offered for
 * non-commercial use, so before this site starts selling, either move to
 * their commercial plan or swap providers. Everything provider-shaped is in
 * fetchLiveWeather, so that is a one-function change and the UI never knows.
 */

export type LiveWeather = {
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  isDay: boolean;
  highC: number;
  lowC: number;
  /** Local wall-clock time in the city, "HH:MM". */
  localTime: string;
  sunrise: string;
  sunset: string;
  conditionEn: string;
  conditionAr: string;
  /** The line under the number. Written against today's own numbers. */
  readingEn: string;
  readingAr: string;
};

/**
 * City-centre coordinates for the fifteen cities whose pages carry a weather
 * panel. Two are regions rather than cities and use the town a visitor would
 * actually be standing in: Aseer reads from the highlands near Abha, and the
 * Red Sea destination from Umluj on that coast.
 */
const COORDS: Record<string, [number, number]> = {
  riyadh: [24.7136, 46.6753],
  jeddah: [21.4858, 39.1925],
  alula: [26.6167, 37.9214],
  makkah: [21.3891, 39.8579],
  madinah: [24.5247, 39.5692],
  "red-sea": [25.0213, 37.2685],
  abha: [18.2164, 42.5053],
  aseer: [18.3000, 42.7300],
  taif: [21.2703, 40.4158],
  "al-ahsa": [25.3833, 49.5833],
  jazan: [16.8892, 42.5511],
  "al-jouf": [29.7890, 40.1000],
  dammam: [26.4207, 50.0888],
  tabuk: [28.3835, 36.5662],
  yanbu: [24.0895, 38.0618],
};

export function hasLiveWeather(citySlug: string): boolean {
  return citySlug in COORDS;
}

// WMO codes, grouped rather than enumerated: a traveller wants "clear" or
// "dusty", not the difference between code 51 and code 53.
export function weatherCondition(code: number, isDay: boolean): { en: string; ar: string } {
  if (code === 0) return isDay ? { en: "Clear", ar: "صحو" } : { en: "Clear night", ar: "ليلة صافية" };
  if (code <= 2) return { en: "Mostly clear", ar: "صحو جزئيًا" };
  if (code === 3) return { en: "Overcast", ar: "غائم" };
  if (code === 45 || code === 48) return { en: "Fog", ar: "ضباب" };
  if (code >= 51 && code <= 57) return { en: "Drizzle", ar: "رذاذ" };
  if (code >= 61 && code <= 67) return { en: "Rain", ar: "مطر" };
  if (code >= 71 && code <= 77) return { en: "Snow", ar: "ثلج" };
  if (code >= 80 && code <= 82) return { en: "Showers", ar: "زخات مطر" };
  if (code >= 95) return { en: "Thunderstorm", ar: "عاصفة رعدية" };
  return { en: "Clear", ar: "صحو" };
}

/** "18:19" from an ISO local timestamp, with no timezone maths of our own. */
function clockFrom(iso: string): string {
  return iso.slice(11, 16);
}

export function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")}${suffix}`;
}

/**
 * The sentence under the temperature.
 *
 * It is written against today's own high, low and sunset rather than against
 * fixed thresholds, so "near today's peak" means what it says in Jazan in
 * August and in Tabuk in January. The peak-heat card above already tells them
 * the season is hot; this tells them where in the day they are standing.
 */
export function weatherReading(tempC: number, highC: number, lowC: number, isDay: boolean, sunset: string, sunrise: string, humidity: number): { en: string; ar: string } {
  const nearPeak = tempC >= highC - 2;
  const humid = humidity >= 65;

  if (!isDay) {
    return {
      en: `Overnight low of ${Math.round(lowC)}°. First light at ${to12h(sunrise)}.`,
      ar: `الصغرى الليلة ${Math.round(lowC)}°. الفجر ${to12h(sunrise)}.`,
    };
  }
  if (nearPeak && tempC >= 38) {
    return {
      en: `About as hot as today gets. It eases from sunset at ${to12h(sunset)}.`,
      ar: `هذه تقريبًا ذروة حرارة اليوم. تبدأ بالانكسار مع الغروب ${to12h(sunset)}.`,
    };
  }
  if (nearPeak) {
    return {
      en: `Today's warmest stretch, cooling toward ${Math.round(lowC)}° tonight.`,
      ar: `أدفأ فترات اليوم، وتنخفض إلى ${Math.round(lowC)}° الليلة.`,
    };
  }
  if (humid) {
    return {
      en: `Humid at ${humidity}%, so it sits heavier than the number suggests.`,
      ar: `الرطوبة ${humidity}%، فيبدو الجو أثقل مما يوحي به الرقم.`,
    };
  }
  if (tempC <= 22) {
    return {
      en: `Comfortable now, up to ${Math.round(highC)}° later.`,
      ar: `الجو مريح الآن، ويصل إلى ${Math.round(highC)}° لاحقًا.`,
    };
  }
  return {
    en: `Climbing toward ${Math.round(highC)}° today, sunset at ${to12h(sunset)}.`,
    ar: `في طريقه إلى ${Math.round(highC)}° اليوم، والغروب ${to12h(sunset)}.`,
  };
}

/**
 * Returns null rather than throwing on any failure. A city page is worth
 * reading without today's temperature on it, and a weather outage must never
 * be the reason a destination page stops rendering.
 */
export async function fetchLiveWeather(citySlug: string): Promise<LiveWeather | null> {
  const coords = COORDS[citySlug];
  if (!coords) return null;

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(coords[0]));
  url.searchParams.set("longitude", String(coords[1]));
  url.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day");
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,sunrise,sunset");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");

  try {
    // Cached for half an hour by the framework, so page views cost nothing
    // upstream: fifteen cities is at most ~720 calls a day however busy the
    // site gets. Weather does not move enough in thirty minutes for anyone
    // to notice, and the alternative is one API call per visitor.
    const response = await fetch(url, { next: { revalidate: 1800 } });
    if (!response.ok) return null;
    const data = await response.json();

    const c = data?.current;
    const d = data?.daily;
    if (!c || !d || typeof c.temperature_2m !== "number") return null;

    const isDay = c.is_day === 1;
    const cond = weatherCondition(Number(c.weather_code), isDay);
    const sunrise = clockFrom(d.sunrise[0]);
    const sunset = clockFrom(d.sunset[0]);
    const line = weatherReading(c.temperature_2m, d.temperature_2m_max[0], d.temperature_2m_min[0], isDay, sunset, sunrise, Math.round(c.relative_humidity_2m));

    return {
      tempC: Math.round(c.temperature_2m),
      feelsLikeC: Math.round(c.apparent_temperature),
      humidity: Math.round(c.relative_humidity_2m),
      isDay,
      highC: Math.round(d.temperature_2m_max[0]),
      lowC: Math.round(d.temperature_2m_min[0]),
      localTime: clockFrom(c.time),
      sunrise,
      sunset,
      conditionEn: cond.en,
      conditionAr: cond.ar,
      readingEn: line.en,
      readingAr: line.ar,
    };
  } catch {
    return null;
  }
}
