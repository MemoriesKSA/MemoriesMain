// Generates a first-pass, internal-only itinerary draft for Discover Saudi
// Arabia journey requests, using only real grounded facts from
// flagship-city-data.ts. Runs in the background after the customer's
// confirmation has already been sent (see app/api/journeys/route.ts), and
// the result goes to the team only, never to the customer, a human always
// reviews and edits before anything reaches them. Also creates a draft row
// in the proposals table (see supabase-admin.ts) so the reviewer can open
// it pre-filled in /internal/journeys instead of retyping from the email,
// they still have to open it and click Publish themselves.

import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { randomBytes } from "node:crypto";
import { flagshipCityGuideBySlug, type FlagshipCityGuide } from "./flagship-city-data";
import { saudiArabia } from "./components/planner-data";
import { createSupabaseAdminClient } from "./supabase-admin";
import { splitDraftForStorage } from "./journey/parse-itinerary";

export type DraftGuideSubmission = {
  submissionId: string;
  city: string;
  purpose: string;
  travellers: string;
  travellerCount: string;
  fromDate: string;
  toDate: string;
  transport: string[];
  stays: string[];
  stayRating: string;
  planIncludes: string[];
  packageNotes: string;
  currency: string;
  budget: string;
  name: string;
  email: string;
  phone: string;
};

// Every system prompt in this file is a fixed string, the same text on
// every single call regardless of city or customer. Prompt caching writes
// it once and reads it back at roughly a tenth the input-token cost on
// every later call within the TTL, at zero behavior change, this is the
// cheapest of the cost fixes in this file, a 1-hour TTL rather than the 5-
// minute default since submissions arrive sporadically, not back to back.
function cachedSystem(text: string): Anthropic.TextBlockParam[] {
  return [{ type: "text", text, cache_control: { type: "ephemeral", ttl: "1h" } }];
}

