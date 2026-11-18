import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { exampleHref } from "../../examples/example-plans";

// Where to go this winter, written for people searching from Saudi Arabia.
//
// The searches it answers ("وين اروح في نوفمبر ديسمبر", "وين اروح اجازة
// الشتاء") are ones our city guides never could: nobody types a city they have
// not chosen yet. The copy is the SEO Lead's (growth/SEO_WINTER_COPY.md, 13 Nov
// 2026, read by the Head of Marketing as a stranger), Habib's word on it was
// "do what is best". Arabic only: there is no English twin, so no hreflang.
//
// Facts it leans on, and where they come from, so the next edit keeps them true:
// - Season dates are seasons-data.ts (Riyadh 21 Oct to 28 Feb, Khobar 13 Nov
//   to 5 Feb 2027). If those move, this page moves with them.
// - Saudi day temperatures are the flagship guides' best-window ranges, written
//   as "about". Abroad cards carry no temperatures: we have none verified.
// - "See a sample plan" only for the five example plans that are indexed
//   (example-plans.ts, INDEXED_EXAMPLES).
// The date line is refreshed on 1 Dec and 1 Jan (the SEO Lead reminds the PM).

const UPDATED = "آخر تحديث: 18 نوفمبر 2026";
const REQUEST = "/ar/design-your-journey?source=winter";

type Place = { id?: string; name: string; text: string; days: string; guide: string; example?: string };

const saudi: Place[] = [
  { name: "العلا", text: "من نوفمبر إلى مارس نهارها بين 20 و27 درجة وليلها بارد، خذ جاكيت للمساء. الحِجر وجبل الفيل أحلى في هذا الجو.", days: "3 إلى 5 أيام", guide: "/ar/destinations/saudi-arabia/alula", example: "alula" },
  { name: "الرياض", text: "موسم الرياض مفتوح من 21 أكتوبر إلى 28 فبراير، والجو نهارًا حوالي 22 إلى 29 درجة: الدرعية والبوليفارد ورلد مساءً.", days: "3 أيام", guide: "/ar/destinations/saudi-arabia/riyadh" },
  { name: "الدمام والخبر", text: "موسم الخبر من 13 نوفمبر إلى 5 فبراير 2027 على الواجهة البحرية، والجو نهارًا حوالي 18 إلى 27 درجة. مناسبة للعائلة والكورنيش وإثراء.", days: "3 أيام", guide: "/ar/destinations/saudi-arabia/dammam" },
  { name: "أبها", text: "جبال وضباب وليالي باردة في الشتاء، فتحتاج ملابس ثقيلة.", days: "3 إلى 4 أيام", guide: "/ar/destinations/saudi-arabia/abha" },
  { name: "جدة", text: "الشتاء أحلى وقت للكورنيش وأزقة البلد، والجو نهارًا حوالي 28 إلى 30 درجة، دافي ولطيف.", days: "3 أيام", guide: "/ar/destinations/saudi-arabia/jeddah" },
];

const abroad: Place[] = [
  { id: "snow", name: "اسطنبول", text: "برد ومطر وأحيانًا ثلج، ومعالمها الكبيرة مثل آيا صوفيا وتوبكابي أهدأ بكثير من الصيف.", days: "5 إلى 6 أيام", guide: "/ar/destinations/turkey/istanbul", example: "istanbul" },
  { name: "طرابزون وأوزنجول", text: "خضرة وغيم، وأوزنجول ممكن تكسوها الثلوج حسب الأسبوع، والطرق تتأثر بالطقس فخلّ يوم احتياط.", days: "4 إلى 5 أيام", guide: "/ar/destinations/turkey/trabzon" },
  { name: "تبليسي", text: "مدينة قديمة وجوها بارد، ويوم في الثلج في غودوري ضمن برنامج المثال (هذا اللي في خطتنا لعائلة من أربعة).", days: "5 إلى 6 أيام", guide: "/ar/destinations/georgia/tbilisi", example: "tbilisi" },
  { id: "warm", name: "بانكوك", text: "من نوفمبر الجو أخف وأقل مطرًا، فهي من أنسب أوقات السنة للمشي في الأسواق والمعابد.", days: "5 أيام", guide: "/ar/destinations/thailand/bangkok", example: "bangkok" },
  { name: "كوالالمبور", text: "دفا طوال السنة مع زخات بعد الظهر، فخذ مظلة. أسواقها وأبراجها ومطاعمها الحلال ميزة للعائلة.", days: "5 أيام", guide: "/ar/destinations/malaysia/kuala-lumpur", example: "kuala-lumpur" },
];

