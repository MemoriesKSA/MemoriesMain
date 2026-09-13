import { createSupabaseAdminClient } from "../../../../supabase-admin";
import {
  checkoutConfig,
  fetchMoyasarPayment,
  isPaymentId,
  isPlanId,
  recordPlanPayment,
  PLAN_PAYMENT_COLUMNS,
  type PlanRow,
} from "../../../../journey/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Where Moyasar sends the customer after the payment form, whatever happened.
//
// Moyasar appends id, status and message. Only the id is used: the payment is
// fetched back from Moyasar and checked before anything unlocks. The URL names
// the plan by its id rather than its public token, so the link that opens a
// plan is never handed to the payment provider.
//
// Every path ends on the customer's own plan, with ?payment= saying what to
// tell them. The webhook covers anything this misses, so "pending" is honest:
// if Moyasar was briefly unreachable here, the webhook still lands.

export async function GET(request: Request) {
  const url = new URL(request.url);
  const prefix = url.searchParams.get("locale") === "ar" ? "/ar" : "";
  const go = (path: string) => Response.redirect(new URL(path, url), 303);
  const planId = url.searchParams.get("plan");
  const paymentId = url.searchParams.get("id");

  if (!checkoutConfig() || !isPlanId(planId)) return go(prefix || "/");

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("proposals").select(PLAN_PAYMENT_COLUMNS).eq("id", planId).maybeSingle();
  const plan = data as PlanRow | null;
  if (!plan || plan.status !== "published") return go(prefix || "/");

  const planPage = (notice: "paid" | "pending" | "failed") => go(`${prefix}/journey/${plan.public_token}?payment=${notice}`);

  if (!isPaymentId(paymentId)) return planPage("failed");
  const fetched = await fetchMoyasarPayment(paymentId);
  if ("error" in fetched) return planPage(fetched.error === "unavailable" ? "pending" : "failed");

  const payment = fetched.payment;
  if (payment.status !== "paid") return planPage("failed");

  try {
    const { result, reason } = await recordPlanPayment(supabase, plan, payment);
    if (result === "rejected" || reason) {
      console.error(`[moyasar callback] payment ${payment.id} for plan ${plan.id}: ${result}${reason ? ` (${reason})` : ""}`);
    }
    // Money was taken even when the check refuses it, so a refusal reads as
    // "we're confirming" and tells them to email, never as "failed".
    return planPage(result === "rejected" ? "pending" : "paid");
  } catch (error) {
    console.error(`[moyasar callback] ${(error as Error).message}`);
    return planPage("pending");
  }
}
