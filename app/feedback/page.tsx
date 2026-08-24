import type { Metadata } from "next";
import { FeedbackForm } from "../components/feedback-form";

export const metadata: Metadata = {
  title: "Tell us what you think",
  description: "Share feedback with the MEMORIES Travel team. What worked, what didn't, and what you'd like us to build next.",
};

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ about?: string }> }) {
  // ?about= carries an optional subject, e.g. the country slug from a page
  // saying we are still working on that destination. It turns "I want this
  // one" into something countable rather than prose someone has to tally.
  const { about = "" } = await searchParams;
  return (
    <main className="innerPage feedbackPage">
      <section className="container feedbackIntro">
        <p className="kicker">Tell us what you think</p>
        <h1>We would rather hear it<br /><em>than not.</em></h1>
        <p>
          MEMORIES is small and still being built, which is the good part: what you say here reaches the people
          making it, not a queue. Tell us what worked, what got in your way, or which destination you wish we
          covered. You do not need to leave your name.
        </p>
      </section>
      <section className="container feedbackFormWrap">
        <FeedbackForm about={about} />
      </section>
    </main>
  );
}
