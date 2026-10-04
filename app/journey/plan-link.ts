// Which language a customer's plan link opens in.
//
// 4 Oct 2026: a customer asked for his plan on the Arabic site, and the "your
// journey is ready" email sent him to the English page. The Arabic version was
// one tap away on the language switch and he did not find it. The email could
// not have known better: it is built hours later from the plan's row, and the
// row never recorded which language the customer used.
//
// The language now travels with the plan's own link. A plan token is 48
// characters of hex; one minted for an Arabic customer starts with "ar"
// instead, and "r" is not a hex digit, so no ordinary token can be mistaken
// for one. Everything that builds a link from the row (the ready email, the
// follow-up email, the reviewer's copy button) reads it back through planUrl,
// with no extra column and nothing to keep in step.
//
// It only chooses which page the LINK opens. Both /journey/<token> and
// /ar/journey/<token> still serve any plan, so the language switch in the
// header works in both directions, and tokens minted before this change keep
// opening in English exactly as they did.

import { newFollowToken } from "../follow/release";

export type PlanLocale = "en" | "ar";

const ARABIC_MARK = "ar";

/** A new plan token for a customer who used the site in this language. */
export function newPlanToken(locale: PlanLocale): string {
  const token = newFollowToken();
  return locale === "ar" ? ARABIC_MARK + token.slice(ARABIC_MARK.length) : token;
}

/** The language a plan's link should open in. */
export function planTokenLocale(token: string): PlanLocale {
  return token.startsWith(ARABIC_MARK) ? "ar" : "en";
}

/** The customer's link to their plan, in their own language. */
export function planUrl(siteUrl: string, token: string): string {
  return `${siteUrl.replace(/\/$/, "")}${planTokenLocale(token) === "ar" ? "/ar" : ""}/journey/${token}`;
}
