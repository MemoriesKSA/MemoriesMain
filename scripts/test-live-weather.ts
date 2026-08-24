// The number on the page is easy. The sentence under it is where this can
// embarrass us.
//
// A live temperature on its own is a fact nobody asked for. What makes it
// worth the section is the line beneath, and that line is generated against
// today's own high, low and sunset rather than against fixed thresholds -
// so "about as hot as today gets" means something in Jazan in August and in
// Tabuk in January, where the same absolute number would mean opposite
// things. These assertions pin the branches so a later edit cannot quietly
// tell somebody it is a mild afternoon at 44 degrees.
//
// No network here. fetchLiveWeather is the only thing that talks to the API,
// and it returns null on any failure, which is checked as a contract rather
// than by taking the site down to prove it.

import { weatherReading, weatherCondition, to12h, hasLiveWeather } from "../app/weather-live";
import { travelCountries } from "../app/components/planner-data";
import { flagshipCityGuideBySlug, isEditorialGuide } from "../app/flagship-city-data";

// Every city whose page renders the weather panel.
const panelCities: string[] = [];
for (const c of travelCountries) {
  for (const city of c.cities.filter((x) => !x.value.startsWith("other-"))) {
    const g = flagshipCityGuideBySlug(c.value, city.value) as { weather?: unknown } | undefined;
    if (g && isEditorialGuide(g as never) && g.weather) panelCities.push(city.value);
  }
}
const panelWithoutCoords = panelCities.filter((s) => !hasLiveWeather(s));

// A blazing afternoon, a mild one, a humid coast, a cold night.
const riyadhNoon = weatherReading(43, 43, 33, true, "18:19", "05:31", 8);
const abhaNoon = weatherReading(30, 31, 19, true, "18:40", "05:50", 40);
const jeddahMuggy = weatherReading(31, 36, 28, true, "18:55", "05:45", 78);
const tabukMorning = weatherReading(14, 24, 8, true, "17:10", "06:40", 30);
const night = weatherReading(29, 41, 27, false, "18:19", "05:31", 20);

const cases: [string, unknown, unknown][] = [
  // Every page that shows the panel must have somewhere to read from. Add a
  // sixteenth editorial city without coordinates and this fails rather than
  // the panel silently going missing on one city.
  ["every city with a weather panel has coordinates", panelWithoutCoords.length, 0],
  ["and there are fifteen of them", panelCities.length, 15],
  ["a city we hold no coordinates for says so", hasLiveWeather("bali"), false],

  // Peak heat. The card above already says the season is brutal; this says
  // where in the day you are standing, and when it lets up.
  ["43 against a high of 43 reads as the peak", riyadhNoon.en.includes("as hot as today gets"), true],
  ["and points at the hour it eases", riyadhNoon.en.includes("6:19pm"), true],
  ["in Arabic too", riyadhNoon.ar.includes("ذروة حرارة اليوم"), true],

  // Near the high but not punishing: the same branch would be wrong.
  ["30 against a high of 31 is the warmest stretch, not the peak", abhaNoon.en.includes("warmest stretch"), true],
  ["and never claims it is as hot as it gets", abhaNoon.en.includes("as hot as today gets"), false],
  ["it names tonight's low", abhaNoon.en.includes("19"), true],

  // Humidity is the thing the number hides on that coast.
  ["a humid afternoon says so", jeddahMuggy.en.includes("Humid"), true],
  ["with the actual figure", jeddahMuggy.en.includes("78%"), true],

  // Cool morning: the useful fact is where it is going, not where it is.
  ["a cold morning reads as comfortable", tabukMorning.en.includes("Comfortable"), true],
  ["and points at the day's high", tabukMorning.en.includes("24"), true],

  // Night wins over everything: nobody needs a sunset time after dark.
  ["after dark it talks about the low and first light", night.en.includes("Overnight low"), true],
  ["and never mentions sunset", night.en.includes("sunset"), false],
  ["even when the temperature is far below the day's high", night.en.includes("27"), true],

  // Conditions, grouped rather than enumerated.
  ["code 0 by day is clear", weatherCondition(0, true).en, "Clear"],
  ["code 0 at night says so", weatherCondition(0, false).en, "Clear night"],
  ["code 3 is overcast", weatherCondition(3, true).en, "Overcast"],
  ["the rain band maps to rain", weatherCondition(63, true).en, "Rain"],
  ["the shower band is separate", weatherCondition(81, true).en, "Showers"],
  ["thunderstorms are called out", weatherCondition(95, true).en, "Thunderstorm"],
  ["an unknown code still says something", weatherCondition(999, true).en.length > 0, true],
  ["and every condition has Arabic", weatherCondition(63, true).ar, "مطر"],

  // Clock conversion, where midnight and noon are the classic mistakes.
  ["evening converts", to12h("18:19"), "6:19pm"],
  ["morning converts", to12h("05:31"), "5:31am"],
  ["noon is 12pm, not 0pm", to12h("12:00"), "12:00pm"],
  ["midnight is 12am, not 0am", to12h("00:07"), "12:07am"],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
if (panelWithoutCoords.length) console.log(`\nno coordinates for: ${panelWithoutCoords.join(", ")}`);
console.log(`\n${pass}/${cases.length} passed  ·  live weather on ${panelCities.length} cities`);
if (pass !== cases.length) process.exit(1);