const faq: { q: string; a: string }[] = [
  { q: "وين أروح في ديسمبر؟", a: "داخل السعودية: العلا والرياض والخبر. إذا تبغى برا: اسطنبول وتبليسي للبرد والثلج، وبانكوك وكوالالمبور للدفا." },
  { q: "وين أروح إذا أبغى ثلج؟", a: "اسطنبول أحيانًا، وطرابزون وأوزنجول وتبليسي، وغودوري للتزلج والثلج. الثلج يعتمد على الأسبوع، فنكتب لك خطة بديلة." },
  { q: "وين أروح إذا أبغى دفا؟", a: "بانكوك وكوالالمبور، وداخل السعودية جدة والعلا نهارًا." },
  { q: "كم يوم تكفي؟", a: "من 3 أيام للمدينة السعودية الواحدة، ومن 5 إلى 6 أيام للمدينة برّا. ونكتبها لك حسب أيامك." },
  { q: "كيف أحصل على برنامج لوجهتي؟", a: "عبّي الطلب، وفريقنا يكتب لك خطة يوم بيوم تراعي الصلاة والحلال والعائلة. الخطة مجانية حاليًا." },
];

export const metadata: Metadata = {
  alternates: { canonical: "/ar/winter" },
  title: { absolute: "وين أروح في إجازة الشتاء؟ 10 وجهات من السعودية" },
  description: "وين أروح في نوفمبر وديسمبر؟ عشر وجهات للشتاء، من العلا والرياض وأبها إلى اسطنبول وتبليسي وبانكوك: كم يوم تكفي، كيف جوها، وبرنامج يوم بيوم نكتبه لك.",
};

function PlaceCard({ place }: { place: Place }) {
  return (
    <article id={place.id} className="winterCard">
      <h3>{place.name}</h3>
      <p>{place.text}</p>
      <p className="winterDays"><span>كم يوم تكفي:</span> {place.days}</p>
      <div className="winterLinks">
        <Link className="textLink" href={place.guide}>دليل المدينة <ArrowRight className="directionArrow" size={14} /></Link>
        {place.example && <Link className="textLink" href={exampleHref("ar", place.example, "winter")}>شوف برنامج مثال <ArrowRight className="directionArrow" size={14} /></Link>}
      </div>
    </article>
  );
}

export default function WinterPageAr() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  return (
    <main className="innerPage winterPage">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <section className="pageHero container">
        <p className="kicker">{UPDATED}</p>
        <h1>وين أروح في إجازة الشتاء؟ <em>عشر وجهات من السعودية</em></h1>
        <p className="winterIntro">الشتاء أحلى وقت للسفر من السعودية: جو معتدل في الداخل، وثلج ودفا برّا. هذي عشر وجهات اخترناها، لكل وجهة كم يوم تكفي وكيف جوها، ورابط لدليلها وبرنامج مثال لو فيه.</p>
        <nav className="winterJump" aria-label="اختصارات">
          <a href="#snow">أبغى ثلج</a>
          <a href="#warm">أبغى دفا</a>
          <a href="#saudi">داخل السعودية</a>
        </nav>
        <div className="winterAsk">
          <p>برنامجك يوم بيوم نكتبه لك على تواريخك وميزانيتك. الخطة مجانية حاليًا.</p>
          <Link className="button gold" href={REQUEST}>اطلب خطتك <ArrowRight className="directionArrow" size={16} /></Link>
        </div>
      </section>

      <section className="container flagshipSection">
        <div className="flagshipSectionHeading">
          <h2 id="saudi">وين أروح داخل السعودية في الشتاء؟</h2>
        </div>
        <div className="winterGrid">{saudi.map((place) => <PlaceCard key={place.name} place={place} />)}</div>
      </section>

      <section className="container flagshipSection">
        <div className="flagshipSectionHeading">
          <h2>وين أروح برّا السعودية في الشتاء؟</h2>
          <p className="winterNote">في كل خطة نحط لك الحلال والمصليات، وننبّهك وين يكثر الخمر ولحم الخنزير.</p>
        </div>
        <div className="winterGrid">{abroad.map((place) => <PlaceCard key={place.name} place={place} />)}</div>
      </section>

      <section className="container flagshipSection">
        <div className="flagshipSectionHeading">
          <h2>أسئلة عن السفر في الشتاء من السعودية</h2>
        </div>
        <div className="winterFaq">
          {faq.map(({ q, a }) => <div key={q}><h3>{q}</h3><p>{a}</p></div>)}
        </div>
      </section>

      <section className="container cityPlanCta">
        <div>
          <h2>ما لقيت وجهتك؟</h2>
          <p>قل لنا وين تفكر وكم يوم وميزانيتك، ونكتب لك البرنامج.</p>
        </div>
        <Link className="button gold cityPlanButton" href={REQUEST}>اطلب خطتك <ArrowRight className="directionArrow" size={18} /></Link>
      </section>
    </main>
  );
}
