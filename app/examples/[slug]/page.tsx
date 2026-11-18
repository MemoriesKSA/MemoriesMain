import type { Metadata } from "next";
import { ExamplePlanContent } from "../examples-content";
import { examplePlans, exampleSource, exampleDays, INDEXED_EXAMPLES } from "../example-plans";
import { pageAlternates } from "../../page-alternates";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const plan = examplePlans.find((item) => item.slug === slug);
  // Five are for search engines; the rest are reachable by link only (see example-plans.ts).
  if (plan && INDEXED_EXAMPLES.has(plan.slug)) {
    const days = exampleDays(plan);
    return {
      alternates: pageAlternates(`/examples/${plan.slug}`, "en"),
      title: `${plan.en.city} itinerary, ${days} days ${plan.en.forWhom}`,
      description: `A complete day-by-day ${plan.en.city} plan ${plan.en.forWhom}, ${days} days: where to stay, what to see each day and where to eat. A plan our team wrote for itself; we write one like it for you.`,
    };
  }
  return { title: plan ? `Example plan: ${plan.en.city} ${plan.en.forWhom}` : "Example plan", robots: { index: false, follow: false } };
}

export default async function ExamplePlanPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ source?: string | string[] }> }) {
  const { slug } = await params;
  const { source } = await searchParams;
  return <ExamplePlanContent slug={slug} locale="en" source={exampleSource(source)} />;
}
