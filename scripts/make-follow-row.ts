// Creates one throwaway row so the follow page can be checked against a real
// database read rather than a preview with invented timestamps.
//
//   npx tsx --env-file=.env.local scripts/make-follow-row.ts
//   npx tsx --env-file=.env.local scripts/make-follow-row.ts --drafted --priority
//   npx tsx --env-file=.env.local scripts/make-follow-row.ts --remove FOLLOWTEST

import { createSupabaseAdminClient } from "../app/supabase-admin";
import { newFollowToken, releaseAt } from "../app/follow/release";

const args = process.argv.slice(2);
const REMOVE = args.includes("--remove");
const DRAFTED = args.includes("--drafted");
const PRIORITY = args.includes("--priority");
const SENT = args.includes("--sent");
const REFERENCE = "FOLLOWTEST";

async function main() {
  const supabase = createSupabaseAdminClient();

  if (REMOVE) {
    const { error } = await supabase.from("proposals").delete().eq("reference", REFERENCE);
    console.log(error ? `remove failed: ${error.message}` : `removed ${REFERENCE}`);
    return;
  }

  await supabase.from("proposals").delete().eq("reference", REFERENCE);

  const submittedAt = new Date(Date.now() - (DRAFTED ? 20 : 4) * 60_000);
  const token = newFollowToken();

  const row: Record<string, unknown> = {
    reference: REFERENCE,
    status: DRAFTED ? "draft" : "received",
    customer_name: "Follow Test",
    customer_email: "dr.zakivet123@gmail.com",
    city: "Dubai",
    from_date: "2027-01-10",
    to_date: "2027-01-12",
    currency: "SAR",
    follow_token: token,
    public_token: newFollowToken(),
    priority: PRIORITY,
    created_at: submittedAt.toISOString(),
    release_at: releaseAt(submittedAt, PRIORITY).toISOString(),
  };
  if (DRAFTED) {
    row.drafted_at = new Date(submittedAt.getTime() + 15 * 60_000).toISOString();
    row.itinerary_en = "Test plan.";
    row.itinerary_ar = "خطة تجريبية.";
    row.notes = "AI self-check: CLEAN. No issues found.";
  }
  if (SENT) row.sent_at = new Date().toISOString();

  const { error } = await supabase.from("proposals").insert(row);
  if (error) { console.error("insert failed:", error.message); process.exit(1); }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  console.log(`created ${REFERENCE}  drafted=${DRAFTED} priority=${PRIORITY} sent=${SENT}`);
  console.log(`\n  ${site}/follow/${token}`);
  console.log(`  ${site}/ar/follow/${token}\n`);
  console.log(`remove it with: npx tsx --env-file=.env.local scripts/make-follow-row.ts --remove`);
}

main().then(() => process.exit(0));
