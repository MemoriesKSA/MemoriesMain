"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type FaqItem = { questionEn: string; questionAr: string; answerEn: string; answerAr: string; href?: string };

export function FaqAccordion({ items, locale = "en" }: { items: FaqItem[]; locale?: "en" | "ar" }) {
  const ar = locale === "ar";
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faqAccordion" dir={ar ? "rtl" : "ltr"}>
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div className={`faqItem${open ? " open" : ""}`} key={item.questionEn}>
            <button type="button" className="faqQuestion" aria-expanded={open} onClick={() => setOpenIndex(open ? null : index)}>
              <span>{ar ? item.questionAr : item.questionEn}</span>
              <ChevronDown size={18} className="faqChevron" />
            </button>
            {open && (
              <div className="faqAnswer">
                <p>
                  {ar ? item.answerAr : item.answerEn}
                  {item.href && (
                    <>
                      {" "}
                      <Link href={item.href} className="faqAnswerLink">{ar ? "ابدأ خطتك" : "Start your plan"}</Link>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
