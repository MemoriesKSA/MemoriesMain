"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NewsletterForm } from "./newsletter-form";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/internal")) return null;
  const ar = pathname === "/ar" || pathname.startsWith("/ar/"); const p = ar ? "/ar" : "";
  const isHome = pathname === "/" || pathname === "/ar";
  const isPlanner = pathname === "/design-your-journey" || pathname === "/ar/design-your-journey";
  const showNewsletter = !isHome && !isPlanner;
  return <>
    {showNewsletter && <section className="section container siteNewsletter"><NewsletterForm locale={ar ? "ar" : "en"} /></section>}
    <footer dir={ar ? "rtl" : "ltr"}><div className="container footerGrid"><div><div className="footerLogo"><Image src="/images/memories-logo-full.webp" width={703} height={720} alt={ar ? "شعار ميموريز للسفر" : "MEMORIES travel logo"} /></div><p>{ar ? "رحلات استثنائية للعائلات والأزواج والمستكشفين والدارسين، داخل المملكة وحول العالم." : "Exceptional journeys for families, couples, explorers and students, within Saudi Arabia and around the world."}</p></div><div><strong>{ar ? "خطط معنا" : "Plan with us"}</strong><Link href={`${p}/design-your-journey`}>{ar ? "صمّم رحلة أحلامك" : "Design your dream journey"}</Link><Link href={`${p}/discover-saudi-arabia`}>{ar ? "اكتشف السعودية" : "Discover Saudi Arabia"}</Link><Link href={`${p}/study-abroad`}>{ar ? "الدراسة في الخارج" : "Study Abroad"}</Link><Link href={`${p}/destinations`}>{ar ? "الوجهات" : "Destinations"}</Link><Link href={`${p}/know-before-you-go`}>{ar ? "قبل أن تسافر" : "Know before you go"}</Link></div><div><strong>{ar ? "الشركة" : "Company"}</strong><Link href={`${p}/about`}>{ar ? "من نحن" : "About us"}</Link><Link href={`${p}/corporate`}>{ar ? "سفر الشركات" : "Corporate travel"}</Link><a href="mailto:memoriesksasupport@gmail.com">{ar ? "تواصل معنا" : "Contact"}</a></div><div><strong>{ar ? "القانونية والدعم" : "Legal & support"}</strong><Link href={`${p}/privacy`}>{ar ? "سياسة الخصوصية" : "Privacy Policy"}</Link><Link href={`${p}/terms`}>{ar ? "شروط الاستخدام" : "Terms of Use"}</Link><Link href={`${p}/booking-terms`}>{ar ? "الحجز والإلغاء" : "Booking & cancellation"}</Link><Link href={`${p}/cookies`}>{ar ? "ملفات الارتباط" : "Cookie Notice"}</Link><a href="mailto:memoriesksasupport@gmail.com">memoriesksasupport@gmail.com</a></div></div><div className="container footerBottom"><span>© 2026 MEMORIES Travel</span><span>{ar ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"}</span></div></footer>
  </>;
}
