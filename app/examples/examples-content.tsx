import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "../supabase-admin";
import { ItineraryView } from "../journey/itinerary-view";
import { formatJourneyDate } from "../journey/i18n";
import { placeNamesForCity, officialUrlMapForCity, placeCityMapForCity } from "../journey/place-links";
import { primaryPlanLanguage } from "../journey/plan-language";
import { listPlanFeeForProposal, NIGHT_RATE, PLANS_FREE } from "../journey/pricing";
import { parseAllNamedPlaces, parseSiteLinks, parseNameAliases, parseNameKinds } from "../journey/plan-stops";
import { ExampleBar, ExampleRequestLink, ExampleSeen } from "./example-events";
import { examplePlans, exampleDays, exampleHref, requestHref, EXAMPLES_WRITTEN, TEAM_PLAN_NAME, type ExamplePlan } from "./example-plans";

type Locale = "en" | "ar";

function daysLabel(days: number, ar: boolean) {
  return ar ? `${days} أيام` : `${days} days`;
}

function offerLine(ar: boolean) {
  if (PLANS_FREE) return ar ? `مجانية حاليًا · سعر الخطة ${NIGHT_RATE} ريال لليلة` : `Free right now · A plan is SAR ${NIGHT_RATE} a night`;
  return ar ? `سعر الخطة ${NIGHT_RATE} ريال لليلة` : `A plan is SAR ${NIGHT_RATE} a night`;
}

function cityImage(plan: ExamplePlan) {
  return `/images/cities/${plan.country}/${plan.city}.webp`;
}

/** Every example on one page: a picture each, and one way on to the form. */
export function ExamplesIndex({ locale, source }: { locale: Locale; source: string }) {
  const ar = locale === "ar";
  return (
    <main className="innerPage examplesPage">
      <ExampleSeen page="index" source={source} />
      <div className="container">
        <header className="examplesLead">
          <p className="kicker">{ar ? "خطط مثال" : "Example plans"}</p>
          <h1>{ar ? "شوف الخطة قبل ما تطلبها" : "See a plan before you ask for one"}</h1>
          <p>{ar
            ? "أمثلة كتبناها بنفس الطريقة اللي نكتب بها خطتك، كاملة بدون اختصار. اختر وجهة وشوف وش بيوصلك."
            : "Examples written the same way we would write yours, whole and unshortened. Pick a place and see what you would get."}</p>
        </header>
        <div className="examplesGrid">
          {examplePlans.map((plan, index) => (
            <Link key={plan.slug} href={exampleHref(locale, plan.slug, source)} className="exampleCard">
              <Image src={cityImage(plan)} alt="" fill sizes={index === 0 ? "(max-width:780px) 100vw, 1180px" : "(max-width:780px) 50vw, 390px"} priority={index < 3} />
              <span>
                <strong>{plan[locale].city}</strong>
                <small>{plan[locale].card} · {daysLabel(exampleDays(plan), ar)}</small>
              </span>
            </Link>
          ))}
        </div>
        <div className="examplesAsk">
          <ExampleRequestLink href={requestHref(locale, null, source)} page="index" source={source} className="button gold">{ar ? "اطلب خطة لرحلتك" : "Ask for a plan for your trip"}</ExampleRequestLink>
          <small>{offerLine(ar)}</small>
        </div>
      </div>
    </main>
  );
}

/**
 * One example, in full.
 *
 * The same reader a customer's plan gets, with none of what belongs to a
 * customer: no reference, no change request, no checkout, and never the
 * plan's private link. The plan is found by its reference from the list in
 * example-plans.ts, so nothing a visitor types reaches the query.
 */
