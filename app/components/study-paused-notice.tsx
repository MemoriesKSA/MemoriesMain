import Link from "next/link";
import { Compass, GraduationCap } from "lucide-react";

// Stands where the study form used to stand.
//
// The story beside it still describes the service in full, which is the point:
// the section is closed, not withdrawn. Someone who came here to read what we
// would do for a student still reads it, and simply cannot submit yet.
//
// It says what is true rather than "coming soon", because a date we do not
// have is worse than an honest wait, and it offers the two things a visitor
// standing here can actually do: plan a trip, or tell us they want this.

export function StudyPausedNotice({ locale = "en" }: { locale?: "en" | "ar" }) {
  const ar = locale === "ar";
  return (
    <div className="pausedPanel" dir={ar ? "rtl" : "ltr"}>
      <GraduationCap aria-hidden="true" />
      <p className="kicker light">{ar ? "القسم مغلق مؤقتًا" : "Temporarily closed"}</p>
      <h2>{ar ? <>نعمل عليه<br /><em>الآن.</em></> : <>We&apos;re still<br /><em>working on it.</em></>}</h2>
      <p>
        {ar
          ? "الدراسة في الخارج ليست إجازة. الخطأ في مطعم مزعج، أما الخطأ في موعد تأشيرة أو شرط قبول فقد يكلّف الطالب سنة كاملة. لذلك أغلقنا القسم مؤقتًا حتى نطمئن إلى كل سطر نرسله، ونفضّل أن نتأخر على أن نرسل ما لسنا واثقين منه."
          : "Studying abroad is not a holiday. Getting a restaurant wrong is an annoyance; getting a visa deadline or an entry requirement wrong can cost a student a year. So the section is closed until we are certain of every line we send, and we would rather open late than send a family something we are not sure of."}
      </p>
      <p>
        {ar
          ? "لم يُلغَ شيء. كل ما تقرأه هنا هو الخدمة كما ستكون، والمدن والجامعات والأبحاث جاهزة، وسنفتح القسم حين تصبح كل خطة على المستوى الذي نريده."
          : "Nothing has been thrown away. Everything described beside this is the service as it will be, the cities and universities are researched and ready, and it opens the day every plan meets the standard we want for it."}
      </p>
      <div className="pausedActions">
        <Link className="button gold" href={ar ? "/ar/design-your-journey" : "/design-your-journey"}>
          <Compass aria-hidden="true" />
          {ar ? "خطط لرحلة بدلًا من ذلك" : "Plan a trip instead"}
        </Link>
        <Link className="textLink" href={ar ? "/ar/feedback" : "/feedback"}>
          {ar ? "أخبرنا أنك تنتظر هذا" : "Tell us you're waiting for this"}
        </Link>
      </div>
    </div>
  );
}
