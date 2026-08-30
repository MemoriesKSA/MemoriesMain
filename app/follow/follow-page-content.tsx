import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "../supabase-admin";
import { FollowStages } from "./follow-stages-view";
import type { FollowInput } from "./stages";

// Fetches one request and hands it to the view.
//
// The select is deliberately narrow: the trip and the clocks, nothing about
// the person, and nothing from the plan reaches the browser. Somebody who came
// by this link uninvited learns that a Dubai trip is being written, and nothing
// else.
//
// itinerary_ar is the one exception and it is read server-side only, to answer
// a yes-or-no question: was an Arabic half ever written? Its contents are never
// passed to the view, only the boolean.

export async function FollowPageContent({ token, locale = "en" }: { token: string; locale?: "en" | "ar" }) {
  const supabase = createSupabaseAdminClient();

  const { data } = await supabase
    .from("proposals")
    .select("city, from_date, to_date, created_at, drafted_at, release_at, sent_at, priority, notes, itinerary_ar")
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
      // No Arabic half means none was ordered, so no stage promises one.
      englishOnly={!data.itinerary_ar && Boolean(data.drafted_at)}
    />
  );
}
