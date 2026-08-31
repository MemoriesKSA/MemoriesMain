import Link from "next/link";
import { redirect } from "next/navigation";
import { getReviewerEmail } from "../../supabase-server";
import { createSupabaseAdminClient } from "../../supabase-admin";
import { reviewerT } from "../i18n";
import { getReviewerLocale } from "../get-locale";
import { LocaleToggle } from "../locale-toggle";
import { JourneysList } from "./journeys-list";

export default async function JourneysListPage({ searchParams }: { searchParams: Promise<{ error?: string; deleted?: string; sent?: string }> }) {
  const email = await getReviewerEmail();
  if (!email) redirect("/internal/login");

  const search = await searchParams;
  const locale = await getReviewerLocale();
  const t = reviewerT(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";

  const supabase = createSupabaseAdminClient();
  const { data: proposals } = await supabase
    .from("proposals")
    .select("id, reference, customer_name, city, status, updated_at, revision_used, revision_note, revision_requested_at, review_state, release_at, sent_at, drafted_at")
    .order("updated_at", { ascending: false });

  const draftCount = proposals?.filter((p) => p.status !== "published").length ?? 0;
  const publishedCount = (proposals?.length ?? 0) - draftCount;

  // The only division that matters day to day: what is waiting for a person,
  // and what is going out on its own. A plan the self-check flagged is never
  // released automatically, so if nobody looks at these they wait forever.
  // That is exactly what happened to a real customer's Langkawi plan, which
  // sat finished and unsent for thirty-one hours because nothing surfaced it.
  const needsYou = (proposals ?? []).filter((p) => p.review_state === "flagged" && !p.sent_at);
  const scheduled = (proposals ?? []).filter((p) => p.review_state === "clean" && !p.sent_at && p.status !== "published");
  // Not written yet is not the same as written but unchecked. A request that
  // arrived two minutes ago has no verdict because there is nothing to check.
  const unchecked = (proposals ?? []).filter((p) => !p.review_state && !p.sent_at && p.status !== "published" && p.drafted_at);

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
            {(needsYou.length > 0 || scheduled.length > 0 || unchecked.length > 0) && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                {needsYou.length > 0 && (
                  <span style={{ padding: "6px 12px", borderRadius: 999, background: "#f7e5e3", color: "#9c2f2a", fontSize: 12, fontWeight: 700 }}>
                    {needsYou.length} flagged, waiting for you
                  </span>
                )}
                {scheduled.length > 0 && (
                  <span style={{ padding: "6px 12px", borderRadius: 999, background: "#e7f1ea", color: "#0f6b45", fontSize: 12, fontWeight: 700 }}>
                    {scheduled.length} clean, sending automatically
                  </span>
                )}
                {unchecked.length > 0 && (
                  <span style={{ padding: "6px 12px", borderRadius: 999, background: "#f8efdd", color: "#9a6410", fontSize: 12, fontWeight: 700 }}>
                    {unchecked.length} never checked, will not send
                  </span>
                )}
              </div>
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

        {search.sent && (
          <div style={{ marginBottom: 18, padding: "12px 16px", borderRadius: 10, background: "rgba(19,132,103,.1)", border: "1px solid rgba(19,132,103,.3)", color: "#0f6b52", fontSize: 13, fontWeight: 600 }}>
            {t.sentBanner(decodeURIComponent(search.sent))}
          </div>
        )}
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
