type Props = {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  ratio: number;
};

export function XPBar({ level, xpIntoLevel, xpForNextLevel, ratio }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));
  return (
    <div className="gm-xp">
      <div className="gm-xp-meta">
        <span className="gm-xp-level">Lv. {level}</span>
        <span className="gm-xp-numbers">
          {xpIntoLevel} / {xpForNextLevel} XP
        </span>
      </div>
      <div
        className="gm-xp-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={xpForNextLevel}
        aria-valuenow={xpIntoLevel}
        aria-label={`Level ${level} experience`}
      >
        <div className="gm-xp-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
