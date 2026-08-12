import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Globe2, Handshake, Medal } from "lucide-react";
import { DestinationGrid } from "../components/destination-grid";
import { JourneyPlanner } from "../components/journey-planner";
import { NewsletterForm } from "../components/newsletter-form";
import { featuredDestinationsAr } from "./data";

const promises = [
  { icon: Medal, title: "رحلات مصممة لك", text: "حول حلمك وميزانيتك" },
  { icon: Handshake, title: "شركاء موثوقون", text: "مختارون بعناية حول العالم" },
  { icon: Compass, title: "تخطيط متكامل", text: "طيران وإقامة وسائقون والمزيد" },
  { icon: Globe2, title: "للعالم كله", text: "سافر من السعودية أو إليها" },
];

export default function ArabicHome() {
  return <main>
    <section className="hero" aria-labelledby="hero-title-ar"><Image className="heroImage" src="/images/hero-family.webp" alt="عائلة تشاهد المناطيد فوق وادٍ صحراوي" fill priority sizes="100vw" /><div className="heroShade"/><div className="container heroContent"><p className="kicker light">سفر يبدأ من الحلم ويصنع لك</p><h1 id="hero-title-ar" className="editorialHeroTitle">كل رحلة<br/>تبدأ بحلم.<br/><em>ونحن نحوّلها<br/>إلى ذكرى.</em></h1><p className="heroIntro">رحلات استثنائية للعائلات والأزواج والمستكشفين والدارسين، داخل المملكة وحول العالم.</p><div className="buttonRow"><Link className="button gold" href="/ar/design-your-journey">صمّم رحلة أحلامك <ArrowRight className="directionArrow" size={16}/></Link><Link className="button glass" href="/ar/discover-saudi-arabia">اكتشف السعودية <ArrowRight className="directionArrow" size={16}/></Link></div></div></section>
    <section className="promiseWrap" aria-label="لماذا تسافر مع ميموريز"><div className="container promiseBar">{promises.map(({icon:Icon,title,text})=><article className="promise" key={title}><Icon aria-hidden="true"/><div><strong>{title}</strong><span>{text}</span></div></article>)}</div></section>
    <section className="section container" id="destinations"><div className="sectionHeading"><div><p className="kicker">استكشف</p><h2>وجهاتنا الأكثر طلبًا</h2></div><Link className="textLink" href="/ar/destinations">شاهد جميع الوجهات <ArrowRight className="directionArrow" size={15}/></Link></div><DestinationGrid locale="ar" destinations={featuredDestinationsAr.map(({slug,name,image,blurb})=>({slug,name,image,blurb}))}/></section>
    <section className="section container splitFeature"><article className="plannerTeaser"><div className="teaserCopy"><p className="kicker light">صُنعت لك</p><h2>صمّم رحلة أحلامك</h2><p>شاركنا ما تتخيله، وسنعد ونصمم رحلة مخصصة حول من يسافر معك ووتيرتك وميزانيتك وتفضيلاتك.</p><Link className="button gold" href="/ar/design-your-journey">ابدأ تخطيط حلمك <ArrowRight className="directionArrow" size={16}/></Link></div><div className="passport" aria-hidden="true"><span>MEMORIES</span><strong>حلمك<br/>يبدأ هنا</strong></div></article><article className="abroadCard"><p className="kicker">الدراسة في الخارج</p><h2>فصلك القادم،<br/>بخطوات أوضح.</h2><p>إرشاد للدارسين من اختيار الوجهة إلى المساعدة في طلب التأشيرة الدراسية.</p><ul><li>اختيار وجهة الدراسة</li><li>المساعدة في طلب التأشيرة</li><li>الطيران والسكن</li><li>ترتيبات الوصول</li></ul><Link className="button dark" href="/ar/study-abroad">استكشف خدمات الدراسة <ArrowRight className="directionArrow" size={16}/></Link></article></section>
    <section className="container plannerBand"><JourneyPlanner compact locale="ar"/></section><section className="section container"><NewsletterForm locale="ar"/></section>
    <section className="statsBand"><div className="container stats"><div><strong>٠١</strong><span>رحلات أحلام حول العالم</span></div><div><strong>٠٢</strong><span>اكتشف السعودية</span></div><div><strong>٠٣</strong><span>إرشاد للدراسة في الخارج</span></div><div><strong>٠٤</strong><span>مساعدة في طلب التأشيرة</span></div></div></section>
  </main>;
}
