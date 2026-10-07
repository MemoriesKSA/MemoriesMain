"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { track } from "@vercel/analytics";

// Two things worth knowing about an example, and nothing else: that it was
// opened, and that its reader went on to ask for a plan. Counted like the
// form's steps, with the page and the tag the link carried, so "which example
// sends people to the form" has an answer.

function send(step: "seen" | "request", page: string, source: string) {
  track("example_plan", { step, page, source: source || "none" });
}

/** Counts the page once it has been drawn. `page` is a slug, or "index". */
export function ExampleSeen({ page, source }: { page: string; source: string }) {
  useEffect(() => {
    send("seen", page, source);
  }, [page, source]);
  return null;
}

/** A link to the request form that counts the tap on its way out. */
export function ExampleRequestLink({ href, page, source, className, children }: { href: string; page: string; source: string; className?: string; children: ReactNode }) {
  return <Link href={href} className={className} onClick={() => send("request", page, source)}>{children}</Link>;
}

const never = () => () => {};

/**
 * The bar that rides along the bottom of an example.
 *
 * Drawn into the body rather than where it is written. Every page sits inside
 * the stage that fades it in (template.tsx), and that animation ends on a
 * filter, which makes the stage the box a fixed element is pinned to: written
 * in place, this bar sat at the foot of the plan, a long scroll down, instead
 * of at the foot of the screen. Outside the stage it also needs its own
 * direction, which the Arabic wrapper would otherwise have given it.
 */
export function ExampleBar({ dir, children }: { dir: "rtl" | "ltr"; children: ReactNode }) {
  // False on the server and while hydrating, true after: there is no body to draw into before that.
  const inBrowser = useSyncExternalStore(never, () => true, () => false);
  return inBrowser ? createPortal(<div className="exampleBar" dir={dir}>{children}</div>, document.body) : null;
}
