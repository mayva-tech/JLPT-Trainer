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

export function PhraseCard({
  item,
  jaHighlight = null,
  enHighlight = null,
  showFurigana = true,
}: Props) {
  return (
    <div className="safe-area card-fade">
      <div lang="ja">
        <FuriganaWrapText
          surface={item.phrase}
          reading={item.phraseReading}
          className="phrase-main"
          highlight={jaHighlight}
          showFurigana={showFurigana}
        />
      </div>
      <div aria-hidden="true">
        <HighlightedEnglish
          text={item.phraseMeaning}
          className="phrase-meaning"
          highlight={enHighlight}
        />
      </div>
    </div>
  );
}
