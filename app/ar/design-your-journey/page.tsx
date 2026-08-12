import type { Metadata } from "next";
import { JourneyPlanner } from "../../components/journey-planner";
import { PlannerPageStory } from "../../components/planner-page-story";

export const metadata: Metadata = { title: "صمّم رحلة أحلامك", description: "اختر الدولة والمدينة والتواريخ وميزانية الرحلة الكاملة، ثم شارك ميموريز تفاصيل حلمك." };

export default function DesignJourneyPage() {
  return <main className="innerPage"><section className="formHero editorialPlannerHero"><div className="container formHeroGrid"><PlannerPageStory variant="dream" locale="ar" /><JourneyPlanner locale="ar" /></div></section></main>;
}
