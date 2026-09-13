// A plan must unlock for the payment that pays for it, and for nothing else.
//
// The checks that matter are the ones a working demo never exercises: a paid
// receipt for a different plan of the same price, a payment in the wrong
// currency, a status the redirect claimed but Moyasar never recorded, and a
// live form paired with a test key that could take money it can never verify.
//
//   npx tsx scripts/test-plan-payment.ts

import { readFileSync } from "node:fs";
import {
  checkoutConfig,
  isPaymentId,
  isPlanId,
  parseMethods,
  paymentNoticeFor,
  secretsMatch,
  verifyPlanPayment,
  type MoyasarPayment,
} from "../app/journey/payments";
import { PLAN_CURRENCY, planFee, planFeeForProposal, toHalalas } from "../app/journey/pricing";

const PLAN = "0b6f1c2a-3d4e-4f50-8a1b-2c3d4e5f6a7b";
const OTHER = "9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d";
const pay = (over: Partial<MoyasarPayment> = {}): MoyasarPayment => ({
  id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  status: "paid",
  amount: 7500,
  currency: "SAR",
  metadata: { proposal_id: PLAN, reference: "6219E747" },
  ...over,
});
const ok = (payment: MoyasarPayment, fee = 75) => verifyPlanPayment(payment, { id: PLAN, fee }).ok;

const keys = { MOYASAR_PUBLISHABLE_KEY: "pk_test_abc", MOYASAR_SECRET_KEY: "sk_test_abc" };
const read = (path: string) => readFileSync(path, "utf8");
const unlock = read("app/journey/plan-unlock.tsx");
const page = read("app/journey/journey-page-content.tsx");
const callback = read("app/api/journeys/payment/callback/route.ts");
const webhook = read("app/api/payments/moyasar/webhook/route.ts");

const cases: [string, unknown, unknown][] = [
  // ---- The price is riyals, in halalas at the provider ----
  ["plans are charged in riyals", PLAN_CURRENCY, "SAR"],
  ["SAR 75 is 7500 halalas", toHalalas(75), 7500],
  ["the stored plan costs what the page quotes", planFeeForProposal({ from_date: "2026-10-01", to_date: "2026-10-08", stops: [{}, {}] }), planFee(7, 2)],
  ["no stops is one destination", planFeeForProposal({ from_date: "2026-10-01", to_date: "2026-10-06", stops: null }), 75],
  ["more than three stops is capped at three", planFeeForProposal({ from_date: "2026-10-01", to_date: "2026-10-10", stops: [{}, {}, {}, {}] }), planFee(9, 3)],

  // ---- A payment unlocks its own plan only ----
  ["the right payment unlocks", ok(pay()), true],
  ["an initiated payment does not", ok(pay({ status: "initiated" })), false],
  ["a failed payment does not", ok(pay({ status: "failed" })), false],
  ["a refunded payment does not", ok(pay({ status: "refunded" })), false],
  ["one halala short does not", ok(pay({ amount: 7499 })), false],
  ["the fee in riyals rather than halalas does not", ok(pay({ amount: 75 })), false],
  ["USD does not", ok(pay({ currency: "USD" })), false],
  ["a receipt for another plan of the same price does not", ok(pay({ metadata: { proposal_id: OTHER } })), false],
  ["a payment naming no plan does not", ok(pay({ metadata: null })), false],
  ["a plan with no dates has nothing to pay", ok(pay(), 0), false],

  // ---- Configuration: off until it is safe to be on ----
  ["no keys, no checkout", checkoutConfig({}), null],
  ["a publishable key alone is not enough", checkoutConfig({ MOYASAR_PUBLISHABLE_KEY: "pk_test_abc" }), null],
  ["test keys switch it on", checkoutConfig(keys)?.live, false],
  ["cards are the default method", JSON.stringify(checkoutConfig(keys)?.methods), '["creditcard"]'],
  ["a live form with a test secret is refused", checkoutConfig({ MOYASAR_PUBLISHABLE_KEY: "pk_live_abc", MOYASAR_SECRET_KEY: "sk_test_abc" }), null],
  ["live keys are live", checkoutConfig({ MOYASAR_PUBLISHABLE_KEY: "pk_live_abc", MOYASAR_SECRET_KEY: "sk_live_abc" })?.live, true],
  ["all four methods when listed", JSON.stringify(parseMethods("creditcard, applepay ,stcpay,samsungpay", "svc-1")), '["creditcard","applepay","samsungpay","stcpay"]'],
  ["Samsung Pay needs its service id", JSON.stringify(parseMethods("creditcard,samsungpay", null)), '["creditcard"]'],
  ["unknown methods are dropped", JSON.stringify(parseMethods("creditcard,paypal", null)), '["creditcard"]'],
  ["listing nothing usable switches it off", checkoutConfig({ ...keys, MOYASAR_METHODS: "paypal" }), null],

  // ---- Inputs that reach Moyasar's API or a query ----
  ["a UUID is a payment id", isPaymentId("3fa85f64-5717-4562-b3fc-2c963f66afa6"), true],
  ["a path is not", isPaymentId("../accounts"), false],
  ["a plan id with a quote is refused", isPlanId("1' or '1'='1"), false],

  // ---- The webhook secret ----
  ["the right secret matches", secretsMatch("s3cret-value", "s3cret-value"), true],
  ["a wrong secret does not", secretsMatch("s3cret-valuf", "s3cret-value"), false],
  ["a shorter secret does not", secretsMatch("s3cret", "s3cret-value"), false],
  ["a missing secret does not", secretsMatch(undefined, "s3cret-value"), false],

  // ---- What the customer is told on return never decides anything ----
  ["back from paying, and it unlocked", paymentNoticeFor("paid", false), "paid"],
  ["back claiming paid, still locked, says confirming", paymentNoticeFor("paid", true), "pending"],
  ["a failure on a plan already open says nothing", paymentNoticeFor("failed", false), null],
  ["anything else says nothing", paymentNoticeFor("free", true), null],

  // ---- Wiring ----
  ["the unlock panel no longer takes the budget currency", /currency=\{proposal\.currency/.test(page), false],
  ["the unlock button names riyals", unlock.includes("Unlock the full plan · ${PLAN_CURRENCY} ${fee}"), true],
  ["and in Arabic", unlock.includes("${fee} ريال"), true],
  ["the button stays disabled without a checkout", unlock.includes("checkout ? (") && unlock.includes("disabled"), true],
  ["the page quotes the shared fee", page.includes("planFeeForProposal(proposal)"), true],
  ["the callback fetches the payment back", callback.includes("fetchMoyasarPayment(paymentId)"), true],
  ["the callback ignores the status Moyasar appended", /searchParams\.get\("status"\)/.test(callback), false],
  ["the callback does not put the plan token in the provider's URL", page.includes("callback?plan=${encodeURIComponent(proposal.id)}"), true],
  ["the webhook checks the shared secret", webhook.includes("secretsMatch(body.secret_token, secret)"), true],
  ["the webhook fetches the payment back", webhook.includes("fetchMoyasarPayment(paymentId)"), true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const good = got === want;
  if (good) pass++;
  console.log(`${good ? "PASS" : "FAIL"}  ${name}${good ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);
