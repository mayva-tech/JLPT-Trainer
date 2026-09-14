type Props = {
  score: number;
  label?: string;
};

export function ScoreDisplay({ score, label = "Score" }: Props) {
  return (
    <div className="gm-score" aria-label={`${label} ${score}`}>
      <span className="gm-score__label">{label}</span>
      <span className="gm-score__value">{score}</span>
    </div>
  );
}
