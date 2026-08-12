"use client";

import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";

export function NewsletterForm({ locale = "en" }: { locale?: "en" | "ar" }) {
  const [joined, setJoined] = useState(false);
  const ar = locale === "ar";
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setJoined(true); event.currentTarget.reset(); }
  return <div dir={ar ? "rtl" : "ltr"} className="newsletter"><div className="mailIcon"><Mail /></div><div><h3>{ar ? "كن أول من يعرف" : "Be the first to know"}</h3><p>{ar ? "انضم إلى قائمتنا لتصلك أفكار السفر وعروض الأعضاء المؤسسين." : "Join our list for travel inspiration and founding-member offers."}</p></div>{joined ? <p className="success" role="status">{ar ? "تم تسجيلك. أهلًا بك في ميموريز." : "You're on the list. Welcome to MEMORIES."}</p> : <form onSubmit={submit}><label className="srOnly" htmlFor={`newsletter-email-${locale}`}>{ar ? "البريد الإلكتروني" : "Email address"}</label><input id={`newsletter-email-${locale}`} name="email" type="email" placeholder={ar ? "أدخل بريدك الإلكتروني" : "Enter your email"} required /><button type="submit">{ar ? "انضم للقائمة" : "Join the list"}</button></form>}<div className="trust"><strong>★★★★★</strong><span>{ar ? "خصوصية تامة. بلا رسائل مزعجة. يمكنك إلغاء الاشتراك متى شئت." : "Private. No spam. Unsubscribe anytime."}</span></div></div>;
}
