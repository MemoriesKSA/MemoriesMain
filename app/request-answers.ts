// The customer's own form answers, kept for good, one private file per request.
//
// Until 12 Nov 2026 the answers lived only in the internal "[NEW]" email and in
// the draft context, which is thrown away once a plan is checked. So when a
// plan read oddly (Riyadh CB49C0B8 leaned on Six Flags) our own records could
// not say whether the customer had asked for it; the answer had to be dug out
// of the support inbox. This keeps what they typed next to the plan it led to.
//
// A storage object rather than a column for the reason draft-context.ts gives:
// migrations here are applied by hand in the Supabase dashboard. Name, email
// and phone are left out on purpose: they are already on the proposals row,
// and this file should not become a second copy of anyone's contact details.

import type { SupabaseClient } from "@supabase/supabase-js";

/** Private. Nothing here is ever served to a browser. */
export const REQUEST_ANSWERS_BUCKET = "request-answers";

const CONTACT_FIELDS = new Set(["name", "email", "phone", "phoneCode"]);

const objectPath = (reference: string) => `${reference.replace(/[^A-Za-z0-9-]/g, "")}.json`;

async function ensureBucket(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.storage.createBucket(REQUEST_ANSWERS_BUCKET, { public: false });
  if (!error) return;
  // Already there is the normal case, every time after the first.
  if (/already exists|duplicate/i.test(error.message)) return;
  throw new Error(`Could not create the ${REQUEST_ANSWERS_BUCKET} bucket: ${error.message}`);
}

/** The form answers without the contact fields. */
export function answersWithoutContact(submission: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(submission).filter(([key]) => !CONTACT_FIELDS.has(key)));
}

/**
 * Best-effort: a request must never fail because this could not be written.
 * The internal email still carries every answer if it does.
 */
export async function saveRequestAnswers(
  supabase: SupabaseClient,
  reference: string,
  submission: Record<string, unknown>,
  submittedAt: Date,
): Promise<boolean> {
  try {
    await ensureBucket(supabase);
    const body = new Blob([JSON.stringify({ reference, submittedAt: submittedAt.toISOString(), answers: answersWithoutContact(submission) })], { type: "application/json" });
    const { error } = await supabase.storage
      .from(REQUEST_ANSWERS_BUCKET)
      .upload(objectPath(reference), body, { contentType: "application/json", upsert: true });
    if (error) throw new Error(error.message);
    return true;
  } catch (error) {
    console.error(`Could not keep the form answers for ${reference}:`, error);
    return false;
  }
}

export type RequestAnswers = { reference: string; submittedAt: string; answers: Record<string, unknown> };

export async function loadRequestAnswers(supabase: SupabaseClient, reference: string): Promise<RequestAnswers | null> {
  const { data, error } = await supabase.storage.from(REQUEST_ANSWERS_BUCKET).download(objectPath(reference));
  if (error || !data) return null;
  try {
    return JSON.parse(await data.text()) as RequestAnswers;
  } catch {
    return null;
  }
}
