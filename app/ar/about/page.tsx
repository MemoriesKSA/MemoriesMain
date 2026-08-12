import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "عن ميموريز", description: "ميموريز منصة سفر انطلقت من السعودية لرحلات الأحلام وزيارة المملكة والتخطيط للدراسة في الخارج." };

export default function AboutPage() {
  return <main className="innerPage"><section className="pageHero container"><p className="kicker">ما هي ميموريز؟</p><h1>حلم واحد.<br /><em>ورحلة متكاملة.</em></h1><p>ميموريز منصة سفر انطلقت من السعودية لتحول الفكرة إلى رحلة منسقة. نجمع الوجهات والتواريخ والطيران والإقامة والسائقين الخاصين والتجارب والمساعدة العملية في خطة واحدة مدروسة.</p></section><section className="container storyGrid"><article><span>٠١</span><h2>رحلات الأحلام</h2><p>إجازات شخصية للعائلات والأزواج والأصدقاء والمستكشفين، نبنيها حول الدولة والمدن والتواريخ والتكرار المفضل للأنشطة والميزانية الكاملة المناسبة لهم.</p></article><article><span>٠٢</span><h2>اكتشف السعودية</h2><p>رحلات ترحب بزوار المملكة لاكتشاف مدنها وتراثها وطبيعتها وثقافتها ووجهاتها المقدسة.</p></article><article><span>٠٣</span><h2>الدراسة في الخارج</h2><p>مسار أوضح للدارسين، يشمل إرشاد الوجهة والمساعدة في السفر والسكن وطلبات التأشيرة الدراسية.</p></article></section><section className="container aboutStatement"><p className="kicker light">جذور سعودية. ونظرة عالمية.</p><h2>نفهم أفكارك لتجهيز رحلة أحلامك.</h2><p>يمنحنا كل طلب التفاصيل اللازمة لتصميم الخطوة التالية: إلى أين تريد السفر، ولماذا، ومن سيرافقك، ومتى ستسافر، وما الميزانية الكاملة للرحلة. بعدها تعد ميموريز خطة شخصية وعملية وقابلة للتنفيذ.</p><Link className="button gold" href="/ar/design-your-journey">صمّم رحلة أحلامك <ArrowRight className="directionArrow" size={16} /></Link></section></main>;
}
