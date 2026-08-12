import type { Metadata } from "next";
import { JourneyPlanner } from "../../components/journey-planner";

export const metadata: Metadata = { title: "صمّم رحلة أحلامك", description: "اختر الدولة والمدينة والتواريخ وميزانية الرحلة الكاملة، ثم شارك ميموريز تفاصيل حلمك." };

export default function DesignJourneyPage() {
  return <main className="innerPage"><section className="formHero"><div className="container formHeroGrid"><div><p className="kicker light">حلمك يبدأ من هنا</p><h1>لنصمّم رحلة<br /><em>لا يحلم بها إلا أنت.</em></h1><p>اختر مسارك وشاركنا التفاصيل المهمة. سنستخدم وجهتك وتواريخك وميزانيتك الكاملة لإعداد رحلة مصممة حولك.</p><ol><li><span>١</span>اختر مسار رحلتك</li><li><span>٢</span>شارك حلمك وميزانيتك الكاملة</li><li><span>٣</span>استلم مقترحك المصمم خصيصًا لك</li></ol></div><JourneyPlanner locale="ar" /></div></section></main>;
}
