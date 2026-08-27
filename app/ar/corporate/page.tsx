import type { Metadata } from "next";
import { PausedNotice } from "../../components/paused-notice";
import Image from "next/image";
import { BriefcaseBusiness, CalendarCheck, FileText, Users } from "lucide-react";

export const metadata: Metadata = { title: "سفر الأعمال", description: "إدارة متكاملة وراقية لسفر الشركات والوفود والقيادات." };

const items = [
  { icon: BriefcaseBusiness, title: "سفر القيادات", text: "برامج دقيقة وموثوقة للقيادات والضيوف، مع تنسيق واضح لكل تنقل مهم." },
  { icon: Users, title: "المجموعات والوفود", text: "فريق واحد مسؤول عن الرحلات المعقدة متعددة المسافرين، من الوصول حتى المغادرة." },
  { icon: CalendarCheck, title: "رحلات العمل والحوافز", text: "برامج هادفة تجمع أهداف الشركة وسلاسة التنظيم وتجارب يتذكرها الفريق." },
  { icon: FileText, title: "تقارير الرحلة بوضوح", text: "الموافقات والحجوزات وبيانات المسافرين وتكاليف سفر الشركة في مكان واحد واضح." },
];

export default function CorporatePage() {
  return <main className="innerPage corporatePage arabicCopyScaled">
    <section className="corporateHero"><div className="container corporateHeroGrid">
      <div className="corporateHeroCopy"><p className="kicker light">ميموريز للأعمال</p><h1>سفر الأعمال،<br /><em>بعناية استثنائية.</em></h1><p>خدمة بشرية وتنسيق واضح وتفاصيل مدروسة للشركات التي تقدر موظفيها وضيوفها.</p></div>
      <div className="corporateHeroMedia"><Image src="/images/corporate-business-travel.png" alt="مسافران سعوديان يراجعان تفاصيل رحلة عمل" fill sizes="(max-width: 900px) 100vw, 42vw" priority /></div>
    </div></section>
    <section className="section container"><div className="serviceGrid corporateGrid">{items.map(({ icon: Icon, title, text }) => <article key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="container corporateCta corporatePaused"><PausedNotice section="corporate" locale="ar" /></section>
  </main>;
}
