import { notFound } from "next/navigation";
import { FollowStages } from "../follow-stages-view";

// A way to look at the follow page without a database row or an eight-hour
// wait. Development only: notFound() in production means the route does not
// exist for anybody who finds the URL.
//
//   /follow/preview            a request four minutes old, mid-write
//   /follow/preview?at=20      twenty minutes in, waiting for release
//   /follow/preview?at=490     sent
//   /follow/preview?priority=1 the one-hour window
//   /follow/preview?ar=1       the Arabic side

export default async function FollowPreview({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const params = await searchParams;
  const one = (k: string) => (Array.isArray(params[k]) ? params[k][0] : params[k]);

  const minutes = Number(one("at") ?? 4);
  const priority = one("priority") === "1";
  const ar = one("ar") === "1";
  const needsReview = one("review") === "1";

  const submittedAt = new Date(Date.now() - minutes * 60_000);
  const windowMinutes = priority ? 60 : 480;
  const drafted = minutes >= 15 ? new Date(submittedAt.getTime() + 15 * 60_000) : null;
  const releaseAt = new Date(submittedAt.getTime() + windowMinutes * 60_000);
  const sentAt = minutes >= windowMinutes + 2 ? new Date(submittedAt.getTime() + (windowMinutes + 2) * 60_000) : null;

  return (
    <FollowStages
      locale={ar ? "ar" : "en"}
      city={ar ? "دبي" : "Dubai"}
      dates="2026-11-12 — 2026-11-15"
      priority={priority}
      needsReview={needsReview}
      input={{ submittedAt, draftedAt: drafted, releaseAt, sentAt, needsReview, now: new Date() }}
    />
  );
}
