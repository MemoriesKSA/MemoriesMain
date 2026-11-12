import { redirect, notFound } from "next/navigation";
import { getReviewerEmail } from "../../../supabase-server";
import { createSupabaseAdminClient } from "../../../supabase-admin";
import { getReviewerLocale } from "../../get-locale";
import { reviewerT } from "../../i18n";
import { ProposalForm } from "../proposal-form";
import { updateProposal, publishProposal, setPlanPaid } from "../actions";
import { planUrl } from "../../../journey/plan-link";
import { loadRequestAnswers } from "../../../request-answers";

export default async function EditProposalPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; published?: string }>;
}) {
  const email = await getReviewerEmail();
  if (!email) redirect("/internal/login");

  const { id } = await params;
  const search = await searchParams;

  const supabase = createSupabaseAdminClient();
  const { data: proposal } = await supabase.from("proposals").select("*").eq("id", id).single();
  if (!proposal) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const locale = await getReviewerLocale();
  const t = reviewerT(locale);
  // What the customer typed in the form (kept since 12 Nov 2026; older requests have none).
  const asked = await loadRequestAnswers(supabase, proposal.reference);
  const askedRows = asked
    ? Object.entries(asked.answers).filter(([, value]) => value !== "" && value != null && !(Array.isArray(value) && value.length === 0))
    : [];

  return (
    <>
    {askedRows.length > 0 && (
      <details open style={{ maxWidth: 980, margin: "16px auto 0", padding: "12px 16px", border: "1px solid #ddd6c6", borderRadius: 12, background: "#fbf8f1", fontSize: 13 }}>
        <summary style={{ cursor: "pointer", fontWeight: 700 }}>{locale === "ar" ? "إجابات العميل في النموذج" : "What the customer asked for (form answers)"}</summary>
        <dl style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "4px 14px", margin: "10px 0 0" }}>
          {askedRows.map(([key, value]) => (
            <div key={key} style={{ display: "contents" }}>
              <dt style={{ color: "#6a746f" }}>{key}</dt>
              <dd style={{ margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{Array.isArray(value) ? value.join(", ") : typeof value === "object" ? JSON.stringify(value) : String(value)}</dd>
            </div>
          ))}
        </dl>
      </details>
    )}
    <ProposalForm
      locale={locale}
      action={updateProposal.bind(null, id)}
      publishAction={publishProposal.bind(null, id)}
      submitLabel={t.saveChanges}
      status={proposal.status}
      paid={proposal.paid === true}
      paidRef={proposal.payment_ref ?? null}
      unlockAction={setPlanPaid.bind(null, id)}
      publicUrl={planUrl(siteUrl, proposal.public_token)}
      error={search.error}
      justSaved={search.saved === "1"}
      justPublished={search.published === "1"}
      defaultValues={{
        reference: proposal.reference,
        customerName: proposal.customer_name,
        customerEmail: proposal.customer_email,
        customerPhone: proposal.customer_phone ?? "",
        city: proposal.city,
        fromDate: proposal.from_date ?? "",
        toDate: proposal.to_date ?? "",
        currency: proposal.currency,
        price: proposal.price != null ? String(proposal.price) : "",
        itineraryEn: proposal.itinerary_en ?? "",
        itineraryAr: proposal.itinerary_ar ?? "",
        notes: proposal.notes ?? "",
      }}
    />
    </>
  );
}
