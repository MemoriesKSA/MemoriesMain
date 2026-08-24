// Memory answered "where is the feedback page?" with directions.
//
// It said the page was "in the footer under Company", which is navigation
// homework rather than an answer. It had exactly one thing it could make
// tappable, the planner button, and every other page arrived as prose.
//
// So the same trick now covers every page: Memory writes the label in square
// brackets and the chat turns it into a link. The two halves have to agree on
// the exact label, and they live in different files, so this checks they do.
//
// Tested here rather than by driving the chat in a browser: the reveal is a
// timed word-by-word animation over a streamed reply, which makes a UI check
// slow and flaky, while the part that can actually be wrong is the label
// matching and the tokenizer holding a bracket together.

import { CONCIERGE_PAGES, conciergePageHref, conciergePageList, tokenizeReply } from "../app/concierge-pages";

const reply = "You'll find it in the footer under Company.\n\n[Tell us what you think]";
const tokens = tokenizeReply(reply);
const bracketTokens = tokens.filter((t) => t.startsWith("[") && t.endsWith("]"));

// A bracket split across the reveal would flash half a marker at the reader.
const mid = tokenizeReply("Read the [Privacy Policy] before you book anything else.");
const two = tokenizeReply("[Destinations] and [Study Abroad]");

const cases: [string, unknown, unknown][] = [
  // The label the model writes has to resolve to a real page.
  ["the feedback label links", conciergePageHref("Tell us what you think", false), "/feedback"],
  ["and in Arabic", conciergePageHref("قل لنا رأيك", true), "/ar/feedback"],
  ["the privacy policy links", conciergePageHref("Privacy Policy", false), "/privacy"],
  ["know before you go links", conciergePageHref("Know before you go", false), "/know-before-you-go"],
  ["destinations links", conciergePageHref("Destinations", false), "/destinations"],
  ["Arabic pages get the /ar prefix", conciergePageHref("الوجهات", true), "/ar/destinations"],
  ["matching ignores case, models are inconsistent about it", conciergePageHref("privacy policy", false), "/privacy"],
  ["and surrounding whitespace", conciergePageHref("  Destinations  ", false), "/destinations"],

  // Failing safe. A label we do not know renders as plain text, never as a
  // link to nowhere.
  ["an unknown page does not link", conciergePageHref("Refund Portal", false), null],
  ["an English label does not resolve in Arabic", conciergePageHref("Destinations", true), null],
  ["nor an Arabic one in English", conciergePageHref("الوجهات", false), null],
  ["an empty label does not link", conciergePageHref("", false), null],

  // The tokenizer keeps a marker whole through the word-by-word reveal.
  ["a trailing marker survives tokenizing", bracketTokens.length, 1],
  ["intact, not split across tokens", bracketTokens[0], "[Tell us what you think]"],
  ["a marker mid-sentence is held together too", mid.includes("[Privacy Policy]"), true],
  ["and the words around it still tokenize", mid.length > 3, true],
  ["two markers both survive", two.filter((t) => t.startsWith("[")).length, 2],
  ["nothing is lost in the process", tokenizeReply(reply).join(""), reply],
  ["and text with no marker is untouched", tokenizeReply("Just a sentence.").join(""), "Just a sentence."],

  // The prompt hands the model this list, so it can only offer real pages.
  ["every page in the list resolves", CONCIERGE_PAGES.every((p) => conciergePageHref(p.en, false) !== null), true],
  ["in Arabic too", CONCIERGE_PAGES.every((p) => conciergePageHref(p.ar, true) !== null), true],
  ["the list shown to the model is bracketed", conciergePageList(false).startsWith("["), true],
  ["and names the feedback page", conciergePageList(false).includes("[Tell us what you think]"), true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed  ·  ${CONCIERGE_PAGES.length} pages Memory can link`);
if (pass !== cases.length) process.exit(1);
