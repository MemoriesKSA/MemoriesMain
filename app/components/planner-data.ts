export type PlannerPath = "journey" | "saudi" | "study";

export type LocalizedOption = {
  value: string;
  en: string;
  ar: string;
  // Extra words the search should match. Never shown to anyone.
  //
  // The selector matched only the visible label, and the visible label for
  // Türkiye is "Türkiye". A customer typing "Turkey" - which is what an
  // English speaker types - got "No matching countries" and no way to know
  // the country was sitting right there. It is the first field in the
  // funnel, so a miss here loses the whole booking.
  //
  // Same class of problem for anything people call by another name: UAE,
  // USA, UK, Holland.
  aliases?: string;
};

export type CountryOption = LocalizedOption & {
  cities: LocalizedOption[];
};

const cities = (items: Array<[string, string, string]>): LocalizedOption[] =>
  items.map(([value, en, ar]) => ({ value, en, ar }));

export const saudiArabia: CountryOption = {
  value: "saudi-arabia",
  en: "Saudi Arabia",
  ar: "المملكة العربية السعودية",
  aliases: "ksa saudi arabia kingdom",
  cities: cities([
    ["riyadh", "Riyadh", "الرياض"], ["jeddah", "Jeddah", "جدة"], ["alula", "AlUla", "العلا"],
    ["makkah", "Makkah", "مكة المكرمة"], ["madinah", "Madinah", "المدينة المنورة"], ["red-sea", "The Red Sea", "البحر الأحمر"],
    ["abha", "Abha", "أبها"], ["aseer", "Aseer", "عسير"], ["taif", "Taif", "الطائف"], ["al-ahsa", "Al-Ahsa", "الأحساء"],
    ["jazan", "Jazan", "جازان"], ["al-jouf", "Al-Jouf", "الجوف"], ["dammam", "Dammam & Al Khobar", "الدمام والخبر"],
    ["tabuk", "Tabuk", "تبوك"], ["yanbu", "Yanbu", "ينبع"], ["other-saudi", "Another Saudi destination", "وجهة سعودية أخرى"],
  ]),
};

// The countries we hold researched city data for, and therefore the ones we
// can actually build a plan for: multi-stop, the plan fee, and the AI draft
// all key off this.
//
// It used to be the single check `country === saudiArabia.value`, written
// when Saudi was the whole product. It stayed that way after five more
// countries were added, so a customer choosing Türkiye could not add a
// second destination and never saw a price - Istanbul and Cappadocia is the
// commonest Turkish trip there is, and the form simply would not build it.
//
// Kept here rather than derived from flagship-city-data because this file is
// imported by a client component and that one is thousands of lines of city
// prose. scripts/test-city-uniqueness.ts asserts the two agree, so it cannot
// drift the way the hardcoded check did.
export const deepDataCountries = new Set([
  "saudi-arabia",
  "turkey",
  "thailand",
  "malaysia",
  "georgia",
  "russia",
]);

