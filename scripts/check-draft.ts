// Has this draft finished? Exit 0 when it has, 1 while it has not.
//
// Meant to be driven from a shell `until` loop so a waiting agent gets one
// notification rather than polling in conversation.
//
//   npx tsx --env-file=.env.local scripts/check-draft.ts 40AE1B7C

import { createSupabaseAdminClient } from "../app/supabase-admin";

const reference = (process.argv[2] ?? "").toUpperCase();

async function main() {
  if (!reference) { console.error("usage: check-draft.ts <REFERENCE>"); process.exit(2); }
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("id, reference, public_token, city, status, itinerary_en, itinerary_ar, notes")
    .eq("reference", reference)
    .limit(1);

  if (error) { console.error("read failed:", error.message); process.exit(1); }
  const row = data?.[0];
  if (!row) { console.log(`${reference}: no row yet`); process.exit(1); }

  const en = String(row.itinerary_en ?? "");
  const ar = String(row.itinerary_ar ?? "");
  if (!en || !ar) {
    console.log(`${reference}: en=${en.length} ar=${ar.length} — still writing`);
    process.exit(1);
  }
  console.log(`${reference}: READY  en=${en.length} ar=${ar.length}  token=${row.public_token} status=${row.status}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
