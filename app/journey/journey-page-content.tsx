import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "../supabase-admin";
import { ItineraryView } from "./itinerary-view";
import { journeyStrings, formatJourneyDate, type JourneyLocale } from "./i18n";
import { placeNamesForCity, officialUrlMapForCity, placeCityMapForCity, redactableNamesForCity } from "./place-links";
import { applyPaywall, shouldPaywall, redactPlaceNames } from "./paywall";
import { planFee, nightsBetween, daysFromNights } from "./pricing";
import { parseAllNamedPlaces, parsePickNames, parseSiteLinks, type PlanStop, parseNameAliases } from "./plan-stops";
import { PlanUnlock } from "./plan-unlock";
import { RevisionRequest } from "./revision-request";

export async function JourneyPageContent({ token, locale }: { token: string; locale: JourneyLocale }) {
  const t = journeyStrings[locale];
  const dir = locale === "ar" ? "rtl" : "ltr";

  const supabase = createSupabaseAdminClient();
  const { data: proposal } = await supabase.from("proposals").select("*").eq("public_token", token).eq("status", "published").single();

  // Deliberately the same not-found response whether the token is wrong or
  // just belongs to a proposal that isn't published yet, don't leak which.
  if (!proposal) notFound();

  const fromDate = formatJourneyDate(proposal.from_date, locale);
  const toDate = formatJourneyDate(proposal.to_date, locale);
  const priceLine = proposal.price != null ? `${proposal.currency} ${Number(proposal.price).toLocaleString(locale === "ar" ? "ar" : "en-US")}` : null;
  const questions = t.questions("memoriesksasupport@gmail.com");
  // Real place names for this city, per language, so the itinerary can link
  // each one to a Maps search. Empty list simply means nothing gets linked.
  //
  // Two sources, because our own city data only ever held a fraction of what a
  // plan actually names. The rest - the airport, the rail link, the districts,
  // the researched restaurants - comes from the PICKS/PLACES lines the drafting
  // pass now writes, so "Jodd Fairs Ratchada" and "Soi Arab" are tappable too
  // rather than sitting as dead text beside the one hotel we happened to hold.
  const namedInDraft = parseAllNamedPlaces(proposal.notes ?? "");
  const placesEn = [...new Set([...placeNamesForCity(proposal.city, false), ...namedInDraft])].sort((a, b) => b.length - a.length);
  const placesAr = [...new Set([...placeNamesForCity(proposal.city, true), ...namedInDraft])].sort((a, b) => b.length - a.length);
  // Verified official sites where we have them; everything else falls back
  // to a Maps search inside the linkifier.
  // Our own verified list, then anything the plan itself supplied. The plan
  // wins where they overlap: it read the research for this specific city and
  // this specific institution, and a university admissions page is a better
  // link than a map pin for someone deciding where to spend three years.
  const officialUrls: Record<string, string> = { ...officialUrlMapForCity(proposal.city), ...parseSiteLinks(proposal.notes ?? "") };
  // The SITES line names each thing once, in English. The Arabic plan calls
  // the same thing something else, so without this it fell back to a map
  // search for precisely the things a map search suits worst: an app, a
  // booking platform, a university admissions page.
  for (const [ar, en] of Object.entries(parseNameAliases(proposal.notes ?? ""))) {
    if (officialUrls[en] && !officialUrls[ar]) officialUrls[ar] = officialUrls[en];
  }
  // Which stop each place belongs to, so a map search for a Jeddah
  // restaurant on a three-city plan says Jeddah and not the whole trip.
  const placeCities = placeCityMapForCity(proposal.city);

  // The split happens here, on the server. Locked days are removed from the
  // text before it is ever serialised to the browser, so an unpaid reader
  // cannot recover them from the page source or devtools. Only the headings
  // of withheld days survive, which is what the teaser needs.
  const locked = shouldPaywall(proposal);
  const planStops = (proposal.stops as PlanStop[] | null) ?? null;
  // Trip length now drives both halves of this: what the unlock costs, and
  // whether a free day can be spared at all on a very short trip.
  const nights = nightsBetween(proposal.from_date, proposal.to_date);
  const totalDays = daysFromNights(nights);
  const en = locked ? applyPaywall(proposal.itinerary_en ?? "", planStops, totalDays) : { visibleText: proposal.itinerary_en ?? "", lockedDays: [] };
  const ar = locked ? applyPaywall(proposal.itinerary_ar ?? "", planStops, totalDays) : { visibleText: proposal.itinerary_ar ?? "", lockedDays: [] };
  // The chosen hotel names come out of the overview while it is unpaid, with
  // every reason for choosing them left in place. Done here, on the server,
  // so the name is genuinely absent rather than merely hidden.
  //
  // What gets hidden is everything the plan RECOMMENDS: the hotels, the
  // restaurants, the drivers and the attractions, both from our own data and
  // from the draft's own PICKS line. What stays readable is the context a
  // reader needs to judge the work without being able to act on it: the
  // airport, the districts, the transit, every price, the halal and prayer
  // guidance.
  const hiddenEn = [...new Set([...redactableNamesForCity(proposal.city, false), ...parsePickNames(proposal.notes ?? "")])];
  const hiddenAr = [...new Set([...redactableNamesForCity(proposal.city, true), ...parsePickNames(proposal.notes ?? "")])];
  const visibleEn = locked ? redactPlaceNames(en.visibleText, hiddenEn) : en.visibleText;
  const visibleAr = locked ? redactPlaceNames(ar.visibleText, hiddenAr) : ar.visibleText;
  const stopCount = Math.min(Math.max(planStops?.length ?? 1, 1), 3);
  const unlockFee = planFee(nights, stopCount);

  return (
    <div dir={dir} style={{ minHeight: "100vh", background: "var(--ivory)", fontFamily: locale === "ar" ? "Tahoma, Arial, sans-serif" : undefined }}>
      {/* Fixed literal colors on purpose, not the theme-reactive var(--ink)/var(--paper)
          tokens: those flip meaning in dark mode (--ink becomes near-white), which
          silently turned this into a white band with white text. This hero band is
          meant to always read as a dark navy banner, in both themes. */}
      <div style={{ background: "#102d29", color: "#fffdf9", padding: "56px 24px 64px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <p style={{ margin: "0 0 10px", color: "var(--gold-light)", fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>{t.kicker}</p>
          <h1 style={{ margin: "0 0 14px", fontFamily: locale === "ar" ? "inherit" : "var(--font-display), Georgia, serif", fontSize: "clamp(2.1rem,4vw,3rem)", lineHeight: 1.1 }}>
            {t.heroTitle(proposal.customer_name, proposal.city)}
          </h1>
          <p style={{ margin: 0, color: "rgba(255,253,249,.75)", fontSize: 15 }}>
            {[fromDate && toDate ? `${fromDate} — ${toDate}` : null, t.referenceLabel(proposal.reference)].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "-32px auto 0", padding: "0 24px 80px" }}>
        {priceLine && (
          <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, boxShadow: "var(--shadow)", padding: "22px 28px", marginBottom: 28 }}>
            <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--muted)", fontWeight: 600, letterSpacing: 0.5 }}>{t.total}</p>
            <p style={{ margin: 0, fontFamily: "var(--font-display), Georgia, serif", fontSize: 30, color: "var(--ink)" }}>{priceLine}</p>
          </div>
        )}

        {visibleEn && (
          <section dir="ltr" style={{ marginBottom: visibleAr ? 32 : 0 }}>
            {locale === "ar" && (
              <p style={{ margin: "0 0 16px", color: "var(--gold)", fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>{t.otherVersionLabel}</p>
            )}
            <ItineraryView text={visibleEn} places={placesEn} cityLabel={proposal.city} officialUrls={officialUrls} placeCities={placeCities} lockedDays={en.lockedDays} />
          </section>
        )}

        {locked && (en.lockedDays.length > 0 || ar.lockedDays.length > 0) && (
          <PlanUnlock
            fee={unlockFee}
            currency={proposal.currency || "SAR"}
            lockedCount={Math.max(en.lockedDays.length, ar.lockedDays.length)}
            stopCount={stopCount}
            locale={locale}
          />
        )}

        {!locked && proposal.revision_used !== true && (
          <RevisionRequest token={token} locale={locale} />
        )}

        {visibleAr && (
          <section dir="rtl">
            {locale === "en" && (
              <p style={{ margin: "0 0 16px", color: "var(--gold)", fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>{t.otherVersionLabel}</p>
            )}
            <ItineraryView text={visibleAr} places={placesAr} cityLabel={proposal.city} officialUrls={officialUrls} placeCities={placeCities} lockedDays={ar.lockedDays} ar />
          </section>
        )}

        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, marginTop: 32 }}>
          {questions.before}
          <a href="mailto:memoriesksasupport@gmail.com" style={{ color: "var(--ink)" }} dir="ltr">
            {questions.email}
          </a>
          {questions.after}
        </p>
      </div>
    </div>
  );
}
