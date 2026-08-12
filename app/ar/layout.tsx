import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "ميموريز للسفر — رحلات تُصنع لك", template: "%s | ميموريز للسفر" },
  description: "رحلات أحلام وتجارب لاكتشاف السعودية وتخطيط للدراسة في الخارج للمسافرين حول العالم.",
  alternates: { canonical: "/ar", languages: { en: "/", ar: "/ar" } },
};

export default function ArabicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="arabicSite" lang="ar" dir="rtl">{children}</div>;
}
