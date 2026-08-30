// The tracking link for one request, and whether it can exist yet.
//
// The question this answers is the one a customer asks thirty seconds after
// submitting: can I see what is happening? That failed for a real customer,
// because the row did not exist until drafting finished eight minutes later.
//
//   npx tsx --env-file=.env.local scripts/follow-link.ts C9FD76EE

import { createSupabaseAdminClient } from "../app/supabase-admin";

const reference = (process.argv[2] ?? "").toUpperCase();

async function main() {
  if (!reference) { console.error("usage: follow-link.ts <REFERENCE>"); process.exit(2); }
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("proposals")
    .select("reference, status, follow_token, release_at, priority, created_at, drafted_at, sent_at, review_state")
    .eq("reference", reference)
    .maybeSingle();

  if (!data) {
    console.log(`${reference}: NO ROW. The submit path did not create one, so tracking would 404.`);
    process.exit(1);
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://memories.tours";
  const age = Math.round((Date.now() - new Date(String(data.created_at)).getTime()) / 60_000);

  console.log(`${reference}`);
  console.log(`  status        ${data.status}`);
  console.log(`  age           ${age} min`);
  console.log(`  priority      ${data.priority}`);
  console.log(`  release_at    ${data.release_at ?? "(none)"}`);
  console.log(`  drafted_at    ${data.drafted_at ?? "(still writing)"}`);
  console.log(`  sent_at       ${data.sent_at ?? "(not sent)"}`);
  console.log(`  review_state  ${data.review_state ?? "(not checked yet)"}`);
  console.log(`  follow token  ${data.follow_token ? "present" : "MISSING — tracking will 404"}`);
  if (data.follow_token) {
    console.log(`\n  ${site}/follow/${data.follow_token}`);
    console.log(`  ${site}/ar/follow/${data.follow_token}`);
  }
}

main().then(() => process.exit(0));
