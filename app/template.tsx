"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useLayoutEffect } from "react";

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }, [pathname]);
  return <div className="routeStage" key={pathname}>{children}</div>;
}
