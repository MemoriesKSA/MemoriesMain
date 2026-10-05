"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { CheckCircle2 } from "lucide-react";
import { ElasticSelect } from "./form-controls";
import { JourneyPlanner } from "./journey-planner";
import { plannableCountries } from "./planner-data";
import { NIGHT_RATE, PLANS_FREE } from "../journey/pricing";
import { STANDARD_WINDOW_HOURS } from "../follow/release";

// The request form for people who arrive from an ad, and only for them.
//
// 5 Oct 2026: four days of ads sent 487 people to the full five-step form and
// nobody sent it. Of the Saudi visitors who saw it, a third began, half of
// those left at "who and when" (exact dates are required there) and most of
// the rest at the budget. Somebody who tapped an ad in a reel has not decided
// their dates or their budget yet. So this asks only what a plan cannot be
// started without: where, roughly when, who, and where to send it. Everything
// else is sent as our own default and the writer is told so, in the note
// below, so the plan says what was assumed instead of presenting a guess as
// the customer's choice.
//
// The full form stays one tap away, and anything this form cannot ask
// properly (Makkah's eligibility question, a city we do not list) hands over
// to it with the destination already filled in.

type Quick = { city: string; country: string; en: string; ar: string };

// Every one of these is a city the drafting pipeline can ground today, so a
// tap here can never produce a request we cannot write.
const quickDestinations: Quick[] = [
  { city: "riyadh", country: "saudi-arabia", en: "Riyadh", ar: "الرياض" },
  { city: "jeddah", country: "saudi-arabia", en: "Jeddah", ar: "جدة" },
  { city: "alula", country: "saudi-arabia", en: "AlUla", ar: "العلا" },
  { city: "madinah", country: "saudi-arabia", en: "Madinah", ar: "المدينة" },
  { city: "istanbul", country: "turkey", en: "Istanbul", ar: "اسطنبول" },
  { city: "tbilisi", country: "georgia", en: "Tbilisi", ar: "تبليسي" },
  { city: "bangkok", country: "thailand", en: "Bangkok", ar: "بانكوك" },
  { city: "kuala-lumpur", country: "malaysia", en: "Kuala Lumpur", ar: "كوالالمبور" },
  { city: "london", country: "united-kingdom", en: "London", ar: "لندن" },
];

const partyTypes = [
  { value: "solo", en: "Just me", ar: "لحالي", people: 1 },
  { value: "couple", en: "Couple", ar: "زوجين", people: 2 },
  { value: "family", en: "Family", ar: "عائلة", people: 4 },
  { value: "friends", en: "Friends", ar: "أصدقاء", people: 4 },
] as const;

const monthNames = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
};

// Five days, Thursday to Monday: the Saudi weekend with a day either side.
// Nobody chose it, which is why the writer is told it is a placeholder.
const PLACEHOLDER_NIGHTS = 4;

function t(ar: boolean, en: string, arabic: string) { return ar ? arabic : en; }

function isoDate(date: Date) {
  // Local parts on purpose: toISOString is UTC and would name yesterday for
  // anyone east of Greenwich in the small hours.
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function thursdayOnOrAfter(date: Date) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + ((4 - next.getDay() + 7) % 7));
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

/** The four months offered. This month only while enough of it is left to travel in. */
function monthChoices(now: Date) {
  const first = now.getDate() <= 20 ? 0 : 1;
  return Array.from({ length: 4 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() + first + index, 1);
    return { key: `${month.getFullYear()}-${month.getMonth()}`, year: month.getFullYear(), month: month.getMonth() };
  });
}

/** Placeholder dates for "November" or "not sure yet": a mid-month long weekend, never sooner than a week away. */
function placeholderDates(when: string, now: Date) {
  const soonest = addDays(now, 7);
  let start: Date;
  if (when === "unsure") {
    start = thursdayOnOrAfter(addDays(now, 35));
  } else {
    const [year, month] = when.split("-").map(Number);
    start = thursdayOnOrAfter(new Date(year, month, 12));
    if (start < soonest) start = thursdayOnOrAfter(soonest);
  }
  return { fromDate: isoDate(start), toDate: isoDate(addDays(start, PLACEHOLDER_NIGHTS)) };
}

/**
 * A Saudi mobile however it was typed (05…, 5…, +9665…, Arabic digits), or
 * any other number given with its country code. Null when it is neither,
 * because a number we cannot message is a plan nobody receives.
 */
