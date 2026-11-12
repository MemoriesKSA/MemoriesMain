import type { CitySeason } from "../seasons-data";
import { RiyadhSeasonLogo } from "./riyadh-season-logo";

/**
 * Khobar Season's mark, cut from the header of the season's ticketing site
 * (khobarseason.platinumlist.net, the "Khobar Season home" logo) on
 * 12 November 2026. It is the same mark Habib's dad sent that day, which
 * reads "SEASON 25"; his dad asked for the year to say 26, so that line was
 * redrawn as "SEASON 26" in Century Gothic Bold to match (the scratch script
 * was ks_year.py). Swap the file in public/images/seasons if an official 2026
 * mark is published. The picture is white, for the dark corners of a photo;
 * on a light card the CSS turns it to ink.
 */
export function KhobarSeasonLogo({ title, className = "rsLogo ksLogo" }: { title: string; className?: string }) {
  // A plain <img>: the file is already small, and the image optimiser would
  // only add a request for nothing.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src="/images/seasons/khobar-season.webp" width={150} height={221} alt={title} decoding="async" />;
}

/** A season's own logo, whichever season it is. */
export function SeasonLogo({ season, ar }: { season: CitySeason; ar: boolean }) {
  if (season.logo === "khobar-season") return <KhobarSeasonLogo title={ar ? "موسم الخبر" : "Khobar Season"} />;
  if (season.logo === "riyadh-season") return <RiyadhSeasonLogo title={ar ? "موسم الرياض" : "Riyadh Season"} />;
  return null;
}
