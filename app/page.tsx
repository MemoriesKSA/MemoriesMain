import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Headphones, Handshake, Medal, Users } from "lucide-react";
import { DestinationGrid } from "./components/destination-grid";
import { JourneyPlanner } from "./components/journey-planner";
import { NewsletterForm } from "./components/newsletter-form";

const destinations = [
  { slug: "alula", name: "AlUla", image: "/images/alula.webp", blurb: "Ancient stories carved into sandstone." },
  { slug: "maldives", name: "Maldives", image: "/images/maldives.webp", blurb: "Crystal water, private calm, endless blue." },
  { slug: "paris", name: "Paris", image: "/images/paris.webp", blurb: "Timeless beauty, culture and romance." },
  { slug: "switzerland", name: "Switzerland", image: "/images/switzerland.webp", blurb: "Alpine air, lakes and unforgettable views." },
  { slug: "istanbul", name: "Istanbul", image: "/images/istanbul.webp", blurb: "Where continents, flavours and stories meet." },
];

const promises = [
  { icon: Medal, title: "Tailor-made trips", text: "Built around your pace" },
  { icon: Handshake, title: "Trusted partners", text: "Carefully vetted worldwide" },
  { icon: Headphones, title: "24/7 support", text: "A real person when needed" },
  { icon: Users, title: "For Saudis, by Saudis", text: "We understand your journey" },
];

export default function Home() {
  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <Image className="heroImage" src="/images/hero-family.webp" alt="A Saudi family watching balloons rise over a desert valley" fill priority sizes="100vw" />
        <div className="heroShade" />
        <div className="container heroContent">
          <p className="kicker light">Tailor-made travel, thoughtfully Saudi</p>
          <h1 id="hero-title">Every journey<br />begins with a dream.<br /><em>We turn it into<br />a memory.</em></h1>
          <p className="heroIntro">Bespoke journeys for Saudi families, couples and explorers—inside the Kingdom and around the world.</p>
          <div className="buttonRow">
            <Link className="button gold" href="/design-your-journey">Design your journey <ArrowRight size={16} /></Link>
            <Link className="button glass" href="#destinations">Explore destinations <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="promiseWrap" aria-label="Why travel with Memories">
        <div className="container promiseBar">
          {promises.map(({ icon: Icon, title, text }) => (
            <article className="promise" key={title}><Icon aria-hidden="true" /><div><strong>{title}</strong><span>{text}</span></div></article>
          ))}
        </div>
      </section>

      <section className="section container" id="destinations">
        <div className="sectionHeading">
          <div><p className="kicker">Explore</p><h2>Popular destinations</h2></div>
          <Link className="textLink" href="/destinations">View all destinations <ArrowRight size={15} /></Link>
        </div>
        <DestinationGrid destinations={destinations} />
      </section>

      <section className="section container splitFeature">
        <article className="plannerTeaser">
          <div className="teaserCopy"><p className="kicker light">Made for you</p><h2>Design your journey</h2><p>Tell us what you imagine. A dedicated travel designer will shape the details around your family, pace and preferences.</p><Link className="button gold" href="/design-your-journey">Start planning <ArrowRight size={16} /></Link></div>
          <div className="passport" aria-hidden="true"><span>MEMORIES</span><strong>Your journey<br />starts here</strong></div>
        </article>
        <article className="abroadCard">
          <p className="kicker">Saudis abroad</p><h2>We&apos;re with you,<br />wherever you go.</h2><p>On-the-ground guidance and dependable support for Saudi travellers abroad.</p>
          <ul><li>Local city guidance</li><li>Trusted private services</li><li>24/7 assistance</li><li>Exclusive member offers</li></ul>
          <Link className="button dark" href="/saudi-abroad">Explore services <ArrowRight size={16} /></Link>
        </article>
      </section>

      <section className="container plannerBand"><JourneyPlanner compact /></section>
      <section className="section container"><NewsletterForm /></section>

      <section className="statsBand">
        <div className="container stats">
          <div><strong>50+</strong><span>destinations worldwide</span></div>
          <div><strong>10k+</strong><span>dream journeys planned</span></div>
          <div><strong>24/7</strong><span>support wherever you need it</span></div>
          <div><strong>100%</strong><span>private & secure</span></div>
        </div>
      </section>
    </main>
  );
}
