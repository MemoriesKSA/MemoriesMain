"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CITY_SEASONS, seasonEndsAt, seasonIsOnAt } from "../seasons-data";
import { RiyadhSeasonLogo } from "./riyadh-season-logo";
import { SeasonCountdown } from "./season-countdown";

// The homepage is a static page, built once per deploy, so the build cannot be
// trusted to know whether a season is still on. Both pieces here take
// `builtOn`, what the build saw, which keeps the first paint identical to the
// server's HTML; the browser then checks the real date and takes them down once
// the season is over, whether or not anyone has deployed since.

const SEASON = CITY_SEASONS.find((s) => s.logo === "riyadh-season");

/**
 * Riyadh Season under the homepage hero's buttons: its logo, "Riyadh Season is
 * on, don't miss it", the end date and a live countdown. Habib's dad asked for
 * it on 12 Nov 2026 and Habib picked this look (B) from three mock-ups.
 */
export function HomeSeasonNotice({ ar, builtOn }: { ar: boolean; builtOn: boolean }) {
  const [on, setOn] = useState(builtOn);
  useEffect(() => setOn(!!SEASON && seasonIsOnAt(SEASON, Date.now())), []);
  if (!SEASON || !on) return null;

  const endsAt = seasonEndsAt(SEASON);
  const endDate = new Intl.DateTimeFormat(ar ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Riyadh" }).format(endsAt - 1000);
  const page = `${ar ? "/ar" : ""}/destinations/${SEASON.country}/${SEASON.city}`;

  return (
    <Link className="homeSeason" href={page}>
      <RiyadhSeasonLogo title={ar ? "موسم الرياض" : "Riyadh Season"} />
      <span>
        <strong>{ar ? "بدأ موسم الرياض، لا تفوت الفرصة" : "Riyadh Season is on, don't miss it"}</strong>
        <small>{ar ? `ينتهي في ${endDate}` : `Ends ${endDate}`}</small>
        <SeasonCountdown endsAt={endsAt} ar={ar} className="rsHomeTimer" />
      </span>
    </Link>
  );
}

/**
 * A season's logo alone on a city's picture in the homepage's featured cards,
 * with no date: Habib's dad on 12 Nov 2026, of the Riyadh card, "put the logo
 * on it but without a date". Same corner and shade as the Discover Saudi cards.
 */
export function SeasonLogoOnImage({ ar, country, city, builtOn }: { ar: boolean; country: string; city: string; builtOn: boolean }) {
  const season = CITY_SEASONS.find((s) => s.logo && s.country === country && s.city === city);
  const [on, setOn] = useState(builtOn);
  useEffect(() => setOn(!!season && seasonIsOnAt(season, Date.now())), [season]);
  if (!season || !on) return null;

  return <>
    <i className="seasonShade" aria-hidden="true" />
    <b className="seasonMark onImage"><RiyadhSeasonLogo title={ar ? "موسم الرياض" : "Riyadh Season"} /></b>
  </>;
}