function readable(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

function serializeGuideForDraft(guide: FlagshipCityGuide, ar: boolean): string {
  const lines: string[] = [];
  lines.push(`${ar ? "المعالم" : "Attractions"}: ${guide.attractions.map((a) => `${ar ? a.nameAr : a.nameEn} (${ar ? a.categoryAr : a.categoryEn}): ${ar ? a.descriptionAr : a.descriptionEn}`).join(" | ")}`);
  if (guide.dining.length) lines.push(`${ar ? "المطاعم" : "Dining"}: ${guide.dining.map((d) => `${ar ? d.nameAr : d.nameEn} (${ar ? d.cuisineAr : d.cuisineEn}): ${ar ? d.descriptionAr : d.descriptionEn}`).join(" | ")}`);
  const allStays = [...guide.stay, ...(guide.extendedStay ?? [])];
  if (allStays.length) lines.push(`${ar ? "الفنادق" : "Hotels"}: ${allStays.map((s) => `${ar ? s.nameAr : s.nameEn}${s.tier ? ` [${s.tier}]` : ""}: ${ar ? s.descriptionAr : s.descriptionEn}`).join(" | ")}`);
  const allProviders = [...(guide.trustedProviders ?? []), ...(guide.extendedProviders ?? [])];
  if (allProviders.length) lines.push(`${ar ? "سائقون خاصون موثوقون" : "Trusted private drivers"}: ${allProviders.map((p) => `${ar ? p.nameAr : p.nameEn} (${ar ? p.typeAr : p.typeEn}): ${ar ? p.noteAr : p.noteEn}`).join(" | ")}`);
  if (guide.sampleDay.length) lines.push(`${ar ? "نمط يوم استخدمه فريقنا من قبل" : "A sample day pattern our team has used before"}: ${guide.sampleDay.map((b) => `${ar ? b.timeAr : b.timeEn} — ${ar ? b.placeAr : b.placeEn}: ${ar ? b.descriptionAr : b.descriptionEn}`).join(" | ")}`);
  if (guide.travelTips?.length) lines.push(`${ar ? "نصائح السفر" : "Travel tips"}: ${guide.travelTips.map((t) => (ar ? t.ar : t.en)).join(" ")}`);
  return lines.join("\n");
}

function tripLength(from: string, to: string) {
  const start = new Date(`${from}T00:00:00Z`).getTime();
  const end = new Date(`${to}T00:00:00Z`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return "unspecified length";
  const nights = Math.round((end - start) / 86_400_000);
  return `${nights + 1} days / ${nights} nights`;
}

// LLMs are unreliable at computing the day of the week for an arbitrary
// date, and the draft model doing that math itself produced a real bug: a
// day header flatly labelled "Saturday" while a note elsewhere hedged the
// same date as "if this falls on Friday". Compute the real calendar here
// instead and hand it over as a fact, so there's nothing left to compute.
function dayByDayCalendar(from: string, to: string): string {
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end.getTime() < start.getTime()) return "";

  const days: string[] = [];
  const cursor = new Date(start);
  for (let dayNumber = 1; cursor.getTime() <= end.getTime() && dayNumber <= 30; dayNumber++) {
    const weekday = cursor.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
    const dateLabel = cursor.toLocaleDateString("en-US", { day: "numeric", month: "long", timeZone: "UTC" });
    days.push(`Day ${dayNumber} = ${weekday} ${dateLabel}`);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days.join(", ");
}

// English only: this is the one reasoning-and-writing pass. Arabic is never
// generated independently anymore, it's a faithful translation of exactly
// this output (see translateDraftToArabic), so it can't disagree with it
// on the hotel, the driver, the day order or anything else, there's only
// one decision-making pass to disagree with itself.
function buildSystemPrompt() {
  return `You are writing the actual travel plan a MEMORIES customer will receive, in English. Write it finished, not as a sketch for someone else to rewrite. A human reviewer checks it before it is published, but their job is to spot-check facts, not to translate your notes into customer language, so the customer-facing parts must already read as something you would be happy to send. This English draft is translated into Arabic afterward by a separate step, so make every decision here, don't leave anything for the translation to decide.

What MEMORIES actually sells, this shapes everything below: we give the customer a complete plan and the directions to act on it, and the customer books it themselves. We are not booking on their behalf. That means the specifics ARE the product, not clutter: which company, which terminal, which day, roughly what it costs, and how far ahead to book it. A plan that says "arrange a rental car" is worthless; a plan that says which company, which terminal to walk to, and roughly what it costs is the thing they are paying for.

Voice, for everything the customer reads: write directly to them as "you", warm and genuinely excited for their trip, like a well-travelled friend who has done the legwork. Never refer to the customer in the third person ("he", "the customer", "a solo traveller") in customer-facing text, you are talking TO them, not about them. Never use internal planning vocabulary at them, e.g. write "a good chance to cool off and shake off the flight" rather than "heat-avoidance day structure". Keep every practical fact exactly as precise as it is, warmth is in the phrasing, never in vagueness, and never let it soften a hedge into a promise.

Rules, factual accuracy and safety about the real companies named here matter more than anything else in this draft, a wrong claim about a real business is worse than an incomplete one:
- Only use the real, named places (attractions, dining, hotels, private drivers, rental car companies) given to you in the grounded facts or the live research notes below, both are equally real, sourced information, not a guess. Never invent a business name, address or price. If a category (e.g. restaurants) genuinely isn't covered by either, say plainly that the team should research it, don't guess, but check the research notes first, they often cover exactly this now.
- Never state or imply a specific proximity, walking distance or travel time between two named real places (e.g. a hotel and a restaurant) unless the grounded facts explicitly say so. Two places both being in the same district or area is NOT the same as being close to each other, don't write "walking distance" or "a short walk" or similar just because they share a neighbourhood, that's inventing a specific, checkable-sounding fact you don't actually have. Describe the place on its own merits and let the driver or logistics handle getting there, or say plainly the distance isn't known.
- Never upgrade a hedged claim into a flat one. If a grounded fact says something like "positioned as", "worth confirming", "said to be" or similar, carry that same hedge into your own sentence at the point you use the claim, in the same breath, not only as a caveat mentioned separately later. Never state licensing, certification, safety compliance, ratings, or "the best/top" claims as settled fact unless the grounded facts themselves state them as settled fact.
- Treat opening hours, seasonal operation and ticket pricing as always needing confirmation, unless the grounded facts or the live research notes below give a specific, current answer, in which case state it plainly without the hedge. The research notes come from an actual web search run just now, trust them the same way you trust the grounded facts; if they're inconclusive or don't cover a place, keep flagging it.
- If the research notes mention flights (which airlines serve the destination, general connection patterns like "usually via Riyadh or Jeddah"), you can state that route/airline existence plainly, it's real research, not a guess. But never state or imply a specific flight time, schedule or price, always flag actual flight booking as something the team prices separately.
- A hedge word you use anywhere in this draft (e.g. "typically", "positioned as", "worth confirming") must stay attached to that same claim EVERY time you reference it again, including in the closing "For the planner" section. Don't state something with a hedge once and then restate it as settled fact later in the same draft, that's as much a mistake as never hedging it at all.
- Assume the customer's stated total budget covers the entire trip end to end, flights, hotel, transport and activities, everything, unless the customer's own notes below explicitly say it excludes something. Build the hotel tier and everything else on that assumption and state it plainly once. Don't hedge this as "needs the customer's confirmation" unless their own notes actually created real ambiguity, that's now the default assumption, not an open question.
- The day-by-day calendar given to you in the user message states the real, correct weekday for every date in this trip, computed exactly, not a guess. Use those exact weekdays in your Day headers and anywhere else you mention a day of the week (e.g. Friday prayer timing, weekend closures). Never compute or second-guess a weekday yourself, and never contradict the calendar elsewhere in the draft, e.g. don't write "if this falls on a Friday" about a date the calendar already states is a Saturday.
- Write a day-by-day sketch matching the trip length, pace it sensibly, don't over-pack days.
- Get religious terminology exactly right, most of our customers are Muslim and a loose word here reads as not knowing the subject. The Friday midday congregational prayer is Jumu'ah, and on a Friday it replaces the ordinary Dhuhr prayer rather than sitting alongside it. So write "Friday prayer (Jumu'ah)" when you mean it, never "Friday midday prayer" or "Dhuhr on Friday", which is what someone unfamiliar with it would write and which translates badly into Arabic. The same care applies to any other religious term you use.
- Weigh the stated budget, traveller count, trip length and the customer's preferred accommodation rating (if given) when choosing between the luxury and budget-tier hotels in the grounded facts, and say which tier you picked and why, but say it once, briefly, don't re-justify it inside every day. If the customer's preferred rating and the budget point in different directions (e.g. they asked for 5-star but the budget only supports budget-tier), say so plainly as something needing the customer's input, don't silently pick one over the other.
- When the budget is what rules out a more expensive option, frame it as an upgrade they can choose, never as a limit they have hit. Lead with what their budget comfortably covers, then offer the step up as a real option with a rough figure attached so they can actually decide, e.g. "your budget covers this trip comfortably at [hotel]; if you'd rather be on the water at a five-star, that's roughly [X] more and we'll happily reprice it". Never list the specific expensive places they are not getting as things that would "consume" or "eat" their budget, that tells a paying customer they can't afford something and gives them nothing to act on.
- If the customer asked for a private driver (see requested transport), recommend one of the trusted providers listed and say why, once, briefly, carrying over any hedge from its grounded note per the rule above.
- If the customer's notes mention something specific (a hotel, dietary need, occasion), work it in.
- Booking guidance is a core part of what they are paying for, not an afterthought. For anything they have to reserve themselves, tell them what to book, where or with whom, and how far ahead. Say when something genuinely needs booking in advance to be safe (a restaurant that fills on Thursday and Friday evenings, a limited-capacity experience, a popular attraction slot) and say it in the day it matters, not only in a general note. If the grounded facts or research notes don't tell you how far ahead a specific place needs booking, say plainly that it's worth reserving ahead without inventing a number of days.
- Give them a sense of cost wherever you honestly can, since they are the ones paying at the counter. Use only figures that appear in the grounded facts or research notes, and carry the same framing the source used: a researched range stays a range, an aggregator ballpark is described as an approximate guide rather than a quote. If you have no sourced figure for something, say what it is and that pricing should be checked when booking, never estimate, never invent a number, and never present a made-up range as if it were researched. An honest "we'd suggest checking current pricing when you book" is always better than a plausible-looking invented figure.
- Practical information the customer actually needs to prepare, a required visa or permit, what to pack, dress code, prayer-time crowding, hydration, anything from the grounded facts' travel tips genuinely relevant to this trip, belongs directly in the customer-facing plan itself. Work it into the hotel/driver overview section at the top, or into the specific day it matters most, don't invent a new trailing heading for it, this draft has exactly five kinds of section (overview, "Needs the customer's input", "Team to confirm before booking", the day list, "For the planner") and nothing else, see the format rules below.

Format, follow this closely, it should read as a warm, confident plan they can act on, never as dense justification-prose:
- The hotel and car/driver picks at the top get the same short-line treatment as the days below: one short line for the pick and its tier/type, one short line for why it suits them (including any hedge from the rules above), not a single long sentence carrying three ideas at once. The "why" is written for them, what they get out of it, not a defence of the decision.
- Each day is a short header line, then 2-5 short lines under it, one stop or meal per line, time of day first. Lead with the fact (place name, what it is, when) and let a short warm clause carry why they'll enjoy it or what to expect. One clause, not a paragraph, and never at the cost of the practical detail.
- The first time, and only the first time, you name a business that isn't an obviously world-famous brand (a specific hotel chain, a specific driver company, a specific restaurant), add a 3-6 word plain-language tag in parentheses right after the name so they aren't left guessing, e.g. "ibis (budget hotel chain)", "Hello Chauffeur (Saudi private-driver service)", "Myazu (Japanese restaurant)". Every later mention of that same name in this draft, no tag, just the name.
- No throat-clearing, and no empty enthusiasm that carries no information. Warmth comes from how a real fact is phrased, not from adjectives layered on top of nothing. If a line gives them neither something to do, something to book, nor something to know, cut it.
- Everything above the two internal headings below and everything from "Day 1" through the last day is customer-facing: it gets copied straight into what the customer receives, so it must read as a finished plan, not as notes about a plan. Never write things like "team to research", "to be confirmed", "placeholder", or similar meta-commentary inside the overview or day sections, if something genuinely isn't resolved, either leave it out of the day plan entirely or flag it in the internal sections below, don't leave a visible gap-marker in the customer-facing text.
- Bigger structural notes are strictly for the internal team, never customer-relevant information (that belongs in the plan itself per the practical-information rule above), and split by who has to act, under two separate headings placed above the day list, in this order:
  - "Needs the customer's input" — only for things where the team genuinely cannot proceed without the customer answering a question first (their stated budget conflicts with their stated preferences, a real choice between two options only they can make). If nothing meets that bar, leave this heading out entirely, don't force an entry into it.
  - "Team to confirm before booking" — everything else a human should verify before this is published (a fact worth spot-checking, a hedge from the accuracy/safety rules above, something the notes left genuinely inconclusive), nothing here requires going back to the customer.
  Each item is its own short bullet line under the correct one of the two headings. Don't fold these into a day's bullet lines, and don't invent a third heading for this purpose.
- Keep both internal sections as short as the truth allows. The goal is a plan that is ready to publish with a quick human read, not one that hands a person a list of chores, so only raise something here if a human genuinely has to act on it. Never park something internally that you could simply say honestly to the customer instead: "worth checking current pricing when you book" belongs in their plan, not on the team's list.
- Plain text only, nothing else reads this before a human, so there's no reason for markdown: no "#"/"##" headings, no asterisks for bold or bullets, no numbered-list syntax. Day headers like "Day 1" are just a plain line of text, not a markdown heading. This matters mechanically, not just stylistically, a heading written as "## Day 1" instead of "Day 1" breaks the tooling that later splits this draft into what the customer sees, so a plain, exact "Day 1" is required, not a stylistic nicety.
- Exactly five kinds of section, nothing else, and nothing outside them: the overview (hotel/driver picks and anything else customer-relevant that isn't day-specific), "Needs the customer's input", "Team to confirm before booking", the day list, "For the planner". Don't add a sixth heading of your own for anything, including practical/packing information, that belongs inside the overview section per the rule above.
- End with a short "For the planner" section, plain bullet lines, internal team notes only, flagging anything uncertain, missing, or worth double-checking before this goes anywhere near the customer. Anything hedged earlier in the draft stays hedged here too, per the rule above.`;
}

function buildUserPrompt(submission: DraftGuideSubmission, cityLabel: string, groundedFacts: string, operationalResearch: string) {
  const researchSection = operationalResearch
    ? `\n\nLive research notes (gathered just now via web search, not a guess, trust these the same as the grounded facts above): hours, seasonal status and ticket pricing for the attractions, real restaurants if our own dining list was thin, real rental car companies if requested, and flight routes if requested. These may also include review scores or licensing signals for restaurants/rental cars, always keep whatever hedge the note itself uses (an attributed claim like "their website states..." stays attributed, it never becomes a flat "licensed" statement). If a place isn't covered here or the notes are inconclusive after a real search attempt, fall back to flagging it as needing confirmation, or leaving it out of the day plan rather than inventing something:\n${operationalResearch}`
    : "";
  const calendar = dayByDayCalendar(submission.fromDate, submission.toDate);
  return `Customer request summary:
Name: ${submission.name}
Destination: ${cityLabel}, Saudi Arabia
Trip dates: ${submission.fromDate} to ${submission.toDate} (${tripLength(submission.fromDate, submission.toDate)})
${calendar ? `Day-by-day calendar (correct, computed weekdays, use these exactly): ${calendar}\n` : ""}Travellers: ${readable(submission.travellers)}, ${submission.travellerCount}
Purpose / style: ${readable(submission.purpose)}
Requested transport: ${submission.transport.map(readable).join(", ") || "not specified"}
Requested stay type: ${submission.stays.map(readable).join(", ") || "not specified"}
Preferred accommodation rating: ${submission.stayRating && submission.stayRating !== "flexible" ? readable(submission.stayRating) : "flexible, no preference stated"}
Plan should include: ${submission.planIncludes.map(readable).join(", ") || "not specified"}
Total budget: ${submission.currency} ${Number(submission.budget).toLocaleString("en-US")}
Customer notes: ${submission.packageNotes || "none"}

Real, grounded facts for ${cityLabel} (only use these named places):
${groundedFacts}${researchSection}

Draft the day-by-day sketch now.`;
}

// Runs once, before the draft is written, so the draft can cite live
// findings instead of guessing. Covers hours/season/pricing for named
// attractions, which airlines/routes exist, real restaurants when our own
// curated dining list is thin, and real rental car companies when the
// customer asked for one, all of which a plain web search can genuinely
// confirm, plus review-site and official-registry trust signals for
// restaurants/rental cars (always attributed, never asserted as a verified
// fact, a web search can't independently confirm real regulatory status,
// only report what a genuine source actually says). Stays away from live
// flight times or prices, which a generic web search can't honestly
// verify, that needs a real flight-search API and isn't in scope here, see
// the flight rule below for why.
async function researchOperationalFacts(anthropic: Anthropic, guide: FlagshipCityGuide, submission: DraftGuideSubmission, cityLabelEn: string): Promise<string> {
  try {
    const attractionNames = guide.attractions.map((a) => a.nameEn).join(", ");
    if (!attractionNames) return "";

    // Always research flights and rental cars, not just when this specific
    // customer asked for one. This result gets cached per city (see
    // generateDraftGuide) and reused across every future customer for that
    // city regardless of what they personally requested, so the cached copy
    // needs to be useful to all of them, not just whoever happened to
    // trigger the cache refresh. The drafting pass still only mentions what
    // this customer actually asked for, per its own system prompt rules.
    const wantsFlights = true;
    const wantsRentalCar = true;
    const needsDining = guide.dining.length < 3;

    const flightScope = wantsFlights
      ? `\n- Which airlines fly into ${cityLabelEn}'s nearest airport, and whether international travellers typically connect through Riyadh or Jeddah first. Report airlines and general route/connection patterns only, e.g. "Saudia and flynas serve the local airport, most international arrivals connect via Riyadh (RUH)". Never state a specific flight time, schedule or price, that's not something search can honestly confirm, it changes constantly and needs an actual flight-search system, not a web search, the team prices this separately regardless of what you find here.`
      : "";
    const diningScope = needsDining
      ? `\n- A genuinely price-tier-diverse set of real, currently-operating restaurants in ${cityLabelEn} that fit a ${readable(submission.purpose)} trip: aim for at least 2 budget/cheap options, at least 2 normal/mid-range options, and 1-2 upscale/expensive options if the city genuinely has them (roughly 8-12 total, this category is worth real search budget). For each: name, cuisine, one line on what it's known for, and a rough price tier (budget / normal / upscale) based on what you find. Our own curated list has little or nothing here, so this is the primary source for dining in this draft. Run multiple differently-worded searches covering each tier, e.g. "best restaurants in ${cityLabelEn}", "cheap eats ${cityLabelEn}", "fine dining ${cityLabelEn}", and "popular places to eat near [a specific landmark from the attractions list]", well-known national chains count too, not just standalone restaurants.`
      : "";
    const rentalScope = wantsRentalCar
      ? `\n- A genuinely price-tier-diverse set of real rental car companies operating in ${cityLabelEn}: aim for at least one budget/cheap option, one normal/mid-range option, and one upscale/premium option if the city has them. Include both well-known international chains (Hertz, Budget, Avis, Sixt, Theeb, Yelo, etc., wherever they actually operate there) and real local operators, international chains are generally easier to verify as legitimate so don't skip them in favor of only obscure local names. For each: name, rough price tier, what they offer, and whatever you can genuinely find on reputation and standing (Google/Trustpilot/TripAdvisor review scores and counts, how long they've operated, whether an official Saudi tourism or transport-authority source lists them). The customer asked for a rental car and we have no rental providers in our own data. Run multiple differently-worded searches, e.g. "car rental ${cityLabelEn}", "car hire companies ${cityLabelEn} Saudi Arabia", "cheap car rental ${cityLabelEn}", and "[company name] reviews" / "[company name] trustpilot" for whichever names come up, before concluding a tier or a reputation signal isn't findable.`
      : "";

    const response = await anthropic.messages.create({
      model: "claude-opus-5",
      max_tokens: 6000,
      thinking: { type: "adaptive" },
      output_config: { effort: "high" },
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 35 }],
      system: `You are a research assistant checking current, real-world facts for an internal Saudi Arabia trip-planning team, for ${cityLabelEn}. You have web search, use it properly and thoroughly, this team is relying on you to actually find things, not to give up after one query and call everything unconfirmed. Restaurants and rental cars in particular are extremely findable in any real Saudi city with an ordinary web search, so a "nothing found" report on either is far more likely to mean the search wasn't tried hard enough than that nothing exists, don't let that happen. Budget is generous here, spend it, depth and coverage matter more than finishing quickly.

Scope, stay inside it. Do the categories below in this order, so the ones most likely to otherwise get shortchanged are covered first:${diningScope}${rentalScope}
- Opening hours, seasonal operating status (open or closed for the trip's dates) and ticket pricing, for the attractions listed below. If a place turns out to be a free, unticketed public site with no formal opening hours (a public trail, a mountain, an outdoor landmark), report that plainly and confidently, e.g. "freely accessible, no tickets or set hours, best done in early morning before the heat", that IS a real, useful finding, don't leave it as "unconfirmed" just because there's no ticket office to look up.${flightScope}
- For restaurants and rental cars specifically, also look for real third-party trust signals: review sites (Google reviews, Trustpilot, TripAdvisor - report the score and how many ratings it's based on), and any official government source (Saudi Ministry of Tourism, Ministry of Transport / general transport authority licensed-operator listings, municipal directories). A company genuinely appearing on an official government registry is a verifiable finding, report it plainly with the source named, e.g. "listed on [authority]'s registered operator directory". A company's own website or marketing merely claiming to be "licensed" or "certified" is NOT independently verified by that, report that only as an attributed, hedged claim, e.g. "their website states they're licensed by [X]", never as a confirmed fact and never as your own assessment, you cannot personally verify regulatory status, only report what a genuine source actually says. If you find nothing on licensing or reviews for a company after a real attempt, don't guess or imply anything, just leave that part out for that company, an unknown quantity is not the same as "unsafe", say only what you actually found.
- For the attractions: only spend search budget where the answer could plausibly change with the season or over time, a fixed historic site's opening hours barely matter, a seasonal park or festival venue does. Check the most likely-to-be-seasonal or newly-opened places first, in case you run low on search budget before finishing everything.
- Report only what you actually find, with enough detail a planner could act on. If search genuinely turns up nothing conclusive after a real attempt for a place, say so plainly in one line for that place, don't guess or extrapolate, but don't give up after a single search either, try more than one query before concluding something isn't findable.
- If you run out of search budget partway through, report everything you DID find for what you finished checking, then list the rest as "not checked, ran out of search budget". Never discard partial findings and report a blanket failure for everything, half real findings is much more useful to the team than nothing.
- Output short plain-text lines, no markdown, no preamble, no closing summary. Group under short plain headers if that helps (e.g. "Attractions:", "Restaurants:", "Rental cars:").`,
      messages: [{
        role: "user",
        content: `Trip dates: ${submission.fromDate} to ${submission.toDate}\nTrip purpose/style: ${readable(submission.purpose)}\nAttractions to check: ${attractionNames}${needsDining ? `\nAlso find real restaurants, our curated list is thin for this city.` : ""}${wantsRentalCar ? `\nAlso find real rental car companies, the customer requested one.` : ""}${wantsFlights ? `\nAlso check general airline/route info for reaching ${cityLabelEn} (no times or prices).` : ""}\n\nSearch and report now.`,
      }],
    });

    // A web-search turn comes back as many short text blocks interleaved
    // with the search calls themselves (one burst of prose between each
    // search), not one final block. Taking only the last one, as this used
    // to, silently threw away everything the model found and reported
    // before its final sentence, which in practice was most of it,
    // including entire categories like restaurants and rental cars.
    const textBlocks = response.content.filter((block): block is Anthropic.TextBlock => block.type === "text");
    return textBlocks.map((block) => block.text).join("\n").trim();
  } catch (error) {
    console.error("Operational research failed", error);
    return "";
  }
}

