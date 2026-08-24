/**
 * How much of a city we show on the free page.
 *
 * The public city page is a taster, not the plan. Two hotels, two places and
 * two restaurants is enough to show we know the city and not enough to be the
 * answer somebody is paying us for.
 *
 * This lives on its own rather than inline in the page component for one
 * reason: the cap is a product decision, and a product decision that exists
 * only as a `.slice(0, 2)` buried in JSX is one nobody can find, test, or
 * change on purpose.
 *
 * It caps DISPLAY only. The full lists stay in the flagship data and still
 * reach the drafting pass, because that is what lets a plan match a hotel to
 * a stated budget or offer a step up a tier. Trimming the source to show less
 * on a free page would make the paid plan worse, which is backwards.
 */
export const PUBLIC_PREVIEW_MAX = 2;

export function publicPreview<T>(items: readonly T[] | undefined): T[] {
  return (items ?? []).slice(0, PUBLIC_PREVIEW_MAX);
}
