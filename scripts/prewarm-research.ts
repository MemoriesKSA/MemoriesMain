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
  categoriesPresent,
  readScopeVersion,
  missingCategories,
  researchIsComplete,
  RESEARCH_SCOPE_VERSION,
  RESEARCH_CACHE_TTL_DAYS,
  type DraftGuideSubmission,
} from "../app/draft-guide";
import { createSupabaseAdminClient } from "../app/supabase-admin";
import { flagshipCityKeys, flagshipCityGuideBySlug } from "../app/flagship-city-data";
import { isPlannableCountry, plannableCountries, travelCountries, studyCountries } from "../app/components/planner-data";

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
// Re-researches a city that is already warm, from scratch, throwing away what
// is stored rather than resuming it. Needed when the notes are not stale but
// are WRONG in a way age doesn't express: Istanbul and Cappadocia were warmed
// before the pre-warm stopped inventing a trip window, so their notes carried
// "your trip starts 21 September" into every later draft.
//
// It overwrites in place instead of deleting first, so the row is never
// missing. A run that dies halfway leaves the city holding fewer categories
// than it had, which is thinner but still real, and the next run resumes.
//
// Only ever with --only, so this can never be pointed at everything at once.
const FORCE = has("--force");
// Warms the study cities instead of the tourism ones. They are a separate
// world: none is in the flagship data, their notes live under a "study:" key
// so a study city and a tourism city of the same name cannot collide, and
// they research four categories of their own rather than the trip seven.
//
// It matters more here than for a trip. Four study categories cannot fit the
// in-request research deadline, so a cold study city produces a plan missing
// housing and halal entirely - which is exactly what the first real Manchester
// draft did.
const STUDY = has("--study");
const PAUSE_MS = 2000;

if (!Number.isFinite(CAP) || CAP <= 0) {
  console.error("--cap must be a positive number of dollars.");
  process.exit(1);
}
if (FORCE && !ONLY?.length) {
  console.error("--force re-buys research that already exists, so it only works with --only <city[,city]>.");
  process.exit(1);
}

type Target = { countrySlug: string; citySlug: string; label: string; state: string };

