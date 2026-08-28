import { Resend } from "resend";
import { after } from "next/server";
import { generateDraftGuide } from "../../draft-guide";
import { isPlannableCountry, STUDY_ABROAD_PAUSED, travelCountries } from "../../components/planner-data";
import { createSupabaseAdminClient } from "../../supabase-admin";
import { newFollowToken, followUrl, releaseAt, deliveryPromise } from "../../follow/release";


export const runtime = "nodejs";
// The AI draft (see draft-guide.ts) runs in the background via after()
// once the customer response has already gone out. English/Arabic used to
// generate in parallel, but that let them independently disagree with
// each other (different hotel picks, contradictory assumptions), so it's
// now fully sequential on purpose: research, then one English drafting
// pass, then a translation pass into Arabic (faithful to the English, no
// independent redrafting), then a self-check pass, four stages with
// nothing running concurrently. If the account's plan caps functions below
// this, the deploy itself will surface that rather than failing silently at
// runtime.
//
// 300 was chosen as "headroom" before anyone had timed a real run, and it
// was not headroom at all. Measured end to end: Georgia 502s, Türkiye 559s,
// Russia 1062s, Thailand 1750s. Every one would have been cut off here.
// Saudi drafts never hit it only because those five cities have curated
// research and skip the expensive half, which is why nothing surfaced this
// until the new countries went in.
//
// 800 seconds, which is the maximum Vercel makes generally available on the
// Pro plan. Hobby's maximum IS 300, not a default that can be raised, so an
// earlier attempt at 800 failed the deploy after a clean build and four
// commits sat unshipped before anyone noticed. Do not raise this past 800
// without checking the plan first: above that is a per-function beta.
//
// It needs to be this high because the work genuinely takes that long. A
// warm two-stop Türkiye draft measured about 450 seconds and was killed at
// 300 partway through the Arabic translation, losing the translation and
// the email. Single-city Saudi drafts run about 200 and never hit it, which
// is why this only surfaced when multi-stop trips outside Saudi began.
//
// Work scheduled with after() counts against this, which is the whole point:
// Vercel's docs are explicit that if the function times out, those promises
// are cancelled.
export const maxDuration = 800;

