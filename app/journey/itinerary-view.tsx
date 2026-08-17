import type { CSSProperties } from "react";
import { AlertCircle, ClipboardList } from "lucide-react";
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
  const sections = parseItinerary(text);
  if (!sections) {
    return <div style={{ color: "var(--ink-2)", fontSize: 16, lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{text}</div>;
  }

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

        if (section.kind === "day") {
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
        }

        if (section.kind === "decisions") {
          return (
            <div key={i} style={{ ...cardStyle, background: "rgba(200,149,63,.08)", borderColor: "var(--gold-light)", borderTop: "3px solid var(--gold)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <AlertCircle size={18} color="var(--gold)" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontWeight: 800, fontSize: 14.5, color: "var(--ink)" }}>{section.title}</p>
              </div>
              <BulletLines lines={section.lines} />
            </div>
          );
        }

        return (
          <div key={i} style={{ ...cardStyle, background: "var(--ivory)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <ClipboardList size={17} color="var(--muted)" style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, fontWeight: 800, fontSize: 13.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{section.title}</p>
            </div>
            <BulletLines lines={section.lines} />
          </div>
        );
      })}
    </div>
  );
}
