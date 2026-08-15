import type { Metadata } from "next";
import { CountryExplorer } from "../../components/country-explorer";
import { countryGuideBySlug } from "../../destination-guide-data";

export const metadata: Metadata = { title: "اكتشف السعودية", description: "خطط لرحلة شخصية في السعودية للسياحة والثقافة والعمرة واستفسارات الحج والزيارات العائلية أو الأعمال." };

export default function DiscoverSaudiPage() {
  return <CountryExplorer country={countryGuideBySlug("saudi-arabia")!} locale="ar" />;
}
