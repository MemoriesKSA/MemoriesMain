import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Camera, MapPin, Sparkles, Sun, Thermometer, UtensilsCrossed } from "lucide-react";
import type { CityGuide, CountryGuide, Locale } from "../destination-guide-data";
import type { FlagshipCityGuide, FlagshipDining, FlagshipPlace, FlagshipStay } from "../flagship-city-data";

function ImageSlot({ label }: { label: string }) {
  return (
    <div className="imageSlot" role="img" aria-label={label}>
      <Camera aria-hidden="true" />
    </div>
  );
}

export function FlagshipCityGuidePage({
  country,
  city,
  guide,
  locale = "en",
}: {
  country: CountryGuide;
  city: CityGuide;
  guide: FlagshipCityGuide;
  locale?: Locale;
}) {
  const ar = locale === "ar";
  const prefix = ar ? "/ar" : "";
  const isWorship = guide.tone === "worship";
  const planHref = `${prefix}/design-your-journey?country=${country.slug}&city=${city.slug}&source=flagship-guide`;
  const story = ar ? guide.storyAr : guide.storyEn;
  const { bestWindow, peakHeat } = guide.weather;

  return (
    <main className="innerPage flagshipCityPage">
      <section className="flagshipHero">
        <Image src={city.image} alt={ar ? city.nameAr : city.nameEn} fill priority sizes="100vw" />
        <div className="flagshipHeroShade" />
        <div className="container flagshipHeroCopy">
          <p className="kicker light">
            {isWorship
              ? (ar ? `دليل العمرة والزيارة · ${country.nameAr}` : `Umrah & visit guide · ${country.nameEn}`)
              : (ar ? `دليل موسّع · ${country.nameAr}` : `Flagship guide · ${country.nameEn}`)}
          </p>
          <h1>{ar ? city.nameAr : city.nameEn}</h1>
          <div className="cityHeroMeta">
            <span><MapPin /> {ar ? country.regionAr : country.region}</span>
          </div>
        </div>
      </section>

      <section className="container flagshipStory">
        {story.map((paragraph, index) => (
          <p key={index} className={index === 0 ? "flagshipStoryLead" : undefined}>{paragraph}</p>
        ))}
        <Link className="flagshipSoftCta" href={planHref}>
          {isWorship
            ? (ar ? "جاهز لبدء ترتيبات رحلتك؟" : "Ready to start arranging your visit?")
            : (ar ? "تعرف بالفعل أن هذه رحلتك؟ ابدأ خطتك" : "Already know this is your trip? Start your plan")}
          <ArrowRight className={ar ? "directionArrow" : ""} size={15} />
        </Link>
      </section>

      <section className="container flagshipWeather">
        <p className="kicker">{ar ? "الطقس والتوقيت" : "Weather & timing"}</p>
        <div className="flagshipWeatherGrid">
          <article className="weatherCard weatherCardGood">
            <span className="weatherIcon"><Sun /></span>
            <strong>{ar ? bestWindow.labelAr : bestWindow.labelEn}</strong>
            <p className="weatherMonths">{ar ? bestWindow.monthsAr : bestWindow.monthsEn}</p>
            <p className="weatherTemp">{ar ? bestWindow.tempAr : bestWindow.tempEn}</p>
            <p className="weatherNote">{ar ? bestWindow.noteAr : bestWindow.noteEn}</p>
          </article>
          <article className="weatherCard weatherCardHot">
            <span className="weatherIcon"><Thermometer /></span>
            <strong>{ar ? peakHeat.labelAr : peakHeat.labelEn}</strong>
            <p className="weatherMonths">{ar ? peakHeat.monthsAr : peakHeat.monthsEn}</p>
            <p className="weatherTemp">{ar ? peakHeat.tempAr : peakHeat.tempEn}</p>
            <p className="weatherNote">{ar ? peakHeat.noteAr : peakHeat.noteEn}</p>
          </article>
        </div>
        <p className="weatherTip">{ar ? guide.weather.tipAr : guide.weather.tipEn}</p>
      </section>

      <section className="container flagshipPullQuote">
        <p>{ar ? guide.pullQuoteAr : guide.pullQuoteEn}</p>
      </section>

      <section className="container flagshipSection">
        <div className="flagshipSectionHeading">
          <p className="kicker">
            <Sparkles size={14} />{" "}
            {isWorship
              ? (ar ? "محور رحلتك" : "Where your journey centres")
              : (ar ? "أماكن تستحق الزيارة" : "Places worth going")}
          </p>
          <h2>
            {isWorship
              ? (ar ? "المعالم والتفاصيل العملية التي تهم زيارتك." : "The sites and practical details that matter for your visit.")
              : (ar ? "الأماكن التي تمنح هذه الوجهة طابعها المميز." : "The places that give this destination its character.")}
          </h2>
        </div>
        <div className="flagshipGrid placesGrid">
          {guide.attractions.map((place: FlagshipPlace) => (
            <article key={place.nameEn} className="placeCard">
              <div className="placeCardMedia">
                <ImageSlot label={ar ? place.nameAr : place.nameEn} />
                {(ar ? place.badgeAr : place.badgeEn) && (
                  <span className="placeBadge">{ar ? place.badgeAr : place.badgeEn}</span>
                )}
              </div>
              <span className="placeCategory">{ar ? place.categoryAr : place.categoryEn}</span>
              <h3>{ar ? place.nameAr : place.nameEn}</h3>
              <p>{ar ? place.descriptionAr : place.descriptionEn}</p>
            </article>
          ))}
        </div>
      </section>

      {guide.dining.length > 0 && (
        <section className="container flagshipSection">
          <div className="flagshipSectionHeading">
            <p className="kicker"><UtensilsCrossed size={14} /> {ar ? "أين تأكل" : "Where to eat"}</p>
            <h2>{ar ? "مشهد طعام يستحق ليلة إضافية." : "A dining scene worth staying an extra night for."}</h2>
          </div>
          <div className="flagshipGrid diningGrid">
            {guide.dining.map((place: FlagshipDining) => (
              <article key={place.nameEn} className="diningCard">
                <ImageSlot label={ar ? place.nameAr : place.nameEn} />
                <span className="placeCategory">{ar ? place.cuisineAr : place.cuisineEn}</span>
                <h3>{ar ? place.nameAr : place.nameEn}</h3>
                <p>{ar ? place.descriptionAr : place.descriptionEn}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="container flagshipSection">
        <div className="flagshipSectionHeading">
          <p className="kicker">
            <BedDouble size={14} />{" "}
            {isWorship ? (ar ? "أين تقيم بالقرب من الحرم" : "Staying near the Haram") : (ar ? "أين تقيم" : "Where to stay")}
          </p>
          <h2>
            {isWorship
              ? (ar ? "إقامة تمنحك الراحة والقرب في آنٍ واحد." : "A stay that balances comfort with proximity.")
              : (ar ? "إقامات تليق ببداية الرحلة." : "A base worthy of where you're starting from.")}
          </h2>
        </div>
        <div className="flagshipGrid stayGrid">
          {guide.stay.map((place: FlagshipStay) => (
            <article key={place.nameEn} className="hotelCard">
              <ImageSlot label={ar ? place.nameAr : place.nameEn} />
              <h3>{ar ? place.nameAr : place.nameEn}</h3>
              <p>{ar ? place.descriptionAr : place.descriptionEn}</p>
            </article>
          ))}
        </div>
      </section>

      {guide.sampleDay.length > 0 && (
        <section className="container flagshipSampleDay">
          <p className="kicker light">{ar ? `تخيل يومًا في ${city.nameAr}` : `Picture a day in ${city.nameEn}`}</p>
          <div className="sampleDayTimeline">
            {guide.sampleDay.map((beat) => (
              <div key={beat.timeEn} className="sampleDayBeat">
                <span className="sampleDayTime">{ar ? beat.timeAr : beat.timeEn}</span>
                <strong>{ar ? beat.placeAr : beat.placeEn}</strong>
                <p>{ar ? beat.descriptionAr : beat.descriptionEn}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container cityPlanCta">
        <div>
          <p className="kicker light">
            {isWorship ? (ar ? "جاهز لتبدأ الترتيبات؟" : "Ready to begin arrangements?") : (ar ? "جاهز لتجعلها رحلتك؟" : "Ready to make it yours?")}
          </p>
          <h2>
            {isWorship
              ? (ar ? <>لنرتّب رحلتك<br /><em>إلى {city.nameAr}.</em></> : <>Let&rsquo;s arrange your journey<br /><em>to {city.nameEn}.</em></>)
              : (ar ? <>لنصمّم حلمك<br /><em>في {city.nameAr}.</em></> : <>Let&rsquo;s shape your dream<br /><em>in {city.nameEn}.</em></>)}
          </h2>
          <p>
            {isWorship
              ? (ar ? `سنبدأ بتحديد ${country.nameAr} و${city.nameAr}، ثم نساعدك في التفاصيل العملية مثل الإقامة والتنقل وتوقيت الزيارة.` : `We'll begin with ${country.nameEn} and ${city.nameEn} already selected, then help with the practical details, accommodation, transport and timing.`)
              : (ar ? `سنبدأ خطتك مع تحديد ${country.nameAr} و${city.nameAr} تلقائيًا، ثم تكمل أنت التفضيلات التي تجعلها خاصة بك.` : `We'll begin with ${country.nameEn} and ${city.nameEn} already selected, then you can add the preferences that make the journey personal.`)}
          </p>
        </div>
        <Link className="button gold cityPlanButton" href={planHref}>
          {isWorship ? (ar ? "ابدأ ترتيب رحلتي" : "Start arranging my visit") : (ar ? "ابدأ خطة أحلامي" : "Start my dream plan")} <ArrowRight className={ar ? "directionArrow" : ""} size={18} />
        </Link>
      </section>
    </main>
  );
}
