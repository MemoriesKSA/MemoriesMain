"use client";

import { useState } from "react";
import { Bus, Sun, Thermometer } from "lucide-react";
import type { EditorialCityGuide, FlagshipTransportMode } from "../flagship-city-data";
import type { LiveWeather } from "../weather-live";

export function WeatherTransportTabs({ guide, locale = "en", live }: { guide: EditorialCityGuide; locale?: "en" | "ar"; live?: LiveWeather | null }) {
  const ar = locale === "ar";
  const hasTransport = (guide.transportation?.length ?? 0) > 0;
  const [tab, setTab] = useState<"weather" | "transport">("weather");
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
          {live ? (
            <div className="weatherNow">
              <div className="weatherNowHead">
                <span className="weatherNowLabel">{ar ? "الآن" : "Right now"}</span>
                <span className="weatherNowClock">{live.localTime}</span>
              </div>
              <div className="weatherNowBody">
                <span className="weatherNowTemp">{live.tempC}<sup>°</sup></span>
                <div className="weatherNowMeta">
                  <strong>{ar ? live.conditionAr : live.conditionEn}</strong>
                  <span>
                    {ar ? `الإحساس الحراري ${live.feelsLikeC}°` : `Feels like ${live.feelsLikeC}°`}
                    {" · "}
                    {live.highC}° / {live.lowC}°
                  </span>
                </div>
              </div>
              <p className="weatherNowReading">{ar ? live.readingAr : live.readingEn}</p>
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
