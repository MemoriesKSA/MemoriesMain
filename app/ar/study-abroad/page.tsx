import type { Metadata } from "next";
import { JourneyPlanner } from "../../components/journey-planner";
import { PlannerPageStory } from "../../components/planner-page-story";

export const metadata: Metadata = { title: "الدراسة في الخارج", description: "خطط لرحلة دراستك مع إرشاد للوجهة ومساعدة في طلب التأشيرة والسكن والطيران وترتيبات الوصول." };

export default function StudyAbroadPage() {
  return <main className="innerPage"><section className="formHero studyPlannerHero editorialPlannerHero"><div className="container formHeroGrid"><PlannerPageStory variant="study" locale="ar" /><JourneyPlanner locale="ar" initialPath="study" /></div></section></main>;
}
