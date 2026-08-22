// Fills the per-city research cache deliberately, instead of letting the
// first customer for a city trigger it inside their own draft.
//
// Two reasons to do that. A cold city adds several minutes to a draft, and
// the route that runs drafts is capped at 300 seconds, so a cold two-stop
// trip can be cut off partway. And research bought ahead of time can be read
// by a person before any customer sees a plan built on it.
//
//   npx tsx --env-file=.env.local scripts/prewarm-research.ts
//   npx tsx --env-file=.env.local scripts/prewarm-research.ts --only istanbul
//   npx tsx --env-file=.env.local scripts/prewarm-research.ts --tier saudi --spend --cap 20
//
// THIS SCRIPT SPENDS MONEY, so it does nothing without --spend. On its own it
// prints the plan and exits. Everything below is built around one rule: it
// should be impossible to spend more than you meant to by mistake.
//
//   - dry run unless --spend is passed
//   - a hard cap in dollars, default 25, checked after every city
//   - one city at a time, never in parallel, so a bad run stops early
//   - skips cities that are already warm, so re-running costs nothing
//   - never touches a curated row, matching cacheResearch's own guarantee
//   - pings the API first, because an empty balance should cost one cheap
//     call to discover, not eighteen expensive ones
//   - stops on the first city that comes back empty rather than ploughing on

import Anthropic from "@anthropic-ai/sdk";
import {
  researchOperationalFacts,
  cacheResearch,
  readScopeVersion,
  RESEARCH_SCOPE_VERSION,
  RESEARCH_CACHE_TTL_DAYS,
  type DraftGuideSubmission,
} from "../app/draft-guide";
import { createSupabaseAdminClient } from "../app/supabase-admin";
import { flagshipCityKeys, flagshipCityGuideBySlug } from "../app/flagship-city-data";
import { travelCountries } from "../app/components/planner-data";

const args = process.argv.slice(2);
const has = (flag: string) => args.includes(flag);
const valueOf = (flag: string) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};

const SPEND = has("--spend");
const CAP = Number(valueOf("--cap") ?? 25);
const ONLY = valueOf("--only")?.split(",").map((s) => s.trim()).filter(Boolean);
const TIER = valueOf("--tier");
const PAUSE_MS = 2000;

if (!Number.isFinite(CAP) || CAP <= 0) {
  console.error("--cap must be a positive number of dollars.");
  process.exit(1);
}

// Dates matter to the research only for seasonal questions ("is this open
// during the trip"). A pre-warm has no customer and no dates, so it asks
// about a week roughly a month out, which is when people actually travel
// relative to booking. The cached answer is reused for every later customer
// regardless, which the research prompt already accounts for.
const from = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
const to = new Date(Date.now() + 37 * 86_400_000).toISOString().slice(0, 10);

type Target = { countrySlug: string; citySlug: string; label: string; state: string };

async function plan(): Promise<{ warm: Target[]; cold: Target[] }> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("city_research_cache").select("city_slug, research_notes, updated_at, curated");
  const rows = new Map((data ?? []).map((r) => [r.city_slug as string, r]));
  const ttlMs = RESEARCH_CACHE_TTL_DAYS * 86_400_000;

  const warm: Target[] = [];
  const cold: Target[] = [];

  for (const { countrySlug, citySlug } of flagshipCityKeys()) {
    if (ONLY && !ONLY.includes(citySlug)) continue;
    if (TIER === "saudi" && countrySlug !== "saudi-arabia") continue;
    if (TIER === "abroad" && countrySlug === "saudi-arabia") continue;

    const label = travelCountries.find((c) => c.value === countrySlug)?.cities.find((c) => c.value === citySlug)?.en ?? citySlug;
    const row = rows.get(citySlug);
    const target = (state: string): Target => ({ countrySlug, citySlug, label, state });

    if (!row) { cold.push(target("never cached")); continue; }
    // Curated rows are hand-written and cacheResearch refuses to overwrite
    // them, so researching one would spend money and throw the result away.
    if (row.curated) { warm.push(target("curated")); continue; }
    const { version } = readScopeVersion(row.research_notes as string);
    const expired = Date.now() - new Date(row.updated_at as string).getTime() > ttlMs;
    if (version !== RESEARCH_SCOPE_VERSION) cold.push(target(`scope v${version}, now v${RESEARCH_SCOPE_VERSION}`));
    else if (expired) cold.push(target(`past ${RESEARCH_CACHE_TTL_DAYS} days`));
    else warm.push(target("fresh"));
  }
  return { warm, cold };
}

