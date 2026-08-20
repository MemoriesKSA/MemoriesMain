import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityGuidePage } from "../../../../components/city-guide-page";
import { FlagshipCityGuidePage } from "../../../../components/flagship-city-guide-page";
import { cityGuideBySlug, countryGuideBySlug, countryGuides } from "../../../../destination-guide-data";
import { flagshipCityGuideBySlug, isEditorialGuide } from "../../../../flagship-city-data";

export function generateStaticParams() { return countryGuides.flatMap((country) => country.cities.map((city) => ({ slug: country.slug, city: city.slug }))); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string; city: string }> }): Promise<Metadata> {
  const { slug, city: citySlug } = await params;
  const country = countryGuideBySlug(slug); const city = cityGuideBySlug(slug, citySlug);
  return country && city ? { title: `${city.nameAr}، ${country.nameAr}`, description: city.introAr } : {};
}
export default async function CityPage({ params }: { params: Promise<{ slug: string; city: string }> }) {
  const { slug, city: citySlug } = await params;
  const country = countryGuideBySlug(slug); const city = cityGuideBySlug(slug, citySlug);
  if (!country || !city) notFound();
  const flagship = flagshipCityGuideBySlug(slug, citySlug);
  // See the English route: only editorially complete guides render the
  // flagship page, the rest fall through to the generic city page.
  if (isEditorialGuide(flagship)) return <FlagshipCityGuidePage country={country} city={city} guide={flagship} locale="ar" />;
  return <CityGuidePage country={country} city={city} locale="ar" />;
}
