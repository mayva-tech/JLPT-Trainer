import type { VocabularyItem } from "../types/vocabulary";
import { HighlightedEnglish } from "./HighlightedEnglish";
import { HighlightedJapanese } from "./HighlightedJapanese";
import type { SpeechHighlight } from "../services/speechService";

type Props = {
  title: string;
  item: VocabularyItem | null;
  index: number;
  total: number;
  revealed: boolean;
  jaHighlight: SpeechHighlight | null;
  enHighlight: SpeechHighlight | null;
  showFurigana: boolean;
};

/**
 * Simple meaning → word quiz card for video capture.
 * Prompt shows English; answer reveals Japanese + reading.
 */
export function QuizCard({
  title,
  item,
  index,
  total,
  revealed,
  jaHighlight,
  enHighlight,
  showFurigana,
}: Props) {
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

  return (
    <div className="safe-area">
      <div className="hook-display card-fade">
        <div className="category-chip">{title}</div>
        <div className="quiz-progress">
          {index + 1} / {total}
        </div>
        <HighlightedEnglish
          text={item.meaning}
          className="hook-line hook-line--en"
          highlight={enHighlight}
        />
        {revealed ? (
          <>
            <HighlightedJapanese
              text={item.word}
              className="hook-line hook-line--ja"
              highlight={jaHighlight}
            />
            {showFurigana ? (
              <div className="word-reading">{item.reading}</div>
            ) : null}
          </>
        ) : (
          <div className="quiz-prompt">What is the Japanese word?</div>
        )}
      </div>
    </div>
  );
}
