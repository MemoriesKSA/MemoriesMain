import { BookOpen, Compass, GraduationCap, Heart, Home, Route, ShieldCheck, Sparkles } from "lucide-react";

type Story = { icon: typeof Sparkles; eyebrow: string; title: string; copy: string };

const dreamStories: Record<"en" | "ar", Story[]> = {
  en: [
    { icon: Heart, eyebrow: "Begin with a feeling", title: "A dream journey should feel unmistakably yours.", copy: "Tell us what excites you, what helps you unwind and what you want to remember. That feeling becomes the starting point for every recommendation." },
    { icon: Compass, eyebrow: "Find your kind of place", title: "The right destination is more than a pin on a map.", copy: "We match countries, cities and neighbourhoods to your interests—whether you want culture, coastlines, quiet, energy, discovery or time together." },
    { icon: Route, eyebrow: "Every detail, one rhythm", title: "Move through the journey without feeling rushed.", copy: "Flights, stays, drivers, restaurants and experiences come together at a pace that leaves room for both remarkable moments and genuine rest." },
    { icon: Sparkles, eyebrow: "Built around real life", title: "Your dates and budget shape something beautiful and possible.", copy: "We turn the choices into one clear proposal, designed for the people travelling and ready for a thoughtful human review." },
  ],
  ar: [
    { icon: Heart, eyebrow: "نبدأ بالشعور", title: "رحلة الأحلام يجب أن تشبهك أنت.", copy: "أخبرنا بما يحمسك وما يمنحك الراحة وما تريد أن يبقى في ذاكرتك. هذا الشعور هو نقطة البداية لكل اقتراح." },
    { icon: Compass, eyebrow: "اعثر على المكان المناسب لك", title: "الوجهة الصحيحة أكثر من مجرد نقطة على الخريطة.", copy: "نربط الدول والمدن والأحياء باهتماماتك، سواء كنت تبحث عن الثقافة أو البحر أو الهدوء أو الحيوية أو الاكتشاف أو وقت أجمل مع من تحب." },
    { icon: Route, eyebrow: "كل التفاصيل بإيقاع واحد", title: "عش الرحلة دون أن تشعر بالعجلة.", copy: "نجمع الطيران والإقامة والسائقين والمطاعم والتجارب بتكرار مريح يترك مساحة للحظات الاستثنائية والراحة الحقيقية." },
    { icon: Sparkles, eyebrow: "مصممة لحياتك الواقعية", title: "تواريخك وميزانيتك تصنعان رحلة جميلة وقابلة للتنفيذ.", copy: "نحوّل اختياراتك إلى مقترح واحد واضح، مصمم لمن يسافر معك وجاهز لمراجعة بشرية مدروسة." },
  ],
};

const studyStories: Record<"en" | "ar", Story[]> = {
  en: [
    { icon: GraduationCap, eyebrow: "Your ambition leads", title: "Choose a study journey that moves your future forward.", copy: "Start with the subject, qualification and experience you want. We help turn a broad ambition into a destination and route you can understand." },
    { icon: BookOpen, eyebrow: "A place to learn and live", title: "The right city matters as much as the course.", copy: "Compare academic opportunities with daily life, culture, transport, community and the kind of environment where you can feel at home." },
    { icon: ShieldCheck, eyebrow: "Clearer practical steps", title: "Approach applications and visas with greater clarity.", copy: "We can organize the documents, travel requirements and application journey while keeping every decision with the relevant university and authorities." },
    { icon: Home, eyebrow: "Arrive ready", title: "Begin the chapter with the essentials already considered.", copy: "Accommodation, flights, airport arrival and local transport can be planned together so your attention can stay on the opportunity ahead." },
  ],
  ar: [
    { icon: GraduationCap, eyebrow: "طموحك يقود الطريق", title: "اختر رحلة دراسية تدفع مستقبلك إلى الأمام.", copy: "ابدأ بالتخصص والمؤهل والتجربة التي تطمح إليها، وسنساعدك في تحويل الطموح إلى وجهة ومسار واضحين." },
    { icon: BookOpen, eyebrow: "مكان للتعلم والحياة", title: "المدينة المناسبة مهمة بقدر البرنامج الدراسي.", copy: "قارن الفرص الأكاديمية بالحياة اليومية والثقافة والنقل والمجتمع والبيئة التي تساعدك على الشعور بالاستقرار." },
    { icon: ShieldCheck, eyebrow: "خطوات عملية أوضح", title: "تعامل مع الطلبات والتأشيرة بوضوح أكبر.", copy: "نساعدك في تنظيم المستندات ومتطلبات السفر ومسار الطلب، مع بقاء القرار النهائي للجامعة والجهات المختصة." },
    { icon: Home, eyebrow: "ابدأ وأنت مستعد", title: "ادخل فصلك الجديد والأساسيات مدروسة مسبقًا.", copy: "يمكن تنسيق السكن والطيران والاستقبال في المطار والنقل المحلي معًا، لتبقى عيناك على الفرصة التي تنتظرك." },
  ],
};