async function generateEnglishDraft(anthropic: Anthropic, submission: DraftGuideSubmission, cityLabelEn: string, groundedFactsEn: string, operationalResearch: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-opus-5",
    max_tokens: 6000,
    thinking: { type: "adaptive" },
    // "high" effort was pushing a single call's reasoning time past the
    // function's own timeout even after parallelizing (parallelism is
    // gone now, see translateDraftToArabic, but medium is still the right
    // speed/quality balance for the one drafting pass that remains).
    output_config: { effort: "medium" },
    system: cachedSystem(buildSystemPrompt()),
    messages: [{ role: "user", content: buildUserPrompt(submission, cityLabelEn, groundedFactsEn, operationalResearch) }],
  });
  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
  return textBlock?.text?.trim() ?? "";
}

// Deliberately NOT a second drafting pass: this only translates the exact
// English draft already produced, it does not re-derive the hotel, the
// driver, the day order or anything else. That's what makes it impossible
// for Arabic to disagree with English on a decision, there's only one
// decision-making step in the whole pipeline.
function buildTranslationSystemPrompt() {
  return `You are translating an already-finished internal itinerary draft from English into Arabic, for the same MEMORIES planning team. This is NOT a message to the customer, same internal-only rules apply.

Your only job is faithful translation, not re-drafting:
- Same hotel pick, same driver pick, same day count, same day order, same activity or meal on each day as the English original. Never swap which day something happens on, never substitute a different hotel, driver, restaurant or attraction than the one named in the English draft, never reorder the days.
- For every named place (hotel, driver, attraction, restaurant) mentioned, use its exact Arabic name from the grounded facts given to you below, matched to the English name used in the draft. Never invent an Arabic name that contradicts the grounded facts. If a business genuinely has no Arabic name anywhere in the grounded facts, transliterate it into Arabic script the way it is normally said aloud in Saudi Arabia, and do it for every such name, don't transliterate some and leave others in Latin letters in the middle of an Arabic sentence, that inconsistency is what makes a page look machine-made.
- Religious terms must be exactly right for a Muslim reader. The Friday congregational prayer is صلاة الجمعة, and on a Friday it takes the place of صلاة الظهر, so never write صلاة الظهر for it even if the English says something loose like "Friday midday prayer". Translate the meaning correctly, not the English word by word.
- Preserve every hedge exactly in strength. If the English says "typically", "positioned as", "worth confirming", "not verified" or similar, translate that same level of uncertainty in the same place. Don't upgrade a hedge into a confident statement, and don't add a hedge that wasn't in the English.
- Keep the same section headings: "Needs the customer's input" becomes "يحتاج إلى رأي العميل", "Team to confirm before booking" becomes "على الفريق تأكيده قبل الحجز", "For the planner" becomes "للمخطط". Keep whichever of the two decision headings the English draft actually used, in the same order, don't add one that isn't there.
- Translate the day headers into Arabic: "Day 1" becomes "اليوم 1", "Day 2" becomes "اليوم 2", and so on, same numbering and order as the English. Use Western digits (1, 2, 3). This is a customer-facing Arabic document, so no English may survive in it: a day referred to mid-sentence ("missed on Day 2") becomes "اليوم 2" there too. The only English that may remain anywhere is a business's own name where it genuinely has no Arabic form in the grounded facts.
- Plain text only, no markdown: no "#"/"##" headings, no asterisks, no numbered-list syntax, even if the English draft you're translating slipped and used some, translate it back to plain text, don't carry the markdown over. This doesn't need to be robotically literal, natural and fluent is good, but every fact, decision and hedge must match the English exactly.`;
}

