import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3, MapPin, Sparkles, UtensilsCrossed } from "lucide-react";
import type { CityGuide, CountryGuide, Locale } from "../destination-guide-data";
import { isPlannableCountry } from "./planner-data";

export function CityGuidePage({ country, city, locale = "en" }: { country: CountryGuide; city: CityGuide; locale?: Locale }) {
  const ar = locale === "ar";
  const prefix = ar ? "/ar" : "";
  const planHref = `${prefix}/design-your-journey?country=${country.slug}&city=${city.slug}&source=city-guide`;
  // Some countries are here to be read about, not yet to be booked. The
  // planner no longer offers them, so this page must not either: sending
  // someone to a form that cannot select their country is worse than saying
  // plainly that we are not ready.
  const plannable = isPlannableCountry(country.slug);
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
      <article className="cityGuideFeature cityGuidePlaces"><div className="cityGuideFeatureMedia cityGuideFeatureMediaWide"><Image src={city.attractionImage} alt={ar ? `معالم ${city.nameAr}` : `${city.nameEn} landmarks`} fill sizes="(max-width: 1000px) 100vw, 55vw" /></div><span className="cityGuideIcon"><MapPin /></span><p className="kicker">{ar ? "أماكن تستحق وقتك" : "Places worth your time"}</p><h3>{ar ? "ابدأ بما يمنح المدينة روحها." : "Begin with what gives the city its soul."}</h3><ol>{(ar ? city.placesAr : city.placesEn).map((place, index) => <li key={place}><span>0{index + 1}</span><strong>{place}</strong></li>)}</ol></article>
      <article className="cityGuideFeature"><div className="cityGuideFeatureMedia"><Image src={country.cuisineImage} alt={ar ? `مذاق ${country.nameAr}` : `Cuisine of ${country.nameEn}`} fill sizes="(max-width: 780px) 100vw, 36vw" /></div><span className="cityGuideIcon"><UtensilsCrossed /></span><p className="kicker">{ar ? "مذاق المكان" : "Taste the place"}</p><h3>{ar ? "دع إحدى الذكريات تبدأ حول المائدة." : "Let one of the memories begin around the table."}</h3><ul>{(ar ? country.cuisineAr : country.cuisineEn).map((item) => <li key={item}>{item}</li>)}</ul><p>{ar ? "سنقترح المطاعم والمقاهي التي تناسب ميزانيتك وتفضيلاتك الغذائية وموقع إقامتك." : "We’ll recommend restaurants and cafés around your budget, dietary preferences and where you choose to stay."}</p></article>
      <article className="cityGuideFeature cityGuideExperiences"><div className="cityGuideFeatureMedia"><Image src={country.experienceImage} alt={ar ? `تجارب في ${country.nameAr}` : `Experiences in ${country.nameEn}`} fill sizes="(max-width: 780px) 100vw, 36vw" /></div><span className="cityGuideIcon"><Sparkles /></span><p className="kicker">{ar ? "أشياء تستحق التجربة" : "Experiences worth making"}</p><h3>{ar ? "امنح الأيام إيقاعًا يشبهك." : "Give the days a rhythm that feels like you."}</h3><ul>{(ar ? country.experiencesAr : country.experiencesEn).map((item) => <li key={item}>{item}</li>)}</ul><p>{ar ? "يمكننا موازنة الأيام الممتلئة مع وقت حر مقصود حتى لا تبدو الرحلة مستعجلة." : "We can balance fuller days with intentional free time so the journey never feels rushed."}</p></article>
    </section>
    {plannable ? (
      <section className="container cityPlanCta">
        <div><p className="kicker light">{ar ? "جاهز لتجعلها رحلتك؟" : "Ready to make it yours?"}</p><h2>{ar ? <>لنصمم باقة حلمك<br /><em>في هذه المدينة.</em></> : <>Let’s shape your dream<br /><em>in this city.</em></>}</h2><p>{ar ? `سنبدأ خطتك مع تحديد ${country.nameAr} و${city.nameAr} تلقائيًا، ثم تكمل أنت التفضيلات التي تجعلها خاصة بك.` : `We’ll begin with ${country.nameEn} and ${city.nameEn} already selected, then you can add the preferences that make the journey personal.`}</p></div>
        <Link className="button gold cityPlanButton" href={planHref}>{ar ? "ابدأ خطة أحلامي" : "Start my dream plan"} <ArrowRight className="directionArrow" size={18} /></Link>
      </section>
    ) : (
      <section className="container cityPlanCta cityPlanCtaSoon">
        <div>
          <p className="kicker light">{ar ? "نشتغل عليها" : "We’re working on it"}</p>
          <h2>{ar ? <>{city.nameAr} ليست جاهزة<br /><em>للتخطيط بعد.</em></> : <>{city.nameEn} isn’t ready<br /><em>to plan just yet.</em></>}</h2>
          <p>{ar
            ? `نحن نبني ${country.nameAr} بالطريقة نفسها التي بنينا بها وجهاتنا الأخرى: فنادق ومطاعم وأماكن تحققنا منها بأنفسنا، لا قائمة منسوخة. حتى ذلك الحين، لن نطلب منك ملء استمارة لا نستطيع الوفاء بها.`
            : `We’re building ${country.nameEn} the way we built the rest: hotels, restaurants and places we’ve checked ourselves, not a list copied from somewhere. Until that’s done we’d rather not ask you to fill in a form we can’t honour.`}</p>
        </div>
        <div className="cityPlanSoonActions">
          <Link className="button gold cityPlanButton" href={`${prefix}/destinations`}>{ar ? "وجهات جاهزة الآن" : "Destinations ready now"} <ArrowRight className="directionArrow" size={18} /></Link>
          <Link className="cityPlanSoonLink" href={`${prefix}/feedback?about=${country.slug}`}>{ar ? "تبي نسرّع هذي الوجهة؟ قل لنا" : "Want us to prioritise this one? Tell us"}</Link>
        </div>
      </section>
    )}
  </main>;
}
