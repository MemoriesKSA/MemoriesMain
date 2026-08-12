"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, GraduationCap, Map, Sparkles } from "lucide-react";
import { pathOptions, saudiArabia, studyCountries, travelCountries } from "./planner-data";
import type { CountryOption, PlannerPath } from "./planner-data";

const pathIcons = { journey: Sparkles, saudi: Map, study: GraduationCap } as const;

function text(ar: boolean, en: string, arabic: string) {
  return ar ? arabic : en;
}

export function JourneyPlanner({ compact = false, locale = "en", initialPath = "journey" }: { compact?: boolean; locale?: "en" | "ar"; initialPath?: PlannerPath }) {
  const ar = locale === "ar";
  const [sent, setSent] = useState(false);
  const [path, setPath] = useState<PlannerPath>(initialPath);
  const [country, setCountry] = useState(initialPath === "saudi" ? saudiArabia.value : "");
  const [city, setCity] = useState("");
  const [fromDate, setFromDate] = useState("");
  const successRef = useRef<HTMLDivElement>(null);

  const countries = path === "saudi" ? [saudiArabia] : path === "study" ? studyCountries : travelCountries;
  const selectedCountry: CountryOption | undefined = countries.find((item) => item.value === country);

  function choosePath(next: PlannerPath) {
    setPath(next);
    setCountry(next === "saudi" ? saudiArabia.value : "");
    setCity("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  useEffect(() => {
    if (!sent) return;
    const frame = requestAnimationFrame(() => successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
    return () => cancelAnimationFrame(frame);
  }, [sent]);

  if (sent) return <div ref={successRef} className={`plannerSuccess ${compact ? "plannerCelebration" : ""}`} role="status" aria-live="assertive"><span className="successIcon"><CheckCircle2 /></span><div><span className="successKicker">{text(ar, "Request received", "تم استلام طلبك")}</span><strong>{text(ar, "Your dream journey has begun.", "بدأت رحلة أحلامك.")}</strong><p>{text(ar, "Thank you. A MEMORIES travel designer will contact you within one business day.", "شكرًا لك. سيتواصل معك أحد مصممي الرحلات في ميموريز خلال يوم عمل واحد.")}</p><button className="successReset" type="button" onClick={() => setSent(false)}>{text(ar, "Plan another journey", "خطط لرحلة أخرى")}</button></div></div>;

  return <form dir={ar ? "rtl" : "ltr"} className={`${compact ? "quickPlanner" : "journeyForm"} smartPlanner`} onSubmit={submit}>
    <div className="plannerIntro full">
      <p className={`kicker ${compact ? "light" : ""}`}>{text(ar, "Choose your path", "اختر مسارك")}</p>
      <h3>{text(ar, "Where will your next dream take shape?", "أين سيبدأ حلمك القادم؟")}</h3>
      <p>{text(ar, "Pick a starting point and we’ll show only the details that matter.", "اختر نقطة البداية وسنعرض لك التفاصيل المناسبة فقط.")}</p>
    </div>

    <div className="pathSelector full" role="radiogroup" aria-label={text(ar, "Journey type", "نوع الرحلة")}>
      {pathOptions.map((option) => {
        const Icon = pathIcons[option.path];
        return <button className={path === option.path ? "pathOption selected" : "pathOption"} type="button" role="radio" aria-checked={path === option.path} onClick={() => choosePath(option.path)} key={option.path}><Icon aria-hidden="true" /><span><strong>{ar ? option.ar : option.en}</strong>{!compact ? <small>{ar ? option.descriptionAr : option.descriptionEn}</small> : null}</span></button>;
      })}
      <input type="hidden" name="journeyType" value={path} />
    </div>

    <div className="conditionalFields full" key={path}>
      <label><span>{text(ar, "Country", "الدولة")}</span><select name="country" required value={country} onChange={(event) => { setCountry(event.target.value); setCity(""); }}><option value="" disabled>{text(ar, path === "study" ? "Where would you like to study?" : "Choose a country", path === "study" ? "أين ترغب في الدراسة؟" : "اختر الدولة")}</option>{countries.map((item) => <option value={item.value} key={item.value}>{ar ? item.ar : item.en}</option>)}</select></label>
      <label><span>{text(ar, path === "study" ? "Study city" : "City or destination", path === "study" ? "مدينة الدراسة" : "المدينة أو الوجهة")}</span><select name="city" required value={city} disabled={!selectedCountry} onChange={(event) => setCity(event.target.value)}><option value="" disabled>{text(ar, selectedCountry ? "Choose a city" : "Choose a country first", selectedCountry ? "اختر المدينة" : "اختر الدولة أولًا")}</option>{selectedCountry?.cities.map((item) => <option value={item.value} key={item.value}>{ar ? item.ar : item.en}</option>)}</select></label>

      {path === "journey" ? <label><span>{text(ar, "Journey style", "طابع الرحلة")}</span><select name="purpose" required defaultValue=""><option value="" disabled>{text(ar, "What are you imagining?", "ما نوع الرحلة التي تتخيلها؟")}</option><option>{text(ar, "Leisure escape", "إجازة سياحية")}</option><option>{text(ar, "Family holiday", "إجازة عائلية")}</option><option>{text(ar, "Honeymoon", "شهر عسل")}</option><option>{text(ar, "Adventure", "مغامرة")}</option><option>{text(ar, "Wellness", "استجمام وعافية")}</option><option>{text(ar, "Celebration", "مناسبة خاصة")}</option></select></label> : null}
      {path === "saudi" ? <label><span>{text(ar, "Purpose of visit", "هدف الزيارة")}</span><select name="purpose" required defaultValue=""><option value="" disabled>{text(ar, "What brings you to Saudi Arabia?", "ما هدف زيارتك للسعودية؟")}</option><option>{text(ar, "Leisure & culture", "السياحة والثقافة")}</option><option>{text(ar, "Umrah", "العمرة")}</option><option>{text(ar, "Hajj enquiry", "استفسار عن الحج")}</option><option>{text(ar, "Visiting family or friends", "زيارة العائلة أو الأصدقاء")}</option><option>{text(ar, "Business", "الأعمال")}</option></select></label> : null}
      {path === "study" ? <><label><span>{text(ar, "Study level", "المرحلة الدراسية")}</span><select name="studyLevel" required defaultValue=""><option value="" disabled>{text(ar, "Choose a study level", "اختر المرحلة الدراسية")}</option><option>{text(ar, "Language programme", "برنامج لغة")}</option><option>{text(ar, "Foundation", "سنة تحضيرية")}</option><option>{text(ar, "Bachelor’s degree", "بكالوريوس")}</option><option>{text(ar, "Master’s degree", "ماجستير")}</option><option>{text(ar, "Doctorate", "دكتوراه")}</option><option>{text(ar, "Short course", "دورة قصيرة")}</option></select></label><label><span>{text(ar, "Support needed", "الخدمة المطلوبة")}</span><select name="studySupport" required defaultValue=""><option value="" disabled>{text(ar, "How can we help?", "كيف يمكننا مساعدتك؟")}</option><option>{text(ar, "Study destination guidance", "اختيار وجهة الدراسة")}</option><option>{text(ar, "Visa-application assistance", "المساعدة في طلب التأشيرة")}</option><option>{text(ar, "Accommodation", "السكن")}</option><option>{text(ar, "Flights & airport arrival", "الطيران والاستقبال")}</option><option>{text(ar, "Complete study-abroad support", "دعم متكامل للدراسة في الخارج")}</option></select></label></> : null}

      <label><span>{text(ar, "Travellers", "المسافرون")}</span><select name="travellers" required defaultValue=""><option value="" disabled>{text(ar, "Who is travelling?", "من سيسافر؟")}</option><option>{text(ar, "Solo", "فرد")}</option><option>{text(ar, "Couple", "زوجان")}</option><option>{text(ar, "Family", "عائلة")}</option><option>{text(ar, "Friends", "أصدقاء")}</option><option>{text(ar, "Group", "مجموعة")}</option></select></label>
      <label><span>{text(ar, "From", "من تاريخ")}</span><input name="fromDate" type="date" required value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
      <label><span>{text(ar, "To", "إلى تاريخ")}</span><input name="toDate" type="date" required min={fromDate || undefined} /></label>
      <label className="budgetField"><span>{text(ar, "Total journey budget", "ميزانية الرحلة الكاملة")}</span><div><select name="currency" aria-label={text(ar, "Currency", "العملة")} defaultValue="SAR"><option>SAR</option><option>USD</option><option>EUR</option><option>GBP</option></select><input name="budget" type="number" inputMode="numeric" min="0" step="500" required placeholder={text(ar, "Enter total amount", "أدخل المبلغ الكامل")} /></div><small>{text(ar, "Include flights, hotels, drivers, transfers and experiences.", "تشمل الطيران والفنادق والسائقين والتنقلات والتجارب.")}</small></label>
    </div>

    {!compact ? <div className="contactFields full"><label><span>{text(ar, "Full name", "الاسم الكامل")}</span><input name="name" autoComplete="name" required placeholder={text(ar, "Your name", "اسمك")} /></label><label><span>{text(ar, "Email", "البريد الإلكتروني")}</span><input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label><label><span>{text(ar, "Phone / WhatsApp", "الجوال / واتساب")}</span><input name="phone" type="tel" autoComplete="tel" required placeholder="+966" /></label><label className="full"><span>{text(ar, "What would make this experience feel perfect?", "ما الذي سيجعل هذه التجربة مثالية لك؟")}</span><textarea name="notes" rows={4} placeholder={text(ar, "Tell us about your pace, interests, accessibility needs or anything else we should know…", "شاركنا وتيرة الرحلة واهتماماتك واحتياجات سهولة الوصول أو أي تفاصيل أخرى…")} /></label></div> : null}
    <button className="button gold full" type="submit">{text(ar, compact ? "Start planning your dream" : "Send my dream journey request", compact ? "ابدأ تخطيط حلمك" : "أرسل طلب رحلة أحلامي")} <ArrowRight className="directionArrow" size={16} /></button>
    {path === "study" ? <p className="formNote full">{text(ar, "Visa decisions are made solely by the relevant authorities; MEMORIES provides application assistance, not guaranteed approval.", "تتخذ الجهات المختصة قرارات التأشيرات؛ تقدم ميموريز المساعدة في الطلب ولا تضمن الموافقة.")}</p> : null}
  </form>;
}
