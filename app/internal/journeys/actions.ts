"use server";

import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { getReviewerEmail } from "../../supabase-server";
import { createSupabaseAdminClient } from "../../supabase-admin";
import { sendProposalReadyEmail } from "../../proposal-email";

function readInput(formData: FormData) {
  const get = (key: string) => String(formData.get(key) ?? "").trim();
  return {
    reference: get("reference"),
    customer_name: get("customerName"),
    customer_email: get("customerEmail"),
    customer_phone: get("customerPhone") || null,
    city: get("city"),
    from_date: get("fromDate") || null,
    to_date: get("toDate") || null,
    currency: get("currency") || "SAR",
    price: get("price") ? Number(get("price")) : null,
    itinerary_en: get("itineraryEn") || null,
    itinerary_ar: get("itineraryAr") || null,
    notes: get("notes") || null,
  };
}

async function requireReviewer() {
  const email = await getReviewerEmail();
  if (!email) redirect("/internal/login");
}

export async function createProposal(formData: FormData) {
  await requireReviewer();
  const input = readInput(formData);
  const supabase = createSupabaseAdminClient();
  const publicToken = randomBytes(24).toString("hex");

  const { data, error } = await supabase
    .from("proposals")
    .insert({ ...input, public_token: publicToken })
    .select("id")
    .single();

  if (error || !data) redirect(`/internal/journeys/new?error=${encodeURIComponent(error?.message ?? "save-failed")}`);
  redirect(`/internal/journeys/${data.id}?saved=1`);
}

export async function updateProposal(id: string, formData: FormData) {
  await requireReviewer();
  const input = readInput(formData);
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("proposals").update(input).eq("id", id);

  if (error) redirect(`/internal/journeys/${id}?error=${encodeURIComponent(error.message)}`);
  redirect(`/internal/journeys/${id}?saved=1`);
}

export async function publishProposal(id: string) {
  await requireReviewer();
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.from("proposals").update({ status: "published" }).eq("id", id).select("*").single();

  if (error || !data) redirect(`/internal/journeys/${id}?error=publish-failed`);

  await sendProposalReadyEmail(data);

  redirect(`/internal/journeys/${id}?published=1`);
}
