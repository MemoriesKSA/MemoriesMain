import { Resend } from "resend";

export const runtime = "nodejs";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const requestUrl = new URL(request.url); const origin = request.headers.get("origin");
  if (origin) { try { if (new URL(origin).host !== requestUrl.host) return Response.json({ error: "Invalid request origin." }, { status: 403 }); } catch { return Response.json({ error: "Invalid request origin." }, { status: 403 }); } }
  let body: { email?: unknown; locale?: unknown; consent?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  const locale = body.locale === "ar" ? "ar" : "en";
  if (!emailPattern.test(email) || body.consent !== true) return Response.json({ error: "Valid email and marketing consent are required." }, { status: 400 });
  const apiKey = process.env.RESEND_API_KEY; if (!apiKey) return Response.json({ error: "Newsletter delivery is not configured." }, { status: 503 });
  const resend = new Resend(apiKey);
  const properties = { source: "memories_website", language: locale, consent_date: new Date().toISOString() };
  const existing = await resend.contacts.get({ email });
  const contact = existing.data
    ? await resend.contacts.update({ email, unsubscribed: false, properties })
    : await resend.contacts.create({ email, unsubscribed: false, properties });
  if (contact.error) {
    // 8 Oct 2026: the live mail key may only send, so keeping a contact has
    // failed for every visitor since this box went up ("restricted_api_key")
    // and each of them was told we could not save their subscription. Sending
    // is the one thing that key can do, so until it can keep a list the
    // sign-up goes to our own inbox instead, and nobody who asked is lost.
    const inbox = process.env.JOURNEY_REVIEW_EMAIL ?? "memoriesksasupport@gmail.com";
    const note = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "MEMORIES Journeys <journeys@send.memories.tours>",
      to: [inbox],
      subject: "Newsletter sign-up",
      text: [`Someone joined the list on the website.`, `Email: ${email}`, `Language: ${locale}`, `Agreed to marketing emails: ${properties.consent_date}`, "", "The mail key could not add them to a contact list, so this note is the record. Keep it."].join("\n"),
      tags: [{ name: "email_type", value: "newsletter_signup" }],
    });
    if (note.error) { console.error("Newsletter contact failed", contact.error.name, "and so did the note to our inbox", note.error.name); return Response.json({ error: "We could not save your subscription." }, { status: 502 }); }
    console.log("Newsletter sign-up kept as a note to our inbox: the mail key cannot keep a list.");
  }
  return Response.json({ ok: true });
}
