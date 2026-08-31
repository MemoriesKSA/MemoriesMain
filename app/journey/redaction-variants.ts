// The same name, written shorter.
//
// The marker line carries one string per thing and Arabic prose does not. On a
// real plan the draft wrote "منتجع الدانا لنكاوي" on the PICKS line and "في
// الدانا" in the sentence, so exact matching hid the marker form and left the
// hotel readable on the free preview. Same for "ريتز كارلتون كوالالمبور",
// written "ريتز كارلتون" in the prose. Two hotels, given away.
//
// WHAT THIS CARVES, AND WHY IT IS SO NARROW
//
// Runs of two or more of a commercial name's own words. Never a single word.
//
// The first design was "hide any token that appears in only one researched
// name, on the theory that a token shared by several is a place or a category
// word". Measured against the real plans that theory fails in both directions:
// "لنكاوي" is in three names and was protected by accident, while "ريتز
// كارلتون" is in two and would have been exempted for exactly the same reason.
// Around a third of same-country city pairs share a brand token, so it breaks
// by construction on the multi-stop plans we sell.
//
// Single words are refused because the measurement was worse than the theory.
// Most collisions between a name's words and ordinary prose are single words,
// and the loaded ones are the ones that appear once: عمرة, زمزم, المقام. A
// mechanism that hides "الدانا" also hides "عمرة" in a Makkah plan, and a
// blurred عمرة is not a paywall, it is a defect in front of a pilgrim. Two-word
// runs measured zero false positives on both live plans.
//
// So the single-word case is closed at the source instead: the draft declares
// the short form it actually used, as a fourth field on its own marker entry,
// validated as words copied out of the name it belongs to. That is the
// `aliases` route below - deterministic, no guessing, and it cannot invent a
// name because it must already be part of one.

import type { HiddenName } from "./paywall";
import { travelCountries } from "../components/planner-data";

/**
 * One named thing, plus the single fact this file needs: whether it is
 * something we are SELLING or a piece of the map.
 *
 * `commercial` is never read off the words in the name. It comes from where
 * the name was found - which collection of the city guide, or which marker
 * line and declared kind - because the words say nothing reliable. "Oriental
 * Village" is a shopping complex, "Jeddah Waterfront" is a built destination,
 * and "Al-Balad" is a district whose kind the draft gave as "historic
 * district". Guessing from the string would get all three wrong.
 */
export type NamedThing = {
  /** Exactly as the plan's prose writes it. */
  name: string;
  /** True for a hotel, a table, a driver, a platform. False for the map. */
  commercial: boolean;
  /** Short forms the draft itself declared it used. */
  aliases?: string[];
};

