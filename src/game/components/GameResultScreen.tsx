import type { GameMistake } from "../../utils/gameMode";

type Stat = { label: string; value: string | number };

type Props = {
  title: string;
  headline?: string;
  stats: Stat[];
  mistakes?: GameMistake[];
  isPersonalBest?: boolean;
  onPlayAgain: () => void;
  onBack: () => void;
  onReviewMistakes?: () => void;
  reviewing?: boolean;
  extra?: React.ReactNode;
};

export function GameResultScreen({
  title,
  headline,
  stats,
  mistakes = [],
  isPersonalBest,
  onPlayAgain,
  onBack,
  onReviewMistakes,
  reviewing,
  extra,
}: Props) {
  if (reviewing && mistakes.length > 0) {
    return (
      <div className="gm-result">
        <h2 className="gm-result__title">Review Mistakes</h2>
        <ul className="gm-mistakes">
          {mistakes.map((m, i) => (
            <li key={i} className="gm-mistakes__item">
              <div className="gm-mistakes__prompt" lang="ja">
                {m.prompt}
                {m.promptReading ? (
                  <span className="gm-mistakes__reading"> ({m.promptReading})</span>
                ) : null}
              </div>
              <div className="gm-mistakes__answers">
                <span className="gm-mistakes__wrong">Your answer: {m.selectedAnswer}</span>
                <span className="gm-mistakes__right">Correct: {m.correctAnswer}</span>
              </div>
              {m.explanation ? (
                <p className="gm-mistakes__explain">{m.explanation}</p>
              ) : null}
            </li>
          ))}
        </ul>
        <div className="gm-result__actions">
          <button type="button" className="gm-btn gm-btn--primary" onClick={onPlayAgain}>
            Play Again
          </button>
          <button type="button" className="gm-btn gm-btn--ghost" onClick={onBack}>
            Back to Game Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gm-result">
      <h2 className="gm-result__title">{title}</h2>
      {headline ? <p className="gm-result__headline">{headline}</p> : null}
      {isPersonalBest ? (
        <p className="gm-result__pb">🎉 Personal best!</p>
      ) : null}
      <dl className="gm-result__stats">
        {stats.map((stat) => (
          <div key={stat.label} className="gm-result__stat">
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
      {extra}
      <div className="gm-result__actions">
        <button type="button" className="gm-btn gm-btn--primary" onClick={onPlayAgain}>
          Play Again
        </button>
        {mistakes.length > 0 && onReviewMistakes ? (
          <button
            type="button"
            className="gm-btn gm-btn--secondary"
            onClick={onReviewMistakes}
          >
            Review Mistakes
          </button>
        ) : null}
        <button type="button" className="gm-btn gm-btn--ghost" onClick={onBack}>
          Back to Game Mode
        </button>
      </div>
    </div>
  );
}
