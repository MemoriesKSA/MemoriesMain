"use client";

import { useEffect, useRef, useState } from "react";

export type JumpNavItem = { id: string; labelEn: string; labelAr: string };

export function SectionJumpNav({ items, locale = "en" }: { items: JumpNavItem[]; locale?: "en" | "ar" }) {
  const ar = locale === "ar";
  const [active, setActive] = useState(items[0]?.id);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: "-20% 0px -65% 0px", threshold: [0, 1] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    const activeButton = navRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    activeButton?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  return (
    <div className="jumpNav" dir={ar ? "rtl" : "ltr"}>
      <div className="jumpNavInner container" ref={navRef}>
        {items.map((item) => (
          <a
            key={item.id}
            data-id={item.id}
            href={`#${item.id}`}
            className={item.id === active ? "active" : undefined}
            onClick={() => setActive(item.id)}
          >
            {ar ? item.labelAr : item.labelEn}
          </a>
        ))}
      </div>
    </div>
  );
}
