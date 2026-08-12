"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const revealSelector = [
  ".promiseBar",
  ".sectionHeading",
  ".destinationCard",
  ".plannerTeaser",
  ".abroadCard",
  ".quickPlanner",
  ".newsletter",
  ".stats > div",
  ".listingCard",
  ".detailGrid > *",
  ".serviceGrid > article",
  ".storyGrid > article",
  ".saudiStoryChapter",
  ".plannerStoryChapter",
  ".launchNote",
  ".manifesto",
  ".corporateCta",
].join(",");

export function MotionEnhancer() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const elements = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).classList.add("isRevealed");
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    elements.forEach((element, index) => {
      element.classList.add("revealItem");
      element.style.setProperty("--reveal-delay", `${Math.min(index % 5, 4) * 55}ms`);
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
