import type { Metadata } from "next";
import { JourneyPlanner } from "../components/journey-planner";

export const metadata: Metadata = { title: "Discover Saudi Arabia", description: "Plan a personal journey through Saudi Arabia for leisure, culture, Umrah, Hajj enquiries, family visits or business." };

export default function DiscoverSaudiPage() {
  return <main className="innerPage"><section className="formHero saudiPlannerHero"><div className="container formHeroGrid"><div><p className="kicker light">Welcome to Saudi Arabia</p><h1>Ancient stories.<br /><em>A new journey.</em></h1><p>From Riyadh and Jeddah to AlUla, the Red Sea, Makkah and Madinah, tell us what brings you to the Kingdom and we’ll shape the details around you.</p><ol><li><span>1</span>Choose the cities you want to experience</li><li><span>2</span>Set your dates and complete journey budget</li><li><span>3</span>Receive a tailored Saudi itinerary</li></ol></div><JourneyPlanner initialPath="saudi" /></div></section></main>;
}