export const travelCountries: CountryOption[] = [
  saudiArabia,
  { value: "france", en: "France", ar: "فرنسا", aliases: "french", cities: cities([["paris","Paris","باريس"],["nice","Nice","نيس"],["cannes","Cannes","كان"],["lyon","Lyon","ليون"],["bordeaux","Bordeaux","بوردو"],["strasbourg","Strasbourg","ستراسبورغ"],["annecy","Annecy","آنسي"],["marseille","Marseille","مرسيليا"],["colmar","Colmar","كولمار"],["other-france","Another French city","مدينة فرنسية أخرى"]]) },
  { value: "italy", en: "Italy", ar: "إيطاليا", aliases: "italian italia", cities: cities([["rome","Rome","روما"],["florence","Florence","فلورنسا"],["venice","Venice","البندقية"],["milan","Milan","ميلانو"],["naples","Naples","نابولي"],["amalfi","Amalfi Coast","ساحل أمالفي"],["lake-como","Lake Como","بحيرة كومو"],["bologna","Bologna","بولونيا"],["other-italy","Another Italian city","مدينة إيطالية أخرى"]]) },
  { value: "spain", en: "Spain", ar: "إسبانيا", aliases: "spanish espana", cities: cities([["barcelona","Barcelona","برشلونة"],["madrid","Madrid","مدريد"],["seville","Seville","إشبيلية"],["granada","Granada","غرناطة"],["valencia","Valencia","فالنسيا"],["malaga","Málaga","مالقة"],["mallorca","Mallorca","مايوركا"],["san-sebastian","San Sebastián","سان سيباستيان"],["other-spain","Another Spanish city","مدينة إسبانية أخرى"]]) },
  { value: "switzerland", en: "Switzerland", ar: "سويسرا", aliases: "swiss", cities: cities([["zurich","Zurich","زيورخ"],["geneva","Geneva","جنيف"],["lucerne","Lucerne","لوسيرن"],["interlaken","Interlaken","إنترلاكن"],["zermatt","Zermatt","زيرمات"],["montreux","Montreux","مونترو"],["bern","Bern","برن"],["lugano","Lugano","لوغانو"],["st-moritz","St. Moritz","سانت موريتز"],["other-switzerland","Another Swiss city","مدينة سويسرية أخرى"]]) },
  { value: "turkey", en: "Türkiye", ar: "تركيا", aliases: "turkey turkiye turkish", cities: cities([["istanbul","Istanbul","إسطنبول"],["antalya","Antalya","أنطاليا"],["cappadocia","Cappadocia","كابادوكيا"],["bodrum","Bodrum","بودروم"],["izmir","İzmir","إزمير"],["fethiye","Fethiye","فتحية"],["ankara","Ankara","أنقرة"],["bursa","Bursa","بورصة"],["trabzon","Trabzon","طرابزون"],["other-turkey","Another Turkish city","مدينة تركية أخرى"]]) },
  { value: "maldives", en: "Maldives", ar: "المالديف", aliases: "maldive", cities: cities([["north-male","North Malé Atoll","شمال ماليه أتول"],["baa-atoll","Baa Atoll","با أتول"],["ari-atoll","Ari Atoll","آري أتول"],["vaavu-atoll","Vaavu Atoll","فافو أتول"],["male","Malé","ماليه"],["other-maldives","Another island or atoll","جزيرة أو أتول آخر"]]) },
  { value: "united-kingdom", en: "United Kingdom", ar: "المملكة المتحدة", aliases: "uk britain british england great britain", cities: cities([["london","London","لندن"],["edinburgh","Edinburgh","إدنبرة"],["bath","Bath","باث"],["oxford","Oxford","أكسفورد"],["york","York","يورك"],["manchester","Manchester","مانشستر"],["liverpool","Liverpool","ليفربول"],["cotswolds","The Cotswolds","كوتسوولدز"],["other-uk","Another UK city","مدينة بريطانية أخرى"]]) },
  { value: "united-states", en: "United States", ar: "الولايات المتحدة", aliases: "usa us united states america american", cities: cities([["new-york","New York City","نيويورك"],["orlando","Orlando","أورلاندو"],["los-angeles","Los Angeles","لوس أنجلوس"],["las-vegas","Las Vegas","لاس فيغاس"],["miami","Miami","ميامي"],["san-francisco","San Francisco","سان فرانسيسكو"],["washington-dc","Washington, D.C.","واشنطن العاصمة"],["chicago","Chicago","شيكاغو"],["honolulu","Honolulu","هونولولو"],["other-us","Another US city","مدينة أمريكية أخرى"]]) },
  { value: "japan", en: "Japan", ar: "اليابان", aliases: "japanese nippon", cities: cities([["tokyo","Tokyo","طوكيو"],["kyoto","Kyoto","كيوتو"],["osaka","Osaka","أوساكا"],["nara","Nara","نارا"],["sapporo","Sapporo","سابورو"],["fukuoka","Fukuoka","فوكوكا"],["hiroshima","Hiroshima","هيروشيما"],["yokohama","Yokohama","يوكوهاما"],["other-japan","Another Japanese city","مدينة يابانية أخرى"]]) },
  { value: "uae", en: "United Arab Emirates", ar: "الإمارات العربية المتحدة", aliases: "uae emirates dubai abu dhabi", cities: cities([["dubai","Dubai","دبي"],["abu-dhabi","Abu Dhabi","أبوظبي"],["ras-al-khaimah","Ras Al Khaimah","رأس الخيمة"],["sharjah","Sharjah","الشارقة"],["other-uae","Another UAE city","مدينة إماراتية أخرى"]]) },
  { value: "greece", en: "Greece", ar: "اليونان", aliases: "greek hellas", cities: cities([["athens","Athens","أثينا"],["santorini","Santorini","سانتوريني"],["mykonos","Mykonos","ميكونوس"],["crete","Crete","كريت"],["rhodes","Rhodes","رودس"],["thessaloniki","Thessaloniki","سالونيك"],["other-greece","Another Greek destination","وجهة يونانية أخرى"]]) },
  { value: "indonesia", en: "Indonesia", ar: "إندونيسيا", aliases: "indonesian bali", cities: cities([["bali","Bali","بالي"],["jakarta","Jakarta","جاكرتا"],["yogyakarta","Yogyakarta","يوجياكارتا"],["lombok","Lombok","لومبوك"],["labuan-bajo","Labuan Bajo & Komodo","لابوان باجو وكومودو"],["other-indonesia","Another Indonesian destination","وجهة إندونيسية أخرى"]]) },
  { value: "philippines", en: "Philippines", ar: "الفلبين", aliases: "filipino philippine manila cebu", cities: cities([["manila","Manila","مانيلا"],["cebu","Cebu","سيبو"],["boracay","Boracay","بوراكاي"],["palawan","Palawan","بالاوان"],["bohol","Bohol","بوهول"],["other-philippines","Another Philippine destination","وجهة فلبينية أخرى"]]) },
  { value: "thailand", en: "Thailand", ar: "تايلاند", aliases: "thai siam", cities: cities([["bangkok","Bangkok","بانكوك"],["phuket","Phuket","بوكيت"],["chiang-mai","Chiang Mai","شيانغ ماي"],["krabi","Krabi","كرابي"],["koh-samui","Koh Samui","كوه ساموي"],["pattaya","Pattaya","باتايا"],["other-thailand","Another Thai destination","وجهة تايلاندية أخرى"]]) },
  { value: "australia", en: "Australia", ar: "أستراليا", aliases: "aussie", cities: cities([["sydney","Sydney","سيدني"],["melbourne","Melbourne","ملبورن"],["gold-coast","Gold Coast","غولد كوست"],["brisbane","Brisbane","بريزبن"],["perth","Perth","بيرث"],["adelaide","Adelaide","أديلايد"],["cairns","Cairns","كيرنز"],["other-australia","Another Australian city","مدينة أسترالية أخرى"]]) },
  { value: "canada", en: "Canada", ar: "كندا", aliases: "canadian", cities: cities([["toronto","Toronto","تورونتو"],["vancouver","Vancouver","فانكوفر"],["montreal","Montréal","مونتريال"],["quebec-city","Québec City","مدينة كيبيك"],["banff","Banff","بانف"],["calgary","Calgary","كالغاري"],["ottawa","Ottawa","أوتاوا"],["victoria","Victoria","فيكتوريا"],["other-canada","Another Canadian city","مدينة كندية أخرى"]]) },
  { value: "austria", en: "Austria", ar: "النمسا", aliases: "austrian", cities: cities([["vienna","Vienna","فيينا"],["salzburg","Salzburg","سالزبورغ"],["innsbruck","Innsbruck","إنسبروك"],["hallstatt","Hallstatt","هالشتات"],["graz","Graz","غراتس"],["other-austria","Another Austrian city","مدينة نمساوية أخرى"]]) },
  { value: "portugal", en: "Portugal", ar: "البرتغال", aliases: "portuguese", cities: cities([["lisbon","Lisbon","لشبونة"],["porto","Porto","بورتو"],["sintra","Sintra","سينترا"],["faro","Faro & the Algarve","فارو والغارف"],["madeira","Madeira","ماديرا"],["coimbra","Coimbra","كويمبرا"],["other-portugal","Another Portuguese city","مدينة برتغالية أخرى"]]) },
  // Malaysia, Georgia and Russia join the list. Turkey and Thailand were
  // already here. City slugs have to stay unique across every country in
  // this file, because a stored plan works out its country from the city
  // alone; scripts/test-city-uniqueness.ts fails the day two collide.
  { value: "malaysia", en: "Malaysia", ar: "ماليزيا", aliases: "malaysian", cities: cities([["kuala-lumpur","Kuala Lumpur","كوالالمبور"],["penang","Penang","بينانغ"],["langkawi","Langkawi","لنكاوي"],["malacca","Malacca","ملقا"],["kota-kinabalu","Kota Kinabalu","كوتا كينابالو"],["cameron-highlands","Cameron Highlands","مرتفعات كاميرون"],["other-malaysia","Another Malaysian city","مدينة ماليزية أخرى"]]) },
  { value: "georgia", en: "Georgia", ar: "جورجيا", aliases: "georgian tbilisi", cities: cities([["tbilisi","Tbilisi","تبليسي"],["batumi","Batumi","باتومي"],["kazbegi","Kazbegi","كازبيغي"],["kutaisi","Kutaisi","كوتايسي"],["borjomi","Borjomi","بورجومي"],["mtskheta","Mtskheta","متسخيتا"],["other-georgia","Another Georgian city","مدينة جورجية أخرى"]]) },
  { value: "russia", en: "Russia", ar: "روسيا", aliases: "russian federation", cities: cities([["moscow","Moscow","موسكو"],["saint-petersburg","Saint Petersburg","سانت بطرسبرغ"],["kazan","Kazan","قازان"],["sochi","Sochi","سوتشي"],["kaliningrad","Kaliningrad","كالينينغراد"],["other-russia","Another Russian city","مدينة روسية أخرى"]]) },
];