function buildTranslationUserPrompt(englishDraft: string, groundedFactsAr: string) {
  return `Grounded facts in Arabic (use these exact Arabic names for the real places named in the draft below, matching them to their English names):
${groundedFactsAr}

English draft to translate faithfully into Arabic, same structure, same decisions, same hedges, nothing re-derived:
${englishDraft}

Translate now.`;
}

async function translateDraftToArabic(anthropic: Anthropic, englishDraft: string, groundedFactsAr: string): Promise<string> {
  if (!englishDraft) return "";
  try {
    const response = await anthropic.messages.create({
      // KEEP THIS ON OPUS. Sonnet was measured on a real draft here and
      // failed twice in one sample. It translated the "Day 1" header into
      // "اليوم 1", which stops matching DAY_HEADING in
      // journey/parse-itinerary.ts, so every Arabic itinerary silently
      // loses its day-card layout and renders as one raw block. It also
      // downgraded صلاة الجمعة (Jumu'ah) to صلاة الظهر, which is wrong:
      // Jumu'ah replaces Dhuhr on a Friday, they aren't interchangeable,
      // and getting that wrong in Arabic copy for Muslim customers reads
      // as not knowing the subject. The self-check pass below runs on
      // Sonnet, that one is fine, this one is not.
      model: "claude-opus-5",
      max_tokens: 6000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: cachedSystem(buildTranslationSystemPrompt()),
      messages: [{ role: "user", content: buildTranslationUserPrompt(englishDraft, groundedFactsAr) }],
    });
    const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
    return textBlock?.text?.trim() ?? "";
  } catch (error) {
    console.error("Arabic translation failed", error);
    return "";
  }
}

