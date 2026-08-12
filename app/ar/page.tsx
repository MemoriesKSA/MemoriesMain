import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Headphones, Handshake, Medal, Users } from "lucide-react";
import { DestinationGrid } from "../components/destination-grid";
import { JourneyPlanner } from "../components/journey-planner";
import { NewsletterForm } from "../components/newsletter-form";
import { destinationsAr } from "./data";

const promises = [
  { icon: Medal, title: "رحلات مصممة لك", text: "بحسب أسلوبك ووتيرتك" },
  { icon: Handshake, title: "شركاء موثوقون", text: "مختارون بعناية حول العالم" },
  { icon: Headphones, title: "دعم على مدار الساعة", text: "شخص حقيقي حين تحتاجه" },
  { icon: Users, title: "من السعوديين وللسعوديين", text: "نفهم طريقتك في السفر" },
];

export default function ArabicHome() {
  return <main>
    <section className="hero" aria-labelledby="hero-title-ar"><Image className="heroImage" src="/images/hero-family.webp" alt="عائلة سعودية تشاهد المناطيد فوق وادٍ صحراوي" fill priority sizes="100vw" /><div className="heroShade"/><div className="container heroContent"><p className="kicker light">رحلات خاصة بروح سعودية</p><h1 id="hero-title-ar">كل رحلة<br/>تبدأ بحلم.<br/><em>ونحن نحوّلها<br/>إلى ذكرى.</em></h1><p className="heroIntro">رحلات استثنائية للعائلات والأزواج والمستكشفين السعوديين، داخل المملكة وحول العالم.</p><div className="buttonRow"><Link className="button gold" href="/ar/design-your-journey">صمّم رحلتك <ArrowRight className="directionArrow" size={16}/></Link><Link className="button glass" href="#destinations">استكشف الوجهات <ArrowRight className="directionArrow" size={16}/></Link></div></div></section>
    <section className="promiseWrap" aria-label="لماذا تسافر مع ميموريز"><div className="container promiseBar">{promises.map(({icon:Icon,title,text})=><article className="promise" key={title}><Icon aria-hidden="true"/><div><strong>{title}</strong><span>{text}</span></div></article>)}</div></section>
    <section className="section container" id="destinations"><div className="sectionHeading"><div><p className="kicker">استكشف</p><h2>وجهاتنا الأكثر طلبًا</h2></div><Link className="textLink" href="/ar/destinations">شاهد جميع الوجهات <ArrowRight className="directionArrow" size={15}/></Link></div><DestinationGrid locale="ar" destinations={destinationsAr.map(({slug,name,image,blurb})=>({slug,name,image,blurb}))}/></section>
    <section className="section container splitFeature"><article className="plannerTeaser"><div className="teaserCopy"><p className="kicker light">صُنعت لك</p><h2>صمّم رحلتك</h2><p>شاركنا ما تتخيله، وسيصوغ مصمم رحلات متخصص كل التفاصيل حول عائلتك ووتيرتك وتفضيلاتك.</p><Link className="button gold" href="/ar/design-your-journey">ابدأ التخطيط <ArrowRight className="directionArrow" size={16}/></Link></div><div className="passport" aria-hidden="true"><span>MEMORIES</span><strong>رحلتك<br/>تبدأ هنا</strong></div></article><article className="abroadCard"><p className="kicker">سعوديون في الخارج</p><h2>معك،<br/>أينما كنت.</h2><p>إرشاد محلي ودعم موثوق للمسافرين السعوديين خارج المملكة.</p><ul><li>أدلة ونصائح للمدن</li><li>خدمات خاصة موثوقة</li><li>مساعدة على مدار الساعة</li><li>عروض حصرية للأعضاء</li></ul><Link className="button dark" href="/ar/saudi-abroad">استكشف الخدمات <ArrowRight className="directionArrow" size={16}/></Link></article></section>
    <section className="container plannerBand"><JourneyPlanner compact locale="ar"/></section><section className="section container"><NewsletterForm locale="ar"/></section>
    <section className="statsBand"><div className="container stats"><div><strong>+٥٠</strong><span>وجهة حول العالم</span></div><div><strong>+١٠ آلاف</strong><span>رحلة حُلم تم تخطيطها</span></div><div><strong>٢٤/٧</strong><span>دعم أينما احتجت إليه</span></div><div><strong>١٠٠٪</strong><span>خصوصية وأمان</span></div></div></section>
  </main>;
}
