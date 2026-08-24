// A customer could choose Paris, submit, and receive nothing at all.
//
// The planner offered every country in travelCountries. The journeys route
// only opened its draft branch for a study request, for Saudi, or for a city
// with a curated guide. 105 cities across 15 countries sat in the gap: the
// team got a brief, the customer got silence, and nothing errored or logged.
//
// The route's own comment records this happening twice before, to Türkiye and
// then to every study request. Three times is a design problem, not a bug, so
// the fix is that one list now answers both questions - what the dropdown
// offers, and what the route will draft. They cannot drift apart.
//
// Two countries then joined without anyone hand-writing a city guide, which
// is the other half of today: a city with no curated data researches the full
// set from nothing rather than researching nothing at all.

import { plannableCountries, showcaseCountries, travelCountries, studyCountries, isPlannableCountry } from "../app/components/planner-data";
import { CATALOGUE_PENDING, countryGuides } from "../app/destination-guide-data";
import { flagshipCityGuideBySlug } from "../app/flagship-city-data";
import { canGroundAPlan, categoriesFor, researchIsComplete, missingCategories } from "../app/draft-guide";
import { PUBLIC_PREVIEW_MAX, publicPreview } from "../app/components/public-preview";

const plannableSlugs = plannableCountries.map((c) => c.value);
const showcaseSlugs = showcaseCountries.map((c) => c.value);
const bothLists = plannableSlugs.filter((s) => showcaseSlugs.includes(s));
const missingFromTravel = plannableSlugs.filter((s) => !travelCountries.some((c) => c.value === s));

// Every plannable city, and whether anything grounds it.
const plannableCities = plannableCountries.flatMap((c) =>
  c.cities.filter((x) => !x.value.startsWith("other-")).map((x) => ({ country: c.value, city: x.value })));
const guided = plannableCities.filter((k) => flagshipCityGuideBySlug(k.country, k.city));
const unguided = plannableCities.filter((k) => !flagshipCityGuideBySlug(k.country, k.city));

const noGuide = categoriesFor(undefined, false).map((c) => c.key);
const riyadh = categoriesFor(flagshipCityGuideBySlug("saudi-arabia", "riyadh"), false).map((c) => c.key);
const kazbegi = categoriesFor(flagshipCityGuideBySlug("georgia", "kazbegi"), false).map((c) => c.key);
const taif = categoriesFor(flagshipCityGuideBySlug("saudi-arabia", "taif"), false).map((c) => c.key);
const makkah = categoriesFor(flagshipCityGuideBySlug("saudi-arabia", "makkah"), false).map((c) => c.key);
const tbilisi = categoriesFor(flagshipCityGuideBySlug("georgia", "tbilisi"), false).map((c) => c.key);

const sevenCats = ["dining", "drivers", "stays", "sights", "halal", "rentals", "flights"]
  .map((k) => `##cat:${k}\n.`).join("\n");

