import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Camera, HelpCircle, Lightbulb, MapPin, Sparkles, UtensilsCrossed } from "lucide-react";
import type { CityGuide, CountryGuide, Locale } from "../destination-guide-data";
import { countryGuideBySlug } from "../destination-guide-data";
import type { EditorialCityGuide, FlagshipDining, FlagshipPlace, FlagshipStay } from "../flagship-city-data";
import { Breadcrumb } from "./breadcrumb";
import { SectionJumpNav, type JumpNavItem } from "./section-jump-nav";
import { WeatherTransportTabs } from "./weather-transport-tabs";
import { FaqAccordion, type FaqItem } from "./faq-accordion";
import { KeepExploringCarousel } from "./keep-exploring-carousel";

function ImageSlot({ label }: { label: string }) {
  return (
    <div className="imageSlot" role="img" aria-label={label}>
      <Camera aria-hidden="true" />
    </div>
  );
}

function hasPublicImage(src: string) {
  return existsSync(join(process.cwd(), "public", src));
}

export function FlagshipCityGuidePage({
  country,
  city,
  guide,
  locale = "en",
}: {
  country: CountryGuide;
  city: CityGuide;
  guide: EditorialCityGuide;
  locale?: Locale;
}) {
  const ar = locale === "ar";
  const prefix = ar ? "/ar" : "";
  const isWorship = guide.tone === "worship";
  const planHref = `${prefix}/design-your-journey?country=${country.slug}&city=${city.slug}&source=flagship-guide`;
  const story = ar ? guide.storyAr : guide.storyEn;
  const cityName = ar ? city.nameAr : city.nameEn;

  const hasDining = guide.dining.length > 0;
  const hasStay = guide.stay.length > 0;
  const hasSampleDay = guide.sampleDay.length > 0;
  const hasFaq = (guide.faq?.length ?? 0) > 0;
  const hasTips = (guide.travelTips?.length ?? 0) > 0;

  const tagPills = Array.from(new Set(guide.attractions.map((place) => (ar ? place.categoryAr : place.categoryEn))));

  const navItems: JumpNavItem[] = [
    { id: "about", labelEn: "About", labelAr: "نبذة" },
    { id: "weather", labelEn: "Weather", labelAr: "الطقس" },
    { id: "places", labelEn: isWorship ? "Sites" : "Places", labelAr: isWorship ? "المعالم" : "أماكن" },
    ...(hasDining ? [{ id: "dining", labelEn: "Eat", labelAr: "الطعام" }] : []),
    ...(hasStay ? [{ id: "stay", labelEn: "Stay", labelAr: "الإقامة" }] : []),
    ...(hasSampleDay ? [{ id: "day", labelEn: "Sample day", labelAr: "يوم نموذجي" }] : []),
    ...(hasFaq ? [{ id: "faq", labelEn: "FAQ", labelAr: "الأسئلة" }] : []),
    ...(hasTips ? [{ id: "tips", labelEn: "Travel tips", labelAr: "نصائح السفر" }] : []),
    { id: "explore", labelEn: "Keep exploring", labelAr: "استكشف المزيد" },
  ];

  const faqItems: FaqItem[] = [
    ...(guide.faq ?? []),
    {
      questionEn: "Having trouble planning your journey?",
      questionAr: "تواجه صعوبة في تخطيط رحلتك؟",
      answerEn: "That's exactly what we're here for. Tell us your dates, who's travelling and what you're hoping for, and we'll shape a plan around it.",
      answerAr: "هذا بالضبط ما نحن هنا من أجله. أخبرنا بتواريخك ومن سيرافقك وما تتطلع إليه، وسنصمم خطة حول ذلك.",
      href: planHref,
    },
  ];

  const otherCities = (countryGuideBySlug("saudi-arabia")?.cities ?? []).filter((candidate) => candidate.slug !== city.slug);

  return (
    <main className="innerPage flagshipCityPage">
      <Breadcrumb
        locale={locale}
        items={[
          { label: ar ? "الرئيسية" : "Home", href: `${prefix}/` },
          { label: ar ? "اكتشف السعودية" : "Discover Saudi Arabia", href: `${prefix}/discover-saudi-arabia` },
          { label: cityName },
        ]}
      />

      <section className="flagshipHero">
        {hasPublicImage(city.image) ? (
          <Image src={city.image} alt={cityName} fill priority sizes="100vw" />
        ) : (
          <div className="flagshipHeroImageSlot" role="img" aria-label={cityName}><Camera aria-hidden="true" /></div>
        )}
        <div className="flagshipHeroShade" />
        <div className="container flagshipHeroCopy">
          <p className="kicker light">
            {isWorship
              ? (ar ? `دليل العمرة والزيارة · ${country.nameAr}` : `Umrah & visit guide · ${country.nameEn}`)
              : (ar ? `دليل موسّع · ${country.nameAr}` : `Flagship guide · ${country.nameEn}`)}
          </p>
          <h1>{cityName}</h1>
          <div className="cityHeroMeta">
            <span><MapPin /> {ar ? country.regionAr : country.region}</span>
          </div>
        </div>
      </section>

      <SectionJumpNav items={navItems} locale={locale} />

      <section className="container flagshipStory" id="about">
        <h2>{ar ? `نبذة عن ${cityName}` : `About ${cityName}`}</h2>
        {story.map((paragraph, index) => (
          <p key={index} className={index === 0 ? "flagshipStoryLead" : undefined}>{paragraph}</p>
        ))}
        {tagPills.length > 0 && (
          <div className="tagPills">
            {tagPills.map((tag) => <span key={tag} className="tagPill">{tag}</span>)}
          </div>
        )}
        <Link className="flagshipSoftCta" href={planHref}>
          {isWorship
            ? (ar ? "جاهز نرتب لك رحلة؟" : "Ready to start arranging your visit?")
            : (ar ? "تعرف بالفعل أن هذه رحلتك؟ ابدأ خطتك" : "Already know this is your trip? Start your plan")}
          <ArrowRight className={ar ? "directionArrow" : ""} size={15} />
        </Link>
      </section>

      <section className="container flagshipWeather" id="weather">
        <p className="kicker">{ar ? "الطقس والتوقيت" : "Weather & timing"}</p>
        <WeatherTransportTabs guide={guide} locale={locale} />
      </section>

      <section className="container flagshipPullQuote">
        <p>{ar ? guide.pullQuoteAr : guide.pullQuoteEn}</p>
      </section>

      <section className="container flagshipSection" id="places">
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

      {hasDining && (
        <section className="container flagshipSection" id="dining">
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

      {hasStay && (
        <section className="container flagshipSection" id="stay">
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
                <div className="placeCardMedia">
                  <ImageSlot label={ar ? place.nameAr : place.nameEn} />
                  {place.tier && (
                    <span className="placeBadge">
                      {place.tier === "luxury" ? (ar ? "فاخر" : "Luxury") : (ar ? "اقتصادي" : "Budget-friendly")}
                    </span>
                  )}
                </div>
                <h3>{ar ? place.nameAr : place.nameEn}</h3>
                <p>{ar ? place.descriptionAr : place.descriptionEn}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {hasSampleDay && (
        <section className="container flagshipSampleDay" id="day">
          <p className="kicker light">{ar ? `تخيل يومًا في ${cityName}` : `Picture a day in ${cityName}`}</p>
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

      {hasFaq && (
        <section className="container flagshipSection" id="faq">
          <div className="flagshipSectionHeading">
            <p className="kicker"><HelpCircle size={14} /> {ar ? "الأسئلة الشائعة" : "Frequently asked"}</p>
            <h2>{ar ? `أسئلة يطرحها المسافرون إلى ${cityName}.` : `Questions travellers ask about ${cityName}.`}</h2>
          </div>
          <FaqAccordion items={faqItems} locale={locale} />
        </section>
      )}

      {hasTips && (
        <section className="container flagshipSection" id="tips">
          <div className="flagshipSectionHeading">
            <p className="kicker"><Lightbulb size={14} /> {ar ? "نصائح للسفر" : "Travel tips"}</p>
            <h2>{ar ? "تفاصيل عملية صغيرة تساعد رحلتك." : "Small practical details that help your trip."}</h2>
          </div>
          <ul className="tipsList">
            {guide.travelTips?.map((tip, index) => <li key={index}>{ar ? tip.ar : tip.en}</li>)}
          </ul>
        </section>
      )}

      <section className="container cityPlanCta">
        <div>
          <p className="kicker light">
            {isWorship ? (ar ? "جاهز لتبدأ الترتيبات؟" : "Ready to begin arrangements?") : (ar ? "جاهز لتجعلها رحلتك؟" : "Ready to make it yours?")}
          </p>
          <h2>
            {isWorship
              ? (ar ? <>لنرتّب رحلتك<br /><em>إلى {cityName}.</em></> : <>Let&rsquo;s arrange your journey<br /><em>to {cityName}.</em></>)
              : (ar ? <>لنصمّم حلمك<br /><em>في {cityName}.</em></> : <>Let&rsquo;s shape your dream<br /><em>in {cityName}.</em></>)}
          </h2>
          <p>
            {isWorship
              ? (ar ? `سنبدأ بتحديد ${country.nameAr} و${cityName}، ثم نساعدك في التفاصيل العملية مثل الإقامة والتنقل وتوقيت الزيارة.` : `We'll begin with ${country.nameEn} and ${cityName} already selected, then help with the practical details, accommodation, transport and timing.`)
              : (ar ? `سنبدأ خطتك مع تحديد ${country.nameAr} و${cityName} تلقائيًا، ثم تكمل أنت التفضيلات التي تجعلها خاصة بك.` : `We'll begin with ${country.nameEn} and ${cityName} already selected, then you can add the preferences that make the journey personal.`)}
          </p>
        </div>
        <Link className="button gold cityPlanButton" href={planHref}>
          {isWorship ? (ar ? "ابدأ ترتيب رحلتي" : "Start arranging my visit") : (ar ? "ابدأ خطة أحلامي" : "Start my dream plan")} <ArrowRight className={ar ? "directionArrow" : ""} size={18} />
        </Link>
      </section>

      {otherCities.length > 0 && (
        <section className="container flagshipSection" id="explore">
          <div className="flagshipSectionHeading">
            <p className="kicker"><MapPin size={14} /> {ar ? "استكشف المزيد" : "Keep exploring"}</p>
            <h2>{ar ? "استكشف بقية المملكة العربية السعودية." : "Keep exploring Saudi Arabia."}</h2>
          </div>
          <KeepExploringCarousel cities={otherCities} locale={locale} />
        </section>
      )}
    </main>
  );
}
