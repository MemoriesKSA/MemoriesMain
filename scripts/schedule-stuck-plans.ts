// Gives a finished, unsent plan a release time so the cron can deliver it.
//
// Written because a real customer's Langkawi plan sat finished, clean and
// unsent for thirty-one hours. Nothing was wrong with it: before automatic
// release existed, a plan only went out when a reviewer pressed publish, and
// nobody did. Those rows have no release_at, so the new cron skips them too and
// they would wait forever.
//
// Dry run by default, because the effect of this is an email to a real person.
//
//   npx tsx --env-file=.env.local scripts/schedule-stuck-plans.ts
//   npx tsx --env-file=.env.local scripts/schedule-stuck-plans.ts --apply
//   npx tsx --env-file=.env.local scripts/schedule-stuck-plans.ts --apply --only 78445EDD

import { createSupabaseAdminClient } from "../app/supabase-admin";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const oi = args.indexOf("--only");
const ONLY = oi >= 0 ? String(args[oi + 1]).toUpperCase() : "";

async function main() {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("proposals")
    .select("id, reference, city, customer_name, customer_email, status, review_state, release_at, sent_at, itinerary_en")
    .is("sent_at", null)
    .is("release_at", null)
    .eq("status", "draft")
    .order("created_at", { ascending: true });
  if (error) { console.error(error.message); process.exit(1); }

  const rows = (data ?? []).filter((p) => p.itinerary_en && (!ONLY || String(p.reference).toUpperCase() === ONLY));

  const releasable = rows.filter((p) => p.review_state === "clean");
  const held = rows.filter((p) => p.review_state !== "clean");

  console.log(`${rows.length} finished, unsent plan(s) with no release time.\n`);

  if (releasable.length) {
    console.log("WOULD BE SCHEDULED AND SENT ON THE NEXT CRON RUN:");
    for (const p of releasable) {
      console.log(`  ${p.reference}  ${String(p.city).padEnd(24)} ${p.customer_name}  <${p.customer_email}>`);
    }
  }
  if (held.length) {
    console.log(`\nLEFT ALONE (${held.length}) — not clean, so a person still has to read them:`);
    for (const p of held) {
      console.log(`  ${p.reference}  ${String(p.city).padEnd(24)} ${p.review_state ?? "never checked"}`);
    }
  }

  if (!APPLY) {
    console.log("\nDry run. Nothing was changed and nothing was sent.");
    console.log("Add --apply to schedule them, or --apply --only <REFERENCE> for one.");
    return;
  }

  let done = 0;
  for (const p of releasable) {
    // Now, not the original window: these are already overdue, and the point
    // of scheduling them is to get them out on the next run.
    const { error: upErr } = await supabase
      .from("proposals")
      .update({ release_at: new Date().toISOString() })
      .eq("id", p.id);
    if (upErr) { console.error(`  failed on ${p.reference}: ${upErr.message}`); continue; }
    done++;
  }
  console.log(`\n${done} plan(s) scheduled. The release cron sends them on its next run, within fifteen minutes.`);
}

main().then(() => process.exit(0));
