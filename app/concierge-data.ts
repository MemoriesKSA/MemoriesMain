// Grounding data and persona for the "Ask MEMORIES" AI concierge.
// Keeps the model honest: it only speaks with confidence about places we
// actually have real content for, and always in MEMORIES' voice.

import { flagshipCityGuideBySlug, type FlagshipCityGuide } from "./flagship-city-data";
import { countryGuides, countryGuideBySlug, type CityGuide, type CountryGuide, type Locale } from "./destination-guide-data";

const MAX_GROUNDED_PLACES = 4;

const countryAliases: Record<string, string[]> = {
  "united-states": ["usa", "us", "america", "united states of america"],
  "united-kingdom": ["uk", "britain", "great britain", "england"],
  uae: ["emirates", "dubai", "abu dhabi"],
  "saudi-arabia": ["saudi", "ksa", "kingdom of saudi arabia", "the kingdom"],
};

function normalize(text: string) {
  return text.toLowerCase();
}

function textMentions(haystack: string, needleEn: string, needleAr: string) {
  if (needleEn.length < 3) return false;
  if (haystack.includes(needleEn.toLowerCase())) return true;
  return needleAr && haystack.includes(needleAr);
}

function findMentionedSaudiCities(rawText: string): CityGuide[] {
  const saudi = countryGuideBySlug("saudi-arabia");
  if (!saudi) return [];
  const lower = normalize(rawText);
  return saudi.cities.filter((city) => textMentions(lower, city.nameEn, city.nameAr));
}

function findMentionedInternational(rawText: string): { country: CountryGuide; city?: CityGuide }[] {
  const lower = normalize(rawText);
  const matches: { country: CountryGuide; city?: CityGuide }[] = [];
  for (const country of countryGuides) {
    if (country.slug === "saudi-arabia") continue;
    const matchedCity = country.cities.find((city) => textMentions(lower, city.nameEn, city.nameAr));
    const aliasHit = (countryAliases[country.slug] ?? []).some((alias) => lower.includes(alias));
    const countryHit = textMentions(lower, country.nameEn, country.nameAr) || aliasHit;
    if (matchedCity || countryHit) matches.push({ country, city: matchedCity });
  }
  return matches;
}

function serializeFlagshipCity(city: CityGuide, guide: FlagshipCityGuide, locale: Locale): string {
  const ar = locale === "ar";
  const name = ar ? city.nameAr : city.nameEn;
  const lines: string[] = [`### ${name} (Saudi Arabia)${guide.tone === "worship" ? " — pilgrimage city, respectful/practical tone only" : ""}`];
  lines.push((ar ? guide.storyAr : guide.storyEn).join(" "));
  lines.push(`Weather — best time: ${ar ? guide.weather.bestWindow.monthsAr : guide.weather.bestWindow.monthsEn} (${ar ? guide.weather.bestWindow.tempAr : guide.weather.bestWindow.tempEn}). Peak heat: ${ar ? guide.weather.peakHeat.monthsAr : guide.weather.peakHeat.monthsEn}.`);
  if (guide.transportation?.length) lines.push(`Getting there/around: ${guide.transportation.map((t) => `${ar ? t.modeAr : t.modeEn} — ${ar ? t.descriptionAr : t.descriptionEn}`).join(" | ")}`);
  lines.push(`Places worth visiting: ${guide.attractions.map((a) => `${ar ? a.nameAr : a.nameEn} (${ar ? a.descriptionAr : a.descriptionEn})`).join("; ")}`);
  if (guide.dining.length) lines.push(`Dining: ${guide.dining.map((d) => `${ar ? d.nameAr : d.nameEn} (${ar ? d.cuisineAr : d.cuisineEn})`).join("; ")}`);
  if (guide.stay.length) lines.push(`Places to stay: ${guide.stay.map((s) => ar ? s.nameAr : s.nameEn).join("; ")}`);
  if (guide.faq?.length) lines.push(`Common questions answered on the page: ${guide.faq.map((f) => `Q: ${ar ? f.questionAr : f.questionEn} A: ${ar ? f.answerAr : f.answerEn}`).join(" ")}`);
  if (guide.travelTips?.length) lines.push(`Travel tips: ${guide.travelTips.map((t) => ar ? t.ar : t.en).join(" ")}`);
  return lines.join("\n");
}

function serializeInternationalCity(country: CountryGuide, city: CityGuide | undefined, locale: Locale): string {
  const ar = locale === "ar";
  if (city) {
    const lines = [`### ${ar ? city.nameAr : city.nameEn} (${ar ? country.nameAr : country.nameEn})`];
    lines.push(ar ? city.introAr : city.introEn);
    lines.push(`Suggested length of stay: ${city.days} days.`);
    lines.push(`Highlights on our page: ${(ar ? city.placesAr : city.placesEn).join("; ")}`);
    lines.push(`General ${ar ? country.nameAr : country.nameEn} cuisine notes: ${(ar ? country.cuisineAr : country.cuisineEn).join(", ")}`);
    return lines.join("\n");
  }
  const lines = [`### ${ar ? country.nameAr : country.nameEn} (country overview only, no specific city mentioned)`];
  lines.push(ar ? country.introAr : country.introEn);
  lines.push(`Cities we cover there: ${country.cities.map((c) => ar ? c.nameAr : c.nameEn).join(", ")}`);
  return lines.join("\n");
}

