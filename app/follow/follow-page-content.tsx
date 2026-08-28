import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "../supabase-admin";
import { FollowStages } from "./follow-stages-view";
import type { FollowInput } from "./stages";

// Fetches one request and hands it to the view.
//
// The select is deliberately narrow: the trip and the clocks, nothing about
// the person and nothing from the plan itself. Somebody who came by this link
// uninvited learns that a Dubai trip is being written, and nothing else.

export async function FollowPageContent({ token, locale = "en" }: { token: string; locale?: "en" | "ar" }) {
  const supabase = createSupabaseAdminClient();

  const { data } = await supabase
    .from("proposals")
    .select("city, from_date, to_date, created_at, drafted_at, release_at, sent_at, priority, notes")
    .eq("follow_token", token)
    .maybeSingle();

  if (!data) notFound();

  // A flagged plan really is waiting on a person, and saying so is true.
  const needsReview = /needs a look/i.test(String(data.notes ?? ""));

  const input: FollowInput = {
    submittedAt: new Date(String(data.created_at)),
    draftedAt: data.drafted_at ? new Date(String(data.drafted_at)) : null,
    releaseAt: data.release_at ? new Date(String(data.release_at)) : null,
    sentAt: data.sent_at ? new Date(String(data.sent_at)) : null,
    needsReview,
    now: new Date(),
  };

  return (
    <FollowStages
      input={input}
      locale={locale}
      city={String(data.city ?? "")}
      dates={[data.from_date, data.to_date].filter(Boolean).join(" — ")}
      priority={data.priority === true}
      needsReview={needsReview}
    />
  );
}
