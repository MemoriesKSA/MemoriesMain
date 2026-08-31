import type { CSSProperties, ReactNode } from "react";
import { parseItinerary, splitOverviewGroup } from "./parse-itinerary";
import { mapsSearchUrl, placeMatchPattern } from "./place-links";
import { REDACTION_PATTERN, type LockedDay } from "./paywall";
import { UNLOCK_ANCHOR } from "./plan-unlock";

// Filler for the blurred blocks. Deliberately meaningless: the real words
// never leave the server (see paywall.ts), only the measurements do, and the
// browser draws to those measurements. Blurred at this radius nothing is
// legible, but the block has the rhythm and ragged edge of real prose, which
// is the whole point of showing it rather than an empty placeholder.
const FILLER_WORDS = "morning coffee before the drive across town and a slow lunch beside the water then an easy evening walk through the old quarter with time to sit".split(" ");

// Arabic filler for the Arabic half. English words blurred inside an RTL
// page still read as the wrong script: Latin letters sit at a different
// density and run the other way, so the block looks foreign even when no
// individual word is legible.
const FILLER_WORDS_AR = "صباح هادئ قبل التوجه إلى وسط المدينة ثم غداء على مهل قرب الماء وبعدها نزهة مسائية سهلة في الحي القديم مع وقت للجلوس".split(" ");

function fillerLine(length: number, seed: number, ar = false): string {
  const words = ar ? FILLER_WORDS_AR : FILLER_WORDS;
  let out = "";
  let i = seed % words.length;
  while (out.length < length) {
    out += (out ? " " : "") + words[i % words.length];
    i++;
  }
  return out.slice(0, length);
}

const blurredTextStyle: CSSProperties = {
  filter: "blur(4.5px)",
  userSelect: "none",
  pointerEvents: "none",
  color: "var(--ink-2)",
};

// A withheld name inside otherwise readable prose: the hotel we picked, with
// every reason for picking it left visible around it.
function BlurredName({ length, ar }: { length: number; ar?: boolean }) {
  return (
    <span
      aria-label="hidden until unlocked"
      style={{
        ...blurredTextStyle,
        display: "inline-block",
        verticalAlign: "baseline",
        fontWeight: 600,
        color: "var(--gold)",
      }}
    >
      {fillerLine(Math.max(6, Math.min(length, 40)), length, ar)}
    </span>
  );
}

