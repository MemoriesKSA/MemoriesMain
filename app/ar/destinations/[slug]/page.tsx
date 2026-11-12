import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CountryExplorer } from "../../../components/country-explorer";
import { countryGuideBySlug, countryGuides, legacyDestinationRoutes } from "../../../destination-guide-data";

// Daily, so a season badge or the Saudi Winter band comes down by itself when its dates end.
export const revalidate = 86400;

export function generateStaticParams() { return countryGuides.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const country = countryGuideBySlug(slug);
  return country ? { title: `استكشف ${country.nameAr}`, description: country.introAr } : {};
}

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const country = countryGuideBySlug(slug);
  if (!country) {
    const legacy = legacyDestinationRoutes[slug];
    if (legacy) redirect(`/ar/destinations/${legacy.country}/${legacy.city}`);
    notFound();
  }
  return <CountryExplorer country={country} locale="ar" />;
}
