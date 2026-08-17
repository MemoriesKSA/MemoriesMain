"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { setReviewerLocale } from "./locale-actions";
import type { ReviewerLocale } from "./i18n";

export function LocaleToggle({ locale, label }: { locale: ReviewerLocale; label: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next: ReviewerLocale = locale === "ar" ? "en" : "ar";
    startTransition(async () => {
      await setReviewerLocale(next);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 13px",
        borderRadius: 999,
        border: "1px solid var(--line)",
        background: "var(--paper)",
        color: "var(--ink)",
        fontSize: 12.5,
        fontWeight: 700,
        cursor: pending ? "default" : "pointer",
        opacity: pending ? 0.6 : 1,
        flexShrink: 0,
      }}
    >
      <Languages size={13} />
      {label}
    </button>
  );
}
