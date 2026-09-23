// Pushes a hand-written research file into the database.
//
// curated-research/<city>.txt is the source of truth for the rows flagged
// curated = true, but editing a file there changes nothing on its own: the
// drafting pass reads city_research_cache, never the repo. This is the step
// that connects them, and the reason the README says a file edit is only half
// the job.
//
//   npx tsx --env-file=.env.local scripts/upload-curated-research.ts riyadh
//   npx tsx --env-file=.env.local scripts/upload-curated-research.ts riyadh --dry-run
//   npx tsx --env-file=.env.local scripts/upload-curated-research.ts   (every file)
//
// It prints what changed and keeps curated = true, which is what stops the
// automated 30-day pass from overwriting a human's work.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const DIR = "curated-research";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const wanted = args.filter((a) => !a.startsWith("--"));

const slugs = wanted.length
  ? wanted
  : readdirSync(DIR)
      .filter((f) => f.endsWith(".txt"))
      .map((f) => f.replace(/\.txt$/, ""));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

/** The first line of a research note carries the scope version the drafting prompt expects. */
function scopeHeader(existing: string | null | undefined): string | null {
  const first = (existing ?? "").split("\n")[0] ?? "";
  return first.startsWith("#scope:") ? first : null;
}

async function main() {
  let failures = 0;

  for (const slug of slugs) {
    const file = join(DIR, `${slug}.txt`);
    let notes: string;
    try {
      notes = readFileSync(file, "utf8").replace(/\r\n/g, "\n").trim();
    } catch {
      console.log(`${slug}: no file at ${file}`);
      failures++;
      continue;
    }

    const { data: existing, error: readError } = await supabase
      .from("city_research_cache")
      .select("research_notes, curated, updated_at")
      .eq("city_slug", slug)
      .maybeSingle();
    if (readError) {
      console.log(`${slug}: could not read the current row (${readError.message})`);
      failures++;
      continue;
    }

    // Keep whatever scope marker the stored note already had. Dropping it would
    // make the drafting pass treat a complete note as one from an older scope.
    const header = scopeHeader(existing?.research_notes);
    const body = header ? `${header}\n${notes}` : notes;

    if (existing?.research_notes?.trim() === body.trim()) {
      console.log(`${slug}: unchanged (${body.length} chars, curated=${existing?.curated})`);
      continue;
    }

    const was = existing?.research_notes?.length ?? 0;
    if (dryRun) {
      console.log(`${slug}: would update ${was} -> ${body.length} chars (dry run)`);
      continue;
    }

    const { error } = await supabase
      .from("city_research_cache")
      .upsert({ city_slug: slug, research_notes: body, curated: true, updated_at: new Date().toISOString() }, { onConflict: "city_slug" });
    if (error) {
      console.log(`${slug}: upload failed (${error.message})`);
      failures++;
      continue;
    }
    console.log(`${slug}: updated ${was} -> ${body.length} chars, curated=true`);
  }

  if (failures) process.exit(1);
}

main();
