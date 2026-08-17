// Turns the plain-text itinerary draft (see buildSystemPrompt in
// app/draft-guide.ts, which fixes these exact section names so parsing them
// back out is reliable) into structured sections for the day-card layout on
// the customer page. Falls back to rendering nothing structured if a draft
// doesn't contain any "Day N" heading, e.g. text a reviewer wrote by hand in
// a different shape, the raw-text fallback in the page component handles that.

export type ItinerarySection =
  | { kind: "overview"; groups: string[][] }
  | { kind: "day"; title: string; lines: string[] }
  | { kind: "decisions"; title: string; lines: string[] }
  | { kind: "notes"; title: string; lines: string[] };

const DAY_HEADING = /^day\s*\d+\b/i;
const LEADING_BULLET = /^[-*•–—]\s+/;

// The draft is instructed to write plain lines, but the model still writes
// its own "- " prefix sometimes. Strip it since the day-card view adds its
// own bullet marker, a line kept as-is would show two.
function stripBulletMarker(line: string) {
  return line.replace(LEADING_BULLET, "");
}

function isDecisionsHeading(line: string) {
  const normalized = line.trim().replace(/[:：]\s*$/, "");
  if (/^needs a decision before booking$/i.test(normalized)) return true;
  return normalized.includes("قرار") && normalized.includes("الحجز");
}

function isPlannerHeading(line: string) {
  const normalized = line.trim().replace(/[:：]\s*$/, "");
  if (/^for the planner$/i.test(normalized)) return true;
  return normalized === "للمخطط" || normalized.includes("للمخطط");
}

export function parseItinerary(text: string): ItinerarySection[] | null {
  const rawLines = text.split(/\r?\n/);
  if (!rawLines.some((line) => DAY_HEADING.test(line.trim()))) return null;

  const sections: ItinerarySection[] = [];
  let overviewGroups: string[][] = [];
  let currentGroup: string[] = [];
  let current: { kind: "day" | "decisions" | "notes"; title: string; lines: string[] } | null = null;

  function flushOverviewGroup() {
    if (currentGroup.length) overviewGroups.push(currentGroup);
    currentGroup = [];
  }

  function flushCurrent() {
    if (current) sections.push(current);
    current = null;
  }

  for (const rawLine of rawLines) {
    const line = rawLine.trim();

    if (!line) {
      if (!current) flushOverviewGroup();
      continue;
    }

    if (DAY_HEADING.test(line)) {
      flushOverviewGroup();
      flushCurrent();
      current = { kind: "day", title: line, lines: [] };
      continue;
    }
    if (isDecisionsHeading(line)) {
      flushOverviewGroup();
      flushCurrent();
      current = { kind: "decisions", title: line, lines: [] };
      continue;
    }
    if (isPlannerHeading(line)) {
      flushOverviewGroup();
      flushCurrent();
      current = { kind: "notes", title: line, lines: [] };
      continue;
    }

    if (current) current.lines.push(stripBulletMarker(line));
    else currentGroup.push(stripBulletMarker(line));
  }
  flushOverviewGroup();
  flushCurrent();

  if (overviewGroups.length) sections.unshift({ kind: "overview", groups: overviewGroups });

  return sections;
}

// A short mini-label like "Hotel pick" or "Driver pick" is a standalone
// short line immediately followed by more lines in the same paragraph group.
// Used only for light visual styling, never changes what text is shown.
export function splitOverviewGroup(group: string[]): { label: string | null; lines: string[] } {
  if (group.length > 1 && group[0].length <= 40 && !/[.!?]$/.test(group[0])) {
    return { label: group[0], lines: group.slice(1) };
  }
  return { label: null, lines: group };
}
