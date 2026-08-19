// A trip can visit up to three cities (see docs/paid-plans-spec.md). The
// drafting pass ends a multi-stop plan with one machine-readable line:
//
//   STOPS: Riyadh=1, Jeddah=5
//
// naming the day each stop begins on. That is what lets the customer's page
// show the first day of every stop for free without having to guess where
// one city ends and the next starts.
//
// The line is written into the internal half of the draft, so it is already
// stripped from anything the customer sees by splitDraftForStorage. These
// helpers exist to read it and to belt-and-brace remove it.

export type PlanStop = { label: string; firstDay: number };

const STOPS_LINE = /^\s*STOPS:/i;

/**
 * Reads the stop markers out of the internal notes.
 *
 * Returning null is a safe outcome rather than a failure: the caller then
 * treats the plan as a single stop and shows only day one for free, which
 * errs toward showing less rather than accidentally giving away paid days.
 */
export function parseStopMarkers(internalText: string): PlanStop[] | null {
  if (!internalText) return null;
  const line = internalText.split(/\r?\n/).find((l) => STOPS_LINE.test(l));
  if (!line) return null;

  const stops = line
    .replace(STOPS_LINE, "")
    .split(",")
    .map((part) => {
      const [label, day] = part.split("=");
      const firstDay = Number(String(day ?? "").trim());
      if (!label?.trim() || !Number.isFinite(firstDay) || firstDay < 1) return null;
      return { label: label.trim(), firstDay };
    })
    .filter((stop): stop is PlanStop => stop !== null);

  return stops.length ? stops.sort((a, b) => a.firstDay - b.firstDay) : null;
}

/** The marker is tooling, not prose, so it never belongs in what a human reads. */
export function stripStopMarkers(text: string): string {
  if (!text) return text;
  return text
    .split(/\r?\n/)
    .filter((line) => !STOPS_LINE.test(line))
    .join("\n")
    .trim();
}

/**
 * Which day numbers are free to read before paying: the first day of every
 * stop. With no markers this is just day one.
 */
export function freeDayNumbers(stops: PlanStop[] | null): number[] {
  if (!stops?.length) return [1];
  return [...new Set(stops.map((s) => s.firstDay))].sort((a, b) => a - b);
}