// Which countries the journey planner will actually accept a request for.
//
// travelCountries stays the full list, because /destinations builds its story
// pages from it, map links resolve a city's country through it, and a stored
// plan works out where it went from it. None of that should shrink.
//
// What had to shrink is the planner. Every country here that we hold no data
// for still appeared in the dropdown, and the draft branch in the journeys
// route only opens for a city we can actually ground - so a customer could
// choose Paris, submit, and receive nothing at all. Not an error, not a log
// line: the team got a brief and the customer got silence. That had already
// happened twice before, once to Türkiye and once to every study request,
// and the route's own comment says so.
//
// So the planner offers only what we can plan. The rest keep their story
// pages, marked as somewhere we are still working on.
const PLANNABLE = new Set([
  "saudi-arabia",
  "turkey",
  "thailand",
  "malaysia",
  "georgia",
  "russia",
  // Warmed from research rather than curated by hand, which is what let
  // these three open without anyone writing a city guide first.
  "indonesia",
  "philippines",
  "uae",
]);

export function isPlannableCountry(slug: string): boolean {
  return PLANNABLE.has(slug);
}

export const plannableCountries: CountryOption[] = travelCountries.filter((c) => PLANNABLE.has(c.value));

/** Countries kept for browsing only: a story page, no journey request. */
export const showcaseCountries: CountryOption[] = travelCountries.filter((c) => !PLANNABLE.has(c.value));

