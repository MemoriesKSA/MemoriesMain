import type { CSSProperties } from "react";

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

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--line)",
  fontSize: 14,
  marginBottom: 14,
  fontFamily: "inherit",
};

const labelStyle: CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 5 };

export function ProposalForm({
  action,
  defaultValues,
  submitLabel,
  publicUrl,
  publishAction,
  status,
  error,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: ProposalFormValues;
  submitLabel: string;
  publicUrl?: string;
  publishAction?: (formData: FormData) => void | Promise<void>;
  status?: string;
  error?: string;
}) {
  const v = defaultValues ?? {};

  return (
    <div style={{ minHeight: "100vh", background: "var(--ivory)", padding: "40px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <a href="/internal/journeys" style={{ color: "var(--muted)", fontSize: 13, textDecoration: "none" }}>
            &larr; All journeys
          </a>
          {status && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 999,
                background: status === "published" ? "rgba(200,149,63,.15)" : "rgba(106,116,111,.12)",
                color: status === "published" ? "var(--gold)" : "var(--muted)",
              }}
            >
              {status}
            </span>
          )}
        </div>

        {publicUrl && (
          <div style={{ background: "rgba(200,149,63,.1)", border: "1px solid var(--gold-light)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>
            Customer link:{" "}
            <a href={publicUrl} target="_blank" rel="noreferrer" style={{ color: "var(--ink)", fontWeight: 600 }}>
              {publicUrl}
            </a>
          </div>
        )}

        {error && <p style={{ color: "#b3261e", fontSize: 13, marginBottom: 16 }}>{decodeURIComponent(error)}</p>}

        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: 28 }}>
          <form action={action}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              <div style={{ paddingRight: 8 }}>
                <label style={labelStyle} htmlFor="reference">Reference</label>
                <input id="reference" name="reference" defaultValue={v.reference} required style={inputStyle} placeholder="e.g. 6219E747" />
              </div>
              <div style={{ paddingLeft: 8 }}>
                <label style={labelStyle} htmlFor="city">City</label>
                <input id="city" name="city" defaultValue={v.city} required style={inputStyle} />
              </div>
              <div style={{ paddingRight: 8 }}>
                <label style={labelStyle} htmlFor="customerName">Customer name</label>
                <input id="customerName" name="customerName" defaultValue={v.customerName} required style={inputStyle} />
              </div>
              <div style={{ paddingLeft: 8 }}>
                <label style={labelStyle} htmlFor="customerEmail">Customer email</label>
                <input id="customerEmail" name="customerEmail" type="email" defaultValue={v.customerEmail} required style={inputStyle} />
              </div>
              <div style={{ paddingRight: 8 }}>
                <label style={labelStyle} htmlFor="customerPhone">Phone (optional)</label>
                <input id="customerPhone" name="customerPhone" defaultValue={v.customerPhone} style={inputStyle} />
              </div>
              <div />
              <div style={{ paddingRight: 8 }}>
                <label style={labelStyle} htmlFor="fromDate">From date</label>
                <input id="fromDate" name="fromDate" type="date" defaultValue={v.fromDate} style={inputStyle} />
              </div>
              <div style={{ paddingLeft: 8 }}>
                <label style={labelStyle} htmlFor="toDate">To date</label>
                <input id="toDate" name="toDate" type="date" defaultValue={v.toDate} style={inputStyle} />
              </div>
              <div style={{ paddingRight: 8 }}>
                <label style={labelStyle} htmlFor="currency">Currency</label>
                <input id="currency" name="currency" defaultValue={v.currency ?? "SAR"} style={inputStyle} />
              </div>
              <div style={{ paddingLeft: 8 }}>
                <label style={labelStyle} htmlFor="price">Price</label>
                <input id="price" name="price" type="number" step="0.01" defaultValue={v.price} style={inputStyle} />
              </div>
            </div>

            <label style={labelStyle} htmlFor="itineraryEn">
              Itinerary (English) — this is what the customer sees, write it as the finished plan, not internal notes
            </label>
            <textarea id="itineraryEn" name="itineraryEn" defaultValue={v.itineraryEn} rows={12} style={{ ...inputStyle, fontFamily: "monospace", fontSize: 13 }} />

            <label style={labelStyle} htmlFor="itineraryAr">
              Itinerary (Arabic)
            </label>
            <textarea id="itineraryAr" name="itineraryAr" defaultValue={v.itineraryAr} dir="rtl" rows={12} style={{ ...inputStyle, fontFamily: "monospace", fontSize: 13 }} />

            <label style={labelStyle} htmlFor="notes">
              Internal notes (optional, never shown to the customer)
            </label>
            <textarea id="notes" name="notes" defaultValue={v.notes} rows={3} style={inputStyle} />

            <button
              type="submit"
              style={{ padding: "12px 22px", borderRadius: 10, border: "none", background: "var(--ink)", color: "var(--paper)", fontWeight: 600, fontSize: 14, cursor: "pointer", marginTop: 6 }}
            >
              {submitLabel}
            </button>
          </form>

          {publishAction && (
            <form action={publishAction} style={{ marginTop: 12 }}>
              <button
                type="submit"
                style={{ padding: "12px 22px", borderRadius: 10, border: "1px solid var(--gold)", background: "transparent", color: "var(--gold)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
              >
                {status === "published" ? "Re-publish & re-notify customer" : "Publish & email customer"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
