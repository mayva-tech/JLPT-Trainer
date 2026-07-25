import type { SpeechHighlight } from "../services/speechService";
import type { QuizPhase } from "../services/quizAutoRunner";
import type { VocabularyQuizQuestion } from "../types/vocabularyQuiz";
import { QuizHookScreen } from "./QuizHookScreen";
import { QuizQuestionCard } from "./QuizQuestionCard";
import { QuizResultScreen } from "./QuizResultScreen";

type Props = {
  title: string;
  question: VocabularyQuizQuestion | null;
  index: number;
  total: number;
  selectedChoiceIndex: number | null;
  phase: QuizPhase;
  showReading: boolean;
  readingMode?: "line" | "ruby";
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

/**
 * Quiz screen orchestrator — routes phase to hook / question / result cards.
 * Choices live on `question` (single owner).
 */
export function QuizCard({
  title,
  question,
  index,
  total,
  selectedChoiceIndex,
  phase,
  showReading,
  readingMode = "line",
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
    return (
      <QuizHookScreen
        phase={phase}
        japanese={phase === "pre" ? preJapanese : afterJapanese}
        english={phase === "pre" ? preEnglish : afterEnglish}
        jaHighlight={jaHighlight}
        enHighlight={enHighlight}
        commentActiveLang={commentActiveLang}
      />
    );
  }

  if (!question) {
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
      <QuizResultScreen title={title} score={score} total={total} />
    );
  }

  return (
    <QuizQuestionCard
      title={title}
      question={question}
      index={index}
      total={total}
      selectedChoiceIndex={selectedChoiceIndex}
      phase={phase}
      showReading={showReading}
      readingMode={readingMode}
      jaHighlight={jaHighlight}
      enHighlight={enHighlight}
      onSelectChoice={onSelectChoice}
    />
  );
}
