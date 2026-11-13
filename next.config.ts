import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  // A plan's or a follow page's address ends in its private token, the only
  // key to someone's plan. By default a browser hands the full address of the
  // page you came from to the next page and to every request it makes. On
  // these pages it now hands over the site's name only, so the token never
  // travels as a "referrer", to another site or to our own visit counter.
  // "origin" rather than "no-referrer" on purpose: the stricter value also
  // blanks the Origin header on the page's own form posts.
  async headers() {
    const policy = [{ key: "Referrer-Policy", value: "origin" }];
    return ["/journey/:path*", "/ar/journey/:path*", "/follow/:path*", "/ar/follow/:path*", "/internal/:path*"].map((source) => ({ source, headers: policy }));
  },
  // Short links for video captions: memories.tours/94 opens the short Arabic
  // form tagged ?source=v94, so a request can be traced to the video it came
  // from (Habib, 13 Nov 2026: yes to short tagged links per video). Not
  // permanent, so a number can be pointed somewhere else later.
  async redirects() {
    return [{ source: "/:post(\\d{2,4})", destination: "/ar/design-your-journey?source=v:post", permanent: false }];
  },
};

export default nextConfig;
