import type { Metadata } from "next";
import { JourneyPlanner } from "../components/journey-planner";
import { PlannerPageStory } from "../components/planner-page-story";

export const metadata: Metadata = { title: "Design Your Dream Journey", description: "Choose your country, city, dates and complete journey budget, then tell MEMORIES what your dream looks like." };

export default async function DesignJourneyPage({ searchParams }: { searchParams: Promise<{ country?: string | string[]; city?: string | string[]; source?: string | string[] }> }) {
  const query = await searchParams;
  const country = Array.isArray(query.country) ? query.country[0] : query.country;
  const city = Array.isArray(query.city) ? query.city[0] : query.city;
  const source = Array.isArray(query.source) ? query.source[0] : query.source;
  return <main className="innerPage"><section className="formHero editorialPlannerHero"><div className="container formHeroGrid"><PlannerPageStory variant="dream" /><JourneyPlanner initialPath={country === "saudi-arabia" ? "saudi" : "journey"} initialCountry={country} initialCity={city} fromCityGuide={source === "city-guide"} /></div></section></main>;
}
