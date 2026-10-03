"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { PRIVATE_PATH } from "../analytics-config";

// The cookieless visit counter, with one rule on top: a private page is
// counted without its address.
//
// 3 Oct 2026: the counter had been recording plan pages under their full
// address, and that address ends in the plan's private token, the only key to
// someone's plan. Google Analytics was already kept off these pages for
// exactly that reason (see analytics-config.ts); this counter was not. The
// visit still counts, as "/journey/private", so we can see that plans are being
// opened without storing which one.
//
// It has to be a client component because the rule is a function, and a
// function cannot be handed from the server layout to a client component.
function withoutPrivateLinks(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    const url = new URL(event.url);
    const match = url.pathname.match(PRIVATE_PATH);
    if (!match) return event;
    url.pathname = `${match[0].replace(/\/$/, "")}/private`;
    url.search = "";
    url.hash = "";
    return { ...event, url: url.toString() };
  } catch {
    // An address we cannot read is not one we should send.
    return null;
  }
}

export function SiteAnalytics() {
  return <Analytics beforeSend={withoutPrivateLinks} />;
}
