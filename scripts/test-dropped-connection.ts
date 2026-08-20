// A Malaysia draft was lost to one dropped socket: ECONNRESET twenty-five
// minutes in, after the research had already been paid for. The SDK retries
// a request that fails before the response starts, but a stream that dies
// mid-body is past that point, so finalMessage() just rejects.
//
// The retry that now covers it has to tell two failures apart: the
// connection going away, which is worth one more attempt, and the model
// having actually answered badly, which is not - asking again would produce
// the same answer at twice the price.
//
//   npx tsx scripts/test-dropped-connection.ts

import { isDroppedConnection } from "../app/draft-guide";

// The real one, rebuilt from the Malaysia failure: an error reading
// "terminated", caused by a TypeError, caused by the ECONNRESET itself.
const malaysiaFailure = Object.assign(new Error("terminated"), {
  cause: Object.assign(new TypeError("terminated"), {
    cause: Object.assign(new Error("read ECONNRESET"), { code: "ECONNRESET", errno: -4077, syscall: "read" }),
  }),
});

const truncation = new Error("The English draft hit the token ceiling and came back truncated, so it was discarded rather than saved half-finished.");
const refusal = new Error("Request was rejected: content policy");
const badKey = Object.assign(new Error("401 Unauthorized"), { status: 401 });

// A cycle in the cause chain must not hang the walk.
const looping: { message: string; cause?: unknown } = { message: "outer" };
looping.cause = looping;

const cases: [string, unknown, unknown][] = [
  ["the Malaysia failure is recognised", isDroppedConnection(malaysiaFailure), true],
  ["a bare ECONNRESET is recognised", isDroppedConnection(Object.assign(new Error("read ECONNRESET"), { code: "ECONNRESET" })), true],
  ["a socket hang up is recognised", isDroppedConnection(new Error("socket hang up")), true],
  ["a read timeout is recognised", isDroppedConnection(Object.assign(new Error("request failed"), { code: "ETIMEDOUT" })), true],

  // The half that matters more: these must NOT be retried.
  ["a truncated draft is not retried", isDroppedConnection(truncation), false],
  ["a refusal is not retried", isDroppedConnection(refusal), false],
  ["a bad API key is not retried", isDroppedConnection(badKey), false],
  ["an ordinary bug is not retried", isDroppedConnection(new TypeError("guide.attractions is not iterable")), false],

  ["null is safe", isDroppedConnection(null), false],
  ["a string is safe", isDroppedConnection("terminated"), false],
  ["a self-referencing cause chain terminates", isDroppedConnection(looping), false],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed`);
if (pass !== cases.length) process.exit(1);
