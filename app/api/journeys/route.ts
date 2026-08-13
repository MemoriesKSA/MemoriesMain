import { Resend } from "resend";

export const runtime = "nodejs";

type JourneySubmission = {
  submissionId?: unknown;
  locale?: unknown;
  journeyType?: unknown;
  country?: unknown;
  city?: unknown;
  purpose?: unknown;
  studySupport?: unknown;
  travellers?: unknown;
  travellerCount?: unknown;
  fromDate?: unknown;
  toDate?: unknown;
  transport?: unknown;
  stays?: unknown;
  planIncludes?: unknown;
  packageNotes?: unknown;
  currency?: unknown;
  budget?: unknown;
  delivery?: unknown;
  name?: unknown;
  email?: unknown;
  phoneCode?: unknown;
  phone?: unknown;
  notes?: unknown;
  website?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim().slice(0, 100)).filter(Boolean).slice(0, 20)
    : [];
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

function readable(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function row(label: string, value: string | string[]) {
  const display = Array.isArray(value) ? value.map(readable).join(", ") : value;
  if (!display) return "";
  return `<tr><td style="padding:9px 12px;color:#6f746f;border-bottom:1px solid #e5e2d8;width:34%;vertical-align:top">${escapeHtml(label)}</td><td style="padding:9px 12px;color:#0b332d;border-bottom:1px solid #e5e2d8;font-weight:600">${escapeHtml(display)}</td></tr>`;
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== requestUrl.host) {
        return Response.json({ error: "Invalid request origin." }, { status: 403 });
      }
    } catch {
      return Response.json({ error: "Invalid request origin." }, { status: 403 });
    }
  }

  if (Number(request.headers.get("content-length") ?? 0) > 50_000) {
    return Response.json({ error: "Request is too large." }, { status: 413 });
  }

  let raw: JourneySubmission;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot fields are invisible to real visitors.
  if (clean(raw.website)) return Response.json({ ok: true });

  const submission = {
    submissionId: clean(raw.submissionId, 80),
    locale: clean(raw.locale, 2) === "ar" ? "ar" : "en",
    journeyType: clean(raw.journeyType, 50),
    country: clean(raw.country, 100),
    city: clean(raw.city, 100),
    purpose: clean(raw.purpose, 100),
    studySupport: clean(raw.studySupport, 100),
    travellers: clean(raw.travellers, 100),
    travellerCount: clean(raw.travellerCount, 20),
    fromDate: clean(raw.fromDate, 20),
    toDate: clean(raw.toDate, 20),
    transport: cleanList(raw.transport),
    stays: cleanList(raw.stays),
    planIncludes: cleanList(raw.planIncludes),
    packageNotes: clean(raw.packageNotes, 2_000),
    currency: clean(raw.currency, 10),
    budget: clean(raw.budget, 30),
    delivery: cleanList(raw.delivery),
    name: clean(raw.name, 150),
    email: clean(raw.email, 254).toLowerCase(),
    phoneCode: clean(raw.phoneCode, 10),
    phone: clean(raw.phone, 40),
    notes: clean(raw.notes, 2_000),
  };

  const missingRequired = !submission.submissionId || !submission.journeyType || !submission.country || !submission.city || !submission.purpose || !submission.travellers || !submission.travellerCount || !submission.fromDate || !submission.toDate || !submission.transport.length || !submission.stays.length || !submission.budget || !submission.name || !submission.delivery.length;
  const invalidEmail = submission.delivery.includes("email") && !emailPattern.test(submission.email);
  const missingPhone = submission.delivery.includes("whatsapp") && !submission.phone;
  if (missingRequired || invalidEmail || missingPhone || submission.toDate < submission.fromDate) {
    return Response.json({ error: "Please complete all required journey details." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const reviewEmail = process.env.JOURNEY_REVIEW_EMAIL ?? "memoriesksasupport@gmail.com";
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "MEMORIES Journeys <journeys@send.memories.tours>";
  if (!apiKey) return Response.json({ error: "Email delivery is not configured yet." }, { status: 503 });

  const resend = new Resend(apiKey);
  const budget = `${submission.currency} ${Number(submission.budget).toLocaleString("en-US")}`;
  const reference = submission.submissionId.slice(0, 8).toUpperCase();
  const details = [
    row("Reference", reference), row("Journey", submission.journeyType), row("Country", submission.country), row("City", submission.city),
    row("Purpose / style", submission.purpose), row("Study support", submission.studySupport), row("Travellers", `${readable(submission.travellers)} — ${submission.travellerCount}`),
    row("Dates", `${submission.fromDate} to ${submission.toDate}`), row("Transport", submission.transport), row("Stay", submission.stays),
    row("Plan includes", submission.planIncludes), row("Package notes", submission.packageNotes), row("Complete budget", budget), row("Delivery", submission.delivery),
    row("Name", submission.name), row("Email", submission.email), row("Phone / WhatsApp", `${submission.phoneCode} ${submission.phone}`.trim()), row("Final notes", submission.notes), row("Language", submission.locale),
  ].join("");

  const internal = await resend.emails.send({
    from: fromEmail,
    to: [reviewEmail],
    replyTo: emailPattern.test(submission.email) ? submission.email : undefined,
    subject: `New journey request: ${readable(submission.city)} — ${submission.name}`,
    html: `<div style="background:#f4f0e7;padding:32px;font-family:Arial,sans-serif"><div style="max-width:680px;margin:auto;background:#fff;border-radius:18px;overflow:hidden"><div style="background:#063b34;padding:28px;color:#fff"><p style="margin:0 0 8px;color:#e7b94f;font-size:12px;letter-spacing:2px">MEMORIES JOURNEY REQUEST</p><h1 style="margin:0;font-family:Georgia,serif;font-size:30px">A new dream journey is ready to review.</h1></div><table style="width:100%;border-collapse:collapse">${details}</table></div></div>`,
  }, { idempotencyKey: `journey-review/${submission.submissionId}` });

  if (internal.error) {
    console.error("Journey review email failed", internal.error.name);
    return Response.json({ error: "We could not send your request. Please try again." }, { status: 502 });
  }

  if (submission.delivery.includes("email") && emailPattern.test(submission.email)) {
    const confirmation = await resend.emails.send({
      from: fromEmail,
      to: [submission.email],
      replyTo: reviewEmail,
      subject: submission.locale === "ar" ? `استلمنا رحلة أحلامك — ${reference}` : `We received your dream journey — ${reference}`,
      html: submission.locale === "ar"
        ? `<div dir="rtl" style="background:#f4f0e7;padding:32px;font-family:Arial,sans-serif"><div style="max-width:620px;margin:auto;background:#fff;border-radius:18px;padding:34px"><p style="color:#b88724;font-size:12px;letter-spacing:1px">MEMORIES · ذكريات</p><h1 style="color:#063b34;font-family:Georgia,serif">رحلة أحلامك وصلت إلينا.</h1><p>أهلًا ${escapeHtml(submission.name)}، شكرًا لمشاركتنا تفاصيل رحلتك إلى ${escapeHtml(readable(submission.city))}. سيقوم فريقنا بمراجعة طلبك والتواصل معك بالطريقة التي اخترتها.</p><p><strong>رقم الطلب:</strong> ${reference}</p></div></div>`
        : `<div style="background:#f4f0e7;padding:32px;font-family:Arial,sans-serif"><div style="max-width:620px;margin:auto;background:#fff;border-radius:18px;padding:34px"><p style="color:#b88724;font-size:12px;letter-spacing:2px">MEMORIES</p><h1 style="color:#063b34;font-family:Georgia,serif">Your dream journey has reached us.</h1><p>Hello ${escapeHtml(submission.name)}, thank you for sharing your journey to ${escapeHtml(readable(submission.city))}. Our team will review the details and continue with you through your chosen contact method.</p><p><strong>Request reference:</strong> ${reference}</p></div></div>`,
    }, { idempotencyKey: `journey-confirmation/${submission.submissionId}` });

    if (confirmation.error) console.error("Journey confirmation email failed", confirmation.error.name);
  }

  return Response.json({ ok: true, reference });
}
