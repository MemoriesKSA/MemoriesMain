import type { Metadata } from "next";
import { pageAlternates } from "../../page-alternates";
import { CountryExplorer } from "../../components/country-explorer";
import { countryGuideBySlug } from "../../destination-guide-data";

// Hourly, so a season badge goes up or comes down within the hour of its dates, and the Saudi Winter band with it.
export const revalidate = 3600;

export const metadata: Metadata = { alternates: pageAlternates("/discover-saudi-arabia", "ar"), title: "اكتشف السعودية", description: "خطط لرحلة شخصية في السعودية للسياحة والثقافة والعمرة واستفسارات الحج والزيارات العائلية أو الأعمال." };

export default function DiscoverSaudiPage() {
  return <CountryExplorer country={countryGuideBySlug("saudi-arabia")!} locale="ar" />;
}
