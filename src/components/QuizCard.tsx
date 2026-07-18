import { HighlightedJapanese } from "./HighlightedJapanese";
import { HighlightedEnglish } from "./HighlightedEnglish";
import { FitScale } from "./FitScale";
import type { SpeechHighlight } from "../services/speechService";
import type { QuizPhase, QuizWord } from "../services/quizAutoRunner";

type Props = {
  title: string;
  item: QuizWord | null;
  index: number;
  total: number;
  choices: string[];
  correctChoiceIndex: number;
  selectedChoiceIndex: number | null;
  phase: QuizPhase;
  showReading: boolean;
  score: number;
  jaHighlight: SpeechHighlight | null;
  enHighlight: SpeechHighlight | null;
  onSelectChoice: (choiceIndex: number) => void;
  preJapanese?: string;
  preEnglish?: string;
  afterJapanese?: string;
  afterEnglish?: string;
  commentActiveLang?: "ja" | "en" | null;
};

function formatMeaning(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Multiple-choice English meaning quiz card (JP word left → EN choices right).
 */
export function QuizCard({
  title,
  item,
  index,
  total,
  choices,
  correctChoiceIndex,
  selectedChoiceIndex,
  phase,
  showReading,
  score,
  jaHighlight,
  enHighlight,
  onSelectChoice,
  preJapanese = "",
  preEnglish = "",
  afterJapanese = "",
  afterEnglish = "",
  commentActiveLang = null,
}: Props) {
  if (phase === "pre" || phase === "after") {
    const japanese = phase === "pre" ? preJapanese : afterJapanese;
    const english = phase === "pre" ? preEnglish : afterEnglish;
    const chip = phase === "pre" ? "Pre Quiz" : "After Quiz";
    return (
      <div className="safe-area safe-area--hook">
        <div className="hook-display card-fade">
          <div className="category-chip">{chip}</div>
          <HighlightedJapanese
            text={japanese}
            className={
              commentActiveLang === "ja"
                ? "hook-line hook-line--ja hook-line--active"
                : "hook-line hook-line--ja"
            }
            highlight={commentActiveLang === "ja" ? jaHighlight : null}
          />
          <HighlightedEnglish
            text={english}
            className={
              commentActiveLang === "en"
                ? "hook-line hook-line--en hook-line--active"
                : "hook-line hook-line--en"
            }
            highlight={commentActiveLang === "en" ? enHighlight : null}
          />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="safe-area">
        <div className="hook-display card-fade">
          <div className="category-chip">Quiz</div>
          <div className="placeholder-title">{title}</div>
          <div className="placeholder-subtitle">
            Quiz content coming soon.
          </div>
        </div>
      </div>
    );
  }

  if (phase === "finished") {
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

  const revealed = phase === "revealed";

  return (
    <div className="safe-area safe-area--quiz">
      <div className="quiz-layout card-fade">
        <div className="quiz-header">
          <div className="category-chip">{title}</div>
          <div className="quiz-progress">
            {index + 1} / {total}
          </div>
        </div>

        <div className="quiz-split">
          <div className="quiz-word-panel">
            <FitScale maxLines={2} watch={item.word}>
              <HighlightedJapanese
                text={item.word}
                className="quiz-word-ja"
                highlight={phase === "example" ? null : jaHighlight}
              />
            </FitScale>
            {showReading ? (
              <div className="quiz-word-reading" aria-hidden="true">
                {item.reading}
              </div>
            ) : null}
          </div>

          <div className="quiz-choices-panel">
            {phase === "example" && item.sentence ? (
              <div className="quiz-example-panel">
                <div className="quiz-prompt">Example</div>
                <HighlightedJapanese
                  text={item.sentence}
                  className="quiz-example-ja"
                  highlight={jaHighlight}
                />
                {item.sentenceMeaning ? (
                  <HighlightedEnglish
                    text={item.sentenceMeaning}
                    className="quiz-example-meaning"
                    highlight={enHighlight}
                  />
                ) : null}
              </div>
            ) : (
              <>
                <div className="quiz-prompt">
                  What is the English meaning?
                </div>
                <div className="quiz-choices" role="list">
                  {choices.map((choice, i) => {
                    const isCorrect = i === correctChoiceIndex;
                    const isSelected = selectedChoiceIndex === i;
                    let className = "quiz-choice";

                    if (revealed) {
                      if (isCorrect) {
                        className += " quiz-choice--correct";
                      } else if (isSelected) {
                        className += " quiz-choice--wrong";
                      } else {
                        className += " quiz-choice--dimmed";
                      }
                    }

                    return (
                      <button
                        key={`${index}-${i}-${choice}`}
                        type="button"
                        className={className}
                        disabled={revealed}
                        onClick={() => onSelectChoice(i)}
                      >
                        <div className="quiz-choice-text">
                          {revealed && isCorrect ? "✓ " : ""}
                          {`${i + 1}. `}
                          {revealed && isCorrect ? (
                            <HighlightedEnglish
                              text={formatMeaning(choice)}
                              className="quiz-choice-meaning"
                              highlight={enHighlight}
                            />
                          ) : (
                            formatMeaning(choice)
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
