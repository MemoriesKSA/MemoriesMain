import type { Metadata } from "next";
import { JourneyPlanner } from "../components/journey-planner";

export const metadata: Metadata = { title: "Design Your Dream Journey", description: "Choose your country, city, dates and complete journey budget, then tell MEMORIES what your dream looks like." };

export default function DesignJourneyPage() {
  return <main className="innerPage"><section className="formHero"><div className="container formHeroGrid"><div><p className="kicker light">Your dream starts here</p><h1>Let&apos;s design a journey<br /><em>only you could dream.</em></h1><p>Choose your path and share the details that matter. We’ll use your destination, dates and complete budget to prepare a journey shaped around you.</p><ol><li><span>1</span>Choose your journey path</li><li><span>2</span>Share your dream and complete budget</li><li><span>3</span>Receive your tailored proposal</li></ol></div><JourneyPlanner /></div></section></main>;
}
