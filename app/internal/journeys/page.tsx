import Link from "next/link";
import { redirect } from "next/navigation";
import { getReviewerEmail } from "../../supabase-server";
import { createSupabaseAdminClient } from "../../supabase-admin";
import { reviewerT } from "../i18n";
import { getReviewerLocale } from "../get-locale";
import { LocaleToggle } from "../locale-toggle";
import { JourneysList } from "./journeys-list";

export default async function JourneysListPage({ searchParams }: { searchParams: Promise<{ error?: string; deleted?: string }> }) {
  const email = await getReviewerEmail();
  if (!email) redirect("/internal/login");

  const search = await searchParams;
  const locale = await getReviewerLocale();
  const t = reviewerT(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";

  const supabase = createSupabaseAdminClient();
  const { data: proposals } = await supabase
    .from("proposals")
    .select("id, reference, customer_name, city, status, updated_at")
    .order("updated_at", { ascending: false });

  const draftCount = proposals?.filter((p) => p.status !== "published").length ?? 0;
  const publishedCount = (proposals?.length ?? 0) - draftCount;

  return (
    <div dir={dir} style={{ minHeight: "100vh", background: "var(--ivory)", padding: "48px 24px", fontFamily: locale === "ar" ? "Tahoma, Arial, sans-serif" : undefined }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12, gap: 16, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "var(--gold)" }}>{t.reviewerKicker}</p>
            <h1 style={{ margin: 0, fontFamily: locale === "ar" ? "inherit" : "var(--font-display), Georgia, serif", fontSize: 32, color: "var(--ink)" }}>{t.journeysTitle}</h1>
            {!!proposals?.length && (
              <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--muted)" }}>{t.journeysSubtitle(draftCount, publishedCount)}</p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LocaleToggle locale={locale} label={t.langToggle} />
            <Link
              href="/internal/journeys/new"
              style={{
                padding: "13px 22px",
                borderRadius: 11,
                background: "var(--ink)",
                color: "var(--paper)",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 14,
                boxShadow: "0 10px 26px rgba(16,45,41,.16)",
              }}
            >
              {t.newProposal}
            </Link>
          </div>
        </div>

        {search.deleted === "1" && (
          <div style={{ marginBottom: 18, padding: "12px 16px", borderRadius: 10, background: "rgba(19,132,103,.1)", border: "1px solid rgba(19,132,103,.3)", color: "#0f6b52", fontSize: 13, fontWeight: 600 }}>
            {t.deletedBanner}
          </div>
        )}
        {search.error && (
          <div style={{ marginBottom: 18, padding: "12px 16px", borderRadius: 10, background: "rgba(179,38,30,.08)", border: "1px solid rgba(179,38,30,.3)", color: "#8f2c25", fontSize: 13, fontWeight: 600 }}>
            {decodeURIComponent(search.error)}
          </div>
        )}

        <JourneysList proposals={proposals ?? []} locale={locale} />
      </div>
    </div>
  );
}
