import { createSupabaseAdminClient } from "../../../supabase-admin";
import { checkAndFinishDraft, sendReviewerEmailForUnchecked } from "../../../draft-guide";
import { loadDraftContext, dropDraftContext } from "../../../draft-context";

export const runtime = "nodejs";
// The same ceiling the drafting route has, and for the same reason: this run
// does a self-check and up to two repair rounds, which is the half of the
// pipeline that used to be squeezed into whatever the drafting run had left.
export const maxDuration = 800;

// Checks the plans the drafting run wrote, one per sweep.
//
// The pipeline was one request: research, write, translate, check, repair,
// email. A measured London plan spent 689 of 800 seconds getting as far as
// "translate", so the checking half ran on fumes or not at all, and being cut
// off there is the quietest failure in the system. The plan is stored and
// looks finished, no verdict is written, no email goes out, and nothing says
// so. Splitting the halves gives each a full budget.
//
// One plan per sweep, deliberately. Each costs real money and several
// minutes, and a job that can spend without a bound is a job nobody should
// trust. At one every five minutes the queue drains far faster than plans
// arrive, and a backlog is visible rather than expensive.
//
// review_state is the whole state machine, so no new column was needed:
//
//   null         written, waiting to be checked
//   "checking"   claimed by a sweep
//   "clean"      checked, nothing found, and the only value that may release
//   "flagged"    checked, findings for a person to read
//   "unchecked"  gave up; a person must read it, and it can never release
//
// The claim is conditional on the row still being null, so two overlapping
// sweeps cannot both pay for the same plan.

/** A claim older than this was left behind by a run that died. Take it back. */
const STALE_CLAIM_MS = 20 * 60 * 1000;
/** After this long a plan stops waiting for a verdict and asks for a person. */
const GIVE_UP_AFTER_MS = 45 * 60 * 1000;

type Row = { id: string; reference: string | null; drafted_at: string | null; updated_at: string | null; review_state: string | null };

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("Draft check skipped: CRON_SECRET is not set");
    return Response.json({ error: "Not configured." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();

  // Oldest first, so a plan that has been waiting is never overtaken by one
  // that just arrived.
  const { data: waiting, error } = await supabase
    .from("proposals")
    .select("id, reference, drafted_at, updated_at, review_state")
    .is("review_state", null)
    .not("drafted_at", "is", null)
    .order("drafted_at", { ascending: true })
    .limit(1);
  if (error) {
    console.error("Draft check could not read the queue", error.message);
    return Response.json({ error: "Queue unreadable." }, { status: 500 });
  }

  let row = (waiting?.[0] as Row | undefined) ?? undefined;

  // Nothing waiting: look for a claim whose run never came back. Without
  // this, one crashed sweep would strand a plan in "checking" forever, which
  // is worse than never having claimed it.
  if (!row) {
    const staleBefore = new Date(Date.now() - STALE_CLAIM_MS).toISOString();
    const { data: stale } = await supabase
      .from("proposals")
      .select("id, reference, drafted_at, updated_at, review_state")
      .eq("review_state", "checking")
      .lt("updated_at", staleBefore)
      .order("updated_at", { ascending: true })
      .limit(1);
    const claimed = (stale?.[0] as Row | undefined) ?? undefined;
    if (claimed) {
      console.warn(`Reclaiming ${claimed.reference ?? claimed.id}: its check was claimed over ${STALE_CLAIM_MS / 60000} minutes ago and never finished.`);
      await supabase.from("proposals").update({ review_state: null }).eq("id", claimed.id).eq("review_state", "checking");
      row = { ...claimed, review_state: null };
    }
  }

  if (!row) return Response.json({ checked: 0, note: "Nothing waiting." });

  // Claim it. The guard is what makes two sweeps safe: whoever writes first
  // wins and the other finds no row.
  const { data: mine } = await supabase
    .from("proposals")
    .update({ review_state: "checking" })
    .eq("id", row.id)
    .is("review_state", null)
    .select("id");
  if (!mine?.length) return Response.json({ checked: 0, note: "Another run took it." });

  const label = row.reference ?? row.id;
  const waitedMs = row.drafted_at ? Date.now() - new Date(row.drafted_at).getTime() : 0;

  async function giveUp(why: string) {
    console.error(`Giving up on checking ${label}: ${why}`);
    await supabase.from("proposals").update({ review_state: "unchecked" }).eq("id", row!.id);
    await sendReviewerEmailForUnchecked(row!.id).catch((e) => console.error("Could not tell the team", e));
    await dropDraftContext(supabase, row!.id).catch(() => {});
  }

  const context = await loadDraftContext(supabase, row.id);
  if (!context) {
    await giveUp("there is no parked context to check it against");
    return Response.json({ checked: 0, gaveUp: label, reason: "no context" });
  }

  try {
    await checkAndFinishDraft(row.id, context);
    await dropDraftContext(supabase, row.id);

    // checkAndFinishDraft writes the verdict itself. If it came back without
    // one, the plan would land in "null" again and this sweep would buy the
    // same check forever, so it becomes a job for a person instead.
    const { data: after } = await supabase.from("proposals").select("review_state").eq("id", row.id).maybeSingle();
    if (!after?.review_state) {
      await supabase.from("proposals").update({ review_state: "unchecked" }).eq("id", row.id);
      console.warn(`${label} finished its check without a verdict, so it is marked unchecked.`);
      return Response.json({ checked: 1, reference: label, verdict: "unchecked" });
    }
    console.log(`Checked ${label}: ${after.review_state}.`);
    return Response.json({ checked: 1, reference: label, verdict: after.review_state });
  } catch (checkError) {
    // Hand it back so the next sweep retries, unless it has been waiting long
    // enough that retrying is no longer the kind thing to do.
    if (waitedMs > GIVE_UP_AFTER_MS) {
      await giveUp(`it has been waiting ${Math.round(waitedMs / 60000)} minutes and the check failed again`);
      return Response.json({ checked: 0, gaveUp: label, reason: String((checkError as Error)?.message ?? checkError) });
    }
    await supabase.from("proposals").update({ review_state: null }).eq("id", row.id).eq("review_state", "checking");
    console.error(`Check of ${label} failed, released for the next sweep:`, checkError);
    return Response.json({ checked: 0, retrying: label }, { status: 200 });
  }
}
