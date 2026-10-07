import type { Metadata } from "next";
import { ExamplesIndex } from "./examples-content";
import { exampleSource } from "./example-plans";

// Reachable by link only (see example-plans.ts), so not for search engines.
export const metadata: Metadata = { title: "Example plans", robots: { index: false, follow: false } };

export default async function ExamplesPage({ searchParams }: { searchParams: Promise<{ source?: string | string[] }> }) {
  const { source } = await searchParams;
  return <ExamplesIndex locale="en" source={exampleSource(source)} />;
}
