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
        <p className="kicker">عطنا رأيك</p>
        <h1>نبي نسمع منك<br /><em>لأن رأيك يفرق معنا.</em></h1>
        <p>ميموريز مشروع صغير ولسه قاعدة نبنيه ونطوره، وأحلى شيء فيه إن كلامك يوصل لنا بشكل مباشرة.</p>
        <p>
          قل لنا وش اللي عجبك، وش اللي ما ضبط معك، أو إذا فيه شيء حسّيت إنه عطّلك أو يحتاج تحسين. وإذا فيه وجهة
          تتمنى نشملها في ميموريز، علّمنا عنها.
        </p>
        <p>ولا تشيل هم، مو لازم تكتب اسمك.</p>
      </section>
      <section className="container feedbackFormWrap">
        <FeedbackForm locale="ar" about={about} />
      </section>
    </main>
  );
}
