// A city's picture lives at /images/cities/<country>/<city>.webp, unless it is
// swapped here. AlUla shows Habib's winter season picture ("حيّ الشتاء العلا",
// 13 Nov 2026) on its cards.
const CITY_IMAGE: Record<string, string> = {
  "saudi-arabia/alula": "/images/cities/saudi-arabia/alula-winter.webp",
};

export const cityImagePath = (country: string, city: string) =>
  CITY_IMAGE[`${country}/${city}`] ?? `/images/cities/${country}/${city}.webp`;

// A city page's top banner is a wide strip with the page's own title over it.
// A picture with words in it gets cut off there and sits under the title, so
// the banner keeps the plain photo of the same place.
const HERO_PHOTO: Record<string, string> = {
  "/images/cities/saudi-arabia/alula-winter.webp": "/images/cities/saudi-arabia/alula.webp",
};

export const cityHeroImage = (image: string) => HERO_PHOTO[image] ?? image;
