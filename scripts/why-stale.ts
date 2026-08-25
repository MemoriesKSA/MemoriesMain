// Why a city's research was re-bought when it looked fresh.
//
// A Dubai draft re-researched two categories it appeared to already hold, and
// that spend plus its deadline is part of what pushed the function past its
// ceiling. "It looked fine in the table" is not a diagnosis.
//
//   npx tsx --env-file=.env.local scripts/why-stale.ts dubai

import { createSupabaseAdminClient } from "../app/supabase-admin";
import { RESEARCH_SCOPE_VERSION, readScopeVersion, researchIsComplete, missingCategories, categoriesFor } from "../app/draft-guide";
import { flagshipCityGuideBySlug } from "../app/flagship-city-data";

const slug = process.argv[2] ?? "dubai";

async function main() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("city_research_cache")
    .select("research_notes, updated_at, curated")
    .eq("city_slug", slug)
    .single();
  if (error) { console.error(error.message); process.exit(1); }

  const raw = String(data?.research_notes ?? "");
  const { version, notes } = readScopeVersion(raw);
  const guide = flagshipCityGuideBySlug("uae", slug);
  const wanted = categoriesFor(guide, false).map((c) => c.key);

  console.log(`${slug}`);
  console.log(`  updated_at:     ${data?.updated_at}`);
  console.log(`  curated flag:   ${data?.curated}`);
  console.log(`  stored scope:   v${version}   (current v${RESEARCH_SCOPE_VERSION})`);
  console.log(`  has city guide: ${!!guide}`);
  console.log(`  categories wanted:  ${wanted.join(", ")}`);
  console.log(`  categories present: ${[...notes.matchAll(/^##cat:(\w+)/gm)].map((m) => m[1]).join(", ")}`);
  console.log(`  complete:       ${researchIsComplete(guide, notes, false)}`);
  console.log(`  missing:        ${missingCategories(guide, notes, false).join(", ") || "(none)"}`);
  console.log(`\n  => stale because: ${version !== RESEARCH_SCOPE_VERSION ? `scope v${version} != v${RESEARCH_SCOPE_VERSION}` : "scope matches; check age and completeness above"}`);
}

main().then(() => process.exit(0));
