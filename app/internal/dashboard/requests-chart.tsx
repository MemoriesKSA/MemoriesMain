import styles from "./dashboard.module.css";

export type WeekBar = { week: string; label: string; count: number; partial: boolean };

// Plan requests per week, one series, so no legend: the card title names it.
// The dashed line is the volume the price test needs (8 a week, three weeks running),
// a reference on the same scale, not a second axis. Hover shows each week's count.
export function RequestsChart({ weeks, target }: { weeks: WeekBar[]; target: number }) {
  const W = 640;
  const H = 230;
  const pad = { top: 22, right: 12, bottom: 30, left: 30 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const max = Math.max(target + 2, ...weeks.map((w) => w.count + 1));
  const yMax = Math.ceil(max / 2) * 2;
  const y = (v: number) => pad.top + innerH - (v / yMax) * innerH;
  const slot = innerW / Math.max(weeks.length, 1);
  const barW = Math.min(44, slot * 0.62);
  const ticks = Array.from({ length: yMax / 2 + 1 }, (_, i) => i * 2);
  const peak = Math.max(...weeks.map((w) => w.count));
  const peakIndex = weeks.findIndex((w) => w.count === peak);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label="Plan requests per week">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} className={styles.lineGrid} strokeWidth={1} />
          <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" className={styles.axisText}>
            {t}
          </text>
        </g>
      ))}
      {weeks.map((w, i) => {
        const x = pad.left + slot * i + (slot - barW) / 2;
        const top = y(w.count);
        const h = Math.max(pad.top + innerH - top, 0);
        const r = Math.min(4, h);
        const path =
          h > 0
            ? `M${x},${top + h} L${x},${top + r} Q${x},${top} ${x + r},${top} L${x + barW - r},${top} Q${x + barW},${top} ${x + barW},${top + r} L${x + barW},${top + h} Z`
            : "";
        const showLabel = i === weeks.length - 1 || (i === peakIndex && peak > 0);
        return (
          <g key={w.week} className={styles.barGroup}>
            <title>{`Week of ${w.label}: ${w.count} request${w.count === 1 ? "" : "s"}${w.partial ? " so far" : ""}`}</title>
            <rect x={pad.left + slot * i} y={pad.top} width={slot} height={innerH} fill="transparent" />
            {h > 0 ? (
              <path d={path} className={w.partial ? styles.barPartial : styles.bar} />
            ) : (
              <line x1={x} x2={x + barW} y1={top} y2={top} className={styles.lineZero} strokeWidth={2} />
            )}
            {showLabel && (
              <text x={x + barW / 2} y={top - 7} textAnchor="middle" className={styles.barLabel}>
                {w.count}
                {w.partial ? " so far" : ""}
              </text>
            )}
            <text x={x + barW / 2} y={H - 10} textAnchor="middle" className={styles.axisText}>
              {w.label}
            </text>
          </g>
        );
      })}
      <line x1={pad.left} x2={W - pad.right} y1={y(target)} y2={y(target)} className={styles.lineTarget} strokeWidth={2} strokeDasharray="6 5" />
      <text x={W - pad.right} y={y(target) - 7} textAnchor="end" className={styles.targetText}>
        {target} a week: price-test level
      </text>
    </svg>
  );
}
