import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "../../supabase-admin";

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default async function JourneyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const supabase = createSupabaseAdminClient();
  const { data: proposal } = await supabase.from("proposals").select("*").eq("public_token", token).eq("status", "published").single();

  // Deliberately the same not-found response whether the token is wrong or
  // just belongs to a proposal that isn't published yet, don't leak which.
  if (!proposal) notFound();

  const fromDate = formatDate(proposal.from_date);
  const toDate = formatDate(proposal.to_date);
  const priceLine = proposal.price != null ? `${proposal.currency} ${Number(proposal.price).toLocaleString("en-US")}` : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--ivory)" }}>
      <div style={{ background: "var(--ink)", color: "var(--paper)", padding: "56px 24px 64px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <p style={{ margin: "0 0 10px", color: "var(--gold-light)", fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>MEMORIES · YOUR JOURNEY</p>
          <h1 style={{ margin: "0 0 14px", fontFamily: "var(--font-display), Georgia, serif", fontSize: "clamp(2.1rem,4vw,3rem)", lineHeight: 1.1 }}>
            {proposal.customer_name}&rsquo;s {proposal.city} journey
          </h1>
          <p style={{ margin: 0, color: "rgba(255,253,249,.75)", fontSize: 15 }}>
            {[fromDate && toDate ? `${fromDate} — ${toDate}` : null, `Reference ${proposal.reference}`].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "-32px auto 0", padding: "0 24px 80px" }}>
        {priceLine && (
          <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, boxShadow: "var(--shadow)", padding: "22px 28px", marginBottom: 28 }}>
            <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--muted)", fontWeight: 600, letterSpacing: 0.5 }}>TOTAL</p>
            <p style={{ margin: 0, fontFamily: "var(--font-display), Georgia, serif", fontSize: 30, color: "var(--ink)" }}>{priceLine}</p>
          </div>
        )}

        {proposal.itinerary_en && (
          <section style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, boxShadow: "var(--shadow)", padding: "32px 34px", marginBottom: proposal.itinerary_ar ? 24 : 0 }}>
            <div style={{ color: "var(--ink-2)", fontSize: 16, lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{proposal.itinerary_en}</div>
          </section>
        )}

        {proposal.itinerary_ar && (
          <section dir="rtl" style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, boxShadow: "var(--shadow)", padding: "32px 34px" }}>
            <p style={{ margin: "0 0 16px", color: "var(--gold)", fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>النسخة العربية</p>
            <div style={{ color: "var(--ink-2)", fontSize: 16, lineHeight: 1.95, whiteSpace: "pre-wrap" }}>{proposal.itinerary_ar}</div>
          </section>
        )}

        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, marginTop: 32 }}>
          Questions about this journey? Reply to the email you received, or reach us at{" "}
          <a href="mailto:memoriesksasupport@gmail.com" style={{ color: "var(--ink)" }}>
            memoriesksasupport@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
