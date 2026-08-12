"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <div className="routeStage" key={pathname}>{children}</div>;
}
