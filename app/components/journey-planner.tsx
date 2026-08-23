"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, GraduationCap, Luggage, Map, MapPin, Plane, Sparkles } from "lucide-react";
import { ElasticSelect, MultiChoice } from "./form-controls";
import type { SelectChoice } from "./form-controls";
import { deepDataCountries, pathOptions, saudiArabia, studyCountries, travelCountries } from "./planner-data";
import type { CountryOption, LocalizedOption, PlannerPath } from "./planner-data";
import { planFee, NIGHT_RATE, EXTRA_STOP_FEE } from "../journey/pricing";

const pathIcons = { journey: Sparkles, saudi: Map, study: GraduationCap } as const;
type LocalChoice = { value: string; en: string; ar: string; detailEn?: string; detailAr?: string };

const journeyStyles: LocalChoice[] = [
  { value: "leisure", en: "Leisure escape", ar: "إجازة سياحية" }, { value: "family", en: "Family holiday", ar: "إجازة عائلية" },
  { value: "honeymoon", en: "Honeymoon", ar: "شهر عسل" }, { value: "adventure", en: "Adventure", ar: "مغامرة" },
  { value: "wellness", en: "Wellness", ar: "استجمام وعافية" }, { value: "celebration", en: "Celebration", ar: "مناسبة خاصة" },
  { value: "business-leisure", en: "Business & leisure", ar: "أعمال وسياحة" }, { value: "other-style", en: "Something else", ar: "شيء آخر" },
];
const saudiPurposes: LocalChoice[] = [
  { value: "leisure", en: "Leisure & culture", ar: "السياحة والثقافة" }, { value: "umrah", en: "Umrah", ar: "العمرة" },
  { value: "hajj", en: "Hajj", ar: "الحج" }, { value: "family", en: "Visiting family or friends", ar: "زيارة العائلة أو الأصدقاء" },
  { value: "business", en: "Business", ar: "الأعمال" }, { value: "events", en: "Events & entertainment", ar: "الفعاليات والترفيه" },
];
const travellerTypes: LocalChoice[] = [
  { value: "solo", en: "Solo traveller", ar: "فرد" }, { value: "couple", en: "Couple", ar: "زوجان" }, { value: "family", en: "Family", ar: "عائلة" },
  { value: "friends", en: "Friends", ar: "أصدقاء" }, { value: "group", en: "Group", ar: "مجموعة" }, { value: "students", en: "Students", ar: "طلاب" },
];
const transportChoices: LocalChoice[] = [
  { value: "flights", en: "Plane tickets", ar: "تذاكر الطيران", detailEn: "Compare suitable routes and fares", detailAr: "مقارنة المسارات والأسعار المناسبة" },
  { value: "airport", en: "Airport transfers", ar: "توصيل المطار", detailEn: "A smooth welcome and departure", detailAr: "استقبال ومغادرة مريحة" },
  { value: "driver", en: "Private driver", ar: "سائق خاص", detailEn: "Flexible door-to-door travel", detailAr: "تنقل مرن من الباب إلى الباب" },
  { value: "public", en: "Public transport plan", ar: "خطة النقل العام", detailEn: "Routes, passes and practical guidance", detailAr: "المسارات والتذاكر والإرشادات" },
  { value: "rental", en: "Rental car", ar: "سيارة مستأجرة", detailEn: "Vehicle and pickup planning", detailAr: "اختيار السيارة وترتيب الاستلام" },
  { value: "none-transport", en: "No transport needed", ar: "لا أحتاج خدمات نقل" },
];
const stayChoices: LocalChoice[] = [
  { value: "hotel", en: "Hotel", ar: "فندق" }, { value: "resort", en: "Resort", ar: "منتجع" }, { value: "apartment", en: "Serviced apartment", ar: "شقة فندقية" },
  { value: "villa", en: "Private villa", ar: "فيلا خاصة" }, { value: "student-stay", en: "Student accommodation", ar: "سكن طلابي" }, { value: "custom-stay", en: "Build my own stay mix", ar: "أصمم خيارات إقامتي بنفسي" }, { value: "none-stay", en: "No stay needed", ar: "لا أحتاج إقامة" },
];
const planChoices: LocalChoice[] = [
  { value: "attractions", en: "Must-see places", ar: "أهم الأماكن السياحية" }, { value: "restaurants", en: "Restaurants & cafés", ar: "المطاعم والمقاهي" },
  { value: "experiences", en: "Local experiences", ar: "التجارب المحلية" }, { value: "family", en: "Family activities", ar: "أنشطة عائلية" },
  { value: "hidden-gems", en: "Hidden gems", ar: "أماكن مميزة غير معروفة" },
  { value: "free-time", en: "Planned free time", ar: "وقت حر منظم" },
];
// Study Abroad asks a different question entirely: this isn't a holiday, the
// student is working out whether they can actually live in this city. So the
// city plan offers what a student needs to settle in and study, not sights.
const studyPlanChoices: LocalChoice[] = [
  { value: "student-areas", en: "Student neighbourhoods", ar: "الأحياء الطلابية", detailEn: "Where students actually live, and what rent looks like", detailAr: "أين يسكن الطلاب فعليًا وكم تبلغ الإيجارات" },
  { value: "campus", en: "Campus & university visits", ar: "زيارات الجامعة والحرم", detailEn: "Seeing the university and getting to it daily", detailAr: "زيارة الجامعة وكيفية الوصول إليها يوميًا" },
  { value: "student-activities", en: "Student activities & societies", ar: "الأنشطة والنوادي الطلابية", detailEn: "Clubs, sports and meeting people", detailAr: "النوادي والرياضة والتعرف على الآخرين" },
  { value: "budget-eats", en: "Affordable eats & study cafés", ar: "مطاعم اقتصادية ومقاهي للدراسة", detailEn: "Cheap food near campus and places to work", detailAr: "طعام اقتصادي قرب الجامعة وأماكن للمذاكرة" },
  { value: "prayer-halal", en: "Prayer spaces & halal food", ar: "أماكن الصلاة والطعام الحلال", detailEn: "Mosques, prayer rooms and halal options nearby", detailAr: "المساجد ومصليات الجامعة وخيارات الطعام الحلال" },
  { value: "student-transport", en: "Student transport & discounts", ar: "تنقل الطلاب والخصومات", detailEn: "Travel passes and student pricing", detailAr: "بطاقات النقل وأسعار الطلاب" },
  { value: "settling-in", en: "Settling-in essentials", ar: "أساسيات الاستقرار", detailEn: "SIM card, bank account, registration and paperwork", detailAr: "شريحة الاتصال والحساب البنكي والتسجيل والأوراق" },
  { value: "arabic-community", en: "Arab & Muslim student community", ar: "مجتمع الطلاب العرب والمسلمين", detailEn: "Finding people from home once you arrive", detailAr: "التعرف على أبناء بلدك بعد الوصول" },
];
// One trip, up to three stops. See docs/paid-plans-spec.md.
const MAX_STOPS = 3;

// We ask for nights per stop rather than a date range per stop on purpose.
// Two ranges make the handover day ambiguous (if Riyadh is the 3rd to the
// 5th and Jeddah is the 5th to the 8th, whose day is the 5th?) and let the
// customer leave a gap in the middle of their own trip. Nights can do
// neither, and "two nights here, three there" is how people describe a
// multi-city trip anyway. The dates are derived and shown back to them.
function evenSplit(totalNights: number, stopCount: number): number[] {
  if (stopCount < 1) return [];
  const base = Math.floor(totalNights / stopCount);
  const extra = totalNights % stopCount;
  return Array.from({ length: stopCount }, (_, i) => base + (i < extra ? 1 : 0));
}

