// The reviewer's "Send now" button, checked as source.
//
// The action itself talks to the database and to Resend, so it cannot be run
// here without emailing somebody. What CAN be checked, and is worth checking,
// is the set of rules it was written to keep - because every one of them is a
// rule the release job already learned the hard way:
//
//   - stamp sent_at BEFORE the email, with a null guard, so two reviewers
//     pressing at once produces one send and one refusal, never two emails
//   - refuse a plan with no draft, rather than emailing an empty one
//   - refuse a plan already sent
//   - report a failed email as a failure, never as success
//   - deliberately IGNORE release_at and review_state, which is the whole
//     point of the button
//
// A test that reads code is a weak test. It is the right one here: the failure
// this guards against is somebody later "simplifying" the claim-then-send into
// a send-then-claim, which no unit test would catch either.

import { readFileSync } from "node:fs";

const actions = readFileSync("app/internal/journeys/actions.ts", "utf8");
const list = readFileSync("app/internal/journeys/journeys-list.tsx", "utf8");
const button = readFileSync("app/internal/journeys/send-now-button.tsx", "utf8");
const cron = readFileSync("app/api/cron/release-plans/route.ts", "utf8");

/** The body of one exported action, so a rule is checked where it applies. */
function body(source: string, name: string): string {
  const at = source.indexOf(`export async function ${name}(`);
  if (at < 0) return "";
  const next = source.indexOf("\nexport ", at + 1);
  return source.slice(at, next < 0 ? source.length : next);
}

const sendNow = body(actions, "sendPlanNow");
const publish = body(actions, "publishProposal");

/** Does the claim happen before the email in this text? */
const claimsBeforeSending = (text: string) => {
  const claim = text.indexOf('sent_at: new Date().toISOString()');
  const send = text.indexOf("sendProposalReadyEmail");
  return claim >= 0 && send >= 0 && claim < send;
};

const cases: [string, unknown, unknown][] = [
  // ---- The action exists and is reachable ----
  ["the action exists", sendNow.length > 0, true],
  ["it is a server action file", actions.startsWith('"use server"'), true],
  ["it requires a signed-in reviewer", sendNow.includes("await requireReviewer()"), true],
  ["the list can call it", list.includes("sendPlanNow.bind(null, p.id)"), true],

  // ---- The rules the release job learned the hard way ----
  ["it stamps sent_at before it emails", claimsBeforeSending(sendNow), true],
  ["the claim is guarded on sent_at being null", /\.is\("sent_at", null\)/.test(sendNow), true],
  ["a lost race is reported, not ignored", sendNow.includes("claimed?.length"), true],
  ["a plan with no draft is refused", sendNow.includes("!proposal.itinerary_en"), true],
  ["a plan already sent is refused", sendNow.includes("proposal.sent_at"), true],
  ["it publishes as it sends, so the link works", sendNow.includes('status: "published"'), true],
  ["a failed email is reported as a failure", /catch[\s\S]*email failed/i.test(sendNow), true],

  // ---- What it deliberately does NOT check ----
  // The cron refuses both of these. This button exists precisely to overrule
  // them, with a person answering for it.
  ["it does not wait for release_at", sendNow.includes("release_at"), false],
  ["it does not require a clean verdict", sendNow.includes('review_state'), false],
  ["while the cron still requires both", cron.includes('.eq("review_state", "clean")') && cron.includes('.lte("release_at", now)'), true],

  // ---- The button only appears where it can work ----
  ["offered only when a draft exists", list.includes("!!p.drafted_at"), true],
  ["and only when nothing has been sent", list.includes("!p.sent_at"), true],
  ["a flagged plan is marked as such", list.includes('p.review_state === "flagged"'), true],
  ["and gets its own confirmation wording", list.includes("t.sendNowConfirmFlagged(label)"), true],

  // ---- It asks first, because an email cannot be recalled ----
  ["the button confirms before acting", button.includes("window.confirm(confirmText)"), true],
  ["and disables itself while sending", button.includes("disabled={pending}"), true],

  // ---- The bug found alongside it ----
  // Publishing by hand never stamped sent_at, so the customer's tracking page
  // said we were still writing while the plan sat in their inbox.
  ["publishing stamps sent_at too", publish.includes("sent_at"), true],
  ["but never restates it on a re-publish", publish.includes("existing?.sent_at"), true],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);
