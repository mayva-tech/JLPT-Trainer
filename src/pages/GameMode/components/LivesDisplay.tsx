type Props = {
  lives: number;
  max?: number;
};

export function LivesDisplay({ lives, max = 3 }: Props) {
  const hearts = Array.from({ length: max }, (_, index) => index < lives);
  return (
    <div className="gm-lives" aria-label={`${lives} of ${max} lives`}>
      {hearts.map((alive, index) => (
        <span key={index} className={alive ? "gm-heart" : "gm-heart gm-heart--empty"} aria-hidden="true">
          {alive ? "❤️" : "🖤"}
        </span>
      ))}
    </div>
  );
}
