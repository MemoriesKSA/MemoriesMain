// The Arabic half of a stored plan, as the customer reads it.
//
//   npx tsx --env-file=.env.local scripts/dump-arabic.ts F1A2FD7A

import { writeFileSync } from "node:fs";
import { createSupabaseAdminClient } from "../app/supabase-admin";

const reference = (process.argv[2] ?? "").toUpperCase();
const out = process.argv[3] ?? "";

async function main() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("proposals")
    .select("reference, city, itinerary_en, itinerary_ar")
    .eq("reference", reference)
    .maybeSingle();

  if (!data) {
    console.error(`${reference}: no such plan`);
    process.exit(1);
  }

  const ar = String(data.itinerary_ar ?? "");
  const en = String(data.itinerary_en ?? "");
  const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

  console.log(`${data.reference}  ${data.city}`);
  console.log(`  english  ${en.length} chars, ${words(en)} words, ${en.split(/\r?\n/).length} lines`);
  console.log(`  arabic   ${ar.length} chars, ${words(ar)} words, ${ar.split(/\r?\n/).length} lines`);

  if (out) {
    writeFileSync(out, ar, "utf8");
    console.log(`\nArabic written to ${out}`);
  }
}

main().then(() => process.exit(0));
