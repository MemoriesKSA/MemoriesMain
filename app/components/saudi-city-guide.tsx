"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, MapPin, Sparkles, Utensils } from "lucide-react";
import { useState } from "react";

type City = {
  nameEn: string;
  nameAr: string;
  regionEn: string;
  regionAr: string;
  image?: string;
  introEn: string;
  introAr: string;
  highlightsEn: string[];
  highlightsAr: string[];
  flavourEn: string;
  flavourAr: string;
};

const cities: City[] = [
  { nameEn: "Riyadh", nameAr: "الرياض", regionEn: "Capital energy", regionAr: "نبض العاصمة", image: "/images/destinations/riyadh.png", introEn: "A confident capital where heritage districts, ambitious architecture and a fast-moving dining scene meet.", introAr: "عاصمة واثقة تجمع الأحياء التراثية والعمارة الطموحة ومشهدًا متجددًا للمطاعم.", highlightsEn: ["Diriyah and At-Turaif", "National Museum and Al Murabba", "Kingdom Centre and KAFD", "Seasonal events and desert escapes"], highlightsAr: ["الدرعية وحي الطريف", "المتحف الوطني والمربع", "برج المملكة ومركز الملك عبدالله المالي", "الفعاليات الموسمية والرحلات الصحراوية"], flavourEn: "Contemporary Saudi dining, Najdi flavours and polished cafés.", flavourAr: "مطاعم سعودية معاصرة ونكهات نجدية ومقاهٍ أنيقة." },
  { nameEn: "Jeddah", nameAr: "جدة", regionEn: "Red Sea spirit", regionAr: "روح البحر الأحمر", image: "/images/destinations/jeddah-red-sea.png", introEn: "A relaxed coastal gateway shaped by the Red Sea, historic Al-Balad and an unmistakably creative character.", introAr: "بوابة ساحلية مريحة شكلها البحر الأحمر وجدة التاريخية وروح إبداعية لا تخطئها العين.", highlightsEn: ["Historic Jeddah, Al-Balad", "The Corniche and waterfront", "Red Sea diving and boat days", "Art galleries and design districts"], highlightsAr: ["جدة التاريخية والبلد", "الكورنيش والواجهة البحرية", "الغوص ورحلات البحر الأحمر", "المعارض الفنية وأحياء التصميم"], flavourEn: "Fresh seafood, Hijazi favourites and late-night cafés.", flavourAr: "مأكولات بحرية طازجة وأطباق حجازية ومقاهٍ مسائية." },
  { nameEn: "AlUla", nameAr: "العلا", regionEn: "Living heritage", regionAr: "تراث حي", image: "/images/alula.webp", introEn: "Monumental sandstone landscapes, ancient stories and carefully curated experiences under wide desert skies.", introAr: "تكوينات رملية مهيبة وحكايات قديمة وتجارب منتقاة تحت سماء الصحراء الواسعة.", highlightsEn: ["Hegra archaeological site", "AlUla Old Town", "Elephant Rock at sunset", "Stargazing and desert experiences"], highlightsAr: ["موقع الحِجر الأثري", "بلدة العلا القديمة", "جبل الفيل وقت الغروب", "رصد النجوم وتجارب الصحراء"], flavourEn: "Destination dining, oasis produce and memorable open-air settings.", flavourAr: "مطاعم وجهات ومنتجات الواحة وجلسات خارجية لا تنسى." },
  { nameEn: "Aseer", nameAr: "عسير", regionEn: "Highland colour", regionAr: "ألوان المرتفعات", image: "/images/destinations/abha-aseer.png", introEn: "Cool mountain air, cloud-level viewpoints, painted villages and a proud regional culture.", introAr: "هواء جبلي عليل وإطلالات فوق السحاب وقرى ملونة وثقافة محلية أصيلة.", highlightsEn: ["Abha and the Art Street", "Rijal Almaa village", "Soudah mountain viewpoints", "Hiking and seasonal landscapes"], highlightsAr: ["أبها وشارع الفن", "قرية رجال ألمع", "إطلالات جبل السودة", "المشي والطبيعة الموسمية"], flavourEn: "Aseeri dishes, local honey and warm mountain hospitality.", flavourAr: "أطباق عسيرية وعسل محلي وضيافة جبلية دافئة." },
  { nameEn: "Taif", nameAr: "الطائف", regionEn: "Rose-scented hills", regionAr: "مرتفعات الورد", introEn: "A breezy mountain escape known for rose farms, scenic roads and a gentler summer climate.", introAr: "ملاذ جبلي منعش يشتهر بمزارع الورد والطرق الجميلة وأجوائه الصيفية المعتدلة.", highlightsEn: ["Taif rose farms", "Al Hada mountain road", "Shubra Palace", "Seasonal markets and viewpoints"], highlightsAr: ["مزارع ورد الطائف", "طريق جبل الهدا", "قصر شبرا", "الأسواق الموسمية والإطلالات"], flavourEn: "Rose-infused treats, mountain cafés and traditional Saudi cooking.", flavourAr: "حلويات بنكهة الورد ومقاهٍ جبلية ومطبخ سعودي تقليدي." },
  { nameEn: "Al Ahsa", nameAr: "الأحساء", regionEn: "Oasis stories", regionAr: "حكايات الواحة", introEn: "A vast living oasis with date palms, caves, artisan traditions and distinctive Eastern Province hospitality.", introAr: "واحة حية شاسعة من النخيل والكهوف والحرف التقليدية وضيافة المنطقة الشرقية.", highlightsEn: ["Al Ahsa Oasis", "Al Qarah Mountain", "Al Qaisariya Souq", "Yellow Lake excursions"], highlightsAr: ["واحة الأحساء", "جبل القارة", "سوق القيصرية", "رحلات بحيرة الأصفر"], flavourEn: "Khalas dates, local rice dishes and welcoming family restaurants.", flavourAr: "تمور الخلاص وأطباق الأرز المحلية ومطاعم عائلية مرحبة." },
  { nameEn: "Madinah", nameAr: "المدينة المنورة", regionEn: "Meaningful calm", regionAr: "سكينة ومعنى", introEn: "A city of profound spiritual significance, layered history and a calm that stays with its visitors.", introAr: "مدينة ذات مكانة روحانية عميقة وتاريخ متجذر وسكينة تبقى مع زوارها.", highlightsEn: ["Al Masjid an Nabawi", "Quba Mosque", "Uhud Mountain", "Historic wells and farms"], highlightsAr: ["المسجد النبوي", "مسجد قباء", "جبل أحد", "الآبار والمزارع التاريخية"], flavourEn: "Madinah dates, traditional bakeries and generous local hospitality.", flavourAr: "تمور المدينة والمخابز التقليدية وضيافة محلية كريمة." },
  { nameEn: "Tabuk", nameAr: "تبوك", regionEn: "North-west wonders", regionAr: "روائع الشمال الغربي", introEn: "Dramatic valleys, clear coastlines and an adventurous northern landscape rich in stories.", introAr: "أودية مهيبة وسواحل صافية وطبيعة شمالية مفعمة بالمغامرة والحكايات.", highlightsEn: ["Wadi Al Disah", "Magna and coastal scenery", "Tabuk Castle", "Mountain and desert drives"], highlightsAr: ["وادي الديسة", "مقنا ومشاهد الساحل", "قلعة تبوك", "جولات الجبال والصحراء"], flavourEn: "Northern Saudi cooking, fresh seafood and relaxed local cafés.", flavourAr: "مطبخ شمالي ومأكولات بحرية طازجة ومقاهٍ محلية هادئة." },
];

