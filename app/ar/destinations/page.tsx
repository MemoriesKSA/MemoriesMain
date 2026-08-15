import type { Metadata } from "next";
import { CountryCatalogue } from "../../components/country-catalogue";
import { countryGuides } from "../../destination-guide-data";

export const metadata: Metadata = { title: "الوجهات", description: "استكشف رحلات مختارة داخل السعودية وحول العالم." };

export default function DestinationsPageAr() {
  return <main className="innerPage destinationsPage">
    <section className="pageHero destinationChoiceHero container"><p className="kicker">سؤال واحد قبل أن تبدأ الرحلة</p><h1>إلى أين ترغب<br /><em>أن تذهب؟</em></h1><p>اختر الدولة التي تدور في بالك. سنعرّفك على مدنها وروحها والاحتمالات التي تنتظرك داخلها.</p></section>
    <section className="container destinationCatalogue"><CountryCatalogue locale="ar" countries={countryGuides} /></section>
  </main>;
}
