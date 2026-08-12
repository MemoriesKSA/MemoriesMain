import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { destinations } from "../../data";

export function generateStaticParams() { return destinations.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const item = destinations.find((destination) => destination.slug === slug); return item ? { title: item.name, description: item.description } : {}; }

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const item = destinations.find((destination) => destination.slug === slug); if (!item) notFound();
  return <main className="detailPage"><section className="destinationHero"><Image src={item.image} alt={item.name} fill priority sizes="100vw" /><div className="detailShade" /><div className="container destinationHeroCopy"><p className="kicker light">{item.country}</p><h1>{item.name}</h1><p>{item.description}</p></div></section><section className="container detailGrid"><div><p className="kicker">Your journey</p><h2>Unhurried, personal,<br />entirely yours.</h2><p>We begin with a conversation, then build a private itinerary around what matters to you. No generic group tours, no rushed checklists.</p><ul className="checkList"><li><Check /> Private airport welcome and transfers</li><li><Check /> Hotels selected for your family and preferences</li><li><Check /> Flexible daily experiences with trusted guides</li><li><Check /> Arabic-speaking support before and during travel</li></ul></div><aside><span>Suggested stay</span><strong>{item.duration}</strong><span>Best for</span><strong>{item.bestFor}</strong><Link className="button gold" href={`/design-your-journey?destination=${item.slug}`}>Plan this journey <ArrowRight size={16} /></Link></aside></section></main>;
}
