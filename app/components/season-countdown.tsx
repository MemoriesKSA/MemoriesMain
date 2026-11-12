"use client";

import { useEffect, useState } from "react";

/**
 * A live countdown to the end of a season (Habib's pick on 12 Nov 2026: the
 * Riyadh Season logo with "Ends in 108d 08h 30m 38s" under it). The page is
 * cached for up to a day, so the first paint may be a little behind; the
 * clock corrects itself as soon as the page runs and then ticks every second.
 */
export function SeasonCountdown({ endsAt, ar, className = "seasonTimer" }: { endsAt: number; ar: boolean; className?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const left = endsAt - now;
  if (left <= 0) return null;
  const days = Math.floor(left / 86400000);
  const hours = Math.floor(left / 3600000) % 24;
  const minutes = Math.floor(left / 60000) % 60;
  const seconds = Math.floor(left / 1000) % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const clock = ar
    ? `${days}ي ${pad(hours)}س ${pad(minutes)}د ${pad(seconds)}ث`
    : `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  const endDate = new Intl.DateTimeFormat(ar ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Riyadh" }).format(endsAt - 1000);

  return (
    <span className={className} role="timer" aria-label={ar ? `ينتهي في ${endDate}` : `Ends ${endDate}`}>
      <span aria-hidden="true">{ar ? "ينتهي بعد" : "Ends in"} <b suppressHydrationWarning>{clock}</b></span>
    </span>
  );
}
