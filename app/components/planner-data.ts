export type PlannerPath = "journey" | "saudi" | "study";

export type LocalizedOption = {
  value: string;
  en: string;
  ar: string;
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
  cities: cities([
    ["riyadh", "Riyadh", "الرياض"], ["jeddah", "Jeddah", "جدة"], ["alula", "AlUla", "العلا"],
    ["makkah", "Makkah", "مكة المكرمة"], ["madinah", "Madinah", "المدينة المنورة"], ["red-sea", "The Red Sea", "البحر الأحمر"],
    ["abha", "Abha", "أبها"], ["aseer", "Aseer", "عسير"], ["taif", "Taif", "الطائف"], ["al-ahsa", "Al-Ahsa", "الأحساء"],
    ["jazan", "Jazan", "جازان"], ["al-jouf", "Al-Jouf", "الجوف"], ["dammam", "Dammam & Al Khobar", "الدمام والخبر"],
    ["tabuk", "Tabuk", "تبوك"], ["yanbu", "Yanbu", "ينبع"], ["other-saudi", "Another Saudi destination", "وجهة سعودية أخرى"],
  ]),
};

export const travelCountries: CountryOption[] = [
  saudiArabia,
  { value: "france", en: "France", ar: "فرنسا", cities: cities([["paris","Paris","باريس"],["nice","Nice","نيس"],["cannes","Cannes","كان"],["lyon","Lyon","ليون"],["bordeaux","Bordeaux","بوردو"],["strasbourg","Strasbourg","ستراسبورغ"],["annecy","Annecy","آنسي"],["marseille","Marseille","مرسيليا"],["colmar","Colmar","كولمار"],["other-france","Another French city","مدينة فرنسية أخرى"]]) },
  { value: "italy", en: "Italy", ar: "إيطاليا", cities: cities([["rome","Rome","روما"],["florence","Florence","فلورنسا"],["venice","Venice","البندقية"],["milan","Milan","ميلانو"],["naples","Naples","نابولي"],["amalfi","Amalfi Coast","ساحل أمالفي"],["lake-como","Lake Como","بحيرة كومو"],["bologna","Bologna","بولونيا"],["other-italy","Another Italian city","مدينة إيطالية أخرى"]]) },
  { value: "spain", en: "Spain", ar: "إسبانيا", cities: cities([["barcelona","Barcelona","برشلونة"],["madrid","Madrid","مدريد"],["seville","Seville","إشبيلية"],["granada","Granada","غرناطة"],["valencia","Valencia","فالنسيا"],["malaga","Málaga","مالقة"],["mallorca","Mallorca","مايوركا"],["san-sebastian","San Sebastián","سان سيباستيان"],["other-spain","Another Spanish city","مدينة إسبانية أخرى"]]) },
  { value: "switzerland", en: "Switzerland", ar: "سويسرا", cities: cities([["zurich","Zurich","زيورخ"],["geneva","Geneva","جنيف"],["lucerne","Lucerne","لوسيرن"],["interlaken","Interlaken","إنترلاكن"],["zermatt","Zermatt","زيرمات"],["montreux","Montreux","مونترو"],["bern","Bern","برن"],["lugano","Lugano","لوغانو"],["st-moritz","St. Moritz","سانت موريتز"],["other-switzerland","Another Swiss city","مدينة سويسرية أخرى"]]) },
  { value: "turkey", en: "Türkiye", ar: "تركيا", cities: cities([["istanbul","Istanbul","إسطنبول"],["antalya","Antalya","أنطاليا"],["cappadocia","Cappadocia","كابادوكيا"],["bodrum","Bodrum","بودروم"],["izmir","İzmir","إزمير"],["fethiye","Fethiye","فتحية"],["ankara","Ankara","أنقرة"],["bursa","Bursa","بورصة"],["trabzon","Trabzon","طرابزون"],["other-turkey","Another Turkish city","مدينة تركية أخرى"]]) },
  { value: "maldives", en: "Maldives", ar: "المالديف", cities: cities([["north-male","North Malé Atoll","شمال ماليه أتول"],["baa-atoll","Baa Atoll","با أتول"],["ari-atoll","Ari Atoll","آري أتول"],["vaavu-atoll","Vaavu Atoll","فافو أتول"],["male","Malé","ماليه"],["other-maldives","Another island or atoll","جزيرة أو أتول آخر"]]) },
  { value: "united-kingdom", en: "United Kingdom", ar: "المملكة المتحدة", cities: cities([["london","London","لندن"],["edinburgh","Edinburgh","إدنبرة"],["bath","Bath","باث"],["oxford","Oxford","أكسفورد"],["york","York","يورك"],["manchester","Manchester","مانشستر"],["liverpool","Liverpool","ليفربول"],["cotswolds","The Cotswolds","كوتسوولدز"],["other-uk","Another UK city","مدينة بريطانية أخرى"]]) },
  { value: "united-states", en: "United States", ar: "الولايات المتحدة", cities: cities([["new-york","New York City","نيويورك"],["orlando","Orlando","أورلاندو"],["los-angeles","Los Angeles","لوس أنجلوس"],["las-vegas","Las Vegas","لاس فيغاس"],["miami","Miami","ميامي"],["san-francisco","San Francisco","سان فرانسيسكو"],["washington-dc","Washington, D.C.","واشنطن العاصمة"],["chicago","Chicago","شيكاغو"],["honolulu","Honolulu","هونولولو"],["other-us","Another US city","مدينة أمريكية أخرى"]]) },
  { value: "japan", en: "Japan", ar: "اليابان", cities: cities([["tokyo","Tokyo","طوكيو"],["kyoto","Kyoto","كيوتو"],["osaka","Osaka","أوساكا"],["nara","Nara","نارا"],["sapporo","Sapporo","سابورو"],["fukuoka","Fukuoka","فوكوكا"],["hiroshima","Hiroshima","هيروشيما"],["yokohama","Yokohama","يوكوهاما"],["other-japan","Another Japanese city","مدينة يابانية أخرى"]]) },
  { value: "uae", en: "United Arab Emirates", ar: "الإمارات العربية المتحدة", cities: cities([["dubai","Dubai","دبي"],["abu-dhabi","Abu Dhabi","أبوظبي"],["ras-al-khaimah","Ras Al Khaimah","رأس الخيمة"],["sharjah","Sharjah","الشارقة"],["other-uae","Another UAE city","مدينة إماراتية أخرى"]]) },
  { value: "greece", en: "Greece", ar: "اليونان", cities: cities([["athens","Athens","أثينا"],["santorini","Santorini","سانتوريني"],["mykonos","Mykonos","ميكونوس"],["crete","Crete","كريت"],["rhodes","Rhodes","رودس"],["thessaloniki","Thessaloniki","سالونيك"],["other-greece","Another Greek destination","وجهة يونانية أخرى"]]) },
  { value: "indonesia", en: "Indonesia", ar: "إندونيسيا", cities: cities([["bali","Bali","بالي"],["jakarta","Jakarta","جاكرتا"],["yogyakarta","Yogyakarta","يوجياكارتا"],["lombok","Lombok","لومبوك"],["labuan-bajo","Labuan Bajo & Komodo","لابوان باجو وكومودو"],["other-indonesia","Another Indonesian destination","وجهة إندونيسية أخرى"]]) },
  { value: "thailand", en: "Thailand", ar: "تايلاند", cities: cities([["bangkok","Bangkok","بانكوك"],["phuket","Phuket","بوكيت"],["chiang-mai","Chiang Mai","شيانغ ماي"],["krabi","Krabi","كرابي"],["koh-samui","Koh Samui","كوه ساموي"],["pattaya","Pattaya","باتايا"],["other-thailand","Another Thai destination","وجهة تايلاندية أخرى"]]) },
  { value: "australia", en: "Australia", ar: "أستراليا", cities: cities([["sydney","Sydney","سيدني"],["melbourne","Melbourne","ملبورن"],["gold-coast","Gold Coast","غولد كوست"],["brisbane","Brisbane","بريزبن"],["perth","Perth","بيرث"],["adelaide","Adelaide","أديلايد"],["cairns","Cairns","كيرنز"],["other-australia","Another Australian city","مدينة أسترالية أخرى"]]) },
  { value: "canada", en: "Canada", ar: "كندا", cities: cities([["toronto","Toronto","تورونتو"],["vancouver","Vancouver","فانكوفر"],["montreal","Montréal","مونتريال"],["quebec-city","Québec City","مدينة كيبيك"],["banff","Banff","بانف"],["calgary","Calgary","كالغاري"],["ottawa","Ottawa","أوتاوا"],["victoria","Victoria","فيكتوريا"],["other-canada","Another Canadian city","مدينة كندية أخرى"]]) },
  { value: "austria", en: "Austria", ar: "النمسا", cities: cities([["vienna","Vienna","فيينا"],["salzburg","Salzburg","سالزبورغ"],["innsbruck","Innsbruck","إنسبروك"],["hallstatt","Hallstatt","هالشتات"],["graz","Graz","غراتس"],["other-austria","Another Austrian city","مدينة نمساوية أخرى"]]) },
  { value: "portugal", en: "Portugal", ar: "البرتغال", cities: cities([["lisbon","Lisbon","لشبونة"],["porto","Porto","بورتو"],["sintra","Sintra","سينترا"],["faro","Faro & the Algarve","فارو والغارف"],["madeira","Madeira","ماديرا"],["coimbra","Coimbra","كويمبرا"],["other-portugal","Another Portuguese city","مدينة برتغالية أخرى"]]) },
];

