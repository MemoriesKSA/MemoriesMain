import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityGuidePage } from "../../../components/city-guide-page";
import { FlagshipCityGuidePage } from "../../../components/flagship-city-guide-page";
import { cityGuideBySlug, countryGuideBySlug, countryGuides } from "../../../destination-guide-data";
import { flagshipCityGuideBySlug, isEditorialGuide } from "../../../flagship-city-data";

export function generateStaticParams() { return countryGuides.flatMap((country) => country.cities.map((city) => ({ slug: country.slug, city: city.slug }))); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string; city: string }> }): Promise<Metadata> {
  const { slug, city: citySlug } = await params;
  const country = countryGuideBySlug(slug); const city = cityGuideBySlug(slug, citySlug);
  return country && city ? { title: `${city.nameEn}, ${country.nameEn}`, description: city.introEn } : {};
}
export default async function CityPage({ params }: { params: Promise<{ slug: string; city: string }> }) {
  const { slug, city: citySlug } = await params;
  const country = countryGuideBySlug(slug); const city = cityGuideBySlug(slug, citySlug);
  if (!country || !city) notFound();
  const flagship = flagshipCityGuideBySlug(slug, citySlug);
  // Only the guides with editorial copy get the flagship treatment. A city
  // held here purely to ground the AI draft has no story or weather panel to
  // render, so it takes the generic page like any other city.
  if (isEditorialGuide(flagship)) return <FlagshipCityGuidePage country={country} city={city} guide={flagship} />;
  return <CityGuidePage country={country} city={city} />;
}
