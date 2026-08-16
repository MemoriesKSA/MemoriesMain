import { Resend } from "resend";
import { after } from "next/server";
import { generateDraftGuide } from "../../draft-guide";

export const runtime = "nodejs";

type JourneySubmission = {
  submissionId?: unknown;
  locale?: unknown;
  journeyType?: unknown;
  country?: unknown;
  city?: unknown;
  purpose?: unknown;
  studySupport?: unknown;
  hasSpecificField?: unknown;
  specificField?: unknown;
  hasSpecificUniversity?: unknown;
  specificUniversity?: unknown;
  travellers?: unknown;
  travellerCount?: unknown;
  fromDate?: unknown;
  toDate?: unknown;
  transport?: unknown;
  stays?: unknown;
  stayRating?: unknown;
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
  privacyAccepted?: unknown;
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
  return `<tr><td style="padding:11px 0;color:#78837f;border-bottom:1px solid #e7e9e5;width:34%;vertical-align:top;font-size:13px">${escapeHtml(label)}</td><td style="padding:11px 0 11px 18px;color:#123c35;border-bottom:1px solid #e7e9e5;font-size:14px;font-weight:700;line-height:1.5">${escapeHtml(display).replace(/\n/g, "<br />")}</td></tr>`;
}

function section(title: string, subtitle: string, rows: string[]) {
  const content = rows.filter(Boolean).join("");
  if (!content) return "";
  return `<div style="padding:26px 30px;border-bottom:1px solid #e2e6e1"><p style="margin:0 0 4px;color:#ba8427;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase">${escapeHtml(title)}</p><p style="margin:0 0 14px;color:#86908d;font-size:12px">${escapeHtml(subtitle)}</p><table role="presentation" style="width:100%;border-collapse:collapse">${content}</table></div>`;
}

function summaryCard(label: string, value: string) {
  return `<td style="width:50%;padding:7px"><div style="min-height:58px;padding:14px;border:1px solid #dce4df;border-radius:12px;background:#f8faf8"><p style="margin:0 0 5px;color:#7b8783;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase">${escapeHtml(label)}</p><p style="margin:0;color:#0b332d;font-size:15px;font-weight:800;line-height:1.35">${escapeHtml(value)}</p></div></td>`;
}

function formatDate(value: string) {
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(parsed);
}

