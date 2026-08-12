"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import type { DestinationRegion } from "../data";

type CatalogueDestination = {
  slug: string;
  name: string;
  country: string;
  region: DestinationRegion;
  image: string;
  blurb: string;
  bestFor: string;
  duration: string;
};

const regionOrder: Array<"all" | DestinationRegion> = ["all", "saudi", "middle-east", "europe", "asia", "islands", "north-america", "oceania"];

const regionNames = {
  en: { all: "All destinations", saudi: "Saudi Arabia", "middle-east": "Middle East", europe: "Europe", asia: "Asia", islands: "Island escapes", "north-america": "North America", oceania: "Oceania" },
  ar: { all: "جميع الوجهات", saudi: "السعودية", "middle-east": "الشرق الأوسط", europe: "أوروبا", asia: "آسيا", islands: "الجزر", "north-america": "أمريكا الشمالية", oceania: "أوقيانوسيا" },
} as const;

export function DestinationCatalogue({ destinations, locale = "en" }: { destinations: CatalogueDestination[]; locale?: "en" | "ar" }) {
  const [activeRegion, setActiveRegion] = useState<"all" | DestinationRegion>("all");
  const prefix = locale === "ar" ? "/ar" : "";
  const labels = regionNames[locale];
  const visible = useMemo(() => activeRegion === "all" ? destinations : destinations.filter((destination) => destination.region === activeRegion), [activeRegion, destinations]);

  return <>
    <div className="catalogueFilters" role="group" aria-label={locale === "ar" ? "تصفية الوجهات حسب المنطقة" : "Filter destinations by region"}>
      {regionOrder.map((region) => <button key={region} type="button" className={activeRegion === region ? "active" : ""} aria-pressed={activeRegion === region} onClick={() => setActiveRegion(region)}>{labels[region]}</button>)}
    </div>
    <p className="catalogueCount" aria-live="polite">{locale === "ar" ? `${visible.length} وجهة مختارة` : `${visible.length} curated destination${visible.length === 1 ? "" : "s"}`}</p>
    <div className="catalogueGrid" key={activeRegion}>
      {visible.map((destination, index) => <Link className="catalogueCard" href={`${prefix}/destinations/${destination.slug}`} key={destination.slug} style={{ "--card-order": index } as CSSProperties}>
        <span className="catalogueImage"><Image src={destination.image} alt={destination.name} fill sizes="(max-width: 620px) 100vw, (max-width: 1000px) 50vw, 33vw" priority={activeRegion === "all" && index < 3} /></span>
        <span className="catalogueCardBody"><span className="catalogueCountry">{destination.country}</span><strong>{destination.name}</strong><span className="catalogueBlurb">{destination.blurb}</span><span className="catalogueMeta"><span>{destination.bestFor}</span><span>{destination.duration}</span></span><span className="catalogueExplore">{locale === "ar" ? "استكشف الوجهة" : "Explore destination"} <ArrowRight className="directionArrow" size={16} /></span></span>
      </Link>)}
      <Link className="catalogueCard catalogueRequest" href={`${prefix}/design-your-journey`}>
        <span><Compass aria-hidden="true" /><span className="kicker light">{locale === "ar" ? "أي مكان تحلم به" : "Anywhere you imagine"}</span><strong>{locale === "ar" ? "هل تبحث عن وجهة أخرى؟" : "Looking for somewhere else?"}</strong><span>{locale === "ar" ? "هذه مجرد نقاط بداية. أخبرنا بالمكان الذي تحلم به وسنصمم الرحلة حولك." : "These are starting points, not limits. Tell us where you dream of going and we’ll design around you."}</span><span className="button gold">{locale === "ar" ? "صمّم رحلتك" : "Design your journey"} <ArrowRight className="directionArrow" size={16} /></span></span>
      </Link>
    </div>
  </>;
}
