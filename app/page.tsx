import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Globe2, GraduationCap, Medal } from "lucide-react";
import { FeaturedJourneys } from "./components/featured-journeys";
import { JourneyPlanner } from "./components/journey-planner";
import { NewsletterForm } from "./components/newsletter-form";

const promises = [
  { icon: Medal, title: "Tailor-made journeys", text: "Built around your dream" },
  { icon: GraduationCap, title: "Study journeys", text: "Cities, universities & institutes" },
  { icon: Compass, title: "Complete planning", text: "Flights, stays, drivers & more" },
  { icon: Globe2, title: "Open to the world", text: "Travel from or to Saudi Arabia" },
];

export default function Home() {
  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <Image className="heroImage" src="/images/hero-family.webp" alt="A family watching balloons rise over a desert valley" fill priority sizes="100vw" />
        <div className="heroShade" />
        <div className="container heroContent">
          <p className="kicker light">Dream-led travel, made personal</p>
          <h1 id="hero-title" className="editorialHeroTitle">Every journey<br />begins with a dream.<br /><em>We turn it into<br />a memory.</em></h1>
          <p className="heroIntro">Built around your budget, exceptional journeys for families, couples, explorers and students, within Saudi Arabia and around the world.</p>
          <div className="buttonRow">
            <Link className="button gold" href="/design-your-journey">Design your dream journey <ArrowRight size={16} /></Link>
            <Link className="button glass" href="/discover-saudi-arabia">Discover Saudi Arabia <ArrowRight size={16} /></Link>
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

      <FeaturedJourneys />

      <section className="section container splitFeature">
        <article className="plannerTeaser">
          <div className="teaserCopy"><p className="kicker light">Made for you</p><h2>Design your dream journey</h2><p>Tell us what you imagine. We’ll prepare and design a journey around your people, pace, budget and preferences.</p><Link className="button gold" href="/design-your-journey">Start planning your dream <ArrowRight size={16} /></Link></div>
          <div className="passport" aria-hidden="true"><span>MEMORIES</span><strong>Your dream<br />starts here</strong></div>
        </article>
        <article className="abroadCard">
          <p className="kicker">Study Abroad</p><h2>Your next chapter,<br />made clearer.</h2><p>Guidance for students planning to study overseas, from choosing a destination to visa-application assistance.</p>
          <ul><li>Study destination guidance</li><li>Visa-application assistance</li><li>Flights and accommodation</li><li>Arrival planning</li></ul>
          <Link className="button dark" href="/study-abroad">Explore study support <ArrowRight size={16} /></Link>
        </article>
      </section>

      <section className="container plannerBand"><JourneyPlanner compact /></section>
      <section className="section container"><NewsletterForm /></section>

      <section className="statsBand">
        <div className="container stats">
          <div><strong>01</strong><span>Dream Journeys Worldwide</span></div>
          <div><strong>02</strong><span>Discover Saudi Arabia</span></div>
          <div><strong>03</strong><span>Study Abroad Guidance</span></div>
          <div><strong>04</strong><span>Visa-Application Assistance</span></div>
        </div>
      </section>
    </main>
  );
}
