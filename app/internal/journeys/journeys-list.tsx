"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { reviewerT, type ReviewerLocale } from "../i18n";
import { deleteProposal, sendPlanNow } from "./actions";
import { DeleteButton } from "./delete-button";
import { SendNowButton } from "./send-now-button";

type ProposalRow = {
  id: string;
  reference: string;
  customer_name: string;
  city: string;
  status: string;
  updated_at: string;
  // A requested revision is recorded in the database first and emailed
  // second. If that email never lands, the request would otherwise sit here
  // unseen while the customer has spent their one revision and been told we
  // got it, so the list has to show it too.
  revision_used?: boolean | null;
  revision_note?: string | null;
  revision_requested_at?: string | null;
  // What the send-now button needs to know: whether there is a draft to
  // send, whether it has gone already, and whether the self-check flagged it.
  review_state?: string | null;
  sent_at?: string | null;
  drafted_at?: string | null;
};

function timeAgo(value: string, locale: ReviewerLocale) {
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return "";
  const minutes = Math.round((Date.now() - then) / 60_000);
  const ar = locale === "ar";
  if (minutes < 1) return ar ? "الآن" : "just now";
  if (minutes < 60) return ar ? `قبل ${minutes} د` : `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return ar ? `قبل ${hours} س` : `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return ar ? `قبل ${days} يوم` : `${days}d ago`;
  return new Date(value).toLocaleDateString(ar ? "ar" : "en-US", { month: "short", day: "numeric", year: "numeric", calendar: "gregory" });
}

export function JourneysList({ proposals, locale }: { proposals: ProposalRow[]; locale: ReviewerLocale }) {
  const t = reviewerT(locale);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return proposals;
    return proposals.filter(
      (p) => p.reference.toLowerCase().includes(q) || p.customer_name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)
    );
  }, [proposals, query]);

  return (
    <>
      {!!proposals.length && (
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={16} style={{ position: "absolute", insetInlineStart: 15, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px 16px",
              paddingInlineStart: 42,
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontSize: 14,
              fontFamily: "inherit",
            }}
          />
        </div>
      )}

      <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow)" }}>
        {!proposals.length && (
          <div style={{ padding: "56px 24px", textAlign: "center" }}>
            <p style={{ margin: "0 0 6px", fontFamily: locale === "ar" ? "inherit" : "var(--font-display), Georgia, serif", fontSize: 20, color: "var(--ink)" }}>{t.noProposalsTitle}</p>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>{t.noProposalsBody}</p>
          </div>
        )}
        {!!proposals.length && !filtered.length && (
          <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>{t.noSearchResults}</div>
        )}
        {filtered.map((p, i) => {
          const published = p.status === "published";
          const awaitingRevision = !!p.revision_used && !!p.revision_note;
          const label = `${p.customer_name} · ${p.city}`;
          // Offered only where it can actually do something: the pipeline has
          // written a draft and the customer has not been sent it yet. A row
          // with no drafted_at has nothing to send, and offering the button
          // there would only produce an error a moment later.
          const flagged = p.review_state === "flagged";
          const canSendNow = !p.sent_at && !!p.drafted_at;
          return (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "18px 20px",
                borderBottom: i === filtered.length - 1 ? "none" : "1px solid var(--line)",
              }}
            >
              <Link href={`/internal/journeys/${p.id}`} style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, textDecoration: "none", color: "var(--ink)" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>
                    {t.reference(p.reference)} · {t.updatedAgo(timeAgo(p.updated_at, locale))}
                  </div>
                  {awaitingRevision && (
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                      <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.4, padding: "3px 9px", borderRadius: 999, background: "rgba(231,185,79,.18)", border: "1px solid var(--gold)", color: "var(--ink)", textTransform: locale === "ar" ? "none" : "uppercase" }}>
                        {locale === "ar" ? "طلب تعديل" : "Revision requested"}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 380 }}>
                        {p.revision_note}
                      </span>
                    </div>
                  )}
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 11.5,
                    fontWeight: 800,
                    letterSpacing: 0.3,
                    padding: "5px 12px",
                    borderRadius: 999,
                    textTransform: locale === "ar" ? "none" : "uppercase",
                    background: published ? "rgba(200,149,63,.15)" : "rgba(106,116,111,.12)",
                    color: published ? "var(--gold)" : "var(--muted)",
                  }}
                >
                  {published ? t.statusPublished : t.statusDraft}
                </span>
              </Link>
              {canSendNow && (
                <SendNowButton
                  action={sendPlanNow.bind(null, p.id)}
                  confirmText={flagged ? t.sendNowConfirmFlagged(label) : t.sendNowConfirm(label)}
                  ariaLabel={t.sendNowAria(label)}
                  title={t.sendNowTitle}
                  label={t.sendNow}
                  flagged={flagged}
                />
              )}
              <DeleteButton
                action={deleteProposal.bind(null, p.id)}
                confirmText={published ? t.deleteConfirmPublished(label) : t.deleteConfirmDraft(label)}
                ariaLabel={t.deleteAria(label)}
                title={t.deleteTitle}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
