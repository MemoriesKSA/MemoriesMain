// Rich, editorial city guides for flagship destinations. Unlike the generic
// city guide (destination-guide-data.ts), entries here get their own
// distinct page template — see components/flagship-city-guide-page.tsx.
// A city with no entry here simply falls back to the generic template.
//
// HOTELS ARE A FACTUAL CLAIM, AND THEY GO STALE.
//
// All 75 hotels were checked against operator sources on 20 August 2026 and
// three were wrong:
//   - Four Seasons Jeddah, removed earlier: a building site until 2027.
//   - The Oberoi Madinah: Oberoi ended its management on 1 January 2026 and
//     it had sat here as a bookable luxury pick for the eight months since.
//   - Taif Marriott Resort & Spa: no such property. Marriott lists one Taif
//     hotel and it is not that. It looks invented, and it was first in the
//     list, so it was the default luxury pick for the city.
//
// All three were luxury picks, and each sat where a draft would reach for it
// first. Booking sites kept listing the Oberoi long after it closed, so a
// search that finds an aggregator page proves nothing: check the operator.
//
// Re-check yearly, and whenever a plan is built around a property nobody has
// booked recently. A hotel that doesn't exist is worse than a wrong price,
// because it makes every other claim in the plan look invented too.

export type FlagshipPlace = {
  nameEn: string;
  nameAr: string;
  categoryEn: string;
  categoryAr: string;
  descriptionEn: string;
  descriptionAr: string;
  badgeEn?: string;
  badgeAr?: string;
  image?: string;
};

export type FlagshipDining = {
  nameEn: string;
  nameAr: string;
  cuisineEn: string;
  cuisineAr: string;
  descriptionEn: string;
  descriptionAr: string;
  image?: string;
};

export type FlagshipStay = {
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  // Omit for a mid-range/unclassified stay. Lets both the page and the AI
  // grounding distinguish a splurge pick from a genuine budget option.
  tier?: "luxury" | "budget";
  image?: string;
};

export type FlagshipWeatherWindow = {
  labelEn: string;
  labelAr: string;
  monthsEn: string;
  monthsAr: string;
  tempEn: string;
  tempAr: string;
  noteEn: string;
  noteAr: string;
};

export type FlagshipDayBeat = {
  timeEn: string;
  timeAr: string;
  placeEn: string;
  placeAr: string;
  descriptionEn: string;
  descriptionAr: string;
};

export type FlagshipFaq = {
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
};

export type FlagshipTip = {
  en: string;
  ar: string;
};

export type FlagshipTransportMode = {
  modeEn: string;
  modeAr: string;
  descriptionEn: string;
  descriptionAr: string;
};

export type FlagshipTransportProvider = {
  nameEn: string;
  nameAr: string;
  typeEn: string;
  typeAr: string;
  noteEn: string;
  noteAr: string;
};

export type FlagshipCityGuide = {
  // Omit for the default leisure/excitement framing. Use "worship" for
  // pilgrimage cities (Makkah, Madinah) to swap section headings, drop the
  // dining/sample-day sections, and use respectful, practical CTA copy.
  tone?: "worship";
  // The editorial half, and the only part the public flagship page renders.
  // Optional because a city can be here purely to ground the AI draft: the
  // drafting pass reads attractions, dining, stays, drivers, the sample day
  // and the tips, and never touches the story, the pull quote or the
  // weather panel. Requiring them would mean writing a magazine feature for
  // every city before the AI could plan a trip there, which is a lot of
  // prose standing between a customer and a working plan.
  //
  // A city without them still gets a public page, the generic one, which is
  // what every non-flagship city already uses. isEditorialGuide below is
  // what the page routes check.
  storyEn?: string[];
  storyAr?: string[];
  pullQuoteEn?: string;
  pullQuoteAr?: string;
  weather?: {
    bestWindow: FlagshipWeatherWindow;
    peakHeat: FlagshipWeatherWindow;
    tipEn: string;
    tipAr: string;
  };
  // Optional: only include when there's real, verified transport guidance
  // for this destination (skip for resort regions etc. where it doesn't fit).
  transportation?: FlagshipTransportMode[];
  // Optional (being rolled out city by city): real, named private-driver or
  // chauffeur services, for planners who want a licensed driver over
  // ride-hailing. Never invent a company; only list ones with real,
  // findable, current operations in the city.
  trustedProviders?: FlagshipTransportProvider[];
  // Optional (being rolled out city by city): 9 real Q&As — the component
  // appends a 10th "Having trouble planning?" itself.
  faq?: FlagshipFaq[];
  travelTips?: FlagshipTip[];
  attractions: FlagshipPlace[];
  dining: FlagshipDining[];
  stay: FlagshipStay[];
  sampleDay: FlagshipDayBeat[];
  // AI-only grounding: flagship-city-guide-page.tsx never reads these, only
  // the AI draft generator (draft-guide.ts) and concierge (concierge-data.ts)
  // do. The public page stays curated and editorial (a couple of featured
  // picks); these hold a deeper, real, sourced set of options across price
  // points so the AI has genuine choices to weigh instead of just the ones
  // worth featuring on a page. Same rule as everywhere else: real, verified,
  // findable businesses only, hedge anything not independently confirmable.
  extendedStay?: FlagshipStay[];
  extendedProviders?: FlagshipTransportProvider[];
};

const flagshipCityGuides: Record<string, FlagshipCityGuide> = {
  "saudi-arabia/riyadh": {
    storyEn: [
      "Two centuries ago, Riyadh was a walled town of mudbrick alleys inside the oasis of Diriyah, a seat of power, faith and trade at the heart of the Najd. Today it is one of the fastest-changing capitals on earth, and both versions of the city are still standing, a few kilometres apart.",
      "Spend a morning in At-Turaif, where the sun-dried walls of the first Saudi state have been carefully restored, and an evening under the glass sky bridge of Kingdom Centre, 300 metres above the same ground. In between: a dining scene now drawing chefs from Paris and Tokyo, an entertainment district built at giga-project scale, and a desert that is never more than a short drive from wherever you're standing.",
      "This is a first look at what a few days in Riyadh could hold. Tell us your dates and who's travelling, and we'll shape the rest around you.",
    ],
    storyAr: [
      "قبل قرنين من الزمن، كانت الرياض بلدة مسوّرة بأزقة من الطين داخل واحة الدرعية، مركزًا للسلطة والإيمان والتجارة في قلب نجد. واليوم أصبحت واحدة من أسرع عواصم العالم تحوّلًا، ولا تزال نسختا المدينة قائمتين على بعد كيلومترات قليلة من بعضهما.",
      "اقضِ صباحًا في حي الطريف حيث رُممت جدران الدولة السعودية الأولى الطينية بعناية، ثم أمسية تحت الجسر الزجاجي لبرج المملكة على ارتفاع 300 متر فوق الأرض ذاتها. وبينهما، مشهد طعام يجذب اليوم طهاة من باريس وطوكيو، وحيّ ترفيهي بُني بمقياس المشاريع العملاقة، وصحراء لا تبعد أبدًا أكثر من دقائق قليلة أينما كنت.",
      "هذه لمحة أولى عمّا يمكن أن تحمله أيام قليلة في الرياض. أخبرنا بتواريخك ومن سيرافقك، وسنشكّل الباقي حولك.",
    ],
    pullQuoteEn: "Some cities show you their history. Riyadh lets you walk through it, then hands you a rollercoaster that didn't exist a year ago.",
    pullQuoteAr: "بعض المدن تُريك تاريخها. الرياض تتركك تمشي داخله، ثم تمنحك أفعوانية لم تكن موجودة قبل عام.",
    weather: {
      bestWindow: {
        labelEn: "Best time to visit",
        labelAr: "أفضل وقت للزيارة",
        monthsEn: "November – March",
        monthsAr: "نوفمبر – مارس",
        tempEn: "22–29°C, dry and pleasant",
        tempAr: "22–29°م، أجواء جافة ولطيفة",
        noteEn: "Riyadh's cool season, comfortable for walking Diriyah and Boulevard World in the evenings.",
        noteAr: "موسم الرياض المعتدل، مناسب للتجول في الدرعية والبوليفارد وورلد مساءً.",
      },
      peakHeat: {
        labelEn: "Peak summer heat",
        labelAr: "ذروة الحر الصيفي",
        monthsEn: "June – August",
        monthsAr: "يونيو – أغسطس",
        tempEn: "Up to 45°C, very dry",
        tempAr: "حتى 45°م، جو جاف جدًا",
        noteEn: "Plan around air-conditioned museums and evening hours; keep midday outdoor time short.",
        noteAr: "خطط حول المتاحف المكيفة والساعات المسائية، واجعل وقت الظهيرة في الخارج قصيرًا.",
      },
      tipEn: "Riyadh gets almost no rain year-round, pack for sun and dry heat even in winter.",
      tipAr: "لا تشهد الرياض أمطارًا تقريبًا طوال العام، فاستعد للشمس والجو الجاف حتى في الشتاء.",
    },
    transportation: [
      {
        modeEn: "Riyadh Metro",
        modeAr: "مترو الرياض",
        descriptionEn: "Six driverless lines connect King Khalid International Airport to the city centre, Olaya, KAFD and the universities. The airport line costs just 4 SAR.",
        descriptionAr: "ستة خطوط بلا سائق تربط مطار الملك خالد الدولي بوسط المدينة والعليا ومركز الملك عبدالله المالي والجامعات. تكلفة خط المطار 4 ريالات فقط.",
      },
      {
        modeEn: "Uber & Careem",
        modeAr: "أوبر وكريم",
        descriptionEn: "Both operate 24 hours a day from the airport and across the city, the easiest way for most visitors to get around.",
        descriptionAr: "يعملان على مدار الساعة من المطار وفي أنحاء المدينة، وهما الطريقة الأسهل لمعظم الزوار للتنقل.",
      },
      {
        modeEn: "Rental car",
        modeAr: "استئجار سيارة",
        descriptionEn: "Worth it for day trips beyond the city, Diriyah, the Edge of the World or Qiddiya. Major companies have desks at the airport.",
        descriptionAr: "يستحق التجربة للرحلات اليومية خارج المدينة، مثل الدرعية وحافة العالم والقدية. تتوفر مكاتب الشركات الكبرى في المطار.",
      },
    ],
    trustedProviders: [
      {
        nameEn: "Blacklane",
        nameAr: "بلاكلين",
        typeEn: "International chauffeur service",
        typeAr: "خدمة سائق خاص عالمية",
        noteEn: "A well-established global chauffeur booking platform operating in Riyadh, useful for airport transfers or a driver by the hour, book directly and confirm current rates.",
        noteAr: "منصة عالمية راسخة لحجز السائقين الخاصين تعمل في الرياض، مفيدة لتوصيل المطار أو حجز سائق بالساعة، يُفضل الحجز مباشرة والتأكد من الأسعار الحالية.",
      },
      {
        nameEn: "Hello Chauffeur",
        nameAr: "هيلو شوفير",
        typeEn: "Licensed private driver",
        typeAr: "سائق خاص مرخّص",
        noteEn: "A Saudi-operating chauffeur service with bilingual, formally trained drivers, positioned as Ministry of Transport compliant, worth confirming current licensing when booking.",
        noteAr: "خدمة سائقين خاصين تعمل في السعودية بسائقين ثنائيي اللغة ومدربين رسميًا، وتُوصف بالامتثال لوزارة النقل، ويُفضل التأكد من الترخيص الحالي عند الحجز.",
      },
    ],
    faq: [
      {
        questionEn: "What is Riyadh famous for?",
        questionAr: "بم تشتهر الرياض؟",
        answerEn: "Riyadh is known for the contrast between Diriyah, the restored mudbrick birthplace of the first Saudi state, and a fast-changing modern skyline led by the Kingdom Centre. It's also become a major entertainment hub, home to Six Flags Qiddiya City and AquaRabia, both opened within the last year.",
        answerAr: "تشتهر الرياض بالتناقض بين الدرعية، مهد الدولة السعودية الأولى المبني بالطين والمرمم، وأفقها الحديث المتغير بسرعة بقيادة برج المملكة. كما أصبحت مركزًا ترفيهيًا رئيسيًا، موطن سيكس فلاغز القدية وأكوارابيا، وكلاهما افتُتح خلال العام الماضي.",
      },
      {
        questionEn: "What's the best time of year to visit Riyadh?",
        questionAr: "ما أفضل وقت في السنة لزيارة الرياض؟",
        answerEn: "November through March, when daytime temperatures sit around 22–29°C. Summer (June–August) regularly hits 45°C, so plan outdoor time for morning or evening if you're visiting then.",
        answerAr: "من نوفمبر إلى مارس، حين تتراوح درجات الحرارة نهارًا بين 22 و29 درجة مئوية. أما الصيف (يونيو إلى أغسطس) فتصل الحرارة فيه غالبًا إلى 45 درجة، فخطط لوقتك في الخارج صباحًا أو مساءً إن كانت زيارتك حينها.",
      },
      {
        questionEn: "How many days should I spend in Riyadh?",
        questionAr: "كم يومًا يجب أن أقضي في الرياض؟",
        answerEn: "Three to five days is enough to cover Diriyah, the National Museum, Kingdom Centre and a day at Qiddiya's Six Flags or AquaRabia, without rushing.",
        answerAr: "تكفي ثلاثة إلى خمسة أيام لتغطية الدرعية والمتحف الوطني وبرج المملكة ويوم في سيكس فلاغز أو أكوارابيا في القدية، من دون استعجال.",
      },
      {
        questionEn: "What are the best things to do in Riyadh?",
        questionAr: "ما أفضل الأنشطة في الرياض؟",
        answerEn: "Walking At-Turaif in Diriyah, crossing the Kingdom Centre sky bridge, the National Museum, and the newer Qiddiya attractions, Six Flags for thrill rides and AquaRabia for the region's largest water park.",
        answerAr: "التجول في حي الطريف بالدرعية، وعبور الجسر الزجاجي لبرج المملكة، والمتحف الوطني، ومعالم القدية الأحدث، سيكس فلاغز للألعاب المثيرة وأكوارابيا أكبر منتزه مائي في المنطقة.",
      },
      {
        questionEn: "Is Riyadh safe for tourists?",
        questionAr: "هل الرياض آمنة للسياح؟",
        answerEn: "Yes, Saudi Arabia has a low crime rate and Riyadh is generally very safe to walk around, including in the evening. Normal travel precautions still apply.",
        answerAr: "نعم، تتمتع السعودية بمعدل جريمة منخفض والرياض آمنة عمومًا للتجول فيها، حتى في المساء. وتبقى احتياطات السفر المعتادة سارية.",
      },
      {
        questionEn: "What should I wear in Riyadh?",
        questionAr: "ماذا يجب أن أرتدي في الرياض؟",
        answerEn: "Modest, smart-casual clothing is appreciated for both men and women; there's no mandatory dress code for visitors, but covering shoulders and knees is a good default outside hotels and malls.",
        answerAr: "الملابس المحتشمة والأنيقة العملية مناسبة للرجال والنساء؛ لا يوجد زي إلزامي للزوار، لكن تغطية الكتفين والركبتين خيار جيد خارج الفنادق والمولات.",
      },
      {
        questionEn: "Do I need a visa to visit Riyadh?",
        questionAr: "هل أحتاج تأشيرة لزيارة الرياض؟",
        answerEn: "Many nationalities can apply for a Saudi tourist eVisa online before travelling. We can help confirm what applies to you as part of planning your trip.",
        answerAr: "يمكن لكثير من الجنسيات التقدم للحصول على التأشيرة السياحية الإلكترونية السعودية عبر الإنترنت قبل السفر. يمكننا مساعدتك في تأكيد ما ينطبق عليك ضمن التخطيط لرحلتك.",
      },
      {
        questionEn: "Is Riyadh good for families?",
        questionAr: "هل الرياض مناسبة للعائلات؟",
        answerEn: "Yes. AquaRabia, Boulevard World in season, family-friendly museums and a growing number of parks make it an easy city to plan around children of most ages.",
        answerAr: "نعم. أكوارابيا وبوليفارد وورلد في موسمه والمتاحف الملائمة للعائلات وعدد متزايد من الحدائق تجعلها مدينة سهلة التخطيط حول الأطفال من مختلف الأعمار.",
      },
      {
        questionEn: "What's the food scene like in Riyadh?",
        questionAr: "كيف هو مشهد الطعام في الرياض؟",
        answerEn: "Contemporary Saudi and Najdi cooking sits alongside an increasingly international fine-dining scene, restaurants like La Petite Maison and Myazu have made Riyadh a genuine dining destination in the last few years.",
        answerAr: "يتجاور المطبخ السعودي والنجدي المعاصر مع مشهد طعام راقٍ متنامٍ وعالمي الطابع، إذ جعلت مطاعم مثل لا بوتيت ميزون ومايازو من الرياض وجهة طعام حقيقية في السنوات الأخيرة.",
      },
    ],
    travelTips: [
      {
        en: "The weekend in Saudi Arabia is Friday–Saturday, not Saturday–Sunday, plan opening hours accordingly.",
        ar: "عطلة نهاية الأسبوع في السعودية هي الجمعة والسبت، وليست السبت والأحد، فخطط لمواعيد العمل تبعًا لذلك.",
      },
      {
        en: "Alcohol isn't sold or served anywhere in the Kingdom.",
        ar: "لا يُباع الكحول ولا يُقدَّم في أي مكان بالمملكة.",
      },
      {
        en: "Many shops pause briefly around Friday midday prayer, build a little flexibility into your plans.",
        ar: "تتوقف كثير من المحلات لفترة قصيرة حول صلاة الجمعة، فامنح خططك بعض المرونة.",
      },
      {
        en: "Tipping isn't mandatory but is appreciated, especially for drivers and in restaurants.",
        ar: "الإكرامية ليست إلزامية لكنها محل تقدير، خصوصًا للسائقين وفي المطاعم.",
      },
      {
        en: "The Riyadh Metro and buses run on a single ticket system, useful if you're combining both.",
        ar: "يعمل مترو الرياض والحافلات بنظام تذكرة واحدة، وهو مفيد إذا جمعت بين الاثنين.",
      },
      {
        en: "Ride-hailing apps (Uber, Careem) are the simplest way to get around if you'd rather not rent a car.",
        ar: "تطبيقات طلب المشاوير مثل أوبر وكريم هي الطريقة الأبسط للتنقل إن كنت تفضل عدم استئجار سيارة.",
      },
    ],
    attractions: [
      {
        nameEn: "Diriyah & At-Turaif",
        nameAr: "الدرعية وحي الطريف",
        categoryEn: "Heritage",
        categoryAr: "تراث",
        descriptionEn: "The birthplace of the first Saudi state, with restored mudbrick walls and a UNESCO World Heritage skyline at dusk.",
        descriptionAr: "مهد الدولة السعودية الأولى، جدران طينية مرممة وأفق مسجل في التراث العالمي لليونسكو عند الغروب.",
      },
      {
        nameEn: "National Museum & Al Murabba",
        nameAr: "المتحف الوطني والمربع",
        categoryEn: "Culture",
        categoryAr: "ثقافة",
        descriptionEn: "Saudi history end to end, a short walk from the palaces of the historic Al Murabba district.",
        descriptionAr: "تاريخ السعودية كاملًا، على بعد خطوات من قصور حي المربع التاريخي.",
      },
      {
        nameEn: "Kingdom Centre & KAFD",
        nameAr: "برج المملكة ومركز الملك عبدالله المالي",
        categoryEn: "Skyline",
        categoryAr: "أفق المدينة",
        descriptionEn: "The city's signature glass sky bridge, 300 metres up, with the new financial district glittering beyond.",
        descriptionAr: "الجسر الزجاجي الشهير على ارتفاع 300 متر، وحي مالي جديد يلمع خلفه.",
      },
      {
        nameEn: "Six Flags Qiddiya City",
        nameAr: "سيكس فلاغز القدية",
        categoryEn: "Entertainment",
        categoryAr: "ترفيه",
        descriptionEn: "Opened December 2025, Six Flags' first park outside North America, home to Falcons Flight, the world's tallest, fastest coaster. About 40 minutes from central Riyadh.",
        descriptionAr: "افتُتحت في ديسمبر 2025، أول منتزه لسيكس فلاغز خارج أمريكا الشمالية، وتضم لعبة Falcons Flight الأعلى والأسرع في العالم، على بعد نحو 40 دقيقة من وسط الرياض.",
        badgeEn: "Newly opened",
        badgeAr: "افتُتح حديثًا",
      },
      {
        nameEn: "AquaRabia",
        nameAr: "أكوارابيا",
        categoryEn: "Family",
        categoryAr: "عائلي",
        descriptionEn: "The region's largest water park, opened April 2026 in Qiddiya, with 22 rides including four world-record attractions.",
        descriptionAr: "أكبر منتزه مائي في المنطقة، افتُتح في أبريل 2026 في القدية، ويضم 22 لعبة من بينها أربع ألعاب حائزة على أرقام قياسية عالمية.",
        badgeEn: "Newly opened",
        badgeAr: "افتُتح حديثًا",
      },
      {
        nameEn: "Boulevard World",
        nameAr: "بوليفارد وورلد",
        categoryEn: "Seasonal",
        categoryAr: "موسمي",
        descriptionEn: "24 country-themed zones, the world's largest artificial lake and submarine rides. Open seasonally during Riyadh Season, so check dates before you plan around it.",
        descriptionAr: "24 منطقة بطابع دول مختلفة، وأكبر بحيرة اصطناعية في العالم ورحلات غواصات، ويعمل موسميًا خلال موسم الرياض، لذا تحقق من المواعيد قبل التخطيط حوله.",
      },
    ],
    dining: [
      {
        nameEn: "La Petite Maison",
        nameAr: "لا بوتيت ميزون",
        cuisineEn: "French",
        cuisineAr: "فرنسي",
        descriptionEn: "An award-winning Riyadh outpost of the acclaimed French bistro group, in the heart of Olaya.",
        descriptionAr: "فرع الرياض الحائز على جوائز لمجموعة المطاعم الفرنسية الشهيرة، في قلب حي العليا.",
      },
      {
        nameEn: "Myazu",
        nameAr: "مايازو",
        cuisineEn: "Japanese",
        cuisineAr: "ياباني",
        descriptionEn: "Precision Japanese cooking ranked among MENA's 50 Best Restaurants.",
        descriptionAr: "مطبخ ياباني متقن ضمن قائمة أفضل 50 مطعمًا في الشرق الأوسط وشمال أفريقيا.",
      },
      {
        // "Porterhouse", one word, is the name it actually trades under.
        nameEn: "Porterhouse",
        nameAr: "بورترهاوس",
        cuisineEn: "Steakhouse",
        cuisineAr: "ستيك هاوس",
        descriptionEn: "Classic New York steakhouse spirit with globally sourced beef, in a sleek Olaya setting.",
        descriptionAr: "أجواء ستيك هاوس نيويوركية أصيلة ولحوم مختارة عالميًا، في أجواء أنيقة بحي العليا.",
      },
      {
        nameEn: "Yauatcha",
        nameAr: "ياواتشا",
        cuisineEn: "Dim sum",
        cuisineAr: "ديم سم",
        descriptionEn: "Refined Cantonese dim sum from the team behind Hakkasan.",
        descriptionAr: "ديم سم كانتوني راقٍ من فريق مطعم هاكاسان الشهير.",
      },
    ],
    stay: [
      {
        nameEn: "Four Seasons Hotel Riyadh at Kingdom Centre",
        nameAr: "فندق فور سيزونز الرياض في برج المملكة",
        descriptionEn: "Floors 30 to 50 of the Kingdom Centre tower, with the city's skyline as a permanent backdrop.",
        descriptionAr: "يشغل الطوابق من 30 إلى 50 في برج المملكة، وأفق المدينة خلفية دائمة له.",
        tier: "luxury",
      },
      {
        nameEn: "The Ritz-Carlton, Riyadh",
        nameAr: "ريتز كارلتون الرياض",
        descriptionEn: "52 acres of landscaped gardens in the Diplomatic Quarter, one of the most decorated hotels in the Kingdom.",
        descriptionAr: "حدائق مصممة على مساحة 52 فدانًا في حي السفارات، وأحد أكثر الفنادق حصولًا على تكريمات في المملكة.",
        tier: "luxury",
      },
      {
        nameEn: "ibis Riyadh Al Muhammadiyah",
        nameAr: "آيبيس الرياض المحمدية",
        descriptionEn: "A reliable international budget chain in Al Olaya, a short walk from Olaya Mall, with the straightforward comfort ibis is known for worldwide.",
        descriptionAr: "سلسلة عالمية اقتصادية موثوقة في حي العليا، على بعد دقائق سيرًا من العليا مول، براحة بسيطة تشتهر بها آيبيس عالميًا.",
        tier: "budget",
      },
      {
        nameEn: "Al Muhaidb Al Olaya",
        nameAr: "المهيدب العليا",
        descriptionEn: "Serviced apartments from the established Saudi hospitality group Al Muhaidb, a practical, well-located choice for families or longer stays.",
        descriptionAr: "شقق مخدومة من مجموعة المهيدب السعودية الراسخة في الضيافة، خيار عملي وجيد الموقع للعائلات أو الإقامات الأطول.",
        tier: "budget",
      },
    ],
    extendedStay: [
      {
        nameEn: "Mandarin Oriental Al Faisaliah, Riyadh",
        nameAr: "ماندارين أورينتال الفيصلية، الرياض",
        descriptionEn: "Set inside the landmark Al Faisaliah Tower in Olaya, with the tower's golden glass sphere as a backdrop, six restaurants and a women's spa.",
        descriptionAr: "يقع داخل برج الفيصلية الشهير في العليا، وتتصدره الكرة الزجاجية الذهبية للبرج، مع ستة مطاعم ومنتجع صحي مخصص للسيدات.",
        tier: "luxury",
      },
      {
        nameEn: "Fairmont Riyadh",
        nameAr: "فيرمونت الرياض",
        descriptionEn: "A 298-room address inside the Business Gate complex, about 15 minutes from King Khalid International Airport.",
        descriptionAr: "فندق بـ298 غرفة داخل مجمع بزنس جيت، على بعد نحو 15 دقيقة من مطار الملك خالد الدولي.",
        tier: "luxury",
      },
      {
        nameEn: "Courtyard by Marriott Riyadh Olaya",
        nameAr: "كورتيارد من ماريوت الرياض العليا",
        descriptionEn: "A dependable Marriott address in the heart of Olaya, with two restaurants, an outdoor pool and a sun terrace.",
        descriptionAr: "عنوان موثوق من ماريوت في قلب العليا، بمطعمين ومسبح خارجي وتراس مشمس.",
      },
      {
        nameEn: "Novotel Suites Riyadh Olaya",
        nameAr: "نوفوتيل سويتس الرياض العليا",
        descriptionEn: "Self-catering suites on Olaya Street with kitchenettes, an indoor pool and spa, a practical base for longer stays.",
        descriptionAr: "أجنحة بمطابخ صغيرة في شارع العليا، مع مسبح داخلي ومنتجع صحي، قاعدة عملية للإقامات الأطول.",
      },
      {
        nameEn: "Boudl Al Olaya",
        nameAr: "بودل العليا",
        descriptionEn: "Saudi-owned hotel apartments on Olaya Main Street, a short walk from Al Faisaliah Tower and Mall, a straightforward budget base in a central location.",
        descriptionAr: "شقق فندقية سعودية الملكية في شارع العليا الرئيسي، على بعد خطوات من برج الفيصلية ومولها، خيار اقتصادي بسيط في موقع مركزي.",
        tier: "budget",
      },
    ],
    extendedProviders: [
      {
        nameEn: "NAYLAM",
        nameAr: "نيلم",
        typeEn: "Saudi luxury chauffeur app",
        typeAr: "تطبيق سائق خاص فاخر سعودي",
        noteEn: "A Saudi-founded chauffeur app covering Riyadh, Jeddah and Dammam with app-based booking for airport transfers, hourly hire and city-to-city trips, a homegrown alternative to the global platforms, worth confirming current rates and driver vetting when booking.",
        noteAr: "تطبيق سائقين خاصين تأسس في السعودية ويغطي الرياض وجدة والدمام، مع حجز عبر التطبيق لتوصيل المطار والحجز بالساعة والتنقل بين المدن، بديل محلي عن المنصات العالمية، ويُفضل التأكد من الأسعار الحالية وإجراءات التحقق من السائقين عند الحجز.",
      },
      {
        nameEn: "MyChauffeur",
        nameAr: "ماي شوفير",
        typeEn: "International chauffeur booking platform",
        typeAr: "منصة عالمية لحجز السائقين الخاصين",
        noteEn: "A Germany-based chauffeur booking platform (MyChauffeur GmbH) with a dedicated Riyadh page for airport transfers and hourly hire, similar in model to Blacklane, worth comparing rates and confirming current local coverage when booking.",
        noteAr: "منصة عالمية لحجز السائقين الخاصين مقرها ألمانيا (MyChauffeur GmbH)، ولها صفحة مخصصة للرياض لتوصيل المطار والحجز بالساعة، بنموذج مشابه لبلاكلين، ويُفضل مقارنة الأسعار والتأكد من التغطية المحلية الحالية عند الحجز.",
      },
    ],
    sampleDay: [
      {
        timeEn: "Morning",
        timeAr: "الصباح",
        placeEn: "At-Turaif",
        placeAr: "حي الطريف",
        descriptionEn: "The mudbrick walls of the first Saudi state, quiet before the heat sets in.",
        descriptionAr: "جدران الدولة السعودية الأولى الطينية، هادئة قبل اشتداد الحر.",
      },
      {
        timeEn: "Sunset",
        timeAr: "الغروب",
        placeEn: "Kingdom Centre Sky Bridge",
        placeAr: "الجسر الزجاجي لبرج المملكة",
        descriptionEn: "300 metres up, watching the city turn gold.",
        descriptionAr: "على ارتفاع 300 متر، وأنت تشاهد المدينة تتحول إلى الذهبي.",
      },
      {
        timeEn: "Evening",
        timeAr: "المساء",
        placeEn: "A table at Myazu",
        placeAr: "طاولة في مايازو",
        descriptionEn: "Precision Japanese cooking to close the day.",
        descriptionAr: "مطبخ ياباني متقن يختم اليوم.",
      },
    ],
  },
  "saudi-arabia/jeddah": {
    storyEn: [
      "Jeddah has always been a gateway. For over a thousand years, pilgrims arrived by sea here before travelling on to Makkah, and the city grew rich on that role, coral-stone merchant houses rising along streets built for trade, not tourists.",
      "That old town, Al-Balad, is still standing, its wooden balconies restored one building at a time. A short drive away, the Corniche runs 30 kilometres along the Red Sea, past the world's tallest fountain and a waterfront now lined with restaurants from Rome, Seoul and beyond. Jeddah doesn't choose between its two identities, historic trading post and Red Sea social capital, it simply runs both at once.",
      "This is a first look at what a few days here could feel like. Tell us your dates and who's travelling, and we'll shape the rest around you.",
    ],
    storyAr: [
      "كانت جدة دائمًا بوابة. لأكثر من ألف عام، وصل الحجاج عبر البحر إلى هنا قبل التوجه إلى مكة، ونمت المدينة وازدهرت بهذا الدور، وارتفعت بيوت التجار المبنية بالحجر المرجاني على شوارع صُممت للتجارة لا للسياحة.",
      "تلك المدينة القديمة، البلد، ما زالت قائمة، وتُرمَّم شرفاتها الخشبية مبنى تلو الآخر. وعلى بعد دقائق، يمتد الكورنيش 30 كيلومترًا على طول البحر الأحمر، متجاوزًا أطول نافورة في العالم وواجهة بحرية تصطف عليها اليوم مطاعم من روما وسيول وما وراءهما. جدة لا تختار بين هويتيها، محطة تجارية تاريخية وعاصمة اجتماعية على البحر الأحمر، بل تعيشهما معًا.",
      "هذه لمحة أولى عمّا يمكن أن تشعر به أيام قليلة هنا. أخبرنا بتواريخك ومن سيرافقك، وسنشكّل الباقي حولك.",
    ],
    pullQuoteEn: "This coast has welcomed pilgrims for over a thousand years. Now it's welcoming chefs from three continents, all facing the same sea.",
    pullQuoteAr: "استقبل هذا الساحل الحجاج لأكثر من ألف عام. واليوم يستقبل طهاة من ثلاث قارات، جميعهم يطلّون على البحر ذاته.",
    weather: {
      bestWindow: {
        labelEn: "Best time to visit",
        labelAr: "أفضل وقت للزيارة",
        monthsEn: "November – March",
        monthsAr: "نوفمبر – مارس",
        tempEn: "28–30°C, warm and pleasant",
        tempAr: "28–30°م، دافئة ولطيفة",
        noteEn: "Comfortable for the Corniche and Al-Balad's narrow streets in the evenings.",
        noteAr: "مناسب للتجول في الكورنيش وأزقة البلد الضيقة مساءً.",
      },
      peakHeat: {
        labelEn: "Peak summer heat",
        labelAr: "ذروة الحر الصيفي",
        monthsEn: "June – September",
        monthsAr: "يونيو – سبتمبر",
        tempEn: "Up to 39°C, hot and humid",
        tempAr: "حتى 39°م، حار ورطب",
        noteEn: "Coastal humidity makes it feel heavier than the number suggests; keep to shaded, air-conditioned hours.",
        noteAr: "الرطوبة الساحلية تجعل الحر أثقل مما توحي به الأرقام، فخطط لوقتك في الأماكن المظللة والمكيفة.",
      },
      tipEn: "Jeddah's Red Sea humidity makes the heat feel heavier here than inland Riyadh, even at similar temperatures.",
      tipAr: "رطوبة البحر الأحمر في جدة تجعل الحر أثقل من الرياض حتى عند تقارب درجات الحرارة.",
    },
    transportation: [
      {
        modeEn: "King Abdulaziz International Airport",
        modeAr: "مطار الملك عبدالعزيز الدولي",
        descriptionEn: "About 19km north of the city, 20–45 minutes by road. Official taxis run 100–150 SAR to central Jeddah; Uber and Careem operate 24/7.",
        descriptionAr: "يقع على بعد نحو 19 كم شمال المدينة، وتستغرق الرحلة 20 إلى 45 دقيقة بالسيارة. تتراوح أجرة التاكسي الرسمي بين 100 و150 ريالًا إلى وسط جدة، ويعمل أوبر وكريم على مدار الساعة.",
      },
      {
        modeEn: "Haramain High-Speed Railway",
        modeAr: "قطار الحرمين السريع",
        descriptionEn: "Connects the airport and Jeddah's Sulaymaniyah station directly to Makkah and Madinah, trains roughly hourly, tickets from 65 SAR.",
        descriptionAr: "يربط المطار ومحطة السليمانية في جدة مباشرة بمكة والمدينة، برحلات كل ساعة تقريبًا، وتبدأ التذاكر من 65 ريالًا.",
      },
      {
        modeEn: "Ride-hailing & rental car",
        modeAr: "طلب المشاوير واستئجار السيارات",
        descriptionEn: "Uber and Careem cover the city easily; a rental car is worth it for a relaxed day moving between Al-Balad, the Corniche and the Waterfront.",
        descriptionAr: "يغطي أوبر وكريم المدينة بسهولة، وتستحق السيارة المستأجرة التجربة ليوم مريح للتنقل بين البلد والكورنيش والواجهة البحرية.",
      },
    ],
    trustedProviders: [
      {
        nameEn: "Hello Chauffeur",
        nameAr: "هيلو شوفير",
        typeEn: "Licensed private driver",
        typeAr: "سائق خاص مرخّص",
        noteEn: "Operates across Jeddah and other major Saudi cities with bilingual, formally trained drivers, worth confirming current licensing when booking.",
        noteAr: "تعمل في جدة وغيرها من المدن السعودية الكبرى بسائقين ثنائيي اللغة ومدربين رسميًا، ويُفضل التأكد من الترخيص الحالي عند الحجز.",
      },
      {
        nameEn: "The Royal Chauffeur",
        nameAr: "ذا رويال شوفير",
        typeEn: "Private chauffeur service",
        typeAr: "خدمة سائق خاص",
        noteEn: "Covers Jeddah, Riyadh, Makkah, Madinah and Dammam with dedicated drivers, a reasonable option for city-to-city travel with the same provider.",
        noteAr: "تغطي جدة والرياض ومكة والمدينة والدمام بسائقين مخصصين، خيار معقول للتنقل بين المدن مع مزود واحد.",
      },
    ],
    faq: [
      {
        questionEn: "What is Jeddah famous for?",
        questionAr: "بم تشتهر جدة؟",
        answerEn: "Historic Al-Balad, its UNESCO-listed coral-stone old town, the Red Sea Corniche and the world's tallest fountain, and, historically, its role as the sea gateway for pilgrims heading to Makkah.",
        answerAr: "بحي البلد التاريخي المسجل في تراث اليونسكو المبني بالحجر المرجاني، وكورنيش البحر الأحمر وأطول نافورة في العالم، وتاريخيًا بدورها كبوابة بحرية للحجاج المتجهين إلى مكة.",
      },
      {
        questionEn: "What's the best time of year to visit Jeddah?",
        questionAr: "ما أفضل وقت لزيارة جدة؟",
        answerEn: "November through March, when temperatures sit around 28–30°C. Summer brings both heat and humidity, so plan outdoor time for evenings if visiting June–September.",
        answerAr: "من نوفمبر إلى مارس، حين تتراوح الحرارة بين 28 و30 درجة مئوية. يجمع الصيف بين الحر والرطوبة، فخطط لوقتك في الخارج مساءً إن كانت زيارتك بين يونيو وسبتمبر.",
      },
      {
        questionEn: "How many days should I spend in Jeddah?",
        questionAr: "كم يومًا يجب أن أقضي في جدة؟",
        answerEn: "Three to five days covers Al-Balad, the Corniche, a Red Sea boat day and enough evenings to work through the dining scene.",
        answerAr: "تكفي ثلاثة إلى خمسة أيام لتغطية البلد والكورنيش ويوم بحري في البحر الأحمر وأمسيات كافية لتجربة مشهد الطعام.",
      },
      {
        questionEn: "What are the best things to do in Jeddah?",
        questionAr: "ما أفضل الأنشطة في جدة؟",
        answerEn: "Wandering Al-Balad's coral-stone streets, a Corniche walk to the King Fahd Fountain, a Red Sea diving or boat trip, and dinner on the Waterfront.",
        answerAr: "التجول في أزقة البلد المرجانية، ونزهة على الكورنيش إلى نافورة الملك فهد، ورحلة غوص أو قارب في البحر الأحمر، وعشاء على الواجهة البحرية.",
      },
      {
        questionEn: "Is Jeddah safe for tourists?",
        questionAr: "هل جدة آمنة للسياح؟",
        answerEn: "Yes, Jeddah is generally very safe to walk around, including the Corniche and Al-Balad in the evening. Normal travel precautions still apply.",
        answerAr: "نعم، جدة آمنة عمومًا للتجول فيها، بما في ذلك الكورنيش والبلد مساءً. وتبقى احتياطات السفر المعتادة سارية.",
      },
      {
        questionEn: "What should I wear in Jeddah?",
        questionAr: "ماذا يجب أن أرتدي في جدة؟",
        answerEn: "Modest, breathable clothing works best given the humidity; swimwear is fine at hotel pools and private beaches, but cover up elsewhere.",
        answerAr: "الملابس المحتشمة الخفيفة هي الأنسب نظرًا للرطوبة، والملابس البحرية مناسبة في مسابح الفنادق والشواطئ الخاصة، لكن يُفضَّل التغطي في أماكن أخرى.",
      },
      {
        questionEn: "Do I need a visa to visit Jeddah?",
        questionAr: "هل أحتاج تأشيرة لزيارة جدة؟",
        answerEn: "Many nationalities can apply for a Saudi tourist eVisa online before travelling. We can help confirm what applies to you as part of planning your trip.",
        answerAr: "يمكن لكثير من الجنسيات التقدم للحصول على التأشيرة السياحية الإلكترونية السعودية عبر الإنترنت قبل السفر. يمكننا مساعدتك في تأكيد ما ينطبق عليك ضمن التخطيط لرحلتك.",
      },
      {
        questionEn: "Is Jeddah good for families?",
        questionAr: "هل جدة مناسبة للعائلات؟",
        answerEn: "Yes, the Corniche's parks and beaches, boat trips and the walkable old town all work well for children of most ages.",
        answerAr: "نعم، تناسب حدائق وشواطئ الكورنيش ورحلات القارب والمدينة القديمة القابلة للمشي فيها الأطفال من مختلف الأعمار.",
      },
      {
        questionEn: "What's the food scene like in Jeddah?",
        questionAr: "كيف هو مشهد الطعام في جدة؟",
        answerEn: "Hijazi classics sit alongside an ambitious international dining scene, San Carlo, Sura and Sultan's Steakhouse among the names that have raised the city's profile in recent years.",
        answerAr: "تتجاور الأطباق الحجازية الكلاسيكية مع مشهد طعام عالمي طموح، ومن الأسماء التي رفعت مكانة المدينة في السنوات الأخيرة سان كارلو وسورا وسلطانز ستيك هاوس.",
      },
    ],
    travelTips: [
      { en: "The weekend in Saudi Arabia is Friday–Saturday, plan opening hours accordingly.", ar: "عطلة نهاية الأسبوع في السعودية هي الجمعة والسبت، فخطط لمواعيد العمل تبعًا لذلك." },
      { en: "Alcohol isn't sold or served anywhere in the Kingdom.", ar: "لا يُباع الكحول ولا يُقدَّم في أي مكان بالمملكة." },
      { en: "Pack light, breathable clothing, Jeddah's coastal humidity makes the heat feel heavier than the temperature alone suggests.", ar: "احزم ملابس خفيفة وقابلة للتهوية، فرطوبة جدة الساحلية تجعل الحر أثقل مما توحي به درجة الحرارة وحدها." },
      { en: "Top restaurants book out fast, especially Thursday and Friday evenings, reserve ahead where you can.", ar: "تمتلئ حجوزات أفضل المطاعم بسرعة، خاصة مساء الخميس والجمعة، فاحجز مسبقًا متى أمكن." },
      { en: "The Haramain train makes Makkah or Madinah an easy add-on if your visit allows it.", ar: "يجعل قطار الحرمين إضافة مكة أو المدينة إلى رحلتك أمرًا سهلًا إن سمح وقتك بذلك." },
      { en: "Tipping isn't mandatory but is appreciated, especially for drivers and in restaurants.", ar: "الإكرامية ليست إلزامية لكنها محل تقدير، خصوصًا للسائقين وفي المطاعم." },
    ],
    attractions: [
      {
        nameEn: "Al-Balad",
        nameAr: "البلد",
        categoryEn: "Heritage",
        categoryAr: "تراث",
        descriptionEn: "Jeddah's UNESCO-listed old town, coral-stone merchant houses with carved wooden balconies, still mid-restoration in places.",
        descriptionAr: "المدينة القديمة في جدة المسجلة في تراث اليونسكو، بيوت تجارية من الحجر المرجاني بشرفات خشبية منحوتة، ولا تزال قيد الترميم في بعض الأجزاء.",
      },
      {
        nameEn: "Jeddah Corniche & King Fahd Fountain",
        nameAr: "كورنيش جدة ونافورة الملك فهد",
        categoryEn: "Waterfront",
        categoryAr: "واجهة بحرية",
        descriptionEn: "A 30-kilometre Red Sea promenade anchored by the world's tallest fountain, spraying seawater over 260 metres up.",
        descriptionAr: "ممشى بحري يمتد 30 كيلومترًا على البحر الأحمر، وتتوسطه أطول نافورة في العالم التي تقذف المياه لأكثر من 260 مترًا.",
      },
      {
        nameEn: "Red Sea diving & boat days",
        nameAr: "الغوص ورحلات البحر الأحمر",
        categoryEn: "Nature",
        categoryAr: "طبيعة",
        descriptionEn: "Coral reefs a short boat ride from the city, among the most accessible diving in the Kingdom.",
        descriptionAr: "شعاب مرجانية على بعد رحلة قصيرة بالقارب من المدينة، من أسهل مواقع الغوص وصولًا في المملكة.",
      },
      {
        nameEn: "Jeddah Waterfront",
        nameAr: "واجهة جدة البحرية",
        categoryEn: "Skyline",
        categoryAr: "أفق المدينة",
        descriptionEn: "A newer stretch of the Corniche, home to the city's most ambitious restaurant openings and Red Sea views.",
        descriptionAr: "امتداد أحدث من الكورنيش، يضم أبرز افتتاحات المطاعم في المدينة وإطلالات على البحر الأحمر.",
      },
    ],
    dining: [
      {
        // The Jeddah restaurant is San Carlo Cicchetti; "San Carlo" alone is
        // the group, and the fuller name is what a search will find.
        nameEn: "San Carlo Cicchetti",
        nameAr: "سان كارلو تشيكيتي",
        cuisineEn: "Italian",
        cuisineAr: "إيطالي",
        descriptionEn: "The most reliable address in the city for Italian cooking, in a polished Corniche-adjacent setting.",
        descriptionAr: "العنوان الأكثر ثباتًا في المدينة للمطبخ الإيطالي، في أجواء أنيقة قريبة من الكورنيش.",
      },
      {
        nameEn: "Sura",
        nameAr: "سورا",
        cuisineEn: "Korean",
        cuisineAr: "كوري",
        descriptionEn: "Jeddah's best-regarded Korean fine dining, precise and polished.",
        descriptionAr: "أبرز مطاعم المطبخ الكوري الراقي في جدة، بدقة وأناقة.",
      },
      {
        nameEn: "Sultan's Steakhouse",
        nameAr: "سلطانز ستيك هاوس",
        cuisineEn: "Steakhouse",
        cuisineAr: "ستيك هاوس",
        descriptionEn: "A steakhouse and grill built around globally sourced cuts, popular after a fountain-side walk.",
        descriptionAr: "مطعم شواء وستيك يعتمد على لحوم مختارة عالميًا، وجهة مفضلة بعد نزهة قرب النافورة.",
      },
      {
        nameEn: "Lusin",
        nameAr: "لوسين",
        cuisineEn: "Armenian",
        cuisineAr: "أرمني",
        descriptionEn: "Middle Eastern and Armenian cooking in a warm, unhurried setting.",
        descriptionAr: "مطبخ شرق أوسطي وأرمني في أجواء دافئة وهادئة.",
      },
    ],
    // Removed 2026-08-18: "Four Seasons Hotel Jeddah at the Corniche" was
    // listed here as the city's top-rated address, but it does not exist yet.
    // It is under construction on the Corniche, originally due 2024 and now
    // reported as targeting 2027, and is not open or taking bookings. It was
    // reachable by the AI draft generator, so a customer could have been sent
    // a plan built around a hotel they cannot stay in. Add it back when it
    // actually opens.
    stay: [
      {
        nameEn: "Rosewood Jeddah",
        nameAr: "روزوود جدة",
        descriptionEn: "Modern elegance and traditional Arabian hospitality, also on the North Corniche.",
        descriptionAr: "أناقة عصرية وضيافة عربية أصيلة، على الكورنيش الشمالي أيضًا.",
        tier: "luxury",
      },
      {
        nameEn: "Radisson Hotel Jeddah Tahlia",
        nameAr: "راديسون جدة التحلية",
        descriptionEn: "A recognizable international chain on Tahlia Street, a solid value pick within easy reach of the Corniche.",
        descriptionAr: "سلسلة عالمية معروفة في شارع التحلية، خيار جيد القيمة وقريب من الكورنيش.",
        tier: "budget",
      },
      {
        nameEn: "Ekono Hotel",
        nameAr: "إيكونو",
        descriptionEn: "A straightforward budget chain with a Jeddah airport-area property, a practical pick for a short stopover.",
        descriptionAr: "سلسلة اقتصادية بسيطة بفرع قرب مطار جدة، خيار عملي للتوقف القصير.",
        tier: "budget",
      },
    ],
    sampleDay: [
      {
        timeEn: "Morning",
        timeAr: "الصباح",
        placeEn: "Al-Balad",
        placeAr: "البلد",
        descriptionEn: "Wander the coral-stone streets before the day's heat arrives.",
        descriptionAr: "تجوّل في أزقة الحجر المرجاني قبل اشتداد حر النهار.",
      },
      {
        timeEn: "Sunset",
        timeAr: "الغروب",
        placeEn: "King Fahd Fountain",
        placeAr: "نافورة الملك فهد",
        descriptionEn: "A Corniche walk as the fountain lights up against the Red Sea sky.",
        descriptionAr: "نزهة على الكورنيش بينما تُضاء النافورة أمام سماء البحر الأحمر.",
      },
      {
        timeEn: "Evening",
        timeAr: "المساء",
        placeEn: "Dinner at San Carlo",
        placeAr: "عشاء في سان كارلو",
        descriptionEn: "Italian cooking to close the day, minutes from the water.",
        descriptionAr: "مطبخ إيطالي يختم اليوم، على بعد دقائق من البحر.",
      },
    ],
  },
  "saudi-arabia/alula": {
    storyEn: [
      "AlUla spent centuries as a waypoint, caravans passing through on the incense route, then the Nabataeans carving more than a hundred tombs into its sandstone cliffs at Hegra, the first place in Saudi Arabia to be named a UNESCO World Heritage Site.",
      "The Kingdom has spent the last several years turning that history into one of its most carefully designed destinations: boutique desert resorts tucked into Ashar Valley, a concert hall built as the world's largest mirrored building, and dinners served at the edge of canyons that didn't have a restaurant a decade ago. AlUla rewards travellers who want depth over volume, a handful of unforgettable days rather than a checklist.",
      "This is a first glimpse of what your time in AlUla could hold. Tell us your dates and who's travelling, and we'll shape the rest around you.",
    ],
    storyAr: [
      "كانت العلا لقرون محطة عبور، تمر بها القوافل على طريق البخور، ثم نحت الأنباط أكثر من مئة مقبرة في منحدراتها الرملية في الحِجر، أول موقع في السعودية يُسجَّل في التراث العالمي لليونسكو.",
      "أمضت المملكة السنوات الأخيرة تحوّل هذا التاريخ إلى واحدة من أكثر وجهاتها دقة في التصميم، منتجعات صحراوية فاخرة في وادي عشار، وقاعة حفلات بُنيت كأكبر مبنى مرآوي في العالم، وعشاء يُقدَّم على حافة أودية لم يكن بها مطعم قبل عقد من الزمن. تكافئ العلا من يبحث عن العمق لا الكم، أيامًا قليلة لا تُنسى بدل قائمة طويلة من المحطات.",
      "هذه لمحة أولى عمّا يمكن أن تحمله أيامك في العلا. أخبرنا بتواريخك ومن سيرافقك، وسنشكّل الباقي حولك.",
    ],
    pullQuoteEn: "Two thousand years ago, someone carved a tomb into these cliffs and believed it would outlast them. It did, and today the same valley serves dinner with a view of it.",
    pullQuoteAr: "قبل ألفي عام، نحت أحدهم مقبرة في هذه المنحدرات مؤمنًا بأنها ستبقى بعده. وقد بقيت، واليوم يُقدَّم العشاء في الوادي ذاته وأنت تطل عليها.",
    weather: {
      bestWindow: {
        labelEn: "Best time to visit",
        labelAr: "أفضل وقت للزيارة",
        monthsEn: "November – March",
        monthsAr: "نوفمبر – مارس",
        tempEn: "20–27°C by day, near freezing at night",
        tempAr: "20–27°م نهارًا، قريبة من الصفر ليلًا",
        noteEn: "Ideal for walking Hegra and Elephant Rock; bring a jacket for after dark.",
        noteAr: "مثالية للتجول في الحِجر وجبل الفيل، فاصطحب سترة دافئة لليل.",
      },
      peakHeat: {
        labelEn: "Peak summer heat",
        labelAr: "ذروة الحر الصيفي",
        monthsEn: "June – September",
        monthsAr: "يونيو – سبتمبر",
        tempEn: "Over 40°C, hot and dry",
        tempAr: "أكثر من 40°م، حار وجاف",
        noteEn: "Most outdoor sites are best visited early morning or after sunset.",
        noteAr: "يُفضَّل زيارة المواقع الخارجية في الصباح الباكر أو بعد الغروب.",
      },
      tipEn: "AlUla's desert nights swing much colder than the daytime heat suggests, pack layers even in winter.",
      tipAr: "ليالي العلا الصحراوية أبرد بكثير مما توحي به حرارة النهار، فاصطحب طبقات دافئة حتى في الشتاء.",
    },
    transportation: [
      {
        modeEn: "AlUla International Airport",
        modeAr: "مطار العلا الدولي",
        descriptionEn: "Direct domestic flights from Riyadh, Jeddah and Dammam, plus international routes from Dubai and Doha. About 25 minutes by taxi to town.",
        descriptionAr: "رحلات مباشرة من الرياض وجدة والدمام، إضافة إلى رحلات دولية من دبي والدوحة. نحو 25 دقيقة بالتاكسي إلى البلدة.",
      },
      {
        modeEn: "Rental car or scenic drive",
        modeAr: "استئجار سيارة أو طريق بانورامي",
        descriptionEn: "AlUla is reachable by road from Madinah or Tabuk in around 4 hours, a scenic option if you're combining destinations.",
        descriptionAr: "يمكن الوصول إلى العلا برًا من المدينة أو تبوك خلال نحو 4 ساعات، خيار جميل إن كنت تجمع بين وجهات.",
      },
      {
        modeEn: "Resort transfers",
        modeAr: "توصيل المنتجعات",
        descriptionEn: "Most AlUla resorts arrange private transfers from the airport directly, worth asking about when you book your stay.",
        descriptionAr: "ترتب معظم منتجعات العلا توصيلًا خاصًا من المطار مباشرة، يستحق السؤال عنه عند حجز إقامتك.",
      },
    ],
    faq: [
      {
        questionEn: "What is AlUla famous for?",
        questionAr: "بم تشتهر العلا؟",
        answerEn: "Hegra, Saudi Arabia's first UNESCO World Heritage Site with over 110 Nabataean tombs, Elephant Rock, and Maraya, the world's largest mirrored building.",
        answerAr: "بالحِجر، أول موقع تراث عالمي لليونسكو في السعودية بأكثر من 110 مقابر نبطية، وجبل الفيل، ومرايا أكبر مبنى مرآوي في العالم.",
      },
      {
        questionEn: "What's the best time of year to visit AlUla?",
        questionAr: "ما أفضل وقت لزيارة العلا؟",
        answerEn: "November through March, with daytime temperatures around 20–27°C. Nights get cold even in winter, so pack layers.",
        answerAr: "من نوفمبر إلى مارس، بحرارة نهارية بين 20 و27 درجة مئوية. تبرد الليالي حتى في الشتاء، فاصطحب طبقات دافئة.",
      },
      {
        questionEn: "How many days should I spend in AlUla?",
        questionAr: "كم يومًا يجب أن أقضي في العلا؟",
        answerEn: "Three to four days is typical, enough for Hegra, Elephant Rock, Maraya and one destination dinner without rushing.",
        answerAr: "من ثلاثة إلى أربعة أيام عادة، وهو وقت كافٍ للحِجر وجبل الفيل ومرايا وعشاء استثنائي واحد من دون استعجال.",
      },
      {
        questionEn: "What are the best things to do in AlUla?",
        questionAr: "ما أفضل الأنشطة في العلا؟",
        answerEn: "Touring Hegra's tombs, watching sunset at Elephant Rock, a concert or dinner at Maraya, and a quiet evening in Sharaan Nature Reserve.",
        answerAr: "جولة في مقابر الحِجر، ومشاهدة الغروب عند جبل الفيل، وحفلة أو عشاء في مرايا، وأمسية هادئة في محمية شرعان الطبيعية.",
      },
      {
        questionEn: "Is AlUla safe for tourists?",
        questionAr: "هل العلا آمنة للسياح؟",
        answerEn: "Yes, AlUla is a carefully managed tourism destination and very safe to explore, including its desert sites.",
        answerAr: "نعم، العلا وجهة سياحية تُدار بعناية وآمنة جدًا للاستكشاف، بما في ذلك مواقعها الصحراوية.",
      },
      {
        questionEn: "What should I wear in AlUla?",
        questionAr: "ماذا يجب أن أرتدي في العلا؟",
        answerEn: "Comfortable, modest clothing for desert walking by day, and warm layers for cold evenings, temperatures swing a lot after sunset.",
        answerAr: "ملابس مريحة ومحتشمة للمشي الصحراوي نهارًا، وطبقات دافئة للأمسيات الباردة، إذ تتقلب الحرارة كثيرًا بعد الغروب.",
      },
      {
        questionEn: "Do I need a visa to visit AlUla?",
        questionAr: "هل أحتاج تأشيرة لزيارة العلا؟",
        answerEn: "Many nationalities can apply for a Saudi tourist eVisa online before travelling. We can help confirm what applies to you as part of planning your trip.",
        answerAr: "يمكن لكثير من الجنسيات التقدم للحصول على التأشيرة السياحية الإلكترونية السعودية عبر الإنترنت قبل السفر. يمكننا مساعدتك في تأكيد ما ينطبق عليك ضمن التخطيط لرحلتك.",
      },
      {
        questionEn: "Is AlUla good for families?",
        questionAr: "هل العلا مناسبة للعائلات؟",
        answerEn: "Yes, though it leans toward an older-child and adult experience, desert walks, stargazing and heritage sites rather than playgrounds.",
        answerAr: "نعم، رغم أنها تناسب أكثر الأطفال الأكبر سنًا والبالغين، بمشي صحراوي ورصد نجوم ومواقع تراثية بدل الملاعب.",
      },
      {
        questionEn: "What's the dining scene like in AlUla?",
        questionAr: "كيف هو مشهد الطعام في العلا؟",
        answerEn: "Small but exceptional, destination restaurants like Maraya Social and OKTO pair fine dining with dramatic desert settings rarely found elsewhere.",
        answerAr: "صغير لكنه استثنائي، إذ تجمع مطاعم الوجهات مثل مرايا سوشال وأوكتو بين الطعام الراقي والمشاهد الصحراوية الدرامية النادرة في أماكن أخرى.",
      },
    ],
    travelTips: [
      { en: "AlUla is a managed destination, many sites require advance booking through Experience AlUla rather than walk-up access.", ar: "العلا وجهة مُدارة، وتتطلب معظم المواقع حجزًا مسبقًا عبر إكسبيرينس العلا بدل الدخول المباشر." },
      { en: "Nights get genuinely cold even when the day was hot, always pack a jacket.", ar: "تبرد الليالي فعليًا حتى بعد نهار حار، فاصطحب سترة دائمًا." },
      { en: "The weekend in Saudi Arabia is Friday–Saturday, plan opening hours accordingly.", ar: "عطلة نهاية الأسبوع في السعودية هي الجمعة والسبت، فخطط لمواعيد العمل تبعًا لذلك." },
      { en: "Alcohol isn't sold or served anywhere in the Kingdom.", ar: "لا يُباع الكحول ولا يُقدَّم في أي مكان بالمملكة." },
      { en: "The Winter at Tantora festival (roughly December–March) adds concerts and events, but also higher demand for stays.", ar: "يضيف مهرجان شتاء طنطورة (من ديسمبر إلى مارس تقريبًا) حفلات وفعاليات، لكنه يرفع أيضًا الطلب على الإقامة." },
      { en: "Book destination restaurants like Maraya Social well ahead, tables go quickly.", ar: "احجز في مطاعم الوجهات مثل مرايا سوشال مبكرًا، فالطاولات تُحجز بسرعة." },
    ],
    attractions: [
      {
        nameEn: "Hegra",
        nameAr: "الحِجر",
        categoryEn: "Heritage",
        categoryAr: "تراث",
        descriptionEn: "Saudi Arabia's first UNESCO World Heritage Site, more than 110 monumental Nabataean tombs carved into sandstone.",
        descriptionAr: "أول موقع تراث عالمي لليونسكو في السعودية، أكثر من 110 مقابر نبطية ضخمة منحوتة في الصخر الرملي.",
      },
      {
        nameEn: "Elephant Rock",
        nameAr: "جبل الفيل",
        categoryEn: "Landmark",
        categoryAr: "معلم",
        descriptionEn: "A 52-metre sandstone formation shaped by wind over millions of years, AlUla's most recognisable sight.",
        descriptionAr: "تكوين رملي بارتفاع 52 مترًا شكّلته الرياح عبر ملايين السنين، أشهر معالم العلا.",
      },
      {
        nameEn: "Maraya",
        nameAr: "مرايا",
        categoryEn: "Culture",
        categoryAr: "ثقافة",
        descriptionEn: "The world's largest mirrored building, reflecting the desert around it, home to concerts and destination dining.",
        descriptionAr: "أكبر مبنى مرآوي في العالم، يعكس الصحراء من حوله، ويستضيف الحفلات ومطاعم استثنائية.",
      },
      {
        nameEn: "AlUla Old Town",
        nameAr: "بلدة العلا القديمة",
        categoryEn: "Heritage",
        categoryAr: "تراث",
        descriptionEn: "Mudbrick lanes at the foot of the oasis, once the region's trading and pilgrimage crossroads.",
        descriptionAr: "أزقة طينية عند سفح الواحة، كانت يومًا ملتقى القوافل التجارية والحجاج.",
      },
      {
        nameEn: "Sharaan Nature Reserve",
        nameAr: "محمية شرعان الطبيعية",
        categoryEn: "Nature",
        categoryAr: "طبيعة",
        descriptionEn: "A protected canyon landscape reintroducing native wildlife, best experienced at dawn or dusk.",
        descriptionAr: "محمية طبيعية في الأودية تعيد توطين الحياة البرية المحلية، وتُزار غالبًا عند الفجر أو الغروب.",
      },
    ],
    dining: [
      {
        nameEn: "Maraya Social",
        nameAr: "مرايا سوشال",
        cuisineEn: "Contemporary",
        cuisineAr: "عصري",
        descriptionEn: "Chef Jason Atherton's restaurant atop the mirrored building, local produce in his signature style.",
        descriptionAr: "مطعم الشيف جيسون أذرتون فوق المبنى المرآوي، منتجات محلية بأسلوبه المميز.",
      },
      {
        nameEn: "OKTO",
        nameAr: "أوكتو",
        cuisineEn: "Greek",
        cuisineAr: "يوناني",
        descriptionEn: "Mediterranean flavours perched at Harrat Viewpoint, a favourite for sunset dinners.",
        descriptionAr: "نكهات متوسطية على إطلالة الحرة، وجهة مفضلة لعشاء الغروب.",
      },
      {
        nameEn: "Circolo",
        nameAr: "شيركولو",
        cuisineEn: "Italian",
        cuisineAr: "إيطالي",
        descriptionEn: "Wood-fired pizza and small plates on the edge of the oasis, with valley and mountain views.",
        descriptionAr: "بيتزا مخبوزة على الحطب وأطباق صغيرة عند حافة الواحة، بإطلالات على الوادي والجبال.",
      },
      {
        nameEn: "Hegra Visitor Centre hospitality",
        nameAr: "ضيافة مركز زوار الحِجر",
        cuisineEn: "Traditional",
        cuisineAr: "تقليدي",
        descriptionEn: "Dates, dried fruit and Saudi coffee served the traditional way before you enter the tombs.",
        descriptionAr: "تمر وفواكه مجففة وقهوة سعودية تُقدَّم بالطريقة التقليدية قبل دخول المقابر.",
      },
    ],
    stay: [
      {
        nameEn: "Banyan Tree AlUla",
        nameAr: "بانيان تري العلا",
        descriptionEn: "An all-villa desert sanctuary in Ashar Valley, most villas with a private pool.",
        descriptionAr: "ملاذ صحراوي بفلل كاملة في وادي عشار، ومعظمها بمسبح خاص.",
      },
      {
        nameEn: "Our Habitas AlUla",
        nameAr: "هابيتاس العلا",
        descriptionEn: "Set among the sandstone rocks of Ashar Valley, a favourite for first-time visitors to AlUla.",
        descriptionAr: "يقع بين صخور وادي عشار الرملية، وجهة مفضلة لزوار العلا لأول مرة.",
      },
    ],
    extendedStay: [
      {
        nameEn: "Dar Tantora The House Hotel",
        nameAr: "دار تنطورة ذا هاوس هوتيل",
        descriptionEn: "A 30-room earth-built boutique hotel inside AlUla's Old Town, constructed with traditional mudbrick methods around a historic fort.",
        descriptionAr: "فندق بوتيكي مبني من الطين بثلاثين غرفة داخل بلدة العلا القديمة، شُيِّد بأساليب البناء الطينية التقليدية حول قلعة تاريخية.",
        tier: "luxury",
      },
      {
        nameEn: "The Chedi Hegra",
        nameAr: "ذا شيدي الحِجر",
        descriptionEn: "35 guesthouses and suites built into a former railway station and fort inside the Hegra UNESCO site, with butler service.",
        descriptionAr: "35 جناحًا وغرفة ضيافة أُقيمت داخل محطة قطار وقلعة سابقتين ضمن موقع الحِجر المسجل في تراث اليونسكو، مع خدمة الخادم الشخصي.",
        tier: "luxury",
      },
      {
        nameEn: "Shaden Resort",
        nameAr: "منتجع شادن",
        descriptionEn: "A 4-star resort near AlUla's Old Town with an outdoor pool and garden, a straightforward, well-reviewed mid-range base.",
        descriptionAr: "منتجع أربع نجوم قرب بلدة العلا القديمة بمسبح خارجي وحديقة، خيار متوسط الفئة موثوق ومشهود له بتقييمات جيدة.",
      },
      {
        nameEn: "Cloud7 Residence AlUla",
        nameAr: "كلاود 7 ريزيدنس العلا",
        descriptionEn: "Design-led bungalows in the Al Aziziyah district with a pool and mountain views, part of the boutique Cloud7 hotel group.",
        descriptionAr: "بنغلوهات بتصميم عصري في حي العزيزية بمسبح وإطلالات جبلية، ضمن مجموعة كلاود 7 الفندقية البوتيكية.",
      },
      {
        nameEn: "Al Wateen Hotel",
        nameAr: "فندق الوطين",
        descriptionEn: "A straightforward 3-star hotel in AlUla, useful for travellers prioritising sites over amenities, though nightly rates vary widely with demand so it isn't a reliable budget anchor.",
        descriptionAr: "فندق بسيط من ثلاث نجوم في العلا، مفيد للمسافرين الذين يفضلون المواقع على الرفاهية، إلا أن أسعاره الليلية تتفاوت كثيرًا حسب الطلب، لذا لا يُعتمد كخيار اقتصادي ثابت.",
      },
    ],
    extendedProviders: [
      {
        nameEn: "Easy Access AlUla",
        nameAr: "إيزي أكسس العلا",
        typeEn: "Local private driver & car hire",
        typeAr: "سائق خاص محلي وتأجير سيارات مع سائق",
        noteEn: "A registered local AlUla operator offering sedan and SUV hire with a driver plus airport transfers, worth confirming current terms and vehicle options directly when booking.",
        noteAr: "مشغّل محلي مسجّل في العلا يقدّم تأجير سيارات صالون ودفع رباعي مع سائق إضافة إلى توصيل المطار، ويُفضل تأكيد الشروط الحالية وخيارات المركبات مباشرة عند الحجز.",
      },
    ],
    sampleDay: [
      {
        timeEn: "Morning",
        timeAr: "الصباح",
        placeEn: "Hegra",
        placeAr: "الحِجر",
        descriptionEn: "Walk among the tombs before the desert heat builds.",
        descriptionAr: "تجوّل بين المقابر قبل اشتداد حر الصحراء.",
      },
      {
        timeEn: "Sunset",
        timeAr: "الغروب",
        placeEn: "Elephant Rock",
        placeAr: "جبل الفيل",
        descriptionEn: "Watch the sandstone change colour as the sun drops.",
        descriptionAr: "شاهد الصخر الرملي يتغير لونه مع غروب الشمس.",
      },
      {
        timeEn: "Evening",
        timeAr: "المساء",
        placeEn: "Dinner at Maraya Social",
        placeAr: "عشاء في مرايا سوشال",
        descriptionEn: "A table atop the world's largest mirrored building to close the day.",
        descriptionAr: "طاولة فوق أكبر مبنى مرآوي في العالم لتختم بها يومك.",
      },
    ],
  },
  "saudi-arabia/makkah": {
    tone: "worship",
    storyEn: [
      "Makkah is the direction of prayer five times a day for two billion people, and for many travellers, standing before the Kaaba for the first time is a moment years in the making. This guide exists for one reason, to help the practical parts of that journey go smoothly, so your attention can stay where it belongs.",
      "Entry to Makkah is restricted to Muslims, every road into the city has a checkpoint, and the correct visa and Nusuk permit matter as much as your flight. Once you're here, the Masjid al-Haram sits at the centre of everything, hotels, transport and the day's rhythm all orient around it.",
      "Tell us your dates, who's travelling with you and whether this is Umrah or a longer visit, and we'll help arrange the details around your worship.",
    ],
    storyAr: [
      "مكة هي قِبلة الصلاة خمس مرات يوميًا لملياري إنسان، وبالنسبة لكثير من المسافرين، فإن الوقوف أمام الكعبة لأول مرة لحظة استغرق التحضير لها سنوات. هذا الدليل موجود لسبب واحد، مساعدتك في تسهيل الجوانب العملية من هذه الرحلة، حتى يبقى تركيزك حيث ينبغي أن يكون.",
      "دخول مكة مقتصر على المسلمين، وعلى كل طريق مؤدٍ إلى المدينة نقطة تفتيش، والتأشيرة الصحيحة وتصريح نُسُك لا يقلان أهمية عن تذكرة طيرانك. وبمجرد وصولك، يكون المسجد الحرام مركز كل شيء، فالفنادق والتنقل وإيقاع يومك كلها تدور حوله.",
      "أخبرنا بتواريخك ومن سيرافقك وما إذا كانت هذه رحلة عمرة أو زيارة أطول، وسنساعدك في ترتيب التفاصيل حول عبادتك.",
    ],
    pullQuoteEn: "For many, this is a journey planned for years and lived in a single moment. Everything else is logistics.",
    pullQuoteAr: "بالنسبة للكثيرين، هذه رحلة يُخطَّط لها سنوات وتُعاش في لحظة واحدة. وكل ما عداها مجرد تفاصيل تنظيمية.",
    weather: {
      bestWindow: {
        labelEn: "Most manageable months",
        labelAr: "أكثر الأشهر اعتدالًا",
        monthsEn: "January – March",
        monthsAr: "يناير – مارس",
        tempEn: "30–35°C, still warm",
        tempAr: "30–35°م، لا تزال دافئة",
        noteEn: "The most comfortable window for walking to and from the Haram; still warm by most standards.",
        noteAr: "الفترة الأكثر راحة للمشي من وإلى الحرم والعودة إليه، مع أنها لا تزال دافئة.",
      },
      peakHeat: {
        labelEn: "Peak summer heat",
        labelAr: "ذروة الحر الصيفي",
        monthsEn: "June – August",
        monthsAr: "يونيو – أغسطس",
        tempEn: "Up to 44°C, extreme heat",
        tempAr: "حتى 44°م، حر شديد",
        noteEn: "Outdoor time between prayers is genuinely demanding; prioritise shaded routes and stay hydrated.",
        noteAr: "الوقت في الخارج بين الصلوات يكون شاقًا فعليًا، فاختر المسارات المظللة واحرص على شرب الماء باستمرار.",
      },
      tipEn: "Makkah stays warm even in its coolest months, and Hajj dates shift earlier each Gregorian year, so always check the season before you plan.",
      tipAr: "تبقى مكة دافئة حتى في أبرد أشهرها، ومواعيد الحج تتقدم كل عام ميلادي، لذا تحقق دائمًا من الموسم قبل التخطيط.",
    },
    transportation: [
      {
        modeEn: "Via Jeddah Airport",
        modeAr: "عبر مطار جدة",
        descriptionEn: "Most pilgrims fly into King Abdulaziz International Airport (Jeddah), then continue to Makkah by car or the Haramain High-Speed Railway.",
        descriptionAr: "يصل معظم الحجاج عبر مطار الملك عبدالعزيز الدولي في جدة، ثم يتابعون إلى مكة بالسيارة أو قطار الحرمين السريع.",
      },
      {
        modeEn: "Haramain High-Speed Railway",
        modeAr: "قطار الحرمين السريع",
        descriptionEn: "Connects Jeddah's airport and city to a Makkah station roughly 3–4km from the Haram, journey under an hour from Jeddah.",
        descriptionAr: "يربط مطار جدة ومدينتها بمحطة في مكة تبعد نحو 3 إلى 4 كم عن الحرم، برحلة أقل من ساعة من جدة.",
      },
      {
        modeEn: "Within Makkah",
        modeAr: "داخل مكة",
        descriptionEn: "Taxis and ride-hailing cover the city itself; most Haram-area hotels are within easy walking distance of the mosque.",
        descriptionAr: "تغطي سيارات الأجرة وتطبيقات طلب المشاوير المدينة نفسها، وتقع معظم فنادق منطقة الحرم على مسافة قريبة يمكن المشي إليها.",
      },
    ],
    faq: [
      {
        questionEn: "Do I need a special visa to visit Makkah?",
        questionAr: "هل أحتاج تأشيرة خاصة لزيارة مكة؟",
        answerEn: "Yes, entry requires a Muslim-only Umrah visa or a Hajj permit through the Nusuk platform; a standard tourist visa does not grant access to Makkah.",
        answerAr: "نعم، يتطلب الدخول تأشيرة عمرة مقتصرة على المسلمين أو تصريح حج عبر منصة نُسُك؛ ولا تمنح التأشيرة السياحية العادية دخول مكة.",
      },
      {
        questionEn: "Can non-Muslims visit Makkah?",
        questionAr: "هل يمكن لغير المسلمين زيارة مكة؟",
        answerEn: "No. Entry to Makkah is restricted to Muslims, and this is enforced at checkpoints on every road into the city.",
        answerAr: "لا. دخول مكة مقتصر على المسلمين، ويُطبَّق ذلك عند نقاط التفتيش على كل طريق مؤدٍ إلى المدينة.",
      },
      {
        questionEn: "How do I get to Makkah from the airport?",
        questionAr: "كيف أصل إلى مكة من المطار؟",
        answerEn: "Most journeys begin at Jeddah's King Abdulaziz International Airport, then continue by car or the Haramain High-Speed Railway, under an hour to central Makkah.",
        answerAr: "تبدأ معظم الرحلات من مطار الملك عبدالعزيز الدولي في جدة، ثم تتابع بالسيارة أو قطار الحرمين السريع، بأقل من ساعة إلى وسط مكة.",
      },
      {
        questionEn: "What's the best time of year for Umrah?",
        questionAr: "ما أفضل وقت لأداء العمرة؟",
        answerEn: "January to March offers the most manageable weather. Ramadan and the weeks around Hajj (roughly April–May 2026) see the highest crowds and, during Hajj itself, Umrah visas pause entirely.",
        answerAr: "تقدم الفترة من يناير إلى مارس أكثر الأجواء اعتدالًا. ويشهد رمضان والأسابيع المحيطة بالحج (من أبريل إلى مايو 2026 تقريبًا) أعلى الأعداد، وتتوقف تأشيرات العمرة تمامًا خلال موسم الحج نفسه.",
      },
      {
        questionEn: "How many days should I plan for Umrah?",
        questionAr: "كم يومًا يجب أن أخطط لأداء العمرة؟",
        answerEn: "Three to six days is typical, enough time for the rituals themselves without feeling rushed, plus rest between visits to the Haram.",
        answerAr: "من ثلاثة إلى ستة أيام عادة، وقت كافٍ لأداء المناسك من دون استعجال، مع راحة بين زيارات الحرم.",
      },
      {
        questionEn: "What should I bring or wear?",
        questionAr: "ماذا يجب أن أحضر أو أرتدي؟",
        answerEn: "Men wear the two-piece white ihram for the rituals; women wear modest, loose clothing covering the body. Comfortable walking shoes and a refillable water bottle are worth packing too.",
        answerAr: "يرتدي الرجال الإحرام الأبيض المكوّن من قطعتين لأداء المناسك، وترتدي النساء ملابس فضفاضة ومحتشمة تغطي الجسم. يستحق أيضًا اصطحاب حذاء مشي مريح وقارورة ماء قابلة لإعادة التعبئة.",
      },
      {
        questionEn: "Is Makkah safe?",
        questionAr: "هل مكة آمنة؟",
        answerEn: "Yes, Makkah is extremely well organised for the volume of pilgrims it receives, with security, crowd management and medical support throughout the Haram.",
        answerAr: "نعم، مكة منظمة جيدًا جدًا نظرًا لأعداد الحجاج الكبيرة التي تستقبلها، مع أمن وإدارة للحشود ودعم طبي في أنحاء الحرم.",
      },
      {
        questionEn: "Can I visit Makkah and Madinah on the same trip?",
        questionAr: "هل يمكنني زيارة مكة والمدينة في الرحلة نفسها؟",
        answerEn: "Yes, this is the most common way to perform Umrah. The Haramain High-Speed Railway connects the two cities in under three hours.",
        answerAr: "نعم، وهذه الطريقة الأكثر شيوعًا لأداء العمرة. يربط قطار الحرمين السريع بين المدينتين في أقل من ثلاث ساعات.",
      },
      {
        questionEn: "What's the Hajj season and how is it different?",
        questionAr: "ما موسم الحج وكيف يختلف؟",
        answerEn: "Hajj follows the Islamic lunar calendar, so its dates shift about 11 days earlier each Gregorian year. It requires a separate Hajj permit, not a standard Umrah visa, and sees the Kingdom's highest visitor numbers of the year.",
        answerAr: "يتبع الحج التقويم الهجري، فتتقدم مواعيده نحو 11 يومًا كل عام ميلادي. ويتطلب تصريح حج منفصلًا وليس تأشيرة عمرة عادية، ويشهد أعلى أعداد الزوار في المملكة خلال العام.",
      },
    ],
    travelTips: [
      { en: "A Muslim-only Umrah visa or Hajj permit is required, standard tourist eVisas don't grant entry to Makkah.", ar: "تُشترط تأشيرة عمرة مقتصرة على المسلمين أو تصريح حج، ولا تمنح التأشيرة السياحية العادية دخول مكة." },
      { en: "Register any worship permits needed through the official Nusuk platform ahead of travel.", ar: "سجّل أي تصاريح عبادة مطلوبة عبر منصة نُسُك الرسمية قبل السفر." },
      { en: "Comfortable, well-worn walking shoes matter more than almost anything else you pack.", ar: "الحذاء المريح والمجرَّب مسبقًا أهم من أي شيء آخر تقريبًا تحزمه." },
      { en: "Carry a refillable water bottle, Zamzam water is freely available throughout the Haram.", ar: "احمل قارورة ماء قابلة لإعادة التعبئة، فماء زمزم متوفر مجانًا في أنحاء الحرم." },
      { en: "Outside the rituals themselves, dress modestly and comfortably; loose, breathable fabric handles the heat best.", ar: "خارج أداء المناسك نفسها، ارتدِ ملابس محتشمة ومريحة؛ فالأقمشة الفضفاضة القابلة للتهوية تتحمل الحر بشكل أفضل." },
      { en: "Book accommodation near the Haram well in advance, especially around Ramadan, prices and demand rise sharply.", ar: "احجز الإقامة قرب الحرم مسبقًا، خاصة حول رمضان، إذ ترتفع الأسعار والطلب بشكل كبير." },
    ],
    attractions: [
      {
        nameEn: "Masjid al-Haram & the Kaaba",
        nameAr: "المسجد الحرام والكعبة",
        categoryEn: "The Haram",
        categoryAr: "الحرم",
        descriptionEn: "The centre of Islam and the direction of prayer for Muslims worldwide, home to the Kaaba and the Zamzam well.",
        descriptionAr: "مركز الإسلام وقِبلة المسلمين في أنحاء العالم، ويضم الكعبة المشرفة وبئر زمزم.",
      },
      {
        nameEn: "Jabal al-Nour & the Cave of Hira",
        nameAr: "جبل النور وغار حراء",
        categoryEn: "Sacred history",
        categoryAr: "تاريخ مقدس",
        descriptionEn: "A steep climb above the city to the cave associated with the first revelation, a popular walk for visiting pilgrims.",
        descriptionAr: "صعود شديد فوق المدينة إلى الغار المرتبط ببدء الوحي، ومسار مفضل لدى الحجاج الزائرين.",
      },
      {
        nameEn: "Jabal Thawr",
        nameAr: "جبل ثور",
        categoryEn: "Sacred history",
        categoryAr: "تاريخ مقدس",
        descriptionEn: "The mountain south of the Haram associated with the Hijrah, still visited by pilgrims with time to spare.",
        descriptionAr: "الجبل الواقع جنوب الحرم والمرتبط بالهجرة، ولا يزال يزوره الحجاج ممن لديهم وقت إضافي.",
      },
    ],
    dining: [
      {
        nameEn: "Maki House",
        nameAr: "ماكي هاوس",
        cuisineEn: "Japanese",
        cuisineAr: "ياباني",
        descriptionEn: "Japanese cooking in the Al-Awali district, sushi and teppanyaki, a change of pace from the Haram-district chains.",
        descriptionAr: "مطبخ ياباني في حي العوالي، سوشي وتيبانياكي، وتغيير عن السلاسل المنتشرة في محيط الحرم.",
      },
    ],
    stay: [
      {
        nameEn: "Fairmont Makkah Clock Royal Tower",
        nameAr: "فيرمونت مكة كلوك رويال تاور",
        descriptionEn: "Two minutes' walk from Masjid al-Haram, among the closest hotels to the Kaaba.",
        descriptionAr: "على بعد دقيقتين مشيًا من المسجد الحرام، من أقرب الفنادق إلى الكعبة.",
      },
      {
        nameEn: "Raffles Makkah Palace",
        nameAr: "رافلز مكة بالاس",
        descriptionEn: "An all-suite hotel directly adjoining the Haram, with 24-hour personal butler service.",
        descriptionAr: "فندق بأجنحة كاملة يلاصق الحرم مباشرة، مع خدمة الخادم الشخصي على مدار الساعة.",
      },
    ],
    extendedStay: [
      {
        nameEn: "Conrad Makkah",
        nameAr: "كونراد مكة",
        descriptionEn: "In the Jabal Omar development with direct pedestrian access to Masjid al-Haram, about a 2-minute walk.",
        descriptionAr: "في مشروع جبل عمر مع ممر مشاة مباشر إلى المسجد الحرام، على بعد نحو دقيقتين مشيًا.",
        tier: "luxury",
      },
      {
        nameEn: "Swissôtel Al Maqam Makkah",
        nameAr: "سويسوتيل المقام مكة",
        descriptionEn: "Inside the Abraj Al Bait complex, among the closest hotels to the Haram at roughly 50 metres.",
        descriptionAr: "داخل مجمع أبراج البيت، من أقرب الفنادق إلى الحرم بمسافة تقارب 50 مترًا.",
        tier: "luxury",
      },
      {
        nameEn: "Pullman ZamZam Makkah",
        nameAr: "بولمان زمزم مكة",
        descriptionEn: "Part of the Clock Tower complex facing King Abdulaziz Gate, a 2-3 minute walk to the Haram.",
        descriptionAr: "ضمن مجمع أبراج الساعة مقابل باب الملك عبدالعزيز، على بعد دقيقتين إلى ثلاث دقائق مشيًا من الحرم.",
      },
      {
        nameEn: "Mövenpick Hajar Tower Makkah",
        nameAr: "موڤنبيك حجر تاور مكة",
        descriptionEn: "Within the Clock Tower complex, about 100 metres from King Abdulaziz Gate.",
        descriptionAr: "ضمن مجمع أبراج الساعة، على بعد نحو 100 متر من باب الملك عبدالعزيز.",
      },
      {
        nameEn: "Al Kiswah Towers Hotel",
        nameAr: "فندق أبراج الكسوة",
        descriptionEn: "A large group-oriented property on Ajyad Street, roughly 700-800 metres from the Haram with a 24-hour shuttle bus.",
        descriptionAr: "منشأة كبيرة موجهة للمجموعات في شارع أجياد، على بعد نحو 700 إلى 800 متر من الحرم مع خدمة حافلات مكوكية على مدار الساعة.",
        tier: "budget",
      },
    ],
    extendedProviders: [
      {
        nameEn: "The Royal Chauffeur",
        nameAr: "ذا رويال شوفير",
        typeEn: "Private chauffeur service",
        typeAr: "خدمة سائق خاص",
        noteEn: "Covers Makkah alongside Jeddah, Madinah, Riyadh and Dammam with dedicated drivers, a reasonable option for pilgrims moving between cities with the same provider.",
        noteAr: "تغطي مكة إلى جانب جدة والمدينة والرياض والدمام بسائقين مخصصين، خيار معقول للحجاج المتنقلين بين المدن مع مزود واحد.",
      },
      {
        nameEn: "Online Umrah Taxi",
        nameAr: "أونلاين عمرة تاكسي",
        typeEn: "Pilgrimage transport specialist",
        typeAr: "متخصص في نقل الحجاج والمعتمرين",
        noteEn: "A Makkah-based private transport operator with a physical address in the city, positioned as licensed with Saudi transport authorities and geared specifically toward Umrah and Ziyarat routes, worth confirming current licensing and fixed fares when booking.",
        noteAr: "مشغّل نقل خاص مقره مكة وله عنوان فعلي في المدينة، يُوصف بأنه مرخّص لدى جهات النقل السعودية ومتخصص تحديدًا في مسارات العمرة والزيارة، ويُفضل التأكد من الترخيص الحالي والأسعار الثابتة عند الحجز.",
      },
    ],
    sampleDay: [],
  },
  "saudi-arabia/madinah": {
    tone: "worship",
    storyEn: [
      "Madinah is where the Prophet Muhammad settled after the Hijrah, and where he is buried beneath the green dome that now marks the skyline. Unlike Makkah, the city itself is open to non-Muslim visitors, but entry to Al-Masjid an-Nabawi, the Prophet's Mosque, remains for Muslims only.",
      "Most journeys here are unhurried. Pilgrims often pair Madinah with Makkah on the same trip, and the city rewards a slower pace, prayers at the mosque, a walk to Quba, the first mosque built in Islam, and a quiet afternoon at Uhud, where the Prophet's companions are buried.",
      "Tell us your dates, who's travelling with you and how this fits alongside the rest of your journey, and we'll help arrange the details around your visit.",
    ],
    storyAr: [
      "المدينة المنورة هي حيث استقر النبي محمد صلى الله عليه وسلم بعد الهجرة، وحيث دُفن تحت القبة الخضراء التي تميز أفق المدينة اليوم. وخلافًا لمكة، فإن المدينة نفسها مفتوحة لغير المسلمين، لكن دخول المسجد النبوي يبقى مقتصرًا على المسلمين.",
      "غالبًا ما تكون الرحلات هنا هادئة وغير متعجلة. كثيرًا ما يجمع الحجاج بين المدينة ومكة في الرحلة ذاتها، وتكافئ المدينة من يتمهل، الصلاة في المسجد، ومشي إلى قباء أول مسجد بُني في الإسلام، وعصر هادئ عند أحد حيث دُفن صحابة النبي.",
      "أخبرنا بتواريخك ومن سيرافقك وكيف تتناسب هذه الزيارة مع بقية رحلتك، وسنساعدك في ترتيب التفاصيل حولها.",
    ],
    pullQuoteEn: "Whether it's a first visit or a fifth, the walk toward the green dome tends to go quiet in the same way each time.",
    pullQuoteAr: "سواء كانت هذه زيارتك الأولى أو الخامسة، فإن المشي نحو القبة الخضراء يخيّم عليه الهدوء ذاته في كل مرة.",
    weather: {
      bestWindow: {
        labelEn: "Most comfortable months",
        labelAr: "أكثر الأشهر راحة",
        monthsEn: "November – February",
        monthsAr: "نوفمبر – فبراير",
        tempEn: "25–28°C, mild and pleasant",
        tempAr: "25–28°م، معتدلة ولطيفة",
        noteEn: "Comfortable for walking to and from the mosque and visiting Quba and Uhud.",
        noteAr: "مناسبة للمشي من وإلى المسجد وزيارة قباء وأحد.",
      },
      peakHeat: {
        labelEn: "Peak summer heat",
        labelAr: "ذروة الحر الصيفي",
        monthsEn: "June – August",
        monthsAr: "يونيو – أغسطس",
        tempEn: "Up to 43°C, very hot",
        tempAr: "حتى 43°م، حر شديد جدًا",
        noteEn: "Keep outdoor time between prayers short and stay hydrated.",
        noteAr: "اجعل وقتك في الخارج بين الصلوات قصيرًا واحرص على شرب الماء.",
      },
      tipEn: "Many travellers visit Madinah and Makkah on the same trip, plan the order around your dates and energy for each city.",
      tipAr: "يزور كثير من المسافرين المدينة ومكة في الرحلة نفسها، فخطط للترتيب بينهما حسب تواريخك وطاقتك في كل مدينة.",
    },
    transportation: [
      {
        modeEn: "Prince Mohammad bin Abdulaziz Airport",
        modeAr: "مطار الأمير محمد بن عبدالعزيز",
        descriptionEn: "Madinah's own airport, with direct flights from Jeddah, Riyadh and international routes for pilgrims flying straight in.",
        descriptionAr: "مطار المدينة الخاص بها، برحلات مباشرة من جدة والرياض ورحلات دولية للحجاج القادمين مباشرة.",
      },
      {
        modeEn: "Haramain High-Speed Railway",
        modeAr: "قطار الحرمين السريع",
        descriptionEn: "Connects Madinah to Jeddah, its airport and Makkah, the Madinah station sits about 8–10km from Al-Masjid an-Nabawi.",
        descriptionAr: "يربط المدينة بجدة ومطارها ومكة، وتقع محطة المدينة على بعد نحو 8 إلى 10 كم من المسجد النبوي.",
      },
      {
        modeEn: "Within Madinah",
        modeAr: "داخل المدينة",
        descriptionEn: "Taxis and ride-hailing cover the city easily; many hotels near the mosque are within walking distance of the Haram.",
        descriptionAr: "تغطي سيارات الأجرة وتطبيقات طلب المشاوير المدينة بسهولة، وتقع فنادق كثيرة قرب المسجد على مسافة يمكن المشي إليها.",
      },
    ],
    faq: [
      {
        questionEn: "Can non-Muslims visit Madinah?",
        questionAr: "هل يمكن لغير المسلمين زيارة المدينة؟",
        answerEn: "Yes, unlike Makkah, the city of Madinah itself is open to non-Muslim visitors. Entry to Al-Masjid an-Nabawi, the Prophet's Mosque, remains for Muslims only.",
        answerAr: "نعم، خلافًا لمكة، فإن مدينة المدينة نفسها مفتوحة لغير المسلمين. لكن دخول المسجد النبوي يبقى مقتصرًا على المسلمين.",
      },
      {
        questionEn: "Do I need a visa to visit Madinah?",
        questionAr: "هل أحتاج تأشيرة لزيارة المدينة؟",
        answerEn: "Muslim travellers typically visit on an Umrah visa alongside Makkah. Non-Muslims can generally visit the city on a standard Saudi tourist eVisa; we can help confirm what applies to you.",
        answerAr: "يزور المسلمون عادة بتأشيرة عمرة إلى جانب مكة. ويمكن لغير المسلمين عمومًا زيارة المدينة بتأشيرة سياحية سعودية عادية؛ ويمكننا مساعدتك في تأكيد ما ينطبق عليك.",
      },
      {
        questionEn: "How do I get to Madinah?",
        questionAr: "كيف أصل إلى المدينة؟",
        answerEn: "Either directly by air to Prince Mohammad bin Abdulaziz Airport, or via the Haramain High-Speed Railway from Jeddah or Makkah.",
        answerAr: "إما مباشرة جوًا إلى مطار الأمير محمد بن عبدالعزيز، أو عبر قطار الحرمين السريع من جدة أو مكة.",
      },
      {
        questionEn: "What's the best time of year to visit Madinah?",
        questionAr: "ما أفضل وقت لزيارة المدينة؟",
        answerEn: "November through February, with mild temperatures around 25–28°C, comfortable for walking to Quba and Uhud as well as the mosque.",
        answerAr: "من نوفمبر إلى فبراير، بحرارة معتدلة بين 25 و28 درجة مئوية، مناسبة للمشي إلى قباء وأحد إضافة إلى المسجد.",
      },
      {
        questionEn: "How many days should I spend in Madinah?",
        questionAr: "كم يومًا يجب أن أقضي في المدينة؟",
        answerEn: "Three to five days is typical, enough for unhurried prayers at the mosque plus visits to Quba Mosque and Mount Uhud.",
        answerAr: "من ثلاثة إلى خمسة أيام عادة، وقت كافٍ للصلاة في المسجد من دون استعجال إضافة إلى زيارة مسجد قباء وجبل أحد.",
      },
      {
        questionEn: "What should I wear in Madinah?",
        questionAr: "ماذا يجب أن أرتدي في المدينة؟",
        answerEn: "Modest, comfortable clothing suited to walking, similar to what you'd wear in Makkah. Non-Muslim visitors should also dress modestly out of respect.",
        answerAr: "ملابس محتشمة ومريحة مناسبة للمشي، مشابهة لما يُرتدى في مكة. ويُستحسن أن يرتدي الزوار غير المسلمين أيضًا ملابس محتشمة احترامًا.",
      },
      {
        questionEn: "Is Madinah safe?",
        questionAr: "هل المدينة آمنة؟",
        answerEn: "Yes, Madinah is calm and well organised, with a noticeably slower pace than Makkah even during busy periods.",
        answerAr: "نعم، المدينة هادئة ومنظمة جيدًا، بإيقاع أبطأ ملحوظ من مكة حتى في الفترات المزدحمة.",
      },
      {
        questionEn: "Can I visit Madinah and Makkah on the same trip?",
        questionAr: "هل يمكنني زيارة المدينة ومكة في الرحلة نفسها؟",
        answerEn: "Yes, this is the most common way to travel. The Haramain High-Speed Railway connects the two cities in under three hours.",
        answerAr: "نعم، وهذه الطريقة الأكثر شيوعًا للسفر. يربط قطار الحرمين السريع بين المدينتين في أقل من ثلاث ساعات.",
      },
      {
        questionEn: "What else is there to see beyond the mosque?",
        questionAr: "ما الذي يمكن رؤيته إلى جانب المسجد؟",
        answerEn: "Quba Mosque, the first mosque built in Islam, and Mount Uhud, site of the Battle of Uhud and resting place of 70 of the Prophet's companions, are both short trips from central Madinah.",
        answerAr: "مسجد قباء، أول مسجد بُني في الإسلام، وجبل أحد، موقع غزوة أحد ومقر دفن سبعين من صحابة النبي، وكلاهما على مسافة قصيرة من وسط المدينة.",
      },
    ],
    travelTips: [
      { en: "Entry to Al-Masjid an-Nabawi itself is for Muslims only, even though the city is open to all visitors.", ar: "دخول المسجد النبوي نفسه مقتصر على المسلمين، رغم أن المدينة مفتوحة لجميع الزوار." },
      { en: "Comfortable walking shoes matter, hotels near the mosque still mean a fair amount of walking within the complex.", ar: "الحذاء المريح مهم، فحتى الفنادق القريبة من المسجد تعني قدرًا لا بأس به من المشي داخل المجمع." },
      { en: "Many travellers pair Madinah with Makkah via the Haramain train, plan the order around your energy and dates.", ar: "يجمع كثير من المسافرين بين المدينة ومكة عبر قطار الحرمين، فخطط للترتيب حسب طاقتك وتواريخك." },
      { en: "Dress modestly even outside prayer times, out of respect for the city's character.", ar: "ارتدِ ملابس محتشمة حتى خارج أوقات الصلاة، احترامًا لطابع المدينة." },
      { en: "Quba Mosque and Mount Uhud are both easy half-day additions if your schedule allows.", ar: "يمكن إضافة مسجد قباء وجبل أحد بسهولة كنشاط نصف يوم إن سمح جدولك." },
      { en: "Book Haram-area hotels well ahead during Ramadan and the weeks around Hajj, demand rises sharply.", ar: "احجز فنادق منطقة الحرم مسبقًا خلال رمضان والأسابيع المحيطة بالحج، إذ يرتفع الطلب بشكل كبير." },
    ],
    attractions: [
      {
        nameEn: "Al-Masjid an-Nabawi",
        nameAr: "المسجد النبوي",
        categoryEn: "The Haram",
        categoryAr: "الحرم",
        descriptionEn: "The Prophet's Mosque, marked by the green dome, the second-holiest site in Islam. Entry is for Muslims only.",
        descriptionAr: "المسجد النبوي، الذي تميزه القبة الخضراء، ثاني أقدس موقع في الإسلام. الدخول مقتصر على المسلمين.",
      },
      {
        nameEn: "Quba Mosque",
        nameAr: "مسجد قباء",
        categoryEn: "Sacred history",
        categoryAr: "تاريخ مقدس",
        descriptionEn: "The first mosque built in Islam, and a short, popular visit from central Madinah.",
        descriptionAr: "أول مسجد بُني في الإسلام، وزيارة قصيرة ومحببة من وسط المدينة.",
      },
      {
        nameEn: "Mount Uhud",
        nameAr: "جبل أحد",
        categoryEn: "Sacred history",
        categoryAr: "تاريخ مقدس",
        descriptionEn: "Site of the Battle of Uhud, and the resting place of 70 of the Prophet's companions.",
        descriptionAr: "موقع غزوة أحد، ومقر دفن سبعين من صحابة النبي.",
      },
    ],
    dining: [
      {
        nameEn: "To'mah",
        nameAr: "مطعم طُعمة",
        cuisineEn: "Madani Saudi",
        cuisineAr: "مديني سعودي",
        descriptionEn: "Traditional Madani cooking built on the city's own recipes rather than a general Saudi menu.",
        descriptionAr: "مطبخ مديني تقليدي مبني على وصفات المدينة نفسها، لا على قائمة سعودية عامة.",
      },
      {
        nameEn: "Zaman Jaddi",
        nameAr: "مطعم زمان جدي",
        cuisineEn: "Madani Saudi",
        cuisineAr: "مديني سعودي",
        descriptionEn: "Time-honoured Madani dishes in a heritage setting, for a meal that belongs to the city.",
        descriptionAr: "أطباق مدينية عريقة في أجواء تراثية، لوجبة تنتمي إلى المدينة فعلًا.",
      },
      {
        nameEn: "Social Farm",
        nameAr: "سوشال فارم",
        cuisineEn: "Farm dining",
        cuisineAr: "مطعم مزرعة",
        descriptionEn: "An open-air farm setting away from the Haram district, quieter and slower than the centre.",
        descriptionAr: "أجواء مزرعة في الهواء الطلق بعيدًا عن منطقة الحرم، أهدأ وأبطأ إيقاعًا من المركز.",
      },
      {
        nameEn: "Arabesque",
        nameAr: "مطعم أرابسيك",
        cuisineEn: "Fine dining",
        cuisineAr: "مطبخ راقٍ",
        descriptionEn: "Upscale dining in Madinah, listed by the national tourism board among the city's notable restaurants.",
        descriptionAr: "مطعم راقٍ في المدينة المنورة، أدرجته هيئة السياحة الوطنية ضمن أبرز مطاعم المدينة.",
      },
    ],
    stay: [
      {
        nameEn: "Pullman Zamzam Madinah",
        nameAr: "بولمان زمزم المدينة",
        descriptionEn: "Adjacent to Al-Masjid an-Nabawi, moments from the Al Salam Gate.",
        descriptionAr: "ملاصق للمسجد النبوي، على بعد خطوات من باب السلام.",
      },
      {
        nameEn: "Anwar Al Madinah Mövenpick",
        nameAr: "أنوار المدينة موڤنبيك",
        descriptionEn: "Two minutes from the Prophet's Mosque, with direct mall access.",
        descriptionAr: "على بعد دقيقتين من المسجد النبوي، مع وصول مباشر إلى المول.",
      },
    ],
    extendedStay: [
      // The Oberoi Madinah was removed on 20 August 2026. Oberoi's own site
      // states: "On 1st January 2026, Oberoi Hotels concluded its management
      // of the property", and it is no longer taking reservations. It had sat
      // here as a bookable luxury pick for eight months after closing.
      //
      // Do not re-add it from a booking site. Aggregators kept listing it long
      // after the operator stopped, which is exactly how it survived here.
      // If the building reopens it will be under a different name.
      {
        nameEn: "InterContinental Dar Al Iman Madinah",
        nameAr: "إنتركونتيننتال دار الإيمان المدينة",
        descriptionEn: "Sits within the mosque's outer courtyard, about a minute from the ladies' entrance.",
        descriptionAr: "يقع ضمن الساحة الخارجية للمسجد، على بعد نحو دقيقة واحدة من مدخل النساء.",
        tier: "luxury",
      },
      {
        nameEn: "Crowne Plaza Madinah",
        nameAr: "كراون بلازا المدينة",
        descriptionEn: "Overlooks the Haram, roughly 5-10 minutes' walk or a free shuttle to the mosque gates.",
        descriptionAr: "تطل على الحرم، وتبعد نحو 5 إلى 10 دقائق مشيًا أو عبر حافلة مجانية إلى أبواب المسجد.",
      },
      {
        nameEn: "Nozol Royal Inn Hotel",
        nameAr: "فندق نزل رويال إن",
        descriptionEn: "A 4-star hotel roughly 100-350 metres behind the mosque, a budget-friendlier pick still within easy walking distance.",
        descriptionAr: "فندق أربع نجوم يقع على بعد نحو 100 إلى 350 مترًا خلف المسجد، خيار أقرب إلى الاقتصادي مع بقائه على مسافة مشي سهلة.",
        tier: "budget",
      },
    ],
    extendedProviders: [
      {
        nameEn: "The Royal Chauffeur",
        nameAr: "ذا رويال شوفير",
        typeEn: "Private chauffeur service",
        typeAr: "خدمة سائق خاص",
        noteEn: "Covers Madinah alongside Jeddah, Makkah, Riyadh and Dammam with dedicated drivers, a reasonable option for pilgrims travelling onward to or from Makkah with the same provider.",
        noteAr: "تغطي المدينة إلى جانب جدة ومكة والرياض والدمام بسائقين مخصصين، خيار معقول للحجاج المنتقلين من مكة أو إليها مع مزود واحد.",
      },
      {
        nameEn: "Online Umrah Taxi",
        nameAr: "أونلاين عمرة تاكسي",
        typeEn: "Pilgrimage transport specialist",
        typeAr: "متخصص في نقل الحجاج والمعتمرين",
        noteEn: "Also serves Madinah for airport transfers, Ziyarat routes to Quba and Uhud, and onward travel to Makkah, positioned as licensed with Saudi transport authorities, worth confirming current licensing and fixed fares when booking.",
        noteAr: "تخدم أيضًا المدينة لتوصيل المطار ومسارات الزيارة إلى قباء وأحد والانتقال إلى مكة، وتُوصف بأنها مرخّصة لدى جهات النقل السعودية، ويُفضل التأكد من الترخيص الحالي والأسعار الثابتة عند الحجز.",
      },
    ],
    sampleDay: [],
  },
  "saudi-arabia/red-sea": {
    storyEn: [
      "Saudi Arabia's Red Sea coast runs for more than 1,800 kilometres, and most of its reef system has barely been touched by tourism. Where Egypt's coast has been dived for decades, this one is still being mapped, coral grottoes with hammerhead sharks, islands where whale sharks pass close to shore, and reef walls that stay unnervingly quiet.",
      "The Kingdom is building its answer to the world's best private-island destinations here, one resort at a time. St. Regis and Six Senses have opened on their own islands, Nujuma sits under Ritz-Carlton's most exclusive label, and a new adventure district, Adrena, just opened this year. This isn't a city you walk through, it's a coastline you disappear into.",
      "This is a first look at what a few days on the Red Sea could feel like. Tell us your dates and who's travelling, and we'll shape the rest around you.",
    ],
    storyAr: [
      "يمتد ساحل البحر الأحمر السعودي لأكثر من 1,800 كيلومتر، ومعظم نظامه المرجاني لم تلمسه السياحة بعد. فبينما غُطست سواحل مصر لعقود، لا يزال هذا الساحل قيد الاستكشاف، كهوف مرجانية يزورها سمك القرش أبو مطرقة، وجزر يمر بالقرب من شواطئها سمك القرش الحوتي، وجدران شعاب تبقى هادئة بشكل يثير الدهشة.",
      "تبني المملكة هنا إجابتها على أفضل وجهات الجزر الخاصة في العالم، منتجعًا تلو الآخر. افتتح سانت ريجس وسيكس سنسز على جزرهما الخاصة، وتحمل نجومة أرقى تصنيفات ريتز كارلتون، وافتُتح هذا العام حيّ مغامرات جديد يُدعى أدرينا. هذه ليست مدينة تمشي فيها، بل ساحل تختفي داخله.",
      "هذه لمحة أولى عمّا يمكن أن تشعر به أيام قليلة على البحر الأحمر. أخبرنا بتواريخك ومن سيرافقك، وسنشكّل الباقي حولك.",
    ],
    pullQuoteEn: "Most of this reef system has never been dived by tourists. For once, \"untouched\" isn't just marketing language.",
    pullQuoteAr: "معظم هذا النظام المرجاني لم يغُصه سائح من قبل. ولمرة واحدة، فإن كلمة \"بكر\" ليست مجرد عبارة تسويقية.",
    weather: {
      bestWindow: {
        labelEn: "Best time to visit",
        labelAr: "أفضل وقت للزيارة",
        monthsEn: "November – April",
        monthsAr: "نوفمبر – أبريل",
        tempEn: "24–32°C, warm with calm seas",
        tempAr: "24–32°م، دافئة وبحر هادئ",
        noteEn: "Diving conditions peak here, warm water, excellent visibility and calm crossings to the islands.",
        noteAr: "ظروف الغوص في أفضل حالاتها هنا، مياه دافئة ورؤية ممتازة وعبور هادئ إلى الجزر.",
      },
      peakHeat: {
        labelEn: "Hot season",
        labelAr: "الموسم الحار",
        monthsEn: "June – September",
        monthsAr: "يونيو – سبتمبر",
        tempEn: "Very hot and humid, warmest sea",
        tempAr: "حار ورطب جدًا، والبحر في أدفأ حالاته",
        noteEn: "Sea temperatures are at their warmest and resorts are quieter, but midday heat and humidity are intense.",
        noteAr: "درجة حرارة البحر في أعلى مستوياتها والمنتجعات أهدأ، لكن الحر والرطوبة في الظهيرة شديدان.",
      },
      tipEn: "Late October and early March offer the best balance, good weather without the peak-season crowds.",
      tipAr: "أواخر أكتوبر وأوائل مارس يقدمان أفضل توازن، طقس جيد من دون ازدحام موسم الذروة.",
    },
    transportation: [
      {
        modeEn: "Red Sea International Airport",
        modeAr: "مطار البحر الأحمر الدولي",
        descriptionEn: "Direct flights from Dubai, Doha and Milan, with more European routes launching through 2026. About an hour's drive from most resorts.",
        descriptionAr: "رحلات مباشرة من دبي والدوحة وميلانو، مع مسارات أوروبية إضافية تنطلق خلال عام 2026. نحو ساعة بالسيارة من معظم المنتجعات.",
      },
      {
        modeEn: "Resort transfers",
        modeAr: "توصيل المنتجعات",
        descriptionEn: "Most stays include arranged transfers from the airport, luggage is often delivered straight to your room, bypassing baggage claim.",
        descriptionAr: "تشمل معظم الإقامات توصيلًا مرتبًا من المطار، وغالبًا ما يُسلَّم الأمتعة مباشرة إلى غرفتك، متجاوزًا استلام الأمتعة المعتاد.",
      },
      {
        modeEn: "Inter-island boats",
        modeAr: "قوارب بين الجزر",
        descriptionEn: "Boats and speedboats connect the islands and Shura Island's hub, arranged through your resort for day trips or transfers.",
        descriptionAr: "تربط القوارب والزوارق السريعة الجزر بمحور جزيرة شرعان، وتُرتَّب عبر منتجعك للرحلات اليومية أو التنقلات.",
      },
    ],
    faq: [
      {
        questionEn: "What is the Red Sea destination famous for?",
        questionAr: "بم تشتهر وجهة البحر الأحمر؟",
        answerEn: "Some of the least-dived reef systems left in the world, private-island resorts and a coastline that's still largely untouched by mass tourism.",
        answerAr: "بأنظمة مرجانية من الأقل غوصًا في العالم، ومنتجعات على جزر خاصة، وساحل لا يزال إلى حد بعيد بمنأى عن السياحة الجماهيرية.",
      },
      {
        questionEn: "What's the best time of year to visit?",
        questionAr: "ما أفضل وقت للزيارة؟",
        answerEn: "November through April, with warm water, excellent visibility and calm seas for diving. Late October and early March balance good weather with fewer crowds.",
        answerAr: "من نوفمبر إلى أبريل، بمياه دافئة ورؤية ممتازة وبحر هادئ للغوص. ويوازن أواخر أكتوبر وأوائل مارس بين الطقس الجيد وقلة الازدحام.",
      },
      {
        questionEn: "How many nights should I book?",
        questionAr: "كم ليلة يجب أن أحجز؟",
        answerEn: "Three to seven nights is typical, resort-style stays reward slowing down rather than packing in day trips.",
        answerAr: "من ثلاث إلى سبع ليالٍ عادة، فإقامات المنتجعات تكافئ التمهل بدل حشو الرحلات اليومية.",
      },
      {
        questionEn: "What are the best things to do?",
        questionAr: "ما أفضل الأنشطة؟",
        answerEn: "Diving or snorkelling the reefs, a private beach afternoon, and resort wellness experiences, most days here are built around the water.",
        answerAr: "الغوص أو السنوركل في الشعاب، وظهيرة على شاطئ خاص، وتجارب العافية في المنتجع، إذ تُبنى معظم الأيام هنا حول الماء.",
      },
      {
        questionEn: "Is the Red Sea destination safe?",
        questionAr: "هل وجهة البحر الأحمر آمنة؟",
        answerEn: "Yes, the resorts are private, well-managed properties with a strong safety record for diving and water activities.",
        answerAr: "نعم، المنتجعات ممتلكات خاصة تُدار جيدًا وتتمتع بسجل أمان قوي لأنشطة الغوص والأنشطة المائية.",
      },
      {
        questionEn: "What should I wear at the resorts?",
        questionAr: "ماذا يجب أن أرتدي في المنتجعات؟",
        answerEn: "Resort and swimwear are the norm within these private island properties, a welcome difference from public beaches elsewhere in the Kingdom.",
        answerAr: "الملابس المخصصة للمنتجعات والملابس البحرية هي المعتادة داخل هذه الممتلكات على الجزر الخاصة، وهو اختلاف مرحَّب به عن الشواطئ العامة في أماكن أخرى من المملكة.",
      },
      {
        questionEn: "Do I need a visa to visit?",
        questionAr: "هل أحتاج تأشيرة للزيارة؟",
        answerEn: "Many nationalities can apply for a Saudi tourist eVisa online before travelling. We can help confirm what applies to you as part of planning your trip.",
        answerAr: "يمكن لكثير من الجنسيات التقدم للحصول على التأشيرة السياحية الإلكترونية السعودية عبر الإنترنت قبل السفر. يمكننا مساعدتك في تأكيد ما ينطبق عليك ضمن التخطيط لرحلتك.",
      },
      {
        questionEn: "Is this a good destination for families?",
        questionAr: "هل هذه وجهة جيدة للعائلات؟",
        answerEn: "Many resorts welcome families with kids' clubs and gentle snorkelling spots, though some properties are positioned as adults-only, worth checking when you book.",
        answerAr: "ترحب منتجعات كثيرة بالعائلات بنوادٍ للأطفال ومواقع سنوركل هادئة، لكن بعض المنتجعات مخصصة للبالغين فقط، ويستحق ذلك التحقق منه عند الحجز.",
      },
      {
        questionEn: "What's dining like at the resorts?",
        questionAr: "كيف هو الطعام في المنتجعات؟",
        answerEn: "Each resort runs its own restaurants, typically several per property, ranging from casual all-day dining to fine dining, included or available depending on your package.",
        answerAr: "يدير كل منتجع مطاعمه الخاصة، عادة عدة مطاعم في كل ممتلكات، تتراوح بين طعام غير رسمي طوال اليوم وطعام راقٍ، وتكون مشمولة أو متاحة حسب باقتك.",
      },
    ],
    travelTips: [
      { en: "Book well ahead for the November–April window, it's the most popular season for good reason.", ar: "احجز مسبقًا لفترة نوفمبر إلى أبريل، فهي الموسم الأكثر طلبًا لسبب وجيه." },
      { en: "Check whether your resort is adults-only or family-friendly before booking.", ar: "تحقق مما إذا كان منتجعك مخصصًا للبالغين فقط أو مناسبًا للعائلات قبل الحجز." },
      { en: "Reef-safe sunscreen is worth packing, some resorts request it specifically to protect the coral.", ar: "يستحق واقي الشمس الآمن للشعاب اصطحابه، إذ تطلبه بعض المنتجعات تحديدًا لحماية المرجان." },
      { en: "Alcohol policies vary by resort, some serve it within the property, check ahead if this matters to you.", ar: "تختلف سياسات الكحول حسب المنتجع، ويقدمه بعضها داخل الممتلكات، فتحقق مسبقًا إن كان هذا مهمًا لك." },
      { en: "Confirm what's included in your package, meals, activities and transfers vary widely between resorts.", ar: "تأكد مما يشمله باقتك، فالوجبات والأنشطة والتوصيل تختلف كثيرًا بين المنتجعات." },
      { en: "Pack for both water and desert, several resorts sit where dunes meet the coastline.", ar: "احزم لكل من الماء والصحراء، إذ يقع بعض المنتجعات حيث تلتقي الكثبان بالساحل." },
    ],
    attractions: [
      {
        nameEn: "Shura Island",
        nameAr: "جزيرة شورى",
        categoryEn: "Hub",
        categoryAr: "محور",
        descriptionEn: "The destination's main hub, home to several resorts including The Red Sea EDITION and InterContinental The Red Sea.",
        descriptionAr: "المحور الرئيسي للوجهة، ويضم عدة منتجعات من بينها ذا ريد سي إديشن وإنتركونتيننتال ذا ريد سي.",
      },
      {
        nameEn: "Al Lith Island",
        nameAr: "جزيرة الليث",
        categoryEn: "Diving",
        categoryAr: "غوص",
        descriptionEn: "White sand and shallow blue water for snorkelling, with whale sharks and large fish for advanced divers.",
        descriptionAr: "رمال بيضاء ومياه زرقاء ضحلة للسنوركل، ويشاهد الغواصون المتقدمون فيها القروش الحوتية وأسماكًا كبيرة.",
      },
      {
        nameEn: "Abu Galawa",
        nameAr: "أبو جلاوة",
        categoryEn: "Diving",
        categoryAr: "غوص",
        descriptionEn: "A coral grotto known for schools of sharks, including hammerheads.",
        descriptionAr: "كهف مرجاني يشتهر بأسراب من أسماك القرش، من بينها أبو مطرقة.",
      },
      {
        nameEn: "Adrena",
        nameAr: "أدرينا",
        categoryEn: "Entertainment",
        categoryAr: "ترفيه",
        descriptionEn: "A new adventure and entertainment district for the destination, opened in early 2026.",
        descriptionAr: "حيّ مغامرات وترفيه جديد للوجهة، افتُتح في أوائل 2026.",
        badgeEn: "Newly opened",
        badgeAr: "افتُتح حديثًا",
      },
    ],
    dining: [],
    stay: [
      {
        nameEn: "The St. Regis Red Sea Resort",
        nameAr: "منتجع سانت ريجس البحر الأحمر",
        descriptionEn: "An artistic private-island stay, one of the destination's first resorts to open.",
        descriptionAr: "إقامة فنية على جزيرة خاصة، من أوائل منتجعات الوجهة افتتاحًا.",
      },
      {
        nameEn: "Six Senses Southern Dunes",
        nameAr: "سيكس سنسز ساذرن ديونز",
        descriptionEn: "Desert-meets-sea wellness resort, built into the dunes above the coastline.",
        descriptionAr: "منتجع عافية يجمع بين الصحراء والبحر، مبني بين الكثبان فوق الساحل.",
      },
      {
        nameEn: "Nujuma, A Ritz-Carlton Reserve",
        nameAr: "نجومة، ريزيرف من ريتز كارلتون",
        descriptionEn: "The brand's most exclusive tier, an overwater and beachfront reserve on its own island.",
        descriptionAr: "أرقى تصنيفات العلامة، محمية على الماء والشاطئ في جزيرتها الخاصة.",
      },
    ],
    extendedStay: [
      {
        nameEn: "The Red Sea EDITION",
        nameAr: "ذا ريد سي إديشن",
        descriptionEn: "The first hotel to open on Shura Island, low stone-and-timber pavilions along the beach with multiple pools and some of the destination's most talked-about dining.",
        descriptionAr: "أول فندق يفتتح في جزيرة شورى، أجنحة منخفضة من الحجر والخشب على طول الشاطئ مع عدة مسابح ومطاعم من الأكثر حديثًا في الوجهة.",
        tier: "luxury",
      },
      {
        nameEn: "InterContinental The Red Sea Resort",
        nameAr: "منتجع إنتركونتيننتال ذا ريد سي",
        descriptionEn: "Among the first resorts to open on Shura Island, beachfront and lagoon-facing rooms and suites from a globally familiar name.",
        descriptionAr: "من أوائل المنتجعات افتتاحًا في جزيرة شورى، غرف وأجنحة تطل على الشاطئ والبحيرة من علامة عالمية معروفة.",
        tier: "luxury",
      },
      {
        nameEn: "Shebara Resort",
        nameAr: "منتجع شيبارة",
        descriptionEn: "Red Sea Global's own first resort, mirrored overwater villas on Sheybarah Island designed to reflect the sea and sky, running fully off-grid on solar power.",
        descriptionAr: "أول منتجع تديره شركة البحر الأحمر الدولية بنفسها، فيلات عائمة على الماء بواجهات عاكسة في جزيرة شيبارة صُممت لتعكس البحر والسماء، وتعمل بالكامل بالطاقة الشمسية بمعزل عن الشبكة العامة.",
        tier: "luxury",
      },
      {
        nameEn: "Desert Rock Resort",
        nameAr: "منتجع ديزرت روك",
        descriptionEn: "Villas and cave suites carved into the canyon walls of the Hejaz mountains, some perched on the cliff edge above the desert wadi below.",
        descriptionAr: "فيلات وأجنحة كهفية منحوتة في جدران الوادي بجبال الحجاز، بعضها معلق على حافة المنحدر فوق الوادي الصحراوي أسفلها.",
        tier: "luxury",
      },
    ],
    extendedProviders: [
      {
        nameEn: "GH Trips",
        nameAr: "جي إتش تريبس",
        typeEn: "Private chauffeur & resort transfer service",
        typeAr: "خدمة سائق خاص وتوصيل للمنتجعات",
        noteEn: "A Dubai-based chauffeur company running dedicated private transfers to Shura Island's resorts from Red Sea International Airport, Jeddah and Tabuk, positioned as licensed and insured, worth confirming current terms and pricing directly when booking.",
        noteAr: "شركة سائقين خاصين مقرها دبي، تقدم توصيلًا خاصًا مخصصًا لمنتجعات جزيرة شورى من مطار البحر الأحمر الدولي وجدة وتبوك، وتُوصف بأنها مرخّصة ومؤمّنة، ويُفضل تأكيد الشروط والأسعار الحالية مباشرة عند الحجز.",
      },
    ],
    sampleDay: [
      {
        timeEn: "Morning",
        timeAr: "الصباح",
        placeEn: "Reef snorkelling",
        placeAr: "سنوركل في الشعاب",
        descriptionEn: "The water is calmest and clearest before midday.",
        descriptionAr: "المياه في أهدأ وأصفى حالاتها قبل الظهيرة.",
      },
      {
        timeEn: "Sunset",
        timeAr: "الغروب",
        placeEn: "Private beach",
        placeAr: "شاطئ خاص",
        descriptionEn: "Watching the sky change colour over your own stretch of sand.",
        descriptionAr: "مشاهدة السماء تتلون فوق شاطئك الخاص.",
      },
      {
        timeEn: "Evening",
        timeAr: "المساء",
        placeEn: "Dinner under the stars",
        placeAr: "عشاء تحت النجوم",
        descriptionEn: "Resort dining with some of the clearest night skies in the Kingdom.",
        descriptionAr: "عشاء في المنتجع تحت واحدة من أصفى سماوات الليل في المملكة.",
      },
    ],
  },
  "saudi-arabia/abha": {
    storyEn: [
      "Abha sits over 2,200 metres up in the Asir Mountains, and it shows: while the rest of the Kingdom bakes, Abha spends its summer in fog and juniper forest, cool enough that Saudis fly here specifically to escape the heat.",
      "The cable car up to As-Soudah, suspended between just two pillars a kilometre apart, is the easiest way to feel that shift. Below, Rijal Almaa's sixty stone palaces have stood for four hundred years, and Abha's own Art Street turns the city centre into an open-air gallery. This is Saudi Arabia's mountain side, not its desert one.",
      "This is a first glimpse of what your time in Abha could hold. Tell us your dates and who's travelling, and we'll shape the rest around you.",
    ],
    storyAr: [
      "ترتفع أبها أكثر من 2,200 متر في جبال عسير، وهذا واضح في طبيعتها: بينما تحترق بقية المملكة، تقضي أبها صيفها بين الضباب وغابات العرعر، بجو بارد لدرجة أن كثيرًا من السعوديين يقصدونها خصيصًا هربًا من الحر.",
      "التلفريك الصاعد إلى السودة، المعلق بين ركيزتين فقط تفصل بينهما مسافة كيلومتر، هو أسهل طريقة لتشعر بهذا التحول. وفي الأسفل، تقف قصور رجال ألمع الستون المبنية من الحجر منذ أربعمئة عام، ويحوّل شارع الفن في أبها وسط المدينة إلى معرض مفتوح. هذا هو الوجه الجبلي للسعودية، لا وجهها الصحراوي.",
      "هذه لمحة أولى عمّا يمكن أن تحمله أيامك في أبها. أخبرنا بتواريخك ومن سيرافقك، وسنشكّل الباقي حولك.",
    ],
    pullQuoteEn: "This is the desert kingdom. Except here, the clouds sit below you, not above.",
    pullQuoteAr: "هذه مملكة الصحراء. إلا أن الغيوم هنا تحتك، لا فوقك.",
    weather: {
      bestWindow: {
        labelEn: "Peak escape season",
        labelAr: "موسم الهروب من الحر",
        monthsEn: "March – August",
        monthsAr: "مارس – أغسطس",
        tempEn: "15–25°C, mild year-round",
        tempAr: "15–25°م، معتدلة طوال العام",
        noteEn: "Saudi Arabia's cool-weather escape, comfortable even when Riyadh and Jeddah are in the 40s.",
        noteAr: "ملاذ السعودية من الحر، معتدل حتى حين تتجاوز الحرارة 40 درجة في الرياض وجدة.",
      },
      peakHeat: {
        labelEn: "Coolest & mistiest",
        labelAr: "الأبرد والأكثر ضبابًا",
        monthsEn: "December – February",
        monthsAr: "ديسمبر – فبراير",
        tempEn: "10–20°C, can be misty and wet",
        tempAr: "10–20°م، قد تكون ضبابية وممطرة",
        noteEn: "Genuinely cold at night for Saudi standards, and mountain roads can get foggy.",
        noteAr: "باردة فعليًا ليلًا وفق المعايير السعودية، وقد تصبح طرق الجبال ضبابية.",
      },
      tipEn: "Abha runs noticeably cooler than the rest of the Kingdom year-round, many Saudis visit specifically to escape summer heat elsewhere.",
      tipAr: "تكون أبها أكثر برودة بوضوح من بقية المملكة طوال العام، ويزورها كثير من السعوديين خصيصًا هربًا من حر الصيف في أماكن أخرى.",
    },
    transportation: [
      {
        modeEn: "Abha International Airport",
        modeAr: "مطار أبها الدولي",
        descriptionEn: "Domestic flights connect Abha to Riyadh, Jeddah and other major cities, a short taxi ride from the airport into town.",
        descriptionAr: "تربط رحلات داخلية أبها بالرياض وجدة ومدن رئيسية أخرى، وتبعد المدينة عن المطار مسافة قصيرة بالتاكسي.",
      },
      {
        modeEn: "Rental car",
        modeAr: "استئجار سيارة",
        descriptionEn: "Worth it for reaching Rijal Almaa, Asir National Park and mountain viewpoints at your own pace.",
        descriptionAr: "يستحق التجربة للوصول إلى رجال ألمع ومنتزه عسير الوطني والمطلات الجبلية بالوتيرة التي تناسبك.",
      },
      {
        modeEn: "Taxis & ride-hailing",
        modeAr: "التاكسي وتطبيقات طلب المشاوير",
        descriptionEn: "Available around the city centre and As-Soudah for shorter trips without a rental car.",
        descriptionAr: "متوفرة حول وسط المدينة والسودة للرحلات القصيرة من دون سيارة مستأجرة.",
      },
    ],
    faq: [
      {
        questionEn: "What is Abha famous for?",
        questionAr: "بم تشتهر أبها؟",
        answerEn: "Being Saudi Arabia's cool-weather escape, misty mountain air, the As-Soudah cable car and the colourful stone palaces of Rijal Almaa.",
        answerAr: "بكونها ملاذ السعودية من الحر، بهوائها الجبلي الضبابي، وتلفريك السودة، وقصور رجال ألمع الحجرية الملونة.",
      },
      {
        questionEn: "What's the best time of year to visit Abha?",
        questionAr: "ما أفضل وقت لزيارة أبها؟",
        answerEn: "March through August, when temperatures stay a mild 15–25°C even while the rest of the Kingdom bakes, this is Abha's peak season for exactly that reason.",
        answerAr: "من مارس إلى أغسطس، حين تبقى الحرارة معتدلة بين 15 و25 درجة مئوية حتى بينما تحترق بقية المملكة، وهذا هو موسم أبها الأعلى طلبًا لهذا السبب بالتحديد.",
      },
      {
        questionEn: "How many days should I spend in Abha?",
        questionAr: "كم يومًا يجب أن أقضي في أبها؟",
        answerEn: "Two to four days covers the cable car, Rijal Almaa, Abha Art Street and a hike or two in Asir National Park.",
        answerAr: "يومان إلى أربعة أيام كافية للتلفريك ورجال ألمع وشارع الفن في أبها ونزهة أو نزهتين في منتزه عسير الوطني.",
      },
      {
        questionEn: "What are the best things to do in Abha?",
        questionAr: "ما أفضل الأنشطة في أبها؟",
        answerEn: "Riding the As-Soudah cable car, wandering Rijal Almaa's stone palaces, and hiking the juniper forests of Asir National Park in the cool morning hours.",
        answerAr: "ركوب تلفريك السودة، والتجول بين قصور رجال ألمع الحجرية، والمشي بين غابات العرعر في منتزه عسير الوطني في ساعات الصباح الباردة.",
      },
      {
        questionEn: "Is Abha safe for tourists?",
        questionAr: "هل أبها آمنة للسياح؟",
        answerEn: "Yes, Abha is generally very safe. Mountain roads can get foggy in winter, so drive carefully if self-driving.",
        answerAr: "نعم، أبها آمنة عمومًا. وقد تصبح طرق الجبال ضبابية في الشتاء، فقُد بحذر إن كنت تقود بنفسك.",
      },
      {
        questionEn: "What should I wear in Abha?",
        questionAr: "ماذا يجب أن أرتدي في أبها؟",
        answerEn: "Layers. Days can be mild and evenings genuinely cool, especially December through February, unusual for Saudi Arabia but worth packing for.",
        answerAr: "طبقات من الملابس. قد تكون الأيام معتدلة والأمسيات باردة فعليًا، خاصة من ديسمبر إلى فبراير، وهو أمر غير معتاد في السعودية لكنه يستحق الاستعداد له.",
      },
      {
        questionEn: "Do I need a visa to visit Abha?",
        questionAr: "هل أحتاج تأشيرة لزيارة أبها؟",
        answerEn: "Many nationalities can apply for a Saudi tourist eVisa online before travelling. We can help confirm what applies to you as part of planning your trip.",
        answerAr: "يمكن لكثير من الجنسيات التقدم للحصول على التأشيرة السياحية الإلكترونية السعودية عبر الإنترنت قبل السفر. يمكننا مساعدتك في تأكيد ما ينطبق عليك ضمن التخطيط لرحلتك.",
      },
      {
        questionEn: "Is Abha good for families?",
        questionAr: "هل أبها مناسبة للعائلات؟",
        answerEn: "Yes, the cable car and Rijal Almaa are both easy, engaging visits for children, and the cooler climate makes outdoor time more comfortable than most of the Kingdom.",
        answerAr: "نعم، يعد التلفريك ورجال ألمع زيارتين سهلتين وممتعتين للأطفال، ويجعل المناخ الأبرد الوقت في الخارج أكثر راحة من معظم أنحاء المملكة.",
      },
      {
        questionEn: "What's the food like in Abha?",
        questionAr: "كيف هو الطعام في أبها؟",
        answerEn: "Traditional Aseeri cooking is the highlight, restaurants like Bab Al Turath serve it in settings styled after historic Aseer homes.",
        answerAr: "المطبخ الأسيري التقليدي هو الأبرز، وتقدمه مطاعم مثل باب التراث في أجواء مصممة على طراز بيوت عسير التاريخية.",
      },
    ],
    travelTips: [
      { en: "Rijal Almaa operates seasonally, mainly through summer, check dates before you plan around it.", ar: "تعمل رجال ألمع موسميًا، غالبًا خلال الصيف، فتحقق من المواعيد قبل التخطيط حولها." },
      { en: "Pack layers, Abha's temperature swings more between day and night than most Saudi destinations.", ar: "احزم طبقات من الملابس، فحرارة أبها تتفاوت بين النهار والليل أكثر من معظم وجهات السعودية." },
      { en: "Mountain roads can get foggy, especially in winter mornings, drive with extra care if self-driving.", ar: "قد تصبح طرق الجبال ضبابية، خاصة في صباحات الشتاء، فقُد بحذر إضافي إن كنت تقود بنفسك." },
      { en: "The weekend in Saudi Arabia is Friday–Saturday, plan opening hours accordingly.", ar: "عطلة نهاية الأسبوع في السعودية هي الجمعة والسبت، فخطط لمواعيد العمل تبعًا لذلك." },
      { en: "Alcohol isn't sold or served anywhere in the Kingdom.", ar: "لا يُباع الكحول ولا يُقدَّم في أي مكان بالمملكة." },
      { en: "Book cable car tickets ahead on weekends and during the Abha Summer Festival, queues build quickly.", ar: "احجز تذاكر التلفريك مسبقًا في عطلات نهاية الأسبوع وخلال مهرجان أبها الصيفي، إذ تتشكل الطوابير بسرعة." },
    ],
    attractions: [
      {
        nameEn: "As-Soudah Cable Car",
        nameAr: "تلفريك السودة",
        categoryEn: "Landmark",
        categoryAr: "معلم",
        descriptionEn: "One of the world's few cable cars suspended between just two pillars, rising to 1,600 metres above sea level.",
        descriptionAr: "أحد أندر التلفريكات في العالم المعلقة بين ركيزتين فقط، يرتفع إلى 1,600 متر فوق سطح البحر.",
      },
      {
        nameEn: "Rijal Almaa Heritage Village",
        nameAr: "قرية رجال ألمع التراثية",
        categoryEn: "Heritage",
        categoryAr: "تراث",
        descriptionEn: "Around sixty multi-storey stone palaces, some 400 years old. Note it operates seasonally, mainly through summer.",
        descriptionAr: "نحو ستين قصرًا حجريًا متعدد الطوابق، بعضها عمره 400 عام. يعمل موسميًا، غالبًا خلال الصيف.",
      },
      {
        nameEn: "Abha Art Street",
        nameAr: "شارع الفن في أبها",
        categoryEn: "Culture",
        categoryAr: "ثقافة",
        descriptionEn: "An open-air gallery through the city centre, murals and installations along the walking street.",
        descriptionAr: "معرض فني مفتوح في وسط المدينة، جداريات وأعمال فنية على طول الممشى.",
      },
      {
        nameEn: "Asir National Park",
        nameAr: "منتزه عسير الوطني",
        categoryEn: "Nature",
        categoryAr: "طبيعة",
        descriptionEn: "Juniper forests and mountain trails across the Sarawat range, best hiked in the cooler morning hours.",
        descriptionAr: "غابات عرعر ومسارات جبلية عبر سلسلة السروات، ويُفضَّل التنزه فيها في ساعات الصباح الباردة.",
      },
    ],
    dining: [
      {
        nameEn: "Bab Al Turath",
        nameAr: "باب التراث",
        cuisineEn: "Traditional Aseeri",
        cuisineAr: "أسيري تقليدي",
        descriptionEn: "Traditional Aseeri flavours in a dining room decorated like a historic Aseer home.",
        descriptionAr: "نكهات أسيرية تقليدية في صالة مصممة على طراز بيت أسيري تاريخي.",
      },
      {
        nameEn: "Assalam Palace Revolving Restaurant",
        nameAr: "مطعم قصر السلام الدوار",
        cuisineEn: "International buffet",
        cuisineAr: "بوفيه عالمي",
        descriptionEn: "A slow-turning restaurant on the 10th floor, mountain views from every seat over the course of a meal.",
        descriptionAr: "مطعم دوار ببطء في الطابق العاشر، إطلالات جبلية من كل مقعد خلال الوجبة.",
      },
    ],
    stay: [
      {
        nameEn: "Abha InterContinental",
        nameAr: "إنتركونتيننتال أبها",
        descriptionEn: "The city's most celebrated address, perched above the Asir Mountains with a rooftop restaurant often above the clouds.",
        descriptionAr: "العنوان الأبرز في المدينة، يطل على جبال عسير مع مطعم على السطح غالبًا ما يكون فوق الغيوم.",
      },
      {
        nameEn: "Zahrat Aseer Hotel",
        nameAr: "فندق زهرة عسير",
        descriptionEn: "Traditional Asiri architecture throughout, for a stay with a genuine sense of place.",
        descriptionAr: "عمارة أسيرية تقليدية في كل تفاصيله، لإقامة تحمل إحساسًا أصيلًا بالمكان.",
      },
    ],
    extendedStay: [
      {
        nameEn: "Boudl Abha",
        nameAr: "بودل أبها",
        descriptionEn: "A budget-friendly aparthotel near Abha Mall, kitchenette rooms a short drive from the city centre.",
        descriptionAr: "شقق فندقية اقتصادية قرب أبها مول، بغرف مزودة بمطبخ صغير على بعد دقائق من وسط المدينة.",
        tier: "budget",
      },
      {
        nameEn: "Citadines Abha",
        nameAr: "سيتادينز أبها",
        descriptionEn: "Serviced studio and one-bedroom apartments from the Ascott group, high in the mountains with a pool, gym and views over Abha.",
        descriptionAr: "شقق فندقية استوديو وبغرفة نوم من مجموعة أسكوت، على ارتفاع عالٍ في الجبال مع مسبح وصالة رياضية وإطلالات على أبها.",
      },
      {
        nameEn: "Assalam Palace Hotel",
        nameAr: "فندق قصر السلام",
        descriptionEn: "A city-centre hotel topped by the well-known 10th-floor revolving restaurant, a practical mid-range base for exploring Abha.",
        descriptionAr: "فندق في وسط المدينة يعلوه المطعم الدوار الشهير في الطابق العاشر، قاعدة عملية بأسعار متوسطة لاستكشاف أبها.",
      },
      {
        nameEn: "Best Western Plus Danat Almansak Hotel",
        nameAr: "فندق بست ويسترن بلس دانة المنسك",
        descriptionEn: "An international-chain 4-star hotel in the Al-Areen district, a few minutes from the airport with an indoor pool, sauna and spa.",
        descriptionAr: "فندق أربع نجوم من سلسلة عالمية في حي العرين، على بعد دقائق من المطار، مع مسبح داخلي وساونا وسبا.",
      },
    ],
    extendedProviders: [
      {
        nameEn: "Transfeero",
        nameAr: "ترانسفيرو",
        typeEn: "Licensed private transfer platform",
        typeAr: "منصة توصيل خاص مرخّصة",
        noteEn: "A global transfer-booking platform connecting travellers to licensed local drivers holding Saudi Transport General Authority permits, useful for a fixed-price private pickup from Abha International Airport, book directly and confirm current rates.",
        noteAr: "منصة عالمية لحجز التوصيل الخاص تربط المسافرين بسائقين محليين مرخّصين يحملون تصاريح الهيئة العامة للنقل السعودية، مفيدة لتوصيل خاص بسعر ثابت من مطار أبها الدولي، يُفضل الحجز مباشرة والتأكد من الأسعار الحالية.",
      },
    ],
    sampleDay: [
      {
        timeEn: "Morning",
        timeAr: "الصباح",
        placeEn: "As-Soudah Cable Car",
        placeAr: "تلفريك السودة",
        descriptionEn: "Rise above the clouds before the mountain mist burns off.",
        descriptionAr: "اصعد فوق الغيوم قبل أن يتلاشى ضباب الجبل.",
      },
      {
        timeEn: "Afternoon",
        timeAr: "بعد الظهر",
        placeEn: "Rijal Almaa",
        placeAr: "رجال ألمع",
        descriptionEn: "Wander four centuries of stone palaces (seasonal, check dates before you go).",
        descriptionAr: "تجوّل بين قصور حجرية عمرها أربعة قرون (موسمي، تحقق من المواعيد قبل الذهاب).",
      },
      {
        timeEn: "Evening",
        timeAr: "المساء",
        placeEn: "Dinner at Bab Al Turath",
        placeAr: "عشاء في باب التراث",
        descriptionEn: "Traditional Aseeri cooking to close a day spent in the clouds.",
        descriptionAr: "مطبخ أسيري تقليدي يختم يومًا أمضيته بين الغيوم.",
      },
    ],
  },
  "saudi-arabia/aseer": {
    storyEn: [
      "Abha is Aseer's capital and the easiest way in, but the region itself keeps unfolding well past the city limits. Aseer is a whole province of highland towns and terraced villages strung along the Sarawat mountains, most of them still barely known outside Saudi Arabia.",
      "An hour from Abha, a cable car climbs to Al Habala, a village the Qahtan tribe built into a cliff face some four hundred years ago and reached only by rope until the 1990s. Two hours further north, Al Namas sits even higher than Abha itself, forested and cool, with a 250-year-old heritage museum and Mount Murir rising beside it. Just past Al Namas, Tanomah adds waterfalls and juniper forest to the same green, high-altitude world.",
      "This is a first look at what a few days across Aseer could feel like. Tell us your dates and who's travelling, and we'll shape the rest around you.",
    ],
    storyAr: [
      "أبها هي عاصمة عسير وأسهل طريقة للوصول إليها، لكن المنطقة نفسها تستمر في الكشف عن نفسها إلى ما هو أبعد من حدود المدينة. عسير منطقة كاملة من البلدات المرتفعة والقرى المدرّجة الممتدة على طول جبال السروات، ولا يزال معظمها غير معروف تقريبًا خارج السعودية.",
      "على بعد ساعة من أبها، يصعد تلفريك إلى قرية الهبلة، التي بنتها قبيلة قحطان في وجه منحدر صخري منذ نحو أربعمئة عام ولم يكن يُصل إليها إلا بالحبال حتى تسعينيات القرن الماضي. وعلى بعد ساعتين أخريين شمالًا، تقع النماص في ارتفاع أعلى من أبها نفسها، بأجواء حرجية باردة ومتحف تراثي عمره 250 عامًا، ويرتفع جبل مرير بجانبها. وبالقرب من النماص مباشرة، تضيف تنومة شلالات وغابات عرعر إلى العالم الأخضر المرتفع ذاته.",
      "هذه لمحة أولى عمّا يمكن أن تشعر به أيام قليلة عبر عسير. أخبرنا بتواريخك ومن سيرافقك، وسنشكّل الباقي حولك.",
    ],
    pullQuoteEn: "A village built into a cliff face, reached only by rope until the 1990s. Now a cable car does the climbing for you.",
    pullQuoteAr: "قرية بُنيت في وجه منحدر صخري، ولم يكن يُصل إليها إلا بالحبال حتى التسعينيات. أما اليوم فيتولى التلفريك مهمة الصعود عنك.",
    weather: {
      bestWindow: {
        labelEn: "Best time to visit",
        labelAr: "أفضل وقت للزيارة",
        monthsEn: "April – October",
        monthsAr: "أبريل – أكتوبر",
        tempEn: "12–22°C, cool and green",
        tempAr: "12–22°م، باردة وخضراء",
        noteEn: "Al Namas runs a free summer fairground called Hyde Park in these months, live music and food stalls under the pines.",
        noteAr: "تقيم النماص فعالية صيفية مجانية باسم هايد بارك خلال هذه الأشهر، بموسيقى حية وأكشاك طعام تحت أشجار الصنوبر.",
      },
      peakHeat: {
        labelEn: "Coldest months",
        labelAr: "أبرد الأشهر",
        monthsEn: "December – February",
        monthsAr: "ديسمبر – فبراير",
        tempEn: "5–15°C, genuinely cold",
        tempAr: "5–15°م، باردة فعليًا",
        noteEn: "Al Namas and Tanomah sit higher than Abha and feel it, nights can drop close to freezing.",
        noteAr: "تقع النماص وتنومة في ارتفاع أعلى من أبها ويظهر ذلك في طقسها، وقد تقترب الليالي من درجة التجمد.",
      },
      tipEn: "Al Namas sits even higher than Abha, pack warmer layers than you think you'll need, even in summer evenings.",
      tipAr: "تقع النماص في ارتفاع أعلى من أبها نفسها، فاصطحب طبقات أكثر دفئًا مما تتوقع، حتى في أمسيات الصيف.",
    },
    transportation: [
      {
        modeEn: "Abha International Airport",
        modeAr: "مطار أبها الدولي",
        descriptionEn: "The region's nearest airport, about an hour's drive from Al Habala and roughly two hours from Al Namas and Tanomah.",
        descriptionAr: "أقرب مطار للمنطقة، ويبعد نحو ساعة عن قرية الهبلة وحوالي ساعتين عن النماص وتنومة.",
      },
      {
        modeEn: "Rental car",
        modeAr: "استئجار سيارة",
        descriptionEn: "Essential, Aseer's towns and villages are spread across the mountains with no public transport connecting them.",
        descriptionAr: "ضرورية، إذ تتوزع بلدات عسير وقراها عبر الجبال من دون وسائل نقل عام تربط بينها.",
      },
      {
        modeEn: "Cable car to Al Habala",
        modeAr: "تلفريك الهبلة",
        descriptionEn: "The only practical way into the village itself; check current operating hours before planning your day around it.",
        descriptionAr: "الطريقة العملية الوحيدة للوصول إلى القرية نفسها؛ تحقق من ساعات التشغيل الحالية قبل التخطيط ليومك حولها.",
      },
    ],
    faq: [
      {
        questionEn: "What is Aseer famous for?",
        questionAr: "بم تشتهر عسير؟",
        answerEn: "Being Saudi Arabia's green mountain region, hanging villages like Al Habala, forested highland towns like Al Namas and Tanomah, and a cooler climate than almost anywhere else in the Kingdom.",
        answerAr: "بكونها المنطقة الجبلية الخضراء في السعودية، وقراها المعلقة مثل الهبلة، وبلداتها المرتفعة الحرجية مثل النماص وتنومة، وطقسها الأبرد من أي مكان آخر تقريبًا في المملكة.",
      },
      {
        questionEn: "What's the difference between Abha and Aseer?",
        questionAr: "ما الفرق بين أبها وعسير؟",
        answerEn: "Abha is Aseer's capital city and the usual gateway in. Aseer is the wider region around it, including highland towns and villages well beyond the city itself.",
        answerAr: "أبها هي عاصمة عسير والبوابة المعتادة للدخول إليها. أما عسير فهي المنطقة الأوسع المحيطة بها، وتشمل بلدات وقرى مرتفعة تمتد إلى ما هو أبعد من المدينة نفسها.",
      },
      {
        questionEn: "How many days should I spend exploring Aseer?",
        questionAr: "كم يومًا يجب أن أقضي في استكشاف عسير؟",
        answerEn: "Two to four days, on top of any time spent in Abha itself, given how spread out Al Habala, Al Namas and Tanomah are from one another.",
        answerAr: "يومان إلى أربعة أيام، إضافة إلى أي وقت تقضيه في أبها نفسها، نظرًا لتباعد الهبلة والنماص وتنومة عن بعضها.",
      },
      {
        questionEn: "What are the best things to do in Aseer?",
        questionAr: "ما أفضل الأنشطة في عسير؟",
        answerEn: "Riding the cable car into Al Habala's cliffside village, wandering Al Namas' heritage museum and mountain parks, and walking Tanomah's juniper forests and waterfalls.",
        answerAr: "ركوب التلفريك إلى قرية الهبلة المعلقة على المنحدر، والتجول في متحف النماص التراثي وحدائقها الجبلية، والمشي بين غابات العرعر وشلالات تنومة.",
      },
      {
        questionEn: "Is Aseer safe for tourists?",
        questionAr: "هل عسير آمنة للسياح؟",
        answerEn: "Yes, Aseer is generally very safe, though mountain roads between towns are winding, so drive carefully if self-driving.",
        answerAr: "نعم، عسير آمنة عمومًا، رغم أن الطرق الجبلية بين البلدات متعرجة، فقُد بحذر إن كنت تقود بنفسك.",
      },
      {
        questionEn: "What should I wear in Aseer?",
        questionAr: "ماذا يجب أن أرتدي في عسير؟",
        answerEn: "Modest clothing with warm layers, Al Namas and Tanomah sit even higher and cooler than Abha, especially at night.",
        answerAr: "ملابس محتشمة مع طبقات دافئة، فالنماص وتنومة أعلى وأبرد من أبها، خاصة ليلًا.",
      },
      {
        questionEn: "Do I need a visa to visit Aseer?",
        questionAr: "هل أحتاج تأشيرة لزيارة عسير؟",
        answerEn: "Many nationalities can apply for a Saudi tourist eVisa online before travelling. We can help confirm what applies to you as part of planning your trip.",
        answerAr: "يمكن لكثير من الجنسيات التقدم للحصول على التأشيرة السياحية الإلكترونية السعودية عبر الإنترنت قبل السفر. يمكننا مساعدتك في تأكيد ما ينطبق عليك ضمن التخطيط لرحلتك.",
      },
      {
        questionEn: "Is Aseer good for families?",
        questionAr: "هل عسير مناسبة للعائلات؟",
        answerEn: "Yes, Al Namas' mountain parks and summer Hyde Park fairground both work well for children, and the cool climate makes outdoor time easy.",
        answerAr: "نعم، تناسب حدائق النماص الجبلية وفعالية هايد بارك الصيفية الأطفال، ويسهّل المناخ البارد الوقت في الخارج.",
      },
      {
        questionEn: "Can I visit Aseer as a day trip from Abha?",
        questionAr: "هل يمكن زيارة عسير كرحلة يومية من أبها؟",
        answerEn: "Al Habala works well as a half-day trip from Abha. Al Namas and Tanomah are far enough that an overnight stay makes for a more relaxed visit.",
        answerAr: "تصلح الهبلة كرحلة نصف يوم من أبها. أما النماص وتنومة فهما بعيدتان بما يكفي لأن تجعل المبيت زيارة أكثر راحة.",
      },
    ],
    travelTips: [
      { en: "Check Al Habala's cable car operating hours before building your day around it.", ar: "تحقق من ساعات تشغيل تلفريك الهبلة قبل بناء يومك حوله." },
      { en: "Al Namas and Tanomah are close to each other but far from Abha, plan for a full day or an overnight stay to reach them.", ar: "تقع النماص وتنومة قريبتين من بعضهما لكن بعيدتين عن أبها، فخطط ليوم كامل أو مبيت للوصول إليهما." },
      { en: "Pack warmer layers than you would for Abha, the highest towns here run noticeably colder.", ar: "اصطحب طبقات أكثر دفئًا مما تحتاجه في أبها، فأعلى البلدات هنا أبرد بوضوح." },
      { en: "The weekend in Saudi Arabia is Friday–Saturday, plan opening hours accordingly.", ar: "عطلة نهاية الأسبوع في السعودية هي الجمعة والسبت، فخطط لمواعيد العمل تبعًا لذلك." },
      { en: "Alcohol isn't sold or served anywhere in the Kingdom.", ar: "لا يُباع الكحول ولا يُقدَّم في أي مكان بالمملكة." },
      { en: "A rental car is essential, distances between Aseer's towns are longer than they look on a map.", ar: "استئجار سيارة ضروري، فالمسافات بين بلدات عسير أطول مما تبدو على الخريطة." },
    ],
    attractions: [
      {
        nameEn: "Al Habala Hanging Village",
        nameAr: "قرية الهبلة المعلقة",
        categoryEn: "Heritage",
        categoryAr: "تراث",
        descriptionEn: "A cliffside village built by the Qahtan tribe some 400 years ago, reached only by rope until the 1990s and now by cable car.",
        descriptionAr: "قرية بُنيت في وجه منحدر على يد قبيلة قحطان قبل نحو 400 عام، ولم يكن يُصل إليها إلا بالحبال حتى التسعينيات، ويتم الوصول إليها الآن بالتلفريك.",
      },
      {
        nameEn: "Al Namas",
        nameAr: "النماص",
        categoryEn: "Highlands",
        categoryAr: "مرتفعات",
        descriptionEn: "One of Aseer's highest, greenest towns, with a 250-year-old heritage museum and mountain parks.",
        descriptionAr: "إحدى أعلى بلدات عسير وأكثرها خضرة، ويضم متحفًا تراثيًا عمره 250 عامًا وحدائق جبلية.",
      },
      {
        nameEn: "Tanomah",
        nameAr: "تنومة",
        categoryEn: "Nature",
        categoryAr: "طبيعة",
        descriptionEn: "Juniper forests, waterfalls and ridge hikes a short drive from Al Namas.",
        descriptionAr: "غابات عرعر وشلالات ومسارات تنزه جبلية على بعد مسافة قصيرة من النماص.",
      },
      {
        nameEn: "Mount Murir",
        nameAr: "جبل مرير",
        categoryEn: "Nature",
        categoryAr: "طبيعة",
        descriptionEn: "One of the highest peaks in the Sarawat range at around 2,700 metres, just north of Al Namas.",
        descriptionAr: "أحد أعلى قمم سلسلة السروات بارتفاع نحو 2,700 متر، شمال النماص مباشرة.",
      },
    ],
    dining: [
      {
        nameEn: "Sadaf Abha",
        nameAr: "مطعم سدف أبها",
        cuisineEn: "Saudi & southern",
        cuisineAr: "سعودي وجنوبي",
        descriptionEn: "Saudi cooking with the southern highland dishes Aseer is known for, in a family-friendly room.",
        descriptionAr: "مطبخ سعودي مع أطباق المرتفعات الجنوبية التي تشتهر بها عسير، في أجواء مناسبة للعائلات.",
      },
      {
        nameEn: "Ala Bali",
        nameAr: "مطعم على بالي",
        cuisineEn: "Italian & Lebanese",
        cuisineAr: "إيطالي ولبناني",
        descriptionEn: "Italian and Lebanese cooking, with terrace seating looking out over the Abha mountains.",
        descriptionAr: "مطبخ إيطالي ولبناني، مع جلسات خارجية تطل على جبال أبها.",
      },
      {
        nameEn: "Karamna",
        nameAr: "مطعم كرمنا",
        cuisineEn: "Lebanese",
        cuisineAr: "لبناني",
        descriptionEn: "Lebanese mezze and mixed grills, with outdoor seating and mountain views.",
        descriptionAr: "مقبلات لبنانية ومشاوٍ مشكّلة، مع جلسات خارجية وإطلالات جبلية.",
      },
      {
        nameEn: "Shandal Abha",
        nameAr: "مطعم شندل أبها",
        cuisineEn: "Hijazi & Gulf",
        cuisineAr: "حجازي وخليجي",
        descriptionEn: "Hijazi and Gulf dishes in a traditional Saudi setting, a good introduction to the region's cooking.",
        descriptionAr: "أطباق حجازية وخليجية في أجواء سعودية تقليدية، ومدخل جيد إلى مطبخ المنطقة.",
      },
    ],
    stay: [],
    extendedStay: [
      {
        nameEn: "AlSarah Palace",
        nameAr: "قصر السارة",
        descriptionEn: "A small aparthotel in Al Namas with kitchenette rooms, one of the few places to stay in the town itself rather than driving back to Abha.",
        descriptionAr: "شقق فندقية صغيرة في النماص بغرف مزودة بمطبخ صغير، من الخيارات القليلة للمبيت في البلدة نفسها بدل العودة إلى أبها.",
        tier: "budget",
      },
      {
        nameEn: "Tanuma Aram Hospitality Apartments",
        nameAr: "تنومة آرام للضيافة",
        descriptionEn: "A modern aparthotel in Tanomah with wide windows over the mountains, a rare overnight base among the town's juniper forests and waterfalls.",
        descriptionAr: "شقق فندقية حديثة في تنومة بنوافذ واسعة تطل على الجبال، قاعدة نادرة للمبيت وسط غابات العرعر وشلالات البلدة.",
      },
      {
        nameEn: "Al Habala Resort",
        nameAr: "منتجع الحبلة السياحي",
        descriptionEn: "A modest 20-room resort in Anqarah, about a 25-minute walk from Al Habala village itself, the closest overnight option to the hanging village.",
        descriptionAr: "منتجع متواضع من عشرين غرفة في عنقرة، على بعد نحو 25 دقيقة سيرًا من قرية الهبلة نفسها، أقرب خيار للمبيت من القرية المعلقة.",
        tier: "budget",
      },
    ],
    sampleDay: [
      {
        timeEn: "Morning",
        timeAr: "الصباح",
        placeEn: "Al Namas",
        placeAr: "النماص",
        descriptionEn: "The heritage museum and mountain parks while the air is coolest.",
        descriptionAr: "المتحف التراثي والحدائق الجبلية بينما الجو في أبرد حالاته.",
      },
      {
        timeEn: "Afternoon",
        timeAr: "بعد الظهر",
        placeEn: "Tanomah",
        placeAr: "تنومة",
        descriptionEn: "A walk through juniper forest toward one of the area's waterfalls.",
        descriptionAr: "نزهة بين غابات العرعر باتجاه أحد شلالات المنطقة.",
      },
      {
        timeEn: "Evening",
        timeAr: "المساء",
        placeEn: "A mountain viewpoint",
        placeAr: "مطلة جبلية",
        descriptionEn: "Watch the highlands turn gold before the drive back.",
        descriptionAr: "شاهد المرتفعات تتحول إلى اللون الذهبي قبل رحلة العودة.",
      },
    ],
  },
  "saudi-arabia/taif": {
    storyEn: [
      "Taif sits high enough above the coastal heat that the Ottomans built a summer palace here, and Saudis have been following their lead ever since. It's known across the region simply as the City of Roses, for the thousands of farms that turn the surrounding hills fragrant each spring.",
      "Shubra Palace, built in the early 1900s for the Sharif of Mecca, still anchors the old town. From there, the road climbs toward Al Hada, switchbacks lined with cliffside tea stalls and baboons happy to watch you drink your tea, before a cable car carries you the rest of the way up for canyon views the road can't match.",
      "This is a first look at what a few days in Taif could feel like. Tell us your dates and who's travelling, and we'll shape the rest around you.",
    ],
    storyAr: [
      "ترتفع الطائف فوق حرارة الساحل بما يكفي لأن يبني العثمانيون قصرًا صيفيًا هنا، وما زال السعوديون يحذون حذوهم منذ ذلك الحين. تُعرف في أنحاء المنطقة ببساطة بمدينة الورد، بفضل آلاف المزارع التي تعطر التلال المحيطة بها كل ربيع.",
      "لا يزال قصر شبرا، الذي بُني في أوائل القرن العشرين للشريف أمير مكة، يشكل محور المدينة القديمة. ومن هناك يصعد الطريق نحو الهدا، بمنعطفاته المحاطة بمقاهي الشاي على حافة الجبل وقردة البابون التي تراقبك وأنت تحتسي شايك، قبل أن يحملك التلفريك بقية الطريق صعودًا لإطلالات على الوادي لا يمنحها الطريق نفسه.",
      "هذه لمحة أولى عمّا يمكن أن تشعر به أيام قليلة في الطائف. أخبرنا بتواريخك ومن سيرافقك، وسنشكّل الباقي حولك.",
    ],
    pullQuoteEn: "For a few weeks each spring, this mountain city smells like roses instead of desert dust.",
    pullQuoteAr: "لأسابيع قليلة كل ربيع، تفوح هذه المدينة الجبلية برائحة الورد بدل غبار الصحراء.",
    weather: {
      bestWindow: {
        labelEn: "Best time to visit",
        labelAr: "أفضل وقت للزيارة",
        monthsEn: "November – April",
        monthsAr: "نوفمبر – أبريل",
        tempEn: "22–30°C, comfortable",
        tempAr: "22–30°م، معتدلة",
        noteEn: "April brings the Rose Festival, when farms across the hills open for tours and distillery demonstrations.",
        noteAr: "يجلب أبريل مهرجان الورد، حين تفتح المزارع في التلال أبوابها للجولات وعروض تقطير الزيت.",
      },
      peakHeat: {
        labelEn: "Hottest months",
        labelAr: "أشد الأشهر حرارة",
        monthsEn: "June – August",
        monthsAr: "يونيو – أغسطس",
        tempEn: "Up to 36°C by day",
        tempAr: "حتى 36°م نهارًا",
        noteEn: "Still cooler than Makkah or Jeddah below, but keep outdoor time to morning or late afternoon.",
        noteAr: "لا تزال أبرد من مكة أو جدة في الأسفل، لكن اجعل وقتك في الخارج صباحًا أو في وقت متأخر من بعد الظهر.",
      },
      tipEn: "Taif's elevation makes it noticeably cooler than the coast year-round, one of the reasons it became a summer retreat in the first place.",
      tipAr: "يجعل ارتفاع الطائف طقسها أبرد بوضوح من الساحل طوال العام، وهذا أحد أسباب تحولها إلى مصيف منذ البداية.",
    },
    transportation: [
      {
        modeEn: "Taif International Airport",
        modeAr: "مطار الطائف الدولي",
        descriptionEn: "Domestic flights connect Taif to Riyadh, Jeddah and other cities; the airport sits close to the city centre.",
        descriptionAr: "تربط رحلات داخلية الطائف بالرياض وجدة ومدن أخرى، ويقع المطار قريبًا من وسط المدينة.",
      },
      {
        modeEn: "Road from Makkah or Jeddah",
        modeAr: "الطريق من مكة أو جدة",
        descriptionEn: "Taif is a scenic 90-minute to two-hour drive from Makkah or Jeddah via the Al Hada mountain road, a popular day-trip or stopover route.",
        descriptionAr: "تبعد الطائف عن مكة أو جدة رحلة بانورامية تستغرق من 90 دقيقة إلى ساعتين عبر طريق جبل الهدا، وهو مسار مفضل للرحلات اليومية أو التوقف العابر.",
      },
      {
        modeEn: "Rental car",
        modeAr: "استئجار سيارة",
        descriptionEn: "Recommended for reaching rose farms and mountain viewpoints beyond the city centre at your own pace.",
        descriptionAr: "يُنصح به للوصول إلى مزارع الورد والمطلات الجبلية خارج وسط المدينة بالوتيرة التي تناسبك.",
      },
    ],
    faq: [
      {
        questionEn: "What is Taif famous for?",
        questionAr: "بم تشتهر الطائف؟",
        answerEn: "Being the City of Roses, thousands of farms that perfume the hills each spring, plus Shubra Palace and the winding Al Hada mountain road.",
        answerAr: "بكونها مدينة الورد، آلاف المزارع التي تعطر التلال كل ربيع، إضافة إلى قصر شبرا وطريق الهدا الجبلي المتعرج.",
      },
      {
        questionEn: "What's the best time of year to visit Taif?",
        questionAr: "ما أفضل وقت لزيارة الطائف؟",
        answerEn: "November through April for the most comfortable weather, and specifically April if you want to catch the Rose Festival.",
        answerAr: "من نوفمبر إلى أبريل لأكثر الأجواء اعتدالًا، وتحديدًا أبريل إن أردت حضور مهرجان الورد.",
      },
      {
        questionEn: "How many days should I spend in Taif?",
        questionAr: "كم يومًا يجب أن أقضي في الطائف؟",
        answerEn: "Two to four days is typical, often paired as a cooler add-on to a Makkah or Jeddah trip given the short drive.",
        answerAr: "يومان إلى أربعة أيام عادة، وغالبًا ما تُضاف كوجهة أبرد إلى رحلة مكة أو جدة نظرًا لقصر مسافة الطريق.",
      },
      {
        questionEn: "What are the best things to do in Taif?",
        questionAr: "ما أفضل الأنشطة في الطائف؟",
        answerEn: "Touring Shubra Palace, driving the Al Hada mountain road and riding the cable car, and visiting a rose farm during spring harvest.",
        answerAr: "جولة في قصر شبرا، وقيادة طريق جبل الهدا وركوب التلفريك، وزيارة مزرعة ورد خلال موسم الحصاد الربيعي.",
      },
      {
        questionEn: "Is Taif safe for tourists?",
        questionAr: "هل الطائف آمنة للسياح؟",
        answerEn: "Yes, Taif is generally very safe, and the mountain roads, while winding, are well maintained.",
        answerAr: "نعم، الطائف آمنة عمومًا، وطرق الجبال، رغم تعرجها، مصانة جيدًا.",
      },
      {
        questionEn: "What should I wear in Taif?",
        questionAr: "ماذا يجب أن أرتدي في الطائف؟",
        answerEn: "Modest, comfortable clothing; layers help since the mountain elevation makes evenings noticeably cooler than the coast.",
        answerAr: "ملابس محتشمة ومريحة؛ وتساعد الطبقات لأن ارتفاع الجبل يجعل الأمسيات أكثر برودة بوضوح من الساحل.",
      },
      {
        questionEn: "Do I need a visa to visit Taif?",
        questionAr: "هل أحتاج تأشيرة لزيارة الطائف؟",
        answerEn: "Many nationalities can apply for a Saudi tourist eVisa online before travelling. We can help confirm what applies to you as part of planning your trip.",
        answerAr: "يمكن لكثير من الجنسيات التقدم للحصول على التأشيرة السياحية الإلكترونية السعودية عبر الإنترنت قبل السفر. يمكننا مساعدتك في تأكيد ما ينطبق عليك ضمن التخطيط لرحلتك.",
      },
      {
        questionEn: "Is Taif good for families?",
        questionAr: "هل الطائف مناسبة للعائلات؟",
        answerEn: "Yes, the cable car, rose farms and Al Kar Tourist Village all work well for children, with cooler weather making outdoor time easier.",
        answerAr: "نعم، يناسب التلفريك ومزارع الورد وقرية الكار السياحية الأطفال جميعًا، ويسهّل الطقس الأبرد الوقت في الخارج.",
      },
      {
        questionEn: "What's Taif known for beyond roses?",
        questionAr: "بم تشتهر الطائف إلى جانب الورد؟",
        answerEn: "Honey, fresh mountain fruit and the Ottoman-era architecture of Shubra Palace, now a heritage museum in the old town.",
        answerAr: "بالعسل والفاكهة الجبلية الطازجة وعمارة قصر شبرا من الحقبة العثمانية، وهو اليوم متحف تراثي في المدينة القديمة.",
      },
    ],
    travelTips: [
      { en: "April is peak rose season, book rose-farm tours ahead if visiting then.", ar: "أبريل هو موسم الورد الأعلى، فاحجز جولات مزارع الورد مسبقًا إن كانت زيارتك حينها." },
      { en: "The Al Hada road has many switchbacks, take it slow if you're not used to mountain driving.", ar: "يضم طريق الهدا منعطفات كثيرة، فخذ وقتك إن لم تعتد القيادة الجبلية." },
      { en: "Evenings are noticeably cooler than the coast, pack a light jacket even in summer.", ar: "الأمسيات أبرد بوضوح من الساحل، فاصطحب سترة خفيفة حتى في الصيف." },
      { en: "The weekend in Saudi Arabia is Friday–Saturday, plan opening hours accordingly.", ar: "عطلة نهاية الأسبوع في السعودية هي الجمعة والسبت، فخطط لمواعيد العمل تبعًا لذلك." },
      { en: "Alcohol isn't sold or served anywhere in the Kingdom.", ar: "لا يُباع الكحول ولا يُقدَّم في أي مكان بالمملكة." },
      { en: "Watch your belongings around the baboons on the Al Hada road, they're bold around food.", ar: "انتبه لمقتنياتك قرب قردة البابون على طريق الهدا، فهي جريئة حول الطعام." },
    ],
    attractions: [
      {
        nameEn: "Shubra Palace",
        nameAr: "قصر شبرا",
        categoryEn: "Heritage",
        categoryAr: "تراث",
        descriptionEn: "An Ottoman-era palace built for the Sharif of Mecca in the early 1900s, now a museum of local heritage.",
        descriptionAr: "قصر من الحقبة العثمانية بُني لشريف مكة في أوائل القرن العشرين، وهو اليوم متحف للتراث المحلي.",
      },
      {
        nameEn: "Al Hada Mountain Road & Cable Car",
        nameAr: "طريق الهدا والتلفريك",
        categoryEn: "Landmark",
        categoryAr: "معلم",
        descriptionEn: "A winding cliffside road up to Al Hada, followed by a cable car with sweeping canyon views.",
        descriptionAr: "طريق متعرج على حافة الجبل يصعد إلى الهدا، يتبعه تلفريك بإطلالات واسعة على الوادي.",
      },
      {
        nameEn: "Taif Rose Farms",
        nameAr: "مزارع ورد الطائف",
        categoryEn: "Nature",
        categoryAr: "طبيعة",
        descriptionEn: "Farms open for tours and rose-oil distillery demonstrations, best visited during the spring harvest.",
        descriptionAr: "مزارع تفتح أبوابها للجولات وعروض تقطير زيت الورد، وأفضل وقت لزيارتها موسم الحصاد الربيعي.",
      },
      {
        nameEn: "Al Kar Tourist Village",
        nameAr: "قرية الكار السياحية",
        categoryEn: "Family",
        categoryAr: "عائلي",
        descriptionEn: "A mountain village with its own cable car and family activities above the valley floor.",
        descriptionAr: "قرية جبلية بتلفريك خاص بها وأنشطة عائلية فوق أرض الوادي.",
      },
    ],
    dining: [
      {
        nameEn: "Al Nakhil Ghyoom Al Hada",
        nameAr: "مطعم النخيل غيوم الهدا",
        cuisineEn: "Arabic",
        cuisineAr: "عربي",
        descriptionEn: "Arabic cooking up in Al Hada, where the mountain fog settles below the terrace on a cool evening.",
        descriptionAr: "مأكولات عربية في أعالي الهدا، حيث يستقر ضباب الجبل تحت الشرفة في الأمسيات الباردة.",
      },
      {
        nameEn: "Mallah Restaurant & Cafe",
        nameAr: "مطعم ومقهى ملاح",
        cuisineEn: "Saudi",
        cuisineAr: "سعودي",
        descriptionEn: "A local favourite for kabsa and jareesh, unfussy and consistently good rather than dressed up for visitors.",
        descriptionAr: "من مفضلات أهل الطائف للكبسة والجريش، بسيط وجيد على الدوام أكثر منه مُعدًّا للزوار.",
      },
      {
        nameEn: "Baitna Alqadeem",
        nameAr: "مطعم بيتنا القديم",
        cuisineEn: "Saudi heritage",
        cuisineAr: "تراثي سعودي",
        descriptionEn: "Classic Saudi dishes served inside a preserved old Taif house, so the room is part of the meal.",
        descriptionAr: "أطباق سعودية أصيلة تُقدَّم داخل بيت طائفي قديم محفوظ، فيصبح المكان نفسه جزءًا من الوجبة.",
      },
      {
        nameEn: "Seven Huts Cafe",
        nameAr: "مقهى الأكواخ السبعة",
        cuisineEn: "Cafe",
        cuisineAr: "مقهى",
        descriptionEn: "A mountain cafe above Taif, worth the drive for coffee and a long look at the view.",
        descriptionAr: "مقهى جبلي فوق الطائف، تستحق الطريق إليه من أجل القهوة وإطالة النظر إلى المشهد.",
      },
    ],
    stay: [
      // "Taif Marriott Resort & Spa" was removed on 20 August 2026. It does
      // not appear to exist. Marriott's own portfolio lists exactly one Taif
      // property, Le Méridien Al Hada, which is the entry below; the name
      // returns nothing on any booking platform and appears in no signing or
      // opening announcement.
      //
      // It was the first hotel in this list, so it was the default luxury
      // pick for Taif, and a plan naming it would have sent a paying customer
      // to book a hotel that has never existed. The Oberoi at least used to
      // be real. Nothing goes in this file that has not been seen on the
      // operator's own site.
      {
        nameEn: "Le Méridien Al Hada",
        nameAr: "لو ميريديان الهدا",
        descriptionEn: "Directly opposite the Al Hada cable car station, for easy access to the canyon views.",
        descriptionAr: "يقع مباشرة أمام محطة تلفريك الهدا، لسهولة الوصول إلى إطلالات الوادي.",
      },
    ],
    extendedStay: [
      {
        nameEn: "InterContinental Taif",
        nameAr: "إنتركونتيننتال الطائف",
        descriptionEn: "A five-star mountain hotel on Airport Road at roughly 1,700 metres elevation, with sweeping views over the Hejaz highlands.",
        descriptionAr: "فندق جبلي خمس نجوم على طريق المطار على ارتفاع نحو 1700 متر، بإطلالات واسعة على مرتفعات الحجاز.",
        tier: "luxury",
      },
      {
        nameEn: "Awaliv Hotel",
        nameAr: "فندق أواليف",
        descriptionEn: "A city-centre high-rise known for its revolving rooftop restaurant and panoramic views over Taif.",
        descriptionAr: "برج فندقي في وسط المدينة يشتهر بمطعمه الدوّار على السطح وإطلالاته البانورامية على الطائف.",
      },
      {
        nameEn: "Iris Boutique Taif Heart",
        nameAr: "أيريس بوتيك قلب الطائف",
        descriptionEn: "A small boutique hotel near Shubra Palace, fireplace-equipped rooms and a spa, well-reviewed for its beds and breakfast.",
        descriptionAr: "فندق بوتيك صغير قرب قصر شبرا، بغرف مزودة بمواقد وسبا، ويحظى بتقييمات جيدة لأسرّته وإفطاره.",
      },
      {
        nameEn: "Jadeel Serviced Apartments",
        nameAr: "شقق جديل المخدومة",
        descriptionEn: "Kitchenette-equipped apartments on King Faisal Road, a practical budget base near Shubra Palace.",
        descriptionAr: "شقق مجهزة بمطابخ صغيرة على طريق الملك فيصل، قاعدة اقتصادية عملية قرب قصر شبرا.",
        tier: "budget",
      },
    ],
    sampleDay: [
      {
        timeEn: "Morning",
        timeAr: "الصباح",
        placeEn: "Shubra Palace",
        placeAr: "قصر شبرا",
        descriptionEn: "Wander the Ottoman-era rooms before the day warms up.",
        descriptionAr: "تجوّل في غرف الحقبة العثمانية قبل أن يدفأ النهار.",
      },
      {
        timeEn: "Afternoon",
        timeAr: "بعد الظهر",
        placeEn: "A rose farm",
        placeAr: "مزرعة ورد",
        descriptionEn: "A tour and distillery demonstration, if you're visiting in season.",
        descriptionAr: "جولة وعرض تقطير، إن كانت زيارتك في الموسم.",
      },
      {
        timeEn: "Sunset",
        timeAr: "الغروب",
        placeEn: "Al Hada Cable Car",
        placeAr: "تلفريك الهدا",
        descriptionEn: "Ride up as the canyon below turns gold.",
        descriptionAr: "اصعد بينما يتحول الوادي أسفلك إلى اللون الذهبي.",
      },
    ],
  },
  "saudi-arabia/al-ahsa": {
    storyEn: [
      "Al-Ahsa is the largest oasis on Earth, over two and a half million date palms rising out of desert that stretches unbroken in every direction. UNESCO recognised the whole thing in 2018, springs, canals, gardens and all.",
      "The oasis isn't the only strange, beautiful thing here. Al-Qarah Mountain has been hollowed by wind into mushroom-shaped caves you can walk straight into, the Al-Qaisariya Souq has been trading since 1822 under the same covered alleys, and Al Asfar Lake sits naturally, unmistakably yellow, ringed by sand dunes on every side.",
      "This is a first glimpse of what your time in Al-Ahsa could hold. Tell us your dates and who's travelling, and we'll shape the rest around you.",
    ],
    storyAr: [
      "الأحساء هي أكبر واحة في العالم، أكثر من مليونين ونصف مليون نخلة ترتفع من صحراء تمتد بلا انقطاع في كل اتجاه. سجّلت اليونسكو الواحة بأكملها عام 2018، بينابيعها وقنواتها وحدائقها.",
      "والواحة ليست الشيء الغريب والجميل الوحيد هنا. جبل القارة نحتته الرياح إلى كهوف بأشكال أشبه بالفطر يمكنك المشي داخلها مباشرة، وسوق القيصرية يتاجر منذ عام 1822 تحت الأزقة المسقوفة ذاتها، وتقع بحيرة الأصفر بلونها الأصفر الطبيعي الواضح، محاطة بالكثبان الرملية من كل جانب.",
      "هذه لمحة أولى عمّا يمكن أن تحمله أيامك في الأحساء. أخبرنا بتواريخك ومن سيرافقك، وسنشكّل الباقي حولك.",
    ],
    pullQuoteEn: "Surrounded by desert on every side, this remains the largest oasis on Earth, home to a lake that's naturally, unmistakably yellow.",
    pullQuoteAr: "محاطة بالصحراء من كل جانب، لا تزال هذه أكبر واحة على وجه الأرض، وموطن بحيرة صفراء اللون بشكل طبيعي وواضح.",
    weather: {
      bestWindow: {
        labelEn: "Best time to visit",
        labelAr: "أفضل وقت للزيارة",
        monthsEn: "November – March",
        monthsAr: "نوفمبر – مارس",
        tempEn: "15–25°C, mild and dry",
        tempAr: "15–25°م، معتدلة وجافة",
        noteEn: "Comfortable for the oasis, Al-Qarah Mountain and the souq; December and January bring local food festivals.",
        noteAr: "مناسبة للواحة وجبل القارة والسوق، وتشهد ديسمبر ويناير مهرجانات طعام محلية.",
      },
      peakHeat: {
        labelEn: "Peak summer heat",
        labelAr: "ذروة الحر الصيفي",
        monthsEn: "April – October",
        monthsAr: "أبريل – أكتوبر",
        tempEn: "42–47°C, intensely hot",
        tempAr: "42–47°م، حر شديد",
        noteEn: "Among the hottest stretches in the Kingdom; save outdoor sites for early morning.",
        noteAr: "من أشد الفترات حرارة في المملكة، فاجعل زيارة المواقع الخارجية في الصباح الباكر.",
      },
      tipEn: "Al-Ahsa's long summer runs six months, plan around November through March if you can.",
      tipAr: "يمتد صيف الأحساء الطويل ستة أشهر، فحاول التخطيط بين نوفمبر ومارس إن أمكن.",
    },
    transportation: [
      {
        modeEn: "al-Ahsa International Airport",
        modeAr: "مطار الأحساء الدولي",
        descriptionEn: "Domestic flights connect Al-Ahsa to Riyadh, Jeddah and other major cities.",
        descriptionAr: "تربط رحلات داخلية الأحساء بالرياض وجدة ومدن رئيسية أخرى.",
      },
      {
        modeEn: "Road from Dammam or Riyadh",
        modeAr: "الطريق من الدمام أو الرياض",
        descriptionEn: "Al-Ahsa is roughly a 90-minute drive from Dammam and about two and a half hours from Riyadh via well-maintained highways.",
        descriptionAr: "تبعد الأحساء نحو 90 دقيقة بالسيارة عن الدمام وحوالي ساعتين ونصف عن الرياض عبر طرق سريعة مصانة جيدًا.",
      },
      {
        modeEn: "Rental car or taxi",
        modeAr: "استئجار سيارة أو سيارة أجرة",
        descriptionEn: "The oasis, mountain and souq are spread across the city, so a car or ride-hailing app makes getting between them far easier.",
        descriptionAr: "تتوزع الواحة والجبل والسوق في أنحاء المدينة، لذا تجعل السيارة أو تطبيقات النقل التنقل بينها أسهل بكثير.",
      },
    ],
    faq: [
      {
        questionEn: "What is Al-Ahsa famous for?",
        questionAr: "بم تشتهر الأحساء؟",
        answerEn: "Being the largest oasis on Earth, a UNESCO World Heritage site with over two and a half million date palms, plus Al-Qarah Mountain's wind-carved caves.",
        answerAr: "بكونها أكبر واحة على وجه الأرض، وموقع تراث عالمي لليونسكو يضم أكثر من مليونين ونصف مليون نخلة، إضافة إلى كهوف جبل القارة المنحوتة بفعل الرياح.",
      },
      {
        questionEn: "What's the best time of year to visit Al-Ahsa?",
        questionAr: "ما أفضل وقت لزيارة الأحساء؟",
        answerEn: "November through March, when temperatures are mild; summers here are among the hottest in the Kingdom.",
        answerAr: "من نوفمبر إلى مارس، حين تكون درجات الحرارة معتدلة؛ فصيف الأحساء من أشد الفصول حرارة في المملكة.",
      },
      {
        questionEn: "How many days should I spend in Al-Ahsa?",
        questionAr: "كم يومًا يجب أن أقضي في الأحساء؟",
        answerEn: "One to two days covers the oasis, Al-Qarah Mountain and the souq comfortably.",
        answerAr: "يوم إلى يومين يكفيان لتغطية الواحة وجبل القارة والسوق بشكل مريح.",
      },
      {
        questionEn: "What are the best things to do in Al-Ahsa?",
        questionAr: "ما أفضل الأنشطة في الأحساء؟",
        answerEn: "Walking through the palm oasis, exploring the caves of Al-Qarah Mountain, browsing the centuries-old Al-Qaisariya Souq, and seeing the yellow waters of Al Asfar Lake.",
        answerAr: "التجول في واحة النخيل، واستكشاف كهوف جبل القارة، والتجوّل في سوق القيصرية العريق، ومشاهدة المياه الصفراء لبحيرة الأصفر.",
      },
      {
        questionEn: "Is Al-Ahsa safe for tourists?",
        questionAr: "هل الأحساء آمنة للسياح؟",
        answerEn: "Yes, Al-Ahsa is generally very safe and welcoming to visitors.",
        answerAr: "نعم، الأحساء آمنة عمومًا ومرحبة بالزوار.",
      },
      {
        questionEn: "What should I wear in Al-Ahsa?",
        questionAr: "ماذا يجب أن أرتدي في الأحساء؟",
        answerEn: "Modest, breathable clothing; the caves and covered souq stay cooler than the open oasis in summer.",
        answerAr: "ملابس محتشمة وخفيفة؛ فالكهوف والسوق المسقوف أبرد من الواحة المكشوفة في الصيف.",
      },
      {
        questionEn: "Do I need a visa to visit Al-Ahsa?",
        questionAr: "هل أحتاج تأشيرة لزيارة الأحساء؟",
        answerEn: "Many nationalities can apply for a Saudi tourist eVisa online before travelling. We can help confirm what applies to you as part of planning your trip.",
        answerAr: "يمكن لكثير من الجنسيات التقدم للحصول على التأشيرة السياحية الإلكترونية السعودية عبر الإنترنت قبل السفر. يمكننا مساعدتك في تأكيد ما ينطبق عليك ضمن التخطيط لرحلتك.",
      },
      {
        questionEn: "Is Al-Ahsa good for families?",
        questionAr: "هل الأحساء مناسبة للعائلات؟",
        answerEn: "Yes, the oasis and Al-Qarah Mountain caves are easy, walkable outings that work well for children.",
        answerAr: "نعم، تُعد الواحة وكهوف جبل القارة نزهات سهلة يمكن السير فيها وتناسب الأطفال.",
      },
      {
        questionEn: "What's Al-Ahsa known for beyond the oasis?",
        questionAr: "بم تشتهر الأحساء إلى جانب الواحة؟",
        answerEn: "Its dates, considered among the finest in Saudi Arabia, and traditional handicrafts still sold in the Al-Qaisariya Souq.",
        answerAr: "بتمورها التي تُعد من أجود أنواع التمور في السعودية، وحرفها التقليدية التي لا تزال تُباع في سوق القيصرية.",
      },
    ],
    travelTips: [
      { en: "Wear sturdy, closed shoes for exploring the caves of Al-Qarah Mountain.", ar: "ارتدِ حذاءً مغلقًا ومريحًا لاستكشاف كهوف جبل القارة." },
      { en: "December and January bring local food festivals, a good time to visit if the dates line up.", ar: "يجلب ديسمبر ويناير مهرجانات طعام محلية، وهو وقت جيد للزيارة إن توافقت التواريخ." },
      { en: "Summers here are extreme, plan any warm-weather visit around early mornings only.", ar: "الصيف هنا شديد الحرارة، فخطط لأي زيارة في الطقس الدافئ في الصباح الباكر فقط." },
      { en: "The weekend in Saudi Arabia is Friday–Saturday, plan opening hours accordingly.", ar: "عطلة نهاية الأسبوع في السعودية هي الجمعة والسبت، فخطط لمواعيد العمل تبعًا لذلك." },
      { en: "Alcohol isn't sold or served anywhere in the Kingdom.", ar: "لا يُباع الكحول ولا يُقدَّم في أي مكان بالمملكة." },
      { en: "The Al-Qaisariya Souq is at its liveliest in the early evening once the heat breaks.", ar: "يكون سوق القيصرية في أوج نشاطه في المساء الباكر بعد أن يخف الحر." },
    ],
    attractions: [
      {
        nameEn: "Al-Ahsa Oasis",
        nameAr: "واحة الأحساء",
        categoryEn: "Heritage",
        categoryAr: "تراث",
        descriptionEn: "A UNESCO World Heritage oasis, the largest on Earth, with over two and a half million date palms.",
        descriptionAr: "واحة مسجلة في التراث العالمي لليونسكو، أكبر واحة على وجه الأرض، بأكثر من مليوني ونصف مليون نخلة.",
      },
      {
        nameEn: "Al-Qarah Mountain",
        nameAr: "جبل القارة",
        categoryEn: "Nature",
        categoryAr: "طبيعة",
        descriptionEn: "Wind-carved limestone caves, mushroom-shaped formations and narrow passages you can walk through.",
        descriptionAr: "كهوف من الحجر الجيري نحتتها الرياح، وتكوينات بشكل الفطر وممرات ضيقة يمكنك المشي عبرها.",
      },
      {
        nameEn: "Al-Qaisariya Souq",
        nameAr: "سوق القيصرية",
        categoryEn: "Heritage",
        categoryAr: "تراث",
        descriptionEn: "Trading since 1822, one of the oldest covered markets in the Arabian Peninsula, over 400 shops.",
        descriptionAr: "يتاجر منذ عام 1822، أحد أقدم الأسواق المسقوفة في الجزيرة العربية، ويضم أكثر من 400 محل.",
      },
      {
        nameEn: "Al Asfar Lake",
        nameAr: "بحيرة الأصفر",
        categoryEn: "Nature",
        categoryAr: "طبيعة",
        descriptionEn: "A naturally yellow-tinted lake, coloured by surrounding limestone and sulfur springs, ringed by dunes.",
        descriptionAr: "بحيرة صفراء اللون طبيعيًا، يمنحها لونها الحجر الجيري وينابيع الكبريت المحيطة، وتحيط بها الكثبان الرملية.",
      },
    ],
    dining: [
      {
        nameEn: "Flavors Restaurant",
        nameAr: "مطعم فليفرز",
        cuisineEn: "International",
        cuisineAr: "عالمي",
        descriptionEn: "The culinary heart of InterContinental Al Ahsa, an international buffet with theme nights alongside an a la carte menu.",
        descriptionAr: "قلب المطبخ في إنتركونتيننتال الأحساء، بوفيه عالمي مع أمسيات مخصصة إلى جانب قائمة الطعام.",
      },
      {
        nameEn: "Al Bustan",
        nameAr: "مطعم البستان",
        cuisineEn: "Middle Eastern",
        cuisineAr: "شرق أوسطي",
        descriptionEn: "Middle Eastern cooking at InterContinental Al Ahsa, the better choice when you want the region's own dishes.",
        descriptionAr: "مطبخ شرق أوسطي في إنتركونتيننتال الأحساء، والخيار الأفضل حين تريد أطباق المنطقة نفسها.",
      },
      {
        nameEn: "Bateel Boutique",
        nameAr: "بوتيك باتيل",
        cuisineEn: "Cafe",
        cuisineAr: "مقهى",
        descriptionEn: "The lobby coffee shop at InterContinental Al Ahsa, for coffee, tea and cakes between the oasis and the souq.",
        descriptionAr: "مقهى الردهة في إنتركونتيننتال الأحساء، للقهوة والشاي والحلويات بين الواحة والسوق.",
      },
    ],
    stay: [
      {
        nameEn: "Al Ahsa InterContinental",
        nameAr: "إنتركونتيننتال الأحساء",
        descriptionEn: "The region's top-rated address, a comfortable base for the oasis and heritage sites.",
        descriptionAr: "العنوان الأعلى تقييمًا في المنطقة، قاعدة مريحة لزيارة الواحة والمواقع التراثية.",
      },
      {
        nameEn: "Al Ahsa Grand Hotel",
        nameAr: "فندق الأحساء جراند",
        descriptionEn: "A 5-star hotel across from King Faisal University, within walking distance of restaurants.",
        descriptionAr: "فندق خمس نجوم مقابل جامعة الملك فيصل، على مسافة قريبة من المطاعم.",
      },
    ],
    extendedStay: [
      {
        nameEn: "Braira Al-Ahsa",
        nameAr: "بريرا الأحساء",
        descriptionEn: "A 4-star hotel near the airport and train station, named the region's best luxury hotel by the Luxury Lifestyle Awards in 2025.",
        descriptionAr: "فندق أربع نجوم قرب المطار ومحطة القطار، حاز لقب أفضل فندق فاخر في المنطقة من جوائز لاكجري لايف ستايل عام 2025.",
        tier: "luxury",
      },
      {
        nameEn: "Drwazet Al Nakheel Village",
        nameAr: "قرية دروازة النخيل",
        descriptionEn: "A chalet-style resort near Al-Qarah Mountain, with garden and pool views, a quieter alternative to the city-centre hotels.",
        descriptionAr: "منتجع على طراز الشاليهات قرب جبل القارة، بإطلالات على الحديقة والمسبح، بديل هادئ عن فنادق وسط المدينة.",
      },
      {
        nameEn: "Somewhere Hotel Al Ahsa",
        nameAr: "فندق سموير الأحساء",
        descriptionEn: "A modern hotel in Al-Mubarraz with a spa, hot tub and gym, praised for its quiet, comfortable rooms.",
        descriptionAr: "فندق حديث في المبرز بسبا وحوض استرخاء ونادٍ رياضي، يحظى بتقدير لهدوئه وراحة غرفه.",
      },
      {
        nameEn: "Al Muhaidb Residence Al Ahsa",
        nameAr: "المهيدب ريزيدنس الأحساء",
        descriptionEn: "Budget-friendly serviced apartments with kitchenettes and free breakfast, part of a well-known Saudi residence chain.",
        descriptionAr: "شقق مخدومة اقتصادية بمطابخ صغيرة وإفطار مجاني، ضمن سلسلة سعودية معروفة للشقق الفندقية.",
        tier: "budget",
      },
    ],
    extendedProviders: [
      {
        nameEn: "Noorha Transport",
        nameAr: "نورها ترانسبورت",
        typeEn: "Pre-booked private driver service",
        typeAr: "خدمة سائق خاص بالحجز المسبق",
        noteEn: "A locally based operator covering Hofuf, Al-Mubarraz and the wider Al-Ahsa Governorate with fixed-rate, WhatsApp-booked rides, positioned as Transport General Authority licensed, worth confirming current licensing when booking.",
        noteAr: "مشغّل نقل محلي يغطي الهفوف والمبرز ومحافظة الأحساء بأكملها بأسعار ثابتة وحجز عبر واتساب، ويُوصف بأنه مرخّص من الهيئة العامة للنقل، ويُفضل التأكد من الترخيص الحالي عند الحجز.",
      },
    ],
    sampleDay: [
      {
        timeEn: "Morning",
        timeAr: "الصباح",
        placeEn: "Al-Qarah Mountain",
        placeAr: "جبل القارة",
        descriptionEn: "Walk the wind-carved caves while they're still cool.",
        descriptionAr: "تجوّل في الكهوف المنحوتة بالرياح بينما لا تزال باردة.",
      },
      {
        timeEn: "Afternoon",
        timeAr: "بعد الظهر",
        placeEn: "Al-Qaisariya Souq",
        placeAr: "سوق القيصرية",
        descriptionEn: "Two centuries of trading history under the same covered alleys.",
        descriptionAr: "قرنان من التاريخ التجاري تحت الأزقة المسقوفة ذاتها.",
      },
      {
        timeEn: "Sunset",
        timeAr: "الغروب",
        placeEn: "Al Asfar Lake",
        placeAr: "بحيرة الأصفر",
        descriptionEn: "Watch the light change over yellow water ringed by dunes.",
        descriptionAr: "شاهد الضوء يتغير فوق المياه الصفراء المحاطة بالكثبان.",
      },
    ],
  },
  "saudi-arabia/jazan": {
    storyEn: [
      "Jazan doesn't look like the Saudi Arabia most people picture. It's the Kingdom's tropical corner, humid and green in places, closer to the Horn of Africa than to Riyadh, with a character shaped as much by the sea and the mountains as by the desert.",
      "The Farasan Islands hold a marine sanctuary where whale sharks and dugongs pass close to shore, and a Pearl Merchants' Neighbourhood of coral-built houses left over from the pearling trade. Inland, the Fayfa Mountains rise into terraced coffee farms, stone staircases carved into slopes steep enough to earn the name Land of Hanging Gardens.",
      "This is a first look at what a few days in Jazan could feel like. Tell us your dates and who's travelling, and we'll shape the rest around you.",
    ],
    storyAr: [
      "لا تشبه جازان الصورة التي يتخيلها معظم الناس عن السعودية. إنها الركن الاستوائي في المملكة، رطب وأخضر في أماكن منه، وأقرب إلى القرن الأفريقي منه إلى الرياض، بطابع شكّله البحر والجبال بقدر ما شكّلته الصحراء.",
      "تضم جزر فرسان محمية بحرية يمر بالقرب من شواطئها سمك القرش الحوتي وخراف البحر، وحي تجار اللؤلؤ ببيوته المبنية من المرجان المتبقية من زمن تجارة اللؤلؤ. وفي الداخل، ترتفع جبال فيفاء إلى مدرجات قهوة زراعية، سلالم حجرية منحوتة في منحدرات شديدة الانحدار استحقت بها لقب أرض الحدائق المعلقة.",
      "هذه لمحة أولى عمّا يمكن أن تشعر به أيام قليلة في جازان. أخبرنا بتواريخك ومن سيرافقك، وسنشكّل الباقي حولك.",
    ],
    pullQuoteEn: "This is Saudi Arabia's tropical corner, mangroves and coffee terraces where most people still picture only desert.",
    pullQuoteAr: "هذا هو الركن الاستوائي في السعودية، أشجار مانغروف ومدرجات قهوة حيث لا يزال معظم الناس يتخيلون صحراء فقط.",
    weather: {
      bestWindow: {
        labelEn: "Best time to visit",
        labelAr: "أفضل وقت للزيارة",
        monthsEn: "October – March",
        monthsAr: "أكتوبر – مارس",
        tempEn: "25–32°C, lower humidity",
        tempAr: "25–32°م، رطوبة أقل",
        noteEn: "Also the best birdwatching season on the Farasan Islands, as migratory species arrive.",
        noteAr: "وهو أيضًا أفضل موسم لمراقبة الطيور في جزر فرسان مع وصول الأنواع المهاجرة.",
      },
      peakHeat: {
        labelEn: "Hot and humid season",
        labelAr: "موسم الحر والرطوبة",
        monthsEn: "June – September",
        monthsAr: "يونيو – سبتمبر",
        tempEn: "Over 40°C with humidity above 80%",
        tempAr: "أكثر من 40°م برطوبة تتجاوز 80%",
        noteEn: "The combination of heat and humidity is intense; midday outdoor time is best avoided.",
        noteAr: "الجمع بين الحرارة والرطوبة شديد الوطأة، ويُفضَّل تجنب الوقت في الخارج ظهرًا.",
      },
      tipEn: "The sea stays warm enough to swim in even during the cooler winter months.",
      tipAr: "يبقى البحر دافئًا بما يكفي للسباحة حتى خلال أشهر الشتاء الأكثر برودة.",
    },
    transportation: [
      {
        modeEn: "King Abdullah Bin Abdulaziz Airport",
        modeAr: "مطار الملك عبدالله بن عبدالعزيز",
        descriptionEn: "Jazan's airport connects to Riyadh, Jeddah and other major Saudi cities with regular domestic flights.",
        descriptionAr: "يربط مطار جازان بالرياض وجدة ومدن سعودية رئيسية أخرى برحلات داخلية منتظمة.",
      },
      {
        modeEn: "Boat to the Farasan Islands",
        modeAr: "قارب إلى جزر فرسان",
        descriptionEn: "Ferries run from Jazan's port to the Farasan Islands; book ahead as sailings are limited and seas are calmest in the morning.",
        descriptionAr: "تعمل العبّارات من ميناء جازان إلى جزر فرسان؛ يُفضَّل الحجز مسبقًا لأن الرحلات محدودة والبحر أهدأ صباحًا.",
      },
      {
        modeEn: "Rental car",
        modeAr: "استئجار سيارة",
        descriptionEn: "Needed for reaching the Fayfa Mountains and moving between the Corniche and outlying sites on the mainland.",
        descriptionAr: "ضرورية للوصول إلى جبال فيفاء والتنقل بين الكورنيش والمواقع الطرفية في البر الرئيسي.",
      },
    ],
    faq: [
      {
        questionEn: "What is Jazan famous for?",
        questionAr: "بم تشتهر جازان؟",
        answerEn: "Being Saudi Arabia's tropical corner, the Farasan Islands' marine sanctuary, and the terraced coffee farms of the Fayfa Mountains.",
        answerAr: "بكونها الركن الاستوائي في السعودية، ومحمية جزر فرسان البحرية، ومدرجات القهوة في جبال فيفاء.",
      },
      {
        questionEn: "What's the best time of year to visit Jazan?",
        questionAr: "ما أفضل وقت لزيارة جازان؟",
        answerEn: "October through March, when humidity drops and it's also the best season for birdwatching on the Farasan Islands.",
        answerAr: "من أكتوبر إلى مارس، حين تنخفض الرطوبة، وهو أيضًا أفضل موسم لمراقبة الطيور في جزر فرسان.",
      },
      {
        questionEn: "How many days should I spend in Jazan?",
        questionAr: "كم يومًا يجب أن أقضي في جازان؟",
        answerEn: "Three to four days lets you split time between the islands, the mountains and the Corniche without rushing.",
        answerAr: "ثلاثة إلى أربعة أيام تتيح لك توزيع الوقت بين الجزر والجبال والكورنيش دون تسرع.",
      },
      {
        questionEn: "What are the best things to do in Jazan?",
        questionAr: "ما أفضل الأنشطة في جازان؟",
        answerEn: "Boating out to the Farasan Islands to spot whale sharks, wandering the coral Pearl Merchants' Neighbourhood, and driving into the Fayfa Mountains' coffee terraces.",
        answerAr: "ركوب القارب إلى جزر فرسان لمشاهدة سمك القرش الحوتي، والتجول في حي تجار اللؤلؤ المرجاني، والقيادة إلى مدرجات القهوة في جبال فيفاء.",
      },
      {
        questionEn: "Is Jazan safe for tourists?",
        questionAr: "هل جازان آمنة للسياح؟",
        answerEn: "Yes, the tourist areas around Jazan city, the Corniche and the Farasan Islands are safe and welcoming.",
        answerAr: "نعم، المناطق السياحية حول مدينة جازان والكورنيش وجزر فرسان آمنة ومرحبة بالزوار.",
      },
      {
        questionEn: "What should I wear in Jazan?",
        questionAr: "ماذا يجب أن أرتدي في جازان؟",
        answerEn: "Light, modest, breathable clothing, the humidity here is higher than almost anywhere else in the Kingdom.",
        answerAr: "ملابس خفيفة ومحتشمة وقابلة للتنفس، فالرطوبة هنا أعلى من أي مكان آخر تقريبًا في المملكة.",
      },
      {
        questionEn: "Do I need a visa to visit Jazan?",
        questionAr: "هل أحتاج تأشيرة لزيارة جازان؟",
        answerEn: "Many nationalities can apply for a Saudi tourist eVisa online before travelling. We can help confirm what applies to you as part of planning your trip.",
        answerAr: "يمكن لكثير من الجنسيات التقدم للحصول على التأشيرة السياحية الإلكترونية السعودية عبر الإنترنت قبل السفر. يمكننا مساعدتك في تأكيد ما ينطبق عليك ضمن التخطيط لرحلتك.",
      },
      {
        questionEn: "Is Jazan good for families?",
        questionAr: "هل جازان مناسبة للعائلات؟",
        answerEn: "Yes, the Corniche and calmer island beaches work well for children, though boat trips are best for kids comfortable on water.",
        answerAr: "نعم، يناسب الكورنيش وشواطئ الجزر الأكثر هدوءًا الأطفال، رغم أن رحلات القوارب تناسب أكثر الأطفال المرتاحين على الماء.",
      },
      {
        questionEn: "What's Jazan known for beyond the islands?",
        questionAr: "بم تشتهر جازان إلى جانب الجزر؟",
        answerEn: "Its coffee, grown on terraces that give the Fayfa Mountains their nickname, the Land of Hanging Gardens.",
        answerAr: "بقهوتها التي تُزرع في مدرجات منحتها جبال فيفاء لقب أرض الحدائق المعلقة.",
      },
    ],
    travelTips: [
      { en: "Book Farasan Islands boat trips in advance, sailings are limited and can fill up.", ar: "احجز رحلات القوارب إلى جزر فرسان مسبقًا، فالرحلات محدودة وقد تمتلئ." },
      { en: "Mornings offer the calmest seas for the crossing to Farasan.", ar: "الصباح يوفر أهدأ بحر لعبور فرسان." },
      { en: "Humidity is high year-round, drink more water than you think you need.", ar: "الرطوبة مرتفعة طوال العام، فاشرب ماءً أكثر مما تظن أنك تحتاج." },
      { en: "The weekend in Saudi Arabia is Friday–Saturday, plan opening hours accordingly.", ar: "عطلة نهاية الأسبوع في السعودية هي الجمعة والسبت، فخطط لمواعيد العمل تبعًا لذلك." },
      { en: "Alcohol isn't sold or served anywhere in the Kingdom.", ar: "لا يُباع الكحول ولا يُقدَّم في أي مكان بالمملكة." },
      { en: "The Fayfa Mountains' roads are steep and winding, take the drive slowly.", ar: "طرق جبال فيفاء شديدة الانحدار والتعرج، فخذ وقتك في القيادة." },
    ],
    attractions: [
      {
        nameEn: "Farasan Islands",
        nameAr: "جزر فرسان",
        categoryEn: "Nature",
        categoryAr: "طبيعة",
        descriptionEn: "A marine sanctuary for whale sharks, dugongs and sea turtles, reached by boat from Jazan.",
        descriptionAr: "محمية بحرية لسمك القرش الحوتي وخراف البحر والسلاحف البحرية، يُصل إليها بالقارب من جازان.",
      },
      {
        nameEn: "Fayfa Mountains",
        nameAr: "جبال فيفاء",
        categoryEn: "Nature",
        categoryAr: "طبيعة",
        descriptionEn: "Centuries-old stone terraces climbing steep slopes, still growing coffee, maize and pomegranate.",
        descriptionAr: "مدرجات حجرية عمرها قرون تتسلق منحدرات شديدة الانحدار، ولا تزال تُزرع فيها القهوة والذرة والرمان.",
      },
      {
        nameEn: "Pearl Merchants' Neighbourhood",
        nameAr: "حي تجار اللؤلؤ",
        categoryEn: "Heritage",
        categoryAr: "تراث",
        // Named for what it is rather than what it is called, so the
        // description carries a landmark that can actually be searched: the
        // Al-Rifai house is the one everybody photographs.
        descriptionEn: "Coral-built houses on Farasan with carved plasterwork, left over from the pearling era; the Al-Rifai house is the finest of them.",
        descriptionAr: "بيوت مبنية من المرجان في فرسان بزخارف جصية منحوتة، متبقية من زمن تجارة اللؤلؤ، وأجملها بيت الرفاعي.",
      },
      {
        nameEn: "Jazan Corniche",
        nameAr: "كورنيش جازان",
        categoryEn: "Waterfront",
        categoryAr: "واجهة بحرية",
        descriptionEn: "The mainland's waterfront promenade, a relaxed base between island and mountain trips.",
        descriptionAr: "ممشى الواجهة البحرية في البر الرئيسي، قاعدة هادئة بين رحلات الجزر والجبال.",
      },
    ],
    dining: [
      {
        nameEn: "Ocean Basket Jazan",
        nameAr: "أوشن باسكت جازان",
        cuisineEn: "Seafood",
        cuisineAr: "مأكولات بحرية",
        descriptionEn: "The Corniche branch of the seafood chain, prawns, calamari and grilled fish, reliable with children.",
        descriptionAr: "فرع الكورنيش من سلسلة المأكولات البحرية، روبيان وكاليماري وسمك مشوي، ومناسب للأطفال.",
      },
      {
        nameEn: "Alsafina Restaurant",
        nameAr: "مطعم السفينة",
        cuisineEn: "Seafood",
        cuisineAr: "مأكولات بحرية",
        descriptionEn: "The seafood specialty room at Grand Millennium Jazan, eastern and western dishes side by side.",
        descriptionAr: "مطعم المأكولات البحرية المتخصص في جراند ميلينيوم جازان، أطباق شرقية وغربية جنبًا إلى جنب.",
      },
      {
        nameEn: "Turquoise Restaurant",
        nameAr: "مطعم تركواز",
        cuisineEn: "International",
        cuisineAr: "عالمي",
        descriptionEn: "All-day dining at Grand Millennium Jazan, the easy option when the group wants different things.",
        descriptionAr: "مطعم اليوم الكامل في جراند ميلينيوم جازان، الخيار السهل حين يريد كل فرد شيئًا مختلفًا.",
      },
    ],
    stay: [
      {
        nameEn: "Novotel Jazan",
        nameAr: "نوفوتيل جازان",
        descriptionEn: "A well-located mainland base on the Corniche, praised for its dining and easy access.",
        descriptionAr: "قاعدة جيدة الموقع في البر الرئيسي على الكورنيش، تحظى بتقدير لمطاعمها وسهولة الوصول إليها.",
      },
      {
        nameEn: "Farasan Coral Resort",
        nameAr: "منتجع فرسان كورال",
        descriptionEn: "A stay on the islands themselves, for travellers building their days around the marine sanctuary.",
        descriptionAr: "إقامة في الجزر نفسها، للمسافرين الذين يبنون أيامهم حول المحمية البحرية.",
      },
    ],
    extendedStay: [
      {
        nameEn: "Radisson Blu Resort, Jizan",
        nameAr: "منتجع راديسون بلو جازان",
        descriptionEn: "A beachfront resort steps from the Red Sea with an outdoor pool and kids' facilities, close to the Farasan Islands ferry point.",
        descriptionAr: "منتجع على الواجهة البحرية على بعد خطوات من البحر الأحمر، بمسبح خارجي ومرافق للأطفال، وقريب من نقطة العبّارة إلى جزر فرسان.",
        tier: "luxury",
      },
      {
        nameEn: "Grand Millennium Gizan",
        nameAr: "فندق جراند ميلينيوم جازان",
        descriptionEn: "A five-star hotel facing the Red Sea near Jazan University, with indoor and outdoor pools and a health club.",
        descriptionAr: "فندق خمس نجوم يطل على البحر الأحمر قرب جامعة جازان، بمسبحين داخلي وخارجي ونادٍ صحي.",
        tier: "luxury",
      },
      {
        nameEn: "Courtyard by Marriott Jazan",
        nameAr: "كورت يارد ماريوت جازان",
        descriptionEn: "A central hotel connected to Al Rashid Mall, near the Corniche, with an indoor pool and daily breakfast buffet.",
        descriptionAr: "فندق مركزي متصل بمول الراشد وقريب من الكورنيش، بمسبح داخلي وبوفيه إفطار يومي.",
      },
      {
        nameEn: "Al Eairy Furnished Apartments Jizan 1",
        nameAr: "العييري للشقق المفروشة جازان 1",
        descriptionEn: "Budget apartment-style rooms in the Airport District, a short drive from Al Rashid and Al Khayal malls.",
        descriptionAr: "غرف اقتصادية على طراز الشقق في حي المطار، على بعد دقائق من مولي الراشد والخيال.",
        tier: "budget",
      },
    ],
    sampleDay: [
      {
        timeEn: "Morning",
        timeAr: "الصباح",
        placeEn: "Boat to Farasan",
        placeAr: "قارب إلى فرسان",
        descriptionEn: "Cross to the islands while the water is calmest.",
        descriptionAr: "اعبر إلى الجزر بينما المياه في أهدأ حالاتها.",
      },
      {
        timeEn: "Afternoon",
        timeAr: "بعد الظهر",
        placeEn: "Pearl Merchants' Neighbourhood",
        placeAr: "حي تجار اللؤلؤ",
        descriptionEn: "Wander the coral houses left over from the pearling trade.",
        descriptionAr: "تجوّل بين بيوت المرجان المتبقية من زمن تجارة اللؤلؤ.",
      },
      {
        timeEn: "Sunset",
        timeAr: "الغروب",
        placeEn: "Jazan Corniche",
        placeAr: "كورنيش جازان",
        descriptionEn: "Back on the mainland as the sky colours over the water.",
        descriptionAr: "عودة إلى البر الرئيسي بينما تتلون السماء فوق الماء.",
      },
    ],
  },
  "saudi-arabia/al-jouf": {
    storyEn: [
      "Al-Jouf sits at the far north of the Kingdom, closer to Jordan than to Riyadh, a crossroads oasis that ancient trade caravans depended on long before it became one of the world's largest olive-growing regions.",
      "Marid Castle has stood in Dumat Al-Jandal since roughly the first century, one of the oldest fortresses in Saudi Arabia, with a stone stair you can still climb for a view over the old town at golden hour. Nearby, Zabal Castle and the Sisra Well trace Sakaka's own Nabataean roots, and the mysterious standing stones at Rajajil predate all of it.",
      "This is a first look at what a few days in Al-Jouf could feel like. Tell us your dates and who's travelling, and we'll shape the rest around you.",
    ],
    storyAr: [
      "تقع الجوف في أقصى شمال المملكة، أقرب إلى الأردن منها إلى الرياض، واحة ملتقى طرق اعتمدت عليها قوافل التجارة القديمة قبل أن تصبح واحدة من أكبر مناطق زراعة الزيتون في العالم.",
      "لا يزال قصر مارد قائمًا في دومة الجندل منذ نحو القرن الأول الميلادي، أحد أقدم الحصون في السعودية، بسلم حجري لا يزال يمكن تسلقه لرؤية البلدة القديمة عند الغروب. وبالقرب منه، يتتبع قصر زعبل وبئر سيسرا جذور سكاكا النبطية، بينما تسبقهما جميعًا أحجار رجاجيل الغامضة المنتصبة.",
      "هذه لمحة أولى عمّا يمكن أن تشعر به أيام قليلة في الجوف. أخبرنا بتواريخك ومن سيرافقك، وسنشكّل الباقي حولك.",
    ],
    pullQuoteEn: "Marid Castle has been standing since roughly the first century. Most visitors to Saudi Arabia have never heard of it.",
    pullQuoteAr: "لا يزال قصر مارد قائمًا منذ نحو القرن الأول الميلادي. ومع ذلك، لم يسمع به معظم زوار السعودية.",
    weather: {
      bestWindow: {
        labelEn: "Best time to visit",
        labelAr: "أفضل وقت للزيارة",
        monthsEn: "October – March",
        monthsAr: "أكتوبر – مارس",
        tempEn: "18–28°C, mild",
        tempAr: "18–28°م، معتدلة",
        noteEn: "Comfortable for climbing Marid Castle and walking Sakaka's old sites.",
        noteAr: "مناسبة لتسلق قصر مارد والتجول في مواقع سكاكا القديمة.",
      },
      peakHeat: {
        labelEn: "Hot season",
        labelAr: "الموسم الحار",
        monthsEn: "May – September",
        monthsAr: "مايو – سبتمبر",
        tempEn: "Regularly over 40°C",
        tempAr: "غالبًا فوق 40°م",
        noteEn: "Almost all visiting here happens in the cooler months.",
        noteAr: "تتم معظم الزيارات هنا في الأشهر الأكثر برودة.",
      },
      tipEn: "Al-Jouf sees far fewer visitors than Saudi Arabia's better-known destinations, most sites are quiet even in season.",
      tipAr: "تستقبل الجوف زوارًا أقل بكثير من وجهات السعودية الأشهر، ومعظم المواقع هادئة حتى في الموسم.",
    },
    transportation: [
      {
        modeEn: "Al-Jouf International Airport",
        modeAr: "مطار الجوف الدولي",
        descriptionEn: "Located in Sakaka, with domestic flights to Riyadh, Jeddah and other major cities.",
        descriptionAr: "يقع في سكاكا، ويربطها برحلات داخلية بالرياض وجدة ومدن رئيسية أخرى.",
      },
      {
        modeEn: "Road from Riyadh",
        modeAr: "الطريق من الرياض",
        descriptionEn: "A long but well-maintained highway drive of around six hours; most visitors fly in and explore locally by car.",
        descriptionAr: "رحلة طويلة لكن على طريق سريع مصان جيدًا تستغرق نحو ست ساعات؛ ويفضّل معظم الزوار الطيران ثم التنقل محليًا بالسيارة.",
      },
      {
        modeEn: "Rental car",
        modeAr: "استئجار سيارة",
        descriptionEn: "The most practical way to move between Dumat Al-Jandal, Sakaka's castles and the Rajajil columns.",
        descriptionAr: "الطريقة الأنسب للتنقل بين دومة الجندل وقصور سكاكا وأعمدة رجاجيل.",
      },
    ],
    faq: [
      {
        questionEn: "What is Al-Jouf famous for?",
        questionAr: "بم تشتهر الجوف؟",
        answerEn: "Ancient sites including Marid Castle and the Rajajil standing stones, plus being one of the world's largest olive-growing regions.",
        answerAr: "بمواقعها الأثرية القديمة مثل قصر مارد وأحجار رجاجيل المنتصبة، إضافة إلى كونها إحدى أكبر مناطق زراعة الزيتون في العالم.",
      },
      {
        questionEn: "What's the best time of year to visit Al-Jouf?",
        questionAr: "ما أفضل وقت لزيارة الجوف؟",
        answerEn: "October through March, when temperatures are mild enough for climbing Marid Castle and walking the old sites.",
        answerAr: "من أكتوبر إلى مارس، حين تكون درجات الحرارة معتدلة بما يكفي لتسلق قصر مارد والتجول في المواقع القديمة.",
      },
      {
        questionEn: "How many days should I spend in Al-Jouf?",
        questionAr: "كم يومًا يجب أن أقضي في الجوف؟",
        answerEn: "Two days covers Sakaka's castles, Dumat Al-Jandal and the Rajajil columns comfortably.",
        answerAr: "يومان يكفيان لتغطية قصور سكاكا ودومة الجندل وأعمدة رجاجيل بشكل مريح.",
      },
      {
        questionEn: "What are the best things to do in Al-Jouf?",
        questionAr: "ما أفضل الأنشطة في الجوف؟",
        answerEn: "Climbing the stone stair at Marid Castle, exploring the old town of Dumat Al-Jandal, and seeing the prehistoric Rajajil columns.",
        answerAr: "تسلق السلم الحجري في قصر مارد، واستكشاف بلدة دومة الجندل القديمة، ومشاهدة أعمدة رجاجيل من عصور ما قبل التاريخ.",
      },
      {
        questionEn: "Is Al-Jouf safe for tourists?",
        questionAr: "هل الجوف آمنة للسياح؟",
        answerEn: "Yes, Al-Jouf is very safe, and its low visitor numbers make the historic sites feel especially peaceful.",
        answerAr: "نعم، الجوف آمنة جدًا، وقلة عدد زوارها تمنح المواقع التاريخية طابعًا هادئًا بشكل خاص.",
      },
      {
        questionEn: "What should I wear in Al-Jouf?",
        questionAr: "ماذا يجب أن أرتدي في الجوف؟",
        answerEn: "Modest, comfortable clothing, and layers in winter since the north of the Kingdom gets noticeably cooler than the coast.",
        answerAr: "ملابس محتشمة ومريحة، وطبقات في الشتاء لأن شمال المملكة يصبح أبرد بوضوح من الساحل.",
      },
      {
        questionEn: "Do I need a visa to visit Al-Jouf?",
        questionAr: "هل أحتاج تأشيرة لزيارة الجوف؟",
        answerEn: "Many nationalities can apply for a Saudi tourist eVisa online before travelling. We can help confirm what applies to you as part of planning your trip.",
        answerAr: "يمكن لكثير من الجنسيات التقدم للحصول على التأشيرة السياحية الإلكترونية السعودية عبر الإنترنت قبل السفر. يمكننا مساعدتك في تأكيد ما ينطبق عليك ضمن التخطيط لرحلتك.",
      },
      {
        questionEn: "Is Al-Jouf good for families?",
        questionAr: "هل الجوف مناسبة للعائلات؟",
        answerEn: "Yes, the castles and Dumat Al-Jandal's lake, with sailing and jet skiing, both work well for children.",
        answerAr: "نعم، تناسب القصور وبحيرة دومة الجندل بأنشطة الإبحار والدراجات المائية الأطفال جيدًا.",
      },
      {
        questionEn: "What's Al-Jouf known for beyond its castles?",
        questionAr: "بم تشتهر الجوف إلى جانب قصورها؟",
        answerEn: "Its olive harvest, among the largest in the world, celebrated each year with a dedicated festival.",
        answerAr: "بحصاد الزيتون فيها، من بين الأكبر في العالم، ويُحتفى به كل عام بمهرجان مخصص له.",
      },
    ],
    travelTips: [
      { en: "Climb Marid Castle's stone stair early morning or late afternoon for the best light and cooler temperatures.", ar: "تسلّق سلم قصر مارد الحجري في الصباح الباكر أو بعد الظهر لأفضل إضاءة ودرجات حرارة أبرد." },
      { en: "Al-Jouf gets noticeably cold in winter nights, pack warm layers if visiting December through February.", ar: "تصبح ليالي الجوف باردة بوضوح في الشتاء، فاصطحب طبقات دافئة إن كانت زيارتك بين ديسمبر وفبراير." },
      { en: "Sites here see far fewer crowds than Riyadh or AlUla, an advantage for unhurried visits.", ar: "تستقبل المواقع هنا زوارًا أقل بكثير من الرياض أو العلا، وهي ميزة للزيارات غير المتعجلة." },
      { en: "The weekend in Saudi Arabia is Friday–Saturday, plan opening hours accordingly.", ar: "عطلة نهاية الأسبوع في السعودية هي الجمعة والسبت، فخطط لمواعيد العمل تبعًا لذلك." },
      { en: "Alcohol isn't sold or served anywhere in the Kingdom.", ar: "لا يُباع الكحول ولا يُقدَّم في أي مكان بالمملكة." },
      { en: "If visiting during olive harvest season, local markets sell fresh-pressed oil worth bringing home.", ar: "إن كانت زيارتك خلال موسم حصاد الزيتون، تبيع الأسواق المحلية زيتًا طازج العصر يستحق اقتناءه." },
    ],
    attractions: [
      {
        nameEn: "Marid Castle",
        nameAr: "قصر مارد",
        categoryEn: "Heritage",
        categoryAr: "تراث",
        descriptionEn: "One of the oldest fortresses in Saudi Arabia, dating to roughly the first century, with a climbable stone stair over Dumat Al-Jandal.",
        descriptionAr: "أحد أقدم الحصون في السعودية، يعود إلى نحو القرن الأول الميلادي، بسلم حجري يمكن تسلقه فوق دومة الجندل.",
      },
      {
        nameEn: "Dumat Al-Jandal",
        nameAr: "دومة الجندل",
        categoryEn: "Heritage",
        categoryAr: "تراث",
        descriptionEn: "An old town of antiquities including the Mosque of Omar, plus a lake for sailing and jet skiing.",
        descriptionAr: "بلدة قديمة تضم آثارًا من بينها مسجد عمر، إضافة إلى بحيرة للإبحار والدراجات المائية.",
      },
      {
        nameEn: "Zabal Castle & Sisra Well",
        nameAr: "قصر زعبل وبئر سيسرا",
        categoryEn: "Heritage",
        categoryAr: "تراث",
        descriptionEn: "A hilltop fortress with Nabataean-era foundations, beside a rock-cut well of the same age.",
        descriptionAr: "حصن فوق تلة بأسس من الحقبة النبطية، إلى جانب بئر منحوتة في الصخر من العصر نفسه.",
      },
      {
        nameEn: "Rajajil Columns",
        nameAr: "أعمدة رجاجيل",
        categoryEn: "Ancient",
        categoryAr: "أثري",
        descriptionEn: "Standing stone columns from prehistory, among the oldest man-made structures in the Arabian Peninsula.",
        descriptionAr: "أعمدة حجرية منتصبة من عصور ما قبل التاريخ، من بين أقدم المنشآت البشرية في الجزيرة العربية.",
      },
    ],
    dining: [
      {
        nameEn: "Al Jouf Heritage Restaurant",
        nameAr: "مطعم تراث الجوف",
        cuisineEn: "Saudi traditional",
        cuisineAr: "شعبي سعودي",
        descriptionEn: "Local Al-Jouf cooking, rice dishes done the Saudi way, with room set aside for larger family groups.",
        descriptionAr: "أكلات الجوف الشعبية وأطباق الأرز على الطريقة السعودية، مع أماكن مخصصة للعائلات الكبيرة.",
      },
    ],
    stay: [
      {
        nameEn: "Olive Land Hotel",
        nameAr: "فندق أوليف لاند",
        descriptionEn: "A comfortable base named for the region's other claim to fame, its olive harvest.",
        descriptionAr: "قاعدة إقامة مريحة سُميت تيمنًا بشهرة المنطقة الأخرى، حصاد الزيتون.",
      },
      {
        nameEn: "Raoum Inn Sakaka",
        nameAr: "نزل رعوم سكاكا",
        descriptionEn: "A practical, well-reviewed stay in Sakaka, close to the old sites.",
        descriptionAr: "إقامة عملية وذات تقييمات جيدة في سكاكا، قريبة من المواقع القديمة.",
      },
    ],
    extendedStay: [
      {
        nameEn: "Ewaa Express Hotel - Al Jouf",
        nameAr: "فندق إيواء إكسبرس الجوف",
        descriptionEn: "A straightforward budget stay on Fahd Street in Sakaka, about eight minutes from Zabal Castle, with a gym and free parking.",
        descriptionAr: "إقامة اقتصادية عملية في شارع فهد بسكاكا، على بعد نحو ثماني دقائق من قصر زعبل، مع صالة رياضية وموقف سيارات مجاني.",
        tier: "budget",
      },
      {
        nameEn: "Le Park Concord - Sakaka",
        nameAr: "لو بارك كونكورد سكاكا",
        descriptionEn: "Marketed as Sakaka's upscale option, a short drive from Zabal Castle with 52 rooms and a hot tub, though guest reviews on amenities are mixed, worth checking recent feedback before booking.",
        descriptionAr: "يُسوَّق كخيار سكاكا الأرقى، على بعد دقائق من قصر زعبل، ويضم 52 غرفة وجاكوزي، إلا أن تقييمات النزلاء حول مستوى الخدمات متفاوتة، ويُفضل الاطلاع على أحدث المراجعات قبل الحجز.",
      },
    ],
    sampleDay: [
      {
        timeEn: "Morning",
        timeAr: "الصباح",
        placeEn: "Marid Castle",
        placeAr: "قصر مارد",
        descriptionEn: "Climb the stone stair before the day warms up.",
        descriptionAr: "تسلّق السلم الحجري قبل أن يدفأ النهار.",
      },
      {
        timeEn: "Afternoon",
        timeAr: "بعد الظهر",
        placeEn: "Dumat Al-Jandal",
        placeAr: "دومة الجندل",
        descriptionEn: "The Mosque of Omar and a walk along the lake.",
        descriptionAr: "مسجد عمر ونزهة على ضفاف البحيرة.",
      },
      {
        timeEn: "Sunset",
        timeAr: "الغروب",
        placeEn: "Zabal Castle",
        placeAr: "قصر زعبل",
        descriptionEn: "A hilltop view over Sakaka as the light turns gold.",
        descriptionAr: "إطلالة من فوق التلة على سكاكا بينما يتحول الضوء إلى الذهبي.",
      },
    ],
  },
  "saudi-arabia/dammam": {
    storyEn: [
      "Dammam and Al Khobar grew rich on oil, and it shows in a way that's more interesting than it sounds: Saudi Aramco used part of that wealth to build Ithra, one of the Gulf's most ambitious cultural centres, drawing over a million visitors in its first few years alone.",
      "The rest of the Eastern Province rhythm is easier-going. Corniches run along both cities for evening walks, Half Moon Bay offers a quieter stretch of coast, and the King Fahd Causeway carries you to Bahrain in under half an hour if you want to make it a two-country trip.",
      "This is a first look at what a few days in Dammam and Al Khobar could feel like. Tell us your dates and who's travelling, and we'll shape the rest around you.",
    ],
    storyAr: [
      "نمت الدمام والخبر بثراء النفط، ويظهر ذلك بطريقة أكثر إثارة للاهتمام مما يبدو: استخدمت أرامكو السعودية جزءًا من تلك الثروة لبناء إثراء، أحد أكثر المراكز الثقافية طموحًا في الخليج، الذي استقطب أكثر من مليون زائر في سنواته الأولى وحدها.",
      "أما بقية إيقاع المنطقة الشرقية فأكثر هدوءًا. تمتد الكورنيشات على طول المدينتين لنزهات المساء، ويقدم خليج نصف القمر امتدادًا ساحليًا أكثر هدوءًا، ويحملك جسر الملك فهد إلى البحرين في أقل من نصف ساعة إن أردت جعلها رحلة إلى بلدين.",
      "هذه لمحة أولى عمّا يمكن أن تشعر به أيام قليلة في الدمام والخبر. أخبرنا بتواريخك ومن سيرافقك، وسنشكّل الباقي حولك.",
    ],
    pullQuoteEn: "Aramco built the region's oil wealth here, then used part of it to build one of the Gulf's most ambitious cultural centres.",
    pullQuoteAr: "بنت أرامكو ثروة النفط في هذه المنطقة، ثم استخدمت جزءًا منها لبناء أحد أكثر المراكز الثقافية طموحًا في الخليج.",
    weather: {
      bestWindow: {
        labelEn: "Best time to visit",
        labelAr: "أفضل وقت للزيارة",
        monthsEn: "November – March",
        monthsAr: "نوفمبر – مارس",
        tempEn: "18–27°C, comfortable",
        tempAr: "18–27°م، معتدلة",
        noteEn: "Ideal for the Corniches, Half Moon Bay and walking between Ithra's galleries.",
        noteAr: "مثالية للكورنيشات وخليج نصف القمر والتجول بين معارض إثراء.",
      },
      peakHeat: {
        labelEn: "Peak summer heat",
        labelAr: "ذروة الحر الصيفي",
        monthsEn: "June – September",
        monthsAr: "يونيو – سبتمبر",
        tempEn: "Over 45°C with high humidity",
        tempAr: "أكثر من 45°م برطوبة عالية",
        noteEn: "Gulf humidity makes outdoor time genuinely uncomfortable; lean on indoor attractions.",
        noteAr: "رطوبة الخليج تجعل الوقت في الخارج غير مريح فعليًا، فاعتمد على الأماكن المغلقة.",
      },
      tipEn: "Ithra's galleries are fully air-conditioned, a good anchor for a visit at any time of year.",
      tipAr: "معارض إثراء مكيفة بالكامل، وهي محطة جيدة للزيارة في أي وقت من السنة.",
    },
    transportation: [
      {
        modeEn: "King Fahd International Airport",
        modeAr: "مطار الملك فهد الدولي",
        descriptionEn: "One of the largest airports in the world by land area, with frequent domestic and international connections.",
        descriptionAr: "أحد أكبر المطارات في العالم من حيث المساحة، ويضم رحلات داخلية ودولية متكررة.",
      },
      {
        modeEn: "King Fahd Causeway",
        modeAr: "جسر الملك فهد",
        descriptionEn: "A 25-kilometre bridge connecting Dammam and Al Khobar directly to Bahrain, an easy add-on for a two-country trip.",
        descriptionAr: "جسر يمتد 25 كيلومترًا يربط الدمام والخبر مباشرة بالبحرين، إضافة سهلة لرحلة إلى بلدين.",
      },
      {
        modeEn: "Taxis and ride-hailing",
        modeAr: "سيارات الأجرة وتطبيقات النقل",
        descriptionEn: "Uber and Careem cover Dammam and Al Khobar well, an easy way to move between Ithra, the Corniches and Half Moon Bay.",
        descriptionAr: "تغطي تطبيقات أوبر وكريم الدمام والخبر جيدًا، وسيلة سهلة للتنقل بين إثراء والكورنيشات وخليج نصف القمر.",
      },
    ],
    faq: [
      {
        questionEn: "What is Dammam famous for?",
        questionAr: "بم تشتهر الدمام؟",
        answerEn: "Ithra, the Aramco-funded cultural centre that draws over a million visitors a year, plus its Corniches and the King Fahd Causeway to Bahrain.",
        answerAr: "بإثراء، المركز الثقافي الذي تموله أرامكو ويستقطب أكثر من مليون زائر سنويًا، إضافة إلى كورنيشاتها وجسر الملك فهد إلى البحرين.",
      },
      {
        questionEn: "What's the best time of year to visit Dammam?",
        questionAr: "ما أفضل وقت لزيارة الدمام؟",
        answerEn: "November through March, when the Gulf humidity eases and the Corniches and Half Moon Bay are most enjoyable.",
        answerAr: "من نوفمبر إلى مارس، حين تخف رطوبة الخليج وتصبح الكورنيشات وخليج نصف القمر في أفضل حالاتها.",
      },
      {
        questionEn: "How many days should I spend in Dammam?",
        questionAr: "كم يومًا يجب أن أقضي في الدمام؟",
        answerEn: "Two to three days covers Ithra, the coastline and a possible Bahrain day trip comfortably.",
        answerAr: "يومان إلى ثلاثة أيام تكفي لتغطية إثراء والساحل ورحلة يومية محتملة إلى البحرين بشكل مريح.",
      },
      {
        questionEn: "What are the best things to do in Dammam?",
        questionAr: "ما أفضل الأنشطة في الدمام؟",
        answerEn: "Spending a morning in Ithra's galleries, walking the Corniche at sunset, relaxing at Half Moon Bay, and crossing the causeway to Bahrain.",
        answerAr: "قضاء صباح بين معارض إثراء، والمشي على الكورنيش عند الغروب، والاسترخاء في خليج نصف القمر، وعبور الجسر إلى البحرين.",
      },
      {
        questionEn: "Is Dammam safe for tourists?",
        questionAr: "هل الدمام آمنة للسياح؟",
        answerEn: "Yes, Dammam and Al Khobar are modern, safe cities well used to business and leisure visitors.",
        answerAr: "نعم، الدمام والخبر مدينتان حديثتان وآمنتان ومعتادتان على زوار العمل والترفيه.",
      },
      {
        questionEn: "What should I wear in Dammam?",
        questionAr: "ماذا يجب أن أرتدي في الدمام؟",
        answerEn: "Modest, breathable clothing; summer humidity is high, so lightweight fabrics help.",
        answerAr: "ملابس محتشمة وخفيفة؛ فرطوبة الصيف مرتفعة، وتساعد الأقمشة الخفيفة على الراحة.",
      },
      {
        questionEn: "Do I need a visa to visit Dammam?",
        questionAr: "هل أحتاج تأشيرة لزيارة الدمام؟",
        answerEn: "Many nationalities can apply for a Saudi tourist eVisa online before travelling. We can help confirm what applies to you as part of planning your trip.",
        answerAr: "يمكن لكثير من الجنسيات التقدم للحصول على التأشيرة السياحية الإلكترونية السعودية عبر الإنترنت قبل السفر. يمكننا مساعدتك في تأكيد ما ينطبق عليك ضمن التخطيط لرحلتك.",
      },
      {
        questionEn: "Is Dammam good for families?",
        questionAr: "هل الدمام مناسبة للعائلات؟",
        answerEn: "Yes, Ithra's children's museum and the beaches at Half Moon Bay both work well for family trips.",
        answerAr: "نعم، يناسب متحف الأطفال في إثراء وشواطئ خليج نصف القمر رحلات العائلات جيدًا.",
      },
      {
        questionEn: "What's the food scene like in Dammam?",
        questionAr: "كيف هو المشهد الغذائي في الدمام؟",
        answerEn: "Strong and varied, from Michelin-starred Indian cooking to award-winning Japanese dining and reliable Italian and steakhouse options in Al Khobar.",
        answerAr: "قوي ومتنوع، من مطبخ هندي حائز على نجمة ميشلان إلى مطعم ياباني حائز على جوائز، إضافة إلى خيارات إيطالية وستيك هاوس موثوقة في الخبر.",
      },
    ],
    travelTips: [
      { en: "Bring your passport if crossing the King Fahd Causeway to Bahrain, even for a day trip.", ar: "احمل جواز سفرك إن كنت ستعبر جسر الملك فهد إلى البحرين، حتى لرحلة يوم واحد." },
      { en: "Ithra is fully air-conditioned, a good midday escape from summer humidity.", ar: "إثراء مكيف بالكامل، ملاذ جيد من رطوبة الصيف في الظهيرة." },
      { en: "The Corniches are busiest and most atmospheric in the early evening.", ar: "تكون الكورنيشات في أوج ازدحامها وأجوائها في المساء الباكر." },
      { en: "The weekend in Saudi Arabia is Friday–Saturday, plan opening hours accordingly.", ar: "عطلة نهاية الأسبوع في السعودية هي الجمعة والسبت، فخطط لمواعيد العمل تبعًا لذلك." },
      { en: "Alcohol isn't sold or served anywhere in the Kingdom.", ar: "لا يُباع الكحول ولا يُقدَّم في أي مكان بالمملكة." },
      { en: "Book well-regarded restaurants like Maharaja by Vineet ahead on weekends.", ar: "احجز في المطاعم المرموقة مثل مهراجا باي فينيت مسبقًا في عطلة نهاية الأسبوع." },
    ],
    attractions: [
      {
        nameEn: "Ithra",
        nameAr: "إثراء",
        categoryEn: "Culture",
        categoryAr: "ثقافة",
        descriptionEn: "The King Abdulaziz Center for World Culture in Dhahran, museum galleries, a children's museum and an energy exhibition under one roof.",
        descriptionAr: "مركز الملك عبدالعزيز الثقافي العالمي في الظهران، يضم معارض متحفية ومتحفًا للأطفال ومعرضًا للطاقة تحت سقف واحد.",
      },
      {
        nameEn: "Half Moon Bay",
        nameAr: "خليج نصف القمر",
        categoryEn: "Waterfront",
        categoryAr: "واجهة بحرية",
        descriptionEn: "A quieter stretch of Gulf coastline for a relaxed beach afternoon.",
        descriptionAr: "امتداد ساحلي أكثر هدوءًا على الخليج لظهيرة شاطئية مريحة.",
      },
      {
        nameEn: "Dammam & Khobar Corniches",
        nameAr: "كورنيش الدمام والخبر",
        categoryEn: "Waterfront",
        categoryAr: "واجهة بحرية",
        descriptionEn: "Waterfront promenades through both cities, popular for evening walks.",
        descriptionAr: "ممشيات بحرية عبر المدينتين، مفضلة لنزهات المساء.",
      },
      {
        nameEn: "King Fahd Causeway",
        nameAr: "جسر الملك فهد",
        categoryEn: "Landmark",
        categoryAr: "معلم",
        descriptionEn: "A 25-kilometre bridge to Bahrain, easy to combine with a Dammam trip.",
        descriptionAr: "جسر يمتد 25 كيلومترًا إلى البحرين، يسهل الجمع بينه وبين رحلة إلى الدمام.",
      },
    ],
    dining: [
      {
        nameEn: "Nozomi Khobar",
        nameAr: "نوزومي الخبر",
        cuisineEn: "Japanese",
        cuisineAr: "ياباني",
        descriptionEn: "Award-winning Japanese dining on the Corniche, with sea views to match.",
        descriptionAr: "مطبخ ياباني حائز على جوائز على الكورنيش، بإطلالات بحرية تليق به.",
      },
      {
        nameEn: "Maharaja by Vineet",
        nameAr: "مهراجا باي فينيت",
        cuisineEn: "Indian",
        cuisineAr: "هندي",
        descriptionEn: "Michelin-starred chef Vineet Bhatia's Indian restaurant inside the Mövenpick Hotel.",
        descriptionAr: "مطعم هندي للشيف الحائز على نجمة ميشلان فينيت بهاتيا، داخل فندق موفنبيك.",
      },
      {
        nameEn: "The Butcher Shop & Grill",
        nameAr: "ذا بوتشر شوب آند غريل",
        cuisineEn: "Steakhouse",
        cuisineAr: "ستيك هاوس",
        descriptionEn: "A South African steakhouse chain known for premium cuts and ribs.",
        descriptionAr: "سلسلة مطاعم ستيك هاوس جنوب أفريقية معروفة بقطعها الفاخرة وأضلاعها.",
      },
      {
        nameEn: "Stefano's Italian Kitchen",
        nameAr: "ستيفانو إيطاليان كيتشن",
        cuisineEn: "Italian",
        cuisineAr: "إيطالي",
        descriptionEn: "A reliable, well-regarded address for Italian cooking in Al Khobar.",
        descriptionAr: "عنوان موثوق ومحبوب للمطبخ الإيطالي في الخبر.",
      },
    ],
    stay: [
      {
        nameEn: "Kempinski Al Othman Hotel Al Khobar",
        nameAr: "فندق كمبينسكي العثمان الخبر",
        descriptionEn: "The region's premium address, tailored for a polished business or leisure stay.",
        descriptionAr: "العنوان الفاخر في المنطقة، مصمم لإقامة أنيقة سواء للعمل أو الترفيه.",
      },
      {
        nameEn: "Le Méridien Al Khobar",
        nameAr: "لو ميريديان الخبر",
        descriptionEn: "Gulf views from the waterfront, with an outdoor pool, tennis courts and a full spa.",
        descriptionAr: "إطلالات على الخليج من الواجهة البحرية، مع مسبح خارجي وملاعب تنس وسبا متكامل.",
      },
    ],
    extendedStay: [
      {
        nameEn: "Dana Rayhaan by Rotana",
        nameAr: "دانا ريحان من روتانا",
        descriptionEn: "A 5-star address right on the Dammam Corniche, opened in 2023, with 285 rooms and four dining venues overlooking the Arabian Gulf.",
        descriptionAr: "عنوان فاخر من فئة الخمس نجوم على كورنيش الدمام مباشرة، افتُتح عام 2023، ويضم 285 غرفة وجناحًا وأربعة مطاعم تطل على الخليج العربي.",
        tier: "luxury",
      },
      {
        nameEn: "Braira Dammam Hotel",
        nameAr: "فندق بريرا الدمام",
        descriptionEn: "A well-regarded Saudi hospitality brand on Prince Mohammed Bin Fahd Road, with two pools, a spa and gym, about ten minutes from the seafront.",
        descriptionAr: "علامة ضيافة سعودية محبوبة في طريق الأمير محمد بن فهد، بمسبحين وسبا وصالة رياضية، وتبعد نحو عشر دقائق عن الواجهة البحرية.",
      },
      {
        nameEn: "Novotel Dammam Business Park",
        nameAr: "نوفوتيل الدمام بيزنس بارك",
        descriptionEn: "A dependable 4-star option on the Al Khobar-Dammam highway, geared toward business travellers but comfortable for leisure stays too.",
        descriptionAr: "خيار موثوق من فئة الأربع نجوم على طريق الخبر - الدمام، موجه لرجال الأعمال لكنه مريح أيضًا للإقامات الترفيهية.",
      },
      {
        nameEn: "Radisson Hotel & Apartments Dammam Industrial City",
        nameAr: "فندق وشقق راديسون الدمام الصناعية",
        descriptionEn: "The only international 4-star hotel in Dammam's Second Industrial City, recently refurbished, with rooms and apartments near Half Moon Bay.",
        descriptionAr: "الفندق الدولي الوحيد من فئة الأربع نجوم في مدينة الدمام الصناعية الثانية، جُدد مؤخرًا، ويضم غرفًا وشققًا قريبة من خليج نصف القمر.",
        tier: "budget",
      },
    ],
    extendedProviders: [
      {
        nameEn: "Blacklane",
        nameAr: "بلاكلين",
        typeEn: "International chauffeur service",
        typeAr: "خدمة سائق خاص عالمية",
        noteEn: "The same global chauffeur platform used in Riyadh, with a dedicated Dammam booking page for airport transfers and hourly hire, book directly and confirm current rates.",
        noteAr: "المنصة العالمية نفسها لحجز السائقين الخاصين المستخدمة في الرياض، ولديها صفحة حجز مخصصة للدمام لتوصيل المطار والحجز بالساعة، يُفضل الحجز مباشرة والتأكد من الأسعار الحالية.",
      },
      {
        nameEn: "NAYLAM",
        nameAr: "نيلم",
        typeEn: "Saudi private chauffeur app",
        typeAr: "تطبيق سائق خاص سعودي",
        noteEn: "A Saudi-built luxury chauffeur app naming Dammam among its three core coverage cities alongside Riyadh and Jeddah, book through the app and confirm current availability.",
        noteAr: "تطبيق سعودي لحجز سائق خاص فاخر يذكر الدمام من بين مدنه الثلاث الأساسية إلى جانب الرياض وجدة، يُحجز عبر التطبيق مع التأكد من التوفر الحالي.",
      },
    ],
    sampleDay: [
      {
        timeEn: "Morning",
        timeAr: "الصباح",
        placeEn: "Ithra",
        placeAr: "إثراء",
        descriptionEn: "A slow morning through the galleries in Dhahran.",
        descriptionAr: "صباح هادئ بين المعارض في الظهران.",
      },
      {
        timeEn: "Afternoon",
        timeAr: "بعد الظهر",
        placeEn: "Half Moon Bay",
        placeAr: "خليج نصف القمر",
        descriptionEn: "A quieter stretch of coast for the warmest hours.",
        descriptionAr: "امتداد ساحلي أكثر هدوءًا لساعات الحر الشديد.",
      },
      {
        timeEn: "Evening",
        timeAr: "المساء",
        placeEn: "Dinner at Nozomi Khobar",
        placeAr: "عشاء في نوزومي الخبر",
        descriptionEn: "Japanese cooking and sea views to close the day on the Corniche.",
        descriptionAr: "مطبخ ياباني وإطلالات بحرية تختم اليوم على الكورنيش.",
      },
    ],
  },
  "saudi-arabia/tabuk": {
    storyEn: [
      "Tabuk has always been a frontier. Nabataean traders carved tombs and inscriptions into the cliffs at Magna two thousand years ago, and the Ottomans built a fortress in the city centre tied to the Prophet Muhammad's own expedition here in 630 CE.",
      "Now it's a frontier again. NEOM is rising along the coast an hour or so away, while inland, Wadi Al Disah, often called Saudi Arabia's Grand Canyon, cuts fifteen kilometres through red cliffs that rise 500 metres above spring-fed palm groves. Old and new sit closer together here than almost anywhere else in the Kingdom.",
      "This is a first look at what a few days in Tabuk could feel like. Tell us your dates and who's travelling, and we'll shape the rest around you.",
    ],
    storyAr: [
      "كانت تبوك دائمًا منطقة حدودية. نحت التجار الأنباط مقابر ونقوشًا في منحدرات مقنا قبل ألفي عام، وبنى العثمانيون حصنًا في وسط المدينة مرتبطًا بغزوة النبي محمد صلى الله عليه وسلم عام 630 ميلادي.",
      "واليوم أصبحت منطقة حدودية من جديد. ترتفع نيوم على الساحل على بعد نحو ساعة من هنا، بينما يشق وادي الديسة في الداخل، الذي يُلقب غالبًا بجراند كانيون السعودية، مسافة خمسة عشر كيلومترًا عبر منحدرات حمراء ترتفع 500 متر فوق واحات نخيل تغذيها الينابيع. يلتقي القديم بالجديد هنا بقرب لا تجده في أي مكان آخر في المملكة تقريبًا.",
      "هذه لمحة أولى عمّا يمكن أن تشعر به أيام قليلة في تبوك. أخبرنا بتواريخك ومن سيرافقك، وسنشكّل الباقي حولك.",
    ],
    pullQuoteEn: "The carvings at Magna are two thousand years old. NEOM, an hour up the coast, is being built from scratch this decade.",
    pullQuoteAr: "نقوش مقنا عمرها ألفا عام. وعلى بعد ساعة على الساحل، تُبنى نيوم من الصفر في هذا العقد.",
    weather: {
      bestWindow: {
        labelEn: "Best time to visit",
        labelAr: "أفضل وقت للزيارة",
        monthsEn: "October – April",
        monthsAr: "أكتوبر – أبريل",
        tempEn: "10–25°C, cool and pleasant",
        tempAr: "10–25°م، باردة ولطيفة",
        noteEn: "Among the coolest of Saudi Arabia's desert regions, ideal for Wadi Al Disah and Tabuk Castle.",
        noteAr: "من أبرد المناطق الصحراوية في السعودية، مثالية لوادي الديسة وقلعة تبوك.",
      },
      peakHeat: {
        labelEn: "Hot season",
        labelAr: "الموسم الحار",
        monthsEn: "June – August",
        monthsAr: "يونيو – أغسطس",
        tempEn: "Up to 40°C",
        tempAr: "حتى 40°م",
        noteEn: "Still more manageable than much of the Kingdom, but outdoor sites are best kept to morning hours.",
        noteAr: "لا تزال أكثر احتمالًا من معظم أنحاء المملكة، لكن يُفضَّل زيارة المواقع الخارجية صباحًا.",
      },
      tipEn: "Tabuk's northern latitude and elevation make it noticeably cooler than the rest of Saudi Arabia year-round.",
      tipAr: "يجعل موقع تبوك الشمالي وارتفاعها طقسها أبرد بوضوح من بقية السعودية طوال العام.",
    },
    transportation: [
      {
        modeEn: "Prince Sultan Bin Abdulaziz Airport",
        modeAr: "مطار الأمير سلطان بن عبدالعزيز",
        descriptionEn: "Tabuk's airport connects to Riyadh, Jeddah and other major cities with regular domestic flights.",
        descriptionAr: "يربط مطار تبوك بالرياض وجدة ومدن رئيسية أخرى برحلات داخلية منتظمة.",
      },
      {
        modeEn: "Rental car",
        modeAr: "استئجار سيارة",
        descriptionEn: "Essential for reaching Wadi Al Disah, Magna and the coast, all well outside the city centre.",
        descriptionAr: "ضرورية للوصول إلى وادي الديسة ومقنا والساحل، وجميعها خارج وسط المدينة.",
      },
      {
        modeEn: "Road toward NEOM and the coast",
        modeAr: "الطريق نحو نيوم والساحل",
        descriptionEn: "Tabuk's Red Sea coast and the NEOM development are roughly an hour's drive from the city.",
        descriptionAr: "يبعد ساحل تبوك على البحر الأحمر ومشروع نيوم نحو ساعة بالسيارة عن المدينة.",
      },
    ],
    faq: [
      {
        questionEn: "What is Tabuk famous for?",
        questionAr: "بم تشتهر تبوك؟",
        answerEn: "Ancient Nabataean carvings at Magna, the Ottoman-era Tabuk Castle, and Wadi Al Disah, often called Saudi Arabia's Grand Canyon.",
        answerAr: "بنقوش مقنا النبطية القديمة، وقلعة تبوك من الحقبة العثمانية، ووادي الديسة الذي يُلقب غالبًا بجراند كانيون السعودية.",
      },
      {
        questionEn: "What's the best time of year to visit Tabuk?",
        questionAr: "ما أفضل وقت لزيارة تبوك؟",
        answerEn: "October through April, among the coolest windows anywhere in Saudi Arabia's desert regions.",
        answerAr: "من أكتوبر إلى أبريل، من أبرد الفترات في أي من مناطق السعودية الصحراوية.",
      },
      {
        questionEn: "How many days should I spend in Tabuk?",
        questionAr: "كم يومًا يجب أن أقضي في تبوك؟",
        answerEn: "Two to three days covers Wadi Al Disah, Tabuk Castle and a stretch of the coast comfortably.",
        answerAr: "يومان إلى ثلاثة أيام تكفي لتغطية وادي الديسة وقلعة تبوك وجزء من الساحل بشكل مريح.",
      },
      {
        questionEn: "What are the best things to do in Tabuk?",
        questionAr: "ما أفضل الأنشطة في تبوك؟",
        answerEn: "Walking the canyon floor at Wadi Al Disah, touring the restored Tabuk Castle, and seeing the Nabataean inscriptions at Magna.",
        answerAr: "المشي في قاع وادي الديسة، وزيارة قلعة تبوك المرممة، ومشاهدة النقوش النبطية في مقنا.",
      },
      {
        questionEn: "Is Tabuk safe for tourists?",
        questionAr: "هل تبوك آمنة للسياح؟",
        answerEn: "Yes, Tabuk is very safe, and its position as a growing frontier region has brought steadily better infrastructure for visitors.",
        answerAr: "نعم، تبوك آمنة جدًا، وموقعها كمنطقة حدودية متنامية جلب تحسنًا مطردًا في البنية التحتية للزوار.",
      },
      {
        questionEn: "What should I wear in Tabuk?",
        questionAr: "ماذا يجب أن أرتدي في تبوك؟",
        answerEn: "Modest clothing with warm layers, Tabuk's elevation and northern latitude make it cooler than most of the Kingdom, especially at night.",
        answerAr: "ملابس محتشمة مع طبقات دافئة، فارتفاع تبوك وموقعها الشمالي يجعلانها أبرد من معظم المملكة، خاصة ليلًا.",
      },
      {
        questionEn: "Do I need a visa to visit Tabuk?",
        questionAr: "هل أحتاج تأشيرة لزيارة تبوك؟",
        answerEn: "Many nationalities can apply for a Saudi tourist eVisa online before travelling. We can help confirm what applies to you as part of planning your trip.",
        answerAr: "يمكن لكثير من الجنسيات التقدم للحصول على التأشيرة السياحية الإلكترونية السعودية عبر الإنترنت قبل السفر. يمكننا مساعدتك في تأكيد ما ينطبق عليك ضمن التخطيط لرحلتك.",
      },
      {
        questionEn: "Is Tabuk good for families?",
        questionAr: "هل تبوك مناسبة للعائلات؟",
        answerEn: "Yes, Wadi Al Disah's gentle canyon floor and Tabuk Castle both make for easy, walkable family outings.",
        answerAr: "نعم، يجعل قاع وادي الديسة السهل وقلعة تبوك كليهما نزهة عائلية سهلة يمكن السير فيها.",
      },
      {
        questionEn: "What's Tabuk known for beyond its history?",
        questionAr: "بم تشتهر تبوك إلى جانب تاريخها؟",
        answerEn: "Being the gateway to NEOM, the futuristic development rising along the coast an hour from the city.",
        answerAr: "بكونها بوابة نيوم، المشروع المستقبلي الذي يرتفع على الساحل على بعد ساعة من المدينة.",
      },
    ],
    travelTips: [
      { en: "Wadi Al Disah's canyon floor is best walked in the cool early morning hours.", ar: "يُفضَّل المشي في قاع وادي الديسة في ساعات الصباح الباكر الباردة." },
      { en: "Pack warm layers for evenings, even in the milder months, given Tabuk's elevation.", ar: "اصطحب طبقات دافئة للأمسيات، حتى في الأشهر الأكثر اعتدالًا، نظرًا لارتفاع تبوك." },
      { en: "A rental car is essential, most of Tabuk's best sites sit well outside the city.", ar: "استئجار سيارة ضروري، فمعظم أفضل مواقع تبوك تقع خارج المدينة." },
      { en: "The weekend in Saudi Arabia is Friday–Saturday, plan opening hours accordingly.", ar: "عطلة نهاية الأسبوع في السعودية هي الجمعة والسبت، فخطط لمواعيد العمل تبعًا لذلك." },
      { en: "Alcohol isn't sold or served anywhere in the Kingdom.", ar: "لا يُباع الكحول ولا يُقدَّم في أي مكان بالمملكة." },
      { en: "If heading toward NEOM or the coast, fill up on fuel before leaving the city.", ar: "إن كنت متجهًا نحو نيوم أو الساحل، املأ خزان الوقود قبل مغادرة المدينة." },
    ],
    attractions: [
      {
        nameEn: "Wadi Al Disah",
        nameAr: "وادي الديسة",
        categoryEn: "Nature",
        categoryAr: "طبيعة",
        descriptionEn: "A 15-kilometre canyon of red cliffs up to 500 metres high, spring-fed palm groves and Nabataean tomb facades, often called Saudi Arabia's Grand Canyon.",
        descriptionAr: "وادٍ بطول 15 كيلومترًا بمنحدرات حمراء يصل ارتفاعها إلى 500 متر، وواحات نخيل تغذيها الينابيع وواجهات مقابر نبطية، ويُلقب غالبًا بجراند كانيون السعودية.",
      },
      {
        nameEn: "Tabuk Castle",
        nameAr: "قلعة تبوك",
        categoryEn: "Heritage",
        categoryAr: "تراث",
        descriptionEn: "A restored Ottoman-era fortress in the city centre, tied to the Prophet Muhammad's expedition to Tabuk.",
        descriptionAr: "حصن عثماني مرمم في وسط المدينة، مرتبط بغزوة النبي محمد صلى الله عليه وسلم إلى تبوك.",
      },
      {
        nameEn: "Magna",
        nameAr: "مقنا",
        categoryEn: "Ancient",
        categoryAr: "أثري",
        descriptionEn: "An ancient site near the Red Sea with Nabataean rock inscriptions, wells and cliff-face carvings.",
        descriptionAr: "موقع أثري قرب البحر الأحمر يضم نقوشًا صخرية نبطية وآبارًا ونحتًا على واجهات الجبال.",
      },
      {
        nameEn: "Tabuk's Red Sea coast",
        nameAr: "ساحل تبوك على البحر الأحمر",
        categoryEn: "Coast",
        categoryAr: "ساحل",
        descriptionEn: "Clear water and quiet beaches along the province's stretch of coastline.",
        descriptionAr: "مياه صافية وشواطئ هادئة على طول امتداد المنطقة الساحلي.",
      },
    ],
    dining: [
      {
        nameEn: "Al Maksoura Restaurant",
        nameAr: "مطعم المقصورة",
        cuisineEn: "International",
        cuisineAr: "عالمي",
        descriptionEn: "The all-day dining room at Grand Millennium Tabuk, buffet and a la carte.",
        descriptionAr: "مطعم اليوم الكامل في جراند ميلينيوم تبوك، بوفيه وقائمة طعام.",
      },
      {
        nameEn: "Juzurna Restaurant",
        nameAr: "مطعم جزرنا",
        cuisineEn: "Seafood",
        cuisineAr: "مأكولات بحرية",
        descriptionEn: "The seafood room at Grand Millennium Tabuk, worth booking ahead on a weekend evening.",
        descriptionAr: "مطعم المأكولات البحرية في جراند ميلينيوم تبوك، يستحق الحجز المسبق في أمسيات نهاية الأسبوع.",
      },
      {
        nameEn: "Al Walima Restaurant",
        nameAr: "مطعم الوليمة",
        cuisineEn: "International",
        cuisineAr: "عالمي",
        descriptionEn: "Holiday Inn Tabuk's restaurant, with a family section and a straightforward all-day menu.",
        descriptionAr: "مطعم هوليداي إن تبوك، فيه قسم للعائلات وقائمة بسيطة على مدار اليوم.",
      },
    ],
    stay: [
      {
        nameEn: "Hilton Garden Inn Tabuk",
        nameAr: "هيلتون غاردن إن تبوك",
        descriptionEn: "A dependable base with an indoor pool and 24-hour gym.",
        descriptionAr: "قاعدة إقامة موثوقة بمسبح داخلي وصالة رياضية على مدار الساعة.",
      },
      {
        nameEn: "Holiday Inn Tabuk",
        nameAr: "هوليداي إن تبوك",
        descriptionEn: "A comfortable, family-friendly stay convenient for trips toward NEOM.",
        descriptionAr: "إقامة مريحة وملائمة للعائلات، وموقع عملي للرحلات نحو نيوم.",
      },
    ],
    extendedStay: [
      {
        nameEn: "Grand Millennium Tabuk",
        nameAr: "جراند ميلينيوم تبوك",
        descriptionEn: "A 5-star property inside the Tabuk University complex, the first Millennium Hotels & Resorts luxury property in the Kingdom, about 15 minutes from the airport.",
        descriptionAr: "فندق فاخر من فئة الخمس نجوم داخل مجمع جامعة تبوك، أول فندق فاخر لمجموعة ميلينيوم للفنادق والمنتجعات في المملكة، على بعد نحو 15 دقيقة من المطار.",
        tier: "luxury",
      },
      {
        nameEn: "Best Western Plus Tabuk City Center",
        nameAr: "بست ويسترن بلس تبوك سيتي سنتر",
        descriptionEn: "A reliable international mid-range chain on Prince Sultan Bin Abdulaziz Road in Al Ulaya, central to the city's sites.",
        descriptionAr: "سلسلة عالمية موثوقة من الفئة المتوسطة في طريق الأمير سلطان بن عبدالعزيز بحي العليا، قريبة من مواقع المدينة.",
      },
      {
        nameEn: "City Landmark Hotel Suites Tabuk",
        nameAr: "معلم المدينة للشقق الفندقية تبوك",
        descriptionEn: "Budget serviced apartments on Imam Turki Ibn Abdullah Road, a short drive from the airport and a practical base for exploring on a rental car.",
        descriptionAr: "شقق فندقية اقتصادية في طريق الإمام تركي بن عبدالله، على بعد دقائق من المطار، وقاعدة عملية للتنقل بسيارة مستأجرة.",
        tier: "budget",
      },
      {
        nameEn: "Royal Tulip Sharma Resort",
        nameAr: "منتجع رويال توليب شرما",
        descriptionEn: "A beach resort on Tabuk's Red Sea coast at Sharma, roughly 140 kilometres from Tabuk city near the NEOM area, with chalets and villas facing the water. Not an in-city option, factor in the drive.",
        descriptionAr: "منتجع شاطئي على ساحل تبوك على البحر الأحمر في شرما، على بعد نحو 140 كيلومترًا من مدينة تبوك قرب منطقة نيوم، بشاليهات وفيلل تطل على الماء. ليس خيارًا داخل المدينة، يُراعى وقت التنقل إليه.",
        tier: "luxury",
      },
    ],
    sampleDay: [
      {
        timeEn: "Morning",
        timeAr: "الصباح",
        placeEn: "Wadi Al Disah",
        placeAr: "وادي الديسة",
        descriptionEn: "Walk the canyon floor while it's still cool.",
        descriptionAr: "امشِ في قاع الوادي بينما لا يزال باردًا.",
      },
      {
        timeEn: "Afternoon",
        timeAr: "بعد الظهر",
        placeEn: "Tabuk Castle",
        placeAr: "قلعة تبوك",
        descriptionEn: "A restored fortress with centuries of history in the city centre.",
        descriptionAr: "حصن مرمم يحمل قرونًا من التاريخ في وسط المدينة.",
      },
      {
        timeEn: "Sunset",
        timeAr: "الغروب",
        placeEn: "The coast road",
        placeAr: "طريق الساحل",
        descriptionEn: "A drive toward the Red Sea as the light softens.",
        descriptionAr: "رحلة بالسيارة نحو البحر الأحمر بينما يخفت الضوء.",
      },
    ],
  },
  "saudi-arabia/yanbu": {
    storyEn: [
      "Yanbu is what Jeddah might feel like with a fraction of the crowds. The same Red Sea, the same Hejazi coral-block architecture in its old town, and reefs that have barely been dived thanks to decades spent out of the spotlight.",
      "T. E. Lawrence, of Lawrence of Arabia, once lived in a house that still stands in the historic quarter, a few minutes' walk from a souq and a waterfront that stretches 11 kilometres along the coast. It's a smaller, quieter version of everything people come to the Red Sea for.",
      "This is a first look at what a few days in Yanbu could feel like. Tell us your dates and who's travelling, and we'll shape the rest around you.",
    ],
    storyAr: [
      "ينبع هي ما قد تشعر به جدة لو كانت بجزء بسيط من زحامها. البحر الأحمر ذاته، والعمارة الحجازية ذاتها المبنية بالحجر المرجاني في مدينتها القديمة، وشعاب مرجانية لم تُغَص إلا نادرًا بفضل عقود قضتها بعيدًا عن الأضواء.",
      "عاش تي. إي. لورنس، المعروف بلورانس العرب، في بيت لا يزال قائمًا في الحي التاريخي، على بعد دقائق من سوق وواجهة بحرية تمتد 11 كيلومترًا على طول الساحل. إنها نسخة أصغر وأكثر هدوءًا من كل ما يقصد الناس البحر الأحمر من أجله.",
      "هذه لمحة أولى عمّا يمكن أن تشعر به أيام قليلة في ينبع. أخبرنا بتواريخك ومن سيرافقك، وسنشكّل الباقي حولك.",
    ],
    pullQuoteEn: "Lawrence of Arabia once lived in this old town. The reefs a few minutes offshore have barely been dived since.",
    pullQuoteAr: "عاش لورانس العرب يومًا في هذه المدينة القديمة. أما الشعاب المرجانية على بعد دقائق من الشاطئ فلم تُغَص تقريبًا منذ ذلك الحين.",
    weather: {
      bestWindow: {
        labelEn: "Best time to visit",
        labelAr: "أفضل وقت للزيارة",
        monthsEn: "November – March",
        monthsAr: "نوفمبر – مارس",
        tempEn: "22–25°C, mild",
        tempAr: "22–25°م، معتدلة",
        noteEn: "Also the best window for diving, clear water and pleasant conditions offshore.",
        noteAr: "وهي أيضًا أفضل فترة للغوص، بمياه صافية وأجواء لطيفة قبالة الساحل.",
      },
      peakHeat: {
        labelEn: "Peak summer heat",
        labelAr: "ذروة الحر الصيفي",
        monthsEn: "June – September",
        monthsAr: "يونيو – سبتمبر",
        tempEn: "Around 39°C, hot and humid",
        tempAr: "نحو 39°م، حار ورطب",
        noteEn: "Coastal humidity makes midday outdoor time uncomfortable; evenings on the Corniche stay pleasant.",
        noteAr: "الرطوبة الساحلية تجعل وقت الظهيرة في الخارج غير مريح، لكن أمسيات الكورنيش تبقى لطيفة.",
      },
      tipEn: "Diving conditions are best from October through April, when the water is clearest.",
      tipAr: "ظروف الغوص في أفضل حالاتها من أكتوبر إلى أبريل، حين تكون المياه في أصفى حالاتها.",
    },
    transportation: [
      {
        modeEn: "Prince Abdulmohsen Bin Abdulaziz Airport",
        modeAr: "مطار الأمير عبدالمحسن بن عبدالعزيز",
        descriptionEn: "Yanbu's airport has domestic flights to Riyadh, Jeddah and Dammam.",
        descriptionAr: "يضم مطار ينبع رحلات داخلية إلى الرياض وجدة والدمام.",
      },
      {
        modeEn: "Road from Jeddah or Madinah",
        modeAr: "الطريق من جدة أو المدينة",
        descriptionEn: "Yanbu is roughly a three-hour drive from Jeddah and about two hours from Madinah on well-maintained highways.",
        descriptionAr: "تبعد ينبع نحو ثلاث ساعات بالسيارة عن جدة وحوالي ساعتين عن المدينة المنورة عبر طرق سريعة مصانة جيدًا.",
      },
      {
        modeEn: "Rental car or taxi",
        modeAr: "استئجار سيارة أو سيارة أجرة",
        descriptionEn: "Useful for reaching dive sites and moving between the old town and the Corniche at your own pace.",
        descriptionAr: "مفيدة للوصول إلى مواقع الغوص والتنقل بين المدينة القديمة والكورنيش بالوتيرة التي تناسبك.",
      },
    ],
    faq: [
      {
        questionEn: "What is Yanbu famous for?",
        questionAr: "بم تشتهر ينبع؟",
        answerEn: "Uncrowded Red Sea diving, coral-block Hejazi architecture in its old town, and the house where T. E. Lawrence once lived.",
        answerAr: "بغوص هادئ في البحر الأحمر بعيدًا عن الزحام، وعمارة حجازية من الحجر المرجاني في مدينتها القديمة، والبيت الذي عاش فيه تي. إي. لورنس.",
      },
      {
        questionEn: "What's the best time of year to visit Yanbu?",
        questionAr: "ما أفضل وقت لزيارة ينبع؟",
        answerEn: "November through March for mild weather, though October through April is the wider window for the clearest diving conditions.",
        answerAr: "من نوفمبر إلى مارس لأجواء معتدلة، رغم أن الفترة من أكتوبر إلى أبريل هي النافذة الأوسع لأصفى ظروف الغوص.",
      },
      {
        questionEn: "How many days should I spend in Yanbu?",
        questionAr: "كم يومًا يجب أن أقضي في ينبع؟",
        answerEn: "Two to three days covers the old town, a dive or snorkel trip, and time on the Corniche.",
        answerAr: "يومان إلى ثلاثة أيام تكفي لتغطية المدينة القديمة، ورحلة غوص أو سنوركل، ووقت على الكورنيش.",
      },
      {
        questionEn: "What are the best things to do in Yanbu?",
        questionAr: "ما أفضل الأنشطة في ينبع؟",
        answerEn: "Wandering the coral-block lanes of the old town, snorkelling at Barracuda Beach, diving Al-Farabi Coral Reef, and walking the Corniche at sunset.",
        answerAr: "التجول في أزقة المدينة القديمة المرجانية، والسنوركل في شاطئ باراكودا، والغوص في شعاب الفارابي المرجانية، والمشي على الكورنيش عند الغروب.",
      },
      {
        questionEn: "Is Yanbu safe for tourists?",
        questionAr: "هل ينبع آمنة للسياح؟",
        answerEn: "Yes, Yanbu is safe and relaxed, with far fewer crowds than Jeddah's better-known Red Sea spots.",
        answerAr: "نعم، ينبع آمنة وهادئة، وتستقبل زوارًا أقل بكثير من مواقع جدة الأشهر على البحر الأحمر.",
      },
      {
        questionEn: "What should I wear in Yanbu?",
        questionAr: "ماذا يجب أن أرتدي في ينبع؟",
        answerEn: "Modest clothing on land; swimwear is fine at private beaches and resort pools when diving or snorkelling.",
        answerAr: "ملابس محتشمة على اليابسة؛ ولباس السباحة مقبول في الشواطئ الخاصة ومسابح المنتجعات عند الغوص أو السنوركل.",
      },
      {
        questionEn: "Do I need a visa to visit Yanbu?",
        questionAr: "هل أحتاج تأشيرة لزيارة ينبع؟",
        answerEn: "Many nationalities can apply for a Saudi tourist eVisa online before travelling. We can help confirm what applies to you as part of planning your trip.",
        answerAr: "يمكن لكثير من الجنسيات التقدم للحصول على التأشيرة السياحية الإلكترونية السعودية عبر الإنترنت قبل السفر. يمكننا مساعدتك في تأكيد ما ينطبق عليك ضمن التخطيط لرحلتك.",
      },
      {
        questionEn: "Is Yanbu good for families?",
        questionAr: "هل ينبع مناسبة للعائلات؟",
        answerEn: "Yes, the Corniche and shallow reefs close to shore, like Barracuda Beach, work well for families with children.",
        answerAr: "نعم، يناسب الكورنيش والشعاب الضحلة القريبة من الشاطئ، مثل شاطئ باراكودا، العائلات التي لديها أطفال.",
      },
      {
        questionEn: "What's Yanbu known for beyond diving?",
        questionAr: "بم تشتهر ينبع إلى جانب الغوص؟",
        answerEn: "Its historic old town, one of the best-preserved examples of coral-block Hejazi architecture on the Red Sea coast.",
        answerAr: "بمدينتها القديمة، من أفضل الأمثلة المحفوظة للعمارة الحجازية المرجانية على ساحل البحر الأحمر.",
      },
    ],
    travelTips: [
      { en: "Book dive trips ahead if visiting between October and April, the clearest and busiest diving window.", ar: "احجز رحلات الغوص مسبقًا إن كانت زيارتك بين أكتوبر وأبريل، وهي أصفى فترات الغوص وأكثرها ازدحامًا." },
      { en: "The old town's coral-block lanes are best explored on foot in the cooler morning hours.", ar: "يُفضَّل استكشاف أزقة المدينة القديمة المرجانية سيرًا على الأقدام في ساعات الصباح الباردة." },
      { en: "Reefs here see far fewer divers than Jeddah, an advantage for unhurried, uncrowded dives.", ar: "تستقبل الشعاب هنا غواصين أقل بكثير من جدة، وهي ميزة لغوص هادئ وغير مزدحم." },
      { en: "The weekend in Saudi Arabia is Friday–Saturday, plan opening hours accordingly.", ar: "عطلة نهاية الأسبوع في السعودية هي الجمعة والسبت، فخطط لمواعيد العمل تبعًا لذلك." },
      { en: "Alcohol isn't sold or served anywhere in the Kingdom.", ar: "لا يُباع الكحول ولا يُقدَّم في أي مكان بالمملكة." },
      { en: "The Corniche is at its best in the evening, when the heat breaks and restaurants fill up.", ar: "يكون الكورنيش في أفضل حالاته في المساء، حين يخف الحر وتمتلئ المطاعم." },
    ],
    attractions: [
      {
        nameEn: "Yanbu Historic Old Town",
        nameAr: "ينبع التاريخية",
        categoryEn: "Heritage",
        categoryAr: "تراث",
        descriptionEn: "Coral-block Hejazi architecture, a souq and the house where T. E. Lawrence once lived.",
        descriptionAr: "عمارة حجازية من الحجر المرجاني، وسوق، والبيت الذي عاش فيه تي. إي. لورنس.",
      },
      {
        nameEn: "Yanbu Corniche",
        nameAr: "كورنيش ينبع",
        categoryEn: "Waterfront",
        categoryAr: "واجهة بحرية",
        descriptionEn: "An 11-kilometre waterfront promenade with parks and restaurants along the Red Sea.",
        descriptionAr: "ممشى بحري يمتد 11 كيلومترًا بحدائق ومطاعم على طول البحر الأحمر.",
      },
      {
        nameEn: "Barracuda Beach",
        nameAr: "شاطئ باراكودا",
        categoryEn: "Diving",
        categoryAr: "غوص",
        descriptionEn: "Coral formations beginning close to shore, a favourite for snorkelling.",
        descriptionAr: "تكوينات مرجانية تبدأ قريبًا من الشاطئ، مفضلة لهواة السنوركل.",
      },
      {
        // It is an island you snorkel off, not a named reef. "Al-Farabi
        // Coral Reef" finds nothing; the island does.
        nameEn: "Al-Farabi Island",
        nameAr: "جزيرة الفارابي",
        categoryEn: "Diving",
        categoryAr: "غوص",
        descriptionEn: "A vibrant, uncrowded dive site rarely visited by international tourists.",
        descriptionAr: "موقع غوص نابض بالحياة وغير مزدحم، نادرًا ما يزوره السياح الدوليون.",
      },
    ],
    dining: [
      {
        nameEn: "Trio",
        nameAr: "تريو",
        cuisineEn: "International",
        cuisineAr: "عالمي",
        descriptionEn: "The restaurant at Novotel Yanbu on the Corniche, world cuisine in a calm room, easy after a day on the water.",
        descriptionAr: "مطعم نوفوتيل ينبع على الكورنيش، مطبخ عالمي في أجواء هادئة، مناسب بعد يوم في البحر.",
      },
      {
        nameEn: "Jasmine Restaurant",
        nameAr: "مطعم جاسمين",
        cuisineEn: "International",
        cuisineAr: "عالمي",
        descriptionEn: "All-day dining at Holiday Inn Yanbu overlooking the pool, with a seafood night midweek.",
        descriptionAr: "مطعم يفتح طوال اليوم في هوليداي إن ينبع ويطل على المسبح، مع ليلة مأكولات بحرية في منتصف الأسبوع.",
      },
    ],
    stay: [
      {
        nameEn: "Novotel Yanbu",
        nameAr: "نوفوتيل ينبع",
        descriptionEn: "A full-service spa with steam room and sauna, a comfortable modern base.",
        descriptionAr: "سبا متكامل بغرفة بخار وساونا، قاعدة إقامة عصرية ومريحة.",
      },
      {
        nameEn: "Canary Beach Hotel",
        nameAr: "فندق كناري بيتش",
        descriptionEn: "An à la carte restaurant and fitness centre, close to the waterfront.",
        descriptionAr: "مطعم بقائمة طعام مفتوحة ومركز لياقة، قريب من الواجهة البحرية.",
      },
    ],
    extendedStay: [
      {
        nameEn: "Kempinski Hotel & Resort Sariya Yanbu Red Sea",
        nameAr: "فندق ومنتجع كمبينسكي السارية ينبع",
        descriptionEn: "Yanbu's first 5-star hotel, opened January 2025 on the Royal Commission waterfront, with a private beach, marina and Red Sea-view suites.",
        descriptionAr: "أول فندق فاخر من فئة الخمس نجوم في ينبع، افتُتح في يناير 2025 على واجهة الهيئة الملكية، بشاطئ خاص ومرسى وأجنحة تطل على البحر الأحمر.",
        tier: "luxury",
      },
      {
        nameEn: "Radisson Blu Hotel Yanbu",
        nameAr: "فندق راديسون بلو ينبع",
        descriptionEn: "An established upper mid-range choice on Abdullah Ibn Abdulaziz Road, a familiar international standard for business or leisure.",
        descriptionAr: "خيار راسخ من الفئة المتوسطة العليا في طريق عبدالله بن عبدالعزيز، بمعايير عالمية مألوفة سواء للعمل أو الترفيه.",
      },
      {
        nameEn: "Hotel & Resort Golden Marina Yanbu",
        nameAr: "فندق ومنتجع جولدن مارينا ينبع",
        descriptionEn: "A beachfront resort near Sharm Beach with chalets and villas, an outdoor pool and a short drive to the dive sites.",
        descriptionAr: "منتجع على الشاطئ قرب شاطئ شرم بشاليهات وفيلل ومسبح خارجي، وعلى بعد دقائق من مواقع الغوص.",
      },
      {
        nameEn: "Fakher Yanbu Apartment",
        nameAr: "شقق فاخر ينبع",
        descriptionEn: "A well-reviewed budget studio and apartment stay on King Abdulaziz Road, five minutes from the Corniche.",
        descriptionAr: "إقامة اقتصادية بتقييمات جيدة في استوديوهات وشقق بطريق الملك عبدالعزيز، على بعد خمس دقائق من الكورنيش.",
        tier: "budget",
      },
    ],
    sampleDay: [
      {
        timeEn: "Morning",
        timeAr: "الصباح",
        placeEn: "Yanbu Old Town",
        placeAr: "ينبع القديمة",
        descriptionEn: "Coral-block lanes and Lawrence's old house before the heat builds.",
        descriptionAr: "أزقة الحجر المرجاني وبيت لورنس القديم قبل اشتداد الحر.",
      },
      {
        timeEn: "Afternoon",
        timeAr: "بعد الظهر",
        placeEn: "Barracuda Beach",
        placeAr: "شاطئ باراكودا",
        descriptionEn: "Snorkelling reefs that start just off the sand.",
        descriptionAr: "شعاب سنوركل تبدأ فور الوصول إلى الرمال.",
      },
      {
        timeEn: "Evening",
        timeAr: "المساء",
        placeEn: "Yanbu Corniche",
        placeAr: "كورنيش ينبع",
        descriptionEn: "An evening stroll and a fish dinner by the water.",
        descriptionAr: "نزهة مسائية وعشاء سمك على الماء.",
      },
    ],
  },
  "turkey/istanbul": {
    attractions: [
      { nameEn: "Hagia Sophia", nameAr: "آيا صوفيا", categoryEn: "Landmark", categoryAr: "معلم", descriptionEn: "Cathedral, then mosque, then museum, now a mosque again, and still the building every other one in the city answers to.", descriptionAr: "كاتدرائية ثم مسجد ثم متحف، وعادت مسجدًا، وتبقى المبنى الذي تقيس عليه كل عمارة أخرى في المدينة." },
      { nameEn: "Blue Mosque", nameAr: "المسجد الأزرق", categoryEn: "Mosque", categoryAr: "مسجد", descriptionEn: "Sultan Ahmed's mosque facing Hagia Sophia across a garden, still in daily use, so visits work around prayer times.", descriptionAr: "مسجد السلطان أحمد المقابل لآيا صوفيا عبر حديقة، ولا يزال يُصلى فيه يوميًا، فالزيارة تُنظَّم حول أوقات الصلاة." },
      { nameEn: "Topkapi Palace", nameAr: "قصر توبكابي", categoryEn: "Palace", categoryAr: "قصر", descriptionEn: "Four centuries of Ottoman court life, the treasury and the sacred relics, on the headland above the Golden Horn.", descriptionAr: "أربعة قرون من حياة البلاط العثماني، والخزينة والأمانات المقدسة، على الرأس المطل على القرن الذهبي." },
      { nameEn: "Grand Bazaar", nameAr: "البازار الكبير", categoryEn: "Market", categoryAr: "سوق", descriptionEn: "Sixty-odd covered streets of carpets, gold and lamps; go with time and no fixed shopping list.", descriptionAr: "أكثر من ستين شارعًا مسقوفًا من السجاد والذهب والفوانيس؛ اذهب بوقت مفتوح ودون قائمة مشتريات محددة." },
      { nameEn: "Bosphorus ferry", nameAr: "عبّارة البوسفور", categoryEn: "On the water", categoryAr: "على الماء", descriptionEn: "The cheapest good hour in Istanbul: a public ferry between the European and Asian shores, past palaces and wooden mansions.", descriptionAr: "أرخص ساعة جميلة في إسطنبول: عبّارة عامة بين الضفتين الأوروبية والآسيوية، تمر بالقصور والبيوت الخشبية." },
      { nameEn: "Galata Tower", nameAr: "برج غلطة", categoryEn: "Viewpoint", categoryAr: "إطلالة", descriptionEn: "A Genoese watchtower with the city's most complete rooftop view; queues are shortest early.", descriptionAr: "برج مراقبة جنوي بأشمل إطلالة على المدينة من الأعلى؛ والطوابير أقصر في الصباح الباكر." },
    ],
    dining: [
      { nameEn: "Mikla", nameAr: "ميكلا", cuisineEn: "Modern Anatolian", cuisineAr: "أناضولي معاصر", descriptionEn: "On the roof of the Marmara Pera, a daily-changing menu built on Anatolian produce, with the city laid out below. Dinner only, closed Sundays.", descriptionAr: "على سطح فندق المرمرة بيرا، قائمة تتغير يوميًا مبنية على محاصيل الأناضول، والمدينة ممتدة تحتك. العشاء فقط، ومغلق أيام الأحد." },
      { nameEn: "Neolokal", nameAr: "نيولوكال", cuisineEn: "Turkish", cuisineAr: "تركي", descriptionEn: "One MICHELIN star in the 2026 Türkiye guide, inside Salt Galata, taking Turkish culinary heritage somewhere new.", descriptionAr: "نجمة ميشلان واحدة في دليل تركيا 2026، داخل صالت غلطة، تأخذ التراث المطبخي التركي إلى مكان جديد." },
      { nameEn: "Karaköy Lokantası", nameAr: "كاراكوي لوكانتاسي", cuisineEn: "Turkish meze", cuisineAr: "مقبلات تركية", descriptionEn: "A MICHELIN Bib Gourmand, tiled and busy, with a long meze list and prices that stay sensible. Book ahead for dinner.", descriptionAr: "حائز على بيب غورماند من ميشلان، مزيّن بالقيشاني ومزدحم، بقائمة مقبلات طويلة وأسعار معقولة. احجز مسبقًا للعشاء." },
    ],
    stay: [
      { nameEn: "Four Seasons Hotel Istanbul at Sultanahmet", nameAr: "فورسيزونز إسطنبول في السلطان أحمد", descriptionEn: "A converted neoclassical building inside the old city, minutes on foot from Hagia Sophia and the Blue Mosque.", descriptionAr: "مبنى كلاسيكي محوّل داخل المدينة القديمة، على بعد دقائق مشيًا من آيا صوفيا والمسجد الأزرق.", tier: "luxury" },
      { nameEn: "Çırağan Palace Kempinski Istanbul", nameAr: "قصر تشيراغان كمبينسكي إسطنبول", descriptionEn: "A former Ottoman palace on the Bosphorus with a waterside pool, for when the hotel is meant to be part of the trip.", descriptionAr: "قصر عثماني سابق على البوسفور بمسبح على الماء، حين يكون الفندق نفسه جزءًا من الرحلة.", tier: "luxury" },
      { nameEn: "Pera Palace Hotel", nameAr: "فندق بيرا بالاس", descriptionEn: "Built for Orient Express passengers, in Beyoğlu within walking distance of İstiklal Street and Galata.", descriptionAr: "بُني لركاب قطار الشرق السريع، في بيه أوغلو على مسافة مشي من شارع الاستقلال وغلطة.", tier: "luxury" },
    ],
    extendedStay: [
      { nameEn: "Novotel Istanbul Bosphorus", nameAr: "نوفوتيل إسطنبول البوسفور", descriptionEn: "In Karaköy on the water, a reliable mid-range base with a pool and hammam, walkable to Galata.", descriptionAr: "في كاراكوي على الماء، خيار متوسط موثوق بمسبح وحمام تركي، ويمكن المشي منه إلى غلطة." },
      { nameEn: "ibis Istanbul Sisli", nameAr: "إيبيس إسطنبول شيشلي", descriptionEn: "Plain, clean and next to the metro in Şişli, for putting the budget into the days rather than the room.", descriptionAr: "بسيط ونظيف وبجوار المترو في شيشلي، لمن يفضل إنفاق الميزانية على الأيام لا على الغرفة.", tier: "budget" },
    ],
    trustedProviders: [
      { nameEn: "Cab Istanbul", nameAr: "كاب إسطنبول", typeEn: "Private transfer & chauffeur service", typeAr: "خدمة نقل خاص وسائق", noteEn: "Operating since 2009 across both airports, and states it is registered with TURSAB (no. 11980) and holds a Ministry of Transport D2 licence; worth confirming current licensing and agreeing a fixed fare when you book.", noteAr: "تعمل منذ 2009 عبر المطارين، وتذكر أنها مسجّلة لدى اتحاد وكالات السفر التركية (رقم 11980) وتحمل رخصة D2 من وزارة النقل؛ ويُفضل تأكيد الترخيص الحالي والاتفاق على سعر ثابت عند الحجز." },
      { nameEn: "MyChauffeur", nameAr: "ماي شوفير", typeEn: "Private chauffeur service", typeAr: "خدمة سائق خاص", noteEn: "The same chauffeur company we use in Saudi cities also covers Istanbul airport transfers, useful if you want one provider across a multi-country trip.", noteAr: "شركة السائقين نفسها التي نستعين بها في المدن السعودية تغطي أيضًا تنقلات مطار إسطنبول، وهو مفيد إن أردت مزوّدًا واحدًا في رحلة متعددة الدول." },
    ],
    sampleDay: [
      { timeEn: "Early morning", timeAr: "الصباح الباكر", placeEn: "Hagia Sophia", placeAr: "آيا صوفيا", descriptionEn: "Go at opening, before the tour groups arrive.", descriptionAr: "اذهب عند الافتتاح قبل وصول المجموعات السياحية." },
      { timeEn: "Midday", timeAr: "منتصف النهار", placeEn: "Grand Bazaar", placeAr: "البازار الكبير", descriptionEn: "Wander without a list, then lunch on meze nearby.", descriptionAr: "تجوّل دون قائمة، ثم تناول غداءً من المقبلات في الجوار." },
      { timeEn: "Late afternoon", timeAr: "بعد العصر", placeEn: "Bosphorus ferry", placeAr: "عبّارة البوسفور", descriptionEn: "Cross to the Asian side and back as the light drops.", descriptionAr: "اعبر إلى الجانب الآسيوي وعُد مع مغيب الضوء." },
      { timeEn: "Evening", timeAr: "المساء", placeEn: "Karaköy", placeAr: "كاراكوي", descriptionEn: "Dinner in Karaköy, then the walk up to Galata.", descriptionAr: "عشاء في كاراكوي، ثم المشي صعودًا إلى غلطة." },
    ],
    travelTips: [
      { en: "Buy an İstanbulkart at any station: it covers the metro, trams, buses and the public ferries, and the ferries are the nicest way to cross.", ar: "اشترِ بطاقة إسطنبول كارت من أي محطة: تغطي المترو والترام والحافلات والعبّارات العامة، والعبّارات أجمل وسيلة للعبور." },
      { en: "The historic peninsula and Beyoğlu are on opposite sides of the Golden Horn. Pick one for each day rather than crossing back and forth.", ar: "شبه الجزيرة التاريخية وبيه أوغلو على ضفتين متقابلتين من القرن الذهبي. خصّص يومًا لكل جهة بدل التنقل بينهما ذهابًا وإيابًا." },
      { en: "Mosques close to visitors during prayer and for about half an hour after; Friday midday is the busiest and worth planning around.", ar: "تُغلق المساجد أمام الزوار أثناء الصلاة ولنحو نصف ساعة بعدها؛ وظهر الجمعة هو الأكثر ازدحامًا ويستحق التخطيط حوله." },
    ],
  },
  "turkey/cappadocia": {
    "attractions": [
      {
        "nameEn": "Göreme Open-Air Museum",
        "nameAr": "متحف غوريمه المفتوح",
        "categoryEn": "Heritage",
        "categoryAr": "تراث",
        "descriptionEn": "Rock-cut churches with Byzantine frescoes, cut straight into the volcanic tuff.",
        "descriptionAr": "كنائس منحوتة في الصخر بجداريات بيزنطية، محفورة مباشرة في الحجر البركاني."
      },
      {
        "nameEn": "Hot-air balloon flight",
        "nameAr": "رحلة منطاد الهواء الساخن",
        "categoryEn": "At dawn",
        "categoryAr": "عند الفجر",
        "descriptionEn": "The reason most people come. Flights launch at first light and are cancelled for wind, so plan it early in the stay and keep a spare morning.",
        "descriptionAr": "السبب الذي يأتي من أجله معظم الناس. تنطلق الرحلات مع أول ضوء وتُلغى بسبب الرياح، لذا خطط لها في بداية إقامتك واترك صباحًا احتياطيًا."
      },
      {
        "nameEn": "Uçhisar Castle",
        "nameAr": "قلعة أوتشيسار",
        "categoryEn": "Viewpoint",
        "categoryAr": "إطلالة",
        "descriptionEn": "The highest point in the region, a hollowed rock outcrop you climb for the whole valley at once.",
        "descriptionAr": "أعلى نقطة في المنطقة، صخرة مجوّفة تتسلقها فترى الوادي كله دفعة واحدة."
      },
      {
        "nameEn": "Derinkuyu Underground City",
        "nameAr": "مدينة درينكويو الجوفية",
        "categoryEn": "Heritage",
        "categoryAr": "تراث",
        "descriptionEn": "Eight levels dug down into the rock, once sheltering thousands. Not for anyone uneasy in tight spaces.",
        "descriptionAr": "ثمانية مستويات محفورة في الصخر، آوت آلافًا في زمنها. لا تناسب من يضيق بالأماكن الضيقة."
      }
    ],
    "dining": [
      {
        "nameEn": "Seten Restaurant",
        "nameAr": "مطعم سيتين",
        "cuisineEn": "Anatolian",
        "cuisineAr": "أناضولي",
        "descriptionEn": "Regional Anatolian cooking in Göreme, the usual choice for a proper dinner rather than a tourist menu.",
        "descriptionAr": "مطبخ أناضولي محلي في غوريمه، والخيار المعتاد لعشاء حقيقي بدل قوائم السياح."
      },
      {
        "nameEn": "Topdeck Cave Restaurant",
        "nameAr": "توب ديك كيف",
        "cuisineEn": "Turkish home cooking",
        "cuisineAr": "مطبخ تركي منزلي",
        "descriptionEn": "A small cave dining room in Göreme, family-run and booked out most evenings, so reserve.",
        "descriptionAr": "قاعة طعام صغيرة داخل كهف في غوريمه، تديرها عائلة وتُحجز بالكامل معظم الأمسيات، فاحجز مسبقًا."
      }
    ],
    "stay": [
      {
        "nameEn": "Museum Hotel",
        "nameAr": "ميوزيم أوتيل",
        "descriptionEn": "A Relais & Châteaux cave hotel in Uçhisar, with Hittite through Ottoman pieces set into the rooms themselves.",
        "descriptionAr": "فندق كهفي من مجموعة ريليه آند شاتو في أوتشيسار، بقطع أثرية من الحثيين حتى العثمانيين موضوعة في الغرف نفسها.",
        "tier": "luxury"
      },
      {
        "nameEn": "Argos in Cappadocia",
        "nameAr": "أرغوس إن كابادوكيا",
        "descriptionEn": "A restored monastery in Uçhisar, cave rooms linked by tunnels and courtyards, looking over Pigeon Valley.",
        "descriptionAr": "دير مرمم في أوتشيسار، غرف كهفية تربطها أنفاق وأفنية، تطل على وادي الحمام.",
        "tier": "luxury"
      }
    ],
    "extendedStay": [
      {
        "nameEn": "Sultan Cave Suites",
        "nameAr": "سلطان كيف سويتس",
        "descriptionEn": "In Göreme, best known for the rooftop terrace where the balloons come up in front of you at sunrise.",
        "descriptionAr": "في غوريمه، وأشهر ما فيه شرفة السطح حيث ترتفع المناطيد أمامك عند الشروق."
      }
    ],
    "sampleDay": [
      {
        "timeEn": "Before dawn",
        "timeAr": "قبل الفجر",
        "placeEn": "Balloon flight",
        "placeAr": "رحلة المنطاد",
        "descriptionEn": "Pickup is around 04:30 in summer; dress warmer than you expect.",
        "descriptionAr": "الاصطحاب نحو الرابعة والنصف فجرًا صيفًا؛ والبس أدفأ مما تتوقع."
      },
      {
        "timeEn": "Late morning",
        "timeAr": "قبيل الظهر",
        "placeEn": "Göreme Open-Air Museum",
        "placeAr": "متحف غوريمه المفتوح",
        "descriptionEn": "The frescoed churches, before the midday heat.",
        "descriptionAr": "الكنائس المزينة بالجداريات، قبل حر الظهيرة."
      },
      {
        "timeEn": "Sunset",
        "timeAr": "الغروب",
        "placeEn": "Uçhisar Castle",
        "placeAr": "قلعة أوتشيسار",
        "descriptionEn": "Climb for the light going down over the valleys.",
        "descriptionAr": "اصعد لترى الضوء يهبط على الوديان."
      }
    ],
    "travelTips": [
      {
        "en": "Balloon flights are weather-dependent and cancel often. Book for your first morning so a cancellation still leaves you another chance.",
        "ar": "رحلات المناطيد مرتبطة بالطقس وتُلغى كثيرًا. احجزها في صباحك الأول حتى يبقى لك فرصة أخرى إن أُلغيت."
      },
      {
        "en": "Göreme, Uçhisar and Ürgüp are all within a short drive of each other. Where you sleep matters less than having a car or driver.",
        "ar": "غوريمه وأوتشيسار وأورغوب جميعها على مسافة قيادة قصيرة من بعضها. المكان الذي تنام فيه أقل أهمية من توفر سيارة أو سائق."
      }
    ]
  },
  "turkey/antalya": {
    "attractions": [
      {
        "nameEn": "Kaleiçi Old Town",
        "nameAr": "البلدة القديمة كاله إيتشي",
        "categoryEn": "Old town",
        "categoryAr": "بلدة قديمة",
        "descriptionEn": "Ottoman houses, Roman walls and a small harbour, all inside the old city walls.",
        "descriptionAr": "بيوت عثمانية وأسوار رومانية ومرفأ صغير، كلها داخل أسوار المدينة القديمة."
      },
      {
        "nameEn": "Hadrian's Gate",
        "nameAr": "بوابة هادريان",
        "categoryEn": "Landmark",
        "categoryAr": "معلم",
        "descriptionEn": "A Roman triumphal arch from AD 130, still the way into the old town on foot.",
        "descriptionAr": "قوس نصر روماني من عام 130 ميلادي، ولا يزال المدخل المشيًا إلى البلدة القديمة."
      },
      {
        "nameEn": "Düden Waterfalls",
        "nameAr": "شلالات دودان",
        "categoryEn": "Nature",
        "categoryAr": "طبيعة",
        "descriptionEn": "The lower falls drop straight off the cliff into the Mediterranean; best seen from a boat.",
        "descriptionAr": "الشلالات السفلى تسقط مباشرة من الجرف إلى المتوسط؛ وأجمل مشاهدة لها من قارب."
      },
      {
        "nameEn": "Antalya Museum",
        "nameAr": "متحف أنطاليا",
        "categoryEn": "Museum",
        "categoryAr": "متحف",
        "descriptionEn": "One of Türkiye's strongest archaeological collections, largely from nearby Perge.",
        "descriptionAr": "من أقوى المجموعات الأثرية في تركيا، ومعظمها من مدينة برجه القريبة."
      }
    ],
    "dining": [
      {
        "nameEn": "Seraser Fine Dining",
        "nameAr": "سيراسر",
        "cuisineEn": "Mediterranean",
        "cuisineAr": "متوسطي",
        "descriptionEn": "Inside the Tuvana Hotel in Kaleiçi, in an Ottoman mansion, with courtyard tables in season.",
        "descriptionAr": "داخل فندق توفانا في كاله إيتشي، في قصر عثماني، مع طاولات في الفناء في الموسم."
      },
      {
        "nameEn": "Vanilla Restaurant",
        "nameAr": "فانيلا",
        "cuisineEn": "Modern European",
        "cuisineAr": "أوروبي معاصر",
        "descriptionEn": "A long-standing Kaleiçi kitchen doing modern European cooking, an easy change from kebab.",
        "descriptionAr": "مطبخ عريق في كاله إيتشي يقدم مطبخًا أوروبيًا معاصرًا، وتغيير سهل عن الكباب."
      }
    ],
    "stay": [
      {
        "nameEn": "Tuvana Hotel",
        "nameAr": "فندق توفانا",
        "descriptionEn": "A boutique conversion of Ottoman houses in the middle of Kaleiçi, walkable to everything in the old town.",
        "descriptionAr": "فندق بوتيك محوّل من بيوت عثمانية في وسط كاله إيتشي، وكل ما في البلدة القديمة على مسافة مشي.",
        "tier": "luxury"
      },
      {
        "nameEn": "Akra Hotel",
        "nameAr": "فندق أكرا",
        "descriptionEn": "On the cliff above the Mediterranean just outside the old town, with pools and sea access.",
        "descriptionAr": "على الجرف فوق المتوسط خارج البلدة القديمة مباشرة، بمسابح ومنفذ إلى البحر."
      }
    ],
    "sampleDay": [
      {
        "timeEn": "Morning",
        "timeAr": "الصباح",
        "placeEn": "Kaleiçi Old Town",
        "placeAr": "البلدة القديمة",
        "descriptionEn": "Walk in through Hadrian's Gate before the heat.",
        "descriptionAr": "ادخل من بوابة هادريان قبل اشتداد الحر."
      },
      {
        "timeEn": "Afternoon",
        "timeAr": "بعد الظهر",
        "placeEn": "Düden Waterfalls",
        "placeAr": "شلالات دودان",
        "descriptionEn": "By boat, so you see them from the water.",
        "descriptionAr": "بالقارب، لتراها من جهة البحر."
      },
      {
        "timeEn": "Evening",
        "timeAr": "المساء",
        "placeEn": "Kaleiçi harbour",
        "placeAr": "مرفأ كاله إيتشي",
        "descriptionEn": "Dinner in the old town, then the walk down to the marina.",
        "descriptionAr": "عشاء في البلدة القديمة، ثم النزول مشيًا إلى المارينا."
      }
    ],
    "travelTips": [
      {
        "en": "Antalya is the gateway to Side, Aspendos and Perge, all an easy day trip and all worth one.",
        "ar": "أنطاليا هي البوابة إلى سيده وأسبندوس وبرجه، وكلها رحلات يوم سهلة وتستحق."
      },
      {
        "en": "July and August are very hot and very full. May, June, September and October are the comfortable months.",
        "ar": "يوليو وأغسطس شديدا الحرارة والازدحام. أما مايو ويونيو وسبتمبر وأكتوبر فهي الشهور المريحة."
      }
    ]
  },
  "turkey/bodrum": {
    "attractions": [
      {
        "nameEn": "Bodrum Castle",
        "nameAr": "قلعة بودروم",
        "categoryEn": "Castle",
        "categoryAr": "قلعة",
        "descriptionEn": "Built by the Knights of St John, now the Museum of Underwater Archaeology, on the headland between the two bays.",
        "descriptionAr": "بناها فرسان القديس يوحنا، وهي اليوم متحف الآثار تحت الماء، على الرأس بين الخليجين."
      },
      {
        "nameEn": "Bodrum Marina",
        "nameAr": "مارينا بودروم",
        "categoryEn": "Waterfront",
        "categoryAr": "واجهة بحرية",
        "descriptionEn": "Where the gulets tie up and the evening starts; the walk along it is the town's main promenade.",
        "descriptionAr": "حيث ترسو مراكب الغولت ويبدأ المساء؛ والمشي بمحاذاتها هو كورنيش البلدة الرئيسي."
      },
      {
        "nameEn": "Gulet day on the Aegean",
        "nameAr": "يوم على مركب غولت",
        "categoryEn": "On the water",
        "categoryAr": "على الماء",
        "descriptionEn": "A wooden gulet out to the bays for the day, the standard way to see the coast here.",
        "descriptionAr": "مركب غولت خشبي إلى الخلجان ليوم كامل، وهي الطريقة المعتادة لرؤية الساحل هنا."
      },
      {
        "nameEn": "Mausoleum of Halicarnassus",
        "nameAr": "ضريح هاليكارناسوس",
        "categoryEn": "Heritage",
        "categoryAr": "تراث",
        "descriptionEn": "One of the seven wonders of the ancient world, now foundations and fragments, but the site is the point.",
        "descriptionAr": "إحدى عجائب الدنيا السبع القديمة، ولم يبق منها سوى الأسس والشظايا، لكن الموقع نفسه هو المقصود."
      }
    ],
    "dining": [
      {
        "nameEn": "Kitchen Bodrum",
        "nameAr": "كيتشن بودروم",
        "cuisineEn": "Modern Aegean",
        "cuisineAr": "إيجي معاصر",
        "descriptionEn": "A well-regarded Bodrum kitchen doing modern Aegean cooking; book for the terrace in season.",
        "descriptionAr": "مطبخ محترم في بودروم يقدم مطبخًا إيجيًا معاصرًا؛ احجز للشرفة في الموسم."
      }
    ],
    "stay": [
      {
        "nameEn": "Mandarin Oriental, Bodrum",
        "nameAr": "ماندارين أورينتال بودروم",
        "descriptionEn": "On Paradise Bay with private beaches and several restaurants, the full resort rather than a town hotel.",
        "descriptionAr": "على خليج بارادايس بشواطئ خاصة وعدة مطاعم، منتجع متكامل لا فندق مدينة.",
        "tier": "luxury"
      }
    ],
    "sampleDay": [
      {
        "timeEn": "Morning",
        "timeAr": "الصباح",
        "placeEn": "Bodrum Castle",
        "placeAr": "قلعة بودروم",
        "descriptionEn": "The castle and its underwater archaeology museum.",
        "descriptionAr": "القلعة ومتحف الآثار الغارقة فيها."
      },
      {
        "timeEn": "Midday",
        "timeAr": "منتصف النهار",
        "placeEn": "Gulet day",
        "placeAr": "يوم الغولت",
        "descriptionEn": "Out to the bays, swimming from the boat.",
        "descriptionAr": "إلى الخلجان، والسباحة من المركب."
      },
      {
        "timeEn": "Evening",
        "timeAr": "المساء",
        "placeEn": "Bodrum Marina",
        "placeAr": "مارينا بودروم",
        "descriptionEn": "Dinner along the marina.",
        "descriptionAr": "عشاء بمحاذاة المارينا."
      }
    ],
    "travelTips": [
      {
        "en": "Bodrum town and the peninsula's bays are different holidays. Decide which one you want before choosing where to sleep.",
        "ar": "بلدة بودروم وخلجان شبه الجزيرة عطلتان مختلفتان. قرر أيهما تريد قبل اختيار مكان إقامتك."
      }
    ]
  },
  "turkey/izmir": {
    "attractions": [
      {
        "nameEn": "Ephesus",
        "nameAr": "أفسس",
        "categoryEn": "Heritage",
        "categoryAr": "تراث",
        "descriptionEn": "The best-preserved classical city in the eastern Mediterranean, an hour south of İzmir. Go early.",
        "descriptionAr": "أفضل مدينة كلاسيكية محفوظة في شرق المتوسط، على بعد ساعة جنوب إزمير. اذهب مبكرًا."
      },
      {
        "nameEn": "Kordon promenade",
        "nameAr": "كوردون",
        "categoryEn": "Waterfront",
        "categoryAr": "واجهة بحرية",
        "descriptionEn": "The seafront the city lives on, best walked in the hour before sunset.",
        "descriptionAr": "الواجهة البحرية التي تعيش عليها المدينة، وأجمل وقت للمشي فيها الساعة التي تسبق الغروب."
      },
      {
        "nameEn": "Kemeraltı Bazaar",
        "nameAr": "بازار كمر ألتي",
        "categoryEn": "Market",
        "categoryAr": "سوق",
        "descriptionEn": "A working Ottoman market rather than a tourist one, with courtyards and coffee houses inside it.",
        "descriptionAr": "سوق عثماني عامل لا سوق سياح، بداخله أفنية ومقاهٍ."
      },
      {
        "nameEn": "Şirince village",
        "nameAr": "قرية شيرينجه",
        "categoryEn": "Village",
        "categoryAr": "قرية",
        "descriptionEn": "A hillside village above Selçuk, usually paired with Ephesus on the same day.",
        "descriptionAr": "قرية على سفح تل فوق سلجوق، وتُزار عادة مع أفسس في اليوم نفسه."
      }
    ],
    "dining": [
      {
        "nameEn": "Scappi",
        "nameAr": "سكابي",
        "cuisineEn": "Italian",
        "cuisineAr": "إيطالي",
        "descriptionEn": "On the ninth floor of the Swissôtel over the Kordon, and on the MICHELIN Guide's recommended list for 2026.",
        "descriptionAr": "في الطابق التاسع من سويس أوتيل فوق كوردون، وضمن قائمة ميشلان الموصى بها لعام 2026."
      }
    ],
    "stay": [
      {
        "nameEn": "Swissôtel Büyük Efes, İzmir",
        "nameAr": "سويس أوتيل بويوك أفس إزمير",
        "descriptionEn": "Set in gardens in the commercial centre, overlooking the Kordon promenade.",
        "descriptionAr": "يقع وسط حدائق في المركز التجاري، ويطل على كورنيش كوردون.",
        "tier": "luxury"
      }
    ],
    "sampleDay": [
      {
        "timeEn": "Early morning",
        "timeAr": "الصباح الباكر",
        "placeEn": "Ephesus",
        "placeAr": "أفسس",
        "descriptionEn": "Drive down at opening, before the coach parties.",
        "descriptionAr": "انزل عند الافتتاح قبل وصول الحافلات السياحية."
      },
      {
        "timeEn": "Afternoon",
        "timeAr": "بعد الظهر",
        "placeEn": "Şirince",
        "placeAr": "شيرينجه",
        "descriptionEn": "Lunch up in the village on the way back.",
        "descriptionAr": "غداء في القرية في طريق العودة."
      },
      {
        "timeEn": "Evening",
        "timeAr": "المساء",
        "placeEn": "Kordon",
        "placeAr": "كوردون",
        "descriptionEn": "The seafront walk, then dinner in the city.",
        "descriptionAr": "المشي على الواجهة البحرية، ثم العشاء في المدينة."
      }
    ],
    "travelTips": [
      {
        "en": "Ephesus has two gates. Start at the upper one and walk down, so the whole site is downhill.",
        "ar": "لأفسس بوابتان. ابدأ من العليا وانزل مشيًا، فيكون الموقع كله في اتجاه الهبوط."
      }
    ]
  },
  "turkey/fethiye": {
    "attractions": [
      {
        "nameEn": "Ölüdeniz Blue Lagoon",
        "nameAr": "البحيرة الزرقاء أولودنيز",
        "categoryEn": "Beach",
        "categoryAr": "شاطئ",
        "descriptionEn": "The sheltered lagoon that appears on every poster of Türkiye, inside a protected park.",
        "descriptionAr": "البحيرة المحمية التي تظهر في كل ملصق عن تركيا، داخل محمية طبيعية."
      },
      {
        "nameEn": "Paragliding from Babadağ",
        "nameAr": "الطيران الشراعي من بابا داغ",
        "categoryEn": "Adventure",
        "categoryAr": "مغامرة",
        "descriptionEn": "Tandem flights off a 1,900-metre mountain, landing on the beach at Ölüdeniz. Weather-dependent.",
        "descriptionAr": "طيران ثنائي من جبل بارتفاع 1900 متر، والهبوط على شاطئ أولودنيز. ومرهون بالطقس."
      },
      {
        "nameEn": "Butterfly Valley",
        "nameAr": "وادي الفراشات",
        "categoryEn": "Nature",
        "categoryAr": "طبيعة",
        "descriptionEn": "Reachable by boat from Ölüdeniz, a steep valley with a beach at the bottom.",
        "descriptionAr": "يُوصل إليه بالقارب من أولودنيز، وادٍ شديد الانحدار بشاطئ في أسفله."
      },
      {
        "nameEn": "Saklıkent Gorge",
        "nameAr": "مضيق ساكليكنت",
        "categoryEn": "Nature",
        "categoryAr": "طبيعة",
        "descriptionEn": "An 18km gorge you walk into through cold running water; wear something you can soak.",
        "descriptionAr": "مضيق بطول 18 كيلومترًا تمشي فيه عبر مياه جارية باردة؛ فالبس ما لا يهمك أن يبتل."
      }
    ],
    "dining": [],
    "stay": [
      {
        "nameEn": "Hillside Beach Club",
        "nameAr": "هيل سايد بيتش كلوب",
        "descriptionEn": "A resort in its own private bay outside Fethiye, pine-covered, with a private beach and a kids' club.",
        "descriptionAr": "منتجع في خليج خاص به خارج فتحية، تحيط به أشجار الصنوبر، بشاطئ خاص ونادٍ للأطفال.",
        "tier": "luxury"
      }
    ],
    "sampleDay": [
      {
        "timeEn": "Morning",
        "timeAr": "الصباح",
        "placeEn": "Ölüdeniz",
        "placeAr": "أولودنيز",
        "descriptionEn": "The lagoon early, before the day boats arrive.",
        "descriptionAr": "البحيرة مبكرًا، قبل وصول قوارب النهار."
      },
      {
        "timeEn": "Afternoon",
        "timeAr": "بعد الظهر",
        "placeEn": "Butterfly Valley",
        "placeAr": "وادي الفراشات",
        "descriptionEn": "By boat, with time to swim.",
        "descriptionAr": "بالقارب، مع وقت للسباحة."
      },
      {
        "timeEn": "Evening",
        "timeAr": "المساء",
        "placeEn": "Fethiye harbour",
        "placeAr": "مرفأ فتحية",
        "descriptionEn": "Fish dinner back in town.",
        "descriptionAr": "عشاء سمك في البلدة."
      }
    ],
    "travelTips": [
      {
        "en": "Fethiye is the start of the Lycian Way and the usual base for a blue cruise. Both are worth building the trip around.",
        "ar": "فتحية هي بداية درب ليكيا والقاعدة المعتادة للرحلة الزرقاء. وكلاهما يستحق أن تُبنى الرحلة حوله."
      }
    ]
  },
  "turkey/ankara": {
    "attractions": [
      {
        "nameEn": "Anıtkabir",
        "nameAr": "أنيتكابير",
        "categoryEn": "Memorial",
        "categoryAr": "نصب",
        "descriptionEn": "Atatürk's mausoleum and the museum beneath it, the single site every visitor to Ankara goes to.",
        "descriptionAr": "ضريح أتاتورك والمتحف الذي تحته، وهو الموقع الذي يقصده كل زائر لأنقرة."
      },
      {
        "nameEn": "Museum of Anatolian Civilizations",
        "nameAr": "متحف حضارات الأناضول",
        "categoryEn": "Museum",
        "categoryAr": "متحف",
        "descriptionEn": "Hittite, Phrygian and earlier, in a restored Ottoman bedesten. One of the country's best museums.",
        "descriptionAr": "الحثيون والفريجيون وما قبلهم، داخل بدستان عثماني مرمم. من أفضل متاحف البلاد."
      },
      {
        "nameEn": "Ankara Castle",
        "nameAr": "قلعة أنقرة",
        "categoryEn": "Castle",
        "categoryAr": "قلعة",
        "descriptionEn": "The old citadel above the city, with lanes of old houses inside the walls.",
        "descriptionAr": "القلعة القديمة فوق المدينة، وبداخل أسوارها أزقة من البيوت العتيقة."
      }
    ],
    "dining": [
      {
        "nameEn": "JW Steakhouse",
        "nameAr": "جيه دبليو ستيك هاوس",
        "cuisineEn": "Steakhouse",
        "cuisineAr": "ستيك هاوس",
        "descriptionEn": "The signature restaurant at the JW Marriott, the reliable choice for a formal dinner in the city.",
        "descriptionAr": "المطعم المميز في جيه دبليو ماريوت، والخيار الموثوق لعشاء رسمي في المدينة."
      }
    ],
    "stay": [
      {
        "nameEn": "JW Marriott Hotel Ankara",
        "nameAr": "جيه دبليو ماريوت أنقرة",
        "descriptionEn": "A large business hotel with a spa and indoor pool, and the city's most dependable standard.",
        "descriptionAr": "فندق أعمال كبير بمنتجع صحي ومسبح داخلي، وأكثر المستويات موثوقية في المدينة.",
        "tier": "luxury"
      }
    ],
    "sampleDay": [
      {
        "timeEn": "Morning",
        "timeAr": "الصباح",
        "placeEn": "Anıtkabir",
        "placeAr": "أنيتكابير",
        "descriptionEn": "Arrive for the changing of the guard.",
        "descriptionAr": "احضر عند تبديل الحرس."
      },
      {
        "timeEn": "Afternoon",
        "timeAr": "بعد الظهر",
        "placeEn": "Museum of Anatolian Civilizations",
        "placeAr": "متحف حضارات الأناضول",
        "descriptionEn": "Then the castle lanes just above it.",
        "descriptionAr": "ثم أزقة القلعة فوقه مباشرة."
      },
      {
        "timeEn": "Evening",
        "timeAr": "المساء",
        "placeEn": "Ankara Castle",
        "placeAr": "قلعة أنقرة",
        "descriptionEn": "Dinner up in the citadel for the view back over the city.",
        "descriptionAr": "عشاء في أعلى القلعة لرؤية المدينة من فوق."
      }
    ],
    "travelTips": [
      {
        "en": "Ankara is a capital rather than a resort. Two days covers it well, and it pairs naturally with Cappadocia by road or rail.",
        "ar": "أنقرة عاصمة لا منتجع. يومان يغطيانها جيدًا، وتُدمج طبيعيًا مع كابادوكيا برًا أو بالقطار."
      }
    ]
  },
  "turkey/bursa": {
    "attractions": [
      {
        "nameEn": "Grand Mosque (Ulu Cami)",
        "nameAr": "الجامع الكبير",
        "categoryEn": "Mosque",
        "categoryAr": "مسجد",
        "descriptionEn": "Twenty domes and some of the finest Ottoman calligraphy anywhere, in the middle of the old city.",
        "descriptionAr": "عشرون قبة وبعض أجمل الخط العثماني في أي مكان، في وسط المدينة القديمة."
      },
      {
        "nameEn": "Uludağ",
        "nameAr": "جبل أولوداغ",
        "categoryEn": "Mountain",
        "categoryAr": "جبل",
        "descriptionEn": "The mountain above the city, a cable car ride up, and Türkiye's best-known ski hill in winter.",
        "descriptionAr": "الجبل المطل على المدينة، يُصعد إليه بالتلفريك، وهو أشهر جبل تزلج في تركيا شتاءً."
      },
      {
        "nameEn": "Cumalıkızık village",
        "nameAr": "قرية جوماليكيزيك",
        "categoryEn": "Village",
        "categoryAr": "قرية",
        "descriptionEn": "A UNESCO-listed Ottoman village on the lower slopes, houses barely changed in six centuries.",
        "descriptionAr": "قرية عثمانية مدرجة في اليونسكو على السفوح السفلى، وبيوتها لم تتغير تقريبًا منذ ستة قرون."
      },
      {
        "nameEn": "Bursa thermal baths",
        "nameAr": "حمامات بورصة الحرارية",
        "categoryEn": "Thermal",
        "categoryAr": "حمامات معدنية",
        "descriptionEn": "The city has been a spa town since Roman times; the historic baths are in Çekirge.",
        "descriptionAr": "المدينة مصيف استشفائي منذ العهد الروماني؛ والحمامات التاريخية في تشكيرغه."
      }
    ],
    "dining": [
      {
        "nameEn": "Kebapçı İskender",
        "nameAr": "كبابجي إسكندر",
        "cuisineEn": "İskender kebab",
        "cuisineAr": "كباب إسكندر",
        "descriptionEn": "The dish was invented in Bursa and this family claims the original; it is the thing to eat here.",
        "descriptionAr": "الطبق ابتُكر في بورصة وتنسب هذه العائلة الأصل لنفسها؛ وهو ما يجب أن تأكله هنا."
      }
    ],
    "stay": [
      {
        "nameEn": "Çelik Palas",
        "nameAr": "تشيليك بالاس",
        "descriptionEn": "Built in 1935 on Atatürk's instruction and renovated since, with its own thermal pool and Turkish baths.",
        "descriptionAr": "بُني عام 1935 بأمر من أتاتورك ورُمم بعدها، وله مسبح حراري وحمامات تركية خاصة به.",
        "tier": "luxury"
      }
    ],
    "sampleDay": [
      {
        "timeEn": "Morning",
        "timeAr": "الصباح",
        "placeEn": "Grand Mosque",
        "placeAr": "الجامع الكبير",
        "descriptionEn": "The mosque and the covered market beside it.",
        "descriptionAr": "الجامع والسوق المسقوف بجانبه."
      },
      {
        "timeEn": "Midday",
        "timeAr": "منتصف النهار",
        "placeEn": "Kebapçı İskender",
        "placeAr": "كبابجي إسكندر",
        "descriptionEn": "İskender kebab where it was invented.",
        "descriptionAr": "كباب إسكندر في مكان ابتكاره."
      },
      {
        "timeEn": "Afternoon",
        "timeAr": "بعد الظهر",
        "placeEn": "Cumalıkızık",
        "placeAr": "جوماليكيزيك",
        "descriptionEn": "The Ottoman village on the way up the mountain.",
        "descriptionAr": "القرية العثمانية في الطريق صعودًا إلى الجبل."
      }
    ],
    "travelTips": [
      {
        "en": "Bursa is a comfortable day or overnight from Istanbul, and the fast ferry across the Sea of Marmara beats the road.",
        "ar": "بورصة على مسافة يوم أو ليلة مريحة من إسطنبول، والعبّارة السريعة عبر بحر مرمرة أفضل من الطريق البري."
      }
    ]
  },
  "turkey/trabzon": {
    "attractions": [
      {
        "nameEn": "Sümela Monastery",
        "nameAr": "دير سوميلا",
        "categoryEn": "Heritage",
        "categoryAr": "تراث",
        "descriptionEn": "A Greek Orthodox monastery built into a cliff face at 1,200 metres, about an hour from the city.",
        "descriptionAr": "دير أرثوذكسي يوناني مبني في وجه جرف على ارتفاع 1200 متر، على بعد نحو ساعة من المدينة."
      },
      {
        "nameEn": "Uzungöl",
        "nameAr": "أوزون غول",
        "categoryEn": "Lake",
        "categoryAr": "بحيرة",
        "descriptionEn": "A lake in a green valley with wooden houses around it, roughly 95km from Trabzon and busy in summer.",
        "descriptionAr": "بحيرة في وادٍ أخضر تحيط بها بيوت خشبية، على بعد نحو 95 كيلومترًا من طرابزون ومزدحمة صيفًا."
      },
      {
        "nameEn": "Hagia Sophia of Trabzon",
        "nameAr": "آيا صوفيا طرابزون",
        "categoryEn": "Heritage",
        "categoryAr": "تراث",
        "descriptionEn": "A thirteenth-century Byzantine church above the sea, with frescoes still in place.",
        "descriptionAr": "كنيسة بيزنطية من القرن الثالث عشر فوق البحر، ولا تزال جدارياتها في مكانها."
      },
      {
        "nameEn": "Atatürk Pavilion",
        "nameAr": "قصر أتاتورك",
        "categoryEn": "Museum",
        "categoryAr": "متحف",
        "descriptionEn": "A white mansion in gardens on the hill above town, kept as it was.",
        "descriptionAr": "قصر أبيض وسط حدائق على التل فوق البلدة، محفوظ كما كان."
      }
    ],
    "dining": [
      {
        "nameEn": "La Couronne d'Or",
        "nameAr": "لا كورون دور",
        "cuisineEn": "Fine dining",
        "cuisineAr": "مطبخ راقٍ",
        "descriptionEn": "The formal restaurant at the Zorlu Grand, the city's most dependable option for a proper dinner.",
        "descriptionAr": "المطعم الرسمي في زورلو غراند، وأكثر خيارات المدينة موثوقية لعشاء حقيقي."
      }
    ],
    "stay": [
      {
        "nameEn": "Zorlu Grand Hotel Trabzon",
        "nameAr": "زورلو غراند طرابزون",
        "descriptionEn": "In the city centre, the established five-star and the usual base for Sümela and Uzungöl trips.",
        "descriptionAr": "في وسط المدينة، الفندق الخمس نجوم الراسخ والقاعدة المعتادة لرحلات سوميلا وأوزون غول.",
        "tier": "luxury"
      }
    ],
    "sampleDay": [
      {
        "timeEn": "Morning",
        "timeAr": "الصباح",
        "placeEn": "Sümela Monastery",
        "placeAr": "دير سوميلا",
        "descriptionEn": "Go early; the cliff path is cooler and quieter.",
        "descriptionAr": "اذهب مبكرًا؛ فممر الجرف أبرد وأهدأ."
      },
      {
        "timeEn": "Afternoon",
        "timeAr": "بعد الظهر",
        "placeEn": "Uzungöl",
        "placeAr": "أوزون غول",
        "descriptionEn": "The lake and the valley around it.",
        "descriptionAr": "البحيرة والوادي المحيط بها."
      },
      {
        "timeEn": "Evening",
        "timeAr": "المساء",
        "placeEn": "Trabzon centre",
        "placeAr": "وسط طرابزون",
        "descriptionEn": "Back to the city for dinner.",
        "descriptionAr": "العودة إلى المدينة للعشاء."
      }
    ],
    "travelTips": [
      {
        "en": "The Black Sea coast is green because it rains, including in summer. Bring a light waterproof whatever the month.",
        "ar": "ساحل البحر الأسود أخضر لأنه ممطر، حتى في الصيف. احمل معطفًا خفيفًا مقاومًا للمطر في أي شهر."
      },
      {
        "en": "Sümela and Uzungöl are in opposite directions from the city. Give each its own day rather than trying to combine them.",
        "ar": "سوميلا وأوزون غول في اتجاهين متعاكسين من المدينة. خصّص لكل منهما يومًا بدل محاولة الجمع بينهما."
      }
    ]
  },
};

export const flagshipCityGuideBySlug = (countrySlug: string, citySlug: string) =>
  flagshipCityGuides[`${countrySlug}/${citySlug}`];

/**
 * A guide complete enough for the editorial flagship page.
 *
 * The page reads the story, the pull quote and the weather panel directly,
 * so a guide holding only AI grounding would render it half-empty. The
 * routes narrow with isEditorialGuide and fall back to the generic city
 * page, which is where every non-flagship city already lands.
 */
export type EditorialCityGuide = FlagshipCityGuide & {
  storyEn: string[];
  storyAr: string[];
  pullQuoteEn: string;
  pullQuoteAr: string;
  weather: NonNullable<FlagshipCityGuide["weather"]>;
};

export function isEditorialGuide(guide: FlagshipCityGuide | undefined): guide is EditorialCityGuide {
  return !!guide?.storyEn?.length && !!guide.storyAr?.length && !!guide.pullQuoteEn && !!guide.pullQuoteAr && !!guide.weather;
}

/** Every "country/city" pair we hold deep data for. */
export function flagshipCityKeys(): { countrySlug: string; citySlug: string }[] {
  return Object.keys(flagshipCityGuides).map((key) => {
    const [countrySlug, citySlug] = key.split("/");
    return { countrySlug, citySlug };
  });
}

/**
 * Which country a city belongs to, without being told.
 *
 * A published plan stores its city as a display label and no country, so
 * once the data covers more than one country something has to bridge that.
 * Adding a column would mean a migration on a live table for information we
 * can already derive, since the set of cities is curated by us.
 *
 * It relies on no two countries sharing a city name, which is not true of
 * the world (there is an Antalya in Turkey and a Tripoli in two countries)
 * but is true of a list we control. scripts/test-city-uniqueness.ts fails
 * the moment that stops holding, rather than letting a Turkish plan quietly
 * resolve to a Saudi city.
 */
export function flagshipCountryForCity(citySlug: string): string | null {
  const hits = flagshipCityKeys().filter((k) => k.citySlug === citySlug);
  return hits.length === 1 ? hits[0].countrySlug : null;
}
