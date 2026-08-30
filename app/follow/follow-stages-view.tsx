import Link from "next/link";
import { Check, Loader, Mail } from "lucide-react";
import { followStages, expectedDelivery, progress, type StageKey, type FollowInput } from "./stages";
import { deliveryPromise } from "./release";

// What a customer sees while they wait.
//
// Presentation only, so it can be rendered from a database row or from made-up
// timestamps in the dev preview. Every stage is a real step the pipeline takes,
// and the last one flips on sent_at and nothing else, so this cannot tell
// somebody their plan has gone before it has.

const COPY: Record<StageKey, { en: string; ar: string; note: { en: string; ar: string } }> = {
  received: {
    en: "Request received", ar: "وصلنا طلبك",
    note: { en: "Everything you told us is with the team.", ar: "كل تفصيلة ذكرتها صارت بين يدي الفريق." },
  },
  researching: {
    en: "Researching your destination", ar: "نستكشف وجهتك",
    note: { en: "Hotels, restaurants, opening hours, and what is actually worth your time.", ar: "الفنادق والمطاعم وأوقات الزيارة، وكل ما يستحق وقتك فعلًا." },
  },
  writing: {
    en: "Writing your plan", ar: "نكتب خطة أحلامك",
    note: { en: "The longest part, and the one worth waiting for.", ar: "أطول مرحلة، وهي التي تستحق الانتظار فعلًا." },
  },
  arabic: {
    en: "Preparing the Arabic version", ar: "نجهّز نسختك العربية",
    note: { en: "Every plan is written in both languages rather than machine-translated.", ar: "كل خطة تُكتب باللغتين من جديد، لا تُترجم آليًا." },
  },
  checking: {
    en: "Checking every fact", ar: "نتأكد من كل تفصيلة",
    note: { en: "Prices, hours and distances are read back against their sources.", ar: "الأسعار والأوقات والمسافات، نراجعها على مصادرها واحدة واحدة." },
  },
  final: {
    en: "Final checks", ar: "اللمسة الأخيرة",
    note: { en: "Your plan is complete and in the queue to be sent.", ar: "خطتك جاهزة، وما بقي إلا أن تصلك." },
  },
  sent: {
    en: "Sent to you", ar: "وصلتك خطتك",
    note: { en: "Check your inbox. The link inside opens your plan.", ar: "افتح بريدك، والرابط الذي فيه يفتح لك خطتك." },
  },
};

function clock(d: Date, ar: boolean) {
  return new Intl.DateTimeFormat(ar ? "ar-SA" : "en-GB", { hour: "2-digit", minute: "2-digit", hour12: !ar }).format(d);
}

export function FollowStages({
  input, city, dates, priority, needsReview, englishOnly = false, locale = "en",
}: {
  input: FollowInput;
  city: string;
  dates: string;
  priority: boolean;
  needsReview: boolean;
  englishOnly?: boolean;
  locale?: "en" | "ar";
}) {
  const ar = locale === "ar";
  const stages = followStages(input);
  const due = expectedDelivery(input);
  const pct = Math.round(progress(input) * 100);
  const sent = Boolean(input.sentAt);

  return (
    <main className="innerPage followPage" dir={ar ? "rtl" : "ltr"}>
      <section className="container followWrap">
        <p className="kicker">{ar ? "رحلتك تتشكّل" : "Following your request"}</p>
        <h1>
          {sent
            ? (ar ? <>خطتك بين يديك.</> : <>Your plan is in your inbox.</>)
            : (ar ? <>نعمل على خطة أحلامك.</> : <>We&apos;re working on your plan.</>)}
        </h1>
        <p className="followTrip">{city}{dates ? ` · ${dates}` : ""}</p>

        {!sent && (
          <div className="followPromise">
            <Mail aria-hidden="true" />
            <div>
              <strong>{priority ? (ar ? "أولوية لك" : "Priority") : (ar ? "تصلك خلال" : "Expected delivery")}</strong>
              <span>
                {deliveryPromise(priority, ar)}
                {priority && due ? ` · ${ar ? "بحلول" : "by"} ${clock(due, ar)}` : ""}
              </span>
            </div>
          </div>
        )}

        <div className="followBar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
             aria-label={ar ? "تقدم طلبك" : "Progress of your request"}>
          <div className="followBarFill" style={{ width: `${pct}%` }} />
        </div>

        <ol className="followStages">
          {stages
            // A customer who asked for English only never sees a stage
            // promising them an Arabic version they did not order.
            .filter((stage) => !(stage.key === "arabic" && englishOnly))
            .map((stage) => {
            const copy = COPY[stage.key];
            // The only wording that changes with circumstance: when the
            // self-check flagged something, a person genuinely is reading it.
            const note = stage.key === "final" && needsReview && !sent
              ? (ar
                  ? "لاحظنا نقطة تستحق عين إنسان، وهذا ما يجري الآن."
                  : "Our checks flagged something worth a human eye, which is what is happening now.")
              : (ar ? copy.note.ar : copy.note.en);
            return (
              <li key={stage.key} className={`followStage ${stage.state}`}>
                <span className="followMark" aria-hidden="true">
                  {stage.state === "done" ? <Check size={14} /> : stage.state === "active" ? <Loader size={14} /> : null}
                </span>
                <div>
                  <strong>{ar ? copy.ar : copy.en}</strong>
                  <span>{note}</span>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="followFoot">
          {ar
            ? "لا داعي لإبقاء هذه الصفحة مفتوحة، فسنراسلك على بريدك أول ما تجهز."
            : "No need to keep this page open. We'll email you the moment it's ready."}
          {" "}
          <Link href={ar ? "/ar/feedback" : "/feedback"}>{ar ? "قل لنا رأيك" : "Tell us what you think"}</Link>
        </p>
      </section>
    </main>
  );
}
