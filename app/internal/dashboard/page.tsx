import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getReviewerEmail } from "../../supabase-server";
import { createSupabaseAdminClient } from "../../supabase-admin";
import { loadSnapshot, type Tone } from "./snapshot";
import { RequestsChart, type WeekBar } from "./requests-chart";
import styles from "./dashboard.module.css";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

// Habib, 13 Nov 2026: "make me a professional looking ... website that shows me everything i
// need to see rather than hearing it from you" ... "or like add it in the internal section".
// Two sources: plan requests are read live from the proposals table on every visit; the team's
// side (calendar, funnel, projections, price plan, what waits for his yes) comes from the
// snapshot the PM uploads after each meeting. See snapshot.ts.

const TEAM_NAME = "فريق ميموريز";
const LAUNCH_WEEK = "2026-10-05"; // first Monday after ads went live on 2 Oct
const PRICE_TEST_LEVEL = 8;
const PLATFORMS: [string, string][] = [
  ["tiktok", "TikTok"],
  ["facebook", "FB"],
  ["youtube", "YouTube"],
  ["x", "X"],
  ["snapchat", "Snap"],
];

type Row = {
  id: string;
  reference: string | null;
  city: string | null;
  status: string | null;
  review_state: string | null;
  created_at: string;
  sent_at: string | null;
  customer_name: string | null;
  customer_email: string | null;
  draft_cost_usd: number | string | null;
};

