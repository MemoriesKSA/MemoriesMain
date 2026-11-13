// The team's side of the dashboard: one private JSON file in Supabase Storage.
//
// The plan numbers on the dashboard are read live from the proposals table. Everything
// else Habib asked to see (who on the team is doing what, the posting calendar, the
// funnel, projections, the price plan, what is waiting for his yes) lives in the team's
// notes on the PM's computer, which Vercel cannot read. The PM's sync script
// (MemoriesBackups\pm-tools\dash-sync.mts) builds this file from those notes and uploads
// it after every daily meeting and after any decision, so the page never needs a deploy
// to change. Customer refs and cities only: no names, emails or phones ever go in here.

import type { SupabaseClient } from "@supabase/supabase-js";

/** Private. Read on the server with the admin client, never served as a file. */
export const DASHBOARD_BUCKET = "pm-dashboard";
export const SNAPSHOT_PATH = "snapshot.json";

export type Tone = "good" | "warn" | "bad" | "info";

export type Snapshot = {
  generatedAt: string;
  verdict: { label: string; tone: Tone; line: string; nextCheck: string };
  needsYou: { text: string; from: string; since?: string }[];
  funnel: { week: string; steps: { label: string; value: string; rate?: string }[]; leak: string };
  scoreboard: { week: string; posts: string; views: string; followers: string; visitors: string; form: string }[];
  projections: { cols: string[]; rows: { name: string; cells: string[] }[]; assumption: string };
  price: {
    summary: string;
    earliest: string;
    conditions: { label: string; now: number; target: number; unit: string }[];
    firstTest: string;
  };
  experiments: { name: string; owner: string; metric: string; status: string; tone: Tone }[];
  team: { role: string; model: string; doing: string; lastUpdate?: string | null }[];
  schedule: { post: number; title: string; slotUk: string; done: string[]; approved: boolean }[];
  decisions: { date: string; items: string[] };
};

export async function loadSnapshot(supabase: SupabaseClient): Promise<Snapshot | null> {
  const { data, error } = await supabase.storage.from(DASHBOARD_BUCKET).download(SNAPSHOT_PATH);
  if (error || !data) return null;
  try {
    return JSON.parse(await data.text()) as Snapshot;
  } catch {
    return null;
  }
}
