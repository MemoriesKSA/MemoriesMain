import Link from "next/link";
import { redirect } from "next/navigation";
import { getReviewerEmail } from "../../supabase-server";
import { createSupabaseAdminClient } from "../../supabase-admin";

export default async function JourneysListPage() {
  const email = await getReviewerEmail();
  if (!email) redirect("/internal/login");

  const supabase = createSupabaseAdminClient();
  const { data: proposals } = await supabase
    .from("proposals")
    .select("id, reference, customer_name, city, status, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div style={{ minHeight: "100vh", background: "var(--ivory)", padding: "40px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "var(--gold)" }}>MEMORIES · REVIEWER</p>
            <h1 style={{ margin: 0, fontFamily: "var(--font-display), Georgia, serif", fontSize: 30, color: "var(--ink)" }}>Journeys</h1>
          </div>
          <Link
            href="/internal/journeys/new"
            style={{ padding: "12px 20px", borderRadius: 10, background: "var(--ink)", color: "var(--paper)", textDecoration: "none", fontWeight: 600, fontSize: 14 }}
          >
            New proposal
          </Link>
        </div>

        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
          {!proposals?.length && <p style={{ padding: 24, color: "var(--muted)" }}>No proposals yet.</p>}
          {proposals?.map((p) => (
            <Link
              key={p.id}
              href={`/internal/journeys/${p.id}`}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--line)", textDecoration: "none", color: "var(--ink)" }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  {p.customer_name} · {p.city}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>Reference {p.reference}</div>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: p.status === "published" ? "rgba(200,149,63,.15)" : "rgba(106,116,111,.12)",
                  color: p.status === "published" ? "var(--gold)" : "var(--muted)",
                }}
              >
                {p.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
