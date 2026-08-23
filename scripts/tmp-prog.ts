import { createSupabaseAdminClient } from "../app/supabase-admin";
import { categoriesPresent, missingCategories } from "../app/draft-guide";
import { flagshipCityGuideBySlug } from "../app/flagship-city-data";
const TURKEY = ["istanbul","cappadocia","antalya","bodrum","izmir","fethiye","ankara","bursa","trabzon"];
async function main() {
  const s = createSupabaseAdminClient();
  const { data } = await s.from("city_research_cache").select("city_slug, research_notes, updated_at").in("city_slug", TURKEY);
  const rows = new Map(((data ?? []) as any[]).map((r) => [r.city_slug, r]));
  let done = 0;
  for (const city of TURKEY) {
    const r = rows.get(city);
    const guide = flagshipCityGuideBySlug("turkey", city);
    if (!r) { console.log(`${city.padEnd(12)} —      not started`); continue; }
    const notes = r.research_notes ?? "";
    const miss = guide ? missingCategories(guide, notes) : [];
    if (!miss.length) done++;
    console.log(`${city.padEnd(12)} ${String(notes.length).padStart(6)} chars  ${[...categoriesPresent(notes)].length} cats  ${miss.length ? "missing: " + miss.join(",") : "COMPLETE"}`);
  }
  console.log(`\n${done}/${TURKEY.length} Türkiye cities complete`);
}
main().then(() => process.exit(0));
