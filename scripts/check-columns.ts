// Confirms a hand-applied migration actually landed.
//
// Migrations in this project are run by hand in the Supabase SQL editor, so
// "I ran it" and "the columns exist" are two different facts. This checks the
// second one.
//
//   npx tsx --env-file=.env.local scripts/check-columns.ts

import { createSupabaseAdminClient } from "../app/supabase-admin";

const COLUMNS = ["follow_token", "release_at", "priority", "sent_at", "drafted_at"];

async function main() {
  const supabase = createSupabaseAdminClient();
  let missing = 0;
  for (const column of COLUMNS) {
    const { error } = await supabase.from("proposals").select(column).limit(1);
    if (error) { console.log(`  MISSING  ${column}  (${error.message})`); missing++; }
    else console.log(`  ok       ${column}`);
  }
  console.log(missing ? `\n${missing} column(s) missing: the migration has not fully run.` : "\nAll columns present.");
}

main().then(() => process.exit(0));
