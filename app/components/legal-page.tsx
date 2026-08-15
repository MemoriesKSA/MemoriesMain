import Link from "next/link";

export type LegalSection = { id: string; title: string; paragraphs?: string[]; bullets?: string[] };

export function LegalPage({ ar = false, eyebrow, title, intro, updated, sections }: { ar?: boolean; eyebrow: string; title: string; intro: string; updated: string; sections: LegalSection[] }) {
  const p = ar ? "/ar" : "";
  return <main className="innerPage legalPage" dir={ar ? "rtl" : "ltr"}>
    <section className="legalHero"><div className="container"><p className="kicker">{eyebrow}</p><h1>{title}</h1><p>{intro}</p><span>{ar ? "آخر تحديث:" : "Last updated:"} {updated}</span></div></section>
    <div className="container legalLayout">
      <aside aria-label={ar ? "محتويات الصفحة" : "Page contents"}><strong>{ar ? "في هذه الصفحة" : "On this page"}</strong>{sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}<div><Link href={`${p}/privacy`}>{ar ? "الخصوصية" : "Privacy"}</Link><Link href={`${p}/terms`}>{ar ? "الشروط" : "Terms"}</Link><Link href={`${p}/booking-terms`}>{ar ? "الحجز والإلغاء" : "Booking & cancellation"}</Link><Link href={`${p}/cookies`}>{ar ? "ملفات الارتباط" : "Cookies"}</Link></div></aside>
      <article className="legalContent">{sections.map((section, index) => <section id={section.id} key={section.id}><span>{String(index + 1).padStart(2, "0")}</span><h2>{section.title}</h2>{section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets?.length ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}</section>)}<div className="legalContact"><h2>{ar ? "تحتاج إلى مساعدة؟" : "Need help?"}</h2><p>{ar ? "للاستفسارات القانونية أو طلبات الخصوصية، راسلنا وسنرد عليك في أقرب وقت ممكن." : "For legal questions or privacy requests, email us and we will respond as soon as reasonably possible."}</p><a className="button gold" href="mailto:memoriesksasupport@gmail.com">memoriesksasupport@gmail.com</a></div></article>
    </div>
  </main>;
}
