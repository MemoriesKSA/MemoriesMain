import Link from "next/link";
import { ArrowRight, CreditCard, HelpCircle, PhoneCall, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import { Breadcrumb } from "./breadcrumb";
import { SectionJumpNav, type JumpNavItem } from "./section-jump-nav";
import { FaqAccordion, type FaqItem } from "./faq-accordion";
import { HelpfulFeedback } from "./helpful-feedback";

type Locale = "en" | "ar";

const emergencyNumbers = [
  { number: "999", labelEn: "Police (911 works in Riyadh, Makkah and the Eastern Province only)", labelAr: "الشرطة (911 يعمل فقط في الرياض ومكة والمنطقة الشرقية)" },
  { number: "997", labelEn: "Ambulance, Saudi Red Crescent", labelAr: "الإسعاف، الهلال الأحمر السعودي" },
  { number: "998", labelEn: "Civil Defense, fire", labelAr: "الدفاع المدني، الحريق" },
  { number: "993", labelEn: "Traffic police", labelAr: "شرطة المرور" },
];

const knowCards = [
  {
    titleEn: "Dress code",
    titleAr: "الزي المناسب",
    bodyEn: "Modest, smart-casual clothing works for both men and women. There's no mandatory dress code for visitors, but covering shoulders and knees is a good default outside hotels and resorts, and a scarf is handy if you plan to visit a mosque.",
    bodyAr: "الملابس المحتشمة والأنيقة العملية مناسبة للرجال والنساء. لا يوجد زي إلزامي للزوار، لكن تغطية الكتفين والركبتين خيار جيد خارج الفنادق والمنتجعات، ويُفضل حمل وشاح إن كنت تنوي زيارة مسجد.",
  },
  {
    titleEn: "Workweek & hours",
    titleAr: "أيام وساعات العمل",
    bodyEn: "The week runs Sunday through Thursday, with most businesses open from around 9am to 10pm. Shops pause briefly around each of the five daily prayers, usually 15 to 20 minutes, then reopen.",
    bodyAr: "أسبوع العمل من الأحد إلى الخميس، وتفتح معظم المحال من حوالي التاسعة صباحًا حتى العاشرة مساءً. تُغلق المحال لفترة قصيرة عند كل صلاة من الصلوات الخمس، غالبًا من 15 إلى 20 دقيقة، ثم تعاود فتحها.",
  },
  {
    titleEn: "Visiting during Ramadan",
    titleAr: "الزيارة في رمضان",
    bodyEn: "Eating, drinking or smoking in public during daylight hours isn't done out of respect for those fasting. Evenings come alive after Iftar, with restaurants, markets and family gatherings often running late into the night.",
    bodyAr: "يُمتنع عن الأكل أو الشرب أو التدخين في الأماكن العامة خلال ساعات النهار احترامًا للصائمين. تنبض الأمسيات بالحياة بعد الإفطار، وتبقى المطاعم والأسواق والتجمعات العائلية نشطة حتى وقت متأخر من الليل.",
  },
  {
    titleEn: "Alcohol",
    titleAr: "المشروبات الكحولية",
    bodyEn: "Saudi Arabia doesn't sell or serve alcohol anywhere in the Kingdom. It's a straightforward fact worth knowing before you land, not a barrier to a great trip.",
    bodyAr: "لا تُباع المشروبات الكحولية أو تُقدَّم في أي مكان داخل المملكة. هذه حقيقة بسيطة يُستحسن معرفتها قبل الوصول، ولا تقف عائقًا أمام رحلة رائعة.",
  },
];

const moneyCards = [
  {
    titleEn: "Currency",
    titleAr: "العملة",
    bodyEn: "The Saudi riyal (SAR, ﷼), with 100 halalas to the riyal. Notes and coins come in familiar denominations.",
    bodyAr: "الريال السعودي (SAR، ﷼)، وينقسم إلى 100 هللة. تأتي الأوراق والعملات المعدنية بفئات مألوفة.",
  },
  {
    titleEn: "Paying for things",
    titleAr: "طرق الدفع",
    bodyEn: "Cards (Visa, Mastercard, American Express), Apple Pay and Samsung Wallet are widely accepted in cities. It's still worth carrying some cash for smaller towns, local markets and taxis.",
    bodyAr: "البطاقات (فيزا وماستركارد وأمريكان إكسبريس) وآبل باي ومحفظة سامسونج مقبولة على نطاق واسع في المدن. يُستحسن حمل بعض النقد للبلدات الصغيرة والأسواق المحلية وسيارات الأجرة.",
  },
  {
    titleEn: "ATMs",
    titleAr: "أجهزة الصراف الآلي",
    bodyEn: "Widely available in cities, malls and airports. A quick check on the map before you head somewhere remote is always a good habit.",
    bodyAr: "متوفرة على نطاق واسع في المدن والمولات والمطارات. التحقق سريعًا من الخريطة قبل التوجه إلى مكان نائٍ عادة ما يكون خيارًا جيدًا.",
  },
];

const telecomProviders = [
  { nameEn: "stc", nameAr: "STC", detailEn: "The largest network, roughly 58% of subscribers", detailAr: "أكبر شبكة، بنحو 58% من المشتركين" },
  { nameEn: "Mobily", nameAr: "موبايلي", detailEn: "Roughly 28% of subscribers, strong 5G coverage", detailAr: "بنحو 28% من المشتركين، وتغطية 5G قوية" },
  { nameEn: "Zain KSA", nameAr: "زين السعودية", detailEn: "Roughly 20% of subscribers", detailAr: "بنحو 20% من المشتركين" },
];

export function KnowBeforeYouGoPage({ locale = "en" }: { locale?: Locale }) {
  const ar = locale === "ar";
  const prefix = ar ? "/ar" : "";
  const planHref = `${prefix}/design-your-journey?source=know-before-you-go`;

  const navItems: JumpNavItem[] = [
    { id: "safety", labelEn: "Is it safe", labelAr: "هل هي آمنة" },
    { id: "emergency", labelEn: "Emergency numbers", labelAr: "أرقام الطوارئ" },
    { id: "know", labelEn: "What to know", labelAr: "ما يجب معرفته" },
    { id: "money", labelEn: "Currency & payment", labelAr: "العملة والدفع" },
    { id: "connectivity", labelEn: "Phone & internet", labelAr: "الهاتف والإنترنت" },
    { id: "faq", labelEn: "More questions", labelAr: "أسئلة إضافية" },
  ];

  const faqItems: FaqItem[] = [
    {
      questionEn: "Is Saudi Arabia equipped for travellers with disabilities?",
      questionAr: "هل السعودية مهيأة للمسافرين ذوي الإعاقة؟",
      answerEn: "Major cities are increasingly accessible, with wheelchair-friendly sidewalks, ramps and facilities at hotels and popular attractions. It's still worth checking accessibility details for a specific hotel or site before you book.",
      answerAr: "أصبحت المدن الكبرى أكثر تهيئة تدريجيًا، بأرصفة ومنحدرات ومرافق ملائمة للكراسي المتحركة في الفنادق والمعالم الشهيرة. يُستحسن التحقق من تفاصيل إمكانية الوصول لفندق أو موقع معين قبل الحجز.",
    },
    {
      questionEn: "Do I need a visa?",
      questionAr: "هل أحتاج إلى تأشيرة؟",
      answerEn: "Most nationalities can apply for a Saudi e-Visa, and most applications are approved within 24 to 48 hours. Once you start a plan with us, we'll help you figure out exactly what applies to you.",
      answerAr: "يمكن لمعظم الجنسيات التقديم على التأشيرة الإلكترونية السعودية، وتتم الموافقة على معظم الطلبات خلال 24 إلى 48 ساعة. بمجرد أن تبدأ خطة معنا، سنساعدك في معرفة ما ينطبق عليك بالتحديد.",
    },
    {
      questionEn: "What's the best way to get around?",
      questionAr: "ما أفضل طريقة للتنقل؟",
      answerEn: "Ride-hailing apps like Uber and Careem cover major cities well. Between Makkah, Jeddah and Madinah, the Haramain High-Speed Train connects the route at up to 300 km/h, and domestic flights handle longer distances.",
      answerAr: "تغطي تطبيقات طلب المشاوير مثل أوبر وكريم المدن الكبرى بشكل جيد. بين مكة وجدة والمدينة، يربط قطار الحرمين السريع المسار بسرعة تصل إلى 300 كم/س، وتغطي الرحلات الجوية الداخلية المسافات الأطول.",
    },
    {
      questionEn: "Still have questions before you plan your trip?",
      questionAr: "لا تزال لديك أسئلة قبل تخطيط رحلتك؟",
      answerEn: "Tell us your dates, who's travelling and what you're hoping for, and we'll shape a plan around it.",
      answerAr: "أخبرنا بتواريخك ومن سيرافقك وما تتطلع إليه، وسنصمم خطة حول ذلك.",
      href: planHref,
    },
  ];

  return (
    <main className="innerPage knowPage">
      <Breadcrumb
        locale={locale}
        items={[
          { label: ar ? "الرئيسية" : "Home", href: `${prefix}/` },
          { label: ar ? "اكتشف السعودية" : "Discover Saudi Arabia", href: `${prefix}/discover-saudi-arabia` },
          { label: ar ? "قبل أن تسافر" : "Know before you go" },
        ]}
      />

      <section className="pageHero container">
        <p className="kicker">{ar ? "دليل عملي" : "Practical guide"}</p>
        <h1>{ar ? "قبل ما تجهز نفسك للسفر لا زم تعرف" : "Know before you go"}</h1>
        <p className="knowIntro">
          {ar
            ? "زيارة بلد جديد تأتي دائمًا ببعض التساؤلات، ما مدى الأمان فعليًا، وكيف تدفع، ومن تتصل به إذا احتجت مساعدة. جمعنا هنا الإجابات العملية الحقيقية، عشان ما نخليك قلقان وتتفرغ للتجهيز للرحلة."
            : "Visiting a new country always comes with a few unknowns, what's actually safe, how to pay, who to call if something goes wrong. We've gathered the real, practical answers here so you can spend less time worrying and more time looking forward to the trip."}
        </p>
      </section>

      <SectionJumpNav items={navItems} locale={locale} />

      <section className="container flagshipSection" id="safety">
        <div className="flagshipSectionHeading">
          <p className="kicker"><ShieldCheck size={14} /> {ar ? "الأمان" : "Safety"}</p>
          <h2>{ar ? "هل السعودية آمنة؟" : "Is Saudi Arabia safe?"}</h2>
        </div>
        <p className="knowLead">
          {ar
            ? "نعم. حلّت السعودية في المركز 19 من أصل 163 دولة في مؤشر السلام العالمي لعام 2025، والمركز 14 عالميًا في مؤشر نومبيو للأمان، وهو الأعلى بين دول مجموعة العشرين. الجرائم العنيفة ضد الزوار نادرة جدًا، واستثمرت المملكة كثيرًا في الأمن والبنية التحتية الموجهة للسياح. كما هو الحال في أي وجهة، استخدم الحس السليم: احرص على مقتنياتك، واحترم القوانين والعادات المحلية، خصوصًا خلال رمضان، وراجع تحذيرات السفر من جهتك الرسمية قبل الانطلاق."
            : "Yes. Saudi Arabia ranked 19th out of 163 countries on the 2025 Global Peace Index, and 14th in the world on the Numbeo Safety Index, the highest of any G20 country. Violent crime against visitors is rare, and the Kingdom has invested heavily in tourist-facing security and infrastructure. As with any destination, use common sense: keep track of your belongings, respect local laws and customs, especially during Ramadan, and check your government's travel advisory before you go."}
        </p>
      </section>

      <section className="container flagshipSection" id="emergency">
        <div className="flagshipSectionHeading">
          <p className="kicker"><PhoneCall size={14} /> {ar ? "أرقام الطوارئ" : "Emergency numbers"}</p>
          <h2>{ar ? "احفظ هذه الأرقام، احتياطًا." : "Save these, just in case."}</h2>
        </div>
        <div className="flagshipGrid emergencyGrid">
          {emergencyNumbers.map((entry) => (
            <div className="emergencyCard" key={entry.number}>
              <span className="emergencyNumber" dir="ltr">{entry.number}</span>
              <p>{ar ? entry.labelAr : entry.labelEn}</p>
              <a className="emergencyCall" href={`tel:${entry.number}`}>{ar ? "اتصال" : "Call"}</a>
            </div>
          ))}
        </div>
      </section>

      <section className="container flagshipSection" id="know">
        <div className="flagshipSectionHeading">
          <p className="kicker"><Sparkles size={14} /> {ar ? "ما يجب أن تعرفه" : "What should I know?"}</p>
          <h2>{ar ? "تفاصيل صغيرة تجعل رحلتك أسهل." : "A few small details that make your trip easier."}</h2>
        </div>
        <div className="aboutPrinciples knowGrid">
          {knowCards.map((card) => (
            <article key={card.titleEn}>
              <h3>{ar ? card.titleAr : card.titleEn}</h3>
              <p>{ar ? card.bodyAr : card.bodyEn}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container flagshipSection" id="money">
        <div className="flagshipSectionHeading">
          <p className="kicker"><CreditCard size={14} /> {ar ? "العملة والدفع" : "Currency & payment"}</p>
          <h2>{ar ? "كيف تدفع في السعودية." : "How to pay in Saudi Arabia."}</h2>
        </div>
        <div className="aboutPrinciples knowGrid">
          {moneyCards.map((card) => (
            <article key={card.titleEn}>
              <h3>{ar ? card.titleAr : card.titleEn}</h3>
              <p>{ar ? card.bodyAr : card.bodyEn}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container flagshipSection" id="connectivity">
        <div className="flagshipSectionHeading">
          <p className="kicker"><Wifi size={14} /> {ar ? "الهاتف والإنترنت" : "Phone & internet"}</p>
          <h2>{ar ? "من بين الدول الأسرع اتصالًا في العالم." : "Among the best-connected countries in the world."}</h2>
        </div>
        <p className="knowLead">
          {ar
            ? "احتلت السعودية مركزًا ضمن أفضل عشر دول عالميًا لسرعة الإنترنت عبر الجوال في مؤشر أوكلا العالمي لعام 2025، بمتوسط سرعة تنزيل 216 ميجابت في الثانية، وحتى 320 ميجابت في الثانية على شبكات 5G. شرائح الاتصال متوفرة في متاجر مشغلي الاتصالات، وتقدم معظم الفنادق والمطاعم والمقاهي واي فاي مجانيًا."
            : "Saudi Arabia placed among the global top 10 for mobile internet speed on the 2025 Ookla Speedtest Global Index, with a median download speed of 216 Mbps, and up to 320 Mbps on 5G. SIM cards are available from any telecom provider's stores, and most hotels, restaurants and cafés offer free Wi-Fi."}
        </p>
        <div className="telecomGrid">
          {telecomProviders.map((provider) => (
            <div className="telecomCard" key={provider.nameEn}>
              <span className="telecomWordmark">{ar ? provider.nameAr : provider.nameEn}</span>
              <p>{ar ? provider.detailAr : provider.detailEn}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container flagshipSection" id="faq">
        <div className="flagshipSectionHeading">
          <p className="kicker"><HelpCircle size={14} /> {ar ? "أسئلة إضافية" : "More questions"}</p>
          <h2>{ar ? "أسئلة أخرى يطرحها المسافرون." : "A few more things travellers ask."}</h2>
        </div>
        <FaqAccordion items={faqItems} locale={locale} />
      </section>

      <HelpfulFeedback locale={locale} />

      <section className="container cityPlanCta">
        <div>
          <p className="kicker light">{ar ? "جاهز لتبدأ؟" : "Ready to start?"}</p>
          <h2>{ar ? <>متحمس تروح<br /><em>السعودية؟</em></> : <>Let&rsquo;s shape your trip<br /><em>to Saudi Arabia.</em></>}</h2>
          <p>
            {ar
              ? "عطني تواريخ رحلتك ومين بروح معاك ووين ودك تروح، واترك الباقي علينا."
              : "Tell us your dates, who's travelling and what you're hoping for, and we'll take it from there."}
          </p>
        </div>
        <Link className="button gold cityPlanButton" href={planHref}>
          {ar ? "ابدأ خطة أحلامي" : "Start my dream plan"} <ArrowRight className={ar ? "directionArrow" : ""} size={18} />
        </Link>
      </section>
    </main>
  );
}
