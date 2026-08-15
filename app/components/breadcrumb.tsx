import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({ items, locale = "en" }: { items: BreadcrumbItem[]; locale?: "en" | "ar" }) {
  const ar = locale === "ar";
  return (
    <nav className="breadcrumb container" aria-label={ar ? "مسار التنقل" : "Breadcrumb"} dir={ar ? "rtl" : "ltr"}>
      {items.map((item, index) => (
        <span className="breadcrumbItem" key={item.label}>
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          {index < items.length - 1 && <ChevronRight className={ar ? "directionArrow" : undefined} size={14} aria-hidden="true" />}
        </span>
      ))}
    </nav>
  );
}
