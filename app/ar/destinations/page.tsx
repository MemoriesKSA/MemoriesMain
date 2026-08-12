import type { Metadata } from "next";
import { DestinationCatalogue } from "../../components/destination-catalogue";
import { destinationsAr } from "../data";

export const metadata: Metadata = { title: "الوجهات", description: "استكشف رحلات مختارة داخل السعودية وحول العالم." };

export default function DestinationsPageAr() {
  return <main className="innerPage destinationsPage">
    <section className="pageHero container"><p className="kicker">العالم، مختار بعناية</p><h1>أماكن تستحق<br /><em>أن تبقى في الذاكرة.</em></h1><p>استكشف ٢٠ نقطة بداية ملهمة داخل السعودية وحول العالم. اختر وجهة تحبها، أو أخبرنا بأي مكان آخر تحلم بالذهاب إليه.</p></section>
    <section className="container destinationCatalogue"><DestinationCatalogue locale="ar" destinations={destinationsAr} /></section>
  </main>;
}
