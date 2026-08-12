import type { Metadata } from "next";
import { JourneyPlanner } from "../../components/journey-planner";

export const metadata: Metadata = { title: "اكتشف السعودية", description: "خطط لرحلة شخصية في السعودية للسياحة والثقافة والعمرة واستفسارات الحج والزيارات العائلية أو الأعمال." };

export default function DiscoverSaudiPage() {
  return <main className="innerPage"><section className="formHero saudiPlannerHero"><div className="container formHeroGrid"><div><p className="kicker light">أهلًا بك في السعودية</p><h1>حكايات عريقة.<br /><em>ورحلة جديدة.</em></h1><p>من الرياض وجدة إلى العلا والبحر الأحمر ومكة والمدينة، أخبرنا ما الذي يجذبك إلى المملكة وسنصمم التفاصيل حولك.</p><ol><li><span>١</span>اختر المدن التي ترغب في اكتشافها</li><li><span>٢</span>حدد تواريخك وميزانية الرحلة الكاملة</li><li><span>٣</span>استلم برنامجًا سعوديًا مصممًا لك</li></ol></div><JourneyPlanner locale="ar" initialPath="saudi" /></div></section></main>;
}
