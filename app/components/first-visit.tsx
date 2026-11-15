"use client";

import { useEffect } from "react";

// Where this visit began: the ?source= tag and the site of the page that sent
// the visitor here (Head of Growth 15 Nov: recent requests had a blank source,
// because people land on an untagged page and walk to the form). Held in page
// memory only, never written to the device, so it lasts for this visit and
// adds no storage (the cookie notice promises to ask before adding tracking).
// It leaves the browser only inside the visitor's own plan request.
type Landing = { source: string; site: string; at: number };

let landing: Landing | null = null;

const tidy = (value: string, max: number) => value.slice(0, max).replace(/[^a-zA-Z0-9_.-]/g, "");

/** Mounted once in the root layout: notes where the visit began. */
export function FirstVisitMemory() {
  useEffect(() => {
    if (landing) return;
    let site = "";
    try {
      const host = new URL(document.referrer).hostname.replace(/^(www|m|vm|l|lm)\./, "");
      if (host && host !== location.hostname && !host.endsWith("memories.tours")) site = tidy(host, 60);
    } catch {
      // No referrer: typed, bookmarked, or an app that hides it.
    }
    landing = { source: tidy(new URLSearchParams(location.search).get("source") ?? "", 40), site, at: Date.now() };
  }, []);
  return null;
}

/** Sent with a plan request: the tag and site this visit began with, and minutes since. */
export function firstVisitFields(): { firstSource: string; firstRef: string; firstMinutes: string } {
  if (!landing) return { firstSource: "", firstRef: "", firstMinutes: "" };
  return { firstSource: landing.source, firstRef: landing.site, firstMinutes: String(Math.max(0, Math.round((Date.now() - landing.at) / 60_000))) };
}
