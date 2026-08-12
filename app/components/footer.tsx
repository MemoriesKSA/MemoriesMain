import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return <footer><div className="container footerGrid"><div><div className="footerLogo"><Image src="/images/memories-logo-full.webp" width={703} height={720} alt="MEMORIES travel logo" /></div><p>Tailor-made journeys for Saudis, at home and around the world.</p></div><div><strong>Explore</strong><Link href="/destinations">Destinations</Link><Link href="/design-your-journey">Design your journey</Link><Link href="/saudi-abroad">Saudi Abroad</Link></div><div><strong>Company</strong><Link href="/about">About us</Link><Link href="/corporate">Corporate travel</Link><a href="mailto:hello@memories.travel">Contact</a></div><div><strong>Support</strong><p>Sunday–Thursday<br />9:00–18:00 KSA</p><a href="mailto:hello@memories.travel">hello@memories.travel</a></div></div><div className="container footerBottom"><span>© 2026 MEMORIES Travel</span><span>Riyadh, Saudi Arabia</span></div></footer>;
}
