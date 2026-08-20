// End-to-end test of the one included revision (docs/paid-plans-spec.md #5).
//
// This path has never actually run. It fires at the worst possible moment to
// fail: a customer who has paid, read the plan, and wants one thing changed.
//
// Creates its own throwaway proposals, exercises the endpoint against the
// running dev server, and deletes them again.
//
//   npx tsx --env-file=.env.local scripts/test-revision-flow.ts

import { createSupabaseAdminClient } from "../app/supabase-admin";
import { randomBytes } from "node:crypto";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const supabase = createSupabaseAdminClient();
const made: string[] = [];

async function makeProposal(opts: { paid: boolean; status?: string; revisionUsed?: boolean }) {
  const reference = `REVTEST-${randomBytes(3).toString("hex").toUpperCase()}`;
  const { data, error } = await supabase
    .from("proposals")
    .insert({
      reference,
      public_token: randomBytes(24).toString("hex"),
      status: opts.status ?? "published",
      paid: opts.paid,
      revision_used: opts.revisionUsed ?? false,
      customer_name: "Revision Flow Test",
      customer_email: "mixedhopes2022@gmail.com",
      city: "Riyadh",
      currency: "SAR",
      itinerary_en: "Overview.\n\nDay 1 — Monday\nSomething.",
    })
    .select("id, reference, public_token")
    .single();
  if (error) throw new Error(`could not create test proposal: ${error.message}`);
  made.push(data.reference);
  return data;
}

async function post(token: string, message: string) {
  const res = await fetch(`${BASE}/api/journeys/revision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, message }),
  });
  let body: Record<string, unknown> = {};
  try { body = await res.json(); } catch { /* non-JSON is itself a failure */ }
  return { status: res.status, body };
}

async function main() {
  const results: [string, unknown, unknown][] = [];

  // A paid plan: the happy path.
  const paid = await makeProposal({ paid: true });
  const first = await post(paid.public_token, "Could we swap the hotel for something closer to the centre?");
  results.push(["a paid customer can request a change", first.status, 200]);

  const { data: after } = await supabase
    .from("proposals")
    .select("revision_used, revision_note, revision_requested_at")
    .eq("id", paid.id)
    .single();
  results.push(["the revision is marked used", after?.revision_used, true]);
  results.push(["their words are stored", String(after?.revision_note ?? "").includes("closer to the centre"), true]);
  results.push(["the time is recorded", !!after?.revision_requested_at, true]);

  // Spending it twice is the thing the conditional claim exists to stop.
  const second = await post(paid.public_token, "Actually, can we also change the dates?");
  results.push(["a second request is refused", second.status, 409]);
  const { data: afterSecond } = await supabase.from("proposals").select("revision_note").eq("id", paid.id).single();
  results.push(["the second message did not overwrite the first", String(afterSecond?.revision_note ?? "").includes("closer to the centre"), true]);

  // An unpaid plan has no revision to spend.
  const unpaid = await makeProposal({ paid: false });
  const unpaidTry = await post(unpaid.public_token, "Change the hotel please.");
  results.push(["an unpaid plan is refused", unpaidTry.status, 403]);

  // A draft is not reachable, and must not reveal that it exists.
  const draft = await makeProposal({ paid: true, status: "draft" });
  const draftTry = await post(draft.public_token, "Change the hotel please.");
  results.push(["an unpublished plan looks missing", draftTry.status, 404]);

  const bogus = await post("not-a-real-token-at-all", "Change the hotel please.");
  results.push(["an unknown token looks the same", bogus.status, 404]);
  results.push(["the two are indistinguishable", JSON.stringify(draftTry.body), JSON.stringify(bogus.body)]);

  // An empty request is rejected before anything is claimed.
  const empty = await makeProposal({ paid: true });
  const emptyTry = await post(empty.public_token, "   ");
  results.push(["an empty message is rejected", emptyTry.status, 400]);
  const { data: emptyAfter } = await supabase.from("proposals").select("revision_used").eq("id", empty.id).single();
  results.push(["and does not burn the revision", emptyAfter?.revision_used, false]);

  let pass = 0;
  for (const [name, got, want] of results) {
    const ok = got === want;
    if (ok) pass++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
  }
  console.log(`\n${pass}/${results.length} passed`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(async () => {
    if (made.length) {
      await supabase.from("proposals").delete().in("reference", made);
      console.log(`\ncleaned up ${made.length} test proposals`);
    }
    process.exit(process.exitCode ?? 0);
  });
