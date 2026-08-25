// Drops the universities category from every study city so it is re-bought
// with official URLs.
//
// Study plans emit a SITES: line so a university links to its own admissions
// page rather than a map pin, and the draft may only use a URL that appears in
// its research. The universities research never collected URLs, so the
// permission was unreachable: a Leeds draft emitted "SITES: none" beside three
// universities that should have been links.
//
// The category now asks for each institution's official page, but that only
// reaches cities researched from here on. This clears the old ones so the
// ordinary pre-warm picks them up, the same surgical approach the truncation
// repair used: one category per city, not a whole re-warm.
//
//   npx tsx --env-file=.env.local scripts/refresh-university-urls.ts
//   npx tsx --env-file=.env.local scripts/refresh-university-urls.ts --apply

import { createSupabaseAdminClient } from "../app/supabase-admin";

const APPLY = process.argv.includes("--apply");

async function main() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("city_research_cache")
    .select("city_slug, research_notes, curated")
    .like("city_slug", "study:%");
  if (error) { console.error("Could not read the cache:", error.message); process.exit(1); }

  let already = 0;
  const plan: { slug: string; notes: string; had: number }[] = [];

  for (const row of (data ?? []) as { city_slug: string; research_notes: string; curated: boolean }[]) {
    if (row.curated) continue;
    const parts = String(row.research_notes ?? "").split(/^##cat:/m);
    const scope = parts.shift()?.trim() ?? "";

    const kept: string[] = [];
    let hadUniversities = false;
    let urlsInside = 0;
    for (const part of parts) {
      const key = part.split("\n")[0].trim();
      if (key === "universities") {
        hadUniversities = true;
        urlsInside = (part.match(/https?:\/\//g) ?? []).length;
        // Already collected URLs, so nothing to buy.
        if (urlsInside > 0) { kept.push(`##cat:${part.replace(/\s+$/, "")}`); }
        continue;
      }
      kept.push(`##cat:${part.replace(/\s+$/, "")}`);
    }

    if (!hadUniversities) continue;
    if (urlsInside > 0) { already++; continue; }

    plan.push({ slug: row.city_slug, notes: [scope, ...kept].filter(Boolean).join("\n\n"), had: urlsInside });
  }

  console.log(`${plan.length} study cities need their universities research re-bought for URLs`);
  console.log(`${already} already hold URLs and are left alone`);
  console.log(`roughly $${(plan.length * 0.5).toFixed(0)} at about 50 cents a category`);
  console.log(`\n  ${plan.map((p) => p.slug.replace("study:", "")).join(", ")}`);

  if (!APPLY) {
    console.log("\nDry run. Nothing was changed.");
    console.log("Add --apply, then run: npx tsx --env-file=.env.local scripts/prewarm-research.ts --study --spend --cap 30");
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
  console.log(`\n${written} cities cleared. Re-buy with:`);
  console.log("  npx tsx --env-file=.env.local scripts/prewarm-research.ts --study --spend --cap 30");
}

main().then(() => process.exit(0));