// Category words: the destination-agnostic half of the safety net. A run is cut
// at any of these, so "Old Town Hotel" yields nothing rather than "Old Town".
//
// Hand-written, and it has to be. Deriving it from our own editorial prose was
// tried and is worse than useless: there is about a page of copy per city, and
// the tokens frequent enough to qualify include ritz, carlton and blacklane -
// precisely the set being hidden. Grow this from a reviewer's rejection, never
// from imagination.
const STOP_EN = new Set([
  "the", "and", "for", "from", "with", "las", "los", "del", "der", "van", "von",
  "hotel", "hotels", "resort", "resorts", "hostel", "inn", "lodge", "motel", "aparthotel",
  "apartment", "apartments", "residence", "residences", "suite", "suites", "room", "rooms",
  "villa", "villas", "house", "houses", "home", "homes", "camp", "retreat",
  "restaurant", "restaurants", "cafe", "café", "coffee", "kitchen", "kitchens", "dining",
  "diner", "grill", "grille", "steakhouse", "bistro", "brasserie", "eatery", "lounge",
  "bar", "bars", "club", "spa", "gym", "pool", "buffet", "bakery", "patisserie",
  "palace", "tower", "towers", "plaza", "centre", "center", "court", "courtyard",
  "gate", "gates", "garden", "gardens", "park", "parks", "mall", "market", "markets",
  "bazaar", "souq", "souk", "gallery", "museum", "library", "theatre", "theater", "store", "shop",
  "beach", "beaches", "bay", "island", "islands", "harbour", "harbor", "marina",
  "waterfront", "corniche", "promenade", "boulevard", "square", "street", "road",
  "avenue", "lane", "district", "quarter", "neighbourhood", "neighborhood",
  "town", "city", "village", "old", "new", "grand", "royal", "imperial",
  "international", "national", "continental", "plus", "best", "premier", "prime",
  "select", "express", "boutique", "collection", "group", "company", "limited",
  "hospitality", "heritage", "historic", "historical", "traditional", "authentic",
  "luxury", "budget", "seafood", "food", "foods", "cuisine", "dishes",
  "taxi", "taxis", "transfer", "transfers", "transport", "transportation",
  "chauffeur", "driver", "drivers", "rental", "rentals", "rent", "car", "cars",
  "tour", "tours", "travel", "trip", "trips", "holiday", "holidays", "booking",
  "station", "terminal", "airport", "railway", "rail", "metro", "tram", "cable",
  "bridge", "ferry", "port", "line", "route",
  "fountain", "mosque", "masjid", "temple", "church", "cathedral", "shrine",
  "castle", "fort", "fortress", "tomb", "cave", "caves", "canyon", "valley",
  "wadi", "desert", "dunes", "mountain", "mountains", "hill", "hills", "hillside",
  "lake", "river", "sea", "coast", "coastal", "waterfall", "falls", "spring",
  "springs", "oasis", "farm", "reserve", "sanctuary", "zoo", "aquarium", "theme",
  "water", "night", "nights", "day", "days", "evening", "morning", "sunset",
  "sunrise", "view", "views", "viewpoint", "panorama", "peninsula", "highlands",
  "business", "industrial", "service", "services", "online", "access", "easy",
  "visitor", "visitors", "clock", "revolving", "coral", "pearl", "social",
  "turquoise", "jasmine", "vanilla", "flavors", "flavours", "senses",
  "pillars", "heart", "landmark", "twins", "casa",
  // Religious and practical vocabulary. A blurred word here is worse than any
  // leak this file prevents.
  "halal", "prayer", "prayers", "qibla", "umrah", "hajj", "ramadan", "iftar",
  "suhoor", "eid", "zamzam", "tawaf", "ihram", "rawdah", "haram", "kaaba", "imam",
  "muslim", "muslims", "islamic", "family", "families", "ladies", "women",
]);

