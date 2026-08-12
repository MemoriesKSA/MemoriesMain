import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { destinations } from "../data";

export const metadata: Metadata = { title: "Destinations", description: "Explore inspiring starting points in Saudi Arabia and around the world." };

export default function DestinationsPage() {
  return <main className="innerPage"><section className="pageHero container"><p className="kicker">Go further</p><h1>Places worth<br /><em>remembering.</em></h1><p>From quiet islands to storied cities, these are starting points—not fixed packages. Every detail is shaped around you.</p></section><section className="container destinationListing">{destinations.map((item) => <article className="listingCard" key={item.slug}><Link href={`/destinations/${item.slug}`} className="listingImage"><Image src={item.image} alt={item.name} fill sizes="(max-width: 800px) 100vw, 50vw" /></Link><div><span>{item.country}</span><h2>{item.name}</h2><p>{item.description}</p><dl><div><dt>Best for</dt><dd>{item.bestFor}</dd></div><div><dt>Suggested stay</dt><dd>{item.duration}</dd></div></dl><Link className="textLink" href={`/destinations/${item.slug}`}>Explore {item.name} <ArrowRight size={15} /></Link></div></article>)}</section></main>;
}