const cases: [string, unknown, unknown][] = [
  // One list, two consumers.
  ["the planner offers a real subset, not everything", plannableSlugs.length < travelCountries.length, true],
  ["and nothing is in both lists", bothLists.length, 0],
  ["and the two halves account for every travel country", plannableSlugs.length + showcaseSlugs.length, travelCountries.length],
  ["every plannable country really exists in travelCountries", missingFromTravel.length, 0],
  ["the route's own check agrees with the planner list", plannableSlugs.every(isPlannableCountry), true],
  ["and refuses everything the planner does not offer", showcaseSlugs.some(isPlannableCountry), false],

  // The specific countries, because the whole point was Paris.
  ["France is browse-only", isPlannableCountry("france"), false],
  ["so is Japan, for holidays", isPlannableCountry("japan"), false],
  ["Türkiye still plans", isPlannableCountry("turkey"), true],
  ["the Philippines is new and plannable", isPlannableCountry("philippines"), true],
  ["Indonesia too", isPlannableCountry("indonesia"), true],
  ["and the UAE", isPlannableCountry("uae"), true],

  // Study is a separate path and must not have been narrowed with tourism.
  ["Japan still takes study requests", studyCountries.some((c) => c.value === "japan"), true],
  ["so does the UK", studyCountries.some((c) => c.value === "united-kingdom"), true],
  ["and Australia", studyCountries.some((c) => c.value === "australia"), true],
  ["and Canada", studyCountries.some((c) => c.value === "canada"), true],

  // A browse-only country keeps its story page. That is the whole deal.
  ["France still has a destination page", countryGuides.some((c) => c.slug === "france"), true],
  ["and Italy", countryGuides.some((c) => c.slug === "italy"), true],

  // A plannable country with no photography stays out of the catalogue
  // rather than shipping a broken tile, and the Philippines just joined it.
  ["the Philippines is held out of the catalogue", CATALOGUE_PENDING.has("philippines"), true],
  ["but is still plannable while it waits", isPlannableCountry("philippines"), true],
  ["and every pending country is one we can actually plan", [...CATALOGUE_PENDING].every(isPlannableCountry), true],

  // Research from nothing. Three separate guards used to refuse this.
  ["a city with no guide researches the full set", noGuide.length, 7],
  ["including somewhere to sleep", noGuide.includes("stays"), true],
  ["but not opening hours, which need a list to check against", noGuide.includes("hours"), false],
  ["a fully curated city is unchanged", riyadh.includes("stays"), false],
  ["and still tops up what it lacks", riyadh.includes("halal"), true],
  // Kazbegi has held exactly one hotel through every rewarm, because nothing
  // ever researched hotels: curated data always supplied them.
  ["a city holding one hotel researches more", kazbegi.includes("stays"), true],
  // Counted the way the drafting pass counts them. Reading only `stay` and
  // ignoring `extendedStay` said Taif held one hotel when the draft can see
  // five, and would have bought hotels for thirteen cities that had plenty.
  ["a city thin in `stay` but deep in `extendedStay` is left alone", taif.includes("stays"), false],
  ["and Makkah, which holds seven across both lists", makkah.includes("stays"), false],
  ["while a genuinely thin city is not", tbilisi.includes("stays"), true],

  ["seven stored categories reads as complete", researchIsComplete(undefined, sevenCats, false), true],
  ["and nothing is left to buy", missingCategories(undefined, sevenCats, false).length, 0],
  ["empty notes need all seven", missingCategories(undefined, "", false).length, 7],

  // The fourth guard. The route was fixed, categoriesFor was fixed,
  // researchOperationalFacts was fixed, the pre-warm script was fixed, and a
  // real Bali request still produced no plan at all, because generateDraftGuide
  // had its own copy of the same rule. Found by running a draft rather than by
  // reading the code, which is how all four of them were found.
  ["Bali drafts without curated data", canGroundAPlan("indonesia", "bali", false, false), true],
  ["so does Manila", canGroundAPlan("philippines", "manila", false, false), true],
  ["and Dubai", canGroundAPlan("uae", "dubai", false, false), true],
  ["a curated city still drafts", canGroundAPlan("turkey", "istanbul", true, false), true],
  ["a study city always drafts, it never had curated data", canGroundAPlan("japan", "osaka", false, true), true],

  // And it still refuses what it should. These produce no plan on purpose.
  ["a browse-only country does not draft", canGroundAPlan("france", "paris", false, false), false],
  ["nor does the Other-city placeholder", canGroundAPlan("indonesia", "other-indonesia", false, false), false],
  ["even in a country we plan", canGroundAPlan("turkey", "other-turkey", false, false), false],
  ["a study request is exempt from the placeholder rule", canGroundAPlan("japan", "other-japan-study", false, true), true],

  // The free page shows a taste, the draft still gets everything.
  ["the public page caps at two", PUBLIC_PREVIEW_MAX, 2],
  ["a long list is cut", publicPreview([1, 2, 3, 4, 5, 6]).length, 2],
  ["a short one is left alone", publicPreview([1]).length, 1],
  ["an absent one does not throw", publicPreview(undefined).length, 0],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}

console.log(`\n${pass}/${cases.length} passed`);
console.log(`planner offers ${plannableSlugs.length} countries, ${plannableCities.length} cities · ${guided.length} curated, ${unguided.length} researched from nothing`);
console.log(`browse-only: ${showcaseSlugs.join(", ")}`);
if (pass !== cases.length) process.exit(1);
