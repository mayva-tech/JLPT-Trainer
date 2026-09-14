type Props = {
  lives: number;
  maxLives?: number;
};

export function LivesDisplay({ lives, maxLives }: Props) {
  const max = maxLives ?? Math.max(lives, 3);
  const hearts = Array.from({ length: max }, (_, i) => i < lives);
  return (
    <div className="gm-lives" aria-label={`${lives} lives remaining`}>
      {hearts.map((filled, i) => (
        <span
          key={i}
          className={filled ? "gm-lives__heart" : "gm-lives__heart gm-lives__heart--empty"}
          aria-hidden
        >
          {filled ? "❤️" : "🖤"}
        </span>
      ))}
    </div>
  );
}
