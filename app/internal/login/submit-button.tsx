"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 10,
        border: "none",
        background: "var(--ink)",
        color: "var(--paper)",
        fontSize: 15,
        fontWeight: 600,
        cursor: pending ? "default" : "pointer",
        opacity: pending ? 0.65 : 1,
      }}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