export const studyCountries: CountryOption[] = [
  { value: "united-kingdom", en: "United Kingdom", ar: "المملكة المتحدة", aliases: "uk britain british england great britain", cities: cities([["london","London","لندن"],["manchester","Manchester","مانشستر"],["edinburgh","Edinburgh","إدنبرة"],["birmingham","Birmingham","برمنغهام"],["glasgow","Glasgow","غلاسكو"],["leeds","Leeds","ليدز"],["liverpool","Liverpool","ليفربول"],["nottingham","Nottingham","نوتنغهام"],["bristol","Bristol","بريستول"],["other-uk-study","Another UK study city","مدينة دراسية بريطانية أخرى"]]) },
  { value: "canada", en: "Canada", ar: "كندا", aliases: "canadian", cities: cities([["toronto","Toronto","تورونتو"],["vancouver","Vancouver","فانكوفر"],["montreal","Montréal","مونتريال"],["ottawa","Ottawa","أوتاوا"],["calgary","Calgary","كالغاري"],["waterloo","Waterloo","واترلو"],["kingston","Kingston","كينغستون"],["halifax","Halifax","هاليفاكس"],["other-canada-study","Another Canadian study city","مدينة دراسية كندية أخرى"]]) },
  { value: "australia", en: "Australia", ar: "أستراليا", aliases: "aussie", cities: cities([["melbourne","Melbourne","ملبورن"],["sydney","Sydney","سيدني"],["brisbane","Brisbane","بريزبن"],["adelaide","Adelaide","أديلايد"],["perth","Perth","بيرث"],["canberra","Canberra","كانبرا"],["gold-coast","Gold Coast","غولد كوست"],["other-australia-study","Another Australian study city","مدينة دراسية أسترالية أخرى"]]) },
  { value: "japan", en: "Japan", ar: "اليابان", aliases: "japanese nippon", cities: cities([["tokyo","Tokyo","طوكيو"],["kyoto","Kyoto","كيوتو"],["osaka","Osaka","أوساكا"],["yokohama","Yokohama","يوكوهاما"],["nagoya","Nagoya","ناغويا"],["fukuoka","Fukuoka","فوكوكا"],["sapporo","Sapporo","سابورو"],["sendai","Sendai","سينداي"],["other-japan-study","Another Japanese study city","مدينة دراسية يابانية أخرى"]]) },
];

