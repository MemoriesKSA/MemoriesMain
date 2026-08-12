import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Headphones, MapPinned, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "سعوديون في الخارج",
  description: "خدمات موثوقة ودعم محلي للمسافرين السعوديين حول العالم.",
};

const services = [
  { icon: MapPinned, title: "إرشاد للمدن", text: "توصيات عملية تراعي ثقافتك وتصل إليك قبل وصولك." },
  { icon: Building2, title: "خدمات موثوقة", text: "سائقون ومرشدون وعيادات وشركاء مناسبون للعائلات، اخترناهم بعناية." },
  { icon: Headphones, title: "مساعدة ٢٤/٧", text: "خط دعم حقيقي حين تتغير خططك أو تحتاج إلى مساعدة." },
  { icon: Sparkles, title: "تجارب حصرية", text: "تجارب وامتيازات مدروسة ومختارة لأعضاء ميموريز." },
  { icon: ShieldCheck, title: "خصوصيتك أولًا", text: "تعامل سري ومحترم مع برنامج رحلتك وتفضيلاتك الشخصية." },
  { icon: BadgeCheck, title: "بفهم سعودي", text: "خدمة صُممت حول لغتك وقيمك وطريقتك في السفر." },
];

export default function SaudiAbroadPage() {
  return (
    <main className="innerPage">
      <section className="abroadHero">
        <div className="container">
          <p className="kicker light">سعوديون في الخارج</p>
          <h1>كأنك في وطنك،<br /><em>أينما ذهبت.</em></h1>
          <p>دعم يسافر معك؛ من الإرشاد المحلي العملي إلى صوت موثوق حين تحتاج إليه.</p>
          <Link className="button gold" href="/ar/design-your-journey">أخبرنا إلى أين ستذهب <ArrowRight className="directionArrow" size={16} /></Link>
        </div>
      </section>
      <section className="section container">
        <div className="sectionHeading">
          <div><p className="kicker">سافر بثقة</p><h2>دائرة موثوقة حولك</h2></div>
          <p className="headingCopy">نبني شبكة مختارة بعناية في أكثر الوجهات زيارةً من المسافرين السعوديين.</p>
        </div>
        <div className="serviceGrid">{services.map(({ icon: Icon, title, text }) => <article key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>
      <section className="container launchNote">
        <span>ننطلق مدينةً بعد مدينة</span>
        <h2>انضم إلى قائمة المسافرين المؤسسين</h2>
        <p>أخبرنا أي مدينة تحتاجها أكثر. إجابتك ستساعدنا في اختيار أول وجهة تطلق فيها خدمة سعوديون في الخارج.</p>
        <Link className="button dark" href="/ar/design-your-journey">شاركنا وجهتك <ArrowRight className="directionArrow" size={16} /></Link>
      </section>
    </main>
  );
}
