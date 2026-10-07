import type { Metadata } from "next";
import { JourneyPlanner } from "../../components/journey-planner";
import { PlannerPageStory } from "../../components/planner-page-story";
import { ShortPlanner } from "../../components/short-planner";

export const metadata: Metadata = { title: "صمّم رحلة أحلامك", description: "اختر الدولة والمدينة والتواريخ وميزانية الرحلة الكاملة، ثم شارك ميموريز تفاصيل حلمك." };

export default async function DesignJourneyPage({ searchParams }: { searchParams: Promise<{ country?: string | string[]; city?: string | string[]; source?: string | string[] }> }) {
  const query = await searchParams;
  const country = Array.isArray(query.country) ? query.country[0] : query.country;
  const city = Array.isArray(query.city) ? query.city[0] : query.city;
  const source = Array.isArray(query.source) ? query.source[0] : query.source;
  // Ad links carry ?source=ad-a and the like, and the links we leave in replies
  // to people's travel questions carry ?source=x-reply. Both bring a stranger
  // on a phone, so both get the three-question form; everyone else gets the
  // full one (Habib, 5 Oct 2026: "normal website shows the normal form"; 7 Oct,
  // asked which form a reply link should open: "short"). The example plans are
  // reachable by link only, so "one like it" under an example is the same
  // stranger, and arrives as ?source=example when the link carried no tag.
  const fromAd = /^ad-|^example$|-reply$/i.test(source ?? "");
  // Riyadh's date, so the month buttons are the same on the server and the phone.
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(new Date());
  return <main className="innerPage"><section className={`formHero editorialPlannerHero${fromAd ? " shortPlannerHero" : ""}`}><div className="container formHeroGrid"><PlannerPageStory variant="dream" locale="ar" short={fromAd} />{fromAd ? <ShortPlanner locale="ar" source={source ?? ""} today={today} initialCountry={country} initialCity={city} /> : <JourneyPlanner locale="ar" initialPath={country === "saudi-arabia" ? "saudi" : "journey"} initialCountry={country} initialCity={city} fromCityGuide={source === "city-guide"} source={source ?? ""} />}</div></section></main>;
}
