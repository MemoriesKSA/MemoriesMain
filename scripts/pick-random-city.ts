// Picks a plannable city at random, and says how it is grounded.
//
// For testing without choosing something convenient. A city the pipeline
// happens to hold curated data for is an easier test than one researched from
// nothing, so the report says which this is.
//
//   npx tsx --env-file=.env.local scripts/pick-random-city.ts
//   npx tsx --env-file=.env.local scripts/pick-random-city.ts --seed 7

import { plannableCountries } from "../app/components/planner-data";
import { flagshipCityGuideBySlug } from "../app/flagship-city-data";
import { createSupabaseAdminClient } from "../app/supabase-admin";

const args = process.argv.slice(2);
const si = args.indexOf("--seed");
const SEED = si >= 0 ? Number(args[si + 1]) : Math.floor(Math.random() * 1e9);

async function main() {
  const all: { country: string; countryName: string; city: string; cityLabel: string }[] = [];
  for (const c of plannableCountries) {
    for (const city of c.cities) {
      all.push({ country: c.value, countryName: c.en, city: city.value, cityLabel: city.en });
    }
  }
  const pick = all[SEED % all.length];
  const guide = flagshipCityGuideBySlug(pick.country, pick.city);

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("city_research_cache")
    .select("research_notes, updated_at, curated")
    .eq("city_slug", pick.city)
    .single();
  const notes = String(data?.research_notes ?? "");
  const cats = [...notes.matchAll(/^##cat:(\w+)/gm)].map((m) => m[1]);

  console.log(`seed ${SEED} of ${all.length} plannable cities\n`);
  console.log(`  country:   ${pick.countryName}  (${pick.country})`);
  console.log(`  city:      ${pick.cityLabel}  (${pick.city})`);
  console.log(`  curated city guide: ${guide ? "yes" : "no, researched from nothing"}`);
  console.log(`  research row:       ${data ? `${notes.length} chars, curated=${data.curated}, updated ${String(data.updated_at).slice(0, 10)}` : "MISSING"}`);
  console.log(`  categories stored:  ${cats.length ? cats.join(", ") : "(none, which is normal for a hand-curated row)"}`);
}

main().then(() => process.exit(0));
