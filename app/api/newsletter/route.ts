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
  if (contact.error) { console.error("Newsletter contact failed", contact.error.name); return Response.json({ error: "We could not save your subscription." }, { status: 502 }); }
  return Response.json({ ok: true });
}
