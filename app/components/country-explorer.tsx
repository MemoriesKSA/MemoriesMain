import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Compass, MapPin } from "lucide-react";
import type { CSSProperties } from "react";
import type { CountryGuide, Locale } from "../destination-guide-data";
import { activeSeasonFor, SAUDI_WINTER, saudiWinterIsOn, seasonEndsAt, type CitySeason } from "../seasons-data";
import { RiyadhSeasonLogo } from "./riyadh-season-logo";
import { SeasonCountdown } from "./season-countdown";

/** A season that is on: its own logo with a countdown under it, or our text badge when it has no logo. */
function SeasonBadge({ season, ar, onImage = false }: { season: CitySeason; ar: boolean; onImage?: boolean }) {
  if (season.logo === "riyadh-season") {
    return <>
      {onImage && <i className="seasonShade" aria-hidden="true" />}
      <b className={onImage ? "seasonMark onImage" : "seasonMark inline"}>
        <RiyadhSeasonLogo title={ar ? "موسم الرياض" : "Riyadh Season"} />
        <SeasonCountdown endsAt={seasonEndsAt(season)} ar={ar} />
      </b>
    </>;
  }
  return <b className={onImage ? "seasonBadge onImage" : "seasonBadge"}><i aria-hidden="true" />{ar ? season.labelAr : season.labelEn}</b>;
}

/** Saudi Winter: the season's best places, with what makes each one worth it now. */
function SaudiWinterBand({ country, ar, prefix }: { country: CountryGuide; ar: boolean; prefix: string }) {
  const picks = SAUDI_WINTER.picks.flatMap((pick) => {
    const city = country.cities.find((c) => c.slug === pick.city);
    return city ? [{ ...pick, guide: city }] : [];
  });
  return <section className="container winterBand" aria-labelledby="saudi-winter">
    <div className="winterBandHeading">
      <div><p className="kicker">{ar ? "شتاء السعودية 2026–2027" : "Saudi Winter 2026–27"}</p><h2 id="saudi-winter">{ar ? <>حيّ <em>الشتاء</em></> : <>Winter is <em>here</em></>}</h2></div>
      <p>{ar ? "من أكتوبر إلى مارس أحلى أيام السعودية: موسم الرياض شغّال، والصحراء والجبال تبرد بما يكفي للمشي، والساحل في أفضل حالاته. هذي الوجهات اللي يستاهل الشتاء تخطط لها." : "October to March is when Saudi is at its best: Riyadh Season is running, the desert is cool enough to walk and the coast is at its kindest. These are the places worth planning a winter around."}</p>
    </div>
    <div className="winterGrid">
      {picks.map(({ guide, lineEn, lineAr }) => {
        const season = activeSeasonFor(country.slug, guide.slug);
        return <Link className="winterCard" href={`${prefix}/destinations/${country.slug}/${guide.slug}`} key={guide.slug}>
          <span className="winterCardImage"><Image src={guide.image} alt="" fill sizes="96px" /></span>
          <span className="winterCardBody">
            <strong>{ar ? guide.nameAr : guide.nameEn}</strong>
            {season && <SeasonBadge season={season} ar={ar} />}
            <span>{ar ? lineAr : lineEn}</span>
          </span>
        </Link>;
      })}
    </div>
    <p className="winterNote">
      {ar ? "وفي الشمال، مسار الشمال من الدرعية إلى جبّة مرورًا بالقصيم وحائل، 16 محطة. تبيه في خطتك؟ " : "Further north, the Northern Route runs from Diriyah to Jubbah through Qassim and Hail, sixteen stops. Want it in your plan? "}
      <Link href={`${prefix}/design-your-journey?country=${country.slug}`}>{ar ? "قل لنا" : "Tell us"}</Link>
      {" · "}
      <a href={ar ? SAUDI_WINTER.sourceUrlAr : SAUDI_WINTER.sourceUrlEn} target="_blank" rel="noopener noreferrer">{ar ? "شتاء السعودية على موقع روح السعودية" : "Saudi Winter on Visit Saudi"}</a>
    </p>
  </section>;
}

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
            {ar ? "أول زيارة لك؟ خذلك طلة على الدليل والباقي علينا." : "First time visiting? Read Know Before You Go"}
            <ArrowRight className={ar ? "directionArrow" : ""} size={15} />
          </Link>
        )}
      </div>
    </section>
    {country.slug === "saudi-arabia" && saudiWinterIsOn() && <SaudiWinterBand country={country} ar={ar} prefix={prefix} />}
    <section className="container citySelector">
      <div className="citySelectorHeading">
        <div><p className="kicker">{ar ? "اختر مدينتك" : "Choose your place"}</p><h2>{ar ? <>وين ودك<br /><em>تروح؟</em></> : <>Where do you want<br /><em>to go?</em></>}</h2></div>
        <p>{ar ? `كل مدينة في ${country.nameAr} تحمل إيقاعًا مختلفًا. اختر المدينة التي تشبه حلمك، ثم اكتشف تفاصيلها قبل أن تبدأ خطتك.` : `Every place in ${country.nameEn} has a different rhythm. Choose the one that feels like your dream, then discover it before beginning your plan.`}</p>
      </div>
      <div className="cityGallery">
        {country.cities.map((city, index) => { const season = activeSeasonFor(country.slug, city.slug); return <Link href={`${prefix}/destinations/${country.slug}/${city.slug}`} className="cityGalleryCard" key={city.slug} style={{ "--city-order": index } as CSSProperties}>
          <span className="cityGalleryImage"><Image src={city.image} alt={ar ? city.nameAr : city.nameEn} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" /><span />{season && <SeasonBadge onImage season={season} ar={ar} />}</span>
          <span className="cityGalleryBody"><small><MapPin size={13} /> {ar ? country.nameAr : country.nameEn}</small><strong>{ar ? city.nameAr : city.nameEn}</strong><span>{ar ? city.introAr : city.introEn}</span><em>{ar ? "ادخل المدينة" : "Step inside"} <ArrowRight className="directionArrow" size={16} /></em></span>
        </Link>; })}
        <Link className="cityGalleryCard cityAnywhereCard" href={`${prefix}/design-your-journey?country=${country.slug}`}>
          <Compass aria-hidden="true" /><p className="kicker light">{ar ? "وش الوجهة الي ببالك" : "Somewhere else in mind"}</p><strong>{ar ? "قل لنا عن المكان الي ودك تروحله" : "Tell us where you dream of going."}</strong><span>{ar ? "وأبشر باللي يرضيك، نرتب لك الخطة على ذوقك وميزانيتك." : "We’ll take your idea as the starting point and shape the plan around it."}</span><em>{ar ? "صمّم رحلتك" : "Design your journey"} <ArrowRight className="directionArrow" size={16} /></em>
        </Link>
      </div>
    </section>
  </main>;
}
