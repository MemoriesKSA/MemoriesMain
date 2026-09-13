// Payments for plan unlocks, through Moyasar.
//
// Server-only. The secret key never leaves this module, and nothing here
// trusts the browser: a plan unlocks only after its payment has been fetched
// back from Moyasar with our secret key and matched against what this plan
// costs. The redirect a customer lands on after paying carries a status in
// its query string; that is a claim, not a receipt, and is never read as one.
//
// Inert until configured. With no keys set, the journey page shows the same
// disabled unlock button it always has, so this can sit in production before
// the Moyasar account exists.

import { timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PLAN_CURRENCY, planFeeForProposal, toHalalas } from "./pricing";

const MOYASAR_API = "https://api.moyasar.com/v1";
const KNOWN_METHODS = ["creditcard", "applepay", "samsungpay", "stcpay"] as const;
export type CheckoutMethod = (typeof KNOWN_METHODS)[number];

export type CheckoutConfig = {
  publishableKey: string;
  methods: CheckoutMethod[];
  samsungPayServiceId: string | null;
  live: boolean;
};

/**
 * Which methods to offer. Each wallet has its own switch-on step outside this
 * code: Apple Pay needs the domain registered with Moyasar, STC Pay needs it
 * enabled on the account, Samsung Pay needs a service ID. A method offered
 * before that step is done is a button that fails in the customer's hand, so
 * nothing is offered unless it is listed, and cards are the default.
 */
export function parseMethods(raw: string | undefined, samsungPayServiceId: string | null): CheckoutMethod[] {
  const wanted = (raw?.trim() ? raw : "creditcard").split(",").map((m) => m.trim().toLowerCase());
  return KNOWN_METHODS.filter((m) => wanted.includes(m)).filter((m) => m !== "samsungpay" || !!samsungPayServiceId);
}

export function checkoutConfig(env: Record<string, string | undefined> = process.env): CheckoutConfig | null {
  const publishableKey = env.MOYASAR_PUBLISHABLE_KEY?.trim() ?? "";
  const secretKey = env.MOYASAR_SECRET_KEY?.trim() ?? "";
  if (!publishableKey || !secretKey) return null;
  // A live form with a test secret takes real money that our own check can
  // never fetch back, so the plan would never unlock. Refuse the pair.
  const live = publishableKey.startsWith("pk_live_");
  if (live !== secretKey.startsWith("sk_live_")) return null;
  const samsungPayServiceId = env.SAMSUNG_PAY_SERVICE_ID?.trim() || null;
  const methods = parseMethods(env.MOYASAR_METHODS, samsungPayServiceId);
  if (!methods.length) return null;
  return { publishableKey, methods, samsungPayServiceId, live };
}

export type MoyasarPayment = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string> | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Moyasar payment ids are UUIDs; anything else never reaches their API. */
export const isPaymentId = (id: unknown): id is string => typeof id === "string" && UUID.test(id);
/** A plausible proposal id from a URL or metadata, before it reaches a query. */
export const isPlanId = (id: unknown): id is string => typeof id === "string" && /^[A-Za-z0-9-]{1,64}$/.test(id);

export type FetchResult = { payment: MoyasarPayment } | { error: "not_found" | "unavailable" };

/** A payment as Moyasar holds it, fetched with our secret key. The only source this module believes. */
export async function fetchMoyasarPayment(id: string): Promise<FetchResult> {
  const secretKey = process.env.MOYASAR_SECRET_KEY?.trim();
  if (!secretKey || !isPaymentId(id)) return { error: "not_found" };
  const auth = Buffer.from(secretKey + ":").toString("base64");
  try {
    const response = await fetch(MOYASAR_API + "/payments/" + id, {
      headers: { Authorization: "Basic " + auth },
      cache: "no-store",
    });
    if (response.status === 404) return { error: "not_found" };
    if (!response.ok) return { error: "unavailable" };
    return { payment: (await response.json()) as MoyasarPayment };
  } catch {
    return { error: "unavailable" };
  }
}