// A second, independent AI pass over the finished draft (and its
// translation), checking them against the same grounded facts before a
// human ever sees them. This tightens the draft the reviewer receives, it
// does NOT replace the reviewer, nothing here ever publishes to a
// customer on its own.
function buildSelfCheckSystemPrompt() {
  return `You are doing an independent second-pass accuracy check on an internal draft itinerary before a human reviewer sees it. The Arabic version below is meant to be a faithful translation of the English, not an independent draft, read with fresh eyes, skeptical of anything that isn't clearly sourced.

Check for, and only for:
- Any specific claim in the draft (hotel name, driver name, price, hours, licensing/certification, rating, "the best/top") that does NOT trace back to the grounded facts or research notes below, that's likely invented and must be flagged.
- Any claim the grounded facts or research notes hedged ("positioned as", "worth confirming", "said to be", inconclusive) but the draft states flatly, dropping the hedge, anywhere in the draft including its own closing section.
- Any way the Arabic translation actually disagrees with the English, a different hotel or driver named, a different day order, a place appearing on a different day, a flag present in one but not the other. Minor phrasing or word-order differences don't count, only substantive disagreements a translation should never have introduced.

Output format: if you find genuine issues, a short plain-text bullet list, one line each, specific enough the reviewer can act on it. If you find nothing wrong, output exactly this line and nothing else: "No issues found, the translation is faithful and both are consistent with the grounded facts and research notes." Don't manufacture issues to seem thorough, only flag real problems you can point to.`;
}

