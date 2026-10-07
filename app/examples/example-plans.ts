// The plans a stranger can read before asking for their own.
//
// 7 Oct 2026: four days of ads and a week of videos brought people to the
// request form and nobody sent it. One reason we could do something about is
// that nobody had seen what they would get: the site described a plan, it
// never showed one. These are whole plans, exactly as a customer receives
// them.
//
// Every one is a plan the team requested for itself through the public form
// (the list is marketing's team-plans.md). Never a customer's: a customer's
// plan carries their trip, their dates and their budget, and is theirs.
//
// Habib, the same day, on where these may appear: "make sure only people with
// links can see them, not available to the general public on our site". So
// nothing on the site links here, the pages ask search engines not to index
// them, and they are deliberately absent from sitemap.ts. They are also
// absent from robots.ts: a Disallow line there would publish the address to
// anyone who reads the file, and stop a crawler from ever seeing the noindex.

export type ExamplePlan = {
  slug: string;
  /** The team plan this page shows. */
  reference: string;
  /** As the request form knows them, so "one like it" opens with the place chosen. */
  country: string;
  city: string;
  fromDate: string;
  toDate: string;
  ar: { city: string; forWhom: string; card: string };
  en: { city: string; forWhom: string; card: string };
};

/** The name every team plan was requested under; a page refuses any plan without it. */
export const TEAM_PLAN_NAME = "فريق ميموريز";

/** When these were written, said on each page because prices and opening hours move. */
export const EXAMPLES_WRITTEN = { ar: "أكتوبر 2026", en: "October 2026" };

// Which of our plans is shown is a judgement, not a list of everything we
// have. Two were taken out within the hour of going live, on the Head of
// Marketing's reading: the first Riyadh plan (53D44626) said the Riyadh Season
// dates were not announced, which stopped being true, so Riyadh is the plan
// written after that was fixed; and the Tbilisi plan for four friends
// (C7796491) spends a day in a wine town and eats in a tavern known for its
// house wine, which is right for the four who asked and wrong as the first
// thing a family reads under our name. A plan that only warns where alcohol
// and pork turn up, as the Istanbul, Bangkok and Kuala Lumpur ones do, stays:
// that warning is the product.
export const examplePlans: ExamplePlan[] = [
  { slug: "jeddah", reference: "4FEE5D9B", country: "saudi-arabia", city: "jeddah", fromDate: "2026-11-20", toDate: "2026-11-23", ar: { city: "جدة", forWhom: "لعائلة من خمسة", card: "عائلة من 5" }, en: { city: "Jeddah", forWhom: "for a family of five", card: "Family of 5" } },
  { slug: "alula", reference: "C277961E", country: "saudi-arabia", city: "alula", fromDate: "2026-11-12", toDate: "2026-11-16", ar: { city: "العلا", forWhom: "لعائلة من أربعة", card: "عائلة من 4" }, en: { city: "AlUla", forWhom: "for a family of four", card: "Family of 4" } },
  { slug: "riyadh", reference: "5349DF8A", country: "saudi-arabia", city: "riyadh", fromDate: "2026-10-29", toDate: "2026-11-01", ar: { city: "الرياض", forWhom: "لعائلة من أربعة في موسم الرياض", card: "عائلة من 4" }, en: { city: "Riyadh", forWhom: "for a family of four in Riyadh Season", card: "Family of 4" } },
  { slug: "istanbul", reference: "6D2C248E", country: "turkey", city: "istanbul", fromDate: "2026-12-18", toDate: "2026-12-23", ar: { city: "اسطنبول", forWhom: "لعائلة من أربعة", card: "عائلة من 4" }, en: { city: "Istanbul", forWhom: "for a family of four", card: "Family of 4" } },
  { slug: "bangkok", reference: "5F30E881", country: "thailand", city: "bangkok", fromDate: "2026-12-14", toDate: "2026-12-19", ar: { city: "بانكوك", forWhom: "لشخصين", card: "شخصين" }, en: { city: "Bangkok", forWhom: "for two", card: "Couple" } },
  { slug: "kuala-lumpur", reference: "2F4DD370", country: "malaysia", city: "kuala-lumpur", fromDate: "2027-01-10", toDate: "2027-01-15", ar: { city: "كوالالمبور", forWhom: "لعروسين", card: "شهر عسل" }, en: { city: "Kuala Lumpur", forWhom: "for a honeymoon", card: "Honeymoon" } },
];

/** Days of the trip, counting the day of arrival and the day of leaving. */
export function exampleDays(plan: ExamplePlan): number {
  return Math.round((Date.parse(`${plan.toDate}T00:00:00Z`) - Date.parse(`${plan.fromDate}T00:00:00Z`)) / 86_400_000) + 1;
}

/** The tag a link arrived with, kept only if it is one of ours in shape. */
export function exampleSource(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && /^[a-z0-9-]{1,40}$/i.test(value) ? value : "";
}

function withSource(path: string, source: string, extra = ""): string {
  const query = [extra, source ? `source=${source}` : ""].filter(Boolean).join("&");
  return query ? `${path}?${query}` : path;
}

/** The examples page, or one example, carrying the visitor's tag along. */
export function exampleHref(locale: "en" | "ar", slug: string | null, source: string): string {
  return withSource(`${locale === "ar" ? "/ar" : ""}/examples${slug ? `/${slug}` : ""}`, source);
}

/**
 * The request form, with the example's destination already chosen.
 *
 * The tag the visitor arrived with is passed on untouched, so somebody who
 * came from a reply on X is still counted as that on the form. Without one
 * the tag is "example", which opens the three-question form like any other
 * link we hand out (see the request page).
 */
export function requestHref(locale: "en" | "ar", plan: ExamplePlan | null, source: string): string {
  return withSource(`${locale === "ar" ? "/ar" : ""}/design-your-journey`, source || "example", plan ? `country=${plan.country}&city=${plan.city}` : "");
}
