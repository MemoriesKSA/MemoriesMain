"use client";

import { useState, type CSSProperties, type FormEvent } from "react";

// The one included revision, requested from the plan itself rather than by
// email. Keeping it here means the request arrives attached to the trip, and
// the used/unused state is tracked rather than remembered by whoever reads
// the inbox.
//
// The scope shown is the scope enforced: adjustments to this trip. A
// different city, different dates or a different group is a new plan, and
// saying so here is much easier than arguing about it afterwards.

const card: CSSProperties = {
  background: "var(--paper)",
  border: "1px solid var(--line)",
  borderRadius: 16,
  padding: "22px 26px",
  marginTop: 22,
  display: "grid",
  gap: 12,
};

export function RevisionRequest({ token, locale }: { token: string; locale: "en" | "ar" }) {
  const ar = locale === "ar";
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim() || state === "sending") return;
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/journeys/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, message }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Something went wrong.");
      setState("sent");
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : ar ? "تعذّر إرسال الطلب." : "We couldn't send that request.");
    }
  }

  if (state === "sent") {
    return (
      <div style={{ ...card, borderColor: "var(--gold)" }}>
        <p style={{ margin: 0, fontFamily: ar ? "inherit" : "var(--font-display), Georgia, serif", fontSize: 19, color: "var(--ink)" }}>
          {ar ? "وصلنا طلبك." : "We've got it."}
        </p>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: "var(--ink-2)" }}>
          {ar
            ? "سيراجع فريقنا التعديل ويرسل لك النسخة المحدثة على البريد نفسه."
            : "Our team will make the change and send the updated plan to the same email."}
        </p>
      </div>
    );
  }

  return (
    <div style={card}>
      <p style={{ margin: 0, color: "var(--gold)", fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>
        {ar ? "تعديل مجاني واحد" : "ONE FREE REVISION"}
      </p>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: "var(--ink-2)" }}>
        {ar
          ? "هل تريد تغيير شيء؟ فندقًا مختلفًا، إيقاعًا أهدأ، مطاعم أخرى، أو تعديلًا بسيطًا على التواريخ. تعديل واحد مشمول في هذه الرحلة."
          : "Want something changed? A different hotel, a slower pace, other restaurants, a small shift in dates. One revision to this trip is included."}
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ justifySelf: ar ? "end" : "start", padding: "11px 18px", border: "1px solid var(--line)", borderRadius: 10, background: "transparent", color: "var(--ink)", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}
        >
          {ar ? "اطلب تعديلًا" : "Request a change"}
        </button>
      ) : (
        <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
            placeholder={ar ? "ما الذي تريد تغييره؟" : "What would you like changed?"}
            style={{ width: "100%", padding: 13, border: "1px solid var(--line)", borderRadius: 10, background: "var(--ivory)", color: "var(--ink)", fontSize: 14.5, lineHeight: 1.6, fontFamily: "inherit", resize: "vertical" }}
          />
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "var(--muted)" }}>
            {ar
              ? "التعديل يشمل هذه الرحلة نفسها. الوجهة المختلفة أو التواريخ المختلفة أو مجموعة مسافرين مختلفة تُعد رحلة جديدة."
              : "A revision covers this same trip. A different destination, different dates or a different group is a new plan."}
          </p>
          {error ? <p style={{ margin: 0, fontSize: 13.5, color: "#a8523f" }} role="alert">{error}</p> : null}
          <button
            type="submit"
            disabled={state === "sending" || !message.trim()}
            style={{ justifySelf: ar ? "end" : "start", padding: "12px 20px", border: 0, borderRadius: 10, background: "var(--ink)", color: "var(--gold-light)", fontSize: 14, fontWeight: 800, cursor: state === "sending" ? "wait" : "pointer", opacity: state === "sending" || !message.trim() ? 0.6 : 1 }}
          >
            {state === "sending" ? (ar ? "جارٍ الإرسال…" : "Sending…") : ar ? "أرسل الطلب" : "Send request"}
          </button>
        </form>
      )}
    </div>
  );
}
