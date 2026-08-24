/**
 * The pages Memory can hand someone as a real, tappable link.
 *
 * The concierge was told never to write out a path or a URL, which is right,
 * those are dead text in a chat bubble. What it was given instead was one
 * marker for the planner and nothing else, so every other page arrived as
 * directions: "it's in the footer under Company". Habib asked where the
 * feedback page was and got a paragraph of navigation instructions instead of
 * something to press.
 *
 * So the same trick the planner button uses now covers every page. Memory
 * writes the label in square brackets on its own line and the chat turns it
 * into a link. A label that is not in this map renders as ordinary text,
 * which is the safe direction to fail in: a stray bracket looks slightly odd,
 * a wrong link sends somebody to the wrong place.
 *
 * Labels are matched exactly, so they must read the same here, in the footer,
 * and in the prompt that tells Memory they exist.
 */
export type ConciergePage = { en: string; ar: string; href: string };

export const CONCIERGE_PAGES: ConciergePage[] = [
  { en: "Discover Saudi Arabia", ar: "اكتشف السعودية", href: "/discover-saudi-arabia" },
  { en: "Study Abroad", ar: "الدراسة في الخارج", href: "/study-abroad" },
  { en: "Destinations", ar: "الوجهات", href: "/destinations" },
  { en: "Know before you go", ar: "قبل أن تسافر", href: "/know-before-you-go" },
  { en: "Tell us what you think", ar: "قل لنا رأيك", href: "/feedback" },
  { en: "About us", ar: "من نحن", href: "/about" },
  { en: "Corporate travel", ar: "سفر الشركات", href: "/corporate" },
  { en: "Privacy Policy", ar: "سياسة الخصوصية", href: "/privacy" },
  { en: "Terms of Use", ar: "شروط الاستخدام", href: "/terms" },
  { en: "Plans, payment & refunds", ar: "الخطط والدفع والاسترداد", href: "/booking-terms" },
  { en: "Cookie Notice", ar: "ملفات الارتباط", href: "/cookies" },
];

/** The href for a bracketed label, or null if we do not know that page. */
export function conciergePageHref(label: string, ar: boolean): string | null {
  const wanted = label.trim().toLowerCase();
  const page = CONCIERGE_PAGES.find((p) => (ar ? p.ar : p.en).toLowerCase() === wanted);
  if (!page) return null;
  return ar ? `/ar${page.href}` : page.href;
}

/** The list handed to the model, so it can only offer pages that exist. */
export function conciergePageList(ar: boolean): string {
  return CONCIERGE_PAGES.map((p) => `[${ar ? p.ar : p.en}]`).join(", ");
}

// Splits a reply into word tokens (each keeping its trailing whitespace) for
// the word-by-word reveal, holding any [bracketed label] together so it is
// never shown mid-bracket while streaming in. Lives here rather than in the
// chat component so it can be tested without a browser.
const BRACKET = /\[[^\]\n]+\]/g;

export function tokenizeReply(content: string): string[] {
  const tokens: string[] = [];
  let cursor = 0;
  for (const match of content.matchAll(BRACKET)) {
    const at = match.index ?? 0;
    tokens.push(...(content.slice(cursor, at).match(/\S+\s*/g) ?? []));
    tokens.push(match[0]);
    cursor = at + match[0].length;
  }
  tokens.push(...(content.slice(cursor).match(/\S+\s*/g) ?? []));
  return tokens;
}
