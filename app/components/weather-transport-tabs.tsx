"use client";

import { useEffect, useState } from "react";
import { Bus, Sun, Thermometer } from "lucide-react";
import type { EditorialCityGuide, FlagshipTransportMode } from "../flagship-city-data";
import type { LiveWeather } from "../weather-live";

/**
 * The city's weather, refreshed in the browser on load.
 *
 * Falls back silently to whatever the page was rendered with: a weather
 * outage should cost a reader a slightly old number, never an error.
 */
function useLiveWeather(citySlug: string, initial: LiveWeather | null) {
  const [weather, setWeather] = useState<LiveWeather | null>(initial);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/weather?city=${encodeURIComponent(citySlug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: LiveWeather | null) => { if (!cancelled && data && typeof data.tempC === "number") setWeather(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [citySlug]);
  return weather;
}

/**
 * The city's clock, ticking, computed in the browser.
 *
 * The server cannot supply this. The destination pages are statically
 * rendered and revalidated on a timer, so any time baked into the HTML is as
 * old as the cache entry, and a visitor refreshing the page saw a clock that
 * had not moved since the last revalidation.
 *
 * Returns null until the browser has run, so the server's own value shows
 * first and there is no hydration mismatch and no empty gap.
 */
function useCityClock(utcOffsetSeconds: number | undefined) {
  const [clock, setClock] = useState<string | null>(null);
  useEffect(() => {
    if (utcOffsetSeconds === undefined) return;
    const read = () => {
      const local = new Date(Date.now() + utcOffsetSeconds * 1000);
      setClock(`${String(local.getUTCHours()).padStart(2, "0")}:${String(local.getUTCMinutes()).padStart(2, "0")}`);
    };
    read();
    const timer = setInterval(read, 30_000);
    return () => clearInterval(timer);
  }, [utcOffsetSeconds]);
  return clock;
}
export function WeatherTransportTabs({ guide, citySlug, locale = "en", live }: { guide: EditorialCityGuide; citySlug: string; locale?: "en" | "ar"; live?: LiveWeather | null }) {
  const ar = locale === "ar";
  const hasTransport = (guide.transportation?.length ?? 0) > 0;
  const [tab, setTab] = useState<"weather" | "transport">("weather");
  // The reading the page was built with is the first paint; this replaces it
  // with one taken now. See app/api/weather/route.ts for why the page's own
  // copy cannot be trusted to be recent.
  const fresh = useLiveWeather(citySlug, live ?? null);
  const clock = useCityClock(fresh?.utcOffsetSeconds);
  const { bestWindow, peakHeat } = guide.weather;

  return (
    <div className="weatherTransport">
      {hasTransport && (
        <div className="weatherTabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "weather"} className={tab === "weather" ? "active" : undefined} onClick={() => setTab("weather")}>
            {ar ? "الطقس" : "Weather"}
          </button>
          <button type="button" role="tab" aria-selected={tab === "transport"} className={tab === "transport" ? "active" : undefined} onClick={() => setTab("transport")}>
            {ar ? "التنقل" : "Transportation"}
          </button>
        </div>
      )}

      {tab === "weather" ? (
        <>
          <div className="flagshipWeatherGrid">
            <article className="weatherCard weatherCardGood">
              <span className="weatherIcon"><Sun /></span>
              <strong>{ar ? bestWindow.labelAr : bestWindow.labelEn}</strong>
              <p className="weatherMonths">{ar ? bestWindow.monthsAr : bestWindow.monthsEn}</p>
              <p className="weatherTemp">{ar ? bestWindow.tempAr : bestWindow.tempEn}</p>
              <p className="weatherNote">{ar ? bestWindow.noteAr : bestWindow.noteEn}</p>
            </article>
            <article className="weatherCard weatherCardHot">
              <span className="weatherIcon"><Thermometer /></span>
              <strong>{ar ? peakHeat.labelAr : peakHeat.labelEn}</strong>
              <p className="weatherMonths">{ar ? peakHeat.monthsAr : peakHeat.monthsEn}</p>
              <p className="weatherTemp">{ar ? peakHeat.tempAr : peakHeat.tempEn}</p>
              <p className="weatherNote">{ar ? peakHeat.noteAr : peakHeat.noteEn}</p>
            </article>
          </div>
          {fresh ? (
            <div className="weatherNow">
              <div className="weatherNowHead">
                <span className="weatherNowLabel">{ar ? "الآن" : "Right now"}</span>
                <span className="weatherNowClock">{clock ?? fresh.localTime}</span>
              </div>
              <div className="weatherNowBody">
                <span className="weatherNowTemp">{fresh.tempC}<sup>°</sup></span>
                <div className="weatherNowMeta">
                  <strong>{ar ? fresh.conditionAr : fresh.conditionEn}</strong>
                  <span>
                    {ar ? `الإحساس الحراري ${fresh.feelsLikeC}°` : `Feels like ${fresh.feelsLikeC}°`}
                    {" · "}
                    {fresh.highC}° / {fresh.lowC}°
                  </span>
                </div>
              </div>
              <p className="weatherNowReading">{ar ? fresh.readingAr : fresh.readingEn}</p>
            </div>
          ) : null}
          <p className="weatherTip">{ar ? guide.weather.tipAr : guide.weather.tipEn}</p>
        </>
      ) : (
        <div className="transportGrid">
          {guide.transportation?.map((mode: FlagshipTransportMode) => (
            <article key={mode.modeEn} className="transportCard">
              <span className="weatherIcon"><Bus /></span>
              <strong>{ar ? mode.modeAr : mode.modeEn}</strong>
              <p>{ar ? mode.descriptionAr : mode.descriptionEn}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
