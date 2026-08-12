import type { Metadata } from "next";
import { JourneyPlanner } from "../components/journey-planner";
import { PlannerPageStory } from "../components/planner-page-story";

export const metadata: Metadata = { title: "Design Your Dream Journey", description: "Choose your country, city, dates and complete journey budget, then tell MEMORIES what your dream looks like." };

export default function DesignJourneyPage() {
  return <main className="innerPage"><section className="formHero editorialPlannerHero"><div className="container formHeroGrid"><PlannerPageStory variant="dream" /><JourneyPlanner /></div></section></main>;
}
