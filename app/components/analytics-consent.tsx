"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GA_MEASUREMENT_ID, PRIVATE_PATH } from "../analytics-config";

// Google Analytics, only with consent.
//
// The cookie notice promised that before any non-essential analytics arrived
// there would be a clear choice to accept or refuse it, so GA waits for that
// choice: nothing from Google loads, and no GA cookie is set, until "Accept".
// Vercel Analytics (cookieless) keeps counting either way.
//
// 30 Sep 2026: added because Habib wanted live visitors and cities, which the
// cookieless counter cannot give.

const KEY = "memories-analytics-consent";
const CHANGE = "memories-consent-change";

type Choice = "granted" | "denied" | null;

function readChoice(): Choice {
  try {
    const value = localStorage.getItem(KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

/** Remove GA's own cookies when consent is withdrawn. */
function clearGaCookies() {
  const names = document.cookie.split(";").map((c) => c.split("=")[0].trim()).filter((n) => n === "_ga" || n.startsWith("_ga_"));
  const host = location.hostname;
  for (const name of names) {
    for (const domain of [host, `.${host}`, `.${host.replace(/^www\./, "")}`]) {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
    }
    document.cookie = `${name}=; Max-Age=0; path=/`;
  }
}

export function setAnalyticsConsent(choice: "granted" | "denied") {
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    // Private mode: the choice lasts for this page only, which is still a choice.
  }
  if (choice === "denied") {
    (window as unknown as Record<string, boolean>)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
    clearGaCookies();
  }
  window.dispatchEvent(new Event(CHANGE));
}

function useConsent() {
  const [choice, setChoice] = useState<Choice>(null);
  const [known, setKnown] = useState(false);
  useEffect(() => {
    setChoice(readChoice());
    setKnown(true);
    const onChange = () => setChoice(readChoice());
    window.addEventListener(CHANGE, onChange);
    return () => window.removeEventListener(CHANGE, onChange);
  }, []);
  return { choice, known };
}

export function AnalyticsConsent() {
  const pathname = usePathname() ?? "/";
  const ar = pathname === "/ar" || pathname.startsWith("/ar/");
  const privatePage = PRIVATE_PATH.test(pathname);
  const { choice, known } = useConsent();
  const [loaded, setLoaded] = useState(false);

  // Load once consent exists and we are on a public page; after that, switch
  // GA off on every private page and back on elsewhere.
  useEffect(() => {
    if (choice === "granted" && !privatePage) setLoaded(true);
  }, [choice, privatePage]);
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    (window as unknown as Record<string, boolean>)[`ga-disable-${GA_MEASUREMENT_ID}`] = choice !== "granted" || privatePage;
  }, [choice, privatePage]);

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      {loaded ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
          <Script id="memories-ga" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}
          </Script>
        </>
      ) : null}
      {known && choice === null && !privatePage ? (
        <div className="consentBanner" role="dialog" aria-live="polite" dir={ar ? "rtl" : "ltr"}>
          <p>
            {ar
              ? "نستخدم Google Analytics عشان نعرف كم زائر يجينا ومن وين، بدون ما نعرف مين أنت. تسمح لنا؟ "
              : "We'd like to use Google Analytics to see how many people visit and from where, without learning who you are. Is that OK? "}
            <Link href={ar ? "/ar/cookies" : "/cookies"}>{ar ? "سياسة ملفات الارتباط" : "Cookie Notice"}</Link>
          </p>
          <div className="consentActions">
            <button type="button" onClick={() => setAnalyticsConsent("granted")}>{ar ? "أقبل" : "Accept"}</button>
            <button type="button" onClick={() => setAnalyticsConsent("denied")}>{ar ? "لا، شكرًا" : "No thanks"}</button>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** On the Cookie Notice page: see and change the choice. */
export function ConsentSettings({ ar = false }: { ar?: boolean }) {
  const { choice, known } = useConsent();
  if (!GA_MEASUREMENT_ID || !known) return null;
  const state = choice === "granted" ? (ar ? "مسموح" : "allowed") : choice === "denied" ? (ar ? "مرفوض" : "refused") : ar ? "ما اخترت بعد" : "not chosen yet";
  return (
    <div className="consentSettings" dir={ar ? "rtl" : "ltr"}>
      <p>
        {ar ? "Google Analytics على جهازك: " : "Google Analytics on this device: "}
        <strong>{state}</strong>
      </p>
      <div className="consentActions">
        <button type="button" onClick={() => setAnalyticsConsent("granted")} disabled={choice === "granted"}>{ar ? "اسمح" : "Allow"}</button>
        <button type="button" onClick={() => setAnalyticsConsent("denied")} disabled={choice === "denied"}>{ar ? "ارفض" : "Refuse"}</button>
      </div>
    </div>
  );
}