export function SaudiCityGuide({ locale = "en" }: { locale?: "en" | "ar" }) {
  const ar = locale === "ar";
  const [activeIndex, setActiveIndex] = useState(0);
  const city = cities[activeIndex];
  const t = (en: string, arabic: string) => ar ? arabic : en;

  return <section className="saudiCityGuide">
    <div className="container">
      <div className="saudiGuideHeading"><div><p className="kicker">{t("Choose your Saudi story", "اختر حكايتك في السعودية")}</p><h2>{t("A city for every kind of journey.", "لكل رحلة مدينة تناسبها.")}</h2></div><p>{t("Start with a place that speaks to you. We will help shape the route, rhythm and details around it.", "ابدأ بمكان يجذبك، وسنساعدك في تشكيل المسار والإيقاع والتفاصيل من حوله.")}</p></div>
      <div className="saudiCityTabs" role="tablist" aria-label={t("Saudi destinations", "وجهات سعودية")}>{cities.map((item, index) => <button key={item.nameEn} type="button" role="tab" aria-selected={index === activeIndex} className={index === activeIndex ? "active" : ""} onClick={() => setActiveIndex(index)}><span>{ar ? item.nameAr : item.nameEn}</span><small>{ar ? item.regionAr : item.regionEn}</small></button>)}</div>
      <article className="saudiCityPanel" key={city.nameEn}>
        <div className={`saudiCityVisual${city.image ? " hasImage" : " noImage"}`}>{city.image ? <Image src={city.image} alt={ar ? city.nameAr : city.nameEn} fill sizes="(max-width: 800px) 100vw, 48vw" /> : <><Compass aria-hidden="true" /><span>{ar ? city.nameAr : city.nameEn}</span></>}<div className="saudiCityBadge"><MapPin /> {ar ? city.regionAr : city.regionEn}</div></div>
        <div className="saudiCityCopy"><p className="kicker">{t("Inside the city", "داخل المدينة")}</p><h3>{ar ? city.nameAr : city.nameEn}</h3><p className="saudiCityIntro">{ar ? city.introAr : city.introEn}</p><div className="saudiCityDetails"><div><strong><Sparkles /> {t("Worth experiencing", "تجارب تستحق")}</strong><ul>{(ar ? city.highlightsAr : city.highlightsEn).map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></div><div><strong><Utensils /> {t("Taste of the city", "مذاق المدينة")}</strong><p>{ar ? city.flavourAr : city.flavourEn}</p></div></div><Link className="button gold" href={`${ar ? "/ar" : ""}/discover-saudi-arabia#saudi-planner`}>{t("Plan this Saudi journey", "خطط لهذه الرحلة في السعودية")} <ArrowRight className={ar ? "directionArrow" : ""} size={17} /></Link></div>
      </article>
      <p className="saudiGuideMore">{t("We also plan journeys across Makkah, Jazan, Al Baha, Al Jouf, the Red Sea coast and anywhere else in the Kingdom you want to discover.", "ونخطط أيضًا لرحلات في مكة وجازان والباحة والجوف وساحل البحر الأحمر وأي مكان آخر ترغب في اكتشافه داخل المملكة.")}</p>
    </div>
  </section>;
}
