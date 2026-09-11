type Props = {
  title: string;
  score: number;
  total: number;
  onReviewWeakWords?: () => void;
  onRetestWeakWords?: () => void;
};

/** Finished quiz score screen. */
export function QuizResultScreen({
  title,
  score,
  total,
  onReviewWeakWords,
  onRetestWeakWords,
}: Props) {
  const showWeakActions = !!onReviewWeakWords || !!onRetestWeakWords;

  return (
    <div className="safe-area">
      <div className="hook-display card-fade">
        <div className="category-chip">{title}</div>
        <div className="placeholder-title">Quiz complete</div>
        <div className="quiz-score">
          Score: {score} / {total}
        </div>
        {showWeakActions ? (
          <div className="quiz-result-actions">
            {onReviewWeakWords ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={onReviewWeakWords}
              >
                Review Weak Words
              </button>
            ) : null}
            {onRetestWeakWords ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={onRetestWeakWords}
              >
                Retest Weak Words
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
