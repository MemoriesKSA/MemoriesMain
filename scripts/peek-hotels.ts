// Which named properties a city's stored research actually mentions.
//
// Used to set up an honest test of the named-request path: if we are going to
// ask a draft about a hotel the research has never heard of, we should confirm
// it has never heard of it rather than assume.
//
//   npx tsx --env-file=.env.local scripts/peek-hotels.ts dubai "Lapita" "Atlantis"

import { createSupabaseAdminClient } from "../app/supabase-admin";

const [citySlug, ...names] = process.argv.slice(2);

async function main() {
  if (!citySlug) { console.error("usage: peek-hotels.ts <city-slug> [name...]"); process.exit(1); }
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("city_research_cache")
    .select("city_slug, research_notes, updated_at")
    .eq("city_slug", citySlug)
    .single();
  if (error) { console.error("could not read:", error.message); process.exit(1); }

  const notes = String(data?.research_notes ?? "");
  const cats = notes.split(/^##cat:/m).slice(1).map((p) => p.split("\n")[0].trim());
  console.log(`${citySlug}: ${notes.length} chars, updated ${data?.updated_at}`);
  console.log(`categories: ${cats.join(", ")}\n`);

  const hay = notes.toLowerCase();
  for (const name of names) {
    console.log(`${hay.includes(name.toLowerCase()) ? "IN RESEARCH " : "absent     "} ${name}`);
  }

  // Every capitalised multi-word phrase that looks like a property name, so we
  // can see what the stays category actually holds.
  const stays = notes.split(/^##cat:/m).find((p) => p.startsWith("stays")) ?? "";
  const found = [...new Set(stays.match(/\b[A-Z][A-Za-z']+(?: [A-Z&][A-Za-z']+){1,4}\b/g) ?? [])];
  console.log(`\nnames inside the stays category (${stays.length} chars):`);
  console.log("  " + found.slice(0, 40).join(" · "));
}

main().then(() => process.exit(0));