async function plan(): Promise<{ warm: Target[]; cold: Target[] }> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("city_research_cache").select("city_slug, research_notes, updated_at, curated");
  const rows = new Map((data ?? []).map((r) => [r.city_slug as string, r]));
  const ttlMs = RESEARCH_CACHE_TTL_DAYS * 86_400_000;

  const warm: Target[] = [];
  const cold: Target[] = [];

  // Was flagshipCityKeys(), which lists only cities we hand-curated. That was
  // the right source while a city could not be planned without a guide. Now a
  // plannable country needs every one of its cities warm whether or not anyone
  // wrote a guide for it - Indonesia, the Philippines and the UAE have none at
  // all - and asking for them by name found nothing, silently, because they
  // were never in the list being walked.
  const cityKeys = STUDY
    ? studyCountries.flatMap((c) => c.cities.filter((city) => !city.value.startsWith("other-")).map((city) => ({ countrySlug: c.value, citySlug: city.value })))
    : plannableCountries.flatMap((c) => c.cities.filter((city) => !city.value.startsWith("other-")).map((city) => ({ countrySlug: c.value, citySlug: city.value })));

  for (const { countrySlug, citySlug } of cityKeys) {
    if (ONLY && !ONLY.includes(citySlug)) continue;
    if (TIER === "saudi" && countrySlug !== "saudi-arabia") continue;
    if (TIER === "abroad" && countrySlug === "saudi-arabia") continue;

    const countryList = STUDY ? studyCountries : travelCountries;
    const label = countryList.find((c) => c.value === countrySlug)?.cities.find((c) => c.value === citySlug)?.en ?? citySlug;
    // Study notes are namespaced so they cannot collide with a tourism city
    // of the same name, which Tokyo already is.
    const row = rows.get(STUDY ? `study:${citySlug}` : citySlug);
    const target = (state: string): Target => ({ countrySlug, citySlug, label, state });

    if (!row) { cold.push(target("never cached")); continue; }
    // Curated rows are hand-written and cacheResearch refuses to overwrite
    // them, so researching one would spend money and throw the result away.
    // --force does not change that: it is about notes that are wrong, and a
    // curated row is the one kind we know is right.
    if (row.curated) { warm.push(target("curated")); continue; }
    if (FORCE) { cold.push(target("forced, stored notes discarded")); continue; }
    const { version } = readScopeVersion(row.research_notes as string);
    const expired = Date.now() - new Date(row.updated_at as string).getTime() > ttlMs;
    const guide = flagshipCityGuideBySlug(countrySlug, citySlug);
    // A city researched inside a customer request only gets the categories
    // that fit the in-request deadline, and then looked "fresh" forever.
    // A study city has no guide at all and is measured against the study set.
    const storedNotes = readScopeVersion(row.research_notes as string).notes;
    const missing = STUDY ? missingCategories(undefined, storedNotes, true) : guide ? missingCategories(guide, storedNotes) : [];
    if (version !== RESEARCH_SCOPE_VERSION) cold.push(target(`scope v${version}, now v${RESEARCH_SCOPE_VERSION}`));
    else if (expired) cold.push(target(`past ${RESEARCH_CACHE_TTL_DAYS} days`));
    else if (missing.length) cold.push(target(`incomplete, missing ${missing.join(", ")}`));
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
  const country = (STUDY ? studyCountries : travelCountries).find((c) => c.value === countrySlug);
  if (STUDY) {
    // A warm study city is researched for the general case, since the notes
    // are reused by every later student in that city. No named university and
    // no named field: those narrow the research to one applicant, and the
    // next one reading this cache will have a different answer to both. The
    // level is the one thing that genuinely changes what is researched, so
    // master's is used as the middle case rather than left blank.
    return {
      submissionId: `prewarm-study-${citySlug}`,
      city: citySlug,
      countrySlug,
      countryName: country?.en ?? countrySlug,
      stops: [citySlug],
      journeyType: "study",
      purpose: "master",
      saudiCitizen: "yes",
      hasSpecificField: "no",
      hasSpecificUniversity: "no",
      studySupport: "complete",
      travellers: "solo",
      travellerCount: "1",
      fromDate: "",
      toDate: "",
      transport: ["flights"],
      stays: ["student-stay"],
      planIncludes: [],
      currency: "SAR",
      name: "Pre-warm (no customer)",
      email: "mixedhopes2022@gmail.com",
      phone: "+966500000000",
    } as unknown as DraftGuideSubmission;
  }
  return {
    submissionId: `prewarm-${citySlug}`,
    city: citySlug,
    countrySlug,
    countryName: country?.en ?? countrySlug,
    stops: [citySlug],
    purpose: "leisure",
    travellers: "couple",
    travellerCount: "2",
  
    // year-round instead of pinning itself to an invented window, which
    // every later draft would then have to reason around.
    fromDate: "",
    toDate: "",
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
    // A tourism city used to need a curated guide before it could be
    // researched, which was true while research only topped up what the guide
    // already held. It no longer is: a plannable city with no guide researches
    // the full set instead, hotels included.
    //
    // Left in place, this guard skipped all fourteen Indonesian, Philippine
    // and Emirati cities and exited 0, reporting "0 of 14 cities warmed" as
    // though there had been nothing to do. Nothing was billed, which is the
    // only reason it was cheap to find.
    if (!STUDY && !guide && !isPlannableCountry(t.countrySlug)) {
      console.log(`skip ${t.citySlug}: no city data and ${t.countrySlug} is not plannable`);
      continue;
    }

    console.log(`\n--- ${t.label} (${t.countrySlug}) ---`);

    // Anything already stored for this city is handed back in, so a city
    // that failed halfway last time pays only for the categories it still
    // needs. Cappadocia failed three times and kept nothing; that is the
    // shape this exists to prevent.
    const cacheKey = STUDY ? `study:${t.citySlug}` : t.citySlug;
    const { data: row } = await supabase.from("city_research_cache").select("research_notes, curated").eq("city_slug", cacheKey).maybeSingle();
    if (row?.curated) { console.log("skip: curated, hand-written research is never overwritten"); continue; }
    // Only resume notes written under the CURRENT scope. Notes from an older
    // one have no category markers, so categoriesPresent reads them as
    // "nothing done", every category gets researched again, and the old text
    // would be kept underneath the new - a doubled blob, half of it stale,
    // handed to the drafting pass as though it were one answer.
    const stored = (row?.research_notes as string | null) ?? "";
    const sameScope = stored ? readScopeVersion(stored).version === RESEARCH_SCOPE_VERSION : false;
    const existing = FORCE || !sameScope ? "" : readScopeVersion(stored).notes;
    if (FORCE && stored) console.log(`--force: discarding ${stored.length} stored characters and researching every category again`);
    else if (stored && !sameScope) console.log("previous notes are from an older research scope, starting fresh");
    const had = categoriesPresent(existing);
    if (had.size) console.log(`resuming: already have ${[...had].join(", ")}`);

    const notes = await researchOperationalFacts(
      anthropic, guide, submissionFor(t.countrySlug, t.citySlug), t.label, (d) => { spent += d; },
      existing,
      // Written after every category rather than once at the end, so an
      // interrupted city keeps what it managed.
      async (soFar) => { await cacheResearch(supabase, cacheKey, soFar); },
      undefined,
      // The cap, enforced between categories rather than between cities.
      // Checking it in this loop alone was useless for a single-city run,
      // which is how Cappadocia managed to cost $20 under a $6 cap.
      () => (spent >= CAP ? `$${spent.toFixed(2)} spent, cap is $${CAP}` : null),
    );

    // "Nothing was added" has two very different causes, and treating them
    // the same cost a whole run. Ankara was already finished by the time the
    // loop reached it, because an earlier run was still alive in the
    // background, so there was nothing left to buy. That read as a failure
    // and the run aborted with seven cities still to do.
    //
    // A city that needs nothing is a success. Only a city that still has gaps
    // and gained nothing is a wall worth stopping at.
    if (notes && researchIsComplete(guide, notes, STUDY)) {
      done++;
      console.log(`nothing to do: already holds all ${categoriesPresent(notes).size} categories it needs.`);
      if (done < cold.length) await new Promise((r) => setTimeout(r, PAUSE_MS));
      continue;
    }
    if (!notes || notes === existing) {
      console.error(`\nStopping: research for ${t.label} added nothing and is still missing ${missingCategories(guide, notes, STUDY).join(", ")}. Check the error above.`);
      break;
    }

    done++;
    console.log(`cached ${notes.length} characters across ${categoriesPresent(notes).size} categories. Running total $${spent.toFixed(2)}.`);
    console.log(`  first lines: ${notes.split(/\r?\n/).filter((l) => l.trim()).slice(0, 2).join(" / ").slice(0, 160)}`);

    if (done < cold.length) await new Promise((r) => setTimeout(r, PAUSE_MS));
  }

  console.log(`\n${done} of ${cold.length} cities warmed. Roughly $${spent.toFixed(2)} at list prices.`);
  if (done) console.log("These are automated rows, not curated: they expire on the normal clock and can be re-run safely.");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
