import type { Metadata } from "next";
import { JourneyPlanner } from "../components/journey-planner";
import { PlannerPageStory } from "../components/planner-page-story";
import { ShortPlanner } from "../components/short-planner";

export const metadata: Metadata = { title: "Design Your Dream Journey", description: "Choose your country, city, dates and complete journey budget, then tell MEMORIES what your dream looks like." };

export default async function DesignJourneyPage({ searchParams }: { searchParams: Promise<{ country?: string | string[]; city?: string | string[]; source?: string | string[] }> }) {
  const query = await searchParams;
  const country = Array.isArray(query.country) ? query.country[0] : query.country;
  const city = Array.isArray(query.city) ? query.city[0] : query.city;
  const source = Array.isArray(query.source) ? query.source[0] : query.source;
  // Ad links carry ?source=ad-a and the like. Only they get the three-question
  // form (Habib, 5 Oct 2026: "normal website shows the normal form").
  const fromAd = /^ad-/i.test(source ?? "");
  // Riyadh's date, so the month buttons are the same on the server and the phone.
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(new Date());
  return <main className="innerPage"><section className={`formHero editorialPlannerHero${fromAd ? " shortPlannerHero" : ""}`}><div className="container formHeroGrid"><PlannerPageStory variant="dream" short={fromAd} />{fromAd ? <ShortPlanner source={source ?? ""} today={today} /> : <JourneyPlanner initialPath={country === "saudi-arabia" ? "saudi" : "journey"} initialCountry={country} initialCity={city} fromCityGuide={source === "city-guide"} source={source ?? ""} />}</div></section></main>;
}
