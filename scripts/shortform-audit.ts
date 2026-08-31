// What the short-form pass would hide, on every plan we actually hold.
//
// The question this answers is not "does it catch the Danna" but "what else
// does it catch". A paywall that blurs an ordinary word in the free preview
// costs more than the leak it closes, so this prints every carved run beside
// the number of times it occurs in the plan's own prose, for a human to read.
//
//   npx tsx --env-file=.env.local scripts/shortform-audit.ts

import { createSupabaseAdminClient } from "../app/supabase-admin";
import { shortFormsToHide } from "../app/journey/redaction-variants";
import { parseNamedThings } from "../app/journey/plan-stops";
import { cityNamedThings } from "../app/journey/place-links";
import { redactPlaceNames, REDACTION_PATTERN } from "../app/journey/paywall";
import { placeNamesForCity } from "../app/journey/place-links";
import { parseAllNamedPlaces } from "../app/journey/plan-stops";

async function main() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("reference, city, notes, itinerary_en, itinerary_ar, stops")
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  for (const row of data ?? []) {
    const r = row as Record<string, unknown>;
    const city = String(r.city ?? "");
    const notes = String(r.notes ?? "");
    const stops = (r.stops as { label: string }[] | null) ?? null;
    const text = `${r.itinerary_en ?? ""}\n${r.itinerary_ar ?? ""}`;

    const named = [...cityNamedThings(city, false), ...cityNamedThings(city, true), ...parseNamedThings(notes)];
    const shortForms = shortFormsToHide(named, { tripLabels: [city, ...(stops?.map((s) => s.label) ?? [])] });

    console.log(`\n=== ${r.reference}  ${city} ===`);
    console.log(`${named.length} named things, ${named.filter((n) => n.commercial).length} commercial`);
    console.log(`${shortForms.length} short forms carved\n`);

    const occurring = shortForms
      .map((s) => ({ form: s.hiddenOnly, count: text.split(s.hiddenOnly).length - 1 }))
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count);

    console.log(`  ${occurring.length} of them actually appear in this plan's prose:`);
    for (const { form, count } of occurring) console.log(`    ${String(count).padStart(3)}x  ${form}`);

    // The measurement that matters: how much more is hidden than before.
    const namesEn = [...new Set([...placeNamesForCity(city, false), ...parseAllNamedPlaces(notes)])].sort((a, b) => b.length - a.length);
    const namesAr = [...new Set([...placeNamesForCity(city, true), ...parseAllNamedPlaces(notes)])].sort((a, b) => b.length - a.length);
    for (const [label, plan, names] of [
      ["english", String(r.itinerary_en ?? ""), namesEn],
      ["arabic", String(r.itinerary_ar ?? ""), namesAr],
    ] as [string, string, string[]][]) {
      if (!plan) continue;
      const before = (redactPlaceNames(plan, names).match(REDACTION_PATTERN) ?? []).length;
      const after = (redactPlaceNames(plan, names, shortForms).match(REDACTION_PATTERN) ?? []).length;
      console.log(`  ${label}: ${before} redactions before, ${after} after  (+${after - before})`);
    }
  }
}

main().then(() => process.exit(0));