// The same, in Arabic, written bare. The definite article is stripped before
// the check rather than listed twice: الحلال and حلال are different tokens, and
// listing every entry twice is a second list to keep in step with the first.
const STOP_AR = new Set([
  "في", "من", "إلى", "على", "عن", "مع", "أو", "ثم", "ذا", "ذي", "ذات", "هذا", "هذه",
  "التي", "الذي", "بين", "عند", "بعد", "قبل", "أمام", "خلف", "نحو", "حتى",
  "فندق", "فنادق", "منتجع", "منتجعات", "نزل", "شقق", "شقة", "جناح", "أجنحة",
  "أوتيل", "ريزيدنس", "سويتس", "بيت", "بيوت", "دار", "ديار", "قصر",
  "برج", "أبراج", "مطعم", "مطاعم", "مقهى", "مقاهي", "مطبخ", "كيتشن", "مأكولات",
  "بحرية", "كافيه", "ستيك", "هاوس", "بالاس", "لاونج", "بار", "نادي", "سبا",
  "مركز", "مول", "سوق", "أسواق", "بازار", "متحف", "معرض", "مكتبة", "مسرح", "صالة", "متجر",
  "حديقة", "حدائق", "منتزه", "بارك", "شاطئ", "شواطئ", "خليج", "جزيرة", "جزر",
  "مرسى", "مارينا", "واجهة", "كورنيش", "ممشى", "شارع", "طريق", "ميدان", "ساحة",
  "حي", "أحياء", "مدينة", "قرية", "بلدة", "بلد", "قديم", "قديمة", "جديد", "جديدة",
  "كبير", "كبيرة", "صغير", "جراند", "رويال", "دولي", "وطني", "شرقية", "غربية",
  "شمالية", "جنوبية", "وسطى", "عليا", "سفلى",
  "محطة", "مطار", "قطار", "سكة", "مترو", "ترام", "تلفريك", "جسر", "عبارة", "ميناء",
  "نافورة", "مسجد", "جامع", "معبد", "كنيسة", "كاتدرائية", "قلعة", "حصن", "باب",
  "بوابة", "ضريح", "كهف", "كهوف", "وادي", "أودية", "صحراء", "كثبان", "جبل",
  "جبال", "تل", "هضبة", "بحر", "ساحل", "شلال", "شلالات", "عين", "واحة", "مزرعة",
  "محمية", "حيوان", "مائي", "منظر", "إطلالة", "بانوراما",
  "تاكسي", "سائق", "سائقين", "شوفير", "توصيل", "نقل", "مواصلات", "تأجير", "سيارة",
  "سيارات", "جولة", "جولات", "سفر", "رحلة", "رحلات", "عطلة", "شركة", "مجموعة",
  "خدمة", "خدمات", "أونلاين", "حجز",
  "ضيافة", "تراث", "تاريخي", "تقليدي", "أصيل", "فاخر", "فخم", "اقتصادي", "عائلي",
  "معلم", "معالم", "زوار", "زائر", "دوار", "صناعية", "بستان", "سفينة", "وليمة",
  "نخيل", "زهرة", "حياة", "سلطان", "مقصورة", "كورال",
  "تركواز", "جاسمين", "فانيلا", "لؤلؤة", "ماسة", "قلب", "ليلي", "ليلة",
  // Royal names, which are in half the Saudi landmarks and none of them
  // distinctively.
  "ملك", "الملك", "أمير", "الأمير", "أميرة", "شيخ", "ملكة", "عبدالعزيز", "عبدالله",
  "فهد", "خالد", "سلمان", "فيصل", "سعود",
  // Religious and practical vocabulary, as above.
  "حلال", "قبلة", "صلاة", "حرم", "حرام", "كعبة", "روضة", "نبوي", "قباء",
  "عمرة", "حج", "زمزم", "طواف", "سعي", "إحرام", "رمضان", "إفطار", "سحور", "عيد",
  "أذان", "وضوء", "إمام", "جماعة", "نساء", "سيدات", "عائلات", "محجبات",
  "تأشيرة", "تصريح", "نسك", "صيدلية", "مستشفى", "عيادة",
]);

const TOKEN = /[\p{L}\p{N}]+/gu;

/**
 * A word is blocked if it is on a list, with or without its Arabic article.
 *
 * الحلال and حلال are two different tokens, and the first is how the word
 * usually appears inside a name. Stripping the article here beats listing
 * every Arabic entry twice and having the halves drift apart.
 */
export function isBlocked(word: string, blocked: Set<string>): boolean {
  const lower = word.toLowerCase();
  if (blocked.has(lower)) return true;
  return lower.startsWith("ال") && lower.length > 4 && blocked.has(lower.slice(2));
}
const DIGIT = /[0-9٠-٩]/;
/** Arabic short vowels and the like. See the skip in coresOf. */
const DIACRITIC = /[ً-ٰٟٓ]/;

