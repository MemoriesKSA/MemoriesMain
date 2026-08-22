// Re-runs ONLY the self-check pass against a draft already stored in the
// proposals table, rebuilding the same inputs the original run used.
//
//   npx tsx --env-file=.env.local scripts/recheck-proposal.ts C42875F5
//   npx tsx --env-file=.env.local scripts/recheck-proposal.ts C42875F5 --repeat 3
//
// Why this exists. The self-check is the first thing in the draft email and
// it decides whether the reviewer sees a green banner or a yellow one, so
// its prompt needs iterating on. Regenerating a whole draft to see one
// paragraph change costs about $0.90 and eight minutes; this costs about a
// tenth of that and runs in seconds, because the draft, the translation and
// the research are all already bought and stored.
//
// --repeat matters more than it looks. This pass is a sampled model output,
// so "it came back green once" is not the same as "it comes back green".
// A flag that appears on one run in three is still a yellow banner on one
// draft in three.

import Anthropic from "@anthropic-ai/sdk";
import {
  selfCheckDraft,
  serializeGuideForDraft,
  getCachedResearch,
  dayByDayCalendar,
  readSelfCheckVerdict,
} from "../app/draft-guide";
import { createSupabaseAdminClient } from "../app/supabase-admin";
import { flagshipCityGuideBySlug, flagshipCountryForCity } from "../app/flagship-city-data";
import { travelCountries } from "../app/components/planner-data";
import type { PlanStop } from "../app/journey/plan-stops";

const args = process.argv.slice(2);
const reference = (args[0] ?? "").toUpperCase();
const repeatIndex = args.indexOf("--repeat");
const REPEAT = repeatIndex >= 0 ? Number(args[repeatIndex + 1] ?? 1) : 1;

if (!reference || !Number.isFinite(REPEAT) || REPEAT < 1) {
  console.error("Usage: npx tsx --env-file=.env.local scripts/recheck-proposal.ts <REFERENCE> [--repeat N]");
  process.exit(1);
}

// Green means exactly what the email means by it, read through the same
// function, so this script can never report a pass the reviewer's inbox
// would have shown as a warning.
const isGreen = (text: string) => readSelfCheckVerdict(text).clean;

// The proposals table stores display labels, never slugs: the stops array is
// {label, firstDay} and the city column is "Istanbul → Cappadocia". So both
// paths end at the same lookup, and the stops array is preferred only because
// it survives a label containing an arrow.
function slugFor(label: string): string {
  const wanted = label.trim().toLowerCase();
  for (const country of travelCountries) {
    const hit = country.cities.find((c) => c.en.toLowerCase() === wanted || c.ar === label.trim());
    if (hit) return hit.value;
  }
  return wanted.replace(/\s+/g, "-");
}

function slugsFrom(stops: PlanStop[] | null, cityLabel: string): string[] {
  const labels = stops?.length ? stops.map((s) => s.label) : cityLabel.split("→");
  return labels.map(slugFor).filter(Boolean);
}

async function main() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("reference, city, from_date, to_date, itinerary_en, itinerary_ar, stops")
    .eq("reference", reference)
    .maybeSingle();
  if (error || !data) {
    console.error(`No proposal found for ${reference}.`, error?.message ?? "");
    process.exit(1);
  }

  const slugs = slugsFrom(data.stops as PlanStop[] | null, String(data.city));
  const guides = slugs.map((slug) => {
    const countrySlug = flagshipCountryForCity(slug);
    const guide = countrySlug ? flagshipCityGuideBySlug(countrySlug, slug) : undefined;
    const label = travelCountries.find((c) => c.value === countrySlug)?.cities.find((c) => c.value === slug)?.en ?? slug;
    return { slug, guide, label };
  });
  const missing = guides.filter((g) => !g.guide).map((g) => g.slug);
  if (missing.length) {
    console.error(`No city data for: ${missing.join(", ")}`);
    process.exit(1);
  }

  const multiStop = guides.length > 1;
  const groundedFactsEn = guides.map((g, i) => `--- STOP ${i + 1}: ${g.label} ---\n${serializeGuideForDraft(g.guide!, false)}`).join("\n\n");
  const groundedFactsAr = guides.map((g, i) => `--- المحطة ${i + 1}: ${g.label} ---\n${serializeGuideForDraft(g.guide!, true)}`).join("\n\n");

  const research = await Promise.all(guides.map(async (g) => {
    const cached = await getCachedResearch(supabase, g.slug);
    return { label: g.label, notes: cached?.notes ?? "" };
  }));
  const operationalResearch = research
    .filter((r) => r.notes)
    .map((r) => (multiStop ? `--- RESEARCH FOR ${r.label} ---\n${r.notes}` : r.notes))
    .join("\n\n");

  const calendar = dayByDayCalendar(String(data.from_date ?? ""), String(data.to_date ?? ""));

  console.log(`${reference}  ${data.city}  ${data.from_date} to ${data.to_date}`);
  console.log(`stops: ${slugs.join(", ")}  ·  research ${operationalResearch.length} chars  ·  en ${(data.itinerary_en ?? "").length}  ar ${(data.itinerary_ar ?? "").length}`);
  console.log(`calendar: ${calendar || "(none)"}\n`);

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 2 });
  let spent = 0;
  let green = 0;

  for (let run = 1; run <= REPEAT; run++) {
    const result = await selfCheckDraft(
      anthropic,
      data.itinerary_en ?? "",
      data.itinerary_ar ?? "",
      groundedFactsEn,
      groundedFactsAr,
      operationalResearch,
      calendar,
      (d) => { spent += d; },
    );
    const ok = isGreen(result);
    if (ok) green++;
    console.log(`--- run ${run}/${REPEAT}: ${ok ? "GREEN" : "YELLOW"}`);
    console.log(result || "(empty, the self-check itself failed)");
    console.log("");
  }

  console.log(`${green}/${REPEAT} green  ·  roughly $${spent.toFixed(3)} at list prices`);
  if (green !== REPEAT) process.exit(1);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
