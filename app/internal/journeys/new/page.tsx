import { redirect } from "next/navigation";
import { getReviewerEmail } from "../../../supabase-server";
import { createProposal } from "../actions";
import { ProposalForm } from "../proposal-form";

export default async function NewProposalPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const email = await getReviewerEmail();
  if (!email) redirect("/internal/login");

  const params = await searchParams;

  return <ProposalForm action={createProposal} submitLabel="Create proposal" error={params.error} />;
}
