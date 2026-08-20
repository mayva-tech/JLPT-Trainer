import { useCallback, useMemo, useState } from "react";
import type { PhoneScenario } from "../../../types/phoneCall";
import {
  buildRolePlay,
  scoreRolePlay,
  type RolePlayStep,
} from "../../../utils/phoneRolePlay";

interface PhoneRolePlayProps {
  scenario: PhoneScenario;
  onSpeak: (text: string) => void;
  onFinish: () => void;
}

export function PhoneRolePlay({
  scenario,
  onSpeak,
  onFinish,
}: PhoneRolePlayProps) {
  const steps = useMemo(() => buildRolePlay({ scenario }), [scenario]);
  const [currentStep, setCurrentStep] = useState(0);
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  const step: RolePlayStep | undefined = steps[currentStep];

  const handlePick = useCallback(
    (optionId: string) => {
      if (!step || revealed) return;
      setPicks((prev) => ({ ...prev, [step.lineIndex]: optionId }));
      setRevealed(true);
    },
    [step, revealed]
  );

  const advance = useCallback(() => {
    setRevealed(false);
    if (currentStep + 1 >= steps.length) {
      setFinished(true);
      onFinish();
    } else {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, steps.length, onFinish]);

  const restart = useCallback(() => {
    setCurrentStep(0);
    setPicks({});
    setRevealed(false);
    setFinished(false);
  }, []);

  if (finished) {
    const result = scoreRolePlay(steps, picks);
    return (
      <div className="pt-result">
        <p className="pt-result-score">
          {result.correct} / {result.turns}
        </p>
        <p className="pt-result-pct">{result.percentage}%</p>
        <p className="pt-result-note">
          {result.percentage === 100
            ? "Perfect! Every turn was spot-on."
            : result.percentage >= 70
              ? "Good work — review the ones you missed."
              : "Keep practising — you'll get there!"}
        </p>
        <div className="pt-controls">
          <button
            type="button"
            className="pt-btn pt-btn--primary"
            onClick={restart}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!step) return null;

  const chosenId = picks[step.lineIndex];

  if (!step.isLearnerTurn) {
    return (
      <div>
        <ol className="pt-dialogue pt-dialogue--history" start={1}>
          {steps.slice(0, currentStep).map((prev, i) => (
            <li
              key={i}
              className="pt-line"
              data-side={
                prev.line.speaker === scenario.learner ? "learner" : "other"
              }
            >
              <span className="pt-speaker" lang="ja">
                {prev.line.speaker === "A" ? scenario.roleA : scenario.roleB}
              </span>
              <p className="pt-line-jp" lang="ja">
                {prev.line.japanese}
              </p>
            </li>
          ))}
        </ol>

        <div className="pt-turn pt-turn--other">
          <p className="pt-turn-label" lang="ja">
            {step.line.speaker === "A" ? scenario.roleA : scenario.roleB}
          </p>
          <p className="pt-line-jp" lang="ja">
            <span>{step.line.japanese}</span>
            <button
              type="button"
              className="pt-speak"
              aria-label="Speak line"
              onClick={() => onSpeak(step.line.japanese)}
            >
              🔊
            </button>
          </p>
          <p className="pt-line-reading" lang="ja">
            {step.line.reading}
          </p>
          <p className="pt-line-en">{step.line.english}</p>
        </div>

        <div className="pt-controls">
          <button
            type="button"
            className="pt-btn pt-btn--primary"
            onClick={advance}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ol className="pt-dialogue pt-dialogue--history" start={1}>
        {steps.slice(0, currentStep).map((prev, i) => (
          <li
            key={i}
            className="pt-line"
            data-side={
              prev.line.speaker === scenario.learner ? "learner" : "other"
            }
          >
            <span className="pt-speaker" lang="ja">
              {prev.line.speaker === "A" ? scenario.roleA : scenario.roleB}
            </span>
            <p className="pt-line-jp" lang="ja">
              {prev.line.japanese}
            </p>
          </li>
        ))}
      </ol>

      <div className="pt-turn">
        <p className="pt-turn-label">Your turn!</p>
        <p className="pt-roleplay-intro">
          Choose the line that fits this moment in the call:
        </p>
        <ul className="pt-options">
          {step.options?.map((opt) => {
            let state: string | undefined;
            if (revealed) {
              if (opt.correct) state = "correct";
              else if (opt.id === chosenId) state = "wrong";
            }
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  className="pt-option"
                  data-state={state}
                  disabled={revealed}
                  onClick={() => handlePick(opt.id)}
                >
                  <span className="pt-option-jp" lang="ja">
                    {opt.japanese}
                  </span>
                  {revealed && (
                    <>
                      <span className="pt-option-reading" lang="ja">
                        {opt.reading}
                      </span>
                      <span className="pt-option-en">{opt.english}</span>
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {revealed && (
          <div className="pt-feedback">
            {chosenId &&
            step.options?.find((o) => o.id === chosenId)?.correct ? (
              <p className="pt-verdict pt-verdict--ok">Correct!</p>
            ) : (
              <>
                <p className="pt-verdict pt-verdict--no">Not quite.</p>
                <p className="pt-explanation" lang="ja">
                  {step.line.japanese}
                </p>
                <p className="pt-explanation-en">{step.line.english}</p>
              </>
            )}
            <div className="pt-controls">
              <button
                type="button"
                className="pt-btn pt-btn--primary"
                onClick={advance}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
