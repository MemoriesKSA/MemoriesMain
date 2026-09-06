// Which half of a plan a page shows.
//
// A plan can hold an English half, an Arabic half, or both: the customer picks
// at submission, and "English only" is a real choice people make. The page
// shows one language now rather than printing both in full, because printing
// both made a Madinah plan 2,642 words - half of them a copy the reader cannot
// read - and put an entire English plan between an Arabic reader and the
// unlock panel. The header carries a language switch, so the other version is
// a click away.
//
// The rule is "its own language, unless that half does not exist". A blank
// page is worse than a page in the other language with a label saying so, and
// this is the case that would produce one: an English-only plan opened at a
// /ar link, which is one tap of the language switch away from every customer.

export type PlanLanguage = "en" | "ar";

export type PlanLanguageChoice = {
  /** The half to render, or null when the plan has no text at all. */
  primary: PlanLanguage | null;
  /** True when we had to fall back, so the page can say which language this is. */
  showingOtherLanguage: boolean;
};

export function primaryPlanLanguage(locale: PlanLanguage, hasEnglish: boolean, hasArabic: boolean): PlanLanguageChoice {
  const primary: PlanLanguage | null =
    locale === "ar" && hasArabic ? "ar" : hasEnglish ? "en" : hasArabic ? "ar" : null;
  return { primary, showingOtherLanguage: primary !== null && primary !== locale };
}
