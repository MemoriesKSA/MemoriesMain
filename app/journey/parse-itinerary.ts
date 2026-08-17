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
const LEADING_MARKDOWN_HEADING = /^#{1,6}\s+/;

// The draft is instructed to write plain text with no markdown, but the
// model doesn't always hold to that. Strip a leading "## " before matching
// or storing a line, otherwise "## Day 1" and "## Needs a decision before
// booking" silently fail every heading check below, and the whole internal
// section ends up misclassified as customer-facing content.
function cleanLine(line: string) {
  return line.replace(LEADING_MARKDOWN_HEADING, "");
}

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
  if (!rawLines.some((line) => DAY_HEADING.test(cleanLine(line.trim())))) return null;

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
    const line = cleanLine(rawLine.trim());

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

// Separates the customer-facing plan (overview + days) from the internal-only
// planning notes ("Needs a decision before booking" / "For the planner"),
// by the same heading rules as parseItinerary above, but returning raw text
// spans instead of structured sections. Used at draft-generation time so the
// internal notes never end up stored in the itinerary_en/itinerary_ar
// columns that get shown to the customer verbatim once published, they only
// belong in the proposal's separate internal notes field.
export function splitDraftForStorage(text: string): { customerFacing: string; internalOnly: string } {
  const rawLines = text.split(/\r?\n/);
  const customer: string[] = [];
  const internal: string[] = [];
  let mode: "customer" | "internal" = "customer";

  for (const rawLine of rawLines) {
    const line = cleanLine(rawLine.trim());
    if (isDecisionsHeading(line) || isPlannerHeading(line)) {
      mode = "internal";
      internal.push(line);
      continue;
    }
    if (DAY_HEADING.test(line)) mode = "customer";
    (mode === "customer" ? customer : internal).push(line);
  }

  return {
    customerFacing: customer.join("\n").trim(),
    internalOnly: internal.join("\n").trim(),
  };
}
