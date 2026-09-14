import { ComboDisplay } from "./ComboDisplay";
import { CountdownTimer } from "./CountdownTimer";
import { LivesDisplay } from "./LivesDisplay";
import { ScoreDisplay } from "./ScoreDisplay";

type Props = {
  title: string;
  score: number;
  combo: number;
  questionNumber: number;
  round?: number;
  difficulty?: string;
  lives?: number;
  maxLives?: number;
  secondsLeft?: number;
  onQuit: () => void;
};

export function GameHeader({
  title,
  score,
  combo,
  questionNumber,
  round,
  difficulty,
  lives,
  maxLives,
  secondsLeft,
  onQuit,
}: Props) {
  return (
    <header className="gm-play-header">
      <div className="gm-play-header-row">
        <button type="button" className="gm-btn gm-btn--ghost" onClick={onQuit}>
          Quit
        </button>
        <h2 className="gm-play-title">{title}</h2>
        {secondsLeft != null ? <CountdownTimer seconds={secondsLeft} /> : <ScoreDisplay score={score} />}
      </div>
      <div className="gm-play-stats">
        {secondsLeft != null ? <ScoreDisplay score={score} /> : null}
        {lives != null ? <LivesDisplay lives={lives} max={maxLives} /> : null}
        <ComboDisplay combo={combo} pop={combo > 1 && combo % 5 === 0} />
        <div className="gm-qmeta">
          Q{questionNumber}
          {round != null ? ` · Round ${round}` : ""}
        </div>
        {difficulty ? <div className="gm-diff">{difficulty}</div> : null}
      </div>
    </header>
  );
}
