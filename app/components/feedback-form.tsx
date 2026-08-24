"use client";

import { FormEvent, useState } from "react";
import { MessageSquare } from "lucide-react";

/**
 * One required box and nothing else you have to fill in.
 *
 * A feedback form that demands a name and an email before it will listen
 * collects fewer and politer answers than one that does not, and the people
 * worth hearing from most are usually the ones in a hurry. Name and email are
 * there for anyone who wants a reply, and marked as such.
 */
export function FeedbackForm({ locale = "en", about = "" }: { locale?: "en" | "ar"; about?: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const ar = locale === "ar";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: String(data.get("message") ?? ""),
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          about,
          locale,
          // Which page they were on. Half of all feedback says "this is
          // confusing" without saying what "this" was.
          page: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error);
      setSent(true);
      form.reset();
    } catch {
      setError(ar ? "تعذّر إرسال رسالتك الآن. حاول مرة أخرى بعد قليل." : "We could not send that just now. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div dir={ar ? "rtl" : "ltr"} className="feedbackDone" role="status">
        <div className="mailIcon"><MessageSquare /></div>
        <h3>{ar ? "وصلتنا. شكرًا لك." : "Got it. Thank you."}</h3>
        <p>{ar
          ? "نقرأ كل رسالة بأنفسنا. إذا تركت بريدك وكان هناك ما نرد عليه، سنرد."
          : "We read every one of these ourselves. If you left an email and there's something to answer, we'll answer it."}</p>
        <button type="button" className="feedbackAgain" onClick={() => setSent(false)}>
          {ar ? "أرسل شيئًا آخر" : "Send something else"}
        </button>
      </div>
    );
  }

  return (
    <form dir={ar ? "rtl" : "ltr"} className="feedbackForm" onSubmit={submit}>
      <label htmlFor="feedback-message">{ar ? "ما الذي تود قوله؟" : "What would you like to tell us?"}</label>
      <textarea
        id="feedback-message"
        name="message"
        rows={8}
        required
        maxLength={4000}
        placeholder={ar
          ? "ما الذي أعجبك، وما الذي أزعجك، وما الذي كنت تبحث عنه ولم تجده…"
          : "What worked, what annoyed you, what you came looking for and couldn't find…"}
      />

      <div className="feedbackRow">
        <div>
          <label htmlFor="feedback-name">{ar ? "الاسم" : "Name"} <span className="feedbackOptional">{ar ? "اختياري" : "optional"}</span></label>
          <input id="feedback-name" name="name" type="text" maxLength={200} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="feedback-email">{ar ? "البريد الإلكتروني" : "Email"} <span className="feedbackOptional">{ar ? "إذا أردت ردًا" : "if you want a reply"}</span></label>
          <input id="feedback-email" name="email" type="email" maxLength={254} autoComplete="email" />
        </div>
      </div>

      <button className="button gold" type="submit" disabled={loading}>
        {loading ? (ar ? "جارٍ الإرسال…" : "Sending…") : (ar ? "أرسل" : "Send")}
      </button>
      {error ? <p className="newsletterError" role="alert">{error}</p> : null}
    </form>
  );
}
