"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

export function HelpfulFeedback({ locale = "en" }: { locale?: "en" | "ar" }) {
  const ar = locale === "ar";
  const [answered, setAnswered] = useState(false);

  if (answered) {
    return (
      <section className="container helpfulFeedback">
        <p>{ar ? "شكرًا لك، هذا يساعدنا في تحسين الدليل." : "Thank you, this helps us improve the guide."}</p>
      </section>
    );
  }

  return (
    <section className="container helpfulFeedback">
      <p>{ar ? "إن شالله أنك استفدت من هذه المعلومات؟" : "Was this information helpful?"}</p>
      <div className="helpfulButtons">
        <button type="button" onClick={() => setAnswered(true)} aria-label={ar ? "نعم، مفيدة" : "Yes, helpful"}>
          <ThumbsUp size={16} /> {ar ? "نعم" : "Yes"}
        </button>
        <button type="button" onClick={() => setAnswered(true)} aria-label={ar ? "لا، غير مفيدة" : "No, not helpful"}>
          <ThumbsDown size={16} /> {ar ? "لا" : "No"}
        </button>
      </div>
    </section>
  );
}
