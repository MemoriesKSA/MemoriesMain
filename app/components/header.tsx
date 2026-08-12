"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { CSSProperties, FocusEvent, PointerEvent, useLayoutEffect, useRef, useState } from "react";

const links = [
  ["Destinations", "/destinations"], ["Design your journey", "/design-your-journey"], ["Saudi Abroad", "/saudi-abroad"], ["About us", "/about"], ["Corporate", "/corporate"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [pill, setPill] = useState({ x: 0, width: 0, visible: false });
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
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
  return <header className={`siteHeader ${pathname === "/" ? "overHero" : "solidHeader"}`}>
    <div className="container headerInner">
      <Link href="/" className="brand" aria-label="Memories home"><Image className="brandLogo" src="/images/memories-logo-full.webp" width={703} height={720} alt="MEMORIES travel logo" preload /></Link>
      <button className="menuButton" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
      <nav ref={navRef} className={open ? "nav open" : "nav"} aria-label="Main navigation" onPointerLeave={settlePill} onBlur={(event: FocusEvent<HTMLElement>) => { if (!event.currentTarget.contains(event.relatedTarget)) settlePill(); }} style={pillStyle}>
        <span className={pill.visible ? "navPill visible" : "navPill"} aria-hidden="true" />
        {links.map(([label, href]) => <Link data-href={href} className={activeHref === href ? "active" : ""} href={href} key={href} onPointerEnter={(event: PointerEvent<HTMLAnchorElement>) => movePill(event.currentTarget)} onFocus={(event) => movePill(event.currentTarget)} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link className="headerCta" href="/design-your-journey" onClick={() => setOpen(false)}>Get in touch</Link>
      </nav>
    </div>
  </header>;
}
