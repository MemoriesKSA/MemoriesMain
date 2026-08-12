"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname(); const ar = pathname === "/ar" || pathname.startsWith("/ar/"); const p = ar ? "/ar" : "";
  return <footer dir={ar ? "rtl" : "ltr"}><div className="container footerGrid"><div><div className="footerLogo"><Image src="/images/memories-logo-full.webp" width={703} height={720} alt={ar ? "شعار ميموريز للسفر" : "MEMORIES travel logo"} /></div><p>{ar ? "رحلات مصممة خصيصًا للمسافرين السعوديين، داخل المملكة وحول العالم." : "Tailor-made journeys for Saudis, at home and around the world."}</p></div><div><strong>{ar ? "استكشف" : "Explore"}</strong><Link href={`${p}/destinations`}>{ar ? "الوجهات" : "Destinations"}</Link><Link href={`${p}/design-your-journey`}>{ar ? "صمّم رحلتك" : "Design your journey"}</Link><Link href={`${p}/saudi-abroad`}>{ar ? "سعوديون في الخارج" : "Saudi Abroad"}</Link></div><div><strong>{ar ? "الشركة" : "Company"}</strong><Link href={`${p}/about`}>{ar ? "من نحن" : "About us"}</Link><Link href={`${p}/corporate`}>{ar ? "سفر الشركات" : "Corporate travel"}</Link><a href="mailto:hello@memories.travel">{ar ? "تواصل معنا" : "Contact"}</a></div><div><strong>{ar ? "الدعم" : "Support"}</strong><p>{ar ? <>الأحد–الخميس<br />٩:٠٠–١٨:٠٠ بتوقيت السعودية</> : <>Sunday–Thursday<br />9:00–18:00 KSA</>}</p><a href="mailto:hello@memories.travel">hello@memories.travel</a></div></div><div className="container footerBottom"><span>© 2026 MEMORIES Travel</span><span>{ar ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"}</span></div></footer>;
}
