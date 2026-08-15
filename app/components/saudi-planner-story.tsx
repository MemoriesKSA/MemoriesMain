import { Compass, Heart, Landmark, UtensilsCrossed } from "lucide-react";

const stories = {
  en: [
    {
      icon: Landmark,
      eyebrow: "A country of living stories",
      title: "Stand where history still feels close.",
      copy: "Walk through Diriyah, AlUla and Al-Balad with time to notice the details, not simply tick landmarks off a list.",
    },
    {
      icon: Compass,
      eyebrow: "One journey, many worlds",
      title: "Trade city energy for open horizons.",
      copy: "Pair Riyadh’s creative pulse with mountain air in Aseer, desert silence, or a few unhurried days beside the Red Sea.",
    },
    {
      icon: UtensilsCrossed,
      eyebrow: "Taste the welcome",
      title: "Discover Saudi Arabia around the table.",
      copy: "We can shape your route around local kitchens, modern restaurants, coffee rituals and the generous hospitality that makes a place memorable.",
    },
    {
      icon: Heart,
      eyebrow: "Designed around you",
      title: "Your reason for travelling becomes the heart of the plan.",
      copy: "Culture, family, business, Umrah, Hajj or pure curiosity, we bring the right cities, stays, transport and experiences into one clear journey.",
    },
  ],
  ar: [
    {
      icon: Landmark,
      eyebrow: "بلد تنبض حكاياته بالحياة",
      title: "قف حيث يبدو التاريخ قريبًا.",
      copy: "تجوّل في الدرعية والعلا والبلد بوقت يكفي لتعيش التفاصيل، لا لمجرد المرور على المعالم.",
    },
    {
      icon: Compass,
      eyebrow: "رحلة واحدة، وعوالم متعددة",
      title: "انتقل من حيوية المدن إلى رحابة الطبيعة.",
      copy: "اجمع بين طاقة الرياض وهواء عسير، أو هدوء الصحراء، أو أيام مريحة على شاطئ البحر الأحمر.",
    },
    {
      icon: UtensilsCrossed,
      eyebrow: "تذوّق كرم الضيافة",
      title: "اكتشف السعودية حول المائدة.",
      copy: "نصمم مسارك حول المطابخ المحلية والمطاعم الحديثة وطقوس القهوة والضيافة التي تجعل المكان حاضرًا في الذاكرة.",
    },
    {
      icon: Heart,
      eyebrow: "مصممة حولك",
      title: "سبب سفرك هو قلب الخطة.",
      copy: "للثقافة أو العائلة أو الأعمال أو العمرة أو الحج أو حب الاستكشاف، نجمع المدن والإقامة والنقل والتجارب في رحلة واحدة واضحة.",
    },
  ],
} as const;

export function SaudiPlannerStory({ locale = "en" }: { locale?: "en" | "ar" }) {
  const ar = locale === "ar";
  return (
    <div className="saudiStory" dir={ar ? "rtl" : "ltr"}>
      <div className="saudiStoryLead">
        <p className="kicker light">{ar ? "أهلًا بك في السعودية" : "Welcome to Saudi Arabia"}</p>
        <h1>{ar ? <>حكايات عريقة.<br /><em>ورحلة جديدة.</em></> : <>Ancient stories.<br /><em>A new journey.</em></>}</h1>
        <p>{ar ? "من الرياض وجدة إلى العلا والبحر الأحمر ومكة والمدينة، أخبرنا ما الذي يجذبك إلى المملكة وسنصمم التفاصيل حولك." : "From Riyadh and Jeddah to AlUla, the Red Sea, Makkah and Madinah, tell us what brings you to the Kingdom and we’ll shape every detail around you."}</p>
        <ol>
          <li><span>{ar ? "١" : "1"}</span>{ar ? "اختر المدن التي ترغب في اكتشافها" : "Choose the cities you want to experience"}</li>
          <li><span>{ar ? "٢" : "2"}</span>{ar ? "حدد تواريخك وميزانية الرحلة الكاملة" : "Set your dates and complete journey budget"}</li>
          <li><span>{ar ? "٣" : "3"}</span>{ar ? "استلم برنامجًا سعوديًا مصممًا لك" : "Receive a Saudi itinerary made around you"}</li>
        </ol>
      </div>
      <div className="saudiStoryChapters" aria-label={ar ? "إلهام لرحلتك في السعودية" : "Inspiration for your Saudi journey"}>
        {stories[locale].map(({ icon: Icon, eyebrow, title, copy }, index) => (
          <article className="saudiStoryChapter" key={title}>
            <span className="saudiStoryNumber">0{index + 1}</span>
            <Icon aria-hidden="true" />
            <p>{eyebrow}</p>
            <h2>{title}</h2>
            <div>{copy}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
