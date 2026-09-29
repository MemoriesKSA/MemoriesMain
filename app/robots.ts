import type { MetadataRoute } from "next";

// There was no robots.txt at all, so /robots.txt served the 404 page.
//
// The important half of this file is not what it allows, it is what it keeps
// out. A customer's plan lives at /journey/<token> and their progress page at
// /follow/<token>, and both are reachable by anyone holding the link: that is
// how a plan is delivered by email. A link that ends up in a sitemap, a
// referrer header or a crawler's index stops being private, and the plan it
// opens has the customer's trip, dates and name in it.
//
// Disallowing them is belt and braces rather than the guarantee. The tokens
// are long and random and nothing links to them, so a crawler should never
// find one; this is here for the day something does.

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://memories.tours").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // A customer's own plan and their progress page.
          "/journey/",
          "/follow/",
          "/ar/journey/",
          "/ar/follow/",
          // The reviewer tool. Password-protected, and not for indexing either.
          "/internal/",
          // Nothing here renders a page worth finding, and some of it is only
          // ever addressed by a cron with a secret.
          "/api/",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
