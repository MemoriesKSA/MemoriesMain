// The journey links for the most recent plans, for eyeballing a rendered page.
//
//   npx tsx --env-file=.env.local scripts/peek-tokens.ts

import { createSupabaseAdminClient } from "../app/supabase-admin";

async function main() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("reference, city, public_token, paid, status, itinerary_en, notes")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  for (const row of data ?? []) {
    const r = row as Record<string, unknown>;
    console.log(
      `${String(r.reference).padEnd(10)} ${String(r.city ?? "").slice(0, 20).padEnd(20)}` +
        ` paid=${String(r.paid).padEnd(5)} plan=${String(r.itinerary_en ?? "").length.toString().padEnd(6)}` +
        ` notes=${String(r.notes ?? "").length.toString().padEnd(6)} /journey/${r.public_token} [${r.status}]`,
    );
    for (const line of String(r.notes ?? "").split(/\r?\n/)) {
      if (/^\s*(PICKS|PLACES):/i.test(line)) console.log("    " + line.trim().slice(0, 400));
    }
  }
}

main().then(() => process.exit(0));
