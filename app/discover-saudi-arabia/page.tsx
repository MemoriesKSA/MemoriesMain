import type { Metadata } from "next";
import { JourneyPlanner } from "../components/journey-planner";
import { SaudiPlannerStory } from "../components/saudi-planner-story";

export const metadata: Metadata = { title: "Discover Saudi Arabia", description: "Plan a personal journey through Saudi Arabia for leisure, culture, Umrah, Hajj enquiries, family visits or business." };

export default function DiscoverSaudiPage() {
  return <main className="innerPage"><section className="formHero saudiPlannerHero"><div className="container formHeroGrid"><SaudiPlannerStory /><JourneyPlanner initialPath="saudi" /></div></section></main>;
}
