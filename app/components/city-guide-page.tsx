import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3, MapPin, Sparkles, UtensilsCrossed } from "lucide-react";
import type { CityGuide, CountryGuide, Locale } from "../destination-guide-data";

export function CityGuidePage({ country, city, locale = "en" }: { country: CountryGuide; city: CityGuide; locale?: Locale }) {
  const ar = locale === "ar";
  const prefix = ar ? "/ar" : "";
  const planHref = `${prefix}/design-your-journey?country=${country.slug}&city=${city.slug}&source=city-guide`;
  return <main className="innerPage cityGuidePage">
    <section className="cityGuideHero">
      <Image src={city.image} alt={ar ? city.nameAr : city.nameEn} fill priority sizes="100vw" />
      <div className="cityGuideHeroShade" />
      <div className="container cityGuideHeroCopy">
        <Link className="countryBack" href={`${prefix}/destinations/${country.slug}`}><ArrowLeft className="directionArrow" size={16} /> {ar ? `مدن ${country.nameAr}` : `${country.nameEn} cities`}</Link>
        <p className="kicker light">{ar ? country.nameAr : country.nameEn}</p>
        <h1>{ar ? city.nameAr : city.nameEn}</h1>
        <p>{ar ? city.introAr : city.introEn}</p>
        <div className="cityHeroMeta"><span><Clock3 /> {ar ? `${city.days} أيام مقترحة` : `${city.days} suggested days`}</span><span><MapPin /> {ar ? country.regionAr : country.region}</span></div>
      </div>
    </section>
    <section className="container cityGuideIntro">
      <div><p className="kicker">{ar ? "تعرّف على المدينة" : "Feel the city"}</p><h2>{ar ? <>ليست قائمة.<br /><em>بل بداية حكايتك.</em></> : <>Not a checklist.<br /><em>The beginning of your story.</em></>}</h2></div>
      <p>{ar ? `هذه لمحة تساعدك على تخيل وقتك في ${city.nameAr}. عندما تبدأ الخطة، سنعيد ترتيبها حول تواريخك وميزانيتك واهتماماتك ومن يسافر معك.` : `This is a first glimpse of what your time in ${city.nameEn} could feel like. When you begin your plan, we’ll reshape it around your dates, budget, interests and who is travelling with you.`}</p>
    </section>
    <section className="container cityGuideSections">
      <article className="cityGuideFeature cityGuidePlaces"><span className="cityGuideIcon"><MapPin /></span><p className="kicker">{ar ? "أماكن تستحق وقتك" : "Places worth your time"}</p><h3>{ar ? "ابدأ بما يمنح المدينة روحها." : "Begin with what gives the city its soul."}</h3><ol>{(ar ? city.placesAr : city.placesEn).map((place, index) => <li key={place}><span>0{index + 1}</span><strong>{place}</strong></li>)}</ol></article>
      <article className="cityGuideFeature"><span className="cityGuideIcon"><UtensilsCrossed /></span><p className="kicker">{ar ? "مذاق المكان" : "Taste the place"}</p><h3>{ar ? "دع إحدى الذكريات تبدأ حول المائدة." : "Let one of the memories begin around the table."}</h3><ul>{(ar ? country.cuisineAr : country.cuisineEn).map((item) => <li key={item}>{item}</li>)}</ul><p>{ar ? "سنقترح المطاعم والمقاهي التي تناسب ميزانيتك وتفضيلاتك الغذائية وموقع إقامتك." : "We’ll recommend restaurants and cafés around your budget, dietary preferences and where you choose to stay."}</p></article>
      <article className="cityGuideFeature cityGuideExperiences"><span className="cityGuideIcon"><Sparkles /></span><p className="kicker">{ar ? "أشياء تستحق التجربة" : "Experiences worth making"}</p><h3>{ar ? "امنح الأيام إيقاعًا يشبهك." : "Give the days a rhythm that feels like you."}</h3><ul>{(ar ? country.experiencesAr : country.experiencesEn).map((item) => <li key={item}>{item}</li>)}</ul><p>{ar ? "يمكننا موازنة الأيام الممتلئة مع وقت حر مقصود حتى لا تبدو الرحلة مستعجلة." : "We can balance fuller days with intentional free time so the journey never feels rushed."}</p></article>
    </section>
    <section className="container cityPlanCta">
      <div><p className="kicker light">{ar ? "جاهز لتجعلها رحلتك؟" : "Ready to make it yours?"}</p><h2>{ar ? <>لنصمم باقة حلمك<br /><em>في هذه المدينة.</em></> : <>Let’s shape your dream<br /><em>in this city.</em></>}</h2><p>{ar ? `سنبدأ خطتك مع تحديد ${country.nameAr} و${city.nameAr} تلقائيًا، ثم تكمل أنت التفضيلات التي تجعلها خاصة بك.` : `We’ll begin with ${country.nameEn} and ${city.nameEn} already selected, then you can add the preferences that make the journey personal.`}</p></div>
      <Link className="button gold cityPlanButton" href={planHref}>{ar ? "ابدأ خطة أحلامي" : "Start my dream plan"} <ArrowRight className="directionArrow" size={18} /></Link>
    </section>
  </main>;
}