type JourneySubmission = {
  submissionId?: unknown;
  locale?: unknown;
  journeyType?: unknown;
  country?: unknown;
  city?: unknown;
  purpose?: unknown;
  studySupport?: unknown;
  saudiCitizen?: unknown;
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
  stops?: unknown;
  stopPurposes?: unknown;
  stopNights?: unknown;
  stopNightsChosen?: unknown;
  departureCity?: unknown;
  flightTiming?: unknown;
  planIncludes?: unknown;
  packageNotes?: unknown;
  currency?: unknown;
  budget?: unknown;
  budgetMode?: unknown;
  delivery?: unknown;
  name?: unknown;
  email?: unknown;
  phoneCode?: unknown;
  phone?: unknown;
  notes?: unknown;
  priority?: unknown;
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

// The internal review inbox has both Arabic and English speakers, so every
// static label in this email is bilingual regardless of the customer's own
// submission language.
type Bi = { en: string; ar: string };

function bi(label: Bi) {
  return `${label.en} · ${label.ar}`;
}

function row(label: Bi, value: string | string[]) {
  const display = Array.isArray(value) ? value.map(readable).join(", ") : value;
  if (!display) return "";
  return `<tr><td style="padding:11px 0;color:#78837f;border-bottom:1px solid #e7e9e5;width:34%;vertical-align:top;font-size:13px">${escapeHtml(bi(label))}</td><td style="padding:11px 0 11px 18px;color:#123c35;border-bottom:1px solid #e7e9e5;font-size:14px;font-weight:700;line-height:1.5">${escapeHtml(display).replace(/\n/g, "<br />")}</td></tr>`;
}

function section(title: Bi, subtitle: Bi, rows: string[]) {
  const content = rows.filter(Boolean).join("");
  if (!content) return "";
  return `<div style="padding:26px 30px;border-bottom:1px solid #e2e6e1"><p style="margin:0 0 4px;color:#ba8427;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase">${escapeHtml(bi(title))}</p><p style="margin:0 0 14px;color:#86908d;font-size:12px">${escapeHtml(bi(subtitle))}</p><table role="presentation" style="width:100%;border-collapse:collapse">${content}</table></div>`;
}

function summaryCard(label: Bi, value: string) {
  return `<td style="width:50%;padding:7px"><div style="min-height:58px;padding:14px;border:1px solid #dce4df;border-radius:12px;background:#f8faf8"><p style="margin:0 0 5px;color:#7b8783;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase">${escapeHtml(bi(label))}</p><p style="margin:0;color:#0b332d;font-size:15px;font-weight:800;line-height:1.35">${escapeHtml(value)}</p></div></td>`;
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

function textLine(label: Bi, value: string | string[]) {
  const display = Array.isArray(value) ? value.map(readable).join(", ") : value;
  return display ? `${bi(label)}: ${display}` : "";
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
    saudiCitizen: clean(raw.saudiCitizen, 3),
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
    stops: clean(raw.stops, 200),
    stopPurposes: clean(raw.stopPurposes, 200),
    stopNights: clean(raw.stopNights, 60),
    stopNightsChosen: clean(raw.stopNightsChosen, 5),
    departureCity: clean(raw.departureCity, 80),
    flightTiming: clean(raw.flightTiming, 30),
    planIncludes: cleanList(raw.planIncludes),
    packageNotes: clean(raw.packageNotes, 2_000),
    currency: clean(raw.currency, 10),
    budget: clean(raw.budget, 30),
    budgetMode: clean(raw.budgetMode, 10) || "fixed",
    delivery: cleanList(raw.delivery),
    name: clean(raw.name, 150),
    email: clean(raw.email, 254).toLowerCase(),
    phoneCode: clean(raw.phoneCode, 10),
    phone: clean(raw.phone, 40),
    notes: clean(raw.notes, 2_000),
    // "yes" when the customer chose the paid priority window. Payment is
    // not wired yet, so this records the choice and nothing is charged.
    priority: clean(raw.priority, 3),
    privacyAccepted: clean(raw.privacyAccepted, 3),
  };

  // Study abroad is a Saudi-citizen service, so the answer is required and
  // "no" is a refusal rather than a missing field. Enforced here as well as in
  // the form, because a form that disables its own submit button is a courtesy
  // and not a control: this endpoint is public.
  // The form no longer offers study, and this refuses it anyway: a stale
  // tab, a bookmarked link or a replayed request would otherwise reach a
  // path we have taken off the site.
  const studyPaused = STUDY_ABROAD_PAUSED && submission.journeyType === "study";
  const studyNotEligible = submission.journeyType === "study" && submission.saudiCitizen !== "yes";
  const missingStudyDetails = submission.journeyType === "study" && (!submission.hasSpecificField || !submission.hasSpecificUniversity || (submission.hasSpecificField === "yes" && !submission.specificField) || (submission.hasSpecificUniversity === "yes" && !submission.specificUniversity));
  const missingRequired = !submission.submissionId || !submission.journeyType || !submission.country || !submission.city || !submission.purpose || !submission.travellers || !submission.travellerCount || !submission.fromDate || !submission.toDate || !submission.transport.length || !submission.stays.length || (submission.budgetMode !== "open" && !submission.budget) || !submission.name || !submission.delivery.length || submission.privacyAccepted !== "yes" || missingStudyDetails || studyNotEligible || studyPaused;
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
  const websiteLanguage = submission.locale === "ar" ? "Arabic · العربية" : "English · الإنجليزية";
  const internalHtml = `<div style="margin:0;background:#eef2ee;padding:24px;font-family:Arial,sans-serif;color:#123c35"><div style="max-width:720px;margin:auto;overflow:hidden;border:1px solid #dce3de;border-radius:20px;background:#fff;box-shadow:0 14px 40px rgba(9,50,43,.08)"><div style="padding:28px 30px;background:#063b34;color:#fff"><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td><p style="margin:0 0 8px;color:#e7b94f;font-size:11px;font-weight:800;letter-spacing:2px">MEMORIES · NEW JOURNEY REQUEST · طلب رحلة جديد</p><h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:600">${escapeHtml(submission.name)} is ready to plan.</h1><p style="margin:9px 0 0;color:#b9cbc6;font-size:13px">Submitted in ${websiteLanguage} · Reference ${escapeHtml(reference)}</p></td><td style="width:92px;text-align:right;vertical-align:top"><span style="display:inline-block;padding:8px 10px;border:1px solid rgba(231,185,79,.5);border-radius:999px;color:#f0c868;font-size:11px;font-weight:800">NEW</span></td></tr></table></div><div style="padding:21px 23px 14px"><table role="presentation" style="width:100%;border-collapse:collapse"><tr>${summaryCard({ en: "Journey", ar: "الرحلة" }, journeyName)}${summaryCard({ en: "Destination", ar: "الوجهة" }, destination)}</tr><tr>${summaryCard({ en: "Travel dates", ar: "تواريخ السفر" }, dates)}${summaryCard({ en: "Complete budget", ar: "الميزانية الكاملة" }, budget)}</tr></table></div>${section({ en: "Traveller & contact", ar: "المسافر والتواصل" }, { en: "Everything needed to respond to the customer.", ar: "كل ما يلزم للرد على العميل." }, [row({ en: "Full name", ar: "الاسم الكامل" }, submission.name), row({ en: "Preferred contact", ar: "وسيلة التواصل المفضلة" }, submission.delivery), row({ en: "Email", ar: "البريد الإلكتروني" }, submission.email), row({ en: "Phone / WhatsApp", ar: "الهاتف / واتساب" }, phoneDisplay), row({ en: "Website language", ar: "لغة الموقع" }, websiteLanguage)])}${section({ en: "Journey overview", ar: "نظرة عامة على الرحلة" }, { en: "The core brief for planning and qualification.", ar: "الملخص الأساسي للتخطيط والتأهيل." }, [row({ en: "Journey type", ar: "نوع الرحلة" }, journeyName), row({ en: "Purpose / style", ar: "الغرض / الأسلوب" }, submission.purpose), row({ en: "Study support", ar: "الدعم الدراسي" }, submission.studySupport), row({ en: "Specific field?", ar: "تخصص محدد؟" }, submission.hasSpecificField), row({ en: "Preferred field", ar: "التخصص المفضل" }, submission.specificField), row({ en: "Specific university?", ar: "جامعة محددة؟" }, submission.hasSpecificUniversity), row({ en: "Preferred university", ar: "الجامعة المفضلة" }, submission.specificUniversity), row({ en: "Destination", ar: "الوجهة" }, destination), row({ en: "Travel dates", ar: "تواريخ السفر" }, dates), row({ en: "Trip length", ar: "مدة الرحلة" }, duration), row({ en: "Travellers", ar: "المسافرون" }, `${readable(submission.travellers)}, ${submission.travellerCount}`), row({ en: "Complete budget", ar: "الميزانية الكاملة" }, budget)])}${section({ en: "Package requested", ar: "الباقة المطلوبة" }, { en: "Services the customer wants MEMORIES to arrange.", ar: "الخدمات التي يريدها العميل من ميموريز." }, [row({ en: "Transport", ar: "النقل" }, submission.transport), row({ en: "Flying from", ar: "السفر من" }, submission.departureCity), row({ en: "Flight timing", ar: "توقيت الرحلة" }, submission.flightTiming), row({ en: "All stops", ar: "كل المحطات" }, submission.stops), row({ en: "Purpose per stop", ar: "الغرض لكل محطة" }, submission.stopPurposes), row({ en: "Nights per stop", ar: "الليالي لكل محطة" }, submission.stopNights), row({ en: "Split chosen by", ar: "من اختار التوزيع" }, submission.stopNights ? (submission.stopNightsChosen === "yes" ? "Customer" : "Suggested (even split)") : ""), row({ en: "Accommodation", ar: "الإقامة" }, submission.stays), row({ en: "Accommodation rating", ar: "تصنيف الإقامة" }, submission.stayRating), row({ en: "Plan should include", ar: "يجب أن تتضمن الخطة" }, submission.planIncludes), row({ en: "Package notes", ar: "ملاحظات الباقة" }, submission.packageNotes)])}${section({ en: "Customer notes", ar: "ملاحظات العميل" }, { en: "Preferences and context to personalize the response.", ar: "التفضيلات والسياق لتخصيص الرد." }, [row({ en: "Final notes", ar: "ملاحظات أخيرة" }, submission.notes)])}<div style="padding:25px 30px;background:#f7f9f7"><p style="margin:0 0 13px;color:#66736f;font-size:12px">Respond using the customer’s preferred channel. The request number is included in the subject for easy searching.</p>${contactButtons}<p style="margin:9px 0 0;color:#929b98;font-size:10px">MEMORIES internal journey brief · ${escapeHtml(reference)}</p></div></div></div>`;
  const internalText = [
    "MEMORIES — NEW JOURNEY REQUEST · طلب رحلة جديد", `Reference: ${reference}`, "", "TRAVELLER & CONTACT · المسافر والتواصل",
    textLine({ en: "Full name", ar: "الاسم الكامل" }, submission.name), textLine({ en: "Preferred contact", ar: "وسيلة التواصل المفضلة" }, submission.delivery), textLine({ en: "Email", ar: "البريد الإلكتروني" }, submission.email), textLine({ en: "Phone / WhatsApp", ar: "الهاتف / واتساب" }, phoneDisplay), textLine({ en: "Website language", ar: "لغة الموقع" }, websiteLanguage),
    "", "JOURNEY OVERVIEW · نظرة عامة على الرحلة", textLine({ en: "Journey type", ar: "نوع الرحلة" }, journeyName), textLine({ en: "Purpose / style", ar: "الغرض / الأسلوب" }, submission.purpose), textLine({ en: "Study support", ar: "الدعم الدراسي" }, submission.studySupport), textLine({ en: "Specific field?", ar: "تخصص محدد؟" }, submission.hasSpecificField), textLine({ en: "Preferred field", ar: "التخصص المفضل" }, submission.specificField), textLine({ en: "Specific university?", ar: "جامعة محددة؟" }, submission.hasSpecificUniversity), textLine({ en: "Preferred university", ar: "الجامعة المفضلة" }, submission.specificUniversity), textLine({ en: "Destination", ar: "الوجهة" }, destination), textLine({ en: "Travel dates", ar: "تواريخ السفر" }, dates), textLine({ en: "Trip length", ar: "مدة الرحلة" }, duration), textLine({ en: "Travellers", ar: "المسافرون" }, `${readable(submission.travellers)}, ${submission.travellerCount}`), textLine({ en: "Complete budget", ar: "الميزانية الكاملة" }, budget),
    "", "PACKAGE REQUESTED · الباقة المطلوبة", textLine({ en: "Transport", ar: "النقل" }, submission.transport), textLine({ en: "Flying from", ar: "السفر من" }, submission.departureCity), textLine({ en: "Flight timing", ar: "توقيت الرحلة" }, submission.flightTiming), textLine({ en: "Accommodation", ar: "الإقامة" }, submission.stays), textLine({ en: "Accommodation rating", ar: "تصنيف الإقامة" }, submission.stayRating), textLine({ en: "Plan should include", ar: "يجب أن تتضمن الخطة" }, submission.planIncludes), textLine({ en: "Package notes", ar: "ملاحظات الباقة" }, submission.packageNotes),
    "", "CUSTOMER NOTES · ملاحظات العميل", textLine({ en: "Final notes", ar: "ملاحظات أخيرة" }, submission.notes),
  ].filter((line, index, lines) => line || (index > 0 && lines[index - 1])).join("\n");

  // The row is created HERE, not when drafting finishes eight minutes
  // later, so the follow link in the confirmation email works the moment
  // the customer clicks it. The drafting pass fills the same row in.
  //
  // Allowed to fail without failing the submission: the request itself is
  // already safe in the review inbox, and a customer who cannot watch a
  // progress bar is in a far better position than one whose request was
  // refused because a status page could not be prepared.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const followToken = newFollowToken();
  // Minted here because the column is NOT NULL and the row opens now. It
  // opens no door yet: the journey page serves nothing that is not
  // published, and this row is only 'received'.
  const publicToken = newFollowToken();
  const submittedAt = new Date();
  const wantsPriority = submission.priority === "yes";
  try {
    const supabase = createSupabaseAdminClient();
    const { error: rowError } = await supabase.from("proposals").insert({
      reference,
      status: "received",
      customer_name: submission.name,
      customer_email: submission.email,
      customer_phone: submission.phone || null,
      city: readable(submission.city),
      from_date: submission.fromDate || null,
      to_date: submission.toDate || null,
      currency: submission.currency || "SAR",
      follow_token: followToken,
      public_token: publicToken,
      priority: wantsPriority,
      release_at: releaseAt(submittedAt, wantsPriority).toISOString(),
    });
    if (rowError) console.error("Could not open the follow record", rowError.message);
  } catch (error) {
    console.error("Could not open the follow record", error);
  }

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
        ? `<div dir="rtl" style="background:#f4f0e7;padding:32px;font-family:Arial,sans-serif"><div style="max-width:620px;margin:auto;background:#fff;border-radius:18px;padding:34px"><p style="color:#b88724;font-size:12px;letter-spacing:1px">MEMORIES</p><h1 style="color:#063b34;font-family:Georgia,serif">رحلة أحلامك وصلت إلينا.</h1><p>أهلًا ${escapeHtml(submission.name)}، شكرًا لمشاركتنا تفاصيل رحلتك إلى ${escapeHtml(readable(submission.city))}. سيقوم فريقنا بمراجعة طلبك والتواصل معك بالطريقة التي اخترتها.</p><p><strong>رقم الطلب:</strong> ${reference}</p><p style="margin:22px 0 0"><a href="${followUrl(siteUrl, followToken, true)}" style="display:inline-block;padding:12px 20px;border-radius:9px;background:#0b443b;color:#fff;text-decoration:none;font-size:14px;font-weight:700">تابع تقدّم خطتك</a></p><p style="margin:10px 0 0;color:#6a746f;font-size:13px">تصلك الخطة ${deliveryPromise(wantsPriority, true)}.</p></div></div>`
        : `<div style="background:#f4f0e7;padding:32px;font-family:Arial,sans-serif"><div style="max-width:620px;margin:auto;background:#fff;border-radius:18px;padding:34px"><p style="color:#b88724;font-size:12px;letter-spacing:2px">MEMORIES</p><h1 style="color:#063b34;font-family:Georgia,serif">Your dream journey has reached us.</h1><p>Hello ${escapeHtml(submission.name)}, thank you for sharing your journey to ${escapeHtml(readable(submission.city))}. Our team will review the details and continue with you through your chosen contact method.</p><p><strong>Request reference:</strong> ${reference}</p><p style="margin:22px 0 0"><a href="${followUrl(siteUrl, followToken, false)}" style="display:inline-block;padding:12px 20px;border-radius:9px;background:#0b443b;color:#fff;text-decoration:none;font-size:14px;font-weight:700">Follow your plan</a></p><p style="margin:10px 0 0;color:#6a746f;font-size:13px">Your plan will reach you ${deliveryPromise(wantsPriority, false)}.</p></div></div>`,
    }, { idempotencyKey: `journey-confirmation/${submission.submissionId}` });

    if (confirmation.error) console.error("Journey confirmation email failed", confirmation.error.name);
  }

  // Trigger on the destination, not the path the customer happened to click.
  // Saudi Arabia is selectable from the general "design your journey" path as
  // well as the Discover Saudi one, and gating on journeyType === "saudi"
  // meant an identical Riyadh or AlUla trip silently got no draft just
  // because of which card was picked first. If we hold real grounded facts
  // for the city, the draft is worth generating however they arrived.
  // Fire for any Saudi destination, including ones we hold no flagship data
  // for (the "Other" city option). Those can't produce a draft, but running
  // the generator anyway means it tells the team that plainly instead of the
  // request vanishing into silence, which is what used to happen.
  //
  // And for any other country where we do hold data for the chosen city.
  // The condition used to name Saudi twice, which is why a Turkish request
  // got the emails and no draft: nothing was broken, nothing was logged, the
  // branch simply never ran.
  const countrySlug = submission.country;
  const countryName = travelCountries.find((c) => c.value === countrySlug)?.en ?? readable(countrySlug);
  // Study is the third case: no study city is in the flagship data by design,
  // and until this was added every study request produced the team email and
  // no draft at all. Its plan is grounded in its own research categories
  // instead - universities, the Saudi visa route, housing, halal and prayer.
  const isStudyRequest = submission.journeyType === "study";
  // Was: study, or Saudi, or the city has a curated guide. That last clause
  // is what silently dropped 105 cities - the planner offered them, this
  // branch refused them, and nobody found out because a request that produces
  // nothing looks exactly like one that has not finished yet.
  //
  // Now both sides read the same list. A country is plannable or it is not in
  // the dropdown, so the two cannot drift apart again.
  if (isStudyRequest || isPlannableCountry(countrySlug)) {
    after(() => generateDraftGuide({
      submissionId: submission.submissionId,
      city: submission.city,
      countrySlug,
      countryName,
      purpose: submission.purpose,
      travellers: submission.travellers,
      travellerCount: submission.travellerCount,
      fromDate: submission.fromDate,
      toDate: submission.toDate,
      transport: submission.transport,
      stays: submission.stays,
      stayRating: submission.stayRating,
      stops: submission.stops ? submission.stops.split(",").filter(Boolean) : [],
      stopPurposes: submission.stopPurposes ? submission.stopPurposes.split(",").filter(Boolean) : [],
      // Per-stop nights come from the form, so the day each stop begins on
      // is known before the model runs rather than parsed back out of it.
      stopNights: submission.stopNights ? submission.stopNights.split(",").map(Number).filter((n) => Number.isInteger(n) && n >= 1) : [],
      stopNightsChosen: submission.stopNightsChosen === "yes",
      departureCity: submission.departureCity,
      flightTiming: submission.flightTiming,
      planIncludes: submission.planIncludes,
      packageNotes: submission.packageNotes,
      // Their own last words. Collected and emailed since the beginning,
      // and until now never shown to the pass that writes the plan.
      notes: submission.notes,
      currency: submission.currency,
      budget: submission.budget,
      budgetMode: submission.budgetMode,
      // Study only. Without these the study brief has nothing to work from
      // and would write a generic city guide instead of answering this
      // student's actual question.
      journeyType: submission.journeyType,
      studySupport: submission.studySupport,
      hasSpecificField: submission.hasSpecificField,
      specificField: submission.specificField,
      hasSpecificUniversity: submission.hasSpecificUniversity,
      specificUniversity: submission.specificUniversity,
      saudiCitizen: submission.saudiCitizen,
      name: submission.name,
      email: submission.email,
      phone: phoneDisplay,
    }));
  }

  return Response.json({ ok: true, reference });
}
