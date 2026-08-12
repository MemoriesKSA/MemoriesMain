"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { CSSProperties, FocusEvent, PointerEvent, useLayoutEffect, useRef, useState } from "react";

const labels = {
  en: [["Destinations", "/destinations"], ["Design your journey", "/design-your-journey"], ["Saudi Abroad", "/saudi-abroad"], ["About us", "/about"], ["Corporate", "/corporate"]],
  ar: [["الوجهات", "/destinations"], ["صمّم رحلتك", "/design-your-journey"], ["سعوديون في الخارج", "/saudi-abroad"], ["من نحن", "/about"], ["الشركات", "/corporate"]],
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

  const pillStyle = { "--pill-x": `${pill.x}px`, "--pill-width": `${pill.width}px` } as CSSProperties;
  return <header dir={isArabic ? "rtl" : "ltr"} className={`siteHeader ${pathname === "/" || pathname === "/ar" ? "overHero" : "solidHeader"}`}>
    <div className="container headerInner">
      <Link href={isArabic ? "/ar" : "/"} className="brand" aria-label={isArabic ? "العودة إلى الرئيسية" : "Memories home"}><Image className="brandLogo" src="/images/memories-logo-full.webp" width={703} height={720} alt={isArabic ? "شعار ميموريز للسفر" : "MEMORIES travel logo"} preload /></Link>
      <button className="menuButton" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={isArabic ? "فتح قائمة التنقل" : "Toggle navigation"}>{open ? <X /> : <Menu />}</button>
      <nav ref={navRef} className={open ? "nav open" : "nav"} aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"} onPointerLeave={settlePill} onBlur={(event: FocusEvent<HTMLElement>) => { if (!event.currentTarget.contains(event.relatedTarget)) settlePill(); }} style={pillStyle}>
        <span className={pill.visible ? "navPill visible" : "navPill"} aria-hidden="true" />
        {links.map(([label, href]) => <Link data-href={href} className={activeHref === href ? "active" : ""} href={href} key={href} onPointerEnter={(event: PointerEvent<HTMLAnchorElement>) => movePill(event.currentTarget)} onFocus={(event) => movePill(event.currentTarget)} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link className="languageSwitch" href={languageHref} hrefLang={isArabic ? "en" : "ar"} onClick={() => setOpen(false)}>{isArabic ? "EN" : "العربية"}</Link>
        <Link className="headerCta" href={`${prefix}/design-your-journey`} onClick={() => setOpen(false)}>{isArabic ? "تواصل معنا" : "Get in touch"}</Link>
      </nav>
    </div>
  </header>;
}