/** Split a "Langkawi → Kuala Lumpur" style label into its own words. */
function labelTokens(label: string): string[] {
  return [...label.replace(/→|->|,|&|\//g, " ").matchAll(TOKEN)].map((m) => m[0].toLowerCase());
}

/**
 * Words that must never be carved out of a name, because they are the
 * destination, the map, or a category.
 */
export function protectedTokens(named: NamedThing[], tripLabels: string[]): Set<string> {
  const out = new Set<string>([...STOP_EN, ...STOP_AR]);

  // Anything the draft declared as geography. This is the clause doing most of
  // the work: "لنكاوي" is safe because the draft put "مطار لنكاوي الدولي" on
  // its PLACES line, not because we recognised the word.
  for (const thing of named) {
    if (thing.commercial) continue;
    for (const m of thing.name.matchAll(TOKEN)) out.add(m[0].toLowerCase());
  }

  // The trip's own stops, and then every city and country name of the
  // countries those stops are in. Without the second half a Cappadocia hotel
  // named for the region loses the region, and a Mtskheta plan carves
  // "Tbilisi" out of a hotel's name, because Tbilisi is not this trip's stop.
  //
  // Matched by name against the planner's own country list rather than through
  // a slug lookup: the label here is whatever the customer's plan is called,
  // "Langkawi → Kuala Lumpur", and it has already been split into words.
  const inTrip = new Set(tripLabels.flatMap(labelTokens));
  for (const token of inTrip) out.add(token);

  for (const country of travelCountries) {
    const names = [country.en, country.ar, ...(country.cities ?? []).flatMap((c) => [c.en, c.ar])];
    const belongs = names.some((value) => labelTokens(String(value ?? "")).some((token) => inTrip.has(token)));
    if (!belongs) continue;
    for (const value of names) {
      for (const token of labelTokens(String(value ?? ""))) out.add(token);
    }
  }
  return out;
}

/**
 * The runs of a commercial name's own words that are safe to hide.
 *
 * Sliced out of the source string rather than rebuilt by joining tokens:
 * "Ritz Carlton" matches nothing in a plan that writes "The Ritz-Carlton", and
 * "Madam Kwan s" matches nothing anywhere.
 */
function coresOf(name: string, blocked: Set<string>): string[] {
  // A diacritic makes the tokeniser wrong in both directions. "مطعم طُعمة"
  // splits into ["مطعم", "ط", "عمة"], which would hide the word for aunt, and
  // a run sliced with its vowel marks matches nothing in prose written
  // without them. Rare, and skipping the whole name is the safe answer.
  if (DIACRITIC.test(name)) return [];

  const tokens = [...name.matchAll(TOKEN)];
  const out: string[] = [];
  let run: RegExpMatchArray[] = [];

  const flush = () => {
    // Two words minimum. One word is where every dangerous false positive
    // lives, see the header.
    if (run.length >= 2) {
      const first = run[0];
      const last = run[run.length - 1];
      const slice = name.slice(first.index ?? 0, (last.index ?? 0) + last[0].length);
      // Equal to the whole name means exact redaction already covers it, and
      // emitting it twice only makes the pill wider than the name it hides.
      if (slice.length >= 6 && slice.trim() !== name.trim() && !DIGIT.test(slice)) out.push(slice);
    }
    run = [];
  };

  for (const token of tokens) {
    const word = token[0];
    const usable = word.length >= 3 && !DIGIT.test(word) && !isBlocked(word, blocked);
    if (usable) run.push(token);
    else flush();
  }
  flush();
  return out;
}

/**
 * Every short form to hide on an unpaid plan, for both languages at once.
 *
 * One list rather than one per language, because the full names already cross
 * over - the Arabic list carries the English names too - and because a draft
 * is allowed to leave a business's own name in Latin script inside the Arabic
 * plan. A per-language list would quietly stop covering that.
 */
export function shortFormsToHide(named: NamedThing[], opts: { tripLabels: string[] }): HiddenName[] {
  const blocked = protectedTokens(named, opts.tripLabels);
  const seen = new Set<string>();
  const out: HiddenName[] = [];

  const emit = (value: string) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ hiddenOnly: value });
  };

  for (const thing of named) {
    if (!thing.commercial) continue;
    for (const core of coresOf(thing.name, blocked)) emit(core);

    // A declared short form skips the two-word minimum and nothing else. It
    // has to be words copied out of this entry's own name: anything else is
    // the draft inventing a second name, and we would be blanking a word out
    // of somebody's plan on its say-so.
    for (const alias of thing.aliases ?? []) {
      const trimmed = alias.trim();
      if (trimmed.length < 4 || DIGIT.test(trimmed)) continue;
      if (trimmed === thing.name.trim() || !thing.name.includes(trimmed)) continue;
      if (DIACRITIC.test(trimmed)) continue;
      const words = [...trimmed.matchAll(TOKEN)].map((m) => m[0]);
      if (!words.length || words.some((w) => w.length < 3 || isBlocked(w, blocked))) continue;
      emit(trimmed);
    }
  }
  return out;
}
