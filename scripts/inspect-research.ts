// Reads stored research and says whether it is actually any good.
//
// Written after 41% of the cache turned out to be cut off mid-sentence with
// nothing anywhere saying so. A truncated note reads exactly like a short one,
// which is precisely why it survived: everything downstream treated "present"
// as "fine". This looks at what is inside each category rather than whether a
// marker exists.
//
//   npx tsx --env-file=.env.local scripts/inspect-research.ts            # newest 5
//   npx tsx --env-file=.env.local scripts/inspect-research.ts --all
//   npx tsx --env-file=.env.local scripts/inspect-research.ts --city bali
//   npx tsx --env-file=.env.local scripts/inspect-research.ts --verbose

import { createSupabaseAdminClient } from "../app/supabase-admin";
import { categoriesFor } from "../app/draft-guide";
import { flagshipCityGuideBySlug } from "../app/flagship-city-data";
import { plannableCountries } from "../app/components/planner-data";

const args = process.argv.slice(2);
const ALL = args.includes("--all");
const VERBOSE = args.includes("--verbose");
const ONLY = args[args.indexOf("--city") + 1];
const LIMIT = ALL ? 999 : 5;

// A genuinely unfinished line, rather than one that simply has no full stop.
//
// The first version flagged any last line without terminal punctuation, which
// also catches the "what I could not confirm" list every report ends with:
// "GP registration and any residual police registration requirement" is a
// complete bullet, not a severed sentence. It called two clean reports broken.
//
// Real truncation leaves a tell: a dangling comma or colon, a joining word
// with nothing after it, or a bracket that never closed.
const DANGLING_PUNCT = /[,:;\-–—(\[]$/;
const JOINING_WORD = /\b(and|or|the|a|an|in|on|of|to|for|with|at|by|from|is|are|was|were|that|which|its|their|as)$/i;

function looksTruncated(body: string): boolean {
  const text = body.trim();
  if (!text) return false;
  const last = text.split("\n").pop()!.trim();
  if (DANGLING_PUNCT.test(last)) return true;
  if (JOINING_WORD.test(last)) return true;
  const opens = (last.match(/\(/g) ?? []).length;
  const closes = (last.match(/\)/g) ?? []).length;
  return opens > closes;
}
// A proper noun of two or more words: "Banyan Tree Samui", "Gergeti Trinity".
const NAMED = /\b[A-Z][\w'’-]+(?: [A-Z][\w'’&-]+){1,4}\b/g;
// Evidence the researcher actually cited something.
const SOURCED = /\b\d(?:\.\d)?\s*\/\s*5\b|\breviews?\b|\bTripAdvisor\b|\bGoogle\b|\bTrustpilot\b|\bper night\b|\bSAR|\bUSD|\b[A-Z]{3}\s?\d|\bhttps?:\/\//i;
// The researcher is allowed to report a genuine dead end, but not everywhere.
const DEAD_END = /could not (find|confirm|verify)|nothing conclusive|no (results|information|data) (found|available)|not (documented|published|retrieved)/gi;

/** What each category is supposed to come back with. */
const EXPECT: Record<string, { minChars: number; minNames: number; label: string }> = {
  dining:       { minChars: 1500, minNames: 6, label: "restaurants across price tiers" },
  stays:        { minChars: 1500, minNames: 5, label: "hotels across price tiers" },
  drivers:      { minChars: 1000, minNames: 3, label: "driver or transfer companies" },
  sights:       { minChars: 1500, minNames: 6, label: "things to do" },
  halal:        { minChars: 800,  minNames: 2, label: "halal food and prayer" },
  hours:        { minChars: 800,  minNames: 2, label: "opening hours for held places" },
  rentals:      { minChars: 1000, minNames: 3, label: "rental car companies" },
  flights:      { minChars: 600,  minNames: 2, label: "airlines and routes" },
  universities: { minChars: 1500, minNames: 3, label: "universities and admission" },
  studyvisa:    { minChars: 1200, minNames: 1, label: "the Saudi student visa route" },
  living:       { minChars: 1200, minNames: 2, label: "cost of living and housing" },
  studentlife:  { minChars: 800,  minNames: 2, label: "halal, prayer and community" },
};

type Finding = { level: "FAIL" | "warn"; text: string };

function inspectCategory(key: string, body: string): Finding[] {
  const out: Finding[] = [];
  const expect = EXPECT[key];
  const trimmed = body.trim();

  if (!trimmed) { out.push({ level: "FAIL", text: "empty" }); return out; }
  if (looksTruncated(trimmed)) out.push({ level: "FAIL", text: `cut mid-sentence: "...${trimmed.slice(-52)}"` });
  if (expect && trimmed.length < expect.minChars) out.push({ level: "FAIL", text: `only ${trimmed.length} chars, expected at least ${expect.minChars} for ${expect.label}` });

  const names = [...new Set(trimmed.match(NAMED) ?? [])];
  if (expect && names.length < expect.minNames) out.push({ level: "FAIL", text: `${names.length} named things, expected at least ${expect.minNames}` });

  if (!SOURCED.test(trimmed)) out.push({ level: "warn", text: "no review score, price or source cited anywhere" });

  const deadEnds = (trimmed.match(DEAD_END) ?? []).length;
  if (deadEnds >= 5) out.push({ level: "warn", text: `${deadEnds} "could not confirm" statements, thin research` });

  return out;
}

function countryOf(slug: string): string {
  const bare = slug.replace(/^study:/, "");
  for (const c of plannableCountries) if (c.cities.some((x) => x.value === bare)) return c.value;
  return "";
}

async function main() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("city_research_cache")
    .select("city_slug, research_notes, updated_at, curated")
    .order("updated_at", { ascending: false });
  if (error) { console.error("Could not read the cache:", error.message); process.exit(1); }

  let rows = ((data ?? []) as { city_slug: string; research_notes: string; updated_at: string; curated: boolean }[])
    .filter((r) => !r.curated);
  if (ONLY && !ONLY.startsWith("--")) rows = rows.filter((r) => r.city_slug === ONLY || r.city_slug === `study:${ONLY}`);
  rows = rows.slice(0, LIMIT);

  let clean = 0, problems = 0;
  for (const row of rows) {
    const isStudy = row.city_slug.startsWith("study:");
    const bare = row.city_slug.replace(/^study:/, "");
    const guide = isStudy ? undefined : flagshipCityGuideBySlug(countryOf(row.city_slug), bare);
    const wanted = categoriesFor(guide, isStudy).map((c) => c.key);

    const blocks = String(row.research_notes ?? "").split(/^##cat:/m).filter(Boolean);
    const present = new Map<string, string>();
    for (const b of blocks) {
      const key = b.split("\n")[0].trim();
      if (key.startsWith("#scope")) continue;
      present.set(key, b.slice(b.indexOf("\n")).trim());
    }

    const missing = wanted.filter((k) => !present.has(k));
    const findings: string[] = [];
    for (const [key, body] of present) {
      for (const f of inspectCategory(key, body)) findings.push(`    ${f.level === "FAIL" ? "FAIL" : "warn"}  ${key}: ${f.text}`);
    }

    const ok = !missing.length && !findings.some((f) => f.includes("FAIL"));
    if (ok) clean++; else problems++;

    const age = Math.round((Date.now() - new Date(row.updated_at).getTime()) / 60_000);
    console.log(`\n${ok ? "OK  " : "  ! "} ${row.city_slug.padEnd(22)} ${present.size}/${wanted.length} categories, ${age}m ago`);
    if (missing.length) console.log(`    FAIL  missing entirely: ${missing.join(", ")}`);
    for (const f of findings) console.log(f);
    if (VERBOSE || !ok) {
      for (const [key, body] of present) {
        const names = [...new Set(body.match(NAMED) ?? [])];
        console.log(`      ${key.padEnd(13)} ${String(body.length).padStart(5)} chars, ${String(names.length).padStart(2)} names  ${names.slice(0, 4).join(", ")}`);
      }
    }
  }

  console.log(`\n${clean} clean, ${problems} with problems, out of ${rows.length} inspected`);
  if (problems) process.exit(1);
}

main().then(() => process.exit(0));
