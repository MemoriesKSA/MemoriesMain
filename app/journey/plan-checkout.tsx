"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PLAN_CURRENCY } from "./pricing";
import type { CheckoutMethod } from "./payments";

// The payment form under a locked plan, served by Moyasar.
//
// Two steps on purpose. The customer first confirms they understand the plan
// unlocks at once and is not refundable on a change of mind: the paid-plans
// spec asks for an explicit acknowledgement at checkout, because a digital
// plan can be screenshotted the moment it opens. Only then is Moyasar's
// script loaded, which also keeps a third-party payment script off the page
// for everyone who is only reading.
//
// Nothing here decides whether a payment counted. The form sends the customer
// to our callback, and the server fetches the payment back from Moyasar.

const FORM_VERSION = "2.2.13";
// Moyasar's own CDN refuses its 2.x files, so the official npm build comes
// from jsDelivr, pinned to one version with integrity hashes: a changed file
// fails to load rather than running on a payment page.
const SCRIPT = {
  src: `https://cdn.jsdelivr.net/npm/moyasar-payment-form@${FORM_VERSION}/dist/moyasar.umd.js`,
  integrity: "sha384-Y2tBFNQliaExNRTblzF0hO2SCffL0s95SfdB29/Ut61UXqyMxn++L3p07nPYJfqe",
};
const STYLES = {
  href: `https://cdn.jsdelivr.net/npm/moyasar-payment-form@${FORM_VERSION}/dist/moyasar.css`,
  integrity: "sha384-wQhPTmY7SL7I4oTDXkW60df9I2prXLtER0XQiIgoYkGMVH9/IF/aC0k9t/CKqm82",
};

declare global {
  interface Window {
    Moyasar?: { init: (options: Record<string, unknown>) => void };
  }
}

let loading: Promise<void> | null = null;

function loadMoyasar(): Promise<void> {
  if (window.Moyasar) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = STYLES.href;
    link.integrity = STYLES.integrity;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = SCRIPT.src;
    script.integrity = SCRIPT.integrity;
    script.crossOrigin = "anonymous";
    script.async = true;
    script.onload = () => (window.Moyasar ? resolve() : reject(new Error("Moyasar did not load")));
    script.onerror = () => {
      loading = null;
      reject(new Error("Moyasar did not load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

const button: CSSProperties = {
  marginTop: 4,
  padding: "13px 22px",
  border: 0,
  borderRadius: 10,
  background: "var(--ink)",
  color: "var(--gold-light)",
  fontSize: 14,
  fontWeight: 800,
};

export function PlanCheckout({
  publishableKey,
  preview,
  live,
  methods,
  samsungPayServiceId,
  amountHalalas,
  planId,
  reference,
  callbackUrl,
  termsHref,
  ctaLabel,
  locale,
}: {
  publishableKey: string;
  preview: boolean;
  live: boolean;
  methods: CheckoutMethod[];
  samsungPayServiceId: string | null;
  amountHalalas: number;
  planId: string;
  reference: string;
  callbackUrl: string;
  termsHref: string;
  ctaLabel: string;
  locale: "en" | "ar";
}) {
  const ar = locale === "ar";
  const [agreed, setAgreed] = useState(false);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const methodKey = methods.join(",");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadMoyasar()
      .then(() => {
        const element = formRef.current;
        if (cancelled || !element || !window.Moyasar) return;
        element.innerHTML = "";
        const offered = methodKey.split(",") as CheckoutMethod[];
        window.Moyasar.init({
          element,
          amount: amountHalalas,
          currency: PLAN_CURRENCY,
          description: `MEMORIES plan ${reference}`,
          publishable_api_key: publishableKey,
          callback_url: callbackUrl,
          methods: offered,
          supported_networks: ["mada", "visa", "mastercard"],
          language: ar ? "ar" : "en",
          metadata: { proposal_id: planId, reference },
          // Preview, before Moyasar is live: the whole form, but Pay stops
          // here. Moyasar calls on_initiating before anything is sent to its
          // API, so a card typed into the preview never leaves the page.
          ...(preview
            ? {
                on_initiating: async () => {
                  setBlocked(true);
                  return false;
                },
              }
            : {}),
          ...(offered.includes("applepay")
            ? { apple_pay: { country: "SA", label: "MEMORIES", validate_merchant_url: "https://api.moyasar.com/v1/applepay/initiate" } }
            : {}),
          ...(offered.includes("samsungpay") && samsungPayServiceId
            ? {
                samsung_pay: {
                  service_id: samsungPayServiceId,
                  order_number: `${reference}-${Date.now()}`,
                  country: "SA",
                  label: "MEMORIES",
                  environment: live ? "PRODUCTION" : "STAGE",
                },
              }
            : {}),
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, ar, amountHalalas, reference, publishableKey, callbackUrl, methodKey, planId, samsungPayServiceId, live, preview]);

  if (failed) {
    return (
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--ink)" }}>
        {ar
          ? "ما قدرنا نفتح صفحة الدفع. حدّث الصفحة وجرّب مرة ثانية، أو راسلنا على "
          : "The payment form didn't load. Refresh the page and try again, or email "}
        <a href="mailto:memoriesksasupport@gmail.com" dir="ltr" style={{ color: "var(--ink)" }}>
          memoriesksasupport@gmail.com
        </a>
        {ar ? "." : "."}
      </p>
    );
  }

  if (open) {
    // Moyasar styles its form for a light page. On the site's dark theme its
    // labels came out dark on dark, so the form gets a light card of its own
    // and renders the way Moyasar designed it, whichever theme the reader has.
    return (
      <div style={{ display: "grid", gap: 10 }}>
        {preview && (
          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: "var(--gold)" }}>
            {ar ? "معاينة: الدفع يفتح قريب، وما راح ينخصم منك شي." : "Preview: payments open soon, and nothing will be charged."}
          </p>
        )}
        <div style={{ background: "#fffdf9", borderRadius: 12, padding: 16, colorScheme: "light", color: "#123c35" }}>
          <div ref={formRef} className="mysr-form" dir={ar ? "rtl" : "ltr"} style={{ minHeight: 120 }} />
        </div>
        {blocked && (
          <p role="status" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "var(--ink)" }}>
            {ar
              ? "الدفع ما فتح إلى الآن، فما انخصم شي وما طلع شي من اللي كتبته من الصفحة. هذا شكل الدفع لما يفتح."
              : "Payments aren't open yet, so nothing was charged and nothing you typed left this page. This is how checkout will look."}
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-2)", cursor: "pointer" }}>
        <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} style={{ marginTop: 5, accentColor: "var(--gold)" }} />
        <span>
          {ar
            ? "فاهم إن الخطة كاملة تنفتح أول ما أدفع، وإن ما فيه استرداد إذا غيّرت رأيي. "
            : "I understand the full plan unlocks the moment I pay, and that it isn't refundable if I change my mind. "}
          <a href={termsHref} style={{ color: "var(--ink)" }}>
            {ar ? "الخطط والدفع والاسترداد" : "Plans, payment & refunds"}
          </a>
        </span>
      </label>
      <button
        type="button"
        disabled={!agreed}
        onClick={() => setOpen(true)}
        style={{ ...button, justifySelf: ar ? "end" : "start", cursor: agreed ? "pointer" : "not-allowed", opacity: agreed ? 1 : 0.6 }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
