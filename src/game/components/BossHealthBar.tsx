type Props = {
  current: number;
  max: number;
  label?: string;
};

export function BossHealthBar({ current, max, label = "Boss HP" }: Props) {
  const ratio = max <= 0 ? 0 : Math.max(0, Math.min(1, current / max));
  const pct = Math.round(ratio * 100);
  return (
    <div className="gm-boss-hp">
      <div className="gm-boss-hp__meta">
        <span>{label}</span>
        <span>
          {Math.max(0, current)} / {max}
        </span>
      </div>
      <div
        className="gm-boss-hp__track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={
            ratio < 0.3
              ? "gm-boss-hp__fill gm-boss-hp__fill--low"
              : "gm-boss-hp__fill"
          }
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
