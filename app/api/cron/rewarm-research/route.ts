import Anthropic from "@anthropic-ai/sdk";
import {
  researchOperationalFacts,
  cacheResearch,
  categoriesPresent,
  readScopeVersion,
  RESEARCH_SCOPE_VERSION,
  RESEARCH_CACHE_TTL_DAYS,
  type DraftGuideSubmission,
} from "../../../draft-guide";
import { createSupabaseAdminClient } from "../../../supabase-admin";
import { flagshipCityGuideBySlug } from "../../../flagship-city-data";
import { travelCountries } from "../../../components/planner-data";

export const runtime = "nodejs";
export const maxDuration = 800;

// Keeps the cities we actually sell warm, so no customer ever triggers
// research inside their own request.
//
// Warming by hand looked like a one-off job and it is not: a non-curated
// city goes cold again after RESEARCH_CACHE_TTL_DAYS, and then the next
// customer for it pays for research and waits for it. Without this, warming
// Istanbul today just means doing it again next month, forever, and
// forgetting one month means a customer gets the slow path.
//
// Deliberately narrow. It only refreshes cities on the list below, only when
// they are actually going cold, and only ONE per run. A cron that can spend
// $20 in a night is a cron nobody should trust, and the daily schedule means
// a list of ten stays warm comfortably at one a day.
//
// Curated cities are not here and never should be: those are hand-written
// and cacheResearch refuses to overwrite them anyway.

// The cities worth keeping permanently warm. Add one when it starts selling,
// not before: a cold city costs nothing until somebody books it, and this
// list is the only thing here that spends money.
const KEEP_WARM = ["istanbul", "cappadocia"];

// Refresh a few days before expiry rather than after, so there is no window
// where a customer arrives to find it cold.
const REFRESH_WHEN_DAYS_LEFT = 5;

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
    const stale = version !== RESEARCH_SCOPE_VERSION || ageDays > RESEARCH_CACHE_TTL_DAYS - REFRESH_WHEN_DAYS_LEFT;
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
  const from = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  const to = new Date(Date.now() + 37 * 86_400_000).toISOString().slice(0, 10);

  // A stale row is thrown away rather than resumed. Resuming is right when a
  // run was interrupted; here the whole point is that the facts have aged,
  // so keeping half of last month's answers would defeat the refresh.
  const existing = target.notes && readScopeVersion(target.notes).version === RESEARCH_SCOPE_VERSION
    ? readScopeVersion(target.notes).notes
    : "";

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
      fromDate: from,
      toDate: to,
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
  );

  const categories = [...categoriesPresent(notes)];
  console.log(`Re-warmed ${label}: ${categories.length} categories, roughly $${spent.toFixed(2)}.`);
  return Response.json({
    ok: !!notes,
    refreshed: target.citySlug,
    categories,
    approxCostUsd: Number(spent.toFixed(2)),
    stillDue: due.length - 1,
  });
}
