# Curated city research

Hand-researched operational notes for the cities that carry the most traffic.
These are the source of truth for the rows in the `city_research_cache` table
that are flagged `curated = true`.

## Why these are hand-written

The AI draft generator can research a city itself (`researchOperationalFacts`
in `app/draft-guide.ts`) and caches the result for 30 days. That works fine for
low-traffic cities. For the big ones it's worth a human pass, because the
judgement calls matter and a web search alone gets them wrong:

- **Makkah is closed to non-Muslims**, enforced at checkpoints on the roads
  into the city, not just at the mosque. Madinah is the opposite since the
  2021 reforms: the city is open, mosque interiors are not. Conflating the two
  produces a booking that fails on arrival.
- **Review scores need their sample size.** "10.0/10" from 2 reviews is noise;
  7.5 from 7,100 is signal. These notes record both, and say so plainly.
- **Nothing is described as "licensed"** unless an actual government registry
  listing was found. A company's own site claiming it is not verification. The
  Transport General Authority (tga.gov.sa) regulates vehicle rental, but
  individual operators were not confirmed against it, so the notes say that
  rather than implying approval.

## How they get into the database

`curated = true` rows never expire and are never overwritten by the automated
pass (see `getCachedResearch` and `cacheResearch` in `app/draft-guide.ts`), so
editing a file here does not update the database on its own. To apply a change,
upsert the file contents into `city_research_cache` with `curated` set to true.

One file per city, named by city slug. Plain text, no markdown, matching the
format the drafting prompt expects.
