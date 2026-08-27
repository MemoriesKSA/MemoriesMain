// What a stored draft would actually link, and where a link would be wrong.
//
// Written after a Riyadh plan linked the rental company National inside the
// word "international", twice in one sentence, and an Arabic plan linked Deira
// inside "جديرة". Both were only visible by reading the rendered page, which
// is a poor way to catch a class of bug that repeats.
//
// Linking happens at render time, not when the draft is written, so this also
// answers whether a fix reaches drafts that already exist.
//
//   npx tsx --env-file=.env.local scripts/check-links.ts F29A8377

import { createSupabaseAdminClient } from "../app/supabase-admin";
import { parsePickNames, parseContextPlaceNames, parseNameKinds } from "../app/journey/plan-stops";
import { placeMatchPattern, mapsSearchUrl } from "../app/journey/place-links";

const reference = (process.argv[2] ?? "").toUpperCase();

/**
 * A match that is really part of a longer word, which is the bug.
 *
 * The proclitic allowance has to be repeated here or the checker contradicts
 * the thing it checks: the first version called "وناشيونال" and "بمطار" wrong,
 * when the leading و and ب are the separate words "and" and "at" and matching
 * there is correct. It reported ten bugs that were not bugs, which is the same
 * failure as a log line claiming discarded research had been used.
 */
const PROCLITIC = /[وفبكل]/;

function insideAWord(text: string, index: number, matched: string): boolean {
  const before = text[index - 1] ?? "";
  const beforeThat = text[index - 2] ?? "";
  const after = text[index + matched.length] ?? "";
  const letter = /\p{L}|\p{N}/u;
  if (letter.test(after)) return true;
  if (!letter.test(before)) return false;
  // One Arabic proclitic, itself at the start of a word, is not the name
  // being swallowed by a longer one.
  return !(PROCLITIC.test(before) && !letter.test(beforeThat));
}

function report(label: string, text: string, names: string[], kinds: Record<string, string>, city: string) {
  const pattern = placeMatchPattern(names);
  console.log(`\n--- ${label} ---`);
  if (!pattern) { console.log("  no names to link"); return; }

  const seen = new Map<string, number>();
  let bad = 0;
  for (const m of text.matchAll(pattern)) {
    const matched = m[1];
    seen.set(matched, (seen.get(matched) ?? 0) + 1);
    if (insideAWord(text, m.index ?? 0, matched)) {
      bad++;
      const from = Math.max(0, (m.index ?? 0) - 30);
      console.log(`  WRONG  "${matched}" inside: ...${text.slice(from, (m.index ?? 0) + matched.length + 30).replace(/\n/g, " ")}...`);
    }
  }
  console.log(`  ${seen.size} distinct names linked, ${[...seen.values()].reduce((a, b) => a + b, 0)} links total`);
  console.log(`  ${bad} link(s) landing inside a longer word`);

  const withKind = [...seen.keys()].filter((n) => kinds[n.toLowerCase()]);
  console.log(`  ${withKind.length} of ${seen.size} carry a kind, so their map search is not a guess`);
  for (const name of [...seen.keys()].slice(0, 4)) {
    const kind = kinds[name.toLowerCase()] ?? "";
    const url = mapsSearchUrl(name, city, "", kind);
    console.log(`    ${name} -> ${decodeURIComponent(new URL(url).searchParams.get("query") ?? "")}`);
  }
}

async function main() {
  if (!reference) { console.error("usage: check-links.ts <REFERENCE>"); process.exit(2); }
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("reference, city, itinerary_en, itinerary_ar, notes")
    .eq("reference", reference)
    .limit(1);
  if (error) { console.error(error.message); process.exit(1); }
  const row = data?.[0];
  if (!row) { console.error("no such draft"); process.exit(1); }

  const notes = String(row.notes ?? "");
  const names = [...parsePickNames(notes), ...parseContextPlaceNames(notes)].sort((a, b) => b.length - a.length);
  const kinds = parseNameKinds(notes);
  console.log(`${row.reference} · ${row.city} · ${names.length} names, ${Object.keys(kinds).length} kinds`);

  report("ENGLISH", String(row.itinerary_en ?? ""), names, kinds, String(row.city));
  report("ARABIC", String(row.itinerary_ar ?? ""), names, kinds, String(row.city));
}

main().then(() => process.exit(0));
