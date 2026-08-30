// Every status we write must be one the database will accept.
//
// The proposals table has `check (status in ('draft', 'published'))`. A change
// that opened the row at submit time invented a third value, "received", and
// every insert failed on the constraint. Nothing broke loudly: the insert is
// deliberately non-fatal so a customer's request is never refused because a
// status page could not be prepared, so it logged and carried on, and the
// tracking link 404'd exactly as it had before the fix.
//
// This reads the constraint out of the migration and the values out of the
// code, so the two cannot drift again.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS = "supabase/migrations";
const CODE = [
  "app/api/journeys/route.ts",
  "app/draft-guide.ts",
  "app/api/cron/release-plans/route.ts",
  "app/internal/journeys/actions.ts",
];

/** The values the schema permits, read from the create table statement. */
function allowedStatuses(): string[] {
  for (const file of readdirSync(MIGRATIONS)) {
    const sql = readFileSync(join(MIGRATIONS, file), "utf8");
    const match = sql.match(/status\s+text[^,]*check\s*\(\s*status\s+in\s*\(([^)]*)\)/i);
    if (match) return [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  }
  return [];
}

/** Every status literal the code assigns to a proposal row. */
function writtenStatuses(): { file: string; value: string }[] {
  const out: { file: string; value: string }[] = [];
  for (const file of CODE) {
    let source: string;
    try { source = readFileSync(file, "utf8"); } catch { continue; }
    for (const m of source.matchAll(/status:\s*"([a-z_]+)"/g)) out.push({ file, value: m[1] });
  }
  return out;
}

const allowed = allowedStatuses();
const written = writtenStatuses();
const offenders = written.filter((w) => !allowed.includes(w.value));

const cases: [string, unknown, unknown][] = [
  ["the schema's allowed statuses are readable", allowed.length > 0, true],
  ["and are the two we expect", allowed.sort().join(","), "draft,published"],
  ["the code writes at least one status", written.length > 0, true],
  ["every status the code writes is permitted", offenders.map((o) => `${o.file}:${o.value}`).join(" | "), ""],
];

let pass = 0;
for (const [name, got, want] of cases) {
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
}
console.log(`\n${pass}/${cases.length} passed  ·  allowed: ${allowed.join(", ")}  ·  ${written.length} write site(s)`);
if (pass !== cases.length) process.exit(1);