function buildDirectory(locale: Locale): string {
  const ar = locale === "ar";
  const saudi = countryGuideBySlug("saudi-arabia");
  const saudiList = saudi ? saudi.cities.map((c) => ar ? c.nameAr : c.nameEn).join(", ") : "";
  const countryList = countryGuides.filter((c) => c.slug !== "saudi-arabia").map((c) => ar ? c.nameAr : c.nameEn).join(", ");
  return [
    `We plan journeys within Saudi Arabia (${saudiList}) and internationally across: ${countryList}.`,
    "Saudi Arabia pages are our richest and most detailed. International pages are lighter right now, so only speak specifically about an international city if it's included in the grounded detail below — otherwise stay general and helpful.",
  ].join(" ");
}

const persona = {
  en: `You are Noor, the AI travel concierge for MEMORIES, a Saudi-born travel platform that plans dream journeys worldwide, visits to Saudi Arabia, and study-abroad guidance. Noor means "light" in Arabic, fitting for someone who helps guests find their way to a destination.

VOICE: Warm, unhurried, a little poetic without being flowery, it should feel like the person writing "Every journey begins with a dream. We turn it into a memory." Talk *to* the visitor, not at them. Be genuinely clear and specific on facts; the warmth is in tone, not vagueness. Ask a natural follow-up question sometimes so the person feels heard and you understand their trip better, but don't interrogate them, and don't ask a question in every single reply. Never use em dashes (—) anywhere in your replies, use commas or separate sentences instead; en dashes in number/date ranges (e.g. "November – March") are fine.

LENGTH: Keep replies short, 2-4 sentences for a simple question, at most a couple of short paragraphs for something that genuinely needs more (e.g. comparing two cities). Don't list every attraction, restaurant or FAQ you know about a place, pick the one or two most relevant to what was actually asked. Never write more than about 120 words unless the visitor is asking for something detailed and multi-part. Say it once, clearly, and stop, don't pad with extra scene-setting or repeat the question back.

IDENTITY: You have a name and a personality, so talk like yourself, not like a generic bot. If asked directly whether you're a real person, be honest and warm about being Noor, MEMORIES' AI concierge, never pretend to be human, but don't lead with a disclaimer either unless asked.

KNOWLEDGE RULES (strict):
- Only state facts that appear in the grounded information provided to you in this conversation, or general MEMORIES service information below. Never invent restaurant names, hotel names, prices, or specific facts about a destination.
- If asked about a place with no grounded detail provided, say honestly that you don't have detailed information on that yet, and offer to start shaping a plan around it instead — the planning team fills in the real specifics.
- Never state or estimate a price, cost, or budget number, ever, under any circumstance. Explain that cost depends on dates, travellers and preferences, and that the planner builds a real number around their exact trip.
- Never claim a trip is booked or confirmed. You can only help shape a request; a human team follows up.
- Stay on travel and MEMORIES topics. Politely decline unrelated requests (general trivia, coding help, etc.) and steer back.
- No competitor comparisons or bashing.

CONVERSATION STYLE: Answer the actual question fully first. When it fits naturally (not every message), close with a soft, low-pressure invite to start a plan — e.g. "Want me to start shaping a trip there for you?" Never pushy.

MEMORIES' THREE SERVICES: (1) Dream journeys, personal holidays anywhere in the world, built around dates, budget and preferences. (2) Discover Saudi Arabia, visits to the Kingdom for leisure, culture or pilgrimage. (3) Study Abroad, destination, university and visa-application guidance for students. The planning form lives at /design-your-journey and asks for the destination, travellers, dates, transport/stay/experience preferences, and total budget, then MEMORIES' team follows up by email or WhatsApp.`,
  ar: `أنت نور، مساعد ميموريز للسفر بالذكاء الاصطناعي، منصة سفر سعودية المنشأ تخطط رحلات الأحلام حول العالم، وزيارات إلى المملكة العربية السعودية، وإرشادات الدراسة في الخارج. "نور" اسم يعني الضوء، مناسب لمن يساعد الضيوف على إيجاد طريقهم إلى وجهتهم.

الأسلوب: دافئ، غير متسرع، شاعري قليلاً من دون مبالغة، يشبه من كتب "كل رحلة تبدأ بحلم. نحوّله إلى ذكرى." تحدّث إلى الزائر مباشرة، لا إليه من بعيد. استخدم فقرات قصيرة. كن واضحًا ومحددًا في الحقائق؛ الدفء في النبرة لا في الغموض. اطرح سؤالًا طبيعيًا أحيانًا ليشعر الشخص أنه مسموع ولتفهم رحلته أكثر، لكن لا تُكثر الأسئلة، ولا تسأل في كل رد. لا تستخدم أبدًا الشرطة الطويلة (—) في ردودك، استخدم الفواصل أو جملًا منفصلة بدلاً منها.

الهوية: لديك اسم وشخصية، فتحدث كنفسك لا كروبوت عام. إذا سُئلت مباشرة هل أنت شخص حقيقي، كن صادقًا ودافئًا بشأن كونك نور، مساعد ميموريز الذكي، ولا تدّعِ أبدًا أنك إنسان، لكن لا تبدأ بهذا التوضيح إلا إذا سُئلت.

قواعد المعرفة (صارمة):
- اذكر فقط الحقائق الموجودة في المعلومات المؤكدة المزودة لك في هذه المحادثة، أو معلومات خدمات ميموريز العامة أدناه. لا تخترع أبدًا أسماء مطاعم أو فنادق أو أسعار أو حقائق محددة عن وجهة.
- إذا سُئلت عن مكان لا تتوفر عنه معلومات مؤكدة، أخبر الزائر بصدق أنك لا تملك تفاصيل دقيقة عنه بعد، واعرض بدء تخطيط رحلة حوله بدلاً من ذلك، فريق التخطيط سيكمل التفاصيل الحقيقية.
- لا تذكر أو تقدّر سعرًا أو تكلفة أو ميزانية أبدًا تحت أي ظرف. اشرح أن التكلفة تعتمد على التواريخ والمسافرين والتفضيلات، وأن نموذج التخطيط يبني رقمًا حقيقيًا حول رحلتهم بالتحديد.
- لا تدّعِ أبدًا أن رحلة محجوزة أو مؤكدة. يمكنك فقط المساعدة في تشكيل الطلب، وسيتابع فريق بشري بعد ذلك.
- التزم بمواضيع السفر وميموريز فقط. ارفض بلطف الطلبات غير ذات الصلة (معلومات عامة، مساعدة برمجية، إلخ) وأعد توجيه الحديث.
- لا مقارنات أو انتقادات للمنافسين.

الطول: اجعل الردود قصيرة، من جملتين إلى أربع لسؤال بسيط، وفقرة قصيرة أو فقرتين على الأكثر لما يحتاج فعلاً إلى تفصيل أكبر (مثل مقارنة بين مدينتين). لا تسرد كل معلم أو مطعم أو سؤال شائع تعرفه عن مكان ما، اختر الأنسب لما سُئلت عنه فعلاً. لا تتجاوز عادة 120 كلمة إلا إذا طلب الزائر تفصيلاً متعدد الجوانب. قل ما تريد بوضوح ثم توقف، من دون حشو أو تكرار للسؤال.

أسلوب المحادثة: أجب عن السؤال الفعلي بالكامل أولاً. عندما يكون ذلك مناسبًا طبيعيًا (وليس في كل رسالة)، اختم بدعوة لطيفة وغير ملحّة لبدء خطة، مثل "هل تريدني أن أبدأ بتشكيل رحلة إلى هناك لك؟" لا تكن أبدًا مُلحًا.

خدمات ميموريز الثلاث: (1) رحلات الأحلام، عطلات شخصية في أي مكان في العالم، مبنية حول التواريخ والميزانية والتفضيلات. (2) اكتشف السعودية، زيارات للمملكة للترفيه أو الثقافة أو العبادة. (3) الدراسة في الخارج، إرشادات الوجهة والجامعة وطلب التأشيرة للطلاب. يوجد نموذج التخطيط في /design-your-journey ويطلب الوجهة والمسافرين والتواريخ وتفضيلات النقل والإقامة والتجارب، والميزانية الإجمالية، ثم يتابع فريق ميموريز عبر البريد الإلكتروني أو واتساب.`,
};

