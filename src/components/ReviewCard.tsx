import type { VocabularyItem } from "../types/vocabulary";
import type { SpeechHighlight } from "../services/speechService";
import { HighlightedJapanese } from "./HighlightedJapanese";
import { HighlightedEnglish } from "./HighlightedEnglish";

type Props = {
  item: VocabularyItem;
  jaHighlight?: SpeechHighlight | null;
  enHighlight?: SpeechHighlight | null;
  showFurigana?: boolean;
};

export function ReviewCard({
  item,
  jaHighlight = null,
  enHighlight = null,
  showFurigana = true,
}: Props) {
  return (
    <div className="safe-area card-fade">
      <HighlightedJapanese
        text={item.word}
        className="review-word"
        highlight={jaHighlight}
      />
      {showFurigana && (
        <div className="review-reading" aria-hidden="true">
          {item.reading}
        </div>
      )}
      <div aria-hidden="true">
        <HighlightedEnglish
          text={item.meaning}
          className="review-meaning"
          highlight={enHighlight}
        />
      </div>
    </div>
  );
}
