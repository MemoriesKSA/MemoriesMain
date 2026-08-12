import type { Metadata } from "next";
import { JourneyPlanner } from "../../components/journey-planner";
import { SaudiPlannerStory } from "../../components/saudi-planner-story";

export const metadata: Metadata = { title: "اكتشف السعودية", description: "خطط لرحلة شخصية في السعودية للسياحة والثقافة والعمرة واستفسارات الحج والزيارات العائلية أو الأعمال." };

export default function DiscoverSaudiPage() {
  return <main className="innerPage"><section className="formHero saudiPlannerHero"><div className="container formHeroGrid"><SaudiPlannerStory locale="ar" /><JourneyPlanner locale="ar" initialPath="saudi" /></div></section></main>;
}
