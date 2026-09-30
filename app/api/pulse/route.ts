import { createHmac, timingSafeEqual } from "node:crypto";
import { createSupabaseAdminClient } from "../../supabase-admin";

// The numbers behind Habib's iPhone home-screen widget (Scriptable).
//
// 30 Sep 2026: he wanted to see the site at a glance without opening
// anything. Visitors live in Vercel and Google, which would need new API
// credentials; plan requests live here, and they are the number that matters.
// So this returns only totals: counts, the AI cost of drafting, and the city
// and time of the latest request. No names, emails, phones or plan links.
//
// The key is derived from the service-role secret the server already has, so
// there is no extra secret to set up. It changes only if that secret is rotated.
// A wrong or missing key gets a plain 404 so the route does not advertise itself.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pulseKey() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) return null;
  return createHmac("sha256", secret).update("memories-pulse-v1").digest("hex").slice(0, 32);
}

function keyMatches(given: string | null) {
  const expected = pulseKey();
  if (!expected || !given || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

type Row = {
  created_at: string;
  city: string | null;
  status: string | null;
  review_state: string | null;
  sent_at: string | null;
  drafted_at: string | null;
  draft_cost_usd: number | null;
};

export async function GET(request: Request) {
  if (!keyMatches(new URL(request.url).searchParams.get("key"))) {
    return new Response("Not found", { status: 404 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("created_at, city, status, review_state, sent_at, drafted_at, draft_cost_usd")
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: "Could not read requests." }, { status: 500 });

  const rows = (data ?? []) as Row[];
  const now = Date.now();
  const since = (hours: number) => rows.filter((r) => now - Date.parse(r.created_at) <= hours * 3_600_000);
  const cost = (list: Row[]) => Math.round(list.reduce((sum, r) => sum + (Number(r.draft_cost_usd) || 0), 0) * 100) / 100;
  const day = since(24);
  const week = since(24 * 7);
  const latest = rows[0];

  // Same buckets as the reviewer page, so the widget and /internal agree.
  const waitingForYou = rows.filter((r) => r.review_state === "flagged" && !r.sent_at).length;
  const sendingAutomatically = rows.filter((r) => r.review_state === "clean" && !r.sent_at && r.status !== "published").length;
  const beingWritten = rows.filter((r) => !r.drafted_at && !r.sent_at && r.status !== "published").length;

  return Response.json(
    {
      requests: { last24h: day.length, last7d: week.length, total: rows.length },
      plans: { waitingForYou, sendingAutomatically, beingWritten },
      aiCostUsd: { last24h: cost(day), last7d: cost(week) },
      latest: latest ? { city: latest.city, at: latest.created_at } : null,
      generatedAt: new Date(now).toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
