// Generates a first-pass, internal-only itinerary draft for Discover Saudi
// Arabia journey requests, using only real grounded facts from
// flagship-city-data.ts. Runs in the background after the customer's
// confirmation has already been sent (see app/api/journeys/route.ts), and
// the result goes to the team only, never to the customer, a human always
// reviews and edits before anything reaches them.

import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { flagshipCityGuideBySlug, type FlagshipCityGuide } from "./flagship-city-data";
import { saudiArabia } from "./components/planner-data";

export type DraftGuideSubmission = {
  submissionId: string;
  city: string;
  purpose: string;
  travellers: string;
  travellerCount: string;
  fromDate: string;
  toDate: string;
  transport: string[];
  stays: string[];
  planIncludes: string[];
  packageNotes: string;
  currency: string;
  budget: string;
  name: string;
};

function readable(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

function serializeGuideForDraft(guide: FlagshipCityGuide, ar: boolean): string {
  const lines: string[] = [];
  lines.push(`${ar ? "المعالم" : "Attractions"}: ${guide.attractions.map((a) => `${ar ? a.nameAr : a.nameEn} (${ar ? a.categoryAr : a.categoryEn}): ${ar ? a.descriptionAr : a.descriptionEn}`).join(" | ")}`);
  if (guide.dining.length) lines.push(`${ar ? "المطاعم" : "Dining"}: ${guide.dining.map((d) => `${ar ? d.nameAr : d.nameEn} (${ar ? d.cuisineAr : d.cuisineEn}): ${ar ? d.descriptionAr : d.descriptionEn}`).join(" | ")}`);
  if (guide.stay.length) lines.push(`${ar ? "الفنادق" : "Hotels"}: ${guide.stay.map((s) => `${ar ? s.nameAr : s.nameEn}${s.tier ? ` [${s.tier}]` : ""}: ${ar ? s.descriptionAr : s.descriptionEn}`).join(" | ")}`);
  if (guide.trustedProviders?.length) lines.push(`${ar ? "سائقون خاصون موثوقون" : "Trusted private drivers"}: ${guide.trustedProviders.map((p) => `${ar ? p.nameAr : p.nameEn} (${ar ? p.typeAr : p.typeEn}): ${ar ? p.noteAr : p.noteEn}`).join(" | ")}`);
  if (guide.sampleDay.length) lines.push(`${ar ? "نمط يوم استخدمه فريقنا من قبل" : "A sample day pattern our team has used before"}: ${guide.sampleDay.map((b) => `${ar ? b.timeAr : b.timeEn} — ${ar ? b.placeAr : b.placeEn}: ${ar ? b.descriptionAr : b.descriptionEn}`).join(" | ")}`);
  if (guide.travelTips?.length) lines.push(`${ar ? "نصائح السفر" : "Travel tips"}: ${guide.travelTips.map((t) => (ar ? t.ar : t.en)).join(" ")}`);
  return lines.join("\n");
}

function tripLength(from: string, to: string) {
  const start = new Date(`${from}T00:00:00Z`).getTime();
  const end = new Date(`${to}T00:00:00Z`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return "unspecified length";
  const nights = Math.round((end - start) / 86_400_000);
  return `${nights + 1} days / ${nights} nights`;
}

// English and Arabic run as two independent calls (see generateDraftGuide),
// so each prompt only needs to produce one language, not both back-to-back
// in a single response, that was taking long enough to hit Vercel's
// function timeout.
function buildSystemPrompt(ar: boolean) {
  return `You are drafting an internal first-pass itinerary sketch for the MEMORIES planning team, written entirely in ${ar ? "Arabic" : "English"}. This is NOT a message to the customer, a human planner will review, correct and personalize it before anything reaches them, so it's fine to be structured, specific and detailed here in a way the customer-facing chat never is.

Rules:
- Only use the real, named places (attractions, dining, hotels, private drivers) given to you in the grounded facts below. Never invent a business name, address or price. If something isn't covered by the grounded facts, say plainly that the team should research it, don't guess.
- Write a day-by-day sketch matching the trip length, pace it sensibly, don't over-pack days.
- Weigh the stated budget, traveller count and trip length when choosing between the luxury and budget-tier hotels in the grounded facts, and say which tier you picked and why.
- If the customer asked for a private driver (see requested transport), recommend one of the trusted providers listed and say why.
- If the customer's notes mention something specific (a hotel, dietary need, occasion), work it in or flag it clearly for the planner.
- Plain, clear text. Day headers like "Day 1" are fine here. No markdown asterisks.
- End with a short "For the planner" section flagging anything uncertain, missing, or worth double-checking before this goes anywhere near the customer.
- Write the whole thing in ${ar ? "Arabic" : "English"} only, using the ${ar ? "Arabic" : "English"} place names and facts given to you below exactly as given, don't translate or transliterate them yourself.`;
}

function buildUserPrompt(submission: DraftGuideSubmission, cityLabel: string, groundedFacts: string) {
  return `Customer request summary:
Name: ${submission.name}
Destination: ${cityLabel}, Saudi Arabia
Trip dates: ${submission.fromDate} to ${submission.toDate} (${tripLength(submission.fromDate, submission.toDate)})
Travellers: ${readable(submission.travellers)}, ${submission.travellerCount}
Purpose / style: ${readable(submission.purpose)}
Requested transport: ${submission.transport.map(readable).join(", ") || "not specified"}
Requested stay type: ${submission.stays.map(readable).join(", ") || "not specified"}
Plan should include: ${submission.planIncludes.map(readable).join(", ") || "not specified"}
Total budget: ${submission.currency} ${Number(submission.budget).toLocaleString("en-US")}
Customer notes: ${submission.packageNotes || "none"}

Real, grounded facts for ${cityLabel} (only use these named places):
${groundedFacts}

Draft the day-by-day sketch now.`;
}

async function generateOneLanguage(anthropic: Anthropic, submission: DraftGuideSubmission, cityLabel: string, groundedFacts: string, ar: boolean): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-opus-5",
    max_tokens: 6000,
    thinking: { type: "adaptive" },
    // "high" effort was pushing a single call's reasoning time past the
    // function's own timeout even after parallelizing the two languages.
    // "medium" is still a real reasoning pass, just faster.
    output_config: { effort: "medium" },
    system: buildSystemPrompt(ar),
    messages: [{ role: "user", content: buildUserPrompt(submission, cityLabel, groundedFacts) }],
  });
  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
  return textBlock?.text?.trim() ?? "";
}

