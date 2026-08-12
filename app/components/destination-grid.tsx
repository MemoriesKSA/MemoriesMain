"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Destination = { slug: string; name: string; image: string; blurb: string };

export function DestinationGrid({ destinations }: { destinations: Destination[] }) {
  return <div className="destinationGrid">{destinations.map((destination, index) => (
    <Link className="destinationCard" href={`/destinations/${destination.slug}`} key={destination.slug} aria-label={`Explore ${destination.name}`}>
      <Image src={destination.image} alt={destination.name} fill sizes="(max-width: 700px) 82vw, (max-width: 1100px) 32vw, 20vw" priority={index < 2} />
      <span className="destinationShade" />
      <span className="destinationCopy"><strong>{destination.name}</strong><span>{destination.blurb}</span></span>
      <span className="cardArrow"><ArrowRight size={16} /></span>
    </Link>
  ))}</div>;
}
