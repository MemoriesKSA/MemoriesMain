import type { Metadata } from "next";
import { JourneyPlanner } from "../../components/journey-planner";

export const metadata: Metadata = {
  title: "صمّم رحلتك",
  description: "شارك ميموريز تفاصيل رحلتك المثالية، ودع مصمم رحلات متخصص يتولى الباقي.",
};

export default function DesignJourneyPage() {
  return (
    <main className="innerPage">
      <section className="formHero">
        <div className="container formHeroGrid">
          <div>
            <p className="kicker light">قصتك تبدأ من هنا</p>
            <h1>لنصمّم رحلة<br /><em>لا تشبه إلا أنت.</em></h1>
            <p>شاركنا التفاصيل الأولى بلا دفع أو التزام؛ مجرد محادثة هادئة ومدروسة مع مصمم رحلات يفهمك.</p>
            <ol>
              <li><span>١</span>أخبرنا بما تتخيله</li>
              <li><span>٢</span>تعرّف على مصمم رحلتك</li>
              <li><span>٣</span>استلم مقترحك المصمم خصيصًا لك</li>
            </ol>
          </div>
          <JourneyPlanner locale="ar" />
        </div>
      </section>
    </main>
  );
}
