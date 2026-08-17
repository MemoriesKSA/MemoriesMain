// Chrome-text localization for the customer journey page only. The
// customer's name and reference code are never run through this, they're
// interpolated as-is regardless of locale, only the surrounding labels and
// date formatting change.

export type JourneyLocale = "en" | "ar";

export const journeyStrings = {
  en: {
    kicker: "MEMORIES · YOUR JOURNEY",
    heroTitle: (name: string, city: string) => `${name}’s ${city} journey`,
    referenceLabel: (ref: string) => `Reference ${ref}`,
    total: "TOTAL",
    // Label shown above whichever itinerary block isn't in this page's own
    // chrome language, so it's the Arabic block here, the English block on
    // the /ar route below.
    otherVersionLabel: "النسخة العربية",
    questions: (email: string) => ({
      before: "Questions about this journey? Reply to the email you received, or reach us at ",
      email,
      after: ".",
    }),
  },
  ar: {
    kicker: "مموريز · رحلتك",
    heroTitle: (name: string, city: string) => `رحلة ${name} إلى ${city}`,
    referenceLabel: (ref: string) => `المرجع ${ref}`,
    total: "الإجمالي",
    otherVersionLabel: "النسخة الإنجليزية",
    questions: (email: string) => ({
      before: "أسئلة حول هذه الرحلة؟ رد على البريد الإلكتروني الذي استلمته، أو تواصل معنا عبر ",
      email,
      after: ".",
    }),
  },
} as const;

export function formatJourneyDate(value: string | null, locale: JourneyLocale) {
  if (!value) return null;
  // calendar: "gregory" pinned explicitly, "ar" alone can default to the
  // Umm al-Qura Hijri calendar in some engines, and these dates are stored
  // and entered as plain Gregorian dates.
  return new Date(`${value}T00:00:00Z`).toLocaleDateString(locale === "ar" ? "ar" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
    calendar: "gregory",
  });
}
