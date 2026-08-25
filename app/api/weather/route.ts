import { NextResponse } from "next/server";
import { fetchLiveWeather } from "../../weather-live";

/**
 * The weather, fetched by the browser, because the page cannot do it.
 *
 * A destination page is statically rendered and revalidated on a timer, and
 * revalidation is stale-while-revalidate: the first visitor after the window
 * expires is served the OLD page and only triggers the rebuild. On a site with
 * little traffic that means a reader refreshing the page reliably sees the
 * previous render, however short the window is. Riyadh showed 43° at ten at
 * night, from an afternoon that had long since cooled to 38°, and no amount of
 * shortening the revalidation window fixes that: the number was never going to
 * be the one in the HTML they were handed.
 *
 * So the page ships with its last known reading for the first paint, and the
 * browser calls this and replaces it. Dynamic, so this handler is never itself
 * cached; the upstream call inside fetchLiveWeather keeps its own short window,
 * which is shared across everyone and is what protects the quota.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const city = new URL(request.url).searchParams.get("city") ?? "";
  if (!city) return NextResponse.json({ error: "no city" }, { status: 400 });
  const live = await fetchLiveWeather(city);
  // A weather outage must never look like a broken page: the reader simply
  // keeps the reading the page was built with.
  if (!live) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  return NextResponse.json(live, { headers: { "cache-control": "no-store" } });
}
