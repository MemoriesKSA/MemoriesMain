// Why a name in a plan is not a link.
//
// The answer is almost always the same and almost never obvious from the page:
// the linkifier only knows the names on the draft's own marker lines plus our
// city data, so anything the prose names but the markers omit renders as dead
// text. This says which of those two happened for a given word.
//
//   npx tsx --env-file=.env.local scripts/why-no-link.ts 78445EDD Klook GetYourGuide

import { createSupabaseAdminClient } from "../app/supabase-admin";
import { parseAllNamedPlaces, parseSiteLinks } from "../app/journey/plan-stops";
import { placeNamesForCity, officialUrlMapForCity } from "../app/journey/place-links";

const reference = (process.argv[2] ?? "").toUpperCase();
const words = process.argv.slice(3);

async function main() {
  if (!reference || !words.length) {
    console.error("usage: why-no-link.ts <REFERENCE> <word> [word...]");
    process.exit(2);
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("proposals")
    .select("reference, city, notes, itinerary_en, itinerary_ar")
    .eq("reference", reference)
    .maybeSingle();

  if (!data) {
    console.error(`${reference}: no such plan`);
    process.exit(1);
  }

  const notes = String(data.notes ?? "");
  const city = String(data.city ?? "");
  const named = parseAllNamedPlaces(notes);
  const sites = parseSiteLinks(notes);
  const fromCity = [...placeNamesForCity(city, false), ...placeNamesForCity(city, true)];
  const cityUrls = officialUrlMapForCity(city);
  const text = `${data.itinerary_en ?? ""}\n${data.itinerary_ar ?? ""}`;

  console.log(`${reference}  ${city}\n`);
  for (const word of words) {
    const inProse = text.toLowerCase().includes(word.toLowerCase());
    const inMarkers = named.some((n) => n.toLowerCase() === word.toLowerCase());
    const inCityData = fromCity.some((n) => n.toLowerCase() === word.toLowerCase());
    const url = sites[word.toLowerCase()] ?? cityUrls[word.toLowerCase()] ?? null;

    console.log(`  ${word}`);
    console.log(`    in the plan's prose      ${inProse ? "yes" : "no"}`);
    console.log(`    on a PICKS/PLACES line   ${inMarkers ? "yes" : "no"}`);
    console.log(`    in our own city data     ${inCityData ? "yes" : "no"}`);
    console.log(`    official URL known       ${url ?? "no"}`);
    console.log(
      `    => ${
        !inProse
          ? "not in this plan at all"
          : inMarkers || inCityData
            ? url
              ? "links to its own site"
              : "links to a map search"
            : "DEAD TEXT: the prose names it, nothing else does"
      }\n`,
    );
  }
}

main().then(() => process.exit(0));
