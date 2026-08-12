import type { Metadata } from "next";
import { JourneyPlanner } from "../components/journey-planner";

export const metadata: Metadata = { title: "Design Your Journey", description: "Tell MEMORIES what your ideal journey looks like." };

export default function DesignJourneyPage() { return <main className="innerPage"><section className="formHero"><div className="container formHeroGrid"><div><p className="kicker light">Your story starts here</p><h1>Let&apos;s design a journey<br /><em>only you could take.</em></h1><p>Share the first few details. There is no payment and no commitment—just a thoughtful first conversation with a travel designer.</p><ol><li><span>1</span>Tell us what you imagine</li><li><span>2</span>Meet your travel designer</li><li><span>3</span>Receive your tailored proposal</li></ol></div><JourneyPlanner /></div></section></main>; }
