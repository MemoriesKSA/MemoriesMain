import { Resend } from "resend";
import { createSupabaseAdminClient } from "../../../supabase-admin";

export const runtime = "nodejs";

// One free revision per paid plan (see docs/paid-plans-spec.md section 5).
//
// The plan's public token is the only credential, exactly as it is for
// reading the plan. That is deliberate and matches the sharing model: a
// customer may pass their link to whoever they like. It does mean someone
// holding a shared link could spend the revision, which is accepted for the
// same reason the plan itself is readable from that link.
//
// Everything that decides whether a revision is allowed is checked here, on
// the server, against the database. The page hides the form once the
// revision is used, but hiding a control is presentation, not enforcement.

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[c] ?? c);
}

export async function POST(request: Request) {
  let body: { token?: unknown; message?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 2_000) : "";

  if (!token || !message) {
    return Response.json({ error: "Tell us what you'd like changed." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: proposal } = await supabase
    .from("proposals")
    .select("id, reference, city, customer_name, customer_email, status, paid, revision_used")
    .eq("public_token", token)
    .single();

  // Same opaque response whether the token is wrong or the plan simply isn't
  // published, so this endpoint can't be used to probe which tokens exist.
  if (!proposal || proposal.status !== "published") {
    return Response.json({ error: "We couldn't find that plan." }, { status: 404 });
  }
  if (!proposal.paid) {
    return Response.json({ error: "Revisions are included once the full plan is unlocked." }, { status: 403 });
  }
  if (proposal.revision_used) {
    return Response.json({ error: "The free revision for this trip has already been used. Reply to your email and we'll help." }, { status: 409 });
  }

  // Claim the revision conditionally: the `eq("revision_used", false)` guard
  // means two rapid submissions can't both succeed and spend it twice.
  const { data: claimed, error: claimError } = await supabase
    .from("proposals")
    .update({ revision_used: true, revision_note: message, revision_requested_at: new Date().toISOString() })
    .eq("id", proposal.id)
    .eq("revision_used", false)
    .select("id")
    .single();

  if (claimError || !claimed) {
    return Response.json({ error: "The free revision for this trip has already been used." }, { status: 409 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const reviewEmail = process.env.JOURNEY_REVIEW_EMAIL ?? "memoriesksasupport@gmail.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "MEMORIES Journeys <journeys@send.memories.tours>";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://memories.tours";
    const result = await new Resend(resendKey).emails.send({
      from: fromEmail,
      to: [reviewEmail],
      replyTo: proposal.customer_email || undefined,
      subject: `[REVISION] ${proposal.reference} | ${proposal.city} | ${proposal.customer_name}`,
      html: `<div style="margin:0;background:#eef2ee;padding:24px;font-family:Arial,sans-serif;color:#123c35"><div style="max-width:620px;margin:auto;border:1px solid #dce3de;border-radius:18px;background:#fff;overflow:hidden"><div style="padding:22px 26px;background:#063b34;color:#fff"><p style="margin:0 0 6px;color:#e7b94f;font-size:11px;font-weight:800;letter-spacing:2px">MEMORIES · REVISION REQUESTED</p><h1 style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:600">${escapeHtml(proposal.customer_name)} would like a change to their ${escapeHtml(proposal.city)} plan</h1></div><div style="padding:22px 26px;font-size:14px;line-height:1.7"><p style="margin:0 0 14px">Reference <strong>${escapeHtml(proposal.reference)}</strong>. This is their one included revision, and it is now marked as used.</p><div style="padding:14px 16px;border-radius:10px;background:#f7f9f7;border:1px solid #e2e6e1;white-space:pre-wrap">${escapeHtml(message)}</div><p style="margin:14px 0 0"><a href="${siteUrl}/internal/journeys" style="color:#0b443b;font-weight:700">Open the reviewer tool →</a></p></div></div></div>`,
      text: `REVISION REQUESTED for ${proposal.reference} (${proposal.city}, ${proposal.customer_name}).\n\n${message}\n\nThis was their one included revision and is now marked used.`,
      tags: [{ name: "email_type", value: "revision_request" }],
    }, { idempotencyKey: `revision/${proposal.id}` });
    if (result.error) console.error("Revision email failed", result.error.name);
  } else {
    console.error(`Revision recorded for ${proposal.reference} but RESEND_API_KEY is missing, so nobody was notified`);
  }

  return Response.json({ ok: true });
}