function tripLength(from: string, to: string) {
  const start = new Date(`${from}T00:00:00Z`).getTime();
  const end = new Date(`${to}T00:00:00Z`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return "";
  const nights = Math.round((end - start) / 86_400_000);
  return `${nights + 1} days / ${nights} nights`;
}

function textLine(label: string, value: string | string[]) {
  const display = Array.isArray(value) ? value.map(readable).join(", ") : value;
  return display ? `${label}: ${display}` : "";
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
    hasSpecificField: clean(raw.hasSpecificField, 3),
    specificField: clean(raw.specificField, 200),
    hasSpecificUniversity: clean(raw.hasSpecificUniversity, 3),
    specificUniversity: clean(raw.specificUniversity, 200),
    travellers: clean(raw.travellers, 100),
    travellerCount: clean(raw.travellerCount, 20),
    fromDate: clean(raw.fromDate, 20),
    toDate: clean(raw.toDate, 20),
    transport: cleanList(raw.transport),
    stays: cleanList(raw.stays),
    stayRating: clean(raw.stayRating, 30),
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
    privacyAccepted: clean(raw.privacyAccepted, 3),
  };

  const missingStudyDetails = submission.journeyType === "study" && (!submission.hasSpecificField || !submission.hasSpecificUniversity || (submission.hasSpecificField === "yes" && !submission.specificField) || (submission.hasSpecificUniversity === "yes" && !submission.specificUniversity));
  const missingRequired = !submission.submissionId || !submission.journeyType || !submission.country || !submission.city || !submission.purpose || !submission.travellers || !submission.travellerCount || !submission.fromDate || !submission.toDate || !submission.transport.length || !submission.stays.length || !submission.budget || !submission.name || !submission.delivery.length || submission.privacyAccepted !== "yes" || missingStudyDetails;
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
  const journeyNames: Record<string, string> = { journey: "Dream journey", saudi: "Discover Saudi Arabia", study: "Study Abroad" };
  const journeyName = journeyNames[submission.journeyType] ?? readable(submission.journeyType);
  const destination = `${readable(submission.city)}, ${readable(submission.country)}`;
  const dates = `${formatDate(submission.fromDate)} → ${formatDate(submission.toDate)}`;
  const duration = tripLength(submission.fromDate, submission.toDate);
  const phoneDisplay = `${submission.phoneCode} ${submission.phone}`.trim();
  const phoneDigits = `${submission.phoneCode}${submission.phone}`.replace(/\D/g, "");
  const contactButtons = [
    emailPattern.test(submission.email) ? `<a href="mailto:${encodeURIComponent(submission.email)}?subject=${encodeURIComponent(`MEMORIES ${reference}`)}" style="display:inline-block;margin:0 8px 8px 0;padding:11px 17px;border-radius:9px;background:#0b443b;color:#fff;text-decoration:none;font-size:13px;font-weight:800">Reply by email</a>` : "",
    phoneDigits ? `<a href="https://wa.me/${phoneDigits}" style="display:inline-block;margin:0 8px 8px 0;padding:11px 17px;border-radius:9px;background:#e4ae43;color:#0b332d;text-decoration:none;font-size:13px;font-weight:800">Open WhatsApp</a>` : "",
  ].filter(Boolean).join("");
  const internalHtml = `<div style="margin:0;background:#eef2ee;padding:24px;font-family:Arial,sans-serif;color:#123c35"><div style="max-width:720px;margin:auto;overflow:hidden;border:1px solid #dce3de;border-radius:20px;background:#fff;box-shadow:0 14px 40px rgba(9,50,43,.08)"><div style="padding:28px 30px;background:#063b34;color:#fff"><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td><p style="margin:0 0 8px;color:#e7b94f;font-size:11px;font-weight:800;letter-spacing:2px">MEMORIES · NEW JOURNEY REQUEST</p><h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:600">${escapeHtml(submission.name)} is ready to plan.</h1><p style="margin:9px 0 0;color:#b9cbc6;font-size:13px">Submitted in ${submission.locale === "ar" ? "Arabic" : "English"} · Reference ${escapeHtml(reference)}</p></td><td style="width:92px;text-align:right;vertical-align:top"><span style="display:inline-block;padding:8px 10px;border:1px solid rgba(231,185,79,.5);border-radius:999px;color:#f0c868;font-size:11px;font-weight:800">NEW</span></td></tr></table></div><div style="padding:21px 23px 14px"><table role="presentation" style="width:100%;border-collapse:collapse"><tr>${summaryCard("Journey", journeyName)}${summaryCard("Destination", destination)}</tr><tr>${summaryCard("Travel dates", dates)}${summaryCard("Complete budget", budget)}</tr></table></div>${section("Traveller & contact", "Everything needed to respond to the customer.", [row("Full name", submission.name), row("Preferred contact", submission.delivery), row("Email", submission.email), row("Phone / WhatsApp", phoneDisplay), row("Website language", submission.locale === "ar" ? "Arabic" : "English")])}${section("Journey overview", "The core brief for planning and qualification.", [row("Journey type", journeyName), row("Purpose / style", submission.purpose), row("Study support", submission.studySupport), row("Specific field?", submission.hasSpecificField), row("Preferred field", submission.specificField), row("Specific university?", submission.hasSpecificUniversity), row("Preferred university", submission.specificUniversity), row("Destination", destination), row("Travel dates", dates), row("Trip length", duration), row("Travellers", `${readable(submission.travellers)}, ${submission.travellerCount}`), row("Complete budget", budget)])}${section("Package requested", "Services the customer wants MEMORIES to arrange.", [row("Transport", submission.transport), row("Accommodation", submission.stays), row("Accommodation rating", submission.stayRating), row("Plan should include", submission.planIncludes), row("Package notes", submission.packageNotes)])}${section("Customer notes", "Preferences and context to personalize the response.", [row("Final notes", submission.notes)])}<div style="padding:25px 30px;background:#f7f9f7"><p style="margin:0 0 13px;color:#66736f;font-size:12px">Respond using the customer’s preferred channel. The request number is included in the subject for easy searching.</p>${contactButtons}<p style="margin:9px 0 0;color:#929b98;font-size:10px">MEMORIES internal journey brief · ${escapeHtml(reference)}</p></div></div></div>`;
  const internalText = [
    "MEMORIES — NEW JOURNEY REQUEST", `Reference: ${reference}`, "", "TRAVELLER & CONTACT",
    textLine("Full name", submission.name), textLine("Preferred contact", submission.delivery), textLine("Email", submission.email), textLine("Phone / WhatsApp", phoneDisplay), textLine("Website language", submission.locale === "ar" ? "Arabic" : "English"),
    "", "JOURNEY OVERVIEW", textLine("Journey type", journeyName), textLine("Purpose / style", submission.purpose), textLine("Study support", submission.studySupport), textLine("Specific field?", submission.hasSpecificField), textLine("Preferred field", submission.specificField), textLine("Specific university?", submission.hasSpecificUniversity), textLine("Preferred university", submission.specificUniversity), textLine("Destination", destination), textLine("Travel dates", dates), textLine("Trip length", duration), textLine("Travellers", `${readable(submission.travellers)}, ${submission.travellerCount}`), textLine("Complete budget", budget),
    "", "PACKAGE REQUESTED", textLine("Transport", submission.transport), textLine("Accommodation", submission.stays), textLine("Accommodation rating", submission.stayRating), textLine("Plan should include", submission.planIncludes), textLine("Package notes", submission.packageNotes),
    "", "CUSTOMER NOTES", textLine("Final notes", submission.notes),
  ].filter((line, index, lines) => line || (index > 0 && lines[index - 1])).join("\n");

  const internal = await resend.emails.send({
    from: fromEmail,
    to: [reviewEmail],
    replyTo: emailPattern.test(submission.email) ? submission.email : undefined,
    subject: `[NEW] ${reference} | ${readable(submission.city)} | ${submission.name}`,
    html: internalHtml,
    text: internalText,
    tags: [{ name: "email_type", value: "journey_request" }, { name: "journey_type", value: submission.journeyType }, { name: "language", value: submission.locale }],
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
      subject: submission.locale === "ar" ? `استلمنا رحلة أحلامك، ${reference}` : `We received your dream journey, ${reference}`,
      text: submission.locale === "ar"
        ? `رحلة أحلامك وصلت إلينا.\n\nأهلًا ${submission.name}، شكرًا لمشاركتنا تفاصيل رحلتك إلى ${readable(submission.city)}. سيقوم فريقنا بمراجعة طلبك والتواصل معك بالطريقة التي اخترتها.\n\nرقم الطلب: ${reference}`
        : `Your dream journey has reached us.\n\nHello ${submission.name}, thank you for sharing your journey to ${readable(submission.city)}. Our team will review the details and continue with you through your chosen contact method.\n\nRequest reference: ${reference}`,
      html: submission.locale === "ar"
        ? `<div dir="rtl" style="background:#f4f0e7;padding:32px;font-family:Arial,sans-serif"><div style="max-width:620px;margin:auto;background:#fff;border-radius:18px;padding:34px"><p style="color:#b88724;font-size:12px;letter-spacing:1px">MEMORIES · ذكريات</p><h1 style="color:#063b34;font-family:Georgia,serif">رحلة أحلامك وصلت إلينا.</h1><p>أهلًا ${escapeHtml(submission.name)}، شكرًا لمشاركتنا تفاصيل رحلتك إلى ${escapeHtml(readable(submission.city))}. سيقوم فريقنا بمراجعة طلبك والتواصل معك بالطريقة التي اخترتها.</p><p><strong>رقم الطلب:</strong> ${reference}</p></div></div>`
        : `<div style="background:#f4f0e7;padding:32px;font-family:Arial,sans-serif"><div style="max-width:620px;margin:auto;background:#fff;border-radius:18px;padding:34px"><p style="color:#b88724;font-size:12px;letter-spacing:2px">MEMORIES</p><h1 style="color:#063b34;font-family:Georgia,serif">Your dream journey has reached us.</h1><p>Hello ${escapeHtml(submission.name)}, thank you for sharing your journey to ${escapeHtml(readable(submission.city))}. Our team will review the details and continue with you through your chosen contact method.</p><p><strong>Request reference:</strong> ${reference}</p></div></div>`,
    }, { idempotencyKey: `journey-confirmation/${submission.submissionId}` });

    if (confirmation.error) console.error("Journey confirmation email failed", confirmation.error.name);
  }

  if (submission.journeyType === "saudi") {
    after(() => generateDraftGuide({
      submissionId: submission.submissionId,
      city: submission.city,
      purpose: submission.purpose,
      travellers: submission.travellers,
      travellerCount: submission.travellerCount,
      fromDate: submission.fromDate,
      toDate: submission.toDate,
      transport: submission.transport,
      stays: submission.stays,
      planIncludes: submission.planIncludes,
      packageNotes: submission.packageNotes,
      currency: submission.currency,
      budget: submission.budget,
      name: submission.name,
    }));
  }

  return Response.json({ ok: true, reference });
}
