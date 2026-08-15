import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, HeartHandshake, ListChecks, Search, Sparkles, Waypoints } from "lucide-react";

export const metadata: Metadata = { title: "عن ميموريز", description: "ميموريز منصة سفر انطلقت من السعودية لرحلات الأحلام وزيارة المملكة والتخطيط للدراسة في الخارج." };

const principles = [
  { icon: HeartHandshake, title: "نستمع أولاً", text: "نبدأ بالإنسان وهدف الرحلة والشعور الذي يريد أن يعود به." },
  { icon: Search, title: "نبحث بعناية", text: "نقارن الخيارات العملية ونجد التفاصيل التي تجعل الوجهة مناسبة لك." },
  { icon: Waypoints, title: "نربط تفاصيل الرحلة", text: "نفكر في الطيران والإقامة والنقل والتجارب كرحلة واحدة متكاملة." },
  { icon: Sparkles, title: "نحافظ على طابعك", text: "يعكس التصور النهائي إيقاعك وأولوياتك وميزانيتك الكاملة." },
];

export default function AboutPage() {
  return <main className="innerPage aboutPage arabicCopyScaled">
    <section className="pageHero container"><p className="kicker">ما هي ميموريز؟</p><h1>حلم واحد.<br /><em>ورحلة متكاملة.</em></h1><p>ميموريز منصة سفر انطلقت من السعودية لتحول الفكرة إلى رحلة منسقة. نجمع الوجهات والتواريخ والطيران والإقامة والنقل والتجارب والمساعدة العملية في خطة واحدة مدروسة.</p></section>
    <section className="container storyGrid"><article><span>٠١</span><h2>رحلات الأحلام</h2><p>إجازات شخصية للعائلات والأزواج والأصدقاء والمستكشفين، نبنيها حول الدولة والمدن والتواريخ والإيقاع والميزانية الكاملة المناسبة لهم.</p></article><article><span>٠٢</span><h2>اكتشف السعودية</h2><p>رحلات ترحب بزوار المملكة لاكتشاف مدنها وتراثها وطبيعتها وثقافتها ووجهاتها المقدسة.</p></article><article><span>٠٣</span><h2>الدراسة في الخارج</h2><p>مسار أوضح للدارسين، يشمل إرشاد الوجهة والجامعة والسفر والسكن والمساعدة في طلب التأشيرة الدراسية.</p></article></section>
    <section className="container aboutPurpose"><div><p className="kicker">لماذا ميموريز؟</p><h2>تخطيط السفر الجيد يجب أن يكون واضحًا وإنسانيًا ومدروسًا.</h2></div><p>يمكن لمحركات البحث والذكاء الاصطناعي إنتاج قوائم لا تنتهي. دورنا هو تحويل تفضيلاتك إلى تصور مركز، والبحث في الاحتمالات المناسبة، وتسهيل القرار التالي. نجمع فهمنا المحلي بنظرة أوسع للعالم ثم ننظم التفاصيل حول المسافر.</p></section>
    <section className="section container"><div className="aboutPrinciples">{principles.map(({ icon: Icon, title, text }) => <article key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="container aboutProcess"><p className="kicker">كيف تتشكل الرحلة؟</p><div><article><span>٠١</span><Compass /><h3>تصورك</h3><p>تخبرنا بالوجهة والهدف والتواريخ والمسافرين والميزانية الكاملة.</p></article><article><span>٠٢</span><Search /><h3>بحثنا</h3><p>نراجع الوجهات والإقامة والنقل والتجارب التي تناسب تصورك.</p></article><article><span>٠٣</span><ListChecks /><h3>خطوة واضحة</h3><p>تستلم اتجاهًا منظمًا للخطوة التالية، مصممًا حول رحلتك.</p></article></div></section>
    <section className="container aboutStatement"><p className="kicker light">جذور سعودية. ونظرة عالمية.</p><h2>نفهم أفكارك لتجهيز رحلة أحلامك.</h2><p>يمنحنا كل طلب التفاصيل اللازمة لتصميم الخطوة التالية، ومنها تعد ميموريز خطة شخصية وعملية وقابلة للتنفيذ.</p><Link className="button gold" href="/ar/design-your-journey">صمّم رحلة أحلامك <ArrowRight className="directionArrow" size={16} /></Link></section>
  </main>;
}
