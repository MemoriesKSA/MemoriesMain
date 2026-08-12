import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarCheck, FileText, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "سفر الأعمال",
  description: "إدارة متكاملة وراقية لسفر الشركات والوفود والقيادات.",
};

const items = [
  { icon: BriefcaseBusiness, title: "سفر القيادات", text: "برامج دقيقة وموثوقة للقيادات والضيوف بخصوصية تامة." },
  { icon: Users, title: "المجموعات والوفود", text: "فريق واحد مسؤول عن تنسيق الرحلات المعقدة متعددة المسافرين." },
  { icon: CalendarCheck, title: "الخلوات والحوافز", text: "تجارب هادفة تبقى فعلًا في ذاكرة فريقك." },
  { icon: FileText, title: "تقارير واضحة", text: "الموافقات وبيانات المسافرين ومتابعة الإنفاق في مكان واحد." },
];

export default function CorporatePage() {
  return (
    <main className="innerPage arabicCopyScaled">
      <section className="corporateHero">
        <div className="container">
          <p className="kicker light">ميموريز للأعمال</p>
          <h1>سفر الأعمال،<br /><em>بعناية استثنائية.</em></h1>
          <p>خدمة بشرية وتنسيق واضح وتفاصيل مدروسة للشركات التي تقدر موظفيها وضيوفها.</p>
          <a className="button gold" href="mailto:memoriesksasupport@gmail.com">ابدأ المحادثة <ArrowRight className="directionArrow" size={16} /></a>
        </div>
      </section>
      <section className="section container">
        <div className="serviceGrid corporateGrid">{items.map(({ icon: Icon, title, text }) => <article key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>
      <section className="container corporateCta">
        <h2>هل تخطط لوفد أو خلوة عمل أو زيارة تنفيذية؟</h2>
        <p>شاركنا الهدف والتواريخ وعدد المسافرين، وسنرد عليك بالخطوة الأنسب.</p>
        <Link className="button dark" href="/ar/design-your-journey">أرسل طلبك <ArrowRight className="directionArrow" size={16} /></Link>
      </section>
    </main>
  );
}
