type Props = {
  nameJa: string;
  nameEn: string;
  emoji: string;
  hp: number;
  maxHp: number;
};

export function BossHealthBar({ nameJa, nameEn, emoji, hp, maxHp }: Props) {
  const pct = maxHp <= 0 ? 0 : Math.max(0, Math.min(100, (hp / maxHp) * 100));
  return (
    <div className="gm-boss">
      <div className="gm-boss-name">
        <span aria-hidden="true">{emoji}</span>
        <strong lang="ja">{nameJa}</strong>
        <span>{nameEn}</span>
      </div>
      <div
        className="gm-boss-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={maxHp}
        aria-valuenow={hp}
        aria-label={`${nameEn} health`}
      >
        <div className="gm-boss-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="gm-boss-hp">
        {hp} / {maxHp} HP
      </div>
    </div>
  );
}