// Turns the server's redaction markers into blurred pills. Everything else
// passes through as the plain string it already was.
function renderRedactions(text: string, keyPrefix: string, ar?: boolean): ReactNode {
  const pattern = new RegExp(REDACTION_PATTERN.source, "g");
  if (!pattern.test(text)) return text;
  pattern.lastIndex = 0;

  const out: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    out.push(<BlurredName key={`${keyPrefix}-r${match.index}`} length={Number(match[1])} ar={ar} />);
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cardStyle: CSSProperties = { background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 14, padding: "22px 24px" };

const placeLinkStyle: CSSProperties = {
  color: "var(--gold)",
  textDecoration: "underline",
  textDecorationThickness: 1,
  textUnderlineOffset: 3,
  fontWeight: 600,
};

// Wraps any of this city's real place names, wherever they appear in a line,
// in a link to a Maps search for that place. Names arrive longest-first (see
// placeNamesForCity) so the alternation matches the fullest name rather than
// a fragment of it. Anything not in the curated list is left as plain text,
// we never try to guess at place names in prose.
function linkifyPlaces(text: string, places: string[], cityLabel: string, officialUrls: Record<string, string>, placeCities?: Record<string, string>, placeKinds?: Record<string, string>, ar?: boolean): ReactNode {
  // Redactions are handled even when there is nothing to link, otherwise a
  // line whose only notable content was the hidden hotel would print the
  // raw marker at the reader.
  if (!places.length) return renderRedactions(text, "p", ar);
  // Word-bounded, or a name matches inside a longer word: a Riyadh plan linked
  // National inside "international" twice in one sentence, and an Arabic one
  // linked Deira inside "جديرة".
  const pattern = placeMatchPattern(places);
  if (!pattern) return renderRedactions(text, "p", ar);
  const parts = text.split(pattern);
  if (parts.length === 1) return renderRedactions(text, "p", ar);

  const lookup = new Set(places.map((p) => p.toLowerCase()));
  return parts.map((part, i) =>
    lookup.has(part.toLowerCase()) ? (
      <a key={i} href={officialUrls[part.toLowerCase()] ?? mapsSearchUrl(part, placeCities?.[part.toLowerCase()] ?? cityLabel, "", placeKinds?.[part.toLowerCase()] ?? "")} target="_blank" rel="noopener noreferrer" style={placeLinkStyle}>
        {part}
      </a>
    ) : (
      <span key={i}>{renderRedactions(part, `p${i}`, ar)}</span>
    ),
  );
}

// A line the draft wrote as a labelled item rather than as prose: "Food:
// roughly 1,000-1,500 per person per day", "Bangkok tickets: Grand Palace 500
// THB each". The draft is plain text with no markdown by design, so the shape
// is all we have to go on, and these read as a list whatever the renderer
// does with them. Rendering them as separate paragraphs made "Where the
// budget goes" a wall of six unrelated sentences.
//
// Deliberately tight, because the alternative failure is bulleting ordinary
// prose: the label must be short, must come first, and must not be a time of
// day (those already lead the day lines) or a sentence that merely contains a
// colon somewhere.
const LABELLED_ITEM = /^[^:\n]{2,34}:\s+\S/;

function isLabelledItem(line: string): boolean {
  const trimmed = line.trim();
  if (!LABELLED_ITEM.test(trimmed)) return false;
  // "09:00 — Topkapi" and "Evening: dinner at..." both start a day line, and
  // the day list already bullets those.
  if (/^\d{1,2}:\d{2}/.test(trimmed)) return false;
  return true;
}

/**
 * Splits an overview group into runs of prose and runs of labelled items, so
 * a section that is really a list renders as one.
 *
 * A single labelled line on its own is left as prose: one "Bangkok: The Siam"
 * under a heading is a sentence, not a list, and bulleting it just adds a dot.
 * Two or more in a row is a list and reads far better as one.
 */
export function groupOverviewLines(lines: string[]): { kind: "prose" | "items"; lines: string[] }[] {
  const blocks: { kind: "prose" | "items"; lines: string[] }[] = [];
  for (const line of lines) {
    const kind = isLabelledItem(line) ? "items" : "prose";
    const last = blocks[blocks.length - 1];
    if (last && last.kind === kind) last.lines.push(line);
    else blocks.push({ kind, lines: [line] });
  }
  // A lone "item" is a sentence that happens to carry a colon ("One trap to
  // avoid: Bangkok's two airports..."), so demote it. Then merge neighbours,
  // because a demoted line sitting between two prose blocks should join them
  // rather than leave the caller three blocks that all render identically.
  const demoted = blocks.map((b) => (b.kind === "items" && b.lines.length < 2 ? { kind: "prose" as const, lines: b.lines } : b));
  const merged: { kind: "prose" | "items"; lines: string[] }[] = [];
  for (const block of demoted) {
    const last = merged[merged.length - 1];
    if (last && last.kind === block.kind) last.lines.push(...block.lines);
    else merged.push({ kind: block.kind, lines: [...block.lines] });
  }
  return merged;
}

function BulletLines({ lines, places, cityLabel, officialUrls, placeCities, placeKinds, ar }: { lines: string[]; places: string[]; cityLabel: string; officialUrls: Record<string, string>; placeCities?: Record<string, string>; placeKinds?: Record<string, string>; ar?: boolean }) {
  return (
    <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "grid", gap: 9 }}>
      {lines.map((line, i) => (
        <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 15, lineHeight: 1.7, color: "var(--ink-2)" }}>
          <span style={{ flexShrink: 0, width: 6, height: 6, marginTop: 9, borderRadius: "50%", background: "var(--gold)" }} />
          <span>{linkifyPlaces(line, places, cityLabel, officialUrls, placeCities, placeKinds, ar)}</span>
        </li>
      ))}
    </ul>
  );
}

