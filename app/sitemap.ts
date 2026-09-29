import type { MetadataRoute } from "next";
import { countryGuides } from "./destination-guide-data";

// The map Google needs, because until this existed there wasn't one.
//
// The site has around 360 addressable pages across two languages, 158 of them
// city guides with real written content, and no external site links to any of
// them. A crawler with no sitemap and no inbound links discovers a page by
// following links from a page it already knows, which for a new domain means
// it discovers almost nothing. Every one of those guides was written to be
// found and none of them could be.
//
// Built from countryGuides, the same list the pages themselves are generated
// from, so the sitemap cannot claim a page that does not exist or miss one
// that does. A sitemap maintained by hand drifts the first week somebody adds
// a city.

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://memories.tours").replace(/\/$/, "");

/**
 * Pages that exist in both languages at /x and /ar/x.
 *
 * Deliberately a list rather than a directory scan: what belongs in a sitemap
 * is a judgement about what is worth finding, not everything that happens to
 * render. The planner is first among the real pages because it is the only
 * one that turns a reader into a request.
 */
const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/design-your-journey", priority: 0.9, changeFrequency: "monthly" },
  { path: "/discover-saudi-arabia", priority: 0.9, changeFrequency: "monthly" },
  { path: "/destinations", priority: 0.8, changeFrequency: "weekly" },
  { path: "/know-before-you-go", priority: 0.7, changeFrequency: "monthly" },
  { path: "/saudi-abroad", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "yearly" },
  // Both are honest about being closed and both say so on the page. They stay
  // findable because someone searching for them should reach the truth rather
  // than a competitor.
  { path: "/study-abroad", priority: 0.4, changeFrequency: "monthly" },
  { path: "/corporate", priority: 0.4, changeFrequency: "monthly" },
  { path: "/feedback", priority: 0.3, changeFrequency: "yearly" },
  { path: "/booking-terms", priority: 0.3, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.2, changeFrequency: "yearly" },
];

/**
 * One entry per page, carrying its own alternate in the other language.
 *
 * hreflang matters more than usual here: half this catalogue exists twice,
 * once in English and once in Arabic, and without the pairing a search engine
 * reads them as two sites competing for the same query rather than one site
 * serving two readers.
 */
function bilingual(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], lastModified: Date): MetadataRoute.Sitemap {
  const en = `${BASE}${path}`;
  const ar = `${BASE}/ar${path}`;
  const languages = { en, ar };
  return [
    { url: en, lastModified, changeFrequency, priority, alternates: { languages } },
    { url: ar, lastModified, changeFrequency, priority, alternates: { languages } },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const statics = STATIC_PATHS.flatMap(({ path, priority, changeFrequency }) =>
    bilingual(path, priority, changeFrequency, now));

  // A country page is a way in; a city page is the thing somebody is actually
  // searching for. "Things to do in Trabzon" is a real query and a city guide
  // is a real answer to it, so cities are not buried beneath their country.
  const countries = countryGuides.flatMap((country) =>
    bilingual(`/destinations/${country.slug}`, 0.7, "monthly", now));

  const cities = countryGuides.flatMap((country) =>
    country.cities.flatMap((city) =>
      bilingual(`/destinations/${country.slug}/${city.slug}`, 0.7, "monthly", now)));

  return [...statics, ...countries, ...cities];
}
