// A hotel or restaurant we recommend must not be readable on a free page.
//
// The city guides used to name all 224 of them with their descriptions. That is
// the same list a customer pays us to research, given away on a marketing page,
// and it is also why sourcing photography for them was impossible: their own
// photos are not ours to use and a stock photo of "a hotel" is not that hotel.
// Locking the cards answers both at once.
//
// This checks the two things that make it real rather than cosmetic: the names
// are ABSENT from the rendered page rather than blurred over it, and the
// attractions are still there, because Al-Balad is a public place and the
// reason the page is worth reading.

import { readFileSync } from "node:fs";

// Checked against the served HTML as well, which is the stronger evidence and
// the reason to trust these greps: a request for a real Jeddah page came back
// with zero occurrences of any hotel or restaurant name, and 21 of Al-Balad.
const page = readFileSync("app/components/flagship-city-guide-page.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");

/** The body of one section of the component, so a rule is checked where it applies. */
function section(id: string): string {
  const at = page.indexOf(`id="${id}"`);
  if (at < 0) return "";
  const next = page.indexOf("</section>", at);
  return page.slice(at, next < 0 ? page.length : next);
}

const dining = section("dining");
const stay = section("stay");
const places = section("places");

const cases: [string, unknown, unknown][] = [
  // ---- Locked: the name must never be rendered ----
  ["dining renders a locked card", dining.includes("<LockedPlaceCard"), true],
  ["and never the restaurant's name", /ar \? place\.nameAr : place\.nameEn/.test(dining), false],
  ["nor its description", /place\.description/.test(dining), false],
  ["stay renders a locked card", stay.includes("<LockedPlaceCard"), true],
  ["and never the hotel's name", /ar \? place\.nameAr : place\.nameEn/.test(stay), false],
  ["nor its description", /place\.description/.test(stay), false],

  // ---- What a locked card is allowed to show ----
  // Enough to be worth asking about, nothing that identifies the place.
  ["the cuisine still shows", dining.includes("place.cuisineAr"), true],
  ["the tier still shows", stay.includes("place.tier"), true],

  // ---- Attractions stay open ----
  ["attractions still name the place", /place\.nameEn/.test(places), true],
  ["and still describe it", /place\.description/.test(places), true],
  ["and are not locked", places.includes("<LockedPlaceCard"), false],

  // ---- The card is a route to the form ----
  ["a locked card links to the planner", page.includes("href={planHref}"), true],
  ["the note does too", css.includes(".lockedNote"), true],
  ["and the note is a link, not a dead paragraph", page.includes('<Link href={planHref} className="lockedNote">'), true],

  // ---- The width must not encode the name ----
  // The journey page's blur pills leaked names by their width until the width
  // came from position instead. Same mistake was available here.
  ["the name bar width comes from a cycle", page.includes("NAME_WIDTHS[index % NAME_WIDTHS.length]"), true],
  ["the index is the loop position", page.includes("index={i}"), true],
  ["and never anything off the place", /index=\{place/.test(page), false],
  ["the bar is styled, not filled with text", css.includes(".lockedPlaceName{display:block"), true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);
