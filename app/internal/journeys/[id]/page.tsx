import { redirect, notFound } from "next/navigation";
import { getReviewerEmail } from "../../../supabase-server";
import { createSupabaseAdminClient } from "../../../supabase-admin";
import { ProposalForm } from "../proposal-form";
import { updateProposal, publishProposal } from "../actions";

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

  return (
    <ProposalForm
      action={updateProposal.bind(null, id)}
      publishAction={publishProposal.bind(null, id)}
      submitLabel="Save changes"
      status={proposal.status}
      publicUrl={`${siteUrl}/journey/${proposal.public_token}`}
      error={search.error}
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
  );
}
