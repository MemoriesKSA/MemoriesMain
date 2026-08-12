import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "من نحن",
  description: "تعرّف على رؤية ميموريز لرحلات أكثر خصوصية واهتمامًا بالمسافر السعودي.",
};

export default function AboutPage() {
  return (
    <main className="innerPage">
      <section className="pageHero container">
        <p className="kicker">غايتنا</p>
        <h1>نؤمن أن السفر<br /><em>يجب أن يكون شخصيًا.</em></h1>
        <p>وُلدت ميموريز في المملكة العربية السعودية للمسافرين الذين يريدون حرية الاستكشاف دون التخلي عن الألفة والعناية وراحة البال.</p>
      </section>
      <section className="container storyGrid">
        <article><span>٠١</span><h2>نستمع أولًا</h2><p>إيقاعك وأولوياتك ومن يسافر معك أهم لدينا من أي باقة جاهزة.</p></article>
        <article><span>٠٢</span><h2>نختار بعناية</h2><p>نختار كل شريك وإقامة وتجربة على أساس الجودة والثقة والقيمة الحقيقية.</p></article>
        <article><span>٠٣</span><h2>نبقى قريبين</h2><p>تستمر عنايتنا بعد المغادرة، مع استجابة بشرية كلما احتاجتنا رحلتك.</p></article>
      </section>
      <section className="container manifesto">
        <p>«لا نبيع رحلات؛ بل نصنع المساحة التي تتيح للعائلات والأصدقاء والمسافرين أن يصنعوا ذكريات تبقى.»</p>
        <Link className="button gold" href="/ar/design-your-journey">ابدأ رحلتك <ArrowRight className="directionArrow" size={16} /></Link>
      </section>
    </main>
  );
}
