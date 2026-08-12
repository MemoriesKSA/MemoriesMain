import type { DestinationRegion } from "../data";

export type DestinationAr = {
  slug: string;
  name: string;
  country: string;
  region: DestinationRegion;
  image: string;
  blurb: string;
  description: string;
  bestFor: string;
  duration: string;
  featured?: boolean;
};

export const destinationsAr: DestinationAr[] = [
  { slug: "alula", name: "العلا", country: "المملكة العربية السعودية", region: "saudi", image: "/images/alula.webp", blurb: "حكايات عريقة نحتها الزمن في الصخر.", description: "تجوّل بين التاريخ الحي والأودية المهيبة ومخيمات الصحراء تحت النجوم.", bestFor: "الثقافة والدهشة", duration: "٤–٦ أيام", featured: true },
  { slug: "riyadh", name: "الرياض", country: "المملكة العربية السعودية", region: "saudi", image: "/images/destinations/riyadh.png", blurb: "ثقافة نابضة ومطاعم مميزة وآفاق صحراوية.", description: "اكتشف عاصمة تجمع طاقة السعودية الحديثة مع تراث الدرعية وتجارب الطعام ورحلات الصحراء.", bestFor: "الثقافة وحياة المدينة", duration: "٣–٥ أيام", featured: true },
  { slug: "jeddah-red-sea", name: "جدة والبحر الأحمر", country: "المملكة العربية السعودية", region: "saudi", image: "/images/destinations/jeddah-red-sea.png", blurb: "شوارع تاريخية تلتقي بساحل أزرق بديع.", description: "اجمع بين أزقة البلد ومبانيها المرجانية ومطاعم الواجهة البحرية وأيام الجزر وجمال البحر الأحمر.", bestFor: "الساحل والتراث", duration: "٤–٧ أيام", featured: true },
  { slug: "abha-aseer", name: "أبها وعسير", country: "المملكة العربية السعودية", region: "saudi", image: "/images/destinations/abha-aseer.png", blurb: "جبال باردة ووديان خضراء وتراث حي.", description: "استكشف القمم الضبابية والقرى الملوّنة والنكهات المحلية وثقافة مرتفعات جنوب المملكة.", bestFor: "الطبيعة والثقافة", duration: "٤–٦ أيام" },
  { slug: "uae", name: "الإمارات العربية المتحدة", country: "الإمارات العربية المتحدة", region: "middle-east", image: "/images/destinations/uae.png", blurb: "مدن مستقبلية وهدوء الصحراء وبحار دافئة.", description: "اجمع بين حيوية دبي وثقافة أبوظبي وإقامة هادئة في الصحراء أو على الساحل.", bestFor: "الفخامة والعائلات", duration: "٤–٧ أيام", featured: true },
  { slug: "istanbul", name: "تركيا", country: "تركيا", region: "middle-east", image: "/images/istanbul.webp", blurb: "سواحل ومدن وحكايات تمتد بين قارتين.", description: "من ضفاف إسطنبول إلى كابادوكيا والريفيرا، تمنحك تركيا تنوعًا من الثقافة والمذاق والطبيعة.", bestFor: "المذاق والسواحل والتراث", duration: "٧–١٢ يومًا", featured: true },
  { slug: "paris", name: "باريس", country: "فرنسا", region: "europe", image: "/images/paris.webp", blurb: "جمال خالد وثقافة وفن ورومانسية.", description: "الفن والأناقة والمذاق الفرنسي في رحلة مدينة مصممة بسلاسة حولك.", bestFor: "الثقافة والمطاعم", duration: "٤–٧ أيام", featured: true },
  { slug: "switzerland", name: "سويسرا", country: "سويسرا", region: "europe", image: "/images/switzerland.webp", blurb: "هواء الألب وبحيرات ومشاهد لا تُنسى.", description: "قمم الألب وقطارات بانورامية وإقامات هادئة على البحيرات تناسب جميع الأجيال.", bestFor: "الطبيعة والعائلات", duration: "٧–١٠ أيام", featured: true },
  { slug: "london", name: "لندن", country: "المملكة المتحدة", region: "europe", image: "/images/destinations/london.png", blurb: "معالم شهيرة ومسرح وأحياء مليئة بالاكتشاف.", description: "إقامة أنيقة حول المتاحف والتسوق وكرة القدم والمسرح والأحياء التي تجعل لندن شخصية لك.", bestFor: "العائلات والثقافة", duration: "٥–٨ أيام", featured: true },
  { slug: "italy", name: "إيطاليا", country: "إيطاليا", region: "europe", image: "/images/destinations/italy.png", blurb: "مدن فنية وسواحل جميلة وموائد لا تُنسى.", description: "تنقّل على مهل بين روما وفلورنسا والبندقية والبحيرات أو الساحل مع ربط كل إقامة وانتقال بعناية.", bestFor: "الطعام والفن والرومانسية", duration: "٨–١٤ يومًا", featured: true },
  { slug: "spain", name: "إسبانيا", country: "إسبانيا", region: "europe", image: "/images/destinations/spain.png", blurb: "مدن ملوّنة وإيقاع متوسطي.", description: "اجمع بين تصميم برشلونة وطاقة مدريد وتاريخ الأندلس وأيام هادئة بجوار المتوسط.", bestFor: "الثقافة والساحل", duration: "٧–١٢ يومًا" },
  { slug: "austria", name: "النمسا", country: "النمسا", region: "europe", image: "/images/destinations/austria.png", blurb: "أناقة إمبراطورية وبحيرات ألبية ساحرة.", description: "اربط موسيقى فيينا وعمارتها بسالزبورغ وقرى البحيرات والمشاهد الجبلية.", bestFor: "الموسيقى والطبيعة", duration: "٦–١٠ أيام" },
  { slug: "greece", name: "اليونان", country: "اليونان", region: "europe", image: "/images/destinations/greece.png", blurb: "جزر مشمسة وحكايات عريقة وزرقة إيجة.", description: "وازن بين تراث أثينا ووقت خاص في الجزر والنكهات الساحلية وإقامات مختارة فوق بحر إيجة.", bestFor: "الجزر والتاريخ", duration: "٧–١٢ يومًا" },
  { slug: "japan", name: "اليابان", country: "اليابان", region: "asia", image: "/images/destinations/japan.png", blurb: "تقاليد هادئة ومدن حديثة مبهرة.", description: "انتقل بسلاسة من طاقة طوكيو إلى معابد كيوتو والمشاهد الموسمية والضيافة المتقنة.", bestFor: "الثقافة والاكتشاف", duration: "١٠–١٤ يومًا", featured: true },
  { slug: "thailand", name: "تايلاند", country: "تايلاند", region: "asia", image: "/images/destinations/thailand.png", blurb: "مدن حيوية وضيافة دافئة وهدوء الجزر.", description: "اجمع بين نكهات بانكوك وثقافة الشمال وإقامة شاطئية جميلة في بوكيت أو كرابي أو كوه ساموي.", bestFor: "الطعام والشواطئ", duration: "٨–١٤ يومًا" },
  { slug: "indonesia", name: "إندونيسيا", country: "إندونيسيا", region: "asia", image: "/images/destinations/indonesia.png", blurb: "جمال استوائي وثقافة عميقة وإقامات مريحة.", description: "اكتشف معابد بالي ومدرجات الأرز والشواطئ أو اذهب أبعد في رحلة تتمحور حول الطبيعة والعافية.", bestFor: "العافية والطبيعة", duration: "٨–١٣ يومًا" },
  { slug: "maldives", name: "المالديف", country: "المالديف", region: "islands", image: "/images/maldives.webp", blurb: "مياه صافية وخصوصية وهدوء بلا حدود.", description: "هدوء الجزر الخاصة وبحيرات فيروزية ووقت عائلي بعيد عن كل استعجال.", bestFor: "الشاطئ والخصوصية", duration: "٥–٨ أيام", featured: true },
  { slug: "united-states", name: "الولايات المتحدة", country: "الولايات المتحدة", region: "north-america", image: "/images/destinations/united-states.png", blurb: "طاقة المدن ومساحات طبيعية مذهلة.", description: "صمّم إجازة مدينة أو رحلة عائلية أو طريقًا ساحليًا أو مغامرة في المتنزهات الوطنية.", bestFor: "المدن والرحلات البرية", duration: "١٠–١٨ يومًا" },
  { slug: "canada", name: "كندا", country: "كندا", region: "north-america", image: "/images/destinations/canada.png", blurb: "بحيرات فيروزية وهواء جبلي ومدن ترحّب بك.", description: "اجمع فانكوفر أو تورونتو مع الروكي أو القطارات البانورامية أو الطبيعة الواسعة بإيقاع مريح.", bestFor: "الطبيعة والعائلات", duration: "١٠–١٦ يومًا" },
  { slug: "australia", name: "أستراليا", country: "أستراليا", region: "oceania", image: "/images/destinations/australia.png", blurb: "مدن بحرية وحياة فطرية وسواحل ممتدة.", description: "اربط سيدني وملبورن والحاجز المرجاني والمشاهد الأسترالية في رحلة بعيدة متوازنة.", bestFor: "الساحل والمغامرة", duration: "١٢–١٨ يومًا" },
];

export const featuredDestinationsAr = destinationsAr.filter((destination) => destination.featured);