export async function ExamplePlanContent({ slug, locale, source }: { slug: string; locale: Locale; source: string }) {
  const plan = examplePlans.find((item) => item.slug === slug);
  if (!plan) notFound();

  const supabase = createSupabaseAdminClient();
  const { data: proposal } = await supabase
    .from("proposals")
    .select("customer_name, city, from_date, to_date, stops, notes, itinerary_en, itinerary_ar")
    .eq("reference", plan.reference)
    .eq("status", "published")
    .maybeSingle();
  // Belt and braces on top of the list: only ever a plan the team requested.
  if (!proposal || proposal.customer_name !== TEAM_PLAN_NAME) notFound();

  const { primary } = primaryPlanLanguage(locale, !!proposal.itinerary_en, !!proposal.itinerary_ar);
  if (!primary) notFound();
  const planAr = primary === "ar";
  const text = (planAr ? proposal.itinerary_ar : proposal.itinerary_en) ?? "";

  // The same links a customer's plan carries; see journey-page-content.tsx
  // for why each of these lists exists.
  const notes = proposal.notes ?? "";
  const places = [...new Set([...placeNamesForCity(proposal.city, planAr), ...parseAllNamedPlaces(notes)])].sort((a, b) => b.length - a.length);
  const officialUrls: Record<string, string> = { ...officialUrlMapForCity(proposal.city), ...parseSiteLinks(notes) };
  for (const [arabic, english] of Object.entries(parseNameAliases(notes))) {
    if (officialUrls[english] && !officialUrls[arabic]) officialUrls[arabic] = officialUrls[english];
  }

  const ar = locale === "ar";
  const label = plan[locale];
  const dates = [formatJourneyDate(proposal.from_date, locale), formatJourneyDate(proposal.to_date, locale)].filter(Boolean).join(" — ");
  const fee = listPlanFeeForProposal(proposal);
  const ask = ar ? "اطلب خطة مثلها لرحلتك" : "Ask for one like it for your trip";
  const request = requestHref(locale, plan, source);

  return (
    <main className="innerPage examplePage">
      <ExampleSeen page={plan.slug} source={source} />
      <section className="exampleHero">
        <div className="exampleWrap">
          <span className="exampleRibbon">{ar ? "خطة مثال كاملة" : "A whole example plan"}</span>
          <h1>{ar ? <>خطة {label.city} <em>{label.forWhom}</em></> : <>A {label.city} plan <em>{label.forWhom}</em></>}</h1>
          <p>{[daysLabel(exampleDays(plan), ar), dates].filter(Boolean).join(" · ")}</p>
        </div>
      </section>
      <div className="exampleWrap exampleBody">
        {/* Said first, because a plan is full of prices and opening hours and
            this one stays up after they have moved. */}
        <p className="exampleNote">{ar
          ? `هذا مثال كتبناه في ${EXAMPLES_WRITTEN.ar} لرحلة افترضناها، بنفس الطريقة اللي نكتب بها خطتك. الأسعار والمواعيد تتغير مع الوقت، وخطتك نكتبها على تواريخك وميزانيتك أنت.`
          : `We wrote this example in ${EXAMPLES_WRITTEN.en} for a trip we made up, the same way we would write yours. Prices and opening times move, and yours is written for your own dates and budget.`}</p>
        <section dir={planAr ? "rtl" : "ltr"} lang={primary} style={{ textAlign: "start" }}>
          <ItineraryView text={text} places={places} cityLabel={proposal.city} officialUrls={officialUrls} placeCities={placeCityMapForCity(proposal.city)} placeKinds={parseNameKinds(notes)} ar={planAr} />
        </section>
        <div className="exampleEnd">
          <strong>{ar ? "عجبتك؟ نكتب لك وحدة مثلها." : "Like it? We will write you one."}</strong>
          <p>{PLANS_FREE
            ? (ar ? `خطة بهذا الطول سعرها ${fee} ريال، وما ناخذ عليها شي حاليًا.` : `A plan this long is SAR ${fee}, and we are not charging for plans right now.`)
            : (ar ? `خطة بهذا الطول سعرها ${fee} ريال.` : `A plan this long is SAR ${fee}.`)}</p>
          <Link href={exampleHref(locale, null, source)} className="exampleBack">{ar ? "شوف باقي الأمثلة" : "See the other examples"}</Link>
        </div>
      </div>
      <ExampleBar dir={ar ? "rtl" : "ltr"}>
        <ExampleRequestLink href={request} page={plan.slug} source={source} className="button gold">{ask}</ExampleRequestLink>
        <small>{offerLine(ar)}</small>
      </ExampleBar>
    </main>
  );
}
