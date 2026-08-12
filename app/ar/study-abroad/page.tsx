import type { Metadata } from "next";
import { JourneyPlanner } from "../../components/journey-planner";

export const metadata: Metadata = { title: "الدراسة في الخارج", description: "خطط لرحلة دراستك مع إرشاد للوجهة ومساعدة في طلب التأشيرة والسكن والطيران وترتيبات الوصول." };

export default function StudyAbroadPage() {
  return <main className="innerPage"><section className="formHero studyPlannerHero"><div className="container formHeroGrid"><div><p className="kicker light">فصلك القادم</p><h1>الدراسة في الخارج،<br /><em>بمسار أوضح.</em></h1><p>اكتشف المملكة المتحدة أو الولايات المتحدة أو كندا أو أستراليا أو اليابان. شاركنا هدفك الدراسي وسنساعدك في تنظيم الرحلة من حوله.</p><ol><li><span>١</span>اختر الدولة والمدينة والمرحلة الدراسية</li><li><span>٢</span>حدد نوع المساعدة التي تحتاجها</li><li><span>٣</span>خطط للتأشيرة والسفر والسكن والوصول</li></ol></div><JourneyPlanner locale="ar" initialPath="study" /></div></section></main>;
}
