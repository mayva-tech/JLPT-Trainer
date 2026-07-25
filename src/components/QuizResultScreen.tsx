type Props = {
  title: string;
  score: number;
  total: number;
};

/** Finished quiz score screen. */
export function QuizResultScreen({ title, score, total }: Props) {
  return (
    <div className="safe-area">
      <div className="hook-display card-fade">
        <div className="category-chip">{title}</div>
        <div className="placeholder-title">Quiz complete</div>
        <div className="quiz-score">
          Score: {score} / {total}
        </div>
      </div>
    </div>
  );
}
