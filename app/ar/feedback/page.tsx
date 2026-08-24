import type { Metadata } from "next";
import { FeedbackForm } from "../../components/feedback-form";

export const metadata: Metadata = {
  title: "قل لنا رأيك",
  description: "شاركنا رأيك في ميموريز. ما الذي أعجبك، وما الذي لم يعجبك، وما الذي تتمنى أن نضيفه.",
};

export default async function FeedbackPageAr({ searchParams }: { searchParams: Promise<{ about?: string }> }) {
  const { about = "" } = await searchParams;
  return (
    <main className="innerPage feedbackPage" dir="rtl">
      <section className="container feedbackIntro">
        <p className="kicker">قل لنا رأيك</p>
        <h1>نسمع منك<br /><em>خير من ألا نسمع.</em></h1>
        <p>
          ميموريز مشروع صغير وما زال يُبنى، وهذا هو الجانب الجميل فيه: ما تكتبه هنا يصل إلى من يبنيه فعلًا، لا إلى
          طابور انتظار. قل لنا ما الذي نفع، وما الذي وقف في طريقك، أو أي وجهة تتمنى أن نغطيها. ولست مضطرًا لترك اسمك.
        </p>
      </section>
      <section className="container feedbackFormWrap">
        <FeedbackForm locale="ar" about={about} />
      </section>
    </main>
  );
}
