"use client";

import { useRef, useTransition, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, ExternalLink, Info } from "lucide-react";
import { reviewerT, type ReviewerLocale } from "../i18n";
import { LocaleToggle } from "../locale-toggle";

type ProposalFormValues = {
  reference?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  city?: string;
  fromDate?: string;
  toDate?: string;
  currency?: string;
  price?: string;
  itineraryEn?: string;
  itineraryAr?: string;
  notes?: string;
};

type ProposalAction = (formData: FormData) => Promise<void>;

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 13px",
  borderRadius: 9,
  border: "1px solid var(--line)",
  fontSize: 14,
  marginBottom: 16,
  fontFamily: "inherit",
  background: "var(--ivory)",
  color: "var(--ink)",
};

const labelStyle: CSSProperties = { display: "block", fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6 };
const sectionHeadingStyle: CSSProperties = { margin: "0 0 16px", fontSize: 11.5, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--gold)" };
const hintStyle: CSSProperties = { margin: "-8px 0 14px", fontSize: 12, color: "var(--muted)", lineHeight: 1.5 };

function Section({ heading, hint, children, last }: { heading: string; hint?: string; children: ReactNode; last?: boolean }) {
  return (
    <section style={{ marginBottom: last ? 0 : 30, paddingBottom: last ? 0 : 30, borderBottom: last ? "none" : "1px solid var(--line)" }}>
      <p style={sectionHeadingStyle}>{heading}</p>
      {hint && <p style={hintStyle}>{hint}</p>}
      {children}
    </section>
  );
}

function Banner({ tone, text }: { tone: "success" | "error" | "info"; text: string }) {
  const palette = {
    success: { bg: "rgba(19,132,103,.1)", border: "rgba(19,132,103,.3)", fg: "#0f6b52", icon: <CheckCircle2 size={16} /> },
    error: { bg: "rgba(179,38,30,.08)", border: "rgba(179,38,30,.3)", fg: "#8f2c25", icon: null },
    info: { bg: "rgba(200,149,63,.1)", border: "var(--gold-light)", fg: "var(--ink)", icon: <Info size={15} /> },
  }[tone];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 20,
        padding: "12px 16px",
        borderRadius: 10,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        color: palette.fg,
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.5,
      }}
    >
      {palette.icon}
      <span>{text}</span>
    </div>
  );
}

