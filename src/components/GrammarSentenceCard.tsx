import type { GrammarItem } from "../types/grammar";
import type { SpeechHighlight } from "../services/speechService";
import { FuriganaWrapText } from "./FuriganaWrapText";
import { HighlightedEnglish } from "./HighlightedEnglish";
import { FitScale } from "./FitScale";

type Props = {
  item: GrammarItem;
  showFurigana?: boolean;
  jaHighlight?: SpeechHighlight | null;
  enHighlight?: SpeechHighlight | null;
};

/** ④ Example sentence with furigana and English translation. */
export function GrammarSentenceCard({
  item,
  showFurigana = true,
  jaHighlight = null,
  enHighlight = null,
}: Props) {
  return (
    <div className="safe-area card-fade">
      <div lang="ja">
        <FitScale
          maxLines={2}
          watch={`${item.sentence}|${item.sentenceReading}|${showFurigana}`}
        >
          <FuriganaWrapText
            surface={item.sentence}
            reading={item.sentenceReading}
            className="sentence-main"
            highlight={jaHighlight}
            showFurigana={showFurigana}
          />
        </FitScale>
      </div>
      <div aria-hidden="true">
        <FitScale maxLines={1} watch={item.sentenceMeaning}>
          <HighlightedEnglish
            text={item.sentenceMeaning}
            className="sentence-meaning"
            highlight={enHighlight}
          />
        </FitScale>
      </div>
    </div>
  );
}
