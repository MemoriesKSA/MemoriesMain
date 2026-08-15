"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export function NewsletterForm({ locale = "en" }: { locale?: "en" | "ar" }) {
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const ar = locale === "ar";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const form = event.currentTarget; const data = new FormData(form);
    try { const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: String(data.get("email") ?? ""), locale, consent: data.get("marketingConsent") === "yes" }) }); const result = await response.json() as { error?: string }; if (!response.ok) throw new Error(result.error); setJoined(true); form.reset(); }
    catch { setError(ar ? "تعذر تسجيل البريد الآن. حاول مرة أخرى بعد قليل." : "We could not add your email yet. Please try again shortly."); }
    finally { setLoading(false); }
  }
  return <div dir={ar ? "rtl" : "ltr"} className="newsletter"><div className="mailIcon"><Mail /></div><div><h3>{ar ? "كن أول من يعرف" : "Be the first to know"}</h3><p>{ar ? "انضم إلى قائمتنا لتصلك أفكار السفر وعروض الأعضاء المؤسسين." : "Join our list for travel inspiration and founding-member offers."}</p></div>{joined ? <p className="success" role="status">{ar ? "تم تسجيلك. أهلًا بك في ميموريز." : "You're on the list. Welcome to MEMORIES."}</p> : <form onSubmit={submit}><div className="newsletterField"><label className="srOnly" htmlFor={`newsletter-email-${locale}`}>{ar ? "البريد الإلكتروني" : "Email address"}</label><input id={`newsletter-email-${locale}`} name="email" type="email" placeholder={ar ? "أدخل بريدك الإلكتروني" : "Enter your email"} required /><button type="submit" disabled={loading}>{loading ? (ar ? "جارٍ التسجيل…" : "Joining…") : (ar ? "انضم للقائمة" : "Join the list")}</button></div><label className="newsletterConsent"><input type="checkbox" name="marketingConsent" value="yes" required /><span>{ar ? <>أوافق على تلقي رسائل تسويقية ويمكنني إلغاء الاشتراك في أي وقت. <Link href="/ar/privacy">الخصوصية</Link></> : <>I agree to receive marketing emails and can unsubscribe at any time. <Link href="/privacy">Privacy</Link></>}</span></label>{error ? <p className="newsletterError" role="alert">{error}</p> : null}</form>}<div className="trust"><strong>★★★★★</strong><span>{ar ? "موافقتك اختيارية. بلا رسائل مزعجة. يمكنك إلغاء الاشتراك متى شئت." : "Optional consent. No spam. Unsubscribe anytime."}</span></div></div>;
}
