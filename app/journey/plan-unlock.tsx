import type { CSSProperties } from "react";

// The unlock panel an unpaid reader sees under their plan. Deliberately calm
// rather than pushy: they can already read the whole overview and a full day
// of their own trip, so the job here is to state plainly what the rest costs
// and what it covers, not to manufacture pressure.
//
// No countdown, no artificial scarcity. The plan is built for their dates and
// ages out on its own; inventing urgency on a product whose entire value is
// honesty would undercut everything else.

// Every locked day links here. A reader who taps a day they cannot read is
// asking one question, and this panel is the answer to it, so the tap should
// take them to it rather than leaving them to scroll and find it.
export const UNLOCK_ANCHOR = "unlock-plan";

const panel: CSSProperties = {
  // The page already scrolls smoothly (html{scroll-behavior:smooth} in
  // globals.css); this is just so the panel does not land flush against the
  // top edge when it is jumped to.
  scrollMarginTop: 24,
  background: "var(--paper)",
  border: "1px solid var(--gold)",
  borderRadius: 16,
  boxShadow: "var(--shadow)",
  padding: "26px 28px",
  marginTop: 22,
  display: "grid",
  gap: 12,
};

export function PlanUnlock({
  fee,
  currency,
  lockedCount,
  stopCount,
  locale,
}: {
  fee: number;
  currency: string;
  lockedCount: number;
  stopCount: number;
  locale: "en" | "ar";
}) {
  const ar = locale === "ar";

  const heading = ar
    ? `تبقّى ${lockedCount} ${lockedCount === 1 ? "يوم" : "أيام"} من خطتك`
    : `${lockedCount} more ${lockedCount === 1 ? "day" : "days"} of your trip`;

  const body = ar
    ? `لقد قرأت خطتك كاملة من حيث الإقامة والتنقل، ويومًا كاملًا من كل وجهة. باقي الأيام جاهزة بالتفصيل نفسه: الأماكن والمطاعم والأسعار التقريبية ومتى تحجز كل شيء.`
    : `You've read the full overview and a complete day of every stop. The remaining days are ready in the same detail: the places, the meals, what things cost, and when to book each one.`;

  const cta = ar ? `افتح الخطة كاملة · ${fee} ${currency}` : `Unlock the full plan · ${currency} ${fee}`;

  const terms = ar
    ? `دفعة واحدة لهذه الرحلة (${stopCount} ${stopCount === 1 ? "وجهة" : "وجهات"}). تشمل تعديلًا مجانيًا واحدًا على الرحلة نفسها.`
    : `One payment for this trip (${stopCount} ${stopCount === 1 ? "destination" : "destinations"}). Includes one free revision to this same trip.`;

  return (
    <div id={UNLOCK_ANCHOR} style={panel}>
      <p style={{ margin: 0, color: "var(--gold)", fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>
        {ar ? "الخطة الكاملة" : "THE FULL PLAN"}
      </p>
      <p style={{ margin: 0, fontFamily: ar ? "inherit" : "var(--font-display), Georgia, serif", fontSize: 22, color: "var(--ink)", lineHeight: 1.35 }}>
        {heading}
      </p>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: "var(--ink-2)" }}>{body}</p>

      {/* Checkout is not wired yet: this is deliberately a disabled control
          rather than a link to nowhere, so nobody can start a payment that
          cannot complete. Swap in the provider's checkout when it exists. */}
      <button
        type="button"
        disabled
        style={{
          justifySelf: ar ? "end" : "start",
          marginTop: 4,
          padding: "13px 22px",
          border: 0,
          borderRadius: 10,
          background: "var(--ink)",
          color: "var(--gold-light)",
          fontSize: 14,
          fontWeight: 800,
          cursor: "not-allowed",
          opacity: 0.75,
        }}
      >
        {cta}
      </button>

      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "var(--muted)" }}>{terms}</p>
    </div>
  );
}
