import type { GameQuestion } from "../../utils/gameMode";

type Feedback = "correct" | "wrong" | null;

type Props = {
  question: GameQuestion;
  questionNumber: number;
  selectedIndex: number | null;
  feedback: Feedback;
  disabled?: boolean;
  onSelect: (index: number) => void;
  /** Compact mode for Speed Run (less explanation space). */
  compact?: boolean;
};

export function GameQuestionCard({
  question,
  questionNumber,
  selectedIndex,
  feedback,
  disabled,
  onSelect,
  compact,
}: Props) {
  return (
    <div
      className={
        feedback === "wrong"
          ? "gm-question gm-question--shake"
          : feedback === "correct"
            ? "gm-question gm-question--pulse"
            : "gm-question"
      }
    >
      <div className="gm-question__meta">
        <span className="gm-question__num">Q{questionNumber}</span>
        <span className="gm-question__cat">{categoryLabel(question.category)}</span>
      </div>

      {question.promptEn ? (
        <p className="gm-question__hint">{question.promptEn}</p>
      ) : null}

      <div className="gm-question__prompt" lang="ja">
        {question.prompt}
      </div>
      {question.promptReading ? (
        <div className="gm-question__reading" lang="ja">
          {question.promptReading}
        </div>
      ) : null}

      <div className="gm-question__choices" role="group" aria-label="Answer choices">
        {question.choices.map((choice, index) => {
          let cls = "gm-choice";
          if (selectedIndex !== null) {
            if (index === question.correctIndex) cls += " gm-choice--correct";
            else if (index === selectedIndex) cls += " gm-choice--wrong";
            else cls += " gm-choice--dim";
          }
          return (
            <button
              key={`${question.id}-${index}`}
              type="button"
              className={cls}
              disabled={disabled || selectedIndex !== null}
              onClick={() => onSelect(index)}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {!compact && feedback === "wrong" ? (
        <p className="gm-question__feedback gm-question__feedback--wrong">
          Correct: {question.choices[question.correctIndex]}
          {question.explanation ? ` — ${question.explanation}` : ""}
        </p>
      ) : null}
      {!compact && feedback === "correct" ? (
        <p className="gm-question__feedback gm-question__feedback--correct">
          Nice! 🔥
        </p>
      ) : null}
    </div>
  );
}

function categoryLabel(category: GameQuestion["category"]): string {
  switch (category) {
    case "n2":
      return "N2 Vocab";
    case "weak":
      return "Weak Word";
    case "synonym-antonym":
      return "類義・反対";
    case "expression":
      return "Expression";
    case "prerequisite":
      return "Warm-up";
    default:
      return "Mixed";
  }
}
