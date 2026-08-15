import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, HeartHandshake, ListChecks, Search, Sparkles, Waypoints } from "lucide-react";

export const metadata: Metadata = { title: "About MEMORIES", description: "MEMORIES is a Saudi-born travel platform for dream journeys, visits to Saudi Arabia and study-abroad planning." };

const principles = [
  { icon: HeartHandshake, title: "Listen first", text: "We begin with the person, the purpose and the feeling they want from the journey." },
  { icon: Search, title: "Research with care", text: "We compare practical options and find the details that make a destination work for you." },
  { icon: Waypoints, title: "Connect the journey", text: "Flights, stays, transport and experiences are considered together, not as isolated parts." },
  { icon: Sparkles, title: "Keep it personal", text: "The final direction reflects your pace, priorities and complete budget." },
];

export default function AboutPage() {
  return <main className="innerPage aboutPage">
    <section className="pageHero container"><p className="kicker">What we are</p><h1>One dream.<br /><em>One complete journey.</em></h1><p>MEMORIES is a Saudi-born travel platform designed to turn an idea into a coordinated journey. We bring destinations, dates, flights, stays, transport, experiences and practical support into one thoughtful plan.</p></section>
    <section className="container storyGrid"><article><span>01</span><h2>Dream journeys</h2><p>Personal holidays for families, couples, friends and explorers, built around the country, cities, dates, pace and total budget that work for them.</p></article><article><span>02</span><h2>Discover Saudi Arabia</h2><p>Welcoming journeys for visitors coming to experience the Kingdom&apos;s cities, heritage, landscapes, culture and sacred destinations.</p></article><article><span>03</span><h2>Study abroad</h2><p>A clearer route for students planning an overseas education, including destination, university, travel, accommodation and visa-application guidance.</p></article></section>
    <section className="container aboutPurpose"><div><p className="kicker">Why MEMORIES exists</p><h2>Good travel planning should feel clear, human and considered.</h2></div><p>Search engines and AI can produce endless lists. Our role is to turn your preferences into a focused brief, research the right possibilities and make the next decision easier. We combine local understanding with a wider view of the world, then organise the details around the traveller.</p></section>
    <section className="section container"><div className="aboutPrinciples">{principles.map(({ icon: Icon, title, text }) => <article key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="container aboutProcess"><p className="kicker">How it comes together</p><div><article><span>01</span><Compass /><h3>Your brief</h3><p>You tell us where, why, when, who and the total budget.</p></article><article><span>02</span><Search /><h3>Our research</h3><p>We assess destinations, stays, transport and experiences that suit the brief.</p></article><article><span>03</span><ListChecks /><h3>A clear direction</h3><p>You receive an organised next step shaped around your journey.</p></article></div></section>
    <section className="container aboutStatement"><p className="kicker light">Saudi roots. Global outlook.</p><h2>We begin by understanding the person, not selling a package.</h2><p>Every request gives us the context needed to shape the next step. From there, MEMORIES can prepare a plan that feels personal, practical and possible.</p><Link className="button gold" href="/design-your-journey">Design your dream journey <ArrowRight size={16} /></Link></section>
  </main>;
}
