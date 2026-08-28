// A customer watching their request should never be told something untrue.
//
// The follow page derives everything from four timestamps, so this pins the
// two rules that matter: the last stage flips on sent_at and nothing else, and
// the bar never fills before the plan has actually gone. Everything in between
// is pacing, and pacing is allowed to be approximate.

import { followStages, currentStage, expectedDelivery, progress, type FollowInput } from "../app/follow/stages";

const t = (minutes: number) => new Date(Date.UTC(2026, 7, 27, 10, 0, 0) + minutes * 60_000);
const submittedAt = t(0);

const base: Omit<FollowInput, "now"> = {
  submittedAt,
  draftedAt: null,
  releaseAt: t(480), // eight hours
  sentAt: null,
  needsReview: false,
};

const at = (minutes: number, over: Partial<FollowInput> = {}): FollowInput => ({ ...base, ...over, now: t(minutes) });

const stageAt = (minutes: number, over: Partial<FollowInput> = {}) => currentStage(followStages(at(minutes, over))).key;
const statesAt = (minutes: number, over: Partial<FollowInput> = {}) =>
  Object.fromEntries(followStages(at(minutes, over)).map((s) => [s.key, s.state]));

const drafted = { draftedAt: t(15) };
const sent = { draftedAt: t(15), sentAt: t(482) };

const cases: [string, unknown, unknown][] = [
  // Pacing while the pipeline is genuinely running.
  // "Received" is instantaneous and true the moment they submit, so it is
  // already done and research is already the live stage. A first stage that
  // lingers would be pretending the submission took time.
  ["receiving is done immediately, because it is", statesAt(0).received, "done"],
  ["so research is live from the first paint", stageAt(0), "researching"],
  ["research is running a minute later", stageAt(1), "researching"],
  ["writing is the long middle", stageAt(5), "writing"],
  ["writing is still the stage at eight minutes", stageAt(8), "writing"],
  ["the Arabic pass comes after it", stageAt(10), "arabic"],
  ["and the checks come last of the writing steps", stageAt(13), "checking"],

  // Writing genuinely finished.
  ["once drafted, every writing stage is done", statesAt(20, drafted).writing, "done"],
  ["and the request sits in its release window", stageAt(20, drafted), "final"],
  ["which is still true seven hours later", stageAt(400, drafted), "final"],
  ["the sent stage has not happened", statesAt(400, drafted).sent, "waiting"],

  // The rule that matters most.
  ["nothing claims sent until it was sent", followStages(at(479, drafted)).at(-1)?.state, "waiting"],
  ["and when it is sent, it says so", statesAt(500, sent).sent, "done"],
  ["with the real time, not the scheduled one", followStages(at(500, sent)).at(-1)?.at?.toISOString(), t(482).toISOString()],
  ["every earlier stage is done too", followStages(at(500, sent)).every((s) => s.state === "done"), true],

  // The bar.
  ["the bar never starts empty", progress(at(0)) > 0, true],
  ["it moves through the window", progress(at(240, drafted)) > progress(at(60, drafted)), true],
  ["it never fills before sending", progress(at(479, drafted)) < 1, true],
  ["even long past the release time", progress(at(600, drafted)) < 1, true],
  ["and it is full once sent", progress(at(500, sent)), 1],

  // Delivery time.
  ["the promised time is the release window", expectedDelivery(at(30, drafted))?.toISOString(), t(480).toISOString()],
  ["once sent, it is when it actually went", expectedDelivery(at(500, sent))?.toISOString(), t(482).toISOString()],
  ["with no schedule there is no promise", expectedDelivery(at(30, { releaseAt: null })), null],
  ["and the bar still moves without one", progress(at(5, { releaseAt: null })) > 0.02, true],

  // Priority is just a shorter window, so nothing special is needed for it.
  ["a priority window reaches final sooner", stageAt(20, { draftedAt: t(15), releaseAt: t(60) }), "final"],
  ["and its promised time is the shorter one", expectedDelivery(at(20, { draftedAt: t(15), releaseAt: t(60) }))?.toISOString(), t(60).toISOString()],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);
