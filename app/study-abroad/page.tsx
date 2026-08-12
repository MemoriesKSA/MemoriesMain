import type { Metadata } from "next";
import { JourneyPlanner } from "../components/journey-planner";

export const metadata: Metadata = { title: "Study Abroad", description: "Plan your study journey with destination guidance, visa-application assistance, accommodation, flights and arrival support." };

export default function StudyAbroadPage() {
  return <main className="innerPage"><section className="formHero studyPlannerHero"><div className="container formHeroGrid"><div><p className="kicker light">Your next chapter</p><h1>Study abroad,<br /><em>with a clearer path.</em></h1><p>Explore the UK, United States, Canada, Australia or Japan. Tell us your study goal and we’ll help organize the journey around it.</p><ol><li><span>1</span>Choose your country, city and study level</li><li><span>2</span>Select the support you need</li><li><span>3</span>Plan visas, travel, accommodation and arrival</li></ol></div><JourneyPlanner initialPath="study" /></div></section></main>;
}
