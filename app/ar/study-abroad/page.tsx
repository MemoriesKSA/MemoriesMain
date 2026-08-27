import type { Metadata } from "next";
import { PausedNotice } from "../../components/paused-notice";
import { PlannerPageStory } from "../../components/planner-page-story";

export const metadata: Metadata = { title: "الدراسة في الخارج", description: "تخطيط الدراسة في الخارج متوقف مؤقتًا حتى نتقنه. اقرأ ما ستغطيه الخدمة، وخطط لرحلة معنا في هذه الأثناء." };

export default function StudyAbroadPage() {
  return <main className="innerPage"><section className="formHero studyPlannerHero editorialPlannerHero"><div className="container formHeroGrid"><PlannerPageStory variant="study" locale="ar" /><PausedNotice section="study" locale="ar" /></div></section></main>;
}
