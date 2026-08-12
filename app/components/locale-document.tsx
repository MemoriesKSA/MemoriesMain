"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function LocaleDocument() {
  const pathname = usePathname();
  useEffect(() => {
    const arabic = pathname === "/ar" || pathname.startsWith("/ar/");
    document.documentElement.lang = arabic ? "ar" : "en";
    document.documentElement.dir = arabic ? "rtl" : "ltr";
  }, [pathname]);
  return null;
}
