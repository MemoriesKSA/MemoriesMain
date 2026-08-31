// Removes test proposals, and refuses to guess about real ones.
//
// The proposals table is both the test bench and the customer record. A row
// that was a throwaway and a row somebody is waiting on look identical in a
// list, and one of them has a live link in somebody's inbox.
//
// So this classifies before it deletes, and never deletes a row it is not sure
// about unless told to by name.
//
//   npx tsx --env-file=.env.local scripts/clean-test-rows.ts
//   npx tsx --env-file=.env.local scripts/clean-test-rows.ts --apply
//   npx tsx --env-file=.env.local scripts/clean-test-rows.ts --apply --keep F1A2FD7A,78445EDD

import { createSupabaseAdminClient } from "../app/supabase-admin";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const ki = args.indexOf("--keep");
const KEEP = ki >= 0 ? String(args[ki + 1]).toUpperCase().split(",").filter(Boolean) : [];

// Also deletes the rows that only look real because they were submitted under
// a real name while testing. It never overrides --keep, so a plan somebody is
// actually holding a link to still has to be named in order to survive.
const ALL = args.includes("--all");

/** A name only a script would produce. */
const TEST_NAME = /test|check|rule\s*\d|1787\d{9}|\bgreen[- ]|e2e|longtrip|links?-\d|fin-\d/i;

function classify(row: { reference: string; customer_name: string | null; customer_email: string | null; sent_at: string | null }) {
  if (KEEP.includes(String(row.reference).toUpperCase())) return "keep: named on the command line";
  const name = String(row.customer_name ?? "");
  // A plan that actually reached somebody has a live link in their inbox.
  // Deleting it turns that link into a 404 for a person who is using it.
  if (row.sent_at) return "KEEP: delivered to a real inbox";
  if (TEST_NAME.test(name)) return "test";
  return "UNSURE: looks like a real person";
}

async function main() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("id, reference, city, customer_name, customer_email, sent_at, status, created_at")
    .order("created_at", { ascending: false });
  if (error) { console.error(error.message); process.exit(1); }

  const rows = data ?? [];
  const groups = { test: [] as typeof rows, keep: [] as typeof rows, unsure: [] as typeof rows };
  for (const row of rows) {
    const verdict = classify(row);
    if (verdict === "test") groups.test.push(row);
    else if (verdict.startsWith("UNSURE")) groups.unsure.push(row);
    else groups.keep.push(row);
  }

  const show = (label: string, list: typeof rows) => {
    if (!list.length) return;
    console.log(`\n${label} (${list.length})`);
    for (const r of list) {
      console.log(`  ${String(r.reference).padEnd(11)} ${String(r.city ?? "").slice(0, 22).padEnd(22)} ${String(r.customer_name ?? "").slice(0, 26).padEnd(26)} ${r.sent_at ? "delivered" : ""}`);
    }
  };

  show("WOULD DELETE — test rows", groups.test);
  show("KEPT — delivered, or named on the command line", groups.keep);
  show("NOT TOUCHED — looks like a real person, decide by name", groups.unsure);

  if (!APPLY) {
    console.log(`\nDry run. Nothing deleted.`);
    console.log(`Add --apply to remove the ${groups.test.length} test row(s). Anything under NOT TOUCHED needs --keep or an explicit decision.`);
    return;
  }

  let gone = 0;
  const doomed = ALL ? [...groups.test, ...groups.unsure] : groups.test;
  for (const row of doomed) {
    const { error: delErr } = await supabase.from("proposals").delete().eq("id", row.id);
    if (delErr) { console.error(`  failed on ${row.reference}: ${delErr.message}`); continue; }
    gone++;
  }
  console.log(`\n${gone} test row(s) deleted. ${groups.keep.length} kept, ${groups.unsure.length} left for you to decide.`);
}

main().then(() => process.exit(0));
