"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function JourneyPlanner({ compact = false, locale = "en" }: { compact?: boolean; locale?: "en" | "ar" }) {
  const [sent, setSent] = useState(false);
  const ar = locale === "ar";
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); }
  if (sent) return <div className="plannerSuccess" role="status"><CheckCircle2 /><div><strong>{ar ? "بدأت رحلتك." : "Your journey has begun."}</strong><p>{ar ? "شكرًا لك. سيتواصل معك أحد مصممي الرحلات في ميموريز خلال يوم عمل واحد." : "Thank you. A MEMORIES travel designer will contact you within one business day."}</p></div></div>;
  return <form dir={ar ? "rtl" : "ltr"} className={compact ? "quickPlanner" : "journeyForm"} onSubmit={submit}>
    {compact ? <div><p className="kicker light">{ar ? "ابدأ الخطوة الأولى" : "Plan the first step"}</p><h3>{ar ? "أين ستصنع ذكراك القادمة؟" : "Where will your next memory be?"}</h3></div> : null}
    <label><span>{ar ? "الوجهة" : "Destination"}</span><select name="destination" required defaultValue=""><option value="" disabled>{ar ? "إلى أين ترغب بالسفر؟" : "Where would you like to go?"}</option><option value="alula">{ar ? "العلا" : "AlUla"}</option><option value="maldives">{ar ? "المالديف" : "Maldives"}</option><option value="paris">{ar ? "باريس" : "Paris"}</option><option value="switzerland">{ar ? "سويسرا" : "Switzerland"}</option><option value="istanbul">{ar ? "إسطنبول" : "Istanbul"}</option><option value="surprise">{ar ? "فاجئني" : "Surprise me"}</option></select></label>
    <label><span>{ar ? "المسافرون" : "Travellers"}</span><select name="travellers" required defaultValue=""><option value="" disabled>{ar ? "من سيسافر؟" : "Who is travelling?"}</option><option>{ar ? "فرد" : "Solo"}</option><option>{ar ? "زوجان" : "Couple"}</option><option>{ar ? "عائلة" : "Family"}</option><option>{ar ? "أصدقاء" : "Friends"}</option><option>{ar ? "مجموعة شركات" : "Corporate group"}</option></select></label>
    <label><span>{compact ? (ar ? "موعد السفر" : "When") : (ar ? "الشهر المفضّل" : "Preferred month")}</span><input name="month" type="month" required /></label>
    {!compact ? <><label><span>{ar ? "الاسم الكامل" : "Full name"}</span><input name="name" autoComplete="name" required placeholder={ar ? "اسمك" : "Your name"} /></label><label><span>{ar ? "البريد الإلكتروني" : "Email"}</span><input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label><label><span>{ar ? "الجوال / واتساب" : "Phone / WhatsApp"}</span><input name="phone" type="tel" autoComplete="tel" required placeholder="+966" /></label><label className="full"><span>{ar ? "أخبرنا ما الذي سيجعل هذه الرحلة استثنائية" : "Tell us what would make this journey special"}</span><textarea name="notes" rows={5} placeholder={ar ? "مناسبة خاصة، وتيرة الرحلة، أعمار الأطفال، احتياجات سهولة الوصول…" : "Celebration, preferred pace, children’s ages, accessibility needs…"} /></label></> : null}
    <button className="button gold" type="submit">{compact ? (ar ? "ابدأ التخطيط" : "Start planning") : (ar ? "أرسل طلبي" : "Send my request")} <ArrowRight className="directionArrow" size={16} /></button>
  </form>;
}
