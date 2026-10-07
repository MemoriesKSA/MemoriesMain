import type { Metadata } from "next";
import { ExamplePlanContent } from "../../../examples/examples-content";
import { examplePlans, exampleSource } from "../../../examples/example-plans";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const plan = examplePlans.find((item) => item.slug === slug);
  // Reachable by link only (see example-plans.ts), so not for search engines.
  return { title: plan ? `خطة مثال: ${plan.ar.city} ${plan.ar.forWhom}` : "خطة مثال", robots: { index: false, follow: false } };
}

export default async function ExamplePlanPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ source?: string | string[] }> }) {
  const { slug } = await params;
  const { source } = await searchParams;
  return <ExamplePlanContent slug={slug} locale="ar" source={exampleSource(source)} />;
}
