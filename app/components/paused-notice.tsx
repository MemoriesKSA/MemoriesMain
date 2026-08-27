import Link from "next/link";
import { Briefcase, Compass, GraduationCap } from "lucide-react";

// Stands where a closed section's form or call to action used to stand.
//
// Shared by study abroad and corporate so the two cannot drift into different
// ways of saying the same thing. Whatever else is on the page stays: these
// sections are closed, not withdrawn, and someone who came to read what we
// would do still reads it and simply cannot ask for it yet.
//
// Each says what is true rather than "coming soon", because a date we do not
// have is worse than an honest wait, and each offers the two things a visitor
// standing there can actually do: plan a trip, or tell us they want this.

type Copy = { en: string; ar: string };

const COPY: Record<"study" | "corporate", { icon: typeof Compass; kicker: Copy; title: Copy; body: [Copy, Copy] }> = {
  study: {
    icon: GraduationCap,
    kicker: { en: "Temporarily closed", ar: "القسم مغلق مؤقتًا" },
    title: { en: "We're still|working on it.", ar: "نعمل عليه|الآن." },
    body: [
      {
        en: "Studying abroad is not a holiday. Getting a restaurant wrong is an annoyance; getting a visa deadline or an entry requirement wrong can cost a student a year. So the section is closed until we are certain of every line we send, and we would rather open late than send a family something we are not sure of.",
        ar: "الدراسة في الخارج ليست إجازة. الخطأ في مطعم مزعج، أما الخطأ في موعد تأشيرة أو شرط قبول فقد يكلّف الطالب سنة كاملة. لذلك أغلقنا القسم مؤقتًا حتى نطمئن إلى كل سطر نرسله، ونفضّل أن نتأخر على أن نرسل ما لسنا واثقين منه.",
      },
      {
        en: "Nothing has been thrown away. Everything described beside this is the service as it will be, the cities and universities are researched and ready, and it opens the day every plan meets the standard we want for it.",
        ar: "لم يُلغَ شيء. كل ما تقرأه هنا هو الخدمة كما ستكون، والمدن والجامعات والأبحاث جاهزة، وسنفتح القسم حين تصبح كل خطة على المستوى الذي نريده.",
      },
    ],
  },
  corporate: {
    icon: Briefcase,
    kicker: { en: "Not open yet", ar: "لم يُفتح بعد" },
    title: { en: "We're still|working on it.", ar: "نعمل عليه|الآن." },
    body: [
      {
        en: "A company trip is not one traveller multiplied. Approvals, delegations, changing headcounts and cost reporting are their own discipline, and doing them badly wastes other people's time rather than our own. We would rather open this properly than take an enquiry we cannot yet serve at the standard the rest of the site is held to.",
        ar: "رحلة الشركة ليست مسافرًا واحدًا مضروبًا في عدد. الاعتمادات والوفود وتغيّر أعداد المسافرين وتقارير التكاليف تخصص قائم بذاته، وأداؤه بشكل ضعيف يهدر وقت الآخرين لا وقتنا. نفضّل أن نفتحه كما ينبغي على أن نستقبل طلبًا لا نستطيع خدمته بالمستوى الذي نلتزم به في بقية الموقع.",
      },
      {
        en: "Everything described beside this is the service as it will be. If you are planning a delegation or an executive visit and want to be told the day it opens, say so and we will come back to you.",
        ar: "كل ما هو موصوف هنا هو الخدمة كما ستكون. إن كنت تخطط لوفد أو زيارة تنفيذية وتود أن نخبرك يوم فتح القسم، أخبرنا وسنعود إليك.",
      },
    ],
  },
};

export function PausedNotice({ section, locale = "en" }: { section: "study" | "corporate"; locale?: "en" | "ar" }) {
  const ar = locale === "ar";
  const copy = COPY[section];
  const Icon = copy.icon;
  const [firstLine, secondLine] = (ar ? copy.title.ar : copy.title.en).split("|");
  const p = ar ? "/ar" : "";

  return (
    <div className="pausedPanel" dir={ar ? "rtl" : "ltr"}>
      <Icon aria-hidden="true" />
      <p className="kicker light">{ar ? copy.kicker.ar : copy.kicker.en}</p>
      <h2>
        {firstLine}
        <br />
        <em>{secondLine}</em>
      </h2>
      {copy.body.map((paragraph, i) => (
        <p key={i}>{ar ? paragraph.ar : paragraph.en}</p>
      ))}
      <div className="pausedActions">
        <Link className="button gold" href={`${p}/design-your-journey`}>
          <Compass aria-hidden="true" />
          {ar ? "خطط لرحلة بدلًا من ذلك" : "Plan a trip instead"}
        </Link>
        <Link className="textLink" href={`${p}/feedback`}>
          {ar ? "أخبرنا أنك تنتظر هذا" : "Tell us you're waiting for this"}
        </Link>
      </div>
    </div>
  );
}
