import Anthropic from "@anthropic-ai/sdk";
import {
  researchOperationalFacts,
  cacheResearch,
  categoriesPresent,
  readScopeVersion,
  researchIsComplete,
  RESEARCH_SCOPE_VERSION,
  RESEARCH_CACHE_TTL_DAYS,
  type DraftGuideSubmission,
} from "../../../draft-guide";
import { createSupabaseAdminClient } from "../../../supabase-admin";
import { flagshipCityGuideBySlug } from "../../../flagship-city-data";
import { travelCountries } from "../../../components/planner-data";
import { KEEP_WARM, REFRESH_WHEN_DAYS_LEFT } from "./keep-warm";

export const runtime = "nodejs";
// 800 seconds, the Pro plan's generally-available maximum. A full city is
// five to seven categories at roughly two and a half minutes each, so most
// now finish in a single run; any that do not are resumed the next night,
// because every category is stored the moment it lands.
export const maxDuration = 800;

// Leaves a margin under maxDuration for the request itself to return.
const CRON_RESEARCH_DEADLINE_MS = 700 * 1000;

// Keeps the cities we actually sell warm, so no customer ever triggers
// research inside their own request.
//
// Warming by hand looked like a one-off job and it is not: a non-curated
// city goes cold again after RESEARCH_CACHE_TTL_DAYS, and then the next
// customer for it pays for research and waits for it. Without this, warming
// Istanbul today just means doing it again next month, forever, and
// forgetting one month means a customer gets the slow path.
//
// Deliberately narrow. It only refreshes cities on the list, only when they
// are actually going cold, and only ONE per run. A cron that can spend $20 in
// a night is a cron nobody should trust.
//
// One per run is a throughput limit as well as a spend limit, so the schedule
// has to keep up with the length of the list. It runs every six hours, which
// drains twelve cities well inside the refresh margin; see KEEP_WARM_CAPACITY
// for the arithmetic and test-rewarm-capacity for the assertion.
//
// Curated cities are not on the list and never should be: those are
// hand-written and cacheResearch refuses to overwrite them anyway.

// The list, the refresh margin and the capacity arithmetic live in
// ./keep-warm because a route file may only export handlers and segment
// options. See the note at the top of that file.

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("Re-warm skipped: CRON_SECRET is not set");
    return Response.json({ error: "Not configured." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    console.error("Re-warm skipped: ANTHROPIC_API_KEY is missing");
    return Response.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("city_research_cache")
    .select("city_slug, research_notes, updated_at, curated")
    .in("city_slug", KEEP_WARM);
  const rows = new Map((data ?? []).map((r) => [r.city_slug as string, r]));

  // Oldest first, so a list longer than the schedule still gets round.
  const due: { citySlug: string; notes: string; ageDays: number }[] = [];
  for (const citySlug of KEEP_WARM) {
    const row = rows.get(citySlug);
    if (row?.curated) continue;
    const notes = (row?.research_notes as string | null) ?? "";
    const ageDays = row ? (Date.now() - new Date(row.updated_at as string).getTime()) / 86_400_000 : Infinity;
    const version = notes ? readScopeVersion(notes).version : -1;
    // Age and scope are not the only ways to be cold. A city researched
    // inside a customer's request keeps only the categories that fit the
    // in-request deadline, and without this it reads as fresh forever while
    // every later customer gets the thin plan.
    const countryForCity = travelCountries.find((c) => c.cities.some((city) => city.value === citySlug))?.value;
    const guideForCity = countryForCity ? flagshipCityGuideBySlug(countryForCity, citySlug) : undefined;
    const incomplete = !!guideForCity && !!notes && !researchIsComplete(guideForCity, readScopeVersion(notes).notes);
    const stale = version !== RESEARCH_SCOPE_VERSION || incomplete || ageDays > RESEARCH_CACHE_TTL_DAYS - REFRESH_WHEN_DAYS_LEFT;
    if (stale) due.push({ citySlug, notes, ageDays });
  }
  due.sort((a, b) => b.ageDays - a.ageDays);

  if (!due.length) return Response.json({ ok: true, refreshed: null, message: "Everything on the list is warm." });

  // One city per run. See the note above: this is the spend limit.
  const target = due[0];
  const countrySlug = travelCountries.find((c) => c.cities.some((city) => city.value === target.citySlug))?.value;
  const guide = countrySlug ? flagshipCityGuideBySlug(countrySlug, target.citySlug) : undefined;
  if (!guide || !countrySlug) {
    console.error(`Re-warm: no city data for ${target.citySlug}`);
    return Response.json({ error: `No city data for ${target.citySlug}.` }, { status: 500 });
  }

  const country = travelCountries.find((c) => c.value === countrySlug);
  const label = country?.cities.find((c) => c.value === target.citySlug)?.en ?? target.citySlug;

  // A stale row is thrown away rather than resumed. Resuming is right when a
  // run was interrupted; here the whole point is that the facts have aged,
  // so keeping half of last month's answers would defeat the refresh.
  const existing = target.notes && readScopeVersion(target.notes).version === RESEARCH_SCOPE_VERSION
    ? readScopeVersion(target.notes).notes
    : "";

  const startedAt = Date.now();
  let spent = 0;
  const notes = await researchOperationalFacts(
    new Anthropic({ apiKey: anthropicKey, maxRetries: 0 }),
    guide,
    {
      submissionId: `rewarm-${target.citySlug}`,
      city: target.citySlug,
      countrySlug,
      countryName: country?.en ?? countrySlug,
      stops: [target.citySlug],
      purpose: "leisure",
      travellers: "couple",
      travellerCount: "2",
      // Empty on purpose: there is no customer and no trip. The research
      // prompt asks for year-round answers when it sees no dates, so the
      // cached notes are not pinned to a window that was never real.
      fromDate: "",
      toDate: "",
      transport: ["flights", "private-driver"],
      stays: ["hotel"],
      planIncludes: ["attractions", "restaurants"],
      currency: "SAR",
      name: "Scheduled re-warm (no customer)",
      email: "",
      phone: "",
    } as DraftGuideSubmission,
    label,
    (dollars) => { spent += dollars; },
    existing,
    async (soFar) => { await cacheResearch(supabase, target.citySlug, soFar); },
    Date.now() + CRON_RESEARCH_DEADLINE_MS,
  );

  const categories = [...categoriesPresent(notes)];
  // Says plainly whether the city finished or will be resumed tomorrow.
  const finished = notes !== existing && Date.now() < startedAt + CRON_RESEARCH_DEADLINE_MS;
  console.log(`Re-warmed ${label}: ${categories.length} categories, roughly $${spent.toFixed(2)}.`);
  return Response.json({
    ok: !!notes,
    refreshed: target.citySlug,
    categories,
    approxCostUsd: Number(spent.toFixed(2)),
    finished,
    stillDue: due.length - 1,
  });
}
