import type { Metadata } from "next";
import { JourneyPlanner } from "../../components/journey-planner";
import { PlannerPageStory } from "../../components/planner-page-story";

export const metadata: Metadata = { title: "صمّم رحلة أحلامك", description: "اختر الدولة والمدينة والتواريخ وميزانية الرحلة الكاملة، ثم شارك ميموريز تفاصيل حلمك." };

export default async function DesignJourneyPage({ searchParams }: { searchParams: Promise<{ country?: string | string[]; city?: string | string[]; source?: string | string[] }> }) {
  const query = await searchParams;
  const country = Array.isArray(query.country) ? query.country[0] : query.country;
  const city = Array.isArray(query.city) ? query.city[0] : query.city;
  const source = Array.isArray(query.source) ? query.source[0] : query.source;
  return <main className="innerPage"><section className="formHero editorialPlannerHero"><div className="container formHeroGrid"><PlannerPageStory variant="dream" locale="ar" /><JourneyPlanner locale="ar" initialPath={country === "saudi-arabia" ? "saudi" : "journey"} initialCountry={country} initialCity={city} fromCityGuide={source === "city-guide"} /></div></section></main>;
}
