"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  ["Destinations", "/destinations"], ["Design your journey", "/design-your-journey"], ["Saudi Abroad", "/saudi-abroad"], ["About us", "/about"], ["Corporate", "/corporate"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return <header className={`siteHeader ${pathname === "/" ? "overHero" : "solidHeader"}`}>
    <div className="container headerInner">
      <Link href="/" className="brand" aria-label="Memories home"><Image className="brandLogo" src="/images/memories-logo-full.webp" width={703} height={720} alt="MEMORIES travel logo" preload /></Link>
      <button className="menuButton" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
      <nav className={open ? "nav open" : "nav"} aria-label="Main navigation">
        {links.map(([label, href]) => <Link className={pathname === href ? "active" : ""} href={href} key={href} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link className="headerCta" href="/design-your-journey" onClick={() => setOpen(false)}>Get in touch</Link>
      </nav>
    </div>
  </header>;
}
