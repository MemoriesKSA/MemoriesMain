import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { destinations } from "../data";
import { destinationsAr } from "../ar/data";
import { legacyDestinationRoutes } from "../destination-guide-data";

const featured = ["alula", "riyadh", "jeddah-red-sea", "paris", "london", "japan"];
const highlights = {
  en: {
    alula: ["Saudi Arabia", "Walk through 200,000 years of human history", "Sandstone monuments, quiet desert trails and starlit evenings make AlUla feel unlike anywhere else."],
    riyadh: ["Saudi Arabia", "Feel the energy of a capital shaping the future", "From Diriyah’s heritage to exceptional dining and desert horizons, Riyadh rewards every kind of curiosity."],
    "jeddah-red-sea": ["Saudi Arabia", "Meet the Red Sea through history and colour", "Explore Al-Balad’s coral-stone lanes, then slow down beside clear water and an extraordinary living reef."],
    paris: ["France", "Turn an iconic city into your own private story", "Art, neighbourhood cafés, timeless streets and beautiful tables, paced around the way you want to experience Paris."],
    london: ["United Kingdom", "A world of culture in one endlessly changing city", "Theatre, football, museums, shopping and characterful neighbourhoods come together in a stay made entirely yours."],
    japan: ["Japan", "Where quiet tradition meets thrilling modern life", "Move from Tokyo’s energy to Kyoto’s temples with thoughtful stays, smooth rail and unforgettable seasonal moments."],
  },
  ar: {
    alula: ["المملكة العربية السعودية", "سر بين مئتي ألف عام من التاريخ الإنساني", "تمنحك المعالم الصخرية ومسارات الصحراء الهادئة وليالي النجوم تجربة لا تشبه أي مكان آخر."],
    riyadh: ["المملكة العربية السعودية", "عش طاقة عاصمة تصنع المستقبل", "من تراث الدرعية إلى المطاعم الاستثنائية وآفاق الصحراء، تكافئ الرياض كل فضول."],
    "jeddah-red-sea": ["المملكة العربية السعودية", "اكتشف البحر الأحمر عبر التاريخ والألوان", "تجوّل في مباني البلد المرجانية ثم استرخِ بجوار المياه الصافية والشعاب الحية المدهشة."],
    paris: ["فرنسا", "حوّل المدينة الأيقونية إلى حكايتك الخاصة", "الفن ومقاهي الأحياء والشوارع الخالدة والموائد الجميلة، كلها بتجربة مصممة لك."],
    london: ["المملكة المتحدة", "عالم من الثقافة في مدينة تتجدد باستمرار", "المسرح وكرة القدم والمتاحف والتسوق والأحياء المميزة تجتمع في إقامة خاصة بك."],
    japan: ["اليابان", "حيث يلتقي هدوء التقاليد بحيوية الحاضر", "انتقل من طاقة طوكيو إلى معابد كيوتو بإقامات مدروسة وقطارات سلسة ومواسم لا تُنسى."],
  },
} as const;

export function FeaturedJourneys({ locale = "en" }: { locale?: "en" | "ar" }) {
  const ar = locale === "ar";
  const data = ar ? destinationsAr : destinations;
  const prefix = ar ? "/ar" : "";
  return <section className="featuredJourneys" id="destinations">
    <div className="container featuredIntro"><div><p className="kicker">{ar ? "وجهات استثنائية" : "Six unforgettable starting points"}</p><h2>{ar ? <>ليس مجرد مكان.<br /><em>بل فصل جديد.</em></> : <>Not just somewhere to go.<br /><em>Somewhere to feel.</em></>}</h2></div><p>{ar ? "اختر وجهة تلهمك، وسنحوّل أفضل ما فيها إلى رحلة تعكس اهتماماتك وتكرارك المفضل للأنشطة وميزانيتك." : "Choose a place that moves you. We’ll turn its best experiences into a journey shaped around your interests, preferred rhythm and complete budget."}</p></div>
    <div className="featuredJourneyList">{featured.map((slug, index) => { const item = data.find((destination) => destination.slug === slug)!; const content = highlights[locale][slug as keyof typeof highlights.en]; const route = legacyDestinationRoutes[slug]; const guideHref = `${prefix}/destinations/${route.country}/${route.city}`; const planHref = `${prefix}/design-your-journey?country=${route.country}&city=${route.city}&source=city-guide`; return <article className="featuredJourney" key={slug}><div className="featuredJourneyImage"><Image src={item.image} alt={item.name} fill sizes="(max-width: 800px) 100vw, 58vw" priority={index < 2} /><span className="featuredNumber">0{index + 1}</span></div><div className="featuredJourneyCopy"><span className="featuredLocation"><MapPin aria-hidden="true" />{content[0]}</span><h3>{item.name}</h3><strong>{content[1]}</strong><p>{content[2]}</p><div><Link className="button gold" href={planHref}>{ar ? "ابدأ هذه الرحلة" : "Start this journey"} <ArrowRight className="directionArrow" size={16} /></Link><Link className="textLink" href={guideHref}>{ar ? "اكتشف التفاصيل" : "Discover more"} <ArrowRight className="directionArrow" size={15} /></Link></div></div></article>; })}</div>
    <div className="container featuredMore"><p>{ar ? "هذه مجرد البداية. استكشف مجموعتنا الكاملة من الوجهات داخل السعودية وحول العالم." : "This is only the beginning. Explore our complete gallery of places across Saudi Arabia and the world."}</p><Link className="button dark" href={`${prefix}/destinations`}>{ar ? "شاهد جميع الوجهات" : "View all destinations"} <ArrowRight className="directionArrow" size={17} /></Link></div>
  </section>;
}
