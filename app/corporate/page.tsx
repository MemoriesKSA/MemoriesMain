import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarCheck, FileText, Users } from "lucide-react";

export const metadata: Metadata = { title: "Corporate Travel" };

const items = [
  { icon: BriefcaseBusiness, title: "Executive travel", text: "Discreet, dependable itineraries for leaders and guests, with every important movement clearly coordinated." },
  { icon: Users, title: "Groups & delegations", text: "One accountable team for complex, multi-traveller plans, from arrivals to the final departure." },
  { icon: CalendarCheck, title: "Business trips & incentives", text: "Purposeful programmes that balance company objectives, smooth logistics and experiences people remember." },
  { icon: FileText, title: "Clear trip reporting", text: "Approvals, bookings, traveller details and company travel costs brought together in one clear view." },
];

export default function CorporatePage() {
  return <main className="innerPage corporatePage">
    <section className="corporateHero"><div className="container corporateHeroGrid">
      <div className="corporateHeroCopy"><p className="kicker light">MEMORIES Corporate</p><h1>Business travel,<br /><em>beautifully handled.</em></h1><p>Human service, clear coordination and thoughtful details for companies that value their people.</p><a className="button gold" href="mailto:memoriesksasupport@gmail.com">Start a conversation <ArrowRight size={16} /></a></div>
      <div className="corporateHeroMedia"><Image src="/images/corporate-business-travel.png" alt="Saudi business travellers reviewing their journey in an airport lounge" fill sizes="(max-width: 900px) 100vw, 42vw" priority /></div>
    </div></section>
    <section className="section container"><div className="serviceGrid corporateGrid">{items.map(({ icon: Icon, title, text }) => <article key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="container corporateCta"><h2>Planning a delegation, business trip or executive visit?</h2><p>Tell us the objective, dates and number of travellers. We will shape the right route, stays, transport and coordination for your team.</p><Link className="button dark" href="/design-your-journey">Send an enquiry <ArrowRight size={16} /></Link></section>
  </main>;
}
