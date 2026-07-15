import type { GrammarItem } from "../types/grammar";
import type { SpeechHighlight } from "../services/speechService";
import { HighlightedJapanese } from "./HighlightedJapanese";
import { HighlightedEnglish } from "./HighlightedEnglish";

type Props = {
  item: GrammarItem;
  showFurigana?: boolean;
  jaHighlight?: SpeechHighlight | null;
  enHighlight?: SpeechHighlight | null;
};

/** ② Grammar pattern + reading + meaning. */
export function GrammarPatternCard({
  item,
  showFurigana = true,
  jaHighlight = null,
  enHighlight = null,
}: Props) {
  return (
    <div className="safe-area card-fade">
      <HighlightedJapanese
        text={item.pattern}
        className="grammar-pattern"
        highlight={jaHighlight}
      />
      {showFurigana && (
        <div className="grammar-reading" aria-hidden="true">
          {item.patternReading}
        </div>
      )}
      <div aria-hidden="true">
        <HighlightedEnglish
          text={item.meaning}
          className="grammar-meaning"
          highlight={enHighlight}
        />
      </div>
    </div>
  );
}
