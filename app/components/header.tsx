"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { CSSProperties, FocusEvent, PointerEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

const labels = {
  en: [["Design your dream journey", "/design-your-journey"], ["Discover Saudi Arabia", "/discover-saudi-arabia"], ["Study Abroad", "/study-abroad"], ["About us", "/about"], ["Corporate", "/corporate"]],
  ar: [["صمّم رحلة أحلامك", "/design-your-journey"], ["اكتشف السعودية", "/discover-saudi-arabia"], ["الدراسة في الخارج", "/study-abroad"], ["من نحن", "/about"], ["الشركات", "/corporate"]],
} as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [pill, setPill] = useState({ x: 0, width: 0, visible: false });
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const isArabic = pathname === "/ar" || pathname.startsWith("/ar/");
  const prefix = isArabic ? "/ar" : "";
  const links = labels[isArabic ? "ar" : "en"].map(([label, path]) => [label, `${prefix}${path}`] as const);
  const languageHref = isArabic ? (pathname.replace(/^\/ar/, "") || "/") : `/ar${pathname === "/" ? "" : pathname}`;
  const activeHref = links.find(([, href]) => pathname === href || pathname.startsWith(`${href}/`))?.[1];

  function movePill(element: HTMLElement) {
    const nav = navRef.current;
    if (!nav) return;
    const navBox = nav.getBoundingClientRect();
    const linkBox = element.getBoundingClientRect();
    setPill({ x: linkBox.left - navBox.left, width: linkBox.width, visible: true });
  }

  function settlePill() {
    const active = navRef.current?.querySelector<HTMLElement>(`[data-href="${activeHref}"]`);
    if (active) movePill(active);
    else setPill((current) => ({ ...current, visible: false }));
  }

  useLayoutEffect(() => {
    settlePill();
    const handleResize = () => settlePill();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeHref]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const pillStyle = { "--pill-x": `${pill.x}px`, "--pill-width": `${pill.width}px` } as CSSProperties;
  return <header dir={isArabic ? "rtl" : "ltr"} className={`siteHeader ${pathname === "/" || pathname === "/ar" ? "overHero" : "solidHeader"} ${open ? "menuOpen" : ""}`}>
    <div className="container headerInner">
      <Link href={isArabic ? "/ar" : "/"} className="brand" aria-label={isArabic ? "العودة إلى الرئيسية" : "Memories home"}><Image className="brandLogo" src="/images/memories-logo-full.webp" width={703} height={720} alt={isArabic ? "شعار ميموريز للسفر" : "MEMORIES travel logo"} preload /></Link>
      <button className="menuButton" onClick={() => setOpen((value) => !value)} aria-controls="main-navigation" aria-expanded={open} aria-label={isArabic ? (open ? "إغلاق قائمة التنقل" : "فتح قائمة التنقل") : (open ? "Close navigation" : "Open navigation")}>{open ? <X /> : <Menu />}</button>
      <button type="button" className={open ? "menuBackdrop visible" : "menuBackdrop"} onClick={() => setOpen(false)} aria-label={isArabic ? "إغلاق القائمة" : "Close menu"} tabIndex={open ? 0 : -1} />
      <nav id="main-navigation" ref={navRef} className={open ? "nav open" : "nav"} aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"} onPointerLeave={settlePill} onBlur={(event: FocusEvent<HTMLElement>) => { if (!event.currentTarget.contains(event.relatedTarget)) settlePill(); }} style={pillStyle}>
        <span className={pill.visible ? "navPill visible" : "navPill"} aria-hidden="true" />
        <span className="mobileNavTitle">{isArabic ? "القائمة" : "Menu"}</span>
        {links.map(([label, href]) => <Link data-href={href} className={activeHref === href ? "active" : ""} href={href} key={href} onPointerEnter={(event: PointerEvent<HTMLAnchorElement>) => movePill(event.currentTarget)} onFocus={(event) => movePill(event.currentTarget)} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link className="languageSwitch" href={languageHref} hrefLang={isArabic ? "en" : "ar"} onClick={() => setOpen(false)}>{isArabic ? "EN" : "العربية"}</Link>
        <ThemeToggle ar={isArabic} />
        <Link className="headerCta" href={`${prefix}/design-your-journey`} onClick={() => setOpen(false)}>{isArabic ? "تواصل معنا" : "Get in touch"}</Link>
      </nav>
    </div>
  </header>;
}
