// Renders the reviewer list for real and checks where the Send now button
// appears.
//
// The rules are easy to state and easy to get subtly wrong: a plan with no
// draft has nothing to send, a plan already sent must not offer it again, and
// a flagged plan must offer it while looking like the exception it is. Reading
// the source proves the condition was written; rendering proves it holds.
//
//   npx tsx scripts/test-send-now-render.tsx

import { renderToStaticMarkup } from "react-dom/server";
import { JourneysList } from "../app/internal/journeys/journeys-list";

const base = {
  customer_name: "Zaki",
  city: "Langkawi",
  status: "draft",
  updated_at: new Date("2026-08-31T10:00:00Z").toISOString(),
};

const rows = [
  // Written, clean, waiting for its window. The ordinary case for this button.
  { ...base, id: "1", reference: "AAA00001", review_state: "clean", drafted_at: "2026-08-31T09:00:00Z", sent_at: null },
  // Written and flagged. The button is offered, and warns.
  { ...base, id: "2", reference: "BBB00002", review_state: "flagged", drafted_at: "2026-08-31T09:00:00Z", sent_at: null },
  // Not written yet. Nothing to send.
  { ...base, id: "3", reference: "CCC00003", review_state: null, drafted_at: null, sent_at: null },
  // Already gone.
  { ...base, id: "4", reference: "DDD00004", status: "published", review_state: "clean", drafted_at: "2026-08-30T09:00:00Z", sent_at: "2026-08-30T12:00:00Z" },
];

const html = renderToStaticMarkup(<JourneysList proposals={rows} locale="en" />);
const arabic = renderToStaticMarkup(<JourneysList proposals={rows} locale="ar" />);

/** The markup for one row, so a button is attributed to the right plan. */
function rowFor(markup: string, reference: string): string {
  const at = markup.indexOf(reference);
  if (at < 0) return "";
  const next = [...markup.matchAll(/Reference /g)].map((m) => m.index ?? 0).find((i) => i > at);
  return markup.slice(at, next ?? markup.length);
}

const hasButton = (markup: string, reference: string) => rowFor(markup, reference).includes("Send now");

const cases: [string, unknown, unknown][] = [
  ["the list renders at all", html.includes("AAA00001"), true],
  ["all four plans are shown", ["AAA00001", "BBB00002", "CCC00003", "DDD00004"].every((r) => html.includes(r)), true],

  ["a written, clean, unsent plan offers Send now", hasButton(html, "AAA00001"), true],
  ["a written but FLAGGED plan offers it too", hasButton(html, "BBB00002"), true],
  ["a plan with no draft does not", hasButton(html, "CCC00003"), false],
  ["a plan already sent does not", hasButton(html, "DDD00004"), false],

  ["exactly two buttons on this list", (html.match(/Send now/g) ?? []).length, 2],
  ["the flagged one is drawn in the warning colour", rowFor(html, "BBB00002").includes("#9a6410"), true],
  ["and the clean one is not", rowFor(html, "AAA00001").includes("#9a6410"), false],

  ["it says what it does, in Arabic too", arabic.includes("أرسلها الآن"), true],
  ["and only on the same two rows", (arabic.match(/أرسلها الآن/g) ?? []).length, 2],

  ["deleting is still offered everywhere", (html.match(/aria-label="Delete/g) ?? []).length, 4],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);