// Renders the plain-text AI draft (see app/draft-guide.ts) as clear, scannable
// per-day cards instead of one dense wall of text. Falls back to the raw text
// unchanged if it doesn't match the expected shape (e.g. a reviewer typed
// something free-form), so this never hides content it can't confidently
// restructure.
export function ItineraryView({ text, places = [], cityLabel = "", officialUrls = {}, placeCities = {}, placeKinds = {}, lockedDays = [], ar = false }: { text: string; places?: string[]; cityLabel?: string; officialUrls?: Record<string, string>; placeCities?: Record<string, string>; placeKinds?: Record<string, string>; lockedDays?: LockedDay[]; ar?: boolean }) {
  const parsed = parseItinerary(text);
  if (!parsed) {
    return <div style={{ color: "var(--ink-2)", fontSize: 16, lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{text}</div>;
  }

  // Belt and suspenders: the generator now stores internal-only notes
  // separately (see splitDraftForStorage in parse-itinerary.ts), so these
  // section kinds shouldn't reach this column at all, but this is the
  // customer's own page, never render them here even if one slips through
  // some other path (a reviewer pasting raw draft text back in, etc).
  const sections = parsed.filter((section) => section.kind === "overview" || section.kind === "day");
  // Don't fall back to the raw text here, unlike the !parsed case above: if
  // parsing succeeded but left nothing beyond internal-only sections, the
  // raw text IS that internal content, showing it would defeat the filter.
  if (!sections.length) return null;

  // Locked days open exactly like the free ones: same card, same numbered
  // circle, same heading, so the plan reads as one continuous document with
  // the answers dimmed rather than as a plan that stops and a list that
  // starts. What sits under each heading is filler drawn to the real day's
  // measurements, blurred. The real lines were dropped on the server and are
  // not in this component at all, so there is nothing here to un-blur.
  //
  // The whole card is a link to the unlock panel. Somebody who taps a day they
  // cannot read is asking how to read it, and the answer was sitting further
  // down the page with nothing pointing at it. A plain anchor rather than a
  // click handler: this renders on the server, it works before any JavaScript
  // arrives, and the smooth scroll is already global CSS.
  const lockedCards = lockedDays.map((day, i) => {
    const number = day.title.match(/[\d٠-٩]+/)?.[0] ?? "•";
    // A day whose measurements didn't survive still gets a believable block
    // rather than an empty card.
    const lengths = day.lineLengths.length ? day.lineLengths : [88, 104, 76];
    return (
      <a
        key={`locked-${i}`}
        href={`#${UNLOCK_ANCHOR}`}
        className="lockedDay"
        aria-label={ar ? `افتح خطتك واقرأ ${day.title}` : `Unlock the plan to read ${day.title}`}
        // Staggered so the cards catch the light one after another rather than
        // flashing together, which reads as a glitch. The sweep itself is in
        // globals.css, because it needs pseudo-elements.
        style={{ ...cardStyle, position: "relative", overflow: "hidden", display: "block", color: "inherit", textDecoration: "none", cursor: "pointer", "--shineDelay": `${(0.45 + i * 0.17).toFixed(2)}s` } as CSSProperties}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              width: 38,
              height: 38,
              borderRadius: "50%",
              // A fixed navy, not var(--ink): that token flips to near-white in dark mode, which left the day number as pale gold on an almost white disc. Same trap the hero band on the journey page documents.
              background: "#102d29",
              color: "var(--gold-light)",
              fontFamily: "var(--font-display), Georgia, serif",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {number}
          </span>
          <p style={{ margin: 0, flex: 1, fontFamily: "var(--font-display), Georgia, serif", fontSize: 19, color: "var(--ink)" }}>{day.title}</p>
          <span
            title={ar ? "افتح خطتك واقرأ هذا اليوم" : "Unlock to read this day"}
            style={{
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "rgba(231,185,79,.16)",
              border: "1px solid var(--gold)",
              fontSize: 13,
            }}
          >
            &#128274;
          </span>
        </div>
        <ul aria-label="Locked until you unlock the plan" style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "grid", gap: 9 }}>
          {lengths.map((length, li) => (
            <li key={li} style={{ display: "flex", gap: 10 }}>
              <span aria-hidden="true" style={{ ...blurredTextStyle, flexShrink: 0, color: "var(--gold)" }}>
                &bull;
              </span>
              <span aria-hidden="true" style={{ ...blurredTextStyle, fontSize: 14.5, lineHeight: 1.65 }}>
                {fillerLine(length, length + li, ar)}
              </span>
            </li>
          ))}
        </ul>
      </a>
    );
  });

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {sections.map((section, i) => {
        if (section.kind === "overview") {
          return (
            <div key={i} style={{ ...cardStyle, background: "var(--ivory)", display: "grid", gap: 16 }}>
              {section.groups.map((group, gi) => {
                const { label, lines } = splitOverviewGroup(group);
                return (
                  <div key={gi}>
                    {label && (
                      <p style={{ margin: "0 0 6px", fontSize: 11.5, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--gold)" }}>{label}</p>
                    )}
                    <div style={{ display: "grid", gap: 4 }}>
                      {/* Labelled items ("Food: roughly ...") become bullets;
                          the lead sentence above them stays a paragraph. Runs
                          of items are grouped so one list renders, not one
                          list per line. */}
                      {groupOverviewLines(lines).map((block, bi) =>
                        block.kind === "items" ? (
                          <BulletLines key={bi} lines={block.lines} places={places} cityLabel={cityLabel} officialUrls={officialUrls} placeCities={placeCities} placeKinds={placeKinds} ar={ar} />
                        ) : (
                          block.lines.map((line, li) => (
                            <p key={`${bi}-${li}`} style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: "var(--ink-2)" }}>
                              {linkifyPlaces(line, places, cityLabel, officialUrls, placeCities, placeKinds, ar)}
                            </p>
                          ))
                        ),
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        // section.kind is narrowed to "overview" | "day" only, the filter
        // above guarantees "decisions"/"notes" sections never reach here.
        const dayNumber = section.title.match(/\d+/)?.[0] ?? "•";
        return (
          <div key={i} style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  // A fixed navy, not var(--ink): that token flips to near-white in dark mode, which left the day number as pale gold on an almost white disc. Same trap the hero band on the journey page documents.
                  background: "#102d29",
                  color: "var(--gold-light)",
                  fontFamily: "var(--font-display), Georgia, serif",
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                {dayNumber}
              </span>
              <p style={{ margin: 0, fontFamily: "var(--font-display), Georgia, serif", fontSize: 19, color: "var(--ink)" }}>{section.title}</p>
            </div>
            <BulletLines lines={section.lines} places={places} cityLabel={cityLabel} officialUrls={officialUrls} placeCities={placeCities} ar={ar} />
          </div>
        );
      })}
      {lockedCards}
    </div>
  );
}