export function PlannerPageStory({ variant, locale = "en" }: { variant: "dream" | "study"; locale?: "en" | "ar" }) {
  const ar = locale === "ar";
  const study = variant === "study";
  const chapters = study ? studyStories[locale] : dreamStories[locale];
  const steps = study
    ? (ar ? ["اختر الدولة والمدينة والمرحلة الدراسية", "حدد نوع المساعدة التي تحتاجها", "خطط للتأشيرة والسفر والسكن والوصول"] : ["Choose your country, city and study level", "Select the support you need", "Plan visas, travel, accommodation and arrival"])
    : (ar ? ["اختر مسار رحلتك", "شارك حلمك وميزانيتك الكاملة", "استلم مقترحك المصمم خصيصًا لك"] : ["Choose your journey path", "Share your dream and complete budget", "Receive your tailored proposal"]);

  return <div className={`plannerStory ${study ? "studyStory" : "dreamStory"}`} dir={ar ? "rtl" : "ltr"}>
    <div className="plannerStoryLead">
      <p className="kicker light">{study ? (ar ? "فصلك القادم" : "Your next chapter") : (ar ? "حلمك يبدأ من هنا" : "Your dream starts here")}</p>
      <h1>{study ? (ar ? <>الدراسة في الخارج،<br /><em>بمسار أوضح.</em></> : <>Study abroad,<br /><em>with a clearer path.</em></>) : (ar ? <>لنصمّم رحلة<br /><em>لا يحلم بها إلا أنت.</em></> : <>Let&apos;s design a journey<br /><em>only you could dream.</em></>)}</h1>
      <p>{study ? (ar ? "اكتشف المملكة المتحدة أو الولايات المتحدة أو كندا أو أستراليا أو اليابان. شاركنا هدفك الدراسي وسنساعدك في تنظيم الرحلة من حوله." : "Explore the UK, United States, Canada, Australia or Japan. Tell us your study goal and we’ll help organize the journey around it.") : (ar ? "اختر مسارك وشاركنا التفاصيل المهمة. سنستخدم وجهتك وتواريخك وميزانيتك الكاملة لإعداد رحلة مصممة حولك." : "Choose your path and share the details that matter. We’ll use your destination, dates and complete budget to prepare a journey shaped around you.")}</p>
      <ol>{steps.map((item, index) => <li key={item}><span>{ar ? ["١", "٢", "٣"][index] : index + 1}</span>{item}</li>)}</ol>
    </div>
    <div className="plannerStoryChapters" aria-label={ar ? "إلهام لخطوات رحلتك" : "Inspiration for your journey"}>
      {chapters.map(({ icon: Icon, eyebrow, title, copy }, index) => <article className="plannerStoryChapter" key={title}><span className="plannerStoryNumber">0{index + 1}</span><Icon aria-hidden="true" /><p>{eyebrow}</p><h2>{title}</h2><div>{copy}</div></article>)}
    </div>
  </div>;
}
