import type { Metadata } from "next";
import { ExamplesIndex } from "../../examples/examples-content";
import { exampleSource } from "../../examples/example-plans";

// Reachable by link only (see example-plans.ts), so not for search engines.
export const metadata: Metadata = { title: "خطط مثال", robots: { index: false, follow: false } };

export default async function ExamplesPage({ searchParams }: { searchParams: Promise<{ source?: string | string[] }> }) {
  const { source } = await searchParams;
  return <ExamplesIndex locale="ar" source={exampleSource(source)} />;
}
