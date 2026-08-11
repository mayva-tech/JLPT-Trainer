import { HighlightedEnglish } from "./HighlightedEnglish";
import { FuriganaWrapText } from "./FuriganaWrapText";
import { FitScale } from "./FitScale";
import type { SpeechHighlight } from "../services/speechService";
import type { QuizPhase } from "../services/quizAutoRunner";
import type { VocabularyQuizQuestion } from "../types/vocabularyQuiz";
import {
  getQuizDisplayPrompt,
  getQuizExample,
  getQuizPromptLabel,
  shouldShowQuizReading,
} from "../utils/quizPresentation";

type Props = {
  title: string;
  question: VocabularyQuizQuestion;
  index: number;
  total: number;
  selectedChoiceIndex: number | null;
  phase: Exclude<QuizPhase, "pre" | "after" | "finished">;
  showReading: boolean;
  readingMode?: "line" | "ruby";
  jaHighlight: SpeechHighlight | null;
  enHighlight: SpeechHighlight | null;
  onSelectChoice: (choiceIndex: number) => void;
};

function formatMeaning(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Active multiple-choice Japanese→English question card. */
export function QuizQuestionCard({
  title,
  question,
  index,
  total,
  selectedChoiceIndex,
  phase,
  showReading,
  readingMode = "line",
  jaHighlight,
  enHighlight,
  onSelectChoice,
}: Props) {
  const revealed = phase === "revealed" || phase === "review";
  const showExampleWithAnswer = phase === "review";
  const prompt = getQuizDisplayPrompt(question, revealed);
  const showReadingLine = shouldShowQuizReading(
    question,
    revealed,
    showReading
  );
  const example = getQuizExample(question);
  const { choices, correctChoiceIndex } = question;

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
            <FitScale
              maxLines={readingMode === "ruby" ? 2 : 3}
              watch={`${prompt}|${question.item.reading}|${showReadingLine}`}
            >
              <FuriganaWrapText
                surface={prompt}
                reading={question.item.reading}
                className="quiz-word-ja"
                highlight={phase === "example" ? null : jaHighlight}
                showFurigana={showReadingLine}
              />
            </FitScale>
          </div>

          <div className="quiz-choices-panel">
            {phase === "example" && example ? (
              <div className="quiz-example-panel">
                <div className="quiz-prompt">Example</div>
                <FuriganaWrapText
                  surface={example.text}
                  reading={example.reading ?? ""}
                  className="quiz-example-ja"
                  highlight={jaHighlight}
                  showFurigana={Boolean(example.reading)}
                />
                {example.meaning ? (
                  <HighlightedEnglish
                    text={example.meaning}
                    className="quiz-example-meaning"
                    highlight={enHighlight}
                  />
                ) : null}
              </div>
            ) : (
              <>
                <div className="quiz-prompt">
                  {getQuizPromptLabel(question.type, revealed)}
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
                {showExampleWithAnswer && example ? (
                  <div className="quiz-example-panel quiz-example-panel--review">
                    <div className="quiz-prompt">Example</div>
                    <FuriganaWrapText
                      surface={example.text}
                      reading={example.reading ?? ""}
                      className="quiz-example-ja"
                      highlight={null}
                      showFurigana={Boolean(example.reading)}
                    />
                    {example.meaning ? (
                      <HighlightedEnglish
                        text={example.meaning}
                        className="quiz-example-meaning"
                        highlight={null}
                      />
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