const mondayOf = (iso: string) => {
  const t = new Date(iso);
  t.setUTCHours(0, 0, 0, 0);
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7));
  return t.toISOString().slice(0, 10);
};
const short = (isoDay: string) =>
  new Date(`${isoDay}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const ukTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
const ago = (iso: string, now: number) => {
  const mins = Math.max(0, Math.round((now - +new Date(iso)) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
};
const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};
const toneIcon: Record<Tone, string> = { good: "▲", warn: "●", bad: "▼", info: "■" };

function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`${styles.pill} ${styles[tone]}`}>
      <span aria-hidden>{toneIcon[tone]}</span>
      {children}
    </span>
  );
}

export default async function DashboardPage() {
  const email = await getReviewerEmail();
  if (!email) redirect("/internal/login");

  const supabase = createSupabaseAdminClient();
  const [{ data }, snap] = await Promise.all([
    supabase
      .from("proposals")
      .select("id, reference, city, status, review_state, created_at, sent_at, customer_name, customer_email, draft_cost_usd")
      .order("created_at", { ascending: false }),
    loadSnapshot(supabase),
  ]);
  const all = (data ?? []) as Row[];
  const now = Date.now();

  // Real customers only: team plans and our own test rows are left out, as in the weekly review.
  const customers = all.filter((r) => {
    if (r.customer_name === TEAM_NAME) return false;
    const e = String(r.customer_email ?? "").toLowerCase();
    return !(e.includes("mixedhopes") || e.includes("memories"));
  });

  const thisWeek = mondayOf(new Date(now).toISOString());
  const counts = new Map<string, number>();
  for (const r of customers) counts.set(mondayOf(r.created_at), (counts.get(mondayOf(r.created_at)) ?? 0) + 1);
  const weeks: WeekBar[] = [];
  for (let d = new Date(`${LAUNCH_WEEK}T00:00:00Z`); d.toISOString().slice(0, 10) <= thisWeek; d.setUTCDate(d.getUTCDate() + 7)) {
    const k = d.toISOString().slice(0, 10);
    weeks.push({ week: k, label: short(k), count: counts.get(k) ?? 0, partial: k === thisWeek });
  }
  const full = weeks.filter((w) => !w.partial);
  const lastSix = full.slice(-6);
  const avg = lastSix.length ? lastSix.reduce((a, w) => a + w.count, 0) / lastSix.length : 0;
  const weekNow = weeks.at(-1)?.count ?? 0;

  const monthAgo = now - 30 * 864e5;
  const recent = customers.filter((r) => +new Date(r.created_at) >= monthAgo);
  const sendHours = recent.filter((r) => r.sent_at).map((r) => (+new Date(r.sent_at!) - +new Date(r.created_at)) / 3.6e6);
  const medianHours = median(sendHours);
  const costs = recent.map((r) => Number(r.draft_cost_usd ?? 0)).filter((c) => c > 0);
  const avgCost = costs.length ? costs.reduce((a, b) => a + b, 0) / costs.length : null;
  const totalSent = customers.filter((r) => r.sent_at).length;
  // Flagged and unsent waits for a person (the Journeys rule), counted for real customers only:
  // three of our own test plans from 23 Sep sit flagged for good and would read as work for Habib.
  const flagged = customers.filter((r) => r.review_state === "flagged" && !r.sent_at);
  const latest = customers.slice(0, 8);

  const snapAgeHours = snap ? (now - +new Date(snap.generatedAt)) / 3.6e6 : null;
  const stale = snapAgeHours !== null && snapAgeHours > 30;

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <div className={styles.wrap}>
          <nav className={styles.nav}>
            <span className={styles.brand}>MEMORIES</span>
            <div className={styles.navLinks}>
              <Link href="/internal/dashboard" className={styles.active}>
                Dashboard
              </Link>
              <Link href="/internal/journeys">Journeys</Link>
            </div>
          </nav>
          <p className={styles.kicker}>Control room</p>
          <h1 className={styles.title}>How MEMORIES is doing</h1>
          {snap && (
            <div className={styles.verdictRow}>
              <Pill tone={snap.verdict.tone}>{snap.verdict.label}</Pill>
              <p className={styles.verdictText}>
                {snap.verdict.line} <strong style={{ color: "#fff" }}>Next check: {snap.verdict.nextCheck}.</strong>
              </p>
            </div>
          )}
          <p className={`${styles.syncNote} ${stale ? styles.syncStale : ""}`}>
            Plan numbers are live. Team notes{" "}
            {snap ? `synced ${ago(snap.generatedAt, now)} (${ukTime(snap.generatedAt)} UK)` : "not synced yet"}
            {stale ? ". Older than a day: ask the PM to sync." : "."}
          </p>
        </div>
      </header>

      <main className={`${styles.wrap} ${styles.main}`}>
        <section className={styles.kpis} aria-label="Key numbers">
          <div className={styles.kpi}>
            <p className={styles.kpiLabel}>Requests this week</p>
            <p className={styles.kpiValue}>{weekNow}</p>
            <p className={styles.kpiSub}>Since Mon {short(thisWeek)}, real customers only</p>
          </div>
          <div className={styles.kpi}>
            <p className={styles.kpiLabel}>Average a week</p>
            <p className={styles.kpiValue}>{avg.toFixed(1)}</p>
            <p className={styles.kpiSub}>Last {lastSix.length} full weeks. Price test needs {PRICE_TEST_LEVEL}</p>
          </div>
          <div className={`${styles.kpi} ${flagged.length ? styles.kpiAlert : ""}`}>
            <p className={styles.kpiLabel}>Plans waiting for you</p>
            <p className={styles.kpiValue}>{flagged.length}</p>
            <p className={styles.kpiSub}>
              {flagged.length ? (
                <Link href="/internal/journeys" className={styles.inlineLink}>
                  Flagged by the self-check: open Journeys
                </Link>
              ) : (
                "Nothing flagged. Clean plans send themselves"
              )}
            </p>
          </div>
          <div className={styles.kpi}>
            <p className={styles.kpiLabel}>Time to send</p>
            <p className={styles.kpiValue}>{medianHours === null ? "–" : `${medianHours < 10 ? medianHours.toFixed(1) : Math.round(medianHours)} h`}</p>
            <p className={styles.kpiSub}>Median, request to plan sent, last 30 days</p>
          </div>
          <div className={styles.kpi}>
            <p className={styles.kpiLabel}>Plans sent</p>
            <p className={styles.kpiValue}>{totalSent}</p>
            <p className={styles.kpiSub}>Since launch. AI cost {avgCost === null ? "n/a" : `~$${avgCost.toFixed(2)}`} a plan</p>
          </div>
        </section>

        <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>Needs your yes</h2>
              <span className={styles.cardNote}>{snap?.needsYou.length ?? 0} open</span>
            </div>
            {snap?.needsYou.length ? (
              <ol className={styles.needsList}>
                {snap.needsYou.map((n, i) => (
                  <li key={i} className={styles.needItem}>
                    <span className={styles.needNum}>{i + 1}</span>
                    <div>
                      <p className={styles.needText}>{n.text}</p>
                      <p className={styles.needFrom}>
                        {n.from}
                        {n.since ? ` · since ${n.since}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.empty}>Nothing is waiting for you.</p>
            )}
          </section>

        <div className={styles.grid}>
          <section className={`${styles.card} ${styles.span7}`}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>Plan requests per week</h2>
              <span className={styles.cardNote}>Live · real customers · hover a bar</span>
            </div>
            <RequestsChart weeks={weeks} target={PRICE_TEST_LEVEL} />
            <div className={styles.legendRow}>
              <span>
                <span className={`${styles.swatch} ${styles.swBar}`} />
                Full week
              </span>
              <span>
                <span className={`${styles.swatch} ${styles.swPartial}`} />
                This week so far
              </span>
              <span>
                <span className={`${styles.swatch} ${styles.swTarget}`} />
                Price-test level
              </span>
            </div>
          </section>

          {snap && (
            <section className={`${styles.card} ${styles.span5}`}>
              <div className={styles.cardHead}>
                <h2 className={styles.cardTitle}>When to charge</h2>
                <Pill tone="info">Free for now</Pill>
              </div>
              <p className={styles.para}>{snap.price.summary}</p>
              {snap.price.conditions.map((c) => (
                <div key={c.label} className={styles.cond}>
                  <div className={styles.condHead}>
                    <span>{c.label}</span>
                    <strong>
                      {c.now} / {c.target} {c.unit}
                    </strong>
                  </div>
                  <div className={styles.track}>
                    <div className={styles.fill} style={{ width: `${Math.min(100, (c.now / c.target) * 100)}%` }} />
                  </div>
                </div>
              ))}
              <p className={styles.para}>
                <strong>Earliest test:</strong> {snap.price.earliest}
              </p>
              <p className={`${styles.para} ${styles.muted}`}>{snap.price.firstTest}</p>
            </section>
          )}
        </div>

        {snap && (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>This week&apos;s funnel</h2>
              <span className={styles.cardNote}>{snap.funnel.week} · Saudi visitors only · from the Head of Growth</span>
            </div>
            <div className={styles.funnel}>
              {snap.funnel.steps.map((s, i) => (
                <div key={i} className={styles.step}>
                  <p className={styles.stepValue}>{s.value}</p>
                  <p className={styles.stepLabel}>{s.label}</p>
                  {s.rate && <span className={`${styles.stepRate} ${i === 1 ? styles.stepLeak : ""}`}>{s.rate}</span>}
                </div>
              ))}
            </div>
            <p className={styles.leakNote}>{snap.funnel.leak}</p>
          </section>
        )}

        {snap && (
          <div className={styles.grid}>
            <section className={`${styles.card} ${styles.span7}`}>
              <div className={styles.cardHead}>
                <h2 className={styles.cardTitle}>Projections</h2>
                <span className={styles.cardNote}>followers · views a week · Saudi visitors a week · requests a week</span>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th />
                      {snap.projections.cols.map((c) => (
                        <th key={c}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {snap.projections.rows.map((r) => (
                      <tr key={r.name}>
                        <td className={styles.rowName}>{r.name}</td>
                        {r.cells.map((c, i) => (
                          <td key={i}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={`${styles.para} ${styles.muted}`} style={{ marginTop: 12 }}>
                {snap.projections.assumption}
              </p>
            </section>

            <section className={`${styles.card} ${styles.span5}`}>
              <div className={styles.cardHead}>
                <h2 className={styles.cardTitle}>Week by week</h2>
                <span className={styles.cardNote}>Views to date by upload week</span>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Week</th>
                      <th>Posts</th>
                      <th>Views</th>
                      <th>Followers</th>
                      <th>Visitors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snap.scoreboard.map((s) => (
                      <tr key={s.week}>
                        <td className={styles.rowName}>{s.week}</td>
                        <td>{s.posts}</td>
                        <td>{s.views}</td>
                        <td>{s.followers}</td>
                        <td>{s.visitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {snap && (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>Posting calendar</h2>
              <span className={styles.cardNote}>Green = scheduled on that platform · dashed = still to load</span>
            </div>
            {snap.schedule.length ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Post</th>
                      <th>Goes out (UK)</th>
                      <th>Video</th>
                      <th>Platforms</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snap.schedule.map((p) => (
                      <tr key={p.post}>
                        <td className={styles.rowName}>{p.post}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{ukTime(p.slotUk)}</td>
                        <td>{p.title}</td>
                        <td>
                          <div className={styles.chips}>
                            {PLATFORMS.map(([key, label]) => {
                              const done = p.done.includes(key);
                              return (
                                <span key={key} className={`${styles.chip} ${done ? styles.chipDone : styles.chipTodo}`}>
                                  {done ? "✓ " : ""}
                                  {label}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.empty}>Nothing scheduled ahead. The next batch is being built.</p>
            )}
          </section>
        )}

        {snap && (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>The team</h2>
              <span className={styles.cardNote}>{snap.team.length} roles · last update = their newest note</span>
            </div>
            <div className={styles.team}>
              {snap.team.map((m) => (
                <div key={m.role} className={styles.member}>
                  <div className={styles.memberHead}>
                    <p className={styles.memberRole}>{m.role}</p>
                    <span className={styles.model}>{m.model}</span>
                  </div>
                  <p className={styles.memberDoing}>{m.doing}</p>
                  {m.lastUpdate && <p className={styles.memberWhen}>Last update {ago(m.lastUpdate, now)}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {snap && (
          <div className={styles.grid}>
            <section className={`${styles.card} ${styles.span7}`}>
              <div className={styles.cardHead}>
                <h2 className={styles.cardTitle}>Experiments</h2>
                <span className={styles.cardNote}>Ranked by the Head of Growth</span>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>What</th>
                      <th>Owner</th>
                      <th>Moves</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snap.experiments.map((e) => (
                      <tr key={e.name}>
                        <td>{e.name}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{e.owner}</td>
                        <td>{e.metric}</td>
                        <td>
                          <Pill tone={e.tone}>{e.status}</Pill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={`${styles.card} ${styles.span5}`}>
              <div className={styles.cardHead}>
                <h2 className={styles.cardTitle}>Latest decisions</h2>
                <span className={styles.cardNote}>{snap.decisions.date}</span>
              </div>
              {snap.decisions.items.length ? (
                <ul className={styles.decisions}>
                  {snap.decisions.items.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>No decisions logged yet today.</p>
              )}
            </section>
          </div>
        )}

        <div>
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>Latest requests</h2>
              <span className={styles.cardNote}>Live · refs and cities only</span>
            </div>
            {latest.length ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Ref</th>
                      <th>City</th>
                      <th>Received (UK)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latest.map((r) => {
                      const hrs = r.sent_at ? (+new Date(r.sent_at) - +new Date(r.created_at)) / 3.6e6 : null;
                      return (
                        <tr key={r.id}>
                          <td>
                            <Link href={`/internal/journeys/${r.id}`} className={`${styles.mono} ${styles.inlineLink}`}>
                              {r.reference ?? "–"}
                            </Link>
                          </td>
                          <td>{r.city ?? "–"}</td>
                          <td style={{ whiteSpace: "nowrap" }}>{ukTime(r.created_at)}</td>
                          <td>
                            {r.sent_at ? (
                              <Pill tone="good">Sent in {hrs! < 10 ? hrs!.toFixed(1) : Math.round(hrs!)} h</Pill>
                            ) : r.review_state === "flagged" ? (
                              <Pill tone="bad">Flagged</Pill>
                            ) : (
                              <Pill tone="warn">In progress</Pill>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.empty}>No customer requests yet.</p>
            )}
          </section>

          
        </div>
      </main>
    </div>
  );
}
