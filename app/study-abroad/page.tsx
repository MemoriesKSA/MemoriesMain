import type { Metadata } from "next";
import { PausedNotice } from "../components/paused-notice";
import { PlannerPageStory } from "../components/planner-page-story";

export const metadata: Metadata = { title: "Study Abroad", description: "Study abroad planning is paused while we get it right. Read what the service will cover, and plan a trip with us in the meantime." };

export default function StudyAbroadPage() {
  return <main className="innerPage"><section className="formHero studyPlannerHero editorialPlannerHero"><div className="container formHeroGrid"><PlannerPageStory variant="study" /><PausedNotice section="study" /></div></section></main>;
}