export const studyCountries: CountryOption[] = [
  { value: "united-kingdom", en: "United Kingdom", ar: "المملكة المتحدة", cities: cities([["london","London","لندن"],["manchester","Manchester","مانشستر"],["edinburgh","Edinburgh","إدنبرة"],["birmingham","Birmingham","برمنغهام"],["glasgow","Glasgow","غلاسكو"],["leeds","Leeds","ليدز"],["liverpool","Liverpool","ليفربول"],["nottingham","Nottingham","نوتنغهام"],["bristol","Bristol","بريستول"],["other-uk-study","Another UK study city","مدينة دراسية بريطانية أخرى"]]) },
  { value: "united-states", en: "United States", ar: "الولايات المتحدة", cities: cities([["boston","Boston","بوسطن"],["new-york","New York City","نيويورك"],["los-angeles","Los Angeles","لوس أنجلوس"],["chicago","Chicago","شيكاغو"],["san-francisco","San Francisco Bay Area","منطقة خليج سان فرانسيسكو"],["seattle","Seattle","سياتل"],["austin","Austin","أوستن"],["washington-dc","Washington, D.C.","واشنطن العاصمة"],["philadelphia","Philadelphia","فيلادلفيا"],["san-diego","San Diego","سان دييغو"],["other-us-study","Another US study city","مدينة دراسية أمريكية أخرى"]]) },
  { value: "canada", en: "Canada", ar: "كندا", cities: cities([["toronto","Toronto","تورونتو"],["vancouver","Vancouver","فانكوفر"],["montreal","Montréal","مونتريال"],["ottawa","Ottawa","أوتاوا"],["calgary","Calgary","كالغاري"],["waterloo","Waterloo","واترلو"],["kingston","Kingston","كينغستون"],["halifax","Halifax","هاليفاكس"],["other-canada-study","Another Canadian study city","مدينة دراسية كندية أخرى"]]) },
  { value: "australia", en: "Australia", ar: "أستراليا", cities: cities([["melbourne","Melbourne","ملبورن"],["sydney","Sydney","سيدني"],["brisbane","Brisbane","بريزبن"],["adelaide","Adelaide","أديلايد"],["perth","Perth","بيرث"],["canberra","Canberra","كانبرا"],["gold-coast","Gold Coast","غولد كوست"],["other-australia-study","Another Australian study city","مدينة دراسية أسترالية أخرى"]]) },
  { value: "japan", en: "Japan", ar: "اليابان", cities: cities([["tokyo","Tokyo","طوكيو"],["kyoto","Kyoto","كيوتو"],["osaka","Osaka","أوساكا"],["yokohama","Yokohama","يوكوهاما"],["nagoya","Nagoya","ناغويا"],["fukuoka","Fukuoka","فوكوكا"],["sapporo","Sapporo","سابورو"],["sendai","Sendai","سينداي"],["other-japan-study","Another Japanese study city","مدينة دراسية يابانية أخرى"]]) },
];

export const pathOptions: Array<LocalizedOption & { path: PlannerPath; descriptionEn: string; descriptionAr: string }> = [
  { path: "journey", value: "journey", en: "Design your dream journey", ar: "صمّم رحلة أحلامك", descriptionEn: "A complete holiday shaped around you.", descriptionAr: "رحلة متكاملة مصممة حولك." },
  { path: "saudi", value: "saudi", en: "Discover Saudi Arabia", ar: "اكتشف السعودية", descriptionEn: "Visit the Kingdom for leisure, culture or pilgrimage.", descriptionAr: "اكتشف المملكة للسياحة أو الثقافة أو الزيارة الدينية." },
  { path: "study", value: "study", en: "Study Abroad", ar: "الدراسة في الخارج", descriptionEn: "Study planning and visa-application assistance.", descriptionAr: "تخطيط الدراسة والمساعدة في طلب التأشيرة." },
];
