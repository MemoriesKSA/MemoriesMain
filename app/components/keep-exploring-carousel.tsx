"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CSSProperties, UIEvent, useRef, useState } from "react";

type ExploreCity = { slug: string; nameEn: string; nameAr: string; image: string; introEn: string; introAr: string };

export function KeepExploringCarousel({ cities, locale = "en" }: { cities: ExploreCity[]; locale?: "en" | "ar" }) {
  const ar = locale === "ar";
  const prefix = ar ? "/ar" : "";
  const carouselRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  function updateCurrent(event: UIEvent<HTMLDivElement>) {
    const viewport = event.currentTarget.getBoundingClientRect();
    const center = viewport.left + viewport.width / 2;
    const cards = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(".exploreCard"));
    const nearest = cards.reduce((best, card, index) => {
      const box = card.getBoundingClientRect();
      const distance = Math.abs(box.left + box.width / 2 - center);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });
    setCurrent((value) => value === nearest.index ? value : nearest.index);
  }

  function goTo(index: number) {
    const next = Math.max(0, Math.min(cities.length - 1, index));
    carouselRef.current?.querySelectorAll<HTMLElement>(".exploreCard")[next]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    setCurrent(next);
  }

  const progressStyle = { "--carousel-index": current, "--carousel-count": cities.length } as CSSProperties;

  return (
    <div className="exploreCarousel" dir={ar ? "rtl" : "ltr"}>
      <div className="exploreGrid" ref={carouselRef} onScroll={updateCurrent}>
        {cities.map((city, index) => (
          <Link className="exploreCard" href={`${prefix}/destinations/saudi-arabia/${city.slug}`} key={city.slug}>
            <Image src={city.image} alt={ar ? city.nameAr : city.nameEn} fill sizes="(max-width: 700px) 78vw, (max-width: 1100px) 32vw, 22vw" priority={index < 2} />
            <span className="destinationShade" />
            <span className="destinationCopy"><strong>{ar ? city.nameAr : city.nameEn}</strong><span>{ar ? city.introAr : city.introEn}</span></span>
            <span className="cardArrow"><ArrowRight className="directionArrow" size={16} /></span>
          </Link>
        ))}
      </div>
      <div className="carouselControls">
        <div className="carouselStatus">
          <strong>{ar ? "اسحب لاستكشاف المزيد" : "Swipe to explore more"}</strong>
          <span>{current + 1} / {cities.length}</span>
        </div>
        <div className="carouselProgress" aria-hidden="true"><span style={progressStyle} /></div>
        <div className="carouselButtons">
          <button type="button" onClick={() => goTo(current - 1)} disabled={current === 0} aria-label={ar ? "الوجهة السابقة" : "Previous destination"}><ArrowLeft size={18} /></button>
          <button type="button" onClick={() => goTo(current + 1)} disabled={current === cities.length - 1} aria-label={ar ? "الوجهة التالية" : "Next destination"}><ArrowRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}
