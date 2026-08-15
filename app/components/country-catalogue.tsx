"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CountryGuide, Locale } from "../destination-guide-data";

export function CountryCatalogue({ countries, locale = "en" }: { countries: CountryGuide[]; locale?: Locale }) {
  const ar = locale === "ar";
  const prefix = ar ? "/ar" : "";
  const [query, setQuery] = useState("");
  const [displayedQuery, setDisplayedQuery] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const filterCycle = useRef(0);

  useEffect(() => {
    if (query === displayedQuery) return;
    const cycle = ++filterCycle.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setDisplayedQuery(query);
      setIsFiltering(false);
      return;
    }

    setIsFiltering(true);
    const swapTimer = window.setTimeout(() => {
      if (filterCycle.current !== cycle) return;
      setDisplayedQuery(query);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        if (filterCycle.current === cycle) setIsFiltering(false);
      }));
    }, 190);

    return () => window.clearTimeout(swapTimer);
  }, [displayedQuery, query]);

  const visible = useMemo(() => {
    const needle = displayedQuery.trim().toLocaleLowerCase();
    if (!needle) return countries;
    return countries.filter((country) => `${country.nameEn} ${country.nameAr} ${country.region} ${country.regionAr}`.toLocaleLowerCase().includes(needle));
  }, [countries, displayedQuery]);

  return <>
    <label className="countrySearch">
      <Search aria-hidden="true" />
      <span className="srOnly">{ar ? "ابحث عن دولة" : "Search for a country"}</span>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ar ? "ابحث عن الدولة التي في بالك…" : "Search for the country on your mind…"} />
      <small className={isFiltering ? "isFiltering" : ""}>{ar ? `${visible.length} دولة` : `${visible.length} countr${visible.length === 1 ? "y" : "ies"}`}</small>
    </label>
    <div className={`countryGallery${isFiltering ? " isFiltering" : ""}`} aria-live="polite" aria-busy={isFiltering}>
      {visible.map((country, index) => <Link href={`${prefix}/destinations/${country.slug}`} className="countryGalleryCard" key={country.slug}>
        <Image src={country.image} alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" priority={index < 3} />
        <span className="countryGalleryShade" />
        <span className="countryGalleryIndex">{String(index + 1).padStart(2, "0")}</span>
        <span className="countryGalleryCopy">
          <small>{ar ? country.regionAr : country.region}</small>
          <strong>{ar ? country.nameAr : country.nameEn}</strong>
          <span>{ar ? country.taglineAr : country.taglineEn}</span>
          <em>{ar ? `استكشف ${country.cities.length} وجهة` : `Explore ${country.cities.length} places`} <ArrowRight className="directionArrow" size={17} /></em>
        </span>
      </Link>)}
    </div>
    {!visible.length ? <div className={`countryEmpty${isFiltering ? " isFiltering" : ""}`}><strong>{ar ? "لم نجد هذه الدولة بعد." : "We haven’t added that country yet."}</strong><p>{ar ? "لكن رحلتك لا يجب أن تتوقف هنا. أخبرنا بالمكان وسنخطط حوله." : "Your journey does not have to stop here. Tell us the place and we’ll plan around it."}</p><Link className="button gold" href={`${prefix}/design-your-journey`}>{ar ? "أخبرنا بوجهتك" : "Tell us your destination"} <ArrowRight className="directionArrow" size={17} /></Link></div> : null}
  </>;
}
