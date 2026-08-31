"use client";

import { useTransition } from "react";
import { Send } from "lucide-react";

// Sends a finished plan to the customer now, skipping the release window and
// any flag on it.
//
// It confirms first, and the confirmation names the customer, because this is
// the one control on this page whose effect leaves the building. Everything
// else here can be undone by editing a row; an email cannot be recalled.
export function SendNowButton({
  action,
  confirmText,
  ariaLabel,
  title,
  label,
  flagged,
}: {
  action: () => Promise<void>;
  confirmText: string;
  ariaLabel: string;
  title: string;
  label: string;
  /** Drawn in the warning colour when the self-check flagged this plan. */
  flagged?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(confirmText)) return;
    startTransition(() => {
      action();
    });
  }

  const accent = flagged ? "#9a6410" : "#0f6b45";
  const wash = flagged ? "rgba(154,100,16,.09)" : "rgba(15,107,69,.09)";
  const edge = flagged ? "rgba(154,100,16,.4)" : "rgba(15,107,69,.35)";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={ariaLabel}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        height: 36,
        padding: "0 12px",
        border: `1px solid ${pending ? "var(--line)" : edge}`,
        borderRadius: 9,
        background: "var(--paper)",
        color: pending ? "var(--muted)" : accent,
        fontSize: 12.5,
        fontWeight: 700,
        cursor: pending ? "default" : "pointer",
        opacity: pending ? 0.6 : 1,
        transition: ".18s background, .18s border-color",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (pending) return;
        e.currentTarget.style.background = wash;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--paper)";
      }}
    >
      <Send size={14} />
      {label}
    </button>
  );
}
