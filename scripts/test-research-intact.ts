// 41% of everything we had researched was cut off mid-sentence.
//
// The research call ran with max_tokens 4000, shared between adaptive
// thinking, a dozen web-search tool blocks and the report itself. The report
// lost, silently: it stopped mid-word and was stored that way. 217 of 532
// categories across 82 of 88 cities. All four Osaka study categories.
//
// It mattered because the drafting pass finished those sentences. A mosque
// truncated to "Masjid Istiq" came back with a full name. "Cycling is a real
// cost lever:" became "most students have one". Three of one draft's seven
// self-check findings traced straight back to it, and the cost was invisible
// because a truncated note reads exactly like a short one.
//
// This checks the stored cache directly rather than any code path, because
// the damage lives in data, not in logic.
//
//   npx tsx --env-file=.env.local scripts/test-research-intact.ts

import { createSupabaseAdminClient } from "../app/supabase-admin";
import { trimToLastCompleteLine } from "../app/draft-guide";

// A body that stops without finishing its last sentence.
const FINISHED = /[.!?)\]"»۔؟]$/;

const unitCases: [string, unknown, unknown][] = [
  ["a line cut mid-word is dropped", trimToLastCompleteLine("315 m from Masjid Istiq"), ""],
  ["a line cut at a colon is dropped", trimToLastCompleteLine("Trains are frequent.\nCycling is a lever:"), "Trains are frequent."],
  ["a finished report survives untouched", trimToLastCompleteLine("Open daily."), "Open daily."],
  ["so does one ending in a bracket", trimToLastCompleteLine("Open daily (summer)"), "Open daily (summer)"],
];

async function main() {
  let pass = 0;
  for (const [name, got, want] of unitCases) {
    const ok = got === want;
    if (ok) pass++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)}`}`);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("city_research_cache").select("city_slug, research_notes, curated");
  if (error) { console.log(`\nSKIP  could not read the cache: ${error.message}`); return; }

  let cats = 0, cut = 0;
  const offenders: string[] = [];
  for (const row of (data ?? []) as { city_slug: string; research_notes: string; curated: boolean }[]) {
    if (row.curated) continue;
    for (const block of String(row.research_notes ?? "").split(/^##cat:/m).filter(Boolean)) {
      const key = block.split("\n")[0].trim();
      if (key.startsWith("#scope")) continue;
      const body = block.slice(block.indexOf("\n")).trim();
      if (!body) continue;
      cats++;
      if (!FINISHED.test(body)) { cut++; offenders.push(`${row.city_slug}/${key}`); }
    }
  }

  const clean = cut === 0;
  console.log(`${clean ? "PASS" : "FAIL"}  every stored research category finishes its last sentence`);
  if (!clean) {
    console.log(`      ${cut} of ${cats} cut (${Math.round(cut / cats * 100)}%)`);
    console.log(`      first few: ${offenders.slice(0, 8).join(", ")}`);
    console.log(`      repair with: npx tsx --env-file=.env.local scripts/repair-truncated-research.ts --apply`);
  } else {
    pass++;
  }

  const total = unitCases.length + 1;
  console.log(`\n${pass}/${total} passed  ·  ${cats} stored categories checked`);
  if (pass !== total) process.exit(1);
}
main().then(() => process.exit(0));
