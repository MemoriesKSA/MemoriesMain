import { redirect } from "next/navigation";
import { getReviewerEmail } from "../../../supabase-server";
import { getReviewerLocale } from "../../get-locale";
import { reviewerT } from "../../i18n";
import { createProposal } from "../actions";
import { ProposalForm } from "../proposal-form";

export default async function NewProposalPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const email = await getReviewerEmail();
  if (!email) redirect("/internal/login");

  const params = await searchParams;
  const locale = await getReviewerLocale();
  const t = reviewerT(locale);

  return <ProposalForm locale={locale} action={createProposal} submitLabel={t.createProposal} error={params.error} />;
}
