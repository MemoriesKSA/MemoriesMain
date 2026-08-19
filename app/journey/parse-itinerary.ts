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

// Matches the English "Day 1" and the Arabic "اليوم 1" / "اليوم ١". The
// Arabic draft is a customer-facing document, so it must not be forced to
// carry English headers just to keep this regex simple, the regex learns
// Arabic instead. Arabic-Indic digits (٠-٩) are accepted alongside Western
// ones in case the translation localises the numerals too.
const DAY_HEADING = /^(?:day|اليوم)\s*[\d٠-٩]+/i;
const LEADING_BULLET = /^[-*•–—]\s+/;
const LEADING_MARKDOWN_HEADING = /^#{1,6}\s+/;

// The paywall needs to know which day a heading belongs to so it can serve
// the free ones and withhold the rest, in either language. Returns null for
// any line that isn't a day heading at all.
export function dayNumberFromLine(rawLine: string): number | null {
  const line = rawLine.trim().replace(LEADING_MARKDOWN_HEADING, "");
  if (!DAY_HEADING.test(line)) return null;
  const digits = line.match(/[\d٠-٩]+/)?.[0];
  if (!digits) return null;
  // Normalise Arabic-Indic digits (٠-٩) to Western before parsing.
  const western = digits.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  const value = Number(western);
  return Number.isFinite(value) && value > 0 ? value : null;
}

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

// Two internal-only headings, split by who has to act: a question that
// needs the customer's own answer, versus something the team just has to
// go confirm or book with no customer involvement. Both keep matching the
// older single "Needs a decision before booking" heading too, in case a
// draft written under the previous prompt still uses it.
function isCustomerInputHeading(line: string) {
  const normalized = line.trim().replace(/[:：]\s*$/, "");
  if (/^needs the customer'?s? input$/i.test(normalized)) return true;
  if (/^needs a decision before booking$/i.test(normalized)) return true;
  return normalized.includes("رأي العميل") || (normalized.includes("قرار") && normalized.includes("الحجز"));
}

function isTeamConfirmHeading(line: string) {
  const normalized = line.trim().replace(/[:：]\s*$/, "");
  if (/^team to confirm before booking$/i.test(normalized)) return true;
  return normalized.includes("الفريق") && normalized.includes("تأكيد");
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
    if (isCustomerInputHeading(line) || isTeamConfirmHeading(line)) {
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
    if (isCustomerInputHeading(line) || isTeamConfirmHeading(line) || isPlannerHeading(line)) {
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
