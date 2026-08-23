import { createSupabaseAdminClient } from "../app/supabase-admin";
async function main() {
  const s = createSupabaseAdminClient();
  const { data } = await s.from("proposals").select("reference, city, itinerary_en, itinerary_ar, notes, draft_cost_usd").eq("reference","A68E191C").maybeSingle();
  const r = data as any;
  if (!r) { console.log("no row yet"); return; }
  console.log(`${r.reference}  "${r.city}"  en:${(r.itinerary_en??"").length} ar:${(r.itinerary_ar??"").length} notes:${(r.notes??"").length} cost:${r.draft_cost_usd??"-"}`);
  const n = r.notes ?? "";
  const i = n.indexOf("AI self-check");
  if (i >= 0) console.log("SELF-CHECK >>> " + n.slice(i, i + 420));
}
main().then(() => process.exit(0));
