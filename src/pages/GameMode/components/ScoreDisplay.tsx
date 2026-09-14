type Props = {
  score: number;
};

export function ScoreDisplay({ score }: Props) {
  return (
    <div className="gm-score" key={score} aria-live="polite">
      <span className="gm-score-label">Score</span>
      <span className="gm-score-value">{score}</span>
    </div>
  );
}
