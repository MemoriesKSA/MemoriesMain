// Whether a plan reads as a scannable document or a wall.
//
// The owner's father read a real Jeddah plan and said it had too many
// unnecessary words and needed organising. Both are true and both are
// measurable, which matters more than it sounds: "make it tighter" is an
// instruction nobody can check, and a prompt change that feels better and is
// not is the easiest kind of self-deception here.
//
// So this scores what he was actually reacting to. It does not judge prose -
// no tool can - it counts the shape underneath it.
//
//   npx tsx --env-file=.env.local scripts/draft-shape.ts F1A2FD7A
//   npx tsx scripts/draft-shape.ts --file some-draft.txt

import { readFileSync } from "node:fs";
import { createSupabaseAdminClient } from "../app/supabase-admin";

// The same rule the renderer uses to decide a line is a list item rather than
// a paragraph, copied deliberately: this measures what the customer will see,
// so it has to agree with itinerary-view.tsx, not with a tidier idea of it.
const LABELLED_ITEM = /^[^:\n]{2,34}:\s+\S/;
const DAY_HEADING = /^(?:day|اليوم)\s*[\d٠-٩]+/i;
/** A short line with no full stop, sitting alone: a heading. */
const looksLikeHeading = (line: string) => line.length > 0 && line.length <= 46 && !/[.!?،؟]$/.test(line) && !LABELLED_ITEM.test(line);

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

function report(label: string, text: string) {
  if (!text.trim()) {
    console.log(`\n${label}: empty`);
    return;
  }
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const overview = lines.slice(0, lines.findIndex((l) => DAY_HEADING.test(l)) >= 0 ? lines.findIndex((l) => DAY_HEADING.test(l)) : lines.length);

  const headings = lines.filter(looksLikeHeading);
  const labelled = lines.filter((l) => LABELLED_ITEM.test(l));
  const prose = lines.filter((l) => !looksLikeHeading(l) && !LABELLED_ITEM.test(l));
  const longest = prose.reduce((a, b) => (words(b) > words(a) ? b : a), "");
  const over40 = prose.filter((l) => words(l) > 40);

  console.log(`\n${label}`);
  console.log(`  ${words(text)} words in ${lines.length} lines`);
  console.log(`  overview is ${words(overview.join(" "))} words before the first day`);
  console.log(`  ${headings.length} headings, ${labelled.length} labelled lines, ${prose.length} prose lines`);
  console.log(`  prose lines over 40 words: ${over40.length}${over40.length ? ` (worst is ${words(longest)})` : ""}`);
  if (longest && words(longest) > 40) console.log(`    "${longest.slice(0, 110)}..."`);

  // A section that is one heading and then five paragraphs is the shape he
  // objected to, whatever the words inside it say.
  const perHeading = headings.length ? Math.round(prose.length / headings.length) : prose.length;
  console.log(`  ~${perHeading} prose lines per heading`);

  const verdicts: [string, boolean][] = [
    ["overview under 500 words", words(overview.join(" ")) <= 500],
    ["no prose line over 40 words", over40.length === 0],
    ["at least one labelled line per heading", headings.length > 0 && labelled.length >= headings.length],
    ["under 4 prose lines per heading", perHeading < 4],
  ];
  for (const [what, ok] of verdicts) console.log(`  ${ok ? "OK  " : "MISS"} ${what}`);
}

async function main() {
  const arg = process.argv[2] ?? "";
  if (arg === "--file") {
    report(process.argv[3] ?? "file", readFileSync(process.argv[3] ?? "", "utf8"));
    return;
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("proposals")
    .select("reference, city, itinerary_en, itinerary_ar")
    .eq("reference", arg.toUpperCase())
    .maybeSingle();

  if (!data) {
    console.error(`${arg}: no such plan`);
    process.exit(1);
  }
  console.log(`${data.reference}  ${data.city}`);
  report("ENGLISH", String(data.itinerary_en ?? ""));
  report("ARABIC", String(data.itinerary_ar ?? ""));
}

main().then(() => process.exit(0));
