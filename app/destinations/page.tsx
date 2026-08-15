import type { Metadata } from "next";
import { CountryCatalogue } from "../components/country-catalogue";
import { countryGuides } from "../destination-guide-data";

export const metadata: Metadata = { title: "Destinations", description: "Explore curated journeys across Saudi Arabia and the world." };

export default function DestinationsPage() {
  return <main className="innerPage destinationsPage">
    <section className="pageHero destinationChoiceHero container"><p className="kicker">One question before the journey begins</p><h1>Where do you<br /><em>want to go?</em></h1><p>Choose the country that has been on your mind. We’ll show you the cities, the character and the possibilities waiting inside it.</p></section>
    <section className="container destinationCatalogue"><CountryCatalogue countries={countryGuides} /></section>
  </main>;
}
