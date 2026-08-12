import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "ميموريز للسفر — رحلات تُصنع لك", template: "%s | ميموريز للسفر" },
  description: "رحلات مصممة خصيصًا ودعم موثوق للمسافرين السعوديين، داخل المملكة وحول العالم.",
  alternates: { canonical: "/ar", languages: { en: "/", ar: "/ar" } },
};

export default function ArabicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="arabicSite" lang="ar" dir="rtl">{children}</div>;
}
