import { cookies } from "next/headers";
import { REVIEWER_LOCALE_COOKIE, type ReviewerLocale } from "./i18n";

export async function getReviewerLocale(): Promise<ReviewerLocale> {
  const store = await cookies();
  return store.get(REVIEWER_LOCALE_COOKIE)?.value === "ar" ? "ar" : "en";
}
