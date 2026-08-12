import type { Metadata } from "next";
import { DestinationCatalogue } from "../components/destination-catalogue";
import { destinations } from "../data";

export const metadata: Metadata = { title: "Destinations", description: "Explore curated journeys across Saudi Arabia and the world." };

export default function DestinationsPage() {
  return <main className="innerPage destinationsPage">
    <section className="pageHero container"><p className="kicker">The world, thoughtfully curated</p><h1>Places worth<br /><em>remembering.</em></h1><p>Explore 20 inspiring starting points across Saudi Arabia and the world. Choose one you love—or tell us anywhere else you dream of going.</p></section>
    <section className="container destinationCatalogue"><DestinationCatalogue destinations={destinations} /></section>
  </main>;
}
