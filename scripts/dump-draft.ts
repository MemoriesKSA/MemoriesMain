// Prints a finished draft and the machine lines behind it, for judging one.
//
//   npx tsx --env-file=.env.local scripts/dump-draft.ts 40AE1B7C
//   npx tsx --env-file=.env.local scripts/dump-draft.ts 40AE1B7C --full
//   npx tsx --env-file=.env.local scripts/dump-draft.ts 40AE1B7C --grep "Bab Al Shams"

import { createSupabaseAdminClient } from "../app/supabase-admin";
import { parsePickNames, parseContextPlaceNames, parseSiteLinks, parseNameAliases } from "../app/journey/plan-stops";

const args = process.argv.slice(2);
const reference = (args[0] ?? "").toUpperCase();
const FULL = args.includes("--full");
const gi = args.indexOf("--grep");
const GREP = gi >= 0 ? args[gi + 1] : "";

function paragraphsAbout(text: string, needle: string): string[] {
  if (!needle) return [];
  return text
    .split(/\n{2,}/)
    .filter((p) => p.toLowerCase().includes(needle.toLowerCase()));
}

async function main() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("reference, public_token, city, status, itinerary_en, itinerary_ar, notes")
    .eq("reference", reference)
    .limit(1);
  if (error) { console.error(error.message); process.exit(1); }
  const row = data?.[0];
  if (!row) { console.error("no such draft"); process.exit(1); }

  const en = String(row.itinerary_en ?? "");
  const ar = String(row.itinerary_ar ?? "");
  const notes = String(row.notes ?? "");

  console.log(`${row.reference} · ${row.city} · ${row.status}`);
  console.log(`english ${en.length} chars · arabic ${ar.length} chars (${Math.round((ar.length / en.length) * 100)}%)\n`);

  const picks = parsePickNames(notes);
  const places = parseContextPlaceNames(notes);
  const sites = parseSiteLinks(notes);
  const aliases = parseNameAliases(notes);

  console.log(`PICKS  (${picks.length}): ${picks.join(" | ")}`);
  console.log(`\nPLACES (${places.length}): ${places.join(" | ")}`);
  console.log(`\nSITES  (${Object.keys(sites).length}):`);
  for (const [name, url] of Object.entries(sites)) console.log(`   ${name}  ->  ${url}`);
  console.log(`\nARABIC ALIASES (${Object.keys(aliases).length}):`);
  for (const [a, e] of Object.entries(aliases).slice(0, 40)) console.log(`   ${a}  ->  ${e}`);

  // Whether the Arabic half can actually be linked: how many of the names we
  // hold are findable in the Arabic text.
  const allNames = [...picks, ...places];
  const inArabic = allNames.filter((n) => ar.includes(n));
  const inEnglish = allNames.filter((n) => en.includes(n));
  console.log(`\nnames present in the English text: ${inEnglish.length}`);
  console.log(`names present in the Arabic text:  ${inArabic.length}`);

  // Matches the wording the pipeline actually stores. The first version looked
  // for a bare VERDICT: token and reported "not found" on a draft whose notes
  // plainly said "AI self-check: CLEAN", which is a diagnostic lying about the
  // thing it exists to check.
  const verdict = notes.match(/AI self-check[^\n]*/i) ?? notes.match(/VERDICT:\s*\w+/i);
  console.log(`\nself-check: ${verdict ? verdict[0].trim() : "not found in notes"}`);

  if (GREP) {
    console.log(`\n================ ENGLISH paragraphs mentioning "${GREP}" ================`);
    for (const p of paragraphsAbout(en, GREP)) console.log("\n" + p);
    console.log(`\n================ ARABIC paragraphs mentioning "${GREP}" ================`);
    for (const p of paragraphsAbout(ar, GREP)) console.log("\n" + p);
  }

  if (FULL) {
    console.log("\n================ ENGLISH ================\n");
    console.log(en);
    console.log("\n================ NOTES ================\n");
    console.log(notes);
  }
}

main().then(() => process.exit(0));