/**
 * Study abroad is paused, and this is the one switch that pauses it.
 *
 * Nothing is deleted: the 32 study cities stay warm in the research cache,
 * the study brief stays, the study pages stay. Reopening is this constant.
 *
 * Paused because it is the half of the product where being wrong hurts
 * somebody. A wrong restaurant is an annoyance; a wrong visa deadline can
 * cost a student a year, and study drafts are still the ones coming back
 * with findings while trip drafts come back clean.
 *
 * Everything that decides whether a study request is possible reads this,
 * so the form and the journeys route cannot drift apart the way the
 * planner and the draft branch once did over which countries were real.
 */
export const STUDY_ABROAD_PAUSED = true;

const ALL_PATH_OPTIONS: Array<LocalizedOption & { path: PlannerPath; descriptionEn: string; descriptionAr: string }> = [
  { path: "journey", value: "journey", en: "Design your dream journey", ar: "صمّم رحلة أحلامك", descriptionEn: "A complete holiday shaped around you.", descriptionAr: "رحلة متكاملة مصممة حولك." },
  { path: "saudi", value: "saudi", en: "Discover Saudi Arabia", ar: "اكتشف السعودية", descriptionEn: "Visit the Kingdom for leisure, culture or pilgrimage.", descriptionAr: "اكتشف المملكة للسياحة أو الثقافة أو الزيارة الدينية." },
  { path: "study", value: "study", en: "Study Abroad", ar: "الدراسة في الخارج", descriptionEn: "Study planning and visa-application assistance.", descriptionAr: "تخطيط الدراسة والمساعدة في طلب التأشيرة." },
];

/** The study path is hidden while it is paused; the other two are unchanged. */
export const pathOptions = ALL_PATH_OPTIONS.filter((option) => !(STUDY_ABROAD_PAUSED && option.path === "study"));
