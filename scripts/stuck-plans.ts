// Which finished plans never reached the customer, and why.
//
// A plan can be complete, clean and correct, and still be sitting in the
// database because nothing ever sent it. Before automatic release existed the
// only way out was a reviewer pressing publish, so a draft nobody looked at
// waited forever while its customer waited too.
//
//   npx tsx --env-file=.env.local scripts/stuck-plans.ts

import { createSupabaseAdminClient } from "../app/supabase-admin";

function ago(iso: string | null): string {
  if (!iso) return "—";
  const hours = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (hours < 48) return `${Math.round(hours)}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

async function main() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("reference, city, customer_name, customer_email, status, created_at, drafted_at, release_at, sent_at, follow_token, notes, itinerary_en")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) { console.error(error.message); process.exit(1); }

  console.log("reference   city                 who              status     submitted  written  sent      follow  why");
  console.log("-".repeat(126));

  for (const p of data ?? []) {
    const notes = String(p.notes ?? "");
    const clean = /self-check: CLEAN/i.test(notes);
    const flagged = /needs a look/i.test(notes);
    const written = Boolean(p.itinerary_en);

    let why: string;
    if (p.sent_at) why = "delivered";
    else if (!written) why = "NEVER WRITTEN — the pipeline did not finish";
    else if (flagged) why = "held: self-check flagged it, needs a person";
    else if (!p.release_at) why = "STUCK: no release schedule, nothing will ever send it";
    else if (new Date(String(p.release_at)) > new Date()) why = `waiting until ${String(p.release_at).slice(11, 16)}`;
    else if (!clean) why = "held: no CLEAN verdict recorded";
    else why = "DUE NOW — the release job should pick this up";

    console.log(
      `${String(p.reference).padEnd(11)} ${String(p.city ?? "").slice(0, 20).padEnd(20)} ` +
      `${String(p.customer_name ?? "").slice(0, 16).padEnd(16)} ${String(p.status ?? "").padEnd(10)} ` +
      `${ago(p.created_at).padEnd(10)} ${(written ? "yes" : "NO").padEnd(8)} ${ago(p.sent_at).padEnd(9)} ` +
      `${(p.follow_token ? "yes" : "no").padEnd(7)} ${why}`,
    );
  }
}

main().then(() => process.exit(0));