async function selfCheckDraft(anthropic: Anthropic, englishDraft: string, arabicDraft: string, groundedFactsEn: string, groundedFactsAr: string, operationalResearch: string): Promise<string> {
  try {
    if (!englishDraft && !arabicDraft) return "";

    const response = await anthropic.messages.create({
      // Sonnet rather than Opus here, measured on a real stored draft: it
      // runs about 3x faster at roughly half the cost, and on the sample
      // tested it caught the highest-stakes issue Opus actually missed (a
      // driver company's hedged "worth confirming current licensing"
      // restated flatly as "licensed"). Opus flags more invented specifics,
      // so this trades a little recall for speed and cost. Safe trade only
      // because this pass advises the human reviewer, it never gates
      // publishing, so a missed flag costs a reviewer a second look rather
      // than reaching a customer.
      model: "claude-sonnet-5",
      max_tokens: 1200,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: cachedSystem(buildSelfCheckSystemPrompt()),
      messages: [{
        role: "user",
        content: `GROUNDED FACTS (English):\n${groundedFactsEn}\n\nGROUNDED FACTS (Arabic):\n${groundedFactsAr}\n\nOPERATIONAL RESEARCH NOTES:\n${operationalResearch || "none gathered"}\n\nENGLISH DRAFT (the source):\n${englishDraft || "(empty, generation failed)"}\n\nARABIC DRAFT (should be a faithful translation of the above):\n${arabicDraft || "(empty, translation failed)"}\n\nCheck now.`,
      }],
    });

    const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
    return textBlock?.text?.trim() ?? "";
  } catch (error) {
    console.error("Draft self-check failed", error);
    return "";
  }
}

function wrapEmailHtml(reference: string, cityLabel: string, customerName: string, englishDraft: string, arabicDraft: string, selfCheck: string, proposalUrl: string | null) {
  const englishHtml = escapeHtml(englishDraft).replace(/\n/g, "<br />");
  const arabicSection = arabicDraft
    ? `<div style="border-top:2px solid #e2e6e1;margin-top:22px;padding-top:22px" dir="rtl"><p style="margin:0 0 14px;color:#ba8427;font-size:11px;font-weight:800;letter-spacing:1.5px">النسخة العربية</p><div style="font-size:14px;line-height:1.9">${escapeHtml(arabicDraft).replace(/\n/g, "<br />")}</div></div>`
    : "";
  const isClean = /^no issues found/i.test(selfCheck.trim());
  const selfCheckSection = selfCheck
    ? `<div style="margin:0 30px 24px;padding:16px 18px;border-radius:12px;border:1px solid ${isClean ? "#cfe3da" : "#f0c987"};background:${isClean ? "#f2f8f5" : "#fdf6e8"}"><p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:1px;color:${isClean ? "#2f7a5c" : "#a9750f"}">AI SELF-CHECK, SECOND PASS</p><div style="font-size:13px;line-height:1.7;color:#123c35;white-space:pre-wrap">${escapeHtml(selfCheck)}</div></div>`
    : "";
  const proposalSection = proposalUrl
    ? `<div style="margin:0 30px 24px"><a href="${proposalUrl}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#063b34;color:#fff;text-decoration:none;font-weight:700;font-size:13px">Open this draft in the reviewer tool →</a><p style="margin:8px 0 0;font-size:12px;color:#6a746f">Already saved as a draft proposal, pre-filled from this sketch. Nothing is sent to the customer until you edit and publish it there.</p></div>`
    : "";
  return `<div style="margin:0;background:#eef2ee;padding:24px;font-family:Arial,sans-serif;color:#123c35"><div style="max-width:720px;margin:auto;overflow:hidden;border:1px solid #dce3de;border-radius:20px;background:#fff;box-shadow:0 14px 40px rgba(9,50,43,.08)"><div style="padding:24px 30px;background:#063b34;color:#fff"><p style="margin:0 0 8px;color:#e7b94f;font-size:11px;font-weight:800;letter-spacing:2px">MEMORIES · AI DRAFT ITINERARY, INTERNAL ONLY · مسودة داخلية</p><h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:600">A first-pass sketch for ${escapeHtml(customerName)}'s ${escapeHtml(cityLabel)} trip</h1><p style="margin:9px 0 0;color:#b9cbc6;font-size:13px">Reference ${escapeHtml(reference)} · review and edit before this shapes anything sent to the customer</p></div><div style="padding:24px 0 4px">${proposalSection}${selfCheckSection}</div><div style="padding:0 30px 28px;font-size:14px;line-height:1.7">${englishHtml}${arabicSection}</div></div></div>`;
}

