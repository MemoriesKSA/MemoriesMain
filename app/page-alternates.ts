import type { Metadata } from "next";

// Each public page names its own canonical URL and its language twin.
// These used to sit in the root and Arabic layouts, so every page inherited
// canonical "/" (or "/ar") and Google read the whole site as copies of the
// homepage. A page left without this simply has no canonical, which is safe;
// a wrong one is not.
export function pageAlternates(path: string, locale: "en" | "ar"): Metadata["alternates"] {
  const en = path;
  const ar = path === "/" ? "/ar" : `/ar${path}`;
  return { canonical: locale === "ar" ? ar : en, languages: { en, ar, "x-default": en } };
}
