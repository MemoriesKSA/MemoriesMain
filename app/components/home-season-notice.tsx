"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CITY_SEASONS, seasonEndsAt } from "../seasons-data";
import { RiyadhSeasonLogo } from "./riyadh-season-logo";
import { SeasonCountdown } from "./season-countdown";

const SEASON = CITY_SEASONS.find((s) => s.logo === "riyadh-season");

function seasonIsOn(now: number): boolean {
  if (!SEASON) return false;
  return now >= Date.parse(`${SEASON.startsOn}T00:00:00+03:00`) && now < seasonEndsAt(SEASON);
}

/**
 * Riyadh Season under the homepage hero's buttons: its logo, "Riyadh Season is
 * on, don't miss it", the end date and a live countdown. Habib's dad asked for
 * it on 12 Nov 2026 and Habib picked this look (B) from three mock-ups.
 *
 * The homepage is a static page, built once per deploy, so the build cannot be
 * trusted to know whether the season is still on. `builtOn` is what the build
 * saw, which keeps the first paint identical to the server's HTML; the browser
 * then checks the real date and takes the notice down once the season is over,
 * whether or not anyone has deployed since.
 */
export function HomeSeasonNotice({ ar, builtOn }: { ar: boolean; builtOn: boolean }) {
  const [on, setOn] = useState(builtOn);
  useEffect(() => setOn(seasonIsOn(Date.now())), []);
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
