"use server";

import { cookies } from "next/headers";
import { REVIEWER_LOCALE_COOKIE } from "./i18n";

export async function setReviewerLocale(locale: "en" | "ar") {
  const store = await cookies();
  store.set(REVIEWER_LOCALE_COOKIE, locale === "ar" ? "ar" : "en", {
    path: "/internal",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
