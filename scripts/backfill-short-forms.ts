// Closes the single-word leak on plans written before the draft was asked to
// declare its own short forms.
//
// The render-time pass in redaction-variants.ts refuses single words on
// purpose: every rule that hides "الدانا" also hides "عمرة" in a Makkah plan.
// Going forward the draft declares the short form it used, as a fourth field on
// its marker entry. Plans already in the database have no fourth field, and one
// of them is in a customer's inbox with two hotels readable on it.
//
// So this proposes candidates and a human decides. It never writes without
// --apply, it prints the sentence each candidate was found in so the decision
// is made on evidence rather than on a word in a list, and it writes the
// approved ones into the same fourth field the drafts will use, so there is one
// mechanism and not two.
//
//   npx tsx --env-file=.env.local scripts/backfill-short-forms.ts 78445EDD
//   npx tsx --env-file=.env.local scripts/backfill-short-forms.ts 78445EDD --apply --accept الدانا,ريتز كارلتون

import { createSupabaseAdminClient } from "../app/supabase-admin";
import { parseNamedThings } from "../app/journey/plan-stops";
import { cityNamedThings } from "../app/journey/place-links";
import { shortFormsToHide, protectedTokens, isBlocked } from "../app/journey/redaction-variants";

const args = process.argv.slice(2);
const reference = (args[0] ?? "").toUpperCase();
const APPLY = args.includes("--apply");
const ai = args.indexOf("--accept");
const ACCEPT = ai >= 0 ? String(args[ai + 1] ?? "").split(",").map((s) => s.trim()).filter(Boolean) : [];

const TOKEN = /[\p{L}\p{N}]+/gu;

async function main() {
  if (!reference) {
    console.error("usage: backfill-short-forms.ts <REFERENCE> [--apply --accept a,b]");
    process.exit(2);
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("proposals")
    .select("id, reference, city, notes, itinerary_en, itinerary_ar, stops")
    .eq("reference", reference)
    .maybeSingle();

  if (!data) {
    console.error(`${reference}: no such plan`);
    process.exit(1);
  }

  const notes = String(data.notes ?? "");
  const city = String(data.city ?? "");
  const stops = (data.stops as { label: string }[] | null) ?? null;
  const text = `${data.itinerary_en ?? ""}\n${data.itinerary_ar ?? ""}`;
  const named = [...cityNamedThings(city, false), ...cityNamedThings(city, true), ...parseNamedThings(notes)];
  const tripLabels = [city, ...(stops?.map((s) => s.label) ?? [])];

  // The same words the render-time pass refuses to carve: the destination,
  // the declared geography, the category words, the religious vocabulary. A
  // candidate list that offers لنكاوي and "night" is not a list anyone can read.
  const blocked = protectedTokens(named, tripLabels);

  // Everything the render-time pass already covers needs no help.
  const alreadyHidden = new Set(shortFormsToHide(named, { tripLabels }).map((h) => h.hiddenOnly.toLowerCase()));

  type Candidate = { thing: string; form: string; count: number; sample: string };
  const candidates: Candidate[] = [];

  for (const thing of named) {
    if (!thing.commercial) continue;
    // The whole name is already redacted exactly; a form only matters if the
    // prose uses it INSTEAD of the full name somewhere.
    if (!text.includes(thing.name)) {
      // fall through: a name never written in full is exactly the interesting case
    }
    for (const token of thing.name.matchAll(TOKEN)) {
      const form = token[0];
      if (form.length < 4) continue;
      if (isBlocked(form, blocked)) continue;
      if (alreadyHidden.has(form.toLowerCase())) continue;
      // It must actually appear standing on its own in the prose, outside every
      // occurrence of the full name.
      const withoutFullNames = text.split(thing.name).join(" ");
      const count = withoutFullNames.split(form).length - 1;
      if (!count) continue;
      const at = withoutFullNames.indexOf(form);
      const sample = withoutFullNames.slice(Math.max(0, at - 45), at + form.length + 45).replace(/\s+/g, " ");
      candidates.push({ thing: thing.name, form, count, sample });
    }
  }

  // One row per distinct form, keeping the longest name it came from.
  const byForm = new Map<string, Candidate>();
  for (const c of candidates) {
    const prev = byForm.get(c.form);
    if (!prev || prev.thing.length < c.thing.length) byForm.set(c.form, c);
  }
  const rows = [...byForm.values()].sort((a, b) => b.count - a.count);

  console.log(`${reference}  ${city}`);
  console.log(`${rows.length} single-word candidate(s) the render-time pass will not catch\n`);
  for (const row of rows) {
    const chosen = ACCEPT.includes(row.form);
    console.log(`  ${chosen ? "ACCEPT" : "      "} ${String(row.count).padStart(3)}x  ${row.form}`);
    console.log(`          from  ${row.thing}`);
    console.log(`          "...${row.sample}..."\n`);
  }

  if (!ACCEPT.length) {
    console.log("Nothing accepted. Re-run with --accept <form,form> once you have read the samples,");
    console.log("and add --apply to write them into the plan's marker lines.");
    return;
  }

  // Write each accepted form into the fourth field of its own marker entry.
  let updated = notes;
  let written = 0;
  for (const form of ACCEPT) {
    const row = byForm.get(form);
    if (!row) {
      console.log(`  skipped "${form}": not a candidate on this plan`);
      continue;
    }
    // Find the marker entry whose name this came from, and append the field.
    const escaped = row.thing.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const entry = new RegExp(`(${escaped}[^|\\n]*?)(?=\\s*\\||\\s*$)`, "m");
    const match = updated.match(entry);
    if (!match) {
      console.log(`  skipped "${form}": could not find "${row.thing}" on a marker line`);
      continue;
    }
    // One marker entry carries both languages of the same thing, so accepting
    // "الدانا" and "Danna" lands on the same entry twice. The second one joins
    // the field rather than being refused: the parser splits it on commas.
    const existing = match[1].split("=");
    if (existing.length >= 4) {
      if (existing[3].split(/[,،]/).some((a) => a.trim() === form)) {
        console.log(`  skipped "${form}": already declared on that entry`);
        continue;
      }
      updated = updated.replace(entry, `${match[1].trimEnd()}, ${form}`);
    } else {
      updated = updated.replace(entry, `${match[1].trimEnd()} = ${form}`);
    }
    written++;
  }

  if (!APPLY) {
    console.log(`\nDry run. ${written} entr(ies) would change. Add --apply to write them.`);
    return;
  }

  const { error } = await supabase.from("proposals").update({ notes: updated }).eq("id", data.id);
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  console.log(`\n${written} entr(ies) updated on ${reference}.`);
}

main().then(() => process.exit(0));
