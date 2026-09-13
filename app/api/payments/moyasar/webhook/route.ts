import { createSupabaseAdminClient } from "../../../../supabase-admin";
import {
  fetchMoyasarPayment,
  isPaymentId,
  isPlanId,
  recordPlanPayment,
  secretsMatch,
  PLAN_PAYMENT_COLUMNS,
  type PlanRow,
} from "../../../../journey/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Moyasar's server-to-server notice that a payment succeeded.
//
// This is what unlocks a plan when the customer never comes back: closed the
// tab on the bank's page, lost signal, finished an STC Pay approval on their
// phone. The redirect handles the common case and this handles the rest;
// both go through recordPlanPayment, which is safe to run twice.
//
// The body is not trusted beyond its payment id. The shared secret shows the
// call came from Moyasar, and the payment is still fetched back with our own
// key before it counts, so a replayed or edited body can at worst ask us to
// look up a real payment.
//
// Status codes matter. Moyasar retries anything that is not 2xx, five more
// times over a few hours, so a problem worth retrying (Moyasar or the
// database briefly unreachable) answers 5xx, and anything that will never
// succeed answers 200 and is logged for a person.

export async function POST(request: Request) {
  const secret = process.env.MOYASAR_WEBHOOK_SECRET?.trim() ?? "";
  if (!secret) return Response.json({ error: "not configured" }, { status: 503 });

  let body: { type?: unknown; secret_token?: unknown; data?: { id?: unknown } | null };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }

  if (!secretsMatch(body.secret_token, secret)) return Response.json({ error: "unauthorised" }, { status: 401 });
  if (body.type !== "payment_paid") return Response.json({ ignored: typeof body.type === "string" ? body.type : null });

  const paymentId = body.data?.id;
  if (!isPaymentId(paymentId)) return Response.json({ ignored: "no payment id" });

  const fetched = await fetchMoyasarPayment(paymentId);
  if ("error" in fetched) {
    if (fetched.error === "unavailable") return Response.json({ error: "moyasar unavailable" }, { status: 502 });
    console.error(`[moyasar webhook] payment ${paymentId} not found with our key`);
    return Response.json({ ignored: "payment not found" });
  }

  const payment = fetched.payment;
  const planId = payment.metadata?.proposal_id;
  if (!isPlanId(planId)) {
    console.error(`[moyasar webhook] payment ${payment.id} names no plan`);
    return Response.json({ ignored: "no plan on payment" });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("proposals").select(PLAN_PAYMENT_COLUMNS).eq("id", planId).maybeSingle();
  if (error) return Response.json({ error: "database unavailable" }, { status: 503 });
  const plan = data as PlanRow | null;
  if (!plan) {
    console.error(`[moyasar webhook] payment ${payment.id} names plan ${planId}, which does not exist`);
    return Response.json({ ignored: "plan not found" });
  }

  try {
    const { result, reason } = await recordPlanPayment(supabase, plan, payment);
    if (result === "rejected" || reason) {
      console.error(`[moyasar webhook] payment ${payment.id} for plan ${plan.id}: ${result}${reason ? ` (${reason})` : ""}`);
    }
    return Response.json({ result });
  } catch (err) {
    console.error(`[moyasar webhook] ${(err as Error).message}`);
    return Response.json({ error: "could not record" }, { status: 503 });
  }
}
