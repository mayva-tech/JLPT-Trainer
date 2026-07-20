import { HighlightedJapanese } from "./HighlightedJapanese";
import { HighlightedEnglish } from "./HighlightedEnglish";
import { FuriganaWrapText } from "./FuriganaWrapText";
import { FitScale } from "./FitScale";
import { VocabularyRangeLabel } from "./VocabularyRangeLabel";
import type { SpeechHighlight } from "../services/speechService";
import type { QuizPhase, QuizWord } from "../services/quizAutoRunner";

type Props = {
  title: string;
  lessonId?: string | null;
  item: QuizWord | null;
  index: number;
  total: number;
  choices: string[];
  correctChoiceIndex: number;
  selectedChoiceIndex: number | null;
  phase: QuizPhase;
  showReading: boolean;
  readingMode?: "line" | "ruby";
  score: number;
  jaHighlight: SpeechHighlight | null;
  enHighlight: SpeechHighlight | null;
  onSelectChoice: (choiceIndex: number) => void;
  onReplayAudio?: () => void;
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

function promptLabel(item: QuizWord, revealed: boolean): string {
  switch (item.questionType) {
    case "english-to-japanese":
      return revealed ? "Japanese word" : "Which Japanese word matches this meaning?";
    case "audio-to-english":
      return revealed ? "English meaning" : "What is the English meaning?";
    case "phrase-context":
      return revealed ? "Example phrase" : "Which word fits the phrase?";
    case "sentence-context":
      return revealed ? "Example sentence" : "Which word fits the sentence?";
    case "japanese-to-english":
    default:
      return revealed ? "English meaning" : "What is the English meaning?";
  }
}

function displayPrompt(item: QuizWord, revealed: boolean): string {
  if (
    revealed &&
    (item.questionType === "phrase-context" ||
      item.questionType === "sentence-context") &&
    item.contextSource
  ) {
    return item.contextSource;
  }
  if (item.questionType === "english-to-japanese") {
    return item.promptEnglish ?? item.meaning;
  }
  if (item.questionType === "audio-to-english" && !revealed) {
    return "Listen to the word";
  }
  return item.promptText ?? item.word;
}

function shouldShowJapaneseWord(item: QuizWord, revealed: boolean): boolean {
  if (item.questionType === "audio-to-english" && !revealed) return false;
  if (item.questionType === "english-to-japanese") return revealed;
  if (
    item.questionType === "phrase-context" ||
    item.questionType === "sentence-context"
  ) {
    return true;
  }
  return true;
}

function shouldShowReading(item: QuizWord, revealed: boolean, showReading: boolean): boolean {
  if (!showReading) return false;
  if (item.questionType === "audio-to-english" && !revealed) return false;
  if (item.questionType === "english-to-japanese" && !revealed) return false;
  if (
    (item.questionType === "phrase-context" ||
      item.questionType === "sentence-context") &&
    !revealed
  ) {
    return false;
  }
  return true;
}

/**
 * Multiple-choice vocabulary / grammar quiz card.
 */
export function QuizCard({
  title,
  lessonId,
  item,
  index,
  total,
  choices,
  correctChoiceIndex,
  selectedChoiceIndex,
  phase,
  showReading,
  readingMode = "line",
  score,
  jaHighlight,
  enHighlight,
  onSelectChoice,
  onReplayAudio,
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
          <div className="placeholder-subtitle">Quiz content coming soon.</div>
        </div>
      </div>
    );
  }

  if (phase === "finished") {
    return (
      <div className="safe-area">
        <div className="hook-display card-fade">
          <div className="category-chip">{title}</div>
          {lessonId ? <VocabularyRangeLabel lessonId={lessonId} kind="quiz" /> : null}
          <div className="placeholder-title">Quiz complete</div>
          <div className="quiz-score">
            Score: {score} / {total}
          </div>
        </div>
      </div>
    );
  }

  const revealed = phase === "revealed" || phase === "review";
  const showExampleWithAnswer = phase === "review";
  const prompt = displayPrompt(item, revealed);
  const showWordPanel = shouldShowJapaneseWord(item, revealed);
  const showReadingLine = shouldShowReading(item, revealed, showReading);
  const isJapanesePrompt =
    item.questionType === "phrase-context" ||
    item.questionType === "sentence-context" ||
    (item.questionType !== "english-to-japanese" &&
      item.questionType !== "audio-to-english");

  return (
    <div className="safe-area safe-area--quiz">
      <div className="quiz-layout card-fade">
        <div className="quiz-header">
          <div>
            <div className="category-chip">{title}</div>
            {lessonId ? (
              <VocabularyRangeLabel lessonId={lessonId} kind="quiz" />
            ) : null}
          </div>
          <div className="quiz-progress">
            {index + 1} / {total}
          </div>
        </div>

        <div className="quiz-split">
          <div className="quiz-word-panel">
            {showWordPanel ? (
              readingMode === "ruby" && item.questionType !== "phrase-context" && item.questionType !== "sentence-context" ? (
                <FitScale
                  maxLines={2}
                  watch={`${prompt}|${item.reading}|${showReadingLine}`}
                >
                  <FuriganaWrapText
                    surface={prompt}
                    reading={item.reading}
                    className="quiz-word-ja"
                    highlight={phase === "example" ? null : jaHighlight}
                    showFurigana={showReadingLine}
                  />
                </FitScale>
              ) : (
                <>
                  <FitScale maxLines={3} watch={prompt}>
                    {isJapanesePrompt || item.questionType === "japanese-to-english" ? (
                      <HighlightedJapanese
                        text={prompt}
                        className="quiz-word-ja"
                        highlight={phase === "example" ? null : jaHighlight}
                      />
                    ) : (
                      <HighlightedEnglish
                        text={prompt}
                        className="quiz-word-en-prompt"
                        highlight={enHighlight}
                      />
                    )}
                  </FitScale>
                  {showReadingLine && item.questionType === "japanese-to-english" ? (
                    <div className="quiz-word-reading" aria-hidden="true">
                      {item.reading}
                    </div>
                  ) : null}
                </>
              )
            ) : (
              <div className="quiz-audio-prompt">
                <div className="quiz-prompt">Listen to the word</div>
                {onReplayAudio ? (
                  <button
                    type="button"
                    className="quiz-replay-btn"
                    onClick={onReplayAudio}
                  >
                    Replay audio
                  </button>
                ) : null}
              </div>
            )}
            {revealed && item.questionType !== "english-to-japanese" ? (
              <>
                <div className="quiz-word-reading" aria-hidden="true">
                  {item.reading}
                </div>
                <HighlightedEnglish
                  text={item.meaning}
                  className="quiz-reveal-meaning"
                  highlight={enHighlight}
                />
              </>
            ) : null}
            {revealed && item.questionType === "english-to-japanese" ? (
              <>
                <HighlightedJapanese
                  text={item.word}
                  className="quiz-word-ja"
                  highlight={jaHighlight}
                />
                <div className="quiz-word-reading" aria-hidden="true">
                  {item.reading}
                </div>
              </>
            ) : null}
          </div>

          <div className="quiz-choices-panel">
            {phase === "example" && (item.contextSource || item.sentence) ? (
              <div className="quiz-example-panel">
                <div className="quiz-prompt">Example</div>
                <HighlightedJapanese
                  text={item.contextSource ?? item.sentence ?? ""}
                  className="quiz-example-ja"
                  highlight={jaHighlight}
                />
                {(item.phraseMeaning || item.sentenceMeaning) ? (
                  <HighlightedEnglish
                    text={item.phraseMeaning ?? item.sentenceMeaning ?? ""}
                    className="quiz-example-meaning"
                    highlight={enHighlight}
                  />
                ) : null}
              </div>
            ) : (
              <>
                <div className="quiz-prompt">{promptLabel(item, revealed)}</div>
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

                    const choiceIsJapanese = item.choiceKind === "japanese";

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
                          {revealed && isCorrect && !choiceIsJapanese ? (
                            <HighlightedEnglish
                              text={formatMeaning(choice)}
                              className="quiz-choice-meaning"
                              highlight={enHighlight}
                            />
                          ) : choiceIsJapanese ? (
                            <span lang="ja">{choice}</span>
                          ) : (
                            formatMeaning(choice)
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {showExampleWithAnswer && (item.sentence || item.contextSource) ? (
                  <div className="quiz-example-panel quiz-example-panel--review">
                    <div className="quiz-prompt">Example</div>
                    <HighlightedJapanese
                      text={item.contextSource ?? item.sentence ?? ""}
                      className="quiz-example-ja"
                      highlight={null}
                    />
                    {(item.phraseMeaning || item.sentenceMeaning) ? (
                      <HighlightedEnglish
                        text={item.phraseMeaning ?? item.sentenceMeaning ?? ""}
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
