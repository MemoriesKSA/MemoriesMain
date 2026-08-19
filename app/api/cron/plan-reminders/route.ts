import { Resend } from "resend";
import { createSupabaseAdminClient } from "../../../supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

// One reminder per unpaid plan, roughly a day after it was published
// (see docs/paid-plans-spec.md section 7).
//
// One, not a sequence. The customer already has the whole overview and a full
// day of their trip for free; repeatedly chasing them on a SAR 99 product
// reads as pestering. `reminder_sent_at` is stamped before the send is even
// attempted, so a retry or an overlapping run can never double-send.
//
// Deliberately no invented expiry or countdown. The plan is built for their
// dates and ages out on its own, and manufacturing urgency on a product whose
// whole value is honesty would undercut everything else.

const REMIND_AFTER_HOURS = 24;
const BATCH = 25;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[c] ?? c);
}

export async function GET(request: Request) {
  // Vercel attaches `Authorization: Bearer $CRON_SECRET` to scheduled
  // invocations when that env var is set. Without the secret configured the
  // endpoint refuses to run at all, rather than sitting open to the internet.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("Plan reminders skipped: CRON_SECRET is not set");
    return Response.json({ error: "Not configured." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("Plan reminders skipped: RESEND_API_KEY is missing");
    return Response.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = createSupabaseAdminClient();
  const cutoff = new Date(Date.now() - REMIND_AFTER_HOURS * 3_600_000).toISOString();

  const { data: due, error } = await supabase
    .from("proposals")
    .select("id, reference, city, customer_name, customer_email, public_token")
    .eq("status", "published")
    .eq("paid", false)
    .is("reminder_sent_at", null)
    .lt("created_at", cutoff)
    .limit(BATCH);

  if (error) {
    console.error("Plan reminders query failed", error.message);
    return Response.json({ error: "Query failed." }, { status: 500 });
  }
  if (!due?.length) return Response.json({ ok: true, sent: 0 });

  const resend = new Resend(resendKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "MEMORIES Journeys <journeys@send.memories.tours>";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://memories.tours";
  let sent = 0;

  for (const plan of due) {
    if (!plan.customer_email) continue;

    // Stamped first, on purpose. If the send then fails the customer simply
    // doesn't get a reminder, which is a far better outcome than a retry loop
    // emailing them repeatedly.
    const { data: claimed } = await supabase
      .from("proposals")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", plan.id)
      .is("reminder_sent_at", null)
      .select("id")
      .single();
    if (!claimed) continue;

    // The proposals table doesn't record which language the customer
    // submitted in, and this is a single short nudge, so it goes out
    // bilingually rather than guessing wrong or adding a column for one line.
    const link = `${siteUrl}/journey/${plan.public_token}`;
    const name = escapeHtml(plan.customer_name ?? "");
    const city = escapeHtml(plan.city ?? "");
    const reference = escapeHtml(plan.reference ?? "");

    const result = await resend.emails.send({
      from: fromEmail,
      to: [plan.customer_email],
      subject: `Your ${plan.city} plan is still waiting · خطتك ما زالت بانتظارك`,
      html: `<div style="background:#f4f0e7;padding:32px;font-family:Arial,sans-serif"><div style="max-width:620px;margin:auto;background:#fff;border-radius:18px;padding:34px"><p style="color:#b88724;font-size:12px;letter-spacing:2px">MEMORIES</p><h1 style="color:#063b34;font-family:Georgia,serif;font-size:22px">Hello ${name}, your plan is still here.</h1><p style="font-size:15px;line-height:1.8">You've seen the overview and a full day of your ${city} trip. The rest is ready in the same detail whenever you'd like it.</p><p style="margin:22px 0"><a href="${link}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#063b34;color:#fff;text-decoration:none;font-weight:700">Open your plan · افتح خطتك</a></p><div dir="rtl" style="border-top:1px solid #e2e6e1;padding-top:18px"><p style="font-size:15px;line-height:1.9;margin:0">أهلًا ${name}، خطة ${city} الخاصة بك ما زالت هنا. قرأت نظرة عامة عليها ويومًا كاملًا منها، وبقية الأيام جاهزة بالتفصيل نفسه متى ما أردت.</p></div><p style="color:#6a746f;font-size:13px;margin-top:20px">Reference · رقم الطلب: ${reference}</p></div></div>`,
      text: `Hello ${plan.customer_name}, your ${plan.city} plan is still waiting: ${link}

أهلًا ${plan.customer_name}، خطة ${plan.city} الخاصة بك ما زالت بانتظارك: ${link}`,
      tags: [{ name: "email_type", value: "plan_reminder" }],
    }, { idempotencyKey: `plan-reminder/${plan.id}` });

    if (result.error) console.error(`Reminder failed for ${plan.reference}`, result.error.name);
    else sent++;
  }

  return Response.json({ ok: true, considered: due.length, sent });
}
