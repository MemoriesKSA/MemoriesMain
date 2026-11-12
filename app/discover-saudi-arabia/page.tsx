import type { Metadata } from "next";
import { CountryExplorer } from "../components/country-explorer";
import { countryGuideBySlug } from "../destination-guide-data";

// Hourly, so a season badge goes up or comes down within the hour of its dates, and the Saudi Winter band with it.
export const revalidate = 3600;

export const metadata: Metadata = { title: "Discover Saudi Arabia", description: "Plan a personal journey through Saudi Arabia for leisure, culture, Umrah, Hajj enquiries, family visits or business." };

export default function DiscoverSaudiPage() {
  return <CountryExplorer country={countryGuideBySlug("saudi-arabia")!} />;
}
