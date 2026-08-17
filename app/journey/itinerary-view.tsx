import type { CSSProperties } from "react";
import { parseItinerary, splitOverviewGroup } from "./parse-itinerary";

const cardStyle: CSSProperties = { background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 14, padding: "22px 24px" };

function BulletLines({ lines }: { lines: string[] }) {
  return (
    <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "grid", gap: 9 }}>
      {lines.map((line, i) => (
        <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 15, lineHeight: 1.7, color: "var(--ink-2)" }}>
          <span style={{ flexShrink: 0, width: 6, height: 6, marginTop: 9, borderRadius: "50%", background: "var(--gold)" }} />
          <span>{line}</span>
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
export function ItineraryView({ text }: { text: string }) {
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
                      {lines.map((line, li) => (
                        <p key={li} style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: "var(--ink-2)" }}>
                          {line}
                        </p>
                      ))}
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
                  background: "var(--ink)",
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
            <BulletLines lines={section.lines} />
          </div>
        );
      })}
    </div>
  );
}
