type Props = {
  emoji: string;
  title: string;
  description: string;
  bestLabel?: string;
  bestValue?: string | number;
  featured?: boolean;
  onPlay: () => void;
};

export function GameModeCard({
  emoji,
  title,
  description,
  bestLabel,
  bestValue,
  featured,
  onPlay,
}: Props) {
  return (
    <article
      className={
        featured ? "gm-mode-card gm-mode-card--featured" : "gm-mode-card"
      }
    >
      <div className="gm-mode-card__emoji" aria-hidden>
        {emoji}
      </div>
      <h3 className="gm-mode-card__title">{title}</h3>
      <p className="gm-mode-card__desc">{description}</p>
      {bestLabel != null && bestValue != null ? (
        <p className="gm-mode-card__best">
          {bestLabel}: <strong>{bestValue}</strong>
        </p>
      ) : null}
      {featured ? <p className="gm-mode-card__badge">Today&apos;s challenge</p> : null}
      <button type="button" className="gm-btn gm-btn--primary" onClick={onPlay}>
        Play
      </button>
    </article>
  );
}
