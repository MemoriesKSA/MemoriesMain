// Sends the "your journey is ready" email once a reviewer publishes a
// proposal. Reuses the same Resend setup and visual language as the other
// transactional emails (see app/api/journeys/route.ts, app/draft-guide.ts).

import { Resend } from "resend";

export type Proposal = {
  reference: string;
  public_token: string;
  customer_name: string;
  customer_email: string;
  city: string;
  currency: string;
  price: number | null;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

export async function sendProposalReadyEmail(proposal: Proposal) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || !proposal.customer_email) return;

  const resend = new Resend(resendKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "MEMORIES Journeys <journeys@send.memories.tours>";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const link = `${siteUrl}/journey/${proposal.public_token}`;
  const priceLine = proposal.price != null ? `${proposal.currency} ${proposal.price.toLocaleString("en-US")}` : "";

  const html = `<div style="margin:0;background:#f7f3ec;padding:24px;font-family:Arial,sans-serif;color:#102d29"><div style="max-width:600px;margin:auto;overflow:hidden;border:1px solid #ded8ce;border-radius:20px;background:#fffdf9;box-shadow:0 14px 40px rgba(16,45,41,.1)"><div style="padding:28px 30px;background:#102d29;color:#fffdf9"><p style="margin:0 0 8px;color:#e6b95d;font-size:11px;font-weight:800;letter-spacing:2px">MEMORIES · YOUR JOURNEY IS READY</p><h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:600">${escapeHtml(proposal.customer_name)}, your ${escapeHtml(proposal.city)} journey is ready</h1></div><div style="padding:28px 30px;font-size:15px;line-height:1.7"><p>We've put together your journey. Take a look whenever you're ready.</p>${priceLine ? `<p style="font-weight:700;font-size:18px;margin:18px 0">${escapeHtml(priceLine)}</p>` : ""}<p style="margin:24px 0"><a href="${link}" style="display:inline-block;padding:14px 26px;border-radius:999px;background:#c8953f;color:#102d29;font-weight:700;text-decoration:none">View your journey</a></p><p style="color:#6a746f;font-size:13px;margin:0">Reference ${escapeHtml(proposal.reference)}</p></div></div></div>`;

  const result = await resend.emails.send(
    {
      from: fromEmail,
      to: [proposal.customer_email],
      subject: `Your ${proposal.city} journey is ready — MEMORIES`,
      html,
      text: `${proposal.customer_name}, your ${proposal.city} journey is ready. View it here: ${link}`,
      tags: [{ name: "email_type", value: "proposal_ready" }],
    },
    { idempotencyKey: `proposal-ready/${proposal.public_token}` }
  );

  if (result.error) console.error("Proposal ready email failed", result.error.name);
}
