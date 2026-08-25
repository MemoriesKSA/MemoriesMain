import type { Metadata } from "next";
import { StudyPausedNotice } from "../../components/study-paused-notice";
import { PlannerPageStory } from "../../components/planner-page-story";

export const metadata: Metadata = { title: "الدراسة في الخارج", description: "تخطيط الدراسة في الخارج متوقف مؤقتًا حتى نتقنه. اقرأ ما ستغطيه الخدمة، وخطط لرحلة معنا في هذه الأثناء." };

export default function StudyAbroadPage() {
  return <main className="innerPage"><section className="formHero studyPlannerHero editorialPlannerHero"><div className="container formHeroGrid"><PlannerPageStory variant="study" locale="ar" /><StudyPausedNotice locale="ar" /></div></section></main>;
}
