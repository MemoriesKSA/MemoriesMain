import type { Metadata } from "next";
import { ExamplePlanContent } from "../../../examples/examples-content";
import { examplePlans, exampleSource, exampleDays, INDEXED_EXAMPLES } from "../../../examples/example-plans";
import { pageAlternates } from "../../../page-alternates";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const plan = examplePlans.find((item) => item.slug === slug);
  // Five are for search engines; the rest are reachable by link only (see example-plans.ts).
  if (plan && INDEXED_EXAMPLES.has(plan.slug)) {
    const days = exampleDays(plan);
    return {
      alternates: pageAlternates(`/examples/${plan.slug}`, "ar"),
      title: `برنامج سياحي ${plan.ar.city} ${days} أيام ${plan.ar.forWhom}`,
      description: `خطة يوم بيوم كاملة في ${plan.ar.city} ${plan.ar.forWhom}، ${days} أيام: وين تسكن، وش تزور كل يوم، ووين تاكل. خطة كتبها فريقنا لنفسه، ونكتب لك وحدة مثلها.`,
    };
  }
  return { title: plan ? `خطة مثال: ${plan.ar.city} ${plan.ar.forWhom}` : "خطة مثال", robots: { index: false, follow: false } };
}

export default async function ExamplePlanPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ source?: string | string[] }> }) {
  const { slug } = await params;
  const { source } = await searchParams;
  return <ExamplePlanContent slug={slug} locale="ar" source={exampleSource(source)} />;
}
