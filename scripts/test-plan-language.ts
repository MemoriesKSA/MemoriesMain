// A customer must never open their plan and find a blank page.
//
// The journey page shows one language now instead of printing both in full.
// That is right for the common case and it creates one way to fail badly: a
// plan written in English only, opened at a /ar link, which is one tap of the
// language switch away from every customer who has one.
//
// The rule is "its own language, unless that half does not exist". These are
// the six combinations that rule has to survive.

import { primaryPlanLanguage } from "../app/journey/plan-language";

const choice = (locale: "en" | "ar", en: boolean, ar: boolean) => {
  const c = primaryPlanLanguage(locale, en, ar);
  return `${c.primary ?? "none"}${c.showingOtherLanguage ? " (labelled)" : ""}`;
};

const cases: [string, unknown, unknown][] = [
  // Both halves exist: each page shows its own language and says nothing.
  ["an English reader gets English", choice("en", true, true), "en"],
  ["an Arabic reader gets Arabic", choice("ar", true, true), "ar"],

  // English-only plan. The /ar page is one tap away and must not be blank.
  ["English-only, read in English", choice("en", true, false), "en"],
  ["English-only, opened at an Arabic link", choice("ar", true, false), "en (labelled)"],

  // The mirror, for a plan whose English half failed to store.
  ["Arabic-only, read in Arabic", choice("ar", false, true), "ar"],
  ["Arabic-only, opened at an English link", choice("en", false, true), "ar (labelled)"],

  // Nothing written yet: the caller renders neither section rather than an
  // empty one, and the page still has its header, price and unlock panel.
  ["a plan with no text at all", choice("en", false, false), "none"],
  ["in either language", choice("ar", false, false), "none"],

  // The label is the honest part: it only appears when we fell back.
  ["no label when the reader got their own language", primaryPlanLanguage("ar", true, true).showingOtherLanguage, false],
  ["label when they did not", primaryPlanLanguage("ar", true, false).showingOtherLanguage, true],
  ["and never on an empty plan", primaryPlanLanguage("ar", false, false).showingOtherLanguage, false],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);
