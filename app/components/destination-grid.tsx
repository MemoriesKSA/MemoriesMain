"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CSSProperties, UIEvent, useRef, useState } from "react";

type Destination = { slug: string; name: string; image: string; blurb: string };

export function DestinationGrid({ destinations, locale = "en" }: { destinations: Destination[]; locale?: "en" | "ar" }) {
  const prefix = locale === "ar" ? "/ar" : "";
  const carouselRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  function updateCurrent(event: UIEvent<HTMLDivElement>) {
    const viewport = event.currentTarget.getBoundingClientRect();
    const center = viewport.left + viewport.width / 2;
    const cards = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(".destinationCard"));
    const nearest = cards.reduce((best, card, index) => {
      const box = card.getBoundingClientRect();
      const distance = Math.abs(box.left + box.width / 2 - center);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });
    setCurrent((value) => value === nearest.index ? value : nearest.index);
  }

  function goTo(index: number) {
    const next = Math.max(0, Math.min(destinations.length - 1, index));
    carouselRef.current?.querySelectorAll<HTMLElement>(".destinationCard")[next]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    setCurrent(next);
  }

  const progressStyle = { "--carousel-index": current, "--carousel-count": destinations.length } as CSSProperties;
  return <div className="destinationCarousel" dir={locale === "ar" ? "rtl" : "ltr"}><div ref={carouselRef} className="destinationGrid" onScroll={updateCurrent}>{destinations.map((destination, index) => (
    <Link className="destinationCard" href={`${prefix}/destinations/${destination.slug}`} key={destination.slug} aria-label={locale === "ar" ? `استكشف ${destination.name}` : `Explore ${destination.name}`}>
      <Image src={destination.image} alt={destination.name} fill sizes="(max-width: 700px) 82vw, (max-width: 1100px) 32vw, 20vw" priority={index < 2} />
      <span className="destinationShade" />
      <span className="destinationCopy"><strong>{destination.name}</strong><span>{destination.blurb}</span></span>
      <span className="cardArrow"><ArrowRight className="directionArrow" size={16} /></span>
    </Link>
  ))}</div><div className="carouselControls"><div className="carouselStatus"><strong>{locale === "ar" ? "اسحب لاستكشاف المزيد" : "Swipe to explore more"}</strong><span>{current + 1} / {destinations.length}</span></div><div className="carouselProgress" aria-hidden="true"><span style={progressStyle} /></div><div className="carouselButtons"><button type="button" onClick={() => goTo(current - 1)} disabled={current === 0} aria-label={locale === "ar" ? "الوجهة السابقة" : "Previous destination"}><ArrowLeft size={18} /></button><button type="button" onClick={() => goTo(current + 1)} disabled={current === destinations.length - 1} aria-label={locale === "ar" ? "الوجهة التالية" : "Next destination"}><ArrowRight size={18} /></button></div></div></div>;
}