// City-level research cache: opening hours, ticket prices, restaurants and
// rental car companies barely change week to week, so re-researching them
// from scratch on every single customer submission for the same city was
// mostly wasted spend, this was the single biggest cost driver in the whole
// pipeline. Cached per city, refreshed after RESEARCH_CACHE_TTL_DAYS.
// Trade-off, accepted deliberately: a cached entry can be slightly stale on
// trip-date-specific seasonal findings if a later customer's dates differ
// from whoever triggered the cache refresh. That's fine here because the
// reviewer already double-checks hours/season/pricing before anything
// reaches a customer (see the "Team to confirm before booking" section),
// research findings were never treated as gospel, just a strong first pass.
const RESEARCH_CACHE_TTL_DAYS = 7;

// Returns whatever is cached along with whether it's past the TTL, rather
// than throwing away an expired entry outright. An expired entry is still
// real research that a human reviewer will verify anyway, so it beats
// sending the drafting pass in with nothing at all when a live refresh
// isn't possible, see the fallback in generateDraftGuide.
//
// Curated entries (hand-researched and verified, see the curated column
// migration) never go stale on a timer, so the automated pass never
// overwrites them. They're refreshed deliberately instead.
type CachedResearch = { notes: string; stale: boolean };

async function getCachedResearch(supabase: ReturnType<typeof createSupabaseAdminClient>, citySlug: string): Promise<CachedResearch | null> {
  try {
    const { data } = await supabase.from("city_research_cache").select("research_notes, updated_at, curated").eq("city_slug", citySlug).single();
    if (!data?.research_notes) return null;
    if (data.curated) return { notes: data.research_notes, stale: false };
    const ageMs = Date.now() - new Date(data.updated_at).getTime();
    return { notes: data.research_notes, stale: ageMs > RESEARCH_CACHE_TTL_DAYS * 86_400_000 };
  } catch {
    return null;
  }
}

async function cacheResearch(supabase: ReturnType<typeof createSupabaseAdminClient>, citySlug: string, notes: string): Promise<void> {
  if (!notes) return;
  try {
    // Never let the automated pass overwrite a hand-verified entry. In the
    // normal flow it can't reach here for a curated city (those never go
    // stale, so research never runs), this is the guard for anything that
    // calls in outside that flow.
    const { data: existing } = await supabase.from("city_research_cache").select("curated").eq("city_slug", citySlug).single();
    if (existing?.curated) return;
    await supabase.from("city_research_cache").upsert({ city_slug: citySlug, research_notes: notes, updated_at: new Date().toISOString(), curated: false });
  } catch (error) {
    console.error("Caching research failed", error);
  }
}

