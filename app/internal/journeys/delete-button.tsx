"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export function DeleteButton({ action, confirmText, ariaLabel, title }: { action: () => Promise<void>; confirmText: string; ariaLabel: string; title: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(confirmText)) return;
    startTransition(() => {
      action();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={ariaLabel}
      title={title}
      style={{
        display: "grid",
        placeItems: "center",
        width: 36,
        height: 36,
        border: "1px solid var(--line)",
        borderRadius: 9,
        background: "var(--paper)",
        color: pending ? "var(--muted)" : "#9a4a42",
        cursor: pending ? "default" : "pointer",
        opacity: pending ? 0.6 : 1,
        transition: ".18s background, .18s border-color",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (pending) return;
        e.currentTarget.style.background = "rgba(179,38,30,.08)";
        e.currentTarget.style.borderColor = "rgba(179,38,30,.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--paper)";
        e.currentTarget.style.borderColor = "var(--line)";
      }}
    >
      <Trash2 size={15} />
    </button>
  );
}
