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
// The English headings are anchored, so only a line that IS the heading
// matches. The Arabic ones could not be anchored the same way, because the
// translation is free to word them slightly differently, so they matched on
// keywords anywhere in the line. That is the difference between "is this the
// heading" and "does this line mention the heading", and a real Tokyo draft
// found the gap: the Arabic wrote, mid-paragraph and in quotation marks,
// "وقد أُدرجت تحت "على الفريق تأكيده قبل الحجز"" - it has been listed under
// "Team to confirm before booking" - which contains both keywords.
//
// splitDraftForStorage saw a heading, switched to internal, and only a day
// heading switches it back. A study plan has no day headings. So everything
// after that sentence went into the planner's notes: the customer's Arabic
// plan was 995 characters against 29,092 of English, missing the universities,
// the visa route and the costs, and nothing anywhere said so.
//
// A heading also has to LOOK like one. Short, no sentence-ending punctuation,
// no quotation marks. Prose that mentions a heading is prose.
const HEADING_MAX_CHARS = 60;
const SENTENCE_END = /[.。؟?!！]\s*$/;
const QUOTED = /["'«»“”‘’]/;

function looksLikeHeadingLine(normalized: string) {
  return normalized.length > 0 && normalized.length <= HEADING_MAX_CHARS && !SENTENCE_END.test(normalized) && !QUOTED.test(normalized);
}

function isCustomerInputHeading(line: string) {
  const normalized = line.trim().replace(/[:：]\s*$/, "");
  if (/^needs the customer'?s? input$/i.test(normalized)) return true;
  if (/^needs a decision before booking$/i.test(normalized)) return true;
  if (!looksLikeHeadingLine(normalized)) return false;
  return normalized.includes("رأي العميل") || (normalized.includes("قرار") && normalized.includes("الحجز"));
}

function isTeamConfirmHeading(line: string) {
  const normalized = line.trim().replace(/[:：]\s*$/, "");
  if (/^team to confirm before booking$/i.test(normalized)) return true;
  if (!looksLikeHeadingLine(normalized)) return false;
  return normalized.includes("الفريق") && normalized.includes("تأكيد");
}

function isPlannerHeading(line: string) {
  const normalized = line.trim().replace(/[:：]\s*$/, "");
  if (/^for the planner$/i.test(normalized)) return true;
  if (!looksLikeHeadingLine(normalized)) return false;
  return normalized.includes("للمخطط");
}

export function parseItinerary(text: string): ItinerarySection[] | null {
  const rawLines = text.split(/\r?\n/);

  // A day heading used to be required, and anything without one fell through
  // to the raw pre-wrap fallback. That was fine while every plan was a trip.
  //
  // A study plan has no days by design - it is a consultation, and the study
  // brief forbids a "Day 1" heading precisely so the paywall does not treat
  // one as an itinerary. The result was that the rule protecting the paywall
  // sent every study plan to the unstyled fallback: no card, no gold section
  // headings, no bullets, just a wall of pre-wrapped text next to a tourism
  // plan that looked finished.
  //
  // So a day-less document is now parsed as overview groups, which is exactly
  // what it is. Nothing is hidden that was not hidden before: the same
  // heading rules apply, and returning null below still catches text with no
  // recognisable structure at all.
  const hasDays = rawLines.some((line) => DAY_HEADING.test(cleanLine(line.trim())));
  const hasContent = rawLines.filter((line) => line.trim()).length >= 3;
  if (!hasDays && !hasContent) return null;

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

// A short mini-label like "Where you'll stay" or "Getting around". Used only
// for light visual styling, never changes what text is shown.
//
// A heading is not always in the same block as the text beneath it. The
// drafts leave a blank line under it, which made it a group of one, which
// failed the `length > 1` test, so every overview heading fell through and
// rendered as ordinary body text: the gold styling on the other side of this
// function was simply never reached. Both shapes count now.
const looksLikeOverviewHeading = (line: string) => !!line && line.length <= 44 && !/[.!?؟]$/.test(line);

export function splitOverviewGroup(group: string[]): { label: string | null; lines: string[] } {
  if (group.length > 1 && looksLikeOverviewHeading(group[0])) {
    return { label: group[0], lines: group.slice(1) };
  }
  // A heading standing alone, its paragraph having become the next group.
  if (group.length === 1 && looksLikeOverviewHeading(group[0])) {
    return { label: group[0], lines: [] };
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
    // Belt and braces on the machine lines. STOPS / PICKS / PLACES are written
    // after "For the planner", so the heading rules above already land them in
    // the internal half. But a draft that forgets the heading, or writes one a
    // line early, would print "PICKS: Jodd Fairs Ratchada | ..." straight at
    // the customer. They are tooling, so strip them from the customer half
    // wherever they ended up, and never from the internal half, which is where
    // they are read back from.
    customerFacing: customer.filter((line) => !MACHINE_LINE.test(line)).join("\n").trim(),
    internalOnly: internal.join("\n").trim(),
  };
}

// The machine-readable lines the drafting pass appends for our own tooling.
const MACHINE_LINE = /^\s*(STOPS|PICKS|PLACES):/i;