function parsePhone(raw: string): { phoneCode: string; phone: string } | null {
  const ascii = raw.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
  const international = /^\s*(\+|00)/.test(ascii);
  const digits = ascii.replace(/\D/g, "").replace(/^00/, "");
  // "+966 05…" is typed often enough that the stray zero is forgiven.
  const saudi = digits.match(/^(?:966)?0?(5\d{8})$/);
  if (saudi) return { phoneCode: "+966", phone: saudi[1] };
  return international && digits.length >= 8 && digits.length <= 15 ? { phoneCode: "+", phone: digits } : null;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ShortPlanner({ locale = "en", source = "", today }: { locale?: "en" | "ar"; source?: string; today: string }) {
  const ar = locale === "ar";
  const [full, setFull] = useState(false);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [elsewhere, setElsewhere] = useState(false);
  const [when, setWhen] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [party, setParty] = useState("");
  const [people, setPeople] = useState(2);
  const [peopleTouched, setPeopleTouched] = useState(false);
  const [channel, setChannel] = useState<"whatsapp" | "email">("whatsapp");
  const [contact, setContact] = useState("");
  const [problem, setProblem] = useState<"" | "where" | "when" | "who" | "contact" | "send">("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [reference, setReference] = useState("");
  // The month buttons come from the date the page was served on (Riyadh
  // time, passed in), not from the phone's clock, so the server and the
  // browser always draw the same four and nothing shifts after loading.
  const [months] = useState(() => monthChoices(new Date(`${today}T12:00:00`)));
  const submissionId = useRef("");
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  // Counted like the full form's steps, with an "s_" in front so the two
  // forms can be told apart: the counter carries a step and a source only.
  const marked = useRef(new Set<string>());
  function mark(step: string) {
    if (marked.current.has(step)) return;
    marked.current.add(step);
    track("plan_form", { step: `s_${step}`, source: !source ? "none" : /^[a-z0-9-]{1,40}$/i.test(source) ? source : "other" });
  }

  useEffect(() => {
    submissionId.current = crypto.randomUUID();
    const form = formRef.current;
    if (!form || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      mark("seen");
      observer.disconnect();
    }, { threshold: 0.2 });
    observer.observe(form);
    return () => observer.disconnect();
    // Once per mount: `mark` only reads refs and the source tag, which never change.
  }, []);

  // The confirmation is far shorter than the form it replaces, so without
  // this the visitor is left looking at whatever slid up underneath it.
  useEffect(() => {
    if (status !== "sent") return;
    const frame = requestAnimationFrame(() => doneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
    return () => cancelAnimationFrame(frame);
  }, [status]);

  function openFullForm() {
    mark("full");
    setFull(true);
  }

  if (full) return <JourneyPlanner locale={locale} initialPath={country === "saudi-arabia" ? "saudi" : "journey"} initialCountry={country} initialCity={city} source={source} />;

  const selectedCountry = plannableCountries.find((item) => item.value === country);
  const cityLabel = quickDestinations.find((item) => item.city === city && item.country === country)?.[ar ? "ar" : "en"]
    ?? selectedCountry?.cities.find((item) => item.value === city)?.[ar ? "ar" : "en"] ?? "";
  const hours = `${STANDARD_WINDOW_HOURS.min} ${t(ar, "to", "إلى")} ${STANDARD_WINDOW_HOURS.max}`;

  function pickQuick(item: Quick) {
    mark("where");
    setElsewhere(false); setCountry(item.country); setCity(item.city);
    if (problem === "where") setProblem("");
  }

  function pickCity(slug: string) {
    setCity(slug);
    // Makkah needs the eligibility question and an unlisted city needs its
    // name typed in; the full form asks both, so it takes over from here.
    if (slug === "makkah" || slug.startsWith("other-")) openFullForm();
    else if (problem === "where") setProblem("");
  }

  function pickParty(value: string, usual: number) {
    mark("who");
    setParty(value);
    if (!peopleTouched) setPeople(usual);
    if (problem === "who") setProblem("");
  }

  function fail(which: "where" | "when" | "who" | "contact") {
    mark(`blocked_${which}`);
    setProblem(which);
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[data-q="${which}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const honeypot = String(new FormData(event.currentTarget).get("website") ?? "");
    if (!country || !city) return fail("where");
    const today = isoDate(new Date());
    if (!when || (when === "exact" && (!fromDate || !toDate || toDate < fromDate || fromDate < today))) return fail("when");
    if (!party) return fail("who");
    const phone = channel === "whatsapp" ? parsePhone(contact) : null;
    const email = channel === "email" ? contact.trim().toLowerCase() : "";
    if (channel === "whatsapp" ? !phone : !emailPattern.test(email)) return fail("contact");

    const dates = when === "exact" ? { fromDate, toDate } : placeholderDates(when, new Date());
    const [year, month] = when.split("-").map(Number);
    const whenSaid = when === "exact" ? "exact dates, which are theirs"
      : when === "unsure" ? "that they have not decided when"
      : `"${monthNames.en[month]} ${year}" and no exact dates`;
    // Read by the drafting pass as the package note. In English because that
    // pass works in English, and labelled as ours so it is never mistaken for
    // the traveller's own words.
    const packageNotes = [
      "INTERNAL NOTE FROM MEMORIES, not written by the traveller.",
      `This is a SHORT REQUEST from the three-question form shown to ad visitors. The traveller told us only: the destination, roughly when (${whenSaid}), who is travelling, and how to reach them.`,
      `Everything else in this request is our default and not their choice: ${when === "exact" ? "" : `the dates (a placeholder ${PLACEHOLDER_NIGHTS + 1}-day window), `}the hotel, the transport, what the plan includes, and the open budget.`,
      "They were not asked for a name or a departure city, so do not address them by name and do not price flights.",
      "Write a typical mid-range plan for this party and say plainly near the top what was assumed (dates and trip length, hotel level, budget, flights left out), so they can tell us what to change.",
    ].join(" ");

    mark("submit");
    setProblem(""); setStatus("sending");
    try {
      const response = await fetch("/api/journeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submissionId.current, locale, website: honeypot, source,
          journeyType: country === "saudi-arabia" ? "saudi" : "journey", country, city,
          // "family" means a family holiday on the journey path but "visiting
          // family" on the Saudi one, so the Saudi path stays on leisure.
          purpose: party === "family" && country !== "saudi-arabia" ? "family" : "leisure",
          travellers: party, travellerCount: String(people), ...dates,
          transport: ["airport", "public"], stays: ["hotel"], stayRating: "flexible", flightTiming: "flexible",
          planIncludes: party === "family" ? ["attractions", "restaurants", "experiences", "family"] : ["attractions", "restaurants", "experiences"],
          packageNotes, currency: "SAR", budgetMode: "open", budget: "",
          delivery: [channel], name: t(ar, "there", "ضيفنا الكريم"), email, phoneCode: phone?.phoneCode ?? "", phone: phone?.phone ?? "",
          planLanguages: "both", priority: "no",
          // The line under the button says that sending is agreeing, and the
          // privacy notice says the same of every request.
          privacyAccepted: "yes",
        }),
      });
      const result = await response.json() as { error?: string; reference?: string };
      if (!response.ok) throw new Error(result.error || "Request failed");
      mark("sent");
      setReference(result.reference ?? "");
      setStatus("sent");
    } catch {
      mark("send_failed");
      submissionId.current = crypto.randomUUID();
      setStatus("idle");
      setProblem("send");
    }
  }

  if (status === "sent") return <div className="shortPlannerWrap"><div ref={doneRef} className="shortPlanner shortPlannerDone" role="status" aria-live="assertive">
    <span className="successIcon"><CheckCircle2 /></span>
    <strong>{t(ar, "We have your request.", "وصلنا طلبك.")}</strong>
    <p>{channel === "whatsapp"
      ? t(ar, `Your ${cityLabel} plan is being written now. We will send you its link on WhatsApp within ${hours} hours.`, `خطة ${cityLabel} تنكتب الآن. نرسل لك رابطها على واتساب خلال ${hours} ساعات.`)
      : t(ar, `Your ${cityLabel} plan is being written now. It will reach your inbox within ${hours} hours, and a confirmation is on its way to you now.`, `خطة ${cityLabel} تنكتب الآن. توصل إيميلك خلال ${hours} ساعات، ووصلك الآن إيميل تأكيد.`)}</p>
    {reference ? <small>{t(ar, "Request number", "رقم الطلب")}: <bdi>{reference}</bdi></small> : null}
  </div></div>;

  const problemText = problem === "where" ? t(ar, "Choose where you want to go.", "اختر وين ودك تروح.")
    : problem === "when" ? (when === "exact" ? t(ar, "Choose both dates, starting from today or later.", "اختر التاريخين، من اليوم وطالع.") : t(ar, "Choose roughly when.", "اختر متى تقريبًا."))
    : problem === "who" ? t(ar, "Choose who is travelling.", "اختر مين مسافر.")
    : problem === "contact" ? (channel === "whatsapp" ? t(ar, "Write a mobile number we can message, like 05X XXX XXXX.", "اكتب رقم جوال نقدر نراسلك عليه، مثل 05X XXX XXXX.") : t(ar, "Write an email address we can send the plan to.", "اكتب إيميل نقدر نرسل عليه الخطة."))
    : problem === "send" ? t(ar, "We couldn't send your request yet. Please try again in a moment.", "ما قدرنا نرسل طلبك الآن. جرّب مرة ثانية بعد شوي.")
    : "";
  const chip = (on: boolean, ghost = false) => `shortChip${on ? " on" : ""}${ghost ? " ghost" : ""}`;
  const question = (which: string) => `shortQuestion${problem === which ? " hasError" : ""}`;

  return <div className="shortPlannerWrap">
    <form ref={formRef} className="shortPlanner" onSubmit={submit} noValidate>
      <input className="srOnly" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true" />
      <p className="shortKicker">{t(ar, "Three questions, that's all", "ثلاث أسئلة وبس")}</p>

      <fieldset className={question("where")} data-q="where">
        <legend><span>1</span>{t(ar, "Where do you want to go?", "وين ودك تروح؟")}</legend>
        <div className="shortChips">
          {quickDestinations.map((item) => <button type="button" key={item.city} className={chip(!elsewhere && city === item.city && country === item.country)} aria-pressed={!elsewhere && city === item.city && country === item.country} onClick={() => pickQuick(item)}>{ar ? item.ar : item.en}</button>)}
          <button type="button" className={chip(elsewhere, true)} aria-pressed={elsewhere} onClick={() => { mark("where"); setElsewhere(true); setCountry(""); setCity(""); }}>{t(ar, "Somewhere else +", "مكان ثاني +")}</button>
        </div>
        {elsewhere ? <div className="shortElsewhere">
          <ElasticSelect label={t(ar, "Country", "الدولة")} name="shortCountry" searchable options={plannableCountries.map((item) => ({ value: item.value, label: ar ? item.ar : item.en, aliases: `${ar ? item.en : item.ar} ${item.aliases ?? ""}` }))} value={country} onChange={(value) => { setCountry(value); setCity(""); }} placeholder={t(ar, "Choose a country", "اختر الدولة")} searchPlaceholder={t(ar, "Search…", "ابحث…")} />
          <ElasticSelect label={t(ar, "City", "المدينة")} name="shortCity" searchable disabled={!selectedCountry} options={(selectedCountry?.cities ?? []).map((item) => ({ value: item.value, label: ar ? item.ar : item.en, aliases: `${ar ? item.en : item.ar} ${item.aliases ?? ""}` }))} value={city} onChange={pickCity} placeholder={t(ar, "Choose a city", "اختر المدينة")} searchPlaceholder={t(ar, "Search…", "ابحث…")} />
        </div> : null}
      </fieldset>

      <fieldset className={question("when")} data-q="when">
        <legend><span>2</span>{t(ar, "Roughly when?", "متى تقريبًا؟")}</legend>
        <div className="shortChips">
          {months.map((item) => <button type="button" key={item.key} className={chip(when === item.key)} aria-pressed={when === item.key} onClick={() => { mark("when"); setWhen(item.key); if (problem === "when") setProblem(""); }}>{monthNames[ar ? "ar" : "en"][item.month]}</button>)}
          <button type="button" className={chip(when === "unsure")} aria-pressed={when === "unsure"} onClick={() => { mark("when"); setWhen("unsure"); if (problem === "when") setProblem(""); }}>{t(ar, "Not sure yet", "ما حددت")}</button>
          <button type="button" className={chip(when === "exact", true)} aria-pressed={when === "exact"} onClick={() => { mark("when"); setWhen("exact"); }}>{t(ar, "Exact dates", "تواريخ محددة")}</button>
        </div>
        {when === "exact" ? <div className="shortDates">
          <label><span>{t(ar, "From", "من تاريخ")}</span><input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
          <label><span>{t(ar, "To", "إلى تاريخ")}</span><input type="date" min={fromDate || undefined} value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
        </div> : null}
      </fieldset>

      <fieldset className={question("who")} data-q="who">
        <legend><span>3</span>{t(ar, "Who is travelling?", "مين مسافر؟")}</legend>
        <div className="shortChips">
          {partyTypes.map((item) => <button type="button" key={item.value} className={chip(party === item.value)} aria-pressed={party === item.value} onClick={() => pickParty(item.value, item.people)}>{ar ? item.ar : item.en}</button>)}
        </div>
        <div className="shortStepper">
          <span>{t(ar, "How many people?", "كم شخص؟")}</span>
          <div>
            <button type="button" aria-label={t(ar, "One fewer", "تنقيص شخص")} disabled={people <= 1} onClick={() => { mark("who"); setPeopleTouched(true); setPeople(Math.max(1, people - 1)); }}>−</button>
            <output aria-live="polite">{people}</output>
            <button type="button" aria-label={t(ar, "One more", "زيادة شخص")} disabled={people >= 12} onClick={() => { mark("who"); setPeopleTouched(true); setPeople(Math.min(12, people + 1)); }}>+</button>
          </div>
        </div>
      </fieldset>

      {/* A rule of its own: a border on a fieldset is broken by its legend. */}
      <div className="shortRule" aria-hidden="true" />
      <fieldset className={`${question("contact")} shortContact`} data-q="contact">
        <legend>{t(ar, "Where do we send your plan?", "وين نرسل لك الخطة؟")}</legend>
        <div className="shortSegment" role="group">
          <button type="button" className={channel === "whatsapp" ? "on" : ""} aria-pressed={channel === "whatsapp"} onClick={() => { setChannel("whatsapp"); setContact(""); if (problem === "contact") setProblem(""); }}>{t(ar, "WhatsApp", "واتساب")}</button>
          <button type="button" className={channel === "email" ? "on" : ""} aria-pressed={channel === "email"} onClick={() => { setChannel("email"); setContact(""); if (problem === "contact") setProblem(""); }}>{t(ar, "Email", "إيميل")}</button>
        </div>
        {channel === "whatsapp"
          ? <input key="phone" dir="ltr" type="tel" inputMode="tel" autoComplete="tel" aria-label={t(ar, "Mobile number for WhatsApp", "رقم الجوال للواتساب")} placeholder="05X XXX XXXX" value={contact} onFocus={() => mark("contact")} onChange={(event) => { setContact(event.target.value); if (problem === "contact") setProblem(""); }} />
          : <input key="email" dir="ltr" type="email" inputMode="email" autoComplete="email" aria-label={t(ar, "Email address", "الإيميل")} placeholder="you@example.com" value={contact} onFocus={() => mark("contact")} onChange={(event) => { setContact(event.target.value); if (problem === "contact") setProblem(""); }} />}
      </fieldset>

      {problemText ? <p className="shortProblem" role="alert">{problemText}</p> : null}
      <button className="button gold shortSubmit" type="submit" disabled={status === "sending"}>
        {status === "sending" ? t(ar, "Sending your request…", "نرسل طلبك…") : PLANS_FREE ? t(ar, "Send me my free plan", "أرسلوا لي خطتي المجانية") : t(ar, "Send me my plan", "أرسلوا لي خطتي")}
      </button>
      <p className="shortPromise">{t(ar, `It reaches you within ${hours} hours`, `توصلك خلال ${hours} ساعات`)}{PLANS_FREE ? t(ar, " · nothing to pay", " · بدون دفع") : t(ar, ` · SAR ${NIGHT_RATE} a night`, ` · ${NIGHT_RATE} ريال لليلة`)}</p>
      <p className="shortLegal">{ar
        ? <>بالإرسال أنت موافق على <a href="/ar/privacy" target="_blank" rel="noopener noreferrer">سياسة الخصوصية</a> و<a href="/ar/terms" target="_blank" rel="noopener noreferrer">الشروط</a></>
        : <>By sending you agree to the <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms</a></>}</p>
    </form>
    <p className="shortFullLink">{t(ar, "Want to set the budget, hotel and flights?", "تبغى تحدد الميزانية والفندق والطيران؟")} <button type="button" onClick={openFullForm}>{t(ar, "The full form", "النموذج الكامل")}</button></p>
  </div>;
}
