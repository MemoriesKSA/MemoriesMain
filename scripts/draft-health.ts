// How recent drafts actually finished.
//
// A draft can fail in a way that looks like success from the outside: the
// English lands, the row exists, the email may even go, and the Arabic or the
// internal notes are simply missing. The notes column is where the marker
// lines live, so a plan without it is a plan with no links.
//
//   npx tsx --env-file=.env.local scripts/draft-health.ts
//   npx tsx --env-file=.env.local scripts/draft-health.ts --limit 20

import { createSupabaseAdminClient } from "../app/supabase-admin";

const args = process.argv.slice(2);
const li = args.indexOf("--limit");
const LIMIT = li >= 0 ? Number(args[li + 1]) : 12;

async function main() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("reference, city, status, itinerary_en, itinerary_ar, notes, created_at")
    .order("created_at", { ascending: false })
    .limit(LIMIT);
  if (error) { console.error(error.message); process.exit(1); }

  console.log("reference  city              en      ar      notes  markers  verdict          created");
  console.log("-".repeat(104));

  let complete = 0;
  for (const row of data ?? []) {
    const en = String(row.itinerary_en ?? "").length;
    const ar = String(row.itinerary_ar ?? "").length;
    const notes = String(row.notes ?? "");
    const markers = /^\s*(PICKS|PLACES|SITES):/m.test(notes) ? "yes" : "no";
    const verdict = /self-check: CLEAN/i.test(notes) ? "CLEAN"
      : /needs a look/i.test(notes) ? "ISSUES"
      : notes ? "-" : "(none)";
    const ok = en > 0 && ar > 0 && markers === "yes";
    if (ok) complete++;
    console.log(
      `${String(row.reference).padEnd(10)} ${String(row.city).padEnd(17)} ` +
      `${String(en).padEnd(7)} ${String(ar).padEnd(7)} ${String(notes.length).padEnd(6)} ` +
      `${markers.padEnd(8)} ${verdict.padEnd(16)} ${String(row.created_at).slice(0, 16)}${ok ? "" : "   <-- incomplete"}`,
    );
  }
  console.log(`\n${complete}/${(data ?? []).length} finished with both languages and their marker lines`);
}

main().then(() => process.exit(0));