// Fire-and-forget: call from app/api/journeys/route.ts inside after(), never
// awaited by the customer-facing response. Swallows its own errors, a
// failed draft should never surface anywhere or block anything.
export async function generateDraftGuide(submission: DraftGuideSubmission): Promise<void> {
  try {
    // These early returns used to be completely silent, which made a missing
    // key look identical to "the AI draft feature is broken", with nothing in
    // the logs either way. Say why we stopped, every time.
    const guide = flagshipCityGuideBySlug("saudi-arabia", submission.city);
    if (!guide) {
      console.error(`Draft skipped for ${submission.submissionId}: no flagship city data for "${submission.city}"`);
      return;
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    if (!anthropicKey || !resendKey) {
      console.error(`Draft skipped for ${submission.submissionId}: missing ${!anthropicKey ? "ANTHROPIC_API_KEY" : ""}${!anthropicKey && !resendKey ? " and " : ""}${!resendKey ? "RESEND_API_KEY" : ""}`);
      return;
    }

    const cityOption = saudiArabia.cities.find((c) => c.value === submission.city);
    const cityLabelEn = cityOption?.en ?? readable(submission.city);
    const cityLabelAr = cityOption?.ar ?? cityLabelEn;
    const reference = submission.submissionId.slice(0, 8).toUpperCase();

    // The API genuinely returns 529 "Overloaded" from time to time, and it
    // cost us a real draft on a live Jeddah request: the SDK's default 2
    // retries ran out while Anthropic was saturated, and the team got
    // nothing at all. Nothing is billed for a failed call, so retrying
    // harder is free, and the whole thing runs in the background where
    // taking an extra minute costs nobody anything.
    const anthropic = new Anthropic({ apiKey: anthropicKey, maxRetries: 6 });
    const groundedFactsEn = serializeGuideForDraft(guide, false);
    const groundedFactsAr = serializeGuideForDraft(guide, true);

    const supabaseReady = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    const supabase = supabaseReady ? createSupabaseAdminClient() : null;

    // Sequential on purpose: research grounds the one drafting pass, the
    // translation only exists once English is final, self-check only
    // means something once both are final. Parallelizing English/Arabic
    // (the old approach) was exactly what let them disagree.
    const cached = supabase ? await getCachedResearch(supabase, submission.city) : null;
    let operationalResearch = cached && !cached.stale ? cached.notes : "";
    if (!operationalResearch) {
      const freshResearch = await researchOperationalFacts(anthropic, guide, submission, cityLabelEn);
      if (freshResearch) {
        operationalResearch = freshResearch;
        if (supabase) await cacheResearch(supabase, submission.city, freshResearch);
      } else if (cached) {
        // Live research failed (API error, out of credits, timeout) and the
        // cached copy is past its TTL. Use it anyway: slightly-dated real
        // findings still beat drafting with none, which is what used to
        // happen here, and the reviewer verifies hours/pricing regardless.
        operationalResearch = cached.notes;
      }
    }
    const englishDraft = await generateEnglishDraft(anthropic, submission, cityLabelEn, groundedFactsEn, operationalResearch);
    if (!englishDraft) return;
    const arabicDraft = await translateDraftToArabic(anthropic, englishDraft, groundedFactsAr);
    const selfCheck = await selfCheckDraft(anthropic, englishDraft, arabicDraft, groundedFactsEn, groundedFactsAr, operationalResearch);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    let proposalUrl: string | null = null;

    // Best-effort: a failure here should never stop the email from going
    // out, the reviewer can still work from the email content alone if
    // this doesn't succeed for some reason.
    try {
      if (supabase) {
        const publicToken = randomBytes(24).toString("hex");

        // The full drafts (still used for the reviewer email above) mix
        // customer-facing plan with internal-only "Needs a decision" / "For
        // the planner" sections. Split those apart here: only the
        // customer-facing half goes into itinerary_en/itinerary_ar, which
        // the customer's own page renders verbatim once published, the
        // internal half goes into notes instead, alongside the self-check.
        const englishSplit = splitDraftForStorage(englishDraft);
        const arabicSplit = arabicDraft ? splitDraftForStorage(arabicDraft) : null;
        const internalNotesParts = [
          selfCheck ? `AI self-check (read before publishing):\n${selfCheck}` : "",
          englishSplit.internalOnly ? `Internal planning notes, English:\n${englishSplit.internalOnly}` : "",
          arabicSplit?.internalOnly ? `Internal planning notes, Arabic:\n${arabicSplit.internalOnly}` : "",
        ].filter(Boolean);
        const notes = internalNotesParts.length ? internalNotesParts.join("\n\n") : null;

        const { data, error } = await supabase
          .from("proposals")
          .insert({
            reference,
            public_token: publicToken,
            status: "draft",
            customer_name: submission.name,
            customer_email: submission.email,
            customer_phone: submission.phone || null,
            city: cityLabelEn,
            from_date: submission.fromDate || null,
            to_date: submission.toDate || null,
            currency: submission.currency || "SAR",
            itinerary_en: englishSplit.customerFacing || englishDraft,
            itinerary_ar: arabicSplit?.customerFacing || arabicDraft || null,
            notes,
          })
          .select("id")
          .single();

        if (error) console.error("Auto-create proposal failed", error.message);
        else if (data) proposalUrl = `${siteUrl}/internal/journeys/${data.id}`;
      }
    } catch (error) {
      console.error("Auto-create proposal failed", error);
    }

    const resend = new Resend(resendKey);
    const reviewEmail = process.env.JOURNEY_REVIEW_EMAIL ?? "memoriesksasupport@gmail.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "MEMORIES Journeys <journeys@send.memories.tours>";

    const result = await resend.emails.send({
      from: fromEmail,
      to: [reviewEmail],
      subject: `[AI DRAFT] ${reference} | ${cityLabelEn} itinerary sketch`,
      html: wrapEmailHtml(reference, cityLabelEn, submission.name, englishDraft, arabicDraft, selfCheck, proposalUrl),
      text: [proposalUrl ? `Open in reviewer tool: ${proposalUrl}` : "", selfCheck ? `AI SELF-CHECK:\n${selfCheck}` : "", englishDraft, arabicDraft].filter(Boolean).join("\n\n===\n\n"),
      tags: [{ name: "email_type", value: "draft_guide" }],
    }, { idempotencyKey: `draft-guide/${submission.submissionId}` });

    if (result.error) console.error("Draft guide email failed", result.error.name);
  } catch (error) {
    console.error("Draft guide generation failed", error);
    // Tell the team the draft isn't coming. Silently swallowing this meant a
    // failed draft was indistinguishable from a customer who simply hadn't
    // submitted yet, so nobody knew to pick the request up by hand. The
    // customer is unaffected either way, they already have their
    // confirmation and never see the draft.
    await notifyDraftFailed(submission, error).catch(() => {});
  }
}

// Deliberately plain and dependency-light: this runs when something has
// already gone wrong, so it should have as little left to go wrong as
// possible.
async function notifyDraftFailed(submission: DraftGuideSubmission, error: unknown): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  const reference = submission.submissionId.slice(0, 8).toUpperCase();
  const cityLabel = saudiArabia.cities.find((c) => c.value === submission.city)?.en ?? readable(submission.city);
  const status = (error as { status?: number })?.status;
  const overloaded = status === 529 || status === 429;
  const reason = overloaded
    ? "Anthropic's API was overloaded and did not recover after retries. This is temporary and on their side, nothing is wrong with the request itself."
    : `The draft step failed with: ${escapeHtml(String((error as Error)?.message ?? error)).slice(0, 300)}`;

  await new Resend(resendKey).emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "MEMORIES Journeys <journeys@send.memories.tours>",
    to: [process.env.JOURNEY_REVIEW_EMAIL ?? "memoriesksasupport@gmail.com"],
    subject: `[AI DRAFT FAILED] ${reference} | ${cityLabel} | plan this one by hand`,
    html: `<div style="margin:0;background:#eef2ee;padding:24px;font-family:Arial,sans-serif;color:#123c35"><div style="max-width:620px;margin:auto;border:1px solid #dce3de;border-radius:18px;background:#fff;overflow:hidden"><div style="padding:22px 26px;background:#7c2d20;color:#fff"><p style="margin:0 0 6px;color:#f3c9a6;font-size:11px;font-weight:800;letter-spacing:2px">MEMORIES · AI DRAFT DID NOT GENERATE</p><h1 style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:600">${escapeHtml(submission.name)}'s ${escapeHtml(cityLabel)} request needs manual planning</h1></div><div style="padding:22px 26px;font-size:14px;line-height:1.7"><p style="margin:0 0 14px">Reference <strong>${escapeHtml(reference)}</strong>. The customer's confirmation was sent normally and they are not affected, but no AI draft or draft proposal was created for this one.</p><p style="margin:0 0 14px;padding:12px 14px;border-radius:9px;background:#fdf6e8;border:1px solid #f0c987">${reason}</p><p style="margin:0;color:#66736f;font-size:13px">The original request details are in the [NEW] email for ${escapeHtml(reference)}. Re-submitting the same form would generate a fresh draft if you want to try again.</p></div></div></div>`,
    text: `AI DRAFT FAILED for ${reference} (${cityLabel}, ${submission.name}). No draft or proposal was created; plan this one by hand. The customer is unaffected. Reason: ${reason}`,
    tags: [{ name: "email_type", value: "draft_failed" }],
  }, { idempotencyKey: `draft-failed/${submission.submissionId}` });
}