function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

// ar-EG rather than ar-SA: ar-SA formats as Hijri in most runtimes, and
// these are the customer's own Gregorian travel dates being read back.
function shortDate(date: Date, ar: boolean) {
  return date.toLocaleDateString(ar ? "ar-EG" : "en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

// Arabic-Indic digits, so a count in the same sentence as a formatted date
// doesn't sit next to it in a different numbering system.
function digits(value: number, ar: boolean) {
  return ar ? value.toLocaleString("ar-EG") : String(value);
}

// Arabic counts nouns by quantity: one and two have their own forms, three
// to ten take the broken plural, and eleven upward returns to the singular.
// "٥ ليلة" is what you get from ignoring that, and it reads as broken Arabic.
function nightsLabel(count: number, ar: boolean) {
  if (!ar) return `${count} ${count === 1 ? "night" : "nights"}`;
  if (count === 1) return "ليلة واحدة";
  if (count === 2) return "ليلتان";
  if (count >= 3 && count <= 10) return `${digits(count, true)} ليالٍ`;
  return `${digits(count, true)} ليلة`;
}
const STUDY_PLAN_DEFAULTS = ["student-areas", "campus", "settling-in"];
const deliveryChoices: LocalChoice[] = [
  { value: "email", en: "Email", ar: "البريد الإلكتروني", detailEn: "Receive the complete journey brief in your inbox", detailAr: "استلم تصور الرحلة الكامل في بريدك" },
  { value: "whatsapp", en: "WhatsApp", ar: "واتساب", detailEn: "Receive the plan and continue the conversation", detailAr: "استلم الخطة وتابع المحادثة معنا" },
];
const phoneCodes: SelectChoice[] = [
  { value: "+966", label: "🇸🇦  +966", detail: "Saudi Arabia" }, { value: "+971", label: "🇦🇪  +971", detail: "UAE" },
  { value: "+973", label: "🇧🇭  +973", detail: "Bahrain" }, { value: "+965", label: "🇰🇼  +965", detail: "Kuwait" },
  { value: "+974", label: "🇶🇦  +974", detail: "Qatar" }, { value: "+968", label: "🇴🇲  +968", detail: "Oman" },
  { value: "+44", label: "🇬🇧  +44", detail: "United Kingdom" }, { value: "+1", label: "🇺🇸  +1", detail: "United States / Canada" },
  { value: "+61", label: "🇦🇺  +61", detail: "Australia" }, { value: "+33", label: "🇫🇷  +33", detail: "France" },
];

function text(ar: boolean, en: string, arabic: string) { return ar ? arabic : en; }
function localize(ar: boolean, options: LocalChoice[]): SelectChoice[] { return options.map((option) => ({ value: option.value, label: ar ? option.ar : option.en, detail: ar ? option.detailAr : option.detailEn })); }
function localizedOptions(ar: boolean, options: LocalizedOption[]): SelectChoice[] {
  // The label the customer reads is one language; the words they type
  // may be the other, or a nickname, so both go into the search text.
  return options.map((option) => ({ value: option.value, label: ar ? option.ar : option.en, aliases: `${ar ? option.en : option.ar} ${option.aliases ?? ""}` }));
}

export function JourneyPlanner({ compact = false, locale = "en", initialPath = "journey", initialCountry = "", initialCity = "", fromCityGuide = false }: { compact?: boolean; locale?: "en" | "ar"; initialPath?: PlannerPath; initialCountry?: string; initialCity?: string; fromCityGuide?: boolean }) {
  const ar = locale === "ar";
  const [status, setStatus] = useState<"idle" | "reviewing" | "sent">("idle");
  const [path, setPath] = useState<PlannerPath>(initialPath);
  const [country, setCountry] = useState(initialCountry || (initialPath === "saudi" ? saudiArabia.value : ""));
  const [city, setCity] = useState(initialCity);
  const [purpose, setPurpose] = useState(fromCityGuide ? "leisure" : "");
  const [studySupport, setStudySupport] = useState("");
  const [hasSpecificField, setHasSpecificField] = useState<"" | "yes" | "no">("");
  const [specificField, setSpecificField] = useState("");
  const [hasSpecificUniversity, setHasSpecificUniversity] = useState<"" | "yes" | "no">("");
  const [specificUniversity, setSpecificUniversity] = useState("");
  const [stayRating, setStayRating] = useState("");
  // Flight planning is impossible without an origin, so this is required
  // whenever they ask for flights. Free text rather than a picker because
  // they could be flying from anywhere in the world.
  const [departureCity, setDepartureCity] = useState("");
  const [flightTiming, setFlightTiming] = useState("");
  // Extra stops beyond the primary city, so one trip can visit up to three
  // places. The primary city stays in `city` on purpose: everything
  // downstream already reads it, and stop one is simply that.
  const [extraStops, setExtraStops] = useState<{ city: string; purpose: string }[]>([]);
  // Entry to Makkah is restricted to Muslims under Saudi law and is checked
  // on the approaches to the city, so a non-Muslim customer's trip cannot go
  // ahead no matter how well it's planned. Ask before anything else is filled
  // in, rather than taking a full brief for a journey that can't happen.
  const [makkahEligible, setMakkahEligible] = useState<"" | "yes" | "no">("");
  // Study abroad is a Saudi-citizen service: the whole offer is built on the
  // Saudi student-visa route and on scholarship/SACM context, so planning it
  // for another passport would be confidently wrong rather than merely
  // unhelpful. Same shape as the Makkah check above, and asked before any of
  // the study questions so nobody fills in a form we cannot act on.
  const [saudiCitizen, setSaudiCitizen] = useState<"" | "yes" | "no">("");
  const [travellers, setTravellers] = useState("");
  const [travellerCount, setTravellerCount] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  // How the trip's nights are divided between the stops. Held as an override
  // rather than the source of truth: until the customer actually edits it we
  // show an even split, so a two-city trip arrives pre-filled sensibly and
  // nobody is made to do arithmetic they didn't ask for. Editing any row
  // makes the whole split theirs, which the draft is then told to obey.
  const [customNights, setCustomNights] = useState<number[]>([]);
  const [nightsTouched, setNightsTouched] = useState(false);
  const [transport, setTransport] = useState<string[]>([]);
  const [stays, setStays] = useState<string[]>([]);
  const [planIncludes, setPlanIncludes] = useState<string[]>(initialPath === "study" ? STUDY_PLAN_DEFAULTS : fromCityGuide ? ["attractions", "restaurants", "experiences"] : ["attractions", "restaurants"]);
  const [delivery, setDelivery] = useState<string[]>(["email"]);
  const [currency, setCurrency] = useState("SAR");
  const [budget, setBudget] = useState("");
  // Three ways a customer can arrive at a budget, per Habib's spec. "fixed"
  // and "unsure" both carry a number; "open" deliberately carries none and
  // asks us to propose one, so the amount field is hidden rather than left
  // blank and failing validation.
  const [budgetMode, setBudgetMode] = useState("fixed");
  const [phoneCode, setPhoneCode] = useState("+966");
  const [formError, setFormError] = useState("");
  const [missingSections, setMissingSections] = useState<number[]>([]);
  const submissionId = useRef(crypto.randomUUID());
  const resultRef = useRef<HTMLDivElement>(null);

  const countries = path === "saudi" ? [saudiArabia] : path === "study" ? studyCountries : travelCountries;
  const selectedCountry: CountryOption | undefined = countries.find((item) => item.value === country);
  const selectedCity = selectedCountry?.cities.find((item) => item.value === city);
  const purposeOptions = path === "saudi" ? saudiPurposes : journeyStyles;
  // Stop one is the primary city; extras follow it in travel order.
  const stops = [city, ...extraStops.map((s) => s.city)].filter(Boolean);
  // Multi-stop and the plan fee wherever we hold researched city data.
  // This was `country === saudiArabia.value` and stayed that way through
  // five more countries going in, so a Türkiye customer could not add
  // Cappadocia and was never shown a price.
  const multiStopAvailable = deepDataCountries.has(country);
  // Counted on extraStops, not `stops`: `stops` is filtered, so a row whose
  // city is still empty would not count and the cap could be clicked past.
  const canAddStop = multiStopAvailable && !!city && extraStops.length < MAX_STOPS - 1;
  // Any stop being Makkah triggers the eligibility question, not just the
  // first: adding it as stop two carries exactly the same entry restriction.
  const isMakkah = stops.includes("makkah");
  const makkahBlocked = isMakkah && makkahEligible === "no";
  const studyBlocked = path === "study" && saudiCitizen === "no";
  // Riyadh then Riyadh is just a longer Riyadh stay, so it is rejected.
  // Riyadh, Jeddah, Riyadh is a real shape (fly in, side trip, fly out) and
  // is allowed, which is why only *consecutive* repeats are blocked.
  const repeatedStopIndex = stops.findIndex((slug, i) => i > 0 && slug === stops[i - 1]);

  // Nights, not days: a trip from the 3rd to the 12th is nine nights and ten
  // days, and the day count is what the itinerary numbers, so the nights are
  // what there is to divide up.
  const tripNights = fromDate && toDate
    ? Math.round((new Date(`${toDate}T00:00:00Z`).getTime() - new Date(`${fromDate}T00:00:00Z`).getTime()) / 86_400_000)
    : 0;
  // The override only applies while it still describes this set of stops.
  // Adding or removing a destination invalidates it and drops back to an
  // even split, which is less surprising than silently keeping counts that
  // belonged to a different trip shape.
  const stopNights = nightsTouched && customNights.length === stops.length
    ? customNights
    : evenSplit(tripNights, stops.length);
  const nightsAssigned = stopNights.reduce((sum, n) => sum + n, 0);
  const nightsRemaining = tripNights - nightsAssigned;
  // Every stop needs at least one night; a stop you don't sleep in is a stop
  // the trip can't support, and the day numbering has nowhere to put it.
  const nightsTooShort = tripNights > 0 && tripNights < stops.length;
  const nightsValid = tripNights > 0 && stopNights.length === stops.length && stopNights.every((n) => n >= 1) && nightsRemaining === 0;
  // Priced per night plus each destination after the first, so it can only
  // be shown once the dates are in. Until then the planner quotes the rate
  // rather than a total it cannot yet know.
  const fee = planFee(tripNights, stops.length);
  const cityOptionsForStops = localizedOptions(ar, selectedCountry?.cities ?? []);
  const stopLabel = (slug: string) => cityOptionsForStops.find((option) => option.value === slug)?.label ?? slug;

  function setNightsAt(index: number, value: number) {
    const next = [...stopNights];
    next[index] = value;
    setCustomNights(next);
    setNightsTouched(true);
  }

  function choosePath(next: PlannerPath) {
    setPath(next); setCountry(next === "saudi" ? saudiArabia.value : ""); setCity(""); setPurpose(""); setStudySupport("");
    setHasSpecificField(""); setSpecificField(""); setHasSpecificUniversity(""); setSpecificUniversity(""); setStayRating(""); setMakkahEligible("");
    // Study Abroad and the travel paths offer completely different city-plan
    // options, so anything already ticked belongs to the other list and would
    // otherwise submit values the new path never showed. Reset to that path's
    // own defaults instead of carrying orphaned selections across.
    setPlanIncludes(next === "study" ? STUDY_PLAN_DEFAULTS : ["attractions", "restaurants"]);
    setSaudiCitizen("");
    setDepartureCity(""); setFlightTiming(""); setExtraStops([]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const value = (name: string) => String(formData.get(name) ?? "").trim();
    const emailField = form.elements.namedItem("email") as HTMLInputElement | null;
    const privacyAccepted = formData.get("privacyAccepted") === "yes";
    // Hard stop, not a "missing field": a non-Muslim traveller cannot enter
    // Makkah at all, so there is nothing to complete and nothing to submit.
    if (studyBlocked) {
      setMissingSections([1]);
      setFormError(text(ar, "Our study-abroad service is available to Saudi citizens only. Choose another journey type to continue.", "خدمة الدراسة في الخارج متاحة للمواطنين السعوديين فقط. اختر نوع رحلة آخر للمتابعة."));
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[data-step="1"]')?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    if (makkahBlocked) {
      setMissingSections([1]);
      setFormError(text(ar, "Makkah is open to Muslim visitors only. Please choose a different city to continue.", "مكة المكرمة مفتوحة للزوار المسلمين فقط. اختر مدينة أخرى للمتابعة."));
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[data-step="1"]')?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    // A repeated consecutive stop is a hard stop, not a missing field: there
    // is nothing to fill in, the itinerary itself doesn't make sense.
    if (repeatedStopIndex > 0) {
      setMissingSections([1]);
      setFormError(text(ar, "You've chosen the same destination twice in a row. Extend your dates to stay longer in one place, or pick a different next stop.", "اخترت الوجهة نفسها مرتين متتاليتين. مدّد التواريخ للبقاء مدة أطول في مكان واحد، أو اختر وجهة تالية مختلفة."));
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[data-step="1"]')?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    // A split that doesn't add up is a hard stop rather than a missing
    // field: the numbers are all there, they just describe a trip that
    // can't exist. Only checked once dates are in, otherwise the ordinary
    // step-2 check below is the one that should fire.
    if (stops.length > 1 && tripNights > 0 && !nightsValid) {
      setMissingSections([2]);
      setFormError(nightsTooShort
        ? text(ar,
            `A ${stops.length}-destination trip needs at least ${nightsLabel(stops.length, false)}. Extend your dates or remove a stop.`,
            `رحلة بـ${digits(stops.length, true)} وجهات تحتاج ${nightsLabel(stops.length, true)} على الأقل. مدّد تواريخك أو احذف محطة.`)
        : text(ar,
            "The nights in each destination need to add up to your trip length.",
            "يجب أن يتطابق مجموع الليالي في الوجهات مع مدة رحلتك."));
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[data-step="2"]')?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    const missing = [
      !country || !city || !purpose || extraStops.some((s) => !s.city || !s.purpose) || (isMakkah && !makkahEligible) || (path === "study" && !saudiCitizen) || (path === "study" && (!hasSpecificField || !hasSpecificUniversity || (hasSpecificField === "yes" && !specificField.trim()) || (hasSpecificUniversity === "yes" && !specificUniversity.trim()))) ? 1 : 0,
      // Asking for flights without saying where from leaves the team unable
      // to look anything up, so it counts as an incomplete step 3.
      transport.includes("flights") && !departureCity.trim() ? 3 : 0,
      !travellers || !travellerCount || !value("fromDate") || !value("toDate") ? 2 : 0,
      !transport.length || !stays.length ? 3 : 0,
      // "No set budget" is a complete answer, not a missing one: the customer
      // is asking us to propose the figure, so there is no amount to require.
      budgetMode !== "open" && !value("budget") ? 4 : 0,
      !delivery.length || !value("name") || (delivery.includes("email") && (!value("email") || !emailField?.validity.valid)) || (delivery.includes("whatsapp") && !value("phone")) || !privacyAccepted ? 5 : 0,
    ].filter(Boolean) as number[];
    if (missing.length) {
      setMissingSections(missing);
      setFormError(text(ar, "A few details still need your attention. We highlighted each incomplete step below.", "بقيت بعض التفاصيل. أبرزنا لك كل خطوة تحتاج إلى إكمال."));
      requestAnimationFrame(() => form.querySelector<HTMLElement>(`[data-step="${missing[0]}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    setMissingSections([]); setFormError(""); setStatus("reviewing");
    const payload = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue | FormDataEntryValue[]>;
    for (const field of ["transport", "stays", "planIncludes", "delivery"]) payload[field] = formData.getAll(field);
    try {
      const response = await fetch("/api/journeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, submissionId: submissionId.current, locale }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Request failed");
      window.setTimeout(() => setStatus("sent"), 2200);
    } catch {
      submissionId.current = crypto.randomUUID();
      setStatus("idle");
      setFormError(text(ar, "We couldn't send your journey yet. Please try again in a moment.", "تعذر إرسال رحلتك الآن. يرجى المحاولة مرة أخرى بعد قليل."));
      requestAnimationFrame(() => form.querySelector<HTMLElement>(".plannerError")?.scrollIntoView({ behavior: "smooth", block: "center" }));
    }
  }

  useEffect(() => {
    if (status === "idle") return;
    const frame = requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
    return () => cancelAnimationFrame(frame);
  }, [status]);

  if (status === "reviewing") return <div ref={resultRef} className="journeyReviewAnimation" role="status" aria-live="polite">
    <div className="reviewRoute" aria-hidden="true"><span><Luggage /></span><i /><span><Plane /></span><i /><span><MapPin /></span></div>
    <p className="kicker">{text(ar, "Preparing your request", "نجهّز طلبك")}</p><strong>{text(ar, "Turning your ideas into a clear journey brief…", "نحوّل أفكارك إلى تصور واضح لرحلة أحلامك…")}</strong>
    <div className="reviewSteps"><span>{text(ar, "Understanding you", "نفهم أفكارك")}</span><span>{text(ar, "Organizing the details", "ننظم التفاصيل")}</span><span>{text(ar, "Ready for review", "جاهزة للمراجعة")}</span></div>
  </div>;

  if (status === "sent") return <div ref={resultRef} className={`plannerSuccess plannerCelebration ${compact ? "compactSuccess" : ""}`} role="status" aria-live="assertive"><span className="successIcon"><CheckCircle2 /></span><div><span className="successKicker">{text(ar, "Journey brief ready", "تصور الرحلة جاهز")}</span><strong>{text(ar, "Your dream journey is ready for review.", "رحلة أحلامك جاهزة للمراجعة.")}</strong><p>{text(ar, `We’ll shape ${selectedCity?.en ?? "your destination"} around your transport, stay, budget and experience preferences. Your plan can include the best places, restaurants, local experiences and practical booking notes.`, `سنصمم رحلة ${selectedCity?.ar ?? "وجهتك"} وفق تفضيلات النقل والإقامة والميزانية والتجارب، ويمكن أن تشمل أفضل الأماكن والمطاعم والتجارب المحلية وملاحظات الحجز.`)}</p><button className="successReset" type="button" onClick={() => { submissionId.current = crypto.randomUUID(); setStatus("idle"); }}>{text(ar, "Plan another journey", "خطط لرحلة أخرى")}</button></div></div>;

  const sectionClass = (step: number) => `plannerSection full${missingSections.includes(step) ? " hasError" : ""}`;
  const requiredWarning = (step: number) => missingSections.includes(step) ? <span className="requiredWarning" role="status">* {text(ar, "Complete this step", "أكمل هذه الخطوة")}</span> : null;

  return <form dir={ar ? "rtl" : "ltr"} className={`${compact ? "quickPlanner" : "journeyForm"} smartPlanner polishedPlanner`} onSubmit={submit} noValidate>
    <label className="srOnly" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <div className="plannerIntro full"><p className={`kicker ${compact ? "light" : ""}`}>{text(ar, "Your journey, step by step", "رحلتك، خطوة بخطوة")}</p><h3>{text(ar, "Tell us what your dream looks like.", "شاركنا شكل رحلة أحلامك.")}</h3><p>{text(ar, "Start with the place. We’ll guide you through the people, dates, complete package and how you want to receive it.", "حدد وجهتك، وعلمنا عدد المسافرين وتواريخ الرحلة وراح نصمم لك باقة أحلامك اللي تناسب شخصيتك.")}</p></div>

    <section className={sectionClass(1)} data-step="1"><div className="plannerStep"><span>01</span><div><strong>{text(ar, "Choose the journey", "اختر الرحلة")}</strong><small>{text(ar, "Where do you want to go, and why?", "وين ودك تروح، ولماذا؟")}</small>{requiredWarning(1)}</div></div>
      <div className="pathSelector" role="radiogroup" aria-label={text(ar, "Journey type", "نوع الرحلة")}>{pathOptions.map((option) => { const Icon = pathIcons[option.path]; return <button className={path === option.path ? "pathOption selected" : "pathOption"} type="button" role="radio" aria-checked={path === option.path} onClick={() => choosePath(option.path)} key={option.path}><Icon aria-hidden="true" /><span><strong>{ar ? option.ar : option.en}</strong><small>{ar ? option.descriptionAr : option.descriptionEn}</small></span></button>; })}<input type="hidden" name="journeyType" value={path} /></div>
      <div className="plannerFieldGrid destinationFields" key={path}>
        <ElasticSelect label={text(ar, "Country", "الدولة")} name="country" required searchable searchPlaceholder={text(ar, "Search countries…", "ابحث عن دولة…")} emptyText={text(ar, "No matching countries", "لا توجد دول مطابقة")} placeholder={text(ar, path === "study" ? "Where would you like to study?" : "Choose or search a country", path === "study" ? "أين ترغب في الدراسة؟" : "اختر أو ابحث عن دولة")} options={localizedOptions(ar, countries)} value={country} onChange={(value) => { setCountry(value); setCity(""); setMakkahEligible(""); setExtraStops([]); }} />
        <ElasticSelect label={text(ar, path === "study" ? "Study city" : "City or destination", path === "study" ? "مدينة الدراسة" : "المدينة أو الوجهة")} name="city" required searchable disabled={!selectedCountry} searchPlaceholder={text(ar, "Search cities…", "ابحث عن مدينة…")} emptyText={text(ar, "No matching cities", "لا توجد مدن مطابقة")} placeholder={text(ar, selectedCountry ? "Choose or search a city" : "Choose a country first", selectedCountry ? "اختر أو ابحث عن مدينة" : "اختر الدولة أولًا")} options={localizedOptions(ar, selectedCountry?.cities ?? [])} value={city} onChange={(value) => { setCity(value); setMakkahEligible(""); }} />
        <ElasticSelect label={text(ar, path === "saudi" ? "Purpose of visit" : path === "study" ? "Study level" : "Journey style", path === "saudi" ? "هدف الزيارة" : path === "study" ? "المرحلة الدراسية" : "طابع الرحلة")} name="purpose" required placeholder={text(ar, "Choose what fits best", "اختر الأنسب لك")} options={localize(ar, path === "study" ? [{value:"language",en:"Language programme",ar:"برنامج لغة"},{value:"foundation",en:"Foundation",ar:"سنة تحضيرية"},{value:"bachelor",en:"Bachelor’s degree",ar:"بكالوريوس"},{value:"master",en:"Master’s degree",ar:"ماجستير"},{value:"doctorate",en:"Doctorate",ar:"دكتوراه"},{value:"short",en:"Short course",ar:"دورة قصيرة"}] : purposeOptions)} value={purpose} onChange={setPurpose} />
        {path === "study" ? <ElasticSelect label={text(ar, "Study support", "دعم الدراسة")} name="studySupport" placeholder={text(ar, "How can we help?", "كيف يمكننا مساعدتك؟")} options={localize(ar,[{value:"guidance",en:"Destination & university guidance",ar:"اختيار الوجهة والجامعة"},{value:"visa",en:"Visa-application assistance",ar:"المساعدة في طلب التأشيرة"},{value:"stay",en:"Accommodation",ar:"السكن"},{value:"arrival",en:"Flights & arrival",ar:"الطيران والاستقبال"},{value:"complete",en:"Complete study-abroad package",ar:"باقة دراسة متكاملة"}])} value={studySupport} onChange={setStudySupport} /> : null}
      </div>
      {multiStopAvailable ? <div className="stopsBlock">
        {extraStops.map((stop, index) => (
          <div className="extraStop" key={index}>
            <ElasticSelect
              label={text(ar, `Stop ${index + 2}`, `المحطة ${index + 2}`)}
              name={`extraStop${index}`}
              searchable
              searchPlaceholder={text(ar, "Search cities…", "ابحث عن مدينة…")}
              emptyText={text(ar, "No matching cities", "لا توجد مدن مطابقة")}
              placeholder={text(ar, "Choose the next destination", "اختر الوجهة التالية")}
              options={localizedOptions(ar, selectedCountry?.cities ?? [])}
              value={stop.city}
              onChange={(value) => { setExtraStops(extraStops.map((s, i) => (i === index ? { ...s, city: value } : s))); setMakkahEligible(""); }}
            />
            {/* Each stop earns its own purpose: a trip can be Umrah in
                Makkah and leisure in Riyadh, and one trip-wide purpose
                cannot express that. */}
            <ElasticSelect
              label={text(ar, "Purpose", "الغرض")}
              name={`extraStopPurpose${index}`}
              placeholder={text(ar, "Why this stop?", "لماذا هذه المحطة؟")}
              options={localize(ar, saudiPurposes)}
              value={stop.purpose}
              onChange={(value) => setExtraStops(extraStops.map((s, i) => (i === index ? { ...s, purpose: value } : s)))}
            />
            <button type="button" className="removeStop" onClick={() => { setExtraStops(extraStops.filter((_, i) => i !== index)); setMakkahEligible(""); }}>
              {text(ar, "Remove", "إزالة")}
            </button>
          </div>
        ))}
        {repeatedStopIndex > 0 ? <p className="stopWarning" role="alert">{text(ar,
          "You've picked the same destination twice in a row. Staying longer in one place is better done by extending your dates, but you can return to a city after visiting another one.",
          "اخترت الوجهة نفسها مرتين متتاليتين. إن أردت البقاء مدة أطول في مكان واحد فالأفضل تمديد التواريخ، لكن يمكنك العودة إلى مدينة بعد زيارة مدينة أخرى.")}</p> : null}
        <div className="stopsFooter">
          {canAddStop ? <button type="button" className="addStop" onClick={() => setExtraStops([...extraStops, { city: "", purpose: "" }])}>
            + {text(ar, "Add another destination", "أضف وجهة أخرى")}
          </button> : null}
          {stops.length ? <p className="planFee">
            {tripNights > 0
              ? text(ar,
                  `Plan fee SAR ${fee}`,
                  `رسوم الخطة ${digits(fee, true)} ريال`)
              : text(ar,
                  `SAR ${NIGHT_RATE} per night`,
                  `${digits(NIGHT_RATE, true)} ريال لكل ليلة`)}
            <small>
              {tripNights > 0
                ? text(ar,
                    // Spelled out rather than just totalled, so the number
                    // never looks arbitrary at the moment they read it.
                    `${nightsLabel(tripNights, false)} × SAR ${NIGHT_RATE}${stops.length > 1 ? ` + ${stops.length - 1} extra ${stops.length === 2 ? "destination" : "destinations"} × SAR ${EXTRA_STOP_FEE}` : ""}. Separate from your travel budget below.`,
                    `${nightsLabel(tripNights, true)} × ${digits(NIGHT_RATE, true)} ريال${stops.length > 1 ? ` + ${digits(stops.length - 1, true)} ${stops.length === 2 ? "وجهة إضافية" : "وجهات إضافية"} × ${digits(EXTRA_STOP_FEE, true)} ريال` : ""}. منفصلة عن ميزانية سفرك أدناه.`)
                : text(ar,
                    `Add your dates below and we'll total it${stops.length > 1 ? `, plus SAR ${EXTRA_STOP_FEE} for each destination after the first` : ""}. Separate from your travel budget.`,
                    `أضف تواريخك بالأسفل ونحسب لك الإجمالي${stops.length > 1 ? `، بالإضافة إلى ${digits(EXTRA_STOP_FEE, true)} ريال لكل وجهة بعد الأولى` : ""}. وهي منفصلة عن ميزانية سفرك.`)}
            </small>
          </p> : null}
        </div>
        <input type="hidden" name="stops" value={stops.join(",")} />
        <input type="hidden" name="stopPurposes" value={[purpose, ...extraStops.map((s) => s.purpose)].join(",")} />
      </div> : null}
      {isMakkah ? <div className="makkahGate">
        <p className="makkahNote">{text(ar,
          "One thing to check first: entry to Makkah is reserved for Muslim visitors under Saudi law, and this is verified on the roads into the city. We ask now so we only plan a journey that can actually go ahead.",
          "نتحقق من أمر واحد أولًا: دخول مكة المكرمة مخصص للزوار المسلمين وفق أنظمة المملكة، ويتم التحقق من ذلك عند مداخل المدينة. نسأل الآن حتى لا نخطط إلا لرحلة يمكن إتمامها فعلًا.")}</p>
        <div className="binaryQuestion"><fieldset><legend>{text(ar, "Are you Muslim?", "هل أنت مسلم؟")} *</legend><div className="binaryOptions">{(["yes", "no"] as const).map((choice) => <button key={choice} type="button" className={makkahEligible === choice ? "selected" : ""} aria-pressed={makkahEligible === choice} onClick={() => setMakkahEligible(choice)}>{choice === "yes" ? text(ar, "Yes", "نعم") : text(ar, "No", "لا")}</button>)}</div><input type="hidden" name="makkahEligible" value={makkahEligible} /></fieldset></div>
        {makkahBlocked ? <div className="makkahBlocked" role="status" aria-live="polite">
          <strong>{text(ar, "We can’t plan a Makkah journey, but we’d still love to plan something with you.", "لا يمكننا تخطيط رحلة إلى مكة المكرمة، لكن يسعدنا تخطيط رحلة أخرى معك.")}</strong>
          <p>{text(ar,
            "Thank you for telling us. The rest of the Kingdom is open to every visitor: Jeddah’s Al-Balad old town, AlUla’s Nabataean tombs, the mountains around Taif and the Red Sea coast. Choose a different city above and we’ll carry on from there.",
            "شكرًا لإخبارنا. بقية المملكة مفتوحة لجميع الزوار: جدة التاريخية (البلد)، ومقابر الحِجر النبطية في العلا، وجبال الطائف، وساحل البحر الأحمر. اختر مدينة أخرى بالأعلى ونكمل من هناك.")}</p>
        </div> : null}
      </div> : null}
      {path === "study" ? <div className="studyEligibility">
        <p className="makkahNote">{text(ar,
          "One thing first: our study-abroad service is built for Saudi citizens. The visa route, the paperwork and the scholarship guidance we provide all assume a Saudi passport, so we ask now rather than plan something we cannot deliver.",
          "أمر واحد أولًا: خدمة الدراسة في الخارج لدينا مخصصة للمواطنين السعوديين. مسار التأشيرة والأوراق المطلوبة وإرشادات الابتعاث التي نقدمها كلها مبنية على جواز سفر سعودي، لذلك نسأل الآن بدلًا من تخطيط ما لا نستطيع تنفيذه.")}</p>
        <div className="binaryQuestion"><fieldset><legend>{text(ar, "Are you a Saudi citizen?", "هل أنت مواطن سعودي؟")} *</legend><div className="binaryOptions">{(["yes", "no"] as const).map((choice) => <button key={choice} type="button" className={saudiCitizen === choice ? "selected" : ""} aria-pressed={saudiCitizen === choice} onClick={() => setSaudiCitizen(choice)}>{choice === "yes" ? text(ar, "Yes", "نعم") : text(ar, "No", "لا")}</button>)}</div><input type="hidden" name="saudiCitizen" value={saudiCitizen} /></fieldset></div>
        {studyBlocked ? <div className="makkahBlocked" role="status" aria-live="polite">
          <strong>{text(ar, "We can't take this one on, but we'd still love to plan a trip with you.", "لا يمكننا تولي هذا الطلب، لكن يسعدنا أن نخطط لك رحلة.")}</strong>
          <p>{text(ar,
            "Thank you for telling us. Our study-abroad service is limited to Saudi citizens because it is built around the Saudi student-visa route and scholarship process, and we would rather say so than give you guidance that does not apply to your passport. Everything else we do is open to you: choose Design your dream journey or Discover Saudi Arabia above and we'll plan it properly.",
            "شكرًا لإخبارنا. خدمة الدراسة في الخارج لدينا مقتصرة على المواطنين السعوديين لأنها مبنية على مسار التأشيرة الدراسية السعودية وإجراءات الابتعاث، ونفضّل أن نقول ذلك بدلًا من تقديم إرشادات لا تنطبق على جواز سفرك. أما بقية خدماتنا فهي متاحة لك: اختر صمّم رحلة أحلامك أو اكتشف السعودية أعلاه وسنخطط لها كما ينبغي.")}</p>
        </div> : null}
      </div> : null}
      {path === "study" ? <div className="studyDetails">
        <div className="binaryQuestion"><fieldset><legend>{text(ar, "Do you have a specific field of study?", "هل لديك تخصص محدد؟")} *</legend><div className="binaryOptions">{(["yes", "no"] as const).map((choice) => <button key={choice} type="button" className={hasSpecificField === choice ? "selected" : ""} aria-pressed={hasSpecificField === choice} onClick={() => { setHasSpecificField(choice); if (choice === "no") setSpecificField(""); }}>{choice === "yes" ? text(ar, "Yes", "نعم") : text(ar, "No", "لا")}</button>)}</div><input type="hidden" name="hasSpecificField" value={hasSpecificField} /></fieldset>{hasSpecificField === "yes" ? <label className="studyReveal"><span>{text(ar, "Preferred field or major", "التخصص الذي تفضله")} *</span><input name="specificField" value={specificField} onChange={(event) => setSpecificField(event.target.value)} placeholder={text(ar, "For example, computer science", "مثلاً، علوم الحاسب")} /></label> : null}</div>
        <div className="binaryQuestion"><fieldset><legend>{text(ar, "Do you have a specific university in mind?", "هل لديك جامعة محددة؟")} *</legend><div className="binaryOptions">{(["yes", "no"] as const).map((choice) => <button key={choice} type="button" className={hasSpecificUniversity === choice ? "selected" : ""} aria-pressed={hasSpecificUniversity === choice} onClick={() => { setHasSpecificUniversity(choice); if (choice === "no") setSpecificUniversity(""); }}>{choice === "yes" ? text(ar, "Yes", "نعم") : text(ar, "No", "لا")}</button>)}</div><input type="hidden" name="hasSpecificUniversity" value={hasSpecificUniversity} /></fieldset>{hasSpecificUniversity === "yes" ? <label className="studyReveal"><span>{text(ar, "Preferred university", "الجامعة التي تفضلها")} *</span><input name="specificUniversity" value={specificUniversity} onChange={(event) => setSpecificUniversity(event.target.value)} placeholder={text(ar, "Type the university name", "اكتب اسم الجامعة")} /></label> : null}</div>
      </div> : null}
    </section>

    {/* A disabled fieldset natively disables every control inside it, so a
        blocked Makkah request can't be filled in or submitted by keyboard or
        script either, not just visually. display:contents keeps the form grid
        layout exactly as it was. */}
    <fieldset className="plannerLock" disabled={makkahBlocked || studyBlocked}>
    <section className={sectionClass(2)} data-step="2"><div className="plannerStep"><span>02</span><div><strong>{text(ar, "Who and when", "من ومتى")}</strong><small>{text(ar, "The people and dates shape every recommendation.", "المسافرون والتواريخ يصنعون فرقًا في كل توصية.")}</small>{requiredWarning(2)}</div></div><div className="plannerFieldGrid">
      <ElasticSelect label={text(ar, "Travellers", "المسافرون")} name="travellers" required placeholder={text(ar, "Who is travelling?", "من سيسافر؟")} options={localize(ar, travellerTypes)} value={travellers} onChange={setTravellers} />
      <ElasticSelect label={text(ar, "Number of travellers", "عدد المسافرين")} name="travellerCount" required placeholder={text(ar, "Choose a number", "اختر العدد")} options={Array.from({length:12},(_,index)=>({value:String(index+1),label:ar?`${index+1} مسافر`:`${index+1} traveller${index ? "s" : ""}`})).concat([{value:"13+",label:ar?"١٣ مسافرًا أو أكثر":"13+ travellers"}])} value={travellerCount} onChange={setTravellerCount} />
      <label><span>{text(ar, "From", "من تاريخ")} *</span><input name="fromDate" type="date" required value={fromDate} onInput={(event) => setFromDate(event.currentTarget.value)} onChange={(event) => setFromDate(event.target.value)} /></label>
      <label><span>{text(ar, "To", "إلى تاريخ")} *</span><input name="toDate" type="date" required min={fromDate || undefined} value={toDate} onInput={(event) => setToDate(event.currentTarget.value)} onChange={(event) => setToDate(event.target.value)} /></label>
    </div>
    {/* Only a multi-stop trip has anything to divide. A single destination
        gets the whole range and never sees this. */}
    {stops.length > 1 ? <div className="nightsSplit">
      <p className="nightsSplitHead">
        <strong>{text(ar, "How long in each destination?", "كم ليلة في كل وجهة؟")}</strong>
        <small>{text(ar,
          "Count in nights. The day you move on is spent travelling, so it belongs to both cities.",
          "العدّ بالليالي. يوم انتقالك يُقضى في السفر، لذلك يُحسب للمدينتين معًا.")}</small>
      </p>
      {tripNights > 0 ? <>
        <div className="nightsRows">
          {stops.map((slug, index) => {
            const nights = stopNights[index] ?? 0;
            const startsOn = stopNights.slice(0, index).reduce((sum, n) => sum + n, 0);
            return (
              <label className="nightsRow" key={`${slug}-${index}`}>
                <span className="nightsCity">{stopLabel(slug)}</span>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, tripNights - (stops.length - 1))}
                  step={1}
                  value={nights || ""}
                  onChange={(event) => setNightsAt(index, Math.max(0, Math.floor(Number(event.target.value) || 0)))}
                  aria-label={text(ar, `Nights in ${stopLabel(slug)}`, `الليالي في ${stopLabel(slug)}`)}
                />
                <span className="nightsUnit">{text(ar, nights === 1 ? "night" : "nights", "ليلة")}</span>
                <span className="nightsDates">
                  {fromDate && nights >= 1
                    ? `${shortDate(addDays(fromDate, startsOn), ar)} – ${shortDate(addDays(fromDate, startsOn + nights), ar)}`
                    : ""}
                </span>
              </label>
            );
          })}
        </div>
        <p className={`nightsTally${nightsValid ? " ok" : ""}`} role="status" aria-live="polite">
          {nightsTooShort
            ? text(ar,
                `${stops.length} destinations need at least ${nightsLabel(stops.length, false)}. Extend your dates or remove a stop.`,
                `${digits(stops.length, true)} وجهات تحتاج ${nightsLabel(stops.length, true)} على الأقل. مدّد تواريخك أو احذف محطة.`)
            : nightsValid
              ? text(ar, `All ${nightsLabel(tripNights, false)} placed.`, `تم توزيع ${nightsLabel(tripNights, true)} بالكامل.`)
              : nightsRemaining > 0
                ? text(ar,
                    `${digits(nightsRemaining, false)} of ${nightsLabel(tripNights, false)} still to place.`,
                    `بقيت ${nightsLabel(nightsRemaining, true)} من ${nightsLabel(tripNights, true)} للتوزيع.`)
                : text(ar,
                    `That's ${digits(Math.abs(nightsRemaining), false)} more than your ${nightsLabel(tripNights, false)}.`,
                    `هذا يزيد ${nightsLabel(Math.abs(nightsRemaining), true)} عن ${nightsLabel(tripNights, true)} المتاحة.`)}
        </p>
      </> : <p className="nightsHint">{text(ar,
        "Choose your travel dates above and we'll help you divide them.",
        "اختر تواريخ سفرك بالأعلى ثم نساعدك على توزيعها.")}</p>}
      <input type="hidden" name="stopNights" value={nightsValid ? stopNights.join(",") : ""} />
      {/* Tells the draft whether this split is the customer's decision to
          follow exactly, or our even-split suggestion it may refine. */}
      <input type="hidden" name="stopNightsChosen" value={nightsTouched ? "yes" : "no"} />
    </div> : null}
    {/* The fee is quoted in step one too, but it only becomes a real number
        once the dates exist, and the dates are set here. Without this the
        customer would never watch the price resolve. Both read the same
        `fee`, so the two lines cannot disagree. */}
    {multiStopAvailable && stops.length && tripNights > 0 ? <p className="datesFee">
      {text(ar, `Plan fee SAR ${fee}`, `رسوم الخطة ${digits(fee, true)} ريال`)}
      <span>{text(ar,
        `${nightsLabel(tripNights, false)} at SAR ${NIGHT_RATE}${stops.length > 1 ? `, plus ${stops.length - 1} extra ${stops.length === 2 ? "destination" : "destinations"}` : ""}`,
        `${nightsLabel(tripNights, true)} بـ${digits(NIGHT_RATE, true)} ريال${stops.length > 1 ? `، بالإضافة إلى ${digits(stops.length - 1, true)} ${stops.length === 2 ? "وجهة إضافية" : "وجهات إضافية"}` : ""}`)}</span>
    </p> : null}
    </section>

    <section className={sectionClass(3)} data-step="3"><div className="plannerStep"><span>03</span><div><strong>{text(ar, "Build your complete package", "كوّن باقتك الكاملة")}</strong><small>{text(ar, "Select more than one option wherever you like.", "يمكنك اختيار أكثر من خيار حسب رغبتك.")}</small>{requiredWarning(3)}</div></div>
      <MultiChoice legend={text(ar, "What transport do you need?", "ما خدمات النقل التي تحتاجها؟")} name="transport" options={localize(ar, transportChoices)} selected={transport} onChange={setTransport} hint={text(ar, "Choose every service you want us to include.", "اختر جميع الخدمات التي ترغب بإضافتها.")} />
      {/* Only meaningful once they've actually asked for flights. No flight
          schedule or fare can be looked up without knowing where they're
          departing from, so this is the field that makes flight planning
          possible at all rather than a nice-to-have. */}
      {transport.includes("flights") ? <div className="flightDetails">
        <label className="studyReveal"><span>{text(ar, "Where are you flying from?", "من أين ستسافر؟")} *</span><input name="departureCity" value={departureCity} onChange={(event) => setDepartureCity(event.target.value)} placeholder={text(ar, "City or airport, for example Cairo or LHR", "المدينة أو المطار، مثلاً القاهرة أو LHR")} /></label>
        <ElasticSelect label={text(ar, "Preferred flight timing", "توقيت الرحلة المفضل")} name="flightTiming" placeholder={text(ar, "Daytime, night, or flexible", "نهارية أو ليلية أو مرن")} options={localize(ar, [
          { value: "flexible", en: "Flexible, whatever works best", ar: "مرن، ما يناسب أكثر" },
          { value: "daytime", en: "Daytime flight", ar: "رحلة نهارية" },
          { value: "nighttime", en: "Night flight", ar: "رحلة ليلية" },
        ])} value={flightTiming} onChange={setFlightTiming} />
      </div> : null}
      <MultiChoice legend={text(ar, "Where would you like to stay?", "ما نوع الإقامة التي تفضلها؟")} name="stays" options={localize(ar, stayChoices)} selected={stays} onChange={setStays} />
      {!stays.includes("none-stay") ? <ElasticSelect label={text(ar, "Preferred accommodation rating", "عدد نجوم الإقامة المفضلة")} name="stayRating" placeholder={text(ar, "Choose a rating or stay flexible", "اختر عدد النجوم أو اتركه مرنًا")} options={localize(ar,[{value:"flexible",en:"Flexible, show me the best fit",ar:"مرن، اقترح الأنسب"},{value:"1-star",en:"1 star",ar:"نجمة واحدة"},{value:"2-star",en:"2 stars",ar:"نجمتان"},{value:"3-star",en:"3 stars",ar:"3 نجوم"},{value:"4-star",en:"4 stars",ar:"4 نجوم"},{value:"5-star",en:"5 stars",ar:"5 نجوم"}])} value={stayRating} onChange={setStayRating} /> : null}
      <MultiChoice legend={path === "study" ? text(ar, "What should your student city plan cover?", "ماذا تريد أن تغطي خطة مدينتك الدراسية؟") : text(ar, "What should your city plan include?", "ماذا تريد أن تتضمن خطة المدينة؟")} name="planIncludes" options={localize(ar, path === "study" ? studyPlanChoices : planChoices)} selected={planIncludes} onChange={setPlanIncludes} />
      <label className="fullTextField"><span>{text(ar, "Add anything we have not asked", "أضف أي طلب لم نسأل عنه")}</span><textarea name="packageNotes" rows={3} placeholder={text(ar, "Type a hotel name, dietary preference, accessibility need, dream experience or anything else…", "اكتب اسم فندق أو تفضيلًا غذائيًا أو احتياجًا لسهولة الوصول أو تجربة تحلم بها…")} /></label>
    </section>

    <section className={sectionClass(4)} data-step="4"><div className="plannerStep"><span>04</span><div><strong>{text(ar, "Set the complete budget", "حدد الميزانية الكاملة")}</strong><small>{text(ar, "One total for flights, stays, transport and experiences.", "مبلغ واحد يشمل الطيران والإقامة والنقل والتجارب.")}</small>{requiredWarning(4)}</div></div><fieldset className="budgetModes"><legend>{text(ar, "Budget options", "خيارات الميزانية")}</legend>
      <input type="hidden" name="budgetMode" value={budgetMode} />
      {[
        { value: "fixed",  en: "I have a set budget",                      ar: "لدي ميزانية محددة",                       hintEn: "Enter the maximum available for the trip",  hintAr: "أدخل الحد الأقصى للميزانية المتاحة للرحلة" },
        { value: "unsure", en: "I have a budget but I'm not sure it's enough", ar: "لدي ميزانية ولكن غير متأكد إذا كانت كافية", hintEn: "We'll help you land on the right budget",     hintAr: "سنساعدك في تحديد الميزانية المناسبة" },
        { value: "open",   en: "No set budget",                            ar: "لا توجد ميزانية محددة",                   hintEn: "Suggest a suitable budget for the trip",     hintAr: "اقترحوا لي ميزانية مناسبة للرحلة" },
      ].map((option) => (
        <button
          key={option.value}
          type="button"
          className={budgetMode === option.value ? "selected" : ""}
          aria-pressed={budgetMode === option.value}
          onClick={() => { setBudgetMode(option.value); if (option.value === "open") setBudget(""); }}
        >
          <strong>{text(ar, option.en, option.ar)}</strong>
          <small>{text(ar, option.hintEn, option.hintAr)}</small>
        </button>
      ))}
    </fieldset>
    <div className="budgetComposer">
      <ElasticSelect label={text(ar, "Currency", "العملة")} name="currency" options={["SAR","USD","EUR","GBP","AED","KWD","QAR","BHD"].map((item)=>({value:item,label:item}))} value={currency} onChange={setCurrency} placeholder="SAR" />
      {budgetMode !== "open" ? (
        <label><span>{text(ar, "Total amount", "المبلغ الكامل")} *</span><input type="hidden" name="budget" value={budget} /><input type="text" inputMode="numeric" aria-required="true" value={budget.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChange={(event) => setBudget(event.target.value.replace(/\D/g, ""))} placeholder={text(ar, budgetMode === "unsure" ? "Enter what you have in mind" : "Enter your full journey budget", budgetMode === "unsure" ? "أدخل المبلغ الذي تفكر فيه" : "أدخل ميزانية الرحلة الكاملة")} /></label>
      ) : null}
    </div></section>

    <section className={sectionClass(5)} data-step="5"><div className="plannerStep"><span>05</span><div><strong>{text(ar, "Where should we send the plan?", "كيف نرسل لك الخطة؟")}</strong><small>{text(ar, "Choose email, WhatsApp, or both.", "اختر البريد الإلكتروني أو واتساب أو كليهما.")}</small>{requiredWarning(5)}</div></div>
      <MultiChoice legend={text(ar, "Delivery preferences", "طرق الاستلام المفضلة")} name="delivery" options={localize(ar, deliveryChoices)} selected={delivery} onChange={setDelivery} />
      <div className="contactFields"><label><span>{text(ar, "Full name", "الاسم الكامل")} *</span><input name="name" autoComplete="name" required placeholder={text(ar, "Your name", "اسمك")} /></label><label><span>{text(ar, "Email", "البريد الإلكتروني")}{delivery.includes("email") ? " *" : ""}</span><input name="email" type="email" autoComplete="email" required={delivery.includes("email")} placeholder="you@example.com" /></label><div className="phoneField"><ElasticSelect label={text(ar, "Country code", "رمز الدولة")} name="phoneCode" searchable options={phoneCodes} value={phoneCode} onChange={setPhoneCode} placeholder="🇸🇦 +966" searchPlaceholder={text(ar, "Search code…", "ابحث عن الرمز…")} /><label><span>{text(ar, "Phone / WhatsApp", "الجوال / واتساب")}{delivery.includes("whatsapp") ? " *" : ""}</span><input name="phone" type="tel" autoComplete="tel-national" inputMode="tel" required={delivery.includes("whatsapp")} placeholder={text(ar, "5X XXX XXXX", "5X XXX XXXX")} /></label></div><label className="full"><span>{text(ar, "Anything else that will make this journey yours?", "ما الذي سيجعل هذه الرحلة خاصة بك؟")}</span><textarea name="notes" rows={4} placeholder={text(ar, "Tell us about your interests, preferred rhythm, repeated activities, accessibility needs or any final details…", "شاركنا اهتماماتك والتكرار المفضل للأنشطة واحتياجات سهولة الوصول أو أي تفاصيل أخيرة…")} /></label></div>
      <label className="consentCheck full"><input type="checkbox" name="privacyAccepted" value="yes" required /><span>{ar ? <>أوافق على استخدام بياناتي للرد على طلب الرحلة وفق <a href="/ar/privacy" target="_blank" rel="noopener noreferrer">سياسة الخصوصية</a>، وأقر بأن هذا الطلب ليس حجزًا مؤكدًا وفق <a href="/ar/terms" target="_blank" rel="noopener noreferrer">شروط الاستخدام</a>.</> : <>I agree that MEMORIES may use my information to respond to this journey request under the <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>, and understand that this is not a confirmed booking under the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Use</a>.</>}</span></label>
      <p className="privacyHint full">{text(ar, "Service emails about this request are not marketing. Please do not enter passport, payment-card or medical information in this form.", "رسائل الخدمة المتعلقة بهذا الطلب ليست تسويقًا. لا تدخل بيانات جواز السفر أو البطاقة أو المعلومات الطبية في هذا النموذج.")}</p>
    </section>

    </fieldset>
    {formError ? <p className="plannerError full" role="alert">{formError}</p> : null}
    <button className="button gold full plannerSubmit" type="submit" disabled={makkahBlocked || studyBlocked}>{text(ar, "Send my journey for review", "أرسل رحلتي للمراجعة")} <ArrowRight className="directionArrow" size={17} /></button>
    {path === "study" ? <p className="formNote full">{text(ar, "Visa decisions are made solely by the relevant authorities; MEMORIES provides application assistance, not guaranteed approval.", "تتخذ الجهات المختصة قرارات التأشيرات؛ تقدم ميموريز المساعدة في الطلب ولا تضمن الموافقة.")}</p> : null}
  </form>;
}