export type Verdict = { ok: true } | { ok: false; reason: string };

/**
 * Whether a fetched payment pays for this plan: collected, in riyals, for
 * exactly this plan's fee, and addressed to this plan.
 *
 * The last check is the one easiest to forget. The payment form puts the
 * plan's id in metadata; without comparing it, a receipt for one SAR 45 plan
 * would unlock any other SAR 45 plan it was presented against.
 */
export function verifyPlanPayment(payment: MoyasarPayment, plan: { id: string; fee: number }): Verdict {
  if (payment.status !== "paid") return { ok: false, reason: "status is " + payment.status };
  if (payment.currency !== PLAN_CURRENCY) return { ok: false, reason: "currency is " + payment.currency };
  if (!(plan.fee > 0)) return { ok: false, reason: "this plan has no fee to pay" };
  if (payment.amount !== toHalalas(plan.fee)) return { ok: false, reason: "amount " + payment.amount + " is not " + toHalalas(plan.fee) };
  if (payment.metadata?.proposal_id !== plan.id) return { ok: false, reason: "payment names a different plan" };
  return { ok: true };
}

export const PLAN_PAYMENT_COLUMNS = "id, public_token, status, paid, payment_ref, from_date, to_date, stops" as const;
export type PlanRow = {
  id: string;
  public_token: string;
  status: string;
  paid: boolean | null;
  payment_ref: string | null;
  from_date: string | null;
  to_date: string | null;
  stops: unknown;
};

export type RecordResult = "unlocked" | "already_unlocked" | "rejected";

/**
 * Unlock a plan for a verified payment. Safe to call twice for the same
 * payment, which is the normal case: the customer's redirect and Moyasar's
 * webhook both arrive, in either order.
 *
 * A reason on a non-rejected result is something a person should look at,
 * such as a plan already unlocked by hand that has now also been paid for.
 */
export async function recordPlanPayment(
  supabase: SupabaseClient,
  plan: PlanRow,
  payment: MoyasarPayment,
): Promise<{ result: RecordResult; reason?: string }> {
  const verdict = verifyPlanPayment(payment, { id: plan.id, fee: planFeeForProposal(plan) });
  if (!verdict.ok) return { result: "rejected", reason: verdict.reason };

  if (plan.paid) {
    return plan.payment_ref === payment.id
      ? { result: "already_unlocked" }
      : { result: "already_unlocked", reason: "plan was already unlocked (" + (plan.payment_ref ?? "no reference") + "); check for a double charge" };
  }

  // One payment, one plan. Metadata already ties them; this is the second lock.
  const { data: other } = await supabase.from("proposals").select("id").eq("payment_ref", payment.id).neq("id", plan.id).limit(1);
  if (other?.length) return { result: "rejected", reason: "payment already unlocked another plan" };

  // Claimed with a paid=false guard, so a redirect and a webhook racing each
  // other write once, and the second finds it done.
  const { data: claimed, error } = await supabase
    .from("proposals")
    .update({ paid: true, paid_at: new Date().toISOString(), payment_ref: payment.id, amount: payment.amount })
    .eq("id", plan.id)
    .eq("paid", false)
    .select("id");
  if (error) throw new Error("could not record payment " + payment.id + ": " + error.message);
  return { result: claimed?.length ? "unlocked" : "already_unlocked" };
}

/** Constant-time comparison for the webhook's shared secret. */
export function secretsMatch(given: unknown, expected: string): boolean {
  if (typeof given !== "string" || !expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type PaymentNotice = "paid" | "pending" | "failed";

/**
 * What to tell a customer coming back from the payment form. Only wording:
 * whether the plan is open was already decided from the database.
 */
export function paymentNoticeFor(raw: string | null | undefined, locked: boolean): PaymentNotice | null {
  if (raw === "paid" || raw === "pending") return locked ? "pending" : "paid";
  if (raw === "failed") return locked ? "failed" : null;
  return null;
}
