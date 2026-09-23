// Where a half-finished plan waits between the run that writes it and the run
// that checks it.
//
// The pipeline used to do both in one request and did not fit: a measured
// London plan spent 689 of the route's 800 seconds writing and translating,
// which left nothing for the check and its repairs. Splitting the work in two
// gives each half a full budget, and this is what the halves pass between
// them.
//
// It is a private storage object rather than a column on the proposal because
// a column needs a migration, migrations here are applied by hand in the
// Supabase dashboard, and that dashboard was not reachable the day this was
// written. It turns out to be the better home anyway: this is ~100KB of
// working material with a five-minute life, and the proposals table is
// queried on every page a customer opens.
//
// The checker has to see exactly what the writer saw. Re-deriving the
// research and the grounded facts in the second run would usually produce the
// same thing and occasionally would not, and a checker working from different
// sources reports the difference as a defect in the draft. That is what kept
// Riyadh and Jeddah from ever coming back green. So the sources travel with
// the draft rather than being looked up again.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { DraftGuideSubmission } from "./draft-guide";

/** Private. Nothing here is ever served to a browser. */
export const DRAFT_CONTEXT_BUCKET = "draft-context";

export type DraftContext = {
  submission: DraftGuideSubmission;
  /** Both drafts whole, internal sections included: the check reads those too. */
  englishDraft: string;
  arabicDraft: string;
  groundedFactsEn: string;
  groundedFactsAr: string;
  operationalResearch: string;
  cityLabelEn: string;
  stopLabelsEn: string[];
  /** What the writing half already cost, so the total stays one number. */
  spentSoFar: number;
};

const objectPath = (proposalId: string) => `${proposalId}.json`;

/**
 * Creates the bucket the first time, and says nothing when it already exists.
 *
 * Deliberately not a migration or a setup step somebody has to remember. A
 * feature that needs a bucket should make its own, because the alternative is
 * a deploy that works everywhere it was tested and fails on the first real
 * plan in production.
 */
async function ensureBucket(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.storage.createBucket(DRAFT_CONTEXT_BUCKET, { public: false });
  if (!error) return;
  // Already there is the normal case, every time after the first.
  const message = error.message.toLowerCase();
  if (message.includes("already exists") || message.includes("duplicate")) return;
  throw new Error(`Could not create the ${DRAFT_CONTEXT_BUCKET} bucket: ${error.message}`);
}

/**
 * Parks the context for the checking run.
 *
 * Failing here must not fail the plan. The customer's draft is already
 * written and stored by this point; what is lost is the check, and a plan
 * that reaches a reviewer unchecked is worth far more than one that threw its
 * draft away because a bucket was unavailable.
 */
export async function saveDraftContext(supabase: SupabaseClient, proposalId: string, context: DraftContext): Promise<boolean> {
  try {
    await ensureBucket(supabase);
    const body = new Blob([JSON.stringify(context)], { type: "application/json" });
    const { error } = await supabase.storage
      .from(DRAFT_CONTEXT_BUCKET)
      .upload(objectPath(proposalId), body, { contentType: "application/json", upsert: true });
    if (error) throw new Error(error.message);
    return true;
  } catch (error) {
    console.error(`Could not park the draft context for ${proposalId}, so it cannot be checked automatically:`, error);
    return false;
  }
}

export async function loadDraftContext(supabase: SupabaseClient, proposalId: string): Promise<DraftContext | null> {
  const { data, error } = await supabase.storage.from(DRAFT_CONTEXT_BUCKET).download(objectPath(proposalId));
  if (error || !data) {
    console.warn(`No draft context for ${proposalId}: ${error?.message ?? "empty"}`);
    return null;
  }
  try {
    return JSON.parse(await data.text()) as DraftContext;
  } catch (parseError) {
    console.error(`The draft context for ${proposalId} is not readable JSON:`, parseError);
    return null;
  }
}

/**
 * Thrown away once the verdict is written, whatever the verdict was.
 *
 * Best-effort on purpose. A context left behind is a stale file in a private
 * bucket; a delete that could fail the run would be a plan lost to tidying.
 */
export async function dropDraftContext(supabase: SupabaseClient, proposalId: string): Promise<void> {
  const { error } = await supabase.storage.from(DRAFT_CONTEXT_BUCKET).remove([objectPath(proposalId)]);
  if (error) console.warn(`Could not remove the draft context for ${proposalId}: ${error.message}`);
}