// One cheap call before any expensive one. An empty balance is the single
// most likely reason this fails, and finding out on a Haiku ping costs
// nothing next to finding out on the third Opus research pass.
async function apiIsReachable(anthropic: Anthropic): Promise<string | null> {
  try {
    await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8,
      messages: [{ role: "user", content: "say ok" }],
    });
    return null;
  } catch (error) {
    return (error as Error)?.message ?? String(error);
  }
}

function submissionFor(countrySlug: string, citySlug: string): DraftGuideSubmission {
  const country = travelCountries.find((c) => c.value === countrySlug);
  return {
    submissionId: `prewarm-${citySlug}`,
    city: citySlug,
    countrySlug,
    countryName: country?.en ?? countrySlug,
    stops: [citySlug],
    purpose: "leisure",
    travellers: "couple",
    travellerCount: "2",
    fromDate: from,
    toDate: to,
    transport: ["flights", "private-driver"],
    stays: ["hotel"],
    planIncludes: ["attractions", "restaurants"],
    currency: "SAR",
    name: "Pre-warm (no customer)",
    email: "mixedhopes2022@gmail.com",
    phone: "+966500000000",
  } as DraftGuideSubmission;
}

async function main() {
  const { warm, cold } = await plan();

  console.log(`warm, nothing to do : ${warm.length}`);
  for (const t of warm) console.log(`   ${t.citySlug} (${t.state})`);
  console.log(`\nwould research      : ${cold.length}`);
  for (const t of cold) console.log(`   ${t.countrySlug}/${t.citySlug} (${t.state})`);

  if (!cold.length) {
    console.log("\nEverything selected is already warm. Nothing to spend.");
    return;
  }

  console.log(`\nAt roughly $1-5 a city that is about $${cold.length}-${cold.length * 5}. Cap is $${CAP}.`);

  if (!SPEND) {
    console.log("\nDry run. Nothing was researched and nothing was billed.");
    console.log("Add --spend to actually run it.");
    return;
  }

  // maxRetries 0, not 2. This client only ever makes one kind of expensive
  // call, and an SDK retry on it re-runs a full research pass server-side,
  // which bills whether or not the response ever reaches us. Cappadocia was
  // pre-warmed once at maxRetries 2, timed out three times, and cost about
  // $15 for nothing. The per-request options in draft-guide.ts already set
  // this; setting it here too means a future call added to this script
  // cannot inherit the expensive default by accident.
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 0 });
  const unreachable = await apiIsReachable(anthropic);
  if (unreachable) {
    console.error(`\nStopping before spending anything. The API rejected a test call:\n  ${unreachable.slice(0, 200)}`);
    process.exit(1);
  }

  const supabase = createSupabaseAdminClient();
  let spent = 0;
  let done = 0;

  for (const t of cold) {
    if (spent >= CAP) {
      console.log(`\nStopping: $${spent.toFixed(2)} spent, cap is $${CAP}. ${cold.length - done} cities left.`);
      break;
    }

    const guide = flagshipCityGuideBySlug(t.countrySlug, t.citySlug);
    if (!guide) { console.log(`skip ${t.citySlug}: no city data`); continue; }

    console.log(`\n--- ${t.label} (${t.countrySlug}) ---`);
    const notes = await researchOperationalFacts(anthropic, guide, submissionFor(t.countrySlug, t.citySlug), t.label, (d) => { spent += d; });

    // researchOperationalFacts swallows its own errors and returns "". That
    // is right inside a draft, where a missing note is better than a failed
    // plan, but here it would quietly march through every remaining city
    // achieving nothing. One empty result ends the run.
    if (!notes) {
      console.error(`\nStopping: research for ${t.label} came back empty. Check the error above.`);
      break;
    }

    await cacheResearch(supabase, t.citySlug, notes);
    done++;
    console.log(`cached ${notes.length} characters. Running total $${spent.toFixed(2)}.`);
    console.log(`  first lines: ${notes.split(/\r?\n/).filter((l) => l.trim()).slice(0, 2).join(" / ").slice(0, 160)}`);

    if (done < cold.length) await new Promise((r) => setTimeout(r, PAUSE_MS));
  }

  console.log(`\n${done} of ${cold.length} cities warmed. Roughly $${spent.toFixed(2)} at list prices.`);
  if (done) console.log("These are automated rows, not curated: they expire on the normal clock and can be re-run safely.");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
