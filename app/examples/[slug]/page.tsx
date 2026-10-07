import type { Metadata } from "next";
import { ExamplePlanContent } from "../examples-content";
import { examplePlans, exampleSource } from "../example-plans";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const plan = examplePlans.find((item) => item.slug === slug);
  // Reachable by link only (see example-plans.ts), so not for search engines.
  return { title: plan ? `Example plan: ${plan.en.city} ${plan.en.forWhom}` : "Example plan", robots: { index: false, follow: false } };
}

export default async function ExamplePlanPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ source?: string | string[] }> }) {
  const { slug } = await params;
  const { source } = await searchParams;
  return <ExamplePlanContent slug={slug} locale="en" source={exampleSource(source)} />;
}
