// Config for the re-warm cron, kept out of route.ts on purpose.
//
// A Next.js route file may only export the handlers and a fixed set of
// segment options. Exporting a plain constant from one type-errors the build
// ("Type 'string[]' is not assignable to type 'never'"), which is a slow way
// to find out, and this project has already lost four deploys to a route file
// that built locally and failed on the way out.

// The cities worth keeping permanently warm. Add one when it starts selling,
// not before: a cold city costs nothing until somebody books it, and this
// list is the only thing in the cron that spends money.
//
// The ten Saudi cities are here because they were warmed by hand for about
// $23 and nothing was scheduled to keep them that way, so all of it would
// have quietly expired thirty days later and had to be bought again. The five
// curated Saudi cities are deliberately absent: they never expire, and
// cacheResearch refuses to overwrite them, so listing one would schedule a
// purchase whose result is then thrown away.
export const KEEP_WARM = [
  // Türkiye, all nine. The seven beyond Istanbul and Cappadocia were being
  // warmed from a laptop and the laptop kept going to sleep mid-city, which
  // is the whole argument for doing this here instead: the cron runs on
  // Vercel, one city per run, and researchIsComplete means a city left
  // half-finished is picked up again rather than read as warm.
  "istanbul", "cappadocia", "antalya", "bodrum", "izmir",
  "fethiye", "ankara", "bursa", "trabzon",
  // The ten automated Saudi cities, warmed by hand for about $23.
  "abha", "al-ahsa", "al-jouf", "aseer", "dammam",
  "jazan", "red-sea", "tabuk", "taif", "yanbu",
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
// Daily runs therefore support six cities, and this list has twelve. Rather
// than weaken the spend guard or refresh earlier (which re-buys every city
// more often and costs real money), vercel.json runs this every six hours.
// Same spend per city per year, four times the drain rate.
//
//   safe list length = REFRESH_WHEN_DAYS_LEFT * runs per day + 1
//
// test-rewarm-capacity asserts this against the schedule in vercel.json,
// because the failure is silent: nothing errors, a city just goes cold and
// the next customer for it pays for research and waits for it.
export const RUNS_PER_DAY = 4;
export const KEEP_WARM_CAPACITY = REFRESH_WHEN_DAYS_LEFT * RUNS_PER_DAY + 1;