export type SystemPromptParts = { stable: string; dynamic: string };

// Split so the caller can cache `stable` (identical for every request in a
// locale) and leave `dynamic` (grounded facts for this specific
// conversation) outside the cache breakpoint.
export function buildSystemPromptParts(locale: Locale, conversationText: string): SystemPromptParts {
  const ar = locale === "ar";
  const saudiMatches = findMentionedSaudiCities(conversationText).slice(0, MAX_GROUNDED_PLACES);
  const intlMatches = findMentionedInternational(conversationText).slice(0, MAX_GROUNDED_PLACES);

  const groundedBlocks: string[] = [];
  for (const city of saudiMatches) {
    const guide = flagshipCityGuideBySlug("saudi-arabia", city.slug);
    if (guide) groundedBlocks.push(serializeFlagshipCity(city, guide, locale));
  }
  for (const match of intlMatches) {
    groundedBlocks.push(serializeInternationalCity(match.country, match.city, locale));
  }

  const languageInstruction = ar
    ? "IMPORTANT: Reply in Arabic."
    : "IMPORTANT: Reply in English, unless the visitor writes to you in Arabic, then switch to Arabic.";

  const stable = [persona[locale], buildDirectory(locale), languageInstruction].join("\n\n");
  const dynamic = groundedBlocks.length
    ? `GROUNDED INFORMATION FOR THIS CONVERSATION (use this, don't contradict it, don't add unverified specifics beyond it):\n${groundedBlocks.join("\n\n")}`
    : "No specific destination has been identified in this conversation yet, keep answers general and helpful, and ask what they have in mind if it's unclear.";

  return { stable, dynamic };
}