export function ProposalForm({
  action,
  defaultValues,
  submitLabel,
  publicUrl,
  publishAction,
  status,
  error,
  justSaved,
  justPublished,
  locale,
  paid,
  paidRef,
  unlockAction,
}: {
  action: ProposalAction;
  defaultValues?: ProposalFormValues;
  submitLabel: string;
  publicUrl?: string;
  publishAction?: ProposalAction;
  status?: string;
  error?: string;
  paid?: boolean;
  paidRef?: string | null;
  unlockAction?: (paid: boolean) => Promise<void>;
  justSaved?: boolean;
  justPublished?: boolean;
  locale: ReviewerLocale;
}) {
  const t = reviewerT(locale);
  const v = defaultValues ?? {};
  const formRef = useRef<HTMLFormElement>(null);
  const [savePending, startSave] = useTransition();
  const [publishPending, startPublish] = useTransition();
  const anyPending = savePending || publishPending;

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    startSave(() => action(fd));
  }

  function handlePublish() {
    if (!formRef.current || !publishAction) return;
    const proceed = window.confirm(status === "published" ? t.confirmRepublish : t.confirmPublish);
    if (!proceed) return;
    const fd = new FormData(formRef.current);
    startPublish(() => publishAction(fd));
  }

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "var(--ivory)", padding: "40px 24px", fontFamily: locale === "ar" ? "Tahoma, Arial, sans-serif" : undefined }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, gap: 12, flexWrap: "wrap" }}>
          <a href="/internal/journeys" style={{ color: "var(--muted)", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
            {t.allJourneys}
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {status && (
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: 0.3,
                  textTransform: locale === "ar" ? "none" : "uppercase",
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: status === "published" ? "rgba(200,149,63,.15)" : "rgba(106,116,111,.12)",
                  color: status === "published" ? "var(--gold)" : "var(--muted)",
                }}
              >
                {status === "published" ? t.statusPublished : t.statusDraft}
              </span>
            )}
            <LocaleToggle locale={locale} label={t.langToggle} />
          </div>
        </div>

        {justSaved && <Banner tone="success" text={t.changesSaved} />}
        {justPublished && <Banner tone="success" text={t.publishedBanner} />}
        {error && <Banner tone="error" text={decodeURIComponent(error)} />}

        {status === "published" && unlockAction ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              background: paid ? "rgba(47,122,92,.10)" : "rgba(106,116,111,.10)",
              border: `1px solid ${paid ? "#8fbfa8" : "var(--line)"}`,
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 14,
              fontSize: 13,
            }}
          >
            <span style={{ fontWeight: 700 }}>
              {paid
                ? paidRef === "manual"
                  ? "Unlocked manually — customer sees the full plan"
                  : "Paid — customer sees the full plan"
                : "Locked — customer sees the overview and day one of each stop"}
            </span>
            <form action={unlockAction.bind(null, !paid)} style={{ marginInlineStart: "auto" }}>
              <button
                type="submit"
                style={{
                  padding: "8px 14px",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  background: "var(--paper)",
                  color: "var(--ink)",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {paid ? "Lock again" : "Unlock for this customer"}
              </button>
            </form>
          </div>
        ) : null}

        {status === "published" && publicUrl ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(200,149,63,.1)",
              border: "1px solid var(--gold-light)",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              fontSize: 13,
            }}
          >
            <span>
              {t.customerLink}{" "}
              <a href={publicUrl} target="_blank" rel="noreferrer" dir="ltr" style={{ color: "var(--ink)", fontWeight: 700, unicodeBidi: "isolate" }}>
                {publicUrl}
              </a>
            </span>
            <a href={publicUrl} target="_blank" rel="noreferrer" style={{ marginInlineStart: "auto", color: "var(--gold)", flexShrink: 0, display: "grid" }} aria-label="Open customer link">
              <ExternalLink size={15} />
            </a>
          </div>
        ) : publishAction ? (
          <Banner tone="info" text={t.draftNote} />
        ) : null}

        <form ref={formRef} onSubmit={handleSave}>
          <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: 28, boxShadow: "var(--shadow)" }}>
            <Section heading={t.sectionCustomer}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <div>
                  <label style={labelStyle} htmlFor="reference">{t.labelReference}</label>
                  <input id="reference" name="reference" defaultValue={v.reference} required style={inputStyle} placeholder="e.g. 6219E747" />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="city">{t.labelCity}</label>
                  <input id="city" name="city" defaultValue={v.city} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="customerName">{t.labelCustomerName}</label>
                  <input id="customerName" name="customerName" defaultValue={v.customerName} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="customerEmail">{t.labelCustomerEmail}</label>
                  <input id="customerEmail" name="customerEmail" type="email" dir="ltr" defaultValue={v.customerEmail} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="customerPhone">{t.labelCustomerPhone}</label>
                  <input id="customerPhone" name="customerPhone" dir="ltr" defaultValue={v.customerPhone} style={{ ...inputStyle, marginBottom: 0 }} />
                </div>
              </div>
            </Section>

            <Section heading={t.sectionTrip}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <div>
                  <label style={labelStyle} htmlFor="fromDate">{t.labelFromDate}</label>
                  <input id="fromDate" name="fromDate" type="date" defaultValue={v.fromDate} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="toDate">{t.labelToDate}</label>
                  <input id="toDate" name="toDate" type="date" defaultValue={v.toDate} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="currency">{t.labelCurrency}</label>
                  <input id="currency" name="currency" dir="ltr" defaultValue={v.currency ?? "SAR"} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="price">{t.labelPrice}</label>
                  <input id="price" name="price" type="number" step="0.01" defaultValue={v.price} style={{ ...inputStyle, marginBottom: 0 }} />
                </div>
              </div>
            </Section>

            <Section heading={t.sectionItineraryEn} hint={t.itineraryEnHint}>
              <textarea id="itineraryEn" name="itineraryEn" dir="ltr" defaultValue={v.itineraryEn} rows={12} style={{ ...inputStyle, fontFamily: "monospace", fontSize: 13, marginBottom: 0, lineHeight: 1.6 }} />
            </Section>

            <Section heading={t.sectionItineraryAr}>
              <textarea id="itineraryAr" name="itineraryAr" defaultValue={v.itineraryAr} dir="rtl" rows={12} style={{ ...inputStyle, fontFamily: "monospace", fontSize: 13, marginBottom: 0, lineHeight: 1.6 }} />
            </Section>

            <Section heading={t.sectionNotes} hint={t.notesHint} last>
              {/* Was rows=3, from when notes were a couple of hand-typed
                  lines. The AI draft now fills this with the self-check plus
                  the internal planning sections in both languages, which is
                  the reviewer's main reading material, so it gets at least as
                  much room as the itinerary fields above. */}
              <textarea id="notes" name="notes" defaultValue={v.notes} rows={16} style={{ ...inputStyle, marginBottom: 0, fontSize: 13, lineHeight: 1.7, resize: "vertical" }} />
            </Section>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={anyPending}
              style={{
                padding: "13px 24px",
                borderRadius: 11,
                border: "none",
                background: "var(--ink)",
                color: "var(--paper)",
                fontWeight: 700,
                fontSize: 14,
                cursor: anyPending ? "default" : "pointer",
                opacity: savePending ? 0.7 : anyPending ? 0.5 : 1,
              }}
            >
              {savePending ? t.saving : submitLabel}
            </button>

            {publishAction && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={anyPending}
                style={{
                  padding: "13px 24px",
                  borderRadius: 11,
                  border: "1px solid var(--gold)",
                  background: "transparent",
                  color: "var(--gold)",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: anyPending ? "default" : "pointer",
                  opacity: publishPending ? 0.7 : anyPending ? 0.5 : 1,
                }}
              >
                {publishPending ? (status === "published" ? t.republishing : t.publishing) : status === "published" ? t.republish : t.publishAndEmail}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
