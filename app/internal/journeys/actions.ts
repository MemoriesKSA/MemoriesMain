"use server";

import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { getReviewerEmail } from "../../supabase-server";
import { createSupabaseAdminClient } from "../../supabase-admin";
import { sendProposalReadyEmail } from "../../proposal-email";

function readInput(formData: FormData) {
  const get = (key: string) => String(formData.get(key) ?? "").trim();
  return {
    reference: get("reference"),
    customer_name: get("customerName"),
    customer_email: get("customerEmail"),
    customer_phone: get("customerPhone") || null,
    city: get("city"),
    from_date: get("fromDate") || null,
    to_date: get("toDate") || null,
    currency: get("currency") || "SAR",
    price: get("price") ? Number(get("price")) : null,
    itinerary_en: get("itineraryEn") || null,
    itinerary_ar: get("itineraryAr") || null,
    notes: get("notes") || null,
  };
}

async function requireReviewer() {
  const email = await getReviewerEmail();
  if (!email) redirect("/internal/login");
}

export async function createProposal(formData: FormData) {
  await requireReviewer();
  const input = readInput(formData);
  const supabase = createSupabaseAdminClient();
  const publicToken = randomBytes(24).toString("hex");

  const { data, error } = await supabase
    .from("proposals")
    .insert({ ...input, public_token: publicToken })
    .select("id")
    .single();

  if (error || !data) redirect(`/internal/journeys/new?error=${encodeURIComponent(error?.message ?? "save-failed")}`);
  redirect(`/internal/journeys/${data.id}?saved=1`);
}

export async function updateProposal(id: string, formData: FormData) {
  await requireReviewer();
  const input = readInput(formData);
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("proposals").update(input).eq("id", id);

  if (error) redirect(`/internal/journeys/${id}?error=${encodeURIComponent(error.message)}`);
  redirect(`/internal/journeys/${id}?saved=1`);
}

// Takes the same form data as updateProposal so publishing always sends the
// itinerary text currently in the editor, not whatever was last saved. A
// reviewer editing text and clicking Publish without saving first should
// never silently lose those edits.
export async function publishProposal(id: string, formData: FormData) {
  await requireReviewer();
  const input = readInput(formData);
  const supabase = createSupabaseAdminClient();

  // sent_at is stamped here too, as the release job and sendPlanNow both do.
  // It is what the customer's tracking page reads to say their plan has gone,
  // and publishing without it left them watching a page that said we were
  // still writing while the plan sat in their inbox.
  //
  // Left alone once set, so re-publishing an edit does not restate the send
  // time and move the customer's own record of when they got it.
  const { data: existing } = await supabase.from("proposals").select("sent_at").eq("id", id).single();
  const changes = existing?.sent_at
    ? { ...input, status: "published" }
    : { ...input, status: "published", sent_at: new Date().toISOString() };

  const { data, error } = await supabase.from("proposals").update(changes).eq("id", id).select("*").single();

  if (error || !data) redirect(`/internal/journeys/${id}?error=publish-failed`);

  await sendProposalReadyEmail(data);

  redirect(`/internal/journeys/${id}?published=1`);
}

// Sends a finished plan to the customer right now, skipping the wait.
//
// The release job holds a plan for its window and refuses anything the
// self-check flagged, on purpose: it is the one thing here that reaches a
// customer with nobody watching. This is the other case. A reviewer has the
// draft open, has decided it is fine, and the only thing between the customer
// and their plan is a clock or a verdict that a person has now overruled.
//
// So this deliberately ignores both release_at and review_state. That is the
// entire point of the button, and it is safe for the same reason the cron's
// caution is: a person is doing it, on purpose, having looked.
//
// What it will NOT do is send twice or send nothing. sent_at is stamped before
// the email, with `.is("sent_at", null)` on the update, so two reviewers
// pressing at once means one send and one refusal rather than two emails. And
// a plan with no English draft is refused outright: there is nothing to send,
// and an email announcing an empty plan is worse than no email.
export async function sendPlanNow(id: string) {
  await requireReviewer();
  const supabase = createSupabaseAdminClient();

  const { data: proposal, error: readError } = await supabase.from("proposals").select("*").eq("id", id).single();
  if (readError || !proposal) redirect(`/internal/journeys?error=${encodeURIComponent("Could not read that plan.")}`);
  if (proposal.sent_at) redirect(`/internal/journeys?error=${encodeURIComponent(`${proposal.reference} was already sent.`)}`);
  if (!proposal.itinerary_en) redirect(`/internal/journeys?error=${encodeURIComponent(`${proposal.reference} has no draft yet, so there is nothing to send.`)}`);

  const { data: claimed, error: claimError } = await supabase
    .from("proposals")
    .update({ sent_at: new Date().toISOString(), status: "published" })
    .eq("id", id)
    .is("sent_at", null)
    .select("id");

  if (claimError) redirect(`/internal/journeys?error=${encodeURIComponent(claimError.message)}`);
  // No row came back, so somebody else claimed it between the read and here.
  if (!claimed?.length) redirect(`/internal/journeys?error=${encodeURIComponent(`${proposal.reference} was sent by someone else just now.`)}`);

  try {
    await sendProposalReadyEmail({ ...proposal, status: "published" });
  } catch (sendError) {
    // The row says sent and the customer has nothing. Say so plainly rather
    // than reporting success: this is the case that needs a person and will
    // not fix itself.
    console.error(`FORCE SEND: claimed ${proposal.reference} but the email failed`, sendError);
    redirect(`/internal/journeys?error=${encodeURIComponent(`${proposal.reference} is marked sent but the email failed. Send it by hand.`)}`);
  }

  redirect(`/internal/journeys?sent=${encodeURIComponent(proposal.reference)}`);
}

export async function deleteProposal(id: string) {
  await requireReviewer();
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("proposals").delete().eq("id", id);
  if (error) redirect(`/internal/journeys?error=${encodeURIComponent(error.message)}`);

  redirect("/internal/journeys?deleted=1");
}

// Manual unlock, for the cases a payment provider will never cover: a
// customer who paid by transfer or in person, a plan comped deliberately, a
// webhook that fired but didn't land, or simply testing before payment
// exists at all.
//
// It records payment_ref as "manual" rather than leaving it empty, so an
// unlocked-by-hand plan stays distinguishable from one a customer actually
// paid for. Without that the revenue figures quietly become fiction.
export async function setPlanPaid(id: string, paid: boolean) {
  await requireReviewer();
  const supabase = createSupabaseAdminClient();

  // Relocking leaves payment_ref untouched on purpose. If a customer really
  // did pay, that reference is the only record tying this plan to the charge,
  // and it should survive someone relocking the plan to redo a revision or
  // after a refund.
  const changes = paid
    ? { paid: true, paid_at: new Date().toISOString(), payment_ref: "manual" }
    : { paid: false, paid_at: null };

  const { error } = await supabase.from("proposals").update(changes).eq("id", id);

  if (error) redirect(`/internal/journeys/${id}?error=${encodeURIComponent(error.message)}`);
  redirect(`/internal/journeys/${id}?${paid ? "unlocked=1" : "relocked=1"}`);
}
