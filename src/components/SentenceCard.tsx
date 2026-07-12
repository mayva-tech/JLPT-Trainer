import type { VocabularyItem } from "../types/vocabulary";
import type { SpeechHighlight } from "../services/speechService";
import { FuriganaWrapText } from "./FuriganaWrapText";
import { HighlightedEnglish } from "./HighlightedEnglish";

type Props = {
  item: VocabularyItem;
  jaHighlight?: SpeechHighlight | null;
  enHighlight?: SpeechHighlight | null;
  showFurigana?: boolean;
};

export function SentenceCard({
  item,
  jaHighlight = null,
  enHighlight = null,
  showFurigana = true,
}: Props) {
  return (
    <div className="safe-area card-fade">
      <div lang="ja">
        <FuriganaWrapText
          surface={item.sentence}
          reading={item.sentenceReading}
          className="sentence-main"
          highlight={jaHighlight}
          showFurigana={showFurigana}
        />
      </div>
      <div aria-hidden="true">
        <HighlightedEnglish
          text={item.sentenceMeaning}
          className="sentence-meaning"
          highlight={enHighlight}
        />
      </div>
    </div>
  );
}
