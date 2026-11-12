import type { Metadata } from "next";
import { CountryExplorer } from "../components/country-explorer";
import { countryGuideBySlug } from "../destination-guide-data";

// Daily, so a season badge or the Saudi Winter band comes down by itself when its dates end.
export const revalidate = 86400;

export const metadata: Metadata = { title: "Discover Saudi Arabia", description: "Plan a personal journey through Saudi Arabia for leisure, culture, Umrah, Hajj enquiries, family visits or business." };

export default function DiscoverSaudiPage() {
  return <CountryExplorer country={countryGuideBySlug("saudi-arabia")!} />;
}
