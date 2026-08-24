// Re-buys only the research categories that were cut off mid-sentence.
//
// The research call ran with max_tokens 4000, shared between adaptive
// thinking, a dozen web-search tool blocks and the written report. The report
// lost. 217 of 532 stored categories end mid-word, across 82 of 88 cities,
// and the drafting pass then finishes those sentences itself: a mosque handed
// a full name from "Masjid Istiq", a claim that most students cycle from
// "Cycling is a real cost lever:".
//
// The ceiling is raised now, but raising it does nothing for what is already
// stored. Bumping RESEARCH_SCOPE_VERSION would re-buy all 532 categories at
// roughly $210. This drops only the damaged ones from the stored notes and
// lets the ordinary pre-warm see them as missing, which is the resumable
// design working exactly as intended: about 217 categories and $87.
//
//   npx tsx --env-file=.env.local scripts/repair-truncated-research.ts
//   npx tsx --env-file=.env.local scripts/repair-truncated-research.ts --apply

import { createSupabaseAdminClient } from "../app/supabase-admin";

const APPLY = process.argv.includes("--apply");

/** A category body that stops without finishing its last sentence. */
function endsMidSentence(body: string): boolean {
  const trimmed = body.trim();
  if (!trimmed) return false;
  return !/[.!?)\]"»۔؟]$/.test(trimmed);
}

type Cat = { key: string; body: string; raw: string };

function splitCategories(notes: string): { scope: string; cats: Cat[] } {
  const parts = notes.split(/^##cat:/m);
  // Anything before the first marker is the scope line and belongs at the top.
  const scope = parts.shift()?.trim() ?? "";
  const cats = parts.map((p) => {
    const key = p.split("\n")[0].trim();
    const body = p.slice(p.indexOf("\n")).trim();
    return { key, body, raw: `##cat:${p.replace(/\s+$/, "")}` };
  });
  return { scope, cats };
}

async function main() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("city_research_cache").select("city_slug, research_notes, curated");
  if (error) { console.error("Could not read the cache:", error.message); process.exit(1); }

  let scanned = 0, damagedCities = 0, dropped = 0, kept = 0;
  const plan: { slug: string; drop: string[]; notes: string }[] = [];

  for (const row of (data ?? []) as { city_slug: string; research_notes: string; curated: boolean }[]) {
    // A curated row is hand-written and was never produced by the truncated
    // call. cacheResearch refuses to overwrite it anyway.
    if (row.curated) continue;
    scanned++;

    const { scope, cats } = splitCategories(row.research_notes ?? "");
    const bad = cats.filter((c) => endsMidSentence(c.body));
    kept += cats.length - bad.length;
    if (!bad.length) continue;

    damagedCities++;
    dropped += bad.length;
    const rebuilt = [scope, ...cats.filter((c) => !endsMidSentence(c.body)).map((c) => c.raw)]
      .filter(Boolean)
      .join("\n\n");
    plan.push({ slug: row.city_slug, drop: bad.map((c) => c.key), notes: rebuilt });
  }

  for (const p of plan.slice(0, 12)) console.log(`  ${p.slug.padEnd(24)} drop: ${p.drop.join(", ")}`);
  if (plan.length > 12) console.log(`  ... and ${plan.length - 12} more cities`);

  console.log(`\nscanned ${scanned} automated cities`);
  console.log(`${damagedCities} damaged, ${dropped} categories to re-buy, ${kept} intact and untouched`);
  console.log(`roughly $${(dropped * 0.4).toFixed(0)} to re-research at about 40 cents a category`);

  if (!APPLY) {
    console.log("\nDry run. Nothing was changed.");
    console.log("Add --apply to drop the damaged categories, then run prewarm-research to re-buy them.");
    return;
  }

  let written = 0;
  for (const p of plan) {
    const { error: upErr } = await supabase
      .from("city_research_cache")
      .update({ research_notes: p.notes })
      .eq("city_slug", p.slug);
    if (upErr) { console.error(`  failed on ${p.slug}: ${upErr.message}`); continue; }
    written++;
  }
  console.log(`\n${written} cities updated. The damaged categories now read as missing.`);
  console.log("Re-buy them with:  npx tsx --env-file=.env.local scripts/prewarm-research.ts --spend --cap 120");
  console.log("and the study ones with the same command plus --study.");
}

main().then(() => process.exit(0));
