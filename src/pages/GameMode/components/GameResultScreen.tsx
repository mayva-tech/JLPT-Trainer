import type { FinishedGame, GameMistake } from "../../../utils/gameMode/types";
import { accuracyPercent } from "../../../utils/gameMode/scoring";

type Props = {
  result: FinishedGame;
  previousBest: number;
  personalBest: boolean;
  leveledUp: boolean;
  newLevel: number;
  onPlayAgain: () => void;
  onReview: () => void;
  onHub: () => void;
};

export function GameResultScreen({
  result,
  previousBest,
  personalBest,
  leveledUp,
  newLevel,
  onPlayAgain,
  onReview,
  onHub,
}: Props) {
  const accuracy = accuracyPercent(result.correct, result.attempted);
  const headline = resultHeadline(result);

  return (
    <div className="gm-result">
      <p className="gm-result-kicker">{modeLabel(result.mode)}</p>
      <h2 className="gm-result-title">{headline}</h2>
      {personalBest ? <p className="gm-result-pb">Personal best!</p> : null}
      {leveledUp ? <p className="gm-result-level">Level up — now Lv. {newLevel}</p> : null}

      <dl className="gm-result-grid">
        <div>
          <dt>Score</dt>
          <dd>{result.score}</dd>
        </div>
        <div>
          <dt>Accuracy</dt>
          <dd>{result.attempted === 0 ? "—" : `${accuracy}%`}</dd>
        </div>
        <div>
          <dt>Correct</dt>
          <dd>{result.correct}</dd>
        </div>
        <div>
          <dt>Wrong</dt>
          <dd>{result.wrong}</dd>
        </div>
        {result.mode === "survival" ? (
          <div>
            <dt>Survived</dt>
            <dd>{result.survived ?? result.attempted}</dd>
          </div>
        ) : null}
        {result.mode === "speed" ? (
          <div>
            <dt>Attempted</dt>
            <dd>{result.attempted}</dd>
          </div>
        ) : null}
        <div>
          <dt>Best combo</dt>
          <dd>×{result.bestCombo}</dd>
        </div>
        <div>
          <dt>Previous best</dt>
          <dd>{previousBest}</dd>
        </div>
        <div>
          <dt>XP earned</dt>
          <dd>+{result.xpGained}</dd>
        </div>
        {result.mode === "boss" && result.bossVictory === false ? (
          <div>
            <dt>Boss HP left</dt>
            <dd>{result.bossHpLeft ?? 0}</dd>
          </div>
        ) : null}
        {result.mode === "revenge" ? (
          <>
            <div>
              <dt>Attempted</dt>
              <dd>{result.revengeAttempted ?? 0}</dd>
            </div>
            <div>
              <dt>Defeated</dt>
              <dd>{result.revengeDefeated ?? 0}</dd>
            </div>
          </>
        ) : null}
      </dl>

      {result.weakDiscovered && result.weakDiscovered.length > 0 ? (
        <p className="gm-result-note">
          Weak words discovered: {result.weakDiscovered.join(" · ")}
        </p>
      ) : null}
      {result.revengeImproved && result.revengeImproved.length > 0 ? (
        <p className="gm-result-note">
          Words improved: {result.revengeImproved.join(" · ")}
        </p>
      ) : null}
      {result.revengeStillWeak && result.revengeStillWeak.length > 0 ? (
        <p className="gm-result-note">
          Still needing review: {result.revengeStillWeak.join(" · ")}
        </p>
      ) : null}

      <div className="gm-result-actions">
        <button type="button" className="gm-btn gm-btn--play" onClick={onPlayAgain}>
          {againLabel(result)}
        </button>
        <button
          type="button"
          className="gm-btn gm-btn--ghost"
          onClick={onReview}
          disabled={result.mistakes.length === 0}
        >
          Review Mistakes
        </button>
        <button type="button" className="gm-btn gm-btn--ghost" onClick={onHub}>
          Game Mode
        </button>
      </div>
    </div>
  );
}

export function MistakeReview({
  mistakes,
  onBack,
}: {
  mistakes: GameMistake[];
  onBack: () => void;
}) {
  return (
    <div className="gm-result">
      <h2 className="gm-result-title">Review mistakes</h2>
      {mistakes.length === 0 ? (
        <p className="gm-result-note">No mistakes this round.</p>
      ) : (
        <ul className="gm-review-list">
          {mistakes.map((mistake, index) => (
            <li key={`${mistake.prompt}-${index}`}>
              <p className="gm-review-q" lang="ja">
                {mistake.prompt}
                {mistake.reading ? <span> · {mistake.reading}</span> : null}
              </p>
              <p>Your answer: {mistake.selectedAnswer}</p>
              <p>Correct: {mistake.correctAnswer}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="gm-result-actions">
        <button type="button" className="gm-btn gm-btn--play" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

function modeLabel(mode: FinishedGame["mode"]): string {
  switch (mode) {
    case "survival":
      return "Survival Mode";
    case "speed":
      return "Speed Run";
    case "revenge":
      return "Weak Word Revenge";
    case "boss":
      return "Boss Battle";
  }
}

function resultHeadline(result: FinishedGame): string {
  if (result.mode === "boss") {
    return result.bossVictory ? "🏆 Boss Defeated" : "Defeat";
  }
  if (result.mode === "survival") return "Game Over";
  if (result.mode === "speed") return "Time's up";
  return "Revenge complete";
}

function againLabel(result: FinishedGame): string {
  if (result.mode === "boss") {
    return result.bossVictory ? "Fight Again" : "Try Again";
  }
  return "Play Again";
}
