import type { VocabularyItem } from "../types/vocabulary";
import type { SpeechHighlight } from "../services/speechService";
import { HighlightedJapanese } from "./HighlightedJapanese";
import { HighlightedEnglish } from "./HighlightedEnglish";
import { JlptLevelBadge } from "./JlptLevelBadge";

type Props = {
  item: VocabularyItem;
  jaHighlight?: SpeechHighlight | null;
  enHighlight?: SpeechHighlight | null;
  showFurigana?: boolean;
};

export function WordCard({
  item,
  jaHighlight = null,
  enHighlight = null,
  showFurigana = true,
}: Props) {
  return (
    <div className="safe-area card-fade">
      <div className="word-headline">
        <HighlightedJapanese
          text={item.word}
          className="word-main"
          highlight={jaHighlight}
        />
        <JlptLevelBadge level={item.jlpt} />
      </div>
      {showFurigana && (
        <div className="word-reading" aria-hidden="true">
          {item.reading}
        </div>
      )}
      <div aria-hidden="true">
        <HighlightedEnglish
          text={item.meaning}
          className="word-meaning"
          highlight={enHighlight}
        />
      </div>
    </div>
  );
}
