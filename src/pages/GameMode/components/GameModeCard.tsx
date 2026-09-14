type Props = {
  emoji: string;
  title: string;
  description: string;
  statLabel: string;
  statValue: string;
  featured?: boolean;
  onPlay: () => void;
};

export function GameModeCard({
  emoji,
  title,
  description,
  statLabel,
  statValue,
  featured = false,
  onPlay,
}: Props) {
  return (
    <article className={featured ? "gm-card gm-card--featured" : "gm-card"}>
      <div className="gm-card-emoji" aria-hidden="true">
        {emoji}
      </div>
      <h2 className="gm-card-title">{title}</h2>
      <p className="gm-card-copy">{description}</p>
      <p className="gm-card-stat">
        {statLabel}: <strong>{statValue}</strong>
      </p>
      <button type="button" className="gm-btn gm-btn--play" onClick={onPlay}>
        Play
      </button>
    </article>
  );
}
