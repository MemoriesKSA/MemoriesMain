import type { Metadata } from "next";
import { JourneyPlanner } from "../components/journey-planner";
import { PlannerPageStory } from "../components/planner-page-story";

export const metadata: Metadata = { title: "Study Abroad", description: "Plan your study journey with destination guidance, visa-application assistance, accommodation, flights and arrival support." };

export default function StudyAbroadPage() {
  return <main className="innerPage"><section className="formHero studyPlannerHero editorialPlannerHero"><div className="container formHeroGrid"><PlannerPageStory variant="study" /><JourneyPlanner initialPath="study" /></div></section></main>;
}
