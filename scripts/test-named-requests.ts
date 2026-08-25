// A customer named one thing on the whole form, and got told we had nothing.
//
//   "our research for this trip doesn't cover Lapita, so we have nothing
//    verified to tell you about its rooms, rates or availability"
//
// True of the cache and useless to them. So a named request now buys its own
// search at draft time, and only a named request does: the rest of the city
// still comes from research bought once and reused, because that part does not
// change per customer.
//
// This tests the gate in front of that spend. A pre-push review found the whole
// defect lived here: the extraction model is told to answer NONE, the filter
// tested for exactly "none", and the model writes "None." So a punctuated
// refusal survived as a name, bought a six-search Opus call, and arrived at the
// drafting pass inside a block headed THE CUSTOMER'S OWN NAMED REQUESTS, which
// the brief tells the drafter to address directly. A customer who named nothing
// could be apologised to about a place they never mentioned.
//
// It was invisible because nothing could reach those lines without spending
// money. Now the parsing is a pure function, so this costs nothing to check.

import { namesFromExtractionReply } from "../app/draft-guide";

// The shapes a refusal actually arrives in.
const refusals = [
  "NONE",
  "None.",
  "none",
  "NONE.",
  "  none  ",
  "- NONE",
  "1. None",
  "No specific places were named.",
  "Nothing was named by the customer.",
  "The customer did not name anything specific.",
  "They didn't name any specific places.",
  "N/A",
  "There are no named requests.",
];

// And the shapes a real answer arrives in.
const real = namesFromExtractionReply("Lapita Resort\nAtlantis, The Palm\nSixt");
const bulleted = namesFromExtractionReply("- Lapita Resort\n- Atlantis, The Palm");
const numbered = namesFromExtractionReply("1. Lapita Resort\n2. Museum of the Future");
const chatty = namesFromExtractionReply("Named requests:\n\nLapita Resort\n\nThat's the only one.");
const punctuated = namesFromExtractionReply("Lapita Resort.\nBurj Khalifa,");
const overLong = namesFromExtractionReply("One\nTwo Resort\nThree Hotel\nFour Palace\nFive Tower");
const duplicated = namesFromExtractionReply("Atlantis, The Palm\nAtlantis, The Palm\nSixt");

const cases: [string, unknown, unknown][] = [
  // The spend gate. Every one of these used to buy a web search.
  ...refusals.map((r): [string, unknown, unknown] => [
    `a refusal written "${r.trim()}" buys nothing`, namesFromExtractionReply(r).length, 0,
  ]),

  // Real names still come through, whatever the model dresses them in.
  ["a plain list parses, capped at two", real.length, 2],
  ["and keeps the name exactly", real[0], "Lapita Resort"],
  ["a name containing a comma survives whole", real[1], "Atlantis, The Palm"],
  ["bullets are stripped", bulleted[0], "Lapita Resort"],
  ["numbering is stripped", numbered[1], "Museum of the Future"],
  ["a trailing full stop is stripped", punctuated[0], "Lapita Resort"],
  ["and a trailing comma", punctuated[1], "Burj Khalifa"],

  // A heading is the model talking, not a place. It must not be searched.
  ["a heading line is refused", chatty.includes("Named requests"), false],
  ["while the real name beside it survives", chatty.includes("Lapita Resort"), true],

  // Cost ceilings. Somebody who lists ten things wrote a wish list.
  // Two, not three. Every extra name is another search on the critical path
  // of a function that already times out, and the third thing somebody
  // lists is nearly always the least important thing they typed.
  ["never more than two are researched", overLong.length, 2],
  ["a name repeated is researched once", duplicated.length, 2],

  // Nothing in, nothing out, no crash.
  ["an empty reply yields nothing", namesFromExtractionReply("").length, 0],
  ["blank lines yield nothing", namesFromExtractionReply("\n\n  \n").length, 0],
  ["a two-character line is noise, not a name", namesFromExtractionReply("ok").length, 0],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed  ·  ${refusals.length} refusal shapes refused`);
if (pass !== cases.length) process.exit(1);