function wrapEmailHtml(reference: string, cityLabel: string, customerName: string, englishDraft: string, arabicDraft: string) {
  const englishHtml = escapeHtml(englishDraft).replace(/\n/g, "<br />");
  const arabicSection = arabicDraft
    ? `<div style="border-top:2px solid #e2e6e1;margin-top:22px;padding-top:22px" dir="rtl"><p style="margin:0 0 14px;color:#ba8427;font-size:11px;font-weight:800;letter-spacing:1.5px">النسخة العربية</p><div style="font-size:14px;line-height:1.9">${escapeHtml(arabicDraft).replace(/\n/g, "<br />")}</div></div>`
    : "";
  return `<div style="margin:0;background:#eef2ee;padding:24px;font-family:Arial,sans-serif;color:#123c35"><div style="max-width:720px;margin:auto;overflow:hidden;border:1px solid #dce3de;border-radius:20px;background:#fff;box-shadow:0 14px 40px rgba(9,50,43,.08)"><div style="padding:24px 30px;background:#063b34;color:#fff"><p style="margin:0 0 8px;color:#e7b94f;font-size:11px;font-weight:800;letter-spacing:2px">MEMORIES · AI DRAFT ITINERARY, INTERNAL ONLY · مسودة داخلية</p><h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:600">A first-pass sketch for ${escapeHtml(customerName)}'s ${escapeHtml(cityLabel)} trip</h1><p style="margin:9px 0 0;color:#b9cbc6;font-size:13px">Reference ${escapeHtml(reference)} · review and edit before this shapes anything sent to the customer</p></div><div style="padding:28px 30px;font-size:14px;line-height:1.7">${englishHtml}${arabicSection}</div></div></div>`;
}

// Fire-and-forget: call from app/api/journeys/route.ts inside after(), never
// awaited by the customer-facing response. Swallows its own errors, a
// failed draft should never surface anywhere or block anything.
export async function generateDraftGuide(submission: DraftGuideSubmission): Promise<void> {
  try {
    const guide = flagshipCityGuideBySlug("saudi-arabia", submission.city);
    if (!guide) return;

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    if (!anthropicKey || !resendKey) return;

    const cityOption = saudiArabia.cities.find((c) => c.value === submission.city);
    const cityLabelEn = cityOption?.en ?? readable(submission.city);
    const cityLabelAr = cityOption?.ar ?? cityLabelEn;
    const reference = submission.submissionId.slice(0, 8).toUpperCase();

    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const [englishDraft, arabicDraft] = await Promise.all([
      generateOneLanguage(anthropic, submission, cityLabelEn, serializeGuideForDraft(guide, false), false),
      generateOneLanguage(anthropic, submission, cityLabelAr, serializeGuideForDraft(guide, true), true),
    ]);

    if (!englishDraft && !arabicDraft) return;

    const resend = new Resend(resendKey);
    const reviewEmail = process.env.JOURNEY_REVIEW_EMAIL ?? "memoriesksasupport@gmail.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "MEMORIES Journeys <journeys@send.memories.tours>";

    const result = await resend.emails.send({
      from: fromEmail,
      to: [reviewEmail],
      subject: `[AI DRAFT] ${reference} | ${cityLabelEn} itinerary sketch`,
      html: wrapEmailHtml(reference, cityLabelEn, submission.name, englishDraft, arabicDraft),
      text: [englishDraft, arabicDraft].filter(Boolean).join("\n\n===\n\n"),
      tags: [{ name: "email_type", value: "draft_guide" }],
    }, { idempotencyKey: `draft-guide/${submission.submissionId}` });

    if (result.error) console.error("Draft guide email failed", result.error.name);
  } catch (error) {
    console.error("Draft guide generation failed", error);
  }
}
