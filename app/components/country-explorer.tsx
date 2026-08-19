import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Compass, MapPin } from "lucide-react";
import type { CSSProperties } from "react";
import type { CountryGuide, Locale } from "../destination-guide-data";

export function CountryExplorer({ country, locale = "en" }: { country: CountryGuide; locale?: Locale }) {
  const ar = locale === "ar";
  const prefix = ar ? "/ar" : "";
  return <main className="innerPage countryPage">
    <section className="countryHero">
      <Image src={country.image} alt={ar ? country.nameAr : country.nameEn} fill priority sizes="100vw" />
      <div className="countryHeroShade" />
      <div className="container countryHeroCopy">
        <Link className="countryBack" href={`${prefix}/destinations`}><ArrowLeft className="directionArrow" size={16} /> {ar ? "كل الدول" : "All countries"}</Link>
        <p className="kicker light">{ar ? country.regionAr : country.region}</p>
        <h1>{ar ? country.nameAr : country.nameEn}</h1>
        <p>{ar ? country.introAr : country.introEn}</p>
        {country.slug === "saudi-arabia" && (
          <Link className="flagshipSoftCta" href={`${prefix}/know-before-you-go`}>
            {ar ? "أول زيارة؟ اقرأ دليل قبل أن تسافر" : "First time visiting? Read Know Before You Go"}
            <ArrowRight className={ar ? "directionArrow" : ""} size={15} />
          </Link>
        )}
      </div>
    </section>
    <section className="container citySelector">
      <div className="citySelectorHeading">
        <div><p className="kicker">{ar ? "اختر مدينتك" : "Choose your place"}</p><h2>{ar ? <>وين ودك<br /><em>تروح؟</em></> : <>Where do you want<br /><em>to go?</em></>}</h2></div>
        <p>{ar ? `كل مدينة في ${country.nameAr} تحمل إيقاعًا مختلفًا. اختر المدينة التي تشبه حلمك، ثم اكتشف تفاصيلها قبل أن تبدأ خطتك.` : `Every place in ${country.nameEn} has a different rhythm. Choose the one that feels like your dream, then discover it before beginning your plan.`}</p>
      </div>
      <div className="cityGallery">
        {country.cities.map((city, index) => <Link href={`${prefix}/destinations/${country.slug}/${city.slug}`} className="cityGalleryCard" key={city.slug} style={{ "--city-order": index } as CSSProperties}>
          <span className="cityGalleryImage"><Image src={city.image} alt={ar ? city.nameAr : city.nameEn} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" /><span /></span>
          <span className="cityGalleryBody"><small><MapPin size={13} /> {ar ? country.nameAr : country.nameEn}</small><strong>{ar ? city.nameAr : city.nameEn}</strong><span>{ar ? city.introAr : city.introEn}</span><em>{ar ? "ادخل المدينة" : "Step inside"} <ArrowRight className="directionArrow" size={16} /></em></span>
        </Link>)}
        <Link className="cityGalleryCard cityAnywhereCard" href={`${prefix}/design-your-journey?country=${country.slug}`}>
          <Compass aria-hidden="true" /><p className="kicker light">{ar ? "مكان آخر في بالك" : "Somewhere else in mind"}</p><strong>{ar ? "أخبرنا بالمكان الذي تحلم به." : "Tell us where you dream of going."}</strong><span>{ar ? "سنأخذ رغبتك كنقطة البداية ونبني الخطة من حولها." : "We’ll take your idea as the starting point and shape the plan around it."}</span><em>{ar ? "صمّم رحلتك" : "Design your journey"} <ArrowRight className="directionArrow" size={16} /></em>
        </Link>
      </div>
    </section>
  </main>;
}
