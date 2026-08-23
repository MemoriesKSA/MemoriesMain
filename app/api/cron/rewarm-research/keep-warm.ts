// Config for the re-warm cron, kept out of route.ts on purpose.
//
// A Next.js route file may only export the handlers and a fixed set of
// segment options. Exporting a plain constant from one type-errors the build
// ("Type 'string[]' is not assignable to type 'never'"), which is a slow way
// to find out, and this project has already lost four deploys to a route file
// that built locally and failed on the way out.

// Every city we offer, minus the five curated Saudi ones.
//
// This list was deliberately narrow for most of its life - "add a city when it
// starts selling, not before" - because it is the only thing here that spends
// money. Widening it to everything is a real decision with a real price, so it
// is written down rather than left implicit: each city is refreshed roughly
// every 25 days at about $2, so 42 cities is on the order of $80 a month,
// forever, whether or not anybody books them.
//
// What that buys is that no customer ever gets the thin version. A cold city
// still produces a publishable, CLEAN draft - measured on Antalya - but
// research inside a request only gets RESEARCH_DEADLINE_MS, so it lands two or
// three categories out of six and hands the reviewer four things to confirm by
// hand. Warm means the plan answers them itself.
//
// The five curated Saudi cities are absent and must stay absent: they never
// expire, and cacheResearch refuses to overwrite them, so listing one would
// schedule a purchase whose result is then thrown away.
//
// Still hand-written rather than derived from the catalogue. Deriving it would
// mean adding a city to the site silently adds recurring spend, and silent
// spend is the failure mode this whole file exists to prevent.
export const KEEP_WARM = [
  // Saudi Arabia, the ten automated ones
  "red-sea", "abha", "aseer", "taif", "al-ahsa", "jazan", "al-jouf", "dammam", "tabuk", "yanbu",
  // Türkiye
  "istanbul", "cappadocia", "antalya", "bodrum", "izmir", "fethiye", "ankara", "bursa", "trabzon",
  // Thailand
  "bangkok", "phuket", "chiang-mai", "krabi", "koh-samui", "pattaya",
  // Malaysia
  "kuala-lumpur", "penang", "langkawi", "malacca", "kota-kinabalu", "cameron-highlands",
  // Georgia
  "tbilisi", "batumi", "kazbegi", "kutaisi", "borjomi", "mtskheta",
  // Russia
  "moscow", "saint-petersburg", "kazan", "sochi", "kaliningrad",
];

// Refresh a few days before expiry rather than after, so there is no window
// where a customer arrives to find a listed city cold.
export const REFRESH_WHEN_DAYS_LEFT = 5;

// How many cities this can keep warm, which is not "as many as you list".
//
// One city per run is the spend guard and it stays. What that costs is queue
// throughput: when several cities come due together they are refreshed one at
// a time, so the last one waits (list length / runs per day) days past the
// moment it became due. It goes cold if that wait exceeds the margin above.
//
//   safe list length = REFRESH_WHEN_DAYS_LEFT * runs per day + 1
//
// Forty-two cities needs at least nine runs a day, so vercel.json runs this
// every two hours. Frequency is close to free - a run with nothing due reads
// one table and returns - so only the list length above costs anything.
//
// test-rewarm-capacity asserts this against the real schedule in vercel.json,
// because the failure is silent: nothing errors, a city just goes cold and the
// next customer for it pays for research and waits for it.
export const RUNS_PER_DAY = 12;
export const KEEP_WARM_CAPACITY = REFRESH_WHEN_DAYS_LEFT * RUNS_PER_DAY + 1;
